import type { TurnInput } from "./contracts.ts";
import type { RuntimeSource } from "./server-contracts.ts";
import type { Scene } from "../persistence/contracts.ts";
import { stableGameplayId } from "./dice.ts";
import { isUuid } from "../persistence/validation.ts";
import { memoryTerms } from "../memory/source-analysis.ts";
import { DmError } from "./dm-errors.ts";

export type SceneContinuityKind = "npc" | "creature" | "place" | "item";
export type SceneContinuitySubject = {
  id: string; kind: SceneContinuityKind; name: string; description: string;
  originSceneId: string; originOperationId: string;
};
export type SceneContinuityV1 = {
  schemaVersion: 1; parentLocationId: string;
  locale: { name: string; description: string } | null;
  subjects: SceneContinuitySubject[];
};
export type SceneContinuityProposal = {
  locale: { name: string; description: string } | null;
  subjects: { subjectRef: string | null; kind: SceneContinuityKind; name: string; description: string }[];
};
export type SceneContinuitySelection = { current: SceneContinuityV1 | null; relevant: SceneContinuityV1[] };

const kinds = ["npc", "creature", "place", "item"];
function object(value: unknown, keys: string[]): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value) ||
    Object.keys(value).length !== keys.length || keys.some((key) => !Object.hasOwn(value, key)))
    throw new DmError("validation");
  return value as Record<string, unknown>;
}
function text(value: unknown, maximum: number, required = true): string {
  if (typeof value !== "string" || value.length > maximum || /[\u0000-\u001f\u007f]/.test(value) ||
    value.startsWith(" ") || value.endsWith(" ") || (required && value.length === 0)) throw new DmError("validation");
  // PostgreSQL btrim(text) removes ASCII spaces. Preserve all other bytes,
  // rather than silently rewriting a proposal before its SQL reconstruction.
  return value;
}
function locale(value: unknown): SceneContinuityV1["locale"] {
  if (value === null) return null;
  const row = object(value, ["name", "description"]);
  return { name: text(row.name, 120), description: text(row.description, 800, false) };
}
const nameKey = (kind: string, name: string) => `${kind}:${name.replace(/[A-Z]/g,(letter)=>letter.toLowerCase())}`;
function size(value: unknown) {
  const json = JSON.stringify(value);
  // jsonb::text adds one ASCII space after structural commas and colons. Count
  // only separators outside strings: punctuation in descriptions is content.
  let separators = 0, quoted = false, escaped = false;
  for (const character of json) {
    if (quoted) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === "\"") quoted = false;
    } else if (character === "\"") quoted = true;
    else if (character === "," || character === ":") separators++;
  }
  if (Buffer.byteLength(json, "utf8") + separators > 12000) throw new DmError("validation");
}

export function sceneContinuitySubjectId(operationId: string, ordinal: number): string {
  if (!isUuid(operationId) || !Number.isInteger(ordinal) || ordinal < 0 || ordinal >= 12)
    throw new DmError("validation");
  return stableGameplayId(operationId, `scene-subject:${ordinal}`);
}

/** Read bounded public history only. A corrected Scene revision invalidates its
 * generated capsule; prose/corrections/Canon are never semantically reinterpreted
 * here. Higher-priority current facts still travel separately in the DM packet. */
export function readSceneContinuity(source: RuntimeSource, scene: Scene): SceneContinuityV1 | null {
  if (scene.campaign_id !== source.snapshot.campaign.id || scene.role !== "narration" || scene.revision !== 1)
    return null;
  const raw = (scene as Scene & { public_continuity?: unknown }).public_continuity;
  if (raw === null || raw === undefined) return null;
  try {
    const row = object(raw, ["schemaVersion", "parentLocationId", "locale", "subjects"]);
    if (row.schemaVersion !== 1 || !isUuid(row.parentLocationId) ||
      !source.snapshot.locations.some((location) => location.campaign_id === scene.campaign_id &&
        location.id === row.parentLocationId && ["known", "visited"].includes(location.status)) ||
      !Array.isArray(row.subjects) || row.subjects.length > 12) return null;
    const seen = new Set<string>();
    const subjects = row.subjects.map((entry) => {
      const subject = object(entry, ["id", "kind", "name", "description", "originSceneId", "originOperationId"]);
      if (!isUuid(subject.id) || seen.has(subject.id) || !isUuid(subject.originSceneId) ||
        !isUuid(subject.originOperationId) || !kinds.includes(String(subject.kind)) ||
        !Array.from({ length: 12 }, (_, ordinal) => sceneContinuitySubjectId(String(subject.originOperationId), ordinal))
          .includes(subject.id))
        throw new DmError("validation");
      seen.add(subject.id);
      return { id: subject.id, kind: subject.kind as SceneContinuityKind, name: text(subject.name, 100),
        description: text(subject.description, 600, false), originSceneId: subject.originSceneId,
        originOperationId: subject.originOperationId };
    });
    const capsule: SceneContinuityV1 = { schemaVersion: 1, parentLocationId: row.parentLocationId,
      locale: locale(row.locale), subjects };
    size(capsule);
    return capsule;
  } catch { return null; }
}

/** This is a bounded lexical recall hint, not a semantic relevance classifier.
 * Historical matches do not imply that a person is currently present. */
