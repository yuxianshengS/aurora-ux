import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useLocale } from '../ConfigProvider/ConfigProvider';
import './Tour.css';

export type TourPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | 'center';

export type TourTargetGetter =
  | HTMLElement
  | null
  | string                                  // CSS 选择器 (如 '#my-id' / '.my-class')
  | (() => HTMLElement | null);

export interface TourStep {
  /** 高亮目标 — DOM 节点 / CSS 选择器 / 返回节点的函数; 不传 / 返回 null 表示居中(欢迎/结束步) */
  target?: TourTargetGetter;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** 卡片顶部封面 (图片 / 视频 / 自定义节点) */
  cover?: React.ReactNode;
  placement?: TourPlacement;
  /** 该步隐藏遮罩 (默认沿用 Tour 的 mask) */
  mask?: boolean;
  /** 该步隐藏箭头 */
  arrow?: boolean;
  /** 高亮目标的额外内边距, 默认 6 (px) */
  spotlightPadding?: number;
  /** 该步专属的下一步按钮文案 */
  nextButtonText?: React.ReactNode;
  /** 该步专属的上一步按钮文案 */
  prevButtonText?: React.ReactNode;
  /** 该步是否允许被关闭, 覆盖 Tour 的 closable */
  closable?: boolean;
  /** 完全自定义底部 actions 区(覆盖默认的上一步/下一步按钮) — 拿到当前 index/total/控制函数 */
  actions?: (ctx: TourActionContext) => React.ReactNode;
  /** 进入此步时 */
  onEnter?: () => void;
  /** 离开此步时 */
  onLeave?: () => void;
  /** 点下一步时拦截; 返回 false 或抛错则阻止前进, 可用于异步校验 */
  onNext?: () => boolean | void | Promise<boolean | void>;
}

export interface TourActionContext {
  current: number;
  total: number;
  isFirst: boolean;
  isLast: boolean;
  next: () => void;
  prev: () => void;
  close: () => void;
  goTo: (index: number) => void;
}

export interface TourProps {
  steps: TourStep[];
  /** 是否显示 */
  open?: boolean;
  /** 受控 current */
  current?: number;
  /** 非受控初始 step */
  defaultCurrent?: number;
  /** 全局 mask 遮罩 (单步可用 step.mask 覆盖) */
  mask?: boolean;
  /** 全局箭头 */
  arrow?: boolean;
  /** step 切换 */
  onChange?: (current: number) => void;
  /** 关闭 (跳过) */
  onClose?: (current: number) => void;
  /** 走完最后一步 */
  onFinish?: () => void;
  /** 自定义 zIndex; 默认走 token */
  zIndex?: number;
  /** 滚动到目标元素的策略 */
  scrollIntoViewOptions?: boolean | ScrollIntoViewOptions;
  /** 关闭按钮文案 */
  closeButtonText?: React.ReactNode;
  /** 完成按钮文案 (最后一步) */
  finishButtonText?: React.ReactNode;
  /** 上一步按钮文案 (默认) */
  prevButtonText?: React.ReactNode;
  /** 下一步按钮文案 (默认) */
  nextButtonText?: React.ReactNode;
  /** 主题色 — 决定按钮 / 高亮描边色 */
  type?: 'default' | 'primary';
  /** 全局是否可关闭(显示右上角 ✕ + Esc 关闭),默认 true; 单步可用 step.closable 覆盖 */
  closable?: boolean;
  /** 卡片与目标之间的距离 (px), 默认 12 */
  gap?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const resolveTarget = (t?: TourTargetGetter): HTMLElement | null => {
  if (t == null) return null;
  if (typeof t === 'function') return t();
  if (typeof t === 'string') return document.querySelector<HTMLElement>(t);
  return t;
};

const measure = (el: HTMLElement | null): Rect | null => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
};

interface PopoverPos {
  top: number;
  left: number;
  arrowSide: 'top' | 'bottom' | 'left' | 'right' | null;
  arrowOffset: number;
}

