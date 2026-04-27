import React, { useRef, useState } from 'react';
import {
  ConnectorGroup,
  Connector,
  Draggable,
  GlowCard,
  Tag,
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
        title="基础: 一对一"
        description="两个 ref 拿到 DOM 后, 在 ConnectorGroup 里写一个 Connector 即可."
        code={`const refA = useRef(null), refB = useRef(null);
<ConnectorGroup>
  <div ref={refA}>Box A</div>
  <div ref={refB}>Box B</div>
  <Connector from={refA} to={refB} />
</ConnectorGroup>`}
      >
        <BasicDemo />
      </DemoBlock>

      <DemoBlock
        title="一对多"
        description="from 单个, to 数组. 同一边出多线时自动沿边均匀分布, 不会堆在中点."
        code={`<Connector
  from={refRoot}
  to={[refA, refB, refC, refD]}
  type="curve"
  color="aurora"
  arrow="end"
/>`}
      >
        <OneToManyDemo />
      </DemoBlock>

      <DemoBlock
        title="多对多 (mesh)"
        description="from 和 to 都是数组, 默认笛卡尔积全连. mode='pairs' 改为一一配对."
        code={`<Connector
  from={[refA, refB, refC]}
  to={[refX, refY]}
  mode="mesh"
  type="step"
  color="#a855f7"
  thickness={1.5}
/>`}
      >
        <MeshDemo />
      </DemoBlock>

      <DemoBlock
        title="可拖动 + 自动追踪"
        description="任意拖动节点, 连线实时跟随; ResizeObserver + scroll 监听都自动挂好."
        code={`// 节点用 Draggable 包裹, ref 不变
<Draggable defaultPosition={{x:0,y:0}}><div ref={refA}>A</div></Draggable>
<Connector from={refA} to={refB} type="orthogonal" animated />`}
      >
        <DraggableDemo />
      </DemoBlock>

      <DemoBlock
        title="4 种 type 切换"
        description="curve (默认) / step / orthogonal (圆角折线) / straight."
        code={`<Connector type="curve | step | orthogonal | straight" />`}
      >
        <TypeSwitchDemo />
      </DemoBlock>

      <DemoBlock
        title="数据 API: connections + ids"
        description="不写 JSX, 用一个数组配 ids 映射. 大批量场景."
        code={`<ConnectorGroup
  ids={{ root: refRoot, a: refA, b: refB, c: refC }}
  connections={[
    { from: 'root', to: ['a', 'b', 'c'], color: 'aurora', type: 'curve' },
    { from: 'a', to: 'b', color: '#f472b6', dashed: true, label: '依赖' },
  ]}
/>`}
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
  return (
    <div className="cd-stage">
      <ConnectorGroup>
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
  return (
    <div className="cd-stage cd-stage--tall">
      <ConnectorGroup>
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
  return (
    <div className="cd-stage cd-stage--mesh">
      <ConnectorGroup>
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
      <div className="cd-stage">
        <ConnectorGroup>
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
  return (
    <div className="cd-stage cd-stage--tall">
      <ConnectorGroup
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
