// Fix S4 run 1 — the drafted sheets of the twelve sessions (GAME_PLAYER_1 tables A and B, GAME_PLAYER_2 table C) as the
// DM's draft answer they came from, rebuilt from each session's Screen 1 «Your records:» block
// (test-fixtures/fix-s4-run-1/sessions.json), and the supplied sheet of docs/campaigns/baldurs-gate-en/05.
import { readFileSync } from "node:fs";

export const sessions = JSON.parse(readFileSync(new URL("../test-fixtures/fix-s4-run-1/sessions.json", import.meta.url), "utf8")).sessions;

const hero05 = readFileSync(new URL("../docs/campaigns/baldurs-gate-en/05_hero_warlock_5.md", import.meta.url), "utf8");
const section = (heading) => { const at = hero05.indexOf(heading); const next = hero05.indexOf("\n## ", at + heading.length); return hero05.slice(at, next < 0 ? undefined : next); };
/** 05 §1, the «Who are you?» field as the wizard got it at every table (the fenced block). */
export const who05 = /```[^\n]*\n([\s\S]*?)\n```/.exec(section("## 1."))[1].trim();
/** 05 §2, the sheet the players read («Your hero's sheet») and the owner types on the review screen. */
export const review05 = section("## 2.");
/** The whole supplied sheet: what an owner pastes when he gives the wizard his sheet (§1 and §2). */
export const sheet05 = `${who05}\n\n${review05}`;

const SLOT = { Head: "head", Amulet: "amulet", Cloak: "cloak", "Armor / clothing": "body", "Gloves / bracers": "gloves", Belt: "belt", Boots: "boots",
  "Ring (left)": "ring_left", "Ring (right)": "ring_right", "Main hand": "hand", "Off hand": "offhand" };
const KIND = (name) => /rapier|crossbow|sword|dagger/i.test(name) && !/bolts/i.test(name) ? "weapon" : /bolts/i.test(name) ? "ammunition"
  : /armou?r/i.test(name) ? "armor" : /cloak|boots/i.test(name) ? "clothing" : /coin|amulet/i.test(name) ? "jewelry" : /potion/i.test(name) ? "consumable" : undefined;
const list = (line) => line.split("; ").map((part) => part.trim()).filter(Boolean);
const thing = (raw, slot = null) => {
  const m = /^(.*?)\s*×(\d+)$/.exec(raw.trim());
  const name = (m ? m[1] : raw).trim();
  return { name, description: "", quantity: m ? Number(m[2]) : 1, kind: KIND(name), slot };
};

/** The DM's draft answer (the JSON the wizard reads) that a session's «Your records:» block shows. */
export function draftFromRecords(records) {
  const lines = Object.fromEntries(records.split("\n").map((line) => { const at = line.indexOf(": "); return [line.slice(0, at), line.slice(at + 2)]; }));
  const first = records.split("\n")[0];
  const vitals = records.split("\n")[1];
  const scores = records.split("\n")[2];
  const role = /^.+? — (.+?), level (\d+)$/.exec(first);
  const ability = (code) => Number(new RegExp(`${code} (\\d+)`).exec(scores)[1]);
  const worn = list(lines.Worn ?? "").map((row) => { const at = row.indexOf(": "); return thing(row.slice(at + 2), SLOT[row.slice(0, at)] ?? null); });
  const pack = list(lines.Pack ?? "").map((row) => thing(row));
  return {
    mode: "structured_rpg", role: role[1], level: Number(role[2]), background: "",
    abilities: { strength: ability("STR"), dexterity: ability("DEX"), constitution: ability("CON"), intelligence: ability("INT"), wisdom: ability("WIS"), charisma: ability("CHA") },
    hp: Number(/HP (\d+)\/(\d+)/.exec(vitals)[2]), armorClass: Number(/AC (\d+)/.exec(vitals)[1]), speed: /Speed (.+)$/.exec(vitals)[1],
    skills: list(lines.Skills ?? ""), saves: list(lines.Saves ?? ""), attacks: list(lines.Attacks ?? ""), features: list(lines.Abilities ?? ""),
    limitations: list(lines.Limits ?? ""),
    spells: list(lines.Spells ?? "").map((row) => { const m = /^(.*) \((cantrip|\d)\)$/.exec(row); return { name: m[1], level: m[2] === "cantrip" ? 0 : Number(m[2]) }; }),
    counters: list(lines.Counters ?? "").map((row) => { const m = /^(.*) (\d+)\/(\d+)$/.exec(row); return { label: m[1], value: Number(m[2]), max: Number(m[3]) }; }),
    money: (lines.Money ?? "").split(", ").map((row) => { const m = /^(\d+) (\w+)$/.exec(row.trim()); return m ? { coin: m[2], amount: Number(m[1]) } : null; }).filter(Boolean),
    items: [...worn, ...pack],
    humanoid: true,
    questions: [],
  };
}
