import React from 'react';
import { EChart } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const months12 = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月',
];
const gmv12 = [820, 932, 901, 1234, 1290, 1330, 1320, 1450, 1380, 1620, 1780, 1920];

const EChartDoc: React.FC = () => {
  return (
    <>
      <h1>EChart 通用图表</h1>
      <p>
        Aurora 对 ECharts 的最小封装 —— 它<strong>不翻译 option</strong>, 你怎么写 ECharts 就怎么写,
        组件只负责: 自动注入 Aurora 主题 (色板 + textStyle), 接 React 生命周期, 透传事件.
      </p>
      <p style={{ color: 'var(--au-text-2)', fontSize: 13 }}>
        想要"开箱即用一行出图"? 用 KpiCard / Sparkline / Gauge 这些上层组件. EChart 是给你
        <strong>需要完全自定义 ECharts</strong>时用的逃生口.
      </p>

      <h2>前置依赖</h2>
      <p>
        ECharts 是 <strong>可选 peer dependency</strong>. 用之前先装:
      </p>
      <pre>
        <code>pnpm add echarts echarts-for-react</code>
      </pre>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法 — 裸 option"
        description="跟你平时写 ECharts option 一模一样. backgroundColor 默认透明, color 色板和 textStyle 自动跟 Aurora 主题; 想自己定显式写就覆盖了."
        code={`<EChart
  height={300}
  option={{
    xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: [120, 200, 150, 80, 70],
      itemStyle: { borderRadius: [6, 6, 0, 0] },
    }],
    tooltip: { trigger: 'axis' },
  }}
/>`}
      >
        <EChart
          height={300}
          option={{
            xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
            yAxis: { type: 'value' },
            series: [
              {
                type: 'bar',
                data: [120, 200, 150, 80, 70],
                itemStyle: { borderRadius: [6, 6, 0, 0] },
              },
            ],
            tooltip: { trigger: 'axis' },
          }}
        />
      </DemoBlock>

      <DemoBlock
        title="双 x 轴 — 月 + 季度"
        description="两个 xAxis 等长 12-cat: 内层放月份, 外层只在每段中心放季度标签 (其它位置空串), axisTick 在每季首月画 44px 长刻度把月份框成一组. 复制改数据即可."
        code={`const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
const quarterLabels = months.map((_, i) => (i % 3 === 1 ? \`Q\${Math.floor(i / 3) + 1}\` : ''));

<EChart
  height={320}
  option={{
    grid: { left: 50, right: 30, top: 24, bottom: 70, containLabel: true },
    tooltip: { trigger: 'axis' },
    xAxis: [
      {
        type: 'category',
        data: months,
        axisTick: {
          show: true, alignWithLabel: false, length: 60,
          interval: (idx) => idx % 3 === 0,
        },
        axisLabel: { interval: 0 },
      },
      {
        type: 'category', position: 'bottom', offset: 28,
        data: quarterLabels,
        axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false },
        axisLabel: { interval: 0, fontSize: 13, fontWeight: 700 },
      },
    ],
    yAxis: { type: 'value' },
    series: [{
      name: 'GMV',
      type: 'bar',
      data: [820, 932, 901, 1234, 1290, 1330, 1320, 1450, 1380, 1620, 1780, 1920],
      barMaxWidth: 16,
      itemStyle: { borderRadius: [6, 6, 0, 0] },
    }],
  }}
/>`}
      >
        <EChart
          height={320}
          option={{
            grid: { left: 50, right: 30, top: 24, bottom: 70, containLabel: true },
            tooltip: { trigger: 'axis' },
            xAxis: [
              {
                type: 'category',
                data: months12,
                axisTick: {
                  show: true,
                  alignWithLabel: false,
                  length: 60,
                  interval: (idx: number) => idx % 3 === 0,
                },
                axisLabel: { interval: 0 },
              },
              {
                type: 'category',
                position: 'bottom',
                offset: 28,
                data: months12.map((_, i) => (i % 3 === 1 ? `Q${Math.floor(i / 3) + 1}` : '')),
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: { interval: 0, fontSize: 13, fontWeight: 700 },
              },
            ],
            yAxis: { type: 'value' },
            series: [
              {
                name: 'GMV',
                type: 'bar',
                data: gmv12,
                barMaxWidth: 16,
                itemStyle: { borderRadius: [6, 6, 0, 0] },
              },
            ],
          }}
        />
      </DemoBlock>

      <DemoBlock
        title="季度合计柱 — 第二个 bar series 叠加"
        description="加一根稀疏 bar series (只在每季度中心位置有值), barWidth 300% 跨满 3 个月, barGap -100% 跟月柱重叠. 月柱 z:3 在前, 季度柱 z:1 在后."
        code={`const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
const gmv = [820, 932, 901, 1234, 1290, 1330, 1320, 1450, 1380, 1620, 1780, 1920];
const sums = [0, 3, 6, 9].map((s) => gmv.slice(s, s + 3).reduce((a, b) => a + b, 0));
const qSparse = months.map((_, i) => (i % 3 === 1 ? sums[Math.floor(i / 3)] : null));

<EChart
  height={340}
  option={{
    grid: { left: 50, right: 30, top: 24, bottom: 70, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'none' },
      formatter: (params) => {
        const m = params.find((p) => p.seriesName === 'GMV');
        if (!m) return '';
        const qIdx = Math.floor(m.dataIndex / 3);
        return \`\${m.axisValue}<br/>GMV: \${m.value}<br/>Q\${qIdx + 1} 合计: \${sums[qIdx]}\`;
      },
    },
    xAxis: [
      {
        type: 'category',
        data: months,
        axisTick: {
          show: true, alignWithLabel: false, length: 60,
          interval: (idx) => idx % 3 === 0,
        },
        axisLabel: { interval: 0 },
      },
      {
        type: 'category', position: 'bottom', offset: 28,
        data: months.map((_, i) => (i % 3 === 1 ? \`Q\${Math.floor(i / 3) + 1}\` : '')),
        axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false },
        axisLabel: { interval: 0, fontSize: 13, fontWeight: 700 },
      },
    ],
    yAxis: { type: 'value' },
    series: [
      {
        name: 'GMV · 季合计',
        type: 'bar',
        xAxisIndex: 1,
        data: qSparse,
        barWidth: '280%',
        itemStyle: { opacity: 0.18 },
        label: { show: true, position: 'top' },
        z: 1,
      },
      {
        name: 'GMV',
        type: 'bar',
        data: gmv,
        barWidth: 16,
        z: 3,
        itemStyle: { borderRadius: [6, 6, 0, 0] },
      },
    ],
  }}
/>`}
      >
        <EChart
          height={340}
          option={{
            grid: { left: 50, right: 30, top: 24, bottom: 70, containLabel: true },
            tooltip: {
              trigger: 'axis',
              axisPointer: { type: 'none' },
              formatter: (params: unknown) => {
                const arr = params as Array<{
                  seriesName: string;
                  axisValue: string;
                  value: number | null;
                  dataIndex: number;
                }>;
                const m = arr.find((p) => p.seriesName === 'GMV');
                if (!m) return '';
                const qIdx = Math.floor(m.dataIndex / 3);
                const qSum = gmv12.slice(qIdx * 3, qIdx * 3 + 3).reduce((a, b) => a + b, 0);
                return `${m.axisValue}<br/>GMV: ${m.value}<br/>Q${qIdx + 1} 合计: ${qSum}`;
              },
            },
            xAxis: [
              {
                type: 'category',
                data: months12,
                axisTick: {
                  show: true,
                  alignWithLabel: false,
                  length: 60,
                  interval: (idx: number) => idx % 3 === 0,
                },
                axisLabel: { interval: 0 },
              },
              {
                type: 'category',
                position: 'bottom',
                offset: 28,
                data: months12.map((_, i) => (i % 3 === 1 ? `Q${Math.floor(i / 3) + 1}` : '')),
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: { interval: 0, fontSize: 13, fontWeight: 700 },
              },
            ],
            yAxis: { type: 'value' },
            series: [
              {
                name: 'GMV · 季合计',
                type: 'bar',
                xAxisIndex: 1,
                data: months12.map((_, i) =>
                  i % 3 === 1
                    ? gmv12
                        .slice(Math.floor(i / 3) * 3, Math.floor(i / 3) * 3 + 3)
                        .reduce((a, b) => a + b, 0)
                    : null,
                ),
                barWidth: '280%',
                itemStyle: { opacity: 0.18 },
                label: { show: true, position: 'top' },
                z: 1,
              },
              {
                name: 'GMV',
                type: 'bar',
                data: gmv12,
                barWidth: 16,
                z: 3,
                itemStyle: { borderRadius: [6, 6, 0, 0] },
              },
            ],
          }}
        />
      </DemoBlock>

      <DemoBlock
        title="主题自动跟随 — autoTheme 默认 true"
        description="切深 / 浅主题, EChart 内部色板 + 文字颜色自动更新. 不想跟主题? autoTheme={false}, option 完全用你给的."
        code={`<EChart
  height={260}
  option={{
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      label: { show: true },
      data: [
        { name: '直营', value: 4800 },
        { name: '加盟', value: 3200 },
        { name: '电商', value: 2400 },
        { name: '海外', value: 1100 },
      ],
    }],
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
  }}
/>`}
      >
        <EChart
          height={260}
          option={{
            series: [
              {
                type: 'pie',
                radius: ['45%', '70%'],
                label: { show: true },
                data: [
                  { name: '直营', value: 4800 },
                  { name: '加盟', value: 3200 },
                  { name: '电商', value: 2400 },
                  { name: '海外', value: 1100 },
                ],
              },
            ],
            tooltip: { trigger: 'item' },
            legend: { bottom: 0 },
          }}
        />
      </DemoBlock>

      <DemoBlock
        title="事件透传 — onEvents"
        description="ECharts 任意事件名 (click / mouseover / legendselectchanged / datazoom ...) 都能接, 跟 echarts-for-react 一致."
        code={`<EChart
  height={260}
  option={{
    xAxis: { type: 'category', data: ['Q1', 'Q2', 'Q3', 'Q4'] },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: [2.7, 3.9, 4.2, 5.3] }],
    tooltip: { trigger: 'axis' },
  }}
  onEvents={{
    click: (params) => console.log('clicked', params),
    mouseover: (params) => console.log('hover', params.name),
  }}
/>`}
      >
        <EChart
          height={260}
          option={{
            xAxis: { type: 'category', data: ['Q1', 'Q2', 'Q3', 'Q4'] },
            yAxis: { type: 'value' },
            series: [
              {
                type: 'bar',
                data: [2.7, 3.9, 4.2, 5.3],
                itemStyle: { borderRadius: [6, 6, 0, 0] },
              },
            ],
            tooltip: { trigger: 'axis' },
          }}
          onEvents={{
            click: (params) => {
              const p = params as { name?: string; value?: number };
              // eslint-disable-next-line no-alert
              alert(`你点了 ${p.name}: ${p.value}k`);
            },
          }}
        />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'option', desc: 'ECharts 完整 option', type: 'object', default: '-' },
          {
            prop: 'height',
            desc: '图表高度 (px / string)',
            type: 'number | string',
            default: '360',
          },
          {
            prop: 'autoTheme',
            desc: '自动注入 Aurora 主题 (color 色板 + textStyle). 关掉则 option 原样渲染',
            type: 'boolean',
            default: 'true',
          },
          {
            prop: 'loading',
            desc: '加载态 (echarts showLoading)',
            type: 'boolean',
            default: 'false',
          },
          {
            prop: 'notMerge',
            desc: '是否全量替换旧 option (而不是合并)',
            type: 'boolean',
            default: 'true',
          },
          { prop: 'lazyUpdate', desc: '是否延迟更新', type: 'boolean', default: 'true' },
          {
            prop: 'onEvents',
            desc: 'ECharts 事件透传 (click / hover / legendselectchanged / datazoom 等)',
            type: 'Record<string, (params) => void>',
            default: '-',
          },
          {
            prop: 'onChartReady',
            desc: '图表实例创建后回调, 可拿到 echarts 实例做 dispatchAction',
            type: '(instance) => void',
            default: '-',
          },
          { prop: 'className', desc: '自定义 className', type: 'string', default: '-' },
          { prop: 'style', desc: '自定义 style', type: 'CSSProperties', default: '-' },
        ]}
      />

      <h2>为什么不做 preset / 包装组件</h2>
      <ol>
        <li>
          <strong>ECharts option 自己就是 DSL</strong> —— 包一层只会丢表达力,
          然后每加一个需求就给包装层加 if 分支
        </li>
        <li>
          <strong>声明式 option 复制粘贴最直观</strong> —— 看一眼 demo 就知道改哪行, 不用去翻 prop
          表猜行为
        </li>
        <li>
          <strong>主题做"软默认"而不是强制</strong> —— 不写主题, 自动跟 Aurora; 写了主题, option
          优先
        </li>
        <li>
          <strong>上层 KpiCard / Sparkline 等都是任务高度收敛的卡片组件</strong>, 不是 chart
          通用包装. 不要把这层逻辑下沉到通用包装里
        </li>
      </ol>
    </>
  );
};

export default EChartDoc;
