// Persona memory 2, Part G: the hosting kit (deploy/persona-memory/) and the owner's smoke test
// (scripts/persona-memory/smoke-test.mjs). The smoke test passes against a real server on this machine (header and
// token-in-the-address variants), fails loudly against an open or a mismatched one, and never shows the token. The
// deploy files agree with the server: the systemd unit, the env file, the Caddyfile, the Dockerfile (it copies every
// file the server imports) and fly.toml. Nothing here touches a real host.
import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { smokeTest, main } from "../scripts/persona-memory/smoke-test.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEPLOY = join(ROOT, "deploy", "persona-memory");
const SERVER = join(ROOT, "scripts", "persona-memory", "server.mjs");
const TOKEN = "synthetic-smoke-token-0123456789abcdef";
const dirs = [];
test.after(() => Promise.all(dirs.map((dir) => rm(dir, { recursive: true, force: true }))));

async function serverProcess(env) {
  const dir = await mkdtemp(join(tmpdir(), "persona-hosting-"));
  dirs.push(dir);
  const child = spawn(process.execPath, [SERVER, "--http", "--port", "0"], { env: { PATH: process.env.PATH, HOME: process.env.HOME, PERSONA_MEMORY_DIR: dir, ...env }, stdio: ["ignore", "ignore", "pipe"] });
  let stderr = "";
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  const url = await new Promise((resolveUrl, reject) => {
    child.stderr.on("data", () => { const match = stderr.match(/listening on (http:\/\/[^\s]+\/mcp)/); if (match) resolveUrl(match[1]); });
    child.on("exit", (code) => reject(new Error(`exited ${code}: ${stderr}`)));
  });
  return { url, stderr: () => stderr, stop: () => new Promise((done) => { child.once("exit", done); child.kill("SIGTERM"); }) };
}

test("the smoke test passes against a running server: health, refused without and with a wrong token, persona_now with it — and never shows the token", { timeout: 60_000 }, async () => {
  const server = await serverProcess({ PERSONA_MEMORY_TOKEN: TOKEN, PERSONA_MEMORY_TIMEZONE: "Europe/Moscow" });
  try {
    const results = await smokeTest({ url: server.url, token: TOKEN });
    assert.deepEqual(results.map((r) => [r.name, r.ok]), [["health", true], ["refused without the token", true], ["refused with a wrong token", true], ["persona_now with the token", true]]);
    assert.match(results[3].detail, /^13 tools; Now: .* \(UTC\+03:00\) — the owner's zone Europe\/Moscow/);
    const printed = [];
    assert.equal(await main(["--url", server.url], { PERSONA_MEMORY_TOKEN: TOKEN }, (line) => printed.push(line)), 0);
    assert.equal(printed.at(-1), "All 4 checks passed.");
    assert.ok(!printed.join("\n").includes(TOKEN) && !server.stderr().includes(TOKEN), "the token is in no output and no log");
    // The wrong token: the handshake check fails, and its message carries no token.
    const wrong = await smokeTest({ url: server.url, token: "another-synthetic-token-0123456789" });
    assert.equal(wrong[3].ok, false);
    assert.ok(!JSON.stringify(wrong).includes("another-synthetic-token"));
  } finally { await server.stop(); }
});

test("the smoke test with --path-token (the fallback for a connector without headers), and a reminder when the zone is UTC", { timeout: 60_000 }, async () => {
  const server = await serverProcess({ PERSONA_MEMORY_TOKEN: TOKEN, PERSONA_MEMORY_PATH_TOKEN: "1", PERSONA_MEMORY_TIMEZONE: "UTC" });
  try {
    const results = await smokeTest({ url: server.url, token: TOKEN, pathToken: true });
    assert.ok(results.every((r) => r.ok), JSON.stringify(results));
    assert.match(results[3].detail, /the zone is UTC; set PERSONA_MEMORY_TIMEZONE/);
    assert.ok(!JSON.stringify(results).includes(TOKEN));
  } finally { await server.stop(); }
});

test("the smoke test fails loudly against a server that answers without a token, and refuses to run without one", async () => {
  const open = createServer((req, res) => {
    if (req.url === "/health") res.writeHead(200).end("ok\n");
    else res.writeHead(200, { "content-type": "application/json" }).end('{"jsonrpc":"2.0","id":1,"result":{}}');
  });
  await new Promise((done) => open.listen(0, "127.0.0.1", done));
  try {
    const results = await smokeTest({ url: `http://127.0.0.1:${open.address().port}/mcp`, token: TOKEN, timeoutMs: 5000 });
    const refused = results.find((r) => r.name === "refused without the token");
    assert.equal(refused.ok, false);
    assert.match(refused.detail, /must never run open/);
  } finally { open.close(); }
  await assert.rejects(smokeTest({ url: "https://memory.example.invalid/mcp", token: undefined }), /PERSONA_MEMORY_TOKEN is not set/);
  await assert.rejects(smokeTest({ url: "https://memory.example.invalid/", token: TOKEN }), /ending in \/mcp/);
  const plain = await smokeTest({ url: "http://memory.example.invalid/mcp", token: TOKEN, fetcher: async () => { throw new Error("offline"); }, timeoutMs: 100 });
  assert.match(plain.find((r) => r.name === "https").detail, /not HTTPS/);
});

/** Every file the server loads, following relative imports from server.mjs. */
async function importGraph(start) {
  const seen = new Set(), queue = [start];
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    const text = await readFile(file, "utf8");
    for (const match of text.matchAll(/(?:^|\n)\s*(?:import|export)\s[^;]*?from\s+"(\.[^"]+)"|import\(\s*"(\.[^"]+)"\s*\)/g)) queue.push(resolve(dirname(file), match[1] ?? match[2]));
  }
  return [...seen].map((file) => relative(ROOT, file).replace(/\\/g, "/")).sort();
}

