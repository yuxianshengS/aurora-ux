/**
 * npm 包的 library 入口 — 只导出组件, 不包含演示站点 / 路由 / PageBuilder 工具
 *
 * 消费者用法:
 *   import { Button, Table, Flex } from 'aurora-ui';
 *   import 'aurora-ui/dist/style.css';  // 单独引样式
 */
export * from './components';
