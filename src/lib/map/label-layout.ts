// Pin-label collision handling for the atlas (presentation only). Labels are
// placed in priority order: the current place first, then the destination, the
// selected pin, visited and known places. A label goes below its mark when the
// space is free, above it otherwise, and is hidden (until hover or tap) when
// both spots are taken. The current place is always placed, so always visible.
export type LabelBox = { w: number; h: number };
export type MarkBox = { x: number; y: number; w: number; h: number };
export type LabelPin = { id: string; mark: MarkBox; label: LabelBox; priority: number };
export type LabelPlacement = "below" | "above" | "hidden";

const GAP = 2;
const MARGIN = 2;

function overlaps(a: MarkBox, b: MarkBox) {
  return a.x < b.x + b.w + MARGIN && a.x + a.w + MARGIN > b.x && a.y < b.y + b.h + MARGIN && a.y + a.h + MARGIN > b.y;
}

export function placePinLabels(pins: LabelPin[]): Record<string, LabelPlacement> {
  const ordered = [...pins].sort((a, b) => a.priority - b.priority || a.mark.y - b.mark.y || a.mark.x - b.mark.x);
  const taken: MarkBox[] = ordered.map((pin) => pin.mark);
  const result: Record<string, LabelPlacement> = {};
  for (const pin of ordered) {
    const centre = pin.mark.x + pin.mark.w / 2;
    const below: MarkBox = { x: centre - pin.label.w / 2, y: pin.mark.y + pin.mark.h + GAP, w: pin.label.w, h: pin.label.h };
    const above: MarkBox = { ...below, y: pin.mark.y - GAP - pin.label.h };
    const free = (box: MarkBox) => !taken.some((other) => other !== pin.mark && overlaps(box, other));
    const placement: LabelPlacement = pin.priority === 0 || free(below) ? "below" : free(above) ? "above" : "hidden";
    result[pin.id] = placement;
    if (placement !== "hidden") taken.push(placement === "below" ? below : above);
  }
  return result;
}

export function sameLayout(a: Record<string, LabelPlacement>, b: Record<string, LabelPlacement>) {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((key) => a[key] === b[key]);
}
