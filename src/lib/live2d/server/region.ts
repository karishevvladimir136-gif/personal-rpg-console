import "server-only";
import { readCampaign } from "../../server/repository";
import { readMapLayout } from "../../server/map-layout";
import { PersistenceError } from "../../server/errors";
import { isUuid } from "../../persistence/validation";
import { boardOf as picturesBoardOf, picturesContext } from "../../server/media/pictures-store";
import { createPictureRow } from "../../visual-frame/picture-job";
import { runPictureJob, type Schedule } from "../../server/media/pictures-service";
import { activeStyle, capRemaining, modelForTier, styleTextFor } from "../../visual-frame/pictures";
import { promptFamily } from "../../visual-frame/prompt-compiler";
import { regionMapOf } from "../contracts";
import { live2dView } from "../hierarchy";
import { regionMapPrompt, regionSignature } from "../region";
import { draftSeeds } from "./vision";
import { boardOf, listSeeds, live2dContext, plantSeed, saveRegionMap } from "./store";

// The region map (slice item 1): a stable painted map of the region the party
// travels, drawn once from the places the records know and the atlas layout,
// redrawn only when a new place appears (the signature). With the first map of
// an area the DM's hidden layer gets its seeds (slice item 5): a few latent
// hooks, stored privately, never in the public board.

const log = (event: string, data: Record<string, unknown>) => console.info(JSON.stringify({ event, ...data }));
const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const detached: Schedule = (work) => { void work().catch((error) => log("live2d_job_failed", { message: String((error as Error)?.message ?? error).slice(0, 200) })); };

export type RegionDrawResult = { status: "queued" | "existing" | "cap" | "empty" | "drawing"; anchorId: string | null };

