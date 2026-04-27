import React, { useRef, useState } from 'react';
import {
  ConnectorGroup,
  Connector,
  Draggable,
  GlowCard,
  Tag,
  Icon,
  PulseDot,
  type ConnectorType,
} from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';
import './ConnectorDoc.css';

const ConnectorDoc: React.FC = () => {
  return (
    <>
      <h1>Connector 连接线</h1>
      <p>
        给两个 (或多个) DOM 之间画一条线, 自动跟随尺寸 / 滚动 / 拖动变化。
        支持 <strong>1-1</strong> / <strong>1-many</strong> / <strong>many-many</strong>,
        4 种线形 (curve / step / orthogonal / straight), 极光渐变 stroke,
        流动虚线, 单端/双端箭头, 中点 label。共享一个 SVG 渲染, 性能友好。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="实战: 网络拓扑架构图"
        description="5 层架构: Edge (Internet/Firewall) → Gateway (Load Balancer) → Web 层 (3 实例) → App 层 (2 实例) → Data 层 (主从). 串联用极光渐变流动虚线, 1-to-many 扇出, mesh 网状连接, 主从双向同步. 每层换一种 GlowCard 主色, 重要节点配 PulseDot 实时状态指示."
        code={TOPOLOGY_CODE}
      >
        <NetworkTopologyDemo />
      </DemoBlock>

      <DemoBlock
        title="基础: 一对一"
        description="两个 ref 拿到 DOM, 用 container 把 SVG 钉在同一个滚动容器里 — 滚动时线和 DOM 同步移动. 不传 container 默认 portal 到 body fixed, 跨视口能用但页面滚动会抖."
        code={`const refA = useRef(null);
const refB = useRef(null);
const stageRef = useRef(null);

<div ref={stageRef} style={{ position: 'relative', height: 220 }}>
  <ConnectorGroup container={stageRef}>
    <div ref={refA} style={{ position: 'absolute', left: 30, top: 40 }}>A</div>
    <div ref={refB} style={{ position: 'absolute', right: 30, top: 120 }}>B</div>
    <Connector from={refA} to={refB} color="aurora" thickness={2.5} />
  </ConnectorGroup>
</div>`}
      >
        <BasicDemo />
      </DemoBlock>

      <DemoBlock
        title="一对多"
        description="from 单个, to 数组. 同一边出多线时自动沿边均匀分布, 不会堆在中点."
        code={`<div ref={stageRef} style={{ position: 'relative', height: 320 }}>
  <ConnectorGroup container={stageRef}>
    <div ref={refRoot} style={{ position: 'absolute', top: 30, left: '50%' }}>Root</div>
    <div ref={refA} style={{ position: 'absolute', bottom: 40, left: '8%' }}>子 A</div>
    <div ref={refB} style={{ position: 'absolute', bottom: 40, left: '32%' }}>子 B</div>
    <div ref={refC} style={{ position: 'absolute', bottom: 40, right: '32%' }}>子 C</div>
    <div ref={refD} style={{ position: 'absolute', bottom: 40, right: '8%' }}>子 D</div>
    <Connector
      from={refRoot}
      to={[refA, refB, refC, refD]}
      type="curve"
      color="aurora"
      animated
    />
  </ConnectorGroup>
</div>`}
      >
        <OneToManyDemo />
      </DemoBlock>

      <DemoBlock
        title="多对多 (mesh)"
        description="from 和 to 都是数组, 默认笛卡尔积全连 (3×2 = 6 条). mode='pairs' 改为一一配对."
        code={`<ConnectorGroup container={stageRef}>
  {/* 左列 3 个 + 右列 2 个 */}
  <div ref={a1}>A1</div><div ref={a2}>A2</div><div ref={a3}>A3</div>
  <div ref={b1}>B1</div><div ref={b2}>B2</div>

  <Connector
    from={[a1, a2, a3]}
    to={[b1, b2]}
    mode="mesh"
    type="step"
    color={['#22d3ee', '#a855f7']}
    thickness={1.5}
  />
</ConnectorGroup>`}
      >
        <MeshDemo />
      </DemoBlock>

      <DemoBlock
        title="可拖动 + 自动追踪"
        description="任意拖动节点, 连线实时跟随; ResizeObserver + scroll 监听都自动挂好. Draggable 内部用 transform, getBoundingClientRect 拿到的是变换后的真实位置."
        code={`<div ref={stageRef} style={{ position: 'relative', height: 320 }}>
  <ConnectorGroup container={stageRef}>
    <Draggable defaultPosition={{ x: 30, y: 30 }} bounds="parent">
      <div ref={refA} style={{ position: 'relative' }}>拖我 A</div>
    </Draggable>
    <Draggable defaultPosition={{ x: 240, y: 80 }} bounds="parent">
      <div ref={refB} style={{ position: 'relative' }}>拖我 B</div>
    </Draggable>
    <Draggable defaultPosition={{ x: 380, y: 200 }} bounds="parent">
      <div ref={refC} style={{ position: 'relative' }}>拖我 C</div>
    </Draggable>
    <Connector from={refA} to={[refB, refC]} type="orthogonal" color="aurora" animated />
    <Connector from={refB} to={refC} type="curve" color="#f472b6" dashed label="依赖" />
  </ConnectorGroup>
</div>`}
      >
        <DraggableDemo />
      </DemoBlock>

      <DemoBlock
        title="4 种 type 切换"
        description="curve (默认, 三次贝塞尔) / step (3 段直角) / orthogonal (圆角折线) / straight (直线)."
        code={`const [type, setType] = useState('curve');

<div ref={stageRef} style={{ position: 'relative', height: 220 }}>
  <ConnectorGroup container={stageRef}>
    <div ref={a} style={{ position: 'absolute', left: 30, top: 30 }}>起点</div>
    <div ref={b} style={{ position: 'absolute', right: 30, bottom: 30 }}>终点</div>
    <Connector
      from={a}
      to={b}
      type={type}
      color="aurora"
      thickness={2.5}
      animated
    />
  </ConnectorGroup>
</div>`}
      >
        <TypeSwitchDemo />
      </DemoBlock>

      <DemoBlock
        title="数据 API: connections + ids"
        description="不写 JSX, 用一个数组配 ids 映射. 大批量 / 数据驱动场景."
        code={`<div ref={stageRef} style={{ position: 'relative', height: 320 }}>
  <ConnectorGroup
    container={stageRef}
    ids={{ root, a, b, c }}
    connections={[
      { from: 'root', to: ['a', 'b', 'c'], color: 'aurora', type: 'curve', animated: true },
      { from: 'a', to: 'b', color: '#f472b6', dashed: true, type: 'step' },
      { from: 'b', to: 'c', color: '#10b981', type: 'orthogonal', label: '依赖' },
    ]}
  >
    <div ref={root}>数据源</div>
    <div ref={a}>处理 A</div>
    <div ref={b}>处理 B</div>
    <div ref={c}>输出 C</div>
  </ConnectorGroup>
</div>`}
      >
        <DataApiDemo />
      </DemoBlock>

      <h2>API</h2>

      <h3>ConnectorGroup</h3>
      <ApiTable
        rows={[
          { prop: 'connections', desc: '数据形式的连接列表 (与子 Connector 共存)', type: 'ConnectorSpec[]', default: '-' },
          { prop: 'ids', desc: 'id 字符串 → element 映射, connections 里 from/to 用字符串引用', type: 'Record<string, AnchorRef>', default: '-' },
          { prop: 'defaultColor', desc: '默认配色', type: 'string | string[]', default: '主色' },
          { prop: 'defaultArrow', desc: '默认箭头', type: `'none' | 'start' | 'end' | 'both'`, default: `'end'` },
          { prop: 'defaultType', desc: '默认线形', type: `'curve' | 'step' | 'orthogonal' | 'straight'`, default: `'curve'` },
          { prop: 'container', desc: 'SVG 渲染容器 ref. 不传则 portal 到 body 用 fixed (跨视口)', type: 'RefObject<HTMLElement>', default: '-' },
        ]}
      />

      <h3>Connector / ConnectorSpec</h3>
      <ApiTable
        rows={[
          { prop: 'from', desc: '起点 (单个或数组)', type: 'AnchorRef | AnchorRef[]', default: '-' },
          { prop: 'to', desc: '终点 (单个或数组)', type: 'AnchorRef | AnchorRef[]', default: '-' },
          { prop: 'mode', desc: '多对多展开模式: mesh=笛卡尔积, pairs=一一配对', type: `'mesh' | 'pairs'`, default: `'mesh'` },
          { prop: 'type', desc: '线形', type: `'curve' | 'step' | 'orthogonal' | 'straight'`, default: '继承 group' },
          { prop: 'startSide', desc: '起点接出边 (auto 自动)', type: `'auto' | 'top' | 'right' | 'bottom' | 'left'`, default: `'auto'` },
          { prop: 'endSide', desc: '终点接入边', type: `'auto' | 'top' | 'right' | 'bottom' | 'left'`, default: `'auto'` },
          { prop: 'arrow', desc: '箭头', type: `'none' | 'start' | 'end' | 'both'`, default: '继承 group' },
          { prop: 'arrowSize', desc: '箭头尺寸', type: 'number', default: '8' },
          { prop: 'color', desc: '颜色 (字符串/数组渐变/预设 aurora/sunset/ocean/forest/cosmic)', type: 'string | string[]', default: '继承 group' },
          { prop: 'thickness', desc: '线宽 (px)', type: 'number', default: '2' },
          { prop: 'dashed', desc: '虚线', type: 'boolean', default: 'false' },
          { prop: 'animated', desc: '流动虚线 (像数据在跑)', type: 'boolean', default: 'false' },
          { prop: 'flow', desc: '沿线滚动的小圆点 (粒子). true / N / 自定义对象 { count, speed, size, color }', type: 'boolean | number | object', default: '-' },
          { prop: 'radius', desc: 'orthogonal 拐角半径', type: 'number', default: '12' },
          { prop: 'label', desc: '中点 label', type: 'ReactNode', default: '-' },
          { prop: 'offset', desc: '从锚点延伸的距离 (避免紧贴 dom 边)', type: 'number', default: '0' },
          { prop: 'zIndex', desc: '同 SVG 内 z 顺序', type: 'number', default: '0' },
        ]}
      />

      <h3>AnchorRef</h3>
      <p style={{ color: 'var(--au-text-2)', fontSize: 14 }}>
        <code>{'RefObject<Element> | Element | string'}</code> — 字符串可以是 group 的 ids 里的 key,
        或者 CSS selector (兜底).
      </p>
    </>
  );
};

