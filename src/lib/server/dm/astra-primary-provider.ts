import "server-only";
import type { TurnInput } from "../../gameplay/contracts.ts";
import type { RuntimeSource, AstraToolCall, AstraToolReceipt, PrivatePatch } from "../../gameplay/server-contracts.ts";
import type { AstraCapabilities, AstraDecision, AstraPrivateFinal, AstraPrimaryProvider } from "../../gameplay/astra-primary.ts";
import type { AstraEffectIntent, AstraSettlementIntent } from "../../gameplay/astra-settlement.ts";
import { astraPlanResponseSchema } from "../../gameplay/astra-plan-schema.ts";
import { astraPlanFits, astraPlanProviderInput } from "../../gameplay/astra-plan-context.ts";
import { createStructuredRequester, type ProviderAttempt, type ProviderTransportDiagnostic } from "./provider.ts";
import { parseNarration, narrationSchema } from "../../gameplay/dm-schema.ts";
import { DmError } from "../../gameplay/dm-errors.ts";
import { validateMechanicChoice } from "../../gameplay/request-validation.ts";
import { astraMechanicActionKinds } from "../../gameplay/astra-mechanics.ts";
import { planValidation, planValidationReason, type PlanDiagnostic } from "./plan-diagnostic.ts";
export type { PlanDiagnostic, PlanDiagnosticReasonCode } from "./plan-diagnostic.ts";

type RawChange = { family:string; id:string; expectedRevision:number|null;
  hp:number|null; resources:{key:string;value:number}[]|null;
  quantity:number|null; locationId:string|null; position:string|null };
