import React, { useState } from 'react';
import { Typewriter } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';
import Playground from '../site-components/Playground';

const TypewriterDoc: React.FC = () => {
  return (
    <>
      <h1>Typewriter 打字机</h1>
      <p>
        逐字符打出文本的动效组件。支持多条文本循环、可调速度、启动延迟、自定义光标、按需渲染为任意标签。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="传入一段文字,组件逐字符打出。默认速度 60ms/字, 带闪烁光标。"
        code={`<Typewriter text="Hello, Aurora UI." />`}
      >
        <Typewriter text="Hello, Aurora UI." />
      </DemoBlock>

      <DemoBlock
        title="多文本循环"
        description="传入字符串数组 + loop, 组件会按顺序打 → 停 → 删 → 下一条, 循环播放。"
        code={`<Typewriter
  text={[
    '优雅的设计语言。',
    '丰富的组件生态。',
    '极致的开发体验。',
  ]}
  loop
/>`}
      >
        <Typewriter
          text={[
            '优雅的设计语言。',
            '丰富的组件生态。',
            '极致的开发体验。',
          ]}
          loop
        />
      </DemoBlock>

      <DemoBlock
        title="调速度与停顿"
        description="speed 控制打字快慢, deleteSpeed 控制删除快慢, pauseAfter 控制一句打完的停顿。"
        code={`<Typewriter
  text={['Fast typing.', 'Slow delete.']}
  speed={30}
  deleteSpeed={80}
  pauseAfter={800}
  loop
/>`}
      >
        <Typewriter
          text={['Fast typing.', 'Slow delete.']}
          speed={30}
          deleteSpeed={80}
          pauseAfter={800}
          loop
        />
      </DemoBlock>

      <DemoBlock
        title="启动延迟"
        description="startDelay 在渲染后等待一段时间再开始,用于进场动画的节奏编排。"
        code={`<Typewriter text="Lazy start..." startDelay={1500} />`}
      >
        <StartDelayDemo />
      </DemoBlock>

      <DemoBlock
        title="自定义光标"
        description="cursor 可以是 true / false, 也可以是任意字符或 ReactNode。"
        code={`<Typewriter text="Block cursor." cursor="▌" />
<Typewriter text="No cursor." cursor={false} />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Typewriter text="Block cursor." cursor="▌" loop />
          <Typewriter text="No cursor at all." cursor={false} loop />
        </div>
      </DemoBlock>

      <DemoBlock
        title="渲染为标题"
        description="as 让组件渲染成任意标签,和页面标题体结合做大字打字效果。"
        code={`<Typewriter
  as="h2"
  text="Building beautifully."
  speed={80}
/>`}
      >
        <Typewriter
          as="h2"
          text="Building beautifully."
          speed={80}
          style={{ margin: 0, color: 'var(--au-primary)' }}
        />
      </DemoBlock>

      <DemoBlock
        title="完成回调"
        description="非循环模式下,全部文字打完会触发一次 onDone。"
        code={`const [done, setDone] = useState(false);

<Typewriter
  text="Click me when done!"
  onDone={() => setDone(true)}
/>
{done && <Button>I'm ready</Button>}`}
      >
        <DoneDemo />
      </DemoBlock>

      <h2>交互式调试</h2>
      <Playground
        title="实时调整 Typewriter 属性"
        description="调整速度、启动延迟、光标、循环开关,下方会按当前配置打出。"
        componentName="Typewriter"
        component={PlaygroundWrapper}
        controls={[
          { name: 'text', type: 'text', default: 'Hello, Aurora UI.', label: 'text' },
          { name: 'speed', type: 'text', default: '60', label: 'speed (ms)' },
          { name: 'deleteSpeed', type: 'text', default: '30', label: 'deleteSpeed (ms)' },
          { name: 'pauseAfter', type: 'text', default: '1500', label: 'pauseAfter (ms)' },
          { name: 'startDelay', type: 'text', default: '0', label: 'startDelay (ms)' },
          { name: 'loop', type: 'boolean', default: false },
          { name: 'cursor', type: 'boolean', default: true },
        ]}
      />

      <h2>API</h2>
      <ApiTable
        rows={[
          {
            prop: 'text',
            desc: '要打出的文本; 字符串或字符串数组',
            type: 'string | string[]',
            default: '-',
          },
          {
            prop: 'speed',
            desc: '每字符打出间隔 (ms)',
            type: 'number',
            default: '60',
          },
          {
            prop: 'deleteSpeed',
            desc: '每字符删除间隔 (ms); 仅 loop 或多字符串时用',
            type: 'number',
            default: '30',
          },
          {
            prop: 'pauseAfter',
            desc: '一句打完后的停顿时长 (ms)',
            type: 'number',
            default: '1500',
          },
          {
            prop: 'startDelay',
            desc: '启动延迟 (ms)',
            type: 'number',
            default: '0',
          },
          {
            prop: 'loop',
            desc: '循环播放; 数组到尾后回到第一条',
            type: 'boolean',
            default: 'false',
          },
          {
            prop: 'cursor',
            desc: '光标: true 用默认 |, 可传任意字符或 ReactNode, false 隐藏',
            type: 'boolean | ReactNode',
            default: 'true',
          },
          {
            prop: 'onDone',
            desc: '非循环模式下全部打完触发一次',
            type: '() => void',
            default: '-',
          },
          {
            prop: 'as',
            desc: '渲染为什么标签',
            type: 'ElementType',
            default: `'span'`,
          },
        ]}
      />
    </>
  );
};

/* ------------------------- demos ------------------------- */

const StartDelayDemo: React.FC = () => {
  const [key, setKey] = useState(0);
  return (
    <div>
      <Typewriter key={key} text="Lazy start..." startDelay={1500} />
      <div style={{ marginTop: 12 }}>
        <button className="au-btn" onClick={() => setKey((k) => k + 1)}>
          重新播放
        </button>
      </div>
    </div>
  );
};

const DoneDemo: React.FC = () => {
  const [done, setDone] = useState(false);
  const [key, setKey] = useState(0);
  return (
    <div>
      <Typewriter
        key={key}
        text="Click me when done!"
        onDone={() => setDone(true)}
      />
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        {done && (
          <button className="au-btn au-btn--primary">I'm ready</button>
        )}
        <button
          className="au-btn"
          onClick={() => {
            setDone(false);
            setKey((k) => k + 1);
          }}
        >
          重新播放
        </button>
      </div>
    </div>
  );
};

/* ------------------------- playground adapter ------------------------- */

interface WrapperProps {
  text?: string;
  speed?: string;
  deleteSpeed?: string;
  pauseAfter?: string;
  startDelay?: string;
  loop?: boolean;
  cursor?: boolean;
}

const PlaygroundWrapper: React.FC<WrapperProps> = ({
  text = 'Hello, Aurora UI.',
  speed,
  deleteSpeed,
  pauseAfter,
  startDelay,
  loop,
  cursor,
}) => {
  const num = (s: string | undefined, fallback: number) => {
    const n = Number(s);
    return Number.isFinite(n) ? n : fallback;
  };
  // 文本中用 | 分隔多句, 演示多串循环
  const textValue = text.includes('|')
    ? text.split('|').map((s) => s.trim())
    : text;
  return (
    <Typewriter
      text={textValue}
      speed={num(speed, 60)}
      deleteSpeed={num(deleteSpeed, 30)}
      pauseAfter={num(pauseAfter, 1500)}
      startDelay={num(startDelay, 0)}
      loop={loop}
      cursor={cursor}
    />
  );
};

export default TypewriterDoc;
