import React, { useCallback, useMemo, useState } from 'react';
import { useLocale } from '../ConfigProvider/ConfigProvider';
import './JsonView.css';

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonViewSize = 'small' | 'medium';

export interface JsonViewProps {
  /** 要展示的数据 — 任意可序列化值,或一段 JSON 字符串 */
  data: JsonValue | string;
  /** 默认展开到第几层,Infinity = 全展开 (默认 1) */
  defaultExpandDepth?: number;
  /** 缩进像素 (默认 16) */
  indent?: number;
  /** 字号档位 */
  size?: JsonViewSize;
  /** 显示左侧缩进引导线 (默认 true) */
  showLine?: boolean;
  /** 显示折叠节点的子项数量徽标 (默认 true) */
  showItemCount?: boolean;
  /** 显示键的引号 (JSON 严格风格,默认 false 即 JS 风格) */
  quoteKeys?: boolean;
  /** 字符串值是否带引号 (默认 true) */
  quoteStrings?: boolean;
  /** 显示「复制全部」按钮 (默认 false) */
  copyable?: boolean;
  /** hover 在每个值/节点上显示复制按钮 (默认 true) */
  copyOnHover?: boolean;
  /** 复制成功回调 */
  onCopy?: (value: unknown, path: string) => void;
  /** 解析失败时的回调 (data 为字符串且非合法 JSON) */
  onParseError?: (err: Error) => void;
  className?: string;
  style?: React.CSSProperties;
}

const Caret: React.FC<{ open: boolean }> = ({ open }) => (
  <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden>
    <path
      d="M5 3l5 5-5 5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transformOrigin: '8px 8px',
        transform: open ? 'rotate(90deg)' : undefined,
        transition: 'transform 0.15s var(--au-ease)',
      }}
    />
  </svg>
);

