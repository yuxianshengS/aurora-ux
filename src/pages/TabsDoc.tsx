import React, { useState } from 'react';
import { Tabs } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const baseItems = [
  { key: '1', label: '标签一', children: <p style={{ margin: 0 }}>这里是第一个标签的内容。</p> },
  { key: '2', label: '标签二', children: <p style={{ margin: 0 }}>第二个标签的内容,可以放任意 ReactNode。</p> },
  { key: '3', label: '标签三', children: <p style={{ margin: 0 }}>第三个标签。</p> },
];

const TabsDoc: React.FC = () => {
  return (
    <>
      <h1>Tabs 标签页</h1>
      <p>
        切换视图内容。支持经典线条、卡片、分段 (Segment) 三种外观,
        顶 / 底 / 左 / 右 四方向排布,尺寸与居中可选。切换带滑动 ink 动画。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="传入 items 即可。非受控由组件自行管理选中态。"
        code={`<Tabs
  items={[
    { key: '1', label: '标签一', children: <p>内容一</p> },
    { key: '2', label: '标签二', children: <p>内容二</p> },
    { key: '3', label: '标签三', children: <p>内容三</p> },
  ]}
/>`}
      >
        <Tabs items={baseItems} />
      </DemoBlock>

      <DemoBlock
        title="受控"
        description="activeKey + onChange。"
        code={`const [k, setK] = useState('2');

<Tabs activeKey={k} onChange={setK} items={...} />`}
      >
        <ControlledDemo />
      </DemoBlock>

      <DemoBlock
        title="类型 · 卡片"
        description="type='card' 卡片风格,常用于多文档切换。"
        code={`<Tabs type="card" items={...} />`}
      >
        <Tabs type="card" items={baseItems} />
      </DemoBlock>

      <DemoBlock
        title="类型 · Segment"
        description="type='segment' iOS 风格分段控件。"
        code={`<Tabs type="segment" items={...} />`}
      >
        <Tabs type="segment" items={baseItems} />
      </DemoBlock>

      <DemoBlock
        title="方向 · 左侧"
        description="tabPosition='left' 用作侧边导航。"
        code={`<Tabs tabPosition="left" items={...} />`}
      >
        <Tabs tabPosition="left" items={baseItems} />
      </DemoBlock>

      <DemoBlock
        title="带图标 / 禁用"
        description="item.icon 放图标; item.disabled 禁用单项。"
        code={`<Tabs items={[
  { key: 'dash', label: '仪表盘', icon: '📊', children: ... },
  { key: 'list', label: '列表', icon: '📋', children: ... },
  { key: 'lock', label: '已归档', icon: '🔒', disabled: true, children: ... },
]} />`}
      >
        <Tabs
          items={[
            { key: 'dash', label: '仪表盘', icon: <span>📊</span>, children: <p style={{ margin: 0 }}>仪表盘内容</p> },
            { key: 'list', label: '列表', icon: <span>📋</span>, children: <p style={{ margin: 0 }}>列表内容</p> },
            { key: 'lock', label: '已归档', icon: <span>🔒</span>, disabled: true, children: <p style={{ margin: 0 }}>该内容已归档</p> },
          ]}
        />
      </DemoBlock>

      <DemoBlock
        title="居中 + 右侧附加内容"
        description="centered 居中, tabBarExtraContent 放操作按钮。"
        code={`<Tabs
  centered
  tabBarExtraContent={<button className="au-btn au-btn--primary au-btn--small">新增</button>}
  items={...}
/>`}
      >
        <Tabs
          centered
          tabBarExtraContent={<button className="au-btn au-btn--primary au-btn--small">新增</button>}
          items={baseItems}
        />
      </DemoBlock>

      <DemoBlock
        title="尺寸"
        description="small / medium / large。"
        code={`<Tabs size="small"  items={...} />
<Tabs size="medium" items={...} />
<Tabs size="large"  items={...} />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Tabs size="small" items={baseItems} />
          <Tabs size="medium" items={baseItems} />
          <Tabs size="large" items={baseItems} />
        </div>
      </DemoBlock>

      <h2>API</h2>
      <h3>Tabs</h3>
      <ApiTable
        rows={[
          { prop: 'items', desc: '标签配置', type: 'TabItem[]', default: '-' },
          { prop: 'activeKey / defaultActiveKey', desc: '当前激活 key', type: 'string', default: '-' },
          { prop: 'onChange', desc: '切换回调', type: '(key) => void', default: '-' },
          { prop: 'type', desc: '外观类型', type: `'line' | 'card' | 'segment'`, default: `'line'` },
          { prop: 'tabPosition', desc: '标签位置', type: `'top' | 'bottom' | 'left' | 'right'`, default: `'top'` },
          { prop: 'size', desc: '尺寸', type: `'small' | 'medium' | 'large'`, default: `'medium'` },
          { prop: 'centered', desc: '居中排列', type: 'boolean', default: 'false' },
          { prop: 'tabBarExtraContent', desc: '标签栏右侧附加', type: 'ReactNode', default: '-' },
          { prop: 'destroyInactiveTabPane', desc: '未激活时卸载 (默认仅隐藏)', type: 'boolean', default: 'false' },
          { prop: 'animated', desc: '内容切换动画', type: 'boolean', default: 'true' },
        ]}
      />
      <h3>TabItem</h3>
      <ApiTable
        rows={[
          { prop: 'key', desc: '唯一标识', type: 'string', default: '-' },
          { prop: 'label', desc: '标签显示内容', type: 'ReactNode', default: '-' },
          { prop: 'children', desc: '标签对应的内容面板', type: 'ReactNode', default: '-' },
          { prop: 'icon', desc: '图标', type: 'ReactNode', default: '-' },
          { prop: 'disabled', desc: '禁用该项', type: 'boolean', default: 'false' },
        ]}
      />
    </>
  );
};

const ControlledDemo: React.FC = () => {
  const [k, setK] = useState('2');
  return (
    <div>
      <Tabs activeKey={k} onChange={setK} items={baseItems} />
      <div style={{ marginTop: 12, fontSize: 13, color: 'var(--au-text-2)' }}>
        当前激活: <b>{k}</b>{' '}
        <button className="au-btn au-btn--ghost au-btn--small" onClick={() => setK('3')}>
          外部切到「标签三」
        </button>
      </div>
    </div>
  );
};

export default TabsDoc;
