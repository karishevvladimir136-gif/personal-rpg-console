// The music stage's paid bench: the same mood list on every candidate music model, then the
// world soundtracks of the two synthetic worlds with the chosen models. Research-grade records
// go to docs/runs/music-review/ (small MP3s the owner can hear, one JSON record per run);
// every paid call is counted in docs/runs/music-ledger.json before it is sent and settled after,
// and docs/runs/music-ledger.md is rewritten from it. The run stops at the cap (default $50).
//   node scripts/music-bench.mjs compare --world shov|noir --models a,b,c --moods x,y,z [--seconds 60] [--dry]
//   node scripts/music-bench.mjs pack --world shov|noir --model <id> [--moods x,y] [--variants 2] [--model-for mood=id,...] [--models-by-variant a,b,c] [--kbps 96] [--dry]
//   node scripts/music-bench.mjs ledger                      (no paid call; rewrites the markdown ledger)
//   node scripts/music-bench.mjs probe --note "..."          (records an unbilled validation probe at $0)
// Keys come from .env.local (never printed). Synthetic worlds only; the owner's database is never touched.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateFalMusic, FalMusicError } from "../src/lib/audio/fal-music.ts";
import { AUDIO_EXTENSIONS, MUSIC_MODELS, musicModel, musicPriceUsdMicros, requestedSeconds } from "../src/lib/audio/models.ts";
import { MOOD_IDS, mood } from "../src/lib/audio/moods.ts";
import { cueSeconds, musicRequestFor } from "../src/lib/audio/prompts.ts";
import { WORLD_STYLES } from "../src/lib/audio/sample-worlds.ts";
import { providerKey } from "./eval/lib/keys.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const reviewDir = join(root, "docs", "runs", "music-review");
mkdirSync(reviewDir, { recursive: true });
const args = process.argv.slice(2);
const command = args[0];
const arg = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
const flag = (name) => args.includes(name);
const dry = flag("--dry");
const capUsd = Number(arg("--cap", 50));
const usd = (micros) => `$${(micros / 1_000_000).toFixed(4)}`;
const falKey = providerKey("FAL_KEY");

// ---- the ledger: every paid call of this stage, counted before it is sent ----
const ledgerFile = join(root, "docs", "runs", "music-ledger.json");
const ledgerMd = join(root, "docs", "runs", "music-ledger.md");
const ledger = existsSync(ledgerFile) ? JSON.parse(readFileSync(ledgerFile, "utf8")) : { capUsd, totalUsdMicros: 0, note: "The music stage: every fal call, counted at the list price before the request and settled after. Validation probes (rejected by the worker before generation) are recorded at $0.", entries: [] };
function saveLedger() {
  writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2) + "\n");
  const rows = ledger.entries.map((e, i) => `| ${i + 1} | ${e.at.replace("T", " ").slice(0, 19)} | ${e.kind} | ${e.model ?? "—"} | ${e.note.replace(/\|/g, "/")} | ${usd(e.reservedUsdMicros)} | ${e.settled ? usd(e.usdMicros) : "open"} | ${e.outcome ?? ""} |`);
  writeFileSync(ledgerMd, `# Music stage — ledger of paid calls\n\nCap **$${ledger.capUsd}** (the stage file says $40; the owner raised it to $50 in the session's task). Every fal request of the stage, counted at the list price before it is sent and settled after it returns (a failed request settles at the list price: fal may bill it). Validation probes — bodies the worker rejected before any generation — are recorded at $0; fal does not bill them. Times are UTC.\n\n**Total settled: ${usd(ledger.totalUsdMicros)} of $${ledger.capUsd}.**\n\n| # | When | Kind | Model | What | Counted | Settled | Outcome |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n${rows.join("\n")}\n`);
}
function reserve(kind, model, expectedMicros, note) {
  if (ledger.totalUsdMicros + expectedMicros > capUsd * 1_000_000) throw new Error(`budget: ${note} would exceed the $${capUsd} cap (spent ${usd(ledger.totalUsdMicros)})`);
  const entry = { at: new Date().toISOString(), kind, model, note, reservedUsdMicros: expectedMicros, usdMicros: expectedMicros, settled: false };
  ledger.entries.push(entry);
  ledger.totalUsdMicros += expectedMicros;
  saveLedger();
  return entry;
}
function settle(entry, actualMicros, extra = {}) {
  ledger.totalUsdMicros += actualMicros - entry.usdMicros;
  entry.usdMicros = actualMicros;
  entry.settled = true;
  Object.assign(entry, extra);
  saveLedger();
}

