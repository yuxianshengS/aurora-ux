import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Typewriter.css';

export interface TypewriterProps {
  /** 要打出的文本; 字符串或字符串数组(数组将逐个打出) */
  text: string | string[];
  /** 每字符打出间隔 (ms); 默认 60 */
  speed?: number;
  /** 每字符删除间隔 (ms); 默认 30 */
  deleteSpeed?: number;
  /** 一句打完后的停顿时长 (ms); 默认 1500 */
  pauseAfter?: number;
  /** 启动延迟 (ms); 默认 0 */
  startDelay?: number;
  /** 循环: 单串时打完清空重打; 数组时到尾后回到第一条 */
  loop?: boolean;
  /** 显示闪烁光标; 可传 boolean 或自定义内容 */
  cursor?: boolean | React.ReactNode;
  /** 非循环模式下全部打完时触发一次 */
  onDone?: () => void;
  /** 渲染为什么标签; 默认 'span' */
  as?: React.ElementType;
  className?: string;
  style?: React.CSSProperties;
}

const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 60,
  deleteSpeed = 30,
  pauseAfter = 1500,
  startDelay = 0,
  loop = false,
  cursor = true,
  onDone,
  as,
  className,
  style,
}) => {
  const texts = useMemo(
    () =>
      (Array.isArray(text) ? text : [text]).filter(
        (s): s is string => typeof s === 'string'
      ),
    [text]
  );
  // 稳定 key: 内容不变就不重启动画, 避免父组件每次渲染传新数组引发抖动
  const textsKey = texts.join('');

  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    if (texts.length === 0) return;

    let cancelled = false;
    let timerId: ReturnType<typeof setTimeout> | undefined;
    let index = 0;
    let pos = 0;
    type Phase = 'typing' | 'pausing' | 'deleting';
    let phase: Phase = 'typing';

    const schedule = (delay: number) => {
      timerId = setTimeout(() => {
        if (cancelled) return;
        step();
      }, delay);
    };

    const step = () => {
      if (cancelled) return;
      const current = texts[index];

      if (phase === 'typing') {
        pos += 1;
        setDisplayed(current.slice(0, pos));
        if (pos >= current.length) {
          const isLast = index === texts.length - 1;
          if (isLast && !loop) {
            setDone(true);
            onDoneRef.current?.();
            return;
          }
          phase = 'pausing';
          schedule(pauseAfter);
        } else {
          schedule(speed);
        }
      } else if (phase === 'pausing') {
        phase = 'deleting';
        schedule(deleteSpeed);
      } else {
        pos -= 1;
        setDisplayed(current.slice(0, Math.max(0, pos)));
        if (pos <= 0) {
          index = (index + 1) % texts.length;
          pos = 0;
          phase = 'typing';
          schedule(speed);
        } else {
          schedule(deleteSpeed);
        }
      }
    };

    schedule(Math.max(0, startDelay));

    return () => {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [textsKey, speed, deleteSpeed, pauseAfter, startDelay, loop]);

  const Tag = (as ?? 'span') as React.ElementType;
  const cls = [
    'au-typewriter',
    done ? 'is-done' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={cls} style={style}>
      <span className="au-typewriter__text">{displayed}</span>
      {cursor && (
        <span className="au-typewriter__cursor" aria-hidden="true">
          {typeof cursor === 'boolean' ? '|' : cursor}
        </span>
      )}
    </Tag>
  );
};

export default Typewriter;
