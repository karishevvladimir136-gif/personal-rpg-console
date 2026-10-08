import "server-only";
import type { TurnInput } from "../../gameplay/contracts.ts";
import type { RuntimeSource, AstraToolCall, AstraToolReceipt, PrivatePatch } from "../../gameplay/server-contracts.ts";
import type { AstraCapabilities, AstraDecision, AstraPrivateFinal, AstraPrimaryProvider } from "../../gameplay/astra-primary.ts";
import type { AstraEffectIntent, AstraSettlementIntent } from "../../gameplay/astra-settlement.ts";
import { settlementItemTransferAllowed } from "../../gameplay/astra-settlement.ts";
import { createStructuredRequester } from "./provider.ts";
import { parseNarration, narrationSchema } from "../../gameplay/dm-schema.ts";
import { DmError } from "../../gameplay/dm-errors.ts";
import { validateMechanicChoice } from "../../gameplay/request-validation.ts";
import { astraMechanicActionKinds } from "../../gameplay/astra-mechanics.ts";

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

function responseSchema(input: TurnInput, caps: AstraCapabilities, source: RuntimeSource) {
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
      obj({kind:enumString(["unsupported_optional"]),description:{type:"string"}})]})
    : array(obj({kind:enumString(["__none__"])}));
  const final = obj({ schemaVersion:{type:"integer",enum:[1]},
    worldMinutes:{type:"integer"},changes:array(change),
    outcomes:array(outcome), privatePatches:array(privatePatch),effects });
  return withSharedEnums(obj({ type:enumString(["tool","final"]),
    call:{anyOf:[tool,{type:"null"}]},final:{anyOf:[final,{type:"null"}]} }));
}

type RawChange = { family:string; id:string; expectedRevision:number|null;
  hp:number|null; resources:{key:string;value:number}[]|null;
  quantity:number|null; locationId:string|null; position:string|null };
