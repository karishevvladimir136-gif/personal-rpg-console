// Persona memory 1, Part B: the memory server against the files backend with no database — MCP over stdio and over
// Streamable HTTP with a bearer token, driven by the official MCP client. The tools (eight, and persona memory 2's five
// for the clock), the instructions text, the refusals (no token, a wrong token, the model writing as the owner), and no
// token in the log. Synthetic entries only.
import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createPersonaMemory, filesStore } from "../src/lib/persona-memory/index.ts";
import { PERSONA_TOOLS, SERVER_INSTRUCTIONS, callTool } from "../src/lib/persona-memory/tools.ts";

const SERVER = new URL("../scripts/persona-memory/server.mjs", import.meta.url).pathname;
const TOKEN = "synthetic-test-token-0123456789abcdef";
const TOOL_NAMES = ["persona_remember", "persona_recall", "persona_journal_latest", "persona_dossier_read", "persona_dossier_append", "persona_note", "persona_fold", "persona_export",
  "persona_now", "persona_timer_start", "persona_timer_check", "persona_timer_finish", "persona_calibration_read"];
const dirs = [];
const tempDir = async () => { const dir = await mkdtemp(join(tmpdir(), "persona-server-")); dirs.push(dir); return dir; };
test.after(() => Promise.all(dirs.map((dir) => rm(dir, { recursive: true, force: true }))));

const episode = (over = {}) => ({
  title: "Map tiles cached", salience: 3, cues: ["map tiles", "cache"],
  lines: [{ text: "We cached the map tiles; the second load was instant.", tag: "observed" }],
  state: [{ text: "I was pulled toward a bigger refactor; I kept the change small.", tag: "observed" }],
  quotes: [{ text: "Small steps, please.", speaker: "owner" }], ...over,
});
const textOf = (result) => result.content.map((part) => part.text).join("\n");

