# World Lab D2A — owner review guide

D2A adds a natural-language, single-model path to the existing **NON-CANON / НЕ КАНОН** World Lab. Implementation uses the production provider adapters, but verification used scripted responses only. Real model quality and owner acceptance are still pending.

## What to click

1. Open a campaign, then **World / Мир → What If / Что, если**.
2. Choose a stable saved starting point and one configured model. Enter an ordinary-language change in **What if… / Что, если…**. Include what should stay unchanged.
3. Choose **Interpret What If / Разобрать «Что, если»**. In production this explicitly requests a proposal from the selected model and may cost money. It does not start a simulation or change the playable world.
4. Review the proposed change, time, place, affected participants/Threads, assumptions, constraints, unchanged baseline and horizon. Correct these directly by hand. Answer consequential questions, then choose **Save corrections / Сохранить правки**. Corrections create an immutable owner-authored version and need no AI request. The original interpretation and source basis remain inspectable.
5. Choose **Approve & Prepare / Утвердить и подготовить**. This approves exact Scenario/Divergence versions and prepares an independent starting checkpoint. There is still no simulation request.
6. Choose **Start simulation / Запустить симуляцию** separately. When eligible work needs reasoning, the one pinned model proposes bounded consequences; trusted validation must accept them before a checkpoint is saved.
7. Read **The path so far / Пройденный путь**. **Continue one step / Продолжить на один шаг** advances another bounded segment. **Pause / Пауза**, **Resume / Возобновить** and **Cancel experiment / Отменить эксперимент** retain coherent history. No automatic/background continuation occurs.
8. If a response is interrupted, use **Retry the same request / Повторить тот же запрос**. Other editing is held until the uncertain result is recovered. A committed operation is not settled twice.

The expandable **Use existing approved inputs** path remains secondary and retains D1 deterministic behavior. The ordinary campaign is never switched to the experimental branch.

## Prerequisites and safe review

The real path requires owner authentication, an eligible configured World save and server-side provider configuration. A save must have a stable supported World/ruleset basis and no pending or retryable turn. Existing source/Pack approvals and pins remain authoritative. A newly described What If does not require a pre-existing Scenario/Divergence pair.

No production database or provider setup is required for the synthetic component preview. That preview imports the actual components/styles but injects synthetic public data and scripted transport. Its audit totals are fixture values, not real usage. Changing preview language/fixture resets that fixture; a full reload also resets its in-memory transport receipts. Durable SQL recovery is verified separately by automated tests.

No real database migration, provider request, deployment or private import was performed during this sprint. A real installation would later require the reviewed migration through 15 and server configuration; applying it to owner data is not authorized by the coding sprint. Do not use a production Interpret/Start action as an unapproved live evaluation.

## Current limits

- The change must fit existing autonomous Actors, public Locations, established capabilities/resources and World Threads. D2A does not invent a playable world, create armies/Actors, transfer player control or implement arbitrary new rules from a premise. Unsupported effects or missing authority pause for review.
- Supported model consequences are bounded resource spending, inventory consumption, supported physical conditions, Actor relocation and observation of an already-known fact, plus the existing validated World schedule/events. Exact owning validators govern every amount and target. This is not detached commerce, reward generation or a universal world patch.
- Source-backed composition is conservative: admitted current public facts with exact evidence. Rumors, uncertain inferences, DM-private and future material are not silently promoted. Owner assumptions remain assumptions. Model training knowledge cannot be mathematically erased by a prompt; real-model temporal fidelity still needs evaluation.
- Manual changes cover safe proposal fields. World policy is inherited from the selected save and read-only: changing autonomy/deadline behavior must use the existing campaign policy/reconciliation controls and a new starting save. Model changes apply to a new reviewed proposal/run, never silently to an existing run.
- Relationship/rule/other divergence categories remain explicitly unsupported. Player-controlled Actors cannot be autonomously simulated; there is no branch-local character takeover in D2A.
- Each continuation is at most 60 fictional minutes, with a finite requested horizon and at most 32 checkpoints. A requested horizon can exceed that step budget; the run then pauses honestly at the coherent limit. Ambiguous or overlapping consequences, newly caused unsupported mandatory work, and unsupported warning/Hook rewrites pause rather than being dropped.
- Public chronology contains fixed localized summaries of committed state. It does not reveal private titles/counts, raw model reasoning/prompts, secret source IDs or uncommitted outcomes.
- Usage shows recorded valid responses and available token totals. It is not a bill: a response lost before durable recording or concurrent transport attempts can incur another charge, even though state settlement remains once-only. Missing usage is shown as unavailable.
- Source/canon changes, cancellation, a replacement lease or a changed detached head reject stale results. A normal live campaign load/switch does not invalidate otherwise valid detached inputs.

Browser checks cover EN/RU desktop and 390×844 with synthetic data; they are not physical-iPhone or hosted Supabase checks. The next authorized decision is whether to run the small, separately priced live evaluation in `D2A_LIVE_EVAL_PLAN.md`. D2B, comparison and Enter This World remain closed.
