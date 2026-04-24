import React, { useEffect, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { createPortal } from 'react-dom';
import './TopProgress.css';

export interface TopProgressProps {
  /** 是否显示 */
  visible?: boolean;
  /** 0-100 百分比; 不传 = 自动爬升到 90% (不确定进度) */
  percent?: number;
  /** 条形高度 (px), 默认 3 */
  height?: number;
  /** 主色, 覆盖 --au-primary */
  color?: string;
  /** 是否显示右上角旋转小圆圈 */
  showSpinner?: boolean;
  /** 层级, 默认 9999 */
  zIndex?: number;
  /** 完成后淡出时长 (ms), 默认 400 */
  fadeDuration?: number;
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));

interface TopProgressComponent extends React.FC<TopProgressProps> {
  start: () => void;
  set: (percent: number) => void;
  inc: (amount?: number) => void;
  done: () => void;
}

const TopProgress: TopProgressComponent = (props) => {
  const {
    visible = false,
    percent,
    height = 3,
    color,
    showSpinner = false,
    zIndex = 9999,
    fadeDuration = 400,
  } = props;

  // internal trickle value (used only when percent is undefined)
  const [trickle, setTrickle] = useState(0);
  const [mounted, setMounted] = useState(visible);
  const [entered, setEntered] = useState(false);

  const rafRef = useRef<number | null>(null);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // handle fade in/out
  useEffect(() => {
    if (visible) {
      setMounted(true);
      rafRef.current = requestAnimationFrame(() => setEntered(true));
      return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      };
    }
    setEntered(false);
    const t = setTimeout(() => setMounted(false), fadeDuration);
    return () => clearTimeout(t);
  }, [visible, fadeDuration]);

  // auto-trickle when percent not supplied
  useEffect(() => {
    if (!visible || percent !== undefined) {
      if (tickerRef.current) clearInterval(tickerRef.current);
      return;
    }
    setTrickle(0);
    tickerRef.current = setInterval(() => {
      setTrickle((p) => {
        if (p >= 90) return p;
        const step = Math.max(0.5, (90 - p) * 0.1);
        return p + step;
      });
    }, 300);
    return () => {
      if (tickerRef.current) clearInterval(tickerRef.current);
    };
  }, [visible, percent]);

  if (!mounted) return null;

  const displayPct =
    percent !== undefined ? clamp(percent) : clamp(trickle);

  const styleVars: React.CSSProperties = {
    ['--au-tp-h' as string]: `${height}px`,
    zIndex,
    opacity: entered ? 1 : 0,
    transition: `opacity ${fadeDuration}ms var(--au-ease)`,
  };
  if (color) (styleVars as Record<string, string>)['--au-tp-color'] = color;

  return createPortal(
    <div
      className="au-top-progress"
      style={styleVars}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(displayPct)}
    >
      <div
        className="au-top-progress__bar"
        style={{ width: `${displayPct}%` }}
      >
        <div className="au-top-progress__peg" />
      </div>
      {showSpinner && <div className="au-top-progress__spinner" />}
    </div>,
    document.body
  );
};

TopProgress.displayName = 'TopProgress';

/* ---------------- singleton imperative API ---------------- */

interface GState {
  visible: boolean;
  percent?: number;
  showSpinner: boolean;
  color?: string;
  height: number;
}

let gState: GState = { visible: false, showSpinner: false, height: 3 };
let gListeners: Array<() => void> = [];
let gRoot: Root | null = null;
let gHost: HTMLDivElement | null = null;
let gTrickleTimer: ReturnType<typeof setInterval> | null = null;
let gDoneTimer: ReturnType<typeof setTimeout> | null = null;
let gCurrent = 0;

const gEmit = () => {
  gState = { ...gState };
  gListeners.forEach((fn) => fn());
};
const gSet = (p: Partial<GState>) => {
  gState = { ...gState, ...p };
  gListeners.forEach((fn) => fn());
};

const GSubscriber: React.FC = () => {
  const [, tick] = useState(0);
  useEffect(() => {
    const fn = () => tick((n) => n + 1);
    gListeners.push(fn);
    return () => {
      gListeners = gListeners.filter((l) => l !== fn);
    };
  }, []);
  return <TopProgress {...gState} />;
};

const ensureMounted = () => {
  if (typeof document === 'undefined') return;
  if (!gHost) {
    gHost = document.createElement('div');
    gHost.setAttribute('data-au-top-progress-host', '');
    document.body.appendChild(gHost);
    gRoot = createRoot(gHost);
    gRoot.render(<GSubscriber />);
  }
};

const clearTrickle = () => {
  if (gTrickleTimer) {
    clearInterval(gTrickleTimer);
    gTrickleTimer = null;
  }
};
const clearDone = () => {
  if (gDoneTimer) {
    clearTimeout(gDoneTimer);
    gDoneTimer = null;
  }
};

TopProgress.start = () => {
  ensureMounted();
  clearTrickle();
  clearDone();
  gCurrent = 0;
  gSet({ visible: true, percent: 0 });
  gTrickleTimer = setInterval(() => {
    if (gCurrent < 90) {
      const step = Math.max(0.5, (90 - gCurrent) * 0.08);
      gCurrent = Math.min(90, gCurrent + step);
      gSet({ percent: gCurrent });
    }
  }, 300);
};

TopProgress.set = (n) => {
  ensureMounted();
  clearTrickle();
  clearDone();
  gCurrent = clamp(n);
  gSet({ visible: true, percent: gCurrent });
};

TopProgress.inc = (amount = 5) => {
  if (!gState.visible) {
    TopProgress.start();
    return;
  }
  gCurrent = Math.min(95, gCurrent + amount);
  gSet({ percent: gCurrent });
};

TopProgress.done = () => {
  clearTrickle();
  clearDone();
  gCurrent = 100;
  gSet({ percent: 100 });
  gDoneTimer = setTimeout(() => {
    gSet({ visible: false });
    gDoneTimer = null;
  }, 260);
};

export default TopProgress;
