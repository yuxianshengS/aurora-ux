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
