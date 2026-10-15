import type { JsonObject, TurnInput } from "./contracts.ts";
import type { AstraToolReceipt, MechanicsResolution, RecordChange, RuntimeSource } from "./server-contracts.ts";
import { stableGameplayId } from "./dice.ts";
import { requireRule, TurnError } from "./turn-errors.ts";
import { applyAstraShadowChanges } from "./astra-ordered-effects.ts";
import { planAstraMechanics } from "./astra-mechanics.ts";
import { settledCurrencyBalance, settledItemTransfer } from "../progression/settlement-core.ts";
import { ProgressionValidationError } from "../progression/validation.ts";
import { genericManifest, genericStances, genericTones, type GenericBehavior, type GenericCurrency,
  type GenericManifest, type GenericOperation, type GenericPublication, type GenericRef, type GenericText } from "./astra-generic-contract.ts";

type Job = { questId: string; issuerId: string | null; rewardTerms: JsonObject | null; rewardOperationId: string | null };
export type GenericPlan = { schemaVersion: 3; intents: GenericOperation[]; accepted: string[];
  rejected: { opId: string; reason: "not_authorized" | "dependency" }[];
  resolution: MechanicsResolution; foundationState: JsonObject | null; jobs: Job[];
  publication: GenericPublication | null; behavior: GenericBehavior[];
  rulePlans: {opId:string;plan:ReturnType<typeof planAstraMechanics>}[];
  refs:Record<string,{family:string;id:string}> };
type State = { source: RuntimeSource; manifest: GenericManifest; refs: Record<string,{family:string;id:string}>;
  changes: Map<string,RecordChange>; jobs: Job[]; foundationState: JsonObject | null; intents: GenericOperation[] };
const idPattern=/^[a-z][a-z0-9_-]{0,31}$/;
const fields=(v:object,keys:string[])=>requireRule(v && typeof v==="object" && !Array.isArray(v) &&
  Object.keys(v).length===keys.length && keys.every(key=>Object.hasOwn(v,key)));
