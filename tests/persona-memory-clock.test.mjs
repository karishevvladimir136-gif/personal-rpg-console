// Persona memory 2, Part E (docs/stages/PERSONA_MEMORY_2.md): the clock with a memory, on both backends (the plain
// files and Postgres — migrations 202610230101–0102 on PGlite). Elapsed arithmetic across zones and a daylight-saving
// change; a finish without a start is refused; the calibration table is append-only and the export shows it; persona_now
// reads the last entry, the last session and the running timers. Synthetic content only — no owner data, no network.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fixture } from "./phase35-storage-fixture.mjs";
import {
  createPersonaMemory, filesStore, postgresStore, sqlRpc, PersonaMemoryError, durationWords, parseDuration, parseMoment, wallClockToInstant, localWords,
  localIso, offsetMinutes, sessionsOf, rowEditedByHand,
} from "../src/lib/persona-memory/index.ts";
import { PERSONA_TOOLS, SERVER_INSTRUCTIONS, callTool } from "../src/lib/persona-memory/tools.ts";
import { calibrationPair, planImport, applyImport } from "../src/lib/persona-memory/import.ts";

const CLOCK_MIGRATION = "202610230102_persona_clock.sql";
const clockAt = (iso) => { const clock = { now: new Date(iso) }; clock.fn = () => clock.now; return clock; };
const refused = (code) => (error) => error instanceof PersonaMemoryError && error.code === code;
const MIN = 60_000;

let pg = null;
async function postgres() {
  pg ??= await fixture();
  // The calibration table refuses a row-level delete (it only grows): the tests start clean with a truncate, the
  // owner's own lever, which the RPC does not have.
  await pg.db.exec("truncate persona_memory.calibration, persona_memory.timers; delete from persona_memory.episode_notes; delete from persona_memory.episodes; delete from persona_memory.folds; delete from persona_memory.dossier_lines; delete from persona_memory.facts;");
  return postgresStore(sqlRpc((sql, params) => pg.db.query(sql, params), pg.owner));
}
const dirs = [];
async function files() {
  const dir = await mkdtemp(join(tmpdir(), "persona-clock-"));
  dirs.push(dir);
  return { store: filesStore(dir), dir };
}
test.after(async () => { await Promise.all(dirs.map((dir) => rm(dir, { recursive: true, force: true }))); await pg?.db.close(); });