/** 根据目标矩形和卡片尺寸 + placement, 算出卡片左上角位置和箭头朝向。 */
const computePopoverPos = (
  rect: Rect | null,
  card: HTMLElement,
  placement: TourPlacement,
  gap: number,
  vw: number,
  vh: number,
): PopoverPos => {
  const cw = card.offsetWidth;
  const ch = card.offsetHeight;
  // center: 直接居中, 无箭头
  if (!rect || placement === 'center') {
    return {
      top: Math.max(16, (vh - ch) / 2),
      left: Math.max(16, (vw - cw) / 2),
      arrowSide: null,
      arrowOffset: 0,
    };
  }
  let top = 0;
  let left = 0;
  let arrowSide: PopoverPos['arrowSide'] = null;
  switch (placement) {
    case 'top':
      top = rect.top - ch - gap;
      left = rect.left + rect.width / 2 - cw / 2;
      arrowSide = 'bottom';
      break;
    case 'topLeft':
      top = rect.top - ch - gap;
      left = rect.left;
      arrowSide = 'bottom';
      break;
    case 'topRight':
      top = rect.top - ch - gap;
      left = rect.left + rect.width - cw;
      arrowSide = 'bottom';
      break;
    case 'bottom':
      top = rect.top + rect.height + gap;
      left = rect.left + rect.width / 2 - cw / 2;
      arrowSide = 'top';
      break;
    case 'bottomLeft':
      top = rect.top + rect.height + gap;
      left = rect.left;
      arrowSide = 'top';
      break;
    case 'bottomRight':
      top = rect.top + rect.height + gap;
      left = rect.left + rect.width - cw;
      arrowSide = 'top';
      break;
    case 'left':
      top = rect.top + rect.height / 2 - ch / 2;
      left = rect.left - cw - gap;
      arrowSide = 'right';
      break;
    case 'right':
      top = rect.top + rect.height / 2 - ch / 2;
      left = rect.left + rect.width + gap;
      arrowSide = 'left';
      break;
  }
  // 视口边界夹逼
  left = Math.min(Math.max(8, left), vw - cw - 8);
  top = Math.min(Math.max(8, top), vh - ch - 8);
  // 箭头跟着目标中心走
  let arrowOffset = 0;
  if (arrowSide === 'top' || arrowSide === 'bottom') {
    const targetCx = rect.left + rect.width / 2;
    arrowOffset = Math.min(Math.max(16, targetCx - left), cw - 16);
  } else if (arrowSide === 'left' || arrowSide === 'right') {
    const targetCy = rect.top + rect.height / 2;
    arrowOffset = Math.min(Math.max(16, targetCy - top), ch - 16);
  }
  return { top, left, arrowSide, arrowOffset };
};

