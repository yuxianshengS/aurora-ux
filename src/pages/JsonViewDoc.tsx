import React, { useState } from 'react';
import { JsonView } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const sample = {
  id: 'usr_4f9aa1c2',
  name: '余星辰',
  active: true,
  age: 27,
  tags: ['frontend', 'design-system', 'typescript'],
  profile: {
    bio: '一个专注于 design system 的开发者',
    socials: {
      github: 'yuxianshengS',
      twitter: null,
    },
    metrics: {
      stars: 1024,
      followers: 312,
    },
  },
  posts: [
    { id: 1, title: 'Aurora UX 发布 v0.8', published: true },
    { id: 2, title: 'CRDT 入门', published: false },
  ],
  meta: {},
  deleted: null,
};

const heavySample = {
  request: {
    method: 'POST',
    url: '/api/v1/orders',
    headers: { 'content-type': 'application/json', 'x-trace-id': 'a3f1c2' },
    body: {
      items: Array.from({ length: 5 }).map((_, i) => ({
        sku: `SKU-${1000 + i}`,
        qty: i + 1,
        price: (i + 1) * 19.9,
      })),
      coupon: 'SPRING30',
    },
  },
  response: {
    status: 201,
    elapsedMs: 142,
    payload: {
      orderId: 'ord_88f2',
      total: 199.0,
      paid: false,
    },
  },
};

const JsonViewDoc: React.FC = () => {
  const [text, setText] = useState<string>(JSON.stringify({ hello: 'world', n: 42 }, null, 2));
  const [parseErr, setParseErr] = useState<string>('');

  return (
    <>
      <h1>JsonView JSON 展示</h1>
      <p>
        把任意 JSON 数据结构以可折叠树的形式渲染出来. 类型自动着色 (string / number / boolean / null),
        逐层折叠, hover 任一节点可一键复制其值. 用于调试面板、API 响应预览、配置可视化等场景.
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        code={`<JsonView data={sample} />`}
      >
        <JsonView data={sample} />
      </DemoBlock>

      <DemoBlock
        title="默认全展开 + 显示「复制全部」"
        code={`<JsonView
  data={sample}
  defaultExpandDepth={Infinity}
  copyable
/>`}
      >
        <JsonView data={sample} defaultExpandDepth={Infinity} copyable />
      </DemoBlock>

      <DemoBlock
        title="折叠所有 (depth=0) — 配合数量徽标"
        code={`<JsonView data={heavy} defaultExpandDepth={0} />`}
      >
        <JsonView data={heavySample} defaultExpandDepth={0} />
      </DemoBlock>

      <DemoBlock
        title="JSON 严格风格 — 键带引号"
        code={`<JsonView data={sample} quoteKeys />`}
      >
        <JsonView data={sample} quoteKeys defaultExpandDepth={2} />
      </DemoBlock>

      <DemoBlock
        title="尺寸 / 紧凑模式"
        code={`<JsonView data={sample} size="small" indent={12} />`}
      >
        <JsonView data={sample} size="small" indent={12} defaultExpandDepth={2} />
      </DemoBlock>

      <DemoBlock
        title="去掉缩进引导线"
        code={`<JsonView data={sample} showLine={false} />`}
      >
        <JsonView data={sample} showLine={false} defaultExpandDepth={2} />
      </DemoBlock>

      <DemoBlock
        title="解析字符串 — 失败时显示错误态"
        code={`// data 也支持原始 JSON 字符串
<JsonView
  data={text}
  onParseError={(e) => setErr(e.message)}
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setParseErr('');
            }}
            rows={4}
            style={{
              fontFamily: 'var(--au-mono)',
              fontSize: 12,
              padding: 8,
              border: '1px solid var(--au-border)',
              borderRadius: 6,
              background: 'var(--au-bg)',
              color: 'var(--au-text-1)',
              resize: 'vertical',
            }}
          />
          <JsonView
            data={text}
            onParseError={(e) => setParseErr(e.message)}
          />
          {parseErr && (
            <span style={{ fontSize: 12, color: 'var(--au-text-3)' }}>
              最近一次错误: {parseErr}
            </span>
          )}
        </div>
      </DemoBlock>

      <DemoBlock
        title="复制回调 — 拿到值与路径"
        code={`<JsonView
  data={sample}
  onCopy={(value, path) => {
    console.log('copied', path, value);
  }}
/>`}
      >
        <JsonView
          data={sample}
          defaultExpandDepth={2}
          onCopy={(_, path) => {
            // eslint-disable-next-line no-console
            console.log('[JsonView copy]', path);
          }}
        />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'data', desc: '要展示的数据 — 任意可序列化值,或一段 JSON 字符串', type: 'JsonValue | string', default: '-' },
          { prop: 'defaultExpandDepth', desc: '默认展开到第几层 (Infinity = 全展开)', type: 'number', default: '1' },
          { prop: 'indent', desc: '缩进像素', type: 'number', default: '16' },
          { prop: 'size', desc: '字号档位', type: `'small' | 'medium'`, default: `'medium'` },
          { prop: 'showLine', desc: '显示左侧缩进引导线', type: 'boolean', default: 'true' },
          { prop: 'showItemCount', desc: '折叠节点显示子项数量徽标', type: 'boolean', default: 'true' },
          { prop: 'quoteKeys', desc: '键带引号 (JSON 严格风格)', type: 'boolean', default: 'false' },
          { prop: 'quoteStrings', desc: '字符串值带引号', type: 'boolean', default: 'true' },
          { prop: 'copyable', desc: '显示「复制全部」按钮', type: 'boolean', default: 'false' },
          { prop: 'copyOnHover', desc: 'hover 行尾出现复制按钮', type: 'boolean', default: 'true' },
          { prop: 'onCopy', desc: '复制成功回调', type: '(value, path) => void', default: '-' },
          { prop: 'onParseError', desc: 'data 为字符串解析失败回调', type: '(err: Error) => void', default: '-' },
        ]}
      />
    </>
  );
};

export default JsonViewDoc;
