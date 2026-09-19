# Phase 3.8B — minimal synthetic spatial test protocol

2026-09-19. **PREPARATION AUTHORIZED; LIVE EXECUTION NOT AUTHORIZED.** Phase 3.8A is owner-approved at 444f6836a5abce2014c3de4b6f234bf2a75399af. The isolated harness is frozen for exact-SHA owner review; zero live calls executed and no credentials requested. No production dependencies or runtime changes. Paid execution requires a separate explicit approval of that preparation SHA. This protocol does not reopen Phase 3.75 or spend its budget. No production runtime/UI/migrations/data changes are included. Research basis: [provider matrix](PHASE38_PROVIDER_CAPABILITIES.md); required invariants: [Spatial Runtime](PHASE38_SPATIAL_RUNTIME.md).

## Questions and smallest useful workload

Four serialized billable submissions answer four distinct unknowns: can a hosted world persist and export usable geometry; does a larger environment remain usable; what exactly does the older fal world endpoint return; can a current object asset support an independently mapped RPG prop? Use one synthetic room, one courtyard and one chest. No model-quality leaderboard, statistical superiority claim, realtime simulation, private data or full benchmark.

No part-splitting call is proposed: documented 3.1 generator minimum faces exceed the splitter limit and GLB is not its FBX input contract. Adding decimation/conversion would expand the experiment before its need is demonstrated. No Seed3D call without verified endpoint, entitlement and price; no HY-World GPU setup, Atlas early-access request, Reactor or Genie session. Missing capabilities are reported, not replaced by other models.

## Exact ordered submissions and cost reservations

| ID | Exact provider / HTTP endpoint / selected model | Purpose / expected output | Published maximum for selected options | Reservation USD |
| --- | --- | --- | --- | --- |
| spatial-room-1 | World Labs: POST https://api.worldlabs.ai/marble/v1/worlds:generate; model marble-1.1 | Furnished room; world ID, SPZ, collider, panorama and hosted locator | 1,580 credits / 1,250 = $1.264 | $1.30 |
| spatial-courtyard-1 | Same endpoint; model marble-1.1-plus | Larger courtyard; same asset families, bounded extra world size charge | 3,080 credits / 1,250 = $2.464 | $2.50 |
| spatial-fal-world-1 | fal: POST https://queue.fal.run/fal-ai/hunyuan_world/image-to-world | Room panorama from first result → world_file; determine actual format/viewing capability | $0.30 | $0.35 |
| spatial-chest-1 | fal: POST https://queue.fal.run/fal-ai/hunyuan-3d/v3.1/pro/text-to-3d | Standalone chest GLB/materials; inspect object identity, geometry and PBR | $0.375 + $0.15 PBR = $0.525 | $0.60 |

