# UI data needs (Stage 5 → Stages 3–4)

**Status after Stage 4 (2026-10-16):** rows 1–13 and 17–21 are served by the records of migration 55 and the
public projections (`src/lib/ui/campaign-view.ts`, `runtime_public_turn`, `rpg_dossier`); the screens read them.
Row 20 is served half-way: the new-campaign wizard applies the chosen DM model and effort right after creation and
takes the «what I like» note; tone, rules and roll mode stay in the settings after creation. Rows 14–16 are
pictures and were excluded from Stage 4 by its task (§8). Row 22: the per-turn limits are editable in the settings
(Stage 4 §0); two-stage mode remains a later option.

Stage 5 built the new interface on the public data that exists today. Where a board needs data the backend
does not provide, the block is hidden or shown disabled with «появится позже» — nothing is faked and no backend
was added. Each row: what data, which screen, a proposed public shape. All shapes are player-visible
projections only (what the hero knows); private DM state stays private.

## Turn and game screen

| # | Data | Screen | Proposed shape |
| --- | --- | --- | --- |
| 1 | Accepted changes of a **committed** turn (the game screen shows the streamed ones and keeps them for the turn just played; after a reload they are gone) | Game: «Что изменилось за ход» chips | `PublicTurn.changes: { tool: string; ok: true; summary: string }[]` — the public-safe receipt summaries already produced by the loop |
| 2 | The `playerMoment` flag of `finish_turn` (today read from the streamed receipt summary «Your moment…», so it shows only right after the turn streams) | Game: «Твой момент» banner | `PublicTurn.playerMoment: boolean` |
| 3 | Open threads, debts and promises the hero knows | Game sidebar, Journal | `threads: { id; kind: "thread" \| "debt" \| "promise"; title; detail; status: "open" \| "closed"; sinceSessionId }[]` |
| 4 | Main arc with steps | Journal | `arc: { title; summary; steps: { text; done: boolean }[] } \| null` |
| 5 | Recent turn summary for the owner | Campaign settings: «Последние ходы» | `turnStats: { turns; medianFirstWordMs; medianTurnMs; avgCostUsd; rejectedCalls; cacheReadShare }` (last N turns) |

## People and places

| # | Data | Screen | Proposed shape |
| --- | --- | --- | --- |
| 6 | How a companion treats the hero, as the hero could observe it | Party card «К тебе» | `companionView: { entityId; attitude: string; lastNoticed: string }[]` (observable only; never Character Model text) |
| 7 | Relationship of an NPC to the hero (family, ally, murky, neutral, foe) and a public note | Codex groups | `Entity.publicRelation?: { group: "family" \| "ally" \| "murky" \| "neutral" \| "foe"; note: string }` |
| 8 | Factions the hero knows | Codex | `factions: { id; name; publicNote; relation: "ally" \| "neutral" \| "foe" \| "unknown" }[]` |
| 9 | Which NPCs are important (have a Character Model), for automatic portraits on first meeting | Visual autopilot | `Entity.important?: boolean` (public flag only) |
| 10 | Rumoured places; a place tied to a quest goal | Map statuses «слухи», «цель» from records (today «цель» is the course you plot) | `Location.status` gains `"rumored"`; `Quest.locationIds?: string[]` |
| 11 | Crew aboard a transport; people back home | Party lists | `holdings[].passengers: string[]` (entity IDs); `homeRoster: { entityId; placeId }[]` |

## Holdings, items, pictures

