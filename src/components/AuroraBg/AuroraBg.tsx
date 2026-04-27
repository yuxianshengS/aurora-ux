import React, { useMemo } from 'react';
import './AuroraBg.css';

export type AuroraPreset = 'aurora' | 'sunset' | 'ocean' | 'forest' | 'cosmic';

const PRESET_COLORS: Record<AuroraPreset, string[]> = {
  aurora: ['#6366f1', '#a855f7', '#22d3ee', '#10b981', '#f472b6'],
  sunset: ['#fb923c', '#f43f5e', '#a855f7', '#facc15'],
  ocean: ['#0ea5e9', '#3b82f6', '#06b6d4', '#14b8a6'],
  forest: ['#10b981', '#84cc16', '#22d3ee', '#0ea5e9'],
  cosmic: ['#1e1b4b', '#7c3aed', '#ec4899', '#0ea5e9', '#facc15'],
};

export interface AuroraBgProps {
  /** 预设配色 (与 colors 二选一, colors 优先) */
  preset?: AuroraPreset;
  /** 自定义颜色数组, 4-6 个最佳 */
  colors?: string[];
  /** 模糊度 (px), 越大越柔, 默认 100 */
  blur?: number;
  /** 动画速度倍率, 1 = 默认 (24s 一圈), 越大越慢 */
  speed?: number;
  /** 整体不透明度, 0-1, 默认 0.7 */
  intensity?: number;
  /** 颗粒纹理叠加 (避免色带断层), 默认 true */
  grain?: boolean;
  /** 固定为视口背景 (整页用), 默认 false 跟随父容器 */
  fixed?: boolean;
  /** 内容会渲染在极光层之上 */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const AuroraBg: React.FC<AuroraBgProps> = ({
  preset = 'aurora',
  colors,
  blur = 100,
  speed = 1,
  intensity = 0.7,
  grain = true,
  fixed = false,
  children,
  className = '',
  style,
}) => {
  const palette = useMemo(() => {
    if (colors && colors.length > 0) return colors;
    return PRESET_COLORS[preset] ?? PRESET_COLORS.aurora;
  }, [colors, preset]);

  // 每个色带分配不同的 transform-origin / 时长 / 延迟, 让飘动看起来不同步
  const blobs = useMemo(
    () =>
      palette.map((color, i) => {
        const duration = (18 + i * 5) * speed;
        const delay = -i * 3;
        const size = 60 + (i % 3) * 20;
        return {
          color,
          duration,
          delay,
          size,
          variant: i % 4,
        };
      }),
    [palette, speed],
  );

  const cls = ['au-aurora-bg', fixed ? 'is-fixed' : '', className].filter(Boolean).join(' ');

  return (
    <div className={cls} style={style}>
      <div
        className="au-aurora-bg__layer"
        style={{ filter: `blur(${blur}px)`, opacity: intensity }}
        aria-hidden
      >
        {blobs.map((b, i) => (
          <span
            key={i}
            className={`au-aurora-bg__blob au-aurora-bg__blob--v${b.variant}`}
            style={{
              background: b.color,
              width: `${b.size}%`,
              height: `${b.size}%`,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
            }}
          />
        ))}
      </div>
      {grain && <div className="au-aurora-bg__grain" aria-hidden />}
      {children != null && <div className="au-aurora-bg__content">{children}</div>}
    </div>
  );
};

export default AuroraBg;
