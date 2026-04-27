import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import {
  REGISTRY,
  CATEGORIES,
  META_STYLE_FIELDS,
  getSchema,
  toJson,
  wrapAsComponent,
  applyMetaToProps,
  removeBlockById,
  insertBlock,
  updateBlockProps,
  findBlockById,
  findBlockLocation,
  resolveSlots,
  type BlockConfig,
  type BlockSchema,
  type FieldSchema,
  type BlockCategory,
} from './registry';
import './PageBuilder.css';

export interface PageBuilderProps {
  defaultBlocks?: BlockConfig[];
  minCanvasHeight?: number;
  componentName?: string;
  hideTypes?: string[];
  className?: string;
  style?: React.CSSProperties;
  onChange?: (blocks: BlockConfig[]) => void;
}

let idSeed = 0;
const uid = () => `b-${Date.now().toString(36)}-${(++idSeed).toString(36)}`;

interface DragPayload {
  kind: 'new' | 'move';
  type?: string;
  id?: string;
}

const orientationOf = (containerType: string | null): 'vertical' | 'horizontal' =>
  containerType === 'Row' ? 'horizontal' : 'vertical';

/** localStorage 键: 按组件名隔离, 换 componentName 就是独立草稿 */
const storageKey = (componentName: string) => `aurora-pb-workspace-v1:${componentName}`;

