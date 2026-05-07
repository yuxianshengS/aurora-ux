import React, { useImperativeHandle, useRef } from 'react';
import './Input.css';
import TextArea from './TextArea';

export type InputVariant = 'outlined' | 'underline' | 'floating';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  size?: 'small' | 'medium' | 'large';
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  error?: boolean;
  /** 视觉风格:描边 / 下划线动画 / 悬浮标签 */
  variant?: InputVariant;
  /** underline / floating 变体:激活色(下划线 / 边框 / 标签色) */
  activeColor?: string;
  /** underline 变体:悬停时的背景高亮色 */
  hoverColor?: string;
  /** floating 变体:悬浮标签文字 */
  label?: React.ReactNode;
  /** 显示清除按钮 (value 非空 + 非 disabled 时出现) */
  allowClear?: boolean;
  /** 清除按钮触发, 可选 — 一般跟 onChange 联动够用 */
  onClear?: () => void;
}

const ClearIcon: React.FC = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
    <path
      d="M4 4l8 8M12 4l-8 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const InputBase = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'medium',
      prefix,
      suffix,
      error,
      variant = 'outlined',
      activeColor,
      hoverColor,
      label,
      className = '',
      disabled,
      style,
      placeholder,
      allowClear,
      onClear,
      value,
      defaultValue,
      ...rest
    },
    ref,
  ) => {
    const innerRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => innerRef.current!, []);

    const innerPlaceholder =
      variant === 'floating' ? (placeholder ?? ' ') : placeholder;

    /** 受控时看 value, 非受控时看 input.value (ref 取). 都用来决定清除按钮要不要出 */
    const [hasValue, setHasValue] = React.useState(
      () => (value != null ? String(value).length > 0 : String(defaultValue ?? '').length > 0),
    );
    React.useEffect(() => {
      if (value != null) setHasValue(String(value).length > 0);
    }, [value]);

    const wrapperClasses = [
      'au-input',
      `au-input--${variant}`,
      `au-input--${size}`,
      error ? 'is-error' : '',
      disabled ? 'is-disabled' : '',
      allowClear ? 'has-clear' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const mergedStyle: React.CSSProperties | undefined =
      activeColor || hoverColor
        ? ({
            ...(activeColor ? { ['--au-input-active' as string]: activeColor } : {}),
            ...(hoverColor ? { ['--au-input-hover-bg' as string]: hoverColor } : {}),
            ...style,
          } as React.CSSProperties)
        : style;

    /** 触发清除 — 通过 React 内部 native value setter + input event, 受控/非受控都能正确响应 */
    const handleClear = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const el = innerRef.current;
      if (el) {
        // hack: 让 React 收到真实的 onChange (e.target.value === '')
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value',
        )?.set;
        setter?.call(el, '');
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.focus();
      }
      if (value == null) setHasValue(false);
      onClear?.();
    };

    const showClear = allowClear && !disabled && hasValue;
    /** 用户原本可能传了自己的 onChange (在 ...rest 里), 我们也要监听以便更新 hasValue */
    const userOnChange = (rest as { onChange?: React.ChangeEventHandler<HTMLInputElement> }).onChange;
    const onChangeBridge: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      if (value == null) setHasValue(e.target.value.length > 0);
      userOnChange?.(e);
    };

    return (
      <span className={wrapperClasses} style={mergedStyle}>
        {prefix && variant !== 'floating' && (
          <span className="au-input__affix">{prefix}</span>
        )}
        <input
          ref={innerRef}
          className="au-input__inner"
          disabled={disabled}
          placeholder={innerPlaceholder}
          value={value}
          defaultValue={defaultValue}
          {...rest}
          onChange={onChangeBridge}
        />
        {variant === 'floating' && label != null && (
          <span className="au-input__floating-label">{label}</span>
        )}
        {showClear && (
          <button
            type="button"
            className="au-input__clear"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
            tabIndex={-1}
            aria-label="清除"
          >
            <ClearIcon />
          </button>
        )}
        {suffix && variant !== 'floating' && (
          <span className="au-input__affix">{suffix}</span>
        )}
        {variant === 'underline' && <span className="au-input__border" aria-hidden />}
      </span>
    );
  },
);
InputBase.displayName = 'Input';

const Input = Object.assign(InputBase, { TextArea });

export { TextArea };
export type { TextAreaProps, AutoSizeOption } from './TextArea';
export default Input;
