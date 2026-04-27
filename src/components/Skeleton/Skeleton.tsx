import React from 'react';
import './Skeleton.css';

export interface SkeletonProps {
  /** 加载态: true 显示占位; false 显示 children */
  loading?: boolean;
  /** 闪烁动画 */
  active?: boolean;
  /** 段落行数 */
  rows?: number;
  /** 显示标题占位 */
  title?: boolean;
  /** 显示头像占位 (true 默认 40, 数字自定义) */
  avatar?: boolean | number;
  /** 段落每行宽度差异 (最后一行短一点更真实) */
  varyRows?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({
  loading = true,
  active = true,
  rows = 3,
  title = true,
  avatar = false,
  varyRows = true,
  children,
  className = '',
  style,
}) => {
  if (!loading) return <>{children}</>;
  const avatarSize = typeof avatar === 'number' ? avatar : 40;
  const cls = ['au-skeleton', active ? 'is-active' : '', className].filter(Boolean).join(' ');
  return (
    <div className={cls} style={style}>
      {avatar && (
        <div
          className="au-skeleton__avatar"
          style={{ width: avatarSize, height: avatarSize, borderRadius: '50%' }}
        />
      )}
      <div className="au-skeleton__body">
        {title && <div className="au-skeleton__title" />}
        {Array.from({ length: rows }).map((_, i) => {
          const isLast = i === rows - 1;
          const w = varyRows ? (isLast ? '60%' : i === 0 ? '100%' : '92%') : '100%';
          return <div key={i} className="au-skeleton__row" style={{ width: w }} />;
        })}
      </div>
    </div>
  );
};

export default Skeleton;
