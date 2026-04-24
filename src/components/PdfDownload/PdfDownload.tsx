import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './PdfDownload.css';

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
  /** 开始导出前触发 */
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

const DownloadIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const PdfDownload: React.FC<PdfDownloadProps> = ({
  targetRef,
  filename = 'document.pdf',
  orientation = 'portrait',
  format = 'a4',
  scale = 2,
  margin = 0,
  buttonText = '下载 PDF',
  disabled = false,
  onBefore,
  onDone,
  onError,
  className = '',
  children,
}) => {
  const [loading, setLoading] = useState(false);

  const exportPdf = async () => {
    const target = targetRef.current;
    if (!target || loading || disabled) return;
    setLoading(true);
    onBefore?.();
    try {
      const canvas = await html2canvas(target, {
        scale,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const pdf = new jsPDF({ orientation, unit: 'pt', format });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const contentW = pageW - margin * 2;
      const contentH = pageH - margin * 2;

      const imgW = contentW;
      const imgH = (canvas.height * contentW) / canvas.width;
      const imgData = canvas.toDataURL('image/png');

      if (imgH <= contentH) {
        pdf.addImage(imgData, 'PNG', margin, margin, imgW, imgH);
      } else {
        const pages = Math.ceil(imgH / contentH);
        for (let i = 0; i < pages; i++) {
          if (i > 0) pdf.addPage();
          pdf.addImage(
            imgData,
            'PNG',
            margin,
            margin - i * contentH,
            imgW,
            imgH
          );
        }
      }

      const blob = pdf.output('blob');
      pdf.save(filename);
      onDone?.(blob);
    } catch (err) {
      onError?.(err);
      if (!onError) console.error('[PdfDownload] export failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (children !== undefined) {
    return (
      <span
        className={`au-pdf-trigger${loading ? ' au-pdf-trigger--loading' : ''}${
          disabled ? ' au-pdf-trigger--disabled' : ''
        } ${className}`}
        onClick={exportPdf}
        role="button"
      >
        {children}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={`au-pdf-download ${className}`}
      onClick={exportPdf}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="au-pdf-download__spinner" />
      ) : (
        <DownloadIcon />
      )}
      <span>{loading ? '生成中...' : buttonText}</span>
    </button>
  );
};

export default PdfDownload;
