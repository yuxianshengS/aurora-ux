import React, { useEffect, useRef, useState } from 'react';
import { FullscreenProgress } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const FullscreenProgressDoc: React.FC = () => {
  return (
    <>
      <h1>FullscreenProgress 全屏进度</h1>
      <p>
        覆盖全屏的进度指示器, 适合长时间操作 (文件上传、数据导入、初始化加载) 时阻塞用户操作。
        支持线性 / 环形两种样式, 百分比 / 不确定进度两种模式。提供声明式组件和命令式 API
        两种用法。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="声明式 · 不确定进度"
        description="不传 percent 即为不确定进度, 显示无限动画。用于不知道总时长的等待。"
        code={`const [open, setOpen] = useState(false);

<FullscreenProgress open={open} title="处理中" description="正在连接服务器…" />
<button onClick={() => setOpen(true)}>打开</button>`}
      >
        <IndeterminateDemo />
      </DemoBlock>

      <DemoBlock
        title="声明式 · 带百分比"
        description="传 percent (0-100) 显示具体进度。常用于已知总量的场景。"
        code={`const [pct, setPct] = useState(0);
const [open, setOpen] = useState(false);

<FullscreenProgress open={open} percent={pct} title="上传中" />`}
      >
        <PercentDemo />
      </DemoBlock>

      <DemoBlock
        title="环形样式"
        description="variant='circular' 切换为环形进度。体积更紧凑, 适合主操作场景。"
        code={`<FullscreenProgress
  open={open}
  percent={pct}
  variant="circular"
  title="导出数据"
/>`}
      >
        <CircularDemo />
      </DemoBlock>

      <DemoBlock
        title="命令式 API"
        description="在事件回调里直接使用, 不用在组件里维护 open 状态。start() 返回 handle, 可链式调用 update / finish / close。"
        code={`const handle = FullscreenProgress.start({
  title: '上传文件', variant: 'circular',
});

for (let i = 0; i <= 100; i += 10) {
  await sleep(200);
  handle.update(i);
}
handle.finish(); // 自动显示 100% 并淡出`}
      >
        <ImperativeDemo />
      </DemoBlock>

      <DemoBlock
        title="动态文案"
        description="通过 handle.setText() 更新标题 / 描述, 反映当前步骤。"
        code={`const h = FullscreenProgress.start({ title: '准备' });
h.setText('步骤 1 / 3', '加载资源');
h.update(33);
h.setText('步骤 2 / 3', '生成报告');
h.update(66);
h.setText('步骤 3 / 3', '保存文件');
h.finish();`}
      >
        <MultiStepDemo />
      </DemoBlock>

      <DemoBlock
        title="自定义主题色"
        description="color 覆盖进度条主色。支持普通 CSS 颜色值。"
        code={`<FullscreenProgress open percent={66} color="#22c55e" title="完成中" />`}
      >
        <ColorDemo />
      </DemoBlock>

      <h2>API</h2>
      <h3>组件 Props</h3>
      <ApiTable
        rows={[
          { prop: 'open', desc: '是否显示', type: 'boolean', default: '-' },
          { prop: 'percent', desc: '0-100 百分比, 不传为不确定进度', type: 'number', default: '-' },
          { prop: 'title', desc: '标题', type: 'ReactNode', default: '-' },
          { prop: 'description', desc: '描述文字', type: 'ReactNode', default: '-' },
          { prop: 'variant', desc: '进度条样式', type: `'linear' | 'circular'`, default: `'linear'` },
          { prop: 'showPercent', desc: '是否显示百分比文字', type: 'boolean', default: 'true' },
          { prop: 'color', desc: '主题色, 覆盖 --au-primary', type: 'string', default: '-' },
          { prop: 'maskOpacity', desc: '遮罩透明度 0-1', type: 'number', default: '0.55' },
          { prop: 'zIndex', desc: '层级', type: 'number', default: '9999' },
          { prop: 'fadeDuration', desc: '淡入/淡出时长 (ms)', type: 'number', default: '260' },
        ]}
      />

      <h3>命令式方法</h3>
      <ApiTable
        rows={[
          {
            prop: 'FullscreenProgress.start(opts?)',
            desc: '打开进度, 返回 handle; 再次调用会替换当前实例',
            type: '(opts?: FullscreenProgressProps) => Handle',
            default: '-',
          },
          {
            prop: 'handle.update(percent)',
            desc: '更新百分比',
            type: '(n: number) => Handle',
            default: '-',
          },
          {
            prop: 'handle.setText(title, desc)',
            desc: '更新标题 / 描述',
            type: '(title?, desc?) => Handle',
            default: '-',
          },
          {
            prop: 'handle.finish(delayMs?)',
            desc: '设为 100% 后延迟关闭, 默认 400ms',
            type: '(delay?: number) => void',
            default: '-',
          },
          {
            prop: 'handle.close()',
            desc: '立即关闭',
            type: '() => void',
            default: '-',
          },
        ]}
      />
    </>
  );
};

