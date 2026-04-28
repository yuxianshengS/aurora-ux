import React from 'react';
import { Button } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';
import Playground from '../site-components/Playground';

const ButtonDoc: React.FC = () => (
  <>
    <h1>Button 按钮</h1>
    <p>按钮用于触发一个操作，是最常用的交互元素之一。</p>

    <h2>何时使用</h2>
    <p>
      当用户需要执行一个操作时使用按钮。根据重要程度选择不同的类型：主按钮用于页面主要动作，
      默认按钮用于次要动作，文字按钮（Ghost）用于最轻量的动作。
    </p>

    <h2>代码演示</h2>

    <DemoBlock
      title="按钮类型"
      description="提供 primary / default / dashed / ghost / danger / like 六种类型。"
      code={`<Button type="primary">Primary</Button>
<Button>Default</Button>
<Button type="dashed">Dashed</Button>
<Button type="ghost">Ghost</Button>
<Button type="danger">Danger</Button>
<Button type="like" defaultCount={68}>Likes</Button>`}
    >
      <Button type="primary">Primary</Button>
      <Button>Default</Button>
      <Button type="dashed">Dashed</Button>
      <Button type="ghost">Ghost</Button>
      <Button type="danger">Danger</Button>
      <Button type="like" defaultCount={68}>Likes</Button>
    </DemoBlock>

    <DemoBlock
      title="按钮尺寸"
      description="三种尺寸：large / medium / small。"
      code={`<Button type="primary" size="large">Large</Button>
<Button type="primary">Medium</Button>
<Button type="primary" size="small">Small</Button>`}
    >
      <Button type="primary" size="large">
        Large
      </Button>
      <Button type="primary">Medium</Button>
      <Button type="primary" size="small">
        Small
      </Button>
    </DemoBlock>

    <DemoBlock
      title="禁用与加载"
      description="通过 disabled 与 loading 属性控制。"
      code={`<Button type="primary" disabled>Disabled</Button>
<Button type="primary" loading>Loading</Button>
<Button loading>Default Loading</Button>`}
    >
      <Button type="primary" disabled>
        Disabled
      </Button>
      <Button type="primary" loading>
        Loading
      </Button>
      <Button loading>Default Loading</Button>
    </DemoBlock>

    <DemoBlock
      title="块级按钮"
      description="设置 block 撑满父容器宽度。"
      code={`<Button type="primary" block>Block Button</Button>`}
    >
      <div style={{ width: '100%' }}>
        <Button type="primary" block>
          Block Button
        </Button>
      </div>
    </DemoBlock>

    <DemoBlock
      title="Like 类型"
      description="type='like' 会切换为点赞样式,支持 liked / count 受控或非受控,回调用 onLikeChange。支持 size / loading / block / shine 等通用属性。"
      code={`<Button type="like" size="small" defaultCount={12}>Likes</Button>
<Button type="like" defaultCount={68}>Likes</Button>
<Button type="like" size="large" defaultLiked defaultCount={200}>喜欢</Button>
<Button type="like" loading defaultCount={5}>Loading</Button>
<Button type="like" disabled defaultCount={42}>Likes</Button>`}
    >
      <Button type="like" size="small" defaultCount={12}>Likes</Button>
      <Button type="like" defaultCount={68}>Likes</Button>
      <Button type="like" size="large" defaultLiked defaultCount={200}>喜欢</Button>
      <Button type="like" loading defaultCount={5}>Loading</Button>
      <Button type="like" disabled defaultCount={42}>Likes</Button>
    </DemoBlock>

    <DemoBlock
      title="自定义图标"
      description="通过 icon 传入自己的 SVG,用 fill='currentColor' 即可跟随点赞前后的颜色变化。"
      code={`const Star = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.9 6.9L22 10l-5.5 4.8L18 22l-6-3.7L6 22l1.5-7.2L2 10l7.1-1.1z"/>
  </svg>
);
const Check = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 19l-7-7 1.4-1.4L10 16.2 19.6 6.6 21 8z"/>
  </svg>
);

<Button type="like" defaultCount={128} icon={Star}>Star</Button>
<Button type="like" defaultLiked defaultCount={7} icon={Check}>Done</Button>`}
    >
      <Button
        type="like"
        defaultCount={128}
        icon={
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2l2.9 6.9L22 10l-5.5 4.8L18 22l-6-3.7L6 22l1.5-7.2L2 10l7.1-1.1z" />
          </svg>
        }
      >
        Star
      </Button>
      <Button
        type="like"
        defaultLiked
        defaultCount={7}
        icon={
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M10 19l-7-7 1.4-1.4L10 16.2 19.6 6.6 21 8z" />
          </svg>
        }
      >
        Done
      </Button>
    </DemoBlock>

    <DemoBlock
      title="Like 色彩定制"
      description="通过 likeTheme 切换深/浅主题,通过 activeColor 覆盖点亮时的强调色。"
      code={`<Button type="like" defaultCount={32}>Dark</Button>
<Button type="like" likeTheme="light" defaultCount={32}>Light</Button>
<Button type="like" defaultLiked defaultCount={88} activeColor="#5b8def">Blue</Button>
<Button type="like" likeTheme="light" defaultLiked defaultCount={88} activeColor="#f5a623">Amber</Button>`}
    >
      <Button type="like" defaultCount={32}>Dark</Button>
      <Button type="like" likeTheme="light" defaultCount={32}>Light</Button>
      <Button type="like" defaultLiked defaultCount={88} activeColor="#5b8def">Blue</Button>
      <Button type="like" likeTheme="light" defaultLiked defaultCount={88} activeColor="#f5a623">Amber</Button>
    </DemoBlock>

    <DemoBlock
      title="自定义主色"
      description="通过 color 属性为任意 type 的按钮设置主色;primary/danger 改背景,default/dashed/ghost 改文字与 hover 色,like 改按钮底色。"
      code={`<Button type="primary" color="#7c3aed">Violet</Button>
<Button type="primary" color="#0ea5e9">Sky</Button>
<Button type="default" color="#16a34a">Emerald</Button>
<Button type="dashed" color="#f59e0b">Amber</Button>
<Button type="ghost" color="#ec4899">Pink</Button>
<Button type="danger" color="#dc2626">Crimson</Button>
<Button type="like" color="#1e3a8a" defaultLiked defaultCount={12}>Navy</Button>`}
    >
      <Button type="primary" color="#7c3aed">Violet</Button>
      <Button type="primary" color="#0ea5e9">Sky</Button>
      <Button type="default" color="#16a34a">Emerald</Button>
      <Button type="dashed" color="#f59e0b">Amber</Button>
      <Button type="ghost" color="#ec4899">Pink</Button>
      <Button type="danger" color="#dc2626">Crimson</Button>
      <Button type="like" color="#1e3a8a" defaultLiked defaultCount={12}>Navy</Button>
    </DemoBlock>

    <DemoBlock
      title="扫光效果"
      description="shine 属性会让按钮表面循环地划过一道光泽,适合突出主要操作。"
      code={`<Button type="primary" shine>立即购买</Button>
<Button type="danger" shine>限时抢购</Button>
<Button type="like" shine defaultCount={999}>Star</Button>`}
    >
      <Button type="primary" shine>立即购买</Button>
      <Button type="danger" shine>限时抢购</Button>
      <Button type="like" shine defaultCount={999}>Star</Button>
    </DemoBlock>

    <h2>交互式调试</h2>
    <Playground
      title="实时调整 Button 属性"
      description="在右侧调整属性,预览与代码会同步更新。"
      componentName="Button"
      component={Button}
      controls={[
        { name: 'children', type: 'text', label: '内容', default: '按钮' },
        { name: 'type', type: 'select', options: ['default', 'primary', 'dashed', 'ghost', 'danger', 'like'], default: 'default' },
        { name: 'size', type: 'select', options: ['small', 'medium', 'large'], default: 'medium' },
        { name: 'loading', type: 'boolean', default: false },
        { name: 'disabled', type: 'boolean', default: false },
        { name: 'block', type: 'boolean', default: false },
        { name: 'shine', type: 'boolean', default: false },
        { name: 'defaultLiked', label: 'defaultLiked(仅 like)', type: 'boolean', default: false },
        { name: 'likeTheme', label: 'likeTheme(仅 like)', type: 'select', options: ['dark', 'light'], default: 'dark' },
        { name: 'activeColor', label: 'activeColor(仅 like)', type: 'text', default: '' },
        { name: 'color', label: 'color(自定义主色)', type: 'text', default: '' },
      ]}
    />

    <h2>API</h2>
    <ApiTable
      rows={[
        {
          prop: 'type',
          desc: '按钮类型',
          type: `'primary' | 'default' | 'dashed' | 'ghost' | 'danger' | 'like'`,
          default: `'default'`,
        },
        {
          prop: 'size',
          desc: '按钮尺寸',
          type: `'small' | 'medium' | 'large'`,
          default: `'medium'`,
        },
        {
          prop: 'loading',
          desc: '是否为加载状态',
          type: 'boolean',
          default: 'false',
        },
        {
          prop: 'block',
          desc: '是否撑满父容器',
          type: 'boolean',
          default: 'false',
        },
        {
          prop: 'shine',
          desc: '是否开启扫光动画',
          type: 'boolean',
          default: 'false',
        },
        {
          prop: 'icon',
          desc: '图标（放置在文字前，like 类型中可替换默认爱心）',
          type: 'ReactNode',
          default: '-',
        },
        {
          prop: 'disabled',
          desc: '是否禁用',
          type: 'boolean',
          default: 'false',
        },
        {
          prop: 'color',
          desc: '自定义主色;primary/danger 改背景,default/dashed/ghost 改文字与 hover 色,like 改按钮底色',
          type: 'string',
          default: '-',
        },
        {
          prop: 'liked',
          desc: 'like 类型 - 受控状态',
          type: 'boolean',
          default: '-',
        },
        {
          prop: 'defaultLiked',
          desc: 'like 类型 - 非受控默认值',
          type: 'boolean',
          default: 'false',
        },
        {
          prop: 'count',
          desc: 'like 类型 - 受控计数',
          type: 'number',
          default: '-',
        },
        {
          prop: 'defaultCount',
          desc: 'like 类型 - 非受控默认计数',
          type: 'number',
          default: '0',
        },
        {
          prop: 'onLikeChange',
          desc: 'like 类型 - 状态变更回调',
          type: '(liked: boolean, count: number) => void',
          default: '-',
        },
        {
          prop: 'likeTheme',
          desc: 'like 类型 - 预设主题色',
          type: `'dark' | 'light'`,
          default: `'dark'`,
        },
        {
          prop: 'activeColor',
          desc: 'like 类型 - 点亮时的强调色',
          type: 'string',
          default: '-',
        },
      ]}
    />
  </>
);

export default ButtonDoc;
