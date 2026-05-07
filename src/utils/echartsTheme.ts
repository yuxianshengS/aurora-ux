/**
 * Aurora ↔ ECharts 主题桥接
 * ----------------------------------------------------------------
 * 痛点: 大屏 / 看板 总会用到 ECharts (折线 / 柱状 / 饼 / 雷达 / 桑基 / 地图),
 * 但 ECharts 默认主题跟 Aurora 视觉脱节 — 文字色 / 网格线 / 背景都不跟主题切.
 *
 * 这里提供一个轻量桥接: 读 :root 上的 Aurora CSS 变量, 生成一份 ECharts option
 * 默认值. 用户写自己 option 时把这份 base merge 进去, 全套图表自动跟 Aurora 主题
 * 色板 + 文字色 + dark mode 切换.
 *
 * 用法:
 *   import { getAuroraEChartsTheme } from 'aurora-ux';
 *   const base = getAuroraEChartsTheme();
 *   const myOption = { ...base, series: [...], xAxis: ..., yAxis: ... };
 *
 * 或在组件里走 hook (响应主题切换自动重算):
 *   const base = useEChartsTheme();
 */

export interface AuroraEChartsThemeOptions {
  /** 强制使用某种主题模式; 默认按当前 :root[data-theme] 读 */
  mode?: 'light' | 'dark' | 'auto';
  /** 自定义主色板 (覆盖默认 6 色) */
  palette?: string[];
  /** 字体族 */
  fontFamily?: string;
}

/** 默认色板 — Aurora 极光体系: 主色 / 青 / 紫 / 粉 / 绿 / 橙 */
const DEFAULT_PALETTE_LIGHT = [
  '#5b8def',
  '#22d3ee',
  '#a855f7',
  '#f472b6',
  '#10b981',
  '#fb923c',
  '#facc15',
  '#06b6d4',
];
const DEFAULT_PALETTE_DARK = [
  '#7aa2ff',
  '#22d3ee',
  '#c084fc',
  '#f9a8d4',
  '#34d399',
  '#fdba74',
  '#fde047',
  '#67e8f9',
];

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

const readVar = (name: string, fallback = ''): string => {
  if (!isBrowser) return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
};

