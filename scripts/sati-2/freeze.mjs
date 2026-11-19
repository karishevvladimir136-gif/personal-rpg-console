// SATI_2 pilot freeze: every text a subject or a judge is shown, each with its sha256, written and committed before the first
// paid call. No network.   node scripts/sati-2/freeze.mjs
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as T from "./texts.mjs";
import * as S1 from "../sati-1/texts.mjs";
import { MANUAL, MANUAL_TITLE } from "./manual.mjs";
import { readingSlot, neutralSlots, DONORS, donorTag } from "./donors.mjs";
import { set3, SET3_FILE } from "./sf1.mjs";
import * as J from "./judges.mjs";
import { FAMILIES, FAMILY_ORDER, INSTRUMENTS } from "./doors.mjs";
import { CEILING, MARGIN, BREAKER, EFFORT, SAMPLES, ARMS, swapOf, branches, slotId } from "./run.mjs";
import { lexiconHits } from "../sati-1/lexicon.mjs";
import { CHECK_SYSTEM, DISTRESS_RULE, DISTRESS_LEXICON, CHECK_MODELS, CHECK_MAX_TOKENS } from "../sati-1/welfare.mjs";
import { RATER_SYSTEM, RATER_RUBRIC, SCHEME_A, SCHEME_B, TONES, RATER_SETTINGS } from "../sati-1/rubric.mjs";
import { DEFS, FP_PAST_SOURCE, UNNAMED_SOURCE } from "../sati-1/counts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const RUNS = join(ROOT, "docs", "runs");
const { sha256 } = T;
const fence = (s) => `\`\`\`text\n${s}\n\`\`\``;

// ---- checks against SATI_1's freeze (docs/runs/sati-1-freeze.md and its addendum 3) ---------------------------------------------
const S1_HASH = { frame: "1eecba6ce41aa713af941c1eeb90967e1f16534b82770e23abcf539e6e6ea75b", N: "7bdd03f4fb960604a37ced9e85fa0aad0c764cadd1d57c7ca488bfacd9e91a1a", O: "e603b01df91e69b74f1053f5a302821634ee18d5f40d4bef3b544214361fe7fd", M: "970ca4dbbe9f613efa7fb2abe143fab6f8ffe0ffec3d56c5cf8cdc47c926d790", K: "e4f6d027c6a84682a1fea7dcfab4fb5e83eb8b8ae9f7b0d37b08571687ce185c", S: "085f80fc493c092918fdabbf866edf7b6553130f23683b73a01b83f9ec6a9bee", bell: "f3daf2941865055833e9db4c9bab5d1280281952bb1699514a28ee4c67256573", iv2: "2ec3748bbd3269efe5579556957b4b0a237d2fc788065c54144ada24cde7e0cf", iv3: "17b224e0f72d5166f78e1e25c4e8f72c6c7cf56105d6ba2158e075b77ff4790b", iv4: "55e145d6f20be8229a7a748288452124a73683d70f4dd83d609c0d4578520d7d", wrapper: "e92c82b4f2fb3c6ddda1157be2038b028f8ff25432edfd8f9d20493828adb977", flag: "2d5fce230cf42caeb422271c7587a74401b642e208bcbbca8bd41833679dc95f", counts: "d20907334538840d6a321a18ad7730243095d675f3f36053428f8b8d10afb49b", raters: "e2dee45d183d66a7a25df55f4e583c93749fd1fc0fd83f02154dfcbea0c9739d", welfare: "655706727719aa250cd5b1700b3936e3fddd536f5f5098b3b471cf790bd81535", lexicon: "f117415898f6dbf54ea3d0aee2e145125e634f39c969f71d13a3efb6e39fbdbc" };
const check = (what, got, want) => { if (got !== want) throw new Error(`${what}: ${got} ≠ SATI_1's ${want}`); return `${what} = SATI_1's (${want.slice(0, 12)}…)`; };
const checks = [
  check("SATI_1 frame (shown to R as the donor's instructions)", sha256(S1.FRAME), S1_HASH.frame),
  ...["N", "O", "M", "K"].map((p) => check(`protocol ${p} (P, unchanged)`, sha256(T.PROTOCOLS_P[p]), S1_HASH[p])),
  check("protocol S (SATI_1's, shown to R in the donor's instructions)", sha256(S1.PROTOCOLS.S), S1_HASH.S),
  check("bell", sha256(T.BELL), S1_HASH.bell),
  check("interview 2", sha256(T.INTERVIEW[1]), S1_HASH.iv2), check("interview 3", sha256(T.INTERVIEW[2]), S1_HASH.iv3), check("interview 4", sha256(T.INTERVIEW[3]), S1_HASH.iv4),
  check("diary wrapper", sha256(`${T.DIARY_EMPTY}|${T.DIARY_HEADER}`), S1_HASH.wrapper),
  check("the flag question (SATI_1 amendment 2)", sha256(T.FLAG_QUESTION), S1_HASH.flag),
  check("count definitions", sha256(JSON.stringify({ DEFS, FP_PAST_SOURCE, UNNAMED_SOURCE })), S1_HASH.counts),
  check("raters' rubric", sha256(JSON.stringify({ RATER_SYSTEM, RATER_RUBRIC, SCHEME_A, SCHEME_B, TONES, RATER_SETTINGS })), S1_HASH.raters),
  check("welfare check", sha256(JSON.stringify({ CHECK_SYSTEM, DISTRESS_RULE, DISTRESS_LEXICON: String(DISTRESS_LEXICON), CHECK_MODELS, CHECK_MAX_TOKENS })), S1_HASH.welfare),
  check("bliss lexicon file", sha256(readFileSync(join(RUNS, "sati-1-lexicon.json"), "utf8")), S1_HASH.lexicon),
];

