import test from "node:test";
import assert from "node:assert/strict";
import { deflateSync } from "node:zlib";
import {
  checkedPng,
  imageResponsePixels,
} from "../src/lib/server/media/png.ts";
import { fixture } from "./media-frame-fixture.mjs";
function crc(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) {
    value ^= byte;
    for (let i = 0; i < 8; i++)
      value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0);
  }
  return (value ^ 0xffffffff) >>> 0;
}
function chunk(type, body) {
  const result = Buffer.alloc(body.length + 12);
  result.writeUInt32BE(body.length);
  result.write(type, 4);
  body.copy(result, 8);
  result.writeUInt32BE(
    crc(result.subarray(4, result.length - 4)),
    result.length - 4,
  );
  return result;
}
function encoded({
  depth = 8,
  color = 2,
  compression = 0,
  filterMethod = 0,
  interlace = 0,
  rows,
  compressed,
  palette,
  split = false,
  contiguous = false,
  duplicateHeader = false,
  transparency,
} = {}) {
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[color] ?? 3,
    stride = Math.ceil((1024 * depth * channels) / 8) + 1;
  const header = Buffer.alloc(13);
  header.writeUInt32BE(1024);
  header.writeUInt32BE(1024, 4);
  header[8] = depth;
  header[9] = color;
  header[10] = compression;
  header[11] = filterMethod;
  header[12] = interlace;
  const data = compressed ?? deflateSync(rows ?? Buffer.alloc(stride * 1024));
  const chunks = [chunk("IHDR", header)];
  if (duplicateHeader) chunks.push(chunk("IHDR", header));
  if (palette) chunks.push(chunk("PLTE", palette));
  if (transparency) chunks.push(chunk("tRNS", transparency));
  if (split)
    chunks.push(
      chunk("IDAT", data.subarray(0, 5)),
      chunk("tEXt", Buffer.from("note\0local")),
      chunk("IDAT", data.subarray(5)),
    );
  else if (contiguous)
    chunks.push(
      chunk("IDAT", data.subarray(0, 5)),
      chunk("IDAT", data.subarray(5)),
    );
  else chunks.push(chunk("IDAT", data));
  chunks.push(chunk("IEND", Buffer.alloc(0)));
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    ...chunks,
  ]);
}
for (const [color, depths] of [
  [0, [1, 2, 4, 8, 16]],
  [2, [8, 16]],
  [3, [1, 2, 4, 8]],
  [4, [8, 16]],
  [6, [8, 16]],
])
  for (const depth of depths)
    test(`supported noninterlaced PNG color ${color}/depth ${depth} validates exact scanline size`, () => {
      assert.match(
        checkedPng(
          encoded({
            depth,
            color,
            palette: color === 3 ? Buffer.alloc(3) : undefined,
          }),
        ),
        /^[a-f0-9]{64}$/,
      );
    });
for (const invalid of [
  { depth: 7 },
  { color: 1 },
  { color: 2, depth: 4 },
  { color: 3, depth: 16 },
  { compression: 1 },
  { filterMethod: 1 },
  { interlace: 1 },
  { interlace: 2 },
  { duplicateHeader: true },
  { color: 3 },
  { color: 3, palette: Buffer.alloc(4) },
  { color: 0, palette: Buffer.alloc(3) },
  { color: 6, transparency: Buffer.alloc(6) },
  { split: true },
])
  test("PNG rejects invalid/unsupported header or critical chunk ordering instead of completing a broken asset", () => {
    assert.throws(() => checkedPng(encoded(invalid)), /invalid_image/);
  });
test("bounded IDAT decode rejects invalid zlib, truncated/excess rows, bad filters and trailing compressed bytes", () => {
  const stride = 1024 * 3 + 1,
    rows = Buffer.alloc(stride * 1024),
    badFilter = Buffer.from(rows);
  badFilter[0] = 5;
  for (const image of [
    encoded({ compressed: Buffer.from("not-zlib") }),
    encoded({ rows: rows.subarray(0, rows.length - 1) }),
    encoded({ rows: Buffer.alloc(rows.length + 100000) }),
    encoded({ rows: badFilter }),
    encoded({
      compressed: Buffer.concat([deflateSync(rows), Buffer.from("trailing")]),
    }),
  ])
    assert.throws(() => checkedPng(image), /invalid_image/);
});
test("valid scanline filters 0..4 and contiguous IDAT chunks remain supported", () => {
  const stride = 1024 * 3 + 1,
    rows = Buffer.alloc(stride * 1024);
  for (let y = 0; y < 1024; y++) rows[y * stride] = y % 5;
  assert.match(
    checkedPng(encoded({ rows, contiguous: true })),
    /^[a-f0-9]{64}$/,
  );
});
test("indexed PNG rejects missing/out-of-range palette pixels after reversing filters", () => {
  const stride = 1025,
    rows = Buffer.alloc(stride * 1024);
  rows[0] = 1;
  rows[1] = 1;
  assert.throws(
    () =>
      checkedPng(
        encoded({ depth: 8, color: 3, palette: Buffer.alloc(3), rows }),
      ),
    /invalid_image/,
  );
});
test("provider result parser rejects correctly checksummed invalid PNG before constructing stored output", () => {
  const f = fixture(),
    image = encoded({ depth: 7 });
  assert.throws(
    () =>
      imageResponsePixels(
        { data: [{ b64_json: image.toString("base64") }] },
        f.snapshot.campaign.id,
        f.snapshot.campaign.id,
        { size: "1024x1024", quality: "high", outputFormat: "png", n: 1 },
        null,
      ),
    /invalid_image/,
  );
  assert.equal(f.providerCalls(), 0);
});
