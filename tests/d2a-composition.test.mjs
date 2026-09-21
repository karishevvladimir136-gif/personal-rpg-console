import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { readFileSync } from "node:fs";
import {
  compositionFixture,
  compositionResponse,
  id,
  owner,
} from "./d2a-composition-fixtures.mjs";
import {
  approveCompositionPlan,
  buildCompositionBasis,
  compositionApprovalBlockers,
  editCompositionPlan,
  parseCompositionMetadata,
  prepareCompositionRequest,
  projectComposition,
  recordCompositionPlan,
} from "../src/lib/world-lab/composition.ts";
import {
  parseCompositionProposal,
  parseCompositionReview,
  validateCompositionProposal,
} from "../src/lib/world-lab/composition-validation.ts";
import {
  parseDivergence,
  parseScenario,
  sha256,
} from "../src/lib/world-library/parsers.ts";

const hook = registerHooks({
  resolve(specifier, context, nextResolve) {
    return specifier === "server-only"
      ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
      : nextResolve(specifier, context);
  },
});
const {
  createComposerProvider,
  compositionProposalSchema,
  composerInstructions,
} = await import("../src/lib/server/world-lab/composer-provider.ts");
hook.deregister();
const review = (f) => recordCompositionPlan(f.requested, f.proposal, f.usage);
const approve = (f, body = review(f), basis = f.basis) =>
  approveCompositionPlan(body, {
    basis,
    ownerId: owner,
    scenarioVersionId: id(),
    allocateId: id,
  });
const provider = (fetcher, extra = {}) =>
  createComposerProvider({
    apiKey: "scripted-test-only",
    model: "gpt-6-astra",
    reasoning: "max",
    fetcher,
    ...extra,
  });

test("composition pins exact saved basis and public context, with no previous Scenario requirement", () => {
  const f = compositionFixture();
  const before = structuredClone(f.state),
    context = prepareCompositionRequest(f.requested.composition);
  assert.deepEqual(f.state, before);
  const serialized = JSON.stringify(context.data);
  for (const secret of [
    "PRIVATE_GUIDANCE",
    "PRIVATE_CLAIM_CANARY",
    "PRIVATE_THREAD_CANARY",
    "PRIVATE_STEP_CANARY",
    "SECRET_THREAD_ONLY",
    owner,
    f.state.campaignId,
    f.source.id,
    f.source.versionId,
    f.state.manifest.id,
  ])
    assert.ok(!serialized.includes(secret), secret);
  assert.match(serialized, /FUTURE_TRAP/);
  assert.match(serialized, /PUBLIC_SOURCE_DATA/);
  assert.ok(
    context.data.evidence.some((e) => e.knowledge === "canon_at_entry"),
  );
  assert.ok(
    context.data.evidence.some(
      (e) =>
        e.knowledge === "character" &&
        e.knownActorIndexes.includes(f.actorIndex),
    ),
  );
  assert.equal(f.requested.composition.phase, "requested");
  assert.equal(f.requested.composition.originalProposal, null);
  assert.equal(f.requested.approval, null);
  f.binding.scenarioVersionId = null;
  f.state.libraryRecords = [f.source, f.pack];
  assert.deepEqual(buildCompositionBasis(f.base()).basis.packVersionIds, [
    f.pack.versionId,
  ]);
  const original = compositionFixture({ sourceFree: true });
  assert.equal(original.choices.evidence.length, 0);
  assert.equal(approve(original).scenario.status, "approved");
});

test("only positive current Actor knowledge is offered; restriction and future provenance cannot be upgraded", () => {
  const f = compositionFixture();
  f.world.actors.find((a) => a.id === f.actorId).knowledge = [];
  let prepared = buildCompositionBasis(f.base());
  assert.ok(
    prepared.choices.evidence.every((e) => e.knowledge !== "character"),
  );
  f.state.restrictions.push({
    campaign_id: f.state.campaignId,
    kind: "library_source",
    source_id: f.source.id,
  });
  prepared = buildCompositionBasis(f.base());
  assert.equal(prepared.choices.evidence.length, 0);
  f.state.restrictions = [];
  f.source.body.knowledge = "future_source";
  prepared = buildCompositionBasis(f.base());
  assert.ok(
    prepared.choices.evidence.every((e) => e.knowledge === "future_source"),
  );
});

