import React from 'react';
import { Result, Button } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const ResultDoc: React.FC = () => {
  return (
    <>
      <h1>Result 结果页</h1>
      <p>展示操作的最终结果(成功 / 失败 / 警告)或异常页(404 / 403 / 500)。</p>

      <h2>代码演示</h2>

      <DemoBlock title="成功" code={`<Result status="success" title="提交成功" />`}>
        <Result
          status="success"
          title="提交成功"
          subTitle="订单 #2026-0419 已提交, 预计 24 小时内审批完成"
          extra={[<Button key="ok" type="primary">查看订单</Button>, <Button key="back">返回首页</Button>]}
        />
      </DemoBlock>

      <DemoBlock title="失败" code={`<Result status="error" title="提交失败" />`}>
        <Result status="error" title="提交失败" subTitle="网络异常, 请稍后重试" />
      </DemoBlock>

      <DemoBlock title="404" code={`<Result status="404" />`}>
        <Result status="404" subTitle="抱歉, 你访问的页面不存在" extra={<Button type="primary">返回首页</Button>} />
      </DemoBlock>

      <DemoBlock title="403" code={`<Result status="403" />`}>
        <Result status="403" subTitle="抱歉, 你没有权限访问此页面" />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'status', desc: '状态', type: `'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500'`, default: `'info'` },
          { prop: 'title', desc: '标题', type: 'ReactNode', default: '按 status 自动' },
          { prop: 'subTitle', desc: '副标题', type: 'ReactNode', default: '-' },
          { prop: 'icon', desc: '自定义图标 (覆盖默认)', type: 'ReactNode', default: '-' },
          { prop: 'extra', desc: '操作区', type: 'ReactNode', default: '-' },
          { prop: 'children', desc: '内容区 (默认置于 extra 上方)', type: 'ReactNode', default: '-' },
        ]}
      />
    </>
  );
};

export default ResultDoc;
