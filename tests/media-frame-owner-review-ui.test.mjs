import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
const lane = fileURLToPath(new URL("../", import.meta.url));
const source = resolve(process.env.MEDIA_FRAME_OWNER_UI_SOURCE_ROOT || lane);
const require = createRequire(import.meta.url);
const owned = new Set([
  "src/components/adventure-media-preview.tsx",
  "src/components/visual-frame/current-scene-media-frame.tsx",
  "src/lib/visual-frame/media-client.ts",
]);
const noCall = () =>
  assert.fail(
    "Synthetic owner review must not reach a provider, API or database",
  );
function modules(extra = {}) {
  const cache = new Map();
  function load(relative) {
    let file = resolve(owned.has(relative) ? lane : source, relative);
    if (!existsSync(file)) {
      relative += existsSync(file + ".tsx") ? ".tsx" : ".ts";
      file = resolve(owned.has(relative) ? lane : source, relative);
    }
    if (cache.has(file)) return cache.get(file);
    if (file.endsWith(".json")) return JSON.parse(readFileSync(file, "utf8"));
    const loaded = { exports: {} };
    cache.set(file, loaded.exports);
    const output = ts.transpileModule(readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;
    function localRequire(name) {
      if (Object.hasOwn(extra, name)) return extra[name];
      if (name.endsWith("persistence-context"))
        return { useCampaignData: noCall };
      if (name.endsWith("language-context")) return { useLanguage: noCall };
      if (name === "next/navigation") return {};
      if (name === "next/image") return { default: "img" };
      if (name === "next/link") return { default: "a" };
      if (name.endsWith(".css")) return {};
      if (name === "server-only") return noCall();
      if (name.startsWith(".") || name.startsWith("@/")) {
        const path = name.startsWith("@/")
          ? resolve(source, "src", name.slice(2))
          : resolve(dirname(resolve(source, relative)), name);
        return load(path.slice(source.length + 1).replaceAll("\\", "/"));
      }
      return require(name);
    }
    vm.runInThisContext(`(function(require,module,exports){${output}\n})`, {
      filename: file,
    })(localRequire, loaded, loaded.exports);
    cache.set(file, loaded.exports);
    return loaded.exports;
  }
  return load;
}
const load = modules();
const { createAdventureMediaReview } = load(
  "src/components/adventure-media-preview.tsx",
);
const media = load("src/lib/visual-frame/media-client.ts");
const persistence = load("src/lib/persistence/client.ts");
const real = load("src/lib/visual-frame/real-frame.ts");
const id = (n) => `33333333-3333-4333-8333-${String(n).padStart(12, "0")}`;
function review(language = "en") {
  let serial = 100;
  return createAdventureMediaReview(language, () => id(serial++));
}
async function prepare(local, retryOf = null) {
  const snapshot = local.snapshot();
  const frame = await local.mediaTransport.prepare({
    campaignId: snapshot.campaign.id,
    timeline: snapshot.timeline,
    expectedPublicStateRevision: snapshot.publicState.revision,
    referenceIds: real
      .eligibleRealReferences(snapshot)
      .filter((r) => !r.reference.imageAssetId)
      .map((r) => r.record.id),
    composition: "wide",
    retryOf,
  });
  return media.createRealFrameAttempt(snapshot, frame, 400000);
}
const latest = (local) => real.realFrameDocuments(local.snapshot()).at(-1);
async function generate(local, retryOf = null) {
  const attempt = await prepare(local, retryOf);
  await media.finishRealFrameAttempt(attempt, local.mediaTransport);
  return latest(local);
}
async function decide(local, record, decision) {
  const input = media.createFrameOwnerDecision(
    local.snapshot(),
    record,
    decision,
  );
  const command = {
    action: decision === "accept" ? "media.accept" : "media.discard",
    input,
  };
  return { command, result: await local.mediaTransport.send(command) };
}
function gameplay(snapshot) {
  const { assets, documents, ...state } = snapshot;
  void assets;
  void documents;
  return state;
}
async function harness(
  local,
  language = "en",
  { scene = false, lose = false } = {},
) {
  const states = [],
    refs = [],
    deps = [],
    effects = [],
    sent = [];
  let cursor = 0,
    refCursor = 0,
    effectCursor = 0,
    snapshot = local.snapshot(),
    prepares = 0;
  const react = {
    useState(initial) {
      const i = cursor++;
      if (!(i in states))
        states[i] = typeof initial === "function" ? initial() : initial;
      return [
        states[i],
        (v) => {
          states[i] = typeof v === "function" ? v(states[i]) : v;
        },
      ];
    },
    useRef(initial) {
      const i = refCursor++;
      return refs[i] ?? (refs[i] = { current: initial });
    },
    useEffect(fn, next) {
      const i = effectCursor++;
      if (!deps[i] || next.some((v, n) => v !== deps[i][n])) {
        deps[i] = next;
        effects.push(fn);
      }
    },
  };
  const jsx = (type, props) => ({ type, props });
  const transport = {
    ...local.mediaTransport,
    prepare: async (input) => {
      prepares++;
      return local.mediaTransport.prepare(input);
    },
    send: async (command) => {
      sent.push(structuredClone(command));
      if (lose === "conflict") {
        lose = false;
        throw new persistence.ClientPersistenceError("conflict");
      }
      const result = await local.mediaTransport.send(command);
      if (lose) {
        lose = false;
        throw Error("lost-response");
      }
      return result;
    },
  };
  const ui = modules({
    "@/lib/persistence/client": persistence,
    react,
    "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
    "../persistence-context": {
      useCampaignData: () => ({
        data: snapshot,
        refresh: async () => {
          snapshot = local.snapshot();
        },
      }),
    },
    "../language-context": { useLanguage: () => ({ language }) },
    "../ui": { Button: "button", Badge: "badge" },
  })("src/components/visual-frame/current-scene-media-frame.tsx");
  const component = scene
    ? ui.CurrentSceneMediaFrame({ transport }).type
    : ui.FrameOwnerReview;
  const recordId = latest(local)?.record.id;
  let tree;
  const h = { sent, ui, transport, prepares: () => prepares, regenerate: 0 };
  h.render = () => {
    cursor = refCursor = effectCursor = 0;
    tree = component(
      scene
        ? { transport }
        : {
            record: snapshot.documents.find((d) => d.id === recordId),
            transport,
            onRegenerate: () => h.regenerate++,
          },
    );
    effects.splice(0).forEach((fn) => fn());
    return tree;
  };
  function nodes(n, result = []) {
    if (Array.isArray(n)) n.forEach((v) => nodes(v, result));
    else if (n?.props) {
      result.push(n);
      nodes(n.props.children, result);
    }
    return result;
  }
  const text = (n) =>
    typeof n === "string"
      ? n
      : Array.isArray(n)
        ? n.map(text).join("")
        : n?.props
          ? text(n.props.children)
          : "";
  h.text = () => text(tree);
  h.nodes = () => nodes(tree);
  h.button = (label) =>
    nodes(tree).find((n) => n.type === "button" && text(n) === label);
  h.click = async (label) => {
    const b = h.button(label);
    assert.ok(b, label);
    assert.equal(Boolean(b.props.disabled), false);
    b.props.onClick();
    await new Promise((resolve) => setImmediate(resolve));
    h.render();
  };
  h.render();
  await new Promise((resolve) => setImmediate(resolve));
  h.render();
  return h;
}
test("draft transport uses its authenticated job endpoint and preserves accepted Asset endpoint", () => {
  assert.equal(
    media.defaultMediaFrameTransport.draftImageUrl("campaign &", "job /"),
    "/api/visual-frame?action=draft&campaignId=campaign%20%26&jobId=job%20%2F",
  );
  assert.equal(
    media.defaultMediaFrameTransport.imageUrl("cid", "aid"),
    "/api/visual-frame?campaignId=cid&assetId=aid",
  );
});
for (const language of ["en", "ru"]) {
  test(`${language}: safe and warning drafts require explicit owner acceptance and do not mutate gameplay`, async () => {
    const local = review(language),
      original = gameplay(local.snapshot());
    for (const outcome of ["schematic", "review_warning"]) {
      local.setOutcome(outcome);
      const { record, value } = await generate(local);
      assert.equal(value.schema, 4);
      assert.equal(value.status, "draft");
      assert.equal(value.resultAssetId, null);
      assert.equal(
        value.review.status,
        outcome === "schematic" ? "safe_to_review" : "review_warning",
      );
      assert.equal(local.snapshot().assets.length, 0);
      const h = await harness(local, language);
      assert.ok(h.button(language === "en" ? "Accept" : "Принять"));
      assert.ok(h.button(language === "en" ? "Regenerate" : "Создать заново"));
      assert.ok(h.button(language === "en" ? "Discard" : "Отклонить"));
      assert.match(
        h.text(),
        language === "en"
          ? /gameplay state remains authoritative/
          : /состояние игры остаётся главным/,
      );
      if (outcome === "review_warning")
        assert.match(
          h.text(),
          language === "en" ? /possible issue/ : /возможную проблему/,
        );
      assert.doesNotMatch(
        h.text(),
        /imageSha256|chain.of.thought|hard_reject|unsupported_salient/,
      );
      await h.click(language === "en" ? "Discard" : "Отклонить");
      assert.equal(h.sent[0].action, "media.discard");
      assert.equal(latest(local).value.status, "discarded");
      assert.equal(local.snapshot().assets.length, 0);
      assert.throws(() =>
        local.mediaTransport.draftImageUrl(
          local.snapshot().campaign.id,
          record.id,
        ),
      );
    }
    local.setOutcome("review_warning");
    const final = await generate(local);
    const accept = await harness(local, language);
    await accept.click(language === "en" ? "Accept" : "Принять");
    assert.equal(accept.sent[0].action, "media.accept");
    assert.equal(local.snapshot().assets.length, 1);
    const provenance = real.ownerAcceptedFrameAsset(
      local.snapshot(),
      local.snapshot().assets[0],
    );
    assert.equal(provenance.output.sha256, final.value.review.imageSha256);
    assert.equal(
      provenance.ownerApproval.requestId,
      accept.sent[0].input.requestId,
    );
    assert.equal(
      provenance.ownerApproval.draftVersionId,
      final.record.current_version_id,
    );
    assert.deepEqual(gameplay(local.snapshot()), original);
  });
}
test("Accept alone attaches exact reviewed pixels; lost decision replay survives later source change", async () => {
  const local = review(),
    draft = await generate(local),
    original = gameplay(local.snapshot());
  const h = await harness(local, "en", { lose: true });
  const button = h.button("Accept");
  button.props.onClick();
  button.props.onClick();
  await new Promise((resolve) => setImmediate(resolve));
  h.render();
  assert.equal(h.sent.length, 1, "double activation sends one decision");
  assert.equal(local.snapshot().assets.length, 1);
  assert.equal(latest(local).value.status, "completed");
  assert.deepEqual(latest(local).value.review, draft.value.review);
  assert.equal(latest(local).value.resultAssetId, draft.record.id);
  assert.equal(h.sent[0].input.expectedRevision, draft.record.revision);
  assert.deepEqual(gameplay(local.snapshot()), original);
  local.advanceScene();
  await h.click("Retry same decision");
  assert.deepEqual(h.sent[1], h.sent[0]);
  assert.equal(local.snapshot().assets.length, 1);
  assert.equal(h.render(), null);
});
test("a confirmed stale-draft refusal releases the decision without losing prior art or creating another image", async () => {
  const local = review(),
    first = await generate(local);
  await decide(local, first.record, "accept");
  const accepted = structuredClone(local.snapshot().assets);
  await generate(local, first.record.id);
  const h = await harness(local, "en", { lose: "conflict" });
  await h.click("Accept");
  assert.equal(h.button("Retry same decision"), undefined);
  assert.ok(h.button("Regenerate"));
  assert.match(h.text(), /current scene/);
  assert.equal(h.sent.length, 1);
  assert.equal(latest(local).value.status, "draft");
  assert.deepEqual(local.snapshot().assets, accepted);
});
test("Regenerate prepares a separate explicit request while preserving accepted art through warning/discard/rejection/failure", async () => {
  const local = review(),
    first = await generate(local);
  await decide(local, first.record, "accept");
  const accepted = structuredClone(local.snapshot().assets);
  local.setOutcome("review_warning");
  const warning = await generate(local, first.record.id);
  const h = await harness(local, "en", { scene: true });
  assert.ok(
    h.nodes().find((n) => n.type === h.ui.StoredFrameImage),
    "previous accepted art is visible beside draft",
  );
  const card = h
    .nodes()
    .find(
      (n) =>
        n.type === h.ui.FrameOwnerReview &&
        n.props.record.id === warning.record.id,
    );
  card.props.onPendingChange(warning.record.id, true);
  h.render();
  assert.equal(
    h.button("FRAME · review this scene").props.disabled,
    true,
    "unconfirmed owner decision prevents a new paid request",
  );
  card.props.onPendingChange(warning.record.id, false);
  h.render();
  const count = local.snapshot().documents.length;
  card.props.onRegenerate(warning.record.id);
  await new Promise((resolve) => setImmediate(resolve));
  h.render();
  assert.equal(h.prepares(), 1);
  assert.equal(h.sent.length, 0);
  assert.equal(
    local.snapshot().documents.length,
    count,
    "preparation creates no job or paid dispatch",
  );
  assert.ok(h.button("Generate FRAME"));
  await decide(local, warning.record, "discard");
  assert.deepEqual(local.snapshot().assets, accepted);
  local.setOutcome("hard_reject");
  await h.click("Generate FRAME");
  assert.equal(h.sent.length, 2);
  assert.deepEqual(
    h.sent.map((c) => c.action),
    ["media.save", "media.dispatch"],
  );
  assert.equal(latest(local).value.retryOf, warning.record.id);
  assert.equal(latest(local).value.status, "failed");
  assert.deepEqual(local.snapshot().assets, accepted);
  for (const outcome of ["hard_reject", "failure"]) {
    local.setOutcome(outcome);
    const result = await generate(local, latest(local).record.id);
    assert.equal(result.value.status, "failed");
    assert.equal(result.value.review, null);
    assert.equal(result.value.resultAssetId, null);
    assert.deepEqual(local.snapshot().assets, accepted);
  }
});
test("decision builders reject stale, foreign, accepted and discarded documents; schema4 recovery retains generating request", async () => {
  const local = review(),
    draft = await generate(local);
  const stale = { ...draft.record, revision: draft.record.revision - 1 };
  assert.throws(() =>
    media.createFrameOwnerDecision(
      local.snapshot(),
      draft.record,
      "auto_accept",
    ),
  );
  assert.throws(() =>
    media.createFrameOwnerDecision(local.snapshot(), stale, "accept"),
  );
  assert.throws(() =>
    media.createFrameOwnerDecision(
      local.snapshot(),
      { ...draft.record, campaign_id: id(99) },
      "accept",
    ),
  );
  await decide(local, draft.record, "discard");
  assert.throws(() =>
    media.createFrameOwnerDecision(
      local.snapshot(),
      latest(local).record,
      "accept",
    ),
  );
  local.setOutcome("in_flight");
  const inflight = await generate(local, draft.record.id);
  const recovery = media.storedFrameRecovery(local.snapshot(), inflight.record);
  assert.equal(recovery.requestId, inflight.record.id);
  assert.equal(recovery.expectedRevision, inflight.record.revision);
  assert.deepEqual(real.parseRealFrame(recovery.payload), inflight.value);
});
