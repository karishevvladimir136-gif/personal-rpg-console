import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fixture, id } from "./phase2-mechanics-fixtures.mjs";
import { translate } from "../src/lib/i18n.ts";
import {
  VISUAL_FRAME_PREFIX,
  newVisualReference,
  serializeVisualMetadata,
} from "../src/lib/visual-frame/model.ts";
import {
  buildRealFrame,
  REAL_FRAME_ASSET_PREFIX,
} from "../src/lib/visual-frame/real-frame.ts";
import {
  buildSceneVideo,
  videoAssetMutation,
  VIDEO_PREFIX,
  VIDEO_RESERVATION_USD_MICROS,
} from "../src/lib/scene-video/model.ts";
import { selectSubjectVisual } from "../src/lib/visual-frame/subject-visual.ts";
import {
  buildSubjectVisualJob,
  SUBJECT_VISUAL_ASSET_PREFIX,
} from "../src/lib/visual-frame/subject-job.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const react = require("react");
const jsx = require("react/jsx-runtime");
const privateCanary = "PRIVATE_TEST_CANARY_DO_NOT_RENDER";

function publicSnapshot() {
  const data = fixture().snapshot;
  data.timeline = { timelineId: id("review-timeline"), epoch: 1 };
  data.entities[0].name = "Public hero";
  data.entities[0].details = "A recorded public character description.";
  data.entities[0].stats = { level: 3, Agility: 4 };
  data.entities[0].resources = { Focus: 2 };
  data.entities[1].name = "Public companion";
  data.entities[2].name = "Public acquaintance";
  data.items[0].name = "Public recorded item";
  data.quests[0].title = "Public active objective";
  data.quests[0].description = "An established objective description.";
  data.publicState.summary = "Public story summary.";
  const makeScene = (key, role, sequence, body) => ({
    id: id(key),
    campaign_id: data.campaign.id,
    session_id: data.sessions[0].id,
    role,
    title: key,
    body,
    sequence,
    revision: 1,
    settings_revision: 1,
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  });
  data.scenes = [
    makeScene(
      "ordinary-narration",
      "narration",
      1,
      "Narrative mentions a clue but is not a saved note.",
    ),
    {
      ...makeScene("recorded-clue", "note", 2, "Public recorded clue."),
      title: "Public recorded clue",
    },
  ];
  data.publicState.current_scene_id = data.scenes[0].id;
  // Deliberately contaminate otherwise public DTOs with extra private properties.
  // Presentation must select its public fields rather than serialize whole records.
  data.privateState = { hidden: privateCanary };
  data.publicState.dm_private = privateCanary;
  data.entities.forEach((entity) => {
    entity.private_notes = privateCanary;
  });
  data.items.forEach((item) => {
    item.private_mechanics = privateCanary;
  });
  return data;
}

function acceptedPortrait(snapshot, entity) {
  const jobId = id(`portrait-job-${entity.id}`);
  const versionId = id(`portrait-version-${entity.id}`);
  const dispatchId = id(`portrait-dispatch-${entity.id}`);
  const queued = buildSubjectVisualJob(
    snapshot,
    { kind: "entity", id: entity.id },
    [],
    "gpt-image-2.5-sunburst-2026-09-08",
    { size: "1024x1024", quality: "high", outputFormat: "png", n: 1 },
    { expectedHeadId: null, canonGeneration: 0 },
  );
  const job = {
    ...queued,
    status: "completed",
    resultAssetId: jobId,
    dispatch: { requestId: dispatchId, reservationUsdMicros: 400000 },
    review: { status: "safe_to_review", imageSha256: "a".repeat(64) },
  };
  snapshot.documents.push({
    id: jobId,
    campaign_id: snapshot.campaign.id,
    revision: 4,
    current_version_id: versionId,
    updated_at: "2026-10-03T00:00:00Z",
    title: "Synthetic accepted portrait job",
    status: "reference",
    body: VISUAL_FRAME_PREFIX + JSON.stringify(job),
  });
  const output = {
    storagePath: `${snapshot.campaign.id}/frames/${jobId}/output.png`,
    sha256: "a".repeat(64),
    bytes: 100,
    contentType: "image/png",
    usage: null,
    providerRequestId: "synthetic_only",
  };
  snapshot.assets.push({
    id: jobId,
    campaign_id: snapshot.campaign.id,
    revision: 1,
    updated_at: "2026-10-03T00:00:00Z",
    title: "Synthetic accepted portrait",
    kind: "image",
    storage_path: output.storagePath,
    description: SUBJECT_VISUAL_ASSET_PREFIX + JSON.stringify({
      campaign_id: snapshot.campaign.id,
      job_document_id: jobId,
      job_version_id: versionId,
      subject: job.basis.subject,
      timeline: job.basis.timeline,
      provider: "OpenAI",
      model: job.model,
      dispatchRequestId: dispatchId,
      output,
      ownerApproval: {
        requestId: id(`portrait-accept-${entity.id}`),
        draftVersionId: versionId,
      },
    }),
  });
  return jobId;
}

