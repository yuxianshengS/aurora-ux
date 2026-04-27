import React from 'react';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import Input from '../../components/Input';

/** palette 用的小图标 — 固定 15px, 跟随父级颜色 */
const Ico: React.FC<{ n: string }> = ({ n }) => <Icon name={n} size={15} />;
import InputNumber from '../../components/InputNumber';
import Select from '../../components/Select';
import Radio from '../../components/Radio';
import Checkbox from '../../components/Checkbox';
import Switch from '../../components/Switch';
import Slider from '../../components/Slider';
import DatePicker from '../../components/DatePicker';
import ThemeSwitch from '../../components/ThemeSwitch';
import Card from '../../components/Card';
import Tag from '../../components/Tag';
import Badge from '../../components/Badge';
import Avatar from '../../components/Avatar';
import Empty from '../../components/Empty';
import Table from '../../components/Table';
import Tabs from '../../components/Tabs';
import Pagination from '../../components/Pagination';
import Wallet from '../../components/Wallet';
import Timeline from '../../components/Timeline';
import DayTimeline from '../../components/DayTimeline';
import Alert from '../../components/Alert';
import Spin from '../../components/Spin';
import KpiCard from '../../components/KpiCard';
import Sparkline from '../../components/Sparkline';
import Gauge from '../../components/Gauge';
import Funnel from '../../components/Funnel';
import Heatmap from '../../components/Heatmap';
import ActivityFeed from '../../components/ActivityFeed';
import Bar3D from '../../components/Bar3D';
import Space from '../../components/Space';
import Divider from '../../components/Divider';
import Typewriter from '../../components/Typewriter';
import Flip from '../../components/Flip';
import Menu from '../../components/Menu';
import Breadcrumb from '../../components/Breadcrumb';
import Steps from '../../components/Steps';
import Form, { FormItem } from '../../components/Form';
import type { Rule } from '../../components/Form';
import Row from '../../components/Row';
import Flex from '../../components/Flex';
import Text from '../../components/Text';
import Split from '../../components/Split';
import Grid from '../../components/Grid';
import AuroraBg from '../../components/AuroraBg';
import NumberRoll from '../../components/NumberRoll';
import GradientText from '../../components/GradientText';
import GlowCard from '../../components/GlowCard';
import Layout from '../../components/Layout';
import Skeleton from '../../components/Skeleton';
import Statistic from '../../components/Statistic';
import Progress from '../../components/Progress';
import Description from '../../components/Description';
import Result from '../../components/Result';
import Upload from '../../components/Upload';
import Tree from '../../components/Tree';
import TreeSelect from '../../components/TreeSelect';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'select'
  | 'color'
  | 'json';

export type BlockCategory =
  | '通用'
  | '表单'
  | '数据录入'
  | '数据展示'
  | '反馈'
  | '可视化'
  | '布局'
  | '动效'
  | '导航'
  | '极光特效';

export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  options?: { label: string; value: string | number | boolean }[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  help?: string;
  asChildren?: boolean;
  /** 只在某些 props 条件下才显示该字段 (例: Grid 的 cols 只在 mode=fixed 显示) */
  visibleWhen?: (props: Record<string, unknown>) => boolean;
}

export interface BlockSchema {
  type: string;
  label: string;
  icon: React.ReactNode;
  category: BlockCategory;
  component: React.ElementType;
  defaultProps: Record<string, unknown>;
  fields: FieldSchema[];
  previewWrapperStyle?: React.CSSProperties;
  /** 容器块 (可接受子块) */
  isContainer?: boolean;
  /**
   * 容器块的具名插槽
   * - 静态数组: Layout 这种固定结构 ['header', 'sider', 'content', 'footer']
   * - 函数: Grid 这种动态(根据 cols×rows 生成 cell-0, cell-1, ...)
   * - 不传: 默认 ['default'] 单插槽 (Row)
   */
  slots?: string[] | ((props: Record<string, unknown>) => string[]);
  /** 每个 slot 的展示名 (用于画布上空插槽提示) */
  slotLabels?: Record<string, string>;
  /**
   * 可选: 自定义 JSX 序列化
   * 容器块的 slotJsx 映射: { slotName: 已序列化子块字符串, 子块本身已用 pad(indent + 1) 缩进好 }
   * indent: 当前块所在的嵌套层级 (每层 = 2 空格), 用来正确对齐闭合标签
   * hoister: 如果生成的代码需要把大数据提到 useState, 把数组/对象丢给 hoister 拿个变量名
   */
  serialize?: (
    props: Record<string, unknown>,
    slotJsx?: Record<string, string>,
    indent?: number,
    hoister?: Hoister,
  ) => { jsx: string; imports: string[] };
  /**
   * 可选: 预览渲染前对 props 做变换
   * 用于把 JSON 里的字符串/ISO 字符串 转换成组件真正需要的 ReactNode / Date
   * 例如: Menu 的 items[i].icon 从 "customer" 字符串转成 <Icon name="customer" />
   */
  transformProps?: (props: Record<string, unknown>) => Record<string, unknown>;
}

const sizeOptions = [
  { label: 'small', value: 'small' },
  { label: 'medium', value: 'medium' },
  { label: 'large', value: 'large' },
];
const smallMediumLarge = sizeOptions;

const tagColorOptions = [
  { label: 'default', value: 'default' },
  { label: 'primary', value: 'primary' },
  { label: 'success', value: 'success' },
  { label: 'warning', value: 'warning' },
  { label: 'danger', value: 'danger' },
  { label: 'info', value: 'info' },
  { label: 'purple', value: 'purple' },
  { label: 'magenta', value: 'magenta' },
  { label: 'cyan', value: 'cyan' },
];

const alertTypeOptions = [
  { label: 'info', value: 'info' },
  { label: 'success', value: 'success' },
  { label: 'warning', value: 'warning' },
  { label: 'error', value: 'error' },
];

const statusOptions = [
  { label: 'default', value: 'default' },
  { label: 'primary', value: 'primary' },
  { label: 'success', value: 'success' },
  { label: 'warning', value: 'warning' },
  { label: 'danger', value: 'danger' },
];

/* 常用示例数据 —— 复杂组件用,让拖进去立刻有好看的预览 */

const sampleTableColumns = [
  { title: '姓名', dataIndex: 'name' },
  { title: '年龄', dataIndex: 'age', align: 'right' as const, width: 80 },
  { title: '城市', dataIndex: 'city' },
];
const sampleTableData = [
  { key: 1, name: '余星辰', age: 28, city: '北京' },
  { key: 2, name: '林可', age: 34, city: '上海' },
  { key: 3, name: 'Mia', age: 22, city: '深圳' },
];

const sampleTabsItems = [
  { key: '1', label: '标签一', children: '标签一的内容' },
  { key: '2', label: '标签二', children: '标签二的内容' },
  { key: '3', label: '标签三', children: '标签三的内容' },
];

/** Menu 的 items 用字符串 icon (iconfont name), preview 通过 transformProps 转成 <Icon/> */
const sampleMenuItems = [
  { key: 'dashboard', label: '仪表盘', icon: 'charts-bar' },
  { key: 'orders', label: '订单', icon: 'order' },
  { key: 'users', label: '用户', icon: 'customer' },
];

/** 递归把 items 里形如 `icon: "name"` 的字符串转成 `<Icon name="name" />` */
const iconifyItems = <T extends Record<string, unknown>>(items: T[]): T[] =>
  items.map((it) => {
    const next: Record<string, unknown> = { ...it };
    if (typeof next.icon === 'string' && next.icon) {
      next.icon = <Icon name={next.icon as string} size={15} />;
    }
    if (Array.isArray(next.children)) {
      next.children = iconifyItems(next.children as Record<string, unknown>[]);
    }
    return next as T;
  });

const sampleBreadcrumbItems = [
  { title: '首页' },
  { title: '组件' },
  { title: 'PageBuilder' },
];

const sampleStepsItems = [
  { title: '登录', description: '填写账号' },
  { title: '验证', description: '短信验证码' },
  { title: '完成' },
];

const sampleTimelineItems = [
  { color: 'success' as const, children: '数据库切换完成', label: '10:42' },
  { color: 'primary' as const, children: 'v2.4.1 发布', label: '09:15' },
  { color: 'warning' as const, children: '异常登录', label: '03:02' },
];

/** ActivityFeed: time 用 ISO 字符串 (JSON 可序列化), preview 通过 transformProps 转回 Date */
const sampleActivityItems = [
  { id: 1, time: new Date(Date.now() - 60_000).toISOString(), title: '创建了订单 #2026-0419', type: 'primary', user: { name: '余星辰' } },
  { id: 2, time: new Date(Date.now() - 8 * 60_000).toISOString(), title: '审批通过', type: 'success', user: { name: 'Mia' } },
  { id: 3, time: new Date(Date.now() - 45 * 60_000).toISOString(), title: '异常登录', type: 'warning', user: { name: '系统' } },
];

const sampleWalletCards = [
  {
    brand: 'Visa',
    background: '#1e40af',
    label: 'Holder',
    value: 'YU XINGCHEN',
    masked: '**** 4242',
    number: '4242 1234 5678 9010',
  },
  {
    brand: 'Master',
    background: '#be185d',
    label: 'Holder',
    value: 'YU XINGCHEN',
    masked: '**** 8765',
    number: '5555 8765 4321 1234',
  },
];

/** DayTimeline: value 用 ISO 字符串, preview 通过 transformProps 转回 Date */
const sampleDayTimelineStatus = [
  { value: new Date(Date.now() - 3 * 3600_000).toISOString(), status: 'success' },
  { value: new Date(Date.now() - 2 * 3600_000).toISOString(), status: 'warning' },
  { value: new Date(Date.now() - 1 * 3600_000).toISOString(), status: 'danger' },
];

const sampleBar3D = {
  xCategories: ['Q1', 'Q2', 'Q3', 'Q4'],
  yCategories: ['北区', '南区', '东区'],
  data: [
    [48, 72, 56, 94],
    [30, 55, 48, 82],
    [42, 66, 70, 90],
  ],
};

const sampleFunnelData = [
  { label: '访问', value: 10000 },
  { label: '点击', value: 4200 },
  { label: '下单', value: 1850 },
  { label: '支付', value: 480 },
];

const sampleHeatmapData = (() => {
  const d: { date: string; value: number }[] = [];
  const end = new Date();
  for (let i = 0; i < 90; i++) {
    if (Math.random() < 0.3) continue;
    const dd = new Date(end.getTime() - i * 86400000);
    d.push({
      date: `${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, '0')}-${String(dd.getDate()).padStart(2, '0')}`,
      value: Math.floor(Math.random() * 10) + 1,
    });
  }
  return d;
})();

const samplePaginationTotal = 85;
const sampleSliderMarks = [
  { value: 0, label: '0' },
  { value: 50, label: '50' },
  { value: 100, label: '100' },
];

/* ---- 表单组合块 ---- */

/** 公共的 FormItem meta props (所有表单项块都有) */
interface FormMetaProps {
  _label?: React.ReactNode;
  _required?: boolean;
  _help?: React.ReactNode;
  _name?: string;
  _width?: number;
  /** 校验规则数组 (Rule[]) */
  _rules?: Array<Record<string, unknown>>;
}

/** 把 _ 前缀的元数据剥离,返回 { metaProps(FormItem 用), innerProps(子组件用) } */
const splitFormProps = (all: Record<string, unknown>) => {
  const meta: FormMetaProps = {};
  const inner: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(all)) {
    if (k === '_label') meta._label = v as React.ReactNode;
    else if (k === '_required') meta._required = v as boolean;
    else if (k === '_help') meta._help = v as React.ReactNode;
    else if (k === '_name') meta._name = v as string;
    else if (k === '_width') meta._width = Number(v) || undefined;
    else if (k === '_rules') meta._rules = Array.isArray(v) ? (v as Array<Record<string, unknown>>) : undefined;
    else inner[k] = v;
  }
  return { meta, inner };
};

/** 表单项通用的"校验规则"字段定义, 直接 spread 进 fields 数组复用 */
const rulesField = {
  key: '_rules',
  label: '校验规则',
  type: 'json' as const,
  help: '数组, 每项: { required?, message?, type?(string/number/email/url/integer/array/boolean), min?, max?, len?, pattern?(JSON 不支持正则, 需要时直接写在代码里), whitespace? }; 例: [{ type: "email", message: "邮箱格式错" }, { min: 6, message: "至少 6 位" }]',
};

/** 把 _required + _rules 合并成最终的 rules 数组 (_required 自动转成 { required: true, message }) */
const buildEffectiveRules = (meta: FormMetaProps): Array<Record<string, unknown>> => {
  const rules: Array<Record<string, unknown>> = [];
  if (meta._required) {
    rules.push({ required: true, message: `请填写${meta._label ?? '此字段'}` });
  }
  if (meta._rules && meta._rules.length > 0) {
    rules.push(...meta._rules);
  }
  return rules;
};

/** 通用的"表单项 + 内部组件"渲染 */
const makeFormFieldPreview = (
  Inner: React.ElementType,
): React.FC<Record<string, unknown>> => {
  const Cmp: React.FC<Record<string, unknown>> = (all) => {
    const { meta, inner } = splitFormProps(all);
    // _width 设了就把 width 注入 inner 组件的 style (覆盖 PageBuilder 的 100% 规则)
    const innerWithWidth =
      meta._width
        ? {
            ...inner,
            style: {
              ...((inner.style as React.CSSProperties) ?? {}),
              width: meta._width,
            },
          }
        : inner;
    const effectiveRules = buildEffectiveRules(meta);
    return (
      <FormItem
        label={meta._label}
        required={meta._required}
        help={meta._help}
        name={meta._name}
        rules={effectiveRules.length > 0 ? (effectiveRules as Rule[]) : undefined}
      >
        <Inner {...innerWithWidth} />
      </FormItem>
    );
  };
  return Cmp;
};

/** 组合块通用的 JSX 序列化: <Form.Item ...><X ... /></Form.Item> */
const serializeFormField = (innerTag: string) => (
  all: Record<string, unknown>,
  _slotJsx?: Record<string, string>,
  indent: number = 2,
  hoister?: Hoister,
): { jsx: string; imports: string[] } => {
  const { meta, inner } = splitFormProps(all);
  const itemAttrs: string[] = [];
  if (meta._label != null && meta._label !== '') itemAttrs.push(`label="${String(meta._label)}"`);
  if (meta._name) itemAttrs.push(`name="${meta._name}"`);
  if (meta._help) itemAttrs.push(`help="${String(meta._help)}"`);
  // _required + _rules 合并输出成 rules 数组 (而不是单独的 required prop, 这样真校验生效)
  const effectiveRules = buildEffectiveRules(meta);
  if (effectiveRules.length > 0) {
    itemAttrs.push(`rules={${JSON.stringify(effectiveRules, null, 2)}}`);
  }
  const itemAttrStr = itemAttrs.length ? ' ' + itemAttrs.join(' ') : '';

  const innerAttrs: string[] = [];
  for (const [k, v] of Object.entries(inner)) {
    if (v === undefined || v === null || v === '' || v === false) continue;
    if (v === true) innerAttrs.push(k);
    else if (typeof v === 'string') innerAttrs.push(`${k}="${v.replace(/"/g, '&quot;')}"`);
    else if (typeof v === 'number') innerAttrs.push(`${k}={${v}}`);
    else if (React.isValidElement(v))
      innerAttrs.push(`${k}={/* ReactNode — 代码里填入 */}`);
    else if (Array.isArray(v) || typeof v === 'object') {
      if (hoister) {
        const name = hoister.allocate(innerTag, k, v);
        innerAttrs.push(`${k}={${name}}`);
      } else {
        innerAttrs.push(`${k}={${JSON.stringify(v, null, 2)}}`);
      }
    }
  }
  if (meta._width) {
    innerAttrs.push(`style={{ width: ${meta._width} }}`);
  }
  const innerAttrStr = innerAttrs.length ? ' ' + innerAttrs.join(' ') : '';

  const inPad = pad(indent + 1);
  const outPad = pad(indent);
  return {
    jsx: `<Form.Item${itemAttrStr}>\n${inPad}<${innerTag}${innerAttrStr} />\n${outPad}</Form.Item>`,
    imports: ['Form', innerTag.split('.')[0]],
  };
};

