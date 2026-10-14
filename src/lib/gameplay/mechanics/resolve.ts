import { lootCheckAuthorized } from "../../adventure-loot/runtime.ts";
import type { Entity, Item, Storage } from "../../persistence/contracts.ts";
import type {
  EncounterParticipant,
  ItemQuantity,
  ItemTag,
  JsonObject,
  MechanicChoice,
  TurnInput,
} from "../contracts.ts";
import type {
  CheckProposal,
  DmPlan,
  MechanicsResolution,
  RecordedCheck,
  RecordChange,
  RecordFamily,
  RuntimeSource,
} from "../server-contracts.ts";
import { stableGameplayId } from "../dice.ts";
import { isRestProvision } from "../rest-provisions.ts";
import { requireRule, TurnError } from "../turn-errors.ts";
import {
  basicProfile,
  supportedActivityRuleset,
  validateConfiguration,
} from "./profile.ts";

const ownFields: Record<MechanicChoice["kind"], string[]> = {
  "resource.spend": ["entityId", "resource", "amount"],
  "item.consume": ["actorId", "itemId", "quantity"],
  "item.transfer": ["actorId", "itemId", "quantity", "destinationStorageId"],
  "item.equip": ["actorId", "itemId", "slot"],
  "quest.transition": ["questId", "status"],
  "location.move": ["locationId"],
  "encounter.start": ["participantIds"],
  "encounter.action": ["actorId", "action", "targetId", "itemId", "position"],
  "encounter.end": ["outcome"],
  "rest.enter": ["restKind", "participantIds"],
  "rest.leave": ["restId"],
  "rest.complete": ["restId", "supplies"],
  "recipe.prepare": ["actorId", "recipe", "ingredients", "outputStorageId"],
  "recipe.serve": ["actorId", "itemId", "recipientIds"],
  "item.transform": [
    "actorId",
    "recipe",
    "inputs",
    "toolIds",
    "outputStorageId",
  ],
  forage: ["actorId", "outputStorageId"],
};
const integer = (n: number, min = 0, max = 100000) =>
  Number.isSafeInteger(n) && n >= min && n <= max;
const unique = (ids: string[]) =>
  Array.isArray(ids) &&
  ids.length <= 200 &&
  ids.every((id) => typeof id === "string") &&
  new Set(ids).size === ids.length;

export function validateMechanicChoice(choice: MechanicChoice): void {
  requireRule(
    choice &&
      typeof choice === "object" &&
      Object.hasOwn(ownFields, choice.kind),
  );
  const keys = ["kind", ...ownFields[choice.kind]];
  requireRule(
    Object.keys(choice).length === keys.length &&
      Object.keys(choice).every((key) => keys.includes(key)),
  );
}

function configured(source: RuntimeSource) {
  const config = source.runtime.configuration;
  if (
    !config ||
    !supportedActivityRuleset(source.snapshot.settings.values.rulesSystem?.id)
  )
    throw new TurnError("configuration");
  validateConfiguration(source.snapshot, config);
  return config;
}

export function checkModifier(
  source: RuntimeSource,
  check: CheckProposal,
): number {
  const actor = source.snapshot.entities.find(
    (row) =>
      row.id === check.actorId &&
      row.campaign_id === source.snapshot.campaign.id,
  );
  requireRule(actor);
  const base = actor.stats[check.stat] ?? 0;
  requireRule(integer(base, -20, 20));
  const coffee =
    check.kind === "skill" &&
    source.runtime.effects.some(
      (effect) =>
        effect.entity_id === actor.id &&
        effect.campaign_id === actor.campaign_id &&
        effect.definition.kind === "coffee" &&
        effect.definition.status === "active" &&
        effect.definition.remaining === 1,
    );
  return base + (coffee ? 1 : 0);
}

export function mechanicPlan(source: RuntimeSource, input: TurnInput): DmPlan {
  requireRule(input.mechanic);
  return mechanicPlanForActions(source, input, [input.mechanic]);
}

export function mechanicPlanForActions(source: RuntimeSource, input: TurnInput, actions: MechanicChoice[], maxActions = 12): DmPlan {
  requireRule(actions.length > 0 && actions.length <= maxActions);
  actions.forEach(validateMechanicChoice);
  const checks: CheckProposal[] = [];
  const base = {
    index: 0,
    targetId: null,
    stat: "skill",
    dc: 12,
    dcPublic: true,
    visibility: "player",
    important: true,
    uncertainty: "meaningful",
    advantage: "normal",
  } as const;
  for (const action of actions) {
  if (action.kind === "item.transform")
    checks.push({ ...base, index: checks.length, actorId: action.actorId, kind: "transform" });
  if (action.kind === "forage")
    checks.push({
      ...base,
      index: checks.length,
      actorId: action.actorId,
      kind: "skill",
      dc: basicProfile.forageDc,
    });
  if (action.kind === "encounter.action" && (action.action === "attack" || action.action === "attempt")) {
    const target = source.snapshot.entities.find(
      (row) => row.id === action.targetId,
    );
    requireRule(target);
    const controlled =
      source.runtime.configuration?.controlledEntityIds.includes(
        action.actorId,
      );
    checks.push({
      ...base,
      index: checks.length,
      actorId: action.actorId,
      targetId: target.id,
      kind: action.action === "attack" ? "attack" : "skill",
      stat: action.action === "attack" ? "attack" : "skill",
      dc: target.stats.defense ?? 10,
      visibility: controlled ? "player" : "private",
      dcPublic: false,
    });
  }
  }
  for (const check of checks) {
    const actor = source.snapshot.entities.find(
      (row) => row.id === check.actorId,
    );
    const advantage = actor?.conditions.includes(`advantage:${check.stat}`),
      disadvantage = actor?.conditions.includes(`disadvantage:${check.stat}`);
    check.advantage =
      advantage === disadvantage
        ? "normal"
        : advantage
          ? "advantage"
          : "disadvantage";
  }
  return {
    narration: "",
    checks,
    publicPatches: actions,
    privatePatches: [],
    visualDescription: "",
    clarification: null,
    guidanceProposal: null,
  };
}

