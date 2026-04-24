import React, { useEffect, useState } from 'react';
import './Avatar.css';

export type AvatarShape = 'circle' | 'square';
export type AvatarSize = 'small' | 'medium' | 'large' | number;

export interface AvatarProps {
  src?: string;
  srcSet?: string;
  alt?: string;
  icon?: React.ReactNode;
  shape?: AvatarShape;
  size?: AvatarSize;
  color?: string;
  background?: string;
  gap?: number;
  children?: React.ReactNode;
  onError?: () => boolean | void;
  className?: string;
  style?: React.CSSProperties;
}

const sizeToPx = (s: AvatarSize): number => {
  if (typeof s === 'number') return s;
  if (s === 'small') return 24;
  if (s === 'large') return 40;
  return 32;
};

const Avatar: React.FC<AvatarProps> & { Group: typeof AvatarGroup } = ({
  src,
  srcSet,
  alt,
  icon,
  shape = 'circle',
  size = 'medium',
  color,
  background,
  gap = 4,
  children,
  onError,
  className = '',
  style,
}) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [src]);

  const px = sizeToPx(size);
  const mergedStyle: React.CSSProperties = {
    width: px,
    height: px,
    lineHeight: `${px}px`,
    fontSize: Math.max(12, Math.floor(px / 2.4)),
    ...(color ? { color } : {}),
    ...(background ? { background } : {}),
    ...style,
  };

  const cls = [
    'au-avatar',
    `au-avatar--${shape}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const showImg = src && !failed;
  const handleError = () => {
    const ret = onError?.();
    if (ret !== false) setFailed(true);
  };

  let inner: React.ReactNode;
  if (showImg) {
    inner = <img src={src} srcSet={srcSet} alt={alt} onError={handleError} draggable={false} />;
  } else if (icon) {
    inner = <span className="au-avatar__icon">{icon}</span>;
  } else if (typeof children === 'string') {
    const len = children.length;
    const maxW = px - gap * 2;
    const scale = len > 1 ? Math.min(1, maxW / (len * Math.floor(px / 2.4) * 0.62)) : 1;
    inner = (
      <span
        className="au-avatar__text"
        style={{
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'center center',
        }}
      >
        {children}
      </span>
    );
  } else {
    inner = children;
  }

  return (
    <span className={cls} style={mergedStyle}>
      {inner}
    </span>
  );
};

export interface AvatarGroupProps {
  maxCount?: number;
  maxStyle?: React.CSSProperties;
  size?: AvatarSize;
  shape?: AvatarShape;
  overflow?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({
  maxCount,
  maxStyle,
  size,
  shape = 'circle',
  overflow,
  children,
  className = '',
  style,
}) => {
  const kids = React.Children.toArray(children) as React.ReactElement[];
  const total = kids.length;
  const shown = maxCount != null && total > maxCount ? kids.slice(0, maxCount) : kids;
  const rest = maxCount != null && total > maxCount ? total - maxCount : 0;

  return (
    <span className={['au-avatar-group', className].filter(Boolean).join(' ')} style={style}>
      {shown.map((child, i) => {
        const props: Partial<AvatarProps> = {};
        if (size != null && child.props.size == null) props.size = size;
        if (child.props.shape == null) props.shape = shape;
        return React.cloneElement(child as React.ReactElement<AvatarProps>, { key: i, ...props });
      })}
      {rest > 0 && (
        <Avatar size={size} shape={shape} style={maxStyle} className="au-avatar--overflow">
          {overflow ?? `+${rest}`}
        </Avatar>
      )}
    </span>
  );
};

Avatar.Group = AvatarGroup;

export { AvatarGroup };
export default Avatar;