const CopyIcon: React.FC = () => (
  <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden>
    <rect x="5" y="5" width="8" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <path d="M3 11V3.5A1.5 1.5 0 0 1 4.5 2H10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const CheckIcon: React.FC = () => (
  <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden>
    <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type ValueKind = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null' | 'undefined';

const kindOf = (v: unknown): ValueKind => {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (Array.isArray(v)) return 'array';
  return typeof v as ValueKind;
};

const isContainer = (k: ValueKind) => k === 'object' || k === 'array';

const escapeStr = (s: string) => JSON.stringify(s).slice(1, -1);

const safeStringify = (v: unknown): string => {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
};

interface CopyButtonProps {
  value: unknown;
  path: string;
  onCopy?: (value: unknown, path: string) => void;
}

const CopyButton: React.FC<CopyButtonProps> = ({ value, path, onCopy }) => {
  const locale = useLocale();
  const [done, setDone] = useState(false);
  const handle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = typeof value === 'string' ? value : safeStringify(value);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    onCopy?.(value, path);
    setDone(true);
    window.setTimeout(() => setDone(false), 1100);
  };
  return (
    <button
      type="button"
      className={['au-jsonview__copy', done ? 'is-done' : ''].filter(Boolean).join(' ')}
      onClick={handle}
      aria-label={done ? locale.JsonView.copied : locale.JsonView.copy}
      tabIndex={-1}
    >
      {done ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
};

interface NodeProps {
  /** 当前节点的 key (字符串 = 对象键, 数字 = 数组下标, null = 根) */
  nodeKey: string | number | null;
  value: unknown;
  depth: number;
  path: string;
  defaultExpandDepth: number;
  indent: number;
  showLine: boolean;
  showItemCount: boolean;
  quoteKeys: boolean;
  quoteStrings: boolean;
  copyOnHover: boolean;
  onCopy?: (value: unknown, path: string) => void;
  /** 是否数组/对象兄弟队列里的最后一个 */
  isLast: boolean;
}

const renderKeyLabel = (
  nodeKey: string | number | null,
  quoteKeys: boolean,
): React.ReactNode => {
  if (nodeKey === null) return null;
  if (typeof nodeKey === 'number') {
    return (
      <>
        <span className="au-jsonview__key au-jsonview__key--index">{nodeKey}</span>
        <span className="au-jsonview__colon">: </span>
      </>
    );
  }
  return (
    <>
      <span className="au-jsonview__key">
        {quoteKeys ? `"${escapeStr(nodeKey)}"` : nodeKey}
      </span>
      <span className="au-jsonview__colon">: </span>
    </>
  );
};

const Node: React.FC<NodeProps> = ({
  nodeKey,
  value,
  depth,
  path,
  defaultExpandDepth,
  indent,
  showLine,
  showItemCount,
  quoteKeys,
  quoteStrings,
  copyOnHover,
  onCopy,
  isLast,
}) => {
  const locale = useLocale();
  const kind = kindOf(value);
  const container = isContainer(kind);
  const [open, setOpen] = useState(depth < defaultExpandDepth);

  // 缩进
  const padLeft = depth * indent;

  if (!container) {
    // 叶子节点
    let valEl: React.ReactNode;
    let cls = 'au-jsonview__value';
    switch (kind) {
      case 'string':
        cls += ' au-jsonview__value--string';
        valEl = quoteStrings ? `"${escapeStr(value as string)}"` : (value as string);
        break;
      case 'number':
        cls += ' au-jsonview__value--number';
        valEl = String(value);
        break;
      case 'boolean':
        cls += ' au-jsonview__value--boolean';
        valEl = String(value);
        break;
      case 'null':
        cls += ' au-jsonview__value--null';
        valEl = 'null';
        break;
      case 'undefined':
        cls += ' au-jsonview__value--undefined';
        valEl = 'undefined';
        break;
      default:
        valEl = String(value);
    }
    return (
      <div className="au-jsonview__row" style={{ paddingLeft: padLeft + indent }}>
        <span className="au-jsonview__caret au-jsonview__caret--leaf" aria-hidden />
        {renderKeyLabel(nodeKey, quoteKeys)}
        <span className={cls}>{valEl as React.ReactNode}</span>
        {!isLast && <span className="au-jsonview__comma">,</span>}
        {copyOnHover && (
          <CopyButton value={value} path={path} onCopy={onCopy} />
        )}
      </div>
    );
  }

  // 容器: 对象 / 数组
  const isArr = kind === 'array';
  const entries: [string | number, unknown][] = isArr
    ? (value as unknown[]).map((v, i) => [i, v])
    : Object.entries(value as Record<string, unknown>);
  const count = entries.length;
  const openBracket = isArr ? '[' : '{';
  const closeBracket = isArr ? ']' : '}';

  const empty = count === 0;

  if (empty) {
    return (
      <div className="au-jsonview__row" style={{ paddingLeft: padLeft + indent }}>
        <span className="au-jsonview__caret au-jsonview__caret--leaf" aria-hidden />
        {renderKeyLabel(nodeKey, quoteKeys)}
        <span className="au-jsonview__bracket">{openBracket}</span>
        <span className="au-jsonview__bracket">{closeBracket}</span>
        {!isLast && <span className="au-jsonview__comma">,</span>}
        {copyOnHover && <CopyButton value={value} path={path} onCopy={onCopy} />}
      </div>
    );
  }

  return (
    <div className="au-jsonview__group">
      <div
        className={['au-jsonview__row', 'au-jsonview__row--container', open ? 'is-open' : 'is-closed']
          .filter(Boolean)
          .join(' ')}
        style={{ paddingLeft: padLeft + indent }}
      >
        <button
          type="button"
          className="au-jsonview__caret"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? locale.JsonView.collapse : locale.JsonView.expand}
          aria-expanded={open}
        >
          <Caret open={open} />
        </button>
        <span
          className="au-jsonview__head"
          onClick={() => setOpen((o) => !o)}
        >
          {renderKeyLabel(nodeKey, quoteKeys)}
          <span className="au-jsonview__bracket">{openBracket}</span>
          {!open && (
            <>
              {showItemCount && (
                <span className="au-jsonview__count">
                  {count} {isArr ? (count > 1 ? 'items' : 'item') : count > 1 ? 'keys' : 'key'}
                </span>
              )}
              <span className="au-jsonview__bracket">{closeBracket}</span>
              {!isLast && <span className="au-jsonview__comma">,</span>}
            </>
          )}
        </span>
        {copyOnHover && <CopyButton value={value} path={path} onCopy={onCopy} />}
      </div>
      {open && (
        <div
          className={['au-jsonview__children', showLine ? 'has-line' : '']
            .filter(Boolean)
            .join(' ')}
          style={{ ['--au-jsonview-line-left' as never]: `${padLeft + indent + 5}px` } as React.CSSProperties}
        >
          {entries.map(([k, v], i) => {
            const childPath = isArr
              ? `${path}[${k}]`
              : path
              ? `${path}.${k}`
              : String(k);
            return (
              <Node
                key={String(k)}
                nodeKey={k}
                value={v}
                depth={depth + 1}
                path={childPath}
                defaultExpandDepth={defaultExpandDepth}
                indent={indent}
                showLine={showLine}
                showItemCount={showItemCount}
                quoteKeys={quoteKeys}
                quoteStrings={quoteStrings}
                copyOnHover={copyOnHover}
                onCopy={onCopy}
                isLast={i === entries.length - 1}
              />
            );
          })}
          <div className="au-jsonview__row au-jsonview__row--close" style={{ paddingLeft: padLeft + indent }}>
            <span className="au-jsonview__caret au-jsonview__caret--leaf" aria-hidden />
            <span className="au-jsonview__bracket">{closeBracket}</span>
            {!isLast && <span className="au-jsonview__comma">,</span>}
          </div>
        </div>
      )}
    </div>
  );
};

const JsonView: React.FC<JsonViewProps> = ({
  data,
  defaultExpandDepth = 1,
  indent = 16,
  size = 'medium',
  showLine = true,
  showItemCount = true,
  quoteKeys = false,
  quoteStrings = true,
  copyable = false,
  copyOnHover = true,
  onCopy,
  onParseError,
  className = '',
  style,
}) => {
  const locale = useLocale();
  const parsed = useMemo<{ value: unknown; error: Error | null }>(() => {
    if (typeof data !== 'string') return { value: data, error: null };
    try {
      return { value: JSON.parse(data), error: null };
    } catch (err) {
      return { value: data, error: err as Error };
    }
  }, [data]);

  React.useEffect(() => {
    if (parsed.error) onParseError?.(parsed.error);
  }, [parsed.error, onParseError]);

  const [topCopied, setTopCopied] = useState(false);
  const handleTopCopy = useCallback(() => {
    const text = safeStringify(parsed.value);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    onCopy?.(parsed.value, '');
    setTopCopied(true);
    window.setTimeout(() => setTopCopied(false), 1100);
  }, [parsed.value, onCopy]);

  if (parsed.error) {
    return (
      <div
        className={['au-jsonview', `au-jsonview--${size}`, 'au-jsonview--error', className]
          .filter(Boolean)
          .join(' ')}
        style={style}
        role="alert"
      >
        <span className="au-jsonview__error-title">{locale.JsonView.parseError}</span>
        <span className="au-jsonview__error-msg">{parsed.error.message}</span>
      </div>
    );
  }

  return (
    <div
      className={['au-jsonview', `au-jsonview--${size}`, className].filter(Boolean).join(' ')}
      style={style}
    >
      {copyable && (
        <button
          type="button"
          className={['au-jsonview__copy-all', topCopied ? 'is-done' : ''].filter(Boolean).join(' ')}
          onClick={handleTopCopy}
          aria-label={topCopied ? locale.JsonView.copiedAll : locale.JsonView.copyAll}
        >
          {topCopied ? <CheckIcon /> : <CopyIcon />}
          <span>{topCopied ? locale.JsonView.copied : locale.JsonView.copyAll}</span>
        </button>
      )}
      <Node
        nodeKey={null}
        value={parsed.value}
        depth={0}
        path=""
        defaultExpandDepth={defaultExpandDepth}
        indent={indent}
        showLine={showLine}
        showItemCount={showItemCount}
        quoteKeys={quoteKeys}
        quoteStrings={quoteStrings}
        copyOnHover={copyOnHover}
        onCopy={onCopy}
        isLast
      />
    </div>
  );
};

export default JsonView;
