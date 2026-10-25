// Sandbox launcher (Stage 4 §9, docs/SANDBOX.md): a separate local Supabase
// project (own project ID, ports 44320–44327, own Docker volumes) with every
// committed migration applied, one sandbox owner, and this checkout's app on
// http://127.0.0.1:3100. The owner's real local project (ports 34320–34327)
// and its volumes are never touched.
//
//   node scripts/sandbox-start.mjs            start (or reuse) and open the browser
//   node scripts/sandbox-start.mjs --fake     play on the stand-in DM (no API keys needed)
//   node scripts/sandbox-start.mjs --stop     stop the app and the sandbox database (data kept)
//   node scripts/sandbox-start.mjs --reset    stop and delete the sandbox data (asks nothing; sandbox only)
//   --no-browser   do not open the browser      --no-app   database only
//   --prod         a production build (`next build`, then `next start`) instead of the dev server: much less memory
//                  and no compile pauses during play (fix run after session 2); --no-build reuses the last build
import { execFile as execFileCallback, spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { cpSync, existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { connect } from "node:net";
import { delimiter, dirname, isAbsolute, join } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFile = promisify(execFileCallback);
const root = fileURLToPath(new URL("../", import.meta.url));
const sandbox = join(root, ".sandbox");
const PROJECT = "personal-rpg-console-sandbox";
const PORTS = { shadow: 44320, api: 44321, db: 44322, studio: 44323, mail: 44324, analytics: 44327 };
const APP_PORT = Number(process.env.RPG_SANDBOX_APP_PORT || 3100);
const APP_URL = `http://127.0.0.1:${APP_PORT}`;
const OWNER_EMAIL = "owner@sandbox.local";
const SUPABASE_CLI_VERSION = "2.121.0";
const EXCLUDED = ["vector", "logflare", "edge-runtime", "realtime", "imgproxy", "supavisor"];
const windows = process.platform === "win32";
const wait = (ms) => new Promise((done) => setTimeout(done, ms));
const flags = new Set(process.argv.slice(2));

export class SandboxError extends Error {}

/** The sandbox config: the committed config with its own project ID and ports. */
export function sandboxConfig(committed) {
  const replaced = committed
    .replace(/^project_id = ".*"$/m, `project_id = "${PROJECT}"`)
    .replace(/^port = 34321$/m, `port = ${PORTS.api}`)
    .replace(/^port = 34322$/m, `port = ${PORTS.db}`)
    .replace(/^shadow_port = 34320$/m, `shadow_port = ${PORTS.shadow}`)
    .replace(/^port = 34323$/m, `port = ${PORTS.studio}`)
    .replace(/^port = 34324$/m, `port = ${PORTS.mail}`)
    .replace(/^port = 34327$/m, `port = ${PORTS.analytics}`)
    .replace(/^site_url = "http:\/\/127\.0\.0\.1:3000"$/m, `site_url = "${APP_URL}"`)
    .replace(/^\[analytics\]\n/m, "[analytics]\nenabled = false\n");
  if (!replaced.includes(`project_id = "${PROJECT}"`) || !replaced.includes(`port = ${PORTS.api}`) ||
    !replaced.includes(`port = ${PORTS.db}`) || !replaced.includes(`shadow_port = ${PORTS.shadow}`))
    throw new SandboxError("The committed supabase/config.toml changed shape; the sandbox config could not be derived.");
  return replaced;
}

export function parseStatusEnv(text) {
  const values = new Map();
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?(.*?)"?\s*$/);
    if (match) values.set(match[1], match[2]);
  }
  return values;
}

export function parseDotEnv(contents) {
  const values = new Map();
  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    const raw = match[2];
    values.set(match[1], /^(["']).*\1$/.test(raw) ? raw.slice(1, -1) : raw);
  }
  return values;
}

/** The app's environment: the owner's AI keys from .env.local (never its
 * Supabase or owner values), then the sandbox project, owner and switches. */
export function appEnvironment(base, dotEnvLocal, status, owner, options) {
  const env = {};
  const forbidden = (key) => key.startsWith("SUPABASE_") || key === "RPG_OWNER_USER_ID" || key.startsWith("RPG_LOCAL_OWNER") ||
    key === "RPG_TRUSTED_LOCAL_OWNER" || key === "APP_SANDBOX_TRUSTED_OWNER" || key === "RPG_DM_FAKE_MODEL";
  for (const [key, value] of Object.entries(base)) if (!forbidden(key)) env[key] = value;
  for (const [key, value] of dotEnvLocal) if (!forbidden(key) && key !== "NODE_ENV") env[key] = value;
  Object.assign(env, {
    SUPABASE_URL: status.get("API_URL"),
    SUPABASE_ANON_KEY: status.get("ANON_KEY"),
    SUPABASE_PUBLISHABLE_KEY: status.get("PUBLISHABLE_KEY") || status.get("ANON_KEY"),
    SUPABASE_SERVICE_ROLE_KEY: status.get("SERVICE_ROLE_KEY"),
    RPG_OWNER_USER_ID: owner.id,
    RPG_TRUSTED_LOCAL_OWNER: "1",
    RPG_LOCAL_OWNER_EMAIL: owner.email,
    RPG_LOCAL_OWNER_PASSWORD: owner.password,
    NODE_ENV: options.prod ? "production" : "development",
    PORT: String(APP_PORT),
  });
  // A production server signs the sandbox owner in only through this opt-in (src/lib/server/trusted-local-owner.ts).
  if (options.prod) env.APP_SANDBOX_TRUSTED_OWNER = "1";
  if (options.fake) env.RPG_DM_FAKE_MODEL = "1";
  return env;
}

async function run(file, args, options = {}) {
  const result = await execFile(file, args, { cwd: options.cwd ?? root, windowsHide: true, timeout: options.timeout ?? 20000,
    maxBuffer: 8 * 1024 * 1024, env: { ...process.env, ...(options.env ?? {}) }, shell: windows && /\.(cmd|bat)$/i.test(file) });
  return result.stdout.trim();
}

function pollUntil(check, timeoutMs, intervalMs = 1500) {
  const deadline = Date.now() + timeoutMs;
  return (async () => {
    do {
      if (await check()) return true;
      if (Date.now() >= deadline) return false;
      await wait(intervalMs);
    } while (true);
  })();
}

function portHasListener(port) {
  return new Promise((done) => {
    const socket = connect({ host: "127.0.0.1", port });
    socket.setTimeout(1500);
    socket.once("connect", () => { socket.destroy(); done(true); });
    socket.once("error", () => done(false));
    socket.once("timeout", () => { socket.destroy(); done(false); });
  });
}

async function fetchJson(url, init = {}) {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(init.timeoutMs ?? 8000) }).catch(() => null);
  if (!response) return { status: 0, body: null };
  let body = null;
  try { body = await response.json(); } catch { /* not JSON */ }
  return { status: response.status, body };
}

// ---- Docker and the Supabase CLI ------------------------------------------

async function ensureDocker() {
  try { await run("docker", ["info", "--format", "{{.ServerVersion}}"], { timeout: 8000 }); }
  catch { throw new SandboxError("Docker is not running. Start Docker Desktop, wait for it to say it is running, then try again."); }
}

async function supabaseCli() {
  const explicit = process.env.RPG_SUPABASE_CLI;
  if (explicit) {
    if (!isAbsolute(explicit)) throw new SandboxError("RPG_SUPABASE_CLI must be an absolute file path.");
    return { file: explicit, prefix: [] };
  }
  const local = join(root, "test-results", "supabase-cli", windows ? "supabase.exe" : "supabase");
  if (existsSync(local)) return { file: local, prefix: [] };
  try { await run(windows ? "supabase.exe" : "supabase", ["--version"]); return { file: windows ? "supabase.exe" : "supabase", prefix: [] }; }
  catch { /* fall through to npx */ }
  return { file: windows ? "npx.cmd" : "npx", prefix: ["--yes", `supabase@${SUPABASE_CLI_VERSION}`] };
}

async function supabase(args, options = {}) {
  const cli = await supabaseCli();
  const env = process.env.RPG_SANDBOX_IMAGE_REGISTRY ? { SUPABASE_INTERNAL_IMAGE_REGISTRY: process.env.RPG_SANDBOX_IMAGE_REGISTRY } : {};
  return run(cli.file, [...cli.prefix, ...args, "--workdir", sandbox], { timeout: options.timeout ?? 600000, env });
}

function prepareWorkdir() {
  mkdirSync(join(sandbox, "supabase"), { recursive: true });
  writeFileSync(join(sandbox, "supabase", "config.toml"), sandboxConfig(readFileSync(join(root, "supabase", "config.toml"), "utf8")));
  rmSync(join(sandbox, "supabase", "migrations"), { recursive: true, force: true });
  cpSync(join(root, "supabase", "migrations"), join(sandbox, "supabase", "migrations"), { recursive: true });
  writeFileSync(join(sandbox, ".gitignore"), "*\n");
}

async function volumeExists(name) {
  try { return Boolean(JSON.parse(await run("docker", ["volume", "inspect", name]))[0]); } catch { return false; }
}

async function databaseHealthy() {
  try {
    const container = JSON.parse(await run("docker", ["inspect", `supabase_db_${PROJECT}`]))[0];
    return container?.State?.Health?.Status === "healthy";
  } catch { return false; }
}

async function startSupabase() {
  const existed = await volumeExists(`supabase_db_${PROJECT}`);
  if (existed && await databaseHealthy() && await portHasListener(PORTS.api)) {
    console.log("The sandbox database is already running.");
  } else {
    console.log(existed ? "Starting the sandbox database (your sandbox data is kept)..." :
      "Creating the sandbox database. The first start downloads Docker images and can take a few minutes...");
    try { await supabase(["start", "--exclude", EXCLUDED.join(",")]); }
    catch (error) {
      throw new SandboxError(`The sandbox database did not start.\n${String(error?.stderr || error?.message || error).trim().split("\n").slice(-12).join("\n")}`);
    }
  }
  if (existed) {
    // A sandbox created on an older commit applies the migrations added since.
    try { await supabase(["migration", "up", "--local"], { timeout: 300000 }); }
    catch (error) { throw new SandboxError(`Pending migrations could not be applied to the sandbox.\n${String(error?.stderr || error?.message || error).trim().split("\n").slice(-12).join("\n")}`); }
  }
  const status = parseStatusEnv(await supabase(["status", "-o", "env"], { timeout: 60000 }));
  for (const key of ["API_URL", "ANON_KEY", "SERVICE_ROLE_KEY"])
    if (!status.get(key)) throw new SandboxError(`The Supabase CLI did not report ${key} for the sandbox.`);
  const api = new URL(status.get("API_URL"));
  if (!["127.0.0.1", "localhost"].includes(api.hostname) || Number(api.port) !== PORTS.api)
    throw new SandboxError(`The sandbox API is at ${api.origin}, not loopback port ${PORTS.api}. Startup stopped.`);
  return status;
}

// ---- The sandbox owner -----------------------------------------------------

function ownerCredentials() {
  const file = join(sandbox, "owner-login.txt");
  if (existsSync(file)) {
    const values = new Map();
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*(Email|Password)\s*:\s*(.*?)\s*$/i);
      if (match) values.set(match[1].toLowerCase(), match[2]);
    }
    if (values.get("email") && values.get("password")) return { email: values.get("email"), password: values.get("password") };
  }
  const password = randomBytes(18).toString("base64url");
  writeFileSync(file, `Email: ${OWNER_EMAIL}\nPassword: ${password}\n`, { mode: 0o600 });
  return { email: OWNER_EMAIL, password };
}

