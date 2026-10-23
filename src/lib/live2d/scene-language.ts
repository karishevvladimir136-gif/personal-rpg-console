// Fix S3-accept Б2 (the owner: «описание на английском»): the player-facing text of a scene sheet — what a hotspot
// says, the sheet the owner edits under «Ещё» — is in the campaign's language; the illustrator keeps its own plain
// English clause (`brief`). Sheets written before were plain English: a one-time cheap call rewrites their text in
// the campaign's language (server/scene-language-job.ts), recorded by the sheet's `language`, so it never runs twice.
// Pure helpers only: the language test, the redo's request and reply, the hotspot notes that follow the sheet.
import type { Poi, SceneSheet } from "./contracts.ts";

export type SheetLanguage = "ru" | "en";

const CYRILLIC = /\p{Script=Cyrillic}/u;
const LATIN_WORD = /[A-Za-z]{3,}/;
/** A text a Russian reader would call foreign: Latin words and not one Cyrillic letter. An English campaign reads any. */
export function foreignTo(text: string, language: SheetLanguage): boolean {
  return language === "ru" && LATIN_WORD.test(text) && !CYRILLIC.test(text);
}
/** The sheet's player-facing strings: the summary, the light, what is never there, each hotspot's description. */
export function playerTexts(sheet: SceneSheet): string[] {
  return [sheet.summary, sheet.light, ...sheet.never, ...sheet.features.map((row) => row.description)].filter((text) => !!text.trim());
}
export const foreignTexts = (sheet: SceneSheet, language: SheetLanguage) => playerTexts(sheet).filter((text) => foreignTo(text, language));
/** A stored sheet the redo rewrites: written before the rule (no `language`) and with text the campaign does not read. */
export const needsLanguageRedo = (sheet: SceneSheet, language: SheetLanguage) => !sheet.language && foreignTexts(sheet, language).length > 0;
/** The language mark a sheet earns: the campaign's, once none of its player-facing text is foreign to it. */
export function withLanguageMark(sheet: SceneSheet, language: SheetLanguage): SceneSheet {
  const rest: SceneSheet = { ...sheet };
  delete rest.language;
  return foreignTexts(rest, language).length ? rest : { ...rest, language };
}

const LANGUAGE_NAME: Record<SheetLanguage, string> = { ru: "Russian", en: "English" };

/** The redo's request (a cheap text call): the same text in the campaign's language, nothing added or dropped. */
export function relangRequest(sheet: SceneSheet, placeName: string, language: SheetLanguage) {
  const target = LANGUAGE_NAME[language];
  const system = [
    `You rewrite the player-facing text of the scene sheet of one place of an illustrated role-playing campaign in ${target}: the player reads it on the clickable picture of the place.`,
    "Reply with one JSON object only, no prose: {\"summary\":\"...\",\"light\":\"...\",\"never\":[\"...\"],\"features\":[{\"key\":\"...\",\"description\":\"...\"}]}",
    `Say exactly what each text says, in natural ${target}: add nothing, drop nothing, invent nothing. features: one entry per key given, in that order; description: one sentence for the player. Names stay as the labels write them. An empty text stays empty.`,
  ].join("\n");
  const user = JSON.stringify({
    place: placeName, summary: sheet.summary, light: sheet.light, never: sheet.never,
    features: sheet.features.map((row) => ({ key: row.key, label: row.label, description: row.description })),
  });
  return { system, user };
}

const clean = (value: unknown, max: number) => (typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "");
/** The last JSON object in a reply (a model may write a line before it). */
function lastObject(text: string): Record<string, unknown> | null {
  const end = text.lastIndexOf("}");
  for (let start = text.lastIndexOf("{", end); start >= 0 && end > 0; start = text.lastIndexOf("{", start - 1)) {
    try {
      const value = JSON.parse(text.slice(start, end + 1));
      if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
    } catch { /* an inner brace: widen */ }
    if (start === 0) break;
  }
  return null;
}

/** The redone sheet, or null when the reply does not cover the sheet in the campaign's language (then nothing is written:
 * the old sheet stays and the redo may try again later). The old English clause becomes the illustrator's `brief`. */
export function parseRelangReply(text: string, sheet: SceneSheet, language: SheetLanguage): SceneSheet | null {
  const raw = lastObject(text);
  if (!raw) return null;
  const ok = (before: string, after: string) => (before.trim() ? !!after && !foreignTo(after, language) : true);
  const summary = clean(raw.summary, 1200), light = clean(raw.light, 240);
  if (!ok(sheet.summary, summary) || !ok(sheet.light, light)) return null;
  const never = Array.isArray(raw.never) ? raw.never.map((row) => clean(row, 120)).filter(Boolean).slice(0, 12) : [];
  if (sheet.never.length && (!never.length || never.some((row) => foreignTo(row, language)))) return null;
  const replies = new Map<string, string>();
  for (const row of Array.isArray(raw.features) ? raw.features : []) {
    const r = row as Record<string, unknown> | null;
    if (r && typeof r.key === "string") replies.set(r.key, clean(r.description, 240));
  }
  const features: SceneSheet["features"] = [];
  for (const feature of sheet.features) {
    const description = replies.get(feature.key) ?? "";
    if (!ok(feature.description, description)) return null;
    features.push({ ...feature, description: feature.description.trim() ? description : "", brief: feature.brief || feature.description });
  }
  return withLanguageMark({ ...sheet, summary: sheet.summary.trim() ? summary : "", light: sheet.light.trim() ? light : "", never: sheet.never.length ? never : [], features }, language);
}

/** The place's hotspots after a redo, in the shape `poi.replace` takes (every row of the place, so none is dropped): a
 * feature's note follows its new description when it still is the old description word for word — a note the owner
 * wrote stays; positions, the hidden flag and the source never change. `changed` is false when no note moves. */
export function relangPoiRows(pois: readonly Poi[], locationId: string, before: SceneSheet, after: SceneSheet) {
  let changed = false;
  const rows = pois.filter((poi) => poi.locationId === locationId).map((poi) => {
    const old = before.features.find((row) => row.key === poi.key);
    const next = after.features.find((row) => row.key === poi.key);
    const note = poi.kind !== "person" && old && next && old.description && poi.note === old.description ? next.description : poi.note;
    if (note !== poi.note) changed = true;
    return { id: poi.id, key: poi.key, kind: poi.kind, label: poi.label, note, entityId: poi.entityId, targetLocationId: poi.targetLocationId,
      x: poi.x, y: poi.y, confidence: poi.confidence, approximate: poi.approximate, source: poi.source, hidden: poi.hidden };
  });
  return { changed, rows };
}
