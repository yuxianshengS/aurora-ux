import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { useReactivePosition } from '../../hooks/useReactivePosition';
import { useLocale } from '../ConfigProvider/ConfigProvider';
import './AutoComplete.css';

export interface AutoCompleteOption {
  /** 选项值 (会回填到 input) */
  value: string;
  /** 显示标签 (默认走 value) */
  label?: React.ReactNode;
  /** 描述行 */
  description?: React.ReactNode;
  /** 禁用 */
  disabled?: boolean;
}

export interface AutoCompleteProps {
  /** 选项 (静态) — 想做异步, 在父组件 onSearch 里 setOptions */
  options?: AutoCompleteOption[];
  /** 受控值 */
  value?: string;
  /** 非受控初始 */
  defaultValue?: string;
  /** placeholder */
  placeholder?: string;
  /** 输入变化 */
  onChange?: (value: string) => void;
  /** 选中候选 (回车 / 点击) */
  onSelect?: (value: string, option: AutoCompleteOption) => void;
  /** 输入触发, 用于异步搜索 (debounced 由父级自己处理) */
  onSearch?: (value: string) => void;
  /** 自定义筛选 — 不传时按 includes 字符串匹配 */
  filterOption?: (input: string, option: AutoCompleteOption) => boolean;
  /** 禁用 */
  disabled?: boolean;
  /** 允许清除 */
  allowClear?: boolean;
  /** 输入框尺寸 */
  size?: 'small' | 'medium' | 'large';
  /** 候选列表最大高 */
  maxHeight?: number;
  /** 没匹配时显示 */
  notFoundContent?: React.ReactNode;
  /** 输入元素的额外属性 */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  className?: string;
  style?: React.CSSProperties;
}

const defaultFilter = (input: string, opt: AutoCompleteOption) => {
  if (!input) return true;
  const i = input.toLowerCase();
  if (opt.value.toLowerCase().includes(i)) return true;
  if (typeof opt.label === 'string' && opt.label.toLowerCase().includes(i)) return true;
  return false;
};

const AutoComplete: React.FC<AutoCompleteProps> = ({
  options = [],
  value: ctrlValue,
  defaultValue = '',
  placeholder,
  onChange,
  onSelect,
  onSearch,
  filterOption,
  disabled,
  allowClear,
  size = 'medium',
  maxHeight = 240,
  notFoundContent,
  inputProps,
  className = '',
  style,
}) => {
  const locale = useLocale();
  const notFoundText = notFoundContent ?? locale.AutoComplete.notFoundContent;
  const isCtrl = ctrlValue !== undefined;
  const [innerValue, setInnerValue] = useState(defaultValue);
  const value = isCtrl ? ctrlValue! : innerValue;

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number }>({
    top: 0, left: 0, width: 0,
  });

  const filtered = useMemo(() => {
    const f = filterOption ?? defaultFilter;
    return options.filter((o) => f(value, o));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, value, filterOption]);

  useEffect(() => {
    if (active >= filtered.length) setActive(0);
  }, [filtered.length, active]);

  // 定位
  useReactivePosition(open, () => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.left, width: r.width });
  });

  // 外部关闭
  useOutsideClick([wrapRef, popupRef], () => setOpen(false), open);

  const setValue = (v: string) => {
    if (!isCtrl) setInnerValue(v);
    onChange?.(v);
  };

  const pick = (opt: AutoCompleteOption) => {
    if (opt.disabled) return;
    setValue(opt.value);
    onSelect?.(opt.value, opt);
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      const opt = filtered[active];
      if (opt) {
        e.preventDefault();
        pick(opt);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div
      ref={wrapRef}
      className={[
        'au-autocomplete',
        `au-autocomplete--${size}`,
        disabled ? 'is-disabled' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <input
        {...inputProps}
        ref={inputRef}
        type="text"
        className="au-autocomplete__input"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          setValue(e.target.value);
          onSearch?.(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
        spellCheck={false}
        autoComplete="off"
      />
      {allowClear && value && !disabled && (
        <button
          type="button"
          className="au-autocomplete__clear"
          onClick={() => {
            setValue('');
            inputRef.current?.focus();
          }}
          aria-label="清除"
        >
          ✕
        </button>
      )}
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popupRef}
            className="au-autocomplete__popup"
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              width: pos.width,
              maxHeight,
            }}
          >
            {filtered.length === 0 ? (
              <div className="au-autocomplete__empty">{notFoundText}</div>
            ) : (
              <ul className="au-autocomplete__list" role="listbox">
                {filtered.map((opt, i) => (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={i === active}
                    className={[
                      'au-autocomplete__item',
                      i === active ? 'is-active' : '',
                      opt.disabled ? 'is-disabled' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(opt)}
                  >
                    <div className="au-autocomplete__item-label">{opt.label ?? opt.value}</div>
                    {opt.description && (
                      <div className="au-autocomplete__item-desc">{opt.description}</div>
                    )}
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

export default AutoComplete;
