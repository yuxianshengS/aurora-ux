import React, { useEffect, useRef, useState } from 'react';
import {
  StreamingText,
  CodeBlock,
  MessageBubble,
  Button,
} from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const SAMPLE_REPLY = `当然可以,以下是一个 React Hook 例子:

\`\`\`tsx
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
\`\`\`

把 value 包一层就能拿到防抖后的值,适合搜索框 / API 节流场景。`;

const AiKitDoc: React.FC = () => {
  return (
    <>
      <h1>AI UI Kit · 即用聊天组件</h1>
      <p>
        给 LLM 应用 / Chatbot / Copilot 场景准备的三件套:
        <code>StreamingText</code>(SSE 流式文字) · <code>MessageBubble</code>(角色化消息气泡) ·
        <code>CodeBlock</code>(代码块 + 一键复制)。Aurora 视觉语言 + 极光描边,接 Vercel AI SDK / OpenAI / Anthropic API 一两行就跑.
      </p>

      <h2>StreamingText 流式文字</h2>

      <DemoBlock
        title="基础 — 模拟 SSE 流"
        description="text 不断追加,组件原样展示 + 末尾闪烁光标. 流结束传 done={true} 收起光标."
        code={`const [text, setText] = useState('');
const [done, setDone] = useState(false);

// SSE 接入 — 每收到一个 token 就追加
useEffect(() => {
  const es = new EventSource('/api/chat/stream');
  es.onmessage = (e) => setText((t) => t + JSON.parse(e.data).delta);
  es.addEventListener('done', () => { setDone(true); es.close(); });
  return () => es.close();
}, []);

<StreamingText text={text} done={done} />`}
      >
        <StreamingDemo />
      </DemoBlock>

      <h2>CodeBlock 代码块</h2>

      <DemoBlock
        title="基础 — 文件名 + 复制按钮"
        code={`<CodeBlock language="ts" filename="useDebounce.ts">
{\`import { useState, useEffect } from 'react';
export function useDebounce(v, ms) {
  const [d, setD] = useState(v);
  useEffect(() => {
    const t = setTimeout(() => setD(v), ms);
    return () => clearTimeout(t);
  }, [v, ms]);
  return d;
}\`}
</CodeBlock>`}
      >
        <CodeBlock language="ts" filename="useDebounce.ts">
{`import { useState, useEffect } from 'react';
export function useDebounce(v, ms) {
  const [d, setD] = useState(v);
  useEffect(() => {
    const t = setTimeout(() => setD(v), ms);
    return () => clearTimeout(t);
  }, [v, ms]);
  return d;
}`}
        </CodeBlock>
      </DemoBlock>

      <DemoBlock
        title="行号 + 自动换行 + 限高滚动"
        code={`<CodeBlock language="bash" lineNumbers wrap maxHeight={120}>
{\`# 每次 deploy 前跑一遍
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm build:lib
npm publish --access public\`}
</CodeBlock>`}
      >
        <CodeBlock language="bash" lineNumbers wrap maxHeight={120}>
{`# 每次 deploy 前跑一遍
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm build:lib
npm publish --access public`}
        </CodeBlock>
      </DemoBlock>

      <DemoBlock
        title="自定义高亮 — 接 shiki / prism / 自写 tokenizer"
        description="组件不内置高亮(避免几十 KB 包体). highlight 函数返回 ReactNode 即可. 下面给一个不依赖外部库的极简 ts 高亮做演示, 真实场景换成 shiki / prism 就完事."
        code={`// 真实场景接 shiki:
import { codeToHast } from 'shiki';
<CodeBlock language="tsx" highlight={(code, lang) => <Shiki code={code} lang={lang} theme="aurora-dark" />} />

// 或者自写一个最小 tokenizer:
const TS_KEYWORDS = ['const','let','var','function','return','if','else','import','from','export','async','await'];
function highlightTs(code: string) {
  return code.split(/(\\b\\w+\\b|"[^"]*"|'[^']*'|\\/\\/.*)/g).map((tok, i) => {
    if (TS_KEYWORDS.includes(tok)) return <span key={i} style={{ color: '#c084fc' }}>{tok}</span>;
    if (/^["'\`]/.test(tok)) return <span key={i} style={{ color: '#86efac' }}>{tok}</span>;
    if (/^\\/\\//.test(tok)) return <span key={i} style={{ color: '#94a3b8' }}>{tok}</span>;
    return tok;
  });
}

<CodeBlock language="ts" highlight={(code) => highlightTs(code)}>{code}</CodeBlock>`}
      >
        <CodeBlock language="ts" filename="useDebounce.ts" lineNumbers highlight={highlightTs}>
{`import { useState, useEffect } from 'react';

// 把 value 包一层, 拿到防抖后的值
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}`}
        </CodeBlock>
      </DemoBlock>

      <h2>MessageBubble 聊天气泡</h2>

      <DemoBlock
        title="标准对话 — user / assistant / system / tool 四种 role"
        code={`<MessageBubble role="system">会话开始</MessageBubble>
<MessageBubble role="user" timestamp={new Date()}>能帮我写个 useDebounce 吗?</MessageBubble>
<MessageBubble role="assistant" timestamp={new Date()}>当然! ...</MessageBubble>
<MessageBubble role="tool" toolName="search_web">{toolOutput}</MessageBubble>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <MessageBubble role="system">会话开始</MessageBubble>
          <MessageBubble role="user" timestamp={new Date()}>
            能帮我写一个 useDebounce hook 吗?
          </MessageBubble>
          <MessageBubble role="assistant" timestamp={new Date()}>
            当然可以! 下面是一个简单实现, 把 value 包一层就能拿到防抖后的值。
          </MessageBubble>
          <MessageBubble role="tool" toolName="search_web">
            {`{
  "query": "useDebounce hook react",
  "results": 3
}`}
          </MessageBubble>
        </div>
      </DemoBlock>

      <DemoBlock
        title="loading 态"
        description="assistant 在出首 token 前展示三个跳动的点, 给用户'正在思考'的反馈."
        code={`<MessageBubble role="assistant" loading />`}
      >
        <MessageBubble role="assistant" loading />
      </DemoBlock>

      <DemoBlock
        title="头像 + actions (复制 / 重新生成)"
        code={`<MessageBubble
  role="assistant"
  avatar={<img src="/ai-avatar.svg" />}
  actions={<>
    <button>📋 复制</button>
    <button>🔁 重新生成</button>
  </>}
>
  ...
</MessageBubble>`}
      >
        <MessageBubble
          role="assistant"
          avatar={<AvatarSpan letter="A" />}
          actions={
            <>
              <SmallBtn>📋 复制</SmallBtn>
              <SmallBtn>🔁 重新生成</SmallBtn>
              <SmallBtn>👍</SmallBtn>
              <SmallBtn>👎</SmallBtn>
            </>
          }
        >
          这是 AI 的回复。把鼠标悬停在气泡上能看到底下的操作按钮。
        </MessageBubble>
      </DemoBlock>

      <h2>三件套联动 · 完整聊天 demo</h2>

      <DemoBlock
        title="点'重放'触发模拟流式回复 (含代码块渲染)"
        description="组合 MessageBubble + StreamingText + CodeBlock 跑一段完整 LLM 响应. 实际接 Vercel AI SDK / OpenAI streaming API 几乎一样写法."
        code={`function ChatDemo() {
  const [messages, setMessages] = useState([
    { role: 'user', text: '能帮我写一个 useDebounce hook 吗?' },
  ]);
  const [streaming, setStreaming] = useState('');
  const [done, setDone] = useState(true);

  const replay = async () => {
    setDone(false); setStreaming('');
    for (let i = 1; i <= REPLY.length; i++) {
      await new Promise((r) => setTimeout(r, 15));
      setStreaming(REPLY.slice(0, i));
    }
    setDone(true);
  };

  return (
    <>
      {messages.map((m) => <MessageBubble role={m.role}>{m.text}</MessageBubble>)}
      <MessageBubble role="assistant">
        <StreamingText text={streaming} done={done} />
      </MessageBubble>
      <Button onClick={replay}>重放</Button>
    </>
  );
}`}
      >
        <ChatDemo />
      </DemoBlock>

      <h2>API · StreamingText</h2>
      <ApiTable
        rows={[
          { prop: 'text', desc: '当前累计字符串 (随 SSE 追加)', type: 'string', default: '-' },
          { prop: 'done', desc: '流式结束 — 收起末尾光标', type: 'boolean', default: 'false' },
          { prop: 'cursor', desc: '光标 — false 关闭 / ReactNode 自定义', type: 'boolean | ReactNode', default: 'true' },
          { prop: 'as', desc: '渲染元素 tag', type: `'span' | 'div' | 'p' | ...`, default: `'span'` },
        ]}
      />

      <h2>API · CodeBlock</h2>
      <ApiTable
        rows={[
          { prop: 'children', desc: '代码字符串 (不接 ReactNode)', type: 'string', default: '-' },
          { prop: 'language', desc: '语言标识 (展示在头部 + 传给 highlight)', type: 'string', default: '-' },
          { prop: 'filename', desc: '头部显示的文件名', type: 'string', default: '-' },
          { prop: 'lineNumbers', desc: '显示行号', type: 'boolean', default: 'false' },
          { prop: 'wrap', desc: '自动换行 (默认横滚)', type: 'boolean', default: 'false' },
          { prop: 'copy', desc: '显示复制按钮', type: 'boolean', default: 'true' },
          { prop: 'maxHeight', desc: '最大高度, 超出滚动', type: 'number | string', default: '-' },
          { prop: 'highlight', desc: '自定义高亮函数 (接 shiki / prism / hljs)', type: '(code, lang) => ReactNode', default: '-' },
          { prop: 'onCopy', desc: '复制成功回调', type: '(text) => void', default: '-' },
        ]}
      />

      <h2>API · MessageBubble</h2>
      <ApiTable
        rows={[
          { prop: 'role', desc: '消息身份 — 决定默认对齐 + 视觉风格', type: `'user' | 'assistant' | 'system' | 'tool'`, default: '-' },
          { prop: 'children', desc: '消息正文', type: 'ReactNode', default: '-' },
          { prop: 'avatar', desc: '头像', type: 'ReactNode', default: '-' },
          { prop: 'name', desc: '显示名 (覆盖 locale 默认)', type: 'ReactNode', default: '按 role' },
          { prop: 'timestamp', desc: '时间戳', type: 'Date | string', default: '-' },
          { prop: 'align', desc: '强制对齐方向 (auto = 按 role)', type: `'left' | 'right' | 'auto'`, default: `'auto'` },
          { prop: 'loading', desc: '加载态 (三个跳动的点)', type: 'boolean', default: 'false' },
          { prop: 'toolName', desc: 'tool role 时显示的工具名', type: 'string', default: '-' },
          { prop: 'actions', desc: '底部操作区 (hover 显示)', type: 'ReactNode', default: '-' },
        ]}
      />
    </>
  );
};

/* ===== 子 demo ===== */

const StreamingDemo: React.FC = () => {
  const [text, setText] = useState('');
  const [done, setDone] = useState(true);
  const playRef = useRef<number | null>(null);

  const play = () => {
    if (playRef.current != null) window.clearInterval(playRef.current);
    setText('');
    setDone(false);
    let i = 0;
    const target = '你好,我是 Aurora UX 的 AI Assistant。这是 SSE 流式输出的演示效果,真实场景接 OpenAI / Anthropic / DeepSeek 的 stream API,把 token 不断追加到 text 即可。';
    playRef.current = window.setInterval(() => {
      i++;
      setText(target.slice(0, i));
      if (i >= target.length) {
        if (playRef.current != null) window.clearInterval(playRef.current);
        playRef.current = null;
        setDone(true);
      }
    }, 30);
  };

  useEffect(() => {
    return () => {
      if (playRef.current != null) window.clearInterval(playRef.current);
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          padding: 12,
          background: 'var(--au-bg-soft)',
          borderRadius: 8,
          minHeight: 80,
          fontSize: 14,
        }}
      >
        <StreamingText text={text} done={done} />
      </div>
      <div>
        <Button type="primary" onClick={play}>
          模拟流式输出
        </Button>
      </div>
    </div>
  );
};

const ChatDemo: React.FC = () => {
  const [streaming, setStreaming] = useState(SAMPLE_REPLY);
  const [done, setDone] = useState(true);
  const timerRef = useRef<number | null>(null);

  const replay = () => {
    if (timerRef.current != null) window.clearInterval(timerRef.current);
    setStreaming('');
    setDone(false);
    let i = 0;
    timerRef.current = window.setInterval(() => {
      i += 4;
      setStreaming(SAMPLE_REPLY.slice(0, i));
      if (i >= SAMPLE_REPLY.length) {
        if (timerRef.current != null) window.clearInterval(timerRef.current);
        timerRef.current = null;
        setDone(true);
      }
    }, 24);
  };

  useEffect(() => () => {
    if (timerRef.current != null) window.clearInterval(timerRef.current);
  }, []);

  /** 把 streaming 字符串里的 ```language\n...\n``` 块拆出来分别渲染 */
  const parts = parseMarkdownCode(streaming);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <MessageBubble role="user" timestamp={new Date()}>
        能帮我写一个 useDebounce hook 吗?
      </MessageBubble>
      <MessageBubble
        role="assistant"
        timestamp={new Date()}
        avatar={<AvatarSpan letter="A" />}
      >
        {parts.map((p, i) =>
          p.type === 'code' ? (
            <CodeBlock
              key={i}
              language={p.lang}
              style={{ margin: '6px 0' }}
              highlight={p.lang === 'ts' || p.lang === 'tsx' || p.lang === 'js' ? highlightTs : undefined}
            >
              {p.text}
            </CodeBlock>
          ) : (
            <StreamingText
              key={i}
              text={p.text}
              done={done || i !== parts.length - 1}
            />
          ),
        )}
      </MessageBubble>
      <div style={{ marginTop: 8 }}>
        <Button onClick={replay}>重放</Button>
      </div>
    </div>
  );
};

const AvatarSpan: React.FC<{ letter: string }> = ({ letter }) => (
  <span
    style={{
      width: '100%',
      height: '100%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #5b8def, #a855f7)',
      color: '#fff',
      fontWeight: 700,
      fontSize: 13,
    }}
  >
    {letter}
  </span>
);

const SmallBtn: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <button
    type="button"
    style={{
      padding: '2px 8px',
      fontSize: 12,
      border: '1px solid var(--au-border)',
      background: 'var(--au-bg)',
      borderRadius: 4,
      cursor: 'pointer',
      color: 'var(--au-text-2)',
    }}
  >
    {children}
  </button>
);

/** 极简 ts/js tokenizer — 仅给 CodeBlock highlight prop demo 用, 不是真高亮库 */
const TS_KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'import', 'from', 'export', 'default', 'async', 'await', 'new', 'class',
  'extends', 'this', 'typeof', 'instanceof', 'true', 'false', 'null', 'undefined',
]);
function highlightTs(code: string): React.ReactNode {
  // 拆出: 字符串 / 注释 / 数字 / 标识符 / 其他
  const re = /("[^"]*"|'[^']*'|`[^`]*`|\/\/[^\n]*|\/\*[\s\S]*?\*\/|\b\d+(\.\d+)?\b|\b\w+\b)/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(code)) !== null) {
    if (m.index > last) parts.push(code.slice(last, m.index));
    const tok = m[0];
    let color: string | null = null;
    if (/^["'`]/.test(tok)) color = '#86efac';                      // 字符串
    else if (/^\/\//.test(tok) || /^\/\*/.test(tok)) color = '#94a3b8'; // 注释
    else if (/^\d/.test(tok)) color = '#fb923c';                    // 数字
    else if (TS_KEYWORDS.has(tok)) color = '#c084fc';               // 关键字
    else if (/^[A-Z]/.test(tok)) color = '#7dd3fc';                 // 类型 / 大写标识符
    parts.push(color ? <span key={key++} style={{ color }}>{tok}</span> : tok);
    last = m.index + tok.length;
  }
  if (last < code.length) parts.push(code.slice(last));
  return parts;
}

/** 简易把 markdown 字符串切成 [text | code] 段, 不依赖 markdown 解析器 */
type Part = { type: 'text'; text: string } | { type: 'code'; lang: string; text: string };
function parseMarkdownCode(src: string): Part[] {
  const parts: Part[] = [];
  const re = /```(\w*)\n([\s\S]*?)(?:```|$)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    if (m.index > last) parts.push({ type: 'text', text: src.slice(last, m.index) });
    parts.push({ type: 'code', lang: m[1] || 'tsx', text: m[2] });
    last = m.index + m[0].length;
  }
  if (last < src.length) parts.push({ type: 'text', text: src.slice(last) });
  if (parts.length === 0) parts.push({ type: 'text', text: src });
  return parts;
}

export default AiKitDoc;
