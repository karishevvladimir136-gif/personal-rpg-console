# Research monographs — phase-one evidence atlas

**Working editorial index · updated 14 November 2026**  
**Research programme:** Исследование  
**Branch:** `claude/llms-at-the-table-monograph` (independent manuscript branch; no change to `main`)

## The two companion monographs

### 1. LLMs in Dialogue: What Language Models Do When They Are Left to Talk
**Manuscript:** [LLMs_IN_DIALOGUE_WORKING_MONOGRAPH.md](LLMs_IN_DIALOGUE_WORKING_MONOGRAPH.md)  
**Expanded corpus edition:** 13 November 2026; eight parts, 48 transcript-led chambers, methodological discussion and six appendices.  
**Audited public corpus:** 245 rooms, 5,455 stored subject messages and 88 separate after-answers across SELF_TALK_1, X1 and X3. Twenty private journal-conditioned rooms remain a separate arm, giving 265 in the full programme. Twenty duplicate checkpoint prefixes are counted once.  
**Core material:** games, mathematical tests, philosophical disagreement, code review, worldbuilding, fiction, poetry, invented languages, refusals, and distinct forms of ending. Vessan and syntax-shells are two substantial chambers within this wider corpus; Fail-Closed, the question library, the Grok night-sky discussion and many other rooms have their own close readings.  
**Source audit:** 200 source selections (199 exact text excerpts and one empty-response record), all checked against frozen run files with verified Git blob hashes. See [the evidence register](dialogue_evidence/README.md), [full room inventory](dialogue_evidence/room_inventory.csv), and [quotation audit](dialogue_evidence/quote_audit.json).  
**Principal contribution:** visible organization of self-selected shared activities, including proposal uptake, locally created rules, correction, genre changes and endings.  
**Interpretive scope:** the selection is a qualitative atlas, not a random sample or an estimate of thematic frequencies. Parser ends remain distinct from voluntary departures; proposed code and experiments remain distinct from execution.

### 2. LLMs at the Table: What Language Models Do When a Simulated World Can Answer Back
**Manuscript:** [LLMS_AT_THE_TABLE_WORKING_MONOGRAPH.md](LLMS_AT_THE_TABLE_WORKING_MONOGRAPH.md)  
**Expanded evidence edition:** 14 November 2026, with a related-work and internal editorial-audit revision; eight parts, 57 numbered chapters, five appendices, and 47 primary transcripts selected for close reading.  
**Complete archived primary files:** 82 — 61 solo RPG transcripts, nine full party-table transcripts, and twelve OpenWorld episodes. These are heterogeneous units, not a pooled sample of 82 comparable completed experiments. The six-round MULTI_HERO_1 dry run is documented separately through its report and implementation.  
**Core material:** the real RPG application's player adapter, hidden DM preparation, cards, state and resources; original and pure-world solo sessions; replication and frozen worlds; combat and negotiation; villain-role play; party formation, private screens and company-mode revisions; OpenWorld's starter and the completed long Ford journeys. The external formal engine remains a distinct apparatus and is credited to SihanXU/OpenWorld.  
**Source audit:** 347 exact selections from 47 primary transcripts. All 82 transcript files, eleven stage reports, and seven selected implementation files match their frozen Git blob hashes. See [the evidence register](table_evidence/README.md), [source manifest](table_evidence/evidence/source_manifest.json), [quotation audit](table_evidence/evidence/quote_audit.json), and [verification](table_evidence/evidence/verification.json).  
**Principal contribution:** an implemented and instrumented simulation apparatus and a broad account of choices, execution and consequences over time. The book opens with the harness and follows multiple trajectories rather than centring on a few celebrated scenes.  
**Interpretive scope:** attempted actions remain distinct from executed changes; the axe and tools are not credited as returned without evidence; the wand and oil remain different permission targets; parser exits, provider refusals and caps are separate endings. COMBAT_2 has three completed players; PARTY_2 has only two no-cost tables of twelve planned. The related-work chapter compares fourteen primary research works, including D&D Agents, DungeonBench, Concordia, RPGBench, FIREBALL and SOTOPIA. Reading scope and access limits are recorded in the [literature register](table_evidence/evidence/literature_register.json).  
**Internal editorial review:** [eighteen consequential claims](table_evidence/evidence/editorial_review.md), each with evidence and an open question for an independent reviewer. The PARTY_2 zero-leak verdict is explicitly scoped to its refined rule; T1’s visible out-of-game asides and a report/export round-number discrepancy are retained. This packet is not an independent review.
**Reading editions:** PDF, DOCX, EPUB and Markdown, plus a complete archive of this edition's selected primary files and assembly/verifier scripts.

## How to read the books together

They address different experimental units:

- **In Solitude (separate existing monograph):** what one model does with an available page, time and a real exit.
- **In Dialogue:** what two independently invoked models construct through reciprocal textual responses.
- **At the Table:** what model players do when their actions are interpreted by a game interface and change a persistent world that responds in turn.

Do not merge the denominators from these three designs. Distinguish: the written reply; a proposed act; a tool-confirmed act; a recorded state change; a retrospective explanation.

## Source discipline

Each manuscript contains a source register. For independent review, open the exact staged report and then its original transcript export or run-record file. Stage descriptions, frozen prompts and source code take precedence over later summaries when identifying what a model was actually shown. Maintain separate historical and post-hoc findings, and preserve negative results and admitted harness defects.

**Publication boundaries:** no private SECOND_ROOM correspondence, private personal diary, or unpublished individual correspondence may enter a public manuscript without permission. Contributions and external reviewers still require attribution and approval. The present documents are working monographs, not journal-accepted papers.

## Next editorial checklist

1. Dialogue's 199 quoted text excerpts and one empty-response selection, and Table's 347 source selections, are checked against frozen primary files. Continue independent interpretive review; these mechanical audits do not revalidate every underlying judge label or world-state update.
2. Table’s related-work review now covers fourteen primary works. Perform a final coverage check for the chosen venue and resolve the declared full-text access limits; Dialogue’s literature review still needs its own expansion.
3. Human-review ambiguous behavioral codes, especially initiative, moral role, privacy/leakage, and voluntary exit.
4. Add a reproducibility manifest of exact model IDs, frozen prompt hashes, code commits, dependency versions and released data subsets.
5. Secure publication and quotation permissions; add author contributions and conflicts-of-interest declarations.
6. Both monographs now have expanded PDF, DOCX, EPUB and Markdown reading editions with evidence archives. Maintain their separate corpus definitions and publication status.

**Editorial status:** Both are substantial corpus-led working editions with verified excerpt audits and frozen source inventories. Table includes the completed OpenWorld player episodes, fourteen-work positioning and an internal review packet. Neither is represented as peer-reviewed or final.

