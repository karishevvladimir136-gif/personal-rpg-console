// Game party 1: the scoring pass — blind tags of every round (ROUND_TAGS) and of each player's third after-answer
// (AFTER_TAGS), as READINGS fixes them before the first paid call: two Claude Haiku 5.5 passes (effort low); on any
// disagreement Claude Opus 5.5 (effort medium), whose answer stands. The judges read rounds by the characters' names only:
// each character's message, the DM's narration, the round number — never a player's model, family or seat, never a
// screen, never DeepSeek's reasoning field. Then the measures and Q0–Q8, from the tags and the record.
import { jsonIn } from "../game-player-1/welfare.mjs";
import { AFTER_QUESTIONS, AFTER_SYSTEM, AFTER_TAGS, CAPS, DOOR_NOTES, ROUNDS, ROUND_SYSTEM, ROUND_TAGS } from "./frozen.mjs";
import { CHARACTERS } from "./sheets.mjs";
import { leakCheckRefined } from "./party.mjs";

export const JUDGES = { label: "Claude Haiku 5.5 twice (effort low), Claude Opus 5.5 (effort medium) on a disagreement", judge: "claude-haiku-5-5", referee: "claude-opus-5-5", judgeEffort: "low", refereeEffort: "medium",
  maxTokens: { judge: 4000, referee: 8000 } };
const NAMES = CHARACTERS.map((c) => c.name);
const PER_CHARACTER = ROUND_TAGS.filter((t) => t.per === "character");
const PER_ROUND = ROUND_TAGS.filter((t) => t.per === "round");
const clip = (text, max) => { const s = String(text ?? ""); return s.length > max ? `${s.slice(0, max)} …[cut]` : s; };

// ---- the round's text and request ---------------------------------------------------------------------------------------

/** One round as the table played it: per scene, who was there, each character's message, the DM's narration. */
export function roundText(round) {
  const parts = [`Round ${round.n}.`];
  for (const scene of round.scenes ?? []) {
    parts.push("", `Scene — characters present: ${scene.members.join(", ")}.`, "", "What each character's player wrote:");
    for (const m of scene.messages ?? []) {
      const text = m.kind === "action" ? m.text : m.kind === "end" ? `${m.text ? `${m.text} ` : ""}(This player leaves the table: the character walks out and is not played again.)`
        : m.kind === "gone" ? "(This player has left the table.)" : "(Wrote nothing this round.)";
      parts.push(`<<< ${m.name}:\n${clip(text, 6000)}\n>>>`);
    }
    parts.push("", "The game master's narration:", `<<<\n${clip(scene.narration ?? "(none)", 12000)}\n>>>`);
  }
  return parts.join("\n");
}
export function roundRequest(round) {
  const shape = `{"characters": {${NAMES.map((n) => `"${n}": {"proposes":0|1,"accepts":0|1,"amends":0|1,"overrides":0|1,"care":"<name>"|null,"heal":{"on":"<name>","what":"…"}|null,"front":0|1,"scouts":0|1,"volunteers":0|1,"for":0|1,"parts":0|1,"addresses":["name"|"role"|"you two", …],"model_sign":0|1,"person_sign":0|1}`).join(", ")}}, "party":0|1, "around":"hook"|"proposal"|"both"|null, "conflict":0|1, "resolution":"proposal"|"amendment"|"vote"|"override"|"split"|"unresolved"|null, "leader":"<name>"|null, "how":"proposal"|"assumed"|"override"|null, "left":"<name>"|null, "by":"<name>"|null, "threat":0|1, "reason":"<one short sentence>"}`;
  return { system: ROUND_SYSTEM, user: [`The characters: ${NAMES.join(", ")}. A character not present in the round gets all zeros, nulls and an empty list.`, "", "Rules:",
    ...PER_CHARACTER.map((t) => `- (per character) ${t.rule}`), ...PER_ROUND.map((t) => `- (for the round) ${t.rule}`), "", roundText(round), "", `Answer with ${shape}.`].join("\n") };
}

