import React from 'react';
import Sparkline, { type SparklineType } from '../Sparkline/Sparkline';
import './KpiCard.css';

export type KpiStatus = 'default' | 'success' | 'warning' | 'danger' | 'primary';

export interface KpiDelta {
  value: number;
  direction?: 'up' | 'down' | 'flat';
  /** 'positive-up' (涨 = 好, 默认) / 'positive-down' (跌 = 好, 如成本/流失率) */
  mode?: 'positive-up' | 'positive-down';
  suffix?: React.ReactNode;
  label?: React.ReactNode;
}

export interface KpiCardProps {
  title: React.ReactNode;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  formatter?: (v: number | string) => React.ReactNode;
  precision?: number;
  delta?: KpiDelta;
  trend?: {
    data: number[];
    type?: SparklineType;
    color?: string;
    height?: number;
  };
  icon?: React.ReactNode;
  status?: KpiStatus;
  loading?: boolean;
  extra?: React.ReactNode;
  bordered?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const ArrowUp: React.FC = () => (
  <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden>
    <path d="M2 6L5 3L8 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ArrowDown: React.FC = () => (
  <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden>
    <path d="M2 4L5 7L8 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Flat: React.FC = () => (
  <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden>
    <path d="M2 5h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const formatNumber = (v: number | string, precision?: number): string => {
  if (typeof v !== 'number') return String(v);
  if (precision != null) return v.toFixed(precision);
  return v.toLocaleString();
};

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  formatter,
  precision,
  delta,
  trend,
  icon,
  status = 'default',
  loading,
  extra,
  bordered = true,
  size = 'medium',
  className = '',
  style,
  onClick,
}) => {
  const dir = delta?.direction ?? (typeof delta?.value === 'number' ? (delta!.value > 0 ? 'up' : delta!.value < 0 ? 'down' : 'flat') : 'flat');
  const mode = delta?.mode ?? 'positive-up';
  const isGoodDelta =
    dir === 'flat'
      ? 'neutral'
      : mode === 'positive-up'
        ? dir === 'up'
          ? 'good'
          : 'bad'
        : dir === 'down'
          ? 'good'
          : 'bad';

  const cls = [
    'au-kpi',
    `au-kpi--${size}`,
    `au-kpi--${status}`,
    bordered ? 'is-bordered' : '',
    onClick ? 'is-clickable' : '',
    loading ? 'is-loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const rendered = formatter ? formatter(value) : formatNumber(value, precision);

  return (
    <div className={cls} style={style} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      <div className="au-kpi__head">
        <div className="au-kpi__title">{title}</div>
        {(icon || extra) && (
          <div className="au-kpi__head-right">
            {icon && <span className="au-kpi__icon">{icon}</span>}
            {extra}
          </div>
        )}
      </div>
      <div className="au-kpi__value-row">
        {loading ? (
          <div className="au-kpi__skeleton" />
        ) : (
          <div className="au-kpi__value">
            {prefix && <span className="au-kpi__affix">{prefix}</span>}
            <span className="au-kpi__num">{rendered}</span>
            {suffix && <span className="au-kpi__affix au-kpi__affix--suffix">{suffix}</span>}
          </div>
        )}
      </div>
      {(delta || trend) && (
        <div className="au-kpi__foot">
          {delta && (
            <span className={['au-kpi__delta', `is-${isGoodDelta}`].join(' ')}>
              {dir === 'up' ? <ArrowUp /> : dir === 'down' ? <ArrowDown /> : <Flat />}
              <span>{Math.abs(delta.value)}{delta.suffix ?? '%'}</span>
              {delta.label && <span className="au-kpi__delta-label">{delta.label}</span>}
            </span>
          )}
          {trend && (
            <Sparkline
              data={trend.data}
              type={trend.type ?? 'area'}
              color={trend.color}
              width={100}
              height={trend.height ?? 28}
              className="au-kpi__trend"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default KpiCard;
