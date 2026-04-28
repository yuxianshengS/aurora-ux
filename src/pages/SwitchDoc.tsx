import React, { useState } from 'react';
import { Switch } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';
import Playground from '../site-components/Playground';

const SwitchDoc: React.FC = () => {
  const [checked, setChecked] = useState(true);
  return (
    <>
      <h1>Switch 开关</h1>
      <p>用于表示两种互斥状态之间的切换，例如开启 / 关闭。</p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        code={`<Switch defaultChecked />
<Switch />`}
      >
        <Switch defaultChecked />
        <Switch />
      </DemoBlock>

      <DemoBlock
        title="小尺寸"
        code={`<Switch size="small" defaultChecked />
<Switch size="small" />`}
      >
        <Switch size="small" defaultChecked />
        <Switch size="small" />
      </DemoBlock>

      <DemoBlock
        title="禁用"
        code={`<Switch disabled />
<Switch disabled defaultChecked />`}
      >
        <Switch disabled />
        <Switch disabled defaultChecked />
      </DemoBlock>

      <DemoBlock
        title="受控"
        code={`const [checked, setChecked] = useState(true);
<Switch checked={checked} onChange={setChecked} />`}
      >
        <Switch checked={checked} onChange={setChecked} />
        <span style={{ color: '#6b7280', fontSize: 13 }}>
          当前状态：{checked ? 'ON' : 'OFF'}
        </span>
      </DemoBlock>

      <DemoBlock
        title="带文字"
        description="通过 checkedChildren / unCheckedChildren 在轨道中显示文字。"
        code={`<Switch checkedChildren="ON" unCheckedChildren="OFF" defaultChecked />
<Switch checkedChildren="开" unCheckedChildren="关" />
<Switch size="small" checkedChildren="1" unCheckedChildren="0" defaultChecked />`}
      >
        <Switch checkedChildren="ON" unCheckedChildren="OFF" defaultChecked />
        <Switch checkedChildren="开" unCheckedChildren="关" />
        <Switch size="small" checkedChildren="1" unCheckedChildren="0" defaultChecked />
      </DemoBlock>

      <h2>交互式调试</h2>
      <Playground
        title="实时调整 Switch 属性"
        componentName="Switch"
        component={Switch}
        controls={[
          { name: 'defaultChecked', type: 'boolean', default: false },
          { name: 'size', type: 'select', options: ['small', 'medium'], default: 'medium' },
          { name: 'disabled', type: 'boolean', default: false },
          { name: 'checkedChildren', type: 'text', default: '' },
          { name: 'unCheckedChildren', type: 'text', default: '' },
        ]}
      />

      <h2>API</h2>
      <ApiTable
        rows={[
          {
            prop: 'checked',
            desc: '受控状态',
            type: 'boolean',
            default: '-',
          },
          {
            prop: 'defaultChecked',
            desc: '非受控默认值',
            type: 'boolean',
            default: 'false',
          },
          {
            prop: 'size',
            desc: '尺寸',
            type: `'medium' | 'small'`,
            default: `'medium'`,
          },
          {
            prop: 'disabled',
            desc: '是否禁用',
            type: 'boolean',
            default: 'false',
          },
          {
            prop: 'checkedChildren',
            desc: '选中时轨道中的文字 / 内容',
            type: 'ReactNode',
            default: '-',
          },
          {
            prop: 'unCheckedChildren',
            desc: '未选中时轨道中的文字 / 内容',
            type: 'ReactNode',
            default: '-',
          },
          {
            prop: 'onChange',
            desc: '状态变更回调',
            type: '(checked: boolean) => void',
            default: '-',
          },
        ]}
      />
    </>
  );
};

export default SwitchDoc;
