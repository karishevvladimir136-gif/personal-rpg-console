// The snapshot payload from what the app's route returns (owner's replay fix 2, 2026-10-18): the
// route GET /api/campaigns/<id>/snapshots?operationId=… answers with the summary and the DECODED
// `payload` (src/lib/gameplay/turn-snapshot.ts readTurnSnapshotWith), while the SQL function
// answers with `encoding` and `source`; polish 3's tool expected the SQL's shape from the route
// and failed. Both shapes are accepted here, and a file of snapshots may carry either.
import { decodeTurnSnapshot, parseTurnSnapshotPayload } from "../../../../src/lib/gameplay/turn-snapshot.ts";

export function snapshotPayloadOf(row) {
  if (!row || typeof row !== "object") throw new Error("not a snapshot response");
  if (row.payload && typeof row.payload === "object") return parseTurnSnapshotPayload(row.payload);
  if (row.encoding === "json") return parseTurnSnapshotPayload(row.source);
  if (row.encoding === "gzip-base64" && typeof row.source === "string") return decodeTurnSnapshot(row.source);
  if (row.schemaVersion === 1 && row.input && row.source) return parseTurnSnapshotPayload(row);
  throw new Error("a snapshot response without a payload, an encoding or a source");
}

/** The list's rows from the route's answer ({campaignId, keep, snapshots}) or a bare array. */
export function snapshotListOf(value) {
  const rows = Array.isArray(value) ? value : value?.snapshots;
  if (!Array.isArray(rows)) throw new Error("not a snapshot list");
  return rows;
}
