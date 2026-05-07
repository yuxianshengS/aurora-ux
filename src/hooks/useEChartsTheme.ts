import { useEffect, useMemo, useState } from 'react';
import { useTheme } from './useTheme';
import { getAuroraEChartsTheme, type AuroraEChartsThemeOptions } from '../utils/echartsTheme';

/**
 * 响应主题切换的 ECharts theme hook.
 * 监听 useTheme 的 light/dark 切换, 同时也监听 :root[data-theme] 属性变化 (兜底).
 *
 * 用法:
 *   const themeOption = useEChartsTheme();
 *   <ReactECharts option={{ ...themeOption, series: [...] }} />
 */
export const useEChartsTheme = (
  options: AuroraEChartsThemeOptions = {},
): Record<string, unknown> => {
  const { theme } = useTheme();
  // 兜底: 如果用户绕过 useTheme 直接改 data-theme 属性 (比如 ssr inline script),
  // MutationObserver 监听 root attribute 变化, 让 hook 重新执行
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'data-theme') {
          setTick((t) => t + 1);
          break;
        }
      }
    });
    mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);

  return useMemo(
    () =>
      getAuroraEChartsTheme({
        mode: options.mode ?? (theme as 'light' | 'dark'),
        palette: options.palette,
        fontFamily: options.fontFamily,
      }),
    // tick 进 deps 让 attribute 变化也触发重算
    [theme, tick, options.mode, options.palette, options.fontFamily],
  );
};
