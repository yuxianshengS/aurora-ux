import React from 'react';
import { Alert } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const AlertDoc: React.FC = () => {
  return (
    <>
      <h1>Alert 警告提示</h1>
      <p>
        常驻页面的提示条,用于承载需要用户关注但不阻塞操作的信息。
        支持四种状态、图标、描述、关闭、自定义操作。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="四种类型"
        description="type=info/success/warning/error。"
        code={`<Alert type="info" title="信息" showIcon />
<Alert type="success" title="保存成功" showIcon />
<Alert type="warning" title="请注意" showIcon />
<Alert type="error" title="发生错误" showIcon />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Alert type="info" title="这是一条信息提示" showIcon />
          <Alert type="success" title="保存成功" showIcon />
          <Alert type="warning" title="请注意余额不足" showIcon />
          <Alert type="error" title="请求失败,请重试" showIcon />
        </div>
      </DemoBlock>

      <DemoBlock
        title="带描述"
        description="同时传 title + description,版式自动切换为两段式。"
        code={`<Alert
  type="warning"
  showIcon
  title="浏览器版本较低"
  description="当前版本不支持部分特性,建议升级到最新稳定版以获得完整体验。"
/>`}
      >
        <Alert
          type="warning"
          showIcon
          title="浏览器版本较低"
          description="当前版本不支持部分特性,建议升级到最新稳定版以获得完整体验。"
        />
      </DemoBlock>

      <DemoBlock
        title="可关闭"
        description="closable 出现关闭按钮; onClose 可取消默认关闭。"
        code={`<Alert
  type="info"
  showIcon
  closable
  title="你可以关闭这条提示"
  onClose={() => console.log('closed')}
/>`}
      >
        <Alert
          type="info"
          showIcon
          closable
          title="你可以关闭这条提示"
        />
      </DemoBlock>

      <DemoBlock
        title="自定义操作"
        description={`action 放右侧自定义按钮, 常用于 "去升级 / 查看详情"。`}
        code={`<Alert
  type="warning"
  showIcon
  title="你有未完成的订单"
  action={
    <button className="au-btn au-btn--primary au-btn--small">去处理</button>
  }
/>`}
      >
        <Alert
          type="warning"
          showIcon
          title="你有未完成的订单"
          action={<button className="au-btn au-btn--primary au-btn--small">去处理</button>}
        />
      </DemoBlock>

      <DemoBlock
        title="横幅模式"
        description="banner 去掉圆角、左右边框,通常钉在顶部。"
        code={`<Alert banner type="info" title="2026 春季版本发布,点击查看更新" />`}
      >
        <Alert banner type="info" title="2026 春季版本发布,点击查看更新" closable />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'type', desc: '类型', type: `'info' | 'success' | 'warning' | 'error'`, default: `'info'` },
          { prop: 'title', desc: '标题 / 单行内容', type: 'ReactNode', default: '-' },
          { prop: 'description', desc: '描述 (传了之后切换为两段式)', type: 'ReactNode', default: '-' },
          { prop: 'showIcon', desc: '显示图标', type: 'boolean', default: '带描述或 banner 时默认 true' },
          { prop: 'icon', desc: '自定义图标', type: 'ReactNode', default: '按类型内置' },
          { prop: 'closable', desc: '显示关闭按钮', type: 'boolean', default: 'false' },
          { prop: 'closeText', desc: '关闭按钮内容 (替换 X)', type: 'ReactNode', default: '-' },
          { prop: 'action', desc: '右侧操作节点', type: 'ReactNode', default: '-' },
          { prop: 'banner', desc: '横幅模式 (无圆角 / 无左右边框)', type: 'boolean', default: 'false' },
          { prop: 'onClose', desc: '关闭回调; 调 e.preventDefault() 阻止关闭', type: '(e) => void', default: '-' },
        ]}
      />
    </>
  );
};

export default AlertDoc;
