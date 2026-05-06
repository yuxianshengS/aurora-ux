import React, { useRef, useState } from 'react';
import { PdfDownload } from '../components';
import type { PdfOrientation, PdfFormat, PdfDownloadHandle } from '../components';
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
        title="异步数据 — 等接口返回再导出"
        description="实际业务里数据通常通过 fetch 拿到再渲染, 直接点导出会抓到空骨架。两种解法 (按需选): (1) beforeRender 钩子在导出前 await 数据准备 — 简单场景用; (2) 命令式 export() 通过 ref 触发 — 你完全控制 fetch / setState / 等 commit / 导出顺序, 精确度更高。组件本身还会自动等 document.fonts.ready / 所有 <img> 加载完 / 双 rAF 重绘。"
        code={`// 方式 1: beforeRender (简单场景)
<PdfDownload
  targetRef={ref}
  beforeRender={async () => {
    if (!data) {
      const fresh = await fetchReport();
      setData(fresh);
    }
  }}
/>

// 方式 2: 命令式 ref (复杂场景, 全自动流程)
const pdfRef = useRef<PdfDownloadHandle>(null);
async function autoExport() {
  setLoading(true);
  const data = await fetchReport();
  setReportData(data);
  // 等 React commit + 内置 rAF 等待
  const blob = await pdfRef.current?.export();
  setLoading(false);
}
<PdfDownload ref={pdfRef} targetRef={ref} preview />`}
      >
        <AsyncDemo />
      </DemoBlock>

      <DemoBlock
        title="复杂业务报表压力测试"
        description="3 卷季度报告拼起来 (~15-18 页 A4), 含 hero / KPI 卡 / 多段文字 / 14+25 行长表 / 6 块地区卡 / 漏斗 / 双栏图表 / 附录大段文字。用来同时验证 (1) 内容感知分页 — 切点应落在卡片间 / 表格行间 / 段落间的空白带, 不会劈表格行; (2) html2canvas / canvas 维度上限 — Chromium ~19 页 / Safari ~9 页之后会触顶, 是浏览器物理限制, 不是组件 bug。"
        code={`<div ref={ref}>
  {Array.from({ length: 30 }).map((_, i) =>
    <SampleDoc key={i} title={\`分页 \${i + 1}\`} />)}
</div>
<PdfDownload targetRef={ref} filename="extreme.pdf" preview margin={24} />`}
      >
        <ExtremeDemo />
      </DemoBlock>

      <DemoBlock
        title="下载前预览"
        description="加 preview 后, 点击不直接落盘, 先弹一个内置 PDF 查看器: 翻页 / 缩放 / 缩略图侧栏 / 当前页指示, 确认无误再点「下载」。预览展示的就是真实将要导出的页面位图, 所见即所得。"
        code={`<PdfDownload
  targetRef={ref}
  filename="report.pdf"
  preview
/>`}
      >
        <PreviewDemo />
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
          { prop: 'preview', desc: '点击后弹内置 PDF 查看器, 用户确认再下载', type: 'boolean', default: 'false' },
          { prop: 'beforeRender', desc: '导出前 await 的异步钩子 — 用来等接口数据 / 图表渲染', type: '() => Promise<void> | void', default: '-' },
          { prop: 'waitImagesTimeout', desc: '内置等待 <img> 加载的兜底超时 (ms)', type: 'number', default: '5000' },
          { prop: 'onBefore', desc: '开始导出前触发 (在 beforeRender / 资源等待之前)', type: '() => void', default: '-' },
          { prop: 'onDone', desc: '导出成功后触发, 传回 Blob', type: '(blob: Blob) => void', default: '-' },
          { prop: 'onError', desc: '导出失败时触发', type: '(err: unknown) => void', default: '-' },
          { prop: 'children', desc: '自定义触发器, 传入则替换默认按钮', type: 'ReactNode', default: '-' },
        ]}
      />

      <h3>命令式 API (PdfDownloadHandle)</h3>
      <ApiTable
        rows={[
          {
            prop: 'export()',
            desc: '程序化触发导出, 跑完整流程 (beforeRender → 字体/图片/重绘等待 → 渲染 → 切页 → 保存或开预览)。preview 模式下会等用户在预览里确认/取消再 resolve。',
            type: '() => Promise<Blob | null>',
            default: '-',
          },
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
        <li>
          <b>targetRef 不能指向带 <code>overflow: auto/scroll</code> 且有 <code>max-height</code> 的滚动容器</b> —
          html2canvas 读的是元素的 <code>offsetHeight</code>, 滚动容器的高度只是视口高,
          会导致只截到可见区域。如果需要在页面上做滚动预览, 把 <code>targetRef</code> 挂在
          <b>内部完整高度的 div</b>, 外层滚动壳与导出无关。
        </li>
        <li>
          <b>超长内容存在 canvas 维度上限</b> — Chromium 单张 canvas 高度上限约
          <code>32767 px</code>, Safari 桌面 <code>16384 px</code>, iOS Safari <code>4096 px</code>。
          <code>scale=2</code> + A4 portrait 时 Chromium 大约 19 页、Safari 大约 9 页就会触顶,
          之后页面会被静默截断。需要导更长内容时, 降 <code>scale=1</code> 可大致翻倍能力,
          再长则需要把 DOM 拆成多个 <code>ref</code> 自己分批渲染再拼。
        </li>
        <li>
          整页位图同时驻留内存 — 30 页 A4 在 <code>scale=2</code> 下大约占 200 MB+ 浏览器内存,
          移动端 / 老机器可能 OOM 闪退。
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

/* ------------------------- 异步 demo ------------------------- */
interface AsyncReport {
  title: string;
  rows: { d: string; uv: number; orders: number; gmv: number }[];
  fetchedAt: string;
}

/** 模拟接口请求 — 1.2s 后返回数据 */
const fetchAsyncReport = (): Promise<AsyncReport> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        title: '异步报表 · 实时拉取',
        rows: Array.from({ length: 8 }).map((_, i) => ({
          d: `2026-04-${String(15 + i).padStart(2, '0')}`,
          uv: Math.round(15000 + Math.random() * 8000),
          orders: Math.round(600 + Math.random() * 400),
          gmv: Math.round(180000 + Math.random() * 100000),
        })),
        fetchedAt: new Date().toLocaleString('zh-CN'),
      });
    }, 1200);
  });

