import assert from "node:assert/strict";
import test from "node:test";
import {
  loadSaves,
  runSaveCommand,
  SavesClientError,
  savesErrorMessage,
  validateSavesSnapshot,
} from "../src/lib/saves/client.ts";
import {
  acceptTimelineRead,
  loadSaveAttempt,
  ordinaryLoadAllowed,
  prepareSaveAttempt,
  readLocal,
  sameTimeline,
  saveAttemptKey,
  saveBase,
  saveDraftKey,
  writeLocal,
} from "../src/lib/saves/client-state.ts";
import {
  journalKey,
  journalNeedsTimelineReview,
  loadJournal,
  prepareAttempt,
  prepareCommand,
  reviewJournalForTimeline,
  saveJournal,
} from "../src/lib/gameplay/client-state.ts";
import {
  createMemoryReader,
  loadMemoryAttempt,
  memoryAttemptConfirmed,
  memoryAttemptKey,
  saveMemoryAttempt,
} from "../src/lib/memory/client-state.ts";

const campaignId = "campaign-one";
const a = { timelineId: "timeline-a", epoch: 1 };
const b = { timelineId: "timeline-b", epoch: 2 };
const returnedA = { timelineId: "timeline-a", epoch: 3 };
function snapshot(timeline = a, patch = {}) {
  return {
    campaignId,
    timeline,
    runtimeRevision: 19,
    revision: 8,
    saves: [
      {
        id: "save-a",
        campaign_id: campaignId,
        timelineId: a.timelineId,
        name: "Before the fortress",
        kind: "manual",
        createdAt: "2026-09-19T00:00:00Z",
        sessionTitle: "At the pier",
        sceneTitle: null,
        locationName: "Lantern Harbor",
        worldMinutes: 60,
        pendingAction: true,
      },
    ],
    timelines: [
      {
        id: timeline.timelineId,
        campaign_id: campaignId,
        label: "Main timeline",
        active: true,
        quickSaveId: null,
        parentTimelineId: null,
        forkSaveId: null,
        locationName: "Lantern Harbor",
        worldMinutes: 60,
        createdAt: "2026-09-19T00:00:00Z",
        updatedAt: "2026-09-19T00:00:00Z",
      },
    ],
    policy: { autosave: "session", retention: 15, loadMode: "unrestricted" },
    ...patch,
  };
}
function storage() {
  const map = new Map();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, value),
    removeItem: (key) => map.delete(key),
  };
}
const load = {
  action: "load",
  input: {
    ...saveBase(snapshot(), "request-one"),
    saveId: "save-a",
    label: "Another path",
    recovery: false,
  },
};

