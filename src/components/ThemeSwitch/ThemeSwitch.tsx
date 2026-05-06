import React, { useId, useState } from 'react';
import { useLocale } from '../ConfigProvider/ConfigProvider';
import './ThemeSwitch.css';

export interface ThemeSwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  'aria-label'?: string;
  onChange?: (checked: boolean) => void;
}

const Dot = () => (
  <svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="50" />
  </svg>
);

const StarShape = () => (
  <svg viewBox="0 0 20 20">
    <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" />
  </svg>
);

const ThemeSwitch: React.FC<ThemeSwitchProps> = ({
  checked,
  defaultChecked = false,
  disabled = false,
  size = 'medium',
  className,
  onChange,
  'aria-label': ariaLabelProp,
}) => {
  const locale = useLocale();
  const ariaLabel = ariaLabelProp ?? locale.ThemeSwitch.label;
  const reactId = useId();
  const isControlled = checked !== undefined;
  const [inner, setInner] = useState(defaultChecked);
  const current = isControlled ? checked! : inner;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const next = e.target.checked;
    if (!isControlled) setInner(next);
    onChange?.(next);
  };

  const cls = [
    'au-theme-switch',
    `au-theme-switch--${size}`,
    disabled ? 'is-disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={cls} htmlFor={reactId} aria-label={ariaLabel}>
      <input
        id={reactId}
        className="au-theme-switch__input"
        type="checkbox"
        role="switch"
        checked={current}
        disabled={disabled}
        onChange={handleChange}
      />
      <span className="au-theme-switch__slider">
        <span className="au-theme-switch__sun-moon">
          <span className="au-theme-switch__moon-dot au-theme-switch__moon-dot--1"><Dot /></span>
          <span className="au-theme-switch__moon-dot au-theme-switch__moon-dot--2"><Dot /></span>
          <span className="au-theme-switch__moon-dot au-theme-switch__moon-dot--3"><Dot /></span>
          <span className="au-theme-switch__ray au-theme-switch__ray--1"><Dot /></span>
          <span className="au-theme-switch__ray au-theme-switch__ray--2"><Dot /></span>
          <span className="au-theme-switch__ray au-theme-switch__ray--3"><Dot /></span>
          <span className="au-theme-switch__cloud au-theme-switch__cloud--dark au-theme-switch__cloud--1"><Dot /></span>
          <span className="au-theme-switch__cloud au-theme-switch__cloud--dark au-theme-switch__cloud--2"><Dot /></span>
          <span className="au-theme-switch__cloud au-theme-switch__cloud--dark au-theme-switch__cloud--3"><Dot /></span>
          <span className="au-theme-switch__cloud au-theme-switch__cloud--light au-theme-switch__cloud--4"><Dot /></span>
          <span className="au-theme-switch__cloud au-theme-switch__cloud--light au-theme-switch__cloud--5"><Dot /></span>
          <span className="au-theme-switch__cloud au-theme-switch__cloud--light au-theme-switch__cloud--6"><Dot /></span>
        </span>
        <span className="au-theme-switch__stars">
          <span className="au-theme-switch__star au-theme-switch__star--1"><StarShape /></span>
          <span className="au-theme-switch__star au-theme-switch__star--2"><StarShape /></span>
          <span className="au-theme-switch__star au-theme-switch__star--3"><StarShape /></span>
          <span className="au-theme-switch__star au-theme-switch__star--4"><StarShape /></span>
        </span>
      </span>
    </label>
  );
};

export default ThemeSwitch;
