// Between sessions (plan §10.1, §10.2; stage task §4): one call of the
// campaign's main model digests the closed session — advances the off-screen
// plans for the game time that passed (never for real-world absence), notes
// what engaged the player, prepares two or three situations (not plot), marks
// ripe seeds — and writes «Ранее в…» in the DM's voice plus a chapter title.
// Output: the private DM notebook and plan notes, the session's recap and
// title, optionally the player-likes note. Runs in the background; play never
// waits. No agent: a request built from the same dossier a turn sees.
import type { RuntimeSource } from "../server-contracts.ts";
import type { TurnInput } from "../contracts.ts";
import type { DmMessage, DmModel, DmSystemBlock } from "../../server/dm/model/contracts.ts";
import type { DmEffort } from "../../model-runtime/dm-models.ts";
import { buildDmLoopContext, estimateTokens, worldDay } from "./context.ts";
import { allPlans, serializePlan, type OffScreenPlan } from "./plans.ts";
import { hiddenLayerOf, privateNotes } from "./private-notes.ts";
import { HIDDEN_LAYER_MAX_CHARS } from "./hidden-layer.ts";
import { boundInnerVoice, INNER_VOICES_PER_CALL, peopleWithoutVoice } from "./inner-voice.ts";
import type { SessionEnding } from "../../persistence/contracts.ts";
import { nameStems } from "../../visual-frame/shot.ts";

export type SessionDigest = {
  recap: string;
  title: string;
  notebook: string;
  plans: { key: string; value: string }[];
  playerLikes: string | null;
  /** Polish item 11: the closing stinger «Тем временем…» — one beat elsewhere, from an open plan. */
  stinger: string;
  /** Fix run B1: the hidden layer rewritten with what the session moved (null: unchanged). */
  hiddenLayer: string | null;
  /** Fix run B2 (2): closed notes of one finished matter, folded into one line each. */
  folds: { keys: { kind: "fact" | "clock" | "consequence"; key: string }[]; line: string }[];
  /** Fix run E (item 81): how the session closes, by its length. */
  ending: SessionEnding;
  /** Findings S3 §6: the voice blocks of the people the request named (a companion or a person who recurs, without one yet). */
  voices: { entityId: string; inner: string }[];
};

export type DigestSession = { id: string; title: string; scenes: { role: string; body: string }[]; startWorldMinutes: number | null; endWorldMinutes: number;
  /** Fix run E (item 81): the session's length decides the ending's form; the people met get the cards. */
  shape?: SessionShape; people?: { id: string; name: string }[] };
export type SessionShape = { turns: number; playMinutes: number; form: SessionEnding["form"] };

/** A pause longer than this between two scenes is not play (a session left open overnight is not ten hours long). */
const PLAY_GAP_MINUTES = 15;
/** Fix run E (item 81, the owner's design): a long session — several hours or 30 turns and more — closes with the
 * ending cards; a short one (about an hour) with «что было» in a few lines. */
export const LONG_SESSION = { turns: 30, playMinutes: 180 };
export function sessionShape(scenes: { role: string; created_at: string }[]): SessionShape {
  const times = scenes.map((row) => Date.parse(row.created_at)).filter(Number.isFinite).sort((a, b) => a - b);
  let minutes = 0;
  for (let index = 1; index < times.length; index++) minutes += Math.min(PLAY_GAP_MINUTES, (times[index] - times[index - 1]) / 60_000);
  const turns = scenes.filter((row) => row.role === "player").length;
  const playMinutes = Math.round(minutes);
  return { turns, playMinutes, form: turns >= LONG_SESSION.turns || playMinutes >= LONG_SESSION.playMinutes ? "cards" : "short" };
}
/** The people (and groups) the session's narration names — public records the hero has met, never the hero. */
export function sessionPeople(source: Pick<RuntimeSource, "snapshot">, scenes: { role: string; body: string }[]): { id: string; name: string }[] {
  const text = scenes.filter((row) => row.role === "narration").map((row) => row.body).join("\n").toLowerCase();
  return source.snapshot.entities.filter((row) => ["companion", "npc", "faction"].includes(row.kind) && !row.public_profile?.unmet)
    .filter((row) => { const stems = nameStems(row.name); return stems.length > 0 && stems.some((stem) => text.includes(stem)); })
    .slice(0, 24).map((row) => ({ id: row.id, name: row.name }));
}

