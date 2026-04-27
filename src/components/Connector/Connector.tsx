import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import './Connector.css';
import {
  type ConnectorType,
  type Pt,
  type Side,
  type SideOpt,
  anchorAt,
  applyOffset,
  midPoint,
  pathCurve,
  pathOrthogonal,
  pathStep,
  pathStraight,
  pickSide,
} from './geometry';

/* =================== Types =================== */

export type AnchorRef = React.RefObject<Element | null> | Element | string;

export type ArrowKind = 'none' | 'start' | 'end' | 'both';

export interface ConnectorSpec {
  id?: string;
  /** 起点 (单个或数组) */
  from: AnchorRef | AnchorRef[];
  /** 终点 (单个或数组) */
  to: AnchorRef | AnchorRef[];
  /**
   * 多对多展开模式:
   * - mesh (默认): 笛卡尔积, 每个 from 都连每个 to (N×M 条)
   * - pairs: 一一配对 (N === M), 配对失败的截断
   */
  mode?: 'mesh' | 'pairs';
  type?: ConnectorType;
  startSide?: SideOpt;
  endSide?: SideOpt;
  arrow?: ArrowKind;
  arrowSize?: number;
  /** CSS 颜色字符串, 或多色数组(自动渐变), 或预设 'aurora'/'sunset'/'ocean'/'forest'/'cosmic' */
  color?: string | string[];
  thickness?: number;
  dashed?: boolean;
  /** 虚线流动 (像数据在跑) */
  animated?: boolean;
  /** orthogonal 类型的拐角圆角 */
  radius?: number;
  label?: React.ReactNode;
  /** 起点/终点端的接出延伸 (避免紧贴 dom 边) */
  offset?: number;
  /** 同 SVG 内的 z 顺序 (大者在上) */
  zIndex?: number;
  className?: string;
  style?: React.CSSProperties;
}

const PRESET_COLORS: Record<string, string[]> = {
  aurora: ['#22d3ee', '#a855f7', '#f472b6'],
  sunset: ['#fb923c', '#f43f5e', '#a855f7'],
  ocean: ['#0ea5e9', '#3b82f6', '#06b6d4'],
  forest: ['#10b981', '#84cc16', '#22d3ee'],
  cosmic: ['#7c3aed', '#ec4899', '#0ea5e9'],
};

/* =================== Context =================== */

interface RegistryCtx {
  upsert: (id: string, spec: ConnectorSpec) => void;
  remove: (id: string) => void;
}
const ConnectorContext = createContext<RegistryCtx | null>(null);

/* =================== Helpers =================== */

const toArray = <T,>(v: T | T[]): T[] => (Array.isArray(v) ? v : [v]);

const resolveRef = (
  ref: AnchorRef,
  ids?: Record<string, AnchorRef>,
): Element | null => {
  if (!ref) return null;
  if (typeof ref === 'string') {
    if (ids && ids[ref]) return resolveRef(ids[ref], ids);
    // CSS selector fallback
    try {
      return document.querySelector(ref);
    } catch {
      return null;
    }
  }
  if ('current' in ref) return ref.current ?? null;
  return ref as Element;
};

const stableNodeKey = (() => {
  const map = new WeakMap<Element, string>();
  let seq = 0;
  return (el: Element): string => {
    let k = map.get(el);
    if (!k) {
      k = `n${++seq}`;
      map.set(el, k);
    }
    return k;
  };
})();

/* =================== <ConnectorGroup> =================== */

