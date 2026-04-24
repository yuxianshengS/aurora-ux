import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import ThemeSwitch from '../components/ThemeSwitch';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <header className="site-navbar">
      <div className="site-navbar__inner">
        <Link to="/" className="site-logo">
          <span className="site-logo__mark" aria-hidden />
          <span className="site-logo__name">AuroraUI</span>
          <span className="site-logo__ver">v0.1.0</span>
        </Link>
        <nav className="site-nav">
          <NavLink to="/" end>
            首页
          </NavLink>
          <NavLink to="/docs/getting-started">指南</NavLink>
          <NavLink to="/docs/button">组件</NavLink>
          <NavLink to="/builder">搭建器</NavLink>
          <NavLink to="/examples/dashboard">样板</NavLink>
        </nav>
        <div className="site-actions">
          <ThemeSwitch
            size="small"
            checked={isDark}
            onChange={(next) => setTheme(next ? 'dark' : 'light')}
            aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
          />
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="site-ghlink"
            aria-label="GitHub"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
