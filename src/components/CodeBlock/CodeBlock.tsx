import React, { useMemo, useRef, useState } from 'react';
import { useLocale } from '../ConfigProvider/ConfigProvider';
import './CodeBlock.css';

export interface CodeBlockProps {
  /** 代码字符串. 不接 ReactNode (避免高亮场景被破坏) */
  children: string;
  /**
   * 语言标识. 仅用于:
   *  1. 头部展示 (右上角小标签)
   *  2. 给用户自定义高亮函数当 hint
   * 组件本身不做语法高亮 — 太重了, 想要高亮通过 highlight prop 接入 shiki / prism / hljs
   */
  language?: string;
  /** 头部显示的文件名 (优先于 language tag 显示在左侧) */
  filename?: string;
  /** 显示行号, 默认 false */
  lineNumbers?: boolean;
  /** 自动换行, 默认 false (默认横向滚动) */
  wrap?: boolean;
  /** 显示复制按钮, 默认 true */
  copy?: boolean;
  /** 复制成功回调 */
  onCopy?: (text: string) => void;
  /** 最大高度, 超出滚动 */
  maxHeight?: number | string;
  /**
   * 自定义高亮函数 — 接代码字符串 + language, 返回 ReactNode (一般是高亮过的 <span> 树).
   * 不传时纯文本展示. 调用方可以在外面包 shiki / prism / hljs.
   * 例: highlight={(code, lang) => <ShikiHighlighter code={code} lang={lang} />}
   */
  highlight?: (code: string, language?: string) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const CopyIcon: React.FC = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
    <rect x="4.5" y="4.5" width="8" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <path d="M3.5 11.5V3.5a1 1 0 0 1 1-1H10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const CheckIcon: React.FC = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
    <path d="M3.5 8.2l3 3L12.5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * CodeBlock — 代码展示
 *
 * 设计取舍:
 *  - 不内置语法高亮 (避免引 50KB+ 的 highlight lib). 想要高亮:
 *    `<CodeBlock highlight={(code, lang) => <Shiki ... />}>...</CodeBlock>`
 *  - 提供文件名 / 语言标签 / 行号 / 复制 / 自动换行 / 最大高度滚动 这些纯样式能力
 *  - LLM 场景下: 调用方拿到 markdown 解析后的 ```language 块 = props.language
 */
const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  language,
  filename,
  lineNumbers = false,
  wrap = false,
  copy = true,
  onCopy,
  maxHeight,
  highlight,
  className = '',
  style,
}) => {
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      onCopy?.(children);
      if (copyTimer.current != null) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard 权限被拒, 静默失败 — 一般是非 https / iframe 沙箱 */
    }
  };

  const lines = useMemo(() => (lineNumbers ? children.split('\n') : null), [children, lineNumbers]);
  const showHeader = !!(filename || language || copy);

  const cls = [
    'au-code-block',
    wrap ? 'is-wrap' : '',
    lineNumbers ? 'has-line-numbers' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls} style={style}>
      {showHeader && (
        <div className="au-code-block__header">
          <span className="au-code-block__filename">
            {filename || (language ? <span className="au-code-block__lang">{language}</span> : null)}
          </span>
          {copy && (
            <button
              type="button"
              className={['au-code-block__copy', copied ? 'is-copied' : ''].filter(Boolean).join(' ')}
              onClick={handleCopy}
              aria-label={copied ? locale.CodeBlock.copied : locale.CodeBlock.copy}
              title={copied ? locale.CodeBlock.copied : locale.CodeBlock.copy}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              <span>{copied ? locale.CodeBlock.copied : locale.CodeBlock.copy}</span>
            </button>
          )}
        </div>
      )}
      <pre
        className="au-code-block__pre"
        style={maxHeight != null ? { maxHeight, overflowY: 'auto' } : undefined}
      >
        {lineNumbers && lines && (
          <span className="au-code-block__nums" aria-hidden>
            {lines.map((_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </span>
        )}
        <code className="au-code-block__code" data-language={language || undefined}>
          {highlight ? highlight(children, language) : children}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
