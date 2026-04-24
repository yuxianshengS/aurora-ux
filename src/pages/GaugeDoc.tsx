import React, { useEffect, useState } from 'react';
import { Gauge } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const GaugeDoc: React.FC = () => {
  return (
    <>
      <h1>Gauge 仪表盘</h1>
      <p>
        环形进度仪表。适合展示"占比 / 完成率 / 得分"等需要强烈视觉感的单一指标。
        支持自定义角度、渐变、阈值变色、中心标签与数字后缀。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="传 value + max 即可。"
        code={`<Gauge value={78} label="完成率" suffix="%" />`}
      >
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <Gauge value={78} label="完成率" suffix="%" />
          <Gauge value={45} label="CPU" suffix="%" />
          <Gauge value={92} label="健康度" suffix="分" color="var(--au-success)" />
        </div>
      </DemoBlock>

      <DemoBlock
        title="阈值自动变色"
        description="thresholds 按百分比分段,自动切换颜色。常用于健康度 / 风险等级。"
        code={`<Gauge
  value={85}
  thresholds={[
    { threshold: 0,  color: 'var(--au-danger)' },
    { threshold: 50, color: 'var(--au-warning)' },
    { threshold: 80, color: 'var(--au-success)' },
  ]}
  suffix="%"
/>`}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {[22, 55, 78, 96].map((v) => (
            <Gauge
              key={v}
              value={v}
              suffix="%"
              thresholds={[
                { threshold: 0, color: 'var(--au-danger)' },
                { threshold: 50, color: 'var(--au-warning)' },
                { threshold: 80, color: 'var(--au-success)' },
              ]}
              label={v < 50 ? '危险' : v < 80 ? '警告' : '正常'}
            />
          ))}
        </div>
      </DemoBlock>

      <DemoBlock
        title="渐变"
        description="gradient 传 [start, end] 两色,弧线应用线性渐变。"
        code={`<Gauge
  value={64}
  gradient={['#8b5cf6', '#ec4899']}
  label="情绪指数"
/>`}
      >
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Gauge value={64} gradient={['#8b5cf6', '#ec4899']} label="情绪指数" suffix="分" />
          <Gauge value={82} gradient={['#06b6d4', '#10b981']} label="满意度" suffix="%" size={160} thickness={14} />
        </div>
      </DemoBlock>

      <DemoBlock
        title="角度与形态"
        description="startAngle / endAngle 自定义弧度;半环 / 全环 / 275° 环都可。"
        code={`<Gauge startAngle={-90} endAngle={90} value={72} />   {/* 半环 */}
<Gauge startAngle={-180} endAngle={180} value={72} />  {/* 全环 */}`}
      >
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <Gauge startAngle={-90} endAngle={90} value={72} label="半环" suffix="%" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <Gauge startAngle={-135} endAngle={135} value={72} label="默认 270°" suffix="%" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <Gauge startAngle={-180} endAngle={180} value={72} label="全环" suffix="%" />
          </div>
        </div>
      </DemoBlock>

      <DemoBlock
        title="动态值"
        description="值变化时弧长平滑过渡。"
        code={`const [v, setV] = useState(30);
useEffect(() => { setInterval(() => setV(Math.random() * 100), 1500); }, []);

<Gauge value={v} label="实时负载" suffix="%" />`}
      >
        <AnimatedDemo />
      </DemoBlock>

      <DemoBlock
        title="自定义格式化"
        description="formatter 取代默认数字,可用于分数 / 评级 / 货币。"
        code={`<Gauge
  value={4.6}
  max={5}
  formatter={(v) => v.toFixed(1)}
  suffix={<span>/ 5</span>}
  label="用户评分"
  gradient={['#f59e0b', '#ef4444']}
/>`}
      >
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Gauge
            value={4.6}
            max={5}
            formatter={(v) => v.toFixed(1)}
            suffix={<span>/ 5</span>}
            label="用户评分"
            gradient={['#f59e0b', '#ef4444']}
          />
          <Gauge
            value={0.785}
            max={1}
            formatter={(v) => `${(v * 100).toFixed(1)}%`}
            label="转化率"
            color="var(--au-primary)"
            size={160}
            thickness={16}
          />
        </div>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'value', desc: '当前值', type: 'number', default: '-' },
          { prop: 'min / max', desc: '取值范围', type: 'number', default: '0 / 100' },
          { prop: 'size', desc: '整体直径 (px)', type: 'number', default: '140' },
          { prop: 'thickness', desc: '弧线粗细', type: 'number', default: '10' },
          { prop: 'color', desc: '弧线颜色', type: 'string', default: `'var(--au-primary)'` },
          { prop: 'trackColor', desc: '背景弧颜色', type: 'string', default: `'var(--au-bg-mute)'` },
          { prop: 'gradient', desc: '两色渐变 [起, 终]', type: '[string, string]', default: '-' },
          { prop: 'thresholds', desc: '按百分比阈值变色', type: '{ threshold, color }[]', default: '-' },
          { prop: 'startAngle / endAngle', desc: '弧起止角度 (0=12 点方向, 顺时针)', type: 'number', default: '-135 / 135' },
          { prop: 'label', desc: '中心标签', type: 'ReactNode', default: '-' },
          { prop: 'suffix', desc: '数字后缀', type: 'ReactNode', default: '-' },
          { prop: 'formatter', desc: '自定义中心数字', type: '(value, percent) => ReactNode', default: '-' },
          { prop: 'showValue', desc: '是否显示中心值', type: 'boolean', default: 'true' },
          { prop: 'animated', desc: '动画过渡', type: 'boolean', default: 'true' },
        ]}
      />
    </>
  );
};

const AnimatedDemo: React.FC = () => {
  const [v, setV] = useState(30);
  useEffect(() => {
    const id = setInterval(() => setV(Math.round(Math.random() * 100)), 1500);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Gauge
        value={v}
        label="实时负载"
        suffix="%"
        thresholds={[
          { threshold: 0, color: 'var(--au-success)' },
          { threshold: 60, color: 'var(--au-warning)' },
          { threshold: 85, color: 'var(--au-danger)' },
        ]}
      />
      <button className="au-btn au-btn--default au-btn--small" onClick={() => setV(Math.round(Math.random() * 100))}>
        重新随机
      </button>
    </div>
  );
};

export default GaugeDoc;
