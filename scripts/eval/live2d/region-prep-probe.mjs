// Fix S3-accept Д3 probe (docs/stages/FIX_S3_ACCEPT.md): the production chain of a region map on a synthetic Russian
// campaign — a village (like Берегово) with a guard post the records never put inside it, the elder's house and the
// smithy that are, a stone bridge downstream, a forest lodge up the road, two places known by hearsay. (1) the DM's
// region prep (the campaign's DM model, Claude Opus 5.5, through the production request and parser), (2) one picture
// painted from its public text (GPT Image 2.5 Sunburst, the quality tier, the region's size), (3) the scenes' vision
// check (Sonnet 5.5) locating every place, the mismatch verdict and the markers — the guard post's marker inside the
// village. One corrected picture on a miss, as production does on a first draw. Every paid call is reserved against
// this run's budget, registered in the stage ledger (fixs3accept, stage D). Keys come from .env.local or the cloud
// environment (scripts/eval/lib/keys.mjs) and are never printed or written. Nothing here touches a database.
//   FIX_S2_STAGE=D node scripts/eval/live2d/region-prep-probe.mjs [--budget-usd 1.5]
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { providerKey } from "../lib/keys.mjs";
import { openRun } from "../real-replay/lib/ledger.mjs";
import { campaign, HIDDEN_LAYER, id, PLACEMENTS, SECRET } from "./region-probe-campaign.mjs";
import { FAL_SIZES, FalImageError, usd } from "../../../src/lib/visual-frame/fal-image.ts";
import { generateOpenAIImage, openAIImageReserveUsdMicros } from "../../../src/lib/visual-frame/openai-image.ts";
import { pictureSizeFor } from "../../../src/lib/visual-frame/pictures.ts";
import { live2dCrumbs, live2dView } from "../../../src/lib/live2d/hierarchy.ts";
import { attachToSettlements, regionCanonText, regionPaintBrief, regionPlaceIds, regionPrepSource, withCanonParents } from "../../../src/lib/live2d/region-prep.ts";
import { INNER_RADIUS, regionCheckItems, regionMapMarkers, regionMarkers, regionVerdict } from "../../../src/lib/live2d/region-marks.ts";
import { anthropicTextModel, checkRegionMap, draftRegionPrep, REGION_PREP_OUTPUT_TOKENS } from "../../../src/lib/live2d/server/region-vision.ts";
import { CHECK_MODEL } from "../../../src/lib/live2d/server/vision.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const samples = join(root, "docs", "samples", "live2d");
mkdirSync(samples, { recursive: true });
const args = process.argv.slice(2);
const budgetArg = args.includes("--budget-usd") ? Number(args[args.indexOf("--budget-usd") + 1]) : 1.5;
// Probe-only model overrides (never the app's DM pin or CHECK_MODEL): `--prep-model claude-opus-5 --check-model
// claude-sonnet-5` when the key does not reach the 5.5 models; the same request and parse code either way. Prices are
// USD per 1M tokens (the Anthropic list: Opus 5.5 $4/$20, Opus 5 $5/$25, Sonnet 5.5 and Sonnet 5 $2/$10).
const PRICES = { "claude-opus-5-5": { input: 4, output: 20 }, "claude-opus-5": { input: 5, output: 25 }, "claude-sonnet-5-5": { input: 2, output: 10 }, "claude-sonnet-5": { input: 2, output: 10 } };
const option = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const DM_MODEL = option("--prep-model", "claude-opus-5-5");
const CHECKER = option("--check-model", CHECK_MODEL);
if (!PRICES[DM_MODEL] || !PRICES[CHECKER]) throw new Error(`no price for ${DM_MODEL} / ${CHECKER}`);
const OVERRIDE_REASON = DM_MODEL !== "claude-opus-5-5" || CHECKER !== CHECK_MODEL
  ? "The app's Anthropic key does not reach claude-opus-5-5 / claude-sonnet-5-5 now (a free model listing answered 404; the first attempt's prep got HTTP 403 permission_error), so this probe ran the prep on the previous Opus and the check on the previous Sonnet through the same request and parse code. The app's DM pin and CHECK_MODEL are unchanged."
  : null;
