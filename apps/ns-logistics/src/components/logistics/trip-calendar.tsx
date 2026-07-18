"use client";

import { monthLabel, toDateKey } from "@/lib/trips/dates";
import type { TimeMode } from "@/lib/trips/types";

type TripCalendarProps = {
  month: Date;
  onMonthChange: (next: Date) => void;
  selectedDate: string | null;
  onSelectDate: (dateKey: string | null) => void;
  datesWithTrips: Set<string>;
  timeMode: TimeMode;
  onTimeModeChange: (mode: TimeMode) => void;
  eventsTodayCount: number;
};

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function TripCalendar({
  month,
  onMonthChange,
  selectedDate,
  onSelectDate,
  datesWithTrips,
  timeMode,
  onTimeModeChange,
  eventsTodayCount,
}: TripCalendarProps) {
  const todayKey = toDateKey(new Date());
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const first = new Date(year, monthIndex, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (Date | null)[] = [];

  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push(new Date(year, monthIndex, d));
  }

  return (
    <aside className="relative w-full overflow-hidden rounded-2xl border border-[var(--iron-200)] bg-white p-5 shadow-sm xl:w-[420px] xl:p-6">
      <div className="absolute right-5 top-0 h-12 w-9 rounded-b-2xl bg-[var(--iron-100)]" />

      <div className="flex flex-col items-start gap-4">
        <div className="rounded-full border border-[var(--iron-200)] bg-[var(--iron-50)] px-4 py-2 text-sm font-semibold text-[var(--ns-ink)]">
          {monthLabel(month)}
        </div>

        <div className="flex items-end gap-2">
          <p className="text-3xl font-semibold tracking-tight text-[var(--ns-ink)]">
            {eventsTodayCount}
          </p>
          <p className="mb-1 text-sm text-[var(--iron-500)]">
            trip{eventsTodayCount === 1 ? "" : "s"} today
          </p>
        </div>

        <div className="w-full">
          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-[var(--iron-500)]">
            {WEEKDAYS.map((d, i) => (
              <div key={`${d}-${i}`} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, idx) => {
              if (!date) {
                return <div key={`empty-${idx}`} className="aspect-square p-1" />;
              }
              const key = toDateKey(date);
              const hasTrips = datesWithTrips.has(key);
              const isSelected = selectedDate === key;
              const isToday = key === todayKey;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelectDate(isSelected ? null : key)}
                  className={[
                    "aspect-square w-full rounded-full text-sm transition",
                    isSelected
                      ? "bg-[var(--accent)] font-semibold text-white"
                      : hasTrips
                        ? "bg-[var(--accent-soft)] font-semibold text-[var(--accent-hover)] hover:bg-[var(--accent-soft-border)]"
                        : isToday
                          ? "ring-2 ring-[var(--accent)] ring-inset text-[var(--ns-ink)]"
                          : "text-[var(--ns-ink)] hover:bg-[var(--iron-100)]",
                  ].join(" ")}
                  aria-pressed={isSelected}
                  aria-label={`Filter by ${key}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto flex w-full items-center gap-3">
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--iron-200)] text-[var(--ns-ink)] hover:bg-[var(--iron-50)]"
            onClick={() => onMonthChange(new Date(year, monthIndex - 1, 1))}
            aria-label="Previous month"
          >
            ‹
          </button>

          <div className="flex flex-1 overflow-hidden rounded-full border border-[var(--iron-200)] bg-[var(--iron-100)] p-1">
            <button
              type="button"
              onClick={() => onTimeModeChange("upcoming")}
              className={[
                "flex-1 rounded-full px-3 py-1.5 text-sm font-semibold transition",
                timeMode === "upcoming"
                  ? "bg-white text-[var(--ns-ink)] shadow-sm"
                  : "text-[var(--iron-500)] hover:text-[var(--ns-ink)]",
              ].join(" ")}
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={() => onTimeModeChange("past")}
              className={[
                "flex-1 rounded-full px-3 py-1.5 text-sm font-semibold transition",
                timeMode === "past"
                  ? "bg-white text-[var(--ns-ink)] shadow-sm"
                  : "text-[var(--iron-500)] hover:text-[var(--ns-ink)]",
              ].join(" ")}
            >
              Past
            </button>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--iron-200)] text-[var(--ns-ink)] hover:bg-[var(--iron-50)]"
            onClick={() => onMonthChange(new Date(year, monthIndex + 1, 1))}
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        {selectedDate ? (
          <button
            type="button"
            onClick={() => onSelectDate(null)}
            className="w-full text-center text-xs font-medium text-[var(--accent)] hover:underline"
          >
            Clear date filter ({selectedDate})
          </button>
        ) : (
          <p className="w-full text-center text-xs text-[var(--iron-400)]">
            Click a date to filter the list
          </p>
        )}
      </div>
    </aside>
  );
}
