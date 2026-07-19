"use client";

import { useMemo, useState } from "react";
import {
  CORRIDOR_PRESETS,
  LOCATIONS,
  MAX_PLAN_DAYS,
  TRANSPORT_MODES,
} from "@/lib/trips/constants";
import {
  addDays,
  formatClock,
  parseDateKey,
  toDateKey,
  toDatetimeLocalValue,
} from "@/lib/trips/dates";
import { isWithinPlanWindow } from "@/lib/trips/filter";
import { KNOWN_PLACES, parsePlaceName, placeEquals } from "@/lib/trips/places";
import type { TransportMode, Trip, TripPerson } from "@/lib/trips/types";
import { PlaceAutocomplete } from "./place-autocomplete";

type CreateTripModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (trip: Trip) => void;
  host: TripPerson;
  /** Extra place suggestions (e.g. popular from the board). */
  placeSuggestions?: string[];
};

function defaultWhen(): { day: string; time: string } {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 60, 0, 0);
  const local = toDatetimeLocalValue(d);
  const [day, time] = local.split("T") as [string, string];
  return { day, time };
}

export function CreateTripModal({
  open,
  onClose,
  onCreate,
  host,
  placeSuggestions = [],
}: CreateTripModalProps) {
  const maxDay = useMemo(() => toDateKey(addDays(new Date(), MAX_PLAN_DAYS)), []);
  const minDay = useMemo(() => toDateKey(new Date()), []);
  const initial = useMemo(() => defaultWhen(), []);

  const [source, setSource] = useState("Network School");
  const [destination, setDestination] = useState("Changi Airport");
  const [day, setDay] = useState(initial.day);
  const [time, setTime] = useState(initial.time);
  const [flexible, setFlexible] = useState(false);
  const [transport, setTransport] = useState<TransportMode[]>(["car"]);
  const [notes, setNotes] = useState("");
  const [capacity, setCapacity] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const suggestions = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const place of [...placeSuggestions, ...KNOWN_PLACES, ...LOCATIONS]) {
      if (!seen.has(place)) {
        seen.add(place);
        list.push(place);
      }
    }
    return list;
  }, [placeSuggestions]);

  if (!open) return null;

  function applyPreset(presetId: string) {
    const preset = CORRIDOR_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSource(preset.source);
    setDestination(preset.destination);
  }

  function toggleTransport(mode: TransportMode) {
    setTransport((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const from = parsePlaceName(source);
    if (!from.ok) {
      setError(`From: ${from.error}`);
      return;
    }
    const to = parsePlaceName(destination);
    if (!to.ok) {
      setError(`To: ${to.error}`);
      return;
    }
    if (placeEquals(from.value, to.value)) {
      setError("Source and destination must be different.");
      return;
    }

    const base = parseDateKey(day);
    if (Number.isNaN(base.getTime())) {
      setError("Pick a valid date.");
      return;
    }
    const timeMatch = /^(\d{2}):(\d{2})$/.exec(time.trim());
    if (!timeMatch) {
      setError("Pick a valid time.");
      return;
    }
    const start = new Date(base);
    start.setHours(Number(timeMatch[1]), Number(timeMatch[2]), 0, 0);
    if (!isWithinPlanWindow(start)) {
      setError(
        `Time must be from now up to ${MAX_PLAN_DAYS} days ahead.`,
      );
      return;
    }

    const end = flexible
      ? new Date(start.getTime() + 3 * 60 * 60 * 1000)
      : new Date(start.getTime() + 90 * 60 * 1000);

    const weekday = start.toLocaleDateString("en-US", { weekday: "long" });
    const clock = formatClock(start.toISOString());
    const timeLabel = flexible ? `${weekday} around ${clock}` : "";

    const seats =
      capacity.trim() !== "" ? Math.max(1, Number(capacity)) : null;
    if (capacity.trim() !== "" && Number.isNaN(seats)) {
      setError("Seats must be a number, or leave blank.");
      return;
    }

    const trip: Trip = {
      id: `t-${Date.now()}`,
      status: "open",
      source: from.value,
      destination: to.value,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      timePrecision: flexible ? "flexible" : "exact",
      timeLabel,
      transport: [...transport],
      meetingPoint: "",
      notes: notes.trim(),
      host,
      riders: [],
      capacity: seats,
      discordThreadUrl: null,
    };

    onCreate(trip);
    onClose();
    const next = defaultWhen();
    setNotes("");
    setCapacity("");
    setTransport(["car"]);
    setFlexible(false);
    setDay(next.day);
    setTime(next.time);
    setError(null);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/35 p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--iron-200)] bg-white p-5 shadow-sm md:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[var(--ns-ink)]">
              Post a trip
            </h2>
            <p className="mt-1 text-sm text-[var(--iron-500)]">
              Route, when, and notes. Type any place — suggestions help.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[var(--iron-500)] hover:bg-[var(--iron-100)]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-sm font-medium text-[var(--ns-ink)]">
              Popular routes
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CORRIDOR_PRESETS.map((preset) => {
                const active =
                  placeEquals(source, preset.source) &&
                  placeEquals(destination, preset.destination);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    className={[
                      "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                      active
                        ? "bg-[var(--accent-soft)] text-[var(--accent-hover)]"
                        : "bg-[var(--iron-50)] text-[var(--ns-ink)] ring-1 ring-[var(--iron-200)] hover:bg-white",
                    ].join(" ")}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PlaceAutocomplete
              id="trip-from"
              label="From"
              value={source}
              onChange={setSource}
              suggestions={suggestions}
              placeholder="Network School"
            />
            <PlaceAutocomplete
              id="trip-to"
              label="To"
              value={destination}
              onChange={setDestination}
              suggestions={suggestions}
              placeholder="Changi Airport"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Date">
              <input
                type="date"
                value={day}
                min={minDay}
                max={maxDay}
                onChange={(e) => setDay(e.target.value)}
                required
                className="field-input"
              />
            </Field>
            <Field label="Time">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="field-input"
              />
            </Field>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[var(--iron-200)] bg-[var(--iron-50)] px-3 py-2.5 text-sm">
            <input
              type="checkbox"
              checked={flexible}
              onChange={(e) => setFlexible(e.target.checked)}
              className="h-4 w-4 accent-[var(--ns-ink)]"
            />
            <span>
              <span className="font-medium text-[var(--ns-ink)]">
                Time is flexible
              </span>
              <span className="mt-0.5 block text-xs text-[var(--iron-500)]">
                Treat the clock time as approximate — around then is fine.
              </span>
            </span>
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="mb-1.5 text-sm font-medium text-[var(--ns-ink)]">
                Transport
              </p>
              <div className="flex flex-wrap gap-1.5">
                {TRANSPORT_MODES.map((mode) => {
                  const active = transport.includes(mode.id);
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => toggleTransport(mode.id)}
                      className={[
                        "rounded-full px-3 py-1.5 text-sm font-semibold transition",
                        active
                          ? "bg-[var(--ns-ink)] text-white"
                          : "bg-white text-[var(--ns-ink)] ring-1 ring-[var(--iron-200)] hover:bg-[var(--iron-50)]",
                      ].join(" ")}
                    >
                      {mode.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <Field label="Seats">
              <input
                type="number"
                min={1}
                max={20}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="No limit"
                className="field-input sm:w-28"
              />
            </Field>
          </div>

          <Field label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Details — meet at NS Gate, bags ok, share Grab, landing window…"
              className="field-input resize-none"
            />
          </Field>
        </div>

        {error ? (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-semibold text-[var(--ns-ink)] hover:bg-[var(--iron-100)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-[var(--ns-ink)] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1f2937]"
          >
            Post trip
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-[var(--ns-ink)]">{label}</span>
      {children}
    </label>
  );
}
