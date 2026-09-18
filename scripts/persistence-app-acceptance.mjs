// Explicit, local-only acceptance against a running app and the two disposable fixtures.
// Does not seed, reset, import, print credentials, or call any AI provider.
import assert from "node:assert/strict";
import { createServerClient } from "@supabase/ssr";
import { testConfig, testOptIn } from "./persistence-fixtures.mjs";

assert.equal(process.env.RPG_ALLOW_DISPOSABLE_TESTS, testOptIn);
const config = testConfig();
const base = process.env.PREVIEW_URL || "http://127.0.0.1:3000";
assert.ok(["127.0.0.1", "localhost"].includes(new URL(base).hostname));
assert.equal(new URL(base).protocol, "http:");
const privateMarker = "SYNTHETIC_PRIVATE_ACCEPTANCE_CANARY";
const checks = [];
const pass = (name) => {
  checks.push(name);
  console.log(`PASS: ${name}`);
};
function httpSession() {
  const jar = new Map();
  return {
    jar,
    async request(path, payload, expected = 200, origin = base) {
      const headers = {
        cookie: [...jar].map(([name, value]) => `${name}=${value}`).join("; "),
      };
      if (payload !== undefined)
        Object.assign(headers, { "content-type": "application/json", origin });
      const response = await fetch(base + path, {
        method: payload === undefined ? "GET" : "POST",
        headers,
        body: payload === undefined ? undefined : JSON.stringify(payload),
        redirect: "manual",
      });
      for (const cookie of response.headers.getSetCookie()) {
        const pair = cookie.split(";")[0];
        const i = pair.indexOf("=");
        if (pair.slice(i + 1)) jar.set(pair.slice(0, i), pair.slice(i + 1));
        else jar.delete(pair.slice(0, i));
      }
      const text = await response.text();
      assert.ok(
        !text.includes(privateMarker),
        "Private marker leaked in application response",
      );
      assert.equal(response.status, expected, `${path} status`);
      assert.match(response.headers.get("cache-control") || "", /no-store/);
      const result = JSON.parse(text);
      if (expected >= 400) {
        assert.deepEqual(Object.keys(result), ["error"]);
        assert.deepEqual(Object.keys(result.error).sort(), ["code", "message"]);
      }
      return result;
    },
  };
}
const owner = httpSession();
const anonymous = httpSession();
const denied = httpSession();
const credentials = (role) => ({
  email: process.env[`RPG_TEST_${role}_EMAIL`],
  password: process.env[`RPG_TEST_${role}_PASSWORD`],
});
await anonymous.request("/api/workspace", undefined, 401);
await denied.request("/api/auth/sign-in", credentials("NONOWNER"), 403);
await denied.request("/api/workspace", undefined, 401);
// Also present an independently authenticated Supabase non-owner session to the app.
const nonowner = httpSession();
const otherClient = createServerClient(config.url, config.key, {
  cookies: {
    getAll: () => [...nonowner.jar].map(([name, value]) => ({ name, value })),
    setAll: (values) =>
      values.forEach(({ name, value }) => nonowner.jar.set(name, value)),
  },
});
assert.equal(
  (await otherClient.auth.signInWithPassword(credentials("NONOWNER"))).error,
  null,
);
await nonowner.request("/api/workspace", undefined, 403);
await owner.request("/api/auth/sign-in", credentials("OWNER"));
assert.ok(owner.jar.size > 0, "Sign-in must issue session cookies");
let workspace = await owner.request("/api/workspace");
assert.equal(
  workspace.campaigns.length,
  2,
  "Expected only the two disposable fixtures",
);
const a = workspace.campaigns.find(
  (c) => c.title === "Synthetic · Tidal Observatory",
);
const b = workspace.campaigns.find(
  (c) => c.title === "Synthetic · Copper Orchard",
);
assert.ok(a && b, "Only the named synthetic fixtures are allowed");
const campaignPath = (id) => `/api/campaigns/${id}`;
const historyPath = (cid, id) =>
  `${campaignPath(cid)}/documents/${id}/versions`;
const snapshot = (id) => owner.request(campaignPath(id));
const mutate = (
  operation,
  campaignId,
  payload,
  revision = 0,
  expected = 200,
  requestId = crypto.randomUUID(),
) =>
  owner.request(
    "/api/mutations",
    {
      operation,
      ...(campaignId ? { campaignId } : {}),
      expectedRevision: revision,
      requestId,
      payload,
    },
    expected,
  );
