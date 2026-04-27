import React from 'react';
import {
  AuroraBg,
  GradientText,
  GlowCard,
  NumberRoll,
  Tag,
  Icon,
  type AuroraPreset,
  type GradientPreset,
} from '../components';
import './Design.css';

const Design: React.FC = () => {
  return (
    <div className="dp">
      {/* === Banner === */}
      <AuroraBg preset="cosmic" intensity={0.55} blur={90} className="dp-banner">
        <div className="dp-banner__inner">
          <Tag color="purple">理念</Tag>
          <h1 className="dp-banner__title">
            <GradientText preset="cosmic" size={40} weight={800} as="span">
              设计理念
            </GradientText>
          </h1>
          <p className="dp-banner__sub">
            灵感来自北极光 — 流动 · 克制 · 有光. 这里讲为什么 AuroraUI 长这样.
          </p>
        </div>
      </AuroraBg>

      {/* === 5 大原则 === */}
      <section className="dp-section">
        <div className="dp-section__head">
          <h2 className="dp-section__title">五条基本原则</h2>
          <p className="dp-section__sub">
            不写"好看", 因为这是底线. 我们关心的是: 同样的事不要做两次,
            视觉服务于信息, 留白比堆砌更难.
          </p>
        </div>
        <div className="dp-principles">
          <Principle
            icon="repeated"
            color="#6366f1"
            title="一致"
            body="间距 4 的倍数, 圆角统一为 10px, hover/focus 全套微动效共用同一条曲线. 用户学一遍, 通吃 60+ 组件."
          />
          <Principle
            icon="lock"
            color="#a855f7"
            title="克制"
            body={`不为表现而表现. 阴影只用于"浮起"语义, 动画必须服务于反馈. 没有理由的装饰一律不加.`}
          />
          <Principle
            icon="scenes"
            color="#22d3ee"
            title="极光感"
            body="AuroraBg / GlowCard / GradientText 等招牌组件来自对北极光的拟人化 — 流动 / 多层 / 半透明 / 边缘柔光."
          />
          <Principle
            icon="charts-bar"
            color="#10b981"
            title="数据看板优先"
            body="不是又一个 antd 克隆. KpiCard / Sparkline / Heatmap / Gauge 等中后台真用得上的组件优先做透."
          />
          <Principle
            icon="change"
            color="#f472b6"
            title="开放"
            body="所有视觉变量都是 CSS variable, 所有内部 dom 都有清晰的 className. 改一个变量改全套, 不需要 fork."
          />
        </div>
      </section>

      {/* === 色彩系统 === */}
      <section className="dp-section">
        <div className="dp-section__head">
          <h2 className="dp-section__title">色彩系统</h2>
          <p className="dp-section__sub">
            主色取通透的极光蓝 <code>#5b8def</code>, 辅以青/紫/绿/粉 4 个极光带.
            5 套渐变预设直接对应 5 种产品语境.
          </p>
        </div>

        {/* 品牌色 */}
        <div className="dp-tokens">
          {[
            ['#5b8def', '--au-primary', '主色 / 极光蓝'],
            ['#10b981', '--au-success', '成功'],
            ['#f59e0b', '--au-warning', '警告'],
            ['#ef4444', '--au-danger', '危险'],
            ['#6b7280', '--au-text-2', '次文字'],
          ].map(([c, name, label]) => (
            <div key={name} className="dp-token">
              <div className="dp-token__chip" style={{ background: c }} />
              <div className="dp-token__name">{label}</div>
              <code className="dp-token__var">{name}</code>
              <code className="dp-token__hex">{c}</code>
            </div>
          ))}
        </div>

        {/* 5 套极光预设 */}
        <h3 className="dp-subtitle">5 套极光预设</h3>
        <div className="dp-presets">
          {(
            [
              { key: 'aurora', label: 'aurora', desc: '默认招牌, 蓝紫青绿粉, 最广义场景' },
              { key: 'sunset', label: 'sunset', desc: '日落橙红紫黄, 营销页 / 暖系' },
              { key: 'ocean', label: 'ocean', desc: '深海蓝青, 冷静专业' },
              { key: 'forest', label: 'forest', desc: '森林绿青, 数据 / 健康' },
              { key: 'cosmic', label: 'cosmic', desc: '星宇深紫粉黄, 科技 / 神秘' },
            ] as { key: AuroraPreset; label: string; desc: string }[]
          ).map((p) => (
            <div key={p.key} className="dp-preset">
              <AuroraBg
                preset={p.key}
                style={{ height: 96, borderRadius: 10 }}
                intensity={0.85}
              />
              <div className="dp-preset__meta">
                <GradientText preset={p.key as GradientPreset} size={16} weight={700} as="span">
                  {p.label}
                </GradientText>
                <span>{p.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* === 间距尺度 === */}
      <section className="dp-section">
        <div className="dp-section__head">
          <h2 className="dp-section__title">间距与尺寸</h2>
          <p className="dp-section__sub">
            4 的倍数作为基础单位 — 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40.
            圆角默认 10px, 在柔和与锐利之间取得平衡.
          </p>
        </div>
        <div className="dp-spacing">
          {[4, 8, 12, 16, 20, 24, 32, 40].map((n) => (
            <div key={n} className="dp-spacing__row">
              <span className="dp-spacing__label">
                <NumberRoll value={n} size={14} weight={700} suffix="px" color="var(--au-primary)" />
              </span>
              <div className="dp-spacing__bar" style={{ width: n * 4 }} />
            </div>
          ))}
        </div>
      </section>

      {/* === 动效 === */}
      <section className="dp-section">
        <div className="dp-section__head">
          <h2 className="dp-section__title">动效曲线</h2>
          <p className="dp-section__sub">
            一律使用 <code>cubic-bezier(0.4, 0, 0.2, 1)</code> 作为标准缓动.
            进入快、退出慢, 让用户感觉系统"听话". 例外: 流体 / 拖动用
            <code>cubic-bezier(0.16, 1, 0.3, 1)</code> (柔回弹).
          </p>
        </div>
        <div className="dp-curves">
          <CurveCard
            name="standard"
            curve="cubic-bezier(0.4, 0, 0.2, 1)"
            usage="点击 / 悬停 / 折叠 — 默认场景"
          />
          <CurveCard
            name="emphasized"
            curve="cubic-bezier(0.16, 1, 0.3, 1)"
            usage="弹性 / 拖回弹 / NumberRoll 翻牌"
          />
          <CurveCard
            name="linear"
            curve="linear"
            usage="渐变流动 / 旋转 / 进度条无关时序"
          />
        </div>
      </section>
    </div>
  );
};

const Principle: React.FC<{
  icon: string;
  color: string;
  title: string;
  body: string;
}> = ({ icon, color, title, body }) => (
  <GlowCard glowColor={color} intensity={0.5} padding={24}>
    <div className="dp-principle__icon" style={{ color }}>
      <Icon name={icon} size={26} />
    </div>
    <h3 className="dp-principle__title">{title}</h3>
    <p className="dp-principle__body">{body}</p>
  </GlowCard>
);

const CurveCard: React.FC<{
  name: string;
  curve: string;
  usage: string;
}> = ({ name, curve, usage }) => (
  <div className="dp-curve">
    <div className="dp-curve__head">
      <strong>{name}</strong>
      <code>{curve}</code>
    </div>
    <div className="dp-curve__demo">
      <span
        className="dp-curve__ball"
        style={{ animationTimingFunction: curve }}
      />
    </div>
    <p className="dp-curve__usage">{usage}</p>
  </div>
);

export default Design;