/* ===================== Demos ===================== */

const BasicDemo: React.FC = () => {
  const refA = useRef<HTMLDivElement>(null);
  const refB = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  return (
    <div className="cd-stage" ref={stageRef}>
      <ConnectorGroup container={stageRef}>
        <Box ref={refA} style={{ left: 30, top: 40 }}>A</Box>
        <Box ref={refB} style={{ right: 30, top: 120 }}>B</Box>
        <Connector from={refA} to={refB} color="aurora" thickness={2.5} />
      </ConnectorGroup>
    </div>
  );
};

const OneToManyDemo: React.FC = () => {
  const root = useRef<HTMLDivElement>(null);
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  const c = useRef<HTMLDivElement>(null);
  const d = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  return (
    <div className="cd-stage cd-stage--tall" ref={stageRef}>
      <ConnectorGroup container={stageRef}>
        <Box ref={root} style={{ left: '50%', top: 30, transform: 'translateX(-50%)' }} variant="hub">
          Root
        </Box>
        <Box ref={a} style={{ left: '8%', bottom: 40 }}>子 A</Box>
        <Box ref={b} style={{ left: '32%', bottom: 40 }}>子 B</Box>
        <Box ref={c} style={{ right: '32%', bottom: 40 }}>子 C</Box>
        <Box ref={d} style={{ right: '8%', bottom: 40 }}>子 D</Box>
        <Connector
          from={root}
          to={[a, b, c, d]}
          type="curve"
          color="aurora"
          thickness={2}
          animated
        />
      </ConnectorGroup>
    </div>
  );
};

