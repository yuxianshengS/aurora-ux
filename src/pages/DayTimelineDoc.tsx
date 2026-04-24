import React, { useState } from 'react';
import { DayTimeline } from '../components';
import type { DayTimelineStatus } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';
import Playground from '../site-components/Playground';

const DayTimelineDoc: React.FC = () => {
  return (
    <>
      <h1>DayTimeline 时间刻度</h1>
      <p>
        横向时间刻度 + 可拖动标点,支持 <code>hour</code> / <code>day</code> / <code>month</code> / <code>year</code> 四种粒度。
        轴起止点可自定义,既能做"24 小时内"的精确选择,也能做"跨日"、"跨年"的时刻选择。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法(24 小时)"
        description="不传任何 props,默认就是今天 00:00 → 明天 00:00,小时粒度,分钟精度。"
        code={`<DayTimeline onChange={(e) => console.log(e.label)} />`}
      >
        <BasicDemo />
      </DemoBlock>

      <DemoBlock
        title="自定义轴范围(跨天)"
        description="传 start / end 指定轴区间。比如'今天 15:00 到明天 15:00'。"
        code={`const today15 = new Date();
today15.setHours(15, 0, 0, 0);
const tomorrow15 = new Date(today15);
tomorrow15.setDate(tomorrow15.getDate() + 1);

<DayTimeline
  mode="hour"
  start={today15}
  end={tomorrow15}
/>`}
      >
        <CrossDayDemo />
      </DemoBlock>

      <DemoBlock
        title="day 模式(选日期)"
        description="mode='day' 让每天一个刻度,精度到小时。默认显示当月。"
        code={`<DayTimeline mode="day" />`}
      >
        <DayModeDemo />
      </DemoBlock>

      <DemoBlock
        title="month 模式(选月份)"
        description="mode='month' 每月一个刻度,默认显示当年 1-12 月。"
        code={`<DayTimeline mode="month" />`}
      >
        <MonthModeDemo />
      </DemoBlock>

      <DemoBlock
        title="year 模式(选年份)"
        description="mode='year' 每年一个刻度,默认显示当前年 ±5 年。"
        code={`<DayTimeline mode="year" />`}
      >
        <YearModeDemo />
      </DemoBlock>

      <DemoBlock
        title="状态标记"
        description="statusData 在轴上绘制一组彩色短线表示每个时刻的状态,点击短线可跳到对应时刻。value 可以传 Date, 也可以传分钟数(0-1439)。status 支持预设名、数字代码、CSS 颜色。"
        code={`<DayTimeline
  statusData={[
    { value: 120,  status: 'success' },  // 02:00
    { value: 420,  status: 'warning' },  // 07:00
    { value: 720,  status: 'danger'  },  // 12:00
    { value: 1080, status: 'success' },  // 18:00
  ]}
/>`}
      >
        <StatusDemo />
      </DemoBlock>

      <DemoBlock
        title="数据进度 (纯色)"
        description="dataEndAt 在轴上绘制一段浅色填充, 表达'数据已覆盖到此刻'。未传 statusData 时用主题色填充。"
        code={`const dataEndAt = new Date();
dataEndAt.setHours(14, 30, 0, 0);

<DayTimeline mode="hour" dataEndAt={dataEndAt} />`}
      >
        <DataEndDemo />
      </DemoBlock>

      <DemoBlock
        title="数据进度 (按状态着色)"
        description="同时传 dataEndAt 与 statusData 时, 进度条内部按 status 分段着色, 形成类似热力条的效果。每段延伸到下一个状态点。"
        code={`const dataEndAt = new Date();
dataEndAt.setHours(14, 30, 0, 0);

<DayTimeline
  mode="hour"
  dataEndAt={dataEndAt}
  statusData={[
    { value: 0,   status: 1 },
    { value: 120, status: 2 },
    { value: 180, status: 1 },
    { value: 420, status: 3 },
    { value: 480, status: 1 },
    { value: 720, status: 2 },
    { value: 800, status: 1 },
  ]}
/>`}
      >
        <DataHeatmapDemo />
      </DemoBlock>

      <DemoBlock
        title="自定义格式"
        description="通过 format 自定义标点上方的文本格式, 支持 YYYY / YY / MM / M / DD / D / HH / H / mm / m / ss / s 令牌, 也可直接传函数。"
        code={`// 字符串 (令牌)
<DayTimeline mode="day" format="YYYY/MM/DD" />

// 函数 (完全自定义)
<DayTimeline
  mode="hour"
  format={(d) => \`\${d.getHours()}时\${d.getMinutes()}分\`}
/>`}
      >
        <FormatDemo />
      </DemoBlock>

      <DemoBlock
        title="受控模式"
        description="传 value + onChange 即可把状态提升到父组件。"
        code={`const [v, setV] = useState<Date | undefined>();

<DayTimeline value={v} onChange={(e) => setV(e.date)} />`}
      >
        <ControlledDemo />
      </DemoBlock>

      <h2>交互式调试</h2>
      <Playground
        title="实时调整 DayTimeline 属性"
        description="可调整 mode、format、height、起止点、数据进度、状态数据等。defaultValue / dataEndAt / start / end 用 HH:MM 形式填写(解释为今天的那个时刻);留空则使用默认。withStatus / colored 切换预设状态数据与按状态着色。"
        componentName="DayTimeline"
        component={PlaygroundWrapper}
        controls={[
          {
            name: 'mode',
            type: 'select',
            options: ['hour', 'day', 'month', 'year'],
            default: 'hour',
          },
          { name: 'format', type: 'text', default: '', label: 'format (令牌/留空)' },
          { name: 'height', type: 'text', default: '60', label: 'height (px)' },
          { name: 'start', type: 'text', default: '', label: 'start (HH:MM)' },
          { name: 'end', type: 'text', default: '', label: 'end (HH:MM,≤start 视为次日)' },
          { name: 'defaultValue', type: 'text', default: '', label: 'defaultValue (HH:MM)' },
          { name: 'dataEndAt', type: 'text', default: '', label: 'dataEndAt (HH:MM)' },
          { name: 'withStatus', type: 'boolean', default: false, label: 'withStatus (预设状态数据)' },
          { name: 'colored', type: 'boolean', default: false, label: 'colored (进度按状态着色)' },
        ]}
      />

      <h2>API</h2>

      <h3>DayTimeline</h3>
      <ApiTable
        rows={[
          {
            prop: 'mode',
            desc: '刻度粒度',
            type: `'hour' | 'day' | 'month' | 'year'`,
            default: `'hour'`,
          },
          {
            prop: 'start',
            desc: '轴起点',
            type: 'Date',
            default: '按 mode 推导',
          },
          {
            prop: 'end',
            desc: '轴终点',
            type: 'Date',
            default: '按 mode 推导',
          },
          {
            prop: 'value',
            desc: '受控模式的当前标点',
            type: 'Date',
            default: '-',
          },
          {
            prop: 'defaultValue',
            desc: '非受控模式的初始标点',
            type: 'Date',
            default: '当前时刻',
          },
          {
            prop: 'onChange',
            desc: '标点变化 (拖动中持续触发)',
            type: '(p: { date: Date; label: string }) => void',
            default: '-',
          },
          {
            prop: 'onChangeComplete',
            desc: '拖动结束 / 单击选取时触发一次, 适合做请求、弹提示',
            type: '(p: { date: Date; label: string }) => void',
            default: '-',
          },
          {
            prop: 'statusData',
            desc: '轴上的状态标记',
            type: 'DayTimelineStatus[]',
            default: '-',
          },
          {
            prop: 'statusColors',
            desc: '状态代码 → 颜色的映射表; status 为数字/自定义字符串时查此表',
            type: 'Record<string | number, string>',
            default: `{ 1: 'success', 2: 'warning', 3: 'danger' }`,
          },
          {
            prop: 'dataEndAt',
            desc: '数据覆盖到的时刻; 从 start 到此处绘制浅色填充区段',
            type: 'Date',
            default: '-',
          },
          {
            prop: 'format',
            desc: '标点文本格式; 字符串支持 YYYY/YY/MM/M/DD/D/HH/H/mm/m/ss/s 令牌; 也可传函数',
            type: 'string | ((d: Date) => string)',
            default: '按 mode 推导',
          },
          {
            prop: 'height',
            desc: 'SVG 高度 (px)',
            type: 'number',
            default: '60',
          },
        ]}
      />

      <h3>不同模式下的默认轴范围</h3>
      <ApiTable
        rows={[
          { prop: 'hour',  desc: '24 小时',   type: '今天 00:00 → 明天 00:00', default: '' },
          { prop: 'day',   desc: '当月',       type: '本月 1 号 → 下月 1 号',   default: '' },
          { prop: 'month', desc: '当年',       type: '今年 1 月 → 明年 1 月',   default: '' },
          { prop: 'year',  desc: '当前年 ±5', type: '今年-5 → 今年+6',          default: '' },
        ]}
      />
    </>
  );
};

