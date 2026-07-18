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
    <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Logistics: {monthLabel(month)}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
            <span aria-hidden="true">🎉</span>
            {eventsTodayCount} trip{eventsTodayCount === 1 ? "" : "s"} today
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500">
        {WEEKDAYS.map((d, i) => (
          <div key={`${d}-${i}`} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="h-9" />;
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
                "relative flex h-9 items-center justify-center rounded-full text-sm transition",
                isSelected
                  ? "bg-[#7C3AED] font-semibold text-white"
                  : hasTrips
                    ? "bg-[#EDE9FE] font-semibold text-[#5B21B6] hover:bg-[#DDD6FE]"
                    : isToday
                      ? "ring-2 ring-[#7C3AED] ring-inset text-gray-900"
                      : "text-gray-700 hover:bg-gray-100",
              ].join(" ")}
              aria-pressed={isSelected}
              aria-label={`Filter by ${key}`}
            >
              {date.getDate()}
              {hasTrips && !isSelected ? (
                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[#7C3AED]" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50"
          onClick={() => onMonthChange(new Date(year, monthIndex - 1, 1))}
          aria-label="Previous month"
        >
          ‹
        </button>

        <div className="flex flex-1 items-center rounded-full bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => onTimeModeChange("upcoming")}
            className={[
              "flex-1 rounded-full px-3 py-1.5 text-sm font-semibold transition",
              timeMode === "upcoming"
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:text-gray-900",
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
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:text-gray-900",
            ].join(" ")}
          >
            Past
          </button>
        </div>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50"
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
          className="mt-3 w-full text-center text-xs font-medium text-[#7C3AED] hover:underline"
        >
          Clear date filter ({selectedDate})
        </button>
      ) : (
        <p className="mt-3 text-center text-xs text-gray-400">
          Click a date to filter the list
        </p>
      )}
    </aside>
  );
}