test("time: wall clocks in zones, a daylight-saving change, durations in plain words", () => {
  // Moscow is UTC+3 all year; Berlin leaves summer time on 2026-10-25 at 03:00 local (01:00 UTC).
  assert.equal(wallClockToInstant(2026, 10, 23, 18, 0, "Europe/Moscow"), Date.parse("2026-10-23T15:00:00Z"));
  assert.equal(offsetMinutes(Date.parse("2026-10-24T12:00:00Z"), "Europe/Berlin"), 120);
  assert.equal(offsetMinutes(Date.parse("2026-10-25T12:00:00Z"), "Europe/Berlin"), 60);
  assert.equal(wallClockToInstant(2026, 10, 25, 4, 0, "Europe/Berlin"), Date.parse("2026-10-25T03:00:00Z"));
  assert.equal(wallClockToInstant(2026, 10, 25, 2, 30, "Europe/Berlin"), Date.parse("2026-10-25T01:30:00Z"), "a time that happens twice takes the later reading");
  assert.equal(wallClockToInstant(2026, 3, 29, 2, 30, "Europe/Berlin"), Date.parse("2026-03-29T01:30:00Z"), "a skipped time moves forward by the gap (03:30 summer time)");
  assert.equal(localWords("2026-10-23T15:05:00Z", "Europe/Moscow"), "Friday 2026-10-23 18:05 (UTC+03:00)");
  assert.equal(localIso("2026-10-23T15:05:00Z", "America/New_York"), "2026-10-23T11:05:00-04:00");
  assert.equal(localWords("2026-10-23T15:05:00Z", "Europe/Moscow", { sameDayAs: Date.parse("2026-10-23T05:00:00Z") }), "18:05 (UTC+03:00)");
  assert.deepEqual([0, 30_000, 45 * MIN, 82 * MIN, 180 * MIN, 27 * 60 * MIN, 9 * 1440 * MIN].map(durationWords),
    ["under a minute", "1 min", "45 min", "1 h 22 min", "3 h", "1 day 3 h", "9 days"]);
  assert.deepEqual(["90 min", "1 h 30 min", "1.5 hours", "2h", "PT1H30M", "1 ч 30 мин", "1,5 ч", "3 days", "2 h and 15 min"].map(parseDuration), [90, 90, 90, 120, 90, 90, 90, 4320, 135]);
  assert.deepEqual(["soon", "90", "2 lightyears", ""].map(parseDuration), [null, null, null, null]);
  const problems = [];
  const base = Date.parse("2026-10-23T20:00:00Z"); // 23:00 in Moscow
  const ctx = { zone: "Europe/Moscow", base, direction: "next", durations: true };
  assert.equal(parseMoment("01:30", "t", ctx, problems), Date.parse("2026-10-23T22:30:00Z"), "«01:30» is the next one — after midnight on the owner's clock");
  assert.equal(parseMoment("in 90 min", "t", ctx, problems), base + 90 * MIN);
  assert.equal(parseMoment("2026-10-24T09:00", "t", ctx, problems), Date.parse("2026-10-24T06:00:00Z"), "no offset: the owner's wall clock");
  assert.equal(parseMoment("2026-10-24T09:00+00:00", "t", ctx, problems), Date.parse("2026-10-24T09:00:00Z"), "an offset is taken as given");
  assert.equal(parseMoment("22:15", "t", { ...ctx, direction: "previous" }, problems), Date.parse("2026-10-23T19:15:00Z"), "an actual finish is the latest such time");
  assert.deepEqual(problems, []);
  assert.equal(parseMoment("2026-10-24", "t", ctx, problems), null);
  assert.match(problems[0], /a date without a time/);
});

