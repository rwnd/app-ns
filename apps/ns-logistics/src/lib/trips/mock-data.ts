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
  artem: person("u1", "Artem Sharikov", 0x2970ff),
  maya: person("u2", "Maya Chen", 0x0ea5e9),
  leo: person("u3", "Leo Park", 0xf59e0b),
  sofia: person("u4", "Sofia Alvarez", 0x10b981),
  nate: person("u5", "Nate Brooks", 0xef4444),
  priya: person("u6", "Priya Shah", 0x6366f1),
  owen: person("u7", "Owen Lee", 0x14b8a6),
  jade: person("u8", "Jade Nguyen", 0xec4899),
  dan: person("u9", "Dan", 0x64748b),
  hari: person("u10", "hari2184", 0x0f766e),
};

export function createMockTrips(now = new Date()): Trip[] {
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const inTwo = addDays(today, 2);
  const saturday = (() => {
    const d = startOfDay(now);
    const day = d.getDay();
    const add = (6 - day + 7) % 7 || 7;
    return addDays(d, add);
  })();
  const sunday = addDays(saturday, 1);
  const yesterday = addDays(today, -1);
  const threeDaysAgo = addDays(today, -3);
  const tenDaysAgo = addDays(today, -10);

  const trips: Trip[] = [
    {
      id: "t-today-airport",
      status: "confirmed",
      source: "Network School",
      destination: "Changi Airport",
      startsAt: atHour(today, 11, 0).toISOString(),
      endsAt: atHour(today, 12, 30).toISOString(),
      timePrecision: "exact",
      timeLabel: "",
      transport: ["car"],
      meetingPoint: "NS Lobby",
      notes: "Van — 2 large bags ok.",
      host: people.artem,
      riders: [people.maya, people.leo, people.sofia],
      capacity: 8,
      discordThreadUrl:
        "https://discord.com/channels/stub/logistics/thread-t-today-airport",
    },
    {
      id: "t-sg-return-flex",
      status: "open",
      source: "Singapore",
      destination: "Network School",
      startsAt: atHour(saturday, 17, 0).toISOString(),
      endsAt: atHour(sunday, 23, 0).toISOString(),
      timePrecision: "flexible",
      timeLabel: "Saturday evening or Sunday night",
      transport: ["car", "bus"],
      meetingPoint: "",
      notes: "Happy to share Grab / bus.",
      host: people.dan,
      riders: [],
      capacity: null,
      discordThreadUrl: null,
    },
    {
      id: "t-tomorrow-sg",
      status: "confirmed",
      source: "Network School",
      destination: "Singapore",
      startsAt: atHour(tomorrow, 9, 0).toISOString(),
      endsAt: atHour(tomorrow, 21, 0).toISOString(),
      timePrecision: "exact",
      timeLabel: "",
      transport: ["car"],
      meetingPoint: "JB Sentral pickup",
      notes: "Transit via JB. Bring passport.",
      host: people.maya,
      riders: [people.artem, people.leo, people.priya],
      capacity: 6,
      discordThreadUrl:
        "https://discord.com/channels/stub/logistics/thread-t-tomorrow-sg",
    },
    {
      id: "t-tomorrow-return",
      status: "open",
      source: "Changi Airport",
      destination: "Network School",
      startsAt: atHour(tomorrow, 15, 0).toISOString(),
      endsAt: atHour(tomorrow, 16, 45).toISOString(),
      timePrecision: "exact",
      timeLabel: "",
      transport: ["car"],
      meetingPoint: "T3 Arrival Hall",
      notes: "Landing ~2:40pm. Room for 2 more.",
      host: people.leo,
      riders: [people.owen],
      capacity: 4,
      discordThreadUrl: null,
    },
    {
      id: "t-cohort-arrival",
      status: "open",
      source: "Changi Airport",
      destination: "Network School",
      startsAt: atHour(inTwo, 18, 0).toISOString(),
      endsAt: atHour(inTwo, 23, 0).toISOString(),
      timePrecision: "flexible",
      timeLabel: "Evening — landing window flexible",
      transport: ["bus", "car"],
      meetingPoint: "",
      notes: "Heading straight to Forest City after landing.",
      host: people.hari,
      riders: [people.jade],
      capacity: null,
      discordThreadUrl: null,
    },
    {
      id: "t-in-two-jb",
      status: "open",
      source: "Network School",
      destination: "JB Sentral",
      startsAt: atHour(inTwo, 14, 0).toISOString(),
      endsAt: atHour(inTwo, 16, 0).toISOString(),
      timePrecision: "exact",
      timeLabel: "",
      transport: ["bus"],
      meetingPoint: "NS Bike rack",
      notes: "Cold chain bags welcome.",
      host: people.priya,
      riders: [people.jade],
      capacity: 5,
      discordThreadUrl: null,
    },
    {
      id: "t-today-eco",
      status: "open",
      source: "Network School",
      destination: "Eco Botanica",
      startsAt: atHour(today, 17, 30).toISOString(),
      endsAt: atHour(today, 19, 30).toISOString(),
      timePrecision: "exact",
      timeLabel: "",
      transport: ["bus"],
      meetingPoint: "NS Gate",
      notes: "Casual pace. Back before dinner.",
      host: people.sofia,
      riders: [people.jade, people.owen],
      capacity: 12,
      discordThreadUrl: null,
    },
    {
      id: "t-yesterday-eco",
      status: "confirmed",
      source: "Network School",
      destination: "Eco Botanica",
      startsAt: atHour(yesterday, 16, 0).toISOString(),
      endsAt: atHour(yesterday, 18, 0).toISOString(),
      timePrecision: "exact",
      timeLabel: "",
      transport: ["bus"],
      meetingPoint: "NS Gate",
      notes: "Bring bug spray.",
      host: people.jade,
      riders: [people.leo, people.artem, people.priya],
      capacity: 10,
      discordThreadUrl: null,
    },
    {
      id: "t-three-ago-airport",
      status: "confirmed",
      source: "Changi Airport",
      destination: "Network School",
      startsAt: atHour(threeDaysAgo, 13, 0).toISOString(),
      endsAt: atHour(threeDaysAgo, 14, 45).toISOString(),
      timePrecision: "exact",
      timeLabel: "",
      transport: ["car"],
      meetingPoint: "T1 Arrival",
      notes: "Completed.",
      host: people.artem,
      riders: [people.sofia, people.nate],
      capacity: 4,
      discordThreadUrl: null,
    },
    {
      id: "t-ten-ago-sg",
      status: "confirmed",
      source: "Network School",
      destination: "Singapore",
      startsAt: atHour(tenDaysAgo, 10, 0).toISOString(),
      endsAt: atHour(tenDaysAgo, 20, 0).toISOString(),
      timePrecision: "exact",
      timeLabel: "",
      transport: ["car", "bus"],
      meetingPoint: "NS Lobby",
      notes: "Outside 7-day UI window.",
      host: people.maya,
      riders: [people.owen, people.jade],
      capacity: 6,
      discordThreadUrl: null,
    },
  ];

  const soon = new Date(now.getTime() + 90 * 60 * 1000);
  const soonEnd = new Date(soon.getTime() + 75 * 60 * 1000);
  trips.push({
    id: "t-soon-shuttle",
    status: "confirmed",
    source: "Network School",
    destination: "JB Sentral",
    startsAt: soon.toISOString(),
    endsAt: soonEnd.toISOString(),
    timePrecision: "exact",
    timeLabel: "",
    transport: ["car"],
    meetingPoint: "NS Lobby",
    notes: "Leaves in about 90 minutes.",
    host: people.nate,
    riders: [people.maya],
    capacity: 5,
    discordThreadUrl: null,
  });

  return trips;
}
