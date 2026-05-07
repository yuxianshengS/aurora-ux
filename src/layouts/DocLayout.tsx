import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../site-components/Sidebar';
import './DocLayout.css';

const MenuIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
    <path
      d="M4 6h12M4 12h16M4 18h10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const CloseIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
    <path
      d="M6 6l12 12M18 6L6 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const DocLayout: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // 路由切换 → 自动关 drawer
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // 锁滚 + ESC
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen]);

  return (
    <div className={['doc-layout', drawerOpen ? 'is-drawer-open' : ''].filter(Boolean).join(' ')}>
      {/* 移动端目录触发按钮 — desktop 隐藏, 小屏出现在内容区顶部 */}
      <button
        type="button"
        className="doc-layout__toc-toggle"
        onClick={() => setDrawerOpen(true)}
        aria-label="打开目录"
        aria-expanded={drawerOpen}
        aria-controls="doc-sidebar"
      >
        <MenuIcon />
        <span>目录</span>
      </button>

      <div id="doc-sidebar" className="doc-layout__sidebar">
        <button
          type="button"
          className="doc-layout__sidebar-close"
          onClick={() => setDrawerOpen(false)}
          aria-label="关闭目录"
        >
          <CloseIcon />
        </button>
        <Sidebar />
      </div>

      {drawerOpen && (
        <div className="doc-layout__backdrop" onClick={() => setDrawerOpen(false)} aria-hidden />
      )}

      <main className="doc-layout__main">
        <article className="doc-layout__article">
          <Outlet />
        </article>
      </main>
    </div>
  );
};

export default DocLayout;
