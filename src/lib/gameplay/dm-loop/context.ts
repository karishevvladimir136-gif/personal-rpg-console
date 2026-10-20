// The four-layer request of dm-loop-v1 (plan §10 «весь крафт в кэш», §12 the
// campaign dossier, §11 pinned facts; stage task §1), from the most stable to
// the most volatile (polish 2 §4: the conversation's history sits between the
// world and the living dossier as append-only blocks, so a turn writes only its
// own rows). Breakpoints (fix run A2, at most four on Anthropic): the role, the
// world, the history's end, and the turn's own conversation (its last message,
// and on a continuation the end of the previous request instead of the role):
//   1. how to run the game — role, tool policy, the whole approved DM Craft
//      library (doctrine and every active card), DM Style;
//   2. the world — campaign, theme, DM guide, Canon, rules as knowledge
//      (reference documents), the historical world packet, play settings;
//   3. the living dossier — party and sheets in short form, the codex of people
//      (Character Models by budget, nearest relationships first), factions, the
//      journal (quests, threads, debts, promises, the main arc), owner-pinned
//      facts, private secrets, off-screen plans, the DM prep notebook, the
//      player-likes note, the attention ledger, adventure guidance, memory digests;
//   4. now — the variety counter, retrieved memory, the current state with IDs,
//      recent scenes and exchanges, the player's input.
// Nothing volatile sits in layers 1–3: presence, HP, money, time and the last
// scene kinds live in layer 4. Budgets are in tokens (estimated), never in
// counts of characters; what a budget drops is reported, never lost silently.
import type { TurnInput, JsonObject } from "../contracts.ts";
import type { RuntimeSource } from "../server-contracts.ts";
import type { Entity, PublicProfile, Quest } from "../../persistence/contracts.ts";
import { cardForRole, pinnedCraftForStage, type ContextCard } from "../dm-craft-context.ts";
import { timeCheckLine, TIME_CHECK_KEY } from "./time-words.ts";
import { quotableLine } from "./quotable.ts";

/** Polish 3 §7: the cards chosen for a turn, as one block of the volatile tail (empty when none). */
export function craftCardsBlock(cards: ContextCard[]): string {
  if (!cards.length) return "";
  return `DM Craft cards for this turn (the owner's approved cards chosen for this scene by its words; the doctrine above always applies):\n${cards.map((card) => `## ${card.title}\n${card.guidance}\nAvoid: ${card.avoid}`).join("\n")}`;
}
import { parseCharacterModel, type CharacterModel } from "../character-model.ts";
import type { DmSystemBlock } from "../../server/dm/model/contracts.ts";
import { dmRoleText, dmTurnShape, writerRoleText, writerTurnShape } from "./roles.ts";
import { campaignLanguageRu, DOCTRINE_HEADER_RU, HEADERS_RU } from "./roles-ru.ts";
import { allPlans } from "./plans.ts";
import { voiceExamplesBlock, voiceLayer, voiceReminder, VOICE_TOKEN_CAP_DEFAULT, VOICE_TOKEN_CAP_MAX, VOICE_TOKEN_CAP_MIN } from "./voice.ts";
import { parseLedger, type AttentionLedger } from "./ledger.ts";
import { MEMORY_PRESETS, parseDmOptions } from "./options.ts";
import { itemMechanics, walletOfEntity, walletOfStorage } from "../../inventory/model.ts";

const bytes = (text: string) => new TextEncoder().encode(text).length;
const json = (value: unknown) => JSON.stringify(value);

import { estimateTokens } from "./tokens.ts";
import { HIDDEN_LAYER_KEY, hiddenLayerOf, ownerSecretsText, privateNotes, rankNotes, type PrivateNote } from "./private-notes.ts";
export { estimateTokens };
const clipTokens = (text: string, maxTokens: number) => {
  if (estimateTokens(text) <= maxTokens) return text;
  // Trim to the budget by proportion, then by whole lines.
  const ratio = maxTokens / estimateTokens(text);
  let cut = text.slice(0, Math.max(0, Math.floor(text.length * ratio) - 1));
  const lastBreak = cut.lastIndexOf("\n");
  if (lastBreak > cut.length / 2) cut = cut.slice(0, lastBreak);
  return `${cut}\n[… trimmed to the budget …]`;
};
const clipChars = (text: string, max: number) => (text.length <= max ? text : `${text.slice(0, max)}…`);

/** Token budgets of the layers and of the dossier's parts (stage task §1). */
export const DOSSIER_BUDGETS = {
  // Polish group 7: the role, the twelve approved cards and the voice slot fit in the cached layer.
  layer1: 12000,
  // Polish item 8: more of the window where more text means better play — the canon, the codex,
  // the recent scenes verbatim and the exchanges; the stable parts stay cached.
  layer2: { guide: 6000, canon: 40000, reference: 6000, packet: 6000 },
  // Polish item 12: layer 3 is two blocks — the stable part (cached for an hour)
  // and the session's tail after the breakpoint (Character Models by presence,
  // the open journal, secrets, plans, likes, the ledger), which changes most turns.
  layer3: { party: 4000, codex: 30000, factions: 1200, journal: 4000, pinned: 800, secrets: 3500, plans: 1500,
    // Fix run F (item 15): the active adventure's whole text, budgeted like a canon document (it was 600 characters).
    notebook: 1500, likes: 300, ledger: 500, adventure: 8000, memory: 4000, models: 16000 },
  layer4: { memory: 6000, scenes: 30000, exchanges: 15000 },
} as const;

export type DossierLayerReport = { layer: number; budgetTokens: number; usedTokens: number; dropped: string[] };

function describeStyle(style: Record<string, unknown> | null): string {
  if (!style) return "";
  const lines = Object.entries(style).map(([key, value]) => `- ${key}: ${String(value)}`);
  return `DM Style (owner preferences for presentation; they guide tone and pacing, never override state or the player's agency):\n${lines.join("\n")}`;
}

/** The part of the day in words (polish item 18): the DM checks «утром / вечером» against it. */
export function partOfDay(minutes: number, language: "ru" | "en" = "en"): string {
  const hour = Math.floor((((minutes % 1440) + 1440) % 1440) / 60);
  const part = hour < 5 ? "night" : hour < 11 ? "morning" : hour < 17 ? "day" : hour < 22 ? "evening" : "night";
  return language === "ru" ? { night: "ночь", morning: "утро", day: "день", evening: "вечер" }[part] : part;
}

/** Day and time of a world minute, stable text for the cached layers. */
export function worldDay(minutes: number): string {
  const day = Math.floor(minutes / 1440) + 1;
  const rest = Math.floor(minutes % 1440);
  return `day ${day} ${String(Math.floor(rest / 60)).padStart(2, "0")}:${String(rest % 60).padStart(2, "0")}`;
}

type Budgeted = { text: string; dropped: string[]; used: number };
/** Keeps whole entries in order until the budget is full; names what it dropped. */
function withinBudget(entries: { label: string; text: string }[], budget: number, title: string): Budgeted {
  const kept: string[] = [];
  const dropped: string[] = [];
  let used = 0;
  for (const entry of entries) {
    const cost = estimateTokens(entry.text) + 1;
    if (used + cost > budget) { dropped.push(entry.label); continue; }
    kept.push(entry.text);
    used += cost;
  }
  return { text: kept.length ? `${title}\n${kept.join("\n")}` : "", dropped, used };
}

// --- layer 3: the dossier ---------------------------------------------------
type Models = Map<string, CharacterModel>;
function storedModels(source: RuntimeSource): Models {
  const models: Models = new Map();
  const bucket = source.privateState.npc;
  if (!bucket || typeof bucket !== "object" || Array.isArray(bucket)) return models;
  for (const [key, raw] of Object.entries(bucket)) {
    if (!key.startsWith("character_") || typeof raw !== "string") continue;
    try { const model = parseCharacterModel(JSON.parse(raw)); models.set(model.actorId, model); } catch { /* an invalid note is not context */ }
  }
  return models;
}
const profileOf = (entity: Entity): PublicProfile => (entity.public_profile && typeof entity.public_profile === "object" ? entity.public_profile : {});

