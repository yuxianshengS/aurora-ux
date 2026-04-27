import React from 'react';
import { GradientText, type GradientPreset } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const GradientTextDoc: React.FC = () => {
  return (
    <>
      <h1>GradientText 渐变文字</h1>
      <p>
        让标题流动起来。<code>background-clip: text</code> + 渐变背景 + 位置动画,
        Hero 区直接换掉普通的 h1, 整页质感立刻不一样。无依赖, 自动尊重
        <code>prefers-reduced-motion</code>。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="默认预设"
        description="aurora 配色 + 默认 6s 一周流动。"
        code={`<GradientText size={48} weight={700}>欢迎来到 Aurora UI</GradientText>`}
      >
        <GradientText size={48} weight={700}>
          欢迎来到 Aurora UI
        </GradientText>
      </DemoBlock>

      <DemoBlock
        title="所有预设"
        description="aurora / sunset / ocean / forest / cosmic / metal 任选。"
        code={`<GradientText preset="sunset">夕阳西下</GradientText>
<GradientText preset="cosmic">星辰大海</GradientText>`}
      >
        <PresetGallery />
      </DemoBlock>

      <DemoBlock
        title="标题语义 + 自定义渐变"
        description="as 改成 h1/h2/h3 等; colors 自定义颜色。"
        code={`<GradientText
  as="h1"
  colors={['#22d3ee', '#a855f7', '#22d3ee']}
  size={56}
  weight="bold"
  duration={4}
>
  Build with Aurora
</GradientText>`}
      >
        <GradientText
          as="h1"
          colors={['#22d3ee', '#a855f7', '#22d3ee']}
          size={56}
          weight="bold"
          duration={4}
          style={{ margin: 0 }}
        >
          Build with Aurora
        </GradientText>
      </DemoBlock>

      <DemoBlock
        title="关闭动画"
        description="animate=false 时只是静态渐变文字, 适合大段文本。"
        code={`<GradientText animate={false} size={32}>静态渐变也很好看</GradientText>`}
      >
        <GradientText animate={false} size={32} weight={600}>
          静态渐变也很好看
        </GradientText>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'preset', desc: '预设配色', type: `'aurora' | 'sunset' | 'ocean' | 'forest' | 'cosmic' | 'metal'`, default: `'aurora'` },
          { prop: 'colors', desc: '自定义颜色 (优先级高于 preset), 第一个和最后一个相同更顺滑', type: 'string[]', default: '-' },
          { prop: 'animate', desc: '是否流动动画', type: 'boolean', default: 'true' },
          { prop: 'duration', desc: '动画一周时长 (s)', type: 'number', default: '6' },
          { prop: 'angle', desc: '渐变方向 (deg)', type: 'number', default: '90' },
          { prop: 'size', desc: '字号 (px)', type: 'number', default: '继承' },
          { prop: 'weight', desc: '字重', type: `number | 'normal' | 'medium' | 'semibold' | 'bold'`, default: '继承' },
          { prop: 'as', desc: '渲染元素', type: `keyof JSX.IntrinsicElements`, default: `'span'` },
        ]}
      />
    </>
  );
};

const PresetGallery: React.FC = () => {
  const presets: { key: GradientPreset; label: string }[] = [
    { key: 'aurora', label: '极光 Aurora' },
    { key: 'sunset', label: '日落 Sunset' },
    { key: 'ocean', label: '深海 Ocean' },
    { key: 'forest', label: '森林 Forest' },
    { key: 'cosmic', label: '星宇 Cosmic' },
    { key: 'metal', label: '金属 Metal' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {presets.map((p) => (
        <GradientText key={p.key} preset={p.key} size={32} weight={700}>
          {p.label} — 极光在文字里流动
        </GradientText>
      ))}
    </div>
  );
};

export default GradientTextDoc;
