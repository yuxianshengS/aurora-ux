import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  Breadcrumb,
  Dropdown,
  Avatar,
  Badge,
  KpiCard,
  Gauge,
  Funnel,
  Heatmap,
  Table,
  Tag,
  Space,
  Popconfirm,
  message,
  notification,
  ActivityFeed,
  Divider,
  Input,
  Tabs,
  DayTimeline,
  Timeline,
} from '../components';
import type {
  MenuItem,
  TableColumn,
  ActivityItem,
  DayTimelineStatus,
  TimelineItem,
} from '../components';
import './DashboardExample.css';

/* ---------- fake data ---------- */

interface Order {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: 'paid' | 'pending' | 'refund' | 'cancel';
  time: string;
}

const orders: Order[] = [
  { id: 'O-2026-0419-08', customer: '腾讯云', product: '企业版年度订阅', amount: 48000, status: 'paid', time: '10:42' },
  { id: 'O-2026-0419-07', customer: '字节跳动', product: '私有化部署', amount: 128000, status: 'pending', time: '10:28' },
  { id: 'O-2026-0419-06', customer: '小米科技', product: '专业版 10 席', amount: 8800, status: 'paid', time: '10:02' },
  { id: 'O-2026-0419-05', customer: '美团研究院', product: '扩容包 · 50GB', amount: 1200, status: 'paid', time: '09:48' },
  { id: 'O-2026-0419-04', customer: 'Bilibili', product: '专业版 5 席', amount: 4400, status: 'refund', time: '09:30' },
  { id: 'O-2026-0419-03', customer: '滴滴出行', product: '企业定制', amount: 65000, status: 'paid', time: '09:18' },
  { id: 'O-2026-0419-02', customer: '网易云音乐', product: '扩容包 · 200GB', amount: 3600, status: 'cancel', time: '08:55' },
];

const statusMap: Record<Order['status'], { label: string; color: 'success' | 'warning' | 'danger' | 'default' }> = {
  paid: { label: '已支付', color: 'success' },
  pending: { label: '待确认', color: 'warning' },
  refund: { label: '已退款', color: 'danger' },
  cancel: { label: '已取消', color: 'default' },
};

const activities: ActivityItem[] = [
  { id: 1, time: new Date(Date.now() - 60_000), user: { name: '腾讯云' }, title: '创建了订单 #O-2026-0419-08', description: '¥48,000 · 企业版', type: 'primary', tag: '订单' },
  { id: 2, time: new Date(Date.now() - 8 * 60_000), user: { name: 'Mia' }, title: '审核通过退款单 #R-2134', type: 'success', tag: '退款' },
  { id: 3, time: new Date(Date.now() - 22 * 60_000), user: { name: '系统' }, title: '检测到异常登录', description: 'IP 103.x.x.x · 新设备', type: 'warning', tag: '风控' },
  { id: 4, time: new Date(Date.now() - 48 * 60_000), user: { name: 'Noah' }, title: '上传了 12 张合同扫描件', type: 'info', tag: '存储' },
  { id: 5, time: new Date(Date.now() - 95 * 60_000), user: { name: '沈知秋' }, title: '删除了测试项目', description: '项目 #P-0419', type: 'danger', tag: '危险操作' },
  { id: 6, time: new Date(Date.now() - 180 * 60_000), user: { name: '林可' }, title: '调整了报表定时任务', type: 'default' },
  { id: 7, time: new Date(Date.now() - 310 * 60_000), user: { name: 'Bilibili' }, title: '取消了未支付订单', description: '订单 #O-2026-0419-02', type: 'default' },
];

const funnelSteps = [
  { label: '访问落地页', value: 12840 },
  { label: '查看商品', value: 5280 },
  { label: '加入购物车', value: 1920 },
  { label: '进入结算', value: 960 },
  { label: '支付成功', value: 480 },
];

const hoursAgo = (h: number, m = 0) => {
  const d = new Date();
  d.setHours(d.getHours() - h, d.getMinutes() - m, 0, 0);
  return d;
};

