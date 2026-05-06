import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { useReactivePosition } from '../../hooks/useReactivePosition';
import './Cascader.css';

export type CascaderSize = 'small' | 'medium' | 'large';

export type CascaderValue = string | number;

export interface CascaderOption<V extends CascaderValue = CascaderValue> {
  value: V;
  label: React.ReactNode;
  disabled?: boolean;
  children?: CascaderOption<V>[];
}

export interface CascaderProps<V extends CascaderValue = CascaderValue> {
  options: CascaderOption<V>[];
  /** 单选: V[] (一条路径) / 多选: V[][] (多条路径) */
  value?: V[] | V[][];
  defaultValue?: V[] | V[][];
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  size?: CascaderSize;
  /** 多选模式: 仅叶子节点可勾选, 触发器显示 tag 列表, 弹层不自动关闭 */
  multiple?: boolean;
  /** 多选时最多展示几个 tag, 超出折叠成 +N. 默认 0 = 全部展示 */
  maxTagCount?: number;
  /** 'click' (默认): 点击钻入下一级 / 'hover': 悬停 100ms 自动钻入 */
  expandTrigger?: 'click' | 'hover';
  /** 是否允许选中非叶子节点 (默认 false, 即只能选叶子). 多选模式下被忽略 */
  changeOnSelect?: boolean;
  /** 自定义触发器路径渲染 (单选) — 不传时按 separator 拼 label */
  displayRender?: (
    labels: React.ReactNode[],
    selectedOptions: CascaderOption<V>[],
  ) => React.ReactNode;
  /** 路径分隔符 (默认 '/') */
  separator?: React.ReactNode;
  status?: 'error' | 'warning';
  className?: string;
  style?: React.CSSProperties;
  popupClassName?: string;
  /** 单列宽度 px (默认 140) */
  columnWidth?: number;
  /** 列最大高度 px (默认 240, 超出滚动) */
  columnMaxHeight?: number;
  onChange?: (
    value: V[] | V[][],
    selectedOptions: CascaderOption<V>[] | CascaderOption<V>[][],
  ) => void;
  onOpenChange?: (open: boolean) => void;
}