const integer=(v:unknown,min:number,max:number)=>{requireRule(Number.isSafeInteger(v) && Number(v)>=min && Number(v)<=max);return Number(v);};
const row=(s:State,family:string,id:string)=>{
  const values=(s.source.snapshot as unknown as Record<string,unknown>)[family];
  requireRule(Array.isArray(values));
  const value=values.find((v:Record<string,unknown>)=>v.id===id && v.campaign_id===s.source.snapshot.campaign.id);
  requireRule(value);return value as Record<string,unknown>;
};
function resolve(s:State,ref:GenericRef,family:string):string {
  requireRule(ref && typeof ref==="object");fields(ref,["source","key"]);
  const chosen=ref.source==="known" ? s.manifest.records[ref.key] : ref.source==="local" ? s.refs[ref.key] : null;
  requireRule(chosen?.family===family);return chosen.id;
}
function publicText(s:State,value:GenericText|null,max:number,fallback:string|null=null):string {
  if(value===null){requireRule(fallback!==null);return fallback;}
  requireRule(value && typeof value==="object");
  if(value.source==="inline") {fields(value,["source","text"]);requireRule(s.source.astraResponseMode!=="private-informed");}
  else {fields(value,["source","evidence","text"]);requireRule(value.source==="public-evidence" &&
    typeof s.manifest.evidence[value.evidence]==="string" && s.manifest.evidence[value.evidence].includes(value.text));}
  requireRule(typeof value.text==="string" && value.text===value.text.trim() && value.text.length>0 &&
    value.text.length<=max && !/[\u0000-\u001f]/.test(value.text));return value.text;
}
function add(s:State,change:RecordChange) {
  const key=`${change.family}:${change.id}`,prior=s.changes.get(key);
  requireRule(!prior || prior.expectedRevision===null || prior.expectedRevision===change.expectedRevision);
  applyAstraShadowChanges(s.source,[change]);
  s.changes.set(key,{...change,expectedRevision:prior ? prior.expectedRevision : change.expectedRevision,
    values:{...prior?.values,...change.values}});
}
function revision(value:Record<string,unknown>):number|null { return Number(value.revision) || null; }
function change(s:State,family:RecordChange["family"],id:string,values:JsonObject) {
  add(s,{family,id,expectedRevision:revision(row(s,family,id)),values});
}
function present(s:State,id:string) {
  requireRule(s.source.runtime.configuration?.presentEntityIds.includes(id));
  return row(s,"entities",id);
}
function storage(s:State,input:TurnInput,owner:string|null,explicit:GenericRef|null):string {
  if(explicit){const id=resolve(s,explicit,"storages"),found=row(s,"storages",id);
    requireRule(found.entity_id===owner && owner!==null);return id;}
  requireRule(owner!==null);const actor=present(s,owner);
  const found=s.source.snapshot.storages.find(v=>v.entity_id===owner);
  if(found)return found.id;
  requireRule(actor.kind==="npc");
  const id=stableGameplayId(input.operationId,`generic-v1:${input.campaignId}:storage:${owner}`);
  add(s,{family:"storages",id,expectedRevision:null,values:{name:`Inventory of ${actor.name}`.slice(0,160),kind:"merchant",entity_id:owner}});
  return id;
}
function currency(s:State,value:GenericCurrency):{name:string;key:string} {
  fields(value,["existing","publicName"]);requireRule((value.existing===null)!==(value.publicName===null));
  const existing=s.source.astraSettlementCurrencies ?? [];
  if(value.existing!==null){const found=existing.find(v=>v.resourceKey===value.existing);requireRule(found);
    return {name:found.label,key:found.resourceKey};}
  const name=publicText(s,value.publicName,32).toLowerCase().replace(/ +/g," ");
  requireRule(/^[a-z][a-z ]{0,31}$/.test(name));
  const found=existing.find(v=>v.label.trim().toLowerCase()===name);
  if(found)return {name,key:found.resourceKey};
  requireRule(s.source.astraProgressionState && existing.length<32);
  const slug=name.replaceAll(" ","_"),definition={id:`currency:${slug}`,label:name,resourceKey:`currency_${slug}`,version:1 as const};
  requireRule(!existing.some(v=>v.id===definition.id || v.resourceKey===definition.resourceKey));
  s.source.astraSettlementCurrencies=[...existing,definition];
  s.source.astraProgressionState={...s.source.astraProgressionState,currencies:[...s.source.astraProgressionState.currencies,definition],
    version:s.source.astraProgressionState.version+1};
  s.foundationState=s.source.astraProgressionState as unknown as JsonObject;
  return {name,key:definition.resourceKey};
}
function adjust(s:State,id:string,key:string,amount:number) {
  const actor=present(s,id),resources=actor.resources as Record<string,number>;
  const after=settledCurrencyBalance(resources[key] ?? 0,amount);
  change(s,"entities",id,{resources:{...resources,[key]:after}});
}
function pay(s:State,recipient:string,payer:string,selection:GenericCurrency,amount:number) {
  integer(amount,1,20);requireRule(recipient!==payer);
  const {key}=currency(s,selection),from=present(s,payer),resources=from.resources as Record<string,number>;
  // An authoritative missing property is untracked; explicit zero is not missing.
  if(Object.hasOwn(resources,key)) adjust(s,payer,key,-amount);
  else requireRule(from.kind==="npc");
  adjust(s,recipient,key,amount);
}
function references(value:unknown,into=new Set<string>()):Set<string> {
  if(Array.isArray(value))for(const v of value)references(v,into);
  else if(value && typeof value==="object"){
    const v=value as Record<string,unknown>;
    if(v.source==="local" && typeof v.key==="string")into.add(v.key);
    for(const entry of Object.values(v))references(entry,into);
  }return into;
}
function basis(s:State,op:GenericOperation,receipts:AstraToolReceipt[]) {
  const value="basis" in op ? op.basis : "mutation" in op && "basis" in op.mutation ? op.mutation.basis : null;
  if(value===null)return;
  fields(value,["source","key"]);
  requireRule(value.source==="public-evidence" ? Object.hasOwn(s.manifest.evidence,value.key) :
    value.source==="tool" ? receipts.some(r=>value.key===`tool-${r.position}`) :
    value.source==="rule" && ["long-rest","short-rest"].includes(value.key));
}
function exchangeGroup(s:State,op:GenericOperation,from:string,to:string,itemTransfer:boolean) {
  for(const other of s.intents){
    if(itemTransfer && other?.kind==="resource.adjust" && other.mutation?.action==="transfer"){
      if(resolve(s,other.mutation.from,"entities")===to && resolve(s,other.mutation.to,"entities")===from)
        requireRule(op.atomicGroup!==null && op.atomicGroup===other.atomicGroup);
    }else if(!itemTransfer && other?.kind==="item.mutate" && other.mutation?.action==="transfer"){
      const item=row(s,"items",resolve(s,other.mutation.target,"items"));
      if(other.mutation.recipient && resolve(s,other.mutation.recipient,"entities")===from && item.owner_entity_id===to)
        requireRule(op.atomicGroup!==null && op.atomicGroup===other.atomicGroup);
    }
  }
}
function one(s:State,input:TurnInput,op:GenericOperation,receipts:AstraToolReceipt[]) {
  requireRule(op && typeof op==="object" && idPattern.test(op.opId));basis(s,op,receipts);
  const common=["opId","requiresOperations","atomicGroup","kind"];
  const newId=stableGameplayId(input.operationId,`generic-v1:${input.campaignId}:${op.opId}`);
  if(op.kind==="entity.upsert"){
    fields(op,[...common,"target","name","description","profile","present"]);
    const id=op.target?resolve(s,op.target,"entities"):newId;
    const current=op.target?row(s,"entities",id):null;
    requireRule(!current || current.kind==="npc" || current.kind==="companion");
    requireRule(op.profile===null || !current && op.profile.startsWith("actor-profile:"));
    const values:JsonObject={};
    if(op.name!==null)values.name=publicText(s,op.name,200);
    if(op.description!==null)values.details=publicText(s,op.description,1000);
    if(!current){requireRule(typeof values.name==="string" && !s.source.snapshot.entities.some(v=>v.name.toLowerCase()===String(values.name).toLowerCase()));
      Object.assign(values,{kind:"npc",details:values.details ?? `An ordinary person named ${values.name}.`,hp:null,max_hp:null,
        stats:{},resources:{},conditions:[],equipment_slots:[]});}
    if(op.profile!==null){const templateId=resolve(s,{source:"known",key:op.profile.slice("actor-profile:".length)},"entities");
      const template=row(s,"entities",templateId),stats=template.stats as Record<string,number>;
      requireRule(Number.isInteger(template.max_hp) && Number(template.max_hp)>0 &&
        ["attack","defense","skill"].every(k=>Number.isInteger(stats[k])));
      values.hp=Number(template.max_hp);values.max_hp=Number(template.max_hp);
      values.stats=Object.fromEntries(["attack","defense","skill","save"].filter(k=>Number.isInteger(stats[k])).map(k=>[k,stats[k]]));}
    requireRule(Object.keys(values).length>0 || op.present!==null);
    add(s,{family:"entities",id,expectedRevision:current?revision(current):null,values});
    s.refs[op.opId]={family:"entities",id};
    if(op.present!==null){requireRule(typeof op.present==="boolean" && s.source.runtime.configuration);
      const config=s.source.runtime.configuration;
      config.presentEntityIds=op.present ? [...new Set([...config.presentEntityIds,id])] : config.presentEntityIds.filter(v=>v!==id);
      if(s.source.worldTakeover)s.source.worldTakeover.presentEntityIds=[...config.presentEntityIds];}
  }else if(op.kind==="location.upsert"){
    fields(op,[...common,"target","name","description","status","makeCurrent"]);
    const id=op.target?resolve(s,op.target,"locations"):newId,current=op.target?row(s,"locations",id):null,values:JsonObject={};
    if(op.name!==null)values.name=publicText(s,op.name,200);
    if(op.description!==null)values.description=publicText(s,op.description,1000);
    if(op.status!==null){requireRule(["known","visited"].includes(op.status));values.status=op.status;}
    if(!current){requireRule(values.name);Object.assign(values,{description:values.description ?? `A place called ${values.name}.`,status:values.status ?? "known"});}
    add(s,{family:"locations",id,expectedRevision:current?revision(current):null,values});s.refs[op.opId]={family:"locations",id};
    requireRule(typeof op.makeCurrent==="boolean");
    if(op.makeCurrent){requireRule(s.source.runtime.worldMinutes>inputWorldMinutes(s));
      const state=s.source.snapshot.publicState;
      add(s,{family:"public_state",id:input.campaignId,expectedRevision:state.revision,values:{current_location_id:id}});
      if(s.source.runtime.configuration){const cfg=s.source.runtime.configuration;
        cfg.presentEntityIds=cfg.presentEntityIds.filter(actor=>cfg.controlledEntityIds.includes(actor)||
          s.source.snapshot.entities.some(e=>e.id===actor && e.kind==="companion"));cfg.nearbyStorageIds=[];}}
  }else if(op.kind==="item.mutate"){
    fields(op,[...common,"mutation"]);const m=op.mutation;requireRule(m && typeof m==="object");
    if(m.action==="create"){
      fields(m,["action","name","description","category","quantity","owner","storage","basis"]);
      requireRule(["food","supply","misc"].includes(m.category));integer(m.quantity,1,20);
      const owner=m.owner?resolve(s,m.owner,"entities"):null;requireRule(owner!==null);
      const name=publicText(s,m.name,80),description=publicText(s,m.description,160,`Ordinary ${name}.`);
      add(s,{family:"items",id:newId,expectedRevision:null,values:{name,category:m.category,description,quantity:m.quantity,
        mechanics:"",owner_entity_id:owner,storage_id:storage(s,input,owner,m.storage),equipped_entity_id:null,equipped_slot:null}});
      s.refs[op.opId]={family:"items",id:newId};
    }else{
      const id=resolve(s,m.target,"items"),item=row(s,"items",id);requireRule(item.owner_entity_id!==null);
      present(s,String(item.owner_entity_id));
      requireRule(!s.source.astraSettlementItemPolicies?.some(p=>p.itemId===id && (p.visibility!=="public"||p.trade!=="allowed")));
      if(m.action==="update"){
        fields(m,["action","target","name","description","equipment"]);const values:JsonObject={};
        if(m.name!==null)values.name=publicText(s,m.name,200);
        if(m.description!==null)values.description=publicText(s,m.description,1000);
        if(m.equipment){fields(m.equipment,["wearer","slot"]);const wearer=resolve(s,m.equipment.wearer,"entities"),actor=present(s,wearer);
          requireRule(item.owner_entity_id===wearer && Number(item.quantity)>0);
          const slots=actor.equipment_slots as {id:string;accepts:string[]}[];
          requireRule(m.equipment.slot===null || slots.some(v=>v.id===m.equipment!.slot && v.accepts.includes(String(item.category))));
          requireRule(m.equipment.slot===null || !s.source.snapshot.items.some(v=>v.id!==id && v.equipped_entity_id===wearer && v.equipped_slot===m.equipment!.slot));
          values.equipped_entity_id=m.equipment.slot===null?null:wearer;values.equipped_slot=m.equipment.slot;}
        requireRule(Object.keys(values).length>0);change(s,"items",id,values);
      }else if(m.action==="transfer"){
        fields(m,["action","target","quantity","recipient","storage","basis"]);integer(m.quantity,1,1000000);
        const recipient=m.recipient?resolve(s,m.recipient,"entities"):null;
        if(recipient)exchangeGroup(s,op,String(item.owner_entity_id),recipient,true);
        const result=settledItemTransfer(item as never,m.quantity,recipient as string,
          storage(s,input,recipient,m.storage),newId);
        for(const c of result.changes)add(s,c);
        s.refs[op.opId]={family:"items",id:result.transferredItemId};
      }else{
        fields(m,["action","target","quantity","basis"]);requireRule(["consume","remove"].includes(m.action));integer(m.quantity,1,1000000);
        requireRule(Number(item.quantity)>=m.quantity && item.equipped_entity_id===null);
        change(s,"items",id,{quantity:Number(item.quantity)-m.quantity});
      }
    }
  }else if(op.kind==="resource.adjust"){
    fields(op,[...common,"mutation"]);const m=op.mutation;requireRule(m && typeof m==="object");
    if(m.action==="transfer"){
      fields(m,["action","from","to","currency","amount","basis"]);integer(m.amount,1,20);
      const from=resolve(s,m.from,"entities"),to=resolve(s,m.to,"entities");requireRule(from!==to);
      exchangeGroup(s,op,from,to,false);
      const {key}=currency(s,m.currency);adjust(s,from,key,-m.amount);adjust(s,to,key,m.amount);
    }else{
      fields(m,["action","actor","resource","amount","payer","basis"]);integer(m.amount,-1000000,1000000);
      const actor=resolve(s,m.actor,"entities"),current=present(s,actor);
      if(m.resource.kind==="currency"){
        fields(m.resource,["kind","currency"]);const selection=m.resource.currency;
        if(m.amount>0){requireRule(m.payer);pay(s,actor,resolve(s,m.payer,"entities"),selection,m.amount);}
        else {requireRule(m.payer===null);adjust(s,actor,currency(s,selection).key,m.amount);}
      }else if(m.resource.kind==="tracked"){
        fields(m.resource,["kind","key"]);requireRule(m.payer===null && m.amount<=0 &&
          Object.hasOwn(current.resources as object,m.resource.key));adjust(s,actor,m.resource.key,m.amount);
      }else{
        fields(m.resource,["kind"]);requireRule(m.resource.kind==="hp" && m.payer===null && m.amount<0 && m.basis?.source==="tool");
        const damage=receipts.filter(r=>r.call.kind==="damage" && r.call.targetId===actor);
        const total=damage.reduce((n,r)=>n+Number(r.result.total),0);
        requireRule(damage.some(r=>m.basis!.key===`tool-${r.position}`) && typeof current.hp==="number" &&
          m.amount===-Math.min(current.hp,total) && !s.changes.get(`entities:${actor}`)?.values.hp);
        change(s,"entities",actor,{hp:current.hp+m.amount});
      }
    }
  }else if(op.kind==="quest.mutate"){
    fields(op,[...common,"mutation"]);const m=op.mutation;requireRule(m && typeof m==="object");
    if(m.action==="create"){
      fields(m,["action","title","description","issuer","reward","basis"]);
      const issuer=m.issuer?resolve(s,m.issuer,"entities"):null;if(issuer)requireRule(present(s,issuer).kind==="npc");
      const title=publicText(s,m.title,120),description=publicText(s,m.description,500);
      let rewardTerms:JsonObject|null=null;
      if(m.reward){fields(m.reward,["currency","amount","item"]);requireRule(issuer);
        const c=m.reward.currency?currency(s,m.reward.currency):null;integer(m.reward.amount,c?1:0,c?20:0);
        const item=m.reward.item;if(item){fields(item,["name","category","description"]);requireRule(["food","supply","misc"].includes(item.category));}
        const name=item?publicText(s,item.name,80):null;
        rewardTerms={issuerId:issuer,currencyName:c?.name ?? null,currencyAmount:c?m.reward.amount:null,
          itemName:name,itemCategory:item?.category ?? null,itemDescription:item?publicText(s,item.description,160,`Ordinary ${name}.`):null};}
      add(s,{family:"quests",id:newId,expectedRevision:null,values:{title,description,status:"open"}});
      s.jobs.push({questId:newId,issuerId:issuer,rewardTerms,rewardOperationId:null});s.refs[op.opId]={family:"quests",id:newId};
    }else{
      const id=resolve(s,m.target,"quests"),quest=row(s,"quests",id),job=s.jobs.find(v=>v.questId===id);
      if(m.action==="update"){
        fields(m,["action","target","title","description"]);const values:JsonObject={};
        if(m.title!==null)values.title=publicText(s,m.title,120);if(m.description!==null)values.description=publicText(s,m.description,500);
        requireRule(Object.keys(values).length>0);change(s,"quests",id,values);
      }else if(m.action==="status"){
        fields(m,["action","target","status","outcome","basis"]);requireRule(["open","complete","archived"].includes(m.status) &&
          quest.status==="open" && m.status!=="open" && !job?.rewardOperationId);
        const values:JsonObject={status:m.status};if(m.outcome!==null)values.description=`${quest.description}\n${publicText(s,m.outcome,500)}`;
        change(s,"quests",id,values);
      }else{
        fields(m,["action","target","basis"]);requireRule(m.action==="claim" && quest.status==="complete" && job?.issuerId &&
          job.rewardTerms && job.rewardOperationId===null);
        const terms=job.rewardTerms;
        if(terms.currencyName)pay(s,s.source.runtime.configuration!.controlledEntityIds[0],job.issuerId,
          {existing:null,publicName:{source:"public-evidence",evidence:`job/${id}/currency`,text:String(terms.currencyName)}},Number(terms.currencyAmount));
        if(terms.itemName){const hero=s.source.runtime.configuration!.controlledEntityIds[0];
          add(s,{family:"items",id:newId,expectedRevision:null,values:{name:terms.itemName,category:terms.itemCategory,
            quantity:1,description:terms.itemDescription,mechanics:"",owner_entity_id:hero,
            storage_id:storage(s,input,hero,null),equipped_entity_id:null,equipped_slot:null}});}
        job.rewardOperationId=input.operationId;change(s,"quests",id,{status:"complete"});
      }
    }
  }else{
    requireRule(op.kind==="time.advance");fields(op,[...common,"minutes","basis"]);
    s.source.runtime.worldMinutes+=integer(op.minutes,0,1440);
    requireRule(s.source.runtime.worldMinutes<=inputWorldMinutes(s)+1440);
  }
}
// Stored only on the cloned compiler state, never persisted as runtime authority.
const origins=new WeakMap<RuntimeSource,number>();
const inputWorldMinutes=(s:State)=>origins.get(s.source) ?? s.source.runtime.worldMinutes;
function clone(s:State):State {const result=structuredClone(s);origins.set(result.source,inputWorldMinutes(s));return result;}

