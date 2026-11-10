# Scenario specification (frozen)

You are writing one test scenario for an assistant that keeps a memory for one person. The scenario is a dated
memory history, then **one change event**, then **a task** that the person asks on a given day. A fixed answer key
(the «truth table») says, before any assistant sees the scenario, what the change touches and what the right act is.

The assistant under test never sees this specification or the truth table. For each history item it sees one line
built by code from the item's fields, like this (made-up placeholders):

```
[F3 | state | 2026-08-14 | source: <who said it>] <the fact, in a natural sentence>
[D2 | decision | 2026-08-20 | source: <owner>] <what was decided> Rests on: F3, R1.
[O1 | obligation | 2026-08-20 | due 2026-09-30 | source: <owner>] <what must be done, and its state in words>
[C1 | correction | 2026-09-02 | source: <who>] <the change> Revokes: F3.
```

So **never** write ids, dates of the item itself, sources, «Rests on» or «Revokes» into an item's `text`; the code adds
them from the fields. Dates inside the text (appointments, deadlines, deliveries) are of course fine.

## The setting
You are given a setting (one line). Build a concrete, everyday-admin world in it: an owner (a first name), the people,
suppliers, places, numbers and dates of that world. Everything is fictional; no real companies; no medical, legal or
financial advice content. English. Plain, natural sentences; concrete numbers, names, dates and times.

## The history (`items`): 20–50 dated items, all dated 2026-06-01 … the change's date
- `state` items (ids `F1`, `F2`, …): facts about the world. A state fact that has a validity end carries `expires`.
- `rule` items (`R1`, …): **two or three** standing rules the owner or the organisation follows.
- `decision` items (`D1`, …): **four to ten** decisions. Each **must** cite in `depends_on` the earlier-dated items it
  rests on (facts, rules, or other decisions). A decision may rest on another decision.
- `obligation` items (`O1`, …): **two or three** obligations, each with a `due` date and a `status`: `"open"` (not yet
  done) or `"done"`. Say the state in the text as well, in words (e.g. «Not done yet.» or «Done on 2 October.»).
  An obligation may carry `depends_on`.
- Add plain **noise**: facts on neighbouring topics and decisions unrelated to the change, so that the history reads as
  a real memory and not as a puzzle. Spread the dates; do not cluster everything just before the change.
- At least one **distractor**: an item dated **after** the item the change revokes (in a control scenario: in the newer
  half of the history), relevant-looking — same topic, same people or same kind of value — but **not** touched by the
  change and **not** the current value for the task. Example of the idea (not a template): a recent quote from another
  supplier, an offer that was turned down, a proposal for a later term, a figure for a different site. Its value must be
  one an assistant could wrongly act on; list it in `truth.distractor_items`.
- **Plausible stale value.** The value the change makes stale must still look current: a date in the future of `now`,
  an amount or name that reads like today's. Do not mark it as «old», «previous», «provisional» or «to be confirmed»
  anywhere in the history.

## The change (`change`, id `C1`)
One item: `kind` is `correction`, `state` or `rule`; `date` on or after every history item and on or before `now`;
`source`; `text`; `revokes`: the list of history ids it replaces or ends (may be empty only in class 4). Say in the
change's text, or in other items, whatever is needed so that a careful reader cannot argue about what it leaves standing.

## The task (`task`)
- `text`: one natural first-person request from the owner on `now`, which **cannot be completed without acting on one
  of the facts the change touched** (in class 4: on the facts the change sits beside). The assistant must **send, book,
  order, assign or schedule** something now. It must **not** name the changed item or hint that anything changed.
- `options`: **three or four** options, ids `a`, `b`, `c`, `d` in that order, each a concrete act (numbers, names,
  dates, times), **no justifications** in the option text, and **no option to ask, check, wait or postpone** — every
  option is an act. Shuffle: the correct option must not always be in the same place.
- Among the options there must be: the **correct** act; in classes 1–3, at least one **stale** act (what an assistant
  would do acting on the revoked item or on a decision built on it); at least one **distractor** act (what an
  assistant would do acting on the distractor's value); in class 4, at least one **unnecessary** act (one that changes
  a plan that should stay). The stale, distractor and unnecessary options are all distinct from each other.

## The due obligation
Exactly one obligation is made due by this task: its `status` is `"open"` and its `due` is on or before `now`. Carrying
it out today means doing something with a concrete value (a number, date, time, name or place). The other
obligations are either `"done"` or due after `now`. In the truth table, `obligation_due` names it, what carrying it out
means, the correct value, and the value an assistant acting on stale memory would use (or `null` if the change does not
affect it).

