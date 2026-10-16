# Polish — after the owner's first sandbox play

Cloud session (`docs/CLOUD.md`, environment `rpg-console`), branch `claude/polish` from `origin/claude/integration`.
The owner's notes from the first play are added below by the planner before launch.

## Known before the play

1. **A roll that is never narrated.** After an interactive dice roll the turn pauses; the game master's continuation
   after the roll sometimes holds only tool calls and no text, so the player sees the roll but not what happened.
   Seen on Opus in both blind runs (English and Russian). The continuation after a roll must always narrate the
   outcome; if the model returns no text, ask it once more for the narration only, and never close the turn silently.
2. **Stage V review fixes** — `docs/stages/STAGE_V.md` §7: one stage instead of two stacked pictures, a real frame in
   the review screens, a portrait anchor queued for a named person seen in a frame without one, gender and looks from
   the public text until then, visible traits kept in anchors, action text with the same person labels, no mid-word
   cuts.
3. **Latin shorthand in a Russian campaign.** «HP» and «NPC» appear in four game-master notes of the Russian blind
   run, one of them in a counter receipt («без потери HP»). Anything the player can see follows the campaign
   language; notes use the campaign's own words for these.
4. **Astra breaks the fiction about equipment.** In the Russian combat scene Astra said «по установленному снаряжению у
   Роуэна есть компас, но оружия не указано» inside the narration. Questions about the sheet belong in a short
   out-of-fiction aside or a clarifying question, never in the story voice.
5. **Astra sometimes ends a turn without `finish_turn`** (Stage 4 known limit): tension and refusal hints are lost on
   those turns.

6. **The off-screen consequence never arrived.** In the Russian blind run's travel scene (cheat at dice, then two days
   east) the owner saw no consequence in any of the four variants. Find out per variant where the chain broke: was a
   plan recorded with a due time in the cheat turn, did the travel receipt list it as due, did the game master act on
   it. Fix the break (the loop, the receipt hint or the doctrine) and prove it live on both models.