const ChevronDown: React.FC = () => (
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

const ChevronRight: React.FC = () => (
  <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden>
    <path
      d="M6 4l4 4-4 4"
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

/** 在树里按 path 找到对应的 options 链 — 返回每一层的命中 option */
function resolvePath<V extends CascaderValue>(
  options: CascaderOption<V>[],
  path: V[],
): CascaderOption<V>[] {
  const out: CascaderOption<V>[] = [];
  let cur = options;
  for (const v of path) {
    const found = cur.find((o) => o.value === v);
    if (!found) break;
    out.push(found);
    cur = found.children ?? [];
  }
  return out;
}

function Cascader<V extends CascaderValue = CascaderValue>({
  options,
  value,
  defaultValue,
  placeholder = '请选择',
  disabled,
  allowClear,
  size = 'medium',
  multiple = false,
  maxTagCount = 0,
  expandTrigger = 'click',
  changeOnSelect = false,
  displayRender,
  separator = '/',
  status,
  className = '',
  style,
  popupClassName = '',
  columnWidth = 140,
  columnMaxHeight = 240,
  onChange,
  onOpenChange,
}: CascaderProps<V>) {
  const isControlled = value !== undefined;
  // 内部状态: 多选用 V[][], 单选用 V[]; 外部 value 同样按 multiple 解读
  const defaultMulti: V[][] = useMemo(() => {
    if (!multiple) return [];
    if (!defaultValue) return [];
    return Array.isArray((defaultValue as V[][])[0])
      ? (defaultValue as V[][])
      : [];
  }, [multiple, defaultValue]);
  const defaultSingle: V[] = useMemo(() => {
    if (multiple) return [];
    if (!defaultValue) return [];
    return Array.isArray((defaultValue as V[])[0])
      ? []
      : (defaultValue as V[]);
  }, [multiple, defaultValue]);
  const [innerMulti, setInnerMulti] = useState<V[][]>(defaultMulti);
  const [innerSingle, setInnerSingle] = useState<V[]>(defaultSingle);

  const currentMulti: V[][] = useMemo(() => {
    if (!multiple) return [];
    if (isControlled) return (value as V[][]) ?? [];
    return innerMulti;
  }, [multiple, isControlled, value, innerMulti]);
  const currentSingle: V[] = useMemo(() => {
    if (multiple) return [];
    if (isControlled) return (value as V[]) ?? [];
    return innerSingle;
  }, [multiple, isControlled, value, innerSingle]);
  const current: V[] = currentSingle;
  const pathKey = (p: V[]): string => p.map(String).join('');
  const selectedSet = useMemo(
    () => new Set(currentMulti.map(pathKey)),
    [currentMulti],
  );

  const [open, setOpen] = useState(false);
  /** 用户在弹层内悬停 / 钻入到的中间路径, 跟 current 解耦 */
  const [activePath, setActivePath] = useState<V[]>(current);

  const triggerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<number | null>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const setOpenSafe = useCallback(
    (next: boolean) => {
      if (disabled) return;
      if (next === open) return;
      setOpen(next);
      onOpenChange?.(next);
      if (next) setActivePath(current);
    },
    [disabled, open, current, onOpenChange],
  );

  // 外部点击关闭
  useOutsideClick([triggerRef, popupRef], () => setOpenSafe(false), open);

  // ESC 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenSafe(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, setOpenSafe]);

  // 弹层定位
  useReactivePosition(
    open,
    () => {
      if (!triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left });
    },
    [activePath],
  );

  /** 当前要展示的 N 列 */
  const columns = useMemo<CascaderOption<V>[][]>(() => {
    const cols: CascaderOption<V>[][] = [options];
    let cur = options;
    for (const v of activePath) {
      const found = cur.find((o) => o.value === v);
      if (!found?.children?.length) break;
      cols.push(found.children);
      cur = found.children;
    }
    return cols;
  }, [options, activePath]);

  /** 触发器显示的路径 labels */
  const currentResolved = useMemo(
    () => resolvePath(options, current),
    [options, current],
  );

  const handleOptionClick = (col: number, opt: CascaderOption<V>) => {
    if (opt.disabled) return;
    const newPath = [...activePath.slice(0, col), opt.value];
    const hasChildren = !!opt.children?.length;

    setActivePath(newPath);

    if (multiple) {
      // 多选: 仅叶子勾选, 父节点点击只钻入不选中
      if (hasChildren) return;
      const key = pathKey(newPath);
      const next = selectedSet.has(key)
        ? currentMulti.filter((p) => pathKey(p) !== key)
        : [...currentMulti, newPath];
      const selected = next.map((p) => resolvePath(options, p));
      if (!isControlled) setInnerMulti(next);
      onChange?.(next, selected);
      return;
    }

    if (changeOnSelect || !hasChildren) {
      // 单选: 触发选中
      const selected = resolvePath(options, newPath);
      if (!isControlled) setInnerSingle(newPath);
      onChange?.(newPath, selected);
      // 叶子才关弹层; 中间节点 (changeOnSelect) 不关, 让用户继续探索
      if (!hasChildren) setOpenSafe(false);
    }
  };

  const handleOptionMouseEnter = (col: number, opt: CascaderOption<V>) => {
    if (expandTrigger !== 'hover') return;
    if (opt.disabled) return;
    if (!opt.children?.length) return;
    if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = window.setTimeout(() => {
      setActivePath([...activePath.slice(0, col), opt.value]);
    }, 100);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      if (!isControlled) setInnerMulti([]);
      onChange?.([], []);
    } else {
      if (!isControlled) setInnerSingle([]);
      onChange?.([], []);
    }
    setActivePath([]);
  };

  const removeTag = (e: React.MouseEvent, path: V[]) => {
    e.stopPropagation();
    const key = pathKey(path);
    const next = currentMulti.filter((p) => pathKey(p) !== key);
    const selected = next.map((p) => resolvePath(options, p));
    if (!isControlled) setInnerMulti(next);
    onChange?.(next, selected);
  };

  const showClear =
    allowClear &&
    !disabled &&
    (multiple ? currentMulti.length > 0 : current.length > 0);

  // 多选: 路径解析为 tag 列表 (limited by maxTagCount)
  const tags = useMemo(() => {
    if (!multiple) return [];
    return currentMulti.map((p) => ({
      path: p,
      key: pathKey(p),
      labels: resolvePath(options, p).map((o) => o.label),
    }));
  }, [multiple, currentMulti, options]);
  const visibleTags = maxTagCount > 0 ? tags.slice(0, maxTagCount) : tags;
  const hiddenTagCount = tags.length - visibleTags.length;

  return (
    <>
      <div
        ref={triggerRef}
        className={[
          'au-cascader',
          `au-cascader--${size}`,
          open ? 'is-open' : '',
          disabled ? 'is-disabled' : '',
          multiple ? 'is-multiple' : '',
          status === 'error' ? 'is-error' : '',
          status === 'warning' ? 'is-warning' : '',
          showClear ? 'is-clearable' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={style}
        tabIndex={disabled ? -1 : 0}
        onClick={() => setOpenSafe(!open)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpenSafe(!open);
          }
        }}
      >
        <span className="au-cascader__display">
          {multiple ? (
            tags.length === 0 ? (
              <span className="au-cascader__placeholder">{placeholder}</span>
            ) : (
              <>
                {visibleTags.map((t) => (
                  <span key={t.key} className="au-cascader__tag">
                    <span className="au-cascader__tag-label">
                      {t.labels.map((l, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && (
                            <span className="au-cascader__tag-sep">
                              {separator}
                            </span>
                          )}
                          {l}
                        </React.Fragment>
                      ))}
                    </span>
                    <button
                      type="button"
                      className="au-cascader__tag-close"
                      tabIndex={-1}
                      onClick={(e) => removeTag(e, t.path)}
                      aria-label="移除"
                    >
                      <ClearIcon />
                    </button>
                  </span>
                ))}
                {hiddenTagCount > 0 && (
                  <span className="au-cascader__tag au-cascader__tag--more">
                    +{hiddenTagCount}
                  </span>
                )}
              </>
            )
          ) : currentResolved.length === 0 ? (
            <span className="au-cascader__placeholder">{placeholder}</span>
          ) : displayRender ? (
            displayRender(
              currentResolved.map((o) => o.label),
              currentResolved,
            )
          ) : (
            currentResolved.map((o, i) => (
              <React.Fragment key={i}>
                {i > 0 && (
                  <span className="au-cascader__sep">{separator}</span>
                )}
                <span className="au-cascader__label">{o.label}</span>
              </React.Fragment>
            ))
          )}
        </span>
        {showClear && (
          <button
            type="button"
            className="au-cascader__clear"
            tabIndex={-1}
            onClick={handleClear}
            aria-label="清除"
          >
            <ClearIcon />
          </button>
        )}
        <span className="au-cascader__arrow">
          <ChevronDown />
        </span>
      </div>
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popupRef}
            className={['au-cascader__popup', popupClassName]
              .filter(Boolean)
              .join(' ')}
            style={{ left: pos.left, top: pos.top }}
            onMouseLeave={() => {
              if (hoverTimerRef.current) {
                window.clearTimeout(hoverTimerRef.current);
                hoverTimerRef.current = null;
              }
            }}
          >
            {columns.map((colOptions, colIdx) => (
              <ul
                key={colIdx}
                className="au-cascader__col"
                style={{ width: columnWidth, maxHeight: columnMaxHeight }}
              >
                {colOptions.length === 0 ? (
                  <li className="au-cascader__empty">无</li>
                ) : (
                  colOptions.map((opt) => {
                    const isActive = activePath[colIdx] === opt.value;
                    const isSelected = !multiple && current[colIdx] === opt.value;
                    const hasChildren = !!opt.children?.length;
                    // 多选: 仅叶子勾选, 路径 = activePath 之前段 + 当前
                    const leafPath = [...activePath.slice(0, colIdx), opt.value];
                    const isChecked =
                      multiple && !hasChildren && selectedSet.has(pathKey(leafPath));
                    return (
                      <li
                        key={String(opt.value)}
                        className={[
                          'au-cascader__item',
                          isActive ? 'is-active' : '',
                          isSelected ? 'is-selected' : '',
                          opt.disabled ? 'is-disabled' : '',
                          hasChildren ? 'has-children' : '',
                          isChecked ? 'is-checked' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => handleOptionClick(colIdx, opt)}
                        onMouseEnter={() => handleOptionMouseEnter(colIdx, opt)}
                      >
                        {multiple && !hasChildren && (
                          <span
                            className={[
                              'au-cascader__check',
                              isChecked ? 'is-checked' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            aria-hidden
                          >
                            {isChecked && (
                              <svg viewBox="0 0 12 12" width="10" height="10">
                                <path
                                  d="M2 6.5l2.5 2.5L10 3"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </span>
                        )}
                        <span className="au-cascader__item-label">
                          {opt.label}
                        </span>
                        {hasChildren && (
                          <span className="au-cascader__item-arrow">
                            <ChevronRight />
                          </span>
                        )}
                      </li>
                    );
                  })
                )}
              </ul>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

export default Cascader;
