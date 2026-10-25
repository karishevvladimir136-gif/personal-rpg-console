// Game player 1: the app, in this process. The server modules the game screen and the wizard call (src/lib/server/*)
// are loaded as they are — the same turn path, records, dice, checks and DM preparation the owner's app runs — with
// five stand-ins that only connect them to this process: `server-only` (empty), `next/server` (`after` runs the job
// here and the harness waits for it before the next turn, as the owner's next message comes after it), `next/headers`
// (no cookies), and `@supabase/supabase-js` / `@supabase/ssr` (supabase-shim.mjs, the calls sent to a local PGlite
// database with every migration). Run with `node --experimental-transform-types` (one server type uses a TypeScript
// parameter property).
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { dirname, join, resolve as resolvePath } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SRC = join(ROOT, "src");
const here = (name) => pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), name)).href;

/** Background jobs the app hands to `after` (the quotable-line check, a fight's fold, the prep): run now, awaited later. */
const background = new Set();
globalThis.__gamePlayerAfter = (job) => {
  const run = Promise.resolve().then(job).catch((error) => console.info(JSON.stringify({ event: "game_player_after_failed", message: String(error?.message ?? error).slice(0, 200) })));
  background.add(run);
  run.finally(() => background.delete(run));
};
export async function settleBackground(timeoutMs = 180_000) {
  const until = Date.now() + timeoutMs;
  while (background.size && Date.now() < until) await Promise.race([Promise.allSettled([...background]), new Promise((done) => setTimeout(done, 1000))]);
  return background.size;
}

const STUBS = {
  "server-only": "data:text/javascript,export%20{}",
  "next/server": `data:text/javascript,${encodeURIComponent("export const after = (job) => globalThis.__gamePlayerAfter(job); export class NextResponse {}; export class NextRequest {};")}`,
  "next/headers": `data:text/javascript,${encodeURIComponent("export async function cookies() { return { getAll: () => [], get: () => undefined, set: () => {} }; } export async function headers() { return new Headers(); }")}`,
  "@supabase/supabase-js": here("supabase-shim.mjs"),
  "@supabase/ssr": here("supabase-shim.mjs"),
};
const BATTLE_OFF = `data:text/javascript,${encodeURIComponent("export function scheduleBattleBackground() {}")}`;
const EXTENSIONS = [".ts", ".tsx", "/index.ts", ".mjs", ".js"];
function withExtension(base) {
  if (existsSync(base) && !/\/$/.test(base) && /\.[cm]?[jt]sx?$/.test(base)) return base;
  for (const ext of EXTENSIONS) if (existsSync(base + ext)) return base + ext;
  return null;
}

let installed = false;
export function installHooks() {
  if (installed) return;
  installed = true;
  registerHooks({
    resolve(specifier, context, nextResolve) {
      if (STUBS[specifier]) return { url: STUBS[specifier], shortCircuit: true };
      const parent = context.parentURL?.startsWith("file:") ? fileURLToPath(context.parentURL) : null;
      // Pictures are off for this run: a fight's painted background (a picture job after the turn) is not started.
      if (/live2d\/server\/battle-schedule(\.ts)?$/.test(specifier)) return { url: BATTLE_OFF, shortCircuit: true };
      if (specifier.startsWith("@/")) {
        const found = withExtension(join(SRC, specifier.slice(2)));
        if (found) return { url: pathToFileURL(found).href, shortCircuit: true };
      }
      if (parent && parent.startsWith(SRC) && (specifier.startsWith("./") || specifier.startsWith("../")) && !/\.[cm]?[jt]sx?$|\.json$/.test(specifier)) {
        const found = withExtension(resolvePath(dirname(parent), specifier));
        if (found) return { url: pathToFileURL(found).href, shortCircuit: true };
      }
      return nextResolve(specifier, context);
    },
  });
}

/**
 * Opens the local database (every migration, one owner registered) and loads the server modules. `keys` are the
 * app's provider keys (set on this process's environment, where the server reads them). `fake` serves the DM's
 * requests with the app's own stand-in DM (RPG_DM_FAKE_MODEL=1: no model call; the dry run and the tests).
 */
export async function openApp({ keys = {}, fake = false } = {}) {
  installHooks();
  const { fixture } = await import(pathToFileURL(join(ROOT, "tests", "phase35-storage-fixture.mjs")).href);
  const f = await fixture();
  globalThis.__gamePlayerDb = { db: f.db, owner: f.owner };
  Object.assign(process.env, {
    SUPABASE_URL: "http://game-player-1.local", SUPABASE_SERVICE_ROLE_KEY: "local", SUPABASE_PUBLISHABLE_KEY: "local", RPG_OWNER_USER_ID: f.owner,
  });
  for (const name of ["RPG_DM_FAKE_MODEL", "RPG_ASTRA_PRIMARY_P1", "OPENAI_DM_MODEL"]) delete process.env[name];
  if (fake) process.env.RPG_DM_FAKE_MODEL = "1";
  if (keys.anthropic) process.env.ANTHROPIC_API_KEY = keys.anthropic; else delete process.env.ANTHROPIC_API_KEY;
  if (keys.openai) process.env.OPENAI_API_KEY = keys.openai; else delete process.env.OPENAI_API_KEY;
  const load = (path) => import(pathToFileURL(join(SRC, path)).href);
  const server = {
    gameplay: await load("lib/server/gameplay-service.ts"),
    bootstrap: await load("lib/server/adventure-bootstrap.ts"),
    adventures: await load("lib/server/adventures.ts"),
    secrets: await load("lib/server/dm-secrets.ts"),
    dmSettings: await load("lib/server/dm-settings.ts"),
    dossier: await load("lib/server/dossier.ts"),
    repository: await load("lib/server/repository.ts"),
    prep: await load("lib/server/hidden-layer-prep.ts"),
    publicCampaign: await load("lib/server/public-campaign.ts"),
    craft: await load("lib/server/dm-craft.ts"),
    pictures: await load("lib/server/media/pictures-store.ts"),
    music: await load("lib/server/audio/music-store.ts"),
  };
  const lib = {
    client: await load("lib/adventures/client.ts"),
    heroDraft: await load("lib/adventures/hero-draft.ts"),
    validation: await load("lib/adventures/bootstrap-validation.ts"),
    wizardText: await load("lib/adventures/wizard-text.ts"),
    openingAnswers: await load("lib/adventures/opening-answers.ts"),
    privateNotes: await load("lib/gameplay/dm-loop/private-notes.ts"),
    campaignView: await load("lib/ui/campaign-view.ts"),
  };
  return { f, owner: f.owner, server, lib, close: () => f.db.close() };
}
