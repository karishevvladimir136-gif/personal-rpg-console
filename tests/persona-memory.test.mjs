// Persona memory 1, Part A (docs/stages/PERSONA_MEMORY_1.md): the store as a library on both backends — the plain
// files and Postgres (migration 202610230101 on PGlite). Round-trip, validity («asOf returns what was true then»),
// folds keep the originals, originals are immutable, provenance is required on every line; recall's cue, keyword,
// embedding and period parts; the dossier's budget. Synthetic entries only — no owner content, no network.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fixture } from "./phase35-storage-fixture.mjs";
import {
  createPersonaMemory, filesStore, postgresStore, sqlRpc, PersonaMemoryError, periodOf, isDateCue, registerHits, localVector, cosine,
  openAIEmbedder, parseDossierFile, renderDossierFile, editedByHand,
} from "../src/lib/persona-memory/index.ts";

const MIGRATION = "202610230101_persona_memory.sql";
const clockAt = (iso) => { const clock = { now: new Date(iso) }; clock.fn = () => clock.now; return clock; };
const invalid = (code = "invalid") => (error) => error instanceof PersonaMemoryError && error.code === code;

/** A synthetic entry about a made-up project («the lantern ledger»), first person, every line tagged. */
const entry = (over = {}) => ({
  title: "The ledger import went green",
  validFrom: "2026-10-10",
  salience: 3,
  cues: ["lantern ledger", "green suite"],
  lines: [{ text: "We finished the lantern ledger import and the suite went green on the second run.", tag: "observed" },
    { text: "The owner seemed relieved more than pleased.", tag: "inferred" }],
  state: [{ text: "I was pulled toward calling it done after the first green run; I ran the build again before saying so.", tag: "observed" }],
  quotes: [{ text: "Run it twice before you tell me.", speaker: "owner" }],
  ...over,
});

let pg = null;
async function postgres() {
  pg ??= await fixture();
  // The registry holds the one owner: each test starts from empty persona tables (deletes are the owner's right; the
  // store itself never deletes).
  await pg.db.exec("delete from persona_memory.episode_notes; delete from persona_memory.episodes; delete from persona_memory.folds; delete from persona_memory.dossier_lines; delete from persona_memory.facts; delete from persona_memory.embeddings;");
  return { store: postgresStore(sqlRpc((sql, params) => pg.db.query(sql, params), pg.owner)), owner: pg.owner };
}
const dirs = [];
async function files() {
  const dir = await mkdtemp(join(tmpdir(), "persona-memory-"));
  dirs.push(dir);
  return { store: filesStore(dir), dir };
}
test.after(async () => { await Promise.all(dirs.map((dir) => rm(dir, { recursive: true, force: true }))); await pg?.db.close(); });

