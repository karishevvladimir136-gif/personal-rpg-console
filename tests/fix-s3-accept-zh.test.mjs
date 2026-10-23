// Fix S3-accept Ж1 (docs/stages/FIX_S3_ACCEPT.md, added 2026-10-22 20:10): «Пожелания к приключению» — a second
// owner-only text beside «Тайны» on the campaign settings and in the new-campaign wizard; free length; it feeds the
// hidden-layer prep together with «Тайны» and the world and never reaches a player-visible payload.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { buildDmLoopContext } from "../src/lib/gameplay/dm-loop/context.ts";
import { buildPrepRequest, ownerSecretsText, ownerWishesText } from "../src/lib/gameplay/dm-loop/hidden-layer.ts";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";

const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const WISH = "Мрачное фэнтези с интригой: к концу главы старые союзники оказываются не теми, кем кажутся.";

test("Ж1: the prep's input contains «Пожелания к приключению»; the player's snapshot never does", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const dmSecrets = (scope, action, payload = {}) => c.f.one("select public.rpg_dm_secrets($1,$2,$3,$4,$5::jsonb) r", [c.owner, scope, c.cid, action, JSON.stringify(payload)]).then((row) => row.r);
    // Stored apart from «Тайны», owner-only, free length up to the store's limit, revisions as for «Тайны».
    await dmSecrets("campaign", "save", { body: "Настоятель — сын убитого графа." });
    const saved = await dmSecrets("campaign_wishes", "save", { body: `  ${WISH}  ` });
    assert.deepEqual([saved.scope, saved.subjectId, saved.body, saved.revision], ["wishes", c.cid, WISH, 1]);
    assert.equal((await dmSecrets("campaign", "read")).body, "Настоятель — сын убитого графа.", "«Тайны» keep their own text");
    await assert.rejects(dmSecrets("campaign_wishes", "save", { body: "x", expectedRevision: 7 }), /rpg_conflict/);
    await assert.rejects(dmSecrets("campaign_wishes", "save", { body: "я".repeat(20001) }), /rpg_validation/);
    assert.equal((await dmSecrets("campaign_wishes", "save", { body: "я".repeat(20000), expectedRevision: 1 })).revision, 2, "free length up to 20 000");
    await dmSecrets("campaign_wishes", "save", { body: WISH });
    await assert.rejects(c.f.one("select public.rpg_dm_secrets(gen_random_uuid(),'campaign_wishes',$1,'read','{}'::jsonb) r", [c.cid]), /rpg_forbidden|42501/);
    // The DM's source carries it beside «Тайны»; the hidden-layer prep reads it as a wish, not a fact.
    const source = (await c.f.one("select public.rpg_dossier($1,$2,'source','{}'::jsonb,null) r", [c.owner, c.cid])).r;
    assert.equal(source.dmSecrets.wishes, WISH);
    assert.equal(source.dmSecrets.campaign, "Настоятель — сын убитого графа.");
    assert.equal(ownerWishesText(source), WISH);
    assert.doesNotMatch(ownerSecretsText(source), /Мрачное фэнтези/, "«Тайны» stay their own text");
    const prep = buildPrepRequest(source, "high");
    const prepText = prep.system.map((block) => block.text).join("\n");
    assert.match(prepText, /The owner's own secrets for this campaign[\s\S]*Настоятель — сын убитого графа\./);
    assert.match(prepText, /The owner's wishes for this adventure \(«Пожелания к приключению»; DM-only\)[\s\S]*not an established fact[\s\S]*Мрачное фэнтези с интригой/);
    const rebuild = buildPrepRequest(source, "high", true);
    assert.match(rebuild.messages[0].text, /or their wishes for the adventure \(«Пожелания к приключению»\)/);
    // A turn's context does not carry it (only the prep reads it).
    const input = await c.input("Осматриваюсь.");
    const context = buildDmLoopContext(source, input);
    assert.doesNotMatch(JSON.stringify(context.system) + context.parts.tail, /Мрачное фэнтези/);
    // The player's snapshot and play never carry it.
    const snapshot = JSON.stringify(await c.f.snapshot());
    const play = JSON.stringify(await (await c.deps(createScriptedDmModel([]))).store.readPlay(c.cid));
    const state = JSON.stringify(await c.state().then((s) => ({ entities: s.entities, scenes: s.scenes, quests: s.quests, locations: s.locations })));
    for (const [name, payload] of [["snapshot", snapshot], ["play", play], ["state", state]]) assert.ok(!payload.includes("Мрачное фэнтези"), `${name} carries no wish`);
  } finally { await c.f.db.close(); }
});

test("Ж1: the field beside «Тайны» on the settings and in the wizard — free length, owner-only; saving it rebuilds the layer, the wizard's save does not", () => {
  const panel = src("src/components/registry/owner-secrets.tsx");
  assert.match(panel, /export const OWNER_WISHES_MAX_CHARS = 20000;/);
  assert.match(panel, /Пожелания к приключению \(видит только ведущий\)/);
  assert.match(panel, /rows=\{5\} maxLength=\{OWNER_WISHES_MAX_CHARS\}/);
  assert.match(panel, /rows=\{1\} maxLength=\{OWNER_STEER_MAX_CHARS\}/, "«Тайны» keep their one-line steer");
  const wizard = src("src/components/bootstrap/wizard.tsx");
  assert.match(wizard, /Пожелания к приключению \(видит только ведущий\)/);
  assert.match(wizard, /body: JSON\.stringify\(\{ scope: "wishes", body: body\.trim\(\), rebuild: false \}\)/);
  assert.match(wizard, /if \(draft\.wishes\.trim\(\)\) await saveWishes\(campaignId, draft\.wishes\);/);
  // The adventure record (which the DM reads every turn and the player's screens show) never takes the wishes.
  assert.match(wizard, /const text = wizardAdventurePremise\(premise, companions, language\)/);
  assert.match(wizard, /void onSave\(\{ title: [^\n]*, premise: text\.slice\(0, 20000\), pacing \},/, "the adventure's setup carries no wish");
  const server = src("src/lib/server/dm-secrets.ts");
  assert.match(server, /rpc\(user\.id, "campaign_wishes", campaignId, "read"\)/);
  assert.match(server, /if \(v\.rebuild !== false && v\.body\.trim\(\) && v\.body\.trim\(\) !== \(was \?\? ""\)\.trim\(\)\) scheduleSecretsPrep\(campaignId, user\.id\);/);
  // The migration is additive, in this stage's range, after every earlier one.
  const files = readdirSync(new URL("../supabase/migrations/", import.meta.url)).filter((name) => name.endsWith(".sql")).sort();
  assert.equal(files.at(-1), "202610230551_fix_s3_accept_adventure_wishes.sql");
  const sql = src("supabase/migrations/202610230551_fix_s3_accept_adventure_wishes.sql");
  assert.match(sql, /check \(scope in \('campaign','world','wishes'\)\)/);
  assert.match(sql, /rename to runtime_source_before_wishes/);
  assert.doesNotMatch(sql, /\b(drop table|delete from|truncate)\b/i);
});
