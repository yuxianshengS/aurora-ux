import React, { useEffect, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { createPortal } from 'react-dom';
import './FullscreenProgress.css';

export type ProgressVariant = 'linear' | 'circular';

export interface FullscreenProgressProps {
  open: boolean;
  /** 0-100; 不传 = 不确定进度 (旋转动画) */
  percent?: number;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ProgressVariant;
  /** 是否显示百分比文字, 默认 true */
  showPercent?: boolean;
  /** 进度条主色, 默认使用 --au-primary */
  color?: string;
  /** 遮罩透明度 0-1, 默认 0.55 */
  maskOpacity?: number;
  /** 层级, 默认 9999 */
  zIndex?: number;
  /** 淡出时长 (ms), 与 CSS 同步; 默认 260 */
  fadeDuration?: number;
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));

const Ring: React.FC<{
  percent?: number;
  showPercent: boolean;
}> = ({ percent, showPercent }) => {
  const r = 32;
  const C = 2 * Math.PI * r;
  const indeterminate = percent === undefined;
  const p = indeterminate ? 0 : clamp(percent);
  const offset = C * (1 - p / 100);
  return (
    <div
      className={`au-fs-progress__ring${
        indeterminate ? ' is-indeterminate' : ''
      }`}
    >
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          strokeWidth="6"
          className="au-fs-progress__ring-track"
        />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          strokeWidth="6"
          className="au-fs-progress__ring-fill"
          strokeDasharray={C}
          strokeDashoffset={indeterminate ? undefined : offset}
        />
      </svg>
      {!indeterminate && showPercent && (
        <div className="au-fs-progress__ring-text">{Math.round(p)}%</div>
      )}
    </div>
  );
};

const Bar: React.FC<{
  percent?: number;
  showPercent: boolean;
}> = ({ percent, showPercent }) => {
  const indeterminate = percent === undefined;
  const p = indeterminate ? 0 : clamp(percent);
  return (
    <>
      <div className="au-fs-progress__bar">
        {indeterminate ? (
          <div className="au-fs-progress__bar-indeterminate" />
        ) : (
          <div
            className="au-fs-progress__bar-fill"
            style={{ width: `${p}%` }}
          />
        )}
      </div>
      {!indeterminate && showPercent && (
        <div className="au-fs-progress__bar-text">{Math.round(p)}%</div>
      )}
    </>
  );
};

interface FSPComponent extends React.FC<FullscreenProgressProps> {
  start: (opts?: StartOptions) => Handle;
  update: (percent: number) => void;
  setText: (title?: React.ReactNode, description?: React.ReactNode) => void;
  finish: (delayMs?: number) => void;
  close: () => void;
}

const FullscreenProgress: FSPComponent = (props) => {
  const {
    open,
    percent,
    title,
    description,
    variant = 'linear',
    showPercent = true,
    color,
    maskOpacity = 0.55,
    zIndex = 9999,
    fadeDuration = 260,
  } = props;

  const [mounted, setMounted] = useState(open);
  const [entered, setEntered] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      rafRef.current = requestAnimationFrame(() => setEntered(true));
      return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      };
    }
    setEntered(false);
    const t = setTimeout(() => setMounted(false), fadeDuration);
    return () => clearTimeout(t);
  }, [open, fadeDuration]);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  if (!mounted) return null;

  const styleVars: React.CSSProperties = {
    ['--au-fs-mask' as string]: String(maskOpacity),
    ['--au-fs-duration' as string]: `${fadeDuration}ms`,
    zIndex,
  };
  if (color) {
    (styleVars as Record<string, string>)['--au-fs-color'] = color;
  }

  return createPortal(
    <div
      className={`au-fs-progress${entered ? ' is-open' : ''}`}
      style={styleVars}
      role="progressbar"
      aria-busy="true"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={
        percent === undefined ? undefined : clamp(percent)
      }
    >
      <div className="au-fs-progress__panel">
        {title !== undefined && (
          <div className="au-fs-progress__title">{title}</div>
        )}
        {description !== undefined && (
          <div className="au-fs-progress__desc">{description}</div>
        )}
        {variant === 'circular' ? (
          <Ring percent={percent} showPercent={showPercent} />
        ) : (
          <Bar percent={percent} showPercent={showPercent} />
        )}
      </div>
    </div>,
    document.body
  );
};

FullscreenProgress.displayName = 'FullscreenProgress';

/* --------------------- imperative singleton --------------------- */

interface StartOptions extends Omit<FullscreenProgressProps, 'open'> {}

interface Handle {
  update: (percent: number) => Handle;
  setText: (
    title?: React.ReactNode,
    description?: React.ReactNode
  ) => Handle;
  finish: (delayMs?: number) => void;
  close: () => void;
}

type State = StartOptions & { open: boolean };
let state: State = { open: false };
let listeners: Array<() => void> = [];
let root: Root | null = null;
let host: HTMLDivElement | null = null;
let closeTimer: ReturnType<typeof setTimeout> | null = null;

const emit = () => {
  state = { ...state };
  listeners.forEach((fn) => fn());
};

const setPartial = (p: Partial<State>) => {
  state = { ...state, ...p };
  listeners.forEach((fn) => fn());
};

const Subscriber: React.FC = () => {
  const [, tick] = useState(0);
  useEffect(() => {
    const fn = () => tick((n) => n + 1);
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  }, []);
  return <FullscreenProgress {...state} />;
};

const ensureMounted = () => {
  if (typeof document === 'undefined') return;
  if (!host) {
    host = document.createElement('div');
    host.setAttribute('data-au-fs-progress-host', '');
    document.body.appendChild(host);
    root = createRoot(host);
    root.render(<Subscriber />);
  }
};

const handle: Handle = {
  update(percent) {
    setPartial({ percent });
    return handle;
  },
  setText(title, description) {
    setPartial({ title, description });
    return handle;
  },
  finish(delayMs = 400) {
    setPartial({ percent: 100 });
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      setPartial({ open: false });
      closeTimer = null;
    }, delayMs);
  },
  close() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    setPartial({ open: false });
  },
};

FullscreenProgress.start = (opts = {}) => {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
  ensureMounted();
  // fresh state from opts, then open
  state = { ...opts, open: true };
  emit();
  return handle;
};

FullscreenProgress.update = (percent) => {
  handle.update(percent);
};
FullscreenProgress.setText = (title, description) => {
  handle.setText(title, description);
};
FullscreenProgress.finish = (delayMs) => {
  handle.finish(delayMs);
};
FullscreenProgress.close = () => {
  handle.close();
};

export default FullscreenProgress;
