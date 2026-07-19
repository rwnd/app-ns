"use client";

import { useState } from "react";
import { formatTripTimePrefix } from "@/lib/trips/dates";
import { DISCORD_THREADS_MOCK_ONLY } from "@/lib/trips/discord";
import { isJoinable, seatsLeft } from "@/lib/trips/filter";
import {
  formatTransport,
  tripStatusChip,
  type Trip,
  type TripPerson,
  type TripStatus,
} from "@/lib/trips/types";

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

function seatsLine(trip: Trip): string | null {
  const left = seatsLeft(trip);
  if (trip.capacity === null) return null;
  if (left === null) return `${trip.capacity} seats`;
  return `${left} of ${trip.capacity} left`;
}

const CHIP_LABEL: Record<ReturnType<typeof tripStatusChip>, string> = {
  tentative: "Tentative",
  confirmed: "Confirmed",
  flexible: "Flexible",
  full: "Full",
  cancelled: "Cancelled",
};

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
  const [open, setOpen] = useState(false);
  const isHost = trip.host.id === currentUserId;
  const joined = trip.riders.some((g) => g.id === currentUserId);
  const showJoinControl = !isPast && !isHost && (joined || isJoinable(trip));
  const goingCount = trip.riders.length;
  const seats = seatsLine(trip);
  const transport = formatTransport(trip.transport);
  const chip = tripStatusChip(trip);
  const timePrefix = formatTripTimePrefix(trip);
  // Match "N going": riders only — not the host.
  const visibleRiders = trip.riders.slice(0, 3);
  const overflow = Math.max(trip.riders.length - visibleRiders.length, 0);

  return (
    <article className={`trip-row ${open ? "trip-row--open" : ""}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="trip-row-main min-w-0 flex-1 text-left"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="shrink-0 text-sm font-medium tabular-nums text-[var(--iron-500)]">
              {timePrefix}
            </span>
            <h3 className="trip-route inline">
              <span>{trip.source}</span>
              <span className="trip-arrow" aria-hidden="true">
                →
              </span>
              <span>{trip.destination}</span>
            </h3>
            <span className="text-sm text-[var(--iron-500)]">
              · {goingCount} going
            </span>
            <span className={`trip-status-chip trip-status-chip--${chip}`}>
              {CHIP_LABEL[chip]}
            </span>
          </div>

          <div className="trip-people">
            {goingCount > 0 ? (
              <RiderStack people={visibleRiders} overflow={overflow} />
            ) : (
              <span className="trip-sub">
                {isHost ? "Just you" : "No one yet"}
              </span>
            )}
            {transport || seats || isHost || (joined && !isHost) ? (
              <p className="trip-meta !mt-0">
                {transport ? <span>{transport}</span> : null}
                {transport && seats ? (
                  <span className="trip-dot" aria-hidden="true" />
                ) : null}
                {seats ? <span>{seats}</span> : null}
                {(transport || seats) && (isHost || (joined && !isHost)) ? (
                  <span className="trip-dot" aria-hidden="true" />
                ) : null}
                {isHost ? (
                  <span className="font-medium text-[var(--ns-ink)]">Yours</span>
                ) : null}
                {joined && !isHost ? (
                  <span className="font-medium text-[var(--ns-ink)]">
                    You&apos;re in
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>
        </button>

        <div className="flex shrink-0 flex-col items-end gap-2 pt-0.5">
          <button
            type="button"
            className="trip-row-caret"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Hide details" : "Show details"}
            aria-expanded={open}
          >
            {open ? "▴" : "▾"}
          </button>

          {showJoinControl ? (
            <button
              type="button"
              onClick={() => onToggleJoin(trip.id)}
              className={joined ? "btn-secondary" : "btn-primary"}
            >
              {joined ? "Leave" : "I'm in"}
            </button>
          ) : null}

          {!isPast && trip.discordThreadUrl ? (
            <a
              href={trip.discordThreadUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-link-discord"
            >
              Discord{DISCORD_THREADS_MOCK_ONLY ? " (mock)" : ""}
            </a>
          ) : null}

          {!isPast && isHost && !trip.discordThreadUrl ? (
            <button
              type="button"
              onClick={() => onShareDiscord(trip.id)}
              className="btn-discord"
            >
              Discord{DISCORD_THREADS_MOCK_ONLY ? " (mock)" : ""}
            </button>
          ) : null}

          {isPast ? <span className="trip-ended">Ended</span> : null}
        </div>
      </div>

      {open ? (
        <div className="trip-details">
          <p>
            <span className="trip-details-label">Host</span>
            {trip.host.name}
          </p>
          {transport ? (
            <p>
              <span className="trip-details-label">How</span>
              {transport}
            </p>
          ) : null}
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
          <p>
            <span className="trip-details-label">Going</span>
            {goingCount === 0
              ? "No one yet"
              : trip.riders.map((p) => p.name).join(", ")}
          </p>
          {trip.discordThreadUrl ? (
            <p>
              <span className="trip-details-label">Thread</span>
              <a
                href={trip.discordThreadUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-link-discord"
              >
                Open Discord thread
                {DISCORD_THREADS_MOCK_ONLY ? " (mock)" : ""}
              </a>
            </p>
          ) : null}

          {!isPast && (isHost || (joined && trip.discordThreadUrl)) ? (
            <div className="trip-actions !mt-2">
              {joined && !isHost && trip.discordThreadUrl ? (
                <button
                  type="button"
                  onClick={() => onMentionDiscord(trip.id)}
                  className="btn-text"
                >
                  Mention me
                </button>
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
        </div>
      ) : null}

      {joined && !isHost && !open ? (
        <p className="trip-hint">
          Discord mentions are opt-in — nothing posts unless you confirm.
        </p>
      ) : null}

      {flash ? <p className="trip-flash">{flash}</p> : null}
    </article>
  );
}

function RiderStack({
  people,
  overflow,
}: {
  people: TripPerson[];
  overflow: number;
}) {
  if (people.length === 0) return null;

  return (
    <div className="rider-stack">
      {people.map((person) =>
        person.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={person.id}
            src={person.image}
            alt={person.name}
            title={person.name}
            className="rider-avatar"
          />
        ) : (
          <span
            key={person.id}
            title={person.name}
            className="rider-avatar rider-avatar-fallback"
          >
            {person.name.charAt(0)}
          </span>
        ),
      )}
      {overflow > 0 ? (
        <span className="rider-avatar rider-avatar-more" title={`+${overflow} more`}>
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}
