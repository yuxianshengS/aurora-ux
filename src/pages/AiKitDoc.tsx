import React, { useEffect, useRef, useState } from 'react';
import {
  StreamingText,
  CodeBlock,
  MessageBubble,
  Button,
  TextArea,
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
        title="完整聊天界面 — 输入框 / 多轮历史 / 工具调用 / 流式输出 / 复制重生成"
        description="一个跑得起来的完整 chat: 真实输入框 (Enter 发送 / Shift+Enter 换行) / loading 三跳点 / 流式过程中显示停止按钮 / assistant 完成后 hover 出复制 + 重新生成 + 👍👎 / 触发关键词出 tool 调用消息. 试试输入 'useDebounce' / '天气' / 'Aurora' 看不同剧本."
        code={`function Chat() {
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { id: 's0', role: 'system', text: 'AI 已就绪' },
  ]);
  const [input, setInput] = useState('');
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const isStreaming = streamingId !== null;

  const send = async () => {
    const userMsg = { id: uid(), role: 'user', text: input, ts: new Date() };
    setMsgs((m) => [...m, userMsg]);
    setInput('');

    const aid = uid();
    setMsgs((m) => [...m, { id: aid, role: 'assistant', text: '', loading: true, done: false, ts: new Date() }]);
    setStreamingId(aid);

    // 真实场景: const res = await fetch('/api/chat', { ... }); const reader = res.body.getReader();
    // while (chunk = await reader.read()) setMsgs(updateAssistantText(aid, decoded))
    // 这里用剧本模拟
    const reply = scriptedReply(userMsg.text);
    if (reply.tool) setMsgs((m) => insertToolBefore(m, aid, reply.tool));
    streamInto(aid, reply.text, () => setStreamingId(null));
  };

  return (
    <Chat>
      {msgs.map((m) => <MessageBubble role={m.role} ...>{...}</MessageBubble>)}
      <Input value={input} onChange={setInput} onEnter={send} disabled={isStreaming} />
      {isStreaming ? <Button onClick={stop}>⏹ 停止</Button> : <Button onClick={send}>发送 ↵</Button>}
    </Chat>
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

/* ===== ChatDemo — 完整聊天界面 ===== */

type ChatMsg =
  | { id: string; role: 'system'; text: string }
  | { id: string; role: 'user'; text: string; ts: Date }
  | { id: string; role: 'assistant'; text: string; ts: Date; done: boolean; loading?: boolean }
  | { id: string; role: 'tool'; toolName: string; text: string };

const uid = () => `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

/** 根据用户输入命中关键词出"剧本",真实场景这里换成 SSE fetch */
function scriptedReply(userText: string): { tool?: { name: string; output: string }; text: string } {
  const t = userText.toLowerCase();
  if (t.includes('debounce') || t.includes('防抖') || t.includes('hook')) {
    return {
      tool: {
        name: 'search_docs',
        output: `{
  "query": "useDebounce hook",
  "hits": 3,
  "top": "react-use/useDebounce"
}`,
      },
      text: SAMPLE_REPLY,
    };
  }
  if (t.includes('天气') || t.includes('weather')) {
    return {
      tool: {
        name: 'get_weather',
        output: `{
  "city": "Beijing",
  "temp_c": 18,
  "condition": "Sunny",
  "wind": "NW 3 m/s"
}`,
      },
      text: '北京今天 **18°C 晴**, 西北风 3 m/s, 适合外出。下午 4 点前后紫外线偏强,记得防晒 ☀️',
    };
  }
  if (t.includes('aurora') || t.includes('极光')) {
    return {
      text: 'Aurora UX 的极光视觉体系基于 `AuroraBg` + `GlowCard` + `GradientText`,搭配 8 套主色 token 自动跟着 ConfigProvider 切。试试在 `<AuroraBg preset="aurora">` 里塞个 `<GradientText>` 看效果。',
    };
  }
  return {
    text: `我收到了:"${userText}"。这个 demo 是**剧本式**的,试试问 "能写个 useDebounce 吗?" 或 "北京天气?" 或 "讲讲 Aurora 视觉?" 看真正的工具调用 + 代码块联动。`,
  };
}

const ChatDemo: React.FC = () => {
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { id: 's0', role: 'system', text: 'Aurora UX AI · 已就绪' },
    {
      id: 'u0',
      role: 'user',
      text: '能帮我写一个 useDebounce hook 吗?',
      ts: new Date(Date.now() - 60000),
    },
    {
      id: 't0',
      role: 'tool',
      toolName: 'search_docs',
      text: `{ "query": "useDebounce hook", "hits": 3 }`,
    },
    {
      id: 'a0',
      role: 'assistant',
      text: SAMPLE_REPLY,
      ts: new Date(Date.now() - 30000),
      done: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 新消息时自动滚到底
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  // 卸载清理
  useEffect(() => () => {
    if (timerRef.current != null) window.clearInterval(timerRef.current);
  }, []);

  const isStreaming = streamingId !== null;

  const stop = () => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamingId) {
      setMsgs((cur) =>
        cur.map((m) => (m.id === streamingId && m.role === 'assistant' ? { ...m, done: true, loading: false } : m)),
      );
    }
    setStreamingId(null);
  };

  const send = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');

    // 1) 加用户消息
    const userMsg: ChatMsg = { id: uid(), role: 'user', text, ts: new Date() };
    setMsgs((cur) => [...cur, userMsg]);

    // 2) 加一个 assistant loading 占位
    const aid = uid();
    setMsgs((cur) => [
      ...cur,
      { id: aid, role: 'assistant', text: '', ts: new Date(), done: false, loading: true },
    ]);
    setStreamingId(aid);

    // 3) 模拟"思考" 600ms 后开始流; 含 tool call 时先 push tool 消息
    window.setTimeout(() => {
      const reply = scriptedReply(text);
      if (reply.tool) {
        setMsgs((cur) => {
          const next = [...cur];
          // 在 assistant 占位前面插入 tool 消息
          const aIdx = next.findIndex((m) => m.id === aid);
          next.splice(aIdx, 0, {
            id: uid(),
            role: 'tool',
            toolName: reply.tool!.name,
            text: reply.tool!.output,
          });
          return next;
        });
      }

      // 4) 关掉 loading, 开始流
      setMsgs((cur) =>
        cur.map((m) => (m.id === aid && m.role === 'assistant' ? { ...m, loading: false } : m)),
      );
      let i = 0;
      const target = reply.text;
      timerRef.current = window.setInterval(() => {
        i += 4;
        const slice = target.slice(0, i);
        setMsgs((cur) =>
          cur.map((m) => (m.id === aid && m.role === 'assistant' ? { ...m, text: slice } : m)),
        );
        if (i >= target.length) {
          if (timerRef.current != null) window.clearInterval(timerRef.current);
          timerRef.current = null;
          setMsgs((cur) =>
            cur.map((m) => (m.id === aid && m.role === 'assistant' ? { ...m, text: target, done: true } : m)),
          );
          setStreamingId(null);
        }
      }, 22);
    }, 600);
  };

  const regenerate = (mid: string) => {
    if (isStreaming) return;
    // 找到这条 assistant + 它前面那条 user, 重新触发一次
    const idx = msgs.findIndex((m) => m.id === mid);
    if (idx < 0) return;
    const prevUser = [...msgs.slice(0, idx)].reverse().find((m) => m.role === 'user') as
      | (ChatMsg & { role: 'user' })
      | undefined;
    if (!prevUser) return;
    // 删掉这条之后的内容
    setMsgs((cur) => cur.slice(0, idx));
    // 用 prevUser 文字重发 (但不再 push 一个新 user, 只跑 assistant 流程)
    setInput('');
    const aid = uid();
    setMsgs((cur) => [
      ...cur,
      { id: aid, role: 'assistant', text: '', ts: new Date(), done: false, loading: true },
    ]);
    setStreamingId(aid);
    window.setTimeout(() => {
      const reply = scriptedReply(prevUser.text);
      if (reply.tool) {
        setMsgs((cur) => {
          const next = [...cur];
          const aIdx = next.findIndex((m) => m.id === aid);
          next.splice(aIdx, 0, {
            id: uid(),
            role: 'tool',
            toolName: reply.tool!.name,
            text: reply.tool!.output,
          });
          return next;
        });
      }
      setMsgs((cur) =>
        cur.map((m) => (m.id === aid && m.role === 'assistant' ? { ...m, loading: false } : m)),
      );
      let i = 0;
      const target = reply.text;
      timerRef.current = window.setInterval(() => {
        i += 4;
        const slice = target.slice(0, i);
        setMsgs((cur) =>
          cur.map((m) => (m.id === aid && m.role === 'assistant' ? { ...m, text: slice } : m)),
        );
        if (i >= target.length) {
          if (timerRef.current != null) window.clearInterval(timerRef.current);
          timerRef.current = null;
          setMsgs((cur) =>
            cur.map((m) => (m.id === aid && m.role === 'assistant' ? { ...m, text: target, done: true } : m)),
          );
          setStreamingId(null);
        }
      }, 22);
    }, 500);
  };

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
  };

  /** 渲染单条 assistant 消息: 把 markdown ``` 块拆出来, 文字部分用 StreamingText */
  const renderAssistantBody = (m: Extract<ChatMsg, { role: 'assistant' }>) => {
    if (m.loading) return null;
    const parts = parseMarkdownCode(m.text);
    return parts.map((p, i) =>
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
          done={m.done || i !== parts.length - 1}
        />
      ),
    );
  };

  return (
    <div
      style={{
        border: '1px solid var(--au-border)',
        borderRadius: 12,
        background: 'var(--au-bg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: 540,
      }}
    >
      {/* 消息列表 */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 16px',
          background: 'var(--au-bg-base, var(--au-bg))',
        }}
      >
        {msgs.map((m) => {
          if (m.role === 'system') {
            return (
              <MessageBubble key={m.id} role="system">
                {m.text}
              </MessageBubble>
            );
          }
          if (m.role === 'user') {
            return (
              <MessageBubble
                key={m.id}
                role="user"
                timestamp={m.ts}
                avatar={<AvatarSpan letter="U" />}
              >
                {m.text}
              </MessageBubble>
            );
          }
          if (m.role === 'tool') {
            return (
              <MessageBubble key={m.id} role="tool" toolName={m.toolName}>
                {m.text}
              </MessageBubble>
            );
          }
          // assistant
          return (
            <MessageBubble
              key={m.id}
              role="assistant"
              timestamp={m.ts}
              avatar={<AvatarSpan letter="A" />}
              loading={m.loading}
              actions={
                m.done && !m.loading ? (
                  <>
                    <SmallBtn onClick={() => copy(m.text)}>📋 复制</SmallBtn>
                    <SmallBtn onClick={() => regenerate(m.id)}>🔁 重新生成</SmallBtn>
                    <SmallBtn>👍</SmallBtn>
                    <SmallBtn>👎</SmallBtn>
                  </>
                ) : undefined
              }
            >
              {renderAssistantBody(m)}
            </MessageBubble>
          );
        })}
      </div>

      {/* 输入区 */}
      <div
        style={{
          borderTop: '1px solid var(--au-border)',
          padding: 12,
          background: 'var(--au-bg)',
          display: 'flex',
          gap: 8,
          alignItems: 'flex-end',
        }}
      >
        <div style={{ flex: 1 }}>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='试试: "能写个 useDebounce 吗?" / "北京天气?" / "讲讲 Aurora 视觉?"'
            autoSize={{ minRows: 1, maxRows: 4 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            disabled={isStreaming}
          />
        </div>
        {isStreaming ? (
          <Button onClick={stop} type="default">
            ⏹ 停止
          </Button>
        ) : (
          <Button onClick={send} type="primary" disabled={!input.trim()}>
            发送 ↵
          </Button>
        )}
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

const SmallBtn: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
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
