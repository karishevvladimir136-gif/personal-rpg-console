import type { MemorySource, MemorySourceRef } from "../memory/server-contracts.ts";
import type { TurnInput } from "./contracts.ts";
import type { PrivatePatch, RuntimeSource } from "./server-contracts.ts";
import { DmError } from "./dm-errors.ts";
import { isUuid } from "../persistence/validation.ts";

// A compact, server-private value in dm_state.contents.npc.character_<actor UUID>.
// This is interpretation and fictional state, never Canon or positive knowledge.
export type CharacterEvidence = Pick<MemorySourceRef, "kind" | "id" | "version" | "part" | "visibility">;
export type CharacterModel = {
  schemaVersion: 1;
  actorId: string;
  // Ordinary mutations cite the exact committed turn; owner establishment is null.
  basisOperationId: string | null;
  identity: {
    values: string[];
    wants: string[];
    boundaries: string[];
    loyalties: string[];
    signatures: string[];
    observableVoice: string;
  };
  current: {
    goal: string | null;
    stress: "settled" | "strained" | "acute";
    preoccupation: string | null;
    obligation: string | null;
  };
  beliefs: { text: string; confidence: "tentative" | "supported"; aboutActorId: string | null; evidence: CharacterEvidence }[];
  relationships: { actorId: string; affection: "distant" | "open" | "close"; trust: "low" | "guarded" | "earned"; respect: "low" | "mixed" | "high"; unresolvedHurt: string | null; evidence: CharacterEvidence }[];
  episodes: { evidence: CharacterEvidence; meaning: string; cue: string | null }[];
};

const ID_PREFIX = "character_";
const MAX_VALUE_BYTES = 2000; // The existing private-patch SQL limit remains intact.
const MAX_PACKET_BYTES = 6200;
const MAX_ACTORS = 2;

function object(value: unknown, keys: string[]): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value) ||
      Object.keys(value).length !== keys.length || keys.some((key) => !Object.hasOwn(value, key)))
    throw new DmError("validation");
  return value as Record<string, unknown>;
}
function short(value: unknown, max = 120): string {
  if (typeof value !== "string" || !value.trim() || value.length > max || value.includes("\0"))
    throw new DmError("validation");
  return value;
}
function maybe(value: unknown, max = 120): string | null {
  return value === null ? null : short(value, max);
}
function words(value: unknown, max: number): string[] {
  if (!Array.isArray(value) || value.length > max || value.some((item) => typeof item !== "string"))
    throw new DmError("validation");
  return value.map((entry) => short(entry, 120));
}
function choice<T extends string>(value: unknown, choices: readonly T[]): T {
  if (typeof value !== "string" || !choices.includes(value as T)) throw new DmError("validation");
  return value as T;
}
function evidence(value: unknown): CharacterEvidence {
  const v = object(value, ["kind", "id", "version", "part", "visibility"]);
  const kind = choice(v.kind, ["scene", "event", "private_event"] as const);
  if (!isUuid(v.id) || !Number.isSafeInteger(v.part) || (v.part as number) < 0 || (v.part as number) > 20)
    throw new DmError("validation");
  return { kind, id: v.id, version: short(v.version, 80), part: v.part as number,
    visibility: choice(v.visibility, ["public", "private"] as const) };
}

