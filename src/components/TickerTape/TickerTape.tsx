import React, { useEffect, useMemo, useRef, useState } from 'react';
import './TickerTape.css';

export interface TickerItem {
  /** 主标签, 如 "BTC" / "订单 #1234" */
  label: React.ReactNode;
  /** 数值或描述 */
  value: React.ReactNode;
  /** 涨跌方向, 影响数值颜色 */
  trend?: 'up' | 'down' | 'flat';
  /** 自定义颜色 (覆盖 trend) */
  color?: string;
  /** 唯一 key, 不传则用 index */
  key?: string | number;
}

export interface TickerTapeProps {
  items: TickerItem[];
  /** 滚动一圈时长 (s), 越大越慢, 默认 30 */
  duration?: number;
  /** 滚动方向 */
  direction?: 'left' | 'right';
  /** 鼠标悬停时暂停 */
  pauseOnHover?: boolean;
  /** 项与项之间的分隔符 */
  separator?: React.ReactNode;
  /** 高度 (px), 默认 36 */
  height?: number;
  /** 边框 */
  bordered?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const TickerTape: React.FC<TickerTapeProps> = ({
  items,
  duration = 30,
  direction = 'left',
  pauseOnHover = true,
  separator = '·',
  height = 36,
  bordered = true,
  className = '',
  style,
}) => {
  // 复制一份让滚动无缝衔接
  const tape = useMemo(() => [...items, ...items], [items]);
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => setTrackWidth(el.scrollWidth / 2);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items]);

  const cls = [
    'au-ticker',
    bordered ? 'is-bordered' : '',
    pauseOnHover ? 'is-pausable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const animVars: React.CSSProperties = {
    height,
    ['--ticker-distance' as string]: `${trackWidth}px`,
    ['--ticker-duration' as string]: `${duration}s`,
    ['--ticker-direction' as string]: direction === 'right' ? 'reverse' : 'normal',
  };

  return (
    <div className={cls} style={{ ...animVars, ...style }}>
      <div className="au-ticker__track" ref={trackRef}>
        {tape.map((it, i) => {
          const trend = it.trend ?? 'flat';
          const trendColor =
            it.color ??
            (trend === 'up'
              ? 'var(--au-success, #10b981)'
              : trend === 'down'
              ? 'var(--au-danger, #ef4444)'
              : 'var(--au-text-2)');
          return (
            <React.Fragment key={`${it.key ?? i}-${i}`}>
              <span className="au-ticker__item">
                <span className="au-ticker__label">{it.label}</span>
                <span className="au-ticker__value" style={{ color: trendColor }}>
                  {trend === 'up' && <span className="au-ticker__arrow">▲</span>}
                  {trend === 'down' && <span className="au-ticker__arrow">▼</span>}
                  {it.value}
                </span>
              </span>
              <span className="au-ticker__sep">{separator}</span>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default TickerTape;
