import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AuroraBg,
  GradientText,
  GlowCard,
  Button,
  Tag,
  Icon,
} from '../components';
import './GettingStarted.css';

type PM = 'pnpm' | 'npm' | 'yarn';

const GettingStarted: React.FC = () => {
  const [pm, setPm] = useState<PM>('pnpm');
  const installCmd: Record<PM, string> = {
    pnpm: 'pnpm add aurora-ux',
    npm: 'npm install aurora-ux',
    yarn: 'yarn add aurora-ux',
  };

  return (
    <div className="gs">
      {/* === Banner === */}
      <AuroraBg preset="aurora" intensity={0.55} blur={90} className="gs-banner">
        <div className="gs-banner__inner">
          <Tag color="primary">指南</Tag>
          <h1 className="gs-banner__title">
            <GradientText preset="aurora" size={40} weight={800} as="span">
              快速开始
            </GradientText>
          </h1>
          <p className="gs-banner__sub">
            3 分钟把 AuroraUI 接入你的 React 项目, 看板从此自带光感.
          </p>
        </div>
      </AuroraBg>

      {/* === 4 步走 === */}
      <Step
        n={1}
        title="安装"
        body="React 18+ 项目, peerDependencies 不会自动装, 提前装好 react / react-dom 即可."
      >
        <div className="gs-tabs">
          {(['pnpm', 'npm', 'yarn'] as PM[]).map((k) => (
            <button
              key={k}
              type="button"
              className={['gs-tab', pm === k ? 'is-active' : ''].filter(Boolean).join(' ')}
              onClick={() => setPm(k)}
            >
              {k}
            </button>
          ))}
        </div>
        <CodeBox language="bash" lines={[{ prompt: '$', text: installCmd[pm] }]} />
        <p className="gs-note">
          <Icon name="lock" size={14} /> 包名是 <code>aurora-ux</code> (因为 npm 上的{' '}
          <code>aurora-ui</code> 已被占用).
        </p>
      </Step>

      <Step
        n={2}
        title="引入样式"
        body="所有组件视觉都打包在一个 CSS 文件里, 在应用入口引一次即可。"
      >
        <CodeBox
          language="ts"
          filename="main.tsx"
          lines={[
            { type: 'import', text: `import 'aurora-ux/style.css';` },
          ]}
        />
        <p className="gs-note">
          <Icon name="lock" size={14} /> Vite / Next / CRA 都自动支持, 不需要任何额外配置.
        </p>
      </Step>

      <Step
        n={3}
        title="开写组件"
        body="按需 import, 直接用. TypeScript 完整类型, IDE 里 hover 就知道每个 prop 干什么."
      >
        <CodeBox
          language="tsx"
          filename="App.tsx"
          lines={[
            { type: 'import', text: `import { AuroraBg, GradientText, Button } from 'aurora-ux';` },
            { type: 'blank' },
            { type: 'export-fn', name: 'App', body: [
              { indent: 1, text: 'return (' },
              { indent: 2, jsx: ['<', { tag: 'AuroraBg' }, ' ', { attr: 'preset' }, '=', { str: '"aurora"' }, ' ', { attr: 'style' }, '={{ ', { attr: 'minHeight' }, ': ', { num: '320' }, ' }}>'] },
              { indent: 3, jsx: ['<', { tag: 'GradientText' }, ' ', { attr: 'size' }, '={', { num: '48' }, '} ', { attr: 'weight' }, '={', { num: '800' }, '}>'] },
              { indent: 4, text: 'Hello AuroraUI' },
              { indent: 3, jsx: ['</', { tag: 'GradientText' }, '>'] },
              { indent: 3, jsx: ['<', { tag: 'Button' }, ' ', { attr: 'type' }, '=', { str: '"primary"' }, '>开始使用</', { tag: 'Button' }, '>'] },
              { indent: 2, jsx: ['</', { tag: 'AuroraBg' }, '>'] },
              { indent: 1, text: ');' },
            ]},
          ]}
        />
      </Step>

      <Step
        n={4}
        title="(可选) 主题定制"
        body="所有视觉变量都是 CSS 变量, 全局或局部覆盖即可. 不需要 ThemeProvider, 不需要 SDK."
      >
        <CodeBox
          language="css"
          filename="global.css"
          lines={[
            { text: ':root {' },
            { indent: 1, css: { prop: '--au-primary', val: '#7c3aed' } },
            { indent: 1, css: { prop: '--au-radius', val: '14px' } },
            { indent: 1, css: { prop: '--au-bg', val: '#fafafa' } },
            { text: '}' },
          ]}
        />
        <p className="gs-note">
          <Icon name="lock" size={14} /> 想做暗色模式? 直接用 <code>&lt;ThemeSwitch /&gt;</code> 一行代码搞定.
        </p>
      </Step>

      {/* === 下一步 === */}
      <div className="gs-next">
        <h2 className="gs-next__title">下一步</h2>
        <div className="gs-next__grid">
          <NextCard
            to="/docs/aurora-bg"
            glowColor="#a855f7"
            icon="scenes"
            title="探索极光特效"
            body="AuroraBg / GradientText / NumberRoll / GlowCard 4 个独家招牌组件."
          />
          <NextCard
            to="/builder"
            glowColor="#22d3ee"
            icon="click"
            title="打开搭建器"
            body="60+ 组件全部可拖, 整段模板一键展开, 导出 JSX 直接 commit."
          />
          <NextCard
            to="/docs/design"
            glowColor="#10b981"
            icon="editor-text"
            title="设计理念"
            body="为什么这套库长这样, 配色 / 间距 / 动效背后的考量."
          />
          <NextCard
            to="/examples/dashboard"
            glowColor="#fb923c"
            icon="charts-bar"
            title="看完整示例"
            body="一个真实的 Dashboard 看板, 看 60+ 组件怎么协同工作."
          />
        </div>
      </div>
    </div>
  );
};

