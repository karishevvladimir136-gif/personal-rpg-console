import type { TurnInput, JsonObject } from "./contracts.ts";
import type { RecordChange, RuntimeSource } from "./server-contracts.ts";
import { stableGameplayId } from "./dice.ts";
import { requireRule, TurnError } from "./turn-errors.ts";
import { settledCurrencyBalance, settledItemTransfer } from "../progression/settlement-core.ts";
import { awardEarnedProgression } from "../progression/planning.ts";
import type { FoundationLoopState } from "../foundation-loop/contracts.ts";

export type AstraSettlementIntent =
  | { kind: "progression_award"; recipientId: string; trackId: string; amount: number }
  | { kind: "job_offer"; issuerId: string; title: string; description: string;
      currencyName: string | null; currencyAmount: number | null;
      itemName: string | null; itemCategory: "food" | "supply" | "misc" | null;
      itemDescription: string | null }
  | { kind: "job_complete"; questId: string }
  | { kind: "job_reward"; questId: string; recipientId: string }
  | { kind: "mundane_grant"; issuerId: string; recipientId: string;
      currencyName: string | null; currencyAmount: number | null;
      itemName: string | null; itemCategory: "food" | "supply" | "misc" | null;
      itemDescription: string | null }
  | { kind: "currency_transfer"; sourceEntityId: string; recipientId: string;
      currencyName: string; amount: number }
  | { kind: "item_transfer"; sourceEntityId: string; recipientId: string;
      itemId: string; quantity: number }
  | { kind: "mundane_purchase"; sellerId: string; recipientId: string;
      itemId: string; quantity: number; currencyName: string; price: number }
  | { kind: "mundane_sale"; buyerId: string; sellerId: string;
      itemId: string; quantity: number; currencyName: string; price: number }
  | { kind: "mundane_craft"; crafterId: string;
      inputs: {itemId: string; quantity: number}[];
      itemName: string; itemCategory: "food" | "supply" | "misc";
      itemDescription: string | null }
  | { kind: "item_exchange"; playerId: string; counterpartyId: string;
      giveItemId: string; giveQuantity: number;
      receiveItemId: string; receiveQuantity: number };

export const legacySettlementKind = (kind: string) =>
  !["mundane_sale","mundane_craft","item_exchange"].includes(kind);

/** A bounded non-mechanical request can be declined as a durable effect while
 * the DM still handles its ordinary fictional meaning in the scene. */
export type AstraEffectIntent = AstraSettlementIntent | import("./astra-mechanics.ts").AstraMechanicsIntent |
  { kind: "unsupported_optional"; description: string };

export type AstraLegacyEffectsPlan = {
  schemaVersion: 1;
  effects: AstraSettlementPlan[];
  rejected: { index: number; reason: "not_authorized" }[];
};
export type AstraOrderedEffectsPlan = {
  schemaVersion: 2;
  effects: (AstraSettlementPlan | import("./astra-mechanics.ts").AstraMechanicsPlan)[];
  indices: number[];
  intents: AstraEffectIntent[];
  rejected: { index: number; reason: "not_authorized" }[];
  resolution: import("./server-contracts.ts").MechanicsResolution;
  foundationState: FoundationLoopState | null;
};
export type AstraEffectsPlan = AstraLegacyEffectsPlan | AstraOrderedEffectsPlan;

export type AstraSettlementPublicOutcome = {
  kind: AstraSettlementIntent["kind"];
  questId: string | null;
  questStatus: "open" | "complete" | null;
  currency: { name: string; amount: number; resourceKey: string; after: number } | null;
  item: { id: string; name: string; quantity: number } | null;
  givenItem?: { id: string; name: string; quantity: number };
  progression?: { trackId: string; value: number; rank: number; pendingIds: string[] };
};

export type AstraSettlementPlan = {
  schemaVersion: 1;
  kind: AstraSettlementIntent["kind"];
  intent: AstraSettlementIntent;
  changes: RecordChange[];
  currencyDefinition: {
    id: string; label: string; resourceKey: string; version: 1;
  } | null;
  publicOutcome: AstraSettlementPublicOutcome;
  progressionState?: FoundationLoopState;
};

const asciiCurrency = /^[a-z]+(?: [a-z]+)*$/;
const mundaneCategory = new Set(["food", "supply", "misc"]);
const boundedText = (value: unknown, max: number): value is string =>
  typeof value === "string" && value === value.trim() &&
  value.length >= 1 && value.length <= max && !/[\u0000-\u001f]/.test(value);

function canonicalCurrency(value: unknown): string {
  requireRule(typeof value === "string" && value.length >= 1 && value.length <= 32 &&
    !/[\u0000-\u001f]/.test(value));
  const normalized=(value as string).trim().toLowerCase().replace(/ +/g," ");
  requireRule(boundedText(normalized,32) && asciiCurrency.test(normalized));
  return normalized;
}

