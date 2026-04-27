import React from 'react';
import { Tree } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const sampleTree = [
  { key: '1', title: '根目录', children: [
    { key: '1-1', title: '文档', children: [
      { key: '1-1-1', title: '产品规划.md' },
      { key: '1-1-2', title: '会议纪要.md' },
    ]},
    { key: '1-2', title: '资源' },
  ]},
  { key: '2', title: '设置' },
];

const TreeDoc: React.FC = () => {
  return (
    <>
      <h1>Tree 树形控件</h1>
      <p>展示分类 / 文件夹 / 组织架构等层级数据。支持单选 / 多选 / 复选框 / 连接线。</p>

      <h2>代码演示</h2>

      <DemoBlock title="基础" code={`<Tree treeData={tree} defaultExpandedKeys={['1']} />`}>
        <Tree treeData={sampleTree} defaultExpandedKeys={['1', '1-1']} />
      </DemoBlock>

      <DemoBlock title="复选框" code={`<Tree checkable treeData={...} />`}>
        <Tree treeData={sampleTree} checkable defaultExpandAll defaultCheckedKeys={['1-1-1']} />
      </DemoBlock>

      <DemoBlock title="连接线" code={`<Tree showLine treeData={...} />`}>
        <Tree treeData={sampleTree} defaultExpandAll showLine />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'treeData', desc: '节点数据', type: 'TreeNode[]', default: '[]' },
          { prop: 'defaultExpandedKeys / expandedKeys', desc: '展开 keys', type: 'string[]', default: '-' },
          { prop: 'defaultExpandAll', desc: '默认全展开', type: 'boolean', default: 'false' },
          { prop: 'defaultSelectedKeys / selectedKeys', desc: '选中 keys', type: 'string[]', default: '-' },
          { prop: 'multiple', desc: '多选', type: 'boolean', default: 'false' },
          { prop: 'checkable', desc: '复选框', type: 'boolean', default: 'false' },
          { prop: 'defaultCheckedKeys / checkedKeys', desc: '勾选 keys', type: 'string[]', default: '-' },
          { prop: 'showLine', desc: '连接线', type: 'boolean', default: 'false' },
          { prop: 'blockNode', desc: '整行可点', type: 'boolean', default: 'false' },
          { prop: 'onSelect / onCheck / onExpand', desc: '事件回调', type: '(keys, info) => void', default: '-' },
        ]}
      />

      <h3>TreeNode 结构</h3>
      <ApiTable
        rows={[
          { prop: 'key', desc: '唯一键', type: 'string', default: '-' },
          { prop: 'title', desc: '显示标题', type: 'ReactNode', default: '-' },
          { prop: 'children', desc: '子节点', type: 'TreeNode[]', default: '-' },
          { prop: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
          { prop: 'icon', desc: '前置图标', type: 'ReactNode', default: '-' },
        ]}
      />
    </>
  );
};

export default TreeDoc;
