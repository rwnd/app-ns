"use client";

import { useMemo, useState } from "react";
import {
  CORRIDOR_PRESETS,
  LOCATIONS,
  MAX_PLAN_DAYS,
  TIME_WINDOWS,
  TRANSPORT_MODES,
} from "@/lib/trips/constants";
import {
  addDays,
  endOfDay,
  parseDateKey,
  parseDatetimeLocalValue,
  toDatetimeLocalValue,
  toDateKey,
} from "@/lib/trips/dates";
import { isWithinPlanWindow } from "@/lib/trips/filter";
import type {
  TimePrecision,
  TimeWindow,
  TransportMode,
  Trip,
  TripLocation,
  TripPerson,
} from "@/lib/trips/types";

type CreateTripModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (trip: Trip) => void;
  host: TripPerson;
};

function defaultExactLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 60, 0, 0);
  return toDatetimeLocalValue(d);
}

export function CreateTripModal({
  open,
  onClose,
  onCreate,
  host,
}: CreateTripModalProps) {
  const maxDate = useMemo(() => {
    const d = endOfDay(addDays(new Date(), MAX_PLAN_DAYS));
    return toDatetimeLocalValue(d);
  }, []);
  const minDate = useMemo(() => toDatetimeLocalValue(new Date()), []);
  const maxDay = useMemo(() => toDateKey(addDays(new Date(), MAX_PLAN_DAYS)), []);
  const minDay = useMemo(() => toDateKey(new Date()), []);

  const [source, setSource] = useState<TripLocation>("Network School");
  const [destination, setDestination] =
    useState<TripLocation>("Changi Airport");
  const [precision, setPrecision] = useState<TimePrecision>("exact");
  const [startsAt, setStartsAt] = useState(defaultExactLocal);
  const [day, setDay] = useState(minDay);
  const [windowId, setWindowId] = useState<TimeWindow>("evening");
  const [transport, setTransport] = useState<TransportMode[]>(["car"]);
  const [notes, setNotes] = useState("");
  const [meetingPoint, setMeetingPoint] = useState("");
  const [capacity, setCapacity] = useState<string>("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    if (source === destination) {
      setError("Source and destination must be different.");
      return;
    }

    let start: Date;
    let end: Date;
    let timeLabel = "";

    if (precision === "exact") {
      start = parseDatetimeLocalValue(startsAt);
      if (Number.isNaN(start.getTime())) {
        setError("Pick a valid start time.");
        return;
      }
      if (!isWithinPlanWindow(start)) {
        setError(
          `Start time must be from now up to ${MAX_PLAN_DAYS} days ahead.`,
        );
        return;
      }
      end = new Date(start.getTime() + 90 * 60 * 1000);
    } else {
      const win = TIME_WINDOWS.find((w) => w.id === windowId)!;
      const base = parseDateKey(day);
      if (Number.isNaN(base.getTime())) {
        setError("Pick a valid day.");
        return;
      }
      start = new Date(base);
      start.setHours(win.startHour, 0, 0, 0);
      end = new Date(base);
      if (win.endHour >= 24) {
        end = addDays(base, 1);
        end.setHours(0, 0, 0, 0);
      } else {
        end.setHours(win.endHour, 0, 0, 0);
      }
      if (!isWithinPlanWindow(start)) {
        setError(`Day must be from today up to ${MAX_PLAN_DAYS} days ahead.`);
        return;
      }
      timeLabel = `${base.toLocaleDateString("en-US", {
        weekday: "long",
      })} ${win.label.toLowerCase()}`;
    }

    const seats =
      capacity.trim() !== "" ? Math.max(1, Number(capacity)) : null;
    if (capacity.trim() !== "" && Number.isNaN(seats)) {
      setError("Seats must be a number, or leave blank.");
      return;
    }

    const trip: Trip = {
      id: `t-${Date.now()}`,
      status: "open",
      source,
      destination,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      timePrecision: precision,
      timeLabel,
      transport: [...transport],
      meetingPoint: meetingPoint.trim(),
      notes: notes.trim(),
      host,
      riders: [],
      capacity: seats,
      discordThreadUrl: null,
    };

    onCreate(trip);
    onClose();
    setNotes("");
    setMeetingPoint("");
    setCapacity("");
    setTransport(["car"]);
    setDetailsOpen(false);
    setStartsAt(defaultExactLocal());
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
              From → to, when, how you&apos;re going. Optional seats.
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
              Route
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CORRIDOR_PRESETS.map((preset) => {
                const active =
                  source === preset.source &&
                  destination === preset.destination;
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
            <Field label="From">
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
            <Field label="To">
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

          <div className="grid grid-cols-2 gap-1 rounded-full bg-[var(--iron-100)] p-1">
            {(
              [
                ["exact", "Exact time"],
                ["flexible", "Flexible window"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPrecision(value)}
                className={[
                  "rounded-full px-3 py-2 text-sm font-semibold transition",
                  precision === value
                    ? "bg-white text-[var(--ns-ink)] shadow-sm"
                    : "text-[var(--iron-500)]",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>

          {precision === "exact" ? (
            <Field label="When">
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
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Day">
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
              <Field label="Window">
                <select
                  value={windowId}
                  onChange={(e) => setWindowId(e.target.value as TimeWindow)}
                  className="field-input"
                >
                  {TIME_WINDOWS.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="mb-1.5 text-sm font-medium text-[var(--ns-ink)]">
                Transport
              </p>
              <p className="mb-2 text-xs text-[var(--iron-400)]">
                One, both (either fine), or none.
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

          <button
            type="button"
            onClick={() => setDetailsOpen((v) => !v)}
            className="text-sm font-semibold text-[var(--iron-500)] hover:text-[var(--ns-ink)]"
            aria-expanded={detailsOpen}
          >
            {detailsOpen ? "Hide optional details" : "+ Optional details"}
          </button>

          {detailsOpen ? (
            <div className="space-y-3 rounded-xl bg-[var(--iron-50)] p-3">
              <Field label="Notes">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Bags ok · share Grab · landing 30th night…"
                  className="field-input resize-none"
                />
              </Field>
              <Field label="Meeting point">
                <input
                  value={meetingPoint}
                  onChange={(e) => setMeetingPoint(e.target.value)}
                  placeholder="NS Lobby, T3 Arrival…"
                  className="field-input"
                />
              </Field>
            </div>
          ) : null}
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
