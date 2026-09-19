# Owner setup — later, separately approved synthetic evaluation

**Stop here for owner review of the corrected plan. No key or manual setup is needed now.** No live request has been made. This guide describes a possible later stage; it does not authorize that stage. Never paste a key, password or token into chat.

The experiment is separate from the running RPG Console. It uses a Vercel AI Gateway key, not the app's OpenAI key. You do not need to change application code or restart the RPG app.

## What data would be sent

Only the frozen, newly authored fictional test records. No real campaign, private state or uploaded source library. Synthetic requests retain a hard provider restriction and have no fallback. They do **not** request or claim Zero Data Retention / No Training. No Vercel subscription upgrade is required by this synthetic profile.

The Jev provider catalog lacks privacy indicators, while other official pages claim support. That disagreement is recorded separately: **Jev is NOT ELIGIBLE for real campaign/private/source inputs pending policy/capability resolution**, even if it scores well on fake data. See the [report and dated sources](../../PHASE375_TECHNICAL_BAKEOFF.md).

## Future smoke setup — only after explicit approval

1. Sign into Vercel and select the intended team. Open **AI Gateway → API Keys** in its sidebar, or use the [official API Keys link](https://vercel.com/d?title=AI+Gateway+API+Keys&to=/%5Bteam%5D/~/ai-gateway/api-keys).
2. In **AI Gateway → Settings**, check whether **Bring Your Own Key (BYOK)** is connected. This experiment uses Gateway credits; BYOK bypasses its budgets. If your team already uses BYOK, stop for an isolated billing plan. Do not delete existing connections, reuse the application's OpenAI key, upgrade a subscription or enable automatic credit top-up.
3. After approval, click **Create key**. Name it `rpg-bakeoff-smoke`. Enable **Spend Quota / Budget**, enter **3 USD**, choose **None / no refresh**, and use a short expiration if offered. Do not create/use an unlimited key. Wait at least two minutes and confirm the dashboard shows $3. [Key budgets](https://vercel.com/docs/ai-gateway/observability-and-spend/budgets).
4. Open File Explorer and paste this folder into its address bar:

   `C:\Users\karis\OneDrive\Documents\GitHub\personal-rpg-console\.worktrees\phase375-bakeoff\experiments\phase375-bakeoff`

5. Right-click **`.env.bakeoff.local` → Open with → Notepad**. An ignored empty file was prepared during the foundation task. Enter the key after this equals sign, on one line:

   ```text
   AI_GATEWAY_API_KEY=
   ```

   Save with **Ctrl+S** and close Notepad. On another checkout, create that exact filename with **Save as type: All files**, without `.txt`. Never place it in documentation, browser configuration or GitHub. The entire local credential file is gitignored.
6. In that later approved stage, confirm only that the key is saved locally and whether the bounded smoke is authorized. Do not send the key itself. Codex can execute the commands; no command-line work or RPG restart is needed from you. Merely saving credentials does not approve the full run.

## Limits and separate approval stages

Smoke normally makes **five calls**: four unchanged plan/narration/feedback/summary schema checks and one Jev evaluation. The ceiling is **8 requests / $3**, no reset, serialized, zero automatic retries. Unknown routing/cost or repeated failures stops execution. Mock tests cover negative cases without paid probes.

After smoke is reviewed, a full run would add **96 classifier calls** across 48 scenarios and **24 resolver calls** on eight preselected scenarios. **125 normal calls total including smoke; 128 maximum with three separately approved diagnostics.** Diagnostic headroom is shared across stages and cannot be spent automatically.

Proposed total API-key budget: **at most $30 including smoke**, subject to fresh pricing and a separate full-run approval. Current conservative reservations total **$28.25712**, not a spending target. Jev uses a paid planning rate of $0.042/M input (catalog rounded display $0.04/M), not a free promotion. The [frozen plan](results/live-plan.json) lists every permitted request.

Do not change the $3 cap now. Before any later full approval, inspect cumulative spend and remaining allowance together. Budget changes may restart a provider's accounting: subtract already-spent amounts so the combined allowance never exceeds $30, retain no refresh, and preserve the local ledger. If that cannot be established safely, stop rather than reset accounting or create untracked extra credit.

Dashboard enforcement can lag and an in-flight request may finish. Local reservations, fixed request/output caps and zero retries provide another safeguard; none is an absolute billing guarantee. Failed/uncertain requests remain reserved. Never remove the ledger to repeat calls or refill headroom. [Budget behavior](https://vercel.com/docs/ai-gateway/observability-and-spend/budgets).

No adoption or production permission follows from synthetic success. Owner review comes first; then smoke and full evaluation have separate gates. The implementation sprint remains unstarted.
