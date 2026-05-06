import React from 'react';
import { useLocale } from '../ConfigProvider/ConfigProvider';
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

/**
 * 数字格式化:
 * - 用户显式传 groupSeparator (非 ',') 时走老路 (手写分组), 让用户能控制
 * - 否则走 Intl.NumberFormat(numberFormat) — 跟 ConfigProvider locale 一致,
 *   未来切德语/法语自动正确
 */
const formatNumber = (
  v: number,
  precision: number | undefined,
  sep: string | undefined,
  numberFormat: string,
): string => {
  if (sep && sep !== ',') {
    const fixed = precision != null ? v.toFixed(precision) : String(v);
    const [int, dec] = fixed.split('.');
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    return dec ? `${grouped}.${dec}` : grouped;
  }
  return new Intl.NumberFormat(numberFormat, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(v);
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
  const locale = useLocale();
  let display: React.ReactNode;
  if (loading) {
    display = <span className="au-statistic__skeleton">—</span>;
  } else if (formatter) {
    display = formatter(value as number | string);
  } else if (typeof value === 'number') {
    display = formatNumber(value, precision, groupSeparator, locale.numberFormat);
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