const ENDING_FIELDS = {
  short: `  "lines": ["«what happened»: 3–5 short lines in the campaign language, the session's main beats only, each one sentence, nothing the hero does not know"],`,
  cards: `  "cards": [ { "entityId": "<ID from PEOPLE OF THIS SESSION, or null for a group>", "name": "the person or group as the hero knows them", "where": "where they are now as far as the hero knows, or «неизвестно» / «unknown»", "standing": "how they stand with the hero, a few words", "fate": "one line of their fate as of now, like the final slides of a role-playing game; «неизвестно» / «unknown» when the hero does not know" } ],`,
};
/** Findings S3 §7: «more of your own reasoning (why you decided what you did)» in the layer's line made Opus 5.5 refuse the
 * whole digest at once (stop «refusal», no text; docs/runs/findings-s3-digest-bisect-*.json) — the same meaning in other
 * words passes: «your plans with the reasons behind them». */
function digestInstructions(form: SessionEnding["form"], voices = false) {
  return `Between sessions. The session below has just ended. Write your notes between sessions in one pass: the player's parts (recap, title, the ending, threads, stinger) for the owner to read, and your own private parts (notebook, plans, hiddenLayer, playerLikes) the way a game master writes for themself — ${DM_NOTES_VOICE} Answer with a single JSON object (the server reads only the JSON):
{
  "recap": "«Previously in…» in your own voice, in the campaign language, for the player: three or four sentences looking forward — where the hero is now, what is at stake, what comes next; not a list of facts, no minor details; nothing the hero does not know, no spoilers",
  "title": "a chapter title for this session in the campaign language (2–6 words)",
${ENDING_FIELDS[form]}
  "threads": ["every open thread the hero knows, one line each in the campaign language, at most ten: quests, promises, debts, people at large, deadlines, unanswered questions — from all live threads of the story, not only the quest log"],
  "notebook": "your own notebook for the next session, in the campaign language and in the first person — notes to yourself, not a report — up to 1500 characters: what I planned for this session and how it went; what I noticed the player doing and enjoying; what I decided and why; what I left open — seeds that are ripe now, companions, threads, debts or promises that have not sounded for a while, each mystery's clues the player has met and the next one I will offer, questions asked of or by the hero still unanswered; two or three situations I can offer next time (situations, not plot, no rails); and one or two exact lines from this session, quoted, that carried its feeling",
  "plans": [ { "key": "plan_<existing or new key>", "actorId": "<entity ID or null>", "goal": "the plan and its next steps in a few lines", "dueWorldMinutes": <absolute game minute of the next step>, "consequence": "what lands if nobody interferes", "warning": "the fair warning the hero may notice, or empty", "status": "open|done|dropped" } ],
  "playerLikes": "one to three short NEW lines of YOUR observations of what the player enjoyed this session that your notes do not hold yet (they are appended to your notes, never replace them; never the player's own words), or null when nothing is new",
  "hiddenLayer": "the campaign's hidden layer (your private notes begin with it) rewritten whole with what this session moved: which clues the hero found, which secrets came closer, the clocks advanced, a faction's aim that shifted — the same headings, in the campaign language, written under them as your own first-person notes, up to ${HIDDEN_LAYER_MAX_CHARS - 1000} characters — where the room allows, keep more of the exact lines that carried a scene and more of your plans with the reasons behind them, rather than a summary; null when the session changed nothing in it or the campaign has none",
  "folds": [ { "keys": ["kind:key of two or more CLOSED private notes about one finished matter (a fight's rounds, a search's steps)"], "line": "one line that keeps what still matters of them, in the campaign language" } ],
  "stinger": "«Meanwhile…»: 2–4 sentences in the campaign language — news that travels through the world and could reach the hero or the people around them: a guard's report to the captain, a rumour in the market, a letter, a messenger. Not an all-seeing camera: only what that channel could carry. It moves the story and may deepen an open question; it never answers a question the hero was left with, never names a hidden fact, never decides an outcome; written as story, no headings; empty string when nothing fits",
  "channel": "how the «Meanwhile» news travels, a few words in the campaign language (a report to the captain of the guard; a rumour on the market); empty with an empty stinger"${voices ? `,
  "voices": [ { "entityId": "<ID from PEOPLE WITHOUT A VOICE OF THEIR OWN>", "inner": "that person in their own first-person words, three or four lines under 80 words, in the campaign language: what I want, what I fear, what I know and what I hide, how I talk — from their records and from how they spoke and acted so far" } ]` : ""}
}
Rules: fold only notes marked closed, never an open one, never the hidden layer; leave out "folds" when nothing is worth folding. Advance the off-screen plans only for the game time that passed in this session (from its first to its last scene); the player's real-world absence moves nothing. Keep each person consistent with their Character Model. Plans you do not change may be omitted. Never put a secret into recap, title, ${form === "cards" ? "cards" : "lines"}, threads or stinger. End the session on a clear beat: the recap says where things stand and what comes next, the stinger shows the world moving.`;
}

