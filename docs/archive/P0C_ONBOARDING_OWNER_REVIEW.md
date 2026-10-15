# P0C onboarding — owner review

Status: **verified candidate, awaiting owner/supervisor acceptance**. Branch: `codex/playtest-p0c-onboarding`. Accepted baseline: `f5412649f188c0b6929353a71f661b75bb853591`. Main stays unchanged.

## Open the ordinary application

Open [Campaigns](http://127.0.0.1:3124/campaigns). This is the built application using the disposable rehearsal database. The real owner application on port 3122 and its migration-30 database are unchanged. Provider credentials are absent from this preview; no DM action or paid generation is possible in the review environment. Do not use World Library to begin a simple starter Campaign.

## Before and after

| Before | P0C |
| --- | --- |
| Primary New Campaign created an empty Campaign; playable flow was secondary New Hero | One primary New Campaign opens the existing World + starter Hero flow |
| Small World editor, empty Pack panel, generic review/edit labels | 12-row resizable description; optional Packs in Advanced; Review/Create/Edit World |
| New Hero looked generic; success went to Game | Your Hero · Level 1 Fighter / Starter Rules; success goes to Prepare First Adventure |
| Disabled Detached selector and generic setup labels | Adventure title, free-form guidance and pacing; Review/Save/Edit Adventure; Canon behavior unchanged |
| Containers looked like preparation work | Closed Advanced · objects & containers; explicitly optional owner setup |
| Premise examples looked like required modes | Optional inspiration examples and immediate planning-only explanation |
| Settings mixed narrative preferences with engine administration | Basics → existing play/narrative controls → advisory premise; technical panels and history in closed Advanced sections |

## Click through

1. Campaigns → **New Campaign**.
2. Choose a simple World, or **Create World**. Enter a name and description → **Review World** → **Create World**. **Edit World** returns to your entered wording. No compiler/provenance controls appear.
3. Under **Your Hero**, enter Campaign title, Hero name and Campaign language → **Review Hero & Campaign** → **Create Campaign**. The supported template is an ordinary Level 1 Fighter using Starter Rules.
4. Click **Prepare First Adventure**. On Adventures, use the same primary action, enter title/guidance, keep **Evening · 3–5h** → **Review Adventure** → **Save Adventure**.
5. **Start Adventure** opens Game through unchanged P0A. The meeting house, current location and Local work organiser are established. No quest is accepted for you. The preview deliberately disables sending live DM actions.
6. Open **Campaign Settings**. Basics and ordinary play controls come first. Premise is planning only. Open each Advanced disclosure to confirm AI/world/rules, Pack preparation, rewards/commerce, manual gameplay configuration and settings history remain reachable. Opening or closing a section does not unmount its forms, discard drafts or change authority.
7. For a manual empty Campaign: Campaigns → **Advanced creation** → **Create empty Campaign**. This explicitly creates no World, Hero or Adventure. The original creation and uncertain-request recovery are preserved.

For Russian review use General Settings → Interface Language → Русский → Save preferences **in this disposable preview**. Hero/Campaign language remains a separate choice. English was restored after browser review.

## Browser evidence

Both EN and RU ordinary flows were exercised at **1440×1000** and **390×844**. Separate `DISPOSABLE P0C` World/Hero/Adventure records were created only in the clone. EN Campaign: `d20926ca-00f7-400d-97fe-a1fb7a18fcc9`; RU Campaign: `b9ff88fb-9dea-41bd-885f-608a46554ce9`. Both Start actions reached the unchanged public opening in Game, minute 0, with no automatic quest/combat/reward. No DM action was sent. Advanced settings and empty creation were also checked on the production build. Existing prototype routes were not used for these checks.

Local screenshot directory: `C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review`. Screenshots are review evidence, not app assets or committed campaign data.

| View | Before | After EN | After RU |
| --- | --- | --- | --- |
| Campaigns desktop | [Before](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/before-en-desktop-campaigns.png) | [After](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/after-en-desktop-campaigns.png) | [RU](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/after-ru-desktop-campaigns.png) |
| World desktop | [Before](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/before-en-desktop-world.png) | [After](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/after-en-desktop-world.png) | [RU](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/after-ru-desktop-world.png) |
| World mobile | [Before](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/before-en-mobile-world.png) | [After](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/after-en-mobile-world.png) | [RU](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/after-ru-mobile-world.png) |
| Settings desktop | [Before](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/before-en-desktop-settings.png) | [After](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/after-en-desktop-settings.png) | [RU](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/after-ru-desktop-settings.png) |
| Settings mobile | [Before](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/before-en-mobile-settings.png) | [After](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/after-en-mobile-settings-basics.png) | [RU](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/after-ru-mobile-settings.png) |
| Hero review | — | [Desktop](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/after-en-desktop-hero-review.png) / [Mobile](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/after-en-mobile-hero-review.png) | [Desktop](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/after-ru-desktop-hero-review.png) / [Mobile](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/after-ru-mobile-hero-review.png) |
| Adventure form | — | [Desktop](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/after-en-desktop-adventure-form.png) / [Mobile](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/after-en-mobile-adventure-form.png) | [Desktop](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/after-ru-desktop-adventure-form.png) / [Mobile](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/after-ru-mobile-adventure-form.png) |
| Opening | — | [Game](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/after-en-desktop-game-opening.png) | [Desktop](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/after-ru-desktop-game-opening.png) / [Mobile](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0c-review/after-ru-mobile-game-opening.png) |

Additional screenshots cover optional premise examples, Advanced AI/owner controls, advanced empty creation and the built starter form. No physical-iPhone test is claimed.

## Fresh verification

| Check | Result |
| --- | --- |
| New P0C UI/navigation tests | 8 passed |
| Relevant Campaign/Adventure/Premise/Settings/recovery/P0A/P0BD focused run | 123 passed; zero failures/skips |
| One complete repository run, preview URL 3124 | 1,742 total; 1,741 passed; zero failures; 1 explicit-opt-in Supabase Auth/PostgREST test skipped |
| Route type generation | Passed |
| Nonincremental TypeScript | Passed |
| Repository-wide lint, max warnings 0 | Passed |
| Production webpack build | Passed |
| Built preview / unchanged real-local owner app HTTP | Both 200 |

The full deterministic run includes accepted P0A SQL/save/load, P0BD rendering, Adventure authority/retry, premise history, privacy/import, inventory/progression, media/Lab fencing and save/timeline regressions. Local logs: `test-results/p0c/`. Tests/providers are deterministic/synthetic; provider calls are zero.

## Exact changed areas

- `src/components/persistent-campaigns.tsx` — swap normal/advanced entry points; preserve existing empty mutation path and cards.
- `src/components/adventures/new-hero.tsx` — starter headings, contextual review, World-first input readiness and Adventures success route.
- `src/components/adventures/worlds.tsx` — contextual actions, 12-row editor, compatible/advanced World choices and optional Pack disclosure.
- `src/components/adventures/forms.tsx` — contextual Adventure labels; remove disabled continuity selector without changing setup payload.
- `src/components/adventures/adventures-panel.tsx` — first-Adventure CTA; Game continuation offered only with an active Adventure or recorded location; Start receipt/navigation logic unchanged.
- `src/components/adventures/text.ts` and `adventures.module.css` — scoped EN/RU labels and form layout.
- `src/components/persistent-adventure-loot.tsx` — Advanced label/explanation only.
- `src/components/persistent-settings.tsx` — order and mounted disclosures; authority/draft functions unchanged.
- `src/components/campaign-premise-fields.tsx`, `src/lib/campaign-premise-i18n.ts`, `src/lib/locales/ru.json` — immediate advisory copy, optional examples and four localized Settings labels; existing dictionary entries preserved.
- `tests/p0c-onboarding-ui.test.mjs` — actual component rendering/navigation/review/retry regressions.
- `tests/adventure-v1-ui.test.mjs` — update UI copy/selector expectations; retain P0A Start authority regressions.
- `DEV_STATUS.md` and this guide — candidate status and review evidence.

## Preserved limitations and stop

Campaign-list DTOs expose metadata only, not World/Hero/Adventure readiness. Existing card Continue→Game links stay unchanged, including intentionally advanced empty Campaigns; no heuristic or new backend state was added. Newly created starter success routes directly to Adventures, and a fresh Adventures page does not offer its own Continue-to-Game link until there is an active Adventure or recorded location. Global campaign navigation remains intact.

Pack-backed choices are marked Advanced and explain manual preparation; automatic P0A opening is still limited to the fresh/unplayed no-Pack supported starter Fighter. This is not arbitrary character creation or full D&D 5e. World Library remains the separate advanced authoring system. Campaign premise is not executable DM context or Canon. Stored record wording and advanced technical labels are not globally rewritten.

No migration; original real DB remains at accepted migration 30 without a write in P0C. No provider call, deployment, main merge, accepted runtime/authority change, global polish or second real playtest. Original historical dirty checkout/local main and existing evidence remain untouched. **Stop for owner/supervisor review.**
