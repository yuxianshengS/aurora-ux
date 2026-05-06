import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useLocale } from '../ConfigProvider/ConfigProvider';
import './CommandPalette.css';

export interface CommandItem {
  /** 唯一 id */
  id: string;
  /** 标题 (会被搜索匹配) */
  title: string;
  /** 副标题 / 描述 (也会被搜索匹配) */
  description?: string;
  /** 关键词 (额外的搜索词,不显示) */
  keywords?: string[];
  /** 左侧图标 */
  icon?: React.ReactNode;
  /** 右侧快捷键提示 (字符串数组,会渲染成 <kbd>) */
  shortcut?: string[];
  /** 点击或回车触发; 抛错或返回 false 不关闭面板 */
  onSelect?: () => void | boolean | Promise<void | boolean>;
  /** 是否禁用 */
  disabled?: boolean;
  /** 高亮 (主色) */
  emphasis?: boolean;
  /** 自定义分组 (默认走 group prop) */
  group?: string;
}

export interface CommandPaletteProps {
  /** 命令列表 */
  items: CommandItem[];
  /** 受控显示 */
  open?: boolean;
  /** 非受控默认显示 */
  defaultOpen?: boolean;
  /** 显隐变化 */
  onOpenChange?: (open: boolean) => void;
  /** 全局快捷键, 默认 ⌘K / Ctrl+K. 传 false 关闭快捷键监听 */
  hotkey?: string | false;
  /** 输入框占位 */
  placeholder?: string;
  /** 空结果文案 */
  emptyText?: React.ReactNode;
  /** 选中后是否自动关闭, 默认 true */
  closeOnSelect?: boolean;
  /** 最大高度 (px), 默认 420 */
  maxHeight?: number;
  /** 宽度 (px), 默认 560 */
  width?: number;
  /** 自定义最近使用 / 推荐 (空搜索时显示, 默认显示前 6 条) */
  recent?: string[];
  /** 顶部自定义内容 (页头小提示) */
  header?: React.ReactNode;
  /** 自定义 className */
  className?: string;
}

/** 简易模糊匹配:把 query 拆成字符,逐个在 target 中按序找,返回 score(0=不匹配, 越小越好的位置) */
const fuzzyMatch = (target: string, query: string): number => {
  if (!query) return 1;
  const t = target.toLowerCase();
  const q = query.toLowerCase();
  if (t.includes(q)) return 100 - t.indexOf(q); // 子串匹配最优
  let ti = 0;
  let score = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi];
    let found = -1;
    for (; ti < t.length; ti++) {
      if (t[ti] === ch) {
        found = ti;
        break;
      }
    }
    if (found < 0) return 0;
    score += found - qi; // 字符越分散分越低
    ti = found + 1;
  }
  return Math.max(1, 50 - score);
};

const matchScore = (it: CommandItem, q: string): number => {
  if (!q) return 1;
  const fields = [
    [it.title, 3],
    [it.description ?? '', 1.2],
    ...(it.keywords ?? []).map((k): [string, number] => [k, 2]),
  ] as Array<[string, number]>;
  let best = 0;
  for (const [text, weight] of fields) {
    const s = fuzzyMatch(text, q) * weight;
    if (s > best) best = s;
  }
  return best;
};

const isMac =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

