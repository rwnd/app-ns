import { formatTripWhen } from "@/lib/trips/dates";
import { formatTransport, type Trip } from "@/lib/trips/types";

/**
 * Until a Discord bot is wired, "Share to Discord" only stores a mock thread URL.
 * No real channel/thread is created.
 */
export const DISCORD_THREADS_MOCK_ONLY = true;

/** Short thread name for #logistics — kept scannable. */
export function discordThreadTitle(trip: Trip): string {
  const when = formatTripWhen(trip).replace(/\s+/g, " ").slice(0, 40);
  return `${trip.source}→${trip.destination} · ${when}`;
}

/**
 * Mock thread URL for local UI only.
 * Real shape later: https://discord.com/channels/{guild}/{channel}/{thread}
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
  const transport = formatTransport(trip.transport);
  const how = transport ? `${transport} · ${seats}` : seats;
  const notes = trip.notes.trim() ? `\n${trip.notes.trim()}` : "";
  return [
    `**${trip.source} → ${trip.destination}**`,
    formatTripWhen(trip),
    how,
    `Host: ${trip.host.name}`,
    notes,
    "",
    DISCORD_THREADS_MOCK_ONLY
      ? "_Mock thread — not posted to Discord yet._"
      : "_Short-lived thread — archive after the trip._",
  ].join("\n");
}
