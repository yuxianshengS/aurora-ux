import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import './ScreenScale.css';

export type ScreenScaleMode =
  | 'fit' // contain — 等比缩放, 完整露出, 可能有 letterbox 边
  | 'cover' // cover — 等比缩放, 撑满, 可能裁切
  | 'fullWidth' // 跟随容器宽, 高同比缩放
  | 'fullHeight' // 跟随容器高, 宽同比缩放
  | 'stretch'; // 双向独立拉伸 (不保持宽高比)

export interface ScreenScaleProps {
  /** 设计稿基准宽 (px), 默认 1920 */
  baseWidth?: number;
  /** 设计稿基准高 (px), 默认 1080 */
  baseHeight?: number;
  /** 缩放模式; 默认 'fit' */
  mode?: ScreenScaleMode;
  /** 缩放下限 (避免在极小屏幕上缩到看不见) */
  minScale?: number;
  /** 缩放上限 (避免大屏上撑得过大失真) */
  maxScale?: number;
  /** 缩放比例变化时回调; 拿到当前 scale 用于做个别元素的逆缩放 (比如不希望按钮跟着大屏一起放大) */
  onScaleChange?: (info: { scaleX: number; scaleY: number }) => void;
  /** letterbox / 裁切区域的背景色 (mode='fit' 上下/左右多余的留白) */
  background?: string;
  /** 缩放过渡时长 (ms), 默认 0 不过渡 (直接 snap) */
  transitionDuration?: number;
  /** 自定义 className */
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface ScreenScaleHandle {
  /** 主动触发一次重算 (例如父容器尺寸通过 JS 改了, 但 ResizeObserver 没监听到) */
  recompute: () => void;
  /** 当前缩放比例 (read-only 快照) */
  getScale: () => { scaleX: number; scaleY: number };
}

const ScreenScale = forwardRef<ScreenScaleHandle, ScreenScaleProps>(
  (
    {
      baseWidth = 1920,
      baseHeight = 1080,
      mode = 'fit',
      minScale,
      maxScale,
      onScaleChange,
      background,
      transitionDuration = 0,
      className = '',
      style,
      children,
    },
    ref,
  ) => {
    const outerRef = useRef<HTMLDivElement>(null);
    const [scaleX, setScaleX] = useState(1);
    const [scaleY, setScaleY] = useState(1);
    const [outerSize, setOuterSize] = useState({ w: 0, h: 0 });

    const compute = () => {
      const el = outerRef.current;
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      let sx = w / baseWidth;
      let sy = h / baseHeight;
      switch (mode) {
        case 'fit':
          sx = sy = Math.min(sx, sy);
          break;
        case 'cover':
          sx = sy = Math.max(sx, sy);
          break;
        case 'fullWidth':
          sy = sx;
          break;
        case 'fullHeight':
          sx = sy;
          break;
        case 'stretch':
          // 各自独立 — 保持算出的 sx / sy
          break;
      }
      if (minScale != null) {
        sx = Math.max(sx, minScale);
        sy = Math.max(sy, minScale);
      }
      if (maxScale != null) {
        sx = Math.min(sx, maxScale);
        sy = Math.min(sy, maxScale);
      }
      setScaleX(sx);
      setScaleY(sy);
      setOuterSize({ w, h });
    };

    useEffect(() => {
      compute();
      const el = outerRef.current;
      if (!el) return;
      const ro = new ResizeObserver(compute);
      ro.observe(el);
      // 视口大小变化也可能触发 (比如手机旋转)
      const onResize = () => compute();
      window.addEventListener('resize', onResize);
      return () => {
        ro.disconnect();
        window.removeEventListener('resize', onResize);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [baseWidth, baseHeight, mode, minScale, maxScale]);

    // 通知 scale 变化
    useEffect(() => {
      onScaleChange?.({ scaleX, scaleY });
    }, [scaleX, scaleY, onScaleChange]);

    useImperativeHandle(
      ref,
      () => ({
        recompute: compute,
        getScale: () => ({ scaleX, scaleY }),
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [scaleX, scaleY],
    );

    const innerW = baseWidth * scaleX;
    const innerH = baseHeight * scaleY;
    // 居中: outer 比 inner 大时, 把 inner 放中间
    const offsetX = Math.max(0, (outerSize.w - innerW) / 2);
    const offsetY = Math.max(0, (outerSize.h - innerH) / 2);

    const cls = ['au-screen-scale', className].filter(Boolean).join(' ');

    return (
      <div
        ref={outerRef}
        className={cls}
        style={{
          background,
          ...style,
        }}
      >
        <div
          className="au-screen-scale__inner"
          style={{
            width: baseWidth,
            height: baseHeight,
            transform: `translate(${offsetX}px, ${offsetY}px) scale(${scaleX}, ${scaleY})`,
            transformOrigin: '0 0',
            transition: transitionDuration
              ? `transform ${transitionDuration}ms cubic-bezier(0.22, 1, 0.36, 1)`
              : undefined,
          }}
        >
          {children}
        </div>
      </div>
    );
  },
);
ScreenScale.displayName = 'ScreenScale';

export default ScreenScale;
