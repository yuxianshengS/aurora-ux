import React, { useState } from 'react';
import { ColorPicker } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const PRESET_AURORA = [
  '#5b8def', '#7c3aed', '#a855f7', '#22d3ee', '#10b981',
  '#f59e0b', '#ef4444', '#fb923c', '#0f172a', '#ffffff',
];

const ColorPickerDoc: React.FC = () => {
  return (
    <>
      <h1>ColorPicker 颜色选择器</h1>
      <p>
        点击触发器弹出色板, 拖动选取饱和度 / 亮度 + hue 滑块。
        支持 hex 文本输入、预设色板、自定义触发器。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="非受控, defaultValue 给个起始色."
        code={`<ColorPicker defaultValue="#5b8def" />`}
      >
        <ColorPicker defaultValue="#5b8def" />
      </DemoBlock>

      <DemoBlock
        title="受控 + 实时预览"
        description="value 受控, onChange 拖动时频繁触发, onChangeComplete 抬手时触发."
        code={`function Demo() {
  const [color, setColor] = useState('#7c3aed');
  return (
    <>
      <ColorPicker value={color} onChange={setColor} />
      <div style={{ width: 80, height: 32, background: color, borderRadius: 6 }} />
    </>
  );
}`}
      >
        <ControlledDemo />
      </DemoBlock>

      <DemoBlock
        title="预设色板"
        description="presets 数组定义快捷色, 点一下立即选中."
        code={`<ColorPicker
  defaultValue="#5b8def"
  presets={['#5b8def', '#7c3aed', '#a855f7', '#22d3ee', '#10b981', '#f59e0b', '#ef4444']}
/>`}
      >
        <ColorPicker defaultValue="#5b8def" presets={PRESET_AURORA} />
      </DemoBlock>

      <DemoBlock
        title="不显示 hex 输入框"
        description="只用拖拽选色, showInput={false} 收起文本输入."
        code={`<ColorPicker defaultValue="#10b981" showInput={false} />`}
      >
        <ColorPicker defaultValue="#10b981" showInput={false} />
      </DemoBlock>

      <DemoBlock
        title="自定义触发器"
        description="trigger 传任意 ReactNode 替换默认色块按钮."
        code={`<ColorPicker
  defaultValue="#a855f7"
  trigger={<button className="au-btn">选个颜色 →</button>}
/>`}
      >
        <ColorPicker
          defaultValue="#a855f7"
          trigger={<button className="au-btn au-btn--medium">选个颜色 →</button>}
        />
      </DemoBlock>

      <DemoBlock
        title="不同尺寸"
        code={`<ColorPicker size="small" />
<ColorPicker size="medium" />
<ColorPicker size="large" />`}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <ColorPicker defaultValue="#5b8def" size="small" />
          <ColorPicker defaultValue="#5b8def" size="medium" />
          <ColorPicker defaultValue="#5b8def" size="large" />
        </div>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'value / defaultValue', desc: '受控/初始值 (hex)', type: 'string', default: `'#5b8def'` },
          { prop: 'onChange', desc: '拖动时频繁触发', type: '(hex) => void', default: '-' },
          { prop: 'onChangeComplete', desc: '抬手时触发, 适合做 commit / 写后端', type: '(hex) => void', default: '-' },
          { prop: 'presets', desc: '预设色板', type: 'string[]', default: '-' },
          { prop: 'showInput', desc: '是否显示 hex 文本输入框', type: 'boolean', default: 'true' },
          { prop: 'trigger', desc: '自定义触发器 (替换默认色块按钮)', type: 'ReactNode', default: '-' },
          { prop: 'size', desc: '触发器尺寸', type: `'small' | 'medium' | 'large'`, default: `'medium'` },
          { prop: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
        ]}
      />
    </>
  );
};

const ControlledDemo: React.FC = () => {
  const [color, setColor] = useState('#7c3aed');
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <ColorPicker value={color} onChange={setColor} />
      <div
        style={{
          width: 80,
          height: 32,
          background: color,
          borderRadius: 6,
          border: '1px solid var(--au-border)',
        }}
      />
      <code style={{ fontSize: 12, color: 'var(--au-text-3)' }}>{color}</code>
    </div>
  );
};

export default ColorPickerDoc;