async function ensureOwner(status) {
  const credentials = ownerCredentials();
  const admin = { apikey: status.get("SERVICE_ROLE_KEY"), Authorization: `Bearer ${status.get("SERVICE_ROLE_KEY")}`, "Content-Type": "application/json" };
  const base = `${status.get("API_URL")}/auth/v1/admin/users`;
  const listed = await fetchJson(`${base}?page=1&per_page=200`, { headers: admin });
  if (listed.status !== 200) throw new SandboxError(`Sandbox Auth did not answer (HTTP ${listed.status}).`);
  let user = (listed.body?.users ?? []).find((row) => row.email === credentials.email);
  if (user) {
    const updated = await fetchJson(`${base}/${user.id}`, { method: "PUT", headers: admin,
      body: JSON.stringify({ password: credentials.password, email_confirm: true }) });
    if (updated.status !== 200) throw new SandboxError(`The sandbox owner's password could not be set (HTTP ${updated.status}).`);
  } else {
    const created = await fetchJson(base, { method: "POST", headers: admin,
      body: JSON.stringify({ email: credentials.email, password: credentials.password, email_confirm: true }) });
    if (created.status !== 200 || !created.body?.id) throw new SandboxError(`The sandbox owner could not be created (HTTP ${created.status}).`);
    user = created.body;
  }
  await run("docker", ["exec", `supabase_db_${PROJECT}`, "psql", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-c",
    `insert into rpg_private.owner_registry (user_id) values ('${user.id}') on conflict (singleton) do update set user_id = excluded.user_id`]);
  return { id: user.id, ...credentials };
}