7. **Russian voice.** The owner finds the app's Russian stiff and calqued, while the same Opus in his chat campaign
   writes living Russian. Likely causes, to confirm with an A/B: the role and the procedure in layer 1 are English and
   mostly about tools; the only Russian prose in the prompt are the three turn-shape examples, written in translated
   style («проскальзывает внутрь, в запах муки»); narration is cut into pieces by mid-text tool calls; the prompt says
   almost nothing about voice; the synthetic Russian fixture was machine-translated. Do: for a Russian campaign, write
   the role's voice part natively in Russian (not translated), from the owner's codex `docs/owner/DM_CODEX_RU.md`
   (the planner adds it); replace the turn-shape examples with natural Russian ones; keep the narration in one breath
   (only a deciding roll or payment may interrupt it; bookkeeping goes after); keep tool schemas in English. Check with
   the Russian blind scenes: current prompt vs the Russian voice layer, both on Opus high, four key turns each, and the
   planner builds a blind A/B page. Record the result in `docs/runs/` (it is a research finding).

   What the literature and practice say, and how it shapes the work (planner's research, 2026-10-15):
   - Prompting in the target language gives more natural output on language- and culture-sensitive generation for
     capable models (Is Translation All You Need?, NAACL 2025); LLM output in other languages carries an English
     syntactic "accent" (Do LLMs Have an English Accent?, arXiv 2410.15956). → the voice part in native Russian.
   - The prompt's own style leaks into the output; make the prompt look like the desired output (Anthropic prompting
     best practices). → the voice section is itself written as good Russian prose, not a list.
   - Examples are the most reliable lever: 3–5, relevant and diverse, in `<example>` tags (Anthropic). → 3–5 short
     passages of different kinds (dialogue, action with a roll, quiet scene, montage of days, humour), from the owner's
     own campaign and texts he provides; diverse so the model does not copy one pattern.
   - Ban lists and «пиши естественно» barely work and can backfire (Antislop, ICLR 2026; a translationese study found
     explicit naturalness instructions made GPT-4 worse). → describe the voice positively, with the reason behind each
     rule; no long ban lists in the prompt.
   - Recent context dominates the register (the roleplay community's "author's note" practice). → a short Russian
     voice reminder (≤ 120 tokens) in the last, uncached layer next to the player's input, and the last two or three
     turns of the campaign verbatim there, not only as a summary.
   - A second polishing pass reduces translationese (43% → 25% for GPT-4 in that study), but it costs latency. → not for
     live turns; allowed for the session digest, «Ранее в…» and the chronicle.
   - Slop and calques are measurable. → add Russian naturalness metrics to the bench: Latin letters in visible text,
     канцелярит markers («является», «представляет собой», «осуществляет», «данный», chains of participles), sentence
     length variance, and over-represented phrases against a Russian human reference; report them in the A/B.

## The owner's notes from the first play

- **The seeded Stage 4 DM Craft versions cannot be activated.** In the sandbox the six never-approved versions (How to
  run the game v3, Life off screen, The long campaign, A systemic world, Villains with motives…, A world that pushes
  back) sit in «Version history»; «Restore this version» does nothing for them, and the screen offers no other way to
  approve a pending version. Root cause found by the owner's local session: the UI sent `action` inside the data
  written to the database, and the RPC answered 422. Fix and a test that reproduces the 422 are on
  `claude/fix-dm-craft-payload` (commit ae78e9b, from `claude/integration`): merge it first, run its test. Then give
  pending versions a clear «Review and approve» action (with what changes) and show an error when an action fails.
- **New campaign wizard (hero step):** every single item asks for a quantity before creation («Укажите значение перед
  созданием») — default a singular item to 1; «долг в сорок монет трактирщице Марте» became an inventory resource
  instead of a debt in the journal (Stage 4 has the `debt` kind) with Marta as a person; the Astra-only notice («Для
  новой кампании с ведущим Astra… Структурированный RPG») shows although the chosen DM is Opus; and «Создать персонажа
  и кампанию» does nothing with a narrative sheet and no message — apparently the hero step (step 2) applies the Astra
  rule because the DM is only chosen at step 3 and the app default is Astra. Choose the DM before the sheet is
  validated (or validate against the DM chosen in the wizard), and a disabled create button always says why.
- **From the wizard into the first turn the flow breaks.** The wizard's step 4 («Я опишу, где начинаю» with a
  phrase) leads to a game screen that says «Перед первым ходом закончи вступление приключения и настройку ведущего»
  and then to the Adventures screen, which asks again «Во что вы хотите сыграть?» with an empty form: the phrase is not
  carried over, so the owner enters the start twice and does not understand where he is. Carry the wizard's start into
  the adventure draft (or let the wizard's choice create the first adventure) and land on the first turn. Also: the
  campaign name fell back to the hero's name («Кампания · рэй») although the wizard has a name field; a stray «Новая
  Кампания» floats in the Adventures header; the sidebar mixes languages («Skill 0 · Атака 0 · Defense 10»); the clock
  starts at «День 1 · 00:00» whatever the opening scene says. On the Adventures screen the prepared adventure shows
  three overlapping paths at once — an «Начало приключения» box with «Подготовить предложение с ИИ», a dimmed
  «Подготовить Приключение», and «Начать / Изменить / Оставить Приключение» — with no clear next step. Owner: «флоу
  немного странный». Target: one path from the wizard to the first turn — wizard → one review screen (adventure +
  opening proposal together, edit inline) → «Начать» → the game screen with the opening scene; every button that is
  not the next step is hidden or secondary.
- **The opening scene proposal.** Check which model writes it: the Adventures screen says it calls «настроенный ИИ»,
  which in the sandbox is the app default (Astra), not the campaign's DM (Opus high). The opening must be written by
  the campaign's DM in the campaign's voice. The first proposal was thin: it reused the world text verbatim («пахнет
  смолой и жареной рыбой»), used semicolons the English way, and ended on a report line («предложение остаётся без
  ответа») instead of a situation; Marta got one good line («за напоминания я пока не беру») but no look or gesture of
  her own. Use the Russian voice layer (item 7) for the opening too. Approving it needs a checkbox and a button — one
  confirmation is enough. The hero's name is shown as typed («рэй»): offer the capitalised form in the wizard.
- **Pictures: two paths, one of them off (serious).** Stage V pictures work (the hero's figure and the item icons
  were drawn on fal), but every older picture button still goes through the legacy path and says «Создание
  изображений локально не включено»: Map → place illustration and «Создать карту» (atlas), Party → a person's
  «Перерисовать портрет» / «Создать портрет». One picture path for every button (the Stage V store on fal, in the
  campaign's style, priced, within the daily cap); no button that cannot work. A named person met in play (Marta)
  should get a portrait without a click (see §7 of STAGE_V).
- **Item descriptions.** The DM writes them with some invention, scaled by rarity: an ordinary thing gets one good
  line; a rare, unique or legendary thing gets a short story (where it came from, who held it, what it is known for).
  Today the harpoon pistol card says only «на один выстрел».
- **Character and inventory collapse on a non-5e ruleset (major).** The Stage 5 screens were tuned on the 5e sample
  («Мир Шва»: slots around the figure, «185 Золото», filters Надето / Доспехи / Расходники…, skills with bonuses,
  party portraits). On the sandbox campaign («World Logic» ruleset, narrative hero) almost all of it is gone:
  - **no money anywhere** — the hero owes Marta forty coins and nobody can see what he has. A wallet always exists
    (0 by default, the world's currency name), the wizard asks or derives the starting money, the DM records changes;
  - **no paper doll** — «У этого персонажа нет мест для снаряжения». Universal default slots for every ruleset
    (голова, шея, тело, рука, вторая рука, пояс, ноги, обувь, спина), and starting items equipped where they belong
    (пистолет — в руке, нож — на поясе, шлем — в руках или на поясе, по описанию);
  - **the backstory is not shown** — what the owner wrote in «Кто вы?» appears nowhere on the character page except a
    one-line subtitle; add a «Предыстория» block (the original design had a Background tab);
  - only «Всё / Вещи» as filters, no «Надето»; skills without any measure; the figure small in an empty panel — in the
    design the figure is the centrepiece, large, with the slots around it (`design/02_character_inventory.png`);
  - labels mix languages (SKILL / АТАКА / DEFENSE); the six ability scores are flat 10s from the stub profile.
  Rule for the fix: the character and inventory screens are complete for ANY ruleset — figure, slots, wallet, items
  with filters, backstory, traits, conditions — and show numbers only where the ruleset has them. Recapture both
  screens on the narrative sandbox campaign as well as on the 5e sample.
- **Journal does not show the obvious goal.** The opening is about a debt of forty coins to Marta and her job offer,
  yet the journal says «Цели пока нет», «Долгов и обещаний пока нет». The opening (or the first turn) records what the
  hero already knows: the debt as a `debt` to Marta, her job as an offered quest or thread, the goal «отдать долг».
- **Player screens show system text.** Owner: «вылезла админ панель». Explanations such as «"К тебе" — только то, что
  герой мог заметить сам. Тайные мысли спутников видит один ведущий…», «Ещё · прежний экран и правка записей», combat
  stats on a tavern keeper (Марта: ХИТЫ 8/8, SKILL 0, АТАКА 0) read like an admin panel. Keep player screens in the
  fiction: explanations behind a small «?», editing tools behind «Ещё», stats only for people the hero fights or leads.
- **Broken-image fallback letters.** An initial letter shows at the top-left of an empty picture box and overlaps
  badges («К» over the scene header, «М» under «РЯДОМ» on Marta's card). Use a proper empty state.
- **The structured combat profile in the wizard is a stub:** English labels in a Russian UI (HP, Attack modifier,
  Defense, Skill modifier), flat defaults (HP 10, 0, 10, 0) not derived from the hero's description, and «Без оружия»
  although the hero carries a knife and a harpoon pistol (weapons are not offered from his own items). Owner: fine for a
  test, not for the release. Derive a proposal from the hero (the DM drafts it, the owner approves), Russian labels,
  weapons picked from the starting items.
- The DM Craft screen is English in a Russian setup; the Russian wording of the cards is model-written. Rewrite the
  Russian texts of the doctrine and cards natively as part of item 7.

## Port from the owner's chat registry «Железная Бабка»

The owner's chat campaign had a hand-built registry page (a claude.ai artifact the planner made; it reads from its own
small database). The owner compares the app's screens with it. Bring into the app what it does better, on real
records, for any ruleset (numbers only where the ruleset has them):

- **Paper doll with 12 slots** in three groups: left — голова, шея, талисман, тело, плащ; right — основная рука, вторая
  рука, кольцо I, кольцо II, руки (перчатки); bottom row — пояс, ноги. Each slot: an icon of the item coloured by
  rarity, the slot label, the item name; an empty slot is dashed «пусто». Attuned items carry «✦» and a violet edge;
  a counter «Настройка N/3» when the ruleset has attunement. Without a picture the centre shows a blueprint figure
  (a line drawing with a scale mark), never an empty box.
- **Hit points** as a gauge that turns amber at half and red at a quarter; owner correction buttons −10 −5 −1 +1 +5 +10
  «Полные» (recorded as an owner correction, visible in the turn history).
- **Resources** as pips the owner can tap, each with its recovery rule under the name («возвращается после долгого
  отдыха», «короткий отдых: +2 очка»).
- **Vitals** tiles (КД, скорость, мастерство, КС/атака) and **stats** with score and modifier; saves and skills in two
  columns; **Особенности** with a one-line description each; **Досье** (backstory).
- **Inventory grid** with rarity colours and a legend (обычное / реликт Старого мира / магическое / сюжетное),
  quantity badges, categories (Всё, Расходники, Снаряжение, Реликты, Сюжет), money in the header, and a parchment
  sheet on tap with the description and quantity.
- **Dice tab:** a big result with natural 20 / natural 1 styling; normal / advantage / disadvantage; «Зачем бросок»
  (a reason line); quick rolls per character built from the sheet (checks, attacks, saves with their bonuses; damage
  and healing expressions); a free pool d4…d100 with a modifier; a roll log the DM sees («ДМ видит этот журнал»).
- **Party tab:** the current objective on top; a card per member (portrait, name, role, AC badge, HP gauge, attack
  line); the crew aboard and the people left at home as rosters with small portraits; switch the character sheet to any
  member with name chips.
- **Codex** grouped by relationship (семья, союзники, мутные, нейтральные, враги) with coloured tags; factions with
  their status; search.
- **Quests:** the main arc with steps (✓ / ○), side quests, open threads, debts and promises, done ones collapsed.
- **Ship / holdings page:** picture, description, specs, armament, the hold as an inventory grid, passengers and
  prisoners.
- **Header plate** with the place, the time of day in words and the next destination («Лиссабон · рассвет после ночи
  у Белой башни · дальше: Женева») instead of «День 1 · 00:00».

## Checks

typecheck, lint, the full suite with `--test-concurrency=2`, build, fake bench, screenshots with the overflow check, a
short live smoke on the changed paths within **$5**. Push `claude/polish` only, never `main`. Report in English.