export function parseCharacterModel(value: unknown): CharacterModel {
  const v = object(value, ["schemaVersion", "actorId", "basisOperationId", "identity", "current", "beliefs", "relationships", "episodes"]);
  if (v.schemaVersion !== 1 || !isUuid(v.actorId) || (v.basisOperationId !== null && !isUuid(v.basisOperationId))) throw new DmError("validation");
  const i = object(v.identity, ["values", "wants", "boundaries", "loyalties", "signatures", "observableVoice"]);
  const current = object(v.current, ["goal", "stress", "preoccupation", "obligation"]);
  if (!Array.isArray(v.beliefs) || v.beliefs.length > 3 || !Array.isArray(v.relationships) || v.relationships.length > 2 ||
      !Array.isArray(v.episodes) || v.episodes.length > 3) throw new DmError("validation");
  const model: CharacterModel = {
    schemaVersion: 1,
    actorId: v.actorId,
    basisOperationId: v.basisOperationId as string | null,
    identity: { values: words(i.values, 3), wants: words(i.wants, 2), boundaries: words(i.boundaries, 2),
      loyalties: words(i.loyalties, 2), signatures: words(i.signatures, 3), observableVoice: short(i.observableVoice, 180) },
    current: { goal: maybe(current.goal), stress: choice(current.stress, ["settled", "strained", "acute"] as const),
      preoccupation: maybe(current.preoccupation), obligation: maybe(current.obligation) },
    beliefs: v.beliefs.map((entry) => {
      const b = object(entry, ["text", "confidence", "aboutActorId", "evidence"]);
      if (b.aboutActorId !== null && !isUuid(b.aboutActorId)) throw new DmError("validation");
      return { text: short(b.text, 160), confidence: choice(b.confidence, ["tentative", "supported"] as const),
        aboutActorId: b.aboutActorId as string | null, evidence: evidence(b.evidence) };
    }),
    relationships: v.relationships.map((entry) => {
      const r = object(entry, ["actorId", "affection", "trust", "respect", "unresolvedHurt", "evidence"]);
      if (!isUuid(r.actorId) || r.actorId === v.actorId) throw new DmError("validation");
      return { actorId: r.actorId, affection: choice(r.affection, ["distant", "open", "close"] as const),
        trust: choice(r.trust, ["low", "guarded", "earned"] as const), respect: choice(r.respect, ["low", "mixed", "high"] as const),
        unresolvedHurt: maybe(r.unresolvedHurt, 120), evidence: evidence(r.evidence) };
    }),
    episodes: v.episodes.map((entry) => {
      const e = object(entry, ["evidence", "meaning", "cue"]);
      return { evidence: evidence(e.evidence), meaning: short(e.meaning, 160), cue: maybe(e.cue, 80) };
    }),
  };
  if (new Set(model.relationships.map((r) => r.actorId)).size !== model.relationships.length ||
      Buffer.byteLength(JSON.stringify(model), "utf8") > MAX_VALUE_BYTES) throw new DmError("validation");
  return model;
}

function storedModel(source: RuntimeSource, actorId: string): CharacterModel | null {
  const bucket = source.privateState.npc;
  if (!bucket || typeof bucket !== "object" || Array.isArray(bucket)) return null;
  const raw = bucket[`${ID_PREFIX}${actorId}`];
  if (raw === undefined) return null;
  if (typeof raw !== "string") throw new DmError("context");
  try {
    const model = parseCharacterModel(JSON.parse(raw));
    if (model.actorId !== actorId) throw new DmError("context");
    return model;
  } catch { throw new DmError("context"); }
}

function sameEvidence(a: CharacterEvidence, source: MemorySource) {
  const b = source.ref;
  return a.kind === b.kind && a.id === b.id && a.version === b.version && a.part === b.part && a.visibility === b.visibility;
}
function authorizedEvidence(source: RuntimeSource, actorId: string, ref: CharacterEvidence): boolean {
  const memory = source.memory;
  if (!memory || memory.campaignId !== source.snapshot.campaign.id || !memory.complete) return false;
  return [...memory.exactEvents, ...memory.historical, ...memory.privateHistorical].some((row) =>
    row.campaignId === memory.campaignId && row.current && row.status === "valid" && row.knownBy.includes(actorId) && sameEvidence(ref, row));
}

export function validateCharacterPatches(source: RuntimeSource, input: TurnInput, patches: PrivatePatch[]) {
  for (const patch of patches) {
    if (patch.kind !== "npc" || !patch.key.startsWith(ID_PREFIX)) continue;
    const actorId = patch.key.slice(ID_PREFIX.length);
    if (!isUuid(actorId) || patch.operation !== "set" || typeof patch.value !== "string" || patch.amount !== null ||
        input.mode === "mechanic" || input.mode === "feedback" || input.mode === "ooc") throw new DmError("validation");
    const actor = source.snapshot.entities.find((row) => row.id === actorId && row.campaign_id === input.campaignId);
    if (!actor || !["npc", "companion"].includes(actor.kind) || source.runtime.configuration?.controlledEntityIds.includes(actorId))
      throw new DmError("validation");
    if (input.mode === "companion" ? actorId !== input.companionId :
      !source.runtime.configuration?.presentEntityIds.includes(actorId)) throw new DmError("validation");
    const old = storedModel(source, actorId);
    if (!old) throw new DmError("validation"); // Only explicit owner correction establishes identity.
    let next: CharacterModel;
    try { next = parseCharacterModel(JSON.parse(patch.value)); } catch { throw new DmError("validation"); }
    if (next.actorId !== actorId || next.basisOperationId !== input.operationId ||
        JSON.stringify(old.identity) !== JSON.stringify(next.identity) ||
        [...next.beliefs.map((v) => v.evidence), ...next.relationships.map((v) => v.evidence), ...next.episodes.map((v) => v.evidence)]
          .some((ref) => !authorizedEvidence(source, actorId, ref)) ||
        [...next.beliefs.map((v) => v.aboutActorId), ...next.relationships.map((v) => v.actorId)]
          .some((id) => id !== null && !source.snapshot.entities.some((row) => row.id === id && row.campaign_id === input.campaignId)))
      throw new DmError("validation");
  }
}

