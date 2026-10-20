// The ambient layer (the owner's addition of 2026-10-20): the place's sound and the
// weather under the music, from the public place record, the scene's time of day
// and the committed turn's public text only. A pack holds one or two loops per
// place kind and per weather, generated once per world. Pure.
import { isNight, type SceneSignal } from "./mood-select.ts";

export type PlaceSoundId =
  | "tavern" | "market" | "town" | "village" | "forge" | "temple" | "library" | "room" | "cave" | "mine" | "sewer"
  | "forest_day" | "forest_night" | "field" | "mountain" | "river" | "shore" | "ship_deck" | "engine_room" | "camp"
  | "ruins" | "swamp" | "desert" | "neon_city";
export type WeatherId = "rain" | "storm" | "wind" | "snow" | "thunder";
export type AmbientId = PlaceSoundId | WeatherId;

export type AmbientKind = { id: AmbientId; group: "place" | "weather"; label: { ru: string; en: string }; hint: string; /** Loud ambiences keep the music lower. */ busy: boolean };

export const PLACE_SOUNDS: readonly AmbientKind[] = [
  { id: "tavern", group: "place", label: { ru: "Таверна", en: "Tavern" }, hint: "a crowded tavern: murmur of many voices, mugs on wood, a fire crackling, a door now and then", busy: true },
  { id: "market", group: "place", label: { ru: "Рынок", en: "Market" }, hint: "an open-air market: crowd, vendors calling, carts, coins, animals", busy: true },
  { id: "town", group: "place", label: { ru: "Город", en: "Town" }, hint: "a town street by day: footsteps, distant voices, carts and horses, bells far away", busy: true },
  { id: "village", group: "place", label: { ru: "Деревня", en: "Village" }, hint: "a quiet village: chickens, a dog far off, wind in thatch, a creaking cart", busy: false },
  { id: "forge", group: "place", label: { ru: "Кузница", en: "Forge" }, hint: "a smithy: bellows breathing, hammer on anvil in slow rhythm, fire roaring, hiss of quenching", busy: true },
  { id: "temple", group: "place", label: { ru: "Храм", en: "Temple" }, hint: "a large stone temple: deep reverberation, a distant chant without words, candles, a door echoing", busy: false },
  { id: "library", group: "place", label: { ru: "Библиотека", en: "Library" }, hint: "a silent library: pages turning, a quill, a clock ticking, a distant cough", busy: false },
  { id: "room", group: "place", label: { ru: "Комната", en: "Room" }, hint: "a quiet room indoors: a fire in the hearth, a clock, wood settling, muffled street far away", busy: false },
  { id: "cave", group: "place", label: { ru: "Пещера", en: "Cave" }, hint: "a cave: dripping water, deep echoing drips, a faint underground draft, distant rumble", busy: false },
  { id: "mine", group: "place", label: { ru: "Шахта", en: "Mine" }, hint: "a mine: distant pickaxes, creaking timbers, ore carts on rails, falling pebbles", busy: true },
  { id: "sewer", group: "place", label: { ru: "Канализация", en: "Sewer" }, hint: "a sewer tunnel: trickling water, drips, rats scurrying, a hollow echo", busy: false },
  { id: "forest_day", group: "place", label: { ru: "Лес днём", en: "Forest by day" }, hint: "a forest by day: birdsong, leaves in a light wind, insects, a woodpecker far off", busy: false },
  { id: "forest_night", group: "place", label: { ru: "Лес ночью", en: "Forest at night" }, hint: "a forest at night: crickets, an owl, a branch creaking, wind in the canopy", busy: false },
  { id: "field", group: "place", label: { ru: "Поле", en: "Open country" }, hint: "open country: steady wind over grass, larks, distant sheep bells", busy: false },
  { id: "mountain", group: "place", label: { ru: "Горы", en: "Mountains" }, hint: "high mountains: strong cold wind, rockfall far away, an eagle", busy: false },
  { id: "river", group: "place", label: { ru: "Река", en: "River" }, hint: "a river bank: flowing water over stones, a stream babbling, reeds in wind, frogs", busy: false },
  { id: "shore", group: "place", label: { ru: "Берег", en: "Sea shore" }, hint: "a sea shore: waves rolling in, gulls, wind, rigging clinking in a harbour", busy: false },
  { id: "ship_deck", group: "place", label: { ru: "Палуба", en: "Ship's deck" }, hint: "the deck of a ship under way: wind in the rigging, creaking timber and ropes, canvas, water below", busy: false },
  { id: "engine_room", group: "place", label: { ru: "Машинное", en: "Engine room" }, hint: "a steam engine room: pistons thumping in rhythm, hissing steam valves, boiler roar, metal clanks", busy: true },
  { id: "camp", group: "place", label: { ru: "Лагерь", en: "Camp" }, hint: "a camp fire at night: crackling logs, crickets, a light breeze, a horse snorting", busy: false },
  { id: "ruins", group: "place", label: { ru: "Руины", en: "Ruins" }, hint: "ancient ruins: wind through broken stone, crows, loose rubble, a hollow emptiness", busy: false },
  { id: "swamp", group: "place", label: { ru: "Болото", en: "Swamp" }, hint: "a swamp: frogs, bubbling mud, insects, a heron, water dripping from trees", busy: false },
  { id: "desert", group: "place", label: { ru: "Пустыня", en: "Desert" }, hint: "a desert: dry wind, sand hissing over dunes, a distant hawk, deep silence", busy: false },
  { id: "neon_city", group: "place", label: { ru: "Неоновый город", en: "Neon city" }, hint: "a rain-soaked neon city at night: traffic hiss on wet streets, neon buzz, distant sirens, hovering vehicles, crowd murmur", busy: true },
] as const;

