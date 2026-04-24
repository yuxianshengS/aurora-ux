import React, { useState } from 'react';
import { Form, FormItem, Input, InputNumber, Select, Switch, Slider, DatePicker, Radio, Checkbox, Button, message } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const FormDoc: React.FC = () => {
  return (
    <>
      <h1>Form 表单</h1>
      <p>
        用 <code>&lt;Form&gt;</code> 包裹,通过 <code>&lt;Form.Item&gt;</code> 承载单个字段的
        label / 必填 / 帮助文字 / 错误信息。<br />
        当前版本以视觉与布局为主,暂不接收验证状态 — 把组件作为受控输入使用,或等后续版本增强。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础水平布局"
        description="默认 horizontal 布局,label 右对齐,宽度 96px。"
        code={`<Form layout="horizontal">
  <Form.Item label="姓名" required>
    <Input placeholder="请输入姓名" />
  </Form.Item>
  <Form.Item label="邮箱" help="我们不会泄露你的邮箱">
    <Input placeholder="you@example.com" />
  </Form.Item>
  <Form.Item label="订阅">
    <Switch defaultChecked />
  </Form.Item>
  <Form.Item label=" ">
    <Button type="primary">提交</Button>
  </Form.Item>
</Form>`}
      >
        <BasicDemo />
      </DemoBlock>

      <DemoBlock
        title="垂直布局"
        description="layout='vertical' 时 label 位于输入框上方。"
        code={`<Form layout="vertical">
  <Form.Item label="姓名" required>
    <Input placeholder="请输入姓名" />
  </Form.Item>
  <Form.Item label="年龄" help="需满 18 岁">
    <InputNumber min={18} defaultValue={18} />
  </Form.Item>
</Form>`}
      >
        <Form layout="vertical">
          <FormItem label="姓名" required>
            <Input placeholder="请输入姓名" />
          </FormItem>
          <FormItem label="年龄" help="需满 18 岁">
            <InputNumber min={18} defaultValue={18} />
          </FormItem>
          <FormItem>
            <Button type="primary">下一步</Button>
          </FormItem>
        </Form>
      </DemoBlock>

      <DemoBlock
        title="完整注册表单"
        description="综合: Input / Select / Radio / Checkbox / Switch / DatePicker / Slider 一起用。"
        code={`<Form layout="horizontal" labelWidth={108}>
  <Form.Item label="昵称" required><Input /></Form.Item>
  <Form.Item label="性别"><Radio.Group options={[...]} /></Form.Item>
  ...
</Form>`}
      >
        <RegDemo />
      </DemoBlock>

      <DemoBlock
        title="错误态"
        description="FormItem 传 error 显示红色错误文案 (覆盖 help)。"
        code={`<Form.Item label="邮箱" error="格式不正确, 请重试">
  <Input status="error" defaultValue="bad-email" />
</Form.Item>`}
      >
        <Form>
          <FormItem label="邮箱" required error="格式不正确, 请重试">
            <Input error defaultValue="bad-email" />
          </FormItem>
        </Form>
      </DemoBlock>

      <h2>API</h2>
      <h3>Form</h3>
      <ApiTable
        rows={[
          { prop: 'layout', desc: '布局', type: `'horizontal' | 'vertical' | 'inline'`, default: `'horizontal'` },
          { prop: 'labelWidth', desc: 'Label 宽度 (horizontal)', type: 'number | string', default: '96' },
          { prop: 'labelAlign', desc: 'Label 对齐', type: `'left' | 'right'`, default: `'right'` },
          { prop: 'colon', desc: 'Label 冒号', type: 'boolean', default: 'true' },
          { prop: 'size', desc: '尺寸 (控制 item 间距)', type: `'small' | 'medium' | 'large'`, default: `'medium'` },
          { prop: 'onSubmit', desc: '表单提交', type: '(e) => void', default: '-' },
        ]}
      />
      <h3>Form.Item</h3>
      <ApiTable
        rows={[
          { prop: 'label', desc: 'Label 内容', type: 'ReactNode', default: '-' },
          { prop: 'name', desc: '字段 name (生成用, 现阶段仅透传)', type: 'string', default: '-' },
          { prop: 'required', desc: '必填 (显示 *)', type: 'boolean', default: 'false' },
          { prop: 'help', desc: '下方帮助文字', type: 'ReactNode', default: '-' },
          { prop: 'error', desc: '错误信息 (覆盖 help)', type: 'ReactNode', default: '-' },
          { prop: 'extra', desc: '额外说明文字', type: 'ReactNode', default: '-' },
          { prop: 'layout', desc: '覆盖 Form 的布局', type: `'horizontal' | 'vertical'`, default: '继承 Form' },
          { prop: 'labelWidth', desc: '覆盖 Form 的 labelWidth', type: 'number | string', default: '继承' },
          { prop: 'colon', desc: '覆盖 Form 的 colon', type: 'boolean', default: '继承' },
          { prop: 'labelAlign', desc: '覆盖 labelAlign', type: `'left' | 'right'`, default: '继承' },
        ]}
      />
    </>
  );
};

const BasicDemo: React.FC = () => {
  return (
    <Form layout="horizontal" onSubmit={() => message.success('提交成功')}>
      <FormItem label="姓名" required>
        <Input placeholder="请输入姓名" />
      </FormItem>
      <FormItem label="邮箱" help="我们不会泄露你的邮箱">
        <Input placeholder="you@example.com" />
      </FormItem>
      <FormItem label="订阅">
        <Switch defaultChecked />
      </FormItem>
      <FormItem>
        <Button type="primary">
          提交
        </Button>
      </FormItem>
    </Form>
  );
};

const RegDemo: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  return (
    <Form
      layout="horizontal"
      labelWidth={108}
      onSubmit={() => {
        setSubmitted(true);
        message.success('注册成功');
      }}
    >
      <FormItem label="昵称" required>
        <Input placeholder="2-16 个字符" />
      </FormItem>
      <FormItem label="邮箱" required help="将作为登录账号">
        <Input placeholder="you@example.com" />
      </FormItem>
      <FormItem label="性别">
        <Radio.Group
          defaultValue="x"
          options={[
            { label: '男', value: 'm' },
            { label: '女', value: 'f' },
            { label: '保密', value: 'x' },
          ]}
        />
      </FormItem>
      <FormItem label="出生日期">
        <DatePicker placeholder="选择日期" />
      </FormItem>
      <FormItem label="兴趣爱好" help="可多选">
        <Checkbox.Group
          defaultValue={['read']}
          options={[
            { label: '阅读', value: 'read' },
            { label: '运动', value: 'sport' },
            { label: '音乐', value: 'music' },
            { label: '摄影', value: 'photo' },
          ]}
        />
      </FormItem>
      <FormItem label="活跃度" extra="滑块评估你每周使用时长">
        <Slider defaultValue={60} />
      </FormItem>
      <FormItem label="城市">
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
      <FormItem label="接收推送">
        <Switch defaultChecked />
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
