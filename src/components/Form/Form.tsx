import React, { createContext, useEffect, useRef } from 'react';
import FormItem from './FormItem';
import { useForm, type FormInstance, type FormStore } from './useForm';
import './Form.css';

export type FormLayout = 'horizontal' | 'vertical' | 'inline';
export type FormSize = 'small' | 'medium' | 'large';

export interface FormContextValue {
  layout: FormLayout;
  labelWidth?: number | string;
  colon: boolean;
  size: FormSize;
  labelAlign: 'left' | 'right';
  store?: FormStore;
}

export const FormContext = createContext<FormContextValue>({
  layout: 'horizontal',
  labelWidth: 96,
  colon: true,
  size: 'medium',
  labelAlign: 'right',
});

export interface FormProps {
  /** 关联 Form 实例 (Form.useForm()), 不传内部自建 */
  form?: FormInstance;
  /** 初始值 (字段名 -> 值) */
  initialValues?: Record<string, unknown>;
  /** 校验通过时触发 */
  onFinish?: (values: Record<string, unknown>) => void;
  /** 校验失败时触发 */
  onFinishFailed?: (info: { errorFields: { name: string; errors: string[] }[]; values: Record<string, unknown> }) => void;
  /** 任意字段值变更时触发 */
  onValuesChange?: (changedValues: Record<string, unknown>, allValues: Record<string, unknown>) => void;
  layout?: FormLayout;
  labelWidth?: number | string;
  labelAlign?: 'left' | 'right';
  colon?: boolean;
  size?: FormSize;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** @deprecated 请改用 onFinish, 仍然保留以兼容旧用法 */
  onSubmit?: (e: React.FormEvent) => void;
}

const FormBase: React.FC<FormProps> = ({
  form: ctrlForm,
  initialValues,
  onFinish,
  onFinishFailed,
  onValuesChange,
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
  const [innerForm] = useForm();
  const form = ctrlForm ?? innerForm;
  const store = form.__store;

  // 只在第一次设置 initial values, 避免每次渲染重置用户输入
  const initRef = useRef(false);
  if (!initRef.current) {
    store.setInitialValues(initialValues);
    initRef.current = true;
  }
  store.setCallbacks({ onValuesChange });

  const ctx: FormContextValue = { layout, labelWidth, colon, size, labelAlign, store };
  const cls = ['au-form', `au-form--${layout}`, `au-form--${size}`, className].filter(Boolean).join(' ');

  return (
    <FormContext.Provider value={ctx}>
      <form
        className={cls}
        style={style}
        onSubmit={(e) => {
          e.preventDefault();
          // 旧用法 onSubmit 兼容: 优先调用; 新用法 onFinish 走 store.submit (含校验)
          if (onSubmit) onSubmit(e);
          if (onFinish || onFinishFailed) store.submit(onFinish, onFinishFailed);
        }}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
};

const Form = FormBase as typeof FormBase & {
  Item: typeof FormItem;
  useForm: typeof useForm;
};
Form.Item = FormItem;
Form.useForm = useForm;

export default Form;
export { FormItem, useForm };
export type { FormItemProps } from './FormItem';
export type { FormInstance, Rule, RuleType, FieldError } from './useForm';