const PICTURE_MODEL = "gpt-image-2.5-sunburst";
const STYLE = "Ink and watercolour atlas page, warm aged paper, muted greens and ochres, clear readable landmarks; no text on the picture.";


// ---- the run's guard and the stage ledger ----------------------------------------------------------------------------
const run = await openRun(`fix-s3-accept-d-region-${new Date().toISOString().slice(0, 19)}`, budgetArg, `Д3 region probe: DM prep (${DM_MODEL}) → picture (GPT Image 2.5) → check (${CHECKER}), synthetic`, "fixs3accept", "D");
const capMicros = Math.round(run.budgetUsd * 1_000_000);
let spentMicros = 0;
const calls = [];
const guard = (micros, what) => { if (spentMicros + micros > capMicros) throw new Error(`budget: ${what} (${usd(micros)}) would pass this run's ${usd(capMicros)} (spent ${usd(spentMicros)})`); };
const book = (what, model, micros, extra = {}) => { spentMicros += micros; calls.push({ what, model, usd: Number((micros / 1e6).toFixed(4)), ...extra }); console.log(`  ${what}: ${usd(micros)} (${model})`); };

const anthropic = providerKey("ANTHROPIC_API_KEY"), openai = providerKey("OPENAI_API_KEY");
if (!anthropic || !openai) { await run.settle(0, { error: "keys missing" }); throw new Error("ANTHROPIC_API_KEY / OPENAI_API_KEY missing"); }

async function paint(prompt, what) {
  const [width, height] = FAL_SIZES[pictureSizeFor(PICTURE_MODEL, "region")];
  const input = { model: PICTURE_MODEL, prompt, width, height, quality: "high", format: "jpeg", references: [], moderation: "low" };
  const expected = openAIImageReserveUsdMicros(input);
  guard(expected, what);
  try {
    const result = await generateOpenAIImage(openai, input, { timeoutMs: 300_000 });
    book(what, PICTURE_MODEL, result.priceUsdMicros, { ms: result.elapsedMs, usage: result.usage });
    return { bytes: result.bytes, contentType: result.contentType, ms: result.elapsedMs };
  } catch (error) {
    const billed = error instanceof FalImageError && /^HTTP 400\b/.test(error.detail ?? "") ? 0 : expected;
    book(`${what} (failed)`, PICTURE_MODEL, billed, { error: error instanceof FalImageError ? error.code : String(error).slice(0, 80) });
    return null;
  }
}
async function check(items, image, what) {
  const price = PRICES[CHECKER];
  guard(Math.round((2_500 + 1_800) * price.input + 6_000 * price.output), what);
  const result = await checkRegionMap(anthropic, items, "", image, { model: CHECKER, price });
  book(what, CHECKER, result.costUsdMicros, { ms: result.elapsedMs, usage: result.usage, error: result.error });
  return result;
}
/** The picture, smaller, and a copy with the markers drawn on it (labels in Russian; DejaVu Sans has Cyrillic). */
function save(bytes, markers, names, tag) {
  const base = `fix-s3-accept-d-region-${tag}-${randomBytes(3).toString("hex")}`;
  const plain = join(samples, `${base}.jpg`), marked = join(samples, `${base}-markers.jpg`);
  const ok = spawnSync("convert", ["-", "-strip", "-resize", "1024x", "-quality", "80", `jpg:${plain}`], { input: Buffer.from(bytes) }).status === 0 && existsSync(plain);
  if (!ok) { writeFileSync(plain, bytes); return { plain: `docs/samples/live2d/${base}.jpg`, marked: null }; }
  const draw = ["-font", "DejaVu-Sans", "-pointsize", "15"];
  for (const row of markers) {
    const x = Math.round(row.x * 1024), y = Math.round(row.y * 585);
    const color = row.inner ? "#7fd1c0" : row.approximate ? "#e0b060" : "#ffd27a";
    draw.push("-fill", "none", "-stroke", color, "-strokewidth", row.inner ? "2" : "3", "-draw", `circle ${x},${y} ${x + (row.inner ? 5 : 8)},${y}`,
      "-stroke", "#000000", "-strokewidth", "3", "-fill", "#000000", "-annotate", `+${x + 10}+${y + 5}`, names.get(row.locationId),
      "-stroke", "none", "-fill", "#ffffff", "-annotate", `+${x + 10}+${y + 5}`, names.get(row.locationId));
  }
  const annotated = spawnSync("convert", [plain, ...draw, "-quality", "80", marked]).status === 0 && existsSync(marked);
  return { plain: `docs/samples/live2d/${base}.jpg`, marked: annotated ? `docs/samples/live2d/${base}-markers.jpg` : null };
}

