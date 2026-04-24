import React from 'react';
import './PageShell.css';

export type PageShellLayout = 'side' | 'top-side' | 'top' | 'clean';

export interface PageShellProps {
  header?: React.ReactNode;
  sider?: React.ReactNode;
  content?: React.ReactNode;
  footer?: React.ReactNode;
  /**
   * 布局模式:
   * - side: 侧栏通高 + 主区(顶栏/内容/页脚) (默认)
   * - top-side: 顶栏通宽 + 下方(侧栏/内容/页脚)
   * - top: 顶栏 + 内容 + 页脚 (无侧栏)
   * - clean: 内容居中容器 (可选顶栏 + 页脚)
   */
  layout?: PageShellLayout;
  /** 侧栏位置 */
  siderPlacement?: 'left' | 'right';
  /** 侧栏宽度 (px 或 CSS 宽度) */
  siderWidth?: number | string;
  /** 头部高度 */
  headerHeight?: number | string;
  /** 头部左右内边距 (数字 = px; 字符串 = 任意 CSS 长度, 如 "24px" / "2rem") */
  headerPadding?: number | string;
  /** 内容区左右/上下内边距 (数字 = px 同时左右上下; 字符串传原 CSS) */
  contentPadding?: number | string;
  /** 侧栏是否浅色 (默认深色, 配合 <Menu theme="dark">) */
  siderTheme?: 'dark' | 'light';
  /** clean 布局的最大内容宽度 (px 或 CSS 宽度) */
  maxContentWidth?: number | string;
  /** 让整个 shell 占满父容器高度 (默认 true) */
  fill?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const PageShell: React.FC<PageShellProps> = ({
  header,
  sider,
  content,
  footer,
  layout = 'side',
  siderPlacement = 'left',
  siderWidth = 220,
  headerHeight = 56,
  headerPadding,
  contentPadding,
  siderTheme = 'dark',
  maxContentWidth = 960,
  fill = true,
  className = '',
  style,
}) => {
  const cls = [
    'au-shell',
    `au-shell--layout-${layout}`,
    `au-shell--sider-${siderPlacement}`,
    `au-shell--sider-${siderTheme}`,
    fill ? 'is-fill' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const siderStyle: React.CSSProperties = {
    width: typeof siderWidth === 'number' ? `${siderWidth}px` : siderWidth,
  };
  const headerStyle: React.CSSProperties = {
    height: typeof headerHeight === 'number' ? `${headerHeight}px` : headerHeight,
  };
  // headerPadding 设了就用用户值, 没设保留 CSS 里的默认 `0 24px`
  if (headerPadding != null) {
    const v = typeof headerPadding === 'number' ? `${headerPadding}px` : headerPadding;
    headerStyle.paddingLeft = v;
    headerStyle.paddingRight = v;
  }
  const contentStyle: React.CSSProperties | undefined =
    contentPadding != null
      ? {
          padding:
            typeof contentPadding === 'number'
              ? `${contentPadding}px`
              : contentPadding,
        }
      : undefined;
  const maxW =
    typeof maxContentWidth === 'number' ? `${maxContentWidth}px` : maxContentWidth;

  // top-side: 顶栏通宽, 下方是侧栏+主区
  if (layout === 'top-side') {
    return (
      <div className={cls} style={style}>
        {header && (
          <header className="au-shell__header au-shell__header--full" style={headerStyle}>
            {header}
          </header>
        )}
        <div className="au-shell__body">
          {sider && (
            <aside className="au-shell__sider" style={siderStyle}>
              {sider}
            </aside>
          )}
          <div className="au-shell__main">
            <div className="au-shell__content" style={contentStyle}>{content}</div>
            {footer && <footer className="au-shell__footer">{footer}</footer>}
          </div>
        </div>
      </div>
    );
  }

  // top: 仅顶栏 + 内容
  if (layout === 'top') {
    return (
      <div className={cls} style={style}>
        {header && (
          <header className="au-shell__header au-shell__header--full" style={headerStyle}>
            {header}
          </header>
        )}
        <div className="au-shell__main">
          <div className="au-shell__content" style={contentStyle}>{content}</div>
          {footer && <footer className="au-shell__footer">{footer}</footer>}
        </div>
      </div>
    );
  }

  // clean: 居中容器 + 可选顶栏/页脚
  if (layout === 'clean') {
    return (
      <div className={cls} style={style}>
        {header && (
          <header className="au-shell__header au-shell__header--full" style={headerStyle}>
            <div className="au-shell__center" style={{ maxWidth: maxW }}>
              {header}
            </div>
          </header>
        )}
        <div className="au-shell__content au-shell__content--center" style={contentStyle}>
          <div className="au-shell__center" style={{ maxWidth: maxW }}>
            {content}
          </div>
        </div>
        {footer && (
          <footer className="au-shell__footer au-shell__footer--center">
            <div className="au-shell__center" style={{ maxWidth: maxW }}>
              {footer}
            </div>
          </footer>
        )}
      </div>
    );
  }

  // side (默认): 侧栏通高 + 主区
  return (
    <div className={cls} style={style}>
      {sider && (
        <aside className="au-shell__sider" style={siderStyle}>
          {sider}
        </aside>
      )}
      <div className="au-shell__main">
        {header && (
          <header className="au-shell__header" style={headerStyle}>
            {header}
          </header>
        )}
        <div className="au-shell__content" style={contentStyle}>{content}</div>
        {footer && <footer className="au-shell__footer">{footer}</footer>}
      </div>
    </div>
  );
};

export default PageShell;
