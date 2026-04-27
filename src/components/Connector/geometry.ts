/**
 * Connector 几何工具: 边/锚点/路径
 */

export type Side = 'top' | 'right' | 'bottom' | 'left';
export type SideOpt = 'auto' | Side;
export type ConnectorType = 'straight' | 'curve' | 'step' | 'orthogonal';

export interface Pt {
  x: number;
  y: number;
}

export const midX = (r: DOMRect) => (r.left + r.right) / 2;
export const midY = (r: DOMRect) => (r.top + r.bottom) / 2;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 两个 rect 中心连线的主方向决定 side */
export function pickSide(self: DOMRect, other: DOMRect): Side {
  const dx = midX(other) - midX(self);
  const dy = midY(other) - midY(self);
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'bottom' : 'top';
}

/** 在 rect 的某条边上, 按 t (0..1) 取一个锚点 */
export function anchorAt(rect: DOMRect, side: Side, t: number): Pt {
  switch (side) {
    case 'top':
      return { x: lerp(rect.left, rect.right, t), y: rect.top };
    case 'bottom':
      return { x: lerp(rect.left, rect.right, t), y: rect.bottom };
    case 'left':
      return { x: rect.left, y: lerp(rect.top, rect.bottom, t) };
    case 'right':
      return { x: rect.right, y: lerp(rect.top, rect.bottom, t) };
  }
}

/** 从某点沿某方向延伸 dist 像素 */
export function projectFromSide(p: Pt, side: Side, dist: number): Pt {
  switch (side) {
    case 'top':
      return { x: p.x, y: p.y - dist };
    case 'bottom':
      return { x: p.x, y: p.y + dist };
    case 'left':
      return { x: p.x - dist, y: p.y };
    case 'right':
      return { x: p.x + dist, y: p.y };
  }
}

/** 沿 side 加上 offset 偏移 (起点/终点不紧贴 dom 边缘) */
export function applyOffset(p: Pt, side: Side, offset: number): Pt {
  return projectFromSide(p, side, offset);
}

const sign = (n: number) => (n > 0 ? 1 : n < 0 ? -1 : 0);

/* ============== 路径生成 ============== */

export function pathStraight(a: Pt, b: Pt): string {
  return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
}

export function pathCurve(a: Pt, sa: Side, b: Pt, sb: Side): string {
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  const ext = Math.max(40, dist * 0.4);
  const cp1 = projectFromSide(a, sa, ext);
  const cp2 = projectFromSide(b, sb, ext);
  return `M ${a.x} ${a.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${b.x} ${b.y}`;
}

/** 直角折线 (3 段). 起始 side 决定先横走还是先竖走 */
export function pathStep(a: Pt, sa: Side, b: Pt): string {
  const horizontal = sa === 'left' || sa === 'right';
  if (horizontal) {
    const mid = (a.x + b.x) / 2;
    return `M ${a.x} ${a.y} L ${mid} ${a.y} L ${mid} ${b.y} L ${b.x} ${b.y}`;
  } else {
    const mid = (a.y + b.y) / 2;
    return `M ${a.x} ${a.y} L ${a.x} ${mid} L ${b.x} ${mid} L ${b.x} ${b.y}`;
  }
}

/* ============== 障碍物绕行 ============== */

export interface ObstacleRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

const expandRect = (r: ObstacleRect, m: number): ObstacleRect => ({
  left: r.left - m,
  right: r.right + m,
  top: r.top - m,
  bottom: r.bottom + m,
});

const hSegHitsRect = (y: number, x1: number, x2: number, r: ObstacleRect): boolean => {
  if (y <= r.top || y >= r.bottom) return false;
  const lo = Math.min(x1, x2);
  const hi = Math.max(x1, x2);
  return hi > r.left && lo < r.right;
};

const vSegHitsRect = (x: number, y1: number, y2: number, r: ObstacleRect): boolean => {
  if (x <= r.left || x >= r.right) return false;
  const lo = Math.min(y1, y2);
  const hi = Math.max(y1, y2);
  return hi > r.top && lo < r.bottom;
};

/** H-V-H 折线的 3 段是否撞到任何障碍 */
const stepHHits = (
  a: Pt,
  mid: number,
  b: Pt,
  obstacles: ObstacleRect[],
  margin = 8,
): ObstacleRect[] => {
  const hits: ObstacleRect[] = [];
  for (const o of obstacles) {
    const e = expandRect(o, margin);
    if (
      hSegHitsRect(a.y, a.x, mid, e) ||
      vSegHitsRect(mid, a.y, b.y, e) ||
      hSegHitsRect(b.y, mid, b.x, e)
    ) {
      hits.push(o);
    }
  }
  return hits;
};