const CommandPalette: React.FC<CommandPaletteProps> = ({
  items,
  open: ctrlOpen,
  defaultOpen = false,
  onOpenChange,
  hotkey = isMac ? 'meta+k' : 'ctrl+k',
  placeholder,
  emptyText,
  closeOnSelect = true,
  maxHeight = 420,
  width = 560,
  recent,
  header,
  className = '',
}) => {
  const locale = useLocale();
  const placeholderText = placeholder ?? locale.CommandPalette.placeholder;
  const emptyTextResolved = emptyText ?? locale.CommandPalette.empty;
  const isCtrl = ctrlOpen !== undefined;
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const open = isCtrl ? ctrlOpen! : innerOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (!isCtrl) setInnerOpen(next);
      onOpenChange?.(next);
    },
    [isCtrl, onOpenChange],
  );

  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useFocusTrap(panelRef, open);

  // 全局快捷键
  useEffect(() => {
    if (!hotkey) return;
    const parts = hotkey.toLowerCase().split('+').map((p) => p.trim());
    const needMeta = parts.includes('meta') || parts.includes('cmd');
    const needCtrl = parts.includes('ctrl');
    const needShift = parts.includes('shift');
    const needAlt = parts.includes('alt');
    const key = parts[parts.length - 1];

    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== key) return;
      if (needMeta && !e.metaKey) return;
      if (needCtrl && !e.ctrlKey) return;
      if (needShift && !e.shiftKey) return;
      if (needAlt && !e.altKey) return;
      e.preventDefault();
      setOpen(!open);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hotkey, open, setOpen]);

  // 打开时自动聚焦输入框 + 重置查询
  useLayoutEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      // 给 portal 一帧时间挂上
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  // 过滤 + 排序
  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) {
      // 空搜索: 优先 recent, 否则全量
      if (recent && recent.length) {
        const recentSet = new Set(recent);
        const recentItems = recent
          .map((id) => items.find((i) => i.id === id))
          .filter(Boolean) as CommandItem[];
        const rest = items.filter((i) => !recentSet.has(i.id));
        return { all: [...recentItems, ...rest], q: '' };
      }
      return { all: items, q: '' };
    }
    const scored = items
      .map((it) => ({ it, s: matchScore(it, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.it);
    return { all: scored, q };
  }, [items, query, recent]);

  // 分组渲染数据
  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    filtered.all.forEach((it) => {
      const g = it.group ?? '';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(it);
    });
    return Array.from(map.entries());
  }, [filtered]);

  // 扁平索引(用于上下键)
  const flat = filtered.all;
  // 修正 activeIdx 越界
  useEffect(() => {
    if (activeIdx >= flat.length) setActiveIdx(0);
  }, [flat.length, activeIdx]);

  const selectAt = useCallback(
    async (idx: number) => {
      const it = flat[idx];
      if (!it || it.disabled) return;
      const ret = it.onSelect?.();
      let keepOpen = false;
      if (ret instanceof Promise) {
        const r = await ret;
        if (r === false) keepOpen = true;
      } else if (ret === false) {
        keepOpen = true;
      }
      if (closeOnSelect && !keepOpen) setOpen(false);
    },
    [flat, closeOnSelect, setOpen],
  );

  // 滚动让激活项在视口
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIdx(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIdx(flat.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      void selectAt(activeIdx);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  };

  if (!open) return null;

  let runningIdx = 0;

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className={`au-cmdk ${className}`.trim()}>
      <div className="au-cmdk__mask" onClick={() => setOpen(false)} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="命令面板"
        className="au-cmdk__panel"
        style={{ width, maxHeight }}
      >
        {header && <div className="au-cmdk__header">{header}</div>}
        <div className="au-cmdk__input-row">
          <span className="au-cmdk__input-icon" aria-hidden>
            <svg viewBox="0 0 16 16" width="16" height="16">
              <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          <input
            ref={inputRef}
            className="au-cmdk__input"
            placeholder={placeholderText}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
          />
          <span className="au-cmdk__esc">ESC</span>
        </div>
        <div ref={listRef} className="au-cmdk__list" role="listbox">
          {flat.length === 0 ? (
            <div className="au-cmdk__empty">{emptyTextResolved}</div>
          ) : (
            grouped.map(([groupName, list]) => (
              <div key={groupName || '__default'} className="au-cmdk__group">
                {groupName && <div className="au-cmdk__group-title">{groupName}</div>}
                {list.map((it) => {
                  const idx = runningIdx++;
                  const active = idx === activeIdx;
                  return (
                    <button
                      key={it.id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      data-idx={idx}
                      disabled={it.disabled}
                      className={[
                        'au-cmdk__item',
                        active ? 'is-active' : '',
                        it.disabled ? 'is-disabled' : '',
                        it.emphasis ? 'is-emphasis' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onMouseEnter={() => setActiveIdx(idx)}
                      onClick={() => selectAt(idx)}
                    >
                      {it.icon && <span className="au-cmdk__item-icon">{it.icon}</span>}
                      <div className="au-cmdk__item-text">
                        <div className="au-cmdk__item-title">{it.title}</div>
                        {it.description && (
                          <div className="au-cmdk__item-desc">{it.description}</div>
                        )}
                      </div>
                      {it.shortcut && it.shortcut.length > 0 && (
                        <span className="au-cmdk__item-shortcut">
                          {it.shortcut.map((k, i) => (
                            <kbd key={i}>{k}</kbd>
                          ))}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="au-cmdk__footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> {locale.CommandPalette.hintArrows}</span>
          <span><kbd>↵</kbd> {locale.CommandPalette.hintEnter}</span>
          <span><kbd>{isMac ? '⌘' : 'Ctrl'}</kbd><kbd>K</kbd> {locale.CommandPalette.hintToggle}</span>
          <span className="au-cmdk__brand">Aurora · cmdk</span>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CommandPalette;
