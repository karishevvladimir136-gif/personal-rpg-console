import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import { webcrypto } from "node:crypto";
import ts from "typescript";
import * as model from "../src/lib/visual-frame/real-frame.ts";
import * as visual from "../src/lib/visual-frame/model.ts";
import * as client from "../src/lib/visual-frame/media-client.ts";
import { fixture } from "./media-frame-fixture.mjs";
const require = createRequire(import.meta.url),
  flush = () => new Promise((resolve) => setImmediate(resolve));
function compiled(path, dependencies, globals = {}) {
  const source = readFileSync(new URL("../" + path, import.meta.url), "utf8"),
    compiledModule = { exports: {} };
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  runInNewContext(js, {
    module: compiledModule,
    exports: compiledModule.exports,
    crypto: webcrypto,
    TextEncoder,
    structuredClone,
    console,
    require: (name) =>
      dependencies[name] ?? (name === "react/jsx-runtime" ? require(name) : {}),
    ...globals,
  });
  return compiledModule.exports;
}
test("default FRAME transport uses authenticated existing API for capability/prepare/send and private image display", async () => {
  const calls = [],
    fake = {
      readJson: async (...args) => {
        calls.push(args);
        return {};
      },
      loadCampaign: async (cid) => {
        calls.push(["load", cid]);
        return {};
      },
      createMutationAttempt: () => {},
    };
  const lib = compiled("src/lib/visual-frame/media-client.ts", {
      "../persistence/client.ts": fake,
      "./real-frame.ts": model,
    }),
    transport = lib.defaultMediaFrameTransport;
  await transport.capability("campaign id");
  await transport.prepare({ campaignId: "synthetic" });
  await transport.send({
    action: "media.recover",
    input: { requestId: "synthetic" },
  });
  await transport.load("synthetic");
  assert.match(
    calls[0][0],
    /^\/api\/visual-frame\?action=capability&campaignId=campaign%20id$/,
  );
  assert.equal(calls[1][0], "/api/visual-frame");
  assert.equal(JSON.parse(calls[1][1].body).action, "media.prepare");
  assert.equal(JSON.parse(calls[2][1].body).action, "media.recover");
  assert.equal(
    transport.imageUrl("cid", "aid"),
    "/api/visual-frame?campaignId=cid&assetId=aid",
  );
});
test("injected client retries retained dispatch before mutable projection load after confirmed paid completion response was lost", async () => {
  const f = fixture(),
    frame = f.prepare(),
    attempt = client.createRealFrameAttempt(f.snapshot, frame, 400000),
    sent = [];
  let lost = true,
    loads = 0;
  const transport = {
    send: async (command) => {
      sent.push(structuredClone(command));
      const result = await f.run(command.action, command.input);
      if (command.action === "media.dispatch" && lost) {
        lost = false;
        throw Error("lost");
      }
      return result;
    },
    load: async () => {
      loads++;
      return f.snapshot;
    },
  };
  await assert.rejects(client.finishRealFrameAttempt(attempt, transport));
  assert.ok(attempt.dispatch);
  f.proof.canonGeneration++;
  const original = structuredClone(attempt.dispatch);
  loads = 0;
  sent.length = 0;
  await client.finishRealFrameAttempt(attempt, transport);
  assert.equal(loads, 0);
  assert.deepEqual(sent, [{ action: "media.dispatch", input: original }]);
  assert.equal(f.providerCalls(), 1);
});
async function uiHarness({
  language = "en",
  enabled = true,
  loseRefresh = false,
  history = false,
} = {}) {
  const f = fixture(),
    states = [],
    refs = [],
    effectDeps = [],
    effects = [];
  let cursor = 0,
    refCursor = 0,
    effectCursor = 0,
    refreshes = 0;
  const h = { f, prepareCalls: 0, sends: [], network: 0 };
  const transport = {
    capability: async () => ({
      enabled,
      model: f.policy.model,
      parameters: f.policy.parameters,
      reservationUsdMicros: 400000,
      imageReferencesEnabled: false,
    }),
    prepare: async () => {
      h.prepareCalls++;
      return f.prepare();
    },
    send: async (c) => {
      h.sends.push(structuredClone(c));
      return f.run(c.action, structuredClone(c.input));
    },
    load: async () => f.snapshot,
    imageUrl: (cid, id) => "synthetic:" + cid + ":" + id,
    draftImageUrl: (cid, id) => "synthetic-draft:" + cid + ":" + id,
  };
  const react = {
    useState(initial) {
      const i = cursor++;
      if (!(i in states))
        states[i] = typeof initial === "function" ? initial() : initial;
      return [
        states[i],
        (v) => (states[i] = typeof v === "function" ? v(states[i]) : v),
      ];
    },
    useRef(initial) {
      const i = refCursor++;
      return refs[i] ?? (refs[i] = { current: initial });
    },
    useEffect(fn, deps) {
      const i = effectCursor++;
      if (
        !effectDeps[i] ||
        JSON.stringify(deps) !== JSON.stringify(effectDeps[i])
      ) {
        effectDeps[i] = deps;
        effects.push(fn);
      }
    },
  };
  const jsx = (type, props) => ({ type, props }),
    common = {
      useCampaignData: () => ({
        data: f.snapshot,
        refresh: async () => {
          refreshes++;
          if (loseRefresh) {
            loseRefresh = false;
            throw Error("lost-refresh");
          }
          return f.snapshot;
        },
      }),
    };
  const component = compiled(
    "src/components/visual-frame/current-scene-media-frame.tsx",
    {
      react: react,
      "react/jsx-runtime": { jsx, jsxs: jsx },
      "next/image": { default: "img" },
      "../persistence-context": common,
      "../language-context": { useLanguage: () => ({ language }) },
      "../ui": { Button: "button", Badge: "badge" },
      "@/lib/visual-frame/model": visual,
      "@/lib/visual-frame/real-frame": model,
      "@/lib/visual-frame/media-client": {
        ...client,
        defaultMediaFrameTransport: {
          capability: () => {
            h.network++;
            throw Error("NETWORK");
          },
        },
      },
      "@/lib/persistence/client": {
        createMutationAttempt: (_, input) => ({
          ...input,
          requestId: webcrypto.randomUUID(),
        }),
      },
    },
  );
  const inner = history
    ? component.RealFrameHistory
    : component.CurrentSceneMediaFrame({ transport }).type;
  h.render = () => {
    cursor = 0;
    refCursor = 0;
    effectCursor = 0;
    h.tree = inner({ transport });
    for (const effect of effects.splice(0)) effect();
    return h.tree;
  };
  h.nodes = () => {
    const all = [];
    function walk(n) {
      if (Array.isArray(n)) return n.forEach(walk);
      if (!n?.props) return;
      all.push(n);
      walk(n.props.children);
    }
    walk(h.tree);
    return all;
  };
  const text = (n) =>
    typeof n === "string"
      ? n
      : Array.isArray(n)
        ? n.map(text).join("")
        : n?.props
          ? text(n.props.children)
          : "";
  h.button = (label) =>
    h.nodes().find((n) => n.type === "button" && text(n) === label);
  h.click = async (label) => {
    const b = h.button(label);
    assert.ok(b, label);
    assert.equal(Boolean(b.props.disabled), false, label + " enabled");
    b.props.onClick();
    await flush();
    h.render();
  };
  h.text = () => text(h.tree);
  h.refreshes = () => refreshes;
  h.component = component;
  h.transport = transport;
  h.render();
  await flush();
  h.render();
  return h;
}
for (const language of ["en", "ru"])
  test("ordinary FRAME requires visible review and explicit generation, never manual synthetic failure/completion or automatic provider work", async () => {
    const h = await uiHarness({ language });
    assert.equal(h.f.providerCalls(), 0);
    assert.equal(h.sends.length, 0);
    assert.equal(h.network, 0);
    await h.click(
      language === "ru"
        ? "FRAME · проверить эту сцену"
        : "FRAME · review this scene",
    );
    assert.equal(h.prepareCalls, 1);
    assert.equal(h.f.providerCalls(), 0);
    assert.equal(h.sends.length, 0);
    assert.ok(h.button(language === "ru" ? "Создать FRAME" : "Generate FRAME"));
    assert.match(h.text(), /\$0.60/);
    await h.click(language === "ru" ? "Создать FRAME" : "Generate FRAME");
    assert.equal(h.f.providerCalls(), 1);
    assert.equal(h.sends.length, 2);
    assert.deepEqual(
      h.sends.map((c) => c.action),
      ["media.save", "media.dispatch"],
    );
    assert.doesNotMatch(h.text(), /Complete mock|Test mock failure/);
    const image = h
      .nodes()
      .find((n) => n.type === h.component.FrameOwnerReview);
    assert.ok(image);
  });
