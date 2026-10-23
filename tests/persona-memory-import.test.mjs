// Persona memory 1, Part C: the import of the owner's exported Project memory, tested on a synthetic fixture only
// (test-fixtures/persona-memory/project-memory — invented text, marked as such). The plan (journal sections →
// episodes, «Rules» → the dossier's first lines, time-sense and the other files → facts), the dry run that writes
// nothing, the write, and a re-run that skips what is there.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { planImport, applyImport } from "../src/lib/persona-memory/import.ts";
import { createPersonaMemory, filesStore, FACT_KEY } from "../src/lib/persona-memory/index.ts";
import { run } from "../scripts/persona-memory/import-project-memory.mjs";

const FIXTURE = new URL("../test-fixtures/persona-memory/project-memory/", import.meta.url).pathname;
const NOW = new Date("2026-10-23T09:00:00Z");
const load = async () => Promise.all(["claude-journal.md", "time-sense.md", "personal-rpg-console.md"].map(async (name) => ({ path: `areas/${name}`, text: await readFile(join(FIXTURE, "areas", name), "utf8") })));
const dirs = [];
test.after(() => Promise.all(dirs.map((dir) => rm(dir, { recursive: true, force: true }))));

test("the fixture is synthetic", async () => {
  for (const file of await load()) assert.match(file.text, /SYNTHETIC FIXTURE/, file.path);
});

test("the plan: dated journal sections become episodes with their exact lines; nothing is invented or taken for the owner's words", async () => {
  const plan = planImport(await load(), NOW);
  assert.equal(plan.episodes.length, 4);
  const [first, second, quiet, last] = plan.episodes;
  assert.equal(first.input.title, "The lantern ledger starts");
  assert.equal(first.input.validFrom, "2026-10-05T00:00:00.000Z");
  assert.equal(first.input.salience, 4);
  assert.deepEqual(first.input.cues, ["lantern ledger", "first green"]);
  assert.deepEqual(first.input.state.map((line) => line.text), ["Pulled toward: writing the whole parser in one go.", "Did: wrote the smallest piece and showed it."]);
  assert.deepEqual(first.input.lines.map((line) => line.tag), ["observed", "inferred"], "a hedged line is inferred");
  assert.deepEqual(first.input.quotes, [{ text: "Show me the small thing first.", speaker: "owner", tag: "stated", author: "self" }]);
  assert.deepEqual(first.derived, []);

  assert.equal(second.input.validFrom, "2026-10-09T14:30:00.000Z", "the heading's time is kept");
  assert.ok(second.input.lines.some((line) => line.text === "Он написал: «Вот так и надо»."), "the line stays as written");
  assert.deepEqual(second.input.quotes.map((q) => [q.text, q.speaker, q.tag]), [["Вот так и надо", "owner", "stated"], ["Без спешки.", "other", "observed"]],
    "an attributed quote is the owner's; an unattributed one is never stated");
  assert.ok(second.derived.some((note) => note.startsWith("salience 3")) && second.derived.some((note) => note.startsWith("cues derived")));

  assert.deepEqual(quiet.input.state, [{ text: "(the source entry has no state line)", tag: "observed", author: "background" }], "an absent state is recorded as absent");
  assert.ok(quiet.input.cues.includes("Brass Gate"));
  assert.equal(last.input.salience, 2, "★★");
  assert.deepEqual(last.register, ["Прощай"]);
  assert.ok(plan.warnings.some((warning) => warning.includes("Ideas for later")), "an undated section is named, not guessed");

  assert.deepEqual(plan.dossier.map((line) => [line.tag, line.author, line.section]), [["observed", "background", "rules"], ["stated", "background", "rules"], ["observed", "background", "rules"], ["observed", "background", "rules"]]);
  assert.equal(plan.facts.length, 5);
  assert.ok(plan.facts.every((fact) => FACT_KEY.test(fact.key)), plan.facts.map((fact) => fact.key).join(", "));
  assert.equal(plan.facts.find((fact) => fact.key.startsWith("time-sense.calibration.2")).tag, "stated");
});

test("the script: a dry run prints the plan and writes nothing; --write writes; a re-run skips everything", async () => {
  const dir = await mkdtemp(join(tmpdir(), "persona-import-"));
  dirs.push(dir);
  const env = { PERSONA_MEMORY_DIR: dir };
  const printed = [];
  const dry = await run(["--from", FIXTURE], env, (line) => printed.push(line));
  assert.equal(dry.summary, null);
  assert.ok(printed.join("\n").includes("Dry run: nothing was written"));
  assert.ok(printed.join("\n").includes("EPISODE 2026-10-05 00:00 «The lantern ledger starts» salience 4"));
  assert.deepEqual(await readdir(dir), [], "the dry run did not touch the store");

  const written = await run(["--from", FIXTURE, "--write"], env, () => {});
  assert.deepEqual(written.summary, { episodes: { written: 4, skipped: 0 }, dossier: { written: 4, skipped: 0 }, facts: { written: 5, skipped: 0 }, errors: [] });
  const again = await run(["--from", FIXTURE, "--write"], env, () => {});
  assert.deepEqual(again.summary, { episodes: { written: 0, skipped: 4 }, dossier: { written: 0, skipped: 4 }, facts: { written: 0, skipped: 5 }, errors: [] });

  const memory = createPersonaMemory({ store: filesStore(dir) });
  const episodes = await memory.journalLatest(10);
  assert.equal(episodes.length, 4);
  const parser = episodes.find((episode) => episode.title === "Last day of the old parser");
  assert.equal(parser.lines[0].text, "Прощай, старый парсер: он служил честно.", "imported as written");
  assert.match(parser.notes[0].lines[0].text, /farewell or longing register/);
  assert.equal(parser.notes[0].lines[0].author, "background");
  const dossier = await memory.dossierRead();
  assert.ok(dossier.text.includes("[stated · background] He said «never call it green before the second run»"));
  const exported = (await memory.exportMarkdown()).text;
  assert.ok(exported.includes("source import:areas/claude-journal.md#2026-10-05-the-lantern-ledger-starts"));
  assert.match((await memory.recall("второй прогон тесты")).episodes[0].episode.title, /Тесты на втором прогоне/);
});

test("a re-import with a changed fact closes the older version instead of overwriting it", async () => {
  const dir = await mkdtemp(join(tmpdir(), "persona-import-"));
  dirs.push(dir);
  const clock = { now: new Date("2026-10-20T09:00:00Z") };
  const memory = createPersonaMemory({ store: filesStore(dir), now: () => clock.now });
  const files = [{ path: "areas/project.md", text: "# Project (SYNTHETIC)\n\n## Stage\n- Current stage: two.\n" }];
  await applyImport(memory, planImport(files, clock.now));
  clock.now = new Date("2026-10-22T09:00:00Z");
  const summary = await applyImport(memory, planImport([{ ...files[0], text: files[0].text.replace("two", "three") }], clock.now));
  assert.equal(summary.facts.written, 1);
  const versions = await memory.facts({ all: true });
  assert.deepEqual(versions.map((fact) => [fact.text, fact.validTo]), [["Current stage: two.", "2026-10-22T09:00:00.000Z"], ["Current stage: three.", null]]);
});
