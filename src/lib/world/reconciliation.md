# Explicit prospective schedule reconciliation

`reconciliation.ts` is a pure server seam over the existing `reconcileWorldPolicy` authority. It performs no provider calls, reads, writes, clock advancement, event creation or gameplay settlement. Lead owns configuration/API/SQL/UI and the shared `policy.ts` integration.

## Exports

- `WorldReconciliationChoice`: `{ schemaVersion: 1, kind: "restart_overdue", graceMinutes: number }`. Grace is an integer from 1 through 10,080 fictional minutes; suggested initial UI value is 60. `parseWorldReconciliationChoice(unknown)` rejects all additional fields, private identifiers and arbitrary patches.
- `worldPolicyNeedsReconciliationReview(previous, next)`: true exactly when `next.simulation` is true and simulation changes from Off to On or deadline pressure increases in Off / Critical Only / Normal order. It depends on public policy alone. Autonomy changes alone do not activate deadline pressure or request this operation.
- `prepareWorldPolicyReconciliation(snapshot, command, nextPolicy, choice)`: returns a **server-only** `WorldPolicyReconciliationPlan` with `schemaVersion`, the exact `command`, `fromWorldMinutes`, private `reconciliations` and validated `world`. A reviewable expansion always requires the explicit choice, even with no configured world or no affected work. Other policy changes require `null`.
- `validateWorldPolicyReconciliation(snapshot, command, nextPolicy, choice, proposed)`: recomputes and requires deep equality. Changed identities, timestamps, provenance, warning receipts, state or fences cannot be supplied through a proposal.
- `projectWorldPolicyReconciliation(snapshot, nextPolicy)`: returns only public campaign/fence metadata, current fictional time, previous/next policies, policy-derived `requiresReview`, grace bounds and `knownSchedules: []`. **Never serialize the private plan or its row count.**

## Exact eligibility and scheduling for independent SQL validation

Only active threads and steps at or after the existing cursor qualify. Ignore causal triggers and times strictly after current fictional time. A step must be disabled under the previous policy and enabled under the proposed policy, and the transition must need review as defined above.

The policy gate mirrors `stage.ts`:

- Simulation must be On for all timed work.
- A deadline is enabled under Normal, or under Critical Only when both `scenarioCritical` and `established` are true. Autonomy level does not affect deadlines.
- An autonomy step's scope (Local / Related / Broad) cannot exceed Low / Moderate / High. With pressure Off or Critical Only it must also be nonterminal, have no hook changes, and have a Background consequence. Terminal means its actual index is the final step index, including when it is not yet the cursor.

Schedules already active under the prior policy retain their times. Future, completed, paused, causal and still-suppressed steps retain their times. Prerequisites and current location do not remove a schedule from this policy reconciliation; later gameplay continues to enforce them normally.

For each thread, start `lastRestart = currentWorldMinutes` and visit steps in stored order:

1. Initialize a target's warning lower bound from any existing receipt's `opportunityUntilWorldMinutes + 1`.
2. For a required step, set `newAt = max(lastRestart + graceMinutes, its warning lower bound or 0)`, append its stable ID/time and set `lastRestart = newAt`.
3. If the current step is an unconsumed timed warning targeting a required later step, extend that target's lower bound to `max(currentWorldMinutes, warningEffectiveAt) + opportunityMinutes + 1`. `warningEffectiveAt` is the new time when restarted, otherwise its original time. Keep the largest lower bound. A causal warning has no invented clock time.

All timestamps must remain safe integers between 0 and 1,000,000,000. The first restart is strictly future; subsequent restarted steps in the same thread are at least the chosen grace apart. Other threads use their own first restart time. Warning lower bounds may extend this interval. The extra minute is necessary because the existing settlement checks the opportunity boundary against the **pre-turn** snapshot: completion exactly on that boundary could otherwise block the time-advancing turn needed to reach it.

Example: current time 100, grace 60, two overdue steps where the first warns about the second with 90 minutes of opportunity. The new times are 160 and 251. The warning can commit at 160, an intervening turn can reach 250, and a later turn can complete at 251. No receipt is fabricated or altered by configuration.

## Persistence integration

Add a nullable explicit `reconciliation` choice to the owner configuration DTO. The server constructs the existing `FoundationCommand` and invokes the planner against its authorized current snapshot. SQL must independently validate the choice, derive the same eligibility/schedule rows, and apply only the resulting policy/timing fields. Do not accept arbitrary nextWorld or schedule IDs from the browser.

Use the existing idle boundary: no nonterminal turn or active encounter. Lock/recheck owner, campaign, active timeline ID/epoch, world revision, runtime revision and exact head before persistence. Keep configuration, world-autonomy settings and existing revision/history/operation receipts atomic. Do not create a turn, world event, narration, consequence or additional history authority. Preserve all actors, source bindings/evidence, thread IDs/cursors/status/revisions, hooks and warning receipts exactly. Existing save manifests continue to capture world policy and times through their current path.

The existing operation receipt must bind the full original configuration request and explicit choice. An identical committed retry returns the existing receipt/result, not a second restart. Reuse of the same operation with a different choice fails. A pure plan is deterministic for the same pinned snapshot; replaying it against a later revision, head or epoch fails. Storage retry handling must recognize committed operations before treating their old fences as a new request.

## Public review and current limits

Neutral suggested explanation: “Give newly enabled overdue schedules at least N fictional minutes before they resume. Later steps remain spaced so warning opportunities are preserved. This change does not advance story time or apply missed consequences.” Offer the same review path whether no work, known work or hidden work exists. Do not add an affected total, private count, private-existence flag, sample hidden title or conditional message.

The current `FoundationSnapshot` contains no public event/recipient evidence proving that a schedule's precise time is player-known. A public thread title and an unexecuted `publicOutcome` do not establish that knowledge. Therefore individual schedules are intentionally absent from this wave's projection; no new schedule-publicity authority is introduced.

Only newly enabled overdue work is restarted. A future or previously active completion remains unchanged even if its pending warning restarts after it. The existing warning gate then safely pauses a later crossing; this seam does not silently rewrite that already-active completion or invent warning evidence. Long skips across a new warning and its completion still use the existing pause/shorter-turn behavior. Authentication, SQL idleness and durable receipt replay require Lead integration and cannot be established by these pure tests.
