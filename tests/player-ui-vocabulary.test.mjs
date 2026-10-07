import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function source(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("ordinary creation copy names campaign style, not the ruleset implementation", () => {
  const review = source("src/components/bootstrap/review.tsx");
  const creation = source("src/components/bootstrap/new-campaign.tsx");
  assert.match(review, /This campaign style does not require a class, level, HP, or humanoid anatomy/);
  assert.match(review, /Этот стиль кампании не требует класса/);
  assert.doesNotMatch(review, /World Logic requires|World Logic не требует/);
  assert.match(creation, /Free-form campaign/);
  assert.match(creation, /Свободная кампания/);
  assert.doesNotMatch(creation, /advanced \? "World Logic"/);
});

test("ordinary combat setup copy does not surface the backend ruleset name", () => {
  const configuration = source("src/components/gameplay-configuration.tsx");
  const readiness = source("src/components/combat-readiness.tsx");
  assert.match(configuration, /Use the existing starter mechanics for combat in this campaign/);
  assert.doesNotMatch(configuration, /World Logic campaign/);
  assert.match(readiness, /Review these starter combat values/);
  assert.doesNotMatch(readiness, /Console Basic/);
});
