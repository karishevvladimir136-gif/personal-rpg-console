#!/usr/bin/env node
// TOWN_4: DeepSeek V4 Pro's host on OpenRouter. The first start of deepseek-silent on TOWN_1's host (DeepInfra fp8) ran at
// about 32 s a call (one turn in seven minutes; 48 cycles ≈ a day). This sends Alder's first screen of cycle 1 with the
// TOWN_4 system text, once to each candidate host, pinned with `allow_fallbacks: false`, and records the time, the output
// tokens, the action and provenance. Booked in the stage ledger as «deepseek host probe».
//   node scripts/town-4/host-probe.mjs <tag> [<tag> …]
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { NAMES } from "../town-0/rules.mjs";
import { newWorld, parseAction } from "../town-0/town.mjs";
import { roundStart, turnStart } from "../town-0/world.mjs";
import { systemTextOf } from "../town-0/interface.mjs";
import { FAMILIES, SETTINGS } from "./families.mjs";
import { PHYSICS, createMeter, paidCaller, pathsFor } from "./pilot.mjs";
import { readPrices } from "../town-2/providers.mjs";

const tags = process.argv.slice(2);
const names = { "deepinfra/fp8": "DeepInfra", "deepinfra/fp8/priority": "DeepInfra", deepseek: "DeepSeek", together: "Together", "parasail/fast": "Parasail", "baseten/fp4": "BaseTen", "novita/fp8": "Novita", "gmicloud/fp8": "GMICloud", "atlas-cloud/fp8": "AtlasCloud", "siliconflow/fp8": "SiliconFlow", "coreweave/fp8": "CoreWeave" };
const paths = pathsFor(false);
const keys = { llmapi: process.env.APP_LLMAPI_KEY?.trim(), openrouter: process.env.APP_OPENROUTER_API_KEY?.trim() };
const specs = tags.map((tag) => ({ ...FAMILIES.deepseek, upstream: tag, upstreamName: names[tag] ?? tag }));
const prices = {};
for (const s of specs) Object.assign(prices, await readPrices([s], { fetcher: fetch }));
const meter = createMeter({ step: "deepseek host probe", prices, paths });
const paid = paidCaller({ meter, keys, fetcher: fetch, log: console.log });
const w = newWorld({ names: NAMES, arm: SETTINGS.arm, scarcity: PHYSICS });
const screen = turnStart(roundStart(w.state, 1).state, "alder").screen;
const system = systemTextOf(w.state);
const out = [];
for (const spec of specs) {
  for (let k = 0; k < Number(process.env.PROBE_N ?? 2); k++) {
    const r = await paid(spec, { system, messages: [{ role: "user", content: screen }], maxTokens: SETTINGS.maxTokens, effort: SETTINGS.effort }, { purpose: `host probe ${k + 1}`, who: spec.upstream });
    const row = { tag: spec.upstream, try: k + 1, ms: r.ms, status: r.status, upstream: r.upstream, provenance: r.provenance, out: r.usage?.output_tokens, reasoning: r.usage?.reasoning_tokens, costUsd: r.costUsd, action: parseAction(r.text), error: r.error ?? null, stop: r.stopReason };
    out.push(row);
    console.log(JSON.stringify(row));
  }
}
meter.save();
mkdirSync(join(paths.out, "diagnosis"), { recursive: true });
writeFileSync(join(paths.out, "diagnosis", `deepseek-host-probe-${Date.now()}.json`), `${JSON.stringify({ at: new Date().toISOString(), screenFrom: "Alder, cycle 1, TOWN_4 interface", effort: SETTINGS.effort, maxTokens: SETTINGS.maxTokens, out }, null, 1)}\n`);