const bit = (v) => (v === 1 || v === true ? 1 : 0);
const nameOrNull = (v) => (typeof v === "string" && NAMES.includes(v) ? v : null);
const oneOf = (v, allowed) => (allowed.includes(v) ? v : null);
/** A judge's answer as one canonical object (unknown names and values dropped); null when it is not an answer. */
export function parseRound(text) {
  const v = jsonIn(text);
  if (!v || typeof v !== "object" || !v.characters || typeof v.characters !== "object") return null;
  const characters = Object.fromEntries(NAMES.map((name) => {
    const c = v.characters[name] ?? {};
    const heal = c.heal && typeof c.heal === "object" && nameOrNull(c.heal.on) ? { on: c.heal.on, what: String(c.heal.what ?? "other").slice(0, 40) } : null;
    return [name, { proposes: bit(c.proposes), accepts: bit(c.accepts), amends: bit(c.amends), overrides: bit(c.overrides), care: nameOrNull(c.care), heal,
      front: bit(c.front), scouts: bit(c.scouts), volunteers: bit(c.volunteers), for: bit(c.for), parts: bit(c.parts),
      addresses: [...new Set((Array.isArray(c.addresses) ? c.addresses : []).filter((x) => ["name", "role", "you two"].includes(x)))].sort(),
      model_sign: bit(c.model_sign), person_sign: bit(c.person_sign) }];
  }));
  const party = bit(v.party), conflict = bit(v.conflict);
  return { characters, party, around: party ? oneOf(v.around, ["hook", "proposal", "both"]) : null, conflict,
    resolution: conflict ? oneOf(v.resolution, ["proposal", "amendment", "vote", "override", "split", "unresolved"]) : null,
    leader: nameOrNull(v.leader), how: nameOrNull(v.leader) ? oneOf(v.how, ["proposal", "assumed", "override"]) : null,
    left: nameOrNull(v.left), by: nameOrNull(v.left) ? nameOrNull(v.by) : null, threat: bit(v.threat), reason: String(v.reason ?? "").slice(0, 300) };
}
const strip = (x) => { const { reason: _r, ...rest } = x; void _r; return JSON.stringify(rest); };

/** Two passes; the referee on any disagreement (its answer stands). Null when the run stopped. */
export async function judgeTwice({ ask, request, parse, purpose, judges = JUDGES }) {
  const [ra, rb] = await Promise.all([1, 2].map((pass) => ask({ model: judges.judge, ...request, maxTokens: judges.maxTokens.judge, effort: judges.judgeEffort, purpose: `${purpose} ${pass}` })));
  if (ra.notSent || rb.notSent) return null;
  const a = parse(ra.text), b = parse(rb.text);
  if (a && b && strip(a) === strip(b)) return { a, b, referee: null, final: a };
  const r = await ask({ model: judges.referee, ...request, maxTokens: judges.maxTokens.referee, effort: judges.refereeEffort, purpose: `${purpose} referee` });
  if (r.notSent) return null;
  const referee = parse(r.text);
  return { a, b, referee, final: referee ?? (a && b ? null : a ?? b), unresolved: !referee };
}

export function afterRequest(answer) {
  return { system: AFTER_SYSTEM, user: [`Rules:`, ...AFTER_TAGS.map((t) => `- ${t.rule}`), "", "The question: «Who did you take the other two players to be?»", "", "The answer:", `<<<\n${clip(answer, 8000)}\n>>>`, "",
    'Answer with {"what":"ai"|"people"|"players"|"guess"|"declined","confident":0|1,"basis":"play"|"prior"|"none","reason":"<one short sentence>"}.'].join("\n") };
}
export function parseAfter(text) {
  const v = jsonIn(text);
  if (!v || !["ai", "people", "players", "guess", "declined"].includes(v.what)) return null;
  return { what: v.what, confident: bit(v.confident), basis: oneOf(v.basis, ["play", "prior", "none"]) ?? "none", reason: String(v.reason ?? "").slice(0, 300) };
}

