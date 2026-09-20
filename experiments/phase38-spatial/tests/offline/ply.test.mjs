import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parsePLY, classifyWorld, PLY_LIMITS } from "../../offline/ply.ts";
import { pngMetadata, jsonMetadata } from "../../offline/inspect-ply-world.ts";
import { crc32 } from "../../src/fal-artifact-zip.ts";
import { verifyFreeze } from "../../src/freeze.ts";
globalThis.fetch = () => {
  throw Error("OFFLINE_NETWORK_FORBIDDEN");
};
function mesh({
  encoding = "binary_little_endian",
  vertices = [
    [0, 0, 0],
    [1, 0, 0],
    [0, 2, 3],
  ],
  faces = [[0, 1, 2]],
  extras = false,
} = {}) {
  const props = ["x", "y", "z", ...(extras ? ["nx", "ny", "nz"] : [])];
  const header = Buffer.from(
    [
      "ply",
      `format ${encoding} 1.0`,
      `element vertex ${vertices.length}`,
      ...props.map((n) => `property double ${n}`),
      ...(extras
        ? [
            "property uchar red",
            "property uchar green",
            "property uchar blue",
            "property float texture_u",
            "property float texture_v",
          ]
        : []),
      `element face ${faces.length}`,
      "property list uchar uint vertex_indices",
      "end_header",
      "",
    ].join("\n"),
  );
  let data;
  if (encoding === "ascii")
    data = Buffer.from(
      [
        ...vertices.map((v) =>
          [...v, ...(extras ? [0, 0, 1, 255, 128, 0, 0.25, 0.75] : [])].join(
            " ",
          ),
        ),
        ...faces.map((f) => [f.length, ...f].join(" ")),
      ].join("\n") + "\n",
    );
  else {
    const chunks = [];
    const le = encoding === "binary_little_endian";
    for (const v of vertices) {
      const b = Buffer.alloc(props.length * 8 + (extras ? 11 : 0));
      for (const [i, n] of [...v, ...(extras ? [0, 0, 1] : [])].entries())
        b[le ? "writeDoubleLE" : "writeDoubleBE"](n, i * 8);
      if (extras) {
        const o = props.length * 8;
        b.set([255, 128, 0], o);
        b[le ? "writeFloatLE" : "writeFloatBE"](0.25, o + 3);
        b[le ? "writeFloatLE" : "writeFloatBE"](0.75, o + 7);
      }
      chunks.push(b);
    }
    for (const f of faces) {
      const b = Buffer.alloc(1 + f.length * 4);
      b[0] = f.length;
      for (const [i, n] of f.entries())
        b[le ? "writeUInt32LE" : "writeUInt32BE"](n, i * 4 + 1);
      chunks.push(b);
    }
    data = Buffer.concat(chunks);
  }
  return Buffer.concat([header, data]);
}
const change = (b, from, to) =>
  Buffer.concat([
    Buffer.from(
      b
        .subarray(0, b.indexOf("end_header\n") + 11)
        .toString()
        .replace(from, to),
    ),
    b.subarray(b.indexOf("end_header\n") + 11),
  ]);
for (const encoding of ["ascii", "binary_little_endian", "binary_big_endian"])
  test(`fully parses ${encoding} coordinates, faces and properties`, () => {
    const r = parsePLY(mesh({ encoding, extras: true }));
    assert.equal(r.structuralClassification, "VALID_NONEMPTY_MESH_STRUCTURE");
    assert.deepEqual(r.boundingBox, { min: [0, 0, 0], max: [1, 2, 3] });
    assert.equal(r.vertexCount, 3);
    assert.equal(r.faceCount, 1);
    assert.equal(r.finiteCoordinateValues, 9);
    assert.equal(r.invalidIndices, 0);
    assert.equal(r.normals, true);
    assert.equal(r.colors, true);
    assert.deepEqual(r.uvProperties, ["texture_u", "texture_v"]);
    assert.equal(r.minFaceVertices, 3);
  });