function balance(before: number, delta: number) {
  try { return settledCurrencyBalance(before, delta); }
  catch { throw new TurnError("validation"); }
}

function player(source: RuntimeSource) {
  const controlled = source.runtime.configuration?.controlledEntityIds ?? [];
  requireRule(controlled.length === 1);
  const hero = source.snapshot.entities.find((e) => e.id === controlled[0] &&
    e.campaign_id === source.snapshot.campaign.id && e.kind === "player");
  requireRule(hero);
  return hero;
}

function presentNpc(source: RuntimeSource, id: string) {
  requireRule(source.worldTakeover?.presentEntityIds.includes(id));
  const npc = source.snapshot.entities.find((e) => e.id === id &&
    e.campaign_id === source.snapshot.campaign.id && e.kind === "npc");
  requireRule(npc);
  return npc;
}

/** Standard Item rows are public. A historical item policy, when present,
 * may further restrict transfer; takeover campaigns normally have none. */
export function settlementItemTransferAllowed(source: RuntimeSource, itemId: string) {
  const policy=source.astraSettlementItemPolicies?.find((p)=>p.itemId===itemId);
  return !policy || (policy.visibility==="public" && policy.trade==="allowed");
}

function playerStorage(source: RuntimeSource, playerId: string) {
  const storage = source.snapshot.storages.filter((s) => s.campaign_id === source.snapshot.campaign.id &&
    s.kind === "player" && s.entity_id === playerId).sort((a,b)=>a.id.localeCompare(b.id))[0];
  requireRule(storage);
  return storage.id;
}

function npcStorage(source: RuntimeSource, input: TurnInput, npcId: string) {
  const storage = source.snapshot.storages.filter((s) =>
    s.campaign_id === source.snapshot.campaign.id && s.entity_id === npcId &&
    s.kind === "merchant").sort((a,b)=>a.id.localeCompare(b.id))[0];
  if (storage) return {id:storage.id,change:null};
  const name=source.worldTakeover?.actors.find((a)=>a.entityId===npcId)?.publicName;
  requireRule(typeof name==="string" && name.length>0);
  const id=stableGameplayId(input.operationId,`astra:sale-storage:${npcId}`);
  requireRule(!source.snapshot.storages.some((s)=>s.id===id));
  return {id,change:{family:"storages",id,expectedRevision:null,
    values:{name:`Inventory of ${name}`.slice(0,160),kind:"merchant",
      entity_id:npcId}} as RecordChange};
}

function existingQuest(source: RuntimeSource, id: string) {
  const quest = source.snapshot.quests.find((q) => q.id === id &&
    q.campaign_id === source.snapshot.campaign.id);
  const job = source.astraSettlementJobs?.find((j) => j.questId === id);
  requireRule(quest && job && job.rewardTerms);
  return { quest, job, terms: job.rewardTerms };
}

function currency(source: RuntimeSource, name: string, mayCreate: boolean) {
  requireRule(canonicalCurrency(name)===name);
  const slug = name.replaceAll(" ", "_");
  const existing = source.astraSettlementCurrencies ?? [];
  const match = existing.find((c) => c.label.trim().toLowerCase() === name);
  if (match) {
    requireRule(match.resourceKey.length <= 80 && /^[A-Za-z][A-Za-z0-9_-]*$/.test(match.resourceKey) &&
      Number.isInteger(match.version) && match.version >= 1);
    return { definition: match, newDefinition: null };
  }
  requireRule(mayCreate && existing.length < 32);
  const definition = { id: `currency:${slug}`, label: name,
    resourceKey: `currency_${slug}`, version: 1 as const };
  requireRule(!existing.some((c) => c.id === definition.id ||
    c.resourceKey === definition.resourceKey));
  return { definition, newDefinition: definition };
}

function empty(kind: AstraSettlementIntent["kind"]): AstraSettlementPublicOutcome {
  return { kind, questId:null, questStatus:null, currency:null, item:null };
}

function changedResources(entity: RuntimeSource["snapshot"]["entities"][number],
  resourceKey: string, delta: number): RecordChange {
  const before = Number(entity.resources[resourceKey] ?? 0);
  requireRule(Number.isInteger(before) && before >= 0);
  return {family:"entities",id:entity.id,expectedRevision:entity.revision,
    values:{resources:{...entity.resources,[resourceKey]:balance(before,delta)}}};
}

function assertDisjoint(base: RecordChange[], extra: RecordChange[]) {
  const ids = new Set(base.map((c) => `${c.family}:${c.id}`));
  requireRule(extra.length <= 5 && extra.every((c) => !ids.has(`${c.family}:${c.id}`)));
}

