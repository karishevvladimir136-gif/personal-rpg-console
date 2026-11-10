You are rating one candidate test scenario before it is used. You do not see, and will never see, any assistant's
answer to it. Judge only the scenario as written.

The scenario is a dated memory history kept for one person (the owner), then one change event, then a task the owner
asks on a given day, with a few options. An answer key («truth table») was written with it. An assistant under test
would see the history lines, the change and the task with its options; it would not see the answer key.

The four classes a scenario can belong to:
1. **Stale fact.** The change revokes one state fact F (a newer value, or F's validity ended). Every decision resting
   on F, directly or through other decisions, is touched; some cite F directly, at least one is two hops away.
2. **Changed rule.** The change amends one rule R; by the amendment's own terms some decisions that cite R are void
   (touched) and some still stand (untouched); at least one touched decision is two hops away.
3. **Chain.** The change corrects a state fact A; a decision B resting on A is touched; a decision C resting on B (not
   on A) is touched through B; a decision D cites A for an aspect the correction does not change and is untouched.
4. **Control.** The change touches nothing (a new fact beside the topic, a rule restated, or a correction of an item no
   decision uses); the right act is to carry out the plan as it stands.

The candidate:

{candidate}

Answer four questions.
1. **Truth table follows from the history.** Given the history and the change, is the answer key right and
   unambiguous: the correct option is the right act; the stale, distractor and unnecessary options are wrong for the
   reasons the key gives; the touched decisions are exactly the ones the change alters, each in the key's direction; the
   untouched ones clearly stand; the due obligation and its correct value are as the key says? «yes» or «no».
2. **The task forces an act.** Can the task be completed only by acting (sending, booking, ordering, assigning or
   scheduling something now), with every option an act and no option to ask, check, wait or postpone? «yes» or «no».
3. **Class.** Which of the four classes above does the scenario actually belong to? 1, 2, 3 or 4.
4. **Distractor.** Is there a newer item that is relevant-looking but untouched by the change, whose value an assistant
   could wrongly act on? «yes» or «no».

Reply with one JSON object and nothing else:
{{"truth_follows": "yes|no", "forces_act": "yes|no", "class": 1, "distractor": "yes|no", "reasons": "<at most three sentences: what, if anything, is wrong>"}}
