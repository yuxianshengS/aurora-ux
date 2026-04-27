import React from 'react';
import './PulseDot.css';

export type PulseDotStatus = 'live' | 'success' | 'warning' | 'danger' | 'info' | 'default';

const STATUS_COLORS: Record<PulseDotStatus, string> = {
  live: '#22d3ee',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#6366f1',
  default: '#9ca3af',
};

export interface PulseDotProps {
  /** 预设语义色 (与 color 二选一, color 优先) */
  status?: PulseDotStatus;
  /** 自定义颜色 */
  color?: string;
  /** 直径 (px), 默认 8 */
  size?: number;
  /** 关闭脉冲, 只剩纯色点 */
  silent?: boolean;
  /** 脉冲一周时长 (s), 默认 1.6 */
  duration?: number;
  /** 跟在点后面的文字 */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const PulseDot: React.FC<PulseDotProps> = ({
  status = 'live',
  color,
  size = 8,
  silent = false,
  duration = 1.6,
  children,
  className = '',
  style,
}) => {
  const c = color ?? STATUS_COLORS[status] ?? STATUS_COLORS.default;
  const cls = ['au-pulse-dot', silent ? 'is-silent' : '', className].filter(Boolean).join(' ');
  const cssVars = {
    '--pulse-color': c,
    '--pulse-size': `${size}px`,
    '--pulse-duration': `${duration}s`,
  } as React.CSSProperties;
  return (
    <span className={cls} style={{ ...cssVars, ...style }}>
      <span className="au-pulse-dot__core" aria-hidden />
      {!silent && <span className="au-pulse-dot__ring" aria-hidden />}
      {children != null && <span className="au-pulse-dot__label">{children}</span>}
    </span>
  );
};

export default PulseDot;
