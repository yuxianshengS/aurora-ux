import React from 'react';
import { useLocale } from '../ConfigProvider/ConfigProvider';
import './MessageBubble.css';

export type MessageBubbleRole = 'user' | 'assistant' | 'system' | 'tool';
export type MessageBubbleAlign = 'left' | 'right' | 'auto';

export interface MessageBubbleProps {
  /** 消息身份 — 决定默认对齐 + 视觉风格. user 默认右对齐, 其他左对齐 */
  role: MessageBubbleRole;
  /** 消息正文 — 字符串或 ReactNode (StreamingText / Markdown 渲染等都能塞) */
  children?: React.ReactNode;
  /** 头像 / 图标 — 显示在气泡侧边. 不传时按 role 隐藏 */
  avatar?: React.ReactNode;
  /** 显示名 (覆盖 locale 默认: 助手 / 我 / 系统) */
  name?: React.ReactNode;
  /** 时间戳 — 显示在 name 右侧. 字符串原样, Date 自动格式化 HH:mm */
  timestamp?: Date | string;
  /** 强制对齐 — auto = 按 role 自动 (user 右, 其他左) */
  align?: MessageBubbleAlign;
  /** 加载态 — 显示三个跳动的点替代 children, 适合 assistant 准备首 token 时 */
  loading?: boolean;
  /** 工具调用 role 时的工具名 (显示在头部 'tool: search_web') */
  toolName?: string;
  /** 底部操作区 — 一般是 复制 / 重新生成 / 点赞点踩 等按钮 */
  actions?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const formatTime = (t: Date | string): string => {
  if (typeof t === 'string') return t;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(t.getHours())}:${pad(t.getMinutes())}`;
};

/**
 * MessageBubble — LLM 聊天气泡
 *
 * 4 种 role:
 *  - user: 右对齐, primary 实色背景, 给"我说的话"
 *  - assistant: 左对齐, 极光描边卡片, 给 AI 回复
 *  - system: 居中小字, 给系统提示
 *  - tool: 左对齐, 等宽字体卡, 给函数调用结果
 */
const MessageBubble: React.FC<MessageBubbleProps> = ({
  role,
  children,
  avatar,
  name,
  timestamp,
  align = 'auto',
  loading,
  toolName,
  actions,
  className = '',
  style,
}) => {
  const locale = useLocale();
  const resolvedAlign: 'left' | 'right' =
    align === 'auto' ? (role === 'user' ? 'right' : 'left') : align;

  // system 显示为居中小提示, 不走气泡布局
  if (role === 'system') {
    return (
      <div
        className={['au-msg-bubble', 'au-msg-bubble--system', className].filter(Boolean).join(' ')}
        style={style}
        role="status"
      >
        <span className="au-msg-bubble__system-text">{children}</span>
      </div>
    );
  }

  const defaultName =
    name ??
    (role === 'assistant'
      ? locale.MessageBubble.assistant
      : role === 'user'
      ? locale.MessageBubble.user
      : toolName
      ? `tool: ${toolName}`
      : 'tool');

  const showHeader = !!(name || timestamp || role === 'tool');

  const cls = [
    'au-msg-bubble',
    `au-msg-bubble--${role}`,
    `au-msg-bubble--align-${resolvedAlign}`,
    loading ? 'is-loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls} style={style} role="article" aria-label={String(defaultName)}>
      {avatar && <div className="au-msg-bubble__avatar">{avatar}</div>}
      <div className="au-msg-bubble__main">
        {showHeader && (
          <div className="au-msg-bubble__header">
            <span className="au-msg-bubble__name">{defaultName}</span>
            {timestamp && (
              <time className="au-msg-bubble__time">{formatTime(timestamp)}</time>
            )}
          </div>
        )}
        <div className="au-msg-bubble__body">
          {loading ? (
            <span className="au-msg-bubble__dots" aria-label="loading">
              <i /><i /><i />
            </span>
          ) : (
            children
          )}
        </div>
        {actions && !loading && <div className="au-msg-bubble__actions">{actions}</div>}
      </div>
    </div>
  );
};

export default MessageBubble;
