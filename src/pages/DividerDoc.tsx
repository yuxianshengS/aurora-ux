import React from 'react';
import { Divider } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const DividerDoc: React.FC = () => {
  return (
    <>
      <h1>Divider 分割线</h1>
      <p>用于分割不同内容块的视觉分隔线。支持水平 / 垂直方向、带文字标题、实线 / 虚线。</p>

      <h2>代码演示</h2>

      <DemoBlock
        title="水平分割线"
        description="默认水平,用于段落之间。"
        code={`<p>第一段文字</p>
<Divider />
<p>第二段文字</p>`}
      >
        <div>
          <p style={{ margin: 0 }}>第一段文字</p>
          <Divider />
          <p style={{ margin: 0 }}>第二段文字</p>
        </div>
      </DemoBlock>

      <DemoBlock
        title="带文字"
        description="内嵌标题; orientation 控制对齐 (left / center / right)。"
        code={`<Divider>Center</Divider>
<Divider orientation="left">Left</Divider>
<Divider orientation="right">Right</Divider>`}
      >
        <div>
          <Divider>Center</Divider>
          <Divider orientation="left">Left</Divider>
          <Divider orientation="right">Right</Divider>
        </div>
      </DemoBlock>

      <DemoBlock
        title="plain 样式"
        description="plain 让文字更细更低调,不那么像小标题。"
        code={`<Divider plain>更新日志</Divider>`}
      >
        <div>
          <Divider plain>更新日志</Divider>
        </div>
      </DemoBlock>

      <DemoBlock
        title="虚线"
        description="dashed 切换为虚线。"
        code={`<Divider dashed />
<Divider dashed orientation="left">分组</Divider>`}
      >
        <div>
          <Divider dashed />
          <Divider dashed orientation="left">分组</Divider>
        </div>
      </DemoBlock>

      <DemoBlock
        title="垂直分割线"
        description="type='vertical' 用于行内分隔。"
        code={`<a>查看</a>
<Divider type="vertical" />
<a>编辑</a>
<Divider type="vertical" />
<a>删除</a>`}
      >
        <div style={{ fontSize: 14 }}>
          <a href="#" onClick={(e) => e.preventDefault()}>查看</a>
          <Divider type="vertical" />
          <a href="#" onClick={(e) => e.preventDefault()}>编辑</a>
          <Divider type="vertical" />
          <a href="#" onClick={(e) => e.preventDefault()}>删除</a>
        </div>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'type', desc: '方向', type: `'horizontal' | 'vertical'`, default: `'horizontal'` },
          { prop: 'orientation', desc: '文字对齐 (仅水平)', type: `'left' | 'center' | 'right'`, default: `'center'` },
          { prop: 'orientationMargin', desc: '文字距边距 (left/right 时生效)', type: 'number | string', default: '-' },
          { prop: 'dashed', desc: '虚线', type: 'boolean', default: 'false' },
          { prop: 'plain', desc: '弱化标题样式', type: 'boolean', default: 'false' },
          { prop: 'children', desc: '文字内容 (仅水平)', type: 'ReactNode', default: '-' },
        ]}
      />
    </>
  );
};

export default DividerDoc;
