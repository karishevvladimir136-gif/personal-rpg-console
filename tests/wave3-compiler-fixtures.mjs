import { fixture, id, owner } from "./wave1-library-fixtures.mjs";
import { createOwnerLibraryAuthoring } from "../src/lib/world-library/authoring.ts";
import { prepareAssistedCompilation } from "../src/lib/world-library/assisted-compiler.ts";
import { resolveExecutionProfile } from "../src/lib/model-runtime/registry.ts";
import { createRpcLibraryStore } from "../src/lib/world-library/store.ts";
export { id, owner };
export const description = (extra = {}) => ({
  action: "source.describe",
  operationId: id(),
  sourceId: null,
  expectedVersionId: null,
  title: "Dragon Europe",
  text: "Medieval Europe, where dragons replace cavalry.\r\nDragon orders protect mountain passes.",
  language: "en",
  visibility: "public",
  knowledge: "source",
  ...extra,
});
export const profile = () =>
  resolveExecutionProfile({
    task: "canon.compile",
    profileId: id(),
    globalDefault: {
      providerId: "openai",
      modelId: "gpt-6-astra",
      reasoning: "max",
    },
  });
export function proposal(input) {
  const prepared = prepareAssistedCompilation(input);
  const make = (key, kind, text, extra = {}) => ({
    key,
    subjectKey: "dragons",
    kind,
    predicate: kind,
    text,
    basis: "inference",
    epistemic: "hypothesis",
    evidenceIndexes: [0],
    uncertainty: "A proposal inferred from the owner's world premise.",
    objectKey: null,
    position: null,
    ...extra,
  });
  return {
    schemaVersion: 1,
    title: "Dragon Europe",
    entities: [
      {
        key: "dragons",
        name: "Dragon orders",
        kind: "group",
        aliases: [],
        evidenceIndexes: [0],
      },
      {
        key: "europe",
        name: "Europe",
        kind: "location",
        aliases: [],
        evidenceIndexes: [0],
      },
    ],
    candidates: [
      make("premise", "premise", prepared.evidence[0].excerpt, {
        basis: "quote",
        epistemic: "fact",
        uncertainty: null,
      }),
      make("bond", "relationship", "Dragon orders serve regional rulers.", {
        objectKey: "europe",
      }),
      make("region", "geography", "Mountain passes shape dragon routes.", {
        objectKey: "europe",
      }),
      make(
        "era",
        "timeline",
        "Dragon-mounted forces exist during the medieval era.",
        { position: "Medieval era; exact date unknown" },
      ),
      make("rule", "rule", "Dragons replace cavalry in this proposed setting."),
    ],
    contradictions: [],
    unknowns: [
      {
        key: "care",
        question: "How are dragons supported and trained?",
        entityKey: "dragons",
      },
    ],
    coverage: prepared.extraction.coverage.map((c) => ({
      sourceVersionId: c.sourceVersionId,
      evidenceIndexes: prepared.evidence
        .filter((e) => e.locator.sourceVersionId === c.sourceVersionId)
        .map((e) => e.index),
      gaps: [],
    })),
  };
}
export function compilerFixture(compile) {
  const f = fixture(),
    calls = [],
    resolutions = [];
  // Match the database's atomic predecessor fence. Identical receipt replays
  // still return the saved row, which exercises duplicate execution races.
  const rpc = async (args) => {
    if (args.p_action === "put") {
      const record = args.p_payload.record;
      if (!f.records.has(record.versionId)) {
        const latest = [...f.records.values()]
          .filter((r) => r.kind === record.kind && r.id === record.id)
          .sort((a, b) => b.version - a.version)[0];
        if (
          latest &&
          (record.previousVersionId !== latest.versionId ||
            record.version !== latest.version + 1)
        )
          return { error: { message: "rpg_conflict" } };
      }
    }
    return f.rpc(args);
  };
  const store = createRpcLibraryStore(owner, rpc);
  const provider = {
    resolveProfile() {
      const p = profile();
      resolutions.push(p);
      return p;
    },
    async compile(input) {
      calls.push(structuredClone(input));
      const output = compile ? await compile(input) : proposal(input);
      return {
        output,
        usage: {
          model: input.job.assistance.executionProfile.modelId,
          inputTokens: 800,
          outputTokens: 500,
          calls: 1,
          latencyMs: 1,
        },
      };
    },
  };
  return {
    ...f,
    store,
    rpc,
    calls,
    resolutions,
    provider,
    service: createOwnerLibraryAuthoring(owner, store, provider),
  };
}
export function compilerInput(f, started, job = started.job) {
  const current = f.records.get(job.versionId);
  return {
    operationId: id(),
    job: current.body,
    sources: current.body.sourcePriority.map((versionId) =>
      f.records.get(versionId),
    ),
    basePack: current.body.assistance.refinement
      ? f.records.get(current.body.assistance.refinement.packVersionId)
      : null,
  };
}
export async function start(f, inputs = [description()]) {
  const sources = [];
  for (const input of inputs) sources.push(await f.service.execute(input));
  const command = {
    action: "compiler.start",
    operationId: id(),
    sourcePriority: sources.map((s) => s.versionId),
    maxUnits: 180,
    mode: "assisted",
  };
  return { sources, command, job: await f.service.execute(command) };
}
export async function step(f, job) {
  return f.service.execute({
    action: "compiler.step",
    operationId: id(),
    expectedVersionId: job.versionId,
  });
}
export async function draft(f, inputs) {
  const initial = await start(f, inputs);
  let job = initial.job;
  for (let i = 0; i < 4; i++) job = await step(f, job);
  const index = await f.service.read();
  return {
    ...initial,
    job,
    pack: await f.service.pack(index.packs[0].versionId),
  };
}
