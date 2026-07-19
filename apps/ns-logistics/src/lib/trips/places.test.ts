import assert from "node:assert/strict";
import {
  formatPlaceName,
  parsePlaceName,
  placeEquals,
  popularPlacesFromTrips,
} from "@/lib/trips/places";

assert.equal(formatPlaceName("  Changi   Airport  "), "Changi Airport");
assert.equal(placeEquals("Singapore", "Singapore"), true);
assert.equal(placeEquals("Singapore", "singapore"), false, "case-sensitive");
assert.equal(placeEquals("JB Sentral", "JB  Sentral"), true, "format then match");

const bad = parsePlaceName("changi airport");
assert.equal(bad.ok, false);

const good = parsePlaceName("  Changi Airport ");
assert.equal(good.ok, true);
if (good.ok) assert.equal(good.value, "Changi Airport");

const ranked = popularPlacesFromTrips(
  [
    {
      source: "Network School",
      destination: "Changi Airport",
      status: "open",
    },
    {
      source: "Network School",
      destination: "Changi Airport",
      status: "open",
    },
    {
      source: "Singapore",
      destination: "Network School",
      status: "open",
    },
    {
      source: "Network School",
      destination: "Eco Botanica",
      status: "cancelled",
    },
  ],
  5,
);

assert.equal(ranked[0]?.place, "Network School");
assert.equal(ranked[0]?.count, 3);
assert.equal(ranked[1]?.place, "Changi Airport");
assert.equal(ranked[1]?.count, 2);
assert.ok(!ranked.some((p) => p.place === "Eco Botanica"), "skip cancelled");

console.log("places.test.ts ok");
