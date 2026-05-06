import React, { useEffect, useRef, useState } from 'react';

// canvas 不解析 CSS 变量, 需要手动 resolve 跟随主题; 透明度统一交给 globalAlpha 控制
const FALLBACK = 'rgb(120, 120, 120)';
const resolveDefaultColor = (host: HTMLElement | null): string => {
  if (typeof window === 'undefined' || !host) return FALLBACK;
  const raw = getComputedStyle(host).getPropertyValue('--au-text-3').trim();
  return raw || FALLBACK;
};

export interface WatermarkProps {
  /** 水印文字 — string 单行, string[] 多行 */
  content?: string | string[];
  /** 替换文字的图片 src (会忽略 content) */
  image?: string;
  /** 字号 px */
  fontSize?: number;
  /** 字重 */
  fontWeight?: number | string;
  /** 颜色 — 单色; 传 'aurora' 走极光渐变 */
  color?: string | 'aurora';
  /** 不透明度 0-1 */
  opacity?: number;
  /** 旋转角度 (度), 默认 -22 */
  angle?: number;
  /** 单元格大小 [w, h] (px) */
  gap?: [number, number] | number;
  /** 单元格内偏移 */
  offset?: [number, number];
  /** zIndex */
  zIndex?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const AURORA_STOPS = ['#22d3ee', '#a855f7', '#ec4899'];

/**
 * 在容器上铺一层斜向重复水印 — 用于内部 dashboard / 敏感数据防截图泄露。
 * 通过 canvas 生成 dataURL 作为 CSS 背景重复平铺,完全 GPU 友好;
 * children 在水印之上,水印 pointer-events: none 不挡操作。
 *
 * Aurora 招牌:color="aurora" 时走极光渐变文字水印,跟 GradientText 同款配色。
 */
const Watermark: React.FC<WatermarkProps> = ({
  content = 'Aurora UX',
  image,
  fontSize = 16,
  fontWeight = 600,
  color,
  opacity = 0.22,
  angle = -22,
  gap = [180, 140],
  offset,
  zIndex = 9,
  className = '',
  style,
  children,
}) => {
  const [bg, setBg] = useState<string>('');
  const [bgSize, setBgSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const imgCacheRef = useRef<HTMLImageElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dpr = window.devicePixelRatio || 1;
    const lines = Array.isArray(content) ? content : [content];
    const [gapX, gapY] = Array.isArray(gap) ? gap : [gap, gap];
    const [offsetX, offsetY] = offset ?? [gapX / 2, gapY / 2];
    const resolvedColor = color ?? resolveDefaultColor(hostRef.current);

    const draw = (img?: HTMLImageElement) => {
      const cellW = gapX;
      const cellH = gapY;
      // canvas 装两个单元 (横向 + 纵向错位), 平铺时形成砖块错落感, 视觉更自然
      const w = cellW * 2;
      const h = cellH * 2;
      const canvas = document.createElement('canvas');
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx.globalAlpha = opacity;

      const drawAt = (cx: number, cy: number) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((angle * Math.PI) / 180);
        if (img) {
          // 图片水印: 居中绘
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
        } else {
          // 字体 / 颜色
          // 注意: canvas 的 ctx.font **不解析 CSS 变量**, 必须用具体字体链
          ctx.font = `${fontWeight} ${fontSize}px -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Segoe UI", Arial, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          if (resolvedColor === 'aurora') {
            // 极光渐变 — 沿水平方向
            const grad = ctx.createLinearGradient(-80, 0, 80, 0);
            AURORA_STOPS.forEach((c, i) =>
              grad.addColorStop(i / (AURORA_STOPS.length - 1), c),
            );
            ctx.fillStyle = grad;
          } else {
            ctx.fillStyle = resolvedColor;
          }
          const lineH = fontSize * 1.4;
          const total = lines.length * lineH;
          lines.forEach((line, i) => {
            ctx.fillText(line, 0, i * lineH - total / 2 + lineH / 2);
          });
        }
        ctx.restore();
      };

      // 砖块错位: (cell0_offset) + (cell1_offset 偏 cellW/2)
      drawAt(offsetX, offsetY);
      drawAt(offsetX + cellW, offsetY + cellH);

      setBg(canvas.toDataURL('image/png'));
      setBgSize({ w, h });
    };

    if (image) {
      // 先加载图,再画
      let cached = imgCacheRef.current;
      if (!cached || cached.src !== image) {
        cached = new Image();
        cached.crossOrigin = 'anonymous';
        cached.onload = () => draw(cached!);
        cached.onerror = () => draw();
        cached.src = image;
        imgCacheRef.current = cached;
      } else {
        draw(cached);
      }
    } else {
      draw();
    }
  }, [
    Array.isArray(content) ? content.join('|') : content,
    image,
    fontSize,
    fontWeight,
    color,
    opacity,
    angle,
    Array.isArray(gap) ? gap.join(',') : gap,
    offset?.join(','),
  ]);

  return (
    <div
      ref={hostRef}
      className={['au-watermark', className].filter(Boolean).join(' ')}
      style={{ position: 'relative', width: '100%', ...style }}
    >
      {children}
      {bg && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            zIndex,
            pointerEvents: 'none',
            backgroundImage: `url(${bg})`,
            backgroundSize: `${bgSize.w}px ${bgSize.h}px`,
            backgroundRepeat: 'repeat',
          }}
        />
      )}
    </div>
  );
};

export default Watermark;
