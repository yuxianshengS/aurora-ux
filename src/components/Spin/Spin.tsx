import React, { useEffect, useState } from 'react';
import './Spin.css';

export type SpinSize = 'small' | 'medium' | 'large';

export interface SpinProps {
  spinning?: boolean;
  tip?: React.ReactNode;
  size?: SpinSize;
  indicator?: React.ReactNode;
  delay?: number;
  wrapperClassName?: string;
  fullscreen?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const DefaultIndicator: React.FC<{ size: SpinSize }> = ({ size }) => (
  <span className={`au-spin__dot au-spin__dot--${size}`} aria-hidden>
    <i /><i /><i /><i />
  </span>
);

const Spin: React.FC<SpinProps> = ({
  spinning = true,
  tip,
  size = 'medium',
  indicator,
  delay,
  wrapperClassName = '',
  fullscreen,
  children,
  className = '',
  style,
}) => {
  const [show, setShow] = useState(!delay || !spinning ? spinning : false);

  useEffect(() => {
    if (!spinning) {
      setShow(false);
      return;
    }
    if (!delay) {
      setShow(true);
      return;
    }
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [spinning, delay]);

  const spinner = (
    <div
      className={['au-spin', `au-spin--${size}`, show ? 'is-spinning' : '', className].filter(Boolean).join(' ')}
      style={style}
      role="status"
      aria-live="polite"
    >
      {indicator ?? <DefaultIndicator size={size} />}
      {tip && <div className="au-spin__tip">{tip}</div>}
    </div>
  );

  if (fullscreen) {
    return show ? <div className="au-spin-fullscreen">{spinner}</div> : null;
  }

  if (children == null) {
    return show ? spinner : null;
  }

  return (
    <div className={['au-spin-container', show ? 'is-loading' : '', wrapperClassName].filter(Boolean).join(' ')}>
      {show && <div className="au-spin-container__mask">{spinner}</div>}
      <div className={['au-spin-container__content', show ? 'is-blurred' : ''].filter(Boolean).join(' ')}>
        {children}
      </div>
    </div>
  );
};

export default Spin;
