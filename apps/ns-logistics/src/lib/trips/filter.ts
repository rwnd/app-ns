import {
  MAX_PLAN_DAYS,
  PAST_VISIBLE_DAYS,
  tripCorridor,
} from "@/lib/trips/constants";
import {
  addDays,
  endOfDay,
  parseDateKey,
  startOfDay,
  toDateKey,
} from "@/lib/trips/dates";
import type { Trip, TripFilters, TripStats } from "@/lib/trips/types";

export function tripEffectiveEnd(trip: Trip): Date {
  return new Date(trip.endsAt);
}

export function isTripExpired(trip: Trip, now = new Date()): boolean {
  if (trip.status === "cancelled") {
    return new Date(trip.startsAt).getTime() < now.getTime();
  }
  return tripEffectiveEnd(trip).getTime() < now.getTime();
}

export function isTripInNext24h(trip: Trip, now = new Date()): boolean {
  if (trip.status === "cancelled") return false;
  const start = new Date(trip.startsAt).getTime();
  const end = tripEffectiveEnd(trip).getTime();
  const nowMs = now.getTime();
  const in24h = nowMs + 24 * 60 * 60 * 1000;
  return end >= nowMs && start <= in24h;
}

export function isWithinPastUiWindow(trip: Trip, now = new Date()): boolean {
  const end = tripEffectiveEnd(trip);
  const cutoff = addDays(startOfDay(now), -PAST_VISIBLE_DAYS);
  return end.getTime() < now.getTime() && end.getTime() >= cutoff.getTime();
}

export function isWithinPlanWindow(startsAt: Date, now = new Date()): boolean {
  if (Number.isNaN(startsAt.getTime())) return false;
  const nowFloor = new Date(now);
  nowFloor.setSeconds(0, 0);
  const max = endOfDay(addDays(now, MAX_PLAN_DAYS));
  return (
    startsAt.getTime() >= nowFloor.getTime() &&
    startsAt.getTime() <= max.getTime()
  );
}

export function seatsLeft(trip: Trip): number | null {
  if (trip.capacity === null) return null;
  return Math.max(trip.capacity - trip.riders.length, 0);
}

export function isJoinable(trip: Trip, now = new Date()): boolean {
  if (isTripExpired(trip, now)) return false;
  if (trip.status === "cancelled" || trip.status === "full") return false;
  const left = seatsLeft(trip);
  if (left !== null && left <= 0) return false;
  return true;
}

export function computeStats(trips: Trip[], now = new Date()): TripStats {
  let upcoming = 0;
  let inProgressNext24h = 0;
  let open = 0;

  for (const trip of trips) {
    if (isTripExpired(trip, now)) continue;
    if (trip.status === "cancelled") continue;
    upcoming += 1;
    if (trip.status === "open") open += 1;
    if (isTripInNext24h(trip, now)) inProgressNext24h += 1;
  }

  return {
    upcoming,
    inProgressNext24h,
    open,
    plannedTotal: trips.length,
  };
}

function matchesQuery(trip: Trip, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  const start = new Date(trip.startsAt);
  const haystack = [
    trip.source,
    trip.destination,
    `${trip.source} ${trip.destination}`,
    trip.meetingPoint,
    trip.notes,
    trip.timeLabel,
    trip.transport.join(" "),
    trip.transport.includes("car") && trip.transport.includes("bus")
      ? "either flexible"
      : "",
    trip.status,
    trip.host.name,
    ...trip.riders.map((g) => g.name),
    start.toLocaleDateString("en-US"),
    start.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    formatLooseDate(start),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

function formatLooseDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${toDateKey(date)}`;
}

export function filterTrips(
  trips: Trip[],
  filters: TripFilters,
  currentUserId: string | null,
  now = new Date(),
): Trip[] {
  const selected =
    filters.selectedDate !== null ? parseDateKey(filters.selectedDate) : null;

  const filtered = trips.filter((trip) => {
    const expired = isTripExpired(trip, now);

    if (filters.timeMode === "upcoming" && expired) return false;
    if (filters.timeMode === "past") {
      if (!expired) return false;
      if (!isWithinPastUiWindow(trip, now)) return false;
    }

    if (filters.timeMode === "upcoming") {
      const start = new Date(trip.startsAt);
      const max = endOfDay(addDays(now, MAX_PLAN_DAYS));
      if (start.getTime() > max.getTime()) return false;
    }

    if (!matchesQuery(trip, filters.query)) return false;

    if (filters.corridor !== "all") {
      if (tripCorridor(trip.source, trip.destination) !== filters.corridor) {
        return false;
      }
    }

    if (selected) {
      if (
        startOfDay(new Date(trip.startsAt)).getTime() !==
        startOfDay(selected).getTime()
      ) {
        return false;
      }
    }

    if (filters.myTripsOnly && currentUserId) {
      const mine =
        trip.host.id === currentUserId ||
        trip.riders.some((g) => g.id === currentUserId);
      if (!mine) return false;
    }

    return true;
  });

  return filtered.sort((a, b) => {
    const aTime = new Date(a.startsAt).getTime();
    const bTime = new Date(b.startsAt).getTime();
    return filters.timeMode === "past" ? bTime - aTime : aTime - bTime;
  });
}

export function datesWithTrips(
  trips: Trip[],
  timeMode: TripFilters["timeMode"],
  now = new Date(),
): Set<string> {
  const keys = new Set<string>();
  for (const trip of trips) {
    const expired = isTripExpired(trip, now);
    if (timeMode === "upcoming" && expired) continue;
    if (timeMode === "past") {
      if (!expired || !isWithinPastUiWindow(trip, now)) continue;
    }
    keys.add(toDateKey(new Date(trip.startsAt)));
  }
  return keys;
}

export function groupTripsByDay(
  trips: Trip[],
): { key: string; trips: Trip[] }[] {
  const map = new Map<string, Trip[]>();
  for (const trip of trips) {
    const key = toDateKey(new Date(trip.startsAt));
    const list = map.get(key) ?? [];
    list.push(trip);
    map.set(key, list);
  }
  return Array.from(map.entries()).map(([key, dayTrips]) => ({
    key,
    trips: dayTrips,
  }));
}
