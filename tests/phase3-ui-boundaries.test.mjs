import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import baseline from "../src/lib/locales/ru.json" with { type: "json" };
import fragment from "../src/lib/locales/phase3-c-ru.json" with { type: "json" };
import {
  recapStatusLabels,
  sessionGateLabels,
} from "../src/lib/memory/client-state.ts";
import {
  MemoryClientError,
  memoryErrorMessage,
} from "../src/lib/memory/client.ts";
import {
  continuationCampaigns,
  continuationRubric,
  continuationScenarios,
} from "./phase3-continuation-fixtures.mjs";

const source = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
test("every session control, neutral status and failure label has a Russian translation with matching parameters", () => {
  const dictionary = { ...baseline, ...fragment };
  const params = (text) =>
    [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
  for (const [key, value] of Object.entries(fragment)) {
    assert.ok(value.trim());
    assert.deepEqual(params(value), params(key), key);
  }
  for (const key of [
    ...Object.values(recapStatusLabels),
    ...Object.values(sessionGateLabels),
    ...[
      "unauthenticated",
      "forbidden",
      "conflict",
      "configuration",
      "not_configured",
      "context",
      "validation",
      "unavailable",
    ].map((code) => memoryErrorMessage(new MemoryClientError(code))),
  ])
    assert.ok(dictionary[key], key);
  for (const file of [
    "session-memory.tsx",
    "session-memory-runtime.tsx",
    "gameplay-composer.tsx",
  ]) {
    const ast = ts.createSourceFile(
      file,
      source(`src/components/${file}`),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    function phrase(node) {
      if (ts.isStringLiteral(node))
        assert.ok(dictionary[node.text], `${file}: ${node.text}`);
      else if (ts.isConditionalExpression(node)) {
        phrase(node.whenTrue);
        phrase(node.whenFalse);
      }
    }
    function visit(node) {
      if (ts.isCallExpression(node) && node.expression.getText(ast) === "t")
        phrase(node.arguments[0]);
      if (ts.isJsxText(node))
        assert.doesNotMatch(
          node.text,
          /[A-Za-zА-Яа-яЁё]/,
          `${file}: untranslated JSX`,
        );
      ts.forEachChild(node, visit);
    }
    visit(ast);
  }
});
test("session presentation imports only public contracts and never dispatches dice or turn commands", () => {
  for (const file of [
    "src/components/session-memory.tsx",
    "src/components/session-memory-runtime.tsx",
    "src/lib/memory/client.ts",
    "src/lib/memory/client-state.ts",
  ]) {
    const contents = source(file);
    assert.doesNotMatch(
      contents,
      /server-contracts|rpg_private|\/server\/|OPENAI_API_KEY|SUPABASE_SERVICE|dangerouslySetInnerHTML|Math\.random/,
    );
    assert.doesNotMatch(contents, /\b(?:resumeTurn|sendTurn)\s*\(/);
    assert.doesNotMatch(
      contents,
      /phase3-continuation-fixtures|SYNTHETIC_DM_PRIVATE/,
    );
  }
  const runtime = source("src/components/session-memory-runtime.tsx");
  assert.doesNotMatch(
    runtime,
    /\b(?:endSession|continueSession|retryMemory)\b/,
  );
  assert.match(runtime, /loadMemory/);
  assert.match(
    source("src/components/gameplay-composer.tsx"),
    /turnAllowedBySession/,
  );
  assert.match(
    source("src/components/gameplay-composer.tsx"),
    /!sessionAllowed/,
  );
});
test("mobile session controls wrap, preserve readable text and provide touch-sized actions", () => {
  const css = source("src/app/gameplay.css");
  assert.match(css, /\.session-memory \.button\s*\{[^}]*min-height:\s*44px/);
  assert.match(css, /\.session-memory \.button\s*\{[^}]*white-space:\s*normal/);
  assert.match(
    css,
    /\.session-memory \.button-group\s*\{[^}]*flex-wrap:\s*wrap/,
  );
  assert.match(
    css,
    /@media \(max-width: 760px\)[\s\S]*\.session-resume-facts\s*\{[^}]*grid-template-columns:\s*1fr/,
  );
});
test("continuation fixtures cover at least twenty labeled synthetic cases without conflating fixture validation with live quality", () => {
  assert.ok(continuationScenarios.length >= 20);
  assert.equal(
    new Set(continuationScenarios.map((row) => row.id)).size,
    continuationScenarios.length,
  );
  assert.equal(new Set(Object.values(continuationCampaigns)).size, 2);
  const dimensions = new Set();
  for (const row of continuationScenarios) {
    assert.ok(row.playerInput.trim());
    assert.ok(row.authorizedSources.length);
    assert.deepEqual(row.rubric, continuationRubric);
    assert.ok(row.expected.mustPreserve.length);
    assert.equal(typeof row.expected.mayPause, "boolean");
    assert.equal(row.expected.exactState.hp, 7);
    assert.equal(row.expected.exactState.tonic, 0);
    dimensions.add(row.dimension);
    for (const id of row.requiredEvidenceIds)
      assert.ok(row.authorizedSources.some((evidence) => evidence.id === id));
    for (const evidence of row.authorizedSources) {
      assert.equal(evidence.campaignId, row.campaignId);
      assert.equal(evidence.ref.visibility, "public");
      assert.equal(evidence.current, true);
      assert.equal(evidence.status, "valid");
      assert.doesNotMatch(
        evidence.text,
        /SYNTHETIC_DM_PRIVATE|SYNTHETIC_OTHER_CAMPAIGN|SYNTHETIC_PLAYER_ONLY|SYNTHETIC_OTHER_CONVERSATION/,
      );
      if (row.mode === "companion")
        for (const actorId of row.actorIds)
          assert.ok(evidence.knownBy.includes(actorId));
    }
  }
  for (const dimension of continuationRubric)
    assert.ok(dimensions.has(dimension), dimension);
  assert.ok(continuationScenarios.some((row) => row.language === "ru"));
  assert.ok(continuationScenarios.some((row) => row.recapStatus === "failed"));
  assert.ok(
    continuationScenarios.some(
      (row) =>
        row.checkpointStatus === "rebuild_required" && row.expected.mayPause,
    ),
  );
  const pending = continuationScenarios.find((row) => row.pending)?.pending;
  assert.deepEqual(pending.dice, [8]);
  assert.equal(pending.total, 11);
});