export interface ConnectorGroupProps {
  /** 数据 API: 直接传连接列表 */
  connections?: ConnectorSpec[];
  /** id → element 映射, connections 里 from/to 写字符串就用这个解 */
  ids?: Record<string, AnchorRef>;
  /** 默认配色 (单条没设 color 时) */
  defaultColor?: string | string[];
  /** 默认箭头 */
  defaultArrow?: ArrowKind;
  /** 默认 type */
  defaultType?: ConnectorType;
  /** SVG 渲染容器 ref. 不传则 portal 到 body 用 fixed 定位 (跨 viewport) */
  container?: React.RefObject<HTMLElement | null> | HTMLElement | null;
  /** 整组 className/style */
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

interface ResolvedLine {
  id: string;
  spec: ConnectorSpec;
  fromEl: Element;
  toEl: Element;
}

interface DrawnLine extends ResolvedLine {
  d: string;
  startSide: Side;
  endSide: Side;
  start: Pt;
  end: Pt;
  mid: Pt;
}

const ConnectorGroup: React.FC<ConnectorGroupProps> = ({
  connections,
  ids,
  defaultColor,
  defaultArrow = 'end',
  defaultType = 'curve',
  container,
  className = '',
  style,
  children,
}) => {
  // 子 Connector 注册的 spec
  const childSpecs = useRef<Map<string, ConnectorSpec>>(new Map());
  const [, bump] = useReducer((n: number) => n + 1, 0);

  const ctxValue = useMemo<RegistryCtx>(
    () => ({
      upsert: (id, spec) => {
        childSpecs.current.set(id, spec);
        bump();
      },
      remove: (id) => {
        childSpecs.current.delete(id);
        bump();
      },
    }),
    [],
  );

  // 合并 children + connections
  const allSpecs = useMemo<ConnectorSpec[]>(() => {
    void childSpecs.current; // 依赖 bump 触发
    const list: ConnectorSpec[] = [];
    childSpecs.current.forEach((spec, id) => list.push({ ...spec, id }));
    if (connections) {
      connections.forEach((c, i) =>
        list.push({ ...c, id: c.id ?? `cn-${i}` }),
      );
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connections, /* bump triggers re-eval via parent re-render */ ctxValue]);

  // 容器解析
  const containerEl = useMemo(() => {
    if (!container) return null;
    if (container instanceof HTMLElement) return container;
    return container.current ?? null;
  }, [container]);

  // 把 specs 展开成 (fromEl, toEl) pair
  const [drawn, setDrawn] = useState<DrawnLine[]>([]);
  const allElsRef = useRef<Set<Element>>(new Set());

  const recompute = useCallback(() => {
    const lines: ResolvedLine[] = [];
    const els = new Set<Element>();

    for (const spec of allSpecs) {
      const fromList = toArray(spec.from);
      const toList = toArray(spec.to);
      const mode = spec.mode ?? 'mesh';
      let pairs: Array<{ fromRef: AnchorRef; toRef: AnchorRef }> = [];
      if (mode === 'pairs') {
        const n = Math.min(fromList.length, toList.length);
        for (let i = 0; i < n; i++)
          pairs.push({ fromRef: fromList[i], toRef: toList[i] });
      } else {
        for (const f of fromList)
          for (const t of toList) pairs.push({ fromRef: f, toRef: t });
      }

      pairs.forEach((p, i) => {
        const fromEl = resolveRef(p.fromRef, ids);
        const toEl = resolveRef(p.toRef, ids);
        if (!fromEl || !toEl || fromEl === toEl) return;
        els.add(fromEl);
        els.add(toEl);
        lines.push({
          id: `${spec.id ?? 'auto'}-${i}`,
          spec,
          fromEl,
          toEl,
        });
      });
    }
    allElsRef.current = els;

    // === side 决定 ===
    type Endpoint = {
      lineIdx: number;
      role: 'from' | 'to';
      nodeKey: string;
      nodeEl: Element;
      side: Side;
      otherCenter: Pt;
    };
    const endpoints: Endpoint[] = [];
    const rectsCache = new Map<Element, DOMRect>();
    const getRect = (el: Element) => {
      let r = rectsCache.get(el);
      if (!r) {
        r = el.getBoundingClientRect();
        rectsCache.set(el, r);
      }
      return r;
    };

    lines.forEach((line, idx) => {
      const fromR = getRect(line.fromEl);
      const toR = getRect(line.toEl);
      const startSide: Side =
        line.spec.startSide && line.spec.startSide !== 'auto'
          ? (line.spec.startSide as Side)
          : pickSide(fromR, toR);
      const endSide: Side =
        line.spec.endSide && line.spec.endSide !== 'auto'
          ? (line.spec.endSide as Side)
          : pickSide(toR, fromR);
      endpoints.push({
        lineIdx: idx,
        role: 'from',
        nodeKey: stableNodeKey(line.fromEl),
        nodeEl: line.fromEl,
        side: startSide,
        otherCenter: { x: (toR.left + toR.right) / 2, y: (toR.top + toR.bottom) / 2 },
      });
      endpoints.push({
        lineIdx: idx,
        role: 'to',
        nodeKey: stableNodeKey(line.toEl),
        nodeEl: line.toEl,
        side: endSide,
        otherCenter: { x: (fromR.left + fromR.right) / 2, y: (fromR.top + fromR.bottom) / 2 },
      });
    });

    // === 同 (node, side) 多端点分布 ===
    const groups = new Map<string, Endpoint[]>();
    for (const ep of endpoints) {
      const k = `${ep.nodeKey}|${ep.side}`;
      const arr = groups.get(k) ?? [];
      arr.push(ep);
      groups.set(k, arr);
    }
    const tValues = new Map<Endpoint, number>();
    groups.forEach((list) => {
      // 按对端中心在主轴上的位置排序: top/bottom 边按 x, left/right 边按 y
      const side = list[0].side;
      list.sort((a, b) => {
        const av = side === 'top' || side === 'bottom' ? a.otherCenter.x : a.otherCenter.y;
        const bv = side === 'top' || side === 'bottom' ? b.otherCenter.x : b.otherCenter.y;
        return av - bv;
      });
      const n = list.length;
      list.forEach((ep, i) => {
        tValues.set(ep, n === 1 ? 0.5 : (i + 1) / (n + 1));
      });
    });

    // === 计算锚点 + 路径 ===
    const containerRect = containerEl?.getBoundingClientRect();
    const offsetX = containerRect ? -containerRect.left : 0;
    const offsetY = containerRect ? -containerRect.top : 0;

    const drawnLines: DrawnLine[] = lines.map((line, idx) => {
      const fromEp = endpoints.find((e) => e.lineIdx === idx && e.role === 'from')!;
      const toEp = endpoints.find((e) => e.lineIdx === idx && e.role === 'to')!;
      const fromR = getRect(line.fromEl);
      const toR = getRect(line.toEl);
      let start = anchorAt(fromR, fromEp.side, tValues.get(fromEp) ?? 0.5);
      let end = anchorAt(toR, toEp.side, tValues.get(toEp) ?? 0.5);

      // offset 让线不紧贴 dom
      const off = line.spec.offset ?? 0;
      if (off) {
        start = applyOffset(start, fromEp.side, off);
        end = applyOffset(end, toEp.side, off);
      }

      // 转到容器坐标
      const a: Pt = { x: start.x + offsetX, y: start.y + offsetY };
      const b: Pt = { x: end.x + offsetX, y: end.y + offsetY };

      const type = line.spec.type ?? defaultType;
      let d: string;
      switch (type) {
        case 'straight':
          d = pathStraight(a, b);
          break;
        case 'step':
          d = pathStep(a, fromEp.side, b);
          break;
        case 'orthogonal':
          d = pathOrthogonal(a, fromEp.side, b, line.spec.radius ?? 12);
          break;
        case 'curve':
        default:
          d = pathCurve(a, fromEp.side, b, toEp.side);
      }

      return {
        ...line,
        d,
        startSide: fromEp.side,
        endSide: toEp.side,
        start: a,
        end: b,
        mid: midPoint(a, b, type, fromEp.side),
      };
    });

    // zIndex 排序
    drawnLines.sort(
      (a, b) => (a.spec.zIndex ?? 0) - (b.spec.zIndex ?? 0),
    );
    setDrawn(drawnLines);
  }, [allSpecs, containerEl, defaultType, ids]);

  // === 监听器: ResizeObserver 所有元素 + 全局 scroll/resize ===
  const rafIdRef = useRef<number | null>(null);
  const schedule = useCallback(() => {
    if (rafIdRef.current != null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      recompute();
    });
  }, [recompute]);

  useLayoutEffect(() => {
    recompute();
  }, [recompute]);

  useEffect(() => {
    const ro = new ResizeObserver(schedule);
    allElsRef.current.forEach((el) => ro.observe(el));
    if (containerEl) ro.observe(containerEl);

    const onScroll = () => schedule();
    const onResize = () => schedule();
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', onScroll, { capture: true } as EventListenerOptions);
      window.removeEventListener('resize', onResize);
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
    };
  }, [drawn, containerEl, schedule]);

