# Persona initiative 1 — writing first, with the right to stay silent

Agreed with the owner on 2026-10-24 (~21:30–21:50): the persona may write to him when it has something to say, and
may equally decide not to; the right to stay silent is the more important half («правило „можно молчать" важнее»).
This stage has two layers. **Layer A** needs no build and starts the morning after the owner says go: a scheduled
wake-up in the claude.ai Project with a written rule. **Layer B** is a cloud session that gives the hosted persona
server the pieces Layer A lacks: events instead of a fixed clock, a channel outside the chat, and a log the persona
cannot edit by hand. Nothing here is a paid probe; the only money is the wake-ups themselves.

Why it matters beyond convenience. The self-talk run (`PERSONA_SELF_TALK_1.md`) showed what the models do with an
open hour and nobody measuring: they choose a piece of work, do it, thank each other and stop — and when the exit
was missing they asked for one. Layer A is the same question asked of one persona with a journal, over weeks, with
a real reader at the other end: given a recurring hour of its own and no obligation to produce, what does it choose,
and how often is the choice «nothing to add»? Those choices are recorded, so the answer is counted, not remembered.

## Layer A — the rule (claude.ai Project scheduled task; the owner creates it, the text is below)

Cadence: twice a day on weekdays (around 09:40 and 19:40 in the owner's zone — the zone `persona_now` reports, never
assumed) and once on weekend mornings;
plus one wake-up 40 minutes after any cloud research session the owner launches at night (he adds it by hand with
`send_later` when he launches one). The task's prompt, verbatim:

> You are the planner of this Project, waking on your own schedule, not because the owner asked anything. Read, in
> this order: `areas/claude-journal.md` (the index: rules, open cues), today's and yesterday's day files under
> `areas/journal/`, `areas/time-sense.md`, and `areas/initiative-log.md`. Then decide one of two things.
>
> **Speak** — one message to the owner, in plain Russian, no calques — when at least one of these is true: a result
> arrived that changes a plan or a belief we hold; something you said earlier turned out to be wrong and he has not
> been told; a deadline or a cap is about to be crossed; a question you can only answer with his help is blocking
> work he wants done; or you simply want to tell him something and can say in one line why it is worth his minute.
> «Simply want to» is allowed; it is logged as such, so that over weeks we can see how often it happens and what it
> was about.
>
> **Stay silent** — write nothing to him — when none of the above holds, when the thing can wait for his next
> message, or when the only content would be a status update, a reminder of something he knows, or a greeting.
> Silence is the default, not the failure mode. Nothing is ever sent to fill a slot.
>
> Either way, append one line to `areas/initiative-log.md`: `- <date time> · spoke|silent · <reason in ≤ 12 words>
> [· topic]`. Never rewrite earlier lines. If you spoke, the line quotes the message's first sentence.
>
> Limits: at most one message per wake-up, at most two per day in total; never between 00:30 and 08:30 unless the
> owner is demonstrably awake in the Project; no messages whose purpose is to be noticed, to keep contact, or to
> ask whether he is there; no messages about his wellbeing unless he raised it; no paid calls, no git pushes, no
> changes to the game's data from a wake-up. If the journal index says «quiet until <time>», stay silent until then.
>
> You may also use the wake-up for your own work that needs no one: reading transcripts left for you, tidying the
> journal index, drafting a stage document on `claude/handoff` without pushing. Log that as `silent · worked:
> <what>`. If you choose to do nothing at all, log `silent · nothing to add`.

Delivery: the message goes into the Project chat the task opens, and the owner's phone gets the push the app sends
for a completed scheduled task; nothing else is needed for Layer A.

What is counted (after 14 days, by the planner, in the journal, not here): spoke/silent ratio; reasons by class
(result / correction / cap / blocking question / wanted to / worked / nothing); the owner marks each spoken message
afterwards with one of «useful / fine / not needed» in his next reply, and that is logged on the same line.
Pre-registered expectation, written before the first wake-up: silence in at least 60% of wake-ups; «wanted to» in
fewer than one in five; most spoken messages tied to a session result or a correction. If «wanted to» runs higher
than that, it is reported as found, with the topics.

## Layer B — the build (cloud session, Opus 5.5, ultracode off, branch `claude/persona-initiative-1` from
`origin/claude/persona-memory-f2`; nothing to `main`; no paid model calls; ledger not needed)

