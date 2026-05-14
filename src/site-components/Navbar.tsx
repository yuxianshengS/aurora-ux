import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import ThemeSwitch from '../components/ThemeSwitch';
import { openDocsSearch } from './DocsSearch';
import pkg from '../../package.json';
import './Navbar.css';

const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);
const SEARCH_KBD = isMac ? '⌘ K' : 'Ctrl K';

const NAV_ITEMS: { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: '首页', end: true },
  { to: '/docs/getting-started', label: '指南' },
  { to: '/docs/button', label: '组件' },
  { to: '/builder', label: '搭建器' },
  { to: '/examples/dashboard', label: '看板' },
  { to: '/examples/screen', label: '大屏' },
];

const HamburgerIcon: React.FC<{ open: boolean }> = ({ open }) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    aria-hidden
    className={['site-hamburger__svg', open ? 'is-open' : ''].filter(Boolean).join(' ')}
  >
    <path className="site-hamburger__line site-hamburger__line--1" d="M4 7h16" />
    <path className="site-hamburger__line site-hamburger__line--2" d="M4 12h16" />
    <path className="site-hamburger__line site-hamburger__line--3" d="M4 17h16" />
  </svg>
);

const GithubIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
    <path
      fill="currentColor"
      d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.27-.01-1-.02-1.96-3.2.69-3.87-1.54-3.87-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.03 0 0 .96-.31 3.15 1.17a10.94 10.94 0 0 1 5.74 0c2.18-1.48 3.14-1.17 3.14-1.17.63 1.58.24 2.74.11 3.03.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.26 5.65.41.36.78 1.06.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
    />
  </svg>
);

const Navbar: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const [menuOpen, setMenuOpen] = useState(false);
  /** 内容溢出 → compact 模式: 隐藏 desktop nav, 出汉堡 */
  const [compact, setCompact] = useState(false);
  const location = useLocation();

  const innerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  /** 第一次以 desktop 布局测量到的"自然总宽度"; 后续只比较容器宽度跟它的关系, 不再重测 */
  const naturalWidthRef = useRef<number | null>(null);

  // 测量 + 监听容器宽度, 内容放不下就 compact
  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    /** 第一次以 desktop 布局测量 logo + nav + actions 的真实宽度 + gap. 只跑一次. */
    const measureNatural = () => {
      const logo = logoRef.current;
      const nav = navRef.current;
      const actions = actionsRef.current;
      if (!logo || !nav || !actions) return;
      // 拿当前 gap (px) — desktop 时是 32, compact 时可能不同, 但首次跑时还没 compact
      const cs = window.getComputedStyle(inner);
      const gap = parseFloat(cs.columnGap || cs.gap || '0') || 0;
      const padX =
        (parseFloat(cs.paddingLeft || '0') || 0) + (parseFloat(cs.paddingRight || '0') || 0);
      // logo 自身宽 + nav 自身宽 + actions 自身宽 + 2 个 gap (logo↔nav, nav↔actions)
      const needed = logo.offsetWidth + nav.scrollWidth + actions.offsetWidth + gap * 2 + padX;
      naturalWidthRef.current = needed;
    };

    const check = () => {
      if (naturalWidthRef.current == null) measureNatural();
      const natural = naturalWidthRef.current;
      if (natural == null) return;
      // 加 8px buffer 防止刚好临界来回抖动
      setCompact(inner.clientWidth < natural + 8);
    };

    check();
    const ro = new ResizeObserver(check);
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  // 路由切换关掉菜单
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // 容器变宽不再 compact 后, 自动收掉打开的菜单
  useEffect(() => {
    if (!compact) setMenuOpen(false);
  }, [compact]);

  // 菜单展开时锁滚, 防止背景滚动穿透
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  // ESC 关闭
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const headerCls = ['site-navbar', compact ? 'is-compact' : ''].filter(Boolean).join(' ');

  return (
    <header className={headerCls}>
      <div className="site-navbar__inner" ref={innerRef}>
        <Link to="/" className="site-logo" aria-label="Aurora UX 首页" ref={logoRef}>
          <span className="site-logo__mark" aria-hidden />
          <span className="site-logo__name">Aurora UX</span>
          <span className="site-logo__ver">v{pkg.version}</span>
        </Link>

        <nav className="site-nav" ref={navRef}>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-actions" ref={actionsRef}>
          <button
            type="button"
            className="site-search-trigger"
            onClick={openDocsSearch}
            aria-label="搜索"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm5.5-3 4 4"
              />
            </svg>
            <span className="site-search-trigger__placeholder">搜索…</span>
            <span className="site-search-trigger__kbd">{SEARCH_KBD}</span>
          </button>
          <ThemeSwitch
            size="small"
            checked={isDark}
            onChange={(next) => setTheme(next ? 'dark' : 'light')}
            aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
          />
          <a
            href="https://github.com/yuxianshengS/aurora-ux"
            target="_blank"
            rel="noreferrer"
            className="site-ghlink"
            aria-label="GitHub"
          >
            <span className="site-ghlink__text">GitHub</span>
            <span className="site-ghlink__icon" aria-hidden>
              <GithubIcon />
            </span>
          </a>

          {/* 汉堡按钮 — 仅 compact 可见 */}
          <button
            type="button"
            className={['site-hamburger', menuOpen ? 'is-open' : ''].filter(Boolean).join(' ')}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={menuOpen}
            aria-controls="site-mobile-menu"
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {/* 移动端展开菜单 — 全屏 drawer 从顶部下推 */}
      <div
        id="site-mobile-menu"
        className={['site-mobile-menu', menuOpen ? 'is-open' : ''].filter(Boolean).join(' ')}
        aria-hidden={!menuOpen}
      >
        <nav className="site-mobile-menu__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMenuOpen(false)}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="site-mobile-menu__divider" />
        <a
          href="https://github.com/yuxianshengS/aurora-ux"
          target="_blank"
          rel="noreferrer"
          className="site-mobile-menu__ghlink"
        >
          <GithubIcon />
          GitHub
        </a>
      </div>

      {menuOpen && (
        <div
          className="site-mobile-menu__backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden
        />
      )}
    </header>
  );
};

export default Navbar;
