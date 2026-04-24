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
import './Dropdown.css';

export type DropdownPlacement =
  | 'bottomLeft'
  | 'bottom'
  | 'bottomRight'
  | 'topLeft'
  | 'top'
  | 'topRight';

export type DropdownTrigger = 'click' | 'hover';

export type DropdownItem =
  | {
      key: string;
      label: React.ReactNode;
      icon?: React.ReactNode;
      disabled?: boolean;
      danger?: boolean;
      type?: undefined;
      onClick?: () => void;
    }
  | { type: 'divider'; key?: string };

export interface DropdownProps {
  menu: { items: DropdownItem[]; onClick?: (info: { key: string }) => void };
  trigger?: DropdownTrigger | DropdownTrigger[];
  placement?: DropdownPlacement;
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  arrow?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactElement;
}

const isDivider = (i: DropdownItem): i is Extract<DropdownItem, { type: 'divider' }> =>
  (i as any).type === 'divider';

const Dropdown: React.FC<DropdownProps> = ({
  menu,
  trigger = 'hover',
  placement = 'bottomLeft',
  open: ctrl,
  defaultOpen = false,
  disabled,
  arrow,
  onOpenChange,
  children,
}) => {
  const triggers = Array.isArray(trigger) ? trigger : [trigger];
  const isCtrl = ctrl !== undefined;
  const [inner, setInner] = useState(defaultOpen);
  const open = isCtrl ? ctrl! : inner;

  const triggerRef = useRef<HTMLElement | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });
  const hoverTimer = useRef<number | null>(null);

  const setOpen = useCallback(
    (v: boolean) => {
      if (!isCtrl) setInner(v);
      onOpenChange?.(v);
    },
    [isCtrl, onOpenChange],
  );

  // close on outside
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

  // positioning
  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      if (!triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      const pw = popupRef.current?.offsetWidth ?? 200;
      const ph = popupRef.current?.offsetHeight ?? 200;
      const gap = 4;
      let top = 0;
      let left = 0;
      if (placement.startsWith('bottom')) top = r.bottom + gap;
      else top = r.top - ph - gap;
      if (placement === 'bottom' || placement === 'top') left = r.left + r.width / 2 - pw / 2;
      else if (placement === 'bottomLeft' || placement === 'topLeft') left = r.left;
      else left = r.right - pw;
      left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
      top = Math.max(8, Math.min(top, window.innerHeight - ph - 8));
      setPos({ top, left, width: r.width });
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

  const pickItem = (it: DropdownItem) => {
    if (isDivider(it)) return;
    if (it.disabled) return;
    it.onClick?.();
    menu.onClick?.({ key: it.key });
    setOpen(false);
  };

  const assignTriggerRef = (node: HTMLElement | null) => {
    triggerRef.current = node;
    const origRef = (children as any).ref;
    if (typeof origRef === 'function') origRef(node);
    else if (origRef && typeof origRef === 'object') origRef.current = node;
  };

  const clearHoverTimer = () => {
    if (hoverTimer.current != null) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const childProps: Record<string, unknown> = {
    ref: assignTriggerRef,
  };

  if (triggers.includes('click')) {
    childProps.onClick = (e: React.MouseEvent) => {
      if (disabled) return;
      setOpen(!open);
      (children.props as { onClick?: (e: React.MouseEvent) => void }).onClick?.(e);
    };
  }
  if (triggers.includes('hover')) {
    childProps.onMouseEnter = () => {
      if (disabled) return;
      clearHoverTimer();
      setOpen(true);
    };
    childProps.onMouseLeave = () => {
      clearHoverTimer();
      hoverTimer.current = window.setTimeout(() => setOpen(false), 120);
    };
  }

  const triggerEl = isValidElement(children)
    ? cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, childProps)
    : null;

  return (
    <>
      {triggerEl}
      {open &&
        createPortal(
          <div
            ref={popupRef}
            className={['au-dropdown', `au-dropdown--${placement}`].join(' ')}
            style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: Math.max(120, pos.width) }}
            onMouseEnter={() => {
              if (triggers.includes('hover')) clearHoverTimer();
            }}
            onMouseLeave={() => {
              if (triggers.includes('hover')) {
                clearHoverTimer();
                hoverTimer.current = window.setTimeout(() => setOpen(false), 120);
              }
            }}
          >
            {arrow && <span className="au-dropdown__arrow" />}
            <ul className="au-dropdown__list" role="menu">
              {menu.items.map((it, idx) => {
                if (isDivider(it)) {
                  return <li key={it.key ?? `d-${idx}`} className="au-dropdown__divider" role="separator" />;
                }
                const cls = [
                  'au-dropdown__item',
                  it.disabled ? 'is-disabled' : '',
                  it.danger ? 'is-danger' : '',
                ]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <li
                    key={it.key}
                    className={cls}
                    role="menuitem"
                    aria-disabled={it.disabled || undefined}
                    onClick={() => pickItem(it)}
                  >
                    {it.icon && <span className="au-dropdown__icon">{it.icon}</span>}
                    <span className="au-dropdown__label">{it.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body,
        )}
    </>
  );
};

export default Dropdown;
