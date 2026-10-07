import type { CharacterSheetV1 } from "../adventures/bootstrap-contracts.ts";

/** A reviewed Migration-42 hero must finish the explicit opening handoff before new play. */
export function astraStartupPending(
  rulesetId: string,
  playerSheets: ReadonlyArray<CharacterSheetV1 | null | undefined>,
  takeoverActive: boolean,
  astraEnabled: boolean,
  openingApproved: boolean,
): boolean {
  return rulesetId === "world-logic-v1" &&
    ((!takeoverActive && !openingApproved) || (takeoverActive && !astraEnabled)) &&
    playerSheets.some((sheet) => sheet?.schemaVersion === 1 &&
      (sheet.mode === "structured_rpg" || sheet.mode === "narrative"));
}

export class AstraStartupPendingError extends Error {
  readonly code = "startup_pending";
  constructor() {
    super("The opening and DM setup must finish before the first game action.");
    this.name = "AstraStartupPendingError";
  }
}
