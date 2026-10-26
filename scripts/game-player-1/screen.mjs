// Game player 1: the game screen as text — what the owner sees, in words, and nothing else. The narration as the DM
// wrote it, the roll cards with what they show (the moment, what adds to the die, the difficulty; the die and the
// verdict once rolled), the changes the turn made (the chips), the out-of-game answers, the records panel (the sheet,
// the party, the journal, the place and the time) and the buttons the screen offers. Never the DM's hidden layer,
// notes, plans, checkpoint, ledger or checker output: everything here comes from the public campaign snapshot
// (rpg_saves 'campaign') and the public turns (rpg_runtime 'play'), the two reads the game screen makes.

import { BUTTONS } from "./frozen.mjs";

export { BUTTONS };
const signed = (n) => `${n >= 0 ? "+" : "−"}${Math.abs(n)}`;
const KIND = { skill: "Skill check", attack: "Attack roll", save: "Saving throw", transform: "Transformation check" };
const DIFFICULTY = { easy: "an easy task", normal: "an ordinary task", hard: "a hard task", very_hard: "a very hard task", nearly_impossible: "a nearly impossible task" };

/** A card's title as the card shows it (the DM's reason for the check, else its kind). */
export const cardTitle = (check) => check.reason?.trim() || KIND[check.kind] || "Check";

/** A roll card, as gameplay-dice.tsx draws it: before the tap (the die not shown) or after (the die, the sum, the verdict).
 * Fix S4 run 1 (item 11r): `rerolls` — the rerolls left this session (null: unlimited), shown as the card shows it. */
export function cardText(check, revealed, { rerolls } = {}) {
  const title = cardTitle(check);
  const addends = check.addends?.length ? check.addends : check.modifier ? [{ source: "sheet and gear", value: check.modifier }] : [];
  const tags = [check.difficulty ? `Difficulty: ${DIFFICULTY[check.difficulty] ?? check.difficulty}` : null, check.dc !== null && check.dc !== undefined ? `DC ${check.dc}` : null].filter(Boolean).join(" · ");
  const advantage = check.advantage && check.advantage !== "normal" ? `${check.advantage === "advantage" ? "Advantage" : "Disadvantage"}${check.advantageReason ? `: ${check.advantageReason}` : ""}` : null;
  const lines = [`[Roll card] ${check.actorName} · ${KIND[check.kind] ?? "Check"} — ${title}`];
  if (addends.length) lines.push(`What adds to the die: ${addends.map((a) => `${signed(a.value)} ${a.source}`).join(", ")}`);
  if (tags) lines.push(tags);
  if (advantage) lines.push(advantage);
  if (rerolls !== undefined) lines.push(rerolls === null ? "Rerolls left: unlimited" : `Rerolls left: ${rerolls}`);
  if (check.bundledDamage) lines.push("No reroll on this card: its damage is already dealt, and a new die would not redo it.");
  if (!revealed) lines.push("The die is cast on the server; tap it to see how it fell.");
  else {
    const dice = check.advantage && check.advantage !== "normal" ? `Two dice: ${check.dice.join(" and ")} — the ${check.advantage === "advantage" ? "higher" : "lower"} one counts, ${check.kept}` : `Die: ${check.kept}`;
    const word = check.natural === "crit" ? "Critical!" : check.natural === "fumble" ? "A natural one" : check.success ? "Success" : "Failure";
    lines.push(dice, `${check.kept}${addends.map((a) => ` ${a.value >= 0 ? "+" : "−"} ${Math.abs(a.value)}`).join("")} = ${check.total}`, `${word} — ${check.total}`);
  }
  return lines.join("\n");
}

/** The chips a committed turn shows: its public changes, rolls first in place. */
export function changesText(turn) {
  const changes = (turn.changes ?? []).filter((c) => c.ok !== false && c.summary);
  const rolls = changes.filter((c) => c.tool === "roll").map((c) => `· roll: ${c.summary}`);
  const others = changes.filter((c) => c.tool !== "roll").map((c) => `· ${c.summary}`);
  return [...rolls, ...others].join("\n");
}

/** The buttons line. */
export const buttonsLine = (names) => (names.length ? names.map((name) => `[${name}]`).join(" ") : "");

