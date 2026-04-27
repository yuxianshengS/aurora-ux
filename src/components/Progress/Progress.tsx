import React from 'react';
import './Progress.css';

export type ProgressType = 'line' | 'circle' | 'dashboard';
export type ProgressStatus = 'normal' | 'active' | 'success' | 'exception';
export type ProgressSize = 'small' | 'default' | 'large';

export interface ProgressProps {
  /** 0-100 */
  percent?: number;
  type?: ProgressType;
  status?: ProgressStatus;
  size?: ProgressSize;
  /** 自定义颜色, 字符串或渐变 [from, to] */
  strokeColor?: string | [string, string];
  /** 显示数值 */
  showInfo?: boolean;
  /** 自定义内部文案渲染 */
  format?: (percent: number) => React.ReactNode;
  /** circle / dashboard 直径 */
  width?: number;
  /** circle / dashboard 线宽 (% 或 px) */
  strokeWidth?: number;
  /** dashboard 缺口角度 */
  gapDegree?: number;
  className?: string;
  style?: React.CSSProperties;
}

const STATUS_COLOR: Record<ProgressStatus, string> = {
  normal: 'var(--au-primary)',
  active: 'var(--au-primary)',
  success: 'var(--au-success, #10b981)',
  exception: 'var(--au-danger, #ef4444)',
};

const Progress: React.FC<ProgressProps> = ({
  percent = 0,
  type = 'line',
  status = 'normal',
  size = 'default',
  strokeColor,
  showInfo = true,
  format,
  width = 120,
  strokeWidth,
  gapDegree = 75,
  className = '',
  style,
}) => {
  const clamped = Math.min(100, Math.max(0, percent));
  const autoStatus: ProgressStatus = clamped >= 100 && status === 'normal' ? 'success' : status;
  const color = strokeColor
    ? Array.isArray(strokeColor)
      ? `linear-gradient(90deg, ${strokeColor[0]}, ${strokeColor[1]})`
      : strokeColor
    : STATUS_COLOR[autoStatus];
  const text = format ? format(clamped) : autoStatus === 'success' ? '✓' : `${clamped}%`;

  if (type === 'line') {
    const h = size === 'small' ? 6 : size === 'large' ? 12 : 8;
    return (
      <div className={['au-progress', 'au-progress--line', `is-${autoStatus}`, className].filter(Boolean).join(' ')} style={style}>
        <div className="au-progress__track" style={{ height: h }}>
          <div
            className={['au-progress__bar', autoStatus === 'active' ? 'is-pulse' : ''].filter(Boolean).join(' ')}
            style={{ width: `${clamped}%`, background: color }}
          />
        </div>
        {showInfo && <span className="au-progress__info">{text}</span>}
      </div>
    );
  }

  // circle / dashboard
  const isDashboard = type === 'dashboard';
  const sw = strokeWidth ?? 6;
  const r = (width - sw) / 2;
  const circ = 2 * Math.PI * r;
  const gap = isDashboard ? (gapDegree / 360) * circ : 0;
  const visible = circ - gap;
  const filled = (visible * clamped) / 100;
  const trackDash = `${visible} ${circ - visible}`;
  const barDash = `${filled} ${circ - filled}`;
  const rotation = isDashboard ? 90 + gapDegree / 2 : -90;

  return (
    <div
      className={['au-progress', `au-progress--${type}`, `is-${autoStatus}`, className].filter(Boolean).join(' ')}
      style={{ width, height: width, ...style }}
    >
      <svg viewBox={`0 0 ${width} ${width}`} width={width} height={width}>
        <g transform={`rotate(${rotation} ${width / 2} ${width / 2})`}>
          <circle
            cx={width / 2}
            cy={width / 2}
            r={r}
            fill="none"
            strokeWidth={sw}
            stroke="var(--au-bg-mute)"
            strokeDasharray={trackDash}
            strokeLinecap="round"
          />
          <circle
            cx={width / 2}
            cy={width / 2}
            r={r}
            fill="none"
            strokeWidth={sw}
            stroke={typeof color === 'string' && color.startsWith('linear-gradient') ? 'var(--au-primary)' : color}
            strokeDasharray={barDash}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.3s ease' }}
          />
        </g>
      </svg>
      {showInfo && <div className="au-progress__center">{text}</div>}
    </div>
  );
};

export default Progress;