function draftOnlyPortrait(snapshot, entity) {
  const assetId = id(`draft-asset-${entity.id}`);
  const versionId = id(`draft-version-${entity.id}`);
  const dispatchId = id(`draft-dispatch-${entity.id}`);
  const frame = buildRealFrame(
    snapshot, [], "portrait", "gpt-image-2.5-sunburst-2026-09-08",
    { size: "1024x1024", quality: "high", outputFormat: "png", n: 1 },
    { expectedHeadId: null, canonGeneration: 0 },
  );
  // Historical completed FRAME pixels can exist before visual-reference approval.
  frame.schema = 3;
  delete frame.review;
  frame.status = "completed";
  frame.resultAssetId = assetId;
  frame.dispatch = { requestId: dispatchId, reservationUsdMicros: 400000 };
  snapshot.documents.push({
    id: assetId, campaign_id: snapshot.campaign.id, revision: 3,
    current_version_id: versionId, updated_at: "2026-10-04T00:00:00Z",
    title: "Synthetic unapproved FRAME", status: "reference",
    body: VISUAL_FRAME_PREFIX + JSON.stringify(frame),
  });
  const output = {
    storagePath: `${snapshot.campaign.id}/frames/${assetId}/output.png`,
    sha256: "b".repeat(64), bytes: 100, contentType: "image/png",
    usage: null, providerRequestId: "synthetic_only",
  };
  snapshot.assets.push({
    id: assetId, campaign_id: snapshot.campaign.id, revision: 1,
    updated_at: "2026-10-04T00:00:00Z", title: "Synthetic draft pixels",
    kind: "image", storage_path: output.storagePath,
    description: REAL_FRAME_ASSET_PREFIX + JSON.stringify({
      campaign_id: snapshot.campaign.id,
      job_document_id: assetId,
      job_version_id: versionId,
      scene_id: frame.basis.scene.id,
      scene_revision: frame.basis.scene.revision,
      timeline: frame.basis.timeline,
      provider: "OpenAI",
      model: frame.model,
      dispatchRequestId: dispatchId,
      output,
    }),
  });
  const reference = newVisualReference(snapshot, { kind: "entity", id: entity.id });
  snapshot.documents.push({
    id: id(`draft-reference-${entity.id}`),
    campaign_id: snapshot.campaign.id, revision: 1,
    current_version_id: id(`draft-reference-version-${entity.id}`),
    updated_at: "2026-10-05T00:00:00Z",
    title: "Synthetic draft reference", status: "reference",
    body: serializeVisualMetadata({
      ...reference,
      imageAssetId: assetId,
      imageAssetRevision: 1,
      approval: "draft",
    }),
  });
  return assetId;
}

