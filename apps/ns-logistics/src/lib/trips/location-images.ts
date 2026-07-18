import type { TripLocation } from "@/lib/trips/types";

/**
 * Destination thumbnails — Unsplash photos of each place.
 * Sized for card use (~400px wide).
 */
const LOCATION_IMAGES: Record<TripLocation, string> = {
  "Network School":
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&h=400&q=80",
  "Changi Airport":
    "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=400&h=400&q=80",
  "Eco Botanica":
    "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&h=400&q=80",
  Singapore:
    "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=400&h=400&q=80",
  "JB Sentral":
    "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=400&h=400&q=80",
};

export function destinationImageUrl(destination: TripLocation): string {
  return LOCATION_IMAGES[destination];
}
