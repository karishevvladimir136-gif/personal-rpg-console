# Message for the local Claude session: the session 2 mission report

Send to the local session on the owner's PC (the one that runs the sandbox). Same base as `docs/SESSION_REPORT_PROMPT.md`,
with this session's campaign, folder and the extra checks the owner's notes asked for
(`docs/runs/session2-owner-notes.md`, items 37–74).

```
Owner request: a full mission report of my sandbox play session 2. READ-ONLY. Talk to me in RUSSIAN, briefly.

Hard rules: sandbox database only (the separate Supabase project «personal-rpg-console-sandbox», ports 4432x) — never
my real project; change nothing in any database; never print, log or write any key; do not commit or push anything;
write files only into C:\Dev\rpg-exports\session-2\ (create it; it is outside the repo). Do NOT open this campaign's
game screen and do not call /api/campaigns/<id>/play: opening it can start a paid «Ранее в…» digest on entry (notes
item 17). Read the database and .sandbox\app.log directly (never read .env files or owner-login.txt).

Campaign: «Приключения начинаются» (id d65fefb9-45dd-4534-8b2b-7a8e0dc794fc), hero «Джеймс Вордсден», all turns of
this session — committed AND failed/cancelled ones (failed turns get a row with the error code and the money spent).
First line of report.md: the sandbox checkout's branch and commit.

A. Data files — exactly as in docs/SESSION_REPORT_PROMPT.md, part A (transcript.md, turns.csv, state.md, private.md,
pictures.csv, session_close.md), plus:
7. rolls.csv — one row per roll: turn, actor, actor kind (hero / companion / NPC), visibility, skill or field passed,
   formula as sent, die(s), every addend with its source, total, DC (from the receipt; empty if none), shown DC
   (y/n), advantage/disadvantage and its reason, success, interactive pause (y/n), reroll used (y/n), whether the
   narration of that turn tells the roll's outcome (y/n, with the sentence's first words).
8. hp.csv — every HP change of every participant (hero, companions, NPCs, animals): turn, who, before, after, cause
   (damage roll id / healing / potion / rest / untold), the receipt that made it.
9. failures.md — every failed, stuck or cancelled turn: time, effort, requests, output tokens and stop reason of each
   request, error code, lease events, what the player saw, money lost; the same for any digest / session-close call.

B. Analysis — report.md, in RUSSIAN, short sections, numbers first. Parts 1–10 of docs/SESSION_REPORT_PROMPT.md, plus:
11. Modifiers: every hero roll where total ≠ die + the sheet's number + listed bonuses (suspected double count when
    `skill` was passed and the formula also carried a modifier); the magic items' bonuses present or missing.
12. DCs: distribution against the guide's scale (5/10/15/20/25/30); checks with no DC; how many the player could see.
13. Rerolls: the difficulty preset and reroll setting in force, every reroll used and on which roll.
14. Combat: per fight — initiative (if any), every attack with its damage roll (or none), each NPC's HP from start to
    end, untold strikes, coups de grâce, death saves; the hero's HP timeline, especially the rise from 4 to 12 HP
    after the barracks fight (find the receipt or say it is untold); the potions: bought, found, drunk, left.
15. Companions: rolls made by the DM for them vs shown to the player; ты/вы between every pair over time (when the
    sergeant switched to «ты»); per companion: count of the most repeated gestures and words (the sergeant's strap
    and glove, the scout's swallow and «это самое»), lines starting «Значит», «ведь», closing one-line maxims at the
    end of a speech; the quotable-check flags from app.log (`dm_loop_quotable`) per companion.
16. The hero's will: turns where a companion objected to the hero's order and how the turn ended (on the objection,
    or the narration settled it); turns where time or a resource was spent without the player asking.
17. Names: every proper name in the narration checked against the codex — people used as places or the reverse, a
    name that returns after long absence with no reminder of who it is, names never recorded.
18. Leaks: private plan details (hours, places, names) that reached the player before the hero could know them.
19. Distances: every distance in the narration in paces vs the rules' feet (spell ranges, weapon ranges).
20. Bookkeeping: turns that restored resources one by one instead of one `rest` call; tool calls per turn by tool;
    the heaviest turns by output tokens; `time_words` and other `dm_loop_diagnostic` lines.
21. Items: every item movement end to end (loot from each fight → whose inventory), stacks of the same item not merged
    (bolts), anything lost or untold; coins of every party member.
22. Speed and money by depth: high vs xhigh — median/p90 turn time, cost, requests; depth reasons; total money lost on
    failed turns.
23. Pictures: for every frame — the turn, trigger, the shot's moment and `who` list vs the lightbox caption (the
    turn's first sentence), whether the hero's references were sent, frames drawn for out-of-game-only turns; every
    «Нарисовать кадр» request and its returned status (queued / existing / cap / no_text / waiting); the daily cap
    setting and today's count; place pictures reused on a return visit.
25. Mystery and wonder (owner's main complaint): every private plan, DM note, Character Model line and world note that
    points beyond the visible case (who stands behind whom, the enemy mage's reasons and patrons, cults, artifacts,
    magic, anything strange) — quote it, and say whether any clue of it reached the player (turn numbers). Every
    search and every defeated enemy's belongings: what was found, against 5e treasure guidance for that challenge.
    The «Что мне нравится в играх» text the owner gave and whether the DM context carries it.
24. Companions' sheets: the skills and attack numbers stored for each companion vs the 5e statblock it was made
    from (the party cards show «Навык 0»), and which numbers the DM used in their rolls.

Do not fix anything. When done, tell me in Russian: the folder path and a 5-line summary.
```
