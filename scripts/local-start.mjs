import { spawn, execFile as execFileCallback } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, realpathSync, rmdirSync, unlinkSync, writeFileSync } from "node:fs";
import { connect } from "node:net";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFile = promisify(execFileCallback);
const root = fileURLToPath(new URL("../", import.meta.url));
const API_PORT = 34321;
const APP_URL = "http://127.0.0.1:3000";
const APP_HEALTH = `${APP_URL}/api/local-launch/health`;
const PROJECT = "personal-rpg-console";
const DB_VOLUME = `supabase_db_${PROJECT}`;
const STORAGE_VOLUME = `supabase_storage_${PROJECT}`;
const PRIVATE_NETWORK = "rpg-phase1-acceptance";
const wait = (ms) => new Promise((done) => setTimeout(done, ms));
let dockerExecutable = "docker";

export class StartupError extends Error {}

export function parseCredentials(contents) {
  const fields = new Map();
  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^\s*(Email|Password)\s*:\s*(.*?)\s*$/i);
    if (match) fields.set(match[1].toLowerCase(), match[2]);
  }
  const email = fields.get("email");
  const password = fields.get("password");
  if (!email || !email.includes("@") || !password)
    throw new StartupError("The ignored local login file needs Email and Password lines.");
  return { email, password };
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

export function validateLocalConfiguration(values) {
  let url;
  try { url = new URL(values.get("SUPABASE_URL")); } catch { /* reported below */ }
  if (!url || url.protocol !== "http:" ||
      !["127.0.0.1", "localhost"].includes(url.hostname) ||
      Number(url.port) !== API_PORT)
    throw new StartupError(`.env.local must point SUPABASE_URL to loopback port ${API_PORT}.`);
  if (!values.get("SUPABASE_ANON_KEY") && !values.get("SUPABASE_PUBLISHABLE_KEY"))
    throw new StartupError(".env.local is missing the local Supabase public key.");
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(values.get("RPG_OWNER_USER_ID") || ""))
    throw new StartupError(".env.local is missing the existing owner ID.");
  return { apiUrl: url.origin, apiKey: values.get("SUPABASE_PUBLISHABLE_KEY") || values.get("SUPABASE_ANON_KEY") };
}

export function appHealthFromResponse(status, payload) {
  return status === 200 && payload?.app === PROJECT && payload.trustedLocalOwner === true;
}

export function shouldStartApp(probe) {
  if (probe === "ours") return false;
  if (probe === "free") return true;
  throw new StartupError("Port 3000 is occupied by another or non-local app. Close it yourself, then retry. No process was stopped.");
}

export function supabaseReady({ volume, db, auth, api, loopback }) {
  return volume && db && auth && api && loopback;
}

export function appProcessSpec(pnpm, credentials, baseEnvironment = {}, localConfig = {}) {
  const environment = { ...baseEnvironment };
  for (const key of ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SERVICE_ROLE_KEY", "RPG_OWNER_USER_ID"])
    if (localConfig[key]) environment[key] = localConfig[key];
    else delete environment[key];
  return {
    file: "cmd.exe",
    args: ["/d", "/s", "/c", `""${pnpm}" dev --webpack --port 3000 --hostname 127.0.0.1"`],
    env: {
      ...environment,
      RPG_TRUSTED_LOCAL_OWNER: "1",
      RPG_LOCAL_OWNER_EMAIL: credentials.email,
      RPG_LOCAL_OWNER_PASSWORD: credentials.password,
      NODE_ENV: "development",
    },
  };
}

export function excludedPortOverlap(text, first = 34320, last = 34327) {
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*(\d+)\s+(\d+)\s*\*?\s*$/);
    if (match && Number(match[1]) <= last && Number(match[2]) >= first) return true;
  }
  return false;
}

export function listenersOnlyLoopback(addresses) {
  return addresses.length > 0 && addresses.every((address) => ["127.0.0.1", "::1"].includes(address));
}

export async function pollUntil(check, timeoutMs, intervalMs = 1500) {
  const deadline = Date.now() + timeoutMs;
  do {
    if (await check()) return true;
    if (Date.now() >= deadline) return false;
    await wait(intervalMs);
  } while (true);
}

async function command(file, args, options = {}) {
  const result = await execFile(file === "docker" ? dockerExecutable : file, args, {
    cwd: root, windowsHide: true, timeout: options.timeout ?? 10000,
    maxBuffer: 2 * 1024 * 1024,
  });
  return result.stdout.trim();
}