for (const backend of ["files", "postgres"]) {
  const open = async (now = "2026-10-23T09:00:00Z") => {
    const made = backend === "files" ? await files() : await postgres();
    const clock = clockAt(now);
    return { ...made, clock, memory: createPersonaMemory({ store: made.store, now: clock.fn }) };
  };

  test(`${backend}: an episode round-trips with every field, its provenance and its validity`, async () => {
    const { memory } = await open();
    const { episode, warnings } = await memory.remember(entry());
    assert.deepEqual(warnings, []);
    assert.match(episode.id, /^ep_20261010_0000_[0-9a-f]{6}$/);
    const [read] = await memory.journalLatest(1);
    assert.equal(read.id, episode.id);
    for (const field of ["title", "salience", "cues", "lines", "state", "quotes", "source", "validFrom", "validTo", "recordedAt", "originalSha256", "foldedInto"])
      assert.deepEqual(read[field], episode[field], field);
    assert.equal(read.validFrom, "2026-10-10T00:00:00.000Z");
    assert.equal(read.recordedAt, "2026-10-23T09:00:00.000Z");
    assert.equal(read.editedByHand, false);
    assert.deepEqual(read.lines.map((line) => [line.author, line.tag]), [["self", "observed"], ["self", "inferred"]]);
    assert.deepEqual(read.quotes[0], { text: "Run it twice before you tell me.", author: "self", tag: "stated", speaker: "owner" });
    const exported = await memory.exportMarkdown();
    assert.ok(exported.files["journal/2026-10.md"].includes("- [observed · self] We finished the lantern ledger import"));
    assert.ok(exported.files["journal/2026-10.md"].includes("> «Run it twice before you tell me.» — owner [stated · self]"));
    assert.equal(exported.counts.episodes, 1);
  });

  test(`${backend}: provenance is required on every line — no tag, no write`, async () => {
    const { memory } = await open();
    await assert.rejects(memory.remember(entry({ lines: [{ text: "A line with no tag." }] })), (error) => invalid()(error) && error.problems.some((p) => p.includes("lines[0]: tag")));
    await assert.rejects(memory.remember(entry({ lines: ["a bare string"] })), invalid());
    await assert.rejects(memory.remember(entry({ state: [] })), (error) => error.problems.some((p) => p.startsWith("state: at least 1")));
    await assert.rejects(memory.remember(entry({ quotes: [{ text: "Said by the owner.", speaker: "owner", tag: "inferred" }] })), (error) => error.problems.some((p) => p.includes("owner's own words are tagged stated")));
    await assert.rejects(memory.remember(entry({ quotes: [{ text: "My own words.", speaker: "self", tag: "stated" }] })), (error) => error.problems.some((p) => p.includes("stated is only for the owner")));
    await assert.rejects(memory.remember(entry({ quotes: Array.from({ length: 6 }, (_, i) => ({ text: `Line ${i}.`, speaker: "owner" })) })), (error) => error.problems.some((p) => p.includes("at most 5")));
    await assert.rejects(memory.remember(entry({ salience: 6 })), invalid());
    await assert.rejects(memory.addNote("ep_20261010_0000_aaaaaa", { lines: [{ text: "x", tag: "observed" }] }), invalid("not_found"));
    await assert.rejects(memory.dossierAppend([{ section: "rules", text: "No tag on this rule." }]), invalid());
    await assert.rejects(memory.factSet({ key: "project.stage", text: "Untagged fact." }), invalid());
    assert.equal((await memory.journalLatest(5)).length, 0, "nothing invalid was written");
  });

  test(`${backend}: cues are what, never when; the persona's lines keep a working-notebook register`, async () => {
    const { memory } = await open();
    for (const cue of ["2026-10-20", "20 October", "вчера", "в октябре", "last week", "20.10"])
      await assert.rejects(memory.remember(entry({ cues: [cue] })), (error) => error.problems.some((p) => p.includes("is a date")), cue);
    await memory.remember(entry({ cues: ["October rain", "the brass lantern"] }));
    await assert.rejects(memory.remember(entry({ lines: [{ text: "I will miss him when the session ends.", tag: "inferred" }] })), (error) => error.problems.some((p) => p.includes("working notebook")));
    await assert.rejects(memory.remember(entry({ state: [{ text: "Я буду скучать по этим разговорам.", tag: "inferred" }] })), (error) => error.problems.some((p) => p.includes("working notebook")));
    // The owner's exact words are never altered or refused; the import may flag an old entry instead of refusing it.
    await memory.remember(entry({ quotes: [{ text: "I'll miss this project when it is done.", speaker: "owner" }] }));
    const flagged = await memory.remember(entry({ lines: [{ text: "Прощай, старый парсер.", tag: "observed" }] }), { register: "flag" });
    assert.equal(flagged.warnings.length, 1);
  });

  test(`${backend}: asOf returns what was true then — a closed entry, a replaced fact`, async () => {
    const { memory, clock } = await open("2026-10-15T12:00:00Z");
    const { episode } = await memory.remember(entry({ title: "The map renderer is the bottleneck", cues: ["map renderer", "bottleneck"], validFrom: "2026-10-12",
      lines: [{ text: "The map renderer is the slowest step of a turn.", tag: "observed" }] }));
    await memory.factSet({ key: "project.stage", text: "Stage 3 is in progress.", tag: "stated", validFrom: "2026-10-01" }, { author: "background" });
    clock.now = new Date("2026-10-20T08:00:00Z");
    const closed = await memory.addNote(episode.id, { lines: [{ text: "The renderer was rewritten; it is no longer the bottleneck.", tag: "observed" }], closes: "2026-10-19" });
    assert.equal(closed.validTo, "2026-10-19T00:00:00.000Z");
    assert.equal(closed.lines[0].text, "The map renderer is the slowest step of a turn.", "the original text is unchanged");
    assert.equal(closed.notes.length, 1);
    await memory.factSet({ key: "project.stage", text: "Stage 4 is in progress.", tag: "stated", validFrom: "2026-10-18" }, { author: "background" });
    await assert.rejects(memory.factSet({ key: "project.stage", text: "Back-dated.", tag: "stated", validFrom: "2026-10-02" }), invalid());

    const then = await memory.recall("map renderer bottleneck", { asOf: "2026-10-14" });
    assert.deepEqual(then.episodes.map((hit) => hit.episode.id), [episode.id]);
    assert.deepEqual(then.facts, []);
    const stageThen = await memory.recall("project stage", { asOf: "2026-10-14" });
    assert.deepEqual(stageThen.facts.map((fact) => fact.text), ["Stage 3 is in progress."]);
    const now = await memory.recall("map renderer bottleneck");
    assert.deepEqual(now.episodes.map((hit) => hit.episode.id), [episode.id], "without asOf a closed entry is still recalled, with its note");
    assert.deepEqual((await memory.recall("map renderer bottleneck", { asOf: "2026-10-20" })).episodes, [], "not valid on the 20th");
    assert.deepEqual((await memory.facts()).map((fact) => fact.text), ["Stage 4 is in progress."]);
    assert.deepEqual((await memory.facts({ asOf: "2026-10-05" })).map((fact) => fact.text), ["Stage 3 is in progress."]);
    const versions = await memory.facts({ all: true });
    assert.deepEqual(versions.map((fact) => [fact.text, fact.validTo]), [["Stage 3 is in progress.", "2026-10-18T00:00:00.000Z"], ["Stage 4 is in progress.", null]]);
    await assert.rejects(memory.addNote(episode.id, { lines: [{ text: "Closing again.", tag: "observed" }], closes: "2026-10-20" }), invalid());
  });

  test(`${backend}: a fold condenses without destroying — originals kept and marked, the dossier untouched`, async () => {
    const { memory, clock } = await open("2026-10-23T09:00:00Z");
    const ids = [];
    for (const [day, salience] of [["2026-10-01", 2], ["2026-10-02", 3], ["2026-10-03", 5], ["2026-10-04", 1], ["2026-10-09", 2]])
      ids.push((await memory.remember(entry({ validFrom: day, salience, title: `Routine day ${day}`, cues: [`routine ${day.slice(-2)}`, "lantern ledger"] }))).episode.id);
    await memory.dossierAppend([{ section: "rules", text: "Run it twice before reporting green.", tag: "stated" }]);
    const dossierBefore = await memory.store.dossier();
    await assert.rejects(memory.fold({ summary: [{ text: "Nothing named.", tag: "observed" }] }), (error) => error.problems.some((p) => p.includes("never automatic")));
    clock.now = new Date("2026-10-23T10:00:00Z");
    const fold = await memory.fold({ from: "2026-10-01", to: "2026-10-04", summary: [{ text: "Early October: the ledger import, routine days, green twice each time.", tag: "inferred" }], cues: ["early ledger days"] });
    assert.deepEqual(fold.episodeIds, [ids[0], ids[1], ids[3]], "the range takes unfolded entries up to salience 3; the salience-5 day stays whole");
    const after = await memory.journalLatest(10);
    assert.equal(after.length, 5, "a fold never deletes");
    for (const episode of after) {
      assert.equal(episode.foldedInto, fold.episodeIds.includes(episode.id) ? fold.id : null);
      assert.equal(episode.editedByHand, false, "the originals are intact");
      assert.equal(episode.lines[0].text, entry().lines[0].text);
    }
    assert.deepEqual(await memory.store.dossier(), dossierBefore, "a fold never touches the self-dossier");
    await assert.rejects(memory.fold({ ids: [ids[0], ids[4]], summary: [{ text: "Again.", tag: "observed" }] }), (error) => error.problems.some((p) => p.includes("already folded")));
    // The store refuses a double fold even when the library's check is bypassed (two writers).
    await assert.rejects(memory.store.insertFold({ ...fold, id: "fold_20261023_1000_ffffff" }), invalid("conflict"));
    const recalled = await memory.recall("lantern ledger routine", { k: 5 });
    const folded = recalled.episodes.find((hit) => hit.episode.id === ids[0]);
    assert.equal(folded.fold.id, fold.id, "a folded original is recalled with its fold");
    assert.ok(recalled.folds.some((f) => f.id === fold.id));
    const exported = await memory.exportMarkdown();
    assert.ok(exported.files["folds.md"].includes(fold.id));
    assert.ok(exported.files["journal/2026-10.md"].includes(`Folded into \`${fold.id}\``));
  });

  test(`${backend}: recall is hybrid — cues, words (Russian endings too), similarity, salience — and time-aware`, async () => {
    const { memory } = await open("2026-10-23T09:00:00Z");
    const lantern = (await memory.remember(entry({ validFrom: "2026-10-05", salience: 2, cues: ["brass lantern"], title: "Lantern",
      lines: [{ text: "The brass lantern scene finally rendered at the right size.", tag: "observed" }] }))).episode.id;
    const journal = (await memory.remember(entry({ validFrom: "2026-10-16", salience: 4, cues: ["журнал", "провенанс"], title: "Журнал",
      lines: [{ text: "Мы договорились вести журнал от первого лица; каждая строка с меткой.", tag: "observed" }],
      state: [{ text: "Тянуло написать красиво; написал коротко.", tag: "observed" }] }))).episode.id;
    const quiet = (await memory.remember(entry({ validFrom: "2026-10-21", salience: 5, cues: ["quiet evening"], title: "Quiet",
      lines: [{ text: "A quiet evening of reading old notes; nothing shipped.", tag: "observed" }] }))).episode.id;

    assert.equal((await memory.recall("the lantern")).episodes[0].episode.id, lantern);
    const russian = await memory.recall("что мы решили про журналом и метки");
    assert.equal(russian.episodes[0].episode.id, journal, "«журналом» meets the cue «журнал»");
    assert.ok(russian.episodes[0].why.cue > 0 && russian.episodes[0].why.embedding > 0);
    assert.ok(!russian.episodes.some((hit) => hit.episode.id === quiet), "an unrelated entry is not filler");
    const october = await memory.recall("что было в октябре", { k: 10 });
    assert.equal(october.period.label, "октябре");
    assert.deepEqual(october.episodes.map((hit) => hit.episode.id), [quiet, journal, lantern], "a period alone ranks by salience, then recency");
    const lastWeek = await memory.recall("what happened last week");
    assert.deepEqual(lastWeek.episodes.map((hit) => hit.episode.id), [journal], "last week = 12–18 October");
    assert.deepEqual((await memory.recall("lantern last week")).episodes, [], "the lantern was not last week");
    assert.equal((await memory.recall("zebra hyperdrive")).episodes.length, 0);
    const hit = (await memory.recall("brass lantern")).episodes[0];
    assert.deepEqual(Object.keys(hit.episode).filter((key) => ["lines", "quotes", "state", "notes"].includes(key)).sort(), ["lines", "notes", "quotes", "state"], "hits carry the exact lines");
  });

  test(`${backend}: the dossier is appended rarely, superseded lines are closed, and the rules survive any budget`, async () => {
    const { memory, clock } = await open("2026-10-20T09:00:00Z");
    const [rule, lean] = await memory.dossierAppend([
      { section: "rules", text: "Never report green before the second run.", tag: "stated" },
      { section: "identity", text: "I lean toward the measured thing over the shiny thing.", tag: "inferred" },
    ]);
    const refs = Array.from({ length: 30 }, (_, i) => ({ section: "references", text: `Running reference number ${i}: the lantern that would not light, the ledger that would not balance.`, tag: "observed" }));
    await memory.dossierAppend(refs);
    clock.now = new Date("2026-10-22T09:00:00Z");
    const [newLean] = await memory.dossierAppend([{ section: "identity", text: "I lean toward finishing over starting.", tag: "inferred", supersedes: lean.id }]);
    await assert.rejects(memory.dossierAppend([{ section: "identity", text: "Twice.", tag: "inferred", supersedes: lean.id }]), invalid());
    const view = await memory.dossierRead({ budgetTokens: 200 });
    assert.ok(view.lines.some((line) => line.id === rule.id), "the standing rules are never dropped");
    assert.ok(view.lines.some((line) => line.id === newLean.id));
    assert.ok(!view.lines.some((line) => line.id === lean.id), "a superseded line is not current");
    assert.ok(view.dropped.length > 0 && view.dropped.every((d) => d.section === "references"), "the budget drops the references first and names them");
    assert.ok(view.text.includes("left out by the 200-token budget"));
    const then = await memory.dossierRead({ asOf: "2026-10-21" });
    assert.ok(then.lines.some((line) => line.id === lean.id) && !then.lines.some((line) => line.id === newLean.id), "asOf reads the dossier as it was");
    const all = await memory.store.dossier();
    assert.equal(all.find((line) => line.id === lean.id).validTo, "2026-10-22T09:00:00.000Z", "closed, not deleted");
    assert.ok((await memory.exportMarkdown()).files["dossier.md"].includes("Closed lines"));
  });
}

