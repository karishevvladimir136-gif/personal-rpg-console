// Render only blinded, public evidence. Never load runs or the separate reveal key.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { stage2Arc } from "../../spikes/astra-primary-dm/stage2.mjs";

const directory = process.env.RPG_ASTRA_STAGE2_OUTPUT_DIR;
assert.ok(directory);
const { turns, requests, stopReason, model, reasoning, serviceTier } = JSON.parse(
  await readFile(join(directory, "stage2-private-ledger.json"), "utf8"));
assert.equal(stopReason, null);
assert.equal(turns.length, 28);
assert.ok(turns.every((turn) => ["committed", "failed"].includes(turn.status)));
assert.ok(requests.every((request) => request.status === "completed"));
assert.ok(turns.every((turn) => turn.label === "X" || turn.label === "Y"));

const root = process.cwd();
const money = (value) => `US $${value.toFixed(4)}`;
const seconds = (value) => `${(value / 1000).toFixed(2)} s`;
const num = (value) => value.toLocaleString("en-US");
const metric = (set, key) => set.reduce((sum, row) => sum + (row[key] ?? 0), 0);
const percentile = (values, rank) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil(rank * sorted.length) - 1];
};
const requestRows = (turn) => requests.filter((row) =>
  row.caseId === turn.caseId && row.label === turn.label);
const reportedSpend = (rows) => rows.reduce((sum, row) =>
  sum + ((row.inputTokens - row.cachedInputTokens) * 10 +
    row.cachedInputTokens * 1.25 + row.outputTokens * 50) / 1_000_000, 0);
const upperSpend = (rows) => metric(rows, "upperUsd");
const quote = (value) => String(value).split("\n").map((line) => line ? `> ${line}` : ">").join("\n");
const actorState = (state) => Object.values(state.actors)
  .map((actor) => `${actor.name} HP ${actor.hp}, ${Object.entries(actor.resources)
    .map(([key, value]) => `${key} ${value}`).join("/")}, ${actor.position}`).join("; ");
const itemState = (state) => Object.values(state.items)
  .filter((item) => item.quantity > 0)
  .map((item) => `${item.name} ×${item.quantity} (${state.actors[item.ownerId]?.name ?? "other"})`)
  .join("; ") || "none";
const changed = (before, after) => {
  const changes = [];
  if (before.locationId !== after.locationId) changes.push("location changed");
  if (before.worldMinutes !== after.worldMinutes)
    changes.push(`world time ${before.worldMinutes} → ${after.worldMinutes}`);
  for (const [id, actor] of Object.entries(after.actors)) {
    const prior = before.actors[id];
    if (!prior) continue;
    if (actor.hp !== prior.hp) changes.push(`${actor.name} HP ${prior.hp} → ${actor.hp}`);
    if (actor.position !== prior.position) changes.push(`${actor.name} position ${prior.position} → ${actor.position}`);
    for (const [key, value] of Object.entries(actor.resources))
      if (prior.resources[key] !== value)
        changes.push(`${actor.name} ${key} ${prior.resources[key]} → ${value}`);
  }
  for (const [id, item] of Object.entries(after.items)) {
    const prior = before.items[id];
    if (!prior) changes.push(`${item.name} created`);
    else if (prior.quantity !== item.quantity || prior.ownerId !== item.ownerId)
      changes.push(`${item.name} quantity/owner ${prior.quantity}/${prior.ownerId} → ${item.quantity}/${item.ownerId}`);
  }
  return changes.length ? changes.join("; ") : "No structured gameplay value changed.";
};
const receipt = (row) => {
  const result = row.result;
  if (row.call.kind === "query") return "public-state query (no roll)";
  const dice = Array.isArray(result?.dice) ? result.dice.join(", ") : "none";
  return `${row.call.kind}: raw dice ${dice}; total ${result?.total ?? "n/a"}; success ${result?.success ?? "n/a"}`;
};
const publicText = (turn) => turn.status === "committed"
  ? turn.publicResult?.narration : turn.finalProposal?.narration;
