import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

/**
 * 部署后旧 index.html 还在浏览器内存里, 点 lazy 路由会去拿旧 chunk hash → 404.
 * Vite 4+ 在动态 import 失败时会派发 vite:preloadError. 监听后自动刷新拿到新 index.html.
 * 用 sessionStorage 防 10s 内连刷死循环 (chunk 真的丢了就让用户看到原始报错).
 */
window.addEventListener('vite:preloadError', (event) => {
  const RELOAD_KEY = 'au-pb-preload-reload-at';
  const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
  if (Date.now() - last < 10_000) return; // 已经刷过, 不再循环
  sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  // eslint-disable-next-line no-console
  console.warn('[aurora-ux] 检测到陈旧的 chunk hash, 自动刷新页面以加载新版本', event);
  window.location.reload();
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
