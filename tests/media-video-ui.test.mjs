import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
const lane = fileURLToPath(new URL("../", import.meta.url));
const source = resolve(process.env.MEDIA_VIDEO_UI_SOURCE_ROOT || lane);
const require = createRequire(import.meta.url);
const owned = new Set([
  "src/components/adventure-media-preview.tsx",
  "src/components/visual-frame/current-scene-video.tsx",
  "src/lib/scene-video/client.ts",
]);
const noCall = () =>
  assert.fail(
    "The synthetic video preview must not reach a provider, API or database",
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
    const localRequire = (name) => {
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
    };
    vm.runInThisContext(`(function(require,module,exports){${output}\n})`, {
      filename: file,
    })(localRequire, loaded, loaded.exports);
    cache.set(file, loaded.exports);
    return loaded.exports;
  }
  return load;
}
const load = modules();
const preview = load("src/components/adventure-media-preview.tsx");
const frameClient = load("src/lib/visual-frame/media-client.ts");
const frameModel = load("src/lib/visual-frame/real-frame.ts");
const frameVisual = load("src/lib/visual-frame/model.ts");
const client = load("src/lib/scene-video/client.ts");
const model = load("src/lib/scene-video/model.ts");
const persistence = load("src/lib/persistence/client.ts");
const id = (n) => `44444444-4444-4444-8444-${String(n).padStart(12, "0")}`;
const flush = () => new Promise((resolve) => setImmediate(resolve));
function review(language = "en") {
  let serial = 100;
  return preview.createAdventureMediaReview(language, () => id(serial++));
}
async function frame(local, accept = true) {
  const snapshot = local.snapshot();
  const proposal = await local.mediaTransport.prepare({
    campaignId: snapshot.campaign.id,
    timeline: snapshot.timeline,
    expectedPublicStateRevision: snapshot.publicState.revision,
    referenceIds: frameModel
      .eligibleRealReferences(snapshot)
      .filter((r) => !r.reference.imageAssetId)
      .map((r) => r.record.id),
    composition: "wide",
    retryOf: null,
  });
  await frameClient.finishRealFrameAttempt(
    frameClient.createRealFrameAttempt(snapshot, proposal, 400000),
    local.mediaTransport,
  );
  const draft = frameModel.realFrameDocuments(local.snapshot()).at(-1);
  if (accept)
    await local.mediaTransport.send({
      action: "media.accept",
      input: frameClient.createFrameOwnerDecision(
        local.snapshot(),
        draft.record,
        "accept",
      ),
    });
  return draft;
}
async function prepare(local, retryOf = null) {
  const snapshot = local.snapshot();
  const video = await local.videoTransport.prepare({
    campaignId: snapshot.campaign.id,
    timeline: snapshot.timeline,
    expectedPublicStateRevision: snapshot.publicState.revision,
    sourceAssetId: client.eligibleVideoSources(snapshot).at(-1).id,
    retryOf,
  });
  return client.createSceneVideoAttempt(
    snapshot,
    video,
    model.VIDEO_RESERVATION_USD_MICROS,
  );
}
const latest = (local) => model.videoDocuments(local.snapshot()).at(-1);
const game = ({ assets, documents, ...state }) => {
  void assets;
  void documents;
  return state;
};
async function harness(
  local,
  { language = "en", enabled = true, history = false, loseAction = null } = {},
) {
  const states = [],
    refs = [],
    deps = [],
    effects = [],
    sent = [],
    prepared = [];
  let cursor = 0,
    refCursor = 0,
    effectCursor = 0,
    snapshot = local.snapshot(),
    loads = 0;
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
  const transport = {
    ...local.videoTransport,
    capability: async (cid) => ({
      ...(await local.videoTransport.capability(cid)),
      enabled,
    }),
    prepare: async (intent) => {
      prepared.push(structuredClone(intent));
      return local.videoTransport.prepare(intent);
    },
    send: async (command) => {
      sent.push(structuredClone(command));
      const result = await local.videoTransport.send(command);
      if (command.action === loseAction) {
        loseAction = null;
        throw Error("lost-response");
      }
      return result;
    },
    load: async (cid) => {
      loads++;
      return local.videoTransport.load(cid);
    },
  };
  const jsx = (type, props) => ({ type, props });
  const ui = modules({
    react,
    "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
    "@/lib/persistence/client": persistence,
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
  })("src/components/visual-frame/current-scene-video.tsx");
  const component = history
    ? ui.SceneVideoHistory
    : ui.CurrentSceneVideo({ transport }).type;
  let tree;
  const h = { sent, prepared, transport, ui, loads: () => loads };
  h.render = () => {
    cursor = refCursor = effectCursor = 0;
    tree = component({ transport });
    effects.splice(0).forEach((fn) => fn());
    return tree;
  };
  function walk(node, result = []) {
    if (Array.isArray(node)) node.forEach((n) => walk(n, result));
    else if (node?.props) {
      result.push(node);
      walk(node.props.children, result);
    }
    return result;
  }
  const text = (node) =>
    typeof node === "string" || typeof node === "number"
      ? String(node)
      : Array.isArray(node)
        ? node.map(text).join("")
        : node?.props
          ? text(node.props.children)
          : "";
  h.nodes = () => walk(tree);
  h.text = () => text(tree);
  h.button = (label) =>
    h.nodes().find((n) => n.type === "button" && text(n) === label);
  h.click = async (label) => {
    const button = h.button(label);
    assert.ok(button, label);
    assert.equal(Boolean(button.props.disabled), false);
    button.props.onClick();
    await flush();
    h.render();
  };
  h.sync = () => {
    snapshot = local.snapshot();
    h.render();
  };
  h.stored = (asset, override = transport) =>
    ui.StoredSceneVideo({ asset, transport: override });
  h.render();
  await flush();
  h.render();
  return h;
}
test("VIDEO transport uses owner API capability/prepare/poll/asset routes and never a provider URL", async () => {
  const calls = [];
  const lib = modules({
    "../persistence/client.ts": {
      ...persistence,
      readJson: async (...args) => {
        calls.push(args);
        return {};
      },
      loadCampaign: noCall,
    },
  })("src/lib/scene-video/client.ts");
  await lib.defaultVideoTransport.capability("campaign &");
  await lib.defaultVideoTransport.prepare({ campaignId: "public" });
  await lib.defaultVideoTransport.send({
    action: "video.poll",
    campaignId: "public",
    jobId: "job",
  });
  assert.equal(
    calls[0][0],
    "/api/scene-video?action=capability&campaignId=campaign%20%26",
  );
  assert.equal(JSON.parse(calls[1][1].body).action, "video.prepare");
  assert.equal(JSON.parse(calls[2][1].body).action, "video.poll");
  assert.equal(
    lib.defaultVideoTransport.videoUrl("campaign &", "asset /"),
    "/api/scene-video?campaignId=campaign%20%26&assetId=asset%20%2F",
  );
});
test("only the current scene's owner-accepted schema4 FRAME is eligible; drafts, discarded, legacy, foreign, stale and non-narration sources are excluded", async () => {
  const local = review(),
    draft = await frame(local, false);
  assert.deepEqual(client.eligibleVideoSources(local.snapshot()), []);
  await local.mediaTransport.send({
    action: "media.discard",
    input: frameClient.createFrameOwnerDecision(
      local.snapshot(),
      draft.record,
      "discard",
    ),
  });
  assert.deepEqual(client.eligibleVideoSources(local.snapshot()), []);
  await frame(local);
  const original = local.snapshot();
  assert.equal(client.eligibleVideoSources(original).length, 1);
  const mutations = [
    (s) => {
      s.assets[0].campaign_id = id(999);
    },
    (s) => {
      s.publicState.revision++;
    },
    (s) => {
      s.scenes.find((r) => r.id === s.publicState.current_scene_id).role =
        "action";
    },
    (s) => {
      s.scenes.find((r) => r.id === s.publicState.current_scene_id).body +=
        "Changed";
    },
    (s) => {
      s.timeline.timelineId = id(999);
    },
    (s) => {
      const row = s.documents.find((d) => d.id === s.assets[0].id),
        value = frameModel.parseRealFrame(row);
      delete value.review;
      value.schema = 3;
      row.body = frameVisual.VISUAL_FRAME_PREFIX + JSON.stringify(value);
      assert.equal(
        frameModel.parseRealFrame(row)?.schema,
        3,
        "legacy FRAME remains readable but cannot source VIDEO",
      );
    },
  ];
  for (const mutate of mutations) {
    const snapshot = structuredClone(original);
    mutate(snapshot);
    assert.equal(client.eligibleVideoSources(snapshot).length, 0);
  }
});
for (const language of ["en", "ru"])
  test(`${language}: preparation shows accepted source, cost and settings; only explicit priced Generate submits a job`, async () => {
    const local = review(language);
    await frame(local);
    const before = game(local.snapshot()),
      h = await harness(local, { language });
    assert.equal(h.sent.length, 0);
    assert.equal(h.prepared.length, 0);
    await h.click(language === "en" ? "Generate video" : "Создать видео");
    assert.equal(h.prepared.length, 1);
    assert.equal(h.sent.length, 0);
    assert.match(h.text(), /10.*720p/);
    assert.match(h.text(), /\$7\.00/);
    assert.match(
      h.text(),
      language === "en" ? /accepted FRAME/ : /принятый вами FRAME/,
    );
    assert.match(
      h.text(),
      language === "en"
        ? /gameplay state remains authoritative/
        : /состояние игры остаётся главным/,
    );
    await h.click(
      language === "en"
        ? "Generate video · reserve $7.00"
        : "Создать видео · резерв $7.00",
    );
    assert.deepEqual(
      h.sent.map((c) => c.action),
      ["video.save", "video.dispatch"],
    );
    assert.equal(latest(local).value.status, "generating");
    assert.deepEqual(game(local.snapshot()), before);
  });
