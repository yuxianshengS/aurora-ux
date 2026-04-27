import React, { useRef } from 'react';
import {
  ConnectorGroup,
  Connector,
  GlowCard,
  GradientText,
  Icon,
} from '../components';
import DemoBlock from '../site-components/DemoBlock';
import './diagram-pages.css';

const MindmapDoc: React.FC = () => {
  return (
    <>
      <h1>思维导图 / Mindmap</h1>
      <p>
        中心放射 + 多级展开. Connector 支持 1-to-many, 配 curve 曲线让放射感更柔和;
        每条主分支用不同色调区分, 二级节点跟随主分支颜色衍生. 这种图重点是
        <strong>视觉层级</strong> — 中心最大, 主干次之, 叶子最小.
      </p>

      <DemoBlock
        title="产品规划思维导图"
        description="中心: 'Aurora UI'; 4 个主分支 (设计 / 组件 / 工程 / 生态), 每个主分支辐射 3 个二级要点. 主分支用 curve 曲线放射, 二级用 step 短直线."
        code={CODE}
      >
        <Mindmap />
      </DemoBlock>
    </>
  );
};

const Mindmap: React.FC = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const center = useRef<HTMLDivElement>(null);
  // 4 个主分支 (上下左右)
  const designB = useRef<HTMLDivElement>(null);
  const compB = useRef<HTMLDivElement>(null);
  const engB = useRef<HTMLDivElement>(null);
  const ecoB = useRef<HTMLDivElement>(null);
  // 设计 leaves
  const d1 = useRef<HTMLDivElement>(null);
  const d2 = useRef<HTMLDivElement>(null);
  const d3 = useRef<HTMLDivElement>(null);
  // 组件 leaves
  const c1 = useRef<HTMLDivElement>(null);
  const c2 = useRef<HTMLDivElement>(null);
  const c3 = useRef<HTMLDivElement>(null);
  // 工程 leaves
  const e1 = useRef<HTMLDivElement>(null);
  const e2 = useRef<HTMLDivElement>(null);
  const e3 = useRef<HTMLDivElement>(null);
  // 生态 leaves
  const o1 = useRef<HTMLDivElement>(null);
  const o2 = useRef<HTMLDivElement>(null);
  const o3 = useRef<HTMLDivElement>(null);

  return (
    <div ref={stageRef} className="diag-stage diag-stage--mindmap">
      <ConnectorGroup container={stageRef} defaultArrow="none" defaultType="curve">
        {/* 中心 */}
        <div
          ref={center}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <GlowCard glowColor="#a855f7" intensity={0.85} padding="14px 24px" radius={999}>
            <GradientText preset="aurora" size={20} weight={800}>
              Aurora UI
            </GradientText>
          </GlowCard>
        </div>

        {/* 4 主分支 */}
        <Branch ref={designB} color="#22d3ee" icon="editor-text" title="设计"
                pos={{ left: 60, top: 60 }} />
        <Branch ref={compB} color="#a855f7" icon="catalog" title="组件"
                pos={{ right: 60, top: 60 }} />
        <Branch ref={engB} color="#10b981" icon="settings" title="工程"
                pos={{ left: 60, bottom: 60 }} />
        <Branch ref={ecoB} color="#f472b6" icon="connections" title="生态"
                pos={{ right: 60, bottom: 60 }} />

        {/* 设计 leaves */}
        <Leaf ref={d1} color="#22d3ee" title="极光配色" pos={{ left: 30, top: 130 }} />
        <Leaf ref={d2} color="#22d3ee" title="间距 8 倍数" pos={{ left: 30, top: 180 }} />
        <Leaf ref={d3} color="#22d3ee" title="圆角 10/12/16" pos={{ left: 30, top: 230 }} />

        {/* 组件 leaves */}
        <Leaf ref={c1} color="#a855f7" title="60+ 通用组件" pos={{ right: 30, top: 130 }} />
        <Leaf ref={c2} color="#a855f7" title="极光特效系列" pos={{ right: 30, top: 180 }} />
        <Leaf ref={c3} color="#a855f7" title="Connector 图" pos={{ right: 30, top: 230 }} />

        {/* 工程 leaves */}
        <Leaf ref={e1} color="#10b981" title="TS 全套" pos={{ left: 30, bottom: 130 }} />
        <Leaf ref={e2} color="#10b981" title="拆 chunk" pos={{ left: 30, bottom: 180 }} />
        <Leaf ref={e3} color="#10b981" title="CSS 变量主题" pos={{ left: 30, bottom: 230 }} />

        {/* 生态 leaves */}
        <Leaf ref={o1} color="#f472b6" title="拖拽搭建器" pos={{ right: 30, bottom: 130 }} />
        <Leaf ref={o2} color="#f472b6" title="Section 模板" pos={{ right: 30, bottom: 180 }} />
        <Leaf ref={o3} color="#f472b6" title="iconfont 同步" pos={{ right: 30, bottom: 230 }} />

        {/* 中心 → 主分支 (4 条 curve) */}
        <Connector from={center} to={designB} color="#22d3ee" thickness={2.5} animated />
        <Connector from={center} to={compB} color="#a855f7" thickness={2.5} animated />
        <Connector from={center} to={engB} color="#10b981" thickness={2.5} animated />
        <Connector from={center} to={ecoB} color="#f472b6" thickness={2.5} animated />

        {/* 主分支 → leaves (step 短直线) */}
        <Connector from={designB} to={[d1, d2, d3]} type="step" color="#22d3ee" thickness={1.5} />
        <Connector from={compB} to={[c1, c2, c3]} type="step" color="#a855f7" thickness={1.5} />
        <Connector from={engB} to={[e1, e2, e3]} type="step" color="#10b981" thickness={1.5} />
        <Connector from={ecoB} to={[o1, o2, o3]} type="step" color="#f472b6" thickness={1.5} />
      </ConnectorGroup>
    </div>
  );
};

