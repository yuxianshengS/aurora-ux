import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
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
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (popupRef.current?.contains(t)) return;
      setOpenSafe(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, setOpenSafe]);

  // Position popup
  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      if (!triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      const popupEl = popupRef.current;
      const h = popupEl?.offsetHeight ?? popupMaxHeight;
      let top = r.bottom + 4;
      if (top + h > window.innerHeight - 8 && r.top - h - 4 > 8) {
        top = r.top - h - 4;
      }
      setPos({ top, left: r.left, width: r.width });
    };
    update();
    const raf = requestAnimationFrame(update);
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, popupMaxHeight]);

  useEffect(() => {
    if (open && filterable) {
      inputRef.current?.focus();
    }
  }, [open, filterable]);

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

  const renderTags = () => {
    if (!hasValue && !keyword) {
      return !filterable || !open ? (
        <span className="au-select__ph">{placeholder}</span>
      ) : null;
    }
    const shown = maxTagCount != null ? current.slice(0, maxTagCount) : current;
    const rest = maxTagCount != null ? current.length - shown.length : 0;
    return (
      <>
        {shown.map((v) => {
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
        })}
        {rest > 0 && <span className="au-select__tag is-more">+{rest}</span>}
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
        <div className="au-select__content">
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