for (const backend of ["files", "postgres"]) {
  const open = async (now, timeZone = "Europe/Moscow") => {
    const store = backend === "files" ? (await files()).store : await postgres();
    const clock = clockAt(now);
    return { store, clock, memory: createPersonaMemory({ store, now: clock.fn, timeZone }) };
  };

  test(`${backend}: a timer measures elapsed time on instants — across midnight on the owner's clock, and across a daylight-saving change`, async () => {
    // 23:30 in Moscow; the prediction «01:00» is the next 01:00 on the owner's clock, ninety minutes later.
    const { memory, clock } = await open("2026-10-23T20:30:00Z");
    const started = await memory.timerStart({ name: "the receipt-date parser", predictedFinish: "01:00", note: { text: "The day-first test first, then the parser.", tag: "inferred" } });
    assert.equal(started.timer.predictedFinish, "2026-10-23T22:00:00.000Z");
    assert.equal(started.timer.timeZone, "Europe/Moscow");
    clock.now = new Date("2026-10-23T21:52:00Z");
    const [early] = (await memory.timerCheck("The Receipt-Date Parser")).running;
    assert.equal(early.text, "1 h 22 min elapsed; prediction not yet due (8 min left of the predicted 1 h 30 min, due 01:00 (UTC+03:00))", "00:52 now, due 01:00 the same day");
    clock.now = new Date("2026-10-23T22:40:00Z");
    assert.match((await memory.timerCheck()).running[0].text, /^2 h 10 min elapsed; 40 min past the prediction \(predicted 1 h 30 min/);
    const { row } = await memory.timerFinish({ name: "the receipt-date parser", actualFinish: "01:25", note: { text: "The parser change was one line; the test fixtures took the time.", tag: "observed" } });
    assert.deepEqual([row.predictedMinutes, row.actualMinutes, row.actualFinish], [90, 115, "2026-10-23T22:25:00.000Z"]);
    assert.equal(row.text, "«the receipt-date parser»: predicted 1 h 30 min, took 1 h 55 min — 25 min over (1.28× the estimate)");
    assert.deepEqual([row.tag, row.author, row.notes.length], ["observed", "self", 2]);

    // Berlin, the night summer time ends: 01:30 CEST → 04:00 CET is three and a half hours, not two and a half.
    const berlin = await open("2026-10-24T23:30:00Z", "Europe/Berlin");
    const night = await berlin.memory.timerStart({ name: "the overnight import", predictedFinish: "2026-10-25T04:00" });
    assert.equal(night.predictedMs, 210 * MIN);
    berlin.clock.now = new Date("2026-10-25T03:10:00Z"); // 04:10 CET
    const { row: overnight } = await berlin.memory.timerFinish({ name: "the overnight import" });
    assert.deepEqual([overnight.predictedMinutes, overnight.actualMinutes], [210, 220]);
    assert.match(overnight.text, /predicted 3 h 30 min, took 3 h 40 min — 10 min over/);
  });

  test(`${backend}: a finish without a start is refused; a second running timer of the same name is refused; an impossible actual is refused`, async () => {
    const { memory, clock, store } = await open("2026-10-23T09:00:00Z");
    await assert.rejects(memory.timerFinish({ name: "never started" }), (error) => refused("not_found")(error) && /only after persona_timer_start \(no timer is running\)/.test(error.message));
    await memory.timerStart({ name: "map tiles", predictedFinish: "45 min" });
    await assert.rejects(memory.timerStart({ name: "Map  Tiles", predictedFinish: "1 h" }), (error) => refused("invalid")(error) && /already running/.test(error.message));
    await assert.rejects(memory.timerStart({ name: "no estimate" }), refused("invalid"));
    await assert.rejects(memory.timerStart({ name: "in the past", predictedFinish: "2026-10-23T08:00:00Z" }), (error) => /after the start/.test(error.message));
    await assert.rejects(memory.timerStart({ name: "untagged note", predictedFinish: "1 h", note: { text: "No tag." } }), (error) => /tag must be one of/.test(error.message));
    await assert.rejects(memory.timerFinish({ name: "nothing like it" }), (error) => /running: «map tiles»/.test(error.message));
    clock.now = new Date("2026-10-23T09:30:00Z");
    await assert.rejects(memory.timerFinish({ name: "map tiles", actualFinish: "2026-10-23T08:59:00Z" }), (error) => /before the timer started/.test(error.message));
    await assert.rejects(memory.timerFinish({ name: "map tiles", actualFinish: "2026-10-23T10:30:00Z" }), (error) => /in the future/.test(error.message));
    const { timer, row } = await memory.timerFinish({ name: "map tiles" });
    await assert.rejects(memory.timerFinish({ name: "map tiles" }), refused("not_found"), "finished once");
    // The store refuses a second close even when the library's check is bypassed (two writers).
    await assert.rejects(store.finishTimer(timer.id, timer.finishedAt, { ...row, id: "cal_20261023_0930_ffffff" }), refused("conflict"));
    assert.equal((await memory.calibrationRead()).rows.length, 1);
    const finished = await memory.timerCheck("map tiles");
    assert.equal(finished.finished.id, row.id, "a finished timer's name gives its row");
    await assert.rejects(memory.timerCheck("never was"), refused("not_found"));
  });

  test(`${backend}: the calibration table only grows — rows are never rewritten, a miss stays, the export shows it`, async () => {
    const { memory, clock, store } = await open("2026-10-20T07:00:00Z");
    const estimates = [["the backup restore test", "1 h", 150], ["the colour options", "30 min", 25], ["the day-first fixtures", "2 h", 300]];
    for (const [name, predicted, minutes] of estimates) {
      await memory.timerStart({ name, predictedFinish: predicted });
      clock.now = new Date(clock.now.getTime() + minutes * MIN);
      await memory.timerFinish({ name });
      clock.now = new Date(clock.now.getTime() + 60 * MIN);
    }
    const { rows, summary, text } = await memory.calibrationRead();
    assert.deepEqual(rows.map((row) => [row.name, row.predictedMinutes, row.actualMinutes]), [["the backup restore test", 60, 150], ["the colour options", 30, 25], ["the day-first fixtures", 120, 300]]);
    assert.deepEqual([summary.rows, summary.medianRatio, summary.over, summary.under, summary.onTime], [3, 2.5, 2, 1, 0]);
    assert.match(text, /3 timed estimates: median actual ÷ predicted 2\.50×; 2 ran over, 1 under, 0 on time/);
    assert.match(text, /\| the backup restore test \| 1 h \| 2 h 30 min \| \+1 h 30 min \| 2\.50 \|/);
    assert.ok(rows.every((row) => !rowEditedByHand(row)), "the rows read back exactly as recorded");

    // Later rows never touch earlier ones; there is no tool or store call that edits or removes a row.
    const before = JSON.stringify(rows);
    await memory.timerStart({ name: "one more", predictedFinish: "10 min" });
    clock.now = new Date(clock.now.getTime() + 12 * MIN);
    await memory.timerFinish({ name: "one more" });
    assert.equal(JSON.stringify((await memory.calibrationRead()).rows.slice(0, 3)), before);
    assert.ok(!PERSONA_TOOLS.some((tool) => /calibration_(?:write|edit|delete|append)|timer_(?:edit|delete)/.test(tool.name)), "no tool writes the table but timer_finish");
    assert.deepEqual(Object.keys(store).filter((key) => /calibration/i.test(key)).sort(), ["appendCalibration", "calibration"], "the store only lists and appends rows");

    const exported = await memory.exportMarkdown();
    assert.equal(exported.counts.calibration, 4);
    assert.ok(exported.files["calibration.md"].includes("predicted vs actual") && exported.files["calibration.md"].includes("the day-first fixtures"));
    assert.ok(exported.text.includes("# Calibration — predicted vs actual"), "the whole export includes the table");
    assert.match((await callTool(memory, "persona_export", { part: "calibration" })).text, /^# Calibration/);
    const seed = await memory.calibrationSeed({ name: "an imported estimate", predictedMinutes: 60, actualMinutes: 90, sourceLine: "Predicted 1 h, took 1 h 30 min.", source: "import:areas/time-sense.md#x" });
    await assert.rejects(store.appendCalibration(seed), refused("conflict"), "a row id is written once");
  });

  test(`${backend}: persona_now — the time on the owner's clock, since the last entry, the last session, the running timers`, async () => {
    const { memory, clock } = await open("2026-10-21T16:40:00Z");
    // An evening session on the 21st (19:40–22:10 Moscow): an entry, a fact, a note.
    const { episode } = await memory.remember({ title: "The day-first dates", validFrom: "2026-10-21T16:40:00Z", salience: 4, cues: ["day-first dates"],
      lines: [{ text: "We stopped in the middle of the receipt dates.", tag: "observed" }], state: [{ text: "I was pulled toward patching the parser first; I wrote the test plan instead.", tag: "observed" }] });
    clock.now = new Date("2026-10-21T18:00:00Z");
    await memory.factSet({ key: "project.stage", text: "The receipt importer.", tag: "observed" });
    clock.now = new Date("2026-10-21T19:10:00Z");
    await memory.addNote(episode.id, { lines: [{ text: "The test plan is written.", tag: "observed" }] });
    clock.now = new Date("2026-10-23T06:05:00Z"); // Friday 09:05 in Moscow
    const fresh = await memory.now();
    assert.equal(fresh.local, "2026-10-23T09:05:00+03:00");
    assert.equal(fresh.currentSession, null, "nothing written yet this session");
    assert.deepEqual([fresh.lastSession.from, fresh.lastSession.to, fresh.lastSession.writes], ["2026-10-21T16:40:00.000Z", "2026-10-21T19:10:00.000Z", 3]);
    assert.ok(fresh.text.includes("Now: Friday 2026-10-23 09:05 (UTC+03:00) — the owner's zone Europe/Moscow"));
    assert.ok(fresh.text.includes("Last journal entry: «The day-first dates», Wednesday 2026-10-21 19:40 (UTC+03:00) — 1 day 13 h ago."));
    assert.ok(fresh.text.includes("Last session: Wednesday 2026-10-21 19:40 (UTC+03:00) → 22:10 (UTC+03:00) (2 h 30 min, 3 writes); it ended 1 day 10 h ago."));
    assert.ok(fresh.text.includes("No timer is running.") && fresh.text.includes("The calibration table is empty"));

    await memory.timerStart({ name: "the failing day-first test", predictedFinish: "40 min" });
    clock.now = new Date("2026-10-23T06:30:00Z");
    const later = await memory.now();
    assert.equal(later.currentSession.from, "2026-10-23T06:05:00.000Z", "the timer's start opened this session");
    assert.match(later.text, /This session: writing since 09:05 \(UTC\+03:00\) \(25 min ago\)\./);
    assert.match(later.text, /- «the failing day-first test»: 25 min elapsed; prediction not yet due \(15 min left of the predicted 40 min/);
    assert.equal(later.lastSession.to, "2026-10-21T19:10:00.000Z", "the last session is the one before this one");
  });
}

test("sessions are read from write times: a gap of three hours or more ends one", () => {
  const sessions = sessionsOf(["2026-10-21T10:00:00Z", "2026-10-21T12:59:00Z", "2026-10-21T16:00:00Z", "2026-10-21T15:59:59Z", "2026-10-30T00:00:00Z"], Date.parse("2026-10-22T00:00:00Z"));
  assert.deepEqual(sessions, [{ from: "2026-10-21T10:00:00.000Z", to: "2026-10-21T12:59:00.000Z", writes: 2 }, { from: "2026-10-21T15:59:59.000Z", to: "2026-10-21T16:00:00.000Z", writes: 2 }],
    "a time in the future is ignored");
});

test("files: the table is a plain append-only file; a hand edit stays visible; a crash between the row and the timer heals on read", async () => {
  const { store, dir } = await files();
  const clock = clockAt("2026-10-23T09:00:00Z");
  const memory = createPersonaMemory({ store, now: clock.fn, timeZone: "UTC" });
  await memory.timerStart({ name: "first", predictedFinish: "1 h" });
  clock.now = new Date("2026-10-23T10:30:00Z");
  await memory.timerFinish({ name: "first" });
  const path = join(dir, "calibration.jsonl");
  const firstLine = (await readFile(path, "utf8")).split("\n")[0];
  await memory.timerStart({ name: "second", predictedFinish: "1 h" });
  clock.now = new Date("2026-10-23T11:00:00Z");
  await memory.timerFinish({ name: "second" });
  const text = await readFile(path, "utf8");
  assert.equal(text.split("\n")[0], firstLine, "the first row is byte for byte what it was");
  assert.equal(text.trim().split("\n").length, 2);
  // The owner may edit the file (the owner's right): the row then shows as edited by hand, and is still read.
  const edited = JSON.parse(firstLine);
  await writeFile(path, `${JSON.stringify({ ...edited, actualMinutes: 61 })}\n${text.split("\n")[1]}`);
  const rows = (await memory.calibrationRead()).rows;
  assert.deepEqual(rows.map((row) => rowEditedByHand(row)), [true, false]);
  assert.match((await memory.exportMarkdown()).files["calibration.md"], /edited by hand/);
  await memory.timerStart({ name: "third", predictedFinish: "1 h" });
  clock.now = new Date("2026-10-23T11:20:00Z");
  await memory.timerFinish({ name: "third" });
  assert.equal((await readFile(path, "utf8")).trim().split("\n").length, 3, "the append after a hand edit without a final newline starts a new line");
  // A row written but its timer left running (a crash between the two writes): the timer reads as finished.
  const timers = JSON.parse(await readFile(join(dir, "timers.json"), "utf8"));
  await writeFile(join(dir, "timers.json"), JSON.stringify(timers.map((timer) => (timer.name === "third" ? { ...timer, finishedAt: null } : timer))));
  assert.equal((await memory.timerCheck()).running.length, 0);
  await writeFile(path, `${await readFile(path, "utf8")}{ not json\n`);
  await memory.calibrationRead();
  assert.match((await memory.exportMarkdown()).files["README.md"], /calibration\.jsonl line 4/, "an unreadable line is named, not dropped");
});

test("postgres: the migration keeps the clock's invariants — a timer closes once, a row is never updated or deleted, service_role only", async () => {
  const store = await postgres();
  assert.ok(pg.files.includes(CLOCK_MIGRATION));
  const clock = clockAt("2026-10-23T09:00:00Z");
  const memory = createPersonaMemory({ store, now: clock.fn, timeZone: "UTC" });
  const { timer } = await memory.timerStart({ name: "a migration on a copy", predictedFinish: "20 min" });
  await assert.rejects(pg.query("update persona_memory.timers set predicted_finish=predicted_finish + interval '1 hour' where id=$1", [timer.id]), /persona_immutable/);
  clock.now = new Date("2026-10-23T09:35:00Z");
  const { row } = await memory.timerFinish({ name: "a migration on a copy" });
  await assert.rejects(pg.query("update persona_memory.timers set finished_at=now() where id=$1", [timer.id]), /persona_immutable/, "closed once");
  await assert.rejects(pg.query("update persona_memory.calibration set actual_minutes=20 where id=$1", [row.id]), /persona_immutable/);
  await assert.rejects(pg.query("delete from persona_memory.calibration where id=$1", [row.id]), /persona_immutable/, "a miss is never forgotten");
  await assert.rejects(store.appendCalibration({ ...row, id: "cal_20261023_0935_eeeeee" }), refused("invalid"), "a seeded row has no timer");
  await assert.rejects(pg.query("select public.persona_clock($1,'clock.calibration.delete','{}'::jsonb)", [pg.owner]), /persona_validation/, "the RPC has no way to remove a row");
  const [read] = await store.calibration();
  assert.deepEqual(read, row, "the row reads back exactly — numbers, instants, notes");
  assert.equal(rowEditedByHand(read), false);
  const grants = await pg.query("select grantee from information_schema.routine_privileges where routine_name='persona_clock' and grantee in ('anon','authenticated','service_role')");
  assert.deepEqual(grants.map((g) => g.grantee), ["service_role"]);
  const tableGrants = await pg.query("select grantee from information_schema.table_privileges where table_schema='persona_memory' and table_name in ('timers','calibration') and grantee in ('anon','authenticated')");
  assert.deepEqual(tableGrants, []);
});

test("the tools: persona_now and the timers over callTool; the instructions name the calibration rule; nothing written as the owner", async () => {
  const { store } = await files();
  const clock = clockAt("2026-10-23T09:00:00Z");
  const memory = createPersonaMemory({ store, now: clock.fn, timeZone: "Europe/Moscow" });
  for (const phrase of ["persona_now", "before estimating any duration, call persona_calibration_read", "persona_timer_start", "persona_timer_finish", "a miss stays on record"])
    assert.ok(SERVER_INSTRUCTIONS.includes(phrase), phrase);
  assert.ok(SERVER_INSTRUCTIONS.length < 2500, "the instructions stay short");
  assert.match((await callTool(memory, "persona_now", {})).text, /^Now: Friday 2026-10-23 12:00 \(UTC\+03:00\)/);
  const started = await callTool(memory, "persona_timer_start", { name: "the tile seams", predicted_finish: "1 h 30 min" });
  assert.equal(started.isError, false, started.text);
  assert.match(started.text, /predicted to finish 13:30 \(UTC\+03:00\) — in 1 h 30 min/);
  assert.equal((await callTool(memory, "persona_timer_start", { name: "as owner", predicted_finish: "1 h", note: { text: "Approved.", tag: "stated", author: "owner" } })).isError, true);
  clock.now = new Date("2026-10-23T10:22:00Z");
  assert.match((await callTool(memory, "persona_timer_check", { name: "the tile seams" })).text, /1 h 22 min elapsed; prediction not yet due/);
  const notStarted = await callTool(memory, "persona_timer_finish", { name: "the map export" });
  assert.equal(notStarted.isError, true);
  assert.match(notStarted.text, /no running timer «the map export»/);
  const finished = await callTool(memory, "persona_timer_finish", { name: "the tile seams", note: { text: "The seams were a rounding error.", tag: "observed" } });
  assert.match(finished.text, /^Finished «the tile seams»: predicted 1 h 30 min, took 1 h 22 min — 8 min under \(0\.91× the estimate\)\. Recorded in the calibration table as cal_\w+ \[observed · self\]/);
  assert.match((await callTool(memory, "persona_calibration_read", {})).text, /\| the tile seams \| 1 h 30 min \| 1 h 22 min \| −8 min \| 0\.91 \|/);
  assert.match((await callTool(memory, "persona_timer_check", {})).text, /No timer is running/);
});

test("the import seeds the table only from lines that name a prediction and an actual — a general remark seeds nothing", async () => {
  assert.deepEqual(calibrationPair("The tile cache rewrite: predicted 2 h, took 5 h 30 min."), { name: "The tile cache rewrite", predictedMinutes: 120, actualMinutes: 330 });
  assert.deepEqual(calibrationPair("Перенос стилей карты: прогноз 40 мин, вышло 1 ч 50 мин."), { name: "Перенос стилей карты", predictedMinutes: 40, actualMinutes: 110 });
  assert.equal(calibrationPair("My estimate of elapsed time inside a long session runs about a third short."), null);
  assert.equal(calibrationPair("A working session usually runs about two hours."), null);
  assert.equal(calibrationPair("Session 2 ran 8.8 h."), null, "a measured duration without a prediction is not a row");
  assert.equal(calibrationPair("I estimated 3 hours and it took 2 h.").name, "", "no name before the prediction: the section names it");
  const time = await readFile(new URL("../test-fixtures/persona-memory/project-memory/areas/time-sense.md", import.meta.url), "utf8");
  const plan = planImport([{ path: "areas/time-sense.md", text: time }], new Date("2026-10-23T09:00:00Z"));
  assert.deepEqual(plan.calibration.map((seed) => [seed.name, seed.predictedMinutes, seed.actualMinutes, seed.source]),
    [["The tile cache rewrite", 120, 330, "import:areas/time-sense.md#estimates-against-what-they-took"], ["Перенос стилей карты", 40, 110, "import:areas/time-sense.md#estimates-against-what-they-took"]]);
  assert.ok(plan.facts.some((fact) => /about a third short/.test(fact.text)), "the general remark stays a fact");
  assert.ok(!plan.facts.some((fact) => /predicted 2 h/.test(fact.text)), "a seeded line is not also a fact");
  const { store } = await files();
  const memory = createPersonaMemory({ store, now: () => new Date("2026-10-23T09:00:00Z"), timeZone: "UTC" });
  assert.deepEqual((await applyImport(memory, plan)).calibration, { written: 2, skipped: 0 });
  assert.deepEqual((await applyImport(memory, plan)).calibration, { written: 0, skipped: 2 }, "a re-run skips the rows already there");
  const rows = (await memory.calibrationRead()).rows;
  assert.deepEqual(rows.map((row) => [row.author, row.tag, row.timerId, row.actualFinish]), [["background", "observed", null, null], ["background", "observed", null, null]]);
  assert.match(rows[0].notes[0].text, /^Imported from import:areas\/time-sense\.md#estimates-against-what-they-took: «The tile cache rewrite: predicted 2 h, took 5 h 30 min\.»$/);
  assert.match((await memory.calibrationRead()).text, /\(imported 2026-10-23\) \| The tile cache rewrite \| 2 h \| 5 h 30 min \| \+3 h 30 min \| 2\.75 \|/);
});
