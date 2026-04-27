import React from 'react';
import { Statistic, Card } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const StatisticDoc: React.FC = () => {
  return (
    <>
      <h1>Statistic 数值</h1>
      <p>突出展示某个数字 (营收 / 用户数 / 转化率), 自动千分位格式化。</p>

      <h2>代码演示</h2>

      <DemoBlock title="基础" code={`<Statistic title="本月 GMV" value={128500} prefix="¥" />`}>
        <Statistic title="本月 GMV" value={128500} prefix="¥" />
      </DemoBlock>

      <DemoBlock
        title="多组指标"
        code={`<Card><Statistic ... /></Card>`}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          <Card><Statistic title="今日订单" value={1842} /></Card>
          <Card><Statistic title="转化率" value={4.82} suffix="%" precision={2} /></Card>
          <Card><Statistic title="客单价" value={69.78} prefix="¥" precision={2} /></Card>
          <Card><Statistic title="活跃用户" value={12350} /></Card>
        </div>
      </DemoBlock>

      <DemoBlock title="自定义颜色" code={`<Statistic valueStyle={{ color: 'var(--au-success)' }} />`}>
        <div style={{ display: 'flex', gap: 32 }}>
          <Statistic title="环比" value={12.4} suffix="%" valueStyle={{ color: 'var(--au-success, #10b981)' }} />
          <Statistic title="同比" value={-3.6} suffix="%" valueStyle={{ color: 'var(--au-danger, #ef4444)' }} />
        </div>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'title', desc: '标题', type: 'ReactNode', default: '-' },
          { prop: 'value', desc: '数值', type: 'number | string', default: '-' },
          { prop: 'prefix / suffix', desc: '前缀 / 后缀', type: 'ReactNode', default: '-' },
          { prop: 'precision', desc: '小数位', type: 'number', default: '-' },
          { prop: 'groupSeparator', desc: '千分位符', type: 'string', default: `','` },
          { prop: 'formatter', desc: '自定义格式化', type: '(v) => ReactNode', default: '-' },
          { prop: 'valueStyle', desc: '数字样式', type: 'CSSProperties', default: '-' },
          { prop: 'loading', desc: '加载占位', type: 'boolean', default: 'false' },
        ]}
      />
    </>
  );
};

export default StatisticDoc;