let sa = await snapshot(a.id);
const sb = await snapshot(b.id);
const document = sa.documents.find((d) => d.id !== sa.dmGuideDocumentId);
for (const session of [anonymous, nonowner]) {
  const status = session === anonymous ? 401 : 403;
  await session.request(campaignPath(a.id), undefined, status);
  await session.request(historyPath(a.id, document.id), undefined, status);
  await session.request(
    "/api/mutations",
    {
      operation: "feedback.send",
      campaignId: a.id,
      expectedRevision: 0,
      requestId: crypto.randomUUID(),
      payload: { body: "Denied synthetic input" },
    },
    status,
  );
}
pass(
  "real Auth, application cookie login, anonymous and authenticated non-owner denial",
);
for (const data of [sa, sb])
  for (const collection of [
    "documents",
    "entities",
    "items",
    "storages",
    "sessions",
    "scenes",
    "feedback",
    "quests",
    "locations",
  ]) {
    assert.ok(
      data[collection].every((row) => row.campaign_id === data.campaign.id),
    );
  }
await owner.request(historyPath(a.id, sb.documents[0].id), undefined, 404);
const item = sa.items[0];
const itemPayload = ({
  id,
  name,
  category,
  quantity,
  description,
  mechanics,
  owner_entity_id,
  storage_id,
  equipped_entity_id,
  equipped_slot,
}) => ({
  id,
  name,
  category,
  quantity,
  description,
  mechanics,
  owner_entity_id,
  storage_id,
  equipped_entity_id,
  equipped_slot,
});
await mutate(
  "item.save",
  a.id,
  { ...itemPayload(item), storage_id: sb.storages[0].id },
  item.revision,
  422,
);
await mutate(
  "item.save",
  a.id,
  { ...itemPayload(item), quantity: 7 },
  item.revision,
);
assert.equal(
  (await snapshot(a.id)).items.find((i) => i.id === item.id).quantity,
  7,
);
assert.deepEqual(await snapshot(b.id), sb);
pass(
  "two-campaign read/reference isolation and persisted manual inventory correction",
);
const oldHistory = await owner.request(historyPath(a.id, document.id));
const saved = await mutate(
  "document.save",
  a.id,
  {
    id: document.id,
    title: document.title,
    status: document.status,
    body: "Synthetic HTTP acceptance document revision.",
  },
  document.revision,
);
await mutate(
  "document.save",
  a.id,
  {
    id: document.id,
    title: document.title,
    status: document.status,
    body: "Stale synthetic revision must not overwrite.",
  },
  document.revision,
  409,
);
const restored = await mutate(
  "document.restore",
  a.id,
  { id: document.id, versionId: oldHistory.at(-1).id },
  saved.revision,
);
const history = await owner.request(historyPath(a.id, document.id));
assert.equal(history.length, oldHistory.length + 2);
assert.equal(restored.revision, document.revision + 2);
for (const version of oldHistory)
  assert.deepEqual(
    history.find((v) => v.id === version.id),
    version,
  );
