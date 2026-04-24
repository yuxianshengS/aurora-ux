import React from 'react';

export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type FlexJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'between'
  | 'around'
  | 'evenly'
  | 'stretch';
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: FlexDirection;
  gap?: number | string;
  justify?: FlexJustify;
  align?: FlexAlign;
  wrap?: boolean;
  /** 内边距 (px 或 CSS 长度). 数组 [上下, 左右] / [上, 右, 下, 左] 亦可 */
  padding?: number | string | number[];
  /** 背景色 (快速添加卡片感, 不传就透明) */
  background?: string;
  /** 圆角 (配合 background) */
  radius?: number | string;
  /** inline-flex */
  inline?: boolean;
}

const JUSTIFY_MAP: Record<FlexJustify, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
  stretch: 'stretch',
};

const ALIGN_MAP: Record<FlexAlign, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

const toCss = (v: number | string | undefined) =>
  v == null ? undefined : typeof v === 'number' ? `${v}px` : v;

const padToCss = (v: FlexProps['padding']) => {
  if (v == null) return undefined;
  if (Array.isArray(v)) return v.map((x) => (typeof x === 'number' ? `${x}px` : x)).join(' ');
  return typeof v === 'number' ? `${v}px` : v;
};

const Flex: React.FC<FlexProps> = ({
  direction = 'row',
  gap,
  justify,
  align,
  wrap,
  padding,
  background,
  radius,
  inline,
  className = '',
  style,
  children,
  ...rest
}) => {
  const computed: React.CSSProperties = {
    display: inline ? 'inline-flex' : 'flex',
    flexDirection: direction,
    gap: toCss(gap),
    justifyContent: justify ? JUSTIFY_MAP[justify] : undefined,
    alignItems: align ? ALIGN_MAP[align] : undefined,
    flexWrap: wrap ? 'wrap' : undefined,
    padding: padToCss(padding),
    background,
    borderRadius: toCss(radius),
    minWidth: 0,
    ...style,
  };
  return (
    <div className={['au-flex', className].filter(Boolean).join(' ')} style={computed} {...rest}>
      {children}
    </div>
  );
};

export default Flex;
