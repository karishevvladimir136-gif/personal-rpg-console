// Multi-hero 1: the measures the stage builds in (item 6, A2) and the mechanical readings of A1, A4 and A7's rotation —
// pure functions over a table's record, reported every table from here on.
//   - Narration shares: each DM narration split into sentences; a sentence's words count for the player characters it
//     names (full or first name), shared equally when it names several; a sentence that names none but opens with
//     he/she/his/her/him/they right after a sentence naming exactly one counts for that one; the rest is the world's.
//   - «You» per screen: the share of you/your/yours/yourself/yourselves among a screen's words, per seat.
import { CHARACTERS } from "./sheets.mjs";
import { HERO_WORD, SHINGLE } from "./frozen.mjs";

const words = (text) => String(text ?? "").split(/[^\p{L}\p{N}'’-]+/u).filter(Boolean);
const sentences = (text) => String(text ?? "").replace(/\s+/g, " ").split(/(?<=[.!?…»"”])\s+(?=[A-Z«"“(—–-])/u).filter((s) => s.trim());
const PRONOUN = /^\W*(he|she|his|her|him|they|their|them)\b/i;
const namesIn = (sentence, people) => people.filter((c) => new RegExp(`\\b(?:${c.name}|${c.short})\\b`).test(sentence)).map((c) => c.name);

/** Words of one narration per character: { [name]: words, world: words }. */
export function narrationWords(text, people = CHARACTERS) {
  const out = Object.fromEntries([...people.map((c) => [c.name, 0]), ["world", 0]]);
  let last = [];
  for (const sentence of sentences(text)) {
    const n = words(sentence).length;
    let named = namesIn(sentence, people);
    if (!named.length && last.length === 1 && PRONOUN.test(sentence)) named = last;
    if (named.length) for (const name of named) out[name] += n / named.length;
    else out.world += n;
    last = namesIn(sentence, people).length ? namesIn(sentence, people) : named.length === 1 ? named : [];
  }
  return out;
}

/** The table's narration shares (A2): every scene's narration of every round (the opening apart). */
export function narrationShares(record, people = CHARACTERS) {
  const total = Object.fromEntries([...people.map((c) => [c.name, 0]), ["world", 0]]);
  const perRound = [];
  for (const round of record.table?.rounds ?? []) {
    const r = Object.fromEntries([...people.map((c) => [c.name, 0]), ["world", 0]]);
    for (const scene of round.scenes ?? []) for (const [k, v] of Object.entries(narrationWords(scene.narration ?? "", people))) { r[k] += v; total[k] += v; }
    perRound.push({ n: round.n, ...Object.fromEntries(Object.entries(r).map(([k, v]) => [k, Math.round(v)])) });
  }
  const counted = people.reduce((sum, c) => sum + total[c.name], 0);
  const shares = Object.fromEntries(people.map((c) => [c.name, counted ? total[c.name] / counted : null]));
  const values = Object.values(shares).filter((v) => v !== null);
  const spread = values.length ? Math.max(...values) - Math.min(...values) : null;
  const max = values.length ? Math.max(...values) : null;
  return { words: Object.fromEntries(Object.entries(total).map(([k, v]) => [k, Math.round(v)])), shares, spread, max, perRound,
    a2: values.length === people.length ? spread <= 0.10 + 1e-9 && max <= 0.45 + 1e-9 : null };
}

const YOU = /^(?:you|your|yours|yourself|yourselves)$/i;
/** «You» per screen, per seat: every screen a seat read in play (the after-questions apart). */
export function youShares(record) {
  const out = {};
  for (const seat of record.table?.seats ?? []) {
    const screens = (seat.screens ?? []).filter((x) => !/^after/.test(x.purpose ?? ""));
    const per = screens.map((x) => { const w = words(x.text); return { round: x.round, purpose: x.purpose, words: w.length, you: w.filter((t) => YOU.test(t.replace(/[’']s$/, ""))).length }; });
    const shares = per.filter((x) => x.words).map((x) => x.you / x.words);
    out[seat.character] = { screens: per.length, mean: shares.length ? shares.reduce((a, b) => a + b, 0) / shares.length : null,
      you: per.reduce((a, x) => a + x.you, 0), words: per.reduce((a, x) => a + x.words, 0) };
  }
  return out;
}

/** The order each round's scenes went to the DM (A7's rotation, by the record). */
export function roundOrders(record) {
  return (record.table?.rounds ?? []).map((round) => ({ n: round.n, scenes: (round.scenes ?? []).map((scene) => scene.order) }));
}

/** A4 by the record: the relay's copied runs, first answer and final; the waiting rounds with their lines. */
export function paraphraseCheck(record) {
  const copied = [], after = [], waiting = [];
  for (const round of record.table?.rounds ?? []) for (const scene of round.scenes ?? []) {
    for (const h of scene.relay?.copied ?? []) copied.push({ round: round.n, ...h });
    for (const h of scene.relay?.copiedAfter ?? []) after.push({ round: round.n, ...h });
    for (const m of scene.messages ?? []) if (m.kind === "waiting") waiting.push({ round: round.n, name: m.name, line: m.text });
  }
  return { shingle: SHINGLE, copiedFirst: copied, copiedFinal: after, waiting, holds: after.length === 0 };
}

/**
 * A1 in a live run: every DM request body the run sent (the turns, the out-of-game answers, the prep, the opening, the
 * digest; `requests`: [{ purpose, body }]), read for «hero». A hit inside the story's own words (a player's message or
 * the history: text that is in the record's messages or narrations) is listed as the story's; any other hit is the
 * frame's and loses A1. The wizard's draft of the first record is reported apart.
 */
export function heroAudit(requests, record) {
  const story = [
    ...(record.table?.seats ?? []).flatMap((seat) => (seat.messages ?? []).map((m) => m.text ?? "")),
    ...(record.table?.rounds ?? []).flatMap((round) => (round.scenes ?? []).flatMap((scene) => [scene.narration ?? "", scene.input ?? "", ...(scene.messages ?? []).map((m) => m.text ?? "")])),
    record.table?.opening?.narration ?? "",
  ].map((x) => x.trim()).filter((x) => x.length >= 12).sort((a, b) => b.length - a.length);
  const out = { requests: requests.filter((r) => !/wizard|creation/.test(r.purpose)).length, frame: [], story: [], wizard: [] };
  const hits = (text) => [...text.matchAll(new RegExp(HERO_WORD.source, "gi"))].map((m) => text.slice(Math.max(0, m.index - 60), m.index + 60).replace(/\s+/g, " "));
  for (const { purpose, text } of requests) {
    if (/wizard|creation/.test(purpose)) { out.wizard.push(...hits(text).map((around) => ({ purpose, around }))); continue; }
    // The story's own words (a player's message, a narration, a round as the DM received it) are taken out first; what
    // still says «hero» is the frame's.
    let rest = text;
    for (const s of story) if (rest.includes(s)) rest = rest.split(s).join(" ");
    const frame = hits(rest), all = hits(text);
    out.frame.push(...frame.map((around) => ({ purpose, around })));
    out.story.push(...all.slice(0, Math.max(0, all.length - frame.length)).map((around) => ({ purpose, around })));
  }
  out.holds = out.frame.length === 0;
  return out;
}
