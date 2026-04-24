import React from "react";
import "./Grid.css";

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 列数 (仅在 minColWidth 未设时生效; 固定列模式) */
  cols?: number;
  /** 行数 (固定模式; 不传则自动行高) */
  rows?: number;
  /**
   * 每列最小宽度 (px 或 CSS 长度)。一旦设置, 进入 auto-fit 模式:
   * 子项按此最小宽自适应分列, 容器窄了自动换行 — cols/rows 被忽略
   */
  minColWidth?: number | string;
  /** 列 / 行间距 */
  gap?: number | string;
  /** 行间距; 不传则跟 gap 一致 */
  rowGap?: number | string;
  /** 每行最小高度 (px) */
  rowMinHeight?: number | string;
  /** 垂直对齐 */
  align?: "start" | "center" | "end" | "stretch";
  /** 水平对齐 (容器内组件靠左 / 居中 / 靠右 / 填满) */
  justifyItems?: "start" | "center" | "end" | "stretch";
}

const Grid: React.FC<GridProps> = ({
  cols = 3,
  rows,
  minColWidth,
  gap = 12,
  rowGap,
  rowMinHeight,
  align = "stretch",
  justifyItems = "stretch",
  className = "",
  style,
  children,
  ...rest
}) => {
  const gapStr = typeof gap === "number" ? `${gap}px` : gap;
  const rowGapStr =
    rowGap != null
      ? typeof rowGap === "number"
        ? `${rowGap}px`
        : rowGap
      : gapStr;
  const minRowHeight =
    rowMinHeight != null
      ? typeof rowMinHeight === "number"
        ? `${rowMinHeight}px`
        : rowMinHeight
      : undefined;

  const isAuto = minColWidth != null && minColWidth !== "";
  const minColW =
    typeof minColWidth === "number"
      ? `${minColWidth}px`
      : (minColWidth as string);

  const commonStyle: React.CSSProperties = {
    alignItems: align,
    justifyItems,
    columnGap: gapStr,
    rowGap: rowGapStr,
    width: "100%",
  };

  const gridStyle: React.CSSProperties = isAuto
    ? {
        display: "grid",
        // 用 auto-fill 而不是 auto-fit: 空列保留占位, 只拖一个组件时不会撑满整行
        gridTemplateColumns: `repeat(auto-fill, minmax(${minColW}, 1fr))`,
        ...(minRowHeight ? {} : {}),
        ...commonStyle,
        ...style,
      }
    : (() => {
        const colVal = Math.max(1, cols | 0);
        const rowVal = rows != null ? Math.max(1, rows | 0) : null;
        return {
          display: "grid",
          gridTemplateColumns: `repeat(${colVal}, minmax(0, 1fr))`,
          ...(rowVal
            ? {
                gridTemplateRows: `repeat(${rowVal}, ${minRowHeight ?? "auto"})`,
              }
            : minRowHeight
              ? {}
              : {}),
          ...commonStyle,
          ...style,
        };
      })();

  return (
    <div
      className={[
        "au-grid",
        isAuto ? "au-grid--auto" : "au-grid--fixed",
        `au-grid--align-${align}`,
        `au-grid--just-${justifyItems}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={gridStyle}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Grid;
