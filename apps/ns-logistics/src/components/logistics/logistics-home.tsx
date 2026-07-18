"use client";

import { useMemo, useState } from "react";
import { CreateTripModal } from "@/components/logistics/create-trip-modal";
import { TripCalendar } from "@/components/logistics/trip-calendar";
import { TripCard } from "@/components/logistics/trip-card";
import { LOCATIONS, PAST_VISIBLE_DAYS } from "@/lib/trips/constants";
import {
  formatDayLabel,
  parseDateKey,
  toDateKey,
} from "@/lib/trips/dates";
import {
  computeStats,
  datesWithTrips,
  filterTrips,
  groupTripsByDay,
} from "@/lib/trips/filter";
import { createMockTrips } from "@/lib/trips/mock-data";
import type {
  QuickRange,
  Trip,
  TripFilters,
  TripLocation,
  TripPerson,
} from "@/lib/trips/types";

type LogisticsHomeProps = {
  user: {
    id: string;
    name?: string | null;
    image?: string | null;
  };
};

const defaultFilters: TripFilters = {
  query: "",
  quickRange: "all",
  source: "all",
  destination: "all",
  selectedDate: null,
  timeMode: "upcoming",
  myTripsOnly: false,
};

export function LogisticsHome({ user }: LogisticsHomeProps) {
  const [trips, setTrips] = useState<Trip[]>(() => createMockTrips());
  const [filters, setFilters] = useState<TripFilters>(defaultFilters);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const now = useMemo(() => new Date(), []);
  const stats = useMemo(() => computeStats(trips, now), [trips, now]);
  const visibleTrips = useMemo(
    () => filterTrips(trips, filters, user.id, now),
    [trips, filters, user.id, now],
  );
  const grouped = useMemo(() => groupTripsByDay(visibleTrips), [visibleTrips]);
  const calendarDates = useMemo(
    () => datesWithTrips(trips, filters.timeMode, now),
    [trips, filters.timeMode, now],
  );
  const eventsTodayCount = useMemo(() => {
    const key = toDateKey(now);
    return trips.filter((t) => toDateKey(new Date(t.startsAt)) === key).length;
  }, [trips, now]);

  const host: TripPerson = {
    id: user.id,
    name: user.name ?? "You",
    image: user.image,
  };

  function updateFilters(patch: Partial<TripFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  function toggleJoin(tripId: string) {
    setTrips((prev) =>
      prev.map((trip) => {
        if (trip.id !== tripId) return trip;
        if (trip.host.id === user.id) return trip;
        const joined = trip.guests.some((g) => g.id === user.id);
        if (joined) {
          return {
            ...trip,
            guests: trip.guests.filter((g) => g.id !== user.id),
          };
        }
        if (trip.guests.length >= trip.capacity) return trip;
        return { ...trip, guests: [...trip.guests, host] };
      }),
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F5] text-gray-900">
      <div className="mx-auto w-full max-w-[1440px] px-3 pb-16 pt-4 md:px-6 md:pt-6">
        {/* Summary — scrolls away */}
        <section className="mb-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                Logistics
              </h1>
              <p className="mt-1 text-sm text-gray-600 md:text-base">
                Coordinate rides to and from Network School.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 md:max-w-xl">
            <Stat label="Upcoming" value={stats.upcoming} />
            <Stat label="Next 24h" value={stats.inProgressNext24h} />
            <Stat label="Expired" value={stats.expired} hint="all-time" />
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Past list shows the last {PAST_VISIBLE_DAYS} days · {stats.plannedTotal}{" "}
            trips planned overall
          </p>
        </section>

        {/* Filters stick under the top bar after summary scrolls away */}
        <div className="sticky top-[56px] z-40 -mx-3 mb-3 space-y-3 bg-[#F4F4F5]/95 px-3 py-2 backdrop-blur md:-mx-0 md:px-0">
          <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm md:flex-row md:items-center md:p-4">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </span>
              <input
                value={filters.query}
                onChange={(e) => updateFilters({ query: e.target.value })}
                placeholder="Search trips, places, dates..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none ring-[#7C3AED]/30 focus:bg-white focus:ring-2"
              />
            </div>

            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              <FilterIcon />
              Filter
            </button>

            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700"
            >
              + Create Trip
            </button>
          </div>

          {filtersOpen ? (
            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-gray-700">Source</span>
                <select
                  value={filters.source}
                  onChange={(e) =>
                    updateFilters({
                      source: e.target.value as TripLocation | "all",
                    })
                  }
                  className="field-input"
                >
                  <option value="all">All sources</option>
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-gray-700">
                  Destination
                </span>
                <select
                  value={filters.destination}
                  onChange={(e) =>
                    updateFilters({
                      destination: e.target.value as TripLocation | "all",
                    })
                  }
                  className="field-input"
                >
                  <option value="all">All destinations</option>
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </label>
              <div className="sm:col-span-2">
                <p className="mb-1 text-sm font-medium text-gray-700">Quick range</p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["all", "All"],
                      ["today", "Today"],
                      ["tomorrow", "Tomorrow"],
                    ] as const
                  ).map(([value, label]) => (
                    <Chip
                      key={value}
                      active={filters.quickRange === value}
                      onClick={() =>
                        updateFilters({ quickRange: value as QuickRange })
                      }
                    >
                      {label}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", "All"],
                  ["today", "Today"],
                  ["tomorrow", "Tomorrow"],
                ] as const
              ).map(([value, label]) => (
                <Chip
                  key={value}
                  active={filters.quickRange === value}
                  onClick={() =>
                    updateFilters({ quickRange: value as QuickRange })
                  }
                >
                  {label}
                </Chip>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">
                {visibleTrips.length} trip
                {visibleTrips.length === 1 ? "" : "s"}
                {filters.timeMode === "past" ? " · past" : " · upcoming"}
              </p>
              <button
                type="button"
                onClick={() =>
                  updateFilters({ myTripsOnly: !filters.myTripsOnly })
                }
                className={[
                  "rounded-full px-3 py-1.5 text-sm font-semibold transition",
                  filters.myTripsOnly
                    ? "bg-[#EDE9FE] text-[#5B21B6]"
                    : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50",
                ].join(" ")}
              >
                My trips
              </button>
            </div>

            {grouped.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                <p className="text-lg font-semibold text-gray-800">No trips found</p>
                <p className="mt-1 text-sm text-gray-500">
                  Try clearing filters or create a new trip.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {grouped.map((group) => (
                  <div key={group.key}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#7C3AED]" />
                      <h2 className="text-sm font-semibold text-gray-800">
                        {formatDayLabel(parseDateKey(group.key), now)}
                      </h2>
                    </div>
                    <div className="space-y-3">
                      {group.trips.map((trip) => (
                        <TripCard
                          key={trip.id}
                          trip={trip}
                          currentUserId={user.id}
                          onToggleJoin={toggleJoin}
                          isPast={filters.timeMode === "past"}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="lg:sticky lg:top-[180px] lg:self-start">
            <TripCalendar
              month={month}
              onMonthChange={setMonth}
              selectedDate={filters.selectedDate}
              onSelectDate={(selectedDate) => updateFilters({ selectedDate })}
              datesWithTrips={calendarDates}
              timeMode={filters.timeMode}
              onTimeModeChange={(timeMode) => updateFilters({ timeMode })}
              eventsTodayCount={eventsTodayCount}
            />
          </div>
        </div>
      </div>

      <CreateTripModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(trip) => {
          setTrips((prev) => [trip, ...prev]);
          updateFilters({ timeMode: "upcoming", quickRange: "all" });
        }}
        host={host}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="text-center md:text-left">
      <p className="text-2xl font-bold text-gray-900 md:text-3xl">{value}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 md:text-sm md:normal-case md:tracking-normal">
        {label}
        {hint ? (
          <span className="ml-1 text-[10px] uppercase text-gray-400">({hint})</span>
        ) : null}
      </p>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full px-3.5 py-1.5 text-sm font-semibold transition",
        active
          ? "bg-gray-900 text-white"
          : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 5h16l-6 8v5l-4 2v-7L4 5z" />
    </svg>
  );
}
