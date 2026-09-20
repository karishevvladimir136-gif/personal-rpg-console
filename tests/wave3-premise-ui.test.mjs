import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  createPremiseAttempt,
  createPremiseRequestGate,
  loadCampaignPremise,
  mergePremiseHistory,
  optionalCreationPremise,
  premiseDraft,
  premiseScopeMatches,
  PremiseClientError,
  samePremiseDraft,
  samePremiseHead,
  validateCampaignPremise,
  writeCampaignPremise,
} from "../src/lib/campaign-premise-client.ts";
import { campaignPremiseText } from "../src/lib/campaign-premise-i18n.ts";

const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const campaignId = id(1);
const timeline = { timelineId: id(2), epoch: 1 };
function version(n, fields = {}) {
  const text = `  Synthetic premise ${n}\n\nСохранить исходный текст.  `;
  return {
    id: id(n + 100),
    documentId: id(3),
    version: n,
    text,
    language: "ru",
    reviewStatus: "draft",
    authoredBy: id(4),
    digest: createHash("sha256").update(text).digest("hex"),
    previousVersionId: n === 1 ? null : id(n + 99),
    restoredFromVersionId: null,
    createdAt: "2026-09-20T15:00:00.000Z",
    ...fields,
  };
}
function premise(n = 1, before = null) {
  const newest = Math.min(n, before === null ? n : before - 1);
  const length = Math.min(32, newest);
  const versions = Array.from({ length }, (_, index) =>
    version(newest - index),
  );
  return {
    schemaVersion: 1,
    campaignId,
    timeline: { ...timeline },
    revision: n,
    current: n === 0 ? null : version(n),
    versions,
    olderThan: versions.at(-1)?.version > 1 ? versions.at(-1).version : null,
  };
}
const scope = () => ({ campaignId, timeline: { ...timeline } });

test("creation keeps exact EN/RU originals and omits an optional empty premise", () => {
  for (const language of ["en", "ru"]) {
    const input = {
      text: "  Keep my spacing.\n\nМоя исходная формулировка.\n",
      language,
    };
    assert.deepEqual(optionalCreationPremise(input), input);
    assert.notEqual(optionalCreationPremise(input), input);
    assert.equal(
      optionalCreationPremise({ text: " \n\t", language }),
      undefined,
    );
  }
  for (const text of ["x".repeat(20001), "hello\u0000world"]) {
    assert.throws(
      () => optionalCreationPremise({ text, language: "en" }),
      (cause) =>
        cause instanceof PremiseClientError && cause.code === "validation",
    );
  }
});

test("DTO validation preserves originals and permits absence, current and older history pages", () => {
  for (const row of [premise(0), premise(1), premise(32), premise(65)]) {
    assert.deepEqual(validateCampaignPremise(row, campaignId), row);
  }
  assert.deepEqual(
    validateCampaignPremise(premise(65, 34), campaignId, 34),
    premise(65, 34),
  );
  assert.deepEqual(premiseDraft(premise(0), "ru"), {
    text: "",
    language: "ru",
  });
  assert.deepEqual(premiseDraft(premise(), "en"), {
    text: version(1).text,
    language: "ru",
  });
  assert.equal(
    samePremiseDraft(
      { text: " A\n", language: "en" },
      { text: "A", language: "en" },
    ),
    false,
  );
  assert.equal(
    samePremiseDraft(
      { text: "A", language: "en" },
      { text: "A", language: "ru" },
    ),
    false,
  );
});

test("unexpected private/authority fields, foreign scope and malformed version metadata fail closed", () => {
  const changes = [
    (row) => {
      row.privateState = "SYNTHETIC_PRIVATE_MARKER";
    },
    (row) => {
      row.current.effectiveSettings = {};
    },
    (row) => {
      row.versions[0].secret = "SYNTHETIC_PRIVATE_MARKER";
    },
    (row) => {
      row.campaignId = id(99);
    },
    (row) => {
      row.timeline.hidden = "SYNTHETIC_PRIVATE_MARKER";
    },
    (row) => {
      row.current.reviewStatus = "canon";
    },
    (row) => {
      row.current.language = "unknown";
    },
    (row) => {
      row.current.text = "";
    },
    (row) => {
      row.current.digest = "secret";
    },
    (row) => {
      row.current.authoredBy = "owner";
    },
    (row) => {
      row.current.createdAt = "invalid";
    },
    (row) => {
      row.current.version = 0;
    },
    (row) => {
      row.current.previousVersionId = "foreign";
    },
    (row) => {
      row.versions = [row.current, row.current];
    },
    (row) => {
      row.versions[0].documentId = id(50);
    },
    (row) => {
      row.olderThan = 1;
    },
    (row) => {
      row.revision = 3;
    },
  ];
  for (const change of changes) {
    const row = premise();
    change(row);
    assert.throws(
      () => validateCampaignPremise(row, campaignId),
      (cause) =>
        cause instanceof PremiseClientError && cause.message === "unavailable",
    );
  }
});