function exactKeys(value: unknown, keys: string[]): value is Record<string,unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value) &&
    Object.keys(value).length === keys.length && keys.every((k)=>Object.hasOwn(value,k));
}
function parseDecision(raw: unknown, source: RuntimeSource, input: TurnInput,
  caps: AstraCapabilities, receipts: AstraToolReceipt[]): AstraDecision {
  if (!exactKeys(raw,["type","call","final"])) throw new DmError("validation");
  if (raw.type === "tool") {
    if (raw.final !== null || !exactKeys(raw.call,
      ["kind","actorId","targetId","dc","itemId","scope"])) throw new DmError("validation");
    const call = raw.call;
    if (!["query","skill","attack","save","damage"].includes(String(call.kind)) ||
      (call.actorId !== null && !caps.entityIds.includes(String(call.actorId))) ||
      (call.targetId !== null && !caps.entityIds.includes(String(call.targetId))) ||
      (call.itemId !== null && !caps.toolItemIds.includes(String(call.itemId)))) throw new DmError("validation");
    return { type:"tool",call:call as AstraToolCall,final:null };
  }
  if (raw.type !== "final" || raw.call !== null ||
    !(exactKeys(raw.final,["schemaVersion","worldMinutes","changes","outcomes","privatePatches","effects"]) ||
      exactKeys(raw.final,["schemaVersion","worldMinutes","changes","outcomes","privatePatches","settlement"]) ||
      exactKeys(raw.final,["schemaVersion","worldMinutes","changes","outcomes","privatePatches"])))
    throw new DmError("validation");
  const value = raw.final;
  if (value.schemaVersion !== 1 || !Array.isArray(value.changes) ||
    value.changes.length > 12 || !Array.isArray(value.outcomes) ||
    value.outcomes.length > 12 || !Array.isArray(value.privatePatches) ||
    value.privatePatches.length > 6) throw new DmError("validation");
  const changes: AstraPrivateFinal["changes"] = [];
  for (const entry of value.changes) {
    if (!exactKeys(entry,["family","id","expectedRevision","hp","resources",
      "quantity","locationId","position"])) throw new DmError("validation");
    const c = entry as RawChange;
    if (c.family === "entities") {
      if (!caps.entityIds.includes(c.id) || c.quantity !== null || c.locationId !== null ||
        c.position !== null || (c.hp === null && (!c.resources || !c.resources.length)))
        throw new DmError("validation");
      const resources: Record<string,number> = {};
      if (c.resources) for (const pair of c.resources) {
        if (!caps.resources[c.id]?.includes(pair.key) || Object.hasOwn(resources,pair.key) ||
          !Number.isInteger(pair.value)) throw new DmError("validation");
        resources[pair.key] = pair.value;
      }
      changes.push({family:"entities",id:c.id,expectedRevision:c.expectedRevision,
        values:{ ...(c.hp !== null ? {hp:c.hp}:{}),
          ...(Object.keys(resources).length ? {resources}: {}) }});
    } else if (c.family === "items") {
      if (!caps.itemIds.includes(c.id) || c.quantity === null || c.hp !== null ||
        c.resources !== null || c.locationId !== null || c.position !== null)
        throw new DmError("validation");
      changes.push({family:"items",id:c.id,expectedRevision:c.expectedRevision,
        values:{quantity:c.quantity}});
    } else if (c.family === "public_state") {
      if (c.id !== input.campaignId || !c.locationId ||
        !caps.locationIds.includes(c.locationId) || c.hp !== null ||
        c.resources !== null || c.quantity !== null || c.position !== null)
        throw new DmError("validation");
      changes.push({family:"public_state",id:c.id,expectedRevision:c.expectedRevision,
        values:{current_location_id:c.locationId}});
    } else if (c.family === "encounter_participants") {
      const p = source.runtime.participants.find((p) => p.id === c.id && caps.participantIds.includes(p.id));
      if (!p || !["nearby","far","cover"].includes(c.position ?? "") ||
        c.expectedRevision !== null || c.hp !== null || c.resources !== null ||
        c.quantity !== null || c.locationId !== null) throw new DmError("validation");
      changes.push({family:"encounter_participants",id:c.id,expectedRevision:null,
        values:{public_position:{position:c.position},
          public_resources:{...p.public_resources,
            move:Number(p.public_resources.move)-(c.position===p.public_position.position?0:1)}}});
    } else throw new DmError("validation");
  }
  // Existing encounter Action and defeat flags are server-derived consequences
  // of recorded tools and validated HP. The model chooses narrative intent and
  // tactical position, not free Action or an invented defeat state.
  for(const p of source.runtime.participants.filter((p)=>caps.participantIds.includes(p.id))){
    const actionCost=receipts.filter((r)=>["attack","skill"].includes(r.call.kind) &&
      r.call.actorId===p.entity_id).length;
    const defeated=changes.some((c)=>c.family==="entities" && c.id===p.entity_id && c.values.hp===0);
    if(!actionCost&&!defeated)continue;
    const existing=changes.find((c)=>c.family==="encounter_participants" && c.id===p.id);
    const position=existing?.values.public_position &&
      typeof existing.values.public_position==="object"
      ? String((existing.values.public_position as {position:string}).position)
      : p.public_position.position;
    const values={public_position:{position},public_resources:{...p.public_resources,
      action:Number(p.public_resources.action)-actionCost,
      move:Number(p.public_resources.move)-(position===p.public_position.position?0:1),
      withdrawn:p.public_resources.withdrawn===true||defeated}};
    if(existing)existing.values=values;
    else changes.push({family:"encounter_participants",id:p.id,expectedRevision:null,values});
  }
  const hasEffects=Object.hasOwn(value,"effects");
  const rawEffects=hasEffects ? value.effects : [];
  if (hasEffects && (!Array.isArray(rawEffects) || rawEffects.length > 6 ||
    (!source.worldTakeover && rawEffects.length > 0))) throw new DmError("validation");
  const settlement=Object.hasOwn(value,"settlement") ? value.settlement : null;
  for (const effect of hasEffects ? rawEffects as unknown[] : [settlement]) {
    if (effect === null) continue;
    if (exactKeys(effect,["kind","description"]) && effect.kind === "unsupported_optional") {
      if (typeof effect.description !== "string" || effect.description.length < 1 ||
        effect.description.length > 160) throw new DmError("validation");
      continue;
    }
    if (!source.worldTakeover || !effect || typeof effect!=="object" ||
      Array.isArray(effect)) throw new DmError("validation");
    const kind=(effect as Record<string,unknown>).kind;
    const fields:Record<string,string[]>={
      progression_award:["kind","recipientId","trackId","amount"],
      job_offer:["kind","issuerId","title","description","currencyName","currencyAmount",
        "itemName","itemCategory","itemDescription"],
      job_complete:["kind","questId"],job_reward:["kind","questId","recipientId"],
      mundane_grant:["kind","issuerId","recipientId","currencyName","currencyAmount",
        "itemName","itemCategory","itemDescription"],
      currency_transfer:["kind","sourceEntityId","recipientId","currencyName","amount"],
      item_transfer:["kind","sourceEntityId","recipientId","itemId","quantity"],
      mundane_purchase:["kind","sellerId","recipientId","itemId","quantity",
        "currencyName","price"],
      mundane_sale:["kind","buyerId","sellerId","itemId","quantity",
        "currencyName","price"],
      mundane_craft:["kind","crafterId","inputs","itemName","itemCategory",
        "itemDescription"],
      item_exchange:["kind","playerId","counterpartyId","giveItemId",
        "giveQuantity","receiveItemId","receiveQuantity"],
      mechanic_actions:["kind","actions","restSafety"],
      formal_rest:["kind","restKind","restSafety"]};
    if (typeof kind!=="string" || !fields[kind] || !exactKeys(effect,fields[kind]))
      throw new DmError("validation");
    if (kind==="mechanic_actions" || kind==="formal_rest") {
      const row=effect as Record<string,unknown>;
      if (row.restSafety!==null && (!exactKeys(row.restSafety,["locationId","suitable"]) ||
        typeof row.restSafety.locationId!=="string" ||
        typeof row.restSafety.suitable!=="boolean")) throw new DmError("validation");
      if (kind==="formal_rest") {
        if (!["short","long"].includes(String(row.restKind))) throw new DmError("validation");
      } else {
        if (!Array.isArray(row.actions) || row.actions.length<1 ||
          row.actions.length>6) throw new DmError("validation");
        try {
          for (const action of row.actions) {
            const parsed=validateMechanicChoice(action);
            if (!(astraMechanicActionKinds as readonly string[]).includes(parsed.kind))
              throw new DmError("validation");
          }
        } catch { throw new DmError("validation"); }
      }
    }
  }
  return {type:"final",call:null,final:{worldMinutes:value.worldMinutes as number,
    changes,outcomes:value.outcomes as AstraPrivateFinal["outcomes"],
    privatePatches:value.privatePatches as PrivatePatch[],
    ...(hasEffects ? {effects:rawEffects as AstraEffectIntent[]} :
      {settlement:settlement as AstraSettlementIntent|null})}};
}

