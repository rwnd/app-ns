"use client";

import { useMemo, useState } from "react";
import { LOCATIONS, MAX_PLAN_DAYS } from "@/lib/trips/constants";
import { addDays, endOfDay } from "@/lib/trips/dates";
import { isWithinPlanWindow } from "@/lib/trips/filter";
import type { Trip, TripLocation, TripPerson } from "@/lib/trips/types";

type CreateTripModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (trip: Trip) => void;
  host: TripPerson;
};

export function CreateTripModal({
  open,
  onClose,
  onCreate,
  host,
}: CreateTripModalProps) {
  const maxDate = useMemo(() => {
    const d = endOfDay(addDays(new Date(), MAX_PLAN_DAYS));
    return d.toISOString().slice(0, 16);
  }, []);
  const minDate = useMemo(() => new Date().toISOString().slice(0, 16), []);

  const [title, setTitle] = useState("");
  const [source, setSource] = useState<TripLocation>("Network School");
  const [destination, setDestination] =
    useState<TripLocation>("Changi Airport");
  const [startsAt, setStartsAt] = useState(minDate);
  const [endsAt, setEndsAt] = useState("");
  const [meetingPoint, setMeetingPoint] = useState("NS Lobby");
  const [notes, setNotes] = useState("");
  const [capacity, setCapacity] = useState(6);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const start = new Date(startsAt);
    if (!isWithinPlanWindow(start)) {
      setError(`Trips can only be planned up to ${MAX_PLAN_DAYS} days in advance.`);
      return;
    }
    if (source === destination) {
      setError("Source and destination must be different.");
      return;
    }

    const end = endsAt
      ? new Date(endsAt)
      : new Date(start.getTime() + 90 * 60 * 1000);
    if (end.getTime() <= start.getTime()) {
      setError("End time must be after start time.");
      return;
    }

    const trip: Trip = {
      id: `t-${Date.now()}`,
      title: title.trim() || `${source} → ${destination}`,
      source,
      destination,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      meetingPoint: meetingPoint.trim() || "TBD",
      notes: notes.trim(),
      host,
      guests: [],
      capacity,
    };

    onCreate(trip);
    onClose();
    setTitle("");
    setNotes("");
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl md:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900">
              Create trip
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Plan up to {MAX_PLAN_DAYS} days ahead.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <Field label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Airport run → Changi"
              className="field-input"
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Source">
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as TripLocation)}
                className="field-input"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Destination">
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value as TripLocation)}
                className="field-input"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Starts">
              <input
                type="datetime-local"
                value={startsAt}
                min={minDate}
                max={maxDate}
                onChange={(e) => setStartsAt(e.target.value)}
                required
                className="field-input"
              />
            </Field>
            <Field label="Ends">
              <input
                type="datetime-local"
                value={endsAt}
                min={startsAt || minDate}
                max={maxDate}
                onChange={(e) => setEndsAt(e.target.value)}
                className="field-input"
              />
            </Field>
          </div>

          <Field label="Meeting point">
            <input
              value={meetingPoint}
              onChange={(e) => setMeetingPoint(e.target.value)}
              className="field-input"
            />
          </Field>

          <Field label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="field-input resize-none"
            />
          </Field>

          <Field label="Capacity">
            <input
              type="number"
              min={2}
              max={20}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="field-input"
            />
          </Field>
        </div>

        {error ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-700"
          >
            Create trip
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
      <span className="mb-1 block font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}
