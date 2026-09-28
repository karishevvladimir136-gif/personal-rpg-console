import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
const lane = fileURLToPath(new URL("../", import.meta.url));
const source = resolve(
  process.env.ADVENTURE_MEDIA_PREVIEW_SOURCE_ROOT || lane,
  "src",
);
const require = createRequire(import.meta.url);
let language = "en",
  publicSnapshot;
const noCall = () =>
  assert.fail("Synthetic review cannot reach a provider, API or database");
const lang = {
  useLanguage: () => ({ language, setLanguage: noCall, t: (value) => value }),
};
const campaign = {
  useCampaignData: () => ({
    data: publicSnapshot,
    campaignId: publicSnapshot?.campaign.id,
    refresh: async () => {},
    loading: false,
    error: "",
    mutate: noCall,
  }),
  useOptionalCampaignData: () => ({ data: publicSnapshot }),
  useWorkspaceData: () => ({ data: null }),
  useUnsavedChanges: () => {},
  useCampaignDraftScope: () => ({
    timeline: publicSnapshot?.timeline,
    changed: false,
  }),
  TimelineDraftNotice: () => null,
  CampaignDataPreview: ({ snapshot, children }) => {
    publicSnapshot = snapshot;
    return children;
  },
};
function modules(extra = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    if (file.endsWith(".json")) return JSON.parse(readFileSync(file, "utf8"));
    const loaded = { exports: {} };
    cache.set(file, loaded.exports);
    const output = ts.transpileModule(readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    function localRequire(name) {
      if (Object.hasOwn(extra, name)) return extra[name];
      if (name.endsWith("language-context")) return lang;
      if (name.endsWith("persistence-context")) return campaign;
      if (name === "next/navigation")
        return {
          usePathname: () => "/preview/adventure-media",
          useRouter: () => ({ push: noCall }),
        };
      if (name === "next/link")
        return function ReviewLink({ href, children, ...props }) {
          return createElement("a", { href, ...props }, children);
        };
      if (name === "next/image")
        return function ReviewImage(props) {
          const { unoptimized, ...rest } = props;
          void unoptimized;
          return createElement("img", rest);
        };
      if (name.endsWith(".css")) return {};
      if (name === "server-only")
        assert.fail("A server-only module reached the preview client");
      if (name.startsWith(".") || name.startsWith("@/")) {
        let target = name.startsWith("@/")
          ? resolve(source, name.slice(2))
          : resolve(dirname(file), name);
        if (
          !existsSync(target) &&
          !existsSync(target + ".tsx") &&
          !existsSync(target + ".ts") &&
          target.startsWith(resolve(lane, "src"))
        )
          target = resolve(
            source,
            target.slice(resolve(lane, "src").length + 1),
          );
        if (!existsSync(target))
          target = existsSync(target + ".tsx")
            ? target + ".tsx"
            : target + ".ts";
        // The preview and its default-preserving pending isolation are the only lane overrides.
        if (/components[\\/]adventures[\\/]/.test(target))
          target = resolve(
            lane,
            "src/components/adventures",
            target.split(/[/\\]/).at(-1),
          );
        return load(target);
      }
      return require(name);
    }
    vm.runInThisContext(`(function(require,module,exports){${output}\n})`, {
      filename: file,
    })(localRequire, loaded, loaded.exports);
    cache.set(file, loaded.exports);
    return loaded.exports;
  }
  return (relative) =>
    load(
      relative.startsWith("lane:")
        ? resolve(lane, relative.slice(5))
        : resolve(source, relative),
    );
}
const ui = modules();
const { createAdventureMediaReview, AdventureMediaPreview } = ui(
  "lane:src/components/adventure-media-preview.tsx",
);
const client = ui("lib/adventures/client.ts"),
  real = ui("lib/visual-frame/real-frame.ts"),
  media = ui("lib/visual-frame/media-client.ts"),
  visual = ui("lib/visual-frame/model.ts");
