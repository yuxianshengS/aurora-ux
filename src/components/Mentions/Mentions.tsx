import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import './Mentions.css';

export interface MentionItem {
  /** 唯一标识 (会被回填的内容) */
  value: string;
  /** 显示标签 */
  label?: React.ReactNode;
  /** 头像 / 图标 */
  avatar?: React.ReactNode;
  /** 备注 */
  description?: React.ReactNode;
  /** 禁用 */
  disabled?: boolean;
}

export interface MentionsProps {
  /** 候选人列表 — 也可以异步: 父级在 onSearch 里 setItems */
  items?: MentionItem[];
  /** 触发字符, 默认 '@' */
  prefix?: string | string[];
  /** 受控 value */
  value?: string;
  /** 非受控 */
  defaultValue?: string;
  /** placeholder */
  placeholder?: string;
  /** 行数 (默认 3 行 textarea) */
  rows?: number;
  /** 输入变化 */
  onChange?: (value: string) => void;
  /** 触发 prefix 后的 query 改变 — 父级可异步搜索 setItems */
  onSearch?: (search: string, prefix: string) => void;
  /** 选中候选 */
  onSelect?: (item: MentionItem, prefix: string) => void;
  /** 自定义筛选 */
  filter?: (search: string, item: MentionItem) => boolean;
  /** 禁用 */
  disabled?: boolean;
  /** 候选弹层最大高 */
  popupMaxHeight?: number;
  className?: string;
  style?: React.CSSProperties;
  textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
}

const defaultFilter = (q: string, item: MentionItem) => {
  if (!q) return true;
  const i = q.toLowerCase();
  if (item.value.toLowerCase().includes(i)) return true;
  if (typeof item.label === 'string' && item.label.toLowerCase().includes(i)) return true;
  return false;
};