test("accepted span hashes are reused and uncertain existing claims never become unqualified facts", () => {
  const f = compositionFixture();
  f.source.body.extraction.version = "text-evidence-v1";
  for (const claim of f.pack.body.claims)
    for (const e of claim.evidence) {
      e.locator.value = "2:6";
      e.digest = sha256(f.source.body.original.text.slice(2, 6));
    }
  f.world.actors.find((a) => a.id === f.actorId).knowledge = structuredClone(
    f.pack.body.claims[0].evidence,
  );
  assert.ok(buildCompositionBasis(f.base()).choices.evidence.length > 0);
  for (const claim of f.pack.body.claims) claim.epistemic = "rumor";
  assert.equal(buildCompositionBasis(f.base()).choices.evidence.length, 0);
  for (const claim of f.pack.body.claims) {
    claim.epistemic = "fact";
    claim.origin = "source_inference";
    claim.uncertainty = "Possible interpretation only.";
  }
  assert.equal(buildCompositionBasis(f.base()).choices.evidence.length, 0);
});

test("base rejects cross-owner/membership/canon/source corrections and unstable pending work", () => {
  for (const mutate of [
    (f) => {
      f.state.manifest.canonGeneration++;
    },
    (f) => {
      f.state.manifest.publicMetadata.pendingAction = true;
    },
    (f) => {
      f.binding.ownerId = id();
    },
    (f) => {
      f.authority.sourceHeads[0].versionId = id();
    },
    (f) => {
      f.pack.body.claims[0].evidence[0].digest = "0".repeat(64);
    },
    (f) => {
      f.state.records["public.rpg_pending_actions"].push({
        id: id(),
        campaign_id: f.state.campaignId,
        status: "awaiting",
      });
    },
  ]) {
    const f = compositionFixture();
    mutate(f);
    assert.throws(() => buildCompositionBasis(f.base()));
  }
  const f = compositionFixture(),
    base = f.base();
  f.state.records[
    "rpg_private.world_foundations"
  ][0].world.actors[0].publicName = "Changed without vault membership";
  assert.throws(() => buildCompositionBasis(base));
});

test("strict model and manual fields reject IDs, authority, patches, oversized values and unknown choice indexes", () => {
  const f = compositionFixture();
  for (const mutate of [
    (p) => {
      p.approval = true;
    },
    (p) => {
      p.actorId = id();
    },
    (p) => {
      p.patch = {};
    },
    (p) => {
      p.sourceVersionIds = [id()];
    },
    (p) => {
      p.affectedActorIndexes = [63];
    },
    (p) => {
      p.affectedThreadIndexes = [0, 0];
    },
    (p) => {
      p.locationIndex = -1;
    },
    (p) => {
      p.title = "x".repeat(161);
    },
    (p) => {
      p.horizonMinutes = 43201;
    },
    (p) => {
      p.offsetMinutes = 0.1;
    },
    (p) => {
      p.policy.autonomy = "unbounded";
    },
  ]) {
    const p = structuredClone(f.proposal);
    mutate(p);
    assert.throws(() => validateCompositionProposal(p, f.choices));
  }
  const r = review(f).composition.review;
  assert.throws(() => parseCompositionReview({ ...r, ownerId: owner }));
  assert.throws(() =>
    parseCompositionProposal({ ...f.proposal, ambiguityAnswers: [] }),
  );
});