function acceptedCurrentSceneFrame(snapshot) {
  const jobId = id("accepted-current-scene-frame");
  const versionId = id("accepted-current-scene-frame-version");
  const dispatchId = id("accepted-current-scene-frame-dispatch");
  const frame = buildRealFrame(
    snapshot, [], "wide", "gpt-image-2.5-sunburst-2026-09-08",
    { size: "1536x1024", quality: "high", outputFormat: "png", n: 1 },
    { expectedHeadId: null, canonGeneration: 0 },
  );
  frame.status = "completed";
  frame.resultAssetId = jobId;
  frame.dispatch = { requestId: dispatchId, reservationUsdMicros: 400000 };
  frame.review = { status: "safe_to_review", imageSha256: "c".repeat(64) };
  snapshot.documents.push({
    id: jobId, campaign_id: snapshot.campaign.id, revision: 4,
    current_version_id: versionId, updated_at: "2026-10-05T00:00:00Z",
    title: "Accepted current scene FRAME", status: "reference",
    body: VISUAL_FRAME_PREFIX + JSON.stringify(frame),
  });
  const output = {
    storagePath: `${snapshot.campaign.id}/frames/${jobId}/output.png`,
    sha256: "c".repeat(64), bytes: 100, contentType: "image/png",
    usage: null, providerRequestId: "synthetic_only",
  };
  snapshot.assets.push({
    id: jobId, campaign_id: snapshot.campaign.id, revision: 1,
    updated_at: "2026-10-05T00:00:00Z", title: "Accepted current scene FRAME",
    kind: "image", storage_path: output.storagePath,
    description: "RPG_OWNER_FRAME_ASSET_V1\n" + JSON.stringify({
      campaign_id: snapshot.campaign.id,
      job_document_id: jobId,
      job_version_id: versionId,
      scene_id: frame.basis.scene.id,
      scene_revision: frame.basis.scene.revision,
      timeline: frame.basis.timeline,
      provider: "OpenAI", model: frame.model,
      dispatchRequestId: dispatchId,
      output,
      ownerApproval: {
        requestId: id("accepted-current-scene-frame-approval"),
        draftVersionId: versionId,
      },
    }),
  });
  return jobId;
}

function acceptedCurrentSceneVideo(snapshot, frameId) {
  const jobId = id("accepted-current-scene-video");
  const versionId = id("accepted-current-scene-video-version");
  const value = buildSceneVideo(
    snapshot, frameId, { expectedHeadId: null, canonGeneration: 0 },
  );
  value.status = "ready";
  value.resultAssetId = jobId;
  value.dispatch = {
    requestId: id("accepted-current-scene-video-dispatch"),
    reservationUsdMicros: VIDEO_RESERVATION_USD_MICROS,
  };
  const record = {
    id: jobId, campaign_id: snapshot.campaign.id, revision: 3,
    current_version_id: versionId, updated_at: "2026-10-05T00:00:00Z",
    title: "Accepted current scene VIDEO", status: "reference",
    body: VIDEO_PREFIX + JSON.stringify(value),
  };
  snapshot.documents.push(record);
  const output = {
    storagePath: `${snapshot.campaign.id}/videos/${jobId}/output.mp4`,
    sha256: "d".repeat(64), bytes: 100, contentType: "video/mp4",
    providerRequestId: id("accepted-current-scene-video-provider"),
    actualModel: value.model,
  };
  const asset = videoAssetMutation(snapshot, record, value, output).payload;
  snapshot.assets.push({
    ...asset, campaign_id: snapshot.campaign.id, revision: 1,
    updated_at: "2026-10-05T00:00:00Z",
  });
  return jobId;
}

/** Mount real components, collect their effects, and block every fetch at the boundary.
 * Open disclosures are forced through the actual useSyncExternalStore consumer.
 * No effectful product component or transport is replaced with a harmless placeholder.
 */