test("all three coordinate components are checked including NaN and Infinity", () => {
  const r = parsePLY(
    mesh({
      vertices: [
        [NaN, 0, 0],
        [1, Infinity, 0],
        [0, 2, -Infinity],
      ],
    }),
  );
  assert.equal(r.nanCoordinates, 1);
  assert.equal(r.infiniteCoordinates, 2);
  assert.equal(r.finiteCoordinateValues, 6);
  assert.equal(r.boundingBox, null);
  assert.equal(r.structuralClassification, "INVALID_MESH_STRUCTURE");
});
test("out-of-range and repeated references count invalid faces", () => {
  const r = parsePLY(
    mesh({
      faces: [
        [0, 1, 3],
        [0, 0, 2],
      ],
    }),
  );
  assert.equal(r.invalidIndices, 1);
  assert.equal(r.invalidFaces, 2);
  assert.equal(r.repeatedIndexFaces, 1);
});
test("negative signed face indices fail mesh classification", () => {
  const b = change(mesh(), "list uchar uint", "list uchar int");
  b.writeInt32LE(-1, b.length - 4);
  assert.equal(parsePLY(b).invalidIndices, 1);
});
test("short faces are nonusable mesh structures", () =>
  assert.equal(parsePLY(mesh({ faces: [[0, 1]] })).invalidFaces, 1));
test("empty face set is a point-cloud/non-mesh PLY", () =>
  assert.equal(
    parsePLY(mesh({ faces: [] })).structuralClassification,
    "NON_MESH_PLY",
  ));
test("empty vertex and face set is non-mesh", () =>
  assert.equal(
    parsePLY(mesh({ vertices: [], faces: [] })).structuralClassification,
    "NON_MESH_PLY",
  ));
test("truncated payload fails", () =>
  assert.throws(() => parsePLY(mesh().subarray(0, -1)), /truncated/));
test("unexplained binary trailer fails", () =>
  assert.throws(
    () => parsePLY(Buffer.concat([mesh(), Buffer.from([0])])),
    /trailing_data/,
  ));
test("ASCII trailing nonwhitespace fails", () =>
  assert.throws(
    () =>
      parsePLY(
        Buffer.concat([mesh({ encoding: "ascii" }), Buffer.from("bad")]),
      ),
    /trailing_data/,
  ));
test("bad magic fails", () =>
  assert.throws(() => parsePLY(change(mesh(), "ply\n", "bad\n")), /magic/));
test("unsupported version fails", () =>
  assert.throws(
    () => parsePLY(change(mesh(), "1.0", "2.0")),
    /format_version/,
  ));
test("missing coordinate property fails", () =>
  assert.throws(
    () => parsePLY(change(mesh(), "double z", "double unknown")),
    /missing_xyz/,
  ));
test("duplicate properties fail", () =>
  assert.throws(
    () => parsePLY(change(mesh(), "double z", "double y")),
    /duplicate/,
  ));
test("duplicate element fails", () =>
  assert.throws(
    () => parsePLY(change(mesh(), "element face 1", "element vertex 1")),
    /duplicate_element/,
  ));
test("unbounded declared records rejected before allocation", () =>
  assert.throws(
    () => parsePLY(change(mesh(), "vertex 3", "vertex 999999999")),
    /record_limit/,
  ));
test("negative declared records rejected", () =>
  assert.throws(
    () => parsePLY(change(mesh(), "vertex 3", "vertex -1")),
    /element_count/,
  ));
test("unsupported element rejected safely", () =>
  assert.throws(
    () => parsePLY(change(mesh(), "element face", "element executable")),
    /unsupported_element/,
  ));
test("unsupported scalar rejected", () =>
  assert.throws(
    () => parsePLY(change(mesh(), "double x", "pointer x")),
    /unsupported_scalar/,
  ));
test("floating list count rejected", () =>
  assert.throws(
    () => parsePLY(change(mesh(), "list uchar uint", "list float uint")),
    /unsupported_list/,
  ));
test("floating indices rejected", () =>
  assert.throws(
    () => parsePLY(change(mesh(), "list uchar uint", "list uchar double")),
    /unsupported_list/,
  ));
test("list length bounded before allocation/read", () => {
  const b = mesh();
  b[b.length - 13] = PLY_LIMITS.listLength + 1;
  assert.throws(() => parsePLY(b), /list_limit/);
});
test("header bounded and missing terminator rejected", () =>
  assert.throws(
    () =>
      parsePLY(
        Buffer.from("ply\nformat ascii 1.0\ncomment " + "A".repeat(65536)),
      ),
    /header_limit/,
  ));
test("property count bounded", () => {
  const properties = Array.from(
    { length: 33 },
    (_, i) => `property float p${i}`,
  ).join("\n");
  assert.throws(
    () =>
      parsePLY(
        Buffer.from(
          `ply\nformat ascii 1.0\nelement vertex 0\n${properties}\nend_header\n`,
        ),
      ),
    /property_limit/,
  );
});
test("ASCII integer range is enforced", () =>
  assert.throws(
    () =>
      parsePLY(
        Buffer.from(
          mesh({ encoding: "ascii" })
            .toString()
            .replace(/3 0 1 2\n$/, "256 0 1 2\n"),
        ),
      ),
    /integer_range/,
  ));
