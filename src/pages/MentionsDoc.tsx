import React from 'react';
import { Mentions } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const USERS = [
  { value: 'yuxingchen', label: '余星辰', description: 'Aurora UX 作者' },
  { value: 'alice', label: 'Alice', description: '前端工程师' },
  { value: 'bob', label: 'Bob', description: '设计师' },
  { value: 'carol', label: 'Carol', description: '产品经理' },
  { value: 'dave', label: 'Dave', description: '后端工程师' },
];

const TAGS = [
  { value: 'frontend', label: '前端' },
  { value: 'backend', label: '后端' },
  { value: 'design', label: '设计' },
  { value: 'urgent', label: '紧急' },
];

const MentionsDoc: React.FC = () => {
  return (
    <>
      <h1>Mentions @ 提及</h1>
      <p>
        多行输入框 + @ 触发的浮层选人 / 选项。仿微博 / Slack / Notion 的 mention
        体验, 支持多前缀(同时 <code>@</code> 选人 / <code>#</code> 选 tag)、自定义过滤、
        头像与描述。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础: @ 提及用户"
        description="输入 @ 触发选人面板, 上下键选择, 回车确认 (会自动加空格)."
        code={`<Mentions
  items={[
    { value: 'alice', label: 'Alice' },
    { value: 'bob', label: 'Bob' },
  ]}
  placeholder="试试输入 @"
  rows={3}
/>`}
      >
        <Mentions
          items={USERS}
          placeholder="试试输入 @"
          rows={3}
          style={{ width: 480 }}
        />
      </DemoBlock>

      <DemoBlock
        title="带头像 + 描述"
        description="MentionItem 支持 avatar / description, 让选人更直观."
        code={`<Mentions
  items={[
    {
      value: 'alice',
      label: 'Alice',
      avatar: <img src="/alice.jpg" />,
      description: '前端工程师',
    },
    /* ... */
  ]}
/>`}
      >
        <Mentions
          items={USERS.map((u) => ({
            ...u,
            avatar: (
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: `hsl(${u.value.charCodeAt(0) * 11}, 60%, 60%)`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {String(u.label).slice(0, 1)}
              </span>
            ),
          }))}
          placeholder="@ 选人, 看头像"
          rows={3}
          style={{ width: 480 }}
        />
      </DemoBlock>

      <DemoBlock
        title="多前缀: @ 人 + # 标签"
        description="prefix 传字符串数组, 不同前缀触发不同候选 (用 onSearch 区分)."
        code={`function MultiPrefix() {
  const [items, setItems] = useState(USERS);
  return (
    <Mentions
      items={items}
      prefix={['@', '#']}
      onSearch={(_, prefix) => {
        // 根据 prefix 切换候选源
        if (prefix === '@') setItems(USERS);
        else if (prefix === '#') setItems(TAGS);
      }}
    />
  );
}`}
      >
        <MultiPrefixDemo />
      </DemoBlock>

      <DemoBlock
        title="自定义过滤"
        description="filter 接管前端筛选, 比如不区分大小写 + 匹配描述."
        code={`<Mentions
  items={users}
  filter={(search, item) => {
    const kw = search.toLowerCase();
    return (
      String(item.label).toLowerCase().includes(kw) ||
      String(item.description ?? '').toLowerCase().includes(kw)
    );
  }}
/>`}
      >
        <Mentions
          items={USERS}
          placeholder="试试搜 '前端' 或 '设计'"
          rows={3}
          filter={(search, item) => {
            const kw = search.toLowerCase();
            return (
              String(item.label ?? item.value).toLowerCase().includes(kw) ||
              String(item.description ?? '').toLowerCase().includes(kw)
            );
          }}
          style={{ width: 480 }}
        />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'items', desc: '候选项 (无前缀切换时统一这一组)', type: 'MentionItem[]', default: '[]' },
          { prop: 'prefix', desc: '触发字符 (单个或多个)', type: `string | string[]`, default: `'@'` },
          { prop: 'value / defaultValue', desc: '受控/初始内容', type: 'string', default: '-' },
          { prop: 'placeholder', desc: '占位符', type: 'string', default: '-' },
          { prop: 'rows', desc: 'textarea 行数', type: 'number', default: '3' },
          { prop: 'onChange', desc: '内容变化', type: '(value) => void', default: '-' },
          { prop: 'onSearch', desc: '弹层打开 / 搜索关键字变化', type: '(search, prefix) => void', default: '-' },
          { prop: 'onSelect', desc: '从浮层选了某项', type: '(item, prefix) => void', default: '-' },
          { prop: 'filter', desc: '前端过滤函数 (默认 includes)', type: '(search, item) => bool', default: '默认模糊匹配' },
          { prop: 'popupMaxHeight', desc: '浮层最大高度 (px)', type: 'number', default: '240' },
          { prop: 'disabled', desc: '禁用', type: 'boolean', default: 'false' },
          { prop: 'textareaProps', desc: '透传给底层 <textarea>', type: 'TextareaHTMLAttributes', default: '-' },
        ]}
      />

      <h2>MentionItem 类型</h2>
      <ApiTable
        rows={[
          { prop: 'value', desc: '回填到内容里的字符串 (会跟 prefix 拼接)', type: 'string', default: '-' },
          { prop: 'label', desc: '浮层显示的标签', type: 'ReactNode', default: 'value' },
          { prop: 'avatar', desc: '头像 / 图标', type: 'ReactNode', default: '-' },
          { prop: 'description', desc: '描述行', type: 'ReactNode', default: '-' },
          { prop: 'disabled', desc: '禁用该项', type: 'boolean', default: 'false' },
        ]}
      />
    </>
  );
};

const MultiPrefixDemo: React.FC = () => {
  const [items, setItems] = React.useState(USERS as Array<{ value: string; label?: React.ReactNode; description?: React.ReactNode }>);
  return (
    <Mentions
      items={items}
      prefix={['@', '#']}
      placeholder="试试 @ 或 #"
      rows={3}
      onSearch={(_search, prefix) => {
        if (prefix === '@') setItems(USERS);
        else if (prefix === '#') setItems(TAGS);
      }}
      style={{ width: 480 }}
    />
  );
};

export default MentionsDoc;
