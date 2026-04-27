import React, { useState } from 'react';
import {
  Form,
  FormItem,
  useForm,
  Input,
  InputNumber,
  Select,
  Switch,
  Slider,
  DatePicker,
  Radio,
  Checkbox,
  Button,
  Space,
  message,
  type Rule,
} from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const FormDoc: React.FC = () => {
  return (
    <>
      <h1>Form 表单</h1>
      <p>
        Form 提供完整的表单能力: 通过 <code>Form.useForm()</code> 拿到 <code>form</code> 实例,
        在 <code>Form.Item</code> 上声明 <code>name</code> 和 <code>rules</code> 即可自动接管
        值与校验。 <code>onFinish</code>/<code>onFinishFailed</code> 在校验通过/失败时触发,
        实例方法 <code>validateFields()</code>/<code>resetFields()</code>/<code>setFieldsValue()</code>
        支持程序化操作。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法 + 校验"
        description="用 useForm 拿到实例, 声明 name + rules, 提交时触发 onFinish (校验通过) 或 onFinishFailed (失败)。"
        code={`const [form] = Form.useForm();

<Form
  form={form}
  layout="horizontal"
  onFinish={(values) => message.success(JSON.stringify(values))}
  onFinishFailed={({ errorFields }) => message.error(\`校验失败: \${errorFields.length} 个字段\`)}
>
  <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请填写姓名' }]}>
    <Input placeholder="请输入姓名" />
  </Form.Item>
  <Form.Item label="邮箱" name="email" rules={[
    { required: true, message: '请填写邮箱' },
    { type: 'email', message: '邮箱格式不正确' },
  ]}>
    <Input placeholder="you@example.com" />
  </Form.Item>
  <Form.Item label="订阅" name="subscribed" valuePropName="checked">
    <Switch />
  </Form.Item>
  <Form.Item>
    <Button type="primary">提交</Button>
  </Form.Item>
</Form>`}
      >
        <BasicDemo />
      </DemoBlock>

      <DemoBlock
        title="多种规则类型"
        description="rules 支持 required/type/min/max/len/pattern/whitespace/validator (同步或 Promise)。"
        code={`<Form.Item
  name="username"
  label="用户名"
  rules={[
    { required: true, whitespace: true, message: '不能为空白' },
    { min: 3, max: 12, message: '长度 3-12 字' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '仅允许字母数字下划线' },
  ]}
>
  <Input />
</Form.Item>

<Form.Item
  name="age"
  label="年龄"
  rules={[
    { required: true, message: '请填写年龄' },
    { type: 'integer', min: 18, max: 100, message: '需 18-100 岁' },
  ]}
>
  <InputNumber />
</Form.Item>

<Form.Item
  name="website"
  label="网站"
  rules={[{ type: 'url', message: 'URL 必须以 http(s):// 开头' }]}
>
  <Input placeholder="https://..." />
</Form.Item>

<Form.Item
  name="confirm"
  label="确认密码"
  rules={[
    { required: true, message: '请再次输入密码' },
    {
      validator: async (v) => {
        if (v && v !== '123456') return '两次密码不一致';
      },
    },
  ]}
>
  <Input type="password" />
</Form.Item>`}
      >
        <RulesDemo />
      </DemoBlock>

      <DemoBlock
        title="程序化操作 (setFieldsValue / resetFields / validateFields)"
        description="通过 form 实例直接读写字段、按需校验、重置回 initialValues。"
        code={`const [form] = Form.useForm();

const fillSample = () => form.setFieldsValue({ name: '余星辰', age: 28, city: 'bj' });
const validate = async () => {
  try {
    const v = await form.validateFields();
    message.success('校验通过 ' + JSON.stringify(v));
  } catch (info) {
    message.error('共 ' + info.errorFields.length + ' 个错误');
  }
};
const reset = () => form.resetFields();

<Space>
  <Button onClick={fillSample}>填充示例数据</Button>
  <Button onClick={validate}>仅校验不提交</Button>
  <Button onClick={reset}>重置</Button>
</Space>`}
      >
        <ProgrammaticDemo />
      </DemoBlock>

      <DemoBlock
        title="综合注册表单"
        description="所有表单项混合使用, 各有不同 rules; onValuesChange 实时拿到所有值。"
        code={`<Form
  layout="horizontal"
  labelWidth={108}
  initialValues={{ gender: 'x', hobbies: ['read'], score: 60, subscribed: true }}
  onFinish={(values) => message.success('注册成功')}
  onValuesChange={(changed, all) => console.log(changed, all)}
>
  ...省略...
</Form>`}
      >
        <RegDemo />
      </DemoBlock>

      <DemoBlock
        title="垂直布局"
        description="layout='vertical' 时 label 位于输入框上方; labelAlign 对垂直布局无效。"
        code={`<Form layout="vertical">
  <Form.Item label="姓名" name="name" rules={[{ required: true }]}>
    <Input placeholder="请输入姓名" />
  </Form.Item>
  <Form.Item label="年龄" name="age" rules={[{ type: 'integer', min: 18, message: '需满 18 岁' }]}>
    <InputNumber min={0} />
  </Form.Item>
</Form>`}
      >
        <Form layout="vertical" onFinish={() => message.success('提交成功')}>
          <FormItem label="姓名" name="name" rules={[{ required: true, message: '请填写姓名' }]}>
            <Input placeholder="请输入姓名" />
          </FormItem>
          <FormItem
            label="年龄"
            name="age"
            rules={[{ type: 'integer', min: 18, message: '需满 18 岁' }]}
          >
            <InputNumber min={0} />
          </FormItem>
          <FormItem>
            <Button type="primary">下一步</Button>
          </FormItem>
        </Form>
      </DemoBlock>

      <DemoBlock
        title="强制错误态"
        description="FormItem 上的 error 属性优先级高于校验结果, 适合做服务端返回的错误展示。"
        code={`<Form.Item label="邮箱" error="该邮箱已被注册">
  <Input defaultValue="taken@example.com" />
</Form.Item>`}
      >
        <Form>
          <FormItem label="邮箱" required error="该邮箱已被注册">
            <Input defaultValue="taken@example.com" />
          </FormItem>
        </Form>
      </DemoBlock>

      <h2>API</h2>

      <h3>Form</h3>
      <ApiTable
        rows={[
          { prop: 'form', desc: 'Form.useForm() 创建的实例, 不传则内部自建', type: 'FormInstance', default: '-' },
          { prop: 'initialValues', desc: '初始值 (字段名 → 值)', type: 'Record<string, any>', default: '-' },
          { prop: 'onFinish', desc: '校验通过时触发', type: '(values) => void', default: '-' },
          { prop: 'onFinishFailed', desc: '校验失败时触发', type: '({ errorFields, values }) => void', default: '-' },
          { prop: 'onValuesChange', desc: '任意字段变化触发', type: '(changed, all) => void', default: '-' },
          { prop: 'layout', desc: '布局', type: `'horizontal' | 'vertical' | 'inline'`, default: `'horizontal'` },
          { prop: 'labelWidth', desc: 'Label 宽度 (horizontal)', type: 'number | string', default: '96' },
          { prop: 'labelAlign', desc: 'Label 对齐', type: `'left' | 'right'`, default: `'right'` },
          { prop: 'colon', desc: 'Label 冒号', type: 'boolean', default: 'true' },
          { prop: 'size', desc: '尺寸 (控制 item 间距)', type: `'small' | 'medium' | 'large'`, default: `'medium'` },
        ]}
      />

      <h3>Form.Item</h3>
      <ApiTable
        rows={[
          { prop: 'name', desc: '字段名, 设了即接管子组件 value/onChange + 校验', type: 'string', default: '-' },
          { prop: 'rules', desc: '校验规则数组, 见下方 Rule 定义', type: 'Rule[]', default: '-' },
          { prop: 'validateTrigger', desc: '触发校验的事件', type: `'onChange' | 'onBlur' | Array`, default: `'onChange'` },
          { prop: 'valuePropName', desc: '子组件值 prop 名 (Switch/Checkbox 用 "checked")', type: 'string', default: `'value'` },
          { prop: 'trigger', desc: '子组件值变化事件名', type: 'string', default: `'onChange'` },
          { prop: 'label', desc: 'Label 内容', type: 'ReactNode', default: '-' },
          { prop: 'required', desc: '必填 (显示 *), 也可在 rules 里写 { required: true }', type: 'boolean', default: 'false' },
          { prop: 'help', desc: '下方帮助文字', type: 'ReactNode', default: '-' },
          { prop: 'error', desc: '强制错误信息 (优先级最高)', type: 'ReactNode', default: '-' },
          { prop: 'extra', desc: '额外说明文字', type: 'ReactNode', default: '-' },
          { prop: 'layout', desc: '覆盖 Form 的布局', type: `'horizontal' | 'vertical'`, default: '继承 Form' },
          { prop: 'labelWidth', desc: '覆盖 labelWidth', type: 'number | string', default: '继承' },
          { prop: 'colon', desc: '覆盖 colon', type: 'boolean', default: '继承' },
          { prop: 'labelAlign', desc: '覆盖 labelAlign', type: `'left' | 'right'`, default: '继承' },
        ]}
      />

      <h3>Rule (校验规则)</h3>
      <ApiTable
        rows={[
          { prop: 'required', desc: '必填', type: 'boolean', default: 'false' },
          { prop: 'message', desc: '校验失败的提示文案', type: 'string', default: '内置默认' },
          { prop: 'type', desc: '类型: string/number/integer/email/url/array/boolean', type: 'RuleType', default: '-' },
          { prop: 'min', desc: '数值最小 / 字符串最短长度 / 数组最少项', type: 'number', default: '-' },
          { prop: 'max', desc: '数值最大 / 字符串最长长度 / 数组最多项', type: 'number', default: '-' },
          { prop: 'len', desc: '字符串/数组精确长度', type: 'number', default: '-' },
          { prop: 'pattern', desc: '字符串正则匹配', type: 'RegExp', default: '-' },
          { prop: 'whitespace', desc: 'required 时把"全空白"当空', type: 'boolean', default: 'false' },
          { prop: 'validator', desc: '自定义校验, 返回 true/undefined 通过 / 字符串当错误信息 / Promise', type: '(value) => boolean | string | Promise', default: '-' },
          { prop: 'validateTrigger', desc: '此规则在哪个事件触发 (默认 onChange)', type: `'onChange' | 'onBlur' | 'onSubmit'`, default: `'onChange'` },
        ]}
      />

      <h3>FormInstance (Form.useForm() 返回)</h3>
      <ApiTable
        rows={[
          { prop: 'getFieldValue', desc: '取单个字段值', type: '(name) => any', default: '-' },
          { prop: 'getFieldsValue', desc: '取所有字段值', type: '() => Record<string, any>', default: '-' },
          { prop: 'setFieldValue', desc: '设单个字段值', type: '(name, value) => void', default: '-' },
          { prop: 'setFieldsValue', desc: '批量设字段值', type: '(values) => void', default: '-' },
          { prop: 'getFieldError', desc: '取某字段错误', type: '(name) => string[]', default: '-' },
          { prop: 'getFieldsError', desc: '取多字段错误', type: '(names?) => FieldError[]', default: '-' },
          { prop: 'validateFields', desc: '校验, 通过 resolve(values), 失败 reject({ errorFields, values })', type: '(names?) => Promise', default: '-' },
          { prop: 'resetFields', desc: '重置回 initialValues', type: '(names?) => void', default: '-' },
          { prop: 'submit', desc: '触发完整校验 + onFinish/onFinishFailed', type: '() => void', default: '-' },
        ]}
      />
    </>
  );
};