const id = (n) => `33333333-3333-4333-8333-${String(n).padStart(12, "0")}`;
function review(lang = "en") {
  let n = 100;
  return createAdventureMediaReview(lang, () => id(n++));
}
async function frameAttempt(local, retryOf = null) {
  const snapshot = local.snapshot();
  const proposal = await local.mediaTransport.prepare({
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
  return media.createRealFrameAttempt(snapshot, proposal, 400000);
}
function setData(local) {
  publicSnapshot = local.snapshot();
}
const html = (component, props) =>
  renderToStaticMarkup(createElement(component, props));

test("actual Adventure prepare/start/end/review preserves immutable versions and normal Hero/inventory", async () => {
  for (const lang of ["en", "ru"]) {
    const local = review(lang),
      original = local.snapshot();
    const prepare = client.prepareAdventureAttempt(
      local.catalog(),
      {
        title: "Return to the lantern",
        premise: "An owner-authored search of the visible harbor.",
        pacing: { kind: "evening", custom: null },
      },
      () => id(1),
    );
    await local.adventureTransport.send(prepare);
    const prepared = local.catalog().adventures[0];
    const start = client.versionAdventureAttempt(
      local.catalog(),
      prepared.id,
      "start",
      undefined,
      () => id(2),
    );
    const started = await local.adventureTransport.send(start);
    local.advanceScene();
    const end = client.versionAdventureAttempt(
      local.catalog(),
      prepared.id,
      "end",
      { summary: "We returned to the harbor.", review: null },
      () => id(3),
    );
    await local.adventureTransport.send(end);
    const feedback = {
      pacing: "Comfortable",
      agency: "My choice",
      rewards: "Meaningful",
      payoff: "Clear",
      notes: null,
    };
    await local.adventureTransport.send(
      client.versionAdventureAttempt(
        local.catalog(),
        prepared.id,
        "review",
        { review: feedback },
        () => id(4),
      ),
    );
    const catalog = local.catalog();
    assert.deepEqual(
      catalog.history.map((a) => a.status),
      ["prepared", "active", "completed", "completed"],
    );
    assert.equal(catalog.history[0].start, null);
    assert.equal(catalog.adventures[0].start.worldMinutes, 360);
    assert.equal(catalog.adventures[0].completion.worldMinutes, 370);
    assert.equal(catalog.activeAdventureId, null);
    assert.deepEqual(catalog.adventures[0].review, feedback);
    assert.deepEqual(local.snapshot().entities, original.entities);
    assert.deepEqual(local.snapshot().items, original.items);
    assert.deepEqual(
      await local.adventureTransport.send(start),
      started,
      "original successful receipt survives later head changes",
    );
    assert.equal(local.catalog().history.length, 4);
    assert.equal(local.catalog().detachedPlayable, false);
    for (let n = 1; n < catalog.history.length; n++)
      assert.equal(
        catalog.history[n].previousVersionId,
        catalog.history[n - 1].versionId,
      );
  }
});

test("synthetic Adventure adapter rejects stale heads, wrong timeline/campaign, forged private fields and changed replay", async () => {
  const local = review();
  const request = client.prepareAdventureAttempt(
    local.catalog(),
    {
      title: "Public sample",
      premise: "Review this visible sample.",
      pacing: { kind: "quick", custom: null },
    },
    () => id(1),
  );
  await local.adventureTransport.send(request);
  for (const alter of [
    (i) => ({ ...i, timeline: { ...i.timeline, epoch: i.timeline.epoch + 1 } }),
    (i) => ({ ...i, campaignId: id(999) }),
    (i) => ({ ...i, premise: "Changed replay" }),
    (i) => ({ ...i, privateState: {} }),
  ])
    await assert.rejects(
      local.adventureTransport.send({
        ...request,
        input: alter(request.input),
      }),
    );
  await assert.rejects(
    local.adventureTransport.send({
      ...request,
      input: { ...request.input, requestId: id(2) },
    }),
  );
  assert.equal(local.catalog().history.length, 1);
  const clone = local.catalog();
  clone.history[0].premise = "External mutation";
  assert.notEqual(local.catalog().history[0].premise, clone.history[0].premise);
});

test("New Hero and World review uses exact approved public World versions and script-only receipts", async () => {
  const local = review(),
    before = local.snapshot();
  const command = client.newHeroAttempt(
    local.worlds(),
    local.worlds().worlds[0].id,
    "A new chapter",
    "Rin",
    "en",
    () => id(1),
  );
  const result = await local.adventureTransport.newHero(command);
  assert.deepEqual(await local.adventureTransport.newHero(command), result);
  assert.deepEqual(
    local.snapshot(),
    before,
    "synthetic New Hero does not create a playable projection",
  );
  await assert.rejects(
    local.adventureTransport.newHero({
      ...command,
      input: { ...command.input, requestId: id(2), worldVersion: 2 },
    }),
  );
  await assert.rejects(
    local.adventureTransport.newHero({
      ...command,
      input: { ...command.input, stats: { hp: 999 } },
    }),
  );
  const create = client.createWorldAttempt(
    local.worlds(),
    {
      title: "Owner World",
      premise: "Owner-authored premise only.",
      packVersionIds: [],
    },
    () => id(3),
  );
  const world = await local.adventureTransport.createWorld(create);
  assert.deepEqual(await local.adventureTransport.createWorld(create), world);
  assert.equal(local.worlds().worlds.length, 2);
  assert.deepEqual(world.world.packVersionIds, []);
  await assert.rejects(
    local.adventureTransport.createWorld({
      ...create,
      input: { ...create.input, requestId: id(4), packVersionIds: [id(1000)] },
    }),
  );
});

test("normal FRAME attempt client reviews exact public basis and scripts completion/history/previous art/failure/cancellation without network", async () => {
  const savedFetch = globalThis.fetch;
  globalThis.fetch = noCall;
  try {
    const local = review(),
      attempt = await frameAttempt(local);
    const result = await media.finishRealFrameAttempt(
      attempt,
      local.mediaTransport,
    );
    assert.equal(result.status, "draft");
    assert.equal(local.snapshot().assets.length, 0);
    const draft = real.realFrameDocuments(local.snapshot())[0];
    await local.mediaTransport.send({
      action: "media.accept",
      input: media.createFrameOwnerDecision(
        local.snapshot(),
        draft.record,
        "accept",
      ),
    });
    assert.equal(result.dispatched, false);
    const complete = real.realFrameDocuments(local.snapshot())[0],
      asset = local.snapshot().assets[0];
    assert.ok(real.safeFrameAsset(local.snapshot(), asset));
    assert.match(asset.title, /Synthetic schematic/);
    const uri = local.mediaTransport.imageUrl(
      local.snapshot().campaign.id,
      asset.id,
    );
    assert.match(decodeURIComponent(uri), /SYNTHETIC SCHEMATIC/);
    assert.doesNotMatch(uri, /https|api\/|<image/);
    assert.deepEqual(
      await media.finishRealFrameAttempt(attempt, local.mediaTransport),
      result,
    );
    local.advanceScene();
    local.setOutcome("failure");
    const failedAttempt = await frameAttempt(local, complete.record.id);
    assert.equal(
      (await media.finishRealFrameAttempt(failedAttempt, local.mediaTransport))
        .status,
      "failed",
    );
    assert.equal(local.snapshot().assets.length, 1);
    setData(local);
    const current = html(
      ui("components/visual-frame/current-scene-media-frame.tsx")
        .CurrentSceneMediaFrame,
      { transport: local.mediaTransport },
    );
    assert.match(current, /data:image\/svg/);
    assert.match(current, /Earlier scene illustration/);
    assert.match(current, /FRAME history and recovery/);
    local.setOutcome("in_flight");
    const failed = real
      .realFrameDocuments(local.snapshot())
      .find((r) => r.value.status === "failed");
    const waiting = await frameAttempt(local, failed.record.id);
    assert.equal(
      (await media.finishRealFrameAttempt(waiting, local.mediaTransport))
        .status,
      "generating",
    );
    const inflight = real
      .realFrameDocuments(local.snapshot())
      .find((r) => r.value.status === "generating");
    const cancel = {
      ...real.realFrameDocumentMutation(
        local.snapshot(),
        { ...inflight.value, status: "cancelled", failure: null },
        inflight.record,
      ),
      requestId: id(888),
    };
    const cancelled = await local.mediaTransport.send({
      action: "media.save",
      input: cancel,
    });
    assert.equal(cancelled.status, "cancelled");
    assert.deepEqual(
      await local.mediaTransport.send({ action: "media.save", input: cancel }),
      cancelled,
    );
    assert.equal(local.snapshot().assets.length, 1);
    assert.deepEqual(
      real
        .realFrameDocuments(local.snapshot())
        .map((r) => r.value.status)
        .sort(),
      ["cancelled", "completed", "failed"],
    );
  } finally {
    globalThis.fetch = savedFetch;
  }
});

test("FRAME demo fences scene/head/reference versions, scopes pixels, and rejects altered receipts", async () => {
  const local = review(),
    attempt = await frameAttempt(local);
  local.advanceScene();
  await assert.rejects(
    media.finishRealFrameAttempt(attempt, local.mediaTransport),
  );
  assert.equal(real.realFrameDocuments(local.snapshot()).length, 0);
  const current = await frameAttempt(local);
  await media.finishRealFrameAttempt(current, local.mediaTransport);
  const draft = real.realFrameDocuments(local.snapshot())[0];
  await local.mediaTransport.send({
    action: "media.accept",
    input: media.createFrameOwnerDecision(
      local.snapshot(),
      draft.record,
      "accept",
    ),
  });
  await assert.rejects(
    local.mediaTransport.send({
      action: "media.dispatch",
      input: {
        ...current.dispatch,
        requestId: current.dispatch.requestId,
        expectedRevision: current.dispatch.expectedRevision + 1,
      },
    }),
  );
  await assert.rejects(
    local.mediaTransport.prepare({
      campaignId: id(999),
      timeline: local.snapshot().timeline,
      expectedPublicStateRevision: 1,
      referenceIds: [],
      composition: "wide",
      retryOf: null,
    }),
  );
  assert.throws(() =>
    local.mediaTransport.imageUrl(id(999), local.snapshot().assets[0].id),
  );
  assert.throws(() =>
    local.mediaTransport.imageUrl(local.snapshot().campaign.id, id(999)),
  );
  const refs = real.eligibleRealReferences(local.snapshot());
  assert.ok(refs.length > 0);
  assert.ok(
    refs.every(
      (r) =>
        r.reference.subject.kind !== "entity" ||
        r.reference.subject.id !==
          local.snapshot().entities.find((e) => e.kind === "npc").id,
    ),
    "known NPC is not automatically a present-subject reference",
  );
});

test("actual owner object and reward-limit forms keep public contents/quantities and version history", async () => {
  const local = review(),
    before = local.snapshot(),
    view = local.objects(),
    item = local.rewards().owner.items[0];
  const edit = {
    action: "edit",
    objectId: view.objects[0].id,
    expectedObjectRevision: 1,
    label: "Owner correction",
    access: "closed",
    portable: false,
  };
  const updated = await local.saveObject(edit, view.command, id(1));
  assert.equal(updated.objects[0].revision, 2);
  assert.equal(updated.objects[0].contentsEstablished, true);
  assert.deepEqual(await local.saveObject(edit, view.command, id(1)), updated);
  await assert.rejects(
    local.saveObject({ ...edit, contents: [] }, local.objects().command, id(2)),
  );
  await assert.rejects(
    local.saveObject(
      { ...edit, objectId: id(999) },
      local.objects().command,
      id(3),
    ),
  );
  const input = {
    rewardId: local.rewards().owner.rewards[0].id,
    expectedRewardVersion: 1,
    expectedPolicyVersion: null,
    sourceSignificance: "meaningful",
    usablePowerCeiling: 4,
    meaningfulnessFloor: 2,
    powerAggregation: "maximum",
    nonItemSignificance: 0,
    deliberateFloorException: null,
    items: [
      {
        itemId: item.id,
        rarity: "common",
        usablePower: 3,
        narrativeSignificance: 2,
      },
    ],
  };
  const fence = local.rewards().command,
    reward = local.saveReward(input, fence, id(4));
  assert.equal(reward.owner.rewardIntegrity[0].expectedPolicyVersion, 1);
  assert.deepEqual(local.saveReward(input, fence, id(4)), reward);
  assert.throws(() =>
    local.saveReward(
      { ...input, privateAssessment: "hidden" },
      local.rewards().command,
      id(5),
    ),
  );
  assert.throws(() =>
    local.saveReward(
      {
        ...input,
        expectedPolicyVersion: 1,
        items: [{ ...input.items[0], usablePower: 1000001 }],
      },
      local.rewards().command,
      id(6),
    ),
  );
  assert.deepEqual(local.snapshot().items, before.items);
  assert.deepEqual(local.snapshot().entities, before.entities);
  assert.equal(local.histories().objects.length, 2);
  assert.equal(local.histories().rewards.length, 1);
  setData(local);
  assert.match(
    html(
      ui("components/adventure-loot/objects-panel.tsx")
        .AdventureLootObjectsPanel,
      { language: "en", data: local.objects(), busy: false, onSave: noCall },
    ),
    /Contents already recorded/,
  );
  const limits = html(
    ui("components/foundation-loop/reward-integrity-owner.tsx")
      .RewardIntegrityOwner,
    { view: local.rewards(), apply: noCall },
  );
  assert.match(limits, /Maximum usable reward power/);
  assert.match(limits, /Minimum significance/);
  assert.doesNotMatch(limits, /private|fullPower|economicValue/);
});

test("Visual Bible uses real reference validation, immutable public history and local transport", async () => {
  const local = review(),
    snapshot = local.snapshot(),
    row = snapshot.documents.find(
      (d) => visual.parseVisualMetadata(d)?.subject?.kind === "style",
    );
  const value = visual.parseVisualMetadata(row),
    next = {
      ...value,
      approval: "draft",
      guidance: "Owner-reviewed public visual correction.",
    };
  const mutation = {
    ...visual.visualDocumentMutation(snapshot, next, row),
    requestId: id(1),
  };
  await local.visualTransport.save(mutation);
  const history = await local.visualTransport.history(
    snapshot.campaign.id,
    row.id,
  );
  assert.equal(history.length, 2);
  assert.equal(history[0].body, row.body);
  assert.deepEqual(await local.visualTransport.save(mutation), {
    id: row.id,
    revision: 2,
    timeline: snapshot.timeline,
  });
  await assert.rejects(local.visualTransport.history(id(999), row.id));
  await assert.rejects(
    local.visualTransport.save({
      ...mutation,
      payload: { ...mutation.payload, body: "Forged plain text" },
      requestId: id(2),
      expectedRevision: 2,
    }),
  );
});

test("EN/RU persistent-shell review is explicit, mobile-capable, credential-free and uses actual panels", () => {
  for (const lang of ["en", "ru"]) {
    language = lang;
    const markup = html(AdventureMediaPreview, {});
    assert.match(markup, /app-shell/);
    assert.match(markup, /bottom-nav/);
    assert.match(markup, /mobile-menu/);
    assert.match(markup, /\/preview\/adventure-media\?screen=game/);
    assert.match(
      markup,
      lang === "en"
        ? /No database, provider calls or paid generation/
        : /Без базы данных, провайдеров и платной генерации/,
    );
    assert.match(
      markup,
      lang === "en"
        ? /State resets on reload/
        : /Состояние сбрасывается при перезагрузке/,
    );
    assert.match(
      markup,
      lang === "en"
        ? /Image references and VIDEO are unavailable/
        : /Образцы с изображениями и VIDEO недоступны/,
    );
    assert.doesNotMatch(
      markup,
      /PRIVATE_|service_role|sourceDigest|manifest|secret|Bearer /,
    );
  }
  language = "en";
  const file = readFileSync(
    resolve(lane, "src/components/adventure-media-preview.tsx"),
    "utf8",
  );
  assert.doesNotMatch(
    file,
    /fetch\(|test-fixtures|private.?fixture|\.env|supabase|localStorage|sessionStorage|setInterval/,
  );
  assert.match(file, /PersistentGame[\s\S]*reviewOnly[\s\S]*mediaTransport/);
  assert.match(
    file,
    /PersistentSupporting[\s\S]*screen="gallery"[\s\S]*mediaTransport/,
  );
  assert.equal((file.match(/persistPending=\{false\}/g) || []).length, 2);
});

test("persistPending=false skips every pending-storage read/write and defaults retain exact durable recovery", async () => {
  let effects = [],
    storageReads = 0,
    storageWrites = 0,
    parsed;
  const hooks = {
    ...React,
    useEffect: (fn) => {
      effects.push(fn);
    },
    useRef: (value) => ({ current: value }),
    useState: (value) => [
      typeof value === "function" ? value() : value,
      () => {},
    ],
    useCallback: (fn) => fn,
  };
  const saved = globalThis.sessionStorage;
  globalThis.sessionStorage = {
    getItem: () => {
      storageReads++;
      return '{"requestId":"ordinary-pending"}';
    },
    setItem: () => storageWrites++,
    removeItem: () => storageWrites++,
  };
  try {
    const pending = modules({ react: hooks })(
      "lane:src/components/adventures/use-pending.ts",
    );
    let hook = pending.usePending(
      "normal-key",
      (value) => {
        parsed = value;
        return value && JSON.parse(value);
      },
      false,
    );
    effects.forEach((fn) => fn());
    await Promise.resolve();
    hook.remember({ requestId: "synthetic" });
    hook.remember(null);
    assert.equal(parsed, null);
    assert.equal(storageReads, 0);
    assert.equal(storageWrites, 0);
    effects = [];
    hook = pending.usePending("normal-key", (value) => JSON.parse(value));
    effects.forEach((fn) => fn());
    await Promise.resolve();
    hook.remember({ requestId: "exact" });
    assert.equal(storageReads, 1);
    assert.equal(storageWrites, 1);
    const worlds = readFileSync(
      resolve(lane, "src/components/adventures/worlds.tsx"),
      "utf8",
    );
    assert.match(
      worlds,
      /if \(!persistPending\) return;[\s\S]*sessionStorage.getItem/,
    );
    assert.match(
      worlds,
      /<WorldCreator[\s\S]*persistPending=\{persistPending\}/,
    );
    for (const name of ["new-hero.tsx", "adventures-panel.tsx"])
      assert.match(
        readFileSync(resolve(lane, "src/components/adventures", name), "utf8"),
        /<WorldPicker[\s\S]*persistPending=\{persistPending\}/,
      );
  } finally {
    if (saved === undefined) delete globalThis.sessionStorage;
    else globalThis.sessionStorage = saved;
  }
});