/** 今日事件时间轴 — 订单/退款/告警分别对应 success/danger/warning */
const todayEvents: DayTimelineStatus[] = [
  { value: hoursAgo(8), status: 'success' },
  { value: hoursAgo(7, 20), status: 'success' },
  { value: hoursAgo(6, 45), status: 'warning' },
  { value: hoursAgo(5, 10), status: 'success' },
  { value: hoursAgo(4, 30), status: 'success' },
  { value: hoursAgo(3, 50), status: 'danger' },
  { value: hoursAgo(3, 0), status: 'success' },
  { value: hoursAgo(2, 20), status: 'success' },
  { value: hoursAgo(1, 40), status: 'warning' },
  { value: hoursAgo(1, 5), status: 'success' },
  { value: hoursAgo(0, 30), status: 'success' },
  { value: hoursAgo(0, 5), status: 'success' },
];

/** 系统里程碑 — Timeline 视图 */
const milestones: TimelineItem[] = [
  {
    color: 'primary',
    label: '10:42',
    children: (
      <>
        <strong>数据库主从切换</strong>
        <div style={{ fontSize: 12.5, color: 'var(--au-text-3)', marginTop: 2 }}>
          主节点故障转移完成, 新节点正常接管。
        </div>
      </>
    ),
    loading: true,
  },
  {
    color: 'success',
    label: '09:15',
    children: (
      <>
        <strong>v2.4.1 发布到生产</strong>
        <div style={{ fontSize: 12.5, color: 'var(--au-text-3)', marginTop: 2 }}>
          包含订单模块性能优化 · 预期 p95 延迟 -30%。
        </div>
      </>
    ),
  },
  {
    color: 'warning',
    label: '03:02',
    children: (
      <>
        <strong>异常登录尝试</strong>
        <div style={{ fontSize: 12.5, color: 'var(--au-text-3)', marginTop: 2 }}>
          来自 103.x.x.x 的 42 次登录被风控拦截。
        </div>
      </>
    ),
  },
  {
    color: 'success',
    label: '02:00',
    children: (
      <>
        <strong>定时备份完成</strong>
        <div style={{ fontSize: 12.5, color: 'var(--au-text-3)', marginTop: 2 }}>
          42.3 GB · 增量备份 · 耗时 11 分钟。
        </div>
      </>
    ),
  },
  {
    color: 'gray',
    label: '昨日 23:30',
    children: (
      <>
        <strong>索引重建完成</strong>
        <div style={{ fontSize: 12.5, color: 'var(--au-text-3)', marginTop: 2 }}>
          orders 表索引碎片率从 32% 降到 4%。
        </div>
      </>
    ),
  },
];

const genHeatmap = () => {
  const data: { date: string; value: number }[] = [];
  const end = new Date();
  for (let i = 0; i < 180; i++) {
    const d = new Date(end.getTime() - i * 86400000);
    if (Math.random() < 0.3) continue;
    data.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      value: Math.floor(Math.random() * 12) + 1,
    });
  }
  return data;
};

const sidebarItems: MenuItem[] = [
  { key: 'overview', label: '概览', icon: <span>📊</span> },
  {
    key: 'orders',
    label: '订单',
    icon: <span>🧾</span>,
    children: [
      { key: 'orders-all', label: '全部订单' },
      { key: 'orders-refund', label: '退款处理' },
      { key: 'orders-audit', label: '审计日志' },
    ],
  },
  { key: 'customers', label: '客户', icon: <span>👥</span> },
  { key: 'products', label: '商品', icon: <span>📦</span> },
  { key: 'reports', label: '报表', icon: <span>📈</span> },
  { type: 'divider' },
  { key: 'settings', label: '设置', icon: <span>⚙️</span> },
  { key: 'help', label: '帮助', icon: <span>❓</span> },
];

/* ---------- main ---------- */

