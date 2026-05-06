import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import pkg from '../../package.json';
import {
  Button,
  AuroraBg,
  GradientText,
  NumberRoll,
  GlowCard,
  Tag,
  KpiCard,
  Icon,
  ConnectorGroup,
  Connector,
  PulseDot,
} from '../components';
import './Home.css';

/* 滚动揭示 — 一次性 fade-up,unobserve 后零开销 */
const useScrollReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.home-reveal');
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-revealed');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
};

const Home: React.FC = () => {
  useScrollReveal();
  return (
    <div className="home">
      {/* ===== Hero — 干净有自信, 不堆特效 ===== */}
      <AuroraBg preset="aurora" intensity={0.55} blur={120} className="home-hero">
        {/* 中央放大的网格 — 透视感 + mask 渐隐, 只有静态 CSS, 0 运行时 */}
        <div className="home-hero__grid" aria-hidden />
        <div className="home-hero__inner">
          <Link to="/docs/getting-started" className="home-hero__tag">
            <span className="home-hero__tag-dot" />
            Aurora UX v{pkg.version}
            <span className="home-hero__tag-arrow">→</span>
          </Link>
          <h1 className="home-hero__title">
            <GradientText
              as="span"
              preset="aurora"
              animate
              duration={6}
              size={80}
              weight={900}
              style={{ display: 'block', lineHeight: 1.05, letterSpacing: '-0.02em' }}
            >
              极光质感 React 组件库
            </GradientText>
            <span className="home-hero__title-sub">为中后台与数据看板而生</span>
          </h1>
          <p className="home-hero__desc">
            60+ 组件,数据可视化全套,可视化拖拽搭建器一套到底.
            <br />
            开箱即用,主题可调,让每一个仪表盘都自带光感.
          </p>
          <div className="home-hero__cta">
            <Link to="/docs/getting-started" className="home-hero__cta-primary">
              <Button type="primary" size="large">
                开始使用 →
              </Button>
            </Link>
            <Link to="/builder">
              <Button size="large">打开搭建器</Button>
            </Link>
          </div>
          <HeroInstallPill />
          <HomeStats />
        </div>
      </AuroraBg>

      {/* ===== Connector 关系图专栏 ===== */}
      <section className="home-section home-section--alt home-connector home-reveal">
        <div className="home-section__head">
          <span className="home-section__eyebrow">
            <span className="home-section__eyebrow-num">01</span>
            <span className="home-section__eyebrow-divider" />
            主题能力 · DIAGRAMS
          </span>
          <h2 className="home-section__title">用 Connector 画任何关系图</h2>
          <p className="home-section__sub">
            DOM 之间画一条线, 自动跟随尺寸 / 滚动 / 拖动. 1-1, 1-many, mesh,
            主从双向 — 4 种线形 + 极光渐变 + 流动虚线, 拓扑图 / 流程图 / 思维导图
            一个组件搞定.
          </p>
        </div>
        <div className="home-connector__inner">
          <div className="home-connector__diagram">
            <MiniTopologyShowcase />
          </div>
          <div className="home-connector__usecases">
            <ConnectorUseCase
              to="/docs/connector"
              color="#22d3ee"
              icon="connections"
              title="网络拓扑"
              body="多层架构 / 服务拓扑 / K8s 集群"
            />
            <ConnectorUseCase
              to="/docs/flowchart"
              color="#a855f7"
              icon="catalog"
              title="流程图"
              body="审批流 / 工作流 / 状态机"
            />
            <ConnectorUseCase
              to="/docs/dependency-graph"
              color="#f472b6"
              icon="connections"
              title="依赖关系"
              body="模块依赖 / 微服务调用 / Pkg Tree"
            />
            <ConnectorUseCase
              to="/docs/data-lineage"
              color="#10b981"
              icon="charts-curve"
              title="数据血缘"
              body="数据源 → ETL → 仓库 → 报表"
            />
            <ConnectorUseCase
              to="/docs/mindmap"
              color="#fb923c"
              icon="catalog-check"
              title="思维导图"
              body="中心放射 / 多级展开"
            />
            <Link to="/docs/connector" className="home-connector__cta">
              查看完整文档 →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== KPI 看板示意 ===== */}
      <section className="home-section home-reveal">
        <div className="home-section__head">
          <span className="home-section__eyebrow">
            <span className="home-section__eyebrow-num">02</span>
            <span className="home-section__eyebrow-divider" />
            看板就绪 · DASHBOARD
          </span>
          <h2 className="home-section__title">3 分钟搭出一个看板</h2>
          <p className="home-section__sub">
            KpiCard / Sparkline / Heatmap / Funnel / Gauge ... 60+ 组件全套, 不用再东拼西凑.
          </p>
        </div>
        <div className="home-kpi-grid">
          <KpiCard
            title="本月销售额"
            value="¥ 1,284,560"
            delta={{ value: 12.4, suffix: '%' }}
            status="success"
            trend={{ data: [8, 12, 9, 14, 18, 16, 22, 24], type: 'area' }}
          />
          <KpiCard
            title="新增用户"
            value="8,624"
            delta={{ value: 5.2, suffix: '%' }}
            status="success"
            trend={{ data: [3, 5, 4, 6, 8, 9, 11, 13], type: 'area' }}
          />
          <KpiCard
            title="转化率"
            value="24.6%"
            delta={{ value: -1.8, suffix: '%' }}
            status="danger"
            trend={{ data: [28, 26, 27, 25, 24, 25, 24, 24.6], type: 'line' }}
          />
          <KpiCard
            title="留存率"
            value="78.3%"
            delta={{ value: 2.1, suffix: '%' }}
            status="success"
            trend={{ data: [72, 73, 75, 74, 76, 77, 78, 78.3], type: 'area' }}
          />
        </div>
      </section>

      {/* ===== 特性 6 张卡 ===== */}
      <section className="home-section home-section--alt home-reveal">
        <div className="home-section__head">
          <span className="home-section__eyebrow">
            <span className="home-section__eyebrow-num">03</span>
            <span className="home-section__eyebrow-divider" />
            核心能力 · CAPABILITIES
          </span>
          <h2 className="home-section__title">为什么选 Aurora UX</h2>
        </div>
        <div className="home-features">
          <FeatureCard
            glowColor="#6366f1"
            icon="scenes"
            title="极光美学"
            body="AuroraBg / GlowCard / GradientText 等招牌组件, 默认就有 dribbble 级别质感."
          />
          <FeatureCard
            glowColor="#a855f7"
            icon="click"
            title="拖拽搭建器"
            body="60+ 组件全部可拖, 整段模板一键展开, 导出 JSX 直接 commit."
          />
          <FeatureCard
            glowColor="#22d3ee"
            icon="charts-bar"
            title="数据看板齐"
            body="KpiCard / Sparkline / Heatmap / Funnel / Gauge 一套到底."
          />
          <FeatureCard
            glowColor="#10b981"
            icon="catalog-check"
            title="完整表单"
            body="useForm + 校验规则 + 实时联动, 不再为表单接 antd."
          />
          <FeatureCard
            glowColor="#fb923c"
            icon="change"
            title="双主题驱动"
            body="CSS 变量驱动, 暗色亮色一键切, 改一行改全套."
          />
          <FeatureCard
            glowColor="#f43f5e"
            icon="lock"
            title="TypeScript 全套"
            body="所有 props 完备类型, 编辑器里点字段直接知道是什么."
          />
        </div>
      </section>

      {/* ===== 代码面板 (反差: 深色 IDE 风) ===== */}
      <section className="home-code home-reveal">
        <div className="home-code__inner">
          <div className="home-code__left">
            <span className="home-section__eyebrow">
              <span className="home-section__eyebrow-num">04</span>
              <span className="home-section__eyebrow-divider" />
              安装即用 · INSTALL
            </span>
            <h2 className="home-code__title">写起来就像看上去一样轻</h2>
            <p className="home-code__sub">
              所有组件即插即用, TypeScript 全套类型, IDE 里 hover 就知道每个 prop 干什么.
            </p>
            <div className="home-code__install">
              <CopyLine prefix="$" command="pnpm add aurora-ux" />
              <CopyLine prefix="#" command='import "aurora-ux/style.css"' />
            </div>
            <div className="home-code__links">
              <Link to="/docs/getting-started">
                <Button size="medium">阅读快速开始 →</Button>
              </Link>
              <a
                href="https://github.com/yuxianshengS/aurora-ux"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button type="ghost" size="medium">GitHub</Button>
              </a>
              <a
                href="https://www.npmjs.com/package/aurora-ux"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button type="ghost" size="medium">npm</Button>
              </a>
            </div>
          </div>
          <div className="home-code__right">
            <div className="home-code__window">
              <div className="home-code__window-bar">
                <span className="home-code__dot home-code__dot--r" />
                <span className="home-code__dot home-code__dot--y" />
                <span className="home-code__dot home-code__dot--g" />
                <span className="home-code__filename">Dashboard.tsx</span>
              </div>
              <pre className="home-code__editor">
                <CodeSnippet />
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const HomeStats: React.FC = () => (
  <div className="home-hero__stats">
    <div className="home-hero__stat">
      <NumberRoll value={60} size={36} weight={800} suffix="+" color="white" />
      <span>组件</span>
    </div>
    <div className="home-hero__stat-divider" aria-hidden />
    <div className="home-hero__stat">
      <NumberRoll value={6} size={36} weight={800} color="white" />
      <span>整段模板</span>
    </div>
    <div className="home-hero__stat-divider" aria-hidden />
    <div className="home-hero__stat">
      <NumberRoll value={99.9} precision={1} size={36} weight={800} suffix="%" color="white" />
      <span>类型覆盖</span>
    </div>
    <div className="home-hero__stat-divider" aria-hidden />
    <div className="home-hero__stat">
      <NumberRoll value={0} size={36} weight={800} color="white" />
      <span>运行时依赖</span>
    </div>
  </div>
);

/* ===== 手写 JSX 语法高亮: token 原子 ===== */
type Tk = (s: React.ReactNode) => React.ReactElement;
const k: Tk = (s) => <span className="tk-k">{s}</span>;   // keyword (import/from/export/default/function/return)
const t: Tk = (s) => <span className="tk-t">{s}</span>;   // tag / 组件名
const a: Tk = (s) => <span className="tk-a">{s}</span>;   // attr / prop
const str: Tk = (s) => <span className="tk-s">{s}</span>; // string
const n: Tk = (s) => <span className="tk-n">{s}</span>;   // number
const p: Tk = (s) => <span className="tk-p">{s}</span>;   // punctuation (dim)
const fn: Tk = (s) => <span className="tk-f">{s}</span>;  // function name
const txt = (s: string) => <span className="tk-text">{s}</span>; // JSX 文本

const CodeSnippet: React.FC = () => (
  <code className="tk-root">
    <div>{k('import')} {p('{')} {t('AuroraBg')}{p(',')} {t('GradientText')}{p(',')} {t('NumberRoll')}{p(',')} {t('KpiCard')} {p('}')} {k('from')} {str("'aurora-ux'")}{p(';')}</div>
    <div>&nbsp;</div>
    <div>{k('export')} {k('default')} {k('function')} {fn('Dashboard')}{p('()')} {p('{')}</div>
    <div>{'  '}{k('return')} {p('(')}</div>
    <div>{'    '}{p('<')}{t('AuroraBg')} {a('preset')}{p('=')}{str('"aurora"')} {a('style')}{p('={{')} {a('minHeight')}{p(':')} {n('320')} {p('}}>')}</div>
    <div>{'      '}{p('<')}{t('GradientText')} {a('size')}{p('={')}{n('56')}{p('}')} {a('weight')}{p('={')}{n('800')}{p('}>')}</div>
    <div>{'        '}{txt('本月销售额')}</div>
    <div>{'      '}{p('</')}{t('GradientText')}{p('>')}</div>
    <div>{'      '}{p('<')}{t('NumberRoll')} {a('value')}{p('={')}{n('1284560')}{p('}')} {a('prefix')}{p('=')}{str('"¥"')} {a('size')}{p('={')}{n('64')}{p('}')} {p('/>')}</div>
    <div>&nbsp;</div>
    <div>{'      '}{p('<')}{t('KpiCard')}</div>
    <div>{'        '}{a('title')}{p('=')}{str('"新增用户"')}</div>
    <div>{'        '}{a('value')}{p('=')}{str('"8,624"')}</div>
    <div>{'        '}{a('delta')}{p('={{')} {a('value')}{p(':')} {n('5.2')}{p(',')} {a('suffix')}{p(':')} {str("'%'")} {p('}}')}</div>
    <div>{'        '}{a('trend')}{p('={{')} {a('data')}{p(':')} {p('[')}{n('3')}{p(',')} {n('5')}{p(',')} {n('4')}{p(',')} {n('6')}{p(',')} {n('8')}{p(',')} {n('9')}{p(',')} {n('11')}{p(',')} {n('13')}{p('],')} {a('type')}{p(':')} {str("'area'")} {p('}}')}</div>
    <div>{'      '}{p('/>')}</div>
    <div>{'    '}{p('</')}{t('AuroraBg')}{p('>')}</div>
    <div>{'  '}{p(');')}</div>
    <div>{p('}')}</div>
  </code>
);

const HeroInstallPill: React.FC = () => {
  const cmd = 'npm i aurora-ux';
  const [copied, setCopied] = useState(false);
  const onCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* noop */
    }
  };
  return (
    <div className="home-hero__pill">
      <span className="home-hero__pill-prompt">$</span>
      <code className="home-hero__pill-cmd">{cmd}</code>
      <button
        type="button"
        className="home-hero__pill-copy"
        onClick={onCopy}
        aria-label="复制命令"
      >
        {copied ? '✓ 已复制' : '复制'}
      </button>
      <a
        className="home-hero__pill-link"
        href="https://www.npmjs.com/package/aurora-ux"
        target="_blank"
        rel="noopener noreferrer"
      >
        npmjs ↗
      </a>
    </div>
  );
};

