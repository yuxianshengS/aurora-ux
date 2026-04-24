import React, { useState } from 'react';
import { Modal } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const ModalDoc: React.FC = () => {
  return (
    <>
      <h1>Modal 对话框</h1>
      <p>
        承载次要流程的悬浮层。支持标题、自定义底部、受控开关,
        Esc / 遮罩关闭。同时提供 <code>Modal.confirm</code> 等静态方法,
        无需挂载节点即可弹出。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="通过 open 控制显隐; onOk / onCancel 负责关闭。"
        code={`const [open, setOpen] = useState(false);

<button className="au-btn au-btn--primary au-btn--medium" onClick={() => setOpen(true)}>
  打开
</button>
<Modal
  open={open}
  title="基础对话框"
  onOk={() => setOpen(false)}
  onCancel={() => setOpen(false)}
>
  <p>这里是对话框内容。</p>
</Modal>`}
      >
        <BasicDemo />
      </DemoBlock>

      <DemoBlock
        title="异步关闭"
        description="onOk 返回 Promise 时,确定按钮自动进入 loading。"
        code={`<Modal
  open={open}
  title="保存更改"
  onOk={async () => {
    await new Promise((r) => setTimeout(r, 1200));
    setOpen(false);
  }}
  onCancel={() => setOpen(false)}
>
  点击"确定"会模拟 1.2 秒的网络请求。
</Modal>`}
      >
        <AsyncDemo />
      </DemoBlock>

      <DemoBlock
        title="静态方法"
        description="Modal.confirm / info / success / error / warning 直接调起,无需 state。"
        code={`Modal.confirm({
  title: '删除后不可恢复',
  content: '确定要删除这条数据吗?',
  okText: '删除',
  onOk: () => console.log('deleted'),
});

Modal.success({ title: '操作成功', content: '已保存到草稿' });`}
      >
        <StaticDemo />
      </DemoBlock>

      <DemoBlock
        title="自定义底部 / 无底部"
        description="footer 为 null 隐藏底部; 传入自定义节点替换按钮区。"
        code={`<Modal open={open} title="只有关闭按钮" footer={null} onCancel={() => setOpen(false)}>
  没有底部的对话框
</Modal>`}
      >
        <FooterDemo />
      </DemoBlock>

      <DemoBlock
        title="居中显示"
        description="centered 垂直居中,适合小弹窗。"
        code={`<Modal open={open} centered title="居中" onCancel={...}>...</Modal>`}
      >
        <CenteredDemo />
      </DemoBlock>

      <h2>API</h2>
      <h3>Modal</h3>
      <ApiTable
        rows={[
          { prop: 'open', desc: '是否可见', type: 'boolean', default: 'false' },
          { prop: 'title', desc: '标题', type: 'ReactNode', default: '-' },
          { prop: 'footer', desc: '底部; 传 null 隐藏', type: 'ReactNode | null', default: '默认按钮组' },
          { prop: 'width', desc: '宽度', type: 'number | string', default: '520' },
          { prop: 'closable', desc: '显示右上角关闭按钮', type: 'boolean', default: 'true' },
          { prop: 'maskClosable', desc: '点击遮罩关闭', type: 'boolean', default: 'true' },
          { prop: 'keyboard', desc: 'Esc 关闭', type: 'boolean', default: 'true' },
          { prop: 'centered', desc: '垂直居中', type: 'boolean', default: 'false' },
          { prop: 'okText', desc: '确定文案', type: 'ReactNode', default: `'确定'` },
          { prop: 'cancelText', desc: '取消文案', type: 'ReactNode', default: `'取消'` },
          { prop: 'confirmLoading', desc: '确定按钮 loading', type: 'boolean', default: 'false' },
          { prop: 'onOk', desc: '点击确定; 返回 Promise 自动 loading', type: '() => void | Promise<void>', default: '-' },
          { prop: 'onCancel', desc: '关闭触发 (X / 遮罩 / Esc / 取消)', type: '() => void', default: '-' },
          { prop: 'afterClose', desc: '关闭动画结束后', type: '() => void', default: '-' },
        ]}
      />
      <h3>静态方法 · Modal.confirm / info / success / error / warning</h3>
      <ApiTable
        rows={[
          { prop: 'title', desc: '标题', type: 'ReactNode', default: '-' },
          { prop: 'content', desc: '正文', type: 'ReactNode', default: '-' },
          { prop: 'okText / cancelText', desc: '按钮文案', type: 'ReactNode', default: `'确定' / '取消'` },
          { prop: 'onOk', desc: '确定回调; Promise 自动 loading', type: '() => void | Promise<void>', default: '-' },
          { prop: 'onCancel', desc: '取消回调', type: '() => void', default: '-' },
          { prop: '返回值', desc: '{ destroy }', type: 'ConfirmHandle', default: '-' },
        ]}
      />
    </>
  );
};

const BasicDemo: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="au-btn au-btn--primary au-btn--medium" onClick={() => setOpen(true)}>
        打开对话框
      </button>
      <Modal open={open} title="基础对话框" onOk={() => setOpen(false)} onCancel={() => setOpen(false)}>
        <p style={{ margin: 0 }}>点击"确定"或"取消",或按 Esc / 点遮罩关闭。</p>
      </Modal>
    </>
  );
};

const AsyncDemo: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="au-btn au-btn--primary au-btn--medium" onClick={() => setOpen(true)}>
        异步确认
      </button>
      <Modal
        open={open}
        title="保存更改"
        onOk={async () => {
          await new Promise((r) => setTimeout(r, 1200));
          setOpen(false);
        }}
        onCancel={() => setOpen(false)}
      >
        点击"确定"会模拟 1.2 秒的网络请求,期间按钮处于 loading。
      </Modal>
    </>
  );
};

const StaticDemo: React.FC = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
    <button
      className="au-btn au-btn--danger au-btn--medium"
      onClick={() =>
        Modal.confirm({
          title: '删除后不可恢复',
          content: '确定要删除这条数据吗?',
          okText: '删除',
        })
      }
    >
      确认删除
    </button>
    <button
      className="au-btn au-btn--default au-btn--medium"
      onClick={() => Modal.info({ title: '提示', content: '这是一条说明信息。' })}
    >
      信息
    </button>
    <button
      className="au-btn au-btn--default au-btn--medium"
      onClick={() => Modal.success({ title: '操作成功', content: '已保存到草稿' })}
    >
      成功
    </button>
    <button
      className="au-btn au-btn--default au-btn--medium"
      onClick={() => Modal.warning({ title: '稍等', content: '当前网络较慢,请耐心等待' })}
    >
      警告
    </button>
    <button
      className="au-btn au-btn--default au-btn--medium"
      onClick={() => Modal.error({ title: '出错了', content: '服务器开小差了,请稍后重试' })}
    >
      错误
    </button>
  </div>
);

const FooterDemo: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="au-btn au-btn--default au-btn--medium" onClick={() => setOpen(true)}>
        打开
      </button>
      <Modal open={open} title="仅关闭按钮" footer={null} onCancel={() => setOpen(false)}>
        <p style={{ margin: 0 }}>当 footer 为 null 时,不显示底部按钮。</p>
      </Modal>
    </>
  );
};

const CenteredDemo: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="au-btn au-btn--default au-btn--medium" onClick={() => setOpen(true)}>
        居中打开
      </button>
      <Modal
        open={open}
        centered
        width={360}
        title="居中显示"
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      >
        小窗口居中显示。
      </Modal>
    </>
  );
};

export default ModalDoc;
