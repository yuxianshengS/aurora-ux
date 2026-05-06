import React from 'react';
import { Upload } from '../components';
import type { UploadChunkContext } from '../components/Upload/Upload';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

/** Demo: 模拟一个可能偶发失败的分片接口, 用于展示进度 / 重试 / 暂停恢复 */
const mockChunkRequest = (ctx: UploadChunkContext): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    let elapsed = 0;
    // 总耗时 600~1400ms 之间随机, 期间发 5 次进度
    const total = 600 + Math.random() * 800;
    const tick = total / 5;
    const timer = window.setInterval(() => {
      elapsed += tick;
      if (ctx.signal.aborted) {
        clearInterval(timer);
        reject(new DOMException('aborted', 'AbortError'));
        return;
      }
      const ratio = Math.min(1, elapsed / total);
      ctx.onProgress(Math.round(ratio * ctx.chunk.size));
      if (ratio >= 1) {
        clearInterval(timer);
        // ~12% 概率失败, 让用户看到自动重试
        if (Math.random() < 0.12) reject(new Error('network jitter'));
        else resolve();
      }
    }, tick);
    ctx.signal.addEventListener('abort', () => {
      clearInterval(timer);
      reject(new DOMException('aborted', 'AbortError'));
    });
  });

const mockMerge = (): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve, 300));

const UploadDoc: React.FC = () => {
  return (
    <>
      <h1>Upload 文件上传</h1>
      <p>选择本地文件或拖拽上传。支持单/多文件、图片预览、卡片网格、拖放区四种形态。开启 <code>chunkSize</code> 即获得分片上传 + 并发 + 暂停恢复 + 自动重试。</p>

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

      <DemoBlock
        title="分片上传 (chunked)"
        code={`// 1MB 一片, 并发 3, 单片失败重试 2 次, 全部成功后调 mergeRequest
<Upload
  listType="drag"
  multiple
  chunkSize={1024 * 1024}
  chunkConcurrency={3}
  chunkRetry={2}
  customRequest={async (ctx) => {
    // 用 fetch / xhr / axios 把 ctx.chunk POST 到服务端,
    // 把 ctx.fileUid / ctx.chunkIndex / ctx.totalChunks 一起带过去做归并 key.
    // 务必把 ctx.signal 传给请求 (暂停 / 卸载会 abort).
    // 上传过程中调 ctx.onProgress(loaded) 报告本片字节进度.
    const fd = new FormData();
    fd.append('chunk', ctx.chunk);
    fd.append('uid', ctx.fileUid);
    fd.append('index', String(ctx.chunkIndex));
    fd.append('total', String(ctx.totalChunks));
    await fetch('/api/upload/chunk', { method: 'POST', body: fd, signal: ctx.signal });
  }}
  mergeRequest={async (ctx) => {
    await fetch('/api/upload/merge', {
      method: 'POST',
      body: JSON.stringify({ uid: ctx.fileUid, total: ctx.totalChunks, name: ctx.file.name }),
      signal: ctx.signal,
    });
  }}
/>`}
      >
        <Upload
          listType="drag"
          multiple
          chunkSize={1024 * 1024}
          chunkConcurrency={3}
          chunkRetry={2}
          customRequest={mockChunkRequest}
          mergeRequest={mockMerge}
        />
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
          { prop: 'customRequest', desc: '上传单片 / 单文件的实现 (传了才真上传, 否则只在本地建列表)', type: '(ctx: UploadChunkContext) => Promise<void>', default: '-' },
          { prop: 'mergeRequest', desc: '所有分片成功后通知服务端合并', type: '(ctx: UploadMergeContext) => Promise<void>', default: '-' },
          { prop: 'chunkSize', desc: '开启分片 — 每片字节数 (不传 = 整文件一次性上传)', type: 'number', default: '-' },
          { prop: 'chunkConcurrency', desc: '同时并发上传几片', type: 'number', default: '3' },
          { prop: 'chunkRetry', desc: '单片失败自动重试次数 (用尽后整个文件标错可手动重试)', type: 'number', default: '2' },
        ]}
      />
    </>
  );
};

export default UploadDoc;
