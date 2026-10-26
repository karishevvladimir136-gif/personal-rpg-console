// The player's lines for accepted tool calls («Изменения за ход»), written by
// the server from templates in the campaign language (polish item 19). A
// receipt keeps two texts: `summary` (English, for the model, the bench and the
// logs) and `player` (this file; null for anything the hero would not notice:
// private rolls, DM notes and plans, Character Models, lookups). Templates only
// ever name public records; nothing private is formatted here.

export type ChipLanguage = "ru" | "en";

/** Russian plural form for a count: one / few / many. */
export function pluralRu(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
}

/** A currency label inflected after a number, from the world's own word. The
 * DM names the currency once (монета, талер, silver piece); the chips need
 * «5 монет», «2 монеты». Heuristic by the ending; a word it cannot inflect is
 * printed as given, which is never wrong, only flat. */
/** FIX_S4 11o: a 5e coin code is never a word on the player's screen («+8 sps» of Table A): the code becomes the coin's
 * name — «8 silver», «8 серебряных». The records panel keeps its compact codes with the coin's name as the title. */
const COIN_WORDS: Record<string, { en: string; ru: [string, string, string] }> = {
  pp: { en: "platinum", ru: ["платиновая", "платиновые", "платиновых"] }, gp: { en: "gold", ru: ["золотой", "золотых", "золотых"] },
  ep: { en: "electrum", ru: ["электрумовая", "электрумовые", "электрумовых"] }, sp: { en: "silver", ru: ["серебряный", "серебряных", "серебряных"] },
  cp: { en: "copper", ru: ["медяк", "медяка", "медяков"] },
};
const CODE_OF: Record<string, string> = { pp: "pp", gp: "gp", ep: "ep", sp: "sp", cp: "cp", пм: "pp", зм: "gp", эм: "ep", см: "sp", мм: "cp" };
export function coinCodeWords(language: ChipLanguage, amount: number, label: string): string | null {
  const code = CODE_OF[label.trim().toLocaleLowerCase().replace(/[.\s]/g, "").replace(/s$/, "")];
  if (!code) return null;
  const words = COIN_WORDS[code];
  return `${amount} ${language === "ru" ? pluralRu(amount, ...words.ru) : words.en}`;
}

export function currencyAmount(language: ChipLanguage, amount: number, label: string): string {
  const coin = coinCodeWords(language, amount, label);
  if (coin) return coin;
  const words = label.trim().split(/\s+/);
  let last = words.at(-1) ?? label;
  const head = words.slice(0, -1).join(" ");
  const join = (form: string) => `${amount} ${head ? `${head} ` : ""}${form}`;
  if (language === "ru") {
    // The DM may have named the currency in a plural or oblique form («монеты», «монетами»): back to a base form.
    if (/ами$/.test(last)) last = `${last.slice(0, -3)}а`;
    else if (/[ыи]$/.test(last) && last.length > 3 && !/[ьй]$/.test(last.slice(0, -1))) last = `${last.slice(0, -1)}а`;
    const stem = last.slice(0, -1);
    const soft = /[гкхжшщч]$/.test(stem);
    if (/а$/.test(last)) return join(pluralRu(amount, last, `${stem}${soft ? "и" : "ы"}`, stem));
    if (/я$/.test(last)) return join(pluralRu(amount, last, `${stem}и`, `${stem}ь`));
    if (/ь$/.test(last)) return join(pluralRu(amount, last, `${stem}я`, `${stem}ей`));
    if (/[бвдзлмнпрстфц]$/.test(last)) return join(pluralRu(amount, last, `${last}а`, `${last}ов`));
    if (/[жшщч]$/.test(last)) return join(pluralRu(amount, last, `${last}а`, `${last}ей`));
    return join(last);
  }
  if (amount === 1) return join(last.replace(/s$/, "") || last);
  return join(/s$/.test(last) ? last : `${last}s`);
}

/** The genitive of a Russian name for «Вещи Марты»; a name the rule cannot
 * decline (several words, an unusual ending) is printed after a colon. */
export function possessionsLabel(language: ChipLanguage, name: string): string {
  const trimmed = name.trim();
  if (language !== "ru") return `${trimmed}'s things`;
  if (/\s/.test(trimmed)) return `Вещи: ${trimmed}`;
  if (/[^\p{Script=Cyrillic}]/u.test(trimmed)) return `Вещи: ${trimmed}`;
  if (/а$/.test(trimmed)) return `Вещи ${trimmed.slice(0, -1)}${/[гкхжшщч]$/.test(trimmed.slice(0, -1)) ? "и" : "ы"}`;
  if (/я$/.test(trimmed)) return `Вещи ${trimmed.slice(0, -1)}и`;
  if (/й$/.test(trimmed)) return `Вещи ${trimmed.slice(0, -1)}я`;
  if (/ь$/.test(trimmed)) return `Вещи ${trimmed.slice(0, -1)}я`;
  if (/[бвгдзклмнпрстфхцчшщж]$/.test(trimmed)) return `Вещи ${trimmed}а`;
  return `Вещи: ${trimmed}`;
}

