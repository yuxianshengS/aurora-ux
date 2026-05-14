import React, { useEffect, useRef, useState } from 'react';
import { Tour, Button, Input, Switch, Card, Tag, message, Space } from '../components';
import type { TourStep } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const TourDoc: React.FC = () => {
  return (
    <>
      <h1>Tour 引导</h1>
      <p>
        新手引导 / 功能巡览 / 升级解读组件。把页面上的关键 DOM 串成一条 steps 轨迹, 高亮 +
        气泡卡片配合 上一步 / 下一步 / 跳过 引导用户走完一遍。 portal 渲染、自动避开视口边界、键盘
        ←/→/Esc、focus trap 内置, 默认尊重
        <code>prefers-reduced-motion</code>。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description={`传 ref / target + 步骤数组, open=true 时展示。 ←/→ 键切换, Esc 跳过。`}
        code={`const btnRef = useRef(null);
const inputRef = useRef(null);
const [open, setOpen] = useState(false);

<Button ref={btnRef} onClick={() => setOpen(true)}>启动引导</Button>
<Input ref={inputRef} placeholder="一个被引导的输入框" />

<Tour
  open={open}
  onClose={() => setOpen(false)}
  onFinish={() => message.success('引导完成')}
  steps={[
    {
      target: () => btnRef.current,
      title: '从这里开始',
      description: '点击这个按钮可以重新打开引导。',
      placement: 'bottom',
    },
    {
      target: () => inputRef.current,
      title: '在这里输入关键词',
      description: '尝试输入任意内容,系统会自动联想。',
      placement: 'right',
    },
    {
      title: '完成 🎉',
      description: '欢迎部分到此结束, 现在你可以自由探索。',
      placement: 'center',
    },
  ]}
/>`}
      >
        <BasicDemo />
      </DemoBlock>

      <DemoBlock
        title="primary 主题"
        description="type='primary' 让卡片用主色填充, 适合做产品营销引导。"
        code={`<Tour
  type="primary"
  open={open}
  onClose={() => setOpen(false)}
  steps={[
    { target: () => ref1.current, title: '欢迎', description: '快速上手 Aurora UI' },
    { target: () => ref2.current, title: '核心组件', description: '60+ 个开箱即用的组件' },
  ]}
/>`}
      >
        <PrimaryDemo />
      </DemoBlock>

      <DemoBlock
        title="带封面"
        description={`step.cover 可以放图片 / 视频 / 任何 ReactNode, 做"功能介绍"型引导。`}
        code={`steps={[
  {
    cover: <img src="/feature.png" />,
    title: '看板搭建器全新上线',
    description: '拖拽 60+ 组件, 一键导出 JSX。',
    placement: 'center',
  },
]}`}
      >
        <CoverDemo />
      </DemoBlock>

      <DemoBlock
        title="不可关闭 / 单步隐藏遮罩"
        description="step.mask=false 让某一步不挡住目标(用户可以同时操作目标元素)。"
        code={`<Tour
  steps={[
    {
      target: () => ref.current,
      title: '可点击的目标',
      description: '此步不挡住目标, 你可以直接操作它',
      mask: false,
    },
  ]}
/>`}
      >
        <MaskDemo />
      </DemoBlock>

      <h2>高级用法</h2>

      <DemoBlock
        title="首次访问自动启动 (localStorage 标记)"
        description={`产品上线 / 大版本升级时常见需求 — 用户第一次进来自动启动一次, 看完之后写 localStorage 标记, 之后不再自动弹出。点 "重置标记" 模拟"换浏览器/清缓存"再次触发。`}
        code={`const KEY = 'au-tour-onboarding-seen';

useEffect(() => {
  // 第一次进来 (没标记) 才自动启动
  if (!localStorage.getItem(KEY)) {
    setOpen(true);
  }
}, []);

<Tour
  open={open}
  onClose={() => setOpen(false)}
  onFinish={() => localStorage.setItem(KEY, '1')}
  steps={steps}
/>`}
      >
        <FirstVisitDemo />
      </DemoBlock>

      <DemoBlock
        title="受控 + 程序化 goTo / 跳转分支"
        description={`通过 current 受控可以做"分支引导": 用户在某步选了不同选项就跳到不同分支。step.actions 完全自定义底部按钮区, 拿到 next/prev/goTo 句柄。`}
        code={`const [current, setCurrent] = useState(0);

steps={[
  {
    title: '想看哪条引导?',
    actions: ({ goTo, close }) => (
      <Space>
        <Button onClick={() => goTo(1)}>新手入门</Button>
        <Button onClick={() => goTo(3)}>进阶能力</Button>
        <Button onClick={close}>跳过</Button>
      </Space>
    ),
  },
  { target: () => beginnerRef1.current, title: '新手 - 1', description: '...' },
  { target: () => beginnerRef2.current, title: '新手 - 2', description: '...' },
  { target: () => advancedRef1.current, title: '进阶 - 1', description: '...' },
  { target: () => advancedRef2.current, title: '进阶 - 2', description: '...' },
]}

<Tour open={open} current={current} onChange={setCurrent} steps={steps} />`}
      >
        <BranchDemo />
      </DemoBlock>

      <DemoBlock
        title="onNext 拦截 (异步校验 / 阻止前进)"
        description={`step.onNext 返回 Promise<false> 可以阻止前进。常见场景: 让用户必须点了某个按钮 / 完成某个动作才能继续。`}
        code={`steps={[
  {
    title: '请先订阅',
    description: '点订阅后才能进入下一步。',
    onNext: () => {
      if (!subscribed) {
        message.warning('请先点订阅再继续');
        return false;  // 阻止前进
      }
    },
  },
]}`}
      >
        <GuardDemo />
      </DemoBlock>

      <DemoBlock
        title="不可跳过 (强制走完)"
        description={`closable={false} 关掉右上 ✕ + Esc, 用户必须点"完成"才能离开 — 适合合规/培训场景。单步也能用 step.closable 覆盖。`}
        code={`<Tour closable={false} steps={steps} />`}
      >
        <ForceDemo />
      </DemoBlock>

      <DemoBlock
        title="选择器 target (无 ref 也能用)"
        description={`target 支持 CSS 选择器字符串, 适合外部 DOM (路由切换后才出现 / 第三方组件) 或不方便拿 ref 的地方。结合 waitFor 模式可用于异步出现的元素。`}
        code={`steps={[
  { target: '#au-navbar-logo', title: '欢迎', placement: 'bottom' },
  { target: 'a[href="/docs"]', title: '文档入口' },
]}`}
      >
        <SelectorDemo />
      </DemoBlock>

      <h2>API</h2>

      <h3>Tour</h3>
      <ApiTable
        rows={[
          { prop: 'open', desc: '是否显示', type: 'boolean', default: 'false' },
          { prop: 'steps', desc: '步骤数组', type: 'TourStep[]', default: '-' },
          { prop: 'current', desc: '受控当前步索引', type: 'number', default: '-' },
          { prop: 'defaultCurrent', desc: '非受控初始步', type: 'number', default: '0' },
          {
            prop: 'mask',
            desc: '全局遮罩 (单步可用 step.mask 覆盖)',
            type: 'boolean',
            default: 'true',
          },
          { prop: 'arrow', desc: '全局箭头', type: 'boolean', default: 'true' },
          { prop: 'type', desc: '主题', type: `'default' | 'primary'`, default: `'primary'` },
          { prop: 'onChange', desc: '步切换', type: '(current) => void', default: '-' },
          {
            prop: 'onClose',
            desc: '关闭/跳过 (传当前 step 索引)',
            type: '(current) => void',
            default: '-',
          },
          {
            prop: 'onFinish',
            desc: '走完最后一步触发(同时也会 onClose)',
            type: '() => void',
            default: '-',
          },
          {
            prop: 'scrollIntoViewOptions',
            desc: '目标进入视口的滚动策略; false 关闭',
            type: 'boolean | ScrollIntoViewOptions',
            default: `{ block: 'center', behavior: 'smooth' }`,
          },
          { prop: 'closeButtonText', desc: '关闭按钮文案', type: 'ReactNode', default: `'跳过'` },
          { prop: 'finishButtonText', desc: '完成按钮文案', type: 'ReactNode', default: `'完成'` },
          {
            prop: 'prevButtonText',
            desc: '上一步默认文案',
            type: 'ReactNode',
            default: `'上一步'`,
          },
          {
            prop: 'nextButtonText',
            desc: '下一步默认文案',
            type: 'ReactNode',
            default: `'下一步'`,
          },
          {
            prop: 'zIndex',
            desc: '自定义 zIndex (默认走 token --au-z-modal)',
            type: 'number',
            default: '-',
          },
          {
            prop: 'closable',
            desc: '是否显示关闭按钮 + Esc 关闭',
            type: 'boolean',
            default: 'true',
          },
          { prop: 'gap', desc: '卡片与目标的间距 (px)', type: 'number', default: '12' },
        ]}
      />

      <h3>TourStep</h3>
      <ApiTable
        rows={[
          {
            prop: 'target',
            desc: '目标 (DOM 节点 / CSS 选择器字符串 / 返回节点的函数; 不传 = 居中)',
            type: 'HTMLElement | string | () => HTMLElement | null',
            default: '-',
          },
          { prop: 'title', desc: '标题', type: 'ReactNode', default: '-' },
          { prop: 'description', desc: '描述', type: 'ReactNode', default: '-' },
          { prop: 'cover', desc: '顶部封面 (图/视频/节点)', type: 'ReactNode', default: '-' },
          {
            prop: 'placement',
            desc: '气泡方位; 没 target 时建议 center',
            type: `'top'|'topLeft'|'topRight'|'bottom'|'bottomLeft'|'bottomRight'|'left'|'right'|'center'`,
            default: `'bottom'`,
          },
          { prop: 'mask', desc: '该步是否遮罩 (覆盖 Tour 全局)', type: 'boolean', default: '继承' },
          { prop: 'arrow', desc: '该步是否箭头', type: 'boolean', default: '继承' },
          {
            prop: 'spotlightPadding',
            desc: '高亮目标的额外内边距 (px)',
            type: 'number',
            default: '6',
          },
          {
            prop: 'nextButtonText / prevButtonText',
            desc: '该步专属按钮文案',
            type: 'ReactNode',
            default: '-',
          },
          { prop: 'closable', desc: '该步是否可关闭', type: 'boolean', default: '继承' },
          {
            prop: 'actions',
            desc: '完全自定义底部按钮区',
            type: '(ctx) => ReactNode',
            default: '-',
          },
          {
            prop: 'onNext',
            desc: '点下一步前拦截,返回 false / Promise<false> 阻止前进',
            type: '() => boolean | Promise<boolean | void>',
            default: '-',
          },
          { prop: 'onEnter / onLeave', desc: '步生命周期回调', type: '() => void', default: '-' },
        ]}
      />
    </>
  );
};

