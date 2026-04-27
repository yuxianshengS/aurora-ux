import React from 'react';
import { Flex, Tag, Button } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const Box: React.FC<{ children?: React.ReactNode; w?: number }> = ({ children, w = 80 }) => (
  <div
    style={{
      width: w,
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--au-primary-soft)',
      color: 'var(--au-primary)',
      borderRadius: 6,
      fontSize: 12,
      fontWeight: 500,
    }}
  >
    {children}
  </div>
);

const FlexDoc: React.FC = () => {
  return (
    <>
      <h1>Flex 弹性容器</h1>
      <p>
        基于 CSS Flexbox 的自由布局容器,等价于手写 <code>{'<div style={{ display: flex, ... }}>'}</code>。
        覆盖 <code>direction / gap / justify / align / wrap</code> 全部主流姿势,适合
        "logo 左 + 用户头像右"、"按钮居中"、"垂直堆叠卡片" 这类典型场景。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="默认横向排列, gap 控制子元素间距。"
        code={`<Flex gap={12}>
  <Tag>A</Tag>
  <Tag>B</Tag>
  <Tag>C</Tag>
</Flex>`}
      >
        <Flex gap={12}>
          <Box>A</Box>
          <Box>B</Box>
          <Box>C</Box>
        </Flex>
      </DemoBlock>

      <DemoBlock
        title="主轴对齐 (justify)"
        description="决定子元素在主轴方向上的分布。两端 / 居中 / 等距等。"
        code={`<Flex justify="between" gap={12}>...</Flex>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(['start', 'center', 'end', 'between', 'around', 'evenly'] as const).map((j) => (
            <div key={j}>
              <div style={{ fontSize: 11, color: 'var(--au-text-3)', marginBottom: 4 }}>
                justify="{j}"
              </div>
              <Flex justify={j} gap={8} style={{ background: 'var(--au-bg-mute)', padding: 8, borderRadius: 6 }}>
                <Box>1</Box>
                <Box>2</Box>
                <Box>3</Box>
              </Flex>
            </div>
          ))}
        </div>
      </DemoBlock>

      <DemoBlock
        title="交叉轴对齐 (align)"
        description="子元素在交叉轴方向的对齐方式, 横向布局时控制垂直对齐。"
        code={`<Flex align="center" gap={12} style={{ height: 80 }}>...</Flex>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(['start', 'center', 'end', 'stretch'] as const).map((a) => (
            <div key={a}>
              <div style={{ fontSize: 11, color: 'var(--au-text-3)', marginBottom: 4 }}>
                align="{a}"
              </div>
              <Flex
                align={a}
                gap={8}
                style={{ height: 80, background: 'var(--au-bg-mute)', padding: 8, borderRadius: 6 }}
              >
                <Box>短</Box>
                <div
                  style={{
                    width: 80,
                    background: 'var(--au-primary-soft)',
                    color: 'var(--au-primary)',
                    borderRadius: 6,
                    padding: '4px 8px',
                  }}
                >
                  内容多<br />两行
                </div>
                <Box>短</Box>
              </Flex>
            </div>
          ))}
        </div>
      </DemoBlock>

      <DemoBlock
        title="纵向 + 居中"
        description="direction='column' 让子元素竖直堆叠, 配合 align/justify 居中。"
        code={`<Flex direction="column" align="center" gap={12} style={{ height: 200 }}>
  <Tag>顶</Tag>
  <Tag>中</Tag>
  <Tag>底</Tag>
</Flex>`}
      >
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap={12}
          style={{ height: 200, background: 'var(--au-bg-mute)', borderRadius: 6 }}
        >
          <Tag color="primary">顶</Tag>
          <Tag color="success">中</Tag>
          <Tag color="warning">底</Tag>
        </Flex>
      </DemoBlock>

      <DemoBlock
        title="换行 wrap"
        description="子元素超过容器宽度时自动换行, gap 同时作用于行间距。"
        code={`<Flex gap={8} wrap>
  {Array.from({ length: 12 }).map((_, i) => <Tag key={i}>tag-{i}</Tag>)}
</Flex>`}
      >
        <Flex gap={8} wrap>
          {Array.from({ length: 12 }).map((_, i) => (
            <Tag key={i} color="primary">
              tag-{i}
            </Tag>
          ))}
        </Flex>
      </DemoBlock>

      <DemoBlock
        title="作为 toolbar"
        description="一行典型场景: 左标题 + 右按钮组, 用 justify='between' 一句话搞定。"
        code={`<Flex justify="between" align="center">
  <h3>用户列表</h3>
  <Flex gap={8}>
    <Button>导出</Button>
    <Button type="primary">新建</Button>
  </Flex>
</Flex>`}
      >
        <Flex
          justify="between"
          align="center"
          padding={12}
          background="var(--au-bg-mute)"
          radius={8}
        >
          <strong>用户列表</strong>
          <Flex gap={8}>
            <Button size="small">导出</Button>
            <Button type="primary" size="small">
              新建
            </Button>
          </Flex>
        </Flex>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'direction', desc: '主轴方向', type: `'row' | 'column' | 'row-reverse' | 'column-reverse'`, default: `'row'` },
          { prop: 'gap', desc: '子元素间距 (px 或 CSS 长度)', type: 'number | string', default: '-' },
          { prop: 'justify', desc: '主轴对齐', type: `'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' | 'stretch'`, default: '-' },
          { prop: 'align', desc: '交叉轴对齐', type: `'start' | 'center' | 'end' | 'stretch' | 'baseline'`, default: '-' },
          { prop: 'wrap', desc: '允许换行', type: 'boolean', default: 'false' },
          { prop: 'padding', desc: '内边距 (数字 = px, 数组 = [上下, 左右] / [上, 右, 下, 左])', type: 'number | string | number[]', default: '-' },
          { prop: 'background', desc: '背景色 (快速加卡片感)', type: 'string', default: '-' },
          { prop: 'radius', desc: '圆角', type: 'number | string', default: '-' },
          { prop: 'inline', desc: '改用 inline-flex (行内)', type: 'boolean', default: 'false' },
        ]}
      />
    </>
  );
};

export default FlexDoc;
