# 2D Live, first slice — ledger of paid calls

Cap **$40** (owner, 2026-10-20; was $25). Every paid call is reserved at an upper bound before it is sent and settled
afterwards from the reply's own usage (OpenAI images, Anthropic) or fal's list price. The machine-readable twin is
`docs/runs/live2d-1-ledger.json` (written by `scripts/eval/live2d/*.mjs`).

| When (UTC) | What | Model | Reserved | Settled | Outcome |
| --- | --- | --- | --- | --- | --- |
| 2026-10-20 07:09 | sheet ford | claude-sonnet-5-5 | $0.036 | $0.009 | ok |
| 2026-10-20 07:09 | scene ford | gpt-image-2.5-sunburst | $0.163 | $0.032 | ok |
| 2026-10-20 07:10 | check ford | claude-sonnet-5-5 | $0.032 | $0.006 | ok |
| 2026-10-20 07:10 | locate ford | claude-haiku-5-5 | $0.001 | $0.000 | ok |
| 2026-10-20 07:10 | sheet warehouse | claude-sonnet-5-5 | $0.036 | $0.009 | ok |
| 2026-10-20 07:10 | scene warehouse | gpt-image-2.5-sunburst | $0.163 | $0.031 | ok |
| 2026-10-20 07:10 | check warehouse | claude-sonnet-5-5 | $0.032 | $0.010 | unparsable |
| 2026-10-20 07:10 | locate warehouse | claude-haiku-5-5 | $0.001 | $0.000 | ok |
| 2026-10-20 07:11 | sheet temple | claude-sonnet-5-5 | $0.036 | $0.008 | ok |
| 2026-10-20 07:11 | scene temple | gpt-image-2.5-sunburst | $0.163 | $0.031 | ok |
| 2026-10-20 07:11 | check temple | claude-sonnet-5-5 | $0.032 | $0.006 | ok |
| 2026-10-20 07:11 | locate temple | claude-haiku-5-5 | $0.001 | $0.000 | ok |
| 2026-10-20 07:11 | sheet mine-yard | claude-sonnet-5-5 | $0.036 | $0.008 | ok |
| 2026-10-20 07:11 | scene mine-yard | gpt-image-2.5-sunburst | $0.163 | $0.031 | ok |
| 2026-10-20 07:12 | check mine-yard | claude-sonnet-5-5 | $0.032 | $0.007 | ok |
| 2026-10-20 07:12 | redraw mine-yard | gpt-image-2.5-sunburst | $0.163 | $0.031 | ok |
| 2026-10-20 07:13 | check mine-yard | claude-sonnet-5-5 | $0.032 | $0.006 | ok |
| 2026-10-20 07:13 | locate mine-yard | claude-haiku-5-5 | $0.001 | $0.000 | ok |
| 2026-10-20 07:13 | sheet forest-camp | claude-sonnet-5-5 | $0.036 | $0.009 | ok |
| 2026-10-20 07:13 | scene forest-camp | gpt-image-2.5-sunburst | $0.163 | $0.031 | ok |
| 2026-10-20 07:13 | check forest-camp | claude-sonnet-5-5 | $0.032 | $0.006 | ok |
| 2026-10-20 07:13 | locate forest-camp | claude-haiku-5-5 | $0.001 | $0.000 | ok |
| 2026-10-20 07:13 | sheet tavern | claude-sonnet-5-5 | $0.036 | $0.010 | ok |
| 2026-10-20 07:13 | scene tavern | gpt-image-2.5-sunburst | $0.163 | $0.031 | ok |
| 2026-10-20 07:14 | check tavern | claude-sonnet-5-5 | $0.032 | $0.006 | ok |
| 2026-10-20 07:14 | locate tavern | claude-haiku-5-5 | $0.001 | $0.000 | ok |
| 2026-10-20 07:14 | sheet market | claude-sonnet-5-5 | $0.036 | $0.009 | ok |
| 2026-10-20 07:14 | scene market | gpt-image-2.5-sunburst | $0.163 | $0.032 | ok |
| 2026-10-20 07:15 | check market | claude-sonnet-5-5 | $0.032 | $0.006 | ok |
| 2026-10-20 07:15 | locate market | claude-haiku-5-5 | $0.001 | $0.000 | ok |
| 2026-10-20 07:15 | sheet guard-post | claude-sonnet-5-5 | $0.036 | $0.009 | ok |
| 2026-10-20 07:15 | scene guard-post | gpt-image-2.5-sunburst | $0.163 | $0.031 | ok |
| 2026-10-20 07:15 | check guard-post | claude-sonnet-5-5 | $0.032 | $0.006 | ok |
| 2026-10-20 07:16 | locate guard-post | claude-haiku-5-5 | $0.001 | $0.000 | ok |
| 2026-10-20 07:16 | region map | gpt-image-2.5-sunburst | $0.163 | $0.033 | ok |
| 2026-10-20 07:16 | seeds region | claude-sonnet-5-5 | $0.029 | $0.009 | ok |
| 2026-10-20 07:19 | sheet warehouse | claude-sonnet-5-5 | $0.036 | $0.009 | ok |
| 2026-10-20 07:19 | scene warehouse | gpt-image-2.5-sunburst | $0.163 | $0.031 | ok |
| 2026-10-20 07:19 | check warehouse | claude-sonnet-5-5 | $0.032 | $0.007 | ok |
| 2026-10-20 07:19 | redraw warehouse | gpt-image-2.5-sunburst | $0.163 | $0.032 | ok |
| 2026-10-20 07:20 | check warehouse | claude-sonnet-5-5 | $0.032 | $0.006 | ok |
| 2026-10-20 07:20 | locate warehouse | claude-haiku-5-5 | $0.001 | $0.000 | ok |
| 2026-10-20 07:20 | preview art hero.jpg | gpt-image-2.5-sunburst | $0.165 | $0.053 | ok |
| 2026-10-20 07:21 | preview art tobin.jpg | gpt-image-2.5-sunburst | $0.165 | $0.053 | ok |
| 2026-10-20 07:22 | preview art orm.jpg | gpt-image-2.5-sunburst | $0.165 | $0.053 | ok |
| 2026-10-20 07:23 | preview art veresk.jpg | gpt-image-2.5-sunburst | $0.163 | $0.030 | ok |
| 2026-10-20 07:58 | live ford fight, attempt 1 (turns failed at commit) | claude-opus-5-5 | $1.331 | $1.331 | ok |
| 2026-10-20 07:58 | live lair fight, attempt 1 (stopped) | claude-opus-5-5 | $0.500 | $0.500 | ok |
| 2026-10-20 08:17 | Part 2 live probe: the lair fight (5 turns, Opus 5.5; the bench guard stopped the last turn at USD 3.5) | claude-opus-5-5 | $2.804 | $2.804 | ok |
| 2026-10-20 08:18 | live ford fight, attempt 2 (turn failed at commit: the turn lease) | claude-opus-5-5 | $0.409 | $0.409 | ok |
| 2026-10-20 08:18 | live ford fight, attempt 3 (turns failed at commit: a check on a foe not yet in the DB) | claude-opus-5-5 | $0.657 | $0.657 | ok |
| 2026-10-20 08:18 | Part 2 live probe: the ford ambush (5 turns, Opus 5.5) | claude-opus-5-5 | $1.610 | $1.610 | ok |

**Spent so far: $8.045 of $40** (52 calls).