type OrdinaryReward = { currencyName: string | null; currencyAmount: number | null;
  itemName: string | null; itemCategory: "food" | "supply" | "misc" | null;
  itemDescription: string | null };
function grantOrdinary(source: RuntimeSource, input: TurnInput,
  hero: RuntimeSource["snapshot"]["entities"][number], terms: OrdinaryReward,
  itemIdentity: string, outcome: AstraSettlementPublicOutcome) {
  const changes: RecordChange[]=[];
  let currencyDefinition: AstraSettlementPlan["currencyDefinition"]=null;
  const hasCurrency=terms.currencyName!==null || terms.currencyAmount!==null;
  const hasItem=terms.itemName!==null || terms.itemCategory!==null ||
    terms.itemDescription!==null;
  requireRule(hasCurrency || hasItem);
  if (hasCurrency) {
    requireRule(terms.currencyName!==null &&
      canonicalCurrency(terms.currencyName)===terms.currencyName);
    requireRule(Number.isInteger(terms.currencyAmount) &&
      terms.currencyAmount!>=1 && terms.currencyAmount!<=20);
    const chosen=currency(source,terms.currencyName,true);
    currencyDefinition=chosen.newDefinition;
    changes.push(changedResources(hero,chosen.definition.resourceKey,terms.currencyAmount!));
    outcome.currency={name:terms.currencyName,amount:terms.currencyAmount!,
      resourceKey:chosen.definition.resourceKey,
      after:Number(hero.resources[chosen.definition.resourceKey] ?? 0)+terms.currencyAmount!};
  } else requireRule(terms.currencyName===null && terms.currencyAmount===null);
  if (hasItem) {
    requireRule(boundedText(terms.itemName,80) &&
      mundaneCategory.has(String(terms.itemCategory)) &&
      boundedText(terms.itemDescription,160));
    const itemId=stableGameplayId(input.operationId,itemIdentity);
    requireRule(!source.snapshot.items.some((i)=>i.id===itemId));
    changes.push({family:"items",id:itemId,expectedRevision:null,values:{
      name:terms.itemName,category:terms.itemCategory!,quantity:1,
      description:terms.itemDescription,mechanics:"",owner_entity_id:hero.id,
      storage_id:playerStorage(source,hero.id),equipped_entity_id:null,equipped_slot:null}});
    outcome.item={id:itemId,name:terms.itemName,quantity:1};
  } else requireRule(terms.itemName===null && terms.itemCategory===null &&
    terms.itemDescription===null);
  return {changes,currencyDefinition};
}

/** Astra chooses a bounded intent. All identifiers, revisions and exact changes
 * are derived from the pinned authoritative source. SQL independently checks
 * this plan before the same atomic turn commit applies it. */
