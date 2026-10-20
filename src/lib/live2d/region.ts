// The region map (slice item 1): a stable painted map of the region the party
// travels, the places as marks laid out by the atlas placement code, drawn once
// per region and redrawn only when a new place appears in it. Pure helpers: the
// signature of the places drawn and the illustrator's prompt.
import type { Live2dPin } from "./hierarchy.ts";

/** The places a region map was drawn for, in a stable order; a new place changes it. */
export const regionSignature = (pins: readonly Pick<Live2dPin, "locationId">[]) => [...new Set(pins.map((row) => row.locationId))].sort().join(",");

/** Which known places are new since the map was drawn (the reason to redraw). */
export function newPlacesSince(signature: string, pins: readonly Live2dPin[]): Live2dPin[] {
  const drawn = new Set(signature.split(",").filter(Boolean));
  return pins.filter((pin) => !drawn.has(pin.locationId));
}

function where(x: number, y: number) {
  const ns = y < 0.33 ? "north" : y > 0.66 ? "south" : "";
  const ew = x < 0.33 ? "west" : x > 0.66 ? "east" : "";
  return ns && ew ? `in the ${ns}-${ew}` : ns ? `in the ${ns}` : ew ? `in the ${ew}` : "near the centre";
}

export type RegionPromptInput = {
  regionName: string | null;
  regionDescription: string;
  /** The world's own words about the region, when the canon has them (public text). */
  canon: string;
  places: { name: string; description: string; x: number; y: number; status: string }[];
  /** The party's road: the places visited, in order, so the map draws the route they travelled. */
  route: string[];
  style: string;
  family: "gpt" | "flux" | "other";
};
export function regionMapPrompt(input: RegionPromptInput): string {
  const places = input.places.map((row) => `${row.name} ${where(row.x, row.y)}${row.description ? `: ${row.description.replace(/\s+/g, " ").slice(0, 120)}` : ""}`);
  const text = input.family === "flux"
    ? "Every surface is plain: no lettering, no labels, no compass letters, no legend."
    : "No text, letters, numbers, labels, a legend, a compass rose with letters or any writing anywhere on the map.";
  return [
    `A painted map of ${input.regionName ? `the region of ${input.regionName}` : "the region the travellers know"}, seen from high above at a slight angle, as a page of an illustrated atlas: terrain, forests, water, roads and settlements as small painted landmarks, with aged paper and ink at the edges.`,
    input.regionDescription ? `The region: ${input.regionDescription.replace(/\s+/g, " ").slice(0, 400)}` : "",
    input.canon ? `What is known of it: ${input.canon.replace(/\s+/g, " ").slice(0, 600)}` : "",
    places.length ? `Draw these places as landmarks exactly where they are said to be (north is up, west is left): ${places.join("; ")}.` : "No separate places are known yet: draw the land itself.",
    input.route.length > 1 ? `A road joins, in this order: ${input.route.join(" → ")}.` : "",
    "Leave open ground between the landmarks; the app writes the names over the picture, so no written names on the map itself. Nothing beyond the places named: no extra towns, castles or ruins that the records do not know.",
    text,
    input.style.trim() ? `Art style: ${input.style.trim().slice(0, 800)}` : "Art style: an ink and watercolour atlas page.",
  ].filter(Boolean).join("\n").slice(0, 8000);
}
