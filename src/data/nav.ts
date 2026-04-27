export interface NavItem {
  title: string;
  path: string;
}
export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    title: '指南',
    items: [
      { title: '快速开始', path: '/docs/getting-started' },
      { title: '设计理念', path: '/docs/design' },
    ],
  },
  {
    title: '通用',
    items: [
      { title: 'Button 按钮', path: '/docs/button' },
      { title: 'Icon 图标', path: '/docs/icon' },
      { title: 'Text 文本', path: '/docs/text' },
    ],
  },
  {
    title: '数据录入',
    items: [
      { title: 'Input 输入框', path: '/docs/input' },
      { title: 'InputNumber 数字输入框', path: '/docs/input-number' },
      { title: 'Select 选择器', path: '/docs/select' },
      { title: 'Radio 单选框', path: '/docs/radio' },
      { title: 'Checkbox 多选框', path: '/docs/checkbox' },
      { title: 'Switch 开关', path: '/docs/switch' },
      { title: 'Slider 滑动输入条', path: '/docs/slider' },
      { title: 'Form 表单', path: '/docs/form' },
      { title: 'ThemeSwitch 主题切换', path: '/docs/theme-switch' },
      { title: 'DatePicker 日期选择器', path: '/docs/date-picker' },
      { title: 'Upload 文件上传', path: '/docs/upload' },
      { title: 'Tree 树形控件', path: '/docs/tree' },
      { title: 'TreeSelect 树形选择', path: '/docs/tree-select' },
    ],
  },
  {
    title: '数据展示',
    items: [
      { title: 'Table 表格', path: '/docs/table' },
      { title: 'Tabs 标签页', path: '/docs/tabs' },
      { title: 'Pagination 分页', path: '/docs/pagination' },
      { title: 'Card 卡片', path: '/docs/card' },
      { title: 'Tag 标签', path: '/docs/tag' },
      { title: 'Badge 徽标', path: '/docs/badge' },
      { title: 'Avatar 头像', path: '/docs/avatar' },
      { title: 'Empty 空状态', path: '/docs/empty' },
      { title: 'Wallet 钱包', path: '/docs/wallet' },
      { title: 'Timeline 时间轴', path: '/docs/timeline' },
      { title: 'DayTimeline 时间刻度', path: '/docs/day-timeline' },
      { title: 'Statistic 数值', path: '/docs/statistic' },
      { title: 'Description 描述列表', path: '/docs/description' },
    ],
  },
  {
    title: '导航',
    items: [
      { title: 'Menu 导航菜单', path: '/docs/menu' },
      { title: 'Dropdown 下拉菜单', path: '/docs/dropdown' },
      { title: 'Breadcrumb 面包屑', path: '/docs/breadcrumb' },
      { title: 'Steps 步骤条', path: '/docs/steps' },
    ],
  },
  {
    title: '反馈',
    items: [
      { title: 'Alert 警告提示', path: '/docs/alert' },
      { title: 'Message 全局提示', path: '/docs/message' },
      { title: 'Notification 通知提醒框', path: '/docs/notification' },
      { title: 'Modal 对话框', path: '/docs/modal' },
      { title: 'Drawer 抽屉', path: '/docs/drawer' },
      { title: 'Popconfirm 气泡确认框', path: '/docs/popconfirm' },
      { title: 'Spin 加载中', path: '/docs/spin' },
      { title: 'Tooltip 文字提示', path: '/docs/tooltip' },
      { title: 'Skeleton 骨架屏', path: '/docs/skeleton' },
      { title: 'Progress 进度条', path: '/docs/progress' },
      { title: 'Result 结果页', path: '/docs/result' },
    ],
  },
  {
    title: '可视化',
    items: [
      { title: 'KpiCard 指标卡片', path: '/docs/kpi-card' },
      { title: 'Sparkline 迷你趋势', path: '/docs/sparkline' },
      { title: 'Gauge 仪表盘', path: '/docs/gauge' },
      { title: 'Funnel 漏斗图', path: '/docs/funnel' },
      { title: 'Heatmap 日历热力', path: '/docs/heatmap' },
      { title: 'ActivityFeed 动态流', path: '/docs/activity-feed' },
      { title: 'Bar3D 3D 柱状图', path: '/docs/bar3d' },
    ],
  },
  {
    title: '极光特效',
    items: [
      { title: 'AuroraBg 极光背景', path: '/docs/aurora-bg' },
      { title: 'GradientText 渐变文字', path: '/docs/gradient-text' },
      { title: 'NumberRoll 数字滚动', path: '/docs/number-roll' },
      { title: 'GlowCard 发光卡片', path: '/docs/glow-card' },
    ],
  },
  {
    title: '布局',
    items: [
      { title: 'Layout 页面布局', path: '/docs/layout' },
      { title: 'Flex 弹性容器', path: '/docs/flex' },
      { title: 'Grid 方格布局', path: '/docs/grid' },
      { title: 'Row 行容器', path: '/docs/row' },
      { title: 'Space 间距', path: '/docs/space' },
      { title: 'Divider 分割线', path: '/docs/divider' },
      { title: 'Split 分割面板', path: '/docs/split' },
    ],
  },
  {
    title: '动效',
    items: [
      { title: 'Typewriter 打字机', path: '/docs/typewriter' },
      { title: 'Flip 翻牌器', path: '/docs/flip' },
    ],
  },
  {
    title: '工具',
    items: [
      { title: 'PdfDownload 页面下载', path: '/docs/pdf-download' },
      { title: 'FullscreenProgress 全屏进度', path: '/docs/fullscreen-progress' },
      { title: 'TopProgress 顶部进度条', path: '/docs/top-progress' },
      { title: 'Draggable 拖拽工具', path: '/docs/draggable' },
    ],
  },
];
