import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import {
  validateTurnInput,
  validateResumeInput,
  validateConfigurePlayInput,
  validateGuidanceApproval,
  validateMechanicChoice,
} from "../src/lib/gameplay/request-validation.ts";
import { safeGameplayError } from "../src/lib/gameplay/http-response.ts";

const campaignId = randomUUID(),
  other = randomUUID();
const turn = () => ({
  operationId: randomUUID(),
  campaignId,
  expectedRevision: 1,
  mode: "game",
  input: "A synthetic action. Действие.",
  companionId: null,
  listenerIds: [],
  mechanic: null,
});
test("turn requests preserve literal input and reject private/schema/cross-campaign injection", () => {
  const input = turn();
  assert.deepEqual(validateTurnInput(input, campaignId), input);
  for (const invalid of [
    { ...input, campaignId: other },
    { ...input, input: "x".repeat(20001) },
    { ...input, privateState: "SYNTHETIC_SECRET" },
    { ...input, checks: [{ total: 20 }] },
    { ...input, expectedRevision: -1 },
    { ...input, companionId: other },
    {
      ...input,
      mode: "feedback",
      mechanic: { kind: "forage", actorId: other, outputStorageId: other },
    },
    { ...input, listenerIds: [other] },
    { ...input, mode: "companion" },
  ])
    assert.throws(() => validateTurnInput(invalid, campaignId));
});
test("resume uses existing operation identity and explicit reroll choice", () => {
  const command = {
    commandId: randomUUID(),
    campaignId,
    operationId: randomUUID(),
    action: "retry",
    checkId: null,
  };
  assert.deepEqual(
    validateResumeInput(command, campaignId, command.operationId),
    command,
  );
  assert.throws(() => validateResumeInput(command, campaignId, other));
  assert.throws(() =>
    validateResumeInput(
      { ...command, action: "reroll" },
      campaignId,
      command.operationId,
    ),
  );
  assert.throws(() =>
    validateResumeInput(
      { ...command, checkId: other },
      campaignId,
      command.operationId,
    ),
  );
});
test("guidance requires an explicit approved scope and expected guide version", () => {
  const request = {
    requestId: randomUUID(),
    campaignId,
    operationId: randomUUID(),
    proposalId: randomUUID(),
    scope: "campaign",
    sessionId: null,
    expectedGuideRevision: 1,
  };
  assert.deepEqual(validateGuidanceApproval(request, campaignId), request);
  for (const invalid of [
    { ...request, scope: "automatic" },
    { ...request, scope: "session" },
    { ...request, text: "replace canon" },
    { ...request, expectedGuideRevision: 0 },
  ]) {
    assert.throws(() => validateGuidanceApproval(invalid, campaignId));
  }
});
test("mechanic request allowlist rejects arbitrary mutations and duplicate ingredient lines", () => {
  assert.throws(() =>
    validateMechanicChoice({ kind: "hp.set", entityId: other, hp: 999 }),
  );
  assert.throws(() =>
    validateMechanicChoice({
      kind: "rest.complete",
      restId: other,
      supplies: [
        { itemId: other, quantity: 1 },
        { itemId: other, quantity: 1 },
      ],
    }),
  );
  assert.throws(() =>
    validateMechanicChoice({
      kind: "item.consume",
      actorId: other,
      itemId: other,
      quantity: -1,
    }),
  );
  assert.deepEqual(
    validateMechanicChoice({
      kind: "rest.enter",
      restKind: "long",
      participantIds: [other],
    }),
    { kind: "rest.enter", restKind: "long", participantIds: [other] },
  );
});
test("rules configuration is explicit and cannot silently enable unknown profiles or item powers", () => {
  const config = {
    requestId: randomUUID(),
    campaignId,
    expectedRevision: 0,
    configuration: {
      profile: "console-basic-v1",
      controlledEntityIds: [other],
      presentEntityIds: [other],
      nearbyStorageIds: [],
      safeLocationIds: [],
      itemRules: [{ itemId: other, tag: "weapon", damage: 3 }],
    },
  };
  assert.deepEqual(validateConfigurePlayInput(config, campaignId), config);
  assert.throws(() =>
    validateConfigurePlayInput(
      {
        ...config,
        configuration: { ...config.configuration, profile: "custom" },
      },
      campaignId,
    ),
  );
  assert.throws(() =>
    validateConfigurePlayInput(
      {
        ...config,
        configuration: {
          ...config.configuration,
          itemRules: [{ itemId: other, tag: "weapon", damage: 999 }],
        },
      },
      campaignId,
    ),
  );
});
test("gameplay HTTP failures never serialize raw provider payloads or private markers", () => {
  for (const code of [
    "provider",
    "context",
    "conflict",
    "validation",
    "configuration",
    "private-title-SYNTHETIC_SECRET",
  ]) {
    const response = safeGameplayError({
      code,
      message: "SYNTHETIC_SECRET",
      cause: { request: "private prompt" },
    });
    assert.ok(!JSON.stringify(response).includes("SYNTHETIC_SECRET"));
    assert.deepEqual(Object.keys(response.body.error).sort(), [
      "code",
      "message",
    ]);
  }
});