async function dockerInspect(name) {
  try { return JSON.parse(await command("docker", ["inspect", name]))[0]; }
  catch { return null; }
}

async function existingVolume(name) {
  try { return Boolean(JSON.parse(await command("docker", ["volume", "inspect", name]))[0]); }
  catch { return false; }
}

async function privateNetworkReady() {
  try {
    const network = JSON.parse(await command("docker", ["network", "inspect", PRIVATE_NETWORK]))[0];
    return network?.Options?.["com.docker.network.bridge.host_binding_ipv4"] === "127.0.0.1";
  } catch { return false; }
}

export function privatePort(container, port) {
  const published = container?.NetworkSettings?.Ports || {};
  const entries = Object.values(published).flat().filter((entry) => entry?.HostPort === String(port));
  return entries.length > 0 && entries.every((entry) => ["127.0.0.1", "::1"].includes(entry.HostIp));
}

async function endpoint(url, headers = {}) {
  try {
    const response = await fetch(url, {
      headers, redirect: "manual", signal: AbortSignal.timeout(2000),
    });
    return response;
  } catch { return null; }
}

async function portHasListener(port) {
  return new Promise((done) => {
    const socket = connect({ host: "127.0.0.1", port });
    socket.setTimeout(1500);
    socket.once("connect", () => { socket.destroy(); done(true); });
    socket.once("error", () => done(false));
    socket.once("timeout", () => { socket.destroy(); done(false); });
  });
}

async function appListenersPrivate() {
  try {
    const output = await command("powershell.exe", [
      "-NoProfile", "-Command",
      "@(Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty LocalAddress) | ConvertTo-Json -Compress",
    ], { timeout: 8000 });
    const addresses = JSON.parse(output);
    return listenersOnlyLoopback(Array.isArray(addresses) ? addresses : [addresses]);
  } catch { return false; }
}

async function portsAvailableOnWindows() {
  for (const family of ["ipv4", "ipv6"]) {
    let output;
    try { output = await command("netsh", ["interface", family, "show", "excludedportrange", "protocol=tcp"], { timeout: 8000 }); }
    catch { throw new StartupError("Windows port reservations could not be checked. Ask Codex to inspect the local network configuration."); }
    if (excludedPortOverlap(output))
      throw new StartupError("The reserved Windows port range includes the local Supabase ports 34320–34327. Ask Codex to choose a safe stable range.");
  }
}

async function appProbe() {
  const response = await endpoint(APP_HEALTH);
  if (!response) return await portHasListener(3000) ? "other" : "free";
  let payload = null;
  try { payload = await response.json(); } catch { /* unrelated response */ }
  return appHealthFromResponse(response.status, payload) && await appListenersPrivate() ? "ours" : "other";
}

async function databaseReady() {
  try {
    const db = await dockerInspect(`supabase_db_${PROJECT}`);
    if (!db || db.State?.Health?.Status !== "healthy" ||
        !db.Mounts?.some((mount) => mount.Type === "volume" && mount.Name === DB_VOLUME)) return false;
    await command("docker", ["exec", `supabase_db_${PROJECT}`, "pg_isready", "-U", "postgres"], { timeout: 5000 });
    return true;
  } catch { return false; }
}

async function projectReady(apiKey) {
  const [db, kong, authContainer, restContainer, studio, mail, analytics] = await Promise.all([
    dockerInspect(`supabase_db_${PROJECT}`), dockerInspect(`supabase_kong_${PROJECT}`),
    dockerInspect(`supabase_auth_${PROJECT}`), dockerInspect(`supabase_rest_${PROJECT}`),
    dockerInspect(`supabase_studio_${PROJECT}`),
    dockerInspect(`supabase_inbucket_${PROJECT}`), dockerInspect(`supabase_analytics_${PROJECT}`),
  ]);
  const volume = await existingVolume(DB_VOLUME) && await existingVolume(STORAGE_VOLUME);
  const loopback = [
    privatePort(kong, API_PORT), privatePort(db, 34322), privatePort(studio, 34323),
    privatePort(mail, 34324), privatePort(analytics, 34327),
  ].every(Boolean);
  const dbUp = await databaseReady();
  const authResponse = authContainer?.State?.Health?.Status === "healthy"
    ? await endpoint(`http://127.0.0.1:${API_PORT}/auth/v1/health`) : null;
  let authUp = false;
  if (authResponse?.ok) {
    try { authUp = (await authResponse.json()).name === "GoTrue"; } catch { /* unhealthy */ }
  }
  const apiResponse = restContainer?.State?.Running
    ? await endpoint(`http://127.0.0.1:${API_PORT}/rest/v1/`, {
        apikey: apiKey, Authorization: `Bearer ${apiKey}`,
      }) : null;
  let apiUp = false;
  if (apiResponse?.ok) {
    try { const body = await apiResponse.json(); apiUp = Boolean(body?.swagger || body?.openapi); }
    catch { /* unhealthy */ }
  }
  return supabaseReady({ volume, db: dbUp, auth: authUp, api: apiUp, loopback });
}

