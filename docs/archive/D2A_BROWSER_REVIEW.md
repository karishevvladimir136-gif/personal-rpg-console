# D2A browser review — synthetic actual components

Lead checked the final `src/components/world-lab` components and styles at UI handoff `b1379a67c5349d0d25127b0fa312cae07ceb5bec`, integrated as `a1bda61`. A comparison of that component directory with the final integration checkout found no differences. The final generated preview bundle was reloaded before these checks.

The loopback preview at `http://127.0.0.1:4191/` uses an ignored harness in the UI worktree. It imports `WorldLabPanel` and injects public synthetic authoring/run transports. The visible top bar says **SYNTHETIC COMPONENT PREVIEW · SCRIPTED TRANSPORT · NO PROVIDER**. No Supabase connection, provider request, credentials or owner campaign data is involved. This is component/UI verification, separate from actual service/SQL/provider-boundary tests.

| View | Exercised flow | Result |
| --- | --- | --- |
| English 1365×900 | Type What If; interpret; recover a deliberately lost authoring response; manually edit title and consequential answer; save; approve/prepare; separate start; continue; inspect two checkpoints; pause/resume/cancel | Passed |
| Russian 1365×900 | Type Russian premise; interpret; edit Russian title and answer; save; approve/prepare; start; lose continuation response; exact retry; inspect two checkpoints; pause/resume/cancel | Passed |
| English 390×844 | Type; interpret; manual title/answer corrections; save; approve; start; lose continuation response; exact retry; inspect history; pause/resume/cancel | Passed |
| Russian 390×844 | Type; interpret; manual corrections; save; approve; start; lose continuation response; exact retry; inspect history; pause/resume/cancel | Passed |

Interpret produced one synthetic composition response. Saving corrections and approving did not request another model response. Start and Continue added one scripted resolver response each; retrying a response already saved by the fixture recovered the same operation and checkpoint without an extra scripted response. Cancel retained the two checkpoints. These visible audit checks complement, rather than substitute for, durable operation tests.

Visual screenshots were inspected for desktop chronology and mobile review/history. The charcoal/bronze styling, wrapped long Russian/English titles, single-column mobile form, full-width approval button and visible NON-CANON label were retained. Document width was 1350 within a 1365 viewport and 375 within a 390 viewport; no horizontal page overflow was observed. Saved policy and cost/request explanations were readable in both languages.

Missing-checkpoint and unavailable-model states were exercised: they show actionable guidance, disable Interpret when necessary and make zero scripted model requests. The expert/reuse flow remains subordinate to the natural-language form. Original proposal/source details remain expandable; authority identifiers are not editable fields.

Limits: browser actions used scripted transport, not hosted authentication/database/provider behavior. Fixture reload resets in-memory receipts; durable restart/receipt restoration is established by service/SQL and client unit tests, not this fixture. No physical iPhone, model-quality evaluation or owner acceptance is claimed.
