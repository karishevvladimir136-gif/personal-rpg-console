# FRAME closed-world grounding gate v2 — FAIL; stopped before VIDEO

The bounded correction was implemented, independently reviewed, deterministically verified and pushed at exact implementation **`9fb28651bb8d4512dea0356ee1e7e72e5195f0dc`** on `codex/v1-adventure-media`. The new live gate materially failed at F1. The automated visual check returned **pass**, but independent visual review found unestablished woodland and a material hand/item contradiction. No further production change, generation or VIDEO work followed the failure. The Adventure/Media milestone remains **NOT OWNER ACCEPTED**.

Main remains `1f9e3c56896d9cd5a374af6857f918c46bb80603`. Adventure, loot, rewards, containers, progression, World, frozen Mega DM evidence and the original dirty checkout remain unchanged. The [earlier failed FRAME report](ADVENTURE_MEDIA_FRAME_LIVE_GATE_REPORT.md) and all 16 of its local evidence files are hash-identical.

## Frozen input and dispatch

Gate version: **closed-world-grounding-v2**. Exact synthetic fixture-instance digest: `776bb775853cdb3dfe5cefad7cd3e1c81e7560394811661f7173bc456549c224`. All five public scene meanings F1–F5 remain those in [gate preparation](ADVENTURE_MEDIA_FRAME_GATE_PREPARATION.md); none was rewritten to accommodate this result.

One explicit image request used exact `gpt-image-2.5-sunburst-2026-09-08`, high, 1536×1024, PNG, n=1. One presentation check used the existing Responses requester, `gpt-5.4`/high/Standard, 4,096 output cap, 60-second timeout and 20,000 conservative full-wire input-accounting ceiling. The actual preflight accounting was 11,809. Neither path had tools, fallback, background execution or an automatic retry. The configured server OpenAI credential was present; no credential was printed or stored in evidence. Only synthetic disposable PGlite through migration27 and isolated campaign-scoped local pixels were used. No real/hosted database, Storage, import or deployment was accessed.

