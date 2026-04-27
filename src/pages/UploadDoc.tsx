import React from 'react';
import { Upload } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const UploadDoc: React.FC = () => {
  return (
    <>
      <h1>Upload 文件上传</h1>
      <p>选择本地文件或拖拽上传。支持单/多文件、图片预览、卡片网格、拖放区四种形态。</p>

      <h2>代码演示</h2>

      <DemoBlock title="基础(文字列表)" code={`<Upload listType="text" />`}>
        <Upload listType="text" />
      </DemoBlock>

      <DemoBlock title="多文件 + 大小限制" code={`<Upload multiple maxSize={2048} />`}>
        <Upload multiple maxSize={2048} accept="image/*" />
      </DemoBlock>

      <DemoBlock title="拖拽上传" code={`<Upload listType="drag" />`}>
        <Upload listType="drag" multiple />
      </DemoBlock>

      <DemoBlock title="图片卡片" code={`<Upload listType="card" accept="image/*" />`}>
        <Upload listType="card" multiple accept="image/*" />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'listType', desc: '展示形态', type: `'text' | 'picture' | 'card' | 'drag'`, default: `'text'` },
          { prop: 'accept', desc: '接受类型 (同 input accept)', type: 'string', default: '-' },
          { prop: 'multiple', desc: '多选', type: 'boolean', default: 'false' },
          { prop: 'maxSize', desc: '单文件大小限制 (KB)', type: 'number', default: '-' },
          { prop: 'fileList / defaultFileList', desc: '受控/初始文件列表', type: 'UploadFile[]', default: '-' },
          { prop: 'beforeUpload', desc: '上传前钩子, return false 拒绝', type: '(file, list) => bool | Promise', default: '-' },
          { prop: 'onChange', desc: '列表变更', type: '(info) => void', default: '-' },
          { prop: 'onRemove', desc: '移除前钩子', type: '(file) => bool | Promise | void', default: '-' },
          { prop: 'showFileList', desc: '显示文件列表', type: 'boolean', default: 'true' },
          { prop: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
        ]}
      />
    </>
  );
};

export default UploadDoc;