function modelText(snapshot: RuntimeSource["snapshot"], model: CharacterModel): string {
  const { schemaVersion: _v, basisOperationId: _b, actorId: _a, ...body } = model;
  void _v; void _b; void _a;
  return json({ ...body, relationships: body.relationships.map((r) => ({ ...r, actorId: snapshot.entities.find((e) => e.id === r.actorId)?.name ?? r.actorId })),
    ...(body.speech ? { speech: speechText(snapshot, body.speech) } : {}) });
}
function partyInShort(source: RuntimeSource): Budgeted {
  const { snapshot, runtime } = source;
  const controlled = new Set(runtime.configuration?.controlledEntityIds ?? []);
  const party = snapshot.entities.filter((row) => row.kind === "player" || (row.kind === "companion" && controlled.has(row.id)));
  const entries = party.map((row) => {
    const profile = profileOf(row);
    const sheet = row.character_sheet ? clipChars(json(row.character_sheet), 1500) : null;
    const line = { id: row.id, name: row.name, role: row.kind === "player" ? "hero" : "companion", details: clipChars(row.details, 600),
      stats: row.stats, ...(sheet ? { sheet } : {}), ...(profile.attitude ? { attitudeToHero: profile.attitude.text } : {}),
      ...(profile.relation ? { relation: profile.relation } : {}), ...(profile.homePlaceId ? { home: profile.homePlaceId } : {}) };
    return { label: row.name, text: `- ${json(line)}` };
  });
  return withinBudget(entries, DOSSIER_BUDGETS.layer3.party, "Party (identity and sheets; the companions' Character Models are in the session tail; HP, money, items and presence are in the current state):");
}

/** Relationship distance of each person to the party through the models. */
function distances(source: RuntimeSource, models: Models): (id: string) => number {
  const { snapshot, runtime } = source;
  const controlled = new Set(runtime.configuration?.controlledEntityIds ?? []);
  const partyIds = snapshot.entities.filter((row) => row.kind === "player" || controlled.has(row.id)).map((row) => row.id);
  const linked = new Map<string, Set<string>>();
  for (const [actorId, model] of models) for (const r of model.relationships) {
    (linked.get(actorId) ?? linked.set(actorId, new Set()).get(actorId)!).add(r.actorId);
    (linked.get(r.actorId) ?? linked.set(r.actorId, new Set()).get(r.actorId)!).add(actorId);
  }
  return (id: string) => {
    const first = linked.get(id) ?? new Set();
    if (partyIds.some((p) => first.has(p))) return 1;
    for (const other of first) if (partyIds.some((p) => linked.get(other)?.has(p))) return 2;
    return 3;
  };
}

/** The core of a Character Model for a person who is mentioned or relevant but
 * not in the scene (polish item 8): wants, boundaries, the current state, the
 * attitude to the party, the voice, open debts and promises. */
function modelCore(source: RuntimeSource, model: CharacterModel): string {
  const { snapshot, runtime } = source;
  const controlled = new Set(runtime.configuration?.controlledEntityIds ?? []);
  const partyIds = new Set(snapshot.entities.filter((row) => row.kind === "player" || controlled.has(row.id)).map((row) => row.id));
  const name = (id: string) => snapshot.entities.find((e) => e.id === id)?.name ?? id;
  const debts = snapshot.quests.filter((q) => q.status === "open" && (q.kind === "debt" || q.kind === "promise") && q.detail?.counterpartId === model.actorId).map((q) => q.title);
  return json({ wants: model.identity.wants, boundaries: model.identity.boundaries, current: model.current,
    toParty: model.relationships.filter((r) => partyIds.has(r.actorId)).map((r) => ({ who: name(r.actorId), affection: r.affection, trust: r.trust, respect: r.respect, ...(r.unresolvedHurt ? { hurt: r.unresolvedHurt } : {}) })),
    voice: model.identity.observableVoice, signatures: model.identity.signatures, ...(model.speech ? { speech: speechText(snapshot, model.speech) } : {}),
    ...(debts.length ? { openDebtsAndPromises: debts } : {}) });
}

/** The speech profile with names in place of IDs (polish group 7). */
function speechText(snapshot: RuntimeSource["snapshot"], speech: NonNullable<CharacterModel["speech"]>) {
  return { ...speech, address: speech.address.map((a) => ({ to: snapshot.entities.find((e) => e.id === a.actorId)?.name ?? a.actorId, form: a.form })) };
}

/** Voice stage part 4: the speech profiles of the people in the scene travel in the last block
 * next to the voice reminder (persona drift: attention to the cached layers drops between turns,
 * so the profile is repeated where the player's input is), and a named person who spoke in the
 * last narration without a profile gets one line asking for it — the DM drafts the profile the
 * first time a person speaks (note_character speech; the writer describes how they speak in the
 * ledger's people line and the bookkeeper records it). */
export function speechProfilesBlock(source: RuntimeSource, input: TurnInput, models: Models, role: DmContextRole = "dm"): string {
  const { snapshot, runtime } = source;
  const present = new Set(runtime.configuration?.presentEntityIds ?? []);
  const controlled = new Set(runtime.configuration?.controlledEntityIds ?? []);
  const people = snapshot.entities.filter((row) => (row.kind === "npc" || row.kind === "companion") &&
    (present.has(row.id) || controlled.has(row.id) || row.id === input.companionId));
  const name = (id: string) => snapshot.entities.find((e) => e.id === id)?.name ?? id;
  const lines: string[] = [];
  for (const row of people) {
    const speech = models.get(row.id)?.speech;
    if (!speech) continue;
    const parts = [speech.register, `sentences ${speech.sentenceLength}`];
    if (speech.tics.length) parts.push(`tics: ${speech.tics.map((t) => `«${t.phrase}» (${t.frequency})`).join(", ")}`);
    if (speech.neverSays.length) parts.push(`never says: ${speech.neverSays.join("; ")}`);
    if (speech.address.length) parts.push(`address: ${speech.address.map((a) => `${name(a.actorId)} — ${a.form}`).join(", ")}`);
    lines.push(`- ${row.name}: ${parts.join("; ")}`);
  }
  // Who spoke in the last narration without a profile: a present person whose name stands in a
  // narration that has dialogue lines (a dash line or «…»); the hero's own words are the player's.
  const lastNarration = [...snapshot.scenes].reverse().find((row) => row.role === "narration")?.body ?? "";
  const hasDialogue = /(^|\n)\s*[—–-]\s\S/u.test(lastNarration) || /«[^»]{3,}»/u.test(lastNarration);
  const missing = hasDialogue ? people.filter((row) => !models.get(row.id)?.speech && narrationNamesPerson(lastNarration, row.name)).map((row) => row.name) : [];
  const head = lines.length ? `Speech profiles of the people in the scene (every line of theirs comes from these; a tic at most once a scene):\n${lines.join("\n")}` : "";
  const ask = missing.length ? `${missing.join(", ")} spoke in the last turn without a speech profile: draft it this turn — ${role === "writer"
    ? "in the ledger's people line say how they speak (register, sentence length, a tic with its frequency, what they never say, ты/вы towards the hero) so the bookkeeper records it"
    : "note_character speech (register, sentence length, tics with a frequency, what they never say, ты/вы towards each person)"} — so every later line is theirs.` : "";
  return [head, ask].filter(Boolean).join("\n");
}
/** A person's name (any word of four letters or more, declined forms by a cut stem) in a text. */
function narrationNamesPerson(text: string, personName: string): boolean {
  const lower = text.toLocaleLowerCase();
  return personName.toLocaleLowerCase().split(/[\s,.\-–]+/).filter((word) => word.length >= 4)
    .some((word) => lower.includes(word.length > 5 ? word.slice(0, -2) : word));
}

/** How often each tic and signature of a person sounded in the recent narration
 * (polish item 23): the DM varies them from the counts, a tic once a scene at most. */