const CopyLine: React.FC<{ prefix: string; command: string }> = ({ prefix, command }) => {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* noop */
    }
  };
  return (
    <button type="button" className="home-code__copy-line" onClick={onCopy}>
      <span className="home-code__copy-prefix">{prefix}</span>
      <code className="home-code__copy-cmd">{command}</code>
      <span className="home-code__copy-status">{copied ? '已复制 ✓' : '点击复制'}</span>
    </button>
  );
};

/* === Connector 主题专栏 === */

const MiniTopologyShowcase: React.FC = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const gw = useRef<HTMLDivElement>(null);
  const svc1 = useRef<HTMLDivElement>(null);
  const svc2 = useRef<HTMLDivElement>(null);
  const svc3 = useRef<HTMLDivElement>(null);
  const db = useRef<HTMLDivElement>(null);
  return (
    <div ref={stageRef} className="home-connector__stage">
      <ConnectorGroup container={stageRef} defaultArrow="end" defaultType="step">
        <MiniNode
          ref={gw}
          icon="connections"
          color="#22d3ee"
          title="API Gateway"
          pos={{ left: '50%', top: 20, transform: 'translateX(-50%)' }}
          pulse="live"
        />
        <MiniNode
          ref={svc1}
          icon="customer"
          color="#6366f1"
          title="User Svc"
          pos={{ left: '8%', top: 130 }}
        />
        <MiniNode
          ref={svc2}
          icon="order"
          color="#a855f7"
          title="Order Svc"
          pos={{ left: '50%', top: 130, transform: 'translateX(-50%)' }}
        />
        <MiniNode
          ref={svc3}
          icon="checkstand"
          color="#f472b6"
          title="Payment Svc"
          pos={{ right: '8%', top: 130 }}
        />
        <MiniNode
          ref={db}
          icon="folder"
          color="#10b981"
          title="Postgres"
          pos={{ left: '50%', top: 240, transform: 'translateX(-50%)' }}
          pulse="live"
        />

        <Connector
          from={gw}
          to={[svc1, svc2, svc3]}
          color={['#22d3ee', '#a855f7']}
          thickness={2}
          animated
          flow={{ count: 2, speed: 1.8, size: 3 }}
        />
        <Connector
          from={[svc1, svc2, svc3]}
          to={db}
          color="#10b981"
          thickness={1.5}
          flow={{ count: 1, speed: 2.4, size: 2.5 }}
        />
      </ConnectorGroup>
    </div>
  );
};