/** Findings S3 §2: the DM's own notes (the digest's private parts, the hidden-layer prep) in the first person — memory
 * carries by content, and a first-person note carries more than a third-person summary. «Ранее в…» stays for the owner. */
export const DM_NOTES_VOICE = "in the first person, as your own notes: what you planned, what you noticed the player doing, what you decided and why, what you left open — not a summary written about the game from outside.";

/** Findings S3 §2: first-person forms per 100 words of a note (Russian and English; a word-boundary count, no model) —
 * the measure the digest's log and the probe report read. */
const FIRST_PERSON = /(?<![\p{L}])(?:я|меня|мне|мной|мною|мой|моя|моё|мое|мои|моего|моей|моему|моим|моих|моими|мою|i|me|my|myself|i'm|i've|i'll|i'd)(?![\p{L}'])/giu;
export function firstPersonPer100(text: string): number {
  const words = text.match(/[\p{L}\p{N}'’-]+/gu)?.length ?? 0;
  if (!words) return 0;
  const count = text.replace(/’/g, "'").match(FIRST_PERSON)?.length ?? 0;
  return Math.round((count / words) * 1000) / 10;
}

export function buildDigestRequest(source: RuntimeSource, session: DigestSession, effort: DmEffort): { system: DmSystemBlock[]; messages: DmMessage[]; effort: DmEffort; tokens: number;
  shape: SessionShape; people: { id: string; name: string }[]; voicesFor: { id: string; name: string }[] } {
  // The same cached layers a turn uses (how to run, the world, the dossier); the
  // session's scenes and the time it covered take the place of the "now" layer.
  const input: TurnInput = { operationId: "00000000-0000-4000-8000-000000000000", campaignId: source.snapshot.campaign.id,
    timeline: source.snapshot.timeline ?? source.runtime.timeline, expectedRevision: source.runtime.revision, mode: "game",
    input: "", companionId: null, listenerIds: [], mechanic: null };
  const context = buildDmLoopContext(source, input);
  // Every layer but «now»: how to DM, the world, the stable dossier and the session's tail.
  const prefix = context.system.slice(0, -1);
  const span = session.startWorldMinutes === null ? `up to ${worldDay(session.endWorldMinutes)}` : `${worldDay(session.startWorldMinutes)} → ${worldDay(session.endWorldMinutes)} (${session.endWorldMinutes - session.startWorldMinutes} game minutes)`;
  const scenes = session.scenes.map((scene) => `[${scene.role}] ${scene.body}`).join("\n");
  const openPlans = allPlans(source.privateState).filter((plan) => plan.status === "open");
  const shape = session.shape ?? { turns: session.scenes.filter((row) => row.role === "player").length, playMinutes: 0, form: "short" as const };
  const people = session.people ?? sessionPeople(source, session.scenes);
  // Findings S3 §6: the companions and the people who recur (named in this session and in an earlier one) without a voice block yet.
  const earlier = source.snapshot.scenes.filter((row) => row.session_id !== session.id).map((row) => ({ role: row.role, body: row.body }));
  const before = new Set(sessionPeople(source, earlier).map((row) => row.id));
  const voicesFor = peopleWithoutVoice(source, sessionPeople(source, session.scenes).filter((row) => before.has(row.id)).map((row) => row.id));
  const now = [`The session «${session.title}» (${session.id}) just ended. Game time it covered: ${span}. Current game time: ${worldDay(session.endWorldMinutes)} (minute ${session.endWorldMinutes}).`,
    `It was a ${shape.form === "cards" ? "long" : "short"} session: ${shape.turns} turns, about ${Math.max(1, Math.round(shape.playMinutes / 60 * 10) / 10)} hours of play. ${shape.form === "cards"
      ? "Close it with the ending cards: one card per person or group the hero met this session."
      : "Close it with «what happened» in a few lines; no cards."}`,
    shape.form === "cards" ? `PEOPLE OF THIS SESSION (ID — name): ${people.length ? people.map((row) => `${row.id} — ${row.name}`).join("; ") : "(none on record; cards for groups only)"}.` : "",
    openPlans.length ? `Open plans with their keys and due minutes: ${openPlans.map((p) => `${p.key} (actor ${p.actorId ?? "none"}, due minute ${p.dueWorldMinutes})`).join("; ")}.` : "No open plans yet; create a plan for every important antagonist and faction that has a goal.",
    voicesFor.length ? `PEOPLE WITHOUT A VOICE OF THEIR OWN (ID — name; write each one's voice block): ${voicesFor.map((row) => `${row.id} — ${row.name}`).join("; ")}.` : "",
    `Scenes of the session (oldest first):\n${scenes || "(no scenes)"}`].filter(Boolean).join("\n\n");
  const instructions = digestInstructions(shape.form, voicesFor.length > 0);
  const system: DmSystemBlock[] = [...prefix, { text: now, cache: false }];
  const messages: DmMessage[] = [{ role: "user", text: instructions }];
  return { system, messages, effort, shape, people, voicesFor, tokens: system.reduce((sum, block) => sum + estimateTokens(block.text), 0) + estimateTokens(instructions) };
}

/** Fix S3-pre A-17: the parse repair of a digest answer — trailing commas dropped, and an answer cut mid-way (the output
 * cap, a dropped stream) closed at its last complete field: the open strings, arrays and objects of the kept part are
 * closed in order. Null when nothing parses. Pure. */
export function repairDigestJson(text: string): Record<string, unknown> | null {
  const start = text.indexOf("{");
  if (start < 0) return null;
  const body = text.slice(start);
  const object = (candidate: string) => {
    try { const value: unknown = JSON.parse(candidate); return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null; }
    catch { return null; }
  };
  // As written first; a trailing comma is dropped only when that fails (a story's «, ]» inside a string stays).
  const parse = (candidate: string) => object(candidate) ?? object(candidate.replace(/,\s*([}\]])/g, "$1"));
  const end = body.lastIndexOf("}");
  const whole = end > 0 ? parse(body.slice(0, end + 1)) : null;
  if (whole) return whole;
  // The commas outside strings, from the last one back: cut there and close what is open.
  const commas: number[] = [];
  let inString = false, escaped = false;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (inString) { if (escaped) escaped = false; else if (ch === "\\") escaped = true; else if (ch === '"') inString = false; continue; }
    if (ch === '"') inString = true; else if (ch === ",") commas.push(i);
  }
  for (const cut of commas.reverse().slice(0, 400)) {
    const kept = body.slice(0, cut);
    const stack: string[] = [];
    let open = false, esc = false;
    for (const ch of kept) {
      if (open) { if (esc) esc = false; else if (ch === "\\") esc = true; else if (ch === '"') open = false; continue; }
      if (ch === '"') open = true; else if (ch === "{") stack.push("}"); else if (ch === "[") stack.push("]"); else if (ch === "}" || ch === "]") stack.pop();
    }
    if (open) continue;
    const value = parse(kept + stack.reverse().join(""));
    if (value) return value;
  }
  return null;
}

/** The model's JSON, validated and bounded; a malformed answer is repaired once (A-17) and otherwise yields null (the
 * digest is retried on the next entry). */
export function parseDigest(text: string, source: RuntimeSource, nowMinutes: number, shape?: SessionShape, people?: { id: string; name: string }[],
  voicesFor: { id: string }[] = []): SessionDigest | null {
  const repaired = repairDigestJson(text);
  if (!repaired) return null;
  const value: Record<string, unknown> = repaired;
  if (!value || typeof value !== "object") return null;
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const recap = str(value.recap, 4000), title = str(value.title, 200), notebook = str(value.notebook, 6000);
  if (!recap || !title) return null;
  const existing = new Map(allPlans(source.privateState).map((plan) => [plan.key, plan]));
  const ids = new Set(source.snapshot.entities.map((row) => row.id));
  const plans: { key: string; value: string }[] = [];
  for (const raw of Array.isArray(value.plans) ? value.plans.slice(0, 40) : []) {
    if (!raw || typeof raw !== "object") continue;
    const p = raw as Record<string, unknown>;
    const key = str(p.key, 110);
    if (!/^plan_[a-zA-Z0-9_-]{1,100}$/.test(key)) continue;
    const previous = existing.get(key) ?? null;
    const status = p.status === "done" || p.status === "dropped" ? p.status : "open";
    const actorId = typeof p.actorId === "string" && ids.has(p.actorId) ? p.actorId : previous?.actorId ?? null;
    const goal = str(p.goal, 2000) || previous?.goal || "";
    if (!goal) continue;
    const due = Number.isFinite(Number(p.dueWorldMinutes)) ? Math.max(0, Math.floor(Number(p.dueWorldMinutes))) : previous?.dueWorldMinutes ?? nowMinutes;
    const plan: OffScreenPlan = { key, actorId, goal, dueWorldMinutes: due, setAtWorldMinutes: nowMinutes,
      consequence: str(p.consequence, 400) || previous?.consequence || "", warning: str(p.warning, 400) || previous?.warning || "", status };
    plans.push({ key, value: serializePlan(plan) });
  }
  // Fix run B2 (2): a fold names closed notes that exist; anything else is ignored.
  const closedKeys = new Set(privateNotes(source.privateState).filter((note) => note.until !== null).map((note) => `${note.kind}:${note.key}`));
  const folds: SessionDigest["folds"] = [];
  for (const raw of Array.isArray(value.folds) ? value.folds.slice(0, 20) : []) {
    if (!raw || typeof raw !== "object") continue;
    const f = raw as Record<string, unknown>;
    const keys = (Array.isArray(f.keys) ? f.keys : []).map((k) => String(k)).filter((k) => closedKeys.has(k))
      .map((k) => { const at = k.indexOf(":"); return { kind: k.slice(0, at) as "fact" | "clock" | "consequence", key: k.slice(at + 1) }; });
    const line = str(f.line, 600);
    if (keys.length >= 2 && line) folds.push({ keys, line });
  }
  const layer = typeof value.hiddenLayer === "string" && value.hiddenLayer.trim() && hiddenLayerOf(source) ? value.hiddenLayer.trim().slice(0, HIDDEN_LAYER_MAX_CHARS - 200) : null;
  // Fix run E (item 81): the ending, bounded; a card names a person of this session or nobody (a group).
  const form = shape?.form ?? "short";
  const lineList = (v: unknown, max: number, each: number) => (Array.isArray(v) ? v.map((row) => str(row, each).replace(/\s+/g, " ")).filter(Boolean).slice(0, max) : []);
  const met = new Set((people ?? []).map((row) => row.id));
  const cards = form === "cards" && Array.isArray(value.cards) ? value.cards.slice(0, 12).flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const c = raw as Record<string, unknown>;
    const name = str(c.name, 80), fate = str(c.fate, 240);
    if (!name || !fate) return [];
    const entityId = typeof c.entityId === "string" && met.has(c.entityId) ? c.entityId : null;
    return [{ entityId, name, where: str(c.where, 160), standing: str(c.standing, 160), fate }];
  }).slice(0, 10) : [];
  const stinger = str(value.stinger, 2000);
  const ending: SessionEnding = { version: 1, form, lines: form === "short" ? lineList(value.lines, 6, 240) : [], cards, threads: lineList(value.threads, 10, 200),
    channel: stinger ? str(value.channel, 120) : "", turns: shape?.turns ?? 0, playMinutes: shape?.playMinutes ?? 0 };
  // Findings S3 §6: a voice block only for a person the request named, bounded under 80 words.
  const asked = new Set(voicesFor.map((row) => row.id));
  const voices = (Array.isArray(value.voices) ? value.voices.slice(0, INNER_VOICES_PER_CALL) : []).flatMap((raw) => {
    const v = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
    const inner = boundInnerVoice(v.inner);
    return typeof v.entityId === "string" && asked.has(v.entityId) && inner ? [{ entityId: v.entityId, inner }] : [];
  });
  return { voices, recap, title, notebook, plans, playerLikes: typeof value.playerLikes === "string" && value.playerLikes.trim() ? value.playerLikes.trim().slice(0, 2000) : null,
    stinger, hiddenLayer: layer, folds, ending };
}

