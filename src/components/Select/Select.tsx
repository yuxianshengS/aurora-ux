import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { useReactivePosition } from '../../hooks/useReactivePosition';
import './Select.css';

export type SelectSize = 'small' | 'medium' | 'large';

export interface SelectOption<V = SelectValue> {
  label: React.ReactNode;
  value: V;
  disabled?: boolean;
}

export type SelectValue = string | number;

export interface SelectProps<V extends SelectValue = SelectValue> {
  value?: V | V[] | null;
  defaultValue?: V | V[] | null;
  options: SelectOption<V>[];
  placeholder?: string;
  disabled?: boolean;
  size?: SelectSize;
  allowClear?: boolean;
  multiple?: boolean;
  filterable?: boolean;
  maxTagCount?: number;
  status?: 'error' | 'warning';
  className?: string;
  style?: React.CSSProperties;
  popupClassName?: string;
  popupMaxHeight?: number;
  onChange?: (value: V | V[] | null, option: SelectOption<V> | SelectOption<V>[] | null) => void;
  onSearch?: (keyword: string) => void;
  onOpenChange?: (open: boolean) => void;
  notFoundContent?: React.ReactNode;
}

const ChevronIcon: React.FC = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
    <path
      d="M4 6l4 4 4-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ClearIcon: React.FC = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
    <path
      d="M4 4l8 8M12 4l-8 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const CheckIcon: React.FC = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
    <path
      d="M3.5 8.2l3 3L12.5 5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function Select<V extends SelectValue = SelectValue>({
  value,
  defaultValue,
  options,
  placeholder = '请选择',
  disabled,
  size = 'medium',
  allowClear,
  multiple,
  filterable,
  maxTagCount,
  status,
  className = '',
  style,
  popupClassName = '',
  popupMaxHeight = 240,
  onChange,
  onSearch,
  onOpenChange,
  notFoundContent = '无匹配项',
}: SelectProps<V>) {
  const isControlled = value !== undefined;
  const defaultInner: V[] = useMemo(() => {
    if (defaultValue == null) return [];
    return Array.isArray(defaultValue) ? [...defaultValue] : [defaultValue];
  }, [defaultValue]);

  const [inner, setInner] = useState<V[]>(defaultInner);

  const current: V[] = useMemo(() => {
    if (!isControlled) return inner;
    if (value == null) return [];
    return Array.isArray(value) ? [...value] : [value];
  }, [isControlled, value, inner]);

  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [active, setActive] = useState(-1);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  /** 多选: 标签可见区 / 隐藏度量区, 用来按宽度自动折叠超出标签 */
  const tagWrapRef = useRef<HTMLDivElement>(null);
  const tagMeasureRef = useRef<HTMLDivElement>(null);
  /** 多选: 从第几个标签开始溢出 (-1 表示全部能放下) */
  const [overflowAt, setOverflowAt] = useState<number>(-1);
  const [pos, setPos] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });

  const setOpenSafe = useCallback(
    (next: boolean) => {
      if (disabled) return;
      if (next === open) return;
      setOpen(next);
      onOpenChange?.(next);
      if (!next) {
        setKeyword('');
        onSearch?.('');
      }
    },
    [disabled, open, onOpenChange, onSearch],
  );

  // Close on outside click
  useOutsideClick([triggerRef, popupRef], () => setOpenSafe(false), open);

  // Position popup
  useReactivePosition(
    open,
    () => {
      if (!triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      const popupEl = popupRef.current;
      const h = popupEl?.offsetHeight ?? popupMaxHeight;
      let top = r.bottom + 4;
      if (top + h > window.innerHeight - 8 && r.top - h - 4 > 8) {
        top = r.top - h - 4;
      }
      setPos({ top, left: r.left, width: r.width });
    },
    [popupMaxHeight],
  );

  useEffect(() => {
    if (open && filterable) {
      inputRef.current?.focus();
    }
  }, [open, filterable]);

  /**
   * 多选: 按容器宽度自动折叠超出标签 — 度量层始终渲染完整列表 + 占位的 +N 片,
   * 算出能放下几个, 设置 overflowAt; 可见层只渲染前 N 个 + 真正的 +N 片.
   * maxTagCount 显式给了就走老路 (固定 cap); 否则跑这个测量循环.
   * filterable + open 时 input 也参与抢宽度, 留点余量给输入框.
   */
  useLayoutEffect(() => {
    if (!multiple || maxTagCount != null) {
      setOverflowAt((prev) => (prev === -1 ? prev : -1));
      return;
    }
    const wrap = tagWrapRef.current;
    const measure = tagMeasureRef.current;
    if (!wrap || !measure || current.length === 0) {
      setOverflowAt((prev) => (prev === -1 ? prev : -1));
      return;
    }
    const calc = () => {
      const containerWidth = wrap.clientWidth;
      const tagEls = measure.querySelectorAll<HTMLElement>('.au-select__tag:not(.is-more)');
      const overflowChip = measure.querySelector<HTMLElement>('.au-select__tag.is-more');
      const overflowWidth = overflowChip?.offsetWidth ?? 32;
      // filterable + open 状态下要给 input 留至少 60px (跟 CSS .au-select__search 的 min-width 同步)
      const inputReserve = filterable && open ? 64 : 0;
      const gap = 4;
      const available = containerWidth - inputReserve;

      let cum = 0;
      let cutoff = -1;
      for (let i = 0; i < tagEls.length; i++) {
        const w = tagEls[i].offsetWidth;
        const next = cum + (i > 0 ? gap : 0) + w;
        const hasMoreAfter = i < tagEls.length - 1;
        const reserve = hasMoreAfter ? gap + overflowWidth : 0;
        if (next + reserve > available) {
          cutoff = i;
          break;
        }
        cum = next;
      }
      setOverflowAt((prev) => (prev === cutoff ? prev : cutoff));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [multiple, maxTagCount, current, filterable, open]);

  const filtered = useMemo(() => {
    if (!filterable || !keyword) return options;
    const kw = keyword.trim().toLowerCase();
    return options.filter((o) => {
      const text =
        typeof o.label === 'string' || typeof o.label === 'number'
          ? String(o.label).toLowerCase()
          : String(o.value).toLowerCase();
      return text.includes(kw);
    });
  }, [filterable, keyword, options]);

  useEffect(() => {
    if (open) {
      const firstSelected = filtered.findIndex((o) => current.includes(o.value));
      setActive(firstSelected >= 0 ? firstSelected : filtered.length > 0 ? 0 : -1);
    }
  }, [open, filtered, current]);

  const commit = (next: V[]) => {
    if (!isControlled) setInner(next);
    if (multiple) {
      const opts = next
        .map((v) => options.find((o) => o.value === v))
        .filter(Boolean) as SelectOption<V>[];
      onChange?.(next, opts);
    } else {
      const v = next[0] ?? null;
      const opt = v != null ? options.find((o) => o.value === v) ?? null : null;
      onChange?.(v, opt);
    }
  };

  const pickOption = (opt: SelectOption<V>) => {
    if (opt.disabled) return;
    if (multiple) {
      const exists = current.includes(opt.value);
      const next = exists ? current.filter((v) => v !== opt.value) : [...current, opt.value];
      commit(next);
    } else {
      commit([opt.value]);
      setOpenSafe(false);
    }
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    commit([]);
  };

  const removeTag = (e: React.MouseEvent, v: V) => {
    e.stopPropagation();
    commit(current.filter((x) => x !== v));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setOpenSafe(true);
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpenSafe(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => {
        for (let i = 1; i <= filtered.length; i++) {
          const next = (a + i) % filtered.length;
          if (!filtered[next]?.disabled) return next;
        }
        return a;
      });
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => {
        for (let i = 1; i <= filtered.length; i++) {
          const next = (a - i + filtered.length) % filtered.length;
          if (!filtered[next]?.disabled) return next;
        }
        return a;
      });
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const opt = filtered[active];
      if (opt) pickOption(opt);
    }
  };

  const hasValue = current.length > 0;
  const showClear = allowClear && !disabled && hasValue;

  const renderSingleLabel = () => {
    if (!hasValue) return <span className="au-select__ph">{placeholder}</span>;
    const opt = options.find((o) => o.value === current[0]);
    return <span className="au-select__value">{opt?.label ?? String(current[0])}</span>;
  };

  /** 单个标签的渲染 — 可见层和度量层共用 */
  const renderOneTag = (v: V) => {
    const opt = options.find((o) => o.value === v);
    return (
      <span key={String(v)} className="au-select__tag">
        <span className="au-select__tag-label">{opt?.label ?? String(v)}</span>
        {!disabled && (
          <button
            type="button"
            className="au-select__tag-close"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => removeTag(e, v)}
            aria-label="移除"
          >
            <ClearIcon />
          </button>
        )}
      </span>
    );
  };

  const renderTags = () => {
    if (!hasValue && !keyword) {
      return !filterable || !open ? (
        <span className="au-select__ph">{placeholder}</span>
      ) : null;
    }
    // maxTagCount 显式设置 = 固定 cap, 走老路;
    // 没设 = 用 overflowAt 自动按宽度裁 (-1 = 全部能放)
    const auto = maxTagCount == null;
    const cutoff = auto
      ? (overflowAt < 0 ? current.length : overflowAt)
      : Math.min(maxTagCount, current.length);
    const shown = current.slice(0, cutoff);
    const rest = current.length - cutoff;
    return (
      <>
        {shown.map((v) => renderOneTag(v))}
        {rest > 0 && <span className="au-select__tag is-more">+{rest}</span>}
        {/* 度量层 — 自动模式才需要, 始终渲染完整列表给 ResizeObserver 量宽度 */}
        {auto && current.length > 0 && (
          <div className="au-select__measure" aria-hidden ref={tagMeasureRef}>
            {current.map((v) => renderOneTag(v))}
            <span className="au-select__tag is-more">+{current.length}</span>
          </div>
        )}
      </>
    );
  };

  const wrapperCls = [
    'au-select',
    `au-select--${size}`,
    multiple ? 'is-multiple' : '',
    open ? 'is-open' : '',
    disabled ? 'is-disabled' : '',
    hasValue ? 'has-value' : '',
    status === 'error' ? 'is-error' : '',
    status === 'warning' ? 'is-warning' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <div
        ref={triggerRef}
        className={wrapperCls}
        style={style}
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled) setOpenSafe(!open);
        }}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={open}
        aria-disabled={disabled}
      >
        <div className="au-select__content" ref={tagWrapRef}>
          {multiple ? renderTags() : renderSingleLabel()}
          {filterable && open && (
            <input
              ref={inputRef}
              className="au-select__search"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                onSearch?.(e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              style={multiple ? undefined : { position: 'absolute', inset: 0 }}
            />
          )}
        </div>
        <div className="au-select__suffix">
          {showClear && (
            <button
              type="button"
              className="au-select__clear"
              onMouseDown={(e) => e.preventDefault()}
              onClick={clear}
              aria-label="清除"
            >
              <ClearIcon />
            </button>
          )}
          <span className="au-select__arrow">
            <ChevronIcon />
          </span>
        </div>
      </div>
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popupRef}
            className={['au-select__popup', popupClassName].filter(Boolean).join(' ')}
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              minWidth: pos.width,
              maxHeight: popupMaxHeight,
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            {filtered.length === 0 ? (
              <div className="au-select__empty">{notFoundContent}</div>
            ) : (
              <ul className="au-select__list" role="listbox">
                {filtered.map((opt, i) => {
                  const selected = current.includes(opt.value);
                  const cls = [
                    'au-select__option',
                    selected ? 'is-selected' : '',
                    opt.disabled ? 'is-disabled' : '',
                    i === active ? 'is-active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  return (
                    <li
                      key={String(opt.value)}
                      className={cls}
                      role="option"
                      aria-selected={selected}
                      onMouseEnter={() => setActive(i)}
                      onClick={(e) => {
                        e.stopPropagation();
                        pickOption(opt);
                      }}
                    >
                      <span className="au-select__option-label">{opt.label}</span>
                      {selected && (
                        <span className="au-select__option-check">
                          <CheckIcon />
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

export default Select;