const DashboardExample: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState('overview');
  const [tableKeys, setTableKeys] = useState<React.Key[]>([]);
  const heatmapData = useMemo(genHeatmap, []);
  const [feed, setFeed] = useState<ActivityItem[]>(activities);

  const orderColumns: TableColumn<Order>[] = [
    { title: '订单号', dataIndex: 'id', width: 170 },
    {
      title: '客户',
      dataIndex: 'customer',
      render: (v: string) => (
        <Space>
          <Avatar size="small" background="var(--au-primary)" color="#fff">
            {v[0]}
          </Avatar>
          <span>{v}</span>
        </Space>
      ),
    },
    { title: '商品', dataIndex: 'product', ellipsis: true },
    {
      title: '金额',
      dataIndex: 'amount',
      align: 'right',
      sorter: true,
      render: (v: number) => (
        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>¥ {v.toLocaleString()}</span>
      ),
      width: 130,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (s: Order['status']) => <Tag color={statusMap[s].color}>{statusMap[s].label}</Tag>,
    },
    { title: '时间', dataIndex: 'time', width: 80, align: 'right' },
    {
      title: '',
      key: 'actions',
      width: 100,
      render: (_v, r: Order) => (
        <Dropdown
          trigger="click"
          placement="bottomRight"
          menu={{
            items: [
              { key: 'view', label: '查看详情', icon: <span>👁</span> },
              { key: 'invoice', label: '开具发票', icon: <span>🧾</span> },
              { type: 'divider' },
              { key: 'cancel', label: '取消订单', icon: <span>🗑</span>, danger: true },
            ],
            onClick: ({ key }) => {
              if (key === 'cancel') {
                notification.warning({
                  title: '请确认',
                  description: `是否取消订单 ${r.id}?`,
                });
              } else {
                message.info(`${key} — ${r.id}`);
              }
            },
          }}
        >
          <button className="dash-icon-btn" aria-label="更多">⋯</button>
        </Dropdown>
      ),
    },
  ];

  const triggerDemoEvent = () => {
    const next: ActivityItem = {
      id: Date.now(),
      time: new Date(),
      user: { name: '实时推送' },
      title: '新订单 #O-' + Math.floor(Math.random() * 9000 + 1000),
      description: `¥${(Math.random() * 5000 + 500).toFixed(0)} · ${['企业版', '扩容包', '专业版'][Math.floor(Math.random() * 3)]}`,
      type: 'primary',
      tag: '订单',
    };
    setFeed((arr) => [next, ...arr].slice(0, 20));
  };

  return (
    <div className={['dash', collapsed ? 'dash--collapsed' : ''].join(' ')}>
      {/* ---- Sidebar ---- */}
      <aside className="dash__sider">
        <div className="dash__brand">
          <span className="dash__brand-mark" aria-hidden />
          {!collapsed && <span className="dash__brand-name">Aurora · Admin</span>}
        </div>
        <Menu
          mode="inline"
          theme="dark"
          collapsed={collapsed}
          selectedKeys={[active]}
          defaultOpenKeys={['orders']}
          onSelect={({ key }) => setActive(key)}
          items={sidebarItems}
          style={{ background: 'transparent', border: 'none', fontSize: 13.5, flex: 1 }}
        />
        <button className="dash__collapse" onClick={() => setCollapsed((v) => !v)}>
          {collapsed ? '»' : '« 折叠'}
        </button>
      </aside>

      {/* ---- Main column ---- */}
      <div className="dash__main">
        {/* top bar */}
        <header className="dash__topbar">
          <div className="dash__topbar-left">
            <Breadcrumb
              items={[
                { title: <Link to="/">首页</Link> },
                { title: '概览' },
                { title: '今日' },
              ]}
            />
          </div>
          <div className="dash__topbar-right">
            <Input
              placeholder="搜索订单、客户…"
              style={{ width: 220 }}
              prefix={<span style={{ fontSize: 13 }}>🔍</span>}
            />
            <Badge dot>
              <button className="dash-icon-btn" aria-label="通知" onClick={triggerDemoEvent} title="点击模拟新事件">
                🔔
              </button>
            </Badge>
            <Dropdown
              placement="bottomRight"
              menu={{
                items: [
                  { key: 'profile', label: '个人资料', icon: <span>👤</span> },
                  { key: 'billing', label: '订阅与账单', icon: <span>💳</span> },
                  { key: 'settings', label: '设置', icon: <span>⚙️</span> },
                  { type: 'divider' },
                  { key: 'logout', label: '退出登录', icon: <span>🚪</span>, danger: true },
                ],
                onClick: ({ key }) => message.info(`点击: ${key}`),
              }}
            >
              <div className="dash__user">
                <Avatar size="small" background="var(--au-primary)" color="#fff">Y</Avatar>
                {!collapsed && <span className="dash__user-name">余星辰</span>}
              </div>
            </Dropdown>
          </div>
        </header>

        {/* content */}
        <main className="dash__content">
          <div className="dash__page-head">
            <h1 className="dash__h1">今日概览</h1>
            <span className="dash__page-sub">实时数据 · 2026-04-22</span>
          </div>

          {/* KPI Row */}
          <div className="dash__kpi-row">
            <KpiCard
              title="今日 GMV"
              prefix="¥"
              value={328450}
              status="primary"
              delta={{ value: 12.5, label: '较昨日' }}
              trend={{ data: [6, 8, 7, 9, 11, 10, 13, 12, 15, 16, 14, 18], type: 'area' }}
            />
            <KpiCard
              title="新增订单"
              value={342}
              status="success"
              delta={{ value: 8.2, label: '较昨日' }}
              trend={{ data: [3, 4, 3, 5, 6, 5, 7, 8, 7, 9, 10, 11], type: 'area' }}
            />
            <KpiCard
              title="支付转化率"
              value={4.8}
              precision={1}
              suffix="%"
              status="warning"
              delta={{ value: -0.7, label: '较昨日' }}
              trend={{ data: [5.2, 5.1, 5.0, 4.9, 5.0, 4.9, 4.8, 4.7, 4.8, 4.8, 4.9, 4.8], type: 'line' }}
            />
            <KpiCard
              title="退款率"
              value={1.2}
              precision={1}
              suffix="%"
              status="danger"
              delta={{ value: -0.4, label: '较昨日', mode: 'positive-down' }}
              trend={{ data: [1.8, 1.7, 1.9, 1.6, 1.5, 1.5, 1.4, 1.3, 1.3, 1.2, 1.3, 1.2], type: 'line' }}
            />
          </div>

          {/* DayTimeline hero row — 今日事件时间轴 */}
          <div className="dash__panel dash__panel--timeline">
            <div className="dash__panel-head">
              <h3>今日时间线</h3>
              <Space>
                <span className="dash__panel-meta">
                  <span className="dash__legend-dot" style={{ background: 'var(--au-success)' }} /> 订单成功
                </span>
                <span className="dash__panel-meta">
                  <span className="dash__legend-dot" style={{ background: 'var(--au-warning)' }} /> 告警
                </span>
                <span className="dash__panel-meta">
                  <span className="dash__legend-dot" style={{ background: 'var(--au-danger)' }} /> 异常/退款
                </span>
              </Space>
            </div>
            <DayTimeline
              mode="hour"
              dataEndAt={new Date()}
              statusData={todayEvents}
              onChangeComplete={(p) => message.info(`跳转到 ${p.label}`)}
            />
          </div>

          {/* Row: table + feed */}
          <div className="dash__grid-2">
            <div className="dash__panel">
              <div className="dash__panel-head">
                <h3>最近订单</h3>
                <Space>
                  {tableKeys.length > 0 && (
                    <Popconfirm
                      title={`批量取消 ${tableKeys.length} 条订单?`}
                      okType="danger"
                      onConfirm={() => {
                        message.success(`已取消 ${tableKeys.length} 条`);
                        setTableKeys([]);
                      }}
                    >
                      <button className="au-btn au-btn--danger au-btn--small">
                        批量取消 ({tableKeys.length})
                      </button>
                    </Popconfirm>
                  )}
                  <button className="au-btn au-btn--default au-btn--small">导出</button>
                </Space>
              </div>
              <Tabs
                size="small"
                defaultActiveKey="all"
                items={[
                  {
                    key: 'all',
                    label: '全部',
                    children: (
                      <Table<Order>
                        rowKey="id"
                        size="small"
                        columns={orderColumns}
                        dataSource={orders}
                        rowSelection={{
                          selectedRowKeys: tableKeys,
                          onChange: (ks) => setTableKeys(ks),
                        }}
                        pagination={{ pageSize: 5, showTotal: (t) => `共 ${t} 条` }}
                      />
                    ),
                  },
                  {
                    key: 'paid',
                    label: '已支付',
                    children: (
                      <Table<Order>
                        rowKey="id"
                        size="small"
                        columns={orderColumns}
                        dataSource={orders.filter((o) => o.status === 'paid')}
                        pagination={false}
                      />
                    ),
                  },
                  {
                    key: 'pending',
                    label: '待确认',
                    children: (
                      <Table<Order>
                        rowKey="id"
                        size="small"
                        columns={orderColumns}
                        dataSource={orders.filter((o) => o.status === 'pending')}
                        pagination={false}
                      />
                    ),
                  },
                ]}
              />
            </div>

            <div className="dash__panel dash__panel--tabs">
              <Tabs
                size="small"
                defaultActiveKey="feed"
                tabBarExtraContent={
                  <button className="au-btn au-btn--ghost au-btn--small" onClick={triggerDemoEvent}>
                    模拟
                  </button>
                }
                items={[
                  {
                    key: 'feed',
                    label: '动态',
                    children: (
                      <ActivityFeed
                        items={feed}
                        maxHeight={400}
                        compact
                        style={{ padding: '4px 0' }}
                      />
                    ),
                  },
                  {
                    key: 'milestones',
                    label: '里程碑',
                    children: (
                      <div style={{ maxHeight: 400, overflowY: 'auto', padding: '8px 4px 4px' }}>
                        <Timeline
                          items={milestones}
                          pending="下一次定时部署 · 20:00"
                        />
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </div>

          {/* Row: 3 panels */}
          <div className="dash__grid-3">
            <div className="dash__panel dash__panel--centered">
              <div className="dash__panel-head">
                <h3>服务健康度</h3>
                <span className="dash__panel-meta">实时</span>
              </div>
              <Gauge
                value={92}
                suffix="分"
                label="综合得分"
                size={180}
                thickness={14}
                thresholds={[
                  { threshold: 0, color: 'var(--au-danger)' },
                  { threshold: 60, color: 'var(--au-warning)' },
                  { threshold: 85, color: 'var(--au-success)' },
                ]}
              />
              <Divider />
              <div className="dash__meters">
                <div className="dash__meter">
                  <span>响应</span>
                  <span className="dash__meter-val">182ms</span>
                </div>
                <div className="dash__meter">
                  <span>可用性</span>
                  <span className="dash__meter-val">99.98%</span>
                </div>
                <div className="dash__meter">
                  <span>错误率</span>
                  <span className="dash__meter-val">0.02%</span>
                </div>
              </div>
            </div>

            <div className="dash__panel">
              <div className="dash__panel-head">
                <h3>成交漏斗</h3>
                <span className="dash__panel-meta">近 30 天</span>
              </div>
              <Funnel
                data={funnelSteps}
                width={380}
                percentBase="previous"
                formatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
              />
            </div>

            <div className="dash__panel">
              <div className="dash__panel-head">
                <h3>活跃日历</h3>
                <span className="dash__panel-meta">近 180 天</span>
              </div>
              <Heatmap
                data={heatmapData}
                startDate={new Date(Date.now() - 180 * 86400000)}
                endDate={new Date()}
                cellSize={11}
                cellGap={2}
                tooltipFormatter={({ date, value }) =>
                  `${date.getMonth() + 1}月${date.getDate()}日 · ${value || 0} 单`
                }
              />
            </div>
          </div>

          <footer className="dash__footer">
            Aurora Admin · 由 aurora-ui 驱动 ·{' '}
            <Link to="/docs/getting-started">组件文档</Link>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default DashboardExample;
