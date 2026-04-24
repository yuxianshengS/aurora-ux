import React, {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import './Popconfirm.css';

export type PopconfirmPlacement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'
  | 'left'
  | 'right';

export interface PopconfirmProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  okType?: 'primary' | 'danger';
  icon?: React.ReactNode | null;
  placement?: PopconfirmPlacement;
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactElement;
}

const WarnIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
    <circle cx="12" cy="12" r="10" fill="var(--au-warning)" />
    <path d="M12 7v6" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="12" cy="16.5" r="1.2" fill="#fff" />
  </svg>
);

const Popconfirm: React.FC<PopconfirmProps> = ({
  title,
  description,
  okText = '确定',
  cancelText = '取消',
  okType = 'primary',
  icon,
  placement = 'top',
  open: controlledOpen,
  defaultOpen = false,
  disabled,
  onConfirm,
  onCancel,
  onOpenChange,
  children,
}) => {
  const isControlled = controlledOpen !== undefined;
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const open = isControlled ? controlledOpen! : innerOpen;
  const [loading, setLoading] = useState(false);

  const triggerRef = useRef<HTMLElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const setOpen = useCallback(
    (v: boolean) => {
      if (!isControlled) setInnerOpen(v);
      onOpenChange?.(v);
    },
    [isControlled, onOpenChange],
  );

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (popupRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open, setOpen]);

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      if (!triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      const pw = popupRef.current?.offsetWidth ?? 240;
      const ph = popupRef.current?.offsetHeight ?? 80;
      const gap = 8;
      let top = 0;
      let left = 0;
      if (placement.startsWith('top')) top = r.top - ph - gap;
      else if (placement.startsWith('bottom')) top = r.bottom + gap;
      else top = r.top + r.height / 2 - ph / 2;

      if (placement === 'left') left = r.left - pw - gap;
      else if (placement === 'right') left = r.right + gap;
      else if (placement === 'top' || placement === 'bottom') left = r.left + r.width / 2 - pw / 2;
      else if (placement === 'topLeft' || placement === 'bottomLeft') left = r.left;
      else if (placement === 'topRight' || placement === 'bottomRight') left = r.right - pw;

      left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
      top = Math.max(8, Math.min(top, window.innerHeight - ph - 8));
      setPos({ top, left });
    };
    update();
    const raf = requestAnimationFrame(update);
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, placement]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  const childProps = {
    ref: (node: HTMLElement) => {
      (triggerRef as React.MutableRefObject<HTMLElement | null>).current = node;
      const origRef = (children as any).ref;
      if (typeof origRef === 'function') origRef(node);
      else if (origRef && typeof origRef === 'object') origRef.current = node;
    },
    onClick: (e: React.MouseEvent) => {
      if (disabled) return;
      setOpen(!open);
      const orig = (children.props as { onClick?: (e: React.MouseEvent) => void }).onClick;
      orig?.(e);
    },
  };

  const trigger = isValidElement(children)
    ? cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, childProps)
    : null;

  const handleConfirm = async () => {
    if (!onConfirm) {
      setOpen(false);
      return;
    }
    const ret = onConfirm();
    if (ret && typeof (ret as Promise<void>).then === 'function') {
      setLoading(true);
      try {
        await ret;
        setOpen(false);
      } finally {
        setLoading(false);
      }
    } else {
      setOpen(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    setOpen(false);
  };

  const iconNode = icon === null ? null : icon ?? <WarnIcon />;

  return (
    <>
      {trigger}
      {open &&
        createPortal(
          <div
            ref={popupRef}
            className={['au-popconfirm', `au-popconfirm--${placement}`].join(' ')}
            style={{ position: 'fixed', top: pos.top, left: pos.left }}
            role="tooltip"
          >
            <div className="au-popconfirm__inner">
              <div className="au-popconfirm__head">
                {iconNode && <span className="au-popconfirm__icon">{iconNode}</span>}
                <div className="au-popconfirm__text">
                  <div className="au-popconfirm__title">{title}</div>
                  {description && <div className="au-popconfirm__desc">{description}</div>}
                </div>
              </div>
              <div className="au-popconfirm__actions">
                <button
                  type="button"
                  className="au-btn au-btn--default au-btn--small"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  className={[
                    'au-btn',
                    okType === 'danger' ? 'au-btn--danger' : 'au-btn--primary',
                    'au-btn--small',
                    loading ? 'is-loading' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={handleConfirm}
                  disabled={loading}
                >
                  {loading && <span className="au-btn__spinner" />}
                  {okText}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default Popconfirm;
