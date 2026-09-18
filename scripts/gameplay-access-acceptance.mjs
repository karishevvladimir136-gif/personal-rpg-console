// Read-only real local Supabase access checks after gameplay-app-acceptance.
import assert from "node:assert/strict";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { testClient } from "./persistence-fixtures.mjs";
import {
  acceptanceEnvironment,
  credentials,
  httpSession,
  pathFor,
  privateMarker,
} from "./gameplay-acceptance-helpers.mjs";

const { config, base } = acceptanceEnvironment();
const fixtures = JSON.parse(
  await readFile("test-results/phase2-fixtures.json", "utf8"),
);
assert.equal(fixtures.length, 2);
const cid = fixtures[0].campaignId;
const results = [];
const pass = (text) => {
  results.push(text);
  console.log(`PASS: ${text}`);
};
for (const role of ["ANONYMOUS", "OWNER", "NONOWNER"]) {
  const client = testClient(config);
  if (role !== "ANONYMOUS") {
    const login = await client.auth.signInWithPassword(credentials(role));
    assert.ok(!login.error, `${role} synthetic sign-in failed`);
  }
  const rpc = await client.rpc("rpg_runtime", {
    p_owner_id: process.env.RPG_OWNER_USER_ID,
    p_campaign_id: cid,
    p_action: "play",
    p_payload: {},
  });
  assert.ok(
    rpc.error,
    `${role} must not invoke the service-only runtime RPC directly`,
  );
  assert.equal(rpc.data, null);
  const hidden = await client
    .schema("rpg_private")
    .from("turns")
    .select("id")
    .limit(1);
  assert.ok(hidden.error);
  assert.equal(hidden.data, null);
}
pass(
  "real PostgREST denies anonymous, owner and non-owner direct runtime/private access",
);

const owner = httpSession(base);
await owner.request("/api/auth/sign-in", credentials("OWNER"));
let checked = 0;
for (const fixture of fixtures) {
  const root = pathFor(fixture.campaignId);
  const campaign = await owner.request(root);
  assert.ok(campaign.campaign.title.startsWith("Synthetic Phase 2 ·"));
  const play = await owner.request(`${root}/play`);
  const bodies = [campaign, play];
  for (const turn of play.turns)
    bodies.push(await owner.request(`${root}/turns/${turn.id}`));
  for (const body of bodies) {
    const text = JSON.stringify(body);
    assert.ok(!text.includes(privateMarker));
    if (process.env.SUPABASE_SERVICE_ROLE_KEY)
      assert.ok(!text.includes(process.env.SUPABASE_SERVICE_ROLE_KEY));
    if (process.env.OPENAI_API_KEY)
      assert.ok(!text.includes(process.env.OPENAI_API_KEY));
    assert.ok(
      !/"(?:privateState|privatePatches|checkpoint|lease_token|guide_version_id|usage)"\s*:/.test(
        text,
      ),
    );
    checked++;
  }
}
pass(
  `normal owner campaign/play/turn responses contain no private canary, checkpoints or server credentials (${checked} responses)`,
);

async function javascriptFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await javascriptFiles(path)));
    else if (entry.name.endsWith(".js")) files.push(path);
  }
  return files;
}
const bundles = await javascriptFiles(".next/static");
assert.ok(bundles.length > 0, "Run the production build before this check");
for (const path of bundles) {
  const content = await readFile(path, "utf8");
  assert.ok(
    !content.includes(privateMarker),
    "Private canary in client bundle",
  );
  for (const name of ["SUPABASE_SERVICE_ROLE_KEY", "OPENAI_API_KEY"]) {
    assert.ok(
      !content.includes(name),
      "Server credential name in client bundle",
    );
    if (process.env[name])
      assert.ok(
        !content.includes(process.env[name]),
        "Server credential value in client bundle",
      );
  }
}
pass(
  `production client JavaScript contains no private canary or server credentials (${bundles.length} files)`,
);

await writeFile(
  "test-results/phase2-access-acceptance.json",
  JSON.stringify(
    { at: new Date().toISOString(), providerCalls: 0, checks: results },
    null,
    2,
  ),
);
console.log(
  "Read-only live access checks complete. No OpenAI calls were made.",
);
