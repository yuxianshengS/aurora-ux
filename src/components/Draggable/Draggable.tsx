import React, { useCallback, useEffect, useRef, useState } from 'react';
import './Draggable.css';

export interface Position {
  x: number;
  y: number;
}

export type DragAxis = 'x' | 'y' | 'both';

export type DragBounds =
  | 'window'
  | 'parent'
  | { left?: number; top?: number; right?: number; bottom?: number };

export interface DraggableProps {
  children: React.ReactNode;
  /** 非受控初始偏移 */
  defaultPosition?: Position;
  /** 受控位置; 传入后 onChange 由父组件处理 */
  position?: Position;
  /** 位置变化 (拖拽中持续触发) */
  onChange?: (pos: Position) => void;
  /** 拖拽开始 */
  onStart?: (pos: Position) => void;
  /** 拖拽结束 */
  onEnd?: (pos: Position) => void;
  /** 轴向锁定 */
  axis?: DragAxis;
  /** 拖拽范围; 'parent' 要求父容器 position 非 static */
  bounds?: DragBounds;
  /** 拖拽把手 CSS 选择器; 不传则整个元素可拖 */
  handle?: string;
  /** 禁用拖拽 */
  disabled?: boolean;
  /** 网格吸附 [x, y] */
  grid?: [number, number];
  className?: string;
  style?: React.CSSProperties;
}

const clamp = (n: number, min: number, max: number) =>
  max < min ? min : Math.max(min, Math.min(max, n));

interface BoundRange {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

const computeBounds = (
  bounds: DragBounds | undefined,
  node: HTMLElement,
  startPos: Position
): BoundRange | null => {
  if (!bounds) return null;
  const rect = node.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  // 元素在 translate 为 0 时的视口坐标
  const natLeft = rect.left - startPos.x;
  const natTop = rect.top - startPos.y;

  if (bounds === 'window') {
    return {
      minX: -natLeft,
      maxX: window.innerWidth - natLeft - w,
      minY: -natTop,
      maxY: window.innerHeight - natTop - h,
    };
  }
  if (bounds === 'parent') {
    const parent = node.offsetParent as HTMLElement | null;
    if (!parent) return null;
    const p = parent.getBoundingClientRect();
    return {
      minX: p.left - natLeft,
      maxX: p.right - natLeft - w,
      minY: p.top - natTop,
      maxY: p.bottom - natTop - h,
    };
  }
  // 显式对象: 数值直接作为 translate 范围限制
  return {
    minX: bounds.left ?? -Infinity,
    maxX: bounds.right ?? Infinity,
    minY: bounds.top ?? -Infinity,
    maxY: bounds.bottom ?? Infinity,
  };
};

const Draggable: React.FC<DraggableProps> = ({
  children,
  defaultPosition = { x: 0, y: 0 },
  position,
  onChange,
  onStart,
  onEnd,
  axis = 'both',
  bounds,
  handle,
  disabled = false,
  grid,
  className = '',
  style,
}) => {
  const isControlled = position !== undefined;
  const [inner, setInner] = useState<Position>(defaultPosition);
  const current = isControlled ? (position as Position) : inner;

  const [dragging, setDragging] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef(current);
  currentRef.current = current;

  const stopCleanupRef = useRef<(() => void) | null>(null);

  useEffect(
    () => () => {
      stopCleanupRef.current?.();
    },
    []
  );

  const matchHandle = (target: EventTarget | null): boolean => {
    if (!handle) return true;
    if (!(target instanceof Element)) return false;
    return !!target.closest(handle);
  };

  const beginDrag = useCallback(
    (clientX: number, clientY: number, ev: Event) => {
      if (disabled) return;
      const node = nodeRef.current;
      if (!node) return;

      const startPos = currentRef.current;
      const range = computeBounds(bounds, node, startPos);

      ev.preventDefault();
      setDragging(true);
      onStart?.(startPos);

      const prevUserSelect = document.body.style.userSelect;
      document.body.style.userSelect = 'none';

      let latest = startPos;

      const move = (x: number, y: number) => {
        let dx = x - clientX;
        let dy = y - clientY;
        if (axis === 'x') dy = 0;
        if (axis === 'y') dx = 0;
        let nx = startPos.x + dx;
        let ny = startPos.y + dy;
        if (grid) {
          nx = Math.round(nx / grid[0]) * grid[0];
          ny = Math.round(ny / grid[1]) * grid[1];
        }
        if (range) {
          nx = clamp(nx, range.minX, range.maxX);
          ny = clamp(ny, range.minY, range.maxY);
        }
        const next = { x: nx, y: ny };
        latest = next;
        if (!isControlled) setInner(next);
        onChange?.(next);
      };

      const onMouseMove = (e: MouseEvent) => move(e.clientX, e.clientY);
      const onTouchMove = (e: TouchEvent) => {
        if (!e.touches[0]) return;
        move(e.touches[0].clientX, e.touches[0].clientY);
      };

      const cleanup = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onEndEvt);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onEndEvt);
        window.removeEventListener('touchcancel', onEndEvt);
        document.body.style.userSelect = prevUserSelect;
        stopCleanupRef.current = null;
      };

      const onEndEvt = () => {
        cleanup();
        setDragging(false);
        onEnd?.(latest);
      };

      stopCleanupRef.current = cleanup;
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onEndEvt);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onEndEvt);
      window.addEventListener('touchcancel', onEndEvt);
    },
    [axis, bounds, disabled, grid, isControlled, onChange, onEnd, onStart]
  );

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (!matchHandle(e.target)) return;
    beginDrag(e.clientX, e.clientY, e.nativeEvent);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (!e.touches[0]) return;
    if (!matchHandle(e.target)) return;
    beginDrag(e.touches[0].clientX, e.touches[0].clientY, e.nativeEvent);
  };

  return (
    <div
      ref={nodeRef}
      className={[
        'au-draggable',
        dragging ? 'is-dragging' : '',
        disabled ? 'is-disabled' : '',
        handle ? '' : 'au-draggable--whole',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        transform: `translate(${current.x}px, ${current.y}px)`,
        touchAction: 'none',
        ...style,
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {children}
    </div>
  );
};

export default Draggable;
