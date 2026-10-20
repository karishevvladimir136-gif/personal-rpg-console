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
  FAL_IMAGE_MODELS,
  FAL_SIZES,
  falImagePriceUsdMicros,
  falModel,
  type FalImageModelId,
  type FalSizePreset,
} from "./fal-image.ts";
import { OPENAI_IMAGE_MODELS, openAIImageModel, openAIImageTypicalUsdMicros, type OpenAIImageModelId } from "./openai-image.ts";

export type PictureKind = "frame" | "anchor";
export type PictureSubjectKind = "turn" | "entity" | "item" | "location";
export type PictureComposition = "frame" | "portrait" | "figure" | "item" | "location" | "holding" | "atlas";
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
  /** Fix run E (item 78b): the shot's own moment in the campaign language — what the picture shows. */
  caption: string | null;
  /** Fix run E (item 79): the vision check after the frame was drawn; null until it ran (or when it is off). */
  review: PictureReview | null;
};
/** The cheap vision check of a drawn frame: problems in words (extra or missing limbs, gear the person does not
 * have, open eyes at 0 HP), the automatic redraw it queued, if any, and where each person looks (the report counts it). */
export type PictureReview = {
  ok: boolean;
  problems: string[];
  /** The one automatic redraw a failed check queued; null when it only marked the frame (cap, a redraw already). */
  redrawId: string | null;
  gaze: { key: string; looksAt: string }[];
  checkedAt: string;
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
  /** Polish 2: the owner's model per tier (picture settings); an absent tier means the default. */
  models: Partial<Record<PictureTier, PictureModelId>>;
  /** Polish 2 §3: the shot director writes a visual brief from the whole turn (off: the one-clause shot alone). */
  director: boolean;
  /** Fix run E: the owner's time zone (the device's, sent with «Сохранить»): the daily count starts at its midnight. */
  timeZone: string;
  revision: number;
};
/** Polish 2 §3: the visual profile of a named person or place — a full look, drafted once by the
 * model from the records and the approved anchor, edited by the owner (the owner's text has the
 * highest authority), with the story's changes to the look appended as they happen. Versions are history. */
export type VisualProfile = {
  id: string;
  subjectKind: "entity" | "location";
  subjectId: string;
  version: number;
  look: string;
  changes: string[];
  source: "model" | "owner";
  createdAt: string;
};
export type PictureBoard = {
  campaignId: string;
  worldId: string | null;
  settings: PictureSettings;
  /** `since`: the midnight the count started from (the owner's zone), when the database says. */
  today: { count: number; costUsdMicros: number; since?: string | null };
  styles: PictureStyle[];
  pictures: PublicPicture[];
  profiles: VisualProfile[];
};

export const defaultPictureAutopilot: PictureAutopilot = {
  enabled: false, items: true, portraits: true, figures: true, places: true, holdings: true, autoAccept: true, provider: "fal",
};
/** Polish 3 §5 (the owner's second blind page, 2026-10-18): the shot director is off by default. */
export const defaultPictureSettings: PictureSettings = { frames: "every", quality: "fast", dailyCap: 60, autopilot: defaultPictureAutopilot, models: {}, director: false, timeZone: "UTC", revision: 0 };

