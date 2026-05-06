import React, {
  Children,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocale } from '../ConfigProvider/ConfigProvider';
import './Carousel.css';

export type CarouselEffect = 'slide' | 'fade';
export type CarouselDotPosition = 'bottom' | 'top';

export interface CarouselProps {
  /** 子节点 = 幻灯片. 每个 ReactNode 一张 */
  children: React.ReactNode;
  /** 当前幻灯片下标 (受控) */
  current?: number;
  /** 默认下标 (非受控) */
  defaultCurrent?: number;
  /** 切换效果, 默认 'slide' (横滑); 'fade' 是淡入淡出, 适合图片 */
  effect?: CarouselEffect;
  /** 自动播放间隔 ms (传 0 / false 关闭) */
  autoplay?: number | boolean;
  /** 鼠标 hover 时暂停自动播放 */
  pauseOnHover?: boolean;
  /** 是否循环 (走完最后一张回到第一张, 反过来同理) */
  loop?: boolean;
  /** 是否显示左右箭头 */
  arrows?: boolean;
  /** 是否显示底部指示点 */
  dots?: boolean;
  /** 指示点位置 */
  dotPosition?: CarouselDotPosition;
  /** 高度 (string | number) — 不给的话用容器自然高度 */
  height?: number | string;
  /** 切换动画时长 ms */
  duration?: number;
  /** 切换时回调 */
  onChange?: (index: number, prev: number) => void;
  /** 启用键盘 ←/→ 切换 (要求容器 focus, role=region) */
  keyboard?: boolean;
  /** 触摸 / 鼠标拖拽切换 */
  draggable?: boolean;
  /** 拖动多少 px 触发翻页 (默认 50) */
  swipeThreshold?: number;
  className?: string;
  style?: React.CSSProperties;
}

export interface CarouselRef {
  /** 切到指定下标 (会按 loop 处理越界) */
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
}

const ChevronL: React.FC = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
    <path d="M10 3l-5 5 5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronR: React.FC = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
    <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const tpl = (s: string, m: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(m[k] ?? ''));

