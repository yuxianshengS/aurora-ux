import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Flip.css';

export type FlipSize = 'small' | 'medium' | 'large';

export interface FlipProps {
  /** 要展示的值; 会被转成字符串按字符拆分, 每个字符独立翻牌 */
  value: string | number;
  /** 最少字符数; 不足时前方补 '0' */
  minLength?: number;
  /** 单次翻牌动画时长 (ms); 默认 600 */
  duration?: number;
  /** 预设尺寸或自定义卡片高度 (px) */
  size?: FlipSize | number;
  /** 前缀 (如货币符号) */
  prefix?: React.ReactNode;
  /** 后缀 (如单位) */
  suffix?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const SIZE_PX: Record<FlipSize, number> = {
  small: 36,
  medium: 56,
  large: 80,
};

const Flip: React.FC<FlipProps> = ({
  value,
  minLength = 0,
  duration = 600,
  size = 'medium',
  prefix,
  suffix,
  className,
  style,
}) => {
  const chars = useMemo(() => {
    let s = String(value);
    if (minLength > 0 && s.length < minLength) {
      s = s.padStart(minLength, '0');
    }
    return s.split('');
  }, [value, minLength]);

  const rootStyle: React.CSSProperties = useMemo(() => {
    const h = typeof size === 'number' ? size : SIZE_PX[size];
    const w = Math.round(h * 0.68);
    return {
      ['--au-flip-h' as any]: `${h}px`,
      ['--au-flip-w' as any]: `${w}px`,
      ['--au-flip-duration' as any]: `${duration}ms`,
      ...style,
    };
  }, [size, duration, style]);

  const cls = ['au-flip', className ?? ''].filter(Boolean).join(' ');

  return (
    <div className={cls} style={rootStyle}>
      {prefix && <span className="au-flip__affix">{prefix}</span>}
      {chars.map((c, i) =>
        /[0-9]/.test(c) ? (
          <FlipDigit key={i} char={c} duration={duration} />
        ) : (
          <span key={i} className="au-flip__sep">
            {c}
          </span>
        )
      )}
      {suffix && <span className="au-flip__affix">{suffix}</span>}
    </div>
  );
};

interface FlipDigitProps {
  char: string;
  duration: number;
}

const FlipDigit: React.FC<FlipDigitProps> = ({ char, duration }) => {
  const [current, setCurrent] = useState(char);
  const [next, setNext] = useState(char);
  const [flipping, setFlipping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (char === current) return;
    setNext(char);
    setFlipping(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrent(char);
      setFlipping(false);
    }, duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [char, current, duration]);

  // 视觉: 静态上半显示"目标字符"(被翻走后露出), 静态下半显示"当前字符"(翻牌盖过后变为新)
  const topChar = flipping ? next : current;
  const botChar = current;

  return (
    <div
      className={['au-flip-digit', flipping ? 'is-flipping' : '']
        .filter(Boolean)
        .join(' ')}
    >
      <div className="au-flip-digit__top">
        <span className="au-flip-digit__char">{topChar}</span>
      </div>
      <div className="au-flip-digit__bot">
        <span className="au-flip-digit__char">{botChar}</span>
      </div>
      {flipping && (
        <>
          <div className="au-flip-digit__flip-top">
            <span className="au-flip-digit__char">{current}</span>
          </div>
          <div className="au-flip-digit__flip-bot">
            <span className="au-flip-digit__char">{next}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default Flip;
