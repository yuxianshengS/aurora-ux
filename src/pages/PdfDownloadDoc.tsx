import React, { useRef, useState } from 'react';
import { PdfDownload } from '../components';
import type { PdfOrientation, PdfFormat } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';
import Playground from '../site-components/Playground';

const SampleDoc: React.FC<{ title?: string }> = ({ title = '示例报表' }) => (
  <div
    style={{
      padding: 32,
      background: '#fff',
      color: '#222',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      lineHeight: 1.6,
    }}
  >
    <h2 style={{ margin: '0 0 8px', fontSize: 24 }}>{title}</h2>
    <p style={{ color: '#666', margin: '0 0 20px' }}>
      报告生成时间 2026-04-21 · 数据来源 Aurora Analytics
    </p>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        marginBottom: 20,
      }}
    >
      {[
        { label: '访问总数', val: '128,430' },
        { label: '转化率', val: '4.62%' },
        { label: '客单价', val: '¥ 312.80' },
      ].map((i) => (
        <div
          key={i.label}
          style={{
            padding: 16,
            background: '#f7f8fa',
            borderRadius: 8,
          }}
        >
          <div style={{ fontSize: 13, color: '#999' }}>{i.label}</div>
          <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}>
            {i.val}
          </div>
        </div>
      ))}
    </div>
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 13,
      }}
    >
      <thead>
        <tr style={{ background: '#f7f8fa' }}>
          <th style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid #eee' }}>日期</th>
          <th style={{ padding: 10, textAlign: 'right', borderBottom: '1px solid #eee' }}>UV</th>
          <th style={{ padding: 10, textAlign: 'right', borderBottom: '1px solid #eee' }}>订单</th>
          <th style={{ padding: 10, textAlign: 'right', borderBottom: '1px solid #eee' }}>GMV</th>
        </tr>
      </thead>
      <tbody>
        {[
          ['2026-04-15', '18,302', '812', '¥ 253,944'],
          ['2026-04-16', '19,118', '849', '¥ 265,603'],
          ['2026-04-17', '21,480', '962', '¥ 300,905'],
          ['2026-04-18', '22,057', '991', '¥ 310,063'],
          ['2026-04-19', '20,713', '930', '¥ 290,904'],
        ].map(([d, uv, o, g]) => (
          <tr key={d}>
            <td style={{ padding: 10, borderBottom: '1px solid #f0f0f0' }}>{d}</td>
            <td style={{ padding: 10, textAlign: 'right', borderBottom: '1px solid #f0f0f0' }}>{uv}</td>
            <td style={{ padding: 10, textAlign: 'right', borderBottom: '1px solid #f0f0f0' }}>{o}</td>
            <td style={{ padding: 10, textAlign: 'right', borderBottom: '1px solid #f0f0f0' }}>{g}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const PdfDownloadDoc: React.FC = () => {
  return (
    <>
      <h1>PdfDownload 页面下载</h1>
      <p>
        把指定 DOM 区域截图并打包成 PDF 下载。纯前端实现, 基于 <code>html2canvas</code> + <code>jsPDF</code>。
        内容超出一页会自动分页。
      </p>
      <p style={{ color: 'var(--au-text-3)', fontSize: 13 }}>
        ⚠️ 由于采用栅格化方案, 导出的 PDF 文字不可选中/搜索。如需保留文字语义, 需要后端方案 (puppeteer / playwright)。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="把要导出的内容放进一个 ref 容器, 传给 targetRef 即可。"
        code={`const ref = useRef<HTMLDivElement>(null);

<div ref={ref}>
  <h2>我的报表</h2>
  ...
</div>
<PdfDownload targetRef={ref} filename="report.pdf" />`}
      >
        <BasicDemo />
      </DemoBlock>

      <DemoBlock
        title="横向 A4 + 自定义文件名"
        description="orientation='landscape' 横板导出, 适合宽表格或看板。"
        code={`<PdfDownload
  targetRef={ref}
  filename="dashboard-2026Q2.pdf"
  orientation="landscape"
  format="a4"
/>`}
      >
        <LandscapeDemo />
      </DemoBlock>

      <DemoBlock
        title="长内容自动多页"
        description="当内容高度超过一页时, 会自动按页切分成多页 PDF。"
        code={`<div ref={ref}>{/* 很长的内容 */}</div>
<PdfDownload targetRef={ref} filename="long-doc.pdf" margin={24} />`}
      >
        <LongContentDemo />
      </DemoBlock>

      <DemoBlock
        title="自定义触发器"
        description="传 children 替换默认按钮, 可以用任意 UI 作为触发源。"
        code={`<PdfDownload targetRef={ref} filename="a.pdf">
  <a className="au-link">点这里导出 PDF →</a>
</PdfDownload>`}
      >
        <CustomTriggerDemo />
      </DemoBlock>

      <DemoBlock
        title="状态回调"
        description="onBefore / onDone / onError 配合 toast/loading 使用。"
        code={`<PdfDownload
  targetRef={ref}
  onBefore={() => setMsg('生成中...')}
  onDone={(blob) => setMsg(\`完成: \${(blob.size / 1024).toFixed(1)} KB\`)}
  onError={(e) => setMsg('失败: ' + e)}
/>`}
      >
        <CallbackDemo />
      </DemoBlock>

      <h2>交互式调试</h2>
      <Playground
        title="实时调整 PdfDownload 属性"
        description="修改参数后, 点下方按钮导出, 查看不同配置的效果。"
        componentName="PdfDownload"
        component={PlaygroundWrapper}
        controls={[
          { name: 'filename', type: 'text', default: 'playground.pdf' },
          {
            name: 'orientation',
            type: 'select',
            options: ['portrait', 'landscape'],
            default: 'portrait',
          },
          {
            name: 'format',
            type: 'select',
            options: ['a4', 'a3', 'letter'],
            default: 'a4',
          },
          {
            name: 'scale',
            type: 'select',
            options: ['1', '2', '3'],
            default: '2',
          },
          { name: 'margin', type: 'text', default: '0' },
          { name: 'buttonText', type: 'text', default: '下载 PDF' },
        ]}
      />

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'targetRef', desc: '要导出的 DOM 容器 ref', type: 'RefObject<HTMLElement>', default: '-' },
          { prop: 'filename', desc: '下载时的文件名', type: 'string', default: `'document.pdf'` },
          { prop: 'orientation', desc: '页面方向', type: `'portrait' | 'landscape'`, default: `'portrait'` },
          { prop: 'format', desc: '纸张规格', type: `'a4' | 'a3' | 'letter'`, default: `'a4'` },
          { prop: 'scale', desc: '渲染倍率, 越大越清晰文件越大', type: 'number', default: '2' },
          { prop: 'margin', desc: '页面四周留白 (pt)', type: 'number', default: '0' },
          { prop: 'buttonText', desc: '默认按钮文本', type: 'ReactNode', default: `'下载 PDF'` },
          { prop: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
          { prop: 'onBefore', desc: '开始导出前触发', type: '() => void', default: '-' },
          { prop: 'onDone', desc: '导出成功后触发, 传回 Blob', type: '(blob: Blob) => void', default: '-' },
          { prop: 'onError', desc: '导出失败时触发', type: '(err: unknown) => void', default: '-' },
          { prop: 'children', desc: '自定义触发器, 传入则替换默认按钮', type: 'ReactNode', default: '-' },
        ]}
      />

      <h3>已知限制</h3>
      <ul>
        <li>
          导出的 PDF 文字是栅格化图片, <b>不可选中/搜索/复制</b>。
          如需可检索 PDF, 请用 puppeteer / playwright 等后端方案。
        </li>
        <li>
          <code>html2canvas</code> 不支持 <code>oklch()</code>, <code>lab()</code> 等新颜色函数;
          若主题使用了这些色值, 请改用 <code>html2canvas-pro</code>。
        </li>
        <li>
          外链图片必须允许跨域 (CORS) 才能被正确截图。
        </li>
        <li>
          目标容器内不要使用 <code>position: fixed</code> 或超出视口的元素, 否则可能截不全。
        </li>
      </ul>
    </>
  );
};

/* -------------------------- demos -------------------------- */

const BasicDemo: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div>
      <div
        ref={ref}
        style={{
          border: '1px solid var(--au-border)',
          borderRadius: 8,
          overflow: 'hidden',
          marginBottom: 12,
        }}
      >
        <SampleDoc />
      </div>
      <PdfDownload targetRef={ref} filename="report.pdf" />
    </div>
  );
};