test("source facts require exact authorized evidence; inference, future and character labels stay separate", () => {
  const f = compositionFixture();
  const future = f.choices.evidence.findIndex(
    (e) => e.knowledge === "future_source",
  );
  const character = f.choices.evidence.findIndex(
    (e) => e.knowledge === "character",
  );
  const statement = {
    text: f.choices.evidence[future].text,
    origin: "source_fact",
    knowledge: "future_source",
    evidenceIndexes: [future],
    actorIndexes: [],
    uncertainty: null,
  };
  const proposal = { ...f.proposal, statements: [statement] };
  assert.deepEqual(
    validateCompositionProposal(proposal, f.choices).statements[0],
    statement,
  );
  for (const extra of [
    { knowledge: "canon_at_entry" },
    { knowledge: "character", actorIndexes: [f.actorIndex] },
    { text: "Invented source fact" },
    { evidenceIndexes: [95] },
    { origin: "source_inference", uncertainty: null },
    { origin: "owner_assumption", knowledge: "owner_assumption" },
  ])
    assert.throws(() =>
      validateCompositionProposal(
        { ...proposal, statements: [{ ...statement, ...extra }] },
        f.choices,
      ),
    );
  const known = {
    ...statement,
    text: f.choices.evidence[character].text,
    knowledge: "character",
    evidenceIndexes: [character],
    actorIndexes: [f.actorIndex],
  };
  assert.doesNotThrow(() =>
    validateCompositionProposal(
      { ...proposal, statements: [known] },
      f.choices,
    ),
  );
  const unknownActor = f.choices.actors.findIndex((a) => a.id === f.playerId);
  assert.throws(() =>
    validateCompositionProposal(
      { ...proposal, statements: [{ ...known, actorIndexes: [unknownActor] }] },
      f.choices,
    ),
  );
});

test("material owner edits retain original provider proposal, remove approval and keep explicit provenance", () => {
  const f = compositionFixture(),
    draft = review(f),
    original = structuredClone(draft),
    previous = id();
  const edited = editCompositionPlan(draft, {
    ownerId: owner,
    fromVersionId: previous,
    review: {
      ...draft.composition.review,
      title: "Owner-corrected title",
      changeDescription: "Mara instead closes only the western gate.",
      assumptions: ["This timing is an explicit owner assumption."],
    },
  });
  assert.deepEqual(draft, original);
  assert.deepEqual(edited.composition.originalProposal, f.proposal);
  assert.deepEqual(edited.composition.ownerEdit, {
    ownerId: owner,
    fromVersionId: previous,
    fields: ["title", "changeDescription", "assumptions"],
  });
  assert.equal(edited.status, "draft");
  assert.equal(edited.approval, null);
  const approved = approve(f, edited);
  assert.equal(approved.scenario.status, "approved");
  assert.equal(
    approved.divergence.changes[0].text,
    edited.composition.review.changeDescription,
  );
  assert.doesNotThrow(() => {
    const { composition: _metadata, ...body } = approved.scenario;
    void _metadata;
    parseScenario(body);
    parseDivergence(approved.divergence);
  });
  const again = editCompositionPlan(approved.scenario, {
    ownerId: owner,
    fromVersionId: id(),
    review: { ...edited.composition.review, title: "Further correction" },
  });
  assert.equal(again.approval, null);
  assert.equal(again.composition.phase, "review");
  assert.throws(() =>
    editCompositionPlan(draft, {
      ownerId: id(),
      fromVersionId: previous,
      review: edited.composition.review,
    }),
  );
  assert.throws(() =>
    editCompositionPlan(draft, {
      ownerId: owner,
      fromVersionId: previous,
      review: draft.composition.review,
    }),
  );
});

test("consequential ambiguity blocks approval until owner answers; its question cannot be deleted", () => {
  const f = compositionFixture();
  f.proposal.ambiguities = [
    { question: "Which gate remains open?", consequential: true },
  ];
  const draft = review(f);
  assert.deepEqual(compositionApprovalBlockers(draft.composition), [
    "ambiguity_unresolved",
  ]);
  assert.throws(() => approve(f, draft));
  assert.throws(() =>
    editCompositionPlan(draft, {
      ownerId: owner,
      fromVersionId: id(),
      review: { ...draft.composition.review, ambiguityAnswers: [] },
    }),
  );
  const edited = editCompositionPlan(draft, {
    ownerId: owner,
    fromVersionId: id(),
    review: {
      ...draft.composition.review,
      ambiguityAnswers: [
        "Only the eastern gate; the western gate follows baseline.",
      ],
    },
  });
  assert.equal(approve(f, edited).scenario.status, "approved");
  assert.deepEqual(
    edited.composition.originalProposal.ambiguities,
    f.proposal.ambiguities,
  );
});

