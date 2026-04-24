import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import './DayTimeline.css';

export type DayTimelineMode = 'hour' | 'day' | 'month' | 'year';

export type DayTimelineStatusKind =
  | 'success'
  | 'warning'
  | 'danger'
  | 'primary';

export interface DayTimelineStatus {
  /**
   * 位置: 可传 Date 对象, 或一个数字(按当天分钟数 0-1439 解释)
   */
  value: number | Date;
  /**
   * 状态标识. 可以是:
   * - 数字代码 (配合 statusColors 查表)
   * - 预设名 'success' | 'warning' | 'danger' | 'primary'
   * - 任意 CSS 颜色字符串
   */
  status: number | DayTimelineStatusKind | string;
}

export type DayTimelineStatusColors = Record<string | number, string>;

const DEFAULT_STATUS_COLORS: Record<string, string> = {
  '1': 'var(--au-success)',
  '2': 'var(--au-warning)',
  '3': 'var(--au-danger)',
  success: 'var(--au-success)',
  warning: 'var(--au-warning)',
  danger: 'var(--au-danger)',
  primary: 'var(--au-primary)',
};

export interface DayTimelineChangePayload {
  /** 选中的时刻 */
  date: Date;
  /** 按 mode 自动格式化的文本 */
  label: string;
}

