import React from 'react';
import { Funnel } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const steps = [
  { label: '访问页面', value: 10000 },
  { label: '点击商品', value: 4200 },
  { label: '加入购物车', value: 1850 },
  { label: '进入结算', value: 920 },
  { label: '支付成功', value: 480 },
];

const FunnelDoc: React.FC = () => {
  return (
    <>
      <h1>Funnel 漏斗图</h1>
      <p>
        展示多步骤流程的转化情况 (访问 → 点击 → 下单 → 支付)。
        三种形态,按"首级 / 上一级"自动计算转化率,颜色自动渐变区分层级。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="数据数组按顺序传入,默认梯形 + 渐变。"
        code={`<Funnel data={[
  { label: '访问', value: 10000 },
  { label: '点击', value: 4200 },
  { label: '下单', value: 1850 },
  { label: '支付', value: 480 },
]} />`}
      >
        <Funnel data={steps} width={420} />
      </DemoBlock>

      <DemoBlock
        title="三种形态"
        description="trapezoid (梯形, 默认) / pyramid (倒梯形) / rect (等宽条形)。"
        code={`<Funnel shape="trapezoid" data={...} />
<Funnel shape="pyramid" data={...} />
<Funnel shape="rect" data={...} />`}
      >
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <Funnel shape="trapezoid" data={steps} width={280} />
            <div style={{ fontSize: 12, color: 'var(--au-text-3)', marginTop: 4 }}>trapezoid</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Funnel shape="pyramid" data={steps} width={280} />
            <div style={{ fontSize: 12, color: 'var(--au-text-3)', marginTop: 4 }}>pyramid</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Funnel shape="rect" data={steps} width={280} />
            <div style={{ fontSize: 12, color: 'var(--au-text-3)', marginTop: 4 }}>rect</div>
          </div>
        </div>
      </DemoBlock>

      <DemoBlock
        title="转化率基准"
        description={`percentBase='first' (默认, 相对首级) / 'previous' (相对上一级, 看步间衰减)。`}
        code={`<Funnel data={...} percentBase="previous" />`}
      >
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ textAlign: 'center' }}>
            <Funnel data={steps} width={320} percentBase="first" />
            <div style={{ fontSize: 12, color: 'var(--au-text-3)', marginTop: 4 }}>相对首级</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Funnel data={steps} width={320} percentBase="previous" />
            <div style={{ fontSize: 12, color: 'var(--au-text-3)', marginTop: 4 }}>相对上一级</div>
          </div>
        </div>
      </DemoBlock>

      <DemoBlock
        title="自定义颜色"
        description="单步可传 color 覆盖自动渐变。"
        code={`[
  { label: '访问', value: 10000, color: '#3b82f6' },
  { label: '点击', value: 4200, color: '#06b6d4' },
  ...
]`}
      >
        <Funnel
          width={420}
          data={[
            { label: '访问', value: 10000, color: '#3b82f6' },
            { label: '点击', value: 4200, color: '#06b6d4' },
            { label: '下单', value: 1850, color: '#10b981' },
            { label: '支付', value: 480, color: '#f59e0b' },
          ]}
        />
      </DemoBlock>

      <DemoBlock
        title="自定义格式化"
        description="formatter 对大数字友好显示。"
        code={`<Funnel
  data={steps}
  formatter={(v) => v >= 1000 ? \`\${(v / 1000).toFixed(1)}k\` : String(v)}
/>`}
      >
        <Funnel
          width={420}
          data={steps}
          formatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
        />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'data', desc: '步骤数据', type: 'FunnelStep[]', default: '-' },
          { prop: 'shape', desc: '形态', type: `'trapezoid' | 'pyramid' | 'rect'`, default: `'trapezoid'` },
          { prop: 'gradient', desc: '自动颜色渐变 (单步 color 会覆盖)', type: 'boolean', default: 'true' },
          { prop: 'width / height', desc: '尺寸', type: 'number', default: '420 / 自动' },
          { prop: 'showValue', desc: '行内显示数值', type: 'boolean', default: 'true' },
          { prop: 'showPercent', desc: '行内显示百分比', type: 'boolean', default: 'true' },
          { prop: 'percentBase', desc: '百分比基准', type: `'first' | 'previous'`, default: `'first'` },
          { prop: 'formatter', desc: '值格式化', type: '(value, step) => ReactNode', default: '-' },
        ]}
      />
      <h3>FunnelStep</h3>
      <ApiTable
        rows={[
          { prop: 'label', desc: '步骤标签', type: 'ReactNode', default: '-' },
          { prop: 'value', desc: '数值', type: 'number', default: '-' },
          { prop: 'color', desc: '自定义颜色', type: 'string', default: '自动' },
          { prop: 'extra', desc: '行末额外节点', type: 'ReactNode', default: '-' },
        ]}
      />
    </>
  );
};

export default FunnelDoc;