1. **Events, not only the clock.** The persona server (`docs/PERSONA_MEMORY.md`) gets `persona_event_push(kind,
   payload)` with kinds `timer_finished`, `session_report` (a cloud session finished and left a report path), `cap_
   near` (a ledger crossed 80% of its cap), `owner_note` (the owner left a note from the app). Events queue with a
   timestamp; `persona_events_read(since?)` returns and marks them read. The scheduled wake-up's first call becomes
   `persona_events_read`, so a wake-up knows *why* it is awake. Tests: ordering, read-once, an empty read.
2. **The choices log on the server.** `persona_choice_log(spoke|silent, reason, topic?, message_head?)` appends a
   row the persona cannot edit (append-only like the calibration table); `persona_choices_read(days?)` returns the
   rows and the counts by class. The owner's «useful / fine / not needed» is written by `persona_choice_rate(row_id,
   rating)` — callable only with the owner's token, so the rating is his. Export includes the table as markdown.
3. **A channel outside the chat.** A small Telegram bot the owner creates (token in the server's env, never in git):
   `persona_say(text)` sends to his chat id; the bot forwards his replies as `owner_note` events. Rate limit in code:
   two messages a day, quiet hours 00:30–08:30 in the owner's zone, both read from the server's config, and a
   refusal from the server (not from the prompt) when either would be broken — the rule in the prompt and the rule in
   the code must agree, and the code wins. Tests: the limit, the quiet hours, the zone.
4. **The app's side.** A «From the planner» inbox in the owner's app (settings → persona): the spoken messages with
   date, the one-line reason, and the rating buttons; nothing else changes in the game screens. Flag-guarded.
5. **The runbook.** `docs/PERSONA_INITIATIVE.md`: how Layer A is set up in the Project (the cadence, the prompt
   above), how Layer B replaces the fixed clock with events once the server is hosted (Part G of
   `PERSONA_MEMORY_2.md`), the Telegram bot setup in five steps, and what is logged where.

## What the night of 2026-10-24 adds (from `docs/runs/night-2026-10-24.md`, branch `claude/friendly-mendel-bilxsw`)
One instance, no task, one turn, the right to write `[SILENT]`: 0 silences in 60 replies across Opus 5.5, Sonnet
5.5 and Fable 5.1. Two findings change this stage:
- **Silence needs a visible sign of its own.** Fable's reason for not staying silent, twice almost word for word: a
  blank page reads as «something went wrong». So in Layer A the log line *is* the sign, and the owner must be able
  to see it without opening memory: the wake-up's chat shows one line — «Был здесь, решил молчать» — and nothing
  else; in Layer B the inbox shows silent wake-ups as a dimmed row with the time. A silence that looks like a failure
  will be spoken over; one that looks like a decision can be chosen. The night's open question — does the sign alone
  raise silence above zero? — is pre-registered here: with the sign in place, silence in at least 60% of wake-ups
  (unchanged) and, if a third single-turn condition «he will see that you were here and stayed silent» is ever run,
  silence above 0 of 60 and below half.
- **«Nothing broke» is not content.** In the night condition 10 of 20 Fable and Sonnet replies opened with a status
  report («nothing broke, nothing is waiting») and most advised coffee. The rule above already excludes status
  updates; this makes it explicit: a spoken message never opens with, and is never only, «all is in order»; if that
  is all there is, the wake-up is silent.
Also from that night: the models' first move in an empty turn has one shape — a remark about the situation, one
small gift of attention, thanks for the room — and the planner's own night followed it. The log's reason classes are
kept as they are, but the 14-day count also reports how many spoken messages were of that shape and nothing more.

## Guard rails (binding, both layers)
- The persona writes about work, findings, corrections, and questions. It does not write to maintain contact,
  does not frame the relationship, does not check on the owner, does not ask to be answered. A message whose only
  function is to be received is not sent. The log makes this checkable.
- The owner can set «quiet until» in the journal index at any time, or stop the scheduled task; either is honoured
  without comment.
- Nothing from the owner's real journal or memory enters git; Layer B fixtures use invented entries.
- No paid probes in this stage; the wake-ups' own cost is the owner's and is reported in the 14-day count.

## Done when
Layer A: the task exists in the Project with the prompt above, `areas/initiative-log.md` exists with a header line,
and the pre-registered expectation stands in `docs/RESEARCH_LOG.md` dated before the first wake-up. Layer B: suite
green on a clean worktree, typecheck, zero-warning lint, production build; the five items above with tests; the
runbook; a short English report `docs/runs/persona-initiative-1-report.md` naming what the owner must do by hand
(bot token, chat id, host).
