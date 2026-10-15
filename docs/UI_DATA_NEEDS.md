# UI data needs (Stage 5 → Stages 3–4)

Stage 5 built the new interface on the public data that exists today. Where a board needs data the backend
does not provide, the block is hidden or shown disabled with «появится позже» — nothing is faked and no backend
was added. Each row: what data, which screen, a proposed public shape. All shapes are player-visible
projections only (what the hero knows); private DM state stays private.

## Turn and game screen

| # | Data | Screen | Proposed shape |
| --- | --- | --- | --- |
| 1 | Accepted changes of a **committed** turn (the stream shows them live, then they vanish) | Game: «Что изменилось за ход» chips | `PublicTurn.changes: { tool: string; ok: true; summary: string }[]` — the public-safe receipt summaries already produced by the loop |
| 2 | The `playerMoment` flag of `finish_turn` | Game: «Твой момент» banner | `PublicTurn.playerMoment: boolean` |
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
| 14 | A full-length figure separate from the portrait | Character paper doll | subject-visual composition `"figure"` for entities (today the doll shows the accepted portrait) |
| 15 | **fal pictures persisted** | Subject visuals, autopilot, «Перерисовать» | SQL validators of `subject_visual` jobs (schema 5) and their asset provenance accept `provider = 'fal'`, the fal model IDs (`fal-ai/flux-2-pro`, `fal-ai/flux-2/flash`) and a fal reservation (≈ $0.03–0.05). TypeScript side is ready (`src/lib/visual-frame/fal-image.ts`, `src/lib/server/media/fal-image-provider.ts`). Until then the pipeline stays on OpenAI. |
| 16 | Autopilot settings in the campaign (today: on this device) | Settings → Картинки | `CampaignSettings.visualAutopilot: { enabled; items; portraits; places; holdings; autoAccept; dailyCap; provider: "fal" \| "openai" }` (needs `settings_valid` to accept the key) |

## Campaigns and creation

| # | Data | Screen | Proposed shape |
| --- | --- | --- | --- |
| 17 | Real play time; campaign status (finished, epilogue) | Campaigns library cards | `Campaign.playMinutes: number`; `Campaign.status: "active" \| "finished"` |
| 18 | «Ранее в…» in the DM's voice at entry (today: the recap of the last closed session, hidden when empty) | Campaigns featured card, game entry | `Session.previously: string \| null` (Stage 4, §10.2) |
| 19 | «Что мне нравится» note, visible and editable | New campaign (step DM), Settings | `campaignNotes.playerLikes: string` (Stage 4, §10.7) |
| 20 | Tone, rules and roll mode chosen **before** the campaign exists | New campaign step 3 (today they are set after creation in settings) | bootstrap `creation.commit` accepts `{ dmTurn; emotionalTone; rulesSystem; interactiveDice }` |
| 21 | Worlds: number of campaigns, rules label, whether a visual style is set | Campaigns → Worlds row | `PublicWorld.campaignCount; rulesLabel; hasVisualStyle` |
| 22 | Two-stage narrator; campaign limits as settings | Settings (shown disabled / read-only) | Stage 3: limits in campaign settings; two-stage mode as a campaign option |
