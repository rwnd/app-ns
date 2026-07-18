"use client";

import { formatTimeRange } from "@/lib/trips/dates";
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

  return (
    <article className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:p-5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-gray-600">
            {formatTimeRange(trip.startsAt, trip.endsAt)}
          </p>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
            {trip.source} → {trip.destination}
          </span>
        </div>

        <h3 className="mt-2 text-lg font-semibold text-gray-900 md:text-xl">
          {trip.title}
        </h3>

        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
          {trip.host.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={trip.host.image}
              alt=""
              className="h-5 w-5 rounded-full object-cover"
            />
          ) : null}
          <span>
            by <span className="font-medium text-gray-800">{trip.host.name}</span>
          </span>
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
          <PinIcon />
          <span>{trip.meetingPoint}</span>
        </div>

        {trip.notes ? (
          <p className="mt-2 line-clamp-2 text-sm text-gray-500">{trip.notes}</p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {!isPast ? (
            <button
              type="button"
              onClick={() => onToggleJoin(trip.id)}
              className={
                joined
                  ? "rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
                  : "rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
              }
            >
              {joined ? "Joined" : "+ Join"}
            </button>
          ) : (
            <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-500">
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
                    className="h-7 w-7 rounded-full border-2 border-white object-cover"
                  />
                ) : (
                  <div
                    key={guest.id}
                    title={guest.name}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-[10px] font-semibold text-gray-700"
                  >
                    {guest.name.charAt(0)}
                  </div>
                ),
              )}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {guests.length} guest{guests.length === 1 ? "" : "s"}
              {overflow > 0 ? ` · +${overflow}` : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="hidden w-28 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 sm:block md:w-36">
        <div className="flex h-full min-h-[120px] flex-col items-center justify-center p-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            Route
          </p>
          <p className="mt-1 text-xs font-semibold text-gray-800">{trip.source}</p>
          <p className="my-1 text-gray-400">↓</p>
          <p className="text-xs font-semibold text-gray-800">{trip.destination}</p>
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
