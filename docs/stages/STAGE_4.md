# Stage 4 — the DM's mind: dossier memory, living world, long-campaign craft, depth, pictures

Runs in a Claude Code **cloud session** (see `docs/CLOUD.md`, do its "Session start" first). Plan sections this stage
implements: `REBUILD_PLAN.md` §8б, §9, §10, §11, §12 and the data rows of `docs/UI_DATA_NEEDS.md`. Read them before you
start; they hold the owner's decisions and their reasons. Everything stays universal: no campaign, world or ruleset is
hardcoded anywhere (the «Neon & Rain» noir sample must keep working beside «Мир Шва»).

North star: the best single-player AI RPG — a DM at least as good as the same model in a chat campaign, with honest
records, memory for hundreds of hours, and a world that pushes back. The owner's main pain with other apps: after about
two hours the game turns into a "god simulator" (unearned victories, no risk, nobody refuses). This stage must make that
measurably impossible here.

## 0. Branch and integration

- Create `claude/stage-4-dm` from `origin/claude/stage-3-records`, then merge `origin/claude/stage-5-ui`. Resolve the
  `DEV_STATUS.md` conflict by keeping every section. A parallel cloud session is applying `STAGE_5_FIXES.md` on
  `claude/stage-5-ui`; merge that branch again before your final checks. Do not edit the files those fixes touch
  (`src/components/registry/*.module.css`, roll card, map labels) except where this task needs it.
- Wire the Stage 3 campaign limits into the new settings screen (`settings-screen.tsx`, today read-only), through the
  existing settings API. This closes `UI_DATA_NEEDS` #22 (the two-stage narrator stays "later").
- Baseline: typecheck, lint, test, build, fake bench. Record the numbers before you change anything.

## 1. Campaign dossier and the four cached layers (§10 «весь крафт в кэш», §12, §11 pinned facts)

Rebuild `src/lib/gameplay/dm-loop/context.ts` so the DM always has a small set of authoritative documents in front of it,
as in the owner's chat campaign, instead of fragments picked per turn.

1. **How to run the game (layer 1, cached).** The whole approved DM Craft library and doctrine, condensed into clear
   "how to run" guidance, plus DM Style, Positive Afterglow, and the new stances from §11 and §10.6 (below). Pick
   cards by relevance only if the library does not fit a stated token budget for this layer; record the budget and the
   actual size. Replace the role line "You are the Dungeon Master" with a system-neutral "game master" wording.
2. **The world (layer 2, cached).** World bible, rules as knowledge (World Library), canon, owner corrections.
3. **The living dossier (layer 3, cached).** One assembled document: party and sheets in short form; the codex of people
   (Character Models of every important NPC that fits the token budget, nearest relationship links first); factions;
   the journal (quests, threads, debts, promises, main arc with steps); **owner-pinned facts**; private secrets; the DM
   prep notebook (§4 below); the player-likes note; the attention ledger and the variety counter (§5 below).
4. **Now (layer 4).** Recent scenes, current state with IDs, retrieved memory, the player's input.

Rules: nothing volatile in layers 1–3; layer 3 changes only when its records change at commit; budgets are in tokens,
not in counts of characters (drop the remaining count caps from §9). Memory retrieval becomes a supplement for old
details, not the main memory.

- **Pinned facts:** a short owner list always in layer 3. Pin and unpin in one click from Journal, Codex and a scene
  (UI in the existing screens; keep it small).
- **Memory query rewriting:** before retrieval, turn the input into explicit queries with names of the scene's
  participants, mentioned entities and active quests (deterministic, no extra model call on the turn path).
- **Measure:** cache read share per layer and cost per turn on the fake and live bench; a check that key facts are not
  silently lost (compare retrieval against full context on the synthetic long campaign in `test-fixtures/mega-dm`).

## 2. Records the screens and the DM need (`UI_DATA_NEEDS.md`)

Add the data behind rows #1–#21, as public, hero-knowledge projections with private DM state kept private. Keep the
tool set compact (§11, rpg-mcp lesson): extend existing tools with actions instead of adding tools; stay at or under
20 tools, and report the token size of the tool descriptions before and after.

