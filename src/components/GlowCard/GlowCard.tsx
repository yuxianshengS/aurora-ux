import React, { useRef } from 'react';
import './GlowCard.css';

export interface GlowCardProps {
  /** 光晕主色 (CSS 颜色), 默认品牌主色 */
  glowColor?: string;
  /** 光晕半径 (px), 默认 240 */
  glowSize?: number;
  /** 光晕强度 0-1, 默认 0.6 */
  intensity?: number;
  /** 边框流光, 默认 true (有 conic-gradient 旋转描边) */
  border?: boolean;
  /** 圆角 (px), 默认 16 */
  radius?: number;
  /** 卡片内边距, 默认 24 */
  padding?: number | string;
  /** 内容 */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const GlowCard: React.FC<GlowCardProps> = ({
  glowColor = 'var(--au-primary, #5b8def)',
  glowSize = 240,
  intensity = 0.6,
  border = true,
  radius = 16,
  padding = 24,
  children,
  className = '',
  style,
  onClick,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--glow-x', `${x}px`);
    el.style.setProperty('--glow-y', `${y}px`);
    el.style.setProperty('--glow-opacity', String(intensity));
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--glow-opacity', '0');
  };

  const cls = ['au-glow-card', border ? 'has-border' : '', className].filter(Boolean).join(' ');

  const cssVars = {
    '--glow-color': glowColor,
    '--glow-size': `${glowSize}px`,
    '--glow-radius': `${radius}px`,
    '--glow-x': '50%',
    '--glow-y': '50%',
    '--glow-opacity': '0',
  } as React.CSSProperties;

  return (
    <div
      ref={ref}
      className={cls}
      style={{ ...cssVars, padding, ...style }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
    >
      {border && <span className="au-glow-card__border" aria-hidden />}
      <span className="au-glow-card__halo" aria-hidden />
      <div className="au-glow-card__content">{children}</div>
    </div>
  );
};

export default GlowCard;
