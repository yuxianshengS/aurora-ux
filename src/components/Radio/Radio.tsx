import React, { createContext, useContext, useState } from 'react';
import './Radio.css';

export type RadioValue = string | number | boolean;
export type RadioSize = 'small' | 'medium' | 'large';
export type RadioOptionType = 'default' | 'button';

export interface RadioOption<V extends RadioValue = RadioValue> {
  label: React.ReactNode;
  value: V;
  disabled?: boolean;
}

interface GroupContextShape {
  value?: RadioValue;
  onChange?: (v: RadioValue) => void;
  name?: string;
  disabled?: boolean;
  size?: RadioSize;
  optionType?: RadioOptionType;
}

const GroupContext = createContext<GroupContextShape | null>(null);

export interface RadioProps {
  value: RadioValue;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  name?: string;
  autoFocus?: boolean;
  children?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  style?: React.CSSProperties;
}

const Radio: React.FC<RadioProps> = ({
  value,
  checked,
  defaultChecked,
  disabled,
  name,
  autoFocus,
  children,
  onChange,
  className = '',
  style,
}) => {
  const group = useContext(GroupContext);
  const inGroup = !!group;

  const isChecked = inGroup ? group!.value === value : checked ?? defaultChecked ?? false;
  const isDisabled = disabled || (inGroup && group!.disabled);
  const isButton = inGroup && group!.optionType === 'button';
  const size = (inGroup && group!.size) || 'medium';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    if (inGroup) {
      group!.onChange?.(value);
    }
    onChange?.(e);
  };

  const cls = [
    isButton ? 'au-radio-btn' : 'au-radio',
    `au-radio--${size}`,
    isChecked ? 'is-checked' : '',
    isDisabled ? 'is-disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={cls} style={style}>
      <input
        type="radio"
        className={isButton ? 'au-radio-btn__input' : 'au-radio__input'}
        name={name ?? group?.name}
        value={String(value)}
        checked={isChecked}
        disabled={isDisabled}
        autoFocus={autoFocus}
        onChange={handleChange}
      />
      {!isButton && <span className="au-radio__dot" aria-hidden />}
      {children != null && (
        <span className={isButton ? 'au-radio-btn__label' : 'au-radio__label'}>
          {children}
        </span>
      )}
    </label>
  );
};

export interface RadioGroupProps {
  value?: RadioValue;
  defaultValue?: RadioValue;
  onChange?: (value: RadioValue) => void;
  options?: RadioOption[];
  disabled?: boolean;
  name?: string;
  size?: RadioSize;
  optionType?: RadioOptionType;
  direction?: 'horizontal' | 'vertical';
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  defaultValue,
  onChange,
  options,
  disabled,
  name,
  size = 'medium',
  optionType = 'default',
  direction = 'horizontal',
  children,
  className = '',
  style,
}) => {
  const isControlled = value !== undefined;
  const [inner, setInner] = useState<RadioValue | undefined>(defaultValue);
  const current = isControlled ? value : inner;

  const handleChange = (v: RadioValue) => {
    if (!isControlled) setInner(v);
    onChange?.(v);
  };

  const ctx: GroupContextShape = {
    value: current,
    onChange: handleChange,
    name,
    disabled,
    size,
    optionType,
  };

  const cls = [
    'au-radio-group',
    optionType === 'button' ? 'au-radio-group--button' : '',
    `au-radio-group--${direction}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <GroupContext.Provider value={ctx}>
      <div className={cls} style={style} role="radiogroup">
        {options
          ? options.map((o) => (
              <Radio key={String(o.value)} value={o.value} disabled={o.disabled}>
                {o.label}
              </Radio>
            ))
          : children}
      </div>
    </GroupContext.Provider>
  );
};

type RadioComponent = React.FC<RadioProps> & { Group: typeof RadioGroup };

const RadioWithGroup = Radio as RadioComponent;
RadioWithGroup.Group = RadioGroup;

export default RadioWithGroup;
