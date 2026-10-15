import type { JsonObject, TurnInput } from "./contracts.ts";
import type { PrivatePatch, RuntimeSource } from "./server-contracts.ts";
import { requireRule } from "./turn-errors.ts";

export type GenericRef = { source: "known" | "local"; key: string };
export type GenericText = { source: "inline"; text: string } |
  { source: "public-evidence"; evidence: string; text: string };
export type GenericBasis = { source: "tool" | "rule" | "public-evidence"; key: string } | null;
export type GenericCurrency = { existing: string | null; publicName: GenericText | null };
type Common = { opId: string; requiresOperations: string[]; atomicGroup: string | null };
export type GenericOperation = Common & (
  | { kind: "entity.upsert"; target: GenericRef | null; name: GenericText | null;
      description: GenericText | null; profile: string | null; present: boolean | null }
  | { kind: "location.upsert"; target: GenericRef | null; name: GenericText | null;
      description: GenericText | null; status: "known" | "visited" | null; makeCurrent: boolean }
  | { kind: "item.mutate"; mutation:
      { action: "create"; name: GenericText; description: GenericText | null;
        category: "food" | "supply" | "misc"; quantity: number;
        owner: GenericRef | null; storage: GenericRef | null; basis: GenericBasis } |
      { action: "update"; target: GenericRef; name: GenericText | null;
        description: GenericText | null; equipment: { wearer: GenericRef; slot: string | null } | null } |
      { action: "transfer"; target: GenericRef; quantity: number; recipient: GenericRef | null;
        storage: GenericRef | null; basis: GenericBasis } |
      { action: "consume" | "remove"; target: GenericRef; quantity: number; basis: GenericBasis } }
  | { kind: "resource.adjust"; mutation:
      { action: "delta"; actor: GenericRef; resource:
        { kind: "hp" } | { kind: "tracked"; key: string } |
        { kind: "currency"; currency: GenericCurrency };
        amount: number; payer: GenericRef | null; basis: GenericBasis } |
      { action: "transfer"; from: GenericRef; to: GenericRef; currency: GenericCurrency;
        amount: number; basis: GenericBasis } }
  | { kind: "quest.mutate"; mutation:
      { action: "create"; title: GenericText; description: GenericText; issuer: GenericRef | null;
        reward: { currency: GenericCurrency | null; amount: number;
          item: { name: GenericText; category: "food" | "supply" | "misc";
            description: GenericText | null } | null } | null; basis: GenericBasis } |
      { action: "update"; target: GenericRef; title: GenericText | null; description: GenericText | null } |
      { action: "status"; target: GenericRef; status: "open" | "complete" | "archived";
        outcome: GenericText | null; basis: GenericBasis } |
      { action: "claim"; target: GenericRef; basis: GenericBasis } }
  | { kind: "time.advance"; minutes: number | null; basis: GenericBasis }
);
export type GenericPublication = {
  beats: { text: string; requiresOperations: string[] }[];
  visualDescription: { text: string; requiresOperations: string[] } | null;
  sceneLocale: { label: string; requiresOperations: string[] } | null;
};
export const genericStances = ["accept","refuse","hesitate","deflect","leave","attack","offer_conditions"] as const;
export const genericTones = ["neutral","warm","firm","guarded","angry","fearful","tired"] as const;
export type GenericBehavior = { actor: GenericRef; stance: typeof genericStances[number];
  tone: typeof genericTones[number]; intensity: 1 | 2 | 3 };
export type GenericFinal = { publicNarration: GenericPublication | null;
  genericOperations: GenericOperation[]; privatePatches: PrivatePatch[]; publicBehavior: GenericBehavior[] };
export type GenericToolRequest = { operations: GenericOperation[]; call: {
  kind: "query" | "skill" | "attack" | "save" | "damage"; actor: GenericRef | null;
  target: GenericRef | null; item: GenericRef | null; dc: number | null; scope: "current-public" | null } };
export type GenericDecision = { type: "tool"; toolRequest: GenericToolRequest; final: null } |
  { type: "final"; toolRequest: null; final: GenericFinal };