function exactKeys(value: unknown, keys: string[]): value is Record<string,unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value) &&
    Object.keys(value).length === keys.length && keys.every((k)=>Object.hasOwn(value,k));
}
function parseDecision(raw: unknown, source: RuntimeSource, input: TurnInput,
  caps: AstraCapabilities, receipts: AstraToolReceipt[]): AstraDecision {
  const modern = source.astraResponseContract === "unified-v1";
  const unified = modern && source.astraResponseMode !== "private-informed";
  if (!exactKeys(raw,["type","call","final"])) planValidation("decision_root_shape");
  if (raw.type === "tool") {
    if (raw.final !== null || !exactKeys(raw.call,
      ["kind","actorId","targetId","dc","itemId","scope"])) planValidation("decision_tool_shape");
    const call = raw.call;
    if (!["query","skill","attack","save","damage"].includes(String(call.kind)) ||
      (call.actorId !== null && !caps.entityIds.includes(String(call.actorId))) ||
      (call.targetId !== null && !caps.entityIds.includes(String(call.targetId))) ||
      (call.itemId !== null && !caps.toolItemIds.includes(String(call.itemId)))) planValidation("decision_tool_selection");
    return { type:"tool",call:call as AstraToolCall,final:null };
  }
  if (raw.type !== "final" || raw.call !== null ||
    !(unified ? exactKeys(raw.final,["schemaVersion","worldMinutes","changes","outcomes","privatePatches","effects","publicNarration"]) : modern ?
      exactKeys(raw.final,["schemaVersion","worldMinutes","changes","outcomes","privatePatches","effects"]) :
      (exactKeys(raw.final,["schemaVersion","worldMinutes","changes","outcomes","privatePatches","effects"]) ||
      exactKeys(raw.final,["schemaVersion","worldMinutes","changes","outcomes","privatePatches","settlement"]) ||
      exactKeys(raw.final,["schemaVersion","worldMinutes","changes","outcomes","privatePatches"]))))
    planValidation("decision_final_shape");
  const value = raw.final as Record<string, unknown>;
  if (value.schemaVersion !== 1 || !Array.isArray(value.changes) ||
    value.changes.length > 12 || !Array.isArray(value.outcomes) ||
    value.outcomes.length > 12 || !Array.isArray(value.privatePatches) ||
    value.privatePatches.length > 6) planValidation("decision_final_limits");
  if (modern && value.outcomes.length !== 0) planValidation("decision_final_limits");
  const changes: AstraPrivateFinal["changes"] = [];
  for (const entry of value.changes) {
    if (!exactKeys(entry,["family","id","expectedRevision","hp","resources",
      "quantity","locationId","position"])) planValidation("decision_change_shape");
    const c = entry as RawChange;
    if (c.family === "entities") {
      if (!caps.entityIds.includes(c.id) || c.quantity !== null || c.locationId !== null ||
        c.position !== null || (c.hp === null && (!c.resources || !c.resources.length)))
        planValidation("decision_change_scope");
      const resources: Record<string,number> = {};
      if (c.resources) for (const pair of c.resources) {
        if (!caps.resources[c.id]?.includes(pair.key) || Object.hasOwn(resources,pair.key) ||
          !Number.isInteger(pair.value)) planValidation("decision_change_scope");
        resources[pair.key] = pair.value;
      }
      changes.push({family:"entities",id:c.id,expectedRevision:c.expectedRevision,
        values:{ ...(c.hp !== null ? {hp:c.hp}:{}),
          ...(Object.keys(resources).length ? {resources}: {}) }});
    } else if (c.family === "items") {
      if (!caps.itemIds.includes(c.id) || c.quantity === null || c.hp !== null ||
        c.resources !== null || c.locationId !== null || c.position !== null)
        planValidation("decision_change_scope");
      changes.push({family:"items",id:c.id,expectedRevision:c.expectedRevision,
        values:{quantity:c.quantity}});
    } else if (c.family === "public_state") {
      if (c.id !== input.campaignId || !c.locationId ||
        !caps.locationIds.includes(c.locationId) || c.hp !== null ||
        c.resources !== null || c.quantity !== null || c.position !== null)
        planValidation("decision_change_scope");
      changes.push({family:"public_state",id:c.id,expectedRevision:c.expectedRevision,
        values:{current_location_id:c.locationId}});
    } else if (c.family === "encounter_participants") {
      const p = source.runtime.participants.find((p) => p.id === c.id && caps.participantIds.includes(p.id));
      if (!p || !["nearby","far","cover"].includes(c.position ?? "") ||
        c.expectedRevision !== null || c.hp !== null || c.resources !== null ||
        c.quantity !== null || c.locationId !== null) planValidation("decision_change_scope");
      changes.push({family:"encounter_participants",id:c.id,expectedRevision:null,
        values:{public_position:{position:c.position},
          public_resources:{...p.public_resources,
            move:Number(p.public_resources.move)-(c.position===p.public_position.position?0:1)}}});
    } else planValidation("decision_change_scope");
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
    (!source.worldTakeover && rawEffects.length > 0))) planValidation("decision_effect_scope");
  const settlement=Object.hasOwn(value,"settlement") ? value.settlement : null;
  for (const effect of hasEffects ? rawEffects as unknown[] : [settlement]) {
    if (effect === null) continue;
    if (exactKeys(effect,["kind","description"]) && effect.kind === "unsupported_optional") {
      if (typeof effect.description !== "string" || effect.description.length < 1 ||
        effect.description.length > 160) planValidation("decision_effect_shape");
      continue;
    }
    if (!source.worldTakeover || !effect || typeof effect!=="object" ||
      Array.isArray(effect)) planValidation("decision_effect_scope");
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
    if (typeof kind!=="string" || !fields[kind])
      planValidation("decision_effect_kind");
    if (!exactKeys(effect,fields[kind]))
      planValidation("decision_effect_fields");
    if (kind==="mechanic_actions" || kind==="formal_rest") {
      const row=effect as Record<string,unknown>;
      if (row.restSafety!==null && (!exactKeys(row.restSafety,["locationId","suitable"]) ||
        typeof row.restSafety.locationId!=="string" ||
        typeof row.restSafety.suitable!=="boolean")) planValidation("decision_rest_safety");
      if (kind==="formal_rest") {
        if (!["short","long"].includes(String(row.restKind))) planValidation("decision_rest_kind");
      } else {
        if (!Array.isArray(row.actions) || row.actions.length<1 ||
          row.actions.length>6) planValidation("decision_mechanic_actions");
        try {
          for (const action of row.actions) {
            const parsed=validateMechanicChoice(action);
            if (!(astraMechanicActionKinds as readonly string[]).includes(parsed.kind))
              planValidation("decision_mechanic_actions");
          }
        } catch { planValidation("decision_mechanic_actions"); }
      }
    }
  }
  let publicNarration: AstraPrivateFinal["publicNarration"];
  if (unified) {
    const narration = value.publicNarration;
    if (!exactKeys(narration,["beats","visualDescription"]) ||
      !Array.isArray(narration.beats) || narration.beats.length < 1 ||
      narration.beats.length > 12) planValidation("decision_public_narration_shape");
    const fragment = (entry: unknown, max: number) => {
      if (!exactKeys(entry,["text","requiresEffects"]) ||
        typeof entry.text !== "string" || entry.text.length > max ||
        !Array.isArray(entry.requiresEffects) || entry.requiresEffects.length > 6 ||
        new Set(entry.requiresEffects).size !== entry.requiresEffects.length ||
        entry.requiresEffects.some((index) => !Number.isInteger(index) ||
          index < 0 || index >= (rawEffects as unknown[]).length))
        planValidation("decision_public_narration_bounds");
      return { text: entry.text, requiresEffects: entry.requiresEffects as number[] };
    };
    publicNarration = {
      beats: narration.beats.map((entry) => fragment(entry,6000)),
      visualDescription: fragment(narration.visualDescription,2000),
    };
  }
  return {type:"final",call:null,final:{worldMinutes:value.worldMinutes as number,
    changes,outcomes:value.outcomes as AstraPrivateFinal["outcomes"],
    privatePatches:value.privatePatches as PrivatePatch[],
    ...(hasEffects ? {effects:rawEffects as AstraEffectIntent[]} :
      {settlement:settlement as AstraSettlementIntent|null}),
    ...(publicNarration ? { publicNarration } : {})}};
}