const record = { run: null, at: new Date().toISOString(), what: "Fix S3-accept Д3: the DM designs the region, the painter paints from it, the check places the markers",
  models: { prep: DM_MODEL, picture: PICTURE_MODEL, check: CHECKER, appDefaults: { prep: "the campaign's DM pin (claude-opus-5-5 by default)", check: CHECK_MODEL }, overrideReason: OVERRIDE_REASON },
  prices: { prep: PRICES[DM_MODEL], check: PRICES[CHECKER] },
  earlierAttempts: [
    "03:46 UTC — the prep on claude-opus-5-5: HTTP 403 permission_error (the key does not reach the 5.5 models); $0.",
    "04:27 UTC — the prep on claude-opus-5 with a darker synthetic hidden layer (a cult's cache, a bribe): stop_reason «refusal», no output; booked at its input's upper bound, $0.0104.",
    "04:29 UTC — one diagnostic call (scripts/eval/live2d/region-prep-diagnose.mjs, docs/runs/fix-s3-accept-d-diagnose.json) with the milder hidden layer used below: end_turn, $0.0824.",
    "04:31 UTC — the full chain (prep v1): the DM left the guard post «at the north gate» as its own landmark (within null) and the painter drew it as a separate tower; the check's fractions were far off on the full-size picture (docs/runs/fix-s3-accept-d-probe-v1.json, $0.123).",
    "04:34–04:35 UTC — the check read the v1 picture twice in fractions and in pixels (docs/runs/fix-s3-accept-d-check-variants.json): pixels of the stated size were steady (mean error 0.047 and 0.034 of the picture), fractions were not (0.036, then 0.085) — the check now asks for pixels.",
    "04:35 UTC — the prep with the gate rule added: refusal (category cyber, a false positive; booked $0.049); the diagnosis confirmed the category ($0.049). The request now names places by short keys (p1, p2, …) instead of record IDs and words the DM's notes plainly («secrets»).",
    "04:4x UTC — the keyed request with the gate rule still worded with «gate, wall, palisade, guard post»: refusal (cyber), $0.012 booked from its usage; the rule was reworded («a settlement's edge — by its entrance, its fence or its square»).",
    "04:4x UTC — the reworded rule, still with p-keys and «secrets»: refusal (cyber), $0.020 booked from its usage; the request now names places by plain numbers (1, 2, …) and calls the DM-only part «hidden», as the passing v1 did.",
    "04:4x UTC — numbers and «hidden», the rule still in: refusal (cyber), $0.011 booked from its usage. The rule left the request; the server decides it from the canon's own words instead (attachToSettlements: a place on the settlement's spot whose «where» names the settlement lies inside it).",
    "04:4x UTC — still refused, and now the v1 request and a request without private notes too (docs/runs/fix-s3-accept-d-diagnose.json); a one-place request refused while a plain one passed (region-prep-sanity.mjs), and leaving out each system line in turn found the trigger: the opening «You are the game master of a role-playing campaign, preparing the map…» (docs/runs/fix-s3-accept-d-bisect.json). Reworded in plain words, the one-place request passed.",
  ] };
