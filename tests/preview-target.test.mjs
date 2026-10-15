import test from "node:test";
import assert from "node:assert/strict";
import { previewTarget, requirePreviewBase } from "./preview-target.mjs";

test("HTTP tests skip without an explicit PREVIEW_URL", () => {
  for (const env of [{}, { PREVIEW_URL: "" }, { PREVIEW_URL: "   " }]) {
    const target = previewTarget(env);
    assert.equal(target.base, null);
    assert.match(target.skip, /PREVIEW_URL is not set/);
  }
  assert.match(previewTarget({ PREVIEW_URL: "not a url" }).skip, /not a valid URL/);
});

test("port 3000 is the owner's app and needs an explicit opt-in", () => {
  for (const url of ["http://127.0.0.1:3000", "http://localhost:3000/", "https://127.0.0.1:3000"]) {
    const target = previewTarget({ PREVIEW_URL: url });
    assert.equal(target.base, null, url);
    assert.match(target.skip, /RPG_TEST_ALLOW_OWNER_PORT=1/);
    assert.equal(previewTarget({ PREVIEW_URL: url, RPG_TEST_ALLOW_OWNER_PORT: "true" }).base, null);
    assert.equal(previewTarget({ PREVIEW_URL: url, RPG_TEST_ALLOW_OWNER_PORT: "1" }).base, new URL(url).origin);
  }
  assert.throws(() => requirePreviewBase({ PREVIEW_URL: "http://127.0.0.1:3000" }), /port 3000/);
});

test("an isolated server on another port is used as given", () => {
  assert.deepEqual(previewTarget({ PREVIEW_URL: "http://127.0.0.1:3197/" }), { base: "http://127.0.0.1:3197", skip: false });
  assert.equal(previewTarget({ PREVIEW_URL: "http://localhost" }).base, "http://localhost");
  assert.equal(requirePreviewBase({ PREVIEW_URL: "http://127.0.0.1:3107" }), "http://127.0.0.1:3107");
});
