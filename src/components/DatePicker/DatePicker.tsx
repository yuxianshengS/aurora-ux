import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { useReactivePosition } from '../../hooks/useReactivePosition';
import './DatePicker.css';
import {
  addDays,
  addMonths,
  addYears,
  cmpDay,
  defaultFormats,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  firstDayOfISOWeek,
  formatDate,
  getISOWeek,
  getQuarter,
  isSameDay,
  isSameISOWeek,
  isSameMonth,
  isSameQuarter,
  isSameYear,
  mondayIndex,
  pad,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  weeksInISOYear,
} from './utils';

export type PickerMode = 'date' | 'year' | 'month' | 'quarter' | 'week' | 'time';
type RangeTuple = [Date | null, Date | null];

export interface DatePickerBaseProps {
  picker?: PickerMode;
  showTime?: boolean;
  format?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  allowClear?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface SingleDatePickerProps extends DatePickerBaseProps {
  range?: false;
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (value: Date | null, text: string) => void;
  placeholder?: string;
}

export interface RangeDatePickerProps extends DatePickerBaseProps {
  range: true;
  value?: RangeTuple;
  defaultValue?: RangeTuple;
  onChange?: (value: RangeTuple, text: [string, string]) => void;
  placeholder?: [string, string];
}

export type DatePickerProps = SingleDatePickerProps | RangeDatePickerProps;

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];
const MONTHS = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
];

function getFormat(picker: PickerMode, showTime: boolean, custom?: string): string {
  if (custom) return custom;
  if (picker === 'date' && showTime) return defaultFormats['date-time'];
  return defaultFormats[picker];
}

function defaultPlaceholder(picker: PickerMode, showTime: boolean): string {
  if (picker === 'date') return showTime ? '选择日期时间' : '选择日期';
  if (picker === 'year') return '选择年份';
  if (picker === 'month') return '选择月份';
  if (picker === 'quarter') return '选择季度';
  if (picker === 'week') return '选择周';
  return '选择时间';
}