test("lost final refresh retains exact original request through corrected source retry and keeps prior image visible", async () => {
  const h = await uiHarness({ loseRefresh: true });
  await h.click("FRAME · review this scene");
  await h.click("Generate FRAME");
  assert.ok(h.button("Retry exact request"));
  assert.equal(h.f.providerCalls(), 1);
  const dispatch = structuredClone(h.sends.at(-1));
  h.f.proof.canonGeneration++;
  h.f.snapshot.scenes.find(
    (s) => s.id === h.f.snapshot.publicState.current_scene_id,
  ).revision++;
  h.render();
  await h.click("Retry exact request");
  assert.deepEqual(h.sends.at(-1), dispatch);
  assert.equal(h.f.providerCalls(), 1);
  assert.equal(h.refreshes(), 2);
  assert.match(h.text(), /Draft generated/);
  assert.equal(
    h.f.snapshot.assets.some((a) => a.id === dispatch.input.payload.id),
    false,
  );
});
test("unconfigured real FRAME remains optional and sends no implicit provider/model fallback", async () => {
  const h = await uiHarness({ enabled: false });
  assert.equal(h.f.providerCalls(), 0);
  assert.equal(h.sends.length, 0);
  assert.equal(h.prepareCalls, 0);
  assert.equal(h.button("FRAME · review this scene").props.disabled, true);
  assert.match(h.text(), /No image request has been sent/);
});
test("stored output recovery UI submits only retained recovery, never a paid dispatch or automatic Canon reference", async () => {
  const h = await uiHarness({ history: true }),
    before = h.f.snapshot.documents.filter(
      (r) => visual.parseVisualMetadata(r)?.kind === "reference",
    ).length,
    q = await h.f.queue();
  const input = h.f.dispatch(q.record),
    claim = h.f.authority.claim;
  h.f.authority.claim = async (...args) => {
    await claim(...args);
    throw Error("lost-claim");
  };
  await assert.rejects(h.f.run("media.dispatch", input));
  const record = h.f.snapshot.documents.find((r) => r.id === q.record.id);
  const current = model.parseRealFrame(record);
  await h.f.store.put(
    h.f.snapshot.campaign.id,
    record.id,
    await h.f.provider.generate(current, record.id),
  );
  record.updated_at = new Date(Date.now() - model.FRAME_RECOVERY_AFTER_MS - 1000).toISOString();
  h.render();
  await h.click("Recover FRAME");
  assert.equal(h.sends.at(-1).action, "media.recover");
  assert.equal(h.f.providerCalls(), 1);
  assert.equal(
    model.parseRealFrame(
      h.f.snapshot.documents.find((r) => r.id === q.record.id),
    ).status,
    "draft",
  );
  assert.equal(
    h.f.snapshot.documents.filter(
      (r) => visual.parseVisualMetadata(r)?.kind === "reference",
    ).length,
    before,
  );
});
test("Game labels current generation as nonblocking and overdue generation as recoverable without dispatching", async () => {
  const h = await uiHarness(),
    q = await h.f.queue(),
    claim = h.f.authority.claim;
  h.f.authority.claim = async (...args) => {
    await claim(...args);
    throw Error("lost-claim");
  };
  await assert.rejects(h.f.run("media.dispatch", h.f.dispatch(q.record)));
  h.render();
  assert.match(h.text(), /Generating FRAME… You can keep playing/);
  assert.equal(h.f.providerCalls(), 0);
  h.f.snapshot.documents.find((r) => r.id === q.record.id).updated_at =
    new Date(Date.now() - model.FRAME_RECOVERY_AFTER_MS - 1000).toISOString();
  h.render();
  assert.match(h.text(), /Recovery needed/);
  assert.match(h.text(), /Recover the saved request below/);
  assert.equal(h.f.providerCalls(), 0);
});