const AsyncDemo: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<PdfDownloadHandle>(null);
  const [data, setData] = useState<AsyncReport | null>(null);
  const [autoExporting, setAutoExporting] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const append = (s: string) =>
    setLog((p) => [...p, `${new Date().toLocaleTimeString()} · ${s}`]);

  // 方式 2: 全自动 — fetch + setState + 等 commit + export
  const autoExport = async () => {
    setAutoExporting(true);
    append('开始 fetch...');
    const fresh = await fetchAsyncReport();
    setData(fresh);
    append('数据到位, 等 React commit...');
    // React state 在下一次 commit 才落到 DOM, 等一下确保 ref 子树更新完
    await new Promise<void>((r) => setTimeout(r, 0));
    append('调 pdfRef.current.export()...');
    const blob = await pdfRef.current?.export();
    append(blob ? `导出成功 (${(blob.size / 1024).toFixed(1)} KB)` : '已取消 / 失败');
    setAutoExporting(false);
  };

  // 方式 1: beforeRender 钩子 — 用户点按钮, 组件内部确保数据就绪
  const beforeRender = async () => {
    if (!data) {
      append('beforeRender: 数据为空, 拉取...');
      const fresh = await fetchAsyncReport();
      setData(fresh);
      // setState 触发 re-render, 让组件内置的 waitForPaint 接力
    }
  };

  return (
    <div>
      <div
        ref={ref}
        style={{
          border: '1px solid var(--au-border)',
          borderRadius: 8,
          marginBottom: 12,
          background: '#fff',
          minHeight: 180,
          padding: 24,
          color: '#222',
        }}
      >
        {data ? (
          <>
            <h3 style={{ margin: '0 0 6px', color: '#0f172a' }}>{data.title}</h3>
            <p style={{ margin: '0 0 14px', color: '#94a3b8', fontSize: 12 }}>
              拉取于 {data.fetchedAt}
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#0f172a', color: '#fff' }}>
                  <th style={{ padding: 8, textAlign: 'left' }}>日期</th>
                  <th style={{ padding: 8, textAlign: 'right' }}>UV</th>
                  <th style={{ padding: 8, textAlign: 'right' }}>订单</th>
                  <th style={{ padding: 8, textAlign: 'right' }}>GMV</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r, i) => (
                  <tr
                    key={r.d}
                    style={{
                      background: i % 2 ? '#f8fafc' : '#fff',
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    <td style={{ padding: 8 }}>{r.d}</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>{r.uv.toLocaleString()}</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>{r.orders}</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>
                      ¥ {r.gmv.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>
            数据未加载 — 点下方任一按钮触发
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <PdfDownload
          ref={pdfRef}
          targetRef={ref}
          filename="async-report.pdf"
          preview
          margin={24}
          beforeRender={beforeRender}
          buttonText="方式 1: beforeRender"
        />
        <button
          type="button"
          onClick={autoExport}
          disabled={autoExporting}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: '1px solid var(--au-border-strong)',
            background: 'var(--au-bg)',
            cursor: autoExporting ? 'not-allowed' : 'pointer',
            opacity: autoExporting ? 0.6 : 1,
          }}
        >
          {autoExporting ? '执行中...' : '方式 2: 全自动 fetch + 命令式 export()'}
        </button>
        <button
          type="button"
          onClick={() => {
            setData(null);
            setLog([]);
          }}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: '1px solid var(--au-border)',
            background: 'transparent',
            color: 'var(--au-text-2)',
            cursor: 'pointer',
          }}
        >
          重置
        </button>
      </div>

      {log.length > 0 && (
        <pre
          style={{
            background: 'var(--au-bg-mute)',
            color: 'var(--au-text-2)',
            padding: 12,
            borderRadius: 6,
            fontSize: 12,
            margin: 0,
            maxHeight: 140,
            overflow: 'auto',
          }}
        >
          {log.join('\n')}
        </pre>
      )}
    </div>
  );
};

