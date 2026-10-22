// Fixes before session 3 (the owner's ask after the stage): the painted battle background of a fight's place. A turn
// that starts a fight asks for it after the commit (src/lib/live2d/server/battle-schedule.ts). The background is drawn
// from the place's scene sheet, so a place nobody prepared gets its scene first — the same path as «Подготовить сцену»
// (one picture, the check, the markers, within the pictures' cap) — and the background after the scene's picture is
// done, so it draws on that picture. Pure: the server passes its prepare calls in.

type Schedule = (work: () => Promise<unknown>) => void;
type Prepared = { status: string };

/** A place with a scene sheet → its battle background; a place never prepared → its scene first, then the background;
 * a scene that exists without a usable sheet (an owner's edit, a failed sheet) → nothing (the owner redraws it). */
export type BackgroundPlan = "battle" | "scene_then_battle" | "none";
export function backgroundPlan(scene: { sheet: { features: readonly unknown[] } } | null): BackgroundPlan {
  if (!scene) return "scene_then_battle";
  return scene.sheet.features.length ? "battle" : "none";
}

/** The work a prepare call schedules, run and awaited here: the scene's picture is done before the background starts,
 * and the whole chain stays inside the request's after() (the owner's session reads the records). */
async function awaited<T>(start: (schedule: Schedule) => Promise<T>): Promise<T> {
  const jobs: Promise<unknown>[] = [];
  const result = await start((work) => { jobs.push(work()); });
  await Promise.allSettled(jobs);
  return result;
}

export type BackgroundSteps = { plan: BackgroundPlan; scene: string | null; battle: string | null };
/** One fight's background: the scene when the place has none (stopped by «not visited», the cap or a running draw),
 * then the battle background (which keeps its own rules: one per place and sheet revision, the cap). */
export async function runBattleBackground(deps: {
  scene: () => Promise<{ sheet: { features: readonly unknown[] } } | null>;
  prepareScene: (schedule: Schedule) => Promise<Prepared>;
  prepareBattle: (schedule: Schedule) => Promise<Prepared>;
}): Promise<BackgroundSteps> {
  const plan = backgroundPlan(await deps.scene());
  if (plan === "none") return { plan, scene: null, battle: null };
  let scene: string | null = null;
  if (plan === "scene_then_battle") {
    scene = (await awaited(deps.prepareScene)).status;
    if (scene !== "queued" && scene !== "existing") return { plan, scene, battle: null };
  }
  const battle = (await awaited(deps.prepareBattle)).status;
  return { plan, scene, battle };
}
