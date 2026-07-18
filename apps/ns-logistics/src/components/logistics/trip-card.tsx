"use client";

import { formatTripWhen } from "@/lib/trips/dates";
import { isJoinable, seatsLeft } from "@/lib/trips/filter";
import { destinationImageUrl } from "@/lib/trips/location-images";
import type { Trip, TripStatus } from "@/lib/trips/types";

type TripCardProps = {
  trip: Trip;
  currentUserId: string;
  onToggleJoin: (tripId: string) => void;
  onSetStatus: (tripId: string, status: TripStatus) => void;
  isPast?: boolean;
  flash?: string | null;
};

const STATUS_STYLES: Record<TripStatus, string> = {
  open: "bg-[var(--accent-soft)] text-[var(--accent-hover)]",
  confirmed: "bg-emerald-50 text-emerald-700",
  full: "bg-[var(--iron-100)] text-[var(--iron-500)]",
  cancelled: "bg-red-50 text-red-600",
};

export function TripCard({
  trip,
  currentUserId,
  onToggleJoin,
  onSetStatus,
  isPast = false,
  flash = null,
}: TripCardProps) {
  const isHost = trip.host.id === currentUserId;
  const joined =
    isHost || trip.riders.some((g) => g.id === currentUserId);
  const riders = trip.riders;
  const visible = riders.slice(0, 4);
  const overflow = Math.max(riders.length - visible.length, 0);
  const thumb = destinationImageUrl(trip.destination);
  const left = seatsLeft(trip);
  const showJoinControl =
    !isPast && !isHost && (joined || isJoinable(trip));

  return (
    <article className="trip-enter overflow-hidden rounded-2xl border border-[var(--iron-200)] bg-white p-3 transition-shadow hover:shadow-sm sm:p-4 md:p-5">
      <div className="flex gap-3 sm:gap-5">
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-[var(--iron-500)]">
                {formatTripWhen(trip)}
              </p>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize",
                  STATUS_STYLES[trip.status],
                ].join(" ")}
              >
                {trip.status}
              </span>
              <span className="rounded-full bg-[var(--iron-50)] px-2 py-0.5 text-[11px] font-semibold text-[var(--iron-500)]">
                {trip.intent === "offer" ? "Offering" : "Looking"}
              </span>
              {trip.timePrecision === "flexible" ? (
                <span className="rounded-full bg-[var(--iron-50)] px-2 py-0.5 text-[11px] font-semibold text-[var(--iron-500)]">
                  Flexible
                </span>
              ) : null}
            </div>

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
                <span className="font-medium text-[var(--ns-ink)]">
                  {trip.host.name}
                </span>
                <span className="text-[var(--iron-400)]">
                  {" "}
                  · {trip.source} → {trip.destination}
                </span>
              </span>
            </div>

            {trip.meetingPoint ? (
              <div className="mt-1.5 flex items-center gap-1.5 text-sm text-[var(--iron-500)]">
                <PinIcon />
                <span>{trip.meetingPoint}</span>
              </div>
            ) : null}

            {trip.notes ? (
              <p className="mt-2 line-clamp-2 text-sm text-[var(--iron-400)]">
                {trip.notes}
              </p>
            ) : null}

            {flash ? (
              <p className="mt-2 rounded-lg bg-[var(--accent-soft)] px-2.5 py-1.5 text-xs font-medium text-[var(--accent-hover)]">
                {flash}
              </p>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {showJoinControl ? (
              <button
                type="button"
                onClick={() => onToggleJoin(trip.id)}
                className={
                  joined
                    ? "rounded-full border border-[var(--iron-300)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ns-ink)] transition hover:bg-[var(--iron-50)]"
                    : "rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
                }
              >
                {joined ? "I'm in ✓" : "I'm in"}
              </button>
            ) : null}

            {!isPast && isHost ? (
              <>
                {trip.status === "open" ? (
                  <button
                    type="button"
                    onClick={() => onSetStatus(trip.id, "confirmed")}
                    className="rounded-full border border-[var(--iron-300)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ns-ink)] hover:bg-[var(--iron-50)]"
                  >
                    Confirm time
                  </button>
                ) : null}
                {trip.status !== "full" && trip.status !== "cancelled" ? (
                  <button
                    type="button"
                    onClick={() => onSetStatus(trip.id, "full")}
                    className="rounded-full px-3 py-2 text-sm font-semibold text-[var(--iron-500)] hover:bg-[var(--iron-50)]"
                  >
                    Mark full
                  </button>
                ) : null}
                {trip.status !== "cancelled" ? (
                  <button
                    type="button"
                    onClick={() => onSetStatus(trip.id, "cancelled")}
                    className="rounded-full px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50"
                  >
                    Cancel
                  </button>
                ) : null}
              </>
            ) : null}

            {isPast ? (
              <span className="rounded-full bg-[var(--iron-100)] px-4 py-2 text-sm font-semibold text-[var(--iron-500)]">
                Ended
              </span>
            ) : null}

            {!isPast && !showJoinControl && !isHost && trip.status === "full" ? (
              <span className="rounded-full bg-[var(--iron-100)] px-4 py-2 text-sm font-semibold text-[var(--iron-500)]">
                Full
              </span>
            ) : null}

            <div className="flex items-center">
              <div className="flex -space-x-2">
                {visible.map((rider) =>
                  rider.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={rider.id}
                      src={rider.image}
                      alt={rider.name}
                      title={rider.name}
                      className="h-8 w-8 rounded-full border-2 border-white object-cover"
                    />
                  ) : (
                    <div
                      key={rider.id}
                      title={rider.name}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[var(--iron-100)] text-[10px] font-semibold text-[var(--ns-ink)]"
                    >
                      {rider.name.charAt(0)}
                    </div>
                  ),
                )}
              </div>
              <span className="ml-2 text-sm text-[var(--iron-500)]">
                {riders.length} in
                {left !== null ? ` · ${left} seat${left === 1 ? "" : "s"} left` : ""}
                {overflow > 0 ? ` · +${overflow}` : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="relative h-[110px] w-[110px] shrink-0 self-start overflow-hidden rounded-xl border border-[var(--iron-200)]/50 sm:h-[120px] sm:w-[120px] sm:self-center sm:rounded-2xl md:h-[140px] md:w-[140px]">
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