const MeshDemo: React.FC = () => {
  const a1 = useRef<HTMLDivElement>(null);
  const a2 = useRef<HTMLDivElement>(null);
  const a3 = useRef<HTMLDivElement>(null);
  const b1 = useRef<HTMLDivElement>(null);
  const b2 = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  return (
    <div className="cd-stage cd-stage--mesh" ref={stageRef}>
      <ConnectorGroup container={stageRef}>
        <Box ref={a1} style={{ left: 20, top: 20 }}>A1</Box>
        <Box ref={a2} style={{ left: 20, top: 110 }}>A2</Box>
        <Box ref={a3} style={{ left: 20, top: 200 }}>A3</Box>
        <Box ref={b1} style={{ right: 20, top: 60 }}>B1</Box>
        <Box ref={b2} style={{ right: 20, top: 170 }}>B2</Box>
        <Connector
          from={[a1, a2, a3]}
          to={[b1, b2]}
          mode="mesh"
          type="step"
          color={['#22d3ee', '#a855f7']}
          thickness={1.5}
        />
      </ConnectorGroup>
    </div>
  );
};

const DraggableDemo: React.FC = () => {
  const refA = useRef<HTMLDivElement>(null);
  const refB = useRef<HTMLDivElement>(null);
  const refC = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  return (
    <div className="cd-stage cd-stage--tall" ref={stageRef}>
      <ConnectorGroup container={stageRef}>
        <Draggable defaultPosition={{ x: 30, y: 30 }} bounds="parent">
          <Box ref={refA} variant="hub" style={{ position: 'relative' }}>
            拖我 A
          </Box>
        </Draggable>
        <Draggable defaultPosition={{ x: 240, y: 80 }} bounds="parent">
          <Box ref={refB} style={{ position: 'relative' }}>
            拖我 B
          </Box>
        </Draggable>
        <Draggable defaultPosition={{ x: 380, y: 200 }} bounds="parent">
          <Box ref={refC} style={{ position: 'relative' }}>
            拖我 C
          </Box>
        </Draggable>
        <Connector from={refA} to={[refB, refC]} type="orthogonal" color="aurora" animated />
        <Connector from={refB} to={refC} type="curve" color="#f472b6" dashed label="依赖" />
      </ConnectorGroup>
    </div>
  );
};