test("unsupported rules/control/policy, unmapped scope and out-of-horizon timing remain explicit blockers", () => {
  const f = compositionFixture(),
    d = review(f),
    player = f.choices.actors.findIndex((a) => a.id === f.playerId);
  for (const [fields, blocker] of [
    [{ divergenceType: "rule" }, "unsupported_divergence"],
    [{ affectedActorIndexes: [player] }, "player_agency"],
    [{ affectedActorIndexes: [], affectedThreadIndexes: [] }, "scope_required"],
    [{ offsetMinutes: 120 }, "timing_outside_horizon"],
    [
      { policy: { ...d.composition.review.policy, autonomy: "high" } },
      "unsupported_policy",
    ],
  ]) {
    const edited = editCompositionPlan(d, {
      ownerId: owner,
      fromVersionId: id(),
      review: { ...d.composition.review, ...fields },
    });
    assert.ok(
      compositionApprovalBlockers(edited.composition).includes(blocker),
    );
    assert.throws(() => approve(f, edited));
  }
});

test("basis and profile remain immutable through approval; source/canon/document changes invalidate", () => {
  const f = compositionFixture(),
    draft = review(f);
  for (const change of [
    (b) => {
      b.canonGeneration++;
    },
    (b) => {
      b.sourceHeads[0].versionId = id();
    },
    (b) => {
      b.documents[0].digest = "0".repeat(64);
    },
    (b) => {
      b.baseTimelineId = id();
    },
    (b) => {
      b.baseManifestId = id();
    },
  ]) {
    const changed = structuredClone(f.basis);
    change(changed);
    assert.throws(() => approve(f, draft, changed));
  }
  const edited = editCompositionPlan(draft, {
    ownerId: owner,
    fromVersionId: id(),
    review: draft.composition.review,
    simulationProfile: {
      ...draft.composition.simulationProfile,
      id: id(),
      reasoning: "high",
    },
  });
  assert.equal(edited.composition.simulationProfile.reasoning, "high");
  assert.deepEqual(
    edited.composition.composeProfile,
    draft.composition.composeProfile,
  );
  assert.ok(edited.composition.ownerEdit.fields.includes("simulationProfile"));
  assert.throws(() =>
    parseCompositionMetadata({
      ...draft.composition,
      composeProfile: { ...draft.composition.composeProfile, reasoning: null },
    }),
  );
});

test("public projection has no private provenance IDs; browser leaf has no private import graph", () => {
  const f = compositionFixture(),
    projection = projectComposition(review(f).composition),
    serialized = JSON.stringify(projection);
  for (const value of [
    owner,
    f.state.campaignId,
    f.state.manifest.id,
    f.actorId,
    f.source.id,
    f.source.versionId,
    f.requested.composition.composeProfile.id,
    "PRIVATE_CLAIM_CANARY",
    "PRIVATE_GUIDANCE",
  ])
    assert.ok(!serialized.includes(value), value);
  assert.equal(projection.selectedModel.modelId, "gpt-6-astra");
  assert.ok(
    !/\bimport\s/.test(
      readFileSync(
        new URL("../src/lib/world-lab/composition-public.ts", import.meta.url),
        "utf8",
      ),
    ),
  );
  assert.ok(
    !/server-contracts|composition-contracts|node:/.test(
      readFileSync(
        new URL(
          "../src/lib/world-lab/composition-validation.ts",
          import.meta.url,
        ),
        "utf8",
      ),
    ),
  );
});

