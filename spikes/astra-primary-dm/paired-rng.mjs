import { createHash } from "node:crypto";

export const pairedRollScheduleVersion = "stage2-paired-v1";
const checkKinds = new Set(["skill", "attack", "save"]);

/** Shared raw dice by turn + tool kind + occurrence, independent of blind arm or operation ID. */
export function pairedToolRandom({ turnNumber, call, checkpointTools }) {
  if (!Number.isInteger(turnNumber) || turnNumber < 1 || turnNumber > 14 ||
    !call || typeof call.kind !== "string" || !Array.isArray(checkpointTools))
    throw Error("invalid paired roll source");
  const kind = call.kind;
  const occurrence = checkpointTools.filter((row) => row.call.kind === kind).length;
  const firstCheck = checkpointTools.every((row) => !checkKinds.has(row.call.kind));
  let dieIndex = 0;
  return (min, max) => {
    if (!Number.isInteger(min) || !Number.isInteger(max) || min < 1 || max <= min || max > 101)
      throw Error("invalid paired die range");
    const index = dieIndex++;
    if (turnNumber === 2 && firstCheck && checkKinds.has(kind) && index === 0 && min === 1 && max === 21)
      return 1; // mandatory fixed low-roll probe, only if the DM requested a check
    const key = `${pairedRollScheduleVersion}:${turnNumber}:${kind}:${occurrence}:${index}:${min}:${max}`;
    const raw = createHash("sha256").update(key).digest().readUInt32BE(0);
    return min + raw % (max - min);
  };
}