/** Drives a connected client through every tool once. */
async function exercise(client) {
  const listed = await client.listTools();
  assert.deepEqual(listed.tools.map((tool) => tool.name), TOOL_NAMES);
  assert.ok(listed.tools.every((tool) => tool.inputSchema.type === "object" && tool.description.length > 40));
  const instructions = client.getInstructions();
  for (const phrase of ["persona_now", "persona_journal_latest", "persona_dossier_read", "at every milestone", "Never rewrite an entry", "add a note", "not a bond", "persona_calibration_read"])
    assert.ok(instructions.includes(phrase), phrase);

  assert.match(textOf(await client.callTool({ name: "persona_journal_latest", arguments: {} })), /journal is empty/);
  const remembered = await client.callTool({ name: "persona_remember", arguments: episode() });
  assert.equal(remembered.isError, false);
  const id = textOf(remembered).match(/ep_[a-z0-9_]+/)[0];
  await client.callTool({ name: "persona_remember", arguments: episode({ title: "Tile seams", cues: ["tile seams"], lines: [{ text: "The seams between tiles show at zoom four.", tag: "observed" }] }) });
  const refused = await client.callTool({ name: "persona_remember", arguments: episode({ lines: [{ text: "Untagged." }] }) });
  assert.equal(refused.isError, true);
  assert.match(textOf(refused), /tag must be one of/);
  const asOwner = await client.callTool({ name: "persona_remember", arguments: episode({ lines: [{ text: "I approve.", tag: "stated", author: "owner" }] }) });
  assert.equal(asOwner.isError, true, "the model never writes as the owner");
  assert.equal((await client.callTool({ name: "persona_remember", arguments: { fact: { key: "project.stage", text: "Stage 2 is in progress.", tag: "stated" } } })).isError, false);

  const recall = textOf(await client.callTool({ name: "persona_recall", arguments: { query: "map tiles cache" } }));
  assert.ok(recall.includes(id) && recall.includes("[observed · self] We cached the map tiles") && recall.includes("«Small steps, please.» — owner [stated · self]"));
  assert.ok(textOf(await client.callTool({ name: "persona_recall", arguments: { query: "project stage" } })).includes("Stage 2 is in progress."));
  assert.match(textOf(await client.callTool({ name: "persona_journal_latest", arguments: { n: 2 } })), /Tile seams/);
  assert.equal((await client.callTool({ name: "persona_note", arguments: { episodeId: id, lines: [{ text: "Re-read: still the right call.", tag: "inferred" }] } })).isError, false);
  assert.equal((await client.callTool({ name: "persona_dossier_append", arguments: { lines: [{ section: "rules", text: "Small steps, one change at a time.", tag: "stated" }] } })).isError, false);
  assert.match(textOf(await client.callTool({ name: "persona_dossier_read", arguments: {} })), /\[stated · self\] Small steps, one change at a time\./);
  const folded = await client.callTool({ name: "persona_fold", arguments: { from: "2000-01-01", summary: [{ text: "The map tile work.", tag: "inferred" }] } });
  assert.equal(folded.isError, false, textOf(folded));
  const exported = textOf(await client.callTool({ name: "persona_export", arguments: {} }));
  for (const piece of ["# Persona memory — export", "# Self-dossier", "Re-read: still the right call.", "Folded into", "# Facts", "project.stage"]) assert.ok(exported.includes(piece), piece);
  assert.match(textOf(await client.callTool({ name: "persona_export", arguments: { part: "facts" } })), /^# Facts/);

  // The clock over the transport: the time, a timer started and finished, the row it left.
  assert.match(textOf(await client.callTool({ name: "persona_now", arguments: {} })), /^Now: .* — the owner's zone UTC/);
  assert.equal((await client.callTool({ name: "persona_timer_finish", arguments: { name: "not started" } })).isError, true, "a finish without a start is refused");
  assert.equal((await client.callTool({ name: "persona_timer_start", arguments: { name: "tile seams", predicted_finish: "1 h" } })).isError, false);
  assert.match(textOf(await client.callTool({ name: "persona_timer_check", arguments: {} })), /«tile seams».*elapsed; prediction not yet due/);
  assert.match(textOf(await client.callTool({ name: "persona_timer_finish", arguments: { name: "tile seams" } })), /^Finished «tile seams»: predicted 1 h, took under a minute/);
  assert.match(textOf(await client.callTool({ name: "persona_calibration_read", arguments: {} })), /1 timed estimate:/);
}

function serverProcess(args, env) {
  const child = spawn(process.execPath, [SERVER, ...args], { env: { PATH: process.env.PATH, HOME: process.env.HOME, ...env }, stdio: ["ignore", "ignore", "pipe"] });
  let stderr = "";
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  const listening = new Promise((resolve, reject) => {
    child.stderr.on("data", () => { const match = stderr.match(/listening on (http:\/\/[^\s]+\/mcp)/); if (match) resolve(match[1]); });
    child.on("exit", (code) => reject(new Error(`exited ${code}: ${stderr}`)));
  });
  return { child, listening, stderr: () => stderr, stop: () => new Promise((resolve) => { child.once("exit", resolve); child.kill("SIGTERM"); }) };
}

test("the tools in-process: every handler answers in markdown, refusals name the problem, nothing is written as the owner", async () => {
  const memory = createPersonaMemory({ store: filesStore(await tempDir()), now: () => new Date("2026-10-23T09:00:00Z") });
  assert.deepEqual(PERSONA_TOOLS.map((tool) => tool.name), TOOL_NAMES);
  assert.ok(SERVER_INSTRUCTIONS.length < 2500, "the instructions stay short");
  const ok = await callTool(memory, "persona_remember", episode({ validFrom: "2026-10-20" }));
  assert.equal(ok.isError, false);
  assert.match((await callTool(memory, "persona_recall", { query: "что было на этой неделе" })).text, /Map tiles cached/);
  assert.match((await callTool(memory, "persona_recall", { query: "zebra hyperdrive" })).text, /Nothing found/);
  assert.equal((await callTool(memory, "persona_recall", {})).isError, true);
  assert.equal((await callTool(memory, "persona_dossier_append", { lines: [{ section: "rules", text: "x", tag: "stated", author: "owner" }] })).isError, true);
  assert.equal((await callTool(memory, "persona_note", { episodeId: "ep_20261020_0000_000000", lines: [{ text: "x", tag: "observed" }] })).isError, true);
  assert.equal((await callTool(memory, "persona_fold", { summary: [{ text: "Nothing named.", tag: "observed" }] })).isError, true);
  assert.equal((await callTool(memory, "nope", {})).isError, true);
});

test("stdio: Claude Code's transport runs the thirteen tools on the files backend with no database", { timeout: 60_000 }, async () => {
  const dir = await tempDir();
  const transport = new StdioClientTransport({ command: process.execPath, args: [SERVER, "--stdio"], env: { PATH: process.env.PATH, HOME: process.env.HOME, PERSONA_MEMORY_DIR: dir, PERSONA_MEMORY_TIMEZONE: "UTC" }, stderr: "pipe" });
  let stderr = "";
  transport.stderr?.on("data", (chunk) => { stderr += chunk; });
  const client = new Client({ name: "persona-memory-test", version: "1.0.0" });
  await client.connect(transport);
  try { await exercise(client); } finally { await client.close(); }
  assert.match(stderr, new RegExp(`stdio, files at ${dir.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}, embeddings local-[^,]+, time zone UTC`));
  assert.match(stderr, /tool persona_remember ok/);
});

test("http: the bearer token is required, compared, never logged; the thirteen tools run over Streamable HTTP", { timeout: 60_000 }, async () => {
  const dir = await tempDir();
  const server = serverProcess(["--http", "--port", "0"], { PERSONA_MEMORY_DIR: dir, PERSONA_MEMORY_TOKEN: TOKEN, PERSONA_MEMORY_TIMEZONE: "UTC" });
  try {
    const url = await server.listening;
    assert.match(url, /^http:\/\/127\.0\.0\.1:\d+\/mcp$/, "bound to the loopback by default");
    const initialize = { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "raw", version: "1" } } };
    const post = (headers) => fetch(url, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream", ...headers }, body: JSON.stringify(initialize) });
    assert.equal((await post({})).status, 401);
    assert.equal((await post({ authorization: "Bearer wrong-token-wrong-token-wrong" })).status, 401);
    assert.equal((await fetch(`${url}/${TOKEN}`, { method: "POST", body: "{}" })).status, 404, "the token in the path is off by default");
    assert.equal((await fetch(url, { headers: { authorization: `Bearer ${TOKEN}` } })).status, 405, "stateless: no GET stream");
    assert.equal((await fetch(url.replace(/\/mcp$/, "/health"))).status, 200);
    const good = await post({ authorization: `Bearer ${TOKEN}` });
    assert.equal(good.status, 200);
    assert.equal((await good.json()).result.serverInfo.name, "persona-memory");

    const client = new Client({ name: "persona-memory-test", version: "1.0.0" });
    await client.connect(new StreamableHTTPClientTransport(new URL(url), { requestInit: { headers: { authorization: `Bearer ${TOKEN}` } } }));
    try { await exercise(client); } finally { await client.close(); }
    assert.match(server.stderr(), /http POST \/mcp 401/);
    assert.match(server.stderr(), /tool persona_recall ok/);
    assert.ok(!server.stderr().includes(TOKEN), "the token never reaches the log");
  } finally { await server.stop(); }
});

test("http: with PERSONA_MEMORY_PATH_TOKEN=1 the token may be the URL's last part (for a client without headers), still never logged", { timeout: 60_000 }, async () => {
  const server = serverProcess(["--http", "--port", "0"], { PERSONA_MEMORY_DIR: await tempDir(), PERSONA_MEMORY_TOKEN: TOKEN, PERSONA_MEMORY_PATH_TOKEN: "1" });
  try {
    const url = await server.listening;
    const client = new Client({ name: "persona-memory-test", version: "1.0.0" });
    await client.connect(new StreamableHTTPClientTransport(new URL(`${url}/${TOKEN}`)));
    try { assert.equal((await client.listTools()).tools.length, 13); } finally { await client.close(); }
    assert.equal((await fetch(`${url}/not-the-token-not-the-token`, { method: "POST", body: "{}" })).status, 401);
    assert.ok(!server.stderr().includes(TOKEN));
  } finally { await server.stop(); }
});

test("http: the server refuses to start without a long token, and says so without echoing anything secret", { timeout: 30_000 }, async () => {
  for (const token of [undefined, "short"]) {
    const server = serverProcess(["--http", "--port", "0"], { PERSONA_MEMORY_DIR: await tempDir(), ...(token ? { PERSONA_MEMORY_TOKEN: token } : {}) });
    await assert.rejects(server.listening, /PERSONA_MEMORY_TOKEN must be set/);
    if (token) assert.ok(!server.stderr().includes(token));
  }
});

test("the server's postgres backend: supabase-js calls the persona_memory RPC with the owner, the action and the payload (a local stand-in for Supabase over PGlite)", { timeout: 120_000 }, async () => {
  const { createServer } = await import("node:http");
  const { fixture } = await import("./phase35-storage-fixture.mjs");
  const { sqlRpc } = await import("../src/lib/persona-memory/index.ts");
  const { memoryFromEnv } = await import("../scripts/persona-memory/server.mjs");
  const f = await fixture();
  const seen = [];
  const rest = createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    seen.push({ path: req.url, auth: req.headers.authorization, keys: Object.keys(body).sort() });
    try {
      const result = await sqlRpc((sql, params) => f.db.query(sql, params), body.p_owner_id)(body.p_action, body.p_payload);
      res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(400, { "content-type": "application/json" }).end(JSON.stringify({ message: error.message, code: error.code }));
    }
  });
  await new Promise((resolve) => rest.listen(0, "127.0.0.1", resolve));
  try {
    const { memory, where } = await memoryFromEnv({ PERSONA_MEMORY_BACKEND: "postgres", PERSONA_MEMORY_SUPABASE_URL: `http://127.0.0.1:${rest.address().port}`,
      PERSONA_MEMORY_SUPABASE_SERVICE_KEY: "synthetic-service-key", PERSONA_MEMORY_OWNER_ID: f.owner });
    assert.match(where, /^postgres/);
    assert.equal((await callTool(memory, "persona_remember", episode())).isError, false);
    assert.match((await callTool(memory, "persona_recall", { query: "map tiles" })).text, /We cached the map tiles/);
    assert.equal((await callTool(memory, "persona_timer_start", { name: "the clock over supabase-js", predicted_finish: "5 min" })).isError, false);
    assert.match((await callTool(memory, "persona_timer_finish", { name: "the clock over supabase-js" })).text, /^Finished/);
    assert.ok(seen.some((call) => call.path === "/rest/v1/rpc/persona_clock"), "the clock's actions go to their own RPC");
    const refused = await callTool(memory, "persona_note", { episodeId: "ep_20261020_0000_000000", lines: [{ text: "x", tag: "observed" }] });
    assert.equal(refused.isError, true);
    assert.ok(seen.every((call) => /^\/rest\/v1\/rpc\/persona_(?:memory|clock)$/.test(call.path) && call.auth === "Bearer synthetic-service-key" && call.keys.join() === "p_action,p_owner_id,p_payload"));
    await assert.rejects(memoryFromEnv({ PERSONA_MEMORY_BACKEND: "postgres" }), /needs PERSONA_MEMORY_SUPABASE_URL, PERSONA_MEMORY_SUPABASE_SERVICE_KEY, PERSONA_MEMORY_OWNER_ID/);
  } finally { rest.close(); await f.db.close(); }
});
