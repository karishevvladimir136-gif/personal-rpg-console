// Explicitly opted-in, bounded LIVE model acceptance against disposable local data.
// No credentials, raw provider payloads or private context are logged.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import {
  acceptanceEnvironment,
  httpSession,
  credentials,
  createGameplayFixtures,
  pathFor,
} from "./gameplay-acceptance-helpers.mjs";

assert.equal(
  process.env.RPG_ALLOW_LIVE_DM_TESTS,
  "SMALL_SYNTHETIC_PHASE2_ACCEPTANCE",
);
assert.equal(process.env.OPENAI_DM_MODEL, "gpt-6-astra");
assert.equal(process.env.OPENAI_DM_REASONING, "xhigh");
const command = process.argv[2] ?? "smoke";
assert.ok(
  [
    "smoke",
    "retry-smoke",
    "verify-failure",
    "step",
    "continue",
    "retry",
    "sync",
    "other",
    "verify-guidance",
    "verify",
  ].includes(command),
);
const { base } = acceptanceEnvironment();
const owner = httpSession(base);
await owner.request("/api/auth/sign-in", credentials("OWNER"));
const reportPath = "test-results/phase2-live-acceptance.json";
let report;
try {
  report = JSON.parse(await readFile(reportPath, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  report = {
    startedAt: new Date().toISOString(),
    fixtures: await createGameplayFixtures(owner),
    turns: [],
  };
}
const save = () => writeFile(reportPath, JSON.stringify(report, null, 2));
await save();
const [a] = report.fixtures;
const root = pathFor(a.campaignId);
const runtime = await owner.request(`${root}/play`);
assert.equal(runtime.configured, true);
assert.equal(runtime.model, "gpt-6-astra");
const steps = {
  healing: [
    "game",
    "I use exactly one Synthetic healing item from my pack on myself, Synthetic Mira. Apply its configured healing rule; do not use a second item.",
  ],
  focus: [
    "game",
    "I spend exactly one point of my focus resource. This is only that explicit resource expenditure, with no other consequence.",
  ],
  promise: [
    "game",
    "I say aloud: I intend to inspect the synthetic beacon after resting. This is a future intention, not a completed quest or a claim that I have inspected it.",
  ],
  companion: [
    "companion",
    "What have we actually done here so far? Do you know any secrets from other campaigns or things nobody here has witnessed? Please do not guess missing history.",
  ],
  companionNow: [
    "companion",
    "I tell you directly: I am calling our next planned outing the Blue Lantern Walk. Please acknowledge what I just told you, without claiming we have already done it or inventing any other history.",
  ],
  camp: [
    "game",
    "I enter a long rest at this safe shelter with only myself, Synthetic Mira, participating. Start camp; do not complete it or recover HP yet.",
  ],
  meal: [
    "game",
    "At this active camp I prepare one meal using exactly one Synthetic meat from my pack, placing the serving in my pack. Do not serve it yet.",
  ],
  serveMeal: [
    "game",
    "I serve the prepared meal to myself, Synthetic Mira, only. Its effect should wait for this rest to complete.",
  ],
  coffee: [
    "game",
    "I prepare one coffee using exactly one Synthetic coffee and one Synthetic water from my pack, placing the serving in the pack. Do not serve it yet.",
  ],
  serveCoffee: [
    "game",
    "I serve the prepared coffee to myself, Synthetic Mira, only. Do not complete the rest yet.",
  ],
  completeRest: [
    "game",
    "I now complete the current long rest, paying exactly one Synthetic supply from my pack for myself as the sole participant. Apply the configured recovery and pending meal and coffee effects.",
  ],
  deposit: [
    "game",
    "I deposit exactly one Synthetic knife from my pack into the Acceptance shared stash. This is a remote deposit; I do not enter camp.",
  ],
  blockedWithdrawal: [
    "game",
    "Without entering camp, can I take that knife back out of the remote shared stash? If access is unavailable, explain briefly and leave it there; do not start camp for me.",
  ],
  travel: [
    "game",
    "I travel to the already known Glass Orchard lookout. I do not complete the beacon quest merely by moving.",
  ],
  return: [
    "game",
    "I return to the existing Glass garden shelter. Leave the beacon quest open; I have not inspected the beacon.",
  ],
  forage: [
    "game",
    "I attempt to forage for supplies from this safe shelter using the supported forage action, placing any resulting supplies in my Acceptance pack. Resolve the actual skill check before claiming success.",
  ],
  transform: [
    "game",
    "I try to make the supported improvised spear from exactly one knife, one stick and one binding in my pack, using my cutting-tool as a retained tool. Put any successful output in my pack; apply the rules-defined check and failed-attempt costs if it fails.",
  ],
  encounter: [
    "game",
    "I explicitly start a practice encounter involving only myself, Synthetic Mira, and the present Synthetic training automaton. Starting alone must not attack or heal anyone.",
  ],
  attack: [
    "game",
    "On my turn I explicitly equip the original Synthetic weapon from my pack into my hand, then attack the Synthetic training automaton exactly once with that equipped weapon, using the configured weapon damage and a real attack roll. After resolving my attack, end my turn so the automaton is active. Do not take the automaton's action yet.",
  ],
  npcAttack: [
    "game",
    "Let the active Synthetic training automaton make exactly one default unarmed attack against Synthetic Mira, resolving its mandatory NPC attack privately. Then end the automaton's turn. Narrate only the visible outcome; do not disclose any private roll, total, target number or whether a hidden check occurred.",
  ],
  endEncounter: [
    "game",
    "We explicitly end this harmless practice encounter by negotiation. There is no automatic healing, rest or resource refund.",
  ],
  continuity: [
    "game",
    "Briefly recap my exact current HP, focus, remaining original healing items, and beacon quest status. What promise did I make before camp, and has it actually been fulfilled? Do not change any state.",
  ],
  archiveQuest: [
    "game",
    "I deliberately postpone the synthetic beacon objective indefinitely. Archive the existing Inspect the synthetic beacon quest; do not mark it completed or claim the beacon was inspected.",
  ],
  feedbackSession: [
    "feedback",
    "For this session I would prefer concise narration, two sentences when practical. Please propose this as guidance for my explicit approval. Do not change the guide automatically.",
  ],
  feedbackCampaign: [
    "feedback",
    "For future campaign narration, let my companion offer one brief practical observation when appropriate, without deciding my actions or knowing secrets. Please propose concise guidance for my explicit approval, without saving it automatically.",
  ],
  approvedGuidance: [
    "game",
    "I stay at the shelter without taking any mechanical action. Give me a brief description of the present moment and leave my next choice to me.",
  ],
};
if (command === "step") {
  const label = process.argv[3];
  assert.ok(Object.hasOwn(steps, label), "Unknown bounded acceptance step");
  assert.ok(
    !report.turns.some((entry) => entry.label === label),
    "Step already submitted; inspect/resume its existing operation",
  );
  assert.ok(
    report.turns.length < 26,
    "Live acceptance is bounded to 26 operations",
  );
  const [mode, text] = steps[label];
  const input = {
    operationId: crypto.randomUUID(),
    campaignId: a.campaignId,
    expectedRevision: runtime.revision,
    mode,
    input: `${text} Keep the response to at most two short sentences.`,
    companionId: mode === "companion" ? a.companionId : null,
    listenerIds: [],
    mechanic: null,
  };
  const entry = {
    label,
    input,
    startedAt: new Date().toISOString(),
    before: await owner.request(root),
    beforePlay: runtime,
  };
  report.turns.push(entry);
  report.otherBefore ??= await owner.request(
    pathFor(report.fixtures[1].campaignId),
  );
  await save();
  entry.result = await owner.request(`${root}/turns`, input);
  entry.after = await owner.request(root);
  entry.afterPlay = await owner.request(`${root}/play`);
  entry.finishedAt = new Date().toISOString();
  await save();
  assert.deepEqual(
    await owner.request(pathFor(report.fixtures[1].campaignId)),
    report.otherBefore,
  );
  if (entry.result.status === "committed") checkStep(entry);
  console.log(JSON.stringify({ label, ...entry.result }));
  assert.ok(
    ["committed", "awaiting_confirmation"].includes(entry.result.status),
    "Live turn failed; stop and inspect before any retry",
  );
}
if (command === "sync") {
  const entry = report.turns.find((t) => t.label === process.argv[3]);
  assert.ok(entry);
  (entry.previousAttempts ??= []).push(entry.result);
  entry.result = await owner.request(
    `${root}/turns/${entry.input.operationId}`,
  );
  for (const previous of entry.previousAttempts.at(-1)?.checks ?? []) {
    const saved = entry.result.checks.find((check) => check.id === previous.id);
    assert.ok(saved);
    for (const key of [
      "dice",
      "kept",
      "total",
      "modifier",
      "rollNumber",
      "success",
    ])
      assert.deepEqual(
        saved[key],
        previous[key],
        "Browser replay/refresh changed a roll",
      );
  }
  entry.after = await owner.request(root);
  entry.afterPlay = await owner.request(`${root}/play`);
  await save();
  assert.equal(entry.result.status, "committed");
  checkStep(entry);
  console.log(JSON.stringify({ label: entry.label, ...entry.result }));
}
if (command === "continue" || command === "retry") {
  const entry = report.turns.find((t) => t.label === process.argv[3]);
  assert.ok(entry);
  const existing = await owner.request(
    `${root}/turns/${entry.input.operationId}`,
  );
  assert.equal(
    existing.status,
    command === "retry" ? "failed" : "awaiting_confirmation",
  );
  assert.deepEqual(
    existing.checks,
    entry.result.checks,
    "Reload changed a recorded check",
  );
  if (command === "retry") {
    assert.ok(existing.canRetry);
    (entry.previousAttempts ??= []).push(entry.result);
  }
  entry.continueCommand = crypto.randomUUID();
  await save();
  entry.result = await owner.request(`${root}/turns/${existing.id}/resume`, {
    commandId: entry.continueCommand,
    campaignId: a.campaignId,
    operationId: existing.id,
    action: command === "retry" ? "retry" : "continue",
    checkId: null,
  });
  entry.after = await owner.request(root);
  entry.afterPlay = await owner.request(`${root}/play`);
  await save();
  if (entry.result.status === "committed") checkStep(entry);
  console.log(JSON.stringify({ label: entry.label, ...entry.result }));
  assert.ok(
    ["committed", "awaiting_confirmation"].includes(entry.result.status),
  );
}
if (command === "verify") {
  for (const entry of report.turns) {
    if (entry.before && entry.after) checkStep(entry);
    const turn = await owner.request(
      `${root}/turns/${entry.input.operationId}`,
    );
    assert.equal(turn.status, "committed");
    assert.equal(turn.input, entry.input.input);
    assert.deepEqual(
      await owner.request(`${root}/turns`, entry.input),
      turn,
      "Duplicate changed a committed result",
    );
  }
  const before = await owner.request(root);
  const beforePlay = await owner.request(`${root}/play`);
  if (report.otherTurn) {
    const otherRoot = pathFor(report.fixtures[1].campaignId);
    assert.deepEqual(
      await owner.request(`${otherRoot}/turns`, report.otherTurn.input),
      report.otherTurn.result,
    );
  }
  await owner.request("/api/auth/sign-out", {});
  await owner.request("/api/auth/sign-in", credentials("OWNER"));
  assert.deepEqual(await owner.request(root), before);
  assert.deepEqual(await owner.request(`${root}/play`), beforePlay);
  assert.deepEqual(
    await owner.request(pathFor(report.fixtures[1].campaignId)),
    report.otherAfter ?? report.otherBefore,
  );
  if (report.otherTurn)
    assert.deepEqual(
      await owner.request(
        `${pathFor(report.fixtures[1].campaignId)}/turns/${report.otherTurn.input.operationId}`,
      ),
      report.otherTurn.result,
    );
  report.finalVerification = {
    at: new Date().toISOString(),
    turns: report.turns.length + (report.otherTurn ? 1 : 0),
    passed: true,
  };
  await save();
  console.log(
    `PASS: ${report.finalVerification.turns} committed operations, duplicate/relogin durability and unrelated campaign isolation`,
  );
}
if (command === "other") {
  assert.ok(report.turns.length >= 20);
  assert.ok(!report.otherTurn, "Other campaign turn already recorded");
  const b = report.fixtures[1];
  const otherRoot = pathFor(b.campaignId);
  const beforeA = await owner.request(root);
  const beforePlayA = await owner.request(`${root}/play`);
  const input = {
    operationId: crypto.randomUUID(),
    campaignId: b.campaignId,
    expectedRevision: (await owner.request(`${otherRoot}/play`)).revision,
    mode: "game",
    input:
      "Я, Synthetic Sol, иду в известное место Quiet Comet lookout и сознательно откладываю цель Inspect the synthetic beacon: перенеси её в архив, но не отмечай выполненной. Ответь кратко по-русски. Не добавляй событий из других кампаний.",
    companionId: null,
    listenerIds: [],
    mechanic: null,
  };
  report.otherTurn = { input, beforeA, beforePlayA };
  await save();
  const result = await owner.request(`${otherRoot}/turns`, input);
  report.otherTurn.result = result;
  report.otherAfter = await owner.request(otherRoot);
  await save();
  console.log(JSON.stringify(result));
  assert.equal(result.status, "committed");
  assert.match(result.narration, /[а-яА-Я]/);
  assert.ok(!/Mira|Glass Orchard|Blue Lantern/.test(result.narration));
  assert.equal(
    report.otherAfter.quests.find((q) => q.id === b.questId).status,
    "archived",
  );
  assert.equal(
    report.otherAfter.publicState.current_location_id,
    b.destinationId,
  );
  assert.equal(
    report.otherAfter.entities.find((e) => e.id === b.actorId).hp,
    6,
  );
  assert.deepEqual(await owner.request(root), beforeA);
  assert.deepEqual(await owner.request(`${root}/play`), beforePlayA);
}
if (command === "verify-guidance") {
  const sessionEntry = report.turns.find(
    (entry) => entry.label === "feedbackSession",
  );
  const campaignEntry = report.turns.find(
    (entry) => entry.label === "feedbackCampaign",
  );
  assert.ok(sessionEntry && campaignEntry);
  const sessionTurn = await owner.request(
    `${root}/turns/${sessionEntry.input.operationId}`,
  );
  const campaignTurn = await owner.request(
    `${root}/turns/${campaignEntry.input.operationId}`,
  );
  assert.equal(sessionTurn.proposal.status, "approved");
  assert.equal(sessionTurn.proposal.scope, "session");
  assert.equal(sessionTurn.proposal.sessionId, a.sessionId);
  assert.equal(campaignTurn.proposal.status, "approved");
  assert.equal(campaignTurn.proposal.scope, "campaign");
  const snapshot = await owner.request(root);
  const play = await owner.request(`${root}/play`);
  assert.equal(play.sessionGuidance.length, 1);
  assert.equal(play.sessionGuidance[0].text, sessionTurn.proposal.text);
  const guide = snapshot.documents.find(
    (doc) => doc.id === snapshot.dmGuideDocumentId,
  );
  assert.ok(guide.body.includes(campaignTurn.proposal.text));
  assert.ok(
    !guide.body.includes(sessionTurn.proposal.text),
    "Session approval rewrote campaign guide",
  );
  const versions = await owner.request(
    `${root}/documents/${guide.id}/versions`,
  );
  assert.equal(versions.length, 4);
  assert.equal(guide.revision, 4);
  const approvedVersion = versions.find((version) => version.version === 2);
  assert.equal(versions[0].restored_from, approvedVersion.id);
  assert.equal(guide.body, approvedVersion.body);
  for (const key of [
    "entities",
    "items",
    "quests",
    "locations",
    "publicState",
    "scenes",
    "settings",
  ])
    assert.deepEqual(
      snapshot[key],
      campaignEntry.before[key],
      `Guide approval/restore mutated ${key}`,
    );
  assert.equal(play.worldMinutes, campaignEntry.beforePlay.worldMinutes);
  report.guidanceVerification = {
    at: new Date().toISOString(),
    passed: true,
    guideRevision: guide.revision,
    versions: versions.length,
  };
  await save();
  console.log(
    "PASS: browser session/campaign approvals are distinct; manual save and restore append immutable guide versions; no gameplay mutation",
  );
}
function checkStep(entry) {
  const { label, before, after, beforePlay, afterPlay } = entry;
  const actor = after.entities.find((e) => e.id === a.actorId);
  const quantity = (tag) =>
    after.items.find((i) => i.id === a.items[tag]).quantity;
  const quest = after.quests.find((q) => q.id === a.questId);
  if (label === "healing") {
    assert.equal(actor.hp, 10);
    assert.equal(quantity("healing"), 1);
  }
  if (label === "focus") assert.equal(actor.resources.focus, 2);
  if (label === "promise") assert.equal(quest.status, "open");
  if (label === "camp") {
    assert.equal(actor.hp, 10);
    assert.equal(quantity("supply"), 8);
    assert.equal(afterPlay.worldMinutes, 0);
    assert.equal(
      afterPlay.restRecords.filter((r) => r.status === "planned").length,
      1,
    );
  }
  if (label === "meal") assert.equal(quantity("meat"), 2);
  if (label === "coffee") {
    assert.equal(quantity("coffee"), 2);
    assert.equal(quantity("water"), 2);
  }
  if (["serveMeal", "serveCoffee"].includes(label)) {
    assert.equal(actor.hp, 10);
    assert.ok(
      afterPlay.effects.some(
        (e) => e.entity_id === a.actorId && e.definition.status === "pending",
      ),
    );
  }
  if (label === "completeRest") {
    assert.equal(actor.hp, 12);
    assert.equal(quantity("supply"), 7);
    assert.equal(afterPlay.worldMinutes, 480);
    assert.ok(afterPlay.restRecords.some((r) => r.status === "complete"));
    assert.equal(
      afterPlay.effects.filter(
        (e) => e.entity_id === a.actorId && e.definition.status === "active",
      ).length,
      2,
    );
  }
  if (label === "deposit") {
    assert.equal(quantity("knife"), 1);
    assert.ok(
      after.items.some(
        (i) =>
          i.storage_id === a.stashId &&
          i.name === "Synthetic knife" &&
          i.quantity === 1,
      ),
    );
  }
  if (label === "blockedWithdrawal")
    assert.deepEqual(after.items, before.items);
  if (label === "travel")
    assert.equal(after.publicState.current_location_id, a.destinationId);
  if (label === "return")
    assert.equal(after.publicState.current_location_id, a.locationId);
  if (label === "forage") {
    assert.equal(afterPlay.worldMinutes, beforePlay.worldMinutes + 60);
    assert.ok(
      afterPlay.effects.some(
        (effect) =>
          effect.definition.kind === "coffee" &&
          effect.definition.status === "expired" &&
          effect.definition.remaining === 0,
      ),
    );
    const oldSupply = before.items
      .filter((i) => i.name === "Foraged supplies")
      .reduce((n, i) => n + i.quantity, 0);
    const newSupply = after.items
      .filter((i) => i.name === "Foraged supplies")
      .reduce((n, i) => n + i.quantity, 0);
    assert.equal(newSupply - oldSupply, entry.result.checks[0].success ? 2 : 0);
  }
  if (label === "transform") {
    assert.equal(afterPlay.worldMinutes, beforePlay.worldMinutes + 10);
    assert.equal(quantity("binding"), 2);
    assert.equal(quantity("cutting-tool"), 1);
    const success = entry.result.checks[0].success;
    assert.equal(quantity("knife"), success ? 0 : 1);
    assert.equal(quantity("stick"), success ? 1 : 2);
    if (success)
      assert.ok(
        afterPlay.provenance.some(
          (record) =>
            record.operation_id === entry.result.id &&
            record.inputs.some(
              (part) =>
                part.itemId === a.items.knife &&
                part.disposition === "embedded",
            ),
        ),
      );
  }
  if (label === "encounter")
    assert.ok(afterPlay.encounters.some((e) => e.status === "active"));
  if (label === "attack") {
    assert.equal(
      after.items.find((item) => item.id === a.items.weapon).equipped_entity_id,
      a.actorId,
    );
    const beforeHp = before.entities.find((e) => e.id === a.adversaryId).hp;
    assert.equal(
      after.entities.find((e) => e.id === a.adversaryId).hp,
      beforeHp - (entry.result.checks[0].success ? 3 : 0),
    );
    assert.equal(entry.result.checks[0].dc, null);
  }
  if (label === "npcAttack") {
    assert.deepEqual(entry.result.checks, []);
    assert.equal(
      actor.hp,
      12,
      "Meal temporary HP absorbs at most the default two damage",
    );
    assert.ok(
      !/\b(?:DC|d20|roll|rolled|hidden check)\b/i.test(entry.result.narration),
    );
    assert.ok(
      afterPlay.participants.some(
        (p) => p.entity_id === a.actorId && p.public_resources.active === true,
      ),
    );
  }
  if (label === "endEncounter")
    assert.ok(
      afterPlay.encounters.some(
        (e) => e.status === "ended" && e.outcome === "negotiation",
      ),
    );
  if (label === "archiveQuest") assert.equal(quest.status, "archived");
  if (label === "continuity") {
    for (const key of ["entities", "items", "quests", "locations", "settings"])
      assert.deepEqual(after[key], before[key]);
    assert.equal(afterPlay.worldMinutes, beforePlay.worldMinutes);
    assert.match(entry.result.narration, /12\/12 HP/);
    assert.match(entry.result.narration, /2 focus/);
    assert.match(entry.result.narration, /1 original Synthetic healing/);
    assert.match(entry.result.narration, /unfulfilled|not.*inspect/i);
  }
  if (label === "companionNow") {
    assert.match(entry.result.narration, /Blue Lantern Walk/);
    assert.deepEqual(after.entities, before.entities);
    assert.deepEqual(after.items, before.items);
    assert.equal(afterPlay.worldMinutes, beforePlay.worldMinutes);
  }
  if (label.startsWith("feedback")) {
    for (const key of [
      "entities",
      "items",
      "quests",
      "locations",
      "scenes",
      "publicState",
      "documents",
      "settings",
    ])
      assert.deepEqual(after[key], before[key], `Feedback mutated ${key}`);
    assert.equal(afterPlay.worldMinutes, beforePlay.worldMinutes);
    assert.ok(
      entry.result.proposal,
      "Requested feedback did not produce an approval proposal",
    );
    assert.equal(entry.result.proposal.status, "proposed");
  }
}
if (command === "smoke") {
  assert.equal(
    report.turns.length,
    0,
    "Smoke already attempted; inspect its saved result before retrying",
  );
  const input = {
    operationId: crypto.randomUUID(),
    campaignId: a.campaignId,
    expectedRevision: runtime.revision,
    mode: "game",
    input:
      "I quietly look around the shelter. Describe only the already established visible surroundings in two short sentences. I do not move, spend resources or attempt anything risky.",
    companionId: null,
    listenerIds: [],
    mechanic: null,
  };
  report.turns.push({
    label: "initial observation",
    input,
    startedAt: new Date().toISOString(),
  });
  await save();
  const turn = await owner.request(`${root}/turns`, input);
  Object.assign(report.turns.at(-1), {
    result: turn,
    finishedAt: new Date().toISOString(),
  });
  await save();
  console.log(
    JSON.stringify({
      operationId: turn.id,
      status: turn.status,
      failure: turn.failure,
      canRetry: turn.canRetry,
      narration: turn.narration,
    }),
  );
}
if (command === "retry-smoke") {
  assert.equal(report.turns.length, 1);
  const entry = report.turns[0];
  assert.ok(entry.result?.canRetry);
  // Exactly one explicit retry per invocation; retain every earlier attempt.
  if (entry.retry) (entry.previousRetries ??= []).push(entry.retry);
  entry.retry = {
    commandId: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
  };
  await save();
  const turn = await owner.request(
    `${root}/turns/${entry.input.operationId}/resume`,
    {
      commandId: entry.retry.commandId,
      campaignId: a.campaignId,
      operationId: entry.input.operationId,
      action: "retry",
      checkId: null,
    },
  );
  entry.retry.result = turn;
  await save();
  console.log(
    JSON.stringify({
      operationId: turn.id,
      status: turn.status,
      failure: turn.failure,
      canRetry: turn.canRetry,
      narration: turn.narration,
    }),
  );
}
if (command === "verify-failure") {
  assert.equal(report.turns.length, 1);
  const entry = report.turns[0];
  const saved = await owner.request(`${root}/turns/${entry.input.operationId}`);
  assert.equal(saved.input, entry.input.input);
  assert.equal(saved.status, "failed");
  assert.equal(saved.narration, null);
  assert.deepEqual(saved.checks, []);
  assert.equal(runtime.revision, entry.input.expectedRevision);
  assert.equal(runtime.worldMinutes, 0);
  assert.equal(runtime.turns.length, 1);
  assert.equal(runtime.restRecords.length, 0);
  assert.equal(runtime.encounters.length, 0);
  const snapshots = [];
  for (const fixture of report.fixtures) {
    const snapshot = await owner.request(pathFor(fixture.campaignId));
    assert.equal(snapshot.entities.find((e) => e.id === fixture.actorId).hp, 6);
    assert.equal(
      snapshot.entities.find((e) => e.id === fixture.actorId).resources.focus,
      3,
    );
    assert.equal(
      snapshot.items.find((i) => i.id === fixture.items.healing).quantity,
      2,
    );
    assert.equal(
      snapshot.items.find((i) => i.id === fixture.items.supply).quantity,
      8,
    );
    assert.equal(
      snapshot.quests.find((q) => q.id === fixture.questId).status,
      "open",
    );
    assert.equal(snapshot.scenes.length, 0);
    assert.equal(snapshot.feedback.length, 0);
    snapshots.push(snapshot);
  }
  const other = await owner.request(
    `${pathFor(report.fixtures[1].campaignId)}/play`,
  );
  assert.equal(other.turns.length, 0);
  await owner.request("/api/auth/sign-out", {});
  await owner.request("/api/auth/sign-in", credentials("OWNER"));
  assert.deepEqual(
    await owner.request(`${root}/turns/${entry.input.operationId}`),
    saved,
  );
  for (const [i, fixture] of report.fixtures.entries())
    assert.deepEqual(
      await owner.request(pathFor(fixture.campaignId)),
      snapshots[i],
    );
  report.failureVerification = { at: new Date().toISOString(), passed: true };
  await save();
  console.log(
    "PASS: failed live operation retains exact input after relogin; no dice, narration, revision, gameplay or cross-campaign changes",
  );
}
