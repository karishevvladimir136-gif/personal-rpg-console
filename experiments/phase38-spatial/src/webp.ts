import { must, protocol, type Dict } from "./protocol.ts";

// Header/container inspection only: no entropy decoding or execution of metadata.
export function inspectWebP(bytes: Buffer): Dict {
  must(
    bytes.length >= 20 &&
      bytes.length <= protocol.limits.maxAssetBytes &&
      bytes.toString("latin1", 0, 4) === "RIFF" &&
      bytes.toString("latin1", 8, 12) === "WEBP" &&
      bytes.readUInt32LE(4) + 8 === bytes.length &&
      bytes.length % 2 === 0,
    "invalid_webp_container",
  );
  let cursor = 12,
    chunks = 0,
    flags = 0,
    width = 0,
    height = 0;
  let canvas: [number, number] | null = null,
    codec = "",
    alpha = false;
  const seen = new Set<string>();
  while (cursor < bytes.length) {
    must(++chunks <= 64 && cursor + 8 <= bytes.length, "invalid_webp_chunk");
    const kind = bytes.toString("latin1", cursor, cursor + 4),
      size = bytes.readUInt32LE(cursor + 4);
    const start = cursor + 8,
      end = start + size,
      next = end + (size % 2);
    must(
      size > 0 && next <= bytes.length && (size % 2 === 0 || bytes[end] === 0),
      "invalid_webp_chunk",
    );
    const b = bytes.subarray(start, end);
    must(!["ANIM", "ANMF"].includes(kind), "unsupported_webp_animation");
    if (
      ["VP8X", "VP8 ", "VP8L", "ALPH", "ICCP", "EXIF", "XMP "].includes(kind)
    ) {
      must(!seen.has(kind), "duplicate_webp_chunk");
      seen.add(kind);
    }
    if (kind === "VP8X") {
      must(
        cursor === 12 &&
          size === 10 &&
          (b[0] & 0xc1) === 0 &&
          b[1] === 0 &&
          b[2] === 0 &&
          b[3] === 0,
        "invalid_webp_extended",
      );
      flags = b[0];
      must((flags & 2) === 0, "unsupported_webp_animation");
      canvas = [b.readUIntLE(4, 3) + 1, b.readUIntLE(7, 3) + 1];
    } else if (kind === "VP8 ") {
      must(!codec && size > 10, "invalid_webp_image");
      const tag = b.readUIntLE(0, 3),
        partition = tag >>> 5;
      must(
        (tag & 1) === 0 &&
          (tag & 16) !== 0 &&
          ((tag >>> 1) & 7) <= 3 &&
          b[3] === 0x9d &&
          b[4] === 1 &&
          b[5] === 0x2a &&
          partition > 0 &&
          partition <= size - 10,
        "invalid_webp_vp8",
      );
      width = b.readUInt16LE(6) & 0x3fff;
      height = b.readUInt16LE(8) & 0x3fff;
      codec = "VP8";
    } else if (kind === "VP8L") {
      must(
        !codec && size > 5 && b[0] === 0x2f && b[4] >>> 5 === 0,
        "invalid_webp_vp8l",
      );
      const bits = b.readUInt32LE(1);
      width = (bits & 0x3fff) + 1;
      height = ((bits >>> 14) & 0x3fff) + 1;
      alpha = !!(bits & 0x10000000);
      codec = "VP8L";
    } else if (kind === "ALPH") {
      must(
        canvas &&
          !codec &&
          size > 1 &&
          (b[0] & 0xc0) === 0 &&
          (b[0] & 3) <= 1 &&
          ((b[0] >>> 4) & 3) <= 1,
        "invalid_webp_alpha",
      );
    } else if (kind === "ICCP") must(canvas && !codec, "invalid_webp_metadata");
    else if (["EXIF", "XMP "].includes(kind))
      must(canvas, "invalid_webp_metadata");
    // Unknown bounded chunks are inert; no embedded data is decoded or executed.
    cursor = next;
  }
  must(
    codec &&
      width > 0 &&
      height > 0 &&
      width <= 16384 &&
      height <= 16384 &&
      width * height <= 67108864,
    "invalid_webp_dimensions",
  );
  if (canvas) {
    must(
      canvas[0] === width && canvas[1] === height,
      "invalid_webp_dimensions",
    );
    must(
      !!(flags & 0x20) === seen.has("ICCP") &&
        !!(flags & 0x08) === seen.has("EXIF") &&
        !!(flags & 0x04) === seen.has("XMP ") &&
        (codec === "VP8L" || !!(flags & 0x10) === seen.has("ALPH")),
      "invalid_webp_features",
    );
  }
  must(!(codec === "VP8L" && seen.has("ALPH")), "invalid_webp_alpha");
  return {
    format: "webp",
    codec,
    width,
    height,
    chunks,
    alphaHint: codec === "VP8L" ? alpha : null,
    structuralOnly: true,
  };
}
