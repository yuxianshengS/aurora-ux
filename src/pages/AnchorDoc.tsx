import React from 'react';
import { Anchor } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const ANCHOR_ITEMS = [
  { href: 'au-anchor-overview', title: '概览' },
  {
    href: 'au-anchor-install',
    title: '安装',
    children: [
      { href: 'au-anchor-install-pnpm', title: 'pnpm' },
      { href: 'au-anchor-install-npm', title: 'npm' },
    ],
  },
  { href: 'au-anchor-usage', title: '基础用法' },
  { href: 'au-anchor-troubleshooting', title: '常见问题' },
];

/** 演示用的章节 — 直接渲染到文档流里, 让 window scrollTo 能真正滚到 */
const DemoSections: React.FC = () => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
    {ANCHOR_ITEMS.flatMap((it) => [it, ...(it.children ?? [])]).map((sec) => (
      <section
        key={sec.href}
        id={sec.href}
        style={{
          minHeight: 280,
          padding: 24,
          background: 'var(--au-bg-soft)',
          border: '1px solid var(--au-border)',
          borderRadius: 8,
          /* scroll-margin-top 给 sticky navbar / 头部留空间 */
          scrollMarginTop: 120,
        }}
      >
        <h3 style={{ margin: 0 }}>{sec.title}</h3>
        <p style={{ color: 'var(--au-text-3)', fontSize: 13, marginTop: 6 }}>
          这是 <code>#{sec.href}</code> section, 点左边 Anchor 链接会平滑滚到这里。
        </p>
        <p style={{ color: 'var(--au-text-3)', fontSize: 13 }}>
          (页面会真的往下滚 — 因为 Anchor 滚的是整个 window, 不是局部容器。)
        </p>
      </section>
    ))}
  </div>
);

const AnchorDoc: React.FC = () => {
  return (
    <>
      <h1>Anchor 锚点</h1>
      <p>
        长文档 / 长配置页 / 设置面板的章节导航。点击对应链接平滑滚到 section,滚动时
        自动高亮当前可视章节。支持二级嵌套、sticky 跟随、scroll-margin 偏移。
      </p>

      <p style={{ color: 'var(--au-text-3)', fontSize: 13 }}>
        ⚠️ 当前实现固定滚动 <code>window</code>, 所以 section 必须在文档流里(不能放在
        <code>overflow:auto</code> 的局部容器)才会被滚到。下面 demo 把 section 直接铺在
        页面里,点击锚点你会看到整页往下滚。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法 + sticky 跟随"
        description="给每个 section 加 id, items 里 href 对上 id 即可. sticky 让 Anchor 滚动时常驻视口."
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

<div style={{ display: 'flex', gap: 24 }}>
  <aside style={{ width: 200 }}>
    <Anchor items={items} sticky stickyTop={80} />
  </aside>
  <main style={{ flex: 1 }}>
    <section id="overview" style={{ scrollMarginTop: 80 }}>...</section>
    <section id="install">
      <h3 id="install-pnpm">pnpm</h3>
      <h3 id="install-npm">npm</h3>
    </section>
    <section id="usage">...</section>
  </main>
</div>`}
      >
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ width: 180, flexShrink: 0 }}>
            <Anchor items={ANCHOR_ITEMS} sticky stickyTop={120} offsetTop={120} />
          </div>
          <DemoSections />
        </div>
      </DemoBlock>

      <DemoBlock
        title="自定义滚动偏移"
        description="页面有固定头时, scrollPadding 让目标 section 不会被头遮挡 — 滚到位时 section 顶部距视口顶留出指定 px。或者用 CSS 的 scroll-margin-top, 二选一。"
        code={`<Anchor
  items={items}
  scrollPadding={64}    // JS 路径: 滚到目标前留 64px
  offsetTop={80}        // 视口距顶 80px 内的 section 算"已激活"
  behavior="smooth"
/>

{/* 或者纯 CSS 路径, 给每个 section 加: */}
<section id="overview" style={{ scrollMarginTop: 80 }}>...</section>`}
      >
        <p style={{ color: 'var(--au-text-3)', fontSize: 13 }}>
          (与上面同一个 demo, 配置不同 — 上面那个 demo 已经设了 <code>scrollMarginTop: 120</code>,
          所以滚动到位时 section 顶部不会贴着 navbar。)
        </p>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'items', desc: '锚点列表 (支持 children 一级嵌套)', type: 'AnchorLink[]', default: '-' },
          { prop: 'offsetTop', desc: '距视口顶部多少 px 内的 section 视为"已激活"', type: 'number', default: '80' },
          { prop: 'behavior', desc: '滚动行为', type: `'auto' | 'smooth'`, default: `'smooth'` },
          { prop: 'sticky', desc: '是否吸顶 (内部加 position: sticky)', type: 'boolean', default: 'false' },
          { prop: 'stickyTop', desc: 'sticky 时距视口顶距离 (px)', type: 'number', default: '80' },
          { prop: 'scrollPadding', desc: '滚到 section 前的额外 padding (避免被固定头遮)', type: 'number', default: '16' },
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