const BasicDemo: React.FC = () => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  const steps: TourStep[] = [
    {
      target: () => btnRef.current,
      title: '从这里开始',
      description: '点击这个按钮可以随时重新打开引导。',
      placement: 'bottom',
    },
    {
      target: () => inputRef.current,
      title: '在这里输入关键词',
      description: '尝试输入任意内容,系统会自动联想匹配项。',
      placement: 'right',
    },
    {
      title: '完成 🎉',
      description: '欢迎部分到此结束, 现在可以自由探索其他能力。',
      placement: 'center',
    },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <Button ref={btnRef} type="primary" onClick={() => setOpen(true)}>
        启动引导
      </Button>
      <Input ref={inputRef} placeholder="一个被引导的输入框" style={{ width: 240 }} />
      <Tour open={open} onClose={() => setOpen(false)} steps={steps} />
    </div>
  );
};

const PrimaryDemo: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const switchRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <Card ref={cardRef} title="本月销售额" hoverable style={{ width: 240 }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>¥ 1,284,560</div>
          <Tag color="success">+12.4%</Tag>
        </Card>
        <Switch ref={switchRef} defaultChecked />
        <Button onClick={() => setOpen(true)}>开始巡览</Button>
      </div>
      <Tour
        type="primary"
        open={open}
        onClose={() => setOpen(false)}
        steps={[
          {
            target: () => cardRef.current,
            title: '看板核心指标',
            description: '本月业绩一目了然,环比 / 同比自动算。',
            placement: 'right',
          },
          {
            target: () => switchRef.current,
            title: '一键切换主题',
            description: '深色 / 浅色色板, 全局变量驱动,点一下就变。',
            placement: 'top',
          },
        ]}
      />
    </>
  );
};

