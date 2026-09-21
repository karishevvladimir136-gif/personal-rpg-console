import { labUiFixture, uiId } from "./d1-ui-fixtures.mjs";
export { uiId };

export function authoringUiFixture(
  language = "en",
  { phase = "review", ambiguous = false, empty = false } = {},
) {
  const ru = language === "ru",
    campaign = labUiFixture(language);
  campaign.runs = [];
  const policy = {
    simulation: true,
    autonomy: "moderate",
    deadlinePressure: "normal",
  };
  const review = {
    title: ru ? "Открытые восточные ворота" : "An open eastern gate",
    changeDescription: ru
      ? "Мара решает оставить восточные ворота открытыми."
      : "Mara intends to keep the eastern gate open.",
    divergenceType: "actor_intent",
    timingText: ru ? "С момента рассвета" : "From daybreak",
    offsetMinutes: 0,
    locationIndex: 0,
    affectedActorIndexes: [0],
    affectedThreadIndexes: [0],
    assumptions: [
      ru
        ? "Новое намерение Мары — допущение этой ветки."
        : "Mara’s changed intent is an assumption for this branch.",
    ],
    constraints: [
      ru
        ? "Герой остаётся под управлением игрока."
        : "The hero remains controlled by the player.",
    ],
    unchangedBaseline: [
      ru
        ? "Расположение гавани и запасы не меняются."
        : "The harbor’s geography and established supplies stay unchanged.",
    ],
    horizonMinutes: 180,
    policy,
    ambiguityAnswers: ambiguous ? [null] : [],
  };
  const proposal = {
    phase,
    premise: ru
      ? "Что, если Мара оставит восточные ворота открытыми?"
      : "What if Mara kept the eastern gate open?",
    language,
    startWorldMinutes: campaign.bases[0].worldMinutes,
    review: phase === "requested" ? null : review,
    ambiguities: ambiguous
      ? [
          {
            question: ru
              ? "Какие ворота остаются открытыми?"
              : "Which gate remains open?",
            consequential: true,
          },
        ]
      : [],
    statements:
      phase === "requested"
        ? []
        : [
            {
              text: ru
                ? "Гавань защищена воротами."
                : "The harbor has guarded gates.",
              origin: "source_fact",
              knowledge: "canon_at_entry",
              evidenceIndexes: [0],
              actorIndexes: [],
              uncertainty: null,
            },
            {
              text: ru
                ? "Маре известен обычный путь дозора."
                : "Mara knows the patrol’s usual route.",
              origin: "source_fact",
              knowledge: "character",
              evidenceIndexes: [1],
              actorIndexes: [0],
              uncertainty: null,
            },
            {
              text: ru
                ? "В исходном рассказе завтра прибывает подкрепление."
                : "In the source story, reinforcements arrive tomorrow.",
              origin: "source_fact",
              knowledge: "future_source",
              evidenceIndexes: [2],
              actorIndexes: [],
              uncertainty: null,
            },
            {
              text: review.changeDescription,
              origin: "owner_assumption",
              knowledge: "owner_assumption",
              evidenceIndexes: [],
              actorIndexes: [],
              uncertainty: ru
                ? "Допущение требует утверждения владельца."
                : "This assumption needs owner approval.",
            },
          ],
    choices: {
      actors: [
        { label: "Mara", control: "autonomous" },
        { label: ru ? "Ваш герой" : "Your hero", control: "player" },
      ],
      locations: [
        { label: ru ? "Восточные ворота" : "Eastern gate" },
        { label: ru ? "Западный причал" : "Western quay" },
      ],
      threads: [
        {
          label: ru ? "Дозор гавани" : "Harbor patrol",
          actorIndexes: [0],
          locationIndexes: [0],
        },
      ],
      policy,
    },
    selectedModel: { modelId: "gpt-6-astra", reasoning: "max" },
    ownerEdited: false,
    blockers:
      phase === "requested"
        ? ["interpretation_required"]
        : ambiguous
          ? ["ambiguity_unresolved"]
          : [],
    usage:
      phase === "requested"
        ? null
        : {
            model: "gpt-6-astra",
            inputTokens: 1200,
            outputTokens: 240,
            calls: 1,
            latencyMs: 20,
          },
  };
  const draft = {
    id: uiId(101),
    versionId: uiId(102),
    version: 2,
    base: structuredClone(campaign.bases[0]),
    proposal,
  };
  const authoring = {
    models: [
      {
        modelId: "gpt-6-astra",
        label: "GPT-6 Astra",
        reasoning: ["high", "xhigh", "max"],
        available: true,
      },
      {
        modelId: "gpt-5.4",
        label: "GPT-5.4",
        reasoning: ["high", "xhigh"],
        available: false,
      },
    ],
    drafts: empty ? [] : [draft],
  };
  return { campaign, authoring, draft };
}