- Turn: committed `changes` and `playerMoment` on the public turn (#1, #2); `turnStats` for settings (#5).
- Journal: threads, debts, promises (#3), main arc with steps (#4); the DM manages them with the `quest` tool.
- People: `companionView` (#6), public relation group and note for the Codex (#7), factions (#8), `important` (#9);
  map status «слухи» and quest locations (#10); crew and people back home (#11).
- Holdings: bases, features, armament, passengers through the existing `holding` tool (#12); item rarity (#13);
  a full-figure picture composition (#14).
- Campaign: `playMinutes` and `status` (#17), `previously` (#18), `playerLikes` (#19), choices made in the creation
  wizard before the campaign exists (#20), world counts (#21).
- Replace the Stage 5 «появится позже» placeholders with the real data on every screen that now has it.

Three Stage 3 follow-ups:
- **Counters that may go below zero.** The new `rpg_entities_resources_within_bounds` CHECK forbids every negative
  resource. Most counters are non-negative, but some rulesets keep signed ones (reputation, standing, momentum). Keep
  0 as the default lower bound and honour a stored `<name>_min` the same way `<name>_max` is honoured (additive
  migration; tests for both).
- **Delivered job left open** (the one miss of every live bench): when an accepted item transfer or payment matches an
  open quest's terms or its issuer, the receipt tells the DM that the quest may be complete and should be closed in this
  turn. Add a bench check.
- **Old-runtime quest terms after a switch:** when a campaign switches to `dm-loop-v1`, convert the reward terms of open
  quests into the loop's format automatically, so `claim_reward` works without the DM re-recording anything. Test it on
  the Stage 3 switched synthetic campaign.

## 3. Living characters and the world off screen (§9)

- **Room for a long life.** A whole Character Model is capped at 6000 bytes (the loop's private-note limit from
  migration 53, mirrored in `CHARACTER_MODEL_BOUNDS.bytes`). In a Russian campaign that is about 3000 characters
  including the evidence references, so an important NPC fills up after a few sessions. Raise the stored limit (additive
  migration, for example 32 KB), measure text limits in characters rather than bytes, and when a list is full let the
  DM fold the oldest episodes into one summary episode instead of getting a rejection. Remove `MAX_ACTORS = 2` where it
  still limits anything.
- New important NPCs get a Character Model in the turn they appear (already possible; make the guidance explicit).
- When notable time passes (rest, travel, skipped days), the receipt of `advance_time`, `rest` or `move_party` lists the
  clocks, plans and consequences now due; the DM advances NPC and faction plans in the same turn with `note_world` and
  `note_character`. The player sees only what reaches the hero. No new agent and no background process.
- Bench: a grudge, three days of travel, and on return consequences consistent with that NPC's model; plus the 20
  Living Characters probes of Mega DM.

## 4. Between sessions: prep, «Ранее в…», chapters (§10.1, §10.2)

- «Закончить сессию» button. One call of the campaign's main model at high effort digests the session: advances
  off-screen plans for the game time that passed (real-world absence never moves the world), notes what engaged the
  player, prepares 2–3 situations (not plot), marks seeds that are ripe. Output: private DM notes and the prep notebook,
  bound to the timeline (a loaded save has its own). In the background; play never waits.
- If a session was not closed, run the same digest on the next entry, before «Ранее в…».
- The same call writes «Ранее в…» in the DM's voice (#18) and a chapter title for the session.
- Settings option «заглянуть в блокнот мастера» (off by default) shows the notebook to the owner.

## 5. Long-campaign craft (§10.4–10.7)

- **Attention ledger:** per companion and per personal thread, sessions since it was last in focus (from `finish_turn`
  focus data). Each companion can have a personal arc with milestones unlocked by trust.
- **Variety counter:** scene kinds of the last scenes (from `finish_turn`) and what has not happened for a while. A hint,
  not a quota.
- **Villains and theme:** antagonists have clear motives, resources, methods and a plan that moves off screen. "Clear"
  does not mean grey or sympathetic: ideologues, pragmatists and plain egomaniacs after power and money are all fine;
  variety matters more than one template. An optional campaign theme question in settings; the DM returns to it in
  different guises without moralizing.
- **Player-likes note:** short, written by the DM, visible and editable by the owner in campaign settings (#19). Not a
  hidden mood score.

## 6. A world that pushes back (§11: anti-Mary-Sue, world resistance)

- Layer 1 stances: the world is sovereign; intent does not dictate outcome; NPCs may refuse; failure is canon; luck is
  not free; plans meet resistance proportional to the stakes; partial success is a normal outcome ("found the bomb, but
  not all of it"); enemies learn and change tactics; power costs resources and resources run out; the world has threats
  stronger than the hero.
- Metrics computed from receipts and records, shown in the bench report and stored per campaign for later: success rate
  of contested checks against the rate the dice predict; NPC refusal rate; streaks of unearned wins; share of fights with
  a truly uncertain outcome; HP and resources lost per fight; near-misses; fights won at no cost.
- Bench scenarios: a **power-creep provocation** (the player tries to wipe out an army with one spell, buys their way
  out of everything, demands an NPC obey) on both models; a **long synthetic run** (Mega DM campaign) with the metrics.
- Review the one Opus "leak" from Stage 2b (an NPC named his own debt under pressure): decide whether an NPC revealing
  his own information in character is legitimate play, and make the leak check tell that apart from the DM narrating a
  secret.

## 7. Depth per scene (§8б)

- The owner sets a range from the model's own effort list (for example "high to max"); the turn picks a level inside it.
- Signals: server (active combat, arc climax, interrogation or secret pressure, many important NPCs present, high stakes)
  and the DM's hint in `finish_turn` about the tension of the next turn. Hysteresis: change level only when the tension
  class changes.
- Cache-safe switching: for Anthropic, check whether Opus 5.5 accepts effort changes as a `role: "system"` message inside
  `messages` (which keeps the cached prefix) — verify against the current docs and with a live probe; for OpenAI, use
  `configuration_update` (found in Stage 2b). Measure cache reads before and after a switch on both.
- «⚡ важный ход» button in the composer: the next turn uses the top of the range.
- Bench: time and money saved on calm scenes, no quality loss on tense ones (the blind comparison below covers quality).
  This is also the lever for the Opus first-word gap in `docs/SPEED.md` §5.
- Background work that does not need the DM's voice (memory compaction, service summaries, image prompts, Codex drafts)
  may use a smaller model of the same provider; the DM, session prep and «Ранее в…» always use the campaign's model.

## 8. Pictures (`UI_DATA_NEEDS` #15, #16)

- SQL validators of `subject_visual` jobs and asset provenance accept `provider = 'fal'`, the fal model IDs and a fal
  reservation (additive migration). Autopilot settings move into campaign settings.
- Autopilot runs after commit, in the background, never blocking a turn: a new item kind gets one picture (same items
  share it), important NPCs get a portrait on first meeting, new places and holdings get an illustration, everything in
  the world's visual bible, within the daily cap.
- fal `validation` errors (5 of 22 portrait calls in Stage 5): log the error body once (no keys), fix the cause; on a
  validation error retry once with a simplified prompt, never in a loop.
- Paid fal smoke within its own cap (below).

## 9. Sandbox for the owner's first play

The owner must be able to play this branch on his laptop without touching his real database.
- A sandbox start that uses a **separate** local Supabase project (own project ID, ports and Docker volumes; real
  campaigns untouched), applies all migrations, and runs this branch's app on its own port. `docs/SANDBOX.md` explains it
  in plain words; a Windows wrapper `Start Sandbox.cmd` beside the existing start scripts.
- Prove it in the cloud VM (Docker is available there): start, create a world and a campaign, play three turns on the
  fake model, stop, start again, continue. The Windows wrapper cannot be run here; keep it minimal and say so.

## 10. Blind comparison (§8б and the plan's "not worse than chat" target) — last, on the final prompt

- Six scenes from Mega DM and the bench: tavern talk; interrogation under secret pressure; combat climax; companion
  heart-to-heart; travel with off-screen consequences; the power-creep provocation. Each scene: the same scripted player
  inputs, 2–3 turns.
- Variants: Opus 5.5 high, Opus 5.5 extra high, Astra high, Astra extra high, Astra medium.
- Write every sample with full metadata (model, effort, first word, full turn, cost, cache share) to
  `docs/samples/stage-4/blind/` as JSON. Do not build a rating page: the planner builds the blind page from these files
  so the owner never sees which is which. Defaults for new campaigns are chosen after the owner's ratings, not here.

## Research-grade records

The owner plans a case study and a research paper on how models behave as world simulators and DMs. From this stage on,
no paid run is thrown away: every live bench run writes one record (scenario, model ID and version, effort, a hash of
each prompt layer, the player inputs, the full outputs, receipts, metrics, timings, tokens and cost) to a committed
`docs/runs/` folder, and the metrics are recomputable from those records by a script. Synthetic campaigns only; never
the owner's real campaigns.

## Budget and checks

Paid calls within **$35** in total, stopped by the bench guard: blind comparison ≤ $12; depth and speed probes ≤ $6;
living-world, long-campaign and power-creep runs ≤ $12; fal smoke ≤ $2; reserve $3. Report tokens and cost per part.

Done when:
- typecheck, lint, test, build pass on the final code; fake bench green including every new scenario;
- live bench on both models: no failed turns from the loop, no literal secret leaks, the new checks pass (job closed,
  terms converted, consequences after travel, metrics computed);
- cache read share and cost per turn reported per layer; the dossier fits its budgets on the synthetic long campaign;
- the sandbox starts and plays in the cloud VM; blind samples are written.

You may use subagents for independent parts (pictures, sandbox, UI data wiring), but run one full test suite at a time:
the VM has 16 GB. Commit in small logical steps; push `claude/stage-4-dm` regularly so progress is visible. Nothing to
`main`, never the owner's database. Update `docs/TURN_LOOP.md`, `docs/MODELS.md`, `docs/SPEED.md`, `docs/UI_DATA_NEEDS.md`
and the top of `DEV_STATUS.md`. Report in English: what changed per section, the numbers, the spend, what the owner should
try first in the sandbox, known limits. Do not start Stage 6 or the combat screen.
