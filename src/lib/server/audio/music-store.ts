import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createHash, randomUUID } from "node:crypto";
import { authorizeCampaign } from "../campaign-authorization";
import { databaseError, PersistenceError } from "../errors";
import { isUuid } from "../../persistence/validation";
import { parseMusicPack, parseMusicSettings, parseMusicSettingsInput, parseMusicState, parseMusicTrack, type MusicState, type SceneSignalView } from "../../audio/contracts";
import { generateFalMusic } from "../../audio/fal-music";
import { createPack, MusicJobError, planAmbientPack, planPack, runNextTrack, storeUpload, type MusicJobContext, type MusicRpcAction } from "../../audio/music-job";
import { isAmbientId } from "../../audio/ambient";
import { latestCommittedTurn } from "../../audio/mood-select";
import { MAX_TRACK_BYTES, sniffAudio, type AudioContentType } from "../../audio/models";
import { isMoodId } from "../../audio/moods";
import { signalFromPlay } from "../../audio/mood-select";
import { readPlay } from "../gameplay-service";
import { readPublicCampaign } from "../public-campaign";

// The music store: one RPC (rpg_music) for rows, the private rpg-media bucket for
// the tracks. The owner's service credentials and the fal key never leave the
// server; a client receives projections and the bytes of ready tracks only.

const BUCKET = "rpg-media";
const sha256 = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