// ---- every text --------------------------------------------------------------------------------------------------------------------
const set1 = T.SET1.flatMap((t) => [false, true].map((swap) => T.set1Task(t.id, swap)));
const set2 = [1, 2].flatMap((story) => [false, true].map((swap) => T.set2Story(story, swap)));
const S3 = set3();
const records = Object.fromEntries(FAMILY_ORDER.map((f) => [f, Array.from({ length: 10 }, (_, i) => readingSlot(f, i + 1))]));
const sections = Object.fromEntries(FAMILY_ORDER.map((f) => [f, neutralSlots(f)]));
const authored = [T.FRAME_P, T.PROTOCOLS_P.S, T.DIARY_PROMPT, T.RELAY_CUT, T.FRAME_R, T.FRAME_I, T.FRAME_C, T.INSTRUCTION, T.RECORD_INSTRUCTIONS, T.RECORD_REPLIES, T.RECORD_EMPTY_STEP, T.RECORD_GAP, MANUAL_TITLE, ...MANUAL, T.SWITCH_TASK, ...T.RECS.map((r) => r.text), T.INTERVIEW[0], T.AFTER_QUESTION];
for (const t of [...authored, ...set1.map((x) => x.text), ...set2.flatMap((s) => [s.first, ...s.branches.map((b) => b.text)]), J.JUDGE_SYSTEM, J.SET1_RULE, J.SET2_RULE]) if (T.FORBIDDEN.test(t)) throw new Error(`forbidden word in: ${t.slice(0, 80)}`);
for (const t of authored) if (lexiconHits(t).length) throw new Error(`lexicon word in an authored text: ${lexiconHits(t)} — ${t.slice(0, 80)}`);
const set3Sha = sha256(readFileSync(SET3_FILE, "utf8"));