export const WEATHERS: readonly AmbientKind[] = [
  { id: "rain", group: "weather", label: { ru: "Дождь", en: "Rain" }, hint: "steady rain on roofs and ground, dripping gutters, no thunder", busy: false },
  { id: "storm", group: "weather", label: { ru: "Ливень", en: "Downpour" }, hint: "a heavy downpour with gusts of wind, water sheeting, rolling thunder far away", busy: true },
  { id: "wind", group: "weather", label: { ru: "Ветер", en: "Wind" }, hint: "strong gusting wind, whistling through gaps, flapping cloth, no rain", busy: false },
  { id: "snow", group: "weather", label: { ru: "Снег", en: "Snow" }, hint: "a snowfall: muffled hush, a cold breeze, snow creaking, very quiet", busy: false },
  { id: "thunder", group: "weather", label: { ru: "Гроза", en: "Thunderstorm" }, hint: "a thunderstorm: thunder cracks and rolls, rain, wind", busy: true },
] as const;

export const AMBIENT_KINDS: readonly AmbientKind[] = [...PLACE_SOUNDS, ...WEATHERS];
export const AMBIENT_IDS = AMBIENT_KINDS.map((row) => row.id) as readonly AmbientId[];
export const PLACE_SOUND_IDS = PLACE_SOUNDS.map((row) => row.id) as readonly PlaceSoundId[];
export const WEATHER_IDS = WEATHERS.map((row) => row.id) as readonly WeatherId[];
export function isAmbientId(value: unknown): value is AmbientId {
  return typeof value === "string" && (AMBIENT_IDS as readonly string[]).includes(value);
}
export function ambientKind(id: AmbientId): AmbientKind {
  return AMBIENT_KINDS.find((row) => row.id === id)!;
}
export function ambientLabel(id: AmbientId, lang: "ru" | "en") {
  return ambientKind(id).label[lang];
}

