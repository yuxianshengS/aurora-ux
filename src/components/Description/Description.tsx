import React from 'react';
import './Description.css';

export interface DescriptionItem {
  label: React.ReactNode;
  value: React.ReactNode;
  /** 跨多少列, 默认 1 */
  span?: number;
  key?: string | number;
}

export type DescriptionLayout = 'horizontal' | 'vertical';
export type DescriptionSize = 'small' | 'default' | 'large';

export interface DescriptionProps {
  title?: React.ReactNode;
  /** 右上角额外操作 (按钮等) */
  extra?: React.ReactNode;
  /** 描述项数组 */
  items: DescriptionItem[];
  /** 列数 (默认 3, 响应式可传不同值) */
  column?: number;
  /** 布局: horizontal = label 在 value 左侧; vertical = label 在 value 上方 */
  layout?: DescriptionLayout;
  size?: DescriptionSize;
  /** 显示边框 (网格线) */
  bordered?: boolean;
  /** label 列宽 (horizontal 模式) */
  labelWidth?: number | string;
  /** 冒号 (horizontal 模式) */
  colon?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const Description: React.FC<DescriptionProps> = ({
  title,
  extra,
  items,
  column = 3,
  layout = 'horizontal',
  size = 'default',
  bordered = false,
  labelWidth,
  colon = false,
  className = '',
  style,
}) => {
  const cls = [
    'au-desc',
    `au-desc--${layout}`,
    `au-desc--${size}`,
    bordered ? 'is-bordered' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // 把 items 按行分组, 每行总 span <= column
  const rows: DescriptionItem[][] = [];
  let buf: DescriptionItem[] = [];
  let used = 0;
  for (const it of items) {
    const span = Math.min(column, Math.max(1, it.span ?? 1));
    if (used + span > column) {
      rows.push(buf);
      buf = [];
      used = 0;
    }
    buf.push({ ...it, span });
    used += span;
    if (used >= column) {
      rows.push(buf);
      buf = [];
      used = 0;
    }
  }
  if (buf.length) rows.push(buf);

  const labelW = typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth;

  return (
    <div className={cls} style={style}>
      {(title || extra) && (
        <div className="au-desc__head">
          {title && <div className="au-desc__title">{title}</div>}
          {extra && <div className="au-desc__extra">{extra}</div>}
        </div>
      )}
      <table className="au-desc__table">
        <tbody>
          {rows.map((row, ri) => {
            if (layout === 'horizontal') {
              return (
                <tr key={ri}>
                  {row.flatMap((it, i) => [
                    <th
                      key={`l-${i}`}
                      className="au-desc__label"
                      style={labelW ? { width: labelW } : undefined}
                    >
                      {it.label}
                      {colon ? '：' : ''}
                    </th>,
                    <td
                      key={`v-${i}`}
                      className="au-desc__value"
                      colSpan={(it.span ?? 1) * 2 - 1}
                    >
                      {it.value}
                    </td>,
                  ])}
                </tr>
              );
            }
            // vertical
            return (
              <React.Fragment key={ri}>
                <tr>
                  {row.map((it, i) => (
                    <th key={i} className="au-desc__label" colSpan={it.span ?? 1}>
                      {it.label}
                    </th>
                  ))}
                </tr>
                <tr>
                  {row.map((it, i) => (
                    <td key={i} className="au-desc__value" colSpan={it.span ?? 1}>
                      {it.value}
                    </td>
                  ))}
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Description;
