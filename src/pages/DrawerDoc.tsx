import React, { useState } from 'react';
import { Drawer } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const DrawerDoc: React.FC = () => {
  return (
    <>
      <h1>Drawer 抽屉</h1>
      <p>
        从屏幕一侧滑入的面板,适合承载表单、详情、设置等次要流程。
        支持上下左右四个方向、自定义宽高、Esc / 遮罩关闭。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="默认从右侧滑入。"
        code={`const [open, setOpen] = useState(false);

<Drawer open={open} title="基础抽屉" onClose={() => setOpen(false)}>
  抽屉内容
</Drawer>`}
      >
        <BasicDemo />
      </DemoBlock>

      <DemoBlock
        title="四个方向"
        description="placement 支持 right (默认) / left / top / bottom。"
        code={`<Drawer placement="left" open={open} onClose={...} />
<Drawer placement="top"  open={open} onClose={...} />
<Drawer placement="bottom" open={open} onClose={...} />`}
      >
        <PlacementDemo />
      </DemoBlock>

      <DemoBlock
        title="带底部操作"
        description="footer 放置表单按钮,header + body + footer 三段布局。"
        code={`<Drawer
  open={open}
  title="编辑用户"
  onClose={close}
  footer={
    <>
      <button className="au-btn au-btn--default au-btn--medium" onClick={close}>取消</button>
      <button className="au-btn au-btn--primary au-btn--medium" onClick={close}>保存</button>
    </>
  }
>
  {/* 表单内容 */}
</Drawer>`}
      >
        <FooterDemo />
      </DemoBlock>

      <DemoBlock
        title="自定义宽度"
        description="宽度可传 number (px) 或任意 CSS 宽度字符串。"
        code={`<Drawer width={560} open={...} />`}
      >
        <WidthDemo />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'open', desc: '是否可见', type: 'boolean', default: 'false' },
          { prop: 'placement', desc: '抽屉方向', type: `'top' | 'right' | 'bottom' | 'left'`, default: `'right'` },
          { prop: 'title', desc: '标题', type: 'ReactNode', default: '-' },
          { prop: 'footer', desc: '底部', type: 'ReactNode', default: '-' },
          { prop: 'width', desc: '宽度 (左右方向)', type: 'number | string', default: '360' },
          { prop: 'height', desc: '高度 (上下方向)', type: 'number | string', default: '360' },
          { prop: 'closable', desc: '显示关闭按钮', type: 'boolean', default: 'true' },
          { prop: 'maskClosable', desc: '点遮罩关闭', type: 'boolean', default: 'true' },
          { prop: 'keyboard', desc: 'Esc 关闭', type: 'boolean', default: 'true' },
          { prop: 'mask', desc: '显示遮罩', type: 'boolean', default: 'true' },
          { prop: 'onClose', desc: '关闭回调', type: '() => void', default: '-' },
          { prop: 'afterClose', desc: '关闭动画结束后', type: '() => void', default: '-' },
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
        打开抽屉
      </button>
      <Drawer open={open} title="基础抽屉" onClose={() => setOpen(false)}>
        <p style={{ marginTop: 0 }}>这是默认从右侧滑入的抽屉。</p>
        <p>Esc / 点遮罩 / 点关闭按钮 都能关闭。</p>
      </Drawer>
    </>
  );
};

const PlacementDemo: React.FC = () => {
  const [p, setP] = useState<null | 'top' | 'right' | 'bottom' | 'left'>(null);
  return (
    <>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {(['top', 'right', 'bottom', 'left'] as const).map((x) => (
          <button
            key={x}
            className="au-btn au-btn--default au-btn--medium"
            onClick={() => setP(x)}
          >
            {x}
          </button>
        ))}
      </div>
      <Drawer
        open={!!p}
        placement={p ?? 'right'}
        title={`placement = ${p}`}
        onClose={() => setP(null)}
      >
        从 <b>{p}</b> 方向滑入。
      </Drawer>
    </>
  );
};

const FooterDemo: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="au-btn au-btn--default au-btn--medium" onClick={() => setOpen(true)}>
        编辑
      </button>
      <Drawer
        open={open}
        title="编辑用户"
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className="au-btn au-btn--default au-btn--medium" onClick={() => setOpen(false)}>
              取消
            </button>
            <button className="au-btn au-btn--primary au-btn--medium" onClick={() => setOpen(false)}>
              保存
            </button>
          </>
        }
      >
        <p style={{ marginTop: 0 }}>表单 / 详情内容放这里。</p>
      </Drawer>
    </>
  );
};

const WidthDemo: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="au-btn au-btn--default au-btn--medium" onClick={() => setOpen(true)}>
        560px 宽
      </button>
      <Drawer open={open} width={560} title="宽一些" onClose={() => setOpen(false)}>
        宽度为 560px 的抽屉。
      </Drawer>
    </>
  );
};

export default DrawerDoc;