export interface DayTimelineProps {
  /** 刻度粒度; 默认 'hour' */
  mode?: DayTimelineMode;
  /** 轴起点; 默认按 mode 自动推导 */
  start?: Date;
  /** 轴终点; 默认按 mode 自动推导 */
  end?: Date;
  /** 受控模式下当前标点 */
  value?: Date;
  /** 非受控模式下的初始标点; 默认为当前时刻 */
  defaultValue?: Date;
  /** 标点变化时触发 (拖动中持续触发) */
  onChange?: (payload: DayTimelineChangePayload) => void;
  /** 拖动结束 / 点击选取时触发一次 (适合做网络请求 / 弹提示等副作用) */
  onChangeComplete?: (payload: DayTimelineChangePayload) => void;
  /** 轴上的状态标记 */
  statusData?: DayTimelineStatus[];
  /**
   * 状态代码到颜色的映射; 当 status 是数字或自定义字符串时查表。
   * 内置默认: 1=success 绿, 2=warning 橙, 3=danger 红。
   */
  statusColors?: DayTimelineStatusColors;
  /**
   * 当前数据展示到的时刻; 会在轴上从 start 到该时刻绘制一段浅色高亮区域,
   * 用于直观表达"数据已覆盖到此"。
   */
  dataEndAt?: Date;
  /**
   * 标点文本的格式化方式; 不传则按 mode 自动推导
   * - 字符串: 支持令牌 YYYY YY MM M DD D HH H mm m ss s
   * - 函数: (date: Date) => string
   */
  format?: string | ((date: Date) => string);
  /** SVG 高度 (px), 默认 60 */
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

const VIEW_WIDTH = 1440;
const pad2 = (n: number) => n.toString().padStart(2, '0');

function defaultAxis(mode: DayTimelineMode): [Date, Date] {
  const now = new Date();
  switch (mode) {
    case 'hour': {
      const s = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const e = new Date(s);
      e.setDate(e.getDate() + 1);
      return [s, e];
    }
    case 'day':
      return [
        new Date(now.getFullYear(), now.getMonth(), 1),
        new Date(now.getFullYear(), now.getMonth() + 1, 1),
      ];
    case 'month':
      return [
        new Date(now.getFullYear(), 0, 1),
        new Date(now.getFullYear() + 1, 0, 1),
      ];
    case 'year': {
      const y = now.getFullYear();
      return [new Date(y - 5, 0, 1), new Date(y + 6, 0, 1)];
    }
  }
}

function snap(d: Date, mode: DayTimelineMode): Date {
  const r = new Date(d);
  switch (mode) {
    case 'hour':  r.setSeconds(0, 0); break;
    case 'day':   r.setMinutes(0, 0, 0); break;
    case 'month': r.setHours(0, 0, 0, 0); break;
    case 'year':  r.setDate(1); r.setHours(0, 0, 0, 0); break;
  }
  return r;
}

function stepDate(d: Date, n: number, mode: DayTimelineMode): Date {
  const r = new Date(d);
  switch (mode) {
    case 'hour':  r.setMinutes(r.getMinutes() + n); break;
    case 'day':   r.setHours(r.getHours() + n); break;
    case 'month': r.setDate(r.getDate() + n); break;
    case 'year':  r.setMonth(r.getMonth() + n); break;
  }
  return r;
}

function clampDate(d: Date, s: Date, e: Date): Date {
  if (d.getTime() < s.getTime()) return new Date(s);
  if (d.getTime() > e.getTime()) return new Date(e);
  return d;
}

function buildTicks(start: Date, end: Date, mode: DayTimelineMode): Date[] {
  const ticks: Date[] = [];
  const cur = new Date(start);
  // normalize cur to the tick boundary on/after start
  switch (mode) {
    case 'hour':
      if (cur.getMinutes() || cur.getSeconds() || cur.getMilliseconds()) {
        cur.setHours(cur.getHours() + 1, 0, 0, 0);
      }
      break;
    case 'day':
      if (cur.getHours() || cur.getMinutes() || cur.getSeconds()) {
        cur.setDate(cur.getDate() + 1);
        cur.setHours(0, 0, 0, 0);
      }
      break;
    case 'month':
      if (cur.getDate() !== 1 || cur.getHours() || cur.getMinutes()) {
        cur.setMonth(cur.getMonth() + 1, 1);
        cur.setHours(0, 0, 0, 0);
      }
      break;
    case 'year':
      if (cur.getMonth() !== 0 || cur.getDate() !== 1) {
        cur.setFullYear(cur.getFullYear() + 1, 0, 1);
        cur.setHours(0, 0, 0, 0);
      }
      break;
  }
  while (cur.getTime() <= end.getTime()) {
    ticks.push(new Date(cur));
    switch (mode) {
      case 'hour':  cur.setHours(cur.getHours() + 1); break;
      case 'day':   cur.setDate(cur.getDate() + 1); break;
      case 'month': cur.setMonth(cur.getMonth() + 1); break;
      case 'year':  cur.setFullYear(cur.getFullYear() + 1); break;
    }
  }
  return ticks;
}

function formatTick(d: Date, mode: DayTimelineMode): string {
  switch (mode) {
    case 'hour':  return `${pad2(d.getHours())}:00`;
    case 'day':   return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    case 'month': return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}`;
    case 'year':  return `${d.getFullYear()}`;
  }
}

const FORMAT_TOKEN_RE = /YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s/g;

function applyFormat(d: Date, fmt: string): string {
  const map: Record<string, string> = {
    YYYY: d.getFullYear().toString(),
    YY: d.getFullYear().toString().slice(-2),
    MM: pad2(d.getMonth() + 1),
    M: (d.getMonth() + 1).toString(),
    DD: pad2(d.getDate()),
    D: d.getDate().toString(),
    HH: pad2(d.getHours()),
    H: d.getHours().toString(),
    mm: pad2(d.getMinutes()),
    m: d.getMinutes().toString(),
    ss: pad2(d.getSeconds()),
    s: d.getSeconds().toString(),
  };
  return fmt.replace(FORMAT_TOKEN_RE, (t) => map[t] ?? t);
}

function formatMarker(
  d: Date,
  mode: DayTimelineMode,
  fmt?: string | ((date: Date) => string)
): string {
  if (typeof fmt === 'function') return fmt(d);
  if (typeof fmt === 'string' && fmt) return applyFormat(d, fmt);
  switch (mode) {
    case 'hour':
      return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
    case 'day':
      return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    case 'month':
      return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
    case 'year':
      return `${d.getFullYear()}`;
  }
}

function resolveStatusColor(
  s: DayTimelineStatus['status'],
  colors?: DayTimelineStatusColors
): string {
  const key = String(s);
  if (colors && colors[key] !== undefined) return colors[key];
  if (DEFAULT_STATUS_COLORS[key]) return DEFAULT_STATUS_COLORS[key];
  return key;
}

function resolveStatusDate(v: number | Date, axisStart: Date): Date {
  if (v instanceof Date) return v;
  // 数字按"当天的第 v 分钟"解释 (0-1439), 基准日期取 axisStart 那天
  const d = new Date(axisStart);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(v);
  return d;
}

const DayTimeline: React.FC<DayTimelineProps> = ({
  mode = 'hour',
  start,
  end,
  value,
  defaultValue,
  onChange,
  onChangeComplete,
  statusData,
  statusColors,
  dataEndAt,
  format,
  height = 60,
  className,
  style,
}) => {
  const [defStart, defEnd] = useMemo(() => defaultAxis(mode), [mode]);
  const axisStart = start ?? defStart;
  const axisEnd = end ?? defEnd;

  const isControlled = value !== undefined;
  const [inner, setInner] = useState<Date>(() =>
    snap(clampDate(defaultValue ?? new Date(), axisStart, axisEnd), mode)
  );
  const current = snap(
    clampDate(isControlled ? value! : inner, axisStart, axisEnd),
    mode
  );

  const svgRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef(false);
  const baseY = height - 20;

  const xOf = useCallback(
    (d: Date) => {
      const span = axisEnd.getTime() - axisStart.getTime();
      if (span <= 0) return 0;
      const r = (d.getTime() - axisStart.getTime()) / span;
      return Math.max(0, Math.min(1, r)) * VIEW_WIDTH;
    },
    [axisStart, axisEnd]
  );

  const dateOfX = useCallback(
    (x: number) => {
      const r = Math.max(0, Math.min(1, x / VIEW_WIDTH));
      const span = axisEnd.getTime() - axisStart.getTime();
      return new Date(axisStart.getTime() + r * span);
    },
    [axisStart, axisEnd]
  );

  const lastEmittedRef = useRef<Date | null>(null);

  const emit = useCallback(
    (d: Date, final: boolean = false) => {
      const next = snap(clampDate(d, axisStart, axisEnd), mode);
      lastEmittedRef.current = next;
      if (!isControlled) setInner(next);
      const payload = { date: next, label: formatMarker(next, mode, format) };
      onChange?.(payload);
      if (final) onChangeComplete?.(payload);
    },
    [axisStart, axisEnd, mode, isControlled, onChange, onChangeComplete, format]
  );

  const clientXToViewX = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    return pt.matrixTransform(ctm.inverse()).x;
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const x = clientXToViewX(e.clientX, e.clientY);
      if (x === null) return;
      emit(dateOfX(x));
    };
    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      // 拖动结束: 用最后一次位置触发 onChangeComplete
      const last = lastEmittedRef.current;
      if (last && onChangeComplete) {
        onChangeComplete({ date: last, label: formatMarker(last, mode, format) });
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [emit, dateOfX, clientXToViewX, onChangeComplete, mode, format]);

  const handleClickAt = useCallback(
    (e: React.MouseEvent) => {
      const x = clientXToViewX(e.clientX, e.clientY);
      if (x === null) return;
      // 单击一步到位, 视作"完成"
      emit(dateOfX(x), true);
    },
    [emit, dateOfX, clientXToViewX]
  );

  const ticks = useMemo(
    () => buildTicks(axisStart, axisEnd, mode),
    [axisStart, axisEnd, mode]
  );
  // 标签过密时按步长抽稀, 目标每 ~24 个刻度一组
  const labelStride = Math.max(1, Math.ceil(ticks.length / 24));

  const markerX = xOf(current);
  const cls = ['au-daytimeline', className ?? ''].filter(Boolean).join(' ');

  return (
    <svg
      ref={svgRef}
      className={cls}
      style={style}
      width="100%"
      height={height}
      viewBox={`-20 0 ${VIEW_WIDTH + 40} ${height}`}
    >
      {dataEndAt && (() => {
        const endX = xOf(clampDate(dataEndAt, axisStart, axisEnd));
        const barY = baseY - 14;
        const barH = 14;

        const raw = statusData
          ? statusData
              .map((s) => ({
                x: xOf(resolveStatusDate(s.value, axisStart)),
                color: resolveStatusColor(s.status, statusColors),
              }))
              .filter((s) => s.x >= 0 && s.x <= endX)
              .sort((a, b) => a.x - b.x)
          : [];

        // 合并同色相邻段, 减少多余 rect
        const segs: { x: number; w: number; color: string }[] = [];
        for (let i = 0; i < raw.length; i++) {
          const nextX = i === raw.length - 1 ? endX : raw[i + 1].x;
          const w = Math.max(0, nextX - raw[i].x);
          if (w <= 0) continue;
          const last = segs[segs.length - 1];
          if (last && last.color === raw[i].color) {
            last.w += w;
          } else {
            segs.push({ x: raw[i].x, w, color: raw[i].color });
          }
        }

        return (
          <>
            {segs.length > 0 ? (
              segs.map((seg, i) => (
                <rect
                  key={`seg-${i}`}
                  className="au-daytimeline__data-seg"
                  x={seg.x}
                  y={barY}
                  width={seg.w}
                  height={barH}
                  fill={seg.color}
                  onClick={handleClickAt}
                />
              ))
            ) : (
              <rect
                className="au-daytimeline__data-fill"
                x={0}
                y={barY}
                width={endX}
                height={barH}
                onClick={handleClickAt}
              />
            )}
            <line
              className="au-daytimeline__data-edge"
              x1={endX}
              y1={barY}
              x2={endX}
              y2={baseY}
            />
          </>
        );
      })()}

      {ticks.map((t, i) => {
        const x = xOf(t);
        const isMajor = i % labelStride === 0;
        return (
          <React.Fragment key={i}>
            <line
              className="au-daytimeline__tick"
              x1={x} y1={baseY} x2={x} y2={baseY - (isMajor ? 12 : 7)}
            />
            {isMajor && (
              <text
                className="au-daytimeline__tick-label"
                x={x} y={baseY + 14} textAnchor="middle"
              >
                {formatTick(t, mode)}
              </text>
            )}
          </React.Fragment>
        );
      })}

      <line
        className="au-daytimeline__axis"
        x1={0} y1={baseY} x2={VIEW_WIDTH} y2={baseY}
      />

      {!dataEndAt && statusData?.map((item, i) => {
        const d = resolveStatusDate(item.value, axisStart);
        const x = xOf(d);
        return (
          <line
            key={`s-${i}`}
            className="au-daytimeline__status"
            x1={x} y1={baseY} x2={x} y2={baseY - 10}
            stroke={resolveStatusColor(item.status, statusColors)}
            onClick={() => emit(d)}
          />
        );
      })}

      <text
        className="au-daytimeline__marker-label"
        x={markerX} y={baseY - 28} textAnchor="middle"
      >
        {formatMarker(current, mode, format)}
      </text>

      <polygon
        className="au-daytimeline__arrow"
        points={`${markerX - 14},${baseY - 18} ${markerX - 9},${baseY - 22} ${markerX - 9},${baseY - 14}`}
        onClick={() => emit(stepDate(current, -1, mode))}
      />

      <circle
        className="au-daytimeline__marker"
        cx={markerX} cy={baseY - 18} r={6}
        onMouseDown={() => { draggingRef.current = true; }}
      />

      <polygon
        className="au-daytimeline__arrow"
        points={`${markerX + 14},${baseY - 18} ${markerX + 9},${baseY - 22} ${markerX + 9},${baseY - 14}`}
        onClick={() => emit(stepDate(current, 1, mode))}
      />
    </svg>
  );
};

export default DayTimeline;
