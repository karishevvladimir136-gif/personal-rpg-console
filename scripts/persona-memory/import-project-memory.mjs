#!/usr/bin/env node
// Persona memory 1, Part C: the import of the owner's exported Project memory into the persona memory store. The owner
// runs it himself on his own export; his files never enter git (the tests use a synthetic fixture only).
//
//   node scripts/persona-memory/import-project-memory.mjs --from <folder or .md files…>            (a dry run: prints the plan)
//   node scripts/persona-memory/import-project-memory.mjs --from <folder or .md files…> --write    (writes it)
//
// The target store is the server's (PERSONA_MEMORY_BACKEND, PERSONA_MEMORY_DIR, …; see docs/PERSONA_MEMORY.md). The
// folder is searched for *.md files (an `areas/` folder inside it included). Re-running skips what is already there.
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { applyImport, describePlan, planImport } from "../../src/lib/persona-memory/import.ts";
import { memoryFromEnv } from "./server.mjs";

async function markdownFiles(target) {
  const info = await stat(target);
  if (info.isFile()) return target.toLowerCase().endsWith(".md") ? [target] : [];
  const found = [];
  for (const entry of await readdir(target, { withFileTypes: true })) {
    const path = join(target, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".")) found.push(...await markdownFiles(path));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) found.push(path);
  }
  return found.sort();
}

export async function run(args, env = process.env, out = (text) => process.stdout.write(`${text}\n`)) {
  const at = args.indexOf("--from");
  const targets = at >= 0 ? args.slice(at + 1).filter((arg) => !arg.startsWith("--")) : [];
  if (!targets.length) throw new Error("usage: import-project-memory.mjs --from <folder or .md files…> [--write]");
  const files = [];
  for (const target of targets) {
    const root = resolve(target);
    for (const path of await markdownFiles(root)) files.push({ path: relative((await stat(root)).isFile() ? resolve(root, "..") : root, path).replace(/\\/g, "/"), text: await readFile(path, "utf8") });
  }
  if (!files.length) throw new Error("no .md files found");
  const plan = planImport(files, new Date());
  out(`Files: ${files.map((file) => file.path).join(", ")}`);
  out(describePlan(plan));
  if (!args.includes("--write")) { out("\nDry run: nothing was written. Add --write to write it."); return { plan, summary: null }; }
  const { memory, where } = await memoryFromEnv(env);
  const summary = await applyImport(memory, plan);
  out(`\nWritten to ${where}: episodes ${summary.episodes.written} (skipped ${summary.episodes.skipped}), dossier lines ${summary.dossier.written} (skipped ${summary.dossier.skipped}), facts ${summary.facts.written} (skipped ${summary.facts.skipped}), calibration rows ${summary.calibration.written} (skipped ${summary.calibration.skipped}).`);
  for (const error of summary.errors) out(`NOT WRITTEN ${error}`);
  return { plan, summary };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  run(process.argv.slice(2)).catch((error) => { process.stderr.write(`import: ${String(error?.message ?? error)}\n`); process.exit(1); });
}
