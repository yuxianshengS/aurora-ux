import React, { useState } from 'react';
import { AutoComplete } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const ALL_FRAMEWORKS = [
  { value: 'react', label: 'React', description: 'A JavaScript library for building UIs' },
  { value: 'vue', label: 'Vue', description: 'The Progressive JavaScript Framework' },
  { value: 'angular', label: 'Angular', description: 'Platform for building mobile and desktop apps' },
  { value: 'svelte', label: 'Svelte', description: 'Cybernetically enhanced web apps' },
  { value: 'solid', label: 'Solid', description: 'Simple and performant reactivity' },
  { value: 'qwik', label: 'Qwik', description: 'Resumable framework' },
];

const AutoCompleteDoc: React.FC = () => {
  return (
    <>
      <h1>AutoComplete 自动完成</h1>
      <p>
        输入框 + 下拉建议。跟 Select 区别:**值不限于 options 列表**, 用户可以输任何字符串,
        options 只是辅助提示。适合搜索框、邮箱后缀补全、命令面板等场景。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="纯字符串数组的简版."
        code={`<AutoComplete
  options={[
    { value: 'react' },
    { value: 'vue' },
    { value: 'angular' },
  ]}
  placeholder="选择或输入框架"
/>`}
      >
        <AutoComplete
          options={[{ value: 'react' }, { value: 'vue' }, { value: 'angular' }]}
          placeholder="选择或输入框架"
          style={{ width: 240 }}
        />
      </DemoBlock>

      <DemoBlock
        title="带描述的选项"
        description="label 自定义渲染, description 显示一行说明."
        code={`<AutoComplete
  options={[
    { value: 'react', label: 'React', description: 'A JavaScript library for building UIs' },
    { value: 'vue', label: 'Vue', description: 'The Progressive JavaScript Framework' },
    /* ... */
  ]}
/>`}
      >
        <AutoComplete options={ALL_FRAMEWORKS} placeholder="搜框架" style={{ width: 320 }} />
      </DemoBlock>

      <DemoBlock
        title="邮箱后缀自动补全"
        description="经典场景: 用户输 @ 之后自动列出常见邮箱域名."
        code={`function EmailInput() {
  const [value, setValue] = useState('');
  const options = useMemo(() => {
    if (!value || !value.includes('@')) {
      return ['gmail.com', 'qq.com', '163.com'].map((d) => ({ value: \`\${value}@\${d}\` }));
    }
    const [name, suffix = ''] = value.split('@');
    return ['gmail.com', 'qq.com', '163.com']
      .filter((d) => d.startsWith(suffix))
      .map((d) => ({ value: \`\${name}@\${d}\` }));
  }, [value]);
  return <AutoComplete value={value} onChange={setValue} options={options} />;
}`}
      >
        <EmailDemo />
      </DemoBlock>

      <DemoBlock
        title="允许清除 + 不同尺寸"
        code={`<AutoComplete options={...} allowClear size="small" />
<AutoComplete options={...} allowClear size="medium" />
<AutoComplete options={...} allowClear size="large" />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(['small', 'medium', 'large'] as const).map((s) => (
            <AutoComplete
              key={s}
              options={ALL_FRAMEWORKS}
              allowClear
              size={s}
              placeholder={`size="${s}"`}
              style={{ width: 280 }}
            />
          ))}
        </div>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'options', desc: '候选项', type: 'AutoCompleteOption[]', default: '[]' },
          { prop: 'value / defaultValue', desc: '受控/初始值', type: 'string', default: '-' },
          { prop: 'placeholder', desc: '占位符', type: 'string', default: '-' },
          { prop: 'onChange', desc: '值变化 (输入或选中触发)', type: '(value) => void', default: '-' },
          { prop: 'onSelect', desc: '从下拉里选中触发', type: '(value, option) => void', default: '-' },
          { prop: 'onSearch', desc: '输入变化时触发, 异步取候选项用', type: '(value) => void', default: '-' },
          { prop: 'filterOption', desc: '前端过滤函数 (默认 includes 模糊匹配)', type: '(input, option) => boolean', default: '默认模糊匹配' },
          { prop: 'allowClear', desc: '显示清除按钮', type: 'boolean', default: 'false' },
          { prop: 'size', desc: '尺寸', type: `'small' | 'medium' | 'large'`, default: `'medium'` },
          { prop: 'maxHeight', desc: '下拉最大高度 (px)', type: 'number', default: '240' },
          { prop: 'notFoundContent', desc: '无匹配时显示', type: 'ReactNode', default: `'无匹配'` },
          { prop: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
          { prop: 'inputProps', desc: '透传给底层 <input>', type: 'InputHTMLAttributes', default: '-' },
        ]}
      />

      <h2>AutoCompleteOption 类型</h2>
      <ApiTable
        rows={[
          { prop: 'value', desc: '选项值 (会回填到 input)', type: 'string', default: '-' },
          { prop: 'label', desc: '显示标签 (默认走 value)', type: 'ReactNode', default: '-' },
          { prop: 'description', desc: '描述行', type: 'ReactNode', default: '-' },
          { prop: 'disabled', desc: '禁用该项', type: 'boolean', default: 'false' },
        ]}
      />
    </>
  );
};

const EmailDemo: React.FC = () => {
  const [value, setValue] = useState('');
  const options = React.useMemo(() => {
    const suffixes = ['gmail.com', 'qq.com', '163.com', 'outlook.com', 'foxmail.com', 'icloud.com'];
    if (!value) return [];
    if (!value.includes('@')) {
      return suffixes.map((d) => ({ value: `${value}@${d}`, label: `${value}@${d}` }));
    }
    const [name, suffix = ''] = value.split('@');
    return suffixes
      .filter((d) => d.startsWith(suffix))
      .map((d) => ({ value: `${name}@${d}`, label: `${name}@${d}` }));
  }, [value]);
  return (
    <AutoComplete
      value={value}
      onChange={setValue}
      options={options}
      placeholder="输入邮箱前缀, 如 hello"
      style={{ width: 320 }}
    />
  );
};

export default AutoCompleteDoc;
