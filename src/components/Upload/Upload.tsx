import React, { useRef, useState } from 'react';
import './Upload.css';

export type UploadStatus = 'uploading' | 'done' | 'error' | 'removed';
export type UploadListType = 'text' | 'picture' | 'card' | 'drag';

export interface UploadFile {
  uid: string;
  name: string;
  size?: number;
  type?: string;
  status?: UploadStatus;
  url?: string;
  /** 上传中的进度 0-100 */
  percent?: number;
  /** 错误信息 */
  error?: string;
  /** 原始 File 对象 */
  raw?: File;
}

export interface UploadProps {
  /** 受控文件列表 */
  fileList?: UploadFile[];
  defaultFileList?: UploadFile[];
  /** 接受的 MIME / 后缀 (同 input accept) */
  accept?: string;
  /** 多选 */
  multiple?: boolean;
  /** 单文件大小限制 (KB) */
  maxSize?: number;
  /** 列表展示形态 */
  listType?: UploadListType;
  /** 禁用 */
  disabled?: boolean;
  /** 隐藏文件列表 */
  showFileList?: boolean;
  /**
   * 选择文件后触发, 返回 false 拒绝, 返回 Promise 异步处理。
   * 不传则文件直接进列表(状态 done), 由用户自己 onChange 接服务端上传
   */
  beforeUpload?: (file: File, fileList: File[]) => boolean | Promise<boolean>;
  /** 文件列表变更 (添加 / 进度 / 完成 / 移除) */
  onChange?: (info: { file: UploadFile; fileList: UploadFile[] }) => void;
  /** 移除某个文件前触发, 返回 false 阻止 */
  onRemove?: (file: UploadFile) => boolean | Promise<boolean> | void;
  /** 自定义触发器, 不传默认渲染按钮区域 */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const formatSize = (bytes?: number): string => {
  if (bytes == null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const uid = () => `upl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const Upload: React.FC<UploadProps> = ({
  fileList: ctrlList,
  defaultFileList = [],
  accept,
  multiple,
  maxSize,
  listType = 'text',
  disabled,
  showFileList = true,
  beforeUpload,
  onChange,
  onRemove,
  children,
  className = '',
  style,
}) => {
  const isControlled = ctrlList !== undefined;
  const [innerList, setInnerList] = useState<UploadFile[]>(defaultFileList);
  const list = isControlled ? ctrlList! : innerList;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const updateList = (next: UploadFile[], changedFile: UploadFile) => {
    if (!isControlled) setInnerList(next);
    onChange?.({ file: changedFile, fileList: next });
  };

  const handleFiles = async (files: FileList | File[]) => {
    if (disabled) return;
    const arr = Array.from(files);
    for (const f of arr) {
      if (maxSize && f.size > maxSize * 1024) {
        const errFile: UploadFile = {
          uid: uid(),
          name: f.name,
          size: f.size,
          type: f.type,
          status: 'error',
          error: `超出 ${maxSize}KB 限制`,
          raw: f,
        };
        updateList([...list, errFile], errFile);
        continue;
      }
      let ok: boolean | Promise<boolean> = true;
      if (beforeUpload) {
        ok = beforeUpload(f, arr);
        if (ok instanceof Promise) ok = await ok;
      }
      if (!ok) continue;
      const item: UploadFile = {
        uid: uid(),
        name: f.name,
        size: f.size,
        type: f.type,
        status: 'done',
        url: URL.createObjectURL(f),
        raw: f,
      };
      updateList([...list, item], item);
    }
    // reset input value 让同名文件再次选中能触发
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleRemove = async (file: UploadFile) => {
    const ret = onRemove?.(file);
    const allow = ret instanceof Promise ? await ret : ret;
    if (allow === false) return;
    const next = list.filter((f) => f.uid !== file.uid);
    updateList(next, { ...file, status: 'removed' });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const cls = [
    'au-upload',
    `au-upload--${listType}`,
    disabled ? 'is-disabled' : '',
    dragOver ? 'is-drag-over' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls} style={style}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        style={{ display: 'none' }}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <div
        className="au-upload__trigger"
        onClick={handleClick}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={disabled ? -1 : 0}
      >
        {children ?? (
          listType === 'drag' ? (
            <div className="au-upload__drag-inner">
              <div className="au-upload__drag-icon">
                <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden>
                  <path d="M12 4v12M6 10l6-6 6 6M4 20h16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="au-upload__drag-text">点击或拖拽文件到此处上传</div>
              <div className="au-upload__drag-hint">{accept ? `支持 ${accept}` : '支持单 / 批量上传'}</div>
            </div>
          ) : (
            <button type="button" className="au-upload__btn" disabled={disabled}>
              <span className="au-upload__btn-icon">＋</span>
              <span>选择文件</span>
            </button>
          )
        )}
      </div>

      {showFileList && list.length > 0 && (
        <div className="au-upload__list">
          {list.map((f) => (
            <div key={f.uid} className={`au-upload__item is-${f.status ?? 'done'}`}>
              {(listType === 'picture' || listType === 'card') && f.url && (
                <img src={f.url} alt={f.name} className="au-upload__thumb" />
              )}
              <div className="au-upload__meta">
                <div className="au-upload__name" title={f.name}>{f.name}</div>
                <div className="au-upload__sub">
                  {formatSize(f.size)}
                  {f.error && <span className="au-upload__error"> · {f.error}</span>}
                </div>
                {f.status === 'uploading' && typeof f.percent === 'number' && (
                  <div className="au-upload__progress">
                    <div className="au-upload__progress-bar" style={{ width: `${f.percent}%` }} />
                  </div>
                )}
              </div>
              <button
                type="button"
                className="au-upload__remove"
                onClick={() => handleRemove(f)}
                aria-label="移除"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Upload;
