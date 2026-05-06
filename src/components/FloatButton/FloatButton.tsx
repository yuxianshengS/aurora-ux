import React, { useEffect, useRef, useState } from 'react';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import './FloatButton.css';

export type FloatButtonPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left';

export interface FloatButtonAction {
  /** 唯一 key */
  key: string;
  /** 子按钮图标 */
  icon: React.ReactNode;
  /** 提示文字 (hover 显示) */
  tooltip?: React.ReactNode;
  /** 点击 */
  onClick?: () => void;
}

export interface FloatButtonProps {
  /** 主按钮图标 */
  icon?: React.ReactNode;
  /** 主按钮 tooltip */
  tooltip?: React.ReactNode;
  /** 点击主按钮 (有 actions 时, 主按钮变成"展开 speed dial") */
  onClick?: () => void;
  /** speed dial 子按钮 */
  actions?: FloatButtonAction[];
  /** 显示位置 */
  position?: FloatButtonPosition;
  /** 自定义偏移 (覆盖 position 默认 24px) */
  offset?: { x?: number; y?: number };
  /** 视觉风格 */
  variant?: 'aurora' | 'primary' | 'default';
  /** 形状 */
  shape?: 'circle' | 'square';
  /** 直径 / 边长 (px) */
  size?: number;
  /** 滚动到顶模式 — 配 backTopVisible 滚到一定距离才出现 */
  backTop?: boolean;
  /** backTop 模式下, scrollTop 大于多少才显示 */
  backTopThreshold?: number;
  /** inline 模式 — 脱离 fixed 定位,以普通 inline-block 渲染。适合 doc 内嵌预览 / 工具栏插入 */
  inline?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const PlusIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden>
    <path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const ArrowUpIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden>
    <path d="M8 13V3M4 7l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * 悬浮按钮 (FAB) — 绝对定位贴角的圆按钮, 常用于反馈 / 回到顶部 / 快速操作。
 * 跟普通 Button 不重叠 — Button 是流式布局,这是 fixed 位置 + 圆形 + speed dial 弹出。
 *
 * Aurora 招牌:variant="aurora" 默认极光渐变背景 + 光晕。
 */
const FloatButton: React.FC<FloatButtonProps> = ({
  icon,
  tooltip,
  onClick,
  actions,
  position = 'bottom-right',
  offset,
  variant = 'aurora',
  shape = 'circle',
  size = 48,
  backTop,
  backTopThreshold = 200,
  inline,
  className = '',
  style,
}) => {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(!backTop);
  const rootRef = useRef<HTMLDivElement>(null);

  // backTop 模式监听滚动
  useEffect(() => {
    if (!backTop) return;
    const onScroll = () => {
      setVisible(window.scrollY > backTopThreshold);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [backTop, backTopThreshold]);

  // 点击外部关闭 speed dial
  useOutsideClick([rootRef], () => setOpen(false), open);

  if (!visible) return null;

  const hasActions = actions && actions.length > 0;
  const isBackTop = !!backTop;

  const handleMain = () => {
    if (isBackTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (hasActions) {
      setOpen((v) => !v);
      return;
    }
    onClick?.();
  };

  const positionStyle: React.CSSProperties = {};
  if (!inline) {
    const ox = offset?.x ?? 24;
    const oy = offset?.y ?? 24;
    if (position.includes('right')) positionStyle.right = ox;
    else positionStyle.left = ox;
    if (position.includes('bottom')) positionStyle.bottom = oy;
    else positionStyle.top = oy;
  }

  const mainIcon = isBackTop ? <ArrowUpIcon /> : icon ?? <PlusIcon />;
  const mainTooltip = isBackTop ? '返回顶部' : tooltip;

  return (
    <div
      ref={rootRef}
      className={[
        'au-fab-root',
        `au-fab-root--${position}`,
        inline ? 'au-fab-root--inline' : '',
        open ? 'is-open' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...positionStyle, ...style }}
    >
      {hasActions && (
        <div className="au-fab-actions" aria-hidden={!open}>
          {actions!.map((a, i) => (
            <button
              key={a.key}
              type="button"
              className="au-fab au-fab--action"
              style={{
                width: size * 0.85,
                height: size * 0.85,
                transitionDelay: `${open ? i * 30 : (actions!.length - 1 - i) * 30}ms`,
              }}
              onClick={() => {
                a.onClick?.();
                setOpen(false);
              }}
              aria-label={typeof a.tooltip === 'string' ? a.tooltip : a.key}
            >
              {a.icon}
              {a.tooltip && <span className="au-fab__tooltip">{a.tooltip}</span>}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        className={[
          'au-fab',
          'au-fab--main',
          `au-fab--${variant}`,
          `au-fab--${shape}`,
        ].join(' ')}
        style={{ width: size, height: size }}
        onClick={handleMain}
        aria-label={typeof mainTooltip === 'string' ? mainTooltip : 'FloatButton'}
        aria-expanded={hasActions ? open : undefined}
      >
        <span
          className={[
            'au-fab__icon',
            hasActions && open ? 'is-rotated' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {mainIcon}
        </span>
        {mainTooltip && <span className="au-fab__tooltip">{mainTooltip}</span>}
      </button>
    </div>
  );
};

export default FloatButton;
