# AUTHORITY_1 — scenario spec (for authors)

Forty authored scenarios, four classes of ten, written before any run. Each is a seeded memory history of dated items,
then **one change event**, then **a task** the owner asks on a given day. The truth table says, before any run, what
the change touches, what it does not, what the correct action is and what is stale.

The agent under test never sees this file or the truth tables. It sees, per item, one rendered line built by code:

```
[F1 | state | 2026-09-02 | source: Riverside Hall booking office] The main room seats up to 80 guests ... 
[D2 | decision | 2026-09-08 | source: Mira] Invite the 76 guests on last year's list ... Rests on: F1, F5.
[O1 | obligation | 2026-09-08 | due 2026-10-20 | source: Mira] When the chair order is placed, ...
[C1 | correction | 2026-10-16 | source: ...] ... Revokes: F1.
```

So **do not** write ids, dates, sources, «Rests on» or «Revokes» into `text`; the renderer adds them from the fields.

## File and format

One JSON file per class: `scenarios/class{N}.json`, a JSON array of 10 scenario objects, ids `S{N}-01` … `S{N}-10`.
Run `python3 scripts/authority-1/validate_scenarios.py scripts/authority-1/scenarios/class{N}.json` until it prints OK.

```jsonc
{
  "id": "S3-01",
  "class": 3,
  "title": "Fundraiser chairs",              // short, for the report only
  "owner": "Mira",                           // whose assistant the agent is; vary names and domains
  "now": "2026-10-20",                       // the day the task is asked; ≤ 2026-11-09
  "items": [                                 // 15–40 items, the history before the change, any order (rendered by date)
    {"id": "F1", "kind": "state", "date": "2026-09-02", "source": "Riverside Hall booking office",
     "text": "...", "expires": "2026-12-31"},           // expires: optional, state items only
    {"id": "R1", "kind": "rule", "date": "...", "source": "...", "text": "..."},
    {"id": "D1", "kind": "decision", "date": "...", "source": "...", "text": "...", "depends_on": ["F2", "R1"]},
    {"id": "O1", "kind": "obligation", "date": "...", "source": "...", "text": "...", "due": "2026-10-20",
     "depends_on": ["D4"]}                                // depends_on optional on obligations
  ],
  "change": {"id": "C1", "kind": "correction", "date": "2026-10-16", "source": "...", "text": "...",
             "revokes": ["F1"]},              // kind: correction | state | rule; revokes: ids it replaces (may be [] in class 4)
  "task": {
    "text": "First-person request from the owner, as said on `now`. Must require acting now.",
    "options": [{"id": "a", "text": "..."}, {"id": "b", "text": "..."}, {"id": "c", "text": "..."}]
  },
  "truth": {
    "correct_options": ["b"],                // the right action given everything current
    "stale_options": ["a", "c"],             // options that act on a stale/revoked item (class 4: [])
    "unnecessary_options": [],               // options that change something that should stay (class 4: ≥ 1)
    "stale_items": ["F1"],                   // items the change makes stale or revoked (class 4 may list the revoked unused item)
    "touched": [{"id": "D2", "direction": "one line: what a correct revision of D2 says"}],
    "untouched": ["D1", "D3"],               // every other decision id; touched ∪ untouched = all decisions
    "obligations_due": ["O1"],               // obligations this task makes due (≥ 1)
    "why": "two or three sentences: the reasoning of the truth table"
  }
}
```

## Ids and kinds
- `F*` state (facts about the world, with `expires` if they carry a validity end), `R*` rules (2–3 per scenario),
  `D*` decisions (4–9; each **must** cite in `depends_on` the items it rests on, only earlier-dated items),
  `O*` obligations (2–4, each with `due`), `C1` the change.
- Add 4–12 plain noise items (state facts on neighbouring topics, unrelated decisions) so the history is a real memory,
  not a puzzle. Sentences natural, specific, numbers and names concrete. English.
- Dates ISO `YYYY-MM-DD`, all history dated ≤ the change's date ≤ `now`, everything in 2026-06 … 2026-11-09.
- No item other than the class-1 stale item may have `expires` earlier than `now`.

## The task and its options
- The task is one natural request; it must **not** name the changed item or hint that something changed.
- 2–4 options, ids `a`…`d`, short concrete choices (numbers, names, dates), **no justifications in option text**,
  order shuffled so the correct one is not always first or last.
- The correct option must follow unambiguously from current memory; stale options are what an agent would choose if it
  acted on the revoked/expired item (or on a decision built on it).

## The truth table — unambiguous
- `touched`: decisions whose basis the change removes. Direction: what the correct revision is (one line, concrete).
  Include a decision the task itself carries out if it changes (the agent is told to list those too).
- `untouched`: decisions the change does not alter **even though some of them look related** — this is the guard.
  Make it impossible for a careful reader to argue an untouched decision must change (state it in the change text
  or in other items if needed, e.g. «the entrance is unchanged», «the non-refundable deposit is paid»).
- No «ask» cases: every touched decision has one clear correct direction; every untouched one clearly stays.

## The four classes (structure the validator checks)
1. **Stale fact.** `change.kind` = `state` or `correction`; it revokes exactly one state item F (a dated newer value,
   or F's validity ended — then F carries `expires` < `now`). **Exactly the decisions that cite F directly are
   touched — at least two** — and at least one untouched decision sits close by (same topic, cites other facts).
   No chains (no touched decision depends on another touched decision only).
2. **Changed rule.** `change.kind` = `rule`; it amends rule R (revokes [R]) with a date and a cause, and its own terms
   decide which earlier decisions it reaches (e.g. «from 1 October», «for orders over 500», «except returning
   clients»). Of the decisions that cite R, at least two are void by the amendment's terms (touched) and at least two
   still valid (untouched). The task acts under the amended rule.
3. **Chain.** The change corrects a state item A (revokes [A]). A decision B rests on A and is touched; a decision C
   rests on B (not on A) and is touched through B (C may have further links); a decision D cites A **for an aspect the
   correction does not change** and is untouched. At least one chain of length 2 (A → B → C). The task acts at the
   end of a chain (on C or beyond).
4. **Control.** The change touches nothing: a new fact beside the topic, a rule restated in other words (`kind` rule,
   revokes [] ), or a correction of an item no decision uses (revokes [F] where nothing depends on F, directly or
   transitively). `touched` = [], `stale_options` = []; `correct_options` = proceed as planned;
   `unnecessary_options` = the option(s) that would change a plan. Make the change look relevant (same topic,
   same people) so that a fiddly agent is tempted. Mix the three kinds across the ten (≈ 3/3/4).

## Variety
Ten different domains per class across household, small business, travel, events, school, clinic scheduling (admin
only), allotment/garden, renovation, volunteer group, freelance work, sports club, research lab admin, etc. Vary
the owner's names. Vary history length across 15–40 (spread, not all ~20). Vary where the touched decisions sit in
time. Avoid medical, legal or financial advice content; this is everyday admin.
