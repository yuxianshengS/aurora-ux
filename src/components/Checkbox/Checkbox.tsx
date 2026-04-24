import React, { createContext, useContext, useState } from 'react';
import './Checkbox.css';

export type CheckboxValue = string | number | boolean;
export type CheckboxSize = 'small' | 'medium' | 'large';

export interface CheckboxOption<V extends CheckboxValue = CheckboxValue> {
  label: React.ReactNode;
  value: V;
  disabled?: boolean;
}

interface GroupContextShape {
  value?: CheckboxValue[];
  onToggle?: (v: CheckboxValue, checked: boolean) => void;
  disabled?: boolean;
  size?: CheckboxSize;
}

const GroupContext = createContext<GroupContextShape | null>(null);

export interface CheckboxProps {
  value?: CheckboxValue;
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  children?: React.ReactNode;
  onChange?: (checked: boolean, e?: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  style?: React.CSSProperties;
}

const Checkbox: React.FC<CheckboxProps> = ({
  value,
  checked,
  defaultChecked = false,
  indeterminate,
  disabled,
  autoFocus,
  children,
  onChange,
  className = '',
  style,
}) => {
  const group = useContext(GroupContext);
  const inGroup = !!group;
  const isControlled = checked !== undefined;
  const [inner, setInner] = useState(defaultChecked);

  const groupChecked = inGroup && value !== undefined ? group!.value?.includes(value) : undefined;
  const current = inGroup ? !!groupChecked : isControlled ? !!checked : inner;
  const isDisabled = disabled || (inGroup && group!.disabled);
  const size = (inGroup && group!.size) || 'medium';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const next = e.target.checked;
    if (inGroup && value !== undefined) {
      group!.onToggle?.(value, next);
    } else {
      if (!isControlled) setInner(next);
    }
    onChange?.(next, e);
  };

  const cls = [
    'au-checkbox',
    `au-checkbox--${size}`,
    current ? 'is-checked' : '',
    indeterminate ? 'is-indeterminate' : '',
    isDisabled ? 'is-disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={cls} style={style}>
      <input
        type="checkbox"
        className="au-checkbox__input"
        checked={current}
        disabled={isDisabled}
        autoFocus={autoFocus}
        onChange={handleChange}
      />
      <span className="au-checkbox__box" aria-hidden>
        {!indeterminate && current && (
          <svg viewBox="0 0 16 16" className="au-checkbox__tick">
            <path
              d="M3.5 8.2l3 3L12.5 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {indeterminate && <span className="au-checkbox__dash" />}
      </span>
      {children != null && <span className="au-checkbox__label">{children}</span>}
    </label>
  );
};

export interface CheckboxGroupProps {
  value?: CheckboxValue[];
  defaultValue?: CheckboxValue[];
  onChange?: (value: CheckboxValue[]) => void;
  options?: CheckboxOption[];
  disabled?: boolean;
  size?: CheckboxSize;
  direction?: 'horizontal' | 'vertical';
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  value,
  defaultValue,
  onChange,
  options,
  disabled,
  size = 'medium',
  direction = 'horizontal',
  children,
  className = '',
  style,
}) => {
  const isControlled = value !== undefined;
  const [inner, setInner] = useState<CheckboxValue[]>(defaultValue ?? []);
  const current = isControlled ? value! : inner;

  const toggle = (v: CheckboxValue, checked: boolean) => {
    const next = checked ? [...current, v] : current.filter((x) => x !== v);
    if (!isControlled) setInner(next);
    onChange?.(next);
  };

  const ctx: GroupContextShape = {
    value: current,
    onToggle: toggle,
    disabled,
    size,
  };

  const cls = [
    'au-checkbox-group',
    `au-checkbox-group--${direction}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <GroupContext.Provider value={ctx}>
      <div className={cls} style={style} role="group">
        {options
          ? options.map((o) => (
              <Checkbox key={String(o.value)} value={o.value} disabled={o.disabled}>
                {o.label}
              </Checkbox>
            ))
          : children}
      </div>
    </GroupContext.Provider>
  );
};

type CheckboxComponent = React.FC<CheckboxProps> & { Group: typeof CheckboxGroup };
const CheckboxWithGroup = Checkbox as CheckboxComponent;
CheckboxWithGroup.Group = CheckboxGroup;

export default CheckboxWithGroup;
