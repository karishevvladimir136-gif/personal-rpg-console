import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";

// Review the current integration checkout without changing it. Every database
// and provider response used by this suite is disposable and synthetic.
export const sourceRoot = process.env.D2A_QA_SOURCE_ROOT
  ? pathToFileURL(
      `${process.env.D2A_QA_SOURCE_ROOT.replaceAll("\\", "/").replace(/\/$/, "")}/`,
    )
  : new URL("../", import.meta.url);
export const source = (path) => new URL(path, sourceRoot);
export const moduleFromSource = (path) => import(source(path).href);
export const sourceText = (path) => readFile(source(path), "utf8");
export function leafRoot(variable) {
  return process.env[variable]
    ? pathToFileURL(
        `${process.env[variable].replaceAll("\\", "/").replace(/\/$/, "")}/`,
      )
    : sourceRoot;
}

export async function serverModule(path, root = sourceRoot) {
  const hook = registerHooks({
    resolve(specifier, context, nextResolve) {
      return specifier === "server-only"
        ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
        : nextResolve(specifier, context);
    },
  });
  try {
    return await import(new URL(path, root).href);
  } finally {
    hook.deregister();
  }
}

export const providerOptions = {
  apiKey: "SYNTHETIC_D2A_QA_ONLY",
  model: "gpt-6-astra",
  reasoning: "max",
};
export function providerResponse(output, options = {}) {
  return new Response(
    JSON.stringify({
      model: Object.hasOwn(options, "model")
        ? options.model
        : providerOptions.model,
      status: "completed",
      output: [
        {
          type: "message",
          role: "assistant",
          status: "completed",
          content: options.refusal
            ? [{ type: "refusal", refusal: "SYNTHETIC_PRIVATE_REFUSAL" }]
            : [
                {
                  type: "output_text",
                  text: options.raw ?? JSON.stringify(output),
                },
              ],
        },
      ],
      usage: { input_tokens: 31, output_tokens: 17 },
    }),
  );
}
export function scriptedProvider(output, responseOptions = {}) {
  const requests = [],
    attempts = [];
  return {
    requests,
    attempts,
    options: {
      ...providerOptions,
      observer: (attempt) => attempts.push(attempt),
      fetcher: async (url, init) => {
        assert.equal(url, "https://api.openai.com/v1/responses");
        assert.equal(init.method, "POST");
        const body = JSON.parse(init.body);
        requests.push(body);
        if (responseOptions.beforeResponse)
          await responseOptions.beforeResponse(body);
        if (responseOptions.throw)
          throw new Error("SYNTHETIC_PRIVATE_NETWORK_ERROR");
        if (responseOptions.status)
          return new Response(
            JSON.stringify({
              error: { message: "SYNTHETIC_PRIVATE_PROVIDER_ERROR" },
            }),
            { status: responseOptions.status },
          );
        return providerResponse(
          typeof output === "function" ? await output(body) : output,
          responseOptions,
        );
      },
    },
  };
}
export function assertStrictSchema(schema) {
  if (schema.type === "object") {
    assert.equal(schema.additionalProperties, false);
    assert.deepEqual(
      new Set(schema.required),
      new Set(Object.keys(schema.properties)),
    );
  }
  for (const child of Object.values(schema.properties ?? {}))
    assertStrictSchema(child);
  for (const child of schema.anyOf ?? []) assertStrictSchema(child);
  if (schema.items) assertStrictSchema(schema.items);
}
export async function sqlFixture(options) {
  const { d2aFixture } = await moduleFromSource("tests/d2a-sql-fixture.mjs");
  const f = await d2aFixture(options),
    call = f.lab;
  f.lab = async (...args) => {
    try {
      return await call(...args);
    } catch (error) {
      const safe = new Error(error.message);
      safe.code = error.code;
      safe.where = error.where;
      safe.internalQuery = error.internalQuery;
      throw safe;
    }
  };
  return f;
}

export function timeoutFetcher(onRequest) {
  return async (_url, init) => {
    onRequest(JSON.parse(init.body));
    await new Promise((_, reject) => {
      const guard = setTimeout(
        () => reject(new Error("Synthetic timeout guard")),
        50,
      );
      init.signal.addEventListener(
        "abort",
        () => {
          clearTimeout(guard);
          reject(init.signal.reason);
        },
        { once: true },
      );
    });
    throw new Error("Synthetic transport must not complete");
  };
}
export async function applyMigrations(f, after, through = 16) {
  const folder = source("supabase/migrations/");
  const files = (await readdir(folder))
    .filter((file) => file.endsWith(".sql"))
    .sort();
  assert.ok(
    files.length >= through,
    `Migration ${through} must exist before QA runs`,
  );
  for (const file of files.slice(after, through))
    await f.db.exec(await readFile(new URL(file, folder), "utf8"));
}
export async function historySnapshot(f, campaignId) {
  return {
    versions: await f.query(
      "select * from rpg_private.timeline_versions where campaign_id=$1 order by id",
      [campaignId],
    ),
    manifests: await f.query(
      "select id,campaign_id,timeline_id,schema_version,refs,public_metadata,canon_generation,created_at,to_jsonb(m)->'lab_run_id' as lab_run_id from rpg_private.timeline_manifests m where campaign_id=$1 order by id",
      [campaignId],
    ),
    saves: await f.query(
      "select * from rpg_private.save_points where campaign_id=$1 order by id",
      [campaignId],
    ),
  };
}
export async function assertHistoryPreserved(f, campaignId, prior) {
  for (const [key, table] of Object.entries({
    versions: "timeline_versions",
    manifests: "timeline_manifests",
    saves: "save_points",
  })) {
    assert.deepEqual(
      await f.query(
        `select ${key === "manifests" ? "id,campaign_id,timeline_id,schema_version,refs,public_metadata,canon_generation,created_at,to_jsonb(m)->'lab_run_id' as lab_run_id" : "*"} from rpg_private.${table} m where campaign_id=$1 and id=any($2::uuid[]) order by id`,
        [campaignId, prior[key].map((row) => row.id)],
      ),
      prior[key],
      key,
    );
  }
}
