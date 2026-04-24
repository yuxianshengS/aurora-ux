import React, { useState } from 'react';
import { Spin } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const SpinDoc: React.FC = () => {
  return (
    <>
      <h1>Spin 加载中</h1>
      <p>
        页面或局部区域的加载态。既可独立展示,也可包裹子元素显示半透明蒙层。
        支持延迟显示,避免极短 loading 造成闪烁。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="独立使用,三种尺寸。"
        code={`<Spin size="small" />
<Spin size="medium" />
<Spin size="large" />`}
      >
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <Spin size="small" />
          <Spin size="medium" />
          <Spin size="large" />
        </div>
      </DemoBlock>

      <DemoBlock
        title="带提示文字"
        description="tip 下方显示说明。"
        code={`<Spin tip="加载中…" />
<Spin size="large" tip="稍等,正在拉取数据" />`}
      >
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          <Spin tip="加载中…" />
          <Spin size="large" tip="稍等,正在拉取数据" />
        </div>
      </DemoBlock>

      <DemoBlock
        title="包裹内容"
        description="将子元素包起来,spinning 控制是否显示蒙层。"
        code={`<Spin spinning={loading} tip="加载中…">
  <div className="panel">...</div>
</Spin>`}
      >
        <WrapDemo />
      </DemoBlock>

      <DemoBlock
        title="延迟显示"
        description="delay (ms) 防止极短 loading 造成画面闪一下。"
        code={`<Spin spinning={loading} delay={300}>
  <div>...</div>
</Spin>`}
      >
        <DelayDemo />
      </DemoBlock>

      <DemoBlock
        title="全屏 loading"
        description="fullscreen 覆盖整个视口,适合页面级加载态。"
        code={`<Spin fullscreen spinning={show} tip="正在提交订单…" size="large" />`}
      >
        <FullscreenDemo />
      </DemoBlock>

      <DemoBlock
        title="自定义 indicator"
        description="传入任意 ReactNode 替换默认点阵。"
        code={`<Spin
  indicator={<span className="my-spinner" />}
  tip="自定义"
/>`}
      >
        <Spin
          indicator={
            <span
              style={{
                display: 'inline-block',
                width: 26,
                height: 26,
                border: '3px solid var(--au-primary)',
                borderRightColor: 'transparent',
                borderRadius: '50%',
                animation: 'au-spin 0.8s linear infinite',
              }}
            />
          }
          tip="自定义 indicator"
        />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'spinning', desc: '是否加载中', type: 'boolean', default: 'true' },
          { prop: 'tip', desc: '提示文字', type: 'ReactNode', default: '-' },
          { prop: 'size', desc: '尺寸', type: `'small' | 'medium' | 'large'`, default: `'medium'` },
          { prop: 'indicator', desc: '自定义指示器', type: 'ReactNode', default: '内置点阵' },
          { prop: 'delay', desc: '延迟显示毫秒数 (防抖)', type: 'number', default: '-' },
          { prop: 'fullscreen', desc: '全屏 loading', type: 'boolean', default: 'false' },
          { prop: 'children', desc: '被包裹的内容 (出现蒙层)', type: 'ReactNode', default: '-' },
        ]}
      />
    </>
  );
};

const WrapDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  return (
    <div>
      <button
        className="au-btn au-btn--default au-btn--medium"
        onClick={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 1500);
        }}
        style={{ marginBottom: 12 }}
      >
        {loading ? '加载中…' : '触发 1.5s 加载'}
      </button>
      <Spin spinning={loading} tip="获取数据中…">
        <div
          style={{
            padding: 20,
            background: 'var(--au-bg-soft)',
            border: '1px solid var(--au-border)',
            borderRadius: 8,
            minHeight: 120,
          }}
        >
          <h4 style={{ marginTop: 0 }}>卡片标题</h4>
          <p style={{ margin: 0, color: 'var(--au-text-2)' }}>
            这里是一些内容,点上面按钮模拟 loading 状态。
          </p>
        </div>
      </Spin>
    </div>
  );
};

const DelayDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          className="au-btn au-btn--default au-btn--medium"
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 150);
          }}
        >
          超短 loading (150ms, 不显示)
        </button>
        <button
          className="au-btn au-btn--default au-btn--medium"
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 1500);
          }}
        >
          常规 loading (1.5s, 显示)
        </button>
      </div>
      <Spin spinning={loading} delay={300}>
        <div
          style={{
            padding: 20,
            background: 'var(--au-bg-soft)',
            border: '1px solid var(--au-border)',
            borderRadius: 8,
            minHeight: 80,
          }}
        >
          delay=300ms,loading 时长小于 300ms 时不会闪一下
        </div>
      </Spin>
    </div>
  );
};

const FullscreenDemo: React.FC = () => {
  const [show, setShow] = useState(false);
  return (
    <>
      <button
        className="au-btn au-btn--primary au-btn--medium"
        onClick={() => {
          setShow(true);
          setTimeout(() => setShow(false), 2000);
        }}
      >
        模拟 2s 全屏加载
      </button>
      <Spin fullscreen spinning={show} tip="正在提交订单…" size="large" />
    </>
  );
};

export default SpinDoc;
