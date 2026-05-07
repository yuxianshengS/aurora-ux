/**
 * npm 包的 library 入口 — 只导出组件 + 公共 hook, 不包含演示站点 / 路由 / PageBuilder 工具
 *
 * 消费者用法:
 *   import { Button, Table, Flex, useTheme, useFocusTrap } from 'aurora-ux';
 *   import 'aurora-ux/style.css';  // 单独引样式
 */

// 全库共用的设计 token + motion 词汇 (popup keyframes / press 回弹 / focus ring 兜底)
// 必须早于组件样式 import — 组件 CSS 都基于这些 token / keyframes 工作
import './styles/variables.css';
import './styles/motion.css';
import './styles/focus.css';
// a11y 兜底: prefers-reduced-motion 时关掉所有 .au-* 元素的动画 / 过渡
import './styles/reduced-motion.css';

export * from './components';

// 公共 hooks (let consumers reuse our infra)
export { useTheme, type Theme } from './hooks/useTheme';
export { useFocusTrap } from './hooks/useFocusTrap';
export { useInView, type UseInViewOptions } from './hooks/useInView';
export { useOutsideClick } from './hooks/useOutsideClick';
export { useReactivePosition } from './hooks/useReactivePosition';
export { useEChartsTheme } from './hooks/useEChartsTheme';

// ECharts 主题桥接 — 让 ECharts 自动跟 Aurora 主题色板 + 文字色 + dark mode 走
export { getAuroraEChartsTheme, type AuroraEChartsThemeOptions } from './utils/echartsTheme';

// i18n locale 包
export { zhCN, enUS } from './locale';
export type { Locale } from './locale';

// 主题工具 — generateTheme(brand) → ThemeTokens, applyTheme 写到 :root
export {
  generateTheme,
  applyTheme,
  resetTheme,
  exportThemeCss,
  hexToHsl,
  hslToHex,
} from './utils/generateTheme';
export type { ThemeTokens } from './utils/generateTheme';
