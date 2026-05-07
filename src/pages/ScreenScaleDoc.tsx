import React from 'react';
import { Link } from 'react-router-dom';
import { ScreenScale, GradientText, NumberRoll, Button } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const ScreenScaleDoc: React.FC = () => {
  return (
    <>
      <h1>ScreenScale 大屏自适应容器</h1>
      <p>
        给"可视化大屏"用的等比缩放容器。一套 1920×1080 的设计稿,自动适配到任何视口 (4K / 2K / FHD /
        投屏 / 手机预览),不用为不同分辨率写多套布局。
      </p>
      <p style={{ color: 'var(--au-text-2)', fontSize: 14 }}>
        想直接看完整大屏样板? <Link to="/examples/screen">→ 打开运营大屏样板</Link>
      </p>

      <h2>核心思路</h2>
      <p>
        ScreenScale 把内层容器锁成 <code>baseWidth × baseHeight</code>(比如 1920×1080), 然后用{' '}
        <code>transform: scale()</code> 缩放到外层尺寸。所有内部组件都按"设计稿坐标"来
        定位,**绝对定位 + px 单位**自由用,缩放后视觉等比。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法 (fit 模式)"
        description="设计稿 1920×1080, fit 模式等比缩放完整露出, 不裁切。容器外层用 width/height 控制实际渲染尺寸。"
        code={`<div style={{ width: 720, height: 405, border: '1px solid var(--au-border)' }}>
  <ScreenScale baseWidth={1920} baseHeight={1080} mode="fit" background="#020308">
    {/* 内部组件按 1920x1080 设计稿坐标定位 */}
    <div style={{ position: 'absolute', left: 100, top: 100 }}>
      <GradientText preset="aurora" size={64} weight={900}>
        Aurora 大屏
      </GradientText>
    </div>
    <div style={{ position: 'absolute', left: 100, top: 240 }}>
      <NumberRoll value={1284560} prefix="¥ " size={88} weight={900} color="white" />
    </div>
  </ScreenScale>
</div>`}
      >
        <div
          style={{
            width: 720,
            height: 405,
            border: '1px solid var(--au-border)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <ScreenScale baseWidth={1920} baseHeight={1080} mode="fit" background="#020308">
            <div style={{ position: 'absolute', left: 100, top: 100 }}>
              <GradientText preset="aurora" size={64} weight={900} as="span">
                Aurora 大屏
              </GradientText>
            </div>
            <div style={{ position: 'absolute', left: 100, top: 220 }}>
              <NumberRoll value={1284560} prefix="¥ " size={88} weight={900} color="white" />
            </div>
            <div
              style={{
                position: 'absolute',
                left: 100,
                top: 340,
                color: 'rgba(255,255,255,0.65)',
                fontSize: 18,
              }}
            >
              这是按 1920×1080 设计稿坐标定位的内容,缩放到 720×405 容器
            </div>
          </ScreenScale>
        </div>
      </DemoBlock>

      <DemoBlock
        title="不同模式对比"
        description="fit (含, 留边) / cover (盖, 裁切) / fullWidth (跟宽) / fullHeight (跟高) / stretch (双向独立, 失真)。容器是 320×180 (16:9), 内容是 1920×1080 设计稿。"
        code={`<ScreenScale baseWidth={1920} baseHeight={1080} mode="fit" />
<ScreenScale baseWidth={1920} baseHeight={1080} mode="cover" />
<ScreenScale baseWidth={1920} baseHeight={1080} mode="fullWidth" />
<ScreenScale baseWidth={1920} baseHeight={1080} mode="stretch" />`}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {(['fit', 'cover', 'fullWidth', 'stretch'] as const).map((mode) => (
            <div key={mode}>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--au-text-3)',
                  marginBottom: 6,
                  fontFamily: 'monospace',
                }}
              >
                mode = "{mode}"
              </div>
              <div
                style={{
                  width: '100%',
                  height: 200,
                  border: '1px solid var(--au-border)',
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              >
                <ScreenScale baseWidth={1920} baseHeight={1080} mode={mode} background="#0a0c12">
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background:
                        'radial-gradient(circle, rgba(168,85,247,0.3), transparent 60%), radial-gradient(circle at 0% 0%, rgba(34,211,238,0.3), transparent 60%)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 96,
                        fontWeight: 900,
                        color: '#fff',
                        textShadow: '0 0 24px rgba(168,85,247,0.6)',
                      }}
                    >
                      {mode}
                    </span>
                  </div>
                </ScreenScale>
              </div>
            </div>
          ))}
        </div>
      </DemoBlock>

      <DemoBlock
        title="缩放比例回调"
        description="onScaleChange 拿到当前缩放比例 — 可以给某些元素 (比如按钮 / 提示) 应用反向 scale, 让它们不跟着大屏一起放大。"
        code={`<ScreenScale
  baseWidth={1920}
  baseHeight={1080}
  mode="fit"
  onScaleChange={({ scaleX }) => console.log('当前缩放', scaleX)}
>
  ...
</ScreenScale>`}
      >
        <ScaleWatcher />
      </DemoBlock>

      <h2>典型用法</h2>

      <h3>1. 全屏大屏</h3>
      <pre>
        <code>{`// 把整个 viewport 当大屏容器
<div style={{ width: '100vw', height: '100vh' }}>
  <ScreenScale baseWidth={1920} baseHeight={1080} mode="fit" background="#020308">
    {/* 内部用绝对定位摆放各种 panel */}
    <header style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 80 }}>...</header>
    <div style={{ position: 'absolute', left: 24, top: 100, width: 460 }}>...</div>
    {/* ... */}
  </ScreenScale>
</div>`}</code>
      </pre>

      <h3>2. 锁定基准 + transitionDuration 平滑</h3>
      <pre>
        <code>{`// 浏览器 resize 时缓动过渡, 不直接 snap
<ScreenScale
  baseWidth={1920}
  baseHeight={1080}
  mode="fit"
  transitionDuration={300}
/>`}</code>
      </pre>

      <h3>3. minScale 限制最小缩放</h3>
      <pre>
        <code>{`// 防止在极小屏幕上字小到看不见
<ScreenScale
  baseWidth={1920}
  baseHeight={1080}
  mode="fit"
  minScale={0.4}
/>`}</code>
      </pre>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'baseWidth', desc: '设计稿基准宽 (px)', type: 'number', default: '1920' },
          { prop: 'baseHeight', desc: '设计稿基准高 (px)', type: 'number', default: '1080' },
          {
            prop: 'mode',
            desc: '缩放模式',
            type: `'fit' | 'cover' | 'fullWidth' | 'fullHeight' | 'stretch'`,
            default: `'fit'`,
          },
          { prop: 'minScale', desc: '缩放下限', type: 'number', default: '-' },
          { prop: 'maxScale', desc: '缩放上限', type: 'number', default: '-' },
          {
            prop: 'onScaleChange',
            desc: '缩放变化回调',
            type: '({ scaleX, scaleY }) => void',
            default: '-',
          },
          {
            prop: 'background',
            desc: 'letterbox 留白处的背景色 (mode=fit 上下/左右多余区域)',
            type: 'string',
            default: '-',
          },
          {
            prop: 'transitionDuration',
            desc: '缩放过渡时长 (ms), 0 = 直接 snap',
            type: 'number',
            default: '0',
          },
        ]}
      />

      <h2>ref API</h2>
      <ApiTable
        rows={[
          {
            prop: 'recompute()',
            desc: '主动触发一次重算 (父容器 JS 改尺寸但 ResizeObserver 没触发时使用)',
            type: '() => void',
            default: '-',
          },
          {
            prop: 'getScale()',
            desc: '读取当前缩放比例',
            type: '() => { scaleX, scaleY }',
            default: '-',
          },
        ]}
      />
    </>
  );
};

const ScaleWatcher: React.FC = () => {
  const [scale, setScale] = React.useState(1);
  return (
    <>
      <div
        style={{
          width: '100%',
          height: 200,
          border: '1px solid var(--au-border)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <ScreenScale
          baseWidth={1920}
          baseHeight={1080}
          mode="fit"
          background="#0a0c12"
          onScaleChange={({ scaleX }) => setScale(scaleX)}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 64,
              fontWeight: 800,
            }}
          >
            等比缩放
          </div>
        </ScreenScale>
      </div>
      <div
        style={{ marginTop: 12, color: 'var(--au-text-2)', fontFamily: 'monospace', fontSize: 13 }}
      >
        当前 scale = {scale.toFixed(3)} (拖窗口看变化)
      </div>
      <div style={{ marginTop: 12 }}>
        <Link to="/examples/screen">
          <Button type="primary">→ 完整运营大屏样板</Button>
        </Link>
      </div>
    </>
  );
};

export default ScreenScaleDoc;