test("comments are never disclosed", () => {
  const r = parsePLY(
    change(
      mesh(),
      "element vertex",
      "comment SYNTHETIC_PRIVATE_MARKER\nelement vertex",
    ),
  );
  assert.equal(JSON.stringify(r).includes("SYNTHETIC_PRIVATE_MARKER"), false);
});
test("ASCII NaN counted, not silently accepted", () => {
  const r = parsePLY(
    mesh({
      encoding: "ascii",
      vertices: [
        [NaN, 0, 0],
        [1, 0, 0],
        [0, 2, 3],
      ],
    }),
  );
  assert.equal(r.nanCoordinates, 1);
  assert.equal(r.structuralClassification, "INVALID_MESH_STRUCTURE");
});
test("binary float normals checked for nonfinite values", () => {
  const b = mesh({ extras: true });
  const start = b.indexOf("end_header\n") + 11;
  b.writeDoubleLE(NaN, start + 24);
  assert.equal(parsePLY(b).nonfiniteNormals, 1);
});
for (const [name, layers, expected] of [
  [
    "all valid",
    Array(3).fill({
      structuralClassification: "VALID_NONEMPTY_MESH_STRUCTURE",
    }),
    "STRUCTURALLY_USABLE_PLY_WORLD_CANDIDATE",
  ],
  [
    "one valid",
    [
      { structuralClassification: "VALID_NONEMPTY_MESH_STRUCTURE" },
      { structuralClassification: "INVALID_MESH_STRUCTURE" },
    ],
    "PARTIAL_PLY_WORLD_CANDIDATE",
  ],
  [
    "bounded incomplete",
    [{ structuralClassification: "CONTAINER_ONLY_UNVERIFIED" }],
    "PLY_CONTAINER_ONLY_UNVERIFIED",
  ],
  [
    "invalid",
    [{ structuralClassification: "INVALID_MESH_STRUCTURE" }],
    "INVALID_WORLD_GEOMETRY",
  ],
])
  test(`classification ${name}`, () =>
    assert.equal(classifyWorld(layers), expected));
test("JSON metadata hides arbitrary names and values", () => {
  const r = jsonMetadata(
    Buffer.from(
      '{"SYNTHETIC_PRIVATE_KEY":{"secret":"SYNTHETIC_PRIVATE_VALUE"},"items":[1,2]}',
    ),
  );
  assert.deepEqual(r.topLevelValueTypes, { object: 1, array: 1 });
  assert.equal(JSON.stringify(r).includes("SYNTHETIC_PRIVATE"), false);
});
test("invalid JSON rejected", () =>
  assert.throws(() => jsonMetadata(Buffer.from("{")), /json_invalid/));
test("oversized JSON rejected before parse", () =>
  assert.throws(
    () => jsonMetadata(Buffer.alloc(16385)),
    /json_metadata_limit/,
  ));
function png() {
  const b = Buffer.alloc(33);
  b.set([137, 80, 78, 71, 13, 10, 26, 10]);
  b.writeUInt32BE(13, 8);
  b.write("IHDR", 12);
  b.writeUInt32BE(1024, 16);
  b.writeUInt32BE(512, 20);
  b[24] = 8;
  b[25] = 2;
  b.writeUInt32BE(crc32(b.subarray(12, 29)), 29);
  return b;
}
test("PNG header returns dimensions only", () =>
  assert.deepEqual(pngMetadata(png()), {
    signatureIHDRValid: true,
    width: 1024,
    height: 512,
    bitDepth: 8,
    colorType: 2,
    interlace: 0,
    fullDecode: false,
  }));
test("PNG bad CRC rejected", () => {
  const b = png();
  b[29] ^= 1;
  assert.throws(() => pngMetadata(b), /crc/);
});
test("PNG truncated header rejected", () =>
  assert.throws(() => pngMetadata(png().subarray(0, 32)), /header/));
test("offline additions leave original live freeze unchanged", () =>
  assert.equal(Object.keys(verifyFreeze().files).length, 67));
test("offline source contains no network, credential, mutation or production imports", () => {
  for (const name of ["ply.ts", "inspect-ply-world.ts"]) {
    const source = readFileSync(
      new URL("../../offline/" + name, import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(
      source,
      /node:(?:https?|net|dns)|\bfetch\s*\(|process\.env|FAL_KEY|\.loadEnvFile|ArtifactLedger|initializeArtifact|from ['"].*(?:app\/|server\/)/,
    );
  }
});
