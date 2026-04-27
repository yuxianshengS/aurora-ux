import React, { useRef, useState } from 'react';
import {
  ConnectorGroup,
  Connector,
  Draggable,
  GlowCard,
  Tag,
  Icon,
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
        title="实战: 订单履约流程图"
        description="10 节点真实电商场景: 开始 → 接收订单 → 库存判断 → 创建支付 → 支付判断 → 发货 → 完成. 失败路径单独走右栏, 支付失败回到等待重试再循环回创建支付单. 节点用 GlowCard 按语义着色 (蓝=流程, 橙=判断, 绿=成功端, 红=失败端). 连线极光渐变 + 流动虚线 + 中点 label."
        code={FLOWCHART_CODE}
      >
        <FlowchartDemo />
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

/* ===================== Flowchart 节点 ===================== */

type FlowNodeKind =
  | 'start'
  | 'end-ok'
  | 'end-fail'
  | 'process'
  | 'process-danger'
  | 'process-soft'
  | 'decision';

interface FlowNodeProps {
  kind: FlowNodeKind;
  icon?: string;
  pos: { left?: number | string; right?: number | string; top: number };
  children: React.ReactNode;
}

const NODE_CFG: Record<FlowNodeKind, { glow: string; pill: boolean; defaultIcon?: string }> = {
  'start': { glow: '#10b981', pill: true },
  'end-ok': { glow: '#10b981', pill: true, defaultIcon: 'catalog-check' },
  'end-fail': { glow: '#ef4444', pill: true, defaultIcon: 'delete' },
  'process': { glow: '#6366f1', pill: false },
  'process-danger': { glow: '#ef4444', pill: false, defaultIcon: 'trade-alert' },
  'process-soft': { glow: '#9ca3af', pill: false, defaultIcon: 'return' },
  'decision': { glow: '#f59e0b', pill: false, defaultIcon: 'help' },
};

const FlowNode = React.forwardRef<HTMLDivElement, FlowNodeProps>(
  ({ kind, icon, pos, children }, ref) => {
    const cfg = NODE_CFG[kind];
    const finalIcon = icon ?? cfg.defaultIcon;
    return (
      <div
        ref={ref}
        className={`flow-node flow-node--${kind}`}
        style={{ position: 'absolute', ...pos }}
      >
        <GlowCard
          glowColor={cfg.glow}
          intensity={0.6}
          padding={cfg.pill ? '6px 18px' : '12px 16px'}
          radius={cfg.pill ? 999 : 12}
        >
          <div className="flow-node__inner">
            {finalIcon && (
              <Icon name={finalIcon} size={cfg.pill ? 13 : 16} style={{ color: cfg.glow }} />
            )}
            <span>{children}</span>
          </div>
        </GlowCard>
      </div>
    );
  },
);
FlowNode.displayName = 'FlowNode';

/* ===================== Flowchart Demo ===================== */

const FlowchartDemo: React.FC = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  // 左栏 (主流程)
  const start = useRef<HTMLDivElement>(null);
  const recv = useRef<HTMLDivElement>(null);
  const stockQ = useRef<HTMLDivElement>(null);
  const createPay = useRef<HTMLDivElement>(null);
  const payQ = useRef<HTMLDivElement>(null);
  const ship = useRef<HTMLDivElement>(null);
  const endOk = useRef<HTMLDivElement>(null);
  // 右栏 (异常分支)
  const cancel = useRef<HTMLDivElement>(null);
  const endFail = useRef<HTMLDivElement>(null);
  const retry = useRef<HTMLDivElement>(null);

  return (
    <div ref={stageRef} className="cd-flow-stage">
      <ConnectorGroup container={stageRef} defaultArrow="end">
        {/* 左栏 */}
        <FlowNode ref={start} kind="start" pos={{ left: 170, top: 18 }}>
          开始
        </FlowNode>
        <FlowNode ref={recv} kind="process" icon="order" pos={{ left: 130, top: 84 }}>
          接收订单
        </FlowNode>
        <FlowNode ref={stockQ} kind="decision" pos={{ left: 130, top: 168 }}>
          库存充足?
        </FlowNode>
        <FlowNode
          ref={createPay}
          kind="process"
          icon="checkstand"
          pos={{ left: 130, top: 252 }}
        >
          创建支付单
        </FlowNode>
        <FlowNode ref={payQ} kind="decision" pos={{ left: 130, top: 336 }}>
          支付成功?
        </FlowNode>
        <FlowNode ref={ship} kind="process" icon="logistics-airfreight" pos={{ left: 130, top: 420 }}>
          发货
        </FlowNode>
        <FlowNode ref={endOk} kind="end-ok" pos={{ left: 158, top: 504 }}>
          完成
        </FlowNode>

        {/* 右栏 */}
        <FlowNode
          ref={cancel}
          kind="process-danger"
          pos={{ left: 460, top: 168 }}
        >
          取消并通知
        </FlowNode>
        <FlowNode ref={endFail} kind="end-fail" pos={{ left: 488, top: 256 }}>
          结束
        </FlowNode>
        <FlowNode ref={retry} kind="process-soft" pos={{ left: 460, top: 336 }}>
          等待重试
        </FlowNode>

        {/* 主流程连线 */}
        <Connector from={start} to={recv} type="curve" color="aurora" thickness={2.5} animated />
        <Connector from={recv} to={stockQ} type="curve" color="aurora" thickness={2.5} />
        <Connector
          from={stockQ}
          to={createPay}
          type="curve"
          color="#10b981"
          thickness={2}
          label="充足"
        />
        <Connector from={createPay} to={payQ} type="curve" color="aurora" thickness={2} />
        <Connector
          from={payQ}
          to={ship}
          type="curve"
          color="#10b981"
          thickness={2}
          label="成功"
        />
        <Connector from={ship} to={endOk} type="curve" color="#10b981" thickness={2.5} />

        {/* 异常分支 */}
        <Connector
          from={stockQ}
          to={cancel}
          type="step"
          startSide="right"
          endSide="left"
          color="#ef4444"
          thickness={2}
          label="不足"
        />
        <Connector
          from={cancel}
          to={endFail}
          type="curve"
          color="#ef4444"
          thickness={2}
        />
        <Connector
          from={payQ}
          to={retry}
          type="step"
          startSide="right"
          endSide="left"
          color="#f59e0b"
          thickness={2}
          dashed
          label="失败"
        />

        {/* 重试回流 (orthogonal U 型, 流动虚线) */}
        <Connector
          from={retry}
          to={createPay}
          type="orthogonal"
          startSide="left"
          endSide="right"
          color="#9ca3af"
          thickness={1.5}
          dashed
          animated
          label="重试"
        />
      </ConnectorGroup>
    </div>
  );
};