function harness({
  data = publicSnapshot(),
  play = null,
  pathname = "/preview/live-ui",
  language = "en",
  open = true,
} = {}) {
  const cache = new Map();
  const effects = [];
  const requests = [];
  const listeners = [];
  const timers = [];
  const buttons = [];
  const inventoryState = new Map();
  let inventoryHook = 0;
  let snapshot = data;
  const storage = new Map();
  const noMutation = () =>
    assert.fail("Presentation tried to mutate campaign records");
  const browserStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  };
  const sandbox = vm.createContext({
    console,
    URL,
    URLSearchParams,
    AbortController,
    Date,
    Event,
    structuredClone,
    TextEncoder,
    fetch: async (input) => {
      requests.push(String(input));
      throw new Error("Synthetic test blocked a real transport request");
    },
    window: {
      localStorage: browserStorage,
      sessionStorage: browserStorage,
      addEventListener: (name) => listeners.push(name),
      removeEventListener() {},
      dispatchEvent() {},
      setInterval: () => {
        timers.push("interval");
        return 1;
      },
      clearInterval() {},
      setTimeout: () => {
        timers.push("timeout");
        return 1;
      },
      clearTimeout() {},
      confirm: noMutation,
    },
    document: {
      addEventListener() {},
      removeEventListener() {},
      visibilityState: "visible",
    },
    setTimeout,
    clearTimeout,
    CustomEvent: class extends Event {},
  });
  const context = () => ({
    campaignId: snapshot.campaign.id,
    data: snapshot,
    loading: false,
    error: "",
    refresh: async () => noMutation(),
    mutate: async () => noMutation(),
  });
  const wrappedJsx = (fn) => (type, props, key) => {
    if (type === "button" && props.role === "tab") buttons.push(props);
    return fn(type, props, key);
  };
  function load(relative) {
    let path = resolve(root, relative);
    if (!existsSync(path)) path += existsSync(path + ".tsx") ? ".tsx" : ".ts";
    if (cache.has(path)) return cache.get(path);
    if (path.endsWith(".json")) return JSON.parse(readFileSync(path, "utf8"));
    const loadedModule = { exports: {} };
    cache.set(path, loadedModule.exports);
    const output = ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    function localRequire(name) {
      if (name === "react")
        return {
          ...react,
          useEffect: (effect) => {
            effects.push(effect);
          },
          useSyncExternalStore: (_subscribe, _get, server) =>
            open ? "open" : server(),
          useState: (initial) => {
            const actual = react.useState(initial);
            if (!new Error().stack.includes("at InventoryRecords"))
              return actual;
            const key = inventoryHook++;
            if (!inventoryState.has(key)) inventoryState.set(key, actual[0]);
            return [
              inventoryState.get(key),
              (value) =>
                inventoryState.set(
                  key,
                  typeof value === "function"
                    ? value(inventoryState.get(key))
                    : value,
                ),
            ];
          },
        };
      if (name === "react/jsx-runtime")
        return { ...jsx, jsx: wrappedJsx(jsx.jsx), jsxs: wrappedJsx(jsx.jsxs) };
      if (name.endsWith("language-context"))
        return {
          useLanguage: () => ({
            language,
            t: (key, values) => translate(language, key, values),
          }),
        };
      if (name.endsWith("persistence-context"))
        return {
          useCampaignData: context,
          useOptionalCampaignData: context,
          useWorkspaceData: () => ({
            data: { preferences: {} },
            loading: false,
            error: "",
          }),
          CampaignDataPreview: ({ snapshot: next, children }) => {
            snapshot = next;
            return children;
          },
          useCampaignDraftScope: () => ({
            timeline: snapshot.timeline,
            stale: false,
            reset() {},
          }),
          useUnsavedChanges() {},
          TimelineDraftNotice: () => null,
        };
      if (name === "next/link") return { __esModule: true, default: "a" };
      if (name === "next/image")
        return {
          __esModule: true,
          default: (props) =>
            createElement("img", Object.fromEntries(
              Object.entries(props).filter(([key]) => key !== "unoptimized"),
            )),
        };
      if (name === "next/navigation")
        return {
          usePathname: () => pathname,
          useRouter: () => ({ push: noMutation, refresh: noMutation }),
        };
      if (play && name.endsWith("gameplay-runtime"))
        return {useGameplayRuntime:()=>({play,loading:false,error:"",
          refresh:async()=>play,afterMutation:async()=>{} })};
      if (name.endsWith(".css"))
        return {
          __esModule: true,
          default: new Proxy({}, { get: (_, key) => String(key) }),
        };
      if (name === "server-only")
        return assert.fail("Public UI imported server-only code");
      if (name.startsWith(".") || name.startsWith("@/")) {
        return load(
          name.startsWith("@/")
            ? resolve(root, "src", name.slice(2))
            : resolve(dirname(path), name),
        );
      }
      return require(name);
    }
    vm.runInContext(
      `(function(require,module,exports){${output}\n})`,
      sandbox,
      { filename: path },
    )(localRequire, loadedModule, loadedModule.exports);
    cache.set(path, loadedModule.exports);
    return loadedModule.exports;
  }
  function render(file, exported, props = {}) {
    inventoryHook = 0;
    buttons.length = 0;
    return renderToStaticMarkup(createElement(load(file)[exported], props));
  }
  async function runEffects() {
    for (const effect of effects.splice(0)) effect();
    // Drain rejection/finally chains while keeping all requests inside the barrier.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return {
    load,
    render,
    runEffects,
    requests,
    listeners,
    timers,
    buttons,
    inventoryState,
  };
}