export const REGISTRY: BlockSchema[] = [
  /* ---------- 极光特效 ---------- */
  {
    type: 'AuroraBg',
    label: 'AuroraBg 极光背景',
    icon: <Ico n="scenes" />,
    category: '极光特效',
    component: AuroraBg,
    isContainer: true,
    slots: ['default'],
    slotLabels: { default: '把 Hero / Card / Text 拖进来叠在极光上' },
    defaultProps: {
      preset: 'aurora',
      blur: 100,
      speed: 1,
      intensity: 0.7,
      grain: true,
      _minHeight: 280,
    },
    previewWrapperStyle: { width: '100%' },
    transformProps: (props) => {
      const { _minHeight, style: oldStyle, ...rest } = props;
      const style: React.CSSProperties = {
        ...((oldStyle as React.CSSProperties) ?? {}),
        borderRadius: 16,
      };
      if (typeof _minHeight === 'number') style.minHeight = _minHeight;
      return { ...rest, style };
    },
    fields: [
      {
        key: 'preset',
        label: '预设配色',
        type: 'select',
        options: [
          { label: 'aurora 极光 (蓝紫青绿粉)', value: 'aurora' },
          { label: 'sunset 日落 (橙红紫黄)', value: 'sunset' },
          { label: 'ocean 深海 (蓝青)', value: 'ocean' },
          { label: 'forest 森林 (绿青)', value: 'forest' },
          { label: 'cosmic 星宇 (深紫粉黄)', value: 'cosmic' },
        ],
      },
      {
        key: 'colors',
        label: '自定义颜色 (覆盖预设)',
        type: 'json',
        help: '字符串数组, 4-6 个最佳; 例: ["#6366f1", "#a855f7", "#22d3ee"]',
      },
      { key: 'blur', label: '模糊度 (px)', type: 'number', min: 20, max: 200 },
      { key: 'speed', label: '速度倍率', type: 'number', min: 0.3, max: 3, step: 0.1 },
      { key: 'intensity', label: '强度 0-1', type: 'number', min: 0.1, max: 1, step: 0.05 },
      { key: 'grain', label: '颗粒纹理', type: 'boolean' },
      {
        key: '_minHeight',
        label: '容器最小高度 (px)',
        type: 'number',
        min: 80,
        max: 1200,
        step: 20,
      },
    ],
    serialize: (props, slotJsx, indent = 2) => {
      const attrs: string[] = [];
      if (props.preset && props.preset !== 'aurora') attrs.push(`preset="${props.preset}"`);
      if (Array.isArray(props.colors) && props.colors.length > 0)
        attrs.push(`colors={${JSON.stringify(props.colors)}}`);
      if (typeof props.blur === 'number' && props.blur !== 100) attrs.push(`blur={${props.blur}}`);
      if (typeof props.speed === 'number' && props.speed !== 1) attrs.push(`speed={${props.speed}}`);
      if (typeof props.intensity === 'number' && props.intensity !== 0.7)
        attrs.push(`intensity={${props.intensity}}`);
      if (props.grain === false) attrs.push('grain={false}');
      const styleParts: string[] = ['borderRadius: 16'];
      if (typeof props._minHeight === 'number') styleParts.push(`minHeight: ${props._minHeight}`);
      attrs.push(`style={{ ${styleParts.join(', ')} }}`);
      const attrStr = ' ' + attrs.join(' ');
      const inPad = pad(indent + 1);
      const outPad = pad(indent);
      const inner = slotJsx?.default;
      if (!inner) {
        return {
          jsx: `<AuroraBg${attrStr} />`,
          imports: ['AuroraBg'],
        };
      }
      return {
        jsx: `<AuroraBg${attrStr}>\n${inner}\n${outPad}</AuroraBg>`,
        imports: ['AuroraBg'],
      };
    },
  },
  {
    type: 'GradientText',
    label: 'GradientText 渐变文字',
    icon: <Ico n="editor-text" />,
    category: '极光特效',
    component: GradientText,
    defaultProps: {
      children: '欢迎来到 Aurora UI',
      preset: 'aurora',
      animate: true,
      duration: 6,
      angle: 90,
      size: 48,
      weight: 700,
    },
    previewWrapperStyle: { width: '100%' },
    fields: [
      { key: 'children', label: '文字内容', type: 'text', asChildren: true },
      {
        key: 'preset',
        label: '预设配色',
        type: 'select',
        options: [
          { label: 'aurora 极光', value: 'aurora' },
          { label: 'sunset 日落', value: 'sunset' },
          { label: 'ocean 深海', value: 'ocean' },
          { label: 'forest 森林', value: 'forest' },
          { label: 'cosmic 星宇', value: 'cosmic' },
          { label: 'metal 金属', value: 'metal' },
        ],
      },
      {
        key: 'colors',
        label: '自定义颜色 (覆盖预设)',
        type: 'json',
        help: '字符串数组, 例: ["#22d3ee", "#a855f7", "#22d3ee"]',
      },
      { key: 'animate', label: '流动动画', type: 'boolean' },
      { key: 'duration', label: '动画一周时长 (s)', type: 'number', min: 1, max: 30, step: 0.5 },
      { key: 'angle', label: '渐变方向 (deg)', type: 'number', min: 0, max: 360 },
      { key: 'size', label: '字号 (px)', type: 'number', min: 12, max: 200 },
      {
        key: 'weight',
        label: '字重',
        type: 'select',
        options: [
          { label: 'normal (400)', value: 400 },
          { label: 'medium (500)', value: 500 },
          { label: 'semibold (600)', value: 600 },
          { label: 'bold (700)', value: 700 },
          { label: 'black (800)', value: 800 },
        ],
      },
      {
        key: 'as',
        label: '渲染元素',
        type: 'select',
        options: [
          { label: 'span (行内)', value: 'span' },
          { label: 'div', value: 'div' },
          { label: 'h1', value: 'h1' },
          { label: 'h2', value: 'h2' },
          { label: 'h3', value: 'h3' },
        ],
      },
    ],
  },
  {
    type: 'NumberRoll',
    label: 'NumberRoll 数字滚动',
    icon: <Ico n="calculator" />,
    category: '极光特效',
    component: NumberRoll,
    defaultProps: {
      value: 1284560,
      size: 56,
      weight: 700,
      precision: 0,
      thousandSeparator: true,
    },
    previewWrapperStyle: { width: '100%' },
    fields: [
      { key: 'value', label: '目标数字', type: 'number' },
      { key: 'precision', label: '小数位', type: 'number', min: 0, max: 8 },
      { key: 'thousandSeparator', label: '千分位逗号', type: 'boolean' },
      { key: 'size', label: '字号 (px)', type: 'number', min: 12, max: 200 },
      {
        key: 'weight',
        label: '字重',
        type: 'select',
        options: [
          { label: 'normal (400)', value: 400 },
          { label: 'medium (500)', value: 500 },
          { label: 'semibold (600)', value: 600 },
          { label: 'bold (700)', value: 700 },
        ],
      },
      { key: 'color', label: '颜色', type: 'color' },
      { key: 'duration', label: '滚动时长 (ms)', type: 'number', min: 100, max: 3000 },
      { key: 'stagger', label: '位间延迟 (ms)', type: 'number', min: 0, max: 500 },
      { key: 'prefix', label: '前缀', type: 'text' },
      { key: 'suffix', label: '后缀', type: 'text' },
    ],
  },
  {
    type: 'GlowCard',
    label: 'GlowCard 发光卡片',
    icon: <Ico n="card" />,
    category: '极光特效',
    component: GlowCard,
    isContainer: true,
    slots: ['default'],
    slotLabels: { default: '把任意组件拖进发光卡片里' },
    defaultProps: {
      glowColor: '#7c3aed',
      glowSize: 240,
      intensity: 0.6,
      border: true,
      radius: 16,
      padding: 24,
    },
    previewWrapperStyle: { width: '100%' },
    fields: [
      { key: 'glowColor', label: '光晕颜色', type: 'color' },
      { key: 'glowSize', label: '光晕直径 (px)', type: 'number', min: 80, max: 600 },
      { key: 'intensity', label: '光晕强度 0-1', type: 'number', min: 0.1, max: 1, step: 0.05 },
      { key: 'border', label: '旋转描边', type: 'boolean' },
      { key: 'radius', label: '圆角 (px)', type: 'number', min: 0, max: 48 },
      { key: 'padding', label: '内边距 (px)', type: 'number', min: 0, max: 80 },
    ],
    serialize: (props, slotJsx, indent = 2) => {
      const attrs: string[] = [];
      if (props.glowColor && props.glowColor !== 'var(--au-primary, #5b8def)')
        attrs.push(`glowColor="${props.glowColor}"`);
      if (typeof props.glowSize === 'number' && props.glowSize !== 240)
        attrs.push(`glowSize={${props.glowSize}}`);
      if (typeof props.intensity === 'number' && props.intensity !== 0.6)
        attrs.push(`intensity={${props.intensity}}`);
      if (props.border === false) attrs.push('border={false}');
      if (typeof props.radius === 'number' && props.radius !== 16)
        attrs.push(`radius={${props.radius}}`);
      if (typeof props.padding === 'number' && props.padding !== 24)
        attrs.push(`padding={${props.padding}}`);
      const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';
      const inPad = pad(indent + 1);
      const outPad = pad(indent);
      const inner = slotJsx?.default ?? `${inPad}{/* 内容 */}`;
      return {
        jsx: `<GlowCard${attrStr}>\n${inner}\n${outPad}</GlowCard>`,
        imports: ['GlowCard'],
      };
    },
  },

  /* ---------- 通用 ---------- */
  {
    type: 'Text',
    label: 'Text 文本',
    icon: <Ico n="editor-text" />,
    category: '通用',
    component: Text,
    defaultProps: {
      content: '这是一段文本, 点右侧属性面板可改样式',
      variant: 'body',
    },
    previewWrapperStyle: { width: '100%' },
    fields: [
      { key: 'content', label: '文本内容', type: 'textarea', asChildren: true },
      {
        key: 'variant',
        label: '变体',
        type: 'select',
        options: [
          { label: 'h1 (主标题)', value: 'h1' },
          { label: 'h2 (副标题)', value: 'h2' },
          { label: 'h3 (小节)', value: 'h3' },
          { label: 'h4 (强调)', value: 'h4' },
          { label: 'body (正文)', value: 'body' },
          { label: 'caption (辅助说明)', value: 'caption' },
        ],
      },
      {
        key: 'weight',
        label: '字重',
        type: 'select',
        options: [
          { label: 'normal (400)', value: 'normal' },
          { label: 'medium (500)', value: 'medium' },
          { label: 'semibold (600)', value: 'semibold' },
          { label: 'bold (700)', value: 'bold' },
        ],
      },
      {
        key: 'align',
        label: '对齐',
        type: 'select',
        options: [
          { label: '左对齐', value: 'left' },
          { label: '居中', value: 'center' },
          { label: '右对齐', value: 'right' },
          { label: '两端对齐', value: 'justify' },
        ],
      },
      {
        key: 'color',
        label: '颜色',
        type: 'select',
        options: [
          { label: '主文本', value: 'default' },
          { label: '次文本 (灰)', value: 'secondary' },
          { label: '弱文本 (更灰)', value: 'tertiary' },
          { label: '主色', value: 'primary' },
          { label: '成功色 (绿)', value: 'success' },
          { label: '警告色 (橙)', value: 'warning' },
          { label: '危险色 (红)', value: 'danger' },
        ],
      },
      { key: 'size', label: '字号 (px)', type: 'number', min: 10, max: 96, help: '覆盖变体默认字号' },
      {
        key: 'lineHeight',
        label: '行高',
        type: 'number',
        min: 1,
        max: 3,
        step: 0.1,
        help: '1.5 / 1.6 这种相对值',
      },
      { key: 'italic', label: '斜体', type: 'boolean' },
      { key: 'underline', label: '下划线', type: 'boolean' },
      { key: 'strikethrough', label: '删除线', type: 'boolean' },
      {
        key: 'truncate',
        label: '截断省略',
        type: 'number',
        min: 0,
        max: 10,
        help: '0 = 关闭; 1 = 单行省略号; 2/3/4… = 多行截断',
      },
    ],
  },
  {
    type: 'Button',
    label: 'Button 按钮',
    icon: <Ico n="click" />,
    category: '通用',
    component: Button,
    defaultProps: { type: 'primary', size: 'medium', children: '点击我' },
    fields: [
      { key: 'children', label: '文案', type: 'text', asChildren: true },
      {
        key: 'type',
        label: '类型',
        type: 'select',
        options: [
          { label: 'default', value: 'default' },
          { label: 'primary', value: 'primary' },
          { label: 'dashed', value: 'dashed' },
          { label: 'ghost', value: 'ghost' },
          { label: 'danger', value: 'danger' },
        ],
      },
      { key: 'size', label: '尺寸', type: 'select', options: sizeOptions },
      { key: 'block', label: '块级', type: 'boolean' },
      { key: 'disabled', label: '禁用', type: 'boolean' },
      { key: 'loading', label: '加载', type: 'boolean' },
    ],
  },
  {
    type: 'Icon',
    label: 'Icon 图标',
    icon: <Ico n="scenes" />,
    category: '通用',
    component: Icon,
    defaultProps: { name: 'heart', size: 24 },
    fields: [
      { key: 'name', label: '图标 name', type: 'text', placeholder: 'lock / heart / ...' },
      { key: 'size', label: '尺寸 (px)', type: 'number', min: 12, max: 96 },
      { key: 'color', label: '颜色', type: 'color' },
      { key: 'spin', label: '旋转动画', type: 'boolean' },
      { key: 'rotate', label: '旋转角度', type: 'number', min: 0, max: 360 },
    ],
  },

  /* ---------- 表单 (Form 是容器, 内部往里拖 FormItem.*) ---------- */
  {
    type: 'Form',
    label: 'Form 表单容器',
    icon: <Ico n="catalog" />,
    category: '表单',
    component: Form,
    isContainer: true,
    slots: ['default'],
    defaultProps: {
      layout: 'horizontal',
      labelWidth: 96,
      labelAlign: 'right',
      colon: true,
      size: 'medium',
    },
    previewWrapperStyle: { width: '100%' },
    fields: [
      {
        key: 'layout',
        label: '布局',
        type: 'select',
        options: [
          { label: 'horizontal (水平)', value: 'horizontal' },
          { label: 'vertical (垂直)', value: 'vertical' },
          { label: 'inline (行内)', value: 'inline' },
        ],
      },
      { key: 'labelWidth', label: 'Label 宽度 (px)', type: 'number', min: 0, max: 240 },
      {
        key: 'labelAlign',
        label: 'Label 对齐',
        type: 'select',
        options: [
          { label: 'right (右)', value: 'right' },
          { label: 'left (左)', value: 'left' },
        ],
      },
      { key: 'colon', label: '显示冒号', type: 'boolean' },
      { key: 'size', label: '尺寸', type: 'select', options: sizeOptions },
    ],
    serialize: (props, slotJsx, indent = 2) => {
      const attrs: string[] = [];
      if (props.layout && props.layout !== 'horizontal') attrs.push(`layout="${props.layout}"`);
      if (typeof props.labelWidth === 'number' && props.labelWidth !== 96)
        attrs.push(`labelWidth={${props.labelWidth}}`);
      if (props.labelAlign && props.labelAlign !== 'right') attrs.push(`labelAlign="${props.labelAlign}"`);
      if (props.colon === false) attrs.push('colon={false}');
      if (props.size && props.size !== 'medium') attrs.push(`size="${props.size}"`);
      const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';
      const inPad = pad(indent + 1);
      const outPad = pad(indent);
      const inner = slotJsx?.default ?? `${inPad}{/* 把 FormItem 拖进来 */}`;
      return {
        jsx: `<Form${attrStr}>\n${inner}\n${outPad}</Form>`,
        imports: ['Form'],
      };
    },
  },
  {
    type: 'FormItem.Input',
    label: '输入框',
    icon: <Ico n="edit" />,
    category: '表单',
    component: makeFormFieldPreview(Input),
    defaultProps: {
      _label: '姓名',
      _required: true,
      _name: 'name',
      placeholder: '请输入',
    },
    previewWrapperStyle: { width: '100%', maxWidth: 480 },
    fields: [
      { key: '_label', label: 'Label', type: 'text' },
      { key: '_name', label: '字段 name', type: 'text' },
      { key: '_required', label: '必填', type: 'boolean' },
      { key: '_help', label: '帮助文字', type: 'text' },
      { key: '_width', label: '输入框宽度 (px)', type: 'number', min: 60, max: 800, help: '不设则填满所在 cell' },
      rulesField,
      { key: 'placeholder', label: '占位', type: 'text' },
      { key: 'size', label: '尺寸', type: 'select', options: sizeOptions },
      { key: 'disabled', label: '禁用', type: 'boolean' },
    ],
    serialize: serializeFormField('Input'),
  },
  {
    type: 'FormItem.InputNumber',
    label: '数字输入',
    icon: <Ico n="calculator" />,
    category: '表单',
    component: makeFormFieldPreview(InputNumber),
    defaultProps: {
      _label: '数量',
      _required: true,
      _name: 'quantity',
      defaultValue: 1,
      min: 0,
      max: 999,
    },
    previewWrapperStyle: { width: '100%', maxWidth: 480 },
    fields: [
      { key: '_label', label: 'Label', type: 'text' },
      { key: '_name', label: '字段 name', type: 'text' },
      { key: '_required', label: '必填', type: 'boolean' },
      { key: '_help', label: '帮助文字', type: 'text' },
      { key: '_width', label: '输入框宽度 (px)', type: 'number', min: 60, max: 800, help: '不设则填满所在 cell' },
      rulesField,
      { key: 'defaultValue', label: '默认值', type: 'number' },
      { key: 'min', label: '最小', type: 'number' },
      { key: 'max', label: '最大', type: 'number' },
      { key: 'step', label: '步长', type: 'number' },
      { key: 'prefix', label: '前缀', type: 'text' },
      { key: 'suffix', label: '后缀', type: 'text' },
    ],
    serialize: serializeFormField('InputNumber'),
  },
  {
    type: 'FormItem.Select',
    label: '选择器',
    icon: <Ico n="list" />,
    category: '表单',
    component: makeFormFieldPreview(Select),
    defaultProps: {
      _label: '城市',
      _required: true,
      _name: 'city',
      placeholder: '请选择',
      options: [
        { label: '北京', value: 'bj' },
        { label: '上海', value: 'sh' },
        { label: '广州', value: 'gz' },
      ],
    },
    previewWrapperStyle: { width: '100%', maxWidth: 480 },
    fields: [
      { key: '_label', label: 'Label', type: 'text' },
      { key: '_name', label: '字段 name', type: 'text' },
      { key: '_required', label: '必填', type: 'boolean' },
      { key: '_help', label: '帮助文字', type: 'text' },
      { key: '_width', label: '输入框宽度 (px)', type: 'number', min: 60, max: 800, help: '不设则填满所在 cell' },
      rulesField,
      {
        key: 'options',
        label: '选项',
        type: 'json',
        help: '每项: { label, value, disabled? }',
      },
      { key: 'placeholder', label: '占位', type: 'text' },
      { key: 'allowClear', label: '可清除', type: 'boolean' },
      { key: 'multiple', label: '多选', type: 'boolean' },
      { key: 'filterable', label: '可搜索', type: 'boolean' },
    ],
    serialize: serializeFormField('Select'),
  },
  {
    type: 'FormItem.Switch',
    label: '开关',
    icon: <Ico n="change" />,
    category: '表单',
    component: makeFormFieldPreview(Switch),
    defaultProps: {
      _label: '订阅推送',
      _name: 'subscribed',
      defaultChecked: true,
    },
    previewWrapperStyle: { width: '100%', maxWidth: 480 },
    fields: [
      { key: '_label', label: 'Label', type: 'text' },
      { key: '_name', label: '字段 name', type: 'text' },
      { key: '_help', label: '帮助文字', type: 'text' },
      { key: '_width', label: '输入框宽度 (px)', type: 'number', min: 60, max: 800, help: '不设则填满所在 cell' },
      rulesField,
      { key: 'defaultChecked', label: '默认开', type: 'boolean' },
      { key: 'disabled', label: '禁用', type: 'boolean' },
    ],
    serialize: serializeFormField('Switch'),
  },
  {
    type: 'FormItem.Slider',
    label: '滑块',
    icon: <Ico n="sorting" />,
    category: '表单',
    component: makeFormFieldPreview(Slider),
    defaultProps: {
      _label: '评分',
      _name: 'score',
      defaultValue: 60,
    },
    previewWrapperStyle: { width: '100%', maxWidth: 480 },
    fields: [
      { key: '_label', label: 'Label', type: 'text' },
      { key: '_name', label: '字段 name', type: 'text' },
      { key: '_help', label: '帮助文字', type: 'text' },
      { key: '_width', label: '输入框宽度 (px)', type: 'number', min: 60, max: 800, help: '不设则填满所在 cell' },
      rulesField,
      { key: 'defaultValue', label: '默认值', type: 'number' },
      { key: 'min', label: '最小', type: 'number' },
      { key: 'max', label: '最大', type: 'number' },
      { key: 'step', label: '步长', type: 'number' },
    ],
    serialize: serializeFormField('Slider'),
  },
  {
    type: 'FormItem.DatePicker',
    label: '日期',
    icon: <Ico n="calendar" />,
    category: '表单',
    component: makeFormFieldPreview(DatePicker),
    defaultProps: {
      _label: '出生日期',
      _required: true,
      _name: 'birthday',
      placeholder: '选择日期',
    },
    previewWrapperStyle: { width: '100%', maxWidth: 480 },
    fields: [
      { key: '_label', label: 'Label', type: 'text' },
      { key: '_name', label: '字段 name', type: 'text' },
      { key: '_required', label: '必填', type: 'boolean' },
      { key: '_help', label: '帮助文字', type: 'text' },
      { key: '_width', label: '输入框宽度 (px)', type: 'number', min: 60, max: 800, help: '不设则填满所在 cell' },
      rulesField,
      { key: 'placeholder', label: '占位', type: 'text' },
      {
        key: 'picker',
        label: '粒度',
        type: 'select',
        options: [
          { label: 'date', value: 'date' },
          { label: 'month', value: 'month' },
          { label: 'year', value: 'year' },
        ],
      },
    ],
    serialize: serializeFormField('DatePicker'),
  },
  {
    type: 'FormItem.Radio',
    label: '单选组',
    icon: <Ico n="selected" />,
    category: '表单',
    component: makeFormFieldPreview(Radio.Group),
    defaultProps: {
      _label: '性别',
      _required: true,
      _name: 'gender',
      defaultValue: 'm',
      options: [
        { label: '男', value: 'm' },
        { label: '女', value: 'f' },
        { label: '保密', value: 'x' },
      ],
    },
    previewWrapperStyle: { width: '100%', maxWidth: 480 },
    fields: [
      { key: '_label', label: 'Label', type: 'text' },
      { key: '_name', label: '字段 name', type: 'text' },
      { key: '_required', label: '必填', type: 'boolean' },
      { key: '_help', label: '帮助文字', type: 'text' },
      { key: '_width', label: '输入框宽度 (px)', type: 'number', min: 60, max: 800, help: '不设则填满所在 cell' },
      rulesField,
      {
        key: 'options',
        label: '选项',
        type: 'json',
        help: '每项: { label, value, disabled? }',
      },
      { key: 'defaultValue', label: '默认值', type: 'text' },
      {
        key: 'optionType',
        label: '样式',
        type: 'select',
        options: [
          { label: 'default', value: 'default' },
          { label: 'button', value: 'button' },
        ],
      },
    ],
    serialize: serializeFormField('Radio.Group'),
  },
  {
    type: 'FormItem.Checkbox',
    label: '多选组',
    icon: <Ico n="catalog-check" />,
    category: '表单',
    component: makeFormFieldPreview(Checkbox.Group),
    defaultProps: {
      _label: '兴趣爱好',
      _name: 'hobbies',
      _help: '可多选',
      defaultValue: ['read'],
      options: [
        { label: '阅读', value: 'read' },
        { label: '运动', value: 'sport' },
        { label: '音乐', value: 'music' },
      ],
    },
    previewWrapperStyle: { width: '100%', maxWidth: 480 },
    fields: [
      { key: '_label', label: 'Label', type: 'text' },
      { key: '_name', label: '字段 name', type: 'text' },
      { key: '_required', label: '必填', type: 'boolean' },
      { key: '_help', label: '帮助文字', type: 'text' },
      { key: '_width', label: '输入框宽度 (px)', type: 'number', min: 60, max: 800, help: '不设则填满所在 cell' },
      rulesField,
      {
        key: 'options',
        label: '选项',
        type: 'json',
        help: '每项: { label, value, disabled? }',
      },
      {
        key: 'defaultValue',
        label: '默认值 (数组)',
        type: 'json',
        help: '示例: ["read"]',
      },
    ],
    serialize: serializeFormField('Checkbox.Group'),
  },

  /* ---------- 数据录入 ---------- */
  {
    type: 'Input',
    label: 'Input 输入框',
    icon: <Ico n="edit" />,
    category: '数据录入',
    component: Input,
    defaultProps: { placeholder: '请输入…', size: 'medium', variant: 'outlined' },
    fields: [
      { key: 'placeholder', label: '占位', type: 'text' },
      {
        key: 'variant',
        label: '变体',
        type: 'select',
        options: [
          { label: 'outlined', value: 'outlined' },
          { label: 'underline', value: 'underline' },
          { label: 'floating', value: 'floating' },
        ],
      },
      { key: 'size', label: '尺寸', type: 'select', options: sizeOptions },
      { key: 'label', label: '标签 (floating)', type: 'text' },
      { key: 'disabled', label: '禁用', type: 'boolean' },
      { key: 'error', label: '错误态', type: 'boolean' },
    ],
  },
  {
    type: 'InputNumber',
    label: 'InputNumber 数字输入',
    icon: <Ico n="calculator" />,
    category: '数据录入',
    component: InputNumber,
    defaultProps: { defaultValue: 1, size: 'medium' },
    fields: [
      { key: 'defaultValue', label: '默认值', type: 'number' },
      { key: 'min', label: '最小', type: 'number' },
      { key: 'max', label: '最大', type: 'number' },
      { key: 'step', label: '步长', type: 'number' },
      { key: 'precision', label: '精度', type: 'number', min: 0, max: 4 },
      { key: 'prefix', label: '前缀', type: 'text' },
      { key: 'suffix', label: '后缀', type: 'text' },
      { key: 'size', label: '尺寸', type: 'select', options: sizeOptions },
      {
        key: 'controls',
        label: '控制样式',
        type: 'select',
        options: [
          { label: 'default', value: 'default' },
          { label: 'plus-minus', value: 'plus-minus' },
          { label: 'none', value: 'none' },
        ],
      },
      { key: 'disabled', label: '禁用', type: 'boolean' },
    ],
  },
  {
    type: 'Select',
    label: 'Select 选择器',
    icon: <Ico n="list" />,
    category: '数据录入',
    component: Select,
    defaultProps: {
      placeholder: '请选择',
      size: 'medium',
      options: [
        { label: '北京', value: 'bj' },
        { label: '上海', value: 'sh' },
        { label: '广州', value: 'gz' },
      ],
    },
    fields: [
      {
        key: 'options',
        label: '选项',
        type: 'json',
        help: '每项: { label, value, disabled? }',
      },
      { key: 'placeholder', label: '占位', type: 'text' },
      { key: 'size', label: '尺寸', type: 'select', options: sizeOptions },
      { key: 'allowClear', label: '可清除', type: 'boolean' },
      { key: 'multiple', label: '多选', type: 'boolean' },
      { key: 'filterable', label: '可搜索', type: 'boolean' },
      { key: 'disabled', label: '禁用', type: 'boolean' },
    ],
  },
  {
    type: 'Radio',
    label: 'Radio 单选 (单个)',
    icon: <Ico n="selected" />,
    category: '数据录入',
    component: Radio,
    defaultProps: { value: 'a', children: '选项 A', defaultChecked: true },
    fields: [
      { key: 'children', label: '文案', type: 'text', asChildren: true },
      { key: 'value', label: 'value', type: 'text', help: '提交时的值' },
      { key: 'defaultChecked', label: '默认选中', type: 'boolean' },
      { key: 'disabled', label: '禁用', type: 'boolean' },
      { key: 'name', label: 'name (同一组共用)', type: 'text' },
    ],
  },
  {
    type: 'Checkbox',
    label: 'Checkbox 复选 (单个)',
    icon: <Ico n="check" />,
    category: '数据录入',
    component: Checkbox,
    defaultProps: { value: 'a', children: '同意条款', defaultChecked: false },
    fields: [
      { key: 'children', label: '文案', type: 'text', asChildren: true },
      { key: 'value', label: 'value', type: 'text', help: 'Group 模式下提交的值' },
      { key: 'defaultChecked', label: '默认选中', type: 'boolean' },
      { key: 'indeterminate', label: '半选态', type: 'boolean' },
      { key: 'disabled', label: '禁用', type: 'boolean' },
    ],
  },
  {
    type: 'Radio.Group',
    label: 'Radio 单选组',
    icon: <Ico n="selected" />,
    category: '数据录入',
    component: Radio.Group,
    defaultProps: {
      defaultValue: 'a',
      options: [
        { label: '选项 A', value: 'a' },
        { label: '选项 B', value: 'b' },
        { label: '选项 C', value: 'c' },
      ],
    },
    fields: [
      {
        key: 'options',
        label: '选项',
        type: 'json',
        help: '每项: { label, value, disabled? }',
      },
      { key: 'defaultValue', label: '默认值', type: 'text' },
      {
        key: 'optionType',
        label: '样式',
        type: 'select',
        options: [
          { label: 'default', value: 'default' },
          { label: 'button', value: 'button' },
        ],
      },
      {
        key: 'direction',
        label: '方向',
        type: 'select',
        options: [
          { label: 'horizontal', value: 'horizontal' },
          { label: 'vertical', value: 'vertical' },
        ],
      },
      { key: 'size', label: '尺寸', type: 'select', options: sizeOptions },
      { key: 'disabled', label: '禁用', type: 'boolean' },
    ],
  },
  {
    type: 'Checkbox.Group',
    label: 'Checkbox 多选组',
    icon: <Ico n="catalog-check" />,
    category: '数据录入',
    component: Checkbox.Group,
    defaultProps: {
      defaultValue: ['a'],
      options: [
        { label: '阅读', value: 'a' },
        { label: '运动', value: 'b' },
        { label: '音乐', value: 'c' },
      ],
    },
    fields: [
      {
        key: 'options',
        label: '选项',
        type: 'json',
        help: '每项: { label, value, disabled? }',
      },
      {
        key: 'defaultValue',
        label: '默认值 (数组)',
        type: 'json',
        help: '示例: ["a"]',
      },
      {
        key: 'direction',
        label: '方向',
        type: 'select',
        options: [
          { label: 'horizontal', value: 'horizontal' },
          { label: 'vertical', value: 'vertical' },
        ],
      },
      { key: 'size', label: '尺寸', type: 'select', options: sizeOptions },
      { key: 'disabled', label: '禁用', type: 'boolean' },
    ],
  },
  {
    type: 'Switch',
    label: 'Switch 开关',
    icon: <Ico n="change" />,
    category: '数据录入',
    component: Switch,
    defaultProps: { defaultChecked: true },
    fields: [
      { key: 'defaultChecked', label: '默认开', type: 'boolean' },
      {
        key: 'size',
        label: '尺寸',
        type: 'select',
        options: [
          { label: 'small', value: 'small' },
          { label: 'medium', value: 'medium' },
        ],
      },
      { key: 'disabled', label: '禁用', type: 'boolean' },
    ],
  },
  {
    type: 'Slider',
    label: 'Slider 滑动输入',
    icon: <Ico n="sorting" />,
    category: '数据录入',
    component: Slider,
    defaultProps: { defaultValue: 40, marks: sampleSliderMarks },
    previewWrapperStyle: { width: '100%', padding: '6px 0' },
    fields: [
      { key: 'defaultValue', label: '默认值', type: 'number' },
      { key: 'min', label: '最小', type: 'number' },
      { key: 'max', label: '最大', type: 'number' },
      { key: 'step', label: '步长', type: 'number' },
      { key: 'range', label: '区间选择', type: 'boolean' },
      { key: 'vertical', label: '垂直', type: 'boolean' },
      { key: 'disabled', label: '禁用', type: 'boolean' },
    ],
  },
  {
    type: 'DatePicker',
    label: 'DatePicker 日期选择',
    icon: <Ico n="calendar" />,
    category: '数据录入',
    component: DatePicker,
    defaultProps: { placeholder: '选择日期' },
    fields: [
      { key: 'placeholder', label: '占位', type: 'text' },
      {
        key: 'picker',
        label: '粒度',
        type: 'select',
        options: [
          { label: 'date', value: 'date' },
          { label: 'month', value: 'month' },
          { label: 'year', value: 'year' },
          { label: 'week', value: 'week' },
          { label: 'quarter', value: 'quarter' },
          { label: 'time', value: 'time' },
        ],
      },
      { key: 'allowClear', label: '可清除', type: 'boolean' },
      { key: 'disabled', label: '禁用', type: 'boolean' },
    ],
  },
  {
    type: 'ThemeSwitch',
    label: 'ThemeSwitch 主题切换',
    icon: <Ico n="daytime-mode" />,
    category: '数据录入',
    component: ThemeSwitch,
    defaultProps: { size: 'medium' },
    fields: [
      {
        key: 'size',
        label: '尺寸',
        type: 'select',
        options: [
          { label: 'small', value: 'small' },
          { label: 'medium', value: 'medium' },
        ],
      },
    ],
  },
  {
    type: 'Upload',
    label: 'Upload 文件上传',
    icon: <Ico n="cloud-up" />,
    category: '数据录入',
    component: Upload,
    defaultProps: { listType: 'text', multiple: false },
    previewWrapperStyle: { width: '100%' },
    fields: [
      {
        key: 'listType',
        label: '展示形态',
        type: 'select',
        options: [
          { label: 'text (文字列表)', value: 'text' },
          { label: 'picture (缩略图)', value: 'picture' },
          { label: 'card (卡片网格)', value: 'card' },
          { label: 'drag (拖拽区)', value: 'drag' },
        ],
      },
      { key: 'accept', label: '接受类型', type: 'text', placeholder: 'image/* .pdf' },
      { key: 'multiple', label: '多选', type: 'boolean' },
      { key: 'maxSize', label: '单文件大小限制 (KB)', type: 'number', min: 1 },
      { key: 'showFileList', label: '显示文件列表', type: 'boolean' },
      { key: 'disabled', label: '禁用', type: 'boolean' },
    ],
  },
  {
    type: 'Tree',
    label: 'Tree 树形控件',
    icon: <Ico n="folder" />,
    category: '数据录入',
    component: Tree,
    defaultProps: {
      treeData: [
        { key: '1', title: '根目录', children: [
          { key: '1-1', title: '文档', children: [
            { key: '1-1-1', title: '产品规划.md' },
            { key: '1-1-2', title: '会议纪要.md' },
          ]},
          { key: '1-2', title: '资源' },
        ]},
        { key: '2', title: '其他' },
      ],
      defaultExpandedKeys: ['1', '1-1'],
      checkable: false,
      showLine: false,
    },
    previewWrapperStyle: { width: '100%' },
    fields: [
      { key: 'treeData', label: '节点数据', type: 'json', help: '每项: { key, title, children?, disabled? }' },
      { key: 'defaultExpandedKeys', label: '默认展开 (数组)', type: 'json' },
      { key: 'defaultExpandAll', label: '默认全展开', type: 'boolean' },
      { key: 'checkable', label: '显示复选框', type: 'boolean' },
      { key: 'multiple', label: '多选 (selectedKeys)', type: 'boolean' },
      { key: 'showLine', label: '显示连接线', type: 'boolean' },
      { key: 'blockNode', label: '整行可点', type: 'boolean' },
    ],
  },
  {
    type: 'TreeSelect',
    label: 'TreeSelect 树形选择器',
    icon: <Ico n="folder" />,
    category: '数据录入',
    component: TreeSelect,
    defaultProps: {
      treeData: [
        { key: 'parent', title: '父节点', children: [
          { key: 'a', title: '选项 A' },
          { key: 'b', title: '选项 B' },
        ]},
        { key: 'c', title: '选项 C' },
      ],
      placeholder: '请选择',
      treeDefaultExpandAll: true,
    },
    fields: [
      { key: 'treeData', label: '树数据', type: 'json', help: '同 Tree, { key, title, children? }' },
      { key: 'placeholder', label: '占位', type: 'text' },
      { key: 'treeDefaultExpandAll', label: '默认全展开', type: 'boolean' },
      { key: 'allowClear', label: '可清除', type: 'boolean' },
      { key: 'disabled', label: '禁用', type: 'boolean' },
    ],
  },

  /* ---------- 数据展示 ---------- */
  {
    type: 'Card',
    label: 'Card 卡片',
    icon: <Ico n="name-card" />,
    category: '数据展示',
    component: Card,
    defaultProps: { title: '卡片标题', children: '这里放卡片内容。' },
    previewWrapperStyle: { width: '100%' },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'children', label: '内容', type: 'textarea', asChildren: true },
      { key: 'hoverable', label: '悬浮抬升', type: 'boolean' },
      { key: 'bordered', label: '边框', type: 'boolean' },
    ],
  },
  {
    type: 'Tag',
    label: 'Tag 标签',
    icon: <Ico n="flag" />,
    category: '数据展示',
    component: Tag,
    defaultProps: { color: 'primary', children: '标签' },
    fields: [
      { key: 'children', label: '文案', type: 'text', asChildren: true },
      { key: 'color', label: '颜色', type: 'select', options: tagColorOptions },
      { key: 'bordered', label: '边框 (false = 实心)', type: 'boolean' },
      { key: 'closable', label: '可关闭', type: 'boolean' },
    ],
  },
  {
    type: 'Badge',
    label: 'Badge 徽标',
    icon: <Ico n="remind" />,
    category: '数据展示',
    component: Badge,
    defaultProps: { count: 5 },
    previewWrapperStyle: { paddingRight: 12 },
    fields: [
      { key: 'count', label: '数字', type: 'number', min: 0, max: 9999 },
      { key: 'dot', label: '仅红点', type: 'boolean' },
      { key: 'showZero', label: '显示 0', type: 'boolean' },
      { key: 'color', label: '颜色', type: 'color' },
      {
        key: 'status',
        label: '状态点模式',
        type: 'select',
        options: [
          { label: '—', value: '' },
          { label: 'success', value: 'success' },
          { label: 'processing', value: 'processing' },
          { label: 'warning', value: 'warning' },
          { label: 'error', value: 'error' },
          { label: 'default', value: 'default' },
        ],
      },
      { key: 'text', label: '状态文字', type: 'text' },
    ],
  },
  {
    type: 'Avatar',
    label: 'Avatar 头像',
    icon: <Ico n="customer" />,
    category: '数据展示',
    component: Avatar,
    defaultProps: { size: 'medium', shape: 'circle', children: 'Y' },
    fields: [
      { key: 'children', label: '文字', type: 'text', asChildren: true },
      { key: 'src', label: '图片 URL', type: 'text' },
      {
        key: 'shape',
        label: '形状',
        type: 'select',
        options: [
          { label: 'circle', value: 'circle' },
          { label: 'square', value: 'square' },
        ],
      },
      { key: 'size', label: '尺寸', type: 'select', options: sizeOptions },
      { key: 'background', label: '背景色', type: 'color' },
      { key: 'color', label: '文字色', type: 'color' },
    ],
  },
  {
    type: 'Empty',
    label: 'Empty 空状态',
    icon: <Ico n="folder" />,
    category: '数据展示',
    component: Empty,
    defaultProps: { description: '暂无数据' },
    previewWrapperStyle: { width: '100%' },
    fields: [{ key: 'description', label: '描述', type: 'text' }],
  },
  {
    type: 'Table',
    label: 'Table 表格',
    icon: <Ico n="table" />,
    category: '数据展示',
    component: Table,
    defaultProps: {
      rowKey: 'key',
      columns: sampleTableColumns,
      dataSource: sampleTableData,
      pagination: false,
      striped: true,
    },
    previewWrapperStyle: { width: '100%' },
    /**
     * 把声明式 column 配置转成真正的 render 函数 (PageBuilder 预览用):
     * - actions: 按钮组操作列
     * - format: 'currency' | 'percent' | 'date' | 'datetime' — 内置数值/时间格式化
     * - template: 字符串模板, "{字段名}" 占位符替换 (如 "¥{price} / 月")
     * - tag: { color?, mapping? } — 把值渲染成 Tag, mapping 把值映射成颜色
     * Copy JSX 出去时这些字段保持原样, 用户自己在代码里改成 render 函数
     */
    transformProps: (props) => {
      const cols = props.columns as Array<Record<string, unknown>> | undefined;
      if (!Array.isArray(cols)) return props;
      const transformed = cols.map((col) => {
        // 1. 操作列
        const actions = col.actions as Array<Record<string, unknown>> | undefined;
        if (Array.isArray(actions) && actions.length > 0) {
          return {
            ...col,
            render: () => (
              <span style={{ display: 'inline-flex', gap: 8 }}>
                {actions.map((a, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`au-btn au-btn--small au-btn--${a.type ?? 'default'}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {String(a.label ?? '操作')}
                  </button>
                ))}
              </span>
            ),
          };
        }
        // 2. 内置格式化
        const format = col.format as string | undefined;
        if (format) {
          const formatters: Record<string, (v: unknown) => React.ReactNode> = {
            currency: (v) => `¥ ${Number(v ?? 0).toLocaleString()}`,
            percent: (v) => `${v ?? 0}%`,
            date: (v) => (v ? new Date(String(v)).toLocaleDateString() : '-'),
            datetime: (v) => (v ? new Date(String(v)).toLocaleString() : '-'),
          };
          const fn = formatters[format];
          if (fn) return { ...col, render: fn };
        }
        // 3. 模板字符串 "{name} 岁" — 把 {key} 替换成行数据里对应字段
        const template = col.template as string | undefined;
        if (template) {
          return {
            ...col,
            render: (_v: unknown, row: Record<string, unknown>) =>
              template.replace(/\{(\w+)\}/g, (_, k) => String((row?.[k] as unknown) ?? '')),
          };
        }
        // 4. tag 渲染 (值 → Tag 组件), tag.mapping 把值映射成 color
        const tag = col.tag as { color?: string; mapping?: Record<string, string> } | undefined;
        if (tag) {
          return {
            ...col,
            render: (v: unknown) => {
              const text = v == null ? '' : String(v);
              const color = tag.mapping?.[text] ?? tag.color ?? 'default';
              return (
                <span
                  className={`au-tag au-tag--${color}`}
                  style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}
                >
                  {text}
                </span>
              );
            },
          };
        }
        return col;
      });
      return { ...props, columns: transformed };
    },
    fields: [
      {
        key: 'columns',
        label: '列配置',
        type: 'json',
        help: '纯 JSON, 不写函数。可选声明字段: actions (按钮组) / format (currency|percent|date|datetime) / template ("{字段}文案") / tag ({color, mapping})。详细见文档帮助下方示例',
      },
      {
        key: 'dataSource',
        label: '数据源',
        type: 'json',
        help: '对象数组, 每行一个对象, 键跟 columns.dataIndex 对应',
      },
      { key: 'rowKey', label: '行 Key 字段名', type: 'text', help: '通常是 id / key' },
      {
        key: 'size',
        label: '尺寸',
        type: 'select',
        options: [
          { label: 'small', value: 'small' },
          { label: 'middle', value: 'middle' },
          { label: 'large', value: 'large' },
        ],
      },
      { key: 'bordered', label: '外框线', type: 'boolean' },
      { key: 'striped', label: '斑马纹', type: 'boolean' },
      { key: 'showHeader', label: '显示表头', type: 'boolean' },
      { key: 'loading', label: '加载态', type: 'boolean' },
      { key: 'sticky', label: '表头吸顶', type: 'boolean' },
    ],
  },
  {
    type: 'Tabs',
    label: 'Tabs 标签页',
    icon: <Ico n="layers" />,
    category: '数据展示',
    component: Tabs,
    defaultProps: { items: sampleTabsItems, defaultActiveKey: '1' },
    previewWrapperStyle: { width: '100%' },
    fields: [
      {
        key: 'items',
        label: '标签页数据',
        type: 'json',
        help: '每项: { key, label, children }',
      },
      { key: 'defaultActiveKey', label: '默认激活 Key', type: 'text' },
      {
        key: 'type',
        label: '样式',
        type: 'select',
        options: [
          { label: 'line', value: 'line' },
          { label: 'card', value: 'card' },
          { label: 'segment', value: 'segment' },
        ],
      },
      {
        key: 'tabPosition',
        label: '位置',
        type: 'select',
        options: [
          { label: 'top', value: 'top' },
          { label: 'bottom', value: 'bottom' },
          { label: 'left', value: 'left' },
          { label: 'right', value: 'right' },
        ],
      },
      { key: 'size', label: '尺寸', type: 'select', options: sizeOptions },
      { key: 'centered', label: '居中', type: 'boolean' },
    ],
  },
  {
    type: 'Pagination',
    label: 'Pagination 分页',
    icon: <Ico n="left-double-arrow" />,
    category: '数据展示',
    component: Pagination,
    defaultProps: { total: samplePaginationTotal, defaultCurrent: 1 },
    previewWrapperStyle: { width: '100%' },
    fields: [
      { key: 'total', label: '总条数', type: 'number' },
      { key: 'defaultPageSize', label: '每页', type: 'number' },
      {
        key: 'showTotal',
        label: '显示"共 N 条"',
        type: 'boolean',
        help: '在分页左侧显示总条数',
      },
      { key: 'showSizeChanger', label: '显示页大小', type: 'boolean' },
      { key: 'showQuickJumper', label: '跳转', type: 'boolean' },
      { key: 'simple', label: '简洁模式', type: 'boolean' },
      {
        key: 'align',
        label: '位置',
        type: 'select',
        options: [
          { label: '默认 (跟随内容)', value: '' },
          { label: '靠左', value: 'left' },
          { label: '居中', value: 'center' },
          { label: '靠右', value: 'right' },
        ],
      },
      {
        key: 'size',
        label: '尺寸',
        type: 'select',
        options: [
          { label: 'default', value: 'default' },
          { label: 'small', value: 'small' },
        ],
      },
    ],
  },
  {
    type: 'Wallet',
    label: 'Wallet 卡包',
    icon: <Ico n="money-wallet" />,
    category: '数据展示',
    component: Wallet,
    defaultProps: {
      cards: sampleWalletCards,
      balance: '¥ 12,450.00',
      balanceLabel: '可用余额',
    },
    previewWrapperStyle: { width: '100%' },
    fields: [
      {
        key: 'cards',
        label: '卡片列表',
        type: 'json',
        help: '每项: { brand, background, label, value, masked, number }',
      },
      { key: 'balance', label: '余额', type: 'text' },
      { key: 'balanceLabel', label: '余额说明', type: 'text' },
      { key: 'balanceMask', label: '遮罩符号', type: 'text' },
    ],
  },
  {
    type: 'Timeline',
    label: 'Timeline 时间轴',
    icon: <Ico n="time-history" />,
    category: '数据展示',
    component: Timeline,
    defaultProps: { items: sampleTimelineItems, mode: 'left' },
    previewWrapperStyle: { width: '100%', maxWidth: 480 },
    fields: [
      {
        key: 'items',
        label: '节点数据',
        type: 'json',
        help: '每项: { color, children, label? }',
      },
      {
        key: 'mode',
        label: '模式',
        type: 'select',
        options: [
          { label: 'left', value: 'left' },
          { label: 'right', value: 'right' },
          { label: 'alternate', value: 'alternate' },
        ],
      },
      { key: 'reverse', label: '倒序', type: 'boolean' },
    ],
  },
  {
    type: 'DayTimeline',
    label: 'DayTimeline 时间刻度',
    icon: <Ico n="time-task" />,
    category: '数据展示',
    component: DayTimeline,
    defaultProps: {
      mode: 'hour',
      dataEndAt: new Date().toISOString(),
      statusData: sampleDayTimelineStatus,
    },
    previewWrapperStyle: { width: '100%' },
    transformProps: (props) => {
      const out: Record<string, unknown> = { ...props };
      if (typeof out.dataEndAt === 'string') out.dataEndAt = new Date(out.dataEndAt);
      if (Array.isArray(out.statusData)) {
        out.statusData = (out.statusData as Record<string, unknown>[]).map((s) => ({
          ...s,
          value: typeof s.value === 'string' ? new Date(s.value) : s.value,
        }));
      }
      return out;
    },
    fields: [
      {
        key: 'statusData',
        label: '状态段',
        type: 'json',
        help: '每项: { value (ISO 字符串), status }',
      },
      {
        key: 'dataEndAt',
        label: '结束时间 (ISO)',
        type: 'text',
        placeholder: '2026-04-23T10:00:00.000Z',
      },
      {
        key: 'mode',
        label: '粒度',
        type: 'select',
        options: [
          { label: 'hour', value: 'hour' },
          { label: 'day', value: 'day' },
          { label: 'month', value: 'month' },
          { label: 'year', value: 'year' },
        ],
      },
      { key: 'height', label: '高度', type: 'number', min: 40, max: 120 },
    ],
  },
  {
    type: 'Statistic',
    label: 'Statistic 数值',
    icon: <Ico n="charts-bar" />,
    category: '数据展示',
    component: Statistic,
    defaultProps: { title: '本月 GMV', value: 128500, prefix: '¥', precision: 0 },
    previewWrapperStyle: { display: 'inline-block' },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'value', label: '数值', type: 'number' },
      { key: 'prefix', label: '前缀', type: 'text' },
      { key: 'suffix', label: '后缀', type: 'text' },
      { key: 'precision', label: '小数位', type: 'number', min: 0, max: 6 },
      { key: 'groupSeparator', label: '千分位符', type: 'text', placeholder: ',' },
      { key: 'loading', label: '加载占位', type: 'boolean' },
    ],
  },
  {
    type: 'Description',
    label: 'Description 描述列表',
    icon: <Ico n="list" />,
    category: '数据展示',
    component: Description,
    defaultProps: {
      title: '用户信息',
      column: 3,
      bordered: false,
      items: [
        { label: '用户名', value: '余星辰' },
        { label: '账号', value: 'yuxianshengs' },
        { label: '邮箱', value: 'yu@example.com' },
        { label: '城市', value: '北京' },
        { label: '电话', value: '138 0000 0000' },
        { label: '注册时间', value: '2026-01-12' },
      ],
    },
    previewWrapperStyle: { width: '100%' },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      {
        key: 'items',
        label: '描述项',
        type: 'json',
        help: '每项: { label, value, span?(跨列数) }',
      },
      { key: 'column', label: '列数', type: 'number', min: 1, max: 6 },
      {
        key: 'layout',
        label: '布局',
        type: 'select',
        options: [
          { label: 'horizontal (label 在左)', value: 'horizontal' },
          { label: 'vertical (label 在上)', value: 'vertical' },
        ],
      },
      {
        key: 'size',
        label: '尺寸',
        type: 'select',
        options: [
          { label: 'small', value: 'small' },
          { label: 'default', value: 'default' },
          { label: 'large', value: 'large' },
        ],
      },
      { key: 'bordered', label: '带边框', type: 'boolean' },
      { key: 'colon', label: 'label 后加冒号', type: 'boolean' },
    ],
  },

  /* ---------- 反馈 ---------- */
  {
    type: 'Alert',
    label: 'Alert 警告提示',
    icon: <Ico n="info" />,
    category: '反馈',
    component: Alert,
    defaultProps: { type: 'info', title: '这是一条提示', showIcon: true },
    previewWrapperStyle: { width: '100%' },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'description', label: '描述', type: 'textarea' },
      { key: 'type', label: '类型', type: 'select', options: alertTypeOptions },
      { key: 'showIcon', label: '显示图标', type: 'boolean' },
      { key: 'closable', label: '可关闭', type: 'boolean' },
      { key: 'banner', label: '横幅', type: 'boolean' },
    ],
  },
  {
    type: 'Spin',
    label: 'Spin 加载',
    icon: <Ico n="loading" />,
    category: '反馈',
    component: Spin,
    defaultProps: { tip: '加载中…' },
    fields: [
      { key: 'tip', label: '提示', type: 'text' },
      { key: 'size', label: '尺寸', type: 'select', options: smallMediumLarge },
      { key: 'spinning', label: '加载中', type: 'boolean' },
    ],
  },
  {
    type: 'Skeleton',
    label: 'Skeleton 骨架屏',
    icon: <Ico n="loading" />,
    category: '反馈',
    component: Skeleton,
    defaultProps: { loading: true, active: true, rows: 3, title: true, avatar: false, varyRows: true },
    previewWrapperStyle: { width: '100%' },
    fields: [
      { key: 'loading', label: '显示占位', type: 'boolean' },
      { key: 'active', label: '闪烁动画', type: 'boolean' },
      { key: 'title', label: '显示标题占位', type: 'boolean' },
      { key: 'avatar', label: '显示头像占位', type: 'boolean' },
      { key: 'rows', label: '段落行数', type: 'number', min: 1, max: 10 },
      { key: 'varyRows', label: '尾行更短', type: 'boolean' },
    ],
  },
  {
    type: 'Progress',
    label: 'Progress 进度条',
    icon: <Ico n="loading" />,
    category: '反馈',
    component: Progress,
    defaultProps: { percent: 60, type: 'line', status: 'normal', showInfo: true },
    previewWrapperStyle: { width: '100%' },
    fields: [
      { key: 'percent', label: '百分比', type: 'number', min: 0, max: 100 },
      {
        key: 'type',
        label: '类型',
        type: 'select',
        options: [
          { label: 'line (线性)', value: 'line' },
          { label: 'circle (圆形)', value: 'circle' },
          { label: 'dashboard (仪表)', value: 'dashboard' },
        ],
      },
      {
        key: 'status',
        label: '状态',
        type: 'select',
        options: [
          { label: 'normal', value: 'normal' },
          { label: 'active (滚动条纹)', value: 'active' },
          { label: 'success', value: 'success' },
          { label: 'exception', value: 'exception' },
        ],
      },
      {
        key: 'size',
        label: '线粗 (line)',
        type: 'select',
        options: [
          { label: 'small', value: 'small' },
          { label: 'default', value: 'default' },
          { label: 'large', value: 'large' },
        ],
      },
      { key: 'width', label: '直径 (circle/dashboard)', type: 'number', min: 40, max: 300 },
      { key: 'strokeWidth', label: '环宽 (circle/dashboard)', type: 'number', min: 2, max: 20 },
      { key: 'showInfo', label: '显示百分比文字', type: 'boolean' },
    ],
  },
  {
    type: 'Result',
    label: 'Result 结果页',
    icon: <Ico n="info" />,
    category: '反馈',
    component: Result,
    defaultProps: {
      status: 'success',
      title: '操作成功',
      subTitle: '订单 #2026-0419 已提交, 预计 24 小时内审批完成',
    },
    previewWrapperStyle: { width: '100%' },
    fields: [
      {
        key: 'status',
        label: '状态',
        type: 'select',
        options: [
          { label: 'success (成功)', value: 'success' },
          { label: 'error (失败)', value: 'error' },
          { label: 'info (提示)', value: 'info' },
          { label: 'warning (警告)', value: 'warning' },
          { label: '404', value: '404' },
          { label: '403', value: '403' },
          { label: '500', value: '500' },
        ],
      },
      { key: 'title', label: '标题', type: 'text' },
      { key: 'subTitle', label: '副标题', type: 'textarea' },
    ],
  },

  /* ---------- 可视化 ---------- */
  {
    type: 'KpiCard',
    label: 'KpiCard 指标卡',
    icon: <Ico n="charts-bar" />,
    category: '可视化',
    component: KpiCard,
    defaultProps: { title: '今日 GMV', value: 12850, prefix: '¥', status: 'primary' },
    previewWrapperStyle: { width: '100%' },
    fields: [
      { key: 'title', label: '标题', type: 'text' },
      { key: 'value', label: '数值', type: 'number' },
      { key: 'prefix', label: '前缀', type: 'text' },
      { key: 'suffix', label: '后缀', type: 'text' },
      { key: 'precision', label: '精度', type: 'number', min: 0, max: 4 },
      { key: 'status', label: '状态色', type: 'select', options: statusOptions },
      { key: 'size', label: '尺寸', type: 'select', options: sizeOptions },
    ],
  },
  {
    type: 'Sparkline',
    label: 'Sparkline 迷你趋势',
    icon: <Ico n="charts-line" />,
    category: '可视化',
    component: Sparkline,
    defaultProps: {
      data: [3, 4, 2, 5, 7, 6, 9, 8, 11, 13, 12, 15],
      type: 'area',
      width: 160,
      height: 36,
    },
    previewWrapperStyle: { display: 'inline-block' },
    fields: [
      {
        key: 'data',
        label: '数据',
        type: 'json',
        help: '数字数组, 如 [1,2,3,4,5]',
      },
      {
        key: 'type',
        label: '形态',
        type: 'select',
        options: [
          { label: 'line', value: 'line' },
          { label: 'area', value: 'area' },
          { label: 'bar', value: 'bar' },
        ],
      },
      { key: 'color', label: '颜色', type: 'color' },
      { key: 'width', label: '宽度', type: 'number', min: 40, max: 400 },
      { key: 'height', label: '高度', type: 'number', min: 20, max: 100 },
      { key: 'smooth', label: '平滑', type: 'boolean' },
      { key: 'showDot', label: '末端点', type: 'boolean' },
    ],
  },
  {
    type: 'Gauge',
    label: 'Gauge 仪表盘',
    icon: <Ico n="charts-pie" />,
    category: '可视化',
    component: Gauge,
    defaultProps: { value: 72, label: '完成率', suffix: '%' },
    previewWrapperStyle: { display: 'inline-block' },
    fields: [
      { key: 'value', label: '当前值', type: 'number' },
      { key: 'max', label: '最大值', type: 'number' },
      { key: 'label', label: '底部标签', type: 'text' },
      { key: 'suffix', label: '后缀', type: 'text' },
      { key: 'size', label: '直径', type: 'number', min: 80, max: 260, step: 10 },
      { key: 'thickness', label: '弧线粗细', type: 'number', min: 4, max: 24 },
      { key: 'color', label: '弧线颜色', type: 'color' },
    ],
  },
  {
    type: 'Funnel',
    label: 'Funnel 漏斗',
    icon: <Ico n="filter" />,
    category: '可视化',
    component: Funnel,
    defaultProps: { data: sampleFunnelData, width: 420 },
    previewWrapperStyle: { width: '100%' },
    fields: [
      {
        key: 'data',
        label: '漏斗数据',
        type: 'json',
        help: '每项: { label, value }',
      },
      { key: 'width', label: '宽度', type: 'number', min: 200, max: 800 },
      {
        key: 'shape',
        label: '形态',
        type: 'select',
        options: [
          { label: 'trapezoid', value: 'trapezoid' },
          { label: 'pyramid', value: 'pyramid' },
          { label: 'rect', value: 'rect' },
        ],
      },
      {
        key: 'percentBase',
        label: '转化基准',
        type: 'select',
        options: [
          { label: 'first', value: 'first' },
          { label: 'previous', value: 'previous' },
        ],
      },
      { key: 'gradient', label: '渐变', type: 'boolean' },
      { key: 'showPercent', label: '显示百分比', type: 'boolean' },
    ],
  },
  {
    type: 'Heatmap',
    label: 'Heatmap 日历热力',
    icon: <Ico n="calendar-fill" />,
    category: '可视化',
    component: Heatmap,
    defaultProps: { data: sampleHeatmapData },
    previewWrapperStyle: { width: '100%' },
    fields: [
      {
        key: 'data',
        label: '热力数据',
        type: 'json',
        help: '每项: { date: "YYYY-MM-DD", value: number }',
      },
      { key: 'cellSize', label: '单元大小', type: 'number', min: 8, max: 20 },
      { key: 'cellGap', label: '间距', type: 'number', min: 0, max: 6 },
      { key: 'showLegend', label: '显示图例', type: 'boolean' },
      { key: 'showMonthLabels', label: '月份标签', type: 'boolean' },
      { key: 'showWeekdayLabels', label: '星期标签', type: 'boolean' },
    ],
  },
  {
    type: 'ActivityFeed',
    label: 'ActivityFeed 动态流',
    icon: <Ico n="message-comments" />,
    category: '可视化',
    component: ActivityFeed,
    defaultProps: { items: sampleActivityItems, maxHeight: 300 },
    previewWrapperStyle: { width: '100%', maxWidth: 420 },
    transformProps: (props) => {
      if (Array.isArray(props.items)) {
        const items = (props.items as Record<string, unknown>[]).map((it) => {
          const t = it.time;
          return {
            ...it,
            time: typeof t === 'string' ? new Date(t) : t,
          };
        });
        return { ...props, items };
      }
      return props;
    },
    fields: [
      {
        key: 'items',
        label: '动态项',
        type: 'json',
        help: '每项: { id, time (ISO 字符串), title, type, user: { name } }',
      },
      { key: 'maxHeight', label: '最大高度', type: 'number', min: 160, max: 800 },
      { key: 'compact', label: '紧凑', type: 'boolean' },
      { key: 'relativeTime', label: '相对时间', type: 'boolean' },
      { key: 'reverse', label: '新在顶', type: 'boolean' },
    ],
  },
  {
    type: 'Bar3D',
    label: 'Bar3D 3D 柱状图',
    icon: <Ico n="layered-configuration" />,
    category: '可视化',
    component: Bar3D,
    defaultProps: {
      xCategories: sampleBar3D.xCategories,
      yCategories: sampleBar3D.yCategories,
      data: sampleBar3D.data,
      height: 300,
    },
    previewWrapperStyle: { width: '100%' },
    fields: [
      {
        key: 'xCategories',
        label: 'X 轴分类',
        type: 'json',
        help: '字符串数组, 如 ["Q1","Q2"]',
      },
      {
        key: 'yCategories',
        label: 'Y 轴分类',
        type: 'json',
        help: '字符串数组',
      },
      {
        key: 'data',
        label: '数据 (二维)',
        type: 'json',
        help: '每行对应一个 Y 分类, 长度 = X 分类数',
      },
      { key: 'title', label: '标题', type: 'text' },
      { key: 'height', label: '高度 (px)', type: 'number', min: 200, max: 600 },
      { key: 'autoRotate', label: '自动旋转', type: 'boolean' },
      { key: 'showAxis', label: '显示坐标轴', type: 'boolean' },
      {
        key: 'theme',
        label: '主题',
        type: 'select',
        options: [
          { label: 'light', value: 'light' },
          { label: 'dark', value: 'dark' },
        ],
      },
      {
        key: 'shading',
        label: '着色',
        type: 'select',
        options: [
          { label: 'color', value: 'color' },
          { label: 'lambert', value: 'lambert' },
          { label: 'realistic', value: 'realistic' },
        ],
      },
    ],
  },

  /* ---------- 布局 ---------- */
  {
    type: 'Split',
    label: 'Split 可拖拽分割面板',
    icon: <Ico n="editor-three-column" />,
    category: '布局',
    component: Split,
    isContainer: true,
    slots: ['left', 'right'],
    slotLabels: {
      left: '← 左 / 上 面板',
      right: '→ 右 / 下 面板',
    },
    defaultProps: {
      direction: 'horizontal',
      defaultSize: '50%',
      min: 80,
      resizerSize: 6,
      _minHeight: 320,
    },
    previewWrapperStyle: { width: '100%' },
    transformProps: (props) => {
      const { _minHeight, style: oldStyle, ...rest } = props;
      const style: React.CSSProperties = { ...(oldStyle as object), width: '100%' };
      if (typeof _minHeight === 'number') style.minHeight = _minHeight;
      return { ...rest, style };
    },
    fields: [
      {
        key: 'direction',
        label: '分割方向',
        type: 'select',
        options: [
          { label: 'horizontal (左右)', value: 'horizontal' },
          { label: 'vertical (上下)', value: 'vertical' },
        ],
      },
      { key: 'defaultSize', label: '初始尺寸', type: 'text', help: '数字 = px, 字符串 = "50%"' },
      { key: 'min', label: '最小尺寸 (px)', type: 'number', min: 0, max: 800 },
      { key: 'max', label: '最大尺寸 (px)', type: 'number', min: 0, max: 1600 },
      { key: 'resizerSize', label: '分隔条宽度 (px)', type: 'number', min: 2, max: 16 },
      { key: 'disabled', label: '禁止拖拽', type: 'boolean' },
      {
        key: '_minHeight',
        label: '容器最小高度 (px)',
        type: 'number',
        min: 80,
        max: 1200,
        step: 20,
        help: '没明确高度时给个保底, 不然横向分割看不出效果',
      },
    ],
    serialize: (props, slotJsx, indent = 2) => {
      const attrs: string[] = [];
      if (props.direction && props.direction !== 'horizontal')
        attrs.push(`direction="${props.direction}"`);
      if (props.defaultSize !== undefined && props.defaultSize !== '50%') {
        const ds = props.defaultSize;
        attrs.push(typeof ds === 'number' ? `defaultSize={${ds}}` : `defaultSize="${ds}"`);
      }
      if (typeof props.min === 'number' && props.min !== 40) attrs.push(`min={${props.min}}`);
      if (typeof props.max === 'number') attrs.push(`max={${props.max}}`);
      if (typeof props.resizerSize === 'number' && props.resizerSize !== 6)
        attrs.push(`resizerSize={${props.resizerSize}}`);
      if (props.disabled) attrs.push('disabled');
      if (typeof props._minHeight === 'number')
        attrs.push(`style={{ minHeight: ${props._minHeight} }}`);
      const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';
      const inPad = pad(indent + 1);
      const outPad = pad(indent);
      const left = slotJsx?.left ?? '';
      const right = slotJsx?.right ?? '';
      return {
        jsx: `<Split${attrStr}>\n${left || `${inPad}{/* 左 / 上 面板 */}`}\n${right || `${inPad}{/* 右 / 下 面板 */}`}\n${outPad}</Split>`,
        imports: ['Split'],
      };
    },
  },
  {
    type: 'Flex',
    label: 'Flex 弹性容器 (自由布局)',
    icon: <Ico n="editor-four-column" />,
    category: '布局',
    component: Flex,
    isContainer: true,
    defaultProps: { direction: 'row', gap: 12, align: 'stretch', justify: 'start' },
    previewWrapperStyle: { width: '100%' },
    /**
     * 把快捷 _centerH / _centerV 解析成底层 justify / align, 不管 direction 是 row 还是 column 都"恰好"能居中
     */
    transformProps: (props) => {
      const { _centerH, _centerV, direction, justify, align, ...rest } = props;
      const isRow = !direction || direction === 'row' || direction === 'row-reverse';
      let outJustify = justify;
      let outAlign = align;
      if (_centerH) {
        if (isRow) outJustify = 'center';
        else outAlign = 'center';
      }
      if (_centerV) {
        if (isRow) outAlign = 'center';
        else outJustify = 'center';
      }
      return { ...rest, direction, justify: outJustify, align: outAlign };
    },
    fields: [
      {
        key: 'direction',
        label: '方向',
        type: 'select',
        options: [
          { label: 'row (横向)', value: 'row' },
          { label: 'column (纵向)', value: 'column' },
          { label: 'row-reverse', value: 'row-reverse' },
          { label: 'column-reverse', value: 'column-reverse' },
        ],
      },
      {
        key: '_centerH',
        label: '水平居中子元素',
        type: 'boolean',
        help: '一键居中, 不用管主轴/交叉轴',
      },
      {
        key: '_centerV',
        label: '垂直居中子元素',
        type: 'boolean',
        help: '需要 Flex 有明确高度 (加个"高度"或塞进 Layout 顶栏)',
      },
      { key: 'gap', label: '间距 (px)', type: 'number', min: 0, max: 64 },
      {
        key: 'justify',
        label: '主轴对齐 (进阶)',
        type: 'select',
        options: [
          { label: 'start (靠前)', value: 'start' },
          { label: 'center (居中)', value: 'center' },
          { label: 'end (靠后)', value: 'end' },
          { label: 'between (两端贴, 中间均分)', value: 'between' },
          { label: 'around (每块两侧等距)', value: 'around' },
          { label: 'evenly (所有间距相等)', value: 'evenly' },
        ],
      },
      {
        key: 'align',
        label: '交叉轴对齐 (进阶)',
        type: 'select',
        options: [
          { label: 'stretch (撑满, 默认)', value: 'stretch' },
          { label: 'start (靠上/靠左)', value: 'start' },
          { label: 'center (居中)', value: 'center' },
          { label: 'end (靠下/靠右)', value: 'end' },
          { label: 'baseline (基线对齐)', value: 'baseline' },
        ],
      },
      { key: 'wrap', label: '允许换行', type: 'boolean' },
      { key: 'padding', label: '内边距 (px)', type: 'number', min: 0, max: 64 },
      { key: 'background', label: '背景色', type: 'color' },
      { key: 'radius', label: '圆角 (px)', type: 'number', min: 0, max: 24 },
      { key: 'inline', label: 'inline-flex (行内)', type: 'boolean' },
    ],
    serialize: (props, slotJsx, indent = 2) => {
      const attrs: string[] = [];
      // 跟 transformProps 同构: 把 _centerH / _centerV 解析成 justify / align
      const dir = (props.direction as string) ?? 'row';
      const isRow = dir === 'row' || dir === 'row-reverse';
      let eJustify = props.justify as string | undefined;
      let eAlign = props.align as string | undefined;
      if (props._centerH) {
        if (isRow) eJustify = 'center';
        else eAlign = 'center';
      }
      if (props._centerV) {
        if (isRow) eAlign = 'center';
        else eJustify = 'center';
      }
      if (props.direction && props.direction !== 'row') attrs.push(`direction="${props.direction}"`);
      if (props.gap != null) attrs.push(`gap={${props.gap}}`);
      if (eJustify && eJustify !== 'start') attrs.push(`justify="${eJustify}"`);
      if (eAlign && eAlign !== 'stretch') attrs.push(`align="${eAlign}"`);
      if (props.wrap) attrs.push('wrap');
      if (props.padding != null) attrs.push(`padding={${props.padding}}`);
      if (props.background) attrs.push(`background="${props.background}"`);
      if (props.radius != null) attrs.push(`radius={${props.radius}}`);
      if (props.inline) attrs.push('inline');
      const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';
      const body = slotJsx?.default ?? '';
      return {
        jsx: `<Flex${attrStr}>\n${body}\n${pad(indent)}</Flex>`,
        imports: ['Flex'],
      };
    },
  },
  {
    type: 'Space',
    label: 'Space 间距',
    icon: <Ico n="editor-three-column" />,
    category: '布局',
    component: Space,
    defaultProps: { children: '— 间距组件需在代码中包裹子组件 —' },
    previewWrapperStyle: { width: '100%' },
    fields: [
      {
        key: 'direction',
        label: '方向',
        type: 'select',
        options: [
          { label: 'horizontal', value: 'horizontal' },
          { label: 'vertical', value: 'vertical' },
        ],
      },
      {
        key: 'size',
        label: '间距',
        type: 'select',
        options: [
          { label: 'small', value: 'small' },
          { label: 'medium', value: 'medium' },
          { label: 'large', value: 'large' },
        ],
      },
      { key: 'wrap', label: '换行', type: 'boolean' },
    ],
  },
  {
    type: 'Row',
    label: 'Row 行容器 (N 列)',
    icon: <Ico n="editor-three-column" />,
    category: '布局',
    component: Row,
    isContainer: true,
    // slots 未指定: 走默认单 slot 'default'
    defaultProps: { cols: 2, gap: 12, align: 'start' },
    previewWrapperStyle: { width: '100%' },
    fields: [
      { key: 'cols', label: '列数', type: 'number', min: 1, max: 12, help: '每行几列等分 (template 留空时生效)' },
      {
        key: 'template',
        label: '自定义列模板',
        type: 'text',
        placeholder: '1fr 2fr · 200px 1fr · repeat(3, 1fr)',
        help: '不等宽直接写 CSS grid-template-columns, 设了就覆盖上面的列数',
      },
      { key: 'gap', label: '列间距 (px)', type: 'number', min: 0, max: 48 },
      {
        key: 'justifyItems',
        label: '水平对齐',
        type: 'select',
        options: [
          { label: '填满 (默认)', value: 'stretch' },
          { label: '靠左', value: 'start' },
          { label: '居中', value: 'center' },
          { label: '靠右', value: 'end' },
        ],
      },
      {
        key: 'align',
        label: '垂直对齐',
        type: 'select',
        options: [
          { label: 'start', value: 'start' },
          { label: 'center', value: 'center' },
          { label: 'end', value: 'end' },
          { label: 'stretch', value: 'stretch' },
        ],
      },
      { key: 'responsive', label: '窄屏自动折行', type: 'boolean' },
    ],
    serialize: (props, slotJsx, indent = 2) => {
      const attrs: string[] = [];
      if (props.template) attrs.push(`template="${String(props.template).replace(/"/g, '&quot;')}"`);
      else attrs.push(`cols={${props.cols ?? 2}}`);
      attrs.push(`gap={${props.gap ?? 12}}`);
      if (props.align && props.align !== 'start') attrs.push(`align="${props.align}"`);
      if (props.justifyItems && props.justifyItems !== 'stretch')
        attrs.push(`justifyItems="${props.justifyItems}"`);
      if (props.responsive) attrs.push('responsive');
      const body = slotJsx?.default ?? '';
      return {
        jsx: `<Row ${attrs.join(' ')}>\n${body}\n${pad(indent)}</Row>`,
        imports: ['Row'],
      };
    },
  },
  {
    type: 'Grid',
    label: 'Grid 方格布局',
    icon: <Ico n="editor-four-column" />,
    category: '布局',
    component: Grid,
    isContainer: true,
    /**
     * 两种 slot 模型:
     *   - fixed: cell-0, cell-1, ..., cell-(cols*rows-1) — 每格独立 drop
     *   - auto: 单 default slot, CSS 自适应换行
     */
    slots: (props) => {
      const mode = (props.mode as string) ?? 'fixed';
      if (mode === 'auto') return ['default'];
      const cols = Math.max(1, Math.min(12, Number(props.cols) || 3));
      const rows = Math.max(1, Math.min(12, Number(props.rows) || 1));
      return Array.from({ length: cols * rows }, (_, i) => `cell-${i}`);
    },
    defaultProps: { mode: 'fixed', cols: 3, rows: 1, minColWidth: 240, gap: 12, rowMinHeight: 80 },
    previewWrapperStyle: { width: '100%' },
    fields: [
      {
        key: 'mode',
        label: '布局模式',
        type: 'select',
        options: [
          { label: '固定列数 (每格独立拖)', value: 'fixed' },
          { label: '自动换行 (按最小列宽)', value: 'auto' },
        ],
      },
      {
        key: 'cols',
        label: '每行列数',
        type: 'number',
        min: 1,
        max: 12,
        visibleWhen: (p) => (p.mode ?? 'fixed') === 'fixed',
      },
      {
        key: 'rows',
        label: '行数',
        type: 'number',
        min: 1,
        max: 12,
        help: '行数 × 列数 = 总格子数; 每格可单独拖组件',
        visibleWhen: (p) => (p.mode ?? 'fixed') === 'fixed',
      },
      {
        key: 'minColWidth',
        label: '最小列宽 (px)',
        type: 'number',
        min: 80,
        max: 600,
        help: '浏览器按此宽度自动决定每行放几个',
        visibleWhen: (p) => p.mode === 'auto',
      },
      {
        key: 'justifyItems',
        label: '水平对齐',
        type: 'select',
        options: [
          { label: '填满 (默认)', value: 'stretch' },
          { label: '靠左', value: 'start' },
          { label: '居中', value: 'center' },
          { label: '靠右', value: 'end' },
        ],
      },
      { key: 'gap', label: '列间距 (px)', type: 'number', min: 0, max: 48 },
      { key: 'rowGap', label: '行间距 (px)', type: 'number', min: 0, max: 48 },
      { key: 'rowMinHeight', label: '最小行高 (px)', type: 'number', min: 40, max: 400 },
    ],
    serialize: (props, slotJsx, indent = 2) => {
      const mode = (props.mode as string) ?? 'fixed';
      const attrs: string[] = [];
      if (mode === 'auto') {
        attrs.push(`minColWidth={${Number(props.minColWidth) || 240}}`);
      } else {
        attrs.push(`cols={${Number(props.cols) || 3}}`);
      }
      if (props.gap != null && props.gap !== 12) attrs.push(`gap={${props.gap}}`);
      if (props.rowGap != null) attrs.push(`rowGap={${props.rowGap}}`);
      if (props.rowMinHeight != null && props.rowMinHeight !== 80)
        attrs.push(`rowMinHeight={${props.rowMinHeight}}`);
      if (props.justifyItems && props.justifyItems !== 'stretch')
        attrs.push(`justifyItems="${props.justifyItems}"`);

      const inPad = pad(indent + 1);
      const outPad = pad(indent);

      if (mode === 'auto') {
        const body = slotJsx?.default ?? '';
        return {
          jsx: `<Grid ${attrs.join(' ')}>\n${body || `${inPad}{/* 拖组件进来自动铺 */}`}\n${outPad}</Grid>`,
          imports: ['Grid'],
        };
      }
      // 固定模式: 按 cell 顺序输出, 空格子落成注释占位保留布局位置
      const cols = Number(props.cols) || 3;
      const rows = Number(props.rows) || 1;
      const cellsOut: string[] = [];
      for (let i = 0; i < cols * rows; i++) {
        const content = slotJsx?.[`cell-${i}`] ?? '';
        if (content.trim()) cellsOut.push(content);
        else cellsOut.push(`${inPad}<div /> {/* cell-${i} */}`);
      }
      // 如果末尾全是空 div, 去掉尾部占位让代码更简洁
      while (cellsOut.length > 0 && cellsOut[cellsOut.length - 1].includes('<div />')) {
        cellsOut.pop();
      }
      return {
        jsx: `<Grid ${attrs.join(' ')}>\n${cellsOut.join('\n') || `${inPad}{/* 空格子 */}`}\n${outPad}</Grid>`,
        imports: ['Grid'],
      };
    },
  },
  {
    type: 'Layout',
    label: 'Layout 页面布局 (侧栏+顶栏+内容)',
    icon: <Ico n="layered-configuration" />,
    category: '布局',
    component: Layout,
    isContainer: true,
    /** 根据 layout 模式决定出现哪些槽 */
    slots: (props) => {
      const layout = (props.layout as string) ?? 'side';
      if (layout === 'top') return ['header', 'content', 'footer'];
      if (layout === 'clean') return ['header', 'content', 'footer'];
      // side / top-side 都有 4 槽
      return ['sider', 'header', 'content', 'footer'];
    },
    slotLabels: {
      sider: '← 侧栏 · 拖 Menu 到这',
      header: '↑ 顶栏 · 拖 Breadcrumb / Avatar / 搜索 到这',
      content: '主内容区 · 放 Table / Form / Card 等',
      footer: '页脚 (可选)',
    },
    defaultProps: {
      layout: 'side',
      siderPlacement: 'left',
      siderWidth: 220,
      headerHeight: 56,
      siderTheme: 'dark',
      maxContentWidth: 960,
      _minHeight: 640,
    },
    previewWrapperStyle: { width: '100%' },
    transformProps: (props) => {
      const { _minHeight, style: oldStyle, ...rest } = props;
      const style: React.CSSProperties = { ...(oldStyle as object), width: '100%' };
      if (typeof _minHeight === 'number') style.minHeight = _minHeight;
      return { ...rest, style };
    },
    fields: [
      {
        key: 'layout',
        label: '布局模式',
        type: 'select',
        options: [
          { label: 'side · 侧栏通高 + 主区', value: 'side' },
          { label: 'top-side · 顶栏通宽 + 侧栏在下', value: 'top-side' },
          { label: 'top · 顶栏 + 内容 (无侧栏)', value: 'top' },
          { label: 'clean · 居中容器 (文档/营销页)', value: 'clean' },
        ],
      },
      {
        key: 'siderPlacement',
        label: '侧栏位置',
        type: 'select',
        options: [
          { label: 'left', value: 'left' },
          { label: 'right', value: 'right' },
        ],
        visibleWhen: (p) => p.layout !== 'top' && p.layout !== 'clean',
      },
      {
        key: 'siderWidth',
        label: '侧栏宽度 (px)',
        type: 'number',
        min: 120,
        max: 360,
        help: '侧栏空着时的默认宽度; 有内容时会自动按内容宽度撑开',
        visibleWhen: (p) => p.layout !== 'top' && p.layout !== 'clean',
      },
      { key: 'headerHeight', label: '顶栏高度 (px)', type: 'number', min: 48, max: 80 },
      {
        key: 'headerPadding',
        label: '顶栏左右边距 (px)',
        type: 'number',
        min: 0,
        max: 64,
        help: '默认 24, 改 0 让内容贴边 (比如整条搜索栏)',
      },
      {
        key: 'contentPadding',
        label: '内容区内边距 (px)',
        type: 'number',
        min: 0,
        max: 64,
        help: '默认 20 × 24, 改 0 让内容铺满',
      },
      {
        key: 'maxContentWidth',
        label: '内容最大宽度',
        type: 'number',
        min: 640,
        max: 1600,
        step: 20,
        visibleWhen: (p) => p.layout === 'clean',
        help: 'clean 模式下内容居中 + 两侧留白',
      },
      {
        key: '_minHeight',
        label: '页面最小高度 (px)',
        type: 'number',
        min: 300,
        max: 1400,
        step: 20,
        help: '整页铺满感; 内容多时会自动撑高',
      },
      {
        key: 'siderTheme',
        label: '侧栏主题',
        type: 'select',
        options: [
          { label: 'dark', value: 'dark' },
          { label: 'light', value: 'light' },
        ],
        visibleWhen: (p) => p.layout !== 'top' && p.layout !== 'clean',
      },
    ],
    serialize: (props, slotJsx, indent = 2) => {
      const layout = (props.layout as string) ?? 'side';
      const hasSider = layout !== 'top' && layout !== 'clean';
      const attrs: string[] = [];
      if (layout !== 'side') attrs.push(`layout="${layout}"`);
      if (hasSider && props.siderPlacement && props.siderPlacement !== 'left')
        attrs.push(`siderPlacement="${props.siderPlacement}"`);
      // 侧栏有内容 → 走 auto 按内容撑开; 空侧栏用配置的像素宽度
      const siderHasContent = hasSider && !!(slotJsx?.sider && slotJsx.sider.trim());
      if (siderHasContent) attrs.push(`siderWidth="auto"`);
      else if (hasSider && props.siderWidth && props.siderWidth !== 220)
        attrs.push(`siderWidth={${props.siderWidth}}`);
      if (props.headerHeight && props.headerHeight !== 56)
        attrs.push(`headerHeight={${props.headerHeight}}`);
      if (typeof props.headerPadding === 'number')
        attrs.push(`headerPadding={${props.headerPadding}}`);
      if (typeof props.contentPadding === 'number')
        attrs.push(`contentPadding={${props.contentPadding}}`);
      if (hasSider && props.siderTheme && props.siderTheme !== 'dark')
        attrs.push(`siderTheme="${props.siderTheme}"`);
      if (layout === 'clean' && props.maxContentWidth && props.maxContentWidth !== 960)
        attrs.push(`maxContentWidth={${props.maxContentWidth}}`);
      if (typeof props._minHeight === 'number')
        attrs.push(`style={{ minHeight: ${props._minHeight} }}`);
      const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';
      const slot = (name: string) => slotJsx?.[name] ?? '';
      const attrPad = pad(indent + 1); // sider={<>, header={<>, ...
      const outPad = pad(indent); // 闭合 />
      const slotLines: string[] = [];
      const emit = (name: string) => {
        slotLines.push(`${attrPad}${name}={<>\n${slot(name)}\n${attrPad}</>}`);
      };
      if (hasSider && slot('sider')) emit('sider');
      if (slot('header')) emit('header');
      if (slot('content')) emit('content');
      if (slot('footer')) emit('footer');
      return {
        jsx: `<Layout${attrStr}\n${slotLines.join('\n')}\n${outPad}/>`,
        imports: ['Layout'],
      };
    },
  },
  {
    type: 'Divider',
    label: 'Divider 分割线',
    icon: <Ico n="editor-under-line" />,
    category: '布局',
    component: Divider,
    defaultProps: { orientation: 'center' },
    previewWrapperStyle: { width: '100%' },
    fields: [
      { key: 'children', label: '标题文字', type: 'text', asChildren: true },
      {
        key: 'orientation',
        label: '对齐',
        type: 'select',
        options: [
          { label: 'left', value: 'left' },
          { label: 'center', value: 'center' },
          { label: 'right', value: 'right' },
        ],
      },
      { key: 'dashed', label: '虚线', type: 'boolean' },
      { key: 'plain', label: '弱化', type: 'boolean' },
    ],
  },

  /* ---------- 动效 ---------- */
  {
    type: 'Typewriter',
    label: 'Typewriter 打字机',
    icon: <Ico n="editor-text" />,
    category: '动效',
    component: Typewriter,
    defaultProps: { text: 'Hello, AuroraUI — 正在打字…', speed: 60 },
    fields: [
      { key: 'text', label: '文本', type: 'textarea' },
      { key: 'speed', label: '速度 (ms/字)', type: 'number', min: 10, max: 500 },
      { key: 'loop', label: '循环', type: 'boolean' },
      { key: 'cursor', label: '光标', type: 'boolean' },
    ],
  },
  {
    type: 'Flip',
    label: 'Flip 翻牌器',
    icon: <Ico n="return" />,
    category: '动效',
    component: Flip,
    defaultProps: { value: 2026 },
    fields: [
      { key: 'value', label: '数字', type: 'number' },
      { key: 'size', label: '尺寸', type: 'select', options: smallMediumLarge },
    ],
  },

  /* ---------- 导航 ---------- */
  {
    type: 'Menu',
    label: 'Menu 导航菜单',
    icon: <Ico n="list" />,
    category: '导航',
    component: Menu,
    defaultProps: {
      items: sampleMenuItems,
      mode: 'inline',
      defaultSelectedKeys: ['dashboard'],
      _width: 240,
      _collapsedWidth: 56,
      /* 默认不设 _height — 让 Menu 自动填满父容器 (如 Layout 侧栏).
       * 单独拖在根画布上时内置 minHeight 保证还是像侧栏形态 */
    },
    previewWrapperStyle: { display: 'block' },
    transformProps: (props) => {
      const { _width, _collapsedWidth, _height, style: oldStyle, ...rest } = props;
      const isCollapsed = !!rest.collapsed;
      const style: React.CSSProperties = {
        ...(oldStyle as object),
        maxWidth: '100%',
        height: typeof _height === 'number' ? _height : '100%',
        minHeight: 320,
        overflowY: 'auto',
      };
      if (isCollapsed) {
        // 折叠态: 用 _collapsedWidth, 没设则回退到 Menu 组件默认的 56
        if (typeof _collapsedWidth === 'number') style.width = _collapsedWidth;
      } else {
        if (typeof _width === 'number') style.width = _width;
      }
      const out: Record<string, unknown> = { ...rest, style };
      if (Array.isArray(out.items)) {
        out.items = iconifyItems(out.items as Record<string, unknown>[]);
      }
      return out;
    },
    fields: [
      {
        key: 'items',
        label: '菜单项',
        type: 'json',
        help: '每项: { key, label, icon?("iconfont name"), children?(子菜单) }',
      },
      {
        key: 'defaultSelectedKeys',
        label: '默认选中 (数组)',
        type: 'json',
        help: '示例: ["dashboard"]',
      },
      {
        key: 'mode',
        label: '模式',
        type: 'select',
        options: [
          { label: 'inline (侧边展开)', value: 'inline' },
          { label: 'vertical (竖向)', value: 'vertical' },
          { label: 'horizontal (顶栏)', value: 'horizontal' },
        ],
      },
      {
        key: '_width',
        label: '展开宽度 (px)',
        type: 'number',
        min: 120,
        max: 480,
        step: 4,
        help: '正常状态下的侧栏宽度, 典型 220-260',
      },
      {
        key: '_collapsedWidth',
        label: '折叠宽度 (px)',
        type: 'number',
        min: 40,
        max: 120,
        step: 4,
        help: '折叠状态下的窄条宽度, 典型 56-64',
      },
      {
        key: '_height',
        label: '高度 (px)',
        type: 'number',
        min: 120,
        max: 1200,
        step: 20,
        help: '设成页面高度即可填满侧栏',
      },
      {
        key: 'theme',
        label: '主题',
        type: 'select',
        options: [
          { label: 'light', value: 'light' },
          { label: 'dark', value: 'dark' },
        ],
      },
      { key: 'collapsed', label: '折叠 (inline)', type: 'boolean' },
    ],
  },
  {
    type: 'Breadcrumb',
    label: 'Breadcrumb 面包屑',
    icon: <Ico n="right-arrow" />,
    category: '导航',
    component: Breadcrumb,
    defaultProps: { items: sampleBreadcrumbItems, separator: '/' },
    previewWrapperStyle: { width: '100%' },
    fields: [
      { key: 'items', label: '路径项', type: 'json', help: '每项: { title, href? }' },
      { key: 'separator', label: '分隔符', type: 'text' },
    ],
  },
  {
    type: 'Steps',
    label: 'Steps 步骤条',
    icon: <Ico n="order-success" />,
    category: '导航',
    component: Steps,
    defaultProps: { items: sampleStepsItems, current: 1 },
    previewWrapperStyle: { width: '100%' },
    transformProps: (props) => {
      if (Array.isArray(props.items)) {
        return { ...props, items: iconifyItems(props.items as Record<string, unknown>[]) };
      }
      return props;
    },
    fields: [
      {
        key: 'items',
        label: '步骤数据',
        type: 'json',
        help: '每项: { title, description?, icon?("iconfont name") }',
      },
      { key: 'current', label: '当前步骤', type: 'number', min: 0 },
      {
        key: 'direction',
        label: '方向',
        type: 'select',
        options: [
          { label: 'horizontal', value: 'horizontal' },
          { label: 'vertical', value: 'vertical' },
        ],
      },
      {
        key: 'type',
        label: '类型',
        type: 'select',
        options: [
          { label: 'default', value: 'default' },
          { label: 'dot', value: 'dot' },
          { label: 'navigation', value: 'navigation' },
        ],
      },
      {
        key: 'size',
        label: '尺寸',
        type: 'select',
        options: [
          { label: 'default', value: 'default' },
          { label: 'small', value: 'small' },
        ],
      },
    ],
  },
];

// 排序遵循典型搭页流程:
// 1. 布局 — 先搭骨架 (Layout / Grid / Row)
// 2. 导航 — 框架里先放菜单和面包屑
// 3. 表单 — 表单页高频
// 4. 通用 / 数据录入 / 数据展示 — 往里面填组件
// 5. 可视化 — dashboard 场景
// 6. 反馈 / 动效 — 点缀
export const CATEGORIES: BlockCategory[] = [
  '极光特效',
  '布局',
  '导航',
  '表单',
  '通用',
  '数据录入',
  '数据展示',
  '可视化',
  '反馈',
  '动效',
];

export const getSchema = (type: string): BlockSchema | undefined =>
  REGISTRY.find((r) => r.type === type);

/** 把 schema.slots(静态数组 / 动态函数 / 未定义)统一为字符串数组 */
export const resolveSlots = (
  schema: BlockSchema,
  props: Record<string, unknown>,
): string[] => {
  if (typeof schema.slots === 'function') return schema.slots(props);
  return schema.slots ?? ['default'];
};

/* ---- JSX 代码生成 ---- */

const isPrimitive = (v: unknown): v is string | number | boolean =>
  typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';

/** 判断 prop 值是否"复杂"(数组 / 对象 / 日期等), 只输出占位注释避免生成超长代码 */
const isComplexValue = (v: unknown): boolean => {
  if (v == null) return false;
  if (isPrimitive(v)) return false;
  if (v instanceof Date) return true;
  if (Array.isArray(v)) return true;
  if (typeof v === 'object') return true;
  return false;
};

/**
 * 通用 UI 元 props — 所有块共享这套字段, PageBuilder 右侧属性面板会追加,
 * 最终都合并进目标组件的 `style` 里, 让低代码层也能细调间距 / 尺寸 / 弹性
 */
export const META_STYLE_FIELDS: FieldSchema[] = [
  {
    key: '_padding',
    label: '内边距 (px)',
    type: 'number',
    min: 0,
    max: 96,
    help: '组件内部留白',
  },
  {
    key: '_margin',
    label: '外边距 (px)',
    type: 'number',
    min: 0,
    max: 96,
    help: '与相邻块的距离',
  },
  {
    key: '_width',
    label: '宽度 (px)',
    type: 'number',
    min: 0,
    max: 1600,
    help: '留空则随父容器',
  },
  {
    key: '_height',
    label: '高度 (px)',
    type: 'number',
    min: 0,
    max: 1600,
    help: '留空则随内容',
  },
  {
    key: '_grow',
    label: 'flex 占比',
    type: 'number',
    min: 0,
    max: 10,
    help: '在 Flex/Row 中占剩余空间的比例 (0=不伸展)',
  },
];

/**
 * 把 `_padding / _margin / _width / _height / _grow` 之类的元字段从 props 里抽出,
 * 合并进 style 返回一份新 props。给运行时渲染 + JSX 序列化两条路径共用。
 *
 * 返回 { cleaned, styleAdditions }:
 * - cleaned: 去掉 _X 字段的 props
 * - styleAdditions: 要合进 style 的键值对 (空对象表示没有)
 */
export const extractMetaStyle = (
  props: Record<string, unknown>,
): { cleaned: Record<string, unknown>; styleAdditions: Record<string, unknown> } => {
  const cleaned: Record<string, unknown> = {};
  const add: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === null || v === '') {
      cleaned[k] = v;
      continue;
    }
    switch (k) {
      case '_padding':
        add.padding = typeof v === 'number' ? v : v;
        break;
      case '_margin':
        add.margin = typeof v === 'number' ? v : v;
        break;
      case '_width':
        add.width = typeof v === 'number' ? v : v;
        break;
      case '_height':
        add.height = typeof v === 'number' ? v : v;
        break;
      case '_grow':
        add.flex = v;
        break;
      default:
        cleaned[k] = v;
    }
  }
  return { cleaned, styleAdditions: add };
};

/** 把 props 的 meta 字段注入 style, 返回合并后的 props (渲染期用) */
export const applyMetaToProps = (props: Record<string, unknown>): Record<string, unknown> => {
  const { cleaned, styleAdditions } = extractMetaStyle(props);
  if (Object.keys(styleAdditions).length === 0) return cleaned;
  const style = { ...((cleaned.style as object) ?? {}), ...styleAdditions };
  return { ...cleaned, style };
};

/** style 对象: 输出合法的 React style 字面量, 不用占位注释 */
const serializeStyle = (s: Record<string, unknown>): string => {
  const parts = Object.entries(s)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}: ${typeof v === 'number' ? v : JSON.stringify(v)}`);
  return `{{ ${parts.join(', ')} }}`;
};

/**
 * Hoister — 把复杂 prop(数组/对象)提到组件顶部 useState 里, 原位只留变量名。
 * 这样生成代码就是用户习惯的 React 写法: const [dataSource] = useState([...])
 */
export interface Hoister {
  states: Array<{ name: string; init: string }>;
  allocate: (blockType: string, propKey: string, value: unknown) => string;
}

const camelLower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const camelUpper = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const makeHoister = (): Hoister => {
  const states: Array<{ name: string; init: string }> = [];
  const counts = new Map<string, number>();
  return {
    states,
    allocate(blockType, propKey, value) {
      const stem = camelLower(blockType.replace(/\./g, '')) + camelUpper(propKey);
      const n = (counts.get(stem) ?? 0) + 1;
      counts.set(stem, n);
      const name = n === 1 ? stem : `${stem}${n}`;
      states.push({ name, init: JSON.stringify(value, null, 2) });
      return name;
    },
  };
};

const serializeProp = (
  key: string,
  value: unknown,
  blockType: string,
  hoister?: Hoister,
): string => {
  if (value === true) return key;
  if (typeof value === 'string') return `${key}="${value.replace(/"/g, '&quot;')}"`;
  if (typeof value === 'number') return `${key}={${value}}`;
  if (
    key === 'style' &&
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    return `style=${serializeStyle(value as Record<string, unknown>)}`;
  }
  if (React.isValidElement(value)) {
    return `${key}={/* ReactNode — 代码里填入 */}`;
  }
  if (isComplexValue(value)) {
    // 数组/对象 → 提到顶部 useState, 属性值只留变量名
    if (hoister) {
      const varName = hoister.allocate(blockType, key, value);
      return `${key}={${varName}}`;
    }
    // 没传 hoister 的兜底路径 (toJsx): 内联 JSON
    return `${key}={${JSON.stringify(value, null, 2)}}`;
  }
  return `${key}={${JSON.stringify(value)}}`;
};

