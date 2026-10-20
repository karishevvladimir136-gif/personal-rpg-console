// Fix run after session 2, B1 (key finding 2, items 82, 84): the campaign's hidden layer. Campaign creation forbade a
// hidden explanation and nothing gave the DM one, so a strong improviser told an honest, mundane story with no mystery.
// Before the first session (and once for an existing campaign that has none) a private call — the DM's prep — writes
// the bigger truth behind the first case, the factions' hidden aims, 5–10 secrets not tied to places, two or three
// clocks and one wondrous thread into the private notes under a reserved key the budgets never drop. Grounded in the
// world, the canon, the owner's own «Тайны» and what has happened in play; never shown to the player (the owner sees it
// only after opting in). The session digest keeps it current. This module is the pure part: the request, the parse.
import type { TurnInput } from "../contracts.ts";
import type { RuntimeSource } from "../server-contracts.ts";
import type { DmEffort } from "../../model-runtime/dm-models.ts";
import type { DmMessage, DmSystemBlock } from "../../server/dm/model/contracts.ts";
import { buildDmLoopContext, estimateTokens } from "./context.ts";
import { HIDDEN_LAYER_KEY, ownerSecretsText } from "./private-notes.ts";

export { HIDDEN_LAYER_KEY, hiddenLayerOf, ownerSecretsText } from "./private-notes.ts";
export const HIDDEN_LAYER_MAX_CHARS = 6000;

const PREP_INSTRUCTIONS = `Your private prep before the next session. This campaign has no hidden layer yet: write it now. It is your private truth of the campaign — the player never sees it. Ground it in the world, the canon, the owner's secrets (when given: build on them, never contradict them) and everything that has happened in play (never contradict an established fact or a person's model). Answer with one JSON object and nothing else, every text in the campaign language:
{
  "truth": "the bigger truth behind the visible case — what is really going on, who is behind it and why; 3–6 sentences. Larger than the case; no single person knows all of it",
  "factions": [ { "name": "a faction or power already in the world or implied by it", "hiddenAim": "what it really wants and is doing about it" } ],
  "secrets": [ "5–10 secrets not tied to a place: each a fact the hero can learn from people, documents or signs, wherever they go" ],
  "clocks": [ { "key": "lowercase_key", "label": "what is advancing off screen", "segments": 6, "trigger": "what lands when it fills" } ],
  "wonder": { "thing": "magic with a history the hero can meet — an item with a strange sign, a ritual mark, a cipher, an old seal where it should not be", "history": "where it really comes from", "question": "the open question it leaves" },
  "clues": [ "three clues to the truth, each in a different place or person, ready for the next sessions" ]
}
Two to five factions, two or three clocks (4–8 segments each). Mystery and wonder: the clues point at the truth from several sides, each answer opens a deeper question, and the wonder is magic with a past, not an unexplainable effect.`;

/** The prep request: the cached layers a turn uses (how to DM, the world, the history, the dossier) without «now»,
 * the owner's secrets, and the instructions. */
export function buildPrepRequest(source: RuntimeSource, effort: DmEffort): { system: DmSystemBlock[]; messages: DmMessage[]; effort: DmEffort; tokens: number } {
  const input: TurnInput = { operationId: "00000000-0000-4000-8000-000000000000", campaignId: source.snapshot.campaign.id,
    timeline: source.snapshot.timeline ?? source.runtime.timeline, expectedRevision: source.runtime.revision, mode: "game",
    input: "", companionId: null, listenerIds: [], mechanic: null };
  const context = buildDmLoopContext(source, input);
  const owner = ownerSecretsText(source);
  const system: DmSystemBlock[] = [...context.system.slice(0, -1),
    { text: owner ? `The owner's own secrets for this campaign (DM-only; the highest authority after the owner's corrections):\n${owner}` : "The owner wrote no secrets of his own: the hidden layer is yours.", cache: false }];
  const messages: DmMessage[] = [{ role: "user", text: PREP_INSTRUCTIONS }];
  return { system, messages, effort, tokens: system.reduce((sum, block) => sum + estimateTokens(block.text), 0) + estimateTokens(PREP_INSTRUCTIONS) };
}

export type HiddenLayerPrep = { text: string; clocks: { key: string; label: string; segments: number; trigger: string }[] };

