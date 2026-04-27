import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  AuroraBg,
  GradientText,
  NumberRoll,
  GlowCard,
  Tag,
  KpiCard,
  Icon,
} from '../components';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home">
      {/* ===== Hero ===== */}
      <AuroraBg preset="aurora" intensity={0.65} blur={110} className="home-hero">
        <div className="home-hero__inner">
          <div className="home-hero__tag">
            <span className="home-hero__tag-dot" />
            v0.3.0 · 极光特效已上线
          </div>
          <h1 className="home-hero__title">
            <GradientText
              as="span"
              preset="aurora"
              animate
              duration={6}
              size={72}
              weight={800}
              style={{ display: 'block', lineHeight: 1.1 }}
            >
              为中后台而生
            </GradientText>
            <span className="home-hero__title-sub">的极光感 React 组件库</span>
          </h1>
          <p className="home-hero__desc">
            60+ 组件 + 可视化拖拽搭建器, 招牌的 AuroraBg / GlowCard / GradientText
            <br />
            让每一个看板都自带光感, 而不是再多一个 antd 克隆.
          </p>
          <div className="home-hero__cta">
            <Link to="/docs/getting-started">
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

      {/* ===== 招牌组件墙 ===== */}
      <section className="home-section">
        <div className="home-section__head">
          <Tag color="primary">独家</Tag>
          <h2 className="home-section__title">极光特效组件</h2>
          <p className="home-section__sub">
            别人没有的, 才是 Aurora 的招牌. 拖几个进项目, 看板从此有光.
          </p>
        </div>
        <div className="home-showcase">
          <ShowcaseAurora />
          <ShowcaseGradientText />
          <ShowcaseGlowCard />
          <ShowcaseNumberRoll />
        </div>
      </section>

      {/* ===== KPI 看板示意 ===== */}
      <section className="home-section">
        <div className="home-section__head">
          <Tag color="success">看板就绪</Tag>
          <h2 className="home-section__title">3 分钟搭出一个看板</h2>
          <p className="home-section__sub">
            KpiCard / Sparkline / Bar3D / Heatmap / Funnel ... 60+ 组件全套, 不用再东拼西凑.
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
      <section className="home-section">
        <div className="home-section__head">
          <Tag>能力</Tag>
          <h2 className="home-section__title">为什么选 AuroraUI</h2>
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
            body="KpiCard / Sparkline / Bar3D / Heatmap / Funnel / Gauge 一套到底."
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
      <section className="home-code">
        <div className="home-code__inner">
          <div className="home-code__left">
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
{`import { AuroraBg, GradientText, NumberRoll, KpiCard } from 'aurora-ux';

export default function Dashboard() {
  return (
    <AuroraBg preset="aurora" style={{ minHeight: 320 }}>
      <GradientText size={56} weight={800}>
        本月销售额
      </GradientText>
      <NumberRoll value={1284560} prefix="¥" size={64} />

      <KpiCard
        title="新增用户"
        value="8,624"
        delta={{ value: 5.2, suffix: '%' }}
        trend={{ data: [3, 5, 4, 6, 8, 9, 11, 13], type: 'area' }}
      />
    </AuroraBg>
  );
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const HomeStats: React.FC = () => {
  // 给在线用户数加个轻微抖动, 让它"活着"
  const [users, setUsers] = useState(1284560);
  useEffect(() => {
    const id = setInterval(() => {
      setUsers((p) => p + Math.floor(Math.random() * 30));
    }, 2000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="home-hero__stats">
      <div className="home-hero__stat">
        <NumberRoll value={60} size={32} weight={700} suffix="+" color="white" />
        <span>组件</span>
      </div>
      <div className="home-hero__stat">
        <NumberRoll value={users} size={32} weight={700} color="white" />
        <span>用户在线</span>
      </div>
      <div className="home-hero__stat">
        <NumberRoll value={99.9} precision={1} size={32} weight={700} suffix="%" color="white" />
        <span>类型覆盖</span>
      </div>
      <div className="home-hero__stat">
        <NumberRoll value={6} size={32} weight={700} color="white" />
        <span>整段模板</span>
      </div>
    </div>
  );
};

const ShowcaseAurora: React.FC = () => (
  <Link to="/docs/aurora-bg" className="home-showcase__item">
    <AuroraBg preset="aurora" style={{ height: 220, borderRadius: 12 }} />
    <div className="home-showcase__caption">
      <strong>AuroraBg</strong>
      <span>极光背景, 5 套预设</span>
    </div>
  </Link>
);

const ShowcaseGradientText: React.FC = () => (
  <Link to="/docs/gradient-text" className="home-showcase__item">
    <div className="home-showcase__centered">
      <GradientText preset="sunset" size={36} weight={800}>
        Sunset
      </GradientText>
      <GradientText preset="ocean" size={36} weight={800}>
        Ocean
      </GradientText>
      <GradientText preset="cosmic" size={36} weight={800}>
        Cosmic
      </GradientText>
    </div>
    <div className="home-showcase__caption">
      <strong>GradientText</strong>
      <span>渐变流动文字, 6 种预设</span>
    </div>
  </Link>
);

const ShowcaseGlowCard: React.FC = () => (
  <Link to="/docs/glow-card" className="home-showcase__item">
    <div className="home-showcase__glow-row">
      <GlowCard
        glowColor="#a855f7"
        intensity={0.7}
        padding={16}
        radius={12}
        style={{ flex: 1, fontSize: 13 }}
      >
        <strong>悬停看光晕 →</strong>
      </GlowCard>
      <GlowCard
        glowColor="#22d3ee"
        intensity={0.7}
        padding={16}
        radius={12}
        style={{ flex: 1, fontSize: 13 }}
      >
        <strong>← 鼠标在哪光在哪</strong>
      </GlowCard>
    </div>
    <div className="home-showcase__caption">
      <strong>GlowCard</strong>
      <span>鼠标跟随发光 + 旋转描边</span>
    </div>
  </Link>
);

const ShowcaseNumberRoll: React.FC = () => {
  const [n, setN] = useState(1284560);
  useEffect(() => {
    const id = setInterval(
      () => setN(Math.floor(Math.random() * 9000000) + 1000000),
      2500,
    );
    return () => clearInterval(id);
  }, []);
  return (
    <Link to="/docs/number-roll" className="home-showcase__item">
      <div className="home-showcase__centered">
        <NumberRoll value={n} size={48} weight={800} color="var(--au-primary)" />
      </div>
      <div className="home-showcase__caption">
        <strong>NumberRoll</strong>
        <span>翻牌器式数字滚动</span>
      </div>
    </Link>
  );
};

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