export type GenericManifest = { records: Record<string, { family: string; id: string }>;
  evidence: Record<string, string>; resources: string[]; currencies: string[] };
export function genericProfiles(source:RuntimeSource,manifest:GenericManifest):string[] {
  return Object.entries(manifest.records).filter(([,r])=>r.family==="entities" && source.snapshot.entities.some(e=>e.id===r.id &&
    Number.isInteger(e.max_hp) && Number(e.max_hp)>0 && Number(e.max_hp)<=1000000 &&
    ["attack","skill"].every(k=>Number.isInteger(e.stats[k]) && e.stats[k]>=-20 && e.stats[k]<=20) &&
    Number.isInteger(e.stats.defense) && e.stats.defense>=1 && e.stats.defense<=40 &&
    (e.stats.save===undefined || Number.isInteger(e.stats.save) && e.stats.save>=-20 && e.stats.save<=20)))
    .map(([handle])=>`actor-profile:${handle}`);
}

/** Names are labels, never cross-turn identity keys. Handles bind exact scoped records. */
export function genericManifest(source: RuntimeSource, input: TurnInput): GenericManifest {
  const records: GenericManifest["records"] = {};
  const evidence: Record<string,string> = { "input/current": input.input };
  for (const family of ["entities","locations","items","storages","quests"] as const) {
    source.snapshot[family].forEach((row,index) => {
      if(family==="items" && source.astraSettlementItemPolicies?.some(policy=>policy.itemId===row.id && policy.visibility!=="public"))return;
      const key = family === "entities" && source.runtime.configuration?.controlledEntityIds.includes(row.id)
        ? "hero" : `${family}-${index}`;
      records[key] = {family,id:row.id};
      const publicRow = row as unknown as Record<string,unknown>;
      for (const field of ["name","title","details","description"])
        if (typeof publicRow[field] === "string") evidence[`${key}/${field}`] = publicRow[field];
    });
  }
  const terms=[...new Set(input.input.toLowerCase().match(/[a-z0-9]{3,}/g) ?? [])];
  const scenes=source.snapshot.scenes.map((row,index)=>({row,index,score:terms.filter(term=>`${row.title}\n${row.body}`.toLowerCase().includes(term)).length}));
  const current=scenes.find(v=>v.row.id===source.snapshot.publicState.current_scene_id) ?? scenes.at(-1);
  const continuity=[...(current?[current]:[]),...scenes.filter(v=>v!==current).sort((a,b)=>b.score-a.score || b.index-a.index).slice(0,3)];
  for(const {row,index} of continuity)evidence[`scene-${index}`]=`${row.title}\n${row.body}`;
  source.snapshot.documents.filter(row => row.status === "canon").forEach((row,index) => {
    evidence[`canon-${index}`] = row.body;
  });
  return {records,evidence,resources:[...new Set(source.snapshot.entities.flatMap(row=>Object.keys(row.resources)))],
    currencies:(source.astraSettlementCurrencies ?? []).map(row=>row.resourceKey)};
}

const object = (properties: Record<string,unknown>) => ({ type:"object",additionalProperties:false,
  properties,required:Object.keys(properties) });
