import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Icon from '../../components/Icon';
import Dropdown from '../../components/Dropdown';
import { iconfontNames } from '../../data/iconfontNames';
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
import { SECTION_TEMPLATES, getSectionTemplate, materializeSection } from './sections';
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
  kind: 'new' | 'move' | 'section';
  type?: string;
  id?: string;
  sectionKey?: string;
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

  // 虚拟视口宽度 — 默认 1280 (13" MacBook 主流), 可切到其他断点 (768/1024/1280/1440/1920)
  // 用 CSS zoom 等比缩到可用宽度. 相比 transform: scale, zoom 会真实改变 layout 尺寸, 拖放命中更稳
  const [virtualWidth, setVirtualWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return 1280;
    const saved = Number(localStorage.getItem('aurora-pb-virtual-width'));
    return [768, 1024, 1280, 1440, 1920].includes(saved) ? saved : 1280;
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('aurora-pb-virtual-width', String(virtualWidth));
  }, [virtualWidth]);
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
      setScale(Math.min(1, wrapW / virtualWidth));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [virtualWidth]);

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
  /** 当前 hover 的目标 slot — 给整个 slot 加高亮, 让用户清晰看到块会落进哪个父容器 */
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  /** 大纲面板悬停的块 id — 用于让画布对应块同步亮起来 */
  const [outlineHoveredId, setOutlineHoveredId] = useState<string | null>(null);
  /** 当前正在被拖动的块 id — 用于源块半透明视觉反馈 */
  const [draggingId, setDraggingId] = useState<string | null>(null);
  /** 右键菜单状态 — null 时不显示 */
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; blockId: string } | null>(null);
  /** hover 600ms 后的路径提示 */
  const [pathTooltip, setPathTooltip] = useState<{ x: number; y: number; blockId: string } | null>(null);
  const tooltipTimerRef = useRef<number | null>(null);

  // 操作反馈 toast (Cmd+C/V, 拖入新块等)
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const toastIdRef = useRef(0);
  const showToast = useCallback((msg: string) => {
    const id = ++toastIdRef.current;
    setToasts((arr) => [...arr, { id, msg }]);
    window.setTimeout(() => {
      setToasts((arr) => arr.filter((t) => t.id !== id));
    }, 2000);
  }, []);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [collapsedCats, setCollapsedCats] = useState<Set<BlockCategory>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = localStorage.getItem('aurora-pb-collapsed-cats');
      if (!raw) return new Set();
      const arr = JSON.parse(raw);
      return new Set(Array.isArray(arr) ? (arr as BlockCategory[]) : []);
    } catch {
      return new Set();
    }
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(
      'aurora-pb-collapsed-cats',
      JSON.stringify(Array.from(collapsedCats)),
    );
  }, [collapsedCats]);
  // 全屏 + 侧栏折叠状态 — 折叠状态写 localStorage 持久化, 下次打开记住
  const [fullscreen, setFullscreen] = useState(false);
  const [paletteCollapsed, setPaletteCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('aurora-pb-palette-collapsed') === '1';
  });
  const [propsCollapsed, setPropsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('aurora-pb-props-collapsed') === '1';
  });
  // palette aside 内部 tab — components(组件库) / outline(大纲)
  const [paletteTab, setPaletteTab] = useState<'components' | 'outline'>(() => {
    if (typeof window === 'undefined') return 'components';
    const saved = localStorage.getItem('aurora-pb-palette-tab');
    return saved === 'outline' ? 'outline' : 'components';
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('aurora-pb-palette-tab', paletteTab);
  }, [paletteTab]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('aurora-pb-palette-collapsed', paletteCollapsed ? '1' : '0');
  }, [paletteCollapsed]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('aurora-pb-props-collapsed', propsCollapsed ? '1' : '0');
  }, [propsCollapsed]);
  // 全屏: Esc 退出 + 锁背景滚动
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [fullscreen]);

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
  /** 模板也参与搜索: 命中 label / key / description 的展示出来 */
  const filteredSections = useMemo(() => {
    if (!paletteQuery.trim()) return SECTION_TEMPLATES;
    const q = paletteQuery.trim().toLowerCase();
    return SECTION_TEMPLATES.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.key.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q),
    );
  }, [paletteQuery]);
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

  /* ---------- 历史栈 (Undo / Redo) ---------- */
  const [past, setPast] = useState<BlockConfig[][]>([]);
  const [future, setFuture] = useState<BlockConfig[][]>([]);
  const HISTORY_LIMIT = 50;
  // updateProp 节流: 连续输入合并为一条历史
  const updateThrottleRef = useRef<number | null>(null);

  const emit = useCallback(
    (next: BlockConfig[]) => {
      setPast((p) => {
        const np = [...p, blocks];
        return np.length > HISTORY_LIMIT ? np.slice(np.length - HISTORY_LIMIT) : np;
      });
      setFuture([]);
      setBlocks(next);
      onChange?.(next);
    },
    [blocks, onChange],
  );

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [...f, blocks]);
    setBlocks(prev);
    onChange?.(prev);
  }, [past, blocks, onChange]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const nxt = future[future.length - 1];
    setFuture((f) => f.slice(0, -1));
    setPast((p) => [...p, blocks]);
    setBlocks(nxt);
    onChange?.(nxt);
  }, [future, blocks, onChange]);

  const selected = selectedId ? findBlockById(blocks, selectedId) : null;
  const selectedSchema = selected ? getSchema(selected.type) : null;

  // 选中块的祖先路径 [root, ..., parent, selected] — 用于属性面板顶部面包屑
  const selectedPath = useMemo<BlockConfig[]>(() => {
    if (!selectedId) return [];
    const walk = (arr: BlockConfig[], stack: BlockConfig[]): BlockConfig[] | null => {
      for (const b of arr) {
        const next = [...stack, b];
        if (b.id === selectedId) return next;
        if (b.slots) {
          for (const children of Object.values(b.slots)) {
            const found = walk(children, next);
            if (found) return found;
          }
        }
      }
      return null;
    };
    return walk(blocks, []) ?? [];
  }, [blocks, selectedId]);

  /* ---------- drag/drop ---------- */

  const setDataTransfer = (e: React.DragEvent, payload: DragPayload) => {
    e.dataTransfer.setData('application/x-au-block', JSON.stringify(payload));
    // 把"被拖块"的 type 通过自定义 MIME 暴露 — dragover 阶段拿不到 getData,
    // 但 dataTransfer.types 永远可读. 用它做白名单实时校验, 让禁止图标在悬停时即时反馈.
    if (payload.kind === 'new' && payload.type) {
      e.dataTransfer.setData(`application/x-au-block-type-${payload.type.toLowerCase()}`, '');
    } else if (payload.kind === 'move' && payload.id) {
      const blk = findBlockById(blocks, payload.id);
      if (blk) {
        e.dataTransfer.setData(`application/x-au-block-type-${blk.type.toLowerCase()}`, '');
      }
    } else if (payload.kind === 'section') {
      // section 是预设整段, 走 root, 标记为 section
      e.dataTransfer.setData('application/x-au-block-kind-section', '');
    }
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  /** dragover 阶段读"被拖类型" — 只能从 dataTransfer.types 反推 (浏览器隔离 getData) */
  const peekDraggedType = (e: React.DragEvent): string | null => {
    for (const t of e.dataTransfer.types) {
      const m = t.match(/^application\/x-au-block-type-(.+)$/);
      if (m) {
        // 大小写恢复: 找到 REGISTRY 里 toLowerCase() 匹配的真实 type
        const lower = m[1];
        const hit = REGISTRY.find((r) => r.type.toLowerCase() === lower);
        return hit ? hit.type : lower;
      }
    }
    return null;
  };

  /** 父容器是否允许接受这个被拖块 — 没限制 / section 整段一律放行 */
  const isDropAllowedInto = (parentType: string | null, draggedType: string | null): boolean => {
    if (!parentType) return true;
    const parentSchema = getSchema(parentType);
    if (!parentSchema?.allowedChildTypes) return true;
    if (!draggedType) return true; // 拿不到 type (跨标签页等) — 不挡
    return parentSchema.allowedChildTypes.includes(draggedType);
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
    // 白名单: 这里"放在 parentId 旁边" → 父级是 parentId 所在层 (即 parentId 的父),
    // 由于 onDragOverBlock 调用时传的 parentId 已经是"邻居共享的父", 直接用它做容器
    const draggedType = peekDraggedType(e);
    if (!isDropAllowedInto(parentId, draggedType)) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'none';
      setDropIndicator(null);
      return;
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
    // 白名单校验 — 父容器不允许此类型时禁止指针 + 不画 indicator
    const draggedType = peekDraggedType(e);
    if (!isDropAllowedInto(parentId, draggedType)) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'none';
      setDropIndicator(null);
      setHoveredSlot(null);
      return;
    }
    e.preventDefault();
    // 阻止事件冒泡到上层 slot/block, 避免多层 dragover 互相覆盖导致闪烁
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    // 标记目标 slot 高亮 (parentId|slotName 唯一定位)
    const slotKey = `${parentId ?? 'root'}|${slotName}`;
    setHoveredSlot((prev) => (prev === slotKey ? prev : slotKey));
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
    // 兜底白名单校验 — dragover 已经挡过, 这里防止边缘 case (跨标签页, 老浏览器)
    const draggedType =
      payload.kind === 'new'
        ? payload.type ?? null
        : payload.kind === 'move' && payload.id
        ? findBlockById(blocks, payload.id)?.type ?? null
        : null;
    if (!isDropAllowedInto(parentId, draggedType)) {
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
      const tag = schema.label.match(/^([A-Za-z][A-Za-z0-9.]*)/)?.[1] ?? schema.type;
      showToast(`已插入 ${tag}`);
    } else if (payload.kind === 'section' && payload.sectionKey) {
      const tpl = getSectionTemplate(payload.sectionKey);
      if (!tpl) {
        setDropIndicator(null);
        return;
      }
      const tree = materializeSection(tpl.build(), uid);
      emit(insertBlock(blocks, tree, parentId, slotName, targetIndex));
      setSelectedId(tree.id);
      showToast(`已插入模板 ${tpl.label}`);
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
    setHoveredSlot(null);
  };

  // selectedId 变化 → 如果块不在画布视口内, 平滑滚到中央
  useEffect(() => {
    if (!selectedId) return;
    const el = document.querySelector(
      `.au-pb__canvas [data-id="${selectedId}"]`,
    ) as HTMLElement | null;
    if (!el) return;
    const canvas = el.closest('.au-pb__canvas') as HTMLElement | null;
    if (!canvas) return;
    const rect = el.getBoundingClientRect();
    const cRect = canvas.getBoundingClientRect();
    const inView = rect.top >= cRect.top - 4 && rect.bottom <= cRect.bottom + 4;
    if (!inView) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }
  }, [selectedId]);

  // 全局 dragend (拖到 builder 外松开) — 兜底清理高亮 + 源块半透明
  useEffect(() => {
    const onDragEnd = () => {
      setDropIndicator(null);
      setHoveredSlot(null);
      setDraggingId(null);
    };
    window.addEventListener('dragend', onDragEnd);
    return () => window.removeEventListener('dragend', onDragEnd);
  }, []);

  // 拖到画布顶/底边缘 32px 区域 → 自动滚动 (Figma / Webflow 风, 长画布救星)
  useEffect(() => {
    let dir = 0;
    let raf: number | null = null;
    const tick = () => {
      const canvas = wrapRef.current?.querySelector('.au-pb__canvas') as HTMLElement | null;
      if (canvas && dir !== 0) {
        canvas.scrollTop += dir * 8;
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    };
    const onDragOver = (e: DragEvent) => {
      const canvas = wrapRef.current?.querySelector('.au-pb__canvas') as HTMLElement | null;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const EDGE = 32;
      // 仅在鼠标进入画布范围才考虑边缘自动滚, 否则放行
      if (e.clientX < rect.left || e.clientX > rect.right) {
        dir = 0;
        return;
      }
      if (e.clientY < rect.top + EDGE && e.clientY >= rect.top) dir = -1;
      else if (e.clientY > rect.bottom - EDGE && e.clientY <= rect.bottom) dir = 1;
      else dir = 0;
      if (dir !== 0 && raf == null) raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      dir = 0;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    };
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('drop', stop);
    window.addEventListener('dragend', stop);
    return () => {
      stop();
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('drop', stop);
      window.removeEventListener('dragend', stop);
    };
  }, []);

  // 右键菜单: 任意点击 / Esc 关闭
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    window.addEventListener('mousedown', close);
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, true);
    return () => {
      window.removeEventListener('mousedown', close);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close, true);
    };
  }, [contextMenu]);

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
    if (isBlockLocked(id)) return;
    emit(removeBlockById(blocks, id));
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateBlock = (id: string) => {
    if (isBlockLocked(id)) return;
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
    if (isBlockLocked(id)) return;
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
    // 连续输入 (e.g. 文本框打字) 节流入栈 — 500ms 内的多次修改合并为一条历史
    if (updateThrottleRef.current === null) {
      setPast((p) => {
        const np = [...p, blocks];
        return np.length > HISTORY_LIMIT ? np.slice(np.length - HISTORY_LIMIT) : np;
      });
      setFuture([]);
    } else {
      window.clearTimeout(updateThrottleRef.current);
    }
    updateThrottleRef.current = window.setTimeout(() => {
      updateThrottleRef.current = null;
    }, 500);
    const next = updateBlockProps(blocks, selected.id, { ...selected.props, [key]: value });
    setBlocks(next);
    onChange?.(next);
  };

  const clearAll = () => {
    emit([]);
    setSelectedId(null);
  };

  /** 把当前选中块的 props 整个重置回 schema.defaultProps (slots 保留, 子树不动) */
  const resetSelectedProps = () => {
    if (!selected || !selectedSchema) return;
    emit(updateBlockProps(blocks, selected.id, { ...selectedSchema.defaultProps }));
  };

  /** 切换块锁定 — 锁定后不能拖 / 删 / 复制, 但仍能选中查看属性 */
  const toggleLock = (id: string) => {
    const b = findBlockById(blocks, id);
    if (!b) return;
    const next = !(b.props._locked as boolean | undefined);
    emit(updateBlockProps(blocks, id, { ...b.props, _locked: next || undefined }));
  };
  const isBlockLocked = (id: string): boolean => {
    const b = findBlockById(blocks, id);
    return !!(b?.props._locked);
  };

  /* ---------- 跨位置剪贴板 (Cmd+C / Cmd+V) ---------- */
  const clipboardRef = useRef<BlockConfig | null>(null);

  const cloneTree = useCallback((b: BlockConfig): BlockConfig => ({
    id: uid(),
    type: b.type,
    props: { ...b.props },
    slots: b.slots
      ? Object.fromEntries(Object.entries(b.slots).map(([k, v]) => [k, v.map(cloneTree)]))
      : undefined,
  }), []);

  const copySelected = useCallback(() => {
    if (!selectedId) return;
    const src = findBlockById(blocks, selectedId);
    if (src) {
      clipboardRef.current = src;
      const sch = getSchema(src.type);
      const tag = sch?.label.match(/^([A-Za-z][A-Za-z0-9.]*)/)?.[1] ?? src.type;
      showToast(`已复制 ${tag}`);
    }
  }, [selectedId, blocks, showToast]);

  const pasteFromClipboard = useCallback(() => {
    const src = clipboardRef.current;
    if (!src) {
      showToast('剪贴板为空');
      return;
    }
    const newTree = cloneTree(src);
    const sch = getSchema(src.type);
    const tag = sch?.label.match(/^([A-Za-z][A-Za-z0-9.]*)/)?.[1] ?? src.type;
    showToast(`已粘贴 ${tag}`);
    const sel = selectedId ? findBlockById(blocks, selectedId) : null;
    if (sel) {
      const selSchema = getSchema(sel.type);
      // 选中是容器 → 粘到其 default slot 末尾
      if (selSchema?.isContainer) {
        const len = sel.slots?.default?.length ?? 0;
        emit(insertBlock(blocks, newTree, sel.id, 'default', len));
      } else {
        // 选中是叶子 → 粘到它紧后面 (同 slot 同父)
        const loc = findBlockLocation(blocks, sel.id);
        if (loc) {
          emit(insertBlock(blocks, newTree, loc.parentId, loc.slotName, loc.index + 1));
        } else {
          emit(insertBlock(blocks, newTree, null, 'default', blocks.length));
        }
      }
    } else {
      // 没选中 → 粘到根末尾
      emit(insertBlock(blocks, newTree, null, 'default', blocks.length));
    }
    setSelectedId(newTree.id);
  }, [blocks, selectedId, emit, cloneTree, showToast]);

  /* ---------- 全局键盘快捷键 ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 表单输入聚焦时跳过 — 让用户能正常 Backspace 改字段值
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          target.isContentEditable
        ) {
          return;
        }
      }
      const meta = e.metaKey || e.ctrlKey;

      // Undo / Redo (Cmd+Z / Cmd+Shift+Z / Cmd+Y)
      if (meta && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if (meta && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault();
        redo();
        return;
      }

      // Cmd+D 复制选中
      if (meta && e.key.toLowerCase() === 'd' && selectedId) {
        e.preventDefault();
        duplicateBlock(selectedId);
        return;
      }

      // Cmd+C 复制到剪贴板 (需要选中)
      if (meta && e.key.toLowerCase() === 'c' && selectedId) {
        e.preventDefault();
        copySelected();
        return;
      }
      // Cmd+V 粘贴 (即使没选中也能粘到根)
      if (meta && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteFromClipboard();
        return;
      }

      if (!selectedId) return;

      // Delete / Backspace 删
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteBlock(selectedId);
      } else if (e.key === 'Escape') {
        // ESC: 选父级, 没父级就取消选中
        const loc = findBlockLocation(blocks, selectedId);
        if (loc?.parentId) setSelectedId(loc.parentId);
        else setSelectedId(null);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        moveBlock(selectedId, -1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        moveBlock(selectedId, 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo, selectedId, blocks, copySelected, pasteFromClipboard]);

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
    parentInline = false,
  ): React.ReactNode => {
    const schema = getSchema(b.type);
    if (!schema) return null;
    const Node = schema.component;
    const indicatorPrefix = `${parentId ?? 'root'}|${slotName}|`;
    const showBefore = dropIndicator?.key === `${indicatorPrefix}${index}` && !preview;

    const isSel = selectedId === b.id;
    const isOutlineHover = outlineHoveredId === b.id;
    const isLocked = !!(b.props._locked);
    const isDragging = draggingId === b.id;
    const cls = [
      'au-pb__block',
      isSel ? 'is-selected' : '',
      isOutlineHover ? 'is-outline-hover' : '',
      isLocked ? 'is-locked' : '',
      isDragging ? 'is-dragging' : '',
      schema.isContainer ? 'is-container' : '',
      parentInline ? 'is-inline-child' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const leafProps = (() => {
      // 先抽通用 meta props 注入 style, 再走组件自定义 transformProps
      const base = applyMetaToProps(filterProps(b.props));
      return schema.transformProps ? schema.transformProps(base) : base;
    })();
    const PreviewWrap = parentInline ? 'span' : 'div';
    const containerNode = schema.isContainer ? (
      <Node {...buildContainerProps(b, schema, renderBlock, preview)} />
    ) : (
      <PreviewWrap
        className={[
          'au-pb__block-preview',
          parentInline ? 'au-pb__block-preview--inline' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={schema.previewWrapperStyle}
      >
        <Node {...leafProps}>{b.props.children as React.ReactNode}</Node>
      </PreviewWrap>
    );

    const Outer = parentInline ? 'span' : 'div';
    // _align: 'center' | 'right' → 给块外壳加 textAlign, 让里面 inline-block 的组件 (Button 等) 水平对齐
    const align = b.props._align;
    const wrapperAlignStyle: React.CSSProperties | undefined =
      align === 'center' || align === 'right'
        ? { textAlign: align as 'center' | 'right' }
        : undefined;
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
        <Outer
          className={cls}
          data-type={b.type}
          data-id={b.id}
          style={wrapperAlignStyle}
          draggable={!preview && !isLocked}
          onDragStart={(e) => {
            e.stopPropagation();
            setDataTransfer(e, { kind: 'move', id: b.id });
            setDraggingId(b.id);
          }}
          onDragEnd={() => setDraggingId(null)}
          onDragOver={(e) =>
            onDragOverBlock(e, parentId, slotName, index, orientation, !!schema.isContainer)
          }
          onClick={(e) => {
            e.stopPropagation();
            setSelectedId(b.id);
          }}
          onContextMenu={(e) => {
            if (preview) return;
            e.preventDefault();
            e.stopPropagation();
            setSelectedId(b.id);
            setContextMenu({ x: e.clientX, y: e.clientY, blockId: b.id });
          }}
          onMouseEnter={(e) => {
            if (preview) return;
            // mouseenter 不冒泡, 进子块时只触发子块这条 → 跟"最深块"语义一致
            if (tooltipTimerRef.current) window.clearTimeout(tooltipTimerRef.current);
            const x = e.clientX;
            const y = e.clientY;
            tooltipTimerRef.current = window.setTimeout(() => {
              setPathTooltip({ x, y, blockId: b.id });
              tooltipTimerRef.current = null;
            }, 600);
          }}
          onMouseLeave={() => {
            if (tooltipTimerRef.current) {
              window.clearTimeout(tooltipTimerRef.current);
              tooltipTimerRef.current = null;
            }
            setPathTooltip(null);
          }}
        >
          {!preview && (() => {
            const Bar = parentInline ? 'span' : 'div';
            // 块名取 schema.label 的英文部分 (如 "Form 表单容器" → "Form")
            const tag = schema.label.match(/^([A-Za-z][A-Za-z0-9.]*)/)?.[1] ?? b.type;
            return (
              <Bar className="au-pb__block-toolbar" title={schema.label}>
                <Bar className="au-pb__block-tag">{tag}</Bar>
                <Bar className="au-pb__block-actions">
                  <button type="button" title="上移" disabled={isLocked} onClick={(e) => { e.stopPropagation(); moveBlock(b.id, -1); }}>
                    <Icon name="up-btn" size={12} />
                  </button>
                  <button type="button" title="下移" disabled={isLocked} onClick={(e) => { e.stopPropagation(); moveBlock(b.id, 1); }}>
                    <Icon name="down-btn" size={12} />
                  </button>
                  <button type="button" title="复制" disabled={isLocked} onClick={(e) => { e.stopPropagation(); duplicateBlock(b.id); }}>
                    <Icon name="copy" size={12} />
                  </button>
                  <button type="button" title={isLocked ? '解锁' : '锁定 (锁后禁拖删)'} onClick={(e) => { e.stopPropagation(); toggleLock(b.id); }}>
                    <Icon name={isLocked ? 'lock-fill' : 'lock'} size={12} />
                  </button>
                  <button type="button" title="删除" className="is-danger" disabled={isLocked} onClick={(e) => { e.stopPropagation(); deleteBlock(b.id); }}>
                    <Icon name="delete" size={12} />
                  </button>
                </Bar>
              </Bar>
            );
          })()}
          <BlockErrorBoundary type={b.type}>{containerNode}</BlockErrorBoundary>
        </Outer>
      </React.Fragment>
    );
  };

  /** slot wrapper — 根画布或任何容器的插槽都走这个,接住 drop 事件
   *
   * options.inline:    使用 inline-flex 布局 (Button/Tag/Badge 等行内容器)
   * options.fallback:  inline 容器空 slot 时显示的回退文案 (props.children 字符串)
   */
  const renderSlot = (
    parentId: string | null,
    slotName: string,
    slotLabel: string | undefined,
    children: BlockConfig[],
    orientation: 'vertical' | 'horizontal',
    extraClassName = '',
    options: { inline?: boolean; fallback?: string; customEmpty?: React.ReactNode } = {},
  ): React.ReactNode => {
    const isEmpty = children.length === 0;
    const prefix = `${parentId ?? 'root'}|${slotName}|`;
    const showTail =
      dropIndicator?.key === `${prefix}${children.length}` && !preview && !isEmpty;
    const Wrapper = options.inline ? 'span' : 'div';
    const hasFallback = !!(options.inline && isEmpty && options.fallback);
    const slotKey = `${parentId ?? 'root'}|${slotName}`;
    const isDropTarget = hoveredSlot === slotKey && !preview;
    return (
      <Wrapper
        className={[
          'au-pb__slot',
          orientation === 'horizontal' ? 'au-pb__slot--row' : '',
          options.inline ? 'au-pb__slot--inline' : '',
          isEmpty ? 'is-empty' : '',
          hasFallback ? 'has-fallback' : '',
          isDropTarget ? 'is-drop-target' : '',
          preview ? 'is-preview' : '',
          extraClassName,
        ]
          .filter(Boolean)
          .join(' ')}
        onDragOver={(e) => onDragOverSlot(e, parentId, slotName, children.length)}
        onDragLeave={onSlotLeave}
        onDrop={(e) => handleDrop(e, parentId, slotName)}
      >
        {isEmpty && options.inline && options.fallback ? (
          // inline 容器: 空 slot 用 fallback 字符串当占位; 预览模式仅显示文字, 编辑模式有虚线
          <span className="au-pb__inline-fallback">{options.fallback}</span>
        ) : isEmpty && options.inline && !preview ? (
          <span className="au-pb__inline-empty">+ 拖入</span>
        ) : isEmpty && !preview && options.customEmpty ? (
          options.customEmpty
        ) : isEmpty && !preview ? (
          <div className="au-pb__slot-empty">
            拖组件{slotLabel ? ` 到「${slotLabel}」` : '到此'}
          </div>
        ) : null}
        {children.map((c, i) =>
          renderBlock(c, parentId, slotName, i, orientation, !!options.inline),
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
      </Wrapper>
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

    // inline 容器 (Button / Tag / Badge): 单 default slot 用 inline-flex 渲染
    // 空 slot + childrenWhenEmpty='string' + props.children 字符串 → 用字符串当 fallback 预览
    if (schema.slotLayout === 'inline') {
      const slotChildren = b.slots?.default ?? [];
      const fallback =
        slotChildren.length === 0 &&
        schema.childrenWhenEmpty === 'string' &&
        typeof b.props.children === 'string' &&
        b.props.children
          ? (b.props.children as string)
          : undefined;
      props.children = renderSlot(
        b.id,
        'default',
        schema.slotLabels?.default,
        slotChildren,
        'horizontal',
        '',
        { inline: true, fallback },
      );
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
      className={[
        'au-pb',
        preview ? 'is-preview' : '',
        fullscreen ? 'is-fullscreen' : '',
        paletteCollapsed ? 'is-palette-collapsed' : '',
        propsCollapsed ? 'is-props-collapsed' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <div className="au-pb__toolbar">
        <div className="au-pb__toolbar-left">
          <strong className="au-pb__brand">
            <Icon name="component" size={16} /> PageBuilder
          </strong>
          <span className="au-pb__count">{countBlocks(blocks)} 个组件</span>
          <span key={savedTick} className="au-pb__saved" title="已自动保存到本地">
            ✓ 已保存
          </span>
        </div>
        <div className="au-pb__toolbar-right">
          <button
            type="button"
            className="au-btn au-btn--default au-btn--small"
            title="撤销 (Cmd/Ctrl+Z)"
            onClick={undo}
            disabled={past.length === 0}
          >
            <Icon name="return" size={14} />
          </button>
          <button
            type="button"
            className="au-btn au-btn--default au-btn--small"
            title="重做 (Cmd/Ctrl+Shift+Z)"
            onClick={redo}
            disabled={future.length === 0}
          >
            <Icon name="return" size={14} style={{ transform: 'scaleX(-1)' }} />
          </button>
          <Dropdown
            trigger="click"
            placement="bottomRight"
            menu={{
              items: ([
                { w: 768, icon: 'shouji', label: '768  平板' },
                { w: 1024, icon: 'macbook', label: '1024 小屏笔记本' },
                { w: 1280, icon: 'macbook', label: '1280 13" MacBook' },
                { w: 1440, icon: 'xianshiqi', label: '1440 主流外接屏' },
                { w: 1920, icon: 'xianshiqi', label: '1920 1080p 显示器' },
              ] as const).map(({ w, icon, label }) => ({
                key: String(w),
                icon: <Icon name={icon} size={14} />,
                label,
                onClick: () => setVirtualWidth(w),
              })),
            }}
          >
            <button
              type="button"
              className="au-btn au-btn--default au-btn--small"
              title="切换画布断点"
            >
              <Icon
                name={
                  virtualWidth <= 768
                    ? 'shouji'
                    : virtualWidth <= 1280
                    ? 'macbook'
                    : 'xianshiqi'
                }
                size={14}
              />
              {virtualWidth}
            </button>
          </Dropdown>
          <button
            type="button"
            className="au-btn au-btn--default au-btn--small"
            title={fullscreen ? '退出全屏 (Esc)' : '进入全屏 — 让画布占满整个窗口'}
            onClick={() => setFullscreen((v) => !v)}
          >
            {fullscreen ? '⛶ 退出全屏' : '⛶ 全屏'}
          </button>
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
          {/* 次按钮收进 ⋯ 更多 dropdown, 缩短工具栏占位 */}
          <Dropdown
            trigger="click"
            placement="bottomRight"
            menu={{
              items: [
                {
                  key: 'download',
                  label: '下载为 .jsx 文件',
                  icon: <Icon name="download" size={14} />,
                  disabled: blocks.length === 0,
                  onClick: () => {
                    setDownloadName(
                      componentName.replace(/[^A-Za-z0-9_]/g, '') || 'GeneratedPage',
                    );
                    setDownloadOpen(true);
                  },
                },
                {
                  key: 'copy-json',
                  label: copied === 'json' ? '✓ 已复制 JSON' : 'Copy JSON',
                  icon: <Icon name="copy" size={14} />,
                  onClick: () => copy(jsonCode, 'json'),
                },
                { type: 'divider', key: 'd1' },
                {
                  key: 'clear',
                  label: '清空画布',
                  icon: <Icon name="delete" size={14} />,
                  danger: true,
                  disabled: blocks.length === 0,
                  onClick: clearAll,
                },
              ],
            }}
          >
            <button
              type="button"
              className="au-btn au-btn--default au-btn--small"
              title="更多操作"
            >
              ⋯
            </button>
          </Dropdown>
        </div>
      </div>

      <div className="au-pb__main">
        {!preview && paletteCollapsed && (
          <button
            type="button"
            className="au-pb__rail au-pb__rail--left"
            title="展开组件库"
            style={midHeight ? { height: midHeight } : undefined}
            onClick={() => setPaletteCollapsed(false)}
          >
            <Icon name="right-double-arrow" size={14} />
            <span className="au-pb__rail-label">组件库</span>
          </button>
        )}
        {!preview && !paletteCollapsed && (
          <aside
            className="au-pb__palette"
            style={midHeight ? { height: midHeight, maxHeight: midHeight, minHeight: 0 } : undefined}
          >
            <div className="au-pb__palette-tabs">
              <button
                type="button"
                className={[
                  'au-pb__palette-tab',
                  paletteTab === 'components' ? 'is-active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setPaletteTab('components')}
              >
                组件库 <span className="au-pb__count-mini">{palette.length}</span>
              </button>
              <button
                type="button"
                className={[
                  'au-pb__palette-tab',
                  paletteTab === 'outline' ? 'is-active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setPaletteTab('outline')}
              >
                大纲 <span className="au-pb__count-mini">{countBlocks(blocks)}</span>
              </button>
              <button
                type="button"
                className="au-pb__panel-collapse"
                title="收起面板"
                onClick={() => setPaletteCollapsed(true)}
              >
                <Icon name="left-double-arrow" size={12} />
              </button>
            </div>
            {paletteTab === 'components' && (
              <>
                <input
                  type="text"
                  className="au-pb__palette-search"
                  placeholder="搜索组件…"
                  value={paletteQuery}
                  onChange={(e) => setPaletteQuery(e.target.value)}
                />
              </>
            )}
            {paletteTab === 'outline' && (
              <div className="au-pb__palette-outline-wrap">
                {blocks.length === 0 ? (
                  <div className="au-pb__outline-empty">
                    画布为空, 拖入或点击空状态卡片插入模板
                  </div>
                ) : (
                  <OutlineTree
                    blocks={blocks}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onHover={setOutlineHoveredId}
                  />
                )}
              </div>
            )}
            {paletteTab === 'components' && (
            <div className="au-pb__palette-list">
              {filteredSections.length > 0 && (
                <div className="au-pb__palette-group au-pb__palette-group--sections">
                  <div className="au-pb__palette-group-head is-static">
                    <Icon name="template" size={14} style={{ marginRight: 6 }} />
                    <span>整段模板</span>
                    <span className="au-pb__count-mini">{filteredSections.length}</span>
                  </div>
                  <div className="au-pb__palette-group-items">
                    {filteredSections.map((s) => (
                      <div
                        key={s.key}
                        className="au-pb__palette-item au-pb__palette-item--section"
                        draggable
                        title={s.description}
                        onDragStart={(e) =>
                          setDataTransfer(e, { kind: 'section', sectionKey: s.key })
                        }
                      >
                        <span className="au-pb__palette-item-label">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {groupedPalette.length === 0 && filteredSections.length === 0 ? (
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
            )}
            {paletteTab === 'components' && (
              <div className="au-pb__hint">拖到画布 / 容器插槽</div>
            )}
            {paletteTab === 'outline' && blocks.length > 0 && (
              <div className="au-pb__hint">点击节点选中 · 悬停同步高亮</div>
            )}
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
            style={{ zoom: scale, width: virtualWidth }}
          >
            <div className="au-pb__mac-bar">
              <span className="au-pb__mac-lights" aria-hidden>
                <i className="au-pb__mac-light au-pb__mac-light--r" />
                <i className="au-pb__mac-light au-pb__mac-light--y" />
                <i className="au-pb__mac-light au-pb__mac-light--g" />
              </span>
              <span className="au-pb__mac-title">
                {preview ? 'Preview' : `${componentName}.jsx`}
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
              style={fullscreen ? undefined : { minHeight: minCanvasHeight }}
            >
              {renderSlot(null, 'default', undefined, blocks, 'vertical', 'au-pb__slot--root', {
                customEmpty: (
                  <div className="au-pb__guide">
                    <div className="au-pb__guide-title">
                      从这里开始 <Icon name="template" size={20} />
                    </div>
                    <div className="au-pb__guide-sub">
                      把左侧组件拖到画布,或一键插入整段模板
                    </div>
                    <div className="au-pb__guide-sections">
                      {SECTION_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.key}
                          type="button"
                          className="au-pb__guide-section"
                          title={tpl.description}
                          onClick={() => {
                            const tree = materializeSection(tpl.build(), uid);
                            emit(insertBlock(blocks, tree, null, 'default', 0));
                            setSelectedId(tree.id);
                          }}
                        >
                          <span className="au-pb__guide-section-label">{tpl.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="au-pb__guide-shortcuts">
                      快捷键: <kbd>⌘Z</kbd> 撤销 ·{' '}
                      <kbd>Del</kbd> 删除 ·{' '}
                      <kbd>⌘D</kbd> 复制 ·{' '}
                      <kbd>Esc</kbd> 选父级
                    </div>
                  </div>
                ),
              })}
            </div>
          </div>

          {showCode && (
            <div className="au-pb__code">
              <div className="au-pb__code-head">
                <span>JSX 输出 · {componentName}.jsx</span>
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
                badge="JSX"
                readOnly
                wrap
                height={420}
              />
            </div>
          )}
        </div>

        {!preview && propsCollapsed && (
          <button
            type="button"
            className="au-pb__rail au-pb__rail--right"
            title="展开属性面板"
            style={midHeight ? { height: midHeight } : undefined}
            onClick={() => setPropsCollapsed(false)}
          >
            <Icon name="left-double-arrow" size={14} />
            <span className="au-pb__rail-label">属性</span>
          </button>
        )}
        {!preview && !propsCollapsed && (
          <aside
            className="au-pb__props"
            style={midHeight ? { height: midHeight, maxHeight: midHeight, minHeight: 0 } : undefined}
          >
            <div className="au-pb__section-title">
              <span>属性</span>
              <button
                type="button"
                className="au-pb__panel-collapse"
                title="收起属性面板"
                onClick={() => setPropsCollapsed(true)}
              >
                <Icon name="right-double-arrow" size={12} />
              </button>
            </div>
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
                onReset={resetSelectedProps}
                path={selectedPath}
                onSelectAncestor={setSelectedId}
              />
            ) : null}
          </aside>
        )}
      </div>

      {/* 操作反馈 toast — fixed 右上, 2s 自动淡出 */}
      {toasts.length > 0 && (
        <div className="au-pb__toasts">
          {toasts.map((t) => (
            <div key={t.id} className="au-pb__toast">
              {t.msg}
            </div>
          ))}
        </div>
      )}

      {/* hover 路径 tooltip (块 hover 600ms 后显示, 帮深嵌套场景快速辨认所在层级) */}
      {pathTooltip && (() => {
        const tipBlock = findBlockById(blocks, pathTooltip.blockId);
        if (!tipBlock) return null;
        // 复用 selectedPath 算法 — 当时只对 selectedId 算了, 这里 inline 一份给 hover
        const walk = (arr: BlockConfig[], stack: BlockConfig[]): BlockConfig[] | null => {
          for (const b of arr) {
            const next = [...stack, b];
            if (b.id === pathTooltip.blockId) return next;
            if (b.slots) {
              for (const children of Object.values(b.slots)) {
                const found = walk(children, next);
                if (found) return found;
              }
            }
          }
          return null;
        };
        const path = walk(blocks, []) ?? [];
        const labels = path.map((b) => {
          const sch = getSchema(b.type);
          return sch?.label.match(/^([A-Za-z][A-Za-z0-9.]*)/)?.[1] ?? b.type;
        });
        const tipSchema = getSchema(tipBlock.type);
        const childCount = tipBlock.slots
          ? Object.values(tipBlock.slots).reduce((n, arr) => n + arr.length, 0)
          : 0;
        return (
          <div
            className="au-pb__hover-tip"
            style={{ left: pathTooltip.x + 12, top: pathTooltip.y + 12 }}
          >
            <div className="au-pb__hover-tip-path">
              {labels.length > 1 ? (
                <>
                  {labels.slice(0, -1).map((l, i) => (
                    <React.Fragment key={i}>
                      <span className="au-pb__hover-tip-anc">{l}</span>
                      <span className="au-pb__hover-tip-sep">›</span>
                    </React.Fragment>
                  ))}
                  <span className="au-pb__hover-tip-cur">{labels[labels.length - 1]}</span>
                </>
              ) : (
                <span className="au-pb__hover-tip-cur">{labels[0]}</span>
              )}
            </div>
            <div className="au-pb__hover-tip-meta">
              {tipSchema?.isContainer ? '容器' : '叶子'} · {childCount} 子块
            </div>
          </div>
        );
      })()}

      {/* 右键菜单 — fixed 定位浮在画布上 */}
      {contextMenu && (() => {
        const cmBlock = findBlockById(blocks, contextMenu.blockId);
        if (!cmBlock) return null;
        const locked = !!cmBlock.props._locked;
        const loc = findBlockLocation(blocks, contextMenu.blockId);
        const hasParent = !!loc?.parentId;
        const hasClipboard = clipboardRef.current !== null;
        return (
          <div
            className="au-pb__ctx-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="au-pb__ctx-item"
              onClick={() => {
                copySelected();
                setContextMenu(null);
              }}
            >
              <Icon name="copy" size={13} />
              <span>复制</span>
              <span className="au-pb__ctx-shortcut">⌘C</span>
            </button>
            <button
              type="button"
              className="au-pb__ctx-item"
              disabled={!hasClipboard}
              onClick={() => {
                pasteFromClipboard();
                setContextMenu(null);
              }}
            >
              <Icon name="copy" size={13} />
              <span>粘贴</span>
              <span className="au-pb__ctx-shortcut">⌘V</span>
            </button>
            <button
              type="button"
              className="au-pb__ctx-item"
              disabled={locked}
              onClick={() => {
                duplicateBlock(contextMenu.blockId);
                setContextMenu(null);
              }}
            >
              <Icon name="copy" size={13} />
              <span>复制到原位</span>
              <span className="au-pb__ctx-shortcut">⌘D</span>
            </button>
            <div className="au-pb__ctx-sep" />
            <button
              type="button"
              className="au-pb__ctx-item"
              disabled={!hasParent}
              onClick={() => {
                if (loc?.parentId) setSelectedId(loc.parentId);
                setContextMenu(null);
              }}
            >
              <Icon name="up-btn" size={13} />
              <span>选父级</span>
              <span className="au-pb__ctx-shortcut">Esc</span>
            </button>
            <button
              type="button"
              className="au-pb__ctx-item"
              onClick={() => {
                toggleLock(contextMenu.blockId);
                setContextMenu(null);
              }}
            >
              <Icon name={locked ? 'unlock' : 'lock'} size={13} />
              <span>{locked ? '解锁' : '锁定'}</span>
            </button>
            <div className="au-pb__ctx-sep" />
            <button
              type="button"
              className="au-pb__ctx-item is-danger"
              disabled={locked}
              onClick={() => {
                deleteBlock(contextMenu.blockId);
                setContextMenu(null);
              }}
            >
              <Icon name="delete" size={13} />
              <span>删除</span>
              <span className="au-pb__ctx-shortcut">Del</span>
            </button>
          </div>
        );
      })()}

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
          <Icon name="table" size={12} />
        </span>
      )}
    </div>
  );
};

/* ---------- Outline tree (大纲 / 层级) ---------- */
const OutlineTree: React.FC<{
  blocks: BlockConfig[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}> = ({ blocks, selectedId, onSelect, onHover }) => {
  const [query, setQuery] = useState('');
  // 搜索时的可见 id 集合: 命中节点 + 它们的祖先链 (维持上下文路径) + 它们的子孙 (让用户看到容器内全部)
  const visibleIds = useMemo<Set<string> | null>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null; // null = 不过滤, 全显示
    const parents = new Map<string, string>();
    const matched = new Set<string>();
    const collect = (arr: BlockConfig[], parent: string | null) => {
      for (const b of arr) {
        if (parent) parents.set(b.id, parent);
        const sch = getSchema(b.type);
        if (
          (sch?.label.toLowerCase().includes(q) ?? false) ||
          b.type.toLowerCase().includes(q)
        ) {
          matched.add(b.id);
        }
        if (b.slots) {
          for (const children of Object.values(b.slots)) {
            collect(children, b.id);
          }
        }
      }
    };
    collect(blocks, null);
    const visible = new Set<string>();
    // 命中 + 祖先链
    for (const id of matched) {
      visible.add(id);
      let p = parents.get(id);
      while (p) {
        visible.add(p);
        p = parents.get(p);
      }
    }
    // 命中 + 子孙 (容器命中时让用户看到内容)
    const addDescendants = (b: BlockConfig) => {
      if (!b.slots) return;
      for (const children of Object.values(b.slots)) {
        for (const c of children) {
          visible.add(c.id);
          addDescendants(c);
        }
      }
    };
    const findById = (arr: BlockConfig[], id: string): BlockConfig | null => {
      for (const b of arr) {
        if (b.id === id) return b;
        if (b.slots) {
          for (const children of Object.values(b.slots)) {
            const f = findById(children, id);
            if (f) return f;
          }
        }
      }
      return null;
    };
    for (const id of matched) {
      const b = findById(blocks, id);
      if (b) addDescendants(b);
    }
    return visible;
  }, [blocks, query]);
  const renderNode = (b: BlockConfig, depth: number): React.ReactNode => {
    if (visibleIds && !visibleIds.has(b.id)) return null;
    const schema = getSchema(b.type);
    const tag =
      schema?.label.match(/^([A-Za-z][A-Za-z0-9.]*)/)?.[1] ?? b.type;
    const slotEntries = b.slots ? Object.entries(b.slots) : [];
    const childCount = slotEntries.reduce((n, [, arr]) => n + arr.length, 0);
    const q = query.trim().toLowerCase();
    const directHit =
      !!q &&
      ((schema?.label.toLowerCase().includes(q) ?? false) ||
        b.type.toLowerCase().includes(q));
    return (
      <div key={b.id}>
        <button
          type="button"
          className={[
            'au-pb__outline-item',
            selectedId === b.id ? 'is-selected' : '',
            directHit ? 'is-search-hit' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ paddingLeft: 6 + depth * 12 }}
          onClick={() => onSelect(b.id)}
          onMouseEnter={() => onHover(b.id)}
          onMouseLeave={() => onHover(null)}
          title={schema?.label ?? b.type}
        >
          <span className="au-pb__outline-icon">{schema?.icon}</span>
          <span className="au-pb__outline-name">{tag}</span>
          {childCount > 0 && (
            <span className="au-pb__outline-count">{childCount}</span>
          )}
        </button>
        {slotEntries.length > 0 &&
          slotEntries.map(([slotName, children]) =>
            children.length === 0 ? null : (
              <div key={slotName}>
                {children.map((c) => renderNode(c, depth + 1))}
              </div>
            ),
          )}
      </div>
    );
  };
  const noMatch = visibleIds && visibleIds.size === 0;
  return (
    <div className="au-pb__outline">
      <input
        type="text"
        className="au-pb__outline-search"
        placeholder="搜索节点 (类型 / 名称)…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="au-pb__outline-body">
        {noMatch ? (
          <div className="au-pb__outline-empty">无匹配节点</div>
        ) : (
          blocks.map((b) => renderNode(b, 0))
        )}
      </div>
    </div>
  );
};

/* ---------- Property panel ---------- */

const PropertyPanel: React.FC<{
  schema: BlockSchema;
  value: Record<string, unknown>;
  onChange: (key: string, v: unknown) => void;
  onReset?: () => void;
  path?: BlockConfig[];
  onSelectAncestor?: (id: string) => void;
}> = ({ schema, value, onChange, onReset, path, onSelectAncestor }) => {
  const [fieldQuery, setFieldQuery] = useState('');
  const visibleFields = useMemo(() => {
    let fs = schema.fields.filter(
      (f) => !f.visibleWhen || f.visibleWhen(value),
    );
    if (fieldQuery.trim()) {
      const q = fieldQuery.trim().toLowerCase();
      fs = fs.filter(
        (f) =>
          f.label.toLowerCase().includes(q) ||
          f.key.toLowerCase().includes(q) ||
          (f.help?.toLowerCase().includes(q) ?? false),
      );
    }
    return fs;
  }, [schema.fields, value, fieldQuery]);
  // FormItem.* 块已经用自己的 _width / _label 等元数据, 不追加通用 meta
  const hasOwnMeta = schema.type.startsWith('FormItem.') || schema.type === 'Menu' || schema.type === 'Layout';
  // 字段总数用于决定是否显示搜索框 (>= 6 才有意义)
  const totalFieldCount = schema.fields.length;
  const showFieldSearch = totalFieldCount >= 6;
  const [metaOpen, setMetaOpen] = useState(false);
  // 路径里至少要 2 层才有意义 (根本身就是当前块时不显示)
  const ancestors = path && path.length > 1 ? path.slice(0, -1) : [];
  return (
    <div className="au-pb__form">
      {ancestors.length > 0 && onSelectAncestor && (
        <div className="au-pb__breadcrumb" title="点击层级跳到对应父块">
          {ancestors.map((b, i) => {
            const sch = getSchema(b.type);
            return (
              <React.Fragment key={b.id}>
                <button
                  type="button"
                  className="au-pb__breadcrumb-item"
                  onClick={() => onSelectAncestor(b.id)}
                >
                  {sch?.label?.split(' ')[0] ?? b.type}
                </button>
                <span className="au-pb__breadcrumb-sep">›</span>
                {i === ancestors.length - 1 && null}
              </React.Fragment>
            );
          })}
          <span className="au-pb__breadcrumb-current">
            {schema.label?.split(' ')[0] ?? schema.type}
          </span>
        </div>
      )}
      <div className="au-pb__form-head">
        <span className="au-pb__form-icon">{schema.icon}</span>
        <span className="au-pb__form-title">{schema.label}</span>
        {onReset && (
          <button
            type="button"
            className="au-pb__form-reset"
            title="把所有属性重置回默认值"
            onClick={() => {
              if (window.confirm('确认把所有属性重置回默认值?')) onReset();
            }}
          >
            <Icon name="return" size={12} />
            <span>重置</span>
          </button>
        )}
      </div>
      {showFieldSearch && (
        <input
          type="text"
          className="au-pb__field-search"
          placeholder={`搜索 ${totalFieldCount} 个属性…`}
          value={fieldQuery}
          onChange={(e) => setFieldQuery(e.target.value)}
        />
      )}
      {visibleFields.length === 0 && fieldQuery && (
        <div className="au-pb__form-empty">无匹配属性</div>
      )}
      {visibleFields.length === 0 && !fieldQuery && !hasOwnMeta && (
        <div className="au-pb__form-empty">此组件暂无可配属性</div>
      )}
      {visibleFields.map((f) => (
        <FieldRow
          key={f.key}
          field={f}
          value={value[f.key]}
          defaultValue={schema.defaultProps[f.key]}
          onChange={onChange}
        />
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
  defaultValue?: unknown;
  onChange: (key: string, v: unknown) => void;
}> = ({ field, value, defaultValue, onChange }) => {
  // 浅判等够用 — 复杂值 (object/array) 改动只要引用变就标记, 跟 React 渲染语义一致
  const isModified = (() => {
    if (defaultValue === undefined) return value !== undefined && value !== '' && value !== null;
    if (typeof value === 'object' || typeof defaultValue === 'object') {
      try {
        return JSON.stringify(value) !== JSON.stringify(defaultValue);
      } catch {
        return value !== defaultValue;
      }
    }
    return value !== defaultValue;
  })();
  // 数值字段: label 鼠标按下 + 左右拖 → 改值 (Figma / Photoshop 风, 调字号 padding 时比点 +/- 快 10×)
  const isNumeric = field.type === 'number';
  const onLabelMouseDown = (e: React.MouseEvent) => {
    if (!isNumeric) return;
    // 让 label 不触发 input 聚焦/选中文本
    e.preventDefault();
    const startX = e.clientX;
    const startVal = typeof value === 'number' ? value : Number(value) || 0;
    const step = field.step ?? 1;
    const min = field.min;
    const max = field.max;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      // 4px 屏幕距离 = 1 步进, 移动越远改得越多
      const stepCount = Math.trunc(dx / 4);
      let next = startVal + stepCount * step;
      if (typeof min === 'number') next = Math.max(min, next);
      if (typeof max === 'number') next = Math.min(max, next);
      // 浮点 step 时保留对应小数位, 避免 0.30000000000000004 之类
      if (step < 1) {
        const decimals = String(step).split('.')[1]?.length ?? 0;
        next = Number(next.toFixed(decimals));
      }
      onChange(field.key, next);
    };
    const onUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };
  return (
    <label className="au-pb__field">
      <span
        className={['au-pb__field-label', isNumeric ? 'is-draggable' : '']
          .filter(Boolean)
          .join(' ')}
        onMouseDown={onLabelMouseDown}
        title={isNumeric ? '左右拖动调整数值 (4px = 1 步)' : undefined}
      >
        {field.label}
        {isModified && (
          <span className="au-pb__field-modified" title="该字段已被修改" aria-hidden>
            ●
          </span>
        )}
        {field.asChildren && <span className="au-pb__field-tag">children</span>}
      </span>
      <FieldControl field={field} value={value} onChange={(v) => onChange(field.key, v)} />
      {field.help && <span className="au-pb__field-help">{field.help}</span>}
    </label>
  );
};

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
    case 'icon':
      return <IconField value={value} onChange={onChange} />;
  }
};

/** 图标选择器 — 当前选中的 icon 预览 + 展开后的网格 + 搜索框
 *  值是 iconfont name 字符串. 直接从 src/data/iconfontNames.ts 读全集. */
const IconField: React.FC<{
  value: unknown;
  onChange: (v: unknown) => void;
}> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const current = typeof value === 'string' ? value : '';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return iconfontNames;
    return iconfontNames.filter((n) => n.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="au-pb__iconfield">
      <button
        type="button"
        className="au-pb__iconfield-trigger"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="au-pb__iconfield-preview">
          {current ? <Icon name={current} size={18} /> : <span style={{ opacity: 0.5 }}>—</span>}
        </span>
        <span className="au-pb__iconfield-name">{current || '点击选择图标'}</span>
        <span className="au-pb__iconfield-caret">{open ? '▴' : '▾'}</span>
      </button>
      {current && (
        <input
          className="au-pb__input"
          type="text"
          value={current}
          placeholder="或直接输入图标 name"
          onChange={(e) => onChange(e.target.value)}
          style={{ marginTop: 6 }}
        />
      )}
      {open && (
        <div className="au-pb__iconfield-panel">
          <input
            type="text"
            className="au-pb__iconfield-search"
            placeholder={`搜索 ${iconfontNames.length} 个图标…`}
            value={query}
            autoFocus
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="au-pb__iconfield-grid">
            {filtered.length === 0 ? (
              <div className="au-pb__iconfield-empty">无匹配图标</div>
            ) : (
              filtered.map((name) => (
                <button
                  key={name}
                  type="button"
                  className={[
                    'au-pb__iconfield-item',
                    name === current ? 'is-selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  title={name}
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                >
                  <Icon name={name} size={18} />
                </button>
              ))
            )}
          </div>
          <div className="au-pb__iconfield-meta">
            {filtered.length} / {iconfontNames.length}
          </div>
        </div>
      )}
    </div>
  );
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
