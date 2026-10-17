import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { authorizeCampaign } from "../campaign-authorization";
import { databaseError, PersistenceError } from "../errors";
import { isUuid } from "../../persistence/validation";
import { sniffImage, type FalReference } from "../../visual-frame/fal-image";
import { parsePicture, parsePictureBoard, parsePictureSettings, parsePictureStyle, parseVisualProfile, stylePreset, type PictureBoard } from "../../visual-frame/pictures";
import { privatePicture, styleStoragePath, type PictureJobContext, type PictureRpcAction } from "../../visual-frame/picture-job";

export { createPictureRow, loadReferences, pictureStoragePath, privatePicture, updatePictureRow } from "../../visual-frame/picture-job";

// The Stage V picture store: one RPC (rpg_pictures) for rows, the private
// rpg-media bucket for pixels. The owner's service credentials never leave the
// server; a client receives projections and short-lived signed URLs only.

export type PicturesContext = PictureJobContext & { ownerId: string; client: SupabaseClient };

function serviceClient(ownerId: string) {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !isUuid(ownerId) || ownerId !== process.env.RPG_OWNER_USER_ID) throw new PersistenceError("not_configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}
export async function picturesContext(campaignId: string): Promise<PicturesContext> {
  const { user } = await authorizeCampaign(campaignId);
  const client = serviceClient(user.id);
  return {
    campaignId, ownerId: user.id, client,
    rpc: async (action: PictureRpcAction, payload: unknown = {}) => {
      const response = await client.rpc("rpg_pictures", { p_owner_id: user.id, p_campaign_id: campaignId, p_action: action, p_payload: payload });
      if (response.error) throw databaseError(response.error);
      return response.data;
    },
    storage: { put: (path, bytes, contentType) => putObject(client, path, bytes, contentType), get: (path) => getObject(client, path) },
    sha256,
    log: (event, data) => console.info(JSON.stringify({ event, ...data })),
  };
}

const BUCKET = "rpg-media";
export const sha256 = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

export async function putObject(client: SupabaseClient, path: string, bytes: Uint8Array, contentType: string) {
  const response = await client.storage.from(BUCKET).upload(path, bytes, { contentType, upsert: false, cacheControl: "3600" });
  if (response.error) throw new PersistenceError("unavailable");
}
const MAX_OBJECT_BYTES = 12_000_000;
export async function getObject(client: SupabaseClient, path: string): Promise<FalReference | null> {
  const response = await client.storage.from(BUCKET).download(path);
  if (response.error) {
    if (String(response.error.status) === "404" || response.error.message === "Object not found") return null;
    throw new PersistenceError("unavailable");
  }
  if (!response.data || response.data.size > MAX_OBJECT_BYTES) throw new PersistenceError("unavailable");
  const bytes = new Uint8Array(await response.data.arrayBuffer());
  const contentType = sniffImage(bytes);
  if (!contentType) throw new PersistenceError("unavailable");
  return { bytes, contentType };
}
async function signedUrl(client: SupabaseClient, path: string, seconds: number) {
  const response = await client.storage.from(BUCKET).createSignedUrl(path, seconds);
  if (response.error || !response.data?.signedUrl) throw new PersistenceError("unavailable");
  return response.data.signedUrl;
}

export async function readPictureBoard(campaignId: string): Promise<PictureBoard> {
  const ctx = await picturesContext(campaignId);
  return boardOf(ctx);
}
export async function boardOf(ctx: PicturesContext): Promise<PictureBoard> {
  const board = parsePictureBoard(await ctx.rpc("read"));
  if (!board) throw new PersistenceError("unavailable");
  return board;
}

const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
export async function savePictureSettings(campaignId: string, value: unknown) {
  if (!isRecord(value) || !Number.isSafeInteger(value.expectedRevision)) throw new PersistenceError("validation");
  const next = parsePictureSettings(value);
  const ctx = await picturesContext(campaignId);
  return parsePictureSettings(await ctx.rpc("settings.save", { expectedRevision: value.expectedRevision, frames: next.frames, quality: next.quality, dailyCap: next.dailyCap, autopilot: next.autopilot, models: next.models }));
}

/** A style version: preset or custom text, an optional reference image (a data URL from the
 * owner's upload, or the reference of an earlier version to keep), activated or kept in history. */
export async function savePictureStyle(campaignId: string, value: unknown) {
  if (!isRecord(value) || !["world", "campaign"].includes(String(value.scope)) || typeof value.styleText !== "string" || value.styleText.length > 2000 ||
    typeof value.label !== "string" || !value.label.trim() || value.label.length > 120 || typeof value.activate !== "boolean")
    throw new PersistenceError("validation");
  const preset = typeof value.preset === "string" && (value.preset === "custom" || stylePreset(value.preset)) ? value.preset : "custom";
  const ctx = await picturesContext(campaignId);
  const id = crypto.randomUUID();
  let reference: { storagePath: string; sha256: string; contentType: string } | null = null;
  if (typeof value.referenceDataUrl === "string") {
    const bytes = decodeDataUrl(value.referenceDataUrl);
    const contentType = sniffImage(bytes);
    if (!contentType || bytes.byteLength > 5_000_000) throw new PersistenceError("validation");
    const storagePath = styleStoragePath(id, contentType);
    await putObject(ctx.client, storagePath, bytes, contentType);
    reference = { storagePath, sha256: sha256(bytes), contentType };
  } else if (isUuid(value.keepReferenceOf)) {
    const previous = await ctx.rpc("style.private", { styleId: value.keepReferenceOf }) as Record<string, unknown>;
    if (typeof previous.referencePath === "string" && typeof previous.referenceSha256 === "string" && typeof previous.referenceContentType === "string")
      reference = { storagePath: previous.referencePath, sha256: previous.referenceSha256, contentType: previous.referenceContentType };
  } else if (value.referenceDataUrl !== undefined && value.referenceDataUrl !== null) throw new PersistenceError("validation");
  const style = parsePictureStyle(await ctx.rpc("style.save", { id, scope: value.scope, preset, label: value.label.trim(), styleText: value.styleText, reference, activate: value.activate }));
  if (!style) throw new PersistenceError("unavailable");
  return style;
}
export async function activatePictureStyle(campaignId: string, value: unknown) {
  if (!isRecord(value) || !isUuid(value.styleId)) throw new PersistenceError("validation");
  const ctx = await picturesContext(campaignId);
  return parsePictureStyle(await ctx.rpc("style.activate", { styleId: value.styleId }));
}
export async function clearPictureStyle(campaignId: string, value: unknown) {
  if (!isRecord(value) || !["world", "campaign"].includes(String(value.scope))) throw new PersistenceError("validation");
  const ctx = await picturesContext(campaignId);
  await ctx.rpc("style.clear", { scope: value.scope });
  return boardOf(ctx);
}
/** Polish 2 §3: the owner's edit of a visual profile (the look and the story's changes) — a new version, source «owner». */
export async function saveVisualProfile(campaignId: string, value: unknown) {
  if (!isRecord(value) || !isRecord(value.subject) || !["entity", "location"].includes(String(value.subject.kind)) || !isUuid(value.subject.id) ||
    typeof value.look !== "string" || value.look.length > 2000 ||
    (value.changes !== undefined && (!Array.isArray(value.changes) || value.changes.length > 12 || value.changes.some((row) => typeof row !== "string" || !row.trim() || row.length > 300))))
    throw new PersistenceError("validation");
  const ctx = await picturesContext(campaignId);
  const changes = Array.isArray(value.changes) ? (value.changes as string[]).map((row) => row.trim()) : [];
  return parseVisualProfile(await ctx.rpc("profile.save", { id: crypto.randomUUID(), subjectKind: value.subject.kind, subjectId: value.subject.id, look: value.look.trim(), changes, source: "owner" }));
}
export async function hidePicture(campaignId: string, value: unknown) {
  if (!isRecord(value) || !isUuid(value.id) || typeof value.hidden !== "boolean") throw new PersistenceError("validation");
  const ctx = await picturesContext(campaignId);
  return parsePicture(await ctx.rpc("picture.hide", { id: value.id, hidden: value.hidden }));
}

/** Signed, short-lived URL of a ready picture of this campaign (the only way pixels reach a client). */
export async function signedPictureUrl(campaignId: string, pictureId: string) {
  if (!isUuid(campaignId) || !isUuid(pictureId)) throw new PersistenceError("not_found");
  const ctx = await picturesContext(campaignId);
  const picture = await privatePicture(ctx, pictureId);
  if (picture.status !== "ready" || !picture.storagePath) throw new PersistenceError("not_found");
  return signedUrl(ctx.client, picture.storagePath, 300);
}
export async function signedStyleReferenceUrl(campaignId: string, styleId: string) {
  if (!isUuid(campaignId) || !isUuid(styleId)) throw new PersistenceError("not_found");
  const ctx = await picturesContext(campaignId);
  const style = await ctx.rpc("style.private", { styleId }) as Record<string, unknown>;
  if (typeof style.referencePath !== "string") throw new PersistenceError("not_found");
  return signedUrl(ctx.client, style.referencePath, 300);
}


export function decodeDataUrl(value: string): Uint8Array {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=\s]+)$/.exec(value);
  if (!match || value.length > 8_000_000) throw new PersistenceError("validation");
  return new Uint8Array(Buffer.from(match[2].replace(/\s/g, ""), "base64"));
}
