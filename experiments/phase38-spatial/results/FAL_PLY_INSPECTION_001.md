# Phase 3.8B final offline PLY structural inspection

**A — STRUCTURALLY_USABLE_PLY_WORLD_CANDIDATE. STOP FOR OWNER REVIEW.** All three retained PLY layers were fully parsed as nonempty mesh structures, with finite coordinates and valid face references. This is structural evidence only, not visual/navigation/production acceptance.

## Source and preservation

- Accepted evidence base: e74f98070a35506bdb0401e2d2db2e492c9f8da4.
- Execution checkpoint remains: 0c6ee50ef82a8d2b0423a31bf75ab402cfa492c5.
- Recovery identity/hash: phase38b-fal-exact-artifact-recovery-1 / 6c4762d090718fe11188f4d777eb51a1dd37ff515e14eeab6159f80c7d42ed98.
- Accepted evidence file SHA-256: ea6188f69a302918afc592c25d44995d007a88a6c17cdc37a96f3a7b12f972f9.
- Retained ZIP: exactly **85,481,294 bytes**; SHA-256 **721f2afef8c2c045566e20f203557c549d712eef430edd671e5bb2c00b2de331**, verified before and after inspection.
- Original inventory/ZIP structure, CRCs and entry hashes revalidated: 17 entries / 152,960,818 uncompressed bytes.
- All 31 prior committed evidence files, original STOPPED histories, recovery anchor/journal/witness and all 67 frozen inputs remain unchanged. No ledger writes, approvals, resets or reopening of stopped identities.

## PLY results

All three files have valid PLY magic/headers, version **1.0**, **binary little-endian** encoding and exactly the declared vertex/face payload. Full payload parsing completed with no truncation or unexplained trailing bytes. Positions are double-precision x/y/z, RGB colors are unsigned bytes, and face lists use an unsigned-byte length plus unsigned 32-bit vertex indices. No identifiable UV/texture properties exist in the PLY headers.

| Archive index | Vertices | Faces | Normals | Face size min/max | NaN / Infinity | Invalid faces / indices |
|---:|---:|---:|---|---|---|---|
| 5 | 61,347 | 143,045 | double nx/ny/nz | 3 / 3 | 0 / 0 | 0 / 0 |
| 14 | 1,843,200 | 3,682,560 | absent | 3 / 3 | 0 / 0 | 0 / 0 |
| 15 | 59,412 | 127,954 | double nx/ny/nz | 3 / 3 | 0 / 0 | 0 / 0 |

All **5,891,877 coordinate values** were checked and are finite. All faces are triangles. Zero repeated-index faces and zero non-finite supplied normals. Counts total **1,963,959 vertices / 3,953,559 faces**. This does not test triangle areas, manifoldness, watertightness, visual coherence, scale or collider alignment.

Bounding boxes below use native coordinate units with **no assertion of metric scale**, rounded to six decimals; exact bounds are retained in JSON.

| Archive index | (min x, y, z) → (max x, y, z) |
|---:|---|
| 5 | 0.323110, -1.529598, -0.643399 → 1.938588, 1.789444, -0.242737 |
| 14 | -2.698611, -2.698611, -2.698615 → 2.698611, 2.698611, 2.698615 |
| 15 | -1.927912, -0.654275, -0.529334 → 2.423952, 2.252390, 0.289201 |

Content SHA-256 was reverified for each layer against the accepted inventory:

- Index 5: 4,988,607 bytes; 049c9f02b7410eec5070c2c59020d7e308f7ee6d4735634ab98ea557fe04b0c1
- Index 14: 97,639,951 bytes; 097c1da725a549f1380113af256f125cad8f53bc3a74ecde3234feaf2878f18a
- Index 15: 4,693,739 bytes; 0b241dc4e68168573ea679d8f1d4bcc41a2050ab02948f21df34e9a4dc89b233

## Optional safe package metadata

All 12 PNG signatures/IHDR fields/CRC passed, without full image decoding. All are 8-bit, non-interlaced: 9 RGB and 3 grayscale. Dimensions observed: 4064×2016 (5 files), 2036×1018 (2 files), 4072×2036 (2 files), 2032×1008 (3 files). See the exact per-index table in JSON for authoritative counts.

Both small JSON entries parsed as objects with one top-level array each. Arbitrary field names, values and private filenames are withheld; no semantic claims about layer organization are inferred. PNG/JSON content hashes were checked, but no images rendered or embedded contents executed.

## DRC finding and phase boundary

The frozen request used **export_drc:true**. The returned archive has **no .drc** and contains **3 .ply world candidates**; GLB/glTF are absent. PLY is acceptable for this capability review. DRC absence is a provider/export limitation, **not justification for retry or resubmission**. Future adapter/renderer planning must support the observed PLY representation or an offline validated conversion path instead of requiring DRC exclusively. No production renderer or adapter is modified here.

**Visual quality: UNVERIFIED. Navigation quality: UNVERIFIED.** No new owner approval, next release or chest attempt.

## Bounds, tests and files

Additive offline files live outside the frozen live harness's source enumeration: two local-only TypeScript modules, an isolated build config and 42 synthetic tests. No frozen code/test/config/hash changed. Existing bounded ZIP validation is reused; entry streams are read directly and content-hashed. PLY buffers are capped at 128 MiB and never allocated from vertex/face declarations. Header 64 KiB; at most 8 elements/32 properties per element; 4 million records per element/8 million total; list length 64; 80 million scalar reads; 60-second PLY deadline. Whole offline inspection is bounded to 240 seconds. Binary minimum payload and every scalar/list access are checked against entry bytes. No extraction, installation, network client or production imports.

After inspection: **746 tests passed (704 existing + 42 new), zero failures/skips/cancellations; typecheck passed for both experiment and offline inspector; lint passed with zero warnings; both isolated builds passed.** No production tests/build because production is unchanged.

## Network and accounting

Inspection made **zero provider calls, result GETs, asset GETs, DNS calls, reservations, generations or chest calls**. No credentials were read. Only the owner-requested GitHub evidence push uses network; there is no provider/asset network action.

Accounting remains **$4.15 / $4.75 reserved; $2.528 known reported billing; fal charge UNKNOWN; fal reservation $0.35 retained once; chest $0.60 unreleased**. No unknown-as-zero assumption, reservation reuse, refund or new charge observation. Previous totals remain 47 API requests excluding asset downloads, 9 completed downloads and 3 generations.

Production/main/dependencies/global allowlists and original checkout's uncommitted documentation remain unchanged. Physical iPhone/Safari and optional historical Phase 1 conflict-rebase remain unverified; finite synthetic checks are not universal guarantees. No hosted or real campaign/private-data acceptance.

**STOP. Chest remains unattempted and requires new owner authorization.** Full sanitized measurements and preservation hashes: [JSON evidence](fal-ply-inspection-001.json).
