// What the music API exchanges with the client (the music stage): settings, the
// active pack, its tracks and the owner's uploads — projections only, never a
// prompt, a seed or a storage path. Pure parsers.
import { isUuid } from "../persistence/validation.ts";
import { isMoodId, type MoodId } from "./moods.ts";
import { MUSIC_MODEL_IDS } from "./models.ts";

export type MusicSettings = {
  enabled: boolean;
  model: string;
  variants: number;
  packCapUsdMicros: number;
  styleText: string;
  revision: number;
};
export type MusicPack = {
  id: string;
  scope: "world" | "campaign";
  scopeId: string;
  version: number;
  styleText: string;
  model: string;
  moods: MoodId[];
  variants: number;
  capUsdMicros: number;
  status: "generating" | "ready" | "failed" | "cancelled";
  costUsdMicros: number;
  createdAt: string;
  finishedAt: string | null;
};
export type MusicTrack = {
  id: string;
  packId: string | null;
  scope: "world" | "campaign";
  source: "generated" | "upload";
  moods: MoodId[];
  variant: number;
  title: string;
  model: string | null;
  requestedSeconds: number | null;
  status: "queued" | "generating" | "ready" | "failed";
  hidden: boolean;
  contentType: string | null;
  bytes: number | null;
  durationMs: number | null;
  costUsdMicros: number;
  elapsedMs: number | null;
  error: string | null;
  createdAt: string;
  readyAt: string | null;
};
export type MusicState = {
  campaignId: string;
  worldId: string | null;
  scope: "world" | "campaign";
  scopeId: string;
  settings: MusicSettings;
  pack: MusicPack | null;
  packs: MusicPack[];
  tracks: MusicTrack[];
  spentUsdMicros: number;
  /** Whether the server can generate (a fal key is configured); never the key. */
  generation: { configured: boolean };
};

const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const int = (v: unknown) => (typeof v === "number" && Number.isSafeInteger(v) ? v : null);
const str = (v: unknown) => (typeof v === "string" ? v : null);
const moods = (v: unknown): MoodId[] | null => (Array.isArray(v) && v.every(isMoodId) && v.length >= 1 ? (v as MoodId[]) : null);

export function parseMusicSettings(v: unknown): MusicSettings | null {
  if (!isRecord(v) || typeof v.enabled !== "boolean" || typeof v.model !== "string" || int(v.variants) === null || int(v.packCapUsdMicros) === null || typeof v.styleText !== "string" || int(v.revision) === null) return null;
  return { enabled: v.enabled, model: v.model, variants: v.variants as number, packCapUsdMicros: v.packCapUsdMicros as number, styleText: v.styleText, revision: v.revision as number };
}
export function parseMusicPack(v: unknown): MusicPack | null {
  if (!isRecord(v) || !isUuid(v.id) || (v.scope !== "world" && v.scope !== "campaign") || !isUuid(v.scopeId) || int(v.version) === null || typeof v.styleText !== "string" || typeof v.model !== "string"
    || !moods(v.moods) || int(v.variants) === null || int(v.capUsdMicros) === null || !["generating", "ready", "failed", "cancelled"].includes(v.status as string) || int(v.costUsdMicros) === null || typeof v.createdAt !== "string") return null;
  return { id: v.id, scope: v.scope, scopeId: v.scopeId, version: v.version as number, styleText: v.styleText, model: v.model, moods: moods(v.moods)!, variants: v.variants as number, capUsdMicros: v.capUsdMicros as number,
    status: v.status as MusicPack["status"], costUsdMicros: v.costUsdMicros as number, createdAt: v.createdAt, finishedAt: str(v.finishedAt) };
}
export function parseMusicTrack(v: unknown): MusicTrack | null {
  if (!isRecord(v) || !isUuid(v.id) || (v.packId !== null && !isUuid(v.packId)) || (v.scope !== "world" && v.scope !== "campaign") || (v.source !== "generated" && v.source !== "upload") || !moods(v.moods)
    || int(v.variant) === null || typeof v.title !== "string" || !["queued", "generating", "ready", "failed"].includes(v.status as string) || typeof v.hidden !== "boolean" || int(v.costUsdMicros) === null || typeof v.createdAt !== "string") return null;
  return { id: v.id, packId: v.packId as string | null, scope: v.scope, source: v.source, moods: moods(v.moods)!, variant: v.variant as number, title: v.title, model: str(v.model), requestedSeconds: int(v.requestedSeconds),
    status: v.status as MusicTrack["status"], hidden: v.hidden, contentType: str(v.contentType), bytes: int(v.bytes), durationMs: int(v.durationMs), costUsdMicros: v.costUsdMicros as number, elapsedMs: int(v.elapsedMs),
    error: str(v.error), createdAt: v.createdAt, readyAt: str(v.readyAt) };
}
export function parseMusicState(v: unknown): MusicState | null {
  if (!isRecord(v) || !isUuid(v.campaignId) || (v.worldId !== null && !isUuid(v.worldId)) || (v.scope !== "world" && v.scope !== "campaign") || !isUuid(v.scopeId) || !Array.isArray(v.packs) || !Array.isArray(v.tracks) || int(v.spentUsdMicros) === null) return null;
  const settings = parseMusicSettings(v.settings);
  const pack = v.pack === null ? null : parseMusicPack(v.pack);
  const packs = v.packs.map(parseMusicPack), tracks = v.tracks.map(parseMusicTrack);
  if (!settings || (v.pack !== null && !pack) || packs.some((p) => !p) || tracks.some((t) => !t)) return null;
  const generation = isRecord(v.generation) && typeof v.generation.configured === "boolean" ? { configured: v.generation.configured } : { configured: false };
  return { campaignId: v.campaignId, worldId: v.worldId as string | null, scope: v.scope, scopeId: v.scopeId, settings, pack, packs: packs as MusicPack[], tracks: tracks as MusicTrack[], spentUsdMicros: v.spentUsdMicros as number, generation };
}

/** The settings a client may save (validated again in SQL). */
export function parseMusicSettingsInput(v: unknown): (Omit<MusicSettings, "revision"> & { expectedRevision: number }) | null {
  if (!isRecord(v) || int(v.expectedRevision) === null || typeof v.enabled !== "boolean" || typeof v.model !== "string" || !MUSIC_MODEL_IDS.includes(v.model) || int(v.variants) === null || (v.variants as number) < 1 || (v.variants as number) > 3
    || int(v.packCapUsdMicros) === null || (v.packCapUsdMicros as number) < 0 || (v.packCapUsdMicros as number) > 50_000_000 || typeof v.styleText !== "string" || v.styleText.length > 1200) return null;
  return { expectedRevision: v.expectedRevision as number, enabled: v.enabled, model: v.model, variants: v.variants as number, packCapUsdMicros: v.packCapUsdMicros as number, styleText: v.styleText };
}

/** The public scene signal the player polls between turns (nothing private: the committed turn's
 * public projection, the clock, the current place's public name). */
export type SceneSignalView = {
  turnId: string | null;
  sceneKinds: string[];
  tension: "calm" | "tense" | "climax" | null;
  hint: "calm" | "tense" | "climax" | null;
  playerMoment: boolean;
  encounterActive: boolean;
  worldMinutes: number | null;
  place: { name: string; description: string } | null;
  /** Whether a turn is in flight (the client polls faster then). */
  turnPending: boolean;
};
