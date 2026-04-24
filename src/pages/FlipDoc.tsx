import React, { useEffect, useState } from 'react';
import { Flip } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';
import Playground from '../site-components/Playground';

const FlipDoc: React.FC = () => {
  return (
    <>
      <h1>Flip 翻牌器</h1>
      <p>
        Split-flap 风格的数字翻牌器。每位数字独立翻页,常用于倒计时、实时统计、股价、时钟等场景。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="value 变化时每位数字独立翻牌。非数字字符(如 : 和 ,)作为分隔不翻动。"
        code={`const [n, setN] = useState(123);

<Flip value={n} />
<Button onClick={() => setN(Math.floor(Math.random() * 1000))}>随机</Button>`}
      >
        <BasicDemo />
      </DemoBlock>

      <DemoBlock
        title="固定位数(补零)"
        description="minLength 让位数稳定, 小于该位数时前方补 0。适合计数器。"
        code={`<Flip value={42} minLength={6} />`}
      >
        <Flip value={42} minLength={6} />
      </DemoBlock>

      <DemoBlock
        title="倒计时"
        description="配合 setInterval, 每秒更新 value。"
        code={`const [left, setLeft] = useState(60);
useEffect(() => {
  const id = setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000);
  return () => clearInterval(id);
}, []);

<Flip value={left} minLength={2} />`}
      >
        <CountdownDemo />
      </DemoBlock>

      <DemoBlock
        title="时钟"
        description="字符串形式, HH:MM:SS 中的冒号自动识别为分隔符。"
        code={`<Flip value={formatTime(now)} />`}
      >
        <ClockDemo />
      </DemoBlock>

      <DemoBlock
        title="尺寸"
        description="size 支持 small / medium / large 或直接传像素数字。"
        code={`<Flip value={888} size="small" />
<Flip value={888} size="medium" />
<Flip value={888} size="large" />
<Flip value={888} size={100} />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Flip value={888} size="small" />
          <Flip value={888} size="medium" />
          <Flip value={888} size="large" />
          <Flip value={888} size={100} />
        </div>
      </DemoBlock>

      <DemoBlock
        title="前后缀"
        description="prefix / suffix 渲染在数字两侧,字号与卡片相协调。"
        code={`<Flip value={1299} prefix="¥" suffix=".00" />
<Flip value={98} suffix="%" size="small" />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Flip value={1299} prefix="¥" suffix=".00" />
          <Flip value={98} suffix="%" size="small" />
        </div>
      </DemoBlock>

      <DemoBlock
        title="自定义颜色"
        description="通过 CSS 变量 --au-flip-card-bg-top / --au-flip-card-bg-bot / --au-flip-card-color 覆盖。"
        code={`<Flip
  value={2026}
  size="large"
  style={{
    '--au-flip-card-bg-top': '#6b4bff',
    '--au-flip-card-bg-bot': '#3a1e9a',
    '--au-flip-card-color': '#fff',
  }}
/>`}
      >
        <Flip
          value={2026}
          size="large"
          style={
            {
              '--au-flip-card-bg-top': '#6b4bff',
              '--au-flip-card-bg-bot': '#3a1e9a',
              '--au-flip-card-color': '#fff',
            } as React.CSSProperties
          }
        />
      </DemoBlock>

      <h2>交互式调试</h2>
      <Playground
        title="实时调整 Flip 属性"
        description="改变 value 观察翻牌动画。size 选 small/medium/large, duration 调整单次翻牌时长。"
        componentName="Flip"
        component={PlaygroundWrapper}
        controls={[
          { name: 'value', type: 'text', default: '123', label: 'value' },
          { name: 'minLength', type: 'text', default: '0', label: 'minLength' },
          { name: 'duration', type: 'text', default: '600', label: 'duration (ms)' },
          {
            name: 'size',
            type: 'select',
            options: ['small', 'medium', 'large'],
            default: 'medium',
          },
          { name: 'prefix', type: 'text', default: '', label: 'prefix' },
          { name: 'suffix', type: 'text', default: '', label: 'suffix' },
        ]}
      />

      <h2>API</h2>
      <ApiTable
        rows={[
          {
            prop: 'value',
            desc: '要展示的值, 按字符拆分, 数字字符会翻牌, 其他字符作为分隔',
            type: 'string | number',
            default: '-',
          },
          {
            prop: 'minLength',
            desc: '最少字符数; 不足时前方补 0',
            type: 'number',
            default: '0',
          },
          {
            prop: 'duration',
            desc: '单次翻牌动画时长 (ms)',
            type: 'number',
            default: '600',
          },
          {
            prop: 'size',
            desc: '预设尺寸或自定义卡片高度 (px)',
            type: `'small' | 'medium' | 'large' | number`,
            default: `'medium'`,
          },
          {
            prop: 'prefix',
            desc: '前缀 (如货币符号)',
            type: 'ReactNode',
            default: '-',
          },
          {
            prop: 'suffix',
            desc: '后缀 (如单位)',
            type: 'ReactNode',
            default: '-',
          },
        ]}
      />

      <h3>CSS 变量</h3>
      <ApiTable
        rows={[
          { prop: '--au-flip-card-bg-top', desc: '上半卡片背景色', type: 'color', default: '#3a4050' },
          { prop: '--au-flip-card-bg-bot', desc: '下半卡片背景色', type: 'color', default: '#2a2f3c' },
          { prop: '--au-flip-card-color', desc: '字符颜色', type: 'color', default: '#fff' },
          { prop: '--au-flip-card-radius', desc: '卡片圆角', type: 'length', default: '6px' },
          { prop: '--au-flip-card-split', desc: '上下分隔线颜色', type: 'color', default: 'rgba(0,0,0,0.5)' },
        ]}
      />
    </>
  );
};

/* ------------------------- demos ------------------------- */

const BasicDemo: React.FC = () => {
  const [n, setN] = useState(123);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Flip value={n} />
      <button
        className="au-btn au-btn--primary"
        onClick={() => setN(Math.floor(Math.random() * 1000))}
      >
        随机
      </button>
      <button className="au-btn" onClick={() => setN((v) => v + 1)}>
        +1
      </button>
    </div>
  );
};