const ExtremeDemo: React.FC = () => {
  // 关键: targetRef 挂在内部完整高度的 div, 而非外层带 max-height/overflow 的滚动壳;
  // html2canvas 用元素的 offsetHeight (= 视口高度), 否则只能截到可见区。
  const innerRef = useRef<HTMLDivElement>(null);
  return (
    <div>
      <div
        style={{
          border: '1px solid var(--au-border)',
          borderRadius: 8,
          marginBottom: 12,
          background: '#fff',
          maxHeight: 480,
          overflowY: 'auto',
        }}
      >
        <div ref={innerRef}>
          {[1, 2, 3].map((i) => (
            <ComplexReport key={i} volume={i} />
          ))}
        </div>
      </div>
      <PdfDownload targetRef={innerRef} filename="extreme.pdf" preview margin={0} />
    </div>
  );
};

/* ======================== 复杂报表 demo ========================
   用来压力测试内容感知分页:
   - hero / KPI 卡 / 多段文字 / 14+25 行长表 / 6 块地区卡 / 漏斗 / 附录
   - 行高 / 卡片高度 / 段落分布交错, 切点会自然落在 "blocks 之间的空白带"
   - 全 inline style, 不依赖 aurora-ux 组件, 不依赖主题, html2canvas-friendly
   ============================================================== */
