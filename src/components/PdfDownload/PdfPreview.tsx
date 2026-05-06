import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useLocale } from '../ConfigProvider/ConfigProvider';
import './PdfPreview.css';

export interface PdfPreviewPage {
  /** PNG data URL — 渲染好的整页图像 */
  dataUrl: string;
  /** 页面在 PDF 中的物理尺寸 (pt), 用来还原宽高比 */
  widthPt: number;
  heightPt: number;
}

export interface PdfPreviewProps {
  open: boolean;
  pages: PdfPreviewPage[];
  filename: string;
  /** 估计的文件大小 (bytes), 真实大小要等 onConfirm 后才知道 */
  estimatedBytes?: number;
  /** 「下载」按钮 loading 态 (用户点了下载, 还在打包/落盘) */
  saving?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.25;

/* ============== Icons ============== */
const Icon: Record<string, React.FC> = {
  close: () => (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  zoomIn: () => (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
      <path d="M7 3v8M3 7h8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  zoomOut: () => (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
      <path d="M3 7h8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  fitWidth: () => (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
      <path d="M2 8h12M5 5L2 8l3 3M11 5l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  download: () => (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
      <path d="M8 2v8m-3-3l3 3 3-3M3 13h10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

/* ============== Helpers ============== */
const formatBytes = (b?: number): string => {
  if (b == null) return '';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
};

const PdfPreview: React.FC<PdfPreviewProps> = ({
  open,
  pages,
  filename,
  estimatedBytes,
  saving = false,
  onConfirm,
  onCancel,
}) => {
  const locale = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  // 每页的 DOM 容器, 用于 IntersectionObserver 跟踪当前页
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [zoom, setZoom] = useState(1);
  const [fitMode, setFitMode] = useState<'width' | 'page' | 'manual'>('width');
  const [currentPage, setCurrentPage] = useState(1);

  useFocusTrap(rootRef, open);

  // 初始默认 fit-width — 等 viewport 量出来后算 zoom
  const computeFitZoom = useCallback(
    (mode: 'width' | 'page'): number => {
      const vp = viewportRef.current;
      const first = pages[0];
      if (!vp || !first) return 1;
      // 页面图像在 1:1 时的渲染宽度 = widthPt (pt 与 px 在 96dpi 下接近, 这里为简化用 pt 当 px)
      const padX = 64;
      const padY = 80;
      const availW = Math.max(120, vp.clientWidth - padX);
      const availH = Math.max(120, vp.clientHeight - padY);
      if (mode === 'width') return availW / first.widthPt;
      return Math.min(availW / first.widthPt, availH / first.heightPt);
    },
    [pages],
  );

  // 打开时 / 页数变化时重置 fit-width
  useEffect(() => {
    if (!open) return;
    const z = computeFitZoom('width');
    setZoom(z);
    setFitMode('width');
    setCurrentPage(1);
  }, [open, pages, computeFitZoom]);

  // 监听 viewport resize, fit 模式下自动重算 zoom
  useEffect(() => {
    if (!open || fitMode === 'manual') return;
    const vp = viewportRef.current;
    if (!vp) return;
    const ro = new ResizeObserver(() => {
      setZoom(computeFitZoom(fitMode));
    });
    ro.observe(vp);
    return () => ro.disconnect();
  }, [open, fitMode, computeFitZoom]);

  // ESC 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) {
        e.stopPropagation();
        onCancel();
        return;
      }
      // 上下箭头翻页
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        scrollToPage(Math.min(pages.length, currentPage + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        scrollToPage(Math.max(1, currentPage - 1));
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentPage, pages.length, saving, onCancel]);

  // body scroll lock
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // IntersectionObserver 同步 currentPage
  useEffect(() => {
    if (!open) return;
    const vp = viewportRef.current;
    if (!vp) return;
    const io = new IntersectionObserver(
      (entries) => {
        // 取交叉比例最大的一个作为当前页
        let best: { idx: number; ratio: number } | null = null;
        entries.forEach((e) => {
          const idx = pageRefs.current.findIndex((el) => el === e.target);
          if (idx < 0) return;
          if (!best || e.intersectionRatio > best.ratio) {
            best = { idx, ratio: e.intersectionRatio };
          }
        });
        if (best && (best as { idx: number; ratio: number }).ratio > 0.3) {
          setCurrentPage((best as { idx: number; ratio: number }).idx + 1);
        }
      },
      { root: vp, threshold: [0, 0.3, 0.6, 1] },
    );
    pageRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [open, pages.length]);

  const scrollToPage = useCallback((n: number) => {
    const el = pageRefs.current[n - 1];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleZoom = (next: number) => {
    setZoom(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, next)));
    setFitMode('manual');
  };

  const sizeText = useMemo(() => {
    if (saving) return locale.PdfDownload.packing;
    const sz = formatBytes(estimatedBytes);
    /* "{n} 页" 不进 locale — 大部分场景这种 [n+量词] 会用到 Intl.PluralRules,
       目前作为简单文本拼接, 中文 "页" / 英文 "pages" 之后再单独抽 */
    return `${pages.length} 页${sz ? ' · ~' + sz : ''}`;
  }, [pages.length, estimatedBytes, saving, locale]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="au-pdf-viewer__backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onCancel();
      }}
      role="presentation"
    >
      <div
        ref={rootRef}
        className="au-pdf-viewer"
        role="dialog"
        aria-modal="true"
        aria-label={`PDF 预览: ${filename}`}
      >
        {/* —— Header —— */}
        <header className="au-pdf-viewer__header">
          <div className="au-pdf-viewer__title">
            <span className="au-pdf-viewer__filename">{filename}</span>
            <span className="au-pdf-viewer__meta">{sizeText}</span>
          </div>
          <button
            type="button"
            className="au-pdf-viewer__close"
            onClick={onCancel}
            disabled={saving}
            aria-label="关闭预览"
          >
            <Icon.close />
          </button>
        </header>

        {/* —— Body: 缩略图 + 主预览区 —— */}
        <div className="au-pdf-viewer__body">
          <aside className="au-pdf-viewer__sidebar" aria-label="页面缩略图">
            {pages.map((p, i) => (
              <button
                key={i}
                type="button"
                className={[
                  'au-pdf-viewer__thumb',
                  currentPage === i + 1 ? 'is-active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => scrollToPage(i + 1)}
                aria-label={`跳到第 ${i + 1} 页`}
              >
                <img
                  src={p.dataUrl}
                  alt=""
                  draggable={false}
                  style={{ aspectRatio: `${p.widthPt} / ${p.heightPt}` }}
                />
                <span>{i + 1}</span>
              </button>
            ))}
          </aside>

          <div ref={viewportRef} className="au-pdf-viewer__viewport">
            {pages.map((p, i) => (
              <div
                key={i}
                ref={(el) => {
                  pageRefs.current[i] = el;
                }}
                className="au-pdf-viewer__page"
                data-page={i + 1}
              >
                <img
                  src={p.dataUrl}
                  alt={`第 ${i + 1} 页`}
                  draggable={false}
                  style={{
                    width: p.widthPt * zoom,
                    height: p.heightPt * zoom,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* —— Footer: 缩放 + 操作 —— */}
        <footer className="au-pdf-viewer__footer">
          <div className="au-pdf-viewer__zoom">
            <button
              type="button"
              onClick={() => handleZoom(zoom - ZOOM_STEP)}
              disabled={zoom <= ZOOM_MIN}
              aria-label="缩小"
            >
              <Icon.zoomOut />
            </button>
            <span className="au-pdf-viewer__zoom-val">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => handleZoom(zoom + ZOOM_STEP)}
              disabled={zoom >= ZOOM_MAX}
              aria-label="放大"
            >
              <Icon.zoomIn />
            </button>
            <span className="au-pdf-viewer__divider" />
            <button
              type="button"
              className={fitMode === 'width' ? 'is-active' : ''}
              onClick={() => {
                setFitMode('width');
                setZoom(computeFitZoom('width'));
              }}
              title={locale.PdfDownload.fitWidth}
            >
              <Icon.fitWidth />
              <span>{locale.PdfDownload.fitWidth}</span>
            </button>
            <button
              type="button"
              className={Math.abs(zoom - 1) < 0.01 && fitMode === 'manual' ? 'is-active' : ''}
              onClick={() => {
                setFitMode('manual');
                setZoom(1);
              }}
            >
              100%
            </button>
          </div>

          <div className="au-pdf-viewer__page-nav" aria-live="polite">
            第 <strong>{currentPage}</strong> / {pages.length} 页
          </div>

          <div className="au-pdf-viewer__actions">
            <button
              type="button"
              className="au-pdf-viewer__btn"
              onClick={onCancel}
              disabled={saving}
            >
              取消
            </button>
            <button
              type="button"
              className="au-pdf-viewer__btn au-pdf-viewer__btn--primary"
              onClick={onConfirm}
              disabled={saving}
            >
              {saving ? (
                <span className="au-pdf-viewer__btn-spin" />
              ) : (
                <Icon.download />
              )}
              <span>{saving ? locale.PdfDownload.downloading : locale.PdfDownload.download}</span>
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
};

export default PdfPreview;
