// Travel on the region map as presentation: when a committed turn moved the party
// (move_party), the marker glides from the old place to the new one in step with
// the turn's time; an interrupting turn retargets the glide from where it is. The
// records never wait for the animation; the party's position is the public state.
export type TravelPoint = { x: number; y: number };
export type Travel = {
  fromId: string;
  toId: string;
  from: TravelPoint;
  to: TravelPoint;
  startedAt: number;
  durationMs: number;
};

/** The glide's length from the turn's travel time: 1.2 s plus 25 ms per minute, at most 9 s. */
export function travelDurationMs(minutes: number | null): number {
  const m = minutes !== null && Number.isFinite(minutes) ? Math.max(0, minutes) : 60;
  return Math.min(9000, Math.round(1200 + m * 25));
}

/** The travel minutes of a committed turn's receipts, from the public chip
 * («Переход: Нашкель (2 часа 30 минут)», «Travel: Nashkel (40 minutes)»). Null when no travel. */
export function travelMinutesOf(changes: { name?: string; tool?: string; summary: string }[]): number | null {
  const travel = [...changes].reverse().find((row) => (row.name ?? row.tool) === "move_party" || /^(Переход|Travel): /.test(row.summary));
  if (!travel) return null;
  const text = travel.summary;
  const number = (pattern: RegExp) => { const match = pattern.exec(text); return match ? Number(match[1]) : 0; };
  // `\b` knows ASCII letters only: the Russian words end with a lookahead for a non-letter.
  const days = number(/(\d+)\s*(?:день|дня|дней|day|days)(?!\p{L})/u);
  const hours = /(?<!\p{L})час(?!\p{L})/u.test(text) && !/(\d+)\s*(?:час|часа|часов)(?!\p{L})/u.test(text) ? 1 : number(/(\d+)\s*(?:час|часа|часов|hour|hours)(?!\p{L})/u);
  const minutes = number(/(\d+)\s*(?:минута|минуты|минут|minute|minutes)(?!\p{L})/u);
  const total = days * 1440 + hours * 60 + minutes;
  return total > 0 ? total : null;
}

/** Position along the route at a moment: eased, never beyond the destination. */
export function travelProgress(travel: Travel, now: number): number {
  if (travel.durationMs <= 0) return 1;
  const t = Math.min(1, Math.max(0, (now - travel.startedAt) / travel.durationMs));
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
export function travelPoint(travel: Travel, now: number): TravelPoint {
  const t = travelProgress(travel, now);
  return { x: travel.from.x + (travel.to.x - travel.from.x) * t, y: travel.from.y + (travel.to.y - travel.from.y) * t };
}

/** A new travel starts from the previous place, or — when a glide is still running (an interrupting
 * turn: «стоп, свернём туда») — from the marker's current point, towards the new place. */
export function startTravel(previous: Travel | null, input: { fromId: string; toId: string; from: TravelPoint; to: TravelPoint; minutes: number | null; now: number }): Travel {
  const running = previous && travelProgress(previous, input.now) < 1;
  return {
    fromId: running ? previous.fromId : input.fromId,
    toId: input.toId,
    from: running ? travelPoint(previous, input.now) : input.from,
    to: input.to,
    startedAt: input.now,
    durationMs: travelDurationMs(input.minutes),
  };
}

/** The route drawn on the map: a straight line with a gentle bend so a road reads as a road. */
export function routePath(from: TravelPoint, to: TravelPoint): string {
  const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
  const dx = to.x - from.x, dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const bend = Math.min(0.06, length * 0.12);
  const cx = mx - (dy / length) * bend, cy = my + (dx / length) * bend;
  const f = (v: number) => (v * 100).toFixed(2);
  return `M ${f(from.x)} ${f(from.y)} Q ${f(cx)} ${f(cy)} ${f(to.x)} ${f(to.y)}`;
}
