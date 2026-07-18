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
    <div className="min-h-screen bg-[var(--iron-100)] text-[var(--ns-ink)]">
      <div className="mx-auto w-full max-w-screen-xl px-3 pb-20 pt-4 sm:px-6 md:pb-8 lg:px-12 lg:py-5">
        <section className="mb-4 rounded-2xl border border-[var(--iron-200)] bg-[var(--iron-50)] px-6 pb-6 pt-10 md:pt-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Logistics
            </h1>
            <p className="max-w-md text-sm text-[var(--iron-500)] md:text-base">
              Coordinate rides to and from Network School.
            </p>
            <div className="mt-3 flex w-full max-w-lg items-center justify-between gap-4">
              <Stat label="Upcoming" value={stats.upcoming} />
              <Stat label="Next 24h" value={stats.inProgressNext24h} />
              <Stat label="Expired" value={stats.expired} />
            </div>
            <p className="mt-2 text-xs text-[var(--iron-400)]">
              Past list shows the last {PAST_VISIBLE_DAYS} days ·{" "}
              {stats.plannedTotal} trips planned overall
            </p>
          </div>
        </section>

        <div className="flex items-start gap-6">
          <div className="min-w-0 flex-1">
            <div className="sticky top-[56px] z-40 bg-[var(--iron-100)]/95 pb-2 pt-2 backdrop-blur sm:pb-3 sm:pt-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--iron-400)]">
                    <SearchIcon />
                  </span>
                  <input
                    value={filters.query}
                    onChange={(e) => updateFilters({ query: e.target.value })}
                    placeholder="Search trips, places, dates..."
                    className="h-10 w-full rounded-full border-0 bg-white py-2.5 pl-10 pr-4 text-sm outline-none ring-1 ring-[var(--iron-200)] focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setFiltersOpen((v) => !v)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[var(--iron-200)] bg-white px-3 text-sm font-semibold text-[var(--ns-ink)] hover:bg-[var(--iron-50)] xl:px-4"
                  aria-expanded={filtersOpen}
                >
                  <FilterIcon />
                  <span className="hidden xl:inline">Filter</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] xl:px-4"
                >
                  <span className="xl:hidden">+</span>
                  <span className="hidden xl:inline">+ Create Trip</span>
                  <span className="xl:hidden">Create</span>
                </button>
              </div>

              {filtersOpen ? (
                <div className="mt-3 grid grid-cols-1 gap-3 rounded-2xl border border-[var(--iron-200)] bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
                  <label className="text-sm">
                    <span className="mb-1 block font-medium text-[var(--ns-ink)]">
                      Source
                    </span>
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
                    <span className="mb-1 block font-medium text-[var(--ns-ink)]">
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
                    <p className="mb-1 text-sm font-medium text-[var(--ns-ink)]">
                      Quick range
                    </p>
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
                <div className="mt-2 flex flex-wrap items-center gap-2">
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
                  <button
                    type="button"
                    onClick={() =>
                      updateFilters({ myTripsOnly: !filters.myTripsOnly })
                    }
                    className={[
                      "rounded-full px-3.5 py-1.5 text-sm font-semibold transition",
                      filters.myTripsOnly
                        ? "bg-[var(--accent-soft)] text-[var(--accent-hover)]"
                        : "bg-white text-[var(--ns-ink)] ring-1 ring-[var(--iron-200)] hover:bg-[var(--iron-50)]",
                    ].join(" ")}
                  >
                    My trips
                  </button>
                </div>
              )}
            </div>

            <div className="pb-4 pt-3 md:rounded-2xl md:border md:border-[var(--iron-200)] md:bg-white md:px-8 md:shadow-sm">
              <p className="mb-3 text-sm font-medium text-[var(--iron-500)]">
                {visibleTrips.length} trip
                {visibleTrips.length === 1 ? "" : "s"}
                {filters.timeMode === "past" ? " · past" : " · upcoming"}
              </p>

              {grouped.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--iron-300)] bg-[var(--iron-50)] px-6 py-16 text-center md:bg-transparent">
                  <p className="text-lg font-semibold text-[var(--ns-ink)]">
                    No trips found
                  </p>
                  <p className="mt-1 text-sm text-[var(--iron-500)]">
                    Try clearing filters or create a new trip.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {grouped.map((group) => (
                    <div key={group.key} className="relative md:ml-[11px]">
                      <div
                        aria-hidden="true"
                        className="absolute bottom-0 left-0 top-6 hidden border-l border-dashed border-[var(--iron-300)] md:block"
                      />
                      <div className="flex items-center justify-between pb-2 pt-1 md:-ml-[21px]">
                        <div className="flex items-center gap-2 rounded-full border border-[var(--iron-300)] bg-white/70 px-3 py-1.5 shadow-sm">
                          <span className="hidden h-2 w-2 rounded-full bg-[var(--accent)] sm:block" />
                          <h2 className="text-sm font-semibold text-[var(--ns-ink)]">
                            {formatDayLabel(parseDateKey(group.key), now)}
                          </h2>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 pb-5 md:pl-5">
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
            </div>
          </div>

          <div className="sticky top-[72px] hidden shrink-0 self-start pt-3 xl:block">
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

        <div className="mt-4 xl:hidden">
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-0.5 px-2">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--iron-500)]">
        {label}
      </p>
      <p className="text-2xl font-semibold text-[var(--ns-ink)] md:text-3xl">
        {value}
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
          ? "bg-[var(--ns-ink)] text-white"
          : "bg-white text-[var(--ns-ink)] ring-1 ring-[var(--iron-200)] hover:bg-[var(--iron-50)]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 5h16l-6 8v5l-4 2v-7L4 5z" />
    </svg>
  );
}
