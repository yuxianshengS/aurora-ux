import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsTheme } from '../../hooks/useEChartsTheme';
import './EChart.css';

/**
 * 薄壳 ECharts 组件. 职责:
 *   - 接 Aurora 主题 (色板 + textStyle 自动注入, 暗 / 亮自动跟)
 *   - 容器 resize 由 echarts-for-react 兜
 *   - 透传 onEvents / lazyUpdate / notMerge / loading / onChartReady
 *
 * 不做 option 翻译 — 你给什么 ECharts option 它就渲染什么.
 */
export interface EChartProps {
  /** ECharts 完整 option 配置. */
  option: Record<string, unknown>;
  /** 图表高度 (px / string), 默认 360. */
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  /** 显示加载态. */
  loading?: boolean;
  /** 透传到底层 ECharts onEvents. */
  onEvents?: Record<string, (params: unknown) => void>;
  /** 透传 — chart 实例创建后回调, 可用来拿到 echarts 实例做 dispatchAction 等. */
  onChartReady?: (instance: unknown) => void;
  /**
   * 是否自动注入 Aurora 主题 (color 色板 + textStyle). 默认 true.
   * 若 option 里显式给了 color / textStyle, 不会被覆盖.
   * 关掉则完全用 option 原样.
   */
  autoTheme?: boolean;
  /** 是否合并旧 option (false 会全量替换), 默认 true. */
  notMerge?: boolean;
  /** 是否延迟更新, 默认 true. */
  lazyUpdate?: boolean;
}

const EChart: React.FC<EChartProps> = ({
  option,
  height = 360,
  className = '',
  style,
  loading = false,
  onEvents,
  onChartReady,
  autoTheme = true,
  notMerge = true,
  lazyUpdate = true,
}) => {
  const themeOption = useEChartsTheme();

  const finalOption = useMemo(() => {
    if (!autoTheme) return option;
    const { color: themeColor, textStyle: themeTextStyle } = (themeOption ?? {}) as {
      color?: string[];
      textStyle?: Record<string, unknown>;
    };
    // 默认值在前, option 在后 — option 里显式指定的 color / textStyle 会覆盖默认.
    // backgroundColor 给 transparent 让组件背景跟随容器, 而不是 echarts 默认白底.
    return {
      backgroundColor: 'transparent',
      color: themeColor,
      textStyle: themeTextStyle,
      ...option,
    };
  }, [option, themeOption, autoTheme]);

  return (
    <div className={['au-echart', className].filter(Boolean).join(' ')} style={style}>
      <ReactECharts
        option={finalOption}
        style={{ height, width: '100%' }}
        notMerge={notMerge}
        lazyUpdate={lazyUpdate}
        showLoading={loading}
        onEvents={onEvents}
        onChartReady={onChartReady}
      />
    </div>
  );
};

export default EChart;
