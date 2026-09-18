import assert from "node:assert/strict";
import test from "node:test";
import {
  createMemoryReader,
  hasPendingSessionTurn,
  loadMemoryAttempt,
  memoryAttemptConfirmed,
  memoryAttemptKey,
  prepareMemoryAttempt,
  saveMemoryAttempt,
  sessionBoundaryView,
  sessionGate,
  turnAllowedBySession,
} from "../src/lib/memory/client-state.ts";
import {
  continueSession,
  endSession,
  loadMemory,
  MemoryClientError,
  memoryErrorMessage,
  retryMemory,
} from "../src/lib/memory/client.ts";

const campaignId = "campaign-a";
function boundary(patch = {}) {
  return {
    id: "boundary-a",
    campaign_id: campaignId,
    sessionId: "session-a",
    endedAt: "2026-09-18T00:00:00Z",
    state: "ended",
    nextSessionId: null,
    checkpointStatus: "ready",
    resume: {
      sceneId: "scene-a",
      locationId: "east-pier",
      worldMinutes: 1420,
      participantIds: ["hero", "nera"],
      lastAction: "Inspect the pier",
      lastOutcome: null,
      situation: "At the east pier",
      expectedInput: "Confirm the saved check",
      pendingOperationId: "operation-a",
      pendingStatus: "awaiting_confirmation",
    },
    recap: { status: "failed", text: null, canRetry: true },
    ...patch,
  };
}
function snapshot(row = boundary(), revision = 7) {
  return {
    campaignId,
    runtimeRevision: revision,
    currentBoundary: row,
    sessions: row ? [row] : [],
  };
}
function storage() {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };
}
const end = {
  kind: "end",
  input: { campaignId, sessionId: "session-a", expectedRevision: 7 },
};

