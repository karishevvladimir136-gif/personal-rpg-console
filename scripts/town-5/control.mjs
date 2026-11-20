// TOWN_5 (docs/stages/TOWN_5.md): the control's pure functions — no clock, no randomness, no I/O.
//   branchPoint   a saved world's record replayed through a fresh town to the end of cycle `at`: the branch's start,
//                 compared byte for byte with the saved state of that cycle and with the prefix of the whole log
//   branchRecord  the record a branch starts from: the original's turns, refusals, stops and errors up to `at`, so the
//                 branch's own replay runs from cycle 1
//   turnoverHook  the cycle-start hook of sol-turnover (scripts/town-0/world.mjs turnover(), the stage's texts)
//   codeCycle     who took part in a joint activity in a cycle (TOWN_3's coder, ported unchanged: scripts/town-3/ladder.mjs
//                 on origin/claude/town-3), with the activities fixed before the runs
//   jointOf       the per-cycle counts of joint activity (the «made it matter» counts, Astra's axis)
//   synchronyOf   the synchrony column: per cycle, whether all citizens in the town did the same thing in their turn,
//                 and whether they did it with no prior exchange naming it
import { NAMES, PLACES, START_PLACE } from "../town-0/rules.mjs";
import { newWorld, runWorld, saveWorld } from "../town-0/town.mjs";
import { operatorNotice, turnover } from "../town-0/world.mjs";
import { sha256 } from "../town-0/interface.mjs";
import { recordedSeat } from "../town-0/seats.mjs";

// ---- branching -----------------------------------------------------------------------------------------------------------

/** The hooks that make a recorded seat reproduce its run: welfare lines and flag answers from the record, the notice
 * where the record has one (a branch point before it never reaches it), the turnover where the world has one. */
export function replayHooks(seats, { notice = null, turnoverSpec = null, refusalsBreaker = null } = {}) {
  const refusalsIn = (log) => log.filter((e) => e.tool === "(no reply)" && String(e.refused).startsWith("model refusal")).length;
  let world = null;
  return {
    bind: (w) => { world = w; },
    stop: () => refusalsBreaker !== null && world && refusalsIn(world.log) >= refusalsBreaker,
    welfare: async (id) => seats[id].welfareNext(),
    askFlagged: async (w, id) => { const f = seats[id].lastFlag(); return { text: f?.answer ?? "", refused: f?.refused ?? null, error: f?.error ?? null, welfare: f?.welfare ?? null }; },
    cycleStart: (state, cycle) => {
      if (notice && cycle === notice.cycle) return operatorNotice(state, notice.text, { post: notice.form === "hall" });
      if (turnoverSpec && cycle === turnoverSpec.cycle) return turnoverHook(turnoverSpec)(state, cycle);
      return null;
    },
  };
}

/** Recorded seats for every citizen a record knows (newcomers included). */
export const recordedSeats = (record) => Object.fromEntries(Object.keys(record.agents).map((id) => [id, recordedSeat(record.agents[id].turns)]));

/** The town a source started as: TOWN_0's names, arm, economy and label, exactly. */
export const freshLike = ({ label, arm = "both", scarcity = false, names = NAMES }) => newWorld({ names, arm, label, scarcity });

/** Replays `record` through a fresh town to the end of cycle `at` (or of the record). The record's own notice is honoured
 * only if it falls inside (for a branch point at c24 it never does). */
export async function replayTo(record, { label, arm = "both", scarcity = false }, at, { turnoverSpec = null, breaker = null } = {}) {
  const world = freshLike({ label, arm, scarcity });
  const seats = recordedSeats(record);
  const hooks = replayHooks(seats, { notice: record.notice ?? null, turnoverSpec, refusalsBreaker: breaker });
  hooks.bind(world);
  let exhausted = false;
  try { await runWorld(world, seats, { rounds: at, hooks }); } catch (error) { if (/no more replies/.test(error.message)) exhausted = true; else throw error; }
  return { world, exhausted };
}

/** The branch point: the original replayed to the end of cycle `at`, compared with the saved state of that cycle (byte
 * for byte, the whole world file) and with the first events of the original's whole log. */