const BasicDemo: React.FC = () => {
  const [form] = useForm();
  return (
    <Form
      form={form}
      layout="horizontal"
      onFinish={(values) => message.success(`提交成功 ${JSON.stringify(values)}`)}
      onFinishFailed={({ errorFields }) =>
        message.error(`校验失败: ${errorFields.length} 个字段`)
      }
    >
      <FormItem label="姓名" name="name" rules={[{ required: true, message: '请填写姓名' }]}>
        <Input placeholder="请输入姓名" />
      </FormItem>
      <FormItem
        label="邮箱"
        name="email"
        rules={[
          { required: true, message: '请填写邮箱' },
          { type: 'email', message: '邮箱格式不正确' },
        ]}
      >
        <Input placeholder="you@example.com" />
      </FormItem>
      <FormItem label="订阅" name="subscribed" valuePropName="checked">
        <Switch />
      </FormItem>
      <FormItem>
        <Button type="primary">
          提交
        </Button>
      </FormItem>
    </Form>
  );
};

const RulesDemo: React.FC = () => {
  return (
    <Form
      layout="horizontal"
      onFinish={(v) => message.success(`通过 ${JSON.stringify(v)}`)}
    >
      <FormItem
        label="用户名"
        name="username"
        rules={[
          { required: true, whitespace: true, message: '不能为空白' },
          { min: 3, max: 12, message: '长度 3-12 字' },
          { pattern: /^[a-zA-Z0-9_]+$/, message: '仅允许字母数字下划线' },
        ]}
      >
        <Input placeholder="3-12 位字母数字下划线" />
      </FormItem>
      <FormItem
        label="年龄"
        name="age"
        rules={[
          { required: true, message: '请填写年龄' },
          { type: 'integer', min: 18, max: 100, message: '需 18-100 岁' },
        ]}
      >
        <InputNumber />
      </FormItem>
      <FormItem
        label="网站"
        name="website"
        rules={[{ type: 'url', message: 'URL 必须以 http(s):// 开头' }]}
      >
        <Input placeholder="https://..." />
      </FormItem>
      <FormItem
        label="确认密码"
        name="confirm"
        help="此处只接受 123456 (示例)"
        rules={[
          { required: true, message: '请再次输入密码' },
          {
            validator: async (v) => {
              if (v && v !== '123456') return '两次密码不一致';
            },
          } as Rule,
        ]}
      >
        <Input type="password" placeholder="输入 123456 通过" />
      </FormItem>
      <FormItem>
        <Button type="primary">
          提交
        </Button>
      </FormItem>
    </Form>
  );
};

