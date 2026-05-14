import React, { useState } from 'react';
import { Cascader } from '../components';
import type { CascaderOption } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const regionOptions: CascaderOption[] = [
  {
    value: 'huadong',
    label: '华东',
    children: [
      {
        value: 'sh',
        label: '上海',
        children: [
          { value: 'pd', label: '浦东新区' },
          { value: 'mh', label: '闵行区' },
          { value: 'xh', label: '徐汇区' },
        ],
      },
      {
        value: 'hz',
        label: '杭州',
        children: [
          { value: 'xs', label: '西湖区' },
          { value: 'gs', label: '拱墅区' },
        ],
      },
    ],
  },
  {
    value: 'huanan',
    label: '华南',
    children: [
      {
        value: 'gz',
        label: '广州',
        children: [
          { value: 'thy', label: '天河区' },
          { value: 'hzh', label: '海珠区' },
        ],
      },
      {
        value: 'sz',
        label: '深圳',
        children: [
          { value: 'nsh', label: '南山区' },
          { value: 'fc', label: '福田区' },
        ],
      },
    ],
  },
  {
    value: 'huabei',
    label: '华北',
    children: [
      {
        value: 'bj',
        label: '北京',
        children: [
          { value: 'cy', label: '朝阳区' },
          { value: 'hd', label: '海淀区' },
          { value: 'xc', label: '西城区', disabled: true },
        ],
      },
    ],
  },
];

const categoryOptions: CascaderOption[] = [
  {
    value: 'electronics',
    label: '电子产品',
    children: [
      {
        value: 'phone',
        label: '手机',
        children: [
          { value: 'iphone', label: 'iPhone' },
          { value: 'android', label: 'Android' },
        ],
      },
      {
        value: 'laptop',
        label: '笔记本',
        children: [
          { value: 'macbook', label: 'MacBook' },
          { value: 'thinkpad', label: 'ThinkPad' },
        ],
      },
    ],
  },
  {
    value: 'clothing',
    label: '服装',
    children: [
      { value: 'shirt', label: 'T 恤' },
      { value: 'pants', label: '裤子' },
    ],
  },
];

const CascaderMultiDemo: React.FC = () => {
  const [v, setV] = useState<(string | number)[][]>([
    ['huadong', 'sh', 'pd'],
    ['huanan', 'sz', 'nsh'],
  ]);
  return (
    <Cascader
      options={regionOptions}
      multiple
      value={v}
      onChange={(next) => setV(next as (string | number)[][])}
      placeholder="可勾选多个区"
      allowClear
      maxTagCount={3}
    />
  );
};

