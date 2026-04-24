import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './Slider.css';

export type SliderValue = number | [number, number];

export interface SliderMark {
  value: number;
  label?: React.ReactNode;
}

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface SliderProps {
  value?: SliderValue;
  defaultValue?: SliderValue;
  min?: number;
  max?: number;
  step?: number | null;
  range?: boolean;
  marks?: SliderMark[];
  disabled?: boolean;
  vertical?: boolean;
  reverse?: boolean;
  showTooltip?: 'always' | 'hover' | 'never';
  tooltipFormatter?: (value: number) => React.ReactNode;
  tooltipPlacement?: TooltipPlacement;
  onChange?: (value: SliderValue) => void;
  onChangeComplete?: (value: SliderValue) => void;
  className?: string;
  style?: React.CSSProperties;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const snapTo = (v: number, step: number | null | undefined, min: number) => {
  if (step == null || step <= 0) return v;
  const rel = v - min;
  const snapped = Math.round(rel / step) * step;
  return min + snapped;
};

const toArray = (v: SliderValue | undefined, fallback: [number, number]): [number, number] => {
  if (v == null) return fallback;
  if (Array.isArray(v)) return [...v] as [number, number];
  return [fallback[0], v];
};

const Slider: React.FC<SliderProps> = ({
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  range,
  marks,
  disabled,
  vertical,
  reverse,
  showTooltip = 'hover',
  tooltipFormatter,
  tooltipPlacement,
  onChange,
  onChangeComplete,
  className = '',
  style,
}) => {
  const isControlled = value !== undefined;
  const baseDefault: [number, number] = useMemo(() => {
    if (range) {
      if (defaultValue != null && Array.isArray(defaultValue)) {
        return [defaultValue[0], defaultValue[1]];
      }
      return [min, max];
    }
    if (defaultValue != null && !Array.isArray(defaultValue)) return [min, defaultValue];
    return [min, min];
  }, [defaultValue, range, min, max]);

  const [inner, setInner] = useState<[number, number]>(baseDefault);
  const vals: [number, number] = useMemo(() => {
    if (isControlled) {
      if (range) {
        return Array.isArray(value) ? [value[0], value[1]] : [min, min];
      }
      return [min, typeof value === 'number' ? value : min];
    }
    return inner;
  }, [isControlled, value, range, min, inner]);

  const trackRef = useRef<HTMLDivElement>(null);
  const [activeHandle, setActiveHandle] = useState<0 | 1 | null>(null);
  const [hovering, setHovering] = useState(false);
  const draggingRef = useRef(false);

  const lo = range ? Math.min(vals[0], vals[1]) : min;
  const hi = range ? Math.max(vals[0], vals[1]) : vals[1];

  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  const emit = useCallback(
    (next: [number, number], final: boolean) => {
      const out: SliderValue = range ? [Math.min(next[0], next[1]), Math.max(next[0], next[1])] : next[1];
      if (!isControlled) setInner(next);
      onChange?.(out);
      if (final) onChangeComplete?.(out);
    },
    [isControlled, onChange, onChangeComplete, range],
  );

  const valueFromPointer = useCallback(
    (clientX: number, clientY: number): number => {
      if (!trackRef.current) return min;
      const rect = trackRef.current.getBoundingClientRect();
      let ratio: number;
      if (vertical) {
        ratio = (rect.bottom - clientY) / rect.height;
      } else {
        ratio = (clientX - rect.left) / rect.width;
      }
      if (reverse) ratio = 1 - ratio;
      ratio = clamp(ratio, 0, 1);
      const raw = min + ratio * (max - min);
      return clamp(snapTo(raw, step, min), min, max);
    },
    [min, max, step, vertical, reverse],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    const v = valueFromPointer(e.clientX, e.clientY);
    const live: [number, number] = [vals[0], vals[1]];
    let handle: 0 | 1;
    if (range) {
      const d0 = Math.abs(v - vals[0]);
      const d1 = Math.abs(v - vals[1]);
      handle = d0 <= d1 ? 0 : 1;
      live[handle] = v;
    } else {
      handle = 1;
      live[1] = v;
    }
    setActiveHandle(handle);
    draggingRef.current = true;
    emit([live[0], live[1]], false);

    const move = (ev: PointerEvent) => {
      const nv = valueFromPointer(ev.clientX, ev.clientY);
      if (range) live[handle] = nv;
      else live[1] = nv;
      emit([live[0], live[1]], false);
    };
    const up = () => {
      draggingRef.current = false;
      setActiveHandle(null);
      emit([live[0], live[1]], true);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const onKeyDown = (idx: 0 | 1) => (e: React.KeyboardEvent) => {
    if (disabled) return;
    const incKeys = ['ArrowRight', 'ArrowUp'];
    const decKeys = ['ArrowLeft', 'ArrowDown'];
    const big = step && step > 0 ? step * 10 : 10;
    let delta = 0;
    if (incKeys.includes(e.key)) delta = step ?? 1;
    else if (decKeys.includes(e.key)) delta = -(step ?? 1);
    else if (e.key === 'PageUp') delta = big;
    else if (e.key === 'PageDown') delta = -big;
    else if (e.key === 'Home') {
      e.preventDefault();
      const next: [number, number] = [...vals] as [number, number];
      next[idx] = min;
      emit(next, true);
      return;
    } else if (e.key === 'End') {
      e.preventDefault();
      const next: [number, number] = [...vals] as [number, number];
      next[idx] = max;
      emit(next, true);
      return;
    } else {
      return;
    }
    e.preventDefault();
    const next: [number, number] = [...vals] as [number, number];
    next[idx] = clamp(snapTo(next[idx] + delta, step, min), min, max);
    emit(next, true);
  };

  // prevent stale "active" on disable
  useEffect(() => {
    if (disabled) {
      setActiveHandle(null);
    }
  }, [disabled]);

  const formatTip = (v: number) => (tooltipFormatter ? tooltipFormatter(v) : v);

  const showTipFor = (idx: 0 | 1) => {
    if (showTooltip === 'never') return false;
    if (showTooltip === 'always') return true;
    if (activeHandle === idx) return true;
    if (hovering && !draggingRef.current) return true;
    return false;
  };

  const placement: TooltipPlacement =
    tooltipPlacement ?? (vertical ? 'right' : 'top');

  const dirKey = vertical ? 'bottom' : reverse ? 'right' : 'left';
  const sizeKey = vertical ? 'height' : 'width';

  const fillStyle: React.CSSProperties = range
    ? {
        [dirKey]: `${pct(lo)}%`,
        [sizeKey]: `${pct(hi) - pct(lo)}%`,
      }
    : {
        [dirKey]: `0%`,
        [sizeKey]: `${pct(hi)}%`,
      };

  const handleStyle = (v: number): React.CSSProperties => ({
    [dirKey]: `${pct(v)}%`,
  });

  const wrapperCls = [
    'au-slider',
    vertical ? 'au-slider--vertical' : 'au-slider--horizontal',
    reverse ? 'is-reverse' : '',
    disabled ? 'is-disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderHandle = (v: number, idx: 0 | 1) => {
    const style = handleStyle(v);
    const ariaOrientation = vertical ? 'vertical' : 'horizontal';
    return (
      <span
        key={idx}
        className={[
          'au-slider__handle',
          activeHandle === idx ? 'is-active' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={style}
        tabIndex={disabled ? -1 : 0}
        role="slider"
        aria-orientation={ariaOrientation}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={v}
        aria-disabled={disabled}
        onKeyDown={onKeyDown(idx)}
      >
        {showTipFor(idx) && (
          <span className={`au-slider__tooltip au-slider__tooltip--${placement}`}>
            {formatTip(v)}
          </span>
        )}
      </span>
    );
  };

  return (
    <div
      className={wrapperCls}
      style={style}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div
        ref={trackRef}
        className="au-slider__rail"
        onPointerDown={onPointerDown}
      >
        <div className="au-slider__fill" style={fillStyle} />

        {marks && marks.length > 0 && (
          <div className="au-slider__marks">
            {marks.map((m) => {
              const active = m.value >= lo && m.value <= hi;
              return (
                <span
                  key={m.value}
                  className={['au-slider__mark', active ? 'is-active' : ''].filter(Boolean).join(' ')}
                  style={handleStyle(m.value)}
                />
              );
            })}
          </div>
        )}

        {range ? (
          <>
            {renderHandle(vals[0], 0)}
            {renderHandle(vals[1], 1)}
          </>
        ) : (
          renderHandle(vals[1], 1)
        )}
      </div>

      {marks && marks.length > 0 && (
        <div className="au-slider__mark-labels">
          {marks.map((m) =>
            m.label != null ? (
              <span
                key={m.value}
                className="au-slider__mark-label"
                style={handleStyle(m.value)}
              >
                {m.label}
              </span>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
};

export default Slider;
