import type { LoopContext } from "../foundation-loop/contracts.ts";
import { isPublicEntity } from "./planning.ts";
import { validateProgressionContext } from "./validation.ts";

/** Earned/current public facts only. This is not an owner-definition editor or a future reward catalogue. */
export function projectPublicProgression(context: LoopContext) {
  validateProgressionContext(context);
  const { state } = context;
  return {
    enabled: state.progression === "on",
    version: state.version,
    progress: state.progress
      .filter((row) => isPublicEntity(context, row.entityId))
      .map((row) => {
        const track = state.tracks.find((track) => track.id === row.trackId)!;
        const entity = context.snapshot.entities.find(
          (entity) => entity.id === row.entityId,
        )!;
        return {
          entityId: entity.id,
          entityName: entity.name,
          trackId: track.id,
          trackLabel: track.label,
          kind: track.kind,
          value: row.value,
          rank: row.rank,
          unlocks: [...row.unlocks],
          nextThreshold:
            track.thresholds.find(
              (threshold, index) => threshold > row.value && index >= row.rank,
            ) ?? null,
        };
      }),
    pending: state.pending
      .filter((row) => isPublicEntity(context, row.entityId))
      .map((row) => {
        const track = state.tracks.find((track) => track.id === row.trackId)!;
        const progress = state.progress.find(
          (progress) =>
            progress.entityId === row.entityId &&
            progress.trackId === row.trackId,
        )!;
        const reason =
          state.progression === "off"
            ? "off"
            : row.trackVersion !== track.version
              ? "track_changed"
              : row.rank !== progress.rank + 1
                ? "earlier_choice"
                : null;
        return {
          id: row.id,
          entityId: row.entityId,
          trackId: row.trackId,
          trackVersion: row.trackVersion,
          rank: row.rank,
          options: row.options.map((option) => ({
            id: option.id,
            label: option.label,
            capability: option.capability,
          })),
          selectable: reason === null,
          reason,
        };
      }),
  };
}

export type PublicProgression = ReturnType<typeof projectPublicProgression>;
