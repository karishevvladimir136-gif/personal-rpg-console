# Adventure / Media V1 — bounded implementation ownership

Authorized base: `1f9e3c56896d9cd5a374af6857f918c46bb80603`. Integration branch: `codex/v1-adventure-media`. The owner request in the September 27 attachment authorizes implementation, isolated commits/branch pushes and only the declared bounded synthetic media evaluation. Main and the original dirty checkout remain untouched. This is not complete V1, D2B, Living World, Timeline V2, 2D, EXPLORE or a real owner Adventure playtest.

## One integration authority

Lead owns all migrations/SQL, shared persistence/gameplay/Ruleset/World/Event/save/manifest contracts, core turn-store/runtime/narration integration, shared navigation, credentials/configuration, cross-lane integration, DEV_STATUS and final verification. Worker-local domain contracts are proposals beneath these authorities; any shared change must be agreed and integrated by Lead before use. Preserve historical manifests and source/Canon correction semantics. No client flag or document prefix can bypass ordinary factual corrections.

| Worker | Branch/worktree | Exclusive implementation ownership |
| --- | --- | --- |
| Adventure, reused World Lab worker | `codex/adventure-v1`, `v1-world-lab` | New `src/lib/adventures/**`, `src/lib/server/adventures.ts`, `src/components/adventures/**`, `src/components/persistent-adventures.tsx`, dedicated Adventure/World API routes, minimal `persistent-campaigns.tsx` creation fields, `tests/adventure-v1*.mjs` |
| Loot / acceptance, reused Timeline worker | `codex/adventure-loot-harness`, `v1-belonging` | New `src/lib/adventure-loot/**`, bounded progression planning/validation extensions in `src/lib/progression/**`, new `test-fixtures/adventures/**`, `tests/adventure-loot*.mjs`, `tests/adventure-acceptance*.mjs`; propose shared schema/runtime changes to Lead |
| FRAME, reused visual worker | `codex/media-v1-frame`, fresh `v1-media` | `src/lib/visual-frame/**`, new `src/lib/server/media/**`, visual FRAME components/wrappers and `/api/visual-frame`, new `tests/media-frame*.mjs`; no VIDEO implementation before the gate |

Workers never merge themselves or edit migrations, shared navigation, shared save/event/entity/foundation schemas, gameplay services, DEV_STATUS or frozen Mega DM fixtures/evidence. Commit/push only owned files and report focused checks plus exact handoff SHA. No default cwd commands against the original checkout. Reuse existing dependencies and accepted code; no broad architecture research or extra backend. Use Sol under AGENTS staffing policy; only a specific unresolved material blocker warrants bounded Astra escalation.

## Adventure / World / loot authority

- World identity/binding wraps existing approved immutable foundation/Pack/source authority; it is not another Canon store. Legacy campaigns/saves mean no historical World/Adventure association. Campaign identities and mutable hero/party/knowledge/private state stay isolated even within one World.
- Adventure metadata references Campaign continuity. Lifecycle and pacing never copy progression, possessions, wallet, rewards, Memory or Saves. Preserve exact start/checkpoint/source basis and immutable manual history. Canon settlement remains ordinary Campaign settlement; End Adventure returns to the same resulting state.
- Detached playable scope must be explicitly supported by exact snapshot/branch readers and writers. Never restore a Lab branch into active rows to fake playability, merge detached rewards, or claim an unsupported mode. Unsupported playable mapping is a disclosed limitation and safe disabled state.
- Capture/restore extensions must use explicit compatible manifest versions/families, preserving old required lists/hashes and historical readers. New Adventure/object state needs exact timeline/manifest membership; mutable global metadata cannot silently leak future association into old saves.
- Pacing is narrative guidance only; actual Party Power/profile facts inform the same Mega DM. No countdown, PC action choice, universal level matching, intrinsic-threat rewrite or committed-encounter rescale.
- Secured objects reuse existing Item/Storage/World/Event identity/settlement. Search discovery and first materialization are distinct. Commit stable contents through normal atomic fenced operations/receipts; refresh/retry/load/fork never reroll or regrant. No second inventory or reward ledger.
- Trust profile/content policy for reward ceiling/floor and separate rarity/power/value/significance/usability. No universal numbers or arbitrary model mechanics. Supported container bypass/noise/fragile effects remain typed and server validated; ambiguous/unsupported creativity pauses honestly.
- Hidden properties/provenance/private object facts never enter public inventory/context/price/disabled controls. Ordinary free-text gameplay must use the existing proposal → validation → settlement → narration path. Owner corrections remain bounded, manual, versioned and authoritative.

