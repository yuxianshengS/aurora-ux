import React, { useEffect, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { createPortal } from 'react-dom';
import './Notification.css';

export type NotificationPlacement = 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';
export type NotificationType = 'info' | 'success' | 'error' | 'warning' | 'default';

export interface NotificationOptions {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  btn?: React.ReactNode;
  placement?: NotificationPlacement;
  duration?: number;
  closable?: boolean;
  key?: string | number;
  onClose?: () => void;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

interface NotiItem extends NotificationOptions {
  id: string;
  type: NotificationType;
  visible: boolean;
}

type Listener = (items: NotiItem[]) => void;

let items: NotiItem[] = [];
const listeners = new Set<Listener>();
let host: HTMLDivElement | null = null;
let root: Root | null = null;
let idSeed = 0;

const emit = () => listeners.forEach((l) => l(items));

const ensureHost = () => {
  if (host) return;
  host = document.createElement('div');
  host.className = 'au-notification-host';
  document.body.appendChild(host);
  root = createRoot(host);
  root.render(<Container />);
};

const CloseIcon: React.FC = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
    <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const defaultIcon = (t: NotificationType): React.ReactNode => {
  if (t === 'success')
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
        <circle cx="12" cy="12" r="10" fill="var(--au-success)" />
        <path d="M7 12l3.5 3.5L17 9" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (t === 'error')
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
        <circle cx="12" cy="12" r="10" fill="var(--au-danger)" />
        <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  if (t === 'warning')
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
        <circle cx="12" cy="12" r="10" fill="var(--au-warning)" />
        <path d="M12 7v6" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="12" cy="16.5" r="1.2" fill="#fff" />
      </svg>
    );
  if (t === 'info')
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
        <circle cx="12" cy="12" r="10" fill="var(--au-primary)" />
        <path d="M12 11v6" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="12" cy="7.5" r="1.2" fill="#fff" />
      </svg>
    );
  return null;
};

const Card: React.FC<{ item: NotiItem; onClose: (id: string) => void }> = ({ item, onClose }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(r);
  }, []);

  useEffect(() => {
    if (!show) return;
    const d = item.duration ?? 4500;
    if (d <= 0) return;
    const t = setTimeout(() => onClose(item.id), d);
    return () => clearTimeout(t);
  }, [show, item.duration, item.id, onClose]);

  const icon = item.icon ?? defaultIcon(item.type);

  return (
    <div
      className={['au-noti__item', show && item.visible ? 'is-visible' : '', item.className ?? ''].filter(Boolean).join(' ')}
      style={item.style}
      onClick={item.onClick}
      role="alert"
    >
      {icon && <div className="au-noti__icon">{icon}</div>}
      <div className="au-noti__main">
        {item.title && <div className="au-noti__title">{item.title}</div>}
        {item.description && <div className="au-noti__desc">{item.description}</div>}
        {item.btn && <div className="au-noti__btn">{item.btn}</div>}
      </div>
      {item.closable !== false && (
        <button
          type="button"
          className="au-noti__close"
          onClick={(e) => {
            e.stopPropagation();
            onClose(item.id);
          }}
          aria-label="关闭"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
};

const placementList: NotificationPlacement[] = ['topRight', 'topLeft', 'bottomRight', 'bottomLeft'];

const Container: React.FC = () => {
  const [list, setList] = useState<NotiItem[]>(items);
  useEffect(() => {
    const l: Listener = (next) => setList([...next]);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const closeItem = (id: string) => {
    const it = items.find((i) => i.id === id);
    if (!it) return;
    it.visible = false;
    items = [...items];
    emit();
    setTimeout(() => {
      items = items.filter((i) => i.id !== id);
      emit();
      it.onClose?.();
    }, 260);
  };

  return (
    <>
      {placementList.map((p) => {
        const group = list.filter((i) => (i.placement ?? 'topRight') === p);
        if (group.length === 0) return null;
        return createPortal(
          <div key={p} className={`au-noti au-noti--${p}`}>
            {group.map((it) => (
              <Card key={it.id} item={it} onClose={closeItem} />
            ))}
          </div>,
          document.body,
        );
      })}
    </>
  );
};

const openNoti = (type: NotificationType, opts: NotificationOptions) => {
  ensureHost();
  if (opts.key != null) {
    const existing = items.find((i) => i.id === String(opts.key));
    if (existing) {
      Object.assign(existing, opts, { type });
      items = [...items];
      emit();
      return () => closeById(existing.id);
    }
  }
  const id = opts.key != null ? String(opts.key) : `noti-${++idSeed}`;
  const item: NotiItem = {
    ...opts,
    id,
    type,
    visible: true,
  };
  items = [...items, item];
  emit();
  return () => closeById(id);
};

const closeById = (id: string) => {
  const it = items.find((i) => i.id === id);
  if (!it) return;
  it.visible = false;
  items = [...items];
  emit();
  setTimeout(() => {
    items = items.filter((i) => i.id !== id);
    emit();
    it.onClose?.();
  }, 260);
};

const notification = {
  open: (opts: NotificationOptions) => openNoti('default', opts),
  info: (opts: NotificationOptions) => openNoti('info', opts),
  success: (opts: NotificationOptions) => openNoti('success', opts),
  error: (opts: NotificationOptions) => openNoti('error', opts),
  warning: (opts: NotificationOptions) => openNoti('warning', opts),
  destroy: (key?: string | number) => {
    if (key != null) {
      closeById(String(key));
      return;
    }
    items.map((i) => i.id).forEach(closeById);
  },
};

export default notification;