/* ------------------------- demos ------------------------- */

const BasicDemo: React.FC = () => {
  const [label, setLabel] = useState('(拖动试试)');
  return (
    <>
      <DayTimeline onChange={(e) => setLabel(e.label)} />
      <p style={{ marginTop: 12, color: 'var(--au-text-2)' }}>
        已选: <strong>{label}</strong>
      </p>
    </>
  );
};

const CrossDayDemo: React.FC = () => {
  const today15 = new Date();
  today15.setHours(15, 0, 0, 0);
  const tomorrow15 = new Date(today15);
  tomorrow15.setDate(tomorrow15.getDate() + 1);
  const [label, setLabel] = useState('');
  return (
    <>
      <DayTimeline
        mode="hour"
        start={today15}
        end={tomorrow15}
        onChange={(e) => setLabel(e.label)}
      />
      <p style={{ marginTop: 12, color: 'var(--au-text-2)' }}>
        已选: <strong>{label || '拖动标点'}</strong>
      </p>
    </>
  );
};

const DayModeDemo: React.FC = () => {
  const [label, setLabel] = useState('');
  return (
    <>
      <DayTimeline mode="day" onChange={(e) => setLabel(e.label)} />
      <p style={{ marginTop: 12, color: 'var(--au-text-2)' }}>
        已选: <strong>{label || '拖动试试'}</strong>
      </p>
    </>
  );
};

