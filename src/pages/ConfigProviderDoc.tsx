import React, { useState } from 'react';
import { ConfigProvider, Button, DatePicker } from '../components';
import { zhCN, enUS } from '../locale';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const ConfigProviderDoc: React.FC = () => {
  return (
    <>
      <h1>ConfigProvider 全局配置</h1>
      <p>
        给整个组件树注入全局配置 — i18n locale + 全局主色。包在 App 根节点用,
        子组件自动通过 Context 拿到配置。Aurora UX 不强制要求 Provider,
        不包也能跑(走默认 zhCN); 包了之后能切英文 / 实时换主色。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="i18n 切换"
        description="locale 传 enUS 或 zhCN, DatePicker / Pagination 等内置文案跟着切."
        code={`<ConfigProvider locale={enUS}>
  <DatePicker />
</ConfigProvider>`}
      >
        <LocaleDemo />
      </DemoBlock>

      <DemoBlock
        title="全局主色"
        description="primaryColor 写到 :root 的 --au-primary, portal 弹层 (Modal/Tooltip/Drawer) 也能读到."
        code={`<ConfigProvider primaryColor="#a855f7">
  <Button type="primary">紫色按钮</Button>
</ConfigProvider>`}
      >
        <PrimaryColorDemo />
      </DemoBlock>

      <DemoBlock
        title="App 入口的标准用法"
        description="放在最外层, 子组件全局生效."
        code={`// main.tsx 或 App.tsx
import { ConfigProvider, zhCN } from 'aurora-ux';

export default function App() {
  return (
    <ConfigProvider locale={zhCN} primaryColor="#5b8def">
      <YourApp />
    </ConfigProvider>
  );
}`}
      >
        <p style={{ color: 'var(--au-text-3)', fontSize: 13 }}>
          (这个 demo 不在沙箱里跑, 复制到你的 App 入口看效果。)
        </p>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'locale', desc: '国际化包 (zhCN / enUS), 影响 DatePicker/Pagination 等内置文案', type: 'Locale', default: 'zhCN' },
          { prop: 'primaryColor', desc: '全局主色 (写到 :root --au-primary, portal 弹层也生效)', type: 'string (hex)', default: '-' },
          { prop: 'children', desc: '被包裹的组件树', type: 'ReactNode', default: '-' },
        ]}
      />

      <h2>读取当前配置</h2>
      <p>组件内部如果要拿当前 locale 或 primaryColor:</p>
      <pre style={{ background: 'var(--au-bg-soft)', padding: 12, borderRadius: 6, fontSize: 13 }}>
{`import { useConfig, useLocale } from 'aurora-ux';

function MyComp() {
  const locale = useLocale();          // Locale, 不被 Provider 包就拿到默认 zhCN
  const cfg = useConfig();             // { locale, primaryColor }
  return <span>{locale.DatePicker.placeholder}</span>;
}`}
      </pre>
    </>
  );
};

const LocaleDemo: React.FC = () => {
  const [locale, setLocale] = useState<'zh' | 'en'>('zh');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button
          type={locale === 'zh' ? 'primary' : 'default'}
          onClick={() => setLocale('zh')}
        >
          中文
        </Button>
        <Button
          type={locale === 'en' ? 'primary' : 'default'}
          onClick={() => setLocale('en')}
        >
          English
        </Button>
      </div>
      <ConfigProvider locale={locale === 'zh' ? zhCN : enUS}>
        <DatePicker />
      </ConfigProvider>
    </div>
  );
};

const PrimaryColorDemo: React.FC = () => {
  const [color, setColor] = useState('#a855f7');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {['#5b8def', '#a855f7', '#10b981', '#f59e0b', '#ef4444'].map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              border: color === c ? '2px solid var(--au-text-1)' : '1px solid var(--au-border)',
              background: c,
              cursor: 'pointer',
            }}
            aria-label={c}
          />
        ))}
      </div>
      <ConfigProvider primaryColor={color}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary">主按钮</Button>
          <Button>普通按钮</Button>
        </div>
      </ConfigProvider>
      <p style={{ color: 'var(--au-text-3)', fontSize: 12, margin: 0 }}>
        注意: primaryColor 是写到 :root 全局生效, 切换会影响整个文档站, 不只这个 demo。
      </p>
    </div>
  );
};

export default ConfigProviderDoc;