const LandscapeDemo: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div>
      <div
        ref={ref}
        style={{
          border: '1px solid var(--au-border)',
          borderRadius: 8,
          overflow: 'hidden',
          marginBottom: 12,
        }}
      >
        <SampleDoc title="季度看板 (横向)" />
      </div>
      <PdfDownload
        targetRef={ref}
        filename="dashboard-2026Q2.pdf"
        orientation="landscape"
      />
    </div>
  );
};

const LongContentDemo: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div>
      <div
        ref={ref}
        style={{
          border: '1px solid var(--au-border)',
          borderRadius: 8,
          overflow: 'hidden',
          marginBottom: 12,
          background: '#fff',
        }}
      >
        {[1, 2, 3].map((i) => (
          <SampleDoc key={i} title={`分页 ${i}`} />
        ))}
      </div>
      <PdfDownload targetRef={ref} filename="long-doc.pdf" margin={24} />
    </div>
  );
};

const CustomTriggerDemo: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div>
      <div
        ref={ref}
        style={{
          border: '1px solid var(--au-border)',
          borderRadius: 8,
          overflow: 'hidden',
          marginBottom: 12,
        }}
      >
        <SampleDoc />
      </div>
      <PdfDownload targetRef={ref} filename="custom.pdf">
        <a
          style={{
            color: 'var(--au-primary)',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          点这里导出 PDF →
        </a>
      </PdfDownload>
    </div>
  );
};

