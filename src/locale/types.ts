/**
 * 国际化文案 — 各组件的可翻译字符串集中在此。
 * 任何组件被 ConfigProvider 包裹后会自动读这里的对应 key;
 * 不被包裹时走默认 zhCN(避免老用户升级时炸)。
 *
 * 约定: 组件 prop 显式传入的文案优先于 locale (如 <Modal okText="...">),
 * 没传才回落到 locale, 这样既能 i18n 又能精确覆盖单个实例。
 */
export interface Locale {
  /**
   * BCP 47 标识符 — 给 KpiCard / Statistic / NumberRoll 这些数字组件
   * 调 Intl.NumberFormat / toLocaleString 时用. 不是浏览器默认 locale,
   * 而是这里指定的, 让数字格式严格跟 ConfigProvider 一致.
   * 例: 'zh-CN' / 'en-US' / 'de-DE'
   */
  numberFormat: string;
  Pagination: {
    prev: string;
    next: string;
    pageSize: string;
    jump: string;
    page: string;
    of: string;
  };
  Tour: {
    skip: string;
    finish: string;
    prev: string;
    next: string;
    stepAriaLabel: string;
  };
  Modal: {
    ok: string;
    cancel: string;
  };
  Popconfirm: {
    ok: string;
    cancel: string;
  };
  Result: {
    success: string;
    error: string;
    info: string;
    warning: string;
    '404': string;
    '403': string;
    '500': string;
  };
  Empty: {
    description: string;
  };
  Table: {
    sortAsc: string;
    sortDesc: string;
    selectAll: string;
  };
  Upload: {
    selectFile: string;
    uploading: string;
    uploadSuccess: string;
    uploadFail: string;
    remove: string;
    dragText: string;
    dragHint: string;
    pause: string;
    resume: string;
    retry: string;
  };
  Select: {
    placeholder: string;
    notFoundContent: string;
  };
  AutoComplete: {
    notFoundContent: string;
  };
  Cascader: {
    placeholder: string;
    empty: string;
  };
  TreeSelect: {
    placeholder: string;
  };
  Mentions: {
    placeholder: string;
  };
  DatePicker: {
    placeholderDate: string;
    placeholderDateTime: string;
    placeholderYear: string;
    placeholderMonth: string;
    placeholderQuarter: string;
    placeholderWeek: string;
    placeholderTime: string;
    rangeStart: string;
    rangeEnd: string;
    rangeSideStart: string;
    rangeSideEnd: string;
    today: string;
    now: string;
    confirm: string;
    /** 周名 — 7 项, 一(Mon) 到 日(Sun) */
    weekdays: string[];
    /** 月名 — 12 项, 1月 到 12月 */
    months: string[];
    /** 日历导航条 "{n} 年" / "{n}" 模板; {n} 是年份数字 */
    yearLabel: string;
    /** 日历导航条 "{n} 月" / "{n}" 模板; {n} 是月份数字 1-12 */
    monthLabel: string;
  };
  Heatmap: {
    months: string[];
    weekdays: string[];
    legendLow: string;
    legendHigh: string;
  };
  Tree: {
    expand: string;
    collapse: string;
  };
  ThemeSwitch: {
    label: string;
  };
  FloatButton: {
    backTop: string;
  };
  ActivityFeed: {
    empty: string;
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
  };
  JsonView: {
    copy: string;
    copied: string;
    copyAll: string;
    copiedAll: string;
    expand: string;
    collapse: string;
    parseError: string;
  };
  CommandPalette: {
    placeholder: string;
    empty: string;
    hintArrows: string;
    hintEnter: string;
    hintToggle: string;
  };
  PdfDownload: {
    download: string;
    generating: string;
    downloading: string;
    packing: string;
    fitWidth: string;
  };
  Carousel: {
    prev: string;
    next: string;
    /** "第 {n} 张 / 共 {total}" — 给屏幕阅读器播报用 */
    slideOfTotal: string;
    /** "跳到第 {n} 张" — 指示点 aria-label */
    goToSlide: string;
  };
  Common: {
    close: string;
    clear: string;
    expand: string;
    collapse: string;
  };
  /**
   * Form 校验默认错误消息. 模板里 {n} 表示数字、{type} 表示 type 名 (string/email/...)。
   * 单字段 rule.message 显式传值优先; 没传走这里; 走不到这里时才返回硬编码默认 (向后兼容)。
   */
  Form: {
    required: string;
    typeMismatch: string;          // '格式必须是 {type}'
    minString: string;             // '至少 {n} 字'
    maxString: string;             // '最多 {n} 字'
    lenString: string;             // '必须 {n} 字'
    minNumber: string;             // '不小于 {n}'
    maxNumber: string;             // '不大于 {n}'
    minArray: string;              // '至少选 {n} 项'
    maxArray: string;              // '最多选 {n} 项'
    lenArray: string;              // '必须选 {n} 项'
    patternMismatch: string;
    validatorFailed: string;
  };
}