// Polish 2: the catalogue of picture models of both providers, one entry per model, and the
// defaults per tier from the owner's blind picks (2026-10-17, docs/stages/POLISH_2.md §2):
// GPT Image 2.5 Sunburst for anchors, key frames and redraws (the quality tier), and since polish 3
// for live frames too (the fast tier; see DEFAULT_TIER_MODELS). Every other model stays in the
// catalogue, off by default; the owner switches a tier in the picture settings.
export type PictureModelId = FalImageModelId | OpenAIImageModelId;
export type PictureModel = {
  id: PictureModelId; provider: "fal" | "openai"; label: string; tier: PictureTier; maxReferences: number;
  /** The bake-off's median seconds per picture (null where it was not measured). */
  medianSeconds: number | null;
  note: { ru: string; en: string };
};
const FAL_MEDIAN_SECONDS: Partial<Record<FalImageModelId, number>> = {
  "fal-ai/flux-2-pro": 17, "fal-ai/flux-2/klein/9b": 3.3, "fal-ai/nano-banana-pro": 22, "fal-ai/nano-banana-2": 11,
  "bytedance/seedream/v5/pro/text-to-image": 88, "blackforestlabs/flux-3/text-to-image": 29, "fal-ai/qwen-image-3/text-to-image": 114, "xai/grok-imagine-image": 11,
};
export const PICTURE_MODELS: PictureModel[] = [
  ...OPENAI_IMAGE_MODELS.map((row) => ({ id: row.id, provider: "openai" as const, label: row.label, tier: row.tier, maxReferences: row.maxReferences, medianSeconds: row.medianSeconds, note: row.note })),
  ...FAL_IMAGE_MODELS.map((row) => ({ id: row.id, provider: "fal" as const, label: row.label, tier: row.tier, maxReferences: row.maxReferences, medianSeconds: FAL_MEDIAN_SECONDS[row.id] ?? null, note: row.note })),
];
export const pictureModel = (id: string) => PICTURE_MODELS.find((row) => row.id === id) ?? null;
export const isPictureModelId = (id: unknown): id is PictureModelId => typeof id === "string" && pictureModel(id) !== null;
export const isOpenAIPictureModel = (id: string) => openAIImageModel(id) !== null;
/** Polish 3 §5: live frames on Sunburst by default too (the owner picked it in 11 of 16 scenes over both blind
 * pages; same price, about 30 s instead of 16, and the frame starts from the first paragraph). Flare stays a choice. */
export const DEFAULT_TIER_MODELS: Record<PictureTier, PictureModelId> = { fast: "gpt-image-2.5-sunburst", quality: "gpt-image-2.5-sunburst" };
export function parsePictureModels(raw: unknown): PictureSettings["models"] {
  const v = isRecord(raw) ? raw : {};
  const models: PictureSettings["models"] = {};
  for (const tier of ["fast", "quality"] as const) if (isPictureModelId(v[tier])) models[tier] = v[tier];
  return models;
}

