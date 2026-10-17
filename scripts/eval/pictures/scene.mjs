// The picture bake-off fixture: a hero like the owner's (a former diver, about
// 35–40) and eight shots from the owner's first session, written the way the shot
// model writes them (who, action, where, angle, mood; names only in `who`). The
// records' part — what is worn now, bandages, the world clock — is separate, as
// the prompt compiler receives it. Synthetic: no owner data, no names in prompts.

export const STYLE = "Cinematic noir"; // the campaign's starting look (src/lib/campaign-settings.ts)

export const PEOPLE = {
  hero: {
    key: "Рэй", label: "the man", pronoun: "he",
    appearance: "a man of about 35–40, a former harbour diver: dark hair swept back from the forehead, short dark stubble, a weathered, wind-burned face with fine lines around the eyes, broad shoulders and thick forearms; a worn dark canvas work jacket with a plain round cloth patch on the left shoulder, a dark undershirt, dark work trousers, heavy boots",
  },
  marta: { key: "Марта", label: "the tavern keeper", pronoun: "she", appearance: "a broad-shouldered woman in her fifties, grey hair tied back, sleeves rolled up, a dark apron" },
  mokey: { key: "Мокей", label: "the old net-maker", pronoun: "he", appearance: "a lean, silent old man with a short grey beard, a knitted cap and rope-scarred hands" },
  docker: { key: "Фрол", label: "the docker", pronoun: "he", appearance: "a big red-nosed man with a thick neck, a flat cap and a stained canvas coat" },
  stranger: { key: "Незнакомец", label: "the stranger", pronoun: "he", appearance: "a lean man in a dry, well-cut dark coat and a hat" },
  dunya: { key: "Дуня", label: "the boatwoman", pronoun: "she", appearance: "a wiry young woman in an oilskin coat, her hair under a scarf" },
};

/** `people` are keys of PEOPLE in frame order (the hero first); `state` comes from the records. */
export const SHOTS = [
  {
    id: "t1", title: { ru: "Марта ставит кружку перед героем у стойки", en: "The tavern keeper sets a mug before him at the counter" },
    people: ["hero", "marta"],
    shot: { action: "At the counter of a dockside tavern, a tavern keeper sets a clay mug of beer down in front of the man", where: "a smoky dockside tavern, plank counter, oil lamps, barrels", angle: "medium shot across the counter", mood: "warm lamplight, quiet morning" },
    clock: { timeOfDay: "in the morning", weather: "grey drizzle outside the windows" },
  },
  {
    id: "t2", title: { ru: "На понтоне чинит ворот напильником", en: "He kneels on a pontoon, repairing a winch with a file" },
    people: ["hero"],
    shot: { action: "The man kneels on a wet wooden pontoon and files the teeth of a seized bronze gear on a hand winch", where: "a floating pontoon market on a grey harbour, boats moored alongside", angle: "low three-quarter angle", mood: "flat overcast daylight, damp" },
    clock: { timeOfDay: "in the daytime", weather: "overcast, no rain" },
  },
  {
    id: "t3", title: { ru: "Под понтоном в медном шлеме, мутная вода", en: "Under a pontoon in a copper diving helmet, murky water" },
    people: ["hero"],
    shot: { action: "The man, in a copper diving helmet and a canvas diving suit, gropes along a slimy beam under a floating pontoon, an air hose trailing up behind him", where: "murky green harbour water under a pontoon, silt and hanging weed", angle: "wide underwater shot", mood: "murky green gloom, dim shafts of light" },
    clock: { timeOfDay: "in the daytime" },
  },
  {
    id: "t4", title: { ru: "Молчаливый сетевяз промывает порез и мажет смолой", en: "A silent net-maker washes his cut forearm and smears resin on it" },
    people: ["hero", "mokey"],
    shot: { action: "A silent old net-maker washes a fresh cut on the man's forearm with water from a bucket and smears dark pine resin over it", where: "a net-maker's shed on the pontoons, nets hanging from the rafters", angle: "close medium shot", mood: "grey afternoon light through the open door" },
    clock: { timeOfDay: "in the daytime" },
  },
  {
    id: "t5", title: { ru: "Рвёт рубаху на полосы, мотает смоляные рукавицы", en: "He tears his shirt into strips and wraps resin gloves" },
    people: ["hero"],
    shot: { action: "The man tears a linen shirt into strips and winds them around his resin-smeared hands, making rough gloves", where: "inside a net-maker's shed, nets and tar pots", angle: "medium close-up on his hands and face", mood: "dim, tense" },
    clock: { timeOfDay: "in the daytime" },
  },
  {
    id: "t6", title: { ru: "Наверху красноносый докер читает записку карандашом", en: "Upstairs, a big red-nosed docker reads a pencil note" },
    people: ["hero", "docker"],
    shot: { action: "In a cramped room upstairs, a big red-nosed docker squints at a pencil note on a scrap of paper while the man stands waiting", where: "a low attic room above a tavern, a small window, a cot", angle: "medium shot", mood: "a single candle" },
    clock: { timeOfDay: "in the evening", weather: "rain on the small window" },
    state: { hero: ["he wears a borrowed grey linen shirt with its hem torn off, under his worn dark work jacket"] },
    check: { clothing: "Is the man (the one from the reference pictures) wearing a grey linen shirt under a dark jacket — not bare-chested and not some other top?" },
  },
  {
    id: "t7", title: { ru: "Незнакомец в сухом пальто у стойки — сквозь щели в полу", en: "A stranger in a dry coat at the counter, seen through floorboard gaps" },
    people: ["stranger", "marta"],
    shot: { action: "Seen from above through narrow gaps between floorboards: a stranger in a dry dark coat stands at the tavern counter below, talking quietly to the tavern keeper", where: "the tavern room below, seen through cracks in the upstairs floor", angle: "top-down view through floorboard gaps, dark boards in the foreground", mood: "lamplight below, secretive" },
    clock: { timeOfDay: "in the evening", weather: "rain outside" },
  },
  {
    id: "t8", title: { ru: "Сумерки: плоскодонка отходит от понтона, трое и ручная помпа", en: "Dusk: a narrow flat-bottomed boat pushes off a pontoon with three people and a hand pump" },
    people: ["hero", "mokey", "dunya"],
    shot: { action: "A narrow flat-bottomed boat pushes off from a pontoon with three people aboard: a boatwoman poling at the stern, the old net-maker in the middle, and the man in the bow beside a brass hand pump", where: "harbour pontoons, dark water, distant lanterns", angle: "wide shot", mood: "last light, mist on the water" },
    clock: { timeOfDay: "at dusk", weather: "still air, mist" },
    state: { hero: ["both his hands are wrapped in linen strips smeared with dark resin"] },
    check: { clothing: "Are the man's hands wrapped in cloth strips or rags (bandaged), not bare?" },
  },
];

/** The shots that compare the compiled prompt with today's generic one (two, to stay within the cap):
 * two people with the hero's references, one of them with a clothing state from the records. */
export const GENERIC_SHOTS = ["t1", "t6"];
