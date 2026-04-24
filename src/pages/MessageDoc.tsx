import React from 'react';
import { message } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const MessageDoc: React.FC = () => {
  return (
    <>
      <h1>Message 全局提示</h1>
      <p>
        轻量级的顶部提示,用于不打断用户操作的反馈。通过命令式 API 调用,
        多条自动排队,默认 3 秒后消失。loading 类型默认不自动关闭。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="五种类型,一行调用。"
        code={`message.info('这是一条信息');
message.success('保存成功');
message.error('出错了');
message.warning('注意风险');
message.loading('正在加载…');`}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="au-btn au-btn--default au-btn--medium" onClick={() => message.info('这是一条信息')}>info</button>
          <button className="au-btn au-btn--default au-btn--medium" onClick={() => message.success('保存成功')}>success</button>
          <button className="au-btn au-btn--default au-btn--medium" onClick={() => message.error('出错了')}>error</button>
          <button className="au-btn au-btn--default au-btn--medium" onClick={() => message.warning('注意风险')}>warning</button>
          <button className="au-btn au-btn--default au-btn--medium" onClick={() => message.loading('正在加载…')}>loading</button>
        </div>
      </DemoBlock>

      <DemoBlock
        title="自定义时长"
        description="duration 单位秒的整数毫秒 (数字类型),0 表示不自动关闭。"
        code={`message.success({ content: '持续 6 秒', duration: 6000 });
message.info({ content: '不自动关闭,需手动调用', duration: 0 });`}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className="au-btn au-btn--default au-btn--medium"
            onClick={() => message.success({ content: '持续 6 秒', duration: 6000 })}
          >
            6 秒
          </button>
          <button
            className="au-btn au-btn--default au-btn--medium"
            onClick={() => {
              const close = message.info({ content: '不自动关闭,点按钮销毁', duration: 0 });
              setTimeout(close, 3500);
            }}
          >
            常驻 (3.5s 后程序化关闭)
          </button>
        </div>
      </DemoBlock>

      <DemoBlock
        title="key 去重 · 更新"
        description="传入相同 key 时替换而非堆叠,常用于 loading → success 的切换。"
        code={`message.loading({ content: '保存中…', key: 'save', duration: 0 });
setTimeout(() => {
  message.success({ content: '已保存', key: 'save', duration: 2000 });
}, 1500);`}
      >
        <button
          className="au-btn au-btn--primary au-btn--medium"
          onClick={() => {
            message.loading({ content: '保存中…', key: 'save', duration: 0 });
            setTimeout(() => {
              message.success({ content: '已保存', key: 'save', duration: 2000 });
            }, 1500);
          }}
        >
          模拟保存
        </button>
      </DemoBlock>

      <DemoBlock
        title="全部销毁"
        description="message.destroy() 清掉所有,或传 key 销毁单条。"
        code={`message.destroy();
message.destroy('save');`}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="au-btn au-btn--default au-btn--medium"
            onClick={() => {
              message.info({ content: '一', duration: 0 });
              message.info({ content: '二', duration: 0 });
              message.info({ content: '三', duration: 0 });
            }}
          >
            连开 3 条
          </button>
          <button className="au-btn au-btn--danger au-btn--medium" onClick={() => message.destroy()}>
            全部销毁
          </button>
        </div>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'message.info/success/error/warning/loading', desc: '打开一条提示; 返回 close 函数', type: '(opts | content) => () => void', default: '-' },
          { prop: 'content', desc: '内容 (传字符串时直接作为 content)', type: 'ReactNode', default: '-' },
          { prop: 'duration', desc: '毫秒; 0 不自动关闭; loading 默认 0', type: 'number', default: '3000' },
          { prop: 'key', desc: '唯一标识; 相同 key 更新已存在的条目', type: 'string | number', default: '-' },
          { prop: 'onClose', desc: '关闭回调', type: '() => void', default: '-' },
          { prop: 'icon', desc: '自定义图标', type: 'ReactNode', default: '-' },
          { prop: 'message.destroy', desc: '销毁全部或指定 key', type: '(key?) => void', default: '-' },
        ]}
      />
    </>
  );
};

export default MessageDoc;
