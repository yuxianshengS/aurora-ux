import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { useReactivePosition } from '../../hooks/useReactivePosition';
import './Tooltip.css';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
export type TooltipTrigger = 'hover' | 'focus' | 'click';

export interface TooltipProps {
  /** 气泡内容 */
  title: React.ReactNode;
  /** 触发元素 */
  children: React.ReactNode;
  /** 位置 */
  placement?: TooltipPlacement;
  /** 气泡背景色(覆盖默认 token) */
  background?: string;
  /** 气泡文字色(覆盖默认 token) */
  color?: string;
  /** 受控显示 */
  open?: boolean;
  /** 非受控默认显示 */
  defaultOpen?: boolean;
  /** 触发方式; 默认 'hover'(同时含 focus, 兼容键盘) */
  trigger?: TooltipTrigger | TooltipTrigger[];
  /** 鼠标进入后多少 ms 才显示, 默认 100 */
  mouseEnterDelay?: number;
  /** 鼠标离开后多少 ms 才隐藏, 默认 100 */
  mouseLeaveDelay?: number;
  /** 是否显示箭头 */
  arrow?: boolean;
  /** 打开时是否播放抖动动画 */
  shake?: boolean;
  /** 气泡最大宽度 */
  maxWidth?: number | string;
  /** 受控时的显隐回调 */
  onOpenChange?: (open: boolean) => void;
  /** 是否禁用 */
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface Pos {
  top: number;
  left: number;
}

const computePos = (
  triggerRect: DOMRect,
  bubble: HTMLElement,
  placement: TooltipPlacement,
  gap: number,
): Pos => {
  const bw = bubble.offsetWidth;
  const bh = bubble.offsetHeight;
  switch (placement) {
    case 'top':
      return {
        top: triggerRect.top - bh - gap,
        left: triggerRect.left + triggerRect.width / 2 - bw / 2,
      };
    case 'bottom':
      return {
        top: triggerRect.bottom + gap,
        left: triggerRect.left + triggerRect.width / 2 - bw / 2,
      };
    case 'left':
      return {
        top: triggerRect.top + triggerRect.height / 2 - bh / 2,
        left: triggerRect.left - bw - gap,
      };
    case 'right':
      return {
        top: triggerRect.top + triggerRect.height / 2 - bh / 2,
        left: triggerRect.right + gap,
      };
  }
};

const Tooltip = React.forwardRef<HTMLSpanElement, TooltipProps>(
  (
    {
      title,
      children,
      placement = 'top',
      background,
      color,
      open,
      defaultOpen = false,
      trigger = 'hover',
      mouseEnterDelay = 100,
      mouseLeaveDelay = 100,
      arrow = true,
      shake = false,
      maxWidth,
      onOpenChange,
      disabled,
      className = '',
      style,
    },
    ref,
  ) => {
    const [innerOpen, setInnerOpen] = useState(defaultOpen);
    const isControlled = open !== undefined;
    const visible = (isControlled ? open! : innerOpen) && !disabled;
    const tooltipId = useId();

    const triggers = Array.isArray(trigger) ? trigger : [trigger];
    const isHover = triggers.includes('hover');
    const isFocus = triggers.includes('focus') || triggers.includes('hover'); // hover 默认带 focus(键盘)
    const isClick = triggers.includes('click');

    const triggerRef = useRef<HTMLSpanElement>(null);
    const bubbleRef = useRef<HTMLDivElement>(null);
    const enterTimer = useRef<number | null>(null);
    const leaveTimer = useRef<number | null>(null);
    const [pos, setPos] = useState<Pos>({ top: -9999, left: -9999 });

    const setOpen = useCallback(
      (next: boolean) => {
        if (!isControlled) setInnerOpen(next);
        onOpenChange?.(next);
      },
      [isControlled, onOpenChange],
    );

    const clearTimers = () => {
      if (enterTimer.current != null) {
        window.clearTimeout(enterTimer.current);
        enterTimer.current = null;
      }
      if (leaveTimer.current != null) {
        window.clearTimeout(leaveTimer.current);
        leaveTimer.current = null;
      }
    };

    const scheduleShow = () => {
      clearTimers();
      enterTimer.current = window.setTimeout(() => setOpen(true), mouseEnterDelay);
    };
    const scheduleHide = () => {
      clearTimers();
      leaveTimer.current = window.setTimeout(() => setOpen(false), mouseLeaveDelay);
    };

    // 卸载清理
    useEffect(() => () => clearTimers(), []);

    // 计算位置(打开时 / 滚动时 / 缩放时)
    useReactivePosition(visible, () => {
      const trig = triggerRef.current;
      const bub = bubbleRef.current;
      if (!trig || !bub) return;
      const r = trig.getBoundingClientRect();
      setPos(computePos(r, bub, placement, 10));
    }, [placement, title]);

    // click 模式: 点击外部关闭
    useOutsideClick([triggerRef, bubbleRef], () => setOpen(false), isClick && visible);

    // ESC 关闭
    useEffect(() => {
      if (!visible) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
      };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }, [visible, setOpen]);

    const triggerHandlers: React.HTMLAttributes<HTMLSpanElement> = {};
    if (isHover) {
      triggerHandlers.onMouseEnter = scheduleShow;
      triggerHandlers.onMouseLeave = scheduleHide;
    }
    if (isFocus) {
      triggerHandlers.onFocus = () => setOpen(true);
      triggerHandlers.onBlur = () => setOpen(false);
    }
    if (isClick) {
      triggerHandlers.onClick = () => setOpen(!visible);
    }

    const bubbleStyle: React.CSSProperties = {
      ...(background ? { ['--au-tooltip-bg' as string]: background } : {}),
      ...(color ? { ['--au-tooltip-color' as string]: color } : {}),
      ...(maxWidth
        ? {
            ['--au-tooltip-max-w' as string]:
              typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
          }
        : {}),
      top: pos.top,
      left: pos.left,
      ...style,
    };

    const setSpanRef = (node: HTMLSpanElement | null) => {
      (triggerRef as React.MutableRefObject<HTMLSpanElement | null>).current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLSpanElement | null>).current = node;
    };

    return (
      <>
        <span
          ref={setSpanRef}
          className={['au-tooltip-trigger', className].filter(Boolean).join(' ')}
          aria-describedby={visible ? tooltipId : undefined}
          // hover 模式让气泡和 trigger 间不会被视为离开 — 使用延迟缓冲
          {...triggerHandlers}
        >
          {children}
        </span>
        {visible &&
          typeof document !== 'undefined' &&
          createPortal(
            <div
              ref={bubbleRef}
              id={tooltipId}
              role="tooltip"
              className={[
                'au-tooltip-bubble',
                `au-tooltip-bubble--${placement}`,
                shake ? 'au-tooltip-bubble--shake' : '',
                'is-open',
              ]
                .filter(Boolean)
                .join(' ')}
              style={bubbleStyle}
              onMouseEnter={isHover ? clearTimers : undefined}
              onMouseLeave={isHover ? scheduleHide : undefined}
            >
              {title}
              {arrow && <span className="au-tooltip-bubble__arrow" aria-hidden />}
            </div>,
            document.body,
          )}
      </>
    );
  },
);
Tooltip.displayName = 'Tooltip';

export default Tooltip;
