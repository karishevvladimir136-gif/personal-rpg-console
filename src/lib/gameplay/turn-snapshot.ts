// Polish 3 §4: the state snapshot of a committed turn — the runtime source the turn started
// from (the public snapshot, the runtime state, the private DM state, the pinned craft and
// voice; never the retrieved memory rows, which the replay rebuilds or does without) and the
// player's literal input, gzip-compressed and base64-encoded. Compact, private, owner-only:
// never shown to the DM or the player; the real-replay tool restores it into an isolated copy.
import { gunzipSync, gzipSync } from "node:zlib";
import type { TurnInput } from "./contracts.ts";
import type { RuntimeSource } from "./server-contracts.ts";
import type { DmLoopTurnLimits } from "./dm-loop/limits.ts";
import type { DepthRange } from "./dm-loop/depth.ts";
import type { DmSplit } from "./dm-loop/settings.ts";
import type { ModelSelection } from "../production/contracts.ts";

/** The campaign's DM settings at the turn (the per-turn limits, the depth range, the split and the
 * single loop's model), so a replay plays the owner's own turn under the same rules. */
export type TurnSnapshotSettings = { limits: DmLoopTurnLimits; depth: DepthRange | null; split: DmSplit | null; dmTurn: ModelSelection | null };
export type TurnSnapshotPayload = { schemaVersion: 1; input: TurnInput; source: RuntimeSource; takenAt: string; settings?: TurnSnapshotSettings };

/** The parts of a runtime source a replay needs: everything but the retrieved memory. */
export function snapshotSource(source: RuntimeSource): RuntimeSource {
  const { memory: _memory, ...rest } = source;
  void _memory;
  return structuredClone(rest) as RuntimeSource;
}

export function encodeTurnSnapshot(input: TurnInput, source: RuntimeSource, settings?: TurnSnapshotSettings, takenAt = new Date().toISOString()): { source: string; bytes: number } {
  const payload: TurnSnapshotPayload = { schemaVersion: 1, input, source: snapshotSource(source), takenAt, ...(settings ? { settings } : {}) };
  const json = JSON.stringify(payload);
  const packed = gzipSync(Buffer.from(json, "utf8"), { level: 9 });
  return { source: packed.toString("base64"), bytes: Buffer.byteLength(json, "utf8") };
}

export function decodeTurnSnapshot(encoded: string): TurnSnapshotPayload {
  const json = gunzipSync(Buffer.from(encoded, "base64")).toString("utf8");
  const payload = JSON.parse(json) as TurnSnapshotPayload;
  if (!payload || payload.schemaVersion !== 1 || !payload.input || !payload.source) throw new Error("not a turn snapshot");
  return payload;
}

export type TurnSnapshotRpc = (args: { p_owner_id: string; p_campaign_id: string; p_action: "save" | "list" | "read" | "prune"; p_payload: unknown }) =>
  Promise<{ data: unknown; error?: { message?: string } | null }>;

/** `stored`: a compressed snapshot row, or the committed turn's own claim-time source (turns from before migration 68). */
export type TurnSnapshotSummary = { operationId: string; turnNo: number; input: string; bytes: number; createdAt: string; stored: "snapshot" | "turn" };
export type TurnSnapshotList = { campaignId: string; keep: number | null; snapshots: TurnSnapshotSummary[] };

function failure(message: string | undefined): Error {
  const text = message ?? "";
  const code = text.includes("rpg_not_found") ? "not_found" : text.includes("rpg_validation") ? "validation" : text.includes("rpg_forbidden") ? "forbidden" : "unavailable";
  return Object.assign(new Error(code), { code });
}

/** Saves the snapshot of a committed turn (idempotent per operation; prunes by the campaign's setting). */
export async function saveTurnSnapshotWith(rpc: TurnSnapshotRpc, ownerId: string, campaignId: string, input: TurnInput, source: RuntimeSource,
  settings?: TurnSnapshotSettings): Promise<{ saved: boolean; turnNo: number | null; pruned: number }> {
  const encoded = encodeTurnSnapshot(input, source, settings);
  const response = await rpc({ p_owner_id: ownerId, p_campaign_id: campaignId, p_action: "save",
    p_payload: { operationId: input.operationId, source: encoded.source, bytes: encoded.bytes } });
  if (response.error) throw failure(response.error.message);
  return response.data as { saved: boolean; turnNo: number | null; pruned: number };
}

export async function listTurnSnapshotsWith(rpc: TurnSnapshotRpc, ownerId: string, campaignId: string): Promise<TurnSnapshotList> {
  const response = await rpc({ p_owner_id: ownerId, p_campaign_id: campaignId, p_action: "list", p_payload: {} });
  if (response.error) throw failure(response.error.message);
  return response.data as TurnSnapshotList;
}

export async function readTurnSnapshotWith(rpc: TurnSnapshotRpc, ownerId: string, campaignId: string, which: { operationId: string } | { turnNo: number }):
  Promise<TurnSnapshotSummary & { payload: TurnSnapshotPayload }> {
  const response = await rpc({ p_owner_id: ownerId, p_campaign_id: campaignId, p_action: "read", p_payload: which });
  if (response.error) throw failure(response.error.message);
  const row = response.data as TurnSnapshotSummary & { encoding: "gzip-base64" | "json"; source: string | TurnSnapshotPayload };
  const payload = row.encoding === "json" ? parseTurnSnapshotPayload(row.source) : decodeTurnSnapshot(row.source as string);
  return { operationId: row.operationId, turnNo: row.turnNo, input: row.input, bytes: row.bytes, createdAt: row.createdAt, stored: row.stored, payload };
}

/** A payload object as the turn row keeps it (the claim-time source, uncompressed). */
export function parseTurnSnapshotPayload(value: unknown): TurnSnapshotPayload {
  const payload = (typeof value === "string" ? JSON.parse(value) : value) as TurnSnapshotPayload;
  if (!payload || payload.schemaVersion !== 1 || !payload.input || !payload.source) throw new Error("not a turn snapshot");
  return { ...payload, source: snapshotSource(payload.source) };
}