const CloseIcon: React.FC = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
    <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const Tour: React.FC<TourProps> = ({
  steps,
  open = false,
  current: ctrlCurrent,
  defaultCurrent = 0,
  mask = true,
  arrow = true,
  onChange,
  onClose,
  onFinish,
  zIndex,
  scrollIntoViewOptions = { block: 'center', behavior: 'smooth' },
  closeButtonText,
  finishButtonText,
  prevButtonText,
  nextButtonText,
  type = 'primary',
  closable = true,
  gap = 12,
  className = '',
  style,
}) => {
  // 走 ConfigProvider 的 locale (没包裹时是 zhCN)
  const locale = useLocale();
  const tSkip = closeButtonText ?? locale.Tour.skip;
  const tFinish = finishButtonText ?? locale.Tour.finish;
  const tPrev = prevButtonText ?? locale.Tour.prev;
  const tNext = nextButtonText ?? locale.Tour.next;
  void tSkip; // 关闭按钮目前用图标, 文案保留备用
  const isCtrl = ctrlCurrent !== undefined;
  const [innerCurrent, setInnerCurrent] = useState(defaultCurrent);
  const current = isCtrl ? ctrlCurrent! : innerCurrent;
  const total = steps.length;
  const step = steps[current];
  const isFirst = current === 0;
  const isLast = current === total - 1;

  const cardRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [pop, setPop] = useState<PopoverPos>({ top: -9999, left: -9999, arrowSide: null, arrowOffset: 0 });

  useFocusTrap(cardRef, open);

  const setCurrent = useCallback(
    (next: number) => {
      const prev = current;
      if (prev !== next) {
        steps[prev]?.onLeave?.();
        steps[next]?.onEnter?.();
      }
      if (!isCtrl) setInnerCurrent(next);
      onChange?.(next);
    },
    [current, isCtrl, onChange, steps],
  );

  const close = useCallback(() => {
    onClose?.(current);
  }, [onClose, current]);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= total) return;
      setCurrent(index);
    },
    [setCurrent, total],
  );

  const next = useCallback(async () => {
    // 拦截器: 步级 onNext 返回 false / Promise<false> 则阻止前进
    const guard = steps[current]?.onNext;
    if (guard) {
      try {
        const r = await guard();
        if (r === false) return;
      } catch {
        return;
      }
    }
    if (isLast) {
      onFinish?.();
      onClose?.(current);
      return;
    }
    setCurrent(current + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, isLast, onFinish, onClose, setCurrent, steps]);
  const prev = useCallback(() => {
    if (!isFirst) setCurrent(current - 1);
  }, [isFirst, current, setCurrent]);

  /* 量目标 + 滚到可视区
     注意: 不要把 step 直接放 deps — 调用方 inline 传 steps={[...]} 时 step 每次 render 都是新对象,
     会导致 useLayoutEffect 反复触发 setRect 形成死循环, 整页一直是首帧的 flat-mask(看起来"全黑")。
     只依赖 [open, current] 这种稳定值。 */
  useLayoutEffect(() => {
    if (!open) return;
    const s = steps[current];
    if (!s) return;
    const target = resolveTarget(s.target);
    if (!target) {
      setRect(null);
      return;
    }
    if (scrollIntoViewOptions !== false) {
      const opts = scrollIntoViewOptions === true ? undefined : scrollIntoViewOptions;
      target.scrollIntoView(opts);
    }
    const update = () => {
      const r = measure(target);
      // 写入前比对一下, 同值不写, 防御性避免环
      setRect((prev) => {
        if (
          prev &&
          r &&
          prev.top === r.top &&
          prev.left === r.left &&
          prev.width === r.width &&
          prev.height === r.height
        ) {
          return prev;
        }
        return r;
      });
    };
    update();
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(update);
      ro.observe(target);
    }
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      ro?.disconnect();
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, current]);

  /* 量卡片 + 算位置 — 同样只依赖稳定值 */
  useLayoutEffect(() => {
    if (!open) return;
    const s = steps[current];
    if (!s) return;
    const card = cardRef.current;
    if (!card) return;
    const update = () => {
      const placement = s.placement ?? (rect ? 'bottom' : 'center');
      const p = computePopoverPos(
        rect,
        card,
        placement,
        gap,
        window.innerWidth,
        window.innerHeight,
      );
      setPop((prev) =>
        prev.top === p.top &&
        prev.left === p.left &&
        prev.arrowSide === p.arrowSide &&
        prev.arrowOffset === p.arrowOffset
          ? prev
          : p,
      );
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, current, rect]);

  /* 键盘 — Esc 关闭(尊重 closable), ←/→ 翻页 */
  useEffect(() => {
    if (!open) return;
    const stepClosable = steps[current]?.closable ?? closable;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!stepClosable) return;
        e.preventDefault();
        close();
      } else if (e.key === 'ArrowLeft') {
        if (!isFirst) {
          e.preventDefault();
          prev();
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, current, total, closable]);

  /* 进入第一个 step 时触发 onEnter */
  useEffect(() => {
    if (!open) return;
    steps[current]?.onEnter?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const stepMask = step?.mask ?? mask;
  const stepArrow = step?.arrow ?? arrow;
  const padding = step?.spotlightPadding ?? 6;
  // 区分 "中央步(本来就没 target)" vs "目标步但首帧未量好"
  const stepHasTarget = step?.target != null;

  const rootStyle = useMemo<React.CSSProperties>(
    () => ({
      zIndex: zIndex ?? undefined,
      ...style,
    }),
    [zIndex, style],
  );

  if (!open || !step) return null;

  const showSpotlight = !!rect && stepMask;
  const spotlight = showSpotlight && rect ? (
    <div
      className="au-tour__spotlight"
      style={{
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      }}
      aria-hidden
    />
  ) : null;

  // 仅当此步明确没有 target(中央/欢迎/结束页)时才用整页遮罩。
  // 目标步首帧 rect 还没量好时不渲染 flat-mask, 否则 box-shadow 0 0 0 100vmax 会覆盖整页 → 黑屏。
  const flatMask =
    stepMask && !stepHasTarget ? <div className="au-tour__flat-mask" aria-hidden /> : null;

  const arrowStyle: React.CSSProperties = {};
  if (pop.arrowSide === 'top') {
    arrowStyle.top = -5;
    arrowStyle.left = pop.arrowOffset - 5;
  } else if (pop.arrowSide === 'bottom') {
    arrowStyle.bottom = -5;
    arrowStyle.left = pop.arrowOffset - 5;
  } else if (pop.arrowSide === 'left') {
    arrowStyle.left = -5;
    arrowStyle.top = pop.arrowOffset - 5;
  } else if (pop.arrowSide === 'right') {
    arrowStyle.right = -5;
    arrowStyle.top = pop.arrowOffset - 5;
  }

  const card = (
    <div
      ref={cardRef}
      role="dialog"
      aria-modal="true"
      aria-label={typeof step.title === 'string' ? step.title : locale.Tour.stepAriaLabel}
      tabIndex={-1}
      className={[
        'au-tour__card',
        `au-tour__card--${type}`,
        pop.arrowSide ? `au-tour__card--arrow-${pop.arrowSide}` : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        top: pop.top,
        left: pop.left,
      }}
    >
      {step.cover && <div className="au-tour__cover">{step.cover}</div>}
      <div className="au-tour__head">
        {step.title && <div className="au-tour__title">{step.title}</div>}
        {(step.closable ?? closable) && (
          <button
            type="button"
            className="au-tour__close"
            onClick={close}
            aria-label={locale.Common.close}
          >
            <CloseIcon />
          </button>
        )}
      </div>
      {step.description && <div className="au-tour__desc">{step.description}</div>}
      <div className="au-tour__footer">
        <span className="au-tour__progress" aria-label={`步骤 ${current + 1} / ${total}`}>
          {current + 1} / {total}
        </span>
        <div className="au-tour__actions">
          {step.actions ? (
            step.actions({ current, total, isFirst, isLast, next, prev, close, goTo })
          ) : (
            <>
              {!isFirst && (
                <button type="button" className="au-tour__btn au-tour__btn--ghost" onClick={prev}>
                  {step.prevButtonText ?? tPrev}
                </button>
              )}
              {isLast ? (
                <button type="button" className="au-tour__btn au-tour__btn--primary" onClick={next}>
                  {tFinish}
                </button>
              ) : (
                <button type="button" className="au-tour__btn au-tour__btn--primary" onClick={next}>
                  {step.nextButtonText ?? tNext}
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {stepArrow && pop.arrowSide && (
        <span
          className={`au-tour__arrow au-tour__arrow--${pop.arrowSide}`}
          style={arrowStyle}
          aria-hidden
        />
      )}
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className="au-tour" style={rootStyle}>
      {flatMask}
      {spotlight}
      {card}
    </div>,
    document.body,
  );
};

export default Tour;
