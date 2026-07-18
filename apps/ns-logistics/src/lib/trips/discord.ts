import { formatTripWhen } from "@/lib/trips/dates";
import type { Trip } from "@/lib/trips/types";

/** Short thread name for #logistics — kept scannable. */
export function discordThreadTitle(trip: Trip): string {
  const when = formatTripWhen(trip).replace(/\s+/g, " ").slice(0, 40);
  return `${trip.source}→${trip.destination} · ${when}`;
}

/**
 * Stub URL until a real Discord bot wires Create Thread.
 * Real shape: https://discord.com/channels/{guild}/{channel}/{thread}
 */
export function stubDiscordThreadUrl(trip: Trip): string {
  const slug = encodeURIComponent(discordThreadTitle(trip).toLowerCase());
  return `https://discord.com/channels/stub/logistics/thread-${trip.id}-${slug}`;
}

export function discordStarterMessage(trip: Trip): string {
  const seats =
    trip.capacity === null
      ? "companions welcome"
      : `${trip.capacity} seat${trip.capacity === 1 ? "" : "s"}`;
  const how = trip.intent === "offer" ? `Offering · ${seats}` : "Looking for a ride";
  const notes = trip.notes.trim() ? `\n${trip.notes.trim()}` : "";
  return [
    `**${trip.source} → ${trip.destination}**`,
    formatTripWhen(trip),
    how,
    `Host: ${trip.host.name}`,
    notes,
    "",
    "_Short-lived thread — archive after the trip._",
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}
