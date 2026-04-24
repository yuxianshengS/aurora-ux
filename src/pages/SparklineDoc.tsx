import React from 'react';
import { Sparkline } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const rise = [3, 4, 2, 5, 7, 6, 9, 8, 11, 13, 12, 15];
const dip = [15, 13, 14, 11, 12, 9, 10, 7, 6, 4, 5, 3];
const mix = [-3, -1, 2, -2, 4, 6, -1, 3, 5, 2, 7, -2, 8];

const SparklineDoc: React.FC = () => {
  return (
    <>
      <h1>Sparkline 迷你趋势线</h1>
      <p>
        用于在有限空间内快速展示数值趋势,常嵌入 KPI 卡片、表格单元、导航项右侧。
        纯 SVG,三种形态,自动算极值并适配容器,支持 Catmull-Rom 平滑。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="三种形态"
        description="line (默认) / area (带填充) / bar。"
        code={`<Sparkline data={[...]} type="line" />
<Sparkline data={[...]} type="area" />
<Sparkline data={[...]} type="bar" />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 50, fontSize: 12, color: 'var(--au-text-3)' }}>line</span>
            <Sparkline data={rise} type="line" width={200} height={36} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 50, fontSize: 12, color: 'var(--au-text-3)' }}>area</span>
            <Sparkline data={rise} type="area" width={200} height={36} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 50, fontSize: 12, color: 'var(--au-text-3)' }}>bar</span>
            <Sparkline data={rise} type="bar" width={200} height={36} />
          </div>
        </div>
      </DemoBlock>

      <DemoBlock
        title="颜色与状态"
        description="通过 color 指定任意 CSS 颜色, 常配合上涨/下跌语义。"
        code={`<Sparkline data={rise} color="var(--au-success)" type="area" />
<Sparkline data={dip}  color="var(--au-danger)"  type="area" />`}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Sparkline data={rise} color="var(--au-success)" type="area" width={140} height={36} />
          <Sparkline data={dip} color="var(--au-danger)" type="area" width={140} height={36} />
          <Sparkline data={mix} color="var(--au-warning)" type="bar" width={160} height={36} />
        </div>
      </DemoBlock>

      <DemoBlock
        title="含负值的 bar"
        description="数据跨零点时自动绘制零基线。"
        code={`<Sparkline data={[-3, -1, 2, -2, 4, 6, -1, 3, 5, 2, 7, -2, 8]} type="bar" />`}
      >
        <Sparkline data={mix} type="bar" width={260} height={48} />
      </DemoBlock>

      <DemoBlock
        title="表格内嵌"
        description="在表格单元内展示趋势。"
        code={`<td>
  <Sparkline data={[...]} type="line" width={80} height={20} />
</td>`}
      >
        <table style={{ width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--au-text-3)', fontWeight: 500 }}>股票</th>
              <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--au-text-3)', fontWeight: 500 }}>价格</th>
              <th style={{ textAlign: 'center', padding: '8px 12px', color: 'var(--au-text-3)', fontWeight: 500 }}>今日走势</th>
              <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--au-text-3)', fontWeight: 500 }}>涨跌</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'AAPL', price: 182.34, tr: rise, delta: 2.8 },
              { name: 'TSLA', price: 238.45, tr: dip, delta: -3.4 },
              { name: 'NVDA', price: 865.18, tr: [10, 12, 11, 14, 13, 16, 18, 17, 19, 21], delta: 5.2 },
            ].map((s) => (
              <tr key={s.name}>
                <td style={{ padding: '10px 12px' }}>{s.name}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  ${s.price}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <Sparkline
                    data={s.tr}
                    type="line"
                    width={80}
                    height={20}
                    color={s.delta >= 0 ? 'var(--au-success)' : 'var(--au-danger)'}
                    showDot={false}
                  />
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: s.delta >= 0 ? 'var(--au-success)' : 'var(--au-danger)' }}>
                  {s.delta >= 0 ? '+' : ''}{s.delta}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'data', desc: '数值数组', type: 'number[]', default: '-' },
          { prop: 'type', desc: '形态', type: `'line' | 'area' | 'bar'`, default: `'line'` },
          { prop: 'width / height', desc: '尺寸 (px)', type: 'number', default: '100 / 28' },
          { prop: 'color', desc: '描边 / 填充色 (任意 CSS)', type: 'string', default: `'var(--au-primary)'` },
          { prop: 'smooth', desc: 'line / area 是否平滑', type: 'boolean', default: 'true' },
          { prop: 'showDot', desc: 'line / area 末端加实心点', type: 'boolean', default: 'true' },
          { prop: 'fillOpacity', desc: 'area 填充透明度', type: 'number', default: '0.18' },
          { prop: 'strokeWidth', desc: '描边宽度', type: 'number', default: '1.6' },
          { prop: 'min / max', desc: '手动指定 Y 轴范围', type: 'number', default: '自动' },
          { prop: 'gap', desc: 'bar 间距', type: 'number', default: '2' },
        ]}
      />
    </>
  );
};

export default SparklineDoc;
