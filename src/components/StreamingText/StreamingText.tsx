import React from 'react';
import './StreamingText.css';

export interface StreamingTextProps {
  /**
   * 当前累计的文本 — 一般是 SSE 不断追加的字符串.
   * 调用方每收到 token 就更新一次 text, 组件按 prop 变化重渲染.
   */
  text: string;
  /**
   * 流式是否已结束. true 时收起光标, 不再闪烁.
   * 默认 false (有光标, 视觉上"还在打字").
   */
  done?: boolean;
  /**
   * 自定义光标 — 传 false 关闭, 传 ReactNode 替换默认竖线.
   * 默认显示 1px 闪烁光标.
   */
  cursor?: boolean | React.ReactNode;
  /**
   * 元素 tag, 默认 'span'. 想做块级段落传 'p' / 'div'.
   */
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * StreamingText — 给 LLM SSE 流式输出做"看起来在打字"的渲染.
 *
 * 跟 Typewriter 区别:
 *  - Typewriter 是"已知完整字符串, 演示式按字符延时显示"
 *  - StreamingText 是"调用方每收到 token 就喂一次, 组件原样显示 + 末尾闪光标"
 *
 * 用法 (典型 SSE 接入):
 * ```tsx
 * const [text, setText] = useState('');
 * const [done, setDone] = useState(false);
 *
 * useEffect(() => {
 *   const es = new EventSource('/api/chat/stream');
 *   es.onmessage = (e) => setText((t) => t + JSON.parse(e.data).delta);
 *   es.addEventListener('done', () => { setDone(true); es.close(); });
 *   return () => es.close();
 * }, []);
 *
 * <StreamingText text={text} done={done} />
 * ```
 */
const StreamingText: React.FC<StreamingTextProps> = ({
  text,
  done = false,
  cursor = true,
  as = 'span',
  className = '',
  style,
}) => {
  const Tag = as as React.ElementType;
  const showCursor = !done && cursor !== false;
  return (
    <Tag className={['au-streaming-text', className].filter(Boolean).join(' ')} style={style}>
      {text}
      {showCursor &&
        (cursor === true ? <span className="au-streaming-text__cursor" aria-hidden /> : cursor)}
    </Tag>
  );
};

export default StreamingText;