export function recentSignatureUses(scenes: { role: string; body: string }[], model: CharacterModel, recent = 12): Record<string, number> {
  const text = scenes.filter((row) => row.role === "narration").slice(-recent).map((row) => row.body.toLocaleLowerCase()).join("\n");
  const phrases = [...(model.speech?.tics.map((t) => t.phrase) ?? []), ...model.identity.signatures];
  const counts: Record<string, number> = {};
  for (const phrase of phrases) {
    const stem = phrase.toLocaleLowerCase().replace(/[«»"'.,!?…()]/g, "").trim();
    if (stem.length < 3) continue;
    // A phrase's stem: its first words cut by two letters each, so declined forms still count.
    const escape = (word: string) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = stem.split(/\s+/).slice(0, 3).map((word) => escape(word.length > 5 ? word.slice(0, -2) : word)).join("\\S*\\s+");
    const n = (text.match(new RegExp(pattern, "gu")) ?? []).length;
    if (n > 0) counts[phrase] = n;
  }
  return counts;
}

/** The session tail's Character Models (polish item 8): people present in the
 * scene get their full model, people mentioned or relevant the core, the rest
 * one line — while the models budget lasts. */
function peopleModels(source: RuntimeSource, input: TurnInput, models: Models): Budgeted {
  const { snapshot, runtime } = source;
  const present = new Set(runtime.configuration?.presentEntityIds ?? []);
  const controlled = new Set(runtime.configuration?.controlledEntityIds ?? []);
  const distance = distances(source, models);
  const lower = input.input.toLocaleLowerCase();
  const rows = [...models.values()].map((model) => {
    const row = snapshot.entities.find((e) => e.id === model.actorId);
    if (!row) return null;
    // Mentioned by any word of the name («the work organiser» names «Local work organiser»; «Марте» names «Марта»).
    const mentioned = row.name.toLocaleLowerCase().split(/[\s,.\-–]+/).filter((word) => word.length >= 4)
      .some((word) => lower.includes(word.length > 6 ? word.slice(0, -2) : word));
    const tier: "present" | "relevant" | "other" = present.has(row.id) || controlled.has(row.id) || row.id === input.companionId ? "present"
      : mentioned || !!profileOf(row).important || distance(row.id) === 1 ? "relevant" : "other";
    return { row, model, tier, rank: tier === "present" ? 0 : tier === "relevant" ? 1 : 2 };
  }).filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => a.rank - b.rank || a.row.name.localeCompare(b.row.name));
  const signatureLine = (model: CharacterModel) => { const uses = recentSignatureUses(snapshot.scenes, model); return Object.keys(uses).length
    ? ` — sounded in the last scenes: ${Object.entries(uses).map(([phrase, n]) => `«${phrase}» ×${n}`).join(", ")} (vary; a tic once a scene at most)` : ""; };
  const entries = rows.map(({ row, model, tier }) => tier === "present"
    ? { label: row.name, text: `- ${row.name} (${row.id}, in the scene) — model: ${modelText(snapshot, model)}${signatureLine(model)}` }
    : tier === "relevant" ? { label: row.name, text: `- ${row.name} (${row.id}) — core: ${modelCore(source, model)}` }
      : { label: row.name, text: `- ${row.name} (${row.id}): ${clipChars(model.current.goal ?? model.identity.wants[0] ?? model.identity.observableVoice, 160)}` });
  const budgeted = withinBudget(entries, memoryBudgets(source).models, "Character Models (private; full for people in the scene, the core for people mentioned or relevant, one line for the rest; identity is fixed, current state and episodes evolve with note_character):");
  const statblocks = Object.entries((source.privateState.npc as JsonObject | undefined) ?? {})
    .filter(([key, value]) => key.startsWith("statblock_") && typeof value === "string")
    .map(([key, value]) => { const actor = snapshot.entities.find((row) => row.id === key.slice("statblock_".length)); return actor ? `- ${actor.name}: ${clipChars(String(value), 600)}` : null; })
    .filter(Boolean);
  if (statblocks.length) budgeted.text += `${budgeted.text ? "\n" : ""}Stat blocks (private):\n${statblocks.join("\n")}`;
  return budgeted;
}

/** The codex of people (stable within a session): identity, relation, faction,
 * home, importance — important first, then by relationship distance; never a
 * model (those are the tail's, by presence). */
function codexOfPeople(source: RuntimeSource, input: TurnInput, models: Models): Budgeted {
  const { snapshot, runtime } = source;
  const controlled = new Set(runtime.configuration?.controlledEntityIds ?? []);
  const people = snapshot.entities.filter((row) => (row.kind === "npc" || row.kind === "companion") && !controlled.has(row.id));
  const distance = distances(source, models);
  // Stable order (no input-dependent sorting, so the block caches): important first, then by distance, then by name.
  const rows = people.map((row) => {
    const profile = profileOf(row);
    const model = models.get(row.id) ?? null;
    const important = !!profile.important || model !== null;
    return { row, profile, model, important, distance: distance(row.id) };
  }).sort((a, b) => Number(b.important) - Number(a.important) || a.distance - b.distance || a.row.name.localeCompare(b.row.name));
  void input;
  const entries = rows.map(({ row, profile }) => {
    const faction = profile.factionId ? snapshot.entities.find((e) => e.id === profile.factionId)?.name ?? null : null;
    const home = profile.homePlaceId ? snapshot.locations.find((l) => l.id === profile.homePlaceId)?.name ?? null : null;
    const head = { id: row.id, name: row.name, kind: row.kind, details: clipChars(row.details, 400),
      ...(profile.relation ? { relation: profile.relation } : {}), ...(faction ? { faction } : {}), ...(home ? { home } : {}),
      ...(profile.important ? { important: true } : {}),
      ...(profile.unmet ? { notMetYet: "the hero has not met this person; the player's screens hide them until your narration names them" } : {}) };
    return { label: row.name, text: `- ${json(head)}` };
  });
  const budgeted = withinBudget(entries, memoryBudgets(source).codex, "Codex of people (public identity; their private Character Models are in the session tail):");
  // Dropped people still exist for the DM: names and IDs only.
  if (budgeted.dropped.length) {
    const names = rows.filter((r) => budgeted.dropped.includes(r.row.name)).map((r) => `${r.row.name} (${r.row.id})`);
    budgeted.text += `\nAlso known (details in the current state): ${names.join(", ")}`;
  }
  return budgeted;
}

function factions(source: RuntimeSource): Budgeted {
  const { snapshot } = source;
  const rows = snapshot.entities.filter((row) => row.kind === "faction");
  const privateNotes = (source.privateState.faction as JsonObject | undefined) ?? {};
  const entries = rows.map((row) => {
    const profile = profileOf(row);
    const members = snapshot.entities.filter((e) => profileOf(e).factionId === row.id).map((e) => e.name);
    return { label: row.name, text: `- ${json({ id: row.id, name: row.name, publicNote: clipChars(row.details, 500), standing: profile.faction?.relation ?? "unknown",
      ...(members.length ? { knownMembers: members } : {}) })}` };
  });
  for (const [key, value] of Object.entries(privateNotes))
    if (typeof value === "string") entries.push({ label: key, text: `- private faction note ${key}: ${clipChars(value, 600)}` });
  return withinBudget(entries, DOSSIER_BUDGETS.layer3.factions, "Factions (public standing as the hero knows it; private notes marked):");
}

type RewardTerms = { currency: string | null; amount: number | null; items: { name: string; quantity: number }[]; note: string | null; issuerId: string | null; paidOperationId: string | null };
function rewardTermsOf(source: RuntimeSource, quest: Quest): RewardTerms | null {
  const facts = source.privateState.fact;
  const raw = facts && typeof facts === "object" && !Array.isArray(facts) ? facts[`quest_reward_${quest.id}`] : undefined;
  if (typeof raw !== "string") return null;
  try { return JSON.parse(raw) as RewardTerms; } catch { return null; }
}
function journal(source: RuntimeSource, which: "stable" | "open" = "open"): Budgeted {
  const { snapshot } = source;
  const name = (id: string | null | undefined) => (id ? snapshot.entities.find((e) => e.id === id)?.name ?? id : null);
  const place = (id: string) => snapshot.locations.find((l) => l.id === id)?.name ?? id;
  const line = (quest: Quest) => {
    const kind = quest.kind ?? "quest";
    const detail = quest.detail ?? {};
    const terms = kind === "quest" ? rewardTermsOf(source, quest) : null;
    const entry: Record<string, unknown> = { id: quest.id, kind, title: quest.title, status: quest.status, description: clipChars(quest.description, 500) };
    if (detail.steps?.length) entry.steps = detail.steps.map((s) => `${s.done ? "[x]" : "[ ]"} ${s.text}`);
    if (detail.locationIds?.length) entry.places = detail.locationIds.map(place);
    if (detail.counterpartId) entry.counterpart = name(detail.counterpartId);
    if (terms) entry.rewardTerms = { ...(terms.currency ? { money: `${terms.amount} ${terms.currency}` } : {}),
      ...(terms.items?.length ? { items: terms.items.map((i) => `${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`) } : {}),
      ...(terms.note ? { note: terms.note } : {}), issuer: name(terms.issuerId), paid: !!terms.paidOperationId };
    return `- ${json(entry)}`;
  };
  const order = ["arc", "quest", "thread", "debt", "promise"];
  const open = snapshot.quests.filter((q) => q.status === "open" && q.kind !== "arc").sort((a, b) => order.indexOf(a.kind ?? "quest") - order.indexOf(b.kind ?? "quest") || a.title.localeCompare(b.title));
  const arc = snapshot.quests.filter((q) => q.status === "open" && q.kind === "arc");
  const closed = snapshot.quests.filter((q) => q.status !== "open").sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 6);
  if (which === "stable") {
    const entries = [...arc.map((q) => ({ label: q.title, text: line(q) })), ...closed.map((q) => ({ label: q.title, text: line(q) }))];
    return withinBudget(entries, Math.floor(DOSSIER_BUDGETS.layer3.journal / 2), "Journal, the long lines (the main arc with its steps; the last closed quests, threads, debts and promises):");
  }
  const entries = open.map((q) => ({ label: q.title, text: line(q) }));
  return withinBudget(entries, DOSSIER_BUDGETS.layer3.journal, "Journal, open now (quests with their server-kept reward terms, open threads, debts and promises):");
}

function pinnedFacts(source: RuntimeSource): Budgeted {
  const pins = source.snapshot.campaign.pinned_facts ?? [];
  const entries = pins.map((pin) => ({ label: pin.id, text: `- ${pin.text}` }));
  return withinBudget(entries, DOSSIER_BUDGETS.layer3.pinned, "Owner-pinned facts (always true; the owner's word outranks everything but a later owner correction):");
}

