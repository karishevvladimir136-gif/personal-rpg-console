import { open, type FileHandle } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createInflateRaw } from "node:zlib";
import { Readable } from "node:stream";
import { artifact as c } from "./fal-artifact-contract.ts";
import {
  requireRetrieval as check,
  retrievalReason,
} from "./fal-retrieval-contract.ts";
import { hash, type Dict } from "./protocol.ts";
import { inspectAsset } from "./outputs.ts";
import { retrievalJob } from "./fal-retrieval-contract.ts";
const crcTable = Array.from({ length: 256 }, (_, i) => {
  let x = i;
  for (let j = 0; j < 8; j++) x = x & 1 ? 0xedb88320 ^ (x >>> 1) : x >>> 1;
  return x >>> 0;
});
export function crc32Update(crc: number, b: Uint8Array) {
  for (const x of b) crc = crcTable[(crc ^ x) & 255] ^ (crc >>> 8);
  return crc >>> 0;
}
export function crc32(b: Uint8Array) {
  return (crc32Update(0xffffffff, b) ^ 0xffffffff) >>> 0;
}
type Item = {
  name: string;
  nameBytes: Buffer;
  extension: string;
  dir: boolean;
  flags: number;
  method: number;
  crc: number;
  compressed: number;
  size: number;
  offset: number;
  data: number;
  end: number;
};
function safeName(bytes: Buffer, utf8: boolean) {
  check(
    bytes.length > 0 && bytes.length <= c.zip.maxNameBytes,
    "zip_name_size",
  );
  let name: string;
  try {
    check(
      utf8 || bytes.every((b) => b < 128),
      "zip_unsupported_filename_encoding",
    );
    name = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    check(false, "zip_invalid_filename");
  }
  check(
    name.normalize("NFC") === name &&
      !/[\\:%\x00-\x1f\x7f]/.test(name) &&
      !name.startsWith("/") &&
      !name.startsWith("~"),
    "zip_unsafe_path",
  );
  const dir = name.endsWith("/"),
    parts = (dir ? name.slice(0, -1) : name).split("/");
  check(
    parts.length <= 32 &&
      parts.every(
        (p) =>
          p.length > 0 &&
          p !== "." &&
          p !== ".." &&
          !/[. ]$/.test(p) &&
          !p.startsWith(" ") &&
          !/^(?:con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(p),
      ),
    "zip_traversal_or_device_path",
  );
  const extension = parts.at(-1)!.split(".").at(-1)!.toLowerCase();
  return {
    name,
    dir,
    extension: [
      "drc",
      "glb",
      "gltf",
      "obj",
      "ply",
      "spz",
      "splat",
      "bin",
      "png",
      "jpg",
      "jpeg",
      "webp",
      "json",
      "mtl",
    ].includes(extension)
      ? extension
      : "other",
  };
}
function extra(bytes: Buffer) {
  let pos = 0;
  while (pos < bytes.length) {
    check(pos + 4 <= bytes.length, "zip_extra_truncated");
    const id = bytes.readUInt16LE(pos),
      n = bytes.readUInt16LE(pos + 2);
    check(id !== 1 && id !== 0x7075, "zip_unsupported_extra");
    pos += 4 + n;
    check(pos <= bytes.length, "zip_extra_truncated");
  }
}
async function read(f: FileHandle, at: number, n: number) {
  const b = Buffer.alloc(n);
  const r = await f.read(b, 0, n, at);
  check(r.bytesRead === n, "zip_truncated");
  return b;
}
export async function inspectWorldZIP(
  path: string,
  limits: Record<string, number> = c.zip,
  onInventory?: (inventory: Dict) => void,
) {
  const f = await open(path, "r"),
    started = Date.now();
  const time = () =>
    check(Date.now() - started < limits.timeoutMs, "zip_deadline");
  try {
    const stat = await f.stat();
    check(
      stat.isFile() && stat.size >= 22 && stat.size <= c.limits.maxAssetBytes,
      "zip_file_size",
    );
    const tail = await read(
      f,
      Math.max(0, stat.size - 65557),
      Math.min(stat.size, 65557),
    );
    let e = -1;
    for (let i = tail.length - 22; i >= 0; i--)
      if (
        tail.readUInt32LE(i) === 0x06054b50 &&
        i + 22 + tail.readUInt16LE(i + 20) === tail.length
      ) {
        e = i;
        break;
      }
    check(e >= 0, "zip_end_missing");
    const count = tail.readUInt16LE(e + 10),
      centralSize = tail.readUInt32LE(e + 12),
      centralStart = tail.readUInt32LE(e + 16),
      endAt = stat.size - tail.length + e;
    check(
      tail.readUInt16LE(e + 4) === 0 &&
        tail.readUInt16LE(e + 6) === 0 &&
        tail.readUInt16LE(e + 8) === count &&
        count > 0 &&
        count <= limits.maxEntries &&
        count !== 65535,
      "zip_entry_count_or_multidisk",
    );
    check(
      centralSize > 0 &&
        centralSize <= limits.maxCentralBytes &&
        centralStart + centralSize === endAt,
      "zip_central_bounds",
    );
    const central = await read(f, centralStart, centralSize),
      items: Item[] = [],
      names = new Map<string, boolean>();
    let pos = 0,
      total = 0;
    for (let i = 0; i < count; i++) {
      time();
      check(
        pos + 46 <= central.length && central.readUInt32LE(pos) === 0x02014b50,
        "zip_central_invalid",
      );
      const version = central.readUInt16LE(pos + 6),
        flags = central.readUInt16LE(pos + 8),
        method = central.readUInt16LE(pos + 10),
        crc = central.readUInt32LE(pos + 16),
        compressed = central.readUInt32LE(pos + 20),
        size = central.readUInt32LE(pos + 24),
        nn = central.readUInt16LE(pos + 28),
        ne = central.readUInt16LE(pos + 30),
        nc = central.readUInt16LE(pos + 32),
        attr = central.readUInt32LE(pos + 38),
        offset = central.readUInt32LE(pos + 42),
        end = pos + 46 + nn + ne + nc;
      check(
        end <= central.length &&
          central.readUInt16LE(pos + 34) === 0 &&
          version <= 20 &&
          (flags & ~0x808) === 0 &&
          [0, 8].includes(method),
        "zip_unsupported_features",
      );
      check(
        size <= limits.maxEntryBytes &&
          compressed <= stat.size &&
          size / Math.max(compressed, 1) <= limits.maxRatio,
        "zip_entry_size_or_ratio",
      );
      total += size;
      check(total <= limits.maxTotalBytes, "zip_total_size");
      const nameBytes = central.subarray(pos + 46, pos + 46 + nn),
        n = safeName(nameBytes, !!(flags & 0x800)),
        key = n.name.replace(/\/$/, "").toLowerCase(),
        kind = (attr >>> 16) & 0xf000;
      check(
        [0, 0x8000, 0x4000].includes(kind) &&
          !(attr & 0x400) &&
          (!n.dir || size === 0) &&
          (!(attr & 0x10) || n.dir) &&
          (kind !== 0x4000 || n.dir) &&
          (!n.dir || kind !== 0x8000),
        "zip_special_file",
      );
      check(!names.has(key), "zip_duplicate_or_case_conflict");
      names.set(key, n.dir);
      extra(central.subarray(pos + 46 + nn, pos + 46 + nn + ne));
      items.push({
        ...n,
        nameBytes,
        flags,
        method,
        crc,
        compressed,
        size,
        offset,
        data: 0,
        end: 0,
      });
      pos = end;
    }
    check(pos === central.length, "zip_central_trailer");
    for (const item of items) {
      const parts = item.name.replace(/\/$/, "").toLowerCase().split("/");
      parts.pop();
      while (parts.length) {
        check(
          names.get(parts.join("/")) !== false,
          "zip_file_directory_conflict",
        );
        parts.pop();
      }
    }
    const spelling = new Map<string, string>();
    for (const item of items) {
      const parts = item.name.replace(/\/$/, "").split("/");
      for (let n = 1; n <= parts.length; n++) {
        const part = parts.slice(0, n).join("/"),
          key = part.toLowerCase();
        check(
          !spelling.has(key) || spelling.get(key) === part,
          "zip_case_conflicting_parent",
        );
        spelling.set(key, part);
      }
    }
    let cursor = 0;
    for (const item of [...items].sort((a, b) => a.offset - b.offset)) {
      time();
      check(
        item.offset === cursor && item.offset + 30 <= centralStart,
        "zip_overlap_or_gap",
      );
      const h = await read(f, item.offset, 30);
      check(
        h.readUInt32LE(0) === 0x04034b50 &&
          h.readUInt16LE(4) <= 20 &&
          h.readUInt16LE(6) === item.flags &&
          h.readUInt16LE(8) === item.method,
        "zip_local_mismatch",
      );
      const nn = h.readUInt16LE(26),
        ne = h.readUInt16LE(28);
      check(
        nn === item.nameBytes.length &&
          item.offset + 30 + nn + ne <= centralStart,
        "zip_local_bounds",
      );
      const rest = await read(f, item.offset + 30, nn + ne);
      check(
        rest.subarray(0, nn).equals(item.nameBytes),
        "zip_local_name_mismatch",
      );
      extra(rest.subarray(nn));
      item.data = item.offset + 30 + nn + ne;
      item.end = item.data + item.compressed;
      check(item.end <= centralStart, "zip_data_bounds");
      if (item.flags & 8) {
        const b = await read(
            f,
            item.end,
            Math.min(16, centralStart - item.end),
          ),
          signed = b.length >= 4 && b.readUInt32LE(0) === 0x08074b50,
          skip = signed ? 4 : 0;
        check(
          b.length >= skip + 12 &&
            b.readUInt32LE(skip) === item.crc &&
            b.readUInt32LE(skip + 4) === item.compressed &&
            b.readUInt32LE(skip + 8) === item.size,
          "zip_data_descriptor",
        );
        item.end += skip + 12;
        check(
          [0, item.crc].includes(h.readUInt32LE(14)) &&
            [0, item.compressed].includes(h.readUInt32LE(18)) &&
            [0, item.size].includes(h.readUInt32LE(22)),
          "zip_local_descriptor_conflict",
        );
      } else
        check(
          h.readUInt32LE(14) === item.crc &&
            h.readUInt32LE(18) === item.compressed &&
            h.readUInt32LE(22) === item.size,
          "zip_local_size_mismatch",
        );
      cursor = item.end;
    }
    check(cursor === centralStart, "zip_local_trailer");
    const inventory: Dict[] = [],
      observations: Dict[] = [];
    let structuralError: unknown;
    for (const item of items) {
      time();
      const digest = createHash("sha256");
      let size = 0,
        crc = 0xffffffff,
        prefix = Buffer.alloc(0);
      const collected: Buffer[] = [];
      const collect =
        ["glb", "gltf"].includes(item.extension) &&
        item.size <= limits.maxStructuralBufferBytes;
      async function* compressed() {
        let at = item.data;
        while (at < item.data + item.compressed) {
          time();
          const b = await read(
            f,
            at,
            Math.min(65536, item.data + item.compressed - at),
          );
          at += b.length;
          yield b;
        }
      }
      const source = Readable.from(compressed()),
        inflater = item.method === 8 ? createInflateRaw() : null,
        stream = inflater ? source.pipe(inflater) : source;
      source.on("error", (error) => stream.destroy(error));
      const timer = setTimeout(
        () => {
          source.destroy();
          stream.destroy(new Error("zip_deadline"));
        },
        Math.max(1, limits.timeoutMs - (Date.now() - started)),
      );
      try {
        for await (const chunk of stream) {
          time();
          const b = Buffer.from(chunk);
          size += b.length;
          check(
            size <= item.size && size <= limits.maxEntryBytes,
            "zip_inflated_overflow",
          );
          crc = crc32Update(crc, b);
          digest.update(b);
          if (prefix.length < 32)
            prefix = Buffer.concat([prefix, b.subarray(0, 32 - prefix.length)]);
          if (collect) collected.push(b);
        }
        if (inflater)
          check(
            inflater.bytesWritten === item.compressed,
            "zip_deflate_trailing_bytes",
          );
      } catch (error) {
        if (retrievalReason(error) !== "unexplained_or_invalid_response")
          throw error;
        check(false, "zip_corrupt_stream");
      } finally {
        clearTimeout(timer);
        source.destroy();
        stream.destroy();
      }
      check(
        size === item.size && (crc ^ 0xffffffff) >>> 0 === item.crc,
        "zip_crc_or_size",
      );
      const entry = {
        index: inventory.length,
        pathSHA256: hash(item.name),
        extension: item.dir ? "directory" : item.extension,
        compressedBytes: item.compressed,
        bytes: size,
        sha256: digest.digest("hex"),
      };
      inventory.push(entry);
      let detail: Dict = {
        category: item.extension,
        validation: "ARCHIVE_INTEGRITY_ONLY",
        structuralUsability: "UNVERIFIED",
      };
      try {
        if (item.extension === "drc") {
          check(
            prefix.length >= 11 &&
              prefix.toString("ascii", 0, 5) === "DRACO" &&
              prefix[5] === 2 &&
              prefix[6] <= 3 &&
              prefix[7] <= 1 &&
              prefix[8] <= 2 &&
              (prefix.readUInt16LE(9) & ~0x8000) === 0,
            "zip_invalid_drc_header",
          );
          detail = {
            category: "drc",
            validation: "DRACO_HEADER_ONLY",
            version: `${prefix[5]}.${prefix[6]}`,
            geometry: prefix[7] === 1 ? "mesh" : "point_cloud",
            structuralUsability: "UNVERIFIED_REQUIRES_DRACO_DECODE",
          };
        } else if (item.extension === "glb" && collect) {
          const meta = inspectAsset(
            Buffer.concat(collected),
            { kind: "geometry", role: "world" } as Parameters<
              typeof inspectAsset
            >[1],
            retrievalJob,
          );
          detail = {
            category: "glb",
            validation: "BOUNDED_EXISTING_GLB_STRUCTURAL_VALIDATOR",
            metadata: meta,
            structuralUsability: "CONTAINER_ONLY_MANUAL_REVIEW_REQUIRED",
          };
        } else if (item.extension === "gltf" && collect) {
          let d: unknown;
          try {
            d = JSON.parse(Buffer.concat(collected).toString("utf8"));
          } catch {
            check(false, "zip_invalid_gltf_json");
          }
          check(
            d !== null &&
              typeof d === "object" &&
              "asset" in d &&
              typeof d.asset === "object" &&
              d.asset !== null &&
              "version" in d.asset &&
              d.asset.version === "2.0",
            "zip_invalid_gltf_header",
          );
          detail = {
            category: "gltf",
            validation: "JSON_VERSION_ONLY_NO_EXTERNAL_FETCH",
            structuralUsability: "UNVERIFIED_BUFFERS_AND_REFERENCES",
          };
        }
      } catch (error) {
        structuralError ??= error;
      }
      if (
        ["drc", "glb", "gltf", "obj", "ply", "spz", "splat"].includes(
          item.extension,
        ) &&
        !item.dir
      )
        observations.push({ index: entry.index, ...detail });
    }
    const safeInventory = {
      entryCount: inventory.length,
      totalUncompressedBytes: total,
      entries: inventory,
      noExtraction: true,
      crcChecked: true,
    };
    // Preserve the complete integrity-checked inventory before reporting unsupported/invalid geometry.
    onInventory?.(safeInventory);
    if (structuralError) throw structuralError;
    return {
      inventory: safeInventory,
      inspection: {
        drcRequested: true,
        drcPresent: observations.some((o) => o.category === "drc"),
        worldCandidateCount: observations.length,
        formats: [...new Set(observations.map((o) => o.category))],
        observations,
        structuralUsability: "MANUAL_REVIEW_REQUIRED",
        visualQuality: "UNVERIFIED",
        navigationQuality: "UNVERIFIED",
        executedFiles: 0,
      },
    };
  } finally {
    await f.close();
  }
}
