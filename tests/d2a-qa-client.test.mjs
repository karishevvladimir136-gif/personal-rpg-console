import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { sourceRoot, moduleFromSource } from "./d2a-qa-fixture.mjs";

test("D2A QA entire World Lab browser graph excludes private composition, simulation, provider and database authority", async () => {
  const visited = new Set();
  async function inspect(url) {
    if (visited.has(url.href)) return;
    visited.add(url.href);
    const text = await readFile(url, "utf8");
    if (url.pathname.endsWith(".css")) return;
    assert.doesNotMatch(
      text,
      /process\.env|SUPABASE_SERVICE_ROLE_KEY|OPENAI_API_KEY|FAL_KEY|createRpcLabStore|createRpcDetachedWriter|readDetachedState/,
    );
    for (const { fileName } of ts.preProcessFile(text, true, true)
      .importedFiles) {
      assert.doesNotMatch(
        fileName,
        /(?:server-contracts|server-only|\/server\/|node:|@supabase|openai|world-lab\/(?:inputs|service|store|runtime|memory|writer|lifecycle|projection|simulation)\b)/,
      );
      if (!fileName.startsWith(".") && !fileName.startsWith("@/")) {
        assert.ok(["react", "lucide-react"].includes(fileName), fileName);
        continue;
      }
      const base = fileName.startsWith("@/")
        ? new URL(`src/${fileName.slice(2)}`, sourceRoot)
        : new URL(fileName, url);
      let target = null;
      for (const suffix of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) {
        const candidate = new URL(`${base.href}${suffix}`);
        try {
          await access(candidate);
          target = candidate;
          break;
        } catch {
          /* Try the next source extension. */
        }
      }
      assert.ok(target, `Unresolved client import: ${fileName}`);
      assert.ok(
        target.href.startsWith(sourceRoot.href),
        "Client import left the reviewed checkout",
      );
      await inspect(target);
    }
  }
  await inspect(
    new URL("src/components/world-lab/world-lab-panel.tsx", sourceRoot),
  );
  assert.ok(
    [...visited].some((file) =>
      file.endsWith("/src/lib/world-lab/contracts.ts"),
    ),
  );
  assert.ok(
    [...visited].some((file) =>
      file.endsWith("/src/components/world-lab/client.ts"),
    ),
  );
});

test("D2A QA actual production authoring, preparation and continued-run DTOs satisfy the strict browser boundary without private state", async () => {
  const { integrationFixture } = await moduleFromSource(
    "tests/d2a-integration-fixture.mjs",
  );
  const client = await moduleFromSource(
    "src/components/world-lab/authoring-client.ts",
  );
  const { readPublicLabRun } = await moduleFromSource(
    "src/components/world-lab/client.ts",
  );
  const f = await integrationFixture();
  try {
    const { authoring, lab } = await f.services();
    const request = {
      action: "interpret",
      input: {
        operationId: randomUUID(),
        campaignId: f.cid,
        saveId: f.save.id,
        premise: "What if rain changed the crossing?",
        model: {
          providerId: "openai",
          modelId: "gpt-6-astra",
          reasoning: "max",
        },
      },
    };
    const review = await authoring.perform(request);
    assert.deepEqual(client.readAuthoringReply(review, request), review);
    const catalog = await authoring.catalog(f.cid);
    assert.deepEqual(client.readAuthoringCatalog(catalog), catalog);
    const approval = {
      action: "approve",
      input: {
        operationId: randomUUID(),
        campaignId: f.cid,
        versionId: review.draft.versionId,
      },
    };
    const prepared = await authoring.perform(approval);
    assert.deepEqual(
      client.readAuthoringReply(prepared, approval, catalog),
      prepared,
    );
    assert.equal(prepared.run.status, "prepared");
    const continued = await lab.perform({
      action: "continue",
      input: {
        operationId: randomUUID(),
        campaignId: f.cid,
        runId: prepared.run.id,
        expectedRevision: prepared.run.revision,
      },
    });
    assert.deepEqual(readPublicLabRun(continued, f.cid), continued);
    assert.doesNotMatch(
      JSON.stringify([review, catalog, prepared, continued]),
      /PRIVATE_|baseManifestId|inputDigest|contextDigest|known_by|executionProfile|sourceHeads/,
    );
    for (const code of ["conflict", "validation", "unavailable"]) {
      let calls = 0;
      const transport = client.createAuthoringTransport("en", async () => {
        calls += 1;
        return new Response(
          JSON.stringify({
            error: { code, message: "SYNTHETIC_PRIVATE_RAW_ERROR" },
          }),
          { status: code === "conflict" ? 409 : 400 },
        );
      });
      await assert.rejects(
        () => transport.send(request),
        (error) => {
          assert.equal(error.code, code);
          assert.doesNotMatch(String(error), /SYNTHETIC_PRIVATE_RAW_ERROR/);
          return true;
        },
      );
      assert.equal(calls, 1);
    }
  } finally {
    await f.db.close();
  }
});
