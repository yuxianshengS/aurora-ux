import React, { useMemo, useState } from 'react';
import Pagination, { type PaginationProps } from '../Pagination/Pagination';
import Empty from '../Empty/Empty';
import Checkbox from '../Checkbox/Checkbox';
import Spin from '../Spin/Spin';
import './Table.css';

export type TableAlign = 'left' | 'center' | 'right';
export type TableSize = 'small' | 'middle' | 'large';
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

function Table<T = any>({
  columns,
  dataSource,
  rowKey,
  bordered,
  striped,
  size = 'middle',
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
}: TableProps<T>) {
  // sort state (single-column client-side)
  const [sortKey, setSortKey] = useState<string | null>(
    () => {
      for (const col of columns) {
        if (col.sorter && col.defaultSortOrder != null) {
          return col.key ?? String(col.dataIndex ?? '');
        }
      }
      return null;
    },
  );
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
    if (!sortKey || !sortOrder) return dataSource;
    const col = columns.find((c) => (c.key ?? String(c.dataIndex ?? '')) === sortKey);
    if (!col || !col.sorter) return dataSource;
    const arr = [...dataSource];
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
  }, [dataSource, columns, sortKey, sortOrder]);

  // pagination state
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

  // row selection state
  const selCtrl = rowSelection?.selectedRowKeys !== undefined;
  const [innerSel, setInnerSel] = useState<React.Key[]>(
    rowSelection?.defaultSelectedRowKeys ?? [],
  );
  const selectedKeys = selCtrl ? rowSelection!.selectedRowKeys! : innerSel;
  const selType = rowSelection?.type ?? 'checkbox';

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
    const rows = (pgProp ? sorted : dataSource).filter((r, i) =>
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

  const cls = [
    'au-table',
    `au-table--${size}`,
    bordered ? 'is-bordered' : '',
    striped ? 'is-striped' : '',
    sticky ? 'is-sticky' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const tableBody = (
    <table className="au-table__table" style={scroll?.x ? { width: scroll.x, minWidth: scroll.x } : undefined}>
      <colgroup>
        {rowSelection && (
          <col style={{ width: rowSelection.columnWidth ?? 48 }} />
        )}
        {columns.map((c, i) => (
          <col key={c.key ?? String(c.dataIndex ?? i)} style={c.width ? { width: c.width } : undefined} />
        ))}
      </colgroup>
      {showHeader && (
        <thead className="au-table__thead">
          <tr>
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
            {columns.map((col, i) => {
              const k = col.key ?? String(col.dataIndex ?? i);
              const isSorted = sortKey === k ? sortOrder : null;
              const thCls = [
                'au-table__th',
                col.align ? `au-table__cell--${col.align}` : '',
                col.sorter ? 'has-sorter' : '',
                isSorted ? 'is-sorted' : '',
                col.className ?? '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <th
                  key={k}
                  className={thCls}
                  onClick={() => col.sorter && toggleSort(col)}
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
            <td colSpan={columns.length + (rowSelection ? 1 : 0)} className="au-table__cell">
              {empty ?? <Empty />}
            </td>
          </tr>
        ) : (
          pagedData.map((record, i) => {
            const key = getKey(record, (current - 1) * pageSize + i, rowKey);
            const selected = selectedKeys.includes(key);
            const selectable = rowSelection
              ? !rowSelection.getCheckboxProps?.(record).disabled
              : true;
            const customAttrs = onRow?.(record, i) ?? {};
            const extraCls =
              typeof rowClassName === 'function'
                ? rowClassName(record, i)
                : rowClassName ?? '';
            const rowCls = [
              'au-table__row',
              selected ? 'is-selected' : '',
              extraCls,
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <tr key={key} className={rowCls} {...customAttrs}>
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
                {columns.map((col, j) => {
                  const v = getCellValue(record, col, i);
                  const content = col.render ? col.render(v, record, i) : (v as React.ReactNode);
                  const cellCls = [
                    'au-table__cell',
                    col.align ? `au-table__cell--${col.align}` : '',
                    col.ellipsis ? 'is-ellipsis' : '',
                    col.className ?? '',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  return (
                    <td key={col.key ?? String(col.dataIndex ?? j)} className={cellCls} title={col.ellipsis && typeof content === 'string' ? (content as string) : undefined}>
                      {content as React.ReactNode}
                    </td>
                  );
                })}
              </tr>
            );
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