for (const language of ["en", "ru"])
  test("reloaded queued FRAME requires explicit priced action and exact retained retry after lost refresh", async () => {
    const h = await uiHarness({ history: true, loseRefresh: true, language });
    await h.f.queue();
    h.render();
    assert.equal(h.f.providerCalls(), 0);
    assert.equal(h.sends.length, 0);
    assert.match(h.text(), /\$0.60/);
    await h.click(
      language === "ru" ? "Создать FRAME из очереди" : "Generate queued FRAME",
    );
    assert.equal(h.f.providerCalls(), 1);
    assert.equal(h.sends.length, 1);
    assert.equal(h.sends[0].action, "media.dispatch");
    const original = structuredClone(h.sends[0]);
    h.f.proof.canonGeneration++;
    h.render();
    await h.click(
      language === "ru"
        ? "Повторить тот же запрос FRAME"
        : "Retry exact FRAME request",
    );
    assert.deepEqual(h.sends.at(-1), original);
    assert.equal(h.f.providerCalls(), 1);
    assert.equal(h.refreshes(), 2);
  });
test("queued history cannot silently use an unconfigured model", async () => {
  const h = await uiHarness({ history: true, enabled: false });
  await h.f.queue();
  h.render();
  await h.click("Generate queued FRAME");
  assert.equal(h.f.providerCalls(), 0);
  assert.equal(h.sends.length, 0);
  assert.match(h.text(), /could not be confirmed/);
});