// ---- The app ---------------------------------------------------------------

async function appProbe() {
  const { status, body } = await fetchJson(`${APP_URL}/api/local-launch/health`, { timeoutMs: 3000 });
  if (status === 200 && body?.app === "personal-rpg-console" && body.trustedLocalOwner === true) return "ours";
  return await portHasListener(APP_PORT) ? "other" : "free";
}

function readPid() {
  try { return Number(readFileSync(join(sandbox, "app.pid"), "utf8")) || 0; } catch { return 0; }
}

async function stopApp() {
  const pid = readPid();
  if (!pid) return;
  try {
    if (windows) await run("taskkill", ["/pid", String(pid), "/t", "/f"], { timeout: 15000 });
    else process.kill(-pid, "SIGTERM");
  } catch { /* already gone */ }
  rmSync(join(sandbox, "app.pid"), { force: true });
  await pollUntil(async () => !(await portHasListener(APP_PORT)), 20000, 500);
}

async function startApp(env, options = {}) {
  const next = join(root, "node_modules", "next", "dist", "bin", "next");
  if (!existsSync(next)) throw new SandboxError("Application packages are missing: run `pnpm install` in this checkout first.");
  const state = await appProbe();
  if (state === "ours") { console.log(`The sandbox app is already running at ${APP_URL}.`); return; }
  if (state === "other") throw new SandboxError(`Port ${APP_PORT} is used by another program. Close it, or set RPG_SANDBOX_APP_PORT to a free port, then retry.`);
  const log = openSync(join(sandbox, "app.log"), "a");
  if (options.prod && options.build !== false) {
    console.log("Building the app for production (two to five minutes)...");
    try { writeFileSync(join(sandbox, "build.log"), await run(process.execPath, [next, "build"], { timeout: 15 * 60 * 1000, env })); }
    catch (error) {
      writeFileSync(join(sandbox, "build.log"), String(error?.stdout ?? "") + String(error?.stderr ?? error?.message ?? error));
      throw new SandboxError("The production build failed. See .sandbox/build.log.");
    }
  }
  if (options.prod && !existsSync(join(root, ".next", "BUILD_ID"))) throw new SandboxError("No production build yet: start once with --prod (without --no-build).");
  const child = spawn(process.execPath, options.prod ? [next, "start", "--port", String(APP_PORT), "--hostname", "127.0.0.1"]
    : [next, "dev", "--webpack", "--port", String(APP_PORT), "--hostname", "127.0.0.1"],
    { cwd: root, env, detached: true, stdio: ["ignore", log, log], windowsHide: true });
  child.unref();
  writeFileSync(join(sandbox, "app.pid"), String(child.pid));
  console.log("Starting the sandbox app (the first page compiles for a minute)...");
  if (!await pollUntil(async () => (await appProbe()) === "ours", 180000, 1500))
    throw new SandboxError(`The app did not become ready at ${APP_URL} within three minutes. See .sandbox/app.log.`);
}

