// Explicit local inspection only: no network, credentials, provider calls or ledger mutation.
import { createReadStream } from "node:fs";
import { open, readFile, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createInflateRaw } from "node:zlib";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { inspectWorldZIP, crc32 } from "../src/fal-artifact-zip.ts";
import { hash, canonical } from "../src/protocol.ts";
import { parsePLY, PlyError, PLY_LIMITS, classifyWorld } from "./ply.ts";
export const SOURCE = Object.freeze({
  evidenceBaseSHA: "e74f98070a35506bdb0401e2d2db2e492c9f8da4",
  evidenceSHA256:
    "ea6188f69a302918afc592c25d44995d007a88a6c17cdc37a96f3a7b12f972f9",
  artifactBytes: 85481294,
  artifactSHA256:
    "721f2afef8c2c045566e20f203557c549d712eef430edd671e5bb2c00b2de331",
});
function check(value: unknown, code: string): asserts value {
  if (!value) throw new Error(code);
}
export async function fileSHA(path: string) {
  const h = createHash("sha256");
  for await (const part of createReadStream(path)) h.update(part);
  return h.digest("hex");
}
export function pngMetadata(b: Buffer) {
  check(
    b.length >= 33 &&
      b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) &&
      b.readUInt32BE(8) === 13 &&
      b.toString("ascii", 12, 16) === "IHDR",
    "png_header",
  );
  check(crc32(b.subarray(12, 29)) === b.readUInt32BE(29), "png_ihdr_crc");
  const width = b.readUInt32BE(16),
    height = b.readUInt32BE(20),
    bitDepth = b[24],
    colorType = b[25];
  const depths: Record<number, number[]> = {
    0: [1, 2, 4, 8, 16],
    2: [8, 16],
    3: [1, 2, 4, 8],
    4: [8, 16],
    6: [8, 16],
  };
  check(
    width > 0 &&
      height > 0 &&
      width <= 65535 &&
      height <= 65535 &&
      depths[colorType]?.includes(bitDepth) &&
      b[26] === 0 &&
      b[27] === 0 &&
      b[28] <= 1,
    "png_ihdr_fields",
  );
  return {
    signatureIHDRValid: true,
    width,
    height,
    bitDepth,
    colorType,
    interlace: b[28],
    fullDecode: false,
  };
}
export function jsonMetadata(b: Buffer) {
  check(b.length <= 16384, "json_metadata_limit");
  let value: unknown;
  try {
    value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(b));
  } catch {
    throw new Error("json_invalid");
  }
  const kind = (v: unknown) =>
    v === null ? "null" : Array.isArray(v) ? "array" : typeof v;
  const values =
    value !== null && typeof value === "object" ? Object.values(value) : [];
  check(values.length <= 128, "json_top_level_limit");
  const valueTypes: Record<string, number> = {};
  for (const v of values) valueTypes[kind(v)] = (valueTypes[kind(v)] ?? 0) + 1;
  return {
    parseValid: true,
    rootType: kind(value),
    topLevelCount: values.length,
    topLevelValueTypes: valueTypes,
    namesAndValuesWithheld: true,
  };
}
export async function inspectRetainedWorld(
  archive: string,
  evidencePath: string,
) {
  const started = Date.now(),
    deadline = started + 240000;
  const time = () =>
    check(Date.now() < deadline, "offline_inspection_deadline");
  const evidenceBytes = await readFile(evidencePath);
  check(
    hash(evidenceBytes) === SOURCE.evidenceSHA256,
    "accepted_evidence_hash",
  );
  const evidence = JSON.parse(evidenceBytes.toString("utf8"));
  check(
    (await stat(archive)).size === SOURCE.artifactBytes &&
      (await fileSHA(archive)) === SOURCE.artifactSHA256,
    "retained_artifact_mismatch",
  );
  const checked = await inspectWorldZIP(archive);
  check(
    canonical(checked.inventory) === canonical(evidence.observation.inventory),
    "accepted_inventory_mismatch",
  );
  time();
  const f = await open(archive, "r");
  const entries = evidence.observation.inventory.entries as {
    index: number;
    extension: string;
    bytes: number;
    sha256: string;
    pathSHA256: string;
  }[];
  const layers: Record<string, unknown>[] = [],
    png: Record<string, unknown>[] = [],
    json: Record<string, unknown>[] = [];
  try {
    const read = async (position: number, length: number) => {
      check(
        length >= 0 &&
          length <= 4 * 1024 * 1024 &&
          position >= 0 &&
          position + length <= SOURCE.artifactBytes,
        "offline_zip_read_bounds",
      );
      const b = Buffer.alloc(length);
      check(
        (await f.read(b, 0, length, position)).bytesRead === length,
        "offline_zip_read",
      );
      return b;
    };
    const tail = await read(
      SOURCE.artifactBytes - Math.min(SOURCE.artifactBytes, 65557),
      Math.min(SOURCE.artifactBytes, 65557),
    );
    let end = -1;
    for (let i = tail.length - 22; i >= 0; i--)
      if (
        tail.readUInt32LE(i) === 0x06054b50 &&
        i + 22 + tail.readUInt16LE(i + 20) === tail.length
      ) {
        end = i;
        break;
      }
    check(end >= 0, "offline_zip_end");
    const central = await read(
      tail.readUInt32LE(end + 16),
      tail.readUInt32LE(end + 12),
    );
    let position = 0;
    for (const entry of entries) {
      time();
      check(
        position + 46 <= central.length &&
          central.readUInt32LE(position) === 0x02014b50,
        "offline_zip_central",
      );
      const compressed = central.readUInt32LE(position + 20),
        size = central.readUInt32LE(position + 24),
        method = central.readUInt16LE(position + 10),
        nameLength = central.readUInt16LE(position + 28),
        extra = central.readUInt16LE(position + 30),
        comment = central.readUInt16LE(position + 32),
        local = central.readUInt32LE(position + 42);
      check(
        size === entry.bytes &&
          hash(central.subarray(position + 46, position + 46 + nameLength)) ===
            entry.pathSHA256,
        "offline_entry_binding",
      );
      position += 46 + nameLength + extra + comment;
      check(position <= central.length, "offline_central_bounds");
      if (!["ply", "png", "json"].includes(entry.extension)) continue;
      check(
        size <= PLY_LIMITS.bytes &&
          (entry.extension !== "json" || size <= 16384),
        "offline_entry_limit",
      );
      const header = await read(local, 30),
        data = local + 30 + header.readUInt16LE(26) + header.readUInt16LE(28);
      check(
        compressed > 0 &&
          data + compressed <= SOURCE.artifactBytes &&
          [0, 8].includes(method),
        "offline_stream_bounds",
      );
      const input = createReadStream(archive, {
          start: data,
          end: data + compressed - 1,
        }),
        inflater = method === 8 ? createInflateRaw() : null,
        stream = inflater ? input.pipe(inflater) : input;
      input.on("error", (error) => stream.destroy(error));
      const timer = setTimeout(
        () => {
          input.destroy();
          stream.destroy(new Error("offline_inspection_deadline"));
        },
        Math.max(1, deadline - Date.now()),
      );
      const digest = createHash("sha256"),
        chunks: Buffer[] = [];
      let bytes = 0,
        collected = 0;
      try {
        for await (const chunk of stream) {
          time();
          const b = Buffer.from(chunk);
          bytes += b.length;
          check(bytes <= size, "offline_inflate_overflow");
          digest.update(b);
          const keep =
            entry.extension === "png"
              ? Math.min(b.length, 33 - collected)
              : b.length;
          if (keep > 0) {
            chunks.push(b.subarray(0, keep));
            collected += keep;
          }
        }
        check(
          !inflater || inflater.bytesWritten === compressed,
          "offline_deflate_consumption",
        );
      } finally {
        clearTimeout(timer);
        input.destroy();
        stream.destroy();
      }
      check(
        bytes === size && digest.digest("hex") === entry.sha256,
        "offline_entry_content_hash",
      );
      const content = Buffer.concat(chunks, collected),
        base = {
          index: entry.index,
          bytes: entry.bytes,
          sha256: entry.sha256,
          pathSHA256: entry.pathSHA256,
        };
      if (entry.extension === "ply") {
        try {
          layers.push({ ...base, ...parsePLY(content) });
        } catch (error) {
          check(error instanceof PlyError, "offline_unexpected_parser_failure");
          const unsupported = /unsupported|limit|deadline/.test(error.code);
          layers.push({
            ...base,
            fullyParsed: false,
            reason: error.code,
            structuralClassification: unsupported
              ? "CONTAINER_ONLY_UNVERIFIED"
              : "INVALID_MESH_STRUCTURE",
          });
        }
      } else if (entry.extension === "png")
        png.push({ ...base, ...pngMetadata(content) });
      else json.push({ ...base, ...jsonMetadata(content) });
    }
    check(position === central.length, "offline_central_end");
  } finally {
    await f.close();
  }
  check(
    (await fileSHA(archive)) === SOURCE.artifactSHA256,
    "artifact_changed_during_inspection",
  );
  return {
    source: SOURCE,
    recoveryIdentity: evidence.recoveryIdentity,
    recoveryHash: evidence.recoveryHash,
    artifactRevalidated: true,
    inspectedAtUTC: new Date(started).toISOString(),
    zipIntegrity: "PASS_REVALIDATED",
    entryCount: 17,
    totalUncompressedBytes: 152960818,
    formatInventory: { png: 12, ply: 3, json: 2, drc: 0, glb: 0, gltf: 0 },
    limits: PLY_LIMITS,
    layers,
    png,
    json,
    classification: classifyWorld(
      layers as { structuralClassification: string }[],
    ),
    drc: {
      requestedExportDRC: true,
      returnedDRC: false,
      returnedPLYCount: layers.length,
      retryJustifiedSolelyForDRC: false,
      futurePlanning:
        "Support observed PLY or an offline validated conversion path; do not require DRC exclusively.",
    },
    visualQuality: "UNVERIFIED",
    navigationQuality: "UNVERIFIED",
    limitations: [
      "No rendering, geometry execution, extraction or full image decode.",
      "Mesh structure and references do not establish topology, manifoldness, triangle-area validity, metric scale, collider alignment or navigability.",
      "JSON reports only root/count/type metadata, never arbitrary keys or values.",
    ],
    network: {
      providerCalls: 0,
      resultGETs: 0,
      assetGETs: 0,
      dnsCalls: 0,
      reservations: 0,
      generations: 0,
      chestCalls: 0,
    },
    accounting: evidence.accounting,
    chestAttempted: false,
    approval: false,
    nextReleased: false,
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const args = process.argv.slice(2);
  check(args.length === 3, "offline_arguments");
  const report = await inspectRetainedWorld(args[0], args[1]);
  await writeFile(args[2], JSON.stringify(report, null, 2) + "\n", {
    flag: "wx",
  });
  console.log(
    JSON.stringify({
      classification: report.classification,
      layers: report.layers,
      network: report.network,
    }),
  );
}
