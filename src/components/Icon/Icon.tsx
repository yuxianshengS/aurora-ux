import React from 'react';
import './Icon.css';

export interface IconProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** iconfont 名字,不含 `icon-` 前缀。例如 `lock`、`add-fill` */
  name: string;
  /** 图标尺寸,数字按 px 处理,字符串按 CSS 单位原样使用。默认跟随父级 font-size */
  size?: number | string;
  /** 图标颜色,默认 currentColor */
  color?: string;
  /** 旋转动画 */
  spin?: boolean;
  /** 旋转角度,单位度 */
  rotate?: number;
}

const Icon: React.FC<IconProps> = ({
  name,
  size,
  color,
  spin = false,
  rotate,
  className = '',
  style,
  ...rest
}) => {
  const cls = [
    'au-icon',
    'iconfont',
    `icon-${name}`,
    spin ? 'au-icon--spin' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const merged: React.CSSProperties = { ...style };
  if (size !== undefined) {
    merged.fontSize = typeof size === 'number' ? `${size}px` : size;
  }
  if (color) merged.color = color;
  if (rotate !== undefined) merged.transform = `rotate(${rotate}deg)`;

  return <i className={cls} style={merged} aria-hidden {...rest} />;
};

export default Icon;