export function privateStateWithoutCharacterModels(source: RuntimeSource) {
  const npc = source.privateState.npc;
  if (!npc || typeof npc !== "object" || Array.isArray(npc)) return source.privateState;
  return { ...source.privateState, npc: Object.fromEntries(Object.entries(npc).filter(([key]) => !key.startsWith(ID_PREFIX))) };
}

export function characterPacket(source: RuntimeSource, input: TurnInput, audience: "narrate"): { actorId: string; observableVoice: string }[];
export function characterPacket(source: RuntimeSource, input: TurnInput, audience: "plan"): {
  actorId: string; identity: CharacterModel["identity"]; current: CharacterModel["current"];
  beliefs: CharacterModel["beliefs"]; relationships: CharacterModel["relationships"]; episodes: CharacterModel["episodes"];
}[];
export function characterPacket(source: RuntimeSource, input: TurnInput, audience: "plan" | "narrate") {
  const controlled = new Set(source.runtime.configuration?.controlledEntityIds ?? []);
  const present = new Set(source.runtime.configuration?.presentEntityIds ?? []);
  const referencedAt = (name: string) => {
    const text = input.input.toLocaleLowerCase();
    const needle = name.toLocaleLowerCase();
    let at = text.indexOf(needle);
    while (at >= 0) {
      const before = at ? text[at - 1] : "";
      const after = text[at + needle.length] ?? "";
      if ((!before || !/[\p{L}\p{N}]/u.test(before)) && (!after || !/[\p{L}\p{N}]/u.test(after))) return at;
      at = text.indexOf(needle, at + needle.length);
    }
    return -1;
  };
  // Eligibility, an existing valid model, and relevance are resolved before
  // the bounded context cap. Entity insertion order must not hide the person
  // the player actually addressed.
  const candidates = source.snapshot.entities.flatMap((actor) => {
    if (actor.campaign_id !== input.campaignId || !["npc", "companion"].includes(actor.kind) || controlled.has(actor.id)) return [];
    const mention = input.mode === "companion" ? -1 : referencedAt(actor.name);
    const inScene = present.has(actor.id);
    if (input.mode === "companion" ? actor.id !== input.companionId : !inScene && (audience === "narrate" || mention < 0)) return [];
    const model = storedModel(source, actor.id);
    return model ? [{ actor, model, mention, inScene }] : [];
  }).sort((a, b) =>
    (audience === "plan" && input.mode !== "companion" ? Number(b.mention >= 0) - Number(a.mention >= 0) : 0) ||
    (a.mention >= 0 && b.mention >= 0 ? a.mention - b.mention : 0) ||
    Number(b.inScene) - Number(a.inScene) || a.actor.id.localeCompare(b.actor.id));
  const rows = [];
  for (const { actor, model } of candidates.slice(0, MAX_ACTORS)) {
    if (audience === "narrate") {
      rows.push({ actorId: actor.id, observableVoice: model.identity.observableVoice });
      continue;
    }
    const filter = <T extends { evidence: CharacterEvidence }>(items: T[]) => items.filter((item) => authorizedEvidence(source, actor.id, item.evidence));
    rows.push({ actorId: actor.id, identity: model.identity, current: model.current,
      beliefs: filter(model.beliefs), relationships: filter(model.relationships), episodes: filter(model.episodes) });
  }
  if (Buffer.byteLength(JSON.stringify(rows), "utf8") > MAX_PACKET_BYTES) throw new DmError("context");
  return rows;
}