const pad = (n: number) => '  '.repeat(n);

export interface BlockConfig {
  id: string;
  type: string;
  props: Record<string, unknown>;
  /**
   * 容器块的具名插槽 -> 子块数组
   * 单插槽容器 (Row) 用 slots.default; 多插槽容器 (Layout) 用各自 slot 名
   */
  slots?: Record<string, BlockConfig[]>;
}

const renderBlockJsx = (
  b: BlockConfig,
  indent: number,
  hoister?: Hoister,
): { jsx: string; imports: string[] } => {
  const schema = getSchema(b.type);
  if (!schema) return { jsx: `${pad(indent)}{/* unknown: ${b.type} */}`, imports: [] };

  // 容器: 递归渲染每个 slot
  if (schema.isContainer) {
    const slotNames = resolveSlots(schema, b.props);
    const slotJsx: Record<string, string> = {};
    const allImports = new Set<string>();
    for (const name of slotNames) {
      const children = b.slots?.[name] ?? [];
      // 子块向内缩进 1 级 (2 空格), 跟主流代码风格一致
      const rendered = children.map((c) => {
        const out = renderBlockJsx(c, indent + 1, hoister);
        out.imports.forEach((n) => allImports.add(n));
        return out.jsx;
      });
      slotJsx[name] = rendered.join('\n');
    }
    if (schema.serialize) {
      const out = schema.serialize(b.props, slotJsx, indent, hoister);
      out.imports.forEach((n) => allImports.add(n));
      return { jsx: `${pad(indent)}${out.jsx}`, imports: Array.from(allImports) };
    }
    // 没有 serialize 的容器: 默认按 tag 包裹 default slot
    allImports.add(b.type);
    const body = slotJsx.default ?? '';
    return {
      jsx: `${pad(indent)}<${b.type}>\n${body}\n${pad(indent)}</${b.type}>`,
      imports: Array.from(allImports),
    };
  }

  // 叶子 + 自定义 serialize (FormItem 组合块)
  if (schema.serialize) {
    const out = schema.serialize(b.props, undefined, indent, hoister);
    return { jsx: `${pad(indent)}${out.jsx}`, imports: out.imports };
  }

  // 叶子: 默认序列化
  // 把通用 _padding/_margin/_width/_height/_grow 元字段合并进 style, 用户拿到的代码就是标准 React 写法
  const mergedProps = applyMetaToProps(b.props);

  const propEntries = Object.entries(mergedProps).filter(([k, v]) => {
    if (k === 'children') return false;
    if (v === undefined || v === null || v === '' || v === false) return false;
    return true;
  });
  const children = b.props.children;
  const propsStr = propEntries.length
    ? propEntries.map(([k, v]) => ' ' + serializeProp(k, v, b.type, hoister)).join('')
    : '';
  const importName = b.type.includes('.') ? b.type.split('.')[0] : b.type;
  const imports = [importName];
  if (children != null && children !== '' && isPrimitive(children)) {
    const childStr = String(children);
    if (childStr.length < 32 && !childStr.includes('\n')) {
      return { jsx: `${pad(indent)}<${b.type}${propsStr}>${childStr}</${b.type}>`, imports };
    }
    return {
      jsx: `${pad(indent)}<${b.type}${propsStr}>\n${pad(indent + 1)}${childStr}\n${pad(indent)}</${b.type}>`,
      imports,
    };
  }
  return { jsx: `${pad(indent)}<${b.type}${propsStr} />`, imports };
};

