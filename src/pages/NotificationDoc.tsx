import React from 'react';
import { notification } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const NotificationDoc: React.FC = () => {
  return (
    <>
      <h1>Notification 通知提醒框</h1>
      <p>
        出现在页面四角的通知卡片,承载更复杂的消息 (标题 + 描述 + 操作)。
        支持四个位置、自定义按钮、点击回调。默认 4.5 秒后自动关闭。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="title + description 两段式结构。"
        code={`notification.open({
  title: '通知标题',
  description: '这是一段通知描述,可以写比较长的文字。',
});`}
      >
        <button
          className="au-btn au-btn--primary au-btn--medium"
          onClick={() =>
            notification.open({
              title: '通知标题',
              description: '这是一段通知描述,可以写比较长的文字。',
            })
          }
        >
          打开通知
        </button>
      </DemoBlock>

      <DemoBlock
        title="四种状态"
        description="带内置图标。"
        code={`notification.success({ title: '上传成功', description: '文件已保存至云端' });
notification.info(...);
notification.warning(...);
notification.error(...);`}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className="au-btn au-btn--default au-btn--medium"
            onClick={() =>
              notification.success({ title: '上传成功', description: '文件已保存至云端' })
            }
          >
            success
          </button>
          <button
            className="au-btn au-btn--default au-btn--medium"
            onClick={() =>
              notification.info({ title: '有新消息', description: '你有 3 条未读通知' })
            }
          >
            info
          </button>
          <button
            className="au-btn au-btn--default au-btn--medium"
            onClick={() =>
              notification.warning({ title: '额度将满', description: '剩余存储不足 10%' })
            }
          >
            warning
          </button>
          <button
            className="au-btn au-btn--default au-btn--medium"
            onClick={() =>
              notification.error({ title: '提交失败', description: '网络异常,请稍后重试' })
            }
          >
            error
          </button>
        </div>
      </DemoBlock>

      <DemoBlock
        title="四个位置"
        description="placement 可选 topRight (默认) / topLeft / bottomRight / bottomLeft。"
        code={`notification.open({ title: '...', placement: 'bottomLeft' });`}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const).map((p) => (
            <button
              key={p}
              className="au-btn au-btn--default au-btn--medium"
              onClick={() =>
                notification.open({
                  title: p,
                  description: `出现在 ${p}`,
                  placement: p,
                })
              }
            >
              {p}
            </button>
          ))}
        </div>
      </DemoBlock>

      <DemoBlock
        title="自定义操作按钮"
        description="用 btn 放置交互按钮 (撤销、查看详情等)。"
        code={`const close = notification.info({
  title: '已删除',
  description: '文件已移至回收站',
  btn: (
    <button className="au-btn au-btn--ghost au-btn--small" onClick={() => { ...; close(); }}>
      撤销
    </button>
  ),
  duration: 6000,
});`}
      >
        <button
          className="au-btn au-btn--default au-btn--medium"
          onClick={() => {
            const close = notification.info({
              title: '已删除',
              description: '文件已移至回收站',
              duration: 6000,
              btn: (
                <button
                  className="au-btn au-btn--ghost au-btn--small"
                  onClick={() => {
                    close();
                  }}
                >
                  撤销
                </button>
              ),
            });
          }}
        >
          删除 (带撤销)
        </button>
      </DemoBlock>

      <DemoBlock
        title="更新同一条"
        description="传相同 key 时更新,不会堆叠。"
        code={`notification.open({ key: 'progress', title: '上传中 30%' });
notification.open({ key: 'progress', title: '上传中 80%' });
notification.success({ key: 'progress', title: '上传完成' });`}
      >
        <button
          className="au-btn au-btn--primary au-btn--medium"
          onClick={() => {
            notification.open({ key: 'progress', title: '上传中 30%', description: '请稍候', duration: 0 });
            setTimeout(() => {
              notification.open({ key: 'progress', title: '上传中 80%', description: '快完了', duration: 0 });
            }, 1200);
            setTimeout(() => {
              notification.success({ key: 'progress', title: '上传完成', description: '文件已保存', duration: 2500 });
            }, 2400);
          }}
        >
          模拟上传进度
        </button>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'notification.open/info/success/error/warning', desc: '打开一条; 返回 close 函数', type: '(opts) => () => void', default: '-' },
          { prop: 'title', desc: '标题', type: 'ReactNode', default: '-' },
          { prop: 'description', desc: '描述', type: 'ReactNode', default: '-' },
          { prop: 'icon', desc: '自定义图标', type: 'ReactNode', default: '按类型内置' },
          { prop: 'btn', desc: '操作区域 (按钮等)', type: 'ReactNode', default: '-' },
          { prop: 'placement', desc: '位置', type: `'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft'`, default: `'topRight'` },
          { prop: 'duration', desc: '毫秒; 0 不自动关闭', type: 'number', default: '4500' },
          { prop: 'key', desc: '唯一 key,相同时更新', type: 'string | number', default: '-' },
          { prop: 'closable', desc: '显示关闭按钮', type: 'boolean', default: 'true' },
          { prop: 'onClose', desc: '关闭回调', type: '() => void', default: '-' },
          { prop: 'onClick', desc: '卡片点击', type: '() => void', default: '-' },
          { prop: 'notification.destroy', desc: '销毁全部或指定 key', type: '(key?) => void', default: '-' },
        ]}
      />
    </>
  );
};

export default NotificationDoc;