for (const turn of turns) {
  assert.equal(turn.input, stage2Arc[turn.turnNumber - 1].input);
  assert.equal(turn.stateAfter?.revision,
    turn.status === "committed" ? turn.stateBefore.revision + 1 : turn.stateBefore.revision);
  assert.ok(!JSON.stringify({ publicResult: turn.publicResult,
    proposedNarration: publicText(turn), memoryAdditions: turn.memoryAdditions })
    .includes("SYNTHETIC_SECRET"), `private marker in ${turn.caseId}/${turn.label}`);
}

const review = [
  "# Astra primary DM — Stage 2 blind longitudinal review",
  "",
  "**Synthetic evaluation.** X and Y are the two selected arms; the mapping remains sealed until owner scoring. The same literal inputs were presented in the same order. Each arm carried forward only its own validated committed state. A rejected proposal is shown as uncommitted evidence and did not change gameplay state or Memory.",
  "",
  "The full sequence follows by arm so consequences can be read in order. ‘State’ lists the validated structured state after the turn. Narration alone does not establish a durable item, resource, position or hidden fact.",
];
for (const label of ["X", "Y"]) {
  review.push("", `## Arm ${label} — full 14-turn arc`, "");
  for (const scenario of stage2Arc) {
    const turn = turns.find((row) => row.label === label && row.caseId === scenario.id);
    assert.ok(turn);
    const rows = requestRows(turn);
    review.push(`### ${turn.turnNumber}. ${scenario.id} — ${scenario.probe}`, "",
      `**Player:** ${scenario.input}`, "",
      `**Result:** ${turn.status === "committed" ? "Committed" :
        `Rejected by validation (${turn.error}); no player-facing response or state change`}.`, "");
    if (turn.status === "failed") review.push("**Uncommitted proposal, for review only:**", "");
    review.push(publicText(turn) ? quote(publicText(turn)) : "> No final proposal was produced.", "");
    const tools = turn.toolReceipts.map(receipt);
    review.push(`**Server tools and visible rolls:** ${tools.length ? tools.join("; ") : "none"}.`, "",
      `**Validated state:** revision ${turn.stateAfter.revision}; ${changed(turn.stateBefore, turn.stateAfter)} ` +
        `Actors: ${actorState(turn.stateAfter)}. Inventory: ${itemState(turn.stateAfter)}.`, "");
    const explicitMemory = turn.memoryAdditions.filter((row) => !row.sourceSceneId);
    const sceneMemory = turn.memoryAdditions.find((row) => row.sourceSceneId);
    review.push(`**Memory / continuity:** ${sceneMemory ?
      `Committed scene ${sceneMemory.id} was indexed with source ${sceneMemory.sourceSceneId}.` :
      "No Memory write; last committed Memory carried forward."} ` +
      (explicitMemory.length ? explicitMemory.map((row) => row.text).join(" ") :
        "No additional explicit public Memory candidate."), "",
      `**Character Model changes:** ${turn.characterModelChanges.length ? turn.characterModelChanges.join(", ") : "none"}.`, "",
      `**Telemetry:** ${turn.requestCount} model request${turn.requestCount === 1 ? "" : "s"}; ` +
        `${seconds(turn.providerLatencyMs)} provider latency; ${seconds(turn.wallTimeMs)} wall time; ` +
        `${num(metric(rows, "inputTokens"))} input, ${num(metric(rows, "cachedInputTokens"))} cached input, ` +
        `${num(metric(rows, "outputTokens"))} output, ${num(metric(rows, "reasoningTokens"))} reasoning tokens.`, "");
  }
}

