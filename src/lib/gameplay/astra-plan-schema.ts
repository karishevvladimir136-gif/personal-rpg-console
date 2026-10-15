import type { TurnInput } from "./contracts.ts";
import type { RuntimeSource } from "./server-contracts.ts";
import type { AstraCapabilities } from "./astra-capabilities.ts";
import { settlementItemTransferAllowed } from "./astra-settlement.ts";

const obj = (properties: Record<string, unknown>) => ({ type: "object",
  additionalProperties: false, properties, required: Object.keys(properties) });
const nil = (type: string) => ({ type: [type,"null"] });
const enumString = (values: string[]) => ({ type: "string", enum: values.length ? values : ["__none__"] });
const array = (items: unknown) => ({ type: "array", items });

/** Repeated dynamic ID selections count toward the provider's total enum
 * budget unless they are referenced once. References preserve the exact
 * allowed values and nullability; no broader record-ID enum is introduced. */
function withSharedEnums(schema: Record<string, unknown>): Record<string, unknown> {
  const definitions: Record<string, unknown> = {};
  const names = new Map<string, string>();
  const visit = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(visit);
    if (!value || typeof value !== "object") return value;
    const node = value as Record<string, unknown>;
    if (Array.isArray(node.enum) && (node.enum.length > 1 ||
      node.enum.some((entry) => typeof entry === "string" &&
        /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(entry)))) {
      const key = JSON.stringify(node);
      let name = names.get(key);
      if (!name) {
        name = `selection${names.size}`;
        names.set(key, name);
        definitions[name] = node;
      }
      return { $ref: `#/$defs/${name}` };
    }
    return Object.fromEntries(Object.entries(node).map(([key, child]) => [key, visit(child)]));
  };
  return { ...(visit(schema) as Record<string, unknown>), $defs: definitions };
}

