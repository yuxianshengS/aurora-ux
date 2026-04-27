import React from 'react';
import './Statistic.css';

export interface StatisticProps {
  title?: React.ReactNode;
  value?: number | string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  /** 数字小数位 */
  precision?: number;
  /** 千分位分隔 */
  groupSeparator?: string;
  /** 自定义格式化 (优先级高于 precision/groupSeparator) */
  formatter?: (v: number | string) => React.ReactNode;
  /** 数值字号 */
  valueStyle?: React.CSSProperties;
  /** 加载占位 */
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const formatNumber = (v: number, precision?: number, sep?: string): string => {
  const fixed = precision != null ? v.toFixed(precision) : String(v);
  if (!sep) return fixed;
  const [int, dec] = fixed.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  return dec ? `${grouped}.${dec}` : grouped;
};

const Statistic: React.FC<StatisticProps> = ({
  title,
  value,
  prefix,
  suffix,
  precision,
  groupSeparator = ',',
  formatter,
  valueStyle,
  loading,
  className = '',
  style,
}) => {
  let display: React.ReactNode;
  if (loading) {
    display = <span className="au-statistic__skeleton">—</span>;
  } else if (formatter) {
    display = formatter(value as number | string);
  } else if (typeof value === 'number') {
    display = formatNumber(value, precision, groupSeparator);
  } else {
    display = value;
  }
  return (
    <div className={['au-statistic', className].filter(Boolean).join(' ')} style={style}>
      {title != null && <div className="au-statistic__title">{title}</div>}
      <div className="au-statistic__value" style={valueStyle}>
        {prefix != null && <span className="au-statistic__prefix">{prefix}</span>}
        <span className="au-statistic__num">{display}</span>
        {suffix != null && <span className="au-statistic__suffix">{suffix}</span>}
      </div>
    </div>
  );
};

export default Statistic;
