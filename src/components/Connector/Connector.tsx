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
  /**
   * 沿线移动的小圆点 (像数据包在线上跑):
   * - true / 1 = 1 个点
   * - 数字 N = N 个点等间距
   * - 对象 = 完整自定义
   */
  flow?:
    | boolean
    | number
    | {
        count?: number;   // 圆点个数, 默认 1
        speed?: number;   // 一圈秒数, 默认 2
        size?: number;    // 圆点半径 (px), 默认 3
        color?: string;   // 圆点颜色, 默认跟随线色 (渐变取末端色)
      };
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
  const [version, bump] = useReducer((n: number) => n + 1, 0);

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
  // version 必须进 deps, 子 Connector 注册时 bump 才能让 allSpecs 重新计算
  const allSpecs = useMemo<ConnectorSpec[]>(() => {
    const list: ConnectorSpec[] = [];
    childSpecs.current.forEach((spec, id) => list.push({ ...spec, id }));
    if (connections) {
      connections.forEach((c, i) =>
        list.push({ ...c, id: c.id ?? `cn-${i}` }),
      );
    }
    return list;
  }, [connections, version]);

  // 容器解析: 首次 render 时 ref.current 可能还是 null, 不能用 useMemo 缓存
  // 直接每次 render 都算, useEffect deps 监听 containerEl 变化
  const containerEl: HTMLElement | null = container
    ? container instanceof HTMLElement
      ? container
      : container.current
    : null;

  // 把 specs 展开成 (fromEl, toEl) pair
  const [drawn, setDrawn] = useState<DrawnLine[]>([]);
  const allElsRef = useRef<Set<Element>>(new Set());

  // 直接写入 DOM 的 refs (绕过 React, 避免滚动时 1-2 帧渲染延迟造成抖动)
  const pathRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const gradRefs = useRef<Map<string, SVGLinearGradientElement>>(new Map());
  const labelRefs = useRef<Map<string, SVGForeignObjectElement>>(new Map());

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

    // === 关键: 直接写入 SVG 元素属性, 与浏览器滚动同帧 ===
    // 这一步同步执行, scroll 触发 → 立刻 setAttribute → 浏览器同帧 paint
    // 不再走 React state → reconcile → DOM 更新 (会延迟 1-2 帧导致抖动)
    drawnLines.forEach((line) => {
      const path = pathRefs.current.get(line.id);
      if (path) path.setAttribute('d', line.d);
      const grad = gradRefs.current.get(line.id);
      if (grad) {
        grad.setAttribute('x1', String(line.start.x));
        grad.setAttribute('y1', String(line.start.y));
        grad.setAttribute('x2', String(line.end.x));
        grad.setAttribute('y2', String(line.end.y));
      }
      const lbl = labelRefs.current.get(line.id);
      if (lbl) {
        lbl.setAttribute('x', String(line.mid.x - 60));
        lbl.setAttribute('y', String(line.mid.y - 12));
      }
    });

    // 仍然 setDrawn — 保证 React state 与 DOM 同步, 避免无关 re-render 把 d 重置回旧值
    // (DOM 已经被 setAttribute 同步更新, 此 setState 触发的 reconcile 只是写一个相同的 d 进去)
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

  // scroll/resize 直接同步调用 recompute (不过 RAF), 与浏览器滚动同帧, 不抖动
  // 拖拽通过 transform 改位置, 不触发 scroll/resize/ResizeObserver — 必须额外监听
  // mousemove/touchmove 抓拖拽过程; 用 mousedown gate 减少空闲时的开销
  useEffect(() => {
    let pointerDown = false;
    const onPointerDown = () => {
      pointerDown = true;
    };
    const onPointerUp = () => {
      pointerDown = false;
    };
    const onPointerMove = () => {
      if (pointerDown) recompute();
    };
    const onScroll = () => recompute();
    const onResize = () => recompute();

    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('mousedown', onPointerDown, true);
    window.addEventListener('mouseup', onPointerUp, true);
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('touchstart', onPointerDown, { passive: true, capture: true });
    window.addEventListener('touchend', onPointerUp, true);
    window.addEventListener('touchmove', onPointerMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll, {
        capture: true,
      } as EventListenerOptions);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousedown', onPointerDown, true);
      window.removeEventListener('mouseup', onPointerUp, true);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchstart', onPointerDown, {
        capture: true,
      } as EventListenerOptions);
      window.removeEventListener('touchend', onPointerUp, true);
      window.removeEventListener('touchmove', onPointerMove);
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
    };
  }, [recompute]);

  useEffect(() => {
    const ro = new ResizeObserver(schedule);
    allElsRef.current.forEach((el) => ro.observe(el));
    if (containerEl) ro.observe(containerEl);
    return () => ro.disconnect();
  }, [drawn, containerEl, schedule]);

  // === SVG 渲染 ===
  // container 模式: z-index: -1 沉到底, 节点的 absolute (z-index auto/0) 自动压在线上
  // 要求 container 有 isolation: isolate 或 z-index, 否则 -1 会逃出去
  // portal-到-body 模式: z-index: 1 浮在视口, 没法做到压在节点下 (跨多 stacking ctx)
  const svgStyle: React.CSSProperties = containerEl
    ? { position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: -1, ...style }
    : { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, ...style };

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
              ref={(el) => {
                if (el) gradRefs.current.set(line.id, el);
                else gradRefs.current.delete(line.id);
              }}
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
        const flowDots = resolveFlow(line.spec.flow);
        const flowColor =
          flowDots && (typeof line.spec.flow === 'object' ? line.spec.flow.color : undefined)
            ? (line.spec.flow as { color?: string }).color!
            : colors[colors.length - 1];
        const pathId = `au-conn-path-${line.id}`;
        return (
          <React.Fragment key={line.id}>
            <path
              id={pathId}
              ref={(el) => {
                if (el) pathRefs.current.set(line.id, el);
                else pathRefs.current.delete(line.id);
              }}
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
            {flowDots &&
              (() => {
                // 按箭头方向裁剪小圆点的运行区间, 不让它压在箭头上
                const startGap = showStart ? 0.05 : 0;
                const endGap = showEnd ? 0.05 : 0;
                const fromT = startGap;
                const toT = 1 - endGap;
                return Array.from({ length: flowDots.count }).map((_, i) => (
                  <circle
                    key={`dot-${line.id}-${i}`}
                    r={flowDots.size}
                    fill={flowColor}
                    className="au-connector__dot"
                    style={{
                      filter: `drop-shadow(0 0 ${flowDots.size * 2}px ${flowColor})`,
                    }}
                  >
                    <animateMotion
                      dur={`${flowDots.speed}s`}
                      repeatCount="indefinite"
                      rotate="auto"
                      keyPoints={`${fromT};${toT}`}
                      keyTimes="0;1"
                      calcMode="linear"
                      begin={`-${(flowDots.speed * i) / flowDots.count}s`}
                    >
                      <mpath href={`#${pathId}`} />
                    </animateMotion>
                  </circle>
                ));
              })()}
          </React.Fragment>
        );
      })}
      {drawn.map((line) => {
        if (line.spec.label == null) return null;
        return (
          <foreignObject
            key={`lbl-${line.id}`}
            ref={(el) => {
              if (el) labelRefs.current.set(line.id, el);
              else labelRefs.current.delete(line.id);
            }}
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

const SPEC_KEYS: (keyof ConnectorSpec)[] = [
  'from',
  'to',
  'mode',
  'type',
  'startSide',
  'endSide',
  'arrow',
  'arrowSize',
  'color',
  'thickness',
  'dashed',
  'animated',
  'radius',
  'label',
  'offset',
  'zIndex',
];

function specShallowEq(a: ConnectorSpec | null, b: ConnectorSpec): boolean {
  if (!a) return false;
  for (const k of SPEC_KEYS) {
    const av = a[k];
    const bv = b[k];
    if (av === bv) continue;
    if (Array.isArray(av) && Array.isArray(bv)) {
      if (av.length !== bv.length) return false;
      for (let i = 0; i < av.length; i++) {
        if (av[i] !== bv[i]) return false;
      }
      continue;
    }
    return false;
  }
  return true;
}

const Connector: React.FC<ConnectorProps> = (props) => {
  const ctx = useContext(ConnectorContext);
  const autoId = useId();
  const id = props.id ?? autoId;
  const lastPropsRef = useRef<ConnectorSpec | null>(null);

  // 每次 commit 都尝试上传, 但 shallow-eq 防 bump→re-render→upsert→bump 死循环
  useLayoutEffect(() => {
    if (!ctx) return;
    if (specShallowEq(lastPropsRef.current, props)) return;
    lastPropsRef.current = props;
    ctx.upsert(id, props);
  });

  // 卸载移除
  // StrictMode 下 effect cleanup 会先于第二次 LE setup 跑, 必须重置 lastPropsRef,
  // 否则 specShallowEq 会让第二次 setup 跳过 upsert, childSpecs 永远是空.
  useEffect(() => {
    if (!ctx) return;
    return () => {
      ctx.remove(id);
      lastPropsRef.current = null;
    };
  }, [ctx, id]);

  return null;
};

/* =================== Helper: 颜色解析 =================== */

function resolveFlow(
  flow: ConnectorSpec['flow'],
): { count: number; speed: number; size: number } | null {
  if (!flow) return null;
  if (flow === true) return { count: 1, speed: 2, size: 3 };
  if (typeof flow === 'number') return { count: flow, speed: 2, size: 3 };
  return {
    count: Math.max(1, flow.count ?? 1),
    speed: flow.speed ?? 2,
    size: flow.size ?? 3,
  };
}

function resolveColors(color: string | string[]): string[] {
  if (Array.isArray(color)) return color;
  if (PRESET_COLORS[color]) return PRESET_COLORS[color];
  return [color];
}

export { ConnectorGroup, Connector };
