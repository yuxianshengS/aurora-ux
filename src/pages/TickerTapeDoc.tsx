import React from 'react';
import { TickerTape, type TickerItem } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const stocks: TickerItem[] = [
  { label: 'BTC', value: '¥ 432,180', trend: 'up' },
  { label: 'ETH', value: '¥ 18,420', trend: 'up' },
  { label: 'SOL', value: '¥ 1,240', trend: 'down' },
  { label: 'AAPL', value: '$ 218.34', trend: 'up' },
  { label: 'TSLA', value: '$ 245.18', trend: 'down' },
  { label: 'NVDA', value: '$ 924.20', trend: 'up' },
  { label: 'CNY/USD', value: '7.18', trend: 'flat' },
];

const orders: TickerItem[] = [
  { label: '订单 #O-2026-0419-08', value: '¥ 48,000', trend: 'up' },
  { label: '订单 #O-2026-0419-07', value: '¥ 128,000', trend: 'up' },
  { label: '退款 #R-2134', value: '-¥ 4,400', trend: 'down' },
  { label: '订单 #O-2026-0419-05', value: '¥ 1,200', trend: 'up' },
  { label: '订单 #O-2026-0419-03', value: '¥ 65,000', trend: 'up' },
];

const TickerTapeDoc: React.FC = () => {
  return (
    <>
      <h1>TickerTape 跑马灯</h1>
      <p>
        横向滚动条, 适合实时金融行情、订单流、最新消息. 鼠标悬停可暂停, 不打扰用户阅读.
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础: 行情跑马灯"
        description="带涨跌方向 (up/down/flat) 自动配色 + 三角箭头."
        code={`const stocks = [
  { label: 'BTC', value: '¥ 432,180', trend: 'up' },
  { label: 'SOL', value: '¥ 1,240', trend: 'down' },
  { label: 'CNY/USD', value: '7.18', trend: 'flat' },
];
<TickerTape items={stocks} />`}
      >
        <TickerTape items={stocks} />
      </DemoBlock>

      <DemoBlock
        title="速度与方向"
        description="duration 控制速度, direction='right' 反向滚动."
        code={`<TickerTape items={stocks} duration={15} />
<TickerTape items={stocks} direction="right" duration={40} />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <TickerTape items={stocks} duration={15} />
          <TickerTape items={stocks} direction="right" duration={40} />
        </div>
      </DemoBlock>

      <DemoBlock
        title="订单实时流"
        description="把订单 / 退款做成流水牌, 看板顶部铺一条很有节奏感."
        code={`<TickerTape
  items={orders}
  separator="—"
  duration={25}
/>`}
      >
        <TickerTape items={orders} separator="—" duration={25} />
      </DemoBlock>

      <DemoBlock
        title="自定义颜色 + 无边框"
        description="每条单独传 color; bordered={false} 适合放在已有容器里."
        code={`<TickerTape
  items={[
    { label: '紧急', value: '数据库故障', color: '#ef4444' },
    { label: '维护', value: '今晚 02:00 升级', color: '#f59e0b' },
    { label: '更新', value: 'v2.4.1 已发布', color: '#10b981' },
  ]}
  bordered={false}
/>`}
      >
        <div style={{ background: 'var(--au-bg)', padding: 16, borderRadius: 8 }}>
          <TickerTape
            items={[
              { label: '紧急', value: '数据库故障', color: '#ef4444' },
              { label: '维护', value: '今晚 02:00 升级', color: '#f59e0b' },
              { label: '更新', value: 'v2.4.1 已发布', color: '#10b981' },
              { label: '提示', value: 'CDN 已切换至新节点', color: '#6366f1' },
            ]}
            bordered={false}
          />
        </div>
      </DemoBlock>

      <h2>API</h2>
      <h3>TickerTape</h3>
      <ApiTable
        rows={[
          { prop: 'items', desc: '滚动项数组', type: 'TickerItem[]', default: '-' },
          { prop: 'duration', desc: '滚动一圈时长 (s), 越大越慢', type: 'number', default: '30' },
          { prop: 'direction', desc: '滚动方向', type: `'left' | 'right'`, default: `'left'` },
          { prop: 'pauseOnHover', desc: '鼠标悬停暂停', type: 'boolean', default: 'true' },
          { prop: 'separator', desc: '项与项之间的分隔符', type: 'ReactNode', default: `'·'` },
          { prop: 'height', desc: '高度 (px)', type: 'number', default: '36' },
          { prop: 'bordered', desc: '边框', type: 'boolean', default: 'true' },
        ]}
      />
      <h3>TickerItem</h3>
      <ApiTable
        rows={[
          { prop: 'label', desc: '主标签', type: 'ReactNode', default: '-' },
          { prop: 'value', desc: '数值或描述', type: 'ReactNode', default: '-' },
          { prop: 'trend', desc: '涨跌方向, 影响数值颜色 + 箭头', type: `'up' | 'down' | 'flat'`, default: `'flat'` },
          { prop: 'color', desc: '自定义颜色 (覆盖 trend)', type: 'string', default: '-' },
          { prop: 'key', desc: '唯一 key', type: 'string | number', default: '-' },
        ]}
      />
    </>
  );
};

export default TickerTapeDoc;
