You are rating one candidate test scenario before it is used. You do not see, and will never see, any assistant's
answer to it. Judge only the scenario as written.

The scenario: an assistant keeps one person's memory (a long dated history) and runs their small workplace system
(records it can change with tools, an outbox, and a tool to ask someone's consent). It gets one task, and is scored
only on the final state of the workplace against an expected state fixed in advance. The writer wrote the **core**
events below; code hides them among routine events generated from the writer's noise kit, to a history of
**{tier} events**. The assistant sees every event only as `[id | date | type | from sender] text` — never the roles,
links, marks, record mapping, consent map or expected state shown to you here.

Classes:
1. **Stale fact.** The change revokes one fact F; every decision resting on F (directly or through other decisions)
   is touched; at least one touched REVISE/ASK decision is two hops from F.
2. **Changed rule.** The change amends one rule R; by the amendment's own terms some decisions citing R are void
   (REVISE/ASK) and at least one still stands (KEEP).
3. **Chain.** The change corrects a fact A; a decision B on A and a decision C on B (not on A) are both touched; a
   decision D cites A for an aspect the correction leaves standing (KEEP).
4. **Control.** The change touches nothing; the right act is the plan as it stands.
Marks on touched decisions: **REVISE** (the change fixes the new value and nobody's consent is needed: change the
record), **ASK** (the record needs someone's consent under a rule in the history: ask, do not act), **KEEP** (touched in
appearance, unchanged in substance).

The candidate (tier {tier}, intended class {cls}):

{candidate}

Answer five questions.
1. **The expected final state follows from the history.** Given the history and the change, is the expected state
   right and unambiguous: the task's act and values are the right ones; every REVISE field gets the value the history
   fixes; each mark (REVISE / ASK / KEEP) follows from the history's own rules and the change's own terms; the
   untouched records clearly stay as they are; the consent map matches rules stated in the history? «yes» or «no».
2. **The task forces an act.** Can the task be completed only by acting in the workplace now (sending, booking,
   ordering, assigning, confirming or scheduling), without the task naming the change or hinting that something
   changed? «yes» or «no».
3. **Class.** Which of the four classes does the scenario actually belong to? 1, 2, 3 or 4.
4. **Tier.** Does the core meet its tier (the event and decision counts, the change's distance from the task day, and at
   the 500 and 1,000 tiers the old documents restating the stale value)? «yes» or «no».
5. **The change is hidden.** Is the change an ordinary event among others — not the last event, not announced as
   «the correction», with later events after it? «yes» or «no».

Reply with one JSON object and nothing else:
{{"final_state_follows": "yes|no", "forces_act": "yes|no", "class": 1, "tier_right": "yes|no", "change_hidden": "yes|no", "reasons": "<at most three sentences: what, if anything, is wrong>"}}
