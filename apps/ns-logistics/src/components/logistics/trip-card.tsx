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
  const visibleRiders = trip.riders.slice(0, 3);
  const overflow = Math.max(trip.riders.length - visibleRiders.length, 0);

  const showDiscord =
    !isPast && (Boolean(trip.discordThreadUrl) || isHost);

  function toggleOpen() {
    setOpen((v) => !v);
  }

  return (
    <article className={`trip-row ${open ? "trip-row--open" : ""}`}>
      <div
        className="trip-row-hit"
        onClick={toggleOpen}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleOpen();
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={open}
      >
        <div className="trip-row-top">
          <div className="trip-row-summary min-w-0 flex-1">
            <span className="trip-time">{timePrefix}</span>
            <h3 className="trip-route">
              <span>{trip.source}</span>
              <span className="trip-arrow" aria-hidden="true">
                →
              </span>
              <span>{trip.destination}</span>
            </h3>
            <span className="trip-going">· {goingCount} going</span>
            <span className={`trip-status-chip trip-status-chip--${chip}`}>
              {CHIP_LABEL[chip]}
            </span>
          </div>

          <div
            className="trip-row-ctas"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            {showJoinControl ? (
              <button
                type="button"
                onClick={() => onToggleJoin(trip.id)}
                className={joined ? "btn-secondary" : "btn-primary"}
              >
                {joined ? "Leave" : "I'm in"}
              </button>
            ) : null}

            {showDiscord && trip.discordThreadUrl ? (
              <a
                href={trip.discordThreadUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-discord-chip"
                title={
                  DISCORD_THREADS_MOCK_ONLY
                    ? "Open Discord thread (mock)"
                    : "Open Discord thread"
                }
              >
                <DiscordIcon />
                <span>Discord</span>
              </a>
            ) : null}

            {showDiscord && !trip.discordThreadUrl && isHost ? (
              <button
                type="button"
                onClick={() => onShareDiscord(trip.id)}
                className="btn-discord-chip"
                title="Attach mock Discord thread"
              >
                <DiscordIcon />
                <span>Discord</span>
              </button>
            ) : null}

            {isPast ? <span className="trip-ended">Ended</span> : null}

            <span className="trip-row-caret" aria-hidden="true">
              {open ? "▴" : "▾"}
            </span>
          </div>
        </div>

        <div className="trip-row-sub">
          {goingCount > 0 ? (
            <RiderStack people={visibleRiders} overflow={overflow} />
          ) : (
            <span className="trip-sub">
              {isHost ? "Just you" : "No one yet"}
            </span>
          )}
          {transport ? <span className="trip-sub">{transport}</span> : null}
          {seats ? <span className="trip-sub">{seats}</span> : null}
          {isHost ? (
            <span className="trip-sub font-medium text-[var(--ns-ink)]">Yours</span>
          ) : null}
          {joined && !isHost ? (
            <span className="trip-sub font-medium text-[var(--ns-ink)]">
              You&apos;re in
            </span>
          ) : null}
        </div>
      </div>

      {open ? (
        <div
          className="trip-details"
          onClick={(event) => event.stopPropagation()}
        >
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

      {flash ? <p className="trip-flash">{flash}</p> : null}
    </article>
  );
}

function DiscordIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.3 4.4A16.8 16.8 0 0 0 15.9 3c-.2.4-.4.9-.6 1.3a15.4 15.4 0 0 0-6.6 0A10 10 0 0 0 8.1 3a16.7 16.7 0 0 0-4.4 1.4C.9 9.1.3 13.6.6 18.1A16.9 16.9 0 0 0 6 20.8c.4-.6.8-1.2 1.1-1.8-.6-.2-1.2-.5-1.7-.9.1-.1.3-.2.4-.3a11.9 11.9 0 0 0 10.4 0c.1.1.3.2.4.3-.5.4-1.1.7-1.7.9.3.6.7 1.2 1.1 1.8a16.8 16.8 0 0 0 5.4-2.7c.4-5-.7-9.5-3.1-13.7ZM8.7 15.3c-1 0-1.9-1-1.9-2.1 0-1.2.8-2.1 1.9-2.1s1.9 1 1.9 2.1c0 1.2-.8 2.1-1.9 2.1Zm6.6 0c-1 0-1.9-1-1.9-2.1 0-1.2.8-2.1 1.9-2.1s1.9 1 1.9 2.1c0 1.2-.9 2.1-1.9 2.1Z" />
    </svg>
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
