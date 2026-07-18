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
 * open — posted; time may still be fuzzy
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
 * notes/meeting/seats live in an accordion. Discord is opt-in.
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
   * Short-lived Discord thread in #logistics, created only after host confirms.
   * Pattern: `{From}→{To} · {when} · {host}`
   */
  discordThreadUrl: string | null;
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
