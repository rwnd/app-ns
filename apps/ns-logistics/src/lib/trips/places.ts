import type { Trip } from "@/lib/trips/types";

/**
 * Canonical hubs. Matching against these is always case-sensitive (regex, no `i`).
 */
export const KNOWN_PLACES = [
  "Network School",
  "Changi Airport",
  "Eco Botanica",
  "Singapore",
  "JB Sentral",
] as const;

export type KnownPlace = (typeof KNOWN_PLACES)[number];

/** Place labels: Title-ish, letters/numbers, limited separators. Case-sensitive. */
export const PLACE_NAME_PATTERN =
  /^[A-Z][A-Za-z0-9]*(?:[ .'\-][A-Za-z0-9]+)*$/;

export const POPULAR_PLACE_MIN = 3;
export const POPULAR_PLACE_MAX = 5;

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Trim + collapse whitespace. Does not change letter case. */
export function formatPlaceName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

/**
 * Case-sensitive equality via anchored RegExp (no `i` flag).
 * "Singapore" ≠ "singapore".
 */
export function placeEquals(a: string, b: string): boolean {
  const left = formatPlaceName(a);
  const right = formatPlaceName(b);
  if (!left || !right) return false;
  return new RegExp(`^${escapeRegExp(right)}$`).test(left);
}

/**
 * Case-sensitive: does this trip touch `place` as source or destination?
 */
export function tripTouchesPlace(
  trip: Pick<Trip, "source" | "destination">,
  place: string,
): boolean {
  return placeEquals(trip.source, place) || placeEquals(trip.destination, place);
}

export type ParsePlaceResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

/** Soft title-case for free-typed places (keeps existing capitals). */
export function softTitleCasePlace(raw: string): string {
  return formatPlaceName(raw).replace(/\b([a-z])/g, (ch) => ch.toUpperCase());
}

/**
 * Validate + format a place for save. Canonicalizes to KNOWN_PLACES on
 * case-sensitive exact match; otherwise accepts new names that pass the regex.
 * Free-typed input is soft title-cased when needed.
 */
export function parsePlaceName(
  raw: string,
  knownPlaces: readonly string[] = KNOWN_PLACES,
): ParsePlaceResult {
  let formatted = formatPlaceName(raw);
  if (!formatted) {
    return { ok: false, error: "Place is required." };
  }
  if (formatted.length > 48) {
    return { ok: false, error: "Place name must be 48 characters or fewer." };
  }

  for (const known of knownPlaces) {
    if (placeEquals(formatted, known)) {
      return { ok: true, value: known };
    }
  }

  if (!PLACE_NAME_PATTERN.test(formatted)) {
    formatted = softTitleCasePlace(formatted);
  }

  if (!PLACE_NAME_PATTERN.test(formatted)) {
    return {
      ok: false,
      error:
        "Place must use letters, numbers, spaces, or .' - only (e.g. Changi Airport).",
    };
  }

  for (const known of knownPlaces) {
    if (placeEquals(formatted, known)) {
      return { ok: true, value: known };
    }
  }

  return { ok: true, value: formatted };
}

export type PopularPlace = {
  place: string;
  count: number;
};

/**
 * Top places by frequency in the trip store (source + destination).
 * Returns between 0 and `limit` entries (callers use 3–5).
 * Keys are case-sensitive after format/canonicalize.
 */
export function popularPlacesFromTrips(
  trips: readonly Pick<Trip, "source" | "destination" | "status">[],
  limit: number = POPULAR_PLACE_MAX,
): PopularPlace[] {
  const capped = Math.min(POPULAR_PLACE_MAX, Math.max(1, limit));
  const counts = new Map<string, number>();

  for (const trip of trips) {
    if (trip.status === "cancelled") continue;
    for (const raw of [trip.source, trip.destination]) {
      const parsed = parsePlaceName(raw);
      if (!parsed.ok) continue;
      counts.set(parsed.value, (counts.get(parsed.value) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([place, count]) => ({ place, count }))
    .sort((a, b) => b.count - a.count || a.place.localeCompare(b.place))
    .slice(0, capped);
}
