import React from 'react';
import { Space, Divider, Tag } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const SpaceDoc: React.FC = () => {
  return (
    <>
      <h1>Space 间距</h1>
      <p>
        设置组件之间的统一间距,避免满屏写 <code>margin</code>。支持水平 / 垂直方向、自定义尺寸、
        自动换行、分隔符。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="默认水平排列, small 间距。"
        code={`<Space>
  <Tag color="primary">标签 A</Tag>
  <Tag color="success">标签 B</Tag>
  <Tag color="warning">标签 C</Tag>
</Space>`}
      >
        <Space>
          <Tag color="primary">标签 A</Tag>
          <Tag color="success">标签 B</Tag>
          <Tag color="warning">标签 C</Tag>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="间距尺寸"
        description="size 支持 small (8) / medium (16) / large (24) 关键字或任意像素数。"
        code={`<Space size="small">...</Space>
<Space size="middle">...</Space>
<Space size="large">...</Space>
<Space size={40}>...</Space>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {(['small', 'medium', 'large', 40] as const).map((s) => (
            <Space key={String(s)} size={s}>
              <span style={{ fontSize: 12, color: 'var(--au-text-3)', width: 60 }}>
                size = {String(s)}
              </span>
              <button className="au-btn au-btn--default au-btn--small">按钮 1</button>
              <button className="au-btn au-btn--default au-btn--small">按钮 2</button>
              <button className="au-btn au-btn--default au-btn--small">按钮 3</button>
            </Space>
          ))}
        </div>
      </DemoBlock>

      <DemoBlock
        title="垂直排列"
        description="direction='vertical' 适合表单分组、信息列表。"
        code={`<Space direction="vertical">
  <div>第一行</div>
  <div>第二行</div>
  <div>第三行</div>
</Space>`}
      >
        <Space direction="vertical">
          <div>姓名: 余星辰</div>
          <div>邮箱: yu@example.com</div>
          <div>电话: 138 0000 0000</div>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="换行"
        description="wrap 在空间不足时换行,同时 rowGap 生效。"
        code={`<Space wrap size={[8, 12]}>
  {Array.from({ length: 20 }).map((_, i) => (
    <Tag key={i}>tag-{i}</Tag>
  ))}
</Space>`}
      >
        <Space wrap size={[8, 12]}>
          {Array.from({ length: 20 }).map((_, i) => (
            <Tag key={i} color="primary">
              tag-{i}
            </Tag>
          ))}
        </Space>
      </DemoBlock>

      <DemoBlock
        title="分隔符"
        description="split 在子元素之间插入分隔 (文字、图标、Divider 皆可)。"
        code={`<Space split={<Divider type="vertical" />}>
  <a>查看</a>
  <a>编辑</a>
  <a>删除</a>
</Space>`}
      >
        <Space split={<Divider type="vertical" />}>
          <a href="#" onClick={(e) => e.preventDefault()}>查看</a>
          <a href="#" onClick={(e) => e.preventDefault()}>编辑</a>
          <a href="#" onClick={(e) => e.preventDefault()}>删除</a>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="对齐"
        description="align 控制交叉轴对齐 (水平方向下是纵向对齐)。"
        code={`<Space align="baseline">
  <span style={{ fontSize: 12 }}>小</span>
  <span style={{ fontSize: 18 }}>中</span>
  <span style={{ fontSize: 28 }}>大</span>
</Space>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(['start', 'center', 'end', 'baseline'] as const).map((a) => (
            <Space key={a} align={a}>
              <span style={{ fontSize: 11, color: 'var(--au-text-3)', width: 70 }}>
                align={a}
              </span>
              <span style={{ fontSize: 12 }}>小字</span>
              <span style={{ fontSize: 18 }}>中字</span>
              <span style={{ fontSize: 28 }}>大字</span>
            </Space>
          ))}
        </div>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'direction', desc: '方向', type: `'horizontal' | 'vertical'`, default: `'horizontal'` },
          { prop: 'size', desc: '间距 (可传 [横, 纵] 分别指定)', type: `'small'|'medium'|'large'|number|[…,…]`, default: `'small'` },
          { prop: 'align', desc: '交叉轴对齐', type: `'start'|'end'|'center'|'baseline'`, default: `水平 'center' / 垂直 'start'` },
          { prop: 'wrap', desc: '超出换行 (仅水平)', type: 'boolean', default: 'false' },
          { prop: 'split', desc: '子元素之间的分隔', type: 'ReactNode', default: '-' },
          { prop: 'block', desc: '撑满父容器宽度', type: 'boolean', default: 'false' },
        ]}
      />
    </>
  );
};

export default SpaceDoc;