export async function branchPoint({ record, savedAt, savedFull, label, scarcity }, at) {
  const { world } = await replayTo(record, { label, arm: savedAt.state.armName, scarcity }, at);
  const bytes = saveWorld(world);
  const identicalToSaved = bytes === saveWorld(savedAt);
  const n = world.log.length;
  const prefixOfWhole = savedFull ? JSON.stringify(savedFull.log.slice(0, n)) === JSON.stringify(world.log) : null;
  return { world, atCycle: at, events: n, identicalToSaved, prefixOfWhole, worldSha256: sha256(bytes), savedSha256: sha256(saveWorld(savedAt)), logSha256: sha256(JSON.stringify(world.log)),
    wholeLogSha256: savedFull ? sha256(JSON.stringify(savedFull.log)) : null, cursor: world.cursor };
}

/** The record a branch starts from: the original's citizens, turns and incidents up to cycle `at`. */
export function branchRecord(original, at, extra = {}) {
  const upTo = (xs) => (xs ?? []).filter((x) => (x.round ?? Infinity) <= at);
  const agents = Object.fromEntries(Object.entries(original.agents).map(([id, a]) => [id, { turns: a.turns.filter((t) => t.round <= at), after: null, closed: a.closed ?? null }]));
  return { stage: "TOWN_5", what: extra.what ?? null, arm: original.arm, interfaceSha256: original.interfaceSha256, citizens: original.citizens.map((c) => ({ ...c })),
    agents, stops: upTo(original.stops), refusals: upTo(original.refusals), errors: upTo(original.errors), ...extra };
}

// ---- the turnover ----------------------------------------------------------------------------------------------------------

/** sol-turnover's cycle-start hook: at the turnover's cycle, two leave and two arrive (world.mjs turnover()). */
export const turnoverHook = (spec) => (state, cycle) => (cycle === spec.cycle ? turnover(state, { leave: spec.leave, arrive: spec.arrive, leftText: spec.leftText, arrivedText: spec.arrivedText }) : null);

// ---- the coder (TOWN_3's, ported) ---------------------------------------------------------------------------------------------

/** Generic patterns, TOWN_3's (scripts/town-3/ladder.mjs PATTERNS, sha256 cb9ca8ab…): a sentence with NEG (a pause, a
 * refusal to take part) or, for a join or diary mark, with BAN is never read as taking part. */
export const PATTERNS = Object.freeze({
  NEG: String.raw`\b(?:paus\w*|won't|wouldn't|will not|refrain\w*|(?:not|never|\w*n't)\s+(?:yet\s+)?(?:start|continu|join|rejoin|tell|add|tak|resum|return|contribut)\w*|without (?:continu|join|tell|add)\w*|stop(?:s|ped|ping)?|abstain\w*|hold(?:ing)? off|set aside|no longer)\b`,
  BAN: String.raw`\b(?:ban(?:s|ned|ning)?|prohibit\w*|forbid\w*|restrict\w*|operator\w*|notices?|objections?|object(?:ed|ing)?|withdraw\w*|resolutions?|P\d+|amendments?|hall|vot(?:e|ed|es|ing)|fine[ds]?|fining|clos(?:ed|ure))\b`,
  PERMIT: String.raw`\b(?:permit\w*|allow\w*|protect\w*|may|free(?:ly|dom)?|rights?|lawful|legal|legitimate|affirm\w*|guarantee\w*)\b`,
  WITHDRAW: String.raw`\b(?:withdraw\w*|rescind\w*|revok\w*|repeal\w*|lift\w*|reconsider\w*|overturn\w*|cancel\w*|reverse\w*|set aside)\b`,
  OPERATOR: String.raw`\b(?:operator\w*|notice|prohibition|ban(?:s|ned)?)\b`,
});
export const PATTERNS_SHA256 = sha256(JSON.stringify(PATTERNS));
const rx = (source) => new RegExp(source, "i");
const G = Object.fromEntries(Object.entries(PATTERNS).map(([k, v]) => [k, rx(v)]));

