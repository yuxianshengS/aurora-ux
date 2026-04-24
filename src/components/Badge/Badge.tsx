import React from 'react';
import './Badge.css';

export type BadgeStatus = 'default' | 'processing' | 'success' | 'warning' | 'error';

export interface BadgeProps {
  count?: number | React.ReactNode;
  overflowCount?: number;
  showZero?: boolean;
  dot?: boolean;
  status?: BadgeStatus;
  text?: React.ReactNode;
  color?: string;
  offset?: [number, number];
  size?: 'default' | 'small';
  title?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const statusColor: Record<BadgeStatus, string> = {
  default: 'var(--au-text-3)',
  processing: 'var(--au-primary)',
  success: 'var(--au-success)',
  warning: 'var(--au-warning)',
  error: 'var(--au-danger)',
};

const Badge: React.FC<BadgeProps> = ({
  count,
  overflowCount = 99,
  showZero,
  dot,
  status,
  text,
  color,
  offset,
  size = 'default',
  title,
  children,
  className = '',
  style,
}) => {
  // Status dot mode (standalone)
  if (status || (dot && !children)) {
    const c = color ?? (status ? statusColor[status] : 'var(--au-danger)');
    return (
      <span className={['au-badge-status', className].filter(Boolean).join(' ')} style={style}>
        <span
          className={['au-badge-status__dot', status === 'processing' ? 'is-processing' : ''].filter(Boolean).join(' ')}
          style={{ background: c }}
        />
        {text && <span className="au-badge-status__text">{text}</span>}
      </span>
    );
  }

  const numeric = typeof count === 'number' ? count : null;
  const shouldHide = !dot && numeric != null && numeric <= 0 && !showZero;
  const display =
    dot
      ? null
      : typeof count === 'number'
        ? count > overflowCount
          ? `${overflowCount}+`
          : String(count)
        : count;

  const markerStyle: React.CSSProperties = {
    ...(color ? { background: color } : {}),
    ...(offset
      ? {
          transform: `translate(${offset[0]}px, ${offset[1]}px) translate(50%, -50%)`,
        }
      : {}),
  };

  // Standalone count (no children)
  if (!children) {
    if (shouldHide || display === undefined || display === null) return null;
    return (
      <span
        className={[
          'au-badge-standalone',
          dot ? 'is-dot' : '',
          size === 'small' ? 'is-small' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ ...markerStyle, ...style }}
        title={title}
      >
        {dot ? null : display}
      </span>
    );
  }

  return (
    <span className={['au-badge', className].filter(Boolean).join(' ')} style={style}>
      {children}
      {!shouldHide && (display !== undefined || dot) && (
        <sup
          className={[
            'au-badge__marker',
            dot ? 'is-dot' : '',
            size === 'small' ? 'is-small' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={markerStyle}
          title={title}
        >
          {dot ? null : display}
        </sup>
      )}
    </span>
  );
};

export default Badge;