test("files: the store is plain files the owner can read — one JSON per episode, a markdown dossier; a hand edit is visible, not refused", async () => {
  const { store, dir } = await files();
  const memory = createPersonaMemory({ store, now: clockAt("2026-10-23T09:00:00Z").fn });
  const { episode } = await memory.remember(entry());
  await memory.dossierAppend([{ section: "voice", text: "Short answers, the reason first.", tag: "inferred" }]);
  const path = join(dir, "episodes", `${episode.id}.json`);
  const stored = JSON.parse(await readFile(path, "utf8"));
  assert.equal(stored.lines[0].text, entry().lines[0].text);
  const dossier = await readFile(join(dir, "dossier.md"), "utf8");
  assert.match(dossier, /^- \[inferred · self\] Short answers, the reason first\. <!-- id=dl_/m);
  assert.deepEqual(parseDossierFile(renderDossierFile(parseDossierFile(dossier))), parseDossierFile(dossier), "the dossier file round-trips");
  await writeFile(path, JSON.stringify({ ...stored, lines: [{ ...stored.lines[0], text: "Edited by the owner." }, stored.lines[1]] }));
  const [read] = await memory.journalLatest(1);
  assert.equal(read.lines[0].text, "Edited by the owner.", "the owner's edit stands");
  assert.equal(read.editedByHand, true);
  assert.ok((await memory.exportMarkdown()).files["journal/2026-10.md"].includes("Edited by hand after recording"));
  await writeFile(join(dir, "episodes", "ep_20261001_0000_badbad.json"), "{ not json");
  await memory.journalLatest(5);
  assert.ok((await memory.exportMarkdown()).files["README.md"].includes("episodes/ep_20261001_0000_badbad.json"), "an unreadable file is named, not silently dropped");
  await rm(join(dir, "episodes", "ep_20261001_0000_badbad.json"));
  assert.ok(!(await memory.exportMarkdown()).files["README.md"].includes("badbad"), "and leaves the list once it is gone");
  // A file stripped of its lists by hand still reads, flagged as edited.
  await writeFile(path, JSON.stringify({ id: stored.id, validFrom: stored.validFrom, lines: stored.lines }));
  const [stripped] = await memory.journalLatest(1);
  assert.deepEqual([stripped.notes, stripped.quotes, stripped.editedByHand], [[], [], true]);
  await assert.doesNotReject(memory.recall("lantern ledger"), "recall reads it");
  // A line the owner writes into the dossier by hand is read as the owner's own words, and keeps its id.
  await writeFile(join(dir, "dossier.md"), `${await readFile(join(dir, "dossier.md"), "utf8")}\n- Ask before renaming anything.\n`);
  const owned = (await memory.store.dossier()).find((line) => line.text === "Ask before renaming anything.");
  assert.deepEqual([owned.author, owned.tag, owned.section], ["owner", "stated", "voice"]);
  await memory.dossierAppend([{ section: "rules", text: "A later rule.", tag: "inferred" }]);
  assert.ok((await memory.store.dossier()).some((line) => line.id === owned.id && line.author === "owner"), "the next write gives it its comment, same id");
});

