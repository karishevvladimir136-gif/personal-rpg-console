// Future, separately authorized model-quality replay. Never run in Mega DM v1.
// There is no provider import or credential in this repository-owned harness.
import { resolve, isAbsolute } from "node:path";
import { pathToFileURL } from "node:url";
import { writeFile } from "node:fs/promises";
import { scenes } from "../../test-fixtures/mega-dm/campaign-v1.mjs";
import { digest, EVALUATION_PACK_VERSION, frozenReplayRequest, verifyFrozenPack } from "../../test-fixtures/mega-dm/evaluation-pack-v1.mjs";
import { reviewSheet } from "../../test-fixtures/mega-dm/quality-rubric-v1.mjs";

function freezeRequest(value) {
  if (value && typeof value === "object") {
    for (const nested of Object.values(value)) freezeRequest(nested);
    Object.freeze(value);
  }
  return value;
}

function flag(name) {
  const i = process.argv.indexOf(name);
  return i < 0 ? null : process.argv[i + 1] ?? null;
}

async function main() {
  if (process.env.MEGA_DM_LIVE_REPLAY !== "enabled" || !process.argv.includes("--enable-live-model-replay")) {
    throw new Error("Live replay is disabled. Separate authorization, MEGA_DM_LIVE_REPLAY=enabled, and --enable-live-model-replay are required.");
  }
  const adapterPath = flag("--adapter");
  const outputPath = flag("--output");
  const model = flag("--model");
  const runId = flag("--run-id");
  if (!adapterPath || !isAbsolute(adapterPath) || !outputPath || !isAbsolute(outputPath) || !model || !runId) {
    throw new Error("Provide absolute --adapter and --output paths plus --model and --run-id.");
  }
  const adapter = await import(pathToFileURL(resolve(adapterPath)).href);
  if (typeof adapter.replayScene !== "function") throw new TypeError("Adapter must export replayScene(request)");
  verifyFrozenPack();
  const arms = ["baseline", "core-doctrine", "core-plus-long-form"];
  const reviews = [];
  for (const arm of arms) {
    for (const scene of scenes) {
      // The exact arm, doctrine, card versions/content and authorized fixture
      // state are frozen before a separately authorized adapter sees them.
      const request = freezeRequest(frozenReplayRequest({ runId, arm, model, sceneId: scene.id }));
      const requestDigest = digest(request);
      const result = await adapter.replayScene(request);
      if (digest(request) !== requestDigest) throw new Error(`Adapter mutated frozen request: ${arm}/${scene.id}`);
      if (typeof result?.text !== "string" || !result.text.trim()) throw new TypeError(`Empty replay: ${arm}/${scene.id}`);
      if (typeof result?.provenance?.actualModel !== "string" || !result.provenance.actualModel.trim())
        throw new TypeError(`Missing actual model identity: ${arm}/${scene.id}`);
      reviews.push({ ...reviewSheet(scene.id, { arm, model, output: result.text }), requestDigest, request,
        provenance: result.provenance });
    }
  }
  await writeFile(resolve(outputPath), JSON.stringify({ runId, evaluationPackVersion: EVALUATION_PACK_VERSION, model, arms, reviews }, null, 2), { flag: "wx" });
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
