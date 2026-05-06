import React, { useEffect, useMemo, useState } from 'react';
import Pagination, { type PaginationProps } from '../Pagination/Pagination';
import Empty from '../Empty/Empty';
import Checkbox from '../Checkbox/Checkbox';
import Spin from '../Spin/Spin';
import './Table.css';

export type TableAlign = 'left' | 'center' | 'right';
/**
 * 表格尺寸. 'middle' 是历史名 (跟 Antd 一致), 'medium' 是组件库内统一命名.
 * 二者完全等价, 类型上都接受, 实际渲染时归一化为 'medium'.
 */
export type TableSize = 'small' | 'medium' | 'middle' | 'large';
export type SortOrder = 'ascend' | 'descend' | null;

export interface TableColumn<T = any> {
  title: React.ReactNode;
  dataIndex?: keyof T | string;
  key?: string;
  width?: number | string;
  align?: TableAlign;
  ellipsis?: boolean;
  sorter?: boolean | ((a: T, b: T, order: Exclude<SortOrder, null>) => number);
  defaultSortOrder?: SortOrder;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  className?: string;
  /** 该列是否可拖拽改顺序; 默认 true (前提是 Table 上 draggableColumns 开启) */
  draggable?: boolean;
  /**
   * 单元格属性 — 主要用来做合并单元格 (rowSpan / colSpan).
   * 跟 antd onCell 同款: 返回 `{ rowSpan: 0 }` 或 `{ colSpan: 0 }` 表示这格被上面/左边合并掉, 不渲染.
   * 例:
   *   onCell: (record, idx) => {
   *     const prev = data[idx-1];
   *     if (prev && prev.group === record.group) return { rowSpan: 0 };  // 被上面合并
   *     let span = 1;
   *     while (data[idx+span]?.group === record.group) span++;
   *     return { rowSpan: span };
   *   }
   */
  onCell?: (
    record: T,
    index: number,
  ) => (React.TdHTMLAttributes<HTMLTableCellElement> & { rowSpan?: number; colSpan?: number }) | undefined;
}

export interface RowSelection<T = any> {
  type?: 'checkbox' | 'radio';
  selectedRowKeys?: React.Key[];
  defaultSelectedRowKeys?: React.Key[];
  onChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
  getCheckboxProps?: (record: T) => { disabled?: boolean };
  fixed?: boolean;
  columnWidth?: number;
  columnTitle?: React.ReactNode;
  hideSelectAll?: boolean;
}

export type TablePagination = false | (Omit<PaginationProps, 'total'> & { total?: number; position?: 'top' | 'bottom' });

/**
 * 展开行配置 — 跟 antd Table.expandable 同款.
 * 设了 expandedRowRender 走"详情行"模式: 展开时在该行下面插入一行长 td 显示自定义内容.
 * 用户也可以只用 expandedRowKeys 状态而不渲染详情行 (跟 onExpand 联动做自定义展开 UI).
 */
export interface TableExpandable<T = any> {
  /** 展开后渲染的内容 — 在主行下面以 colSpan 整行展示 */
  expandedRowRender?: (record: T, index: number) => React.ReactNode;
  /** 哪些行可以展开, 不可展开的不显示展开按钮 */
  rowExpandable?: (record: T) => boolean;
  /** 受控展开 keys */
  expandedRowKeys?: React.Key[];
  /** 默认展开 keys */
  defaultExpandedRowKeys?: React.Key[];
  /** 展开 / 收起触发回调 */
  onExpand?: (expanded: boolean, record: T) => void;
  /** 是否显示左侧的展开列 (chevron 列). 默认 true */
  showExpandColumn?: boolean;
  /** 自定义展开图标 */
  expandIcon?: (info: { expanded: boolean; record: T; onExpand: () => void }) => React.ReactNode;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  dataSource: T[];
  rowKey?: keyof T | string | ((record: T) => React.Key);
  bordered?: boolean;
  striped?: boolean;
  size?: TableSize;
  loading?: boolean;
  pagination?: TablePagination;
  rowSelection?: RowSelection<T>;
  empty?: React.ReactNode;
  showHeader?: boolean;
  sticky?: boolean;
  scroll?: { x?: number | string; y?: number | string };
  onRow?: (record: T, index: number) => React.HTMLAttributes<HTMLTableRowElement>;
  rowClassName?: string | ((record: T, index: number) => string);
  className?: string;
  style?: React.CSSProperties;

