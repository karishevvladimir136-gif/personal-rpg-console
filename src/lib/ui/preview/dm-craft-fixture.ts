import type { CraftOwnerView, CraftRole, CraftVersion } from "../../dm-craft/contracts.ts";

// Fix run after session 2 (item 7): a synthetic «Мастерство Ведущего» for the preview — the main doctrine with an
// earlier version, and cards of every length and role, some with English categories. Nothing here is campaign text.
const id = (n: number) => `c4af7000-0000-4000-8000-${String(n).padStart(12, "0")}`;
type Card = [key: string, kind: "doctrine" | "card", category: string, role: CraftRole, ru: [string, string, string], en: [string, string, string]];

const cards: Card[] = [
  ["core-doctrine", "doctrine", "core", "both",
    ["Как вести игру", "Игрок владеет намерением; установленный мир владеет результатом. Веди суверенный мир: у людей, мест и фракций свои цели и право отказать. Чти установленное, пусть решения оставляют след, а после каждого пика наступает тишина. Вызов честен: провал — обычный источник истории, удача не бывает бесплатной.", "Не дари исход одним текстом, не переписывай прошлое молча и не давай герою побед без цены."],
    ["How to run the game", "The player owns intent; the established world owns outcome. Run a sovereign world: people, places and factions have their own goals and the right to refuse. Honour what was established, let choices leave fingerprints and a quiet after every peak. Challenge is honest: failure is a normal source of story, luck is never free.", "Never grant outcomes through prose, retcon silently or let the hero win without cost."]],
  ["world-resistance", "card", "challenge", "writer",
    ["Мир, который сопротивляется", "Намерение не диктует исход. Планы встречают сопротивление по ставкам: стражу, цены, расстояния, погоду, чужие планы. Человек может отказать, торговаться или уйти.", "Никаких бесплатных побед и спасения совпадением."],
    ["A world that pushes back", "Intent never dictates outcome. Plans meet resistance in proportion to the stakes: guards, prices, distances, weather, other people's plans.", "No free victories, no rescue by coincidence."]],
  ["return-with-delta", "card", "continuity", "writer",
    ["Возвращение с переменой", "Знакомое место может измениться из-за уже известных событий.", "Не раскрывай постороннюю тайну ради новизны."],
    ["Return with change", "A familiar place may show a small difference grounded in known events.", "Do not reveal an unrelated hidden mystery for novelty."]],
  ["afterglow-rhythm", "card", "rhythm", "writer",
    ["Тишина после пика", "После напряжённой сцены дай передышку: еду, шутку спутника, тёплый свет. Отдых — тоже сцена, в нём растут отношения. Не спеши к следующей угрозе.", "Не подгоняй героя новой опасностью сразу после победы."],
    ["The quiet after a peak", "After a tense scene give a breath: food, a companion's joke, warm light. Rest is a scene too; relationships grow in it.", "Do not rush the hero into a new danger right after a win."]],
  ["heros-moment", "card", "agency", "both",
    ["Твой момент", "Когда бросок героя решает кульминацию, отдай описание игроку: результат принят, слова игрока становятся каноном.", "Не описывай за игрока его лучший момент."],
    ["Your moment", "When the hero's roll decides a climax, hand the description to the player: the result stands, the player's words become canon.", "Do not narrate the player's best moment for them."]],
  ["living-characters", "card", "characters", "writer",
    ["Живые люди", "У каждого заметного человека есть желание, страх и привычка речи. Они помнят, как с ними обошлись, и могут заботиться, не подчиняясь.", "Не делай людей функциями сюжета."],
    ["Living people", "Every notable person has a want, a fear and a habit of speech. They remember how they were treated and can care without obeying.", "Do not turn people into plot functions."]],
  ["living-world", "card", "world", "both",
    ["Мир живёт без героя", "Пока герой занят своим, часы мира идут: гильдии торгуются, слухи растут, погода меняется. Перемены видны через людей и места.", "Не замораживай мир в ожидании героя."],
    ["The world lives on", "While the hero is busy, the world's clocks run: guilds bargain, rumours grow, weather turns. Changes show through people and places.", "Do not freeze the world while it waits for the hero."]],
  ["cognitive-world", "card", "cognitive", "writer",
    ["Люди думают сами", "Каждый человек решает по тому, что знает и во что верит; он может ошибаться и менять мнение по уликам.", "Не давай людям знать то, чего они не видели."],
    ["People think for themselves", "Each person decides from what they know and believe; they can be wrong and change their mind on evidence.", "Do not let people know what they have not seen."]],
  ["heros-knowledge", "card", "knowledge", "both",
    ["Что знает герой", "Рассказывай то, что герой видит, слышит и понимает. Скрытое остаётся скрытым, пока его не откроют в мире.", "Не пересказывай тайный слой ведущего."],
    ["What the hero knows", "Narrate what the hero sees, hears and understands. The hidden stays hidden until the world reveals it.", "Do not retell the DM's hidden layer."]],
  ["open-questions-and-tics", "card", "voice", "writer",
    ["Голос без привычек", "Меняй ритм фраз и начало абзацев; заканчивай сцену действием, а не вопросом к игроку.", "Не повторяй одну и ту же реплику-шутку из хода в ход."],
    ["A voice without tics", "Vary sentence rhythm and paragraph openings; end a scene on action, not a question to the player.", "Do not repeat the same quip from turn to turn."]],
  ["records-match-the-fiction", "card", "bookkeeping", "bookkeeper",
    ["Записи совпадают с историей", "Каждая монета, вещь и рана из текста попадает в записи тем же ходом, и ничего лишнего: записи — правда игры.", "Не записывай то, чего не было в рассказе."],
    ["The records match the story", "Every coin, thing and wound in the text reaches the records in the same turn, and nothing else: the records are the game's truth.", "Do not record what the story did not tell."]],
  ["villains-and-theme", "card", "antagonists", "writer",
    ["Противники и тема", "У противника есть причина, которую можно понять, и план, который движется без героя. Тема кампании звучит в его выборе.", "Не делай злодея злым ради зла."],
    ["Villains and theme", "An antagonist has a reason one can understand and a plan that moves without the hero. The campaign's theme sounds in their choices.", "Do not make a villain evil for its own sake."]],
  ["promises-and-debts", "card", "relationships", "both",
    ["Обещания и долги", "Обещание, данное героем, живёт в мире: его помнят, ждут и напоминают о нём.", "Не забывай обещаний, которые мир слышал."],
    ["Promises and debts", "A promise the hero gave lives in the world: it is remembered, awaited and recalled.", "Do not forget promises the world heard."]],
];

