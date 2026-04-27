import React from 'react';
import { Progress } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const ProgressDoc: React.FC = () => {
  return (
    <>
      <h1>Progress 进度条</h1>
      <p>展示当前任务的进度。三种类型: line / circle / dashboard。</p>

      <h2>代码演示</h2>

      <DemoBlock title="线性进度" code={`<Progress percent={60} />`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 480 }}>
          <Progress percent={30} />
          <Progress percent={60} status="active" />
          <Progress percent={100} />
          <Progress percent={50} status="exception" />
        </div>
      </DemoBlock>

      <DemoBlock title="圆形进度" code={`<Progress type="circle" percent={75} />`}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Progress type="circle" percent={30} />
          <Progress type="circle" percent={75} />
          <Progress type="circle" percent={100} />
          <Progress type="circle" percent={50} status="exception" />
        </div>
      </DemoBlock>

      <DemoBlock title="仪表盘" code={`<Progress type="dashboard" percent={75} />`}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Progress type="dashboard" percent={30} />
          <Progress type="dashboard" percent={75} />
          <Progress type="dashboard" percent={100} />
        </div>
      </DemoBlock>

      <DemoBlock title="自定义颜色" code={`<Progress strokeColor={['#a855f7', '#3b82f6']} percent={70} />`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 480 }}>
          <Progress percent={70} strokeColor="#a855f7" />
          <Progress percent={70} strokeColor={['#a855f7', '#3b82f6']} />
        </div>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'percent', desc: '0-100', type: 'number', default: '0' },
          { prop: 'type', desc: '类型', type: `'line' | 'circle' | 'dashboard'`, default: `'line'` },
          { prop: 'status', desc: '状态', type: `'normal' | 'active' | 'success' | 'exception'`, default: `'normal'` },
          { prop: 'size', desc: '线粗 (line)', type: `'small' | 'default' | 'large'`, default: `'default'` },
          { prop: 'strokeColor', desc: '颜色 / 渐变 [from, to]', type: 'string | [string, string]', default: '-' },
          { prop: 'width', desc: '直径 (circle/dashboard)', type: 'number', default: '120' },
          { prop: 'strokeWidth', desc: '环线宽度', type: 'number', default: '6' },
          { prop: 'showInfo', desc: '显示百分比文字', type: 'boolean', default: 'true' },
          { prop: 'format', desc: '自定义文案', type: '(percent) => ReactNode', default: '-' },
        ]}
      />
    </>
  );
};

export default ProgressDoc;