/** The model's JSON as the layer's text (bounded) and its clocks; null when it cannot be read. */
export function parsePrep(raw: string, language: "ru" | "en"): HiddenLayerPrep | null {
  const start = raw.indexOf("{"), end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  let value: Record<string, unknown>;
  try { value = JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>; } catch { return null; }
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
  const list = (v: unknown) => (Array.isArray(v) ? v : []);
  const truth = str(value.truth, 1500);
  if (!truth) return null;
  const factions = list(value.factions).slice(0, 5).map((row) => ({ name: str((row as Record<string, unknown>)?.name, 120), aim: str((row as Record<string, unknown>)?.hiddenAim, 400) }))
    .filter((row) => row.name && row.aim);
  const secrets = list(value.secrets).slice(0, 10).map((row) => str(row, 400)).filter(Boolean);
  const clocks = list(value.clocks).slice(0, 3).map((row) => {
    const r = row as Record<string, unknown>;
    const key = str(r?.key, 60).toLowerCase().replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
    const segments = Math.min(8, Math.max(4, Math.round(Number(r?.segments) || 6)));
    return { key: key ? `clock_${key}`.slice(0, 80) : "", label: str(r?.label, 200), segments, trigger: str(r?.trigger, 300) };
  }).filter((row) => row.key && row.label);
  const wonder = value.wonder && typeof value.wonder === "object" ? value.wonder as Record<string, unknown> : {};
  const clues = list(value.clues).slice(0, 6).map((row) => str(row, 300)).filter(Boolean);
  const sentence = (text: string) => (/[.!?…»]$/.test(text) ? text : `${text}.`);
  const ru = language === "ru";
  const lines = [
    ru ? "Тайный слой кампании (подготовка ведущего; игрок этого не видит; правда открывается по уликам, никто не объясняет её целиком):"
      : "The campaign's hidden layer (the DM's prep; the player never sees it; the truth comes out through clues, nobody explains all of it):",
    `${ru ? "Правда" : "The truth"}: ${truth}`,
    factions.length ? `${ru ? "Фракции и их скрытые цели" : "Factions and their hidden aims"}:\n${factions.map((row) => `- ${row.name}: ${row.aim}`).join("\n")}` : "",
    secrets.length ? `${ru ? "Тайны (не привязаны к месту)" : "Secrets (not tied to a place)"}:\n${secrets.map((row) => `- ${row}`).join("\n")}` : "",
    clocks.length ? `${ru ? "Часы" : "Clocks"}:\n${clocks.map((row) => `- ${row.key}: ${row.label} (${ru ? "делений" : "segments"} ${row.segments}; ${ru ? "когда заполнятся" : "when full"}: ${row.trigger || "—"})`).join("\n")}` : "",
    str(wonder.thing, 300) ? `${ru ? "Чудо" : "The wonder"}: ${sentence(str(wonder.thing, 300))} ${ru ? "История" : "Its history"}: ${sentence(str(wonder.history, 500))} ${ru ? "Открытый вопрос" : "The open question"}: ${str(wonder.question, 300)}` : "",
    clues.length ? `${ru ? "Улики к правде" : "Clues to the truth"}:\n${clues.map((row) => `- ${row}`).join("\n")}` : "",
  ].filter(Boolean);
  let text = lines.join("\n");
  if (text.length > HIDDEN_LAYER_MAX_CHARS) text = `${text.slice(0, HIDDEN_LAYER_MAX_CHARS - 1)}…`;
  return { text, clocks };
}

/** The private-notes writes of a prep: the layer under its reserved key; each clock at 0 with its description beside it. */
export function prepWrites(prep: HiddenLayerPrep, existing: Pick<RuntimeSource, "privateState">): { kind: "fact" | "clock"; key: string; value: string }[] {
  const clocks = existing.privateState.clock;
  const has = (key: string) => !!clocks && typeof clocks === "object" && !Array.isArray(clocks) && key in clocks;
  return [{ kind: "fact", key: HIDDEN_LAYER_KEY, value: prep.text },
    ...prep.clocks.filter((clock) => !has(clock.key)).flatMap((clock) => [
      { kind: "clock" as const, key: clock.key, value: "0" },
      { kind: "fact" as const, key: clock.key, value: `${clock.label} — ${clock.segments}; ${clock.trigger}`.slice(0, 600) }])];
}
