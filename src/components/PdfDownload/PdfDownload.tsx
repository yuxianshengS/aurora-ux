import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import PdfPreview, { type PdfPreviewPage } from './PdfPreview';
import { useLocale } from '../ConfigProvider/ConfigProvider';
import './PdfDownload.css';

// 动态加载 — 进入页面不必为 600KB+ 的 html2canvas/jspdf 付钱,只在用户点击时拉
const loadDeps = () =>
  Promise.all([import('html2canvas'), import('jspdf')]).then(
    ([h2c, jspdf]) => ({ html2canvas: h2c.default, jsPDF: jspdf.jsPDF }),
  );

export type PdfOrientation = 'portrait' | 'landscape';
export type PdfFormat = 'a4' | 'a3' | 'letter';

export interface PdfDownloadProps {
  /** 导出目标 DOM, 传 ref */
  targetRef: React.RefObject<HTMLElement | null>;
  /** 文件名, 默认 document.pdf */
  filename?: string;
  /** 页面方向 */
  orientation?: PdfOrientation;
  /** 纸张规格 */
  format?: PdfFormat;
  /** 渲染倍率, 越大越清晰但文件越大; 默认 2 */
  scale?: number;
  /** 页面四周留白 (pt), 默认 0 */
  margin?: number;
  /** 按钮文本 */
  buttonText?: React.ReactNode;
  /** 禁用 */
  disabled?: boolean;
  /**
   * 点击后先弹原生风格 PDF 查看器,用户翻页 / 缩放 / 看缩略图,
   * 确认无误再点「下载」。
   */
  preview?: boolean;
  /**
   * 异步准备钩子 — 在 html2canvas 之前 await 这个回调,
   * 用来等接口数据 / 图表渲染 / 任意需要在导出前完成的工作。
   * 即使不传, 组件也会自动等字体 / 图片 / 重绘 (见下)。
   */
  beforeRender?: () => Promise<void> | void;
  /**
   * 等待图片加载的最大兜底时间 (ms, 默认 5000)。
   * 防止某张外链图永远不返回时把导出挂死。
   */
  waitImagesTimeout?: number;
  /** 开始导出前触发 (in: 在 beforeRender / 资源就绪等待之前) */
  onBefore?: () => void;
  /** 导出成功后触发, 传回 blob */
  onDone?: (blob: Blob) => void;
  /** 导出失败时触发 */
  onError?: (err: unknown) => void;
  /** 附加类名 */
  className?: string;
  /** 自定义触发器; 传入时替换默认按钮, 点击该节点会触发导出 */
  children?: React.ReactNode;
}

/** 命令式 API — 通过 ref 拿到这些方法, 用于程序化导出 */
export interface PdfDownloadHandle {
  /**
   * 程序化触发导出。会跑全套流程: beforeRender → 等字体/图片/重绘 → html2canvas → 切页 → 保存 (或开预览)。
   * preview 模式下返回的 Promise 在用户点「下载」或「取消」时 resolve。
   * @returns 导出成功时的 blob; 失败 / 取消时为 null
   */
  export: () => Promise<Blob | null>;
}

const DownloadIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

/* ============== Helpers ============== */