const string = (maxLength=200) => ({type:"string",minLength:1,maxLength});
const choice = (values: readonly string[]) => ({type:"string",enum:values.length ? values : ["__none__"]});
const nil = (value: unknown) => ({anyOf:[value,{type:"null"}]});
const array = (items: unknown, maxItems=12) => ({type:"array",items,maxItems});
const integer = (minimum:number,maximum:number) => ({type:"integer",minimum,maximum});
export function genericResponseSchema(source: RuntimeSource,input: TurnInput): Record<string,unknown> {
  const manifest=genericManifest(source,input);
  const ref={$ref:"#/$defs/ref"}, nullableRef=nil(ref), text={$ref:"#/$defs/publicText"};
  const basis={$ref:"#/$defs/basis"}, currency={$ref:"#/$defs/currency"};
  const common={opId:{...string(32),pattern:"^[a-z][a-z0-9_-]{0,31}$"},
    requiresOperations:array(string(32)),atomicGroup:nil(string(32))};
  const operation=(kind:string,fields:Record<string,unknown>)=>object({...common,kind:choice([kind]),...fields});
  const item={anyOf:[object({action:choice(["create"]),name:text,description:nil(text),
    category:choice(["food","supply","misc"]),quantity:integer(1,20),owner:nullableRef,storage:nullableRef,basis}),
    object({action:choice(["update"]),target:ref,name:nil(text),description:nil(text),
      equipment:nil(object({wearer:ref,slot:nil(string(80))}))}),
    object({action:choice(["transfer"]),target:ref,quantity:integer(1,1000000),recipient:nullableRef,storage:nullableRef,basis}),
    object({action:choice(["consume","remove"]),target:ref,quantity:integer(1,1000000),basis})]};
  const resource={anyOf:[object({action:choice(["delta"]),actor:ref,resource:{anyOf:[object({kind:choice(["hp"])}),
    object({kind:choice(["tracked"]),key:choice(manifest.resources)}),object({kind:choice(["currency"]),currency})]},
    amount:integer(-1000000,1000000),payer:nullableRef,basis}),
    object({action:choice(["transfer"]),from:ref,to:ref,currency,amount:integer(1,20),basis})]};
  const reward=nil(object({currency:nil(currency),amount:integer(0,20),item:nil(object({name:text,
    category:choice(["food","supply","misc"]),description:nil(text)}))}));
  const quest={anyOf:[object({action:choice(["create"]),title:text,description:text,issuer:nullableRef,reward,basis}),
    object({action:choice(["update"]),target:ref,title:nil(text),description:nil(text)}),
    object({action:choice(["status"]),target:ref,status:choice(["open","complete","archived"]),outcome:nil(text),basis}),
    object({action:choice(["claim"]),target:ref,basis})]};
  const ops=array({$ref:"#/$defs/operation"});
  const publication=object({beats:array(object({text:string(6000),requiresOperations:array(string(32))})),
    visualDescription:nil(object({text:{type:"string",maxLength:2000},requiresOperations:array(string(32))})),
    sceneLocale:nil(object({label:string(120),requiresOperations:array(string(32))}))});
  return {...object({type:choice(["tool","final"]),toolRequest:nil(object({operations:ops,call:object({
    kind:choice(["query","skill","attack","save","damage"]),actor:nullableRef,target:nullableRef,item:nullableRef,
    dc:nil(integer(1,40)),scope:nil(choice(["current-public"]))})})),final:nil(object({
    publicNarration:nil(publication),genericOperations:ops,
    privatePatches:array(object({kind:choice(["fact","clock","npc","faction","consequence"]),key:string(80),
      operation:choice(["set","advance"]),value:nil({type:"string",maxLength:2000}),amount:nil(integer(0,100))}),6),
    publicBehavior:array(object({actor:ref,stance:choice(genericStances),tone:choice(genericTones),intensity:integer(1,3)}),2)}))}),
    $defs:{ref:{anyOf:[object({source:choice(["known"]),key:choice(Object.keys(manifest.records))}),
      object({source:choice(["local"]),key:string(32)})]},
    publicText:{anyOf:[object({source:choice(["inline"]),text:string(1000)}),
      object({source:choice(["public-evidence"]),evidence:choice(Object.keys(manifest.evidence)),text:string(1000)})]},
    basis:nil(object({source:choice(["tool","rule","public-evidence"]),key:string(120)})),
    currency:object({existing:nil(choice(manifest.currencies)),publicName:nil(text)}),
    operation:{anyOf:[operation("entity.upsert",{target:nullableRef,name:nil(text),description:nil(text),
      profile:nil(choice(genericProfiles(source,manifest))),present:nil({type:"boolean"})}),
      operation("location.upsert",{target:nullableRef,name:nil(text),description:nil(text),
        status:nil(choice(["known","visited"])),makeCurrent:{type:"boolean"}}),
      operation("item.mutate",{mutation:item}),operation("resource.adjust",{mutation:resource}),
      operation("quest.mutate",{mutation:quest}),operation("time.advance",{minutes:nil(integer(0,1440)),basis})]}}};
}

