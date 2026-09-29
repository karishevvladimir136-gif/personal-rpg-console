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
import {
  parseBootstrapDraft,
  restoreBootstrapCommand,
  createBootstrapTransport,
} from "../src/lib/adventures/bootstrap-client.ts";
import { fixture, id } from "./adventure-v1-fixtures.mjs";
const root = fileURLToPath(new URL("../src/", import.meta.url)),
  require = createRequire(import.meta.url),
  cache = new Map();
function ui(relative) {
  function load(path) {
    if (cache.has(path)) return cache.get(path);
    const mod = { exports: {} };
    cache.set(path, mod.exports);
    const compiled = ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    const localRequire = (name) => {
      if (name.endsWith(".css") || name === "server-only") return {};
      if (name.startsWith(".")) {
        const p = resolve(dirname(path), name);
        return load(
          existsSync(p) ? p : existsSync(`${p}.tsx`) ? `${p}.tsx` : `${p}.ts`,
        );
      }
      return require(name);
    };
    vm.runInThisContext(`(function(require,module,exports){${compiled}\n})`, {
      filename: path,
    })(localRequire, mod, mod.exports);
    cache.set(path, mod.exports);
    return mod.exports;
  }
  return load(resolve(root, relative));
}
const noCall = () => assert.fail("No network/model/write at render"),
  render = (Component, props) =>
    renderToStaticMarkup(createElement(Component, props));
const bootstrapText = ui("components/bootstrap/review.tsx").bootstrapText;
for (const language of ["en", "ru"])
  test(`${language} ordinary Campaign path leads with Name / Who are you, no required mechanics, preserves Advanced starter`, () => {
    const c = bootstrapText(language),
      f = fixture();
    const html = render(
      ui("components/bootstrap/new-campaign.tsx").NewCampaignForm,
      {
        language,
        onDirty: noCall,
        onCreated: noCall,
        onCancel: noCall,
        initialWorlds: f.worlds,
        transport: { worlds: noCall },
        bootstrapTransport: { proposeCharacter: noCall },
        persistPending: false,
      },
    );
    for (const s of [c.name, c.who, c.intro, c.prepare, c.advanced, c.fighter])
      assert.ok(
        html.includes(s.replaceAll("&", "&amp;").replaceAll("'", "&#x27;")),
        s,
      );
    assert.doesNotMatch(html, /<input[^>]+name="(?:hp|level|class|slots)"/);
    assert.equal((html.match(/<textarea/g) || []).length, 1);
  });
for (const language of ["en", "ru"])
  test(`${language} all proposed fields are manually editable, consequential answers visible, authority IDs never editable`, () => {
    const c = bootstrapText(language),
      m = ui("components/bootstrap/review.tsx");
    const review = {
      name: "Lattice",
      description: "Non-humanoid explorer",
      capabilities: ["observation"],
      limitations: ["cannot leave"],
      possessions: [{ name: "tool", description: "known", quantity: null }],
      resources: [{ key: "charge", label: "Charge", amount: null }],
      answers: [null],
    };
    const html = render(m.CharacterReview, {
      language,
      value: review,
      onChange: noCall,
      questions: [{ question: "How much?", consequential: true }],
    });
    for (const label of [
      c.name,
      c.who,
      c.capabilities,
      c.limitations,
      c.possessions,
      c.resources,
      c.required,
      c.quantity,
      c.amount,
      c.valueRequired,
    ])
      assert.ok(html.includes(label));
    assert.equal((html.match(/aria-invalid="true"/g) || []).length, 2);
    assert.equal(
      (html.match(new RegExp(c.valueRequired, "g")) || []).length,
      2,
    );
    assert.doesNotMatch(
      html,
      /owner_id|entity_id|storage_id|equipment_slot|canonical|type="hidden"/,
    );
    const opening = render(m.OpeningReviewFields, {
      language,
      value: {
        location: { name: null, description: null },
        situation: null,
        narration: null,
        actors: [
          {
            name: "Coordinator",
            description: "Public",
            capabilities: [],
            limitations: [],
          },
        ],
        answers: [null],
        publicOpeningConfirmed: false,
      },
      onChange: noCall,
      questions: [{ question: "Which station?", consequential: true }],
    });
    for (const label of [
      c.location,
      c.situation,
      c.narration,
      c.actors,
      c.actorsHelp,
      c.confirm,
      c.required,
    ])
      assert.ok(opening.includes(label));
  });
test("Pending command recovery is exact; invalid cache never grants state authority or a replacement attempt", () => {
  const f = fixture(),
    command = {
      action: "opening.propose",
      input: {
        action: "start",
        input: {
          requestId: id(80),
          campaignId: f.catalog.campaignId,
          timeline: f.catalog.timeline,
          expectedRevision: f.catalog.revision,
          expectedRuntimeRevision: f.catalog.runtimeRevision,
          expectedHeadId: f.catalog.expectedHeadId,
          adventureId: f.adventure.id,
          expectedAdventureVersion: 1,
        },
      },
    };
  assert.deepEqual(restoreBootstrapCommand(JSON.stringify(command)), command);
  assert.equal(
    restoreBootstrapCommand(JSON.stringify({ ...command, authority: true })),
    null,
  );
  assert.equal(restoreBootstrapCommand("{bad"), null);
});
test("Client rejects extra private fields, mismatched drafts and uncertainty rather than auto-approving", async () => {
  const f = fixture();
  const input = {
    requestId: id(70),
    worldId: f.world.id,
    worldVersion: 1,
    title: "New",
    language: "en",
    name: "Explorer",
    description: "careful observation",
  };
  const draft = {
    kind: "creation",
    draftId: input.requestId,
    input,
    proposal: {
      schemaVersion: 1,
      capabilities: [],
      limitations: [],
      possessions: [],
      resources: [],
      questions: [],
    },
    usage: {
      model: "gpt-6-sol",
      inputTokens: 10,
      outputTokens: 20,
      latencyMs: 1,
    },
  };
  assert.deepEqual(parseBootstrapDraft(draft), draft);
  assert.throws(() =>
    parseBootstrapDraft({ ...draft, privateState: { secret: "canary" } }),
  );
  assert.throws(() => parseBootstrapDraft({ ...draft, draftId: id(99) }));
  let attempts = 0;
  const transport = createBootstrapTransport(async () => {
    attempts++;
    throw new Error("lost response");
  });
  await assert.rejects(
    transport.proposeCharacter(input),
    (e) => e.code === "uncertain",
  );
  assert.equal(attempts, 1);
});
test("Normal wiring uses reviewed bootstrap, confirmed Start → Game, and keeps the compatibility component intact", () => {
  const creation = readFileSync(
      new URL("../src/components/persistent-campaigns.tsx", import.meta.url),
      "utf8",
    ),
    adventures = readFileSync(
      new URL(
        "../src/components/adventures/adventures-panel.tsx",
        import.meta.url,
      ),
      "utf8",
    );
  assert.match(creation, /bootstrap\/new-campaign/);
  assert.match(adventures, /catalog\.requiresOpening/);
  assert.match(adventures, /setOpeningStart\(command\)/);
  assert.match(
    adventures,
    /await onSaved\(\);\s*await load\(\);\s*if\s*\(mounted.current\)/,
  );
});