export const toJsx = (blocks: BlockConfig[], indent = 2): string => {
  if (blocks.length === 0) return `${pad(indent)}{/* 空页面 */}`;
  return blocks.map((b) => renderBlockJsx(b, indent).jsx).join('\n');
};

export const wrapAsComponent = (
  blocks: BlockConfig[],
  componentName = 'GeneratedPage',
): string => {
  const hoister = makeHoister();
  const allImports = new Set<string>();
  const bodyLines: string[] = [];
  // 有 useState 时 body 在 `return (\n    <>` 内部, 缩进深 1 级 → 用 pad(3) 做顶层块起点
  for (const b of blocks) {
    const out = renderBlockJsx(b, 3, hoister);
    bodyLines.push(out.jsx);
    out.imports.forEach((n) => allImports.add(n));
  }
  const importNames = Array.from(allImports);
  const hasStates = hoister.states.length > 0;
  const reactImport = hasStates
    ? `import React, { useState } from 'react';`
    : `import React from 'react';`;
  const auroraImport = importNames.length
    ? `import { ${importNames.join(', ')} } from 'aurora-ux';`
    : '';
  const imports = [reactImport, auroraImport].filter(Boolean).join('\n');
  const body = bodyLines.join('\n') || `${pad(3)}{/* 空页面 */}`;

  // useState 声明, 每行按 2 空格缩进 (在函数体内)
  const stateDecls = hoister.states
    .map((s) => {
      // 让大 JSON 整体缩进跟函数体对齐: 2 空格 prefix + 原文换行前加 2 空格
      const indented = s.init.replace(/\n/g, '\n  ');
      return `  const [${s.name}] = useState(${indented});`;
    })
    .join('\n');

  return `${imports}

const ${componentName} = () => {${stateDecls ? '\n' + stateDecls + '\n' : ''}
  return (
    <>
${body}
    </>
  );
};

export default ${componentName};
`;
};