/** 等 Web 字体加载完 — 否则 PDF 里可能是回退字体 */
const waitForFonts = async (): Promise<void> => {
  if (typeof document === 'undefined') return;
  const fonts = (document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts;
  if (fonts?.ready) {
    try {
      await fonts.ready;
    } catch {
      // FontFaceSet 偶发拒绝, 忽略不阻塞导出
    }
  }
};

/** 等 target 子树里所有 <img> 加载完 (带兜底超时, 防止外链挂死) */
const waitForImages = async (root: HTMLElement, timeoutMs: number): Promise<void> => {
  const imgs = Array.from(root.querySelectorAll<HTMLImageElement>('img'));
  const pending = imgs
    .filter((img) => !img.complete || img.naturalWidth === 0)
    .map(
      (img) =>
        new Promise<void>((resolve) => {
          const done = () => resolve();
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
        }),
    );
  if (pending.length === 0) return;
  await Promise.race([
    Promise.all(pending).then(() => undefined),
    new Promise<void>((r) => window.setTimeout(r, timeoutMs)),
  ]);
};

/** 双 rAF 等一帧绘制 — 让 React 已 commit 的节点先 layout + paint, 再 html2canvas */
const waitForPaint = (): Promise<void> =>
  new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

interface RenderResult {
  /** html2canvas 给的整张大 canvas */
  source: HTMLCanvasElement;
  /** PDF 页宽 (pt) */
  pageW: number;
  /** PDF 页高 (pt) */
  pageH: number;
  /** 内容区宽 (pt) = pageW - 2*margin */
  contentW: number;
  /** 内容区高 (pt) = pageH - 2*margin */
  contentH: number;
  /** 1 PDF pt = ? canvas px (沿 X 方向) */
  pxPerPt: number;
  margin: number;
  /** 切好的整页位图 — 预览和打包 PDF 共用同一份, 保证像素一致 */
  slices: PdfPreviewPage[];
}

/**
 * 一行像素是否「足够空白」 — 抽样比对每个像素的 RGB 平均值, 离白足够近视为空。
 * 在已 getImageData 的缓冲上工作, 避免重复读 canvas (慢)。
 */
const isWhitespaceRow = (
  data: Uint8ClampedArray,
  rowIdx: number,
  width: number,
  /** 每隔几列取一个样本 — 越大越快但越不精准 */
  stepX = 4,
  /** RGB 平均阈值, 低于此值视为非空 */
  threshold = 245,
  /** 容许的非空像素数, 超过即判此行非空 */
  maxNonWhite = 2,
): boolean => {
  const rowStart = rowIdx * width * 4;
  let nonWhite = 0;
  for (let x = 0; x < width; x += stepX) {
    const i = rowStart + x * 4;
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    if (avg < threshold) {
      nonWhite++;
      if (nonWhite > maxNonWhite) return false;
    }
  }
  return true;
};

/**
 * 内容感知分页 — 在每个理想切点附近往回找最近的空白行作为真正的切点。
 * 这样切片落在两块内容之间的空白带 (table 行间 / 卡片间 / 段落间), 不再硬切表格行 / 文字。
 * 找不到空白带时退回理想切点 (硬切, 与旧行为一致), 保证不会卡死。
 *
 * @param source html2canvas 给的整张大 canvas
 * @param pageHpx 一页内容区对应的 canvas 像素高
 * @returns 切点数组 [0, ..., source.height], 相邻两点为一页
 */
const findPageBreaks = (
  source: HTMLCanvasElement,
  pageHpx: number,
  /** 往回找的容差 (canvas px) — scale=2 下 80px ≈ 40 CSS px ≈ 3 行文字 */
  tolerance = 80,
): number[] => {
  const ctx = source.getContext('2d');
  if (!ctx) return [0, source.height];
  const breaks: number[] = [0];
  let cur = 0;
  try {
    while (cur + pageHpx < source.height) {
      const ideal = cur + pageHpx;
      // 不允许页面太短 — 至少装满 60% 才考虑往回切
      const lo = Math.max(cur + Math.floor(pageHpx * 0.6), ideal - tolerance);
      const range = ideal - lo;
      // 一次性 getImageData 整段, 避免每行一次调用 (整体快 50x+)
      const data = ctx.getImageData(0, lo, source.width, range).data;
      let cut = ideal; // fallback: 找不到空白时硬切
      for (let y = ideal - 1; y >= lo; y--) {
        if (isWhitespaceRow(data, y - lo, source.width)) {
          cut = y;
          break;
        }
      }
      breaks.push(cut);
      cur = cut;
    }
  } catch {
    // canvas 被跨域污染时 getImageData 会抛, 直接走匀分切
    const breaksFallback: number[] = [0];
    let p = pageHpx;
    while (p < source.height) {
      breaksFallback.push(p);
      p += pageHpx;
    }
    breaksFallback.push(source.height);
    return breaksFallback;
  }
  breaks.push(source.height);
  return breaks;
};

/**
 * 把整张 canvas 按页切成 N 张「整页位图」, 切点用内容感知分页选取。
 * 每页画布尺寸 = 整页 (pageW × pageH), 内容区切片绘到 (margin, margin), 四周保留 margin 白边。
 * 短页 (内容感知后被提前切的页) 在底部留白, 跟 PDF 自然分页一致。
 */
const slicePages = (r: RenderResult): PdfPreviewPage[] => {
  const pageHpx = Math.round(r.contentH * r.pxPerPt);
  const fullPageWpx = Math.round(r.pageW * r.pxPerPt);
  const fullPageHpx = Math.round(r.pageH * r.pxPerPt);
  const marginPx = Math.round(r.margin * r.pxPerPt);
  const breaks = findPageBreaks(r.source, pageHpx);
  const pages: PdfPreviewPage[] = [];
  for (let i = 0; i < breaks.length - 1; i++) {
    const sy = breaks[i];
    const sh = breaks[i + 1] - sy;
    const off = document.createElement('canvas');
    off.width = fullPageWpx;
    off.height = fullPageHpx;
    const ctx = off.getContext('2d');
    if (!ctx) continue;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, off.width, off.height);
    if (sh > 0) {
      ctx.drawImage(
        r.source,
        0, sy, r.source.width, sh,
        marginPx, marginPx, r.source.width, sh,
      );
    }
    pages.push({
      dataUrl: off.toDataURL('image/png'),
      widthPt: r.pageW,
      heightPt: r.pageH,
    });
  }
  return pages;
};

