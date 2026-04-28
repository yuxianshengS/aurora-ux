import React from 'react';
import { Avatar } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const AvatarDoc: React.FC = () => {
  return (
    <>
      <h1>Avatar 头像</h1>
      <p>用户头像,支持图片、图标、文字占位,圆形 / 方形,多种尺寸,并内置 Avatar.Group 折叠展示。</p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="三种尺寸 × 两种形状; size 也可传具体像素数。"
        code={`<Avatar size="small"  src="https://i.pravatar.cc/80?u=1" />
<Avatar size="medium" src="https://i.pravatar.cc/80?u=2" />
<Avatar size="large"  src="https://i.pravatar.cc/80?u=3" />
<Avatar size={56}     src="https://i.pravatar.cc/80?u=4" />
<Avatar shape="square" size="large" src="https://i.pravatar.cc/80?u=5" />`}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Avatar size="small" src="https://i.pravatar.cc/80?u=1" />
          <Avatar size="medium" src="https://i.pravatar.cc/80?u=2" />
          <Avatar size="large" src="https://i.pravatar.cc/80?u=3" />
          <Avatar size={56} src="https://i.pravatar.cc/80?u=4" />
          <Avatar shape="square" size="large" src="https://i.pravatar.cc/80?u=5" />
        </div>
      </DemoBlock>

      <DemoBlock
        title="文字与图标占位"
        description="未提供 src 时自动回退到文字 / 图标。长文字会自动缩放。background/color 可自定义颜色。"
        code={`<Avatar>U</Avatar>
<Avatar>USR</Avatar>
<Avatar>USER</Avatar>
<Avatar background="var(--au-primary)" color="#fff">Y</Avatar>
<Avatar background="var(--au-success)" color="#fff">Me</Avatar>
<Avatar icon={<span>😀</span>} />`}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Avatar>U</Avatar>
          <Avatar>USR</Avatar>
          <Avatar>USER</Avatar>
          <Avatar background="var(--au-primary)" color="#fff">Y</Avatar>
          <Avatar background="var(--au-success)" color="#fff">
            Me
          </Avatar>
          <Avatar icon={<span>😀</span>} />
        </div>
      </DemoBlock>

      <DemoBlock
        title="自动回退"
        description="图片加载失败时自动显示 children 文字 / 图标。"
        code={`<Avatar src="https://example.com/non-existent.png">FB</Avatar>
<Avatar src="https://example.com/non-existent.png" icon={<span>🙂</span>} />`}
      >
        <div style={{ display: 'flex', gap: 12 }}>
          <Avatar src="https://example.com/non-existent.png">FB</Avatar>
          <Avatar src="https://example.com/non-existent.png" icon={<span>🙂</span>} />
        </div>
      </DemoBlock>

      <DemoBlock
        title="头像组"
        description="Avatar.Group 自动堆叠; maxCount 折叠多余,以 +N 展示。"
        code={`{/* 默认 */}
<Avatar.Group>
  <Avatar src="https://i.pravatar.cc/80?u=11" />
  <Avatar src="https://i.pravatar.cc/80?u=12" />
  <Avatar background="var(--au-success)" color="#fff">K</Avatar>
  <Avatar background="var(--au-warning)" color="#fff">L</Avatar>
</Avatar.Group>

{/* 大号 + maxCount 折叠 */}
<Avatar.Group maxCount={3} size="large">
  <Avatar src="https://i.pravatar.cc/80?u=21" />
  <Avatar src="https://i.pravatar.cc/80?u=22" />
  <Avatar src="https://i.pravatar.cc/80?u=23" />
  <Avatar>D</Avatar>
  <Avatar>E</Avatar>
  <Avatar>F</Avatar>
</Avatar.Group>

{/* 方形 + 小号 */}
<Avatar.Group shape="square" size="small">
  <Avatar shape="square" background="var(--au-primary)" color="#fff">A</Avatar>
  <Avatar shape="square" background="var(--au-success)" color="#fff">B</Avatar>
  <Avatar shape="square" background="var(--au-warning)" color="#fff">C</Avatar>
</Avatar.Group>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Avatar.Group>
            <Avatar src="https://i.pravatar.cc/80?u=11" />
            <Avatar src="https://i.pravatar.cc/80?u=12" />
            <Avatar background="var(--au-success)" color="#fff">K</Avatar>
            <Avatar background="var(--au-warning)" color="#fff">L</Avatar>
          </Avatar.Group>
          <Avatar.Group maxCount={3} size="large">
            <Avatar src="https://i.pravatar.cc/80?u=21" />
            <Avatar src="https://i.pravatar.cc/80?u=22" />
            <Avatar src="https://i.pravatar.cc/80?u=23" />
            <Avatar>D</Avatar>
            <Avatar>E</Avatar>
            <Avatar>F</Avatar>
          </Avatar.Group>
          <Avatar.Group shape="square" size="small">
            <Avatar shape="square" background="var(--au-primary)" color="#fff">A</Avatar>
            <Avatar shape="square" background="var(--au-success)" color="#fff">B</Avatar>
            <Avatar shape="square" background="var(--au-warning)" color="#fff">C</Avatar>
          </Avatar.Group>
        </div>
      </DemoBlock>

      <h2>API</h2>
      <h3>Avatar</h3>
      <ApiTable
        rows={[
          { prop: 'src', desc: '图片 URL', type: 'string', default: '-' },
          { prop: 'srcSet', desc: 'srcset 响应式图', type: 'string', default: '-' },
          { prop: 'alt', desc: 'alt 文本', type: 'string', default: '-' },
          { prop: 'icon', desc: '图标 (src 缺失时回退)', type: 'ReactNode', default: '-' },
          { prop: 'children', desc: '文字占位 (最末回退)', type: 'ReactNode', default: '-' },
          { prop: 'shape', desc: '形状', type: `'circle' | 'square'`, default: `'circle'` },
          { prop: 'size', desc: '尺寸 (关键字或像素数)', type: `'small' | 'medium' | 'large' | number`, default: `'medium'` },
          { prop: 'background', desc: '背景色', type: 'string', default: '-' },
          { prop: 'color', desc: '文字色', type: 'string', default: '-' },
          { prop: 'gap', desc: '文字两侧留白 (影响缩放)', type: 'number', default: '4' },
          { prop: 'onError', desc: '加载失败回调; 返回 false 阻止回退', type: '() => boolean | void', default: '-' },
        ]}
      />
      <h3>Avatar.Group</h3>
      <ApiTable
        rows={[
          { prop: 'maxCount', desc: '最多展示数量,超出折叠为 +N', type: 'number', default: '-' },
          { prop: 'maxStyle', desc: '溢出 +N 头像的样式', type: 'CSSProperties', default: '-' },
          { prop: 'size', desc: '统一尺寸 (子 Avatar 未显式指定时继承)', type: '同 Avatar', default: '-' },
          { prop: 'shape', desc: '统一形状', type: `'circle' | 'square'`, default: `'circle'` },
          { prop: 'overflow', desc: '自定义溢出节点 (替换 +N)', type: 'ReactNode', default: '-' },
        ]}
      />
    </>
  );
};

export default AvatarDoc;
