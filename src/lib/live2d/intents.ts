// Clicks become intents in the action box; the DM decides. The 2D layer never
// moves the party, opens a door or starts a talk by itself.
import type { Poi } from "./contracts.ts";

export type Language = "ru" | "en";

/** A click on a known place on the map: «идём в <место>». */
export function placeIntent(name: string, language: Language): string {
  return language === "ru" ? `Идём в ${name}.` : `We go to ${name}.`;
}

/** A click on a hotspot of the scene. */
export function poiIntent(poi: Pick<Poi, "kind" | "label">, language: Language): string {
  const ru = language === "ru";
  switch (poi.kind) {
    case "person": return ru ? `Подхожу к ${poi.label}.` : `I approach ${poi.label}.`;
    case "exit": return ru ? `Иду в ${poi.label}.` : `I go to ${poi.label}.`;
    case "lead": return ru ? `Расспрашиваю о ${poi.label}.` : `I ask around about ${poi.label}.`;
    default: return ru ? `Осматриваю ${poi.label}.` : `I examine ${poi.label}.`;
  }
}
