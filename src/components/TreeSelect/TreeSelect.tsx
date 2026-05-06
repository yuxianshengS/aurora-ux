import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Tree, { type TreeNode } from '../Tree/Tree';
import { useOutsideClick } from '../../hooks/useOutsideClick';
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
  /** 弹出框最大高度, 超出滚动 */
  popupMaxHeight?: number;
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
  popupMaxHeight = 320,
  onChange,
  className = '',
  style,
}) => {
  const isCtrl = ctrlValue !== undefined;
  const [innerValue, setInnerValue] = useState<string | undefined>(defaultValue);
  const value = isCtrl ? ctrlValue! : innerValue;
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });

  // 定位
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      const r = triggerRef.current!.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  // 点击外部关闭
  useOutsideClick([triggerRef, popupRef], () => setOpen(false), open);

  // ESC 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
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

  const popupW =
    popupWidth != null
      ? typeof popupWidth === 'number'
        ? popupWidth
        : popupWidth
      : pos.width;

  return (
    <div className={cls} style={style}>
      <div
        ref={triggerRef}
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
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popupRef}
            className="au-tree-select__popup"
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              width: popupW,
              maxHeight: popupMaxHeight,
              overflow: 'auto',
            }}
          >
            <Tree
              treeData={treeData}
              selectedKeys={value ? [value] : []}
              defaultExpandAll={treeDefaultExpandAll}
              onSelect={(keys) => handleSelect(keys)}
              blockNode
            />
          </div>,
          document.body,
        )}
    </div>
  );
};

export default TreeSelect;