// ---- ffmpeg: duration, loudness, a small MP3 for the review pack ----
function probeAudio(file) {
  const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=sample_rate,channels,codec_name", "-of", "json", file]).toString();
  const info = JSON.parse(out);
  const stream = info.streams?.[0] ?? {};
  return { seconds: Number(info.format?.duration ?? 0), sampleRate: Number(stream.sample_rate ?? 0), channels: Number(stream.channels ?? 0), codec: stream.codec_name ?? null };
}
function loudness(file) {
  // ffmpeg reports on stderr.
  const text = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-af", "ebur128=peak=true", "-f", "null", "-"], { encoding: "utf8" }).stderr;
  const integrated = /Integrated loudness:[\s\S]*?I:\s+(-?[\d.]+) LUFS/.exec(text);
  const range = /Loudness range:[\s\S]*?LRA:\s+([\d.]+) LU/.exec(text);
  const peak = /Peak:\s+(-?[\d.]+) dBFS/.exec(text);
  return { lufs: integrated ? Number(integrated[1]) : null, lra: range ? Number(range[1]) : null, peakDbfs: peak ? Number(peak[1]) : null };
}
/** How well the end meets the start: RMS of the last and first 400 ms (a loop seam is smooth when both are near the track's level). */
function seam(file) {
  const rms = (filter) => {
    const out = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-af", `${filter}astats=measure_overall=RMS_level:measure_perchannel=none`, "-f", "null", "-"], { encoding: "utf8" }).stderr;
    const m = /RMS level dB:\s+(-?[\d.]+|-inf)/.exec(out);
    return m ? Number(m[1]) : null;
  };
  const total = probeAudio(file).seconds;
  return { headDb: rms("atrim=0:0.4,"), tailDb: rms(`atrim=${Math.max(0, total - 0.4).toFixed(2)},`), bodyDb: rms("") };
}
const reviewKbps = Number(arg("--kbps", 96));
function toMp3(source, target, kbps = reviewKbps) {
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", source, "-vn", "-codec:a", "libmp3lame", "-b:a", `${kbps}k`, target]);
}

