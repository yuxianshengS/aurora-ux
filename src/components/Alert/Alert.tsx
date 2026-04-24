import React, { useState } from 'react';
import './Alert.css';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  type?: AlertType;
  title?: React.ReactNode;
  description?: React.ReactNode;
  showIcon?: boolean;
  icon?: React.ReactNode;
  closable?: boolean;
  closeText?: React.ReactNode;
  action?: React.ReactNode;
  banner?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClose?: (e: React.MouseEvent) => void;
}

const CloseIcon: React.FC = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
    <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const builtinIcon = (t: AlertType, hasTitle: boolean): React.ReactNode => {
  const size = hasTitle ? 20 : 16;
  const common = { width: size, height: size, viewBox: '0 0 24 24' };
  if (t === 'success')
    return (
      <svg {...common} aria-hidden>
        <circle cx="12" cy="12" r="10" fill="var(--au-success)" />
        <path d="M7 12l3.5 3.5L17 9" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (t === 'error')
    return (
      <svg {...common} aria-hidden>
        <circle cx="12" cy="12" r="10" fill="var(--au-danger)" />
        <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  if (t === 'warning')
    return (
      <svg {...common} aria-hidden>
        <circle cx="12" cy="12" r="10" fill="var(--au-warning)" />
        <path d="M12 7v6" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="12" cy="16.5" r="1.2" fill="#fff" />
      </svg>
    );
  return (
    <svg {...common} aria-hidden>
      <circle cx="12" cy="12" r="10" fill="var(--au-primary)" />
      <path d="M12 11v6" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="1.2" fill="#fff" />
    </svg>
  );
};

const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  description,
  showIcon,
  icon,
  closable,
  closeText,
  action,
  banner,
  className = '',
  style,
  onClose,
}) => {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  const hasTitle = title != null && description != null;
  const actualShowIcon = showIcon ?? (!!banner || !!description);
  const iconNode = icon ?? builtinIcon(type, hasTitle);

  const handleClose = (e: React.MouseEvent) => {
    onClose?.(e);
    if (!e.isDefaultPrevented()) setClosed(true);
  };

  const cls = [
    'au-alert',
    `au-alert--${type}`,
    hasTitle ? 'has-title' : '',
    banner ? 'is-banner' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div role="alert" className={cls} style={style}>
      {actualShowIcon && iconNode && <span className="au-alert__icon">{iconNode}</span>}
      <div className="au-alert__content">
        {title && <div className="au-alert__title">{title}</div>}
        {description && <div className="au-alert__desc">{description}</div>}
      </div>
      {action && <div className="au-alert__action">{action}</div>}
      {closable && (
        <button type="button" className="au-alert__close" onClick={handleClose} aria-label="关闭">
          {closeText ?? <CloseIcon />}
        </button>
      )}
    </div>
  );
};

export default Alert;
