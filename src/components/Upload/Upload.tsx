import React, { useCallback, useEffect, useRef, useState } from 'react';
import './Upload.css';

export type UploadStatus = 'uploading' | 'done' | 'error' | 'removed' | 'paused';
export type UploadListType = 'text' | 'picture' | 'card' | 'drag';

/** 分片模式: 单片状态 */
export interface UploadChunkState {
  index: number;
  loaded: number;
  total: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
}

export interface UploadFile {
  uid: string;
  name: string;
  size?: number;
  type?: string;
  status?: UploadStatus;
  url?: string;
  /** 上传中的进度 0-100 (聚合后) */
  percent?: number;
  /** 错误信息 */
  error?: string;
  /** 原始 File 对象 */
  raw?: File;
  /** 分片模式: 每片状态 (无分片时为 undefined) */
  chunkProgress?: UploadChunkState[];
  /** 分片模式: 是否被用户暂停 */
  paused?: boolean;
}

/** customRequest 调用上下文 — 单片或单文件 (无分片时 totalChunks=1) */
export interface UploadChunkContext {
  /** 完整原文件, 一起的所有分片共享 */
  file: File;
  /** 当前要上传的分片 (file.slice 出来的 Blob); 无分片时就是 file */
  chunk: Blob;
  /** 当前分片下标, 0-based */
  chunkIndex: number;
  /** 该文件总共多少片 */
  totalChunks: number;
  /** UploadFile.uid, 同一个文件的所有分片相同, 后端用它做归并 key */
  fileUid: string;
  /** 暂停 / 卸载时会 abort, 调用方实现 fetch / xhr 时务必传给 backend client */
  signal: AbortSignal;
  /** 报告本片已上传多少字节 (用来聚合整个文件的 percent) */
  onProgress: (loaded: number) => void;
}

/** mergeRequest 调用上下文 — 所有分片成功后通知服务端合并 */
export interface UploadMergeContext {
  file: File;
  fileUid: string;
  totalChunks: number;
  signal: AbortSignal;
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

  /* ---------- 分片上传相关 ---------- */
  /**
   * 实际把数据 POST 到服务端的实现 — 不传时组件不上传, 仅在本地维护列表。
   * 传了之后:
   *  - 不传 chunkSize: 一次调用一片完整文件 (totalChunks=1)
   *  - 传了 chunkSize: 按片调用, totalChunks 大于 1
   * 抛错 / Promise reject = 这片失败, 自动按 chunkRetry 次数重试。
   */
  customRequest?: (ctx: UploadChunkContext) => Promise<void>;
  /**
   * 所有分片都成功后触发 — 通知服务端合并。
   * 不传则跳过 (适合 S3-like 服务端自动合并的场景)。
   */
  mergeRequest?: (ctx: UploadMergeContext) => Promise<void>;
  /** 开启分片上传 — 每片字节数. 不传 = 整文件一次性上传 */
  chunkSize?: number;
  /** 同时并发上传几片 (默认 3) */
  chunkConcurrency?: number;
  /** 单片失败自动重试次数 (默认 2, 仍失败后整个文件标错可点重试) */
  chunkRetry?: number;
}

