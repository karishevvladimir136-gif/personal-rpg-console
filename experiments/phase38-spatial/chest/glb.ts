import { inspectAsset } from "../src/outputs.ts";
import { object, integer, type Dict } from "../src/protocol.ts";
import { manifest as c, check } from "./contract.ts";
type Box = { min: number[]; max: number[] };
const empty = (): Box => ({
  min: [Infinity, Infinity, Infinity],
  max: [-Infinity, -Infinity, -Infinity],
});
function add(box: Box, point: number[]) {
  for (let a = 0; a < 3; a++) {
    box.min[a] = Math.min(box.min[a], point[a]);
    box.max[a] = Math.max(box.max[a], point[a]);
  }
}
function combine(box: Box, other: Box) {
  add(box, other.min);
  add(box, other.max);
}
const identity = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
function multiply(a: number[], b: number[]) {
  return Array.from({ length: 16 }, (_, i) => {
    const row = i % 4,
      col = Math.floor(i / 4);
    let sum = 0;
    for (let k = 0; k < 4; k++) sum += a[k * 4 + row] * b[col * 4 + k];
    return sum;
  });
}
function vec(value: unknown, n: number, defaults?: number[]) {
  if (value === undefined && defaults) return defaults;
  check(
    Array.isArray(value) &&
      value.length === n &&
      value.every((x) => typeof x === "number" && Number.isFinite(x)),
    "chest_glb_vector",
  );
  return value as number[];
}
function transform(node: Dict) {
  if (node.matrix !== undefined) {
    check(
      node.translation === undefined &&
        node.rotation === undefined &&
        node.scale === undefined,
      "chest_glb_transform_conflict",
    );
    const m = vec(node.matrix, 16);
    check(
      m[3] === 0 && m[7] === 0 && m[11] === 0 && m[15] === 1,
      "chest_glb_nonaffine",
    );
    return m;
  }
  const t = vec(node.translation, 3, [0, 0, 0]),
    s = vec(node.scale, 3, [1, 1, 1]),
    [x, y, z, w] = vec(node.rotation, 4, [0, 0, 0, 1]);
  check(
    Math.abs(x * x + y * y + z * z + w * w - 1) < 0.001,
    "chest_glb_quaternion",
  );
  return [
    (1 - 2 * (y * y + z * z)) * s[0],
    2 * (x * y + z * w) * s[0],
    2 * (x * z - y * w) * s[0],
    0,
    2 * (x * y - z * w) * s[1],
    (1 - 2 * (x * x + z * z)) * s[1],
    2 * (y * z + x * w) * s[1],
    0,
    2 * (x * z + y * w) * s[2],
    2 * (y * z - x * w) * s[2],
    (1 - 2 * (x * x + y * y)) * s[2],
    0,
    ...t,
    1,
  ];
}
function transformed(box: Box, m: number[]) {
  const out = empty();
  for (let i = 0; i < 8; i++) {
    const p = [0, 1, 2].map((a) => (i & (1 << a) ? box.max[a] : box.min[a]));
    const q = [0, 1, 2].map(
      (a) => m[a] * p[0] + m[4 + a] * p[1] + m[8 + a] * p[2] + m[12 + a],
    );
    check(q.every(Number.isFinite), "chest_glb_transform_overflow");
    add(out, q);
  }
  return out;
}
export function classifyLid(primitiveUnits: number, hasGeometry = true) {
  if (!hasGeometry) return "STRUCTURE_UNVERIFIED";
  return primitiveUnits <= 1
    ? "FUSED_OR_NOT_SEPARATELY_ADDRESSABLE"
    : "POSSIBLE_BUT_UNVERIFIED_LID";
}
export function inspectChestGLB(bytes: Buffer) {
  check(
    bytes.length >= 20 && bytes.length <= c.limits.maxAssetBytes,
    "chest_glb_size",
  );
  check(
    bytes.readUInt32LE(12) <= Number(c.inspection.maxJSONBytes),
    "chest_glb_json_limit",
  );
  const existing = inspectAsset(
    bytes,
    { kind: "glb", role: "object", url: "" },
    c.job,
  );
  const started = Date.now(),
    tick = () =>
      check(
        Date.now() - started < Number(c.inspection.timeoutMs),
        "chest_glb_deadline",
      );
  const jsonSize = bytes.readUInt32LE(12);
  check(jsonSize <= Number(c.inspection.maxJSONBytes), "chest_glb_json_limit");
  const d = object(
    JSON.parse(
      new TextDecoder("utf-8", { fatal: true })
        .decode(bytes.subarray(20, 20 + jsonSize))
        .trim(),
    ),
  );
  const list = (v: unknown) => {
    if (v === undefined) return [];
    check(
      Array.isArray(v) && v.length <= Number(c.inspection.maxArrayEntries),
      "chest_glb_array_limit",
    );
    return v.map(object);
  };
  const meshes = list(d.meshes),
    nodes = list(d.nodes),
    accessors = list(d.accessors),
    views = list(d.bufferViews),
    materials = list(d.materials),
    textures = list(d.textures),
    images = list(d.images),
    scenes = list(d.scenes);
  check(!d.skins || list(d.skins).length === 0, "chest_glb_skin_unsupported");
  check(
    !d.animations || list(d.animations).length === 0,
    "chest_glb_animation_unsupported",
  );
  const binaryStart = 20 + jsonSize + 8,
    binaryBytes = integer(object((d.buffers as unknown[])[0]).byteLength, 1);
  check(
    bytes.length - binaryStart - binaryBytes >= 0 &&
      bytes.length - binaryStart - binaryBytes <= 3,
    "chest_glb_binary_padding",
  );
  const ref = (v: unknown, array: unknown[]) => {
    const i = integer(v);
    check(i < array.length, "chest_glb_reference");
    return i;
  };
  for (const v of views) {
    check(v.buffer === 0, "chest_glb_buffer_reference");
    const at = integer(v.byteOffset ?? 0),
      n = integer(v.byteLength, 1);
    check(at + n <= binaryBytes, "chest_glb_view_bounds");
  }
  const components: Record<number, number> = {
    5120: 1,
    5121: 1,
    5122: 2,
    5123: 2,
    5125: 4,
    5126: 4,
  };
  const arities: Record<string, number> = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
  };
  function accessor(id: unknown) {
    const a = accessors[ref(id, accessors)];
    check(!a.sparse, "chest_glb_sparse_unsupported");
    const v = views[ref(a.bufferView, views)],
      n = integer(a.count, 1),
      component = integer(a.componentType),
      arity = arities[String(a.type)],
      width = components[component];
    check(
      width && arity && n <= Number(c.inspection.maxIndices),
      "chest_glb_accessor_type_count",
    );
    const stride = integer(v.byteStride ?? width * arity, 1),
      offset = integer(a.byteOffset ?? 0),
      viewAt = integer(v.byteOffset ?? 0);
    check(
      stride >= width * arity &&
        stride <= 252 &&
        stride % width === 0 &&
        offset % width === 0 &&
        (viewAt + offset) % width === 0 &&
        offset + (n - 1) * stride + width * arity <= Number(v.byteLength),
      "chest_glb_accessor_bounds",
    );
    return {
      a,
      n,
      component,
      arity,
      at: binaryStart + viewAt + offset,
      stride,
      width,
      range: [
        viewAt + offset,
        viewAt + offset + (n - 1) * stride + width * arity,
      ],
    };
  }
  for (let i = 0; i < accessors.length; i++) accessor(i);
  function number(a: ReturnType<typeof accessor>, row: number, column = 0) {
    const at = a.at + row * a.stride + column * a.width;
    switch (a.component) {
      case 5126:
        return bytes.readFloatLE(at);
      case 5125:
        return bytes.readUInt32LE(at);
      case 5123:
        return bytes.readUInt16LE(at);
      case 5121:
        return bytes[at];
      case 5122:
        return bytes.readInt16LE(at);
      default:
        return bytes.readInt8(at);
    }
  }
  const primitiveReports: Dict[] = [],
    meshBoxes: Box[] = [],
    semanticHints: string[][] = [];
  let totalVertices = 0,
    totalIndices = 0,
    primitives = 0;
  const hint = (value: unknown) => {
    if (typeof value !== "string" || value.length > 256) return null;
    return /\b(lid|cover)\b/i.test(value)
      ? "lid"
      : /\b(body|base|chest)\b/i.test(value)
        ? "body"
        : /\b(hinge|band|iron)\b/i.test(value)
          ? "hinge_or_band"
          : null;
  };
  for (const [meshIndex, mesh] of meshes.entries()) {
    const ps = list(mesh.primitives);
    check(ps.length > 0, "chest_glb_empty_mesh");
    const box = empty();
    semanticHints[meshIndex] = [hint(mesh.name)].filter(
      (x): x is string => !!x,
    );
    for (const [primitiveIndex, p] of ps.entries()) {
      tick();
      check(
        ++primitives <= 4096 &&
          (p.mode === undefined || p.mode === 4) &&
          !p.extensions &&
          !p.targets,
        "chest_glb_primitive_unsupported",
      );
      const attributes = object(p.attributes),
        pos = accessor(attributes.POSITION);
      check(
        pos.component === 5126 && pos.arity === 3 && !pos.a.normalized,
        "chest_glb_position_type",
      );
      totalVertices += pos.n;
      check(
        totalVertices <= Number(c.inspection.maxVertices),
        "chest_glb_vertex_limit",
      );
      for (const id of Object.values(attributes)) {
        const a = accessor(id);
        check(a.n === pos.n, "chest_glb_attribute_count");
      }
      const pb = empty();
      for (let n = 0; n < pos.n; n++) {
        if ((n & 8191) === 0) tick();
        const xyz = [number(pos, n, 0), number(pos, n, 1), number(pos, n, 2)];
        check(xyz.every(Number.isFinite), "chest_glb_nonfinite_positions");
        add(pb, xyz);
      }
      let indices = 0;
      if (p.indices !== undefined) {
        const a = accessor(p.indices);
        check(
          a.arity === 1 &&
            [5121, 5123, 5125].includes(a.component) &&
            !a.a.normalized &&
            a.n % 3 === 0,
          "chest_glb_index_type",
        );
        indices = a.n;
        totalIndices += indices;
        check(
          totalIndices <= Number(c.inspection.maxIndices),
          "chest_glb_index_limit",
        );
        for (let n = 0; n < a.n; n++) {
          if ((n & 8191) === 0) tick();
          check(number(a, n) < pos.n, "chest_glb_index_range");
        }
      } else check(pos.n % 3 === 0, "chest_glb_triangle_count");
      if (p.material !== undefined) ref(p.material, materials);
      combine(box, pb);
      primitiveReports.push({
        mesh: meshIndex,
        primitive: primitiveIndex,
        vertices: pos.n,
        indices,
        indexed: p.indices !== undefined,
        bounds: pb,
        positionAccessor: integer(attributes.POSITION),
        material: p.material ?? null,
        normalAttribute: attributes.NORMAL !== undefined,
        uvAttribute: attributes.TEXCOORD_0 !== undefined,
      });
    }
    meshBoxes.push(box);
  }
  for (const image of images) {
    check(
      !image.uri &&
        ["image/png", "image/jpeg", "image/webp"].includes(
          String(image.mimeType),
        ),
      "chest_glb_image_format",
    );
    ref(image.bufferView, views);
  }
  for (const texture of textures) ref(texture.source, images);
  const textureInfo = (value: unknown) => {
    if (value === undefined) return false;
    ref(object(value).index, textures);
    return true;
  };
  const materialReports = materials.map((m, index) => {
    const pbr =
      m.pbrMetallicRoughness === undefined
        ? null
        : object(m.pbrMetallicRoughness);
    const metallic = pbr?.metallicFactor ?? 1,
      roughness = pbr?.roughnessFactor ?? 1;
    check(
      typeof metallic === "number" &&
        Number.isFinite(metallic) &&
        metallic >= 0 &&
        metallic <= 1 &&
        typeof roughness === "number" &&
        Number.isFinite(roughness) &&
        roughness >= 0 &&
        roughness <= 1,
      "chest_glb_pbr_factors",
    );
    if (pbr?.baseColorFactor !== undefined)
      check(
        vec(pbr.baseColorFactor, 4).every((x) => x >= 0 && x <= 1),
        "chest_glb_color_factor",
      );
    return {
      index,
      pbrMetallicRoughness: !!pbr,
      metallicFactor: metallic,
      roughnessFactor: roughness,
      baseColorTexture: textureInfo(pbr?.baseColorTexture),
      metallicRoughnessTexture: textureInfo(pbr?.metallicRoughnessTexture),
      normalTexture: textureInfo(m.normalTexture),
      occlusionTexture: textureInfo(m.occlusionTexture),
      emissiveTexture: textureInfo(m.emissiveTexture),
    };
  });
  const parents = nodes.map(() => -1),
    children = nodes.map((n) => {
      check(
        n.children === undefined || Array.isArray(n.children),
        "chest_glb_children",
      );
      const a = (n.children ?? []) as unknown[];
      check(a.length <= 4096, "chest_glb_children_limit");
      return a.map((x) => ref(x, nodes));
    });
  children.forEach((cs, parent) =>
    cs.forEach((child) => {
      check(
        child !== parent && parents[child] === -1,
        "chest_glb_cycle_or_multiple_parent",
      );
      parents[child] = parent;
    }),
  );
  const seen = new Set<number>(),
    nodeReports: Dict[] = [];
  const worldBox = empty();
  let geometryNodes = 0;
  function visit(index: number, parentMatrix: number[], depth: number) {
    tick();
    check(depth <= 64 && !seen.has(index), "chest_glb_hierarchy");
    seen.add(index);
    const node = nodes[index];
    check(node.skin === undefined, "chest_glb_skin_unsupported");
    const matrix = multiply(parentMatrix, transform(node));
    let bounds: Box | null = null,
      mesh: number | null = null;
    if (node.mesh !== undefined) {
      mesh = ref(node.mesh, meshes);
      bounds = transformed(meshBoxes[mesh], matrix);
      combine(worldBox, bounds);
      geometryNodes++;
    }
    nodeReports.push({
      index,
      parent: parents[index] === -1 ? null : parents[index],
      children: children[index],
      mesh,
      bounds,
      worldTransform: matrix,
      nameHint: hint(node.name),
      hintNotSemanticProof: true,
    });
    for (const child of children[index]) visit(child, matrix, depth + 1);
  }
  const roots = parents
    .map((p, i) => (p === -1 ? i : -1))
    .filter((i) => i >= 0);
  for (const r of roots) visit(r, identity(), 0);
  check(
    seen.size === nodes.length && geometryNodes > 0,
    "chest_glb_unreachable_geometry",
  );
  for (const scene of scenes) {
    check(Array.isArray(scene.nodes), "chest_glb_scene");
    for (const r of scene.nodes)
      check(parents[ref(r, nodes)] === -1, "chest_glb_scene_root");
  }
  if (d.scene !== undefined) ref(d.scene, scenes);
  const dimensions = worldBox.min.map((n, i) => worldBox.max[i] - n);
  check(dimensions.every(Number.isFinite), "chest_glb_dimension_overflow");
  return {
    ...existing,
    containerValid: true,
    primitiveCount: primitives,
    vertexCount: totalVertices,
    indexCount: totalIndices,
    images: images.length,
    textures: textures.length,
    materials: materials.length,
    pbrMaterials: materialReports,
    embeddedImageMimeTypes: images.map((x) => x.mimeType),
    imagePayloadDecoded: false,
    primitiveReports,
    nodeHierarchy: nodeReports,
    meshNameHints: semanticHints,
    bounds: worldBox,
    dimensions,
    boundsScope:
      "union of all declared node instances; no canonical metric scale verified",
    orientation:
      "stored GLB node transforms applied; up/forward/hinge axes and physical placement UNVERIFIED",
    lidClassification: classifyLid(
      primitiveReports.filter((p) => nodeReports.some((n) => n.mesh === p.mesh))
        .length,
    ),
    candidateParts: nodeReports.filter((x) => x.mesh !== null),
    separateLidVerified: false,
    semanticReview:
      "Distinct mesh/primitive ownership is only a candidate. Names, colors and material boundaries do not prove a lid. No automatic SEPARATELY_ADDRESSABLE_LID claim.",
    visualQuality: "MANUAL_REVIEW_REQUIRED",
    navigationQuality: "UNVERIFIED",
    structuralOnly: true,
  };
}
