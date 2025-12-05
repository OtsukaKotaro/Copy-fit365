"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSheetControls } from "@/components/AppShell";

type TimelineDay = { key: string; date: Date; label: string; monthKey: string; isToday: boolean; displayDay: number };
type TimelineMonth = { key: string; label: string; year: number; days: number; startIndex: number; weekStartIndex: number; order: number };
type TimelineWeek = { key: string; startIndex: number; days: number; label: string };

const DAY_WIDTH = 68;
const WEEK_WIDTH = 110;
const MONTH_WIDTH = 90;
const TRACK_PADDING = 48;

export default function TrainingPage() {
  const { openSheet } = useSheetControls();
  const dayScrollRef = useRef<HTMLDivElement>(null);
  const monthScrollRef = useRef<HTMLDivElement>(null);
  const [activeMonthLabel, setActiveMonthLabel] = useState<string>("");
  const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");

  const { days, months, weeks, todayIndex, totalDays } = useMemo(() => buildTimeline(), []);
  const trackWidth =
    viewMode === "day"
      ? totalDays * DAY_WIDTH + TRACK_PADDING
      : viewMode === "week"
        ? weeks.length * WEEK_WIDTH + TRACK_PADDING
        : months.length * MONTH_WIDTH + TRACK_PADDING;

  const syncMonthState = useCallback(
    (scrollLeft: number) => {
      const pos = scrollLeft + TRACK_PADDING;
      if (viewMode === "week" && weeks.length > 0) {
        const idx = Math.min(weeks.length - 1, Math.max(0, Math.floor(pos / WEEK_WIDTH)));
        const week = weeks[idx];
        const monthKey = days[week.startIndex]?.monthKey;
        const month = months.find((m) => m.key === monthKey);
        if (month) setActiveMonthLabel(month.label);
        if (month) setActiveYear(month.year);
        return;
      }
      if (viewMode === "month") {
        const idx = Math.min(months.length - 1, Math.max(0, Math.floor(pos / MONTH_WIDTH)));
        const month = months[idx];
        if (month) {
          setActiveYear(month.year);
          setActiveMonthLabel(month.label);
        }
        return;
      }

      // day mode
      const current = months.find((m) => pos < (m.startIndex + m.days) * DAY_WIDTH + TRACK_PADDING);
      if (current) {
        setActiveMonthLabel(current.label);
        setActiveYear(current.year);
      }
    },
    [months, days, weeks, viewMode],
  );

  const handleScrollSync = () => {
    const scroller = dayScrollRef.current;
    if (!scroller) return;
    const scrollLeft = scroller.scrollLeft;
    if (monthScrollRef.current) {
      monthScrollRef.current.scrollLeft = scrollLeft;
    }
    syncMonthState(scrollLeft);
  };

  useEffect(() => {
    const scroller = dayScrollRef.current;
    if (!scroller) return;
    const containerWidth = scroller.clientWidth || 0;
    const target = Math.max(0, (todayIndex + 1) * DAY_WIDTH - containerWidth);
    scroller.scrollTo({ left: target, behavior: "auto" });
    syncMonthState(target);
    if (monthScrollRef.current) {
      monthScrollRef.current.scrollLeft = target;
    }
  }, [todayIndex, syncMonthState]);

  useEffect(() => {
    if (months.length > 0) {
      setActiveMonthLabel(months[0].label);
      setActiveYear(months[0].year);
    }
  }, [months]);

  return (
    <div className="mx-auto max-w-5xl px-0 pb-16 pt-0 -mt-2">
      <div className="relative">
        <div className="absolute right-0 top-0 z-20 flex h-6 items-center overflow-hidden border border-slate-200 bg-white text-xs font-semibold text-[#3b2f32]">
          {(["day", "week", "month"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-[2px] transition ${viewMode === mode ? "bg-[#f06488] text-white" : "hover:bg-slate-50"}`}
            >
              {mode === "day" ? "D" : mode === "week" ? "W" : "M"}
            </button>
          ))}
        </div>

        <div
          ref={monthScrollRef}
          className="relative overflow-x-auto overflow-y-hidden no-scrollbar border-b border-slate-200 bg-white pointer-events-none select-none"
        >
          <div className="relative flex items-center px-0 py-2 min-h-[40px]" style={{ width: trackWidth }}>
            {viewMode === "month" ? (
              <div className="pointer-events-none absolute inset-0">
                {months
                  .filter((m) => m.label === "01")
                  .map((m) => (
                    <div
                      key={m.key}
                      className="absolute top-1/2 -translate-y-1/2 text-sm font-semibold text-[#3b2f32]"
                      style={{ left: TRACK_PADDING + m.order * MONTH_WIDTH }}
                    >
                      {m.year}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="pointer-events-none absolute inset-0">
                {months.map((month) => (
                  <div
                    key={month.key}
                    className="absolute top-1/2 -translate-y-1/2 text-sm font-semibold text-[#3b2f32]"
                    style={{
                      left:
                        viewMode === "day"
                          ? TRACK_PADDING + month.startIndex * DAY_WIDTH
                          : TRACK_PADDING + month.weekStartIndex * WEEK_WIDTH,
                    }}
                  >
                    {month.label}
                  </div>
                ))}
              </div>
            )}
            <div className="pointer-events-none sticky left-0 top-0 flex h-full items-center px-3 text-sm font-semibold text-[#3b2f32]">
              {viewMode === "month" ? activeYear : activeMonthLabel}
            </div>
          </div>
        </div>
      </div>

      <div
        ref={dayScrollRef}
        className="overflow-x-auto overflow-y-hidden no-scrollbar border-b border-slate-200 bg-white"
        onScroll={handleScrollSync}
      >
        <div className="flex pl-[48px]" style={{ width: trackWidth }}>
          {viewMode === "day"
            ? days.map((day) => (
                <button
                  key={day.key}
                  className="relative flex h-12 items-center justify-center text-sm text-slate-700 transition hover:bg-slate-50"
                  style={{ minWidth: DAY_WIDTH, maxWidth: DAY_WIDTH, flexBasis: DAY_WIDTH }}
                  onClick={() => openSheet("recordTraining", { closable: true })}
                >
                  <span className="text-base font-semibold">{day.displayDay}</span>
                </button>
              ))
            : viewMode === "week"
              ? weeks.map((week) => (
                  <button
                    key={week.key}
                    className="relative flex h-12 items-center justify-center text-sm text-slate-700 transition hover:bg-slate-50"
                    style={{ minWidth: WEEK_WIDTH, maxWidth: WEEK_WIDTH, flexBasis: WEEK_WIDTH }}
                    onClick={() => openSheet("recordTraining", { closable: true })}
                  >
                    <span className="text-base font-semibold">{week.label}</span>
                  </button>
                ))
              : months.map((month) => (
                  <button
                    key={month.key}
                    className="relative flex h-12 items-center justify-center text-sm text-slate-700 transition hover:bg-slate-50"
                    style={{ minWidth: MONTH_WIDTH, maxWidth: MONTH_WIDTH, flexBasis: MONTH_WIDTH }}
                    onClick={() => openSheet("recordTraining", { closable: true })}
                  >
                    <span className="text-base font-semibold">{month.label}</span>
                  </button>
                ))}
        </div>
      </div>
    </div>
  );
}

function buildTimeline(): { days: TimelineDay[]; months: TimelineMonth[]; weeks: TimelineWeek[]; todayIndex: number; totalDays: number } {
  const today = new Date();
  const start = new Date(2023, 7, 1); // 2023/08/01 固定で遡れる最小
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const days: TimelineDay[] = [];
  const months: TimelineMonth[] = [];
  const weeks: TimelineWeek[] = [];
  let cursor = new Date(start);
  let todayIndex = 0;

  while (cursor <= end) {
    const key = formatDateKey(cursor);
    const label = WEEK_LABELS[cursor.getDay()];
    const monthKey = `${cursor.getFullYear()}-${cursor.getMonth() + 1}`;
    const isToday = isSameDate(cursor, today);
    const dayObj: TimelineDay = { key, date: new Date(cursor), label, monthKey, isToday, displayDay: cursor.getDate() };
    if (isToday) todayIndex = days.length;
    days.push(dayObj);
    cursor = addDays(cursor, 1);
  }

  let index = 0;
  while (index < days.length) {
    const monthKey = days[index].monthKey;
    const monthLabel = formatMonthLabel(days[index].date);
    const startIndex = index;
    while (index < days.length && days[index].monthKey === monthKey) {
      index++;
    }
    const count = index - startIndex;
    months.push({ key: monthKey, label: monthLabel, year: days[startIndex].date.getFullYear(), days: count, startIndex, weekStartIndex: 0, order: months.length });
  }

  // weeks (Mon-Sun)
  let wIndex = 0;
  while (wIndex < days.length) {
    const startDate = new Date(days[wIndex].date);
    const startDow = startDate.getDay();
    const offset = startDow === 0 ? 6 : startDow - 1; // Monday start
    const weekStart = Math.max(0, wIndex - offset);
    const weekEnd = Math.min(weekStart + 6, days.length - 1);
    const startDay = days[weekStart];
    const endDay = days[weekEnd];
    const label = `${String(startDay.date.getDate()).padStart(2, "0")}-${String(endDay.date.getDate()).padStart(2, "0")}`;
    weeks.push({ key: `${weekStart}-${weekEnd}`, startIndex: weekStart, days: weekEnd - weekStart + 1, label });
    wIndex = weekEnd + 1;
  }

  // assign weekStartIndex for months
  months.forEach((m) => {
    const weekIdx = weeks.findIndex((w) => days[w.startIndex]?.monthKey === m.key);
    m.weekStartIndex = weekIdx >= 0 ? weekIdx : 0;
  });

  return { days, months, weeks, todayIndex, totalDays: days.length };
}

function addDays(date: Date, delta: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + delta);
  return d;
}

function isSameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatMonthLabel(date: Date) {
  return `${String(date.getMonth() + 1).padStart(2, "0")}`;
}

const WEEK_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
