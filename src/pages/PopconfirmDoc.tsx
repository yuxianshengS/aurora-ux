import React from 'react';
import { Popconfirm, message } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const PopconfirmDoc: React.FC = () => {
  return (
    <>
      <h1>Popconfirm 气泡确认框</h1>
      <p>
        点击触发元素后弹出的小型确认气泡。比 Modal 更轻,适合行内高频操作 (删除、解绑、重置等)。
        支持 8 个位置、异步确认、自定义图标。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="包裹任意可点击元素, onConfirm 处理确认逻辑。"
        code={`<Popconfirm
  title="确认删除吗?"
  description="删除后不可恢复"
  onConfirm={() => message.success('已删除')}
  onCancel={() => message.info('已取消')}
>
  <button className="au-btn au-btn--danger au-btn--medium">删除</button>
</Popconfirm>`}
      >
        <Popconfirm
          title="确认删除吗?"
          description="删除后不可恢复"
          onConfirm={() => {
            message.success('已删除');
          }}
          onCancel={() => {
            message.info('已取消');
          }}
        >
          <button className="au-btn au-btn--danger au-btn--medium">删除</button>
        </Popconfirm>
      </DemoBlock>

      <DemoBlock
        title="异步确认"
        description="onConfirm 返回 Promise 时,确认按钮自动 loading 直到 resolve。"
        code={`<Popconfirm
  title="要提交吗?"
  onConfirm={async () => {
    await new Promise((r) => setTimeout(r, 1200));
    message.success('已提交');
  }}
>
  <button className="au-btn au-btn--primary au-btn--medium">提交</button>
</Popconfirm>`}
      >
        <Popconfirm
          title="要提交吗?"
          onConfirm={async () => {
            await new Promise((r) => setTimeout(r, 1200));
            message.success('已提交');
          }}
        >
          <button className="au-btn au-btn--primary au-btn--medium">提交</button>
        </Popconfirm>
      </DemoBlock>

      <DemoBlock
        title="八个位置"
        description="placement 支持 top / topLeft / topRight / bottom / ... / left / right。"
        code={`<Popconfirm placement="topLeft" title="..." />
<Popconfirm placement="bottomRight" title="..." />
<Popconfirm placement="right" title="..." />`}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: 8, justifyContent: 'start' }}>
          {(['topLeft', 'top', 'topRight', 'left', 'right', 'bottomLeft', 'bottom', 'bottomRight'] as const).map(
            (p) => (
              <Popconfirm key={p} placement={p} title={`placement = ${p}`}>
                <button className="au-btn au-btn--default au-btn--small">{p}</button>
              </Popconfirm>
            ),
          )}
        </div>
      </DemoBlock>

      <DemoBlock
        title="无图标 · 危险按钮"
        description="icon={null} 隐藏图标; okType='danger' 使用红色确认按钮。"
        code={`<Popconfirm icon={null} okType="danger" title="清空所有数据吗?" okText="清空">
  <button className="au-btn au-btn--default au-btn--medium">清空</button>
</Popconfirm>`}
      >
        <Popconfirm icon={null} okType="danger" title="清空所有数据吗?" okText="清空">
          <button className="au-btn au-btn--default au-btn--medium">清空</button>
        </Popconfirm>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'title', desc: '确认标题 (必填)', type: 'ReactNode', default: '-' },
          { prop: 'description', desc: '辅助说明', type: 'ReactNode', default: '-' },
          { prop: 'okText / cancelText', desc: '按钮文案', type: 'ReactNode', default: `'确定' / '取消'` },
          { prop: 'okType', desc: '确认按钮类型', type: `'primary' | 'danger'`, default: `'primary'` },
          { prop: 'icon', desc: '图标; null 隐藏', type: 'ReactNode | null', default: '警告图标' },
          {
            prop: 'placement',
            desc: '弹出位置',
            type: `'top'|'topLeft'|'topRight'|'bottom'|'bottomLeft'|'bottomRight'|'left'|'right'`,
            default: `'top'`,
          },
          { prop: 'open', desc: '受控显隐', type: 'boolean', default: '-' },
          { prop: 'onConfirm', desc: '确认回调; Promise 自动 loading', type: '() => void | Promise<void>', default: '-' },
          { prop: 'onCancel', desc: '取消回调', type: '() => void', default: '-' },
          { prop: 'onOpenChange', desc: '显隐变化', type: '(open) => void', default: '-' },
          { prop: 'disabled', desc: '禁用 (点击不触发)', type: 'boolean', default: 'false' },
        ]}
      />
    </>
  );
};

export default PopconfirmDoc;