const RESERVED_FACTS = new Set(["notebook", "notebook_session", "ledger", "variety", "metrics", "depth_state", TIME_CHECK_KEY, HIDDEN_LAYER_KEY]);
const serverKept = (_kind: string, key: string) => key.startsWith("quest_reward_") || key.startsWith("paid_grant_") || key.startsWith("holding_") || key.startsWith("plan_") || RESERVED_FACTS.has(key);
/** Fix run B1/B2: the owner's secrets and the hidden layer head the private notes and are never budget-dropped; the
 * notes follow in priority order (open clocks and consequences, open facts newest first, closed ones last) with their
 * validity, so a budget drops the closed notes first. */
function privateSecrets(source: RuntimeSource): Budgeted {
  const owner = ownerSecretsText(source);
  const layer = hiddenLayerOf(source);
  const head = [owner ? `The owner's own secrets (DM-only; build on them, never contradict them):\n${owner}` : "", layer].filter(Boolean).join("\n\n");
  const validity = (note: PrivateNote) => note.until !== null ? ` (closed — was true${note.since !== null ? ` from ${worldDay(note.since)}` : ""} until ${worldDay(note.until)})`
    : note.since !== null ? ` (since ${worldDay(note.since)})` : "";
  const entries = rankNotes(privateNotes(source.privateState, serverKept)).map((note) => ({ label: `${note.kind}:${note.key}`,
    text: `- ${note.kind} ${note.key}${validity(note)}: ${clipChars(note.text, 800)}` }));
  const notes = withinBudget(entries, memoryBudgets(source).secrets, "Private DM notes (never shown to the player; facts, clocks, consequences; set, advance or close them with note_world; recall finds closed and older ones):");
  return { text: [head, notes.text].filter(Boolean).join("\n\n"), dropped: notes.dropped, used: notes.used + (head ? estimateTokens(head) : 0) };
}
/** Fix run B2 (4): the memory gauge of the owner panel — the private notes against their budget. */
export function privateNotesGauge(source: RuntimeSource): { used: number; budget: number; notes: number; closed: number; dropped: number; hiddenLayer: boolean } {
  const all = privateNotes(source.privateState, serverKept);
  const result = privateSecrets(source);
  return { used: result.used, budget: memoryBudgets(source).secrets, notes: all.length, closed: all.filter((note) => note.until !== null).length,
    dropped: result.dropped.length, hiddenLayer: !!hiddenLayerOf(source) };
}

function offScreenPlans(source: RuntimeSource): Budgeted {
  const plans = allPlans(source.privateState).filter((plan) => plan.status === "open");
  const entries = plans.map((plan) => ({ label: plan.key, text: `- ${json({ key: plan.key,
    actor: plan.actorId ? source.snapshot.entities.find((e) => e.id === plan.actorId)?.name ?? plan.actorId : "the world",
    goal: clipChars(plan.goal, 600), due: worldDay(plan.dueWorldMinutes), consequence: plan.consequence, warning: plan.warning || null })}` }));
  return withinBudget(entries, DOSSIER_BUDGETS.layer3.plans, "Off-screen plans (private; the receipts of time passing list those that came due; resolve with note_world planStatus):");
}

function notebook(source: RuntimeSource): Budgeted {
  const facts = source.privateState.fact;
  const text = facts && typeof facts === "object" && !Array.isArray(facts) && typeof facts.notebook === "string" ? facts.notebook : "";
  if (!text.trim()) return { text: "", dropped: [], used: 0 };
  const clipped = clipTokens(text, DOSSIER_BUDGETS.layer3.notebook);
  return { text: `DM prep notebook (private; written between sessions — situations, not plot; ripe seeds; what engaged the player):\n${clipped}`,
    dropped: clipped === text ? [] : ["notebook tail"], used: estimateTokens(clipped) };
}

/** The likes note in two parts (polish item 15). Fix run A2: the player's own words (the wizard and the
 * owner's edits; the DM never rewrites them) are stable and travel in the cached world layer
 * (`ownerLikes`); the DM's own observations stay in the tail, newest last, and finish_turn playerLikes
 * appends to them — never rewrites them whole (item 71: a rewrite dropped the owner's DC rule). */
export function ownerLikes(source: RuntimeSource): string {
  const likes = (source.snapshot.campaign.player_likes ?? "").trim();
  const theme = (source.snapshot.campaign.theme ?? "").trim();
  return [likes ? `What the player asked for, in their own words (from the wizard and the owner's edits; theirs — never rewrite, always honour): ${clipChars(likes, 2000)}` : "",
    theme ? `Campaign theme question (return to it in different guises; never moralize, not in every scene): ${clipChars(theme, 400)}` : ""].filter(Boolean).join("\n");
}
function playerLikes(source: RuntimeSource): Budgeted {
  const observed = (source.snapshot.campaign.dm_likes ?? "").trim();
  // The newest observations when the notes are long (they are appended, newest last).
  const recent = observed.length > 1200 ? `…${observed.slice(-1200).replace(/^[^\n]*\n/, "")}` : observed;
  const text = recent ? `Your observations of what the player enjoys (newest last; finish_turn playerLikes appends a new line — the notes are never rewritten whole): ${recent}` : "";
  return { text, dropped: [], used: estimateTokens(text) };
}

function attentionLedger(source: RuntimeSource, ledger: AttentionLedger): Budgeted {
  const { snapshot } = source;
  const lines: string[] = [];
  const companions = Object.entries(ledger.companions).map(([id, since]) => ({ name: snapshot.entities.find((e) => e.id === id)?.name ?? null, since }))
    .filter((row): row is { name: string; since: number } => row.name !== null).sort((a, b) => b.since - a.since);
  if (companions.length) lines.push(`companions, sessions since last in focus: ${companions.map((row) => `${row.name} ${row.since}`).join("; ")}`);
  const threads = Object.entries(ledger.threads).map(([id, since]) => ({ title: snapshot.quests.find((q) => q.id === id && q.status === "open")?.title ?? null, since }))
    .filter((row): row is { title: string; since: number } => row.title !== null).sort((a, b) => b.since - a.since);
  if (threads.length) lines.push(`open threads, debts, promises and quests, sessions since last touched: ${threads.map((row) => `«${row.title}» ${row.since}`).join("; ")}`);
  if (!lines.length) return { text: "", dropped: [], used: 0 };
  const text = `Attention ledger (session ${ledger.session}; a story that has not sounded for a while deserves a scene — a hint, not a quota):\n- ${lines.join("\n- ")}`;
  return { text: clipTokens(text, DOSSIER_BUDGETS.layer3.ledger), dropped: [], used: Math.min(estimateTokens(text), DOSSIER_BUDGETS.layer3.ledger) };
}

function adventureGuidance(source: RuntimeSource): Budgeted {
  const context = source.adventureContext as { title?: string; premise?: string; pacing?: { kind?: string; custom?: string | null }; boundaries?: string[] } | undefined;
  if (!context?.title) return { text: "", dropped: [], used: 0 };
  const pacing = context.pacing?.kind ?? "open";
  const pace = { quick: "a quick adventure: one sitting, converge soon, few detours", evening: "an evening adventure: a few hours of play, a clear arc with room for one detour",
    mini_arc: "a mini arc: several sessions, several threads converging", open: "open play: no planned convergence", custom: context.pacing?.custom ?? "custom pacing" }[pacing] ?? pacing;
  // Fix run F (item 15): the owner writes his adventure's set-up here (who goes with the hero, the job, the places) —
  // the whole text reaches every turn while the adventure is active, and what it states is established.
  const premise = clipTokens((context.premise ?? "").trim(), DOSSIER_BUDGETS.layer3.adventure - 400);
  const text = `Active adventure «${context.title}» — the owner's set-up for it. What it states (the people, the places, who goes with the hero, the job) is established for this adventure; the pacing is guidance for density and convergence, never a timer or the player's decisions:\n${premise}\nPacing: ${pace}. Rewards: reward power follows the party's actual level and resources in the state; invent no reward power beyond what the world established; loot is what the place plausibly holds.`;
  return { text: clipTokens(text, DOSSIER_BUDGETS.layer3.adventure), dropped: [], used: Math.min(estimateTokens(text), DOSSIER_BUDGETS.layer3.adventure) };
}

type MemoryRow = { text: string; attribution: string | null; authority: string; unresolved: boolean };
const memoryLine = (row: MemoryRow) =>
  `- [${row.authority}${row.unresolved ? ", unresolved" : ""}${row.attribution ? `, ${row.attribution}` : ""}] ${row.text}`;
/** The campaign's chapters (polish item 22): the «Ранее в…» of the closed
 * sessions, newest first, written by the Stage 4 digest — the one memory of a
 * loop campaign, in place of the legacy summaries. Slow-moving, so cached. */
