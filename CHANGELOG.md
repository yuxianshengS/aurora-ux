# Changelog

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

## [Unreleased]

待发布的改动会列在这里。

## [0.6.0] — 2026-04-27 — Diagram Edition

### 新增 — Connector 升格为主题能力
- 首页新加 **"用 Connector 画任何关系图"** 专栏: 迷你 API Gateway 拓扑实时演示 + 5 用例缩略卡 (网络拓扑/流程图/依赖关系/数据血缘/思维导图) + CTA
- 导航栏拆出**"图与拓扑"**类目, Connector 从极光特效组移出
- 4 个新文档页, 每页一个完整真实场景:
  - `/docs/flowchart` 订单审批流 (条件分支 + 驳回回流 + orthogonal U 型)
  - `/docs/dependency-graph` 电商微服务调用图 (3 层架构 + RPC + MQ async + 缓存)
  - `/docs/data-lineage` 数据血缘 (源头 → CDC → 湖 → ETL → 仓库 → BI/AI/风控)
  - `/docs/mindmap` 产品规划思维导图 (中心放射 + 4 主分支 + 12 leaves)

### 改进
- 网络拓扑图默认 type 从 curve 改为 step (网络图标准画法), 节点间距和舞台尺寸大幅放大
- HashRouter 替代 BrowserRouter, GH Pages 任意子路由刷新不再 404

### Routing
- BrowserRouter → HashRouter; URL 形式 `/aurora-ux/#/docs/...`

## [0.5.0] — 2026-04-27

### 新增 — Connector 连接线
- **ConnectorGroup + Connector** 双层组件: 共享一个 SVG 渲染所有线, 内部用 React context 注册
- **3 种连接关系**: 1-1 / 一对多 / 多对多 (默认 mesh 笛卡尔积, 可切 pairs 一一配对)
- **4 种线形**: curve (三次贝塞尔) / step (90° 折线) / orthogonal (圆角折线) / straight
- 自动决定 startSide / endSide; 同一节点同一边多线时 **沿边均匀分布**, 不堆中点
- 极光渐变 stroke (linearGradient 跟随线段方向), 流动虚线, 单端/双端/无箭头, 中点 label
- **ResizeObserver + 全局 scroll/resize** 联合监听, RAF 节流, 拖动节点连线实时跟随
- 数据 API (`connections` + `ids`) 与 JSX (`<Connector>`) 两种写法共存
- Portal 到 body 走 fixed 定位 (跨视口) 或贴在指定 container 内 (相对定位)

## [0.4.0] — 2026-04-27

### 新增 — 极光特效 #2 系列
- **PulseDot** 实时脉冲点: 6 套预设 (live/success/warning/danger/info/default), 可静音, 节奏可调
- **TickerTape** 横向跑马灯: 涨跌方向自动配色 + 三角箭头, 鼠标悬停暂停, 双向滚动
- **ScrambleText** 字符乱码重组: 逐字锁定 + 字符集可换, 支持 `trigger` 重播 + `onDone` 回调

### 改进 — 工程
- 路由全部改 `React.lazy` + `Suspense` 懒加载, **首屏 chunk 从 922KB → 17KB gzip (53× 缩减)**
- vendor 拆分: echarts / echarts-gl / jspdf+html2canvas / react / react-dom / react-router 各自独立 chunk
- README 重写覆盖 60+ 组件 + 极光招牌; 新增 CHANGELOG.md

## [0.3.0] — 2026-04-27

### 新增 — 极光特效系列
- **AuroraBg** 极光动态渐变背景: 5 套预设 (aurora / sunset / ocean / forest / cosmic), 4 个色带飘动 + 颗粒纹理 + `fixed` 整页模式
- **GradientText** 渐变流动文字: 6 套预设, 支持 `as` 切换语义元素 (h1/h2/...), 流动动画
- **NumberRoll** 翻牌器式数字滚动: 每位独立滚动 + stagger 延迟, 千分位 / 小数 / 前后缀
- **GlowCard** 鼠标跟随发光卡片: 光晕跟随 + conic-gradient 旋转描边

### 新增 — PageBuilder Section 模板系统
- 整段预设可一键拖入, 落地为透明的 BlockConfig 树, 每个节点都能继续编辑
- 6 个内置模板: Hero / Pricing 3 列 / Feature 3 列 / Stats / CTA / KPI 4 列
- 新增"极光特效"组件分类

### 改进 — 网站
- 首页彻底重做, 用极光招牌组件做 Hero / 招牌墙 / KPI 看板示意 / 6 张特性卡 / 深色 IDE 代码片段
- 指南页 `/docs/getting-started` + `/docs/design` 重做, 4 步走 + 5 大原则 + 5 套色板 + 间距尺度可视化 + 缓动曲线演示
- 样板看板 `/examples/dashboard` 加 Aurora Hero banner + 实时跳动 GMV/订单/转化 + GlowCard 健康度卡 + iconfont 替换全部 emoji

## [0.2.0] — 2026-04-23

### 新增
- **Form / FormItem / useForm** 完整重写, 提供真实的校验能力:
  - `Rule[]`: required / type / min / max / len / pattern / whitespace / validator (含 Promise) / validateTrigger
  - `FormInstance`: getFieldValue / setFieldsValue / validateFields / resetFields / submit
  - `onFinish` / `onFinishFailed` / `onValuesChange` 事件
- 新增 8 个常用组件: **Skeleton** · **Statistic** · **Progress** · **Description** · **Result** · **Upload** · **Tree** · **TreeSelect**

### 变更
- **PageShell → Layout** 重命名 (`au-shell` → `au-layout`, `LayoutMode` 类型导出)
- PageBuilder Form 块从硬编码示例改为真实容器, FormItem.* schemas 暴露 `_rules` JSON 字段

## [0.1.1] — 2026-04-21

首个公开发布版本。

### 包含的组件
通用 (Button / Icon / Text), 表单 (Input / InputNumber / Select / Radio / Checkbox / Switch / Slider / DatePicker), 数据展示 (Card / Wallet / Timeline / DayTimeline / Tag / Badge / Avatar / Empty / Pagination / Tabs / Table), 反馈 (Modal / Drawer / Message / Notification / Popconfirm / Alert / Spin / Tooltip / FullscreenProgress / TopProgress), 导航 (Menu / Breadcrumb / Steps / Dropdown), 可视化 (KpiCard / Sparkline / Gauge / Funnel / Heatmap / ActivityFeed / Bar3D), 布局 (Row / Grid / Flex / Space / Divider / Split / PageShell), 动效 (Typewriter / Flip / Draggable / PdfDownload).

### 工具
- **PageBuilder** 拖拽搭建器, 支持 Hoister 大数据提升 / Copy JSX / 容器嵌套
- **ThemeSwitch** 暗亮主题切换
- 在线预览站 + iconfont 同步脚本

[Unreleased]: https://github.com/yuxianshengS/aurora-ux/compare/v0.6.0...HEAD
[0.6.0]: https://github.com/yuxianshengS/aurora-ux/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/yuxianshengS/aurora-ux/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/yuxianshengS/aurora-ux/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/yuxianshengS/aurora-ux/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/yuxianshengS/aurora-ux/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/yuxianshengS/aurora-ux/releases/tag/v0.1.1
