import React from 'react';
import { Empty } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const EmptyDoc: React.FC = () => {
  return (
    <>
      <h1>Empty 空状态</h1>
      <p>
        列表、表格、搜索结果为空时的占位组件。内置插画,可替换为自定义图片或图标,
        支持描述文字与底部操作区。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="默认显示内置空数据插画 + 文字。"
        code={`<Empty />`}
      >
        <Empty />
      </DemoBlock>

      <DemoBlock
        title="自定义描述"
        description="传入 description; false 隐藏。"
        code={`<Empty description="没有找到匹配的记录" />
<Empty description={false} />`}
      >
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <Empty description="没有找到匹配的记录" />
          <Empty description={false} />
        </div>
      </DemoBlock>

      <DemoBlock
        title="带操作按钮"
        description={`children 放在底部, 常用于 "创建一个" 场景。`}
        code={`<Empty description="还没有任何项目">
  <Button type="primary">新建项目</Button>
  <Button>查看模板</Button>
</Empty>`}
      >
        <Empty description="还没有任何项目">
          <button className="au-btn au-btn--primary au-btn--medium">新建项目</button>
          <button className="au-btn au-btn--default au-btn--medium">查看模板</button>
        </Empty>
      </DemoBlock>

      <DemoBlock
        title="自定义图片"
        description="image 传 URL 或任意 ReactNode。"
        code={`<Empty image={<span style={{ fontSize: 60 }}>📭</span>} description="收件箱为空" />
<Empty image={<span style={{ fontSize: 60 }}>🔍</span>} description="没有搜索结果" />`}
      >
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <Empty
            image={<span style={{ fontSize: 60 }}>📭</span>}
            description="收件箱为空"
          />
          <Empty
            image={<span style={{ fontSize: 60 }}>🔍</span>}
            description="没有搜索结果"
          />
        </div>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'image', desc: '图片 URL 或自定义节点', type: 'string | ReactNode', default: '内置插画' },
          { prop: 'imageStyle', desc: '图片容器样式', type: 'CSSProperties', default: '-' },
          { prop: 'description', desc: '描述文字; false 隐藏', type: 'ReactNode | false', default: `'暂无数据'` },
          { prop: 'children', desc: '底部内容 (操作按钮等)', type: 'ReactNode', default: '-' },
        ]}
      />
    </>
  );
};

export default EmptyDoc;