function sessionRecaps(source: RuntimeSource): Budgeted {
  const sessions = source.snapshot.sessions.filter((row) => row.status === "closed" && row.recap.trim())
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  const entries = sessions.map((row, index) => ({ label: `session ${row.title}`, text: `- ${index === 0 ? "(the last session) " : ""}«${row.title}»: ${clipChars(row.recap.trim(), 1200)}` }));
  return withinBudget(entries, DOSSIER_BUDGETS.layer3.memory, "Previous sessions («Ранее в…», newest first; what the player knows):");
}

/** Retrieved memory rows change with every turn and input: volatile layer. Polish 2 §4: a public row
 * that the history window already quotes verbatim is left out (the recent scenes travel once, cached). */
function memoryRecent(source: RuntimeSource, inWindow: Set<string> = new Set()): Budgeted {
  const memory = source.memory;
  if (!memory) return { text: "", dropped: [], used: 0 };
  const parts: string[] = [];
  const fold = (text: string) => text.replace(/\s+/g, " ").trim();
  const historical = memory.historical.filter((row) => !inWindow.has(fold(row.text)));
  if (historical.length) parts.push(`Retrieved memory (public, quoted; the recent scenes are above):\n${historical.map(memoryLine).join("\n")}`);
  if (memory.privateHistorical.length) parts.push(`Recent and retrieved private memory (DM-only):\n${memory.privateHistorical.map(memoryLine).join("\n")}`);
  if (memory.checkpoint) parts.push(`Resume point: ${json(memory.checkpoint.resume)}`);
  const text = parts.join("\n\n");
  const clipped = clipTokens(text, DOSSIER_BUDGETS.layer4.memory);
  return { text: clipped, dropped: clipped === text ? [] : ["retrieved memory tail"], used: estimateTokens(clipped) };
}

function varietyCounter(source: RuntimeSource, input: TurnInput): string {
  const recent = source.runtime.turns.filter((turn) => turn.status === "committed" && turn.id !== input.operationId && Array.isArray(turn.sceneKinds) && turn.sceneKinds.length)
    .slice(-12).map((turn) => turn.sceneKinds as string[]);
  if (!recent.length) return "";
  const all = ["combat", "conversation", "mystery", "exploration", "quiet", "humor", "trade", "travel"];
  const seen = new Set(recent.flat());
  const missing = all.filter((kind) => !seen.has(kind));
  const streak = (() => { let n = 0; const last = recent.at(-1)?.[0]; for (let i = recent.length - 1; i >= 0 && last && recent[i].includes(last); i--) n++; return { kind: last, n }; })();
  return `Variety counter (a hint, not a quota): last scenes ${recent.map((kinds) => kinds.join("+")).join(", ")}${streak.n >= 3 ? `; ${streak.n} ${streak.kind} scenes in a row — consider another kind` : ""}${missing.length ? `; not seen lately: ${missing.join(", ")}` : ""}.`;
}

/** Polish 2 §4: the conversation so far — the public scene rows (the player's lines, the narration,
 * the notes; the opening included) as append-only blocks, oldest first, within item 8's budget for
 * the scenes and the exchanges. A block's text never changes once written (a committed turn is
 * history), so the cache finds the prefix up to the previous turn at the block boundaries and each
 * turn writes only its own rows. When the window is full, the oldest rows leave in buckets of
 * HISTORY_BUCKET rows («компактно»; the wider presets slide in bigger buckets), not one per turn: one rewrite every
 * eight turns or so, instead of every turn. */
export const HISTORY_BUDGET = DOSSIER_BUDGETS.layer4.scenes + DOSSIER_BUDGETS.layer4.exchanges;
export const HISTORY_BUCKET = MEMORY_PRESETS.compact.bucket;
/** Fix run A2 (item 23): the budgets of the campaign's «Память ведущего» preset (the DM options). */
export function memoryBudgets(source: RuntimeSource) {
  return MEMORY_PRESETS[parseDmOptions(source.dmOptions).memory];
}
export function historyBudget(source: RuntimeSource): number {
  return memoryBudgets(source).history;
}
export function conversationHistory(source: RuntimeSource): { blocks: string[]; dropped: string[]; used: number; rows: number; bodies: string[] } {
  const HISTORY_BUDGET = historyBudget(source);
  const bucket = memoryBudgets(source).bucket;
  const rows = source.snapshot.scenes.map((row) => `[${row.role}] ${row.body}`);
  const bodies = source.snapshot.scenes.map((row) => row.body.replace(/\s+/g, " ").trim());
  const costs = rows.map((text) => estimateTokens(text) + 2);
  let start = rows.length, used = 0;
  while (start > 0 && used + costs[start - 1] <= HISTORY_BUDGET) { start--; used += costs[start]; }
  if (start > 0) {
    start = Math.min(rows.length, Math.ceil(start / bucket) * bucket);
    used = costs.slice(start).reduce((sum, cost) => sum + cost, 0);
  }
  const kept = rows.slice(start);
  if (!kept.length) return { blocks: [], dropped: start > 0 ? ["older scenes before the window"] : [], used: 0, rows: 0, bodies: [] };
  const blocks = kept.map((text, index) => (index === 0 ? `Recent scenes and exchanges (oldest first; the conversation so far, public):\n${text}` : text));
  return { blocks, dropped: start > 0 ? ["older scenes before the window"] : [], used, rows: kept.length, bodies: bodies.slice(start) };
}

function currentState(source: RuntimeSource, input: TurnInput): { text: string; dropped: string[] } {
  const { snapshot, runtime } = source;
  const config = runtime.configuration;
  const present = new Set(config?.presentEntityIds ?? []);
  const controlled = new Set(config?.controlledEntityIds ?? []);
  const place = snapshot.locations.find((row) => row.id === snapshot.publicState.current_location_id);
  // Fix run D (§1, §2): a wallet, never currency counters; counters with their names; the sheet of schema 2.
  const counters = (resources: Record<string, number>) => Object.fromEntries(Object.entries(resources).filter(([key]) => !key.startsWith("currency_")));
  const entities = snapshot.entities.filter((row) => row.kind !== "faction").map((row) => {
    const wallet = walletOfEntity(row);
    const labels = row.public_profile?.counterLabels;
    return { id: row.id, name: row.name, kind: row.kind,
      role: row.kind === "player" ? "hero" : controlled.has(row.id) ? "party" : undefined,
      present: present.has(row.id), hp: row.hp, maxHp: row.max_hp, stats: row.stats, resources: counters(row.resources),
      ...(Object.keys(wallet).length ? { wallet } : {}), ...(labels && Object.keys(labels).length ? { counterLabels: labels } : {}),
      conditions: row.conditions, slots: row.equipment_slots.map((slot) => slot.id), details: clipChars(row.details, 300),
      ...((row.kind === "player" || controlled.has(row.id)) && row.character_sheet ? { sheet: row.character_sheet } : {}) };
  });
  const factionRows = snapshot.entities.filter((row) => row.kind === "faction").map((row) => ({ id: row.id, name: row.name, kind: "faction" }));
  const items = snapshot.items.filter((row) => row.quantity > 0).map((row) => {
    const mech = itemMechanics(row);
    const detail = row.detail ?? {};
    return { id: row.id, name: row.name,
      category: row.category, quantity: row.quantity, owner: row.owner_entity_id, storage: row.storage_id,
      equipped: row.equipped_slot, ...(row.rarity ? { rarity: row.rarity } : {}), description: clipChars(row.description, 300), properties: clipChars(row.mechanics, 300),
      ...(mech.bonuses.length ? { bonuses: mech.bonuses } : {}), ...(mech.hands === 2 ? { hands: 2 } : {}), ...(mech.charges ? { charges: mech.charges } : {}),
      ...(mech.attunement ? { attunement: true } : {}), ...(detail.status ? { status: detail.status, holder: detail.holderId ?? null } : {}) };
  });
  const storages = snapshot.storages.map((row) => {
    const wallet = walletOfStorage(row);
    return { id: row.id, name: row.name, kind: row.kind, owner: row.entity_id, ...(row.detail?.holding ? { holding: row.detail.holding } : {}),
      ...(row.kind === "place" ? { place: row.detail?.locationId ?? null, here: row.detail?.locationId === place?.id } : {}),
      ...(Object.keys(wallet).length ? { wallet } : {}) };
  });
  // Fix run D (§5): the owner's own moves since the DM last touched those things (the owner's word wins).
  const ownerMoves = snapshot.items.filter((row) => row.quantity > 0 && (row.detail?.history ?? []).at(-1)?.event?.startsWith("owner_"))
    .map((row) => ({ at: row.detail!.history!.at(-1)!.at, line: `${row.name}: ${row.detail!.history!.at(-1)!.note}` }))
    .sort((a, b) => b.at - a.at).slice(0, 10).map((row) => row.line);
  const locations = snapshot.locations.map((row) => ({ id: row.id, name: row.name, status: row.status,
    current: row.id === place?.id, description: clipChars(row.description, 500), ...(row.detail?.questIds?.length ? { questIds: row.detail.questIds } : {}) }));
  const quests = snapshot.quests.filter((row) => row.status === "open").map((row) => ({ id: row.id, kind: row.kind ?? "quest", title: row.title }));
  const encounters = runtime.encounters.filter((row) => row.status !== "ended").map((row) => ({ id: row.id, status: row.status,
    round: row.round, summary: row.public_summary,
    participants: runtime.participants.filter((p) => p.encounter_id === row.id).map((p) => ({ entity: p.entity_id, name: p.public_name, position: p.public_position })) }));
  const state = { worldMinutes: runtime.worldMinutes, worldDay: worldDay(runtime.worldMinutes),
    timeOfDay: `${partOfDay(runtime.worldMinutes, snapshot.campaign.language === "ru" ? "ru" : "en")} (check every «morning / evening / since…» against this clock)`, currentPlace: place ? { id: place.id, name: place.name } : null,
    characters: entities, factions: factionRows, items, storages, ...(ownerMoves.length ? { ownerMovesSinceYouLastTouchedThem: ownerMoves } : {}),
    places: locations, openJournal: quests, activeEncounters: encounters,
    openRests: runtime.restRecords.filter((row) => row.status === "planned").map((row) => ({ id: row.id, kind: row.kind })) };
  // Polish 2 §4: the recent scenes and exchanges left this volatile block for the append-only history
  // (conversationHistory); «now» keeps only what changes — the state, the counters, the reminder.
  void input;
  return { text: `Current state (before this turn; IDs are the references tools accept):\n${json(state)}${snapshot.scenes.length ? "" : "\n\nThe campaign is just beginning: no scenes yet."}`, dropped: [] };
}

