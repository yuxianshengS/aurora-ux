import React, { useState } from 'react';
import './Tag.css';

export type TagPreset =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'magenta'
  | 'cyan';

export interface TagProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'onClose'> {
  color?: TagPreset | string;
  bordered?: boolean;
  closable?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const presets = new Set<TagPreset>([
  'default',
  'primary',
  'success',
  'warning',
  'danger',
  'info',
  'purple',
  'magenta',
  'cyan',
]);

const CloseIcon: React.FC = () => (
  <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden>
    <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const Tag: React.FC<TagProps> = ({
  color,
  bordered = true,
  closable,
  icon,
  children,
  onClose,
  className = '',
  style,
  ...rest
}) => {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  const isPreset = color && presets.has(color as TagPreset);
  const presetCls = isPreset ? `au-tag--${color}` : '';

  const customStyle: React.CSSProperties | undefined =
    color && !isPreset
      ? ({
          ['--au-tag-color' as string]: color,
          ...style,
        } as React.CSSProperties)
      : style;

  const cls = [
    'au-tag',
    presetCls,
    bordered ? 'is-bordered' : 'is-solid',
    color && !isPreset ? 'au-tag--custom' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClose?.(e);
    if (!e.isDefaultPrevented()) setClosed(true);
  };

  return (
    <span className={cls} style={customStyle} {...rest}>
      {icon && <span className="au-tag__icon">{icon}</span>}
      <span className="au-tag__label">{children}</span>
      {closable && (
        <button
          type="button"
          className="au-tag__close"
          onClick={handleClose}
          aria-label="关闭"
        >
          <CloseIcon />
        </button>
      )}
    </span>
  );
};

export default Tag;
