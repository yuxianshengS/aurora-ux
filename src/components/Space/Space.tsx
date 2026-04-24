import React from 'react';
import './Space.css';

export type SpaceSize = 'small' | 'medium' | 'large' | number;
export type SpaceDirection = 'horizontal' | 'vertical';
export type SpaceAlign = 'start' | 'end' | 'center' | 'baseline';

export interface SpaceProps {
  direction?: SpaceDirection;
  size?: SpaceSize | [SpaceSize, SpaceSize];
  align?: SpaceAlign;
  wrap?: boolean;
  split?: React.ReactNode;
  block?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const sizeToPx = (s: SpaceSize): number => {
  if (typeof s === 'number') return s;
  if (s === 'small') return 8;
  if (s === 'large') return 24;
  return 16;
};

const Space: React.FC<SpaceProps> = ({
  direction = 'horizontal',
  size = 'small',
  align,
  wrap,
  split,
  block,
  children,
  className = '',
  style,
}) => {
  const items = React.Children.toArray(children).filter((c) => c != null);

  const [hGap, vGap] = Array.isArray(size)
    ? [sizeToPx(size[0]), sizeToPx(size[1])]
    : [sizeToPx(size), sizeToPx(size)];

  const mergedStyle: React.CSSProperties = {
    ...(direction === 'horizontal'
      ? { columnGap: hGap, rowGap: wrap ? vGap : 0 }
      : { rowGap: vGap }),
    ...style,
  };

  const finalAlign: SpaceAlign =
    align ?? (direction === 'horizontal' ? 'center' : 'start');

  const cls = [
    'au-space',
    `au-space--${direction}`,
    `au-space--align-${finalAlign}`,
    wrap ? 'is-wrap' : '',
    block ? 'is-block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls} style={mergedStyle}>
      {items.map((child, i) => (
        <React.Fragment key={i}>
          <div className="au-space__item">{child}</div>
          {split != null && i < items.length - 1 && (
            <span className="au-space__split">{split}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Space;
