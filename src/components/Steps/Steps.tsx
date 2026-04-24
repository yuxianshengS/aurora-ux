import React from 'react';
import './Steps.css';

export type StepStatus = 'wait' | 'process' | 'finish' | 'error';
export type StepsDirection = 'horizontal' | 'vertical';
export type StepsType = 'default' | 'dot' | 'navigation';
export type StepsSize = 'default' | 'small';

export interface StepItem {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  status?: StepStatus;
  disabled?: boolean;
}

export interface StepsProps {
  items: StepItem[];
  current?: number;
  status?: StepStatus;
  direction?: StepsDirection;
  type?: StepsType;
  size?: StepsSize;
  labelPlacement?: 'horizontal' | 'vertical';
  onChange?: (current: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

const CheckIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
    <path
      d="M5 12.5l4.5 4.5L19 7.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ErrorIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
    <path
      d="M7 7l10 10M17 7l-10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

const computeStatus = (index: number, current: number, itemStatus?: StepStatus, globalStatus?: StepStatus): StepStatus => {
  if (itemStatus) return itemStatus;
  if (index < current) return 'finish';
  if (index === current) return globalStatus ?? 'process';
  return 'wait';
};

const Steps: React.FC<StepsProps> = ({
  items,
  current = 0,
  status: globalStatus,
  direction = 'horizontal',
  type = 'default',
  size = 'default',
  labelPlacement,
  onChange,
  className = '',
  style,
}) => {
  const isNav = type === 'navigation';
  const isDot = type === 'dot';
  const clickable = !!onChange;

  const cls = [
    'au-steps',
    `au-steps--${direction}`,
    `au-steps--${type}`,
    `au-steps--${size}`,
    labelPlacement === 'vertical' && direction === 'horizontal' ? 'label-vertical' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls} style={style} role="list">
      {items.map((item, i) => {
        const st = computeStatus(i, current, item.status, globalStatus);
        const last = i === items.length - 1;
        const itemCls = [
          'au-steps__item',
          `is-${st}`,
          item.disabled ? 'is-disabled' : '',
          clickable && !item.disabled ? 'is-clickable' : '',
          last ? 'is-last' : '',
        ]
          .filter(Boolean)
          .join(' ');

        const iconNode = isDot ? (
          <span className="au-steps__dot" />
        ) : item.icon ? (
          <span className="au-steps__custom-icon">{item.icon}</span>
        ) : st === 'finish' ? (
          <CheckIcon />
        ) : st === 'error' ? (
          <ErrorIcon />
        ) : (
          <span className="au-steps__num">{i + 1}</span>
        );

        const handleClick = () => {
          if (!clickable || item.disabled) return;
          onChange(i);
        };

        return (
          <div
            key={i}
            className={itemCls}
            role="listitem"
            aria-current={i === current ? 'step' : undefined}
            onClick={handleClick}
            tabIndex={clickable && !item.disabled ? 0 : -1}
            onKeyDown={(e) => {
              if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                handleClick();
              }
            }}
          >
            <div className="au-steps__indicator">
              <div className="au-steps__tail" />
              <div className="au-steps__node">{iconNode}</div>
            </div>
            <div className="au-steps__content">
              {item.title && <div className="au-steps__title">{item.title}</div>}
              {item.description && <div className="au-steps__description">{item.description}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Steps;
