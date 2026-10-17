// Stage V pictures, presentation and planning only: the public picture board
// (styles, pictures, settings), style presets and resolution, which anchor a
// subject shows, what the autopilot or a restyle should draw next, which
// reference pictures a shot takes, prices per tier. Nothing here decides
// anything in the game: the DM and the rules decide, the records remember,
// pictures only show.
import type { CampaignSnapshot, Entity } from "../persistence/contracts.ts";
import type { TimelineFence } from "../saves/contracts.ts";
import { isTimelineFence } from "../saves/fence.ts";
import { isUuid } from "../persistence/validation.ts";
import { itemTypeKey } from "../ui/rarity.ts";
import {
  COMPOSITION_SIZE,
  FAL_SIZES,
  FAST_FAL_IMAGE_MODEL,
  falImagePriceUsdMicros,
  falModel,
  type FalImageModelId,
} from "./fal-image.ts";

export type PictureKind = "frame" | "anchor";
export type PictureSubjectKind = "turn" | "entity" | "item" | "location";
export type PictureComposition = "frame" | "portrait" | "figure" | "item" | "location" | "holding";
export type PictureTier = "fast" | "quality";
export type PictureTrigger = "live" | "committed" | "key_moment" | "redraw" | "autopilot" | "restyle" | "manual";
export type PictureStatus = "queued" | "generating" | "ready" | "failed";
export type PictureSubject = { kind: PictureSubjectKind; id: string };

export type PublicPicture = {
  id: string;
  kind: PictureKind;
  subjectKind: PictureSubjectKind;
  subjectId: string;
  composition: PictureComposition;
  timeline: TimelineFence;
  version: number;
  status: PictureStatus;
  hidden: boolean;
  model: string;
  tier: PictureTier;
  trigger: PictureTrigger;
  styleVersionId: string | null;
  width: number | null;
  height: number | null;
  costUsdMicros: number;
  elapsedMs: number | null;
  error: string | null;
  createdAt: string;
  readyAt: string | null;
};
export type PictureStyle = {
  id: string;
  scope: "world" | "campaign";
  scopeId: string;
  version: number;
  preset: string;
  label: string;
  styleText: string;
  hasReference: boolean;
  active: boolean;
  createdAt: string;
};
export type PictureAutopilot = {
  enabled: boolean;
  items: boolean;
  portraits: boolean;
  figures: boolean;
  places: boolean;
  holdings: boolean;
  /** Legacy OpenAI path only: accept a finished picture without the owner's click when its review raised no warning. */
  autoAccept: boolean;
  provider: "fal" | "openai";
};
export type PictureSettings = {
  frames: "every" | "key" | "off";
  quality: PictureTier;
  dailyCap: number;
  autopilot: PictureAutopilot;
  revision: number;
};
export type PictureBoard = {
  campaignId: string;
  worldId: string | null;
  settings: PictureSettings;
  today: { count: number; costUsdMicros: number };
  styles: PictureStyle[];
  pictures: PublicPicture[];
};

export const defaultPictureAutopilot: PictureAutopilot = {
  enabled: false, items: true, portraits: true, figures: true, places: true, holdings: true, autoAccept: true, provider: "fal",
};
export const defaultPictureSettings: PictureSettings = { frames: "every", quality: "fast", dailyCap: 60, autopilot: defaultPictureAutopilot, revision: 0 };

const KINDS: PictureKind[] = ["frame", "anchor"];
const SUBJECT_KINDS: PictureSubjectKind[] = ["turn", "entity", "item", "location"];
export const COMPOSITIONS: PictureComposition[] = ["frame", "portrait", "figure", "item", "location", "holding"];
const TIERS: PictureTier[] = ["fast", "quality"];
const TRIGGERS: PictureTrigger[] = ["live", "committed", "key_moment", "redraw", "autopilot", "restyle", "manual"];
const STATUSES: PictureStatus[] = ["queued", "generating", "ready", "failed"];
const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const oneOf = <T extends string>(list: readonly T[], v: unknown): v is T => list.includes(v as T);
const intOrNull = (v: unknown) => (v === null || v === undefined ? null : Number.isSafeInteger(v) ? (v as number) : null);

