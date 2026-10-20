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
function digestInstructions(form: SessionEnding["form"]) {
  return `Between sessions. The session below has just ended. Do the DM's homework in one pass and answer with a single JSON object, nothing else:
{
  "recap": "«Previously in…» in your own voice, in the campaign language, for the player: three or four sentences looking forward — where the hero is now, what is at stake, what comes next; not a list of facts, no minor details; nothing the hero does not know, no spoilers",
  "title": "a chapter title for this session in the campaign language (2–6 words)",
${ENDING_FIELDS[form]}
  "threads": ["every open thread the hero knows, one line each in the campaign language, at most ten: quests, promises, debts, people at large, deadlines, unanswered questions — from all live threads of the story, not only the quest log"],
  "notebook": "your private prep notebook for the next session, in the campaign language, up to 1500 characters: (1) what engaged the player this session; (2) two or three situations ready to offer next time — situations, not plot, no rails; (3) seeds planted earlier that are ripe now; (4) companions, threads, debts or promises that have not sounded for a while and deserve a scene; (5) for each mystery, which clues the player has met and the next clue to offer; (6) direct questions asked of or by the hero that are still unanswered",
  "plans": [ { "key": "plan_<existing or new key>", "actorId": "<entity ID or null>", "goal": "the plan and its next steps in a few lines", "dueWorldMinutes": <absolute game minute of the next step>, "consequence": "what lands if nobody interferes", "warning": "the fair warning the hero may notice, or empty", "status": "open|done|dropped" } ],
  "playerLikes": "one to three short NEW lines of YOUR observations of what the player enjoyed this session that your notes do not hold yet (they are appended to your notes, never replace them; never the player's own words), or null when nothing is new",
  "hiddenLayer": "the campaign's hidden layer (your private notes begin with it) rewritten whole with what this session moved: which clues the hero found, which secrets came closer, the clocks advanced, a faction's aim that shifted — the same headings, in the campaign language, up to 5000 characters; null when the session changed nothing in it or the campaign has none",
  "folds": [ { "keys": ["kind:key of two or more CLOSED private notes about one finished matter (a fight's rounds, a search's steps)"], "line": "one line that keeps what still matters of them, in the campaign language" } ],
  "stinger": "«Meanwhile…»: 2–4 sentences in the campaign language — news that travels through the world and could reach the hero or the people around them: a guard's report to the captain, a rumour in the market, a letter, a messenger. Not an all-seeing camera: only what that channel could carry. It moves the story and may deepen an open question; it never answers a question the hero was left with, never names a hidden fact, never decides an outcome; written as story, no headings; empty string when nothing fits",
  "channel": "how the «Meanwhile» news travels, a few words in the campaign language (a report to the captain of the guard; a rumour on the market); empty with an empty stinger"
}
Rules: fold only notes marked closed, never an open one, never the hidden layer; leave out "folds" when nothing is worth folding. Advance the off-screen plans only for the game time that passed in this session (from its first to its last scene); the player's real-world absence moves nothing. Keep each person consistent with their Character Model. Plans you do not change may be omitted. Never put a secret into recap, title, ${form === "cards" ? "cards" : "lines"}, threads or stinger. End the session on a clear beat: the recap says where things stand and what comes next, the stinger shows the world moving.`;
}

export function buildDigestRequest(source: RuntimeSource, session: DigestSession, effort: DmEffort): { system: DmSystemBlock[]; messages: DmMessage[]; effort: DmEffort; tokens: number;
  shape: SessionShape; people: { id: string; name: string }[] } {
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
  const now = [`The session «${session.title}» (${session.id}) just ended. Game time it covered: ${span}. Current game time: ${worldDay(session.endWorldMinutes)} (minute ${session.endWorldMinutes}).`,
    `It was a ${shape.form === "cards" ? "long" : "short"} session: ${shape.turns} turns, about ${Math.max(1, Math.round(shape.playMinutes / 60 * 10) / 10)} hours of play. ${shape.form === "cards"
      ? "Close it with the ending cards: one card per person or group the hero met this session."
      : "Close it with «what happened» in a few lines; no cards."}`,
    shape.form === "cards" ? `PEOPLE OF THIS SESSION (ID — name): ${people.length ? people.map((row) => `${row.id} — ${row.name}`).join("; ") : "(none on record; cards for groups only)"}.` : "",
    openPlans.length ? `Open plans with their keys and due minutes: ${openPlans.map((p) => `${p.key} (actor ${p.actorId ?? "none"}, due minute ${p.dueWorldMinutes})`).join("; ")}.` : "No open plans yet; create a plan for every important antagonist and faction that has a goal.",
    `Scenes of the session (oldest first):\n${scenes || "(no scenes)"}`].filter(Boolean).join("\n\n");
  const instructions = digestInstructions(shape.form);
  const system: DmSystemBlock[] = [...prefix, { text: now, cache: false }];
  const messages: DmMessage[] = [{ role: "user", text: instructions }];
  return { system, messages, effort, shape, people, tokens: system.reduce((sum, block) => sum + estimateTokens(block.text), 0) + estimateTokens(instructions) };
}

/** The model's JSON, validated and bounded; a malformed answer yields null (the digest is retried on the next entry). */
export function parseDigest(text: string, source: RuntimeSource, nowMinutes: number, shape?: SessionShape, people?: { id: string; name: string }[]): SessionDigest | null {
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  let value: Record<string, unknown>;
  try { value = JSON.parse(text.slice(start, end + 1)); } catch { return null; }
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
  const layer = typeof value.hiddenLayer === "string" && value.hiddenLayer.trim() && hiddenLayerOf(source) ? value.hiddenLayer.trim().slice(0, 5800) : null;
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
  return { recap, title, notebook, plans, playerLikes: typeof value.playerLikes === "string" && value.playerLikes.trim() ? value.playerLikes.trim().slice(0, 2000) : null,
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
  return { digest: parseDigest(text, source, nowMinutes, request.shape, request.people), text, usage, stop };
}