const TypeSwitchDemo: React.FC = () => {
  const [type, setType] = useState<ConnectorType>('curve');
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {(['curve', 'step', 'orthogonal', 'straight'] as ConnectorType[]).map((t) => (
          <Tag
            key={t}
            color={t === type ? 'primary' : 'default'}
            onClick={() => setType(t)}
            style={{ cursor: 'pointer' }}
          >
            {t}
          </Tag>
        ))}
      </div>
      <div className="cd-stage" ref={stageRef}>
        <ConnectorGroup container={stageRef}>
          <Box ref={a} style={{ left: 30, top: 30 }}>起点</Box>
          <Box ref={b} style={{ right: 30, bottom: 30 }}>终点</Box>
          <Connector
            from={a}
            to={b}
            type={type}
            color="aurora"
            thickness={2.5}
            animated
          />
        </ConnectorGroup>
      </div>
    </div>
  );
};

const DataApiDemo: React.FC = () => {
  const root = useRef<HTMLDivElement>(null);
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  const c = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  return (
    <div className="cd-stage cd-stage--tall" ref={stageRef}>
      <ConnectorGroup
        container={stageRef}
        ids={{ root, a, b, c }}
        connections={[
          { from: 'root', to: ['a', 'b', 'c'], color: 'aurora', type: 'curve', animated: true },
          { from: 'a', to: 'b', color: '#f472b6', dashed: true, type: 'step' },
          { from: 'b', to: 'c', color: '#10b981', type: 'orthogonal', label: '依赖' },
        ]}
      >
        <Box ref={root} style={{ left: '50%', top: 20, transform: 'translateX(-50%)' }} variant="hub">
          数据源
        </Box>
        <Box ref={a} style={{ left: '10%', bottom: 30 }}>处理 A</Box>
        <Box ref={b} style={{ left: '50%', bottom: 30, transform: 'translateX(-50%)' }}>处理 B</Box>
        <Box ref={c} style={{ right: '10%', bottom: 30 }}>输出 C</Box>
      </ConnectorGroup>
    </div>
  );
};

