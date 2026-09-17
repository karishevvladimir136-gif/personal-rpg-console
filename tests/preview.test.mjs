import assert from "node:assert/strict";
import test from "node:test";

const base = process.env.PREVIEW_URL || "http://127.0.0.1:3000";
const routes = {
  campaigns: "My Campaigns",
  game: "The Letter",
  character: "Character &amp; Inventory",
  inventory: "Inventory",
  party: "Party &amp; Relationships",
  journal: "Journal",
  map: "Map &amp; Travel",
  library: "Campaign Library",
  gallery: "Gallery",
  sessions: "Session Recap &amp; Gallery",
  settings: "Settings",
};

test("home leads to campaign selection", async () => {
  const response = await fetch(base, { redirect: "manual" });
  assert.ok([307, 308].includes(response.status));
  assert.equal(response.headers.get("location"), "/campaigns");
});

for (const [route, heading] of Object.entries(routes)) {
  test(`${route} renders its screen and only valid local navigation`, async () => {
    const response = await fetch(`${base}/${route}`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.ok(html.includes(heading), `Missing screen heading: ${heading}`);
    assert.ok(html.includes("PHASE 0"));
    const links = [...html.matchAll(/href="(\/[^"#?]*)"/g)].map(
      (match) => match[1],
    );
    for (const link of links.filter(
      (link) => !link.startsWith("/_next/") && !link.startsWith("/art/"),
    )) {
      assert.ok(
        link === "/" ||
          Object.hasOwn(routes, link.slice(1)) ||
          link === "/favicon.ico",
        `Unexpected navigation link: ${link}`,
      );
    }
    const art = [
      ...new Set(
        [...html.matchAll(/href="(\/art\/[^" ]+)"/g)].map((match) => match[1]),
      ),
    ];
    for (const path of art) {
      const asset = await fetch(`${base}${path}`);
      assert.equal(asset.status, 200, `Missing artwork: ${path}`);
      assert.match(asset.headers.get("content-type"), /image\/png/);
    }
  });
}

test("unknown routes show an honest 404", async () => {
  const response = await fetch(`${base}/not-a-campaign-screen`);
  assert.equal(response.status, 404);
  assert.match(await response.text(), /This road ends here/);
});

test("the sample game does not expose invented live dice results", async () => {
  const html = await (await fetch(`${base}/game`)).text();
  assert.ok(html.includes("Roll dice"));
  assert.ok(!/You rolled|Dice result|Critical hit!/i.test(html));
});