const ProgrammaticDemo: React.FC = () => {
  const [form] = useForm();
  const fillSample = () => form.setFieldsValue({ name: '余星辰', age: 28, city: 'bj' });
  const validate = async () => {
    try {
      const v = await form.validateFields();
      message.success(`校验通过 ${JSON.stringify(v)}`);
    } catch (info) {
      const fail = info as { errorFields: { name: string; errors: string[] }[] };
      message.error(`共 ${fail.errorFields.length} 个错误`);
    }
  };
  const reset = () => form.resetFields();
  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <Button onClick={fillSample}>填充示例数据</Button>
        <Button onClick={validate}>仅校验不提交</Button>
        <Button onClick={reset}>重置</Button>
      </Space>
      <Form form={form} layout="horizontal">
        <FormItem
          label="姓名"
          name="name"
          rules={[{ required: true, message: '请填写姓名' }]}
        >
          <Input />
        </FormItem>
        <FormItem
          label="年龄"
          name="age"
          rules={[{ type: 'integer', min: 1, message: '必须为正整数' }]}
        >
          <InputNumber />
        </FormItem>
        <FormItem label="城市" name="city">
          <Select
            placeholder="请选择"
            allowClear
            options={[
              { label: '北京', value: 'bj' },
              { label: '上海', value: 'sh' },
              { label: '深圳', value: 'sz' },
            ]}
          />
        </FormItem>
      </Form>
    </div>
  );
};