/** 过滤非法文件名字符 (各平台都不能: \/:*?"<>|) + 去掉 jsx/tsx 后缀 */
const sanitizeFileName = (raw: string, fallback: string): string => {
  const cleaned = raw
    .trim()
    .replace(/\.[jt]sx?$/i, '')
    .replace(/[\\/:*?"<>|]/g, '_')
    .trim();
  return cleaned || fallback;
};

/** 把生成的代码塞进一个 .jsx 文件给用户下载 */
const downloadJsxFile = (code: string, fileName: string) => {
  if (typeof window === 'undefined') return;
  const blob = new Blob([code], { type: 'text/jsx;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.jsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const loadSaved = (componentName: string): BlockConfig[] | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey(componentName));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.blocks)) return parsed.blocks as BlockConfig[];
  } catch {
    /* ignore */
  }
  return null;
};

const PageBuilder: React.FC<PageBuilderProps> = ({
  defaultBlocks = [],
  minCanvasHeight = 820,
  componentName = 'GeneratedPage',
  hideTypes,
  className = '',
  style,
  onChange,
}) => {
  const [blocks, setBlocks] = useState<BlockConfig[]>(
    () => loadSaved(componentName) ?? defaultBlocks,
  );
  const [savedTick, setSavedTick] = useState(0); // 触发"已保存"提示闪烁
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [showCode, setShowCode] = useState(false);

  // 13" MacBook 虚拟视口 (1280 逻辑像素宽), 用 CSS zoom 等比缩到可用宽度
  // 相比 transform: scale, zoom 会实际改变 layout 尺寸, 不需要额外预留高度, 拖放命中也更稳
  const VIRTUAL_W = 1280;
  const wrapRef = useRef<HTMLDivElement>(null);
  const macRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  // 中间面板实际渲染高度 — 用于让左右侧栏高度跟中间一致
  const [midHeight, setMidHeight] = useState<number | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const update = () => {
      const wrapW = wrap.clientWidth;
      setScale(Math.min(1, wrapW / VIRTUAL_W));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const mac = macRef.current;
    if (!mac) return;
    const update = () => setMidHeight(mac.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(mac);
    return () => ro.disconnect();
  }, []);

  // 自动保存 — blocks 或 componentName 变了就写 localStorage (500ms debounce)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(
          storageKey(componentName),
          JSON.stringify({ blocks, savedAt: Date.now() }),
        );
        setSavedTick((n) => n + 1);
      } catch {
        /* 空间满 / 隐私模式 — 静默 */
      }
    }, 500);
    return () => clearTimeout(t);
  }, [blocks, componentName]);

  const [copied, setCopied] = useState<'jsx' | 'json' | null>(null);
  // 下载文件名 Modal
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [downloadName, setDownloadName] = useState('');
  /** drop indicator: "containerId|slot|index" — uniquely identifies an insertion point */
  const [dropIndicator, setDropIndicator] = useState<{ key: string; index: number } | null>(null);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [collapsedCats, setCollapsedCats] = useState<Set<BlockCategory>>(new Set());

  const palette = useMemo(
    () => (hideTypes ? REGISTRY.filter((r) => !hideTypes.includes(r.type)) : REGISTRY),
    [hideTypes],
  );
  const filteredPalette = useMemo(() => {
    if (!paletteQuery.trim()) return palette;
    const q = paletteQuery.trim().toLowerCase();
    return palette.filter(
      (s) => s.type.toLowerCase().includes(q) || s.label.toLowerCase().includes(q),
    );
  }, [palette, paletteQuery]);
  const groupedPalette = useMemo(() => {
    const groups = new Map<BlockCategory, BlockSchema[]>();
    for (const s of filteredPalette) {
      const list = groups.get(s.category) ?? [];
      list.push(s);
      groups.set(s.category, list);
    }
    return CATEGORIES.map((cat) => ({ cat, items: groups.get(cat) ?? [] })).filter(
      (g) => g.items.length > 0,
    );
  }, [filteredPalette]);
  const toggleCat = (cat: BlockCategory) => {
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const emit = useCallback(
    (next: BlockConfig[]) => {
      setBlocks(next);
      onChange?.(next);
    },
    [onChange],
  );

  const selected = selectedId ? findBlockById(blocks, selectedId) : null;
  const selectedSchema = selected ? getSchema(selected.type) : null;

  /* ---------- drag/drop ---------- */

  const setDataTransfer = (e: React.DragEvent, payload: DragPayload) => {
    e.dataTransfer.setData('application/x-au-block', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copyMove';
  };
  const readPayload = (e: React.DragEvent): DragPayload | null => {
    const raw = e.dataTransfer.getData('application/x-au-block');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as DragPayload;
    } catch {
      return null;
    }
  };

  const onDragOverBlock = (
    e: React.DragEvent,
    parentId: string | null,
    slotName: string,
    index: number,
    orientation: 'vertical' | 'horizontal',
    isContainer: boolean,
  ) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    // 容器块: 只在顶/底(或左/右)边缘 12px 内响应, 作为"调整容器前后顺序"的语义;
    // 内部 gap 区不改 indicator, 让 cell 级 dragover 继续生效, 避免 block/cell 交替闪烁
    if (isContainer) {
      const EDGE = 12;
      const inInterior =
        orientation === 'vertical'
          ? e.clientY > rect.top + EDGE && e.clientY < rect.bottom - EDGE
          : e.clientX > rect.left + EDGE && e.clientX < rect.right - EDGE;
      if (inInterior) {
        // 不 stopPropagation, 让内部 slot/cell 接住这次 dragover
        return;
      }
    }
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    const before =
      orientation === 'vertical'
        ? e.clientY < rect.top + rect.height / 2
        : e.clientX < rect.left + rect.width / 2;
    const idx = before ? index : index + 1;
    const nextKey = `${parentId ?? 'root'}|${slotName}|${idx}`;
    // 状态没变跳过 setState, 减少重渲染造成的闪烁
    setDropIndicator((prev) => (prev && prev.key === nextKey ? prev : { key: nextKey, index: idx }));
  };

  const onDragOverSlot = (
    e: React.DragEvent,
    parentId: string | null,
    slotName: string,
    childrenLen: number,
  ) => {
    e.preventDefault();
    // 阻止事件冒泡到上层 slot/block, 避免多层 dragover 互相覆盖导致闪烁
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    const prefix = `${parentId ?? 'root'}|${slotName}|`;
    const nextKey = `${prefix}${childrenLen}`;
    // 状态没变时不触发 setState, 避免不必要的重渲染
    setDropIndicator((prev) => {
      if (prev && prev.key.startsWith(prefix)) return prev;
      if (prev && prev.key === nextKey) return prev;
      return { key: nextKey, index: childrenLen };
    });
  };

  const onSlotLeave = (e: React.DragEvent) => {
    const related = e.relatedTarget as Node | null;
    if (related && (e.currentTarget as HTMLElement).contains(related)) return;
    // 离开 slot 时不自动清 indicator, 留给 drop 或 dragend
  };

  const handleDrop = (
    e: React.DragEvent,
    parentId: string | null,
    slotName: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const payload = readPayload(e);
    if (!payload) {
      setDropIndicator(null);
      return;
    }
    const childrenInSlot = parentId
      ? findBlockById(blocks, parentId)?.slots?.[slotName] ?? []
      : blocks;
    const prefix = `${parentId ?? 'root'}|${slotName}|`;
    const targetIndex =
      dropIndicator && dropIndicator.key.startsWith(prefix)
        ? dropIndicator.index
        : childrenInSlot.length;

    if (payload.kind === 'new' && payload.type) {
      const schema = getSchema(payload.type);
      if (!schema) {
        setDropIndicator(null);
        return;
      }
      const nb: BlockConfig = {
        id: uid(),
        type: schema.type,
        props: { ...schema.defaultProps },
      };
      if (schema.isContainer) {
        const slotNames = resolveSlots(schema, nb.props);
        nb.slots = Object.fromEntries(slotNames.map((n) => [n, []]));
      }
      emit(insertBlock(blocks, nb, parentId, slotName, targetIndex));
      setSelectedId(nb.id);
    } else if (payload.kind === 'move' && payload.id) {
      const moving = findBlockById(blocks, payload.id);
      if (!moving) {
        setDropIndicator(null);
        return;
      }
      // 禁止把容器拖进自己的任意子孙
      if (parentId && (moving.id === parentId || isDescendant(moving, parentId))) {
        setDropIndicator(null);
        return;
      }
      const src = findBlockLocation(blocks, moving.id);
      let adjusted = targetIndex;
      if (
        src &&
        src.parentId === parentId &&
        src.slotName === slotName &&
        src.index < targetIndex
      ) {
        adjusted = targetIndex - 1;
      }
      emit(
        insertBlock(
          removeBlockById(blocks, moving.id),
          moving,
          parentId,
          slotName,
          adjusted,
        ),
      );
    }
    setDropIndicator(null);
  };

  const isDescendant = (ancestor: BlockConfig, id: string): boolean => {
    if (!ancestor.slots) return false;
    for (const children of Object.values(ancestor.slots)) {
      for (const c of children) {
        if (c.id === id) return true;
        if (isDescendant(c, id)) return true;
      }
    }
    return false;
  };

  /* ---------- block ops ---------- */

  const deleteBlock = (id: string) => {
    emit(removeBlockById(blocks, id));
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateBlock = (id: string) => {
    const src = findBlockById(blocks, id);
    const loc = findBlockLocation(blocks, id);
    if (!src || !loc) return;
    const clone = (b: BlockConfig): BlockConfig => ({
      id: uid(),
      type: b.type,
      props: { ...b.props },
      slots: b.slots
        ? Object.fromEntries(Object.entries(b.slots).map(([k, v]) => [k, v.map(clone)]))
        : undefined,
    });
    const copy = clone(src);
    emit(insertBlock(blocks, copy, loc.parentId, loc.slotName, loc.index + 1));
    setSelectedId(copy.id);
  };

  const moveBlock = (id: string, dir: -1 | 1) => {
    const loc = findBlockLocation(blocks, id);
    if (!loc) return;
    const src = findBlockById(blocks, id);
    if (!src) return;
    const containerChildren = loc.parentId
      ? findBlockById(blocks, loc.parentId)?.slots?.[loc.slotName] ?? []
      : blocks;
    const newIdx = loc.index + dir;
    if (newIdx < 0 || newIdx >= containerChildren.length) return;
    emit(insertBlock(removeBlockById(blocks, id), src, loc.parentId, loc.slotName, newIdx));
  };

  const updateProp = (key: string, value: unknown) => {
    if (!selected) return;
    emit(updateBlockProps(blocks, selected.id, { ...selected.props, [key]: value }));
  };

  const clearAll = () => {
    emit([]);
    setSelectedId(null);
  };

  /* ---------- copy ---------- */

  const jsxCode = useMemo(
    () => wrapAsComponent(blocks, componentName),
    [blocks, componentName],
  );
  const jsonCode = useMemo(() => toJson(blocks), [blocks]);

  const copy = async (text: string, tag: 'jsx' | 'json') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(tag);
      setTimeout(() => setCopied(null), 1400);
    } catch {
      /* ignore */
    }
  };

  /* ---------- recursive renderers ---------- */

  const renderBlock = (
    b: BlockConfig,
    parentId: string | null,
    slotName: string,
    index: number,
    orientation: 'vertical' | 'horizontal',
  ): React.ReactNode => {
    const schema = getSchema(b.type);
    if (!schema) return null;
    const Node = schema.component;
    const indicatorPrefix = `${parentId ?? 'root'}|${slotName}|`;
    const showBefore = dropIndicator?.key === `${indicatorPrefix}${index}` && !preview;

    const isSel = selectedId === b.id;
    const cls = [
      'au-pb__block',
      isSel ? 'is-selected' : '',
      schema.isContainer ? 'is-container' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const leafProps = (() => {
      // 先抽通用 meta props 注入 style, 再走组件自定义 transformProps
      const base = applyMetaToProps(filterProps(b.props));
      return schema.transformProps ? schema.transformProps(base) : base;
    })();
    const containerNode = schema.isContainer ? (
      <Node {...buildContainerProps(b, schema, renderBlock, preview)} />
    ) : (
      <div className="au-pb__block-preview" style={schema.previewWrapperStyle}>
        <Node {...leafProps}>{b.props.children as React.ReactNode}</Node>
      </div>
    );

    return (
      <React.Fragment key={b.id}>
        {showBefore && (
          <div
            className={[
              'au-pb__drop-line',
              orientation === 'horizontal' ? 'au-pb__drop-line--v' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        )}
        <div
          className={cls}
          data-type={b.type}
          draggable={!preview}
          onDragStart={(e) => {
            e.stopPropagation();
            setDataTransfer(e, { kind: 'move', id: b.id });
          }}
          onDragOver={(e) =>
            onDragOverBlock(e, parentId, slotName, index, orientation, !!schema.isContainer)
          }
          onClick={(e) => {
            e.stopPropagation();
            setSelectedId(b.id);
          }}
        >
          {!preview && (
            <div className="au-pb__block-toolbar" title={schema.label}>
              <div className="au-pb__block-actions">
                <button type="button" title="上移" onClick={(e) => { e.stopPropagation(); moveBlock(b.id, -1); }}>↑</button>
                <button type="button" title="下移" onClick={(e) => { e.stopPropagation(); moveBlock(b.id, 1); }}>↓</button>
                <button type="button" title="复制" onClick={(e) => { e.stopPropagation(); duplicateBlock(b.id); }}>⎘</button>
                <button type="button" title="删除" className="is-danger" onClick={(e) => { e.stopPropagation(); deleteBlock(b.id); }}>✕</button>
              </div>
            </div>
          )}
          <BlockErrorBoundary type={b.type}>{containerNode}</BlockErrorBoundary>
        </div>
      </React.Fragment>
    );
  };

  /** slot wrapper — 根画布或任何容器的插槽都走这个,接住 drop 事件 */
  const renderSlot = (
    parentId: string | null,
    slotName: string,
    slotLabel: string | undefined,
    children: BlockConfig[],
    orientation: 'vertical' | 'horizontal',
    extraClassName = '',
  ): React.ReactNode => {
    const isEmpty = children.length === 0;
    const prefix = `${parentId ?? 'root'}|${slotName}|`;
    const showTail =
      dropIndicator?.key === `${prefix}${children.length}` && !preview && !isEmpty;
    return (
      <div
        className={[
          'au-pb__slot',
          orientation === 'horizontal' ? 'au-pb__slot--row' : '',
          isEmpty ? 'is-empty' : '',
          preview ? 'is-preview' : '',
          extraClassName,
        ]
          .filter(Boolean)
          .join(' ')}
        onDragOver={(e) => onDragOverSlot(e, parentId, slotName, children.length)}
        onDragLeave={onSlotLeave}
        onDrop={(e) => handleDrop(e, parentId, slotName)}
      >
        {isEmpty && !preview && (
          <div className="au-pb__slot-empty">
            拖组件{slotLabel ? ` 到「${slotLabel}」` : '到此'}
          </div>
        )}
        {children.map((c, i) =>
          renderBlock(c, parentId, slotName, i, orientation),
        )}
        {showTail && (
          <div
            className={[
              'au-pb__drop-line',
              orientation === 'horizontal' ? 'au-pb__drop-line--v' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        )}
      </div>
    );
  };

  /** 为容器组件构建 props,把各 slot 的子块渲染塞回去 */
  const buildContainerProps = (
    b: BlockConfig,
    schema: BlockSchema,
    _renderBlock: typeof renderBlock,
    _preview: boolean,
  ): Record<string, unknown> => {
    void _renderBlock;
    void _preview;
    const slotNames = resolveSlots(schema, b.props);
    // 容器块也支持通用 meta (_padding/_margin/_width/_height/_grow)
    const props = applyMetaToProps(filterProps(b.props));

    // Grid: 按 mode 走不同渲染路径
    if (b.type === 'Grid') {
      const mode = (b.props.mode as string) ?? 'fixed';
      if (mode === 'fixed') {
        delete props.minColWidth;
      } else {
        delete props.cols;
      }
      delete props.mode;

      if (mode === 'fixed') {
        // 每个 cell 是真实 drop 容器, 可独立拖组件进去
        const cellNodes = slotNames.map((name, i) => {
          const children = b.slots?.[name] ?? [];
          return (
            <div
              key={name}
              className={[
                'au-pb__grid-cell',
                children.length === 0 ? 'is-empty' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {renderSlot(
                b.id,
                name,
                `格 ${i + 1}`,
                children,
                // cell 内部是 flex-row-wrap, 用横向 orientation → drop-line 画成竖线
                // 避免横向 drop-line 挤压旁边的块导致抖动
                'horizontal',
                'au-pb__slot--cell',
              )}
            </div>
          );
        });
        props.children = cellNodes;
        return props;
      }

      // auto 模式: 单插槽 + CSS auto-fit 自动换行
      const children = b.slots?.default ?? [];
      props.children = renderSlot(b.id, 'default', undefined, children, 'horizontal');
      return props;
    }

    // 其他单 slot 容器 (Row / Flex / 默认)
    if (slotNames.length === 1 && slotNames[0] === 'default') {
      const children = b.slots?.default ?? [];
      let orient: 'vertical' | 'horizontal' = 'vertical';
      if (b.type === 'Row') orient = 'horizontal';
      else if (b.type === 'Flex') {
        const dir = (b.props.direction as string) ?? 'row';
        orient = dir === 'row' || dir === 'row-reverse' ? 'horizontal' : 'vertical';
      }
      props.children = renderSlot(b.id, 'default', undefined, children, orient);
      return props;
    }

    // 多 slot 容器 (Layout)
    for (const name of slotNames) {
      const children = b.slots?.[name] ?? [];
      const label = schema.slotLabels?.[name];
      props[name] = renderSlot(b.id, name, label, children, 'vertical', 'au-pb__slot--nested');
    }
    // Layout 特例: sider 有内容就按内容宽度撑开, 空时保留用户配的像素宽度
    if (b.type === 'Layout' && (b.slots?.sider?.length ?? 0) > 0) {
      props.siderWidth = 'auto';
    }
    // 容器也支持 transformProps (把 _minHeight / _width 之类注入 style)
    return schema.transformProps ? schema.transformProps(props) : props;
  };

  /* ---------- render ---------- */

  return (
    <div
      className={['au-pb', preview ? 'is-preview' : '', className].filter(Boolean).join(' ')}
      style={style}
    >
      <div className="au-pb__toolbar">
        <div className="au-pb__toolbar-left">
          <strong className="au-pb__brand">🧩 PageBuilder</strong>
          <span className="au-pb__count">{countBlocks(blocks)} 个组件</span>
          <span key={savedTick} className="au-pb__saved" title="已自动保存到本地">
            ✓ 已保存
          </span>
        </div>
        <div className="au-pb__toolbar-right">
          <button
            type="button"
            className="au-btn au-btn--default au-btn--small"
            onClick={() => {
              setPreview((v) => !v);
              setSelectedId(null);
            }}
          >
            {preview ? '退出预览' : '预览'}
          </button>
          <button
            type="button"
            className="au-btn au-btn--default au-btn--small"
            onClick={() => setShowCode((v) => !v)}
          >
            {showCode ? '隐藏代码' : '查看代码'}
          </button>
          <button
            type="button"
            className="au-btn au-btn--primary au-btn--small"
            onClick={() => copy(jsxCode, 'jsx')}
          >
            {copied === 'jsx' ? '✓ 已复制' : 'Copy JSX'}
          </button>
          <button
            type="button"
            className="au-btn au-btn--default au-btn--small"
            title="下载为 .jsx 文件"
            onClick={() => {
              setDownloadName(
                componentName.replace(/[^A-Za-z0-9_]/g, '') || 'GeneratedPage',
              );
              setDownloadOpen(true);
            }}
            disabled={blocks.length === 0}
          >
            ⬇ jsx
          </button>
          <button
            type="button"
            className="au-btn au-btn--default au-btn--small"
            onClick={() => copy(jsonCode, 'json')}
          >
            {copied === 'json' ? '✓ 已复制' : 'Copy JSON'}
          </button>
          <button
            type="button"
            className="au-btn au-btn--danger au-btn--small"
            disabled={blocks.length === 0}
            onClick={clearAll}
          >
            清空
          </button>
        </div>
      </div>

      <div className="au-pb__main">
        {!preview && (
          <aside
            className="au-pb__palette"
            style={midHeight ? { height: midHeight, maxHeight: midHeight, minHeight: 0 } : undefined}
          >
            <div className="au-pb__section-title">
              组件库 <span className="au-pb__count-mini">{palette.length}</span>
            </div>
            <input
              type="text"
              className="au-pb__palette-search"
              placeholder="搜索组件…"
              value={paletteQuery}
              onChange={(e) => setPaletteQuery(e.target.value)}
            />
            <div className="au-pb__palette-list">
              {groupedPalette.length === 0 ? (
                <div className="au-pb__palette-empty">无匹配组件</div>
              ) : (
                groupedPalette.map(({ cat, items }) => {
                  const isCollapsed = collapsedCats.has(cat) && !paletteQuery;
                  return (
                    <div key={cat} className="au-pb__palette-group">
                      <button
                        type="button"
                        className={[
                          'au-pb__palette-group-head',
                          isCollapsed ? 'is-collapsed' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => toggleCat(cat)}
                      >
                        <span className="au-pb__palette-caret">▾</span>
                        <span>{cat}</span>
                        <span className="au-pb__count-mini">{items.length}</span>
                      </button>
                      {!isCollapsed && (
                        <div className="au-pb__palette-group-items">
                          {items.map((s) => (
                            <PaletteItem
                              key={s.type}
                              schema={s}
                              onDragStart={(e, type) =>
                                setDataTransfer(e, { kind: 'new', type })
                              }
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <div className="au-pb__hint">拖到画布 / 容器插槽</div>
          </aside>
        )}

        <div
          className="au-pb__canvas-wrap"
          ref={wrapRef}
          onClick={() => setSelectedId(null)}
        >
          <div
            ref={macRef}
            className="au-pb__mac"
            style={{ zoom: scale }}
          >
            <div className="au-pb__mac-bar">
              <span className="au-pb__mac-lights" aria-hidden>
                <i className="au-pb__mac-light au-pb__mac-light--r" />
                <i className="au-pb__mac-light au-pb__mac-light--y" />
                <i className="au-pb__mac-light au-pb__mac-light--g" />
              </span>
              <span className="au-pb__mac-title">
                {preview ? 'Preview' : `${componentName}.tsx`}
                {scale < 1 && (
                  <span className="au-pb__mac-scale">· {Math.round(scale * 100)}%</span>
                )}
              </span>
              <span className="au-pb__mac-spacer" />
            </div>
            <div
              className={[
                'au-pb__canvas',
                blocks.length === 0 ? 'is-empty' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ minHeight: minCanvasHeight }}
            >
              {renderSlot(null, 'default', undefined, blocks, 'vertical', 'au-pb__slot--root')}
            </div>
          </div>

          {showCode && (
            <div className="au-pb__code">
              <div className="au-pb__code-head">
                <span>JSX 输出 · {componentName}.tsx</span>
                <button
                  type="button"
                  className="au-btn au-btn--ghost au-btn--small"
                  onClick={() => copy(jsxCode, 'jsx')}
                >
                  {copied === 'jsx' ? '✓ 已复制' : 'Copy'}
                </button>
              </div>
              <CodeView
                value={jsxCode}
                language="tsx"
                badge="TSX"
                readOnly
                wrap
                height={420}
              />
            </div>
          )}
        </div>

        {!preview && (
          <aside
            className="au-pb__props"
            style={midHeight ? { height: midHeight, maxHeight: midHeight, minHeight: 0 } : undefined}
          >
            <div className="au-pb__section-title">属性</div>
            {!selected ? (
              <div className="au-pb__props-empty">
                <div style={{ fontSize: 13.5, marginBottom: 6 }}>未选中任何组件</div>
                <div style={{ fontSize: 12, color: 'var(--au-text-3)' }}>
                  点击画布中的组件进行编辑
                </div>
              </div>
            ) : selectedSchema ? (
              <PropertyPanel
                key={selected.id}
                schema={selectedSchema}
                value={selected.props}
                onChange={updateProp}
              />
            ) : null}
          </aside>
        )}
      </div>

      {/* 下载 jsx 文件名 Modal */}
      <Modal
        open={downloadOpen}
        title="下载 JSX 文件"
        okText="下载"
        cancelText="取消"
        width={420}
        centered
        onCancel={() => setDownloadOpen(false)}
        onOk={() => {
          const fallback =
            componentName.replace(/[^A-Za-z0-9_]/g, '') || 'GeneratedPage';
          const safeName = sanitizeFileName(downloadName, fallback);
          downloadJsxFile(jsxCode, safeName);
          setDownloadOpen(false);
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label
            style={{
              fontSize: 13,
              color: 'var(--au-text-2)',
            }}
          >
            文件名
          </label>
          <Input
            value={downloadName}
            onChange={(e) => setDownloadName(e.target.value)}
            placeholder="不用带 .jsx 后缀"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const fallback =
                  componentName.replace(/[^A-Za-z0-9_]/g, '') || 'GeneratedPage';
                const safeName = sanitizeFileName(downloadName, fallback);
                downloadJsxFile(jsxCode, safeName);
                setDownloadOpen(false);
              }
            }}
            suffix={<span style={{ color: 'var(--au-text-3)' }}>.jsx</span>}
          />
          <div style={{ fontSize: 11.5, color: 'var(--au-text-3)' }}>
            非法字符 <code>\ / : * ? &quot; &lt; &gt; |</code> 会自动替换为 _
          </div>
        </div>
      </Modal>
    </div>
  );
};

/* ---------- Block error boundary ---------- */

interface BlockErrorProps {
  type: string;
  children: React.ReactNode;
}
interface BlockErrorState {
  error: Error | null;
}
class BlockErrorBoundary extends React.Component<BlockErrorProps, BlockErrorState> {
  state: BlockErrorState = { error: null };
  static getDerivedStateFromError(error: Error): BlockErrorState {
    return { error };
  }
  componentDidUpdate(prev: BlockErrorProps) {
    // 类型变了 (换了块) 或 props/children 引用变了 (用户改了配置) 自动清掉错误重试一次
    if (
      this.state.error &&
      (prev.type !== this.props.type || prev.children !== this.props.children)
    ) {
      this.setState({ error: null });
    }
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.warn('[PageBuilder] block render error:', this.props.type, error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="au-pb__block-error">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--au-danger)' }}>
              ⚠ {this.props.type} 渲染失败
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                this.setState({ error: null });
              }}
              style={{
                padding: '4px 12px',
                border: '1px solid var(--au-border)',
                borderRadius: 4,
                background: 'var(--au-bg)',
                color: 'var(--au-text-1)',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              重试渲染
            </button>
          </div>
          <div style={{ fontSize: 12, color: 'var(--au-text-3)', marginTop: 6, fontFamily: 'var(--au-mono)' }}>
            {this.state.error.message}
          </div>
          <div style={{ fontSize: 11, color: 'var(--au-text-3)', marginTop: 4 }}>
            改完属性后会自动重试,也可以点上面按钮强制重新渲染
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---------- Palette item ---------- */

const PaletteItem: React.FC<{
  schema: BlockSchema;
  onDragStart: (e: React.DragEvent, type: string) => void;
}> = ({ schema, onDragStart }) => {
  // label 可能是 "Button 按钮" / "输入框" / "KpiCard 指标卡" 等,
  // 拆成 英文 type code + 中文主名 两行显示, 更易扫
  const label = schema.label;
  const match = label.match(/^([A-Za-z][A-Za-z0-9.]*)\s+(.+)$/);
  const engName = match ? match[1] : null;
  const cnName = match ? match[2] : label;

  return (
    <div
      className={[
        'au-pb__palette-item',
        schema.isContainer ? 'is-container' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      draggable
      onDragStart={(e) => onDragStart(e, schema.type)}
      title={label}
    >
      <span className="au-pb__palette-icon">{schema.icon}</span>
      <span className="au-pb__palette-text">
        <span className="au-pb__palette-name">{cnName}</span>
        {engName && <span className="au-pb__palette-sub">{engName}</span>}
      </span>
      {schema.isContainer && (
        <span className="au-pb__palette-badge" title="可放置其他组件">
          ▦
        </span>
      )}
    </div>
  );
};

/* ---------- Property panel ---------- */

const PropertyPanel: React.FC<{
  schema: BlockSchema;
  value: Record<string, unknown>;
  onChange: (key: string, v: unknown) => void;
}> = ({ schema, value, onChange }) => {
  const visibleFields = schema.fields.filter(
    (f) => !f.visibleWhen || f.visibleWhen(value),
  );
  // FormItem.* 块已经用自己的 _width / _label 等元数据, 不追加通用 meta
  const hasOwnMeta = schema.type.startsWith('FormItem.') || schema.type === 'Menu' || schema.type === 'Layout';
  const [metaOpen, setMetaOpen] = useState(false);
  return (
    <div className="au-pb__form">
      <div className="au-pb__form-head">
        <span className="au-pb__form-icon">{schema.icon}</span>
        <span className="au-pb__form-title">{schema.label}</span>
      </div>
      {visibleFields.length === 0 && !hasOwnMeta && (
        <div className="au-pb__form-empty">此组件暂无可配属性</div>
      )}
      {visibleFields.map((f) => (
        <FieldRow key={f.key} field={f} value={value[f.key]} onChange={onChange} />
      ))}
      {!hasOwnMeta && (
        <div className="au-pb__meta-group">
          <button
            type="button"
            className={[
              'au-pb__meta-toggle',
              metaOpen ? 'is-open' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => setMetaOpen((v) => !v)}
          >
            <span className="au-pb__meta-caret">▾</span>
            <span>布局 / 间距</span>
            <span className="au-pb__meta-hint">padding · margin · width · height · flex</span>
          </button>
          {metaOpen && (
            <div className="au-pb__meta-fields">
              {META_STYLE_FIELDS.map((f) => (
                <FieldRow key={f.key} field={f} value={value[f.key]} onChange={onChange} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const FieldRow: React.FC<{
  field: FieldSchema;
  value: unknown;
  onChange: (key: string, v: unknown) => void;
}> = ({ field, value, onChange }) => (
  <label className="au-pb__field">
    <span className="au-pb__field-label">
      {field.label}
      {field.asChildren && <span className="au-pb__field-tag">children</span>}
    </span>
    <FieldControl field={field} value={value} onChange={(v) => onChange(field.key, v)} />
    {field.help && <span className="au-pb__field-help">{field.help}</span>}
  </label>
);

const FieldControl: React.FC<{
  field: FieldSchema;
  value: unknown;
  onChange: (v: unknown) => void;
}> = ({ field, value, onChange }) => {
  switch (field.type) {
    case 'text':
      return (
        <input
          className="au-pb__input"
          type="text"
          value={(value as string) ?? ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'textarea':
      return (
        <textarea
          className="au-pb__input au-pb__input--textarea"
          value={(value as string) ?? ''}
          placeholder={field.placeholder}
          rows={3}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'number':
      return (
        <input
          className="au-pb__input"
          type="number"
          value={value == null ? '' : String(value)}
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === '' ? undefined : Number(v));
          }}
        />
      );
    case 'boolean':
      return (
        <button
          type="button"
          className={['au-pb__switch', value ? 'is-on' : ''].filter(Boolean).join(' ')}
          onClick={() => onChange(!value)}
          aria-pressed={!!value}
        >
          <span className="au-pb__switch-thumb" />
        </button>
      );
    case 'select':
      return (
        <select
          className="au-pb__input"
          value={(value as string | number) ?? ''}
          onChange={(e) => {
            const raw = e.target.value;
            const match = field.options?.find((o) => String(o.value) === raw);
            onChange(match ? match.value : raw);
          }}
        >
          {field.options?.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case 'color':
      return (
        <div className="au-pb__color">
          <input
            type="color"
            value={
              typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : '#5b8def'
            }
            onChange={(e) => onChange(e.target.value)}
          />
          <input
            className="au-pb__input"
            type="text"
            value={(value as string) ?? ''}
            placeholder="任意 CSS 颜色"
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    case 'json':
      return <JsonField value={value} onChange={onChange} />;
  }
};

/** JSON 字段编辑器 — 本地维护文本状态, 合法时才提交 onChange */
/** 把 JSON 文本 token 化并染色 (用纯字符串拼 HTML, 通过 dangerouslySetInnerHTML 渲染) */
const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const highlightJson = (src: string): string => {
  const out: string[] = [];
  let i = 0;
  const n = src.length;
  while (i < n) {
    const ch = src[i];
    // 字符串字面量
    if (ch === '"') {
      let j = i + 1;
      while (j < n && src[j] !== '"') {
        if (src[j] === '\\' && j + 1 < n) j += 2;
        else j++;
      }
      j = Math.min(j + 1, n);
      const lit = src.slice(i, j);
      // 判断是不是对象 key: 后面第一个非空白字符是不是 ':'
      let k = j;
      while (k < n && /\s/.test(src[k])) k++;
      const isKey = src[k] === ':';
      out.push(
        `<span class="au-pb__jh-${isKey ? 'key' : 'str'}">${escapeHtml(lit)}</span>`,
      );
      i = j;
      continue;
    }
    // 数字 (负号 + 浮点 + 科学计数)
    const numMatch =
      (ch === '-' || (ch >= '0' && ch <= '9'))
        ? src.slice(i).match(/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/)
        : null;
    if (numMatch) {
      out.push(`<span class="au-pb__jh-num">${escapeHtml(numMatch[0])}</span>`);
      i += numMatch[0].length;
      continue;
    }
    // 关键字
    if (src.startsWith('true', i)) {
      out.push(`<span class="au-pb__jh-kw">true</span>`);
      i += 4;
      continue;
    }
    if (src.startsWith('false', i)) {
      out.push(`<span class="au-pb__jh-kw">false</span>`);
      i += 5;
      continue;
    }
    if (src.startsWith('null', i)) {
      out.push(`<span class="au-pb__jh-kw">null</span>`);
      i += 4;
      continue;
    }
    // 括号/冒号/逗号
    if (ch === '{' || ch === '}' || ch === '[' || ch === ']' || ch === ',' || ch === ':') {
      out.push(`<span class="au-pb__jh-punct">${ch}</span>`);
      i++;
      continue;
    }
    // 普通字符 (空白, 换行等)
    out.push(escapeHtml(ch));
    i++;
  }
  return out.join('');
};

/** TSX / JSX 高亮器 — 足够 PageBuilder 生成代码用, 不追求完整 JS 解析 */
const JS_KEYWORDS = new Set([
  'import', 'export', 'default', 'from', 'const', 'let', 'var',
  'function', 'return', 'if', 'else', 'as', 'await', 'async',
  'true', 'false', 'null', 'undefined',
]);

const isAlpha = (c: string) => /[A-Za-z_$]/.test(c);
const isAlphaNum = (c: string) => /[A-Za-z0-9_$]/.test(c);

const highlightTsx = (src: string): string => {
  const out: string[] = [];
  let i = 0;
  const n = src.length;
  let inTag = false; // 是否在 <Tag ...> 或 </Tag> 里
  const push = (cls: string, s: string) =>
    out.push(`<span class="au-pb__ch-${cls}">${escapeHtml(s)}</span>`);

  while (i < n) {
    const ch = src[i];
    const ch2 = src[i + 1];
    const ch3 = src[i + 2];

    // JSX 注释 {/* ... */}
    if (ch === '{' && ch2 === '/' && ch3 === '*') {
      const end = src.indexOf('*/}', i + 3);
      const stop = end === -1 ? n : end + 3;
      push('cmt', src.slice(i, stop));
      i = stop;
      continue;
    }
    // 块注释 /* ... */
    if (ch === '/' && ch2 === '*') {
      const end = src.indexOf('*/', i + 2);
      const stop = end === -1 ? n : end + 2;
      push('cmt', src.slice(i, stop));
      i = stop;
      continue;
    }
    // 行注释 // ...
    if (ch === '/' && ch2 === '/') {
      const end = src.indexOf('\n', i);
      const stop = end === -1 ? n : end;
      push('cmt', src.slice(i, stop));
      i = stop;
      continue;
    }
    // 字符串 / 模板字符串
    if (ch === '"' || ch === "'" || ch === '`') {
      let j = i + 1;
      while (j < n && src[j] !== ch) {
        if (src[j] === '\\' && j + 1 < n) j += 2;
        else j++;
      }
      j = Math.min(j + 1, n);
      push('str', src.slice(i, j));
      i = j;
      continue;
    }
    // 标签开始 <Name 或 </Name
    if (ch === '<' && (isAlpha(ch2) || ch2 === '/')) {
      let j = i + 1;
      if (src[j] === '/') j++;
      push('punct', src.slice(i, j));
      const ns = j;
      while (j < n && /[A-Za-z0-9_$.]/.test(src[j])) j++;
      if (j > ns) push('tag', src.slice(ns, j));
      i = j;
      inTag = true;
      continue;
    }
    // Fragment: <> 或 </>
    if (ch === '<' && (ch2 === '>' || (ch2 === '/' && ch3 === '>'))) {
      const len = ch2 === '/' ? 3 : 2;
      push('tag', src.slice(i, i + len));
      i += len;
      continue;
    }
    // 标签闭合 > 或 />
    if (inTag && (ch === '>' || (ch === '/' && ch2 === '>'))) {
      const len = ch === '/' ? 2 : 1;
      push('punct', src.slice(i, i + len));
      i += len;
      inTag = false;
      continue;
    }
    // 数字
    if (/[0-9]/.test(ch) || (ch === '-' && /[0-9]/.test(ch2))) {
      const m = src.slice(i).match(/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/);
      if (m) {
        push('num', m[0]);
        i += m[0].length;
        continue;
      }
    }
    // 标识符 / 关键字 / 属性名
    if (isAlpha(ch)) {
      let j = i + 1;
      while (j < n && isAlphaNum(src[j])) j++;
      const word = src.slice(i, j);
      if (inTag && src[j] === '=') push('attr', word);
      else if (JS_KEYWORDS.has(word)) push('kw', word);
      else if (/^[A-Z]/.test(word)) push('ident-cap', word); // 组件名 / 类名
      else out.push(escapeHtml(word));
      i = j;
      continue;
    }
    // 括号/等号/逗号等基础标点
    if ('{}[]()=,;:.'.includes(ch)) {
      push('punct', ch);
      i++;
      continue;
    }
    // 其他
    out.push(escapeHtml(ch));
    i++;
  }
  return out.join('');
};

/**
 * 通用代码编辑器 — JSON / TSX 共用 UI (行号 + 高亮 + 可编辑 + 格式化)
 * value 外部变了(blocks 改了)会同步回 text, 否则用户的就地编辑保留
 * onTextChange: 编辑器文本变了就回传, 父层可以用它跑 Copy / 下载等动作
 */
const CodeView: React.FC<{
  value: string;
  language: 'tsx' | 'json';
  onFormat?: () => string;
  onTextChange?: (text: string) => void;
  badge?: string;
  height?: number;
  /** 只读模式: 禁用手改, 无格式化按钮 */
  readOnly?: boolean;
  /** 长行自动换行 (默认 false, 横向滚动) */
  wrap?: boolean;
}> = ({ value, language, onFormat, onTextChange, badge, height, readOnly, wrap }) => {
  const [text, setText] = useState(value);
  const [focused, setFocused] = useState(false);
  const lastValueRef = useRef(value);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== lastValueRef.current) {
      lastValueRef.current = value;
      setText(value);
      onTextChange?.(value);
    }
  }, [value, onTextChange]);

  const updateText = (t: string) => {
    setText(t);
    onTextChange?.(t);
  };

  const syncScroll = () => {
    const ta = taRef.current;
    if (!ta) return;
    if (preRef.current) {
      preRef.current.scrollTop = ta.scrollTop;
      preRef.current.scrollLeft = ta.scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = ta.scrollTop;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = text.slice(0, start) + '  ' + text.slice(end);
      updateText(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  };

  const format = () => {
    if (!onFormat) return;
    const fresh = onFormat();
    updateText(fresh);
    lastValueRef.current = fresh;
  };

  const lineCount = Math.max(1, text.split('\n').length);
  const highlighted = (language === 'tsx' ? highlightTsx(text) : highlightJson(text)) + '\n';

  return (
    <div className="au-pb__json">
      <div
        className={['au-pb__json-frame', focused ? 'is-focused' : '']
          .filter(Boolean)
          .join(' ')}
        style={height ? { height } : undefined}
      >
        <div className="au-pb__json-toolbar">
          <span className="au-pb__json-badge">{badge ?? language.toUpperCase()}</span>
          <span className="au-pb__json-meta">
            {lineCount} 行 · {text.length} 字
          </span>
          <span className="au-pb__json-spacer" />
          {onFormat && (
            <button
              type="button"
              className="au-pb__json-btn"
              title="从当前画布重新生成并格式化"
              onClick={format}
            >
              格式化
            </button>
          )}
        </div>
        <div className="au-pb__json-body" style={height ? { maxHeight: height - 30 } : undefined}>
          <div ref={gutterRef} className="au-pb__json-gutter" aria-hidden>
            {Array.from({ length: lineCount }, (_, i) => (
              <span key={i} className="au-pb__json-gutter-line">
                {i + 1}
              </span>
            ))}
          </div>
          <div className="au-pb__json-edit">
            <pre
              ref={preRef}
              className={['au-pb__json-hl', wrap ? 'is-wrap' : ''].filter(Boolean).join(' ')}
              aria-hidden
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
            <textarea
              ref={taRef}
              className={['au-pb__json-ta', wrap ? 'is-wrap' : ''].filter(Boolean).join(' ')}
              value={text}
              spellCheck={false}
              wrap={wrap ? 'soft' : 'off'}
              readOnly={readOnly}
              onChange={(e) => updateText(e.target.value)}
              onScroll={syncScroll}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/** JSON 字段编辑器 — 带行号 + 语法高亮 + 格式化按钮, 合法时才提交 onChange */
const JsonField: React.FC<{
  value: unknown;
  onChange: (v: unknown) => void;
}> = ({ value, onChange }) => {
  const serialize = (v: unknown) => {
    try {
      return v === undefined ? '' : JSON.stringify(v, null, 2);
    } catch {
      return '';
    }
  };
  const [text, setText] = useState(() => serialize(value));
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const lastValueRef = useRef(value);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== lastValueRef.current) {
      lastValueRef.current = value;
      setText(serialize(value));
      setError(null);
    }
  }, [value]);

  const commit = (t: string) => {
    setText(t);
    if (t.trim() === '') {
      setError(null);
      onChange(undefined);
      lastValueRef.current = undefined;
      return;
    }
    try {
      const parsed = JSON.parse(t);
      setError(null);
      onChange(parsed);
      lastValueRef.current = parsed;
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const syncScroll = () => {
    const ta = taRef.current;
    if (!ta) return;
    if (preRef.current) {
      preRef.current.scrollTop = ta.scrollTop;
      preRef.current.scrollLeft = ta.scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = ta.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab 缩进 2 空格, 不切换焦点
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = text.slice(0, start) + '  ' + text.slice(end);
      commit(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  };

  const format = () => {
    try {
      const parsed = text.trim() === '' ? undefined : JSON.parse(text);
      const pretty = serialize(parsed);
      commit(pretty);
    } catch {
      /* 保留原 error 状态, 不动 */
    }
  };

  const lineCount = Math.max(1, text.split('\n').length);
  const highlighted = highlightJson(text) + '\n'; // 结尾多一行防最后一行被裁

  return (
    <div className="au-pb__json">
      <div
        className={['au-pb__json-frame', focused ? 'is-focused' : '', error ? 'is-error' : '']
          .filter(Boolean)
          .join(' ')}
      >
        <div className="au-pb__json-toolbar">
          <span className="au-pb__json-badge">JSON</span>
          <span className="au-pb__json-meta">
            {lineCount} 行 · {text.length} 字
          </span>
          <span className="au-pb__json-spacer" />
          <button
            type="button"
            className="au-pb__json-btn"
            title="格式化 / Prettify"
            onClick={format}
            disabled={!!error || text.trim() === ''}
          >
            格式化
          </button>
        </div>
        <div className="au-pb__json-body">
          <div ref={gutterRef} className="au-pb__json-gutter" aria-hidden>
            {Array.from({ length: lineCount }, (_, i) => (
              <span key={i} className="au-pb__json-gutter-line">
                {i + 1}
              </span>
            ))}
          </div>
          <div className="au-pb__json-edit">
            <pre
              ref={preRef}
              className="au-pb__json-hl"
              aria-hidden
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
            <textarea
              ref={taRef}
              className="au-pb__json-ta"
              value={text}
              spellCheck={false}
              wrap="off"
              onChange={(e) => commit(e.target.value)}
              onScroll={syncScroll}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </div>
        </div>
      </div>
      {error && <div className="au-pb__json-error">⚠ {error}</div>}
    </div>
  );
};

const filterProps = (props: Record<string, unknown>): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) {
    if (k === 'children') continue;
    if (v === undefined || v === '' || v === null) continue;
    out[k] = v;
  }
  return out;
};

const countBlocks = (blocks: BlockConfig[]): number => {
  let n = 0;
  const walk = (arr: BlockConfig[]) => {
    for (const b of arr) {
      n++;
      if (b.slots) {
        for (const children of Object.values(b.slots)) walk(children);
      }
    }
  };
  walk(blocks);
  return n;
};

export default PageBuilder;