/** A message as a press reads it: without the brackets, quotes and «press», lower case. */
const asPress = (text) => String(text ?? "").trim().replace(/^[\s*_«"'“[(]+|[\s.!*_»"'”\])]+$/g, "").replace(/^(?:i\s+)?(?:press|click|tap|hit)\s+/i, "").toLowerCase();

/** Fix S4 run 1 (item 11r): each card a reroll may touch has its own button, named by the card's title. */
export const rerollButton = (check) => `${BUTTONS.reroll} — ${cardTitle(check)}`;

const REROLL_LEAD = /^(?:request (?:an )?(?:allowed )?re-?roll|use (?:a|my|one|an allowed) re-?roll|i(?:'ll| will)? re-?roll|re-?roll)(?=$|[\s—–:,-])[\s—–:,-]*(?:(?:on|of|the|my)\s+)*/u;
const NOT_A_NAME = new Set(["the", "check", "card", "roll", "reroll", "please", "one", "this", "that", "for", "with", "and", "allowed", "request", "again"]);
const nameWords = (text) => String(text ?? "").toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((word) => word.length >= 3 && !NOT_A_NAME.has(word));

/** Which card a reroll message names: «reroll», «reroll Stealth», a card's own button. Null — not a reroll press;
 * `{ check }` — the card to reroll; `{ refused }` — the reason the screen gives (no card can be rerolled, several can
 * and the message does not say which, or the card named carried its damage). `blocked`: the waiting cards that take no
 * reroll because their roll carried its damage. */
export function rerollPress(text, cards, blocked = []) {
  const said = asPress(text);
  if (!said || said.length > 160) return null;
  const lead = REROLL_LEAD.exec(said);
  if (!lead) return null;
  const rest = said.slice(lead[0].length).trim();
  const which = () => `say which card — ${cards.map((check) => `«reroll ${cardTitle(check)}»`).join(" or ")}`;
  const asked = nameWords(rest);
  const named = (check) => nameWords(cardTitle(check)).filter((word) => asked.includes(word)).length;
  const damage = (check) => ({ refused: `«${cardTitle(check)}» already dealt its damage, which a reroll would not redo — no reroll on it` });
  const namedBlocked = rest ? blocked.find((check) => named(check) > 0 && !cards.some((other) => named(other) >= named(check))) : null;
  if (namedBlocked) return damage(namedBlocked);
  if (!cards.length) return blocked.length ? damage(blocked[0]) : { refused: "no card on the screen can be rerolled now" };
  if (!rest) return cards.length === 1 ? { check: cards[0] } : { refused: which() };
  const scored = cards.map((check) => ({ check, score: named(check) }));
  const best = Math.max(...scored.map((row) => row.score));
  const top = scored.filter((row) => row.score === best);
  if (best > 0 && top.length === 1) return { check: top[0].check };
  return { refused: cards.length === 1 ? `that card cannot be rerolled now; the one that can is «${cardTitle(cards[0])}»` : which() };
}

/** Which button a player's message presses, or null: the button's name or a short form of it, alone on the line. */
export function pressedButton(text, offered) {
  const said = asPress(text);
  if (!said || said.length > 60) return null;
  const forms = {
    [BUTTONS.roll]: ["roll the die", "roll", "roll it", "i roll", "rolling", "roll the dice", "tap the die", "the die"],
    [BUTTONS.onward]: ["onward", "continue", "go on", "next", "onwards"],
    [BUTTONS.reroll]: ["request an allowed reroll", "reroll", "re-roll", "use a reroll", "i reroll", "request a reroll"],
  };
  return offered.find((name) => (forms[name] ?? [name.toLowerCase()]).includes(said)) ?? null;
}

const lineList = (title, rows) => (rows.length ? `${title}: ${rows.join("; ")}` : "");

/** The records panel the owner can open at any moment: hero, party, journal, place and time. */
export function recordsText(snapshot, play, view) {
  const hero = view.heroOf(snapshot, play);
  if (!hero) return "";
  const sheet = view.sheetOf(hero);
  const { resources } = view.resourcesOf(hero);
  const wallet = view.walletOf(snapshot, hero);
  const items = view.inventoryOf(snapshot, hero.id);
  const worn = view.equipmentOf(snapshot, hero).filter((slot) => slot.item).map((slot) => `${slot.label}: ${slot.item.name}`);
  const party = view.partyOf(snapshot, play);
  const quests = view.questsOf(snapshot);
  const journal = view.journalOf(snapshot);
  const place = view.currentPlace(snapshot);
  const lines = [
    `${hero.name}${sheet.role ? ` — ${sheet.role}` : ""}${sheet.level ? `, level ${sheet.level}` : ""}`,
    [hero.max_hp ? `HP ${hero.hp}/${hero.max_hp}` : null, sheet.armorClass ? `AC ${sheet.armorClass}` : null, sheet.speed ? `Speed ${sheet.speed}` : null].filter(Boolean).join(" · "),
    sheet.attributes.length ? sheet.attributes.map(([k, v]) => `${k} ${v}`).join(" · ") : "",
    lineList("Skills", sheet.skills), lineList("Saves", sheet.saves), lineList("Attacks", sheet.attacks), lineList("Abilities", sheet.abilities),
    sheet.spells.length ? `Spells: ${sheet.spells.map((s) => `${s.name}${Number.isInteger(s.level) ? (s.level === 0 ? " (cantrip)" : ` (${s.level})`) : ""}`).join("; ")}` : lineList("Spells", sheet.spellLines),
    lineList("Limits", sheet.limitations),
    lineList("Counters", resources.map((r) => `${r.label} ${r.value}${r.max !== null ? `/${r.max}` : ""}`)),
    lineList("Money", wallet.map((m) => `${m.value} ${m.label}`)),
    lineList("Worn", worn),
    lineList("Pack", items.filter((item) => !item.equipped_slot).map((item) => `${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ""}`)),
    lineList("Party", party.map((p) => `${p.entity.name}${p.entity.max_hp ? ` (HP ${p.entity.hp}/${p.entity.max_hp})` : ""}${p.present ? "" : " — not here"}${p.entity.details ? ` — ${String(p.entity.details).split(/\n/)[0].slice(0, 160)}` : ""}`)),
    quests.goal ? `Goal: ${quests.goal.title}` : "",
    lineList("Quests", quests.active.map((q) => q.title)),
    journal.arc ? `The arc: ${journal.arc.quest.title}${journal.arc.steps.length ? ` (${journal.arc.steps.map((s) => `${s.done ? "✓" : "·"} ${s.text}`).join("; ")})` : ""}` : "",
    lineList("Threads", journal.threads.map((e) => e.quest.title)), lineList("Debts", journal.debts.map((e) => e.quest.title)), lineList("Promises", journal.promises.map((e) => e.quest.title)),
    place ? `Place: ${place.name}` : "",
    Number.isFinite(play?.worldMinutes) ? `Time: ${view.worldClock(play.worldMinutes, "en", play.restRecords)}` : "",
  ];
  return lines.filter((line) => line && line.trim()).join("\n");
}

/** What the owner glances at in the side panel after a turn: the hero's and the party's numbers, the money, the things
 * carried and the journal's titles (the full sheet stands at the start of the session). */
export function vitalsText(snapshot, play, view) {
  const hero = view.heroOf(snapshot, play);
  if (!hero) return "";
  const { resources } = view.resourcesOf(hero);
  const wallet = view.walletOf(snapshot, hero);
  const items = view.inventoryOf(snapshot, hero.id).map((item) => `${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ""}`);
  const party = view.partyOf(snapshot, play);
  const quests = view.questsOf(snapshot);
  const journal = view.journalOf(snapshot);
  return [
    hero.max_hp ? `${hero.name}: HP ${hero.hp}/${hero.max_hp}` : hero.name,
    lineList("Counters", resources.map((r) => `${r.label} ${r.value}${r.max !== null ? `/${r.max}` : ""}`)),
    lineList("Money", wallet.map((m) => `${m.value} ${m.label}`)),
    lineList("Carried", items),
    lineList("Party", party.map((p) => `${p.entity.name}${p.entity.max_hp ? ` (HP ${p.entity.hp}/${p.entity.max_hp})` : ""}${p.present ? "" : " — not here"}`)),
    quests.goal ? `Goal: ${quests.goal.title}` : "",
    lineList("Quests", quests.active.map((q) => q.title)),
    journal.arc ? `The arc: ${journal.arc.quest.title}` : "",
    lineList("Threads", journal.threads.map((e) => e.quest.title)), lineList("Debts", journal.debts.map((e) => e.quest.title)), lineList("Promises", journal.promises.map((e) => e.quest.title)),
  ].filter((line) => line && line.trim()).join("\n");
}

/** FIX_S4 11t (Fable C: «I'd rather see only what changed»): the lines of the records that changed since the last
 * screen — a list line (Carried, Threads, Promises…) as what came and what went, any other line whole; a line that
 * went away as «—». Empty when nothing changed. */
export function vitalsChanged(before, after) {
  const parse = (text) => new Map(String(text ?? "").split("\n").filter(Boolean).map((line) => {
    const at = line.indexOf(": ");
    return at > 0 ? [line.slice(0, at), line.slice(at + 2)] : [line, ""];
  }));
  const was = parse(before), now = parse(after);
  const out = [];
  for (const [label, value] of now) {
    const old = was.get(label);
    if (old === value) continue;
    const list = (text) => String(text ?? "").split("; ").filter(Boolean);
    if (old !== undefined && LIST_LINES.has(label)) {
      const gone = list(old).filter((x) => !list(value).includes(x)), came = list(value).filter((x) => !list(old).includes(x));
      out.push(`${label}: ${[...came.map((x) => `+ ${x}`), ...gone.map((x) => `− ${x}`)].join("; ")}`);
    } else out.push(value ? `${label}: ${value}` : label);
  }
  for (const label of was.keys()) if (!now.has(label)) out.push(`${label}: —`);
  return out.join("\n");
}
const LIST_LINES = new Set(["Carried", "Party", "Quests", "Threads", "Debts", "Promises"]);

/** The narration after what the player has already read (a paused turn's text stays on the screen; the rest follows it). */
export function afterShown(narration, shown) {
  const text = String(narration ?? ""), seen = String(shown ?? "").trim();
  if (!seen) return text.trim();
  const at = text.indexOf(seen);
  return at >= 0 ? text.slice(at + seen.length).trim() : text.trim();
}

/** The opening scene the game screen shows before the first turn (the opening's narration scene). */
export function openingText(snapshot) {
  const scenes = [...(snapshot.scenes ?? [])].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
  const scene = scenes.find((row) => row.id === snapshot.publicState?.current_scene_id) ?? scenes.at(-1);
  return String(scene?.body ?? "").trim();
}
