import React, { useMemo } from 'react';
import './Funnel.css';

export interface FunnelStep {
  label: React.ReactNode;
  value: number;
  color?: string;
  extra?: React.ReactNode;
}

export interface FunnelProps {
  data: FunnelStep[];
  /** 'trapezoid' 下窄梯形 (默认); 'pyramid' 倒梯形; 'rect' 等宽条形 */
  shape?: 'trapezoid' | 'pyramid' | 'rect';
  /** 颜色渐变方向: top / down (默认) */
  gradient?: boolean;
  width?: number;
  height?: number;
  showValue?: boolean;
  showPercent?: boolean;
  /** 百分比参考: 'first' 相对首级, 'previous' 相对上一级 */
  percentBase?: 'first' | 'previous';
  formatter?: (value: number, step: FunnelStep) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const defaultColors = (idx: number, total: number, gradient: boolean): string => {
  const base = 'var(--au-primary)';
  if (!gradient) return base;
  const pct = Math.max(0, Math.min(100, 90 - (idx / Math.max(1, total - 1)) * 55));
  return `color-mix(in srgb, var(--au-primary) ${pct.toFixed(0)}%, var(--au-bg))`;
};

const Funnel: React.FC<FunnelProps> = ({
  data,
  shape = 'trapezoid',
  gradient = true,
  width = 420,
  height,
  showValue = true,
  showPercent = true,
  percentBase = 'first',
  formatter,
  className = '',
  style,
}) => {
  const stepH = 48;
  const sectionGap = 2;

  const { segments, maxV, totalH } = useMemo(() => {
    const maxV = Math.max(1, ...data.map((d) => d.value));
    const segments = data.map((d, i) => {
      const ratio = d.value / maxV;
      const next = data[i + 1];
      const nextRatio = next ? next.value / maxV : ratio * 0.7;
      let topW: number, botW: number;
      if (shape === 'rect') {
        topW = botW = ratio;
      } else if (shape === 'pyramid') {
        topW = nextRatio;
        botW = ratio;
      } else {
        topW = ratio;
        botW = nextRatio;
      }
      return { topW, botW, ratio };
    });
    return { segments, maxV, totalH: data.length * stepH + (data.length - 1) * sectionGap };
  }, [data, shape, stepH]);

  const finalHeight = height ?? totalH;
  const cx = width / 2;

  return (
    <div
      className={['au-funnel', `au-funnel--${shape}`, className].filter(Boolean).join(' ')}
      style={{ width, ...style }}
    >
      <svg
        width={width}
        height={finalHeight}
        viewBox={`0 0 ${width} ${finalHeight}`}
        className="au-funnel__svg"
      >
        {data.map((d, i) => {
          const y0 = i * (stepH + sectionGap);
          const y1 = y0 + stepH;
          const { topW, botW } = segments[i];
          const topHalf = (topW * width) / 2;
          const botHalf = (botW * width) / 2;
          const color = d.color ?? defaultColors(i, data.length, gradient);
          const points = `${cx - topHalf},${y0} ${cx + topHalf},${y0} ${cx + botHalf},${y1} ${cx - botHalf},${y1}`;
          return (
            <polygon
              key={i}
              points={points}
              fill={color}
              className="au-funnel__shape"
            />
          );
        })}
      </svg>
      <div className="au-funnel__rows">
        {data.map((d, i) => {
          const ratioFirst = (d.value / data[0].value) * 100;
          const prev = data[i - 1];
          const ratioPrev = prev ? (d.value / prev.value) * 100 : 100;
          const pct = percentBase === 'first' ? ratioFirst : ratioPrev;
          return (
            <div
              key={i}
              className="au-funnel__row"
              style={{ height: stepH, marginBottom: i < data.length - 1 ? sectionGap : 0 }}
            >
              <div className="au-funnel__row-main">
                <span className="au-funnel__label">{d.label}</span>
                {showValue && (
                  <span className="au-funnel__value">
                    {formatter ? formatter(d.value, d) : d.value.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="au-funnel__row-meta">
                {showPercent && (
                  <span className="au-funnel__percent">
                    {percentBase === 'previous' && i === 0 ? '-' : `${pct.toFixed(1)}%`}
                  </span>
                )}
                {d.extra}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Funnel;