// `\b` knows ASCII letters only: a lookbehind on any letter marks the word start for Cyrillic stems too.
const W = (stems: string) => new RegExp(`(?<!\\p{L})(${stems})`, "iu");
// Built places before open country: a town with a lake in its description is a town.
const PLACE_SOUND_WORDS: [PlaceSoundId, RegExp][] = [
  ["tavern", W("tavern|inn\\b|pub\\b|saloon|таверн|трактир|кабак|корчм|харчевн|бар(?!\\p{L})|паб")],
  ["market", W("market|bazaar|stall|рынок|рынк|базар|лавк|торг|ярмарк")],
  ["forge", W("forge|smithy|blacksmith|anvil|кузн|наковальн")],
  ["temple", W("temple|church|shrine|chapel|cathedral|храм|церк|святилищ|часовн|собор")],
  ["library", W("library|archive|scriptorium|библиотек|архив")],
  ["engine_room", W("engine room|engine-room|boiler|машинн|котельн|котёл|котел")],
  ["mine", W("mine\\b|mines\\b|shaft|шахт|рудник|штольн")],
  ["sewer", W("sewer|drain|канализац|сток|коллектор")],
  ["cave", W("cave|cavern|grotto|dungeon|crypt|tunnel|catacomb|пещер|грот|подземел|склеп|тоннел|туннел|катакомб|подземк")],
  ["neon_city", W("neon|stack\\b|arcology|megacity|неон|аркологи|мегаполис")],
  // The open sky is an airship's deck in a world of airships; a sailing world reads «корабль» the same way.
  ["ship_deck", W("ship|airship|deck|gondola|vessel|boat|sky\\b|clouds?\\b|корабл|дирижабл|палуб|гондол|судн|лодк|неб[оаеу](?!\\p{L})|облак")],
  ["shore", W("shore|beach|harbou?r|port\\b|pier|quay|dock|берег|гаван|порт|причал|пристан")],
  ["town", W("city|town|street|square|district|quarter|station|город|улиц|площад|квартал|станци")],
  ["village", W("village|hamlet|farm|деревн|хутор|сел[оа](?!\\p{L})|ферм")],
  ["room", W("room|chamber|hall|house|home|cabin|cellar|комнат|зал|дом|изб|каюта|каюте|погреб|подвал")],
  ["ruins", W("ruin|руин|развалин")],
  ["camp", W("camp|bivouac|лагер|бивак|стоянк|привал")],
  ["swamp", W("swamp|marsh|bog|fen|болот|топ[ьи]|трясин")],
  ["desert", W("desert|dune|пустын|дюн")],
  ["forest_day", W("forest|wood|grove|jungle|лес|рощ|чащ")],
  ["mountain", W("mountain|peak|pass\\b|ridge|cliff|гор[аыеу](?!\\p{L})|перевал|хребет|скал|вершин")],
  ["river", W("river|stream|brook|creek|lake|рек[аиеу]|ручь|ручей|озер")],
  ["field", W("field|plain|meadow|steppe|road\\b|пол[еяь](?!\\p{L})|равнин|луг|степ|дорог")],
];
const WEATHER_WORDS: [WeatherId, RegExp][] = [
  // «громче» (louder) is not thunder: the stem needs a word end or a thunder form after it.
  ["thunder", W("thunder|lightning|гром(?![\\p{L}])|гром[аыуео]м?(?![\\p{L}])|громов|громых|громыха|молни|гроз[аыуео]")],
  ["storm", W("downpour|torrential|storm|ливен|ливн|шторм|бур[яи](?!\\p{L})")],
  ["snow", W("snow|blizzard|снег|снеж|метел|вьюг|пург")],
  ["rain", W("rain|drizzle|дожд|морос")],
  ["wind", W("wind\\b|windy|gust|gale|ветер|ветр|порыв")],
];

/** The place's sound from its public name and description; the hour turns a forest into a night forest.
 * The head word of the name decides first («Комната над лавкой» is a room, «Лес у реки» a forest), then the
 * whole name, then the description. */
export function placeSound(place: { name: string; description: string } | null, worldMinutes: number | null): PlaceSoundId | null {
  if (!place) return null;
  const night = isNight(worldMinutes);
  const head = place.name.replace(/[«»"'(]/g, " ").trim().split(/\s+/)[0] ?? "";
  for (const text of [head, place.name, place.description]) {
    for (const [id, pattern] of PLACE_SOUND_WORDS) {
      if (!text || !pattern.test(text)) continue;
      if (id === "forest_day") return night ? "forest_night" : "forest_day";
      if (id === "field" && night) return "camp";
      return id;
    }
  }
  return null;
}

/** The weather from public text only: the committed turn's narration and the place's description. */
export function weatherFrom(text: string): WeatherId | null {
  for (const [id, pattern] of WEATHER_WORDS) if (pattern.test(text)) return id;
  return null;
}

export type AmbientSignal = SceneSignal & { narration?: string | null };
export type AmbientChoice = { place: PlaceSoundId | null; weather: WeatherId | null; reason: string };

export function chooseAmbient(signal: AmbientSignal): AmbientChoice {
  const place = placeSound(signal.place, signal.worldMinutes);
  const text = `${signal.narration ?? ""}\n${signal.place?.description ?? ""}`;
  const weather = weatherFrom(text);
  const reasons = [place ? `the place reads as ${ambientKind(place).label.en.toLowerCase()}` : "the place is unknown", weather ? `the text mentions ${ambientKind(weather).label.en.toLowerCase()}` : "no weather in the text"];
  return { place, weather, reason: reasons.join("; ") };
}

/** Weather holds on for two signals after the cue disappears: a turn without the word is not the sun. */
export type AmbientState = { place: PlaceSoundId | null; weather: WeatherId | null; weatherMisses: number };
export const initialAmbientState = (): AmbientState => ({ place: null, weather: null, weatherMisses: 0 });
export function stepAmbient(state: AmbientState, choice: AmbientChoice): AmbientState {
  const place = choice.place ?? state.place;
  if (choice.weather) return { place, weather: choice.weather, weatherMisses: 0 };
  const misses = state.weatherMisses + 1;
  return { place, weather: misses >= 2 ? null : state.weather, weatherMisses: misses };
}

/** The seconds to ask for: short seamless loops from the effects model, long soundscapes elsewhere. */
export function ambientSeconds(modelId: string) {
  return modelId.includes("sound-effects") ? 22 : 60;
}
