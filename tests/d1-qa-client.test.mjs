import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import test from "node:test";
import ts from "typescript";
import {
  qaFixture,
  seedWave4,
  moduleFromSource,
  sourceRoot,
} from "./d1-qa-fixture.mjs";

// Supports independent UI review before its files land in the integration root.
const uiRoot = process.env.D1_UI_SOURCE_ROOT
  ? pathToFileURL(
      `${process.env.D1_UI_SOURCE_ROOT.replaceAll("\\", "/").replace(/\/$/, "")}/`,
    )
  : sourceRoot;
const { readPublicLabRun, sendLabAttempt } = await import(
  new URL("src/components/world-lab/client.ts", uiRoot).href
);
const { createLabService } = await moduleFromSource(
  "src/lib/world-lab/service.ts",
);
const { errorResponse } = await moduleFromSource(
  "src/lib/persistence/route-response.ts",
);

test("D1 QA actual public API errors retain their safe code in the browser transport", async () => {
  const attempt = {
    action: "cancel",
    input: {
      operationId: randomUUID(),
      campaignId: randomUUID(),
      runId: randomUUID(),
      expectedRevision: 1,
    },
  };
  for (const code of ["conflict", "forbidden", "validation", "unauthenticated"])
    await assert.rejects(
      () =>
        sendLabAttempt(attempt, async () =>
          errorResponse({ code, message: "QA_PRIVATE_DATABASE_DETAIL" }),
        ),
      (error) => error.code === code && !error.message.includes("QA_PRIVATE"),
    );
  await assert.rejects(
    () =>
      sendLabAttempt(attempt, async () =>
        errorResponse({
          code: "unavailable",
          message: "QA_PRIVATE_DATABASE_DETAIL",
        }),
      ),
    (error) =>
      error.code === "uncertain" && !error.message.includes("QA_PRIVATE"),
  );
});

test("D1 QA browser accepts earlier inherited public observations from a real nonzero-time saved base", async () => {
  const f = await qaFixture();
  try {
    await seedWave4(f);
    await f.one(
      "update rpg_private.runtime_state set world_minutes=30,revision=revision+1 where campaign_id=$1",
      [f.cid],
    );
    await f.saves(
      f.cid,
      "create",
      await f.command(f.cid, {
        kind: "manual",
        name: "S".repeat(200),
      }),
    );
    const save = await f.one(
      "select * from rpg_private.save_points where campaign_id=$1 and name=$2",
      [f.cid, "S".repeat(200)],
    );
    const service = createLabService(f.owner, f.rpc);
    const dto = await service.perform({
      action: "prepare",
      input: { ...f.request, saveId: save.id, operationId: randomUUID() },
    });
    assert.equal(dto.startWorldMinutes, 30);
    assert.equal(dto.base.label.length, 200);
    assert.ok(
      dto.checkpoints[0].events.some(
        (event) => event.worldMinutes < dto.startWorldMinutes,
      ),
    );
    assert.deepEqual(readPublicLabRun(dto, f.cid), dto);
    const longHistory = structuredClone(dto);
    longHistory.checkpoints[0].events = Array.from(
      { length: 300 },
      (_, index) => ({
        id: randomUUID(),
        text: `Public inherited record ${index}`,
        worldMinutes: 0,
      }),
    );
    assert.deepEqual(readPublicLabRun(longHistory, f.cid), longHistory);
    const bad = structuredClone(dto);
    bad.checkpoints[0].events[0].worldMinutes = -1;
    assert.throws(() => readPublicLabRun(bad, f.cid));
    bad.checkpoints[0].events[0].worldMinutes = 31;
    assert.throws(() => readPublicLabRun(bad, f.cid));
  } finally {
    await f.db.close();
  }
});

test("D1 QA complete World Lab browser import graph contains only public contracts and local UI modules", async () => {
  const visited = new Set();
  async function inspect(url) {
    if (visited.has(url.href)) return;
    visited.add(url.href);
    const text = await readFile(url, "utf8");
    if (url.pathname.endsWith(".css")) return;
    assert.doesNotMatch(
      text,
      /process\.env|SUPABASE_SERVICE_ROLE_KEY|OPENAI_API_KEY|FAL_KEY|createRpcLabStore|createRpcDetachedWriter/,
    );
    const imports = ts.preProcessFile(text, true, true).importedFiles;
    for (const { fileName } of imports) {
      assert.doesNotMatch(
        fileName,
        /(?:server-contracts|server-only|\/server\/|node:|@supabase|openai|world-lab\/(?:inputs|service|store|runtime|memory|writer|lifecycle|projection))/,
      );
      if (!fileName.startsWith(".") && !fileName.startsWith("@/")) {
        assert.ok(["react", "lucide-react"].includes(fileName), fileName);
        continue;
      }
      const base = fileName.startsWith("@/")
        ? new URL(`src/${fileName.slice(2)}`, uiRoot)
        : new URL(fileName, url);
      let target = null;
      for (const suffix of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) {
        const candidate = new URL(`${base.href}${suffix}`);
        try {
          await access(candidate);
          target = candidate;
          break;
        } catch {
          /* Try the next standard source extension. */
        }
      }
      assert.ok(target, `Unresolved client import: ${fileName}`);
      assert.ok(
        target.href.startsWith(uiRoot.href),
        "Client import left the reviewed checkout",
      );
      await inspect(target);
    }
  }
  await inspect(
    new URL("src/components/world-lab/world-lab-panel.tsx", uiRoot),
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
