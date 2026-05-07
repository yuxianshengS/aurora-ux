import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import Table, { type TableColumn } from './Table';

interface Row {
  id: number;
  name: string;
  age: number;
}

const data: Row[] = [
  { id: 1, name: 'Charlie', age: 30 },
  { id: 2, name: 'Alice', age: 25 },
  { id: 3, name: 'Bob', age: 28 },
];

const columns: TableColumn<Row>[] = [
  { title: 'Name', dataIndex: 'name', sorter: true },
  { title: 'Age', dataIndex: 'age', sorter: true },
];

describe('<Table />', () => {
  it('renders rows in source order', () => {
    render(<Table<Row> columns={columns} dataSource={data} rowKey="id" />);
    const cells = screen
      .getAllByRole('cell')
      .filter((c) => /Charlie|Alice|Bob/.test(c.textContent ?? ''));
    expect(cells.map((c) => c.textContent)).toEqual(['Charlie', 'Alice', 'Bob']);
  });

  it('sorts ascending then descending then resets on header click', () => {
    render(<Table<Row> columns={columns} dataSource={data} rowKey="id" />);
    const nameHeader = screen.getByText('Name').closest('th')!;

    fireEvent.click(nameHeader);
    let names = screen
      .getAllByRole('cell')
      .filter((c) => /Charlie|Alice|Bob/.test(c.textContent ?? ''))
      .map((c) => c.textContent);
    expect(names).toEqual(['Alice', 'Bob', 'Charlie']);

    fireEvent.click(nameHeader);
    names = screen
      .getAllByRole('cell')
      .filter((c) => /Charlie|Alice|Bob/.test(c.textContent ?? ''))
      .map((c) => c.textContent);
    expect(names).toEqual(['Charlie', 'Bob', 'Alice']);

    fireEvent.click(nameHeader);
    names = screen
      .getAllByRole('cell')
      .filter((c) => /Charlie|Alice|Bob/.test(c.textContent ?? ''))
      .map((c) => c.textContent);
    expect(names).toEqual(['Charlie', 'Alice', 'Bob']);
  });

  it('toggles row selection via checkbox', () => {
    const onChange = vi.fn();
    render(
      <Table<Row> columns={columns} dataSource={data} rowKey="id" rowSelection={{ onChange }} />,
    );
    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1];
    const checkbox = within(firstDataRow).getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledWith([1], [data[0]]);
  });

  it('renders empty state when dataSource is empty', () => {
    render(<Table<Row> columns={columns} dataSource={[]} rowKey="id" />);
    expect(screen.getByText(/暂无数据|No data/i)).toBeInTheDocument();
  });

  it('forwards ref to wrapper div', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Table<Row> ref={ref} columns={columns} dataSource={data} rowKey="id" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.classList.contains('au-table')).toBe(true);
  });
});