function installedDockerDesktop() {
  const local = process.env.LOCALAPPDATA;
  const program = process.env.ProgramFiles;
  return [
    local && join(local, "Programs", "DockerDesktop", "Docker Desktop.exe"),
    program && join(program, "Docker", "Docker", "Docker Desktop.exe"),
  ].find((candidate) => candidate && existsSync(candidate));
}

async function ensureDocker() {
  const ready = async () => {
    try { await command("docker", ["info", "--format", "{{.ServerVersion}}"], { timeout: 5000 }); return true; }
    catch { return false; }
  };
  if (await ready()) return;
  const desktop = installedDockerDesktop();
  if (!desktop) throw new StartupError("Docker Desktop could not be found. Ask Codex to restore the existing installation.");
  console.log("Starting Docker Desktop...");
  const child = spawn(desktop, [], { detached: true, stdio: "ignore", windowsHide: true });
  child.unref();
  if (!await pollUntil(ready, 120000, 2500))
    throw new StartupError("Docker Desktop did not become ready within two minutes. Open Docker Desktop to see its error, then retry.");
}

async function primaryCheckout() {
  try {
    const common = await command("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
    return dirname(resolve(root, common));
  } catch { return root; }
}

async function findCredentialFile(configuredPath) {
  const explicitPath = process.env.RPG_LOCAL_CREDENTIAL_FILE || configuredPath;
  if (explicitPath) {
    if (!isAbsolute(explicitPath))
      throw new StartupError("RPG_LOCAL_CREDENTIAL_FILE must be an absolute file path.");
    return explicitPath;
  }
  const candidates = [
    join(root, "test-results", "LOCAL_TEST_LOGIN.txt"),
    join(await primaryCheckout(), "test-results", "LOCAL_TEST_LOGIN.txt"),
  ];
  return candidates.find(existsSync);
}

async function findSupabaseCli() {
  if (process.env.RPG_SUPABASE_CLI) {
    if (!isAbsolute(process.env.RPG_SUPABASE_CLI))
      throw new StartupError("RPG_SUPABASE_CLI must be an absolute file path.");
    return process.env.RPG_SUPABASE_CLI;
  }
  const candidates = [
    join(root, "test-results", "supabase-cli", "supabase.exe"),
    join(await primaryCheckout(), "test-results", "supabase-cli", "supabase.exe"),
  ];
  for (const candidate of candidates) if (existsSync(candidate)) return candidate;
  try { await command("supabase", ["--version"]); return "supabase"; }
  catch { return null; }
}

async function ensureSupabase(apiKey) {
  if (!await existingVolume(DB_VOLUME) || !await existingVolume(STORAGE_VOLUME))
    throw new StartupError("The existing owner database or storage volume was not found. Startup stopped to protect campaign data.");
  if (!await privateNetworkReady())
    throw new StartupError("The private local Docker network was not found. Startup stopped to avoid exposing Supabase services to the LAN.");
  if (await projectReady(apiKey)) {
    console.log("Existing local database and Auth are ready.");
    return;
  }
  await portsAvailableOnWindows();
  const cli = await findSupabaseCli();
  if (!cli) throw new StartupError("The existing Supabase CLI was not found. Ask Codex to restore it; no database was created.");
  console.log("Starting the existing local Supabase project...");
  try { await command(cli, ["start", "--network-id", PRIVATE_NETWORK, "--exclude", "vector"], { timeout: 240000 }); }
  catch { throw new StartupError("The existing Supabase project did not start. No reset was attempted. Ask Codex to inspect Docker Desktop and the local port configuration."); }
  if (!await pollUntil(() => projectReady(apiKey), 60000, 2000))
    throw new StartupError("Supabase did not pass database, Auth, API, and loopback checks. Startup stopped without resetting data.");
}

function startBrowser() {
  const child = spawn("cmd.exe", ["/d", "/s", "/c", `start "" "${APP_URL}/campaigns"`], {
    detached: true, stdio: "ignore", windowsHide: true, windowsVerbatimArguments: true,
  });
  child.unref();
}

async function startApp(pnpm, credentials, localConfig) {
  if (!existsSync(join(root, "node_modules", "next", "dist", "bin", "next")))
    throw new StartupError("Application packages are missing. Ask Codex to restore the existing installation; the launcher does not install packages.");
  const spec = appProcessSpec(pnpm, credentials, process.env, localConfig);
  const child = spawn(spec.file, spec.args, {
    cwd: root, env: spec.env, detached: true, stdio: "ignore", windowsHide: true,
    windowsVerbatimArguments: true,
  });
  child.unref();
  if (!await pollUntil(async () => (await appProbe()) === "ours", 120000, 1500))
    throw new StartupError("The app did not become ready on 127.0.0.1:3000 within two minutes. Ask Codex to inspect the local app startup.");
}

export async function runStartup({ docker, supabase, probe, launch, browser }) {
  await docker();
  await supabase();
  const state = await probe();
  if (shouldStartApp(state)) await launch();
  browser();
}

function removeLock(lock) {
  try { unlinkSync(join(lock, "pid")); } catch (error) { if (error.code !== "ENOENT") throw error; }
  rmdirSync(lock);
}

async function holdStartupLock(action) {
  const lock = join(root, "node_modules", ".cache", "rpg-local-start.lock");
  mkdirSync(dirname(lock), { recursive: true });
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      mkdirSync(lock);
      writeFileSync(join(lock, "pid"), String(process.pid), { flag: "wx" });
      try { return await action(); } finally { removeLock(lock); }
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      let pid = 0;
      try { pid = Number(readFileSync(join(lock, "pid"), "utf8")); } catch { /* startup race */ }
      let alive = true;
      if (pid) {
        try { process.kill(pid, 0); } catch { alive = false; }
      }
      if (!alive) { removeLock(lock); continue; }
      console.log("Another launch is in progress. Waiting for it to finish...");
      if (await pollUntil(async () => !existsSync(lock), 240000, 2000)) continue;
      throw new StartupError("Another launch is still in progress. Wait for that window to finish, then retry.");
    }
  }
  throw new StartupError("Could not acquire the local startup lock. Ask Codex to check the previous launcher.");
}

