import assert from "node:assert/strict";
import { randomUUID, webcrypto } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";
import * as visual from "../src/lib/visual-frame/model.ts";
import * as subjectJobs from "../src/lib/visual-frame/subject-job.ts";
import * as realFrame from "../src/lib/visual-frame/real-frame.ts";
import * as mediaClient from "../src/lib/visual-frame/media-client.ts";
import { sourceSnapshot, model, parameters } from "./media-frame-fixture.mjs";

const require = createRequire(import.meta.url);
const flush = () => new Promise((resolve) => setImmediate(resolve));

function compiled(path, dependencies) {
  const source = readFileSync(new URL("../" + path, import.meta.url), "utf8");
  const compiledModule = { exports: {} };
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  runInNewContext(output, {
    module: compiledModule,
    exports: compiledModule.exports,
    crypto: webcrypto,
    structuredClone,
    require: (name) => dependencies[name] ??
      (name === "react/jsx-runtime" ? require(name) : {}),
  });
  return compiledModule.exports;
}

async function harness(status, failure = null, ageMs = 0) {
  const snapshot = structuredClone(sourceSnapshot);
  const subject = { kind: "entity", id: snapshot.entities[0].id };
  const job = subjectJobs.buildSubjectVisualJob(snapshot, subject, [], model,
    parameters, { expectedHeadId: null, canonGeneration: 0 });
  const record = {
    id: randomUUID(), campaign_id: snapshot.campaign.id, revision: 2,
    current_version_id: randomUUID(),
    updated_at: new Date(Date.now() - ageMs).toISOString(),
    title: "Synthetic portrait", status: "reference",
    body: visual.VISUAL_FRAME_PREFIX + JSON.stringify({
      ...job, status, failure,
      dispatch: status === "queued" ? null : {
        requestId: randomUUID(), reservationUsdMicros: 400000,
      },
    }),
  };
  snapshot.documents.push(record);
  const state = [], refs = [], effectDeps = [], effects = [];
  let cursor = 0, refCursor = 0, effectCursor = 0, refreshes = 0, sends = 0;
  const react = {
    useState(initial) {
      const i = cursor++;
      if (!(i in state)) state[i] = typeof initial === "function" ? initial() : initial;
      return [state[i], (next) => { state[i] = typeof next === "function" ? next(state[i]) : next; }];
    },
    useRef(initial) {
      const i = refCursor++;
      return refs[i] ?? (refs[i] = { current: initial });
    },
    useEffect(fn, deps) {
      const i = effectCursor++;
      if (!effectDeps[i] || JSON.stringify(deps) !== JSON.stringify(effectDeps[i])) {
        effectDeps[i] = deps;
        effects.push(fn);
      }
    },
  };
  const jsx = (type, props) => ({ type, props });
  const transport = {
    capability: async () => ({ enabled: true, reservationUsdMicros: 400000 }),
    send: async () => { sends++; throw Error("unexpected mutation"); },
    prepareSubject: async () => { throw Error("unexpected prepare"); },
  };
  const component = compiled("src/components/visual-frame/generate-visual.tsx", {
    react,
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "next/image": { default: "img" },
    "../persistence-context": { useOptionalCampaignData: () => ({
      data: snapshot, refresh: async () => { refreshes++; },
    }) },
    "../language-context": { useLanguage: () => ({ language: "en" }) },
    "../ui": { Button: "button" },
    "@/lib/persistence/client": {},
    "@/lib/visual-frame/model": visual,
    "@/lib/visual-frame/media-client": { defaultMediaFrameTransport: {} },
    "@/lib/visual-frame/subject-job": subjectJobs,
    "@/lib/visual-frame/real-frame": realFrame,
    "./subject-visual": { SubjectVisual: "subject-visual" },
  }).GenerateVisual;
  const h = { snapshot, record, subject, transport };
  h.render = () => {
    cursor = 0; refCursor = 0; effectCursor = 0;
    h.tree = component({ subject, transport });
    for (const effect of effects.splice(0)) effect();
    return h.tree;
  };
  h.nodes = () => {
    const all = [];
    const walk = (node) => {
      if (Array.isArray(node)) return node.forEach(walk);
      if (!node?.props) return;
      all.push(node);
      walk(node.props.children);
    };
    walk(h.tree);
    return all;
  };
  const text = (node) => typeof node === "string" ? node :
    Array.isArray(node) ? node.map(text).join("") :
    node?.props ? text(node.props.children) : "";
  h.text = () => text(h.tree);
  h.button = (label) => h.nodes().find((node) =>
    node.type === "button" && text(node) === label);
  h.click = async (label) => {
    const button = h.button(label);
    assert.ok(button, label);
    assert.equal(Boolean(button.props.disabled), false);
    button.props.onClick();
    await flush();
    h.render();
  };
  h.refreshes = () => refreshes;
  h.sends = () => sends;
  h.render();
  await flush();
  h.render();
  return h;
}

