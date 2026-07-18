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

export type Trip = {
  id: string;
  title: string;
  source: TripLocation;
  destination: TripLocation;
  startsAt: string; // ISO
  endsAt: string; // ISO
  meetingPoint: string;
  notes: string;
  host: TripPerson;
  guests: TripPerson[];
  capacity: number;
};

export type QuickRange = "all" | "today" | "tomorrow";
export type TimeMode = "upcoming" | "past";

export type TripFilters = {
  query: string;
  quickRange: QuickRange;
  source: TripLocation | "all";
  destination: TripLocation | "all";
  selectedDate: string | null; // YYYY-MM-DD
  timeMode: TimeMode;
  myTripsOnly: boolean;
};

export type TripStats = {
  upcoming: number;
  inProgressNext24h: number;
  expired: number;
  plannedTotal: number;
};
