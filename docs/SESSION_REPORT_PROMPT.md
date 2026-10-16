# Message for the local Claude session: a mission report of one sandbox play session

Send to the local session on the owner's laptop (the one that runs the sandbox). Reusable after every test session.

```
Owner request: a full mission report of my sandbox play session. READ-ONLY. Talk to me in RUSSIAN, briefly.

Hard rules: sandbox database only (the separate Supabase project «personal-rpg-console-sandbox», ports 4432x) — never
my real project; change nothing in any database; never print, log or write any key; do not commit or push anything;
write files only into C:\dev\rpg-exports\session-1\ (create it; it is outside the repo).

Campaign: the latest campaign in the sandbox (hero «рэй», world «Ржавое побережье»), session 1, all committed turns.

A. Data files
1. transcript.md — every turn in order: turn number and game time; the player's input verbatim; the full narration
   exactly as stored and shown (all text parts in order, including any text after tool results); every roll (actor,
   formula, dice, modifier and its source field, advantage, DC, total, success/failure, visibility player/private,
   the reason text, whether it paused for interactive dice and what the player clicked); every receipt / change chip
   text as the player saw it; whether «Твой момент» (playerMoment) was shown; HP and money after the turn; items
   gained / lost / changed; quests, debts, promises, threads opened or closed; time passed; scene kinds, tension and
   nextTension from finish_turn; which off-screen plans came due or resolved.
2. turns.csv — one row per turn: turn, effort (pinned and actually used), first_word_ms, full_turn_ms, model_requests,
   tool_calls (by name), input_tokens, cached_tokens, cache_write_tokens, output_tokens, reasoning_tokens,
   cache_read_share, cost_usd, rolls, player_moment (y/n), frames drawn, picture cost.
3. state.md — the final journal (quests with full text, debts, promises, threads), the codex (people with public
   profiles and relationship, factions, places incl. rumours), the map records (places, parents, markers), the party,
   the inventory with every item's name, description, note and picture versions, the hero sheet as stored (all
   fields, incl. the combat profile and skills).
4. private.md — clearly marked PRIVATE: the DM's notes, plans (created when, due when, fired/resolved when, outcome),
   Character Models of every person (full text, size in bytes, episodes), the DM notebook, the likes note.
5. pictures.csv — every picture (anchors and frames): kind, subject, turn, model, style version, latency, cost,
   accepted automatically or not, prompt length; plus the total picture spend.
6. session_close.md — what happened when I pressed «Закончить сессию»: which code path ran (Stage 4 digest or the
   legacy session close), and the stored result (chapter title, «Ранее в…», notebook) if any.

B. Analysis — report.md, in RUSSIAN, short sections, numbers first:
1. Totals: turns, play time, game time, total cost (DM + pictures + other), cost per turn, median / p90 first word
   and full turn.
2. Speed: does first-word time grow with the turn number? Correlate with effort, model requests, tool calls, and
   uncached input tokens; name the main cause with the numbers.
3. Rolls: count by actor; the hero's modifiers (how many at +0 and why — what the sheet contains), DC distribution,
   success rate; advantage use; natural 20s / 1s and what they changed in the narration; NPC/private rolls that
   appeared in the player's chips.
4. «Твой момент»: every occurrence — after a successful decisive roll, after a failure, or with no roll.
5. Consistency audit: list every fact the DM relied on from earlier turns (debts, terms, signals, names, places,
   items) and check it against the records — contradictions or forgotten facts, with turn numbers. Check the money
   ledger and every item movement end to end.
6. Leaks: anything private (plans, notes, NPC rolls, people not yet met) shown to the player.
7. Records quality: items recorded as «used» when they were lost / taken off / pledged; double records; English text
   in player-visible records.
8. Narrative shape: scene kinds and tension per turn as a simple timeline; threads opened vs closed; off-screen plans
   created vs fired; whether any combat, chase or open threat occurred; what hooks to a larger mystery exist (from
   the private plans and notes) and whether any reached the player; how the session ended.
9. Russian voice metrics on the narration: Latin letters in visible text, канцелярит markers («является»,
   «представляет собой», «данный», «осуществляет»), long participle chains, sentences of near-equal length in a row,
   the most repeated phrases and words (e.g. one character's verbal tic), ты/вы per pair of characters.
10. The five strongest moments and the five weakest, quoted briefly with turn numbers.

Do not fix anything. When done, tell me in Russian: the folder path and a 5-line summary.
```