/** Commit the picked date per mode (e.g. month → 1st of month). */
function normalizePick(d: Date, picker: PickerMode, showTime: boolean): Date {
  switch (picker) {
    case 'year':
      return new Date(d.getFullYear(), 0, 1);
    case 'month':
      return new Date(d.getFullYear(), d.getMonth(), 1);
    case 'quarter':
      return startOfQuarter(d);
    case 'week':
      return startOfWeek(d);
    case 'time':
      return d;
    case 'date':
    default:
      return showTime
        ? d
        : new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
}

/* ---------------- panels ---------------- */

interface PanelBaseProps {
  viewDate: Date;
  setViewDate: (d: Date) => void;
  onPick: (d: Date) => void;
  picker: PickerMode;
  /** already-committed value for highlight */
  value?: Date | null;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  hoverDate?: Date | null;
  setHoverDate?: (d: Date | null) => void;
  isRange?: boolean;
  onYearLabelClick?: () => void;
  onMonthLabelClick?: () => void;
}

function DateGrid(props: PanelBaseProps) {
  const {
    viewDate, setViewDate, onPick, value,
    rangeStart, rangeEnd, hoverDate, setHoverDate, isRange, picker,
    onYearLabelClick, onMonthLabelClick,
  } = props;
  const first = startOfMonth(viewDate);
  const offset = mondayIndex(first);
  const firstCell = addDays(first, -offset);
  const today = new Date();

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) days.push(addDays(firstCell, i));

  const inRange = (d: Date) => {
    if (!isRange) return false;
    const start = rangeStart;
    const end = rangeEnd ?? hoverDate ?? null;
    if (!start || !end) return false;
    const [lo, hi] = cmpDay(start, end) <= 0 ? [start, end] : [end, start];
    return cmpDay(d, lo) >= 0 && cmpDay(d, hi) <= 0;
  };

  const rowCount = 6;
  const rows: Date[][] = [];
  for (let r = 0; r < rowCount; r++) rows.push(days.slice(r * 7, r * 7 + 7));

  return (
    <div className="au-dp__body">
      <div className="au-dp__nav">
        <button className="au-dp__nav-btn" onClick={() => setViewDate(addYears(viewDate, -1))}>«</button>
        <button className="au-dp__nav-btn" onClick={() => setViewDate(addMonths(viewDate, -1))}>‹</button>
        <span className="au-dp__nav-label">
          {onYearLabelClick ? (
            <button type="button" className="au-dp__nav-link" onClick={onYearLabelClick}>
              {viewDate.getFullYear()} 年
            </button>
          ) : (
            <span>{viewDate.getFullYear()} 年</span>
          )}
          {onMonthLabelClick ? (
            <button type="button" className="au-dp__nav-link" onClick={onMonthLabelClick}>
              {viewDate.getMonth() + 1} 月
            </button>
          ) : (
            <span>{viewDate.getMonth() + 1} 月</span>
          )}
        </span>
        <button className="au-dp__nav-btn" onClick={() => setViewDate(addMonths(viewDate, 1))}>›</button>
        <button className="au-dp__nav-btn" onClick={() => setViewDate(addYears(viewDate, 1))}>»</button>
      </div>
      <div className="au-dp__weekdays">
        {WEEKDAYS.map((w) => <span key={w}>{w}</span>)}
      </div>
      <div className="au-dp__grid au-dp__grid--date">
        {rows.map((row, ri) => (
          <div key={ri} className="au-dp__row">
            {row.map((d) => {
              const muted = d.getMonth() !== viewDate.getMonth();
              const selected = value && isSameDay(d, value);
              const rs = rangeStart && isSameDay(d, rangeStart);
              const re = rangeEnd && isSameDay(d, rangeEnd);
              return (
                <button
                  key={d.getTime()}
                  type="button"
                  className={[
                    'au-dp__cell',
                    muted ? 'is-muted' : '',
                    isSameDay(d, today) ? 'is-today' : '',
                    selected ? 'is-selected' : '',
                    rs ? 'is-range-start' : '',
                    re ? 'is-range-end' : '',
                    inRange(d) ? 'is-in-range' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPick(d);
                  }}
                  onMouseEnter={() => setHoverDate?.(d)}
                >
                  <span>{d.getDate()}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function YearGrid(props: PanelBaseProps) {
  const { viewDate, setViewDate, onPick, value, rangeStart, rangeEnd, hoverDate, isRange } = props;
  const decadeStart = Math.floor(viewDate.getFullYear() / 10) * 10;
  const years: number[] = [];
  for (let i = -1; i <= 10; i++) years.push(decadeStart + i);

  const inRange = (y: number) => {
    if (!isRange) return false;
    const start = rangeStart;
    const end = rangeEnd ?? hoverDate ?? null;
    if (!start || !end) return false;
    const [lo, hi] = [Math.min(start.getFullYear(), end.getFullYear()), Math.max(start.getFullYear(), end.getFullYear())];
    return y >= lo && y <= hi;
  };

  return (
    <div className="au-dp__body">
      <div className="au-dp__nav">
        <button className="au-dp__nav-btn" onClick={() => setViewDate(addYears(viewDate, -10))}>«</button>
        <span className="au-dp__nav-label">{decadeStart} - {decadeStart + 9}</span>
        <button className="au-dp__nav-btn" onClick={() => setViewDate(addYears(viewDate, 10))}>»</button>
      </div>
      <div className="au-dp__grid au-dp__grid--year">
        {years.map((y) => {
          const muted = y < decadeStart || y > decadeStart + 9;
          const selected = value && value.getFullYear() === y;
          const rs = rangeStart && rangeStart.getFullYear() === y;
          const re = rangeEnd && rangeEnd.getFullYear() === y;
          return (
            <button
              key={y}
              type="button"
              className={[
                'au-dp__cell au-dp__cell--yqm',
                muted ? 'is-muted' : '',
                selected ? 'is-selected' : '',
                rs ? 'is-range-start' : '',
                re ? 'is-range-end' : '',
                inRange(y) ? 'is-in-range' : '',
              ].filter(Boolean).join(' ')}
              onClick={(e) => { e.stopPropagation(); onPick(new Date(y, 0, 1)); }}
              onMouseEnter={() => props.setHoverDate?.(new Date(y, 0, 1))}
            >
              <span>{y}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MonthGrid(props: PanelBaseProps) {
  const { viewDate, setViewDate, onPick, value, rangeStart, rangeEnd, hoverDate, isRange } = props;
  const year = viewDate.getFullYear();

  const monthKey = (d: Date) => d.getFullYear() * 12 + d.getMonth();
  const inRange = (m: number) => {
    if (!isRange) return false;
    const start = rangeStart;
    const end = rangeEnd ?? hoverDate ?? null;
    if (!start || !end) return false;
    const key = year * 12 + m;
    const [lo, hi] = [monthKey(start), monthKey(end)].sort((a, b) => a - b);
    return key >= lo && key <= hi;
  };

  return (
    <div className="au-dp__body">
      <div className="au-dp__nav">
        <button className="au-dp__nav-btn" onClick={() => setViewDate(addYears(viewDate, -1))}>«</button>
        <span className="au-dp__nav-label">{year} 年</span>
        <button className="au-dp__nav-btn" onClick={() => setViewDate(addYears(viewDate, 1))}>»</button>
      </div>
      <div className="au-dp__grid au-dp__grid--month">
        {MONTHS.map((m, i) => {
          const d = new Date(year, i, 1);
          const selected = value && isSameMonth(d, value);
          const rs = rangeStart && isSameMonth(d, rangeStart);
          const re = rangeEnd && isSameMonth(d, rangeEnd);
          return (
            <button
              key={i}
              type="button"
              className={[
                'au-dp__cell au-dp__cell--yqm',
                selected ? 'is-selected' : '',
                rs ? 'is-range-start' : '',
                re ? 'is-range-end' : '',
                inRange(i) ? 'is-in-range' : '',
              ].filter(Boolean).join(' ')}
              onClick={(e) => { e.stopPropagation(); onPick(d); }}
              onMouseEnter={() => props.setHoverDate?.(d)}
            >
              <span>{m}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekGrid(props: PanelBaseProps) {
  const { viewDate, setViewDate, onPick, value, rangeStart, rangeEnd, hoverDate, setHoverDate, isRange } = props;
  const year = viewDate.getFullYear();
  const weeks = weeksInISOYear(year);

  const toNum = (d: Date) => {
    const w = getISOWeek(d);
    return w.year * 60 + w.week;
  };
  const cellKey = (w: number) => year * 60 + w;
  const vKey = value ? toNum(value) : -1;
  const rsKey = rangeStart ? toNum(rangeStart) : -1;
  const reKey = rangeEnd ? toNum(rangeEnd) : -1;
  const hKey = hoverDate ? toNum(hoverDate) : -1;

  const rangeLoHi = (() => {
    if (!isRange || rsKey < 0) return null;
    const other = reKey >= 0 ? reKey : hKey >= 0 ? hKey : -1;
    if (other < 0) return null;
    return [Math.min(rsKey, other), Math.max(rsKey, other)] as const;
  })();

  const cells: React.ReactNode[] = [];
  for (let w = 1; w <= weeks; w++) {
    const key = cellKey(w);
    const monday = firstDayOfISOWeek(year, w);
    const selected = key === vKey;
    const rs = key === rsKey;
    const re = key === reKey;
    const inR = !!rangeLoHi && key >= rangeLoHi[0] && key <= rangeLoHi[1];
    cells.push(
      <button
        key={w}
        type="button"
        className={[
          'au-dp__cell au-dp__cell--week',
          selected ? 'is-selected' : '',
          rs ? 'is-range-start' : '',
          re ? 'is-range-end' : '',
          inR ? 'is-in-range' : '',
        ].filter(Boolean).join(' ')}
        onClick={(e) => { e.stopPropagation(); onPick(monday); }}
        onMouseEnter={() => setHoverDate?.(monday)}
      >
        <span>W{w}</span>
      </button>,
    );
  }

  return (
    <div className="au-dp__body">
      <div className="au-dp__nav">
        <button className="au-dp__nav-btn" onClick={() => setViewDate(addYears(viewDate, -1))}>«</button>
        <span className="au-dp__nav-label">{year} 年</span>
        <button className="au-dp__nav-btn" onClick={() => setViewDate(addYears(viewDate, 1))}>»</button>
      </div>
      <div className="au-dp__grid au-dp__grid--weeks">{cells}</div>
    </div>
  );
}

function QuarterGrid(props: PanelBaseProps) {
  const { viewDate, setViewDate, onPick, value, rangeStart, rangeEnd, hoverDate, isRange } = props;
  const year = viewDate.getFullYear();
  const qKey = (d: Date) => d.getFullYear() * 4 + getQuarter(d) - 1;
  const inRange = (q: number) => {
    if (!isRange) return false;
    const start = rangeStart;
    const end = rangeEnd ?? hoverDate ?? null;
    if (!start || !end) return false;
    const key = year * 4 + q;
    const [lo, hi] = [qKey(start), qKey(end)].sort((a, b) => a - b);
    return key >= lo && key <= hi;
  };

  return (
    <div className="au-dp__body">
      <div className="au-dp__nav">
        <button className="au-dp__nav-btn" onClick={() => setViewDate(addYears(viewDate, -1))}>«</button>
        <span className="au-dp__nav-label">{year} 年</span>
        <button className="au-dp__nav-btn" onClick={() => setViewDate(addYears(viewDate, 1))}>»</button>
      </div>
      <div className="au-dp__grid au-dp__grid--quarter">
        {[0, 1, 2, 3].map((q) => {
          const d = new Date(year, q * 3, 1);
          const selected = value && isSameQuarter(d, value);
          const rs = rangeStart && isSameQuarter(d, rangeStart);
          const re = rangeEnd && isSameQuarter(d, rangeEnd);
          return (
            <button
              key={q}
              type="button"
              className={[
                'au-dp__cell au-dp__cell--yqm',
                selected ? 'is-selected' : '',
                rs ? 'is-range-start' : '',
                re ? 'is-range-end' : '',
                inRange(q) ? 'is-in-range' : '',
              ].filter(Boolean).join(' ')}
              onClick={(e) => { e.stopPropagation(); onPick(d); }}
              onMouseEnter={() => props.setHoverDate?.(d)}
            >
              <span>Q{q + 1}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface TimeColumnProps {
  count: number;
  selected: number;
  onSelect: (v: number) => void;
  label: string;
}
function TimeColumn({ count, selected, onSelect, label }: TimeColumnProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current?.querySelector<HTMLButtonElement>(`[data-v="${selected}"]`);
    if (el) {
      const container = ref.current!;
      container.scrollTo({ top: el.offsetTop - 4, behavior: 'smooth' });
    }
  }, [selected]);
  return (
    <div className="au-dp__time-col" aria-label={label}>
      <div className="au-dp__time-col-inner" ref={ref}>
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            data-v={i}
            className={['au-dp__time-cell', i === selected ? 'is-selected' : ''].filter(Boolean).join(' ')}
            onClick={(e) => { e.stopPropagation(); onSelect(i); }}
          >
            {pad(i)}
          </button>
        ))}
      </div>
    </div>
  );
}

interface TimePanelProps {
  value: Date;
  onChange: (d: Date) => void;
}
function TimePanel({ value, onChange }: TimePanelProps) {
  const h = value.getHours();
  const m = value.getMinutes();
  const s = value.getSeconds();
  const update = (kind: 'h' | 'm' | 's', v: number) => {
    const n = new Date(value.getFullYear(), value.getMonth(), value.getDate(), kind === 'h' ? v : h, kind === 'm' ? v : m, kind === 's' ? v : s);
    onChange(n);
  };
  return (
    <div className="au-dp__time">
      <TimeColumn label="小时" count={24} selected={h} onSelect={(v) => update('h', v)} />
      <TimeColumn label="分钟" count={60} selected={m} onSelect={(v) => update('m', v)} />
      <TimeColumn label="秒" count={60} selected={s} onSelect={(v) => update('s', v)} />
    </div>
  );
}

/* ---------------- main ---------------- */

const ClearIcon = () => (
  <svg viewBox="0 0 1024 1024" width="12" height="12" aria-hidden>
    <path
      fill="currentColor"
      d="M512 64a448 448 0 1 0 0 896 448 448 0 0 0 0-896zm176.56 624.8L512 512l176.56-176.56-32-32L480 480 303.44 303.44l-32 32L448 512 271.44 688.56l32 32L480 544l176.56 176.56z"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 1024 1024" width="14" height="14" aria-hidden>
    <path
      fill="currentColor"
      d="M864 128h-64V64a32 32 0 1 0-64 0v64H288V64a32 32 0 1 0-64 0v64h-64a96 96 0 0 0-96 96v672a96 96 0 0 0 96 96h704a96 96 0 0 0 96-96V224a96 96 0 0 0-96-96zm32 768a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V416h768v480zm0-544H128V224a32 32 0 0 1 32-32h64v64a32 32 0 1 0 64 0v-64h448v64a32 32 0 1 0 64 0v-64h64a32 32 0 0 1 32 32v128z"
    />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 1024 1024" width="14" height="14" aria-hidden>
    <path
      fill="currentColor"
      d="M512 64a448 448 0 1 0 0 896 448 448 0 0 0 0-896zm0 832a384 384 0 1 1 0-768 384 384 0 0 1 0 768zm32-640a32 32 0 0 0-64 0v256c0 10 5 20 13 26l176 128a32 32 0 1 0 38-52L544 490V256z"
    />
  </svg>
);

const DatePicker: React.FC<DatePickerProps> = (props) => {
  const picker: PickerMode = props.picker ?? 'date';
  const showTime = !!props.showTime && picker === 'date';
  const isRange = !!(props as RangeDatePickerProps).range;
  const disabled = !!props.disabled;
  const size = props.size ?? 'medium';
  const allowClear = props.allowClear ?? true;
  const displayFormat = getFormat(picker, showTime, props.format);

  // --- value state ---
  const singleProps = props as SingleDatePickerProps;
  const rangeProps = props as RangeDatePickerProps;

  const [innerSingle, setInnerSingle] = useState<Date | null>(
    () => (singleProps.defaultValue ?? null),
  );
  const [innerRange, setInnerRange] = useState<RangeTuple>(
    () => rangeProps.defaultValue ?? [null, null],
  );

  const single =
    singleProps.value !== undefined ? singleProps.value ?? null : innerSingle;
  const range =
    rangeProps.value !== undefined
      ? rangeProps.value ?? [null, null]
      : innerRange;

  // --- panel open / navigation state ---
  const [open, setOpen] = useState(false);
  const [rangeEditing, setRangeEditing] = useState<'start' | 'end'>('start');
  const [pendingStart, setPendingStart] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  // Internal navigation view for picker='date' — click year/month header to dive in.
  const [navView, setNavView] = useState<'date' | 'month' | 'year'>('date');

  const initialView = isRange
    ? range[0] ?? range[1] ?? new Date()
    : single ?? new Date();
  const [leftView, setLeftView] = useState<Date>(initialView);
  const rightView = useMemo(() => {
    if (picker === 'year') return addYears(leftView, 10);
    if (picker === 'month' || picker === 'quarter' || picker === 'week')
      return addYears(leftView, 1);
    return addMonths(leftView, 1);
  }, [leftView, picker]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  // close on outside click (check both trigger and popup)
  useOutsideClick(
    [wrapRef, popupRef],
    () => {
      setOpen(false);
      setHoverDate(null);
      setPendingStart(null);
      setRangeEditing('start');
    },
    open,
  );

  // position the portal popup just below the trigger, flipping if needed
  useReactivePosition(open, () => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const popupEl = popupRef.current;
    const panelW = popupEl?.offsetWidth ?? 280;
    const panelH = popupEl?.offsetHeight ?? 320;
    let left = r.left;
    if (left + panelW > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - panelW - 8);
    }
    let top = r.bottom + 4;
    if (top + panelH > window.innerHeight - 8 && r.top - panelH - 4 > 8) {
      top = r.top - panelH - 4;
    }
    setPopupPos({ top, left });
  });

  useEffect(() => {
    if (!open) return;
    // re-sync left view when opening
    setLeftView(initialView);
    setNavView('date');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // --- emission ---
  const emitSingle = (next: Date | null) => {
    if (singleProps.value === undefined) setInnerSingle(next);
    singleProps.onChange?.(next, next ? formatDate(next, displayFormat) : '');
  };
  const emitRange = (next: RangeTuple) => {
    if (rangeProps.value === undefined) setInnerRange(next);
    rangeProps.onChange?.(next, [
      next[0] ? formatDate(next[0], displayFormat) : '',
      next[1] ? formatDate(next[1], displayFormat) : '',
    ]);
  };

  // --- selection handler ---
  const handlePick = (d: Date) => {
    // In picker='date' mode, year/month views are transient navigation: clicking a cell
    // there drills back down instead of committing a value.
    if (picker === 'date' && navView === 'year') {
      setLeftView(new Date(d.getFullYear(), leftView.getMonth(), 1));
      setNavView('month');
      return;
    }
    if (picker === 'date' && navView === 'month') {
      setLeftView(new Date(leftView.getFullYear(), d.getMonth(), 1));
      setNavView('date');
      return;
    }
    const picked = normalizePick(d, picker, showTime);
    if (!isRange) {
      const next = showTime && single
        ? new Date(picked.getFullYear(), picked.getMonth(), picked.getDate(), single.getHours(), single.getMinutes(), single.getSeconds())
        : picked;
      emitSingle(next);
      if (!showTime && picker !== 'time') {
        setOpen(false);
      }
      return;
    }
    // range flow
    if (rangeEditing === 'start' || !pendingStart) {
      setPendingStart(picked);
      setRangeEditing('end');
      setHoverDate(null);
      return;
    }
    const a = pendingStart;
    const b = picked;
    const [lo, hi] = cmpDay(a, b) <= 0 ? [a, b] : [b, a];
    let finalLo = lo;
    let finalHi = hi;
    if (picker === 'year') finalHi = new Date(hi.getFullYear(), 0, 1);
    if (picker === 'month') finalHi = new Date(hi.getFullYear(), hi.getMonth(), 1);
    if (picker === 'quarter') finalHi = startOfQuarter(hi);
    if (picker === 'week') {
      finalLo = startOfWeek(lo);
      finalHi = startOfWeek(hi);
    }
    emitRange([finalLo, finalHi]);
    setPendingStart(null);
    setRangeEditing('start');
    setHoverDate(null);
    if (!showTime && picker !== 'time') setOpen(false);
  };

  // --- display ---
  const text = isRange
    ? ([
        range[0] ? formatDate(range[0], displayFormat) : '',
        range[1] ? formatDate(range[1], displayFormat) : '',
      ] as [string, string])
    : single
      ? formatDate(single, displayFormat)
      : '';

  const placeholder = props.placeholder;
  const phSingle = (placeholder as string) || defaultPlaceholder(picker, showTime);
  const phRange =
    (placeholder as [string, string]) || ['开始' + defaultPlaceholder(picker, showTime), '结束' + defaultPlaceholder(picker, showTime)];

  const wrapperClasses = [
    'au-dp',
    `au-dp--${size}`,
    isRange ? 'au-dp--range' : '',
    disabled ? 'is-disabled' : '',
    open ? 'is-open' : '',
    props.className ?? '',
  ].filter(Boolean).join(' ');

  const Icon = picker === 'time' ? ClockIcon : CalendarIcon;

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRange) emitRange([null, null]);
    else emitSingle(null);
    setPendingStart(null);
    setRangeEditing('start');
  };

  const renderPanel = (view: Date, setView: (d: Date) => void, isLeftPanel: boolean) => {
    const shared: PanelBaseProps = {
      viewDate: view,
      setViewDate: setView,
      onPick: handlePick,
      picker,
      value: isRange ? undefined : single,
      rangeStart: isRange ? pendingStart ?? range[0] : undefined,
      rangeEnd: isRange ? (pendingStart ? null : range[1]) : undefined,
      hoverDate,
      setHoverDate,
      isRange,
    };
    if (picker === 'year') return <YearGrid {...shared} />;
    if (picker === 'month') return <MonthGrid {...shared} />;
    if (picker === 'quarter') return <QuarterGrid {...shared} />;
    if (picker === 'week') return <WeekGrid {...shared} />;
    // picker === 'date'
    if (navView === 'year') return <YearGrid {...shared} />;
    if (navView === 'month') return <MonthGrid {...shared} />;
    return (
      <DateGrid
        {...shared}
        onYearLabelClick={isLeftPanel && !isRange ? () => setNavView('year') : undefined}
        onMonthLabelClick={isLeftPanel && !isRange ? () => setNavView('month') : undefined}
      />
    );
  };

  const fallbackTime = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  };

  return (
    <div
      ref={wrapRef}
      className={wrapperClasses}
      style={props.style}
    >
      <div
        className="au-dp__input"
        onClick={() => !disabled && setOpen(true)}
      >
        <Icon />
        {!isRange ? (
          <input
            className="au-dp__field"
            placeholder={phSingle}
            value={text as string}
            readOnly
            disabled={disabled}
          />
        ) : (
          <>
            <input
              className={['au-dp__field', rangeEditing === 'start' && open ? 'is-active' : ''].filter(Boolean).join(' ')}
              placeholder={phRange[0]}
              value={(text as [string, string])[0]}
              readOnly
              disabled={disabled}
              onFocus={() => { setRangeEditing('start'); setOpen(true); }}
            />
            <span className="au-dp__sep">~</span>
            <input
              className={['au-dp__field', rangeEditing === 'end' && open ? 'is-active' : ''].filter(Boolean).join(' ')}
              placeholder={phRange[1]}
              value={(text as [string, string])[1]}
              readOnly
              disabled={disabled}
              onFocus={() => { setRangeEditing('end'); setOpen(true); }}
            />
          </>
        )}
        {allowClear && !disabled && ((isRange && (range[0] || range[1])) || (!isRange && single)) && (
          <button
            type="button"
            className="au-dp__clear"
            onClick={clearAll}
            aria-label="清除"
          >
            <ClearIcon />
          </button>
        )}
      </div>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={popupRef}
          className="au-dp__popup"
          style={{ position: 'fixed', top: popupPos.top, left: popupPos.left }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {picker === 'time' ? (
            isRange ? (
              <div className="au-dp__panels">
                <div className="au-dp__panel">
                  <div className="au-dp__side-label">开始时间</div>
                  <TimePanel
                    value={range[0] ?? new Date(0, 0, 0, 0, 0, 0)}
                    onChange={(d) => emitRange([d, range[1]])}
                  />
                </div>
                <div className="au-dp__panel">
                  <div className="au-dp__side-label">结束时间</div>
                  <TimePanel
                    value={range[1] ?? new Date(0, 0, 0, 23, 59, 59)}
                    onChange={(d) => emitRange([range[0], d])}
                  />
                </div>
              </div>
            ) : (
              <div className="au-dp__panels">
                <div className="au-dp__panel">
                  <TimePanel
                    value={single ?? new Date(0, 0, 0, 0, 0, 0)}
                    onChange={(d) => emitSingle(d)}
                  />
                </div>
              </div>
            )
          ) : isRange ? (
            <div className="au-dp__panels">
              <div className="au-dp__panel">
                {renderPanel(leftView, setLeftView, true)}
                {showTime && (
                  <TimePanel
                    value={range[0] ?? fallbackTime()}
                    onChange={(d) => emitRange([d, range[1]])}
                  />
                )}
              </div>
              <div className="au-dp__panel">
                {renderPanel(
                  rightView,
                  (d) => {
                    if (picker === 'year') setLeftView(addYears(d, -10));
                    else if (picker === 'month' || picker === 'quarter' || picker === 'week')
                      setLeftView(addYears(d, -1));
                    else setLeftView(addMonths(d, -1));
                  },
                  false,
                )}
                {showTime && (
                  <TimePanel
                    value={range[1] ?? fallbackTime()}
                    onChange={(d) => emitRange([range[0], d])}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="au-dp__panels">
              <div className="au-dp__panel">
                {renderPanel(leftView, setLeftView, true)}
                {showTime && (
                  <TimePanel
                    value={single ?? fallbackTime()}
                    onChange={(d) => emitSingle(d)}
                  />
                )}
              </div>
            </div>
          )}
          {picker !== 'time' && !showTime && !isRange && navView === 'date' && picker === 'date' && (
            <div className="au-dp__footer">
              <button
                type="button"
                className="au-dp__today-link"
                onClick={() => handlePick(new Date())}
              >
                今天
              </button>
            </div>
          )}
          {showTime && (
            <div className="au-dp__time-footer">
              <div className="au-dp__footer-actions">
                <button
                  type="button"
                  className="au-dp__ok"
                  onClick={() => setOpen(false)}
                >
                  确定
                </button>
              </div>
            </div>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
};

export default DatePicker;

/* suppress unused helper warnings */
void endOfMonth;
void endOfQuarter;
void endOfWeek;
void isSameYear;
