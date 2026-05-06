import { useEffect, useRef, type RefObject } from 'react';

type AnyRef = RefObject<Element | null>;

/**
 * 弹层组件统一的"点空白处关闭"监听 — Dropdown / Select / DatePicker /
 * Cascader / TreeSelect / Tooltip / Popconfirm / Menu(popup 模式) /
 * AutoComplete / Mentions / ColorPicker / FloatButton 都走这条.
 *
 * 用 mousedown 而非 click — 跟全库其他弹层节奏一致, 也避免内部 input
 * 的 mousedown 已经把 trigger blur 掉时 click 才到、被判定为外部点击.
 *
 * @param refs       trigger / popup / 任意嵌套层 — 命中其中之一就不算外部
 * @param onOutside  外部点击时的回调 (一般是 setOpen(false))
 * @param enabled    关闭/未挂载时传 false, 不挂监听 (默认 true)
 *
 * 注意: refs 数组和 onOutside 用 ref 缓存, 不进 deps. 这样调用方传
 * 内联 `[wrapRef, popupRef]` 也不会每次 re-render 都重挂 listener.
 */
export function useOutsideClick(
  refs: ReadonlyArray<AnyRef>,
  onOutside: (e: MouseEvent) => void,
  enabled: boolean = true,
): void {
  const refsRef = useRef(refs);
  refsRef.current = refs;
  const cbRef = useRef(onOutside);
  cbRef.current = onOutside;

  useEffect(() => {
    if (!enabled) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      for (const ref of refsRef.current) {
        if (ref.current?.contains(t)) return;
      }
      cbRef.current(e);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [enabled]);
}
