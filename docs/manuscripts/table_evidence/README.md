# LLMs at the Table — evidence edition

Expanded working monograph, 14 November 2026.

Publication-preparation revision: fourteen-work related literature review and an internal editorial packet covering eighteen consequential claims. Independent review remains open.

57 numbered chapters; 47 primary transcript files selected for close reading; 82 primary transcript files retained in full. The count is an archive inventory, not a pooled number of comparable completed experiments.

## Contents

- `traces/`: 61 solo RPG transcripts, 9 full party-table transcripts, and 12 formal-engine episodes. Party tables contain multiple players. Some runs end at a cap or interface failure.
- `sources/`: 11 complete frozen stage reports.
- `code/`: 7 selected implementation files, not a standalone runnable harness.
- `evidence/source_manifest.json`: source paths, branches, frozen commits, exact Git blob hashes and SHA-256 hashes.
- `evidence/quote_audit.json`: all 347 displayed source selections, including exact text, source offsets, labels, hashes, and chapter.
- `evidence/selection_index.json`: turn/round selections by chapter.
- `evidence/verification.json`: output of the dependency-free verifier.
- `evidence/literature_register.json`: fourteen primary works, source URLs, reading scope and access limits.
- `evidence/editorial_review.md` and `.json`: internal claim review with exact source links and open questions for an independent reviewer.
- `evidence/publication_verification.json`: checks of those source locations and reference identities.
- `output/`: the assembled Markdown reading edition.
- `front.md`, `solo.md`, `party.md`, `engine.md`, `back.md`: editorial source with extraction directives.
- `build_book.py`: deterministic assembly from the archived source files.
- `verify_evidence.py`: provenance and quotation checks; run with `python verify_evidence.py`.
- `verify_publication.py`: reference and review-packet checks; run with `python verify_publication.py`.
- `related_work.md`, `publication_support.py`: the related-work chapter and builder for its register and review packet.
- `style_docx.py`, `epub.css`: reading-edition typography. Building DOCX/EPUB additionally requires Pandoc and python-docx; PDF rendering requires LibreOffice or an equivalent Word renderer.

## Rebuild

From the extracted archive directory, run `python build_book.py`, then `python verify_evidence.py`. Both scripts use only Python's standard library. They rebuild the Markdown and evidence audit from the full transcript files. DOCX, PDF, and EPUB are supplied separately as reading editions.

The manifest records 100 frozen files in total. Every original file is checked using Git's actual blob-hash framing. Quote offsets count Unicode characters in the decoded UTF-8 source, not byte offsets. Markdown blockquote markers already present in PARTY_2 exports are retained in the audit and rendered once. Code fences surrounding an exported message are not part of the selected message span. No missing lines are reconstructed from memory.

## Scope of the archive

The archive preserves the 82 selected primary files in full, not every raw provider log, cut attempt, dry run, per-player duplicate export, or project dependency. The stage reports link to those wider materials at the frozen repository revisions. MULTI_HERO_1's six-round dry run is documented by its report and selected implementation evidence, not counted as another primary player episode here.

The underlying OpenWorld engine belongs to SihanXU/OpenWorld at revision 19629aa4d5b3e16debe9e113663381b1182d1388. This archive contains the research project's adapter excerpts and experimental records, not the complete upstream engine. The RPG application's complete codebase likewise remains at the recorded repository revisions.

## Reading boundaries

The displayed excerpts distinguish player messages, application screens, DM narration, relayed DM inputs, and engine observations. A harness-added departure instruction is not attributed to an autonomous player. A next-turn observation reports the preceding action. Attempted returns, completed transfers, provider stops, voluntary endings, and external caps remain separate.

The checks establish exact file identity and quotation fidelity. They do not validate every claim made by a fictional character, every DM state update, every stage judge label, or every interpretation in the monograph. No private correspondence or personal diary is included.

The internal editorial review explicitly preserves a PARTY_2 disagreement: the rope aside on Bram's screen appears under exported Round 10, while the report calls it round 11. The report's refined zero-leak result is not presented as complete information isolation. T1's visible out-of-game asides and T2's later stripping change are documented together. Historical source files are not edited to reconcile them.
