# P0A + P0BD — joint owner review

Status: integrated and freshly verified; **owner/supervisor acceptance pending**. No main merge or real database activation.

## Exact candidate

| Basis | Exact SHA |
| --- | --- |
| Accepted main | `c885dc357ab63ee32421679e881735750022172f` |
| P0A reviewed input | `52de33156f9abfed358a185eafeaeec2b7efe3d1` |
| P0BD reviewed input | `d51bb82d4af7ab390d6a7adea58ba86d6e0bc280` |
| Frozen tested implementation merge | `df867f505023770da792158ae1fde486277aca02` |

Branch: `codex/playtest-p0-integration`. The final verification/status handoff commit is reported separately. Both input commits remain parents of the merge; all reviewed non-status files are byte-identical to the appropriate branch. Only `DEV_STATUS.md` conflicted. Both lane histories and the accepted historical status body are preserved.

## What to open and inspect

Open [combined Game](http://127.0.0.1:3120/campaigns/86dc5a4b-c61d-4069-8421-8acb7f71b702/game), then [Character](http://127.0.0.1:3120/campaigns/86dc5a4b-c61d-4069-8421-8acb7f71b702/character).

This is the built ordinary application, connected to the disposable rehearsal database on port 55321. The Campaign is **Synthetic P0 integration · Fresh Fighter**, not the real Adventure. The reviewed World/Adventure are similarly labelled synthetic. Provider credentials are blank and media disabled. The Game composer remains visible, but Send cannot call a live DM. No owner setup is needed for visual review; use the existing local owner login if prompted.

1. Game: inspect the readable story and two saved scripted first turns. The current Location is **Settlement meeting house**, with **Local work organiser** offering ordinary work whose terms remain open. The original opening screenshot preserves the first post-Start state before those turns. No chosen/famous hero, hidden plot, accepted job, combat, loot or reward was introduced.
2. Character: inspect Review Fighter, Level 1, HP 12 / 12, the neutral non-canonical mannequin and the compact **Main hand / Off hand / Body** equipment. These are exactly the supported template slots; there are no omitted or decorative unsupported slots. Species and canonical appearance remain unestablished.
3. Inspect **Starter Rules**, **XP Progression**, **0 / 100** and the next threshold. Internal taxonomy is secondary, in **Progression details**.
4. Click **Plain sword** in equipment or possessions. The first view is read-only recorded details. **Use, transfer or equip** retains supported gameplay actions. **Advanced · owner correction → Correct item record** opens the original editor. Close without saving for this review.
5. Open Inventory and inspect the same item; it uses the same read-only-first view. No item/equipment/storage authority was changed.
6. Game's **FRAME & VIDEO · this scene** remains secondary and unavailable in this safe preview. Neither Generate action was triggered.
7. Resize to mobile or inspect the saved mobile screenshots. Optional RU interface switching is available through Main menu → General Settings; it changes interface copy, not saved English campaign facts.

The combined UI fresh path was actually executed: World → supported New Hero Fighter → Evening 3–5h Adventure → Start. Start navigated directly to Game and the Location/opening existed before any turn. Production parser/authority/settlement then committed `I look around` and `I ask about paid work` using deterministic scripted responses. Each operation was replayed exactly with no duplicate. These are zero-call deterministic proofs, not live model quality samples. A synthetic manual save was created and loaded normally into **Synthetic joint review · restored opening**; its opening/turns/records remain available.

## Fresh integrated evidence

| Check | Actual joint result |
| --- | --- |
| Focused 43 files covering requested lanes/authorities | 459 passed; 0 failed/skipped; 50,573.6944 ms |
| Complete repository suite, one clean invocation against port 3120 | 1,734 total; 1,733 passed; 0 failed/cancelled; 1 existing hosted-Supabase opt-in skip; 208,242.5004 ms |
| Route generation | Passed |
| Nonincremental typecheck | Passed |
| Repository-wide lint | Passed, zero warnings |
| Production webpack build | Passed |
| Clean migrations 1–30 and populated 29→30 | Passed in disposable PGlite |
| Local populated rehearsal clone upgrade | All 78 existing RPG table fingerprints unchanged; 27 historical manifests valid |
| Grants / save-load / replay / rollback / campaign-head-timeline guards | Passed |
| Ordinary browser EN/RU | Game + Character + item inspection, 1440×1000 and 390×844; no horizontal document overflow |
| Actual provider requests | Zero |

Focused totals overlap the full suite. The hosted skip is intentional; no hosted-Supabase claim. Component regressions separately verify visible clarification/failure/recovery states. Browser checks are viewport checks, not physical iPhone testing.

Migration 30 SHA-256: `92f4cf70c40855c48332b6738e2a5921819962d1f2631dc6f22425b720a9ea5b`. It only changes functions and grants, not data tables or old manifest schemas. Rehearsal database: `supabase_db_rpg-adventure-rehearsal-20260928t233849z`, API 55321. Original database `supabase_db_personal-rpg-console` remains at migration `202609280029`; all 78 RPG table fingerprints matched the pre-integration baseline after the checks. Migration 30 was not applied to the original.

Ignored local logs/proof: `test-results/p0-integration/` (focused, full suite, typegen/typecheck/lint/build, clone upgrade/fingerprints and scripted first-turn replay). No credentials or DM-private contents are included in this guide.

## Screenshots

Local folder: `C:/Users/<owner>/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/p0-joint-integration/`.

- `game-before-start-en-desktop.png`, `adventure-review-en-desktop.png`, `opening-en-desktop.png`: fresh-path setup and first opening.
- `game-en-desktop.png`, `game-en-mobile.png`, `game-ru-desktop.png`, `game-ru-mobile.png`: story and scripted turns.
- `character-en-desktop.png`, `character-en-mobile.png`, `character-ru-desktop.png`, `character-ru-mobile.png`: mannequin, real slots and progression.
- `item-details-en-desktop.png`, `item-details-en-mobile.png`, `item-details-ru-desktop.png`, `item-details-ru-mobile.png`, `inventory-item-en-mobile.png`: normal item inspection.
- `owner-correction-en-desktop.png`, `owner-correction-ru-desktop.png`: explicit secondary editor, closed without saving.
- `save-load-en-desktop.png`, `game-after-load-en-desktop.png`, `media-unavailable-en-desktop.png`: save/load and disabled media.

## Preserved limits and stop boundary

P0A only bootstraps a **wholly fresh/unplayed no-Pack supported New Hero Fighter** into the reviewed meeting-house ordinary-work opening. It is not a general arbitrary-World generator. Established continuities are not rewritten. Other profiles, Pack-backed or partly authored campaigns may fail safely or retain their existing behavior. The already-active empty Garrick Adventure is not repaired retroactively.

The safe review server intentionally has no live DM/media capability. English authored content stays English in RU interface review. No canonical portrait, species, richer slots, progression changes, FRAME/VIDEO changes or P0C work was added. Both previous lane handoff/status qualifications, including the earlier P0BD preference-history disclosure, remain unchanged.

Remote main remains `c885dc357ab63ee32421679e881735750022172f`. The original dirty checkout and accepted playtest checkout are untouched. **No real migration 30, provider call, deployment, import or new lane.** Stop for joint owner/supervisor review. Publication and real database activation require separate authorization.
