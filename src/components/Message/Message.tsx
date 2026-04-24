import React, { useEffect, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { createPortal } from 'react-dom';
import './Message.css';

export type MessageType = 'info' | 'success' | 'error' | 'warning' | 'loading';

export interface MessageOptions {
  content: React.ReactNode;
  duration?: number;
  key?: string | number;
  onClose?: () => void;
  icon?: React.ReactNode;
}

interface MessageItem {
  id: string;
  type: MessageType;
  content: React.ReactNode;
  duration: number;
  onClose?: () => void;
  icon?: React.ReactNode;
  visible: boolean;
}

type Listener = (items: MessageItem[]) => void;

let items: MessageItem[] = [];
const listeners = new Set<Listener>();
let host: HTMLDivElement | null = null;
let root: Root | null = null;
let idSeed = 0;

const emit = () => {
  listeners.forEach((l) => l(items));
};

const ensureHost = () => {
  if (host) return;
  host = document.createElement('div');
  host.className = 'au-message-host';
  document.body.appendChild(host);
  root = createRoot(host);
  root.render(<Container />);
};

const defaultIcon = (t: MessageType): React.ReactNode => {
  if (t === 'success')
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
        <circle cx="12" cy="12" r="10" fill="var(--au-success)" />
        <path d="M7 12l3.5 3.5L17 9" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (t === 'error')
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
        <circle cx="12" cy="12" r="10" fill="var(--au-danger)" />
        <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  if (t === 'warning')
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
        <circle cx="12" cy="12" r="10" fill="var(--au-warning)" />
        <path d="M12 7v6" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="12" cy="16.5" r="1.2" fill="#fff" />
      </svg>
    );
  if (t === 'loading')
    return <span className="au-message__spinner" />;
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="var(--au-primary)" />
      <path d="M12 11v6" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="1.2" fill="#fff" />
    </svg>
  );
};

const MessageCard: React.FC<{ item: MessageItem; onClose: (id: string) => void }> = ({ item, onClose }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    if (!show) return;
    if (item.duration <= 0) return;
    const t = setTimeout(() => onClose(item.id), item.duration);
    return () => clearTimeout(t);
  }, [show, item.duration, item.id, onClose]);

  return (
    <div className={['au-message__item', `au-message__item--${item.type}`, show && item.visible ? 'is-visible' : ''].filter(Boolean).join(' ')}>
      <span className="au-message__icon">{item.icon ?? defaultIcon(item.type)}</span>
      <span className="au-message__content">{item.content}</span>
    </div>
  );
};

const Container: React.FC = () => {
  const [list, setList] = useState<MessageItem[]>(items);
  useEffect(() => {
    const l: Listener = (next) => setList([...next]);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const closeItem = (id: string) => {
    const idx = items.findIndex((i) => i.id === id);
    if (idx < 0) return;
    const it = items[idx];
    it.visible = false;
    items = [...items];
    emit();
    setTimeout(() => {
      items = items.filter((i) => i.id !== id);
      emit();
      it.onClose?.();
    }, 220);
  };

  return createPortal(
    <div className="au-message">
      {list.map((item) => (
        <MessageCard key={item.id} item={item} onClose={closeItem} />
      ))}
    </div>,
    document.body,
  );
};

const openMessage = (type: MessageType, opts: MessageOptions | React.ReactNode): () => void => {
  ensureHost();
  const normalized: MessageOptions =
    typeof opts === 'string' || React.isValidElement(opts) || typeof opts === 'number'
      ? { content: opts as React.ReactNode }
      : (opts as MessageOptions);

  // Dedup by key: replace existing one
  if (normalized.key != null) {
    const existing = items.find((i) => i.id === String(normalized.key));
    if (existing) {
      existing.content = normalized.content;
      existing.type = type;
      existing.duration = normalized.duration ?? (type === 'loading' ? 0 : 3000);
      existing.onClose = normalized.onClose;
      existing.icon = normalized.icon;
      items = [...items];
      emit();
      return () => closeById(existing.id);
    }
  }

  const id = normalized.key != null ? String(normalized.key) : `msg-${++idSeed}`;
  const item: MessageItem = {
    id,
    type,
    content: normalized.content,
    duration: normalized.duration ?? (type === 'loading' ? 0 : 3000),
    onClose: normalized.onClose,
    icon: normalized.icon,
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
  }, 220);
};

const message = {
  info: (opts: MessageOptions | React.ReactNode) => openMessage('info', opts),
  success: (opts: MessageOptions | React.ReactNode) => openMessage('success', opts),
  error: (opts: MessageOptions | React.ReactNode) => openMessage('error', opts),
  warning: (opts: MessageOptions | React.ReactNode) => openMessage('warning', opts),
  loading: (opts: MessageOptions | React.ReactNode) => openMessage('loading', opts),
  destroy: (key?: string | number) => {
    if (key != null) {
      closeById(String(key));
      return;
    }
    const ids = items.map((i) => i.id);
    ids.forEach(closeById);
  },
};

export default message;
