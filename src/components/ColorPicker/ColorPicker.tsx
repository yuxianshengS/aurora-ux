import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { hexToHsl, hslToHex } from '../../utils/generateTheme';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import './ColorPicker.css';

export interface ColorPickerProps {
  /** 受控值 hex */
  value?: string;
  /** 非受控初始 */
  defaultValue?: string;
  /** 触发器尺寸 */
  size?: 'small' | 'medium' | 'large';
  /** 禁用 */
  disabled?: boolean;
  /** 预设色板 */
  presets?: string[];
  /** 显示 hex 输入 */
  showInput?: boolean;
  /** 触发器自定义渲染 */
  trigger?: React.ReactNode;
  /** 颜色变化(确认) */
  onChange?: (hex: string) => void;
  /** 实时变化(拖动 picker 时连续触发) */
  onChangeComplete?: (hex: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_PRESETS = [
  '#ef4444', '#f59e0b', '#fbbf24', '#10b981', '#06b6d4',
  '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f43f5e',
  '#1f2937', '#6b7280', '#d1d5db', '#ffffff', '#000000',
];

const ColorPicker: React.FC<ColorPickerProps> = ({
  value: ctrlValue,
  defaultValue = '#5b8def',
  size = 'medium',
  disabled,
  presets = DEFAULT_PRESETS,
  showInput = true,
  trigger,
  onChange,
  onChangeComplete,
  className = '',
  style,
}) => {
  const isCtrl = ctrlValue !== undefined;
  const [innerValue, setInnerValue] = useState(defaultValue);
  const value = isCtrl ? ctrlValue! : innerValue;
  const [open, setOpen] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // HSL state for the picker UI
  const [h, setH] = useState(0);
  const [s, setS] = useState(0);
  const [l, setL] = useState(0);

  useEffect(() => {
    const [hh, ss, ll] = hexToHsl(value);
    setH(hh);
    setS(ss);
    setL(ll);
  }, [value]);

  const setColor = (next: string) => {
    if (!isCtrl) setInnerValue(next);
    onChange?.(next);
  };

  const live = (next: string) => {
    if (!isCtrl) setInnerValue(next);
    onChangeComplete?.(next);
  };

  // 定位
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      const r = triggerRef.current!.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  // 外部点击关闭
  useOutsideClick([triggerRef, popupRef], () => setOpen(false), open);

  // Saturation/Lightness 板拖动
  const satRef = useRef<HTMLDivElement>(null);
  const onSatPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const el = satRef.current;
    if (!el) return;
    const move = (ev: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = Math.max(0, Math.min(r.width, ev.clientX - r.left));
      const y = Math.max(0, Math.min(r.height, ev.clientY - r.top));
      const newS = x / r.width;
      // 这里 y=0 → l=1 顶部最亮; y=max → l 由 s 决定
      // 用 HSV→HSL 简化: y 控制 V (亮度), 内部转 HSL
      const v = 1 - y / r.height;
      // V/HSV → L/HSL: l = v - v*s/2;
      const newL = v - (v * newS) / 2;
      setS(newS);
      setL(newL);
      live(hslToHex(h, newS, newL));
    };
    const up = (ev: PointerEvent) => {
      move(ev);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setColor(hslToHex(h, s, l));
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    move(e.nativeEvent);
  };

  // Hue 滑条
  const hueRef = useRef<HTMLDivElement>(null);
  const onHuePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const el = hueRef.current;
    if (!el) return;
    const move = (ev: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = Math.max(0, Math.min(r.width, ev.clientX - r.left));
      const newH = (x / r.width) * 360;
      setH(newH);
      live(hslToHex(newH, s, l));
    };
    const up = (ev: PointerEvent) => {
      move(ev);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setColor(hslToHex(h, s, l));
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    move(e.nativeEvent);
  };

  // hex input
  const onHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (/^#?[0-9a-fA-F]{6}$/.test(v)) {
      setColor(v.startsWith('#') ? v : `#${v}`);
    } else if (v.length <= 7) {
      // typing in progress, just don't apply yet
      e.target.value = v;
    }
  };

  // SV 指示器位置
  const v = l + (l * s) / (1 - Math.abs(2 * l - 1)) || l + (l * s) / 2;
  // 简化: 用 HSL → HSV 的近似
  const hsvV = Math.min(1, l + (s * Math.min(l, 1 - l)) / Math.max(0.0001, 1 - 2 * Math.abs(l - 0.5) || 1));
  const indicatorX = s * 100;
  const indicatorY = (1 - hsvV) * 100;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        className={[
          'au-color-picker__trigger',
          `au-color-picker__trigger--${size}`,
          disabled ? 'is-disabled' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={style}
        onClick={() => !disabled && setOpen(!open)}
      >
        {trigger ?? (
          <>
            <span className="au-color-picker__swatch" style={{ background: value }} />
            {showInput && <span className="au-color-picker__hex">{value}</span>}
          </>
        )}
      </button>
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popupRef}
            className="au-color-picker__popup"
            style={{ position: 'fixed', top: pos.top, left: pos.left }}
          >
            {/* 饱和度 + 亮度板 */}
            <div
              ref={satRef}
              className="au-color-picker__sat"
              style={{
                background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${h}, 100%, 50%))`,
              }}
              onPointerDown={onSatPointerDown}
            >
              <span
                className="au-color-picker__sat-thumb"
                style={{ left: `${indicatorX}%`, top: `${indicatorY}%`, background: value }}
                aria-hidden
              />
            </div>
            {/* Hue 滑条 */}
            <div
              ref={hueRef}
              className="au-color-picker__hue"
              onPointerDown={onHuePointerDown}
            >
              <span
                className="au-color-picker__hue-thumb"
                style={{ left: `${(h / 360) * 100}%`, background: `hsl(${h}, 100%, 50%)` }}
                aria-hidden
              />
            </div>
            {/* hex 输入 + 当前色预览 */}
            <div className="au-color-picker__row">
              <span className="au-color-picker__preview" style={{ background: value }} />
              <input
                type="text"
                className="au-color-picker__hex-input"
                defaultValue={value}
                onBlur={onHexInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
                }}
                spellCheck={false}
              />
            </div>
            {/* 预设色板 */}
            {presets.length > 0 && (
              <div className="au-color-picker__presets">
                {presets.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="au-color-picker__preset"
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                    aria-label={c}
                    title={c}
                  />
                ))}
              </div>
            )}
          </div>,
          document.body,
        )}
    </>
  );
};

export default ColorPicker;