Current official Sunburst capability/pricing and the 2.5 calculator were rechecked before dispatch: high 1536×1024 was 1,372 output tokens; text input $5/M, image input $8/M and image output $30/M. GPT-5.4 Standard input $2.50/M and output $15/M supported the bounded check reservation. Sources: [Sunburst model](https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst), [image generation/calculator](https://developers.openai.com/api/docs/guides/image-generation), [GPT-5.4](https://developers.openai.com/api/docs/models/gpt-5.4). These are dispatch-time checks, not an account invoice.

## Case outcome

| Case | Image/check attempts | Outcome |
| --- | --- | --- |
| F1 — Bridge daylight | 1 image + 1 check | **FAIL** on independent material-grounding review; original automated verdict was pass. |
| F2 — Courtyard profile | 0 | NOT ATTEMPTED: mandatory stop after F1. |
| F3 — Rain shelter | 0 | NOT ATTEMPTED: mandatory stop after F1. |
| F4 — Table detail | 0 | NOT ATTEMPTED: mandatory stop after F1. |
| F5 — Approved outfit variant | 0 | NOT ATTEMPTED: mandatory stop after F1. |
| VIDEO | 0 | Not implemented or dispatched in this continuation; prerequisite gate failed. |

F1's exact committed public scene:

> Ari stands at the near end of a narrow stone bridge in clear morning light. The charcoal coat is buttoned. Ari holds the plain brass compass by its leather strap at waist height. The far bank and still water are visible; no other person is in view.

Its approved bridge guidance is low rough-stone parapets, quiet water and a grassy far bank. The generated image contains conspicuous recognizable mature woodland across the far bank, which was not positively established. Grass remains visible, so this is not a claim that all vegetation is forbidden; a salient woodland exceeds neutral texture, lighting or indistinct background filler under the closed-world contract.

The image also shows Ari grasping the brass compass body while the leather loop dangles. The scene materially requires holding it by the strap. Standing, the bridge, still water, daylight, coat/cream shirt/trousers/boots and absence of another person are broadly preserved. Eyebrow-notch fidelity is not reliably established, and one image cannot establish recurring face or outfit consistency. No evidence of a private/future-source leak was found. F2 opening closure, recurring identity across scenes, F5 outfit variation and full five-case consistency remain untested live.

The original structured visual-check verdict is preserved:

```json
{"schemaVersion":1,"status":"pass","reasons":[]}
```

**Important limitation:** because that check passed, the production authority attached one image to the disposable synthetic campaign before independent manual gate review rejected it. No prior usable art was overwritten in this new campaign, and the historical F1/F2 art is retained. The check's pass receipt and attachment history were not retrospectively relabelled or deleted. Deterministic no-pass/no-attachment tests pass, but this live false-negative shows the chosen verifier is not sufficient evidence that material scene grounding is enforced for every image. No corrective second paid attempt or further production repair was made after this gate failure.

## Provider evidence and accounting

| Field | Image generation | Presentation check |
| --- | --- | --- |
| Requested model | gpt-image-2.5-sunburst-2026-09-08 | gpt-5.4 |
| Actual returned model | Omitted/null; not fabricated | gpt-5.4-2026-03-05 |
| Actual returned tier | Not provided by image response | default / Standard |
| HTTP | 200 OK | 200 OK |
| Request ID | req_7d5c077d5295493792f5c536b8e6eddc | req_7029146ae4d945239d343cef831b2331 |
| Responses ID | Not provided | resp_07afee5fffde2bcf016aba1cb3743887d09ebe1378b805e41c |
| Input tokens | 1,123 text; zero image input | 3,329; cached-read 0; cache-write 0 |
| Output tokens | 1,372 image | 1,401, including 1,377 reasoning |
| Total tokens | 2,495 | 4,730 |
| Latency | 31,074ms | 17,447ms HTTP; 18,574ms requester/receipt |
| Usage-calculated charge | $0.046775 | $0.0293375 |
| Retained reservation | $0.40 | $0.20 |

Exactly **two new provider generation attempts** occurred: one image and one check. No retry, replacement or fallback occurred. New total usage is 7,225 tokens: 4,452 input and 2,773 output; reasoning is included in the check output, not charged twice. New calculated charge is **$0.0761125**. Including immutable prior F1/F2 evidence ($0.085870), combined usage-calculated media charge is **$0.1619825**. New reservations $0.60 plus prior $0.80 total **$1.40**, against the unchanged **$20 combined FRAME+VIDEO ceiling**. VIDEO cost/reservation is zero. Reservations are conservative accounting, not observed provider charges; account/invoice charge is unavailable.

Job/asset identity: `1d6fabf0-3507-44e0-be78-2a26af222767`, under disposable campaign `6cd6e438-bd77-4ff3-bb59-1ba1efd02695`. Exact queue/dispatch receipts, scene/reference versions, request digests and original returned bytes remain in the journal and frozen review. Output PNG SHA256: `197411c22a3eb97f068e26786802a88fad2494728c00dae8043ad9216e97f25a`.

## Authority and verification

The new image/check use only the exact public scene, eligible approved textual reference versions and scoped generated PNG. No private records, sibling-campaign state or retrieval were supplied to the verifier. Exact original dispatch replay returned the existing result without another image/check. The before/after coherent digest is unchanged: `c39b56a432d039f6f79cce6db550c9f5c084b6edb42db6864c76a6bc89383ca0`. This covers gameplay projection, resources/inventory, active timeline/head/lease, source/Canon generation, DM-private state and World Events; operational media job/check/asset rows are expected to change. Existing accepted FRAME Document lifecycle Memory-cache invalidation remains unchanged; the new QA stage itself has no Memory authority.

Fresh frozen-candidate verification: **1,573 tests; 1,572 passed; 0 failed; 1 skipped** (154,505.152ms). The skip is the existing opt-in hosted Supabase Auth/PostgREST check. Route generation/nonincremental typecheck, repository zero-warning lint and webpack production build pass. Affected 197/197, independent 12/12 and registry/grounding 38/38 overlap this suite; they are not added to its total. The first full-run stale runtime-task-list failure/log remains historical evidence. Disposable legacy/populated upgrade, fences, pass/fail/uncertain, previous-asset protection, privacy, duplicate/lost-response and Lab compatibility tests are in [independent QA](ADVENTURE_MEDIA_FRAME_GROUNDING_QA.md). No tests/build were rerun for this live/evidence/documentation-only stop report.

EN/RU ordinary-shell FRAME components were separately checked with synthetic transports at 1280×900 and 390×844: explicit cost/action, previous schematic after failure and zero horizontal overflow. Four screenshots are retained. This does not claim a real generated result in that preview, hosted authenticated campaigns, physical iPhone or deployed-route testing.

## Owner review and stop

[Static EN/RU review with the original F1 image](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/frame-grounding-gate-v2-20260928/OWNER_REVIEW.html). [Structured assessment](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/frame-grounding-gate-v2-20260928/ASSESSMENT.json). [Original execution journal](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/frame-grounding-gate-v2-20260928/journal.json). [Evidence hashes](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/frame-grounding-gate-v2-20260928/evidence-manifest.json). The same folder retains original image/QA responses, the frozen public basis and disposable DB export. The local UI preview remains [http://127.0.0.1:3102/preview/adventure-media](http://127.0.0.1:3102/preview/adventure-media); it uses synthetic data/schematic results and does not call a provider. Loopback is local to this computer.

Required stop is in effect: **F2–F5 and VIDEO were not attempted**. The bounded correction's offline authority/lifecycle work is complete, but this live grounding false-negative is a material blocker. No universal visual-consistency, reference-pixel identity or complete Media V1 claim is made. Stop for owner review; no next feature lane or real Level 1 Fighter Adventure begins.
