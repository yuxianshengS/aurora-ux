import React, { useMemo, useState } from 'react';
import './Heatmap.css';

export interface HeatmapDatum {
  date: string | Date;
  value: number;
}

export interface HeatmapProps {
  data: HeatmapDatum[];
  /** 起始日期 (默认: endDate - 1 年) */
  startDate?: string | Date;
  /** 结束日期 (默认: 今天) */
  endDate?: string | Date;
  /** 单元尺寸 px (默认 12) */
  cellSize?: number;
  /** 单元间距 px (默认 3) */
  cellGap?: number;
  /** 圆角 */
  cellRadius?: number;
  /** 5 档颜色 (空, 低, 中低, 中高, 最高) */
  colors?: [string, string, string, string, string];
  /** 强度分界 (4 个阈值), 默认根据数据 max 自动算 */
  thresholds?: [number, number, number, number];
  showMonthLabels?: boolean;
  showWeekdayLabels?: boolean;
  showLegend?: boolean;
  tooltipFormatter?: (d: { date: Date; value: number }) => React.ReactNode;
  onCellClick?: (d: { date: Date; value: number }) => void;
  className?: string;
  style?: React.CSSProperties;
}

const MS_DAY = 86400000;

const toDate = (v: string | Date): Date => {
  if (v instanceof Date) return new Date(v.getFullYear(), v.getMonth(), v.getDate());
  const d = new Date(v);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const fmt = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const MONTH_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const WEEKDAY_LABELS = ['一', '三', '五'];

const Heatmap: React.FC<HeatmapProps> = ({
  data,
  startDate,
  endDate,
  cellSize = 12,
  cellGap = 3,
  cellRadius = 2,
  colors = [
    'var(--au-bg-mute)',
    'color-mix(in srgb, var(--au-primary) 25%, var(--au-bg))',
    'color-mix(in srgb, var(--au-primary) 50%, var(--au-bg))',
    'color-mix(in srgb, var(--au-primary) 75%, var(--au-bg))',
    'var(--au-primary)',
  ],
  thresholds,
  showMonthLabels = true,
  showWeekdayLabels = true,
  showLegend = true,
  tooltipFormatter,
  onCellClick,
  className = '',
  style,
}) => {
  const now = new Date();
  const end = endDate ? toDate(endDate) : toDate(now);
  const start = startDate
    ? toDate(startDate)
    : toDate(new Date(end.getFullYear() - 1, end.getMonth(), end.getDate() + 1));

  const lookup = useMemo(() => {
    const m = new Map<string, number>();
    data.forEach((d) => {
      m.set(fmt(toDate(d.date)), d.value);
    });
    return m;
  }, [data]);

  const bounds = useMemo(() => {
    let maxV = 0;
    lookup.forEach((v) => {
      if (v > maxV) maxV = v;
    });
    const t: [number, number, number, number] =
      thresholds ??
      (maxV > 0
        ? [maxV * 0.25, maxV * 0.5, maxV * 0.75, maxV]
        : [1, 2, 3, 4]);
    return { maxV, t };
  }, [lookup, thresholds]);

  const { weeks, monthCols } = useMemo(() => {
    // Align start to its week's Sunday (week starts on Sunday)
    const firstDay = new Date(start);
    const dayOfWeek = firstDay.getDay();
    const alignedStart = new Date(firstDay.getTime() - dayOfWeek * MS_DAY);
    // End aligned to Saturday
    const endDay = end.getDay();
    const alignedEnd = new Date(end.getTime() + (6 - endDay) * MS_DAY);

    const weeksArr: { date: Date | null; inRange: boolean }[][] = [];
    const monthColMap = new Map<number, number>(); // month index -> first column that is in that month
    let cursor = new Date(alignedStart);
    let col = 0;
    while (cursor.getTime() <= alignedEnd.getTime()) {
      const week: { date: Date | null; inRange: boolean }[] = [];
      let firstOfMonthSeen = false;
      for (let d = 0; d < 7; d++) {
        const date = new Date(cursor);
        const inRange = date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
        week.push({ date, inRange });
        if (inRange && date.getDate() <= 7 && !firstOfMonthSeen) {
          const mIdx = date.getFullYear() * 12 + date.getMonth();
          if (!monthColMap.has(mIdx)) monthColMap.set(mIdx, col);
          firstOfMonthSeen = true;
        }
        cursor = new Date(cursor.getTime() + MS_DAY);
      }
      weeksArr.push(week);
      col++;
    }
    // filter: ensure month labels not too close
    const monthEntries: { col: number; label: string }[] = [];
    let lastCol = -2;
    [...monthColMap.entries()]
      .sort((a, b) => a[1] - b[1])
      .forEach(([mIdx, c]) => {
        if (c - lastCol < 3) return;
        const m = mIdx % 12;
        monthEntries.push({ col: c, label: MONTH_LABELS[m] });
        lastCol = c;
      });
    return { weeks: weeksArr, monthCols: monthEntries };
  }, [start, end]);

  const levelOf = (v: number): 0 | 1 | 2 | 3 | 4 => {
    if (v <= 0) return 0;
    const [t1, t2, t3] = bounds.t;
    if (v <= t1) return 1;
    if (v <= t2) return 2;
    if (v <= t3) return 3;
    return 4;
  };

  const [hover, setHover] = useState<{ date: Date; value: number; x: number; y: number } | null>(null);

  const gridWidth = weeks.length * (cellSize + cellGap) - cellGap;
  const gridHeight = 7 * (cellSize + cellGap) - cellGap;
  const labelW = showWeekdayLabels ? 24 : 0;
  const labelH = showMonthLabels ? 18 : 0;

  return (
    <div className={['au-heatmap', className].filter(Boolean).join(' ')} style={style}>
      <div className="au-heatmap__scroll">
        <div
          className="au-heatmap__grid"
          style={{
            paddingLeft: labelW,
            paddingTop: labelH,
            width: gridWidth + labelW,
            position: 'relative',
          }}
        >
          {showMonthLabels && (
            <div className="au-heatmap__months" style={{ left: labelW, top: 0, width: gridWidth }}>
              {monthCols.map((m) => (
                <span
                  key={m.col}
                  className="au-heatmap__month"
                  style={{ left: m.col * (cellSize + cellGap) }}
                >
                  {m.label}
                </span>
              ))}
            </div>
          )}
          {showWeekdayLabels && (
            <div className="au-heatmap__weekdays" style={{ top: labelH, left: 0, width: labelW }}>
              {WEEKDAY_LABELS.map((w, i) => (
                <span
                  key={w}
                  className="au-heatmap__weekday"
                  style={{ top: (i * 2 + 1) * (cellSize + cellGap) }}
                >
                  {w}
                </span>
              ))}
            </div>
          )}
          <svg
            width={gridWidth}
            height={gridHeight}
            viewBox={`0 0 ${gridWidth} ${gridHeight}`}
          >
            {weeks.map((week, wIdx) => (
              <g key={wIdx} transform={`translate(${wIdx * (cellSize + cellGap)}, 0)`}>
                {week.map((cell, dIdx) => {
                  if (!cell.inRange || !cell.date) {
                    return null;
                  }
                  const v = lookup.get(fmt(cell.date)) ?? 0;
                  const level = levelOf(v);
                  const y = dIdx * (cellSize + cellGap);
                  const key = fmt(cell.date);
                  return (
                    <rect
                      key={key}
                      x={0}
                      y={y}
                      width={cellSize}
                      height={cellSize}
                      rx={cellRadius}
                      ry={cellRadius}
                      fill={colors[level]}
                      className="au-heatmap__cell"
                      onMouseEnter={(e) => {
                        const r = (e.currentTarget as SVGRectElement).getBoundingClientRect();
                        setHover({
                          date: cell.date!,
                          value: v,
                          x: r.left + r.width / 2,
                          y: r.top,
                        });
                      }}
                      onMouseLeave={() => setHover(null)}
                      onClick={() => onCellClick?.({ date: cell.date!, value: v })}
                      style={{ cursor: onCellClick ? 'pointer' : 'default' }}
                    />
                  );
                })}
              </g>
            ))}
          </svg>
        </div>
      </div>

      {showLegend && (
        <div className="au-heatmap__legend">
          <span className="au-heatmap__legend-text">低</span>
          {colors.map((c, i) => (
            <span
              key={i}
              className="au-heatmap__legend-cell"
              style={{ background: c, width: cellSize, height: cellSize, borderRadius: cellRadius }}
            />
          ))}
          <span className="au-heatmap__legend-text">高</span>
        </div>
      )}

      {hover && (
        <div
          className="au-heatmap__tooltip"
          style={{
            position: 'fixed',
            left: hover.x,
            top: hover.y - 8,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            zIndex: 100,
          }}
        >
          {tooltipFormatter
            ? tooltipFormatter({ date: hover.date, value: hover.value })
            : `${fmt(hover.date)} · ${hover.value}`}
        </div>
      )}
    </div>
  );
};

export default Heatmap;
