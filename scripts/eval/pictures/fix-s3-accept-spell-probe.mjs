// Fix S3-accept В1 probe (docs/stages/FIX_S3_ACCEPT.md): two of the hero's spells drawn the way the app draws a spell —
// the subject's description as `spellSubjects` builds it from the Russian card, the prompt by `falSubjectPrompt`
// (composition «spell»), the quality tier's model and its square size. No database, no campaign: the picture only.
// Every paid call is reserved against this run's budget and registered in the stage ledger (fixs3accept, block V).
// Keys come from .env.local or the cloud environment (scripts/eval/lib/keys.mjs) and are never printed.
//   NODE_USE_ENV_PROXY=1 node scripts/eval/pictures/fix-s3-accept-spell-probe.mjs [--spells "Огненный шар,Щит"]
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { providerKey } from "../lib/keys.mjs";
import { openRun, ROOT } from "../real-replay/lib/ledger.mjs";
import { FAL_SIZES, FalImageError, falSubjectPrompt, usd } from "../../../src/lib/visual-frame/fal-image.ts";
import { generateOpenAIImage, openAIImageReserveUsdMicros } from "../../../src/lib/visual-frame/openai-image.ts";
import { pictureSizeFor } from "../../../src/lib/visual-frame/pictures.ts";
import { spellCard } from "../../../src/lib/inventory/spell-records.ts";

const args = process.argv.slice(2);
const names = (args.includes("--spells") ? args[args.indexOf("--spells") + 1] : "Огненный шар,Щит").split(",").map((name) => name.trim()).filter(Boolean);
const MODEL = "gpt-image-2.5-sunburst";
const STYLE = "Painterly dark-fantasy illustration, warm candlelight and bronze accents, rich texture, readable at a small size.";
const key = providerKey("OPENAI_API_KEY");
if (!key) { console.error("no OpenAI key (.env.local or APP_OPENAI_API_KEY)"); process.exit(2); }

const run = await openRun(`fix-s3-accept-v-spells-${new Date().toISOString().slice(0, 19)}`, 0.3, `В1 spell pictures: ${names.join(", ")} (${MODEL}, the spell composition), no database`, "fixs3accept", "V");
const capMicros = Math.round(run.budgetUsd * 1e6);
let spentMicros = 0;
const rows = [];
mkdirSync(join(ROOT, "docs", "samples", "spells"), { recursive: true });
try {
  for (const name of names) {
    const card = spellCard(name);
    if (!card) { rows.push({ name, error: "no card" }); continue; }
    // The same description `spellSubjects` (src/lib/visual-frame/pictures.ts) gives a spell record with this card.
    const description = [`A spell of the school «${card.school}», ${card.level === 0 ? "a cantrip" : `level ${card.level}`}.`, (card.text ?? "").slice(0, 900)].filter(Boolean).join(" ");
    const prompt = falSubjectPrompt({ composition: "spell", name: card.name, description, style: STYLE });
    const [width, height] = FAL_SIZES[pictureSizeFor(MODEL, "spell")];
    const input = { model: MODEL, prompt, width, height, quality: "high", format: "jpeg", references: [], moderation: "low" };
    const expected = openAIImageReserveUsdMicros(input);
    if (spentMicros + expected > capMicros) { rows.push({ name, skipped: "budget" }); break; }
    try {
      const result = await generateOpenAIImage(key, input, { timeoutMs: 300_000 });
      spentMicros += result.priceUsdMicros;
      const file = `docs/samples/spells/fix-s3-accept-${card.level}-${rows.length + 1}.jpg`;
      writeFileSync(join(ROOT, file), result.bytes);
      rows.push({ name: card.name, school: card.school, level: card.level, size: `${width}x${height}`, ms: result.elapsedMs, usd: Number((result.priceUsdMicros / 1e6).toFixed(4)), file });
      console.log(`${card.name}: ${usd(result.priceUsdMicros)} · ${result.elapsedMs} ms → ${file}`);
    } catch (error) {
      const billed = error instanceof FalImageError && /^HTTP 400\b/.test(error.detail ?? "") ? 0 : expected;
      spentMicros += billed;
      rows.push({ name: card.name, error: error instanceof FalImageError ? error.code : String(error).slice(0, 120), usd: Number((billed / 1e6).toFixed(4)) });
      console.log(`${card.name}: failed (${rows.at(-1).error})`);
    }
  }
} finally {
  const record = { run: `fix-s3-accept-v-spells`, at: new Date().toISOString(), model: MODEL, composition: "spell", style: STYLE, spentUsd: Number((spentMicros / 1e6).toFixed(4)), pictures: rows };
  writeFileSync(join(ROOT, "docs", "runs", "fix-s3-accept-v-spell-probe.json"), `${JSON.stringify(record, null, 2)}\n`);
  await run.settle(spentMicros / 1e6, { file: "docs/runs/fix-s3-accept-v-spell-probe.json", pictures: rows.length });
  console.log(`spent ${usd(spentMicros)} of ${usd(capMicros)}`);
}