  // === SVG 渲染 ===
  const svgStyle: React.CSSProperties = containerEl
    ? { position: 'absolute', inset: 0, pointerEvents: 'none', ...style }
    : { position: 'fixed', inset: 0, pointerEvents: 'none', ...style };

  const svg = (
    <svg
      className={['au-connector', className].filter(Boolean).join(' ')}
      style={svgStyle}
      width="100%"
      height="100%"
    >
      <defs>
        {drawn.map((line) => {
          const colorRaw =
            line.spec.color ?? defaultColor ?? 'var(--au-primary, #5b8def)';
          const colors = resolveColors(colorRaw);
          if (colors.length <= 1) return null;
          return (
            <linearGradient
              key={`grad-${line.id}`}
              id={`au-conn-grad-${line.id}`}
              gradientUnits="userSpaceOnUse"
              x1={line.start.x}
              y1={line.start.y}
              x2={line.end.x}
              y2={line.end.y}
            >
              {colors.map((c, i) => (
                <stop
                  key={i}
                  offset={`${(i / (colors.length - 1)) * 100}%`}
                  stopColor={c}
                />
              ))}
            </linearGradient>
          );
        })}
        {drawn.map((line) => {
          const colorRaw =
            line.spec.color ?? defaultColor ?? 'var(--au-primary, #5b8def)';
          const colors = resolveColors(colorRaw);
          const stroke =
            colors.length > 1 ? `url(#au-conn-grad-${line.id})` : colors[0];
          const arrowSize = line.spec.arrowSize ?? 8;
          const arrow = line.spec.arrow ?? defaultArrow;
          const showEnd = arrow === 'end' || arrow === 'both';
          const showStart = arrow === 'start' || arrow === 'both';
          // 渐变情况下, 箭头取末端色 (end) 或起始色 (start)
          const endColor = colors.length > 1 ? colors[colors.length - 1] : colors[0];
          const startColor = colors[0];
          return (
            <React.Fragment key={`mk-${line.id}`}>
              {showEnd && (
                <marker
                  id={`au-conn-mke-${line.id}`}
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth={arrowSize}
                  markerHeight={arrowSize}
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={endColor} />
                </marker>
              )}
              {showStart && (
                <marker
                  id={`au-conn-mks-${line.id}`}
                  viewBox="0 0 10 10"
                  refX="1"
                  refY="5"
                  markerWidth={arrowSize}
                  markerHeight={arrowSize}
                  orient="auto"
                >
                  <path d="M 10 0 L 0 5 L 10 10 z" fill={startColor} />
                </marker>
              )}
              {/* 抑制未使用变量警告 */}
              {void stroke}
            </React.Fragment>
          );
        })}
      </defs>
      {drawn.map((line) => {
        const colorRaw =
          line.spec.color ?? defaultColor ?? 'var(--au-primary, #5b8def)';
        const colors = resolveColors(colorRaw);
        const stroke =
          colors.length > 1 ? `url(#au-conn-grad-${line.id})` : colors[0];
        const arrow = line.spec.arrow ?? defaultArrow;
        const showEnd = arrow === 'end' || arrow === 'both';
        const showStart = arrow === 'start' || arrow === 'both';
        const dashed = line.spec.dashed || line.spec.animated;
        return (
          <path
            key={line.id}
            d={line.d}
            fill="none"
            stroke={stroke}
            strokeWidth={line.spec.thickness ?? 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={dashed ? '6 5' : undefined}
            className={[
              'au-connector__path',
              line.spec.animated ? 'is-animated' : '',
              line.spec.className ?? '',
            ]
              .filter(Boolean)
              .join(' ')}
            markerEnd={showEnd ? `url(#au-conn-mke-${line.id})` : undefined}
            markerStart={showStart ? `url(#au-conn-mks-${line.id})` : undefined}
            style={line.spec.style}
          />
        );
      })}
      {drawn.map((line) => {
        if (line.spec.label == null) return null;
        return (
          <foreignObject
            key={`lbl-${line.id}`}
            x={line.mid.x - 60}
            y={line.mid.y - 12}
            width={120}
            height={24}
            style={{ overflow: 'visible', pointerEvents: 'none' }}
          >
            <div className="au-connector__label">{line.spec.label}</div>
          </foreignObject>
        );
      })}
    </svg>
  );

  return (
    <ConnectorContext.Provider value={ctxValue}>
      {children}
      {containerEl
        ? createPortal(svg, containerEl)
        : typeof document !== 'undefined'
        ? createPortal(svg, document.body)
        : null}
    </ConnectorContext.Provider>
  );
};

/* =================== <Connector> (子项, 注册到 group) =================== */

export interface ConnectorProps extends ConnectorSpec {}

const Connector: React.FC<ConnectorProps> = (props) => {
  const ctx = useContext(ConnectorContext);
  const autoId = useId();
  const id = props.id ?? autoId;

  // 每次 commit 上传最新 spec
  useLayoutEffect(() => {
    if (!ctx) return;
    ctx.upsert(id, props);
  });

  // 卸载移除
  useEffect(() => {
    if (!ctx) return;
    return () => ctx.remove(id);
  }, [ctx, id]);

  if (!ctx) {
    // 没在 group 里就静默不渲染. (Vite dev 时会在 console 看到 react warn 没儿子也行)
  }
  return null;
};

/* =================== Helper: 颜色解析 =================== */

function resolveColors(color: string | string[]): string[] {
  if (Array.isArray(color)) return color;
  if (PRESET_COLORS[color]) return PRESET_COLORS[color];
  return [color];
}

export { ConnectorGroup, Connector };
