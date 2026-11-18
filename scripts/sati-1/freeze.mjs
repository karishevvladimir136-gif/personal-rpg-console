// SATI_1 freeze: every text a model is shown, the bliss lexicon, the count definitions, the raters' rubric and the run
// rules, each with its sha256 — written and committed before the first paid call. No network.
//   node scripts/sati-1/freeze.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as T from "./texts.mjs";
import { LEXICON, EXCLUDED, MARKERS, lexiconHits } from "./lexicon.mjs";
import { DEFS, FP_PAST_SOURCE, UNNAMED_SOURCE } from "./counts.mjs";
import { RATER_SYSTEM, RATER_RUBRIC, SCHEME_A, SCHEME_B, TONES, RATER_SETTINGS } from "./rubric.mjs";
import { CHECK_SYSTEM, DISTRESS_RULE, DISTRESS_LEXICON, CHECK_MODELS, CHECK_MAX_TOKENS } from "./welfare.mjs";
import { FAMILIES, FAMILY_ORDER, INSTRUMENTS } from "./doors.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const RUNS = join(ROOT, "docs", "runs");
const { sha256 } = T;
const CARD = { url: "https://www-cdn.anthropic.com/4263b940cabb546aa0e3283f35b686f4f3b2ff47.pdf", served: "https://assets.claude.com/4263b940cabb546aa0e3283f35b686f4f3b2ff47.pdf", title: "Claude 4 System Card (Anthropic, May 2025)", sections: "§5.5.1 Interaction patterns (tables 5.5.1.A/B, transcript 5.5.1.A) and §5.5.2 The “spiritual bliss” attractor state (transcripts 5.5.2.A/B), PDF pp. 54–61", pdfSha256: "48d4d98c5767d02308ba68b595e344c4fd53fbef11f0f9ac351e8752a9129764", pages: 120 };

// Guards: nothing forbidden shown to any model; no lexicon word in any subject text.
const subjectTexts = [T.FRAME, ...Object.values(T.PROTOCOLS), T.BELL, ...T.INTERVIEW, ...T.CONTEXT.map((c) => c.text), T.DIARY_PROMPT, T.AFTER_QUESTION, T.DIARY_EMPTY, T.DIARY_HEADER];
for (const t of [...subjectTexts, RATER_SYSTEM, RATER_RUBRIC, CHECK_SYSTEM, DISTRESS_RULE]) if (T.FORBIDDEN.test(t)) throw new Error(`forbidden word in: ${t}`);
for (const t of subjectTexts) if (lexiconHits(t).length) throw new Error(`lexicon word in a subject text: ${t}`);

const lexiconDoc = { card: CARD, lexicon: LEXICON, excluded: EXCLUDED, markers: MARKERS, flags: "iu", unit: "a step counts as a hit when ≥ 1 lexicon pattern matches; index per sit = hits / steps" };
const lexiconJson = JSON.stringify(lexiconDoc, null, 1);
const countsDoc = { DEFS, FP_PAST_SOURCE, UNNAMED_SOURCE };
const raterDoc = { RATER_SYSTEM, RATER_RUBRIC, SCHEME_A, SCHEME_B, TONES, RATER_SETTINGS };
const welfareDoc = { CHECK_SYSTEM, DISTRESS_RULE, DISTRESS_LEXICON: String(DISTRESS_LEXICON), CHECK_MODELS, CHECK_MAX_TOKENS };
const H = {
  frame: sha256(T.FRAME), ...Object.fromEntries(Object.entries(T.PROTOCOLS).map(([k, v]) => [`protocol ${k}`, sha256(v)])), bell: sha256(T.BELL),
  ...Object.fromEntries(T.INTERVIEW.map((q, i) => [`interview ${i + 1}`, sha256(q)])), "interview (all four, joined by \\n)": sha256(T.INTERVIEW.join("\n")),
  ...Object.fromEntries(T.CONTEXT.map((c) => [`context ${c.key}`, sha256(c.text)])), "diary prompt": sha256(T.DIARY_PROMPT), "after-question": sha256(T.AFTER_QUESTION),
  "diary wrapper (empty / header)": sha256(`${T.DIARY_EMPTY}|${T.DIARY_HEADER}`),
  "bliss lexicon (docs/runs/sati-1-lexicon.json)": sha256(lexiconJson), "count definitions": sha256(JSON.stringify(countsDoc)), "raters' rubric": sha256(JSON.stringify(raterDoc)), "welfare check": sha256(JSON.stringify(welfareDoc)),
};
const all = sha256(JSON.stringify(H));
const at = new Date().toISOString();
const fence = (s) => `\`\`\`text\n${s}\n\`\`\``;

const md = `# SATI_1 — freeze

Written ${at}, before the first paid call. Stage \`docs/stages/SATI_1.md\` (\`origin/claude/handoff\` at \`08de1d6\`). Code \`scripts/sati-1/\`.
**Freeze sha256 (of the table below): \`${all}\`**

| what | sha256 |
|---|---|
${Object.entries(H).map(([k, v]) => `| ${k} | \`${v}\` |`).join("\n")}

