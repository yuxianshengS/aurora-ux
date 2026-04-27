import React, { useRef } from 'react';
import {
  ConnectorGroup,
  Connector,
  GlowCard,
  Icon,
  PulseDot,
} from '../components';
import DemoBlock from '../site-components/DemoBlock';
import './diagram-pages.css';

const DependencyGraphDoc: React.FC = () => {
  return (
    <>
      <h1>依赖关系图 / 微服务调用</h1>
      <p>
        节点之间的"谁调用谁 / 谁依赖谁"关系。多对多扇出 + 跨层级调用 + 第三方
        外部依赖。这种图特点是连线密集会交叉, 用 step 折线 + 不同色调区分调用类型,
        视觉上能读出"瓶颈在哪里 / 哪个服务最关键".
      </p>

      <DemoBlock
        title="电商微服务调用图"
        description="API Gateway 接入, 5 个核心服务相互调用, 共享 Redis 缓存 + Postgres 数据. 同步调用紫线, 异步消息粉色虚线流动 (代表 MQ), 缓存读绿色, DB 读靛色."
        code={CODE}
      >
        <DepGraph />
      </DemoBlock>
    </>
  );
};

const DepGraph: React.FC = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const gw = useRef<HTMLDivElement>(null);
  const userSvc = useRef<HTMLDivElement>(null);
  const orderSvc = useRef<HTMLDivElement>(null);
  const paySvc = useRef<HTMLDivElement>(null);
  const inventorySvc = useRef<HTMLDivElement>(null);
  const notifySvc = useRef<HTMLDivElement>(null);
  const redis = useRef<HTMLDivElement>(null);
  const pg = useRef<HTMLDivElement>(null);
  const mq = useRef<HTMLDivElement>(null);

  return (
    <div ref={stageRef} className="diag-stage diag-stage--depgraph">
      <ConnectorGroup container={stageRef} defaultArrow="end" defaultType="step">
        {/* L1: Gateway */}
        <DNode
          ref={gw}
          color="#22d3ee"
          icon="connections"
          title="API Gateway"
          sub="kong / nginx"
          pulse="live"
          pos={{ left: 360, top: 30 }}
        />

        {/* L2: 5 个微服务 (横排) */}
        <DNode ref={userSvc} color="#6366f1" icon="customer" title="User"
               sub=":4001" pos={{ left: 30, top: 180 }} />
        <DNode ref={orderSvc} color="#a855f7" icon="order" title="Order"
               sub=":4002" pulse="live" pos={{ left: 200, top: 180 }} />
        <DNode ref={paySvc} color="#f472b6" icon="checkstand" title="Payment"
               sub=":4003" pos={{ left: 380, top: 180 }} />
        <DNode ref={inventorySvc} color="#10b981" icon="product" title="Inventory"
               sub=":4004" pos={{ left: 560, top: 180 }} />
        <DNode ref={notifySvc} color="#fb923c" icon="message-comments" title="Notification"
               sub=":4005" pulse="warning" pos={{ left: 740, top: 180 }} />

        {/* L3: 基础设施 (横排) */}
        <DNode ref={redis} color="#ef4444" icon="charts-bar" title="Redis"
               sub="cache · 6379" pos={{ left: 80, top: 380 }} />
        <DNode ref={pg} color="#10b981" icon="folder" title="Postgres"
               sub="primary · 5432" pulse="live" pos={{ left: 360, top: 380 }} />
        <DNode ref={mq} color="#a855f7" icon="message-comments" title="RabbitMQ"
               sub="exchange · 5672" pos={{ left: 640, top: 380 }} />

        {/* === 连线 === */}

        {/* Gateway → 5 服务 (HTTP RPC) */}
        <Connector
          from={gw}
          to={[userSvc, orderSvc, paySvc, inventorySvc, notifySvc]}
          color={['#22d3ee', '#a855f7']}
          thickness={2}
          animated
        />

        {/* 服务间调用 (RPC) */}
        <Connector
          from={orderSvc}
          to={[userSvc, paySvc, inventorySvc]}
          color="#a855f7"
          thickness={1.5}
        />

        {/* Order / Payment / Inventory → DB */}
        <Connector from={[orderSvc, paySvc, inventorySvc]} to={pg}
                   color="#10b981" thickness={1.5} label="读写" />

        {/* User → Redis (缓存) */}
        <Connector from={userSvc} to={redis} color="#ef4444"
                   thickness={1.5} label="cache" />

        {/* Order/Payment → MQ (异步消息) */}
        <Connector from={[orderSvc, paySvc]} to={mq}
                   color="#a855f7" thickness={1.5} dashed animated label="async" />

        {/* MQ → Notification (事件订阅) */}
        <Connector from={mq} to={notifySvc} type="orthogonal"
                   startSide="top" endSide="bottom"
                   color="#fb923c" thickness={1.5} dashed animated />
      </ConnectorGroup>
    </div>
  );
};

