import React, { useContext, useEffect, useState } from 'react';
import { FormContext, type FormLayout } from './Form';
import type { Rule } from './useForm';

export interface FormItemProps {
  label?: React.ReactNode;
  /** 字段名, 设了就接管 children 的 value/onChange + 校验 */
  name?: string;
  /** 校验规则数组 */
  rules?: Rule[];
  /** 触发校验的事件名 (默认 'onChange'); 'onBlur' 等 */
  validateTrigger?: 'onChange' | 'onBlur' | 'onSubmit' | Array<'onChange' | 'onBlur'>;
  /** 子组件值的属性名, 默认 'value' (Switch / Checkbox 是 'checked') */
  valuePropName?: string;
  /** 子组件值变化的事件名, 默认 'onChange' */
  trigger?: string;
  required?: boolean;
  help?: React.ReactNode;
  /** 强制错误信息 (优先级高于校验结果) */
  error?: React.ReactNode;
  extra?: React.ReactNode;
  colon?: boolean;
  labelWidth?: number | string;
  layout?: FormLayout;
  labelAlign?: 'left' | 'right';
  /** 不传 children 时占位用 (按钮组等无字段控件) */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const FormItem: React.FC<FormItemProps> = ({
  label,
  name,
  rules,
  validateTrigger = 'onChange',
  valuePropName = 'value',
  trigger = 'onChange',
  required,
  help,
  error: forcedError,
  extra,
  colon,
  labelWidth,
  layout,
  labelAlign,
  children,
  className = '',
  style,
}) => {
  const parent = useContext(FormContext);
  const store = parent.store;
  const [, forceTick] = useState(0);

  // 注册到 store, 保持 rules 同步; store 内部更新时调 onStoreChange 触发本组件刷新
  useEffect(() => {
    if (!store || !name) return;
    return store.registerField({
      name,
      rules: rules ?? [],
      onStoreChange: () => forceTick((n) => n + 1),
    });
  }, [store, name, rules]);

  const effectiveLayout = layout ?? parent.layout;
  const effectiveLabelWidth = labelWidth ?? parent.labelWidth;
  const effectiveColon = colon ?? parent.colon;
  const effectiveLabelAlign = labelAlign ?? parent.labelAlign;

  // 错误来源: 强制 error > store 校验结果
  let displayError: React.ReactNode = forcedError;
  if (!displayError && store && name) {
    const errs = store.getFieldError(name);
    if (errs.length) displayError = errs[0];
  }

  // 是否必填(rules 里有 required 也算)
  const isRequired = required ?? rules?.some((r) => r.required) ?? false;

  // 受控注入 value/onChange 给子节点 (仅当有 name 且子节点是单个 React 元素)
  let renderedChildren: React.ReactNode = children;
  if (store && name && React.isValidElement(children)) {
    const value = store.getFieldValue(name);
    const triggers = Array.isArray(validateTrigger) ? validateTrigger : [validateTrigger];
    const childProps = (children.props ?? {}) as Record<string, unknown>;

    const ourTrigger = (newValue: unknown, ...rest: unknown[]) => {
      // 如果原 onChange 第一个参数是 event (有 .target), 取 .target.value / checked
      let v: unknown = newValue;
      if (newValue && typeof newValue === 'object' && 'target' in newValue) {
        const t = (newValue as { target: HTMLInputElement }).target;
        v = valuePropName === 'checked' ? t.checked : t.value;
      }
      store.setFieldValue(name, v);
      // 把 onChange / onBlur 校验触发器
      if (triggers.includes('onChange')) store.validateField(name, 'onChange');
      // 同时让用户原来传给子组件的 onChange 继续生效
      const original = childProps[trigger];
      if (typeof original === 'function') {
        (original as (...args: unknown[]) => void)(newValue, ...rest);
      }
    };

    const ourBlur = (...args: unknown[]) => {
      if (triggers.includes('onBlur')) store.validateField(name, 'onBlur');
      const original = childProps.onBlur;
      if (typeof original === 'function') {
        (original as (...args: unknown[]) => void)(...args);
      }
    };

    renderedChildren = React.cloneElement(children, {
      [valuePropName]: value,
      [trigger]: ourTrigger,
      onBlur: ourBlur,
    } as React.HTMLAttributes<HTMLElement>);
  }

  const cls = [
    'au-form-item',
    `au-form-item--${effectiveLayout}`,
    `au-form-item--label-${effectiveLabelAlign}`,
    displayError ? 'is-error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const labelEl = label != null && (
    <div
      className="au-form-item__label"
      style={
        effectiveLayout === 'horizontal'
          ? {
              width:
                typeof effectiveLabelWidth === 'number'
                  ? `${effectiveLabelWidth}px`
                  : effectiveLabelWidth,
              flexShrink: 0,
            }
          : undefined
      }
    >
      {isRequired && <span className="au-form-item__asterisk" aria-hidden>*</span>}
      <span className="au-form-item__label-text">
        {label}
        {effectiveColon && <span className="au-form-item__colon">:</span>}
      </span>
    </div>
  );

  return (
    <div className={cls} style={style}>
      {labelEl}
      <div className="au-form-item__body">
        <div className="au-form-item__control">{renderedChildren}</div>
        {displayError && <div className="au-form-item__error">{displayError}</div>}
        {help && !displayError && <div className="au-form-item__help">{help}</div>}
        {extra && <div className="au-form-item__extra">{extra}</div>}
      </div>
    </div>
  );
};

export default FormItem;