/* ===================== 小积木: Box ===================== */

/* ===================== Network Topology 节点 ===================== */

type NetTier = 'edge' | 'gateway' | 'web' | 'service' | 'data';

interface NetNodeProps {
  tier: NetTier;
  icon: string;
  title: string;
  sub?: string;
  /** 实时状态指示 (live/danger 等) */
  pulse?: 'live' | 'danger' | 'warning';
  pos: { left: number; top: number };
}

const TIER_CFG: Record<NetTier, { glow: string; label: string }> = {
  edge:    { glow: '#22d3ee', label: 'Edge' },
  gateway: { glow: '#a855f7', label: 'Gateway' },
  web:     { glow: '#6366f1', label: 'Web Tier' },
  service: { glow: '#f472b6', label: 'Service Tier' },
  data:    { glow: '#10b981', label: 'Data Tier' },
};

const NetNode = React.forwardRef<HTMLDivElement, NetNodeProps>(
  ({ tier, icon, title, sub, pulse, pos }, ref) => {
    const cfg = TIER_CFG[tier];
    return (
      <div
        ref={ref}
        className={`net-node net-node--${tier}`}
        style={{ position: 'absolute', ...pos }}
      >
        <GlowCard glowColor={cfg.glow} intensity={0.65} padding="14px 18px" radius={12}>
          <div className="net-node__row">
            <div className="net-node__icon" style={{ color: cfg.glow }}>
              <Icon name={icon} size={22} />
            </div>
            <div className="net-node__text">
              <strong>{title}</strong>
              {sub && <span>{sub}</span>}
            </div>
            {pulse && <PulseDot status={pulse} size={7} />}
          </div>
        </GlowCard>
      </div>
    );
  },
);
NetNode.displayName = 'NetNode';

/* ===================== Network Topology Demo ===================== */

