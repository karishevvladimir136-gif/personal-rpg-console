import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  readContinuationInspection,
  readContinuationCatalog,
  inspectedContinuation,
} from "../src/components/world-lab/continuation-client.ts";
import { projectTimelineExplorer } from "../src/lib/timeline-explorer/projection.ts";
import { belongingEntries } from "../src/lib/places-belonging/model.ts";
import { visualDocuments } from "../src/lib/visual-frame/model.ts";
import { isReferenceMetadata } from "../src/lib/persistence/reference-metadata.ts";
const fixtures = JSON.parse(
  readFileSync(
    new URL("../src/lib/v1-completion/preview-fixtures.json", import.meta.url),
    "utf8",
  ),
);
globalThis.fetch = () => {
  throw Error("Synthetic owner review prohibits network");
};
for (const language of ["en", "ru"]) {
  test(
    language +
      ": disposable preview has valid public scope and keeps scripted review unapproved",
    () => {
      const f = fixtures[language],
        cid = f.snapshot.campaign.id,
        before = JSON.stringify(f);
      const inspection = readContinuationInspection(
        f.continuation.inspection,
        cid,
      );
      const catalog = readContinuationCatalog(
        f.continuation.catalog,
        cid,
        inspectedContinuation(inspection),
      );
      assert.equal(catalog.drafts.length, 1);
      assert.ok(
        catalog.drafts[0].proposal.blockers.includes("ambiguity_unresolved"),
      );
      assert.equal(
        catalog.drafts[0].proposal.ambiguities[0].consequential,
        true,
      );
      assert.equal(catalog.drafts[0].proposal.review.ambiguityAnswers[0], null);
      assert.equal(f.snapshot.campaign.language, language);
      const entries = belongingEntries(f.snapshot);
      assert.equal(entries.length, 1);
      const references = visualDocuments(f.snapshot);
      assert.ok(references.length > 0);
      for (const d of f.snapshot.documents) {
        assert.equal(d.campaign_id, cid);
        assert.equal(d.status, "reference");
        assert.equal(isReferenceMetadata(d), true);
      }
      const timeline = projectTimelineExplorer({
        snapshot: f.snapshot,
        saves: f.saves,
        lab: f.lab,
      });
      assert.ok(timeline);
      assert.doesNotMatch(
        JSON.stringify(f),
        /SUPABASE_SERVICE_ROLE_KEY|OPENAI_API_KEY|Bearer |PRIVATE_CANARY|SECRET_CANARY/,
      );
      assert.equal(JSON.stringify(f), before);
    },
  );
}
