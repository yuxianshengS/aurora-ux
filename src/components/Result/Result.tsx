import React from 'react';
import './Result.css';

export type ResultStatus = 'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500';

export interface ResultProps {
  status?: ResultStatus;
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  /** 自定义图标, 设了就覆盖 status 默认图标 */
  icon?: React.ReactNode;
  /** 操作区, 一般放按钮 */
  extra?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const ICONS: Record<ResultStatus, React.ReactNode> = {
  success: (
    <svg viewBox="0 0 64 64" width="56" height="56" aria-hidden>
      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M20 33l9 9 16-18" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 64 64" width="56" height="56" aria-hidden>
      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M22 22l20 20M42 22L22 42" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 64 64" width="56" height="56" aria-hidden>
      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="32" cy="20" r="3" fill="currentColor" />
      <path d="M32 28v20" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 64 64" width="56" height="56" aria-hidden>
      <path d="M32 6L60 56H4z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M32 22v18" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="32" cy="48" r="2.5" fill="currentColor" />
    </svg>
  ),
  '404': <span style={{ fontSize: 80, fontWeight: 700, letterSpacing: -2 }}>404</span>,
  '403': <span style={{ fontSize: 80, fontWeight: 700, letterSpacing: -2 }}>403</span>,
  '500': <span style={{ fontSize: 80, fontWeight: 700, letterSpacing: -2 }}>500</span>,
};

const DEFAULT_TITLE: Record<ResultStatus, string> = {
  success: '操作成功',
  error: '操作失败',
  info: '提示',
  warning: '警告',
  '404': '页面不存在',
  '403': '无权访问',
  '500': '服务器错误',
};

const Result: React.FC<ResultProps> = ({
  status = 'info',
  title,
  subTitle,
  icon,
  extra,
  children,
  className = '',
  style,
}) => {
  const cls = ['au-result', `au-result--${status}`, className].filter(Boolean).join(' ');
  return (
    <div className={cls} style={style}>
      <div className="au-result__icon">{icon ?? ICONS[status]}</div>
      <div className="au-result__title">{title ?? DEFAULT_TITLE[status]}</div>
      {subTitle && <div className="au-result__subtitle">{subTitle}</div>}
      {children && <div className="au-result__content">{children}</div>}
      {extra && <div className="au-result__extra">{extra}</div>}
    </div>
  );
};

export default Result;
