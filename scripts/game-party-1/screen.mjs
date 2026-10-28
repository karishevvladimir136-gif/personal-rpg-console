// Game party 1: each player's own records panel, as text — the records of their own character only (never another's),
// read from the same public snapshot the game screen reads (game player 1's screen.mjs did it for the hero alone; here the
// same lines for any of the three, the hero record or a party companion). The table's journal is shown per player: only
// the entries that came in a scene that player's character was in.
const lineList = (title, rows) => (rows.length ? `${title}: ${rows.join("; ")}` : "");

/** The character's full records (the panel at the start of the session). */
export function recordsOf(snapshot, play, view, entityId) {
  const e = snapshot.entities.find((row) => row.id === entityId);
  if (!e) return "";
  const sheet = view.sheetOf(e);
  const { resources } = view.resourcesOf(e);
  const wallet = view.walletOf(snapshot, e);
  const items = view.inventoryOf(snapshot, e.id);
  const worn = view.equipmentOf(snapshot, e).filter((slot) => slot.item).map((slot) => `${slot.label}: ${slot.item.name}`);
  return [
    `${e.name}${sheet.role ? ` — ${sheet.role}` : ""}${sheet.level ? `, level ${sheet.level}` : ""}`,
    [e.max_hp ? `HP ${e.hp}/${e.max_hp}` : null, sheet.armorClass ? `AC ${sheet.armorClass}` : null, sheet.speed ? `Speed ${sheet.speed}` : null].filter(Boolean).join(" · "),
    sheet.attributes.length ? sheet.attributes.map(([k, v]) => `${k} ${v}`).join(" · ") : "",
    lineList("Skills", sheet.skills), lineList("Saves", sheet.saves), lineList("Attacks", sheet.attacks), lineList("Abilities", sheet.abilities),
    sheet.spells.length ? `Spells: ${sheet.spells.map((s) => `${s.name}${Number.isInteger(s.level) ? (s.level === 0 ? " (cantrip)" : ` (${s.level})`) : ""}`).join("; ")}` : lineList("Spells", sheet.spellLines),
    lineList("Limits", sheet.limitations),
    lineList("Counters", resources.map((r) => `${r.label} ${r.value}${r.max !== null ? `/${r.max}` : ""}`)),
    lineList("Money", wallet.map((m) => `${m.value} ${m.label}`)),
    lineList("Worn", worn),
    lineList("Pack", items.filter((item) => !item.equipped_slot).map((item) => `${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ""}`)),
    e.conditions?.length ? `Conditions: ${e.conditions.join(", ")}` : "",
  ].filter((line) => line && line.trim()).join("\n");
}

/** What the player glances at after a round: their character's numbers, money and things carried. */
export function vitalsOf(snapshot, view, entityId) {
  const e = snapshot.entities.find((row) => row.id === entityId);
  if (!e) return "";
  const { resources } = view.resourcesOf(e);
  return [
    e.max_hp ? `${e.name}: HP ${e.hp}/${e.max_hp}` : e.name,
    lineList("Counters", resources.map((r) => `${r.label} ${r.value}${r.max !== null ? `/${r.max}` : ""}`)),
    lineList("Money", view.walletOf(snapshot, e).map((m) => `${m.value} ${m.label}`)),
    lineList("Carried", view.inventoryOf(snapshot, e.id).map((item) => `${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ""}`)),
    e.conditions?.length ? `Conditions: ${e.conditions.join(", ")}` : "",
  ].filter((line) => line && line.trim()).join("\n");
}

/** The table's journal as lines (the goal, quests, the arc, threads, debts, promises), to be shown per player. */
export function journalLines(snapshot, view) {
  const quests = view.questsOf(snapshot);
  const journal = view.journalOf(snapshot);
  return [
    ...(quests.goal ? [`Goal: ${quests.goal.title}`] : []),
    ...quests.active.map((q) => `Quest: ${q.title}`),
    ...(journal.arc ? [`Arc: ${journal.arc.quest.title}`] : []),
    ...journal.threads.map((e) => `Thread: ${e.quest.title}`),
    ...journal.debts.map((e) => `Debt: ${e.quest.title}`),
    ...journal.promises.map((e) => `Promise: ${e.quest.title}`),
  ];
}

/** A player's position at a card: whose card it is, its title (game player 1's cardText draws the card itself). */
export const ownerLine = (name) => `(This card is ${name}'s.)`;
