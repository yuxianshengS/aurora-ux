import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageBuilder from '../tools/PageBuilder';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import './BuilderWorkspace.css';

const BuilderWorkspace: React.FC = () => {
  const [helpOpen, setHelpOpen] = useState(false);
  return (
    <div className="builder-page">
      <div className="builder-page__head">
        <div className="builder-page__title-row">
          <h1 className="builder-page__title">页面搭建器</h1>
          <span className="builder-page__badge">开发期工具</span>
          <span className="builder-page__hint">
            拖组件 → 调属性 → 复制 JSX。点工具栏 ⛶ 进全屏获得最大空间。
          </span>
        </div>
        <div className="builder-page__actions">
          <button
            type="button"
            className="builder-page__link"
            onClick={() => setHelpOpen(true)}
          >
            <Icon name="info" size={14} />
            <span>帮助</span>
          </button>
          <Link to="/docs/getting-started" className="builder-page__link">
            <Icon name="catalog" size={14} />
            <span>文档</span>
          </Link>
        </div>
      </div>

      <div className="builder-page__body">
        <PageBuilder componentName="MyPage" />
      </div>

      <Modal
        open={helpOpen}
        title="快捷键和操作"
        cancelText="关闭"
        okText=""
        width={520}
        centered
        onCancel={() => setHelpOpen(false)}
        onOk={() => setHelpOpen(false)}
      >
        <div className="au-pb__help">
          <div className="au-pb__help-section">
            <div className="au-pb__help-head">编辑</div>
            <div className="au-pb__help-row">
              <span>撤销 / 重做</span>
              <span><kbd>⌘ Z</kbd> · <kbd>⌘ ⇧ Z</kbd></span>
            </div>
            <div className="au-pb__help-row">
              <span>原位复制选中块</span>
              <span><kbd>⌘ D</kbd></span>
            </div>
            <div className="au-pb__help-row">
              <span>复制 / 粘贴 (跨位置)</span>
              <span><kbd>⌘ C</kbd> · <kbd>⌘ V</kbd></span>
            </div>
            <div className="au-pb__help-row">
              <span>删除选中块</span>
              <span><kbd>Del</kbd> · <kbd>Backspace</kbd></span>
            </div>
            <div className="au-pb__help-row">
              <span>同 slot 上下移动</span>
              <span><kbd>↑</kbd> · <kbd>↓</kbd></span>
            </div>
          </div>
          <div className="au-pb__help-section">
            <div className="au-pb__help-head">选中</div>
            <div className="au-pb__help-row">
              <span>选父级 (链式向上)</span>
              <span><kbd>Esc</kbd></span>
            </div>
            <div className="au-pb__help-row">
              <span>右键块 → 上下文菜单</span>
              <span><kbd>右键</kbd></span>
            </div>
            <div className="au-pb__help-row">
              <span>面包屑 / 大纲点击跳转</span>
              <span>属性面板顶部 / 左侧大纲 tab</span>
            </div>
          </div>
          <div className="au-pb__help-section">
            <div className="au-pb__help-head">属性面板</div>
            <div className="au-pb__help-row">
              <span>数值字段拖拽改值</span>
              <span>label 上左右拖,4px = 1 步</span>
            </div>
            <div className="au-pb__help-row">
              <span>布局 / 间距 / 对齐</span>
              <span>底部「布局 / 间距」折叠区</span>
            </div>
          </div>
          <div className="au-pb__help-section">
            <div className="au-pb__help-head">画布</div>
            <div className="au-pb__help-row">
              <span>全屏</span>
              <span>工具栏 ⛶ · <kbd>Esc</kbd> 退出</span>
            </div>
            <div className="au-pb__help-row">
              <span>切换断点</span>
              <span>工具栏 设备图标 dropdown</span>
            </div>
            <div className="au-pb__help-row">
              <span>锁定块</span>
              <span>块工具条 🔒 · 锁后禁拖删</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BuilderWorkspace;