const NetworkTopologyDemo: React.FC = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  // Edge tier
  const inet = useRef<HTMLDivElement>(null);
  const fw = useRef<HTMLDivElement>(null);
  // Gateway
  const lb = useRef<HTMLDivElement>(null);
  // Web tier (3)
  const web1 = useRef<HTMLDivElement>(null);
  const web2 = useRef<HTMLDivElement>(null);
  const web3 = useRef<HTMLDivElement>(null);
  // Service tier (2)
  const app1 = useRef<HTMLDivElement>(null);
  const app2 = useRef<HTMLDivElement>(null);
  // Data tier (master + replica)
  const dbm = useRef<HTMLDivElement>(null);
  const dbr = useRef<HTMLDivElement>(null);

  return (
    <div ref={stageRef} className="cd-net-stage">
      <ConnectorGroup container={stageRef} defaultArrow="end" defaultType="step">
        {/* Tier 标签 (装饰用) */}
        <div className="net-tier-label" style={{ top: 50 }}>EDGE</div>
        <div className="net-tier-label" style={{ top: 310 }}>GATEWAY</div>
        <div className="net-tier-label" style={{ top: 450 }}>WEB</div>
        <div className="net-tier-label" style={{ top: 590 }}>SERVICE</div>
        <div className="net-tier-label" style={{ top: 730 }}>DATA</div>

        {/* Edge */}
        <NetNode
          ref={inet}
          tier="edge"
          icon="earth"
          title="Internet"
          sub="公网入口"
          pos={{ left: 370, top: 40 }}
        />
        <NetNode
          ref={fw}
          tier="edge"
          icon="lock"
          title="Firewall · WAF"
          sub="HTTPS 终结 + DDoS"
          pulse="warning"
          pos={{ left: 360, top: 160 }}
        />

        {/* Gateway */}
        <NetNode
          ref={lb}
          tier="gateway"
          icon="connections"
          title="Load Balancer"
          sub="L7 流量分发"
          pulse="live"
          pos={{ left: 358, top: 300 }}
        />

        {/* Web (3 个) */}
        <NetNode
          ref={web1}
          tier="web"
          icon="monitor"
          title="Web · 01"
          sub="nginx-1.27"
          pulse="live"
          pos={{ left: 80, top: 440 }}
        />
        <NetNode
          ref={web2}
          tier="web"
          icon="monitor"
          title="Web · 02"
          sub="nginx-1.27"
          pulse="live"
          pos={{ left: 380, top: 440 }}
        />
        <NetNode
          ref={web3}
          tier="web"
          icon="monitor"
          title="Web · 03"
          sub="nginx-1.27"
          pulse="danger"
          pos={{ left: 680, top: 440 }}
        />

        {/* Service (2 个) */}
        <NetNode
          ref={app1}
          tier="service"
          icon="application-record"
          title="App Service A"
          sub="node 20.x · :8080"
          pulse="live"
          pos={{ left: 200, top: 580 }}
        />
        <NetNode
          ref={app2}
          tier="service"
          icon="application-record"
          title="App Service B"
          sub="node 20.x · :8080"
          pulse="live"
          pos={{ left: 560, top: 580 }}
        />

        {/* Data */}
        <NetNode
          ref={dbm}
          tier="data"
          icon="folder"
          title="DB · Master"
          sub="postgres-16 · rw"
          pulse="live"
          pos={{ left: 200, top: 720 }}
        />
        <NetNode
          ref={dbr}
          tier="data"
          icon="folder"
          title="DB · Replica"
          sub="postgres-16 · ro"
          pulse="live"
          pos={{ left: 560, top: 720 }}
        />

        {/* === 连线: 全部 step 直角折线, 网络拓扑标准画法 === */}

        {/* Edge → Gateway 主链路 — 沿线跑数据包 */}
        <Connector
          from={inet}
          to={fw}
          color="aurora"
          thickness={2.5}
          animated
          flow={{ count: 2, speed: 2, size: 4 }}
          label="HTTPS"
        />
        <Connector
          from={fw}
          to={lb}
          color="aurora"
          thickness={2.5}
          animated
          flow={{ count: 2, speed: 1.6, size: 4 }}
        />

        {/* Gateway → Web: 1-to-many 扇出 + 多包并行 */}
        <Connector
          from={lb}
          to={[web1, web2, web3]}
          color={['#a855f7', '#22d3ee']}
          thickness={2}
          animated
          flow={3}
        />

        {/* Web → Service: mesh 3×2 网状 */}
        <Connector
          from={[web1, web2, web3]}
          to={[app1, app2]}
          mode="mesh"
          color="#6366f1"
          thickness={1.5}
        />

        {/* Service → Data Master: many-to-one (读写) */}
        <Connector
          from={[app1, app2]}
          to={dbm}
          color="#10b981"
          thickness={2}
          label="读写"
        />

        {/* Service → Data Replica: many-to-one (只读, 虚线) */}
        <Connector
          from={[app1, app2]}
          to={dbr}
          color="#10b981"
          thickness={1.5}
          dashed
          label="只读"
        />

        {/* Master ↔ Replica: 主从同步 双向箭头 流动虚线 + 同步包 */}
        <Connector
          from={dbm}
          to={dbr}
          startSide="right"
          endSide="left"
          arrow="both"
          color={['#a855f7', '#10b981']}
          thickness={2}
          dashed
          animated
          flow={{ count: 2, speed: 3, size: 3, color: '#a855f7' }}
          label="主从同步"
        />
      </ConnectorGroup>
    </div>
  );
};

