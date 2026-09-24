import type { RuntimeSource } from "../gameplay/server-contracts.ts";
import type { TurnInput } from "../gameplay/contracts.ts";
import type { TeachingCandidate } from "./contracts.ts";
import { teachingCandidateSchema, validates } from "../gameplay/dm-schema.ts";
import { DmError } from "../gameplay/dm-errors.ts";

const globalIntent = /\b(?:all|any|every) campaigns?\b|\bglobally\b|\bglobal dm craft\b|во всех кампаниях|для всех кампаний|глобальн/iu;
const uuid = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/iu;
const opaque = /\b[A-Z][A-Z0-9_]{4,}\b/u;

function privateWords(value: unknown, output: Set<string>, depth = 0): void {
  if (depth > 5 || output.size > 500) return;
  if (typeof value === "string") {
    for (const word of value.match(/[\p{L}\p{N}_-]{5,}/gu) ?? [])
      output.add(word.toLocaleLowerCase());
  } else if (Array.isArray(value)) {
    for (const entry of value) privateWords(entry, output, depth + 1);
  } else if (value && typeof value === "object") {
    for (const entry of Object.values(value)) privateWords(entry, output, depth + 1);
  }
}

/** Candidate text is data. A private or campaign-specific global draft fails closed. */
export function validateTeachingCandidate(
  source: RuntimeSource,
  input: TurnInput,
  value: unknown,
): TeachingCandidate | null {
  if (value === undefined || value === null) return null; // Old saved feedback remains readable.
  if (input.mode !== "feedback" || !validates(teachingCandidateSchema, value))
    throw new DmError("validation");
  const candidate = value as TeachingCandidate;
  if (candidate.kind === "campaign_style") {
    const changed = Object.values(candidate.styleDelta).filter((entry) => entry !== null).length;
    if (changed < 1 || changed > 3) throw new DmError("validation");
    return candidate;
  }
  const entry = candidate.entry;
  if (!globalIntent.test(input.input) || !entry.stages.length ||
    new Set(entry.stages).size !== entry.stages.length ||
    new Set(entry.triggers).size !== entry.triggers.length)
    throw new DmError("validation");
  const text = [entry.category, ...entry.triggers,
    ...Object.values(entry.en), ...Object.values(entry.ru)].join(" ");
  if (uuid.test(text) || opaque.test(text)) throw new DmError("validation");
  const lower = text.toLocaleLowerCase();
  const names = [source.snapshot.campaign.title,
    ...source.snapshot.entities.map((row) => row.name),
    ...source.snapshot.locations.map((row) => row.name),
    ...source.snapshot.quests.map((row) => row.title),
    ...source.snapshot.documents.map((row) => row.title)];
  if (names.some((name) => name.length >= 3 && lower.includes(name.toLocaleLowerCase())))
    throw new DmError("validation");
  const secret = new Set<string>();
  privateWords(source.privateState, secret);
  if ([...secret].some((word) => lower.includes(word))) throw new DmError("validation");
  return candidate;
}
