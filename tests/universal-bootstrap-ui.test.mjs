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
import {
  creationMissingDetails,
  creationQuestionIsNumeric,
  creationReviewForCommit,
} from "../src/lib/adventures/bootstrap-review.ts";
import { parseCreationReview } from "../src/lib/adventures/bootstrap-validation.ts";
import { fixture, id } from "./adventure-v1-fixtures.mjs";
const root = fileURLToPath(new URL("../src/", import.meta.url)),
  require = createRequire(import.meta.url),
  cache = new Map();
function ui(relative, bootstrapState = null) {
  const modules = bootstrapState ? new Map() : cache;
  function load(path) {
    if (bootstrapState && path.endsWith("use-bootstrap.ts"))
      return { useBootstrap: () => bootstrapState };
    if (modules.has(path)) return modules.get(path);
    const mod = { exports: {} };
    modules.set(path, mod.exports);
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
    modules.set(path, mod.exports);
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
test("Numeric-only legacy clarifications resolve from one reviewed field, while consequential and ambiguous questions remain gated", () => {
  const questions = [
    { question: "How many arrows?", consequential: true },
    { question: "How much coin?", consequential: true },
    { question: "What kind of arrows?", consequential: true },
  ];
  const review = {
    name: "Mara", description: "A mapmaker", capabilities: [], limitations: [],
    possessions: [{ name: "arrows", description: "", quantity: null }],
    resources: [{ key: "coin", label: "coin", amount: null }],
    answers: [null, null, null],
  };
  const proposal = { schemaVersion: 1, capabilities: [], limitations: [], possessions: [], resources: [], questions };
  assert.equal(creationMissingDetails(review, questions), 3);
  assert.equal(creationQuestionIsNumeric(questions[0], review), true);
  assert.equal(creationQuestionIsNumeric(questions[1], review), true);
  assert.equal(creationQuestionIsNumeric(questions[2], review), false);
  assert.throws(() => parseCreationReview(creationReviewForCommit(review, questions), proposal));
  const corrected = { ...review, possessions: [{ ...review.possessions[0], quantity: 50 }], resources: [{ ...review.resources[0], amount: 0 }], answers: [null, null, "Ordinary arrows"] };
  const committed = creationReviewForCommit(corrected, questions);
  assert.deepEqual(committed.answers, ["50 arrows", "0 coin", "Ordinary arrows"]);
  assert.deepEqual(parseCreationReview(committed, proposal), committed);
  assert.deepEqual(review.answers, [null, null, null]);
  assert.deepEqual(proposal.questions, questions);
  assert.equal(creationMissingDetails(corrected, questions), 0);
  assert.equal(creationQuestionIsNumeric({ question: "How many arrows or bolts?", consequential: true }, corrected), false);
  assert.equal(creationQuestionIsNumeric({ question: "How much coin and which denomination?", consequential: true }, corrected), false);
  assert.equal(creationQuestionIsNumeric({ question: "Сколько стрел?", consequential: true }, { ...corrected, possessions: [{ name: "стрел", description: "", quantity: 50 }] }), true);
});
test("One final Create action stays blocked for missing numbers and accepts a fully corrected sheet with blank optional description", () => {
  const f = fixture();
  const questions = [{ question: "How many arrows?", consequential: true }];
  const proposal = { schemaVersion: 1, capabilities: [], limitations: [], possessions: [], resources: [], questions };
  const review = { name: "Mara", description: "Mapmaker", capabilities: [], limitations: [],
    possessions: [{ name: "arrows", description: "", quantity: null }], resources: [], answers: [null] };
  const state = { draft: { kind: "creation", draftId: id(83), input: { worldId: f.world.id }, proposal },
    review, pending: null, busy: false, ready: true, error: false,
    execute: noCall, resetProposal: noCall, setReview: noCall };
  const props = { language: "en", onDirty: noCall, onCreated: noCall, onCancel: noCall,
    initialWorlds: f.worlds, transport: { worlds: noCall }, persistPending: false };
  const blocked = render(ui("components/bootstrap/new-campaign.tsx", state).NewCampaignForm, props);
  assert.match(blocked, /<button[^>]*disabled=""[^>]*>Create protagonist and campaign<\/button>/);
  const ready = render(ui("components/bootstrap/new-campaign.tsx", {
    ...state, review: { ...review, possessions: [{ ...review.possessions[0], quantity: 50 }] },
  }).NewCampaignForm, props);
  assert.match(ready, /<button[^>]*>Create protagonist and campaign<\/button>/);
  assert.doesNotMatch(ready, /<button[^>]*disabled=""[^>]*>Create protagonist and campaign<\/button>/);
});
for (const language of ["en", "ru"]) {
  test(`${language} consolidated sheet shows compact gear, missing values once, and optional corrections`, () => {
    const c = bootstrapText(language);
    const review = {
      name: "Mara", description: "Travelling mapmaker", capabilities: ["navigation"],
      limitations: ["avoids violence"],
      possessions: [
        { name: "Weatherproof cloak", description: "", quantity: 1 },
        { name: "arrows", description: "", quantity: null },
      ],
      resources: [], answers: [null],
    };
    const html = render(ui("components/bootstrap/review.tsx").CharacterReview, {
      language, value: review, onChange: noCall,
      questions: [{ question: "How many arrows?", consequential: true }],
    });
    for (const s of ["Mara", "navigation", "avoids violence", "Weatherproof cloak", "×1", c.correctProtagonist, c.correctItem, c.missingDetails(1)])
      assert.ok(html.includes(s), s);
    assert.doesNotMatch(html, /How many arrows\?/);
    assert.match(html, /<details/);
    assert.equal((html.match(/aria-invalid="true"/g) || []).length, 1);
    assert.ok(html.indexOf("Weatherproof cloak") < html.indexOf(c.correctItem));
    assert.match(html, /max="1000"/);
  });
  test(`${language} active Adventure opening prepares without recovery; interrupted exact request offers recovery`, () => {
    const c = bootstrapText(language), campaignId = id(84);
    const pending = { action: "opening.propose", input: { requestId: id(85), campaignId } };
    const base = {
      pending, draft: null, review: null, ready: true, error: false,
      execute: noCall, resetProposal: noCall, setReview: noCall,
    };
    const props = { campaignId, start: { requestId: id(86), campaignId },
      language, persistPending: false, onDirty: noCall, onStarted: noCall,
      onCancel: noCall };
    const opening = (state) => render(ui("components/bootstrap/opening.tsx", state).OpeningBootstrap, props);
    const active = opening({ ...base, busy: true });
    assert.ok(active.includes(c.preparing));
    assert.ok(!active.includes(c.pending));
    assert.ok(!active.includes(c.recover));
    const interrupted = opening({ ...base, busy: false });
    assert.ok(interrupted.includes(c.pending));
    assert.ok(interrupted.includes(c.recover));
    assert.ok(!interrupted.includes(c.preparing));
    const failed = opening({ ...base, busy: false, error: true });
    assert.ok(failed.includes(c.recover));
    assert.ok(failed.includes(c.newProposal));
    const committed = opening({ ...base, pending: null, busy: false });
    assert.ok(!committed.includes(c.recover));
    assert.ok(!committed.includes(c.pending));
    const committing = opening({ ...base,
      pending: { action: "opening.commit", input: { requestId: id(87), campaignId } },
      busy: true });
    assert.ok(committing.includes(c.starting));
    assert.ok(!committing.includes(c.recover));
  });
  test(`${language} active proposal has preparing state, interrupted exact request has recovery state`, () => {
    const c = bootstrapText(language), f = fixture();
    const base = {
      pending: { action: "creation.propose", input: { requestId: id(82) } },
      draft: null, review: null, ready: true, error: false,
      execute: noCall, resetProposal: noCall, setReview: noCall,
    };
    const props = { language, onDirty: noCall, onCreated: noCall, onCancel: noCall,
      initialWorlds: f.worlds, transport: { worlds: noCall }, persistPending: false };
    const active = render(ui("components/bootstrap/new-campaign.tsx", { ...base, busy: true }).NewCampaignForm, props);
    assert.ok(active.includes(c.preparing));
    assert.ok(!active.includes(c.pending));
    assert.ok(!active.includes(c.recover));
    const interrupted = render(ui("components/bootstrap/new-campaign.tsx", { ...base, busy: false }).NewCampaignForm, props);
    assert.ok(interrupted.includes(c.pending));
    assert.ok(interrupted.includes(c.recover));
    assert.ok(!interrupted.includes(c.preparing));
  });
}
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