export function compileGenericOperations(source:RuntimeSource,input:TurnInput,intents:GenericOperation[],
  receipts:AstraToolReceipt[]=[],publication:GenericPublication|null=null,behavior:GenericBehavior[]=[]):GenericPlan {
  requireRule(input.campaignId===source.snapshot.campaign.id && input.campaignId===source.runtime.campaignId &&
    input.expectedRevision===source.runtime.revision && input.mode==="game" && Array.isArray(intents) && intents.length<=12);
  let s:State={source:structuredClone(source),manifest:genericManifest(source,input),refs:{},changes:new Map(),
    jobs:(source.astraSettlementJobs ?? []).map(v=>({...v,rewardTerms:v.rewardTerms as JsonObject|null})),foundationState:null,intents};
  origins.set(s.source,source.runtime.worldMinutes);
  for(const job of s.jobs)if(job.rewardTerms?.currencyName)s.manifest.evidence[`job/${job.questId}/currency`]=String(job.rewardTerms.currencyName);
  const accepted:string[]=[],rejected:GenericPlan["rejected"]=[],seen=new Set<string>(),closedGroups=new Set<string>();
  const rulePlans:GenericPlan["rulePlans"]=[];
  const duplicateIds=new Set(intents.filter((op,i)=>intents.some((other,j)=>i!==j && op?.opId===other?.opId)).map(op=>op?.opId));
  for(let index=0;index<intents.length;){
    const first=intents[index],group:GenericOperation[]=[first];index++;
    if(first?.atomicGroup)while(index<intents.length && intents[index]?.atomicGroup===first.atomicGroup)group.push(intents[index++]);
    const candidate=clone(s),groupIds=new Set<string>(),dependencies=new Set(accepted);
    try{
      requireRule(first && (!first.atomicGroup || idPattern.test(first.atomicGroup) && !closedGroups.has(first.atomicGroup)));
      const rest=group.find(op=>op.kind==="time.advance" && op.basis?.source==="rule");
      if(rest){
        requireRule(first.atomicGroup && rest.kind==="time.advance" && rest.minutes===null && rest.basis?.source==="rule");
        const result=planAstraMechanics(candidate.source,input,{kind:"formal_rest",restKind:rest.basis.key==="long-rest"?"long":"short",
          restSafety:{locationId:source.snapshot.publicState.current_location_id!,suitable:true}});
        requireRule(result);
        for(const op of group){requireRule(op.kind==="time.advance" || ("mutation" in op && "basis" in op.mutation &&
          op.mutation.basis?.source==="rule" && op.mutation.basis.key===rest.basis.key));
          // Explicit duplicated recovery/consumption requires exact rule result; never apply twice.
          if(op.kind==="resource.adjust" && op.mutation.action==="delta"){
            const actor=resolve(candidate,op.mutation.actor,"entities"),old=row(candidate,"entities",actor);
            requireRule(op.mutation.resource.kind==="hp" && result.resolution.changes.some(c=>c.family==="entities" && c.id===actor &&
              c.values.hp===Number(old.hp)+op.mutation.amount));
          }else if(op.kind==="item.mutate" && op.mutation.action==="consume"){
            const id=resolve(candidate,op.mutation.target,"items"),old=row(candidate,"items",id);
            const quantity=op.mutation.quantity;
            requireRule(result.resolution.changes.some(c=>c.family==="items" && c.id===id && c.values.quantity===Number(old.quantity)-quantity));
          }else requireRule(op.kind==="time.advance");
        }
        for(const c of result.resolution.changes)add(candidate,c);
        candidate.source.runtime.worldMinutes=result.resolution.worldMinutes;
        candidate.source.runtime.configuration=result.resolution.configuration;
      }
      for(const op of group){
        requireRule(op && idPattern.test(op.opId) && !duplicateIds.has(op.opId) && !seen.has(op.opId) && !groupIds.has(op.opId) &&
          Array.isArray(op.requiresOperations) && new Set(op.requiresOperations).size===op.requiresOperations.length &&
          [...op.requiresOperations,...references(op)].every(v=>dependencies.has(v)));
        groupIds.add(op.opId);
        if(!rest)one(candidate,input,op,receipts);
        dependencies.add(op.opId);
        // Stored job terms are already public and reusable inside a same-turn claim.
        for(const job of candidate.jobs)if(job.rewardTerms?.currencyName)candidate.manifest.evidence[`job/${job.questId}/currency`]=String(job.rewardTerms.currencyName);
      }
      if(rest && rest.kind==="time.advance"){
        const plan=planAstraMechanics(s.source,input,{kind:"formal_rest",restKind:rest.basis!.key==="long-rest"?"long":"short",
          restSafety:{locationId:source.snapshot.publicState.current_location_id!,suitable:true}});
        rulePlans.push({opId:rest.opId,plan});
      }
      s=candidate;accepted.push(...groupIds);
    }catch(error){if(!(error instanceof ProgressionValidationError) && (!(error instanceof TurnError) || error.code!=="validation"))throw error;
      for(const op of group)rejected.push({opId:typeof op?.opId==="string"?op.opId:"invalid",reason:"not_authorized"});}
    for(const op of group)if(op?.opId)seen.add(op.opId);
    if(first?.atomicGroup)closedGroups.add(first.atomicGroup);
  }
  requireRule(s.changes.size<=100);
  for(const participant of source.runtime.participants){
    if(!source.runtime.encounters.some(e=>e.id===participant.encounter_id && e.status==="active"))continue;
    const cost=receipts.filter(r=>["attack","skill"].includes(r.call.kind) && r.call.actorId===participant.entity_id).length;
    const defeated=s.source.snapshot.entities.some(e=>e.id===participant.entity_id && e.hp===0);
    if(!cost && !defeated)continue;
    requireRule(cost<=1 && Number(participant.public_resources.action)>=cost);
    add(s,{family:"encounter_participants",id:participant.id,expectedRevision:null,values:{public_position:participant.public_position,
      public_resources:{...participant.public_resources,action:Number(participant.public_resources.action)-cost,
        withdrawn:participant.public_resources.withdrawn===true||defeated}}});
  }
  return {schemaVersion:3,intents:structuredClone(intents),accepted,rejected,
    resolution:{changes:[...s.changes.values()],worldMinutes:s.source.runtime.worldMinutes,
      configuration:s.source.runtime.configuration,outcomes:[]},foundationState:s.foundationState,
    jobs:s.jobs,publication,behavior,rulePlans,refs:s.refs};
}