for (const screen of [
  "game",
  "character",
  "inventory",
  "party",
  "journal",
  "map",
  "gallery",
  "sessions",
  "library",
  "settings",
]) {
  test(`synthetic ${screen}: opening disclosures never starts real API requests or gameplay polling`, async () => {
    const h = harness();
    const html = h.render("src/components/live-ui-review.tsx", "LiveUiReview", {
      initialScreen: screen,
    });
    assert.match(html, /SYNTHETIC UI REVIEW/);
    await h.runEffects();
    assert.deepEqual(
      h.requests,
      [],
      "A review panel started a real transport request",
    );
    assert.deepEqual(h.timers, [], "A review panel started runtime polling");
    assert.ok(!h.listeners.includes("rpg-gameplay-changed"));
  });
}

test("gameplay runtime suppresses mount and explicit refresh in reviewOnly mode", async () => {
    const h = harness({ pathname: "/preview/live-ui" });
    let runtime;
    function HookProbe() {
      runtime = h
        .load("src/components/gameplay-runtime.tsx")
        .useGameplayRuntime(true);
      return null;
    }
    renderToStaticMarkup(createElement(HookProbe));
    await h.runEffects();
    assert.equal(await runtime.refresh(), null);
    assert.equal(runtime.loading, false);
    assert.deepEqual(h.requests, []);
    assert.deepEqual(h.timers, []);
    assert.deepEqual(h.listeners, []);
});

test("transport barrier sees live gameplay and live progression requests (positive control)", async () => {
  const h = harness({ pathname: "/campaigns/synthetic/character" });
  h.render("src/components/persistent-records.tsx", "PersistentCharacter");
  await h.runEffects();
  assert.ok(
    h.requests.some((url) => url.includes("foundation")),
    "The real effect must reach the transport barrier",
  );
  h.requests.length = 0;
  function HookProbe() {
    h.load("src/components/gameplay-runtime.tsx").useGameplayRuntime();
    return null;
  }
  renderToStaticMarkup(createElement(HookProbe));
  await h.runEffects();
  assert.ok(h.requests.some((url) => url.includes("play")));
  assert.ok(h.listeners.includes("rpg-gameplay-changed"));
  assert.equal(h.timers.length, 1);
});

test("Game contextual rail renders recorded public state without promoting narration to clues", () => {
  const data = publicSnapshot();
  const before = structuredClone(data);
  const h = harness({ data });
  const html = h.render(
    "src/components/persistent-game.tsx",
    "PersistentGame",
    { reviewOnly: true },
  );
  const start = html.indexOf('<aside class="context-column"');
  assert.ok(start >= 0, "Contextual rail should be present");
  const rail = html.slice(start, html.indexOf("</aside>", start));
  for (const text of [
    "Public hero",
    "Current objective",
    "Public active objective",
    "Traveling together",
    "Public recorded clue",
    "Focus",
    "Safe clearing",
  ])
    assert.ok(rail.includes(text), text);
  assert.ok(
    !rail.includes("Public companion"),
    "A review without a present-entity projection cannot claim a companion is here",
  );
  assert.ok(!rail.includes("Narrative mentions a clue"));
  const clueStart = rail.indexOf("<h2>Recent clues</h2>");
  assert.ok(clueStart >= 0, "Recent clues panel should be present");
  const clues = rail.slice(clueStart);
  assert.ok(!clues.includes("ordinary-narration"));
  assert.ok(
    !rail.includes("Public acquaintance"),
    "Known NPCs must not become traveling companions",
  );
  for (const screen of ["character", "map", "journal", "party"])
    assert.ok(rail.includes(`/campaigns/${data.campaign.id}/${screen}`));
  assert.ok(!html.includes(privateCanary));
  assert.deepEqual(data, before);
});