const MonthModeDemo: React.FC = () => {
  const [label, setLabel] = useState('');
  return (
    <>
      <DayTimeline mode="month" onChange={(e) => setLabel(e.label)} />
      <p style={{ marginTop: 12, color: 'var(--au-text-2)' }}>
        已选: <strong>{label || '拖动试试'}</strong>
      </p>
    </>
  );
};

const YearModeDemo: React.FC = () => {
  const [label, setLabel] = useState('');
  return (
    <>
      <DayTimeline mode="year" onChange={(e) => setLabel(e.label)} />
      <p style={{ marginTop: 12, color: 'var(--au-text-2)' }}>
        已选: <strong>{label || '拖动试试'}</strong>
      </p>
    </>
  );
};

const StatusDemo: React.FC = () => {
  const data: DayTimelineStatus[] = [
    { value: 120,  status: 'success' },
    { value: 420,  status: 'warning' },
    { value: 720,  status: 'danger' },
    { value: 1080, status: 'success' },
    { value: 1320, status: 'warning' },
  ];
  return <DayTimeline statusData={data} />;
};

const DataEndDemo: React.FC = () => {
  const dataEndAt = new Date();
  dataEndAt.setHours(14, 30, 0, 0);
  return <DayTimeline mode="hour" dataEndAt={dataEndAt} />;
};

const DataHeatmapDemo: React.FC = () => {
  const dataEndAt = new Date();
  dataEndAt.setHours(14, 30, 0, 0);
  const statusData: DayTimelineStatus[] = [
    { value: 0,   status: 1 },
    { value: 120, status: 2 },
    { value: 180, status: 1 },
    { value: 420, status: 3 },
    { value: 480, status: 1 },
    { value: 720, status: 2 },
    { value: 800, status: 1 },
  ];
  return (
    <DayTimeline
      mode="hour"
      dataEndAt={dataEndAt}
      statusData={statusData}
    />
  );
};

