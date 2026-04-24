import React from 'react';
import './Text.css';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption';
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type TextColor =
  | 'default'
  | 'secondary'
  | 'tertiary'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger';

export interface TextProps {
  /** 文本内容 — 可以是字符串, 也可以是富 JSX */
  children?: React.ReactNode;
  /** 同 children, 作为 prop 用 (低代码拖拽场景方便) */
  content?: React.ReactNode;
  /** 语义变体 — 自动选择 h1/h2/h3/h4/p/span 标签, 同时套对应的默认字号/字重 */
  variant?: TextVariant;
  weight?: TextWeight;
  align?: TextAlign;
  /** 预设颜色 (default/secondary/…) 或任意 CSS 颜色字符串 */
  color?: TextColor | string;
  /** 显式字号 (px), 覆盖 variant 默认值 */
  size?: number;
  /** 行高 — 数字 (相对) 或字符串 */
  lineHeight?: number | string;
  /** true = 单行省略号; 数字 = 多行省略号 (WebKit line-clamp) */
  truncate?: boolean | number;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  /** 文字可被复制选中 (默认 true) */
  selectable?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const COLOR_PRESETS: Record<TextColor, string> = {
  default: 'var(--au-text-1)',
  secondary: 'var(--au-text-2)',
  tertiary: 'var(--au-text-3)',
  primary: 'var(--au-primary)',
  success: 'var(--au-success, #10b981)',
  warning: 'var(--au-warning, #f59e0b)',
  danger: 'var(--au-danger, #ef4444)',
};

const VARIANT_TAG: Record<TextVariant, keyof React.JSX.IntrinsicElements> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  body: 'p',
  caption: 'span',
};

const resolveColor = (c?: string): string | undefined => {
  if (!c) return undefined;
  if (c in COLOR_PRESETS) return COLOR_PRESETS[c as TextColor];
  return c;
};

const Text: React.FC<TextProps> = ({
  children,
  content,
  variant = 'body',
  weight,
  align,
  color,
  size,
  lineHeight,
  truncate,
  italic,
  underline,
  strikethrough,
  selectable = true,
  className = '',
  style,
}) => {
  const Tag = VARIANT_TAG[variant] as React.ElementType;
  const decorations: string[] = [];
  if (underline) decorations.push('underline');
  if (strikethrough) decorations.push('line-through');

  const clampStyle: React.CSSProperties = {};
  if (truncate === true) {
    clampStyle.whiteSpace = 'nowrap';
    clampStyle.overflow = 'hidden';
    clampStyle.textOverflow = 'ellipsis';
  } else if (typeof truncate === 'number' && truncate > 0) {
    clampStyle.display = '-webkit-box';
    (clampStyle as Record<string, unknown>).WebkitLineClamp = truncate;
    (clampStyle as Record<string, unknown>).WebkitBoxOrient = 'vertical';
    clampStyle.overflow = 'hidden';
  }

  const computed: React.CSSProperties = {
    color: resolveColor(color),
    textAlign: align,
    fontSize: size != null ? `${size}px` : undefined,
    lineHeight,
    fontStyle: italic ? 'italic' : undefined,
    textDecoration: decorations.length ? decorations.join(' ') : undefined,
    userSelect: selectable ? undefined : 'none',
    margin: 0, // 覆盖浏览器 h1/h2/p 默认上下间距, 低代码拖拽场景下更可控
    ...clampStyle,
    ...style,
  };

  const cls = ['au-text', `au-text--${variant}`, weight ? `au-text--w-${weight}` : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={cls} style={computed}>
      {content ?? children}
    </Tag>
  );
};

export default Text;
