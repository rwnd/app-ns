"use client";

import { useMemo, useState } from "react";
import { ActivityPanel } from "@/components/logistics/activity-panel";
import { CreateTripModal } from "@/components/logistics/create-trip-modal";
import { DiscordConfirm } from "@/components/logistics/discord-confirm";
import { TripCard } from "@/components/logistics/trip-card";
import {
  discordThreadTitle,
  stubDiscordThreadUrl,
} from "@/lib/trips/discord";
import { formatDayLabel, parseDateKey } from "@/lib/trips/dates";
import {
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

type MainTab = "trips" | "activity";

export function LogisticsHome({ user }: LogisticsHomeProps) {
  const [trips, setTrips] = useState<Trip[]>(() => createMockTrips());
  const [filters, setFilters] = useState<TripFilters>(defaultFilters);
  const [tab, setTab] = useState<MainTab>("trips");
  const [createOpen, setCreateOpen] = useState(false);
  const [flashByTrip, setFlashByTrip] = useState<Record<string, string>>({});
  const [discordPrompt, setDiscordPrompt] = useState<DiscordPrompt>(null);

  const now = useMemo(() => new Date(), []);
  const visibleTrips = useMemo(
    () => filterTrips(trips, filters, user.id, now),
    [trips, filters, user.id, now],
  );
  const grouped = useMemo(() => groupTripsByDay(visibleTrips), [visibleTrips]);

  const host: TripPerson = {
    id: user.id,
    name: user.name ?? "You",
    image: user.image,
  };

  const promptTrip = discordPrompt
    ? (trips.find((t) => t.id === discordPrompt.tripId) ?? null)
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

        if (trip.discordThreadUrl) {
          flash(
            tripId,
            "You're going. Tap “Mention me” if you want a Discord ping.",
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
            `Thread ready: “${discordThreadTitle(trip)}” (short-lived).`,
          );
          return { ...trip, discordThreadUrl: url };
        }),
      );
    } else {
      flash(tripId, "Mention queued in the trip thread.");
    }
    setDiscordPrompt(null);
  }

  return (
    <div className="min-h-screen bg-[var(--iron-100)] text-[var(--ns-ink)]">
      <div className="mx-auto w-full max-w-3xl px-3 pb-20 pt-4 sm:px-6 md:pb-10 md:pt-6">
        <div className="sticky top-[56px] z-40 -mx-3 space-y-3 bg-[var(--iron-100)]/95 px-3 py-2 backdrop-blur sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--iron-400)]">
                <SearchIcon />
              </span>
              <input
                value={filters.query}
                onChange={(e) => updateFilters({ query: e.target.value })}
                placeholder="Search Changi, Singapore, Saturday…"
                className="h-10 w-full rounded-full border-0 bg-white py-2.5 pl-10 pr-4 text-sm outline-none ring-1 ring-[var(--iron-200)] focus:ring-2 focus:ring-[var(--ns-ink)]"
              />
            </div>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--ns-ink)] px-4 text-sm font-semibold text-white hover:bg-[#1f2937]"
            >
              + Post
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-full bg-white p-1 ring-1 ring-[var(--iron-200)]">
              {(
                [
                  ["trips", "Trips"],
                  ["activity", "Activity"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value)}
                  className={[
                    "rounded-full px-3.5 py-1.5 text-sm font-semibold transition",
                    tab === value
                      ? "bg-[var(--ns-ink)] text-white"
                      : "text-[var(--iron-500)] hover:text-[var(--ns-ink)]",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "trips" ? (
              <div className="inline-flex rounded-full bg-white p-1 ring-1 ring-[var(--iron-200)]">
                {(
                  [
                    ["upcoming", "Upcoming"],
                    ["past", "Past"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateFilters({ timeMode: value })}
                    className={[
                      "rounded-full px-3 py-1.5 text-sm font-semibold transition",
                      filters.timeMode === value
                        ? "bg-[var(--iron-100)] text-[var(--ns-ink)]"
                        : "text-[var(--iron-500)] hover:text-[var(--ns-ink)]",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {tab === "trips" ? (
            <div className="flex flex-wrap items-center gap-2">
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
              <span className="mx-0.5 hidden h-4 w-px bg-[var(--iron-200)] sm:block" />
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
              <Chip
                active={filters.myTripsOnly}
                onClick={() =>
                  updateFilters({ myTripsOnly: !filters.myTripsOnly })
                }
              >
                Mine
              </Chip>
            </div>
          ) : null}
        </div>

        {tab === "trips" ? (
          <div className="trip-board mt-3">
            {grouped.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-base font-semibold text-[var(--ns-ink)]">
                  No trips
                </p>
                <p className="mt-1 text-sm text-[var(--iron-500)]">
                  Post from → to and when. Share to Discord only if you want.
                </p>
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="mt-4 rounded-full bg-[var(--ns-ink)] px-4 py-2 text-sm font-semibold text-white"
                >
                  + Post
                </button>
              </div>
            ) : (
              grouped.map((group) => (
                <div key={group.key}>
                  <h2 className="trip-day">
                    {formatDayLabel(parseDateKey(group.key), now)}
                  </h2>
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
              ))
            )}
          </div>
        ) : (
          <div className="mt-3 rounded-2xl border border-[var(--iron-200)] bg-white px-5 py-6 sm:px-6">
            <ActivityPanel trips={trips} now={now} />
          </div>
        )}
      </div>

      <CreateTripModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(trip) => {
          setTrips((prev) => [trip, ...prev]);
          setTab("trips");
          updateFilters({ timeMode: "upcoming", quickRange: "all" });
        }}
        host={host}
      />

      <DiscordConfirm
        open={discordPrompt?.kind === "share"}
        title="Create a #logistics thread?"
        body={
          promptTrip
            ? `Opens one short-lived thread: “${discordThreadTitle(promptTrip)}”. Joins stay in the thread — the channel won’t flood.`
            : "Create a short-lived thread for this trip."
        }
        confirmLabel="Create thread"
        onConfirm={confirmDiscord}
        onCancel={() => setDiscordPrompt(null)}
      />

      <DiscordConfirm
        open={discordPrompt?.kind === "mention"}
        title="Mention you in the thread?"
        body="Posts a single line in the trip thread — not the main channel."
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
        "rounded-full px-3 py-1.5 text-sm font-semibold transition",
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