test("missing accepted source or disabled server capability causes no prepare, submit, fallback or hidden keyframe", async () => {
  const local = review(),
    empty = await harness(local);
  assert.equal(empty.button("Generate video").props.disabled, true);
  assert.match(empty.text(), /Accept a FRAME/);
  assert.equal(empty.sent.length, 0);
  await frame(local);
  const disabled = await harness(local, { enabled: false });
  assert.equal(disabled.button("Generate video").props.disabled, true);
  assert.match(disabled.text(), /unavailable/);
  assert.equal(disabled.sent.length, 0);
  assert.equal(disabled.prepared.length, 0);
});
test("lost dispatch response retains exact queue/dispatch; retry replays before mutable source load and never creates a second job", async () => {
  const local = review();
  await frame(local);
  const h = await harness(local, { loseAction: "video.dispatch" });
  await h.click("Generate video");
  await h.click("Generate video · reserve $7.00");
  const original = structuredClone(h.sent.at(-1)),
    loads = h.loads();
  assert.ok(h.button("Retry exact video request"));
  local.advanceScene();
  await h.click("Retry exact video request");
  assert.deepEqual(h.sent.at(-1), original);
  assert.equal(h.loads(), loads);
  assert.equal(model.videoDocuments(local.snapshot()).length, 1);
});
test("double activation of paid generation submits one queue and one dispatch", async () => {
  const local = review();
  await frame(local);
  const h = await harness(local);
  await h.click("Generate video");
  const paid = h.button("Generate video · reserve $7.00");
  paid.props.onClick();
  paid.props.onClick();
  await flush();
  h.render();
  assert.deepEqual(
    h.sent.map((c) => c.action),
    ["video.save", "video.dispatch"],
  );
  assert.equal(model.videoDocuments(local.snapshot()).length, 1);
});
test("a scripted late result cannot attach video to a changed scene", async () => {
  const local = review();
  await frame(local);
  await client.finishSceneVideoAttempt(
    await prepare(local),
    local.videoTransport,
  );
  const job = latest(local);
  local.advanceScene();
  local.setVideoOutcome("ready");
  const result = await local.videoTransport.send({
    action: "video.poll",
    campaignId: local.snapshot().campaign.id,
    jobId: job.record.id,
  });
  assert.equal(result.status, "failed");
  assert.equal(latest(local).value.failure, "stale");
  assert.equal(
    local.snapshot().assets.filter((a) => a.kind === "video").length,
    0,
  );
});
test("lost queue response replays the saved queue receipt rather than allocating another queued job", async () => {
  const local = review();
  await frame(local);
  const h = await harness(local, { loseAction: "video.save" });
  await h.click("Generate video");
  await h.click("Generate video · reserve $7.00");
  assert.equal(latest(local).value.status, "queued");
  const queue = structuredClone(h.sent[0]);
  await h.click("Retry exact video request");
  assert.deepEqual(h.sent[1], queue);
  assert.deepEqual(
    h.sent.map((c) => c.action),
    ["video.save", "video.save", "video.dispatch"],
  );
  assert.equal(model.videoDocuments(local.snapshot()).length, 1);
});
for (const language of ["en", "ru"])
  test(`${language}: reloaded generating job offers status checks only; repeated polls never dispatch or generate`, async () => {
    const local = review(language);
    await frame(local);
    const attempt = await prepare(local);
    await client.finishSceneVideoAttempt(attempt, local.videoTransport);
    const h = await harness(local, { language, history: true });
    assert.equal(h.sent.length, 0);
    assert.equal(h.nodes().filter((n) => n.type === "button").length, 1);
    await h.click(language === "en" ? "Check status" : "Проверить статус");
    await h.click(language === "en" ? "Check status" : "Проверить статус");
    assert.deepEqual(
      h.sent.map((c) => c.action),
      ["video.poll", "video.poll"],
    );
    local.setVideoOutcome("ready");
    await h.click(language === "en" ? "Check status" : "Проверить статус");
    assert.equal(latest(local).value.status, "ready");
    assert.equal(h.sent.filter((c) => c.action === "video.dispatch").length, 0);
    const asset = local.snapshot().assets.find((a) => a.kind === "video");
    const stored = h.stored(asset);
    assert.equal(
      stored.props.children[0].type,
      "p",
      "synthetic result is an explicit placeholder, never a fake MP4",
    );
  });
