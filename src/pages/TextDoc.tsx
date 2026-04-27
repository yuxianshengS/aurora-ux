import React from 'react';
import { Text } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const TextDoc: React.FC = () => {
  return (
    <>
      <h1>Text 文本</h1>
      <p>
        语义化的文本块组件 —— 一个 prop 选 <code>variant</code> 就自动生成对应的标题/正文/说明,
        颜色、字重、对齐、截断、删除线等都在一个组件里搞定, 不用每次写一堆 inline style。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="变体 variant"
        description="自动选择 h1/h2/h3/h4/p/span 标签 + 默认字号字重。"
        code={`<Text variant="h1">主标题 H1</Text>
<Text variant="h2">副标题 H2</Text>
<Text variant="h3">小节 H3</Text>
<Text variant="h4">强调 H4</Text>
<Text variant="body">正文 body</Text>
<Text variant="caption">辅助说明 caption</Text>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Text variant="h1">主标题 H1</Text>
          <Text variant="h2">副标题 H2</Text>
          <Text variant="h3">小节 H3</Text>
          <Text variant="h4">强调 H4</Text>
          <Text variant="body">正文 body — 这是一段普通段落文字, 用来展示阅读字号和行高。</Text>
          <Text variant="caption">caption — 辅助说明文字, 灰色字体</Text>
        </div>
      </DemoBlock>

      <DemoBlock
        title="预设颜色"
        description="主文本 / 次文本 / 弱文本 / 主色 / 状态色, 也接受任意 CSS 颜色字符串。"
        code={`<Text color="default">主文本</Text>
<Text color="secondary">次文本</Text>
<Text color="primary">主色</Text>
<Text color="success">成功</Text>
<Text color="warning">警告</Text>
<Text color="danger">危险</Text>
<Text color="#a855f7">自定义紫</Text>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Text color="default">主文本 (default)</Text>
          <Text color="secondary">次文本 (secondary)</Text>
          <Text color="tertiary">弱文本 (tertiary)</Text>
          <Text color="primary">主色 (primary)</Text>
          <Text color="success">成功 (success)</Text>
          <Text color="warning">警告 (warning)</Text>
          <Text color="danger">危险 (danger)</Text>
          <Text color="#a855f7">自定义紫色 #a855f7</Text>
        </div>
      </DemoBlock>

      <DemoBlock
        title="字重 + 对齐 + 装饰"
        description="weight / align / italic / underline / strikethrough 自由组合。"
        code={`<Text weight="bold">加粗</Text>
<Text italic>斜体</Text>
<Text underline>下划线</Text>
<Text strikethrough>删除线</Text>
<Text align="center">居中</Text>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Text weight="bold">加粗 (bold)</Text>
          <Text weight="medium">中等 (medium)</Text>
          <Text italic>斜体 italic</Text>
          <Text underline>下划线</Text>
          <Text strikethrough>删除线</Text>
          <Text align="center" style={{ background: 'var(--au-bg-mute)', padding: 4, borderRadius: 4 }}>
            居中对齐 align="center"
          </Text>
        </div>
      </DemoBlock>

      <DemoBlock
        title="单行省略号"
        description="truncate={true} 单行截断, 适合表格 / 列表项。"
        code={`<Text truncate style={{ maxWidth: 240 }}>
  这是一段很长很长很长的文本会被截断
</Text>`}
      >
        <Text truncate style={{ maxWidth: 240 }}>
          这是一段很长很长很长很长很长很长很长很长很长很长的文本, 单行省略
        </Text>
      </DemoBlock>

      <DemoBlock
        title="多行截断"
        description="truncate 传数字 = 最多显示几行, 超出加省略号 (WebKit line-clamp)。"
        code={`<Text truncate={2} style={{ maxWidth: 320 }}>
  长文本会在第 2 行结尾截断
</Text>`}
      >
        <Text truncate={2} style={{ maxWidth: 320 }}>
          这是一段比较长的描述文字, 用来展示多行截断的效果, 当超过两行时会自动添加省略号,
          不会无限延伸把整个布局撑乱。多余内容用 ... 收起。
        </Text>
      </DemoBlock>

      <DemoBlock
        title="自定义字号 / 行高"
        description="size / lineHeight 覆盖 variant 默认。"
        code={`<Text size={20} lineHeight={1.4}>自定义 20px 行高 1.4</Text>`}
      >
        <Text size={20} lineHeight={1.4} weight="medium">
          自定义 20px 行高 1.4 — 偶尔需要 variant 之外的尺寸时直接传数字
        </Text>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'children / content', desc: '文本内容', type: 'ReactNode', default: '-' },
          { prop: 'variant', desc: '语义变体, 决定 HTML 标签和默认字号字重', type: `'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption'`, default: `'body'` },
          { prop: 'weight', desc: '字重, 覆盖 variant 默认', type: `'normal' | 'medium' | 'semibold' | 'bold'`, default: '-' },
          { prop: 'align', desc: '对齐', type: `'left' | 'center' | 'right' | 'justify'`, default: '-' },
          { prop: 'color', desc: '颜色 (预设或任意 CSS color)', type: `'default' | 'secondary' | 'tertiary' | 'primary' | 'success' | 'warning' | 'danger' | string`, default: `'default'` },
          { prop: 'size', desc: '字号 (px), 覆盖 variant 默认', type: 'number', default: '-' },
          { prop: 'lineHeight', desc: '行高', type: 'number | string', default: '-' },
          { prop: 'truncate', desc: 'true=单行省略, 数字=多行截断', type: 'boolean | number', default: 'false' },
          { prop: 'italic', desc: '斜体', type: 'boolean', default: 'false' },
          { prop: 'underline', desc: '下划线', type: 'boolean', default: 'false' },
          { prop: 'strikethrough', desc: '删除线', type: 'boolean', default: 'false' },
          { prop: 'selectable', desc: '允许文字选中', type: 'boolean', default: 'true' },
        ]}
      />
    </>
  );
};

export default TextDoc;