export async function drawRegionMap(campaignId: string, value: unknown, schedule: Schedule = detached): Promise<RegionDrawResult> {
  if (!isRecord(value) || (value.anchorId !== null && !isUuid(value.anchorId)) || (value.force !== undefined && typeof value.force !== "boolean")) throw new PersistenceError("validation");
  const anchorId = value.anchorId as string | null;
  const ctx = await live2dContext(campaignId);
  const [snapshot, layout, board] = await Promise.all([readCampaign(campaignId), readMapLayout(campaignId), boardOf(ctx)]);
  if (anchorId && !snapshot.locations.some((row) => row.id === anchorId && row.campaign_id === campaignId)) throw new PersistenceError("not_found");
  const view = live2dView(snapshot, layout.placements, "region", anchorId, snapshot.publicState.current_location_id);
  if (!view.pins.length) return { status: "empty", anchorId };
  const signature = regionSignature(view.pins);
  const existing = regionMapOf(board, anchorId);
  if (existing?.status === "drawing") return { status: "drawing", anchorId };
  if (existing?.status === "ready" && existing.signature === signature && value.force !== true) return { status: "existing", anchorId };
  const pictures = await picturesContext(campaignId);
  const pictureBoard = await picturesBoardOf(pictures);
  if (!capRemaining(pictureBoard)) return { status: "cap", anchorId };
  if (!snapshot.timeline) throw new PersistenceError("conflict");
  const anchor = anchorId ? snapshot.locations.find((row) => row.id === anchorId) ?? null : null;
  const named = (id: string) => snapshot.locations.find((row) => row.id === id);
  // The road the party travelled: visited places in the order the public scenes first mention them.
  const visitedOrder = view.pins.filter((pin) => pin.status === "visited").map((pin) => ({ pin, at: snapshot.scenes.findIndex((scene) => scene.body.includes(pin.name)) }))
    .sort((a, b) => (a.at < 0 ? 1e9 : a.at) - (b.at < 0 ? 1e9 : b.at)).map((row) => row.pin.name);
  const model = modelForTier("quality", pictureBoard.settings);
  const style = activeStyle(pictureBoard);
  const prompt = regionMapPrompt({
    regionName: anchor?.name ?? null, regionDescription: anchor?.description ?? "", canon: "",
    places: view.pins.map((pin) => ({ name: pin.name, description: named(pin.locationId)?.description ?? "", x: pin.x, y: pin.y, status: pin.status })),
    route: visitedOrder, style: styleTextFor(pictureBoard, snapshot.settings.values.visualStyle), family: promptFamily(model) === "gpt-image" ? "gpt" : promptFamily(model) === "flux" ? "flux" : "other",
  });
  // The picture row's subject: the region place, or — flat — the first place drawn (the map record holds the picture).
  const subjectId = anchorId ?? [...view.pins].sort((a, b) => a.locationId.localeCompare(b.locationId))[0].locationId;
  const picture = await createPictureRow(pictures, {
    id: crypto.randomUUID(), kind: "anchor", subjectKind: "location", subjectId, composition: "region", timeline: snapshot.timeline,
    tier: "quality", trigger: "manual", model, styleVersionId: style?.id ?? null, shot: { signature, places: view.pins.map((pin) => pin.name) }, prompt,
    referenceIds: style?.hasReference ? [style.id] : [],
  });
  await saveRegionMap(ctx, { anchorId, pictureId: existing?.pictureId ?? null, signature: existing?.signature ?? "", status: "drawing" });
  log("live2d_region_queued", { campaignId, anchorId, pictureId: picture.id, places: view.pins.length, model });
  schedule(async () => {
    const ready = await runPictureJob(pictures, picture.id);
    if (ready?.status === "ready") await saveRegionMap(ctx, { anchorId, pictureId: picture.id, signature, status: "ready" });
    else await saveRegionMap(ctx, { anchorId, pictureId: existing?.pictureId ?? null, signature: existing?.signature ?? "", status: "failed" });
    log("live2d_region_done", { campaignId, anchorId, pictureId: picture.id, status: ready?.status ?? "failed", costUsdMicros: ready?.costUsdMicros ?? 0 });
    // The hidden layer's seeds for this area, once (never for a redraw that already has them).
    await seedArea(campaignId, anchorId, { name: anchor?.name ?? snapshot.campaign.title, description: anchor?.description ?? snapshot.publicState.summary, places: view.pins.map((pin) => pin.name), language: snapshot.settings.values.language === "en" ? "en" : "ru" }).catch((error) =>
      log("live2d_seeds_failed", { campaignId, anchorId, message: String((error as Error)?.message ?? error).slice(0, 200) }));
  });
  return { status: "queued", anchorId };
}

/** Plant the area's latent hooks when it has none: private DM notes in the `poi_seed_<area>_<n>` form. */
export async function seedArea(campaignId: string, anchorId: string | null, input: { name: string; description: string; places: string[]; language: "ru" | "en" }) {
  const ctx = await live2dContext(campaignId);
  const existing = await listSeeds(ctx);
  if (existing.some((row) => row.areaLocationId === anchorId)) return { status: "existing" as const, count: existing.filter((row) => row.areaLocationId === anchorId).length };
  const drafted = await draftSeeds(process.env.ANTHROPIC_API_KEY ?? "", { areaName: input.name, description: input.description, canon: "", places: input.places, language: input.language });
  log("live2d_seeds", { campaignId, anchorId, count: drafted.seeds.length, ms: drafted.elapsedMs, costUsdMicros: drafted.costUsdMicros, usage: drafted.usage, error: drafted.error });
  const area = (anchorId ?? "known").replace(/[^a-z0-9]/gi, "").slice(0, 12).toLowerCase() || "known";
  let planted = 0;
  for (const [index, seed] of drafted.seeds.entries()) {
    const row = await plantSeed(ctx, { id: crypto.randomUUID(), areaLocationId: anchorId, key: `poi_seed_${area}_${index + 1}`, theme: seed.theme, premise: seed.premise });
    if (row) planted += 1;
  }
  return { status: "planted" as const, count: planted, costUsdMicros: drafted.costUsdMicros };
}
