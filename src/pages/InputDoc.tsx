import React, { useState } from 'react';
import { Input } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';
import Playground from '../site-components/Playground';

const InputDoc: React.FC = () => {
  const [value, setValue] = useState('');
  return (
    <>
      <h1>Input 输入框</h1>
      <p>通过鼠标或键盘输入内容，是最基础的表单域元素。</p>

      <h2>代码演示</h2>

      <DemoBlock title="基础用法" code={`<Input placeholder="请输入内容" />`}>
        <Input placeholder="请输入内容" />
      </DemoBlock>

      <DemoBlock
        title="三种尺寸"
        code={`<Input size="large" placeholder="Large" />
<Input placeholder="Medium" />
<Input size="small" placeholder="Small" />`}
      >
        <Input size="large" placeholder="Large" />
        <Input placeholder="Medium" />
        <Input size="small" placeholder="Small" />
      </DemoBlock>

      <DemoBlock title="前后缀" code={`<Input prefix="¥" suffix="RMB" placeholder="金额" />`}>
        <Input prefix="¥" suffix="RMB" placeholder="金额" />
      </DemoBlock>

      <DemoBlock
        title="可清除 (allowClear)"
        description="value 非空时右侧出现 ✕, 点击清空. 受控 / 非受控都生效 (受控走原 onChange 回调, value 重置为 '')."
        code={`// 非受控 — defaultValue 起手, allowClear 立刻能看到
<Input defaultValue="hello world" allowClear placeholder="可清除" />

// 受控 — 输入后右侧出现 ✕, 点击触发 onChange 收到 value === ''
const [v, setV] = useState('');
<Input value={v} onChange={(e) => setV(e.target.value)} allowClear placeholder="输入试试" />`}
      >
        <Input defaultValue="hello world" allowClear placeholder="可清除" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          allowClear
          placeholder="输入试试,右侧会出现 ✕"
        />
      </DemoBlock>

      <DemoBlock
        title="错误与禁用"
        code={`<Input error placeholder="请检查输入" />
<Input disabled placeholder="已禁用" />`}
      >
        <Input error placeholder="请检查输入" />
        <Input disabled placeholder="已禁用" />
      </DemoBlock>

      <DemoBlock
        title="下划线动画"
        description={`variant='underline' 会使用下划线 + 聚焦展开动画的样式,可通过 activeColor / hoverColor 定制颜色。`}
        code={`<Input variant="underline" placeholder="Type your text" />
<Input variant="underline" activeColor="#f5a623" hoverColor="#f5a62322" placeholder="Amber" />
<Input variant="underline" activeColor="#38d39f" hoverColor="#38d39f22" placeholder="Mint" />`}
      >
        <Input variant="underline" placeholder="Type your text" />
        <Input
          variant="underline"
          activeColor="#f5a623"
          hoverColor="rgba(245, 166, 35, 0.14)"
          placeholder="Amber"
        />
        <Input
          variant="underline"
          activeColor="#38d39f"
          hoverColor="rgba(56, 211, 159, 0.14)"
          placeholder="Mint"
        />
      </DemoBlock>

      <DemoBlock
        title="悬浮标签"
        description={`variant='floating' 配合 label 属性实现 Material 风格的悬浮标签,聚焦或有值时标签会缩放到边框上。`}
        code={`<Input variant="floating" label="First Name" />
<Input variant="floating" label="Email" activeColor="#38d39f" />
<Input variant="floating" label="Password" type="password" activeColor="#f5a623" />`}
      >
        <Input variant="floating" label="First Name" />
        <Input variant="floating" label="Email" activeColor="#38d39f" />
        <Input variant="floating" label="Password" type="password" activeColor="#f5a623" />
      </DemoBlock>

      <DemoBlock
        title="受控用法"
        code={`const [value, setValue] = useState('');
<Input value={value} onChange={e => setValue(e.target.value)} />`}
      >
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="试着输入看看"
        />
        <span style={{ color: '#6b7280', fontSize: 13 }}>当前值：{value || '（空）'}</span>
      </DemoBlock>

      <h2>TextArea 文本域</h2>

      <DemoBlock
        title="基础用法"
        description="通过 Input.TextArea 使用多行输入。"
        code={`<Input.TextArea placeholder="请输入多行内容" rows={3} />`}
      >
        <Input.TextArea placeholder="请输入多行内容" rows={3} />
      </DemoBlock>

      <DemoBlock
        title="自适应高度"
        description="autoSize 让文本域随内容撑开;也可通过 { minRows, maxRows } 限制范围。"
        code={`<Input.TextArea autoSize placeholder="会随内容自动变高" />
<Input.TextArea
  autoSize={{ minRows: 2, maxRows: 6 }}
  placeholder="至少 2 行 / 最多 6 行"
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input.TextArea autoSize placeholder="会随内容自动变高" />
          <Input.TextArea
            autoSize={{ minRows: 2, maxRows: 6 }}
            placeholder="至少 2 行 / 最多 6 行"
          />
        </div>
      </DemoBlock>

      <DemoBlock
        title="字符计数"
        description="showCount 配合 maxLength 显示 count/max 计数。"
        code={`<Input.TextArea showCount maxLength={80} placeholder="最多 80 字" />`}
      >
        <Input.TextArea showCount maxLength={80} placeholder="最多 80 字" rows={3} />
      </DemoBlock>

      <DemoBlock
        title="错误与禁用"
        description="和 Input 共用 error / disabled。"
        code={`<Input.TextArea error defaultValue="格式不对" />
<Input.TextArea disabled defaultValue="已锁定" />`}
      >
        <div style={{ display: 'flex', gap: 12 }}>
          <Input.TextArea error defaultValue="格式不对" rows={2} />
          <Input.TextArea disabled defaultValue="已锁定" rows={2} />
        </div>
      </DemoBlock>

      <h2>交互式调试</h2>
      <Playground
        title="实时调整 Input 属性"
        componentName="Input"
        component={Input}
        controls={[
          { name: 'placeholder', type: 'text', default: '请输入内容' },
          {
            name: 'variant',
            type: 'select',
            options: ['outlined', 'underline', 'floating'],
            default: 'outlined',
          },
          { name: 'label', type: 'text', label: 'label(floating)', default: '' },
          {
            name: 'size',
            type: 'select',
            options: ['small', 'medium', 'large'],
            default: 'medium',
          },
          { name: 'error', type: 'boolean', default: false },
          { name: 'disabled', type: 'boolean', default: false },
          { name: 'allowClear', type: 'boolean', default: false },
          { name: 'prefix', type: 'text', label: 'prefix(文本)', default: '' },
          { name: 'suffix', type: 'text', label: 'suffix(文本)', default: '' },
          { name: 'activeColor', type: 'text', label: 'activeColor(underline)', default: '' },
          { name: 'hoverColor', type: 'text', label: 'hoverColor(underline)', default: '' },
        ]}
      />

      <h2>API</h2>
      <ApiTable
        rows={[
          {
            prop: 'size',
            desc: '输入框尺寸',
            type: `'small' | 'medium' | 'large'`,
            default: `'medium'`,
          },
          {
            prop: 'variant',
            desc: '视觉风格',
            type: `'outlined' | 'underline' | 'floating'`,
            default: `'outlined'`,
          },
          {
            prop: 'label',
            desc: 'floating - 悬浮标签文字',
            type: 'ReactNode',
            default: '-',
          },
          {
            prop: 'activeColor',
            desc: 'underline - 聚焦时下划线颜色',
            type: 'string',
            default: `'var(--au-primary)'`,
          },
          {
            prop: 'hoverColor',
            desc: 'underline - 悬停时的背景色',
            type: 'string',
            default: 'rgba(73, 133, 224, 0.12)',
          },
          { prop: 'prefix', desc: '前缀内容', type: 'ReactNode', default: '-' },
          { prop: 'suffix', desc: '后缀内容', type: 'ReactNode', default: '-' },
          {
            prop: 'allowClear',
            desc: '显示清除按钮 — value 非空且非 disabled 时右侧出现 ✕,点击清空',
            type: 'boolean',
            default: 'false',
          },
          {
            prop: 'onClear',
            desc: '点击清除按钮触发(可选,一般跟 onChange 联动够用)',
            type: '() => void',
            default: '-',
          },
          {
            prop: 'error',
            desc: '是否为错误状态',
            type: 'boolean',
            default: 'false',
          },
          {
            prop: 'disabled',
            desc: '是否禁用',
            type: 'boolean',
            default: 'false',
          },
        ]}
      />

      <h3>Input.TextArea</h3>
      <ApiTable
        rows={[
          {
            prop: 'autoSize',
            desc: '高度自适应;传 { minRows, maxRows } 限制行数',
            type: 'boolean | { minRows?: number; maxRows?: number }',
            default: 'false',
          },
          {
            prop: 'showCount',
            desc: '是否显示字符计数;可传 { formatter } 自定义',
            type: 'boolean | { formatter: (info) => ReactNode }',
            default: 'false',
          },
          {
            prop: 'maxLength',
            desc: '最大输入字符数(配合 showCount 显示 n/max)',
            type: 'number',
            default: '-',
          },
          {
            prop: 'rows',
            desc: '默认行数',
            type: 'number',
            default: '3',
          },
          {
            prop: 'size',
            desc: '尺寸',
            type: `'small' | 'medium' | 'large'`,
            default: `'medium'`,
          },
          {
            prop: 'error',
            desc: '是否为错误状态',
            type: 'boolean',
            default: 'false',
          },
          {
            prop: 'disabled',
            desc: '是否禁用',
            type: 'boolean',
            default: 'false',
          },
        ]}
      />
    </>
  );
};

export default InputDoc;
