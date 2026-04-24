import React, { useState } from 'react';
import './Pagination.css';

export type PaginationSize = 'small' | 'default';

export type PaginationAlign = 'left' | 'center' | 'right';

export interface PaginationProps {
  current?: number;
  defaultCurrent?: number;
  total: number;
  pageSize?: number;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  /**
   * 显示总条数:
   * - true → 默认文案 `共 N 条`
   * - function → 自定义渲染 (total, [start, end]) → ReactNode
   * - false / 不传 → 不显示
   */
  showTotal?: boolean | ((total: number, range: [number, number]) => React.ReactNode);
  disabled?: boolean;
  hideOnSinglePage?: boolean;
  simple?: boolean;
  size?: PaginationSize;
  /** 在所处容器里的水平位置 — 设了就让 Pagination 块级占满并用 justify-content 定位 */
  align?: PaginationAlign;
  className?: string;
  style?: React.CSSProperties;
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
}

const Left: React.FC = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
    <path d="M10 3l-5 5 5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Right: React.FC = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
    <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const MoreIcon: React.FC = () => <span className="au-pg__more">•••</span>;

const buildPages = (current: number, totalPages: number): (number | 'prev-jump' | 'next-jump')[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | 'prev-jump' | 'next-jump')[] = [1];
  if (current > 4) pages.push('prev-jump');
  const start = Math.max(2, current - 2);
  const end = Math.min(totalPages - 1, current + 2);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < totalPages - 3) pages.push('next-jump');
  pages.push(totalPages);
  return pages;
};

