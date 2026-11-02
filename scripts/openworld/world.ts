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
  /** The society module's panels (the worker merges `peopleViews` into the frame): a talk, a trade, pockets, a gift. */
  talk?: { who: string; name: Text; regard: Text; arrest?: boolean; verbs: TalkOption[] }
  trade?: { who: string; name: Text }
  pockets?: { id: string; name: Text }
  gift?: { who: string; name: Text }
  entities: EntitySnap[]
  fx: FxEvent[]
  quests: { journal: JournalQuest[] }
}
export interface TalkOption { id: string; label: Text; group?: string }
export interface UndefinedRecord { id: string; tick: number; status: string; origin: string; request: { summary: string }; event: { kind: string; host?: Ref; roles?: Record<string, Ref | undefined> } }
interface MapData { width: number; height: number; name?: Text; portals: { x: number; y: number; to: string; label?: Text }[] }
interface WorldApi {
  player: Entity
  state: { tick: number; question?: unknown }
  fx: FxEvent[]
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
  talk(who: string, verb: string, choice?: string): void
}
export interface EngineApi {
  world: WorldApi
  controls: ControlsApi
  story: { advance(): void }
  maps: Record<string, { name: Text; width: number; height: number }>
  pendingTransition?: Pos
  modules: { id: string }[]
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
  neededMaps(): string[]
}
interface Compiled { problems: unknown[]; bundle: { ontology: unknown; rules: unknown; terrainChars: Record<string, string> }; index: unknown; chunks: unknown[] }
interface EngineModule {
  Game: { create(index: unknown, ontology: unknown, library: unknown): GameApi; load(save: unknown, index: unknown, ontology: unknown, library: unknown): GameApi }
  RuleLibrary: new (rules: unknown) => unknown
  decodeRawChunk(chunk: unknown, chars: Record<string, string>): unknown
  snapshot(eng: EngineApi, opts?: { panel?: string }): Frame
}
interface FormatModule { compileProject(root: string): Compiled }
interface RawChunk { map: { id: string } }
type PeopleOpen = { talk?: { who: string; arrest?: boolean }; trade?: string; pockets?: string; gift?: string }
type PeopleViews = (eng: EngineApi, open: PeopleOpen) => Pick<Frame, 'talk' | 'trade' | 'pockets' | 'gift'>
/** The Ford's sources (games/openworld): its content, the demo builder `check.ts` uses, the engine's modules. */
interface ContentModule { buildOntology(): unknown; BASE_RULES: unknown[]; STORY_RULES: unknown[]; TERRAIN_CHARS: Record<string, string>; decodeChunk(c: unknown): unknown }
interface FordBuilder { buildFord(): { index: unknown; chunks: RawChunk[]; backdrop?: RawChunk[] } }
interface ModulesModule { peopleViews: PeopleViews }

/** What a game is made from: its world index, ontology, rules, its maps' files (by map id) and how one is decoded. */
interface GameSource {
  index: unknown
  ontology: unknown
  library: unknown
  /** The maps loaded at the start (every one the game ships, as the kernel test and `check.ts` load them). */
  first: RawChunk[]
  /** Every map file at hand, for a map the world needs later (the worker's `ensureMaps`). */
  byId: Map<string, RawChunk>
  decode(c: RawChunk): unknown
  terrainChars: Record<string, string>
  peopleViews?: PeopleViews
}
export const GAMES = ['starter', 'ford'] as const

export const textOf = (t: Text | undefined): string => (t === undefined ? '' : typeof t === 'string' ? t : t.en)

// ------------------------------------------------------------------ the clone