// ---- one generation, counted, recorded, converted ----
async function generate({ world, moodId, modelId, seconds, variant, seed, outDir, baseName }) {
  const model = musicModel(modelId);
  if (!model) throw new Error(`unknown model ${modelId}`);
  const request = musicRequestFor({ styleText: WORLD_STYLES[world].styleText, moodId, model: modelId, seconds, seed, variant });
  const asked = requestedSeconds(model, request.seconds);
  const expected = musicPriceUsdMicros(modelId, asked);
  const note = `${world}/${moodId}${variant ? `#${variant}` : ""} ${asked}s`;
  const entry = reserve("music", modelId, expected, note);
  const record = { world, moodId, modelId, variant: variant ?? 1, requestedSeconds: asked, prompt: request.prompt, negativePrompt: request.negativePrompt, seed: seed ?? null, expectedUsdMicros: expected };
  if (dry) { settle(entry, 0, { outcome: "dry" }); return { ...record, dry: true }; }
  try {
    const result = await generateFalMusic(falKey, request);
    const ext = AUDIO_EXTENSIONS[result.contentType];
    const rawFile = join(outDir, `${baseName}.${ext}`);
    writeFileSync(rawFile, result.bytes);
    const mp3 = join(outDir, `${baseName}.mp3`);
    // The review copy is a small MP3 (the app stores the provider's file as it came).
    const source = ext === "mp3" ? join(outDir, `${baseName}.src.mp3`) : rawFile;
    if (ext === "mp3") { writeFileSync(source, result.bytes); }
    toMp3(source, mp3);
    unlinkSync(source);
    const info = probeAudio(mp3), loud = loudness(mp3), edges = seam(mp3);
    settle(entry, result.priceUsdMicros, { outcome: `ok ${info.seconds.toFixed(1)}s ${result.contentType} ${(result.elapsedMs / 1000).toFixed(0)}s`, requestId: result.requestId });
    const row = { ...record, ok: true, file: mp3.replace(root + "/", ""), providerContentType: result.contentType, outputKeys: result.outputKeys, bytes: result.bytes.byteLength, elapsedMs: result.elapsedMs, requestId: result.requestId, priceUsdMicros: result.priceUsdMicros, seconds: info.seconds, sampleRate: info.sampleRate, channels: info.channels, codec: info.codec, ...loud, seam: edges };
    console.log(`  ${baseName}: ${info.seconds.toFixed(1)}s ${result.contentType} ${usd(result.priceUsdMicros)} in ${(result.elapsedMs / 1000).toFixed(0)}s · ${loud.lufs} LUFS · seam head ${edges.headDb} / tail ${edges.tailDb} / body ${edges.bodyDb} dB`);
    return row;
  } catch (error) {
    const code = error instanceof FalMusicError ? `${error.code}${error.detail ? ` (${error.detail})` : ""}` : String(error?.message ?? error).slice(0, 200);
    // A request refused at submit (HTTP 4xx) was never queued and is not billed; any other failure
    // may still be billed by the provider and stays counted at the list price.
    const refused = error instanceof FalMusicError && error.code === "validation" && /^HTTP 4/.test(error.detail ?? "");
    settle(entry, refused ? 0 : expected, { outcome: `failed: ${code}${refused ? " — refused at submit, never queued: $0" : ""}` });
    console.log(`  ${baseName}: FAILED ${code}`);
    return { ...record, ok: false, error: code };
  }
}

const stamp = () => new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const saveRecord = (name, record) => { const file = join(reviewDir, `${stamp()}-${name}.json`); writeFileSync(file, JSON.stringify(record, null, 2) + "\n"); console.log(`record: ${file.replace(root + "/", "")}`); return file; };
const list = (value, all) => (value ? value.split(",").map((v) => v.trim()).filter(Boolean) : all);