const formatSize = (bytes?: number): string => {
  if (bytes == null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const uid = () => `upl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/** 把 File 切成 Blob 数组 */
const sliceFile = (file: File, chunkSize: number): Blob[] => {
  const chunks: Blob[] = [];
  for (let start = 0; start < file.size; start += chunkSize) {
    chunks.push(file.slice(start, Math.min(start + chunkSize, file.size)));
  }
  return chunks.length === 0 ? [file.slice(0)] : chunks;
};

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
  customRequest,
  mergeRequest,
  chunkSize,
  chunkConcurrency = 3,
  chunkRetry = 2,
}) => {
  const isControlled = ctrlList !== undefined;
  const [innerList, setInnerList] = useState<UploadFile[]>(defaultFileList);
  const list = isControlled ? ctrlList! : innerList;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  /** 始终拿到最新 list 的 ref — 异步上传循环里读这个,不被闭包旧值坑 */
  const listRef = useRef(list);
  listRef.current = list;
  /** 每个上传中文件的 AbortController, 暂停 / 卸载用 */
  const controllersRef = useRef<Map<string, AbortController>>(new Map());
  /** 每个文件已成功的分片下标 — 暂停后恢复时跳过 */
  const doneChunksRef = useRef<Map<string, Set<number>>>(new Map());

  const setListSafe = useCallback(
    (next: UploadFile[], changed: UploadFile) => {
      if (!isControlled) setInnerList(next);
      onChange?.({ file: changed, fileList: next });
    },
    [isControlled, onChange],
  );

  /** 替换 list 中某个 uid 的文件 (基于最新 listRef.current) */
  const patchFile = useCallback(
    (target: string, patch: Partial<UploadFile>) => {
      const cur = listRef.current;
      const idx = cur.findIndex((f) => f.uid === target);
      if (idx < 0) return;
      const next = [...cur];
      next[idx] = { ...next[idx], ...patch };
      listRef.current = next;
      setListSafe(next, next[idx]);
    },
    [setListSafe],
  );

  /** 卸载: abort 所有正在跑的请求 */
  useEffect(() => {
    const map = controllersRef.current;
    return () => {
      map.forEach((c) => c.abort());
      map.clear();
    };
  }, []);

  /* ---------------- 分片 / 单文件统一上传循环 ---------------- */

  /** 内部:跑一个文件 (有 chunkSize 走分片, 否则一次过) */
  const runUpload = useCallback(
    async (file: UploadFile) => {
      const raw = file.raw;
      if (!raw || !customRequest) return;

      const total = chunkSize ? Math.ceil(raw.size / chunkSize) || 1 : 1;
      const chunks: Blob[] = chunkSize ? sliceFile(raw, chunkSize) : [raw];

      // 初始化分片状态 — 已成功的保留 (恢复场景)
      const doneSet = doneChunksRef.current.get(file.uid) ?? new Set<number>();
      doneChunksRef.current.set(file.uid, doneSet);

      const initialChunks: UploadChunkState[] = chunks.map((c, i) => ({
        index: i,
        loaded: doneSet.has(i) ? c.size : 0,
        total: c.size,
        status: doneSet.has(i) ? 'done' : 'pending',
      }));

      patchFile(file.uid, {
        status: 'uploading',
        paused: false,
        chunkProgress: initialChunks,
        percent: aggregatePercent(initialChunks),
        error: undefined,
      });

      const controller = new AbortController();
      controllersRef.current.set(file.uid, controller);

      // 进度本地缓冲 — 频繁回调批量 patch 一次
      const localChunks = [...initialChunks];
      const flushPercent = () => {
        patchFile(file.uid, {
          chunkProgress: [...localChunks],
          percent: aggregatePercent(localChunks),
        });
      };

      const retryCount = new Map<number, number>();

      // 取下一个待传分片
      const pickNext = (): number | -1 => {
        for (let i = 0; i < total; i++) {
          if (localChunks[i].status === 'pending') return i;
        }
        return -1;
      };

      const uploadOne = async (idx: number): Promise<void> => {
        localChunks[idx] = { ...localChunks[idx], status: 'uploading', loaded: 0 };
        flushPercent();

        try {
          await customRequest({
            file: raw,
            chunk: chunks[idx],
            chunkIndex: idx,
            totalChunks: total,
            fileUid: file.uid,
            signal: controller.signal,
            onProgress: (loaded) => {
              localChunks[idx] = {
                ...localChunks[idx],
                loaded: Math.min(loaded, localChunks[idx].total),
              };
              flushPercent();
            },
          });
          localChunks[idx] = {
            ...localChunks[idx],
            status: 'done',
            loaded: localChunks[idx].total,
          };
          doneSet.add(idx);
          flushPercent();
        } catch (e) {
          if (controller.signal.aborted) throw e; // 暂停 / 卸载, 抛出来由外层接住
          const tries = (retryCount.get(idx) ?? 0) + 1;
          retryCount.set(idx, tries);
          if (tries <= chunkRetry) {
            localChunks[idx] = { ...localChunks[idx], status: 'pending', loaded: 0 };
            flushPercent();
            return;
          }
          localChunks[idx] = { ...localChunks[idx], status: 'error' };
          flushPercent();
          throw e;
        }
      };

      // 并发 worker pool — 一次最多跑 chunkConcurrency 个
      const runPool = async () => {
        const workers: Promise<void>[] = [];
        const concurrency = chunkSize ? Math.max(1, chunkConcurrency) : 1;
        let activeError: unknown = null;
        const nextLoop = async () => {
          while (!activeError && !controller.signal.aborted) {
            const idx = pickNext();
            if (idx === -1) return;
            try {
              await uploadOne(idx);
            } catch (e) {
              activeError = e;
              return;
            }
          }
        };
        for (let i = 0; i < concurrency; i++) workers.push(nextLoop());
        await Promise.all(workers);
        if (activeError) throw activeError;
      };

      try {
        await runPool();

        if (controller.signal.aborted) return; // 暂停时直接退出, 状态已是 paused

        // 全部分片成功 — 通知合并
        if (mergeRequest) {
          await mergeRequest({
            file: raw,
            fileUid: file.uid,
            totalChunks: total,
            signal: controller.signal,
          });
        }
        patchFile(file.uid, { status: 'done', percent: 100 });
        // 成功后清理 doneChunks 释放 Set
        doneChunksRef.current.delete(file.uid);
      } catch (e: unknown) {
        if (controller.signal.aborted) return; // 用户暂停, 不算 error
        const msg = e instanceof Error ? e.message : String(e);
        patchFile(file.uid, { status: 'error', error: msg });
      } finally {
        controllersRef.current.delete(file.uid);
      }
    },
    [chunkConcurrency, chunkRetry, chunkSize, customRequest, mergeRequest, patchFile],
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      if (disabled) return;
      const arr = Array.from(files);
      const queued: UploadFile[] = [];
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
          const next = [...listRef.current, errFile];
          listRef.current = next;
          setListSafe(next, errFile);
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
          status: customRequest ? 'uploading' : 'done',
          url: URL.createObjectURL(f),
          raw: f,
          percent: customRequest ? 0 : undefined,
        };
        const next = [...listRef.current, item];
        listRef.current = next;
        setListSafe(next, item);
        if (customRequest) queued.push(item);
      }
      // 选完文件再统一启动上传, 一份新 list 已 commit 给 setListSafe
      queued.forEach((it) => runUpload(it));
      // reset input value 让同名文件再次选中能触发
      if (inputRef.current) inputRef.current.value = '';
    },
    [beforeUpload, customRequest, disabled, maxSize, runUpload, setListSafe],
  );

  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleRemove = async (file: UploadFile) => {
    const ret = onRemove?.(file);
    const allow = ret instanceof Promise ? await ret : ret;
    if (allow === false) return;
    // 移除时如果还在上传, abort
    const ctrl = controllersRef.current.get(file.uid);
    if (ctrl) {
      ctrl.abort();
      controllersRef.current.delete(file.uid);
    }
    doneChunksRef.current.delete(file.uid);
    const next = listRef.current.filter((f) => f.uid !== file.uid);
    listRef.current = next;
    setListSafe(next, { ...file, status: 'removed' });
  };

  /** 暂停: abort + 标记 paused, 已成功的分片保留 */
  const handlePause = (file: UploadFile) => {
    const ctrl = controllersRef.current.get(file.uid);
    if (ctrl) ctrl.abort();
    controllersRef.current.delete(file.uid);
    patchFile(file.uid, { status: 'paused', paused: true });
  };

  /** 恢复: 从未成功的分片继续 */
  const handleResume = (file: UploadFile) => {
    const cur = listRef.current.find((f) => f.uid === file.uid);
    if (cur) runUpload(cur);
  };

  /** 失败重试: 清掉 doneChunks 重新跑 (或者保留 doneChunks 只重试 error 片) */
  const handleRetry = (file: UploadFile) => {
    const cur = listRef.current.find((f) => f.uid === file.uid);
    if (cur) runUpload(cur);
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
          {list.map((f) => {
            const isUploading = f.status === 'uploading';
            const isPaused = f.status === 'paused';
            const isError = f.status === 'error';
            const showProgress = (isUploading || isPaused) && typeof f.percent === 'number';
            const isChunked = !!f.chunkProgress && f.chunkProgress.length > 1;
            return (
              <div key={f.uid} className={`au-upload__item is-${f.status ?? 'done'}`}>
                {(listType === 'picture' || listType === 'card') && f.url && (
                  <img src={f.url} alt={f.name} className="au-upload__thumb" loading="lazy" decoding="async" />
                )}
                <div className="au-upload__meta">
                  <div className="au-upload__name" title={f.name}>{f.name}</div>
                  <div className="au-upload__sub">
                    {formatSize(f.size)}
                    {showProgress && <span> · {f.percent}%</span>}
                    {isChunked && (isUploading || isPaused) && (
                      <span> · {f.chunkProgress!.filter((c) => c.status === 'done').length}/{f.chunkProgress!.length} 片</span>
                    )}
                    {f.error && <span className="au-upload__error"> · {f.error}</span>}
                  </div>
                  {showProgress && (
                    <div className={`au-upload__progress${isPaused ? ' is-paused' : ''}`}>
                      <div className="au-upload__progress-bar" style={{ width: `${f.percent}%` }} />
                    </div>
                  )}
                </div>
                <div className="au-upload__actions">
                  {isUploading && customRequest && (
                    <button
                      type="button"
                      className="au-upload__action"
                      onClick={() => handlePause(f)}
                      aria-label="暂停"
                      title="暂停"
                    >
                      ⏸
                    </button>
                  )}
                  {isPaused && (
                    <button
                      type="button"
                      className="au-upload__action"
                      onClick={() => handleResume(f)}
                      aria-label="继续"
                      title="继续"
                    >
                      ▶
                    </button>
                  )}
                  {isError && customRequest && f.raw && (
                    <button
                      type="button"
                      className="au-upload__action"
                      onClick={() => handleRetry(f)}
                      aria-label="重试"
                      title="重试"
                    >
                      ↻
                    </button>
                  )}
                  <button
                    type="button"
                    className="au-upload__remove"
                    onClick={() => handleRemove(f)}
                    aria-label="移除"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/** 把每片的 loaded/total 加起来算整文件 percent (取整) */
function aggregatePercent(chunks: UploadChunkState[]): number {
  if (chunks.length === 0) return 0;
  let loaded = 0;
  let total = 0;
  for (const c of chunks) {
    loaded += c.loaded;
    total += c.total;
  }
  if (total === 0) return 0;
  return Math.min(99, Math.round((loaded / total) * 100));
}

export default Upload;
