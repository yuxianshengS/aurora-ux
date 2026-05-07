import React, { useId, useMemo } from 'react';
import './LiquidFill.css';

export interface LiquidFillThreshold {
  threshold: number;
  color: string;
}

export interface LiquidFillProps {
  /** 当前值; 默认按 0~100 解读, 也可配合 min/max 自定义量纲 */
  value: number;
  min?: number;
  max?: number;
  /** 容器尺寸 (直径 / 边长 px), 默认 160 */
  size?: number;
  /** 容器形状, 默认 'circle' */
  shape?: 'circle' | 'rect';
  /** 圆角矩形的圆角半径, 仅 shape='rect' 生效, 默认 size/8 */
  radius?: number;
  /** 单色填充 (跟 gradient 互斥) */
  color?: string;
  /** 渐变填充 [起点, 终点], 优先于 color */
  gradient?: [string, string];
  /** 按阈值变色 — 例 [{threshold:0,color:'red'},{threshold:60,color:'orange'},{threshold:90,color:'green'}] */
  thresholds?: LiquidFillThreshold[];
  /** 波浪层数, 默认 2 (越多越柔, 性能略降) */
  waveCount?: 1 | 2 | 3;
  /** 波浪振幅 px, 默认 size 的 6% */
  waveHeight?: number;
  /** 横向流动一个完整周期的时间 (秒), 默认 4 */
  waveSpeed?: number;
  /** 容器边框宽度 px, 0 为隐藏边框, 默认 2 */
  borderWidth?: number;
  /** 容器边框色, 默认 var(--au-border-strong) */
  borderColor?: string;
  /** 空容器底色 (水位下方区域), 默认 var(--au-bg-soft) */
  trackColor?: string;
  /** 是否在边框外围加 glow 光晕 */
  glow?: boolean;
  /** 是否显示中央数值文字, 默认 true */
  showValue?: boolean;
  /** 自定义中央内容 — 优先级高于 showValue */
  formatter?: (value: number, percent: number) => React.ReactNode;
  /** 数值下方副标签 */
  label?: React.ReactNode;
  /** 数值文字颜色, 默认 'auto' (水位高 → 反白; 水位低 → 用 text-1 ) */
  valueColor?: string | 'auto';
  /** 是否暂停波浪动画 */
  paused?: boolean;
  /** 加载态, 显示骨架 */
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** 真 sine 波采样 — 在 [0, width] 上画 `periods` 个完整周期, 高密度采样保证视觉丝滑.
 *  path 用 L (直线) 拼接但点足够密 (64 pts/period) 看起来跟连续曲线一样, 也不会出现 Bezier 拼接的"棱角".
 *  动画: translateX 0 → -100/periods % 移动正好 1 个周期, 因为 path 整体周期性, 循环无缝.
 *  返回闭合 path (含底部矩形), 直接当流体填充用. */
const buildWavePath = (
  width: number,
  height: number,
  amp: number,
  phase: number,
  periods: number,
): string => {
  // 64 点/周期 — sine 视觉够顺, 内存可忽略
  const ptsPerPeriod = 64;
  const totalPts = ptsPerPeriod * periods;
  const startY = -amp * Math.sin(phase);
  let d = `M 0 ${startY.toFixed(2)}`;
  for (let i = 1; i <= totalPts; i++) {
    const t = i / totalPts; // 0..1 沿宽方向
    const x = t * width;
    // 一个完整周期 = 2π. 总共 periods 个周期, 所以 angle = 2π * periods * t
    const y = -amp * Math.sin(2 * Math.PI * periods * t + phase);
    d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  // 闭合到底部 — 整个水体形状
  d += ` L ${width.toFixed(2)} ${height} L 0 ${height} Z`;
  return d;
};

const pickColorByThreshold = (
  pct: number,
  thresholds?: LiquidFillThreshold[],
  fallback?: string,
): string | undefined => {
  if (!thresholds?.length) return fallback;
  const sorted = [...thresholds].sort((a, b) => a.threshold - b.threshold);
  let picked = fallback;
  for (const t of sorted) {
    if (pct >= t.threshold) picked = t.color;
  }
  return picked;
};

const LiquidFill: React.FC<LiquidFillProps> = ({
  value,
  min = 0,
  max = 100,
  size = 160,
  shape = 'circle',
  radius,
  color,
  gradient,
  thresholds,
  waveCount = 2,
  waveHeight,
  waveSpeed = 3,
  borderWidth = 2,
  borderColor,
  trackColor,
  glow = false,
  showValue = true,
  formatter,
  label,
  valueColor = 'auto',
  paused = false,
  loading = false,
  className = '',
  style,
}) => {
  const uid = useId().replace(/:/g, '');
  const clipId = `lq-clip-${uid}`;
  const gradId = `lq-grad-${uid}`;

  // value clamp + percent
  const clamped = Math.max(min, Math.min(max, value));
  const percent = ((clamped - min) / (max - min)) * 100;
  const fillRatio = percent / 100;

  const amp = waveHeight ?? Math.max(2, size * 0.06);

  // 流体颜色: thresholds > gradient > color > primary
  const themedColor = pickColorByThreshold(percent, thresholds, color);
  const baseColor = themedColor ?? color ?? 'var(--au-primary)';

  // 容器圆角
  const r = radius ?? Math.max(8, size / 8);

  // 水位顶部 y (SVG 坐标系, 0 在上)
  // 留出半个振幅给波浪发挥, 否则满 100% 时波浪顶部会被 clip 削平
  const inner = size; // viewBox = size
  const top = inner * (1 - fillRatio);

  // 多层波浪规格 — 不同振幅 / 速度 / phase / 方向 / 透明度.
  // 关键设计:
  //   - 不同层混向移动 (dir: 1 / -1) → 干涉穿插, 不像传送带
  //   - 不同 ampMul → 表层小浪 + 底层大浪 parallax
  //   - 负 delay 错开起始 phase → 上来不会齐刷刷
  // path 都是 2 周期 × 2*size 宽, translateX 移动 1 周期 (= size px) 完美无缝循环.
  const PERIODS = 2;
  const waveLayers = useMemo(() => {
    const specs: {
      phase: number;
      ampMul: number;
      speedMul: number;
      opacity: number;
      dir: 1 | -1;
      delayMul: number;
    }[] = [
      // 主层 — 大振幅, 慢, 向左
      { phase: 0, ampMul: 1.0, speedMul: 1.0, opacity: 0.55, dir: 1, delayMul: 0 },
      // 第二层 — 中振幅, 略快, 向右 (反向制造干涉感)
      { phase: Math.PI * 0.7, ampMul: 0.7, speedMul: 1.45, opacity: 0.34, dir: -1, delayMul: -0.4 },
      // 第三层 — 小振幅, 更快, 向左
      { phase: Math.PI * 1.3, ampMul: 0.45, speedMul: 1.9, opacity: 0.22, dir: 1, delayMul: -0.7 },
    ];
    return specs.slice(0, waveCount).map((s) => ({
      ...s,
      path: buildWavePath(size * 2, size, amp * s.ampMul, s.phase, PERIODS),
      speed: waveSpeed * s.speedMul,
      delay: waveSpeed * s.speedMul * s.delayMul,
    }));
  }, [size, amp, waveSpeed, waveCount]);

  // 水位文字颜色 (auto 模式: 水位 > 50% 时反白, 否则深字)
  const autoFg = percent > 50 ? '#fff' : 'var(--au-text-1)';
  const fgColor = valueColor === 'auto' ? autoFg : valueColor;

  // 容器形状的 SVG 元素 — clipPath / 边框 / track 共用
  const containerEl = (extraProps?: React.SVGProps<SVGElement>) =>
    shape === 'circle' ? (
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - borderWidth / 2}
        {...(extraProps as React.SVGProps<SVGCircleElement>)}
      />
    ) : (
      <rect
        x={borderWidth / 2}
        y={borderWidth / 2}
        width={size - borderWidth}
        height={size - borderWidth}
        rx={r}
        ry={r}
        {...(extraProps as React.SVGProps<SVGRectElement>)}
      />
    );

  const cls = [
    'au-liquid',
    paused ? 'is-paused' : '',
    loading ? 'is-loading' : '',
    glow ? 'has-glow' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (loading) {
    return (
      <div
        className={cls}
        style={{
          width: size,
          height: size,
          ...style,
        }}
        aria-busy
      >
        <div className="au-liquid__skeleton" />
      </div>
    );
  }

  const centerContent = formatter ? (
    formatter(clamped, percent)
  ) : showValue ? (
    <>
      <span className="au-liquid__value" style={{ color: fgColor }}>
        {Number.isInteger(percent) ? percent : percent.toFixed(1)}
        <span className="au-liquid__unit">%</span>
      </span>
      {label != null && (
        <span className="au-liquid__label" style={{ color: fgColor, opacity: 0.8 }}>
          {label}
        </span>
      )}
    </>
  ) : null;

  return (
    <div
      className={cls}
      style={{
        width: size,
        height: size,
        ['--au-liquid-glow-color' as string]: glow ? baseColor : undefined,
        ...style,
      }}
      role="meter"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={clamped}
      aria-label={typeof label === 'string' ? label : '水位图'}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="au-liquid__svg"
        aria-hidden
      >
        <defs>
          <clipPath id={clipId}>{containerEl()}</clipPath>
          {gradient && (
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradient[0]} />
              <stop offset="100%" stopColor={gradient[1]} />
            </linearGradient>
          )}
        </defs>

        {/* 1. 容器底色 (track) */}
        {containerEl({
          fill: trackColor ?? 'var(--au-bg-soft)',
          stroke: 'none',
        } as React.SVGProps<SVGElement>)}

        {/* 2. 水体 — clip 在容器内. 双层 g:
              外层 = 水位 translateY(top), 平滑过渡 (受值变化驱动)
              内层 = 整体上下"呼吸" Y bob, 让水面像在轻微起伏 (常驻动画) */}
        <g clipPath={`url(#${clipId})`}>
          <g
            className="au-liquid__level"
            style={{
              transform: `translateY(${top}px)`,
              transformOrigin: '0 0',
              transition: 'transform var(--au-motion-medium, 400ms) var(--au-ease)',
            }}
          >
            <g
              className="au-liquid__body"
              style={{
                animation: paused
                  ? 'none'
                  : `au-liquid-bob ${waveSpeed * 2.2}s ease-in-out infinite`,
                transformOrigin: '50% 50%',
              }}
            >
              {/* 2a. 实底水 — y=0 在水面, 向下铺到容器底部 (size 高足以覆盖, clipPath 兜底) */}
              <rect
                x={0}
                y={0}
                width={size}
                height={size}
                fill={gradient ? `url(#${gradId})` : baseColor}
              />
              {/* 2b. 波浪层 — 混向 parallax + 错相位 delay, 干涉感强.
                  关键: shift 永远是 -size (path 在 [-size, 0] 范围内移动, viewport [0, size] 始终被覆盖).
                  dir=-1 用 animation-direction: reverse 让 path 向右走, 而非把 shift 翻成正值
                  (那样 path 会移到 [size, 3*size] 完全离开 viewport, 露出底部闭合边缘) */}
              {waveLayers.map((layer, i) => (
                <path
                  key={i}
                  className="au-liquid__wave"
                  d={layer.path}
                  fill={gradient ? `url(#${gradId})` : baseColor}
                  fillOpacity={layer.opacity}
                  style={{
                    ['--au-liquid-shift' as string]: `-${size}px`,
                    animation: paused
                      ? 'none'
                      : `au-liquid-flow ${layer.speed}s linear ${layer.delay}s infinite${
                          layer.dir === -1 ? ' reverse' : ''
                        }`,
                    transformOrigin: '0 0',
                  }}
                />
              ))}
            </g>
          </g>
        </g>

        {/* 3. 边框 — 画在最上层 */}
        {borderWidth > 0 &&
          containerEl({
            fill: 'none',
            stroke: borderColor ?? 'var(--au-border-strong)',
            strokeWidth: borderWidth,
          } as React.SVGProps<SVGElement>)}
      </svg>

      {/* 4. 中央内容 */}
      {centerContent != null && <div className="au-liquid__center">{centerContent}</div>}
    </div>
  );
};

export default LiquidFill;