interface MiniNodeProps {
  icon: string;
  color: string;
  title: string;
  pulse?: 'live' | 'warning' | 'danger';
  pos: React.CSSProperties;
}
const MiniNode = React.forwardRef<HTMLDivElement, MiniNodeProps>(
  ({ icon, color, title, pulse, pos }, ref) => (
    <div
      ref={ref}
      className="home-mini-node"
      style={{ position: 'absolute', ...pos }}
    >
      <GlowCard glowColor={color} intensity={0.6} padding="10px 14px" radius={10}>
        <div className="home-mini-node__row">
          <Icon name={icon} size={16} style={{ color }} />
          <span>{title}</span>
          {pulse && <PulseDot status={pulse} size={6} />}
        </div>
      </GlowCard>
    </div>
  ),
);
MiniNode.displayName = 'MiniNode';

const ConnectorUseCase: React.FC<{
  to: string;
  color: string;
  icon: string;
  title: string;
  body: string;
}> = ({ to, color, icon, title, body }) => (
  <Link to={to} className="home-connector__usecase">
    <span className="home-connector__usecase-icon" style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}>
      <Icon name={icon} size={18} />
    </span>
    <div className="home-connector__usecase-text">
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
    <span className="home-connector__usecase-arrow" style={{ color }}>→</span>
  </Link>
);

const FeatureCard: React.FC<{
  glowColor: string;
  icon: string;
  title: string;
  body: string;
}> = ({ glowColor, icon, title, body }) => (
  <GlowCard glowColor={glowColor} intensity={0.5} padding={28}>
    <div className="home-feature__icon" style={{ color: glowColor }}>
      <Icon name={icon} size={28} />
    </div>
    <h3 className="home-feature__title">{title}</h3>
    <p className="home-feature__body">{body}</p>
  </GlowCard>
);

export default Home;
