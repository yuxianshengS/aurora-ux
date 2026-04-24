import React, { useEffect, useRef, useState } from 'react';
import './Menu.css';

export type MenuMode = 'vertical' | 'horizontal' | 'inline';
export type MenuTheme = 'light' | 'dark';

export type MenuItem =
  | {
      key: string;
      label: React.ReactNode;
      icon?: React.ReactNode;
      disabled?: boolean;
      danger?: boolean;
      type?: undefined;
      children?: never;
    }
  | {
      key: string;
      label: React.ReactNode;
      icon?: React.ReactNode;
      disabled?: boolean;
      type?: undefined;
      children: MenuItem[];
    }
  | {
      type: 'divider';
      key?: string;
    }
  | {
      type: 'group';
      key: string;
      label: React.ReactNode;
      children: MenuItem[];
    };

export interface MenuProps {
  items: MenuItem[];
  mode?: MenuMode;
  theme?: MenuTheme;
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  openKeys?: string[];
  defaultOpenKeys?: string[];
  collapsed?: boolean;
  onSelect?: (info: { key: string; selectedKeys: string[]; item: MenuItem }) => void;
  onClick?: (info: { key: string; item: MenuItem }) => void;
  onOpenChange?: (openKeys: string[]) => void;
  className?: string;
  style?: React.CSSProperties;
}

