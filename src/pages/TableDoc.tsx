import React, { useState } from 'react';
import { Table, Tag, Avatar, Space, Popconfirm, message } from '../components';
import type { TableColumn } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

interface User {
  id: number;
  name: string;
  role: 'admin' | 'member' | 'guest';
  age: number;
  email: string;
  status: 'online' | 'offline';
  balance: number;
}

const users: User[] = [
  { id: 1, name: '余星辰', role: 'admin', age: 28, email: 'yu@example.com', status: 'online', balance: 12850 },
  { id: 2, name: '林可', role: 'member', age: 34, email: 'lin@example.com', status: 'offline', balance: 4250 },
  { id: 3, name: 'Noah', role: 'member', age: 31, email: 'noah@example.com', status: 'online', balance: 8810 },
  { id: 4, name: 'Mia', role: 'guest', age: 22, email: 'mia@example.com', status: 'offline', balance: 650 },
  { id: 5, name: '沈知秋', role: 'admin', age: 40, email: 'shen@example.com', status: 'online', balance: 23200 },
];

const roleColor: Record<User['role'], 'danger' | 'primary' | 'default'> = {
  admin: 'danger',
  member: 'primary',
  guest: 'default',
};

const TableDoc: React.FC = () => {
  return (
    <>
      <h1>Table 表格</h1>
      <p>
        承载二维结构化数据的核心组件。支持排序、行选择、分页、加载态、紧凑/大尺寸、
        斑马纹、边框、横向/纵向滚动。与 Checkbox / Radio / Pagination / Spin / Empty 深度集成。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="传 columns 与 dataSource 即可; rowKey 用于追踪每行。"
        code={`const columns = [
  { title: 'ID', dataIndex: 'id' },
  { title: '姓名', dataIndex: 'name' },
  { title: '邮箱', dataIndex: 'email' },
];

<Table rowKey="id" columns={columns} dataSource={users} />`}
      >
        <Table
          rowKey="id"
          columns={[
            { title: 'ID', dataIndex: 'id', width: 60 },
            { title: '姓名', dataIndex: 'name' },
            { title: '角色', dataIndex: 'role' },
            { title: '邮箱', dataIndex: 'email' },
          ]}
          dataSource={users}
          pagination={false}
        />
      </DemoBlock>

      <DemoBlock
        title="自定义渲染"
        description="column.render(value, record, index) 返回任意 ReactNode。"
        code={`{
  title: '角色',
  dataIndex: 'role',
  render: (r) => <Tag color={roleColor[r]}>{r}</Tag>,
}`}
      >
        <Table
          rowKey="id"
          columns={customColumns()}
          dataSource={users}
          pagination={false}
        />
      </DemoBlock>

      <DemoBlock
        title="排序"
        description="column.sorter = true 启用默认比较; 也可传自定义比较函数。表头点击三态循环 (升 → 降 → 原序)。"
        code={`[
  { title: '年龄', dataIndex: 'age', sorter: true },
  { title: '余额', dataIndex: 'balance', sorter: (a, b) => a.balance - b.balance },
]`}
      >
        <Table
          rowKey="id"
          columns={[
            { title: '姓名', dataIndex: 'name', sorter: true },
            { title: '年龄', dataIndex: 'age', sorter: true, align: 'right', width: 100 },
            { title: '余额', dataIndex: 'balance', sorter: (a, b) => a.balance - b.balance, align: 'right', render: (v: number) => `¥ ${v.toLocaleString()}` },
          ]}
          dataSource={users}
          pagination={false}
        />
      </DemoBlock>

      <DemoBlock
        title="行选择 (checkbox)"
        description="rowSelection 开启多选; 支持表头全选 / 半选。"
        code={`const [keys, setKeys] = useState<React.Key[]>([]);

<Table
  rowKey="id"
  rowSelection={{
    selectedRowKeys: keys,
    onChange: (ks) => setKeys(ks),
    getCheckboxProps: (r) => ({ disabled: r.role === 'guest' }),
  }}
  columns={...}
  dataSource={users}
/>`}
      >
        <SelectionDemo />
      </DemoBlock>

      <DemoBlock
        title="分页"
        description="pagination 传对象即可启用; false 关闭。"
        code={`<Table
  rowKey="id"
  pagination={{ pageSize: 3, showTotal: (t) => \`共 \${t} 条\` }}
  columns={...}
  dataSource={users}
/>`}
      >
        <Table
          rowKey="id"
          columns={customColumns()}
          dataSource={[...users, ...users.map((u) => ({ ...u, id: u.id + 10, name: u.name + '·复制' }))]}
          pagination={{ pageSize: 3, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
        />
      </DemoBlock>

      <DemoBlock
        title="加载态 · 空数据 · 样式"
        description="loading / empty + bordered / striped / size。"
        code={`<Table loading bordered striped size="small" ... />`}
      >
        <LoadingDemo />
      </DemoBlock>

      <DemoBlock
        title="操作列 + 行内确认"
        description="一个完整的管理表格片段。"
        code={`{
  title: '操作',
  render: (_, r) => (
    <Space split={<Divider type="vertical" />}>
      <a onClick={...}>编辑</a>
      <Popconfirm title="确定删除?" onConfirm={...}>
        <a style={{ color: 'var(--au-danger)' }}>删除</a>
      </Popconfirm>
    </Space>
  ),
}`}
      >
        <ActionsDemo />
      </DemoBlock>

      <DemoBlock
        title="横向滚动"
        description="scroll.x 指定内容总宽,超出父容器时出现横向滚动条。"
        code={`<Table scroll={{ x: 1200 }} ... />`}
      >
        <Table
          rowKey="id"
          scroll={{ x: 1200 }}
          bordered
          columns={[
            { title: 'ID', dataIndex: 'id', width: 80 },
            { title: '姓名', dataIndex: 'name', width: 120 },
            { title: '邮箱', dataIndex: 'email', width: 200 },
            { title: '角色', dataIndex: 'role', width: 120, render: (r: User['role']) => <Tag color={roleColor[r]}>{r}</Tag> },
            { title: '年龄', dataIndex: 'age', width: 100, align: 'right' },
            { title: '余额', dataIndex: 'balance', width: 160, align: 'right', render: (v: number) => `¥ ${v.toLocaleString()}` },
            { title: '状态', dataIndex: 'status', width: 120, render: (s: User['status']) => (s === 'online' ? <Tag color="success">在线</Tag> : <Tag>离线</Tag>) },
            { title: '操作', width: 140, render: () => <a>查看详情</a> },
          ]}
          dataSource={users}
          pagination={false}
        />
      </DemoBlock>

      <h2>API</h2>
      <h3>Table</h3>
      <ApiTable
        rows={[
          { prop: 'columns', desc: '列配置', type: 'TableColumn[]', default: '-' },
          { prop: 'dataSource', desc: '数据源', type: 'any[]', default: '-' },
          { prop: 'rowKey', desc: '行 key (字段名 或 取值函数)', type: `string | (record) => Key`, default: `'key' | 'id'` },
          { prop: 'loading', desc: '加载态 (叠加 Spin 蒙层)', type: 'boolean', default: 'false' },
          { prop: 'pagination', desc: '分页配置 (同 Pagination); false 关闭', type: 'PaginationProps | false', default: '默认启用' },
          { prop: 'rowSelection', desc: '行选择配置', type: 'RowSelection', default: '-' },
          { prop: 'bordered', desc: '外框线', type: 'boolean', default: 'false' },
          { prop: 'striped', desc: '斑马纹', type: 'boolean', default: 'false' },
          { prop: 'size', desc: '尺寸', type: `'small' | 'middle' | 'large'`, default: `'middle'` },
          { prop: 'scroll', desc: '滚动配置', type: `{ x?: number | string; y?: number | string }`, default: '-' },
          { prop: 'showHeader', desc: '显示表头', type: 'boolean', default: 'true' },
          { prop: 'sticky', desc: '表头吸顶 (需 scroll.y)', type: 'boolean', default: 'false' },
          { prop: 'empty', desc: '空态内容', type: 'ReactNode', default: '<Empty />' },
          { prop: 'onRow', desc: '自定义行属性', type: '(record, index) => HTMLAttributes', default: '-' },
          { prop: 'rowClassName', desc: '自定义行 className', type: 'string | (record, index) => string', default: '-' },
        ]}
      />
      <h3>TableColumn</h3>
      <ApiTable
        rows={[
          { prop: 'title', desc: '列头', type: 'ReactNode', default: '-' },
          { prop: 'dataIndex', desc: '取值字段 (支持 a.b.c)', type: 'string', default: '-' },
          { prop: 'key', desc: '唯一 key (排序依赖)', type: 'string', default: 'dataIndex' },
          { prop: 'render', desc: '自定义渲染', type: '(value, record, index) => ReactNode', default: '-' },
          { prop: 'width', desc: '列宽', type: 'number | string', default: '-' },
          { prop: 'align', desc: '内容对齐', type: `'left' | 'center' | 'right'`, default: `'left'` },
          { prop: 'ellipsis', desc: '超长省略', type: 'boolean', default: 'false' },
          { prop: 'sorter', desc: '排序 (true 默认比较; 或传比较函数)', type: 'boolean | (a, b, order) => number', default: '-' },
          { prop: 'defaultSortOrder', desc: '默认排序方向', type: `'ascend' | 'descend' | null`, default: '-' },
        ]}
      />
      <h3>RowSelection</h3>
      <ApiTable
        rows={[
          { prop: 'type', desc: '选择类型', type: `'checkbox' | 'radio'`, default: `'checkbox'` },
          { prop: 'selectedRowKeys', desc: '受控选中 keys', type: 'Key[]', default: '-' },
          { prop: 'defaultSelectedRowKeys', desc: '默认选中 keys', type: 'Key[]', default: '[]' },
          { prop: 'onChange', desc: '选中变化', type: '(keys, rows) => void', default: '-' },
          { prop: 'getCheckboxProps', desc: '按行控制禁用', type: '(record) => { disabled? }', default: '-' },
          { prop: 'columnWidth', desc: '选择列宽', type: 'number', default: '48' },
          { prop: 'hideSelectAll', desc: '隐藏表头全选 (仅 checkbox)', type: 'boolean', default: 'false' },
        ]}
      />
    </>
  );
};

function customColumns(): TableColumn<User>[] {
  return [
    {
      title: '用户',
      dataIndex: 'name',
      render: (_v, r) => (
        <Space>
          <Avatar size="small" background="var(--au-primary)" color="#fff">
            {r.name[0]}
          </Avatar>
          <span>{r.name}</span>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      width: 100,
      render: (r: User['role']) => <Tag color={roleColor[r]}>{r}</Tag>,
    },
    { title: '年龄', dataIndex: 'age', width: 80, align: 'right' as const },
    {
      title: '余额',
      dataIndex: 'balance',
      align: 'right' as const,
      render: (v: number) => `¥ ${v.toLocaleString()}`,
      width: 140,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (s: User['status']) =>
        s === 'online' ? <Tag color="success">在线</Tag> : <Tag>离线</Tag>,
    },
  ];
}

const SelectionDemo: React.FC = () => {
  const [keys, setKeys] = useState<React.Key[]>([]);
  return (
    <div>
      <div style={{ marginBottom: 10, fontSize: 13, color: 'var(--au-text-2)' }}>
        已选 <b>{keys.length}</b> 项 {keys.length > 0 && `(${keys.join(', ')})`}
      </div>
      <Table
        rowKey="id"
        rowSelection={{
          selectedRowKeys: keys,
          onChange: (ks) => setKeys(ks),
          getCheckboxProps: (r: User) => ({ disabled: r.role === 'guest' }),
        }}
        columns={customColumns()}
        dataSource={users}
        pagination={false}
      />
    </div>
  );
};

const LoadingDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [bordered, setBordered] = useState(true);
  const [striped, setStriped] = useState(true);
  const [size, setSize] = useState<'small' | 'middle' | 'large'>('middle');

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <button
          className="au-btn au-btn--default au-btn--small"
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 1500);
          }}
        >
          加载 1.5s
        </button>
        <button className="au-btn au-btn--default au-btn--small" onClick={() => setEmpty((x) => !x)}>
          {empty ? '恢复数据' : '切为空数据'}
        </button>
        <button className="au-btn au-btn--default au-btn--small" onClick={() => setBordered((x) => !x)}>
          bordered: {String(bordered)}
        </button>
        <button className="au-btn au-btn--default au-btn--small" onClick={() => setStriped((x) => !x)}>
          striped: {String(striped)}
        </button>
        <button
          className="au-btn au-btn--default au-btn--small"
          onClick={() => setSize((s) => (s === 'small' ? 'middle' : s === 'middle' ? 'large' : 'small'))}
        >
          size: {size}
        </button>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        bordered={bordered}
        striped={striped}
        size={size}
        columns={customColumns()}
        dataSource={empty ? [] : users}
        pagination={false}
      />
    </div>
  );
};

const ActionsDemo: React.FC = () => {
  return (
    <Table
      rowKey="id"
      bordered
      columns={[
        ...customColumns(),
        {
          title: '操作',
          key: 'actions',
          width: 160,
          render: (_v, r: User) => (
            <Space>
              <a onClick={() => message.info(`编辑 ${r.name}`)}>编辑</a>
              <Popconfirm
                title="删除后不可恢复"
                description={`确认删除 ${r.name}?`}
                okType="danger"
                onConfirm={() => {
                  message.success(`已删除 ${r.name}`);
                }}
              >
                <a style={{ color: 'var(--au-danger)' }}>删除</a>
              </Popconfirm>
            </Space>
          ),
        },
      ]}
      dataSource={users}
      pagination={false}
    />
  );
};

export default TableDoc;