const CascaderDoc: React.FC = () => {
  const [v1, setV1] = useState<(string | number)[]>([]);
  const [v2, setV2] = useState<(string | number)[]>([]);
  const [v3, setV3] = useState<(string | number)[]>(['huadong', 'sh', 'pd']);
  return (
    <>
      <h1>Cascader 级联选择</h1>
      <p>
        从一组关联数据集合里逐级选择. 适合层级深 (≤ 4 级) 但每级宽度可控的场景: 省市区 / 商品分类 /
        部门组织. 跟 TreeSelect 的差别: Cascader 横向"逐级钻入", TreeSelect 纵向"整棵树展开看".
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        code={`const options = [
  { value: 'huadong', label: '华东', children: [
    { value: 'sh', label: '上海', children: [
      { value: 'pd', label: '浦东新区' },
      { value: 'mh', label: '闵行区' },
    ]},
  ]},
  { value: 'gd', label: '广东省', children: [
    { value: 'gz', label: '广州市', children: [
      { value: 'th', label: '天河区' },
    ]},
  ]},
];

<Cascader
  options={options}
  value={v}
  onChange={setV}
  placeholder="请选择省/市/区"
/>`}
      >
        <Cascader
          options={regionOptions}
          value={v1}
          onChange={(v) => setV1(v as (string | number)[])}
          placeholder="请选择省/市/区"
          allowClear
        />
      </DemoBlock>

      <DemoBlock
        title="changeOnSelect — 允许选中任意层级"
        code={`<Cascader
  options={options}
  changeOnSelect
  value={v}
  onChange={setV}
/>`}
      >
        <Cascader
          options={categoryOptions}
          changeOnSelect
          value={v2}
          onChange={(v) => setV2(v as (string | number)[])}
          placeholder="选大类或细类都行"
          allowClear
        />
      </DemoBlock>

      <DemoBlock
        title="hover 触发钻入"
        code={`<Cascader options={options} expandTrigger="hover" />`}
      >
        <Cascader
          options={regionOptions}
          expandTrigger="hover"
          placeholder="悬停一级即自动钻入"
          allowClear
        />
      </DemoBlock>

      <DemoBlock
        title="默认值"
        code={`<Cascader
  options={options}
  defaultValue={['huadong', 'sh', 'pd']}
/>`}
      >
        <Cascader
          options={regionOptions}
          value={v3}
          onChange={(v) => setV3(v as (string | number)[])}
          allowClear
        />
      </DemoBlock>

      <DemoBlock
        title="禁用 / 状态色"
        code={`<Cascader options={options} disabled />
<Cascader options={options} status="error" />
<Cascader options={options} status="warning" />`}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Cascader options={regionOptions} disabled placeholder="已禁用" />
          <Cascader options={regionOptions} status="error" placeholder="错误状态" />
          <Cascader options={regionOptions} status="warning" placeholder="警告状态" />
        </div>
      </DemoBlock>

      <DemoBlock
        title="尺寸"
        code={`<Cascader options={options} size="small" />
<Cascader options={options} size="medium" />
<Cascader options={options} size="large" />`}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Cascader options={regionOptions} size="small" placeholder="small" />
          <Cascader options={regionOptions} size="medium" placeholder="medium" />
          <Cascader options={regionOptions} size="large" placeholder="large" />
        </div>
      </DemoBlock>

      <DemoBlock
        title="多选 — 勾叶子节点, 触发器显示 tag 列表"
        code={`<Cascader
  options={options}
  multiple
  value={v}
  onChange={setV}
  placeholder="可勾选多个区"
/>`}
      >
        <CascaderMultiDemo />
      </DemoBlock>

      <DemoBlock
        title="自定义路径渲染 — 仅显示叶子名"
        code={`<Cascader
  options={options}
  displayRender={(labels) => labels[labels.length - 1]}
/>`}
      >
        <Cascader
          options={regionOptions}
          displayRender={(labels) => (labels.length === 0 ? null : labels[labels.length - 1])}
          placeholder="只显示最末一级"
        />
      </DemoBlock>

      <DemoBlock title="禁用某项" code={`{ value: 'xc', label: '西城区', disabled: true }`}>
        <p style={{ color: 'var(--au-text-3)', marginTop: 0 }}>
          上面"基础用法"里的「华北 / 北京 / 西城区」就是禁用项.
        </p>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'options', desc: '级联数据', type: 'CascaderOption[]', default: '-' },
          {
            prop: 'value / defaultValue',
            desc: '受控 / 默认值 (路径数组)',
            type: '(string | number)[]',
            default: '-',
          },
          { prop: 'placeholder', desc: '占位文字', type: 'string', default: `'请选择'` },
          { prop: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
          { prop: 'allowClear', desc: '允许清除', type: 'boolean', default: 'false' },
          {
            prop: 'multiple',
            desc: '多选模式 (仅叶子可勾, 触发器显示 tag 列表)',
            type: 'boolean',
            default: 'false',
          },
          {
            prop: 'maxTagCount',
            desc: '多选时最多展示的 tag 数, 超出显示 +N. 0 = 全显',
            type: 'number',
            default: '0',
          },
          { prop: 'size', desc: '尺寸', type: `'small' | 'medium' | 'large'`, default: `'medium'` },
          {
            prop: 'expandTrigger',
            desc: '钻入下一级的触发方式',
            type: `'click' | 'hover'`,
            default: `'click'`,
          },
          { prop: 'changeOnSelect', desc: '允许选中非叶子节点', type: 'boolean', default: 'false' },
          {
            prop: 'displayRender',
            desc: '自定义触发器路径展示',
            type: '(labels, options) => ReactNode',
            default: 'separator 拼接',
          },
          { prop: 'separator', desc: '路径分隔符', type: 'ReactNode', default: `'/'` },
          { prop: 'status', desc: '状态色', type: `'error' | 'warning'`, default: '-' },
          { prop: 'columnWidth', desc: '单列宽度 (px)', type: 'number', default: '140' },
          {
            prop: 'columnMaxHeight',
            desc: '列最大高度 (px, 超出滚动)',
            type: 'number',
            default: '240',
          },
          {
            prop: 'onChange',
            desc: '选中回调',
            type: '(value, selectedOptions) => void',
            default: '-',
          },
          { prop: 'onOpenChange', desc: '弹层显隐回调', type: '(open) => void', default: '-' },
        ]}
      />

      <h2>CascaderOption</h2>
      <ApiTable
        rows={[
          { prop: 'value', desc: '选项值', type: 'string | number', default: '-' },
          { prop: 'label', desc: '展示文字', type: 'ReactNode', default: '-' },
          { prop: 'disabled', desc: '禁用该项', type: 'boolean', default: 'false' },
          { prop: 'children', desc: '子级选项', type: 'CascaderOption[]', default: '-' },
        ]}
      />
    </>
  );
};

export default CascaderDoc;
