import React, { useMemo } from 'react';
import './Gauge.css';

export interface GaugeThreshold {
  threshold: number;
  color: string;
}

export interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  size?: number;
  thickness?: number;
  color?: string;
  trackColor?: string;
  gradient?: [string, string];
  thresholds?: GaugeThreshold[];
  /** 弧度起始和结束角度 (度数, 12 点方向=0), 默认 -135 ~ 135 (270°环) */
  startAngle?: number;
  endAngle?: number;
  label?: React.ReactNode;
  formatter?: (value: number, percent: number) => React.ReactNode;
  showValue?: boolean;
  suffix?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  animated?: boolean;
}

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const describeArc = (cx: number, cy: number, r: number, startDeg: number, endDeg: number): string => {
  const start = polar(cx, cy, r, endDeg);
  const end = polar(cx, cy, r, startDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
};

const pickColorByThreshold = (
  value: number,
  max: number,
  thresholds?: GaugeThreshold[],
  fallback?: string,
): string => {
  if (!thresholds || thresholds.length === 0) return fallback ?? 'var(--au-primary)';
  const ratio = (value / max) * 100;
  const sorted = [...thresholds].sort((a, b) => a.threshold - b.threshold);
  let color = sorted[0].color;
  for (const t of sorted) {
    if (ratio >= t.threshold) color = t.color;
  }
  return color;
};

const Gauge: React.FC<GaugeProps> = ({
  value,
  min = 0,
  max = 100,
  size = 140,
  thickness = 10,
  color,
  trackColor = 'var(--au-bg-mute)',
  gradient,
  thresholds,
  startAngle = -135,
  endAngle = 135,
  label,
  formatter,
  showValue = true,
  suffix,
  className = '',
  style,
  animated = true,
}) => {
  const { clampValue, percent, sweep, mainPath, bgPath, chosenColor, gradId } = useMemo(() => {
    const cv = Math.max(min, Math.min(max, value));
    const p = max - min === 0 ? 0 : (cv - min) / (max - min);
    const totalSpan = endAngle - startAngle;
    const sweepDeg = startAngle + totalSpan * p;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - thickness / 2 - 2;
    const bg = describeArc(cx, cy, r, startAngle, endAngle);
    const main = describeArc(cx, cy, r, startAngle, sweepDeg);
    const picked = pickColorByThreshold(cv, max, thresholds, color);
    const gId = gradient ? `au-gauge-grad-${Math.random().toString(36).slice(2, 9)}` : '';
    return { clampValue: cv, percent: p * 100, sweep: sweepDeg, mainPath: main, bgPath: bg, chosenColor: picked, gradId: gId };
  }, [value, min, max, size, thickness, startAngle, endAngle, color, thresholds, gradient]);

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - thickness / 2 - 2;
  const arcLen = Math.PI * r * ((endAngle - startAngle) / 180);

  return (
    <div
      className={['au-gauge', animated ? 'is-animated' : '', className].filter(Boolean).join(' ')}
      style={{ width: size, ...style }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-valuenow={clampValue} aria-valuemin={min} aria-valuemax={max} role="meter">
        {gradient && (
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={gradient[0]} />
              <stop offset="100%" stopColor={gradient[1]} />
            </linearGradient>
          </defs>
        )}
        <path
          d={bgPath}
          fill="none"
          stroke={trackColor}
          strokeWidth={thickness}
          strokeLinecap="round"
        />
        <path
          className="au-gauge__arc"
          d={mainPath}
          fill="none"
          stroke={gradient ? `url(#${gradId})` : chosenColor}
          strokeWidth={thickness}
          strokeLinecap="round"
          style={{
            transition: animated ? 'stroke-dashoffset 0.6s var(--au-ease)' : undefined,
          }}
        />
      </svg>
      <div className="au-gauge__center">
        {showValue && (
          <div className="au-gauge__value" style={{ color: chosenColor }}>
            {formatter ? formatter(clampValue, percent) : clampValue}
            {suffix != null && <span className="au-gauge__suffix">{suffix}</span>}
          </div>
        )}
        {label && <div className="au-gauge__label">{label}</div>}
      </div>
    </div>
  );
};

export default Gauge;
