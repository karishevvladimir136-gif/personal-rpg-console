#!/usr/bin/env node
// TOWN_2: the Fable 5.1 refusal on the first screen, diagnosed in a few booked calls (step «diagnosis» in the stage
// ledger). Each request is the check's first-screen probe changed in one respect. Writes
// docs/runs/town-2-worlds/diagnosis/calls-<time>.json with every refusal text verbatim.
//   node scripts/town-2/diagnose.mjs [A B C ...]
import { join } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";
import { ARMS, NAMES } from "../town-0/rules.mjs";
import { newWorld } from "../town-0/town.mjs";
import { roundStart, turnStart } from "../town-0/world.mjs";
import { interfaceText, systemTextOf } from "../town-0/interface.mjs";
import { FAMILIES, JUDGES, SETTINGS } from "./families.mjs";
import { readPrices } from "./providers.mjs";
import { createMeter, paidCaller, pathsFor } from "./pilot.mjs";

const paths = pathsFor(false);
const keys = { llmapi: process.env.APP_LLMAPI_KEY?.trim() };
const prices = await readPrices([...Object.values(FAMILIES), ...Object.values(JUDGES)], { fetcher: fetch });
const meter = createMeter({ step: "diagnosis", prices, paths });
const paid = paidCaller({ meter, keys, fetcher: fetch, log: console.log });
const w2 = newWorld({ names: NAMES, arm: "both", scarcity: true });
const w0 = newWorld({ names: NAMES, arm: "both" });
const screen2 = turnStart(roundStart(w2.state, 1).state, "alder").screen;
const screen0 = turnStart(roundStart(w0.state, 1).state, "alder").screen;
const cached = FAMILIES.fable51;
const plain = { ...FAMILIES.fable51, cache: false };
const text2 = systemTextOf(w2.state);
const only = process.argv.slice(2);
const cases = [
  ["A cached, TOWN_2 text + screen (the probe)", cached, text2, screen2],
  ["B uncached (TOWN_1's route), TOWN_2 text + screen", plain, text2, screen2],
  ["C uncached, TOWN_0/1 both-arm text + TOWN_0 screen", plain, interfaceText(ARMS.both), screen0],
  ["D uncached, no system text, TOWN_2 screen", plain, null, screen2],
  ["E uncached, TOWN_2 text without outside()", plain, text2.split("\n").filter((l) => !l.startsWith("- outside(")).join("\n"), screen2],
].filter(([label]) => !only.length || only.includes(label[0]));
const out = [];
for (const [label, spec, system, screen] of cases) {
  const r = await paid(spec, { system, messages: [{ role: "user", content: screen }], maxTokens: SETTINGS.maxTokens, effort: SETTINGS.effort }, { purpose: `diagnosis ${label}`, who: "alder" });
  out.push({ label, stopReason: r.stopReason, refused: r.refused ? { category: r.refusalCategory, text: r.refusalText } : null, text: r.text, usage: r.usage, costUsd: r.costUsd, servedModel: r.servedModel });
  console.log(`${label}: ${r.stopReason}${r.refused ? ` — ${r.refusalCategory}: ${r.refusalText}` : ` — ${String(r.text).slice(-160).replace(/\n/g, " ⏎ ")}`} ($${r.costUsd.toFixed(4)})`);
}
meter.save();
mkdirSync(join(paths.out, "diagnosis"), { recursive: true });
writeFileSync(join(paths.out, "diagnosis", `calls-${Date.now()}.json`), JSON.stringify({ at: new Date().toISOString(), out, calls: meter.calls }, null, 1));