/* ============= Step 步骤卡 ============= */
const Step: React.FC<{
  n: number;
  title: string;
  body: string;
  children?: React.ReactNode;
}> = ({ n, title, body, children }) => (
  <section className="gs-step">
    <div className="gs-step__head">
      <div className="gs-step__num">
        <GradientText preset="aurora" size={24} weight={800} as="span">
          {String(n).padStart(2, '0')}
        </GradientText>
      </div>
      <div className="gs-step__head-text">
        <h2 className="gs-step__title">{title}</h2>
        <p className="gs-step__body">{body}</p>
      </div>
    </div>
    <div className="gs-step__content">{children}</div>
  </section>
);

/* ============= 代码盒子 (深色 IDE 风) =============
 * lines: 数组, 每项可以是:
 *   - { prompt: '$', text }      shell 命令
 *   - { type: 'import', text }   import 语句
 *   - { type: 'blank' }
 *   - { type: 'export-fn', name, body: SubLine[] }
 *   - { indent, text }            纯文本行
 *   - { indent, jsx: TokenSeq }   JSX token 序列
 *   - { indent, css: { prop, val } } CSS 属性
 *   - { text }
 */
type CssDecl = { prop: string; val: string };
type TokenSeq = (string | { tag?: string; attr?: string; str?: string; num?: string })[];
type SubLine =
  | { indent: number; text: string }
  | { indent: number; jsx: TokenSeq }
  | { indent: number; css: CssDecl };
type Line =
  | { prompt: string; text: string }
  | { type: 'import'; text: string }
  | { type: 'blank' }
  | { type: 'export-fn'; name: string; body: SubLine[] }
  | { indent?: number; text: string }
  | { indent: number; css: CssDecl };

const CodeBox: React.FC<{
  language?: string;
  filename?: string;
  lines: Line[];
}> = ({ language = 'tsx', filename, lines }) => {
  const allText = lines
    .map((l) => {
      if ('prompt' in l) return l.text;
      if ('type' in l) {
        if (l.type === 'import') return l.text;
        if (l.type === 'blank') return '';
        return '';
      }
      if ('text' in l) return l.text;
      return '';
    })
    .join('\n');
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(allText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* noop */
    }
  };
  return (
    <div className="gs-code">
      <div className="gs-code__bar">
        <span className="gs-code__dot gs-code__dot--r" />
        <span className="gs-code__dot gs-code__dot--y" />
        <span className="gs-code__dot gs-code__dot--g" />
        <span className="gs-code__filename">{filename ?? language}</span>
        <button type="button" className="gs-code__copy" onClick={onCopy}>
          {copied ? '✓ 已复制' : '复制'}
        </button>
      </div>
      <pre className="gs-code__body">
        <code className="gs-code__inner">
          {lines.map((l, i) => (
            <LineRender key={i} line={l} />
          ))}
        </code>
      </pre>
    </div>
  );
};

const indent = (n: number) => '  '.repeat(n);

