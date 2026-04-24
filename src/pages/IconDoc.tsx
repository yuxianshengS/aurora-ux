import React, { useMemo, useState } from 'react';
import { Icon, Input, message } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';
import { iconfontNames } from '../data/iconfontNames';

const IconDoc: React.FC = () => {
  return (
    <>
      <h1>Icon 图标</h1>
      <p>
        基于阿里 iconfont 字体图标库,内置 {iconfontNames.length} 枚图标。通过 <code>name</code> 指定图标名
        (不含 <code>icon-</code> 前缀),支持尺寸、颜色、旋转、动画等能力。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="通过 name 指定图标名,默认跟随父级 font-size 与 color。"
        code={`<Icon name="lock" />
<Icon name="add" />
<Icon name="info" />
<Icon name="more" />`}
      >
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', fontSize: 24 }}>
          <Icon name="lock" />
          <Icon name="add" />
          <Icon name="info" />
          <Icon name="more" />
          <Icon name="help-fill" />
        </div>
      </DemoBlock>

      <DemoBlock
        title="尺寸"
        description="size 接受数字 (px) 或 CSS 长度。"
        code={`<Icon name="info" size={16} />
<Icon name="info" size={24} />
<Icon name="info" size={32} />
<Icon name="info" size="3rem" />`}
      >
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Icon name="info" size={16} />
          <Icon name="info" size={24} />
          <Icon name="info" size={32} />
          <Icon name="info" size={48} />
        </div>
      </DemoBlock>

      <DemoBlock
        title="颜色"
        description="color 支持任意 CSS 颜色;不传时继承父级 color。"
        code={`<Icon name="help-fill" color="#0ea5e9" size={28} />
<Icon name="help-fill" color="#f97316" size={28} />
<Icon name="help-fill" color="var(--au-primary)" size={28} />`}
      >
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Icon name="help-fill" color="#0ea5e9" size={28} />
          <Icon name="help-fill" color="#f97316" size={28} />
          <Icon name="help-fill" color="#16a34a" size={28} />
          <Icon name="help-fill" color="#db2777" size={28} />
          <Icon name="help-fill" color="var(--au-primary)" size={28} />
        </div>
      </DemoBlock>

      <DemoBlock
        title="旋转与动画"
        description="spin 开启 1s 线性无限旋转;rotate 静态旋转角度。"
        code={`<Icon name="info" spin size={28} />
<Icon name="info" rotate={90} size={28} />
<Icon name="info" rotate={180} size={28} />`}
      >
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          <Icon name="info" spin size={28} />
          <Icon name="info" rotate={45} size={28} />
          <Icon name="info" rotate={90} size={28} />
          <Icon name="info" rotate={180} size={28} />
        </div>
      </DemoBlock>

      <h2>全部图标</h2>
      <p>
        点击图标或名字即可复制 <code>&lt;Icon name="…" /&gt;</code> 代码片段。
      </p>
      <IconGallery />

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'name', desc: '图标名 (不含 icon- 前缀)', type: 'string', default: '-' },
          { prop: 'size', desc: '图标尺寸;数字按 px,字符串按 CSS 长度', type: 'number | string', default: '继承 font-size' },
          { prop: 'color', desc: '图标颜色', type: 'string', default: 'currentColor' },
          { prop: 'spin', desc: '旋转动画', type: 'boolean', default: 'false' },
          { prop: 'rotate', desc: '旋转角度,单位度', type: 'number', default: '-' },
          { prop: 'className', desc: '自定义 className', type: 'string', default: '-' },
          { prop: 'style', desc: '自定义样式', type: 'CSSProperties', default: '-' },
          { prop: 'onClick', desc: '点击事件', type: '(e) => void', default: '-' },
        ]}
      />
    </>
  );
};

const IconGallery: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return iconfontNames;
    return iconfontNames.filter((n) => n.toLowerCase().includes(q));
  }, [keyword]);

  const copy = async (name: string) => {
    const snippet = `<Icon name="${name}" />`;
    try {
      await navigator.clipboard.writeText(snippet);
      message.success(`已复制: ${snippet}`);
    } catch {
      message.info(snippet);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
        <Input
          placeholder="搜索图标名,例如 lock / fill / arrow"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ maxWidth: 360 }}
        />
        <span style={{ color: 'var(--au-text-3)', fontSize: 13 }}>
          共 {filtered.length} / {iconfontNames.length}
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 8,
          maxHeight: 560,
          overflow: 'auto',
          padding: 12,
          border: '1px solid var(--au-border)',
          borderRadius: 8,
          background: 'var(--au-bg-soft)',
        }}
      >
        {filtered.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => copy(name)}
            title={`点击复制 <Icon name="${name}" />`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '14px 6px',
              background: 'var(--au-bg-1)',
              border: '1px solid var(--au-border)',
              borderRadius: 6,
              cursor: 'pointer',
              color: 'var(--au-text-1)',
              transition: 'all .15s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--au-primary)';
              (e.currentTarget as HTMLElement).style.color = 'var(--au-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--au-border)';
              (e.currentTarget as HTMLElement).style.color = 'var(--au-text-1)';
            }}
          >
            <Icon name={name} size={24} />
            <span
              style={{
                fontSize: 11,
                lineHeight: 1.3,
                textAlign: 'center',
                wordBreak: 'break-all',
                color: 'var(--au-text-3)',
              }}
            >
              {name}
            </span>
          </button>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: 'var(--au-text-3)' }}>
            没有匹配的图标
          </div>
        )}
      </div>
    </div>
  );
};

export default IconDoc;