const CallbackDemo: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [msg, setMsg] = useState('尚未导出');
  return (
    <div>
      <div
        ref={ref}
        style={{
          border: '1px solid var(--au-border)',
          borderRadius: 8,
          overflow: 'hidden',
          marginBottom: 12,
        }}
      >
        <SampleDoc />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <PdfDownload
          targetRef={ref}
          filename="cb.pdf"
          onBefore={() => setMsg('生成中...')}
          onDone={(blob) =>
            setMsg(`导出成功: ${(blob.size / 1024).toFixed(1)} KB`)
          }
          onError={(e) => setMsg('导出失败: ' + String(e))}
        />
        <span style={{ color: 'var(--au-text-2)', fontSize: 13 }}>{msg}</span>
      </div>
    </div>
  );
};

/* ------------------- playground wrapper ------------------- */

interface WrapperProps {
  filename?: string;
  orientation?: string;
  format?: string;
  scale?: string;
  margin?: string;
  buttonText?: string;
}

const PlaygroundWrapper: React.FC<WrapperProps> = ({
  filename,
  orientation,
  format,
  scale,
  margin,
  buttonText,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const s = Number(scale);
  const m = Number(margin);
  return (
    <div>
      <div
        ref={ref}
        style={{
          border: '1px solid var(--au-border)',
          borderRadius: 8,
          overflow: 'hidden',
          marginBottom: 12,
        }}
      >
        <SampleDoc />
      </div>
      <PdfDownload
        targetRef={ref}
        filename={filename || 'playground.pdf'}
        orientation={(orientation as PdfOrientation) || 'portrait'}
        format={(format as PdfFormat) || 'a4'}
        scale={Number.isFinite(s) && s > 0 ? s : 2}
        margin={Number.isFinite(m) && m >= 0 ? m : 0}
        buttonText={buttonText || '下载 PDF'}
      />
    </div>
  );
};

export default PdfDownloadDoc;
