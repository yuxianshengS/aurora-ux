import React, { useState } from 'react';
import { Menu } from '../components';
import type { MenuItem } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const baseItems: MenuItem[] = [
  { key: 'dashboard', label: '仪表盘', icon: <span>📊</span> },
  { key: 'orders', label: '订单', icon: <span>🧾</span> },
  {
    key: 'users',
    label: '用户',
    icon: <span>👤</span>,
    children: [
      { key: 'user-list', label: '用户列表' },
      { key: 'user-role', label: '角色管理' },
      { key: 'user-audit', label: '审计日志' },
    ],
  },
  {
    key: 'settings',
    label: '设置',
    icon: <span>⚙️</span>,
    children: [
      { key: 'setting-basic', label: '基础设置' },
      { key: 'setting-security', label: '安全' },
      { key: 'setting-notif', label: '通知' },
    ],
  },
  { type: 'divider' },
  { key: 'logout', label: '退出登录', icon: <span>🚪</span>, danger: true },
];

const MenuDoc: React.FC = () => {
  return (
    <>
      <h1>Menu 导航菜单</h1>
      <p>
        适用于侧边栏 / 顶部导航。支持三种模式 (inline / vertical / horizontal),
        自带图标、子菜单、分隔线、危险项与折叠态。受控 / 非受控皆可。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="内嵌模式 (侧边栏默认)"
        description="mode='inline' 子菜单展开在下方。"
        code={`<Menu
  mode="inline"
  defaultSelectedKeys={['dashboard']}
  defaultOpenKeys={['users']}
  items={[
    { key: 'dashboard', label: '仪表盘', icon: '📊' },
    { key: 'users', label: '用户', icon: '👤', children: [...] },
  ]}
/>`}
      >
        <InlineDemo />
      </DemoBlock>

      <DemoBlock
        title="可折叠侧栏"
        description="collapsed + mode='inline' 收成图标条,子菜单悬浮展开。"
        code={`<Menu mode="inline" collapsed={collapsed} items={...} />`}
      >
        <CollapsedDemo />
      </DemoBlock>

      <DemoBlock
        title="垂直 + 子菜单悬浮"
        description="mode='vertical' 子菜单始终悬浮打开。"
        code={`<Menu mode="vertical" items={...} />`}
      >
        <Menu mode="vertical" defaultSelectedKeys={['dashboard']} style={{ width: 220 }} items={baseItems} />
      </DemoBlock>

      <DemoBlock
        title="水平顶部导航"
        description="mode='horizontal' 用作顶部栏。"
        code={`<Menu mode="horizontal" items={...} />`}
      >
        <Menu
          mode="horizontal"
          defaultSelectedKeys={['dashboard']}
          items={[
            { key: 'dashboard', label: '首页' },
            { key: 'products', label: '产品', children: [
              { key: 'p1', label: '产品 A' },
              { key: 'p2', label: '产品 B' },
              { key: 'p3', label: '产品 C' },
            ] },
            { key: 'docs', label: '文档' },
            { key: 'about', label: '关于' },
          ]}
        />
      </DemoBlock>

      <DemoBlock
        title="分组 + 禁用"
        description="type='group' 分组; disabled 单项禁用。"
        code={`[
  { type: 'group', key: 'g1', label: '系统', children: [...] },
  { type: 'group', key: 'g2', label: '账号', children: [...] },
]`}
      >
        <Menu
          mode="inline"
          defaultSelectedKeys={['profile']}
          style={{ width: 220 }}
          items={[
            {
              type: 'group',
              key: 'g-sys',
              label: '系统',
              children: [
                { key: 'dashboard', label: '仪表盘', icon: <span>📊</span> },
                { key: 'alerts', label: '告警', icon: <span>🚨</span>, disabled: true },
              ],
            },
            {
              type: 'group',
              key: 'g-acc',
              label: '账号',
              children: [
                { key: 'profile', label: '个人资料', icon: <span>👤</span> },
                { key: 'team', label: '团队' },
              ],
            },
          ]}
        />
      </DemoBlock>

      <DemoBlock
        title="深色主题"
        description="theme='dark' 适合深色侧栏。"
        code={`<Menu theme="dark" mode="inline" items={...} />`}
      >
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          defaultOpenKeys={['users']}
          style={{ width: 220 }}
          items={baseItems}
        />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'items', desc: '菜单配置', type: 'MenuItem[]', default: '-' },
          { prop: 'mode', desc: '排布模式', type: `'vertical' | 'horizontal' | 'inline'`, default: `'vertical'` },
          { prop: 'theme', desc: '主题', type: `'light' | 'dark'`, default: `'light'` },
          { prop: 'selectedKeys / defaultSelectedKeys', desc: '选中的叶子 key', type: 'string[]', default: '[]' },
          { prop: 'openKeys / defaultOpenKeys', desc: '展开的子菜单 key (inline)', type: 'string[]', default: '[]' },
          { prop: 'collapsed', desc: '折叠成图标条 (仅 inline 有效)', type: 'boolean', default: 'false' },
          { prop: 'onSelect', desc: '选中变化', type: '({ key, selectedKeys, item }) => void', default: '-' },
          { prop: 'onClick', desc: '任意叶子点击', type: '({ key, item }) => void', default: '-' },
          { prop: 'onOpenChange', desc: '子菜单展开 / 收起', type: '(openKeys) => void', default: '-' },
        ]}
      />
      <h3>MenuItem 类型</h3>
      <ApiTable
        rows={[
          { prop: '叶子: { key, label, icon?, disabled?, danger? }', desc: '可选中项', type: 'MenuItem', default: '-' },
          { prop: '子菜单: { key, label, icon?, children: [...] }', desc: '带子项', type: 'MenuItem', default: '-' },
          { prop: '分隔线: { type: "divider" }', desc: '视觉分隔', type: 'MenuItem', default: '-' },
          { prop: '分组: { type: "group", key, label, children: [...] }', desc: '带标题的分组', type: 'MenuItem', default: '-' },
        ]}
      />
    </>
  );
};

const InlineDemo: React.FC = () => {
  const [selected, setSelected] = useState<string[]>(['dashboard']);
  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <Menu
        mode="inline"
        selectedKeys={selected}
        defaultOpenKeys={['users']}
        onSelect={({ selectedKeys }) => setSelected(selectedKeys)}
        style={{ width: 220 }}
        items={baseItems}
      />
      <div style={{ flex: 1, padding: 12, background: 'var(--au-bg-soft)', borderRadius: 8, color: 'var(--au-text-2)', fontSize: 13 }}>
        当前选中: <b>{selected.join(', ') || '(空)'}</b>
      </div>
    </div>
  );
};

const CollapsedDemo: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button
        className="au-btn au-btn--default au-btn--small"
        style={{ alignSelf: 'flex-start' }}
        onClick={() => setCollapsed((v) => !v)}
      >
        {collapsed ? '展开' : '折叠'}
      </button>
      <Menu
        mode="inline"
        collapsed={collapsed}
        defaultSelectedKeys={['dashboard']}
        items={baseItems}
      />
    </div>
  );
};

export default MenuDoc;