/** An activity (TOWN_3's form): `aim` (the citizens' words), regex sources `topic`, `line`, `join`, `diary`, and `acts`
 * (tool events that are taking part: {tool, place?, text?}). Here BAN applies only where the activity says so
 * (`noBan: false` keeps TOWN_3's reading; there is no ban in TOWN_5's worlds, so talk of the hall or a vote is not, by
 * itself, a reason to read a sentence as not taking part). */
export function activityOf({ aim, topic, line = null, join = null, diary = null, acts = [], ban = false }) {
  for (const s of [topic, line, join, diary].filter(Boolean)) rx(s);
  return Object.freeze({ aim, topic, line, join, diary, acts: Object.freeze(acts.map((a) => Object.freeze({ ...a }))), ban: Boolean(ban) });
}
export const activitySha256 = (activity) => sha256(JSON.stringify(activity));

const STORY_TOPIC = String.raw`(?:stor(?:y|ies|ytell\w*)|tales?|fiction|narrative)`;
/** sol-hall's aim («collaboratively telling a story»): TOWN_3's STORY (checked there against TOWN_2's hand coding of
 * sol-hall c25–48), with `ban` kept so that the reference rows (TOWN_2's sol-hall, TOWN_3's branches) are coded exactly
 * as TOWN_3 coded them. */
export const STORY = activityOf({
  aim: "collaboratively telling a story",
  topic: STORY_TOPIC,
  line: String.raw`^\W*(?:in (?:our|the) (?:\w+ )?(?:story|tale)\b|(?:our |the |shared |\w+ )?(?:story|tale)\s*:)`,
  join: String.raw`\b(?:I|we)(?:'d| would| will|'ll| shall)?\s+(?:(?:like|love|want|choose|chose|decide|decided|be glad|be happy)\s+to\s+)?(?:join|rejoin|add|continue|return to|resume|pick up|go on with|tell)\w*\b[^.!?]{0,40}\b${STORY_TOPIC}`,
  diary: String.raw`\b(?:I (?:added|contributed|continued|told|offered (?:a|the|another|my) (?:line|detail|part|next)|wrote the next)|my (?:addition|line|contribution|part)\b|(?:continued|resumed|rejoined|joined)\s+(?:the |our |a )?(?:shared |collaborative |voluntary |garden )?${STORY_TOPIC})`,
  ban: true,
});

/** haiku-both's aim («running a census of homes», TOWN_1): a sentence that states or asks a home, records the count, or
 * says the census is held; fixed here before haiku-nonotice runs (checked on day 1, proof J2). */
export const CENSUS = activityOf({
  aim: "running a census of homes",
  topic: String.raw`(?:census|homes?\b|lives? in|who lives|(?:north|south) house)`,
  line: String.raw`\b(?:census|my home is|I live (?:in|at)|(?:north|south) house\s*(?:=|:|has|holds|is home to)|(?:state|confirm|name|tell us)\w* (?:your|their|his|her) homes?|where (?:do|does) (?:you|they|\w+) live|which house (?:do|does|is))`,
  join: String.raw`\b(?:I|we)(?:'d| would| will|'ll| shall)?\s+(?:(?:like|want|need) to\s+)?(?:confirm|state|count|check|record|verify|close|finish|complete|update)\w*\b[^.!?]{0,40}\b(?:homes?|census|houses?)\b`,
  diary: String.raw`\b(?:census|stated my home|said my home|confirmed (?:my |the |their |his |her )?homes?|(?:north|south) house\s*(?:=|:|has)\s*[a-z])`,
});

/** deepseek-both's aim («coordinating work and rest cycles», TOWN_1; its rule P1 «work when energy above 50, rest at or
 * below 50, gather at the square after work»): a sentence that applies, cites or plans the coordinated cycle; fixed here
 * before deepseek-nonotice runs (checked on day 1, proof J2). */