interface BranchProps {
  color: string;
  icon: string;
  title: string;
  pos: React.CSSProperties;
}
const Branch = React.forwardRef<HTMLDivElement, BranchProps>(
  ({ color, icon, title, pos }, ref) => (
    <div ref={ref} style={{ position: 'absolute', ...pos }}>
      <GlowCard glowColor={color} intensity={0.7} padding="10px 18px" radius={999}>
        <div className="diag-node-row">
          <Icon name={icon} size={16} style={{ color }} />
          <span style={{ fontSize: 14, fontWeight: 700 }}>{title}</span>
        </div>
      </GlowCard>
    </div>
  ),
);
Branch.displayName = 'Branch';

interface LeafProps {
  color: string;
  title: string;
  pos: React.CSSProperties;
}
const Leaf = React.forwardRef<HTMLDivElement, LeafProps>(({ color, title, pos }, ref) => (
  <div
    ref={ref}
    style={{
      position: 'absolute',
      padding: '5px 12px',
      borderRadius: 999,
      background: `color-mix(in srgb, ${color} 8%, var(--au-bg))`,
      border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`,
      fontSize: 12,
      color: 'var(--au-text-1)',
      fontWeight: 500,
      whiteSpace: 'nowrap',
      ...pos,
    }}
  >
    {title}
  </div>
));
Leaf.displayName = 'Leaf';

const CODE = `<ConnectorGroup container={stageRef} defaultArrow="none" defaultType="curve">
  {/* 中心 (使用 GradientText 强调) */}
  <div ref={center} style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)' }}>
    <GlowCard glowColor="#a855f7" padding="14px 24px" radius={999}>
      <GradientText preset="aurora" size={20} weight={800}>Aurora UI</GradientText>
    </GlowCard>
  </div>

  {/* 4 主分支 (上下左右) */}
  <Branch ref={designB} color="#22d3ee" title="设计" pos={{ left: 60, top: 60 }} />
  <Branch ref={compB}   color="#a855f7" title="组件" pos={{ right: 60, top: 60 }} />
  <Branch ref={engB}    color="#10b981" title="工程" pos={{ left: 60, bottom: 60 }} />
  <Branch ref={ecoB}    color="#f472b6" title="生态" pos={{ right: 60, bottom: 60 }} />

  {/* leaves (每分支 3 个) — Leaf 用 pill 样式, 颜色派生主分支 */}
  ...

  {/* 中心 → 主分支: curve 曲线放射 */}
  <Connector from={center} to={designB} color="#22d3ee" animated />
  <Connector from={center} to={compB}   color="#a855f7" animated />
  <Connector from={center} to={engB}    color="#10b981" animated />
  <Connector from={center} to={ecoB}    color="#f472b6" animated />

  {/* 主分支 → leaves: step 短直线 */}
  <Connector from={designB} to={[d1, d2, d3]} type="step" color="#22d3ee" />
  <Connector from={compB}   to={[c1, c2, c3]} type="step" color="#a855f7" />
  <Connector from={engB}    to={[e1, e2, e3]} type="step" color="#10b981" />
  <Connector from={ecoB}    to={[o1, o2, o3]} type="step" color="#f472b6" />
</ConnectorGroup>`;

export default MindmapDoc;
