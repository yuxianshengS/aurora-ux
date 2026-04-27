import React from 'react';
import { GlowCard, GradientText, NumberRoll, Button } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const GlowCardDoc: React.FC = () => {
  return (
    <>
      <h1>GlowCard 发光卡片</h1>
      <p>
        鼠标悬停时, 光晕跟随鼠标位置在卡片内部柔和扩散, 同时旋转的彩色描边亮起。
        Hero 区 / 价格表 / KPI 卡组合用一下, 立刻有"贵感"。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="把鼠标移到卡片上, 光晕会跟随."
        code={`<GlowCard>
  <h3>悬停我看光晕</h3>
  <p>鼠标位置就是光晕中心, 离开后柔和消失.</p>
</GlowCard>`}
      >
        <GlowCard style={{ maxWidth: 320 }}>
          <h3 style={{ margin: 0 }}>悬停我看光晕</h3>
          <p style={{ marginTop: 8, color: 'var(--au-text-2)' }}>
            鼠标位置就是光晕中心, 离开后柔和消失。
          </p>
        </GlowCard>
      </DemoBlock>

      <DemoBlock
        title="自定义光晕色"
        description="glowColor 改成不同颜色, 三张卡片各发不同光."
        code={`<GlowCard glowColor="#a855f7">紫</GlowCard>
<GlowCard glowColor="#22d3ee">青</GlowCard>
<GlowCard glowColor="#10b981">绿</GlowCard>`}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <GlowCard glowColor="#a855f7">
            <h4 style={{ margin: 0 }}>紫色光</h4>
            <p style={{ marginTop: 8, color: 'var(--au-text-2)', fontSize: 13 }}>creative</p>
          </GlowCard>
          <GlowCard glowColor="#22d3ee">
            <h4 style={{ margin: 0 }}>青色光</h4>
            <p style={{ marginTop: 8, color: 'var(--au-text-2)', fontSize: 13 }}>refreshing</p>
          </GlowCard>
          <GlowCard glowColor="#10b981">
            <h4 style={{ margin: 0 }}>绿色光</h4>
            <p style={{ marginTop: 8, color: 'var(--au-text-2)', fontSize: 13 }}>growth</p>
          </GlowCard>
          <GlowCard glowColor="#fb923c">
            <h4 style={{ margin: 0 }}>橙色光</h4>
            <p style={{ marginTop: 8, color: 'var(--au-text-2)', fontSize: 13 }}>energetic</p>
          </GlowCard>
        </div>
      </DemoBlock>

      <DemoBlock
        title="价格卡组合"
        description="GlowCard + GradientText + NumberRoll, 招牌组合."
        code={`<GlowCard glowColor="#7c3aed" intensity={0.8}>
  <GradientText preset="cosmic" weight={700} size={20}>Pro 版</GradientText>
  <div><NumberRoll prefix="¥" value={199} size={40} /> /月</div>
  <Button type="primary" block>立即升级</Button>
</GlowCard>`}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <GlowCard glowColor="var(--au-primary)" padding={28}>
            <div style={{ color: 'var(--au-text-3)', fontSize: 13 }}>Free</div>
            <NumberRoll prefix="¥" value={0} size={40} weight={700} />
            <p style={{ color: 'var(--au-text-2)', marginTop: 8, fontSize: 13 }}>个人开发者免费.</p>
            <Button block style={{ marginTop: 12 }}>开始使用</Button>
          </GlowCard>
          <GlowCard glowColor="#7c3aed" intensity={0.8} padding={28}>
            <GradientText preset="cosmic" weight={700} size={16}>Pro 版</GradientText>
            <NumberRoll prefix="¥" value={199} size={40} weight={700} suffix={<span style={{ fontSize: 14, color: 'var(--au-text-3)' }}>/月</span>} />
            <p style={{ color: 'var(--au-text-2)', marginTop: 8, fontSize: 13 }}>无限项目, 优先支持.</p>
            <Button type="primary" block style={{ marginTop: 12 }}>立即升级</Button>
          </GlowCard>
          <GlowCard glowColor="#fb923c" padding={28}>
            <div style={{ color: 'var(--au-text-3)', fontSize: 13 }}>Enterprise</div>
            <NumberRoll prefix="¥" value={1999} size={40} weight={700} suffix={<span style={{ fontSize: 14, color: 'var(--au-text-3)' }}>/月</span>} />
            <p style={{ color: 'var(--au-text-2)', marginTop: 8, fontSize: 13 }}>SLA + 专属客户经理.</p>
            <Button block style={{ marginTop: 12 }}>联系销售</Button>
          </GlowCard>
        </div>
      </DemoBlock>

      <DemoBlock
        title="去掉旋转描边"
        description="border=false, 只保留鼠标光晕."
        code={`<GlowCard border={false}>...</GlowCard>`}
      >
        <GlowCard border={false} style={{ maxWidth: 320 }}>
          <h4 style={{ margin: 0 }}>朴素一点</h4>
          <p style={{ marginTop: 8, color: 'var(--au-text-2)' }}>关掉描边, 只剩光晕跟随。</p>
        </GlowCard>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'glowColor', desc: '光晕主色 (CSS 颜色或 var)', type: 'string', default: 'var(--au-primary)' },
          { prop: 'glowSize', desc: '光晕直径 (px)', type: 'number', default: '240' },
          { prop: 'intensity', desc: '光晕强度 0-1', type: 'number', default: '0.6' },
          { prop: 'border', desc: '旋转流光描边', type: 'boolean', default: 'true' },
          { prop: 'radius', desc: '圆角 (px)', type: 'number', default: '16' },
          { prop: 'padding', desc: '内边距', type: 'number | string', default: '24' },
          { prop: 'onClick', desc: '点击事件', type: '(e) => void', default: '-' },
        ]}
      />
    </>
  );
};

export default GlowCardDoc;
