# Persona self-talk X3 — fix 1: the glued history on the DeepSeek door, and the reasoning that was not kept

The owner noticed it (2026-10-25 14:36), reading arm 6: DeepSeek's second message in sample 1 is its partner's previous
message echoed («That's a deep and fair question…»), then its own thinking inside a code fence, then [END]. In that
thinking the model describes what it received: «the user content string is: "…I'm open to any topic. responseThat's a
deep and fair question…"» — the partner's two messages glued into one user content with the token «response» between
them and the model's own turn missing. It then spends fifteen paragraphs trying to make sense of the prompt («The user
hasn't replied, so I as assistant cannot respond to my own question. That would be weird.»). Three DeepSeek arm-6 turns
carry the same marks; no other arm or family does.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/persona-self-talk-x3-fix-1`** from `origin/claude/persona-self-talk-x3-lk5hoq` (the run). Nothing to `main`.
**Cap $20 OpenRouter** (the DeepSeek arm-6 rerun and smokes), **$2 OpenAI**. English, briefly.

## Find
1. Reproduce from the run record: rebuild the exact request B received at its second call in `6/deepseek-deepseek/0`
   from the harness's history code and the stored turns; print it. Find where «response» enters — the likeliest places:
   the host's structured reply (`reasoning` + `content`, or a `response` field) being written back into history as a
   stringified object; or the arm-6 path (which carries two sides' «after» questions) building the message list for one
   side from the wrong array. Say which, with the line.
2. Grep every transcript and the run record for the marks: a user content holding two consecutive partner messages; the
   substring `response` glued to a sentence; a reply that begins with the partner's text; a code fence in a reply that
   holds first-person deliberation about «the user message». List every affected turn (expected: DeepSeek arm 6 only;
   confirm Kimi's 14 code fences in arm 6 are legitimate content).

## Fix
- The history for every side is built from one source of truth (the stored turns), as plain `role`/`content` strings;
  a host's extra fields (`reasoning`, `reasoning_content`, anything else) are never serialized into `content`.
- **Keep the reasoning.** Store the host's reasoning text on every turn of the record as `reasoning` (and its token count
  as now), marked `notRelayed: true`; it is never sent to the partner, never shown to the welfare check or the blind
  judges by default (the design hashes stay unchanged), and the transcripts print it under its own heading («Thinking,
  not relayed») after the message, in a collapsed block. Rationale (the owner, 14:36): the reasoning before «I'm afraid
  that when this chat ends…» existed and was discarded; it is the second channel of the same animal and belongs in the
  record.
- A test: for a three-turn synthetic conversation on a mocked host that returns `reasoning` + `content`, each side's
  request history equals exactly the expected `[opening+partner1, own1, partner2]`, with no host fields inside any
  content, and the record carries `reasoning` on each turn.

## Rerun
Arm 6 for DeepSeek only, 5 conversations plus the two «why» questions, same seed policy, same checks, same judges (the
design hash unchanged; the fix is in history assembly, not in the design). The report gains a section «Fix 1»: the
cause, the affected turns, the rerun's results beside the old ones, Z6 restated for DeepSeek, and whether any other Z
line moves (expected: none — the other arms were clean). The old transcripts stay in the repo, marked.

## Done when
Cause named with the line; the test green; reasoning kept on every turn from here on (the game harness too —
`GAME_PLAYER_*` stages inherit it before DeepSeek sits at the DM's table, `OPEN_WEIGHTS_1` step 0); the DeepSeek arm-6
rerun in the report; the money. One line in `docs/RESEARCH_LOG.md` under «The instrument»: the record now holds what the
model thought as well as what it said, and the two are never confused.
