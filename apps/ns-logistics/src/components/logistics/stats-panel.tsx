"use client";

import { useMemo } from "react";
import { useTrips } from "@/components/logistics/trips-provider";
import { tripCorridor } from "@/lib/trips/constants";
import { formatDayLabel, parseDateKey, toDateKey } from "@/lib/trips/dates";
import { computeStats, isTripExpired } from "@/lib/trips/filter";
import type { TripLocation } from "@/lib/trips/types";

const PLACES: TripLocation[] = [
  "Network School",
  "Changi Airport",
  "Singapore",
  "JB Sentral",
  "Eco Botanica",
];

/**
 * Counts + corridor/place volume — not a geo map (5 fixed hubs).
 */
export function StatsPanel() {
  const { trips } = useTrips();
  const now = useMemo(() => new Date(), []);
  const stats = useMemo(() => computeStats(trips, now), [trips, now]);
  const pastCount = useMemo(
    () => trips.filter((t) => isTripExpired(t, now)).length,
    [trips, now],
  );

  const corridors = useMemo(() => {
    const counts = { airport: 0, singapore: 0, local: 0 };
    for (const t of trips) {
      if (isTripExpired(t, now) || t.status === "cancelled") continue;
      counts[tripCorridor(t.source, t.destination)] += 1;
    }
    return counts;
  }, [trips, now]);

  const placeScores = useMemo(() => {
    const scores = new Map<TripLocation, { asFrom: number; asTo: number }>();
    for (const p of PLACES) scores.set(p, { asFrom: 0, asTo: 0 });
    for (const t of trips) {
      if (isTripExpired(t, now) || t.status === "cancelled") continue;
      const from = scores.get(t.source);
      const to = scores.get(t.destination);
      if (from) from.asFrom += 1;
      if (to) to.asTo += 1;
    }
    return PLACES.map((place) => {
      const s = scores.get(place)!;
      return { place, total: s.asFrom + s.asTo, ...s };
    }).sort((a, b) => b.total - a.total);
  }, [trips, now]);

  const maxPlace = Math.max(...placeScores.map((p) => p.total), 1);

  const recentPast = useMemo(() => {
    return [...trips]
      .filter((t) => isTripExpired(t, now))
      .sort(
        (a, b) =>
          new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
      )
      .slice(0, 6);
  }, [trips, now]);

  return (
    <div className="min-h-screen bg-[var(--iron-100)] text-[var(--ns-ink)]">
      <div className="mx-auto w-full max-w-3xl space-y-6 px-3 pb-20 pt-4 sm:px-6 md:pb-10 md:pt-6">
        <header className="space-y-1">
          <h1 className="font-display text-[1.65rem] font-semibold tracking-[-0.03em] text-[var(--ns-ink)]">
            Stats
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-[var(--iron-500)]">
            Counts and corridors from the ride board — not a map. Use this to
            see where volume is clustering.
          </p>
        </header>

        <section className="rounded-2xl border border-[var(--iron-200)] bg-white px-5 py-6 sm:px-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--iron-400)]">
            Trips
          </h2>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <Metric label="Open" value={stats.open} />
            <Metric label="Upcoming" value={stats.upcoming} />
            <Metric label="Past" value={pastCount} />
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--iron-200)] bg-white px-5 py-6 sm:px-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--iron-400)]">
            Corridors
          </h2>
          <div className="mt-3 space-y-2">
            {(
              [
                ["airport", "Airport", corridors.airport],
                ["singapore", "Singapore", corridors.singapore],
                ["local", "Local", corridors.local],
              ] as const
            ).map(([key, label, value]) => (
              <BarRow
                key={key}
                label={label}
                value={value}
                max={Math.max(stats.upcoming, 1)}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--iron-200)] bg-white px-5 py-6 sm:px-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--iron-400)]">
            Places
          </h2>
          <p className="mt-1 text-sm text-[var(--iron-500)]">
            Where trips start and end — volume by hub.
          </p>
          <div className="mt-3 space-y-2">
            {placeScores.map((p) => (
              <BarRow
                key={p.place}
                label={p.place}
                value={p.total}
                max={maxPlace}
                hint={`${p.asFrom} from · ${p.asTo} to`}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--iron-200)] bg-white px-5 py-6 sm:px-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--iron-400)]">
            Recent past
          </h2>
          {recentPast.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--iron-500)]">Nothing past yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-[var(--iron-100)]">
              {recentPast.map((trip) => (
                <li
                  key={trip.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                >
                  <span className="font-medium text-[var(--ns-ink)]">
                    {trip.source} → {trip.destination}
                  </span>
                  <span className="text-[var(--iron-500)]">
                    {formatDayLabel(parseDateKey(toDateKey(new Date(trip.startsAt))), now)}{" "}
                    · {trip.riders.length} went
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[var(--iron-200)] bg-[var(--iron-50)] px-3 py-4 text-center">
      <p className="text-2xl font-semibold tabular-nums text-[var(--ns-ink)]">
        {value}
      </p>
      <p className="mt-0.5 text-xs font-medium text-[var(--iron-500)]">{label}</p>
    </div>
  );
}

function BarRow({
  label,
  value,
  max,
  hint,
}: {
  label: string;
  value: number;
  max: number;
  hint?: string;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-[var(--ns-ink)]">{label}</p>
        <p className="text-sm tabular-nums text-[var(--iron-500)]">
          {value}
          {hint ? (
            <span className="ml-2 hidden text-xs text-[var(--iron-400)] sm:inline">
              {hint}
            </span>
          ) : null}
        </p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--iron-100)]">
        <div
          className="h-full rounded-full bg-[var(--ns-ink)] transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