export function parseGenericDecision(value: unknown): GenericDecision {
  requireRule(value !== null && typeof value === "object" && !Array.isArray(value));
  const row=value as Record<string,unknown>;
  requireRule(Object.keys(row).length===3 && ["type","toolRequest","final"].every(key=>Object.hasOwn(row,key)));
  requireRule(row.type==="tool" ? row.final===null && !!row.toolRequest : row.type==="final" && row.toolRequest===null && !!row.final);
  if(row.type==="tool"){
    const request=row.toolRequest as Record<string,unknown>;
    requireRule(typeof request==="object" && Object.keys(request).length===2 && Array.isArray(request.operations) && request.operations.length<=12 &&
      request.call && typeof request.call==="object" && !Array.isArray(request.call));
    const call=request.call as Record<string,unknown>;
    requireRule(Object.keys(call).length===6 && ["kind","actor","target","item","dc","scope"].every(key=>Object.hasOwn(call,key)));
  }else{
    const final=row.final as Record<string,unknown>;
    requireRule(typeof final==="object" && !Array.isArray(final) && Object.keys(final).length===4 &&
      ["publicNarration","genericOperations","privatePatches","publicBehavior"].every(key=>Object.hasOwn(final,key)) &&
      Array.isArray(final.genericOperations) && final.genericOperations.length<=12 && Array.isArray(final.privatePatches) &&
      final.privatePatches.length<=6 && Array.isArray(final.publicBehavior) && final.publicBehavior.length<=2);
  }
  return value as GenericDecision;
}

export const genericInstructions = `Astra is the DM. Structured state is authoritative, not exhaustive. Invent plausible non-contradictory mundane fiction without requiring a record. Only durable consequences use the six generic operation families. Known handles identify exact records; local refs identify earlier creating opIds, never model UUIDs. A narration-only final is normal. Include an independent public beat with no operation dependencies; tag every claimed durable consequence with its required opIds. Use atomicGroup for all reciprocal exchanges, ingredient/output and rest bundles. Current input may accept an offer now. Evidence identifies sources, not semantic proof; basis:null is current bounded DM adjudication. New ordinary NPC stock can be created in the same exchange. For a named-payer currency delta supply payer; Quest claim derives issuer from stored terms; use it for stored job payments and never reclassify a paid job as a new grant. Untracked funds permit bounded mundane grants; tracked funds must debit the real payer and never mint a shortfall. Existing rule/tool authority governs combat, recovery and action costs. time.advance null minutes with rule long-rest or short-rest invokes existing formal rest; rest group supply/recovery changes must exactly match it. Ordinary elapsed minutes need no bespoke rule. Never claim rejected state changes. sceneLocale is a visible room/place label, not a Map Location. In private-informed mode publicNarration is null; public operation text must quote exact public-evidence text, never private prose. Observable publicBehavior contains enums only. Preserve NPC autonomy, quiet scenes, callbacks and free-form play; no default choice menu.`;

export function genericAuthority(source: RuntimeSource,input: TurnInput): JsonObject {
  const manifest=genericManifest(source,input);
  return {stateContract:"generic-v1",handles:Object.entries(manifest.records).map(([handle,record])=>({
    handle,family:record.family,id:record.id,
    label:String((source.snapshot as unknown as Record<string,{id:string;name?:string;title?:string}[]>)[record.family]
      .find(row=>row.id===record.id)?.name ??
      (source.snapshot as unknown as Record<string,{id:string;title?:string}[]>)[record.family].find(row=>row.id===record.id)?.title ?? "")
    })),publicEvidence:manifest.evidence,
    currentWorldMinutes:source.runtime.worldMinutes,locationChangeRequiresTimeAdvance:true,
    profiles:genericProfiles(source,manifest),
    ruleHandles:["long-rest","short-rest"],resources:manifest.resources,currencies:manifest.currencies,
    pinnedPrefix:(source.astraGenericPrefix ?? []) as unknown as JsonObject[]};
}
