# Wave 2 owner review

Wave 2 is ready for review on `codex/production-mega-sprint-wave2`. It has not been merged into main, deployed, applied to your database, or owner accepted. Use synthetic sources and a disposable campaign for the first review.

## Setup before using this branch

The existing owner sign-in and Supabase setup still apply. This branch needs additive migration `202609200011_production_wave2.sql` after migrations 1–10. The sprint applied it only to disposable test databases; your real database was not changed. Applying it to real data is a separate release step.

OpenAI credentials and the application default remain server settings. The existing `.env.local` settings are `OPENAI_API_KEY`, `OPENAI_DM_MODEL`, and optional `OPENAI_DM_REASONING`; restart the application after a server-setting change. No credential is entered into campaign settings. A campaign may select its own registered model even when no global model is selected, provided the server credential is configured. Opening settings and compiling local sources make no provider requests. Actual gameplay uses the configured provider and may incur its normal costs. No Test Connection action was added.

## Choose models and world rules

From the main menu, open **Settings → AI Providers / Models** to see configured/unavailable status, the application default, and registered model choices. “Configured · not tested” means settings are present; it does not certify provider connectivity or model quality.

Open a campaign's **Campaign Settings → AI, World & Rules**. Choose its primary model, leave it inherited, or expand task overrides. Choose World simulation On/Off, World autonomy, Deadline pressure (Off / Critical only / Normal), and console-basic-v1 or World Logic. Click **Save AI, world & rules**. Finish or cancel an unfinished turn first. An active encounter also blocks these changes. Re-enabling an overdue background schedule can require reconciliation that this wave does not yet expose; no backlog is run silently.

Unavailable selections stop explicitly. Task overrides do not silently fall back to another provider/model. New choices apply to future actions; pending work keeps its recorded execution profiles.

## Create a source and review a Pack

1. Open **World Library** from the main menu. Create a source by pasting text or selecting a TXT/Markdown file. Set public/private visibility and source/future-source knowledge. Click **Preserve source**. Previous versions, original text, hashes, and evidence remain available.
2. Include source versions, put the highest-priority source first, and click **Create compiler job**. Advance **Begin extraction → Extract source lines → Index draft claims → Audit and prepare review**. Each step is explicit and local.
3. Open the resulting Pack. Review coverage, source excerpts, candidate claims, unknowns, and contradictions. Save edits with **Save new draft version**. Approving a Pack requires review acknowledgements. Canon claims require their own explicit selection and valid knowledge/time/conflict review; compilation never publishes Canon by itself.
4. Return to **Campaign Settings → World Packs**, select an approved immutable version, enter an entry label and world time, and click **Pin this version**. Expand the pinned Pack to see exact Pack/source versions and source digests.

For a small supported fixture, use:

```text
person: Mara
location: Harbor
alias: Captain
```

The compiler recognizes a bounded set of explicit line/heading patterns. Ordinary prose remains a source assertion. It does not infer a complete world from arbitrary literature. TXT/Markdown are the supported input formats; no PDF/OCR, crawling, images, or live research is included. Correcting a source invalidates pending derived work and blocks stale approval. Existing approved history and campaign pins remain unchanged; compile/review a new version and explicitly repin when appropriate.

## Play World Logic and recover a turn

Select World Logic in campaign settings, open a session, then type a free-form action in the existing Game screen. This path does not require HP, a class, ability scores, initiative, or d20 checks. It supports bounded observation, speech, attempts, waiting, and movement to established locations, with validated public consequences. It does not grant arbitrary generated powers or unrestricted state changes. Unknown, contradictory, or unsupported consequences pause for clarification; cancel the unfinished turn and explicitly submit a revised action.

After a save/load/branch change, use **Resume this turn** when offered. The server checks the current state against the captured authority, preserves the input and recorded checks, and only continues an equivalent staged result. It does not reroll, force-apply a stale proposal, borrow a sibling timeline's work, or rewrite history. A material change produces a review state with **Cancel unfinished turn** and an explicit new action. Old stages without recovery proof remain readable, but cannot continue across a changed head/epoch.

## Review boundaries

Automated checks use deterministic providers and disposable databases. The settings components were separately checked in a synthetic browser harness in English/Russian at desktop and 390×844. Real owner sign-in/database workflows, live model quality, and physical iPhone behavior were not evaluated. No arbitrary custom tabletop mechanics, World Lab, What-If, Enter This World, media, or spatial work is included.

After owner review, the recommended next bounded wave is richer reviewed world capabilities/consequences, explicit overdue-schedule reconciliation, and a more guided Pack review/pinning workflow. A/B/C are not declared fully complete. Wave 3 has not started.