interface DNodeProps {
  color: string;
  icon: string;
  title: string;
  sub?: string;
  pulse?: 'live' | 'warning' | 'danger';
  pos: React.CSSProperties;
}
const DNode = React.forwardRef<HTMLDivElement, DNodeProps>(
  ({ color, icon, title, sub, pulse, pos }, ref) => (
    <div ref={ref} style={{ position: 'absolute', ...pos }}>
      <GlowCard glowColor={color} intensity={0.6} padding="12px 16px" radius={12}>
        <div className="diag-node-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name={icon} size={18} style={{ color }} />
            <strong>{title}</strong>
            {pulse && <PulseDot status={pulse} size={6} />}
          </div>
          {sub && <span style={{ fontSize: 11, color: 'var(--au-text-3)', fontFamily: "'SF Mono', Menlo, monospace" }}>{sub}</span>}
        </div>
      </GlowCard>
    </div>
  ),
);
DNode.displayName = 'DNode';

const CODE = `<ConnectorGroup container={stageRef} defaultArrow="end" defaultType="step">
  {/* L1 入口 */}
  <DNode ref={gw} color="#22d3ee" icon="connections" title="API Gateway" pulse="live" />

  {/* L2 微服务 (5 个横排) */}
  <DNode ref={userSvc}      color="#6366f1" icon="customer"   title="User" />
  <DNode ref={orderSvc}     color="#a855f7" icon="order"      title="Order" pulse="live" />
  <DNode ref={paySvc}       color="#f472b6" icon="checkstand" title="Payment" />
  <DNode ref={inventorySvc} color="#10b981" icon="product"    title="Inventory" />
  <DNode ref={notifySvc}    color="#fb923c" icon="message-comments" title="Notification" pulse="warning" />

  {/* L3 基础设施 */}
  <DNode ref={redis} color="#ef4444" icon="charts-bar"     title="Redis" />
  <DNode ref={pg}    color="#10b981" icon="folder"         title="Postgres" pulse="live" />
  <DNode ref={mq}    color="#a855f7" icon="message-comments" title="RabbitMQ" />

  {/* HTTP 入口扇出 */}
  <Connector from={gw} to={[userSvc, orderSvc, paySvc, inventorySvc, notifySvc]}
             color={['#22d3ee', '#a855f7']} animated />

  {/* RPC 服务调用 */}
  <Connector from={orderSvc} to={[userSvc, paySvc, inventorySvc]}
             color="#a855f7" />

  {/* 数据库读写 */}
  <Connector from={[orderSvc, paySvc, inventorySvc]} to={pg}
             color="#10b981" label="读写" />

  {/* 缓存 */}
  <Connector from={userSvc} to={redis} color="#ef4444" label="cache" />

  {/* 异步消息 */}
  <Connector from={[orderSvc, paySvc]} to={mq} color="#a855f7"
             dashed animated label="async" />
  <Connector from={mq} to={notifySvc} type="orthogonal"
             startSide="top" endSide="bottom"
             color="#fb923c" dashed animated />
</ConnectorGroup>`;

export default DependencyGraphDoc;
