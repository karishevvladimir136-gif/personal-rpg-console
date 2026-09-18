import assert from "node:assert/strict";
import test from "node:test";
import {
  belongsToChannel,
  emptyJournal,
  isUnresolved,
  journalKey,
  loadJournal,
  prepareAttempt,
  prepareCommand,
  reconcileJournal,
  saveJournal,
} from "../src/lib/gameplay/client-state.ts";
import {
  GameplayClientError,
  approveGuidance,
  configurePlay,
  gameplayErrorMessage,
  loadPlay,
  resumeTurn,
  sendTurn,
} from "../src/lib/gameplay/client.ts";

const input = {
  campaignId: "campaign-a",
  expectedRevision: 7,
  mode: "game",
  input: "I inspect the blue lantern. Осматриваю фонарь.",
  companionId: null,
  listenerIds: [],
  mechanic: null,
};
const turn = (patch = {}) => ({
  id: "operation-a",
  campaign_id: "campaign-a",
  input: input.input,
  mode: "game",
  companionId: null,
  status: "generating",
  canRetry: true,
  ...patch,
});
function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}
test("uncertain submissions retain original operation, revision and literal input despite edited data", () => {
  let generated = 0;
  const first = prepareAttempt(null, input, () => {
    generated++;
    return "operation-a";
  });
  assert.equal(first.input, input.input);
  assert.equal(
    prepareAttempt(
      first,
      { ...input, expectedRevision: 99, input: "changed" },
      () => {
        throw Error("must not create another operation");
      },
    ),
    first,
  );
  assert.equal(generated, 1);
});
test("draft and pending operation survive reload and are isolated by campaign, mode and companion", () => {
  const storage = memoryStorage();
  const journal = {
    text: input.input,
    attempt: { ...input, operationId: "operation-a" },
    command: null,
  };
  assert.equal(
    saveJournal(storage, journalKey("campaign-a", "game"), journal),
    true,
  );
  assert.deepEqual(loadJournal(storage, "campaign-a", "game"), journal);
  assert.deepEqual(loadJournal(storage, "campaign-b", "game"), emptyJournal());
  assert.deepEqual(
    loadJournal(storage, "campaign-a", "feedback"),
    emptyJournal(),
  );
  assert.notEqual(
    journalKey("campaign-a", "companion", "nera"),
    journalKey("campaign-a", "companion", "olan"),
  );
  storage.setItem(journalKey("campaign-b", "game"), JSON.stringify(journal));
  assert.equal(loadJournal(storage, "campaign-b", "game").attempt, null);
});
test("unavailable local storage keeps in-memory recovery safe and reports durability limitation", () => {
  const storage = {
    getItem() {
      throw Error("denied");
    },
    setItem() {
      throw Error("quota");
    },
  };
  assert.deepEqual(loadJournal(storage, "campaign-a", "game"), emptyJournal());
  assert.equal(saveJournal(storage, "key", emptyJournal()), false);
  assert.equal(saveJournal(null, "key", emptyJournal()), false);
});
test("transient failures preserve exact input and operation; conflicts preserve input but release old proposal", () => {
  const journal = {
    text: input.input,
    attempt: { ...input, operationId: "operation-a" },
    command: null,
  };
  assert.equal(
    reconcileJournal(journal, turn({ status: "failed", canRetry: true })),
    journal,
  );
  assert.deepEqual(
    reconcileJournal(journal, turn({ status: "failed", canRetry: false })),
    { text: input.input, attempt: null, command: null },
  );
  assert.equal(
    reconcileJournal(
      journal,
      turn({ id: "other-operation", status: "committed" }),
    ),
    journal,
  );
});
test("only committed matching input clears the draft; newer text and cancelled input remain", () => {
  const journal = {
    text: input.input,
    attempt: { ...input, operationId: "operation-a" },
    command: null,
  };
  assert.deepEqual(
    reconcileJournal(journal, turn({ status: "committed" })),
    emptyJournal(),
  );
  assert.equal(
    reconcileJournal(
      { ...journal, text: "New local draft" },
      turn({ status: "committed" }),
    ).text,
    "New local draft",
  );
  assert.equal(
    reconcileJournal(journal, turn({ status: "cancelled" })).text,
    input.input,
  );
});
test("uncertain reroll command retains identity across retry and reload instead of granting another roll", () => {
  const command = prepareCommand(
    null,
    {
      campaignId: "campaign-a",
      operationId: "operation-a",
      action: "reroll",
      checkId: "check-a",
    },
    () => "command-a",
  );
  assert.equal(
    prepareCommand(command, { ...command, action: "continue" }, () => {
      throw Error("duplicate");
    }),
    command,
  );
  const storage = memoryStorage();
  const journal = {
    text: input.input,
    attempt: { ...input, operationId: "operation-a" },
    command,
  };
  saveJournal(storage, journalKey("campaign-a", "game"), journal);
  assert.deepEqual(loadJournal(storage, "campaign-a", "game").command, command);
});