test("the deploy files agree with the server: the Docker image copies every file it imports; the ports, paths and flags match", async () => {
  const [dockerfile, fly, unit, env, caddy, backup, timer] = await Promise.all(["Dockerfile", "fly.toml", "persona-memory.service", "persona-memory.env.example", "Caddyfile",
    "persona-memory-backup.service", "persona-memory-backup.timer"].map((name) => readFile(join(DEPLOY, name), "utf8")));
  const copied = [...dockerfile.matchAll(/^COPY\s+(.+?)\s+\S+$/gm)].flatMap((m) => m[1].split(/\s+/));
  const files = await importGraph(SERVER);
  assert.ok(files.includes("src/lib/gameplay/dm-loop/tokens.ts") && files.includes("src/lib/persona-memory/clock.ts"), files.join(", "));
  for (const file of files) assert.ok(copied.some((source) => file === source || file.startsWith(`${source}/`)), `the Dockerfile does not copy ${file}`);
  assert.match(dockerfile, /^FROM node:24-/m);
  assert.match(dockerfile, /pnpm install --prod --frozen-lockfile/);
  assert.match(dockerfile, /CMD \["node", "scripts\/persona-memory\/server\.mjs", "--http", "--host", "0\.0\.0\.0", "--port", "8787"\]/);
  assert.match(fly, /internal_port = 8787/);
  assert.match(fly, /destination = "\/data"/);
  assert.match(fly, /PERSONA_MEMORY_DIR = "\/data"/);
  assert.match(fly, /path = "\/health"/);
  assert.ok(!/PERSONA_MEMORY_TOKEN\s*=/.test(fly), "the token is a Fly secret, never in fly.toml");
  // The VPS: the server listens on this machine only; Caddy serves 443 and proxies to it; the token file is root's.
  assert.match(unit, /^ExecStart=\/opt\/node24\/bin\/node scripts\/persona-memory\/server\.mjs --http --host 127\.0\.0\.1 --port 8787$/m);
  assert.match(unit, /^EnvironmentFile=\/etc\/persona-memory\.env$/m);
  assert.match(unit, /^User=persona$/m);
  assert.match(unit, /^ReadWritePaths=\/var\/lib\/persona-memory$/m);
  assert.match(env, /^PERSONA_MEMORY_DIR=\/var\/lib\/persona-memory$/m);
  assert.match(env, /install -m 600 -o root -g root/);
  assert.match(env, /^PERSONA_MEMORY_TOKEN=<paste the token here>$/m, "the example holds a placeholder, never a token");
  assert.match(caddy, /reverse_proxy 127\.0\.0\.1:8787/);
  assert.match(caddy, /disable_http_challenge/);
  assert.ok(!/^\s*log\b/m.test(caddy), "no access log: the fallback address carries the token");
  assert.match(backup, /tar -czf \/var\/backups\/persona-memory\/persona-memory-\$\(date \+%%F\)\.tar\.gz -C \/var\/lib persona-memory/);
  assert.match(timer, /^OnCalendar=\*-\*-\* 03:30:00$/m);
});
