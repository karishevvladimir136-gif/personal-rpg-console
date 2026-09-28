import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { deflateSync } from "node:zlib";
import {
  buildRealFrame,
  realFrameDocumentMutation,
  parseRealFrame,
  realFrameIsCurrent,
} from "../src/lib/visual-frame/real-frame.ts";
import { executeMediaFrame } from "../src/lib/server/media/orchestration.ts";
import { storedPixels } from "../src/lib/server/media/png.ts";
import { sameTimeline } from "../src/lib/saves/fence.ts";
export const sourceSnapshot = JSON.parse(
  readFileSync(
    new URL("../src/lib/v1-completion/preview-fixtures.json", import.meta.url),
    "utf8",
  ),
).en.snapshot;
export const model = "gpt-image-2.5-sunburst-2026-09-08";
export const parameters = {
  size: "1536x1024",
  quality: "high",
  outputFormat: "png",
  n: 1,
};
function crc(bytes) {
  let n = 0xffffffff;
  for (const b of bytes) {
    n ^= b;
    for (let i = 0; i < 8; i++) n = (n >>> 1) ^ (n & 1 ? 0xedb88320 : 0);
  }
  return (n ^ 0xffffffff) >>> 0;
}
function chunk(name, body) {
  const out = Buffer.alloc(body.length + 12);
  out.writeUInt32BE(body.length);
  out.write(name, 4);
  body.copy(out, 8);
  out.writeUInt32BE(crc(out.subarray(4, out.length - 4)), out.length - 4);
  return out;
}
export function png(width = 1536, height = 1024) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  const rows = Buffer.alloc((width * 3 + 1) * height);
  return new Uint8Array(
    Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk("IHDR", header),
      chunk("IDAT", deflateSync(rows)),
      chunk("IEND", Buffer.alloc(0)),
    ]),
  );
}
export function fixture() {
  const snapshot = structuredClone(sourceSnapshot),
    proof = { expectedHeadId: randomUUID(), canonGeneration: 7 },
    receipts = new Map(),
    pixels = new Map(),
    writes = [],
    calls = [];
  const policy = {
    model,
    parameters,
    reservationUsdMicros: 400000,
    budgetId: randomUUID(),
  };
  let providerCalls = 0,
    reserved = 0;
  const receipt = async (input) => {
    calls.push("receipt");
    if (!sameTimeline(input.timeline, snapshot.timeline))
      throw Object.assign(new Error("conflict"), { code: "conflict" });
    const previous = receipts.get(input.requestId);
    if (!previous) return null;
    if (JSON.stringify(input) !== JSON.stringify(previous.input))
      throw Object.assign(new Error("conflict"), { code: "conflict" });
    return structuredClone(previous.result);
  };
  function apply(input) {
    const old = snapshot.documents.find((r) => r.id === input.payload.id);
    if ((old?.revision ?? 0) !== input.expectedRevision)
      throw Object.assign(new Error("conflict"), { code: "conflict" });
    const row = {
      ...input.payload,
      id: old?.id ?? randomUUID(),
      campaign_id: snapshot.campaign.id,
      revision: input.expectedRevision + 1,
      updated_at: new Date().toISOString(),
      current_version_id: randomUUID(),
    };
    if (old) snapshot.documents.splice(snapshot.documents.indexOf(old), 1, row);
    else snapshot.documents.push(row);
    const result = {
      id: row.id,
      revision: row.revision,
      campaign_id: snapshot.campaign.id,
      timeline: snapshot.timeline,
    };
    receipts.set(input.requestId, { input: structuredClone(input), result });
    writes.push(structuredClone(input));
    return result;
  }
  const authority = {
    authorize: async (cid) => {
      calls.push("authorize");
      if (cid !== snapshot.campaign.id)
        throw Object.assign(new Error("forbidden"), { code: "forbidden" });
    },
    receipt,
    snapshot: async () => {
      calls.push("snapshot");
      return snapshot;
    },
    source: async () => {
      calls.push("source");
      return proof;
    },
    lifecycle: async (input) => {
      calls.push("lifecycle");
      return apply(input);
    },
    claim: async (input, budgetId) => {
      calls.push("claim");
      if (budgetId !== policy.budgetId) throw new Error("budget");
      const existing = await receipt(input);
      if (existing) return { result: existing, claimed: false };
      if (!realFrameIsCurrent(snapshot, parseRealFrame(input.payload), proof))
        throw Object.assign(new Error("conflict"), { code: "conflict" });
      reserved += policy.reservationUsdMicros;
      return { result: apply(input), claimed: true };
    },
    complete: async (input, asset, output) => {
      calls.push("complete");
      const existing = await receipt(input);
      if (existing) return existing;
      const record = snapshot.documents.find((r) => r.id === input.payload.id),
        previous = parseRealFrame(record);
      if (
        previous.status !== "generating" ||
        !realFrameIsCurrent(snapshot, previous, proof)
      )
        throw Object.assign(new Error("conflict"), { code: "conflict" });
      const assetRow = {
        ...asset.payload,
        id: asset.payload.id,
        campaign_id: snapshot.campaign.id,
        revision: 1,
        updated_at: new Date().toISOString(),
      };
      if (snapshot.assets.some((a) => a.id === assetRow.id))
        throw new Error("duplicate_asset");
      if (output.storagePath !== asset.payload.storage_path)
        throw new Error("wrong_path");
      snapshot.assets.push(assetRow);
      return apply(input);
    },
  };
  const store = {
    read: async (cid, id) => {
      calls.push("read");
      if (cid !== snapshot.campaign.id) throw new Error("foreign");
      return pixels.get(id) ?? null;
    },
    put: async (cid, id, data) => {
      calls.push("put");
      if (pixels.has(id)) throw new Error("immutable");
      pixels.set(id, structuredClone(data));
    },
  };
  const provider = {
    generate: async (frame, id) => {
      calls.push("provider");
      providerCalls++;
      return storedPixels(
        frame.campaign_id,
        id,
        png(),
        { textInputTokens: 100, imageInputTokens: 0, outputTokens: 1372 },
        "synthetic-request",
      );
    },
  };
  const deps = { authority, policy, store, provider };
  const run = (action, input) => executeMediaFrame({ action, input }, deps);
  const prepare = (refs = [], retryOf = null) =>
    buildRealFrame(snapshot, refs, "wide", model, parameters, proof, retryOf);
  async function queue(frame = prepare()) {
    const input = {
      ...realFrameDocumentMutation(snapshot, frame),
      requestId: randomUUID(),
    };
    const result = await run("media.save", input);
    return {
      input,
      result,
      record: snapshot.documents.find((r) => r.id === result.result.id),
    };
  }
  function dispatch(record) {
    const frame = parseRealFrame(record),
      requestId = randomUUID();
    return {
      ...realFrameDocumentMutation(
        snapshot,
        {
          ...frame,
          status: "generating",
          dispatch: {
            requestId,
            reservationUsdMicros: policy.reservationUsdMicros,
          },
        },
        record,
      ),
      requestId,
    };
  }
  function recovery(record) {
    const frame = parseRealFrame(record);
    return {
      ...realFrameDocumentMutation(
        snapshot,
        { ...frame, status: "completed", resultAssetId: record.id },
        record,
      ),
      requestId: record.id,
    };
  }
  return {
    snapshot,
    proof,
    receipts,
    writes,
    calls,
    policy,
    authority,
    provider,
    store,
    deps,
    run,
    prepare,
    queue,
    dispatch,
    recovery,
    pixels,
    providerCalls: () => providerCalls,
    reserved: () => reserved,
  };
}