export function astraPlanResponseSchema(input: TurnInput, caps: AstraCapabilities, source: RuntimeSource) {
  const actors = caps.entityIds;
  const ids = [...new Set([input.campaignId,...actors,...caps.itemIds,...caps.participantIds])];
  const resourceKeys = [...new Set(Object.values(caps.resources).flat())];
  const tool = obj({ kind: enumString(["query","skill","attack","save","damage"]),
    actorId: { anyOf: [enumString(actors), { type:"null" }] },
    targetId: { anyOf: [enumString(actors), { type:"null" }] },
    dc: nil("integer"), itemId: { anyOf: [enumString(caps.toolItemIds), { type:"null" }] },
    scope: { type: ["string","null"], enum: ["current-public",null] } });
  const change = obj({ family: enumString(["entities","items","public_state","encounter_participants"]),
    id: enumString(ids), expectedRevision: nil("integer"), hp: nil("integer"),
    resources: { anyOf:[array(obj({ key: enumString(resourceKeys), value:{type:"integer"} })),{type:"null"}] },
    quantity: nil("integer"), locationId: { anyOf:[enumString(caps.locationIds),{type:"null"}] },
    position: { type:["string","null"], enum:["nearby","far","cover",null] } });
  const privatePatch = obj({ kind: enumString(["fact","clock","npc","faction","consequence"]),
    key:{type:"string"},operation:enumString(["set","advance"]),
    value:nil("string"),amount:nil("integer") });
  const outcome = obj({ kind:{type:"string"}, entityIds:array(enumString(actors)),
    itemIds:array(enumString([...new Set([...caps.itemIds,...caps.toolItemIds])])), text:{type:"string"} });
  const npcIds=source.snapshot.entities.filter((e)=>e.kind==="npc" &&
    source.worldTakeover?.presentEntityIds.includes(e.id)).map((e)=>e.id);
  const publicSellerIds=npcIds.filter((id)=>source.worldTakeover?.actors.some((a)=>
    a.entityId===id && typeof a.publicName==="string" && a.publicName.length>0));
  const playerIds=source.runtime.configuration?.controlledEntityIds ?? [];
  const jobs=(source.astraSettlementJobs ?? []).filter((j)=>j.rewardTerms &&
    !j.rewardOperationId).map((j)=>j.questId);
  const transferable=source.snapshot.items.filter((i)=>i.owner_entity_id &&
    npcIds.includes(i.owner_entity_id) && i.equipped_entity_id===null &&
    i.equipped_slot===null && ["food","supply","misc"].includes(i.category) &&
    i.mechanics.trim()==="" && settlementItemTransferAllowed(source,i.id))
    .map((i)=>i.id);
  const purchasable=source.snapshot.items.filter((i)=>
    i.owner_entity_id && publicSellerIds.includes(i.owner_entity_id) &&
    transferable.includes(i.id)).map((i)=>i.id);
  const sellable=source.snapshot.items.filter((i)=>
    playerIds.includes(i.owner_entity_id ?? "") && i.quantity>0 &&
    i.equipped_entity_id===null && i.equipped_slot===null &&
    settlementItemTransferAllowed(source,i.id)).map((i)=>i.id);
  const ingredients=source.snapshot.items.filter((i)=>
    sellable.includes(i.id) && ["food","supply","misc"].includes(i.category) &&
    i.mechanics.trim()==="" &&
    !source.astraSettlementItemPolicies?.some((p)=>p.itemId===i.id &&
      p.visibility!=="public")).map((i)=>i.id);
  const merchantBuyers=publicSellerIds;
  // Propose existing choices only. The resolver owns revisions, rest IDs,
  // supplies, recovery, elapsed time and every resulting RecordChange.
  const config=source.runtime.configuration;
  const mechanicActors=actors.filter((id)=>playerIds.includes(id));
  const mechanicItems=source.snapshot.items.filter((i)=>
    !source.astraSettlementItemPolicies?.some((p)=>p.itemId===i.id && p.visibility==="private") &&
    (actors.includes(i.owner_entity_id ?? "") ||
    mechanicActors.includes(i.equipped_entity_id ?? "") ||
    i.owner_entity_id===null || config?.nearbyStorageIds.includes(i.storage_id ?? "")))
    .map((i)=>i.id);
  const storageIds=(source.snapshot.storages ?? []).filter((s)=>
    mechanicActors.includes(s.entity_id ?? "") || s.entity_id===null ||
    config?.nearbyStorageIds.includes(s.id)).map((s)=>s.id);
  const questIds=(source.snapshot.quests ?? []).map((q)=>q.id);
  const restIds=(source.runtime.restRecords ?? []).filter((r)=>
    r.status==="planned").map((r)=>r.id);
  const slots=[...new Set(source.snapshot.entities.filter((e)=>
    mechanicActors.includes(e.id)).flatMap((e)=>
    (e.equipment_slots ?? []).map((s)=>s.id)))];
  const quantity=obj({itemId:enumString(mechanicItems),quantity:{type:"integer"}});
  const restSafety={anyOf:[obj({locationId:enumString(
    (source.snapshot.locations ?? []).filter((l)=>
      l.id===source.snapshot.publicState?.current_location_id &&
      ["known","visited"].includes(l.status)).map((l)=>l.id)),
    suitable:{type:"boolean"}}),{type:"null"}]};
  const mechanicAction={anyOf:[
    obj({kind:enumString(["resource.spend"]),entityId:enumString(mechanicActors),
      resource:enumString(resourceKeys),amount:{type:"integer"}}),
    obj({kind:enumString(["item.consume"]),actorId:enumString(mechanicActors),
      itemId:enumString(mechanicItems),quantity:{type:"integer"}}),
    obj({kind:enumString(["item.transfer"]),actorId:enumString(mechanicActors),
      itemId:enumString(mechanicItems),quantity:{type:"integer"},
      destinationStorageId:enumString(storageIds)}),
    obj({kind:enumString(["item.equip"]),actorId:enumString(mechanicActors),
      itemId:enumString(mechanicItems),
      slot:{anyOf:[enumString(slots),{type:"null"}]}}),
    obj({kind:enumString(["quest.transition"]),questId:enumString(questIds),
      status:enumString(["open","complete","archived"])}),
    obj({kind:enumString(["location.move"]),locationId:enumString(caps.locationIds)}),
    obj({kind:enumString(["rest.enter"]),restKind:enumString(["short","long"]),
      participantIds:array(enumString(mechanicActors))}),
    obj({kind:enumString(["rest.leave"]),restId:enumString(restIds)}),
    obj({kind:enumString(["rest.complete"]),restId:enumString(restIds),
      supplies:array(quantity)}),
    obj({kind:enumString(["recipe.prepare"]),actorId:enumString(mechanicActors),
      recipe:enumString(["meal","coffee"]),ingredients:array(quantity),
      outputStorageId:enumString(storageIds)}),
    obj({kind:enumString(["recipe.serve"]),actorId:enumString(mechanicActors),
      itemId:enumString(mechanicItems),recipientIds:array(enumString(mechanicActors))}),
  ]};
  const settlement=source.worldTakeover ? {anyOf:[
    obj({kind:enumString(["progression_award"]),
      recipientId:enumString(playerIds),
      trackId:enumString(source.astraProgressionState?.progression === "on"
        ? source.astraProgressionState.tracks.map((track)=>track.id) : []),
      amount:{type:"integer"}}),
    obj({kind:enumString(["job_offer"]),issuerId:enumString(npcIds),
      title:{type:"string"},description:{type:"string"},currencyName:nil("string"),
      currencyAmount:nil("integer"),itemName:nil("string"),
      itemCategory:{type:["string","null"],enum:["food","supply","misc",null]},
      itemDescription:nil("string")}),
    obj({kind:enumString(["job_complete"]),questId:enumString(jobs)}),
    obj({kind:enumString(["job_reward"]),questId:enumString(jobs),
      recipientId:enumString(playerIds)}),
    obj({kind:enumString(["mundane_grant"]),issuerId:enumString(npcIds),
      recipientId:enumString(playerIds),currencyName:nil("string"),
      currencyAmount:nil("integer"),itemName:nil("string"),
      itemCategory:{type:["string","null"],enum:["food","supply","misc",null]},
      itemDescription:nil("string")}),
    obj({kind:enumString(["currency_transfer"]),sourceEntityId:enumString(npcIds),
      recipientId:enumString(playerIds),
      currencyName:enumString((source.astraSettlementCurrencies ?? []).map((c)=>c.label)),
      amount:{type:"integer"}}),
    obj({kind:enumString(["item_transfer"]),sourceEntityId:enumString(npcIds),
      recipientId:enumString(playerIds),itemId:enumString(transferable),
      quantity:{type:"integer"}}),
    obj({kind:enumString(["mundane_purchase"]),sellerId:enumString(publicSellerIds),
      recipientId:enumString(playerIds),itemId:enumString(purchasable),
      quantity:{type:"integer"},
      currencyName:enumString((source.astraSettlementCurrencies ?? []).map((c)=>c.label)),
      price:{type:"integer"}}),
    obj({kind:enumString(["mundane_sale"]),buyerId:enumString(merchantBuyers),
      sellerId:enumString(playerIds),itemId:enumString(sellable),
      quantity:{type:"integer"},
      currencyName:enumString((source.astraSettlementCurrencies ?? []).map((c)=>c.label)),
      price:{type:"integer"}}),
    obj({kind:enumString(["mundane_craft"]),crafterId:enumString(playerIds),
      inputs:array(obj({itemId:enumString(ingredients),quantity:{type:"integer"}})),
      itemName:{type:"string"},itemCategory:enumString(["food","supply","misc"]),
      itemDescription:nil("string")}),
    obj({kind:enumString(["item_exchange"]),playerId:enumString(playerIds),
      counterpartyId:enumString(merchantBuyers),
      giveItemId:enumString(sellable),giveQuantity:{type:"integer"},
      receiveItemId:enumString(transferable),receiveQuantity:{type:"integer"}}),
    obj({kind:enumString(["mechanic_actions"]),actions:array(mechanicAction),restSafety}),
    obj({kind:enumString(["formal_rest"]),restKind:enumString(["short","long"]),restSafety}),
    {type:"null"}
  ]} : {type:"null"};
  const effects=source.worldTakeover
    ? array({anyOf:[...(settlement as {anyOf:unknown[]}).anyOf.slice(0,-1),
      obj({kind:enumString(["unsupported_optional"]),description:{type:"string",minLength:1,maxLength:160}})]})
    : array(obj({kind:enumString(["__none__"])}));
  const final = obj({ schemaVersion:{type:"integer",enum:[1]},
    worldMinutes:{type:"integer"},changes:array(change),
    outcomes:{...array(outcome), ...(source.astraResponseContract === "unified-v1" ? {maxItems:0} : {})},
    privatePatches:array(privatePatch),effects,
    ...(source.astraResponseContract === "unified-v1" ? {
      publicNarration: obj({
        beats: { ...array(obj({ text: { type: "string", minLength: 1, maxLength: 6000 },
          requiresEffects: { ...array({ type: "integer", minimum: 0, maximum: 5 }), maxItems: 6 } })),
          minItems: 1, maxItems: 12 },
        visualDescription: obj({ text: { type: "string", maxLength: 2000 },
          requiresEffects: { ...array({ type: "integer", minimum: 0, maximum: 5 }), maxItems: 6 } }),
      }),
    } : {}) });
  return withSharedEnums(obj({ type:enumString(["tool","final"]),
    call:{anyOf:[tool,{type:"null"}]},final:{anyOf:[final,{type:"null"}]} }));
}