  /** 行可拖拽排序 — 在最左侧多一列拖拽手柄 */
  draggableRows?: boolean;
  /** 行排序变化回调; 返回新的 dataSource 顺序与 from/to 索引(基于排序后的视图) */
  onRowReorder?: (next: T[], info: { from: number; to: number }) => void;
  /** 列可拖拽改顺序 — 直接拖表头 */
  draggableColumns?: boolean;
  /** 列排序变化回调 */
  onColumnReorder?: (next: TableColumn<T>[], info: { from: number; to: number }) => void;

  /** 展开行配置 (详情行模式) */
  expandable?: TableExpandable<T>;
  /** 树形数据: 数据里的子项字段名, 默认 'children'. 设了之后 dataSource 里的 children 会自动嵌套渲染并加缩进 */
  childrenColumnName?: string;
  /** 树形数据: 每层缩进 px, 默认 16 */
  treeIndent?: number;
}

const SortIcon: React.FC<{ order: SortOrder }> = ({ order }) => (
  <span className="au-table__sort-icon" aria-hidden>
    <svg viewBox="0 0 8 4" width="8" height="4">
      <path
        d="M0 4L4 0L8 4Z"
        fill={order === 'ascend' ? 'var(--au-primary)' : 'var(--au-text-3)'}
      />
    </svg>
    <svg viewBox="0 0 8 4" width="8" height="4">
      <path
        d="M0 0L4 4L8 0Z"
        fill={order === 'descend' ? 'var(--au-primary)' : 'var(--au-text-3)'}
      />
    </svg>
  </span>
);

const DragHandleIcon: React.FC = () => (
  <svg className="au-table__drag-icon" width="10" height="16" viewBox="0 0 10 16" aria-hidden>
    <circle cx="2" cy="3"  r="1.2" fill="currentColor" />
    <circle cx="8" cy="3"  r="1.2" fill="currentColor" />
    <circle cx="2" cy="8"  r="1.2" fill="currentColor" />
    <circle cx="8" cy="8"  r="1.2" fill="currentColor" />
    <circle cx="2" cy="13" r="1.2" fill="currentColor" />
    <circle cx="8" cy="13" r="1.2" fill="currentColor" />
  </svg>
);

const getKey = <T,>(
  record: T,
  index: number,
  rowKey?: TableProps<T>['rowKey'],
): React.Key => {
  if (typeof rowKey === 'function') return rowKey(record);
  if (typeof rowKey === 'string' && rowKey in (record as any))
    return (record as any)[rowKey];
  if ((record as any)?.key != null) return (record as any).key;
  if ((record as any)?.id != null) return (record as any).id;
  return index;
};

const getCellValue = <T,>(record: T, col: TableColumn<T>, index: number): any => {
  if (col.dataIndex == null) return undefined;
  const path = String(col.dataIndex);
  if (path.includes('.')) {
    return path.split('.').reduce<any>((acc, k) => (acc != null ? acc[k] : undefined), record);
  }
  return (record as any)[path];
};

const colKeyOf = (c: TableColumn<any>, fallbackIndex: number) =>
  c.key ?? String(c.dataIndex ?? `__col_${fallbackIndex}`);

