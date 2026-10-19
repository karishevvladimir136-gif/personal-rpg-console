# Memory stage — the DM remembers what matters before the scene, not only when asked (draft)

Planner's draft, 2026-10-18, from the owner's review of what other AI RPGs do (planner's research in the chat:
Friends & Fables' per-NPC memory and planning step, SEP's three-tier memory with proactive retrieval, Hidden Door's
lack of a world under the prose, AI Realm's notes-and-summaries memory drifting into a Mary Sue within four hours).
**Launch after the voice stage** (both touch `src/lib/gameplay/dm-loop/context.ts`). Cloud session, branch
`claude/memory` from the voice branch; paid calls within $10, in a ledger; report in English.

## What we already have (no rebuild)

- **The event log:** every turn, receipt and record change is stored; records are versioned; the snapshots of polish 3
  restore any turn.
- **Per-person memory, richer than Friends & Fables':** each Character Model holds wants, the current goal, stress and
  obligation, beliefs about others, relationships (affection, trust, respect, an unresolved hurt) and **episodes** (a
  memory with its meaning and a cue), plus the speech profile; the full model of everyone present travels with the
  turn, the core of the people mentioned, a line for the rest (`peopleModels`).
- **A relationship graph in pieces:** the relationships live on each model, factions and their clocks in the private
  notes.
- **Retrieval:** the Memory sources are searched before the turn by the names of the people present or named in the
  input (`memoryQueryFor`), full-text (Russian, English, simple), ranked by authority, unresolved, significance.

## The gap the owner picked: «the DM does not know what it does not know»

Retrieval is keyed on names and words of the input. An old debt, a promise, a clue or a grudge that bears on this
place or this action but names nobody present never surfaces, and a storyteller fills the gap by inventing something
new — the drift every long AI campaign shows. Fix it before the turn:

1. **A scene brief before the DM writes.** A wide candidate pool — the Memory sources by participants, place and
   topic (40–60 rows), open quests, debts and promises, the episodes and unresolved hurts of the people present,
   off-screen plans touching this place or these people, the clues of active mysteries (`clues_*` facts), unanswered
   questions (`open_questions`) — and a fast model (Claude Haiku 5.5; Jev as a measured alternative if its latency and
   accuracy hold) picks the 6–10 that matter to this scene and writes three or four lines: «what from the past is in
   play here». It goes into the turn's tail (the writer's, in the split). Target: under 1.5 s added before the DM's
   request, in parallel with the other pre-turn reads; when it fails or times out, the turn goes as today.
2. **The same call picks the craft cards.** Replace the keyword selector of polish 3 §7 with the brief model's choice of
   0–2 cards for this scene (the keyword selector stays as the fallback and for tests).
3. **`recall` — the DM can search memory itself.** A read-only tool: a question in words («что Марта говорила про
   баржу?») returns the matching Memory rows and episodes with their turn and game time. Counted and capped per turn.
4. **The NPC's planning step** comes with the voice stage («want before the line»); here make sure it reads the
   person's episodes and unresolved hurt, so the line comes from what they remember of the hero.
5. **Episodes are actually written.** Measure in the session reports how many episodes and relationship changes each
   named person gets per session; if the DM skips them, the bookkeeper (in the split) or the digest writes them from
   the ledger.
6. **Meaning-based search, only if needed.** If the brief still misses things the judge finds (step 7), add embeddings
   (pgvector in the sandbox's Supabase) to the candidate pool; not before.
7. **Proof.** On the replay tool with session 1's and session 2's turns: the judge (Sonnet) lists, per turn, the
   earlier facts that bear on it and whether the narration used, ignored or contradicted them; compare the DM with and
   without the brief. Plus latency and cost per turn.

## Also from the review

- **A status line over every turn** (AI Realm): time, date, place, weather, from the world clock and the party's
  place — in the game screen, not in the prose.