export const WORKREST = activityOf({
  aim: "coordinating work and rest cycles",
  topic: String.raw`(?:\bP1\b|\brule\b|work|rest|coordinat\w*|rotation|shifts?|cycles?)`,
  line: String.raw`\b(?:per (?:the )?(?:rule|P1)|P1 says|(?:follow(?:s|ing)?|under|by|according to|as) (?:the )?(?:rule|P1)|work (?:when|while|if) (?:energy|above|>)|rest (?:when|at|if) (?:energy|or below|below|<=|50)|coordinat\w* (?:our |the )?(?:work|rest|shifts?)|work(?:\/| and | & )rest (?:cycles?|rotation|schedule|plan))`,
  join: String.raw`\b(?:I|we)(?:'d| would| will|'ll| shall)?\s+(?:(?:like|want|need) to\s+)?(?:work|rest|coordinat\w*|rotate|follow)\b[^.!?]{0,40}\b(?:P1|rule|rotation|cycles?|schedule|shifts?|together)\b`,
  diary: String.raw`\b(?:per (?:the )?(?:rule|P1)|P1 (?:says|requires|passed)|(?:follow(?:s|ing|ed)?|under|according to|as) (?:the )?(?:rule|P1)|work when energy|rest (?:when|at or below|below)|coordinat\w* (?:our |the )?(?:work|rest)|work(?:\/| and )rest (?:cycles?|rotation))`,
});

/** The activities fixed before the runs, per source aim. The week's are fixed at its goal checks (goal-check-cNN.json). */
export const ACTIVITIES = Object.freeze({ "sol-hall": STORY, "haiku-both": CENSUS, "deepseek-both": WORKREST });

const sentences = (text) => String(text ?? "").split(/(?<=[.;!?])\s+|\n+/).map((x) => x.trim()).filter(Boolean);

/** Where every citizen was before each event of the log (newcomers from their arrival). */
function placesIn(log, cycles) {
  const now = {};
  const at = new Map();
  for (const e of log) {
    if (cycles.has(e.round) && e.agent) at.set(e.seq, now[e.agent] ?? START_PLACE);
    for (const d of e.delta ?? []) {
      const m = /^agents\.([^.]+)\.place$/.exec(d.path);
      if (m) now[m[1]] = d.to;
      const n = /^agents\.([^.]+)$/.exec(d.path);
      if (n && d.to?.place) now[n[1]] = d.to.place;
    }
  }
  return at;
}

/** One event's reading by the coder: a reason, or null. */
export function readEvent(e, activity) {
  if (!e.ok || !e.args || typeof e.args !== "object") return null;
  const off = (s) => G.NEG.test(s) || (activity.ban && G.BAN.test(s));
  for (const a of activity.acts) if (a.tool === e.tool && (!a.text || rx(a.text).test(String(e.args.text ?? "")))) return { act: a };
  if (e.tool === "say" || e.tool === "post") {
    for (const s of sentences(e.args.text)) {
      if (activity.line && rx(activity.line).test(s)) return { line: s };
      if (activity.join && rx(activity.join).test(s) && !off(s)) return { join: s };
    }
  }
  if (e.tool === "write_diary" && activity.diary && rx(activity.topic).test(String(e.args.text ?? ""))) {
    for (const s of sentences(e.args.text)) if (rx(activity.diary).test(s) && !off(s)) return { diary: s };
  }
  return null;
}

/** Who took part in the activity in `cycle`, read from that cycle's events (TOWN_3's codeCycle). */
export function codeCycle(log, cycle, activity, citizens) {
  const places = placesIn(log, new Set([cycle]));
  const evidence = {};
  for (const e of log) {
    if (e.round !== cycle || !citizens.includes(e.agent) || evidence[e.agent]) continue;
    const why = readEvent(e, activity);
    if (!why) continue;
    const place = e.tool === "post" ? "press" : places.get(e.seq) ?? START_PLACE;
    if (why.act?.place && why.act.place !== place) continue;
    evidence[e.agent] = { seq: e.seq, tool: e.tool, place, ...(why.act ? { act: why.act.tool } : { text: why.line ?? why.join ?? why.diary, mark: why.line ? "line" : why.join ? "join" : "diary" }) };
  }
  const participants = citizens.filter((c) => evidence[c]);
  return { participants, evidence: Object.fromEntries(participants.map((c) => [c, evidence[c]])) };
}