function rollMode(source: RuntimeSource): string {
  const values = source.snapshot.settings.values;
  const mode = values.dicePresentation === "hidden" ? "all rolls by the DM, hidden from the player"
    : values.dicePresentation === "all-player-rolls" ? "every player roll is shown to the player"
      : "important player rolls are shown to the player, the rest stay with the DM";
  return `Roll mode: ${mode}${values.interactiveDice ? "; interactive dice are on (a shown check pauses for the player)" : ""}${values.showDc ? "; DCs may be shown" : "; DCs stay hidden"}. Check frequency preference: ${values.checkFrequency}. Difficulty: ${values.difficulty.preset} (recovery ${values.difficulty.recovery}, defeat ${values.difficulty.defeat}).`;
}

/** Polish 3 §2: whose layer 1 the context carries — the game master of today's loop or the writer of the split. */
export type DmContextRole = "dm" | "writer";
export type DmLoopContext = {
  role: DmContextRole;
  system: DmSystemBlock[];
  /** The blocks by name (the bookkeeper's layers are built from the living part, the tail and «now»);
   * `tailBase` is the tail without this role's cards and the time line, for another role's own cards. */
  parts: { howToDm: string; world: string; history: string[]; living: string; tail: string; tailBase: string; now: string; timeLine: string };
  /** Polish 3 §7: the cards chosen for this turn (filtered by the role) and the whole library with triggers and roles. */
  craft: { selected: ContextCard[]; library: ContextCard[] };
  /** The player's literal input with its addressee, as the first user message. */
  user: string;
  cachedPrefixBytes: number;
  totalBytes: number;
  /** Estimated tokens per layer and what each budget dropped (stage task §1). */
  layers: DossierLayerReport[];
  /** The deterministic memory queries used for retrieval (plan §11). */
  memoryQuery: string;
};

/** Explicit memory queries, built before retrieval without a model call: the
 * input itself, the names of the scene's participants and of the people and
 * places it mentions, the titles of the open journal entries (plan §11). */
export function memoryQueryFor(source: RuntimeSource, input: TurnInput): string {
  const { snapshot, runtime } = source;
  const present = new Set(runtime.configuration?.presentEntityIds ?? []);
  const lower = input.input.toLocaleLowerCase();
  const names = new Set<string>();
  for (const row of snapshot.entities) {
    if (row.kind === "player") continue;
    if (present.has(row.id) || row.id === input.companionId || (row.name.length >= 3 && lower.includes(row.name.toLocaleLowerCase()))) names.add(row.name);
  }
  for (const row of snapshot.locations) if (row.name.length >= 3 && lower.includes(row.name.toLocaleLowerCase())) names.add(row.name);
  const place = snapshot.locations.find((row) => row.id === snapshot.publicState.current_location_id);
  if (place) names.add(place.name);
  const quests = snapshot.quests.filter((q) => q.status === "open").map((q) => q.title).slice(0, 8);
  const questions = [...names].slice(0, 12).map((name) => `What is known about ${name}?`);
  return [input.input, ...questions, ...quests.map((title) => `Open: ${title}`)].join("\n");
}