test("save/review/restore uncertain retries retain exact identity and revision despite changed input", () => {
  const baseline = premise();
  for (const action of [
    { action: "save", text: "  Exact\nоригинал  ", language: "ru" },
    { action: "review" },
    { action: "restore", versionId: id(101) },
  ]) {
    const command = createPremiseAttempt(null, baseline, action, () => id(20));
    const retry = createPremiseAttempt(
      command,
      premise(2),
      { action: "save", text: "changed", language: "en" },
      () => assert.fail("Must not allocate a second operation"),
    );
    assert.deepEqual(retry, command);
    assert.notEqual(retry, command);
    retry.timeline.epoch = 99;
    assert.equal(command.timeline.epoch, 1);
    assert.deepEqual(
      Object.keys(command).sort(),
      [
        ...Object.keys(action),
        "operationId",
        "timeline",
        "expectedRevision",
      ].sort(),
    );
  }
});

test("pagination includes every version through the original and never mutates current data", () => {
  const first = validateCampaignPremise(premise(65), campaignId);
  const second = validateCampaignPremise(premise(65, 34), campaignId, 34);
  const last = validateCampaignPremise(premise(65, 2), campaignId, 2);
  const merged = mergePremiseHistory(mergePremiseHistory(first, second), last);
  assert.equal(first.versions.length, 32);
  assert.equal(merged.versions.length, 65);
  assert.equal(merged.versions.at(-1).version, 1);
  assert.equal(merged.olderThan, null);
  assert.deepEqual(merged.current, first.current);
});

test("pagination rejects mixed campaigns, timeline changes, newer heads, and duplicate callbacks", () => {
  const first = premise(65),
    page = premise(65, 34);
  for (const change of [
    (row) => {
      row.campaignId = id(99);
    },
    (row) => {
      row.timeline.epoch++;
    },
    (row) => {
      row.timeline.timelineId = id(99);
    },
    (row) => {
      row.revision++;
    },
    (row) => {
      row.current.id = id(99);
    },
    (row) => {
      row.versions[0] = first.versions.at(-1);
    },
  ]) {
    const changed = structuredClone(page);
    change(changed);
    assert.throws(
      () => mergePremiseHistory(first, changed),
      (cause) => cause.code === "conflict",
    );
  }
  const merged = mergePremiseHistory(first, page);
  assert.throws(
    () => mergePremiseHistory(merged, page),
    (cause) => cause.code === "conflict",
  );
  assert.throws(() => validateCampaignPremise(page, campaignId, 20));
});

test("request gate blocks concurrent callbacks and ignores late completion after a newer read", async () => {
  const gate = createPremiseRequestGate();
  let release;
  const deferred = new Promise((resolve) => {
    release = resolve;
  });
  let calls = 0,
    commits = 0;
  const save = async () => {
    const ticket = gate.begin(scope());
    if (!ticket) return;
    calls++;
    await deferred;
    if (gate.accepts(ticket, scope())) commits++;
    gate.finish(ticket);
  };
  const first = save();
  await save();
  assert.equal(calls, 1);
  const newer = gate.begin(scope(), true);
  release();
  await first;
  assert.equal(commits, 0);
  assert.equal(
    gate.accepts(newer, scope()),
    true,
    "old completion must not unlock the newer request",
  );
  assert.equal(gate.begin(scope()), null);
  gate.finish(newer);
  assert.ok(gate.begin(scope()));
});

