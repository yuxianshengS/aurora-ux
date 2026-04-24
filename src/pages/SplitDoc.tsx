import React, { useState } from 'react';
import { Split } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';
import Playground from '../site-components/Playground';

const frame: React.CSSProperties = {
  border: '1px solid var(--au-border)',
  borderRadius: 8,
  overflow: 'hidden',
  background: 'var(--au-bg-1)',
};

const pane: React.CSSProperties = {
  height: '100%',
  padding: 16,
  fontSize: 14,
  color: 'var(--au-text-2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const Pane: React.FC<{ bg?: string; children?: React.ReactNode }> = ({
  bg,
  children,
}) => (
  <div style={{ ...pane, background: bg ?? 'var(--au-bg-2)' }}>{children}</div>
);

const SplitDoc: React.FC = () => {
  return (
    <>
      <h1>Split 分割面板</h1>
      <p>
        两栏或多栏的可拖动分割面板,可水平或垂直布局。通过拖拽中间分隔条调整两侧尺寸,
        支持 min / max 边界、受控模式、嵌套组合。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法(水平)"
        description="默认水平分割,初始 50%。拖动中间分隔条调整左右比例。"
        code={`<div style={{ height: 200 }}>
  <Split>
    <Pane>Left</Pane>
    <Pane>Right</Pane>
  </Split>
</div>`}
      >
        <div style={{ ...frame, height: 200 }}>
          <Split>
            <Pane>Left</Pane>
            <Pane bg="var(--au-bg-1)">Right</Pane>
          </Split>
        </div>
      </DemoBlock>

      <DemoBlock
        title="垂直分割"
        description="direction='vertical' 让容器上下分割,resizer 变为横向。"
        code={`<div style={{ height: 300 }}>
  <Split direction="vertical" defaultSize={120}>
    <Pane>Top</Pane>
    <Pane>Bottom</Pane>
  </Split>
</div>`}
      >
        <div style={{ ...frame, height: 300 }}>
          <Split direction="vertical" defaultSize={120}>
            <Pane>Top (固定初始 120px)</Pane>
            <Pane bg="var(--au-bg-1)">Bottom</Pane>
          </Split>
        </div>
      </DemoBlock>

      <DemoBlock
        title="初始尺寸 & 最小/最大"
        description="defaultSize 支持数字(px)或百分比字符串;min / max 限制第一块尺寸,防止面板被拖到看不见。"
        code={`<Split defaultSize={260} min={160} max={440}>
  <Pane>Sidebar (160-440px)</Pane>
  <Pane>Content</Pane>
</Split>`}
      >
        <div style={{ ...frame, height: 220 }}>
          <Split defaultSize={260} min={160} max={440}>
            <Pane>Sidebar (160-440px)</Pane>
            <Pane bg="var(--au-bg-1)">Content</Pane>
          </Split>
        </div>
      </DemoBlock>

      <DemoBlock
        title="受控模式"
        description="传 size + onChange 即可把尺寸提升到父组件,做按钮切换或联动。"
        code={`const [s, setS] = useState(240);

<Split size={s} onChange={setS}>
  <Pane>Sidebar {s}px</Pane>
  <Pane>Content</Pane>
</Split>`}
      >
        <ControlledDemo />
      </DemoBlock>

      <DemoBlock
        title="嵌套组合"
        description="Split 可以互相嵌套,搭出经典的三栏/工作台布局。"
        code={`<Split defaultSize="25%">
  <Pane>Sidebar</Pane>
  <Split direction="vertical" defaultSize={100}>
    <Pane>Header</Pane>
    <Pane>Main</Pane>
  </Split>
</Split>`}
      >
        <div style={{ ...frame, height: 320 }}>
          <Split defaultSize="25%" min={120}>
            <Pane>Sidebar</Pane>
            <Split direction="vertical" defaultSize={80} min={40}>
              <Pane bg="var(--au-bg-1)">Header</Pane>
              <Pane>Main</Pane>
            </Split>
          </Split>
        </div>
      </DemoBlock>

      <DemoBlock
        title="禁用拖动"
        description="disabled 时分隔条锁定,不响应鼠标/触摸。"
        code={`<Split defaultSize={200} disabled>
  <Pane>Left (locked)</Pane>
  <Pane>Right</Pane>
</Split>`}
      >
        <div style={{ ...frame, height: 180 }}>
          <Split defaultSize={200} disabled>
            <Pane>Left (locked)</Pane>
            <Pane bg="var(--au-bg-1)">Right</Pane>
          </Split>
        </div>
      </DemoBlock>

      <h2>交互式调试</h2>
      <Playground
        title="实时调整 Split 属性"
        description="切换方向、调整初始尺寸与 min/max,下方会实时生效。"
        componentName="Split"
        component={PlaygroundWrapper}
        selfClosing={false}
        controls={[
          {
            name: 'direction',
            type: 'select',
            options: ['horizontal', 'vertical'],
            default: 'horizontal',
          },
          { name: 'defaultSize', type: 'text', default: '50%', label: 'defaultSize (px/%)' },
          { name: 'min', type: 'text', default: '80', label: 'min (px)' },
          { name: 'max', type: 'text', default: '', label: 'max (px,留空=无上限)' },
          { name: 'resizerSize', type: 'text', default: '6', label: 'resizerSize (px)' },
          { name: 'disabled', type: 'boolean', default: false },
        ]}
      />

      <h2>API</h2>
      <ApiTable
        rows={[
          {
            prop: 'direction',
            desc: '分割方向',
            type: `'horizontal' | 'vertical'`,
            default: `'horizontal'`,
          },
          {
            prop: 'defaultSize',
            desc: '初始第一块尺寸; 数字(px) 或百分比字符串',
            type: 'number | string',
            default: `'50%'`,
          },
          {
            prop: 'size',
            desc: '受控模式下的第一块尺寸 (px)',
            type: 'number',
            default: '-',
          },
          {
            prop: 'min',
            desc: '第一块最小尺寸 (px)',
            type: 'number',
            default: '40',
          },
          {
            prop: 'max',
            desc: '第一块最大尺寸 (px)',
            type: 'number',
            default: '容器 - 分隔条',
          },
          {
            prop: 'resizerSize',
            desc: '分隔条宽度 (px)',
            type: 'number',
            default: '6',
          },
          {
            prop: 'disabled',
            desc: '禁止拖动',
            type: 'boolean',
            default: 'false',
          },
          {
            prop: 'onChange',
            desc: '拖拽过程中持续触发, 参数为第一块新尺寸 (px)',
            type: '(size: number) => void',
            default: '-',
          },
          {
            prop: 'onResizeEnd',
            desc: '拖拽结束触发一次',
            type: '(size: number) => void',
            default: '-',
          },
        ]}
      />

      <h3>使用注意</h3>
      <ul>
        <li>容器必须有明确的宽高(尤其是垂直分割时容器需要有 height),否则 flex 无法计算。</li>
        <li>子元素数量以前两个为准: 第一个作为可调尺寸的主面板, 第二个自动填充剩余空间。</li>
      </ul>
    </>
  );
};

