import React from 'react';
import { Layout, Menu, Avatar, Button, Card } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const sampleMenuItems = [
  { key: 'dashboard', label: '仪表盘' },
  { key: 'orders', label: '订单' },
  { key: 'users', label: '用户' },
  { key: 'settings', label: '设置' },
];

const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ height: 360, border: '1px solid var(--au-border)', borderRadius: 6, overflow: 'hidden' }}>
    {children}
  </div>
);

const LayoutDoc: React.FC = () => {
  return (
    <>
      <h1>Layout 页面布局</h1>
      <p>
        中后台标准外壳 —— 一句 <code>{'<Layout>'}</code> 把侧栏、顶栏、内容、页脚四块拼好。
        支持 <code>side / top-side / top / clean</code> 4 种常见布局模式。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="side (默认): 侧栏通高"
        description="经典中后台: 左侧栏从顶到底, 右边主区里再放顶栏 / 内容 / 页脚。"
        code={`<Layout
  sider={<Menu items={items} mode="inline" defaultSelectedKeys={['dashboard']} theme="dark" />}
  header={<>顶栏内容</>}
  content={<>主内容区</>}
/>`}
      >
        <Frame>
          <Layout
            siderWidth={180}
            sider={<Menu items={sampleMenuItems} mode="inline" defaultSelectedKeys={['dashboard']} theme="dark" />}
            header={<strong>📊 仪表盘</strong>}
            content={<div style={{ height: '100%' }}><Card>主内容区</Card></div>}
          />
        </Frame>
      </DemoBlock>

      <DemoBlock
        title="top-side: 顶栏通宽 + 侧栏在下"
        description="logo / 全局导航 / 用户信息放顶栏跨满, 业务侧栏在 header 下方。"
        code={`<Layout layout="top-side"
  header={<>顶栏 logo + 用户</>}
  sider={<Menu ... />}
  content={<>...</>}
/>`}
      >
        <Frame>
          <Layout
            layout="top-side"
            siderWidth={180}
            header={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <strong>🌌 Aurora</strong>
                <Avatar size="small">YX</Avatar>
              </div>
            }
            sider={<Menu items={sampleMenuItems} mode="inline" defaultSelectedKeys={['dashboard']} theme="light" />}
            siderTheme="light"
            content={<div style={{ height: '100%' }}><Card>主内容区</Card></div>}
          />
        </Frame>
      </DemoBlock>

      <DemoBlock
        title="top: 仅顶栏 + 内容"
        description="无侧栏, 适合列表型管理后台 (路由分级浅)。"
        code={`<Layout layout="top" header={...} content={...} />`}
      >
        <Frame>
          <Layout
            layout="top"
            header={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <strong>🌌 Aurora Console</strong>
                <Button type="primary" size="small">新建</Button>
              </div>
            }
            content={<div style={{ height: '100%' }}><Card>主内容区</Card></div>}
          />
        </Frame>
      </DemoBlock>

      <DemoBlock
        title="clean: 居中容器"
        description="文档站 / 营销页常用, 内容居中 + 两侧留白, maxContentWidth 控制阅读宽度。"
        code={`<Layout layout="clean" maxContentWidth={720}
  header={...}
  content={...}
/>`}
      >
        <Frame>
          <Layout
            layout="clean"
            maxContentWidth={520}
            header={<strong>📄 关于我们</strong>}
            content={
              <div style={{ paddingTop: 24 }}>
                <h3>欢迎</h3>
                <p>这是一段居中的内容, 两边自动留白, 适合文档与营销页面。</p>
              </div>
            }
          />
        </Frame>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'layout', desc: '布局模式', type: `'side' | 'top-side' | 'top' | 'clean'`, default: `'side'` },
          { prop: 'sider', desc: '侧栏内容 (side / top-side 用)', type: 'ReactNode', default: '-' },
          { prop: 'header', desc: '顶栏内容', type: 'ReactNode', default: '-' },
          { prop: 'content', desc: '主内容', type: 'ReactNode', default: '-' },
          { prop: 'footer', desc: '页脚 (可选)', type: 'ReactNode', default: '-' },
          { prop: 'siderPlacement', desc: '侧栏位置', type: `'left' | 'right'`, default: `'left'` },
          { prop: 'siderWidth', desc: '侧栏宽度 (px / "auto" / 任意 CSS 长度)', type: 'number | string', default: '220' },
          { prop: 'siderTheme', desc: '侧栏色调', type: `'dark' | 'light'`, default: `'dark'` },
          { prop: 'headerHeight', desc: '顶栏高度', type: 'number | string', default: '56' },
          { prop: 'headerPadding', desc: '顶栏左右内边距', type: 'number | string', default: '24' },
          { prop: 'contentPadding', desc: '内容区内边距', type: 'number | string', default: '20px 24px' },
          { prop: 'maxContentWidth', desc: 'clean 模式内容最大宽', type: 'number | string', default: '960' },
          { prop: 'fill', desc: '占满父容器高度', type: 'boolean', default: 'true' },
        ]}
      />
    </>
  );
};

export default LayoutDoc;
