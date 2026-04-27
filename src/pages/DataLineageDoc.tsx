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

const DataLineageDoc: React.FC = () => {
  return (
    <>
      <h1>数据血缘 / Data Lineage</h1>
      <p>
        数据从源头到消费的全链路追溯: 业务系统 → 采集 → 数据湖 → 数仓 ETL →
        宽表 → 报表/AI 模型. 横向多 hop 是这种图的特征, 用 step 折线让"流向"
        极其清晰, 节点按"层"上色 (源头蓝 / 处理紫 / 仓库绿 / 消费金).
      </p>

      <DemoBlock
        title="电商数据血缘"
        description="左到右流向: 业务库 + 埋点 → CDC/Kafka → 数据湖 → ETL 加工 → 宽表 → BI 报表 / 推荐模型 / 风控。 每层一种主色, 中间 ETL 用流动虚线标记数据正在跑, 异常的链路用红色提示."
        code={CODE}
      >
        <Lineage />
      </DemoBlock>
    </>
  );
};

const Lineage: React.FC = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  // 源头
  const dbOrders = useRef<HTMLDivElement>(null);
  const dbUsers = useRef<HTMLDivElement>(null);
  const evt = useRef<HTMLDivElement>(null);
  // 采集
  const cdc = useRef<HTMLDivElement>(null);
  // 湖
  const lake = useRef<HTMLDivElement>(null);
  // ETL
  const etlOrder = useRef<HTMLDivElement>(null);
  const etlUser = useRef<HTMLDivElement>(null);
  // 仓库 (宽表)
  const dwh = useRef<HTMLDivElement>(null);
  // 消费
  const bi = useRef<HTMLDivElement>(null);
  const reco = useRef<HTMLDivElement>(null);
  const risk = useRef<HTMLDivElement>(null);

  return (
    <div ref={stageRef} className="diag-stage diag-stage--lineage">
      <ConnectorGroup container={stageRef} defaultArrow="end" defaultType="step">
        {/* L1 源头 */}
        <LNode ref={dbOrders} color="#0ea5e9" icon="folder" title="orders DB"
               sub="postgres" pos={{ left: 30, top: 30 }} />
        <LNode ref={dbUsers} color="#0ea5e9" icon="folder" title="users DB"
               sub="mysql" pos={{ left: 30, top: 130 }} />
        <LNode ref={evt} color="#0ea5e9" icon="charts-curve" title="埋点事件"
               sub="kafka topic" pos={{ left: 30, top: 230 }} />

        {/* L2 采集 */}
        <LNode ref={cdc} color="#a855f7" icon="connections" title="CDC + Kafka"
               sub="binlog → topic" pulse="live" pos={{ left: 220, top: 130 }} />

        {/* L3 湖 */}
        <LNode ref={lake} color="#6366f1" icon="catalog" title="Data Lake"
               sub="iceberg / s3" pos={{ left: 380, top: 130 }} />

        {/* L4 ETL */}
        <LNode ref={etlOrder} color="#f59e0b" icon="settings" title="dwd_orders"
               sub="spark · daily" pulse="warning" pos={{ left: 540, top: 60 }} />
        <LNode ref={etlUser} color="#f59e0b" icon="settings" title="dwd_users"
               sub="spark · daily" pos={{ left: 540, top: 200 }} />

        {/* L5 宽表 */}
        <LNode ref={dwh} color="#10b981" icon="folder" title="dws_user_order"
               sub="宽表 · 30 列" pulse="live" pos={{ left: 720, top: 130 }} />

        {/* L6 消费 */}
        <LNode ref={bi} color="#fbbf24" icon="charts-bar" title="BI 报表"
               sub="metabase" pos={{ left: 880, top: 30 }} />
        <LNode ref={reco} color="#fbbf24" icon="application-record" title="推荐模型"
               sub="model v3.2" pos={{ left: 880, top: 130 }} />
        <LNode ref={risk} color="#ef4444" icon="trade-alert" title="风控"
               sub="异常分支" pulse="danger" pos={{ left: 880, top: 230 }} />

        {/* === 流向连线 === */}

        {/* 源头 → CDC */}
        <Connector from={[dbOrders, dbUsers, evt]} to={cdc}
                   color="#0ea5e9" thickness={1.5} animated />

        {/* CDC → Lake */}
        <Connector from={cdc} to={lake}
                   color="#a855f7" thickness={2} animated label="ingest" />

        {/* Lake → ETL */}
        <Connector from={lake} to={[etlOrder, etlUser]}
                   color="#6366f1" thickness={1.5} dashed animated label="ETL" />

        {/* ETL → DWH (宽表) */}
        <Connector from={[etlOrder, etlUser]} to={dwh}
                   color="#f59e0b" thickness={2} />

        {/* DWH → 消费 */}
        <Connector from={dwh} to={[bi, reco, risk]}
                   color={['#10b981', '#fbbf24']} thickness={1.5} animated />
      </ConnectorGroup>
    </div>
  );
};

