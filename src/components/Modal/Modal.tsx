import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { confirm, info, success, error, warning } from './confirm';
import './Modal.css';

export interface ModalProps {
  open?: boolean;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode | null;
  width?: number | string;
  closable?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  centered?: boolean;
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  okButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  cancelButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  confirmLoading?: boolean;
  zIndex?: number;
  className?: string;
  bodyStyle?: React.CSSProperties;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
  afterClose?: () => void;
}

let scrollLockCount = 0;
let savedOverflow = '';
let savedPaddingRight = '';

const lockScroll = () => {
  if (scrollLockCount === 0) {
    const body = document.body;
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    savedOverflow = body.style.overflow;
    savedPaddingRight = body.style.paddingRight;
    body.style.overflow = 'hidden';
    if (scrollbarW > 0) {
      body.style.paddingRight = `${scrollbarW}px`;
    }
  }
  scrollLockCount++;
};

const unlockScroll = () => {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.overflow = savedOverflow;
    document.body.style.paddingRight = savedPaddingRight;
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

const Modal: React.FC<ModalProps> & {
  confirm: typeof confirm;
  info: typeof info;
  success: typeof success;
  error: typeof error;
  warning: typeof warning;
} = ({
  open = false,
  title,
  children,
  footer,
  width = 520,
  closable = true,
  maskClosable = true,
  keyboard = true,
  centered,
  okText = '确定',
  cancelText = '取消',
  okButtonProps,
  cancelButtonProps,
  confirmLoading,
  zIndex = 1000,
  className = '',
  bodyStyle,
  onOk,
  onCancel,
  afterClose,
}) => {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const locked = useRef(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      if (!locked.current) {
        lockScroll();
        locked.current = true;
      }
      const t = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(t);
    } else if (mounted) {
      setVisible(false);
      const t = setTimeout(() => {
        setMounted(false);
        if (locked.current) {
          unlockScroll();
          locked.current = false;
        }
        afterClose?.();
      }, 220);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    return () => {
      if (locked.current) {
        unlockScroll();
        locked.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (!open || !keyboard) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, keyboard, onCancel]);

  if (!mounted) return null;

  const handleOk = async () => {
    const ret = onOk?.();
    if (ret && typeof (ret as Promise<void>).then === 'function') {
      await ret;
    }
  };

  const cls = [
    'au-modal',
    visible ? 'is-visible' : '',
    centered ? 'is-centered' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return createPortal(
    <div className={cls} style={{ zIndex }}>
      <div
        className="au-modal__mask"
        onClick={() => {
          if (maskClosable) onCancel?.();
        }}
      />
      <div className="au-modal__wrap" onClick={(e) => {
        if (e.target === e.currentTarget && maskClosable) onCancel?.();
      }}>
        <div
          role="dialog"
          aria-modal="true"
          className="au-modal__panel"
          style={{ width }}
          onClick={(e) => e.stopPropagation()}
        >
          {(title || closable) && (
            <div className="au-modal__header">
              {title && <div className="au-modal__title">{title}</div>}
              {closable && (
                <button
                  type="button"
                  className="au-modal__close"
                  onClick={() => onCancel?.()}
                  aria-label="关闭"
                >
                  <CloseIcon />
                </button>
              )}
            </div>
          )}
          <div className="au-modal__body" style={bodyStyle}>
            {children}
          </div>
          {footer !== null && (
            <div className="au-modal__footer">
              {footer !== undefined ? (
                footer
              ) : (
                <>
                  <button
                    type="button"
                    className="au-btn au-btn--default au-btn--medium"
                    onClick={() => onCancel?.()}
                    {...cancelButtonProps}
                  >
                    {cancelText}
                  </button>
                  <button
                    type="button"
                    className={[
                      'au-btn',
                      'au-btn--primary',
                      'au-btn--medium',
                      confirmLoading ? 'is-loading' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={handleOk}
                    disabled={confirmLoading}
                    {...okButtonProps}
                  >
                    {confirmLoading && <span className="au-btn__spinner" />}
                    {okText}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

Modal.confirm = confirm;
Modal.info = info;
Modal.success = success;
Modal.error = error;
Modal.warning = warning;

export default Modal;
