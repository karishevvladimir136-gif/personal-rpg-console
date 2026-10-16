// The sandbox stand-in DM (docs/SANDBOX.md): only the development server
// honours the switch, and a turn on it narrates and ends through finish_turn.
import test from "node:test";
import assert from "node:assert/strict";
import { createFakeDmModel, fakeDmModelEnabled } from "../src/lib/server/dm/model/fake.ts";
import { dmLoopToolset } from "../src/lib/gameplay/dm-loop/loop.ts";

test("the stand-in switch is off in production and off by default", () => {
  assert.equal(fakeDmModelEnabled({ NODE_ENV: "production", RPG_DM_FAKE_MODEL: "1" }), false);
  assert.equal(fakeDmModelEnabled({ NODE_ENV: "development" }), false);
  assert.equal(fakeDmModelEnabled({ NODE_ENV: "development", RPG_DM_FAKE_MODEL: "1" }), true);
});

test("a stand-in turn quotes the player and finishes the turn; a digest request gets JSON", async () => {
  const model = createFakeDmModel({ providerId: "openai", modelId: "gpt-6-astra" });
  const events = [];
  for await (const event of model.stream({ system: [], messages: [{ role: "user", text: "I knock on the door." }], toolset: dmLoopToolset, effort: "low", maxOutputTokens: 100 })) events.push(event);
  const text = events.filter((e) => e.type === "text_delta").map((e) => e.text).join("");
  assert.match(text, /I knock on the door\./);
  const call = events.find((e) => e.type === "tool_call");
  assert.equal(call.name, "finish_turn");
  assert.deepEqual(JSON.parse(call.arguments).sceneKinds, ["conversation"]);
  assert.equal(events.at(-1).reason, "tool_use");
  const digest = [];
  for await (const event of model.stream({ system: [], messages: [{ role: "user", text: "digest" }], toolset: null, effort: "low", maxOutputTokens: 100 })) digest.push(event);
  const json = JSON.parse(digest.filter((e) => e.type === "text_delta").map((e) => e.text).join(""));
  assert.ok(json.recap && json.title);
  assert.equal(digest.at(-1).reason, "end");
});