/* ---- 树操作辅助 ---- */

/** 找到 block 的位置:{ parentId, slotName, index } */
export const findBlockLocation = (
  blocks: BlockConfig[],
  id: string,
  parentId: string | null = null,
): { parentId: string | null; slotName: string; index: number } | null => {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.id === id) {
      // 如果 parentId === null, 此 block 在 root, slotName 用 'default' 作占位
      return { parentId, slotName: 'default', index: i };
    }
    if (b.slots) {
      for (const [slotName, children] of Object.entries(b.slots)) {
        for (let j = 0; j < children.length; j++) {
          if (children[j].id === id) {
            return { parentId: b.id, slotName, index: j };
          }
          // 继续递归 (孙子层, 虽然 v1 我们不鼓励, 但保留)
          const deeper = findBlockLocation([children[j]], id, b.id);
          if (deeper && deeper.parentId !== b.id) return deeper;
        }
      }
    }
  }
  return null;
};

/** 不可变地更新指定 block */
const mapBlocks = (
  blocks: BlockConfig[],
  fn: (b: BlockConfig) => BlockConfig | null,
): BlockConfig[] => {
  const out: BlockConfig[] = [];
  for (const b of blocks) {
    const m = fn(b);
    if (m == null) continue; // 被移除
    if (m.slots) {
      const newSlots: Record<string, BlockConfig[]> = {};
      for (const [k, v] of Object.entries(m.slots)) {
        newSlots[k] = mapBlocks(v, fn);
      }
      out.push({ ...m, slots: newSlots });
    } else {
      out.push(m);
    }
  }
  return out;
};

