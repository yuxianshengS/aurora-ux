import React from 'react';
import './Row.css';

export interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 等分列数 (会生成 grid-template-columns: repeat(N, 1fr)) */
  cols?: number;
  /**
   * 自定义 CSS grid-template-columns, 直接写 CSS 字符串。
   * 设置后优先于 cols, 可做不等宽 (例: "1fr 2fr auto", "200px 1fr")
   */
  template?: string;
  /** 列间距 (px 或任意 CSS 长度) */
  gap?: number | string;
  /** 行间距 (换行时); 不传则跟 gap 一致 */
  rowGap?: number | string;
  /** 垂直对齐 */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** 水平对齐 (容器内组件靠左 / 居中 / 靠右 / 填满) */
  justifyItems?: 'start' | 'center' | 'end' | 'stretch';
  /** 窄屏自动折行 (每行最大 N 列), 为 true 时 cols 仅作为桌面上限 */
  responsive?: boolean;
}

const Row: React.FC<RowProps> = ({
  cols = 2,
  template,
  gap = 12,
  rowGap,
  align = 'start',
  justifyItems = 'stretch',
  responsive,
  className = '',
  style,
  children,
  ...rest
}) => {
  const cls = [
    'au-row',
    `au-row--align-${align}`,
    `au-row--just-${justifyItems}`,
    responsive ? 'is-responsive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const gapVal = typeof gap === 'number' ? `${gap}px` : gap;
  const rowGapVal =
    rowGap != null ? (typeof rowGap === 'number' ? `${rowGap}px` : rowGap) : gapVal;

  return (
    <div
      className={cls}
      style={{
        ['--au-row-cols' as string]: String(cols),
        // template 设置了就覆盖内部 repeat() 规则
        ...(template ? { gridTemplateColumns: template } : null),
        columnGap: gapVal,
        rowGap: rowGapVal,
        justifyItems,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Row;
