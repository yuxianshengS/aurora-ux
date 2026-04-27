import React, { useEffect, useMemo, useRef, useState } from 'react';
import './ScrambleText.css';

export interface ScrambleTextProps {
  /** 最终要展示的文本; 变化时会重新触发乱码动画 */
  text: string;
  /** 每个字符乱码的轮数, 越大越久, 默认 12 */
  rounds?: number;
  /** 单帧间隔 (ms), 默认 50 */
  speed?: number;
  /** 字符之间的开始延迟 (ms), 默认 40 — 错落锁定效果 */
  stagger?: number;
  /** 乱码用的字符集; 默认混合英数 + 特殊符号 */
  charset?: string;
  /** 自动开始, 默认 true; 设 false 时通过 trigger prop 控制重播 */
  autoStart?: boolean;
  /** 数字递增改变值时, 强制重新跑动画 (key trick) */
  trigger?: string | number;
  /** 渲染元素 (h1/h2/h3/span/div...) */
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
  /** 完成时回调 */
  onDone?: () => void;
}

const DEFAULT_CHARSET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*?+=<>/\\|';

const pickRandom = (charset: string) =>
  charset.charAt(Math.floor(Math.random() * charset.length));

const ScrambleText: React.FC<ScrambleTextProps> = ({
  text,
  rounds = 12,
  speed = 50,
  stagger = 40,
  charset = DEFAULT_CHARSET,
  autoStart = true,
  trigger,
  as = 'span',
  className = '',
  style,
  onDone,
}) => {
  const [display, setDisplay] = useState<string>(() => (autoStart ? '' : text));
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  // 中文字符宽度大致占 2 个英文字符, 但拆分时按 Array.from 处理代理对/emoji
  const targetChars = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    if (!autoStart && trigger == null) return;

    const total = targetChars.length;
    // 每个字符的"开始时间(帧序号)"和"已乱码次数"
    const startFrame = targetChars.map((_, i) => Math.floor((i * stagger) / speed));
    const lockedAt: (number | null)[] = targetChars.map(() => null);
    const scrambleCnt = targetChars.map(() => 0);
    let frame = 0;

    const tick = () => {
      const next: string[] = targetChars.map((char, i) => {
        if (frame < startFrame[i]) {
          return ''; // 还没开始
        }
        if (lockedAt[i] != null) {
          return char;
        }
        if (scrambleCnt[i] >= rounds) {
          lockedAt[i] = frame;
          return char;
        }
        scrambleCnt[i] += 1;
        // 中文字符不在 charset 里乱码 — 给它整个 charset 抓一个就行, 视觉一致
        return pickRandom(charset);
      });
      setDisplay(next.join(''));
      frame += 1;
      const allLocked = lockedAt.every((v) => v != null);
      if (allLocked) {
        onDone?.();
        timerRef.current = null;
        return;
      }
      timerRef.current = window.setTimeout(tick, speed);
    };

    timerRef.current = window.setTimeout(tick, speed);
    return () => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetChars, rounds, speed, stagger, charset, trigger, autoStart]);

  const Tag = as as React.ElementType;
  return (
    <Tag className={`au-scramble ${className}`} style={style}>
      {display || ' '}
    </Tag>
  );
};

export default ScrambleText;
