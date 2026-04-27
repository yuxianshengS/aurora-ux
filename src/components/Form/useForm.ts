/**
 * Form 状态管理核心 — 提供 useForm() / FormInstance / FormStore
 *
 * FormInstance 暴露给用户的 API (跟 antd 对齐):
 *   getFieldsValue() / getFieldValue(name) / setFieldsValue(obj) / setFieldValue(name, v)
 *   getFieldError(name) / getFieldsError(names?)
 *   validateFields(names?) — 返回 Promise<values>, reject 时是 errors[]
 *   resetFields(names?)
 *   submit() — 触发完整校验 + 调用 onFinish / onFinishFailed
 */
import { useRef } from 'react';

export type RuleType = 'string' | 'number' | 'email' | 'url' | 'integer' | 'array' | 'boolean';

export interface Rule {
  required?: boolean;
  message?: string;
  type?: RuleType;
  /** 数值最小值 / 字符串最小长度 / 数组最小项 */
  min?: number;
  /** 数值最大值 / 字符串最大长度 / 数组最大项 */
  max?: number;
  /** 字符串精确长度 / 数组精确项数 */
  len?: number;
  /** 正则匹配 */
  pattern?: RegExp;
  /** 自定义校验, 返回 true / undefined 通过, 字符串当错误信息, false 用 message */
  validator?: (value: unknown) => boolean | string | undefined | Promise<boolean | string | undefined>;
  /** 字符串 trim 后必须非空 (当 required) */
  whitespace?: boolean;
  /** 校验触发时机, 默认 'onChange' */
  validateTrigger?: 'onChange' | 'onBlur' | 'onSubmit';
}

export interface FieldError {
  name: string;
  errors: string[];
}

interface FieldEntity {
  name: string;
  rules: Rule[];
  /** 触发自身重渲染 */
  onStoreChange: () => void;
}

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const URL_RE = /^https?:\/\/\S+$/i;

const checkRule = async (rule: Rule, value: unknown): Promise<string | null> => {
  // required
  const isEmpty =
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (rule.whitespace && typeof value === 'string' && value.trim() === '');
  if (rule.required && isEmpty) return rule.message ?? '此字段为必填';
  if (isEmpty) return null; // 不必填且空, 跳过其他校验

  // type
  if (rule.type) {
    let ok = true;
    switch (rule.type) {
      case 'string': ok = typeof value === 'string'; break;
      case 'number': ok = typeof value === 'number' && !Number.isNaN(value); break;
      case 'integer': ok = typeof value === 'number' && Number.isInteger(value); break;
      case 'array': ok = Array.isArray(value); break;
      case 'boolean': ok = typeof value === 'boolean'; break;
      case 'email': ok = typeof value === 'string' && EMAIL_RE.test(value); break;
      case 'url': ok = typeof value === 'string' && URL_RE.test(value); break;
    }
    if (!ok) return rule.message ?? `格式必须是 ${rule.type}`;
  }

  // min / max / len (按值类型分)
  if (typeof value === 'string') {
    if (rule.min != null && value.length < rule.min) return rule.message ?? `至少 ${rule.min} 字`;
    if (rule.max != null && value.length > rule.max) return rule.message ?? `最多 ${rule.max} 字`;
    if (rule.len != null && value.length !== rule.len) return rule.message ?? `必须 ${rule.len} 字`;
  } else if (typeof value === 'number') {
    if (rule.min != null && value < rule.min) return rule.message ?? `不小于 ${rule.min}`;
    if (rule.max != null && value > rule.max) return rule.message ?? `不大于 ${rule.max}`;
  } else if (Array.isArray(value)) {
    if (rule.min != null && value.length < rule.min) return rule.message ?? `至少选 ${rule.min} 项`;
    if (rule.max != null && value.length > rule.max) return rule.message ?? `最多选 ${rule.max} 项`;
    if (rule.len != null && value.length !== rule.len) return rule.message ?? `必须选 ${rule.len} 项`;
  }

  // pattern
  if (rule.pattern instanceof RegExp && typeof value === 'string' && !rule.pattern.test(value)) {
    return rule.message ?? '格式不匹配';
  }

  // validator
  if (rule.validator) {
    let r = rule.validator(value);
    if (r instanceof Promise) r = await r;
    if (r === false) return rule.message ?? '校验未通过';
    if (typeof r === 'string') return r;
  }
  return null;
};

export class FormStore {
  private values: Record<string, unknown> = {};
  private initial: Record<string, unknown> = {};
  private errors: Record<string, string[]> = {};
  private entities: FieldEntity[] = [];
  private callbacks: { onValuesChange?: (changed: Record<string, unknown>, all: Record<string, unknown>) => void } = {};

  setInitialValues = (vals: Record<string, unknown> | undefined) => {
    if (!vals) return;
    this.initial = { ...vals };
    this.values = { ...vals, ...this.values };
  };

