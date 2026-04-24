<div align="center">

# AuroraUI

**轻盈如极光的 React 组件库**

[🌐 在线预览](https://yuxianshengs.github.io/aurora-ui/)

</div>

---

## 关于 AuroraUI

AuroraUI 是一套追求"**视觉质感**"与"**克制留白**"的 React 组件库。
灵感源自极光（Aurora）——渐变的色带、柔和的过渡、轻盈的动势，
希望每一个组件不只是"能用"，而是让界面本身成为一种**氛围**。

我们相信：好的 UI 不需要复杂的装饰，只需要恰到好处的**光**、**色**、**距**。

## 设计理念

- **极光配色** — 以蓝紫渐变为主色，辅以柔和的毛玻璃与微光反射，避免纯色块的平面感
- **呼吸感留白** — 组件内外的间距遵循统一的节奏，拒绝堆砌与拥挤
- **双主题** — 暗色为主，亮色为辅，CSS 变量驱动，一键切换
- **低心智负担** — 属性命名直觉，默认效果即最佳实践，上手即用

## 组件概览

| 分类 | 组件 | 说明 |
|------|------|------|
| 通用 | **Button** | 多层次按钮，支持主次、危险、幽灵等形态 |
| 数据录入 | **Input / TextArea** | 轻量输入框，支持自适应高度 |
|  | **Switch** | 丝滑的开关切换 |
|  | **ThemeSwitch** | 暗亮主题一键切换 |
|  | **DatePicker** | 极简日期选择器，支持年/月/日模式 |
| 数据展示 | **Card** | 基础容器，带渐变描边 |
|  | **Wallet** | 卡包式视觉，错落堆叠展示 |
|  | **Timeline** | 垂直时间轴，支持多色节点 |
| 反馈 | **Tooltip** | 悬浮提示，四向定位 |
| 可视化 | **Bar3D** | 基于 ECharts-GL 的 3D 柱状图 |

## 更新图标库 (Iconfont)

Icon 组件基于阿里 [iconfont](https://www.iconfont.cn/) 项目 `4644876`。新增图标:

1. 在 iconfont 网站把图标加到项目 → 点 **「Font class」→「更新代码」** → 复制 CSS 链接
2. 运行同步脚本(自动改 `index.html` 和 `src/data/iconfontNames.ts`):

```bash
pnpm sync:icon "https://at.alicdn.com/t/c/font_4644876_新哈希.css"
```

刷新页面即可在 `/docs/icon` 看到全部新图标。

## 适合谁用

- 想让作品集/个人站点看起来不那么"Bootstrap"的独立开发者
- 偏爱暗色主题、渐变质感、微光动效的设计师
- 想要组件 + 数据可视化一套搞定的小型 Dashboard 项目

## License

MIT
