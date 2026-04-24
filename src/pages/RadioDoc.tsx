import React, { useState } from 'react';
import { Radio } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const RadioDoc: React.FC = () => {
  return (
    <>
      <h1>Radio 单选框</h1>
      <p>
        单选框。独立使用或通过 <code>Radio.Group</code> 组织为一组互斥选项。
        支持经典样式与按钮样式,提供横向 / 纵向排列与尺寸调节。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="单个 Radio,用 defaultChecked / checked 控制。"
        code={`<Radio value="a" defaultChecked>选项 A</Radio>
<Radio value="b">选项 B</Radio>`}
      >
        <div style={{ display: 'flex', gap: 16 }}>
          <Radio value="a" defaultChecked>
            选项 A
          </Radio>
          <Radio value="b">选项 B</Radio>
        </div>
      </DemoBlock>

      <DemoBlock
        title="Radio.Group (非受控)"
        description="通过 options 或包裹子 Radio 使用, defaultValue 指定初始值。"
        code={`<Radio.Group
  defaultValue="b"
  options={[
    { label: '苹果', value: 'a' },
    { label: '香蕉', value: 'b' },
    { label: '橘子', value: 'c' },
  ]}
/>`}
      >
        <Radio.Group
          defaultValue="b"
          options={[
            { label: '苹果', value: 'a' },
            { label: '香蕉', value: 'b' },
            { label: '橘子', value: 'c' },
          ]}
        />
      </DemoBlock>

      <DemoBlock
        title="受控 + 事件"
        description="传入 value 进入受控模式。"
        code={`const [v, setV] = useState('a');

<Radio.Group value={v} onChange={setV} options={...} />`}
      >
        <ControlledDemo />
      </DemoBlock>

      <DemoBlock
        title="按钮样式"
        description="optionType='button' 使用按钮样式,常用于筛选条。"
        code={`<Radio.Group
  optionType="button"
  defaultValue="day"
  options={[
    { label: '今日', value: 'day' },
    { label: '本周', value: 'week' },
    { label: '本月', value: 'month' },
  ]}
/>`}
      >
        <Radio.Group
          optionType="button"
          defaultValue="day"
          options={[
            { label: '今日', value: 'day' },
            { label: '本周', value: 'week' },
            { label: '本月', value: 'month' },
          ]}
        />
      </DemoBlock>

      <DemoBlock
        title="尺寸"
        description="small / medium / large。"
        code={`<Radio.Group size="small" ... />
<Radio.Group size="medium" ... />
<Radio.Group size="large" ... />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Radio.Group
            size="small"
            optionType="button"
            defaultValue="1"
            options={[
              { label: '小', value: '1' },
              { label: '选项', value: '2' },
              { label: '按钮', value: '3' },
            ]}
          />
          <Radio.Group
            size="medium"
            optionType="button"
            defaultValue="1"
            options={[
              { label: '中', value: '1' },
              { label: '选项', value: '2' },
              { label: '按钮', value: '3' },
            ]}
          />
          <Radio.Group
            size="large"
            optionType="button"
            defaultValue="1"
            options={[
              { label: '大', value: '1' },
              { label: '选项', value: '2' },
              { label: '按钮', value: '3' },
            ]}
          />
        </div>
      </DemoBlock>

      <DemoBlock
        title="纵向排列"
        description="direction='vertical'。"
        code={`<Radio.Group direction="vertical" options={...} />`}
      >
        <Radio.Group
          direction="vertical"
          defaultValue="m"
          options={[
            { label: '男', value: 'm' },
            { label: '女', value: 'f' },
            { label: '保密', value: 'x' },
          ]}
        />
      </DemoBlock>

      <DemoBlock
        title="禁用"
        description="组件级 disabled 全部禁用; options 内 disabled 单个禁用。"
        code={`<Radio.Group disabled defaultValue="a" options={...} />
<Radio.Group options={[
  { label: 'A', value: 'a' },
  { label: 'B (禁)', value: 'b', disabled: true },
]} />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Radio.Group
            disabled
            defaultValue="a"
            options={[
              { label: 'A', value: 'a' },
              { label: 'B', value: 'b' },
            ]}
          />
          <Radio.Group
            defaultValue="a"
            options={[
              { label: 'A', value: 'a' },
              { label: 'B (禁)', value: 'b', disabled: true },
              { label: 'C', value: 'c' },
            ]}
          />
        </div>
      </DemoBlock>

      <h2>API</h2>
      <h3>Radio</h3>
      <ApiTable
        rows={[
          { prop: 'value', desc: '选项值 (Group 用它标识)', type: 'string | number | boolean', default: '-' },
          { prop: 'checked', desc: '受控选中', type: 'boolean', default: '-' },
          { prop: 'defaultChecked', desc: '非受控默认选中', type: 'boolean', default: 'false' },
          { prop: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
          { prop: 'onChange', desc: '原生 change 事件', type: '(e) => void', default: '-' },
        ]}
      />
      <h3>Radio.Group</h3>
      <ApiTable
        rows={[
          { prop: 'value', desc: '受控选中值', type: 'string | number | boolean', default: '-' },
          { prop: 'defaultValue', desc: '默认值', type: 'string | number | boolean', default: '-' },
          { prop: 'onChange', desc: '值变化', type: '(value) => void', default: '-' },
          { prop: 'options', desc: '选项数组 (与 children 二选一)', type: '{ label, value, disabled? }[]', default: '-' },
          { prop: 'optionType', desc: '样式类型', type: `'default' | 'button'`, default: `'default'` },
          { prop: 'direction', desc: '排列方向', type: `'horizontal' | 'vertical'`, default: `'horizontal'` },
          { prop: 'size', desc: '尺寸', type: `'small' | 'medium' | 'large'`, default: `'medium'` },
          { prop: 'disabled', desc: '整组禁用', type: 'boolean', default: 'false' },
        ]}
      />
    </>
  );
};

const ControlledDemo: React.FC = () => {
  const [v, setV] = useState<string | number | boolean>('a');
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Radio.Group
        value={v}
        onChange={setV}
        options={[
          { label: '苹果', value: 'a' },
          { label: '香蕉', value: 'b' },
          { label: '橘子', value: 'c' },
        ]}
      />
      <span style={{ fontSize: 13, color: 'var(--au-text-2)' }}>当前: {String(v)}</span>
    </div>
  );
};

export default RadioDoc;
