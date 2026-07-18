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
  if (trip.intent === "request") return "Looking";
  const left = seatsLeft(trip);
  if (trip.capacity === null) return "Offering";
  if (left === null) return `${trip.capacity} seats`;
  return `${left} of ${trip.capacity} left`;
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
    <article className="trip-row group">
      <div className="flex items-start gap-4">
        {/* Content — two clear lines, not a middot soup */}
        <div className="min-w-0 flex-1">
          <h3 className="trip-route">
            <span>{trip.source}</span>
            <span className="trip-arrow" aria-hidden="true">
              →
            </span>
            <span>{trip.destination}</span>
          </h3>

          <p className="trip-meta">
            <span>{formatTripWhen(trip)}</span>
            <span className="trip-dot" aria-hidden="true" />
            <span>{howLine(trip)}</span>
            {trip.timePrecision === "flexible" ? (
              <>
                <span className="trip-dot" aria-hidden="true" />
                <span>Flexible</span>
              </>
            ) : null}
            {trip.status !== "open" ? (
              <>
                <span className="trip-dot" aria-hidden="true" />
                <span className="capitalize">{trip.status}</span>
              </>
            ) : null}
          </p>

          <p className="trip-sub">
            <span>{trip.host.name}</span>
            {trip.riders.length > 0 ? (
              <span> · {trip.riders.length} going</span>
            ) : null}
            {hasDetails ? (
              <>
                <span className="text-[var(--iron-300)]"> · </span>
                <button
                  type="button"
                  onClick={() => setDetailsOpen((v) => !v)}
                  className="font-medium text-[var(--ns-ink)] underline-offset-2 hover:underline"
                  aria-expanded={detailsOpen}
                >
                  {detailsOpen ? "Hide" : "Details"}
                </button>
              </>
            ) : null}
          </p>
        </div>

        {/* Primary action — one job, right-aligned */}
        <div className="flex shrink-0 flex-col items-end gap-2 pt-0.5">
          {showJoinControl ? (
            <button
              type="button"
              onClick={() => onToggleJoin(trip.id)}
              className={joined ? "btn-secondary" : "btn-primary"}
            >
              {joined ? "Going. Cancel." : "I'm in"}
            </button>
          ) : null}

          {!isPast && isHost && !trip.discordThreadUrl ? (
            <button
              type="button"
              onClick={() => onShareDiscord(trip.id)}
              className="btn-discord"
            >
              Share to Discord
            </button>
          ) : null}

          {!isPast && isHost && trip.discordThreadUrl ? (
            <a
              href={trip.discordThreadUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-link-discord"
            >
              Open thread
            </a>
          ) : null}

          {isPast ? <span className="trip-ended">Ended</span> : null}
        </div>
      </div>

      {/* Secondary host / rider actions — quiet text row */}
      {!isPast && (isHost || (joined && trip.discordThreadUrl)) ? (
        <div className="trip-actions">
          {joined && !isHost && trip.discordThreadUrl ? (
            <>
              <a
                href={trip.discordThreadUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-link-discord"
              >
                Thread
              </a>
              <button
                type="button"
                onClick={() => onMentionDiscord(trip.id)}
                className="btn-text"
              >
                Mention me
              </button>
            </>
          ) : null}
          {isHost && trip.status === "open" ? (
            <button
              type="button"
              onClick={() => onSetStatus(trip.id, "confirmed")}
              className="btn-text"
            >
              Confirm time
            </button>
          ) : null}
          {isHost && trip.status !== "cancelled" ? (
            <button
              type="button"
              onClick={() => onSetStatus(trip.id, "cancelled")}
              className="btn-text-danger"
            >
              Cancel trip
            </button>
          ) : null}
        </div>
      ) : null}

      {joined && !isHost ? (
        <p className="trip-hint">
          Discord mentions are opt-in — nothing posts unless you confirm.
        </p>
      ) : null}

      {flash ? <p className="trip-flash">{flash}</p> : null}

      {detailsOpen ? (
        <div className="trip-details">
          {trip.meetingPoint ? (
            <p>
              <span className="trip-details-label">Meet</span>
              {trip.meetingPoint}
            </p>
          ) : null}
          {trip.notes ? (
            <p>
              <span className="trip-details-label">Notes</span>
              {trip.notes}
            </p>
          ) : null}
          {trip.riders.length > 0 ? (
            <p>
              <span className="trip-details-label">Going</span>
              {trip.riders.map((r) => r.name).join(", ")}
            </p>
          ) : (
            <p className="text-[var(--iron-400)]">No one else yet.</p>
          )}
        </div>
      ) : null}
    </article>
  );
}
