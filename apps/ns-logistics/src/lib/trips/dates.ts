/** Format a Date for `<input type="datetime-local">` in local time. */
export function toDatetimeLocalValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
}

/** Parse a datetime-local string as local time (not UTC). */
export function parseDatetimeLocalValue(value: string): Date {
  // `YYYY-MM-DDTHH:mm` — construct locally so timezone skew doesn't reject valid picks
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return new Date(Number.NaN);
  const [, ys, ms, ds, hs, mins] = match;
  return new Date(
    Number(ys),
    Number(ms) - 1,
    Number(ds),
    Number(hs),
    Number(mins),
    0,
    0,
  );
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatTimeRange(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const opts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  };
  return `${start.toLocaleTimeString("en-US", opts)} – ${end.toLocaleTimeString("en-US", opts)}`;
}

export function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

const TIME_WINDOW_WORDS = ["morning", "afternoon", "evening", "night"] as const;

/** Compact time for board prefix — flexible trips use a window word, not the last token. */
export function formatTripTimePrefix(trip: {
  startsAt: string;
  timePrecision: "exact" | "flexible";
  timeLabel: string;
}): string {
  if (trip.timePrecision === "flexible") {
    const lower = trip.timeLabel.trim().toLowerCase();
    if (lower) {
      const hit = TIME_WINDOW_WORDS.map((word) => ({
        word,
        index: lower.indexOf(word),
      }))
        .filter((item) => item.index >= 0)
        .sort((a, b) => a.index - b.index)[0];
      if (hit) {
        return hit.word.charAt(0).toUpperCase() + hit.word.slice(1);
      }
    }
    return "Flex";
  }
  return formatClock(trip.startsAt);
}

/** Next N calendar days for filter chips, labeled Today (Sunday), etc. */
export function upcomingDayChips(
  count = 3,
  now = new Date(),
): { key: string; label: string }[] {
  const chips: { key: string; label: string }[] = [];
  for (let i = 0; i < count; i += 1) {
    const d = addDays(startOfDay(now), i);
    const key = toDateKey(d);
    const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
    if (i === 0) chips.push({ key, label: `Today (${weekday})` });
    else if (i === 1) chips.push({ key, label: `Tomorrow (${weekday})` });
    else {
      chips.push({
        key,
        label: d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
      });
    }
  }
  return chips;
}

/** Display when for ride posts — prefers human label for flexible times. */
export function formatTripWhen(trip: {
  startsAt: string;
  endsAt: string;
  timePrecision: "exact" | "flexible";
  timeLabel: string;
}): string {
  if (trip.timeLabel.trim()) return trip.timeLabel.trim();
  if (trip.timePrecision === "flexible") {
    return formatTimeRange(trip.startsAt, trip.endsAt);
  }
  return formatClock(trip.startsAt);
}

export function formatDayLabel(date: Date, now = new Date()): string {
  const today = startOfDay(now);
  const target = startOfDay(date);
  const diff = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });

  if (diff === 0) return `Today · ${weekday}`;
  if (diff === 1) return `Tomorrow · ${weekday}`;
  if (diff === -1) return `Yesterday · ${weekday}`;
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function monthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long" });
}