  setCallbacks = (cbs: typeof this.callbacks) => {
    this.callbacks = { ...this.callbacks, ...cbs };
  };

  registerField = (entity: FieldEntity) => {
    this.entities.push(entity);
    return () => {
      this.entities = this.entities.filter((e) => e !== entity);
      delete this.errors[entity.name];
    };
  };

  private notify = (name: string) => {
    this.entities.filter((e) => e.name === name).forEach((e) => e.onStoreChange());
  };

  private notifyAll = () => {
    this.entities.forEach((e) => e.onStoreChange());
  };

  getFieldValue = (name: string): unknown => this.values[name];
  getFieldsValue = (): Record<string, unknown> => ({ ...this.values });

  setFieldValue = (name: string, value: unknown) => {
    const prev = this.values[name];
    this.values[name] = value;
    if (prev !== value) {
      this.callbacks.onValuesChange?.({ [name]: value }, this.getFieldsValue());
    }
    this.notify(name);
  };

  setFieldsValue = (vals: Record<string, unknown>) => {
    Object.assign(this.values, vals);
    this.callbacks.onValuesChange?.({ ...vals }, this.getFieldsValue());
    Object.keys(vals).forEach((k) => this.notify(k));
  };

  getFieldError = (name: string): string[] => this.errors[name] ?? [];
  getFieldsError = (names?: string[]): FieldError[] => {
    const ns = names ?? Object.keys(this.errors);
    return ns.map((n) => ({ name: n, errors: this.errors[n] ?? [] }));
  };

  setFieldError = (name: string, errs: string[]) => {
    if (errs.length) this.errors[name] = errs;
    else delete this.errors[name];
    this.notify(name);
  };

  validateField = async (name: string, trigger?: 'onChange' | 'onBlur' | 'onSubmit'): Promise<string[]> => {
    const entity = this.entities.find((e) => e.name === name);
    if (!entity) return [];
    const rules = entity.rules.filter((r) => {
      if (!trigger) return true;
      const t = r.validateTrigger ?? 'onChange';
      if (trigger === 'onSubmit') return true;
      return t === trigger;
    });
    const value = this.values[name];
    const errs: string[] = [];
    for (const r of rules) {
      const msg = await checkRule(r, value);
      if (msg) errs.push(msg);
    }
    this.setFieldError(name, errs);
    return errs;
  };

  validateFields = async (names?: string[]): Promise<Record<string, unknown>> => {
    const targetNames = names ?? this.entities.map((e) => e.name);
    const allErrors: FieldError[] = [];
    await Promise.all(
      targetNames.map(async (n) => {
        const errs = await this.validateField(n, 'onSubmit');
        if (errs.length) allErrors.push({ name: n, errors: errs });
      }),
    );
    if (allErrors.length) {
      // eslint-disable-next-line no-throw-literal
      throw { errorFields: allErrors, values: this.getFieldsValue() };
    }
    return this.getFieldsValue();
  };

  resetFields = (names?: string[]) => {
    const targetNames = names ?? this.entities.map((e) => e.name);
    targetNames.forEach((n) => {
      this.values[n] = this.initial[n];
      delete this.errors[n];
      this.notify(n);
    });
  };

  submit = async (
    onFinish?: (values: Record<string, unknown>) => void,
    onFinishFailed?: (info: { errorFields: FieldError[]; values: Record<string, unknown> }) => void,
  ) => {
    try {
      const values = await this.validateFields();
      onFinish?.(values);
    } catch (info) {
      onFinishFailed?.(info as { errorFields: FieldError[]; values: Record<string, unknown> });
    }
  };
}

export interface FormInstance {
  getFieldValue: FormStore['getFieldValue'];
  getFieldsValue: FormStore['getFieldsValue'];
  setFieldValue: FormStore['setFieldValue'];
  setFieldsValue: FormStore['setFieldsValue'];
  getFieldError: FormStore['getFieldError'];
  getFieldsError: FormStore['getFieldsError'];
  validateFields: FormStore['validateFields'];
  resetFields: FormStore['resetFields'];
  submit: FormStore['submit'];
  /** 内部使用 */
  __store: FormStore;
}

export const useForm = (): [FormInstance] => {
  const ref = useRef<FormInstance | null>(null);
  if (!ref.current) {
    const store = new FormStore();
    ref.current = {
      getFieldValue: store.getFieldValue,
      getFieldsValue: store.getFieldsValue,
      setFieldValue: store.setFieldValue,
      setFieldsValue: store.setFieldsValue,
      getFieldError: store.getFieldError,
      getFieldsError: store.getFieldsError,
      validateFields: store.validateFields,
      resetFields: store.resetFields,
      submit: store.submit,
      __store: store,
    };
  }
  return [ref.current];
};
