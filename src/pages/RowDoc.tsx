import React from 'react';
import { Row } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const Cell: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      padding: 14,
      background: 'var(--au-primary-soft)',
      color: 'var(--au-primary)',
      borderRadius: 6,
      textAlign: 'center',
      fontWeight: 500,
      fontSize: 13,
    }}
  >
    {children}
  </div>
);

const RowDoc: React.FC = () => {
  return (
    <>
      <h1>Row 行容器</h1>
      <p>
        Grid 的极简版, 只关心"一行 N 列"。<code>cols</code> 等分列, 或 <code>template</code> 写
        CSS grid-template-columns 自定义不等宽列。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="等分列"
        description="cols={N} 让每列宽度相等。"
        code={`<Row cols={3} gap={12}>
  <Cell>A</Cell>
  <Cell>B</Cell>
  <Cell>C</Cell>
</Row>`}
      >
        <Row cols={3} gap={12}>
          <Cell>A</Cell>
          <Cell>B</Cell>
          <Cell>C</Cell>
        </Row>
      </DemoBlock>

      <DemoBlock
        title="不等宽列模板"
        description="template 写 CSS grid-template-columns, 比如 1fr 2fr 让第二列双倍宽。"
        code={`<Row template="1fr 2fr" gap={12}>
  <Cell>1fr</Cell>
  <Cell>2fr (双倍)</Cell>
</Row>

<Row template="200px 1fr 100px" gap={12}>
  <Cell>200px</Cell>
  <Cell>1fr (剩余)</Cell>
  <Cell>100px</Cell>
</Row>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Row template="1fr 2fr" gap={12}>
            <Cell>1fr</Cell>
            <Cell>2fr (双倍)</Cell>
          </Row>
          <Row template="200px 1fr 100px" gap={12}>
            <Cell>200px</Cell>
            <Cell>1fr (剩余)</Cell>
            <Cell>100px</Cell>
          </Row>
        </div>
      </DemoBlock>

      <DemoBlock
        title="对齐"
        description="align 控制垂直对齐, justifyItems 控制水平对齐。"
        code={`<Row cols={3} gap={12} align="center">...</Row>`}
      >
        <Row cols={3} gap={12} align="center" style={{ background: 'var(--au-bg-mute)', padding: 8, borderRadius: 6 }}>
          <Cell>短</Cell>
          <div style={{ padding: '20px 14px', background: 'var(--au-primary-soft)', color: 'var(--au-primary)', borderRadius: 6 }}>
            内容多<br />两行
          </div>
          <Cell>短</Cell>
        </Row>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'cols', desc: '等分列数 (template 未设时生效)', type: 'number', default: '2' },
          { prop: 'template', desc: '自定义列模板, 直接写 CSS grid-template-columns 字符串', type: 'string', default: '-' },
          { prop: 'gap', desc: '列间距', type: 'number | string', default: '12' },
          { prop: 'rowGap', desc: '行间距 (换行时); 不传跟 gap 一致', type: 'number | string', default: '-' },
          { prop: 'align', desc: '垂直对齐', type: `'start' | 'center' | 'end' | 'stretch'`, default: `'start'` },
          { prop: 'justifyItems', desc: '水平对齐', type: `'start' | 'center' | 'end' | 'stretch'`, default: `'stretch'` },
          { prop: 'responsive', desc: '窄屏自动折行', type: 'boolean', default: 'false' },
        ]}
      />
    </>
  );
};

export default RowDoc;
