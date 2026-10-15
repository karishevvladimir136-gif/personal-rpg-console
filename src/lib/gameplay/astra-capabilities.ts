import type { RuntimeSource } from "./server-contracts.ts";
import { requireRule } from "./turn-errors.ts";

export type AstraCapabilities = {
  entityIds: string[];
  itemIds: string[];
  toolItemIds: string[];
  locationIds: string[];
  participantIds: string[];
  resources: Record<string, string[]>;
};
export function astraCapabilities(source: RuntimeSource): AstraCapabilities {
  const cid = source.snapshot.campaign.id;
  const config = source.runtime.configuration;
  requireRule(config?.profile === "console-basic-v1" &&
    (source.snapshot.settings.values.rulesSystem.id === "console-basic-v1" ||
      (source.snapshot.settings.values.rulesSystem.id === "world-logic-v1" &&
        source.worldTakeover?.schemaVersion === 1)));
  const present = new Set(source.astraStateContract==="generic-v1" ? config.presentEntityIds : source.worldTakeover
    ? source.worldTakeover.presentEntityIds : config.presentEntityIds);
  const entities = source.snapshot.entities.filter((e) => e.campaign_id === cid && present.has(e.id));
  const active = new Set(source.runtime.encounters.filter((e) => e.status === "active").map((e) => e.id));
  const participants = source.runtime.participants.filter((p) =>
    p.campaign_id === cid && active.has(p.encounter_id) &&
    p.public_resources.active === true && p.public_resources.withdrawn !== true);
  const actors = new Set(entities.map((e) => e.id));
  const controlled = new Set(config.controlledEntityIds);
  const ownedItems = source.snapshot.items.filter((i) => i.campaign_id === cid &&
    i.quantity > 0 && !!i.owner_entity_id && actors.has(i.owner_entity_id) &&
    (source.astraStateContract!=="generic-v1" || !source.astraSettlementItemPolicies?.some(p=>p.itemId===i.id && p.visibility!=="public")));
  return {
    entityIds: entities.map((e) => e.id),
    itemIds: ownedItems.filter((i) => controlled.has(i.owner_entity_id!) &&
      (i.equipped_entity_id === null || i.quantity > 1)).map((i) => i.id),
    toolItemIds: ownedItems.filter((i) => i.equipped_entity_id === i.owner_entity_id &&
      config.itemRules.some((r) => r.itemId === i.id && r.tag === "weapon")).map((i) => i.id),
    locationIds: source.snapshot.locations.filter((l) => l.campaign_id === cid &&
      ["known", "visited"].includes(l.status) &&
      (!source.worldTakeover || source.astraStateContract==="generic-v1" ||
        source.worldTakeover.routeLocationIds.includes(l.id))).map((l) => l.id),
    participantIds: participants.map((p) => p.id),
    resources: Object.fromEntries(entities.map((e) => [e.id, Object.keys(e.resources)])),
  };
}

