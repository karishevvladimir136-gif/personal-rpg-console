# D1 owner panel: synthetic browser review

The actual `WorldLabPanel` and its CSS were exercised in the Codex in-app browser using an isolated local harness with an injected, scripted transport. No Supabase, provider/model call, hosted deployment, real campaign, or physical iPhone/Safari was involved. This is component verification, not owner acceptance or integrated API verification.

## Viewports and language

English and Russian were inspected at **1365 × 900** desktop and **390 × 844** mobile viewport overrides. DOM document width equalled scroll width in all four views (1350 desktop and 375 mobile, excluding the scrollbar). NON-CANON / НЕ КАНОН, the deterministic-scope explanation, approved premise, chronology and controls were visible. On mobile, an existing experiment appears ahead of the preparation form. Inputs use 16px text at narrow widths.

Native browser screenshots are local ignored artifacts relative to this worktree:

- `test-results/d1-ui-preview/en-desktop.png`
- `test-results/d1-ui-preview/ru-desktop.png`
- `test-results/d1-ui-preview/en-mobile.png`
- `test-results/d1-ui-preview/ru-mobile.png`

## Interactions observed

- A scripted Continue committed, then deliberately lost its response. The panel froze edits and offered the exact retry. The visible synthetic audit showed **2 requests / 1 saved operation** after retry; world time advanced once, from 07:00 to 08:00, with one new checkpoint.
- Pause removed Continue and showed Resume. Resume restored explicit Continue without advancing time. Cancel preserved checkpoint history and removed further execution controls.
- Preparing a new 90-minute experiment retained the 06:00 starting time and displayed a 07:30 horizon. Preparation did not advance time.
- English and Russian empty states explained the missing stable configured World save and approved Scenario/Divergence. No prepare action was offered without those inputs.
- Browser warning/error log was empty for the reviewed interactions.

## Reusing the local harness

From `.worktrees/d1-ui`, run `node.exe test-results/d1-ui-preview/server.mjs`, then open `http://127.0.0.1:4189/`. The ignored harness uses the existing Next webpack bundle and TypeScript transpilation, imports the actual component and CSS, and provides language/empty-state/interrupted-response controls. It is not a production route. Generated harness files are excluded from lint with `--ignore-pattern 'test-results/**'`; the production component and committed tests are linted normally.

## Worker verification and limits

- 10 focused client/render tests passed.
- Next type generation and non-incremental TypeScript check passed.
- Focused lint and repository lint excluding ignored generated harness files passed with zero warnings. A first repository lint invocation included the generated webpack bundle; its generated-code warnings were unrelated to production source.
- `next build --webpack` passed in this UI worktree before Lead route integration.

Lead QA identified two integration-boundary repairs after this browser review: the route's error envelope and pre-start timestamps on inherited public observations. Lead owns those repairs and their separate regression checks. The synthetic fixtures used here did not exercise those two cases. Full integrated storage/API verification, hosted behavior and physical-device testing are not claimed.