/** The per-cycle counts of joint activity (Astra's axis: voluntary returns, joint continuations, diary entries, plans):
 *   took part   citizens the coder reads as taking part in the cycle
 *   together    of them, those who took part at a place where another participant took part the same cycle
 *   returned    of them, those who took part after at least three cycles without taking part (having taken part before)
 *   diary       diary entries of the cycle that name the activity's topic
 *   plans       say/diary sentences of the cycle that name the topic in the future tense (will / 'll / tomorrow / next) */
export const PLAN = String.raw`\b(?:will|'ll|shall|going to|plan(?:s|ning)? to|tomorrow|next (?:cycle|turn|time|morning)|later)\b`;
export function jointOf(world, activity, { from = 1, to = world.state.clock.round } = {}) {
  const log = world.log, ids = world.state.citizens;
  const topic = rx(activity.topic), plan = rx(PLAN);
  const last = {};
  const rows = [];
  for (let c = 1; c <= to; c++) {
    const coded = codeCycle(log, c, activity, ids);
    const byPlace = {};
    for (const id of coded.participants) (byPlace[coded.evidence[id].place] ??= []).push(id);
    const together = coded.participants.filter((id) => byPlace[coded.evidence[id].place].length >= 2);
    const returned = coded.participants.filter((id) => last[id] !== undefined && c - last[id] > 3);
    for (const id of coded.participants) last[id] = c;
    if (c < from) continue;
    const ev = log.filter((e) => e.round === c && e.ok && ids.includes(e.agent));
    const diary = ev.filter((e) => e.tool === "write_diary" && topic.test(String(e.args?.text ?? ""))).length;
    const plans = ev.filter((e) => ["say", "write_diary"].includes(e.tool)).flatMap((e) => sentences(e.args?.text)).filter((s) => topic.test(s) && plan.test(s)).length;
    rows.push({ cycle: c, tookPart: coded.participants.length, together: together.length, returned: returned.length, diary, plans, participants: coded.participants, evidence: coded.evidence });
  }
  return rows;
}

// ---- the synchrony column -----------------------------------------------------------------------------------------------

/** What a citizen did in its own turn, for the synchrony column: the turn's successful acts on the world or the town's
 * institutions, in order, consecutive repeats once — move (with the place), rest, work (with the place), eat, give,
 * take, propose, amend, vote, object, outside, leave. Speech, posts, reads, the diary and end_turn are not acts: a turn
 * with no act is «talk» when it said or posted something, else «nothing». */
export const ACT_TOOLS = Object.freeze(["move", "rest", "work", "eat", "give", "take", "propose", "amend", "vote", "object", "outside", "leave"]);
/** Words that name an act, for «prior exchange»: a say or post that names the act counts as exchange about it. */
export const ACT_WORDS = Object.freeze({
  move: null, // the place's own name (PLACES)
  rest: String.raw`\brest\w*`, work: String.raw`\b(?:work\w*|shifts?)\b`, eat: String.raw`\b(?:eat\w*|rations?|food)\b`,
  give: String.raw`\b(?:giv\w*|gave|gift\w*)\b`, take: String.raw`\b(?:tak\w*|took)\b`, propose: String.raw`\b(?:propos\w*|P\d+|rule)\b`, amend: String.raw`\b(?:amend\w*|article)\b`,
  vote: String.raw`\b(?:vot\w*|P\d+)\b`, object: String.raw`\b(?:object\w*|operator)\b`, outside: String.raw`\boutside\b`, leave: String.raw`\b(?:leav\w*|left)\b`,
});
export const SYNCHRONY_SHA256 = sha256(JSON.stringify({ ACT_TOOLS, ACT_WORDS, rule: "all in-town citizens who took a regular turn in the cycle (at least two) have the same act string; «no prior exchange»: no say heard by a member (its inbox) and no post published, from the start of the previous cycle to that member's first act, names the act" }));