export function parsePictureAutopilot(raw: unknown): PictureAutopilot {
  const v = isRecord(raw) ? raw : {};
  const flag = (key: keyof PictureAutopilot) => (typeof v[key] === "boolean" ? (v[key] as boolean) : defaultPictureAutopilot[key] as boolean);
  return {
    enabled: flag("enabled"), items: flag("items"), portraits: flag("portraits"), figures: flag("figures"), places: flag("places"),
    // Polish group 5: the legacy «OpenAI draws the anchors» choice routed every picture to a path that
    // cannot work; a stored "openai" reads as fal (OpenAI images come back as a Stage V model, per tier).
    holdings: flag("holdings"), autoAccept: flag("autoAccept"), provider: "fal",
  };
}
export function parsePictureSettings(raw: unknown): PictureSettings {
  const v = isRecord(raw) ? raw : {};
  const cap = Number(v.dailyCap);
  return {
    frames: oneOf(["every", "key", "off"] as const, v.frames) ? v.frames : "every",
    quality: oneOf(TIERS, v.quality) ? v.quality : "fast",
    dailyCap: Number.isSafeInteger(cap) && cap >= 0 && cap <= 500 ? cap : 60,
    autopilot: parsePictureAutopilot(v.autopilot),
    revision: Number.isSafeInteger(v.revision) ? (v.revision as number) : 0,
  };
}
export function parsePicture(raw: unknown): PublicPicture | null {
  if (!isRecord(raw) || !isUuid(raw.id) || !oneOf(KINDS, raw.kind) || !oneOf(SUBJECT_KINDS, raw.subjectKind) || !isUuid(raw.subjectId) ||
    !oneOf(COMPOSITIONS, raw.composition) || !isTimelineFence(raw.timeline) || !Number.isSafeInteger(raw.version) || !oneOf(STATUSES, raw.status) ||
    typeof raw.model !== "string" || !oneOf(TIERS, raw.tier) || !oneOf(TRIGGERS, raw.trigger) || typeof raw.createdAt !== "string")
    return null;
  return {
    id: raw.id, kind: raw.kind, subjectKind: raw.subjectKind, subjectId: raw.subjectId, composition: raw.composition,
    timeline: raw.timeline, version: raw.version as number, status: raw.status, hidden: raw.hidden === true, model: raw.model, tier: raw.tier,
    trigger: raw.trigger, styleVersionId: isUuid(raw.styleVersionId) ? raw.styleVersionId : null,
    width: intOrNull(raw.width), height: intOrNull(raw.height), costUsdMicros: Number.isSafeInteger(raw.costUsdMicros) ? (raw.costUsdMicros as number) : 0,
    elapsedMs: intOrNull(raw.elapsedMs), error: typeof raw.error === "string" ? raw.error : null, createdAt: raw.createdAt,
    readyAt: typeof raw.readyAt === "string" ? raw.readyAt : null,
  };
}
export function parsePictureStyle(raw: unknown): PictureStyle | null {
  if (!isRecord(raw) || !isUuid(raw.id) || !oneOf(["world", "campaign"] as const, raw.scope) || !isUuid(raw.scopeId) || !Number.isSafeInteger(raw.version) ||
    typeof raw.preset !== "string" || typeof raw.label !== "string" || typeof raw.styleText !== "string" || typeof raw.createdAt !== "string")
    return null;
  return { id: raw.id, scope: raw.scope, scopeId: raw.scopeId, version: raw.version as number, preset: raw.preset, label: raw.label,
    styleText: raw.styleText, hasReference: raw.hasReference === true, active: raw.active === true, createdAt: raw.createdAt };
}
export function parsePictureBoard(raw: unknown): PictureBoard | null {
  if (!isRecord(raw) || !isUuid(raw.campaignId)) return null;
  const today = isRecord(raw.today) ? raw.today : {};
  return {
    campaignId: raw.campaignId,
    worldId: isUuid(raw.worldId) ? raw.worldId : null,
    settings: parsePictureSettings(raw.settings),
    today: { count: Number.isSafeInteger(today.count) ? (today.count as number) : 0, costUsdMicros: Number.isSafeInteger(today.costUsdMicros) ? (today.costUsdMicros as number) : 0 },
    styles: Array.isArray(raw.styles) ? raw.styles.map(parsePictureStyle).filter((row): row is PictureStyle => row !== null) : [],
    pictures: Array.isArray(raw.pictures) ? raw.pictures.map(parsePicture).filter((row): row is PublicPicture => row !== null) : [],
  };
}
export const emptyPictureBoard = (campaignId: string): PictureBoard =>
  ({ campaignId, worldId: null, settings: defaultPictureSettings, today: { count: 0, costUsdMicros: 0 }, styles: [], pictures: [] });

