// Read-only follow-up to saves-app-acceptance.mjs. Synthetic local fixtures only.
// Reads credentials locally; never prints their values, cookies or response bodies.
import assert from "node:assert/strict";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  acceptanceEnvironment,
  credentials,
  httpSession,
} from "./gameplay-acceptance-helpers.mjs";

const { base } = acceptanceEnvironment();
const prior = JSON.parse(
  await readFile("test-results/phase35-app-acceptance.json", "utf8"),
);
assert.equal(prior.base, base);
const forbidden = [
  "SYNTHETIC_PRIVATE_PHASE35_CANARY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
  ...Object.entries(process.env)
    .filter(
      ([name, value]) =>
        /^(SUPABASE_SERVICE_ROLE_KEY|OPENAI_API_KEY|RPG_TEST_.*_PASSWORD)$/.test(
          name,
        ) && value.length >= 8,
    )
    .map(([, value]) => value),
];
const inspect = (text) => {
  for (const secret of forbidden)
    assert.ok(!text.includes(secret), "Private marker or credential exposed");
};
const owner = httpSession(base);
inspect(
  JSON.stringify(
    await owner.request("/api/auth/sign-in", credentials("OWNER")),
  ),
);
let apiResponses = 1;
let htmlPages = 0;
for (const fixture of prior.fixtures) {
  const root = `/api/campaigns/${fixture.campaignId}`;
  for (const suffix of ["", "/play", "/memory", "/saves"]) {
    inspect(JSON.stringify(await owner.request(root + suffix)));
    apiResponses++;
  }
  inspect(
    JSON.stringify(
      await httpSession(base).request(root + "/saves", undefined, 401),
    ),
  );
  apiResponses++;
  const cookie = [...owner.jar]
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");
  for (const screen of [
    "game",
    "saves",
    "sessions",
    "library",
    "dm-chat",
    "settings",
  ]) {
    const response = await fetch(
      `${base}/campaigns/${fixture.campaignId}/${screen}`,
      {
        headers: { cookie },
      },
    );
    assert.equal(response.status, 200);
    inspect(await response.text());
    htmlPages++;
  }
}
let clientBundles = 0;
async function bundles(folder) {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) await bundles(path);
    else if (entry.name.endsWith(".js")) {
      inspect(await readFile(path, "utf8"));
      clientBundles++;
    }
  }
}
await bundles(".next/static");
let ordinaryLogs = 0;
for (const name of await readdir("test-results")) {
  if (/^phase35-.*\.(stdout|stderr)\.log$/.test(name)) {
    inspect(await readFile(join("test-results", name), "utf8"));
    ordinaryLogs++;
  }
}
assert.ok(ordinaryLogs >= 2);
const report = {
  at: new Date().toISOString(),
  base,
  apiResponses,
  htmlPages,
  clientBundles,
  ordinaryLogs,
  privateMarkersFound: 0,
  providerCalls: 0,
};
await writeFile(
  "test-results/phase35-privacy-acceptance.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report));
