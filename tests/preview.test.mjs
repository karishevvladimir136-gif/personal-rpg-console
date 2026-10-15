import assert from "node:assert/strict";
import test from "node:test";
import { previewTarget } from "./preview-target.mjs";
// Runs only against an explicit isolated server; never the owner app on :3000.
const { base, skip } = previewTarget();
const prefix = "/preview/campaigns/long-road-west";
const routes = {
  game: "The Letter",
  character: "Character &amp; Inventory",
  inventory: "Inventory",
  party: "Party &amp; Relationships",
  journal: "Journal",
  map: "Map &amp; Travel",
  library: "Campaign Library",
  gallery: "Gallery",
  sessions: "Session Recap &amp; Gallery",
  settings: "Campaign Settings",
  camp: "Camp",
};
const paths = {
  "/preview": "Your next chapter awaits.",
  "/preview/campaigns": "My Campaigns",
  "/preview/settings": "General Settings",
  ...Object.fromEntries(
    Object.entries(routes).map(([route, heading]) => [
      prefix + "/" + route,
      heading,
    ]),
  ),
};
for (const [path, heading] of Object.entries(paths))
  test(path + " renders its screen and valid local navigation", { skip }, async () => {
    const response = await fetch(base + path);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.ok(html.includes(heading), heading);
    assert.ok(html.includes("PHASE 0"));
    const links = [...html.matchAll(/href="(\/[^"#?]*)"/g)].map(
      (match) => match[1],
    );
    for (const link of links.filter(
      (link) => !link.startsWith("/_next/") && !link.startsWith("/art/"),
    ))
      assert.ok(
        Object.hasOwn(paths, link) || link === "/favicon.ico",
        "Unexpected link: " + link,
      );
    for (const art of new Set(
      [...html.matchAll(/href="(\/art\/[^" ]+)"/g)].map((match) => match[1]),
    )) {
      const asset = await fetch(base + art);
      assert.equal(asset.status, 200);
      assert.match(asset.headers.get("content-type"), /image\/png/);
    }
    if (!path.startsWith(prefix)) {
      assert.ok(!html.includes('class="sidebar'));
      assert.ok(!html.includes('class="bottom-nav'));
    }
  });
test("protected legacy routes never redirect an owner into sample data", { skip }, async () => {
  for (const route of [
    "game",
    "character",
    "inventory",
    "campaigns",
    "settings",
  ]) {
    const response = await fetch(base + "/" + route, { redirect: "manual" });
    assert.ok([307, 308].includes(response.status));
    assert.ok(["/setup", "/login"].includes(response.headers.get("location")));
  }
});
test("campaign root continues into its own Game", { skip }, async () => {
  const response = await fetch(base + prefix, { redirect: "manual" });
  assert.ok([307, 308].includes(response.status));
  assert.equal(response.headers.get("location"), prefix + "/game");
});
test("unknown screens and campaign IDs return 404 without sample campaign fallback", { skip }, async () => {
  for (const path of [
    "/not-a-campaign-screen",
    "/preview/campaigns/unknown/game",
    "/preview/campaigns/ashes-of-the-moon/game",
    prefix + "/invalid",
  ]) {
    const response = await fetch(base + path);
    assert.equal(response.status, 404);
    const html = await response.text();
    assert.match(html, /This road ends here/);
    assert.ok(!html.includes('class="narration"'));
  }
});
test("Game has reachable Rest and dice previews without unsolicited live results", { skip }, async () => {
  const html = await (await fetch(base + prefix + "/game")).text();
  assert.ok(html.includes("Dice preview"));
  assert.ok(html.includes("Preview Combat"));
  assert.ok(!html.includes("combat-initiative"));
  assert.ok(html.includes(">Rest<"));
  assert.ok(!/You rolled|Dice result|Critical hit!/i.test(html));
});
test("direct camp navigation starts closed and cannot expose the active stash or cooking", { skip }, async () => {
  const html = await (await fetch(base + prefix + "/camp")).text();
  assert.ok(html.includes("Demo camp closed"));
  assert.ok(html.includes("Enter demo camp"));
  assert.ok(!html.includes("Open Camp Stash"));
});
