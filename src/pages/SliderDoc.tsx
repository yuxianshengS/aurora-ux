import React, { useState } from 'react';
import { Slider } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const SliderDoc: React.FC = () => {
  return (
    <>
      <h1>Slider 滑动输入条</h1>
      <p>
        在一段范围内选择数值。支持单值 / 区间、步长吸附、刻度点与标签、
        垂直方向、反向、键盘 (<code>←→↑↓</code> / <code>PageUp/Down</code> /{' '}
        <code>Home/End</code>) 操作。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="默认 0-100,步长为 1。"
        code={`<Slider defaultValue={30} />`}
      >
        <Slider defaultValue={30} />
      </DemoBlock>

      <DemoBlock
        title="受控 + 事件"
        description="onChange 拖拽中持续触发,onChangeComplete 松手时触发一次。"
        code={`const [v, setV] = useState(40);

<Slider
  value={v}
  onChange={v => setV(v as number)}
  onChangeComplete={v => console.log('commit', v)}
/>`}
      >
        <ControlledDemo />
      </DemoBlock>

      <DemoBlock
        title="区间选择"
        description="range=true,值为 [start, end] 数组。"
        code={`<Slider range defaultValue={[20, 70]} />`}
      >
        <Slider range defaultValue={[20, 70]} />
      </DemoBlock>

      <DemoBlock
        title="步长 · 精度"
        description="step 控制吸附粒度,支持小数。"
        code={`<Slider min={0} max={1} step={0.05} defaultValue={0.3} />`}
      >
        <Slider
          min={0}
          max={1}
          step={0.05}
          defaultValue={0.3}
          tooltipFormatter={(v) => v.toFixed(2)}
        />
      </DemoBlock>

      <DemoBlock
        title="刻度点 + 标签"
        description="marks 同时展示刻度与文字标签。"
        code={`<Slider
  min={0}
  max={100}
  step={25}
  defaultValue={50}
  marks={[
    { value: 0, label: '0℃' },
    { value: 25, label: '冷' },
    { value: 50, label: '温' },
    { value: 75, label: '热' },
    { value: 100, label: '100℃' },
  ]}
/>`}
      >
        <Slider
          min={0}
          max={100}
          step={25}
          defaultValue={50}
          marks={[
            { value: 0, label: '0℃' },
            { value: 25, label: '冷' },
            { value: 50, label: '温' },
            { value: 75, label: '热' },
            { value: 100, label: '100℃' },
          ]}
        />
      </DemoBlock>

      <DemoBlock
        title="Tooltip 显示策略"
        description="always 始终显示 / hover 悬停显示 (默认) / never 不显示。"
        code={`<Slider defaultValue={30} showTooltip="always" />
<Slider defaultValue={30} showTooltip="hover" />
<Slider defaultValue={30} showTooltip="never" />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Slider defaultValue={30} showTooltip="always" />
          <Slider defaultValue={50} showTooltip="hover" />
          <Slider defaultValue={80} showTooltip="never" />
        </div>
      </DemoBlock>

      <DemoBlock
        title="垂直方向"
        description="vertical 为垂直滑块,需父容器给定高度。"
        code={`<Slider vertical defaultValue={40} style={{ height: 200 }} />
<Slider vertical range defaultValue={[20, 80]} style={{ height: 200 }} />`}
      >
        <div style={{ display: 'flex', gap: 60, padding: '0 20px' }}>
          <Slider vertical defaultValue={40} />
          <Slider vertical range defaultValue={[20, 80]} />
        </div>
      </DemoBlock>

      <DemoBlock
        title="反向"
        description="reverse 让进度条从右往左 (水平) 或从上往下 (垂直)。"
        code={`<Slider reverse defaultValue={30} />`}
      >
        <Slider reverse defaultValue={30} />
      </DemoBlock>

      <DemoBlock
        title="自定义主题色"
        description="通过 CSS 变量 --au-slider-fill / --au-slider-handle 覆盖。"
        code={`<Slider
  defaultValue={60}
  style={{
    ['--au-slider-fill' as any]: '#10b981',
    ['--au-slider-handle' as any]: '#10b981',
  }}
/>`}
      >
        <Slider
          defaultValue={60}
          style={{
            ['--au-slider-fill' as string]: '#10b981',
            ['--au-slider-handle' as string]: '#10b981',
          } as React.CSSProperties}
        />
      </DemoBlock>

      <DemoBlock
        title="禁用"
        description="disabled 不响应输入。"
        code={`<Slider disabled defaultValue={40} />`}
      >
        <Slider disabled defaultValue={40} />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'value', desc: '受控值', type: 'number | [number, number]', default: '-' },
          { prop: 'defaultValue', desc: '默认值', type: 'number | [number, number]', default: 'min' },
          { prop: 'onChange', desc: '值变化 (拖拽中持续)', type: '(value) => void', default: '-' },
          { prop: 'onChangeComplete', desc: '松手 / 键盘操作完成时', type: '(value) => void', default: '-' },
          { prop: 'range', desc: '启用区间选择', type: 'boolean', default: 'false' },
          { prop: 'min', desc: '最小值', type: 'number', default: '0' },
          { prop: 'max', desc: '最大值', type: 'number', default: '100' },
          { prop: 'step', desc: '步长 (null 表示无吸附)', type: 'number | null', default: '1' },
          { prop: 'marks', desc: '刻度点配置', type: '{ value, label? }[]', default: '-' },
          { prop: 'showTooltip', desc: 'Tooltip 显示策略', type: `'always' | 'hover' | 'never'`, default: `'hover'` },
          { prop: 'tooltipFormatter', desc: 'Tooltip 内容格式化', type: '(v: number) => ReactNode', default: '-' },
          { prop: 'tooltipPlacement', desc: 'Tooltip 位置', type: `'top' | 'bottom' | 'left' | 'right'`, default: `水平 'top' / 垂直 'right'` },
          { prop: 'vertical', desc: '垂直方向', type: 'boolean', default: 'false' },
          { prop: 'reverse', desc: '反向', type: 'boolean', default: 'false' },
          { prop: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
        ]}
      />
    </>
  );
};

const ControlledDemo: React.FC = () => {
  const [v, setV] = useState<number>(40);
  const [commit, setCommit] = useState<number>(40);
  return (
    <div>
      <Slider
        value={v}
        onChange={(nv) => setV(nv as number)}
        onChangeComplete={(nv) => setCommit(nv as number)}
      />
      <div style={{ marginTop: 10, fontSize: 13, color: 'var(--au-text-2)' }}>
        当前 (实时): <b>{v}</b> &nbsp;·&nbsp; 松手值: <b>{commit}</b>
      </div>
    </div>
  );
};

export default SliderDoc;