export function validatePlan(
  source: RuntimeSource,
  input: TurnInput,
  plan: DmPlan,
): void {
  requireRule(
    source.snapshot.campaign.id === input.campaignId &&
      source.runtime.campaignId === input.campaignId,
  );
  requireRule(source.runtime.revision === input.expectedRevision);
  requireRule(
    Array.isArray(plan.checks) &&
      plan.checks.length <= 8 &&
      Array.isArray(plan.publicPatches) &&
      plan.publicPatches.length <= 12,
  );
  if (input.mode === "feedback" || input.mode === "ooc")
    requireRule(
      !plan.checks.length &&
        !plan.publicPatches.length &&
        !plan.privatePatches.length,
    );
  if (plan.clarification !== null)
    requireRule(
      !plan.checks.length &&
        !plan.publicPatches.length &&
        !plan.privatePatches.length,
    );
  if (plan.checks.length || plan.publicPatches.length) configured(source);
  if (input.mechanic)
    requireRule(
      plan.publicPatches.length === 1 &&
        JSON.stringify(plan.publicPatches[0]) ===
          JSON.stringify(input.mechanic),
    );
  const config = source.runtime.configuration;
  const indexes = new Set<number>();
  const actorKinds = new Set<string>();
  for (const check of plan.checks) {
    requireRule(integer(check.index, 0, 7) && !indexes.has(check.index));
    indexes.add(check.index);
    requireRule(["skill", "attack", "save", "transform"].includes(check.kind));
    requireRule(
      ["skill", "attack", "save"].includes(check.stat) &&
        check.stat ===
          (check.kind === "attack"
            ? "attack"
            : check.kind === "save"
              ? "save"
              : "skill"),
    );
    requireRule(integer(check.dc, 1, 40) && check.uncertainty === "meaningful");
    requireRule(
      ["normal", "advantage", "disadvantage"].includes(check.advantage),
    );
    requireRule(
      ["player", "private"].includes(check.visibility) &&
        typeof check.dcPublic === "boolean" &&
        typeof check.important === "boolean",
    );
    const actor = source.snapshot.entities.find(
      (row) => row.id === check.actorId && row.campaign_id === input.campaignId,
    );
    requireRule(
      actor &&
        config?.presentEntityIds.includes(actor.id) &&
        !actor.conditions.some((condition) =>
          ["dead", "withdrawn"].includes(condition),
        ),
    );
    requireRule(
      check.visibility !== "player" ||
        config?.controlledEntityIds.includes(actor.id),
    );
    requireRule(
      lootCheckAuthorized(source, input, plan, check) ||
        check.targetId === null ||
        source.snapshot.entities.some(
          (row) =>
            row.id === check.targetId && row.campaign_id === input.campaignId,
        ),
    );
    requireRule(!actorKinds.has(`${actor.id}:${check.kind}`));
    actorKinds.add(`${actor.id}:${check.kind}`);
    const advantage = actor.conditions.includes(`advantage:${check.stat}`),
      disadvantage = actor.conditions.includes(`disadvantage:${check.stat}`);
    requireRule(
      check.advantage ===
        (advantage === disadvantage
          ? "normal"
          : advantage
            ? "advantage"
            : "disadvantage"),
    );
    if (
      check.kind === "skill" &&
      source.snapshot.settings.values.checkFrequency === "narrative"
    )
      requireRule(check.important);
    if (check.kind === "attack") {
      const action = plan.publicPatches.find(
        (patch) =>
          patch.kind === "encounter.action" &&
          patch.action === "attack" &&
          patch.actorId === actor.id &&
          patch.targetId === check.targetId,
      );
      const target = source.snapshot.entities.find(
        (row) => row.id === check.targetId,
      );
      requireRule(
        lootCheckAuthorized(source, input, plan, check) ||
          (action && target && check.dc === (target.stats.defense ?? 10)),
      );
    }
    if (check.kind === "skill" && plan.publicPatches.some((patch) =>
      patch.kind === "encounter.action" && patch.action === "attempt" &&
      patch.actorId === check.actorId && patch.targetId === check.targetId)) {
      const target = source.snapshot.entities.find((row) => row.id === check.targetId);
      requireRule(target && check.dc === (target.stats.defense ?? 10));
    }
    if (check.kind === "transform")
      requireRule(
        check.dc === basicProfile.transformDc &&
          plan.publicPatches.some(
            (patch) =>
              patch.kind === "item.transform" && patch.actorId === actor.id,
          ),
      );
    checkModifier(source, check);
  }
  for (const action of plan.publicPatches) {
    validateMechanicChoice(action);
    if (action.kind === "item.transform")
      requireRule(
        plan.checks.filter(
          (check) =>
            check.kind === "transform" && check.actorId === action.actorId,
        ).length === 1,
      );
    if (action.kind === "forage")
      requireRule(
        plan.checks.filter(
          (check) =>
            check.kind === "skill" &&
            check.actorId === action.actorId &&
            check.dc === basicProfile.forageDc,
        ).length === 1,
      );
    if (action.kind === "encounter.action" && action.action === "attack")
      requireRule(
        plan.checks.filter(
          (check) =>
            check.kind === "attack" &&
            check.actorId === action.actorId &&
            check.targetId === action.targetId,
        ).length === 1,
      );
    if (action.kind === "encounter.action" && action.action === "attempt")
      requireRule(plan.checks.filter((check) =>
        check.kind === "skill" && check.actorId === action.actorId &&
        check.targetId === action.targetId).length === 1);
  }
  // Preflight both possible outcomes, before randomness or public narration. No mutation escapes this clone.
  for (const success of [false, true])
    resolveMechanics(
      source,
      input,
      plan,
      plan.checks.map((check) => ({
        ...check,
        id: stableGameplayId(input.operationId, `check:${check.index}`),
        dice: [10],
        kept: 10,
        modifier: checkModifier(source, check),
        total: 10 + checkModifier(source, check),
        success,
        rollNumber: 1,
      })),
      true,
    );
}

