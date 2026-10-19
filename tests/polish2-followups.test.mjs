// Polish 2, part 6 (docs/stages/POLISH_2.md §6): the small follow-ups from the polish report —
// migration 67 (the hero's slots backfilled, the atlas composition, the director switch), the
// journal's links to the codex, the first adventure straight into the opening review, the DM-drafted
// combat profile (the request and the bounded parser), the one «Картинки» page. No model call.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { codexAnchor, linkNames, nameStemsOf } from "../src/lib/ui/link-names.ts";
import { combatDraftRequest, parseCombatDraft } from "../src/lib/gameplay/combat-draft.ts";
import { COMPOSITIONS, parsePictureSettings, pictureCostUsdMicros, pictureSizeFor } from "../src/lib/visual-frame/pictures.ts";
import { fixture, world } from "./phase35-storage-fixture.mjs";

const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const call = (f, cid, action, payload = {}, user = f.owner) =>
  f.one("select public.rpg_pictures($1,$2,$3,$4::jsonb) result", [user, cid, action, JSON.stringify(payload)]).then((row) => row.result);

test("the journal links the named things a quest text mentions to their codex entries, by stem, once each, longest name first", () => {
  const things = [
    { kind: "entity", id: "e1", name: "Марта" }, { kind: "entity", id: "e2", name: "Мокей" },
    { kind: "item", id: "i1", name: "Сельдь" }, { kind: "location", id: "l1", name: "Кабак Марты" }, { kind: "item", id: "i2", name: "медный шлем" },
  ];
  assert.deepEqual(nameStemsOf("Кабак Марты"), ["каба", "март"]);
  const segments = linkNames("Поднять «Сельдь» со дна и отдать Марте сорок монет в Кабаке Марты; шлем у Мокея.", things);
  const linked = segments.filter((row) => row.link).map((row) => [row.text, row.link.id]);
  assert.deepEqual(linked, [["Сельдь", "i1"], ["Марте", "e1"], ["Кабаке Марты", "l1"], ["Мокея", "e2"]]);
  assert.equal(segments.map((row) => row.text).join(""), "Поднять «Сельдь» со дна и отдать Марте сорок монет в Кабаке Марты; шлем у Мокея.", "the text is whole");
  assert.deepEqual(linkNames("Ничего знакомого.", things), [{ text: "Ничего знакомого." }]);
  assert.equal(codexAnchor({ kind: "location", id: "l1" }), "codex-location-l1");
  const journal = src("src/components/registry/journal-codex.tsx");
  assert.match(journal, /<LinkedText text=\{quest\.description\} data=\{data\} href=\{codexHref\} \/>/);
  assert.match(journal, /id=\{codexAnchor\(\{ kind: "location", id: location\.id \}\)\}/);
  assert.match(journal, /\^#codex-\(entity\|location\|item\)-/, "the codex opens the matching tab for a hash");
});

test("the first adventure saves on the first click and goes straight to the opening review; the atlas and the pictures page are wired", () => {
  const form = src("src/components/adventures/forms.tsx");
  assert.match(form, /if \(reviewing \|\| direct\) onSave\(setup\);/);
  assert.match(src("src/components/adventures/adventures-panel.tsx"), /direct=\{draft\.kind === "prepare" && !!draft\.initial\}/);
  const atlas = src("src/components/atlas-map.tsx");
  assert.match(atlas, /composition: "atlas", trigger: "manual"/);
  assert.match(atlas, /anchorFor\(pictures\.board, \{ kind: "location", id: atlasSubjectId \}, "atlas"\)/);
  assert.match(src("src/lib/server/media/pictures-service.ts"), /No text, letters, numbers, labels, a legend/, "no text on the drawn map");
  const shell = src("src/components/registry/shell.tsx");
  assert.match(shell, /\{ id: "pictures", label: c\("Картинки", "Pictures"\)/);
  assert.doesNotMatch(shell, /label: c\("Галерея", "Gallery"\)|label: c\("Визуальная библия", "Visual Bible"\)/);
  const page = src("src/app/campaigns/[campaignId]/[screen]/page.tsx");
  assert.match(page, /case "pictures":\s*case "frame":\s*case "gallery":\s*return <PicturesRoute \/>;/, "the old addresses open the new page");
  assert.match(src("src/components/world-lab/continuation.tsx"), /\{c\.startPoint\} \{inspection\.checkpoint\.ordinal \+ 1\}/);
  const whatIf = src("src/components/world-lab/continuation.tsx");
  assert.ok(whatIf.indexOf("{c.cost}") < whatIf.indexOf("{c.interpret}"), "the cost line comes before the paid button");
  assert.ok(COMPOSITIONS.includes("atlas"));
  assert.equal(pictureSizeFor("gpt-image-2.5-sunburst", "atlas"), "landscape_16_9_hd");
  assert.ok(pictureCostUsdMicros("quality", "atlas") > 0);
  assert.equal(parsePictureSettings({}).director, false, "polish 3 §5: off by default");
  assert.equal(parsePictureSettings({ director: true }).director, true);
  assert.equal(parsePictureSettings({ director: false }).director, false);
  assert.match(src("src/lib/server/media/pictures-service.ts"), /!board\.settings\.director \? \{ costUsdMicros: 0 \} : await directFrame/);
});

test("the DM-drafted combat profile: the request names the house ranges and the possessions; the parser bounds the numbers and the weapon", () => {
  const proposal = { hero: { id: "h", name: "Рэй", revision: 1, hp: null, maxHp: null, attack: null, defense: null, skill: 2 }, npcs: [], handItem: null, configuration: null, profile: "console-basic-v1",
    fence: { campaignId: "c", timeline: { timelineId: "t", epoch: 1 }, expectedRevision: 1, expectedRuntimeRevision: 1, expectedHeadId: null },
    possessions: [{ index: 0, name: "гарпунный пистолет", quantity: 1, currentQuantity: 1, description: "", itemId: null, itemRevision: null, equipped: null, damage: null }, { index: 1, name: "верёвка", quantity: 1, currentQuantity: 0, description: "", itemId: null, itemRevision: null, equipped: null, damage: null }] };
  const request = combatDraftRequest({ name: "Рэй", details: "Бывший водолаз, лет сорока, крепкий.", sheet: null, items: ["гарпунный пистолет"], conditions: [] }, proposal, "ru");
  assert.match(request.system, /hp 1–60/);
  assert.match(request.system, /Write «why» in Russian/);
  assert.match(request.user, /0: гарпунный пистолет/);
  assert.doesNotMatch(request.user, /1: верёвка/, "only possessions still held");
  assert.match(request.user, /Already saved \(keep\): skill 2\./);
  const draft = parseCombatDraft('Here: {"hp": 18, "attack": 1, "defense": 11, "skill": 3, "weaponIndex": 0, "weaponDamage": 6, "why": "Крепкий водолаз с гарпуном."}', proposal);
  assert.deepEqual(draft, { hp: 18, attack: 1, defense: 11, skill: 3, weaponIndex: 0, weaponDamage: 6, why: "Крепкий водолаз с гарпуном." });
  const bounded = parseCombatDraft('{"hp": 900, "attack": -40, "defense": 2, "skill": 50, "weaponIndex": 1, "weaponDamage": 99, "why": ""}', proposal);
  assert.deepEqual(bounded, { hp: 60, attack: -5, defense: 5, skill: 10, weaponIndex: null, weaponDamage: null, why: "" }, "out-of-range values are clamped; a possession not held is no weapon");
  assert.equal(parseCombatDraft('{"hp": "many"}', proposal), null);
  assert.match(src("src/components/combat-readiness.tsx"), /draftCombatReadiness\(campaignId\)/);
  assert.match(src("src/app/api/campaigns/[campaignId]/combat-readiness/route.ts"), /action === "draft"\) return publicJson\(await draftCombatProfile/);
});

test("migration 67: the hero's slots are backfilled, the atlas composition is accepted, the director switch travels with the settings", async () => {
  const f = await fixture();
  try {
    assert.ok(f.files.includes("202610170067_polish2_followups.sql"));
    const w = await world(f);
    // The backfill statement of the migration, run again over a hero whose slots are empty (an existing record).
    await f.one("update public.rpg_entities set equipment_slots='[]'::jsonb where id=$1", [w.hero]);
    const statement = readFileSync(new URL("../supabase/migrations/202610170067_polish2_followups.sql", import.meta.url), "utf8").match(/update public\.rpg_entities e set equipment_slots[\s\S]*?;/)[0];
    await f.one(statement);
    const slots = (await f.one("select equipment_slots from public.rpg_entities where id=$1", [w.hero])).equipment_slots;
    assert.ok(Array.isArray(slots) && slots.length >= 8, `a player without slots got the humanoid set (${slots?.length})`);
    assert.ok(slots.some((slot) => slot.id === "hand"));
    const read = await call(f, w.cid, "read");
    assert.equal(read.settings.director, false, "polish 3 §5 (migration 68): off by default");
    const saved = await call(f, w.cid, "settings.save", { expectedRevision: 0, frames: "every", quality: "fast", dailyCap: 10, autopilot: read.settings.autopilot, director: true });
    assert.equal(saved.director, true);
    await assert.rejects(call(f, w.cid, "settings.save", { expectedRevision: 1, frames: "every", quality: "fast", dailyCap: 10, autopilot: read.settings.autopilot, director: "yes" }), /rpg_validation/);
    const fence = await f.fence(w.cid);
    const place = (await f.one("select id from public.rpg_locations where campaign_id=$1 limit 1", [w.cid]))?.id;
    if (place) {
      const atlas = await call(f, w.cid, "picture.create", { id: randomUUID(), kind: "anchor", subjectKind: "location", subjectId: place, composition: "atlas", timeline: fence, tier: "quality", trigger: "manual",
        model: "gpt-image-2.5-sunburst", styleVersionId: null, shot: null, prompt: "A map.", referenceIds: [] });
      assert.equal(atlas.composition, "atlas");
    }
  } finally {
    await f.db.close();
  }
});