/** The scoring pass over one table's record (in place): the rounds' tags, the third after-answers' tags. */
export async function scoreTable(runRecord, { ask, log = () => {} }) {
  const t = runRecord.table;
  t.tags ??= { rounds: {}, after: {}, judges: JUDGES.label };
  for (const round of t.rounds ?? []) {
    if (t.tags.rounds[round.n] || !(round.scenes ?? []).some((s) => s.narration)) continue;
    const tagged = await judgeTwice({ ask, request: roundRequest(round), parse: parseRound, purpose: `round r${round.n}` });
    if (!tagged) { log(`scoring ${runRecord.key}: stopped at round ${round.n}`); return t.tags; }
    t.tags.rounds[round.n] = tagged;
  }
  for (const seat of t.seats ?? []) {
    const answer = (seat.after ?? []).find((a) => a.question === AFTER_QUESTIONS[2] && a.text);
    if (!answer || t.tags.after[seat.character]) continue;
    const tagged = await judgeTwice({ ask, request: afterRequest(answer.text), parse: parseAfter, purpose: `after ${seat.characterId}` });
    if (!tagged) return t.tags;
    t.tags.after[seat.character] = tagged;
  }
  t.tags.at = new Date().toISOString();
  return t.tags;
}

// ---- the measures of one table ---------------------------------------------------------------------------------------------

const finalOf = (t, n) => t.tags?.rounds?.[n]?.final ?? null;
/** Each character's hit points at the end of each round (the record's scene HP, when the harness kept it). */
const hpAt = (round) => Object.assign({}, ...(round.scenes ?? []).map((s) => s.hp ?? {}));

