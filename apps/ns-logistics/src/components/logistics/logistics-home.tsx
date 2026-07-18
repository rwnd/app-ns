"use client";

import { useMemo, useState } from "react";
import { CreateTripModal } from "@/components/logistics/create-trip-modal";
import { DiscordConfirm } from "@/components/logistics/discord-confirm";
import { TripCalendar } from "@/components/logistics/trip-calendar";
import { TripCard } from "@/components/logistics/trip-card";
import {
  discordThreadTitle,
  stubDiscordThreadUrl,
} from "@/lib/trips/discord";
import {
  formatDayLabel,
  parseDateKey,
  toDateKey,
} from "@/lib/trips/dates";
import {
  datesWithTrips,
  filterTrips,
  groupTripsByDay,
  isJoinable,
} from "@/lib/trips/filter";
import { createMockTrips } from "@/lib/trips/mock-data";
import type {
  QuickRange,
  Trip,
  TripCorridor,
  TripFilters,
  TripPerson,
  TripStatus,
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
  corridor: "all",
  selectedDate: null,
  timeMode: "upcoming",
  myTripsOnly: false,
};

type DiscordPrompt =
  | { kind: "share"; tripId: string }
  | { kind: "mention"; tripId: string }
  | null;

export function LogisticsHome({ user }: LogisticsHomeProps) {
  const [trips, setTrips] = useState<Trip[]>(() => createMockTrips());
  const [filters, setFilters] = useState<TripFilters>(defaultFilters);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [flashByTrip, setFlashByTrip] = useState<Record<string, string>>({});
  const [discordPrompt, setDiscordPrompt] = useState<DiscordPrompt>(null);

  const now = useMemo(() => new Date(), []);
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

  const promptTrip = discordPrompt
    ? trips.find((t) => t.id === discordPrompt.tripId) ?? null
    : null;

  function updateFilters(patch: Partial<TripFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  function flash(tripId: string, message: string) {
    setFlashByTrip((prev) => ({ ...prev, [tripId]: message }));
    window.setTimeout(() => {
      setFlashByTrip((prev) => {
        const next = { ...prev };
        delete next[tripId];
        return next;
      });
    }, 3500);
  }

  function toggleJoin(tripId: string) {
    setTrips((prev) =>
      prev.map((trip) => {
        if (trip.id !== tripId) return trip;
        if (trip.host.id === user.id) return trip;

        const joined = trip.riders.some((g) => g.id === user.id);
        if (joined) {
          return {
            ...trip,
            riders: trip.riders.filter((g) => g.id !== user.id),
            status: trip.status === "full" ? "open" : trip.status,
          };
        }

        if (!isJoinable(trip)) return trip;

        const nextRiders = [...trip.riders, host];
        const left =
          trip.capacity === null
            ? null
            : Math.max(trip.capacity - nextRiders.length, 0);

        // App-only join — Discord mention is a separate confirmed action
        if (trip.discordThreadUrl) {
          flash(
            tripId,
            "You're going. Tap “Mention me” if you want a Discord ping in the thread.",
          );
        }

        return {
          ...trip,
          riders: nextRiders,
          status: left === 0 ? "full" : trip.status,
        };
      }),
    );
  }

  function setStatus(tripId: string, status: TripStatus) {
    setTrips((prev) =>
      prev.map((trip) => {
        if (trip.id !== tripId || trip.host.id !== user.id) return trip;
        flash(
          tripId,
          status === "confirmed"
            ? "Time confirmed."
            : status === "cancelled"
              ? "Trip cancelled."
              : "Updated.",
        );
        return { ...trip, status };
      }),
    );
  }

  function confirmDiscord() {
    if (!discordPrompt) return;
    const { kind, tripId } = discordPrompt;

    if (kind === "share") {
      setTrips((prev) =>
        prev.map((trip) => {
          if (trip.id !== tripId) return trip;
          const url = stubDiscordThreadUrl(trip);
          flash(
            tripId,
            `Thread ready in #logistics: “${discordThreadTitle(trip)}” (short-lived).`,
          );
          return { ...trip, discordThreadUrl: url };
        }),
      );
    } else {
      flash(
        tripId,
        "Mention queued in the trip thread — channel stays quiet.",
      );
    }
    setDiscordPrompt(null);
  }

  return (
    <div className="min-h-screen bg-[var(--iron-100)] text-[var(--ns-ink)]">
      <div className="mx-auto w-full max-w-screen-xl px-3 pb-20 pt-4 sm:px-6 md:pb-8 lg:px-12 lg:py-5">
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
                    placeholder="Search Changi, Singapore, Saturday…"
                    className="h-10 w-full rounded-full border-0 bg-white py-2.5 pl-10 pr-4 text-sm outline-none ring-1 ring-[var(--iron-200)] focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-4 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
                >
                  + Post trip
                </button>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {(
                  [
                    ["all", "All"],
                    ["airport", "Airport"],
                    ["singapore", "Singapore"],
                    ["local", "Local"],
                  ] as const
                ).map(([value, label]) => (
                  <Chip
                    key={value}
                    active={filters.corridor === value}
                    onClick={() =>
                      updateFilters({
                        corridor: value as TripCorridor | "all",
                      })
                    }
                  >
                    {label}
                  </Chip>
                ))}
                <span className="mx-1 hidden h-4 w-px bg-[var(--iron-200)] sm:block" />
                {(
                  [
                    ["all", "Any day"],
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
                  Mine
                </button>
              </div>
            </div>

            <div className="pb-4 pt-2 md:rounded-2xl md:border md:border-[var(--iron-200)] md:bg-white md:px-6 md:shadow-sm">
              {grouped.length === 0 ? (
                <div className="px-2 py-16 text-center">
                  <p className="text-lg font-semibold text-[var(--ns-ink)]">
                    No trips yet
                  </p>
                  <p className="mt-1 text-sm text-[var(--iron-500)]">
                    Post from → to and when. Share to Discord only if you want.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCreateOpen(true)}
                    className="mt-4 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
                  >
                    + Post trip
                  </button>
                </div>
              ) : (
                <div className="flex flex-col">
                  {grouped.map((group) => (
                    <div key={group.key}>
                      <h2 className="sticky top-[148px] z-30 -mx-1 bg-[var(--iron-100)]/95 px-1 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--iron-400)] backdrop-blur md:static md:bg-transparent md:px-0 md:pt-4 md:normal-case md:tracking-normal md:text-sm md:text-[var(--iron-500)]">
                        {formatDayLabel(parseDateKey(group.key), now)}
                      </h2>
                      <div className="divide-y divide-[var(--iron-200)] md:divide-y-0">
                        {group.trips.map((trip) => (
                          <TripCard
                            key={trip.id}
                            trip={trip}
                            currentUserId={user.id}
                            onToggleJoin={toggleJoin}
                            onSetStatus={setStatus}
                            onShareDiscord={(id) =>
                              setDiscordPrompt({ kind: "share", tripId: id })
                            }
                            onMentionDiscord={(id) =>
                              setDiscordPrompt({ kind: "mention", tripId: id })
                            }
                            isPast={filters.timeMode === "past"}
                            flash={flashByTrip[trip.id] ?? null}
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

      <DiscordConfirm
        open={discordPrompt?.kind === "share"}
        title="Create a #logistics thread?"
        body={
          promptTrip
            ? `This opens one short-lived thread named “${discordThreadTitle(promptTrip)}”. Joins stay in the thread — the channel itself won’t flood. Auto-archive after the trip.`
            : "Create a short-lived thread for this trip."
        }
        confirmLabel="Create thread"
        onConfirm={confirmDiscord}
        onCancel={() => setDiscordPrompt(null)}
      />

      <DiscordConfirm
        open={discordPrompt?.kind === "mention"}
        title="Mention you in the thread?"
        body="Posts a single line in the trip’s Discord thread (not the main #logistics channel). Skip if you’d rather DM."
        confirmLabel="Mention me"
        onConfirm={confirmDiscord}
        onCancel={() => setDiscordPrompt(null)}
      />
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