test("terminal portrait review failure shows saved status without offering recovery or dispatch", async () => {
  const h = await harness("failed", "grounding");
  assert.match(h.text(), /did not pass review/);
  assert.match(h.text(), /Saved image requests/);
  assert.match(h.text(), /No usable draft/);
  assert.equal(h.button("Recover saved image"), undefined);
  assert.equal(h.sends(), 0);
});

test("terminal uncertain portrait does not promise unpaid recovery", async () => {
  const h = await harness("uncertain", "uncertain");
  assert.match(h.text(), /without a confirmed draft/);
  assert.match(h.text(), /new generation needs a separate priced confirmation/);
  assert.equal(h.button("Recover saved image"), undefined);
  assert.equal(h.sends(), 0);
});

test("refreshing a generating image is read-only; recovery remains a separate explicit action", async () => {
  const h = await harness("generating", null, realFrame.FRAME_RECOVERY_AFTER_MS + 1000);
  assert.ok(h.button("Recover saved image"));
  await h.click("Refresh saved status");
  assert.equal(h.refreshes(), 1);
  assert.equal(h.sends(), 0);
  assert.match(h.text(), /review may use its existing reservation/);
});

test("an unconfirmed subject-image dispatch reuses its exact request identity", async () => {
  const snapshot = structuredClone(sourceSnapshot);
  const subject = { kind: "entity", id: snapshot.entities[0].id };
  const job = subjectJobs.buildSubjectVisualJob(snapshot, subject, [], model,
    parameters, { expectedHeadId: null, canonGeneration: 0 });
  const attempt = mediaClient.createSubjectVisualAttempt(snapshot, job, 400000);
  const sent = [];
  let lost = true, loads = 0;
  const transport = {
    send: async (command) => {
      sent.push(structuredClone(command));
      if (command.action === "media.save") {
        const id = randomUUID();
        snapshot.documents.push({
          ...command.input.payload,
          id,
          campaign_id: snapshot.campaign.id,
          revision: 1,
          current_version_id: randomUUID(),
          updated_at: new Date().toISOString(),
        });
        return { result: { id, revision: 1 } };
      }
      if (lost) {
        lost = false;
        throw Error("lost-dispatch-response");
      }
      return { status: "generating" };
    },
    load: async () => { loads++; return snapshot; },
  };
  await assert.rejects(mediaClient.finishSubjectVisualAttempt(attempt, transport));
  const exactDispatch = structuredClone(sent.at(-1));
  assert.equal(exactDispatch.action, "media.dispatch");
  await mediaClient.finishSubjectVisualAttempt(attempt, transport);
  assert.deepEqual(sent.at(-1), exactDispatch);
  assert.deepEqual(sent.map((entry) => entry.action), [
    "media.save", "media.dispatch", "media.dispatch",
  ]);
  assert.equal(loads, 1);
});
