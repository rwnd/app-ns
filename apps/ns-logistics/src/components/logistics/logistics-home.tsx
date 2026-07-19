"use client";

import { useMemo, useState } from "react";
import { CreateTripModal } from "@/components/logistics/create-trip-modal";
import { DiscordConfirm } from "@/components/logistics/discord-confirm";
import { TripCard } from "@/components/logistics/trip-card";
import { useTrips } from "@/components/logistics/trips-provider";
import {
  DISCORD_THREADS_MOCK_ONLY,
  discordThreadTitle,
} from "@/lib/trips/discord";
import { formatDayLabel, parseDateKey, upcomingDayChips } from "@/lib/trips/dates";
import { filterTrips, groupTripsByDay, isJoinable } from "@/lib/trips/filter";
import type {
  TransportMode,
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
  corridor: "all",
  transport: "all",
  selectedDate: null,
  timeMode: "upcoming",
  myTripsOnly: false,
};

type DiscordPrompt =
  | { kind: "share"; tripId: string }
  | { kind: "mention"; tripId: string }
  | null;

export function LogisticsHome({ user }: LogisticsHomeProps) {
  const { trips, addTrip, toggleJoin, setStatus, attachMockThread } = useTrips();
  const [filters, setFilters] = useState<TripFilters>(defaultFilters);
  const [createOpen, setCreateOpen] = useState(false);
  const [flashByTrip, setFlashByTrip] = useState<Record<string, string>>({});
  const [discordPrompt, setDiscordPrompt] = useState<DiscordPrompt>(null);

  const now = useMemo(() => new Date(), []);
  const dayChips = useMemo(() => upcomingDayChips(3, now), [now]);
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

  function handleToggleJoin(tripId: string) {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;
    if (trip.host.id === user.id) return;

    const joined = trip.riders.some((g) => g.id === user.id);
    if (!joined && !isJoinable(trip)) return;

    toggleJoin(tripId, host);

    if (!joined && trip.discordThreadUrl) {
      flash(
        tripId,
        "You're going. Tap “Mention me” if you want a Discord ping.",
      );
    }
  }

  function handleSetStatus(tripId: string, status: TripStatus) {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip || trip.host.id !== user.id) return;
    setStatus(tripId, status);
    flash(
      tripId,
      status === "confirmed"
        ? "Time confirmed."
        : status === "cancelled"
          ? "Trip cancelled."
          : "Updated.",
    );
  }

  function confirmDiscord() {
    if (!discordPrompt) return;
    const { kind, tripId } = discordPrompt;

    if (kind === "share") {
      const trip = trips.find((t) => t.id === tripId);
      attachMockThread(tripId);
      flash(
        tripId,
        trip
          ? DISCORD_THREADS_MOCK_ONLY
            ? `Mock thread ready: “${discordThreadTitle(trip)}” — not posted to Discord.`
            : `Thread ready: “${discordThreadTitle(trip)}”.`
          : "Thread ready.",
      );
    } else {
      flash(
        tripId,
        DISCORD_THREADS_MOCK_ONLY
          ? "Mock mention queued (not posted)."
          : "Mention queued in the trip thread.",
      );
    }
    setDiscordPrompt(null);
  }

  function toggleCorridor(value: TripCorridor) {
    updateFilters({
      corridor: filters.corridor === value ? "all" : value,
    });
  }

  function toggleTransport(value: TransportMode) {
    updateFilters({
      transport: filters.transport === value ? "all" : value,
    });
  }

  function toggleDay(key: string) {
    updateFilters({
      selectedDate: filters.selectedDate === key ? null : key,
    });
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
            <p className="text-sm font-semibold text-[var(--ns-ink)]">Trips</p>
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
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--iron-400)]">
                Popular
              </span>
              {(
                [
                  ["airport", "Airport"],
                  ["singapore", "Singapore"],
                  ["local", "Local"],
                ] as const
              ).map(([value, label]) => (
                <Chip
                  key={value}
                  active={filters.corridor === value}
                  onClick={() => toggleCorridor(value)}
                >
                  {label}
                </Chip>
              ))}
              <span className="mx-0.5 hidden h-4 w-px bg-[var(--iron-200)] sm:block" />
              {(
                [
                  ["car", "Car"],
                  ["bus", "Bus"],
                ] as const
              ).map(([value, label]) => (
                <Chip
                  key={value}
                  active={filters.transport === value}
                  onClick={() => toggleTransport(value)}
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

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--iron-400)]">
                Days
              </span>
              {dayChips.map((chip) => (
                <Chip
                  key={chip.key}
                  active={filters.selectedDate === chip.key}
                  onClick={() => toggleDay(chip.key)}
                >
                  {chip.label}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        <div className="trip-board mt-3">
          {grouped.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-base font-semibold text-[var(--ns-ink)]">
                No trips
              </p>
              <p className="mt-1 text-sm text-[var(--iron-500)]">
                Post from → to and when. Discord stays optional.
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
                    onToggleJoin={handleToggleJoin}
                    onSetStatus={handleSetStatus}
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
      </div>

      <CreateTripModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(trip) => {
          addTrip(trip);
          updateFilters({ timeMode: "upcoming", selectedDate: null });
        }}
        host={host}
      />

      <DiscordConfirm
        open={discordPrompt?.kind === "share"}
        title={
          DISCORD_THREADS_MOCK_ONLY
            ? "Attach a mock Discord thread?"
            : "Create a #logistics thread?"
        }
        body={
          promptTrip
            ? DISCORD_THREADS_MOCK_ONLY
              ? `Stores a stub link for “${discordThreadTitle(promptTrip)}”. No real Discord thread is created yet.`
              : `Opens one short-lived thread: “${discordThreadTitle(promptTrip)}”.`
            : DISCORD_THREADS_MOCK_ONLY
              ? "Stores a stub Discord link only — nothing is posted."
              : "Create a short-lived thread for this trip."
        }
        confirmLabel={DISCORD_THREADS_MOCK_ONLY ? "Add mock thread" : "Create thread"}
        onConfirm={confirmDiscord}
        onCancel={() => setDiscordPrompt(null)}
      />

      <DiscordConfirm
        open={discordPrompt?.kind === "mention"}
        title={
          DISCORD_THREADS_MOCK_ONLY
            ? "Mock mention you in the thread?"
            : "Mention you in the thread?"
        }
        body={
          DISCORD_THREADS_MOCK_ONLY
            ? "UI-only for now — nothing is posted to Discord."
            : "Posts a single line in the trip thread — not the main channel."
        }
        confirmLabel={DISCORD_THREADS_MOCK_ONLY ? "Mock mention" : "Mention me"}
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