test("a recovered accepted mechanic is marked for resume, never re-submission with an invented mechanic", () => {
  const storage = memoryStorage();
  const journal = {
    text: "",
    attempt: { ...input, mode: "mechanic", operationId: "operation-a" },
    command: null,
    recovered: true,
  };
  saveJournal(storage, journalKey("campaign-a", "mechanic"), journal);
  assert.equal(loadJournal(storage, "campaign-a", "mechanic").recovered, true);
  assert.deepEqual(
    reconcileJournal(journal, turn({ status: "committed" })),
    emptyJournal(),
  );
});
test("feedback and companion histories never include ordinary game or another companion channel", () => {
  assert.equal(belongsToChannel(turn(), "feedback", null), false);
  assert.equal(
    belongsToChannel(
      turn({ mode: "companion", companionId: "nera" }),
      "companion",
      "olan",
    ),
    false,
  );
  assert.equal(
    belongsToChannel(
      turn({ mode: "companion", companionId: "nera" }),
      "companion",
      "nera",
    ),
    true,
  );
  assert.equal(isUnresolved(turn({ status: "awaiting_confirmation" })), true);
  assert.equal(
    isUnresolved(turn({ status: "failed", canRetry: false })),
    false,
  );
});
test("transport uses campaign-scoped same-origin no-store routes and exact immutable payloads", async () => {
  const originalFetch = globalThis.fetch;
  const seen = [];
  globalThis.fetch = async (url, init) => {
    seen.push({ url, init });
    return Response.json({ campaignId: "campaign-a" });
  };
  try {
    await loadPlay("campaign-a");
    await sendTurn({ ...input, operationId: "operation-a" });
    await resumeTurn({
      commandId: "command-a",
      campaignId: "campaign-a",
      operationId: "operation-a",
      action: "retry",
      checkId: null,
    });
    await configurePlay({
      requestId: "config-a",
      campaignId: "campaign-a",
      expectedRevision: 7,
      configuration: { profile: "console-basic-v1" },
    });
    await approveGuidance({
      requestId: "approval-a",
      campaignId: "campaign-a",
      operationId: "operation-a",
      proposalId: "proposal-a",
      scope: "session",
      sessionId: "session-a",
      expectedGuideRevision: 4,
    });
    assert.deepEqual(
      seen.map((row) => row.url),
      [
        "/api/campaigns/campaign-a/play",
        "/api/campaigns/campaign-a/turns",
        "/api/campaigns/campaign-a/turns/operation-a/resume",
        "/api/campaigns/campaign-a/play/config",
        "/api/campaigns/campaign-a/guidance",
      ],
    );
    for (const { init } of seen) {
      assert.equal(init.credentials, "same-origin");
      assert.equal(init.cache, "no-store");
    }
    assert.deepEqual(JSON.parse(seen[1].init.body), {
      ...input,
      operationId: "operation-a",
    });
    assert.equal(JSON.parse(seen[4].init.body).scope, "session");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
test("provider/SQL error bodies never become displayed UI text, including malformed responses", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      Response.json(
        {
          error: {
            code: "private-provider-diagnostic",
            message: "SYNTHETIC_PRIVATE_MARKER",
          },
        },
        { status: 503 },
      );
    await assert.rejects(
      loadPlay("campaign-a"),
      (cause) =>
        cause instanceof GameplayClientError &&
        !gameplayErrorMessage(cause).includes("SYNTHETIC_PRIVATE_MARKER") &&
        !gameplayErrorMessage(cause).includes("private-provider-diagnostic"),
    );
    globalThis.fetch = async () => new Response("not JSON", { status: 502 });
    await assert.rejects(loadPlay("campaign-a"), GameplayClientError);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
