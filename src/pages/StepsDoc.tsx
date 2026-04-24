import React, { useState } from 'react';
import { Steps } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const StepsDoc: React.FC = () => {
  return (
    <>
      <h1>Steps 步骤条</h1>
      <p>
        分步引导用户完成一个流程。支持横向 / 纵向排列,默认 / 点状 / 导航三种样式,
        并带有等待 / 进行中 / 完成 / 错误 四种状态。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="current 指示当前激活的步骤,小于它为已完成,大于它为等待。"
        code={`<Steps
  current={1}
  items={[
    { title: '创建账户', description: '填写基础信息' },
    { title: '实名认证', description: '上传证件' },
    { title: '完成', description: '开始使用' },
  ]}
/>`}
      >
        <Steps
          current={1}
          items={[
            { title: '创建账户', description: '填写基础信息' },
            { title: '实名认证', description: '上传证件' },
            { title: '完成', description: '开始使用' },
          ]}
        />
      </DemoBlock>

      <DemoBlock
        title="交互流程"
        description="点击步骤 / 下一步按钮推进; 传 onChange 使步骤可点。"
        code={`const [cur, setCur] = useState(0);

<Steps current={cur} onChange={setCur} items={...} />
<button onClick={() => setCur((c) => Math.min(c + 1, 3))}>下一步</button>`}
      >
        <InteractiveDemo />
      </DemoBlock>

      <DemoBlock
        title="错误状态"
        description="整体 status='error' 表示当前步骤失败。"
        code={`<Steps current={1} status="error" items={...} />`}
      >
        <Steps
          current={1}
          status="error"
          items={[
            { title: '上传文件', description: '已完成' },
            { title: '病毒扫描', description: '扫描失败' },
            { title: '发布', description: '等待中' },
          ]}
        />
      </DemoBlock>

      <DemoBlock
        title="点状步骤条"
        description="type='dot' 节点简化为小圆点,适合横幅式指示。"
        code={`<Steps type="dot" current={1} items={...} />`}
      >
        <Steps
          type="dot"
          current={1}
          items={[
            { title: '下单' },
            { title: '发货' },
            { title: '配送中' },
            { title: '已签收' },
          ]}
        />
      </DemoBlock>

      <DemoBlock
        title="垂直方向"
        description="direction='vertical' 适合详细流程展示。"
        code={`<Steps direction="vertical" current={1} items={...} />`}
      >
        <Steps
          direction="vertical"
          current={1}
          items={[
            { title: '提交申请', description: '2026-04-20 10:12' },
            { title: '审核中', description: '风控部门正在处理' },
            { title: '放款', description: '待处理' },
          ]}
        />
      </DemoBlock>

      <DemoBlock
        title="标签竖排 (horizontal + labelPlacement='vertical')"
        description="水平方向下让文字在节点下方,节省宽度。"
        code={`<Steps labelPlacement="vertical" current={1} items={...} />`}
      >
        <Steps
          labelPlacement="vertical"
          current={1}
          items={[
            { title: '选择商品' },
            { title: '填写地址' },
            { title: '支付' },
            { title: '完成' },
          ]}
        />
      </DemoBlock>

      <DemoBlock
        title="自定义图标"
        description="item.icon 替换默认序号。"
        code={`{ title: '登录', icon: '🔑' }`}
      >
        <Steps
          current={2}
          items={[
            { title: '登录', icon: <span>🔑</span> },
            { title: '验证', icon: <span>🛡</span> },
            { title: '支付', icon: <span>💳</span> },
            { title: '完成', icon: <span>🎉</span> },
          ]}
        />
      </DemoBlock>

      <DemoBlock
        title="小号"
        description="size='small'。"
        code={`<Steps size="small" current={1} items={...} />`}
      >
        <Steps
          size="small"
          current={1}
          items={[
            { title: '第一步' },
            { title: '第二步' },
            { title: '第三步' },
          ]}
        />
      </DemoBlock>

      <h2>API</h2>
      <h3>Steps</h3>
      <ApiTable
        rows={[
          { prop: 'items', desc: '步骤配置', type: 'StepItem[]', default: '-' },
          { prop: 'current', desc: '当前步骤 (从 0 开始)', type: 'number', default: '0' },
          { prop: 'status', desc: '当前步骤整体状态', type: `'wait' | 'process' | 'finish' | 'error'`, default: `'process'` },
          { prop: 'direction', desc: '方向', type: `'horizontal' | 'vertical'`, default: `'horizontal'` },
          { prop: 'type', desc: '类型', type: `'default' | 'dot' | 'navigation'`, default: `'default'` },
          { prop: 'size', desc: '尺寸', type: `'default' | 'small'`, default: `'default'` },
          { prop: 'labelPlacement', desc: '标签位置 (水平模式下可选 vertical)', type: `'horizontal' | 'vertical'`, default: `'horizontal'` },
          { prop: 'onChange', desc: '点击步骤; 传入后步骤变为可点击', type: '(current) => void', default: '-' },
        ]}
      />
      <h3>StepItem</h3>
      <ApiTable
        rows={[
          { prop: 'title', desc: '标题', type: 'ReactNode', default: '-' },
          { prop: 'description', desc: '描述', type: 'ReactNode', default: '-' },
          { prop: 'icon', desc: '自定义图标 (替代序号)', type: 'ReactNode', default: '-' },
          { prop: 'status', desc: '单步状态 (覆盖自动计算)', type: `'wait' | 'process' | 'finish' | 'error'`, default: '-' },
          { prop: 'disabled', desc: '禁止点击', type: 'boolean', default: 'false' },
        ]}
      />
    </>
  );
};

const InteractiveDemo: React.FC = () => {
  const [cur, setCur] = useState(0);
  const steps = [
    { title: '登录', description: '使用邮箱或手机号' },
    { title: '填写资料', description: '个人信息 + 偏好' },
    { title: '验证', description: '短信验证码' },
    { title: '完成', description: '欢迎加入!' },
  ];
  return (
    <div>
      <Steps current={cur} onChange={setCur} items={steps} />
      <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
        <button className="au-btn au-btn--default au-btn--medium" disabled={cur === 0} onClick={() => setCur((c) => c - 1)}>
          上一步
        </button>
        <button
          className="au-btn au-btn--primary au-btn--medium"
          disabled={cur >= steps.length - 1}
          onClick={() => setCur((c) => c + 1)}
        >
          下一步
        </button>
        <button className="au-btn au-btn--ghost au-btn--medium" onClick={() => setCur(0)}>
          重置
        </button>
      </div>
    </div>
  );
};

export default StepsDoc;
