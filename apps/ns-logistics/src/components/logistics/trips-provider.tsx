"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { createMockTrips } from "@/lib/trips/mock-data";
import type { Trip, TripPerson, TripStatus } from "@/lib/trips/types";
import { isJoinable } from "@/lib/trips/filter";
import {
  DISCORD_THREADS_MOCK_ONLY,
  stubDiscordThreadUrl,
} from "@/lib/trips/discord";

type TripsContextValue = {
  trips: Trip[];
  addTrip: (trip: Trip) => void;
  toggleJoin: (tripId: string, person: TripPerson) => void;
  setStatus: (tripId: string, status: TripStatus) => void;
  attachMockThread: (tripId: string) => string | null;
  mockDiscordOnly: boolean;
};

const TripsContext = createContext<TripsContextValue | null>(null);

export function TripsProvider({ children }: { children: React.ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>(() => createMockTrips());

  const addTrip = useCallback((trip: Trip) => {
    setTrips((prev) => [trip, ...prev]);
  }, []);

  const toggleJoin = useCallback((tripId: string, person: TripPerson) => {
    setTrips((prev) =>
      prev.map((trip) => {
        if (trip.id !== tripId) return trip;
        if (trip.host.id === person.id) return trip;

        const joined = trip.riders.some((g) => g.id === person.id);
        if (joined) {
          return {
            ...trip,
            riders: trip.riders.filter((g) => g.id !== person.id),
            status: trip.status === "full" ? "open" : trip.status,
          };
        }

        if (!isJoinable(trip)) return trip;

        const nextRiders = [...trip.riders, person];
        const left =
          trip.capacity === null
            ? null
            : Math.max(trip.capacity - nextRiders.length, 0);

        return {
          ...trip,
          riders: nextRiders,
          status: left === 0 ? "full" : trip.status,
        };
      }),
    );
  }, []);

  const setStatus = useCallback((tripId: string, status: TripStatus) => {
    setTrips((prev) =>
      prev.map((trip) =>
        trip.id === tripId ? { ...trip, status } : trip,
      ),
    );
  }, []);

  const attachMockThread = useCallback((tripId: string) => {
    let url: string | null = null;
    setTrips((prev) =>
      prev.map((trip) => {
        if (trip.id !== tripId) return trip;
        url = stubDiscordThreadUrl(trip);
        return { ...trip, discordThreadUrl: url };
      }),
    );
    return url;
  }, []);

  const value = useMemo(
    () => ({
      trips,
      addTrip,
      toggleJoin,
      setStatus,
      attachMockThread,
      mockDiscordOnly: DISCORD_THREADS_MOCK_ONLY,
    }),
    [trips, addTrip, toggleJoin, setStatus, attachMockThread],
  );

  return (
    <TripsContext.Provider value={value}>{children}</TripsContext.Provider>
  );
}

export function useTrips() {
  const ctx = useContext(TripsContext);
  if (!ctx) {
    throw new Error("useTrips must be used within TripsProvider");
  }
  return ctx;
}