/** 估算文件大小: 基于 source canvas 像素数 × PNG 平均压缩系数 (~0.6 byte/px) */
const estimateBytes = (canvas: HTMLCanvasElement): number =>
  Math.round(canvas.width * canvas.height * 0.6);

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const PdfDownload = forwardRef<PdfDownloadHandle, PdfDownloadProps>(
  (
    {
      targetRef,
      filename = 'document.pdf',
      orientation = 'portrait',
      format = 'a4',
      scale = 2,
      margin = 0,
      buttonText,
      disabled = false,
      preview = false,
      beforeRender,
      waitImagesTimeout = 5000,
      onBefore,
      onDone,
      onError,
      className = '',
      children,
    },
    ref,
  ) => {
    const locale = useLocale();
    const buttonTextResolved = buttonText ?? locale.PdfDownload.download;
    const [loading, setLoading] = useState(false);
    const [previewPages, setPreviewPages] = useState<PdfPreviewPage[] | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    // 把 RenderResult 留着, onConfirm 时复用 — 不必重跑 html2canvas
    const renderRef = useRef<RenderResult | null>(null);
    // preview 模式下, 把命令式 export() 的 resolve 留着, 等用户在预览里点确认/取消时再 settle
    const pendingResolveRef = useRef<((blob: Blob | null) => void) | null>(null);

    /** 把 target 渲成 canvas, 算出页面参数 + 切好整页位图 — 不打包 PDF */
    const render = useCallback(async (): Promise<RenderResult | null> => {
      const target = targetRef.current;
      if (!target) return null;

      // ① 用户的自定义异步准备 (fetch / 图表渲染 / 任意 await)
      if (beforeRender) await beforeRender();

      // ② 内置等待: 字体 / 图片 / 重绘 — 防止异步内容尚未就绪就被 html2canvas 抓
      await waitForFonts();
      await waitForImages(target, waitImagesTimeout);
      await waitForPaint();

      const { html2canvas, jsPDF } = await loadDeps();
      const canvas = await html2canvas(target, {
        scale,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const probe = new jsPDF({ orientation, unit: 'pt', format });
      const pageW = probe.internal.pageSize.getWidth();
      const pageH = probe.internal.pageSize.getHeight();
      const contentW = pageW - margin * 2;
      const contentH = pageH - margin * 2;
      const pxPerPt = canvas.width / contentW;
      const partial: RenderResult = {
        source: canvas,
        pageW,
        pageH,
        contentW,
        contentH,
        pxPerPt,
        margin,
        slices: [],
      };
      partial.slices = slicePages(partial);
      return partial;
    }, [targetRef, scale, orientation, format, margin, beforeRender, waitImagesTimeout]);

    /** 用切好的整页位图打包 PDF + 触发下载 — 跟预览像素一致 */
    const buildAndSave = useCallback(
      async (r: RenderResult): Promise<Blob> => {
        const { jsPDF } = await loadDeps();
        const pdf = new jsPDF({ orientation, unit: 'pt', format });
        r.slices.forEach((s, i) => {
          if (i > 0) pdf.addPage();
          pdf.addImage(s.dataUrl, 'PNG', 0, 0, r.pageW, r.pageH);
        });
        const blob = pdf.output('blob');
        triggerDownload(blob, filename);
        return blob;
      },
      [orientation, format, filename],
    );

    /**
     * 核心导出流程 — 触发器点击和命令式 export() 都走这里。
     * preview 模式下不直接落盘, 改为开预览; 命令式 export() 则等用户在预览里点确认/取消再 resolve。
     */
    const runExport = useCallback(async (): Promise<Blob | null> => {
      if (!targetRef.current || loading || disabled) return null;
      setLoading(true);
      onBefore?.();
      try {
        const r = await render();
        if (!r) return null;
        if (preview) {
          renderRef.current = r;
          setPreviewPages(r.slices);
          setPreviewOpen(true);
          // 等预览里的「下载 / 取消」事件 settle 这个 promise
          return await new Promise<Blob | null>((resolve) => {
            pendingResolveRef.current = resolve;
          });
        }
        const blob = await buildAndSave(r);
        onDone?.(blob);
        return blob;
      } catch (err) {
        onError?.(err);
        if (!onError) console.error('[PdfDownload] export failed:', err);
        return null;
      } finally {
        setLoading(false);
      }
    }, [targetRef, loading, disabled, preview, render, buildAndSave, onBefore, onDone, onError]);

    // 命令式 API: ref.current.export()
    useImperativeHandle(ref, () => ({ export: runExport }), [runExport]);

    const handleConfirm = async () => {
      if (!renderRef.current || saving) return;
      setSaving(true);
      try {
        const blob = await buildAndSave(renderRef.current);
        onDone?.(blob);
        setPreviewOpen(false);
        setPreviewPages(null);
        renderRef.current = null;
        pendingResolveRef.current?.(blob);
        pendingResolveRef.current = null;
      } catch (err) {
        onError?.(err);
        if (!onError) console.error('[PdfDownload] save failed:', err);
        pendingResolveRef.current?.(null);
        pendingResolveRef.current = null;
      } finally {
        setSaving(false);
      }
    };

    const handleCancelPreview = () => {
      setPreviewOpen(false);
      setPreviewPages(null);
      renderRef.current = null;
      pendingResolveRef.current?.(null);
      pendingResolveRef.current = null;
    };

    // 卸载时清理大 canvas 引用 + 兜底 resolve 防止 promise 永久挂起
    useEffect(
      () => () => {
        renderRef.current = null;
        pendingResolveRef.current?.(null);
        pendingResolveRef.current = null;
      },
      [],
    );

    const trigger =
      children !== undefined ? (
        <span
          className={`au-pdf-trigger${loading ? ' au-pdf-trigger--loading' : ''}${
            disabled ? ' au-pdf-trigger--disabled' : ''
          } ${className}`}
          onClick={() => {
            void runExport();
          }}
          role="button"
        >
          {children}
        </span>
      ) : (
        <button
          type="button"
          className={`au-pdf-download ${className}`}
          onClick={() => {
            void runExport();
          }}
          disabled={disabled || loading}
        >
          {loading ? <span className="au-pdf-download__spinner" /> : <DownloadIcon />}
          <span>{loading ? locale.PdfDownload.generating : buttonTextResolved}</span>
        </button>
      );

    return (
      <>
        {trigger}
        <PdfPreview
          open={previewOpen && !!previewPages}
          pages={previewPages ?? []}
          filename={filename}
          estimatedBytes={
            renderRef.current ? estimateBytes(renderRef.current.source) : undefined
          }
          saving={saving}
          onConfirm={handleConfirm}
          onCancel={handleCancelPreview}
        />
      </>
    );
  },
);

PdfDownload.displayName = 'PdfDownload';

export default PdfDownload;
