import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './Tabs.css';

export type TabsType = 'line' | 'card' | 'segment';
export type TabsPosition = 'top' | 'bottom' | 'left' | 'right';
export type TabsSize = 'small' | 'medium' | 'large';

export interface TabItem {
  key: string;
  label: React.ReactNode;
  children?: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  type?: TabsType;
  tabPosition?: TabsPosition;
  size?: TabsSize;
  centered?: boolean;
  tabBarExtraContent?: React.ReactNode;
  destroyInactiveTabPane?: boolean;
  animated?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const Tabs: React.FC<TabsProps> = ({
  items,
  activeKey: controlledKey,
  defaultActiveKey,
  onChange,
  type = 'line',
  tabPosition = 'top',
  size = 'medium',
  centered,
  tabBarExtraContent,
  destroyInactiveTabPane,
  animated = true,
  className = '',
  style,
}) => {
  const isControlled = controlledKey !== undefined;
  const firstKey = items[0]?.key;
  const [innerKey, setInnerKey] = useState<string | undefined>(
    defaultActiveKey ?? firstKey,
  );
  const activeKey = isControlled ? controlledKey! : innerKey;

  const barRef = useRef<HTMLDivElement>(null);
  const [inkStyle, setInkStyle] = useState<React.CSSProperties>({});

  const horizontal = tabPosition === 'top' || tabPosition === 'bottom';

  useLayoutEffect(() => {
    if (type !== 'line') {
      setInkStyle({});
      return;
    }
    const bar = barRef.current;
    if (!bar) return;
    const activeEl = bar.querySelector<HTMLElement>(`[data-key="${activeKey}"]`);
    if (!activeEl) {
      setInkStyle({});
      return;
    }
    if (horizontal) {
      setInkStyle({
        width: activeEl.offsetWidth,
        transform: `translateX(${activeEl.offsetLeft}px)`,
      });
    } else {
      setInkStyle({
        height: activeEl.offsetHeight,
        transform: `translateY(${activeEl.offsetTop}px)`,
      });
    }
  }, [activeKey, items, type, horizontal, size, centered]);

  useEffect(() => {
    const onResize = () => {
      // trigger a re-layout by touching state
      const bar = barRef.current;
      if (!bar) return;
      const activeEl = bar.querySelector<HTMLElement>(`[data-key="${activeKey}"]`);
      if (!activeEl) return;
      if (horizontal) {
        setInkStyle({
          width: activeEl.offsetWidth,
          transform: `translateX(${activeEl.offsetLeft}px)`,
        });
      } else {
        setInkStyle({
          height: activeEl.offsetHeight,
          transform: `translateY(${activeEl.offsetTop}px)`,
        });
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [activeKey, horizontal]);

  const pick = (key: string) => {
    if (!isControlled) setInnerKey(key);
    onChange?.(key);
  };

  const cls = [
    'au-tabs',
    `au-tabs--${type}`,
    `au-tabs--${tabPosition}`,
    `au-tabs--${size}`,
    centered ? 'is-centered' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const nav = (
    <div className="au-tabs__nav">
      <div ref={barRef} className="au-tabs__bar" role="tablist">
        {items.map((it) => {
          const isActive = it.key === activeKey;
          const tabCls = [
            'au-tabs__tab',
            isActive ? 'is-active' : '',
            it.disabled ? 'is-disabled' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button
              key={it.key}
              type="button"
              role="tab"
              data-key={it.key}
              aria-selected={isActive}
              aria-disabled={it.disabled || undefined}
              className={tabCls}
              disabled={it.disabled}
              onClick={() => !it.disabled && pick(it.key)}
            >
              {it.icon && <span className="au-tabs__tab-icon">{it.icon}</span>}
              <span className="au-tabs__tab-label">{it.label}</span>
            </button>
          );
        })}
        {type === 'line' && <span className="au-tabs__ink" style={inkStyle} />}
      </div>
      {tabBarExtraContent && <div className="au-tabs__extra">{tabBarExtraContent}</div>}
    </div>
  );

  const activeIdx = items.findIndex((i) => i.key === activeKey);
  const content = (
    <div className="au-tabs__content">
      {items.map((it, i) => {
        if (destroyInactiveTabPane && i !== activeIdx) return null;
        return (
          <div
            key={it.key}
            role="tabpanel"
            aria-hidden={i !== activeIdx}
            className={['au-tabs__pane', i === activeIdx ? 'is-active' : '', animated ? 'is-animated' : ''].filter(Boolean).join(' ')}
            style={i !== activeIdx ? { display: 'none' } : undefined}
          >
            {it.children}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={cls} style={style}>
      {tabPosition === 'bottom' ? (
        <>
          {content}
          {nav}
        </>
      ) : (
        <>
          {nav}
          {content}
        </>
      )}
    </div>
  );
};

export default Tabs;
