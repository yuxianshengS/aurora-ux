import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ScreenScale,
  NumberRoll,
  Flip,
  Connector,
  ConnectorGroup,
  Gauge,
  LiquidFill,
  ActivityFeed,
  TickerTape,
  Sparkline,
  PulseDot,
  Icon,
} from '../components';
import type { ActivityItem } from '../components';
import './BigScreenExample.css';

/* vite 部署 base path (GH Pages 在子路径下) */
const BASE = (
  (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || '/'
).replace(/\/$/, '');

/* ============================================================
   实时业务监控大屏 — 监控中心蓝色调
   - 全屏深海军蓝 (#0a1430 系) + 青蓝 accent (#38bdf8)
   - 不用极光多色, 状态色 (绿黄红) 仅用于"状态指示"位置
   - 1920×1080 设计, ScreenScale 自适应
   ============================================================ */

/* ---------- 顶部 / 面板的标题装饰 (左右斜杠 + 标题底板) ---------- */
const PanelTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bs-pt">
    <span className="bs-pt__bars" aria-hidden />
    <span className="bs-pt__text">{children}</span>
    <span className="bs-pt__bars bs-pt__bars--r" aria-hidden />
  </div>
);

/* ---------- Metric 卡 (统一蓝色系) ---------- */
interface MetricProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  precision?: number;
  delta?: { value: number; up: boolean };
  trend: number[];
  icon: string;
  /** 昨日 / 对比值 */
  yesterday?: string;
  /** 周期标签 (e.g. "近 7 日") */
  rangeLabel?: string;
}
const Metric: React.FC<MetricProps> = ({
  label,
  value,
  prefix,
  suffix,
  precision,
  delta,
  trend,
  icon,
  yesterday,
  rangeLabel = '近 12 小时',
}) => {
  const tMin = Math.min(...trend);
  const tMax = Math.max(...trend);
  return (
    <div className="bs-card bs-metric">
      <div className="bs-metric__top">
        <span className="bs-metric__icon">
          <Icon name={icon} size={18} />
        </span>
        <span className="bs-metric__label">{label}</span>
        {delta && (
          <span className={['bs-metric__delta', delta.up ? 'is-up' : 'is-down'].join(' ')}>
            {delta.up ? '↑' : '↓'} {delta.value.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="bs-metric__main">
        <div className="bs-metric__num">
          <NumberRoll
            value={value}
            prefix={prefix}
            suffix={suffix}
            precision={precision}
            size={48}
            weight={900}
            color="white"
          />
        </div>
        {yesterday && (
          <div className="bs-metric__sub">
            <span className="bs-metric__sub-lbl">昨日</span>
            <span className="bs-metric__sub-val">{yesterday}</span>
          </div>
        )}
      </div>
      <div className="bs-metric__spark">
        <Sparkline
          data={trend}
          type="area"
          color="#38bdf8"
          width={280}
          height={64}
          smooth
          showDot
        />
      </div>
      <div className="bs-metric__bot">
        <span>{rangeLabel}</span>
        <span className="bs-metric__bot-range">
          <span>min {tMin.toLocaleString()}</span>
          <span className="bs-metric__bot-sep">·</span>
          <span>max {tMax.toLocaleString()}</span>
        </span>
      </div>
    </div>
  );
};

/* ---------- Connector 节点 (蓝色统一) ---------- */
interface NodeProps {
  label: string;
  sub?: string;
  icon: string;
  pulse?: 'live' | 'warning' | 'danger';
  status?: 'normal' | 'warning' | 'danger';
  style?: React.CSSProperties;
}
const Node = React.forwardRef<HTMLDivElement, NodeProps>(
  ({ label, sub, icon, pulse, status = 'normal', style }, ref) => (
    <div ref={ref} className={`bs-node bs-node--${status}`} style={style}>
      <span className="bs-node__halo" />
      <span className="bs-node__ring" />
      <span className="bs-node__core">
        <Icon name={icon} size={24} />
      </span>
      <div className="bs-node__txt">
        <strong>{label}</strong>
        {sub && <span>{sub}</span>}
      </div>
      {pulse && (
        <span className="bs-node__dot">
          <PulseDot status={pulse} size={6} />
        </span>
      )}
    </div>
  ),
);
Node.displayName = 'Node';

/* ---------- 24h 状态条 ---------- */
const StatusBar24h: React.FC = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  const segs: Array<'g' | 'y' | 'r'> = [
    'g',
    'g',
    'g',
    'g',
    'r',
    'y',
    'g',
    'g',
    'g',
    'g',
    'r',
    'g',
    'g',
    'g',
    'g',
    'y',
    'g',
    'g',
    'g',
    'g',
    'g',
    'g',
    'y',
    'g',
  ];
  const cursor = ((now.getHours() + now.getMinutes() / 60) / 24) * 100;
  const cursorLabel = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return (
    <div className="bs-statusbar">
      <span className="bs-statusbar__label">24h 健康度</span>
      <div className="bs-statusbar__bar">
        {segs.map((s, i) => (
          <span key={i} className={`bs-statusbar__seg bs-statusbar__seg--${s}`} />
        ))}
        <span className="bs-statusbar__cursor" style={{ left: `${cursor}%` }}>
          <span className="bs-statusbar__flag">{cursorLabel}</span>
        </span>
      </div>
      <div className="bs-statusbar__ticks">
        {[0, 6, 12, 18, 24].map((h) => (
          <span key={h}>{String(h).padStart(2, '0')}:00</span>
        ))}
      </div>
    </div>
  );
};

/* ---------- 数据 ---------- */
const initialFeed: ActivityItem[] = [
  {
    id: 1,
    time: new Date(Date.now() - 60_000),
    user: { name: '腾讯云' },
    title: '新订单 #O-2026-0419-08',
    description: '¥48,000 · 企业版',
    type: 'primary',
    tag: '订单',
  },
  {
    id: 2,
    time: new Date(Date.now() - 8 * 60_000),
    user: { name: 'Mia' },
    title: '审核通过退款 #R-2134',
    type: 'success',
    tag: '退款',
  },
  {
    id: 3,
    time: new Date(Date.now() - 22 * 60_000),
    user: { name: '系统' },
    title: '检测到异常登录',
    description: 'IP 103.x.x.x',
    type: 'warning',
    tag: '风控',
  },
  {
    id: 4,
    time: new Date(Date.now() - 48 * 60_000),
    user: { name: 'Noah' },
    title: '上传 12 张合同',
    type: 'info',
    tag: '存储',
  },
  {
    id: 5,
    time: new Date(Date.now() - 95 * 60_000),
    user: { name: '沈知秋' },
    title: '删除测试项目',
    type: 'danger',
    tag: '危险',
  },
  {
    id: 6,
    time: new Date(Date.now() - 180 * 60_000),
    user: { name: '林可' },
    title: '调整报表定时任务',
    type: 'default',
  },
  {
    id: 7,
    time: new Date(Date.now() - 240 * 60_000),
    user: { name: '美团' },
    title: '新订单 #O-2026-0419-04',
    type: 'primary',
    tag: '订单',
  },
];

const tickerItems = [
  { label: '系统', value: '运行正常', trend: 'up' as const, color: '#38bdf8' },
  { label: 'P95 延迟', value: '182ms', trend: 'flat' as const, color: '#38bdf8' },
  { label: 'GMV 同比', value: '+12.5%', trend: 'up' as const, color: '#4ade80' },
  { label: '新增客户', value: '24 家', trend: 'up' as const, color: '#38bdf8' },
  { label: '风控拦截', value: '42 次', trend: 'flat' as const, color: '#fbbf24' },
  { label: '备份', value: '42.3 GB ✓', trend: 'up' as const, color: '#38bdf8' },
  { label: 'Postgres', value: 'conns 248', trend: 'flat' as const, color: '#38bdf8' },
  { label: 'Redis hit', value: '98%', trend: 'up' as const, color: '#4ade80' },
  { label: 'CDN hit', value: '92%', trend: 'up' as const, color: '#4ade80' },
];

/* ============================================================
   Main
   ============================================================ */
const BigScreenExample: React.FC = () => {
  // 实时数据
  const [gmv, setGmv] = useState(12_840_560);
  const [orders, setOrders] = useState(8624);
  const [conv, setConv] = useState(24.6);
  const [retention, setRetention] = useState(78.3);
  const [users, setUsers] = useState(1284);
  const [health, setHealth] = useState(92);
  const [capacity, setCapacity] = useState(64);
  // 健康度子指标
  const [cpu, setCpu] = useState(42);
  const [mem, setMem] = useState(58);
  const [net, setNet] = useState(34);
  const [disk, setDisk] = useState(64);
  const [feed, setFeed] = useState<ActivityItem[]>(initialFeed);

  useEffect(() => {
    const id = setInterval(() => {
      setGmv((v) => v + Math.floor(Math.random() * 8000) + 500);
      setOrders((v) => v + (Math.random() < 0.6 ? 1 : 0));
      setConv((v) => Math.max(20, Math.min(28, v + (Math.random() - 0.5) * 0.4)));
      setRetention((v) => Math.max(74, Math.min(82, v + (Math.random() - 0.5) * 0.3)));
      setUsers((v) => v + (Math.random() < 0.7 ? 1 : 0));
      setHealth((v) => Math.max(85, Math.min(99, v + (Math.random() - 0.5) * 1.2)));
      setCapacity((v) => Math.max(40, Math.min(85, v + (Math.random() - 0.5) * 2.5)));
      setCpu((v) => Math.max(20, Math.min(75, v + (Math.random() - 0.5) * 6)));
      setMem((v) => Math.max(35, Math.min(80, v + (Math.random() - 0.5) * 4)));
      setNet((v) => Math.max(15, Math.min(70, v + (Math.random() - 0.5) * 8)));
      setDisk((v) => Math.max(50, Math.min(75, v + (Math.random() - 0.5) * 1.5)));
    }, 1500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const types: ActivityItem['type'][] = ['primary', 'success', 'warning', 'info'];
      const tags = ['订单', '退款', '注册', '咨询', '风控'];
      const next: ActivityItem = {
        id: Date.now(),
        time: new Date(),
        user: {
          name: ['腾讯', '阿里', '字节', '美团', '小米', '京东', 'Bilibili'][
            Math.floor(Math.random() * 7)
          ],
        },
        title: '新事件 #' + Math.floor(Math.random() * 9000 + 1000),
        description: `¥${Math.floor(Math.random() * 50000 + 1000)}`,
        type: types[Math.floor(Math.random() * types.length)],
        tag: tags[Math.floor(Math.random() * tags.length)],
      };
      setFeed((arr) => [next, ...arr].slice(0, 12));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const HH = String(now.getHours()).padStart(2, '0');
  const MM = String(now.getMinutes()).padStart(2, '0');
  const SS = String(now.getSeconds()).padStart(2, '0');
  const weekday = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()];

  const trends = useMemo(
    () => ({
      orders: [3, 5, 4, 6, 8, 9, 11, 13, 15, 14, 16, 18],
      conv: [28, 27, 26, 25, 26, 25, 24, 24.5, 24.8, 24.6, 24.5, 24.6],
      retention: [72, 73, 75, 74, 76, 77, 78, 78.5, 78.3, 78.1, 78.4, 78.3],
      users: [800, 850, 920, 980, 1050, 1120, 1180, 1220, 1240, 1260, 1280, 1284],
    }),
    [],
  );

  // 拓扑 refs
  const stage = useRef<HTMLDivElement>(null);
  const cdn = useRef<HTMLDivElement>(null);
  const gateway = useRef<HTMLDivElement>(null);
  const userSvc = useRef<HTMLDivElement>(null);
  const orderSvc = useRef<HTMLDivElement>(null);
  const paySvc = useRef<HTMLDivElement>(null);
  const cache = useRef<HTMLDivElement>(null);
  const db = useRef<HTMLDivElement>(null);

  return (
    <div className="bs-root">
      <ScreenScale baseWidth={1920} baseHeight={1080} mode="fit" background="#04081a">
        <div className="bs-stage">
          {/* 远景蓝色斑 (低饱和) + 网格 */}
          <div className="bs-bg-blob" aria-hidden />
          <div className="bs-bg-grid" aria-hidden />

          {/* ============ 顶栏 (用原 JSON 的 PNG 素材, 1:1 还原) ============ */}
          <header className="bs-top">
            {/* 全宽 header 背景图 */}
            <img
              className="bs-top__bg"
              src={`${BASE}/screen-assets/大标题背景.png`}
              alt=""
              aria-hidden
            />
            {/* 中央装饰线 (左右两条标题装饰) */}
            <img
              className="bs-top__deco bs-top__deco--l"
              src={`${BASE}/screen-assets/标题-1.gif`}
              alt=""
              aria-hidden
            />
            <img
              className="bs-top__deco bs-top__deco--r"
              src={`${BASE}/screen-assets/标题-1.gif`}
              alt=""
              aria-hidden
            />
            {/* 标题底部"光线" + "电光" — 给标题加底盘光带 */}
            <img
              className="bs-top__beam"
              src={`${BASE}/screen-assets/电光.png`}
              alt=""
              aria-hidden
            />
            <img
              className="bs-top__ray"
              src={`${BASE}/screen-assets/光线.png`}
              alt=""
              aria-hidden
            />

            {/* logo + 标题 组合, 整体水平居中 */}
            <div className="bs-top__center">
              <img className="bs-top__mark" src={`${BASE}/favicon.svg`} alt="Aurora" aria-hidden />
              <span className="bs-top__brand">实时业务监控大屏</span>
            </div>

            {/* 左右日期 / 时钟 */}
            <span className="bs-top__date">
              {yyyy}-{mm}-{dd} 周{weekday}
            </span>
            <span className="bs-top__live">
              <PulseDot status="live" size={6} /> LIVE
            </span>
            <span className="bs-top__clock">
              {HH}:{MM}:{SS}
            </span>
          </header>

          {/* ============ 左列 ============ */}
          <div className="bs-col bs-col--l">
            <Metric
              label="今日订单"
              value={orders}
              icon="order"
              yesterday="7,985"
              delta={{ value: 8.2, up: true }}
              trend={trends.orders}
            />
            <Metric
              label="支付转化率"
              value={Number(conv.toFixed(2))}
              suffix="%"
              precision={2}
              icon="charts-curve"
              yesterday="25.1%"
              delta={{ value: 1.8, up: false }}
              trend={trends.conv}
            />
            <Metric
              label="留存率"
              value={Number(retention.toFixed(1))}
              suffix="%"
              precision={1}
              icon="customer"
              yesterday="76.6%"
              delta={{ value: 2.1, up: true }}
              trend={trends.retention}
            />
            <Metric
              label="新用户"
              value={users}
              icon="customer"
              yesterday="1,110"
              delta={{ value: 15.6, up: true }}
              trend={trends.users}
            />
          </div>

          {/* ============ 中央 (Hero + 拓扑) ============ */}
          <div className="bs-center">
            {/* Hero — 嵌进中央, 不再悬空 */}
            <div className="bs-hero">
              <span className="bs-hero__eb">
                本日累计 GMV · 截至 {HH}:{MM}
              </span>
              <div className="bs-hero__num">
                <Flip
                  value={gmv.toLocaleString()}
                  size={72}
                  prefix={<span className="bs-hero__currency">¥</span>}
                  duration={700}
                />
                <span className="bs-hero__trend">
                  <span className="bs-hero__arrow">↑</span>
                  <span className="bs-hero__pct">12.5%</span>
                  <span className="bs-hero__cmp">vs 昨日</span>
                </span>
              </div>
              {/* 顶部 4 个汇总迷你 stat — 横向铺满, 替代以前的空白 */}
              <div className="bs-hero__stats">
                <div className="bs-hero__stat">
                  <span className="bs-hero__stat-lbl">今日订单</span>
                  <strong>{orders.toLocaleString()}</strong>
                </div>
                <div className="bs-hero__stat">
                  <span className="bs-hero__stat-lbl">活跃服务</span>
                  <strong>7 / 7</strong>
                </div>
                <div className="bs-hero__stat">
                  <span className="bs-hero__stat-lbl">异常告警</span>
                  <strong className="is-warn">3</strong>
                </div>
                <div className="bs-hero__stat">
                  <span className="bs-hero__stat-lbl">QPS</span>
                  <strong>12.4k</strong>
                </div>
                <div className="bs-hero__stat">
                  <span className="bs-hero__stat-lbl">P95 延迟</span>
                  <strong>182ms</strong>
                </div>
                <div className="bs-hero__stat">
                  <span className="bs-hero__stat-lbl">可用性</span>
                  <strong className="is-ok">99.98%</strong>
                </div>
              </div>
            </div>

            {/* 拓扑 panel */}
            <div className="bs-card bs-center__topo">
              <PanelTitle>核心服务调用拓扑</PanelTitle>
              <div ref={stage} className="bs-topo">
                <ConnectorGroup container={stage} defaultArrow="end" defaultType="curve">
                  <Node
                    ref={cdn}
                    icon="cloud-download"
                    label="CDN"
                    sub="hit 92%"
                    style={{ left: '8%', top: 30 }}
                  />
                  <Node
                    ref={gateway}
                    icon="connections"
                    label="API Gateway"
                    sub="qps 12.4k"
                    style={{ left: '50%', top: 30, transform: 'translateX(-50%)' }}
                    pulse="live"
                  />
                  <Node
                    ref={userSvc}
                    icon="customer"
                    label="User Svc"
                    sub="p95 124ms"
                    style={{ left: '8%', top: 200 }}
                  />
                  <Node
                    ref={orderSvc}
                    icon="order"
                    label="Order Svc"
                    sub="p95 182ms"
                    style={{ left: '50%', top: 200, transform: 'translateX(-50%)' }}
                    status="warning"
                    pulse="warning"
                  />
                  <Node
                    ref={paySvc}
                    icon="checkstand"
                    label="Payment Svc"
                    sub="p95 156ms"
                    style={{ right: '8%', top: 200 }}
                  />
                  <Node
                    ref={cache}
                    icon="folder"
                    label="Redis"
                    sub="hit 98%"
                    style={{ left: '22%', top: 380 }}
                  />
                  <Node
                    ref={db}
                    icon="folder"
                    label="Postgres"
                    sub="conns 248"
                    style={{ right: '22%', top: 380 }}
                    pulse="live"
                  />

                  <Connector
                    from={cdn}
                    to={gateway}
                    color="#38bdf8"
                    thickness={1.6}
                    animated
                    flow={{ count: 2, speed: 1.6, size: 3 }}
                  />
                  <Connector
                    from={gateway}
                    to={[userSvc, orderSvc, paySvc]}
                    color="#38bdf8"
                    thickness={1.6}
                    animated
                    flow={{ count: 3, speed: 1.8, size: 3 }}
                  />
                  <Connector
                    from={[userSvc, orderSvc]}
                    to={cache}
                    color="#38bdf8"
                    thickness={1.4}
                    flow={{ count: 2, speed: 2.2, size: 2.5 }}
                  />
                  <Connector
                    from={[orderSvc, paySvc]}
                    to={db}
                    color="#38bdf8"
                    thickness={1.4}
                    flow={{ count: 2, speed: 2, size: 2.5 }}
                  />
                  <Connector
                    from={cache}
                    to={db}
                    color="#38bdf8"
                    thickness={1.2}
                    flow={{ count: 1, speed: 2.6, size: 2 }}
                  />
                </ConnectorGroup>
              </div>
              <StatusBar24h />
            </div>
          </div>

          {/* ============ 右列 ============ */}
          <div className="bs-col bs-col--r">
            <div className="bs-card bs-side-card">
              <PanelTitle>系统健康度</PanelTitle>
              <div className="bs-side-gauge">
                <Gauge
                  value={Math.round(health)}
                  suffix="分"
                  size={150}
                  thickness={12}
                  gradient={['#38bdf8', '#0ea5e9']}
                  thresholds={[
                    { threshold: 0, color: '#ef4444' },
                    { threshold: 60, color: '#fbbf24' },
                    { threshold: 85, color: '#22c55e' },
                  ]}
                />
                {/* 状态 pill */}
                <div
                  className={[
                    'bs-side-gauge__status',
                    health >= 85 ? 'is-ok' : health >= 60 ? 'is-warn' : 'is-bad',
                  ].join(' ')}
                >
                  <PulseDot
                    status={health >= 85 ? 'live' : health >= 60 ? 'warning' : 'danger'}
                    size={6}
                  />
                  <span>{health >= 85 ? '运行健康' : health >= 60 ? '需要关注' : '异常告警'}</span>
                </div>
              </div>
              {/* 4 条资源进度条 — 实时跳 */}
              <div className="bs-resources">
                {[
                  { label: 'CPU', value: cpu, unit: '%' },
                  { label: '内存', value: mem, unit: '%' },
                  { label: '网络', value: net, unit: 'Mbps' },
                  { label: '磁盘', value: disk, unit: '%' },
                ].map((r) => (
                  <div key={r.label} className="bs-res">
                    <div className="bs-res__top">
                      <span className="bs-res__lbl">{r.label}</span>
                      <strong className={['bs-res__val', r.value >= 75 ? 'is-warn' : ''].join(' ')}>
                        {r.value.toFixed(0)}
                        <span className="bs-res__unit">{r.unit}</span>
                      </strong>
                    </div>
                    <div className="bs-res__bar">
                      <div
                        className={['bs-res__fill', r.value >= 75 ? 'is-warn' : ''].join(' ')}
                        style={{ width: `${Math.min(100, r.value)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bs-card bs-side-card bs-side-card--c">
              <PanelTitle>主库容量</PanelTitle>
              <LiquidFill
                value={Math.round(capacity)}
                size={140}
                color="#38bdf8"
                waveSpeed={3}
                label="已使用"
              />
            </div>

            <div className="bs-card bs-side-card bs-side-card--feed">
              <PanelTitle>实时事件流</PanelTitle>
              <div className="bs-feed">
                <ActivityFeed items={feed} maxHeight="100%" compact />
              </div>
            </div>
          </div>

          {/* ============ 底部 TickerTape ============ */}
          <footer className="bs-bot">
            <TickerTape items={tickerItems} duration={60} pauseOnHover bordered={false} />
          </footer>
        </div>
      </ScreenScale>
      {/* 退出按钮 — 圆形叉, 鼠标移进大屏从顶部滑下 */}
      <Link to="/" className="bs-exit" title="退出大屏">
        <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden>
          <path
            d="M3 3 L11 11 M11 3 L3 11"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </Link>
    </div>
  );
};

export default BigScreenExample;
