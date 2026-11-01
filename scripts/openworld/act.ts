// OPEN_WORLD_ADAPTER_1 — the action grammar (one line a turn, parsed strictly) and its execution, each verb through
// the same engine calls the browser worker makes for the same input (packages/runtime/src/worker.ts).

import { DELTA } from './observe.ts'
import { TICKS_PER_MINUTE, type Dir, type Key, type OpenWorld } from './world.ts'

export type Action =
  | { verb: 'move'; dir: Dir; n: number }
  | { verb: 'face'; dir: Dir }
  | { verb: Key }
  | { verb: 'select'; slot: number }
  | { verb: 'answer'; yes: boolean }
  | { verb: 'advance' }
  | { verb: 'wait'; minutes: number }
  | { verb: 'look' }
  | { verb: 'done' }

export type Parsed = { ok: true; action: Action } | { ok: false; error: string }

const DIR = '(up|down|left|right)'
const FORMS: [RegExp, (m: RegExpMatchArray) => Action | undefined][] = [
  [new RegExp(`^move ${DIR}(?: ([1-9]|10))?$`), (m) => ({ verb: 'move', dir: m[1] as Dir, n: m[2] ? Number(m[2]) : 1 })],
  [new RegExp(`^face ${DIR}$`), (m) => ({ verb: 'face', dir: m[1] as Dir })],
  [/^(primary|hands|take|put|use|self)$/, (m) => ({ verb: m[1] as Key })],
  [/^select ([0-9])$/, (m) => ({ verb: 'select', slot: Number(m[1]) })],
  [/^answer (yes|no)$/, (m) => ({ verb: 'answer', yes: m[1] === 'yes' })],
  [/^advance$/, () => ({ verb: 'advance' })],
  [/^wait ([1-9][0-9]{0,2})$/, (m) => (Number(m[1]) <= 120 ? { verb: 'wait', minutes: Number(m[1]) } : undefined)],
  [/^look$/, () => ({ verb: 'look' })],
  [/^done$/, () => ({ verb: 'done' })],
]

/** One line, strictly: the grammar's forms exactly (lower case, single spaces); the line's own ends trimmed, nothing else. */
export function parse(line: string): Parsed {
  const s = line.trim()
  for (const [re, make] of FORMS) {
    const m = s.match(re)
    if (m) {
      const action = make(m)
      if (action) return { ok: true, action }
    }
  }
  return { ok: false, error: `not in the grammar: ${JSON.stringify(s)}` }
}

export interface Executed {
  /** World ticks the turn took. */
  ticks: number
  /** Steps taken (move). */
  steps?: number
  /** The worker would have ignored this input now (time stopped, the player busy, nothing at the key). */
  ignored?: string
  done?: boolean
}

/** Execute one parsed action: the input as the worker takes it, then the world ticked to the player's next turn. */
export function execute(world: OpenWorld, action: Action): Executed {
  const eng = world.eng
  const w = world.w
  const c = eng.controls
  const p = w.player
  const settle = (r: Omit<Executed, 'ticks'> = {}, before = 0): Executed => ({ ...r, ticks: before + world.tickUntilReady(1) })
  switch (action.verb) {
    case 'look':
      return { ticks: 0 }
    case 'done':
      return { ticks: 0, done: true }
    case 'move': {
      // the worker: no step while a panel or a question is open; a step waits for the last one's pace
      if (world.panel || w.state.question) return settle({ steps: 0, ignored: 'time is stopped' })
      let ticks = 0
      let steps = 0
      for (let i = 0; i < action.n; i++) {
        ticks += world.tickUntilStepReady()
        if (world.stopped) break
        if (!eng.movePlayer(action.dir)) break
        steps++
        ticks += world.tickUntilReady(1)
        if (world.stopped) break
      }
      if (steps === 0) return settle({ steps, ignored: 'the step was refused' }, ticks)
      return { ticks, steps }
    }
    case 'face': {
      if (world.stopped || eng.busy(p)) return settle({ ignored: 'cannot turn now' })
      const at = world.pos()
      const [dx, dy] = DELTA[action.dir]
      c.face({ ...at, x: at.x + dx, y: at.y + dy })
      return settle()
    }
    case 'primary':
    case 'hands':
    case 'take':
    case 'put':
    case 'use':
    case 'self': {
      const key = action.verb
      // the open chest panel: its transfers (the worker's `transfer`) and its closing (`closePanel`); other keys wait
      if (world.panel) {
        const box = world.panel
        // the panel's first slot: the first thing the container holds (the panel lists them in the same order)
        const first = w.get(box)?.contents?.[0]
        if (key === 'hands') {
          world.closePanel()
          return settle()
        }
        if (key === 'take' && first) {
          const item = first
          const go = () => c.transfer(box, 'chest', item, false)
          if (!c.asksBeforeTransfer(box, 'chest', item, false, go)) go()
          return settle()
        }
        if (key === 'put' && p.held) {
          c.transfer(box, 'bag', p.held, false)
          return settle()
        }
        return settle({ ignored: 'the chest panel is open' })
      }
      if (w.state.question) return settle({ ignored: 'a question is open' })
      const plan = c.planFor(key, undefined, undefined, world.shown[key])
      if (!plan) return settle({ ignored: 'nothing to do there' })
      const out = key === 'primary' ? c.swing(plan) : c.run(plan)
      if (out.panel) world.panel = out.panel
      return settle()
    }
    case 'select':
      c.select(action.slot)
      return settle()
    case 'answer':
      c.answer(action.yes)
      return settle()
    case 'advance':
      eng.story.advance()
      return settle()
    case 'wait': {
      if (world.stopped) return settle({ ignored: 'time is stopped' })
      eng.passTime(action.minutes * TICKS_PER_MINUTE)
      return settle()
    }
  }
}