/* ------------------------- demos ------------------------- */

const ControlledDemo: React.FC = () => {
  const [s, setS] = useState(240);
  return (
    <div>
      <div style={{ ...frame, height: 220 }}>
        <Split size={s} onChange={setS} min={120} max={480}>
          <Pane>Sidebar {Math.round(s)}px</Pane>
          <Pane bg="var(--au-bg-1)">Content</Pane>
        </Split>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="au-btn" onClick={() => setS(160)}>160</button>
        <button className="au-btn" onClick={() => setS(240)}>240</button>
        <button className="au-btn" onClick={() => setS(360)}>360</button>
      </div>
    </div>
  );
};

/* ------------------------- playground adapter ------------------------- */

interface WrapperProps {
  direction?: 'horizontal' | 'vertical';
  defaultSize?: string;
  min?: string;
  max?: string;
  resizerSize?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

const PlaygroundWrapper: React.FC<WrapperProps> = ({
  direction = 'horizontal',
  defaultSize = '50%',
  min,
  max,
  resizerSize,
  disabled,
}) => {
  const parseNum = (s: string | undefined) => {
    if (!s) return undefined;
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  };
  const parseSize = (s: string | undefined) => {
    if (!s) return undefined;
    if (/^\d+(\.\d+)?%$/.test(s)) return s;
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  };
  return (
    <div style={{ ...frame, height: 260 }}>
      <Split
        direction={direction}
        defaultSize={parseSize(defaultSize) ?? '50%'}
        min={parseNum(min)}
        max={parseNum(max)}
        resizerSize={parseNum(resizerSize)}
        disabled={disabled}
      >
        <Pane>面板 A</Pane>
        <Pane bg="var(--au-bg-1)">面板 B</Pane>
      </Split>
    </div>
  );
};

export default SplitDoc;