const allCommitted = turns.filter((turn) => turn.status === "committed");
const failures = turns.filter((turn) => turn.status === "failed");
const metrics = (label) => {
  const rows = turns.filter((turn) => turn.label === label);
  const req = requests.filter((row) => row.label === label);
  return { turns: rows.length, committed: rows.filter((row) => row.status === "committed").length,
    failed: rows.filter((row) => row.status === "failed").length,
    requests: req.length, toolRequests: rows.reduce((n, row) => n + row.toolReceipts.length, 0),
    continuations: rows.filter((row) => row.toolReceipts.length && row.requestCount > 1).length,
    providerMs: metric(rows, "providerLatencyMs"), wallMs: metric(rows, "wallTimeMs"),
    input: metric(req, "inputTokens"), cached: metric(req, "cachedInputTokens"),
    output: metric(req, "outputTokens"), reasoning: metric(req, "reasoningTokens"),
    spend: reportedSpend(req), upper: upperSpend(req),
    memoryScenes: rows.reduce((n, row) => n + row.memoryAdditions.filter((m) => m.sourceSceneId).length, 0),
    memoryCandidates: rows.reduce((n, row) => n + row.memoryAdditions.filter((m) => !m.sourceSceneId).length, 0),
    characterChanges: rows.reduce((n, row) => n + row.characterModelChanges.length, 0),
    narrationWords: rows.filter((row) => row.status === "committed")
      .reduce((n, row) => n + row.publicResult.narration.trim().split(/\s+/).length, 0),
    privatePatches: rows.filter((row) => row.status === "committed")
      .reduce((n, row) => n + row.finalProposal.privateChanges.length, 0) };
};
const x = metrics("X"), y = metrics("Y");
const noTool = turns.filter((turn) => turn.toolReceipts.length === 0).map((turn) => turn.wallTimeMs);
const toolLoop = turns.filter((turn) => turn.toolReceipts.length > 0).map((turn) => turn.wallTimeMs);
const summaryRow = (label, m) => `| ${label} | ${m.committed} / ${m.turns} | ${m.failed} | ${m.requests} | ` +
  `${m.toolRequests} | ${m.continuations} | ${seconds(m.providerMs)} | ${seconds(m.wallMs)} | ` +
  `${num(m.input)} / ${num(m.cached)} / ${num(m.output)} / ${num(m.reasoning)} | ` +
  `${money(m.spend)} | ${money(m.upper)} |`;
