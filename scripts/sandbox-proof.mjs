// Proves a running sandbox (docs/SANDBOX.md) over HTTP, the way the browser
// talks to the app: create a world and a starter campaign, play turns on the
// stand-in DM, and after a stop/start continue the same campaign.
//
//   node scripts/sandbox-proof.mjs create     world + campaign + three turns; remembers the IDs in .sandbox/proof.json
//   node scripts/sandbox-proof.mjs continue   reads the remembered campaign back and plays one more turn
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const base = `http://127.0.0.1:${process.env.RPG_SANDBOX_APP_PORT || 3100}`;
const memo = new URL("../.sandbox/proof.json", import.meta.url);
const phase = process.argv[2];
const jar = new Map();

async function request(path, payload) {
  const headers = { cookie: [...jar].map(([name, value]) => `${name}=${value}`).join("; ") };
  if (payload !== undefined) Object.assign(headers, { "content-type": "application/json", origin: base });
  const response = await fetch(base + path, { method: payload === undefined ? "GET" : "POST", headers,
    body: payload === undefined ? undefined : JSON.stringify(payload), redirect: "manual" });
  for (const cookie of response.headers.getSetCookie()) {
    const pair = cookie.split(";")[0], split = pair.indexOf("=");
    if (pair.slice(split + 1)) jar.set(pair.slice(0, split), pair.slice(split + 1)); else jar.delete(pair.slice(0, split));
  }
  const text = await response.text();
  assert.equal(response.status, 200, `${path}: HTTP ${response.status} ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

async function turn(campaignId, input) {
  const play = await request(`/api/campaigns/${campaignId}/play`);
  let result = await request(`/api/campaigns/${campaignId}/turns`, { timeline: play.timeline, operationId: randomUUID(), campaignId,
    expectedRevision: play.revision, mode: "game", input, companionId: null, listenerIds: [], mechanic: null });
  if (result.status === "awaiting_confirmation")
    result = await request(`/api/campaigns/${campaignId}/turns/${result.id}/resume`, { timeline: play.timeline, commandId: randomUUID(),
      campaignId, operationId: result.id, action: "continue", checkId: null });
  assert.equal(result.status, "committed", `turn failed: ${JSON.stringify(result).slice(0, 300)}`);
  console.log(`  turn ${result.id.slice(0, 8)} committed · ${result.narration.slice(0, 90)}…`);
  return result;
}

const health = await fetch(`${base}/api/local-launch/health`).then((r) => r.json()).catch(() => null);
assert.equal(health?.trustedLocalOwner, true, `the sandbox app is not running at ${base}`);
await request("/campaigns").catch(() => {}); // the trusted local owner is signed in by the first page

if (phase === "create") {
  const stamp = new Date().toISOString();
  const { world } = await request("/api/worlds", { action: "world_create", input: { requestId: randomUUID(),
    title: `Sandbox proof world ${stamp}`, premise: "A small harbour town where the ferry stopped coming. Entirely invented for the sandbox proof.", packVersionIds: [] } });
  console.log(`world ${world.id.slice(0, 8)} created`);
  const created = await request("/api/worlds", { action: "new_campaign", input: { requestId: randomUUID(), worldId: world.id,
    worldVersion: world.version, title: `Sandbox proof campaign ${stamp}`, language: "en", heroName: "Proof Hero", template: "console-basic-fighter-level1-v1" } });
  const campaignId = created.campaignId;
  console.log(`campaign ${campaignId.slice(0, 8)} created`);
  const opening = (await request(`/api/campaigns/${campaignId}/play`)).turns.filter((row) => row.status === "committed").length;
  for (const input of ["I look around the harbour and ask the nearest sailor about the ferry.", "I offer him a coin for the whole story.", "I head to the harbour master's office."])
    await turn(campaignId, input);
  const play = await request(`/api/campaigns/${campaignId}/play`);
  const committed = play.turns.filter((row) => row.status === "committed").length;
  assert.equal(committed, opening + 3);
  writeFileSync(memo, JSON.stringify({ worldId: world.id, campaignId, turns: committed, stamp }, null, 2));
  console.log(`PASS: world, campaign and three turns on the stand-in DM (${committed} committed turns including the starter opening)`);
} else if (phase === "continue") {
  assert.ok(existsSync(memo), "run the create phase first");
  const remembered = JSON.parse(readFileSync(memo, "utf8"));
  const before = await request(`/api/campaigns/${remembered.campaignId}/play`);
  const kept = before.turns.filter((row) => row.status === "committed").length;
  assert.equal(kept, remembered.turns, "the campaign lost turns across the restart");
  const worlds = await request("/api/worlds");
  assert.ok(worlds.worlds.some((row) => row.id === remembered.worldId), "the world is gone after the restart");
  await turn(remembered.campaignId, "I knock on the harbour master's door.");
  const after = await request(`/api/campaigns/${remembered.campaignId}/play`);
  assert.equal(after.turns.filter((row) => row.status === "committed").length, kept + 1);
  writeFileSync(memo, JSON.stringify({ ...remembered, turns: kept + 1 }, null, 2));
  console.log(`PASS: the same campaign continued after the restart (${kept} turns kept, one more played)`);
} else {
  console.error("usage: node scripts/sandbox-proof.mjs create|continue");
  process.exitCode = 1;
}
void root;
