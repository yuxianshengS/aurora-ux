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
import zhCN from '../../locale/zh_CN';
import type { Locale } from '../../locale/types';

/** Form 校验默认消息源 — 不被 ConfigProvider 包裹时走 zhCN 兜底, 跟其他组件行为一致 */
type FormMessages = Locale['Form'];
const DEFAULT_MESSAGES: FormMessages = zhCN.Form;
const tpl = (s: string, m: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(m[k] ?? ''));

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

const checkRule = async (
  rule: Rule,
  value: unknown,
  msgs: FormMessages = DEFAULT_MESSAGES,
): Promise<string | null> => {
  // required
  const isEmpty =
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (rule.whitespace && typeof value === 'string' && value.trim() === '');
  if (rule.required && isEmpty) return rule.message ?? msgs.required;
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
    if (!ok) return rule.message ?? tpl(msgs.typeMismatch, { type: rule.type });
  }

  // min / max / len (按值类型分)
  if (typeof value === 'string') {
    if (rule.min != null && value.length < rule.min) return rule.message ?? tpl(msgs.minString, { n: rule.min });
    if (rule.max != null && value.length > rule.max) return rule.message ?? tpl(msgs.maxString, { n: rule.max });
    if (rule.len != null && value.length !== rule.len) return rule.message ?? tpl(msgs.lenString, { n: rule.len });
  } else if (typeof value === 'number') {
    if (rule.min != null && value < rule.min) return rule.message ?? tpl(msgs.minNumber, { n: rule.min });
    if (rule.max != null && value > rule.max) return rule.message ?? tpl(msgs.maxNumber, { n: rule.max });
  } else if (Array.isArray(value)) {
    if (rule.min != null && value.length < rule.min) return rule.message ?? tpl(msgs.minArray, { n: rule.min });
    if (rule.max != null && value.length > rule.max) return rule.message ?? tpl(msgs.maxArray, { n: rule.max });
    if (rule.len != null && value.length !== rule.len) return rule.message ?? tpl(msgs.lenArray, { n: rule.len });
  }

  // pattern
  if (rule.pattern instanceof RegExp && typeof value === 'string' && !rule.pattern.test(value)) {
    return rule.message ?? msgs.patternMismatch;
  }

  // validator
  if (rule.validator) {
    let r = rule.validator(value);
    if (r instanceof Promise) r = await r;
    if (r === false) return rule.message ?? msgs.validatorFailed;
    if (typeof r === 'string') return r;
  }
  return null;
};

export class FormStore {
  private values: Record<string, unknown> = {};
  private initial: Record<string, unknown> = {};
  private errors: Record<string, string[]> = {};
  /** 用户已经"动过"的字段名集合 (用于 isFieldTouched / isFieldsTouched / 显示 dirty 标记) */
  private touched: Set<string> = new Set();
  private entities: FieldEntity[] = [];
  private callbacks: { onValuesChange?: (changed: Record<string, unknown>, all: Record<string, unknown>) => void } = {};
  /** 当前 locale 下的校验文案 — Form 组件 mount 时会从 useLocale() 拿到并注入 */
  private localeMessages: FormMessages = DEFAULT_MESSAGES;

  setLocaleMessages = (msgs: FormMessages) => {
    this.localeMessages = msgs;
  };

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
      this.touched.add(name);
      this.callbacks.onValuesChange?.({ [name]: value }, this.getFieldsValue());
    }
    this.notify(name);
  };

  setFieldsValue = (vals: Record<string, unknown>) => {
    Object.assign(this.values, vals);
    Object.keys(vals).forEach((k) => this.touched.add(k));
    this.callbacks.onValuesChange?.({ ...vals }, this.getFieldsValue());
    Object.keys(vals).forEach((k) => this.notify(k));
  };

  /** 用户是否动过该字段(包括清空) */
  isFieldTouched = (name: string): boolean => this.touched.has(name);
  /** 表单整体是否被改过; 传 names 时只检查这些字段 (allTouched=true 表示必须全部都动过) */
  isFieldsTouched = (names?: string[], allTouched = false): boolean => {
    if (!names) return this.touched.size > 0;
    if (allTouched) return names.every((n) => this.touched.has(n));
    return names.some((n) => this.touched.has(n));
  };

  /**
   * 批量回写字段 — 适合服务端校验失败把多字段错误一次塞回, 或恢复"草稿"快照
   * 每项可传 value / errors / touched 任一组合
   */
  setFields = (
    fields: Array<{
      name: string;
      value?: unknown;
      errors?: string[];
      touched?: boolean;
    }>,
  ) => {
    const changedValues: Record<string, unknown> = {};
    fields.forEach(({ name, value, errors, touched }) => {
      if (value !== undefined && this.values[name] !== value) {
        this.values[name] = value;
        changedValues[name] = value;
      }
      if (errors) {
        if (errors.length) this.errors[name] = errors;
        else delete this.errors[name];
      }
      if (touched != null) {
        if (touched) this.touched.add(name);
        else this.touched.delete(name);
      }
      this.notify(name);
    });
    if (Object.keys(changedValues).length) {
      this.callbacks.onValuesChange?.(changedValues, this.getFieldsValue());
    }
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
      const msg = await checkRule(r, value, this.localeMessages);
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
      this.touched.delete(n);
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
  isFieldTouched: FormStore['isFieldTouched'];
  isFieldsTouched: FormStore['isFieldsTouched'];
  setFields: FormStore['setFields'];
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
      isFieldTouched: store.isFieldTouched,
      isFieldsTouched: store.isFieldsTouched,
      setFields: store.setFields,
      validateFields: store.validateFields,
      resetFields: store.resetFields,
      submit: store.submit,
      __store: store,
    };
  }
  return [ref.current];
};
