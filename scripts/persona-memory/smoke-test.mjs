#!/usr/bin/env node
// Persona memory 2, Part G (docs/stages/PERSONA_MEMORY_2.md, docs/PERSONA_MEMORY.md «Hosting»): the smoke test the
// owner runs after deploying the memory server. Four checks: /health answers; a call without the token is refused; a
// call with a wrong token is refused; with the token, the MCP handshake works and persona_now answers. It reads only
// (persona_now writes nothing), and it never prints the token.
//
//   node --env-file=.env.persona scripts/persona-memory/smoke-test.mjs --url https://<your address>/mcp
//   options: --path-token   the server takes the token as the URL's last part (PERSONA_MEMORY_PATH_TOKEN=1)
//
// The token comes from PERSONA_MEMORY_TOKEN (the .env.persona file), never from the command line.
import { randomBytes } from "node:crypto";
import { pathToFileURL } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const INITIALIZE = { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "persona-memory-smoke-test", version: "1.0.0" } } };

/** Runs the four checks against a deployed server; returns one line per check, the token never in them. */
export async function smokeTest({ url, token, pathToken = false, fetcher = fetch, timeoutMs = 20_000 }) {
  const base = new URL(url);
  if (!/\/mcp\/?$/.test(base.pathname)) throw new Error("--url is the server's MCP address, ending in /mcp");
  if (typeof token !== "string" || token.length < 24) throw new Error("PERSONA_MEMORY_TOKEN is not set (or shorter than 24 characters): run it with --env-file=.env.persona");
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname);
  const mcpUrl = base.href.replace(/\/$/, "");
  const withToken = pathToken ? `${mcpUrl}/${encodeURIComponent(token)}` : mcpUrl;
  const shown = pathToken ? `${mcpUrl}/<token>` : mcpUrl;
  const results = [];
  const check = async (name, work) => {
    try { results.push({ name, ok: true, detail: await work() }); } catch (error) { results.push({ name, ok: false, detail: String(error?.message ?? error).replaceAll(token, "<token>").slice(0, 300) }); }
  };
  const post = (target, headers = {}) => fetcher(target, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream", ...headers },
    body: JSON.stringify(INITIALIZE), signal: AbortSignal.timeout(timeoutMs) });

  if (base.protocol !== "https:" && !local) results.push({ name: "https", ok: false, detail: `${base.origin} is not HTTPS — the claude.ai connector needs an https:// address` });
  await check("health", async () => {
    const response = await fetcher(new URL("/health", base).href, { signal: AbortSignal.timeout(timeoutMs) });
    const text = (await response.text()).trim();
    if (response.status !== 200 || text !== "ok") throw new Error(`${new URL("/health", base).href} answered ${response.status} «${text.slice(0, 60)}», expected 200 «ok»`);
    return `${new URL("/health", base).href} answered 200 ok`;
  });
  await check("refused without the token", async () => {
    const response = await post(mcpUrl);
    if (response.status !== 401) throw new Error(`a call without the token got ${response.status}, expected 401 — the server must never run open`);
    return "401";
  });
  await check("refused with a wrong token", async () => {
    const wrong = randomBytes(24).toString("base64url");
    const response = pathToken ? await post(`${mcpUrl}/${wrong}`) : await post(mcpUrl, { authorization: `Bearer ${wrong}` });
    if (response.status !== 401) throw new Error(`a call with a wrong token got ${response.status}, expected 401`);
    return "401";
  });
  await check("persona_now with the token", async () => {
    const client = new Client({ name: "persona-memory-smoke-test", version: "1.0.0" });
    const transport = new StreamableHTTPClientTransport(new URL(withToken), { fetch: fetcher, ...(pathToken ? {} : { requestInit: { headers: { authorization: `Bearer ${token}` } } }) });
    await client.connect(transport);
    try {
      const server = client.getServerVersion();
      if (server?.name !== "persona-memory") throw new Error(`the server at ${shown} is «${server?.name}», not persona-memory`);
      const tools = (await client.listTools()).tools.map((tool) => tool.name);
      if (!tools.includes("persona_now")) throw new Error(`persona_now is not among the tools (${tools.length}): is the server older than persona memory 2?`);
      const answer = await client.callTool({ name: "persona_now", arguments: {} });
      const text = (answer.content ?? []).map((part) => part.text ?? "").join("\n");
      if (answer.isError || !text.startsWith("Now:")) throw new Error(`persona_now did not answer with the time: «${text.slice(0, 120)}»`);
      const first = text.split("\n")[0];
      return `${tools.length} tools; ${first}${/the owner's zone UTC\b/.test(first) ? " — note: the zone is UTC; set PERSONA_MEMORY_TIMEZONE to yours" : ""}`;
    } finally { await client.close().catch(() => {}); }
  });
  return results;
}

function option(args, name) {
  const at = args.indexOf(name);
  return at >= 0 ? args[at + 1] : undefined;
}

export async function main(args = process.argv.slice(2), env = process.env, out = (line) => process.stdout.write(`${line}\n`)) {
  const url = option(args, "--url");
  if (!url) throw new Error("usage: node --env-file=.env.persona scripts/persona-memory/smoke-test.mjs --url https://<your address>/mcp [--path-token]");
  const results = await smokeTest({ url, token: env.PERSONA_MEMORY_TOKEN, pathToken: args.includes("--path-token") });
  for (const result of results) out(`${result.ok ? "PASS" : "FAIL"} ${result.name}: ${result.detail}`);
  const failed = results.filter((result) => !result.ok).length;
  out(failed ? `${failed} of ${results.length} checks failed.` : `All ${results.length} checks passed.`);
  return failed;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().then((failed) => process.exit(failed ? 1 : 0), (error) => { process.stderr.write(`smoke-test: ${String(error?.message ?? error)}\n`); process.exit(2); });
}