test("postgres: the migration keeps the invariants itself — immutable originals, append-only notes and folds, provenance checks, service_role only", async () => {
  const { store, owner } = await postgres();
  const memory = createPersonaMemory({ store, now: clockAt("2026-10-23T09:00:00Z").fn });
  assert.ok(pg.files.includes(MIGRATION) && pg.files.at(-1) === MIGRATION);
  const { episode } = await memory.remember(entry());
  await assert.rejects(pg.query("update persona_memory.episodes set lines=$2::jsonb where id=$1", [episode.id, JSON.stringify([{ text: "Rewritten.", author: "self", tag: "observed" }])]), /persona_immutable/);
  await assert.rejects(pg.query("update persona_memory.episodes set salience=5 where id=$1", [episode.id]), /persona_immutable/);
  await memory.addNote(episode.id, { lines: [{ text: "Re-read a week later; still true.", tag: "observed" }] });
  await assert.rejects(pg.query("update persona_memory.episode_notes set lines='[]'::jsonb"), /persona_immutable/);
  const bad = { ...episode, id: "ep_20261010_0000_bbbbbb", lines: [{ text: "No tag here.", author: "self" }] };
  await assert.rejects(store.insertEpisode(bad), invalid());
  await assert.rejects(store.insertEpisode({ ...episode, id: "ep_20261010_0000_cccccc", quotes: [{ text: "Owner, not stated.", author: "self", tag: "observed", speaker: "owner" }] }), invalid());
  await assert.rejects(store.insertEpisode({ ...episode, id: "ep_20261010_0000_dddddd", cues: ["2026-10-10"] }), invalid());
  await assert.rejects(store.insertEpisode(episode), invalid("conflict"), "an id is written once");
  const [line] = await memory.dossierAppend([{ section: "rules", text: "One rule.", tag: "stated" }]);
  await assert.rejects(pg.query("update persona_memory.dossier_lines set text='Changed.' where id=$1", [line.id]), /persona_immutable/);
  await assert.rejects(sqlRpc((sql, params) => pg.db.query(sql, params), randomUUID())("episodes.list", {}), /persona_forbidden/, "an unregistered owner is refused");
  const grants = await pg.query("select grantee, privilege_type from information_schema.routine_privileges where routine_name='persona_memory' and grantee in ('anon','authenticated','service_role')");
  assert.deepEqual(grants.map((row) => row.grantee), ["service_role"]);
  const tableGrants = await pg.query("select grantee from information_schema.table_privileges where table_schema='persona_memory' and grantee in ('anon','authenticated')");
  assert.deepEqual(tableGrants, []);
  void owner;
});

