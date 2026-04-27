import React, { useState } from 'react';
import './Tree.css';

export interface TreeNode {
  key: string;
  title: React.ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
  /** 节点前的图标 (可选) */
  icon?: React.ReactNode;
}

export interface TreeProps {
  treeData: TreeNode[];
  /** 受控展开 keys */
  expandedKeys?: string[];
  defaultExpandedKeys?: string[];
  /** 全部展开 */
  defaultExpandAll?: boolean;
  /** 受控选中 keys (单选) */
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  /** 是否多选 (selectedKeys 变成数组多个) */
  multiple?: boolean;
  /** 显示复选框 */
  checkable?: boolean;
  /** 受控勾选 keys */
  checkedKeys?: string[];
  defaultCheckedKeys?: string[];
  onSelect?: (keys: string[], info: { node: TreeNode }) => void;
  onCheck?: (keys: string[], info: { node: TreeNode; checked: boolean }) => void;
  onExpand?: (keys: string[]) => void;
  /** 显示连接线 */
  showLine?: boolean;
  /** 整行可点 (默认只 title 区域) */
  blockNode?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const collectAllKeys = (nodes: TreeNode[]): string[] => {
  const out: string[] = [];
  const walk = (arr: TreeNode[]) => {
    for (const n of arr) {
      out.push(n.key);
      if (n.children) walk(n.children);
    }
  };
  walk(nodes);
  return out;
};

const findNode = (nodes: TreeNode[], key: string): TreeNode | null => {
  for (const n of nodes) {
    if (n.key === key) return n;
    if (n.children) {
      const found = findNode(n.children, key);
      if (found) return found;
    }
  }
  return null;
};

const getDescendantKeys = (node: TreeNode): string[] => {
  const out = [node.key];
  const walk = (arr: TreeNode[]) => arr.forEach((n) => { out.push(n.key); if (n.children) walk(n.children); });
  if (node.children) walk(node.children);
  return out;
};

const Caret: React.FC<{ open: boolean }> = ({ open }) => (
  <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden style={{ transform: open ? 'rotate(90deg)' : undefined, transition: 'transform 0.15s' }}>
    <path d="M5 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Tree: React.FC<TreeProps> = ({
  treeData,
  expandedKeys: ctrlExpanded,
  defaultExpandedKeys,
  defaultExpandAll,
  selectedKeys: ctrlSelected,
  defaultSelectedKeys,
  multiple,
  checkable,
  checkedKeys: ctrlChecked,
  defaultCheckedKeys,
  onSelect,
  onCheck,
  onExpand,
  showLine,
  blockNode,
  className = '',
  style,
}) => {
  const isExCtrl = ctrlExpanded !== undefined;
  const isSelCtrl = ctrlSelected !== undefined;
  const isCkCtrl = ctrlChecked !== undefined;
  const [innerExpanded, setInnerExpanded] = useState<string[]>(
    defaultExpandedKeys ?? (defaultExpandAll ? collectAllKeys(treeData) : []),
  );
  const [innerSelected, setInnerSelected] = useState<string[]>(defaultSelectedKeys ?? []);
  const [innerChecked, setInnerChecked] = useState<string[]>(defaultCheckedKeys ?? []);
  const expandedKeys = isExCtrl ? ctrlExpanded! : innerExpanded;
  const selectedKeys = isSelCtrl ? ctrlSelected! : innerSelected;
  const checkedKeys = isCkCtrl ? ctrlChecked! : innerChecked;

  const setExpanded = (k: string) => {
    const next = expandedKeys.includes(k) ? expandedKeys.filter((x) => x !== k) : [...expandedKeys, k];
    if (!isExCtrl) setInnerExpanded(next);
    onExpand?.(next);
  };

  const handleSelect = (node: TreeNode) => {
    if (node.disabled) return;
    let next: string[];
    if (multiple) {
      next = selectedKeys.includes(node.key)
        ? selectedKeys.filter((k) => k !== node.key)
        : [...selectedKeys, node.key];
    } else {
      next = [node.key];
    }
    if (!isSelCtrl) setInnerSelected(next);
    onSelect?.(next, { node });
  };

  const handleCheck = (node: TreeNode) => {
    if (node.disabled) return;
    const subKeys = getDescendantKeys(node);
    const isChecked = checkedKeys.includes(node.key);
    const next = isChecked
      ? checkedKeys.filter((k) => !subKeys.includes(k))
      : Array.from(new Set([...checkedKeys, ...subKeys]));
    if (!isCkCtrl) setInnerChecked(next);
    onCheck?.(next, { node, checked: !isChecked });
  };

  const renderNode = (node: TreeNode, depth: number): React.ReactNode => {
    const hasChildren = !!(node.children && node.children.length > 0);
    const expanded = expandedKeys.includes(node.key);
    const selected = selectedKeys.includes(node.key);
    const checked = checkedKeys.includes(node.key);
    const itemCls = [
      'au-tree__item',
      selected ? 'is-selected' : '',
      node.disabled ? 'is-disabled' : '',
      blockNode ? 'is-block' : '',
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <li key={node.key} className="au-tree__node">
        <div className={itemCls} style={{ paddingLeft: depth * 18 + 6 }}>
          {hasChildren ? (
            <button
              type="button"
              className="au-tree__caret"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(node.key);
              }}
              aria-label={expanded ? '收起' : '展开'}
            >
              <Caret open={expanded} />
            </button>
          ) : (
            <span className="au-tree__caret au-tree__caret--leaf" />
          )}
          {checkable && (
            <span
              className={['au-tree__check', checked ? 'is-checked' : ''].filter(Boolean).join(' ')}
              onClick={(e) => {
                e.stopPropagation();
                handleCheck(node);
              }}
              role="checkbox"
              aria-checked={checked}
            >
              {checked && (
                <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden>
                  <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          )}
          {node.icon && <span className="au-tree__icon">{node.icon}</span>}
          <span className="au-tree__title" onClick={() => handleSelect(node)}>
            {node.title}
          </span>
        </div>
        {hasChildren && expanded && (
          <ul className="au-tree__children">
            {node.children!.map((c) => renderNode(c, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <ul
      className={['au-tree', showLine ? 'au-tree--line' : '', className].filter(Boolean).join(' ')}
      style={style}
      role="tree"
    >
      {treeData.map((n) => renderNode(n, 0))}
    </ul>
  );
};

export default Tree;