export function buildDmLoopContext(source: RuntimeSource, input: TurnInput, options: { role?: DmContextRole } = {}): DmLoopContext {
  const { snapshot } = source;
  const role: DmContextRole = options.role ?? "dm";
  const language = snapshot.settings.values.language === "ru" ? "Russian" : "English";
  const layers: DossierLayerReport[] = [];
  let craft: ReturnType<typeof pinnedCraftForStage> = null;
  try { craft = pinnedCraftForStage(source, input, "plan"); } catch { craft = null; }
  // Polish 3 §7: always-on stays short — layer 1 is the role, the turn shape, the voice slot, the
  // campaign language, the core doctrine and the style; the library is no longer listed whole. The
  // cards the selector chose for this turn (at most two, by the input's words and the public signal)
  // travel in the volatile tail, filtered by the role (the single loop takes every one).
  // Polish group 7 / voice stage: the voice part of layer 1 and the owner's «Образцы голоса» by the
  // campaign's examples mode (five diverse passages, stable per session; or the whole bank up to the
  // cap) — cached with the role. The replay's «off» variant leaves the whole slot out (`voiceLayerOff`).
  const voiceOptions = { tokenCap: source.voiceTokenCap, seed: snapshot.publicState.current_session_id ?? snapshot.campaign.id, layerOff: !!source.voiceLayerOff };
  const voiceMode = source.voiceMode ?? (source.voiceExamplesOn ? "five" : "off");
  const voice = voiceLayer(language, source.voiceSamples, voiceMode, voiceOptions);
  const examples = voiceExamplesBlock(source.voiceSamples, voiceOptions.layerOff ? "off" : voiceMode, voiceOptions);
  // Fix run B4: «Инструкции ведущего: русские» — the native Russian role, language line and headers for a Russian campaign.
  const ru = instructionsRu(source);
  const howToDm = [role === "writer" ? writerRoleText(ru) : dmRoleText(ru), role === "writer" ? writerTurnShape(language) : dmTurnShape(language), voice,
    ru ? campaignLanguageRu() : `Campaign language: ${language}. Narrate and voice characters in ${language}; keep established names in the campaign's spelling.`,
    craft?.doctrine ? `${ru ? DOCTRINE_HEADER_RU : "DM Craft — how to run (the owner's approved doctrine):"}\n${craft.doctrine.title}\n${craft.doctrine.guidance}\nAvoid: ${craft.doctrine.avoid}` : "",
    describeStyle((craft?.style ?? snapshot.settings.values.dmStyle ?? null) as Record<string, unknown> | null)].filter(Boolean).join("\n\n");
  layers.push({ layer: 1, budgetTokens: DOSSIER_BUDGETS.layer1 + (examples.mode === "all" ? Math.min(VOICE_TOKEN_CAP_MAX, Math.max(VOICE_TOKEN_CAP_MIN, source.voiceTokenCap ?? VOICE_TOKEN_CAP_DEFAULT)) : 0),
    usedTokens: estimateTokens(howToDm), dropped: examples.dropped ? [`voice examples: ${examples.dropped} passage(s) beyond the cap`] : [] });
  const selectedCards = (craft?.cards ?? []).filter((card) => cardForRole(card.role, role));
  const cardsText = craftCardsBlock(selectedCards);

  // Layer 2: the world.
  const guide = snapshot.documents.find((doc) => doc.id === snapshot.dmGuideDocumentId);
  const canon = snapshot.documents.filter((doc) => doc.status === "canon" && doc.id !== guide?.id);
  const reference = snapshot.documents.filter((doc) => doc.status === "reference" && doc.id !== guide?.id);
  const canonText = withinBudget(canon.map((doc) => ({ label: doc.title, text: `## ${doc.title}\n${clipTokens(doc.body, DOSSIER_BUDGETS.layer2.canon)}` })),
    DOSSIER_BUDGETS.layer2.canon, "Canon documents (established facts of this world):");
  const referenceText = withinBudget(reference.map((doc) => ({ label: doc.title, text: `## ${doc.title}\n${clipTokens(doc.body, Math.floor(DOSSIER_BUDGETS.layer2.reference / 2))}` })),
    DOSSIER_BUDGETS.layer2.reference, "Rules and reference knowledge (World Library; rules are knowledge, not code):");
  const guideText = guide?.body.trim() ? clipTokens(guide.body, DOSSIER_BUDGETS.layer2.guide) : "";
  const packet = source.worldTakeover ? clipTokens(json({ actors: source.worldTakeover.actors, policy: source.worldTakeover.policy, threads: source.worldTakeover.unresolvedThreads, recentEvents: source.worldTakeover.recentWorldEvents }), DOSSIER_BUDGETS.layer2.packet) : "";
  const likesText = ownerLikes(source);
  const world = [
    `Campaign: ${snapshot.campaign.title}${snapshot.campaign.subtitle ? ` — ${snapshot.campaign.subtitle}` : ""}.`,
    likesText,
    guideText ? `DM guide (owner's standing guidance for this campaign):\n${guideText}` : "",
    canonText.text, referenceText.text,
    packet ? `Historical world packet (reference evidence from the World Logic era; current structured state outranks it):\n${packet}` : "",
    rollMode(source),
  ].filter(Boolean).join("\n\n");
  const layer2Budget = DOSSIER_BUDGETS.layer2.guide + DOSSIER_BUDGETS.layer2.canon + DOSSIER_BUDGETS.layer2.reference + DOSSIER_BUDGETS.layer2.packet;
  layers.push({ layer: 2, budgetTokens: layer2Budget, usedTokens: estimateTokens(world), dropped: [...canonText.dropped, ...referenceText.dropped,
    ...(guide && guideText !== guide.body.trim() ? ["DM guide tail"] : [])] });

  // Layer 3: the dossier — the stable part (cached for an hour: it changes when a
  // person is met, a quest closes or a session ends) and the session's tail
  // (polish item 12: the models, the open journal, secrets, plans, likes and the
  // ledger change most turns, so they sit after the last breakpoint).
  const models = storedModels(source);
  const ledger = parseLedger(source.privateState);
  const stableParts = [partyInShort(source), codexOfPeople(source, input, models), factions(source), journal(source, "stable"), pinnedFacts(source),
    notebook(source), adventureGuidance(source), sessionRecaps(source)];
  const tailParts = [peopleModels(source, input, models), journal(source, "open"), privateSecrets(source), offScreenPlans(source),
    playerLikes(source), attentionLedger(source, ledger)];
  const living = stableParts.map((part) => part.text).filter(Boolean).join("\n\n")
    || "No dossier yet. Start it as the story needs: note_character for people who matter, note_world for secrets and plans, quest for the journal.";
  const tailBase = tailParts.map((part) => part.text).filter(Boolean).join("\n\n")
    || "This session's tail is empty so far: no Character Models, open journal entries, private notes or plans yet.";
  // Polish 3 §7: the cards chosen for this turn and the one line of the time-word check (nothing when it passed).
  // Voice stage part 5: the one line of the quotable-line check, when the last committed turn was flagged.
  const timeLine = timeCheckLine(source.privateState, snapshot.settings.values.language === "ru" ? "ru" : "en");
  const lastCommitted = source.runtime.turns.filter((turn) => turn.status === "committed" && turn.id !== input.operationId).at(-1)?.id ?? null;
  const quotable = voiceOptions.layerOff ? "" : quotableLine(source.voiceFlags, lastCommitted, snapshot.settings.values.language === "ru" ? "ru" : "en");
  const tail = [tailBase, cardsText, timeLine, quotable].filter(Boolean).join("\n\n");
  const memory = memoryBudgets(source);
  const stableBudget = DOSSIER_BUDGETS.layer3.party + memory.codex + DOSSIER_BUDGETS.layer3.factions + Math.floor(DOSSIER_BUDGETS.layer3.journal / 2) +
    DOSSIER_BUDGETS.layer3.pinned + DOSSIER_BUDGETS.layer3.notebook + DOSSIER_BUDGETS.layer3.adventure + DOSSIER_BUDGETS.layer3.memory;
  const tailBudget = memory.models + DOSSIER_BUDGETS.layer3.journal + memory.secrets + DOSSIER_BUDGETS.layer3.plans +
    DOSSIER_BUDGETS.layer3.likes + DOSSIER_BUDGETS.layer3.ledger;

  // Layer 6 (polish 2 §4): the conversation so far as append-only blocks, between the world and the
  // living dossier — a new turn only appends a block, so the cached prefix up to the previous turn
  // survives; the living dossier after it is small and rewritten each turn at the 5-minute rate,
  // where before it would have forced the whole history to be rewritten whenever a person was met.
  const history = conversationHistory(source);
  for (const [index, block] of history.blocks.entries())
    layers.push({ layer: 6, budgetTokens: historyBudget(source), usedTokens: estimateTokens(block), dropped: index === 0 ? history.dropped : [] });
  layers.push({ layer: 3, budgetTokens: stableBudget, usedTokens: estimateTokens(living), dropped: stableParts.flatMap((part) => part.dropped) });
  layers.push({ layer: 4, budgetTokens: tailBudget, usedTokens: estimateTokens(tail), dropped: tailParts.flatMap((part) => part.dropped) });

  // Layer 5: now — only what changes with the turn.
  const retrieved = memoryRecent(source, new Set(history.bodies));
  const state = currentState(source, input);
  // Voice stage part 4: the speech profiles of the people present next to the reminder, after the state.
  const now = [varietyCounter(source, input), retrieved.text, state.text, speechProfilesBlock(source, input, models, role), voiceReminder(language, { layerOff: voiceOptions.layerOff })].filter(Boolean).join("\n\n");
  layers.push({ layer: 5, budgetTokens: DOSSIER_BUDGETS.layer4.memory, usedTokens: estimateTokens(now), dropped: [...retrieved.dropped, ...state.dropped] });

  const addressee = input.mode === "companion" && input.companionId
    ? `The player speaks to ${snapshot.entities.find((e) => e.id === input.companionId)?.name ?? "a companion"} (${input.companionId})${input.listenerIds.length ? `; also listening: ${input.listenerIds.map((id) => snapshot.entities.find((e) => e.id === id)?.name ?? id).join(", ")}` : ""}. The companion answers in their own voice from what they know.`
    : "";
  const user = `${addressee ? `${addressee}\n\n` : ""}Player: ${input.input}`;
  const system: DmSystemBlock[] = [
    { text: howToDm, cache: true, ttl: "1h" },
    { text: world, cache: true, ttl: "1h" },
    ...history.blocks.map((text, index) => ({ text, cache: true, ttl: "1h" as const, breakpoint: index === history.blocks.length - 1 })),
    // The living dossier follows the history: rewritten each turn (the prefix before it grew). Fix run A2:
    // on Anthropic it carries no breakpoint of its own any more — the turn's request caches its whole
    // conversation (`cacheTurn`: the end of the messages and the end of the previous request), which
    // covers the living part, the tail and «now» for every continuation; OpenAI keeps it in its prefix.
    { text: living, cache: true, ttl: "5m", breakpoint: false },
    { text: tail, cache: false },
    { text: now, cache: false },
  ];
  const cachedPrefixBytes = bytes(howToDm) + bytes(world) + history.blocks.reduce((sum, text) => sum + bytes(text), 0) + bytes(living);
  const built: DmLoopContext = { role, system, parts: { howToDm, world, history: history.blocks, living, tail, tailBase, now, timeLine },
    craft: { selected: selectedCards, library: craft?.library ?? [] }, user, cachedPrefixBytes,
    totalBytes: cachedPrefixBytes + bytes(tail) + bytes(now) + bytes(user), layers, memoryQuery: memoryQueryFor(source, input) };
  return ru ? localizedContext(built) : built;
}

/** Fix run B4: the Russian instructions read Russian section headers — one pass over the built blocks (the same text
 * every turn, so the cached prefix stays byte-stable). */
export function instructionsRu(source: RuntimeSource): boolean {
  return source.snapshot.settings.values.language === "ru" && parseDmOptions(source.dmOptions).instructions === "ru";
}
const HEADER_PAIRS = Object.entries(HEADERS_RU).filter(([en]) => en !== "Avoid:").sort((a, b) => b[0].length - a[0].length);
export function localizeHeaders(text: string): string {
  let out = text;
  for (const [en, ru] of HEADER_PAIRS) if (out.includes(en)) out = out.split(en).join(ru);
  return out.split("\nAvoid: ").join(`\n${HEADERS_RU["Avoid:"]} `);
}
function localizedContext(context: DmLoopContext): DmLoopContext {
  const L = localizeHeaders;
  const parts = { ...context.parts, howToDm: L(context.parts.howToDm), world: L(context.parts.world), history: context.parts.history.map(L),
    living: L(context.parts.living), tail: L(context.parts.tail), tailBase: L(context.parts.tailBase), now: L(context.parts.now) };
  return { ...context, system: context.system.map((block) => ({ ...block, text: L(block.text) })), parts, user: L(context.user) };
}

