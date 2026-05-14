import React, { useState } from 'react';
import { FloatButton, Switch, Space, Card, message } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const FloatButtonDoc: React.FC = () => {
  return (
    <>
      <h1>FloatButton 悬浮按钮 (FAB)</h1>
      <p>
        绝对定位贴角的圆按钮 — 反馈 / 回到顶部 / 快速操作菜单 (speed dial)。 跟 Button
        是不同范式:Button 是流式排版方块,这是固定贴角的圆。 Aurora 招牌:默认{' '}
        <code>variant="aurora"</code> 极光渐变 + 光晕。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="极光主按钮 (开 / 关)"
        description="点开关查看右下角效果, 关掉再开方便切换看。"
        code={`<FloatButton onClick={() => message.success('clicked')} />`}
      >
        <ToggleDemo />
      </DemoBlock>

      <DemoBlock
        title="Speed Dial 子菜单"
        description="actions 数组定义子按钮, 点主按钮展开/收起,子按钮带 hover 提示。"
        code={`<FloatButton
  actions={[
    { key: 'doc',   icon: '📄', tooltip: '新建文档', onClick: () => console.log('doc') },
    { key: 'image', icon: '🖼', tooltip: '上传图片', onClick: () => console.log('image') },
    { key: 'link',  icon: '🔗', tooltip: '插入链接', onClick: () => console.log('link') },
  ]}
/>`}
      >
        <SpeedDialDemo />
      </DemoBlock>

      <DemoBlock
        title="返回顶部 (backTop 模式)"
        description={`backTop 模式 — 打开开关后, 把整个页面往下滚 300+ px, 左下角会自动出现 ↑ 按钮; 点它平滑回顶, 滚回去之后又自动隐藏。`}
        code={`<FloatButton
  backTop
  backTopThreshold={300}
  position="bottom-left"
  tooltip="回到顶部"
/>`}
      >
        <BackTopDemo />
      </DemoBlock>

      <DemoBlock
        title="3 种 variant"
        description={`借助 inline prop 在 doc 内嵌平排预览 (实际项目里通常不传 inline,直接 fixed 贴角)。`}
        code={`<FloatButton variant="aurora" inline />     // 极光招牌 (默认)
<FloatButton variant="primary" inline />     // 主色单色
<FloatButton variant="default" inline />     // 中性`}
      >
        <Space size="large" style={{ padding: '20px 0' }}>
          <FloatButton
            variant="aurora"
            inline
            tooltip="aurora"
            onClick={() => message.info('aurora')}
          />
          <FloatButton
            variant="primary"
            inline
            tooltip="primary"
            onClick={() => message.info('primary')}
          />
          <FloatButton
            variant="default"
            inline
            tooltip="default"
            icon={<span style={{ fontSize: 18 }}>★</span>}
            onClick={() => message.info('default')}
          />
        </Space>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'icon', desc: '主按钮图标', type: 'ReactNode', default: '+' },
          { prop: 'tooltip', desc: '主按钮 hover 提示', type: 'ReactNode', default: '-' },
          {
            prop: 'onClick',
            desc: '点击 (没 actions 时直接触发)',
            type: '() => void',
            default: '-',
          },
          {
            prop: 'actions',
            desc: 'speed dial 子按钮数组',
            type: 'FloatButtonAction[]',
            default: '-',
          },
          {
            prop: 'position',
            desc: '贴角位置',
            type: `'bottom-right'|'bottom-left'|'top-right'|'top-left'`,
            default: `'bottom-right'`,
          },
          {
            prop: 'offset',
            desc: '边距 (px), 覆盖默认 24',
            type: '{ x?: number; y?: number }',
            default: '{ x: 24, y: 24 }',
          },
          {
            prop: 'variant',
            desc: '视觉风格',
            type: `'aurora'|'primary'|'default'`,
            default: `'aurora'`,
          },
          { prop: 'shape', desc: '形状', type: `'circle'|'square'`, default: `'circle'` },
          { prop: 'size', desc: '主按钮直径 (px)', type: 'number', default: '48' },
          {
            prop: 'backTop',
            desc: '返回顶部模式 (滚一定距离才显示)',
            type: 'boolean',
            default: 'false',
          },
          {
            prop: 'backTopThreshold',
            desc: 'backTop 模式触发阈值 (scrollY > 这个值)',
            type: 'number',
            default: '200',
          },
          {
            prop: 'inline',
            desc: '脱离 fixed,以普通 inline-block 渲染。适合内嵌 / doc 预览',
            type: 'boolean',
            default: 'false',
          },
        ]}
      />

      <h3>FloatButtonAction</h3>
      <ApiTable
        rows={[
          { prop: 'key', desc: '唯一 key', type: 'string', default: '-' },
          { prop: 'icon', desc: '子按钮图标', type: 'ReactNode', default: '-' },
          { prop: 'tooltip', desc: 'hover 提示', type: 'ReactNode', default: '-' },
          { prop: 'onClick', desc: '点击', type: '() => void', default: '-' },
        ]}
      />
    </>
  );
};

const ToggleDemo: React.FC = () => {
  const [on, setOn] = useState(false);
  return (
    <Space>
      <Switch checked={on} onChange={setOn} />
      <span style={{ color: 'var(--au-text-3)' }}>右下角悬浮按钮</span>
      {on && (
        <FloatButton tooltip="点我打个招呼" onClick={() => message.success('Hi from Aurora 👋')} />
      )}
    </Space>
  );
};

const SpeedDialDemo: React.FC = () => {
  const [on, setOn] = useState(false);
  return (
    <Space>
      <Switch checked={on} onChange={setOn} />
      <span style={{ color: 'var(--au-text-3)' }}>右下角悬浮 (含 Speed Dial 子菜单)</span>
      {on && (
        <FloatButton
          tooltip="新建"
          actions={[
            {
              key: 'doc',
              icon: '📄',
              tooltip: '新建文档',
              onClick: () => message.info('新建文档'),
            },
            {
              key: 'image',
              icon: '🖼',
              tooltip: '上传图片',
              onClick: () => message.info('上传图片'),
            },
            {
              key: 'link',
              icon: '🔗',
              tooltip: '插入链接',
              onClick: () => message.info('插入链接'),
            },
          ]}
        />
      )}
    </Space>
  );
};

const BackTopDemo: React.FC = () => {
  const [on, setOn] = useState(false);
  return (
    <Space direction="vertical">
      <Space>
        <Switch checked={on} onChange={setOn} />
        <span style={{ color: 'var(--au-text-3)', fontSize: 13 }}>
          启用后向下滚动 300+ px, 看左下角
        </span>
      </Space>
      {on && (
        <FloatButton backTop backTopThreshold={300} position="bottom-left" tooltip="回到顶部" />
      )}
    </Space>
  );
};

export default FloatButtonDoc;
