import { isIP } from "node:net";
import {
  assetUrl,
  hash,
  object,
  safeFailureReason,
  type Dict,
} from "./protocol.ts";
import { diagnostic as c } from "./fal-host-diagnostic-state.ts";
const extensions = new Set([
  "glb",
  "gltf",
  "drc",
  "spz",
  "zip",
  "gz",
  "ply",
  "obj",
  "splat",
  "bin",
]);
// Only coarse static path vocabulary is publishable; other paths are represented by a digest.
const publicPath =
  /^\/(?:files\/|outputs\/|synthetic\/){0,3}(?:world|model|artifact|output)\.(?:glb|gltf|drc|spz|zip|gz|ply|obj|splat|bin)$/;
export function sanitizeWorldFile(value: unknown): Dict {
  const d = object(value),
    s = typeof d.url === "string" ? d.url : null;
  const ext =
    typeof d.file_name === "string" && d.file_name.length <= 256
      ? d.file_name.match(/\.([a-zA-Z0-9]{1,8})$/)?.[1].toLowerCase()
      : undefined;
  const metadata: Dict = {
    urlSHA256: s === null ? null : hash(s),
    scheme: null,
    hostname: null,
    hostnameSHA256: null,
    pathname: null,
    pathSHA256: null,
    queryPresent: s === null ? null : s.split("#", 1)[0].includes("?"),
    fragmentPresent: s === null ? null : s.includes("#"),
    credentialsPresent: null,
    explicitPortPresent: null,
    contentType:
      typeof d.content_type === "string" &&
      d.content_type.length <= c.limits.maxMIMEChars &&
      /^[a-z][a-z0-9.+-]{0,45}\/[a-z][a-z0-9.+-]{0,45}$/.test(d.content_type)
        ? d.content_type
        : null,
    fileExtension: ext && extensions.has(ext) ? ext : null,
    fileSize:
      Number.isSafeInteger(d.file_size) &&
      Number(d.file_size) >= 0 &&
      Number(d.file_size) <= c.limits.maxReportedFileBytes
        ? d.file_size
        : null,
  };
  if (s === null || s.length > c.limits.maxURLChars) return metadata;
  const authority = s.match(/^[a-z][a-z0-9+.-]*:\/\/([^/?#]*)/i)?.[1];
  if (authority !== undefined) {
    metadata.credentialsPresent = authority.includes("@");
    const hostport = authority.split("@").at(-1)!;
    metadata.explicitPortPresent =
      /\]:[0-9]*$/.test(hostport) ||
      (!hostport.startsWith("[") && hostport.includes(":"));
  }
  try {
    const u = new URL(s),
      h = u.hostname;
    metadata.scheme =
      u.protocol === "https:"
        ? "https"
        : u.protocol === "http:"
          ? "http"
          : "other";
    const safeHost =
      h.length > 0 &&
      h.length <= c.limits.maxHostnameChars &&
      (/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/.test(
        h,
      ) ||
        isIP(h.replace(/^\[|\]$/g, "")) !== 0);
    metadata.hostname = safeHost ? h : null;
    metadata.hostnameSHA256 = hash(h);
    metadata.pathSHA256 = hash(u.pathname);
    if (
      u.pathname.length <= c.limits.maxRetainedPathChars &&
      publicPath.test(u.pathname)
    )
      metadata.pathname = u.pathname;
    metadata.credentialsPresent =
      metadata.credentialsPresent === true || !!(u.username || u.password);
  } catch {} // No parser errors or raw URL strings may enter evidence.
  return metadata;
}
export function classifyWorldFile(url: unknown, metadata: Dict) {
  const bad = "clearly_unapproved_or_unsafe_host";
  if (
    metadata.scheme !== "https" ||
    metadata.credentialsPresent !== false ||
    metadata.explicitPortPresent !== false ||
    metadata.fragmentPresent !== false ||
    typeof metadata.hostname !== "string"
  )
    return { classification: bad, reason: "unsafe_asset_url" };
  const h = metadata.hostname;
  if (
    isIP(h.replace(/^\[|\]$/g, "")) ||
    h === "localhost" ||
    h.endsWith(".localhost") ||
    h.endsWith(".local")
  )
    return { classification: bad, reason: "non_public_or_unapproved_host" };
  // Invoked only AFTER sanitized descriptor metadata has been durably appended. No download authority is issued.
  try {
    assetUrl(url, "fal");
    return {
      classification: "currently_allowed_host",
      reason: "existing_policy_matches",
    };
  } catch (error) {
    if (safeFailureReason(error) !== "asset_host_not_allowed")
      return { classification: bad, reason: "unsafe_asset_url" };
    const related =
      h === "fal.media" ||
      h.endsWith(".fal.media") ||
      h === "fal.run" ||
      h.endsWith(".fal.run");
    return {
      classification: related
        ? "new_same_provider_looking_host_requires_review"
        : bad,
      reason: related
        ? "hostname_family_only_not_authorization"
        : "host_not_approved",
    };
  }
}
