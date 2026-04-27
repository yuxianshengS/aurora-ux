import React from 'react';
import { PulseDot } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

const PulseDotDoc: React.FC = () => {
  return (
    <>
      <h1>PulseDot 脉冲点</h1>
      <p>
        实时状态点 — 一颗发光小圆 + 向外扩散的光环, 比 Badge 更"活"。
        在线状态 / 实时同步 / 告警 / 心跳监测全套场景都好使。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="预设状态"
        description="live (青) / success (绿) / warning (橙) / danger (红) / info (靛) / default (灰)"
        code={`<PulseDot status="live">实时同步中</PulseDot>
<PulseDot status="success">订单成功</PulseDot>
<PulseDot status="warning">告警</PulseDot>
<PulseDot status="danger">异常</PulseDot>
<PulseDot status="info">通知</PulseDot>
<PulseDot status="default" silent>离线</PulseDot>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
          <PulseDot status="live">实时同步中</PulseDot>
          <PulseDot status="success">订单成功</PulseDot>
          <PulseDot status="warning">告警</PulseDot>
          <PulseDot status="danger">异常</PulseDot>
          <PulseDot status="info">通知</PulseDot>
          <PulseDot status="default" silent>
            离线 (silent, 不脉冲)
          </PulseDot>
        </div>
      </DemoBlock>

      <DemoBlock
        title="尺寸与速度"
        description="size 控制点的直径, duration 控制脉冲一周的时长."
        code={`<PulseDot size={6} duration={2}>慢心跳</PulseDot>
<PulseDot size={10} duration={1}>正常</PulseDot>
<PulseDot size={14} duration={0.6}>急促</PulseDot>`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 14 }}>
          <PulseDot size={6} duration={2}>
            慢心跳
          </PulseDot>
          <PulseDot size={10} duration={1}>
            正常
          </PulseDot>
          <PulseDot size={14} duration={0.6}>
            急促
          </PulseDot>
        </div>
      </DemoBlock>

      <DemoBlock
        title="自定义颜色"
        description="color 直接传 CSS 颜色, 覆盖 status 配色."
        code={`<PulseDot color="#a855f7">紫色</PulseDot>
<PulseDot color="#f472b6">粉色</PulseDot>
<PulseDot color="#fbbf24">金色</PulseDot>`}
      >
        <div style={{ display: 'flex', gap: 24, fontSize: 14 }}>
          <PulseDot color="#a855f7">紫色</PulseDot>
          <PulseDot color="#f472b6">粉色</PulseDot>
          <PulseDot color="#fbbf24">金色</PulseDot>
        </div>
      </DemoBlock>

      <DemoBlock
        title="只要点, 不要文字"
        description="不传 children 即可, 适合贴在文字旁边或放在 Avatar 角上."
        code={`<span>服务器 #001 <PulseDot status="success" /></span>
<span>服务器 #002 <PulseDot status="warning" /></span>
<span>服务器 #003 <PulseDot status="danger" /></span>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
          <span>
            服务器 #001 <PulseDot status="success" />
          </span>
          <span>
            服务器 #002 <PulseDot status="warning" />
          </span>
          <span>
            服务器 #003 <PulseDot status="danger" />
          </span>
        </div>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'status', desc: '预设语义色', type: `'live' | 'success' | 'warning' | 'danger' | 'info' | 'default'`, default: `'live'` },
          { prop: 'color', desc: '自定义颜色 (覆盖 status)', type: 'string', default: '-' },
          { prop: 'size', desc: '直径 (px)', type: 'number', default: '8' },
          { prop: 'silent', desc: '关闭脉冲, 只剩纯色点', type: 'boolean', default: 'false' },
          { prop: 'duration', desc: '脉冲一周时长 (s)', type: 'number', default: '1.6' },
          { prop: 'children', desc: '跟在点后面的文字', type: 'ReactNode', default: '-' },
        ]}
      />
    </>
  );
};

export default PulseDotDoc;
