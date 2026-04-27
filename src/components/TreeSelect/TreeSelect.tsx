import React, { useEffect, useRef, useState } from 'react';
import Tree, { type TreeNode } from '../Tree/Tree';
import './TreeSelect.css';

export interface TreeSelectProps {
  treeData: TreeNode[];
  /** 受控值 */
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  /** 默认展开全部 */
  treeDefaultExpandAll?: boolean;
  /** 弹出框宽度, 默认跟触发器同宽 */
  popupWidth?: number | string;
  onChange?: (value: string, label?: React.ReactNode) => void;
  className?: string;
  style?: React.CSSProperties;
}

const findTitle = (nodes: TreeNode[], key: string): React.ReactNode | undefined => {
  for (const n of nodes) {
    if (n.key === key) return n.title;
    if (n.children) {
      const t = findTitle(n.children, key);
      if (t !== undefined) return t;
    }
  }
  return undefined;
};

const TreeSelect: React.FC<TreeSelectProps> = ({
  treeData,
  value: ctrlValue,
  defaultValue,
  placeholder = '请选择',
  disabled,
  allowClear,
  treeDefaultExpandAll,
  popupWidth,
  onChange,
  className = '',
  style,
}) => {
  const isCtrl = ctrlValue !== undefined;
  const [innerValue, setInnerValue] = useState<string | undefined>(defaultValue);
  const value = isCtrl ? ctrlValue! : innerValue;
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const label = value ? findTitle(treeData, value) : undefined;

  const handleSelect = (keys: string[]) => {
    const k = keys[0];
    if (!isCtrl) setInnerValue(k);
    onChange?.(k, k ? findTitle(treeData, k) : undefined);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCtrl) setInnerValue(undefined);
    onChange?.('', undefined);
  };

  const cls = [
    'au-tree-select',
    open ? 'is-open' : '',
    disabled ? 'is-disabled' : '',
    !value ? 'is-empty' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={wrapRef} className={cls} style={style}>
      <div
        className="au-tree-select__trigger"
        onClick={() => !disabled && setOpen((v) => !v)}
        role="combobox"
        aria-expanded={open}
      >
        <span className="au-tree-select__label">{label ?? placeholder}</span>
        {allowClear && value && (
          <span className="au-tree-select__clear" onClick={handleClear} aria-label="清除">✕</span>
        )}
        <span className={['au-tree-select__caret', open ? 'is-open' : ''].filter(Boolean).join(' ')}>
          <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden>
            <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      {open && (
        <div
          className="au-tree-select__popup"
          style={popupWidth ? { width: typeof popupWidth === 'number' ? `${popupWidth}px` : popupWidth } : undefined}
        >
          <Tree
            treeData={treeData}
            selectedKeys={value ? [value] : []}
            defaultExpandAll={treeDefaultExpandAll}
            onSelect={(keys) => handleSelect(keys)}
            blockNode
          />
        </div>
      )}
    </div>
  );
};

export default TreeSelect;
