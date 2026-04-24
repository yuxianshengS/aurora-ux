import React, { useState } from 'react';
import { Select } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const cityOptions = [
  { label: '北京', value: 'bj' },
  { label: '上海', value: 'sh' },
  { label: '广州', value: 'gz' },
  { label: '深圳', value: 'sz' },
  { label: '杭州', value: 'hz' },
  { label: '成都', value: 'cd' },
];

const SelectDoc: React.FC = () => {
  return (
    <>
      <h1>Select 选择器</h1>
      <p>
        下拉选择。支持单选 / 多选、搜索过滤、清除、禁用项,
        受控与非受控两种模式。面板通过 <code>Portal</code> 渲染,
        自动避开视口边缘。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="传入 options 数组即可,默认非受控。"
        code={`<Select
  options={[
    { label: '北京', value: 'bj' },
    { label: '上海', value: 'sh' },
  ]}
  placeholder="请选择城市"
/>`}
      >
        <Select options={cityOptions} placeholder="请选择城市" />
      </DemoBlock>

      <DemoBlock
        title="受控 + 事件"
        description="传入 value 进入受控; onChange 同时拿到 value 和完整 option。"
        code={`const [v, setV] = useState('bj');

<Select value={v} onChange={setV} options={...} />`}
      >
        <ControlledDemo />
      </DemoBlock>

      <DemoBlock
        title="可清除"
        description="allowClear 显示清除图标。"
        code={`<Select allowClear defaultValue="sh" options={...} />`}
      >
        <Select allowClear defaultValue="sh" options={cityOptions} />
      </DemoBlock>

      <DemoBlock
        title="多选"
        description="multiple 模式,值为数组,选项带勾选标记。"
        code={`<Select
  multiple
  allowClear
  defaultValue={['bj', 'sh']}
  options={...}
/>`}
      >
        <Select
          multiple
          allowClear
          defaultValue={['bj', 'sh']}
          options={cityOptions}
          style={{ width: 320 }}
        />
      </DemoBlock>

      <DemoBlock
        title="可搜索过滤"
        description="filterable 启用内置过滤,按 label 匹配。"
        code={`<Select filterable allowClear options={...} />`}
      >
        <Select filterable allowClear options={cityOptions} />
      </DemoBlock>

      <DemoBlock
        title="禁用项"
        description="选项 disabled 单独禁用,组件 disabled 全部禁用。"
        code={`<Select options={[
  { label: '可选', value: 1 },
  { label: '禁用项', value: 2, disabled: true },
]} />`}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Select
            options={[
              { label: '可选 A', value: 1 },
              { label: '禁用 B', value: 2, disabled: true },
              { label: '可选 C', value: 3 },
            ]}
            placeholder="含禁用项"
          />
          <Select options={cityOptions} defaultValue="bj" disabled />
        </div>
      </DemoBlock>

      <DemoBlock
        title="尺寸"
        description="small / medium / large。"
        code={`<Select size="small" options={...} />
<Select size="medium" options={...} />
<Select size="large" options={...} />`}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Select size="small" options={cityOptions} placeholder="小" />
          <Select size="medium" options={cityOptions} placeholder="中" />
          <Select size="large" options={cityOptions} placeholder="大" />
        </div>
      </DemoBlock>

      <DemoBlock
        title="状态"
        description="status='error' / 'warning' 快速切换外观。"
        code={`<Select status="error" options={...} />
<Select status="warning" options={...} />`}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Select status="error" options={cityOptions} placeholder="错误" />
          <Select status="warning" options={cityOptions} placeholder="警告" />
        </div>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'options', desc: '选项数组', type: '{ label, value, disabled? }[]', default: '-' },
          { prop: 'value', desc: '受控值', type: 'V | V[] | null', default: '-' },
          { prop: 'defaultValue', desc: '非受控默认值', type: 'V | V[] | null', default: '-' },
          { prop: 'onChange', desc: '值变化', type: '(value, option) => void', default: '-' },
          { prop: 'placeholder', desc: '未选中时占位文本', type: 'string', default: `'请选择'` },
          { prop: 'multiple', desc: '多选模式', type: 'boolean', default: 'false' },
          { prop: 'filterable', desc: '可搜索过滤', type: 'boolean', default: 'false' },
          { prop: 'allowClear', desc: '显示清除按钮', type: 'boolean', default: 'false' },
          { prop: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
          { prop: 'size', desc: '尺寸', type: `'small' | 'medium' | 'large'`, default: `'medium'` },
          { prop: 'status', desc: '校验状态', type: `'error' | 'warning'`, default: '-' },
          { prop: 'maxTagCount', desc: '多选模式最多显示标签数,余下折叠为 +N', type: 'number', default: '-' },
          { prop: 'popupMaxHeight', desc: '下拉面板最大高度', type: 'number', default: '240' },
          { prop: 'onSearch', desc: '搜索关键字变化', type: '(kw: string) => void', default: '-' },
          { prop: 'onOpenChange', desc: '下拉展开 / 收起', type: '(open: boolean) => void', default: '-' },
          { prop: 'notFoundContent', desc: '无匹配时的占位', type: 'ReactNode', default: `'无匹配项'` },
        ]}
      />
    </>
  );
};

const ControlledDemo: React.FC = () => {
  const [v, setV] = useState<string | null>('bj');
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Select
        value={v}
        onChange={(val) => setV(val as string | null)}
        options={cityOptions}
        allowClear
      />
      <span style={{ fontSize: 13, color: 'var(--au-text-2)' }}>
        当前: {v ?? '(空)'}
      </span>
    </div>
  );
};

export default SelectDoc;
