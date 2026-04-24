import React, { useEffect, useRef, useState } from 'react';
import { TopProgress } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const TopProgressDoc: React.FC = () => {
  return (
    <>
      <h1>TopProgress 顶部进度条</h1>
      <p>
        固定在视口顶部的细条进度指示器, NProgress 风格。非阻塞、轻量, 最适合路由切换、
        后台请求、Ajax 加载等不应打断用户操作的场景。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="命令式 API (推荐)"
        description="start() 开启自动爬升; done() 设为 100% 并淡出。适合事件里直接调用, 无需维护状态。"
        code={`TopProgress.start();     // 从 0 开始自动爬升到 90%
// ...请求返回后...
TopProgress.done();      // 跳到 100% 并淡出

// 手动递增:
TopProgress.inc();        // +5
TopProgress.inc(10);      // +10
TopProgress.set(70);      // 直接设为 70%`}
      >
        <ImperativeDemo />
      </DemoBlock>

      <DemoBlock
        title="路由切换场景"
        description="和 react-router 结合最经典的用法: 页面切换时 start, 加载完 done。"
        code={`useEffect(() => {
  TopProgress.start();
  fetchPageData().then(() => TopProgress.done());
}, [location.pathname]);`}
      >
        <RoutingDemo />
      </DemoBlock>

      <DemoBlock
        title="声明式 · 受控百分比"
        description="传 percent 精确控制进度。visible 控制显示/隐藏。"
        code={`<TopProgress visible={loading} percent={pct} />`}
      >
        <ControlledDemo />
      </DemoBlock>

      <DemoBlock
        title="声明式 · 不确定进度"
        description="不传 percent, 组件自动缓慢爬升到 90%。"
        code={`<TopProgress visible={loading} />`}
      >
        <IndeterminateDemo />
      </DemoBlock>

      <DemoBlock
        title="带右上角 Spinner"
        description="showSpinner 开启经典 NProgress 右上角小圆圈。"
        code={`TopProgress.start();
// 或
<TopProgress visible showSpinner />`}
      >
        <SpinnerDemo />
      </DemoBlock>

      <DemoBlock
        title="自定义颜色 & 粗细"
        description="color 换主色; height 改条形高度。"
        code={`<TopProgress visible color="#22c55e" height={5} />`}
      >
        <CustomStyleDemo />
      </DemoBlock>

      <h2>API</h2>
      <h3>组件 Props</h3>
      <ApiTable
        rows={[
          { prop: 'visible', desc: '是否显示', type: 'boolean', default: 'false' },
          { prop: 'percent', desc: '0-100; 不传则自动爬升到 90%', type: 'number', default: '-' },
          { prop: 'height', desc: '条形高度 (px)', type: 'number', default: '3' },
          { prop: 'color', desc: '主色, 覆盖 --au-primary', type: 'string', default: '-' },
          { prop: 'showSpinner', desc: '右上角是否显示旋转小圆圈', type: 'boolean', default: 'false' },
          { prop: 'zIndex', desc: '层级', type: 'number', default: '9999' },
          { prop: 'fadeDuration', desc: '淡出时长 (ms)', type: 'number', default: '400' },
        ]}
      />

      <h3>命令式方法</h3>
      <ApiTable
        rows={[
          { prop: 'TopProgress.start()', desc: '开启并自动爬升到 90%', type: '() => void', default: '-' },
          { prop: 'TopProgress.set(n)', desc: '设置为指定百分比 (0-100)', type: '(n: number) => void', default: '-' },
          { prop: 'TopProgress.inc(amount?)', desc: '递增, 默认 +5, 上限 95', type: '(amount?: number) => void', default: '-' },
          { prop: 'TopProgress.done()', desc: '设为 100% 并淡出关闭', type: '() => void', default: '-' },
        ]}
      />
    </>
  );
};

/* ---------------------- demos ---------------------- */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const ImperativeDemo: React.FC = () => {
  const run = async () => {
    TopProgress.start();
    await sleep(1600);
    TopProgress.done();
  };
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button className="au-btn au-btn--primary" onClick={run}>
        start + done
      </button>
      <button className="au-btn" onClick={() => TopProgress.inc(10)}>
        inc +10
      </button>
      <button className="au-btn" onClick={() => TopProgress.set(70)}>
        set 70%
      </button>
      <button className="au-btn" onClick={() => TopProgress.done()}>
        done
      </button>
    </div>
  );
};

const RoutingDemo: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0);

  const go = async (i: number) => {
    TopProgress.start();
    setPageIndex(i);
    await sleep(800 + Math.random() * 600);
    TopProgress.done();
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            className={`au-btn${pageIndex === i ? ' au-btn--primary' : ''}`}
            onClick={() => go(i)}
          >
            页面 {i + 1}
          </button>
        ))}
      </div>
      <div
        style={{
          padding: 20,
          border: '1px solid var(--au-border)',
          borderRadius: 8,
          color: 'var(--au-text-2)',
        }}
      >
        当前模拟页面: 页面 {pageIndex + 1}
      </div>
    </div>
  );
};

const ControlledDemo: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [pct, setPct] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const run = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setVisible(true);
    setPct(0);
    timerRef.current = setInterval(() => {
      setPct((p) => {
        if (p >= 100) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => setVisible(false), 400);
          return 100;
        }
        return p + 4;
      });
    }, 120);
  };

  return (
    <div>
      <button className="au-btn au-btn--primary" onClick={run}>
        开始
      </button>
      <span style={{ marginLeft: 12, color: 'var(--au-text-2)' }}>
        当前: {pct}%
      </span>
      <TopProgress visible={visible} percent={pct} />
    </div>
  );
};

const IndeterminateDemo: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const toggle = () => {
    if (visible) {
      setVisible(false);
    } else {
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
    }
  };
  return (
    <div>
      <button className="au-btn au-btn--primary" onClick={toggle}>
        {visible ? '停止' : '启动 (4s 自动停)'}
      </button>
      <TopProgress visible={visible} />
    </div>
  );
};

const SpinnerDemo: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const run = () => {
    setVisible(true);
    setTimeout(() => setVisible(false), 2500);
  };
  return (
    <div>
      <button className="au-btn au-btn--primary" onClick={run}>
        启动带 spinner (2.5s)
      </button>
      <TopProgress visible={visible} showSpinner />
    </div>
  );
};

const CustomStyleDemo: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const run = () => {
    setVisible(true);
    setTimeout(() => setVisible(false), 2500);
  };
  return (
    <div>
      <button className="au-btn au-btn--primary" onClick={run}>
        绿色粗条 (5px)
      </button>
      <TopProgress visible={visible} color="#22c55e" height={5} />
    </div>
  );
};

export default TopProgressDoc;