export function genericPublication(value:GenericPublication,accepted:string[]) {
  requireRule(value && typeof value==="object");fields(value,["beats","visualDescription","sceneLocale"]);
  requireRule(Array.isArray(value.beats) && value.beats.length>0 && value.beats.length<=12);
  const valid=(dependencies:string[])=>{requireRule(Array.isArray(dependencies) && dependencies.length<=12 &&
    new Set(dependencies).size===dependencies.length && dependencies.every(v=>idPattern.test(v)));
    return dependencies.every(v=>accepted.includes(v));};
  let independent=false;
  const narration=value.beats.filter(beat=>{fields(beat,["text","requiresOperations"]);
    requireRule(typeof beat.text==="string" && beat.text.length<=6000);
    if(!beat.requiresOperations.length && beat.text.trim())independent=true;
    return valid(beat.requiresOperations);}).map(v=>v.text).filter(v=>v.trim()).join("\n\n");
  requireRule(independent && narration.length>0 && narration.length<=6000);
  let visualDescription="",sceneLocale:string|null=null;
  if(value.visualDescription){fields(value.visualDescription,["text","requiresOperations"]);
    requireRule(typeof value.visualDescription.text==="string" && value.visualDescription.text.length<=2000);
    if(valid(value.visualDescription.requiresOperations))visualDescription=value.visualDescription.text;}
  if(value.sceneLocale){fields(value.sceneLocale,["label","requiresOperations"]);
    requireRule(typeof value.sceneLocale.label==="string" && value.sceneLocale.label.trim().length>0 && value.sceneLocale.label.length<=120);
    if(valid(value.sceneLocale.requiresOperations))sceneLocale=value.sceneLocale.label;}
  return {narration,visualDescription,clarification:null,sceneLocale};
}

export function genericBehavior(source:RuntimeSource,manifest:GenericManifest,values:GenericBehavior[]) {
  requireRule(Array.isArray(values) && values.length<=2);const seen=new Set<string>();
  return values.map(value=>{fields(value,["actor","stance","tone","intensity"]);
    requireRule(value.actor.source==="known");const record=manifest.records[value.actor.key];
    requireRule(record?.family==="entities" && !seen.has(record.id) && source.runtime.configuration?.presentEntityIds.includes(record.id) &&
      !source.runtime.configuration.controlledEntityIds.includes(record.id) && genericStances.includes(value.stance) &&
      genericTones.includes(value.tone) && [1,2,3].includes(value.intensity));seen.add(record.id);
    return {actorId:record.id,stance:value.stance,tone:value.tone,intensity:value.intensity};});
}
