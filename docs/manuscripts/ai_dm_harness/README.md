# AI Dungeon Masters as Open-Ended Research Environments

Standalone English methodological article, 14 November 2026. Companion to *LLMs at the Table*, not a replacement for that monograph.

The article explains how natural-language action invention, a continuing RPG application, and independently invoked model players combine into an instrument for observing self-directed behaviour. It compares this configuration with eleven primary research works, explicitly recognizes Concordia as a close architectural precedent, and proposes a controlled evaluation that has not yet been run.

## Read and verify

- `article_source.md`: editorial source, with citation and exact-quote placeholders.
- `output/AI_DM_Harness_Research_Article_2026-11-14.md`: assembled article.
- `evidence/source_manifest.json`: 28 frozen files: six implementation files, ten reports, eleven primary transcripts, and the companion monograph revision.
- `evidence/quotes.json`: five exact quotation spans, character offsets, line numbers and SHA-256 hashes. Offsets are Unicode character offsets in UTF-8 decoded source text, not byte offsets.
- `evidence/literature.json`: eleven primary publications/project records, consulted scope, URLs and access limitations.
- `evidence/verification.json`: assembly and evidence verification results.
- `evidence/format_verification.json`: navigation, assets and reading-edition checks.
- `evidence/claims.json`: selected consequential claims, their status and source IDs; an editorial traceability aid, not an independent review.
- `sources/`: the exact referenced files. IDs retain their numbering from the larger Table corpus.
- `assets/action_loop.svg` and `.png`: a conceptual diagram, not an exact deployment map.

Source files are snapshots. Source paths, original revisions and hashes remain in the manifest. No model calls or experiments are required to verify or rebuild the article. The archive contains neither private correspondence nor private diaries.

## Rebuild

Run in this directory. Python 3, Matplotlib, python-docx, Pandoc and Noto Serif/Noto Sans fonts are needed for the full reading edition. PDF conversion additionally requires LibreOffice and a DOCX-to-PDF renderer. Evidence verification and Markdown assembly use only the Python standard library.

```bash
python build_article.py
python draw_architecture.py
pandoc output/AI_DM_Harness_Research_Article_2026-11-14.md -f markdown-smart+gfm_auto_identifiers-implicit_figures --resource-path=. -o output/AI_DM_Harness_Research_Article_2026-11-14.docx
python style_article.py
pandoc output/AI_DM_Harness_Research_Article_2026-11-14.md -f markdown-smart+gfm_auto_identifiers-implicit_figures --resource-path=. --css=article.css --toc --toc-depth=2 --metadata title="AI Dungeon Masters as Open-Ended Research Environments" --metadata author="Исследование" --metadata lang=en --split-level=2 -o output/AI_DM_Harness_Research_Article_2026-11-14.epub
```

Preserving the `-smart` reader setting matters: typography conversion must not alter exact quotations. Reading-edition pagination can vary with font and converter versions; evidence hashes and assembled Markdown must reproduce exactly. `verify_formats.py` verifies the available formats. The original editorial render was inspected page by page. Public manuscript material stays on the research branch under `docs/manuscripts/`; application code is not changed by this article.
