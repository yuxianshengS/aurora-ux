import React, { useState } from 'react';
import { Skeleton, Button, Card } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const SkeletonDoc: React.FC = () => {
  const [loading, setLoading] = useState(true);
  return (
    <>
      <h1>Skeleton 骨架屏</h1>
      <p>加载状态时的占位, 比 Spin 更接近最终内容布局, 避免页面闪烁。</p>

      <h2>代码演示</h2>

      <DemoBlock title="基础" code={`<Skeleton rows={3} />`}>
        <Skeleton rows={3} />
      </DemoBlock>

      <DemoBlock title="带头像" code={`<Skeleton avatar rows={3} />`}>
        <Skeleton avatar rows={3} />
      </DemoBlock>

      <DemoBlock
        title="切换"
        code={`const [loading, setLoading] = useState(true);

<Button onClick={() => setLoading(v => !v)}>切换 loading</Button>
<Card>
  <Skeleton avatar loading={loading}>
    <div>
      <h4>赵子龙</h4>
      <p>北京 · 资深前端</p>
    </div>
  </Skeleton>
</Card>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Button onClick={() => setLoading((v) => !v)}>切换 loading</Button>
          <Card>
            <Skeleton avatar loading={loading}>
              <div>
                <h4 style={{ margin: 0 }}>赵子龙</h4>
                <p style={{ margin: 0, color: 'var(--au-text-3)' }}>北京 · 资深前端</p>
              </div>
            </Skeleton>
          </Card>
        </div>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'loading', desc: 'true 显示占位; false 显示 children', type: 'boolean', default: 'true' },
          { prop: 'active', desc: '闪烁动画', type: 'boolean', default: 'true' },
          { prop: 'title', desc: '显示标题占位', type: 'boolean', default: 'true' },
          { prop: 'avatar', desc: '显示头像占位 (true 默认 40, 数字自定义)', type: 'boolean | number', default: 'false' },
          { prop: 'rows', desc: '段落行数', type: 'number', default: '3' },
          { prop: 'varyRows', desc: '尾行短一些', type: 'boolean', default: 'true' },
        ]}
      />
    </>
  );
};

export default SkeletonDoc;