// Style presets the owner can start from, edit or replace. Nothing is tied to
// one look; the text is what the image model reads.
export const STYLE_PRESETS = [
  { key: "line-art", label: { ru: "Линейный рисунок", en: "Line art" },
    text: "Clean ink line art with a limited flat palette of three colours, bold confident outlines, screen-print texture, no gradients, no photorealism." },
  { key: "oil", label: { ru: "Масляная живопись", en: "Painterly oil" },
    text: "Painterly oil on canvas, visible brushwork, warm chiaroscuro light, rich pigment texture, classical composition." },
  { key: "pixel", label: { ru: "Пиксель-арт", en: "Pixel art" },
    text: "Pixel art, 64-colour palette, crisp pixels with no anti-aliasing, 16-bit adventure game look, dithered shading." },
  { key: "noir", label: { ru: "Нуар-комикс", en: "Noir graphic novel" },
    text: "Noir graphic novel: high-contrast black ink, heavy shadows and rain, one cold accent colour, halftone texture, cinematic framing." },
  { key: "watercolor", label: { ru: "Акварель", en: "Watercolour" },
    text: "Loose watercolour with ink outlines, paper grain, soft bleeding washes, muted palette, light left white." },
] as const;
export type StylePresetKey = (typeof STYLE_PRESETS)[number]["key"] | "custom";
export const stylePreset = (key: string) => STYLE_PRESETS.find((row) => row.key === key) ?? null;

/** The style in force: a campaign override, else the world's, else none. */
export function activeStyle(board: Pick<PictureBoard, "styles">): PictureStyle | null {
  return board.styles.find((row) => row.scope === "campaign" && row.active) ?? board.styles.find((row) => row.scope === "world" && row.active) ?? null;
}
/** The style text the image model reads: the active style, else the campaign's own visual style setting. */
export function styleTextFor(board: Pick<PictureBoard, "styles">, campaignVisualStyle: string) {
  return (activeStyle(board)?.styleText || campaignVisualStyle || "").trim();
}
export function styleVersions(board: Pick<PictureBoard, "styles">, scope: "world" | "campaign") {
  return board.styles.filter((row) => row.scope === scope).sort((a, b) => b.version - a.version);
}

export const modelForTier = (tier: PictureTier): FalImageModelId => (tier === "quality" ? "fal-ai/flux-2-pro" : FAST_FAL_IMAGE_MODEL);
export function pictureCostUsdMicros(tier: PictureTier, composition: PictureComposition, model: FalImageModelId = modelForTier(tier)) {
  const [width, height] = FAL_SIZES[COMPOSITION_SIZE[composition]];
  return falImagePriceUsdMicros(model, width, height);
}
export const maxReferencesFor = (model: FalImageModelId) => falModel(model)?.maxReferences ?? 4;
export const capRemaining = (board: Pick<PictureBoard, "settings" | "today">) => Math.max(0, board.settings.dailyCap - board.today.count);

const byVersion = (a: PublicPicture, b: PublicPicture) => a.version - b.version || a.createdAt.localeCompare(b.createdAt);
export const picturesOf = (board: Pick<PictureBoard, "pictures">, subject: PictureSubject, composition?: PictureComposition) =>
  board.pictures.filter((row) => row.subjectKind === subject.kind && row.subjectId === subject.id && (!composition || row.composition === composition)).sort(byVersion);
/** The picture a subject shows: the newest ready, unhidden version; and whether a newer one is being drawn.
 * Anchors belong to the campaign, not to one branch: loading a save opens a new timeline (a branch
 * of the old one), and the people, places and items of the restored records keep their faces. The
 * records on the active branch decide which subjects are shown at all. */