const CoverDemo: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>查看新功能介绍</Button>
      <Tour
        open={open}
        onClose={() => setOpen(false)}
        steps={[
          {
            cover: (
              <div
                style={{
                  height: 140,
                  background: 'linear-gradient(135deg, #6366f1, #ec4899 60%, #f59e0b)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 30,
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                }}
              >
                ✨ NEW
              </div>
            ),
            title: '看板搭建器全新上线',
            description: '拖拽 60+ 组件, 一键导出 JSX, 不写代码也能产出可上线的 dashboard。',
            placement: 'center',
            nextButtonText: '了解更多 →',
          },
          {
            title: '试试这些招牌组件',
            description:
              'AuroraBg / GlowCard / GradientText / Connector — 别人没有的, 才是 Aurora 的招牌。',
            placement: 'center',
          },
        ]}
      />
    </>
  );
};

const MaskDemo: React.FC = () => {
  const targetRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  return (
    <>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Button ref={targetRef} onClick={() => setCount((c) => c + 1)}>
          点我 (已点 {count} 次)
        </Button>
        <Button onClick={() => setOpen(true)}>开始引导</Button>
      </div>
      <Tour
        open={open}
        onClose={() => setOpen(false)}
        steps={[
          {
            target: () => targetRef.current,
            title: '试试点击这个按钮',
            description: '此步关闭了遮罩,你可以同时点目标按钮 — 计数会真的增加。',
            placement: 'right',
            mask: false,
          },
        ]}
      />
    </>
  );
};

