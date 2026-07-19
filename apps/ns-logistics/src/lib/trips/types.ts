export type TripPerson = {
  id: string;
  name: string;
  image?: string | null;
};

/** Validated place label (see parsePlaceName). Not a free-form blob. */
export type TripLocation = string;

/**
 * open — tentative; time may still move
 * confirmed — host locked departure
 * full — no more riders
 * cancelled — called off
 */
export type TripStatus = "open" | "confirmed" | "full" | "cancelled";

/** exact clock time vs flexible window (morning / evening / night). */
export type TimePrecision = "exact" | "flexible";

export type TimeWindow = "morning" | "afternoon" | "evening" | "night";

export type TripCorridor = "airport" | "singapore" | "local";

/** How people move — multi-select; both = either/flexible. Empty = unspecified. */
export type TransportMode = "car" | "bus";

/**
 * Lightweight ride post. Route + when + how are primary;
 * notes/meeting/seats live in an accordion. Discord is opt-in (mock for now).
 * No offer/request split — one trip, optional seats, optional transport.
 */
export type Trip = {
  id: string;
  status: TripStatus;
  source: TripLocation;
  destination: TripLocation;
  startsAt: string;
  endsAt: string;
  timePrecision: TimePrecision;
  timeLabel: string;
  /** Empty = unspecified; both car+bus = either is fine. */
  transport: TransportMode[];
  meetingPoint: string;
  notes: string;
  host: TripPerson;
  riders: TripPerson[];
  /** null = no seat limit. */
  capacity: number | null;
  /**
   * Mock or real Discord thread URL. Created only after host confirms share.
   * With DISCORD_THREADS_MOCK_ONLY, this is a stub link only.
   */
  discordThreadUrl: string | null;
};

export function formatTransport(transport: TransportMode[]): string | null {
  if (transport.length === 0) return null;
  const hasCar = transport.includes("car");
  const hasBus = transport.includes("bus");
  if (hasCar && hasBus) return "Car / bus";
  if (hasCar) return "Car";
  if (hasBus) return "Bus";
  return null;
}

export type TimeMode = "upcoming" | "past";

export type TripFilters = {
  query: string;
  /**
   * Popular place chip — case-sensitive exact place name, or null for any.
   * Matched with anchored RegExp (no `i` flag) against source/destination.
   */
  place: string | null;
  /** Filter to trips that include this mode. "all" = any. */
  transport: TransportMode | "all";
  /** YYYY-MM-DD or null for any day */
  selectedDate: string | null;
  timeMode: TimeMode;
  myTripsOnly: boolean;
};

export type TripStats = {
  upcoming: number;
  inProgressNext24h: number;
  open: number;
  plannedTotal: number;
};

/** Chip shown on the board: tentative | confirmed | flexible | full | cancelled */
export type TripStatusChip =
  | "tentative"
  | "confirmed"
  | "flexible"
  | "full"
  | "cancelled";

export function tripStatusChip(trip: Trip): TripStatusChip {
  if (trip.status === "cancelled") return "cancelled";
  if (trip.status === "full") return "full";
  if (trip.timePrecision === "flexible") return "flexible";
  if (trip.status === "confirmed") return "confirmed";
  return "tentative";
}
