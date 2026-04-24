import React, { useMemo } from 'react';
import './Sparkline.css';

export type SparklineType = 'line' | 'area' | 'bar';

export interface SparklineProps {
  data: number[];
  type?: SparklineType;
  width?: number;
  height?: number;
  color?: string;
  fillOpacity?: number;
  smooth?: boolean;
  showDot?: boolean;
  min?: number;
  max?: number;
  strokeWidth?: number;
  gap?: number;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}

const toPath = (pts: [number, number][], smooth: boolean): string => {
  if (pts.length === 0) return '';
  if (!smooth || pts.length < 3) {
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  }
  // Catmull-Rom to cubic Bezier
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const t = 0.2;
    const c1x = p1[0] + (p2[0] - p0[0]) * t;
    const c1y = p1[1] + (p2[1] - p0[1]) * t;
    const c2x = p2[0] - (p3[0] - p1[0]) * t;
    const c2y = p2[1] - (p3[1] - p1[1]) * t;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
};

const Sparkline: React.FC<SparklineProps> = ({
  data,
  type = 'line',
  width = 100,
  height = 28,
  color = 'var(--au-primary)',
  fillOpacity = 0.18,
  smooth = true,
  showDot = true,
  min: minProp,
  max: maxProp,
  strokeWidth = 1.6,
  gap = 2,
  className = '',
  style,
  title,
}) => {
  const { line, area, dot, bars, zeroLine } = useMemo(() => {
    if (!data.length) {
      return { line: '', area: '', dot: null as null | [number, number], bars: [] as { x: number; y: number; w: number; h: number }[], zeroLine: null as null | number };
    }
    const padY = strokeWidth + 1;
    const min = minProp ?? Math.min(...data);
    const max = maxProp ?? Math.max(...data);
    const span = max - min === 0 ? 1 : max - min;
    const innerH = height - padY * 2;
    const innerW = type === 'bar' ? width : width - (showDot ? strokeWidth * 2 : 0);
    const ox = type === 'bar' ? 0 : (showDot ? strokeWidth : 0);

    if (type === 'bar') {
      const n = data.length;
      const barW = Math.max(1, (width - gap * (n - 1)) / n);
      const zeroY = padY + innerH * (1 - (0 - min) / span);
      const effectiveZero = min >= 0 ? padY + innerH : zeroY;
      const bars = data.map((v, i) => {
        const x = i * (barW + gap);
        const topY = padY + innerH * (1 - (v - min) / span);
        let y: number, h: number;
        if (v >= 0) {
          y = topY;
          h = Math.max(1, effectiveZero - topY);
        } else {
          y = effectiveZero;
          h = Math.max(1, topY - effectiveZero);
        }
        return { x, y, w: barW, h };
      });
      const zLine = min < 0 && max > 0 ? zeroY : null;
      return { line: '', area: '', dot: null, bars, zeroLine: zLine };
    }

    const step = data.length === 1 ? 0 : innerW / (data.length - 1);
    const pts: [number, number][] = data.map((v, i) => {
      const x = ox + i * step;
      const y = padY + innerH * (1 - (v - min) / span);
      return [x, y];
    });
    const linePath = toPath(pts, smooth);
    const last = pts[pts.length - 1];
    const areaPath = `${linePath} L${last[0]},${padY + innerH} L${pts[0][0]},${padY + innerH} Z`;
    return { line: linePath, area: areaPath, dot: last, bars: [], zeroLine: null };
  }, [data, type, width, height, minProp, maxProp, smooth, strokeWidth, showDot, gap]);

  return (
    <svg
      className={['au-sparkline', `au-sparkline--${type}`, className].filter(Boolean).join(' ')}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ color, ...style }}
      aria-label={title}
      role="img"
    >
      {type === 'bar' ? (
        <g>
          {zeroLine != null && (
            <line
              x1={0}
              x2={width}
              y1={zeroLine}
              y2={zeroLine}
              stroke="var(--au-border)"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          )}
          {bars.map((b, i) => (
            <rect
              key={i}
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx={Math.min(1, b.w / 4)}
              fill="currentColor"
            />
          ))}
        </g>
      ) : (
        <>
          {type === 'area' && (
            <path d={area} fill="currentColor" fillOpacity={fillOpacity} stroke="none" />
          )}
          <path
            d={line}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {showDot && dot && (
            <circle cx={dot[0]} cy={dot[1]} r={strokeWidth + 1} fill="currentColor" />
          )}
        </>
      )}
    </svg>
  );
};

export default Sparkline;