const CountdownDemo: React.FC = () => {
  const [left, setLeft] = useState(60);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          setRunning(false);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Flip value={left} minLength={2} />
      <button
        className="au-btn au-btn--primary"
        onClick={() => {
          if (left === 0) setLeft(60);
          setRunning((r) => !r);
        }}
      >
        {running ? '暂停' : '开始'}
      </button>
      <button
        className="au-btn"
        onClick={() => {
          setRunning(false);
          setLeft(60);
        }}
      >
        重置
      </button>
    </div>
  );
};

const ClockDemo: React.FC = () => {
  const [time, setTime] = useState(() => fmt(new Date()));
  useEffect(() => {
    const id = setInterval(() => setTime(fmt(new Date())), 1000);
    return () => clearInterval(id);
  }, []);
  return <Flip value={time} size="large" />;
};

function fmt(d: Date): string {
  const p = (n: number) => n.toString().padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/* ------------------------- playground adapter ------------------------- */

interface WrapperProps {
  value?: string;
  minLength?: string;
  duration?: string;
  size?: 'small' | 'medium' | 'large';
  prefix?: string;
  suffix?: string;
}

const PlaygroundWrapper: React.FC<WrapperProps> = ({
  value = '123',
  minLength,
  duration,
  size,
  prefix,
  suffix,
}) => {
  const num = (s: string | undefined, fallback: number) => {
    const n = Number(s);
    return Number.isFinite(n) ? n : fallback;
  };
  return (
    <Flip
      value={value}
      minLength={num(minLength, 0)}
      duration={num(duration, 600)}
      size={size ?? 'medium'}
      prefix={prefix || undefined}
      suffix={suffix || undefined}
    />
  );
};

export default FlipDoc;
