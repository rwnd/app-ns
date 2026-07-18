import type {
  TimeWindow,
  TripCorridor,
  TripLocation,
} from "@/lib/trips/types";

export const MAX_PLAN_DAYS = 45;
export const PAST_VISIBLE_DAYS = 7;

export const LOCATIONS: TripLocation[] = [
  "Network School",
  "Changi Airport",
  "Eco Botanica",
  "Singapore",
  "JB Sentral",
];

/** One-tap corridors that match real Discord traffic. */
export const CORRIDOR_PRESETS: {
  id: string;
  label: string;
  corridor: TripCorridor;
  source: TripLocation;
  destination: TripLocation;
}[] = [
  {
    id: "ns-changi",
    label: "NS → Changi",
    corridor: "airport",
    source: "Network School",
    destination: "Changi Airport",
  },
  {
    id: "changi-ns",
    label: "Changi → NS",
    corridor: "airport",
    source: "Changi Airport",
    destination: "Network School",
  },
  {
    id: "ns-sg",
    label: "NS → Singapore",
    corridor: "singapore",
    source: "Network School",
    destination: "Singapore",
  },
  {
    id: "sg-ns",
    label: "Singapore → NS",
    corridor: "singapore",
    source: "Singapore",
    destination: "Network School",
  },
  {
    id: "ns-jb",
    label: "NS → JB Sentral",
    corridor: "local",
    source: "Network School",
    destination: "JB Sentral",
  },
  {
    id: "ns-eco",
    label: "NS → Eco Botanica",
    corridor: "local",
    source: "Network School",
    destination: "Eco Botanica",
  },
];

export const TIME_WINDOWS: {
  id: TimeWindow;
  label: string;
  startHour: number;
  endHour: number;
}[] = [
  { id: "morning", label: "Morning", startHour: 6, endHour: 12 },
  { id: "afternoon", label: "Afternoon", startHour: 12, endHour: 17 },
  { id: "evening", label: "Evening", startHour: 17, endHour: 21 },
  { id: "night", label: "Night", startHour: 21, endHour: 24 },
];

export const DISCORD_BLURPLE = "#5865F2";
export const DISCORD_BLURPLE_HOVER = "#4752C4";

export function tripCorridor(
  source: TripLocation,
  destination: TripLocation,
): TripCorridor {
  if (source === "Changi Airport" || destination === "Changi Airport") {
    return "airport";
  }
  if (source === "Singapore" || destination === "Singapore") {
    return "singapore";
  }
  return "local";
}