const KINDS: PictureKind[] = ["frame", "anchor"];
const SUBJECT_KINDS: PictureSubjectKind[] = ["turn", "entity", "item", "location"];
export const COMPOSITIONS: PictureComposition[] = ["frame", "portrait", "figure", "item", "location", "holding", "atlas"];
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
    models: parsePictureModels(v.models),
    director: typeof v.director === "boolean" ? v.director : false,
    timeZone: isTimeZone(v.timeZone) ? v.timeZone : "UTC",
    revision: Number.isSafeInteger(v.revision) ? (v.revision as number) : 0,
  };
}
/** The zone names the database takes (migration 79); the database also checks it knows the zone. */
export const isTimeZone = (v: unknown): v is string => typeof v === "string" && /^[A-Za-z][A-Za-z0-9_+/-]{0,63}$/.test(v);
export function parsePictureReview(raw: unknown): PictureReview | null {
  if (!isRecord(raw) || typeof raw.ok !== "boolean") return null;
  const text = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
  return {
    ok: raw.ok,
    problems: Array.isArray(raw.problems) ? raw.problems.map((v) => text(v, 160)).filter(Boolean).slice(0, 6) : [],
    redrawId: isUuid(raw.redrawId) ? raw.redrawId : null,
    gaze: Array.isArray(raw.gaze) ? raw.gaze.filter(isRecord).map((row) => ({ key: text(row.key, 80), looksAt: text(row.looksAt, 80) })).filter((row) => row.key && row.looksAt).slice(0, 6) : [],
    checkedAt: typeof raw.checkedAt === "string" ? raw.checkedAt : "",
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
    caption: typeof raw.caption === "string" && raw.caption.trim() ? raw.caption.trim().slice(0, 300) : null,
    review: parsePictureReview(raw.review),
  };
}
export function parsePictureStyle(raw: unknown): PictureStyle | null {
  if (!isRecord(raw) || !isUuid(raw.id) || !oneOf(["world", "campaign"] as const, raw.scope) || !isUuid(raw.scopeId) || !Number.isSafeInteger(raw.version) ||
    typeof raw.preset !== "string" || typeof raw.label !== "string" || typeof raw.styleText !== "string" || typeof raw.createdAt !== "string")
    return null;
  return { id: raw.id, scope: raw.scope, scopeId: raw.scopeId, version: raw.version as number, preset: raw.preset, label: raw.label,
    styleText: raw.styleText, hasReference: raw.hasReference === true, active: raw.active === true, createdAt: raw.createdAt };
}
export function parseVisualProfile(raw: unknown): VisualProfile | null {
  if (!isRecord(raw) || !isUuid(raw.id) || !oneOf(["entity", "location"] as const, raw.subjectKind) || !isUuid(raw.subjectId) || !Number.isSafeInteger(raw.version) ||
    typeof raw.look !== "string" || !oneOf(["model", "owner"] as const, raw.source) || typeof raw.createdAt !== "string") return null;
  return { id: raw.id, subjectKind: raw.subjectKind, subjectId: raw.subjectId, version: raw.version as number, look: raw.look,
    changes: Array.isArray(raw.changes) ? raw.changes.filter((v): v is string => typeof v === "string" && v.trim().length > 0).slice(0, 12) : [], source: raw.source, createdAt: raw.createdAt };
}
export function parsePictureBoard(raw: unknown): PictureBoard | null {
  if (!isRecord(raw) || !isUuid(raw.campaignId)) return null;
  const today = isRecord(raw.today) ? raw.today : {};
  return {
    campaignId: raw.campaignId,
    worldId: isUuid(raw.worldId) ? raw.worldId : null,
    settings: parsePictureSettings(raw.settings),
    today: { count: Number.isSafeInteger(today.count) ? (today.count as number) : 0, costUsdMicros: Number.isSafeInteger(today.costUsdMicros) ? (today.costUsdMicros as number) : 0,
      since: typeof today.since === "string" ? today.since : null },
    styles: Array.isArray(raw.styles) ? raw.styles.map(parsePictureStyle).filter((row): row is PictureStyle => row !== null) : [],
    pictures: Array.isArray(raw.pictures) ? raw.pictures.map(parsePicture).filter((row): row is PublicPicture => row !== null) : [],
    profiles: Array.isArray(raw.profiles) ? raw.profiles.map(parseVisualProfile).filter((row): row is VisualProfile => row !== null) : [],
  };
}
export const emptyPictureBoard = (campaignId: string): PictureBoard =>
  ({ campaignId, worldId: null, settings: defaultPictureSettings, today: { count: 0, costUsdMicros: 0 }, styles: [], pictures: [], profiles: [] });
/** The profile in force for a subject: the newest version. */
export function profileFor(board: Pick<PictureBoard, "profiles">, subject: { kind: "entity" | "location"; id: string }): VisualProfile | null {
  return [...(board.profiles ?? [])].filter((row) => row.subjectKind === subject.kind && row.subjectId === subject.id).sort((a, b) => b.version - a.version)[0] ?? null;
}
/** The profile's text for a brief: the look and the story's changes so far. */
export const profileText = (profile: VisualProfile | null) => (profile ? { look: profile.look, changes: profile.changes } : null);

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

/** The model of a tier: the owner's choice in the picture settings, else the default of the blind picks. */
export const modelForTier = (tier: PictureTier, settings?: Pick<PictureSettings, "models"> | null): PictureModelId => settings?.models?.[tier] ?? DEFAULT_TIER_MODELS[tier];
/** The size a model draws a composition at: fal keeps the Stage V presets; GPT Image draws frames, figures
 * and places at the bake-off's near-megapixel sizes (its price is per token, so the small presets save
 * little, and the proof was measured at these). Every OpenAI size is a multiple of 16 of at least 512. */
