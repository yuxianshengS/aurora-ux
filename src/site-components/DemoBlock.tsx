import React, { useState } from 'react';
import './DemoBlock.css';

export interface DemoBlockProps {
  title?: string;
  description?: string;
  code: string;
  children: React.ReactNode;
}

const DemoBlock: React.FC<DemoBlockProps> = ({
  title,
  description,
  code,
  children,
}) => {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="demo-block">
      {(title || description) && (
        <div className="demo-block__head">
          {title && <h4>{title}</h4>}
          {description && <p>{description}</p>}
        </div>
      )}
      <div className="demo-block__preview">{children}</div>
      <div className="demo-block__toolbar">
        <button onClick={() => setShowCode((v) => !v)}>
          {showCode ? '隐藏代码' : '显示代码'}
        </button>
        <button onClick={copy}>{copied ? '已复制' : '复制代码'}</button>
      </div>
      {showCode && (
        <pre className="demo-block__code">
          <code>{highlight(code)}</code>
        </pre>
      )}
    </div>
  );
};

/* =============== 极光配色 JSX/TS 语法高亮 (轻量手写, 无外部依赖) =============== */

interface Tok {
  type:
    | 'k'      /* keyword     紫     */
    | 't'      /* 组件名 大写  青     */
    | 'h'      /* HTML 标签   蓝绿   */
    | 'a'      /* attr        粉斜   */
    | 's'      /* string      暖金   */
    | 'n'      /* number      绿     */
    | 'f'      /* function    靛     */
    | 'com'    /* 注释        灰斜   */
    | 'p'      /* 标点        dim    */
    | 'plain';
  text: string;
}

const KEYWORDS = new Set([
  'import', 'export', 'default', 'from', 'as',
  'const', 'let', 'var',
  'function', 'return',
  'if', 'else', 'async', 'await', 'new',
  'class', 'extends', 'interface', 'type',
  'true', 'false', 'null', 'undefined', 'void',
  'typeof', 'instanceof', 'in', 'of',
  'for', 'while', 'do',
  'switch', 'case', 'break', 'continue',
  'throw', 'try', 'catch', 'finally',
]);

function tokenize(code: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < code.length) {
    const ch = code[i];

    // 行注释
    if (ch === '/' && code[i + 1] === '/') {
      const end = code.indexOf('\n', i);
      const stop = end === -1 ? code.length : end;
      out.push({ type: 'com', text: code.slice(i, stop) });
      i = stop;
      continue;
    }
    // 块注释
    if (ch === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2);
      const stop = end === -1 ? code.length : end + 2;
      out.push({ type: 'com', text: code.slice(i, stop) });
      i = stop;
      continue;
    }
    // 字符串 ' " `
    if (ch === '"' || ch === "'" || ch === '`') {
      let j = i + 1;
      while (j < code.length) {
        if (code[j] === '\\') { j += 2; continue; }
        if (code[j] === ch) { j += 1; break; }
        j += 1;
      }
      out.push({ type: 's', text: code.slice(i, j) });
      i = j;
      continue;
    }
    // 数字
    if (/\d/.test(ch)) {
      let j = i + 1;
      while (j < code.length && /[\d.]/.test(code[j])) j += 1;
      out.push({ type: 'n', text: code.slice(i, j) });
      i = j;
      continue;
    }
    // JSX 闭合标签 </Foo or </div
    if (ch === '<' && code[i + 1] === '/') {
      const m = /^<\/([A-Za-z][\w.-]*)/.exec(code.slice(i));
      if (m) {
        out.push({ type: 'p', text: '</' });
        const name = m[1];
        out.push({ type: /^[A-Z]/.test(name) ? 't' : 'h', text: name });
        i += m[0].length;
        continue;
      }
    }
    // JSX 开标签 <Foo or <div — 仅当 < 左侧是空白/标点, 避免吃掉泛型 useRef<X>
    if (ch === '<') {
      const prevCh = i > 0 ? code[i - 1] : '';
      const looksLikeJsx = !prevCh || /[\s({,;>=]/.test(prevCh);
      const m = /^<([A-Za-z][\w.-]*)/.exec(code.slice(i));
      if (m && looksLikeJsx) {
        out.push({ type: 'p', text: '<' });
        const name = m[1];
        out.push({ type: /^[A-Z]/.test(name) ? 't' : 'h', text: name });
        i += m[0].length;
        continue;
      }
    }
    // JSX 自闭 />
    if (ch === '/' && code[i + 1] === '>') {
      out.push({ type: 'p', text: '/>' });
      i += 2;
      continue;
    }
    // 标点
    if ('{}()[];,.:=<>+-*/&|!?'.includes(ch)) {
      out.push({ type: 'p', text: ch });
      i += 1;
      continue;
    }
    // 标识符 / 关键字
    if (/[a-zA-Z_$]/.test(ch)) {
      let j = i + 1;
      while (j < code.length && /[\w$]/.test(code[j])) j += 1;
      const word = code.slice(i, j);
      out.push({ type: KEYWORDS.has(word) ? 'k' : 'plain', text: word });
      i = j;
      continue;
    }
    // 空白 / 其他单字符
    if (/\s/.test(ch)) {
      let j = i + 1;
      while (j < code.length && /\s/.test(code[j])) j += 1;
      out.push({ type: 'plain', text: code.slice(i, j) });
      i = j;
    } else {
      out.push({ type: 'plain', text: ch });
      i += 1;
    }
  }

  // 后处理: 把"标识符 + =" 升级为 attr; 把"标识符 + (" 升级为 function
  for (let k = 0; k < out.length; k++) {
    if (out[k].type !== 'plain') continue;
    if (!/^[a-zA-Z_$][\w$]*$/.test(out[k].text)) continue;
    const next = out[k + 1];
    if (!next) continue;
    if (next.type === 'p' && next.text === '=') out[k] = { ...out[k], type: 'a' };
    else if (next.type === 'p' && next.text === '(') out[k] = { ...out[k], type: 'f' };
  }

  return out;
}

function highlight(code: string): React.ReactNode {
  const toks = tokenize(code);
  return toks.map((t, i) =>
    t.type === 'plain' ? (
      <React.Fragment key={i}>{t.text}</React.Fragment>
    ) : (
      <span key={i} className={`hl-${t.type}`}>
        {t.text}
      </span>
    ),
  );
}

export default DemoBlock;