test("Game shows accepted scene art beside story text, without an empty hero or draft pixels", async () => {
  const data = publicSnapshot();
  const draftId = draftOnlyPortrait(data, data.entities[0]);
  const acceptedId = acceptedCurrentSceneFrame(data);
  const videoId = acceptedCurrentSceneVideo(data, acceptedId);
  const before = structuredClone(data);
  const h = harness({ data });
  const view = h.load("src/components/persistent-game.tsx").createGameViewModel(data, null);
  assert.equal(view.sceneFrame?.id, acceptedId);
  assert.equal(view.sceneVideo?.id, videoId);
  const html = h.render("src/components/persistent-game.tsx", "PersistentGame", {
    reviewOnly: true,
    mediaTransport: { imageUrl: (_campaignId, assetId) => `/synthetic/${assetId}` },
    videoTransport: { videoUrl: (_campaignId, assetId) => `/synthetic/${assetId}` },
  });
  assert.match(html, /class="sceneHeading"/);
  assert.doesNotMatch(html, /class="scene-art"/);
  assert.match(html, new RegExp(`class="sceneIllustrations"[^>]*>.*src="/synthetic/${acceptedId}"`));
  assert.match(html, new RegExp(`src="/synthetic/${videoId}"`));
  assert.ok(html.indexOf("Narrative mentions a clue") < html.indexOf('class="sceneIllustrations"'));
  assert.ok(!html.includes(`/synthetic/${draftId}`));
  await h.runEffects();
  assert.deepEqual(h.requests, []);
  assert.deepEqual(data, before);
});

test("accepted FRAME for a committed turn follows that turn in transcript chronology",async()=>{
  const data=publicSnapshot();
  const opening=data.scenes[0];
  const player={...opening,id:id("inline-player-scene"),role:"player",
    sequence:2,body:"I step inside."};
  const narration={...opening,id:id("inline-narration"),role:"narration",
    sequence:3,body:"A lantern lights the room."};
  data.scenes=[opening,player,narration];
  data.publicState.current_scene_id=narration.id;
  const assetId=acceptedCurrentSceneFrame(data);
  const turn={id:id("inline-turn"),campaign_id:data.campaign.id,
    session_id:data.sessions[0].id,mode:"game",input:"I step inside.",
    status:"committed",expectedRevision:1,committedRevision:2,
    settingsRevision:1,created_at:opening.created_at,updated_at:opening.updated_at,
    narration:"A lantern lights the room.",visualDescription:null,
    checks:[],proposal:null,failure:null,canRetry:false,canCancel:false,
    companionId:null,listenerIds:[],timeline:data.timeline,
    narrationSceneId:narration.id};
  const play={campaignId:data.campaign.id,revision:2,timeline:data.timeline,
    rulesetId:"world-logic-v1",configured:true,model:"gpt-6-astra",
    configuration:{profile:"console-basic-v1",
      controlledEntityIds:[data.entities[0].id],presentEntityIds:[data.entities[0].id],
      nearbyStorageIds:[],safeLocationIds:[],itemRules:[]},turns:[turn],
    encounters:[],participants:[],pendingActions:[],rests:[]};
  const h=harness({data,play});
  const html=h.render("src/components/persistent-game.tsx","PersistentGame",{
    reviewOnly:true,mediaTransport:{imageUrl:(_campaignId,id)=>`/synthetic/${id}`}});
  const turnAt=html.indexOf(`id="saved-turn-${turn.id}"`);
  const artAt=html.indexOf(`src="/synthetic/${assetId}"`);
  assert.ok(turnAt>=0 && artAt>turnAt);
  assert.equal(html.slice(0,turnAt).includes(`src="/synthetic/${assetId}"`),false);
  assert.equal((html.match(new RegExp(`src="/synthetic/${assetId}"`,"g"))??[]).length,1);
  assert.deepEqual(h.requests,[]);
});

