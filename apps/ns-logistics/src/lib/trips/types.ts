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
 * open — posted; time may still be fuzzy (Discord-style “Sat evening?”)
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
 * A trip is a lightweight ride post — not an event with a details page.
 * Join/create stay on the list; Discord carries notifications.
 */
export type Trip = {
  id: string;
  title: string;
  intent: TripIntent;
  status: TripStatus;
  source: TripLocation;
  destination: TripLocation;
  /** Departure (exact) or start of flexible window. */
  startsAt: string;
  /** Estimated arrival / end of flexible window. */
  endsAt: string;
  timePrecision: TimePrecision;
  /** Optional human label, e.g. "Saturday evening or Sunday night". */
  timeLabel: string;
  meetingPoint: string;
  notes: string;
  host: TripPerson;
  riders: TripPerson[];
  /** null = no seat limit (companions / looking together). */
  capacity: number | null;
  /** When someone joins, notify host (and later the rider group) on Discord. */
  notifyDiscord: boolean;
};

export type QuickRange = "all" | "today" | "tomorrow";
export type TimeMode = "upcoming" | "past";

export type TripFilters = {
  query: string;
  quickRange: QuickRange;
  corridor: TripCorridor | "all";
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
