import React from 'react';
import { Link } from 'react-router-dom';
import PageBuilder from '../tools/PageBuilder';
import './BuilderWorkspace.css';

const BuilderWorkspace: React.FC = () => {
  return (
    <div className="builder-page">
      <div className="builder-page__head">
        <div>
          <h1 className="builder-page__title">页面搭建器</h1>
          <p className="builder-page__desc">
            拖拽组件 → 配置属性 → 一键导出 JSX。搭好页面,把代码粘到项目里就能用。
            <span className="builder-page__badge">开发期工具 · 不打进 npm 包</span>
          </p>
        </div>
        <div className="builder-page__actions">
          <Link to="/docs/getting-started" className="builder-page__link">
            📘 组件文档
          </Link>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="builder-page__link"
          >
            ⭐ GitHub
          </a>
        </div>
      </div>

      <div className="builder-page__body">
        <PageBuilder componentName="MyPage" />
      </div>

      <div className="builder-page__tips">
        <div className="builder-page__tip">
          <span className="builder-page__tip-no">1</span>
          <div>
            <b>拖入</b>
            <p>从左侧组件库拖到画布。松开鼠标即放置。</p>
          </div>
        </div>
        <div className="builder-page__tip">
          <span className="builder-page__tip-no">2</span>
          <div>
            <b>调整</b>
            <p>点击组件选中,右侧表单改属性,实时预览。悬停出现工具栏:↑ ↓ 复制 删除。</p>
          </div>
        </div>
        <div className="builder-page__tip">
          <span className="builder-page__tip-no">3</span>
          <div>
            <b>导出</b>
            <p>顶部 <code>Copy JSX</code> 得到完整组件源码,<code>Copy JSON</code> 得到配置。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuilderWorkspace;