export function selectSceneContinuity(source: RuntimeSource, input: TurnInput): SceneContinuitySelection {
  if (source.snapshot.campaign.id !== input.campaignId || source.runtime.campaignId !== input.campaignId)
    throw new DmError("validation");
  const rows = source.snapshot.scenes.flatMap((scene) => {
    const continuity = readSceneContinuity(source, scene);
    return continuity ? [{ scene, continuity }] : [];
  });
  const currentRow = rows.find((row) => row.scene.id === source.snapshot.publicState.current_scene_id &&
    row.continuity.parentLocationId === source.snapshot.publicState.current_location_id);
  const terms = new Set(memoryTerms(input.input));
  const overlap = (value: string) => memoryTerms(value).filter((term) => terms.has(term)).length;
  const relevant = rows.filter((row) => row !== currentRow).map((row) => ({ ...row,
    score: (row.continuity.locale ? overlap(row.continuity.locale.name) * 3 + overlap(row.continuity.locale.description) : 0) +
      row.continuity.subjects.reduce((sum, subject) => sum + overlap(subject.name) * 3 + overlap(subject.description), 0),
  })).filter((row) => row.score > 0).sort((left, right) =>
    right.score - left.score || right.scene.sequence - left.scene.sequence || left.scene.id.localeCompare(right.scene.id));
  const fingerprints = new Set<string>(currentRow ? [JSON.stringify(currentRow.continuity)] : []);
  const selected: SceneContinuityV1[] = [];
  for (const row of relevant) {
    const key = JSON.stringify(row.continuity);
    if (fingerprints.has(key)) continue;
    fingerprints.add(key); selected.push(row.continuity);
    if (selected.length === 3) break;
  }
  return { current: currentRow?.continuity ?? null, relevant: selected };
}

export function selectedContinuitySubjects(source: RuntimeSource, input: TurnInput): SceneContinuitySubject[] {
  const selection = selectSceneContinuity(source, input);
  const selected = new Map<string, SceneContinuitySubject>();
  for (const subject of [...(selection.current?.subjects ?? []), ...selection.relevant.flatMap((row) => row.subjects)])
    if (!selected.has(subject.id)) selected.set(subject.id, subject);
  return [...selected.values()];
}

/** Final raw proposal is pinned first. The existing commit generates the actual
 * narration Scene ID; SQL then resolves this public capsule in that same atomic
 * transaction. A capsule never changes the authoritative tracked Location. */
export function buildSceneContinuity(source: RuntimeSource, input: TurnInput, value: unknown,
  originSceneId: string): SceneContinuityV1 {
  if (!isUuid(originSceneId) || !isUuid(input.operationId)) throw new DmError("validation");
  const parent = source.snapshot.publicState.current_location_id;
  if (!parent || !source.snapshot.locations.some((row) => row.id === parent &&
    row.campaign_id === input.campaignId && ["known", "visited"].includes(row.status))) throw new DmError("validation");
  const row = object(value, ["locale", "subjects"]);
  if (!Array.isArray(row.subjects) || row.subjects.length > 12) throw new DmError("validation");
  const known = selectedContinuitySubjects(source, input);
  const nextLocale = locale(row.locale);
  // A missing reference may reuse a unique local name, but cannot identify
  // same-named people from other towns/rooms. Explicit selected subjectRef is
  // the only cross-locale continuity assertion; history never implies presence.
  // This identity lookup reads valid public originals, independently of the
  // bounded context recall selection; it never adds those originals to context.
  const localSubjects = new Map<string, SceneContinuitySubject>();
  const historical = source.snapshot.scenes.map((scene) => ({scene,capsule:readSceneContinuity(source,scene)}))
    .sort((left,right) => Number(right.scene.id === source.snapshot.publicState.current_scene_id) -
      Number(left.scene.id === source.snapshot.publicState.current_scene_id) || right.scene.sequence-left.scene.sequence);
  for (const {capsule} of historical) if (capsule && capsule.parentLocationId === parent &&
      (capsule.locale === null ? nextLocale === null : nextLocale !== null &&
        nameKey("locale", capsule.locale.name) === nameKey("locale", nextLocale.name)))
    for (const subject of capsule.subjects) if (!localSubjects.has(subject.id)) localSubjects.set(subject.id,subject);
  const seen = new Set<string>();
  const subjects = row.subjects.map((entry, ordinal) => {
    const draft = object(entry, ["subjectRef", "kind", "name", "description"]);
    const name = text(draft.name, 100), description = text(draft.description, 600, false);
    if (!kinds.includes(String(draft.kind)) || (draft.subjectRef !== null && !isUuid(draft.subjectRef)))
      throw new DmError("validation");
    const matches = draft.subjectRef === null ? [...localSubjects.values()].filter((subject) =>
      nameKey(subject.kind, subject.name) === nameKey(String(draft.kind), name)) :
      known.filter((subject) => subject.id === draft.subjectRef);
    if (matches.length > 1 || (draft.subjectRef !== null && matches.length !== 1)) throw new DmError("validation");
    const existing = matches[0];
    if (existing && (existing.kind !== draft.kind || (draft.subjectRef === null && existing.name !== name)))
      throw new DmError("validation");
    // A public introduction may refine an explicit subject's label without
    // changing its identity/provenance or renaming a standard Entity record.
    const subject: SceneContinuitySubject = existing ? { ...existing, name, description } : {
      id: sceneContinuitySubjectId(input.operationId, ordinal), kind: draft.kind as SceneContinuityKind,
      name, description, originSceneId, originOperationId: input.operationId };
    if (seen.has(subject.id)) throw new DmError("validation");
    seen.add(subject.id);
    return subject;
  });
  const result: SceneContinuityV1 = { schemaVersion: 1, parentLocationId: parent,
    locale: nextLocale, subjects };
  size(result);
  return result;
}
