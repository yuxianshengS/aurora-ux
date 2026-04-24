import React, { useMemo, useState } from 'react';
import { Checkbox } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const hobbies = [
  { label: '阅读', value: 'read' },
  { label: '运动', value: 'sport' },
  { label: '音乐', value: 'music' },
  { label: '摄影', value: 'photo' },
];

const CheckboxDoc: React.FC = () => {
  return (
    <>
      <h1>Checkbox 多选框</h1>
      <p>
        多选框。独立使用或通过 <code>Checkbox.Group</code> 组织成组。
        支持半选 (<code>indeterminate</code>) 状态,常用于全选表头。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="独立使用,通过 onChange 获取当前状态。"
        code={`<Checkbox defaultChecked onChange={c => console.log(c)}>
  同意协议
</Checkbox>`}
      >
        <Checkbox defaultChecked>同意协议</Checkbox>
      </DemoBlock>

      <DemoBlock
        title="Checkbox.Group (非受控)"
        description="options 数组快速生成一组选项。"
        code={`<Checkbox.Group
  defaultValue={['read', 'music']}
  options={[
    { label: '阅读', value: 'read' },
    { label: '运动', value: 'sport' },
    { label: '音乐', value: 'music' },
  ]}
/>`}
      >
        <Checkbox.Group defaultValue={['read', 'music']} options={hobbies} />
      </DemoBlock>

      <DemoBlock
        title="受控 + 事件"
        description="传入 value 进入受控模式,值为数组。"
        code={`const [v, setV] = useState(['read']);

<Checkbox.Group value={v} onChange={setV} options={...} />`}
      >
        <ControlledDemo />
      </DemoBlock>

      <DemoBlock
        title="半选 · 全选联动"
        description="经典列表全选:全选框读 indeterminate + checked 状态。"
        code={`// 父全选联动子选项
const all = options.length;
const checkedAll = value.length === all;
const partial = value.length > 0 && value.length < all;

<Checkbox
  indeterminate={partial}
  checked={checkedAll}
  onChange={(c) => setValue(c ? options.map(o => o.value) : [])}
>
  全选
</Checkbox>`}
      >
        <CheckAllDemo />
      </DemoBlock>

      <DemoBlock
        title="纵向排列"
        description="direction='vertical'。"
        code={`<Checkbox.Group direction="vertical" options={...} />`}
      >
        <Checkbox.Group direction="vertical" defaultValue={['read']} options={hobbies} />
      </DemoBlock>

      <DemoBlock
        title="尺寸"
        description="small / medium / large。"
        code={`<Checkbox.Group size="small" options={...} />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Checkbox.Group size="small" defaultValue={['a']} options={[{ label: '小', value: 'a' }, { label: '项', value: 'b' }]} />
          <Checkbox.Group size="medium" defaultValue={['a']} options={[{ label: '中', value: 'a' }, { label: '项', value: 'b' }]} />
          <Checkbox.Group size="large" defaultValue={['a']} options={[{ label: '大', value: 'a' }, { label: '项', value: 'b' }]} />
        </div>
      </DemoBlock>

      <DemoBlock
        title="禁用"
        description="组件级 / 单项级 两种禁用方式。"
        code={`<Checkbox.Group disabled defaultValue={['a']} options={...} />
<Checkbox.Group options={[
  { label: 'A', value: 'a' },
  { label: 'B (禁)', value: 'b', disabled: true },
]} />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Checkbox.Group disabled defaultValue={['a']} options={[{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }]} />
          <Checkbox.Group
            defaultValue={['a']}
            options={[
              { label: 'A', value: 'a' },
              { label: 'B (禁)', value: 'b', disabled: true },
              { label: 'C', value: 'c' },
            ]}
          />
        </div>
      </DemoBlock>

      <h2>API</h2>
      <h3>Checkbox</h3>
      <ApiTable
        rows={[
          { prop: 'value', desc: '选项值 (Group 用它标识)', type: 'string | number | boolean', default: '-' },
          { prop: 'checked', desc: '受控选中', type: 'boolean', default: '-' },
          { prop: 'defaultChecked', desc: '非受控默认选中', type: 'boolean', default: 'false' },
          { prop: 'indeterminate', desc: '半选状态', type: 'boolean', default: 'false' },
          { prop: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
          { prop: 'onChange', desc: '选中变化', type: '(checked, e) => void', default: '-' },
        ]}
      />
      <h3>Checkbox.Group</h3>
      <ApiTable
        rows={[
          { prop: 'value', desc: '受控选中值数组', type: 'Array<string | number | boolean>', default: '-' },
          { prop: 'defaultValue', desc: '默认值', type: 'Array<string | number | boolean>', default: '[]' },
          { prop: 'onChange', desc: '值变化', type: '(value) => void', default: '-' },
          { prop: 'options', desc: '选项数组 (与 children 二选一)', type: '{ label, value, disabled? }[]', default: '-' },
          { prop: 'direction', desc: '排列方向', type: `'horizontal' | 'vertical'`, default: `'horizontal'` },
          { prop: 'size', desc: '尺寸', type: `'small' | 'medium' | 'large'`, default: `'medium'` },
          { prop: 'disabled', desc: '整组禁用', type: 'boolean', default: 'false' },
        ]}
      />
    </>
  );
};

const ControlledDemo: React.FC = () => {
  const [v, setV] = useState<(string | number | boolean)[]>(['read']);
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Checkbox.Group value={v} onChange={setV} options={hobbies} />
      <span style={{ fontSize: 13, color: 'var(--au-text-2)' }}>
        当前: {v.length ? v.join(', ') : '(空)'}
      </span>
    </div>
  );
};

const CheckAllDemo: React.FC = () => {
  const [v, setV] = useState<(string | number | boolean)[]>(['read']);
  const all = useMemo(() => hobbies.map((h) => h.value), []);
  const checkedAll = v.length === all.length;
  const partial = v.length > 0 && !checkedAll;
  return (
    <div>
      <div
        style={{
          borderBottom: '1px solid var(--au-border)',
          paddingBottom: 8,
          marginBottom: 10,
        }}
      >
        <Checkbox
          checked={checkedAll}
          indeterminate={partial}
          onChange={(c) => setV(c ? all : [])}
        >
          全选 ({v.length}/{all.length})
        </Checkbox>
      </div>
      <Checkbox.Group value={v} onChange={setV} options={hobbies} />
    </div>
  );
};

export default CheckboxDoc;
