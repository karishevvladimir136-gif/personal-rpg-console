import { randomUUID } from "node:crypto";
import { createCampaignSettings } from "../src/lib/campaign-settings.ts";
export function runtimeFixture() {
  const campaignId = randomUUID(),
    ownerId = randomUUID(),
    sessionId = randomUUID(),
    guideId = randomUUID(),
    actorId = randomUUID();
  const row = {
    campaign_id: campaignId,
    revision: 1,
    updated_at: "2026-09-18T00:00:00Z",
  };
  const source = {
    ownerId,
    privateState: { fact: { synthetic: "SYNTHETIC_PRIVATE_CONTEXT_MARKER" } },
    checkpoint: null,
    historyComplete: true,
    snapshot: {
      campaign: {
        ...row,
        id: campaignId,
        title: "Synthetic Tide",
        subtitle: "",
        language: "en",
      },
      settings: {
        ...row,
        values: createCampaignSettings(campaignId, {
          id: "console-basic-v1",
          label: "House profile",
          enemyHpScaling: true,
          enemyDamageScaling: true,
        }),
      },
      settingsHistory: [],
      documents: [
        {
          ...row,
          id: guideId,
          title: "DM Guide",
          status: "reference",
          body: "Keep agency.",
          current_version_id: randomUUID(),
        },
      ],
      entities: [
        {
          ...row,
          id: actorId,
          kind: "player",
          name: "Synthetic Neri",
          details: "",
          hp: 8,
          max_hp: 10,
          stats: { skill: 2 },
          resources: {},
          conditions: [],
          equipment_slots: [],
        },
      ],
      storages: [],
      items: [],
      sessions: [
        {
          ...row,
          id: sessionId,
          title: "Synthetic session",
          status: "open",
          recap: "",
        },
      ],
      scenes: [],
      publicState: {
        ...row,
        summary: "A bell at the tower",
        current_session_id: sessionId,
        current_scene_id: null,
        current_location_id: null,
      },
      quests: [],
      locations: [],
      assets: [],
      feedback: [
        {
          id: randomUUID(),
          campaign_id: campaignId,
          body: "FEEDBACK_HISTORY_ONLY",
          sequence: 1,
          created_at: row.updated_at,
        },
      ],
      dmGuideDocumentId: guideId,
    },
    runtime: {
      campaignId,
      revision: 1,
      configured: true,
      model: "gpt-5.4-mini",
      configuration: {
        profile: "console-basic-v1",
        controlledEntityIds: [actorId],
        presentEntityIds: [actorId],
        nearbyStorageIds: [],
        safeLocationIds: [],
        itemRules: [],
      },
      worldMinutes: 0,
      turns: [],
      restRecords: [],
      recipes: [],
      effects: [],
      encounters: [],
      participants: [],
      pendingActions: [],
      conversations: [],
      sessionGuidance: [],
      provenance: [],
    },
  };
  const input = {
    operationId: randomUUID(),
    campaignId,
    expectedRevision: 1,
    mode: "game",
    input: "Listen at the door. Слушать у двери.",
    companionId: null,
    listenerIds: [],
    mechanic: null,
  };
  const plan = {
    narration: "PRIVATE_DRAFT_NEVER_PUBLIC",
    checks: [],
    publicPatches: [],
    privatePatches: [],
    visualDescription: "",
    clarification: null,
    guidanceProposal: null,
  };
  const resolution = {
    changes: [],
    worldMinutes: 0,
    configuration: source.runtime.configuration,
    outcomes: [
      {
        kind: "observation",
        entityIds: [actorId],
        itemIds: [],
        text: "The public bell rings.",
      },
    ],
  };
  return { source, input, plan, resolution, actorId, sessionId };
}