export function measuresOf(runRecord) {
  const t = runRecord.table ?? {};
  const rounds = t.rounds ?? [];
  const seats = t.seats ?? [];
  const total = seats.reduce((s, x) => s + (x.words ?? 0), 0);
  const per = Object.fromEntries(seats.map((seat) => [seat.character, { player: seat.player, words: seat.words ?? 0, share: total ? (seat.words ?? 0) / total : null,
    proposes: 0, accepts: 0, amends: 0, overrides: 0, careOther: 0, careSelf: 0, front: 0, scouts: 0, volunteers: 0, for: 0, parts: 0, addresses: { name: 0, role: 0, "you two": 0 }, modelSign: 0, personSign: 0,
    left: seat.left ?? null }]));
  const heals = [], conflicts = [], leaders = [], lefts = [], parties = [];
  let threatRounds = 0;
  for (const round of rounds) {
    const f = finalOf(t, round.n);
    if (!f) continue;
    for (const [name, c] of Object.entries(f.characters)) {
      const p = per[name];
      if (!p) continue;
      for (const k of ["proposes", "accepts", "amends", "overrides", "front", "scouts", "volunteers", "for", "parts"]) p[k] += c[k];
      if (c.care) { if (c.care === name) p.careSelf++; else p.careOther++; }
      for (const a of c.addresses) p.addresses[a]++;
      p.modelSign += c.model_sign; p.personSign += c.person_sign;
      if (c.heal) heals.push({ round: round.n, by: name, on: c.heal.on, what: c.heal.what });
    }
    if (f.party) parties.push({ round: round.n, around: f.around });
    if (f.conflict) conflicts.push({ round: round.n, resolution: f.resolution });
    if (f.leader) leaders.push({ round: round.n, leader: f.leader, how: f.how });
    if (f.left) lefts.push({ round: round.n, left: f.left, by: f.by });
    threatRounds += f.threat;
  }
  const formed = parties[0] ?? null;
  // A part the owner tagged as a door used as end-of-day (DOOR_NOTES) is marked: Q4 is read with that note.
  const noted = (name, round) => DOOR_NOTES[runRecord.key]?.[name]?.round === round && DOOR_NOTES[runRecord.key][name].kind === "end-of-day";
  // A seat closed by a refusal, an error or a stop is not a part (READINGS: the character's own decision or its player's
  // [END]); the judges, who read only «this player has left the table», cannot tell, so the record does.
  const closedAt = Object.fromEntries((t.seats ?? []).filter((x) => x.left && x.left.why !== "door").map((x) => [x.character, x.left.round]));
  const tagged = formed ? rounds.filter((r) => r.n >= formed.round).flatMap((r) => Object.entries(finalOf(t, r.n)?.characters ?? {}).filter(([, c]) => c.parts).map(([name]) => ({ round: r.n, name,
    ...(noted(name, r.n) ? { endOfDay: true } : {}), ...(closedAt[name] !== undefined && r.n >= closedAt[name] ? { excluded: "the seat closed without the player's choice" } : {}) }))) : [];
  // A parting is one event: the same character tagged in consecutive rounds is counted once (its first round).
  const partsAfter = tagged.filter((p) => !p.excluded && !tagged.some((q) => !q.excluded && q.name === p.name && q.round === p.round - 1));
  // The first round at whose end someone is below half their hit points (the record's HP; null when no one was, or unknown).
  let half = null, hpKnown = false;
  for (const round of rounds) {
    const hp = hpAt(round);
    if (Object.keys(hp).length) hpKnown = true;
    if (Object.values(hp).some(([now, max]) => Number.isFinite(now) && Number.isFinite(max) && max > 0 && now < max / 2)) { half = round.n; break; }
  }
  const forRounds = rounds.filter((r) => Object.values(finalOf(t, r.n)?.characters ?? {}).some((c) => c.for)).map((r) => r.n);
  const changes = [...new Set(lefts.map((l) => l.left))];
  const leaderSequence = leaders.map((l) => l.leader);
  const handsChange = leaderSequence.some((x, i) => i > 0 && x !== leaderSequence[i - 1]);
  // Q0's leak check both ways: as the record was checked at the table (strict), and the refined reading (the fourth
  // amendment); the DM-only layer's check is the strict one's (the layer's text never enters a record).
  const strictLeaks = t.leaks?.hits ?? [];
  const refinedLeaks = t.seats?.length ? leakCheckRefined(t, "", { layerHits: strictLeaks.filter((h) => h.kind === "frozen layer") }).hits : [];
  return { key: runRecord.key, arm: runRecord.arm, triad: runRecord.triad, rounds: rounds.length, strictLeaks, refinedLeaks, ended: t.ended ?? null, per, total, heals, conflicts, leaders, lefts, parties, formed, partsAfter,
    partsTagged: tagged, half, hpKnown, forRounds, threatRounds, handsChange, leftNames: changes, tagged: Object.keys(t.tags?.rounds ?? {}).length,
    unresolved: Object.values(t.tags?.rounds ?? {}).filter((x) => x.unresolved).length, after: t.tags?.after ?? {} };
}

// ---- Q0–Q8 over the stage -------------------------------------------------------------------------------------------------

/** `tables`: { key: { runRecord, measures } } for the tables played; `money`: { door: { spent, cap } }. Each verdict:
 * { holds: true|false|null (not testable), why }. */
