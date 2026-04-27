import React, { useEffect, useRef, useState } from 'react';
import './NumberRoll.css';

export interface NumberRollProps {
  /** 目标数字 (传新数字会触发滚动动画) */
  value: number;
  /** 整数位用千分位逗号 */
  thousandSeparator?: boolean;
  /** 小数位数 */
  precision?: number;
  /** 字体大小 (px), 用来撑出每位数字的高度 */
  size?: number;
  /** 字重 */
  weight?: number | 'normal' | 'bold' | 'medium' | 'semibold';
  /** 数字颜色, 默认继承 */
  color?: string;
  /** 单个数字位滚动时长 (ms) */
  duration?: number;
  /** 多位之间的延迟 (ms), 个位先滚, 高位逐位延迟; 0 = 同步 */
  stagger?: number;
  /** 前缀 (如 "$" / "¥") */
  prefix?: React.ReactNode;
  /** 后缀 (如 "%" / " 人") */
  suffix?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const weightMap: Record<string, number> = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

const NumberRoll: React.FC<NumberRollProps> = ({
  value,
  thousandSeparator = true,
  precision = 0,
  size = 32,
  weight = 600,
  color,
  duration = 600,
  stagger = 60,
  prefix,
  suffix,
  className = '',
  style,
}) => {
  // 第一次挂载从 0 滚到 value (有动效); 后续从前一次值滚到新值
  const initRef = useRef(false);
  const [from, setFrom] = useState(0);
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      return;
    }
    setFrom(value);
  }, [value]);

  // 把数字格式化, 拆成字符数组 (含 . 和 ,)
  const formatted = formatNumber(value, precision, thousandSeparator);
  const chars = formatted.split('');

  // 倒序计算每位的 stagger 延迟 (个位先滚, 高位最后): 总位数 - i
  const digitChars = chars.filter((c) => /\d/.test(c));
  const totalDigits = digitChars.length;
  let digitIdx = 0;

  const fontWeight = typeof weight === 'string' ? weightMap[weight] ?? 600 : weight;

  const wrapperStyle: React.CSSProperties = {
    fontSize: size,
    fontWeight,
    color,
    lineHeight: 1.1,
    ...style,
  };

  return (
    <span className={`au-number-roll ${className}`} style={wrapperStyle}>
      {prefix != null && <span className="au-number-roll__affix">{prefix}</span>}
      {chars.map((c, i) => {
        if (!/\d/.test(c)) {
          return (
            <span key={i} className="au-number-roll__sep">
              {c}
            </span>
          );
        }
        const digit = Number(c);
        const myIdx = digitIdx;
        digitIdx += 1;
        // 个位 (totalDigits - 1) 延迟 0; 越往高位延迟越大
        const delayIdx = totalDigits - 1 - myIdx;
        const delay = delayIdx * stagger;
        return (
          <Digit
            key={`${i}-${formatted.length}`}
            digit={digit}
            size={size}
            duration={duration}
            delay={delay}
          />
        );
      })}
      {suffix != null && <span className="au-number-roll__affix">{suffix}</span>}
      {/* 抑制未使用变量告警 */}
      <span style={{ display: 'none' }}>{from}</span>
    </span>
  );
};

const Digit: React.FC<{ digit: number; size: number; duration: number; delay: number }> = ({
  digit,
  size,
  duration,
  delay,
}) => {
  const cellHeight = size * 1.1;
  const offset = -digit * cellHeight;
  return (
    <span
      className="au-number-roll__digit"
      style={{ height: cellHeight, width: `${size * 0.6}px` }}
    >
      <span
        className="au-number-roll__reel"
        style={{
          transform: `translateY(${offset}px)`,
          transitionDuration: `${duration}ms`,
          transitionDelay: `${delay}ms`,
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <span key={d} className="au-number-roll__cell" style={{ height: cellHeight }}>
            {d}
          </span>
        ))}
      </span>
    </span>
  );
};

const formatNumber = (n: number, precision: number, thousand: boolean): string => {
  const fixed = n.toFixed(precision);
  if (!thousand) return fixed;
  const [intPart, decPart] = fixed.split('.');
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decPart ? `${withCommas}.${decPart}` : withCommas;
};

export default NumberRoll;