for (const [exported, expected] of [
  ["PersistentCharacter", "Public hero"],
  ["PersistentInventory", "Public recorded item"],
  ["PersistentParty", "Public companion"],
]) {
  test(`${exported} selects public fields, never private record properties`, () => {
    const data = publicSnapshot();
    const before = structuredClone(data);
    const html = harness({ data }).render(
      "src/components/persistent-records.tsx",
      exported,
      { reviewOnly: true },
    );
    assert.ok(html.includes(expected));
    assert.ok(!html.includes(privateCanary));
    assert.deepEqual(data, before);
  });
}

test("Inventory storage tabs select their actual storage and reset a previous category filter", () => {
  const data = publicSnapshot();
  data.items = data.storages.map((storage, index) => ({
    ...data.items[0],
    id: id(`storage-item-${index}`),
    storage_id: storage.id,
    owner_entity_id: storage.entity_id,
    equipped_entity_id: null,
    equipped_slot: null,
    name: `Recorded cargo ${index}`,
    category: `category-${index}`,
  }));
  const h = harness({ data, open: false });
  const render = () =>
    h.render("src/components/persistent-records.tsx", "PersistentInventory", {
      reviewOnly: true,
    });
  let html = render();
  assert.match(html, /Recorded cargo 0/);
  const labels = [
    "Player",
    "Companions",
    "Camp / Shared Stash",
    "Transport &amp; Mounts",
  ];
  for (const label of labels) assert.ok(html.includes(label), label);
  for (let index = 1; index < data.storages.length; index++) {
    // category is the third InventoryRecords useState. A category belonging to
    // the old storage must not hide items after selecting the next group.
    h.inventoryState.set(2, "category-0");
    const tabs = h.buttons;
    assert.equal(tabs.length, data.storages.length);
    tabs[index].onClick();
    html = render();
    assert.ok(html.includes(`Recorded cargo ${index}`));
    for (let other = 0; other < data.storages.length; other++) {
      if (other !== index) assert.ok(!html.includes(`Recorded cargo ${other}`));
    }
    assert.equal(h.buttons[index]["aria-selected"], true);
    assert.equal(h.inventoryState.get(2), "");
  }
});

function publicTurn(overrides = {}) {
  return {
    id: id("public-turn"),
    campaign_id: id("campaign"),
    session_id: id("session"),
    timeline: { timelineId: id("review-timeline"), epoch: 1 },
    mode: "game",
    input: "Public companion: I speak as the hero.",
    companionId: null,
    listenerIds: [],
    status: "committed",
    expectedRevision: 1,
    committedRevision: 2,
    settingsRevision: 1,
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
    narration:
      "Public companion: A spoken sentence. Public hero: Another sentence.",
    visualDescription: null,
    checks: [],
    proposal: null,
    failure: null,
    canRetry: false,
    canCancel: false,
    privateNarration: privateCanary,
    ...overrides,
  };
}
function turnHtml(data, overrides) {
  return harness({ data }).render(
    "src/components/gameplay-turn.tsx",
    "GameplayTurn",
    {
      turn: publicTurn(overrides),
      busy: false,
      onCommand: () => assert.fail("Rendering submitted a command"),
      onSaved: async () => {},
    },
  );
}

test("turn portrait uses authoritative companionId, never names in input or narration", () => {
  const data = publicSnapshot();
  const hero = turnHtml(data);
  assert.match(
    hero,
    /class="gameplay-speaker-portrait" aria-hidden="true"[^>]*>P<\/span>/,
  );
  assert.match(hero, /class="eyebrow">Public hero<\/span>/);
  assert.match(
    hero,
    /class="gameplay-narration"><span class="eyebrow">DM<\/span>/,
  );
  assert.equal((hero.match(/gameplay-speaker-portrait/g) || []).length, 1);
  const companion = turnHtml(data, {
    companionId: data.entities[1].id,
    input: "Public hero: misleading prose.",
  });
  assert.match(companion, /class="eyebrow">Public companion<\/span>/);
  assert.equal((companion.match(/gameplay-speaker-portrait/g) || []).length, 1);
  assert.ok(!companion.includes(privateCanary));
});