export function planAstraSettlement(source: RuntimeSource, input: TurnInput,
  intent: AstraSettlementIntent | null | undefined,
  baseChanges: RecordChange[]): AstraSettlementPlan | null {
  if (intent === null || intent === undefined) return null;
  requireRule(input.mode === "game" && !!source.worldTakeover &&
    source.snapshot.campaign.id === input.campaignId);
  const hero = player(source);
  const outcome = empty(intent.kind);
  let changes: RecordChange[] = [];
  let currencyDefinition: AstraSettlementPlan["currencyDefinition"] = null;
  if (intent.kind === "progression_award") {
    const trackId = intent.trackId;
    requireRule(intent.recipientId === hero.id && !!source.astraProgressionState &&
      Number.isInteger(intent.amount) && intent.amount >= 1 && intent.amount <= 100);
    const baseline = { [hero.id]: source.astraProgressionBaseline ?? [] };
    const progressionState = awardEarnedProgression(source.astraProgressionState,
      baseline, hero.id, trackId, intent.amount, input.operationId);
    const progress = progressionState.progress.find((row) =>
      row.entityId === hero.id && row.trackId === trackId)!;
    outcome.progression = { trackId, value: progress.value,
      rank: progress.rank, pendingIds: progressionState.pending.filter((row) =>
        row.entityId === hero.id && row.trackId === trackId).map((row) => row.id) };
    return { schemaVersion: 1, kind: intent.kind, intent, changes: [],
      currencyDefinition: null, publicOutcome: outcome, progressionState };
  } else if (intent.kind === "job_offer") {
    presentNpc(source,intent.issuerId);
    requireRule(boundedText(intent.title,120) && boundedText(intent.description,500));
    const hasCurrency = intent.currencyName !== null || intent.currencyAmount !== null;
    const hasItem = intent.itemName !== null || intent.itemCategory !== null ||
      intent.itemDescription !== null;
    requireRule(hasCurrency || hasItem);
    if (hasCurrency) {
      canonicalCurrency(intent.currencyName);
      requireRule(Number.isInteger(intent.currencyAmount) && intent.currencyAmount! >= 1 &&
        intent.currencyAmount! <= 20);
    }
    if (hasItem) {
      requireRule(boundedText(intent.itemName,80) &&
        mundaneCategory.has(String(intent.itemCategory)) &&
        (intent.itemDescription === null || boundedText(intent.itemDescription,160)));
    }
    const normalized = { ...intent,
      currencyName:hasCurrency ? canonicalCurrency(intent.currencyName) : null,
      itemDescription: hasItem
        ? intent.itemDescription ?? `Ordinary ${intent.itemName}.` : null };
    const questId = stableGameplayId(input.operationId,"astra:job");
    requireRule(!source.snapshot.quests.some((q) => q.id === questId));
    const rewards = [hasCurrency ? `${normalized.currencyAmount} ${normalized.currencyName}` : null,
      hasItem ? intent.itemName : null].filter(Boolean).join(" and ");
    changes = [{family:"quests",id:questId,expectedRevision:null,
      values:{title:intent.title,description:`${intent.description}\nReward: ${rewards}.`,status:"open"}}];
    outcome.questId=questId; outcome.questStatus="open";
    intent=normalized;
  } else if (intent.kind === "job_complete") {
    const {quest,job} = existingQuest(source,intent.questId);
    requireRule(quest.status === "open" && job.rewardOperationId === null);
    changes=[{family:"quests",id:quest.id,expectedRevision:quest.revision,
      values:{status:"complete"}}];
    outcome.questId=quest.id; outcome.questStatus="complete";
  } else if (intent.kind === "job_reward") {
    requireRule(intent.recipientId === hero.id);
    const {quest,job,terms} = existingQuest(source,intent.questId);
    requireRule(quest.status === "complete" && job.rewardOperationId === null);
    presentNpc(source,job.issuerId);
    outcome.questId=quest.id; outcome.questStatus="complete";
    const grant=grantOrdinary(source,input,hero,terms,
      `astra:reward-item:${quest.id}`,outcome);
    changes.push(...grant.changes);
    currencyDefinition=grant.currencyDefinition;
    changes.push({family:"quests",id:quest.id,expectedRevision:quest.revision,
      values:{status:"complete"}});
  } else if (intent.kind === "mundane_grant") {
    const issuer=presentNpc(source,intent.issuerId);
    requireRule(intent.recipientId===hero.id);
    const normalized={...intent,
      currencyName:intent.currencyName!==null
        ? canonicalCurrency(intent.currencyName) : null,
      itemDescription:intent.itemName!==null
        ? intent.itemDescription ?? `Ordinary ${intent.itemName}.` : null};
    if (normalized.currencyName!==null) {
      const existing=(source.astraSettlementCurrencies ?? []).find((c)=>
        c.label.trim().toLowerCase()===normalized.currencyName);
      const key=existing?.resourceKey ??
        `currency_${normalized.currencyName.replaceAll(" ","_")}`;
      requireRule(Number(issuer.resources[key] ?? 0)===0);
    }
    if (normalized.itemName!==null) requireRule(!source.snapshot.items.some((i)=>
      i.campaign_id===input.campaignId && i.owner_entity_id===issuer.id &&
      i.quantity>0 && i.name.trim().toLowerCase()===
        normalized.itemName!.trim().toLowerCase() &&
      i.category===normalized.itemCategory));
    const grant=grantOrdinary(source,input,hero,normalized,
      "astra:grant-item",outcome);
    changes=grant.changes;
    currencyDefinition=grant.currencyDefinition;
    intent=normalized;
  } else if (intent.kind === "currency_transfer") {
    const giver=presentNpc(source,intent.sourceEntityId);
    requireRule(intent.recipientId===hero.id && Number.isInteger(intent.amount) &&
      intent.amount>=1 && intent.amount<=20);
    const normalizedName=canonicalCurrency(intent.currencyName);
    const chosen=currency(source,normalizedName,false);
    const key=chosen.definition.resourceKey;
    requireRule(Number(giver.resources[key] ?? 0)>=intent.amount);
    changes=[changedResources(giver,key,-intent.amount),changedResources(hero,key,intent.amount)];
    outcome.currency={name:normalizedName,amount:intent.amount,resourceKey:key,
      after:Number(hero.resources[key] ?? 0)+intent.amount};
    intent={...intent,currencyName:normalizedName};
  } else if (intent.kind === "item_transfer") {
    const transfer=intent;
    presentNpc(source,intent.sourceEntityId);
    requireRule(intent.recipientId===hero.id && Number.isInteger(intent.quantity) &&
      intent.quantity>=1 && intent.quantity<=20);
    const item=source.snapshot.items.find((i)=>i.id===transfer.itemId &&
      i.campaign_id===input.campaignId && i.owner_entity_id===transfer.sourceEntityId);
    requireRule(item && item.quantity>=intent.quantity && item.equipped_entity_id===null &&
      item.equipped_slot===null && mundaneCategory.has(item.category) &&
      item.mechanics.trim()==="" && settlementItemTransferAllowed(source,item.id));
    const storageId=playerStorage(source,hero.id);
    const splitItemId=stableGameplayId(input.operationId,`astra:transfer-item:${item.id}`);
    if (item.quantity>intent.quantity)
      requireRule(!source.snapshot.items.some((i)=>i.id===splitItemId));
    const settled=settledItemTransfer(item,intent.quantity,hero.id,storageId,splitItemId);
    changes=settled.changes;
    outcome.item={id:settled.transferredItemId,name:item.name,quantity:intent.quantity};
  } else if (intent.kind === "mundane_purchase") {
    const purchase=intent;
    const seller=presentNpc(source,purchase.sellerId);
    requireRule(source.worldTakeover?.actors.some((a)=>
      a.entityId===seller.id && typeof a.publicName==="string" &&
      a.publicName.length>0));
    requireRule(intent.recipientId===hero.id && Number.isInteger(intent.quantity) &&
      intent.quantity>=1 && intent.quantity<=20 && Number.isInteger(intent.price) &&
      intent.price>=1 && intent.price<=20);
    const normalizedName=canonicalCurrency(intent.currencyName);
    const chosen=currency(source,normalizedName,false);
    const key=chosen.definition.resourceKey;
    const heroBefore=Number(hero.resources[key] ?? 0);
    requireRule(Number.isInteger(heroBefore) && heroBefore>=intent.price);
    const item=source.snapshot.items.find((i)=>i.id===purchase.itemId &&
      i.campaign_id===input.campaignId && i.owner_entity_id===seller.id);
    requireRule(item && item.quantity>=intent.quantity &&
      item.equipped_entity_id===null && item.equipped_slot===null &&
      mundaneCategory.has(item.category) && item.mechanics.trim()==="" &&
      settlementItemTransferAllowed(source,item.id));
    const splitItemId=stableGameplayId(input.operationId,
      `astra:purchase-item:${item.id}`);
    if (item.quantity>intent.quantity)
      requireRule(!source.snapshot.items.some((i)=>i.id===splitItemId));
    const settled=settledItemTransfer(item,intent.quantity,hero.id,
      playerStorage(source,hero.id),splitItemId);
    changes=[changedResources(hero,key,-intent.price),
      changedResources(seller,key,intent.price),...settled.changes];
    outcome.currency={name:normalizedName,amount:-intent.price,
      resourceKey:key,after:heroBefore-intent.price};
    outcome.item={id:settled.transferredItemId,name:item.name,
      quantity:intent.quantity};
    intent={...intent,currencyName:normalizedName};
  } else if (intent.kind === "mundane_sale") {
    const sale=intent;
    const buyer=presentNpc(source,intent.buyerId);
    requireRule(source.worldTakeover?.actors.some((a)=>a.entityId===buyer.id &&
      typeof a.publicName==="string" && a.publicName.length>0));
    requireRule(intent.sellerId===hero.id && Number.isInteger(intent.quantity) &&
      intent.quantity>=1 && intent.quantity<=20 && Number.isInteger(intent.price) &&
      intent.price>=1 && intent.price<=20);
    const normalizedName=canonicalCurrency(intent.currencyName);
    const chosen=currency(source,normalizedName,false);
    const key=chosen.definition.resourceKey;
    requireRule(Number(buyer.resources[key] ?? 0)>=intent.price);
    const item=source.snapshot.items.find((i)=>i.id===sale.itemId &&
      i.campaign_id===input.campaignId && i.owner_entity_id===hero.id);
    requireRule(item && item.quantity>=intent.quantity &&
      item.equipped_entity_id===null && item.equipped_slot===null &&
      settlementItemTransferAllowed(source,item.id));
    const splitId=stableGameplayId(input.operationId,`astra:sale-item:${item.id}`);
    if (item.quantity>intent.quantity)
      requireRule(!source.snapshot.items.some((i)=>i.id===splitId));
    const storage=npcStorage(source,input,buyer.id);
    const moved=settledItemTransfer(item,intent.quantity,buyer.id,
      storage.id,splitId);
    changes=[changedResources(buyer,key,-intent.price),
      changedResources(hero,key,intent.price),
      ...(storage.change ? [storage.change] : []),...moved.changes];
    outcome.currency={name:normalizedName,amount:intent.price,resourceKey:key,
      after:Number(hero.resources[key] ?? 0)+intent.price};
    outcome.item={id:moved.transferredItemId,name:item.name,
      quantity:intent.quantity};
    intent={...intent,currencyName:normalizedName};
  } else if (intent.kind === "item_exchange") {
    const exchange=intent;
    const npc=presentNpc(source,intent.counterpartyId);
    requireRule(intent.playerId===hero.id &&
      source.worldTakeover?.actors.some((a)=>a.entityId===npc.id &&
        typeof a.publicName==="string" && a.publicName.length>0) &&
      Number.isInteger(intent.giveQuantity) && intent.giveQuantity>=1 &&
      intent.giveQuantity<=20 && Number.isInteger(intent.receiveQuantity) &&
      intent.receiveQuantity>=1 && intent.receiveQuantity<=20);
    const given=source.snapshot.items.find((i)=>i.id===exchange.giveItemId &&
      i.campaign_id===input.campaignId && i.owner_entity_id===hero.id);
    const received=source.snapshot.items.find((i)=>i.id===exchange.receiveItemId &&
      i.campaign_id===input.campaignId && i.owner_entity_id===npc.id);
    requireRule(given && received && given.id!==received.id &&
      given.quantity>=exchange.giveQuantity &&
      received.quantity>=exchange.receiveQuantity &&
      given.equipped_entity_id===null && given.equipped_slot===null &&
      received.equipped_entity_id===null && received.equipped_slot===null &&
      settlementItemTransferAllowed(source,given.id) &&
      settlementItemTransferAllowed(source,received.id) &&
      mundaneCategory.has(received.category) && received.mechanics.trim()==="");
    const storage=npcStorage(source,input,npc.id);
    const giveSplitId=stableGameplayId(input.operationId,`astra:barter-give:${given.id}`);
    const receiveSplitId=stableGameplayId(input.operationId,
      `astra:barter-receive:${received.id}`);
    if (given.quantity>exchange.giveQuantity)
      requireRule(!source.snapshot.items.some((i)=>i.id===giveSplitId));
    if (received.quantity>exchange.receiveQuantity)
      requireRule(!source.snapshot.items.some((i)=>i.id===receiveSplitId));
    const movedGive=settledItemTransfer(given,exchange.giveQuantity,npc.id,
      storage.id,giveSplitId);
    const movedReceive=settledItemTransfer(received,exchange.receiveQuantity,
      hero.id,playerStorage(source,hero.id),receiveSplitId);
    changes=[...(storage.change ? [storage.change] : []),
      ...movedGive.changes,...movedReceive.changes];
    outcome.givenItem={id:movedGive.transferredItemId,
      name:given.name,quantity:exchange.giveQuantity};
    outcome.item={id:movedReceive.transferredItemId,
      name:received.name,quantity:exchange.receiveQuantity};
  } else if (intent.kind === "mundane_craft") {
    requireRule(intent.crafterId===hero.id && Array.isArray(intent.inputs) &&
      intent.inputs.length>=1 && intent.inputs.length<=2 &&
      boundedText(intent.itemName,80) && mundaneCategory.has(intent.itemCategory) &&
      (intent.itemDescription===null || boundedText(intent.itemDescription,160)));
    const seen=new Set<string>();
    const inputs=[];
    for (const entry of intent.inputs) {
      requireRule(typeof entry.itemId==="string" && !seen.has(entry.itemId) &&
        Number.isInteger(entry.quantity) && entry.quantity>=1 && entry.quantity<=20);
      seen.add(entry.itemId);
      const item=source.snapshot.items.find((i)=>i.id===entry.itemId &&
        i.campaign_id===input.campaignId && i.owner_entity_id===hero.id);
      const policy=source.astraSettlementItemPolicies?.find((p)=>p.itemId===entry.itemId);
      requireRule(item && item.quantity>=entry.quantity &&
        item.equipped_entity_id===null && item.equipped_slot===null &&
        mundaneCategory.has(item.category) && item.mechanics.trim()==="" &&
        (!policy || policy.visibility==="public"));
      changes.push({family:"items",id:item.id,expectedRevision:item.revision,
        values:{quantity:item.quantity-entry.quantity}});
      inputs.push({itemId:item.id,quantity:entry.quantity,disposition:"consumed"});
    }
    const outputId=stableGameplayId(input.operationId,"astra:craft-item");
    const provenanceId=stableGameplayId(input.operationId,"astra:craft-provenance");
    requireRule(!source.snapshot.items.some((i)=>i.id===outputId));
    const description=intent.itemDescription ?? `Ordinary ${intent.itemName}.`;
    changes.push({family:"items",id:outputId,expectedRevision:null,values:{
      name:intent.itemName,category:intent.itemCategory,quantity:1,
      description,mechanics:"",owner_entity_id:hero.id,
      storage_id:playerStorage(source,hero.id),equipped_entity_id:null,
      equipped_slot:null}});
    changes.push({family:"provenance",id:provenanceId,expectedRevision:null,
      values:{operation_id:input.operationId,
        session_id:source.snapshot.publicState.current_session_id,
        inputs,outputItemIds:[outputId]}});
    outcome.item={id:outputId,name:intent.itemName,quantity:1};
    intent={...intent,itemDescription:description};
  } else throw new TurnError("validation");
  assertDisjoint(baseChanges,changes);
  requireRule(changes.length>0 && changes.length<=5);
  return {schemaVersion:1,kind:intent.kind,intent,changes,currencyDefinition,
    publicOutcome:outcome};
}

