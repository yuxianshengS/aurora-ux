import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './ActivityFeed.css';

export type ActivityType = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';

export interface ActivityItem {
  id?: string | number;
  time: string | Date;
  title: React.ReactNode;
  description?: React.ReactNode;
  user?: {
    name?: string;
    avatar?: string;
    initials?: string;
  };
  tag?: React.ReactNode;
  type?: ActivityType;
  icon?: React.ReactNode;
  meta?: React.ReactNode;
  onClick?: () => void;
}

export interface ActivityFeedProps {
  items: ActivityItem[];
  maxHeight?: number | string;
  compact?: boolean;
  /** 倒叙 (新的在顶; 默认 true) */
  reverse?: boolean;
  /** 新项滚动进入时短暂高亮 */
  highlightNew?: boolean;
  /** 显示相对时间 (几分钟前) */
  relativeTime?: boolean;
  emptyText?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const toDate = (v: string | Date): Date => (v instanceof Date ? v : new Date(v));

const relTime = (d: Date): string => {
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} 天前`;
  return d.toLocaleDateString();
};

const absTime = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  items,
  maxHeight,
  compact,
  reverse = true,
  highlightNew = true,
  relativeTime = true,
  emptyText = '暂无动态',
  className = '',
  style,
}) => {
  const sorted = useMemo(() => {
    const arr = items.map((it, i) => ({
      ...it,
      _date: toDate(it.time),
      _key: it.id != null ? String(it.id) : `idx-${i}-${String(it.time)}`,
    }));
    arr.sort((a, b) => b._date.getTime() - a._date.getTime());
    return reverse ? arr : arr.reverse();
  }, [items, reverse]);

  const prevKeys = useRef<Set<string>>(new Set());
  const [newKeys, setNewKeys] = useState<Set<string>>(new Set());

  useLayoutEffect(() => {
    if (!highlightNew) return;
    const currKeys = new Set(sorted.map((s) => s._key));
    const added = new Set<string>();
    currKeys.forEach((k) => {
      if (!prevKeys.current.has(k)) added.add(k);
    });
    prevKeys.current = currKeys;
    if (added.size > 0) {
      setNewKeys(added);
      const t = setTimeout(() => setNewKeys(new Set()), 1400);
      return () => clearTimeout(t);
    }
  }, [sorted, highlightNew]);

  // refresh relative-time labels every minute
  const [, force] = useState(0);
  useEffect(() => {
    if (!relativeTime) return;
    const id = setInterval(() => force((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, [relativeTime]);

  const cls = [
    'au-activity-feed',
    compact ? 'is-compact' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (sorted.length === 0) {
    return (
      <div className={cls} style={{ ...style, maxHeight }}>
        <div className="au-activity-feed__empty">{emptyText}</div>
      </div>
    );
  }

  return (
    <div className={cls} style={{ ...style, maxHeight, overflowY: maxHeight != null ? 'auto' : undefined }}>
      <ul className="au-activity-feed__list">
        {sorted.map((it) => {
          const t = it.type ?? 'default';
          const isNew = newKeys.has(it._key);
          const entryCls = [
            'au-activity-feed__item',
            `au-activity-feed__item--${t}`,
            isNew ? 'is-new' : '',
            it.onClick ? 'is-clickable' : '',
          ]
            .filter(Boolean)
            .join(' ');
          const avatar = it.user?.avatar ? (
            <img src={it.user.avatar} alt={it.user.name ?? ''} className="au-activity-feed__avatar" />
          ) : it.icon ? (
            <span className={`au-activity-feed__icon au-activity-feed__icon--${t}`}>{it.icon}</span>
          ) : (
            <span className={`au-activity-feed__avatar au-activity-feed__avatar--text au-activity-feed__avatar--${t}`}>
              {it.user?.initials ?? (it.user?.name ? it.user.name.slice(0, 1) : '·')}
            </span>
          );
          return (
            <li key={it._key} className={entryCls} onClick={it.onClick}>
              <div className="au-activity-feed__left">
                {avatar}
                <span className={`au-activity-feed__dot au-activity-feed__dot--${t}`} />
              </div>
              <div className="au-activity-feed__body">
                <div className="au-activity-feed__top">
                  <div className="au-activity-feed__title">
                    {it.user?.name && <span className="au-activity-feed__user">{it.user.name}</span>}
                    <span>{it.title}</span>
                  </div>
                  {it.tag && <span className="au-activity-feed__tag">{it.tag}</span>}
                </div>
                {it.description && (
                  <div className="au-activity-feed__desc">{it.description}</div>
                )}
                <div className="au-activity-feed__meta">
                  <span className="au-activity-feed__time" title={absTime(it._date)}>
                    {relativeTime ? relTime(it._date) : absTime(it._date)}
                  </span>
                  {it.meta}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ActivityFeed;