const ChevronDown: React.FC = () => (
  <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden className="au-menu__caret">
    <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const isLeaf = (item: MenuItem): item is Extract<MenuItem, { type?: undefined; children?: never }> =>
  !('type' in item && item.type) && !('children' in item && item.children);

const isSub = (item: MenuItem): item is Extract<MenuItem, { type?: undefined; children: MenuItem[] }> =>
  !('type' in item && item.type) && 'children' in item && Array.isArray((item as any).children);

const isDivider = (item: MenuItem): item is Extract<MenuItem, { type: 'divider' }> =>
  (item as any).type === 'divider';

const isGroup = (item: MenuItem): item is Extract<MenuItem, { type: 'group' }> =>
  (item as any).type === 'group';

const Menu: React.FC<MenuProps> = ({
  items,
  mode = 'vertical',
  theme = 'light',
  selectedKeys: ctrlSelected,
  defaultSelectedKeys,
  openKeys: ctrlOpen,
  defaultOpenKeys,
  collapsed,
  onSelect,
  onClick,
  onOpenChange,
  className = '',
  style,
}) => {
  const selCtrl = ctrlSelected !== undefined;
  const openCtrl = ctrlOpen !== undefined;
  const [innerSel, setInnerSel] = useState<string[]>(defaultSelectedKeys ?? []);
  const [innerOpen, setInnerOpen] = useState<string[]>(defaultOpenKeys ?? []);
  const selectedKeys = selCtrl ? ctrlSelected! : innerSel;
  const openKeys = openCtrl ? ctrlOpen! : innerOpen;

  const setOpen = (keys: string[]) => {
    if (!openCtrl) setInnerOpen(keys);
    onOpenChange?.(keys);
  };

  const toggleSub = (key: string) => {
    const next = openKeys.includes(key)
      ? openKeys.filter((k) => k !== key)
      : [...openKeys, key];
    setOpen(next);
  };

  const pickLeaf = (item: Extract<MenuItem, { type?: undefined; children?: never }>) => {
    if (item.disabled) return;
    const next = [item.key];
    if (!selCtrl) setInnerSel(next);
    onSelect?.({ key: item.key, selectedKeys: next, item });
    onClick?.({ key: item.key, item });
  };

  const rootCls = [
    'au-menu',
    `au-menu--${mode}`,
    `au-menu--${theme}`,
    collapsed && mode === 'inline' ? 'is-collapsed' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderItems = (list: MenuItem[], depth = 0): React.ReactNode =>
    list.map((item, idx) => {
      if (isDivider(item)) {
        return <li key={item.key ?? `d-${idx}`} className="au-menu__divider" role="separator" />;
      }
      if (isGroup(item)) {
        return (
          <li key={item.key} className="au-menu__group">
            <div className="au-menu__group-title">{item.label}</div>
            <ul className="au-menu__group-list">{renderItems(item.children, depth)}</ul>
          </li>
        );
      }
      if (isSub(item)) {
        return (
          <SubMenu
            key={item.key}
            item={item}
            depth={depth}
            mode={mode}
            collapsed={!!collapsed && mode === 'inline'}
            openKeys={openKeys}
            selectedKeys={selectedKeys}
            toggleSub={toggleSub}
            onPick={pickLeaf}
            renderItems={renderItems}
          />
        );
      }
      // leaf
      const leaf = item as Extract<MenuItem, { type?: undefined; children?: never }>;
      const active = selectedKeys.includes(leaf.key);
      const cls = [
        'au-menu__item',
        active ? 'is-selected' : '',
        leaf.disabled ? 'is-disabled' : '',
        leaf.danger ? 'is-danger' : '',
      ]
        .filter(Boolean)
        .join(' ');
      return (
        <li
          key={leaf.key}
          className={cls}
          role="menuitem"
          aria-disabled={leaf.disabled || undefined}
          style={mode === 'inline' ? { paddingLeft: 16 + depth * 20 } : undefined}
          onClick={() => pickLeaf(leaf)}
        >
          {leaf.icon && <span className="au-menu__icon">{leaf.icon}</span>}
          <span className="au-menu__label">{leaf.label}</span>
        </li>
      );
    });

  return (
    <ul className={rootCls} style={style} role="menu">
      {renderItems(items)}
    </ul>
  );
};

interface SubMenuProps {
  item: Extract<MenuItem, { type?: undefined; children: MenuItem[] }>;
  depth: number;
  mode: MenuMode;
  collapsed: boolean;
  openKeys: string[];
  selectedKeys: string[];
  toggleSub: (key: string) => void;
  onPick: (item: Extract<MenuItem, { type?: undefined; children?: never }>) => void;
  renderItems: (list: MenuItem[], depth?: number) => React.ReactNode;
}

const SubMenu: React.FC<SubMenuProps> = ({
  item,
  depth,
  mode,
  collapsed,
  openKeys,
  selectedKeys,
  toggleSub,
  onPick,
  renderItems,
}) => {
  const open = openKeys.includes(item.key);
  const [hover, setHover] = useState(false);
  const wrapRef = useRef<HTMLLIElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const isPopupMode = mode === 'horizontal' || mode === 'vertical' || collapsed;

  useEffect(() => {
    if (!isPopupMode || !hover) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t)) return;
      if (popupRef.current?.contains(t)) return;
      setHover(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isPopupMode, hover]);

  const containsActive = (list: MenuItem[]): boolean =>
    list.some((i) => {
      if (isSub(i)) return containsActive(i.children);
      if (isGroup(i)) return containsActive(i.children);
      if (isLeaf(i)) return selectedKeys.includes(i.key);
      return false;
    });

  const descendantActive = containsActive(item.children);

  const cls = [
    'au-menu__sub',
    open ? 'is-open' : '',
    hover ? 'is-hover' : '',
    item.disabled ? 'is-disabled' : '',
    descendantActive ? 'is-descendant-active' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const titleCls = [
    'au-menu__sub-title',
    descendantActive ? 'is-selected' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleTitleClick = () => {
    if (item.disabled) return;
    if (mode === 'inline' && !collapsed) {
      toggleSub(item.key);
    } else {
      setHover((v) => !v);
    }
  };

  const handleMouseEnter = () => {
    if (isPopupMode && !item.disabled) setHover(true);
  };
  const handleMouseLeave = () => {
    if (isPopupMode) setHover(false);
  };

  return (
    <li
      ref={wrapRef}
      className={cls}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={titleCls}
        role="menuitem"
        aria-haspopup="true"
        aria-expanded={mode === 'inline' ? open : hover}
        style={mode === 'inline' ? { paddingLeft: 16 + depth * 20 } : undefined}
        onClick={handleTitleClick}
      >
        {item.icon && <span className="au-menu__icon">{item.icon}</span>}
        <span className="au-menu__label">{item.label}</span>
        {!collapsed && <ChevronDown />}
      </div>
      {mode === 'inline' && !collapsed && open && (
        <ul className="au-menu__sub-list">{renderItems(item.children, depth + 1)}</ul>
      )}
      {isPopupMode && hover && (
        <div
          ref={popupRef}
          className={`au-menu__popup au-menu__popup--${mode === 'horizontal' ? 'below' : 'right'}`}
        >
          <ul className="au-menu au-menu--vertical au-menu__popup-list">
            {renderItems(item.children, 0)}
          </ul>
        </div>
      )}
    </li>
  );
};

export default Menu;
