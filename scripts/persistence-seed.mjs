import {
  testConfig,
  signInTestOwner,
  seedSynthetic,
} from "./persistence-fixtures.mjs";

try {
  const client = await signInTestOwner(testConfig());
  const campaigns = await seedSynthetic(client);
  await client.auth.signOut();
  console.log(
    `Created ${campaigns.length} unrelated synthetic campaigns in the explicitly selected disposable local database. No existing campaign was modified.`,
  );
} catch (error) {
  // Our own messages contain names/codes, never provider error payloads or credential values.
  console.error(
    error instanceof Error ? error.message : "Synthetic setup failed.",
  );
  process.exitCode = 1;
}