function openBrowser(url) {
  try {
    const child = windows ? spawn("cmd.exe", ["/d", "/s", "/c", `start "" "${url}"`], { detached: true, stdio: "ignore", windowsHide: true, windowsVerbatimArguments: true })
      : spawn(process.platform === "darwin" ? "open" : "xdg-open", [url], { detached: true, stdio: "ignore" });
    child.on("error", () => { /* no browser here */ });
    child.unref();
  } catch { /* no browser here */ }
}

// ---- Commands --------------------------------------------------------------

async function stop({ reset }) {
  await stopApp();
  if (existsSync(join(sandbox, "supabase", "config.toml"))) {
    try { await supabase(["stop", ...(reset ? ["--no-backup"] : [])], { timeout: 180000 }); }
    catch (error) { if (!reset) throw new SandboxError(`The sandbox database did not stop.\n${String(error?.stderr || error?.message || error).trim().split("\n").slice(-8).join("\n")}`); }
  }
  if (reset) {
    for (const name of [`supabase_db_${PROJECT}`, `supabase_storage_${PROJECT}`, `supabase_config_${PROJECT}`, `supabase_inbucket_${PROJECT}`])
      try { await run("docker", ["volume", "rm", name]); } catch { /* not there */ }
    rmSync(sandbox, { recursive: true, force: true });
    console.log("The sandbox was deleted. The next start creates a fresh one.");
  } else console.log("The sandbox is stopped. Its data is kept for the next start.");
}