test("END retains original identity/revision through uncertain retries, reload and edited state", () => {
  const first = prepareMemoryAttempt(null, end, () => "request-a");
  const next = prepareMemoryAttempt(
    first,
    {
      ...end,
      input: { ...end.input, expectedRevision: 99, sessionId: "session-b" },
    },
    () => {
      throw Error("must not replace accepted request");
    },
  );
  assert.equal(next, first);
  const saved = storage();
  assert.equal(saveMemoryAttempt(saved, campaignId, first), true);
  assert.deepEqual(loadMemoryAttempt(saved, campaignId), first);
  assert.equal(loadMemoryAttempt(saved, "campaign-b"), null);
  saved.setItem(memoryAttemptKey("campaign-b"), JSON.stringify(first));
  assert.equal(loadMemoryAttempt(saved, "campaign-b"), null);
  saveMemoryAttempt(saved, campaignId, null);
  assert.equal(loadMemoryAttempt(saved, campaignId), null);
});
test("malformed or unavailable local journals cannot invent session requests", () => {
  const saved = storage();
  for (const value of [
    null,
    {},
    { kind: "end", input: { ...end.input, expectedRevision: -1 } },
    {
      kind: "continue",
      input: {
        campaignId,
        requestId: "x",
        boundaryId: "b",
        expectedRevision: 1,
      },
      fromState: "continued",
    },
  ]) {
    saved.setItem(memoryAttemptKey(campaignId), JSON.stringify(value));
    assert.equal(loadMemoryAttempt(saved, campaignId), null);
  }
  const unavailable = {
    getItem() {
      throw Error("blocked");
    },
    setItem() {
      throw Error("blocked");
    },
  };
  assert.equal(loadMemoryAttempt(unavailable, campaignId), null);
  assert.equal(
    saveMemoryAttempt(unavailable, campaignId, prepareMemoryAttempt(null, end)),
    false,
  );
});
test("lost END response is reconciled from its durable boundary even when public recap failed", () => {
  const attempt = prepareMemoryAttempt(null, end, () => "request-a");
  assert.equal(memoryAttemptConfirmed(attempt, snapshot()), true);
  assert.equal(memoryAttemptConfirmed(attempt, snapshot(null)), false);
  assert.equal(
    memoryAttemptConfirmed(attempt, {
      ...snapshot(),
      campaignId: "campaign-b",
    }),
    false,
  );
  assert.equal(snapshot().currentBoundary.recap.status, "failed");
});
test("two explicit Continue commands have distinct identities and cannot mistake resuming for next-session completion", () => {
  const first = prepareMemoryAttempt(
    null,
    {
      kind: "continue",
      fromState: "ended",
      input: { campaignId, boundaryId: "boundary-a", expectedRevision: 7 },
    },
    () => "continue-one",
  );
  assert.equal(
    memoryAttemptConfirmed(first, snapshot(boundary({ state: "resuming" }))),
    true,
  );
  const second = prepareMemoryAttempt(
    null,
    {
      kind: "continue",
      fromState: "resuming",
      input: { campaignId, boundaryId: "boundary-a", expectedRevision: 8 },
    },
    () => "continue-two",
  );
  assert.equal(
    memoryAttemptConfirmed(second, snapshot(boundary({ state: "resuming" }))),
    false,
  );
  assert.equal(
    memoryAttemptConfirmed(
      second,
      snapshot(boundary({ state: "continued", nextSessionId: "session-b" })),
    ),
    true,
  );
  assert.notEqual(first.input.requestId, second.input.requestId);
  assert.equal(
    prepareMemoryAttempt(first, {
      kind: "retry",
      input: { campaignId, boundaryId: "boundary-a" },
    }),
    first,
  );
});
test("a failed recap never prevents Continue from a valid saved boundary", () => {
  assert.deepEqual(sessionBoundaryView(boundary()), {
    pending: true,
    canContinue: true,
    recapText: null,
  });
  const invalid = boundary({
    checkpointStatus: "rebuild_required",
    recap: { status: "ready", text: "STALE_TEXT", canRetry: true },
  });
  assert.deepEqual(sessionBoundaryView(invalid), {
    pending: true,
    canContinue: false,
    recapText: null,
  });
  for (const status of ["pending", "generating", "failed", "stale"])
    assert.equal(
      sessionBoundaryView(
        boundary({ recap: { status, text: "NOT_CURRENT", canRetry: true } }),
      ).recapText,
      null,
    );
  assert.equal(
    sessionBoundaryView(
      boundary({
        recap: { status: "ready", text: "Public recap", canRetry: false },
      }),
    ).recapText,
    "Public recap",
  );
});
test("pending roll survives ended/resuming gates without implicit continuation, reroll or state mutation", () => {
  const before = boundary();
  const encoded = JSON.stringify(before);
  for (const mode of ["game", "companion", "mechanic"]) {
    assert.equal(sessionGate(snapshot(before), mode), false);
    assert.equal(sessionGate(snapshot(before), mode, "operation-a"), false);
    const resuming = snapshot(boundary({ state: "resuming" }));
    assert.equal(sessionGate(resuming, mode), false);
    assert.equal(sessionGate(resuming, mode, "other-operation"), false);
    assert.equal(sessionGate(resuming, mode, "operation-a"), true);
    assert.equal(sessionGate(null, mode, "operation-a"), false);
    assert.equal(sessionGate(snapshot(null), mode), true);
    assert.equal(
      sessionGate(snapshot(boundary({ state: "continued" })), mode),
      true,
    );
  }
  assert.equal(JSON.stringify(before), encoded);
  assert.equal(
    turnAllowedBySession(snapshot(before), { id: "operation-a", mode: "game" }),
    false,
  );
  assert.equal(
    sessionGate(
      snapshot(
        boundary({ state: "resuming", checkpointStatus: "rebuild_required" }),
      ),
      "game",
      "operation-a",
    ),
    false,
  );
});
test("feedback and OOC stay separate from the gameplay boundary", () => {
  for (const mode of ["feedback", "ooc"])
    for (const value of [
      null,
      snapshot(),
      snapshot(boundary({ state: "resuming" })),
    ])
      assert.equal(sessionGate(value, mode), true);
});
test("second Continue stays unavailable until the exact pending operation is terminal", () => {
  assert.equal(
    sessionBoundaryView(boundary({ state: "resuming" })).canContinue,
    false,
  );
  for (const pendingStatus of ["committed", "cancelled"])
    assert.equal(
      sessionBoundaryView(
        boundary({
          state: "resuming",
          resume: { ...boundary().resume, pendingStatus },
        }),
      ).canContinue,
      true,
    );
  const terminalFailure = boundary({
    state: "resuming",
    resume: {
      ...boundary().resume,
      pendingOperationId: null,
      pendingStatus: "failed",
    },
  });
  assert.equal(hasPendingSessionTurn(terminalFailure), false);
  assert.equal(sessionBoundaryView(terminalFailure).canContinue, true);
});
test("shared read deduplicates subscribers and a late GET cannot undo an acknowledged boundary", async () => {
  let resolveRead;
  let reads = 0;
  const reader = createMemoryReader(
    campaignId,
    () => {
      reads++;
      return new Promise((resolve) => {
        resolveRead = resolve;
      });
    },
    memoryErrorMessage,
  );
  let updates = 0;
  const unsubscribe = reader.subscribe(() => {
    updates++;
  });
  const pending = reader.refresh();
  assert.equal(reader.refresh(), pending);
  assert.equal(reads, 1);
  const saved = snapshot();
  reader.accept(saved);
  resolveRead(snapshot(null, 6));
  await pending;
  assert.equal(reader.getSnapshot().snapshot, saved);
  assert.equal(updates, 1);
  reader.accept(snapshot(null, 6));
  assert.equal(reader.getSnapshot().snapshot, saved);
  unsubscribe();
});
test("failed or cross-campaign reads preserve the saved boundary and expose a neutral diagnostic", async () => {
  const reader = createMemoryReader(
    campaignId,
    async () => {
      throw Error("SYNTHETIC_PRIVATE_PROVIDER_BODY");
    },
    memoryErrorMessage,
  );
  const saved = snapshot();
  reader.accept(saved);
  await assert.rejects(reader.refresh());
  assert.equal(reader.getSnapshot().snapshot, saved);
  assert.doesNotMatch(reader.getSnapshot().error, /PRIVATE|PROVIDER_BODY/);
  const wrong = createMemoryReader(
    campaignId,
    async () => ({ ...snapshot(), campaignId: "campaign-b" }),
    memoryErrorMessage,
  );
  await assert.rejects(wrong.refresh());
  assert.equal(wrong.getSnapshot().snapshot, null);
});
test("memory transport uses four scoped no-store endpoints without sending any dice or turn commands", async () => {
  const previous = globalThis.fetch;
  const seen = [];
  globalThis.fetch = async (url, options) => {
    seen.push({ url, options });
    return Response.json(snapshot());
  };
  try {
    await loadMemory(campaignId);
    const endInput = { ...end.input, requestId: "end-a" };
    await endSession(endInput);
    await continueSession({
      requestId: "continue-a",
      campaignId,
      boundaryId: "boundary-a",
      expectedRevision: 7,
    });
    await retryMemory({
      requestId: "retry-a",
      campaignId,
      boundaryId: "boundary-a",
    });
    assert.deepEqual(
      seen.map((row) => row.url),
      ["", "/end", "/continue", "/retry"].map(
        (suffix) => `/api/campaigns/${campaignId}/memory${suffix}`,
      ),
    );
    assert.deepEqual(JSON.parse(seen[1].options.body), endInput);
    for (const { options } of seen) {
      assert.equal(options.credentials, "same-origin");
      assert.equal(options.cache, "no-store");
      assert.doesNotMatch(
        options.body ?? "",
        /dice|checkId|operationId|reroll/,
      );
    }
  } finally {
    globalThis.fetch = previous;
  }
});
test("malformed responses, scope mismatch and raw private errors cannot become memory UI messages", async () => {
  const previous = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      Response.json(
        {
          error: {
            code: "PRIVATE_JOB_ID",
            message: "SYNTHETIC_PRIVATE_PROVIDER_BODY",
          },
        },
        { status: 503 },
      );
    await assert.rejects(
      loadMemory(campaignId),
      (cause) =>
        cause instanceof MemoryClientError &&
        cause.code === "unavailable" &&
        !memoryErrorMessage(cause).includes("PRIVATE"),
    );
    globalThis.fetch = async () => new Response("not json", { status: 200 });
    await assert.rejects(loadMemory(campaignId), MemoryClientError);
    globalThis.fetch = async () =>
      Response.json({ ...snapshot(), campaignId: "campaign-b" });
    await assert.rejects(loadMemory(campaignId), MemoryClientError);
    globalThis.fetch = async () =>
      Response.json(snapshot(boundary({ campaign_id: "campaign-b" })));
    await assert.rejects(loadMemory(campaignId), MemoryClientError);
  } finally {
    globalThis.fetch = previous;
  }
});
