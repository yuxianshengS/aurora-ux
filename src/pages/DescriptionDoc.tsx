import React from 'react';
import { Description, Button } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const items = [
  { label: '用户名', value: '余星辰' },
  { label: '账号', value: 'yuxianshengs' },
  { label: '邮箱', value: 'yu@example.com' },
  { label: '城市', value: '北京' },
  { label: '电话', value: '138 0000 0000' },
  { label: '注册时间', value: '2026-01-12' },
];

const DescriptionDoc: React.FC = () => {
  return (
    <>
      <h1>Description 描述列表</h1>
      <p>详情页 Label/Value 网格。表单提交后展示数据,或用户/订单详情常用。</p>

      <h2>代码演示</h2>

      <DemoBlock title="基础" code={`<Description items={items} />`}>
        <Description title="用户信息" items={items} />
      </DemoBlock>

      <DemoBlock title="带边框" code={`<Description bordered items={items} />`}>
        <Description title="用户信息" bordered items={items} extra={<Button size="small">编辑</Button>} />
      </DemoBlock>

      <DemoBlock title="纵向布局" code={`<Description layout="vertical" />`}>
        <Description layout="vertical" title="用户信息" items={items} />
      </DemoBlock>

      <DemoBlock title="跨列 span" code={`{ label: '简介', value: '...', span: 3 }`}>
        <Description
          column={3}
          bordered
          items={[
            ...items,
            { label: '简介', value: '一行文本占满整行, 适合长描述', span: 3 },
          ]}
        />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'title', desc: '标题', type: 'ReactNode', default: '-' },
          { prop: 'extra', desc: '右上角操作', type: 'ReactNode', default: '-' },
          { prop: 'items', desc: '描述项数组', type: 'DescriptionItem[]', default: '-' },
          { prop: 'column', desc: '列数', type: 'number', default: '3' },
          { prop: 'layout', desc: '布局', type: `'horizontal' | 'vertical'`, default: `'horizontal'` },
          { prop: 'size', desc: '尺寸', type: `'small' | 'default' | 'large'`, default: `'default'` },
          { prop: 'bordered', desc: '边框', type: 'boolean', default: 'false' },
          { prop: 'labelWidth', desc: 'label 列宽 (horizontal)', type: 'number | string', default: '-' },
          { prop: 'colon', desc: 'label 后冒号', type: 'boolean', default: 'false' },
        ]}
      />
    </>
  );
};

export default DescriptionDoc;