async function main() {
  if (command === "ledger") { saveLedger(); console.log(`ledger: ${usd(ledger.totalUsdMicros)} of $${ledger.capUsd}, ${ledger.entries.length} entries`); return; }
  if (command === "probe") { const e = reserve("probe", arg("--model", null), 0, arg("--note", "validation probe")); settle(e, 0, { outcome: "rejected before generation ($0)" }); return; }
  if (!falKey && !dry) throw new Error("FAL_KEY missing in .env.local");
  const world = arg("--world", "shov");
  if (!WORLD_STYLES[world]) throw new Error(`unknown world ${world}`);
  if (command === "compare") {
    const models = list(arg("--models"), MUSIC_MODELS.map((m) => m.id));
    const moods = list(arg("--moods"), ["travel", "tension", "combat", "warm", "mystery"]);
    const seconds = Number(arg("--seconds", 60));
    const outDir = join(reviewDir, "compare");
    mkdirSync(outDir, { recursive: true });
    const started = Date.now();
    const rows = [];
    for (const moodId of moods) {
      if (!MOOD_IDS.includes(moodId)) throw new Error(`unknown mood ${moodId}`);
      console.log(`mood ${moodId} (${mood(moodId).label.en})`);
      // The models run in parallel per mood: fal queues them independently.
      const results = await Promise.all(models.map((modelId) => generate({ world, moodId, modelId, seconds, outDir, baseName: `${world}-${moodId}-${modelId.replace(/[^a-z0-9.]+/gi, "_")}` })));
      rows.push(...results);
    }
    const record = { kind: "compare", world, styleText: WORLD_STYLES[world].styleText, models, moods, seconds, startedAt: new Date(started).toISOString(), elapsedMs: Date.now() - started, spentUsdMicros: rows.reduce((s, r) => s + (r.priceUsdMicros ?? r.expectedUsdMicros ?? 0), 0), rows };
    saveRecord(`compare-${world}`, record);
    console.log(`spent ${usd(record.spentUsdMicros)}; ledger total ${usd(ledger.totalUsdMicros)} of $${ledger.capUsd}`);
    return;
  }
  if (command === "pack") {
    const defaultModel = arg("--model", "fal-ai/lyria3/pro");
    const perMood = Object.fromEntries(list(arg("--model-for"), []).map((pair) => pair.split("=")));
    // The model of each take (variant 1, 2, 3…); a mood's own model (--model-for) wins, then the default.
    const byVariant = list(arg("--models-by-variant"), []);
    const moods = list(arg("--moods"), [...MOOD_IDS]);
    const variants = Number(arg("--variants", 2));
    // Calm beds get the extra take (ambient textures); driving cues keep the first two.
    const extraTakeMoods = new Set(list(arg("--extra-take-moods"), []));
    const outDir = join(reviewDir, world);
    mkdirSync(outDir, { recursive: true });
    const started = Date.now();
    const rows = [];
    const jobs = [];
    for (const moodId of moods) for (let variant = 1; variant <= variants; variant += 1) {
      if (variant > 2 && extraTakeMoods.size && !extraTakeMoods.has(moodId)) continue;
      jobs.push({ world, moodId, modelId: perMood[moodId] ?? byVariant[variant - 1] ?? defaultModel, seconds: cueSeconds(moodId), variant, seed: variant * 1009 + moods.indexOf(moodId), outDir, baseName: `${moodId}-${variant}` });
    }
    // Three at a time: enough to finish a pack in minutes without flooding the queue.
    for (let i = 0; i < jobs.length; i += 3) {
      const batch = jobs.slice(i, i + 3);
      console.log(`${batch.map((j) => `${j.moodId}#${j.variant}`).join(", ")} on ${[...new Set(batch.map((j) => j.modelId))].join(", ")}`);
      rows.push(...(await Promise.all(batch.map((job) => generate(job)))));
    }
    const record = { kind: "pack", world, styleText: WORLD_STYLES[world].styleText, defaultModel, perMood, moods, variants, startedAt: new Date(started).toISOString(), elapsedMs: Date.now() - started, spentUsdMicros: rows.reduce((s, r) => s + (r.priceUsdMicros ?? r.expectedUsdMicros ?? 0), 0), rows };
    saveRecord(`pack-${world}`, record);
    const lines = rows.filter((r) => r.ok).map((r) => `| ${r.moodId} | ${mood(r.moodId).label.ru} | ${r.variant} | ${musicModel(r.modelId).label} | ${r.seconds.toFixed(0)} s | ${r.lufs} LUFS | ${usd(r.priceUsdMicros)} | \`${r.file.replace("docs/runs/music-review/", "")}\` |`);
    writeFileSync(join(outDir, "moods.md"), `# ${WORLD_STYLES[world].title} — soundtrack\n\nStyle: ${WORLD_STYLES[world].styleText}\n\n| Mood | Настроение | Take | Model | Length | Loudness | Cost | File |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n${lines.join("\n")}\n\nTotal ${usd(record.spentUsdMicros)}; failed: ${rows.filter((r) => !r.ok).length}.\n`);
    console.log(`spent ${usd(record.spentUsdMicros)}; ledger total ${usd(ledger.totalUsdMicros)} of $${ledger.capUsd}`);
    return;
  }
  throw new Error("usage: compare | pack | ledger | probe (see the header)");
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
