import { gzipSync, deflateSync } from "node:zlib";
import { protocol, canonical } from "../src/protocol.ts";
export const COMMIT = "1".repeat(40);
export const credentials = {
  worldlabs: "SYNTHETIC_WLT_CREDENTIAL_MARKER",
  fal: "SYNTHETIC_FAL_CREDENTIAL_MARKER",
};
export function clock() {
  let now = Date.parse("2026-09-19T12:00:00Z");
  return {
    now: () => now,
    sleep: async (ms) => {
      now += ms;
    },
    advance: (ms) => {
      now += ms;
    },
  };
}
function crc(b) {
  let c = 0xffffffff;
  for (const byte of b) {
    c ^= byte;
    for (let j = 0; j < 8; j++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}
export function png(width = 2, height = 1) {
  const chunk = (type, data) => {
    const b = Buffer.alloc(data.length + 12);
    b.writeUInt32BE(data.length);
    b.write(type, 4);
    data.copy(b, 8);
    b.writeUInt32BE(crc(b.subarray(4, -4)), b.length - 4);
    return b;
  };
  const h = Buffer.alloc(13);
  h.writeUInt32BE(width);
  h.writeUInt32BE(height, 4);
  h[8] = 8;
  h[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", h),
    chunk("IDAT", deflateSync(Buffer.alloc((width * 3 + 1) * height))),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
export function glb() {
  const d = {
    asset: { version: "2.0" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, material: 0 }] }],
    materials: [
      { pbrMetallicRoughness: { metallicFactor: 0.1, roughnessFactor: 0.8 } },
    ],
    buffers: [{ byteLength: 36 }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 36 }],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: 3,
        type: "VEC3",
        min: [0, 0, 0],
        max: [1, 1, 0],
      },
    ],
  };
  let s = JSON.stringify(d);
  s += " ".repeat((4 - (s.length % 4)) % 4);
  const j = Buffer.from(s),
    b = Buffer.alloc(12 + 8 + j.length + 8 + 36);
  b.write("glTF");
  b.writeUInt32LE(2, 4);
  b.writeUInt32LE(b.length, 8);
  b.writeUInt32LE(j.length, 12);
  b.writeUInt32LE(0x4e4f534a, 16);
  j.copy(b, 20);
  const o = 20 + j.length;
  b.writeUInt32LE(36, o);
  b.writeUInt32LE(0x004e4942, o + 4);
  b.writeFloatLE(1, o + 8 + 12);
  b.writeFloatLE(1, o + 8 + 28);
  return b;
}
export function spz() {
  const b = Buffer.alloc(35);
  b.write("NGSP");
  b.writeUInt32LE(2, 4);
  b.writeUInt32LE(1, 8);
  b[13] = 12;
  return gzipSync(b);
}
export function world(job, when = Date.parse("2026-09-19T12:00:00Z")) {
  const base = `https://wlt-ai-cdn.art/synthetic/${job.id}`;
  return {
    world_id: `world-${job.id}`,
    display_name: job.id,
    permission: { public: false },
    model: job.model,
    world_prompt: job.input.world_prompt,
    created_at: new Date(when).toISOString(),
    world_marble_url: `https://marble.worldlabs.ai/world/world-${job.id}`,
    assets: {
      thumbnail_url: base + "/thumbnail.png",
      imagery: { pano_url: base + "/pano.png" },
      mesh: { collider_mesh_url: base + "/collider.glb" },
      splats: {
        spz_urls: { "100k": base + "/world.spz" },
        semantics_metadata: { metric_scale_factor: 1, ground_plane_offset: 0 },
      },
    },
  };
}
export function fakeProvider(time, mutate = () => {}) {
  const requests = [];
  let active, started;
  const response = (r, data, headers = {}) => ({
    status: 200,
    url: r.url,
    headers,
    bytes: Buffer.isBuffer(data) ? data : Buffer.from(JSON.stringify(data)),
  });
  const transport = async (r) => {
    requests.push(structuredClone(r));
    let type,
      data,
      headers = {};
    if (r.method === "POST") {
      type = "submit";
      active = protocol.jobs.find(
        (j) =>
          j.endpoint === r.url &&
          (j.provider === "fal" || j.model === JSON.parse(r.body).model),
      );
      if (!active) throw Error("wrong mock model");
      started = time.now();
      if (active.provider === "worldlabs")
        data = { operation_id: `op-${active.id}`, done: false };
      else
        data = {
          request_id: `op-${active.id}`,
          status_url: `${active.endpoint}/requests/op-${active.id}/status`,
          response_url: `${active.endpoint}/requests/op-${active.id}/response`,
        };
    } else if (r.url.includes("/operations/")) {
      type = "poll";
      data = {
        operation_id: `op-${active.id}`,
        done: true,
        cost: { total_credits: active.id === "spatial-room-1" ? 1580 : 3080 },
        response: { world_id: `world-${active.id}` },
      };
    } else if (r.url.includes("/status")) {
      type = "poll";
      data = { request_id: `op-${active.id}`, status: "COMPLETED" };
    } else if (r.url.includes("/worlds/")) {
      type = "world";
      data = world(active, started);
    } else if (r.url.endsWith("/response")) {
      type = "result";
      headers = { "x-fal-request-id": `op-${active.id}` };
      data =
        active.id === "spatial-fal-world-1"
          ? {
              world_file: {
                url: "https://v3b.fal.media/files/synthetic/world.glb",
              },
            }
          : {
              model_glb: {
                url: "https://v3b.fal.media/files/synthetic/chest.glb",
              },
            };
    } else {
      type = "download";
      data = r.url.endsWith(".spz")
        ? spz()
        : r.url.endsWith(".glb")
          ? glb()
          : png();
    }
    const reply = response(r, data, headers);
    await mutate({ r, reply, type, job: active, data, time, requests });
    return reply;
  };
  return { transport, requests };
}
export function reviewFor(ledger, id) {
  return {
    protocolHash: ledger.entries[0].protocolHash,
    resultSHA256: ledger.rows("result", id)[0].sha256,
    syntheticOnly: true,
    safeVisibleEnvelope: true,
    requiredOutputsUsable: true,
    assetFirst: true,
    noUnexpectedRouting: true,
    panoramaCompatible: true,
    panoramaSharingPermitted: true,
  };
}
export const asBytes = (data) => Buffer.from(canonical(data));
