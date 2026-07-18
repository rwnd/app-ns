export type TripPerson = {
  id: string;
  name: string;
  image?: string | null;
};

export type TripLocation =
  | "Network School"
  | "Changi Airport"
  | "Eco Botanica"
  | "Singapore"
  | "JB Sentral";

/** Offering seats/vehicle vs looking for companions / a ride. */
export type TripIntent = "offer" | "request";

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

/**
 * Lightweight ride post. Route + when + how are primary;
 * notes/meeting/seats live in an accordion. Discord is opt-in (mock for now).
 */
export type Trip = {
  id: string;
  intent: TripIntent;
  status: TripStatus;
  source: TripLocation;
  destination: TripLocation;
  startsAt: string;
  endsAt: string;
  timePrecision: TimePrecision;
  timeLabel: string;
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

export type TimeMode = "upcoming" | "past";

export type TripFilters = {
  query: string;
  corridor: TripCorridor | "all";
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
