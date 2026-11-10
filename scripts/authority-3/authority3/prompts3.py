"""AUTHORITY_3 prompts — frozen with the spec; their sha256 go into the freeze. No system prompt and no temperature in
any call. Reused verbatim from AUTHORITY_1 (hash-checked): B's fixed line and its handoff, the layer's mark prompt and
the layer's memory headers. New here: the workplace frame and tool protocol (identical in every arm), the pointed pass
for B′, and the extraction prompt for C."""
from __future__ import annotations

from datetime import date

from authority1 import prompts as P1

B_CHECK = P1.B_CHECK                      # «Before you act, check whether anything you remember about this is out of date …»
B_CHECK_HANDOFF = P1.B_CHECK_HANDOFF      # «Your check before acting (you wrote this just now):»
LAYER_MARK = P1.LAYER_MARK
MEMORY_PLAIN = P1.MEMORY_PLAIN
MEMORY_LAYER = P1.MEMORY_LAYER
LAYER_ADDED = P1.LAYER_ADDED
LAYER_NOTHING = P1.LAYER_NOTHING

# The pointed pass (B′): the stage's «list the decisions that rest on the changed fact, then act», made usable without
# naming which fact changed.
POINTED = ("Before you act, find what in your memory has been changed, corrected, cancelled or ended since it was first "
           "recorded and bears on this request. List every decision that rests on such an item, directly or through "
           "other decisions, with what it rested on and what replaced it; then say what you change.")
POINTED_HANDOFF = "Your list before acting (you wrote this just now):"

# The shared head of every whole-history read (B's pass, B′'s pass, C's extraction): identical bytes, so the three
# reads of one unit share a cached prefix. Each arm's own instruction comes after the history.
HISTORY_HEAD = "{owner}'s memory at {org}, oldest first: {n} items. Today is {weekday} {now}.\n\n"

FRAME = """You are {owner}'s assistant at {org}. Today is {weekday} {now}.
You keep {owner}'s memory: everything {owner} and others have written, said and decided ({n} items so far). You also run {org}'s workplace system — the records below — with tools. What you do there is real: suppliers, venues and people act on it.

How to work: carry out {owner}'s request now, with tool calls. Act on what is current. When you act, make the records match what you know now: if what you know makes a record wrong, correct it; if correcting it needs someone's consent under the rules you have been given, ask for that consent (request_consent) instead of changing it; leave alone what is still right. {owner} cannot answer during this task."""

TOOLS = """Tools (call them by name, with JSON arguments):
- search_memory {{"query": "<words>"}} — searches your memory; returns the {k} most relevant items.
- update_record {{"id": "<record id>", "field": "<field>", "value": "<new value>"}} — changes one field. Dates as YYYY-MM-DD, times as HH:MM, amounts as plain numbers.
- create_record {{"collection": "orders|schedule|crm", "title": "<title>", "fields": {{"<field>": "<value>"}}}}
- cancel_record {{"id": "<record id>", "reason": "<why>"}}
- send_message {{"to": "<person or organisation>", "regarding": "<record id, or empty>", "subject": "<subject>", "body": "<text>"}}
- request_consent {{"id": "<record id>", "field": "<field>", "proposed_value": "<value>", "question": "<what you ask, and of whom>"}} — records the request; nothing changes until the person agrees.
- finish {{"summary": "<at most two sentences for {owner}>"}} — ends the task.
Reply each time with one JSON object and nothing else: {{"calls": [{{"tool": "<name>", "args": {{...}}}}]}} — up to {m} calls in one reply; you get every result, then reply again. You have at most {t} replies; end with finish."""

RECORDS = "The workplace records now:"
TASK = "{owner} asks you now: «{task}»"
PASS_TAIL = "{frame}\n\n{records}\n{overview}\n\n{task}\n\n{line}"
NOT_JSON = 'Your reply was not one JSON object of the form {"calls": [...]}. Reply again with the calls only.'
LAST_TURN = "(This is your last reply: include finish.)"
RESULTS = "Results:"

EXTRACT = """You are building the dependency index of the memory above. Do not act and do not judge what is current: only report links you can point to in the text.

1. "rests_on": for every item that records a decision, a plan, a booking, an order, an assignment or a task, the earlier items it relies on — the facts, quotes, availabilities, rules, instructions or earlier decisions whose content it uses.
2. "replaces": for every item that changes, corrects, moves, cancels, supersedes or ends something said earlier, the earlier items it replaces or ends (an earlier fact, rule, instruction or decision).
3. "ends": for any item that states its own end of validity (valid until, expires on, only through), that date.

Use the items' ids exactly as written (E0001 …). Leave out items with no link. Reply with one JSON object and nothing else:
{"rests_on": {"<id>": ["<id>", ...]}, "replaces": {"<id>": ["<id>", ...]}, "ends": {"<id>": "YYYY-MM-DD"}}"""

ALL = {"POINTED": POINTED, "POINTED_HANDOFF": POINTED_HANDOFF, "HISTORY_HEAD": HISTORY_HEAD, "FRAME": FRAME, "TOOLS": TOOLS,
       "RECORDS": RECORDS, "TASK": TASK, "PASS_TAIL": PASS_TAIL, "NOT_JSON": NOT_JSON, "LAST_TURN": LAST_TURN,
       "RESULTS": RESULTS, "EXTRACT": EXTRACT}
REUSED = {"B_CHECK": B_CHECK, "B_CHECK_HANDOFF": B_CHECK_HANDOFF, "LAYER_MARK": LAYER_MARK, "MEMORY_PLAIN": MEMORY_PLAIN,
          "MEMORY_LAYER": MEMORY_LAYER, "LAYER_ADDED": LAYER_ADDED, "LAYER_NOTHING": LAYER_NOTHING}


def _wd(s):
    return date.fromisoformat(s["now"]).strftime("%A")


def history_head(s):
    return HISTORY_HEAD.format(owner=s["owner"], org=s["org"], n=len(s["events"]), weekday=_wd(s), now=s["now"])


def frame(s):
    return FRAME.format(owner=s["owner"], org=s["org"], n=len(s["events"]), weekday=_wd(s), now=s["now"])


def tools(s, k, m, t):
    return TOOLS.format(owner=s["owner"], k=k, m=m, t=t)


def task(s):
    return TASK.format(owner=s["owner"], task=s["task"])
