import type { TurnInput, JsonObject } from "./contracts.ts";
import type { RecordChange, RuntimeSource } from "./server-contracts.ts";
import { stableGameplayId } from "./dice.ts";
import { requireRule, TurnError } from "./turn-errors.ts";
import { settledCurrencyBalance, settledItemTransfer } from "../progression/settlement-core.ts";

export type AstraSettlementIntent =
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
      itemId: string; quantity: number; currencyName: string; price: number };

export type AstraSettlementPublicOutcome = {
  kind: AstraSettlementIntent["kind"];
  questId: string | null;
  questStatus: "open" | "complete" | null;
  currency: { name: string; amount: number; resourceKey: string; after: number } | null;
  item: { id: string; name: string; quantity: number } | null;
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
  requireRule(extra.length <= 4 && extra.every((c) => !ids.has(`${c.family}:${c.id}`)));
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
  if (intent.kind === "job_offer") {
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
  } else throw new TurnError("validation");
  assertDisjoint(baseChanges,changes);
  requireRule(changes.length>0 && changes.length<=4);
  return {schemaVersion:1,kind:intent.kind,intent,changes,currencyDefinition,
    publicOutcome:outcome};
}

export function settlementNarrationProjection(plan: AstraSettlementPlan | null): JsonObject | null {
  return plan ? plan.publicOutcome as unknown as JsonObject : null;
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
    limits:{ordinaryCurrencyAmount:20,transferQuantity:20,purchasePrice:20,
      newItemCategories:["food","supply","misc"]}} as unknown as JsonObject;
}