/** The digest's output ceiling, thinking included (fix run A4). */
export const DIGEST_OUTPUT_TOKENS = 32_000;
/** Why a digest answer could not be read, in one phrase for the log (item 17). */
export function unparsedReason(text: string, stop: string | null): string {
  if (stop === "max_tokens") return "cut by the output cap";
  if (!text.trim()) return "no text in the answer";
  if (text.indexOf("{") < 0) return "no JSON object in the answer";
  return "the JSON object lacks a recap or a title, or does not parse";
}

/** Runs the digest request on the model and returns the parsed digest with the usage. */
export async function runDigest(model: DmModel, request: ReturnType<typeof buildDigestRequest>, source: RuntimeSource, nowMinutes: number,
  options: { maxOutputTokens?: number; operationId?: string; cacheKey?: string } = {}) {
  let text = "";
  let usage: { inputTokens: number; outputTokens: number; cacheReadTokens: number; cacheWriteTokens: number; reasoningTokens: number | null } | null = null;
  let stop: string | null = null;
  // Fix run A4 (items 17, 81): 6 000 output tokens included the thinking, so an «unparsed» digest was
  // most likely a cut one; it gets the loop's own ceiling.
  for await (const event of model.stream({ system: request.system, messages: request.messages, toolset: null, effort: request.effort,
    maxOutputTokens: options.maxOutputTokens ?? DIGEST_OUTPUT_TOKENS, operationId: options.operationId, cacheKey: options.cacheKey })) {
    if (event.type === "text_delta") text += event.text;
    else if (event.type === "usage") usage = event.usage;
    else if (event.type === "stop") stop = event.reason;
  }
  return { digest: parseDigest(text, source, nowMinutes, request.shape, request.people, request.voicesFor), text, usage, stop };
}