/* ----------------------- demos ----------------------- */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const IndeterminateDemo: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        className="au-btn au-btn--primary"
        onClick={() => {
          setOpen(true);
          setTimeout(() => setOpen(false), 2500);
        }}
      >
        打开 (2.5s 后自动关)
      </button>
      <FullscreenProgress
        open={open}
        title="处理中"
        description="正在连接服务器…"
      />
    </div>
  );
};

const PercentDemo: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [pct, setPct] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const run = () => {
    setPct(0);
    setOpen(true);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setPct((p) => {
        if (p >= 100) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => setOpen(false), 500);
          return 100;
        }
        return p + 5;
      });
    }, 150);
  };

  return (
    <div>
      <button className="au-btn au-btn--primary" onClick={run}>
        开始上传
      </button>
      <FullscreenProgress
        open={open}
        percent={pct}
        title="上传中"
        description={`进度 ${pct}%`}
      />
    </div>
  );
};

const CircularDemo: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (!open) return;
    setPct(0);
    const t = setInterval(() => {
      setPct((p) => {
        if (p >= 100) {
          clearInterval(t);
          setTimeout(() => setOpen(false), 400);
          return 100;
        }
        return p + 4;
      });
    }, 120);
    return () => clearInterval(t);
  }, [open]);

  return (
    <div>
      <button
        className="au-btn au-btn--primary"
        onClick={() => setOpen(true)}
      >
        导出数据
      </button>
      <FullscreenProgress
        open={open}
        percent={pct}
        variant="circular"
        title="导出数据"
      />
    </div>
  );
};

const ImperativeDemo: React.FC = () => {
  const run = async () => {
    const h = FullscreenProgress.start({
      title: '上传文件',
      description: 'aurora-report.pdf',
      variant: 'circular',
    });
    for (let i = 0; i <= 100; i += 10) {
      await sleep(160);
      h.update(i);
    }
    h.finish();
  };
  return (
    <button className="au-btn au-btn--primary" onClick={run}>
      命令式触发
    </button>
  );
};

const MultiStepDemo: React.FC = () => {
  const run = async () => {
    const h = FullscreenProgress.start({ title: '准备' });
    await sleep(300);
    h.setText('步骤 1 / 3', '加载资源').update(33);
    await sleep(600);
    h.setText('步骤 2 / 3', '生成报告').update(66);
    await sleep(600);
    h.setText('步骤 3 / 3', '保存文件');
    h.finish();
  };
  return (
    <button className="au-btn au-btn--primary" onClick={run}>
      多步骤任务
    </button>
  );
};

const ColorDemo: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        className="au-btn au-btn--primary"
        onClick={() => {
          setOpen(true);
          setTimeout(() => setOpen(false), 1800);
        }}
      >
        绿色主题
      </button>
      <FullscreenProgress
        open={open}
        percent={66}
        color="#22c55e"
        title="备份完成中"
        description="66% · 预计 12 秒"
      />
    </div>
  );
};

export default FullscreenProgressDoc;