// Explicitly synthetic transport for actual-component preview and client tests.
// No provider, credentials, database, private campaign or production route.
export function scriptedAuthoringSession(
  language = "en",
  { ambiguous = true, withDraft = false, onChange = () => {} } = {},
) {
  const fixture = authoringUiFixture(language, { ambiguous }),
    ru = language === "ru";
  let campaign = structuredClone(fixture.campaign),
    authoring = {
      ...structuredClone(fixture.authoring),
      drafts: withDraft ? structuredClone(fixture.authoring.drafts) : [],
    },
    serial = 200;
  const receipts = new Map(),
    calls = [],
    audit = {
      requests: 0,
      savedOperations: 0,
      modelResponses: 0,
      authoring: 0,
      execution: 0,
    };
  let interrupt = null;
  const allocate = () => uiId(serial++);
  const commit = (request, output) => {
    receipts.set(request.input.operationId, {
      body: JSON.stringify(request),
      output: structuredClone(output),
    });
    audit.savedOperations++;
    onChange();
  };
  const maybeInterrupt = (category) => {
    if (interrupt === category) {
      interrupt = null;
      throw new Error("SCRIPTED_LOST_RESPONSE");
    }
  };
  const authoringTransport = {
    async load() {
      return structuredClone(authoring);
    },
    async send(request) {
      calls.push(structuredClone(request));
      audit.requests++;
      audit.authoring++;
      onChange();
      const previous = receipts.get(request.input.operationId);
      if (previous) {
        if (previous.body !== JSON.stringify(request))
          throw new Error("SCRIPTED_CONFLICT");
        return structuredClone(previous.output);
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
      let draft;
      if (request.action === "interpret") {
        draft = structuredClone(fixture.draft);
        draft.id = allocate();
        draft.versionId = allocate();
        draft.version = 2;
        draft.proposal.premise = request.input.premise;
        draft.proposal.selectedModel = {
          modelId: request.input.model.modelId,
          reasoning: request.input.model.reasoning,
        };
        audit.modelResponses++;
      } else {
        const current = authoring.drafts.find(
          (d) => d.versionId === request.input.versionId,
        );
        if (!current) throw new Error("SCRIPTED_CONFLICT");
        draft = structuredClone(current);
        draft.version++;
        draft.versionId = allocate();
        if (request.action === "edit") {
          draft.proposal.review = structuredClone(request.input.review);
          draft.proposal.phase = "review";
          draft.proposal.ownerEdited = true;
          draft.proposal.selectedModel = {
            modelId: request.input.model.modelId,
            reasoning: request.input.model.reasoning,
          };
          const r = draft.proposal.review;
          draft.proposal.blockers = [];
          if (
            draft.proposal.ambiguities.some(
              (a, i) => a.consequential && !r.ambiguityAnswers[i],
            )
          )
            draft.proposal.blockers.push("ambiguity_unresolved");
          if (["relationship", "rule", "other"].includes(r.divergenceType))
            draft.proposal.blockers.push("unsupported_divergence");
          if (
            !r.affectedThreadIndexes.length &&
            !r.affectedActorIndexes.includes(0)
          )
            draft.proposal.blockers.push("scope_required");
          if (r.offsetMinutes >= r.horizonMinutes)
            draft.proposal.blockers.push("timing_outside_horizon");
          if (
            r.divergenceType === "actor_intent" &&
            r.affectedActorIndexes.includes(1)
          )
            draft.proposal.blockers.push("player_agency");
        } else if (request.action === "retry_interpret") {
          draft.proposal = structuredClone(fixture.draft.proposal);
          audit.modelResponses++;
        } else {
          if (draft.proposal.blockers.length)
            throw new Error("SCRIPTED_VALIDATION");
          draft.proposal.phase = "approved";
        }
      }
      authoring.drafts = [
        draft,
        ...authoring.drafts.filter((d) => d.id !== draft.id),
      ];
      let run = null;
      if (request.action === "approve") {
        const r = draft.proposal.review;
        run = {
          ...structuredClone(labUiFixture(language).runs[0]),
          id: allocate(),
          timelineId: allocate(),
          label: r.title,
          status: "prepared",
          revision: 0,
          currentWorldMinutes: draft.base.worldMinutes,
          throughWorldMinutes: draft.base.worldMinutes + r.horizonMinutes,
          scenario: {
            scenarioVersionId: draft.versionId,
            divergenceVersionId: allocate(),
            scenarioTitle: r.title,
            divergenceTitle: r.title,
            assumptions: r.assumptions,
            changes: [r.changeDescription],
          },
          checkpoints: [
            {
              id: allocate(),
              ordinal: 0,
              worldMinutes: draft.base.worldMinutes,
              summary: ru
                ? "Исходная точка подготовлена. Симуляция ещё не запускалась."
                : "The starting point is prepared. Simulation has not started.",
              events: [],
            },
          ],
          execution: {
            modelId: draft.proposal.selectedModel.modelId,
            reasoning: draft.proposal.selectedModel.reasoning,
            recordedResponses: 0,
            inputTokens: 0,
            outputTokens: 0,
          },
        };
        campaign.runs = [run, ...campaign.runs];
      }
      const result = { draft, run };
      commit(request, result);
      maybeInterrupt("authoring");
      return structuredClone(result);
    },
  };
  const transport = {
    async load() {
      return structuredClone(campaign);
    },
    async send(request) {
      calls.push(structuredClone(request));
      audit.requests++;
      audit.execution++;
      onChange();
      const previous = receipts.get(request.input.operationId);
      if (previous) return structuredClone(previous.output);
      await new Promise((resolve) => setTimeout(resolve, 100));
      let run;
      if (request.action === "prepare") {
        run = structuredClone(labUiFixture(language).runs[0]);
        run.id = allocate();
        run.label = request.input.label;
        run.revision = 0;
        run.status = "prepared";
        run.currentWorldMinutes = run.startWorldMinutes;
        run.throughWorldMinutes =
          run.startWorldMinutes + request.input.horizonMinutes;
        run.checkpoints = [run.checkpoints[0]];
      } else {
        const current = campaign.runs.find((r) => r.id === request.input.runId);
        if (!current) throw new Error("SCRIPTED_CONFLICT");
        run = structuredClone(current);
        run.revision++;
        if (request.action === "continue") {
          run.currentWorldMinutes = Math.min(
            run.currentWorldMinutes + 60,
            run.throughWorldMinutes,
          );
          run.status =
            run.currentWorldMinutes === run.throughWorldMinutes
              ? "completed"
              : "running";
          const text = ru
            ? "Дозор Мары достигает восточных ворот. Проход остаётся открытым; запасы не изменились."
            : "Mara’s patrol reaches the eastern gate. Passage remains open; recorded supplies are unchanged.";
          run.checkpoints.push({
            id: allocate(),
            ordinal: run.checkpoints.length,
            worldMinutes: run.currentWorldMinutes,
            summary: ru
              ? "Один шаг завершён и сохранён."
              : "One step is complete and saved.",
            events: [
              { id: allocate(), worldMinutes: run.currentWorldMinutes, text },
            ],
          });
          if (run.execution) {
            run.execution.recordedResponses++;
            run.execution.inputTokens += 800;
            run.execution.outputTokens += 100;
            audit.modelResponses++;
          }
        } else if (request.action === "pause") run.status = "paused";
        else if (request.action === "resume") run.status = "running";
        else {
          run.status = "cancelled";
          run.reason = "cancelled";
        }
      }
      campaign.runs = [run, ...campaign.runs.filter((r) => r.id !== run.id)];
      commit(request, run);
      maybeInterrupt("execution");
      return structuredClone(run);
    },
  };
  return {
    campaign: () => structuredClone(campaign),
    authoring: () => structuredClone(authoring),
    transport,
    authoringTransport,
    audit,
    calls,
    receipts,
    interruptNext: (category) => {
      interrupt = category;
    },
  };
}