const Pagination: React.FC<PaginationProps> = ({
  current: currentProp,
  defaultCurrent = 1,
  total,
  pageSize: pageSizeProp,
  defaultPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  showSizeChanger,
  showQuickJumper,
  showTotal,
  disabled,
  hideOnSinglePage,
  simple,
  size = 'default',
  align,
  className = '',
  style,
  onChange,
  onShowSizeChange,
}) => {
  const isControlledPage = currentProp !== undefined;
  const isControlledSize = pageSizeProp !== undefined;
  const [innerPage, setInnerPage] = useState(defaultCurrent);
  const [innerSize, setInnerSize] = useState(defaultPageSize);
  const pageSize = isControlledSize ? pageSizeProp! : innerSize;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, isControlledPage ? currentProp! : innerPage), totalPages);

  const [jumpText, setJumpText] = useState('');
  const [openSize, setOpenSize] = useState(false);

  if (hideOnSinglePage && totalPages <= 1) return null;

  const goTo = (p: number) => {
    if (disabled) return;
    const next = Math.min(Math.max(1, p), totalPages);
    if (next === current) return;
    if (!isControlledPage) setInnerPage(next);
    onChange?.(next, pageSize);
  };

  const changeSize = (s: number) => {
    if (disabled) return;
    if (!isControlledSize) setInnerSize(s);
    const maxPage = Math.max(1, Math.ceil(total / s));
    const nextPage = Math.min(current, maxPage);
    if (!isControlledPage) setInnerPage(nextPage);
    onShowSizeChange?.(nextPage, s);
    onChange?.(nextPage, s);
    setOpenSize(false);
  };

  const rangeStart = (current - 1) * pageSize + 1;
  const rangeEnd = Math.min(total, current * pageSize);

  const cls = [
    'au-pg',
    `au-pg--${size}`,
    disabled ? 'is-disabled' : '',
    simple ? 'au-pg--simple' : '',
    align ? `au-pg--align-${align}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // align 设了就把 Pagination 从 inline-flex 改成块级占满行, 再用 justify-content 定位
  const rootStyle: React.CSSProperties = align
    ? {
        display: 'flex',
        justifyContent:
          align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
        width: '100%',
        ...style,
      }
    : style ?? {};

  if (simple) {
    return (
      <div className={cls} style={rootStyle}>
        <button
          type="button"
          className="au-pg__btn"
          disabled={disabled || current <= 1}
          onClick={() => goTo(current - 1)}
          aria-label="上一页"
        >
          <Left />
        </button>
        <span className="au-pg__simple-input">
          <input
            type="text"
            value={current}
            onChange={(e) => {
              const v = Number(e.target.value.replace(/\D/g, ''));
              if (Number.isFinite(v) && v > 0) goTo(v);
            }}
            disabled={disabled}
          />
          <span className="au-pg__simple-sep">/</span>
          <span>{totalPages}</span>
        </span>
        <button
          type="button"
          className="au-pg__btn"
          disabled={disabled || current >= totalPages}
          onClick={() => goTo(current + 1)}
          aria-label="下一页"
        >
          <Right />
        </button>
      </div>
    );
  }

  const pages = buildPages(current, totalPages);

  return (
    <div className={cls} style={rootStyle}>
      {showTotal && (
        <span className="au-pg__total">
          {typeof showTotal === 'function'
            ? showTotal(total, [total === 0 ? 0 : rangeStart, rangeEnd])
            : `共 ${total} 条`}
        </span>
      )}
      <button
        type="button"
        className="au-pg__btn"
        disabled={disabled || current <= 1}
        onClick={() => goTo(current - 1)}
        aria-label="上一页"
      >
        <Left />
      </button>
      {pages.map((p, idx) => {
        if (p === 'prev-jump') {
          return (
            <button
              key={`p-${idx}`}
              type="button"
              className="au-pg__btn au-pg__btn--jump"
              disabled={disabled}
              onClick={() => goTo(current - 5)}
              aria-label="向前 5 页"
              title="向前 5 页"
            >
              <MoreIcon />
            </button>
          );
        }
        if (p === 'next-jump') {
          return (
            <button
              key={`n-${idx}`}
              type="button"
              className="au-pg__btn au-pg__btn--jump"
              disabled={disabled}
              onClick={() => goTo(current + 5)}
              aria-label="向后 5 页"
              title="向后 5 页"
            >
              <MoreIcon />
            </button>
          );
        }
        return (
          <button
            key={p}
            type="button"
            className={['au-pg__btn', 'au-pg__btn--page', p === current ? 'is-active' : ''].filter(Boolean).join(' ')}
            disabled={disabled}
            onClick={() => goTo(p)}
            aria-current={p === current ? 'page' : undefined}
          >
            {p}
          </button>
        );
      })}
      <button
        type="button"
        className="au-pg__btn"
        disabled={disabled || current >= totalPages}
        onClick={() => goTo(current + 1)}
        aria-label="下一页"
      >
        <Right />
      </button>

      {showSizeChanger && (
        <div className={['au-pg__sizer', openSize ? 'is-open' : ''].filter(Boolean).join(' ')}>
          <button
            type="button"
            className="au-pg__sizer-btn"
            disabled={disabled}
            onClick={() => setOpenSize((v) => !v)}
            onBlur={() => setTimeout(() => setOpenSize(false), 150)}
          >
            {pageSize} 条/页
            <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden>
              <path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {openSize && (
            <ul className="au-pg__sizer-list">
              {pageSizeOptions.map((s) => (
                <li
                  key={s}
                  className={['au-pg__sizer-item', s === pageSize ? 'is-selected' : ''].filter(Boolean).join(' ')}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => changeSize(s)}
                >
                  {s} 条/页
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showQuickJumper && (
        <div className="au-pg__jumper">
          跳至
          <input
            type="text"
            value={jumpText}
            disabled={disabled}
            onChange={(e) => setJumpText(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const n = Number(jumpText);
                if (Number.isFinite(n) && n > 0) goTo(n);
                setJumpText('');
              }
            }}
            onBlur={() => {
              if (jumpText) {
                const n = Number(jumpText);
                if (Number.isFinite(n) && n > 0) goTo(n);
                setJumpText('');
              }
            }}
          />
          页
        </div>
      )}
    </div>
  );
};

export default Pagination;
