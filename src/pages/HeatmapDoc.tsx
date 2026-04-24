import React, { useMemo } from 'react';
import { Heatmap, message } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const generateData = (days: number, endDate = new Date()) => {
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  const data: { date: string; value: number }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(end.getTime() - i * 86400000);
    // Random-ish: weekday more active, some days empty
    const roll = Math.random();
    if (roll < 0.25) continue;
    const base = [0, 1, 2, 3, 4, 5, 6].includes(d.getDay()) ? Math.floor(Math.random() * 10) + 1 : Math.floor(Math.random() * 15);
    const val = Math.max(1, Math.floor(base * (roll + 0.3)));
    data.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      value: val,
    });
  }
  return data;
};

const HeatmapDoc: React.FC = () => {
  const yearData = useMemo(() => generateData(365), []);
  const shortData = useMemo(() => generateData(120), []);

  return (
    <>
      <h1>Heatmap 日历热力图</h1>
      <p>
        按日历 (7 行 × 若干周列) 展示每日活跃度,经典 GitHub 贡献墙形式。适合用户活跃、
        产品使用频次、发布节奏等"单指标按日"场景。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法 (过去一年)"
        description="只传 data 即可; 默认起止为最近一年。"
        code={`<Heatmap
  data={[
    { date: '2025-04-12', value: 4 },
    { date: '2025-04-15', value: 7 },
    ...
  ]}
/>`}
      >
        <Heatmap data={yearData} />
      </DemoBlock>

      <DemoBlock
        title="自定义起止日期"
        description="指定一段较短时间范围。"
        code={`<Heatmap
  data={shortData}
  startDate="2025-12-20"
  endDate="2026-04-20"
/>`}
      >
        <Heatmap data={shortData} startDate={new Date(Date.now() - 120 * 86400000)} endDate={new Date()} />
      </DemoBlock>

      <DemoBlock
        title="自定义配色"
        description="5 档颜色自定义 (空态 → 最高强度)。"
        code={`<Heatmap
  data={yearData}
  colors={[
    '#f3f4f6',
    '#fbbf24',
    '#f59e0b',
    '#d97706',
    '#92400e',
  ]}
/>`}
      >
        <Heatmap
          data={yearData}
          colors={[
            'var(--au-bg-mute)',
            'color-mix(in srgb, #f59e0b 30%, var(--au-bg))',
            'color-mix(in srgb, #f59e0b 55%, var(--au-bg))',
            'color-mix(in srgb, #f59e0b 80%, var(--au-bg))',
            '#f59e0b',
          ]}
        />
      </DemoBlock>

      <DemoBlock
        title="更大的单元"
        description="cellSize / cellGap 调整密度。"
        code={`<Heatmap data={...} cellSize={16} cellGap={4} />`}
      >
        <Heatmap data={shortData} cellSize={16} cellGap={4} startDate={new Date(Date.now() - 100 * 86400000)} endDate={new Date()} />
      </DemoBlock>

      <DemoBlock
        title="可点击 · 自定义 tooltip"
        description="onCellClick 处理点击; tooltipFormatter 自定义悬停提示。"
        code={`<Heatmap
  data={yearData}
  onCellClick={({ date, value }) => ...}
  tooltipFormatter={({ date, value }) => \`\${fmt(date)}: \${value} 条提交\`}
/>`}
      >
        <Heatmap
          data={yearData}
          onCellClick={({ date, value }) => {
            message.info(`${date.toLocaleDateString()} · ${value || 0} 次`);
          }}
          tooltipFormatter={({ date, value }) =>
            `${date.getMonth() + 1}月${date.getDate()}日 · ${value || 0} 次提交`
          }
        />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'data', desc: '每日数据', type: '{ date, value }[]', default: '-' },
          { prop: 'startDate / endDate', desc: '起止日期', type: 'string | Date', default: '最近一年' },
          { prop: 'cellSize', desc: '单元大小 (px)', type: 'number', default: '12' },
          { prop: 'cellGap', desc: '单元间距 (px)', type: 'number', default: '3' },
          { prop: 'cellRadius', desc: '单元圆角', type: 'number', default: '2' },
          { prop: 'colors', desc: '5 档颜色 (空 → 最高)', type: '[string, string, string, string, string]', default: '蓝色渐变' },
          { prop: 'thresholds', desc: '4 个强度阈值 (默认按 max 自动算)', type: '[n, n, n, n]', default: '-' },
          { prop: 'showMonthLabels', desc: '显示月份标签', type: 'boolean', default: 'true' },
          { prop: 'showWeekdayLabels', desc: '显示星期标签', type: 'boolean', default: 'true' },
          { prop: 'showLegend', desc: '显示图例', type: 'boolean', default: 'true' },
          { prop: 'tooltipFormatter', desc: 'tooltip 内容', type: '({ date, value }) => ReactNode', default: '-' },
          { prop: 'onCellClick', desc: '单元点击', type: '({ date, value }) => void', default: '-' },
        ]}
      />
    </>
  );
};

export default HeatmapDoc;
