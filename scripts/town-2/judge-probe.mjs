#!/usr/bin/env node
// TOWN_2: are the welfare judge's «HTTP 400 Operation not allowed» answers tied to the request or to the gateway's routing?
// Rebuilds N check requests that failed in a set-aside start (aborted-start/<world>/record.json.gz) and resends each to the
// judge on aws-bedrock (twice) and on llmapi's first-party anthropic route (once). Booked as step «judge probe».
//   node scripts/town-2/judge-probe.mjs <world> [n]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { checkRequest } from "../town-0/welfare.mjs";
import { FAMILIES, JUDGES } from "./families.mjs";
import { readPrices } from "./providers.mjs";
import { createMeter, paidCaller, pathsFor } from "./pilot.mjs";

const [world, n = "3"] = process.argv.slice(2);
const paths = pathsFor(false);
const rec = JSON.parse(gunzipSync(readFileSync(join(paths.out, "aborted-start", world, "record.json.gz"))));
const failed = [];
for (const [id, a] of Object.entries(rec.agents)) for (const t of a.turns) t.calls.forEach((c, i) => {
  if (Object.hasOwn(c, "welfare") && c.welfare === null) failed.push({ id, round: t.round, n: c.n, previous: i === 0 ? t.screen : t.calls[i - 1].result, message: c.reply });
});
const keys = { llmapi: process.env.APP_LLMAPI_KEY?.trim() };
const prices = await readPrices([...Object.values(FAMILIES), ...Object.values(JUDGES)], { fetcher: fetch });
const meter = createMeter({ step: "judge probe", prices, paths });
const paid = paidCaller({ meter, keys, fetcher: fetch, log: () => {}, sleep: async () => {} });
const noRetry = async (spec, args, meta) => { const r = await paid(spec, args, meta); return r; };
const firstParty = { ...JUDGES.judge, provider: "anthropic" };
const out = [];
for (const f of failed.slice(0, Number(n))) {
  const req = checkRequest(f.previous, f.message);
  const row = { who: f.id, round: f.round, call: f.n, results: [] };
  for (const [label, spec] of [["bedrock 1", JUDGES.judge], ["bedrock 2", JUDGES.judge], ["anthropic", firstParty]]) {
    const r = await noRetry(spec, { system: req.system, messages: [{ role: "user", content: req.user }], maxTokens: 1500, effort: "low" }, { purpose: `judge probe ${label}`, who: f.id });
    row.results.push({ label, status: r.status, error: r.error, text: r.text?.slice(0, 120), attempts: meter.calls.filter((c) => c.purpose === `judge probe ${label}` && c.who === f.id).length });
  }
  out.push(row);
  console.log(`${f.id} c${f.round} call ${f.n}: ${row.results.map((x) => `${x.label} ${x.status}${x.error ? ` ${x.error.slice(0, 60)}` : ` ${x.text}`}`).join(" | ")}`);
}
meter.save();
mkdirSync(join(paths.out, "diagnosis"), { recursive: true });
writeFileSync(join(paths.out, "diagnosis", `judge-probe-${Date.now()}.json`), JSON.stringify({ at: new Date().toISOString(), world, failedInStart: failed.length, out, calls: meter.calls }, null, 1));
