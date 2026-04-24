import React, { createContext } from 'react';
import FormItem from './FormItem';
import './Form.css';

export type FormLayout = 'horizontal' | 'vertical' | 'inline';
export type FormSize = 'small' | 'medium' | 'large';

export interface FormContextValue {
  layout: FormLayout;
  labelWidth?: number | string;
  colon: boolean;
  size: FormSize;
  labelAlign: 'left' | 'right';
}

export const FormContext = createContext<FormContextValue>({
  layout: 'horizontal',
  labelWidth: 96,
  colon: true,
  size: 'medium',
  labelAlign: 'right',
});

export interface FormProps {
  layout?: FormLayout;
  labelWidth?: number | string;
  labelAlign?: 'left' | 'right';
  colon?: boolean;
  size?: FormSize;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onSubmit?: (e: React.FormEvent) => void;
}

const FormBase: React.FC<FormProps> = ({
  layout = 'horizontal',
  labelWidth = 96,
  labelAlign = 'right',
  colon = true,
  size = 'medium',
  children,
  className = '',
  style,
  onSubmit,
}) => {
  const ctx: FormContextValue = { layout, labelWidth, colon, size, labelAlign };
  const cls = [
    'au-form',
    `au-form--${layout}`,
    `au-form--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <FormContext.Provider value={ctx}>
      <form
        className={cls}
        style={style}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.(e);
        }}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
};

const Form = FormBase as typeof FormBase & {
  Item: typeof FormItem;
};
Form.Item = FormItem;

export default Form;
export { FormItem };
export type { FormItemProps } from './FormItem';
