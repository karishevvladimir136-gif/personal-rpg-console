// OPEN_WORLD_ADAPTER_1 — an OpenWorld game loaded headless from the pinned clone, and the worker's time rule.
//
// The clone lives beside this repository (OPENWORLD_DIR, default ../openworld) at commit 19629aa and is never
// modified; it is imported by path. Nothing here uses the author's hand (`eng.author`, `teleport`): the world is
// moved only by the player's own inputs and by `eng.tick()`, as the browser worker moves it.

import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const PINNED_COMMIT = '19629aa'
export const TICKS_PER_MINUTE = 10
/** The most ticks one turn may take while the player cannot act (two game hours); beyond it the turn ends anyway. */
export const MAX_TURN_TICKS = 1200
/** A new game runs this many ticks (one game minute) before the first observation, unless time stops first. */
export const START_TICKS = 10

export const OPENWORLD_DIR = resolve(process.env.OPENWORLD_DIR ?? join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..', 'openworld'))

// ------------------------------------------------------------------ the engine's surface, as far as the adapter uses it

export type Text = string | { en: string; zh?: string }
export type Dir = 'up' | 'down' | 'left' | 'right'
export type Key = 'primary' | 'hands' | 'take' | 'put' | 'use' | 'self'
export interface Ref { e: string }
export interface Pos { map: string; x: number; y: number; z?: number }
export interface FxEvent { t: string; [k: string]: unknown }
export interface Entity {
  id: string
  type: string
  name?: Text
  facing?: Dir
  held?: string
  contents?: string[]
  place: { on: string; map?: string; x?: number; y?: number; holder?: string }
}
export interface Plan { key: string; label: Text; target: Ref; at: Pos; unknown?: boolean; confirm?: Text; panel?: string }
export interface ItemInfo { id: string; type: string; name: Text }
export interface EntitySnap { id: string; type: string; x: number; y: number; name: Text; hp?: number; maxHp?: number; hostile?: boolean; open?: boolean; statuses: string[] }
export interface JournalQuest {
  id: string
  quest: string
  title: Text
  state: string
  objectives: { id: string; text: Text; state: string; have?: number; need?: number }[]
  log: { stage: number; text: Text; tick: number }[]
}
export interface Frame {
  tick: number
  calendar: { day: number; hour: number; minute: number; weather: string }
  map: string
  scene?: { id: string; waiting?: string; line?: { who?: string; text?: Text } }
  question?: { text: Text }
  player: {
    x: number
    y: number
    facing: Dir
    hp: number
    maxHp: number
    statuses: string[]
    held?: ItemInfo
    worn: Record<string, ItemInfo>
    purse: number
    selected: number
    slots: ({ item: ItemInfo; count: number } | null)[]
  }
  container?: { id: string; name: Text; contents: ItemInfo[] }
  entities: EntitySnap[]
  fx: FxEvent[]
  quests: { journal: JournalQuest[] }
}
export interface UndefinedRecord { id: string; tick: number; status: string; origin: string; request: { summary: string } }
interface MapData { width: number; height: number; name?: Text; portals: { x: number; y: number; to: string; label?: Text }[] }
interface WorldApi {
  player: Entity
  state: { tick: number; question?: unknown }
  scene?: { id: string; waiting?: string }
  posOf(e: Entity): Pos | undefined
  front(e: Entity, dir?: Dir): Pos | undefined
  terrainAt(map: string, x: number, y: number): string
  cellTop(map: string, x: number, y: number, z?: number): Entity | undefined
  walkable(map: string, x: number, y: number, ignore?: string): boolean
  get(id: string | undefined): Entity | undefined
  hasStatus(ref: Ref, status: string): boolean
  map(id: string): MapData | undefined
  onto: { resolve(type: string): { name?: Text } }
}
interface ControlsApi {
  planFor(key: Key, aim: undefined, layer?: number, shown?: Ref): Plan | undefined
  swing(plan: Plan): { panel?: string }
  run(plan: Plan): { panel?: string }
  answer(yes: boolean): void
  select(slot: number): void
  face(at: Pos): void
  transfer(container: string, from: 'chest' | 'bag', item: string, all: boolean): void
  asksBeforeTransfer(container: string, from: 'chest' | 'bag', item: string, all: boolean, go: () => void): boolean
  sync(): void
}
export interface EngineApi {
  world: WorldApi
  controls: ControlsApi
  story: { advance(): void }
  maps: Record<string, { name: Text; width: number; height: number }>
  pendingTransition?: Pos
  tick(): void
  movePlayer(dir: Dir): boolean
  passTime(ticks: number): void
  busy(e: Entity): boolean
  ready(id: string): boolean
  interact(verb: 'interact', actor: string, target: Ref, opts: { instrument: null }): unknown
}
export interface GameApi {
  engine: EngineApi
  mods: { records: UndefinedRecord[]; asking?: UndefinedRecord; provider?: unknown }
  save(): Record<string, unknown>
  loadChunk(chunk: unknown): void
}
interface Compiled { problems: unknown[]; bundle: { ontology: unknown; rules: unknown; terrainChars: Record<string, string> }; index: unknown; chunks: unknown[] }
interface EngineModule {
  Game: { create(index: unknown, ontology: unknown, library: unknown): GameApi; load(save: unknown, index: unknown, ontology: unknown, library: unknown): GameApi }
  RuleLibrary: new (rules: unknown) => unknown
  decodeRawChunk(chunk: unknown, chars: Record<string, string>): unknown
  snapshot(eng: EngineApi, opts?: { panel?: string }): Frame
}
interface FormatModule { compileProject(root: string): Compiled }

export const textOf = (t: Text | undefined): string => (t === undefined ? '' : typeof t === 'string' ? t : t.en)

// ------------------------------------------------------------------ the clone

/** The clone's HEAD, checked against the pinned commit (the adapter refuses any other). */
export function cloneCommit(dir = OPENWORLD_DIR): string {
  if (!existsSync(join(dir, 'packages', 'engine', 'src', 'index.ts'))) throw new Error(`no OpenWorld clone at ${dir} (set OPENWORLD_DIR)`)
  const head = execFileSync('git', ['-C', dir, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  if (!head.startsWith(PINNED_COMMIT)) throw new Error(`OpenWorld clone at ${dir} is at ${head}, not the pinned ${PINNED_COMMIT}`)
  return head
}

let modules: { E: EngineModule; F: FormatModule } | undefined
async function load(dir: string): Promise<{ E: EngineModule; F: FormatModule }> {
  if (!modules) {
    const E = (await import(pathToFileURL(join(dir, 'packages', 'engine', 'src', 'index.ts')).href)) as unknown as EngineModule
    const F = (await import(pathToFileURL(join(dir, 'packages', 'format', 'src', 'node.ts')).href)) as unknown as FormatModule
    modules = { E, F }
  }
  return modules
}

// ------------------------------------------------------------------ the world

export interface OpenOptions { dir?: string; game?: string; save?: Record<string, unknown> }

export class OpenWorld {
  /** The open container panel (the worker's `panel`): time stands while it is open. */
  panel?: string
  /** What each key's label last named (the worker's `shownTarget`): a key pressed acts on it while it still reaches it. */
  shown: Partial<Record<Key, Ref>> = {}

  private constructor(
    readonly E: EngineModule,
    readonly game: GameApi,
    readonly commit: string,
    readonly gameName: string,
    readonly terrainChars: Record<string, string>,
  ) {}

  get eng(): EngineApi {
    return this.game.engine
  }
  get w(): WorldApi {
    return this.game.engine.world
  }

  /** A game folder of the clone compiled in-process (`games/<game>`), a new game or a save loaded, the opening ticked to the player's first turn. */
  static async open(opts: OpenOptions = {}): Promise<OpenWorld> {
    const dir = opts.dir ?? OPENWORLD_DIR
    const commit = cloneCommit(dir)
    const gameName = opts.game ?? 'starter'
    if (gameName !== 'starter') throw new Error(`--game ${gameName}: only the starter is wired in this stage (the Ford is amendment A4)`)
    const { E, F } = await load(dir)
    const compiled = F.compileProject(join(dir, 'games', gameName))
    if (compiled.problems.length) throw new Error(`the ${gameName} does not compile: ${JSON.stringify(compiled.problems)}`)
    const { bundle, index } = compiled
    const library = new E.RuleLibrary(bundle.rules)
    const game = opts.save
      ? E.Game.load(structuredClone(opts.save), index, structuredClone(bundle.ontology), library)
      : E.Game.create(index, structuredClone(bundle.ontology), library)
    // every map's file, as the kernel test loads them (the worker fetches them as they are needed)
    for (const c of compiled.chunks) game.loadChunk(E.decodeRawChunk(c, bundle.terrainChars))
    game.engine.controls.sync()
    const world = new OpenWorld(E, game, commit, gameName, bundle.terrainChars)
    if (world.game.mods.provider) throw new Error('a modder provider is set: Phase A runs with none')
    if (!opts.save) world.tickUntilReady(START_TICKS)
    return world
  }

  // -------------------------------------------------------------- the time rule

  /**
   * Time is stopped (the worker's `timeStopped`, and the turn's own): a yes/no question open, an act waiting for
   * the world to learn its outcome (`mods.asking`), an open container panel, a scene waiting for the player's
   * `advance`. (The worker's talk, trade, pockets and gift panels are the society module's; the starter has none.)
   */
  get stopped(): boolean {
    if (this.panel && !this.w.hasStatus({ e: this.panel }, 'open')) this.panel = undefined // closed by the world
    return !!this.w.state.question || !!this.game.mods.asking || !!this.panel || this.w.scene?.waiting === 'advance'
  }

  /** The player can act: no scene, not busy, their step and their swing both ready, no map transition pending. */
  get free(): boolean {
    const p = this.w.player
    return !this.w.scene && !this.eng.busy(p) && this.eng.ready(p.id) && this.eng.ready('atk:' + p.id) && !this.eng.pendingTransition
  }

  /** Tick (at least `min` ticks unless time stops first) until time stops or the player is free. The world ticks that passed. */
  tickUntilReady(min = 1, max = MAX_TURN_TICKS): number {
    const start = this.w.state.tick
    let n = 0
    while (n < max) {
      if (this.stopped) break
      if (n >= min && this.free) break
      this.eng.tick()
      n++
    }
    // (a long step, `passTime`, runs its ticks inside one call: the world's clock says how many passed)
    return this.w.state.tick - start
  }

  /** Tick until the player's step is ready (a step's cooldown), unless time stops. */
  tickUntilStepReady(max = MAX_TURN_TICKS): number {
    const start = this.w.state.tick
    let n = 0
    const p = this.w.player
    while (n < max && !this.stopped && (!this.eng.ready(p.id) || this.eng.busy(p) || this.eng.pendingTransition)) {
      this.eng.tick()
      n++
    }
    return this.w.state.tick - start
  }

  /** The frame the worker would send now; it drains `w.fx` (snapshot does, once a frame). */
  frame(): Frame {
    return this.E.snapshot(this.eng, { panel: this.panel })
  }

  /** The worker's `closePanel`: a container still open is closed by the hand that opened it. */
  closePanel(): void {
    const panel = this.panel
    if (panel && this.w.hasStatus({ e: panel }, 'open')) this.eng.interact('interact', this.w.player.id, { e: panel }, { instrument: null })
    this.panel = undefined
  }

  get records(): UndefinedRecord[] {
    return this.game.mods.records
  }

  save(): Record<string, unknown> {
    return this.game.save()
  }

  /** The player's place now. */
  pos(): Pos {
    return this.w.posOf(this.w.player) ?? { map: '?', x: -1, y: -1 }
  }
}
