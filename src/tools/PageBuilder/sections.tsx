/**
 * Section 模板系统 — 整段预设 (Hero / Pricing / Feature Grid / Stats / CTA)
 *
 * 设计目标: 不是黑盒组件, 而是落地为透明的 BlockConfig 树.
 * 用户拖一个 Section 进画布 = 拖一棵已经搭好的树, 每个节点都能继续编辑.
 */
import React from 'react';
import type { BlockConfig } from './registry';

/** build 返回不带 id 的树 (Omit<BlockConfig, 'id'> 嵌套), 在插入时由 PageBuilder 递归分配 id */
export type SectionNode = {
  type: string;
  props: Record<string, unknown>;
  slots?: Record<string, SectionNode[]>;
};

export interface SectionTemplate {
  key: string;
  label: string;
  /** 一句话描述, 鼠标悬停展示 */
  description: string;
  icon: React.ReactNode;
  build: () => SectionNode;
}

const Ico: React.FC<{ name: string }> = ({ name }) => (
  <i className={`iconfont icon-${name}`} aria-hidden style={{ fontSize: 18 }} />
);

/** 极光 Hero — AuroraBg 容器 + GradientText 标题 + 副标题 + 按钮组 */
const heroSection = (): SectionNode => ({
  type: 'AuroraBg',
  props: {
    preset: 'aurora',
    blur: 100,
    speed: 1,
    intensity: 0.7,
    grain: true,
    _minHeight: 380,
  },
  slots: {
    default: [
      {
        type: 'Flex',
        props: {
          direction: 'column',
          gap: 16,
          align: 'center',
          justify: 'center',
          _padding: 64,
          _grow: 1,
        },
        slots: {
          default: [
            {
              type: 'GradientText',
              props: {
                children: '为中后台而生的极光感 UI',
                preset: 'aurora',
                animate: true,
                duration: 6,
                size: 56,
                weight: 800,
                as: 'h1',
              },
            },
            {
              type: 'Text',
              props: {
                content:
                  '60+ 组件 + 拖拽搭建器, 视觉与效率兼得. 一行命令安装, 即刻拥有质感看板.',
                variant: 'body',
                size: 18,
                color: 'secondary',
                align: 'center',
              },
            },
            {
              type: 'Row',
              props: { gap: 12, align: 'middle', justify: 'center' },
              slots: {
                default: [
                  {
                    type: 'Button',
                    props: { type: 'primary', size: 'large', children: '立即开始' },
                  },
                  {
                    type: 'Button',
                    props: { size: 'large', children: '查看文档' },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  },
});

/** Pricing 三栏 — Grid 3 列, 每列一张 GlowCard (含 GradientText 标签 + NumberRoll 价格 + Button) */
const pricingSection = (): SectionNode => {
  const tier = (
    label: string,
    glowColor: string,
    price: number,
    desc: string,
    btnType: 'default' | 'primary',
    btnText: string,
    gradientPreset?: string,
  ): SectionNode => ({
    type: 'GlowCard',
    props: {
      glowColor,
      glowSize: 280,
      intensity: 0.7,
      border: true,
      radius: 18,
      padding: 32,
    },
    slots: {
      default: [
        {
          type: 'Flex',
          props: { direction: 'column', gap: 12, _grow: 1 },
          slots: {
            default: [
              gradientPreset
                ? {
                    type: 'GradientText',
                    props: {
                      children: label,
                      preset: gradientPreset,
                      animate: true,
                      size: 18,
                      weight: 700,
                    },
                  }
                : {
                    type: 'Text',
                    props: { content: label, variant: 'body', color: 'tertiary', size: 14 },
                  },
              {
                type: 'NumberRoll',
                props: {
                  value: price,
                  prefix: '¥',
                  size: 48,
                  weight: 800,
                  thousandSeparator: true,
                },
              },
              {
                type: 'Text',
                props: { content: desc, variant: 'body', color: 'secondary' },
              },
              {
                type: 'Button',
                props: { type: btnType, block: true, size: 'large', children: btnText },
              },
            ],
          },
        },
      ],
    },
  });

  return {
    type: 'Grid',
    props: { mode: 'fixed', cols: 3, gap: 16 },
    slots: {
      'cell-0': [tier('Free', 'var(--au-primary)', 0, '个人开发者免费, 含核心组件.', 'default', '开始使用')],
      'cell-1': [
        tier(
          'Pro 版',
          '#7c3aed',
          199,
          '无限项目 + 优先支持 + 模板市场.',
          'primary',
          '立即升级',
          'cosmic',
        ),
      ],
      'cell-2': [tier('Enterprise', '#fb923c', 1999, 'SLA + 专属客户经理 + 私有部署.', 'default', '联系销售')],
    },
  };
};

/** Feature 特性 3 列 — 每列一张 Card 含 Icon + Title + Body */
const featuresSection = (): SectionNode => {
  const feature = (icon: string, title: string, body: string): SectionNode => ({
    type: 'Card',
    props: { _padding: 24 },
    slots: {
      default: [
        {
          type: 'Flex',
          props: { direction: 'column', gap: 12 },
          slots: {
            default: [
              { type: 'Icon', props: { name: icon, size: 32, color: 'var(--au-primary)' } },
              { type: 'Text', props: { content: title, variant: 'h3', weight: 'semibold' } },
              { type: 'Text', props: { content: body, variant: 'body', color: 'secondary' } },
            ],
          },
        },
      ],
    },
  });
  return {
    type: 'Grid',
    props: { mode: 'fixed', cols: 3, gap: 16 },
    slots: {
      'cell-0': [feature('charts-bar', '数据可视化', '内置 Bar3D / Sparkline / Gauge 等可视化组件, 看板搭得快.')],
      'cell-1': [feature('click', '拖拽搭建', '可视化页面搭建器, 不写代码也能产出 JSX, 一键导出.')],
      'cell-2': [feature('scenes', '极光质感', 'AuroraBg / GlowCard / GradientText 招牌组件, 视觉直接拉档.')],
    },
  };
};

/** Stats 数据条 — Row 4 列, 每列 NumberRoll + 描述 */
const statsSection = (): SectionNode => {
  const stat = (value: number, label: string, prefix?: string, suffix?: string): SectionNode => ({
    type: 'Flex',
    props: { direction: 'column', gap: 4, align: 'center', _grow: 1 },
    slots: {
      default: [
        {
          type: 'NumberRoll',
          props: {
            value,
            prefix,
            suffix,
            size: 44,
            weight: 800,
            color: 'var(--au-primary)',
          },
        },
        { type: 'Text', props: { content: label, variant: 'caption', color: 'tertiary' } },
      ],
    },
  });
  return {
    type: 'Card',
    props: { _padding: 24 },
    slots: {
      default: [
        {
          type: 'Row',
          props: { gap: 24, align: 'middle', justify: 'space-around' },
          slots: {
            default: [
              stat(60, '组件数量', undefined, '+'),
              stat(1284560, '在线用户'),
              stat(99.9, '可用率', undefined, '%'),
              stat(28, '看板模板', undefined, '+'),
            ],
          },
        },
      ],
    },
  };
};

/** CTA 横幅 — AuroraBg + 单行大标题 + 一个按钮, 用于页脚号召 */
const ctaSection = (): SectionNode => ({
  type: 'AuroraBg',
  props: {
    preset: 'cosmic',
    blur: 120,
    intensity: 0.8,
    _minHeight: 220,
  },
  slots: {
    default: [
      {
        type: 'Flex',
        props: {
          direction: 'column',
          gap: 16,
          align: 'center',
          justify: 'center',
          _padding: 48,
          _grow: 1,
        },
        slots: {
          default: [
            {
              type: 'GradientText',
              props: {
                children: '准备好开始了吗?',
                preset: 'cosmic',
                size: 40,
                weight: 800,
                as: 'h2',
              },
            },
            {
              type: 'Text',
              props: {
                content: '一行命令开始, 看板搭建从未如此轻松.',
                variant: 'body',
                color: 'secondary',
              },
            },
            {
              type: 'Button',
              props: { type: 'primary', size: 'large', children: '立即开始 →' },
            },
          ],
        },
      },
    ],
  },
});

/** KPI 卡片行 — Grid 4 列, 每张 KpiCard */
const kpiRowSection = (): SectionNode => {
  const kpi = (title: string, value: string, delta: number, status: 'success' | 'danger'): SectionNode => ({
    type: 'KpiCard',
    props: {
      title,
      value,
      delta: { value: delta, suffix: '%' },
      status,
    },
  });
  return {
    type: 'Grid',
    props: { mode: 'fixed', cols: 4, gap: 16 },
    slots: {
      'cell-0': [kpi('总销售额', '¥ 1,284,560', 12.4, 'success')],
      'cell-1': [kpi('新增用户', '8,624', 5.2, 'success')],
      'cell-2': [kpi('转化率', '24.6%', -1.8, 'danger')],
      'cell-3': [kpi('留存率', '78.3%', 2.1, 'success')],
    },
  };
};

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    key: 'hero',
    label: '极光 Hero',
    description: 'AuroraBg + 渐变标题 + CTA 按钮, Landing 顶区招牌',
    icon: <Ico name="scenes" />,
    build: heroSection,
  },
  {
    key: 'pricing',
    label: 'Pricing 价格 3 列',
    description: 'GlowCard × 3, 含 NumberRoll 价格滚动',
    icon: <Ico name="card" />,
    build: pricingSection,
  },
  {
    key: 'features',
    label: 'Feature 特性 3 列',
    description: '3 张特性卡, Icon + 标题 + 说明',
    icon: <Ico name="editor-three-column" />,
    build: featuresSection,
  },
  {
    key: 'stats',
    label: 'Stats 数据条',
    description: '4 列 NumberRoll, 看板装饰条',
    icon: <Ico name="calculator" />,
    build: statsSection,
  },
  {
    key: 'cta',
    label: 'CTA 号召横幅',
    description: '极光底 + 大标题 + 主按钮, 页脚招呼',
    icon: <Ico name="click" />,
    build: ctaSection,
  },
  {
    key: 'kpi-row',
    label: 'KPI 4 列',
    description: 'KpiCard 一字排开, 看板顶部标配',
    icon: <Ico name="charts-bar" />,
    build: kpiRowSection,
  },
];

export const getSectionTemplate = (key: string): SectionTemplate | undefined =>
  SECTION_TEMPLATES.find((s) => s.key === key);

/** 把 SectionNode 树递归转成带 id 的 BlockConfig 树 */
export const materializeSection = (node: SectionNode, makeId: () => string): BlockConfig => ({
  id: makeId(),
  type: node.type,
  props: { ...node.props },
  slots: node.slots
    ? Object.fromEntries(
        Object.entries(node.slots).map(([k, v]) => [k, v.map((c) => materializeSection(c, makeId))]),
      )
    : undefined,
});
