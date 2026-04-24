import React, { useState } from 'react';
import { InputNumber } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const InputNumberDoc: React.FC = () => {
  return (
    <>
      <h1>InputNumber 数字输入框</h1>
      <p>
        用于输入数值。支持步长、上下限、精度,内置 <code>↑ / ↓</code> 键盘步进,
        提供默认右侧步进、左右 <code>− +</code>、隐藏三种控制样式。
        支持 <code>formatter</code> / <code>parser</code> 自定义显示。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="默认右侧出现步进按钮; 键盘 ↑ / ↓ 可调。"
        code={`<InputNumber defaultValue={1} />`}
      >
        <InputNumber defaultValue={1} />
      </DemoBlock>

      <DemoBlock
        title="受控 + 上下限 + 步长"
        description="min / max / step 组合限制。"
        code={`const [v, setV] = useState(50);

<InputNumber value={v} onChange={setV} min={0} max={100} step={5} />`}
      >
        <ControlledDemo />
      </DemoBlock>

      <DemoBlock
        title="精度"
        description="precision 固定小数位, 失焦时统一格式化。"
        code={`<InputNumber defaultValue={1.5} step={0.01} precision={2} />`}
      >
        <InputNumber defaultValue={1.5} step={0.01} precision={2} />
      </DemoBlock>

      <DemoBlock
        title="前缀 / 后缀"
        description="常用于货币、百分比、单位。"
        code={`<InputNumber defaultValue={100} prefix="¥" />
<InputNumber defaultValue={80} max={100} suffix="%" />`}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <InputNumber defaultValue={100} prefix="¥" />
          <InputNumber defaultValue={80} max={100} suffix="%" />
        </div>
      </DemoBlock>

      <DemoBlock
        title="千分位格式化"
        description="配合 formatter / parser 实现显示格式与真实值解耦。"
        code={`<InputNumber
  defaultValue={1234567}
  formatter={(v) => v == null ? '' : \`¥ \${v.toLocaleString()}\`}
  parser={(s) => {
    const n = Number(s.replace(/[^\\d.-]/g, ''));
    return Number.isNaN(n) ? null : n;
  }}
  style={{ width: 200 }}
/>`}
      >
        <InputNumber
          defaultValue={1234567}
          formatter={(v) => (v == null ? '' : `¥ ${v.toLocaleString()}`)}
          parser={(s) => {
            const n = Number(s.replace(/[^\d.-]/g, ''));
            return Number.isNaN(n) ? null : n;
          }}
          style={{ width: 200 }}
        />
      </DemoBlock>

      <DemoBlock
        title="控制样式"
        description="default (右侧步进) / plus-minus (两侧按钮) / none (隐藏)。"
        code={`<InputNumber controls="default" defaultValue={1} />
<InputNumber controls="plus-minus" defaultValue={1} />
<InputNumber controls="none" defaultValue={1} />`}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <InputNumber controls="default" defaultValue={1} />
          <InputNumber controls="plus-minus" defaultValue={1} />
          <InputNumber controls="none" defaultValue={1} />
        </div>
      </DemoBlock>

      <DemoBlock
        title="尺寸"
        description="small / medium / large。"
        code={`<InputNumber size="small" defaultValue={1} />
<InputNumber size="medium" defaultValue={1} />
<InputNumber size="large" defaultValue={1} />`}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <InputNumber size="small" defaultValue={1} />
          <InputNumber size="medium" defaultValue={1} />
          <InputNumber size="large" defaultValue={1} />
        </div>
      </DemoBlock>

      <DemoBlock
        title="状态与禁用"
        description="status='error' / 'warning' 快速切换校验外观。"
        code={`<InputNumber status="error" defaultValue={9} />
<InputNumber status="warning" defaultValue={88} />
<InputNumber disabled defaultValue={3} />`}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <InputNumber status="error" defaultValue={9} />
          <InputNumber status="warning" defaultValue={88} />
          <InputNumber disabled defaultValue={3} />
        </div>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'value', desc: '受控值', type: 'number | null', default: '-' },
          { prop: 'defaultValue', desc: '非受控默认值', type: 'number | null', default: 'null' },
          { prop: 'onChange', desc: '值变化', type: '(value: number | null) => void', default: '-' },
          { prop: 'min', desc: '最小值', type: 'number', default: '-' },
          { prop: 'max', desc: '最大值', type: 'number', default: '-' },
          { prop: 'step', desc: '步长', type: 'number', default: '1' },
          { prop: 'precision', desc: '小数精度 (失焦格式化)', type: 'number', default: '-' },
          { prop: 'controls', desc: '控制按钮样式', type: `'default' | 'plus-minus' | 'none'`, default: `'default'` },
          { prop: 'keyboard', desc: '允许上下键调值', type: 'boolean', default: 'true' },
          { prop: 'prefix', desc: '前缀', type: 'ReactNode', default: '-' },
          { prop: 'suffix', desc: '后缀', type: 'ReactNode', default: '-' },
          { prop: 'formatter', desc: '显示值格式化', type: '(value) => string', default: '-' },
          { prop: 'parser', desc: '从显示值还原数值', type: '(text) => number | null', default: '-' },
          { prop: 'size', desc: '尺寸', type: `'small' | 'medium' | 'large'`, default: `'medium'` },
          { prop: 'status', desc: '校验状态', type: `'error' | 'warning'`, default: '-' },
          { prop: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
          { prop: 'readOnly', desc: '只读', type: 'boolean', default: 'false' },
          { prop: 'onPressEnter', desc: '回车回调', type: '(e) => void', default: '-' },
        ]}
      />
    </>
  );
};

const ControlledDemo: React.FC = () => {
  const [v, setV] = useState<number | null>(50);
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <InputNumber value={v} onChange={setV} min={0} max={100} step={5} />
      <span style={{ fontSize: 13, color: 'var(--au-text-2)' }}>
        当前: {v ?? '(空)'}
      </span>
    </div>
  );
};

export default InputNumberDoc;
