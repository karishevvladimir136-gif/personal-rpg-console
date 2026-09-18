import { createCampaignSettings } from "../src/lib/campaign-settings.ts";
import {
  stableGameplayId,
  recordServerRoll,
} from "../src/lib/gameplay/dice.ts";
import {
  mechanicPlan,
  validatePlan,
  resolveMechanics,
  checkModifier,
} from "../src/lib/gameplay/mechanics/resolve.ts";

export const id = (name) => stableGameplayId("synthetic", name);
export function fixture() {
  const cid = id("campaign"),
    player = id("player"),
    companion = id("companion"),
    enemy = id("enemy");
  const scoped = (name) => ({
    id: id(name),
    campaign_id: cid,
    revision: 1,
    updated_at: "2026-01-01T00:00:00Z",
  });
  const entities = [
    ["player", "player"],
    ["companion", "companion"],
    ["enemy", "npc"],
  ].map(([name, kind]) => ({
    ...scoped(name),
    kind,
    name: `Synthetic ${name}`,
    details: "Synthetic known actor.",
    hp: 6,
    max_hp: 12,
    stats: { skill: 2, attack: 2, save: 1, defense: 10 },
    resources: { focus: 4 },
    conditions: [],
    equipment_slots: [
      { id: "hand", label: "Hand", accepts: ["weapon", "tool"] },
    ],
  }));
  const storages = [
    ["pack", "player", player],
    ["companion-pack", "companion", companion],
    ["camp", "camp", null],
    ["cargo", "transport", null],
  ].map(([name, kind, entity_id]) => ({
    ...scoped(name),
    name,
    kind,
    entity_id,
  }));
  const names = [
    "supply",
    "meat",
    "coffee",
    "water",
    "knife",
    "stick",
    "binding",
    "cutting-tool",
    "healing",
    "weapon",
  ];
  const items = names.map((name) => ({
    ...scoped(name),
    name,
    category: name === "weapon" ? "weapon" : "consumable",
    quantity: 10,
    description: "Synthetic item.",
    mechanics: "Descriptive prose never grants effects.",
    owner_entity_id: player,
    storage_id: id("pack"),
    equipped_entity_id: name === "weapon" ? player : null,
    equipped_slot: name === "weapon" ? "hand" : null,
  }));
  const settings = createCampaignSettings(cid, {
    id: "console-basic-v1",
    label: "Console basic house rules",
    enemyHpScaling: true,
    enemyDamageScaling: true,
  });
  const snapshot = {
    campaign: {
      ...scoped("campaign"),
      title: "Synthetic mechanics",
      subtitle: "",
      language: "en",
    },
    settings: {
      campaign_id: cid,
      values: settings,
      revision: 1,
      updated_at: "",
    },
    settingsHistory: [],
    documents: [],
    entities,
    storages,
    items,
    sessions: [
      {
        ...scoped("session"),
        title: "Synthetic session",
        status: "open",
        recap: "",
      },
    ],
    scenes: [],
    publicState: {
      campaign_id: cid,
      summary: "Synthetic beginning",
      current_session_id: id("session"),
      current_scene_id: null,
      current_location_id: id("location"),
      revision: 1,
      updated_at: "",
    },
    quests: [
      {
        ...scoped("quest"),
        title: "Synthetic objective",
        description: "",
        status: "open",
      },
    ],
    locations: [
      {
        ...scoped("location"),
        name: "Safe clearing",
        description: "",
        status: "visited",
      },
      {
        ...scoped("next-location"),
        name: "Second clearing",
        description: "",
        status: "known",
      },
    ],
    assets: [],
    feedback: [],
    dmGuideDocumentId: id("guide"),
  };
  return {
    ownerId: id("owner"),
    snapshot,
    privateState: { canary: "SYNTHETIC_PRIVATE_MARKER" },
    checkpoint: null,
    historyComplete: true,
    runtime: {
      campaignId: cid,
      revision: 1,
      configured: true,
      model: null,
      configuration: {
        profile: "console-basic-v1",
        controlledEntityIds: [player, companion],
        presentEntityIds: [player, companion, enemy],
        nearbyStorageIds: [],
        safeLocationIds: [id("location"), id("next-location")],
        itemRules: names.map((name) => ({
          itemId: id(name),
          tag: name,
          damage: name === "weapon" ? 3 : null,
        })),
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
}

export function turn(source, choice = null, key = "operation") {
  return {
    operationId: id(key),
    campaignId: source.snapshot.campaign.id,
    expectedRevision: source.runtime.revision,
    mode: choice ? "mechanic" : "game",
    input: "A synthetic action.",
    companionId: null,
    listenerIds: [],
    mechanic: choice,
  };
}
export function applyResolution(source, resolution) {
  const next = structuredClone(source);
  const families = {
    entities: next.snapshot.entities,
    items: next.snapshot.items,
    quests: next.snapshot.quests,
    locations: next.snapshot.locations,
    conversations: next.runtime.conversations,
    rest_records: next.runtime.restRecords,
    recipes: next.runtime.recipes,
    effects: next.runtime.effects,
    encounters: next.runtime.encounters,
    encounter_participants: next.runtime.participants,
    pending_actions: next.runtime.pendingActions,
    provenance: next.runtime.provenance,
  };
  for (const change of resolution.changes) {
    if (change.family === "public_state") {
      Object.assign(next.snapshot.publicState, change.values);
      next.snapshot.publicState.revision++;
      continue;
    }
    const rows = families[change.family];
    let row = rows.find((row) => row.id === change.id);
    if (!row) {
      row = {
        id: change.id,
        campaign_id: next.snapshot.campaign.id,
        revision: 0,
        updated_at: "",
        created_at: "2026-01-01T00:00:00Z",
      };
      rows.push(row);
    }
    Object.assign(row, change.values);
    if (typeof row.revision === "number") row.revision++;
  }
  next.runtime.worldMinutes = resolution.worldMinutes;
  next.runtime.configuration = resolution.configuration;
  next.runtime.revision++;
  return next;
}
export function perform(source, choice, key = "operation", die = 20) {
  const input = turn(source, choice, key),
    plan = mechanicPlan(source, input);
  validatePlan(source, input, plan);
  const checks = plan.checks.map((check) =>
    recordServerRoll(
      input.operationId,
      check,
      checkModifier(source, check),
      1,
      () => die,
    ),
  );
  const resolution = resolveMechanics(source, input, plan, checks);
  return {
    source: applyResolution(source, resolution),
    resolution,
    input,
    plan,
    checks,
  };
}
