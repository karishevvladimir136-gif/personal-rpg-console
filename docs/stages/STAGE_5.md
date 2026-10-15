# Stage 5 — the new interface (runs in parallel with stages 2b → 3 → 4)

The owner approved running this stage **in parallel** with the turn-loop work. That is an explicit exception to
"one stage at a time" in `CLAUDE.md`, valid for this stage only.

## Setup

- Work in a separate git worktree so the other session's checkout is never touched:
  `git worktree add ../rpg-console-ui -b claude/stage-5-ui claude/stage-2-turn-loop`.
  Install dependencies there. Never run two dev servers on the same port or against the owner's database.
- First commit on the branch: `docs/stages/STAGE_5.md`, the `design/` folder and the current `docs/REBUILD_PLAN.md`
  (all from `origin/claude/handoff`).
- Read `CLAUDE.md`, `docs/REBUILD_PLAN.md` (sections 8–10 describe the UI decisions), `docs/TURN_LOOP.md`.

## Boundaries (to keep the parallel work mergeable)

Do **not** edit: `src/lib/gameplay/dm-loop/**`, `src/lib/server/dm/**`, `src/lib/gameplay/astra-*`, prompts/context
builders, `supabase/migrations/**`, the eval bench. Stage 2b, 3 and 4 own those.
You may edit: `src/components/**`, `src/app/**` (pages, layout), styles, locale files (append new keys; do not
reformat existing ones), and add **new** presentation-only modules in `src/lib/**` (view models, selectors, client hooks).
If a screen needs data the backend does not provide yet, **do not fake it and do not add backend**: hide the block or
show a clearly disabled state ("появится позже"), and record the need in `docs/UI_DATA_NEEDS.md`
(what data, which screen, proposed shape). Stage 4 will pick that list up.
The game screen's streaming hook is being changed by stage 2b: build the new game screen layout around the existing
client state now, and wire the final streaming at the end, after rebasing on the accepted 2b branch.

## Design source

- `design/canvas/*.dc.html` — the approved screens. Each file is inline-styled HTML with template holes `{{…}}`,
  `<sc-for>` / `<sc-if>` blocks and a small logic class that holds **sample data**. Treat them as the visual spec and
  sample content, not as code to copy. Images referenced as `/_blob/...` are placeholders from the design tool; use the
  app's real images (accepted visual assets) or the existing fallbacks.
- `design/registry-reference.html` — the original style: tokens (`:root` variables), panels, plates, tabs, item grid with
  rarity colors, parchment cards, roster rows, codex rows, quest blocks. Start from its tokens.