| # | Data | Screen | Proposed shape |
| --- | --- | --- | --- |
| 12 | Bases as their own holding kind; features, armament, passengers of a holding | Holdings detail | Records of the planned `holding` tool exposed publicly: `holdings: { id; kind: "transport" \| "base" \| "mount"; entityId; storageId; placeId; features: { name; description }[]; passengers: string[] }[]` |
| 13 | Item rarity or significance (the colour of a cell) | Inventory, holdings grid, legend | `Item.rarity?: "common" \| "relic" \| "magic" \| "story"` — the UI already renders it when present and shows nothing when absent |
| 14 | A full-length figure separate from the portrait | Character paper doll | **Stage V:** the anchor set draws a `figure` composition of the hero beside the portrait (fal, with the portrait as a reference picture; Settings → Картинки → «Фигура героя в полный рост»). **Integration (2026-10-16):** the paper doll shows the hero's full-figure anchor when one is ready (`character-screen.tsx` reads the `figure` anchor from the picture board); the portrait stays the fallback. |
| 15 | **fal pictures persisted** | Subject visuals, autopilot, «Перерисовать» | **Stage V (migration 54):** fal pictures persist in their own store, `rpg_private.pictures` + `rpg_private.picture_styles` through `public.rpg_pictures`, with versions, a timeline fence, the fal model IDs and the list price per picture; «Перерисовать» makes a new version and the old one stays until the new is ready. The earlier OpenAI `subject_visual` contract (schema 5, SQL validators of migration 40) is unchanged and still OpenAI-only: it was not extended to fal, because the Stage V store replaces that path for fal end to end (no OpenAI grounding review, fal's own safety checker). |
| 16 | Autopilot settings in the campaign (today: on this device) | Settings → Картинки | **Stage V (migration 54):** `rpg_private.picture_settings` per campaign (`frames`, `quality`, `dailyCap`, `autopilot: { enabled; items; portraits; figures; places; holdings; autoAccept; provider }`), read and saved through `rpg_pictures` (`settings.save` with `expectedRevision`). The device ledger remains only for the OpenAI path's attempted subjects. |

## Campaigns and creation

| # | Data | Screen | Proposed shape |
| --- | --- | --- | --- |
| 17 | Real play time; campaign status (finished, epilogue) | Campaigns library cards | `Campaign.playMinutes: number`; `Campaign.status: "active" \| "finished"` |
| 18 | «Ранее в…» in the DM's voice at entry (today: the recap of the last closed session, hidden when empty) | Campaigns featured card, game entry | `Session.previously: string \| null` (Stage 4, §10.2) |
| 19 | «Что мне нравится» note, visible and editable | New campaign (step DM), Settings | `campaignNotes.playerLikes: string` (Stage 4, §10.7) |
| 20 | Tone, rules and roll mode chosen **before** the campaign exists | New campaign step 3 (today they are set after creation in settings) | bootstrap `creation.commit` accepts `{ dmTurn; emotionalTone; rulesSystem; interactiveDice }` |
| 21 | Worlds: number of campaigns, rules label, whether a visual style is set | Campaigns → Worlds row | `PublicWorld.campaignCount; rulesLabel; hasVisualStyle` |
| 22 | Two-stage narrator; campaign limits as settings | Settings (shown disabled / read-only) | Stage 3: limits in campaign settings; two-stage mode as a campaign option |

## fal: portrait prompts refused by the content checker (for Stage 4's autopilot)

Recorded during the Stage 5 fixes, no new paid calls. In the Stage 5 sample run (`docs/screens/stage-5/fal-cost.json`)
5 of 22 requests failed on the first try with a `validation` error, all of them **portraits** on `fal-ai/flux-2-pro`
(`hero-portrait` twice, `meg` twice, `wolf` once); the same prompts succeeded unchanged on a later try. The error body,
logged once by the adapter (`src/lib/visual-frame/fal-image.ts`, no keys in it):

```
HTTP 422: The content could not be processed because it contained material flagged by a content checker.
```

Cause: fal runs a prompt-side content checker on FLUX.2 [pro] before generation. Our portrait prompts describe people
(age, build, nationality, scars, weapons: «a wiry man in his thirties…», «a grizzled German engineer-soldier…»), and
the adapter sends `safety_tolerance: "2"` (strict, the fal default is "2"; the scale is 1 strict … 6 permissive). The checker is
not deterministic: identical prompts pass on a retry, so the refusal is a classifier verdict on an ordinary character
description, not a real policy violation. Items, places, holdings and the atlas (no people) never tripped it.

What Stage 4's autopilot must do (it already never retries in a loop; `planVisualAutopilot` skips attempted subjects):

- Treat `validation` with a «content checker» body as **a refusal of this prompt**, not as a transport error: record the
  subject as attempted for the day, do not re-queue it, and show «не вышло» with the reason in Settings → Картинки.
- Before giving up, allow **one** re-submit of a softened prompt: keep the subject and style, drop age, nationality,
  injuries and weapon words from the description (a presentation-side rewrite; the record is not changed). Budget it
  as a second paid request.
- Try `safety_tolerance: "4"` for portraits in the Stage 4 paid test (cap stated there) and keep whichever setting
  passes the sample portraits; the field is only sent to `flux-2-pro`.
- Nothing in the public error names the flagged words, so there is nothing more precise to log.

**Stage V outcome (2026-10-16):** the Stage V job (`src/lib/visual-frame/picture-job.ts`) treats a `validation` reply
with a content-checker body as a refusal of this prompt, re-submits once with a softened description (age, nationality,
injury and weapon words removed; `softenPrompt`), and otherwise records the row as failed with the reason — never a loop.
Portraits on `fal-ai/flux-2-pro` are sent with `safety_tolerance: "4"`. The paid runs of this stage
(`docs/runs/stage-v/`) rendered the whole anchor set of both samples on FLUX.2 [klein] 9B with no refusal at all.
