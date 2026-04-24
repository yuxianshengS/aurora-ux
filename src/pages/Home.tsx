import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../components';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero__aurora" aria-hidden />
        <div className="home-hero__inner">
          <span className="home-hero__tag">AuroraUI · v0.1.0</span>
          <h1 className="home-hero__title">
            轻盈如<span className="home-hero__gradient">极光</span>
            <br />
            为现代 React 应用而生的组件库
          </h1>
          <p className="home-hero__desc">
            精心雕琢的视觉语言，完整的 TypeScript 类型提示，
            <br />
            帮助你更快地打造优雅、一致的产品体验。
          </p>
          <div className="home-hero__cta">
            <Link to="/docs/getting-started">
              <Button type="primary" size="large">
                开始使用 →
              </Button>
            </Link>
            <Link to="/examples/dashboard">
              <Button size="large">看看样板 Dashboard →</Button>
            </Link>
            <Link to="/docs/button">
              <Button type="ghost" size="large">
                浏览组件
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="home-features">
        <h2 className="home-section__title">为什么选择 AuroraUI</h2>
        <div className="home-features__grid">
          <Card hoverable title="🌈 设计精良">
            遵循一致的视觉规范，色彩、间距、动效都经过反复推敲。
          </Card>
          <Card hoverable title="⚡ 开箱即用">
            30+ 常用组件开箱可用，配合清晰的 API，让开发更专注业务。
          </Card>
          <Card hoverable title="🧩 易于扩展">
            基于 CSS 变量的主题系统，几行代码即可定制你的专属品牌色。
          </Card>
          <Card hoverable title="🛡️ 类型安全">
            使用 TypeScript 编写，自带完备的类型定义，减少运行时错误。
          </Card>
          <Card hoverable title="📦 轻量无依赖">
            零额外 UI 依赖，按需引入，打包体积友好。
          </Card>
          <Card hoverable title="🌙 深色模式">
            基于 CSS 变量，切换主题毫无阻力（即将支持）。
          </Card>
        </div>
      </section>

      <section className="home-cta">
        <h2 className="home-section__title">现在就试一试</h2>
        <pre>
          <code>npm install aurora-ui</code>
        </pre>
        <Link to="/docs/getting-started">
          <Button type="primary">阅读快速开始 →</Button>
        </Link>
      </section>
    </div>
  );
};

export default Home;