async function main() {
  process.chdir(root);
  const dockerIndex = process.argv.indexOf("--docker");
  if (dockerIndex < 0 || !existsSync(process.argv[dockerIndex + 1] || ""))
    throw new StartupError("Docker CLI could not be found. Ask Codex to restore Docker Desktop.");
  dockerExecutable = process.argv[dockerIndex + 1];
  const index = process.argv.indexOf("--pnpm");
  const pnpm = index >= 0 ? process.argv[index + 1] : null;
  if (!pnpm || !existsSync(pnpm)) throw new StartupError("The existing pnpm executable could not be found.");
  const envPath = join(root, ".env.local");
  if (!existsSync(envPath)) throw new StartupError("The ignored .env.local file is missing. Ask Codex to restore the local configuration.");
  const values = parseDotEnv(readFileSync(envPath, "utf8"));
  const { apiKey } = validateLocalConfiguration(values);
  const credentialFile = await findCredentialFile(values.get("RPG_LOCAL_CREDENTIAL_FILE"));
  if (!credentialFile || !existsSync(credentialFile))
    throw new StartupError("The ignored local login file is missing. Ask Codex to restore LOCAL_TEST_LOGIN.txt or configure RPG_LOCAL_CREDENTIAL_FILE.");
  const credentials = parseCredentials(readFileSync(realpathSync(credentialFile), "utf8"));
  const localConfig = Object.fromEntries(values);
  await holdStartupLock(() => runStartup({
    docker: ensureDocker,
    supabase: () => ensureSupabase(apiKey),
    probe: appProbe,
    launch: () => startApp(pnpm, credentials, localConfig),
    browser: startBrowser,
  }));
  console.log("Personal RPG Console is opening at http://127.0.0.1:3000/campaigns.");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    const message = error instanceof StartupError ? error.message :
      "An unexpected local startup error occurred. Ask Codex to inspect the launcher.";
    console.error(`Startup stopped: ${message}`);
    process.exitCode = 1;
  });
}