function Table<T = any>({
  columns,
  dataSource,
  rowKey,
  bordered,
  striped,
  size = 'medium',
  loading,
  pagination,
  rowSelection,
  empty,
  showHeader = true,
  sticky,
  scroll,
  onRow,
  rowClassName,
  className = '',
  style,
  draggableRows,
  onRowReorder,
  draggableColumns,
  onColumnReorder,
  expandable,
  childrenColumnName = 'children',
  treeIndent = 16,
}: TableProps<T>) {
  /* ============ 列顺序 (内部状态, 跟 columns prop 保持同步, 但拖动时由内部主导) ============ */
  const columnsKeySig = useMemo(
    () => columns.map((c, i) => colKeyOf(c, i)).join('|'),
    [columns],
  );
  const [colOrder, setColOrder] = useState<string[]>(() =>
    columns.map((c, i) => colKeyOf(c, i)),
  );
  // 当外部 columns 改变(增删/换 key), 同步重置内部顺序避免出现幽灵列
  useEffect(() => {
    setColOrder(columns.map((c, i) => colKeyOf(c, i)));
  }, [columnsKeySig]); // eslint-disable-line react-hooks/exhaustive-deps

  const orderedColumns = useMemo(() => {
    if (!draggableColumns) return columns;
    const byKey = new Map<string, TableColumn<T>>();
    columns.forEach((c, i) => byKey.set(colKeyOf(c, i), c));
    const ordered = colOrder.map((k) => byKey.get(k)).filter(Boolean) as TableColumn<T>[];
    // 兜底: 如果有新增列还没进 colOrder, 追加在末尾
    columns.forEach((c, i) => {
      const k = colKeyOf(c, i);
      if (!colOrder.includes(k)) ordered.push(c);
    });
    return ordered;
  }, [columns, colOrder, draggableColumns]);

  /* ============ 行顺序 (本地排序) ============ */
  const [rowOrderKeys, setRowOrderKeys] = useState<React.Key[] | null>(null);
  // dataSource 变化(增删行)清掉本地排序, 避免出现幽灵行
  const dataKeySig = useMemo(
    () => dataSource.map((r, i) => String(getKey(r, i, rowKey))).join('|'),
    [dataSource, rowKey],
  );
  useEffect(() => {
    setRowOrderKeys(null);
  }, [dataKeySig]);

  const orderedDataSource = useMemo(() => {
    if (!draggableRows || !rowOrderKeys) return dataSource;
    const byKey = new Map<React.Key, T>();
    dataSource.forEach((r, i) => byKey.set(getKey(r, i, rowKey), r));
    const out: T[] = [];
    rowOrderKeys.forEach((k) => {
      const r = byKey.get(k);
      if (r) out.push(r);
    });
    // 兜底新增项
    dataSource.forEach((r, i) => {
      if (!rowOrderKeys.includes(getKey(r, i, rowKey))) out.push(r);
    });
    return out;
  }, [draggableRows, rowOrderKeys, dataSource, rowKey]);

  /* ============ 排序状态 ============ */
  const [sortKey, setSortKey] = useState<string | null>(() => {
    for (const col of columns) {
      if (col.sorter && col.defaultSortOrder != null) {
        return col.key ?? String(col.dataIndex ?? '');
      }
    }
    return null;
  });
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    () => columns.find((c) => c.sorter && c.defaultSortOrder)?.defaultSortOrder ?? null,
  );

  const toggleSort = (col: TableColumn<T>) => {
    const k = col.key ?? String(col.dataIndex ?? '');
    let next: SortOrder;
    if (sortKey !== k) next = 'ascend';
    else if (sortOrder === 'ascend') next = 'descend';
    else if (sortOrder === 'descend') next = null;
    else next = 'ascend';
    setSortKey(next == null ? null : k);
    setSortOrder(next);
  };

  const sorted = useMemo(() => {
    if (!sortKey || !sortOrder) return orderedDataSource;
    const col = orderedColumns.find((c) => (c.key ?? String(c.dataIndex ?? '')) === sortKey);
    if (!col || !col.sorter) return orderedDataSource;
    const arr = [...orderedDataSource];
    if (typeof col.sorter === 'function') {
      const sorter = col.sorter;
      const order = sortOrder;
      arr.sort((a, b) => sorter(a as T, b as T, order as Exclude<SortOrder, null>));
    } else {
      arr.sort((a, b) => {
        const va = getCellValue(a, col, 0);
        const vb = getCellValue(b, col, 0);
        if (va == null && vb == null) return 0;
        if (va == null) return -1;
        if (vb == null) return 1;
        if (typeof va === 'number' && typeof vb === 'number') return va - vb;
        return String(va).localeCompare(String(vb));
      });
    }
    if (sortOrder === 'descend') arr.reverse();
    return arr;
  }, [orderedDataSource, orderedColumns, sortKey, sortOrder]);

  /* ============ 分页 ============ */
  const pgProp = pagination === false || pagination == null ? null : pagination;
  const [innerPage, setInnerPage] = useState(pgProp?.defaultCurrent ?? 1);
  const [innerSize, setInnerSize] = useState(pgProp?.defaultPageSize ?? 10);
  const current = pgProp?.current ?? innerPage;
  const pageSize = pgProp?.pageSize ?? innerSize;

  const pagedData = useMemo(() => {
    if (!pgProp) return sorted;
    const start = (current - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, pgProp, current, pageSize]);

  /* ============ 行选 ============ */
  const selCtrl = rowSelection?.selectedRowKeys !== undefined;
  const [innerSel, setInnerSel] = useState<React.Key[]>(
    rowSelection?.defaultSelectedRowKeys ?? [],
  );
  const selectedKeys = selCtrl ? rowSelection!.selectedRowKeys! : innerSel;
  const selType = rowSelection?.type ?? 'checkbox';

  /* ============ 展开行 (expandable + 树形数据共用 expandedKeys 状态) ============ */
  const expCtrl = expandable?.expandedRowKeys !== undefined;
  const [innerExpanded, setInnerExpanded] = useState<React.Key[]>(
    expandable?.defaultExpandedRowKeys ?? [],
  );
  const expandedKeys = expCtrl ? expandable!.expandedRowKeys! : innerExpanded;
  /** 展开列是否出现 — expandable.expandedRowRender 存在 + showExpandColumn 没显式关掉 */
  const showExpandColumn =
    !!expandable?.expandedRowRender && expandable?.showExpandColumn !== false;
  const toggleExpand = (key: React.Key, record: T) => {
    const isOpen = expandedKeys.includes(key);
    const next = isOpen ? expandedKeys.filter((k) => k !== key) : [...expandedKeys, key];
    if (!expCtrl) setInnerExpanded(next);
    expandable?.onExpand?.(!isOpen, record);
  };

  /** 树形数据: 把 children 字段递归展平成 [{ record, depth, key, hasChildren }],
   * 只展开的父节点的 children 才会出现在展平结果里 */
  type FlatRow = { record: T; depth: number; key: React.Key; hasChildren: boolean; flatIndex: number };
  const flattenedRows: FlatRow[] = useMemo(() => {
    const out: FlatRow[] = [];
    const walk = (rows: T[], depth: number, parentBaseIndex: number) => {
      rows.forEach((r, i) => {
        const flatIdx = parentBaseIndex + i;
        const k = getKey(r, flatIdx, rowKey);
        const children = (r as any)[childrenColumnName] as T[] | undefined;
        const hasChildren = Array.isArray(children) && children.length > 0;
        out.push({ record: r, depth, key: k, hasChildren, flatIndex: flatIdx });
        if (hasChildren && expandedKeys.includes(k)) {
          walk(children!, depth + 1, flatIdx * 1000); // 子层 flatIndex 用乘法分散, 避免冲突
        }
      });
    };
    walk(pagedData, 0, (current - 1) * pageSize);
    return out;
  }, [pagedData, childrenColumnName, expandedKeys, rowKey, current, pageSize]);

  const allPageKeys = useMemo(
    () =>
      pagedData.map((r, i) => getKey(r, (current - 1) * pageSize + i, rowKey)),
    [pagedData, current, pageSize, rowKey],
  );

  const pageSelectable = useMemo(() => {
    if (!rowSelection?.getCheckboxProps) return allPageKeys;
    return allPageKeys.filter((k, i) => {
      const r = pagedData[i];
      return !rowSelection.getCheckboxProps!(r).disabled;
    });
  }, [allPageKeys, pagedData, rowSelection]);

  const allChecked =
    pageSelectable.length > 0 &&
    pageSelectable.every((k) => selectedKeys.includes(k));
  const indeterminate =
    pageSelectable.some((k) => selectedKeys.includes(k)) && !allChecked;

  const commitSelection = (next: React.Key[]) => {
    if (!selCtrl) setInnerSel(next);
    const rows = (pgProp ? sorted : orderedDataSource).filter((r, i) =>
      next.includes(getKey(r, i, rowKey)),
    );
    rowSelection?.onChange?.(next, rows);
  };

  const toggleRow = (key: React.Key) => {
    if (selType === 'radio') {
      commitSelection([key]);
      return;
    }
    if (selectedKeys.includes(key)) {
      commitSelection(selectedKeys.filter((k) => k !== key));
    } else {
      commitSelection([...selectedKeys, key]);
    }
  };

  const toggleAll = () => {
    if (allChecked) {
      commitSelection(selectedKeys.filter((k) => !pageSelectable.includes(k)));
    } else {
      const addKeys = pageSelectable.filter((k) => !selectedKeys.includes(k));
      commitSelection([...selectedKeys, ...addKeys]);
    }
  };

  /* ============ 拖拽: 行 ============ */
  const [dragRowKey, setDragRowKey] = useState<React.Key | null>(null);
  const [dragOverRow, setDragOverRow] = useState<{ key: React.Key; pos: 'before' | 'after' } | null>(null);

  const handleRowDragStart = (key: React.Key, e: React.DragEvent) => {
    if (sortOrder) return; // 排序激活时禁止拖拽避免视觉混淆
    setDragRowKey(key);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', String(key));
    } catch {/* Firefox 需要至少 setData 一次 */}
  };
  const handleRowDragOver = (key: React.Key, e: React.DragEvent) => {
    if (dragRowKey == null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pos: 'before' | 'after' = e.clientY < r.top + r.height / 2 ? 'before' : 'after';
    if (!dragOverRow || dragOverRow.key !== key || dragOverRow.pos !== pos) {
      setDragOverRow({ key, pos });
    }
  };
  const handleRowDrop = (key: React.Key, e: React.DragEvent) => {
    e.preventDefault();
    if (dragRowKey == null || dragRowKey === key) {
      setDragRowKey(null);
      setDragOverRow(null);
      return;
    }
    const pos: 'before' | 'after' = dragOverRow?.key === key ? dragOverRow.pos : 'after';
    // 在当前 sorted (= 排序应用过, 含本地行序) 上做整体移动
    const baseKeys = sorted.map((r, i) => getKey(r, i, rowKey));
    const from = baseKeys.indexOf(dragRowKey);
    let to = baseKeys.indexOf(key);
    if (from < 0 || to < 0) {
      setDragRowKey(null);
      setDragOverRow(null);
      return;
    }
    const next = [...baseKeys];
    const [moved] = next.splice(from, 1);
    let insertAt = next.indexOf(key);
    if (pos === 'after') insertAt += 1;
    next.splice(insertAt, 0, moved);

    setRowOrderKeys(next);
    if (onRowReorder) {
      const byKey = new Map<React.Key, T>();
      dataSource.forEach((r, i) => byKey.set(getKey(r, i, rowKey), r));
      const reorderedRecords = next.map((k) => byKey.get(k)).filter(Boolean) as T[];
      onRowReorder(reorderedRecords, { from, to: insertAt });
    }
    setDragRowKey(null);
    setDragOverRow(null);
  };
  const handleRowDragEnd = () => {
    setDragRowKey(null);
    setDragOverRow(null);
  };

  /* ============ 拖拽: 列 ============ */
  const [dragColKey, setDragColKey] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<{ key: string; pos: 'before' | 'after' } | null>(null);

  const handleColDragStart = (k: string, e: React.DragEvent) => {
    setDragColKey(k);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', k);
    } catch {/* noop */}
  };
  const handleColDragOver = (k: string, e: React.DragEvent) => {
    if (dragColKey == null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pos: 'before' | 'after' = e.clientX < r.left + r.width / 2 ? 'before' : 'after';
    if (!dragOverCol || dragOverCol.key !== k || dragOverCol.pos !== pos) {
      setDragOverCol({ key: k, pos });
    }
  };
  const handleColDrop = (k: string, e: React.DragEvent) => {
    e.preventDefault();
    if (dragColKey == null || dragColKey === k) {
      setDragColKey(null);
      setDragOverCol(null);
      return;
    }
    const pos: 'before' | 'after' = dragOverCol?.key === k ? dragOverCol.pos : 'after';
    const next = [...colOrder];
    const from = next.indexOf(dragColKey);
    if (from < 0) {
      setDragColKey(null);
      setDragOverCol(null);
      return;
    }
    const [moved] = next.splice(from, 1);
    let insertAt = next.indexOf(k);
    if (pos === 'after') insertAt += 1;
    next.splice(insertAt, 0, moved);
    setColOrder(next);
    if (onColumnReorder) {
      const byKey = new Map<string, TableColumn<T>>();
      columns.forEach((c, i) => byKey.set(colKeyOf(c, i), c));
      const reorderedCols = next.map((kk) => byKey.get(kk)).filter(Boolean) as TableColumn<T>[];
      onColumnReorder(reorderedCols, { from, to: insertAt });
    }
    setDragColKey(null);
    setDragOverCol(null);
  };
  const handleColDragEnd = () => {
    setDragColKey(null);
    setDragOverCol(null);
  };

  /* ============ 渲染 ============ */
  // 'middle' 是 Antd 风格的旧名, 内部归一为 'medium' 跟其他组件保持一致 (CSS 默认状态)
  const normalizedSize = size === 'middle' ? 'medium' : size;
  const cls = [
    'au-table',
    `au-table--${normalizedSize}`,
    bordered ? 'is-bordered' : '',
    striped ? 'is-striped' : '',
    sticky ? 'is-sticky' : '',
    draggableRows ? 'has-row-drag' : '',
    draggableColumns ? 'has-col-drag' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const dragHandleColWidth = 36;

  const tableBody = (
    <table className="au-table__table" style={scroll?.x ? { width: scroll.x, minWidth: scroll.x } : undefined}>
      <colgroup>
        {draggableRows && <col style={{ width: dragHandleColWidth }} />}
        {rowSelection && (
          <col style={{ width: rowSelection.columnWidth ?? 48 }} />
        )}
        {orderedColumns.map((c, i) => (
          <col key={colKeyOf(c, i)} style={c.width ? { width: c.width } : undefined} />
        ))}
      </colgroup>
      {showHeader && (
        <thead className="au-table__thead">
          <tr>
            {draggableRows && (
              <th className="au-table__th au-table__th--drag" aria-label="拖拽列" />
            )}
            {rowSelection && (
              <th className="au-table__th au-table__th--selection">
                {selType === 'checkbox' && !rowSelection.hideSelectAll && (
                  <Checkbox
                    checked={allChecked}
                    indeterminate={indeterminate}
                    disabled={pageSelectable.length === 0}
                    onChange={toggleAll}
                  />
                )}
                {rowSelection.columnTitle}
              </th>
            )}
            {orderedColumns.map((col, i) => {
              const k = colKeyOf(col, i);
              const isSorted = sortKey === k ? sortOrder : null;
              const colDraggable = draggableColumns && col.draggable !== false;
              const isDraggingThis = dragColKey === k;
              const dropIndicator = dragOverCol?.key === k ? dragOverCol.pos : null;
              const thCls = [
                'au-table__th',
                col.align ? `au-table__cell--${col.align}` : '',
                col.sorter ? 'has-sorter' : '',
                isSorted ? 'is-sorted' : '',
                colDraggable ? 'is-col-draggable' : '',
                isDraggingThis ? 'is-dragging' : '',
                dropIndicator === 'before' ? 'is-drop-before' : '',
                dropIndicator === 'after' ? 'is-drop-after' : '',
                col.className ?? '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <th
                  key={k}
                  className={thCls}
                  onClick={() => col.sorter && toggleSort(col)}
                  draggable={colDraggable}
                  onDragStart={colDraggable ? (e) => handleColDragStart(k, e) : undefined}
                  onDragOver={colDraggable ? (e) => handleColDragOver(k, e) : undefined}
                  onDrop={colDraggable ? (e) => handleColDrop(k, e) : undefined}
                  onDragEnd={colDraggable ? handleColDragEnd : undefined}
                >
                  <div className="au-table__th-inner">
                    <span className="au-table__th-title">{col.title}</span>
                    {col.sorter && <SortIcon order={isSorted} />}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
      )}
      <tbody className="au-table__tbody">
        {pagedData.length === 0 ? (
          <tr className="au-table__row au-table__row--empty">
            <td
              colSpan={
                orderedColumns.length +
                (rowSelection ? 1 : 0) +
                (draggableRows ? 1 : 0) +
                (showExpandColumn ? 1 : 0)
              }
              className="au-table__cell"
            >
              {empty ?? <Empty />}
            </td>
          </tr>
        ) : (
          flattenedRows.flatMap((row) => {
            const { record, depth, key, hasChildren, flatIndex: i } = row;
            const selected = selectedKeys.includes(key);
            const selectable = rowSelection
              ? !rowSelection.getCheckboxProps?.(record).disabled
              : true;
            const customAttrs = onRow?.(record, i) ?? {};
            const extraCls =
              typeof rowClassName === 'function'
                ? rowClassName(record, i)
                : rowClassName ?? '';
            const isDragging = dragRowKey === key;
            const dropIndicator = dragOverRow?.key === key ? dragOverRow.pos : null;
            const rowCls = [
              'au-table__row',
              selected ? 'is-selected' : '',
              isDragging ? 'is-dragging' : '',
              dropIndicator === 'before' ? 'is-drop-before' : '',
              dropIndicator === 'after' ? 'is-drop-after' : '',
              extraCls,
            ]
              .filter(Boolean)
              .join(' ');
            return [
              <tr
                key={key}
                className={rowCls}
                {...customAttrs}
                onDragOver={
                  draggableRows
                    ? (e) => {
                        handleRowDragOver(key, e);
                        customAttrs.onDragOver?.(e);
                      }
                    : customAttrs.onDragOver
                }
                onDrop={
                  draggableRows
                    ? (e) => {
                        handleRowDrop(key, e);
                        customAttrs.onDrop?.(e);
                      }
                    : customAttrs.onDrop
                }
              >
                {draggableRows && (
                  <td
                    className="au-table__cell au-table__cell--drag"
                    draggable
                    onDragStart={(e) => handleRowDragStart(key, e)}
                    onDragEnd={handleRowDragEnd}
                    aria-label="拖动以重新排序"
                  >
                    <span className="au-table__drag-handle">
                      <DragHandleIcon />
                    </span>
                  </td>
                )}
                {rowSelection && (
                  <td className="au-table__cell au-table__cell--selection">
                    {selType === 'radio' ? (
                      <input
                        type="radio"
                        checked={selected}
                        disabled={!selectable}
                        onChange={() => toggleRow(key)}
                        aria-label="选择此行"
                      />
                    ) : (
                      <Checkbox
                        checked={selected}
                        disabled={!selectable}
                        onChange={() => toggleRow(key)}
                      />
                    )}
                  </td>
                )}
                {showExpandColumn && (
                  <td className="au-table__cell au-table__cell--expand">
                    {(!expandable?.rowExpandable || expandable.rowExpandable(record)) && (
                      <button
                        type="button"
                        className={['au-table__expand-btn', expandedKeys.includes(key) ? 'is-open' : ''].filter(Boolean).join(' ')}
                        onClick={() => toggleExpand(key, record)}
                        aria-label={expandedKeys.includes(key) ? '收起' : '展开'}
                        aria-expanded={expandedKeys.includes(key)}
                      >
                        <svg viewBox="0 0 8 8" width="8" height="8" aria-hidden>
                          <path d="M1.5 2.5L4 5l2.5-2.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )}
                  </td>
                )}
                {orderedColumns.map((col, j) => {
                  const v = getCellValue(record, col, i);
                  const content = col.render ? col.render(v, record, i) : (v as React.ReactNode);
                  const cellAttrs = col.onCell?.(record, i) ?? {};
                  // rowSpan: 0 / colSpan: 0 = 这格被上方/左侧合并掉, 不渲染
                  if (cellAttrs.rowSpan === 0 || cellAttrs.colSpan === 0) return null;
                  const cellCls = [
                    'au-table__cell',
                    col.align ? `au-table__cell--${col.align}` : '',
                    col.ellipsis ? 'is-ellipsis' : '',
                    col.className ?? '',
                    cellAttrs.className ?? '',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  // 拆出 className 避免重复, 其他属性透传到 td
                  const { className: _attrCls, ...restAttrs } = cellAttrs;
                  // 第一列负责显示树形缩进 + 展开 chevron
                  const isFirstCol = j === 0;
                  const isTreeRow = depth > 0 || hasChildren;
                  return (
                    <td
                      key={colKeyOf(col, j)}
                      className={cellCls}
                      title={col.ellipsis && typeof content === 'string' ? (content as string) : undefined}
                      {...restAttrs}
                    >
                      {isFirstCol && isTreeRow ? (
                        <span className="au-table__tree-cell" style={{ paddingLeft: depth * treeIndent }}>
                          {hasChildren ? (
                            <button
                              type="button"
                              className={['au-table__tree-toggle', expandedKeys.includes(key) ? 'is-open' : ''].filter(Boolean).join(' ')}
                              onClick={() => toggleExpand(key, record)}
                              aria-label={expandedKeys.includes(key) ? '收起' : '展开'}
                              aria-expanded={expandedKeys.includes(key)}
                            >
                              <svg viewBox="0 0 8 8" width="8" height="8" aria-hidden>
                                <path d="M1.5 2.5L4 5l2.5-2.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          ) : (
                            <span className="au-table__tree-toggle au-table__tree-toggle--leaf" />
                          )}
                          <span>{content as React.ReactNode}</span>
                        </span>
                      ) : (
                        (content as React.ReactNode)
                      )}
                    </td>
                  );
                })}
              </tr>,
              // expandable 详情行 — 在主行下面以 colSpan 整行渲染
              showExpandColumn &&
                expandedKeys.includes(key) &&
                expandable?.expandedRowRender &&
                (!expandable?.rowExpandable || expandable.rowExpandable(record)) ? (
                <tr key={`${key}__expanded`} className="au-table__row au-table__row--expanded">
                  <td
                    colSpan={
                      orderedColumns.length +
                      (rowSelection ? 1 : 0) +
                      (draggableRows ? 1 : 0) +
                      1 /* expand col */
                    }
                    className="au-table__cell au-table__cell--expanded"
                  >
                    {expandable.expandedRowRender(record, i)}
                  </td>
                </tr>
              ) : null,
            ];
          })
        )}
      </tbody>
    </table>
  );

  const scrollWrap = (
    <div
      className="au-table__scroll"
      style={{
        overflowX: scroll?.x ? 'auto' : undefined,
        maxHeight: scroll?.y,
        overflowY: scroll?.y ? 'auto' : undefined,
      }}
    >
      {tableBody}
    </div>
  );

  const paginationNode = pgProp ? (
    <div className="au-table__pagination">
      <Pagination
        {...pgProp}
        total={pgProp.total ?? dataSource.length}
        current={current}
        pageSize={pageSize}
        onChange={(p, s) => {
          if (pgProp.current === undefined) setInnerPage(p);
          if (pgProp.pageSize === undefined) setInnerSize(s);
          pgProp.onChange?.(p, s);
        }}
        onShowSizeChange={(p, s) => {
          if (pgProp.current === undefined) setInnerPage(p);
          if (pgProp.pageSize === undefined) setInnerSize(s);
          pgProp.onShowSizeChange?.(p, s);
        }}
      />
    </div>
  ) : null;

  const topPagination = pgProp && pgProp.position === 'top' ? paginationNode : null;
  const bottomPagination = pgProp && pgProp.position !== 'top' ? paginationNode : null;

  return (
    <div className={cls} style={style}>
      {topPagination}
      <Spin spinning={!!loading} tip="加载中">
        {scrollWrap}
      </Spin>
      {bottomPagination}
    </div>
  );
}

export default Table;