test("production composer uses the accepted strict transport exactly once, retaining pinned actual usage", async () => {
  const f = compositionFixture(),
    calls = [],
    attempts = [];
  const result = await provider(
    async (url, init) => {
      calls.push({ url, body: JSON.parse(init.body) });
      return compositionResponse(f.proposal, "gpt-6-astra-2026-09-01");
    },
    { observer: (a) => attempts.push(a) },
  )(f.requested.composition);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.openai.com/v1/responses");
  const body = calls[0].body;
  assert.equal(body.model, "gpt-6-astra");
  assert.equal(body.reasoning.effort, "max");
  assert.equal(body.store, false);
  assert.equal(body.truncation, "disabled");
  assert.equal(body.text.format.strict, true);
  assert.deepEqual(body.text.format.schema, compositionProposalSchema);
  assert.equal(body.instructions, composerInstructions);
  assert.equal(body.tools, undefined);
  assert.deepEqual(result.output, f.proposal);
  assert.equal(result.usage.model, "gpt-6-astra-2026-09-01");
  assert.equal(attempts.length, 1);
  assert.equal(attempts[0].success, true);
  assert.equal(
    recordCompositionPlan(f.requested, result.output, result.usage).composition
      .phase,
    "review",
  );
});

test("wrong configured/actual model, malformed/oversized output and refusal fail closed without fallback", async () => {
  const f = compositionFixture();
  let configuredCalls = 0;
  await assert.rejects(
    provider(
      async () => {
        configuredCalls++;
        return compositionResponse(f.proposal);
      },
      { model: "gpt-5.4" },
    )(f.requested.composition),
  );
  assert.equal(configuredCalls, 0);
  for (const response of [
    () => compositionResponse(f.proposal, "gpt-5.4"),
    () => compositionResponse({ ...f.proposal, approval: true }),
    () => compositionResponse({ ...f.proposal, title: "x".repeat(200_001) }),
    () =>
      new Response(
        JSON.stringify({
          model: "gpt-6-astra",
          status: "completed",
          output: [
            {
              type: "message",
              role: "assistant",
              status: "completed",
              content: [{ type: "refusal", refusal: "Cannot comply." }],
            },
          ],
          usage: { input_tokens: 10, output_tokens: 1 },
        }),
      ),
    () => new Response("{bad", { status: 200 }),
    () => new Response("unavailable", { status: 503 }),
  ]) {
    let calls = 0;
    const before = structuredClone(f.requested);
    await assert.rejects(
      provider(async () => {
        calls++;
        return response();
      })(f.requested.composition),
    );
    assert.equal(calls, 1);
    assert.deepEqual(f.requested, before);
  }
});

test("timeout leaves requested draft unchanged and retry uses the same pinned profile", async () => {
  const f = compositionFixture(),
    original = structuredClone(f.requested);
  let calls = 0;
  await assert.rejects(
    provider(
      async (_url, { signal }) => {
        calls++;
        return new Promise((_resolve, reject) =>
          signal.addEventListener(
            "abort",
            () => reject(new DOMException("Aborted", "AbortError")),
            { once: true },
          ),
        );
      },
      { timeoutMs: 1 },
    )(f.requested.composition),
  );
  assert.equal(calls, 1);
  assert.deepEqual(f.requested, original);
  const result = await provider(async () => compositionResponse(f.proposal))(
    f.requested.composition,
  );
  assert.deepEqual(result.output, f.proposal);
});

test("pending request cannot acquire caller-mutated choice authority during transport", async () => {
  const f = compositionFixture(),
    originalChoices = structuredClone(f.requested.composition.choices);
  const invalid = {
    ...f.proposal,
    affectedActorIndexes: [originalChoices.actors.length],
  };
  await assert.rejects(
    provider(async () => {
      f.requested.composition.choices.actors.push({
        id: id(),
        label: "Injected after request",
        control: "autonomous",
      });
      return compositionResponse(invalid);
    })(f.requested.composition),
  );
});

test("fully assembled oversized context is rejected before transport, without silent truncation", async () => {
  const f = compositionFixture();
  const entry = structuredClone(f.requested.composition.choices.evidence[0]);
  f.requested.composition.choices.evidence = Array.from({ length: 96 }, () => ({
    ...entry,
    text: "Ж".repeat(2000),
  }));
  let calls = 0;
  await assert.rejects(
    provider(async () => {
      calls++;
      return compositionResponse(f.proposal);
    })(f.requested.composition),
  );
  assert.equal(calls, 0);
});