export function createAstraPrimaryProvider(options: {
  apiKey:string;
  fetcher?:typeof fetch;
  planDiagnosticObserver?: (diagnostic: PlanDiagnostic) => void;
  attemptObserver?: (attempt: ProviderAttempt) => void;
}): AstraPrimaryProvider {
  const planDiagnosticObserver = (input: TurnInput, stage: "plan" | "narrate") =>
    (diagnostic: PlanDiagnostic) => {
      if (options.planDiagnosticObserver) options.planDiagnosticObserver(diagnostic);
      else if (diagnostic.resultStatus !== "success")
        console.warn(JSON.stringify({ event: "astra_plan_diagnostic",
          operationId:/^[0-9a-f-]{36}$/i.test(input.operationId) ? input.operationId : null,
          stage, ...diagnostic }));
    };
  const attemptObserver = options.attemptObserver ?? ((attempt: ProviderAttempt) =>
    console.info(JSON.stringify({event:"astra_provider_attempt",...attempt})));
  const progress = (input: TurnInput, stage: "plan" | "narrate",
    observe?: Parameters<AstraPrimaryProvider["next"]>[6]) =>
    (diagnostic: ProviderTransportDiagnostic) => {
      // Fixed metadata only. Never emit caught messages, request bodies,
      // provider output, headers, or any private context text.
      console.info(JSON.stringify({ event:"astra_provider_boundary",
        operationId:/^[0-9a-f-]{36}$/i.test(input.operationId) ? input.operationId : null,
        stage,phase:diagnostic.phase,
        responseReceived:diagnostic.responseReceived,bodyReceived:diagnostic.bodyReceived,
        elapsedMs:diagnostic.elapsedMs,httpStatus:diagnostic.httpStatus,
        abortKind:diagnostic.abortKind,nativeName:diagnostic.nativeName,
        causeCode:diagnostic.causeCode,requestId:diagnostic.requestId,
        openaiRequestId:diagnostic.openaiRequestId,responseId:diagnostic.responseId,
        category:diagnostic.category,success:diagnostic.success }));
      observe?.({responseReceived:diagnostic.responseReceived,phase:diagnostic.phase,
        elapsedMs:diagnostic.elapsedMs,abortKind:diagnostic.abortKind,
        causeCode:diagnostic.causeCode});
    };
  return {
    next: async (context,input,receipts,checks,caps,source,observe) => {
      const schema = astraPlanResponseSchema(input,caps,source);
      const enriched = { ...context,
        input: astraPlanProviderInput(context.input,receipts,checks,
          { responseContract: source.astraResponseContract }) };
      if (!astraPlanFits(enriched,enriched.input,schema))
        throw new DmError("context",source.astraResponseContract === "unified-v1");
      try {
        return await createStructuredRequester({apiKey:options.apiKey,model:"gpt-6-astra",
          reasoning:"high",fetcher:options.fetcher,includeUsageMetadata:true,
          planDiagnosticObserver:planDiagnosticObserver(input,"plan"),observer:attemptObserver,
          diagnosticObserver:progress(input,"plan",observe)})(enriched,"plan",input.operationId,
          (raw)=>parseDecision(raw,source,input,caps,receipts),schema);
      } catch (error) {
        // A malformed public output is a manual technical retry, never an
        // automatic semantic retry. State/scope/privacy validators stay closed.
        if (source.astraResponseContract === "unified-v1" &&
          ["output_json_invalid", "decision_public_narration_shape", "decision_public_narration_bounds"]
            .includes(planValidationReason(error) ?? ""))
          throw new DmError("validation",true);
        throw error;
      }
    },
    narrate: async (context,input,observe) => {
      const marker = (() => {
        try {
          return (JSON.parse(context.input) as {astraPrimary?:{
            responseContract?:unknown;responseMode?:unknown}}).astraPrimary;
        }
        catch { return null; }
      })();
      try {
        return await createStructuredRequester({apiKey:options.apiKey,model:"gpt-6-astra",
        reasoning:"medium",fetcher:options.fetcher,includeUsageMetadata:true,
        observer:attemptObserver,planDiagnosticObserver:planDiagnosticObserver(input,"narrate"),
        diagnosticObserver:progress(input,"narrate",observe)})(context,"narrate",input.operationId,
        (raw)=>{
          let parsed;
          try { parsed = parseNarration(raw); }
          catch { planValidation("narration_contract_invalid"); }
          if (parsed.clarification !== null) planValidation("narration_clarification_present");
          return { ...parsed, clarification:null };
        },narrationSchema);
      } catch (error) {
        if (marker?.responseContract === "unified-v1" && marker.responseMode === "private-informed" &&
          ["output_json_invalid", "narration_contract_invalid", "narration_clarification_present"]
            .includes(planValidationReason(error) ?? ""))
          throw new DmError("validation",true);
        throw error;
      }
    },
  };
}
