import type { AdventureCatalog, AdventurePacing, PublicAdventure } from "../adventures/contracts.ts";

type Lang = "en" | "ru";
/** The existing adventure envelopes (quick / evening / mini arc / open). */
export function envelopeLabel(pacing: AdventurePacing, lang: Lang) {
  const ru = lang === "ru";
  switch (pacing.kind) {
    case "quick": return ru ? "Короткое · 1–2 ч" : "Quick · 1–2 h";
    case "evening": return ru ? "На вечер · 3–5 ч" : "An evening · 3–5 h";
    case "mini_arc": return ru ? "Мини-арка · 8–15 ч" : "Mini arc · 8–15 h";
    case "open": return ru ? "Без ограничений" : "Open-ended";
    default: return pacing.custom?.trim() || (ru ? "Свой темп" : "Custom pace");
  }
}
export function activeAdventure(catalog: AdventureCatalog | null): PublicAdventure | null {
  if (!catalog?.activeAdventureId) return null;
  return catalog.adventures.find((row) => row.id === catalog.activeAdventureId) ?? null;
}
/** In-world time since the adventure began (the record keeps world minutes, not play time). */
export function adventureElapsed(adventure: PublicAdventure, worldMinutes: number | null | undefined, lang: Lang) {
  if (!adventure.start || worldMinutes === null || worldMinutes === undefined) return null;
  const minutes = Math.max(0, worldMinutes - adventure.start.worldMinutes);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (lang === "ru") return days ? `${days} дн. ${hours % 24} ч в мире` : `${hours} ч ${minutes % 60} мин в мире`;
  return days ? `${days} d ${hours % 24} h in-world` : `${hours} h ${minutes % 60} min in-world`;
}