const FLOWCHART_CODE = `// 1. 给每个节点准备 ref
const stageRef = useRef(null);
const start = useRef(null);
const stockQ = useRef(null);
const createPay = useRef(null);
const payQ = useRef(null);
const cancel = useRef(null);
const retry = useRef(null);
// ... 等等

// 2. 容器 + 节点 + 连线写在 ConnectorGroup 里
<div ref={stageRef} style={{ position: 'relative', height: 580 }}>
  <ConnectorGroup container={stageRef} defaultArrow="end">
    {/* 节点 (每个 ref 指向定位 div) */}
    <FlowNode ref={start} kind="start" pos={{ left: 170, top: 18 }}>
      开始
    </FlowNode>
    <FlowNode ref={stockQ} kind="decision" pos={{ left: 130, top: 168 }}>
      库存充足?
    </FlowNode>
    {/* ... 其他节点 ... */}

    {/* 连线 — 4 种 type 混用 */}
    <Connector from={start} to={recv} type="curve" color="aurora" animated />
    <Connector from={stockQ} to={createPay} color="#10b981" label="充足" />
    <Connector from={stockQ} to={cancel} type="step"
               startSide="right" endSide="left"
               color="#ef4444" label="不足" />
    <Connector from={payQ} to={retry} type="step" dashed
               startSide="right" endSide="left"
               color="#f59e0b" label="失败" />
    {/* 重试回流: orthogonal U 型 */}
    <Connector from={retry} to={createPay} type="orthogonal"
               startSide="left" endSide="right"
               color="#9ca3af" dashed animated label="重试" />
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