export function createAstraPrimaryProvider(options: { apiKey:string; fetcher?:typeof fetch }): AstraPrimaryProvider {
  return {
    next: async (context,input,receipts,checks,caps,source,observe) => {
      const enriched = { ...context, input:JSON.stringify({
        context:JSON.parse(context.input), toolReceipts:receipts, recordedChecks:checks }) };
      if (new TextEncoder().encode(enriched.input).length +
          new TextEncoder().encode(enriched.instructions).length > context.budget.inputCap)
        throw new DmError("context");
      return createStructuredRequester({apiKey:options.apiKey,model:"gpt-6-astra",
        reasoning:"high",fetcher:options.fetcher,
        diagnosticObserver:observe ? (diagnostic) => observe({
          responseReceived:diagnostic.responseReceived,phase:diagnostic.phase,
        }) : undefined})(enriched,"plan",input.operationId,
        (raw)=>parseDecision(raw,source,input,caps,receipts),responseSchema(input,caps,source));
    },
    narrate: (context,input,observe) =>
      createStructuredRequester({apiKey:options.apiKey,model:"gpt-6-astra",
        reasoning:"medium",fetcher:options.fetcher,
        diagnosticObserver: observe ? (diagnostic) => observe({
          responseReceived:diagnostic.responseReceived,phase:diagnostic.phase,
        }) : undefined})(context,"narrate",input.operationId,
        (raw)=>{
          const parsed = parseNarration(raw);
          if (parsed.clarification !== null) throw new DmError("validation");
          return { ...parsed, clarification:null };
        },narrationSchema),
  };
}