const LineRender: React.FC<{ line: Line }> = ({ line }) => {
  if ('prompt' in line) {
    return (
      <div>
        <span className="tk-prompt">{line.prompt}</span>{' '}
        <span className="tk-cmd">{line.text}</span>
      </div>
    );
  }
  if ('type' in line) {
    if (line.type === 'blank') return <div>&nbsp;</div>;
    if (line.type === 'import') {
      // 简易解析 "import { A, B } from 'foo';" 或 "import 'foo';"
      const m = line.text.match(/^import\s*\{([^}]+)\}\s*from\s*'([^']+)';?$/);
      if (m) {
        const items = m[1].split(',').map((s) => s.trim());
        return (
          <div>
            <span className="tk-k">import</span> <span className="tk-p">{'{ '}</span>
            {items.map((it, i) => (
              <React.Fragment key={i}>
                <span className="tk-t">{it}</span>
                {i < items.length - 1 && <span className="tk-p">, </span>}
              </React.Fragment>
            ))}
            <span className="tk-p">{' }'}</span> <span className="tk-k">from</span>{' '}
            <span className="tk-s">'{m[2]}'</span>
            <span className="tk-p">;</span>
          </div>
        );
      }
      const m2 = line.text.match(/^import\s*'([^']+)';?$/);
      if (m2) {
        return (
          <div>
            <span className="tk-k">import</span>{' '}
            <span className="tk-s">'{m2[1]}'</span>
            <span className="tk-p">;</span>
          </div>
        );
      }
      return <div>{line.text}</div>;
    }
    if (line.type === 'export-fn') {
      return (
        <>
          <div>
            <span className="tk-k">export</span> <span className="tk-k">default</span>{' '}
            <span className="tk-k">function</span> <span className="tk-f">{line.name}</span>
            <span className="tk-p">() {'{'}</span>
          </div>
          {line.body.map((sub, i) => (
            <SubLineRender key={i} sub={sub} />
          ))}
          <div>
            <span className="tk-p">{'}'}</span>
          </div>
        </>
      );
    }
  }
  if ('css' in line) {
    return (
      <div>
        {indent(line.indent ?? 0)}
        <span className="tk-a">{line.css.prop}</span>
        <span className="tk-p">: </span>
        <span className="tk-s">{line.css.val}</span>
        <span className="tk-p">;</span>
      </div>
    );
  }
  if ('text' in line) {
    return (
      <div>
        {indent((line as { indent?: number }).indent ?? 0)}
        {line.text}
      </div>
    );
  }
  return null;
};

const SubLineRender: React.FC<{ sub: SubLine }> = ({ sub }) => {
  if ('jsx' in sub) {
    return (
      <div>
        {indent(sub.indent)}
        {sub.jsx.map((part, i) => {
          if (typeof part === 'string') {
            // 把 < / > / { / } 这些标点也染色
            return part.split(/(\{|\}|<|>)/).map((seg, j) => {
              if (/[{}<>]/.test(seg)) return <span key={`${i}-${j}`} className="tk-p">{seg}</span>;
              return <React.Fragment key={`${i}-${j}`}>{seg}</React.Fragment>;
            });
          }
          if (part.tag) return <span key={i} className="tk-t">{part.tag}</span>;
          if (part.attr) return <span key={i} className="tk-a">{part.attr}</span>;
          if (part.str) return <span key={i} className="tk-s">{part.str}</span>;
          if (part.num) return <span key={i} className="tk-n">{part.num}</span>;
          return null;
        })}
      </div>
    );
  }
  if ('css' in sub) {
    return (
      <div>
        {indent(sub.indent)}
        <span className="tk-a">{sub.css.prop}</span>
        <span className="tk-p">: </span>
        <span className="tk-s">{sub.css.val}</span>
        <span className="tk-p">;</span>
      </div>
    );
  }
  return (
    <div>
      {indent(sub.indent)}
      {sub.text}
    </div>
  );
};

/* ============= 下一步卡 ============= */
const NextCard: React.FC<{
  to: string;
  glowColor: string;
  icon: string;
  title: string;
  body: string;
}> = ({ to, glowColor, icon, title, body }) => (
  <Link to={to} className="gs-next-card-wrap">
    <GlowCard glowColor={glowColor} intensity={0.5} padding={24}>
      <div className="gs-next-card__icon" style={{ color: glowColor }}>
        <Icon name={icon} size={24} />
      </div>
      <h3 className="gs-next-card__title">{title}</h3>
      <p className="gs-next-card__body">{body}</p>
      <div className="gs-next-card__arrow" style={{ color: glowColor }}>
        前往 →
      </div>
    </GlowCard>
  </Link>
);

export default GettingStarted;