const Mentions: React.FC<MentionsProps> = ({
  items = [],
  prefix = '@',
  value: ctrlValue,
  defaultValue = '',
  placeholder,
  rows = 3,
  onChange,
  onSearch,
  onSelect,
  filter,
  disabled,
  popupMaxHeight = 220,
  className = '',
  style,
  textareaProps,
}) => {
  const isCtrl = ctrlValue !== undefined;
  const [innerValue, setInnerValue] = useState(defaultValue);
  const value = isCtrl ? ctrlValue! : innerValue;

  const taRef = useRef<HTMLTextAreaElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const [picker, setPicker] = useState<{
    open: boolean;
    prefix: string;
    search: string;
    /** 触发字符在 value 中的位置(prefix 字符所在 index) */
    triggerIndex: number;
    top: number;
    left: number;
  }>({ open: false, prefix: '', search: '', triggerIndex: -1, top: 0, left: 0 });

  const [active, setActive] = useState(0);

  const prefixes = Array.isArray(prefix) ? prefix : [prefix];
  const filtered = useMemo(() => {
    const f = filter ?? defaultFilter;
    return items.filter((i) => f(picker.search, i));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, picker.search, filter]);

  useEffect(() => {
    if (active >= filtered.length) setActive(0);
  }, [filtered.length, active]);

  // 在 textarea 当前光标位置上方算出弹层坐标
  const getCaretCoord = (ta: HTMLTextAreaElement, caret: number) => {
    // 用 dummy mirror div 测量光标位置
    const r = ta.getBoundingClientRect();
    const styles = window.getComputedStyle(ta);
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';
    div.style.boxSizing = styles.boxSizing;
    div.style.width = `${ta.clientWidth}px`;
    div.style.font = styles.font;
    div.style.padding = styles.padding;
    div.style.border = styles.border;
    div.style.lineHeight = styles.lineHeight;
    div.style.letterSpacing = styles.letterSpacing;
    document.body.appendChild(div);
    const text = ta.value.substring(0, caret);
    div.textContent = text;
    const span = document.createElement('span');
    span.textContent = '​';
    div.appendChild(span);
    const sx = span.offsetLeft;
    const sy = span.offsetTop;
    document.body.removeChild(div);
    return {
      x: r.left + sx - ta.scrollLeft,
      y: r.top + sy - ta.scrollTop + parseFloat(styles.lineHeight || '20'),
    };
  };

  const updatePicker = (text: string, caret: number) => {
    // 从 caret 往前找最近的 prefix, 看跟它之间有没有空格 — 没空格才算"还在打 mention"
    for (let i = caret - 1; i >= 0; i--) {
      const ch = text[i];
      if (ch === ' ' || ch === '\n') break;
      if (prefixes.includes(ch)) {
        const search = text.slice(i + 1, caret);
        const ta = taRef.current!;
        const c = getCaretCoord(ta, i);
        setPicker({
          open: true,
          prefix: ch,
          search,
          triggerIndex: i,
          top: c.y + 4,
          left: c.x,
        });
        onSearch?.(search, ch);
        return;
      }
    }
    if (picker.open) setPicker((p) => ({ ...p, open: false }));
  };

  // 重定位监听 (resize / scroll)
  useLayoutEffect(() => {
    if (!picker.open) return;
    const ta = taRef.current;
    if (!ta) return;
    const update = () => {
      const c = getCaretCoord(ta, ta.selectionStart);
      setPicker((p) => ({ ...p, top: c.y + 4, left: c.x }));
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [picker.open]);

  // 外部点击关闭
  useOutsideClick(
    [taRef, popupRef],
    () => setPicker((p) => ({ ...p, open: false })),
    picker.open,
  );

  const setValue = (v: string) => {
    if (!isCtrl) setInnerValue(v);
    onChange?.(v);
  };

  const onTAChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setValue(text);
    requestAnimationFrame(() => {
      const ta = taRef.current;
      if (!ta) return;
      updatePicker(text, ta.selectionStart);
    });
  };

  const onTAKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!picker.open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      const item = filtered[active];
      if (item && !item.disabled) {
        e.preventDefault();
        pick(item);
      }
    } else if (e.key === 'Escape') {
      setPicker((p) => ({ ...p, open: false }));
    }
  };

  const pick = (item: MentionItem) => {
    if (item.disabled) return;
    const ta = taRef.current;
    if (!ta) return;
    const before = value.slice(0, picker.triggerIndex);
    const afterStart = picker.triggerIndex + 1 + picker.search.length;
    const after = value.slice(afterStart);
    const inserted = `${picker.prefix}${item.value} `;
    const next = before + inserted + after;
    setValue(next);
    onSelect?.(item, picker.prefix);
    setPicker((p) => ({ ...p, open: false }));
    requestAnimationFrame(() => {
      ta.focus();
      const newCaret = (before + inserted).length;
      ta.setSelectionRange(newCaret, newCaret);
    });
  };

  return (
    <div className={['au-mentions', className].filter(Boolean).join(' ')} style={style}>
      <textarea
        {...textareaProps}
        ref={taRef}
        className="au-mentions__textarea"
        rows={rows}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={onTAChange}
        onKeyDown={onTAKeyDown}
        spellCheck={false}
      />
      {picker.open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popupRef}
            className="au-mentions__popup"
            style={{
              position: 'fixed',
              top: picker.top,
              left: picker.left,
              maxHeight: popupMaxHeight,
            }}
          >
            {filtered.length === 0 ? (
              <div className="au-mentions__empty">无匹配的"{picker.prefix}{picker.search}"</div>
            ) : (
              <ul className="au-mentions__list" role="listbox">
                {filtered.map((it, i) => (
                  <li
                    key={it.value}
                    role="option"
                    aria-selected={i === active}
                    className={[
                      'au-mentions__item',
                      i === active ? 'is-active' : '',
                      it.disabled ? 'is-disabled' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(it)}
                  >
                    {it.avatar && <span className="au-mentions__avatar">{it.avatar}</span>}
                    <div className="au-mentions__text">
                      <div className="au-mentions__label">
                        <span className="au-mentions__prefix">{picker.prefix}</span>
                        {it.label ?? it.value}
                      </div>
                      {it.description && (
                        <div className="au-mentions__desc">{it.description}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default Mentions;
