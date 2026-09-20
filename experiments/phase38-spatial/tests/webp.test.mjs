import test from "node:test";
import assert from "node:assert/strict";
import { inspectWebP } from "../src/webp.ts";
import { inspectAsset } from "../src/outputs.ts";
import { protocol } from "../src/protocol.ts";
import { chunk, riff, vp8, vp8l, vp8x, webp } from "./webp-fixtures.mjs";
const thumbnail = { role: "thumbnail", kind: "image", url: "synthetic.webp" };
for (const [codec, chunks] of [
  ["VP8", [vp8()]],
  ["VP8L", [vp8l()]],
  ["VP8X+VP8", [vp8x(), vp8()]],
  ["VP8X+VP8L", [vp8x(), vp8l()]],
]) {
  test(`bounded structural ${codec} thumbnail dimensions`, () => {
    const r = inspectAsset(riff(chunks), thumbnail, protocol.jobs[0]);
    assert.equal(r.format, "webp");
    assert.equal(r.width, 2);
    assert.equal(r.height, 1);
    assert.equal(r.structuralOnly, true);
  });
}
test("bounded inert metadata and unknown chunks never execute embedded content", () => {
  const r = inspectWebP(
    riff([
      vp8x(2, 1, 0x08),
      vp8l(),
      chunk(
        "EXIF",
        Buffer.from("<script>throw Error('never executed')</script>"),
      ),
      chunk("TEST", Buffer.from("synthetic")),
    ]),
  );
  assert.equal(r.chunks, 4);
});
const badCases = [
  [
    "RIFF identity",
    (b) => {
      b[0] = 0;
    },
  ],
  [
    "WEBP identity",
    (b) => {
      b[8] = 0;
    },
  ],
  ["container truncation", (b) => b.subarray(0, -2)],
  ["trailing bytes", (b) => Buffer.concat([b, Buffer.alloc(2)])],
  ["oversized declared container", (b) => b.writeUInt32LE(0xffffffff, 4)],
  ["oversized declared chunk", (b) => b.writeUInt32LE(0xffffffff, 16)],
  [
    "bad VP8L signature",
    (b) => {
      b[20] = 0;
    },
  ],
  [
    "unknown VP8L version",
    (b) => {
      b[24] = 0xe0;
    },
  ],
];
for (const [label, change] of badCases)
  test(`reject ${label}`, () => {
    let b = webp();
    const v = change(b);
    if (Buffer.isBuffer(v)) b = v;
    assert.throws(() => inspectWebP(b));
  });
for (const [label, chunks] of [
  ["missing bitstream", [vp8x()]],
  ["duplicate bitstream", [vp8l(), vp8l()]],
  ["canvas mismatch", [vp8x(3, 1), vp8l()]],
  ["zero VP8 dimension", [vp8(0, 1)]],
  ["too many pixels", [vp8l(16384, 16384)]],
  ["oversized canvas", [vp8x(100000, 1), vp8l()]],
  ["animated", [vp8x(2, 1, 2), vp8l()]],
  ["animation chunk", [vp8x(), chunk("ANIM", Buffer.alloc(6)), vp8l()]],
  ["reserved flags", [vp8x(2, 1, 1), vp8l()]],
  ["missing indicated metadata", [vp8x(2, 1, 8), vp8l()]],
  [
    "too many chunks",
    [
      vp8l(),
      ...Array.from({ length: 64 }, () => chunk("TEST", Buffer.from("a"))),
    ],
  ],
  ["header-only VP8L", [chunk("VP8L", Buffer.from([0x2f, 0, 0, 0, 0]))]],
])
  test(`reject ${label}`, () => assert.throws(() => inspectWebP(riff(chunks))));
test("bad RIFF odd-chunk padding is rejected", () => {
  const b = riff([vp8()]);
  b[b.length - 1] = 1;
  assert.throws(() => inspectWebP(b));
});
test("invalid VP8 partition/signature and extended reserved bytes are rejected", () => {
  for (const offset of [20, 23, 24, 25]) {
    const b = riff([vp8()]);
    b[offset] = 255;
    assert.throws(() => inspectWebP(b));
  }
  const b = riff([vp8x(), vp8l()]);
  b[21] = 1;
  assert.throws(() => inspectWebP(b));
});
test("every truncated structural prefix fails", () => {
  const b = riff([vp8x(), vp8l()]);
  for (let i = 0; i < b.length; i++)
    assert.throws(() => inspectWebP(b.subarray(0, i)));
});
test("WebP support is thumbnail-only; panorama still requires its supported equirectangular format", () => {
  assert.throws(
    () =>
      inspectAsset(webp(), { ...thumbnail, role: "pano" }, protocol.jobs[0]),
    /unsupported_or_invalid_image/,
  );
});

test("high-bit container aliases are not RIFF/WEBP", () => {
  for (const offset of [0, 3, 8, 11]) {
    const b = webp();
    b[offset] |= 0x80;
    assert.throws(() => inspectWebP(b), /invalid_webp_container/);
  }
});
test("VP8L alpha hint is informational and not an unsupported hard equality", () => {
  assert.equal(inspectWebP(riff([vp8x(2, 1, 0x10), vp8l()])).alphaHint, false);
});
