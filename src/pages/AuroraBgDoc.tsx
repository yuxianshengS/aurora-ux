import React, { useState } from 'react';
import { AuroraBg, Button, Space, type AuroraPreset } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const AuroraBgDoc: React.FC = () => {
  return (
    <>
      <h1>AuroraBg 极光背景</h1>
      <p>
        AuroraUI 的标志性视觉:多层模糊色带柔和漂移,加上一层细微噪点,营造出极光的氛围。
        把它套在卡片、Hero 区甚至整页背景上,瞬间提升质感。纯 CSS 实现,无任何依赖,自动尊重
        <code>prefers-reduced-motion</code>。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="默认极光"
        description="aurora 预设 (蓝紫青绿粉), 默认参数已经足够好用。"
        code={`<AuroraBg style={{ height: 280, borderRadius: 16 }} />`}
      >
        <AuroraBg style={{ height: 280, borderRadius: 16 }} />
      </DemoBlock>

      <DemoBlock
        title="作为内容容器"
        description="children 会渲染在极光层之上。Hero 区招牌写法。"
        code={`<AuroraBg style={{ height: 320, borderRadius: 16 }}>
  <div style={{ padding: 48, color: 'white' }}>
    <h2 style={{ fontSize: 36 }}>欢迎来到 Aurora 看板</h2>
    <p>极光感的中后台 UI 库 + 可视化搭建器</p>
    <Button type="primary">立即开始</Button>
  </div>
</AuroraBg>`}
      >
        <AuroraBg
          style={{ height: 320, borderRadius: 16, display: 'flex', alignItems: 'center' }}
        >
          <div style={{ padding: 48, color: 'white' }}>
            <h2 style={{ fontSize: 36, margin: 0, fontWeight: 700 }}>欢迎来到 Aurora 看板</h2>
            <p style={{ marginTop: 12, opacity: 0.9 }}>极光感的中后台 UI 库 + 可视化搭建器</p>
            <div style={{ marginTop: 20 }}>
              <Space>
                <Button type="primary">立即开始</Button>
                <Button>查看文档</Button>
              </Space>
            </div>
          </div>
        </AuroraBg>
      </DemoBlock>

      <DemoBlock
        title="预设主题"
        description="内置 5 套配色: aurora / sunset / ocean / forest / cosmic, 一行搞定不同氛围。"
        code={`<AuroraBg preset="sunset" />
<AuroraBg preset="ocean" />
<AuroraBg preset="cosmic" />`}
      >
        <PresetGallery />
      </DemoBlock>

      <DemoBlock
        title="参数微调"
        description="拖滑块感受 blur / speed / intensity 的影响。"
        code={`<AuroraBg blur={120} speed={0.5} intensity={0.9} />`}
      >
        <PlaygroundDemo />
      </DemoBlock>

      <DemoBlock
        title="自定义配色"
        description="传 colors 数组覆盖预设, 4-6 个颜色最佳。"
        code={`<AuroraBg colors={['#0f172a', '#312e81', '#7c3aed', '#22d3ee']} />`}
      >
        <AuroraBg
          colors={['#0f172a', '#312e81', '#7c3aed', '#22d3ee']}
          style={{ height: 240, borderRadius: 16 }}
        />
      </DemoBlock>

      <DemoBlock
        title="卡片底纹"
        description="卡片局部用极光做底, 标题与按钮叠在上层。"
        code={`<Card style={{ overflow: 'hidden' }}>
  <AuroraBg preset="forest" intensity={0.5} style={{ position: 'absolute', inset: 0 }} />
  ...内容...
</Card>`}
      >
        <div style={{ overflow: 'hidden', position: 'relative', minHeight: 180, borderRadius: 12, border: '1px solid var(--au-border)' }}>
          <AuroraBg
            preset="forest"
            intensity={0.5}
            style={{ position: 'absolute', inset: 0 }}
          />
          <div style={{ position: 'relative', padding: 24 }}>
            <h3 style={{ margin: 0 }}>本月活跃用户</h3>
            <div style={{ fontSize: 48, fontWeight: 700, marginTop: 12 }}>1,284,560</div>
            <div style={{ opacity: 0.8 }}>较上月 +12.4%</div>
          </div>
        </div>
      </DemoBlock>

      <DemoBlock
        title="整页背景 (fixed)"
        description="fixed 模式会贴到视口背景层 (z-index: -1), 适合给整个 SPA 加个淡淡的极光底。"
        code={`// 在你的 App 根节点最外层放一次:
<AuroraBg fixed intensity={0.3} blur={140} />`}
      >
        <p style={{ color: 'var(--au-text-3)' }}>
          (fixed 模式无法在文档框内演示, 复制代码到你的项目根节点查看效果)
        </p>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'preset', desc: '预设配色', type: `'aurora' | 'sunset' | 'ocean' | 'forest' | 'cosmic'`, default: `'aurora'` },
          { prop: 'colors', desc: '自定义颜色 (优先级高于 preset)', type: 'string[]', default: '-' },
          { prop: 'blur', desc: '色带模糊度 (px)', type: 'number', default: '100' },
          { prop: 'speed', desc: '动画速度倍率 (越大越慢)', type: 'number', default: '1' },
          { prop: 'intensity', desc: '整体不透明度 0-1', type: 'number', default: '0.7' },
          { prop: 'grain', desc: '颗粒纹理叠加', type: 'boolean', default: 'true' },
          { prop: 'fixed', desc: '固定为视口背景 (整页用)', type: 'boolean', default: 'false' },
          { prop: 'children', desc: '渲染在极光层之上的内容', type: 'ReactNode', default: '-' },
        ]}
      />
    </>
  );
};

const PresetGallery: React.FC = () => {
  const presets: AuroraPreset[] = ['aurora', 'sunset', 'ocean', 'forest', 'cosmic'];
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 12,
      }}
    >
      {presets.map((p) => (
        <div key={p} style={{ position: 'relative' }}>
          <AuroraBg preset={p} style={{ height: 140, borderRadius: 12 }} />
          <div
            style={{
              position: 'absolute',
              left: 12,
              bottom: 8,
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
              textShadow: '0 1px 4px rgba(0,0,0,0.4)',
            }}
          >
            {p}
          </div>
        </div>
      ))}
    </div>
  );
};

const PlaygroundDemo: React.FC = () => {
  const [blur, setBlur] = useState(100);
  const [speed, setSpeed] = useState(1);
  const [intensity, setIntensity] = useState(0.7);
  return (
    <div>
      <AuroraBg
        blur={blur}
        speed={speed}
        intensity={intensity}
        style={{ height: 220, borderRadius: 12 }}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginTop: 12,
          fontSize: 13,
          color: 'var(--au-text-2)',
        }}
      >
        <label>
          blur: {blur}px
          <input
            type="range"
            min={20}
            max={200}
            value={blur}
            onChange={(e) => setBlur(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </label>
        <label>
          speed: {speed.toFixed(1)}x
          <input
            type="range"
            min={0.3}
            max={3}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </label>
        <label>
          intensity: {intensity.toFixed(2)}
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </label>
      </div>
    </div>
  );
};

export default AuroraBgDoc;