try {
  const snapshot = campaign();
  const names = new Map(snapshot.locations.map((row) => [row.id, row.name]));
  const pins = live2dView(snapshot, PLACEMENTS, "region", null, id("post")).pins;
  const placeIds = regionPlaceIds(snapshot, pins.map((row) => row.locationId));
  // (1) The DM's prep — the production request and parser; Opus 5.5 at medium effort (the campaign's DM).
  const source = regionPrepSource(snapshot, { anchorId: null, placeIds, hidden: HIDDEN_LAYER, existing: null });
  guard(Math.round((7_000 * PRICES[DM_MODEL].input + REGION_PREP_OUTPUT_TOKENS * PRICES[DM_MODEL].output)), "region prep");
  const prepared = await draftRegionPrep(anthropicTextModel(anthropic, DM_MODEL, { effort: "medium", timeoutMs: 240_000, price: PRICES[DM_MODEL] }), source);
  book("region prep", DM_MODEL, prepared.costUsdMicros, { ms: prepared.elapsedMs, usage: prepared.usage, error: prepared.error });
  if (!prepared.draft) throw new Error(`the prep failed: ${prepared.error}`);
  const { hidden } = prepared.draft;
  // The production step after the DM's reply: a place the canon's words put at a settlement lies inside it.
  const prep = attachToSettlements(prepared.draft.prep, names);
  record.prepAsReturned = { guardPostWithin: names.get(prepared.draft.prep.places.find((row) => row.locationId === id("post"))?.within ?? "") ?? null };
  const tree = withCanonParents(snapshot, [{ prep }]);
  const canon = regionCanonText(prep, names, { regionName: "", language: "ru" });
  const brief = regionPaintBrief(prep, { regionName: "", names, style: STYLE, family: "gpt" });
  const secret = SECRET;
  record.prep = { public: prep, hiddenChars: hidden.length, hiddenKeptOut: { publicPrep: !secret.test(JSON.stringify(prep)), canon: !secret.test(canon.body), brief: !secret.test(brief) },
    guardPostWithin: names.get(prep.places.find((row) => row.locationId === id("post"))?.within ?? "") ?? null,
    treeCrumbs: live2dCrumbs(tree, PLACEMENTS, id("post")).map((row) => `${row.level}:${row.name || "Известный край"}`) };
  record.canon = canon;
  record.brief = brief;
  console.log(`· prep: ${prep.places.length} places, ${prep.routes.length} routes, hidden ${hidden.length} chars; the guard post inside: ${record.prep.guardPostWithin ?? "—"}; secrets kept out: ${JSON.stringify(record.prep.hiddenKeptOut)}`);
  // (2) The picture from the prep's public text; (3) the check; one corrected picture on a miss.
  const items = regionCheckItems(prep, names);
  const first = await paint(brief, "region picture");
  if (!first) throw new Error("the picture failed");
  let checked = await check(items, first, "region check");
  let image = first, verdict = checked.check ? regionVerdict(items, checked.check, "ru") : null;
  record.firstPass = verdict ? { found: verdict.found, required: verdict.required, sideList: verdict.sideList, contradictions: verdict.contradictions, ok: verdict.ok } : { error: checked.error };
  console.log(`· first picture: ${first.ms} ms; check: ${verdict ? `${verdict.found}/${verdict.required} found, side list: ${verdict.sideList.join("; ") || "—"}, invented: ${verdict.contradictions.join("; ") || "—"}` : checked.error}`);
  let files = [];
  const firstMarkers = regionMarkers(items, checked.check);
  files.push(save(first.bytes, firstMarkers.map((row) => ({ ...row, inner: !!items.find((item) => item.locationId === row.locationId)?.within })), names, "first"));
  if (verdict && !verdict.ok) {
    const correction = { missing: verdict.missing.map((row) => `${row.description || "a landmark"} (${row.name})`), misplaced: verdict.misplaced.map((row) => `${row.name}${row.within ? ` inside ${names.get(row.within)}` : ""}`), contradictions: verdict.contradictions };
    const second = await paint(regionPaintBrief(prep, { regionName: "", names, style: STYLE, family: "gpt", correction }), "region picture, corrected");
    if (second) {
      const again = await check(items, second, "region check, corrected");
      const againVerdict = again.check ? regionVerdict(items, again.check, "ru") : null;
      const score = (v) => (v ? (v.missing.length + v.misplaced.length) * 10 + v.contradictions.length : 99);
      record.redraw = againVerdict ? { found: againVerdict.found, required: againVerdict.required, sideList: againVerdict.sideList, contradictions: againVerdict.contradictions, ok: againVerdict.ok } : { error: again.error };
      console.log(`· corrected picture: ${second.ms} ms; check: ${againVerdict ? `${againVerdict.found}/${againVerdict.required} found, side list: ${againVerdict.sideList.join("; ") || "—"}` : again.error}`);
      files.push(save(second.bytes, regionMarkers(items, again.check).map((row) => ({ ...row, inner: !!items.find((item) => item.locationId === row.locationId)?.within })), names, "corrected"));
      if (score(againVerdict) <= score(verdict)) { image = second; checked = again; verdict = againVerdict; }
    }
  }
  void image;
  // The markers the map keeps, and what the screen shows: the guard post inside the village.
  const markers = regionMarkers(items, checked.check);
  const map = { pictureId: id("picture"), markers, prep };
  const regionPins = live2dView(tree, PLACEMENTS, "region", null, id("post")).pins;
  const shown = regionMapMarkers(tree, regionPins, map);
  const town = shown.pins.find((row) => row.locationId === id("village"));
  const post = shown.inner.find((row) => row.locationId === id("post"));
  const drawnAt = checked.check?.items.find((row) => row.key === items.find((item) => item.locationId === id("post"))?.key) ?? null;
  record.final = { status: verdict?.ok ? "ready" : "flagged", sideList: verdict?.sideList ?? [], contradictions: verdict?.contradictions ?? [], found: verdict?.found ?? null, required: verdict?.required ?? null };
  record.markers = markers.map((row) => ({ name: names.get(row.locationId), x: row.x, y: row.y, source: row.source, approximate: row.approximate, confidence: row.confidence }));
  record.screen = {
    regionMarkers: shown.pins.map((row) => ({ name: row.name, status: row.status, x: row.x, y: row.y, approximate: !!row.approximate })),
    insideSettlements: shown.inner.map((row) => ({ name: row.name, in: names.get(row.parentId), x: row.x, y: row.y, approximate: !!row.approximate })),
  };
  record.guardPost = town && post ? { village: [town.x, town.y], marker: [post.x, post.y], distance: Number(Math.hypot(post.x - town.x, post.y - town.y).toFixed(3)), insideVillage: Math.hypot(post.x - town.x, post.y - town.y) <= INNER_RADIUS,
    drawnByThePainterAt: drawnAt?.visible ? [drawnAt.x, drawnAt.y] : null } : null;
  record.files = files;
  console.log(`· guard post: ${record.guardPost ? `marker ${record.guardPost.marker} vs village ${record.guardPost.village} (distance ${record.guardPost.distance}) — ${record.guardPost.insideVillage ? "inside the village" : "OUTSIDE"}` : "not on the map"}`);
} catch (error) {
  record.error = String(error?.message ?? error).slice(0, 200);
  console.error(record.error);
} finally {
  record.calls = calls;
  record.totalUsd = Number((spentMicros / 1e6).toFixed(4));
  record.budgetUsd = run.budgetUsd;
  record.run = (await run.settle(spentMicros / 1e6, { calls: calls.length, file: "docs/runs/fix-s3-accept-d-probe.json" })).entries.at(-1).run;
  writeFileSync(join(root, "docs", "runs", "fix-s3-accept-d-probe.json"), `${JSON.stringify(record, null, 2)}\n`);
  console.log(`· spent ${usd(spentMicros)} of ${usd(capMicros)} → docs/runs/fix-s3-accept-d-probe.json`);
}