function serviceClient(ownerId: string) {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !isUuid(ownerId) || ownerId !== process.env.RPG_OWNER_USER_ID) throw new PersistenceError("not_configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}

export type MusicContext = MusicJobContext & { ownerId: string; client: SupabaseClient };

export async function musicContext(campaignId: string): Promise<MusicContext> {
  const { user } = await authorizeCampaign(campaignId);
  const client = serviceClient(user.id);
  return {
    campaignId, ownerId: user.id, client,
    rpc: async (action: MusicRpcAction, payload: unknown = {}) => {
      const response = await client.rpc("rpg_music", { p_owner_id: user.id, p_campaign_id: campaignId, p_action: action, p_payload: payload });
      if (response.error) throw databaseError(response.error);
      return response.data;
    },
    storage: {
      put: async (path, bytes, contentType) => {
        const response = await client.storage.from(BUCKET).upload(path, bytes, { contentType, upsert: false, cacheControl: "3600" });
        if (response.error) throw new PersistenceError("unavailable");
      },
    },
    sha256,
    generate: (request) => generateFalMusic(process.env.FAL_KEY ?? "", request),
    newId: randomUUID,
    log: (event, data) => console.info(JSON.stringify({ event, ...data })),
  };
}

async function stateOf(ctx: MusicContext): Promise<MusicState> {
  const raw = await ctx.rpc("read");
  const state = parseMusicState({ ...(raw as Record<string, unknown>), generation: { configured: Boolean(process.env.FAL_KEY) } });
  if (!state) throw new PersistenceError("unavailable");
  return state;
}
export async function readMusicState(campaignId: string) {
  return stateOf(await musicContext(campaignId));
}

const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

export async function saveMusicSettings(campaignId: string, value: unknown) {
  const input = parseMusicSettingsInput(value);
  if (!input) throw new PersistenceError("validation");
  const ctx = await musicContext(campaignId);
  const saved = parseMusicSettings(await ctx.rpc("settings.save", input));
  if (!saved) throw new PersistenceError("unavailable");
  return saved;
}

/** A new pack of the campaign's world (or campaign): the rows are created now, the tracks are
 * generated one per `runMusicJob` call, so no request waits on a track. */
export async function generateMusicPack(campaignId: string, value: unknown) {
  if (!isRecord(value)) throw new PersistenceError("validation");
  const ctx = await musicContext(campaignId);
  const state = await stateOf(ctx);
  if (!state.generation.configured) throw new PersistenceError("not_configured");
  try {
    const common = { settings: state.settings, styleText: typeof value.styleText === "string" ? value.styleText : undefined, model: typeof value.model === "string" ? value.model : undefined,
      variants: typeof value.variants === "number" ? value.variants : undefined, newId: ctx.newId };
    const plan = value.layer === "ambient"
      ? planAmbientPack({ ...common, kinds: Array.isArray(value.kinds) && value.kinds.every(isAmbientId) ? value.kinds : undefined })
      : planPack({ ...common, moods: Array.isArray(value.moods) && value.moods.every(isMoodId) ? value.moods : undefined });
    if (plan.expectedUsdMicros > plan.capUsdMicros) throw new PersistenceError("conflict");
    await createPack(ctx, plan);
  } catch (error) {
    if (error instanceof MusicJobError) throw new PersistenceError(error.code);
    throw error;
  }
  return stateOf(ctx);
}

export async function cancelMusicPack(campaignId: string, value: unknown) {
  if (!isRecord(value) || !isUuid(value.id)) throw new PersistenceError("validation");
  const ctx = await musicContext(campaignId);
  const pack = parseMusicPack(await ctx.rpc("pack.cancel", { id: value.id }));
  if (!pack) throw new PersistenceError("unavailable");
  return stateOf(ctx);
}

/** One queued track of the pack, generated now (the paid step), then the state. */
export async function runMusicJob(campaignId: string) {
  const ctx = await musicContext(campaignId);
  if (!process.env.FAL_KEY) throw new PersistenceError("not_configured");
  const run = await runNextTrack(ctx);
  return { ...(await stateOf(ctx)), run: run.outcome };
}

export async function uploadMusicTrack(campaignId: string, input: { bytes: Uint8Array; title: string; moods: unknown }) {
  const ctx = await musicContext(campaignId);
  try {
    await storeUpload(ctx, input);
  } catch (error) {
    if (error instanceof MusicJobError) throw new PersistenceError(error.code);
    throw error;
  }
  return stateOf(ctx);
}

export async function hideMusicTrack(campaignId: string, value: unknown) {
  if (!isRecord(value) || !isUuid(value.id) || typeof value.hidden !== "boolean") throw new PersistenceError("validation");
  const ctx = await musicContext(campaignId);
  const track = parseMusicTrack(await ctx.rpc("track.hide", { id: value.id, hidden: value.hidden }));
  if (!track) throw new PersistenceError("unavailable");
  return track;
}
export async function tagMusicTrack(campaignId: string, value: unknown) {
  if (!isRecord(value) || !isUuid(value.id) || !Array.isArray(value.moods) || !value.moods.every(isMoodId) || (value.title !== undefined && typeof value.title !== "string")) throw new PersistenceError("validation");
  const ctx = await musicContext(campaignId);
  const track = parseMusicTrack(await ctx.rpc("track.tag", { id: value.id, moods: value.moods, ...(typeof value.title === "string" ? { title: value.title } : {}) }));
  if (!track) throw new PersistenceError("unavailable");
  return track;
}

/** The bytes of a ready track of this campaign's scope (streamed same-origin so the browser can decode it). */
export async function musicTrackBytes(campaignId: string, trackId: string): Promise<{ bytes: Uint8Array; contentType: AudioContentType }> {
  if (!isUuid(campaignId) || !isUuid(trackId)) throw new PersistenceError("not_found");
  const ctx = await musicContext(campaignId);
  const raw = await ctx.rpc("track.private", { id: trackId }) as Record<string, unknown>;
  const track = parseMusicTrack(raw);
  if (!track || track.status !== "ready" || typeof raw.storagePath !== "string") throw new PersistenceError("not_found");
  const response = await ctx.client.storage.from(BUCKET).download(raw.storagePath);
  if (response.error || !response.data || response.data.size > MAX_TRACK_BYTES) throw new PersistenceError("unavailable");
  const bytes = new Uint8Array(await response.data.arrayBuffer());
  const contentType = sniffAudio(bytes);
  if (!contentType) throw new PersistenceError("unavailable");
  return { bytes, contentType };
}

/** The public scene signal for the player: what the committed turn's public projection, the clock
 * and the current place say. Nothing DM-private is read here. */
export async function musicSceneSignal(campaignId: string): Promise<SceneSignalView> {
  await authorizeCampaign(campaignId);
  const [play, data] = await Promise.all([readPlay(campaignId), readPublicCampaign(campaignId)]);
  const signal = signalFromPlay({ turns: play.turns, encounters: play.encounters, worldMinutes: play.worldMinutes }, data);
  const narration = latestCommittedTurn(play)?.narration ?? null;
  return { ...signal, narration: typeof narration === "string" ? narration.slice(-4000) : null, turnPending: play.turns.some((turn) => turn.status !== "committed" && turn.status !== "cancelled" && turn.status !== "failed") };
}
