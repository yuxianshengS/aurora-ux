import React, { useEffect, useState } from 'react';
import { NumberRoll, Button, Space, GradientText } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const NumberRollDoc: React.FC = () => {
  return (
    <>
      <h1>NumberRoll 数字滚动</h1>
      <p>
        每位数字独立滚动 (像老虎机/翻牌器),个位先滚高位后滚, 形成自然的"上一个数字翻到下一个"的效果。
        给 KPI / 成交数 / 在线人数 用一下, 看板从此不再是死板的静态数字。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="挂载时从 0 滚到目标值, 之后每次 value 变化都会再滚。"
        code={`<NumberRoll value={1284560} size={56} weight={700} />`}
      >
        <NumberRoll value={1284560} size={56} weight={700} />
      </DemoBlock>

      <DemoBlock
        title="实时变化"
        description="点按钮看不同位的数字独立滚动。"
        code={`const [v, setV] = useState(8888);
<NumberRoll value={v} size={48} />
<Button onClick={() => setV(Math.floor(Math.random() * 1000000))}>随机变化</Button>`}
      >
        <ChangingDemo />
      </DemoBlock>

      <DemoBlock
        title="前后缀 + 小数"
        description="prefix / suffix 接 ReactNode, precision 控制小数位。"
        code={`<NumberRoll value={42856.75} prefix="¥" precision={2} size={40} />
<NumberRoll value={89.4} suffix="%" precision={1} size={40} color="var(--au-success, #10b981)" />`}
      >
        <Space size="large">
          <NumberRoll value={42856.75} prefix="¥" precision={2} size={40} weight={600} />
          <NumberRoll
            value={89.4}
            suffix="%"
            precision={1}
            size={40}
            weight={600}
            color="var(--au-success, #10b981)"
          />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="配 GradientText 用"
        description="嵌进渐变文字里, 招牌 KPI 卡组合拳。"
        code={`<GradientText preset="aurora" size={64} weight={800}>
  <NumberRoll value={1284560} size={64} weight={800} />
</GradientText>`}
      >
        <GradientText preset="aurora" size={64} weight={800}>
          <NumberRoll value={1284560} size={64} weight={800} />
        </GradientText>
      </DemoBlock>

      <DemoBlock
        title="自动倒计时 / 跳数"
        description="给 useEffect 一个定时器, value 不断变."
        code={`useEffect(() => {
  const id = setInterval(() => setV(v => v + Math.floor(Math.random() * 50)), 1500);
  return () => clearInterval(id);
}, []);`}
      >
        <AutoTickDemo />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'value', desc: '目标数字 (变化触发滚动)', type: 'number', default: '-' },
          { prop: 'precision', desc: '小数位数', type: 'number', default: '0' },
          { prop: 'thousandSeparator', desc: '千分位逗号', type: 'boolean', default: 'true' },
          { prop: 'size', desc: '字体大小 (px)', type: 'number', default: '32' },
          { prop: 'weight', desc: '字重', type: `number | 'normal' | 'medium' | 'semibold' | 'bold'`, default: '600' },
          { prop: 'color', desc: '数字颜色', type: 'string', default: '继承' },
          { prop: 'duration', desc: '单位滚动时长 (ms)', type: 'number', default: '600' },
          { prop: 'stagger', desc: '位与位之间的延迟 (ms), 0 = 同步', type: 'number', default: '60' },
          { prop: 'prefix', desc: '前缀', type: 'ReactNode', default: '-' },
          { prop: 'suffix', desc: '后缀', type: 'ReactNode', default: '-' },
        ]}
      />
    </>
  );
};

const ChangingDemo: React.FC = () => {
  const [v, setV] = useState(8888);
  return (
    <div>
      <NumberRoll value={v} size={48} weight={700} />
      <div style={{ marginTop: 16 }}>
        <Space>
          <Button onClick={() => setV(Math.floor(Math.random() * 1000000))}>随机变化</Button>
          <Button onClick={() => setV(0)}>归零</Button>
          <Button onClick={() => setV(99999999)}>跳到 9999 万</Button>
        </Space>
      </div>
    </div>
  );
};

const AutoTickDemo: React.FC = () => {
  const [v, setV] = useState(120000);
  useEffect(() => {
    const id = setInterval(() => {
      setV((prev) => prev + Math.floor(Math.random() * 50));
    }, 1500);
    return () => clearInterval(id);
  }, []);
  return (
    <div>
      <div style={{ color: 'var(--au-text-3)', fontSize: 13, marginBottom: 4 }}>
        实时在线人数
      </div>
      <NumberRoll value={v} size={48} weight={700} color="var(--au-primary)" />
    </div>
  );
};

export default NumberRollDoc;