/** Minutes in words («10 минут», «час», «2 часа 15 минут»); days when long. */
export function durationText(language: ChipLanguage, minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  const days = Math.floor(m / 1440), hours = Math.floor((m % 1440) / 60), rest = m % 60;
  const parts: string[] = [];
  if (language === "ru") {
    if (days) parts.push(`${days} ${pluralRu(days, "день", "дня", "дней")}`);
    if (hours) parts.push(hours === 1 && !days ? "час" : `${hours} ${pluralRu(hours, "час", "часа", "часов")}`);
    if (rest || !parts.length) parts.push(`${rest} ${pluralRu(rest, "минута", "минуты", "минут")}`);
    return parts.join(" ");
  }
  if (days) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  if (hours) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
  if (rest || !parts.length) parts.push(`${rest} minute${rest === 1 ? "" : "s"}`);
  return parts.join(" ");
}

const qty = (n: number) => (n > 1 ? ` ×${n}` : "");

/** Templates. `hero` tells whether the subject is the player's own character
 * (the chip speaks to the player: «Получено», not «У Рэя появилось»). */
export const chip = {
  itemGained(l: ChipLanguage, owner: string, hero: boolean, name: string, n: number, toCamp: boolean) {
    if (toCamp) return l === "ru" ? `В лагере: ${name}${qty(n)}` : `In the camp: ${name}${qty(n)}`;
    if (hero) return l === "ru" ? `Получено: ${name}${qty(n)}` : `Gained: ${name}${qty(n)}`;
    return l === "ru" ? `У ${owner} теперь есть: ${name}${qty(n)}` : `${owner} now has: ${name}${qty(n)}`;
  },
  itemGiven(l: ChipLanguage, name: string, n: number, from: string, fromHero: boolean, to: string, toHero: boolean, reward: boolean) {
    if (toHero) return l === "ru" ? `Получено: ${name}${qty(n)} ← ${from}` : `Received: ${name}${qty(n)} ← ${from}`;
    if (fromHero) return l === "ru" ? `Отдано: ${name}${qty(n)} → ${to}${reward ? " (в оплату)" : ""}` : `Given: ${name}${qty(n)} → ${to}${reward ? " (payment)" : ""}`;
    return l === "ru" ? `${from} → ${to}: ${name}${qty(n)}` : `${from} → ${to}: ${name}${qty(n)}`;
  },
  itemReturned(l: ChipLanguage, name: string, to: string, toHero: boolean) {
    if (toHero) return l === "ru" ? `Возвращено: ${name}` : `Returned: ${name}`;
    return l === "ru" ? `Возвращено: ${name} → ${to}` : `Returned: ${name} → ${to}`;
  },
  itemPledged(l: ChipLanguage, kind: "pledge" | "loan", name: string, holder: string, condition: string) {
    const tail = condition ? ` — ${condition}` : "";
    if (kind === "pledge") return l === "ru" ? `Залог: ${name} → ${holder}${tail}` : `Pledged: ${name} → ${holder}${tail}`;
    return l === "ru" ? `Одолжено: ${name} → ${holder}${tail}` : `Lent: ${name} → ${holder}${tail}`;
  },
  itemUsed(l: ChipLanguage, owner: string, hero: boolean, name: string, n: number, remaining: number) {
    const left = remaining > 0 ? (l === "ru" ? `, осталось ${remaining}` : `, ${remaining} left`) : "";
    if (hero) return l === "ru" ? `Использовано: ${name}${qty(n)}${left}` : `Used: ${name}${qty(n)}${left}`;
    return l === "ru" ? `${owner} использует: ${name}${qty(n)}${left}` : `${owner} uses: ${name}${qty(n)}${left}`;
  },
  itemLost(l: ChipLanguage, owner: string, hero: boolean, name: string, reason: string) {
    const tail = reason ? ` — ${reason}` : "";
    if (hero) return l === "ru" ? `Потерян: ${name}${tail}` : `Lost: ${name}${tail}`;
    return l === "ru" ? `${owner} теряет: ${name}${tail}` : `${owner} loses: ${name}${tail}`;
  },
  itemModified(l: ChipLanguage, from: string, to: string, note: string) {
    const arrow = from === to ? to : `${from} → ${to}`;
    return l === "ru" ? `Изменено: ${arrow}${note ? ` (${note})` : ""}` : `Changed: ${arrow}${note ? ` (${note})` : ""}`;
  },
  itemEquipped(l: ChipLanguage, owner: string, hero: boolean, name: string, slot: string) {
    if (hero) return l === "ru" ? `Надето: ${name} (${slot.toLocaleLowerCase()})` : `Equipped: ${name} (${slot.toLocaleLowerCase()})`;
    return l === "ru" ? `${owner} надевает: ${name}` : `${owner} equips: ${name}`;
  },
  itemUnequipped(l: ChipLanguage, owner: string, hero: boolean, name: string) {
    if (hero) return l === "ru" ? `Снято: ${name}` : `Taken off: ${name}`;
    return l === "ru" ? `${owner} снимает: ${name}` : `${owner} takes off: ${name}`;
  },
  itemSplit(l: ChipLanguage, name: string, n: number) {
    return l === "ru" ? `Отложено: ${name} ×${n}` : `Set aside: ${name} ×${n}`;
  },
  moneyPaid(l: ChipLanguage, amount: string, from: string, fromHero: boolean, to: string, toHero: boolean, reward: string | null) {
    if (toHero) return l === "ru" ? `+${amount} ← ${from}${reward ? ` (награда: ${reward})` : ""}` : `+${amount} ← ${from}${reward ? ` (reward: ${reward})` : ""}`;
    if (fromHero) return l === "ru" ? `−${amount} → ${to}` : `−${amount} → ${to}`;
    return `${from} → ${to}: ${amount}`;
  },
  moneyReceived(l: ChipLanguage, amount: string, to: string, toHero: boolean, reason: string) {
    if (toHero) return `+${amount}${reason ? ` (${reason})` : ""}`;
    return l === "ru" ? `${to} получает ${amount}${reason ? ` (${reason})` : ""}` : `${to} receives ${amount}${reason ? ` (${reason})` : ""}`;
  },
  moneySpent(l: ChipLanguage, amount: string, from: string, fromHero: boolean, reason: string) {
    if (fromHero) return `−${amount}${reason ? ` (${reason})` : ""}`;
    return l === "ru" ? `${from} тратит ${amount}${reason ? ` (${reason})` : ""}` : `${from} spends ${amount}${reason ? ` (${reason})` : ""}`;
  },
  rewardPaid(l: ChipLanguage, recipient: string, hero: boolean, quest: string, reward: string) {
    if (hero) return l === "ru" ? `Награда за «${quest}»: ${reward}` : `Reward for “${quest}”: ${reward}`;
    return l === "ru" ? `${recipient} получает награду за «${quest}»: ${reward}` : `${recipient} receives the reward for “${quest}”: ${reward}`;
  },
  hp(l: ChipLanguage, actor: string, hero: boolean, before: number, after: number, max: number, reason: string) {
    const tail = reason ? ` (${reason})` : "";
    if (hero) return l === "ru" ? `Хиты: ${before} → ${after} из ${max}${tail}` : `HP: ${before} → ${after} of ${max}${tail}`;
    return l === "ru" ? `${actor}: хиты ${before} → ${after}${tail}` : `${actor}: HP ${before} → ${after}${tail}`;
  },
  counter(l: ChipLanguage, actor: string, hero: boolean, name: string, before: number, after: number, cap: number | null, reason: string) {
    const span = `${before} → ${after}${cap !== null ? `/${cap}` : ""}`;
    const tail = reason ? ` (${reason})` : "";
    void l;
    return hero ? `${name}: ${span}${tail}` : `${actor}: ${name} ${span}${tail}`;
  },
  questCreated(l: ChipLanguage, kind: string, title: string, reward: string | null) {
    const tail = reward ? (l === "ru" ? ` (награда: ${reward})` : ` (reward: ${reward})`) : "";
    const noun = l === "ru"
      ? { quest: "Задание", thread: "Зацепка", debt: "Долг", promise: "Обещание", arc: "Главная линия" }[kind] ?? "Запись"
      : { quest: "Quest", thread: "Lead", debt: "Debt", promise: "Promise", arc: "Main arc" }[kind] ?? "Journal";
    return `${noun}: ${title}${tail}`;
  },
  questUpdated(l: ChipLanguage, kind: string, title: string) {
    void kind;
    return l === "ru" ? `Журнал: «${title}» обновлено` : `Journal: “${title}” updated`;
  },
  questClosed(l: ChipLanguage, kind: string, title: string, failed: boolean) {
    if (failed) return l === "ru" ? `Провалено: ${title}` : `Failed: ${title}`;
    if (kind === "debt") return l === "ru" ? `Долг закрыт: ${title}` : `Debt settled: ${title}`;
    if (kind === "promise") return l === "ru" ? `Обещание исполнено: ${title}` : `Promise kept: ${title}`;
    if (kind === "thread") return l === "ru" ? `Зацепка закрыта: ${title}` : `Lead closed: ${title}`;
    if (kind === "arc") return l === "ru" ? `Главная линия завершена: ${title}` : `Main arc completed: ${title}`;
    return l === "ru" ? `Выполнено: ${title}` : `Completed: ${title}`;
  },
  person(l: ChipLanguage, kind: string, name: string) {
    if (kind === "companion") return l === "ru" ? `Спутник: ${name}` : `Companion: ${name}`;
    if (kind === "faction") return l === "ru" ? `Фракция: ${name}` : `Faction: ${name}`;
    return l === "ru" ? `Новый человек: ${name}` : `New person: ${name}`;
  },
  companionJoins(l: ChipLanguage, name: string) {
    return l === "ru" ? `${name} идёт с тобой` : `${name} joins you`;
  },
  place(l: ChipLanguage, name: string, rumour: boolean) {
    if (rumour) return l === "ru" ? `Слух о месте: ${name}` : `A rumour of a place: ${name}`;
    return l === "ru" ? `Новое место: ${name}` : `New place: ${name}`;
  },
  travel(l: ChipLanguage, place: string, minutes: number) {
    return l === "ru" ? `Переход: ${place} (${durationText(l, minutes)})` : `Travel: ${place} (${durationText(l, minutes)})`;
  },
  time(l: ChipLanguage, minutes: number) {
    if (minutes <= 0) return null;
    return l === "ru" ? `Прошло: ${durationText(l, minutes)}` : `Time passes: ${durationText(l, minutes)}`;
  },
  rest(l: ChipLanguage, kind: "short" | "long", minutes: number, recovered: { name: string; before: number; after: number; hero: boolean }[], safe: boolean) {
    const head = l === "ru" ? `${kind === "long" ? "Долгий" : "Короткий"} отдых (${durationText(l, minutes)})` : `${kind === "long" ? "Long" : "Short"} rest (${durationText(l, minutes)})`;
    if (!recovered.length) return safe ? head : (l === "ru" ? `${head} — без восстановления` : `${head} — no recovery`);
    const parts = recovered.map((r) => r.hero ? (l === "ru" ? `хиты ${r.before} → ${r.after}` : `HP ${r.before} → ${r.after}`) : `${r.name} ${r.before} → ${r.after}`);
    return `${head}: ${parts.join(", ")}`;
  },
  combatStart(l: ChipLanguage, names: string[]) {
    return l === "ru" ? `Бой: ${names.join(", ")}` : `Combat: ${names.join(", ")}`;
  },
  combatEnd(l: ChipLanguage, outcome: string) {
    const text = l === "ru"
      ? { victory: "победа", escape: "бегство", surrender: "сдача", negotiation: "договорились", "objective-completion": "цель достигнута" }[outcome] ?? outcome
      : { victory: "victory", escape: "escape", surrender: "surrender", negotiation: "negotiated", "objective-completion": "objective reached" }[outcome] ?? outcome;
    return l === "ru" ? `Бой окончен: ${text}` : `Combat over: ${text}`;
  },
  holding(l: ChipLanguage, kind: string, name: string, removed: boolean) {
    if (removed) return l === "ru" ? `Больше не ваше: ${name}` : `No longer yours: ${name}`;
    const noun = l === "ru" ? { transport: "Транспорт", base: "База", mount: "Верховое животное" }[kind] ?? "Имущество"
      : { transport: "Transport", base: "Base", mount: "Mount" }[kind] ?? "Property";
    return `${noun}: ${name}`;
  },
  roll(l: ChipLanguage, actor: string, hero: boolean, reason: string, total: number, dc: number | null, showDc: boolean, success: boolean | null, natural: "crit" | "fumble" | null) {
    const who = hero ? "" : `${actor}: `;
    const verdict = success === null ? "" : l === "ru"
      ? (natural === "crit" ? " — крит" : natural === "fumble" ? " — провал на единице" : success ? " — получилось" : " — не вышло")
      : (natural === "crit" ? " — critical" : natural === "fumble" ? " — natural one" : success ? " — success" : " — failure");
    const target = dc !== null && showDc ? (l === "ru" ? ` против ${dc}` : ` vs ${dc}`) : "";
    return `${who}${reason ? `${reason}: ` : ""}${total}${target}${verdict}`;
  },
  moment(l: ChipLanguage, reason: string) {
    return l === "ru" ? `${reason} · получилось — опиши, как ты это делаешь` : `${reason} · success — describe how you do it`;
  },
};
