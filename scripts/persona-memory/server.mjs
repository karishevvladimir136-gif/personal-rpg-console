#!/usr/bin/env node
// Persona memory 1, Part B (docs/stages/PERSONA_MEMORY_1.md, owner's guide docs/PERSONA_MEMORY.md): the memory server.
// MCP over stdio (Claude Code) and over Streamable HTTP with a bearer token (the claude.ai Project as a custom
// connector). Tools: persona_remember, persona_recall, persona_journal_latest, persona_dossier_read,
// persona_dossier_append, persona_note, persona_fold, persona_export (src/lib/persona-memory/tools.ts); persona memory 2
// adds the clock: persona_now, persona_timer_start, persona_timer_check, persona_timer_finish, persona_calibration_read.
//
//   node scripts/persona-memory/server.mjs --stdio
//   PERSONA_MEMORY_TOKEN=… node scripts/persona-memory/server.mjs --http [--port 8787] [--host 127.0.0.1]
//
// Environment: PERSONA_MEMORY_BACKEND files (default) | postgres; PERSONA_MEMORY_DIR (files; default ~/persona-memory);
// PERSONA_MEMORY_SUPABASE_URL, PERSONA_MEMORY_SUPABASE_SERVICE_KEY, PERSONA_MEMORY_OWNER_ID (postgres);
// PERSONA_MEMORY_EMBEDDINGS local (default) | openai (with OPENAI_API_KEY); PERSONA_MEMORY_TIMEZONE (the owner's IANA
// zone, e.g. Europe/Moscow; default the machine's — a hosted server's is usually UTC); PERSONA_MEMORY_TOKEN (http);
// PERSONA_MEMORY_PATH_TOKEN=1 also accepts the token as the last part of the URL (/mcp/<token>) for a client that
// cannot send a header. No key or token is ever logged: the log has the transport, the tool names and the statuses.
import { createServer } from "node:http";
import { createHash, timingSafeEqual } from "node:crypto";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { createPersonaMemory, filesStore, localEmbedder, openAIEmbedder, postgresStore, rpcFunction } from "../../src/lib/persona-memory/index.ts";
import { PERSONA_TOOLS, SERVER_INSTRUCTIONS, SERVER_NAME, SERVER_VERSION, callTool } from "../../src/lib/persona-memory/tools.ts";

const log = (line) => process.stderr.write(`persona-memory: ${line}\n`);
const MAX_BODY = 1_000_000;

/** One MCP server over a memory; a new one per HTTP request (stateless), one for the stdio session. */
export function mcpServer(memory, write = log) {
  const server = new Server({ name: SERVER_NAME, version: SERVER_VERSION }, { capabilities: { tools: {} }, instructions: SERVER_INSTRUCTIONS });
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: PERSONA_TOOLS }));
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const started = Date.now();
    const result = await callTool(memory, request.params.name, request.params.arguments ?? {});
    write(`tool ${request.params.name} ${result.isError ? "refused" : "ok"} ${Date.now() - started}ms`);
    return { content: [{ type: "text", text: result.text }], isError: result.isError };
  });
  return server;
}

