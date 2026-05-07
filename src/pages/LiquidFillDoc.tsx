import React, { useEffect, useState } from 'react';
import { LiquidFill } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const LiquidFillDoc: React.FC = () => {
  // 实时跳动 — 让"水位真的在动"的演示
  const [v, setV] = useState(62);
  useEffect(() => {
    const id = setInterval(() => {
      setV((prev) => Math.max(8, Math.min(98, prev + (Math.random() - 0.5) * 8)));
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <h1>LiquidFill 水位图</h1>
      <p>
        水位流动的可视化容器。适合展示"完成度 / 容量占比 / 储量 /
        进度"等需要强烈"液体感"的单一指标。 默认双层波浪叠加 + 横向流动,
        给数据看板"真的在跳"的感觉。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="传 value (0-100) 即可。默认圆形容器, 双层波浪流动。"
        code={`<LiquidFill value={68} />
<LiquidFill value={32} label="存储" />
<LiquidFill value={92} label="健康" color="var(--au-success)" />`}
      >
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'center' }}>
          <LiquidFill value={68} />
          <LiquidFill value={32} label="存储" />
          <LiquidFill value={92} label="健康" color="var(--au-success)" />
        </div>
      </DemoBlock>

      <DemoBlock
        title="阈值自动变色"
        description="thresholds 按百分比分段, 水位达到阈值自动换色。常用于风险 / 健康度。"
        code={`<LiquidFill
  value={88}
  thresholds={[
    { threshold: 0,  color: 'var(--au-danger)' },
    { threshold: 50, color: 'var(--au-warning)' },
    { threshold: 80, color: 'var(--au-success)' },
  ]}
/>`}
      >
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {[22, 55, 78, 96].map((val) => (
            <LiquidFill
              key={val}
              value={val}
              size={140}
              thresholds={[
                { threshold: 0, color: 'var(--au-danger)' },
                { threshold: 50, color: 'var(--au-warning)' },
                { threshold: 80, color: 'var(--au-success)' },
              ]}
              label={val < 50 ? '危险' : val < 80 ? '警告' : '正常'}
            />
          ))}
        </div>
      </DemoBlock>

      <DemoBlock
        title="渐变 + glow"
        description="gradient 传 [起, 终] 两色 + glow 给容器外发光晕, 极光质感。"
        code={`<LiquidFill
  value={72}
  gradient={['#22d3ee', '#a855f7']}
  glow
  size={180}
  label="极光"
/>`}
      >
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'center' }}>
          <LiquidFill value={72} gradient={['#22d3ee', '#a855f7']} glow label="极光" />
          <LiquidFill value={56} gradient={['#f472b6', '#a855f7']} glow label="情绪" size={180} />
          <LiquidFill value={88} gradient={['#10b981', '#22d3ee']} glow label="进度" />
        </div>
      </DemoBlock>

      <DemoBlock
        title="圆角矩形容器"
        description={`shape='rect' 把容器换成圆角矩形, 圆角通过 radius 控制 (默认 size/8)。`}
        code={`<LiquidFill shape="rect" value={60} radius={20} />
<LiquidFill shape="rect" value={42} size={180} radius={28} label="水箱 A" />`}
      >
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <LiquidFill shape="rect" value={60} radius={20} />
          <LiquidFill
            shape="rect"
            value={42}
            size={200}
            radius={28}
            label="水箱 A"
            color="var(--au-primary)"
          />
          <LiquidFill
            shape="rect"
            value={86}
            size={200}
            radius={8}
            label="储量"
            gradient={['#06b6d4', '#0ea5e9']}
          />
        </div>
      </DemoBlock>

      <DemoBlock
        title="实时跳动"
        description="value 受控时, 水位会平滑过渡到新值 (transition 250-400ms)。配合定时器看板就活了。"
        code={`const [v, setV] = useState(62);
useEffect(() => {
  const id = setInterval(() => {
    setV(prev => Math.max(8, Math.min(98, prev + (Math.random() - 0.5) * 8)));
  }, 1500);
  return () => clearInterval(id);
}, []);

<LiquidFill value={v} gradient={['#22d3ee', '#a855f7']} glow size={200} label="实时" />`}
      >
        <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
          <LiquidFill value={v} gradient={['#22d3ee', '#a855f7']} glow size={200} label="实时" />
          <div style={{ color: 'var(--au-text-2)', fontSize: 14, lineHeight: 1.7 }}>
            <div>
              当前水位: <strong style={{ color: 'var(--au-primary)' }}>{v.toFixed(1)}%</strong>
            </div>
            <div>每 1.5s 随机上下 4%</div>
          </div>
        </div>
      </DemoBlock>

      <DemoBlock
        title="自定义中央内容"
        description="formatter 接管中央渲染, 可以放任意 ReactNode (数字 / 图标 / 多行)。"
        code={`<LiquidFill
  value={64}
  size={200}
  formatter={(v) => (
    <div style={{ textAlign: 'center', color: '#fff' }}>
      <div style={{ fontSize: 36, fontWeight: 800 }}>{v.toFixed(0)}</div>
      <div style={{ fontSize: 11, opacity: 0.85 }}>本月剩余</div>
    </div>
  )}
/>`}
      >
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <LiquidFill
            value={64}
            size={200}
            gradient={['#8b5cf6', '#ec4899']}
            formatter={(val) => (
              <div style={{ textAlign: 'center', color: '#fff' }}>
                <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1 }}>{val.toFixed(0)}</div>
                <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>本月剩余</div>
              </div>
            )}
          />
          <LiquidFill
            value={28}
            size={180}
            shape="rect"
            radius={18}
            color="var(--au-warning)"
            formatter={(val) => (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{val.toFixed(1)}</div>
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>m³</div>
              </div>
            )}
          />
        </div>
      </DemoBlock>

      <DemoBlock
        title="波浪密度与速度"
        description="waveCount 1-3 层 (越多越柔), waveSpeed 一个完整周期秒数, waveHeight 振幅 px。"
        code={`<LiquidFill value={62} waveCount={1} />
<LiquidFill value={62} waveCount={2} waveSpeed={3} />
<LiquidFill value={62} waveCount={3} waveSpeed={6} waveHeight={14} />`}
      >
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <LiquidFill value={62} waveCount={1} label="单层" />
          <LiquidFill value={62} waveCount={2} waveSpeed={3} label="双层" />
          <LiquidFill value={62} waveCount={3} waveSpeed={6} waveHeight={14} label="三层" />
        </div>
      </DemoBlock>

      <DemoBlock
        title="加载态"
        description="loading 显示骨架占位, 适合数据未到达时占位。"
        code={`<LiquidFill value={0} loading />
<LiquidFill value={0} loading size={180} />`}
      >
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <LiquidFill value={0} loading />
          <LiquidFill value={0} loading size={180} />
        </div>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'value', desc: '当前值', type: 'number', default: '-' },
          { prop: 'min', desc: '量纲下限', type: 'number', default: '0' },
          { prop: 'max', desc: '量纲上限', type: 'number', default: '100' },
          { prop: 'size', desc: '直径 / 边长 (px)', type: 'number', default: '160' },
          {
            prop: 'shape',
            desc: '容器形状',
            type: `'circle' | 'rect'`,
            default: `'circle'`,
          },
          {
            prop: 'radius',
            desc: '圆角矩形圆角 (仅 shape=rect)',
            type: 'number',
            default: 'size/8',
          },
          { prop: 'color', desc: '单色填充', type: 'string', default: 'var(--au-primary)' },
          {
            prop: 'gradient',
            desc: '渐变 [起, 终], 优先于 color',
            type: '[string, string]',
            default: '-',
          },
          {
            prop: 'thresholds',
            desc: '阈值变色, 按百分比分段',
            type: '{ threshold: number; color: string }[]',
            default: '-',
          },
          { prop: 'waveCount', desc: '波浪层数', type: '1 | 2 | 3', default: '2' },
          { prop: 'waveHeight', desc: '波浪振幅 (px)', type: 'number', default: 'size * 0.06' },
          { prop: 'waveSpeed', desc: '横向流动一个周期 (秒)', type: 'number', default: '4' },
          { prop: 'borderWidth', desc: '容器边框宽度 (0 隐藏)', type: 'number', default: '2' },
          {
            prop: 'borderColor',
            desc: '容器边框色',
            type: 'string',
            default: 'var(--au-border-strong)',
          },
          { prop: 'trackColor', desc: '空容器底色', type: 'string', default: 'var(--au-bg-soft)' },
          { prop: 'glow', desc: '边框外光晕', type: 'boolean', default: 'false' },
          { prop: 'showValue', desc: '显示中央百分比', type: 'boolean', default: 'true' },
          {
            prop: 'formatter',
            desc: '自定义中央内容',
            type: '(value, percent) => ReactNode',
            default: '-',
          },
          { prop: 'label', desc: '中央数字下方副标签', type: 'ReactNode', default: '-' },
          {
            prop: 'valueColor',
            desc: '中央文字颜色, auto 模式下水位高反白, 低用 text-1',
            type: `string | 'auto'`,
            default: `'auto'`,
          },
          { prop: 'paused', desc: '暂停波浪动画', type: 'boolean', default: 'false' },
          { prop: 'loading', desc: '加载骨架', type: 'boolean', default: 'false' },
        ]}
      />
    </>
  );
};

export default LiquidFillDoc;
