import React, { useEffect, useState } from 'react';
import { ActivityFeed, message } from '../components';
import type { ActivityItem } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const now = () => new Date();
const minAgo = (m: number) => new Date(Date.now() - m * 60_000);

const sampleItems: ActivityItem[] = [
  {
    id: 1,
    time: minAgo(1),
    user: { name: '余星辰' },
    title: '创建了订单 #2026-0419',
    description: '订单金额 ¥4,280,客户: 腾讯',
    type: 'primary',
    tag: '订单',
  },
  {
    id: 2,
    time: minAgo(8),
    user: { name: 'Mia' },
    title: '审批通过了报销单',
    description: '¥1,240 · 差旅',
    type: 'success',
    tag: '已通过',
  },
  {
    id: 3,
    time: minAgo(22),
    user: { name: 'Noah' },
    title: '上传了 3 个文件',
    type: 'info',
    tag: '存储',
  },
  {
    id: 4,
    time: minAgo(45),
    user: { name: '系统' },
    title: '检测到异常登录',
    description: 'IP 103.x.x.x 从新设备访问账号',
    type: 'warning',
    tag: '安全',
  },
  {
    id: 5,
    time: minAgo(120),
    user: { name: '沈知秋' },
    title: '删除了 2 条记录',
    type: 'danger',
    tag: '危险操作',
  },
  {
    id: 6,
    time: minAgo(360),
    user: { name: '林可' },
    title: '更新了团队配置',
  },
];

const ActivityFeedDoc: React.FC = () => {
  return (
    <>
      <h1>ActivityFeed 动态时间流</h1>
      <p>
        承载"最近发生了什么":操作日志、风控事件、消息推送。比 Timeline 更"活",
        带相对时间、类型标签、滚动容器,新项插入时自动高亮闪烁一下。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="传入 items (含 time / title),默认按时间倒序。"
        code={`<ActivityFeed items={[
  { time: new Date(), user: { name: 'Y' }, title: '下单 #2026...', type: 'primary', tag: '订单' },
  ...
]} />`}
      >
        <ActivityFeed items={sampleItems} />
      </DemoBlock>

      <DemoBlock
        title="实时推送 (类行情流)"
        description="定时插入新项,带闪烁高亮; 固定高度带滚动。"
        code={`const [items, setItems] = useState(initialItems);
useEffect(() => {
  setInterval(() => {
    setItems((arr) => [newItem, ...arr]);
  }, 3000);
}, []);

<ActivityFeed items={items} maxHeight={280} />`}
      >
        <LiveDemo />
      </DemoBlock>

      <DemoBlock
        title="紧凑模式"
        description="compact 降低行距,适合侧栏。"
        code={`<ActivityFeed compact items={...} maxHeight={240} />`}
      >
        <ActivityFeed
          compact
          items={sampleItems}
          maxHeight={240}
          style={{ width: 320, border: '1px solid var(--au-border)', borderRadius: 8, padding: 4 }}
        />
      </DemoBlock>

      <DemoBlock
        title="可点击"
        description="传 onClick,行悬停出现背景。"
        code={`<ActivityFeed items={items.map(i => ({
  ...i,
  onClick: () => router.push(\`/activity/\${i.id}\`),
}))} />`}
      >
        <ActivityFeed
          items={sampleItems.map((i) => ({
            ...i,
            onClick: () => message.info(`打开活动 #${i.id}`),
          }))}
        />
      </DemoBlock>

      <DemoBlock
        title="绝对时间模式"
        description="relativeTime={false} 展示完整时间戳。"
        code={`<ActivityFeed relativeTime={false} items={...} />`}
      >
        <ActivityFeed relativeTime={false} items={sampleItems.slice(0, 4)} />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'items', desc: '动态项', type: 'ActivityItem[]', default: '-' },
          { prop: 'maxHeight', desc: '容器最大高度 (超出滚动)', type: 'number | string', default: '-' },
          { prop: 'compact', desc: '紧凑模式', type: 'boolean', default: 'false' },
          { prop: 'reverse', desc: '新在顶 (默认)', type: 'boolean', default: 'true' },
          { prop: 'highlightNew', desc: '新项插入时闪烁', type: 'boolean', default: 'true' },
          { prop: 'relativeTime', desc: '相对时间 (刚刚 / X 分钟前)', type: 'boolean', default: 'true' },
          { prop: 'emptyText', desc: '无数据文案', type: 'ReactNode', default: `'暂无动态'` },
        ]}
      />
      <h3>ActivityItem</h3>
      <ApiTable
        rows={[
          { prop: 'time', desc: '发生时间', type: 'string | Date', default: '-' },
          { prop: 'title', desc: '标题', type: 'ReactNode', default: '-' },
          { prop: 'description', desc: '描述', type: 'ReactNode', default: '-' },
          { prop: 'user', desc: '用户 { name?, avatar?, initials? }', type: 'object', default: '-' },
          { prop: 'icon', desc: '自定义左侧图标 (替代头像)', type: 'ReactNode', default: '-' },
          { prop: 'type', desc: '语义类型 (决定头像/图标色)', type: `'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'`, default: `'default'` },
          { prop: 'tag', desc: '右上角小标签', type: 'ReactNode', default: '-' },
          { prop: 'meta', desc: '底部元信息 (时间后方)', type: 'ReactNode', default: '-' },
          { prop: 'id', desc: '唯一 key (用于 highlight 去重)', type: 'string | number', default: '-' },
          { prop: 'onClick', desc: '点击', type: '() => void', default: '-' },
        ]}
      />
    </>
  );
};

const LiveDemo: React.FC = () => {
  const [items, setItems] = useState<ActivityItem[]>(sampleItems.slice(0, 4));
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const events: Omit<ActivityItem, 'time' | 'id'>[] = [
      { user: { name: '交易所' }, title: 'BTC 突破 $68,000', type: 'success', tag: '行情' },
      { user: { name: '风控' }, title: '拦截可疑登录', description: 'IP: 45.x.x.x', type: 'warning', tag: '安全' },
      { user: { name: 'Mia' }, title: '提交了新的工单 #4182', type: 'primary', tag: '工单' },
      { user: { name: '系统' }, title: '部署完成', description: 'v2.4.1 已发布到生产', type: 'info', tag: '发布' },
      { user: { name: 'Noah' }, title: '评论了任务', description: '@余星辰 需要你关注一下', type: 'default' },
    ];
    const id = setInterval(() => {
      const pick = events[Math.floor(Math.random() * events.length)];
      const next: ActivityItem = { ...pick, id: Date.now() + Math.random(), time: new Date() };
      setItems((arr) => [next, ...arr].slice(0, 20));
    }, 2500);
    return () => clearInterval(id);
  }, [running]);

  return (
    <div>
      <div style={{ marginBottom: 8, display: 'flex', gap: 8 }}>
        <button
          className={`au-btn au-btn--${running ? 'danger' : 'primary'} au-btn--small`}
          onClick={() => setRunning((v) => !v)}
        >
          {running ? '停止推送' : '开始推送 (每 2.5s)'}
        </button>
        <button className="au-btn au-btn--default au-btn--small" onClick={() => setItems(sampleItems.slice(0, 4))}>
          重置
        </button>
      </div>
      <ActivityFeed
        items={items}
        maxHeight={320}
        style={{ border: '1px solid var(--au-border)', borderRadius: 8, padding: 4 }}
      />
    </div>
  );
};

export default ActivityFeedDoc;
