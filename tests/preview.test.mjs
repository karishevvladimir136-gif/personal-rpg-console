import assert from "node:assert/strict";
import test from "node:test";
const base = process.env.PREVIEW_URL || "http://127.0.0.1:3000";
const prefix = "/campaigns/long-road-west";
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
  "/": "Your next chapter awaits.",
  "/campaigns": "My Campaigns",
  "/settings": "General Settings",
  ...Object.fromEntries(
    Object.entries(routes).map(([route, heading]) => [
      prefix + "/" + route,
      heading,
    ]),
  ),
};
for (const [path, heading] of Object.entries(paths))
  test(path + " renders its screen and valid local navigation", async () => {
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
test("legacy campaign screens redirect to explicit sample routes", async () => {
  for (const route of Object.keys(routes).filter(
    (route) => !["settings", "camp"].includes(route),
  )) {
    const response = await fetch(base + "/" + route, { redirect: "manual" });
    assert.ok([307, 308].includes(response.status));
    assert.equal(response.headers.get("location"), prefix + "/" + route);
  }
});
test("campaign root continues into its own Game", async () => {
  const response = await fetch(base + prefix, { redirect: "manual" });
  assert.ok([307, 308].includes(response.status));
  assert.equal(response.headers.get("location"), prefix + "/game");
});
test("unknown screens and campaign IDs return 404 without sample campaign fallback", async () => {
  for (const path of [
    "/not-a-campaign-screen",
    "/campaigns/unknown/game",
    "/campaigns/ashes-of-the-moon/game",
    prefix + "/invalid",
  ]) {
    const response = await fetch(base + path);
    assert.equal(response.status, 404);
    const html = await response.text();
    assert.match(html, /This road ends here/);
    assert.ok(!html.includes('class="narration"'));
  }
});
test("Game has reachable Rest and dice previews without unsolicited live results", async () => {
  const html = await (await fetch(base + prefix + "/game")).text();
  assert.ok(html.includes("Dice preview"));
  assert.ok(html.includes(">Rest<"));
  assert.ok(!/You rolled|Dice result|Critical hit!/i.test(html));
});
test("direct camp navigation starts closed and cannot expose the active stash or cooking", async () => {
  const html = await (await fetch(base + prefix + "/camp")).text();
  assert.ok(html.includes("Demo camp closed"));
  assert.ok(html.includes("Enter demo camp"));
  assert.ok(!html.includes("Open Camp Stash"));
});
