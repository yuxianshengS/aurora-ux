import React from 'react';
import { Breadcrumb, message } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const BreadcrumbDoc: React.FC = () => {
  return (
    <>
      <h1>Breadcrumb 面包屑</h1>
      <p>
        显示当前页面在系统中的层级路径。最后一项为当前页 (不可点击),
        其余项可作为链接或触发 onClick 回调。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="传入 items 数组,最后一项自动识别为当前页。"
        code={`<Breadcrumb
  items={[
    { title: '首页', href: '/' },
    { title: '应用中心', href: '/apps' },
    { title: '应用列表', href: '/apps/list' },
    { title: '某应用' },
  ]}
/>`}
      >
        <Breadcrumb
          items={[
            { title: '首页', href: '#' },
            { title: '应用中心', href: '#' },
            { title: '应用列表', href: '#' },
            { title: '某应用' },
          ]}
        />
      </DemoBlock>

      <DemoBlock
        title="带图标"
        description="item.icon 放在文字前。"
        code={`<Breadcrumb items={[
  { title: '首页', icon: '🏠', href: '/' },
  { title: '组件', href: '/components' },
  { title: 'Breadcrumb' },
]} />`}
      >
        <Breadcrumb
          items={[
            { title: '首页', icon: <span>🏠</span>, href: '#' },
            { title: '组件', href: '#' },
            { title: 'Breadcrumb' },
          ]}
        />
      </DemoBlock>

      <DemoBlock
        title="点击回调"
        description="传 onClick 不传 href, 用于 SPA 路由。"
        code={`<Breadcrumb items={[
  { title: '首页', onClick: () => router.push('/') },
  { title: '订单', onClick: () => router.push('/orders') },
  { title: '#2026-0419' },
]} />`}
      >
        <Breadcrumb
          items={[
            { title: '首页', onClick: () => message.info('go /') },
            { title: '订单', onClick: () => message.info('go /orders') },
            { title: '#2026-0419' },
          ]}
        />
      </DemoBlock>

      <DemoBlock
        title="自定义分隔符"
        description="separator 可以是字符、节点、或图标。"
        code={`<Breadcrumb separator=">" items={...} />
<Breadcrumb separator={<span>›</span>} items={...} />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Breadcrumb
            separator=">"
            items={[
              { title: '一级', href: '#' },
              { title: '二级', href: '#' },
              { title: '三级' },
            ]}
          />
          <Breadcrumb
            separator={<span style={{ fontSize: 14 }}>›</span>}
            items={[
              { title: 'Home', href: '#' },
              { title: 'Docs', href: '#' },
              { title: 'Components' },
              { title: 'Breadcrumb' },
            ]}
          />
          <Breadcrumb
            separator="·"
            items={[
              { title: '账户', href: '#' },
              { title: '设置', href: '#' },
              { title: '安全' },
            ]}
          />
        </div>
      </DemoBlock>

      <h2>API</h2>
      <h3>Breadcrumb</h3>
      <ApiTable
        rows={[
          { prop: 'items', desc: '路径节点', type: 'BreadcrumbItem[]', default: '-' },
          { prop: 'separator', desc: '分隔符', type: 'ReactNode', default: `'/'` },
        ]}
      />
      <h3>BreadcrumbItem</h3>
      <ApiTable
        rows={[
          { prop: 'title', desc: '节点显示内容', type: 'ReactNode', default: '-' },
          { prop: 'href', desc: '链接地址', type: 'string', default: '-' },
          { prop: 'icon', desc: '图标 (放在 title 前)', type: 'ReactNode', default: '-' },
          { prop: 'onClick', desc: '点击回调 (SPA 路由常用)', type: '(e) => void', default: '-' },
        ]}
      />
    </>
  );
};

export default BreadcrumbDoc;
