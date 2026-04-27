import React, { useState } from 'react';
import { TreeSelect } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const sampleTree = [
  { key: 'parent', title: '父节点', children: [
    { key: 'a', title: '选项 A' },
    { key: 'b', title: '选项 B' },
  ]},
  { key: 'c', title: '选项 C' },
];

const TreeSelectDoc: React.FC = () => {
  const [v, setV] = useState<string>('');
  return (
    <>
      <h1>TreeSelect 树形选择器</h1>
      <p>把 Tree 装进 Select 的下拉里 —— 表单需要选层级数据时用。</p>

      <h2>代码演示</h2>

      <DemoBlock title="基础" code={`<TreeSelect treeData={...} treeDefaultExpandAll />`}>
        <TreeSelect
          treeData={sampleTree}
          treeDefaultExpandAll
          allowClear
          value={v}
          onChange={setV}
        />
      </DemoBlock>

      <DemoBlock title="禁用" code={`<TreeSelect disabled treeData={...} />`}>
        <TreeSelect treeData={sampleTree} disabled placeholder="已禁用" />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'treeData', desc: '树数据', type: 'TreeNode[]', default: '[]' },
          { prop: 'value / defaultValue', desc: '受控/默认值 (key)', type: 'string', default: '-' },
          { prop: 'placeholder', desc: '占位', type: 'string', default: `'请选择'` },
          { prop: 'treeDefaultExpandAll', desc: '默认展开全部', type: 'boolean', default: 'false' },
          { prop: 'allowClear', desc: '可清除', type: 'boolean', default: 'false' },
          { prop: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
          { prop: 'popupWidth', desc: '弹层宽度', type: 'number | string', default: '触发器宽度' },
          { prop: 'onChange', desc: '选中回调', type: '(value, label?) => void', default: '-' },
        ]}
      />
    </>
  );
};

export default TreeSelectDoc;
