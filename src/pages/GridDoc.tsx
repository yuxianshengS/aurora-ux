import React from 'react';
import { Grid } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const Cell: React.FC<{ children?: React.ReactNode; n?: number }> = ({ children, n }) => (
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
    {children ?? `cell ${n}`}
  </div>
);

const GridDoc: React.FC = () => {
  return (
    <>
      <h1>Grid 方格布局</h1>
      <p>
        基于 CSS Grid 的二维布局容器, 支持 <strong>固定列数</strong> 和 <strong>auto-fill 自适应换行</strong> 两种模式。
        相比 Flex 更适合"卡片网格 / 表单分栏 / 仪表盘 KPI 行"这种规整的二维布局。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="固定列数"
        description="cols={N} 指定每行 N 列等分, 子元素超出自动换行。"
        code={`<Grid cols={3} gap={12}>
  {Array.from({ length: 6 }).map((_, i) => <div>cell {i + 1}</div>)}
</Grid>`}
      >
        <Grid cols={3} gap={12}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Cell key={i} n={i + 1} />
          ))}
        </Grid>
      </DemoBlock>

      <DemoBlock
        title="auto-fill 自适应"
        description="设了 minColWidth 就进入自适应模式 — 浏览器按最小列宽自动决定每行放几个, 容器变窄自动换行。"
        code={`<Grid minColWidth={160} gap={12}>
  {items.map(it => <Card>{it}</Card>)}
</Grid>`}
      >
        <Grid minColWidth={140} gap={12}>
          {Array.from({ length: 7 }).map((_, i) => (
            <Cell key={i} n={i + 1} />
          ))}
        </Grid>
      </DemoBlock>

      <DemoBlock
        title="行间距独立"
        description="rowGap 单独控制行间距, gap 不传时 rowGap 跟随。"
        code={`<Grid cols={4} gap={8} rowGap={20}>...</Grid>`}
      >
        <Grid cols={4} gap={8} rowGap={20}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Cell key={i} n={i + 1} />
          ))}
        </Grid>
      </DemoBlock>

      <DemoBlock
        title="行最小高度"
        description="rowMinHeight 让每行至少这么高 (内容少也撑住), 适合 KPI 行高度对齐。"
        code={`<Grid cols={3} gap={12} rowMinHeight={120}>...</Grid>`}
      >
        <Grid cols={3} gap={12} rowMinHeight={100}>
          <Cell>短</Cell>
          <Cell>这格内容稍长一些, 占两三行</Cell>
          <Cell>短</Cell>
        </Grid>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'cols', desc: '固定列数 (minColWidth 未设时生效)', type: 'number', default: '3' },
          { prop: 'rows', desc: '固定行数 (固定模式可选)', type: 'number', default: '-' },
          { prop: 'minColWidth', desc: '自适应模式: 每列最小宽 (设了就用 auto-fill)', type: 'number | string', default: '-' },
          { prop: 'gap', desc: '列间距', type: 'number | string', default: '12' },
          { prop: 'rowGap', desc: '行间距 (不传跟 gap 一致)', type: 'number | string', default: '-' },
          { prop: 'rowMinHeight', desc: '每行最小高度', type: 'number | string', default: '-' },
          { prop: 'align', desc: '垂直对齐', type: `'start' | 'center' | 'end' | 'stretch'`, default: `'stretch'` },
          { prop: 'justifyItems', desc: '水平对齐', type: `'start' | 'center' | 'end' | 'stretch'`, default: `'stretch'` },
        ]}
      />
    </>
  );
};

export default GridDoc;
