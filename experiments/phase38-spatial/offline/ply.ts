// Offline-only bounded PLY structure inspection. No provider/runtime imports.
export const PLY_LIMITS = Object.freeze({
  bytes: 128 * 1024 * 1024,
  headerBytes: 65536,
  elements: 8,
  properties: 32,
  records: 8_000_000,
  elementRecords: 4_000_000,
  listLength: 64,
  values: 80_000_000,
  timeoutMs: 60000,
});
export class PlyError extends Error {
  readonly code: string;
  constructor(code: string) {
    super(code);
    this.code = code;
  }
}
function check(value: unknown, code: string): asserts value {
  if (!value) throw new PlyError(code);
}
type Scalar = { bytes: number; integer: boolean; signed?: boolean };
const types: Record<string, Scalar> = {
  char: { bytes: 1, integer: true, signed: true },
  uchar: { bytes: 1, integer: true },
  short: { bytes: 2, integer: true, signed: true },
  ushort: { bytes: 2, integer: true },
  int: { bytes: 4, integer: true, signed: true },
  uint: { bytes: 4, integer: true },
  float: { bytes: 4, integer: false },
  double: { bytes: 8, integer: false },
};
const aliases: Record<string, string> = {
  int8: "char",
  uint8: "uchar",
  int16: "short",
  uint16: "ushort",
  int32: "int",
  uint32: "uint",
  float32: "float",
  float64: "double",
};
type Property = { name: string; type: string; countType?: string };
type Element = { name: string; count: number; properties: Property[] };
function type(name: string) {
  const key = aliases[name] ?? name;
  check(Object.hasOwn(types, key), "ply_unsupported_scalar_type");
  return key;
}
export function parsePLY(bytes: Buffer) {
  check(bytes.length > 0 && bytes.length <= PLY_LIMITS.bytes, "ply_entry_size");
  const deadline = Date.now() + PLY_LIMITS.timeoutMs;
  let offset = 0;
  function line() {
    const end = bytes.subarray(0, PLY_LIMITS.headerBytes).indexOf(10, offset);
    check(
      end >= 0 && end + 1 <= PLY_LIMITS.headerBytes,
      "ply_header_limit_or_truncated",
    );
    const raw = bytes.subarray(offset, end);
    check(
      raw.every((b) => b === 9 || b === 13 || (b >= 32 && b <= 126)),
      "ply_header_encoding",
    );
    offset = end + 1;
    return raw.toString("ascii").replace(/\r$/, "");
  }
  check(line() === "ply", "ply_magic");
  const format = line().split(/\s+/);
  check(
    format.length === 3 && format[0] === "format" && format[2] === "1.0",
    "ply_format_version",
  );
  const encoding = format[1];
  check(
    ["ascii", "binary_little_endian", "binary_big_endian"].includes(encoding),
    "ply_encoding",
  );
  const elements: Element[] = [];
  let records = 0;
  while (true) {
    const raw = line();
    if (raw === "end_header") break;
    const words = raw.trim().split(/\s+/);
    if (["comment", "obj_info"].includes(words[0])) continue; // Never emit arbitrary comments.
    if (words[0] === "element") {
      check(
        words.length === 3 && ["vertex", "face"].includes(words[1]),
        "ply_unsupported_element",
      );
      check(
        !elements.some((e) => e.name === words[1]),
        "ply_duplicate_element",
      );
      check(/^\d{1,9}$/.test(words[2]), "ply_element_count");
      const count = Number(words[2]);
      records += count;
      check(
        count <= PLY_LIMITS.elementRecords &&
          records <= PLY_LIMITS.records &&
          elements.length < PLY_LIMITS.elements,
        "ply_record_limit",
      );
      elements.push({ name: words[1], count, properties: [] });
    } else if (words[0] === "property") {
      const element = elements.at(-1);
      check(
        element && element.properties.length < PLY_LIMITS.properties,
        "ply_property_limit_or_order",
      );
      const list = words[1] === "list";
      check(words.length === (list ? 5 : 3), "ply_property_declaration");
      const name = words.at(-1)!;
      check(
        /^[a-zA-Z_][a-zA-Z_0-9]{0,63}$/.test(name) &&
          !element.properties.some((p) => p.name === name),
        "ply_property_name_or_duplicate",
      );
      const property: Property = { name, type: type(words[list ? 3 : 1]) };
      if (list) {
        property.countType = type(words[2]);
        check(
          types[property.countType].integer &&
            types[property.type].integer &&
            element.name === "face",
          "ply_unsupported_list_type",
        );
      }
      element.properties.push(property);
    } else check(false, "ply_unsupported_header_declaration");
  }
  const headerBytes = offset;
  check(
    elements.every((e) => e.properties.length > 0),
    "ply_empty_element_properties",
  );
  const vertex = elements.find((e) => e.name === "vertex"),
    face = elements.find((e) => e.name === "face");
  check(
    vertex &&
      ["x", "y", "z"].every((n) =>
        vertex.properties.some((p) => p.name === n && !p.countType),
      ),
    "ply_missing_xyz",
  );
  const indexProperties =
    face?.properties.filter((p) =>
      ["vertex_indices", "vertex_index"].includes(p.name),
    ) ?? [];
  check(
    indexProperties.length <= 1 &&
      indexProperties.every((p) => p.countType && types[p.type].integer),
    "ply_face_index_declaration",
  );
  if (encoding !== "ascii") {
    const minimum = elements.reduce(
      (sum, e) =>
        sum +
        e.count *
          e.properties.reduce(
            (n, p) => n + types[p.countType ?? p.type].bytes,
            0,
          ),
      0,
    );
    check(minimum <= bytes.length - offset, "ply_payload_minimum");
  }
  const little = encoding === "binary_little_endian";
  let values = 0;
  function scalar(key: string): number {
    if ((++values & 65535) === 0) check(Date.now() <= deadline, "ply_deadline");
    check(values <= PLY_LIMITS.values, "ply_value_limit");
    const t = types[key];
    if (encoding === "ascii") {
      while (offset < bytes.length && [9, 10, 13, 32].includes(bytes[offset]))
        offset++;
      const start = offset;
      while (
        offset < bytes.length &&
        ![9, 10, 13, 32].includes(bytes[offset])
      ) {
        check(
          offset - start < 64 && bytes[offset] >= 33 && bytes[offset] <= 126,
          "ply_ascii_token",
        );
        offset++;
      }
      check(offset > start, "ply_truncated_payload");
      const token = bytes.toString("ascii", start, offset);
      check(
        /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(token) ||
          /^(?:nan|[+-]?inf(?:inity)?)$/i.test(token),
        "ply_ascii_number",
      );
      const value = /^nan$/i.test(token)
        ? NaN
        : /^[+-]?inf/i.test(token)
          ? token.startsWith("-")
            ? -Infinity
            : Infinity
          : Number(token);
      if (t.integer) {
        const bits = t.bytes * 8;
        check(
          Number.isInteger(value) &&
            value >= (t.signed ? -(2 ** (bits - 1)) : 0) &&
            value <= (t.signed ? 2 ** (bits - 1) - 1 : 2 ** bits - 1),
          "ply_integer_range",
        );
      }
      return !t.integer && t.bytes === 4 ? Math.fround(value) : value;
    }
    check(offset + t.bytes <= bytes.length, "ply_truncated_payload");
    let value: number;
    if (t.integer)
      value = t.signed
        ? little
          ? bytes.readIntLE(offset, t.bytes)
          : bytes.readIntBE(offset, t.bytes)
        : little
          ? bytes.readUIntLE(offset, t.bytes)
          : bytes.readUIntBE(offset, t.bytes);
    else
      value =
        t.bytes === 4
          ? little
            ? bytes.readFloatLE(offset)
            : bytes.readFloatBE(offset)
          : little
            ? bytes.readDoubleLE(offset)
            : bytes.readDoubleBE(offset);
    offset += t.bytes;
    return value;
  }
  const min = [Infinity, Infinity, Infinity],
    max = [-Infinity, -Infinity, -Infinity];
  let nanCoordinates = 0,
    infiniteCoordinates = 0,
    nonfiniteNormals = 0;
  let invalidIndices = 0,
    invalidFaces = 0,
    repeatedIndexFaces = 0;
  let minFaceVertices = Infinity,
    maxFaceVertices = 0,
    finiteCoordinateValues = 0;
  const vertexNames = vertex.properties.map((p) => p.name);
  for (const element of elements) {
    for (let row = 0; row < element.count; row++) {
      let badFace = false;
      for (const p of element.properties) {
        if (p.countType) {
          const count = scalar(p.countType);
          check(
            Number.isInteger(count) &&
              count >= 0 &&
              count <= PLY_LIMITS.listLength,
            "ply_list_limit",
          );
          if (encoding !== "ascii")
            check(
              count * types[p.type].bytes <= bytes.length - offset,
              "ply_list_truncated",
            );
          const isIndices = p === indexProperties[0];
          const seen: number[] = [];
          let repeated = false;
          if (isIndices) {
            minFaceVertices = Math.min(minFaceVertices, count);
            maxFaceVertices = Math.max(maxFaceVertices, count);
            if (count < 3) badFace = true;
          }
          for (let j = 0; j < count; j++) {
            const v = scalar(p.type);
            if (isIndices) {
              if (v < 0 || v >= vertex.count) {
                invalidIndices++;
                badFace = true;
              }
              if (seen.includes(v)) repeated = true;
              seen.push(v);
            }
          }
          if (isIndices && repeated) {
            repeatedIndexFaces++;
            badFace = true;
          }
        } else {
          const v = scalar(p.type);
          const axis = ["x", "y", "z"].indexOf(p.name);
          if (element.name === "vertex" && axis >= 0) {
            if (Number.isNaN(v)) nanCoordinates++;
            else if (!Number.isFinite(v)) infiniteCoordinates++;
            else {
              finiteCoordinateValues++;
              min[axis] = Math.min(min[axis], v);
              max[axis] = Math.max(max[axis], v);
            }
          }
          if (
            element.name === "vertex" &&
            ["nx", "ny", "nz"].includes(p.name) &&
            !Number.isFinite(v)
          )
            nonfiniteNormals++;
        }
      }
      if (element.name === "face" && badFace) invalidFaces++;
    }
  }
  if (encoding === "ascii")
    while (offset < bytes.length && [9, 10, 13, 32].includes(bytes[offset]))
      offset++;
  check(offset === bytes.length, "ply_trailing_data");
  const coordinatesFinite = nanCoordinates === 0 && infiniteCoordinates === 0;
  const nonemptyMesh =
    vertex.count > 0 && !!face?.count && indexProperties.length === 1;
  const valid =
    nonemptyMesh &&
    coordinatesFinite &&
    invalidFaces === 0 &&
    nonfiniteNormals === 0;
  const safeNames = new Set([
    "x",
    "y",
    "z",
    "nx",
    "ny",
    "nz",
    "red",
    "green",
    "blue",
    "alpha",
    "s",
    "t",
    "u",
    "v",
    "texture_u",
    "texture_v",
    "vertex_index",
    "vertex_indices",
  ]);
  return {
    magicValid: true,
    headerValid: true,
    version: "1.0",
    encoding,
    headerBytes,
    payloadBytes: bytes.length - headerBytes,
    fullyParsed: true,
    elements: elements.map((e) => ({
      type: e.name,
      count: e.count,
      properties: e.properties.map((p) => ({
        name: safeNames.has(p.name) ? p.name : "other",
        type: p.type,
        ...(p.countType ? { countType: p.countType } : {}),
      })),
    })),
    vertexCount: vertex.count,
    faceCount: face?.count ?? 0,
    positions: true,
    normals: ["nx", "ny", "nz"].every((n) => vertexNames.includes(n)),
    colors: ["red", "green", "blue"].every((n) => vertexNames.includes(n)),
    uvProperties: vertexNames.filter((n) =>
      ["s", "t", "u", "v", "texture_u", "texture_v"].includes(n),
    ),
    faceIndexLists: indexProperties.length === 1,
    boundingBox: coordinatesFinite && vertex.count ? { min, max } : null,
    coordinateValuesChecked: vertex.count * 3,
    finiteCoordinateValues,
    nanCoordinates,
    infiniteCoordinates,
    coordinatesFinite,
    nonfiniteNormals,
    minFaceVertices: Number.isFinite(minFaceVertices) ? minFaceVertices : null,
    maxFaceVertices,
    invalidIndices,
    invalidFaces,
    repeatedIndexFaces,
    structuralClassification: valid
      ? "VALID_NONEMPTY_MESH_STRUCTURE"
      : nonemptyMesh
        ? "INVALID_MESH_STRUCTURE"
        : "NON_MESH_PLY",
  };
}
export function classifyWorld(
  layers: { structuralClassification: string }[],
  expectedCount = 3,
) {
  const valid = layers.filter(
    (x) => x.structuralClassification === "VALID_NONEMPTY_MESH_STRUCTURE",
  ).length;
  if (layers.length === expectedCount && valid === expectedCount)
    return "STRUCTURALLY_USABLE_PLY_WORLD_CANDIDATE";
  if (valid) return "PARTIAL_PLY_WORLD_CANDIDATE";
  if (
    layers.some(
      (x) => x.structuralClassification === "CONTAINER_ONLY_UNVERIFIED",
    )
  )
    return "PLY_CONTAINER_ONLY_UNVERIFIED";
  return "INVALID_WORLD_GEOMETRY";
}
