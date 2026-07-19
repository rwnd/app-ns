import { popularPlacesFromTrips, type PopularPlace } from "@/lib/trips/places";
import type { Trip } from "@/lib/trips/types";

/**
 * Read-side helpers over the trip store (in-memory today; swap for SQL later).
 * Popular chips are grepped from place frequency — case-sensitive keys.
 */
export function listPopularPlaces(
  trips: readonly Trip[],
  limit = 5,
): PopularPlace[] {
  return popularPlacesFromTrips(trips, limit);
}
