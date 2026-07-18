import { addDays, startOfDay } from "@/lib/trips/dates";
import type { Trip, TripPerson } from "@/lib/trips/types";

function atHour(base: Date, hour: number, minute = 0): Date {
  const d = startOfDay(base);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function person(id: string, name: string, hue: number): TripPerson {
  return {
    id,
    name,
    image: `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(name)}&backgroundColor=${hue.toString(16).padStart(6, "0")}`,
  };
}

const people = {
  artem: person("u1", "Artem Sharikov", 0x7c3aed),
  maya: person("u2", "Maya Chen", 0x0ea5e9),
  leo: person("u3", "Leo Park", 0xf59e0b),
  sofia: person("u4", "Sofia Alvarez", 0x10b981),
  nate: person("u5", "Nate Brooks", 0xef4444),
  priya: person("u6", "Priya Shah", 0x6366f1),
  owen: person("u7", "Owen Lee", 0x14b8a6),
  jade: person("u8", "Jade Nguyen", 0xec4899),
};

export function createMockTrips(now = new Date()): Trip[] {
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const inTwo = addDays(today, 2);
  const inFive = addDays(today, 5);
  const inTwelve = addDays(today, 12);
  const yesterday = addDays(today, -1);
  const threeDaysAgo = addDays(today, -3);
  const tenDaysAgo = addDays(today, -10);
  const twentyDaysAgo = addDays(today, -20);

  const trips: Trip[] = [
    {
      id: "t-today-airport",
      title: "Airport run → Changi",
      source: "Network School",
      destination: "Changi Airport",
      startsAt: atHour(today, 11, 0).toISOString(),
      endsAt: atHour(today, 12, 30).toISOString(),
      meetingPoint: "NS Lobby",
      notes: "Grab seats in the van — 2 large bags ok.",
      host: people.artem,
      guests: [people.maya, people.leo, people.sofia, people.nate, people.priya],
      capacity: 8,
    },
    {
      id: "t-today-eco",
      title: "Evening walk to Eco Botanica",
      source: "Network School",
      destination: "Eco Botanica",
      startsAt: atHour(today, 17, 30).toISOString(),
      endsAt: atHour(today, 19, 30).toISOString(),
      meetingPoint: "NS Gate",
      notes: "Casual pace. Back before dinner.",
      host: people.sofia,
      guests: [people.jade, people.owen],
      capacity: 12,
    },
    {
      id: "t-tomorrow-sg",
      title: "Singapore day trip",
      source: "Network School",
      destination: "Singapore",
      startsAt: atHour(tomorrow, 9, 0).toISOString(),
      endsAt: atHour(tomorrow, 21, 0).toISOString(),
      meetingPoint: "JB Sentral pickup",
      notes: "Transit via JB. Bring passport.",
      host: people.maya,
      guests: [people.artem, people.leo, people.priya, people.nate],
      capacity: 6,
    },
    {
      id: "t-tomorrow-return",
      title: "Return from Changi",
      source: "Changi Airport",
      destination: "Network School",
      startsAt: atHour(tomorrow, 15, 0).toISOString(),
      endsAt: atHour(tomorrow, 16, 45).toISOString(),
      meetingPoint: "T3 Arrival Hall",
      notes: "Look for NS Logistics sign.",
      host: people.leo,
      guests: [people.owen],
      capacity: 4,
    },
    {
      id: "t-in-two-jb",
      title: "JB Sentral grocery haul",
      source: "Network School",
      destination: "JB Sentral",
      startsAt: atHour(inTwo, 14, 0).toISOString(),
      endsAt: atHour(inTwo, 16, 0).toISOString(),
      meetingPoint: "NS Bike rack",
      notes: "Cold chain bags welcome.",
      host: people.priya,
      guests: [people.jade],
      capacity: 5,
    },
    {
      id: "t-in-five-airport",
      title: "Early flight departure",
      source: "Network School",
      destination: "Changi Airport",
      startsAt: atHour(inFive, 5, 30).toISOString(),
      endsAt: atHour(inFive, 7, 0).toISOString(),
      meetingPoint: "NS Lobby",
      notes: "Quiet cabin. No music.",
      host: people.nate,
      guests: [],
      capacity: 3,
    },
    {
      id: "t-in-twelve-sg",
      title: "Investor coffee in town",
      source: "Singapore",
      destination: "Network School",
      startsAt: atHour(inTwelve, 18, 0).toISOString(),
      endsAt: atHour(inTwelve, 20, 0).toISOString(),
      meetingPoint: "Woodlands Checkpoint",
      notes: "Ride share back after coffee.",
      host: people.owen,
      guests: [people.maya, people.sofia],
      capacity: 4,
    },
    {
      id: "t-yesterday-eco",
      title: "Sunset at Eco Botanica",
      source: "Network School",
      destination: "Eco Botanica",
      startsAt: atHour(yesterday, 16, 0).toISOString(),
      endsAt: atHour(yesterday, 18, 0).toISOString(),
      meetingPoint: "NS Gate",
      notes: "Bring bug spray.",
      host: people.jade,
      guests: [people.leo, people.artem, people.priya],
      capacity: 10,
    },
    {
      id: "t-three-ago-airport",
      title: "Arrival pickup",
      source: "Changi Airport",
      destination: "Network School",
      startsAt: atHour(threeDaysAgo, 13, 0).toISOString(),
      endsAt: atHour(threeDaysAgo, 14, 45).toISOString(),
      meetingPoint: "T1 Arrival",
      notes: "Completed.",
      host: people.artem,
      guests: [people.sofia, people.nate],
      capacity: 4,
    },
    {
      id: "t-ten-ago-sg",
      title: "Old Singapore loop",
      source: "Network School",
      destination: "Singapore",
      startsAt: atHour(tenDaysAgo, 10, 0).toISOString(),
      endsAt: atHour(tenDaysAgo, 20, 0).toISOString(),
      meetingPoint: "NS Lobby",
      notes: "Outside 7-day UI window — stats only.",
      host: people.maya,
      guests: [people.owen, people.jade],
      capacity: 6,
    },
    {
      id: "t-twenty-ago",
      title: "Archive airport shuttle",
      source: "Network School",
      destination: "Changi Airport",
      startsAt: atHour(twentyDaysAgo, 8, 0).toISOString(),
      endsAt: atHour(twentyDaysAgo, 9, 30).toISOString(),
      meetingPoint: "NS Lobby",
      notes: "Archived trip for stats.",
      host: people.leo,
      guests: [people.priya],
      capacity: 4,
    },
  ];

  // Ensure a trip is "in progress" for the next 24h window if current time is daytime
  const soon = new Date(now.getTime() + 90 * 60 * 1000);
  const soonEnd = new Date(soon.getTime() + 75 * 60 * 1000);
  trips.push({
    id: "t-soon-shuttle",
    title: "Rolling shuttle to JB Sentral",
    source: "Network School",
    destination: "JB Sentral",
    startsAt: soon.toISOString(),
    endsAt: soonEnd.toISOString(),
    meetingPoint: "NS Lobby",
    notes: "Leaves in about 90 minutes.",
    host: people.nate,
    guests: [people.maya],
    capacity: 5,
  });

  return trips;
}