/** V-H-V 折线的 3 段是否撞到任何障碍 */
const stepVHits = (
  a: Pt,
  mid: number,
  b: Pt,
  obstacles: ObstacleRect[],
  margin = 8,
): ObstacleRect[] => {
  const hits: ObstacleRect[] = [];
  for (const o of obstacles) {
    const e = expandRect(o, margin);
    if (
      vSegHitsRect(a.x, a.y, mid, e) ||
      hSegHitsRect(mid, a.x, b.x, e) ||
      vSegHitsRect(b.x, mid, b.y, e)
    ) {
      hits.push(o);
    }
  }
  return hits;
};

/**
 * 带绕行的 step 路径: 默认 mid 撞到障碍时, 把 mid 推到障碍边外侧.
 * MVP 单障碍处理 — 多个障碍取离原 mid 最近那个绕开.
 */
export function pathStepAvoiding(
  a: Pt,
  sa: Side,
  b: Pt,
  obstacles: ObstacleRect[],
  margin = 14,
): string {
  if (obstacles.length === 0) return pathStep(a, sa, b);
  const horizontal = sa === 'left' || sa === 'right';
  if (horizontal) {
    let mid = (a.x + b.x) / 2;
    const hits = stepHHits(a, mid, b, obstacles);
    if (hits.length > 0) {
      let pick = hits[0];
      let dist = Math.abs((pick.left + pick.right) / 2 - mid);
      for (const o of hits.slice(1)) {
        const d = Math.abs((o.left + o.right) / 2 - mid);
        if (d < dist) {
          pick = o;
          dist = d;
        }
      }
      const rightOf = pick.right + margin;
      const leftOf = pick.left - margin;
      mid =
        Math.abs(rightOf - mid) < Math.abs(leftOf - mid) ? rightOf : leftOf;
    }
    return `M ${a.x} ${a.y} L ${mid} ${a.y} L ${mid} ${b.y} L ${b.x} ${b.y}`;
  } else {
    let mid = (a.y + b.y) / 2;
    const hits = stepVHits(a, mid, b, obstacles);
    if (hits.length > 0) {
      let pick = hits[0];
      let dist = Math.abs((pick.top + pick.bottom) / 2 - mid);
      for (const o of hits.slice(1)) {
        const d = Math.abs((o.top + o.bottom) / 2 - mid);
        if (d < dist) {
          pick = o;
          dist = d;
        }
      }
      const belowOf = pick.bottom + margin;
      const aboveOf = pick.top - margin;
      mid =
        Math.abs(belowOf - mid) < Math.abs(aboveOf - mid) ? belowOf : aboveOf;
    }
    return `M ${a.x} ${a.y} L ${a.x} ${mid} L ${b.x} ${mid} L ${b.x} ${b.y}`;
  }
}

/** 直角折线 + 圆角拐弯 */
export function pathOrthogonal(a: Pt, sa: Side, b: Pt, radius: number = 12): string {
  const horizontal = sa === 'left' || sa === 'right';
  if (horizontal) {
    const mid = (a.x + b.x) / 2;
    const dirY = sign(b.y - a.y);
    const dirX = sign(b.x - mid);
    if (dirY === 0) return pathStraight(a, b); // 同高度, 直线即可
    const r = Math.min(radius, Math.abs(b.y - a.y) / 2, Math.abs(b.x - mid));
    // L 到第一个拐点前
    const x1 = mid - dirX * r * (sign(mid - a.x) || 1) * 0; // 简化
    void x1;
    return [
      `M ${a.x} ${a.y}`,
      `L ${mid - sign(mid - a.x) * r} ${a.y}`,
      `Q ${mid} ${a.y}, ${mid} ${a.y + dirY * r}`,
      `L ${mid} ${b.y - dirY * r}`,
      `Q ${mid} ${b.y}, ${mid + dirX * r} ${b.y}`,
      `L ${b.x} ${b.y}`,
    ].join(' ');
  } else {
    const mid = (a.y + b.y) / 2;
    const dirX = sign(b.x - a.x);
    const dirY = sign(b.y - mid);
    if (dirX === 0) return pathStraight(a, b);
    const r = Math.min(radius, Math.abs(b.x - a.x) / 2, Math.abs(b.y - mid));
    return [
      `M ${a.x} ${a.y}`,
      `L ${a.x} ${mid - sign(mid - a.y) * r}`,
      `Q ${a.x} ${mid}, ${a.x + dirX * r} ${mid}`,
      `L ${b.x - dirX * r} ${mid}`,
      `Q ${b.x} ${mid}, ${b.x} ${mid + dirY * r}`,
      `L ${b.x} ${b.y}`,
    ].join(' ');
  }
}

/** 估算路径中点 (用作 label 定位): straight/curve 用线性中点; step/orthogonal 用 mid */
export function midPoint(
  a: Pt,
  b: Pt,
  type: ConnectorType,
  sa: Side,
): Pt {
  if (type === 'step' || type === 'orthogonal') {
    const horizontal = sa === 'left' || sa === 'right';
    if (horizontal) return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