interface LNodeProps {
  color: string;
  icon: string;
  title: string;
  sub?: string;
  pulse?: 'live' | 'warning' | 'danger';
  pos: React.CSSProperties;
}
const LNode = React.forwardRef<HTMLDivElement, LNodeProps>(
  ({ color, icon, title, sub, pulse, pos }, ref) => (
    <div ref={ref} style={{ position: 'absolute', ...pos }}>
      <GlowCard glowColor={color} intensity={0.55} padding="10px 14px" radius={10}>
        <div className="diag-node-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
            <Icon name={icon} size={15} style={{ color }} />
            <strong>{title}</strong>
            {pulse && <PulseDot status={pulse} size={6} />}
          </div>
          {sub && <span style={{ fontSize: 10.5, color: 'var(--au-text-3)', fontFamily: "'SF Mono', Menlo, monospace" }}>{sub}</span>}
        </div>
      </GlowCard>
    </div>
  ),
);
LNode.displayName = 'LNode';

const CODE = `<ConnectorGroup container={stageRef} defaultArrow="end" defaultType="step">
  {/* L1 源头 (蓝) */}
  <LNode ref={dbOrders} color="#0ea5e9" icon="folder"        title="orders DB" />
  <LNode ref={dbUsers}  color="#0ea5e9" icon="folder"        title="users DB" />
  <LNode ref={evt}      color="#0ea5e9" icon="charts-curve"  title="埋点事件" />

  {/* L2-3 采集与湖 (紫/靛) */}
  <LNode ref={cdc}  color="#a855f7" icon="connections" title="CDC + Kafka" pulse="live" />
  <LNode ref={lake} color="#6366f1" icon="catalog"     title="Data Lake" />

  {/* L4 ETL (橙) */}
  <LNode ref={etlOrder} color="#f59e0b" icon="settings" title="dwd_orders" pulse="warning" />
  <LNode ref={etlUser}  color="#f59e0b" icon="settings" title="dwd_users" />

  {/* L5 宽表 (绿) */}
  <LNode ref={dwh} color="#10b981" icon="folder" title="dws_user_order" pulse="live" />

  {/* L6 消费 (金 / 红) */}
  <LNode ref={bi}   color="#fbbf24" icon="charts-bar"        title="BI 报表" />
  <LNode ref={reco} color="#fbbf24" icon="application-record" title="推荐模型" />
  <LNode ref={risk} color="#ef4444" icon="trade-alert"       title="风控" pulse="danger" />

  {/* 流向 (左→右) */}
  <Connector from={[dbOrders, dbUsers, evt]} to={cdc} color="#0ea5e9" animated />
  <Connector from={cdc} to={lake} color="#a855f7" animated label="ingest" />
  <Connector from={lake} to={[etlOrder, etlUser]} color="#6366f1" dashed animated label="ETL" />
  <Connector from={[etlOrder, etlUser]} to={dwh} color="#f59e0b" />
  <Connector from={dwh} to={[bi, reco, risk]} color={['#10b981', '#fbbf24']} animated />
</ConnectorGroup>`;

export default DataLineageDoc;
