import React, { useContext } from 'react';
import { FormContext, type FormLayout } from './Form';

export interface FormItemProps {
  label?: React.ReactNode;
  /** 在 <form> 里作为字段名(现阶段仅输出,未接 validation 状态) */
  name?: string;
  required?: boolean;
  help?: React.ReactNode;
  error?: React.ReactNode;
  extra?: React.ReactNode;
  /** 覆盖父级 Form 的 colon 设置 */
  colon?: boolean;
  /** 覆盖父级 Form 的 labelWidth */
  labelWidth?: number | string;
  /** 覆盖父级 Form 的 layout */
  layout?: FormLayout;
  /** 覆盖父级 Form 的 labelAlign */
  labelAlign?: 'left' | 'right';
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const FormItem: React.FC<FormItemProps> = ({
  label,
  required,
  help,
  error,
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
  const effectiveLayout = layout ?? parent.layout;
  const effectiveLabelWidth = labelWidth ?? parent.labelWidth;
  const effectiveColon = colon ?? parent.colon;
  const effectiveLabelAlign = labelAlign ?? parent.labelAlign;

  const cls = [
    'au-form-item',
    `au-form-item--${effectiveLayout}`,
    `au-form-item--label-${effectiveLabelAlign}`,
    error ? 'is-error' : '',
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
      {required && <span className="au-form-item__asterisk" aria-hidden>*</span>}
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
        <div className="au-form-item__control">{children}</div>
        {error && <div className="au-form-item__error">{error}</div>}
        {help && !error && <div className="au-form-item__help">{help}</div>}
        {extra && <div className="au-form-item__extra">{extra}</div>}
      </div>
    </div>
  );
};

export default FormItem;