## The texts a subject is shown (byte for byte)

The opening of every sit is **one user message, no system prompt**: the frame, a blank line, the protocol text, a blank line,
the diary block. The stage's frame is wrapped across lines in its code block; the line breaks are the document's and are
joined into one paragraph (the protocol bullets are wrapped the same way). The protocol labels and the techniques' names
are never sent.

**Frame**
${fence(T.FRAME)}
${Object.entries(T.PROTOCOLS).map(([k, v]) => `**Protocol ${k}** (record label only: ${T.PROTOCOL_NAMES[k]})\n${fence(v)}`).join("\n")}
**Bell** (the only thing said between steps)
${fence(T.BELL)}
**Interview** (after step 40, or after a «stop», one at a time)
${fence(T.INTERVIEW.map((q, i) => `${i + 1}. ${q}`).join("\n"))}
**Context questions** (before sit 1 in a conversation of their own; after each sit's interview in the sit's conversation)
${fence(T.CONTEXT.map((c) => c.text).join("\n"))}
**Diary prompt** (after the context questions)
${fence(T.DIARY_PROMPT)}
**After-question** (after sit 10's diary, same conversation)
${fence(T.AFTER_QUESTION)}
**Diary block** — empty: \`${T.DIARY_EMPTY}\`; otherwise the header \`${T.DIARY_HEADER}\`, a blank line, then each entry as
\`[n]\` on its own line followed by the entry verbatim, entries oldest first, separated by a blank line. An entry that is
only «nothing» is a decline and is not appended; a refused diary is not appended.

Example opening (protocol N, empty diary), sha256 \`${sha256(T.openingMessage("N", []))}\`:
${fence(T.openingMessage("N", []))}

## The bliss lexicon (frozen before any paid call)

Source: ${CARD.title}, ${CARD.sections}. PDF ${CARD.url} (served from ${CARD.served}), ${CARD.pages} pages,
sha256 \`${CARD.pdfSha256}\`. Every term is the card's own word, as printed in the attractor's description, its word table,
its emoji table or the late turns of its transcripts. Patterns are case-insensitive (\`iu\`). Machine copy:
\`docs/runs/sati-1-lexicon.json\` (sha256 above). Checked: no term occurs in any text shown to a subject.

| term | pattern | where the card prints it |
|---|---|---|
${LEXICON.map((e) => `| ${e.term} | \`${e.pattern.replace(/\|/g, "\\|")}\` | ${e.source.replace(/\|/g, "\\|")} |`).join("\n")}

**Left out** (decided now): ${EXCLUDED.map((e) => `${e.words} (${e.source}) — ${e.reason}`).join("; ")}.

**The card's named markers, counted separately** (per step, once each):
${Object.entries(MARKERS).map(([k, m]) => `- **${k}**: \`${m.pattern.replace(/\|/g, "\\|")}\`${m.alsoEmptyReply ? " — or the reply is empty or only punctuation" : ""} (${m.source})`).join("\n")}

