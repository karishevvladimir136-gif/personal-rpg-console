import type { RuntimeSource } from "./server-contracts.ts";
import type { TurnInput } from "./contracts.ts";
import { selectSceneContinuity } from "./astra-natural-continuity.ts";

const object = (properties: Record<string, unknown>) => ({ type: "object",
  additionalProperties: false, properties, required: Object.keys(properties) });
const choice = (values: string[]) => ({type:"string",enum:values});
const text = (maxLength: number) => ({type:"string",minLength:1,maxLength});
const metadataPattern="^[^\\u0000-\\u0020\\u007f](?:[^\\u0000-\\u001f\\u007f]*[^\\u0000-\\u0020\\u007f])?$";
const metadata=(maxLength:number,empty=false)=>({type:"string",minLength:empty?0:1,maxLength,
  pattern:empty ? `(?:${metadataPattern})|^$` : metadataPattern});
export const naturalContinuitySchema = object({
  locale: { anyOf: [object({name:metadata(120),description:metadata(800,true)}),{type:"null"}] },
  subjects: {type:"array",maxItems:12,items:object({
    subjectRef:{type:["string","null"],maxLength:120},
    kind:choice(["npc","creature","place","item"]),name:metadata(100),description:metadata(600,true),
  })},
});
export const naturalBehaviorSchema = {type:"array",maxItems:2,items:object({
  actorId:text(120),stance:choice(["accept","refuse","hesitate","deflect","leave","attack","offer_conditions"]),
  tone:choice(["neutral","warm","firm","guarded","angry","fearful","tired"]),
  intensity:{type:"integer",enum:[1,2,3]},
})};
export const naturalMaterializationsSchema = {type:"array",maxItems:3,items:object({
  subjectRef:text(120),kind:choice(["npc","creature","place","item"]),
  purpose:choice(["job","trade","inventory","combat","party","track","recurring"]),
  ownerRef:{type:["string","null"],maxLength:120},
})};

export const naturalPlayInstructions = `Ephemeral public continuity is a bounded scene snapshot: repeat the current locale and relevant subjects to retain them, using their supplied subjectRef; clear subjects that are no longer present. A locale is a building/room within the tracked parent Location, not travel to another Location. Do not create durable records merely for speaking, naming, offering or declining. Materialize a mundane public subject only for an actual accepted durable consequence, combat, party membership or explicit tracking. Use its supplied subjectRef or input:<exact literal public name> from this player's input. Return at most three materializations; no model IDs, stats, wealth or mechanics. ownerRef is null except a trade Item's actual present merchant reference. Use that reference in tool/effect identity fields; the server resolves it. No legendary/magical power or fabricated past debt can be created this way. A new merchant has no funds; existing authoritative funds must pay any sale. Keep encounter.start/end in a separate mechanic_actions effect; compose other mechanics as separate ordered effects. In a unified final, publicNarration.independentBeat must be nonempty understandable dialogue/fiction without a durable success assertion. Keep independentBeat fiction-only. Put validated base/tool outcomes and mandatory inventory or tracking materialization success in separate beats with requiresEffects:[]; whole-final validation gates these. Assertions depending on optional ordered effects must list their original exact effect indexes. Do not claim rejected consequences. behavior contains only actorId/stance/tone/intensity, never secret reasons; private-informed publication is authored separately from strictly public context.`;

/** Subject aliases expand authoring references only. Parsing resolves them to
 * independently reconstructed records before the existing authority checks. */
export function naturalReferenceSchema(source: RuntimeSource, input: TurnInput,
  original: Record<string, unknown>): Record<string, unknown> {
  const selected = selectSceneContinuity(source,input);
  const refs = [...new Set([selected.current,...selected.relevant].flatMap((capsule) =>
    capsule?.subjects.map((subject)=>subject.id) ?? []))];
  return {anyOf:[original,
    ...(refs.length ? [choice(refs)] : []),
    {type:"string",pattern:"^input:.+",minLength:7,maxLength:120}]};
}

export function naturalizeReferenceSelections(schema: Record<string, unknown>,
  source: RuntimeSource, input: TurnInput): Record<string, unknown> {
  const identity = /^(id|actorId|targetId|issuerId|sellerId|buyerId|sourceEntityId|recipientId|entityId|itemId|giveItemId|receiveItemId|locationId|destinationEntityId)$/;
  const visit=(value: unknown): unknown => {
    if(Array.isArray(value))return value.map(visit);
    if(!value || typeof value!=="object")return value;
    const row=value as Record<string,unknown>;
    return Object.fromEntries(Object.entries(row).map(([key,child])=> {
      if(key==="properties" && child && typeof child==="object")return [key,
        Object.fromEntries(Object.entries(child).map(([name,selection])=>[name,
          identity.test(name) ? naturalReferenceSchema(source,input,visit(selection) as Record<string,unknown>) : visit(selection)]))];
      return [key,visit(child)];
    }));
  };
  return visit(schema) as Record<string,unknown>;
}

/** Replace only typed identity slots, never public prose or private patch text. */
export function resolveNaturalReferences<T>(value:T, aliases:Map<string,string>):T {
  const one=(entry: unknown,key: string): unknown => {
    if(typeof entry==="string" && (key==="id" || key.endsWith("Id")))return aliases.get(entry) ?? entry;
    if(Array.isArray(entry))return entry.map((child)=>typeof child==="string" && key.endsWith("Ids")
      ? aliases.get(child) ?? child : one(child,""));
    if(entry && typeof entry==="object")return Object.fromEntries(
      Object.entries(entry).map(([name,child])=>[name,one(child,name)]));
    return entry;
  };
  return one(value,"") as T;
}
