# LLMs in Dialogue — corpus evidence register

Expanded working edition, 13 November 2026. 245 public rooms; 48 close readings. The separate 20-room private journal arm is not reproduced.

- `room_inventory.csv`: every public room, A/B order, one-based sample, stored messages, operational outcome and source commit.
- `quote_audit.json`: 200 selections, including 199 exact text spans and one empty-response record; source strings and SHA-256 hashes.
- `source_manifest.json`: original paths, frozen commits, Git blob hashes and byte sizes.
- `selection.json`: chamber order using exact normalized room keys.
- `verification.json`: reconstruction and audit results.

Twenty matching checkpoint prefixes were deduplicated, retaining the extended records. The visible corpus has 5,455 stored messages plus 88 separate after-answers. Outcomes are 193 parser ends, 49 caps, two provider refusals and one welfare stop. Parser ends are not automatically voluntary exits. Source fidelity is not certification of the truth of a quoted claim.

The companion reader archive provides the 245 complete public transcripts and normalized visible-text corpus. Frozen original run records remain accessible through the source manifest and manuscript Appendix B. No private correspondence or private journal conversations are included.