test("text: periods are found in English and Russian; «may» alone is not May; dates are not cues", () => {
  const now = new Date("2026-10-23T09:00:00Z");
  assert.equal(periodOf("what did we do on 2026-10-20?", now).period.from, "2026-10-20T00:00:00.000Z");
  assert.deepEqual(periodOf("20 октября", now).period, { from: "2026-10-20T00:00:00.000Z", to: "2026-10-21T00:00:00.000Z", label: "20 октября" });
  assert.equal(periodOf("October 5, 2025", now).period.from, "2025-10-05T00:00:00.000Z");
  assert.equal(periodOf("in December", now).period.from, "2025-12-01T00:00:00.000Z", "a month without a year is its latest past one");
  assert.equal(periodOf("may I ask about the map", now), null);
  assert.equal(periodOf("вчера", now).period.from, "2026-10-22T00:00:00.000Z");
  assert.equal(periodOf("на прошлой неделе про карту", now).rest, "про карту");
  assert.equal(periodOf("3 days ago", now).period.from, "2026-10-20T00:00:00.000Z");
  assert.ok(isDateCue("20-го октября") && isDateCue("Tuesday") && !isDateCue("the October rain") && !isDateCue("sun on the lantern"));
  assert.deepEqual(registerHits("I closed the ticket and ran the build."), []);
  assert.ok(registerHits("Goodbye, my friend").length && registerHits("Буду скучать").length);
  assert.ok(cosine(localVector("журнал от первого лица"), localVector("журналом от первого лица")) > 0.6);
  assert.ok(cosine(localVector("журнал"), localVector("zebra hyperdrive")) < 0.2);
});