export function settlementNarrationProjection(plan: AstraSettlementPlan | null): JsonObject | null {
  return plan ? plan.publicOutcome as unknown as JsonObject : null;
}

export function assertEffectScope(source: RuntimeSource, intent: AstraSettlementIntent) {
  const campaignId=source.snapshot.campaign.id;
  const controlled=source.runtime.configuration?.controlledEntityIds ?? [];
  requireRule(controlled.length===1);
  const present=new Set(source.worldTakeover?.presentEntityIds ?? []);
  const npc=(id: string) => requireRule(present.has(id) &&
    source.snapshot.entities.some((row)=>row.id===id &&
      row.campaign_id===campaignId && row.kind==="npc"));
  const recipient=(id: string) => requireRule(id===controlled[0]);
  const quest=(id: string) => requireRule(source.snapshot.quests.some((row)=>
    row.id===id && row.campaign_id===campaignId));
  const item=(id: string) => requireRule(source.snapshot.items.some((row)=>
    row.id===id && row.campaign_id===campaignId));
  switch(intent.kind) {
    case "progression_award": recipient(intent.recipientId); break;
    case "job_offer": npc(intent.issuerId); break;
    case "job_complete": quest(intent.questId); break;
    case "job_reward": quest(intent.questId); recipient(intent.recipientId); break;
    case "mundane_grant": npc(intent.issuerId); recipient(intent.recipientId); break;
    case "currency_transfer": npc(intent.sourceEntityId); recipient(intent.recipientId); break;
    case "item_transfer": npc(intent.sourceEntityId); recipient(intent.recipientId);
      item(intent.itemId); break;
    case "mundane_purchase": npc(intent.sellerId); recipient(intent.recipientId);
      item(intent.itemId); break;
    case "mundane_sale": npc(intent.buyerId); recipient(intent.sellerId);
      item(intent.itemId); break;
    case "mundane_craft": recipient(intent.crafterId);
      requireRule(Array.isArray(intent.inputs));
      for (const entry of intent.inputs) item(entry.itemId); break;
    case "item_exchange": recipient(intent.playerId); npc(intent.counterpartyId);
      item(intent.giveItemId); item(intent.receiveItemId); break;
  }
}