const detectMode = (): 'light' | 'dark' => {
  if (!isBrowser) return 'light';
  const t = document.documentElement.getAttribute('data-theme');
  if (t === 'dark') return 'dark';
  if (t === 'light') return 'light';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * 生成一份 ECharts 默认 option, 内置:
 * - color: Aurora 极光色板 (跟随 dark/light)
 * - textStyle: 跟 --au-text-1 / 字体走
 * - backgroundColor: transparent (让大屏 AuroraBg 透出来)
 * - tooltip: 玻璃质感, 跟 --au-bg + --au-border
 * - axis / split line: 跟 --au-border / --au-text-3
 * - legend / title: 文字色跟 --au-text-2
 *
 * 用户的 option 直接 merge 进来即可, 不需要手动改 axis 颜色等.
 */
export const getAuroraEChartsTheme = (
  options: AuroraEChartsThemeOptions = {},
): Record<string, unknown> => {
  const { palette, fontFamily, mode = 'auto' } = options;
  const resolvedMode = mode === 'auto' ? detectMode() : mode;
  const isDark = resolvedMode === 'dark';

  const text1 = readVar('--au-text-1', isDark ? '#e5e7eb' : '#0f172a');
  const text2 = readVar('--au-text-2', isDark ? '#9ca3af' : '#475569');
  const text3 = readVar('--au-text-3', isDark ? '#6b7280' : '#94a3b8');
  const border = readVar('--au-border', isDark ? '#2a2f3a' : '#e2e8f0');
  const borderStrong = readVar('--au-border-strong', isDark ? '#3a414f' : '#cbd5e1');
  const bg = readVar('--au-bg', isDark ? '#0f141b' : '#ffffff');
  const primary = readVar('--au-primary', isDark ? '#7aa2ff' : '#5b8def');

  const colorList = palette ?? (isDark ? DEFAULT_PALETTE_DARK : DEFAULT_PALETTE_LIGHT);
  const font =
    fontFamily ??
    readVar(
      '--au-font',
      `-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Segoe UI", Arial, sans-serif`,
    );

  return {
    color: colorList,
    backgroundColor: 'transparent',
    textStyle: {
      color: text1,
      fontFamily: font,
    },
    title: {
      textStyle: { color: text1, fontWeight: 600, fontFamily: font },
      subtextStyle: { color: text3, fontFamily: font },
    },
    legend: {
      textStyle: { color: text2, fontFamily: font, fontSize: 12 },
      icon: 'roundRect',
    },
    tooltip: {
      backgroundColor: bg,
      borderColor: border,
      borderWidth: 1,
      textStyle: { color: text1, fontFamily: font, fontSize: 12 },
      extraCssText: `box-shadow: 0 6px 24px ${
        isDark ? 'rgba(0,0,0,0.5)' : 'rgba(17,24,39,0.08)'
      }; border-radius: 10px;`,
      axisPointer: {
        lineStyle: { color: borderStrong, width: 1, type: 'dashed' },
        crossStyle: { color: borderStrong, width: 1, type: 'dashed' },
        shadowStyle: {
          color: isDark ? 'rgba(122,162,255,0.08)' : 'rgba(91,141,239,0.06)',
        },
      },
    },
    grid: {
      left: 24,
      right: 24,
      top: 32,
      bottom: 32,
      containLabel: true,
    },
    categoryAxis: {
      axisLine: { lineStyle: { color: border } },
      axisTick: { lineStyle: { color: border } },
      axisLabel: { color: text3, fontFamily: font, fontSize: 11 },
      splitLine: { show: false, lineStyle: { color: border, type: 'dashed' } },
      splitArea: { show: false },
    },
    valueAxis: {
      axisLine: { show: false, lineStyle: { color: border } },
      axisTick: { show: false },
      axisLabel: { color: text3, fontFamily: font, fontSize: 11 },
      splitLine: {
        show: true,
        lineStyle: {
          color: border,
          type: 'dashed',
          opacity: 0.6,
        },
      },
    },
    timeAxis: {
      axisLine: { lineStyle: { color: border } },
      axisTick: { lineStyle: { color: border } },
      axisLabel: { color: text3, fontFamily: font, fontSize: 11 },
      splitLine: { show: false },
    },
    logAxis: {
      axisLine: { lineStyle: { color: border } },
      axisLabel: { color: text3, fontFamily: font, fontSize: 11 },
      splitLine: { show: true, lineStyle: { color: border, type: 'dashed' } },
    },
    line: {
      itemStyle: { borderWidth: 0 },
      lineStyle: { width: 2 },
      symbolSize: 6,
      symbol: 'circle',
      smooth: true,
    },
    bar: {
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
      },
    },
    pie: {
      itemStyle: { borderColor: bg, borderWidth: 2 },
    },
    radar: {
      lineStyle: { width: 2 },
      symbolSize: 5,
      areaStyle: { opacity: 0.18 },
    },
    visualMap: {
      textStyle: { color: text2, fontFamily: font },
      inRange: {
        color: [colorList[0], colorList[1] ?? colorList[0]],
      },
    },
    dataZoom: {
      backgroundColor: 'transparent',
      borderColor: border,
      fillerColor: isDark ? 'rgba(122,162,255,0.16)' : 'rgba(91,141,239,0.1)',
      handleStyle: { color: primary, borderColor: primary },
      moveHandleStyle: { color: primary },
      textStyle: { color: text3, fontFamily: font },
    },
    toolbox: {
      iconStyle: { borderColor: text3 },
      emphasis: { iconStyle: { borderColor: primary } },
    },
    timeline: {
      lineStyle: { color: border },
      itemStyle: { color: text3 },
      controlStyle: { color: text2, borderColor: text2 },
      checkpointStyle: { color: primary, borderColor: primary },
      label: { color: text2, fontFamily: font },
      emphasis: {
        itemStyle: { color: primary },
        controlStyle: { color: primary, borderColor: primary },
        label: { color: text1 },
      },
    },
    geo: {
      itemStyle: {
        areaColor: isDark ? '#1c2330' : '#f1f5f9',
        borderColor: border,
      },
      emphasis: {
        itemStyle: {
          areaColor: isDark ? 'rgba(122,162,255,0.2)' : 'rgba(91,141,239,0.12)',
        },
      },
    },
  };
};