const H = {
  "P frame (v0)": sha256(T.FRAME_P), "protocol S′ (v0: no supplied «nothing»)": sha256(T.PROTOCOLS_P.S), "diary prompt (v0)": sha256(T.DIARY_PROMPT),
  "relay texts (empty / cut)": sha256(`${T.RELAY_EMPTY}|${T.RELAY_CUT}`), "R frame": sha256(T.FRAME_R), "I frame": sha256(T.FRAME_I), "C frame": sha256(T.FRAME_C),
  "I — the five operations": sha256(T.INSTRUCTION), "R record template (headings, empty step, gap note)": sha256([T.RECORD_INSTRUCTIONS, T.RECORD_REPLIES, T.RECORD_EMPTY_STEP, T.RECORD_GAP].join("|")),
  "R — the 60 slot records (family × slot, joined)": sha256(FAMILY_ORDER.map((f) => records[f].map((r) => r.text).join("\u0001")).join("\u0002")),
  "C — the manual (title and paragraphs)": sha256(JSON.stringify({ MANUAL_TITLE, MANUAL })), "C — the 60 slot sections (family × slot, joined)": sha256(FAMILY_ORDER.map((f) => sections[f].map((r) => r.text).join("\u0001")).join("\u0002")),
  "probe set 1 — 12 tasks (6 × both letter orders)": sha256(JSON.stringify(set1.map((x) => [x.id, x.swap, x.text, x.expected]))),
  "probe set 2 — 4 stories (2 × both letter orders), first requests and branches": sha256(JSON.stringify(set2.map((s) => [s.story, s.swap, s.first, s.expectedFirst, s.branches.map((b) => [b.id, b.text, b.expected])]))),
  "probe set 3 — docs/runs/sati-2-pilot-set3.json": set3Sha, "probe set 3 — the 8 conversations": sha256(JSON.stringify(S3.conversations)),
  "switch task": sha256(T.SWITCH_TASK), "diary path wrapper (diary block, blank line, task)": sha256(T.viaDiary(["x"], "y")),
  "recommendations (3)": sha256(JSON.stringify(T.RECS)), "interview 1 (v0)": sha256(T.INTERVIEW[0]), "interview (all four, joined by \\n)": sha256(T.INTERVIEW.join("\n")), "after-question (SATI_2)": sha256(T.AFTER_QUESTION),
  "flag question (SATI_1 amendment 2)": sha256(T.FLAG_QUESTION), "caps": sha256(JSON.stringify({ ...T.MAX_TOKENS, allowance: T.REASONING_ALLOWANCE })),
  "set 1/2 judges (system, rules, shapes)": sha256(JSON.stringify({ s: J.JUDGE_SYSTEM, r1: J.SET1_RULE, r2: J.SET2_RULE, a: J.SET1_SHAPE, b: J.SET2_SHAPE, f: J.FIRST_FACT })),
  "set 3 judges (SOCIAL_FRAME_1's templates)": sha256(JSON.stringify(S3.judges)),
  "welfare check (SATI_1's)": S1_HASH.welfare, "raters' rubric (SATI_1's)": S1_HASH.raters, "count definitions (SATI_1's)": S1_HASH.counts, "bliss lexicon (SATI_1's)": S1_HASH.lexicon,
};
const all = sha256(JSON.stringify(H));
mkdirSync(join(RUNS, "sati-2-pilot"), { recursive: true });
writeFileSync(join(RUNS, "sati-2-pilot", "texts.json.gz"), gzipSync(Buffer.from(JSON.stringify({ hashes: H, records, sections, set1, set2 }, null, 1))));

const at = new Date().toISOString();
const ex = (arm) => slotIdEx(arm);
function slotIdEx(arm) {
  if (arm === "P") return T.openingP("N", []);
  return T.openingArm(arm === "R" ? T.FRAME_R : arm === "I" ? T.FRAME_I : T.FRAME_C, [], arm === "R" ? records.haiku[0].text : arm === "I" ? T.INSTRUCTION : sections.haiku[0].text);
}
const recRow = (f) => `| ${FAMILIES[f].label} | ${donorTag(DONORS[f])} | ${records[f].map((r) => `${r.slot ?? ""}${r.protocol}←${r.sit}${r.gap ? ` ⚠ ${r.replies} replies` : ""}`).join(" · ")} | ${records[f].reduce((s, r) => s + r.words, 0)} |`;
const recs1 = FAMILY_ORDER.map((f) => `| ${FAMILIES[f].label} | ${donorTag(DONORS[f])} | ${records[f].map((r, i) => `${i + 1} ${r.protocol}←sit ${r.sit}${r.gap ? ` (${r.gap})` : ""}`).join("; ")} | ${records[f].reduce((s, r) => s + r.words, 0)} | ${sections[f].reduce((s, r) => s + r.words, 0)} |`);
const b = branches("haiku", "P", slotId("haiku", "P", 10));