export function anchorFor(board: Pick<PictureBoard, "pictures">, subject: PictureSubject, composition: PictureComposition) {
  const rows = picturesOf(board, subject, composition);
  const ready = rows.filter((row) => row.status === "ready" && !row.hidden);
  const shown = ready.at(-1) ?? null;
  return {
    picture: shown,
    drawing: rows.some((row) => row.status === "queued" || row.status === "generating"),
    version: shown ? { index: ready.indexOf(shown) + 1, total: ready.length } : null,
    failed: rows.at(-1)?.status === "failed" ? rows.at(-1)!.error : null,
  };
}
/** Frames of one turn, newest version last; hidden ones stay in the list for «показать». */
export const framesOfTurn = (board: Pick<PictureBoard, "pictures">, turnId: string) => picturesOf(board, { kind: "turn", id: turnId }, "frame");
export function frameFor(board: Pick<PictureBoard, "pictures">, turnId: string) {
  const rows = framesOfTurn(board, turnId);
  // Polish group 5: «Скрыть» hides the frame of the turn — a hidden version is never the shown one.
  const shown = rows.filter((row) => row.status === "ready" && !row.hidden).at(-1) ?? null;
  return { picture: shown, drawing: rows.some((row) => row.status === "queued" || row.status === "generating"), failed: rows.at(-1)?.status === "failed" };
}
export const pictureUrl = (campaignId: string, pictureId: string) =>
  `/api/visual-frame?action=picture&campaignId=${encodeURIComponent(campaignId)}&pictureId=${encodeURIComponent(pictureId)}`;
export const styleReferenceUrl = (campaignId: string, styleId: string) =>
  `/api/visual-frame?action=style-reference&campaignId=${encodeURIComponent(campaignId)}&styleId=${encodeURIComponent(styleId)}`;

/** Which anchor composition a record gets. */
export function compositionForEntity(entity: Pick<Entity, "kind">): PictureComposition {
  return entity.kind === "transport" || entity.kind === "mount" ? "holding" : "portrait";
}

export type AnchorPlan = { subject: PictureSubject; composition: PictureComposition; name: string; description: string; reason: "holding" | "portrait" | "figure" | "place" | "item" }[];
/** The anchor set of a campaign: what the autopilot draws for a new world and what a
 * restyle re-renders. Most visible first; one picture per item type. */
export function anchorSet(snapshot: CampaignSnapshot, autopilot: Pick<PictureAutopilot, "items" | "portraits" | "figures" | "places" | "holdings">): AnchorPlan {
  const plan: AnchorPlan = [];
  const cid = snapshot.campaign.id;
  const entities = snapshot.entities.filter((row) => row.campaign_id === cid);
  if (autopilot.holdings)
    for (const row of entities.filter((entity) => entity.kind === "transport" || entity.kind === "mount"))
      plan.push({ subject: { kind: "entity", id: row.id }, composition: "holding", name: row.name, description: row.details, reason: "holding" });
  if (autopilot.portraits) {
    for (const row of entities.filter((entity) => entity.kind === "player" || entity.kind === "companion")) {
      plan.push({ subject: { kind: "entity", id: row.id }, composition: "portrait", name: row.name, description: row.details, reason: "portrait" });
      if (autopilot.figures && row.kind === "player")
        plan.push({ subject: { kind: "entity", id: row.id }, composition: "figure", name: row.name, description: row.details, reason: "figure" });
    }
  }
  if (autopilot.places)
    for (const row of snapshot.locations.filter((location) => location.campaign_id === cid && location.status === "visited"))
      plan.push({ subject: { kind: "location", id: row.id }, composition: "location", name: row.name, description: row.description, reason: "place" });
  if (autopilot.items) {
    const types = new Set<string>();
    for (const row of [...snapshot.items].filter((item) => item.campaign_id === cid && item.quantity > 0).sort((a, b) => b.updated_at.localeCompare(a.updated_at))) {
      const type = itemTypeKey(row);
      if (types.has(type)) continue;
      types.add(type);
      plan.push({ subject: { kind: "item", id: row.id }, composition: "item", name: row.name, description: row.description, reason: "item" });
    }
  }
  return plan;
}
/** Items of the same type (normalized name + category) share one picture. */
export function sharedItemAnchor(board: Pick<PictureBoard, "pictures">, snapshot: CampaignSnapshot, itemId: string) {
  const item = snapshot.items.find((row) => row.id === itemId);
  if (!item) return anchorFor(board, { kind: "item", id: itemId }, "item");
  const own = anchorFor(board, { kind: "item", id: itemId }, "item");
  if (own.picture || own.drawing) return own;
  const type = itemTypeKey(item);
  for (const other of snapshot.items.filter((row) => row.id !== itemId && itemTypeKey(row) === type)) {
    const shared = anchorFor(board, { kind: "item", id: other.id }, "item");
    if (shared.picture || shared.drawing) return shared;
  }
  return own;
}