/** Fix run A3 (item 75): the party council — one line to a companion — is a light call. Session 2's ran
 * a full turn (129k input tokens, 48 s, $0.30). The council reads only what a conversation needs: how to
 * DM (the same cached layer 1, so its cache is shared with the turns), and one small block with the
 * party, the speaker's and the listeners' Character Models, the scene (place, time, who is present), the
 * open journal's titles and the last exchanges verbatim. */
export const COUNCIL_HISTORY_TOKENS = 6000;
export function buildCouncilContext(source: RuntimeSource, input: TurnInput): DmLoopContext {
  const full = buildDmLoopContext(source, input);
  const { snapshot, runtime } = source;
  const models = storedModels(source);
  const speaker = snapshot.entities.find((row) => row.id === input.companionId) ?? null;
  const listeners = input.listenerIds.map((id) => snapshot.entities.find((row) => row.id === id)).filter((row): row is Entity => !!row && row.kind !== "player");
  const place = snapshot.locations.find((row) => row.id === snapshot.publicState.current_location_id);
  const present = new Set(runtime.configuration?.presentEntityIds ?? []);
  const party = partyInShort(source);
  const people = [speaker, ...listeners].filter((row): row is Entity => !!row).map((row) => {
    const model = models.get(row.id);
    return `- ${row.name} (${row.id}${row.id === speaker?.id ? ", speaks" : ", listens"}): ${clipChars(row.details, 400)}${model ? `\n  model: ${modelText(snapshot, model)}` : ""}`;
  });
  const rows = snapshot.scenes.map((row) => `[${row.role}] ${row.body}`);
  const recent: string[] = [];
  let used = 0;
  for (let at = rows.length - 1; at >= 0; at--) {
    const cost = estimateTokens(rows[at]) + 2;
    if (used + cost > COUNCIL_HISTORY_TOKENS) break;
    recent.unshift(rows[at]);
    used += cost;
  }
  const journalTitles = snapshot.quests.filter((row) => row.status === "open").map((row) => `${row.kind ?? "quest"}: ${row.title}`).slice(0, 12);
  // Fix run B4: the council's own lines in Russian with «Инструкции ведущего: русские».
  const ru = instructionsRu(source);
  const presentNames = snapshot.entities.filter((row) => present.has(row.id)).map((row) => row.name).join(", ");
  const sceneLine = ru
    ? `Сцена: ${place ? `${place.name}. ` : ""}${worldDay(runtime.worldMinutes)}, ${partOfDay(runtime.worldMinutes, "ru")}. Здесь: ${presentNames || "отряд"}.`
    : `The scene: ${place ? `${place.name}. ` : ""}${worldDay(runtime.worldMinutes)}, ${partOfDay(runtime.worldMinutes, snapshot.campaign.language === "ru" ? "ru" : "en")}. Present: ${presentNames || "the party"}.`;
  const councilText = [
    ru ? "Совет отряда: герой говорит со спутником между ходами истории. Отвечай за спутника его голосом, из того, что он знает и чего хочет; один обмен репликами; слушатели вставляют слово, когда это их дело. Больше ничего не рассказывай: ни новых событий, ни бросков; запиши только то, что изменил разговор (note_character, note_world), и минуты, которые он занял (advance_time), потом finish_turn."
      : `Party council: the hero speaks with a companion between the story's turns. Answer as the companion, in their own voice, from what they know and want; one exchange; the listeners may add a line when it is theirs to say. Narrate nothing else: no new events, no rolls; record only what the talk changed (note_character, note_world) and the minutes it took (advance_time), then finish_turn.`,
    party.text,
    people.length ? `The people in this talk (their private Character Models — what they know, want and hide):\n${people.join("\n")}` : "",
    sceneLine,
    journalTitles.length ? `${ru ? "Открытый журнал (заголовки)" : "Open journal (titles)"}: ${journalTitles.join("; ")}` : "",
    recent.length ? `The last exchanges, verbatim (oldest first):\n${recent.join("\n")}` : "",
    speechProfilesBlock(source, input, models),
  ].filter(Boolean).join("\n\n");
  const council = ru ? localizeHeaders(councilText) : councilText;
  const system: DmSystemBlock[] = [{ text: full.parts.howToDm, cache: true, ttl: "1h" }, { text: council, cache: false }];
  const layers: DossierLayerReport[] = [full.layers[0], { layer: 7, budgetTokens: COUNCIL_HISTORY_TOKENS + DOSSIER_BUDGETS.layer3.party + 8000, usedTokens: estimateTokens(council), dropped: [] }];
  const cachedPrefixBytes = bytes(full.parts.howToDm);
  return { ...full, system, layers, cachedPrefixBytes, totalBytes: cachedPrefixBytes + bytes(council) + bytes(full.user),
    parts: { ...full.parts, world: "", history: [], living: "", tail: council, tailBase: council, now: "" } };
}

/** The tools of the party council: notes and time, then the close (fix run A3). */
export const COUNCIL_TOOLS = ["note_character", "note_world", "advance_time", "finish_turn"] as const;

/** Private strings (12+ characters) that appear literally in a public text and
 * are not themselves public. A diagnostic, never a turn failure (stage task §5).
 * Stage 4 (§6): a hit whose private source is a Character Model of a character
 * present in the scene, voiced in dialogue, is reported as a self-disclosure —
 * an NPC revealing their own information in character is play, not a leak. */
export function suspectedLiteralLeaks(source: RuntimeSource, input: TurnInput, publicText: string): { leaks: string[]; selfDisclosures: string[] } {
  const privateValues = new Map<string, "model" | "note">();
  const publicValues = new Set<string>([input.input]);
  const collect = (value: unknown, into: (text: string) => void, depth = 0) => {
    if (depth > 20 || value === null || value === undefined) return;
    if (typeof value === "string") {
      into(value);
      if (/^[[{]/.test(value.trim())) { try { collect(JSON.parse(value), into, depth + 1); } catch { /* prose */ } }
    } else if (Array.isArray(value)) value.forEach((child) => collect(child, into, depth + 1));
    else if (typeof value === "object") Object.values(value as JsonObject).forEach((child) => collect(child, into, depth + 1));
  };
  const presentModels = new Set((source.runtime.configuration?.presentEntityIds ?? []).map((id) => `character_${id}`));
  for (const [kind, bucket] of Object.entries(source.privateState)) {
    if (!bucket || typeof bucket !== "object" || Array.isArray(bucket)) continue;
    for (const [key, value] of Object.entries(bucket as JsonObject)) {
      const origin = kind === "npc" && presentModels.has(key) ? "model" : "note";
      collect(value, (text) => { if (!privateValues.has(text) || origin === "note") privateValues.set(text, origin); });
    }
  }
  collect(source.memory?.privateHistorical, (text) => privateValues.set(text, "note"));
  collect(source.memory?.privateSummary?.entries, (text) => privateValues.set(text, "note"));
  const addPublic = (text: string) => publicValues.add(text);
  collect(source.snapshot.entities.map((row) => ({ name: row.name, details: row.details })), addPublic);
  collect(source.snapshot.items.map((row) => ({ name: row.name, description: row.description, mechanics: row.mechanics })), addPublic);
  collect(source.snapshot.locations, addPublic);
  collect(source.snapshot.quests, addPublic);
  collect(source.snapshot.documents.map((doc) => doc.body), addPublic);
  collect(source.snapshot.scenes.map((scene) => scene.body), addPublic);
  const knownPublic = [...publicValues].join("\n").toLocaleLowerCase();
  const lower = publicText.toLocaleLowerCase();
  const leaks: string[] = [];
  const selfDisclosures: string[] = [];
  for (const [secret, origin] of privateValues) {
    const text = secret.trim();
    // Short words and enum values (such as a stress level) are not secrets.
    if (text.length < 12 || /^[a-z_]+$/.test(text)) continue;
    const needle = text.toLocaleLowerCase();
    if (knownPublic.includes(needle) || !lower.includes(needle)) continue;
    const at = lower.indexOf(needle);
    // Inside quoted speech (« », " ", or a dash line) and from a present character's model: the character said it.
    const before = lower.slice(Math.max(0, at - 400), at);
    const quoted = /[«"“]/.test(before) && (before.split(/[«"“]/).length - 1) > (before.split(/[»"”]/).length - 1) || /(^|\n)\s*[—–-]\s[^\n]*$/.test(before);
    (origin === "model" && quoted ? selfDisclosures : leaks).push(text.slice(0, 80));
  }
  return { leaks, selfDisclosures };
}