test("accepted public portraits appear in turns, current hero context, Party, and campaign identity without starting generation", async () => {
  const data = publicSnapshot();
  const heroAsset = acceptedPortrait(data, data.entities[0]);
  const companionAsset = acceptedPortrait(data, data.entities[1]);
  const h = harness({ data });
  const turn = h.render("src/components/gameplay-turn.tsx", "GameplayTurn", {
    turn: publicTurn(), busy: false,
    onCommand: () => assert.fail("Rendering submitted a command"),
    onSaved: async () => {},
  });
  assert.match(turn, new RegExp(`gameplay-speaker-portrait[^>]*><img[^>]*assetId=${heroAsset}`));
  assert.ok(!turn.includes(`assetId=${companionAsset}`));
  const companionTurn = h.render("src/components/gameplay-turn.tsx", "GameplayTurn", {
    turn: publicTurn({ companionId: data.entities[1].id }), busy: false,
    onCommand: () => assert.fail("Rendering submitted a command"),
    onSaved: async () => {},
  });
  assert.match(companionTurn, new RegExp(`gameplay-speaker-portrait[^>]*><img[^>]*assetId=${companionAsset}`));
  const game = h.render("src/components/persistent-game.tsx", "PersistentGame", { reviewOnly: true });
  assert.match(game, new RegExp(`heroAvatar[^>]*><img[^>]*assetId=${heroAsset}`));
  assert.match(game, new RegExp(`personAvatar[^>]*><img[^>]*assetId=${heroAsset}`));
  assert.ok(!game.includes(`assetId=${companionAsset}`), "Review has no present companion projection");
  const party = h.render("src/components/persistent-records.tsx", "PersistentParty", { reviewOnly: true });
  assert.match(party, new RegExp(`partyPortrait[^>]*><img[^>]*assetId=${companionAsset}`));
  const campaign = h.render("src/components/persistent-campaigns.tsx", "CampaignCardsReview", {
    campaigns: [data.campaign], snapshots: { [data.campaign.id]: data },
  });
  assert.match(campaign, new RegExp(`heroAvatar[^>]*><img[^>]*assetId=${heroAsset}`));
  await h.runEffects();
  assert.deepEqual(h.requests, [], "Displaying accepted art must not dispatch media generation");
  assert.ok(![turn, companionTurn, game, party, campaign].join("").includes(privateCanary));
});

test("a real image linked only to a draft reference never becomes ordinary speaker art", () => {
  const data = publicSnapshot();
  const draftAsset = draftOnlyPortrait(data, data.entities[0]);
  assert.equal(
    selectSubjectVisual(data, { kind: "entity", id: data.entities[0].id }).image?.assetId,
    draftAsset,
    "The source selector can surface review-only draft pixels",
  );
  const html = turnHtml(data);
  assert.match(html, /gameplay-speaker-portrait[^>]*>P<\/span>/);
  assert.ok(!html.includes(`assetId=${draftAsset}`));
});

test("feedback, mechanic input, unknown companion and ambiguous player have no invented portrait", () => {
  const data = publicSnapshot();
  for (const overrides of [
    { mode: "feedback" },
    { mode: "mechanic" },
    { companionId: id("unknown-companion") },
  ]) {
    const html = turnHtml(data, overrides);
    assert.ok(!html.includes("gameplay-speaker-portrait"));
  }
  data.entities.push({
    ...data.entities[0],
    id: id("second-player"),
    name: "Second public hero",
  });
  const html = turnHtml(data);
  assert.ok(!html.includes("gameplay-speaker-portrait"));
  assert.match(html, /class="eyebrow">Your action<\/span>/);
});
