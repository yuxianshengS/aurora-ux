import { useLayoutEffect, useRef, type DependencyList } from 'react';

/**
 * 弹层定位的统一副作用监听 — 只要 enabled 为 true:
 * 1. 立刻调一次 update (lay out 时同步算位置, 跟 useLayoutEffect 节奏一致)
 * 2. requestAnimationFrame 再调一次 (popup 第一帧绘制后 offsetWidth/Height
 *    才有准, 重新量一次避免错位)
 * 3. window scroll(capture) + resize 时跟着调
 *
 * Dropdown / Select / DatePicker / Cascader / TreeSelect / ColorPicker /
 * AutoComplete / Tooltip / Popconfirm 这一组 portal 弹层共用的订阅模板,
 * 抽出来后每个组件只剩"怎么算 top/left" 这点本质逻辑。
 *
 * 实现细节: update 用 ref 缓存最新引用, 不进 deps —— 调用方传内联函数
 * 也不会每次 re-render 重挂 listener。要重新计算位置时把相关变量放
 * `deps` 里 (例如 placement / popupMaxHeight)。
 */
export function useReactivePosition(
  enabled: boolean,
  update: () => void,
  deps: DependencyList = [],
): void {
  const updateRef = useRef(update);
  updateRef.current = update;

  useLayoutEffect(() => {
    if (!enabled) return;
    const run = () => updateRef.current();
    run();
    const raf = requestAnimationFrame(run);
    window.addEventListener('scroll', run, true);
    window.addEventListener('resize', run);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', run, true);
      window.removeEventListener('resize', run);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);
}