const TOPOLOGY_CODE = `// 注意: NetNode 不是 aurora-ux 导出的组件,
// 是这个 demo 本地写的 GlowCard + Icon + PulseDot 包装. 复制下面定义即可用.

import { GlowCard, Icon, PulseDot, ConnectorGroup, Connector } from 'aurora-ux';
import { forwardRef, useRef } from 'react';

const TIER = {
  edge:    '#22d3ee',
  gateway: '#a855f7',
  web:     '#6366f1',
  service: '#f472b6',
  data:    '#10b981',
};

const NetNode = forwardRef(({ tier, icon, title, sub, pulse, pos }, ref) => (
  <div ref={ref} style={{ position: 'absolute', ...pos }}>
    <GlowCard glowColor={TIER[tier]} intensity={0.65} padding="14px 18px" radius={12}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Icon name={icon} size={22} style={{ color: TIER[tier] }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <strong>{title}</strong>
          {sub && <span style={{ fontSize: 11, opacity: 0.6 }}>{sub}</span>}
        </div>
        {pulse && <PulseDot status={pulse} size={7} />}
      </div>
    </GlowCard>
  </div>
));

// === 然后用法 (defaultType="step" 让所有线默认走直角折线, 网络拓扑标准画法) ===
const stageRef = useRef(null);
const inet = useRef(null), fw = useRef(null), lb = useRef(null);
const web1 = useRef(null), web2 = useRef(null), web3 = useRef(null);
const app1 = useRef(null), app2 = useRef(null);
const dbm = useRef(null), dbr = useRef(null);

<div ref={stageRef} style={{ position: 'relative', height: 880 }}>
  <ConnectorGroup container={stageRef} defaultArrow="end" defaultType="step">
    <NetNode ref={inet} tier="edge"    icon="earth"       title="Internet"      pos={{ left: 370, top: 40 }} />
    <NetNode ref={fw}   tier="edge"    icon="lock"        title="Firewall"      pulse="warning" pos={{ left: 360, top: 160 }} />
    <NetNode ref={lb}   tier="gateway" icon="connections" title="Load Balancer" pulse="live"    pos={{ left: 358, top: 300 }} />
    <NetNode ref={web1} tier="web"     icon="monitor"     title="Web · 01" pulse="live"   pos={{ left: 80,  top: 440 }} />
    <NetNode ref={web2} tier="web"     icon="monitor"     title="Web · 02" pulse="live"   pos={{ left: 380, top: 440 }} />
    <NetNode ref={web3} tier="web"     icon="monitor"     title="Web · 03" pulse="danger" pos={{ left: 680, top: 440 }} />
    <NetNode ref={app1} tier="service" icon="application-record" title="App A" pos={{ left: 200, top: 580 }} />
    <NetNode ref={app2} tier="service" icon="application-record" title="App B" pos={{ left: 560, top: 580 }} />
    <NetNode ref={dbm}  tier="data"    icon="folder" title="DB Master"  pos={{ left: 200, top: 720 }} />
    <NetNode ref={dbr}  tier="data"    icon="folder" title="DB Replica" pos={{ left: 560, top: 720 }} />

    {/* 连线: 全部 step 直角, 主链路 → 1-to-many → mesh → many-to-one → 主从双向 */}
    <Connector from={inet} to={fw} color="aurora" animated label="HTTPS" />
    <Connector from={fw}   to={lb} color="aurora" animated />
    <Connector from={lb}   to={[web1, web2, web3]} color={['#a855f7', '#22d3ee']} animated />
    <Connector from={[web1, web2, web3]} to={[app1, app2]} mode="mesh" color="#6366f1" />
    <Connector from={[app1, app2]} to={dbm} color="#10b981" label="读写" />
    <Connector from={[app1, app2]} to={dbr} color="#10b981" dashed label="只读" />
    <Connector from={dbm} to={dbr} arrow="both" dashed animated
               startSide="right" endSide="left"
               color={['#a855f7', '#10b981']} label="主从同步" />
  </ConnectorGroup>
</div>`;


const Box = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; style?: React.CSSProperties; variant?: 'default' | 'hub' }
>(({ children, style, variant = 'default' }, ref) => {
  // ref 必须指向定位 + 含尺寸的外层 div, 否则连线锚点会贴到内部文字框
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        minWidth: 96,
        textAlign: 'center',
        fontSize: 13,
        fontWeight: 600,
        ...style,
      }}
    >
      <GlowCard
        glowColor={variant === 'hub' ? '#a855f7' : 'var(--au-primary)'}
        intensity={variant === 'hub' ? 0.7 : 0.4}
        padding={12}
        radius={10}
      >
        {children}
      </GlowCard>
    </div>
  );
});
Box.displayName = 'Box';

export default ConnectorDoc;
