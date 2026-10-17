# Voice stage — living Russian, natural dialogue, humour (draft, not launched)

Planner's draft, 2026-10-16. Launch after the polish run, when the owner has handed over his passages. The polish run
builds the mechanics this stage fills (slots off, «Образцы голоса», speech profiles, metrics — see POLISH «Scope of
this run»).

## Inputs from the owner (never committed: the repo is public)

- 8–12 passages of prose he likes, 150–400 words each, mostly dialogue: bargaining or argument, a talk with subtext,
  plain everyday talk, action or danger, a quiet scene, a funny scene; film or series dialogue is welcome; 2–3 pieces
  from his own chat campaign («Полёт. Два дня»). Stored in «Образцы голоса» or handed to the session out of git.
- 3–5 anecdotes he finds funny: they calibrate the kind of humour (dry, absurd, dark, wordplay), not material to reuse.
- His voice pairs from the first play (POLISH item 7) and his DM codex (`docs/owner/DM_CODEX_RU.md`).

**Humour calibration (from the owner's five anecdotes, 2026-10-16; the jokes themselves stay out of git).** Black
humour, deadpan, one line. The shared mechanism: an innocent everyday phrase that the punchline re-reads literally and
darkly; or a character's absurdly wrong inference; the second voice drops a dry remark and nobody explains it. Death,
danger and stupidity are fair material. For the DM: dark humour about death, debt, drowning and risk is allowed and
belongs to this kind of world — say so explicitly, since aligned models drift away from it; the form is a short dry
line that turns someone's words or the situation over, with no narrator reaction or gloss after it; not invented
similes, not sound-based puns. A line of this kind from session 1: Дуня, when Фрол's hook tears off a scrap of Мокей's
net — «Улов. Бери, даром.»

## What research and practice say (planner's second pass, 2026-10-16)

Confirmed from the first pass (POLISH item 7): examples are the strongest lever (Anthropic: 3–5, relevant, diverse);
the prompt's own style leaks into the output; say what to do and why, not ban lists; «write fluently» instructions do
not help — in the translationese study a fluency request moved GPT-4 from 50% to 53% affected texts, while a second
polishing pass cut it from 43% to 25% ([Lost in Literalism](https://arxiv.org/html/2503.04369v1)).

New:

1. **A ready diagnostic for dialogue** (writing craft, Sloane; collected in
   [this dialogue skill](https://www.typingmind.com/skills/jwynia-dialogue)): every line does at least two jobs (plot,
   character, subtext, relationship). Failure states: identical voices; wooden (too complete and correct); exposition
   dump (telling each other what both know — our «ты это лучше меня знаешь»); on-the-nose (feelings and goals said
   aloud); **the tennis match** (perfect alternation, no interruption or power imbalance — our «answers every point in
   order»); **the philosopher** (characters state themes — our aphorisms); the court reporter (filler with no drama —
   a warning against fixing stiffness with «эм» and «ну»). Use it as the A/B rubric and as the backbone of the voice
   text, written positively.
2. **Persona drift.** Dialog models drift from their persona within about eight exchanges; attention to the system
   prompt drops between turns; repeating the persona before each user turn is the simple baseline fix
   ([Li et al.](https://arxiv.org/html/2402.10962v1)). → The speech profiles of the people present go into the last
   layer next to the player's input, with the voice reminder — not only into the middle of the dossier.
3. **Verbal habits.** One catchphrase wears out; what works is a set: a speech ending or gesture, a rotating bank of
   3–4 images from the character's own trade, and a list of words and topics the character never uses; repetition
   grows from thin character material ([roleplay guide](https://weavai.app/blog/en/2026/08/30/ai-roleplay-guide-show-dont-tell-catchphrases/)).
   Session 1's «сплёвывает за борт» ×10 is exactly this.
4. **An LLM game's design review** ([Hidden Door, Ian Bicking](https://ianbicking.org/blog/2025/08/hidden-door-design-review-llm-driven-game)):
   «the LLM has no sense of pacing» (a toll payment dragged on for paragraphs); running gags grow until they crowd out
   the plot; characters act on knowledge they cannot have; fine-tuning did not fix generic prose — a strong model and
   prompting did more. Technique: before writing, answer briefly to yourself where we are, who is present, what each
   wants, where the tension is.
5. **Humour.** Models memorise joke shapes rather than understand them — on unfamiliar puns they fall to ~20%, below
   chance ([Pun Unintended, EMNLP 2025](https://www.cardiff.ac.uk/news/view/2981509-why-the-long-interface-ai-systems-dont-get-the-joke,-research-reveals));
   ChatGPT repeated the same 25 jokes in 90% of answers ([2023](https://the-decoder.com/here-are-the-25-jokes-that-chatgpt-tells-over-and-over-again/));
   comedians found LLM material «the most bland, boring thing», blamed on alignment to everybody — «if it fits
   everybody, it is nobody's favourite» ([DeepMind study](https://decrypt.co/236599/ai-comedy-humor-study-censorship)).
   LLM humour is novel and relevant but lacks **empathy** — relatable human experience — which correlates most with
   funniness for people (ρ = 0.74); LLM judges barely agree with people on humour (ρ ≈ 0.2), overrate unfunny answers and
   prefer LLM output ([Oogiri study](https://alphaxiv.org/overview/2511.09133v1)). Distinct comic stances produce
   better humour than one voice ([HumorGen](https://www.alphaxiv.org/abs/2604.09629)). → Humour grows from the
   character and a recognisable small human truth, never from invented wordplay; each recurring character gets a comic
   stance of their own (Марта grumbles and counts, Дуня is dry, Мирон mishears); the owner's anecdotes calibrate the
   kind; **only the owner judges humour**, blind — an automatic judge is used for language only.
6. **Russian specifics.** Lists of Russian «AI tells» exist ([humanizer-ru](https://vc.ru/id490208/2850921-humanizer-ru-v2-patterny-i-bany)):
   канцелярит, calques («стоит отметить», «важно понимать»), «не просто X, а Y», false ranges «от… до…», signposting
   «давайте разберёмся», dashes in over 30% of sentences; its principle: the model picks the most probable word, and
   liveliness is a less probable but precise choice. The Russian editors' canon on the same problem: Нора Галь,
   «Слово живое и мёртвое» (calques from English: convey the meaning, not the structure; verbs over nouns), and
   Чуковский, «Живой как жизнь» (who coined «канцелярит»). → Write the voice part in their spirit; give the language
   judge their criteria; the humanizer list goes into metrics, not into the prompt.
7. **Measurable slop** ([EQ-Bench longform](https://eqbench.com/creative_writing_longform.html)): an over-used phrase
   score, a penalty for many very short paragraphs (≤ 5 words — the owner's «Фланец. Три месяца. Фланец.»), and a heavy
   weight on forced metaphor, which judges miss — the owner's «объяснение как пальто». Over-representation is measured
   against a human baseline ([Antislop, ICLR 2026](https://arxiv.org/abs/2510.15061)); its sampler and fine-tuning cut
   slop by ~90% but need control of the model's sampling, which we do not have.
8. **Keep the toughness.** Players found aligned models too nice (AI Dungeon trained
   [Wayfarer](https://huggingface.co/LatitudeGames/Wayfarer-12B) against positivity bias); agreeable personas are
   measurably more sycophantic ([ACL 2026](https://preview.aclanthology.org/ingest-acl/2026.acl-long.1421/)). Our DM is
   already tough; the voice work must not soften people — NPCs keep their own wants and the right to refuse.

9. **Many examples in context, not fine-tuning.** Opus cannot be fine-tuned (the only public Claude fine-tuning found
   is the old Claude 3 Haiku on [Amazon Bedrock](https://claude.com/blog/fine-tune-claude-3-haiku)). But examples in
   the prompt scale: with hundreds to thousands of shots, quality kept rising on many tasks and came close to
   fine-tuning on translation ([Many-Shot In-Context Learning, NeurIPS 2024](https://arxiv.org/html/2404.11018v2));
   gains are not always monotonic (some tasks peaked at ~50 shots), and the order of examples matters. With caching a
   large bank of passages is cheap. Risk: copying phrases from the examples — measure verbatim n-gram overlap.

Not taken: fillers and disfluencies from voice-assistant guides (prose turns them into the court reporter); sampler-
level bans (no access); a fine-tuned smaller model as the DM (loses Opus's reasoning, memory and tool use). Kept in
reserve: Opus decides and writes, a second pass rewrites dialogue only — test only if the voice layer is not enough,
it costs latency and can change facts.

## Why narration is rich and dialogue is weak (owner's observation, planner's reading)

Narration is one voice, the narrator's, in the written register the model has read most of; sensory description
translates across languages almost unchanged. Dialogue is the opposite on every count: (1) speaking **is answering**,
and answering is exactly what assistant training shaped — complete sentences, every point covered, polite, explained,
summed up — so the assistant habit fires in NPC lines and not in narration; (2) many voices instead of one, so the
model falls back to its own composed, aphoristic voice for everyone; (3) the DM uses NPC lines to deliver game
information (prices, options, risks), which turns speech into exposition; (4) spoken Russian lives on what does not
translate — particles (же, ведь, -то, ну, вот, уж, небось, разве), word order by emphasis, ellipsis, idioms — so
calques surface there first. Hypothesis to measure: particle rate and the share of incomplete sentences in NPC lines
vs the owner's passages. Consequences: the bank is dialogue-heavy; game information moves into narration and cards
where it can; speech profiles per person; a dialogue-only second pass stays in reserve (narration does not need it).

## The experiment: Russian first, English as the control (owner, 2026-10-16)

The owner reads and talks in English daily (lives in San Francisco); Russian is his native language. Rule: build the
Russian voice with the best methods; if it reaches «ideal» in the blind test and in a real session — keep Russian;
if not — switch the campaign to English, which is not a failure.

- **Two arms, same method:** a native voice layer, speech profiles, a passage bank (many-shot) and the owner's
  before/after pairs — once in Russian, once in English (an English voice layer written natively, not translated).
- **Same scenes** (turns 1, 16, 20–21, 23, 24, 34, 37–38, 41), Opus high. Russian variants are blind-compared with the
  current prompt; the English arm cannot be blind against Russian, so every scene in both languages also gets an
  absolute owner rating (1–5, «люди говорят как люди») and the owner says which language he would rather play in.
- **«Ideal» for Russian:** the new voice wins most scenes against the current prompt, dialogue is rated 4–5 in at least
  6 of 8 scenes, and the next real session keeps it.
- **Measured per language:** tokens per turn (narration and context), streaming time after the first word, cost per
  turn, slop and calque metrics. First step, free: count tokens with Anthropic's token-counting endpoint on ten
  narration paragraphs from session 1 and their English translations. Context: on Claude's current tokenizer an
  independent count found German 2.1×, Hindi 2.4×, French ~1.26× the English tokens
  ([2026-07](https://dev.to/synthorai/which-llm-is-cheapest-for-your-language-tokenizer-costs-measured-1k5m)); a news
  report claims ~3× for Russian on Opus 5 ([2026-10](https://www1.ru/en/news/2026/10/05/440386-ssa-berut-s-rossiian-bolse-za-russkii-iazyk-claude-tratit-pocti-v-4-raza-bolse-tokenov.html)),
  unverified. The first-word wait is thinking and does not depend on the language; streaming and output cost do.
- **Two diagnostic variants** (owner, 2026-10-16, after comparing with AI Realm, whose English sounds rich with simple
  prompts): (a) **Fable 5.1 as the DM** on the same scenes with the same voice layer — on the human-vote creative
  writing board Claude Fable 5 is #1 and Claude Opus 5 is #1 on EQ-Bench Creative Writing v3, Qwen3.8-max is 16th
  ([2026-08](https://www.digitalapplied.com/blog/which-ai-model-writes-best-leaderboards-disagree)); (b) **prose
  without the machinery**: the same scene with no tools in the prompt and no bookkeeping, narration only — to measure
  how much the tool-heavy procedure itself costs the prose (the first English blind run also sounded «strange»). If (b)
  is clearly better, consider writing the scene in one pass and doing the bookkeeping in a second pass from the text.
- **Banks:** Russian 30–40 passages, English 20–30, by kind: about 40% dialogue (bargaining, subtext, everyday talk),
  action, quiet scenes, humour, a few montage/transition pieces; 150–400 words each; 3–6 authors per language; plus the
  owner's before/after pairs. Variants per arm: rules only · 5 passages · the whole bank — to see where the curve stops.

## Plan

1. The voice part of layer 1 for Russian campaigns, written natively as good Russian prose (not translated, not a
   list), from the owner's codex, in the spirit of Галь and Чуковский: verbs, plain words, meaning over structure;
   dialogue by the diagnostic above, phrased as what to do and why.
2. 3–5 examples from the owner's passages, diverse by kind, in `<example>` tags; never composed by the planner or the
   session.
3. The last layer: a voice reminder (≤ 120 tokens), the speech profiles of the people present, the last two or three
   turns verbatim.
4. Speech profiles: register, sentence length, a habit set (ending or gesture, 3–4 trade images, never-says list),
   ты/вы per person, comic stance, tic frequency.
5. A second polishing pass only where latency does not matter: digest, «Ранее в…», chronicle.
6. Blind A/B on the owner's key scenes from session 1 (current prompt · the voice layer · the voice layer with 3–5 of
   his passages · the voice layer with all of them, many-shot), dialogue and humour judged separately; run locally on
   the owner's laptop, where session 1 and the keys are and the passages never leave his machine; scenes: turns 1, 16,
   20–21, 23, 24, 34, 37–38, 41; metrics: Latin letters, канцелярит and calque markers, humanizer patterns,
   share of ≤ 5-word paragraphs, metaphor density, repeated phrases per character, share of «tennis» replies. The
   owner picks; the planner builds the page. Record in `docs/runs/`.
