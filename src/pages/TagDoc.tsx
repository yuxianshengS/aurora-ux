import React, { useState } from 'react';
import { Tag } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const TagDoc: React.FC = () => {
  return (
    <>
      <h1>Tag 标签</h1>
      <p>
        用于标记、分类或状态标识。支持预设色板、自定义 hex / rgb 色、边框与实心两种样式、可关闭、带图标。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="默认为边框样式,使用 color 切换预设色板。"
        code={`<Tag>默认</Tag>
<Tag color="primary">主色</Tag>
<Tag color="success">成功</Tag>
<Tag color="warning">警告</Tag>
<Tag color="danger">危险</Tag>`}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Tag>默认</Tag>
          <Tag color="primary">主色</Tag>
          <Tag color="success">成功</Tag>
          <Tag color="warning">警告</Tag>
          <Tag color="danger">危险</Tag>
          <Tag color="info">信息</Tag>
          <Tag color="purple">purple</Tag>
          <Tag color="magenta">magenta</Tag>
          <Tag color="cyan">cyan</Tag>
        </div>
      </DemoBlock>

      <DemoBlock
        title="实心样式"
        description="bordered={false} 切换到实心填充。"
        code={`<Tag bordered={false} color="primary">主色</Tag>
<Tag bordered={false} color="success">成功</Tag>`}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Tag bordered={false}>默认</Tag>
          <Tag bordered={false} color="primary">主色</Tag>
          <Tag bordered={false} color="success">成功</Tag>
          <Tag bordered={false} color="warning">警告</Tag>
          <Tag bordered={false} color="danger">危险</Tag>
        </div>
      </DemoBlock>

      <DemoBlock
        title="自定义颜色"
        description="color 传任意 CSS 颜色值 (hex / rgb / hsl)。"
        code={`<Tag color="#f97316">orange</Tag>
<Tag color="#0ea5e9">sky</Tag>
<Tag bordered={false} color="#6366f1">indigo</Tag>`}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Tag color="#f97316">orange</Tag>
          <Tag color="#0ea5e9">sky</Tag>
          <Tag color="#84cc16">lime</Tag>
          <Tag bordered={false} color="#6366f1">indigo</Tag>
          <Tag bordered={false} color="#db2777">rose</Tag>
        </div>
      </DemoBlock>

      <DemoBlock
        title="可关闭"
        description="closable 显示关闭按钮;调用 e.preventDefault() 可拦截关闭。"
        code={`<Tag closable onClose={() => console.log('closed')}>可关闭</Tag>`}
      >
        <ClosableDemo />
      </DemoBlock>

      <DemoBlock
        title="带图标"
        description="icon 放在文字前,适合标识来源、类型。"
        code={`<Tag color="primary" icon={<span>⭐</span>}>精选</Tag>
<Tag color="success" icon={<span>✓</span>}>已完成</Tag>`}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Tag color="primary" icon={<span>⭐</span>}>精选</Tag>
          <Tag color="success" icon={<span>✓</span>}>已完成</Tag>
          <Tag color="danger" icon={<span>🔥</span>}>热门</Tag>
        </div>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          {
            prop: 'color',
            desc: '预设色板 或 任意 CSS 颜色',
            type: `'default'|'primary'|'success'|'warning'|'danger'|'info'|'purple'|'magenta'|'cyan'|string`,
            default: `'default'`,
          },
          { prop: 'bordered', desc: '边框样式; false 时为实心', type: 'boolean', default: 'true' },
          { prop: 'closable', desc: '显示关闭按钮', type: 'boolean', default: 'false' },
          { prop: 'icon', desc: '图标', type: 'ReactNode', default: '-' },
          { prop: 'onClose', desc: '关闭回调; e.preventDefault() 可阻止关闭', type: '(e) => void', default: '-' },
        ]}
      />
    </>
  );
};

const ClosableDemo: React.FC = () => {
  const [tags, setTags] = useState(['React', 'Vue', 'Svelte', 'Solid']);
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', minHeight: 28 }}>
      {tags.length === 0 ? (
        <span style={{ fontSize: 13, color: 'var(--au-text-3)' }}>
          (已全部关闭) <button className="au-btn au-btn--ghost au-btn--small" onClick={() => setTags(['React', 'Vue', 'Svelte', 'Solid'])}>重置</button>
        </span>
      ) : (
        tags.map((t) => (
          <Tag
            key={t}
            closable
            color="primary"
            onClose={() => setTags((list) => list.filter((x) => x !== t))}
          >
            {t}
          </Tag>
        ))
      )}
    </div>
  );
};

export default TagDoc;
