import { inspectWebP } from "./webp.ts";
import { gunzipSync, zstdDecompressSync } from "node:zlib";
import {
  assetUrl,
  canonical,
  hash,
  integer,
  must,
  object,
  parseJSON,
  type Dict,
  type Job,
} from "./protocol.ts";
import { inspectWorldMetadata, type WorldFence } from "./world-metadata.ts";
export type Asset = {
  role: string;
  url: string;
  kind: "image" | "geometry" | "splat" | "glb";
};
const retainedAssets = new WeakMap<Asset, { url: string; provider: string }>();
function retainAssets(assets: Asset[], provider: string): Asset[] {
  for (const asset of assets) {
    retainedAssets.set(asset, { url: asset.url, provider });
    Object.freeze(asset);
  }
  return assets;
}
// Only objects emitted by successful provider-output validation can authorize a download.
// JSON clones, arbitrary strings and caller-created descriptors carry no authority.
export function validatedAssetURL(asset: Asset): string {
  const retained = retainedAssets.get(asset);
  must(retained && asset.url === retained.url, "asset_provenance_required");
  return assetUrl(retained.url, retained.provider);
}
export function worldOutput(value: unknown, job: Job, fence: WorldFence) {
  const metadata = inspectWorldMetadata(value, job, fence);
  const w = object(value);
  // Nullable permissions/assets are valid metadata, but cannot authorize output use.
  must(metadata.privacy === "private", "world_privacy_unverified");
  must(metadata.assetsPresent, "world_assets_unavailable");
  const a = object(w.assets),
    splats = object(a.splats),
    scale = object(splats.semantics_metadata);
  must(
    typeof scale.metric_scale_factor === "number" &&
      Number.isFinite(scale.metric_scale_factor) &&
      scale.metric_scale_factor > 0 &&
      typeof scale.ground_plane_offset === "number" &&
      Number.isFinite(scale.ground_plane_offset),
    "invalid_scale",
  );
  const assets: Asset[] = [
    {
      role: "splat",
      url: assetUrl(object(splats.spz_urls)["100k"], "worldlabs"),
      kind: "splat",
    },
    {
      role: "collider",
      url: assetUrl(object(a.mesh).collider_mesh_url, "worldlabs"),
      kind: "geometry",
    },
    {
      role: "pano",
      url: assetUrl(object(a.imagery).pano_url, "worldlabs"),
      kind: "image",
    },
    {
      role: "thumbnail",
      url: assetUrl(a.thumbnail_url, "worldlabs"),
      kind: "image",
    },
  ];
  const identity = {
    worldId: fence.worldId,
    model: metadata.actualModel,
    scale,
    assets: assets.map((x) => ({
      role: x.role,
      path: new URL(x.url).origin + new URL(x.url).pathname,
    })),
  };
  return {
    assets: retainAssets(assets, job.provider),
    metadata,
    identityHash: hash(canonical(identity)),
    worldId: fence.worldId,
    scale,
  };
}
export function falOutput(value: unknown, job: Job): Asset[] {
  const o = object(value);
  must(!o.error, "provider_output_error");
  if (o.fallback !== undefined)
    must(o.fallback === false, "unexpected_fallback");
  for (const key of ["model_attempts", "provider_attempts"])
    if (o[key] !== undefined) must(o[key] === 1, "unexpected_attempts");
  if (o.model !== undefined) must(o.model === job.model, "model_pin");
  if (o.endpoint_id !== undefined)
    must(o.endpoint_id === job.model, "endpoint_pin");
  if (job.id === "spatial-fal-world-1")
    return retainAssets(
      [
        {
          role: "world",
          url: assetUrl(object(o.world_file).url, "fal"),
          kind: "geometry",
        },
      ],
      job.provider,
    );
  return retainAssets(
    [
      {
        role: "object",
        url: assetUrl(object(o.model_glb).url, "fal"),
        kind: "glb",
      },
    ],
    job.provider,
  );
}
function image(bytes: Buffer): Dict {
  if (
    bytes.length > 32 &&
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) {
    must(
      bytes.subarray(12, 16).toString() === "IHDR" &&
        bytes.indexOf(Buffer.from("IEND")) > 24,
      "invalid_png",
    );
    return {
      format: "png",
      width: integer(bytes.readUInt32BE(16), 1),
      height: integer(bytes.readUInt32BE(20), 1),
    };
  }
  if (
    bytes.length > 8 &&
    bytes[0] === 255 &&
    bytes[1] === 216 &&
    bytes.at(-2) === 255 &&
    bytes.at(-1) === 217
  ) {
    let i = 2;
    while (i + 4 < bytes.length) {
      must(bytes[i] === 255, "invalid_jpeg");
      const marker = bytes[i + 1];
      if (marker === 218) break;
      const size = bytes.readUInt16BE(i + 2);
      must(size >= 2 && i + 2 + size <= bytes.length, "invalid_jpeg");
      if ([192, 193, 194].includes(marker)) {
        must(size >= 8, "invalid_jpeg");
        return {
          format: "jpeg",
          width: integer(bytes.readUInt16BE(i + 7), 1),
          height: integer(bytes.readUInt16BE(i + 5), 1),
        };
      }
      i += 2 + size;
    }
  }
  must(false, "unsupported_or_invalid_image");
}
function glb(bytes: Buffer, requirePbr: boolean): Dict {
  must(
    bytes.length >= 28 &&
      bytes.subarray(0, 4).toString() === "glTF" &&
      bytes.readUInt32LE(4) === 2 &&
      bytes.readUInt32LE(8) === bytes.length,
    "invalid_glb",
  );
  const size = bytes.readUInt32LE(12);
  must(
    bytes.readUInt32LE(16) === 0x4e4f534a &&
      size % 4 === 0 &&
      size + 20 <= bytes.length,
    "invalid_glb_json",
  );
  const d = object(
    parseJSON(
      bytes
        .subarray(20, 20 + size)
        .toString("utf8")
        .trim(),
    ),
  );
  must(
    object(d.asset).version === "2.0" &&
      Array.isArray(d.meshes) &&
      d.meshes.length > 0 &&
      Array.isArray(d.nodes) &&
      d.nodes.length > 0,
    "empty_glb",
  );
  must(
    !d.extensionsRequired ||
      (Array.isArray(d.extensionsRequired) &&
        d.extensionsRequired.length === 0),
    "unsupported_glb_extension",
  );
  const buffers = Array.isArray(d.buffers) ? d.buffers.map(object) : [];
  must(buffers.length === 1 && !buffers[0].uri, "external_glb_buffer");
  const offset = 20 + size;
  must(
    offset + 8 <= bytes.length &&
      bytes.readUInt32LE(offset + 4) === 0x004e4942 &&
      offset + 8 + bytes.readUInt32LE(offset) === bytes.length &&
      integer(buffers[0].byteLength, 1) <= bytes.readUInt32LE(offset),
    "invalid_glb_binary",
  );
  for (const a of Array.isArray(d.images) ? d.images : [])
    must(!object(a).uri, "external_glb_material");
  must(
    Array.isArray(d.accessors) &&
      d.accessors.some(
        (x) => object(x).type === "VEC3" && integer(object(x).count, 1) > 0,
      ),
    "missing_glb_positions",
  );
  const materials = Array.isArray(d.materials) ? d.materials.map(object) : [];
  if (requirePbr)
    must(
      materials.some((x) => x.pbrMetallicRoughness !== undefined),
      "missing_pbr",
    );
  return {
    format: "glb",
    meshes: d.meshes.length,
    nodes: d.nodes.length,
    materials: materials.length,
    structuralOnly: true,
  };
}
function spz(bytes: Buffer): Dict {
  const raw =
    bytes[0] === 31 && bytes[1] === 139
      ? gunzipSync(bytes, { maxOutputLength: 536870912 })
      : bytes;
  must(raw.length >= 16 && raw.readUInt32LE(0) === 0x5053474e, "invalid_spz");
  const version = raw.readUInt32LE(4),
    points = integer(raw.readUInt32LE(8), 1);
  must(points <= 2000000 && [1, 2, 3, 4].includes(version), "unsupported_spz");
  if (version === 4) {
    must(
      raw.length >= 32 && raw[15] > 0 && raw[15] <= 16,
      "invalid_spz_streams",
    );
    const count = raw[15],
      offset = raw.readUInt32LE(16);
    let cursor = offset + count * 16,
      total = 0;
    must(offset >= 32 && cursor <= raw.length, "truncated_spz");
    for (let i = 0; i < count; i++) {
      const compressed = Number(raw.readBigUInt64LE(offset + i * 16)),
        plain = Number(raw.readBigUInt64LE(offset + i * 16 + 8));
      must(
        Number.isSafeInteger(compressed) &&
          Number.isSafeInteger(plain) &&
          plain > 0 &&
          plain <= 536870912 &&
          cursor + compressed <= raw.length,
        "invalid_spz_size",
      );
      total += plain;
      must(total <= 536870912, "spz_expansion_limit");
      must(
        zstdDecompressSync(raw.subarray(cursor, cursor + compressed), {
          maxOutputLength: plain,
        }).length === plain,
        "invalid_spz_stream",
      );
      cursor += compressed;
    }
    must(cursor === raw.length, "invalid_spz_trailer");
  } else must(raw.length >= 16 + points * 16, "truncated_spz");
  return { format: "spz", version, points, structuralOnly: true };
}
export function inspectAsset(bytes: Buffer, asset: Asset, job: Job): Dict {
  must(bytes.length > 0, "empty_asset");
  if (asset.kind === "image") {
    const r =
      asset.role === "thumbnail" && bytes.toString("latin1", 0, 4) === "RIFF"
        ? inspectWebP(bytes)
        : image(bytes);
    if (asset.role === "pano")
      must(Number(r.width) === 2 * Number(r.height), "incompatible_panorama");
    return r;
  }
  if (asset.kind === "splat") return spz(bytes);
  if (bytes.subarray(0, 4).toString() === "glTF")
    return glb(bytes, job.id === "spatial-chest-1");
  if (
    asset.kind === "geometry" &&
    ((bytes[0] === 31 && bytes[1] === 139) ||
      bytes.subarray(0, 4).toString() === "NGSP")
  )
    return spz(bytes);
  // Opaque DRC/archive/image is deliberately not accepted as navigable geometry.
  must(false, "unsupported_or_invalid_geometry");
}
