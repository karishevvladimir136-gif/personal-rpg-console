// Polish stage, group 8 (docs/stages/POLISH.md «Character and inventory for any ruleset»):
// the wallet always exists in the world's own currency, the universal paper doll for a
// record without slots, the backstory block, numbers only where the ruleset has them,
// the owner's hit-point correction, and a narrative hero with humanoid slots.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { campaignCurrency, equipmentOf, universalSlots, walletOf } from "../src/lib/ui/campaign-view.ts";
import { resourcePresentation } from "../src/lib/resource-presentation.ts";
import { parseCreationProposal } from "../src/lib/adventures/bootstrap-validation.ts";
import russian from "../src/lib/locales/ru.json" with { type: "json" };

const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const entity = (over = {}) => ({ id: "e1", campaign_id: "c", revision: 1, kind: "player", name: "Рэй", details: "", hp: 9, max_hp: 10, stats: {}, resources: {}, conditions: [], equipment_slots: [], ...over });

test("a currency in the campaign language is money; the wallet always exists in the world's own word", () => {
  assert.deepEqual(resourcePresentation("currency_монеты"), { kind: "money", label: "Монеты" });
  assert.deepEqual(resourcePresentation("currency_silver_pieces"), { kind: "money", label: "Silver pieces" });
  assert.equal(resourcePresentation("resource_заряды").kind, "resource");
  const ru = { campaign: { language: "ru" }, entities: [entity({ resources: {} })] };
  assert.deepEqual(walletOf(ru, ru.entities[0]), [{ key: "currency_монеты", label: "Монеты", value: 0 }], "0 by default, the language's plain word");
  const named = { campaign: { language: "ru" }, entities: [entity({ id: "npc", kind: "npc", resources: { currency_талеры: 40 } }), entity({ resources: {} })] };
  assert.deepEqual(campaignCurrency(named), { key: "currency_талеры", label: "Талеры" }, "the first currency any record names is the campaign's");
  assert.deepEqual(walletOf(named, named.entities[1]), [{ key: "currency_талеры", label: "Талеры", value: 0 }]);
  assert.deepEqual(walletOf(named, named.entities[0]), [{ key: "currency_талеры", label: "Талеры", value: 40 }]);
});

test("the universal paper doll: twelve slots for a record without any; a record's own slots win", () => {
  const data = { campaign: { language: "ru" }, items: [], entities: [] };
  const slots = equipmentOf(data, entity());
  assert.deepEqual(slots.map((row) => row.id), ["head", "neck", "talisman", "body", "cloak", "hand", "offhand", "ring1", "ring2", "gloves", "belt", "legs"]);
  assert.equal(slots.find((row) => row.id === "hand").label, "Основная рука");
  assert.equal(universalSlots("en").find((row) => row.id === "talisman").label, "Talisman");
  const own = equipmentOf(data, entity({ equipment_slots: [{ id: "hand", label: "Рука", accepts: ["weapon"] }] }));
  assert.deepEqual(own.map((row) => row.id), ["hand"]);
});

test("the character screen: the backstory block, the wallet line, numbers only when real, the HP correction; the sidebar labels in Russian", () => {
  const screen = src("src/components/registry/character-screen.tsx");
  assert.match(screen, /c\("Предыстория", "Backstory"\)/);
  assert.match(screen, /const money = walletOf\(data, entity\)/);
  assert.match(screen, /model\.derivedStats\.filter\(\(\[, value\]\) => value !== 0\)/, "stub zeros never show");
  assert.match(screen, /function HpCorrection/);
  assert.match(screen, /operation: "entity\.save"[\s\S]*correctionScope: "timeline"/, "an owner correction of the record");
  assert.match(screen, /const steps = \[-10, -5, -1, 1, 5, 10\]/);
  assert.doesNotMatch(screen, /У этого персонажа нет мест для снаряжения/);
  assert.match(src("src/components/registry/game-screen.tsx"), /const money = hero \? walletOf\(data, hero\) : \[\]/);
  assert.equal(russian.Skill, "Навык");
  assert.equal(russian.Defense, "Защита");
});

test("a narrative hero may get the humanoid slots (the bootstrap no longer ties them to a structured sheet)", () => {
  const sheet = { schemaVersion: 1, mode: "narrative", role: "Diver", background: "A former Guild diver.", level: null, tier: null, attributes: null, skills: ["Swimming +2"], abilities: [], limitations: [], spells: [] };
  const proposal = { schemaVersion: 2, capabilities: [], limitations: [], possessions: [], resources: [], questions: [], sheet, mechanics: null, equipmentProfile: "standard_humanoid" };
  assert.equal(parseCreationProposal(proposal).equipmentProfile, "standard_humanoid");
  assert.match(src("supabase/migrations/202610170062_polish_character.sql"), /perform rpg_private\.assert\(true\);/);
});