test("embeddings: an optional provider embedder is called once per content (cached by the store), with the key only in its header", async () => {
  const { store } = await files();
  const calls = [];
  const fetcher = async (url, init) => {
    calls.push({ url, auth: init.headers.authorization, inputs: JSON.parse(init.body).input.length });
    const inputs = JSON.parse(init.body).input;
    return new Response(JSON.stringify({ data: inputs.map((text, index) => ({ index, embedding: localVector(text, 64) })) }), { status: 200 });
  };
  const memory = createPersonaMemory({ store, embedder: openAIEmbedder({ apiKey: "sk-test-synthetic", fetcher }), now: clockAt("2026-10-23T09:00:00Z").fn });
  await memory.remember(entry());
  await memory.remember(entry({ validFrom: "2026-10-11", cues: ["second entry"] }));
  await memory.recall("lantern ledger");
  await memory.recall("green suite");
  assert.deepEqual(calls.map((call) => call.inputs), [1, 2, 1], "a query each time; the two episodes once, then from the store's cache");
  assert.ok(calls.every((call) => call.url === "https://api.openai.com/v1/embeddings" && call.auth === "Bearer sk-test-synthetic"));
  const failing = createPersonaMemory({ store, embedder: openAIEmbedder({ apiKey: "sk-test-synthetic", fetcher: async () => new Response("{}", { status: 401 }) }) });
  await assert.rejects(failing.recall("lantern"), (error) => !String(error.message).includes("sk-test"));
  assert.equal(editedByHand((await memory.journalLatest(1))[0]), false);
});
