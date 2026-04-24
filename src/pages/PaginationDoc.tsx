import React, { useState } from 'react';
import { Pagination } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const PaginationDoc: React.FC = () => {
  return (
    <>
      <h1>Pagination 分页</h1>
      <p>
        分页器。自动折叠页码 (前后 ••• 跳 5 页),支持页码跳转、每页条数切换、
        简洁模式和两种尺寸。受控 / 非受控皆可。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="传 total 即可,默认每页 10 条。"
        code={`<Pagination total={85} />`}
      >
        <Pagination total={85} />
      </DemoBlock>

      <DemoBlock
        title="受控"
        description="传 current + onChange 进入受控。"
        code={`const [page, setPage] = useState(3);

<Pagination current={page} total={120} onChange={(p) => setPage(p)} />`}
      >
        <ControlledDemo />
      </DemoBlock>

      <DemoBlock
        title="每页条数切换"
        description="showSizeChanger 展开选择器,默认 [10, 20, 50, 100]。"
        code={`<Pagination
  total={500}
  showSizeChanger
  pageSizeOptions={[10, 20, 50, 100]}
  onChange={(p, s) => console.log(p, s)}
/>`}
      >
        <Pagination total={500} showSizeChanger />
      </DemoBlock>

      <DemoBlock
        title="跳转到指定页"
        description="showQuickJumper 出现输入框, 回车或失焦确认。"
        code={`<Pagination total={500} showSizeChanger showQuickJumper />`}
      >
        <Pagination total={500} showSizeChanger showQuickJumper />
      </DemoBlock>

      <DemoBlock
        title="显示总数"
        description="showTotal 自定义总数提示,参数为 (total, [start, end])。"
        code={`<Pagination
  total={245}
  showTotal={(t, [a, b]) => \`第 \${a}-\${b} 条 / 共 \${t} 条\`}
/>`}
      >
        <Pagination
          total={245}
          showTotal={(t, [a, b]) => `第 ${a}-${b} 条 / 共 ${t} 条`}
        />
      </DemoBlock>

      <DemoBlock
        title="简洁模式"
        description="simple 仅保留前后按钮和页码输入,适合嵌入工具栏。"
        code={`<Pagination simple total={120} />`}
      >
        <Pagination simple total={120} />
      </DemoBlock>

      <DemoBlock
        title="小号"
        description="size='small' 紧凑版。"
        code={`<Pagination size="small" total={80} showSizeChanger />`}
      >
        <Pagination size="small" total={80} showSizeChanger showQuickJumper />
      </DemoBlock>

      <DemoBlock
        title="禁用"
        description="disabled 屏蔽所有交互。"
        code={`<Pagination disabled total={80} />`}
      >
        <Pagination disabled total={80} showSizeChanger />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'total', desc: '数据总条数', type: 'number', default: '-' },
          { prop: 'current / defaultCurrent', desc: '当前页', type: 'number', default: '1' },
          { prop: 'pageSize / defaultPageSize', desc: '每页条数', type: 'number', default: '10' },
          { prop: 'pageSizeOptions', desc: 'size 选项', type: 'number[]', default: '[10, 20, 50, 100]' },
          { prop: 'showSizeChanger', desc: '显示每页条数切换', type: 'boolean', default: 'false' },
          { prop: 'showQuickJumper', desc: '显示跳转输入框', type: 'boolean', default: 'false' },
          { prop: 'showTotal', desc: '显示总数文案', type: '(total, [start, end]) => ReactNode', default: '-' },
          { prop: 'simple', desc: '简洁模式', type: 'boolean', default: 'false' },
          { prop: 'hideOnSinglePage', desc: '只有一页时隐藏', type: 'boolean', default: 'false' },
          { prop: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
          { prop: 'size', desc: '尺寸', type: `'default' | 'small'`, default: `'default'` },
          { prop: 'onChange', desc: '页码或每页条数变化', type: '(page, pageSize) => void', default: '-' },
          { prop: 'onShowSizeChange', desc: '每页条数变化', type: '(current, size) => void', default: '-' },
        ]}
      />
    </>
  );
};

const ControlledDemo: React.FC = () => {
  const [page, setPage] = useState(3);
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <Pagination current={page} total={120} onChange={(p) => setPage(p)} />
      <span style={{ fontSize: 13, color: 'var(--au-text-2)' }}>当前页: {page}</span>
    </div>
  );
};

export default PaginationDoc;
