import React, { useLayoutEffect, useRef, useState } from 'react';
import './Split.css';

export type SplitDirection = 'horizontal' | 'vertical';

export interface SplitProps {
  /** 分割方向; 默认 'horizontal' (左右分割) */
  direction?: SplitDirection;
  /** 初始第一块尺寸; 支持数字(px) 或百分比字符串 '50%' */
  defaultSize?: number | string;
  /** 受控模式: 第一块尺寸 (px) */
  size?: number;
  /** 第一块最小尺寸 (px) */
  min?: number;
  /** 第一块最大尺寸 (px); 不传则为 容器尺寸 - 分隔条宽度 */
  max?: number;
  /** 分隔条宽度 (px); 默认 6 */
  resizerSize?: number;
  /** 禁用拖拽 */
  disabled?: boolean;
  /** 拖拽中持续触发 */
  onChange?: (size: number) => void;
  /** 拖拽结束触发 */
  onResizeEnd?: (size: number) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

const Split: React.FC<SplitProps> = ({
  direction = 'horizontal',
  defaultSize = '50%',
  size,
  min = 40,
  max,
  resizerSize = 6,
  disabled = false,
  onChange,
  onResizeEnd,
  className,
  style,
  children,
}) => {
  const isControlled = size !== undefined;
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSizeRef = useRef(0);
  // 内部记录 "第一块 / 容器" 的比例; 容器变化时按比例还原, 保持视觉占比一致
  const ratioRef = useRef<number | null>(null);
  const [inner, setInner] = useState<number | null>(() =>
    typeof defaultSize === 'number' ? defaultSize : null
  );
  const [dragging, setDragging] = useState(false);

  const kids = React.Children.toArray(children);
  const first = kids[0] ?? null;
  const second = kids[1] ?? null;

  // 测量容器 + 解析初始百分比 + 容器变化时按比例还原
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const measure = () => {
      const s =
        direction === 'horizontal' ? el.clientWidth : el.clientHeight;
      if (s <= 0) return;
      containerSizeRef.current = s;
      const upper = max ?? Math.max(min, s - resizerSize);

      setInner((prev) => {
        // 已有比例 → 按比例还原, 窗口变大/变小两块一起缩
        if (ratioRef.current !== null) {
          const next = clamp(ratioRef.current * s, min, upper);
          return next;
        }
        // 首次测量: 解析 defaultSize, 落定比例
        let base: number;
        if (prev !== null) {
          base = prev;
        } else if (typeof defaultSize === 'string') {
          const m = /^(\d+(?:\.\d+)?)%$/.exec(defaultSize);
          base = m ? (parseFloat(m[1]) / 100) * s : s / 2;
        } else {
          base = s / 2;
        }
        const clamped = clamp(base, min, upper);
        ratioRef.current = clamped / s;
        return clamped;
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [direction, defaultSize, min, max, resizerSize]);

  const current = isControlled ? size! : inner ?? 0;

  // 指针按下: 直接挂 window 事件, 结束时再解绑; 不走 useEffect, 避免 setState 造成的听绑抖动
  const startDrag = (clientPos: number) => {
    if (disabled) return;
    const startPos = clientPos;
    const startSize = current;
    let lastSize = startSize;

    setDragging(true);
    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor =
      direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';

    const onMove = (ev: MouseEvent | TouchEvent) => {
      const pt = 'touches' in ev ? ev.touches[0] : ev;
      const pos = direction === 'horizontal' ? pt.clientX : pt.clientY;
      if ('touches' in ev) ev.preventDefault();
      const cs = containerSizeRef.current;
      const upper = max ?? Math.max(min, cs - resizerSize);
      const next = clamp(startSize + (pos - startPos), min, upper);
      lastSize = next;
      if (cs > 0) ratioRef.current = next / cs;
      if (!isControlled) setInner(next);
      onChange?.(next);
    };
    const onEnd = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
      setDragging(false);
      onResizeEnd?.(lastSize);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  };

  const cls = [
    'au-split',
    `au-split--${direction}`,
    dragging ? 'is-dragging' : '',
    disabled ? 'is-disabled' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  // 首次测量前用 defaultSize 原样值, 避免 0 宽度闪烁
  const measured = isControlled || inner !== null;
  const basis = measured ? `${current}px` : String(defaultSize);

  const firstStyle: React.CSSProperties = { flex: `0 0 ${basis}` };
  const resizerStyle: React.CSSProperties =
    direction === 'horizontal'
      ? { width: resizerSize }
      : { height: resizerSize };

  return (
    <div ref={containerRef} className={cls} style={style}>
      <div className="au-split__pane" style={firstStyle}>{first}</div>
      <div
        className="au-split__resizer"
        style={resizerStyle}
        role="separator"
        aria-orientation={
          direction === 'horizontal' ? 'vertical' : 'horizontal'
        }
        aria-valuenow={Math.round(current)}
        onMouseDown={(e) => {
          e.preventDefault();
          startDrag(direction === 'horizontal' ? e.clientX : e.clientY);
        }}
        onTouchStart={(e) =>
          startDrag(
            direction === 'horizontal'
              ? e.touches[0].clientX
              : e.touches[0].clientY
          )
        }
      >
        <span className="au-split__grip" />
      </div>
      <div className="au-split__pane au-split__pane--flex">{second}</div>
    </div>
  );
};

export default Split;