export async function memoryFromEnv(env = process.env) {
  const backend = env.PERSONA_MEMORY_BACKEND || "files";
  let store, where;
  if (backend === "files") {
    const dir = resolve(env.PERSONA_MEMORY_DIR || join(homedir(), "persona-memory"));
    store = filesStore(dir);
    where = `files at ${dir}`;
  } else if (backend === "postgres") {
    const missing = ["PERSONA_MEMORY_SUPABASE_URL", "PERSONA_MEMORY_SUPABASE_SERVICE_KEY", "PERSONA_MEMORY_OWNER_ID"].filter((name) => !env[name]);
    if (missing.length) throw new Error(`the postgres backend needs ${missing.join(", ")}`);
    const { createClient } = await import("@supabase/supabase-js");
    const client = createClient(env.PERSONA_MEMORY_SUPABASE_URL, env.PERSONA_MEMORY_SUPABASE_SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    store = postgresStore(async (action, payload) => {
      const { data, error } = await client.rpc(rpcFunction(action), { p_owner_id: env.PERSONA_MEMORY_OWNER_ID, p_action: action, p_payload: payload });
      if (error) throw new Error(error.message);
      return data;
    });
    where = "postgres (Supabase)";
  } else throw new Error("PERSONA_MEMORY_BACKEND: files or postgres");
  let embedder = localEmbedder();
  if (env.PERSONA_MEMORY_EMBEDDINGS === "openai") {
    if (!env.OPENAI_API_KEY) throw new Error("PERSONA_MEMORY_EMBEDDINGS=openai needs OPENAI_API_KEY");
    embedder = openAIEmbedder({ apiKey: env.OPENAI_API_KEY, model: env.PERSONA_MEMORY_EMBEDDINGS_MODEL || undefined });
  }
  const memory = createPersonaMemory({ store, embedder, timeZone: env.PERSONA_MEMORY_TIMEZONE || undefined });
  return { memory, where: `${where}, embeddings ${embedder.model}, time zone ${memory.timeZone}` };
}

export async function startStdio(memory) {
  await mcpServer(memory).connect(new StdioServerTransport());
}

const digest = (text) => createHash("sha256").update(text).digest();

/** Streamable HTTP, stateless: every POST /mcp is one JSON-RPC exchange answered as JSON. Refuses to start without a
 * long token; compares it in constant time; never logs the URL path (it may carry the token) or any header. */
export function startHttp(memory, { token, port = 8787, host = "127.0.0.1", pathToken = false } = {}) {
  if (typeof token !== "string" || token.length < 24) throw new Error("PERSONA_MEMORY_TOKEN must be set to a long random secret (24+ characters); the HTTP server never runs open");
  const expected = digest(token);
  const accepted = (candidate) => typeof candidate === "string" && candidate.length > 0 && timingSafeEqual(digest(candidate), expected);
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const viaPath = pathToken && url.pathname.startsWith("/mcp/");
    const isMcp = url.pathname === "/mcp" || viaPath;
    res.on("finish", () => log(`http ${req.method} ${isMcp ? "/mcp" : url.pathname === "/health" ? "/health" : "(other)"} ${res.statusCode}`));
    if (url.pathname === "/health" && req.method === "GET") { res.writeHead(200, { "content-type": "text/plain" }).end("ok\n"); return; }
    if (!isMcp) { res.writeHead(404, { "content-type": "text/plain" }).end("not found\n"); return; }
    const bearer = /^Bearer\s+(.+)$/i.exec(req.headers.authorization ?? "")?.[1]?.trim();
    const fromPath = viaPath ? decodeURIComponent(url.pathname.slice("/mcp/".length)) : undefined;
    if (!accepted(bearer) && !accepted(fromPath)) {
      res.writeHead(401, { "content-type": "application/json", "www-authenticate": 'Bearer realm="persona-memory"' })
        .end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32001, message: "unauthorized" }, id: null }));
      return;
    }
    if (req.method !== "POST") {
      res.writeHead(405, { allow: "POST", "content-type": "application/json" }).end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32000, message: "method not allowed (stateless server: POST only)" }, id: null }));
      return;
    }
    let body;
    try {
      const chunks = [];
      let size = 0;
      for await (const chunk of req) { size += chunk.length; if (size > MAX_BODY) throw new Error("too large"); chunks.push(chunk); }
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      res.writeHead(400, { "content-type": "application/json" }).end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32700, message: "parse error" }, id: null }));
      return;
    }
    const mcp = mcpServer(memory);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    res.on("close", () => { transport.close().catch(() => {}); mcp.close().catch(() => {}); });
    try {
      await mcp.connect(transport);
      await transport.handleRequest(req, res, body);
    } catch (error) {
      log(`http request failed: ${String(error?.message ?? error).slice(0, 120)}`);
      if (!res.headersSent) res.writeHead(500, { "content-type": "application/json" }).end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32603, message: "internal error" }, id: null }));
    }
  });
  return new Promise((resolveListening, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => { server.off("error", reject); resolveListening(server); });
  });
}

function option(args, name) {
  const at = args.indexOf(name);
  return at >= 0 ? args[at + 1] : undefined;
}

async function main(args = process.argv.slice(2), env = process.env) {
  const http = args.includes("--http");
  const { memory, where } = await memoryFromEnv(env);
  if (!http) {
    await startStdio(memory);
    log(`stdio, ${where}`);
    return;
  }
  const server = await startHttp(memory, { token: env.PERSONA_MEMORY_TOKEN, port: Number(option(args, "--port") ?? env.PERSONA_MEMORY_PORT ?? 8787),
    host: option(args, "--host") ?? env.PERSONA_MEMORY_HOST ?? "127.0.0.1", pathToken: env.PERSONA_MEMORY_PATH_TOKEN === "1" });
  const address = server.address();
  log(`http listening on http://${address.address}:${address.port}/mcp${env.PERSONA_MEMORY_PATH_TOKEN === "1" ? " (the token is also accepted as /mcp/<token>)" : ""}, ${where}`);
  const stop = () => server.close(() => process.exit(0));
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => { log(`could not start: ${String(error?.message ?? error)}`); process.exit(1); });
}