assert.equal(history[0].restored_from, oldHistory.at(-1).id);
pass(
  "document persistence, stale-write conflict, immutable history and restore-as-new",
);
await mutate(
  "settings.save",
  a.id,
  { ...sa.settings.values, storyStructure: "sandbox" },
  sa.settings.revision,
);
workspace = await owner.request("/api/workspace");
await mutate(
  "preferences.save",
  null,
  { language: "en", largeText: false, suggestions: false },
  workspace.preferences.revision,
);
sa = await snapshot(a.id);
assert.equal(sa.settings.values.storyStructure, "sandbox");
assert.deepEqual((await snapshot(b.id)).settings, sb.settings);
assert.equal(
  (await owner.request("/api/workspace")).preferences.language,
  "en",
);
assert.deepEqual(
  sa.scenes.map((s) => s.settings_revision),
  [1],
);
pass(
  "independent saved global/campaign settings and prospective scene settings",
);
const entity = sa.entities.find((e) => e.kind === "player");
await mutate(
  "entity.save",
  a.id,
  {
    id: entity.id,
    kind: entity.kind,
    name: entity.name,
    details: "Synthetic owner correction verified over HTTP",
    hp: 9,
    max_hp: entity.max_hp,
    stats: entity.stats,
    resources: entity.resources,
    conditions: entity.conditions,
    equipment_slots: entity.equipment_slots,
  },
  entity.revision,
);
const sessionRecord = sa.sessions[0];
await mutate(
  "session.save",
  a.id,
  {
    id: sessionRecord.id,
    title: sessionRecord.title,
    status: sessionRecord.status,
    recap: "Synthetic saved acceptance recap",
  },
  sessionRecord.revision,
);
const scene = sa.scenes[0];
await mutate(
  "scene.save",
  a.id,
  {
    id: scene.id,
    session_id: scene.session_id,
    title: scene.title,
    body: "Synthetic manual scene correction. No gameplay executed.",
    role: scene.role,
  },
  scene.revision,
);
sa = await snapshot(a.id);
assert.equal(sa.entities.find((e) => e.id === entity.id).hp, 9);
assert.equal(sa.sessions[0].recap, "Synthetic saved acceptance recap");
assert.equal(sa.scenes[0].sequence, scene.sequence);
assert.equal(sa.scenes[0].settings_revision, scene.settings_revision);
pass(
  "character, session and scene corrections persist without reordering source history",
);
const beforeFeedback = structuredClone(sa);
const feedbackId = crypto.randomUUID();
const feedbackPayload = {
  body: "Synthetic acceptance: keep narration concise. Не менять мир.",
};
const feedback = await mutate(
  "feedback.send",
  a.id,
  feedbackPayload,
  0,
  200,
  feedbackId,
);
assert.deepEqual(
  await mutate("feedback.send", a.id, feedbackPayload, 0, 200, feedbackId),
  feedback,
);
const afterFeedback = await snapshot(a.id);
assert.equal(afterFeedback.feedback.length, sa.feedback.length + 1);
delete beforeFeedback.feedback;
const gameplayAfter = structuredClone(afterFeedback);
delete gameplayAfter.feedback;
assert.deepEqual(gameplayAfter, beforeFeedback);
assert.deepEqual(await snapshot(b.id), sb);
pass(
  "feedback retry deduplication, campaign isolation, no guide or gameplay mutations",
);
const guide = afterFeedback.documents.find(
  (d) => d.id === sa.dmGuideDocumentId,
);
const guideHistory = await owner.request(historyPath(a.id, guide.id));
const guideSaved = await mutate(
  "document.save",
  a.id,
  {
    id: guide.id,
    title: guide.title,
    status: "reference",
    body: "Synthetic guide version: concise narration.",
  },
  guide.revision,
);
await mutate(
  "document.restore",
  a.id,
  { id: guide.id, versionId: guideHistory.at(-1).id },
  guideSaved.revision,
);
const newGuideHistory = await owner.request(historyPath(a.id, guide.id));
assert.equal(newGuideHistory.length, guideHistory.length + 2);
assert.equal(newGuideHistory[0].restored_from, guideHistory.at(-1).id);
assert.deepEqual((await snapshot(a.id)).feedback, afterFeedback.feedback);
pass(
  "DM Guide explicit manual save/history/restore remains separate from feedback",
);
for (const operation of [
  "dice.roll",
  "combat.resolve",
  "rest.complete",
  "dm.reply",
  "private.read",
])
  await mutate(operation, a.id, {}, 0, 422);
await owner.request(
  "/api/mutations",
  {
    operation: "feedback.send",
    campaignId: a.id,
    expectedRevision: 0,
    requestId: crypto.randomUUID(),
    payload: { body: "Foreign origin denied" },
  },
  403,
  "https://unrelated.invalid",
);
pass("gameplay/AI/private operations and cross-origin writes rejected");
const beforeSignout = await snapshot(a.id);
await owner.request("/api/auth/sign-out", {});
await owner.request("/api/workspace", undefined, 401);
await owner.request("/api/auth/sign-in", credentials("OWNER"));
assert.deepEqual(await snapshot(a.id), beforeSignout);
assert.deepEqual(await snapshot(b.id), sb);
assert.equal(
  (await owner.request("/api/workspace")).preferences.language,
  "en",
);
await owner.request("/api/auth/sign-out", {});
await otherClient.auth.signOut({ scope: "local" });
pass(
  "logout/relogin preserves all records, feedback, guidance and interface preference",
);
console.log(
  `Completed ${checks.length} live application acceptance groups. Browser interaction checks remain separate.`,
);