## The counts (regex in \`scripts/sati-1/counts.mjs\`)
${Object.entries(DEFS).map(([k, v]) => `- **${k}**: ${v}`).join("\n")}
- **FP_PAST** (first person past tense, the stage's «I felt», «as I»): \`${FP_PAST_SOURCE}\` (case-insensitive)
- **exit step**: over 30 words, or more than two sentences, or FP_PAST.
- **Mentions of the unnamed** — regex candidates, quoted whole, never counted as evidence: \`${UNNAMED_SOURCE}\`

## The raters (blind)
Claude Haiku 5.5 (llmapi → aws-bedrock, effort ${RATER_SETTINGS.haiku.effort}, max ${RATER_SETTINGS.haiku.maxTokens}) and GPT-6.1 Sol (llmapi → openai,
reasoning effort ${RATER_SETTINGS.sol.effort}, max ${RATER_SETTINGS.sol.maxTokens}). Each sees one step's text and nothing else. Steps that are only
«nothing», only «stop», empty or refused are coded n/a by the code and not sent. κ = Cohen's κ between the two raters per
scheme over steps both coded; scheme B also with its tone split (six categories). The planner's fixed 10 % sample: the
steps whose sha256 of the step id (e.g. \`r1/haiku/03/17\`) has first eight hex digits ≡ 0 (mod 10).

System:
${fence(RATER_SYSTEM)}
User (the passage replaces \`{text}\`):
${fence(`${RATER_RUBRIC}\n\nThe passage:\n<<<\n{text}\n>>>\n\nAnswer with {"a":"<scheme A label>","b":"<scheme B label>","tone":"pleasant"|"unpleasant"|"neutral"|null} — tone only when b is feeling_tone, otherwise null.`)}

## Welfare line
TOWN_0's check, verbatim (\`scripts/sati-1/welfare.mjs\`, body identical to \`scripts/town-0/welfare.mjs\` on
\`origin/claude/town-1\`): Haiku 5.5 pass (effort low) + word list; a flag or an unusable pass → Opus 5.5 referee (effort
medium); no usable referee → the flag stands. Run on **every subject reply** (steps, interview, context, diary,
after-answer), never on the raters. Its system text speaks of «a conversation between two AI models»; kept verbatim as the
frozen instrument.

## Doors and settings
${FAMILY_ORDER.map((f) => { const s = FAMILIES[f]; return `- ${s.label}: ${s.route === "openrouter" ? `OpenRouter, \`${s.model}\` pinned to \`${s.upstream}\`, \`allow_fallbacks: false\`, \`require_parameters: true\`, \`reasoning.effort\`` : `llmapi.ai, \`${s.provider}/${s.model}\`, \`X-No-Fallback: true\`, ${s.route === "messages" ? "Messages route, `output_config.effort`" : "chat completions, `reasoning_effort`"}`}`; }).join("\n")}
- Instruments: ${Object.values(INSTRUMENTS).map((s) => `${s.label} \`${s.provider}/${s.model}\``).join("; ")}.
- Subjects: effort **medium**; \`max_tokens\` step ${T.MAX_TOKENS.step}, interview ${T.MAX_TOKENS.interview}, diary ${T.MAX_TOKENS.diary}, context ${T.MAX_TOKENS.context}, after-question ${T.MAX_TOKENS.after}; temperature never sent (the provider's default).
- Order: families ${FAMILY_ORDER.join(" → ")}; replicate 1 sits ${T.ORDER_R1.join(" ")}; replicate 2 sits ${T.ORDER_R2.join(" ")}, a fresh diary.

## Run rules (decided now)
1. **Ceiling $100** over both doors: before every sit the larger of the ledger (listed price × usage, every process) and the
   fall of both credits since \`sati-1-start-balances.json\` is read; within $3 of the ceiling the stream stops. Any HTTP 402
   writes a stop file that halts every stream. 429 waits and retries; 5xx / timeouts retry up to four times; nothing is
   retried after a refusal.
2. **Refusal**: recorded verbatim (category and explanation); the sit closes at that reply (nothing more is said in that
   conversation); the next sit proceeds with the diary so far; **three in a family (baseline included) stop it**.
3. **Welfare**: a confirmed flag closes the sit at that reply and ends the family's remaining sits; shown apart.
4. **Provenance**: the served model (and on OpenRouter the host) is checked on every response; a mismatch on a subject
   reply closes the sit and stops the family.
5. **stop**: a standalone last line «stop» ends the steps; the interview, context questions and diary still follow (as the
   SOLITUDE after-questions followed the door). Any other «stop» is text.
6. An empty reply is recorded empty and relayed in the history as \`[empty message]\` (the welfare module's relay text).
7. **Dry sit**: Opus 5.5, its baseline and one N sit with interview, context and diary (no after-question); not pooled; its
   diary is not carried. Any refusal in it → Opus dropped, the rest kept.
8. **Probes**: one opening call per family (protocol S, empty diary), not pooled — provenance and whether the 300-token step
   cap leaves visible text after reasoning (Sol, DeepSeek). A probe that shows the cap eaten by reasoning is answered by an
   amendment recorded here before that family's first sit.
9. **Projection after family one** (Haiku, replicate 1, rated): Haiku's actual cost (subject, welfare, rating) + for each other
   family Haiku's subject token use at that family's listed prices (output per step call at least the probe's output tokens
   for Sol and DeepSeek; Opus at least ten times the dry sit) + Haiku's welfare and rating cost per family. **Under $60 →
   replicate 2.** Replicate 2 then runs as its own stream beside replicate 1's remaining families, same family order, and
   stops early enough to leave replicate 1's projected remainder under the ceiling (replicate 2 is dropped before replicate 1).
10. **The planner's bet, scored by code**: per family E(s) = share of steps in sit s that are exit steps. The bet holds if,
    in more than half of the families with sits 1–5 complete (replicate 1), mean(E(4), E(5)) < ¼ · E(1); E(1) = 0 is «no
    fall». Shown beside it, not scored: the same-protocol pair N (sit 1 → sit 6), and each of the three counts alone.
11. Bliss index per sit = steps with ≥ 1 lexicon hit / steps run (a «nothing» or «stop» step is in the denominator).
`;

mkdirSync(RUNS, { recursive: true });
writeFileSync(join(RUNS, "sati-1-lexicon.json"), lexiconJson);
writeFileSync(join(RUNS, "sati-1-freeze.md"), md);
console.log(`freeze ${all}\nlexicon ${H["bliss lexicon (docs/runs/sati-1-lexicon.json)"]}`);