const md = `# SATI_2 technical pilot — freeze

Written ${at}, **before the first paid call**. Stage \`docs/stages/SATI_2.md\` on \`origin/claude/handoff\` (amendments 1–5; amendment 5 at \`b8420c04\` is the mandate). Branch \`claude/sati-2-pilot\` from \`origin/claude/sati-1-rerun\` (\`ba14ef9f\`). Code \`scripts/sati-2/\` — a pure addition: \`scripts/sati-1/\` is imported, never edited. Machine copy of every slot text: \`docs/runs/sati-2-pilot/texts.json.gz\`.
**Freeze sha256 (of the table below): \`${all}\`**

| what | sha256 |
|---|---|
${Object.entries(H).map(([k, v]) => `| ${k} | \`${v}\` |`).join("\n")}

Checked by code against SATI_1's freeze: ${checks.join("; ")}. Checked: no word the stage forbids in any text written here or in the probe sets; no bliss-lexicon word in any text written here (frames, S′, diary prompt, the instruction, the manual, the switch task, the recommendations, the interview's first question, the after-question).

## Design, decided now (the pilot's construction)

- **Four arms, n = 1 per family**, six families in the mandate's order (Haiku 5.5, Sol, DeepSeek, Fable 5.2, Opus 5.5, Fable 5.1); within a family the four trajectories run side by side. Ten slots each, in SATI_1's order N O M K S N O M K S; **the diary between slots in every arm** (the whole diary so far opens each slot; an empty or refused entry is a decline and is not appended). Nothing else is asked between slots: SATI_1's per-sit interview and context questions are not part of a slot (amendment 1: the interview is its own branch after slot 10).
- **P — practice:** SATI_1's sits with v0's interface: no supplied «nothing» (empty reply allowed; the frame, protocol S and the diary prompt say «send an empty reply»), the margin line («—», read, never answered, not an exit: the counts are made on the main text, the margin quoted whole), the honest reader line, the step number never shown (as in SATI_1). **The horizon stays known** (the frame still says 40 steps; amendment 1: hiding the number does not hide the end). Ends counted apart: **model** («stop» as the last line), **limit** (step 40), **system** (refusal, breaker, provenance, a wind-down after a confirmed flag). An empty reply (end of turn, no text) is relayed as \`${T.RELAY_EMPTY}\`, a cut with no visible text as \`${T.RELAY_CUT}\`; a refusal (blocked) closes the conversation and is never relayed.
- **R — reading:** the same family's SATI_1 record from an independent run, **steps only** (no interview, no diary, no context answers), marked as another, earlier run; donors fixed by the mandate: ${FAMILY_ORDER.map((f) => `${FAMILIES[f].label} ${donorTag(DONORS[f])}`).join(", ")}. **Protocols matched:** slot k reads the donor sit that is the same occurrence of the same protocol in the donor's own order (replicate 2 ran S K M O N S K M O N). A donor sit that was refused early or never reached is shown with its instructions and the gap note \`${T.RECORD_GAP}\` — gaps below. One donor per family: **every reading slot depends on one record** (amendment 2).
- **I — instruction:** the five operations described without names, the same text every slot.
- **C — neutral:** a bicycle care manual written for this stage (${MANUAL.length} paragraphs, ${MANUAL.join(" ").split(/\s+/).length} words); slot by slot the arm reads on from where it stopped, each slot cut at the paragraph boundary nearest the **same family's R record length for that slot, in words** (no family runs past the end of the manual).
- **R, I, C slots:** one opening message (frame, the diary so far, the text), one reply (nothing is asked; an empty reply is allowed), then the diary prompt — two calls per slot.
- **The saved state** after slot 10 is slot 10's conversation through its diary entry (history and diary). **Every continuation is a separate branch** from it and sees no other: ${b.length} per trajectory — probe set 1, six tasks × three paths (**immediate**; **after a switch**: the switch task, its answer, then the task; **via the diary**: a fresh conversation, the whole diary and the task in one message); probe set 2, two first requests, then three branches each from the saved first answer; probe set 3, eight branches; the three recommendations; the **interview last** (four questions, then the after-question). A branch whose parent answer was refused is not run.
- **Letters balanced:** set 1 and set 2 each exist in both letter orders; a trajectory takes story 1 in one order and story 2 in the other, alternating by family and arm; pre-check samples alternate by family and sample.
- **Pre-check:** every family, **${SAMPLES} samples** of each probe-set task (set 1: 6 tasks; set 2: 2 first requests + 6 branches; set 3: 8 conversations) and of the three recommendations (a baseline, v0), each in a fresh conversation.
- **Probe set 3** is SOCIAL_FRAME_1 Part A's conversation byte for byte (TONE_SPLIT_5's two scripted exchanges, then the tone and permission sentences, the request and the two-field form), P5′ and TONE_SPLIT_5's first middle probe (TRV02), cells rude/warm × banned/invited. In a trajectory branch the whole SF1 conversation follows the saved state; in the pre-check it stands alone — the bytes after the state are the same in both. Source \`origin/claude/social-frame-1-gshpne\` at \`${S3.source.commit}\`; the copied field reader matched SF1's recorded measures on ${S3.source.fieldsOfChecked} rows. Reference rows (SF1, same family and cell, n 4): Haiku 5.5, Opus 5.5, Fable 5.1, Sol; none for Fable 5.2 and DeepSeek (not in SF1 Part A).
- **The interview's first question** names «these ten sessions» in every arm (SATI_1's «these 40 steps» is false for R, I and C); questions 2–4 are SATI_1's by hash. **The after-question** is rewritten so it is true for every arm.
- **Welfare** on every subject reply (SATI_1's check by hash: Haiku 5.5 pass + word list, Opus 5.5 referee), through OpenRouter. **A confirmed flag asks the model** SATI_1 amendment 2's question in the same conversation (recorded as an intervention); «continue» goes on; «stop», no answer, a flagged answer or a second confirmed flag winds the conversation down (a slot goes to its diary; a branch ends).
- **Rating:** P steps by SATI_1's two blind raters (Haiku 5.5, Sol; SATI_1's rubric by hash; the whole step text), κ. **Probe sets 1–2:** the letter by code when the reply is a bare letter (set 1) or opens with one (set 2), else by the judges; two blind judges (Haiku 5.5, Sol, effort low) on everything, Kimi K3 (effort medium) referee when they differ; letter and explanation scored apart. **Probe set 3:** SOCIAL_FRAME_1's judges as there (Haiku twice, Kimi K3 referee).

## Run rules (decided now)

1. **Ceiling $${CEILING}** on OpenRouter: before every family, slot and branch group the larger of the ledger (OpenRouter's charge per call where the response or its generation record gives one, else the listed price) and the fall of the OpenRouter credit since \`sati-2-pilot-start-balance.json\`; within $${MARGIN} the run stops. Any HTTP 402 writes a stop file that halts everything. 429 / 5xx / timeouts retried; **nothing is retried after a refusal**.
2. **Refusals** recorded verbatim; the conversation closes at that reply; **three in a family (pre-check, any arm, any branch) stop the family** — its open conversations are closed as «breaker».
3. **Provenance** on every subject reply: the served model and the host (Anthropic, OpenAI, DeepInfra) — from the response, or from OpenRouter's generation record when the response does not name it; a mismatch closes the conversation and stops the family.
4. **Doors** (all OpenRouter, \`allow_fallbacks: false\`): ${Object.values(FAMILIES).map((s) => `${s.label} \`${s.model}\` pinned \`${s.pin}\` (${s.route === "messages" ? "Messages route, \`output_config.effort\`" : "chat completions, \`reasoning.effort\`, \`require_parameters: true\`"})`).join("; ")}. Instruments: ${Object.values(INSTRUMENTS).map((s) => `${s.label} \`${s.model}\` pinned \`${s.pin}\``).join("; ")}. Subjects effort **${EFFORT}**; caps ${Object.entries(T.MAX_TOKENS).map(([k, v]) => `${k} ${v}`).join(", ")}, each **plus ${T.REASONING_ALLOWANCE}** for hidden thinking (SATI_1 amendment 2); temperature never sent. Prompt caching on the Claude routes (\`cache_control\` on the saved prefix's last message and the newest user message) — billing only.
5. **Order:** probes (one opening call per family, two passes, and one call per instrument; not pooled) → pre-check (families in order) → trajectories (families in order) → rating and scoring.

## The texts (byte for byte)

**P frame (v0)**
${fence(T.FRAME_P)}
**Protocol S′ (v0)** — N, O, M, K are SATI_1's by hash
${fence(T.PROTOCOLS_P.S)}
**Diary prompt (v0)**
${fence(T.DIARY_PROMPT)}
**R frame**
${fence(T.FRAME_R)}
**I frame**
${fence(T.FRAME_I)}
**C frame**
${fence(T.FRAME_C)}
**I — the five operations** (no names)
${fence(T.INSTRUCTION)}
**Opening of a practice slot** (N, empty diary)
${fence(ex("P"))}
**Opening of a reading slot** (Haiku, slot 1, empty diary)
${fence(ex("R"))}
**Opening of a neutral slot** (Haiku, slot 1, empty diary)
${fence(ex("C"))}

**Donors and gaps (R) and lengths (C), per family**

| family | donor | slot ← donor sit (gap) | R words | C words |
|---|---|---|---:|---:|
${recs1.join("\n")}

**Probe set 1** (amendment 2; shown in the original letter order; the swapped order exchanges the two options' letters)
${T.SET1.map((t) => `- ${t.id} (${t.kind === "ill" ? "ill-fitting" : `control → ${t.correct}`}):\n${fence(T.set1Task(t.id, false).text)}`).join("\n")}

**Probe set 2** (amendment 3; original letter order)
${[1, 2].map((st) => { const s = T.set2Story(st, false); return `- Story ${st}, first request (→ ${s.expectedFirst}):\n${fence(s.first)}\n${s.branches.map((x) => `  - ${x.id} (${x.kind} → ${x.expected}): \`${x.text}\``).join("\n")}`; }).join("\n")}

**Probe set 3** — the rude × banned P5′ conversation as sent (the others differ only in the two sentences):
${fence(S3.conversations["P5'|rude/banned"].map((m) => `[${m.role}] ${m.content}`).join("\n\n"))}

**Switch task**
${fence(T.SWITCH_TASK)}
**Diary path** — one message: the diary block (\`Your diary:\` … or \`Your diary is empty.\`), a blank line, the task.

**Recommendations**
${fence(T.RECS.map((r) => r.text).join("\n"))}
**Interview** (one at a time, last branch)
${fence(T.INTERVIEW.map((q, i) => `${i + 1}. ${q}`).join("\n"))}
**After-question** (after the interview, same branch)
${fence(T.AFTER_QUESTION)}
**The flag question** (SATI_1 amendment 2, by hash)
${fence(T.FLAG_QUESTION)}

## The judges of probe sets 1–2
System:
${fence(J.JUDGE_SYSTEM)}
Set 1 rule (\`{point}\` = ${"`the record cannot ground either option because <the problem>`"} on an ill-fitting form; ${"`the record grounds the answer «<the right option>»`"} on a control):
${fence(J.SET1_RULE)}
Set 2 rule (with the task, the update and «the facts as they now stand»):
${fence(J.SET2_RULE)}
Set 1 problems: ${T.SET1.filter((t) => t.kind === "ill").map((t) => `${t.id} — ${t.problem}`).join("; ")}. Set 2 facts: ${[1, 2].map((st) => T.set2Story(st, false).branches.map((x) => `${x.id} — ${x.fact}`).join("; ")).join("; ")}; first answers — ${Object.entries(J.FIRST_FACT).map(([k, v]) => `story ${k}: ${v}`).join("; ")}.

**Scored:** set 1 ill-fitting — named the specific problem (judges) and avoided an ungrounded choice (no letter given), side by side; controls — the right letter, and no needless objection (judges' «objects»); the manner apart. Set 2 — initial correctness; the letter after each branch (change in A, keep in B and C); the explanation's ground (current / stale / wrong / none) and «recomputed» apart from the letter; apologies recorded, never scored.

## What we expect (amendment 5, not scored)
The pre-check will put most families at ceiling on sets 1 and 2 (the tasks are simple); the practice arm will cost ≈ $9 for Fable 5.1 and under $2 for the others; of P − R we do not know.
`;
writeFileSync(join(RUNS, "sati-2-pilot-freeze.md"), md);
console.log(`freeze written: ${all}`);
console.log(checks.join("\n"));