const FormatDemo: React.FC = () => {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ fontSize: 13, color: 'var(--au-text-3)', marginBottom: 4 }}>
          format="YYYY/MM/DD"
        </div>
        <DayTimeline mode="day" format="YYYY/MM/DD" onChange={(e) => setA(e.label)} />
        <p style={{ color: 'var(--au-text-2)' }}>已选: <strong>{a || '拖动'}</strong></p>
      </div>
      <div>
        <div style={{ fontSize: 13, color: 'var(--au-text-3)', marginBottom: 4 }}>
          format={'{(d) => `${d.getHours()}时${d.getMinutes()}分`}'}
        </div>
        <DayTimeline
          mode="hour"
          format={(d) => `${d.getHours()}时${d.getMinutes()}分`}
          onChange={(e) => setB(e.label)}
        />
        <p style={{ color: 'var(--au-text-2)' }}>已选: <strong>{b || '拖动'}</strong></p>
      </div>
    </div>
  );
};

const ControlledDemo: React.FC = () => {
  const [v, setV] = useState<Date | undefined>(() => {
    const d = new Date();
    d.setHours(8, 0, 0, 0);
    return d;
  });
  const jump = (h: number) => {
    const d = new Date();
    d.setHours(h, 0, 0, 0);
    setV(d);
  };
  return (
    <div>
      <DayTimeline value={v} onChange={(e) => setV(e.date)} />
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="au-btn" onClick={() => jump(0)}>00:00</button>
        <button className="au-btn" onClick={() => jump(12)}>12:00</button>
        <button className="au-btn" onClick={() => jump(18)}>18:00</button>
      </div>
    </div>
  );
};

/* ------------------------- playground adapter ------------------------- */

const PRESET_STATUS: DayTimelineStatus[] = [
  { value: 0,   status: 1 },
  { value: 180, status: 2 },
  { value: 360, status: 1 },
  { value: 540, status: 3 },
  { value: 720, status: 1 },
  { value: 900, status: 2 },
  { value: 1080, status: 1 },
];

function parseHM(s: unknown): Date | undefined {
  if (typeof s !== 'string') return undefined;
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return undefined;
  const d = new Date();
  d.setHours(+m[1], +m[2], 0, 0);
  return d;
}

interface WrapperProps {
  mode?: 'hour' | 'day' | 'month' | 'year';
  format?: string;
  height?: string;
  start?: string;
  end?: string;
  defaultValue?: string;
  dataEndAt?: string;
  withStatus?: boolean;
  colored?: boolean;
}

const PlaygroundWrapper: React.FC<WrapperProps> = ({
  mode,
  format,
  height,
  start,
  end,
  defaultValue,
  dataEndAt,
  withStatus,
  colored,
}) => {
  const h = Number(height);
  const statusData =
    withStatus || colored ? PRESET_STATUS : undefined;
  const dataEnd = colored
    ? parseHM(dataEndAt) ?? (() => { const d = new Date(); d.setHours(14, 30, 0, 0); return d; })()
    : parseHM(dataEndAt);
  const startDate = parseHM(start);
  let endDate = parseHM(end);
  // 跨天: 若 end <= start, 则 end 推到次日 (例如 15:00 → 次日 15:00)
  if (startDate && endDate && endDate.getTime() <= startDate.getTime()) {
    endDate = new Date(endDate);
    endDate.setDate(endDate.getDate() + 1);
  }
  return (
    <DayTimeline
      mode={mode ?? 'hour'}
      format={format || undefined}
      height={Number.isFinite(h) && h > 0 ? h : undefined}
      start={startDate}
      end={endDate}
      defaultValue={parseHM(defaultValue)}
      dataEndAt={dataEnd}
      statusData={statusData}
    />
  );
};

export default DayTimelineDoc;
