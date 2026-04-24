import React, { useEffect, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { createPortal } from 'react-dom';

export type ConfirmType = 'confirm' | 'info' | 'success' | 'error' | 'warning';

export interface ConfirmOptions {
  title?: React.ReactNode;
  content?: React.ReactNode;
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  centered?: boolean;
  maskClosable?: boolean;
  width?: number | string;
  zIndex?: number;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface ConfirmHandle {
  destroy: () => void;
}

const iconFor = (t: ConfirmType): React.ReactNode => {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24' };
  if (t === 'success') {
    return (
      <svg {...common} aria-hidden>
        <circle cx="12" cy="12" r="10" fill="var(--au-success)" />
        <path
          d="M7 12l3.5 3.5L17 9"
          fill="none"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (t === 'error') {
    return (
      <svg {...common} aria-hidden>
        <circle cx="12" cy="12" r="10" fill="var(--au-danger)" />
        <path
          d="M8.5 8.5l7 7M15.5 8.5l-7 7"
          fill="none"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (t === 'warning' || t === 'confirm') {
    return (
      <svg {...common} aria-hidden>
        <circle cx="12" cy="12" r="10" fill="var(--au-warning)" />
        <path
          d="M12 7v6"
          fill="none"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="16.5" r="1.2" fill="#fff" />
      </svg>
    );
  }
  return (
    <svg {...common} aria-hidden>
      <circle cx="12" cy="12" r="10" fill="var(--au-primary)" />
      <path
        d="M12 11v6"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="7.5" r="1.2" fill="#fff" />
    </svg>
  );
};

interface ConfirmViewProps {
  type: ConfirmType;
  opts: ConfirmOptions;
  onClose: () => void;
}

const ConfirmView: React.FC<ConfirmViewProps> = ({ type, opts, onClose }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const doClose = () => {
    setOpen(false);
    setTimeout(onClose, 220);
  };

  const handleOk = async () => {
    if (opts.onOk) {
      const ret = opts.onOk();
      if (ret && typeof (ret as Promise<void>).then === 'function') {
        setLoading(true);
        try {
          await ret;
        } finally {
          setLoading(false);
        }
      }
    }
    doClose();
  };

  const handleCancel = () => {
    opts.onCancel?.();
    doClose();
  };

  const showCancel = type === 'confirm';

  return createPortal(
    <div
      className={[
        'au-modal',
        open ? 'is-visible' : '',
        opts.centered ? 'is-centered' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ zIndex: opts.zIndex ?? 1000 }}
    >
      <div
        className="au-modal__mask"
        onClick={() => {
          if (opts.maskClosable && !loading) handleCancel();
        }}
      />
      <div className="au-modal__wrap">
        <div
          role="dialog"
          aria-modal="true"
          className="au-modal__panel au-modal__panel--confirm"
          style={{ width: opts.width ?? 420 }}
        >
          <div className="au-modal__confirm-body">
            <div className="au-modal__confirm-icon">{iconFor(type)}</div>
            <div className="au-modal__confirm-text">
              {opts.title && <div className="au-modal__confirm-title">{opts.title}</div>}
              {opts.content && <div className="au-modal__confirm-content">{opts.content}</div>}
            </div>
          </div>
          <div className="au-modal__footer">
            {showCancel && (
              <button
                type="button"
                className="au-btn au-btn--default au-btn--medium"
                onClick={handleCancel}
                disabled={loading}
              >
                {opts.cancelText ?? '取消'}
              </button>
            )}
            <button
              type="button"
              className={['au-btn', 'au-btn--primary', 'au-btn--medium', loading ? 'is-loading' : ''].filter(Boolean).join(' ')}
              onClick={handleOk}
              disabled={loading}
            >
              {loading && <span className="au-btn__spinner" />}
              {opts.okText ?? '确定'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const openConfirm = (type: ConfirmType, opts: ConfirmOptions = {}): ConfirmHandle => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root: Root = createRoot(host);

  let closed = false;
  const destroy = () => {
    if (closed) return;
    closed = true;
    root.unmount();
    if (host.parentNode) host.parentNode.removeChild(host);
  };

  root.render(<ConfirmView type={type} opts={opts} onClose={destroy} />);

  return { destroy };
};

export const confirm = (opts: ConfirmOptions) => openConfirm('confirm', opts);
export const info = (opts: ConfirmOptions) => openConfirm('info', opts);
export const success = (opts: ConfirmOptions) => openConfirm('success', opts);
export const error = (opts: ConfirmOptions) => openConfirm('error', opts);
export const warning = (opts: ConfirmOptions) => openConfirm('warning', opts);
