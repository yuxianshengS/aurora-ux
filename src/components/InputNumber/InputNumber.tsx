import React, { useEffect, useRef, useState } from 'react';
import './InputNumber.css';

export type InputNumberSize = 'small' | 'medium' | 'large';
export type InputNumberControls = 'default' | 'plus-minus' | 'none';

export interface InputNumberProps {
  value?: number | null;
  defaultValue?: number | null;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  disabled?: boolean;
  readOnly?: boolean;
  size?: InputNumberSize;
  status?: 'error' | 'warning';
  placeholder?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  formatter?: (value: number | null) => string;
  parser?: (displayValue: string) => number | null;
  controls?: InputNumberControls;
  keyboard?: boolean;
  stringMode?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onChange?: (value: number | null) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const clampAll = (v: number, min?: number, max?: number): number => {
  let n = v;
  if (min != null) n = Math.max(min, n);
  if (max != null) n = Math.min(max, n);
  return n;
};

const applyPrecision = (v: number, precision?: number): number => {
  if (precision == null) return v;
  const f = Math.pow(10, precision);
  return Math.round(v * f) / f;
};

const formatDisplay = (v: number | null, precision?: number): string => {
  if (v == null || Number.isNaN(v)) return '';
  if (precision == null) return String(v);
  return v.toFixed(precision);
};

const parseRaw = (raw: string): number | null => {
  if (raw === '' || raw === '-' || raw === '.' || raw === '-.') return null;
  const n = Number(raw);
  if (Number.isNaN(n)) return null;
  return n;
};

const InputNumber: React.FC<InputNumberProps> = ({
  value,
  defaultValue = null,
  min,
  max,
  step = 1,
  precision,
  disabled,
  readOnly,
  size = 'medium',
  status,
  placeholder,
  prefix,
  suffix,
  formatter,
  parser,
  controls = 'default',
  keyboard = true,
  className = '',
  style,
  onChange,
  onBlur,
  onFocus,
  onPressEnter,
}) => {
  const isControlled = value !== undefined;
  const [inner, setInner] = useState<number | null>(defaultValue);
  const current = isControlled ? value ?? null : inner;

  const [text, setText] = useState<string>(() =>
    formatter ? formatter(current) : formatDisplay(current, precision),
  );
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync text when current changes externally (and not actively typing)
  useEffect(() => {
    if (focused) return;
    setText(formatter ? formatter(current) : formatDisplay(current, precision));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, precision]);

  const emit = (next: number | null) => {
    if (!isControlled) setInner(next);
    onChange?.(next);
  };

  const setRaw = (raw: string) => {
    setText(raw);
    if (raw === '') {
      emit(null);
      return;
    }
    const parsed = parser ? parser(raw) : parseRaw(raw);
    if (parsed == null) return;
    const clamped = clampAll(parsed, min, max);
    emit(clamped);
  };

  const commitOnBlur = () => {
    setFocused(false);
    if (text === '') {
      emit(null);
      setText('');
      return;
    }
    const parsed = parser ? parser(text) : parseRaw(text);
    if (parsed == null) {
      setText(formatter ? formatter(current) : formatDisplay(current, precision));
      return;
    }
    const final = applyPrecision(clampAll(parsed, min, max), precision);
    emit(final);
    setText(formatter ? formatter(final) : formatDisplay(final, precision));
  };

  const stepBy = (dir: 1 | -1) => {
    if (disabled || readOnly) return;
    const base = current ?? 0;
    const next = applyPrecision(clampAll(base + dir * step, min, max), precision);
    emit(next);
    setText(formatter ? formatter(next) : formatDisplay(next, precision));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!keyboard) return;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      stepBy(1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      stepBy(-1);
    } else if (e.key === 'Enter') {
      onPressEnter?.(e);
    }
  };

  const upDisabled = disabled || readOnly || (max != null && current != null && current >= max);
  const downDisabled = disabled || readOnly || (min != null && current != null && current <= min);

  const wrapperCls = [
    'au-inputnum',
    `au-inputnum--${size}`,
    `au-inputnum--${controls}`,
    focused ? 'is-focus' : '',
    disabled ? 'is-disabled' : '',
    readOnly ? 'is-readonly' : '',
    status === 'error' ? 'is-error' : '',
    status === 'warning' ? 'is-warning' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const innerInput = (
    <input
      ref={inputRef}
      className="au-inputnum__inner"
      type="text"
      inputMode="decimal"
      disabled={disabled}
      readOnly={readOnly}
      placeholder={placeholder}
      value={focused || formatter == null ? text : formatter(current)}
      onChange={(e) => setRaw(e.target.value)}
      onFocus={(e) => {
        setFocused(true);
        setText(formatDisplay(current, precision));
        onFocus?.(e);
      }}
      onBlur={(e) => {
        commitOnBlur();
        onBlur?.(e);
      }}
      onKeyDown={onKeyDown}
    />
  );

  return (
    <span className={wrapperCls} style={style}>
      {controls === 'plus-minus' && (
        <button
          type="button"
          tabIndex={-1}
          className="au-inputnum__pm au-inputnum__pm--minus"
          disabled={downDisabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => stepBy(-1)}
          aria-label="减"
        >
          −
        </button>
      )}
      {prefix && <span className="au-inputnum__affix">{prefix}</span>}
      {innerInput}
      {suffix && <span className="au-inputnum__affix">{suffix}</span>}
      {controls === 'default' && (
        <span className="au-inputnum__steps">
          <button
            type="button"
            tabIndex={-1}
            className="au-inputnum__step au-inputnum__step--up"
            disabled={upDisabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => stepBy(1)}
            aria-label="增加"
          >
            <svg viewBox="0 0 10 10" width="8" height="8" aria-hidden>
              <path d="M2 7L5 3L8 7" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            tabIndex={-1}
            className="au-inputnum__step au-inputnum__step--down"
            disabled={downDisabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => stepBy(-1)}
            aria-label="减少"
          >
            <svg viewBox="0 0 10 10" width="8" height="8" aria-hidden>
              <path d="M2 3L5 7L8 3" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </span>
      )}
      {controls === 'plus-minus' && (
        <button
          type="button"
          tabIndex={-1}
          className="au-inputnum__pm au-inputnum__pm--plus"
          disabled={upDisabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => stepBy(1)}
          aria-label="加"
        >
          +
        </button>
      )}
    </span>
  );
};

export default InputNumber;