async function start() {
  const fake = flags.has("--fake");
  // A production server never answers with the stand-in DM (fakeDmModelEnabled), so --fake would pay real models.
  if (fake && flags.has("--prod")) throw new SandboxError("--fake plays on the dev server only: start without --prod.");
  prepareWorkdir();
  const status = await startSupabase();
  const owner = await ensureOwner(status);
  const dotEnvLocal = existsSync(join(root, ".env.local")) ? parseDotEnv(readFileSync(join(root, ".env.local"), "utf8")) : new Map();
  const env = appEnvironment(process.env, dotEnvLocal, status, owner, { fake, prod: flags.has("--prod") });
  writeFileSync(join(sandbox, ".env.sandbox"), [
    `SUPABASE_URL=${env.SUPABASE_URL}`, `SUPABASE_ANON_KEY=${env.SUPABASE_ANON_KEY}`, `SUPABASE_PUBLISHABLE_KEY=${env.SUPABASE_PUBLISHABLE_KEY}`,
    `SUPABASE_SERVICE_ROLE_KEY=${env.SUPABASE_SERVICE_ROLE_KEY}`, `RPG_OWNER_USER_ID=${env.RPG_OWNER_USER_ID}`,
    `DB_URL=${status.get("DB_URL") ?? ""}`, `STUDIO_URL=${status.get("STUDIO_URL") ?? ""}`, "",
  ].join("\n"), { mode: 0o600 });
  if (!flags.has("--no-app")) {
    const keys = ["ANTHROPIC_API_KEY", "BEDROCK_API_KEY", "OPENAI_API_KEY"].filter((key) => env[key]);
    if (!fake && !keys.length) console.log("No ANTHROPIC_API_KEY, BEDROCK_API_KEY or OPENAI_API_KEY in .env.local: turns will fail. Start with --fake to play on the stand-in DM.");
    if (fake) console.log("Playing on the stand-in DM: no model is contacted and nothing is paid.");
    await startApp(env, { prod: flags.has("--prod"), build: !flags.has("--no-build") });
    if (!flags.has("--no-browser")) openBrowser(`${APP_URL}/campaigns`);
    console.log(`The sandbox is open at ${APP_URL}/campaigns (Supabase Studio: ${status.get("STUDIO_URL") || `http://127.0.0.1:${PORTS.studio}`}).`);
  } else console.log(`The sandbox database is ready at ${status.get("API_URL")}.`);
}

async function main() {
  process.chdir(root);
  process.env.PATH = [dirname(process.execPath), process.env.PATH ?? ""].join(delimiter);
  await ensureDocker();
  if (flags.has("--reset")) return stop({ reset: true });
  if (flags.has("--stop")) return stop({ reset: false });
  return start();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === (await import("node:fs")).realpathSync(process.argv[1])) {
  main().catch((error) => {
    console.error(`Sandbox stopped: ${error instanceof SandboxError ? error.message : (error?.stack || error)}`);
    process.exitCode = 1;
  });
}