const RegDemo: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  return (
    <Form
      layout="horizontal"
      labelWidth={108}
      initialValues={{ gender: 'x', hobbies: ['read'], score: 60, subscribed: true }}
      onFinish={() => {
        setSubmitted(true);
        message.success('注册成功');
      }}
      onFinishFailed={({ errorFields }) =>
        message.error(`校验失败: ${errorFields.length} 个字段`)
      }
    >
      <FormItem
        label="昵称"
        name="nickname"
        rules={[
          { required: true, message: '请填写昵称' },
          { min: 2, max: 16, message: '2-16 个字符' },
        ]}
      >
        <Input placeholder="2-16 个字符" />
      </FormItem>
      <FormItem
        label="邮箱"
        name="email"
        help="将作为登录账号"
        rules={[
          { required: true, message: '请填写邮箱' },
          { type: 'email', message: '邮箱格式不正确' },
        ]}
      >
        <Input placeholder="you@example.com" />
      </FormItem>
      <FormItem label="性别" name="gender">
        <Radio.Group
          options={[
            { label: '男', value: 'm' },
            { label: '女', value: 'f' },
            { label: '保密', value: 'x' },
          ]}
        />
      </FormItem>
      <FormItem label="出生日期" name="birthday">
        <DatePicker placeholder="选择日期" />
      </FormItem>
      <FormItem
        label="兴趣爱好"
        name="hobbies"
        help="可多选"
        rules={[{ type: 'array', min: 1, message: '至少选 1 项' }]}
      >
        <Checkbox.Group
          options={[
            { label: '阅读', value: 'read' },
            { label: '运动', value: 'sport' },
            { label: '音乐', value: 'music' },
            { label: '摄影', value: 'photo' },
          ]}
        />
      </FormItem>
      <FormItem label="活跃度" name="score" extra="滑块评估你每周使用时长">
        <Slider />
      </FormItem>
      <FormItem label="城市" name="city">
        <Select
          placeholder="请选择"
          allowClear
          options={[
            { label: '北京', value: 'bj' },
            { label: '上海', value: 'sh' },
            { label: '深圳', value: 'sz' },
            { label: '成都', value: 'cd' },
          ]}
        />
      </FormItem>
      <FormItem label="接收推送" name="subscribed" valuePropName="checked">
        <Switch />
      </FormItem>
      <FormItem>
        <Button type="primary">
          {submitted ? '已注册 ✓' : '注册'}
        </Button>
      </FormItem>
    </Form>
  );
};

export default FormDoc;