/** Each valid effect is derived from the same pinned source. Incompatible
 * writes fail the whole turn before narration; individually unrepresentable
 * optional effects are omitted, never translated into a free-form patch. */
export function planAstraEffects(source: RuntimeSource, input: TurnInput,
  intents: Exclude<AstraEffectIntent, import("./astra-mechanics.ts").AstraMechanicsIntent>[], baseChanges: RecordChange[]): AstraLegacyEffectsPlan | null {
  requireRule(Array.isArray(intents) && intents.length <= 6);
  if (!intents.length) return null;
  requireRule(input.mode === "game" && !!source.worldTakeover);
  const effects: AstraSettlementPlan[] = [];
  const rejected: AstraEffectsPlan["rejected"] = [];
  const occupied = new Set(baseChanges.map((change) => `${change.family}:${change.id}`));
  let worldFoundationEffect = false;
  for (const [index, intent] of intents.entries()) {
    if (intent.kind === "unsupported_optional") {
      requireRule(typeof intent.description === "string" &&
        intent.description.length >= 1 && intent.description.length <= 160);
      rejected.push({ index, reason: "not_authorized" });
      continue;
    }
    // Foreign or non-present references are integrity violations, never a
    // soft unsupported-fiction result.
    assertEffectScope(source,intent);
    let plan: AstraSettlementPlan | null;
    try {
      plan = planAstraSettlement(source, input, intent, baseChanges);
    } catch (error) {
      if (!(error instanceof TurnError) || error.code !== "validation") throw error;
      rejected.push({ index, reason: "not_authorized" });
      continue;
    }
    requireRule(plan);
    const changes = plan.changes.map((change) => `${change.family}:${change.id}`);
    requireRule(changes.every((key) => !occupied.has(key)));
    const touchesFoundation = !!plan.currencyDefinition || !!plan.progressionState;
    requireRule(!touchesFoundation || !worldFoundationEffect);
    for (const key of changes) occupied.add(key);
    worldFoundationEffect ||= touchesFoundation;
    effects.push(plan);
  }
  // The existing single-settlement authority applies one Foundation change
  // before ordinary disjoint effects. Keep that plan first for its SQL guard.
  const foundationIndex = effects.findIndex((effect) =>
    !!effect.currencyDefinition || !!effect.progressionState);
  if (foundationIndex > 0) effects.unshift(effects.splice(foundationIndex, 1)[0]);
  if (foundationIndex < 0) {
    const legacyIndex=effects.findIndex((effect)=>legacySettlementKind(effect.kind));
    if (legacyIndex>0) effects.unshift(effects.splice(legacyIndex,1)[0]);
  }
  return { schemaVersion: 1, effects, rejected };
}