export function resolveMechanics(
  original: RuntimeSource,
  input: TurnInput,
  plan: DmPlan,
  checks: RecordedCheck[],
  preflight = false,
): MechanicsResolution {
  const source = structuredClone(original);
  const snapshot = source.snapshot,
    runtime = source.runtime,
    cid = snapshot.campaign.id;
  const config = runtime.configuration;
  const changes = new Map<string, RecordChange>();
  const outcomes: MechanicsResolution["outcomes"] = [];
  let minutes = runtime.worldMinutes;
  if (plan.publicPatches.length || checks.length) configured(source);
  requireRule(checks.length === plan.checks.length);
  for (const proposed of plan.checks) {
    const check = checks.find((row) => row.index === proposed.index);
    requireRule(
      check &&
        check.id ===
          stableGameplayId(input.operationId, `check:${proposed.index}`),
    );
    for (const key of Object.keys(proposed) as Array<keyof CheckProposal>)
      requireRule(check[key] === proposed[key]);
    if (!preflight) {
      requireRule(
        check.dice.length === (check.advantage === "normal" ? 1 : 2) &&
          check.dice.every((n) => integer(n, 1, 20)),
      );
      requireRule(
        check.kept ===
          (check.advantage === "disadvantage"
            ? Math.min(...check.dice)
            : Math.max(...check.dice)),
      );
      requireRule(
        check.modifier === checkModifier(original, proposed) &&
          check.total === check.kept + check.modifier &&
          check.success === check.total >= check.dc,
      );
    }
  }
  function write(
    family: RecordFamily,
    row: object & { id?: string; campaign_id: string; revision?: number },
    values: object,
  ) {
    requireRule(row.campaign_id === cid);
    const id = row.id ?? cid,
      key = `${family}:${id}`,
      previous = changes.get(key);
    const saved = { ...values } as JsonObject;
    delete saved.id;
    delete saved.campaign_id;
    delete saved.revision;
    delete saved.updated_at;
    delete saved.created_at;
    changes.set(key, {
      family,
      id,
      expectedRevision: previous ? previous.expectedRevision : row.revision ?? null,
      values: { ...previous?.values, ...saved },
    });
    Object.assign(row, values);
  }
  function entity(id: string, controlled = true): Entity {
    const row = snapshot.entities.find(
      (item) => item.id === id && item.campaign_id === cid,
    );
    requireRule(row && config?.presentEntityIds.includes(id));
    if (controlled) requireRule(config?.controlledEntityIds.includes(id));
    requireRule(
      !row.conditions.includes("dead") && !row.conditions.includes("withdrawn"),
    );
    return row;
  }
  const activeRest = () =>
    runtime.restRecords.find(
      (row) => row.campaign_id === cid && row.status === "planned",
    );
  const activeEncounter = () =>
    runtime.encounters.find(
      (row) => row.campaign_id === cid && row.status === "active",
    );
  function settingsAt(revision: number) {
    const settings =
      snapshot.settings.revision === revision
        ? snapshot.settings.values
        : snapshot.settingsHistory.find(
            (row) => row.campaign_id === cid && row.revision === revision,
          )?.values;
    requireRule(
      settings && supportedActivityRuleset(settings.rulesSystem?.id),
    );
    return settings;
  }
  function storage(id: string, deposit = false): Storage {
    const row = snapshot.storages.find(
      (item) => item.id === id && item.campaign_id === cid,
    );
    requireRule(row);
    if (row.kind === "camp")
      requireRule(deposit || activeRest()?.kind === "long");
    else if (row.kind === "transport")
      requireRule(config?.nearbyStorageIds.includes(id));
    else
      requireRule(
        row.entity_id &&
          config?.presentEntityIds.includes(row.entity_id) &&
          config.controlledEntityIds.includes(row.entity_id),
      );
    return row;
  }
  function item(id: string, quantity = 1): Item {
    const row = snapshot.items.find(
      (value) => value.id === id && value.campaign_id === cid,
    );
    requireRule(row && integer(quantity, 1) && row.quantity >= quantity);
    requireRule(
      row.owner_entity_id === null ||
        config?.controlledEntityIds.includes(row.owner_entity_id),
    );
    storage(row.storage_id);
    return row;
  }
  const tagged = (id: string, tag: ItemTag) =>
    config?.itemRules.some((rule) => rule.itemId === id && rule.tag === tag) ??
    false;
  function consume(row: Item, quantity: number) {
    requireRule(integer(quantity, 1) && row.quantity >= quantity);
    write("items", row, {
      quantity: row.quantity - quantity,
      ...(row.quantity === quantity
        ? { equipped_entity_id: null, equipped_slot: null }
        : {}),
    });
  }
  function quantities(list: ItemQuantity[]) {
    requireRule(
      Array.isArray(list) &&
        list.length <= 50 &&
        new Set(list.map((row) => row.itemId)).size === list.length,
    );
    return list.map((part) => ({
      row: item(part.itemId, part.quantity),
      quantity: part.quantity,
    }));
  }
  function resultFor(actorId: string, kind: CheckProposal["kind"]) {
    const matches = checks.filter(
      (check) => check.actorId === actorId && check.kind === kind,
    );
    requireRule(matches.length === 1);
    return matches[0].success;
  }
  const newId = (key: string) => stableGameplayId(input.operationId, key);
  const outcome = (
    kind: string,
    text: string,
    entityIds: string[] = [],
    itemIds: string[] = [],
  ) => outcomes.push({ kind, text, entityIds, itemIds });
  function newItem(
    key: string,
    values: Omit<Item, "id" | "campaign_id" | "revision" | "updated_at">,
    tag: ItemTag,
    damage: number | null = null,
  ) {
    const row = {
      ...values,
      id: newId(key),
      campaign_id: cid,
      revision: 0,
      updated_at: "",
    };
    requireRule(!snapshot.items.some((existing) => existing.id === row.id));
    write("items", row, values);
    changes.get(`items:${row.id}`)!.expectedRevision = null;
    snapshot.items.push(row);
    config!.itemRules.push({ itemId: row.id, tag, damage });
    return row;
  }
  function provenance(
    index: number,
    inputs: Array<
      ItemQuantity & { disposition: "consumed" | "embedded" | "retained" }
    >,
    outputs: string[],
  ) {
    const session = snapshot.publicState.current_session_id;
    requireRule(session);
    const row = { id: newId(`provenance:${index}`), campaign_id: cid };
    write("provenance", row, {
      operation_id: input.operationId,
      session_id: session,
      inputs,
      outputItemIds: outputs,
    });
  }
  function damage(target: Entity, amount: number) {
    requireRule(
      target.hp !== null && target.max_hp !== null && integer(amount),
    );
    let remaining = amount;
    const meal = runtime.effects.find(
      (effect) =>
        effect.entity_id === target.id &&
        effect.definition.kind === "meal" &&
        effect.definition.status === "active",
    );
    if (meal) {
      const absorbed = Math.min(remaining, Number(meal.definition.remaining));
      requireRule(integer(absorbed, 0, 2));
      remaining -= absorbed;
      write("effects", meal, {
        definition: {
          ...meal.definition,
          remaining: Number(meal.definition.remaining) - absorbed,
        },
      });
    }
    let hp = Math.max(0, target.hp - remaining),
      conditions = [...target.conditions];
    if (hp === 0) {
      const defeat = settingsAt(
        activeEncounter()?.settings_revision ?? snapshot.settings.revision,
      ).difficulty.defeat;
      if (defeat === "death")
        conditions = [...new Set([...conditions, "dead"])];
      else {
        hp = 1;
        conditions = [
          ...new Set([
            ...conditions,
            "withdrawn",
            defeat === "injuries" ? "injured" : "setback",
          ]),
        ];
      }
      const participant = runtime.participants.find(
        (p) =>
          p.entity_id === target.id && p.encounter_id === activeEncounter()?.id,
      );
      if (participant)
        write("encounter_participants", participant, {
          public_resources: {
            ...participant.public_resources,
            withdrawn: true,
          },
        });
    }
    write("entities", target, { hp, conditions });
  }
  function heal(target: Entity, amount: number) {
    requireRule(target.hp !== null && target.max_hp !== null);
    write("entities", target, {
      hp: Math.min(target.max_hp, target.hp + amount),
    });
  }
  function participant(id: string): EncounterParticipant {
    const encounter = activeEncounter();
    requireRule(encounter);
    const row = runtime.participants.find(
      (p) =>
        p.encounter_id === encounter.id &&
        p.entity_id === id &&
        p.campaign_id === cid,
    );
    requireRule(row && !row.public_resources.withdrawn);
    return row;
  }
  function budget(
    row: EncounterParticipant,
    key: "action" | "move" | "reaction",
  ) {
    requireRule(row.public_resources[key] === 1);
    write("encounter_participants", row, {
      public_resources: { ...row.public_resources, [key]: 0 },
    });
  }
  for (const [index, action] of plan.publicPatches.entries()) {
    validateMechanicChoice(action);
    switch (action.kind) {
      case "resource.spend": {
        const actor = entity(action.entityId);
        requireRule(
          /^[a-z][a-z0-9_-]{0,39}$/.test(action.resource) &&
            integer(action.amount, 1) &&
            Object.hasOwn(actor.resources, action.resource),
        );
        requireRule(
          integer(actor.resources[action.resource]) &&
            actor.resources[action.resource] >= action.amount,
        );
        write("entities", actor, {
          resources: {
            ...actor.resources,
            [action.resource]: actor.resources[action.resource] - action.amount,
          },
        });
        outcome(action.kind, "The recorded resource cost was spent.", [
          actor.id,
        ]);
        break;
      }
      case "item.consume": {
        const actor = entity(action.actorId),
          used = item(action.itemId, action.quantity);
        requireRule(
          tagged(used.id, "healing") &&
            action.quantity === 1 &&
            !activeEncounter(),
        );
        consume(used, 1);
        heal(actor, basicProfile.healing);
        outcome(
          action.kind,
          "One healing item was consumed and recovery was applied.",
          [actor.id],
          [used.id],
        );
        break;
      }
      case "item.transfer": {
        entity(action.actorId);
        const row = item(action.itemId, action.quantity);
        storage(action.destinationStorageId, true);
        requireRule(row.storage_id !== action.destinationStorageId);
        if (row.quantity === action.quantity)
          write("items", row, {
            storage_id: action.destinationStorageId,
            equipped_entity_id: null,
            equipped_slot: null,
          });
        else {
          consume(row, action.quantity);
          const split = {
            ...row,
            id: newId(`split:${index}`),
            quantity: action.quantity,
            storage_id: action.destinationStorageId,
            equipped_entity_id: null,
            equipped_slot: null,
            revision: 0,
          };
          write("items", split, split);
          changes.get(`items:${split.id}`)!.expectedRevision = null;
          snapshot.items.push(split);
          for (const rule of config!.itemRules.filter(
            (r) => r.itemId === row.id,
          ))
            config!.itemRules.push({ ...rule, itemId: split.id });
          provenance(
            index,
            [
              {
                itemId: row.id,
                quantity: action.quantity,
                disposition: "retained",
              },
            ],
            [split.id],
          );
        }
        outcome(
          action.kind,
          "The requested quantity was transferred.",
          [],
          [row.id],
        );
        break;
      }
      case "item.equip": {
        const actor = entity(action.actorId),
          row = item(action.itemId);
        const heldStorage = storage(row.storage_id);
        requireRule(
          heldStorage.entity_id === actor.id || heldStorage.kind === "camp",
        );
        if (action.slot !== null) {
          const slot = actor.equipment_slots.find((s) => s.id === action.slot);
          requireRule(slot && slot.accepts.includes(row.category));
          requireRule(
            !snapshot.items.some(
              (other) =>
                other.id !== row.id &&
                other.equipped_entity_id === actor.id &&
                other.equipped_slot === action.slot,
            ),
          );
          const destination = snapshot.storages.find(
            (s) =>
              s.entity_id === actor.id &&
              s.campaign_id === cid &&
              ["player", "companion"].includes(s.kind),
          );
          requireRule(destination);
          write("items", row, {
            storage_id: destination.id,
            equipped_entity_id: actor.id,
            equipped_slot: action.slot,
          });
        } else
          write("items", row, {
            equipped_entity_id: null,
            equipped_slot: null,
          });
        outcome(
          action.kind,
          "Equipment assignment was updated.",
          [actor.id],
          [row.id],
        );
        break;
      }
      case "quest.transition": {
        const quest = snapshot.quests.find(
          (q) => q.id === action.questId && q.campaign_id === cid,
        );
        requireRule(
          quest && ["open", "complete", "archived"].includes(action.status),
        );
        requireRule(quest.status === "open" && action.status !== "open");
        write("quests", quest, { status: action.status });
        outcome(action.kind, "The quest status changed prospectively.");
        break;
      }
      case "location.move": {
        requireRule(!activeRest() && !activeEncounter());
        const location = snapshot.locations.find(
          (l) => l.id === action.locationId && l.campaign_id === cid,
        );
        requireRule(location);
        write("public_state", snapshot.publicState, {
          current_location_id: location.id,
        });
        write("locations", location, { status: "visited" });
        outcome(action.kind, "The party reached the selected known location.");
        break;
      }
      case "rest.enter": {
        requireRule(
          !activeRest() &&
            !activeEncounter() &&
            ["short", "long"].includes(action.restKind),
        );
        requireRule(
          config!.safeLocationIds.includes(
            snapshot.publicState.current_location_id ?? "",
          ),
        );
        requireRule(
          unique(action.participantIds) && action.participantIds.length > 0,
        );
        for (const id of action.participantIds) entity(id);
        const rest = {
          id: newId(`rest:${index}`),
          campaign_id: cid,
          kind: action.restKind,
          status: "planned" as const,
          settings_revision: snapshot.settings.revision,
          public_outcome: {
            participantIds: action.participantIds,
            startedAtMinutes: minutes,
          },
          created_at: "",
        };
        runtime.restRecords.push(rest);
        write("rest_records", rest, rest);
        outcome(
          action.kind,
          "Rest began. Recovery requires explicit completion.",
          action.participantIds,
        );
        break;
      }
      case "rest.leave": {
        const rest = activeRest();
        requireRule(rest && rest.id === action.restId);
        write("rest_records", rest, { status: "interrupted" });
        for (const effect of runtime.effects.filter(
          (e) =>
            e.definition.creatingRestId === rest.id &&
            e.definition.status === "pending",
        ))
          write("effects", effect, {
            definition: { ...effect.definition, status: "expired" },
          });
        outcome(
          action.kind,
          "Rest ended without recovery. Completed transfers and preparation remain saved.",
        );
        break;
      }
      case "rest.complete": {
        const rest = activeRest();
        requireRule(rest && rest.id === action.restId && !activeEncounter());
        requireRule(
          config!.safeLocationIds.includes(
            snapshot.publicState.current_location_id ?? "",
          ),
        );
        const participantIds = rest.public_outcome.participantIds;
        requireRule(
          Array.isArray(participantIds) &&
            participantIds.every((id) => typeof id === "string"),
        );
        const actors = participantIds.map((id) => entity(id as string));
        const settings = settingsAt(rest.settings_revision);
        const cost =
          settings.difficulty[
            rest.kind === "long" ? "longRestSupplyCost" : "shortRestSupplyCost"
          ] * actors.length;
        const supplies = quantities(action.supplies);
        requireRule(
          supplies.every(
            ({ row }) =>
              isRestProvision(row, config!.itemRules) &&
              !source.astraSettlementItemPolicies?.some((policy) =>
                policy.itemId === row.id && policy.visibility === "private"),
          ),
        );
        requireRule(supplies.reduce((sum, p) => sum + p.quantity, 0) === cost);
        for (const part of supplies) consume(part.row, part.quantity);
        const recovery =
          basicProfile.recovery[rest.kind][settings.difficulty.recovery];
        for (const actor of actors) {
          requireRule(actor.max_hp !== null);
          heal(actor, Math.ceil(actor.max_hp * recovery));
        }
        minutes +=
          rest.kind === "long"
            ? basicProfile.longMinutes
            : basicProfile.shortMinutes;
        write("rest_records", rest, {
          status: "complete",
          public_outcome: {
            ...rest.public_outcome,
            completedAtMinutes: minutes,
            supplies: action.supplies,
            recovery,
          },
        });
        if (rest.kind === "long")
          for (const effect of runtime.effects) {
            if (
              effect.definition.creatingRestId === rest.id &&
              effect.definition.status === "pending"
            )
              write("effects", effect, {
                definition: { ...effect.definition, status: "active" },
              });
            else if (effect.definition.status === "active")
              write("effects", effect, {
                definition: { ...effect.definition, status: "expired" },
              });
          }
        outcome(
          action.kind,
          "The rest completed with its recorded supply costs and recovery.",
          actors.map((a) => a.id),
          supplies.map((p) => p.row.id),
        );
        break;
      }
      case "recipe.prepare": {
        const actor = entity(action.actorId),
          rest = activeRest();
        requireRule(
          rest?.kind === "long" && ["meal", "coffee"].includes(action.recipe),
        );
        storage(action.outputStorageId);
        const parts = quantities(action.ingredients),
          required: ItemTag[] =
            action.recipe === "meal" ? ["meat"] : ["coffee", "water"];
        requireRule(
          parts.length === required.length &&
            parts.every((p) => p.quantity === 1),
        );
        requireRule(
          required.every(
            (tag) => parts.filter((p) => tagged(p.row.id, tag)).length === 1,
          ),
        );
        for (const part of parts) consume(part.row, part.quantity);
        const tag =
          action.recipe === "meal" ? "meal-serving" : "coffee-serving";
        const output = newItem(
          `prepared:${index}`,
          {
            name:
              action.recipe === "meal" ? "Prepared meal" : "Prepared coffee",
            category: "consumable",
            quantity: 1,
            description: "Prepared under the configured house rules.",
            mechanics:
              "Requires explicit serving; preparation grants no effect.",
            owner_entity_id: actor.id,
            storage_id: action.outputStorageId,
            equipped_entity_id: null,
            equipped_slot: null,
          },
          tag,
        );
        provenance(
          index,
          parts.map((p) => ({
            itemId: p.row.id,
            quantity: p.quantity,
            disposition: "consumed",
          })),
          [output.id],
        );
        outcome(
          action.kind,
          "Ingredients were consumed to prepare one serving. No benefit has been applied.",
          [actor.id],
          [output.id],
        );
        break;
      }
      case "recipe.serve": {
        entity(action.actorId);
        const rest = activeRest();
        requireRule(
          rest?.kind === "long" &&
            unique(action.recipientIds) &&
            action.recipientIds.length > 0,
        );
        const serving = item(action.itemId, action.recipientIds.length),
          kind = tagged(serving.id, "meal-serving")
            ? "meal"
            : tagged(serving.id, "coffee-serving")
              ? "coffee"
              : null;
        requireRule(kind);
        for (const id of action.recipientIds) {
          entity(id);
          requireRule(
            Array.isArray(rest.public_outcome.participantIds) &&
              rest.public_outcome.participantIds.includes(id),
          );
          for (const old of runtime.effects.filter(
            (e) =>
              e.entity_id === id &&
              e.definition.kind === kind &&
              e.definition.status !== "expired",
          ))
            write("effects", old, {
              definition: { ...old.definition, status: "expired" },
            });
          const effect = {
            id: newId(`effect:${index}:${id}`),
            campaign_id: cid,
            entity_id: id,
            recipe_id: null,
            definition: {
              kind,
              status: "pending",
              creatingRestId: rest.id,
              remaining: kind === "meal" ? 2 : 1,
            },
          };
          runtime.effects.push(effect);
          write("effects", effect, effect);
        }
        consume(serving, action.recipientIds.length);
        outcome(
          action.kind,
          "Servings were consumed. Benefits activate after this long rest and never stack.",
          action.recipientIds,
          [serving.id],
        );
        break;
      }
      case "item.transform": {
        const actor = entity(action.actorId);
        requireRule(action.recipe === "improvised-spear" && !activeEncounter());
        storage(action.outputStorageId);
        const parts = quantities(action.inputs);
        requireRule(parts.length === 3 && parts.every((p) => p.quantity === 1));
        for (const tag of ["knife", "stick", "binding"] as ItemTag[])
          requireRule(parts.filter((p) => tagged(p.row.id, tag)).length === 1);
        requireRule(
          unique(action.toolIds) &&
            action.toolIds.length === 1 &&
            !parts.some((p) => action.toolIds.includes(p.row.id)),
        );
        const tool = item(action.toolIds[0]);
        requireRule(tagged(tool.id, "cutting-tool"));
        const success = resultFor(actor.id, "transform"),
          inputs: Array<
            ItemQuantity & { disposition: "consumed" | "embedded" | "retained" }
          > = [];
        for (const part of parts) {
          const binding = tagged(part.row.id, "binding");
          if (success || binding) consume(part.row, 1);
          inputs.push({
            itemId: part.row.id,
            quantity: 1,
            disposition: success
              ? binding
                ? "consumed"
                : "embedded"
              : binding
                ? "consumed"
                : "retained",
          });
        }
        inputs.push({ itemId: tool.id, quantity: 1, disposition: "retained" });
        minutes += basicProfile.transformMinutes;
        const outputs = success
          ? [
              newItem(
                `transform:${index}`,
                {
                  name: "Improvised spear",
                  category: "weapon",
                  quantity: 1,
                  description:
                    "An improvised spear assembled from recorded components.",
                  mechanics:
                    "House profile weapon: 3 damage on a successful attack.",
                  owner_entity_id: actor.id,
                  storage_id: action.outputStorageId,
                  equipped_entity_id: null,
                  equipped_slot: null,
                },
                "weapon",
                basicProfile.spearDamage,
              ).id,
            ]
          : [];
        provenance(index, inputs, outputs);
        outcome(
          action.kind,
          success
            ? "Assembly succeeded. Components were embedded and binding consumed; the cutting tool remains."
            : "Assembly failed. Binding and ten minutes were spent; components and the cutting tool remain.",
          [actor.id],
          outputs,
        );
        break;
      }
      case "forage": {
        const actor = entity(action.actorId);
        requireRule(!activeEncounter() && !activeRest());
        storage(action.outputStorageId);
        minutes += basicProfile.forageMinutes;
        const success = resultFor(actor.id, "skill");
        const outputs = success
          ? [
              newItem(
                `forage:${index}`,
                {
                  name: "Foraged supplies",
                  category: "supply",
                  quantity:
                    basicProfile.forageYield[
                      snapshot.settings.values.difficulty.scarcity
                    ],
                  description: "Supplies from the resolved forage action.",
                  mechanics: "Rest supplies only; not recipe ingredients.",
                  owner_entity_id: actor.id,
                  storage_id: action.outputStorageId,
                  equipped_entity_id: null,
                  equipped_slot: null,
                },
                "supply",
              ).id,
            ]
          : [];
        provenance(index, [], outputs);
        outcome(
          action.kind,
          success
            ? "Foraging produced the configured quantity of supplies."
            : "Foraging used one hour without finding supplies.",
          [actor.id],
          outputs,
        );
        break;
      }
      case "encounter.start": {
        requireRule(
          !activeEncounter() &&
            !activeRest() &&
            unique(action.participantIds) &&
            action.participantIds.length >= 2,
        );
        const actors = action.participantIds.map((id) => entity(id, false));
        requireRule(
          actors.some((a) => config!.controlledEntityIds.includes(a.id)) &&
            actors.some((a) => a.kind === "npc"),
        );
        const encounter = {
          id: newId(`encounter:${index}`),
          campaign_id: cid,
          status: "active" as const,
          round: 1,
          outcome: null,
          settings_revision: snapshot.settings.revision,
          public_summary: "Encounter active.",
        };
        runtime.encounters.push(encounter);
        write("encounters", encounter, encounter);
        for (const [order, actor] of actors.entries()) {
          requireRule(
            actor.hp !== null && actor.max_hp !== null && actor.hp > 0,
          );
          const oldParticipant = runtime.participants.findLast(
            (p) =>
              p.entity_id === actor.id &&
              typeof p.public_resources.originalMaxHp === "number",
          );
          const originalMaxHp = Number(
            oldParticipant?.public_resources.originalMaxHp ?? actor.max_hp,
          );
          if (
            actor.kind === "npc" &&
            snapshot.settings.values.rulesSystem.enemyHpScaling
          ) {
            const max = Math.max(
              1,
              Math.ceil(
                originalMaxHp *
                  snapshot.settings.values.difficulty.enemyHpMultiplier,
              ),
            );
            write("entities", actor, {
              max_hp: max,
              hp: Math.max(1, Math.ceil((actor.hp / actor.max_hp) * max)),
            });
          }
          const p = {
            id: newId(`participant:${index}:${actor.id}`),
            campaign_id: cid,
            encounter_id: encounter.id,
            entity_id: actor.id,
            public_name: actor.name,
            turn_order: order,
            public_position: { position: "nearby" },
            public_resources: {
              action: 1,
              move: 1,
              reaction: 1,
              active: order === 0,
              defending: false,
              withdrawn: false,
              originalMaxHp,
            },
          };
          runtime.participants.push(p);
          write("encounter_participants", p, p);
        }
        outcome(
          action.kind,
          "The encounter began with recorded participants and separate action, move and reaction budgets.",
          action.participantIds,
        );
        break;
      }
      case "encounter.action": {
        requireRule(
          [
            "attack",
            "attempt",
            "defend",
            "move",
            "end-turn",
            "intercept",
            "item",
          ].includes(action.action),
        );
        const actor = entity(action.actorId, false),
          current = participant(actor.id),
          encounter = activeEncounter()!;
        requireRule(
          config!.controlledEntityIds.includes(actor.id) ||
            actor.kind === "npc",
        );
        if (action.action !== "intercept")
          requireRule(current.public_resources.active === true);
        if (action.action === "attack") {
          requireRule(action.targetId && action.position === null);
          const target = entity(action.targetId, false),
            targetP = participant(target.id);
          requireRule(
            actor.id !== target.id &&
              config!.controlledEntityIds.includes(actor.id) !==
                config!.controlledEntityIds.includes(target.id),
          );
          requireRule(
            current.public_position.position !== "far" &&
              targetP.public_position.position !== "far",
          );
          budget(current, "action");
          let amount: number = basicProfile.weaponDamage;
          if (action.itemId !== null) {
            const weapon = actor.kind === "npc" &&
                !config!.controlledEntityIds.includes(actor.id)
              ? snapshot.items.find((candidate) =>
                  candidate.id === action.itemId && candidate.campaign_id === cid &&
                  candidate.owner_entity_id === actor.id && candidate.quantity > 0)
              : item(action.itemId);
            requireRule(
              weapon && weapon.equipped_entity_id === actor.id &&
                tagged(weapon.id, "weapon"),
            );
            amount =
              config!.itemRules.find(
                (rule) => rule.itemId === weapon.id && rule.tag === "weapon",
              )!.damage ?? basicProfile.weaponDamage;
          }
          const settings = settingsAt(encounter.settings_revision);
          if (actor.kind === "npc" && settings.rulesSystem.enemyDamageScaling)
            amount = Math.ceil(
              amount * settings.difficulty.enemyDamageMultiplier,
            );
          if (
            targetP.public_resources.defending ||
            targetP.public_position.position === "cover"
          )
            amount = Math.max(0, amount - 1);
          if (resultFor(actor.id, "attack")) damage(target, amount);
          outcome(
            action.kind,
            resultFor(actor.id, "attack")
              ? "The attack hit; code-validated damage was applied."
              : "The attack missed; its action cost was spent.",
            [actor.id, target.id],
          );
        } else if (action.action === "attempt") {
          requireRule(action.targetId && action.position === null &&
            action.targetId !== actor.id);
          const target = entity(action.targetId, false);
          participant(target.id);
          requireRule(config!.controlledEntityIds.includes(actor.id) !==
            config!.controlledEntityIds.includes(target.id));
          if (action.itemId !== null) {
            const held = item(action.itemId);
            requireRule(held.owner_entity_id === actor.id &&
              held.equipped_entity_id === actor.id);
          }
          budget(current, "action");
          outcome(action.kind,
            resultFor(actor.id, "skill")
              ? "The physical attempt made contact; no condition, damage or transfer was established."
              : "The physical attempt failed; no condition, damage or transfer was established.",
            [actor.id, target.id]);
        } else if (action.action === "defend") {
          requireRule(
            action.targetId === null &&
              action.itemId === null &&
              action.position === null,
          );
          budget(current, "action");
          write("encounter_participants", current, {
            public_resources: { ...current.public_resources, defending: true },
          });
          outcome(action.kind, "The actor defends until their next turn.", [
            actor.id,
          ]);
        } else if (action.action === "move") {
          requireRule(
            action.targetId === null &&
              action.itemId === null &&
              action.position &&
              ["nearby", "far", "cover"].includes(action.position),
          );
          budget(current, "move");
          write("encounter_participants", current, {
            public_position: { position: action.position },
          });
          outcome(
            action.kind,
            "The public position changed; the move budget was spent.",
            [actor.id],
          );
        } else if (action.action === "intercept") {
          requireRule(
            action.targetId &&
              action.itemId === null &&
              action.position === null &&
              !current.public_resources.active,
          );
          const target = entity(action.targetId, false),
            targetP = participant(target.id);
          requireRule(
            target.id !== actor.id &&
              config!.controlledEntityIds.includes(actor.id) ===
                config!.controlledEntityIds.includes(target.id) &&
              current.public_position.position !== "far" &&
              targetP.public_position.position !== "far",
          );
          budget(current, "reaction");
          write("encounter_participants", targetP, {
            public_resources: { ...targetP.public_resources, defending: true },
          });
          outcome(
            action.kind,
            "A reaction was spent to protect the selected ally.",
            [actor.id, target.id],
          );
        } else if (action.action === "item") {
          requireRule(
            action.itemId && action.targetId && action.position === null,
          );
          const target = entity(action.targetId),
            used = item(action.itemId);
          requireRule(
            tagged(used.id, "healing") && used.owner_entity_id === actor.id,
          );
          participant(target.id);
          budget(current, "action");
          consume(used, 1);
          heal(target, basicProfile.healing);
          outcome(
            action.kind,
            "One healing item and the action budget were spent.",
            [actor.id, target.id],
            [used.id],
          );
        } else {
          requireRule(
            action.targetId === null &&
              action.itemId === null &&
              action.position === null,
          );
          const order = runtime.participants
            .filter(
              (p) =>
                p.encounter_id === encounter.id &&
                !p.public_resources.withdrawn &&
                snapshot.entities.some((candidate) =>
                  candidate.id === p.entity_id && candidate.hp !== null &&
                  candidate.hp > 0 && !candidate.conditions.includes("dead") &&
                  !candidate.conditions.includes("withdrawn")),
            )
            .sort((a, b) => a.turn_order - b.turn_order);
          requireRule(order.length > 0);
          const next =
              order[
                (order.findIndex((p) => p.id === current.id) + 1) % order.length
              ],
            wrapped = next.turn_order <= current.turn_order;
          for (const p of order)
            write("encounter_participants", p, {
              public_resources: {
                ...p.public_resources,
                active: p.id === next.id,
                ...(wrapped ? { reaction: 1 } : {}),
                ...(p.id === next.id
                  ? { action: 1, move: 1, defending: false }
                  : {}),
              },
            });
          if (wrapped)
            write("encounters", encounter, { round: encounter.round + 1 });
          outcome(action.kind, "The next eligible participant may act.", [
            actor.id,
            next.entity_id!,
          ]);
        }
        const pending = {
          id: newId(`action:${index}`),
          campaign_id: cid,
          encounter_id: encounter.id,
          participant_id: current.id,
          status: "resolved",
          public_proposal: { action: action.action, targetId: action.targetId },
        };
        write("pending_actions", pending, pending);
        break;
      }
      case "encounter.end": {
        const encounter = activeEncounter();
        requireRule(
          encounter &&
            [
              "victory",
              "escape",
              "surrender",
              "negotiation",
              "objective-completion",
            ].includes(action.outcome),
        );
        if (action.outcome === "victory")
          requireRule(
            runtime.participants
              .filter(
                (p) =>
                  p.encounter_id === encounter.id &&
                  !config!.controlledEntityIds.includes(p.entity_id ?? ""),
              )
              .every((p) => p.public_resources.withdrawn),
          );
        if (action.outcome === "objective-completion")
          requireRule(snapshot.quests.some((q) => q.status === "complete"));
        write("encounters", encounter, {
          status: "ended",
          outcome: action.outcome,
          public_summary:
            "The encounter ended. No automatic recovery or loot was granted.",
        });
        for (const p of runtime.participants.filter(
          (p) => p.encounter_id === encounter.id,
        ))
          write("encounter_participants", p, {
            public_resources: { ...p.public_resources, active: false },
          });
        for (const actor of snapshot.entities.filter(
          (e) =>
            config!.controlledEntityIds.includes(e.id) &&
            e.conditions.includes("withdrawn") &&
            !e.conditions.includes("dead"),
        ))
          write("entities", actor, {
            conditions: actor.conditions.filter(
              (condition) => condition !== "withdrawn",
            ),
          });
        outcome(
          action.kind,
          "The encounter ended with its recorded outcome; health and inventory remain authoritative.",
        );
        break;
      }
      default:
        throw new TurnError("validation");
    }
  }
  for (const check of checks.filter((c) => c.kind === "skill")) {
    const coffee = runtime.effects.find(
      (e) =>
        e.entity_id === check.actorId &&
        e.definition.kind === "coffee" &&
        e.definition.status === "active" &&
        e.definition.remaining === 1,
    );
    if (coffee)
      write("effects", coffee, {
        definition: { ...coffee.definition, remaining: 0, status: "expired" },
      });
  }
  requireRule(integer(minutes, 0, Number.MAX_SAFE_INTEGER));
  return {
    changes: [...changes.values()],
    worldMinutes: minutes,
    configuration: config,
    outcomes,
  };
}