## Media authority and sequential gate

FRAME reuses the accepted Visual Bible/MOCK lifecycle, Gallery, reference eligibility, assets/provenance and server-side receipts/jobs. Preserve accepted lifecycle-versus-Canon correction separation and Lab checkpoint eligibility. Ordinary briefs are constructed positively from committed player-visible state and eligible approved references; never from a private-inclusive draft. Existing asset authority/storage owns outputs. Art does not mutate gameplay Canon/mechanics; failure/regeneration retains the prior usable asset.

Provider/model selection is not frozen by this contract: verify current official capability/pricing/storage/reference requirements and server-side credential availability first, then confirm the exact owner choice. Missing credentials permit provider-independent implementation only, with honest setup instructions. No secrets in client code, logs, commits or agent messages. Paid generation remains explicit/optional, cost disclosed, and never blocks text gameplay.

**VIDEO is blocked until the integrated FRAME gate passes:** correct attachment/isolation/reference visibility, stale callbacks, idempotency/lost-response/retry, previous-asset preservation, no gameplay mutation or Lab regression; then a frozen bounded synthetic visual sample, approximately five images, with recorded provider/model/cost and owner-reviewable consistency/spoiler evidence. A finite sample is not universal consistency. Only after that gate may the same worker implement optional asynchronous VIDEO from the approved/generated scene FRAME through existing media/job/asset boundaries.

The owner authorizes a combined hard live-media ceiling of **USD 20** for this wave, with roughly five FRAME and up to two short VIDEO samples, lower counts acceptable. No paid dispatch before verified pricing/capability, deterministic gates, frozen candidate and confirmed credentials/choice. Record a conservative worst-case reservation before the first dispatch; never count a reserve as observed charge. No automatic retries for prettier output, real/private data or unrecorded paid fallback keyframes. Text/model gameplay evaluation is not authorized by this media envelope.

## Verification and stop

Workers iterate with focused offline/disposable tests. Lead freezes the integrated candidate, then runs one fresh complete repository suite, route type generation/nonincremental typecheck, zero-warning repository lint, production build, historical populated migration/save upgrades, normal-path Adventure/loot/reward/container/media isolation/recovery tests and EN/RU desktop/mobile review. Do not count skipped tests as passed or viewport review as physical iPhone testing. Preserve frozen Mega DM evidence and prior accepted status verbatim.

The three new versioned Adventure scenario families are separate from Mega DM and contain authoritative starting state with no answer key. The first real Level 1 Fighter 3–5h owner playtest is an acceptance goal after this wave, not an executed campaign or pre-authored hidden twist. Final delivery reports exact SHAs/ownership, actual gates/costs, limitations and local synthetic preview, keeps main unchanged and stops for owner review.

## Bounded owner correction addendum

The current production implementation request is the attachment `626d371d-3446-44cf-8953-7fd98c668d03/Pasted text.txt`, from authorized main `1f9e3c56896d9cd5a374af6857f918c46bb80603`. It supersedes earlier documentation-only work. Its A10 secured-object contract and shared minimal UX authorize a bounded manual authoring/correction path.

The loot/harness worker additionally owns only new `src/components/adventure-loot/objects-panel.tsx`, `src/lib/adventure-loot/owner-contracts.ts`, and `src/lib/adventure-loot/owner-form.ts`, plus focused tests. These leaves present existing Item/Storage stock and bounded object label/access/portability/profile choices; no raw JSON, editable canonical identities, hidden fields, new inventory or shell redesign. Lead retains API, SQL, shared projection and navigation authority. No new agent or feature lane is introduced.

## Independent final review ownership

The latest owner implementation request is attachment `626d371d-3446-44cf-8953-7fd98c668d03/Pasted text.txt`, not the earlier documentation-only acceptance or Wave 1 stop. It explicitly authorizes A8 loot/reward integrity and A13 deterministic gates, and requires reward/inventory/loot/container regressions before delivery. After its FRAME handoff, the existing FRAME worker is reassigned one non-overlapping independent test/report task: new `tests/adventure-reward-independent-review.test.mjs` and `ADVENTURE_MEDIA_FRAME_GATE_PREPARATION.md` only. It may commit/push those files on its existing isolated worker branch. Lead retains every production reward/shared/SQL fix and DEV_STATUS. This reuses one contextualized agent, adds no feature lane or provider call, and does not supersede the sequential FRAME-before-VIDEO gate.
