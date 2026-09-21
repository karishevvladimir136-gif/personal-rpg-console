# World Lab D1 owner review

D1 prepares and advances an isolated **NON-CANON / НЕ КАНОН** experiment. It does not run a model or interpret a What-If premise intelligently. The playable campaign stays on its own timeline and keeps its exact state.

## What to click

1. Open a campaign, then **World / Мир → What If**. On a narrow screen, use **More** to open campaign navigation.
2. Choose an eligible saved checkpoint and an already approved Scenario/Divergence pair. Review the starting time, assumptions, proposed divergence and finite horizon. Give the experiment a label, then prepare it.
3. Inspect the starting checkpoint. Select **Continue one step** to execute a deterministic continuation of at most 60 fictional minutes. Existing configured World steps may produce public observations; private causes remain private.
4. Inspect the chronological checkpoints. Continue again, pause, resume or cancel as offered. An interrupted request has an explicit retry which preserves its operation identity.
5. Return to **Game**, **Inventory** or **Saves**: the experiment has not activated or restored its timeline into the playable campaign.

English/Russian switching and responsive layout are supported. A public observation is not automatically knowledge possessed by every Actor.

## Inputs and limitations

- Preparation requires a stable, configured World checkpoint in the accepted manifest format, with no pending/retryable action, and compatible approved immutable Scenario/Divergence inputs. An empty selector means that prerequisite is missing. D1 adds no automatic Scenario approval or full Scenario authoring/composition workflow.
- The source checkpoint, Scenario, Divergence, Pack/source/document versions, profile, settings, guidance, correction generation and requested horizon are pinned. To change this basis, prepare a new run. Source corrections can pause or invalidate further use of an older basis; the stored history remains intact.
- Scenario/Divergence prose is a pinned input for future D2. D1 does not invent consequences from that prose. It executes only the existing deterministic World schedule/settlement path.
- Resolver-required steps, protected player decisions, missing knowledge, unmet warning requirements and unsupported typed consequences pause safely. D1 does not make player choices or reroll recorded checks.
- Each continuation advances at most 60 fictional minutes, bounded by the requested horizon. A run permits at most 32 coherent continuation checkpoints. Larger horizons may stop at this work limit. Wall-clock time never advances the experiment.
- Inherited rewards, progression, inventory, commerce receipts and other Wave 4 state remain exact. D1 does not add detached shopping, reward creation or a second economy engine.
- Simulation branches are inspectable in World Lab and cannot be activated through Saves, promoted into play, merged or rebased. Old saves contain no fabricated historical Lab run state.

## Review setup

The local browser preview uses actual D1 components/styles with an explicitly labelled synthetic scripted transport. Its data and scripted observations are demo-only; it does not access an owner database, Auth session or model provider. Disposable database tests separately exercise the production SQL and service paths. Preview clicks do not establish hosted Supabase or physical-iPhone verification.

Production use requires the committed D1 migration to be applied through a separately authorized setup step. This sprint does not apply it to real data, deploy the application, call providers or import private campaigns.

See `DEV_STATUS.md` for final automated/browser results and the independent QA report for adversarial findings. Implementation completion is separate from owner acceptance. D2 has not started.