test("request gate rejects campaign/epoch switches, missing fences, and unmounted replies", () => {
  const gate = createPremiseRequestGate();
  assert.equal(gate.begin({ campaignId, timeline: undefined }), null);
  const ticket = gate.begin(scope());
  assert.equal(gate.accepts(ticket, { ...scope(), campaignId: id(90) }), false);
  assert.equal(
    gate.accepts(ticket, { campaignId, timeline: { ...timeline, epoch: 2 } }),
    false,
  );
  assert.equal(
    gate.accepts(ticket, {
      campaignId,
      timeline: { ...timeline, timelineId: id(90) },
    }),
    false,
  );
  gate.invalidate();
  assert.equal(gate.accepts(ticket, scope()), false);
  assert.equal(premiseScopeMatches(premise(), campaignId, undefined), false);
  assert.equal(samePremiseHead(premise(), premise(2)), false);
});

test("client reads and writes use the bounded campaign endpoint and exact command body", async (t) => {
  const seen = [];
  t.mock.method(globalThis, "fetch", async (url, init) => {
    seen.push({ url, init });
    return Response.json(init.method === "POST" ? premise(2) : premise(65, 34));
  });
  await loadCampaignPremise(campaignId, 34);
  const input = createPremiseAttempt(
    null,
    premise(),
    { action: "save", text: "  Original\n", language: "en" },
    () => id(20),
  );
  await writeCampaignPremise(campaignId, input);
  assert.equal(seen[0].url, `/api/campaigns/${campaignId}/premise?before=34`);
  assert.equal(seen[1].url, `/api/campaigns/${campaignId}/premise`);
  assert.equal(seen[1].init.body, JSON.stringify(input));
  assert.equal(seen[1].init.credentials, "same-origin");
  assert.equal(seen[1].init.cache, "no-store");
  await assert.rejects(
    loadCampaignPremise(campaignId, -1),
    (cause) => cause.code === "validation",
  );
  assert.equal(seen.length, 2);
});

test("network uncertainty retries one immutable command; invalid replies never confirm a write", async (t) => {
  const requests = [];
  t.mock.method(globalThis, "fetch", async (_url, init) => {
    requests.push(init.body);
    if (requests.length === 1) throw new Error("SYNTHETIC_INTERNAL_MARKER");
    return Response.json(premise(2));
  });
  const command = createPremiseAttempt(
    null,
    premise(),
    { action: "review" },
    () => id(20),
  );
  await assert.rejects(
    writeCampaignPremise(campaignId, command),
    (cause) =>
      cause.code === "unavailable" && !cause.message.includes("MARKER"),
  );
  await writeCampaignPremise(
    campaignId,
    createPremiseAttempt(command, premise(5), {
      action: "restore",
      versionId: id(30),
    }),
  );
  assert.equal(requests[0], requests[1]);
  for (const body of [
    null,
    premise(),
    { ...premise(2), timeline: { ...timeline, epoch: 2 } },
  ]) {
    t.mock.method(globalThis, "fetch", async () => Response.json(body));
    await assert.rejects(
      writeCampaignPremise(campaignId, command),
      PremiseClientError,
    );
  }
});

test("only known safe error codes are displayed, without server diagnostics", async (t) => {
  for (const code of [
    "conflict",
    "validation",
    "unauthenticated",
    "forbidden",
    "not_configured",
    "SYNTHETIC_SECRET",
  ]) {
    t.mock.method(globalThis, "fetch", async () =>
      Response.json(
        { error: { code, details: "SYNTHETIC_SECRET" } },
        { status: 409 },
      ),
    );
    await assert.rejects(
      loadCampaignPremise(campaignId),
      (cause) =>
        cause.code === (code === "SYNTHETIC_SECRET" ? "unavailable" : code) &&
        !cause.message.includes("SECRET"),
    );
  }
});

test("English and Russian guidance cover political and exploration play and separate review from authority", () => {
  const en = campaignPremiseText("en"),
    ru = campaignPremiseText("ru");
  assert.deepEqual(Object.keys(en).sort(), Object.keys(ru).sort());
  for (const key of Object.keys(en)) {
    assert.equal(typeof en[key], "string");
    assert.ok(en[key].length);
    assert.equal(typeof ru[key], "string");
    assert.ok(ru[key].length);
    assert.notEqual(en[key], ru[key]);
  }
  assert.match(en.politicalExample, /envoy/);
  assert.match(en.explorationExample, /expedition/);
  assert.match(ru.politicalExample, /посланником/);
  assert.match(ru.explorationExample, /экспедицию/);
  assert.match(en.boundary, /does not apply/);
  assert.match(ru.boundary, /не меняют/);
  assert.match(en.reviewHelp, /does not activate/);
  assert.match(ru.reviewHelp, /не меняются/);
});
