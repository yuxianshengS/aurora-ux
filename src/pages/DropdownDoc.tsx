import React from 'react';
import { Dropdown, message } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const DropdownDoc: React.FC = () => {
  const commonItems = [
    { key: 'edit', label: '编辑', icon: <span>✏️</span> },
    { key: 'copy', label: '复制链接', icon: <span>🔗</span> },
    { key: 'share', label: '分享', icon: <span>📤</span> },
    { type: 'divider' as const },
    { key: 'delete', label: '删除', icon: <span>🗑</span>, danger: true },
  ];

  return (
    <>
      <h1>Dropdown 下拉菜单</h1>
      <p>
        点击 / 悬停后展开的小型操作菜单。常用于表格行操作、头像菜单、更多按钮等。
        portal 渲染,自动避开视口边缘。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="默认 hover 触发。"
        code={`<Dropdown
  menu={{
    items: [
      { key: 'edit', label: '编辑' },
      { key: 'delete', label: '删除', danger: true },
    ],
    onClick: ({ key }) => console.log(key),
  }}
>
  <button className="au-btn au-btn--default au-btn--medium">更多 ▾</button>
</Dropdown>`}
      >
        <Dropdown
          menu={{
            items: commonItems,
            onClick: ({ key }) => message.info(`点击了: ${key}`),
          }}
        >
          <button className="au-btn au-btn--default au-btn--medium">更多 ▾</button>
        </Dropdown>
      </DemoBlock>

      <DemoBlock
        title="点击触发"
        description="trigger='click' 适合需要明确触发的场景。"
        code={`<Dropdown trigger="click" menu={{ items: [...] }}>
  <button>点击展开</button>
</Dropdown>`}
      >
        <Dropdown trigger="click" menu={{ items: commonItems }}>
          <button className="au-btn au-btn--primary au-btn--medium">点击展开</button>
        </Dropdown>
      </DemoBlock>

      <DemoBlock
        title="位置"
        description="placement 支持 6 个方位。"
        code={`<Dropdown placement="bottomRight" menu={{ items: [...] }}>...</Dropdown>`}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['bottomLeft', 'bottom', 'bottomRight', 'topLeft', 'top', 'topRight'] as const).map((p) => (
            <Dropdown key={p} placement={p} menu={{ items: commonItems }}>
              <button className="au-btn au-btn--default au-btn--small">{p}</button>
            </Dropdown>
          ))}
        </div>
      </DemoBlock>

      <DemoBlock
        title="带箭头"
        description="arrow 显示三角指示。"
        code={`<Dropdown arrow menu={{ items: [...] }}>
  <button>带箭头 ▾</button>
</Dropdown>`}
      >
        <Dropdown arrow menu={{ items: commonItems }}>
          <button className="au-btn au-btn--default au-btn--medium">带箭头 ▾</button>
        </Dropdown>
      </DemoBlock>

      <DemoBlock
        title="禁用项"
        description="单项 disabled 不响应点击。"
        code={`[
  { key: 'a', label: '启用' },
  { key: 'b', label: '禁用项', disabled: true },
]`}
      >
        <Dropdown
          menu={{
            items: [
              { key: 'a', label: '可点击项' },
              { key: 'b', label: '禁用项', disabled: true },
              { key: 'c', label: '另一项' },
            ],
            onClick: ({ key }) => message.success(`选中: ${key}`),
          }}
        >
          <button className="au-btn au-btn--default au-btn--medium">菜单 ▾</button>
        </Dropdown>
      </DemoBlock>

      <DemoBlock
        title="头像菜单 (常见场景)"
        description="配合头像 / 图标做个人中心菜单。"
        code={`<Dropdown
  placement="bottomRight"
  menu={{
    items: [
      { key: 'profile', label: '个人资料', icon: '👤' },
      { key: 'settings', label: '设置', icon: '⚙️' },
      { type: 'divider' },
      { key: 'logout', label: '退出登录', icon: '🚪', danger: true },
    ],
  }}
>
  <div className="avatar-trigger">YX</div>
</Dropdown>`}
      >
        <Dropdown
          placement="bottomRight"
          menu={{
            items: [
              { key: 'profile', label: '个人资料', icon: <span>👤</span> },
              { key: 'settings', label: '设置', icon: <span>⚙️</span> },
              { type: 'divider' },
              { key: 'logout', label: '退出登录', icon: <span>🚪</span>, danger: true },
            ],
            onClick: ({ key }) => message.info(`选择: ${key}`),
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--au-primary)',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            YX
          </div>
        </Dropdown>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'menu', desc: '菜单配置 { items, onClick? }', type: '{ items, onClick }', default: '-' },
          { prop: 'trigger', desc: '触发方式', type: `'click' | 'hover' | Array<…>`, default: `'hover'` },
          { prop: 'placement', desc: '弹出位置', type: `'bottomLeft'|'bottom'|'bottomRight'|'topLeft'|'top'|'topRight'`, default: `'bottomLeft'` },
          { prop: 'open / defaultOpen', desc: '受控 / 默认显隐', type: 'boolean', default: 'false' },
          { prop: 'onOpenChange', desc: '显隐变化', type: '(open) => void', default: '-' },
          { prop: 'arrow', desc: '显示箭头', type: 'boolean', default: 'false' },
          { prop: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
        ]}
      />
    </>
  );
};

export default DropdownDoc;