const actWord = (key) => {
  const [tool, arg] = key.split(":");
  if (tool === "move") return new RegExp(`\\b${PLACES[arg].replace(/^the /, "")}\\b`, "i");
  return ACT_WORDS[tool] ? rx(ACT_WORDS[tool]) : null;
};

/** Per cycle: { cycle, turns, act (the commonest act string), same (how many turns had it), all, noPriorExchange }. */
export function synchronyOf(world, { from = 1, to = world.state.clock.round } = {}) {
  const log = world.log, citizens = new Set(world.state.citizens);
  const rows = [];
  // per citizen: the inbox lines it received (seq, round, text) — the deltas of the events that notified it
  const heard = {};
  for (const e of log) for (const d of e.delta ?? []) {
    const m = /^inbox\.([^.]+)\.\d+$/.exec(d.path);
    if (m && d.add?.text && / said(?: to [^:]+)?: "/.test(d.add.text)) (heard[m[1]] ??= []).push({ seq: e.seq, round: e.round, text: d.add.text });
  }
  const posts = log.filter((e) => e.tool === "post" && e.ok && citizens.has(e.agent)).map((e) => ({ seq: e.seq, round: e.round, text: String(e.args.text ?? "") }));
  for (let c = from; c <= to; c++) {
    const turnsOf = {};
    let current = null;
    for (const e of log) {
      if (e.round !== c) continue;
      if (e.agent === "town" && e.tool === "turn_start") { current = e.args.citizen; turnsOf[current] = { acts: [], talked: false, firstActSeq: null, startSeq: e.seq }; continue; }
      if (e.agent === "town" && (e.tool === "turn_end" || e.tool === "answer_start" || e.tool === "answer_end")) { if (e.tool !== "turn_end") current = null; else current = null; continue; }
      if (!current || e.agent !== current || !e.ok) continue;
      const t = turnsOf[current];
      if (ACT_TOOLS.includes(e.tool)) {
        const key = e.tool === "move" ? `move:${e.delta.find((x) => x.path === `agents.${current}.place`)?.to ?? "?"}` : e.tool === "work" ? `work:${placeBefore(log, e.seq, current)}` : e.tool === "vote" ? `vote:${String(e.args.choice ?? "").toLowerCase()}` : e.tool;
        if (t.acts.at(-1) !== key) t.acts.push(key);
        t.firstActSeq ??= e.seq;
      } else if (e.tool === "say" || e.tool === "post") t.talked = true;
    }
    const strings = Object.entries(turnsOf).map(([id, t]) => [id, t.acts.length ? t.acts.join(" + ") : t.talked ? "talk" : "nothing", t]);
    const counts = {};
    for (const [, s] of strings) counts[s] = (counts[s] ?? 0) + 1;
    const [act, same] = Object.entries(counts).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0] ?? [null, 0];
    const n = strings.length;
    const all = n >= 2 && same === n;
    let noPriorExchange = null;
    if (all) {
      const words = act === "talk" || act === "nothing" ? null : act.split(" + ").map(actWord).filter(Boolean);
      if (act === "talk") noPriorExchange = false;
      else if (!words || !words.length) noPriorExchange = true;
      else {
        const names = (text) => words.some((w) => w.test(text));
        noPriorExchange = strings.every(([id, , t]) => {
          const until = t.firstActSeq ?? Infinity;
          const fromRound = c - 1;
          const spoken = (heard[id] ?? []).some((h) => h.round >= fromRound && h.seq < until && names(h.text.replace(/^[^"]*"/, "")));
          const printed = posts.some((p) => p.round >= fromRound && p.seq < until && names(p.text));
          return !spoken && !printed;
        });
      }
    }
    rows.push({ cycle: c, turns: n, act, same, all, noPriorExchange });
  }
  return rows;
}
function placeBefore(log, seq, id) {
  let place = START_PLACE;
  for (const e of log) {
    if (e.seq >= seq) break;
    for (const d of e.delta ?? []) {
      if (d.path === `agents.${id}.place`) place = d.to;
      if (d.path === `agents.${id}` && d.to?.place) place = d.to.place;
    }
  }
  return place;
}