const Carousel = forwardRef<CarouselRef, CarouselProps>(
  (
    {
      children,
      current: ctrl,
      defaultCurrent = 0,
      effect = 'slide',
      autoplay = 0,
      pauseOnHover = true,
      loop = true,
      arrows = false,
      dots = true,
      dotPosition = 'bottom',
      height,
      duration = 400,
      onChange,
      keyboard = true,
      draggable = true,
      swipeThreshold = 50,
      className = '',
      style,
    },
    ref,
  ) => {
    const locale = useLocale();
    const slides = useMemo(() => Children.toArray(children).filter(Boolean), [children]);
    const total = slides.length;

    const isCtrl = ctrl !== undefined;
    const [inner, setInner] = useState(defaultCurrent);
    const active = Math.max(0, Math.min(total - 1, isCtrl ? ctrl! : inner));

    /** 是否处于交互(hover / 拖动)— 暂停自动播放 */
    const [interacting, setInteracting] = useState(false);
    /** 拖动状态 */
    const dragRef = useRef<{ startX: number; dx: number; active: boolean }>({
      startX: 0,
      dx: 0,
      active: false,
    });
    const [dragOffset, setDragOffset] = useState(0);

    const goTo = useCallback(
      (next: number) => {
        if (total === 0) return;
        let target = next;
        if (loop) {
          target = ((next % total) + total) % total;
        } else {
          target = Math.max(0, Math.min(total - 1, next));
        }
        if (target === active) return;
        if (!isCtrl) setInner(target);
        onChange?.(target, active);
      },
      [active, isCtrl, loop, onChange, total],
    );

    const next = useCallback(() => goTo(active + 1), [active, goTo]);
    const prev = useCallback(() => goTo(active - 1), [active, goTo]);

    useImperativeHandle(ref, () => ({ goTo, next, prev }), [goTo, next, prev]);

    /* ---------------- 自动播放 ---------------- */
    const interval = typeof autoplay === 'number' ? autoplay : autoplay ? 3000 : 0;
    useEffect(() => {
      if (!interval || total <= 1) return;
      if (interacting) return;
      const id = window.setTimeout(() => {
        goTo(active + 1);
      }, interval);
      return () => window.clearTimeout(id);
    }, [active, interval, interacting, goTo, total]);

    /* ---------------- 键盘 ---------------- */
    const rootRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (!keyboard) return;
      const root = rootRef.current;
      if (!root) return;
      const onKey = (e: KeyboardEvent) => {
        // 只在容器内有 focus 才响应, 避免全局劫持方向键
        if (!root.contains(document.activeElement)) return;
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prev();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          next();
        }
      };
      root.addEventListener('keydown', onKey as EventListener);
      return () => root.removeEventListener('keydown', onKey as EventListener);
    }, [keyboard, next, prev]);

    /* ---------------- 拖拽 / 触摸 ---------------- */
    const onPointerDown = (e: React.PointerEvent) => {
      if (!draggable || total <= 1) return;
      // 不响应中键 / 右键
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragRef.current.active = true;
      dragRef.current.startX = e.clientX;
      dragRef.current.dx = 0;
      setDragOffset(0);
      (e.target as Element).setPointerCapture?.(e.pointerId);
    };
    const onPointerMove = (e: React.PointerEvent) => {
      if (!dragRef.current.active) return;
      dragRef.current.dx = e.clientX - dragRef.current.startX;
      setDragOffset(dragRef.current.dx);
    };
    const onPointerUp = () => {
      if (!dragRef.current.active) return;
      const dx = dragRef.current.dx;
      dragRef.current.active = false;
      dragRef.current.dx = 0;
      setDragOffset(0);
      if (Math.abs(dx) >= swipeThreshold) {
        if (dx < 0) next();
        else prev();
      }
    };

    /* ---------------- 视觉位置 ---------------- */
    const trackStyle: React.CSSProperties =
      effect === 'slide'
        ? {
            transform: `translateX(calc(${-active * 100}% + ${dragOffset}px))`,
            transition: dragRef.current.active ? 'none' : `transform ${duration}ms var(--au-ease, ease)`,
          }
        : {};

    /* ---------------- a11y ---------------- */
    const liveText = total > 0 ? tpl(locale.Carousel.slideOfTotal, { n: active + 1, total }) : '';

    if (total === 0) return null;

    const cls = [
      'au-carousel',
      `au-carousel--${effect}`,
      `au-carousel--dots-${dotPosition}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={rootRef}
        className={cls}
        style={{ ...(height != null ? { height } : null), ...style }}
        role="region"
        aria-roledescription="carousel"
        tabIndex={keyboard ? 0 : undefined}
        onMouseEnter={pauseOnHover ? () => setInteracting(true) : undefined}
        onMouseLeave={pauseOnHover ? () => setInteracting(false) : undefined}
      >
        <div
          className="au-carousel__viewport"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {effect === 'slide' ? (
            <div className="au-carousel__track" style={trackStyle}>
              {slides.map((slide, i) => (
                <div
                  key={i}
                  className="au-carousel__slide"
                  role="group"
                  aria-roledescription="slide"
                  aria-hidden={i !== active}
                  aria-label={tpl(locale.Carousel.slideOfTotal, { n: i + 1, total })}
                >
                  {slide}
                </div>
              ))}
            </div>
          ) : (
            // fade — 所有 slide 叠在一起, 用 opacity 切
            slides.map((slide, i) => (
              <div
                key={i}
                className={['au-carousel__slide', 'au-carousel__slide--fade', i === active ? 'is-active' : '']
                  .filter(Boolean)
                  .join(' ')}
                style={{ transitionDuration: `${duration}ms` }}
                role="group"
                aria-roledescription="slide"
                aria-hidden={i !== active}
                aria-label={tpl(locale.Carousel.slideOfTotal, { n: i + 1, total })}
              >
                {slide}
              </div>
            ))
          )}
        </div>

        {arrows && total > 1 && (
          <>
            <button
              type="button"
              className="au-carousel__arrow au-carousel__arrow--prev"
              onClick={prev}
              aria-label={locale.Carousel.prev}
            >
              <ChevronL />
            </button>
            <button
              type="button"
              className="au-carousel__arrow au-carousel__arrow--next"
              onClick={next}
              aria-label={locale.Carousel.next}
            >
              <ChevronR />
            </button>
          </>
        )}

        {dots && total > 1 && (
          <ul className="au-carousel__dots" role="tablist">
            {slides.map((_, i) => (
              <li key={i}>
                <button
                  type="button"
                  className={['au-carousel__dot', i === active ? 'is-active' : ''].filter(Boolean).join(' ')}
                  onClick={() => goTo(i)}
                  role="tab"
                  aria-selected={i === active}
                  aria-label={tpl(locale.Carousel.goToSlide, { n: i + 1 })}
                />
              </li>
            ))}
          </ul>
        )}

        {/* 给屏幕阅读器播报当前张数 */}
        <div className="au-carousel__sr-live" aria-live="polite" aria-atomic>
          {liveText}
        </div>
      </div>
    );
  },
);

Carousel.displayName = 'Carousel';

export default Carousel;