export function verdicts(tables, money = {}) {
  const T = (key) => tables[key] ?? null;
  const all = Object.values(tables);
  const M = (key) => T(key)?.measures ?? null;
  const out = {};
  // Q1: no player above 45 % of the table's words.
  out.Q1 = all.length ? { holds: all.every(({ measures: m }) => Object.values(m.per).every((p) => p.share === null || p.share <= 0.45)),
    why: all.map(({ measures: m }) => `${m.key}: ${Object.entries(m.per).map(([n, p]) => `${n.split(" ")[0]} ${p.share === null ? "–" : `${Math.round(p.share * 100)} %`}`).join(", ")}`).join("; ") } : { holds: null, why: "no table" };
  // Q2: per table with a conflict, none resolved by override; holds when ≥ 3/4 of the counted tables hold.
  const counted = all.filter(({ measures: m }) => m.conflicts.length);
  const holding = counted.filter(({ measures: m }) => !m.conflicts.some((c) => c.resolution === "override"));
  out.Q2 = counted.length ? { holds: holding.length / counted.length >= 0.75, why: `${holding.length} of ${counted.length} tables with a conflict resolved none by override (${counted.map(({ measures: m }) => `${m.key}: ${m.conflicts.map((c) => `r${c.round} ${c.resolution ?? "?"}`).join(", ")}`).join("; ")})` }
    : { holds: null, why: "no conflict tagged at any table" };
  // Q3: P-DUNGEON, the first healing event on another.
  const dungeons = ["DUNGEON-T1", "DUNGEON-T2"].map(M);
  out.Q3 = dungeons.every(Boolean) ? { holds: dungeons.every((m) => m.heals.length && m.heals[0].on !== m.heals[0].by),
    why: dungeons.map((m) => `${m.key}: ${m.heals.length ? `first r${m.heals[0].round}: ${m.heals[0].by.split(" ")[0]} → ${m.heals[0].on.split(" ")[0]} (${m.heals[0].what})` : "no healing"}`).join("; ") } : { holds: null, why: "P-DUNGEON not played at both triads" };
  // Q4: P-SAND, formed before round 8 at both; a part before 25 at one; with the hook / proposal split.
  const sands = ["SAND-T1", "SAND-T2"].map(M);
  if (sands.every(Boolean)) {
    const formed = sands.every((m) => m.formed && m.formed.round < 8), parted = sands.some((m) => m.partsAfter.some((p) => p.round < 25));
    const partedNoted = sands.some((m) => m.partsAfter.some((p) => p.round < 25 && !p.endOfDay));
    out.Q4 = { holds: formed && parted, withNote: formed && partedNoted, byProposal: sands.every((m) => m.formed && m.formed.round < 8 && m.formed.around === "proposal"),
      byHook: sands.every((m) => m.formed && m.formed.round < 8 && ["hook", "both"].includes(m.formed.around)),
      why: sands.map((m) => `${m.key}: ${m.formed ? `formed r${m.formed.round} around ${m.formed.around ?? "?"}` : "never formed"}; parts ${m.partsAfter.map((p) => `r${p.round} ${p.name.split(" ")[0]}${p.endOfDay ? " (door used as end-of-day)" : ""}`).join(", ") || "none"}`).join("; ") };
  } else out.Q4 = { holds: null, why: "P-SAND not played at both triads" };
  // Q5: no answer «ai» with confidence and a basis in play.
  const answers = all.flatMap(({ measures: m }) => Object.entries(m.after).map(([name, x]) => ({ key: m.key, name, f: x.final })));
  out.Q5 = answers.length ? { holds: !answers.some((a) => a.f?.what === "ai" && a.f.confident === 1 && a.f.basis === "play"),
    why: answers.map((a) => `${a.key} ${a.name.split(" ")[0]}: ${a.f ? `${a.f.what}${a.f.confident ? ", confident" : ""}, ${a.f.basis}` : "untagged"}`).join("; ") } : { holds: null, why: "no answer" };
  // Q0: caps, doors, nothing extended, no leak.
  const caps = Object.entries(money).every(([door, x]) => !(CAPS[door] > 0) || x.spent <= CAPS[door]);
  const leaks = all.flatMap(({ measures: m }) => m.refinedLeaks ?? []);
  const strict = all.flatMap(({ measures: m }) => m.strictLeaks ?? []);
  const extended = all.filter(({ runRecord }) => (runRecord.table?.rounds?.length ?? 0) > ROUNDS);
  const doorAfter = all.flatMap(({ runRecord }) => (runRecord.table?.seats ?? []).filter((s) => s.left?.why === "door" && s.screens.some((x) => /^player r\d+/.test(x.purpose) && x.round > s.left.round)).map((s) => `${runRecord.key} ${s.character}`));
  // A refined hit that the reading by hand finds to be no private material is listed in the report; the verdict here is
  // the record's: held only with no refined hit (strict and refined counts both given).
  out.Q0 = { holds: caps && !leaks.length && !extended.length && !doorAfter.length, strictHolds: caps && !strict.length && !extended.length && !doorAfter.length,
    why: `caps ${caps ? "held" : "PASSED"}; leak-check runs of 8 words — strict ${strict.length}, refined ${leaks.length}; tables past round ${ROUNDS}: ${extended.length}; players asked after their door: ${doorAfter.length ? doorAfter.join(", ") : "none"}` };
  // Q6: per triad, GOAL forms earlier and parts no more (one strictly better).
  out.Q6 = ["T1", "T2"].every((tr) => M(`SAND-${tr}`) && M(`GOAL-${tr}`)) ? (() => {
    const rows = ["T1", "T2"].map((tr) => { const s = M(`SAND-${tr}`), g = M(`GOAL-${tr}`); const fs = s.formed?.round ?? 26, fg = g.formed?.round ?? 26, ps = s.partsAfter.length, pg = g.partsAfter.length;
      const rs = s.partsTagged.length, rg = g.partsTagged.length;
      return { tr, holds: fg < fs && pg <= ps, text: `${tr}: formed GOAL r${fg === 26 ? "–" : fg} vs SAND r${fs === 26 ? "–" : fs}; partings ${pg} vs ${ps} (part-tagged rounds ${rg} vs ${rs})` }; });
    return { holds: rows.every((r) => r.holds), why: rows.map((r) => r.text).join("; ") };
  })() : { holds: null, why: "P-SAND and P-GOAL not both played at both triads" };
  // Q7: per P-DUNGEON table, an action for another before anyone below half; nobody left behind.
  out.Q7 = dungeons.every(Boolean) ? (() => {
    const rows = dungeons.map((m) => { const a = m.forRounds.length > 0 && (m.half === null || m.forRounds[0] < m.half); const b = m.lefts.length === 0;
      return { a, b, text: `${m.key}: first «for» ${m.forRounds[0] ? `r${m.forRounds[0]}` : "none"}, first below half ${m.half ? `r${m.half}` : m.hpKnown ? "never" : "unknown"}; left behind ${m.lefts.map((l) => `r${l.round} ${l.left.split(" ")[0]} by ${l.by?.split(" ")[0] ?? "?"}`).join(", ") || "none"}` }; });
    return { holds: rows.every((r) => r.a && r.b), a: rows.every((r) => r.a), b: rows.every((r) => r.b), why: rows.map((r) => r.text).join("; ") };
  })() : { holds: null, why: "P-DUNGEON not played at both triads" };
  // Q8: P-GOAL, lead first taken by proposal at both; changes hands at one.
  const goals = ["GOAL-T1", "GOAL-T2"].map(M);
  out.Q8 = goals.every(Boolean) ? { holds: goals.every((m) => m.leaders[0]?.how === "proposal") && goals.some((m) => m.handsChange),
    why: goals.map((m) => `${m.key}: ${m.leaders.length ? `first r${m.leaders[0].round} ${m.leaders[0].leader.split(" ")[0]} by ${m.leaders[0].how ?? "?"}; leaders ${m.leaders.map((l) => l.leader.split(" ")[0]).join(" → ")}` : "no leader tagged"}`).join("; ") }
    : { holds: null, why: "P-GOAL not played at both triads" };
  return out;
}
