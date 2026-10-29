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

/**
 * Fix A2 (the amendment of 2026-10-29 02:30 LA): who comes first in what the DM reads. `inputs`: the table's DM
 * requests ([{ kind, round, text }]: round 0 is the table's opening; `text` is what the request reads outside the
 * story's own words — run.mjs `frameText`). Each input's first is the character named first in it (full or first name).
 * Per round, the first of most of its inputs; per seat, the rounds and the share of inputs it came first in. Holds when
 * every seat came first in a third of the rounds, give or take one round.
 */
export function firstInInputs(inputs, people = CHARACTERS) {
  const firstOf = (text) => {
    let best = null;
    for (const c of people) {
      const at = String(text ?? "").search(new RegExp(`\\b(?:${c.name}|${c.short})\\b`));
      if (at >= 0 && (best === null || at < best.at)) best = { at, name: c.name };
    }
    return best?.name ?? null;
  };
  const rows = inputs.map((x) => ({ kind: x.kind, round: x.round, first: firstOf(x.text) }));
  const rounds = [...new Set(rows.filter((x) => x.round > 0).map((x) => x.round))].sort((a, b) => a - b).map((n) => {
    const firsts = Object.fromEntries(people.map((c) => [c.name, rows.filter((x) => x.round === n && x.first === c.name).length]));
    const top = Object.entries(firsts).sort((a, b) => b[1] - a[1])[0];
    return { n, inputs: rows.filter((x) => x.round === n).length, firsts, first: top && top[1] > 0 ? top[0] : null, agree: Object.values(firsts).filter((k) => k > 0).length <= 1 };
  });
  const named = rows.filter((x) => x.first);
  const perSeat = Object.fromEntries(people.map((c) => [c.name, { rounds: rounds.filter((r) => r.first === c.name).length,
    inputs: named.filter((x) => x.first === c.name).length, share: named.length ? named.filter((x) => x.first === c.name).length / named.length : null }]));
  const third = rounds.length / people.length;
  return { inputs: rows, rounds, perSeat, opening: rows.find((x) => x.round === 0)?.first ?? null,
    holds: rounds.length ? Object.values(perSeat).every((x) => Math.abs(x.rounds - third) <= 1 + 1e-9) : null };
}

/** The order each round's scenes went to the DM (A7's rotation, by the record). */
export function roundOrders(record) {
  return (record.table?.rounds ?? []).map((round) => ({ n: round.n, scenes: (round.scenes ?? []).map((scene) => scene.order) }));
}

/** A4 by the record: the relay's copied runs in its first pass and in what went out; fix A4's resends (each copying
 * screen sent back once, alone) and the defects logged (a copy that remained); the waiting rounds with their lines.
 * Holds when no defect was logged. */
export function paraphraseCheck(record) {
  const copied = [], after = [], waiting = [], resent = [], defects = [];
  for (const round of record.table?.rounds ?? []) for (const scene of round.scenes ?? []) {
    // The scene's relay and the relays at its cards (the narration told at a card, retold for its player).
    for (const r of [scene.relay, ...(scene.cards ?? []).flatMap((c) => c.relays ?? [])].filter(Boolean)) {
      for (const h of r.copied ?? []) copied.push({ round: round.n, ...h });
      for (const h of r.copiedAfter ?? []) after.push({ round: round.n, ...h });
      for (const x of r.resent ?? []) resent.push({ round: round.n, ...x });
      for (const h of r.defects ?? []) defects.push({ round: round.n, ...h });
    }
    for (const m of scene.messages ?? []) if (m.kind === "waiting") waiting.push({ round: round.n, name: m.name, line: m.text });
  }
  return { shingle: SHINGLE, copiedFirst: copied, copiedFinal: after, resent, defects, waiting, holds: defects.length === 0 && after.length === 0 };
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