const ComplexReport: React.FC<{ volume?: number }> = ({ volume = 1 }) => {
  const accent = '#5b8def';
  const palette = ['#10b981', '#f59e0b', '#ef4444', '#5b8def', '#8b5cf6', '#06b6d4'];
  const dailyRows = Array.from({ length: 14 }).map((_, i) => {
    const day = String(i + 1).padStart(2, '0');
    return {
      d: `2026-03-${day}`,
      uv: 18000 + ((i * 877) % 4500),
      orders: 720 + ((i * 41) % 320),
      gmv: 240000 + ((i * 8129) % 75000),
      conv: (3.8 + ((i * 0.13) % 1.4)).toFixed(2),
    };
  });
  const skuRows = Array.from({ length: 25 }).map((_, i) => ({
    sku: `SKU-${String(2000 + i)}`,
    cat: ['服装', '数码', '美妆', '食品', '家居'][i % 5],
    price: (89.9 + ((i * 17.3) % 320)).toFixed(2),
    stock: 200 + ((i * 31) % 1500),
    sold: 42 + ((i * 19) % 380),
    rating: (4.2 + ((i * 0.07) % 0.7)).toFixed(1),
  }));
  const regions = [
    { name: '华东', uv: '38,210', share: '29.8%', leader: '上海 / 杭州' },
    { name: '华南', uv: '24,803', share: '19.3%', leader: '广州 / 深圳' },
    { name: '华北', uv: '22,140', share: '17.2%', leader: '北京 / 天津' },
    { name: '华中', uv: '14,690', share: '11.4%', leader: '武汉 / 长沙' },
    { name: '西南', uv: '13,420', share: '10.5%', leader: '成都 / 重庆' },
    { name: '其他', uv: '15,167', share: '11.8%', leader: '东北 / 西北' },
  ];
  const funnel = [
    { stage: '访问首页', n: 128430, ratio: 100 },
    { stage: '查看商品', n: 76230, ratio: 59.4 },
    { stage: '加入购物车', n: 24180, ratio: 18.8 },
    { stage: '下单', n: 9842, ratio: 7.7 },
    { stage: '完成支付', n: 6841, ratio: 5.3 },
  ];

  return (
    <div
      style={{
        padding: 48,
        background: '#fff',
        color: '#1f2937',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: 1.65,
        fontSize: 13,
      }}
    >
      {/* —— Hero —— */}
      <header
        style={{
          borderBottom: `3px solid ${accent}`,
          paddingBottom: 16,
          marginBottom: 28,
        }}
      >
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}
        >
          <h1 style={{ margin: 0, fontSize: 28, color: '#0f172a', letterSpacing: '-0.01em' }}>
            Aurora 季度业务报告
          </h1>
          <span style={{ fontSize: 13, color: '#94a3b8', whiteSpace: 'nowrap' }}>
            第 {volume} 卷 · 2026 Q1
          </span>
        </div>
        <p style={{ color: '#64748b', marginTop: 6, fontSize: 13 }}>
          数据口径 2026-01-01 ~ 2026-03-31 | 数据来源 Aurora Analytics | 撰写人 数据中台
        </p>
      </header>

      {/* —— KPI 卡 —— */}
      <SectionHeader accent={accent} title="核心指标" subtitle="Q1 关键 KPI 同比" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 32,
        }}
      >
        {[
          { label: '总访问量', val: '128,430', delta: '+12.4%', up: true },
          { label: '订单量', val: '6,841', delta: '+8.7%', up: true },
          { label: '转化率', val: '4.62%', delta: '-0.3%', up: false },
          { label: '客单价', val: '¥ 312.80', delta: '+5.1%', up: true },
        ].map((k) => (
          <div
            key={k.label}
            style={{
              padding: 18,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
            }}
          >
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6, color: '#0f172a' }}>
              {k.val}
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                fontWeight: 600,
                color: k.up ? '#10b981' : '#ef4444',
              }}
            >
              {k.up ? '▲' : '▼'} {k.delta}
            </div>
          </div>
        ))}
      </div>

      {/* —— 概览段落 —— */}
      <SectionHeader accent={accent} title="业务概览" subtitle="数据洞察 + 关键变化" />
      <div style={{ marginBottom: 28 }}>
        <p>
          本季度整体业务表现强劲, 总访问量同比增长 <b>12.4%</b>, 已连续三个季度保持双位数增速.
          在春节大促与三月会员日两次活动驱动下, 订单量峰值出现在 2026-02-14 与 2026-03-08, 单日 GMV 双双突破历史记录.
          但需要警惕的是, 转化率较去年同期下滑 0.3 个百分点, 主要受新流量结构变化影响.
        </p>
        <p>
          从用户行为看, 移动端贡献流量占比从去年的 71.2% 提升至 78.5%, 但桌面端的客单价仍然显著高于移动端
          (¥ 421.30 vs ¥ 281.40). 这说明高客单价品类对桌面浏览路径仍有较强依赖, 后续选品 / 货架推荐应延续多端策略.
        </p>
        <p>
          地域分布上, 华东仍是绝对主力 (29.8%), 但华中 / 西南两个区域的同比增速领先 (+24.7% / +21.3%),
          可视为下一季度市场拓展的优先级方向. 详细分布与各区域订单分布见后续地区分析章节.
        </p>
      </div>

      {/* —— 14 行表 —— */}
      <SectionHeader accent={accent} title="每日运营数据" subtitle="14 天明细 (示意切片)" />
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 12,
          marginBottom: 32,
        }}
      >
        <thead>
          <tr style={{ background: '#0f172a', color: '#fff' }}>
            {['日期', 'UV', '订单', 'GMV', '转化率'].map((h, i) => (
              <th
                key={h}
                style={{
                  padding: '10px 12px',
                  textAlign: i === 0 ? 'left' : 'right',
                  fontWeight: 600,
                  fontSize: 12,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dailyRows.map((r, i) => (
            <tr
              key={r.d}
              style={{
                background: i % 2 ? '#f8fafc' : '#fff',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <td style={{ padding: '8px 12px' }}>{r.d}</td>
              <td style={{ padding: '8px 12px', textAlign: 'right' }}>{r.uv.toLocaleString()}</td>
              <td style={{ padding: '8px 12px', textAlign: 'right' }}>{r.orders}</td>
              <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                ¥ {r.gmv.toLocaleString()}
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right' }}>{r.conv}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* —— 25 行 SKU 表 —— */}
      <SectionHeader accent={accent} title="SKU 销售明细" subtitle="Top 25 商品" />
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 12,
          marginBottom: 32,
        }}
      >
        <thead>
          <tr style={{ background: '#0f172a', color: '#fff' }}>
            {['SKU', '类目', '售价', '库存', '销量', '评分'].map((h, i) => (
              <th
                key={h}
                style={{
                  padding: '10px 12px',
                  textAlign: i <= 1 ? 'left' : 'right',
                  fontWeight: 600,
                  fontSize: 12,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {skuRows.map((r, i) => (
            <tr
              key={r.sku}
              style={{
                background: i % 2 ? '#f8fafc' : '#fff',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <td style={{ padding: '8px 12px', fontFamily: 'SFMono-Regular, monospace' }}>
                {r.sku}
              </td>
              <td style={{ padding: '8px 12px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  {r.cat}
                </span>
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right' }}>¥ {r.price}</td>
              <td style={{ padding: '8px 12px', textAlign: 'right', color: '#64748b' }}>
                {r.stock}
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{r.sold}</td>
              <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                <span style={{ color: '#f59e0b' }}>★</span> {r.rating}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* —— 6 块地区卡 —— */}
      <SectionHeader accent={accent} title="地区分布" subtitle="6 个区域 UV / 占比 / 重点城市" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 14,
          marginBottom: 32,
        }}
      >
        {regions.map((r, i) => (
          <div
            key={r.name}
            style={{
              padding: 18,
              background: '#fff',
              border: `1px solid #e2e8f0`,
              borderTop: `3px solid ${palette[i % palette.length]}`,
              borderRadius: 8,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 6,
              }}
            >
              <strong style={{ color: '#0f172a' }}>{r.name}</strong>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{r.share}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{r.uv}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>重点 · {r.leader}</div>
          </div>
        ))}
      </div>

      {/* —— 转化漏斗 (用条形 div 模拟) —— */}
      <SectionHeader accent={accent} title="转化漏斗" subtitle="访问 → 支付完成" />
      <div style={{ marginBottom: 32 }}>
        {funnel.map((f, i) => (
          <div
            key={f.stage}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '8px 0',
              borderBottom: i === funnel.length - 1 ? 0 : '1px dashed #e2e8f0',
            }}
          >
            <div style={{ width: 100, fontSize: 13 }}>{f.stage}</div>
            <div style={{ flex: 1, position: 'relative', height: 26, background: '#f1f5f9', borderRadius: 4 }}>
              <div
                style={{
                  width: `${f.ratio}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${palette[i % palette.length]}, ${palette[(i + 1) % palette.length]})`,
                  borderRadius: 4,
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: 8,
                  top: 0,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 12,
                  color: '#fff',
                  fontWeight: 600,
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                {f.n.toLocaleString()} ({f.ratio}%)
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* —— 双栏: 用户画像 vs 设备分布 —— */}
      <SectionHeader accent={accent} title="用户画像" subtitle="人群结构 + 设备分布" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 14,
          marginBottom: 32,
        }}
      >
        <div style={{ padding: 18, background: '#f8fafc', borderRadius: 8 }}>
          <strong style={{ display: 'block', marginBottom: 10, color: '#0f172a' }}>年龄分布</strong>
          {[
            ['18-24', 18.3],
            ['25-30', 32.7],
            ['31-40', 28.4],
            ['41-50', 14.2],
            ['50+', 6.4],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0' }}>
              <span style={{ width: 60, fontSize: 12, color: '#64748b' }}>{k}</span>
              <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4 }}>
                <div style={{ width: `${v}%`, height: '100%', background: accent, borderRadius: 4 }} />
              </div>
              <span style={{ width: 50, textAlign: 'right', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
                {v}%
              </span>
            </div>
          ))}
        </div>
        <div style={{ padding: 18, background: '#f8fafc', borderRadius: 8 }}>
          <strong style={{ display: 'block', marginBottom: 10, color: '#0f172a' }}>设备终端</strong>
          {[
            ['iOS', 41.8, '#10b981'],
            ['Android', 36.7, '#5b8def'],
            ['Desktop', 17.5, '#f59e0b'],
            ['Tablet', 4.0, '#8b5cf6'],
          ].map(([k, v, c]) => (
            <div
              key={k as string}
              style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0' }}
            >
              <span style={{ width: 60, fontSize: 12, color: '#64748b' }}>{k}</span>
              <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4 }}>
                <div
                  style={{
                    width: `${v}%`,
                    height: '100%',
                    background: c as string,
                    borderRadius: 4,
                  }}
                />
              </div>
              <span style={{ width: 50, textAlign: 'right', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
                {v}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* —— 附录 文字大段 —— */}
      <SectionHeader accent={accent} title="附录:数据说明 / 口径" subtitle="" />
      <div style={{ color: '#475569', fontSize: 12, lineHeight: 1.8 }}>
        <p>
          <b>UV (Unique Visitor)</b> 指自然日内访问过首页的去重独立用户, 以浏览器指纹 + 登录态联合判定;
          同一用户多次访问只计 1 次. 跨设备访问 (登录态可识别) 在 BI 层做合并, 但本报告仍按设备口径展示.
        </p>
        <p>
          <b>转化率</b> = 当日完成支付订单数 / 当日 UV. 退款 / 取消订单不扣除. 月度数据按自然月聚合,
          季度数据按 ISO 季度边界. 同比 (YoY) 与去年同期 (2025 Q1) 对齐, 环比 (MoM) 与上一月对齐.
        </p>
        <p>
          <b>GMV</b> 包含已支付订单金额, 含运费但不含税收减免. 历史数据按订单创建时间归属, 不按支付时间.
          因此可能与财务报表的口径存在 1-2 天的边界差异, 月初 / 季初的小幅偏差属于正常现象.
        </p>
        <p style={{ marginTop: 24, color: '#94a3b8', fontSize: 11 }}>
          —— 报告生成自 Aurora Analytics 数据中台, 仅供内部参考。任何对外引用须经市场部审核。 ——
        </p>
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{ accent: string; title: string; subtitle?: string }> = ({
  accent,
  title,
  subtitle,
}) => (
  <div style={{ marginBottom: 14 }}>
    <h2
      style={{
        margin: 0,
        fontSize: 18,
        fontWeight: 700,
        color: '#0f172a',
        borderLeft: `4px solid ${accent}`,
        paddingLeft: 12,
        lineHeight: 1.3,
      }}
    >
      {title}
    </h2>
    {subtitle ? (
      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, paddingLeft: 16 }}>{subtitle}</div>
    ) : null}
  </div>
);

const PreviewDemo: React.FC = () => {
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
      <PdfDownload targetRef={ref} filename="preview-demo.pdf" preview margin={24} />
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
