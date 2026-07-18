"use client";

import { formatTimeRange } from "@/lib/trips/dates";
import { destinationImageUrl } from "@/lib/trips/location-images";
import type { Trip } from "@/lib/trips/types";

type TripCardProps = {
  trip: Trip;
  currentUserId: string;
  onToggleJoin: (tripId: string) => void;
  isPast?: boolean;
};

export function TripCard({
  trip,
  currentUserId,
  onToggleJoin,
  isPast = false,
}: TripCardProps) {
  const joined =
    trip.host.id === currentUserId ||
    trip.guests.some((g) => g.id === currentUserId);
  const guests = trip.guests;
  const visible = guests.slice(0, 4);
  const overflow = Math.max(guests.length - visible.length, 0);
  const thumb = destinationImageUrl(trip.destination);

  return (
    <article className="trip-enter overflow-hidden rounded-2xl border border-[var(--iron-200)] bg-white p-3 transition-shadow hover:shadow-sm sm:p-4 md:p-5">
      <div className="flex gap-3 sm:gap-5">
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--iron-500)]">
              {formatTimeRange(trip.startsAt, trip.endsAt)}
            </p>
            <h3 className="mt-1.5 text-lg font-semibold leading-snug text-[var(--ns-ink)] sm:text-xl">
              {trip.title}
            </h3>

            <div className="mt-2.5 flex items-center gap-2 text-sm text-[var(--iron-500)]">
              {trip.host.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={trip.host.image}
                  alt=""
                  className="h-4 w-4 rounded-full object-cover ring-2 ring-white"
                />
              ) : (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--iron-100)] text-[9px] font-semibold text-[var(--ns-ink)] ring-2 ring-white">
                  {trip.host.name.charAt(0)}
                </span>
              )}
              <span>
                by{" "}
                <span className="font-medium text-[var(--ns-ink)]">
                  {trip.host.name}
                </span>
                <span className="text-[var(--iron-400)]">
                  {" "}
                  · {trip.source} → {trip.destination}
                </span>
              </span>
            </div>

            <div className="mt-1.5 flex items-center gap-1.5 text-sm text-[var(--iron-500)]">
              <PinIcon />
              <span>{trip.meetingPoint}</span>
            </div>

            {trip.notes ? (
              <p className="mt-2 line-clamp-2 text-sm text-[var(--iron-400)]">
                {trip.notes}
              </p>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {!isPast ? (
              <button
                type="button"
                onClick={() => onToggleJoin(trip.id)}
                className={
                  joined
                    ? "rounded-full border border-[var(--iron-300)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ns-ink)] transition hover:bg-[var(--iron-50)]"
                    : "rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
                }
              >
                {joined ? "Joined" : "+ Join"}
              </button>
            ) : (
              <span className="rounded-full bg-[var(--iron-100)] px-4 py-2 text-sm font-semibold text-[var(--iron-500)]">
                Ended
              </span>
            )}

            <div className="flex items-center">
              <div className="flex -space-x-2">
                {visible.map((guest) =>
                  guest.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={guest.id}
                      src={guest.image}
                      alt={guest.name}
                      title={guest.name}
                      className="h-8 w-8 rounded-full border-2 border-white object-cover"
                    />
                  ) : (
                    <div
                      key={guest.id}
                      title={guest.name}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[var(--iron-100)] text-[10px] font-semibold text-[var(--ns-ink)]"
                    >
                      {guest.name.charAt(0)}
                    </div>
                  ),
                )}
              </div>
              <span className="ml-2 hidden text-sm text-[var(--iron-500)] sm:inline">
                {guests.length} guest{guests.length === 1 ? "" : "s"}
                {overflow > 0 ? ` · +${overflow}` : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="relative h-[110px] w-[110px] shrink-0 self-start overflow-hidden rounded-xl border border-[var(--iron-200)]/50 sm:h-[120px] sm:w-[120px] sm:self-center sm:rounded-2xl md:h-[150px] md:w-[150px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb}
            alt={trip.destination}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-2 pb-2 pt-8">
            <p className="truncate text-[11px] font-semibold text-white">
              {trip.destination}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function PinIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
