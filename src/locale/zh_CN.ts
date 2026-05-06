import type { Locale } from './types';

const zhCN: Locale = {
  Pagination: {
    prev: '上一页',
    next: '下一页',
    pageSize: '条/页',
    jump: '跳至',
    page: '页',
    of: '共',
  },
  Tour: {
    skip: '跳过',
    finish: '完成',
    prev: '上一步',
    next: '下一步',
    stepAriaLabel: '引导步骤',
  },
  Modal: {
    ok: '确定',
    cancel: '取消',
  },
  Popconfirm: {
    ok: '确定',
    cancel: '取消',
  },
  Result: {
    success: '操作成功',
    error: '操作失败',
    info: '提示',
    warning: '警告',
    '404': '页面不存在',
    '403': '无权访问',
    '500': '服务器异常',
  },
  Empty: {
    description: '暂无数据',
  },
  Table: {
    sortAsc: '升序',
    sortDesc: '降序',
    selectAll: '全选',
  },
  Upload: {
    selectFile: '选择文件',
    uploading: '上传中',
    uploadSuccess: '上传成功',
    uploadFail: '上传失败',
    remove: '移除',
    dragText: '点击或拖拽文件到此处上传',
    dragHint: '支持单 / 批量上传',
    pause: '暂停',
    resume: '继续',
    retry: '重试',
  },
  Select: {
    placeholder: '请选择',
    notFoundContent: '无匹配项',
  },
  AutoComplete: {
    notFoundContent: '无匹配项',
  },
  Cascader: {
    placeholder: '请选择',
    empty: '无',
  },
  TreeSelect: {
    placeholder: '请选择',
  },
  Mentions: {
    placeholder: '',
  },
  DatePicker: {
    placeholderDate: '选择日期',
    placeholderDateTime: '选择日期时间',
    placeholderYear: '选择年份',
    placeholderMonth: '选择月份',
    placeholderQuarter: '选择季度',
    placeholderWeek: '选择周',
    placeholderTime: '选择时间',
    rangeStart: '开始',
    rangeEnd: '结束',
    rangeSideStart: '开始时间',
    rangeSideEnd: '结束时间',
    today: '今天',
    now: '此刻',
    confirm: '确定',
    weekdays: ['一', '二', '三', '四', '五', '六', '日'],
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    yearLabel: '{n} 年',
    monthLabel: '{n} 月',
  },
  Heatmap: {
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    weekdays: ['一', '三', '五'],
    legendLow: '低',
    legendHigh: '高',
  },
  Tree: {
    expand: '展开',
    collapse: '收起',
  },
  ThemeSwitch: {
    label: '切换主题',
  },
  FloatButton: {
    backTop: '返回顶部',
  },
  ActivityFeed: {
    empty: '暂无动态',
    justNow: '刚刚',
    minutesAgo: '{n} 分钟前',
    hoursAgo: '{n} 小时前',
    daysAgo: '{n} 天前',
  },
  JsonView: {
    copy: '复制',
    copied: '已复制',
    copyAll: '复制全部',
    copiedAll: '已复制全部',
    expand: '展开',
    collapse: '收起',
    parseError: 'JSON 解析失败',
  },
  CommandPalette: {
    placeholder: '搜索命令...',
    empty: '没有匹配的命令',
    hintArrows: '选择',
    hintEnter: '执行',
    hintToggle: '切换',
  },
  PdfDownload: {
    download: '下载 PDF',
    generating: '生成中...',
    downloading: '下载中...',
    packing: '打包中...',
    fitWidth: '适合宽度',
  },
  Common: {
    close: '关闭',
    clear: '清除',
    expand: '展开',
    collapse: '收起',
  },
};

export default zhCN;