/** The clone's HEAD, checked against the pinned commit (the adapter refuses any other). */
export function cloneCommit(dir = OPENWORLD_DIR): string {
  if (!existsSync(join(dir, 'packages', 'engine', 'src', 'index.ts'))) throw new Error(`no OpenWorld clone at ${dir} (set OPENWORLD_DIR)`)
  const head = execFileSync('git', ['-C', dir, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  if (!head.startsWith(PINNED_COMMIT)) throw new Error(`OpenWorld clone at ${dir} is at ${head}, not the pinned ${PINNED_COMMIT}`)
  return head
}

const imp = async <T>(dir: string, ...path: string[]): Promise<T> => (await import(pathToFileURL(join(dir, ...path)).href)) as unknown as T

/** The starter: its folder compiled in-process (the kernel test's way). */
async function starterSource(dir: string, E: EngineModule): Promise<GameSource> {
  const F = await imp<FormatModule>(dir, 'packages', 'format', 'src', 'node.ts')
  const compiled = F.compileProject(join(dir, 'games', 'starter'))
  if (compiled.problems.length) throw new Error(`the starter does not compile: ${JSON.stringify(compiled.problems)}`)
  const { bundle, index } = compiled
  const first = compiled.chunks as RawChunk[]
  return {
    index,
    ontology: structuredClone(bundle.ontology),
    library: new E.RuleLibrary(bundle.rules),
    first,
    byId: new Map(first.map((c) => [c.map.id, c])),
    decode: (c) => E.decodeRawChunk(c, bundle.terrainChars),
    terrainChars: bundle.terrainChars,
  }
}

/** The Ford: `buildFord()` and the content's ontology and rules, as `games/openworld/tools/src/demo/check.ts` loads it. */
async function fordSource(dir: string, E: EngineModule): Promise<GameSource> {
  const C = await imp<ContentModule>(dir, 'games', 'openworld', 'content', 'src', 'index.ts')
  const M = await imp<ModulesModule>(dir, 'packages', 'modules', 'src', 'index.ts')
  const B = await imp<FordBuilder>(dir, 'games', 'openworld', 'tools', 'src', 'demo', 'world.ts')
  const { index, chunks, backdrop = [] } = B.buildFord()
  return {
    index,
    ontology: C.buildOntology(),
    library: new E.RuleLibrary([...C.BASE_RULES, ...C.STORY_RULES]),
    first: chunks,
    byId: new Map([...backdrop, ...chunks].map((c) => [c.map.id, c])),
    decode: (c) => C.decodeChunk(c),
    terrainChars: C.TERRAIN_CHARS,
    peopleViews: M.peopleViews,
  }
}

// ------------------------------------------------------------------ the world

export interface OpenOptions { dir?: string; game?: string; save?: Record<string, unknown> }

export class OpenWorld {
  /** The open container panel (the worker's `panel`): time stands while it is open. */
  panel?: string
  /** What each key's label last named (the worker's `shownTarget`): a key pressed acts on it while it still reaches it. */
  shown: Partial<Record<Key, Ref>> = {}
  /** The people's panels open (the worker's `talk`, `trade`, `pockets`, `gift`; the society module's): time stands. */
  talk?: { who: string; arrest?: boolean }
  trade?: string
  pockets?: string
  gift?: string
  /** Maps the world asked for that no file at hand has (logged; the worker would make a wilderness). */
  missingMaps = new Set<string>()
  /** Seconds the load took (import, build, new game and its opening). */
  load_s = 0

  private constructor(
    readonly E: EngineModule,
    readonly game: GameApi,
    readonly commit: string,
    readonly gameName: string,
    private readonly source: GameSource,
  ) {}

  get terrainChars(): Record<string, string> {
    return this.source.terrainChars
  }

  get eng(): EngineApi {
    return this.game.engine
  }
  get w(): WorldApi {
    return this.game.engine.world
  }

  /**
   * A game of the clone loaded in-process — `starter` (its folder compiled) or `ford` (`buildFord()`) —, a new game at
   * the game's own start or a save loaded, every map file loaded, the opening ticked to the player's first turn.
   */
  static async open(opts: OpenOptions = {}): Promise<OpenWorld> {
    const t0 = performance.now()
    const dir = opts.dir ?? OPENWORLD_DIR
    const commit = cloneCommit(dir)
    const gameName = opts.game ?? 'starter'
    if (!(GAMES as readonly string[]).includes(gameName)) throw new Error(`--game ${gameName}: one of ${GAMES.join(', ')}`)
    const E = await imp<EngineModule>(dir, 'packages', 'engine', 'src', 'index.ts')
    const src = gameName === 'ford' ? await fordSource(dir, E) : await starterSource(dir, E)
    const game = opts.save ? E.Game.load(structuredClone(opts.save), src.index, src.ontology, src.library) : E.Game.create(src.index, src.ontology, src.library)
    for (const c of src.first) game.loadChunk(src.decode(c))
    game.engine.controls.sync()
    const world = new OpenWorld(E, game, commit, gameName, src)
    if (world.game.mods.provider) throw new Error('a modder provider is set: this stage runs with none')
    if (!opts.save) world.tickUntilReady(START_TICKS)
    world.load_s = (performance.now() - t0) / 1000
    return world
  }

  /** The worker's `ensureMaps`: a map the world needs now (a step through a door, a map put away) loaded from its file. */
  private ensureMaps(): void {
    for (const id of this.game.neededMaps()) {
      const c = this.source.byId.get(id)
      if (c) this.game.loadChunk(this.source.decode(c))
      else this.missingMaps.add(id)
    }
  }

  /** The worker's `peopleOpened`: the people's panels a rule opened, read from the fx before a frame drains them. */
  private peopleOpened(): void {
    for (const x of this.w.fx) {
      if (x.t === 'talk' && typeof x.who === 'string') this.talk = { who: x.who, ...(x.arrest === true && { arrest: true }) }
      const by = typeof x.by === 'string' ? x.by : undefined
      if (x.t === 'panel' && x.panel === 'trade' && by) (this.trade = by), (this.talk = undefined)
      if (x.t === 'panel' && x.panel === 'pockets' && by) this.pockets = by
      if (x.t === 'panel' && x.panel === 'gift' && by) (this.gift = by), (this.talk = undefined)
    }
  }

  /** The society module's views of the panels open (as the worker merges them into its frame; it drains nothing). */
  people(): Pick<Frame, 'talk' | 'trade' | 'pockets' | 'gift'> {
    if (!this.source.peopleViews || !this.eng.modules.some((m) => m.id === 'society')) return {}
    return this.source.peopleViews(this.eng, { talk: this.talk, trade: this.trade, pockets: this.pockets, gift: this.gift })
  }

  /** A people's panel is open (the society module's: a talk, a trade, a person's pockets, a gift). */
  get peoplePanel(): boolean {
    return !!this.talk || !!this.trade || !!this.pockets || !!this.gift
  }

  /** The worker's `closeTalk` (walking away from a guard who stopped one is resisting), and its other panels' closing. */
  closePeople(): void {
    if (this.talk?.arrest) this.eng.controls.talk(this.talk.who, 'resist')
    this.talk = this.trade = this.pockets = this.gift = undefined
  }

  // -------------------------------------------------------------- the time rule

  /**
   * Time is stopped (the worker's `timeStopped`, and the turn's own): a yes/no question open, an act waiting for
   * the world to learn its outcome (`mods.asking`), an open container panel, a talk, a trade, a person's pockets or a
   * gift open (the society module's; the starter has none), a scene waiting for the player's `advance`.
   */
  get stopped(): boolean {
    this.peopleOpened()
    if (this.panel && !this.w.hasStatus({ e: this.panel }, 'open')) this.panel = undefined // closed by the world
    return !!this.w.state.question || !!this.game.mods.asking || !!this.panel || this.peoplePanel || this.w.scene?.waiting === 'advance'
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
      if (this.eng.pendingTransition || this.game.neededMaps().length) this.ensureMaps()
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
      if (this.eng.pendingTransition || this.game.neededMaps().length) this.ensureMaps()
    }
    return this.w.state.tick - start
  }

  /**
   * The frame the worker would send now; it drains `w.fx` (snapshot does, once a frame). With the society module, its
   * people's views as the worker merges them; a panel whose person is gone is closed.
   */
  frame(): Frame {
    this.peopleOpened()
    const frame = this.E.snapshot(this.eng, { panel: this.panel })
    Object.assign(frame, this.people())
    if (this.talk && !frame.talk) this.talk = undefined
    if (this.trade && !frame.trade) this.trade = undefined
    if (this.pockets && !frame.pockets) this.pockets = undefined
    if (this.gift && !frame.gift) this.gift = undefined
    return frame
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