export function pictureSizeFor(model: string, composition: PictureComposition): FalSizePreset {
  const preset = COMPOSITION_SIZE[composition];
  if (!isOpenAIPictureModel(model)) return preset;
  return preset === "landscape_16_9" ? "landscape_16_9_hd" : preset === "portrait_16_9" ? "portrait_16_9_hd" : preset;
}
/** The expected price of one picture for the label before the request: fal at its list price, OpenAI
 * at the bake-off's typical usage (the row is settled to the exact usage afterwards). */
export function pictureCostUsdMicros(tier: PictureTier, composition: PictureComposition, model: string = modelForTier(tier), references = 0) {
  const [width, height] = FAL_SIZES[pictureSizeFor(model, composition)];
  if (isOpenAIPictureModel(model)) return openAIImageTypicalUsdMicros({ model, width, height, quality: "high", references });
  if (!falModel(model)) return 0;
  return falImagePriceUsdMicros(model as FalImageModelId, width, height, references);
}
export const maxReferencesFor = (model: string) => pictureModel(model)?.maxReferences ?? 4;
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
/** Fix run E (item 77): what the frame button's answer means, in words — every answer but «queued» (the drawing
 * shows itself). Null for «queued». */
export function frameStatusText(status: unknown, language: "ru" | "en"): string | null {
  const ru = language === "ru";
  switch (status) {
    case "queued": return null;
    case "existing": return ru ? "Кадр этого хода уже есть." : "This turn already has a frame.";
    case "waiting": return ru ? "Текст хода ещё идёт — кадр появится после первого абзаца." : "The turn is still being written — the frame comes after the first paragraph.";
    case "off": return ru ? "Кадры выключены в настройках картинок." : "Frames are off in the picture settings.";
    case "cap": return ru ? "Дневной лимит картинок исчерпан — новый день начнётся в полночь." : "The daily picture limit is reached — a new day starts at midnight.";
    case "no_text": return ru ? "У этого хода нет текста — рисовать нечего." : "This turn has no text — nothing to draw.";
    case "ooc": return ru ? "Это ответ вне игры — кадр ему не нужен." : "This is an out-of-game reply — it needs no frame.";
    default: return ru ? "Кадр не удалось попросить — попробуй ещё раз." : "The frame could not be requested — try again.";
  }
}
/** Fix run E (item 78b): a frame's caption is its own moment (the shot's), else the turn's first line. */
export function frameCaptionOf(turn: { input: string; narration: string | null }, picture?: Pick<PublicPicture, "caption"> | null): string {
  const text = picture?.caption?.trim() || (turn.narration?.trim() || turn.input).split(/\n/)[0].trim().replace(/^[*_(\s]+/, "");
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
}
/** Fix run E (item 80): the gallery's frames — every shown frame in story order, by session (chapter). */
export function galleryChapters(snapshot: CampaignSnapshot, turns: Parameters<typeof chronicleChapters>[1], board: Pick<PictureBoard, "pictures">) {
  return chronicleChapters(snapshot, turns, board)
    .map((chapter) => ({ session: chapter.session, number: chapter.number, frames: chapter.turns.filter((row) => row.frame).map((row) => ({ turn: row.turn, picture: row.frame! })) }))
    .filter((chapter) => chapter.frames.length > 0);
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
  const cost = (tier: PictureTier) => plan.reduce((sum, row) => sum + pictureCostUsdMicros(tier, row.composition, modelForTier(tier, board.settings)), 0);
  return { plan, fastUsdMicros: cost("fast"), qualityUsdMicros: cost("quality") };
}

/** Reference pictures for a shot, in priority order: the style's reference image, the place's
 * anchor, then the portraits of the people in the shot, up to the model's limit. */
export function referencesForShot(board: PictureBoard, input: { entityIds: string[]; locationId: string | null; model: string }) {
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
export function referencesForAnchor(board: PictureBoard, subject: PictureSubject, composition: PictureComposition, model: string) {
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
