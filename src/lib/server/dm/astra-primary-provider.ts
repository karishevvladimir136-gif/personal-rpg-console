import "server-only";
import type { TurnInput } from "../../gameplay/contracts.ts";
import type { RuntimeSource, AstraToolCall, AstraToolReceipt, PrivatePatch } from "../../gameplay/server-contracts.ts";
import type { AstraCapabilities, AstraDecision, AstraPrivateFinal, AstraPrimaryProvider } from "../../gameplay/astra-primary.ts";
import { createStructuredRequester } from "./provider.ts";
import { parseNarration, narrationSchema } from "../../gameplay/dm-schema.ts";
import { DmError } from "../../gameplay/dm-errors.ts";

const obj = (properties: Record<string, unknown>) => ({ type: "object",
  additionalProperties: false, properties, required: Object.keys(properties) });
const nil = (type: string) => ({ type: [type,"null"] });
const enumString = (values: string[]) => ({ type: "string", enum: values.length ? values : ["__none__"] });
const array = (items: unknown) => ({ type: "array", items });

function responseSchema(input: TurnInput, caps: AstraCapabilities) {
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
  const final = obj({ schemaVersion:{type:"integer",enum:[1]},
    worldMinutes:{type:"integer"},changes:array(change),
    outcomes:array(outcome), privatePatches:array(privatePatch) });
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
  if (raw.type !== "final" || raw.call !== null || !exactKeys(raw.final,
    ["schemaVersion","worldMinutes","changes","outcomes","privatePatches"])) throw new DmError("validation");
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
  return {type:"final",call:null,final:{worldMinutes:value.worldMinutes as number,
    changes,outcomes:value.outcomes as AstraPrivateFinal["outcomes"],
    privatePatches:value.privatePatches as PrivatePatch[]}};
}

export function createAstraPrimaryProvider(options: { apiKey:string; fetcher?:typeof fetch }): AstraPrimaryProvider {
  const planRequest = createStructuredRequester({apiKey:options.apiKey,model:"gpt-6-astra",
    reasoning:"high",fetcher:options.fetcher});
  const narrationRequest = createStructuredRequester({apiKey:options.apiKey,model:"gpt-6-astra",
    reasoning:"medium",fetcher:options.fetcher});
  return {
    next: async (context,input,receipts,checks,caps,source) => {
      const enriched = { ...context, input:JSON.stringify({
        context:JSON.parse(context.input), toolReceipts:receipts, recordedChecks:checks }) };
      if (new TextEncoder().encode(enriched.input).length +
          new TextEncoder().encode(enriched.instructions).length > context.budget.inputCap)
        throw new DmError("context");
      return planRequest(enriched,"plan",input.operationId,
        (raw)=>parseDecision(raw,source,input,caps,receipts),responseSchema(input,caps));
    },
    narrate: (context,input) => narrationRequest(context,"narrate",input.operationId,
      (raw)=>{
        const parsed = parseNarration(raw);
        if (parsed.clarification !== null) throw new DmError("validation");
        return { ...parsed, clarification:null };
      },narrationSchema),
  };
}
