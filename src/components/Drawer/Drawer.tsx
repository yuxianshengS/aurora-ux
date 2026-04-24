import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './Drawer.css';

export type DrawerPlacement = 'top' | 'right' | 'bottom' | 'left';

export interface DrawerProps {
  open?: boolean;
  placement?: DrawerPlacement;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  closable?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  mask?: boolean;
  zIndex?: number;
  className?: string;
  bodyStyle?: React.CSSProperties;
  onClose?: () => void;
  afterClose?: () => void;
}

let dLockCount = 0;
let dSavedOverflow = '';
let dSavedPr = '';
const dLock = () => {
  if (dLockCount === 0) {
    const body = document.body;
    const sw = window.innerWidth - document.documentElement.clientWidth;
    dSavedOverflow = body.style.overflow;
    dSavedPr = body.style.paddingRight;
    body.style.overflow = 'hidden';
    if (sw > 0) body.style.paddingRight = `${sw}px`;
  }
  dLockCount++;
};
const dUnlock = () => {
  dLockCount = Math.max(0, dLockCount - 1);
  if (dLockCount === 0) {
    document.body.style.overflow = dSavedOverflow;
    document.body.style.paddingRight = dSavedPr;
  }
};

const CloseIcon: React.FC = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
    <path
      d="M4 4l8 8M12 4l-8 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const Drawer: React.FC<DrawerProps> = ({
  open = false,
  placement = 'right',
  title,
  children,
  footer,
  width = 360,
  height = 360,
  closable = true,
  maskClosable = true,
  keyboard = true,
  mask = true,
  zIndex = 1000,
  className = '',
  bodyStyle,
  onClose,
  afterClose,
}) => {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const locked = useRef(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      if (mask && !locked.current) {
        dLock();
        locked.current = true;
      }
      const t = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(t);
    } else if (mounted) {
      setVisible(false);
      const t = setTimeout(() => {
        setMounted(false);
        if (locked.current) {
          dUnlock();
          locked.current = false;
        }
        afterClose?.();
      }, 260);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(
    () => () => {
      if (locked.current) {
        dUnlock();
        locked.current = false;
      }
    },
    [],
  );

  useEffect(() => {
    if (!open || !keyboard) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, keyboard, onClose]);

  if (!mounted) return null;

  const isH = placement === 'left' || placement === 'right';
  const panelStyle: React.CSSProperties = isH ? { width } : { height };

  const cls = [
    'au-drawer',
    `au-drawer--${placement}`,
    visible ? 'is-visible' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return createPortal(
    <div className={cls} style={{ zIndex }}>
      {mask && (
        <div
          className="au-drawer__mask"
          onClick={() => {
            if (maskClosable) onClose?.();
          }}
        />
      )}
      <div
        className="au-drawer__panel"
        role="dialog"
        aria-modal="true"
        style={panelStyle}
      >
        {(title || closable) && (
          <div className="au-drawer__header">
            {title && <div className="au-drawer__title">{title}</div>}
            {closable && (
              <button
                type="button"
                className="au-drawer__close"
                onClick={() => onClose?.()}
                aria-label="关闭"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        )}
        <div className="au-drawer__body" style={bodyStyle}>
          {children}
        </div>
        {footer && <div className="au-drawer__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
};

export default Drawer;
