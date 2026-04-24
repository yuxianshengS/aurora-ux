import React from 'react';
import { KpiCard } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const trendUp = [3, 4, 2, 5, 7, 6, 9, 8, 11, 13, 12, 15];
const trendDown = [15, 13, 14, 11, 12, 9, 10, 7, 6, 4, 5, 3];
const trendFlat = [8, 9, 7, 8, 9, 8, 9, 8, 9, 8, 9, 8];

const KpiCardDoc: React.FC = () => {
  return (
    <>
      <h1>KpiCard 指标卡片</h1>
      <p>
        dashboard 的核心单元。在一张卡片上呈现标题 / 大数字 / 环比 / 趋势缩略图,
        深度集成 <code>Sparkline</code>,提供语义化的 delta 好坏判定
        (涨为好 / 跌为好两种模式)。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="最少传 title + value。delta 传数值自动算方向,默认 '涨 = 好'。"
        code={`<KpiCard title="月收入" prefix="¥" value={128500} delta={{ value: 12.5 }} />`}
      >
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <KpiCard title="月收入" prefix="¥" value={128500} delta={{ value: 12.5 }} />
          <KpiCard title="日活跃用户" value={12492} delta={{ value: 3.2 }} />
          <KpiCard title="订单转化率" value={4.8} suffix="%" precision={1} delta={{ value: -0.7 }} />
          <KpiCard title="平均响应时间" value={182} suffix="ms" delta={{ value: -8.5, mode: 'positive-down' }} />
        </div>
      </DemoBlock>

      <DemoBlock
        title="带趋势图"
        description="trend 让卡片底部出现 Sparkline (共用 color)。"
        code={`<KpiCard
  title="GMV"
  prefix="¥"
  value={2384910}
  delta={{ value: 8.4 }}
  trend={{ data: [...], type: 'area' }}
  status="success"
/>`}
      >
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <KpiCard
            title="GMV"
            prefix="¥"
            value={2384910}
            delta={{ value: 8.4 }}
            trend={{ data: trendUp, type: 'area' }}
            status="success"
          />
          <KpiCard
            title="新增用户"
            value={3421}
            delta={{ value: -2.1 }}
            trend={{ data: trendDown, type: 'line' }}
            status="danger"
          />
          <KpiCard
            title="客单价"
            prefix="¥"
            value={268}
            delta={{ value: 0, direction: 'flat' }}
            trend={{ data: trendFlat, type: 'bar' }}
          />
        </div>
      </DemoBlock>

      <DemoBlock
        title="成本 / 流失率指标"
        description={`跌为好的指标 (mode='positive-down') 会把 "下跌" 标绿、"上涨" 标红。`}
        code={`// 跌是好事
<KpiCard
  title="用户流失率"
  value={1.8}
  suffix="%"
  delta={{ value: -0.4, mode: 'positive-down' }}
/>`}
      >
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <KpiCard
            title="用户流失率"
            value={1.8}
            suffix="%"
            delta={{ value: -0.4, mode: 'positive-down' }}
          />
          <KpiCard
            title="平均响应时间"
            value={182}
            suffix="ms"
            delta={{ value: 8.5, mode: 'positive-down' }}
          />
          <KpiCard
            title="获客成本"
            prefix="¥"
            value={42.8}
            precision={1}
            delta={{ value: -6.3, mode: 'positive-down' }}
          />
        </div>
      </DemoBlock>

      <DemoBlock
        title="状态色条 + 图标"
        description="status 在左侧加一条状态色条, icon 放右上角。"
        code={`<KpiCard
  title="订单"
  value={1284}
  status="primary"
  icon={<span>📦</span>}
/>`}
      >
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <KpiCard title="订单" value={1284} status="primary" icon={<span>📦</span>} />
          <KpiCard title="完成" value={1092} status="success" icon={<span>✅</span>} />
          <KpiCard title="待处理" value={128} status="warning" icon={<span>⏳</span>} />
          <KpiCard title="异常" value={64} status="danger" icon={<span>🚨</span>} />
        </div>
      </DemoBlock>

      <DemoBlock
        title="可点击 / 加载态 / 尺寸"
        description="onClick 让卡片可点击; loading 显示骨架屏。"
        code={`<KpiCard loading title="..." />
<KpiCard size="small" ... />
<KpiCard onClick={...} ... />`}
      >
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <KpiCard title="加载中" value={0} loading />
          <KpiCard size="small" title="小号" value={42} delta={{ value: 3.1 }} />
          <KpiCard size="large" title="大号" value={888} delta={{ value: 12.4 }} />
          <KpiCard title="可点击" value={1024} onClick={() => {}} trend={{ data: trendUp }} delta={{ value: 5.2 }} />
        </div>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'title', desc: '标题', type: 'ReactNode', default: '-' },
          { prop: 'value', desc: '主数值', type: 'number | string', default: '-' },
          { prop: 'prefix / suffix', desc: '前缀/后缀', type: 'ReactNode', default: '-' },
          { prop: 'precision', desc: '小数位数 (仅 number)', type: 'number', default: '-' },
          { prop: 'formatter', desc: '完全自定义值格式化', type: '(v) => ReactNode', default: '-' },
          { prop: 'delta', desc: '环比配置', type: '{ value, direction?, mode?, suffix?, label? }', default: '-' },
          { prop: 'trend', desc: '趋势图', type: '{ data, type?, color?, height? }', default: '-' },
          { prop: 'icon', desc: '右上角图标', type: 'ReactNode', default: '-' },
          { prop: 'status', desc: '语义状态 (左侧色条 + icon 底色)', type: `'default' | 'primary' | 'success' | 'warning' | 'danger'`, default: `'default'` },
          { prop: 'size', desc: '尺寸', type: `'small' | 'medium' | 'large'`, default: `'medium'` },
          { prop: 'bordered', desc: '外边框', type: 'boolean', default: 'true' },
          { prop: 'loading', desc: '加载骨架', type: 'boolean', default: 'false' },
          { prop: 'onClick', desc: '点击整卡', type: '() => void', default: '-' },
          { prop: 'extra', desc: '头部右侧额外内容', type: 'ReactNode', default: '-' },
        ]}
      />
      <h3>KpiDelta</h3>
      <ApiTable
        rows={[
          { prop: 'value', desc: '数值 (符号决定方向; 可被 direction 覆盖)', type: 'number', default: '-' },
          { prop: 'direction', desc: '手动方向', type: `'up' | 'down' | 'flat'`, default: '由 value 自动判断' },
          {
            prop: 'mode',
            desc: '涨为好 (default) 或跌为好 (成本/错误率)',
            type: `'positive-up' | 'positive-down'`,
            default: `'positive-up'`,
          },
          { prop: 'suffix', desc: '数字后缀', type: 'ReactNode', default: `'%'` },
          { prop: 'label', desc: '补充文字 (如 "较上周")', type: 'ReactNode', default: '-' },
        ]}
      />
    </>
  );
};

export default KpiCardDoc;
