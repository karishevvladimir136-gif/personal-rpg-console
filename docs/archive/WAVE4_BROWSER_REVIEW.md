# Wave 4 separate browser review

Reviewed September 20, 2026 using the in-app browser. This evidence is separate from automated tests and owner acceptance.

The disposable local harness at `http://127.0.0.1:3095/preview/owner` imports the actual integration `FoundationLoopEditor`, `PreparationReviewPanel`, domain planners and application styles. Records live only in process memory. The process has no application credentials, and outbound requests are blocked. Its toolbar, scenario switches, lost-response switch and synthetic negotiation button are demo-only. It does not prove live Auth/Supabase persistence or model quality; those server settlement paths are exercised independently with disposable SQL/scripted tests.

## Observed flows

| Language / viewport      | Actions and observed result                                                                                                                                                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| English, desktop         | Bought two Storm lanterns after reviewing the exact 48-credit quote; player funds changed from 160 to 112. Inspected disabled stolen/equipped/quest inventory. Selected Trailcraft advancement, then claimed the eligible reward and observed XP 12→27 and a further pending choice. |
| English, desktop         | Changed the owner currency label from Harbor credits to Quay credits and saw it in Trade. Selected only the intended Pack person, location and Thread; corrected name, multiline aliases, capability, limitation and Thread title; saved and read the corrections back.              |
| Russian, 390×844         | Corrected and saved the Thread title. Reviewed a sale of three Coffee tins for 12 credits, injected a lost reply, observed editing locked pending exact retry, then retried: funds increased once, player stock fell by three and merchant stock increased by three.                 |
| Russian, 390×844         | Selected the next advancement, inspected owner configuration and progression Off. XP/progress controls were suppressed in Off while eligible non-progress rewards remained available. Charcoal/bronze styling and responsive controls were visually inspected.                       |
| English→Russian, 390×844 | Typed an unsaved manual Pack entity name, changed language and verified the draft was preserved. Saved a Russian corrected name and observed the Russian success state. This was repeated after repairing the language-switch draft reload defect.                                   |
| Russian, 1440×960        | Inspected unavailable-merchant and insufficient-funds scenarios. A requested unaffordable purchase showed the failure explanation without applying an exchange. The normal Game free-text link remained available.                                                                   |
| English, 390×844         | Created a quote, changed the synthetic active timeline, and observed the frozen-record warning plus disabled confirmation and inputs. Funds remained 160; explicit reload was offered.                                                                                               |

At the checked mobile state, `innerWidth` was 390 and document scroll width was 375, with no horizontal overflow. Desktop screenshots and mobile screenshots were inspected in the browser. No physical iPhone check is claimed.

The final preview was reset to its English ready-campaign state and a 1440×960 desktop viewport. The loopback address works on the host computer; a phone's `127.0.0.1` refers to the phone itself. No network exposure, deployment, persistent owner-data mutation or provider call is needed to use this synthetic preview.
