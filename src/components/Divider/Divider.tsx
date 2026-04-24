import React from 'react';
import './Divider.css';

export type DividerOrientation = 'left' | 'right' | 'center';
export type DividerDirection = 'horizontal' | 'vertical';

export interface DividerProps {
  type?: DividerDirection;
  orientation?: DividerOrientation;
  dashed?: boolean;
  plain?: boolean;
  orientationMargin?: number | string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Divider: React.FC<DividerProps> = ({
  type = 'horizontal',
  orientation = 'center',
  dashed,
  plain,
  orientationMargin,
  children,
  className = '',
  style,
}) => {
  const isV = type === 'vertical';
  const hasText = !isV && children != null;

  const cls = [
    'au-divider',
    isV ? 'au-divider--vertical' : 'au-divider--horizontal',
    dashed ? 'is-dashed' : '',
    plain ? 'is-plain' : '',
    hasText ? `au-divider--with-text au-divider--text-${orientation}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const textStyle: React.CSSProperties = {};
  if (orientationMargin != null && orientation !== 'center') {
    const v = typeof orientationMargin === 'number' ? `${orientationMargin}px` : orientationMargin;
    if (orientation === 'left') textStyle.marginLeft = v;
    if (orientation === 'right') textStyle.marginRight = v;
  }

  if (isV) {
    return <span className={cls} style={style} role="separator" aria-orientation="vertical" />;
  }

  if (hasText) {
    return (
      <div className={cls} style={style} role="separator">
        <span className="au-divider__text" style={textStyle}>
          {children}
        </span>
      </div>
    );
  }

  return <div className={cls} style={style} role="separator" />;
};

export default Divider;
