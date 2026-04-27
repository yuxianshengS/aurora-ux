import React, { useMemo } from 'react';
import './GradientText.css';

export type GradientPreset = 'aurora' | 'sunset' | 'ocean' | 'forest' | 'cosmic' | 'metal';

const PRESET_GRADIENTS: Record<GradientPreset, string[]> = {
  aurora: ['#6366f1', '#a855f7', '#22d3ee', '#10b981', '#6366f1'],
  sunset: ['#fb923c', '#f43f5e', '#a855f7', '#facc15', '#fb923c'],
  ocean: ['#0ea5e9', '#3b82f6', '#06b6d4', '#0ea5e9'],
  forest: ['#10b981', '#84cc16', '#22d3ee', '#10b981'],
  cosmic: ['#7c3aed', '#ec4899', '#0ea5e9', '#facc15', '#7c3aed'],
  metal: ['#94a3b8', '#e2e8f0', '#94a3b8', '#475569', '#94a3b8'],
};

export interface GradientTextProps {
  /** 预设配色 (与 colors 二选一) */
  preset?: GradientPreset;
  /** 自定义渐变色, 推荐 3-5 个; 第一个最好和最后一个相同, 流动起来不会有断点 */
  colors?: string[];
  /** 是否做流动动画, 默认 true */
  animate?: boolean;
  /** 流动一周时长 (s) */
  duration?: number;
  /** 渐变方向 (deg) */
  angle?: number;
  /** 字号 (px), 默认继承 */
  size?: number;
  /** 字重 */
  weight?: number | 'normal' | 'medium' | 'semibold' | 'bold';
  /** 渲染元素, 默认 span; 'h1'~'h6' 用于标题语义 */
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const weightMap: Record<string, number> = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

const GradientText: React.FC<GradientTextProps> = ({
  preset = 'aurora',
  colors,
  animate = true,
  duration = 6,
  angle = 90,
  size,
  weight,
  as = 'span',
  children,
  className = '',
  style,
}) => {
  const palette = useMemo(() => {
    if (colors && colors.length > 0) return colors;
    return PRESET_GRADIENTS[preset] ?? PRESET_GRADIENTS.aurora;
  }, [colors, preset]);

  const gradient = `linear-gradient(${angle}deg, ${palette.join(', ')})`;
  const fontWeight =
    weight == null ? undefined : typeof weight === 'string' ? weightMap[weight] ?? 600 : weight;

  const finalStyle: React.CSSProperties = {
    backgroundImage: gradient,
    backgroundSize: animate ? '300% 100%' : '100% 100%',
    animationDuration: `${duration}s`,
    fontSize: size,
    fontWeight,
    ...style,
  };

  const cls = ['au-gradient-text', animate ? 'is-animated' : '', className].filter(Boolean).join(' ');
  const Tag = as as React.ElementType;

  return (
    <Tag className={cls} style={finalStyle}>
      {children}
    </Tag>
  );
};

export default GradientText;
