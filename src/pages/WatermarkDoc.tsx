import React from 'react';
import { Watermark, Card, Tag } from '../components';
import DemoBlock from '../site-components/DemoBlock';
import ApiTable from '../site-components/ApiTable';

// 内联 Aurora 图标 SVG 当 demo 图片水印 (避免依赖部署 base path)
const LOGO_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#5b8def"/><stop offset="50%" stop-color="#9d6fea"/><stop offset="100%" stop-color="#22d3ee"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#g)"/><path d="M9 22 Q16 8 23 22" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`,
  );

const WatermarkDoc: React.FC = () => {
  return (
    <>
      <h1>Watermark 水印</h1>
      <p>
        在内部敏感数据 dashboard 上铺一层斜向重复水印, 防截图泄露。Canvas 生成
        dataURL 平铺背景, 不挡操作 (pointer-events: none)。Aurora 招牌:
        <code>color="aurora"</code> 走极光渐变文字水印,跟 GradientText 同款配色。
      </p>

      <h2>代码演示</h2>

      <DemoBlock
        title="基础用法"
        description="包裹内容即可。默认斜向 -22°, 单元格 180×140。"
        code={`<Watermark content="Aurora UX · 内部资料">
  <Card style={{ height: 200, padding: 24 }}>
    本月销售额: ¥ 1,284,560
  </Card>
</Watermark>`}
      >
        <Watermark content="Aurora UX · 内部资料">
          <Card style={{ height: 200, padding: 24 }}>
            <h3 style={{ margin: 0 }}>本月销售额</h3>
            <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>¥ 1,284,560</div>
            <Tag color="success">+12.4%</Tag>
          </Card>
        </Watermark>
      </DemoBlock>

      <DemoBlock
        title="极光渐变水印 (Aurora 招牌)"
        description={`color="aurora" 走 GradientText 同款青/紫/粉渐变, 比灰文字水印酷得多。`}
        code={`<Watermark content="Aurora · CONFIDENTIAL" color="aurora" fontSize={18} fontWeight={700}>
  <Card>...</Card>
</Watermark>`}
      >
        <Watermark content="Aurora · CONFIDENTIAL" color="aurora" fontSize={18} fontWeight={700}>
          <Card style={{ height: 220, padding: 24 }}>
            <h3 style={{ margin: 0 }}>用户列表 (脱敏)</h3>
            <p style={{ marginTop: 12, color: 'var(--au-text-2)' }}>
              此页面包含敏感信息, 请勿外传。截图也会带水印, 来源可追溯。
            </p>
          </Card>
        </Watermark>
      </DemoBlock>

      <DemoBlock
        title="多行 + 自定义角度"
        description="content 传字符串数组实现多行;angle 改方向,gap 改密度。"
        code={`<Watermark
  content={['Aurora UX', '内部资料 · 禁止外传']}
  angle={-30}
  gap={[160, 110]}
  fontSize={14}
>
  <Card style={{ height: 200, padding: 24 }}>
    <p>双行水印 + 30° 倾斜 + 更密的间距</p>
  </Card>
</Watermark>`}
      >
        <Watermark
          content={['Aurora UX', '内部资料 · 禁止外传']}
          angle={-30}
          gap={[160, 110]}
          fontSize={14}
        >
          <Card style={{ height: 200, padding: 24 }}>
            <p style={{ color: 'var(--au-text-2)' }}>双行水印 + 30° 倾斜 + 更密的间距</p>
          </Card>
        </Watermark>
      </DemoBlock>

      <DemoBlock
        title="图片水印"
        description="传 image 用图片代替文字 (会忽略 content)。这里用 Aurora logo 演示。"
        code={`<Watermark image="/your-logo.svg" gap={[140, 120]} opacity={0.32}>
  <Card style={{ height: 200, padding: 24 }}>
    <h3>季度财报 (内部草稿)</h3>
    <p>图片水印适合放品牌 logo,提高可识别度。</p>
  </Card>
</Watermark>`}
      >
        <Watermark image={LOGO_DATA_URL} gap={[140, 120]} opacity={0.32}>
          <Card style={{ height: 200, padding: 24 }}>
            <h3 style={{ margin: 0 }}>季度财报 (内部草稿)</h3>
            <p style={{ marginTop: 12, color: 'var(--au-text-2)' }}>
              图片水印适合放品牌 logo,提高可识别度。
            </p>
          </Card>
        </Watermark>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable
        rows={[
          { prop: 'content', desc: '水印文字 (单行 string / 多行 string[])', type: 'string | string[]', default: `'Aurora UX'` },
          { prop: 'image', desc: '替换文字的图片 src', type: 'string', default: '-' },
          { prop: 'fontSize', desc: '字号 (px)', type: 'number', default: '16' },
          { prop: 'fontWeight', desc: '字重', type: 'number | string', default: '500' },
          { prop: 'color', desc: '颜色, 传 "aurora" 走极光渐变;不传时跟随 --au-text-3 自适应明暗主题', type: `string | 'aurora'`, default: 'var(--au-text-3)' },
          { prop: 'opacity', desc: '不透明度 0-1 (默认低透明度避免遮挡内容)', type: 'number', default: '0.22' },
          { prop: 'angle', desc: '旋转角度 (度)', type: 'number', default: '-22' },
          { prop: 'gap', desc: '单元格大小 [w, h] (px)', type: 'number | [number, number]', default: '[180, 140]' },
          { prop: 'offset', desc: '单元格内偏移', type: '[number, number]', default: 'gap/2' },
          { prop: 'zIndex', desc: '水印层 zIndex', type: 'number', default: '9' },
        ]}
      />
    </>
  );
};

export default WatermarkDoc;
