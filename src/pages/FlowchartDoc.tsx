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

const FlowchartDoc: React.FC = () => {
  return (
    <>
      <h1>流程图 / 工作流</h1>
      <p>
        条件分支、驳回回流、状态机这种流程图场景: 节点是判断和动作, 连线带 label
        说明走哪条分支. 用 step 折线 + orthogonal U 型回流, 视觉上读得懂"主流程在哪 / 异常去哪".
      </p>

      <DemoBlock
        title="订单审批流"
        description="主流程: 提交 → 直属 → 部门 → 财务 → 完成. 异常分支: 驳回归档 / 驳回修改后回流到提交. 4 种状态用不同色调 (绿=通过 / 橙=驳回需修改 / 红=最终驳回 / 灰=回流)."
        code={CODE}
      >
        <ApprovalFlow />
      </DemoBlock>
    </>
  );
};

const ApprovalFlow: React.FC = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const submit = useRef<HTMLDivElement>(null);
  const reviewLead = useRef<HTMLDivElement>(null);
  const reviewDept = useRef<HTMLDivElement>(null);
  const reviewFin = useRef<HTMLDivElement>(null);
  const done = useRef<HTMLDivElement>(null);
  const fix = useRef<HTMLDivElement>(null);
  const reject = useRef<HTMLDivElement>(null);

  return (
    <div ref={stageRef} className="diag-stage diag-stage--flowchart">
      <ConnectorGroup container={stageRef} defaultArrow="end" defaultType="step">
        {/* 主流程 (左栏) */}
        <FNode ref={submit} kind="start" pos={{ left: 130, top: 30 }} title="提交申请" icon="add" />
        <FNode ref={reviewLead} kind="decision" pos={{ left: 110, top: 140 }} title="直属审批" />
        <FNode ref={reviewDept} kind="decision" pos={{ left: 110, top: 270 }} title="部门审批" />
        <FNode ref={reviewFin} kind="decision" pos={{ left: 110, top: 400 }} title="财务审批" />
        <FNode ref={done} kind="end-ok" pos={{ left: 154, top: 530 }} title="完成" icon="catalog-check" />

        {/* 异常分支 (右栏) */}
        <FNode ref={fix} kind="warn" pos={{ left: 480, top: 140 }} title="修改重提" icon="edit" />
        <FNode ref={reject} kind="end-fail" pos={{ left: 500, top: 270 }} title="驳回归档" icon="delete" />

        {/* 主路径 */}
        <Connector from={submit} to={reviewLead} color="aurora" thickness={2.5} animated />
        <Connector from={reviewLead} to={reviewDept} color="#10b981" thickness={2} label="通过" />
        <Connector from={reviewDept} to={reviewFin} color="#10b981" thickness={2} label="通过" />
        <Connector from={reviewFin} to={done} color="#10b981" thickness={2.5} label="通过" />

        {/* 驳回 — 修改重提 */}
        <Connector
          from={reviewLead}
          to={fix}
          startSide="right"
          endSide="left"
          color="#f59e0b"
          thickness={2}
          dashed
          label="驳回"
        />

        {/* 回流 (orthogonal U 型) */}
        <Connector
          from={fix}
          to={submit}
          type="orthogonal"
          startSide="top"
          endSide="right"
          color="#9ca3af"
          thickness={1.5}
          dashed
          animated
          label="重新提交"
        />

        {/* 部门驳回 → 归档 */}
        <Connector
          from={reviewDept}
          to={reject}
          startSide="right"
          endSide="left"
          color="#ef4444"
          thickness={2}
          label="驳回"
        />
      </ConnectorGroup>
    </div>
  );
};

/* === 节点 helper === */
type FKind = 'start' | 'end-ok' | 'end-fail' | 'decision' | 'process' | 'warn';
const FCFG: Record<FKind, { glow: string; pill: boolean; pulse?: 'live' | 'warning' | 'danger'; defaultIcon?: string }> = {
  start: { glow: '#10b981', pill: true },
  'end-ok': { glow: '#10b981', pill: true, pulse: 'live' },
  'end-fail': { glow: '#ef4444', pill: true },
  decision: { glow: '#f59e0b', pill: false, defaultIcon: 'help' },
  process: { glow: '#6366f1', pill: false },
  warn: { glow: '#f59e0b', pill: false },
};

interface FNodeProps {
  kind: FKind;
  title: string;
  icon?: string;
  pos: React.CSSProperties;
}
const FNode = React.forwardRef<HTMLDivElement, FNodeProps>(({ kind, title, icon, pos }, ref) => {
  const cfg = FCFG[kind];
  const finalIcon = icon ?? cfg.defaultIcon;
  return (
    <div ref={ref} style={{ position: 'absolute', ...pos }}>
      <GlowCard
        glowColor={cfg.glow}
        intensity={0.6}
        padding={cfg.pill ? '6px 18px' : '12px 18px'}
        radius={cfg.pill ? 999 : 12}
      >
        <div className="diag-node-row">
          {finalIcon && <Icon name={finalIcon} size={cfg.pill ? 13 : 16} style={{ color: cfg.glow }} />}
          <span>{title}</span>
          {cfg.pulse && <PulseDot status={cfg.pulse} size={6} />}
        </div>
      </GlowCard>
    </div>
  );
});
FNode.displayName = 'FNode';

const CODE = `<ConnectorGroup container={stageRef} defaultArrow="end" defaultType="step">
  {/* 主流程节点 */}
  <FNode ref={submit}     kind="start"    pos={{ left: 130, top: 30 }}  title="提交申请" />
  <FNode ref={reviewLead} kind="decision" pos={{ left: 110, top: 140 }} title="直属审批" />
  <FNode ref={reviewDept} kind="decision" pos={{ left: 110, top: 270 }} title="部门审批" />
  <FNode ref={reviewFin}  kind="decision" pos={{ left: 110, top: 400 }} title="财务审批" />
  <FNode ref={done}       kind="end-ok"   pos={{ left: 154, top: 530 }} title="完成" />
  {/* 异常分支 */}
  <FNode ref={fix}    kind="warn"     pos={{ left: 480, top: 140 }} title="修改重提" />
  <FNode ref={reject} kind="end-fail" pos={{ left: 500, top: 270 }} title="驳回归档" />

  {/* 主路径 */}
  <Connector from={submit}     to={reviewLead} color="aurora"  animated />
  <Connector from={reviewLead} to={reviewDept} color="#10b981" label="通过" />
  <Connector from={reviewDept} to={reviewFin}  color="#10b981" label="通过" />
  <Connector from={reviewFin}  to={done}       color="#10b981" label="通过" />

  {/* 驳回分支 */}
  <Connector from={reviewLead} to={fix}    color="#f59e0b" dashed label="驳回"
             startSide="right" endSide="left" />
  <Connector from={reviewDept} to={reject} color="#ef4444"        label="驳回"
             startSide="right" endSide="left" />

  {/* 回流: orthogonal U 型 */}
  <Connector from={fix} to={submit} type="orthogonal" color="#9ca3af"
             dashed animated label="重新提交"
             startSide="top" endSide="right" />
</ConnectorGroup>`;

export default FlowchartDoc;