/** What the autopilot queues next: anchors nobody has drawn or tried, within the cap, one per call. */
export function planAutopilot(snapshot: CampaignSnapshot, board: PictureBoard, limit = 1): AnchorPlan {
  const autopilot = board.settings.autopilot;
  if (!autopilot.enabled || autopilot.provider !== "fal") return [];
  const remaining = capRemaining(board);
  if (!remaining) return [];
  if (board.pictures.some((row) => row.kind === "anchor" && (row.status === "queued" || row.status === "generating"))) return [];
  const next = anchorSet(snapshot, autopilot).filter(({ subject, composition }) => {
    if (subject.kind === "item") {
      const shared = sharedItemAnchor(board, snapshot, subject.id);
      if (shared.picture || shared.drawing) return false;
    }
    const rows = picturesOf(board, subject, composition);
    // Never retry on its own: one attempt per subject and composition per style version.
    const style = activeStyle(board)?.id ?? null;
    return !rows.some((row) => row.styleVersionId === style || row.status === "ready");
  });
  return next.slice(0, Math.min(limit, remaining));
}

/** A restyle re-renders every anchor that exists in the old style plus the planned set; the old
 * picture stays until the new one is ready. Returns the plan and its price per tier. */
export function restylePlan(snapshot: CampaignSnapshot, board: PictureBoard) {
  const set = anchorSet(snapshot, { items: true, portraits: true, figures: true, places: true, holdings: true });
  const style = activeStyle(board)?.id ?? null;
  const plan = set.filter(({ subject, composition }) => {
    const rows = picturesOf(board, subject, composition);
    const hasOld = rows.some((row) => row.status === "ready");
    const hasNew = rows.some((row) => row.styleVersionId === style && row.status !== "failed");
    return !hasNew && (hasOld || board.settings.autopilot.enabled);
  });
  const cost = (tier: PictureTier) => plan.reduce((sum, row) => sum + pictureCostUsdMicros(tier, row.composition), 0);
  return { plan, fastUsdMicros: cost("fast"), qualityUsdMicros: cost("quality") };
}

/** Reference pictures for a shot, in priority order: the style's reference image, the place's
 * anchor, then the portraits of the people in the shot, up to the model's limit. */
export function referencesForShot(board: PictureBoard, input: { entityIds: string[]; locationId: string | null; model: FalImageModelId }) {
  const ids: string[] = [];
  const style = activeStyle(board);
  if (style?.hasReference) ids.push(style.id);
  if (input.locationId) {
    const place = anchorFor(board, { kind: "location", id: input.locationId }, "location").picture;
    if (place) ids.push(place.id);
  }
  for (const id of input.entityIds) {
    const portrait = anchorFor(board, { kind: "entity", id }, "portrait").picture ?? anchorFor(board, { kind: "entity", id }, "holding").picture;
    if (portrait) ids.push(portrait.id);
  }
  return [...new Set(ids)].slice(0, maxReferencesFor(input.model));
}
/** References for an anchor: the style image and, for a figure, the portrait of the same person. */
export function referencesForAnchor(board: PictureBoard, subject: PictureSubject, composition: PictureComposition, model: FalImageModelId) {
  const ids: string[] = [];
  const style = activeStyle(board);
  if (style?.hasReference) ids.push(style.id);
  if (composition === "figure") {
    const portrait = anchorFor(board, subject, "portrait").picture;
    if (portrait) ids.push(portrait.id);
  }
  return ids.slice(0, maxReferencesFor(model));
}

/** The chronicle: sessions as chapters, each with its turns and their frames. */
export function chronicleChapters(snapshot: CampaignSnapshot, turns: { id: string; session_id: string | null; input: string; narration: string | null; created_at: string; status: string; mode: string }[], board: Pick<PictureBoard, "pictures">) {
  const sessions = [...snapshot.sessions].sort((a, b) => a.updated_at.localeCompare(b.updated_at));
  const committed = turns.filter((turn) => turn.status === "committed" && turn.mode === "game" && turn.narration);
  return sessions.map((session, index) => ({
    session,
    number: index + 1,
    turns: committed.filter((turn) => turn.session_id === session.id).map((turn) => ({ turn, frame: frameFor(board, turn.id).picture })),
  })).filter((chapter) => chapter.turns.length > 0 || chapter.session.recap);
}
