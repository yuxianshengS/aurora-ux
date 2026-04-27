import React, { useState } from 'react';
import { ScrambleText, GradientText, Button } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const ScrambleTextDoc: React.FC = () => {
  return (
    <>
      <h1>ScrambleText 乱码文字</h1>
      <p>
        每个字符在乱码里反复切换, 然后从左往右逐字"锁定"成最终文本。
        Hero 标题进场 / 数字密码揭示 / 故障美学动效, 一行装上极致质感。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="挂载即播一次. 默认每字符 12 轮乱码, 50ms 一帧, 字符间错开 40ms."
        code={`<ScrambleText text="Welcome to Aurora UI" />`}
      >
        <ScrambleText text="Welcome to Aurora UI" style={{ fontSize: 32, fontWeight: 700 }} />
      </DemoBlock>

      <DemoBlock
        title="手动重播 (trigger)"
        description="用 trigger prop 触发重播; 也可配 GradientText 做品牌进场."
        code={`const [n, setN] = useState(0);
<ScrambleText
  text="为中后台而生"
  trigger={n}
/>
<Button onClick={() => setN(v => v + 1)}>重播</Button>`}
      >
        <ReplayDemo />
      </DemoBlock>

      <DemoBlock
        title="嵌进 GradientText"
        description="ScrambleText 在外, GradientText 在外面包一层, 文字一边变一边发光."
        code={`<GradientText size={48} weight={800}>
  <ScrambleText text="北极光在文字里流动" />
</GradientText>`}
      >
        <GradientText size={48} weight={800}>
          <ScrambleText text="北极光在文字里流动" />
        </GradientText>
      </DemoBlock>

      <DemoBlock
        title="字符集 + 速度"
        description="charset 控制乱码字符池; speed/rounds 控制节奏."
        code={`<ScrambleText
  text="01001010 ENCRYPTED"
  charset="01"
  rounds={20}
  speed={30}
/>`}
      >
        <ScrambleText
          text="01001010 ENCRYPTED"
          charset="01"
          rounds={20}
          speed={30}
          style={{
            fontFamily: 'SF Mono, Menlo, monospace',
            fontSize: 24,
            color: '#22d3ee',
            letterSpacing: 2,
          }}
        />
      </DemoBlock>

      <DemoBlock
        title="慢速 + 大字"
        description="rounds=24 + stagger=80, 适合 Hero 大标题."
        code={`<ScrambleText
  text="HELLO AURORA"
  rounds={24}
  stagger={80}
  charset="ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%"
  style={{ fontSize: 64, fontWeight: 800 }}
/>`}
      >
        <ScrambleText
          text="HELLO AURORA"
          rounds={24}
          stagger={80}
          charset="ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%"
          style={{ fontSize: 64, fontWeight: 800, letterSpacing: 1 }}
        />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'text', desc: '最终展示的文本; 变化触发重新乱码', type: 'string', default: '-' },
          { prop: 'rounds', desc: '每字符乱码轮数, 越大越久', type: 'number', default: '12' },
          { prop: 'speed', desc: '单帧间隔 (ms)', type: 'number', default: '50' },
          { prop: 'stagger', desc: '字符之间的开始延迟 (ms), 0 = 同时开锁', type: 'number', default: '40' },
          { prop: 'charset', desc: '乱码用的字符集', type: 'string', default: '英数 + 符号' },
          { prop: 'autoStart', desc: '自动开始', type: 'boolean', default: 'true' },
          { prop: 'trigger', desc: '改变它会重播 (key trick)', type: 'string | number', default: '-' },
          { prop: 'as', desc: '渲染元素', type: 'keyof JSX.IntrinsicElements', default: `'span'` },
          { prop: 'onDone', desc: '动画完成回调', type: '() => void', default: '-' },
        ]}
      />
    </>
  );
};

const ReplayDemo: React.FC = () => {
  const [n, setN] = useState(0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <ScrambleText
        text="为中后台而生"
        trigger={n}
        style={{ fontSize: 36, fontWeight: 700 }}
      />
      <Button onClick={() => setN((v) => v + 1)}>重播 ({n})</Button>
    </div>
  );
};

export default ScrambleTextDoc;