export const removeBlockById = (blocks: BlockConfig[], id: string): BlockConfig[] =>
  mapBlocks(blocks, (b) => (b.id === id ? null : b));

export const insertBlock = (
  blocks: BlockConfig[],
  block: BlockConfig,
  parentId: string | null,
  slotName: string,
  index: number,
): BlockConfig[] => {
  if (parentId === null) {
    const next = [...blocks];
    next.splice(index, 0, block);
    return next;
  }
  return mapBlocks(blocks, (b) => {
    if (b.id !== parentId) return b;
    const currentSlots = b.slots ?? {};
    const slotChildren = [...(currentSlots[slotName] ?? [])];
    slotChildren.splice(index, 0, block);
    return { ...b, slots: { ...currentSlots, [slotName]: slotChildren } };
  });
};

export const updateBlockProps = (
  blocks: BlockConfig[],
  id: string,
  nextProps: Record<string, unknown>,
): BlockConfig[] =>
  mapBlocks(blocks, (b) => (b.id === id ? { ...b, props: nextProps } : b));

/** 递归找 block (含子树) */
export const findBlockById = (
  blocks: BlockConfig[],
  id: string,
): BlockConfig | null => {
  for (const b of blocks) {
    if (b.id === id) return b;
    if (b.slots) {
      for (const children of Object.values(b.slots)) {
        const found = findBlockById(children, id);
        if (found) return found;
      }
    }
  }
  return null;
};

export const toJson = (blocks: BlockConfig[]): string =>
  JSON.stringify(
    blocks.map((b) => {
      const cleaned: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(b.props)) {
        // React 元素无法 JSON 化, 标记成占位, 其他照实保留
        if (React.isValidElement(v)) {
          cleaned[k] = '<ReactNode>';
        } else {
          cleaned[k] = v;
        }
      }
      return { type: b.type, props: cleaned };
    }),
    null,
    2,
  );
