import React, { useState } from 'react';
import { Draggable } from '../components';
import type { Position } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const DraggableDoc: React.FC = () => {
  return (
    <>
      <h1>Draggable 拖拽工具</h1>
      <p>
        让任意子元素可拖拽定位。内部通过 <code>transform: translate</code> 实现,
        不引起布局重排, 支持鼠标与触摸两种输入。提供轴向锁定、边界约束、网格吸附、
        受控 / 非受控 两种模式。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="包裹任意元素即可被拖动。默认整个元素都是拖拽区。"
        code={`<Draggable>
  <div style={{ padding: 20, background: '#fff', border: '1px solid #ddd' }}>
    拖我
  </div>
</Draggable>`}
      >
        <BasicDemo />
      </DemoBlock>

      <DemoBlock
        title="带拖拽把手"
        description="handle 指定选择器; 只有匹配元素内的按下才开始拖拽, 其他区域保持可点击。"
        code={`<Draggable handle=".panel-head">
  <div className="panel">
    <div className="panel-head">⋮ 拖这里</div>
    <div className="panel-body">这里不拖, 按钮可点击</div>
  </div>
</Draggable>`}
      >
        <HandleDemo />
      </DemoBlock>

      <DemoBlock
        title="轴向锁定"
        description="axis='x' 只允许水平拖动; 'y' 只允许垂直; 默认 'both'。"
        code={`<Draggable axis="x">...</Draggable>
<Draggable axis="y">...</Draggable>`}
      >
        <AxisDemo />
      </DemoBlock>

      <DemoBlock
        title="限制范围 · 父容器"
        description="bounds='parent' 限制在父容器内 (父需 position 非 static)。"
        code={`<div style={{ position: 'relative', width: 400, height: 200 }}>
  <Draggable bounds="parent">...</Draggable>
</div>`}
      >
        <ParentBoundsDemo />
      </DemoBlock>

      <DemoBlock
        title="限制范围 · 自定义"
        description="传入 { left, top, right, bottom } 显式限定 translate 范围。"
        code={`<Draggable bounds={{ left: -100, right: 100, top: -50, bottom: 50 }}>
  ...
</Draggable>`}
      >
        <CustomBoundsDemo />
      </DemoBlock>

      <DemoBlock
        title="网格吸附"
        description="grid=[20, 20] 按 20px 步长吸附, 适合画布 / 布局器。"
        code={`<Draggable grid={[20, 20]} bounds="parent">
  ...
</Draggable>`}
      >
        <GridDemo />
      </DemoBlock>

      <DemoBlock
        title="受控模式 + 事件"
        description="传 position 进入受控; 配合 onChange / onStart / onEnd 处理外部状态。"
        code={`const [pos, setPos] = useState({ x: 0, y: 0 });

<Draggable
  position={pos}
  onChange={setPos}
  onEnd={(p) => console.log('dropped at', p)}
/>
<button onClick={() => setPos({ x: 0, y: 0 })}>归位</button>`}
      >
        <ControlledDemo />
      </DemoBlock>

      <DemoBlock
        title="禁用"
        description="disabled 暂时关闭拖拽响应。"
        code={`<Draggable disabled>...</Draggable>`}
      >
        <DisabledDemo />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'defaultPosition', desc: '非受控初始偏移', type: '{ x: number; y: number }', default: '{ x: 0, y: 0 }' },
          { prop: 'position', desc: '受控位置; 传入后由父组件管理', type: '{ x: number; y: number }', default: '-' },
          { prop: 'onChange', desc: '位置变化 (拖拽中持续触发)', type: '(pos) => void', default: '-' },
          { prop: 'onStart', desc: '拖拽开始', type: '(pos) => void', default: '-' },
          { prop: 'onEnd', desc: '拖拽结束', type: '(pos) => void', default: '-' },
          { prop: 'axis', desc: '轴向锁定', type: `'x' | 'y' | 'both'`, default: `'both'` },
          {
            prop: 'bounds',
            desc: `拖拽范围`,
            type: `'window' | 'parent' | { left?, top?, right?, bottom? }`,
            default: '-',
          },
          { prop: 'handle', desc: '拖拽把手 CSS 选择器; 不传则整个元素可拖', type: 'string', default: '-' },
          { prop: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
          { prop: 'grid', desc: '网格吸附步长 [x, y]', type: '[number, number]', default: '-' },
          { prop: 'className', desc: '附加类名', type: 'string', default: '-' },
          { prop: 'style', desc: '附加样式', type: 'CSSProperties', default: '-' },
        ]}
      />
    </>
  );
};

/* ---------------------- demos ---------------------- */

const boxStyle: React.CSSProperties = {
  padding: '14px 20px',
  background: 'var(--au-bg-1)',
  border: '1px solid var(--au-border)',
  borderRadius: 8,
  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
  color: 'var(--au-text-1)',
  fontSize: 13,
};

const containerStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: 220,
  background:
    'repeating-linear-gradient(45deg, var(--au-bg-2) 0 10px, var(--au-bg-1) 10px 20px)',
  border: '1px dashed var(--au-border)',
  borderRadius: 8,
  overflow: 'hidden',
};

const BasicDemo: React.FC = () => (
  <div style={containerStyle}>
    <Draggable>
      <div style={boxStyle}>👉 拖我到任意位置</div>
    </Draggable>
  </div>
);

const HandleDemo: React.FC = () => (
  <div style={containerStyle}>
    <Draggable handle=".au-draggable-demo-head">
      <div
        style={{
          ...boxStyle,
          padding: 0,
          minWidth: 240,
          overflow: 'hidden',
        }}
      >
        <div
          className="au-draggable-demo-head"
          style={{
            padding: '8px 14px',
            background: 'var(--au-bg-2)',
            borderBottom: '1px solid var(--au-border)',
            cursor: 'grab',
            fontWeight: 600,
          }}
        >
          ⋮⋮ 拖动这里
        </div>
        <div style={{ padding: 14 }}>
          <p style={{ margin: '0 0 8px' }}>下面按钮正常响应点击:</p>
          <button
            className="au-btn au-btn--primary"
            onClick={() => alert('clicked!')}
          >
            点我
          </button>
        </div>
      </div>
    </Draggable>
  </div>
);

const AxisDemo: React.FC = () => (
  <div style={{ display: 'flex', gap: 16 }}>
    <div style={{ ...containerStyle, height: 140, flex: 1 }}>
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          fontSize: 11,
          color: 'var(--au-text-3)',
        }}
      >
        axis = "x"
      </div>
      <div style={{ padding: 50 }}>
        <Draggable axis="x" bounds="parent">
          <div style={boxStyle}>仅水平</div>
        </Draggable>
      </div>
    </div>
    <div style={{ ...containerStyle, height: 140, flex: 1 }}>
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          fontSize: 11,
          color: 'var(--au-text-3)',
        }}
      >
        axis = "y"
      </div>
      <div style={{ padding: 20 }}>
        <Draggable axis="y" bounds="parent">
          <div style={boxStyle}>仅垂直</div>
        </Draggable>
      </div>
    </div>
  </div>
);

const ParentBoundsDemo: React.FC = () => (
  <div style={containerStyle}>
    <Draggable bounds="parent">
      <div style={boxStyle}>我被关在这里了 🎁</div>
    </Draggable>
  </div>
);

const CustomBoundsDemo: React.FC = () => (
  <div style={containerStyle}>
    <div style={{ padding: '80px 0 0 180px' }}>
      <Draggable bounds={{ left: -150, right: 150, top: -50, bottom: 50 }}>
        <div style={boxStyle}>范围 ±150 / ±50</div>
      </Draggable>
    </div>
  </div>
);

const GridDemo: React.FC = () => (
  <div
    style={{
      ...containerStyle,
      backgroundImage:
        'linear-gradient(to right, var(--au-border) 1px, transparent 1px), linear-gradient(to bottom, var(--au-border) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      background: 'var(--au-bg-1)',
    }}
  >
    <Draggable grid={[20, 20]} bounds="parent">
      <div style={boxStyle}>每 20px 吸附一次</div>
    </Draggable>
  </div>
);

const ControlledDemo: React.FC = () => {
  const [pos, setPos] = useState<Position>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  return (
    <div>
      <div style={containerStyle}>
        <Draggable
          position={pos}
          onChange={setPos}
          onStart={() => setDragging(true)}
          onEnd={() => setDragging(false)}
          bounds="parent"
        >
          <div
            style={{
              ...boxStyle,
              borderColor: dragging ? 'var(--au-primary)' : 'var(--au-border)',
            }}
          >
            {dragging ? '拖拽中…' : '我是受控的'}
          </div>
        </Draggable>
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          className="au-btn"
          onClick={() => setPos({ x: 0, y: 0 })}
        >
          归位
        </button>
        <button
          className="au-btn"
          onClick={() => setPos({ x: 100, y: 50 })}
        >
          设到 (100, 50)
        </button>
        <span style={{ fontSize: 12.5, color: 'var(--au-text-2)' }}>
          当前: ({Math.round(pos.x)}, {Math.round(pos.y)})
        </span>
      </div>
    </div>
  );
};

const DisabledDemo: React.FC = () => (
  <div style={containerStyle}>
    <Draggable disabled>
      <div style={{ ...boxStyle, opacity: 0.6 }}>disabled 不可拖</div>
    </Draggable>
  </div>
);

export default DraggableDoc;
