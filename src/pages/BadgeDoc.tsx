import React, { useState } from 'react';
import { Badge, Avatar } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const BadgeDoc: React.FC = () => {
  return (
    <>
      <h1>Badge 徽标</h1>
      <p>
        附着在其他元素右上角的数字或小红点,也可以独立使用作为状态点。适合未读消息、更新提醒、在线状态等场景。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法 · 附着在元素上"
        description="包裹任意元素,count 显示数字。"
        code={`<Badge count={5}>
  <Avatar shape="square" size={40} />
</Badge>`}
      >
        <div style={{ display: 'flex', gap: 20 }}>
          <Badge count={5}>
            <Avatar shape="square" size={40} />
          </Badge>
          <Badge count={28}>
            <Avatar shape="square" size={40} />
          </Badge>
          <Badge count={0} showZero>
            <Avatar shape="square" size={40} />
          </Badge>
        </div>
      </DemoBlock>

      <DemoBlock
        title="溢出数字"
        description="overflowCount 控制封顶 (默认 99)。"
        code={`<Badge count={100}><Avatar shape="square" size={40} /></Badge>
<Badge count={1000} overflowCount={999}><Avatar shape="square" size={40} /></Badge>`}
      >
        <div style={{ display: 'flex', gap: 20 }}>
          <Badge count={100}>
            <Avatar shape="square" size={40} />
          </Badge>
          <Badge count={1000} overflowCount={999}>
            <Avatar shape="square" size={40} />
          </Badge>
        </div>
      </DemoBlock>

      <DemoBlock
        title="动态增减"
        description="数字变化时有动画。"
        code={`const [n, setN] = useState(5);

<Badge count={n}><Avatar shape="square" size={40} /></Badge>`}
      >
        <DynamicDemo />
      </DemoBlock>

      <DemoBlock
        title="小红点"
        description="dot 只显示小红点,不展示数字。"
        code={`<Badge dot>
  <span>消息</span>
</Badge>`}
      >
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Badge dot>
            <span style={{ fontSize: 20 }}>🔔</span>
          </Badge>
          <Badge dot>
            <a href="#" onClick={(e) => e.preventDefault()}>你的消息</a>
          </Badge>
        </div>
      </DemoBlock>

      <DemoBlock
        title="独立使用"
        description="不包子元素时,badge 作为独立的数字标或状态点。"
        code={`<Badge count={25} />
<Badge count="new" />
<Badge dot />`}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Badge count={25} />
          <Badge count="new" />
          <Badge count={0} showZero />
          <Badge dot />
        </div>
      </DemoBlock>

      <DemoBlock
        title="状态点 + 文字"
        description="status 模式作为状态指示器,带呼吸动画的 processing。"
        code={`<Badge status="success" text="运行中" />
<Badge status="processing" text="部署中" />
<Badge status="error" text="服务异常" />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Badge status="success" text="运行中" />
          <Badge status="processing" text="部署中" />
          <Badge status="warning" text="等待中" />
          <Badge status="error" text="服务异常" />
          <Badge status="default" text="已停止" />
        </div>
      </DemoBlock>

      <DemoBlock
        title="自定义颜色 · 偏移"
        description="color 换颜色,offset 微调位置。"
        code={`<Badge count={8} color="#8b5cf6" offset={[-4, 4]}>
  <Avatar shape="square" size={40} />
</Badge>`}
      >
        <div style={{ display: 'flex', gap: 24 }}>
          <Badge count={8} color="#8b5cf6">
            <Avatar shape="square" size={40} />
          </Badge>
          <Badge count={3} color="#14b8a6" offset={[-4, 4]}>
            <Avatar shape="square" size={40} />
          </Badge>
        </div>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'count', desc: '展示数字 / 内容', type: 'number | ReactNode', default: '-' },
          { prop: 'overflowCount', desc: '封顶数字 (显示 N+)', type: 'number', default: '99' },
          { prop: 'showZero', desc: 'count 为 0 时也显示', type: 'boolean', default: 'false' },
          { prop: 'dot', desc: '显示小红点而非数字', type: 'boolean', default: 'false' },
          {
            prop: 'status',
            desc: '状态点模式 (独立使用, 可搭 text)',
            type: `'default'|'processing'|'success'|'warning'|'error'`,
            default: '-',
          },
          { prop: 'text', desc: '状态文字 (status 模式下)', type: 'ReactNode', default: '-' },
          { prop: 'color', desc: '自定义颜色', type: 'string', default: '-' },
          { prop: 'offset', desc: '相对默认位置的偏移 [x, y]', type: '[number, number]', default: '-' },
          { prop: 'size', desc: '尺寸', type: `'default' | 'small'`, default: `'default'` },
        ]}
      />
    </>
  );
};

const DynamicDemo: React.FC = () => {
  const [n, setN] = useState(5);
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Badge count={n}>
        <Avatar shape="square" size={40} />
      </Badge>
      <button className="au-btn au-btn--default au-btn--small" onClick={() => setN((x) => Math.max(0, x - 1))}>−</button>
      <button className="au-btn au-btn--default au-btn--small" onClick={() => setN((x) => x + 1)}>+</button>
      <button className="au-btn au-btn--default au-btn--small" onClick={() => setN(0)}>清零</button>
    </div>
  );
};

export default BadgeDoc;
