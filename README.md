<div align="center">

# Aurora UI

**为中后台而生的极光感 React 组件库 + 可视化拖拽搭建器**

[![npm](https://img.shields.io/npm/v/aurora-ux?color=a855f7&label=npm)](https://www.npmjs.com/package/aurora-ux)
[![downloads](https://img.shields.io/npm/dm/aurora-ux?color=a855f7)](https://www.npmjs.com/package/aurora-ux)
[![bundle](https://img.shields.io/bundlephobia/minzip/aurora-ux?color=a855f7&label=minzip)](https://bundlephobia.com/package/aurora-ux)
[![types](https://img.shields.io/npm/types/aurora-ux?color=22d3ee)](https://www.typescriptlang.org/)
[![license](https://img.shields.io/npm/l/aurora-ux?color=22d3ee)](./LICENSE)
[![stars](https://img.shields.io/github/stars/yuxianshengS/aurora-ux?color=22d3ee&style=flat)](https://github.com/yuxianshengS/aurora-ux)
[![docs](https://img.shields.io/badge/docs-online-22d3ee)](https://yuxianshengs.github.io/aurora-ux/)

[🌐 在线预览](https://yuxianshengs.github.io/aurora-ux/) · [📦 npm](https://www.npmjs.com/package/aurora-ux) · [🧩 拖拽搭建器](https://yuxianshengs.github.io/aurora-ux/#/builder)

</div>

---

## 这是什么

**Aurora UI** 是一套追求"极光感视觉 + 看板专精"的 React 组件库。和 antd/element 不一样的地方:

- 🌌 **极光招牌** — `AuroraBg` / `GradientText` / `GlowCard` / `NumberRoll` 等独家组件, 默认就有 dribbble 级质感
- 📊 **中后台优先** — `KpiCard` / `Sparkline` / `Heatmap` / `Gauge` / `Funnel` 等看板组件全套, 不是又一个 antd 克隆
- 🧩 **拖拽搭建器** — 60+ 组件全部可拖, 整段 Section 模板一键展开, 导出 JSX 直接 commit
- ⚡ **零额外依赖** — 没有 ThemeProvider, 没有 SDK, 一行 import 就用; CSS 变量驱动主题, 改一个变量改全套

## 快速开始

```bash
pnpm add aurora-ux
# 或: npm install aurora-ux / yarn add aurora-ux
```

```tsx
// main.tsx
import 'aurora-ux/style.css';
```

**Icon 组件需要 iconfont CSS** (基于阿里 iconfont, 自托管或 fork 都行). 在 `index.html` head 加一行:

```html
<link rel="stylesheet" href="https://at.alicdn.com/t/c/font_4644876_wf3phmr7dpl.css">
```

不用 Icon 组件可跳过. 想换自己的图标库, 改 CSS class 前缀即可.

```tsx
// App.tsx
import { AuroraBg, GradientText, NumberRoll, KpiCard } from 'aurora-ux';

export default function App() {
  return (
    <AuroraBg preset="aurora" style={{ minHeight: 320 }}>
      <GradientText size={56} weight={800}>本月销售额</GradientText>
      <NumberRoll value={1284560} prefix="¥" size={64} />
      <KpiCard
        title="新增用户"
        value="8,624"
        delta={{ value: 5.2, suffix: '%' }}
        trend={{ data: [3, 5, 4, 6, 8, 9, 11, 13], type: 'area' }}
      />
    </AuroraBg>
  );
}
```

完整指南: [快速开始](https://yuxianshengs.github.io/aurora-ux/#/docs/getting-started) · [设计理念](https://yuxianshengs.github.io/aurora-ux/#/docs/design)

## 组件总览

> 60+ 组件, 覆盖中后台所有常见场景。完整 API + 在线预览见[文档站](https://yuxianshengs.github.io/aurora-ux/)。

### ✨ 极光特效 (独家)
**AuroraBg** · **GradientText** · **NumberRoll** · **GlowCard** · **PulseDot** · **TickerTape** · **ScrambleText**

### 🧬 图与拓扑 (独家)
**Connector / ConnectorGroup** — 给两个 (或多个) DOM 之间画连线, 自动跟随尺寸 / 滚动 / 拖动:
- 1-1 / 1-many / many-many (mesh / pairs)
- 4 种线形 (curve / step / orthogonal / straight)
- 极光渐变 stroke + 流动虚线 + 沿线移动小圆点
- 单/双向箭头 + 中点 ReactNode label
- `autoAvoid` 自动绕开节点 (单障碍 MVP)
- 5 种实战场景: [网络拓扑](https://yuxianshengs.github.io/aurora-ux/#/docs/connector) · [流程图](https://yuxianshengs.github.io/aurora-ux/#/docs/flowchart) · [依赖关系](https://yuxianshengs.github.io/aurora-ux/#/docs/dependency-graph) · [数据血缘](https://yuxianshengs.github.io/aurora-ux/#/docs/data-lineage) · [思维导图](https://yuxianshengs.github.io/aurora-ux/#/docs/mindmap)

### 📋 表单
**Form / FormItem / useForm** (含 required/type/min/max/pattern/whitespace/validator 完整校验)
**Input** · **InputNumber** · **Select** · **Radio** · **Checkbox** · **Switch** · **Slider** · **DatePicker** · **Upload** · **TreeSelect**

### 📊 数据展示 / 可视化
**Table** (含行/列拖拽) · **Tree** · **Tabs** · **Pagination** · **Description** · **Statistic** · **Progress** · **KpiCard** · **Sparkline** · **Heatmap** · **Funnel** · **Gauge** · **DayTimeline** · **Timeline** · **ActivityFeed** · **Wallet**

### 🧱 布局
**Layout** · **Grid** · **Row** · **Flex** · **Space** · **Divider** · **Split** · **Card**

### 💡 反馈
**Modal** · **Drawer** · **Message** · **Notification** · **Popconfirm** · **Alert** · **Spin** · **Skeleton** · **Tooltip** · **FullscreenProgress** · **TopProgress** · **Result**

### 🧭 导航
**Menu** · **Breadcrumb** · **Steps** · **Dropdown**

### 🎨 通用
**Button** · **Icon** · **Text** · **Tag** · **Badge** · **Avatar** · **Empty** · **Switch** · **ThemeSwitch** · **Typewriter** · **Flip** · **Draggable** · **PdfDownload**

## 拖拽搭建器

试一下: [https://yuxianshengs.github.io/aurora-ux/#/builder](https://yuxianshengs.github.io/aurora-ux/#/builder)

- 60+ 组件全部可拖, 实时预览, 属性面板可视化改 props
- **Section 整段模板** — Hero / Pricing / Features / Stats / CTA / KPI 一拖即用
- 导出可直接 commit 的 JSX 代码; 大数据 (table cols / menu items) 自动 hoist 成 `useState`
- 容器嵌套 (Layout / Flex / Grid / Split / Form), 拖到 slot 直接生效

## 主题定制

所有视觉变量都是 CSS variable, 全局或局部覆盖即可:

```css
:root {
  --au-primary: #7c3aed;
  --au-radius: 14px;
  --au-bg: #fafafa;
}
```

暗色模式: `<ThemeSwitch />` 一行搞定。

## 更新图标库

Icon 基于阿里 [iconfont](https://www.iconfont.cn/) 项目 `4644876`。新增图标:

```bash
pnpm sync:icon "https://at.alicdn.com/t/c/font_4644876_新哈希.css"
```

脚本会自动更新 `index.html` + `src/data/iconfontNames.ts`。

## 适合谁用

- 想做中后台 / 数据看板的独立开发者和小团队
- 偏爱**极光感**视觉, 想让看板看起来不那么 "Bootstrap"
- 想用**拖拽搭建**减少重复 JSX, 但又不想被低代码 SaaS 锁定
- 喜欢 TypeScript 全套类型 + CSS variable 主题的工程派

## License

MIT © [yuxianshengS](https://github.com/yuxianshengS)