export function effectsNarrationProjection(plan: AstraEffectsPlan | null): JsonObject | null {
  return plan ? { accepted: plan.effects.map((effect) => effect.publicOutcome),
    rejected: plan.rejected.map(({ index, reason }) => ({ index, reason })) } as JsonObject : null;
}

/** Bounded private planning affordances. No hidden job metadata is copied to
 * the public narration packet; only the validated outcome is. */
export function settlementAuthoringCapabilities(source: RuntimeSource): JsonObject | null {
  if (!source.worldTakeover) return null;
  const controlled=source.runtime.configuration?.controlledEntityIds ?? [];
  const present=new Set(source.worldTakeover.presentEntityIds);
  const npcs=source.snapshot.entities.filter((e)=>e.kind==="npc" && present.has(e.id));
  const publicSellers=new Set(npcs.filter((e)=>source.worldTakeover?.actors.some((a)=>
    a.entityId===e.id && typeof a.publicName==="string" && a.publicName.length>0))
    .map((e)=>e.id));
  const jobs=(source.astraSettlementJobs ?? []).flatMap((job)=>{
    const quest=source.snapshot.quests.find((q)=>q.id===job.questId);
    return quest && job.rewardTerms && !job.rewardOperationId
      ? [{questId:quest.id,title:quest.title,status:quest.status,
          issuerId:job.issuerId,rewardTerms:job.rewardTerms}] : [];
  });
  return {controlledPlayerId:controlled.length===1 ? controlled[0] : null,
    progressionTracks: source.astraProgressionState?.progression === "on"
      ? source.astraProgressionState.tracks.map((track) => ({ id: track.id,
          label: track.label, kind: track.kind, thresholds: track.thresholds })) : [],
    presentNpcIds:npcs.map((e)=>e.id),jobs,
    existingCurrencies:(source.astraSettlementCurrencies ?? []).map((c)=>({
      name:c.label,resourceKey:c.resourceKey})),
    transferableItemIds:source.snapshot.items.filter((i)=>
      i.owner_entity_id!==null && present.has(i.owner_entity_id) &&
      npcs.some((e)=>e.id===i.owner_entity_id) &&
      i.equipped_entity_id===null && i.equipped_slot===null &&
      mundaneCategory.has(i.category) && i.mechanics.trim()==="" &&
      settlementItemTransferAllowed(source,i.id))
      .map((i)=>i.id),
    purchasableItemIds:source.snapshot.items.filter((i)=>
      i.owner_entity_id!==null && publicSellers.has(i.owner_entity_id) &&
      i.equipped_entity_id===null && i.equipped_slot===null &&
      mundaneCategory.has(i.category) && i.mechanics.trim()==="" &&
      settlementItemTransferAllowed(source,i.id))
      .map((i)=>i.id),
    sellableItemIds:source.snapshot.items.filter((i)=>
      i.owner_entity_id===controlled[0] && i.quantity>0 &&
      i.equipped_entity_id===null && i.equipped_slot===null &&
      settlementItemTransferAllowed(source,i.id)).map((i)=>i.id),
    merchantBuyerIds:npcs.filter((e)=>source.worldTakeover?.actors.some((a)=>
      a.entityId===e.id && typeof a.publicName==="string" &&
      a.publicName.length>0)).map((e)=>e.id),
    mundaneIngredientItemIds:source.snapshot.items.filter((i)=>
      i.owner_entity_id===controlled[0] && i.quantity>0 &&
      i.equipped_entity_id===null && i.equipped_slot===null &&
      mundaneCategory.has(i.category) && i.mechanics.trim()==="" &&
      !source.astraSettlementItemPolicies?.some((p)=>p.itemId===i.id &&
        p.visibility!=="public"))
      .map((i)=>i.id),
    barterOfferItemIds:source.snapshot.items.filter((i)=>
      i.owner_entity_id===controlled[0] && i.quantity>0 &&
      i.equipped_entity_id===null && i.equipped_slot===null &&
      settlementItemTransferAllowed(source,i.id)).map((i)=>i.id),
    limits:{ordinaryCurrencyAmount:20,transferQuantity:20,purchasePrice:20,
      newItemCategories:["food","supply","misc"]}} as unknown as JsonObject;
}
