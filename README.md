<div align="center">

# AuroraUI

轻盈如极光的 React 组件库 & 官网文档站

[![Deploy](https://github.com/yuxianshengS/aurora-ui/actions/workflows/deploy.yml/badge.svg)](https://github.com/yuxianshengS/aurora-ui/actions/workflows/deploy.yml)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)

**[🌐 在线预览](https://yuxianshengs.github.io/aurora-ui/)**

</div>

---

## ✨ 特色

- 🎨 **极光主题** — 渐变色系 + 柔和毛玻璃质感，告别千篇一律的方块按钮
- 🌓 **暗色模式** — 内置 `ThemeSwitch` 一键切换，CSS 变量驱动
- 📦 **零样式污染** — 每个组件独立 CSS，不依赖 CSS-in-JS 运行时
- 📊 **开箱可视化** — 基于 ECharts + ECharts-GL 的 3D 图表组件
- 🧩 **完整 TS 类型** — 所有 props 都有导出的类型定义
- ⚡️ **Vite 驱动** — 冷启动毫秒级，HMR 飞快

## 📦 组件一览

| 分类 | 组件 |
|------|------|
| 通用 | `Button` |
| 数据录入 | `Input` · `TextArea` · `Switch` · `ThemeSwitch` · `DatePicker` |
| 数据展示 | `Card` · `Wallet` · `Timeline` |
| 反馈 | `Tooltip` |
| 可视化 | `Bar3D` |

## 🚀 快速开始

```bash
pnpm install        # 或 npm install
pnpm dev            # 启动开发服务器
pnpm build          # 构建生产版本
pnpm preview        # 本地预览构建产物
```

默认运行在 http://localhost:5173

## 📂 项目结构

```
aurora-ui/
├── .github/workflows/    # GitHub Actions（自动部署到 Pages）
├── public/               # 静态资源
├── src/
│   ├── components/       # 组件库本体 (Button / Input / Card / ...)
│   ├── site-components/  # 官网专用 (Navbar / Sidebar / DemoBlock / Playground)
│   ├── layouts/          # 文档页布局
│   ├── pages/            # 各文档页 (Home / ButtonDoc / ...)
│   ├── hooks/            # 自定义 hooks (useTheme)
│   ├── data/nav.ts       # 左侧导航数据
│   └── styles/           # 全局样式 & CSS 变量
├── index.html
├── vite.config.ts
└── package.json
```

## 🧩 新增组件的 5 步流程

1. 在 `src/components/` 下新建 `YourComp/` 目录，包含：
   - `YourComp.tsx` — 组件实现
   - `YourComp.css` — 样式
   - `index.ts` — 导出
2. 在 `src/components/index.ts` 中统一导出组件与类型
3. 在 `src/pages/` 下新建 `YourCompDoc.tsx` 文档页（参考已有文档页的结构：Demo + API 表格）
4. 在 `src/App.tsx` 中注册路由
5. 在 `src/data/nav.ts` 中加入侧边栏导航项

## 🛠 技术栈

- **React 18** + **TypeScript 5**
- **Vite 5** — 构建工具
- **React Router 6** — 文档页路由
- **ECharts 5 + ECharts-GL** — 3D 可视化
- **原生 CSS** — 基于 CSS 变量的主题系统，无运行时开销

## 🌐 部署

推送到 `main` 分支会触发 GitHub Actions 自动构建并部署到 GitHub Pages。

- 线上地址：https://yuxianshengs.github.io/aurora-ui/
- Workflow 配置：`.github/workflows/deploy.yml`

> ⚠️ 如果 fork 本仓库，记得修改 `vite.config.ts` 里的 `base` 字段为你自己的仓库名。

## 📄 License

MIT
