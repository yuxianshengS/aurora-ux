import React from 'react';
import { Anchor } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const ANCHOR_ITEMS = [
  { href: 'overview', title: '概览' },
  {
    href: 'install',
    title: '安装',
    children: [
      { href: 'install-pnpm', title: 'pnpm' },
      { href: 'install-npm', title: 'npm' },
      { href: 'install-yarn', title: 'yarn' },
    ],
  },
  { href: 'usage', title: '基础用法' },
  { href: 'theming', title: '主题定制' },
  { href: 'troubleshooting', title: '常见问题' },
];

const AnchorDoc: React.FC = () => {
  return (
    <>
      <h1>Anchor 锚点</h1>
      <p>
        长文档 / 长配置页 / 设置面板的章节导航。点击对应链接平滑滚到 section,滚动时
        自动高亮当前可视章节。支持二级嵌套、sticky 跟随、scroll-margin 偏移。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="给每个 section 加 id, items 里 href 对上 id 即可."
        code={`const items = [
  { href: 'overview', title: '概览' },
  {
    href: 'install',
    title: '安装',
    children: [
      { href: 'install-pnpm', title: 'pnpm' },
      { href: 'install-npm', title: 'npm' },
    ],
  },
  { href: 'usage', title: '基础用法' },
];

<Anchor items={items} />

{/* 页面里对应的 section */}
<section id="overview">...</section>
<section id="install">...</section>`}
      >
        <Anchor items={ANCHOR_ITEMS} />
      </DemoBlock>

      <DemoBlock
        title="sticky 吸顶"
        description="放在侧栏配合 sticky, 滚动时常驻视口."
        code={`<aside style={{ position: 'sticky', top: 80 }}>
  <Anchor items={items} sticky stickyTop={80} />
</aside>`}
      >
        <Anchor items={ANCHOR_ITEMS} sticky stickyTop={80} />
      </DemoBlock>

      <DemoBlock
        title="自定义滚动偏移"
        description="页面有固定头时, scrollPadding 让目标 section 不会被头遮挡."
        code={`<Anchor
  items={items}
  scrollPadding={64}
  offsetTop={80}
  behavior="smooth"
/>`}
      >
        <Anchor
          items={ANCHOR_ITEMS}
          scrollPadding={64}
          offsetTop={80}
          behavior="smooth"
        />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'items', desc: '锚点列表 (支持 children 一级嵌套)', type: 'AnchorLink[]', default: '-' },
          { prop: 'offsetTop', desc: '距视口顶部多少 px 视为"已激活"', type: 'number', default: '64' },
          { prop: 'behavior', desc: '滚动行为', type: `'auto' | 'smooth'`, default: `'smooth'` },
          { prop: 'sticky', desc: '是否吸顶 (内部加 position: sticky)', type: 'boolean', default: 'false' },
          { prop: 'stickyTop', desc: 'sticky 时距视口顶距离', type: 'number', default: '0' },
          { prop: 'scrollPadding', desc: '滚到 section 前的额外 padding (避免被固定头遮)', type: 'number', default: '0' },
          { prop: 'active', desc: '受控当前激活 href', type: 'string', default: '-' },
          { prop: 'onChange', desc: '激活的 href 变化', type: '(href) => void', default: '-' },
        ]}
      />

      <h2>AnchorLink 类型</h2>
      <ApiTable
        rows={[
          { prop: 'href', desc: '跳转的 #id (不带 #)', type: 'string', default: '-' },
          { prop: 'title', desc: '显示的标题', type: 'ReactNode', default: '-' },
          { prop: 'children', desc: '子链接 (二级)', type: 'AnchorLink[]', default: '-' },
        ]}
      />
    </>
  );
};

export default AnchorDoc;