/* ===== 高级用法 demo ===== */

const FIRST_VISIT_KEY = 'au-tour-onboarding-seen';

const FirstVisitDemo: React.FC = () => {
  const card1 = useRef<HTMLDivElement>(null);
  const card2 = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<boolean>(
    () => typeof window !== 'undefined' && !!window.localStorage.getItem(FIRST_VISIT_KEY),
  );
  // 进入页面时若没看过 → 自动开
  useEffect(() => {
    if (!seen) setOpen(true);
  }, [seen]);

  const finish = () => {
    window.localStorage.setItem(FIRST_VISIT_KEY, '1');
    setSeen(true);
    setOpen(false);
  };

  return (
    <>
      <Space style={{ marginBottom: 12 }}>
        <Tag color={seen ? 'success' : 'warning'}>localStorage: {seen ? '已看过' : '未看过'}</Tag>
        <Button
          size="small"
          onClick={() => {
            window.localStorage.removeItem(FIRST_VISIT_KEY);
            setSeen(false);
            message.info('已重置标记, 刷新页面将再次自动启动');
          }}
        >
          重置标记
        </Button>
        <Button size="small" type="primary" onClick={() => setOpen(true)}>
          手动启动
        </Button>
      </Space>
      <div style={{ display: 'flex', gap: 16 }}>
        <Card ref={card1} title="销售看板" hoverable style={{ width: 200 }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>¥ 1.28M</div>
        </Card>
        <Card ref={card2} title="活跃用户" hoverable style={{ width: 200 }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>8,624</div>
        </Card>
      </div>
      <Tour
        open={open}
        onClose={() => setOpen(false)}
        onFinish={finish}
        steps={[
          {
            title: '欢迎来到 Aurora 看板',
            description: '第一次访问会自动启动这个引导, 看完之后写入 localStorage 不再弹出。',
            placement: 'center',
          },
          {
            target: () => card1.current,
            title: '核心 KPI',
            description: '本月销售额、环比、同比一目了然。',
            placement: 'right',
          },
          {
            target: () => card2.current,
            title: '用户增长',
            description: '日活 / 周活 / 月活, 同时显示趋势线。',
            placement: 'left',
          },
        ]}
      />
    </>
  );
};

const BranchDemo: React.FC = () => {
  const card = useRef<HTMLDivElement>(null);
  const code = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  const steps: TourStep[] = [
    {
      title: '想看哪条路径?',
      description: '根据你的角色选择不同分支:',
      placement: 'center',
      actions: ({ goTo, close }) => (
        <Space>
          <button className="au-tour__btn au-tour__btn--ghost" onClick={close}>
            跳过
          </button>
          <button className="au-tour__btn au-tour__btn--primary" onClick={() => goTo(1)}>
            产品经理 →
          </button>
          <button className="au-tour__btn au-tour__btn--primary" onClick={() => goTo(3)}>
            开发者 →
          </button>
        </Space>
      ),
    },
    // PM 分支 (1, 2)
    {
      target: () => card.current,
      title: '可视化拖拽搭建',
      description: '60+ 组件拖一拖, 1 分钟出 dashboard, 不写代码。',
      placement: 'right',
    },
    {
      title: '一键导出 JSX',
      description: '搭好的页面可以直接导出 JSX 让工程师 commit, 而不是一份截图扔过去。',
      placement: 'center',
      nextButtonText: '完成',
      onNext: () => {
        message.success('PM 分支完成');
      },
    },
    // 开发者分支 (3, 4)
    {
      target: () => code.current,
      title: 'TypeScript 完整类型',
      description: 'IDE 里 hover 任意 prop 直接知道签名, 0 文档查询时间。',
      placement: 'top',
    },
    {
      title: '0 运行时依赖',
      description: 'peer 只有 react / react-dom, 不会挤占你项目的版本空间。',
      placement: 'center',
      nextButtonText: '完成',
      onNext: () => {
        message.success('开发者分支完成');
      },
    },
  ];

  return (
    <>
      <Space>
        <Card ref={card} title="销售看板" hoverable style={{ width: 200 }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>¥ 1.28M</div>
        </Card>
        <div
          ref={code}
          style={{
            padding: '14px 16px',
            background: 'var(--au-pre-bg)',
            color: 'var(--au-pre-text)',
            borderRadius: 8,
            fontFamily: 'var(--au-mono)',
            fontSize: 13,
          }}
        >
          import {'{'} Button {'}'} from 'aurora-ux';
        </div>
        <Button
          onClick={() => {
            setCurrent(0);
            setOpen(true);
          }}
        >
          开始引导
        </Button>
      </Space>
      <Tour
        open={open}
        current={current}
        onChange={setCurrent}
        onClose={() => setOpen(false)}
        steps={steps}
      />
    </>
  );
};

const GuardDemo: React.FC = () => {
  const subBtn = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  return (
    <>
      <Space>
        <Button
          ref={subBtn}
          type={subscribed ? 'default' : 'primary'}
          onClick={() => {
            setSubscribed(true);
            message.success('订阅成功');
          }}
        >
          {subscribed ? '✓ 已订阅' : '点我订阅'}
        </Button>
        <Button
          onClick={() => {
            setSubscribed(false);
            setOpen(true);
          }}
        >
          开始引导
        </Button>
      </Space>
      <Tour
        open={open}
        onClose={() => setOpen(false)}
        steps={[
          {
            target: () => subBtn.current,
            title: '请先订阅',
            description: '本步需要你点订阅按钮, 然后再点"下一步" — 否则不让前进。',
            placement: 'right',
            mask: false, // 让用户能点目标
            onNext: () => {
              if (!subscribed) {
                message.warning('请先点订阅再继续');
                return false;
              }
            },
          },
          {
            title: '感谢订阅 🙌',
            description: '完成订阅后才能看到这一步, 异步校验也是同样套路。',
            placement: 'center',
          },
        ]}
      />
    </>
  );
};

const ForceDemo: React.FC = () => {
  const card = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <Space>
        <Card ref={card} title="合规公告" hoverable style={{ width: 240 }}>
          <div style={{ color: 'var(--au-text-2)' }}>重要:本月起请使用新版报表入口。</div>
        </Card>
        <Button type="primary" onClick={() => setOpen(true)}>
          查看变更说明
        </Button>
      </Space>
      <Tour
        open={open}
        onClose={() => setOpen(false)}
        closable={false} // 关掉 ✕ + Esc, 强制走完
        steps={[
          {
            target: () => card.current,
            title: '合规要求',
            description: '本指引须看完才能继续, 不可关闭。',
            placement: 'right',
          },
          {
            title: '点击"完成"知悉',
            description: '点了完成才视为已读。',
            placement: 'center',
          },
        ]}
        finishButtonText="我已知悉"
      />
    </>
  );
};

const SelectorDemo: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <p style={{ marginBottom: 12, color: 'var(--au-text-3)', fontSize: 13 }}>
        这个 demo 直接用 CSS 选择器锁定页面顶部 Navbar 的 logo 和文档链接 — 不用 ref 也能引导外部
        DOM。
      </p>
      <Button type="primary" onClick={() => setOpen(true)}>
        开始页面级引导
      </Button>
      <Tour
        open={open}
        onClose={() => setOpen(false)}
        steps={[
          {
            target: '.au-navbar__brand',
            title: 'Aurora UX',
            description: '点 logo 任何时候都能回首页。',
            placement: 'bottom',
          },
          {
            target: 'a[href*="/docs/getting-started"]',
            title: '快速开始',
            description: '5 分钟跑起来一个看板。',
            placement: 'bottom',
          },
          {
            title: '完成 🎉',
            description: '页面级 DOM 都能用 CSS 选择器引导, 第三方组件也搞定。',
            placement: 'center',
          },
        ]}
      />
    </>
  );
};

export default TourDoc;
