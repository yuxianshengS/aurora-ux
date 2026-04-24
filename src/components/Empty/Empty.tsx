import React from 'react';
import './Empty.css';

export interface EmptyProps {
  image?: React.ReactNode | string;
  imageStyle?: React.CSSProperties;
  description?: React.ReactNode | false;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const DefaultImage: React.FC = () => (
  <svg
    viewBox="0 0 184 152"
    width="120"
    height="100"
    aria-hidden
    xmlns="http://www.w3.org/2000/svg"
  >
    <g fill="none" fillRule="evenodd">
      <g transform="translate(24 31.67)">
        <ellipse
          fill="var(--au-border)"
          fillOpacity=".45"
          cx="67.797"
          cy="106.89"
          rx="67.797"
          ry="12.668"
        />
        <path
          d="M122.034 69.674 98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674Z"
          fill="var(--au-bg)"
          stroke="var(--au-border-strong)"
          strokeWidth="1.2"
        />
        <path
          d="M33.29 69.674h20.03c2.038 0 3.85 1.225 4.518 3.11l.54 1.547a4.792 4.792 0 0 0 4.517 3.11h20.203a4.792 4.792 0 0 0 4.516-3.102l.582-1.558a4.778 4.778 0 0 1 4.516-3.107h20.324v27.27c0 3.597-2.891 6.509-6.458 6.509H39.748c-3.567 0-6.458-2.912-6.458-6.509v-27.27Z"
          fill="var(--au-bg-mute)"
          stroke="var(--au-border-strong)"
          strokeWidth="1.2"
        />
      </g>
      <path
        d="M149 72.93c0-1.538 1.124-2.836 2.605-3.042l10.194-1.336c1.65-.205 3.201 1.132 3.201 2.83v16.588c0 1.67-1.494 3.003-3.138 2.847l-10.194-.94c-1.526-.141-2.668-1.438-2.668-2.968V72.93Z"
        fill="var(--au-border-strong)"
      />
      <path
        d="M33 52.854c0-1.539 1.123-2.836 2.604-3.043l10.195-1.336c1.649-.205 3.2 1.133 3.2 2.83v16.589c0 1.67-1.494 3.002-3.138 2.847l-10.194-.94C34.141 69.66 33 68.363 33 66.834v-13.98Z"
        fill="var(--au-border-strong)"
      />
    </g>
  </svg>
);

const Empty: React.FC<EmptyProps> = ({
  image,
  imageStyle,
  description = '暂无数据',
  children,
  className = '',
  style,
}) => {
  const imageNode =
    typeof image === 'string' ? (
      <img src={image} alt="empty" style={imageStyle} />
    ) : (
      image ?? <DefaultImage />
    );

  return (
    <div className={['au-empty', className].filter(Boolean).join(' ')} style={style}>
      <div className="au-empty__image" style={imageStyle}>
        {imageNode}
      </div>
      {description !== false && (
        <div className="au-empty__desc">{description}</div>
      )}
      {children && <div className="au-empty__footer">{children}</div>}
    </div>
  );
};

export default Empty;