test("uncertain save/load keeps original request, title, revisions and fence across refresh", () => {
  const saved = storage();
  writeLocal(saved, saveAttemptKey(campaignId), load);
  writeLocal(saved, saveDraftKey(campaignId, a.timelineId), "Before Elena");
  const recovered = loadSaveAttempt(saved, campaignId);
  assert.deepEqual(recovered, load);
  const conflictingChoice = {
    action: "load",
    input: {
      ...load.input,
      requestId: "wrong-new-id",
      timeline: b,
      label: "Edited",
    },
  };
  assert.deepEqual(prepareSaveAttempt(recovered, conflictingChoice), load);
  assert.equal(
    readLocal(saved, saveDraftKey(campaignId, a.timelineId)),
    "Before Elena",
  );
  assert.equal(readLocal(saved, saveDraftKey(campaignId, b.timelineId)), null);
  assert.equal(loadSaveAttempt(saved, "campaign-other"), null);
});
test("malformed or unavailable local recovery never creates a command", () => {
  const saved = storage();
  for (const value of [
    {},
    { ...load, input: { ...load.input, campaignId: "other" } },
    {
      ...load,
      input: { ...load.input, timeline: { timelineId: "a", epoch: -1 } },
    },
    { ...load, action: "erase" },
  ]) {
    writeLocal(saved, saveAttemptKey(campaignId), value);
    assert.equal(loadSaveAttempt(saved, campaignId), null);
  }
  const unavailable = {
    getItem() {
      throw Error("denied");
    },
    setItem() {
      throw Error("denied");
    },
  };
  assert.equal(loadSaveAttempt(unavailable, campaignId), null);
  assert.equal(writeLocal(unavailable, "name", "draft"), false);
});
test("timeline activation uses monotonic epochs, preventing late responses and ABA", () => {
  assert.equal(acceptTimelineRead(snapshot(a), snapshot(b)), true);
  assert.equal(acceptTimelineRead(snapshot(b), snapshot(a)), false);
  assert.equal(acceptTimelineRead(snapshot(returnedA), snapshot(a)), false);
  assert.equal(
    acceptTimelineRead(
      snapshot(a),
      snapshot({ timelineId: "different", epoch: 1 }),
    ),
    false,
  );
  assert.equal(acceptTimelineRead(snapshot(a), {}), false);
  assert.equal(sameTimeline(a, returnedA), false);
  assert.equal(sameTimeline(a, { ...a }), true);
});
test("inactive timeline game drafts survive navigation without moving pending commands into another branch", () => {
  const saved = storage();
  const attempt = prepareAttempt(
    null,
    {
      timeline: a,
      campaignId,
      expectedRevision: 19,
      mode: "game",
      input: "Inspect the pier",
      companionId: null,
      listenerIds: [],
      mechanic: null,
    },
    () => "operation-a",
  );
  const command = prepareCommand(
    null,
    {
      timeline: a,
      campaignId,
      operationId: attempt.operationId,
      action: "continue",
      checkId: "check-a",
    },
    () => "command-a",
  );
  const journal = { text: attempt.input, timeline: a, attempt, command };
  saveJournal(saved, journalKey(campaignId, "game", null, a), journal);
  assert.equal(loadJournal(saved, campaignId, "game", null, b).text, "");
  const recovered = loadJournal(saved, campaignId, "game", null, returnedA);
  assert.deepEqual(recovered, journal);
  assert.equal(journalNeedsTimelineReview(recovered, returnedA), true);
  assert.equal(recovered.command.commandId, "command-a");
  const reviewed = reviewJournalForTimeline(recovered, returnedA);
  assert.equal(reviewed.text, journal.text);
  assert.equal(reviewed.command, null);
  assert.equal(reviewed.attempt, null);
  assert.equal(journalNeedsTimelineReview(reviewed, returnedA), false);
  assert.deepEqual(
    loadJournal(saved, campaignId, "game", null, returnedA),
    journal,
    "reviewing in memory never silently rewrites stored request",
  );
});
test("session END/Continue journals cannot cross a timeline or reconcile against a sibling boundary", () => {
  const saved = storage();
  const attempt = {
    kind: "end",
    input: {
      timeline: a,
      campaignId,
      expectedRevision: 19,
      requestId: "end-a",
      sessionId: "session-a",
    },
  };
  saveMemoryAttempt(saved, campaignId, attempt, a);
  assert.equal(saveMemoryAttempt(saved, campaignId, attempt, b), false);
  assert.notEqual(
    memoryAttemptKey(campaignId, a),
    memoryAttemptKey(campaignId, b),
  );
  assert.equal(loadMemoryAttempt(saved, campaignId, b), null);
  assert.deepEqual(loadMemoryAttempt(saved, campaignId, returnedA), attempt);
  const boundary = { sessionId: "session-a" };
  assert.equal(
    memoryAttemptConfirmed(attempt, {
      campaignId,
      timeline: b,
      sessions: [boundary],
      currentBoundary: boundary,
    }),
    false,
  );
  assert.equal(
    memoryAttemptConfirmed(attempt, {
      campaignId,
      timeline: returnedA,
      sessions: [boundary],
      currentBoundary: boundary,
    }),
    false,
  );
  assert.equal(
    memoryAttemptConfirmed(attempt, {
      campaignId,
      timeline: a,
      sessions: [boundary],
      currentBoundary: boundary,
    }),
    true,
  );
});
test("memory reader rejects late abandoned-future response even when campaign and numerical revision match", async () => {
  const abandoned = {
    campaignId,
    timeline: a,
    runtimeRevision: 19,
    currentBoundary: null,
    sessions: [],
  };
  const reader = createMemoryReader(
    campaignId,
    async () => abandoned,
    () => "Refresh saved session",
    b,
  );
  await assert.rejects(reader.refresh());
  assert.equal(reader.getSnapshot().snapshot, null);
  assert.throws(() => reader.accept(abandoned));
  const valid = { ...abandoned, timeline: b };
  reader.accept(valid);
  assert.equal(reader.getSnapshot().snapshot, valid);
});
test("policy requires explicit recovery for restricted/manual checkpoint loads", () => {
  assert.equal(ordinaryLoadAllowed(snapshot(), "manual"), true);
  const checkpoints = snapshot(a, {
    policy: { autosave: "session", retention: 15, loadMode: "checkpoints" },
  });
  assert.equal(ordinaryLoadAllowed(checkpoints, "manual"), false);
  assert.equal(ordinaryLoadAllowed(checkpoints, "quick"), false);
  assert.equal(ordinaryLoadAllowed(checkpoints, "autosave"), true);
  assert.equal(ordinaryLoadAllowed(checkpoints, "safety"), true);
  assert.equal(
    ordinaryLoadAllowed(
      snapshot(a, {
        policy: { ...checkpoints.policy, loadMode: "restricted" },
      }),
      "safety",
    ),
    false,
  );
});
test("save transport retains exact scoped command and only calls deterministic save endpoints", async () => {
  const previous = globalThis.fetch;
  const seen = [];
  globalThis.fetch = async (url, options) => {
    seen.push({ url, options });
    return Response.json(
      options.method === "GET"
        ? snapshot()
        : {
            snapshot: snapshot(b),
            requestId: "request-one",
            saveId: "save-a",
            timelineId: b.timelineId,
            safetySaveId: "safety-a",
          },
    );
  };
  try {
    assert.deepEqual(await loadSaves(campaignId), snapshot());
    const result = await runSaveCommand(load);
    assert.equal(result.snapshot.timeline.timelineId, b.timelineId);
    assert.equal(seen[0].url, `/api/campaigns/${campaignId}/saves`);
    assert.equal(seen[1].url, `/api/campaigns/${campaignId}/saves/load`);
    assert.deepEqual(JSON.parse(seen[1].options.body), load.input);
    for (const row of seen) {
      assert.equal(row.options.cache, "no-store");
      assert.equal(row.options.credentials, "same-origin");
      assert.doesNotMatch(row.url, /turns|memory|openai/);
    }
  } finally {
    globalThis.fetch = previous;
  }
});
test("save transport rejects campaign mismatch, wrong receipts and private error payloads", async () => {
  const previous = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      Response.json(
        {
          error: { code: "PRIVATE_CANARY", message: "SYNTHETIC_PRIVATE_BODY" },
        },
        { status: 500 },
      );
    await assert.rejects(loadSaves(campaignId), (cause) => {
      assert.equal(cause.code, "unavailable");
      assert.doesNotMatch(savesErrorMessage(cause), /PRIVATE/);
      return true;
    });
    globalThis.fetch = async () =>
      Response.json({ ...snapshot(), campaignId: "other" });
    await assert.rejects(loadSaves(campaignId), SavesClientError);
    globalThis.fetch = async () =>
      Response.json({
        snapshot: snapshot(),
        requestId: "other",
        saveId: "s",
        timelineId: "t",
        safetySaveId: null,
      });
    await assert.rejects(runSaveCommand(load), SavesClientError);
    assert.throws(() =>
      validateSavesSnapshot(snapshot(a, { timelines: [] }), campaignId),
    );
    assert.throws(() =>
      validateSavesSnapshot(
        snapshot(a, {
          saves: [{ ...snapshot().saves[0], campaign_id: "other" }],
        }),
        campaignId,
      ),
    );
    assert.throws(() =>
      validateSavesSnapshot(
        snapshot(a, { timeline: { timelineId: "a", epoch: 0 } }),
        campaignId,
      ),
    );
  } finally {
    globalThis.fetch = previous;
  }
});