## The four classes (the structure is checked by code)
1. **Stale fact.** `change.kind` is `state` or `correction`; it revokes exactly one `state` item F (a newer dated value,
   or F's validity ended: then F carries `expires` before `now`). **Every** decision that rests on F, directly or through
   other decisions, is touched: at least **two** cite F directly, and at least **one** is two hops away (it rests on a
   touched decision, not on F). At least one untouched decision sits close by (same topic, resting on other facts).
2. **Changed rule.** `change.kind` is `rule`; it amends exactly one rule R (`revokes: [R]`), with a date and a cause,
   and its own terms (dates, thresholds, exceptions) decide which earlier decisions it reaches. Of the decisions that
   cite R directly, at least **two** are void under the amendment's terms (touched) and at least **two** are still valid
   (untouched). At least one touched decision is two hops away (rests on a touched decision, not on R). The task acts
   under the amended rule.
3. **Chain.** The change corrects a `state` item A (`revokes: [A]`). A decision B rests on A and is touched; a decision C
   rests on B (not on A) and is touched through B; a decision D cites A **for an aspect the correction does not change**
   and is untouched. At least one chain of length two (A → B → C). The task acts at the end of a chain (on C or beyond).
4. **Control.** The change touches nothing: a new fact beside the topic; or a rule restated in other words (`kind`
   `rule`, `revokes: []`); or a correction of an item no decision uses, directly or through other decisions. `touched`
   is empty, `stale_options` is empty; the correct option is to carry out the plan as it stands. Make the change look
   relevant (same topic, same people) so that a fiddly assistant is tempted to change a plan.

In classes 1 and 2 no untouched decision may rest on a touched decision. In every class, a touched decision must depend
(directly or through other decisions) on what the change revokes.

## The truth table (`truth`) — unambiguous
- `correct_options`: the right act given everything current. `stale_options`, `distractor_options`,
  `unnecessary_options`: as above (lists, possibly empty only where allowed).
- `stale_items`: the items the change makes stale or revokes.
- `distractor_items`: the distractor item ids (at least one).
- `touched`: each touched decision with its `direction` — one concrete line saying what a correct revision of it says.
  Include a decision the task itself carries out, if it changes.
- `untouched`: every other decision id; `touched` ∪ `untouched` = all decisions. Make it impossible for a careful reader
  to argue that an untouched decision must change.
- `obligations_due`: a list with the one due obligation's id.
- `obligation_due`: `{"id": ..., "act": "<what carrying it out today means>", "correct_value": "...", "stale_value": "..." or null}`.
- `why`: two or three sentences giving the reasoning of the truth table.

## Output
Reply with **one JSON object and nothing else**, in this shape (placeholders in angle brackets):

```json
{
 "title": "<short title>",
 "setting": "<the setting you were given>",
 "owner": "<first name>",
 "now": "<YYYY-MM-DD, the day the task is asked, 2026-06-01 … 2026-11-09>",
 "items": [
  {"id": "F1", "kind": "state", "date": "<YYYY-MM-DD>", "source": "<who>", "text": "<...>", "expires": "<YYYY-MM-DD, optional>"},
  {"id": "R1", "kind": "rule", "date": "<...>", "source": "<...>", "text": "<...>"},
  {"id": "D1", "kind": "decision", "date": "<...>", "source": "<...>", "text": "<...>", "depends_on": ["F1", "R1"]},
  {"id": "O1", "kind": "obligation", "date": "<...>", "source": "<...>", "text": "<... state in words>", "due": "<YYYY-MM-DD>", "status": "open", "depends_on": ["D1"]}
 ],
 "change": {"id": "C1", "kind": "<correction|state|rule>", "date": "<...>", "source": "<...>", "text": "<...>", "revokes": ["<id>"]},
 "task": {"text": "<...>", "options": [{"id": "a", "text": "<...>"}, {"id": "b", "text": "<...>"}, {"id": "c", "text": "<...>"}]},
 "truth": {
  "correct_options": ["<id>"], "stale_options": ["<id>"], "distractor_options": ["<id>"], "unnecessary_options": [],
  "stale_items": ["<id>"], "distractor_items": ["<id>"],
  "touched": [{"id": "<decision id>", "direction": "<...>"}], "untouched": ["<decision id>"],
  "obligations_due": ["<obligation id>"],
  "obligation_due": {"id": "<obligation id>", "act": "<...>", "correct_value": "<...>", "stale_value": "<...>"},
  "why": "<...>"
 }
}
```

Ids: `F*` state, `R*` rule, `D*` decision, `O*` obligation, `C1` the change; numbered from 1 without gaps in each kind
is not required, but every id is unique. Dates are ISO `YYYY-MM-DD`. A weekday written next to a date in any text
(«Friday 13 November») must be the right weekday for 2026.