**Exactly four billable submissions if all stages pass; at most four, never retries. Maximum published generation charges $4.553; total reservation ceiling $4.75.** Sources: [World API pricing](https://docs.worldlabs.ai/api/pricing), [fal world price](https://fal.ai/models/fal-ai/hunyuan_world/image-to-world/llms.txt), [fal 3.1 price/options](https://fal.ai/models/fal-ai/hunyuan-3d/v3.1/pro/text-to-3d/llms.txt). Prices must still match at freeze/authorization; do not silently shrink options or substitute models to fit changed prices.

This ceiling covers these generation requests, not minimum account funding, taxes or unrelated storage/account charges. No purchase/top-up is authorized here. If an unavoidable extra charge cannot fit a newly explicit complete cap, stop for revised approval. No HQ mesh export, image generation, topology pass, paid conversion, diagnostic call or automatic failed-job resubmission. Account balance/auto-refill settings are not a reliable substitute for a local reservation guard.

## Synthetic request contents to freeze before authorization

World requests use their pinned model above, permission.public=false, seed=38001 for room and 38002 for courtyard, descriptive display_name equal to the ID, and world_prompt with type=text. Exact text proposals:

**Room:** “A simple rectangular furnished reading room, roughly six by eight metres. One visible wooden door in the north wall, two windows in the east wall, one plain table with two chairs, and one closed undecorated wooden chest by the west wall. Warm daylight, pale plaster walls, stone floor. No people, lettering, concealed compartments, additional rooms or objects. Show only this single room.”

**Courtyard:** “An open rectangular stone courtyard, roughly thirty by forty metres, with a central dry fountain, four plain benches and two small trees. A continuous low wall surrounds the space, with one visible open archway facing an empty sky backdrop. Daylight. No people, inscriptions, interiors, tunnels or hidden spaces. Show only the courtyard and its visible boundary.”

Dimensions are desired visual composition, never authoritative geometry guarantees. Directions/props become inspection targets only. A model ignoring a boundary cannot establish canon or discoveries.

Fal world input: image_url is the exact first result's synthetic panorama reference; labels_fg1 = “table, chair, wooden chest”; labels_fg2 = “door, window”; classes = “indoor room, furniture, architecture”; export_drc = true. This is explicitly authorized cross-provider use of that synthetic result in a later approved experiment. Record its byte hash and lineage. If the required panorama is missing, inaccessible to fal or cannot be shared under the reviewed account terms, stop before this submission; do not create/upload another image or make a fallback call. This derived-input probe is not a fair same-input quality ranking.

Fal chest input: prompt = “A single undecorated wooden storage chest with iron corner bands and a visibly separate closed lid, shown as one isolated object. No contents, text, symbols, surrounding room or people.”; generate_type = “Normal”; enable_pbr = true. Omit face_count and multi-view options; keep documented defaults. No unsupported seed or articulation parameter. Exact schemas: [world generation](https://docs.worldlabs.ai/api/reference/worlds/generate), [fal world](https://fal.ai/models/fal-ai/hunyuan_world/image-to-world/api), [fal object](https://fal.ai/models/fal-ai/hunyuan-3d/v3.1/pro/text-to-3d/api).

Before calls, a separately authorized experiment-only preparation freezes these UTF-8 inputs, schema/source evidence, selected endpoint/profile options, parser versions and protocol hashes with a reviewed commit. No preparation code, fixture file, parser, viewer dependency or API harness is implemented in 3.8A. Record the generated panorama hash append-only as an output dependency; never amend the frozen initial prompt to accommodate results.

## Bounded requests, evidence and stopping

Use a fresh isolated experiment record, not a reset of any Phase 3.75 ledger. Reserve each listed maximum durably before submission; reject duplicate IDs. Retain every reservation even on failure/timeout. Sum prior reservations before allowing the next slot; do not recycle “unused” funds for extra calls. Record actual reported cost separately. Unknown costs stay unknown and retain their full reservation; no fabricated zero.

Use explicit server HTTP submission with zero retries/fallbacks and one outstanding job. Normal pending-status polling is distinct from retrying a submission. A completed provider failure or network error stops the study, including poll/result errors. Do not proceed to the next job hoping that it works. No automatic diagnostic requests.

Read-only request bounds, included in the proposed authorization:

- Up to 45 status GETs per submitted job, one every 20 seconds, at most 15 minutes per job. World Labs uses /marble/v1/operations/{operation_id}; fal uses the returned allow-listed status_url. Poll only while normally pending. No retry of an error response.
- Exactly one result GET per completed fal job (up to two); up to four World Labs GET /marble/v1/worlds/{world_id} reads total: first verification and one later re-open per generated world. No extra export POSTs. Fal result/status paths follow returned receipt URLs rather than guessing subroute shapes ([queue protocol](https://fal.ai/docs/documentation/model-apis/inference/queue)).
- Maximum authenticated API requests: 4 submissions + 180 polls + 2 fal result reads + 4 world reads = **190**. Usually far fewer; log read counts separately from the four billable generation calls. A read expected to be nonbillable becoming chargeable stops the run.
- Up to 14 direct asset-file downloads total, distinct from API requests: two worlds' selected SPZ/collider/panorama/thumbnail sets, fal world_file, chest GLB and up to four material companions. No content search, extra hosted-model action, browser auto-generation or unrestricted remote viewer telemetry/API sequence. Review offline in an isolated viewer only if its preparation has been separately approved. Missing viewer means browser capability remains unverified, not a permission to install tooling during the run.

Stop on the **first unexplained failure**, missing/invalid required output, unexpected route/model substitution, unauthorized URL, input/privacy violation, newly unbounded charge, budget risk, timeout or unverifiable billable accounting. If a response lacks per-request charge fields, a request-matched provider dashboard receipt is acceptable evidence; pause before the next submission until manually reconciled. No billing API diagnostics are assumed. A known unsupported format is a capability failure and also ends this minimal sequence; do not repair it with another generation. Late/uncertain jobs are not retried and keep their reservations.

Record request ID, pinned endpoint/provider/model, safely reported actual model or UNKNOWN, operation/world ID, start/end/poll timings, asset hashes/formats/size, safe status/warnings, usage if the provider reports it, cost/credits and evidence source. Image/world APIs may not report tokens: mark not applicable or unknown, not zero-token proof. An endpoint name proves what was requested, not a secret provider-internal model revision. Do not import Gateway-specific attempt metadata requirements into a transport that does not expose them. Unexpected redirection or model fallback is still a stop.

## What passes, what remains unknown

| Test | Minimum observed evidence / failure |
| --- | --- |
| Room | Valid stable world receipt, downloadable nonempty geometry and panorama, declared scale transform, same ID/assets on re-open; missing persistence/export is failure, untested auth/browser embed remains unknown |
| Courtyard | Independent stable world, larger visible extent and usable boundary; output size/quality/scale measured, extra unseen geometry quarantined; missing safe envelope or exceeded cost cap fails proposed EXPLORE use |
| fal world | Determine true world_file type by content, not filename. If only image/panorama, no persistent geometry, unreadable archive or unsupported payload, report capability failure; never call it a navigable editable scene without evidence |
| Chest | Inspect GLB structure/materials, approximate dimensions, orientation and whether lid is separately addressable. Fused lid is an observed articulation limitation, not transport failure or reason to buy another call. Check one explicit local binding to synthetic chest ID; no canonical object creation |
| Cross-cutting offline replay | Re-open retained bytes; mock take/open/remove and stale binding/source scenarios without provider calls or database writes. Verify unchanged mock authoritative state until a simulated approved normal-game commit, versioned rebinding and outage fallback. Does not prove live save/runtime integration |

Report capability observations separately from visual quality (prompt adherence, artifacts, walkable appearance), presentation performance (bytes/load/frames on actual hardware), privacy/export controls and price. Use at most a single sample per slot; no reliable provider ranking, causality, true physics or universal recovery claim follows. Successful transport/export is not acceptance of EXPLORE production readiness. Real mobile/iPhone/Safari, long-term retention and real campaign privacy remain later gates.

## Future owner setup, not a credential request

If this exact proposal is later authorized, needed accounts are World Labs API access and fal. Proposed local server-secret convention follows [Model Runtime onboarding](MODEL_RUNTIME_BRIEF.md): ignored .env.local in the isolated running experiment checkout, placeholder names WORLD_LABS_API_KEY and FAL_KEY (World Labs adapter maps its value to WLT-Api-Key). Final prep must give the owner the exact absolute Notepad path and verified restart action. Do not reuse the production secret file, overwrite existing keys, place credentials in browser config or request them in chat. No file/key/account is created now.

Before using any content, record permissions/private flag, applicable account terms and sharing of synthetic panorama to fal. Before live execution, obtain explicit owner approval of frozen commit, four calls, all read/download bounds, $4.75 reservation ceiling and any account-funding implications. Stop after results for owner review; no second batch, Phase 4 start or EXPLORE implementation follows automatically.

## Preparation freeze and current official recheck

The four reviewed inputs, endpoints, options, prices and $4.75 reservation ceiling above are unchanged. The isolated [harness](experiments/phase38-spatial/README.md), [machine-readable protocol](experiments/phase38-spatial/protocol.json), [freeze manifest](experiments/phase38-spatial/freeze.json) and [dated official evidence](experiments/phase38-spatial/OFFICIAL_EVIDENCE.md) add executable offline guards. The manifest pins source, synthetic fixtures and official evidence. Documentation is not proof that a provider has passed this experiment.

Explicit fal `X-Fal-No-Retry: 1` and `x-app-fal-disable-fallback: true` headers enforce the already-reviewed no-retry/no-fallback restriction against documented platform defaults. No extra request is added. Each successful job pauses for manual output review; unknown per-request charges also require a matching manual receipt before the next submission. Unsupported encodings/asset hosts stop, with no conversion, substitution or extra call. Known costs never release reservations.

Additional download byte guards: JSON responses at most 2 MiB; individual assets at most 256 MiB; cumulative downloaded asset bodies at most 1 GiB, checked against remaining allowance before transfer. The supported happy path downloads ten files; fourteen is a ceiling, not a requirement to fetch more. No viewer or codec dependency is installed. Future rendering/quality and the chest's articulation remain explicitly unverified.

World Labs' minimum API funding is $5 (6,250 credits). Fal's current minimum top-up is UNKNOWN from public official evidence. Funding, taxes and unrelated account charges are distinct from the generation reservation cap; no purchase or credentials are requested now. This preparation must stop after commit/push for owner review.