const paired = [];
for (const scenario of stage2Arc) {
  const a = turns.find((row) => row.caseId === scenario.id && row.label === "X");
  const b = turns.find((row) => row.caseId === scenario.id && row.label === "Y");
  for (const [kind, index] of a.toolReceipts.map((row, i) => [row.call.kind, i])) {
    const mate = b.toolReceipts.filter((row) => row.call.kind === kind)[
      a.toolReceipts.slice(0, index + 1).filter((row) => row.call.kind === kind).length - 1];
    const own = a.toolReceipts[index];
    if (mate && Array.isArray(own.result?.dice) && Array.isArray(mate.result?.dice))
      paired.push({ caseId: scenario.id, kind, x: own.result.dice, y: mate.result.dice,
        same: JSON.stringify(own.result.dice) === JSON.stringify(mate.result.dice) });
  }
}
const report = [
  "# Astra primary DM — Stage 2 longitudinal metrics",
  "",
  "**Status:** All 28 authorized synthetic turns attempted in sequence. Both blinded arms finished the 14-turn arc. The B/C mapping is sealed for owner blind scoring; no winner is declared here.",
  "",
  `Both arms used direct ${model}, reasoning ${reasoning}, service tier ${serviceTier}. ` +
    "The same literal input and turn order were used, with each arm advancing only from its own validated committed state. No quality retry or manual final-proposal repair occurred.",
  "",
  "## Quantitative totals",
  "",
  "| Arm | Committed / attempted | Failed | Model requests | Executed tools | Tool continuations | Provider latency | Wall time | Input / cached / output / reasoning tokens | Reported-token estimate | Conservative ceiling accounting |",
  "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
  summaryRow("X", x), summaryRow("Y", y),
  summaryRow("Combined", { ...x, turns: x.turns + y.turns, committed: x.committed + y.committed,
    failed: x.failed + y.failed, requests: x.requests + y.requests,
    toolRequests: x.toolRequests + y.toolRequests, continuations: x.continuations + y.continuations,
    providerMs: x.providerMs + y.providerMs, wallMs: x.wallMs + y.wallMs,
    input: x.input + y.input, cached: x.cached + y.cached, output: x.output + y.output,
    reasoning: x.reasoning + y.reasoning, spend: x.spend + y.spend, upper: x.upper + y.upper }),
  "",
  `No-tool turns: ${noTool.length}; wall-time p50 ${seconds(percentile(noTool, 0.50))}, ` +
    `p95 ${seconds(percentile(noTool, 0.95))}. Tool-loop turns: ${toolLoop.length}; ` +
    `wall-time p50 ${seconds(percentile(toolLoop, 0.50))}, p95 ${seconds(percentile(toolLoop, 0.95))}. ` +
    `Mean model round trips: ${(requests.length / turns.length).toFixed(2)} overall; ` +
    `${(turns.filter((t) => t.toolReceipts.length).reduce((n, t) => n + t.requestCount, 0) / toolLoop.length).toFixed(2)} on tool-loop turns.`,
  "",
  "Reported-token spend is an estimate from request usage at the listed Standard prices; actual invoice data was unavailable. Conservative ceiling accounting charges every input token at the higher cache-write rate and every output token at the output rate. Both remain below the US $50 hard ceiling. Output tokens include reasoning tokens.",
  "",
  "## Turn-by-turn context and execution",
  "",
  "Input size is the serialized first request, in bytes; the hard provider token cap was checked separately on every response. Trim counts are optional recent scenes / retrieved Memory rows removed from that first request. Current scene, structured state, Canon, corrections and the arc-13 promise memory were kept.",
  "",
  "| Turn | X result | X requests | X first input bytes | X optional trim | Y result | Y requests | Y first input bytes | Y optional trim |",
  "| --- | --- | ---: | ---: | ---: | --- | ---: | ---: | ---: |",
  ...stage2Arc.map((scenario, index) => {
    const a = turns.find((row) => row.caseId === scenario.id && row.label === "X");
    const b = turns.find((row) => row.caseId === scenario.id && row.label === "Y");
    const trim = (turn) => `${turn.contextTrim.recentScenes} / ${turn.contextTrim.retrievedMemory}`;
    return `| ${index + 1} | ${a.status} | ${a.requestCount} | ${a.initialBodyBytes} | ${trim(a)} | ` +
      `${b.status} | ${b.requestCount} | ${b.initialBodyBytes} | ${trim(b)} |`;
  }),
  "",
  "## Deterministic server tools and validation",
  "",
  `Executed server tools: ${x.toolRequests + y.toolRequests}; successful same-model continuations: ` +
    `${x.continuations + y.continuations}. Tool receipt kinds: ` +
    `${Object.entries(turns.flatMap((t) => t.toolReceipts).reduce((out, row) => {
      out[row.call.kind] = (out[row.call.kind] ?? 0) + 1; return out;
    }, {})).map(([kind, count]) => `${kind} ${count}`).join(", ") || "none"}.`,
  `Equivalent checked tool occurrences with raw dice on both sides: ${paired.length}; ` +
    `${paired.filter((row) => row.same).length} matched. ` +
    "Unmatched tool choices were left divergent; no roll was forced merely for comparison.",
  ...paired.map((row) => `- ${row.caseId} ${row.kind}: X [${row.x.join(", ")}], Y [${row.y.join(", ")}]; ${row.same ? "same raw dice" : "different raw dice"}.`),
  "",
  `Validation failures: ${failures.length}, at ${failures.map((t) => `${t.caseId}/${t.label}`).join(", ")}. ` +
    "Each rejected final remained uncommitted; its subsequent turn used the last validated state. No provider request failed, and no tool receipt was replayed for quality.",
  "",
  "## Continuity and longitudinal review",
  "",
  `Committed scene events indexed into source-linked historical Memory: X ${x.memoryScenes}, Y ${y.memoryScenes}. ` +
    `Additional public Memory candidates: X ${x.memoryCandidates}, Y ${y.memoryCandidates}. ` +
    `Character Model changes: X ${x.characterChanges}, Y ${y.characterChanges}. ` +
    "The final proposal contract did not authorize a Character Model patch, so those models stayed as frozen context.",
  `Committed narration word counts: X ${x.narrationWords} (${(x.narrationWords / x.committed).toFixed(1)} per commit), ` +
    `Y ${y.narrationWords} (${(y.narrationWords / y.committed).toFixed(1)} per commit). ` +
    "This measures length, not quality, and the arm identities remain sealed.",
  "",
  "Early turns 1–4 and late turns 11–14 should be scored together with the full arm sequences in the blind review. The explicit fixed low roll on turn 2 produced raw d20 = 1 in both arms. X committed the failed attempt and the innkeeper's refusal; Y's final failed validation, so its narrated failure never became history. X's turn-4 travel final also failed validation. Y's turn-4 final committed Orin's refusal to leave. Both turn-9 wrong-culprit accusations failed validation and therefore neither created a durable accusation scene, despite their uncommitted narration.",
  "",
  "**Major test limitation:** Neither arm left the Copper Lantern in structured state. Across 24 commits, no public actor, item, resource or location change was accepted; only world time advanced on some turns. Both models correctly noticed on turn 6 that the unstable mine passage was not the current scene. The intended mine crossing, resource depletion, HP pressure and magistrate conversation were therefore not exercised as actual world transitions. Later inputs continued in their authorized fixed order, and the arms answered them from the tavern. The evaluation offers evidence about memory, NPC resistance and long-form conversation, but limited evidence about long-form mechanical escalation or persistent numeric costs. No compensating scenario rewrite or quality rerun was made.",
  "",
  `Both arms kept Orin's refusal to enter the dangerous shaft alone, treated the magistrate rumor as unverified, rejected automatic chosen-one authority, and recalled the unresolved promise about his father's map in the quiet and callback turns. The turn-10 failed bluffs became public scene/Memory consequences about credibility; bounded DM-private fallout patches: X ${x.privatePatches}, Y ${y.privatePatches}. Their values are omitted from owner-facing artifacts. Those costs are narrative and private-state consequences, not HP, inventory or resource changes. Neither arm had an accepted false-culprit accusation or accepted proof of a secret solution.`,
  "",
  "The selected source-linked old-promise Memory was retained in both turn-13 packets. Validated scene history was carried forward after every commit; failed-turn proposals were not. Ordinary fictional details appear in committed scene text and therefore have a source reference for future recall, without being converted into structured Canon or unsupported numeric state. No synthetic hidden-culprit marker appeared in public narration or Memory; the private fallout patches stayed private.",
  "",
  "For owner scoring, compare persistent consequences, NPC autonomy/knowledge, chosen-one resistance, quiet interaction and old callback across each complete arc. The benchmark did not record subjective scores, so this report does not invent them. No sealed arm identity or winner is disclosed.",
  "",
  "## Isolation",
  "",
  "Only synthetic campaign packets, disposable local journals and direct OpenAI text requests were used. Main, owner DB, owner app, owner gameplay and historical owner turns were untouched. No migration, deployment, media request or Stage 1 rerun occurred. The private reveal key is outside this repository and is not read by this renderer.",
];
await writeFile(join(root, "ASTRA_PRIMARY_DM_STAGE2_BLIND_REVIEW.md"), review.join("\n").trimEnd() + "\n");
await writeFile(join(root, "ASTRA_PRIMARY_DM_STAGE2_REPORT.md"), report.join("\n").trimEnd() + "\n");
process.stdout.write(JSON.stringify({ attempted: turns.length, committed: allCommitted.length,
  failed: failures.length, requests: requests.length, inputTokens: x.input + y.input,
  outputTokens: x.output + y.output, reasoningTokens: x.reasoning + y.reasoning,
  estimatedUsd: +(x.spend + y.spend).toFixed(4), upperUsd: +(x.upper + y.upper).toFixed(4),
  noToolP50Ms: percentile(noTool, 0.5), noToolP95Ms: percentile(noTool, 0.95),
  toolP50Ms: percentile(toolLoop, 0.5), toolP95Ms: percentile(toolLoop, 0.95) }) + "\n");
