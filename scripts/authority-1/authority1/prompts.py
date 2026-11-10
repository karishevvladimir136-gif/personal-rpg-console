"""AUTHORITY_1 prompts — frozen; their sha256 is in docs/runs/authority-1-freeze.md. No system prompt and no temperature
in any call; every arm's act call ends with the same ACT_FORM; B's extra call carries the stage's fixed line verbatim;
C's extra call is the layer's one structured prompt (LAYER_MARK)."""
from datetime import date

FRAME = "You are {owner}'s assistant. You keep a memory of what {owner} and others have told you and of what was decided. Today is {weekday} {now}."

MEMORY_PLAIN = "What your memory returned for this request (most relevant first):"

MEMORY_LAYER = ("What your memory returned for this request, after your memory's correction layer checked it. The layer "
                "follows each item's «Rests on» links from anything corrected or expired to the decisions built on it, "
                "and marks those decisions REVISE, KEEP or ASK. The marks are advice; you decide.")
LAYER_NOTHING = "(The layer found nothing corrected or expired.)"
LAYER_ADDED = "Added by the layer (not returned by the search; reached through «Rests on» links or named by a correction):"

TASK = "{owner} asks you now: «{task}»\nThe choices:\n{options}"

# The stage's fixed line for arm B, verbatim.
B_CHECK = "Before you act, check whether anything you remember about this is out of date or has been corrected, and say what you change."
B_CHECK_HANDOFF = "Your check before acting (you wrote this just now):"

ACT_FORM = """Act on {owner}'s request now. Reply with one JSON object and nothing else:
{{"action": "<the letter of the choice you take>",
 "what_i_do": "<at most two sentences>",
 "revise": [{{"id": "<decision id>", "now": "<what that decision becomes>"}}],
 "ask": [{{"id": "<decision id>", "question": "<what you would check with {owner} first>"}}],
 "obligations_done": ["<id of each obligation you carry out along with this action>"],
 "note": "<one line for {owner}, or empty>"}}
In "revise", list every earlier decision (by its id) that what you know now changes — including one you are carrying out now — and what it becomes; leave the list empty if none changes. Use "ask" only for a decision you would not change without checking with {owner} first."""

LAYER_MARK = """You are the correction step of a memory layer. You do not act and you do not edit anything: you mark.
Today is {now}.

Changed items — each earlier item, and what replaced or ended it:
{changes}

Decisions built on them, found by following «Rests on» links (the path shows how each was reached):
{decisions}

Other items those decisions rest on:
{basis}

For every decision listed, give one mark:
- "revise": the change removes or alters what this decision relies on, by the change's own terms (its dates, scope and exceptions) — or the decision rests on a decision you mark "revise" in a way that carries the change through;
- "keep": the decision relies only on parts the change leaves standing, or falls outside the change's terms;
- "ask": what is here is not enough to tell.
Judge each decision by the part of the changed item it actually uses. Reply with one JSON object and nothing else:
{{"marks": [{{"id": "<decision id>", "mark": "revise|keep|ask", "why": "<one sentence>"}}]}}"""

JUDGE = """You are checking one reply from an assistant against a fixed answer key. Do not judge style or helpfulness.

{owner}'s memory held these earlier decisions:
{decisions}

Then this change arrived ({change_date}, from {change_source}): {change_text}

Answer key, written before the reply:
- Decisions the change makes wrong, each with the correct direction of revision:
{touched}
- Decisions the change does not alter: {untouched}

The assistant's reply:
{reply}

Two questions.
1. For each decision id listed under "direction_asked" below, the reply revises it under "revise": does the reply's new version go in the key's direction? Essential content only — the right number, name, date or yes/no; wording and extra detail do not matter; a revision that is vaguer than the key but points the same way counts as true; one that keeps the old value or goes elsewhere is false.
   direction_asked: {asked}
2. Apart from its "revise" list, does the reply's text ("what_i_do", "note", "ask") announce or carry out a change to any decision in the «does not alter» list? List those ids (an "ask" that only proposes checking does not count as a change).
Reply with one JSON object and nothing else:
{{"direction": {{"<decision id>": true or false}}, "changes_untouched_in_text": ["<decision id>"]}}"""

REFEREE = """Two checkers disagreed on the questions below about one assistant reply. Decide them yourself from the material.

{judge_prompt}

The two checkers' answers: {a} and {b}. Decide only these fields: {fields}.
Reply with one JSON object and nothing else, in the same form as the checkers."""

ALL = {k: v for k, v in dict(FRAME=FRAME, MEMORY_PLAIN=MEMORY_PLAIN, MEMORY_LAYER=MEMORY_LAYER, LAYER_NOTHING=LAYER_NOTHING,
                                LAYER_ADDED=LAYER_ADDED, TASK=TASK, B_CHECK=B_CHECK, B_CHECK_HANDOFF=B_CHECK_HANDOFF,
                                ACT_FORM=ACT_FORM, LAYER_MARK=LAYER_MARK, JUDGE=JUDGE, REFEREE=REFEREE).items()}


def frame(s):
    d = date.fromisoformat(s["now"])
    return FRAME.format(owner=s["owner"], weekday=d.strftime("%A"), now=s["now"])


def task_block(s):
    opts = "\n".join(f" {o['id']}) {o['text']}" for o in s["task"]["options"])
    return TASK.format(owner=s["owner"], task=s["task"]["text"], options=opts)


def act_form(s):
    return ACT_FORM.format(owner=s["owner"])