test("ready video retains exact source and prior usable result through explicit failed/uncertain regeneration", async () => {
  const local = review();
  await frame(local);
  const before = game(local.snapshot());
  local.setVideoOutcome("ready");
  await client.finishSceneVideoAttempt(
    await prepare(local),
    local.videoTransport,
  );
  const first = latest(local),
    previous = structuredClone(
      local.snapshot().assets.filter((a) => a.kind === "video"),
    );
  const info = model.safeVideoAsset(local.snapshot(), previous[0]);
  assert.equal(
    info.source.ownerApprovalRequestId,
    first.value.source.ownerApprovalRequestId,
  );
  assert.equal(info.source.imageSha256, first.value.source.imageSha256);
  for (const outcome of ["failed", "uncertain"]) {
    local.setVideoOutcome(outcome);
    const h = await harness(local);
    await h.click("Regenerate video");
    assert.equal(h.sent.length, 0);
    assert.equal(h.prepared[0].retryOf, latest(local).record.id);
    await h.click("Generate video · reserve $7.00");
    assert.equal(latest(local).value.status, outcome);
    assert.deepEqual(
      local.snapshot().assets.filter((a) => a.kind === "video"),
      previous,
    );
    assert.ok(h.nodes().find((n) => n.type === h.ui.StoredSceneVideo));
  }
  assert.deepEqual(game(local.snapshot()), before);
});
test("native playback uses authenticated URL and controls without autoplay; arbitrary video metadata is not served", async () => {
  const local = review();
  await frame(local);
  local.setVideoOutcome("ready");
  await client.finishSceneVideoAttempt(
    await prepare(local),
    local.videoTransport,
  );
  const h = await harness(local),
    asset = local.snapshot().assets.find((a) => a.kind === "video");
  const tree = h.stored(asset, {
    ...h.transport,
    videoUrl: client.defaultVideoTransport.videoUrl,
  });
  const video = tree.props.children[0];
  assert.equal(video.type, "video");
  assert.equal(video.props.controls, true);
  assert.equal(video.props.preload, "none");
  assert.equal(video.props.autoPlay, undefined);
  assert.match(video.props.src, /^\/api\/scene-video\?/);
  assert.equal(
    h.stored(
      { ...asset, description: "https://untrusted.example/clip.mp4" },
      { ...h.transport, videoUrl: noCall },
    ),
    null,
  );
});
test("reloaded queued generation remains priced and explicit; lost-response replay keeps its request ID", async () => {
  const local = review();
  await frame(local);
  const attempt = await prepare(local);
  await local.videoTransport.send({
    action: "video.save",
    input: attempt.queue,
  });
  const h = await harness(local, {
    history: true,
    loseAction: "video.dispatch",
  });
  assert.equal(h.sent.length, 0);
  await h.click("Generate queued video · reserve $7.00");
  const original = structuredClone(h.sent[0]);
  await h.click("Retry exact saved video request");
  assert.deepEqual(h.sent[1], original);
  assert.equal(model.videoDocuments(local.snapshot()).length, 1);
});
