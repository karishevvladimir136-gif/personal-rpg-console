import "server-only";
import type { TurnInput } from "../../gameplay/contracts.ts";
import type { RuntimeSource, AstraToolCall, AstraToolReceipt, PrivatePatch } from "../../gameplay/server-contracts.ts";
import type { AstraCapabilities, AstraDecision, AstraPrivateFinal, AstraPrimaryProvider } from "../../gameplay/astra-primary.ts";
import type { AstraSettlementIntent } from "../../gameplay/astra-settlement.ts";
import { settlementItemTransferAllowed } from "../../gameplay/astra-settlement.ts";
import { createStructuredRequester } from "./provider.ts";
import { parseNarration, narrationSchema } from "../../gameplay/dm-schema.ts";
import { DmError } from "../../gameplay/dm-errors.ts";

const obj = (properties: Record<string, unknown>) => ({ type: "object",
  additionalProperties: false, properties, required: Object.keys(properties) });
const nil = (type: string) => ({ type: [type,"null"] });
const enumString = (values: string[]) => ({ type: "string", enum: values.length ? values : ["__none__"] });
const array = (items: unknown) => ({ type: "array", items });

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
    {type:"null"}
  ]} : {type:"null"};
  const final = obj({ schemaVersion:{type:"integer",enum:[1]},
    worldMinutes:{type:"integer"},changes:array(change),
    outcomes:array(outcome), privatePatches:array(privatePatch),settlement });
  return obj({ type:enumString(["tool","final"]),
    call:{anyOf:[tool,{type:"null"}]},final:{anyOf:[final,{type:"null"}]} });
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
    !(exactKeys(raw.final,["schemaVersion","worldMinutes","changes","outcomes","privatePatches","settlement"]) ||
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
  const settlement=Object.hasOwn(value,"settlement") ? value.settlement : null;
  if (settlement !== null) {
    if (!source.worldTakeover || !settlement || typeof settlement!=="object" ||
      Array.isArray(settlement)) throw new DmError("validation");
    const kind=(settlement as Record<string,unknown>).kind;
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
        "currencyName","price"]};
    if (typeof kind!=="string" || !fields[kind] || !exactKeys(settlement,fields[kind]))
      throw new DmError("validation");
  }
  return {type:"final",call:null,final:{worldMinutes:value.worldMinutes as number,
    changes,outcomes:value.outcomes as AstraPrivateFinal["outcomes"],
    privatePatches:value.privatePatches as PrivatePatch[],
    settlement:settlement as AstraSettlementIntent|null}};
}

export function createAstraPrimaryProvider(options: { apiKey:string; fetcher?:typeof fetch }): AstraPrimaryProvider {
  const planRequest = createStructuredRequester({apiKey:options.apiKey,model:"gpt-6-astra",
    reasoning:"high",fetcher:options.fetcher});
  return {
    next: async (context,input,receipts,checks,caps,source) => {
      const enriched = { ...context, input:JSON.stringify({
        context:JSON.parse(context.input), toolReceipts:receipts, recordedChecks:checks }) };
      if (new TextEncoder().encode(enriched.input).length +
          new TextEncoder().encode(enriched.instructions).length > context.budget.inputCap)
        throw new DmError("context");
      return planRequest(enriched,"plan",input.operationId,
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