- Look: dark leather (#16110d / #211913 / #2b211a), brass (#cfa860, dim #8d7142), parchment cards (#eadcbd → #dccaa3),
  rarity colors common #9b938a · relic #64a998 · magic #ae93d6 · story #cfa860, danger #c9563f.
  Fonts: Old Standard TT (display), Alegreya Sans (body), PT Mono (labels, numbers) — load with `next/font/google`.
  One dark theme. Minimum 44 px touch targets, visible focus, Russian first, English kept.

## Universal by design

The UI serves any world, any campaign and any ruleset. Sample content ("Мир Шва" and the rest of the design data)
lives only in preview fixtures. Nothing ruleset-specific is hardcoded: ability scores, skills, resources, equipment
slots, currency, item categories and rarity labels come from the campaign's ruleset/character data and the existing
presentation helpers; a concept the ruleset lacks is simply not shown. Holdings are labelled by kind (transport, base,
mount, camp). Prove it with a second preview campaign on a non-D&D ruleset, and grep non-preview code for sample names
and D&D-specific labels before finishing.

## Screens

| Board | Route / current code | What to build |
| --- | --- | --- |
| `Campaigns.dc.html` | `/campaigns` · `persistent-campaigns.tsx` | Library shell with left nav (Кампании, Миры, Крафт ведущего, Настройки). Featured "continue" card: cover, chapter, place, play time, model pill, hero, "Ранее в…" block (data need — hide if absent), Продолжить / Хроника / Сейвы. Other campaigns incl. an old-runtime badge with "Перевести на новый ход" (wire to the stage 2 runtime setting). Worlds row: existing worlds, "Свой мир своими словами", "Мир из источников" → World Library. |
| `NewCampaign.dc.html` | new-campaign flow · `bootstrap/new-campaign.tsx`, `bootstrap/review.tsx`, `bootstrap/opening.tsx` | Four steps over the **existing** bootstrap flow: Мир → Герой (free text, AI draft sheet review, portrait) → Ведущий (model+effort from stage 2 settings, tone = Positive Afterglow tone, rules, roll mode, "что мне нравится" — data need) → Начало (DM decides / I describe, title, start). World legacy options are a post-release feature: hide. Keep the advanced fighter-template path reachable. |
| `Main.dc.html` | `/campaigns/[id]/game` · `persistent-game.tsx`, `gameplay-*` | Campaign shell (left nav with dynamic "Имущество"/"Лагерь", header breadcrumb, model pill), scene image, player bubble, narration, dice receipts, "что изменилось за ход" chips from accepted changes, dice tray, composer with addressee (companion talk) and the "Твой момент" banner (`playerMoment` from stage 2), right sidebar: hero card, HP, resources, goal, party, threads. |
| `Mobile.dc.html` | same | Narrow layout: bottom tab bar, collapsible sidebar. Every screen must work at phone width. |
| `Character.dc.html` | `character`, `inventory` · `persistent-records.tsx`, `character-artwork.tsx`, `live-inventory-presentation.tsx` | Tabs, party switcher, stats/vitals/resources/skills, paper doll around the full portrait, "Перерисовать" on the portrait with version label, inventory grid with rarity, filters, parchment item card with item image + "Перерисовать", a "рисуется" cell state for new items. |
| `Party.dc.html` | `party` · `companions.tsx` | Отряд / в резерве tags, HP, chips, "К тебе" (only what the hero could observe), "Поговорить" drawer = composer in talk mode with that companion as addressee, "Совет партии", disabled during combat. Lists for crew aboard / people back home. |
| `Journal.dc.html` | `journal` · secondary page | Registry style: main arc with steps, active quests, done (collapsible), open threads, debts & promises, current goal. Quests from records; threads/debts → data need if not available. |
| `Codex.dc.html` | **new** `codex` route | NPCs grouped by relationship (family, allies, murky, neutral, foes) with public notes, factions, search. Only player-known information. |
| `Map.dc.html` | `map` · `atlas-map.tsx` | Restyle the existing atlas (levels, art background, pins from records, place illustration, set destination, pin placement, unplaced list). Add route line and goal/rumor statuses; "Наметить курс" inserts text into the composer. |
| `Holdings.dc.html` | **new** `holdings` route, absorbs `home` / `camp` | Holdings from storages (camp always; transport, base, mount when present). Ship-style detail page: image, specs, features, hold grid, passengers. Nav label "Лагерь" when only camp exists, "Имущество" otherwise. |
| `Settings.dc.html` | campaign `settings` · `campaign-settings.tsx`, `persistent-settings.tsx` | DM model + effort (levels come from the selected model's capabilities — e.g. low / medium / high / extra high / max — not a fixed set of four), narrator mode (two-stage: disabled, "позже"), roll mode, rule books as knowledge, campaign limits (read-only until stage 3), recent-turn stats if available, Images section (below), and all existing settings kept under "Ещё". |
| — | adventures · `persistent-adventures.tsx`, `adventures/*` | Keep the existing flow (Короткое 1–2 ч / На вечер 3–5 ч / Мини-арка 8–15 ч / Без ограничений, same world and heroes, finish with owner feedback). Make it prominent: "Приключения" in the campaign nav, a "Новое приключение" action on the campaign card in `/campaigns`, and the active adventure (title, envelope, progress) shown in the game screen sidebar. Restyle only. |
| — | main menu · `main-menu.tsx` | Keep it (Кампании, Общие настройки, Выход); restyle to match the library shell. |
| — | world library, DM Craft, saves, timeline, world lab, DM chat, library, frame, sessions, gallery | Reskin with the shell and tokens only. No flow changes. |

## Images (fal)

- Today subject images (entity / item / location) use the existing visual-frame pipeline (`src/lib/visual-frame/*`,
  provider OpenAI image models); fal is used for video. The owner wants fal for images too: add fal as an image provider
  option for subject visuals, keep OpenAI as the other option. Check that `FAL_KEY` (or the existing fal key name) is in
  `.env.local` without printing it. Check fal's current docs and propose 1–2 image models with price per image.
- **Auto-generation without touching the turn runtime:** a "visual autopilot" that looks at committed snapshots and
  queues existing subject-visual jobs: new item types without an accepted image (one image per item type — dedupe by
  normalized name + category), new companions and characters with a Character Model (portrait), newly visited places
  (illustration), holdings (image). Respect the settings toggles and a daily cap; never block a turn; keep the previous
  accepted image until the new one is ready; regenerate keeps version history. Style comes from the campaign's visual
  style / Visual Bible.
- Paid image tests are allowed with a **$3 cap**; report cost per image and in total.

## Checks

- Keep the existing preview pages working and add synthetic previews for every new screen
  (like `CampaignCardsReview` and `/preview/live-ui`).
- With Playwright and the preinstalled or locally installed Chromium, capture desktop (1440) and phone (390) screenshots
  of every screen in preview mode into `docs/screens/stage-5/` for the owner.
- `git diff --stat claude/stage-2-turn-loop` must show no changes in the forbidden paths.
- typecheck / lint / test / build pass.

## Done when

All boards above are implemented on preview data and on real data where it exists; `docs/UI_DATA_NEEDS.md` lists what
stage 4 must provide; screenshots are in `docs/screens/stage-5/`; fal images work with auto-generation and regenerate;
checks pass. Report in English: what was built, screenshots path, data needs, image cost, and which files will likely
conflict with stages 2b–4 at merge time. Do not merge anything; nothing to `main`.
