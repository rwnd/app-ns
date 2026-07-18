"use client";

import { useState } from "react";
import { formatTripWhen } from "@/lib/trips/dates";
import { isJoinable, seatsLeft } from "@/lib/trips/filter";
import type { Trip, TripStatus } from "@/lib/trips/types";

type TripCardProps = {
  trip: Trip;
  currentUserId: string;
  onToggleJoin: (tripId: string) => void;
  onSetStatus: (tripId: string, status: TripStatus) => void;
  onShareDiscord: (tripId: string) => void;
  onMentionDiscord: (tripId: string) => void;
  isPast?: boolean;
  flash?: string | null;
};

function howLine(trip: Trip): string {
  if (trip.intent === "request") return "Looking for a ride";
  const left = seatsLeft(trip);
  if (trip.capacity === null) return "Offering · companions welcome";
  if (left === null) return `Offering · ${trip.capacity} seats`;
  return `Offering · ${left}/${trip.capacity} seats left`;
}

export function TripCard({
  trip,
  currentUserId,
  onToggleJoin,
  onSetStatus,
  onShareDiscord,
  onMentionDiscord,
  isPast = false,
  flash = null,
}: TripCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const isHost = trip.host.id === currentUserId;
  const joined = trip.riders.some((g) => g.id === currentUserId);
  const showJoinControl =
    !isPast && !isHost && (joined || isJoinable(trip));
  const hasDetails = Boolean(
    trip.notes || trip.meetingPoint || trip.riders.length > 0,
  );

  return (
    <article className="trip-enter border-b border-[var(--iron-200)] py-3.5 last:border-b-0">
      {/* Row 1 — route · when · how */}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="text-base font-semibold text-[var(--ns-ink)]">
          {trip.source} → {trip.destination}
        </p>
        <span className="text-[var(--iron-300)]">·</span>
        <p className="text-sm text-[var(--iron-500)]">{formatTripWhen(trip)}</p>
        {trip.timePrecision === "flexible" ? (
          <span className="text-xs text-[var(--iron-400)]">(flexible)</span>
        ) : null}
        <span className="text-[var(--iron-300)]">·</span>
        <p className="text-sm text-[var(--iron-500)]">{howLine(trip)}</p>
        {trip.status !== "open" ? (
          <>
            <span className="text-[var(--iron-300)]">·</span>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--iron-400)]">
              {trip.status}
            </p>
          </>
        ) : null}
      </div>

      {/* Row 2 — host · CTAs · details */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-sm text-[var(--iron-500)]">
          {trip.host.name}
          {trip.riders.length > 0
            ? ` · ${trip.riders.length} going`
            : ""}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {showJoinControl ? (
            <button
              type="button"
              onClick={() => onToggleJoin(trip.id)}
              className={
                joined
                  ? "rounded-full border border-[var(--iron-300)] bg-white px-3.5 py-1.5 text-sm font-semibold text-[var(--ns-ink)] hover:bg-[var(--iron-50)]"
                  : "rounded-full bg-[var(--accent)] px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
              }
            >
              {joined ? "Going. Cancel." : "I'm in"}
            </button>
          ) : null}

          {joined && !isHost && trip.discordThreadUrl ? (
            <a
              href={trip.discordThreadUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-[#5865F2] hover:underline"
            >
              Thread
            </a>
          ) : null}

          {joined && !isHost && trip.discordThreadUrl ? (
            <button
              type="button"
              onClick={() => onMentionDiscord(trip.id)}
              className="text-sm font-medium text-[var(--iron-500)] hover:text-[var(--ns-ink)]"
            >
              Mention me
            </button>
          ) : null}

          {!isPast && isHost ? (
            <>
              {!trip.discordThreadUrl ? (
                <button
                  type="button"
                  onClick={() => onShareDiscord(trip.id)}
                  className="rounded-full border border-[#5865F2]/40 px-3 py-1.5 text-sm font-semibold text-[#5865F2] hover:bg-[#5865F2]/08"
                >
                  Share to Discord
                </button>
              ) : (
                <a
                  href={trip.discordThreadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-[#5865F2] hover:underline"
                >
                  Open thread
                </a>
              )}
              {trip.status === "open" ? (
                <button
                  type="button"
                  onClick={() => onSetStatus(trip.id, "confirmed")}
                  className="text-sm font-medium text-[var(--iron-500)] hover:text-[var(--ns-ink)]"
                >
                  Confirm time
                </button>
              ) : null}
              {trip.status !== "cancelled" ? (
                <button
                  type="button"
                  onClick={() => onSetStatus(trip.id, "cancelled")}
                  className="text-sm font-medium text-red-500 hover:text-red-600"
                >
                  Cancel trip
                </button>
              ) : null}
            </>
          ) : null}

          {isPast ? (
            <span className="text-sm text-[var(--iron-400)]">Ended</span>
          ) : null}

          {hasDetails ? (
            <button
              type="button"
              onClick={() => setDetailsOpen((v) => !v)}
              className="text-sm font-medium text-[var(--iron-500)] hover:text-[var(--ns-ink)]"
              aria-expanded={detailsOpen}
            >
              {detailsOpen ? "Hide details" : "Details"}
            </button>
          ) : null}
        </div>
      </div>

      {joined && !isHost ? (
        <p className="mt-1.5 text-xs text-[var(--iron-400)]">
          You&apos;re going. Mentions in Discord are opt-in — nothing posts
          unless you confirm.
        </p>
      ) : null}

      {flash ? (
        <p className="mt-2 text-xs font-medium text-[var(--accent-hover)]">
          {flash}
        </p>
      ) : null}

      {detailsOpen ? (
        <div className="mt-3 space-y-1.5 rounded-xl bg-[var(--iron-50)] px-3 py-3 text-sm text-[var(--iron-500)]">
          {trip.meetingPoint ? (
            <p>
              <span className="font-medium text-[var(--ns-ink)]">Meet:</span>{" "}
              {trip.meetingPoint}
            </p>
          ) : null}
          {trip.notes ? (
            <p>
              <span className="font-medium text-[var(--ns-ink)]">Notes:</span>{" "}
              {trip.notes}
            </p>
          ) : null}
          {trip.riders.length > 0 ? (
            <p>
              <span className="font-medium text-[var(--ns-ink)]">Going:</span>{" "}
              {trip.riders.map((r) => r.name).join(", ")}
            </p>
          ) : (
            <p>No one else yet.</p>
          )}
        </div>
      ) : null}
    </article>
  );
}
