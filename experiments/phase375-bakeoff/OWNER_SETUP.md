# Optional next step: authorize a small live bake-off

Nothing here changes your running RPG Console. You do not need to edit application code, restart the RPG app or reuse its OpenAI key. This experiment needs a separate **Vercel AI Gateway** key. Never send any key, password or token in chat.

## First stage only: smoke test

1. Sign in to Vercel and choose the team you intend to use. Open **AI Gateway → API Keys** using the dashboard sidebar or the [official API Keys link](https://vercel.com/d?title=AI+Gateway+API+Keys&to=/%5Bteam%5D/~/ai-gateway/api-keys).
2. Before buying anything, check whether the team supports the requested zero-data-retention control. Vercel documents this for Pro/Enterprise. If it requires a plan upgrade, stop and report that fact; no upgrade or subscription is authorized by this report. [Privacy controls](https://vercel.com/i/secure-ai-gateway).
3. In **AI Gateway → Settings**, check for **Bring Your Own Key (BYOK)** connections. This plan uses Gateway credits with no OpenAI/TypeSafe BYOK connection: BYOK charges bypass Gateway budgets. Do not remove an existing connection or copy the app's OpenAI key. If your team already uses BYOK, stop and tell me that it is enabled, without sending credentials; we will agree on an isolated billing setup. Check available Gateway credits and leave automatic credit top-up off for this test.
4. Click **Create key**. Name it `rpg-bakeoff-smoke`. Enable **Spend Quota / Budget**, enter **3 USD**, and choose **None / no refresh**. Choose a short expiration if offered. Create the key, copy it locally and wait at least two minutes before testing; confirm the dashboard displays the $3 cap. Do not use a key showing “Unlimited.” [Key budgets](https://vercel.com/docs/ai-gateway/observability-and-spend/budgets).
5. Open File Explorer. Paste this exact folder into its address bar and press Enter:

   `C:\Users\karis\OneDrive\Documents\GitHub\personal-rpg-console\.worktrees\phase375-bakeoff\experiments\phase375-bakeoff`

6. Right-click **`.env.bakeoff.local` → Open with → Notepad**. An empty ignored file has been prepared locally. On its last line, paste your key immediately after the equals sign:

   ```text
   AI_GATEWAY_API_KEY=
   ```

   Keep it on one line. Save with **Ctrl+S** and close Notepad. Do not place the key in this Markdown file, the running app's environment, browser configuration or GitHub. On another checkout, create the same file using Notepad's **Save as type: All files**, with that exact filename (no `.txt`).
7. Tell me only: **“Gateway key saved locally; approve the smoke test up to 8 requests and $3.”** I will run it after checking the approved plan. No command-line work or application restart is needed from you. Merely saving a key does not authorize the full evaluation.

Dashboard budgets can lag and the request crossing the cap can finish. The harness also reserves estimated cost before each request, runs one request at a time, disables retries and retains failed/uncertain reservations. Limits are safeguards, not a billing guarantee. [Budget behavior](https://vercel.com/academy/ai-gateway/set-a-budget).

## Proposed full test — do not authorize automatically

The smoke normally makes five calls: four Astra schema checks and one Jev evaluation. Its ceiling of eight leaves room only for explicitly reviewed diagnostics, never automatic retry. Privacy/routing incompatibility or unknown billing stops work.

After smoke review, the proposed full test makes 64 development classifier calls and 320 held-out classifier/resolver calls. Total ceiling including smoke: **392 calls**, maximum 295 Astra and 97 Jev. Each request has at most 12,000 serialized input bytes, a 60-second timeout and, for Astra, 4096 output tokens. No private or real campaign data is used.

Proposed total budget: **$125 including smoke**, excluding any separately purchased subscription/taxes. Estimated maximum token reservations at September 19 catalog rates are approximately **$96.79**, including Jev contingency; actual billing must be reported. Recheck tariffs first: Jev's current free promotion ends September 25. Full evaluation requires a separate explicit approval and a reviewed cumulative remaining key budget; do not raise the budget now. Editing a dashboard budget can restart its accounting, so already spent amounts must be deducted from any new allowance.

No classifier.dev, OpenRouter, other provider, deployment or production adoption is included. If a required control is unsupported, the outcome may remain **blocked / do not adopt**, without relaxing it.