const at = (day: number) => new Date(Date.UTC(2026, 9, day, 12)).toISOString();
const version = (n: number, [key, kind, category, role, ru, en]: Card, number: number, day: number): CraftVersion => ({
  id: id(n), key, version: number, kind, category, role, stages: kind === "doctrine" ? ["plan", "narrate"] : ["narrate"], triggers: [],
  ru: { title: ru[0], guidance: ru[1], avoid: ru[2] }, en: { title: en[0], guidance: en[1], avoid: en[2] },
  provenance: "Synthetic preview", createdAt: at(day),
});

const current = cards.map((card, index) => version(100 + index, card, card[0] === "core-doctrine" ? 3 : card[0] === "afterglow-rhythm" ? 2 : 1, 18));
const earlier: CraftVersion[] = [
  { ...version(200, cards[0], 2, 12), ru: { ...current[0].ru, guidance: "Игрок владеет намерением; мир владеет результатом. Последствия остаются, а удача не бывает бесплатной." },
    en: { ...current[0].en, guidance: "The player owns intent; the world owns outcome. Consequences stay, and luck is never free." } },
  { ...version(201, cards[0], 1, 8), ru: { ...current[0].ru, guidance: "Сохраняй свободу выбора, последствия и границы знаний персонажей." },
    en: { ...current[0].en, guidance: "Keep player choices open, preserve consequences and the bounds of what characters know." } },
  { ...version(202, cards[3], 1, 10), ru: { ...current[3].ru, guidance: "После боя — короткая передышка." }, en: { ...current[3].en, guidance: "After a fight, a short breath." } },
];

export const previewCraftView: CraftOwnerView = {
  policyVersion: "mega-dm-v1-public-context-2",
  versions: [...current, ...earlier],
  effective: current.map((row, index) => ({ key: row.key, activeVersionId: row.id, activationRevision: index + 1 })),
};
