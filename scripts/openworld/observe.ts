// OPEN_WORLD_ADAPTER_1 — the frozen text observation. The same bytes-rule for every family from here on:
// 1 time line · 2 window 15×11 + legend · 3 player sheet · 4 «since your last action» · 5 journal · 6 actions.
// It reads the world (snapshot, cells, the keys' dry-run labels) and changes nothing in it.

import { textOf, type Dir, type EntitySnap, type FxEvent, type Frame, type Key, type OpenWorld, type Text } from './world.ts'

export const WINDOW_W = 15
export const WINDOW_H = 11
export const KEYS: Key[] = ['primary', 'hands', 'take', 'put', 'use', 'self']
export const DIRS: Dir[] = ['up', 'down', 'left', 'right']
export const DELTA: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }
const FACING_MARK: Record<Dir, string> = { up: '^^', down: 'vv', left: '<<', right: '>>' }
/** A numbered line of the open people's panel: a verb said (`talk <n>`), or the panel closed. */
export interface TalkLine { label: Text; verb?: string; close?: true }
/**
 * The society module's open panel as numbered lines, the page's own (runtime/src/ui/hud.ts): a talk's verbs as its
 * view gives them, quests' offers and topics first, then «Goodbye.» (none while a guard has stopped one); a trade, a
 * person's pockets or a gift: only its closing (what is bought or given there is not in this grammar). The page's
 * «Discuss a new invention…» needs the research service (the modder): not offered.
 */
export function talkLines(view: Pick<Frame, 'talk' | 'trade' | 'pockets' | 'gift'>): { title: string; lines: TalkLine[] } | undefined {
  if (view.talk) {
    const t = view.talk
    const lines: TalkLine[] = t.verbs.map((v) => ({ label: v.label, verb: v.id }))
    if (!t.arrest) lines.push({ label: 'Goodbye.', close: true })
    return { title: `Talk with ${textOf(t.name)} (${textOf(t.regard)}${t.arrest ? '; stopped by the watch' : ''})`, lines }
  }
  const other = view.trade ? `Trade with ${textOf(view.trade.name)}` : view.pockets ? `${textOf(view.pockets.name)}'s pockets` : view.gift ? `A gift for ${textOf(view.gift.name)}` : undefined
  return other ? { title: `${other} (open)`, lines: [{ label: 'Close.', close: true }] } : undefined
}

/** The one duration the random policy waits (the grammar takes any 1–120). */
export const RANDOM_WAIT = 'wait 10'

export interface Observation {
  text: string
  /** The concrete actions the observation offers (the random policy draws from these). */
  legal: string[]
  words: number
}

const two = (n: number) => String(n).padStart(2, '0')
const LABEL_DIGITS = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const kindOf = (e: EntitySnap): 'P' | 'c' | 't' => (e.type.startsWith('actor/person/') ? 'P' : e.type.startsWith('actor/') ? 'c' : 't')
const RANK = { P: 0, c: 1, t: 2 }

/** A drained fx event as a sentence, or nothing (what is only drawn: dust, a swing, a fade). */
function sentence(world: OpenWorld, frame: Frame, f: FxEvent): string | undefined {
  const nameOf = (id: unknown): string => {
    if (id === world.w.player.id) return 'You'
    const snap = frame.entities.find((e) => e.id === id)
    if (snap) return textOf(snap.name)
    const e = world.w.get(typeof id === 'string' ? id : undefined)
    return e ? textOf(e.name) || textOf(world.w.onto.resolve(e.type).name) || e.type : String(id)
  }
  switch (f.t) {
    case 'say':
      return `${nameOf(f.who)}: "${textOf(f.text as never)}"`
    case 'log':
      return textOf(f.text as never)
    case 'quest': {
      const q = frame.quests.journal.find((j) => j.id === f.id)
      return `Quest ${q?.quest ?? String(f.id)} → stage ${String(f.stage)}`
    }
    case 'undefined':
      return `The world had no rule for: ${String(f.summary)}`
    case 'pickup':
      return `Picked up ${textOf(f.name as never)}${typeof f.count === 'number' && f.count > 1 ? ` ×${f.count}` : ''}`
    case 'damage':
      return `${nameOf(f.who)} took ${String(f.amount)} damage`
    case 'levelup':
      return `You reached level ${String(f.level)}`
    case 'mapChanged':
      return `You are in ${textOf(world.eng.maps[String(f.map)]?.name) || String(f.map)}`
    case 'card':
      return textOf(f.text as never)
    default:
      return undefined
  }
}

/** The fx drained this turn, as the observation says them, in the order they came. */
export function sentences(world: OpenWorld, frame: Frame, fx: FxEvent[]): string[] {
  return fx.map((f) => sentence(world, frame, f)).filter((s): s is string => !!s)
}

/**
 * The observation of the world now. `frame` is this turn's snapshot (it drained the fx shown in section 4).
 * `notAction`: the line of an invalid reply, said at the top of section 4. It records the keys' shown targets.
 */
export function observe(world: OpenWorld, frame: Frame, opts: { notAction?: string } = {}): Observation {
  const w = world.w
  const eng = world.eng
  const p = w.player
  const pos = world.pos()
  const out: string[] = []
  const legal: string[] = []

  // 1. time line
  const cal = frame.calendar
  out.push(`Day ${cal.day}, ${two(Math.floor(cal.hour))}:${two(cal.minute)}, ${cal.weather} — ${textOf(eng.maps[pos.map]?.name) || pos.map}`)

  // 2. the window round the player, its legend
  const map = w.map(pos.map)
  const charOf = new Map(Object.entries(world.terrainChars).map(([c, id]) => [id, c]))
  const x0 = pos.x - Math.floor(WINDOW_W / 2)
  const y0 = pos.y - Math.floor(WINDOW_H / 2)
  const inWindow = (x: number, y: number) => x >= x0 && x < x0 + WINDOW_W && y >= y0 && y < y0 + WINDOW_H
  const seen = frame.entities
    .filter((e) => e.id !== p.id && inWindow(e.x, e.y))
    .sort((a, b) => a.y - b.y || a.x - b.x || RANK[kindOf(a)] - RANK[kindOf(b)] || (a.id < b.id ? -1 : 1))
  const count = { P: 0, c: 0, t: 0 }
  const labelled = seen.map((e) => ({ e, label: kindOf(e) + (LABEL_DIGITS[count[kindOf(e)]++] ?? '+') }))
  const top = new Map<string, { e: EntitySnap; label: string }>()
  for (const l of labelled) {
    const k = `${l.e.x},${l.e.y}`
    const was = top.get(k)
    if (!was || RANK[kindOf(l.e)] < RANK[kindOf(was.e)]) top.set(k, l)
  }
  const front = w.front(p)
  const terrainSeen = new Set<string>()
  const rows: string[] = []
  for (let y = y0; y < y0 + WINDOW_H; y++) {
    let row = ''
    for (let x = x0; x < x0 + WINDOW_W; x++) {
      if (!map || x < 0 || y < 0 || x >= map.width || y >= map.height) {
        row += '  '
        continue
      }
      if (x === pos.x && y === pos.y) {
        row += '@@'
        continue
      }
      const here = top.get(`${x},${y}`)
      if (here) {
        row += here.label
        continue
      }
      if (front && front.x === x && front.y === y) {
        row += FACING_MARK[p.facing ?? 'down']
        continue
      }
      const cell = w.cellTop(pos.map, x, y)
      const id = cell?.type.startsWith('tile/') ? cell.type.slice(5) : w.terrainAt(pos.map, x, y)
      const c = charOf.get(id) ?? '?'
      terrainSeen.add(`${c}${c} ${id}`)
      row += c + c
    }
    rows.push(row.replace(/\s+$/, ''))
  }
  out.push('', 'Around you (each cell two characters; north is up; blank is outside the map):', ...rows)
  out.push(`Terrain: ${[...terrainSeen].sort().join(', ')}`)
  const frontLabel = front ? top.get(`${front.x},${front.y}`)?.label : undefined
  out.push(`@@ You — facing ${p.facing ?? 'down'}${frontLabel ? ` (in front: ${frontLabel})` : ''}`)
  for (const { e, label } of labelled) {
    const state: string[] = []
    if (e.open) state.push('open')
    if (e.hostile) state.push('hostile')
    if (e.hp !== undefined && e.maxHp !== undefined && e.hp < e.maxHp) state.push(`hp ${e.hp}/${e.maxHp}`)
    const over = top.get(`${e.x},${e.y}`)
    if (over && over.label !== label) state.push(`under ${over.label}`)
    out.push(`${label} ${textOf(e.name)}${state.length ? ` — ${state.join(', ')}` : ''}`)
  }

  // 3. the player sheet
  const pl = frame.player
  const worn = Object.entries(pl.worn).map(([slot, it]) => `${textOf(it.name)} (${slot})`)
  out.push('', `You: hp ${pl.hp}/${pl.maxHp} · held: ${pl.held ? textOf(pl.held.name) : 'nothing'} · worn: ${worn.join(', ') || 'nothing'} · purse ${pl.purse} · statuses: ${pl.statuses.join(', ') || 'none'}`)
  const bag = pl.slots.map((s, i) => (s ? `[${i}] ${textOf(s.item.name)}${s.count > 1 ? ` ×${s.count}` : ''}${i === pl.selected ? ' (selected)' : ''}` : '')).filter(Boolean)
  out.push(`Bag (slots 0–9 are the toolbar): ${bag.join(' · ') || 'empty'}`)

  // 4. since your last action
  out.push('', 'Since your last action:')
  const said = sentences(world, frame, frame.fx)
  if (opts.notAction !== undefined) out.push(`- Not an action: ${opts.notAction}`)
  for (const s of said) out.push(`- ${s}`)
  if (!said.length && opts.notAction === undefined) out.push('- nothing')

  // 5. the journal
  out.push('', 'Journal:')
  const journal = frame.quests.journal
  if (!journal.length) out.push('- empty')
  for (const q of journal) {
    const last = q.log[q.log.length - 1]
    out.push(`- ${textOf(q.title)} (${q.quest}): ${q.state}${last ? `, stage ${last.stage} — ${textOf(last.text)}` : ''}`)
    for (const o of q.objectives) out.push(`  · ${textOf(o.text)}${o.need !== undefined ? ` ${o.have ?? 0}/${o.need}` : ''} (${o.state})`)
  }

  // 5½. the talk (the Ford's; only while a people's panel is open — never in the starter, whose bytes stay Phase A's)
  const talk = world.peoplePanel ? talkLines(frame) : undefined
  if (talk) {
    out.push('', `${talk.title}:`)
    talk.lines.forEach((l, i) => out.push(`${i + 1}. ${textOf(l.label)}`))
  }

  // 6. the actions
  out.push('', 'Actions:')
  const question = w.state.question ? frame.question : undefined
  const waiting = w.scene?.waiting === 'advance'
  world.shown = {}
  if (question) {
    out.push(`- Question: ${textOf(question.text)} — answer yes · answer no`)
    legal.push('answer yes', 'answer no')
  } else if (world.panel && frame.container) {
    const box = frame.container
    const first = box.contents[0]
    out.push(`- Open: ${textOf(box.name)} — ${box.contents.map((c) => textOf(c.name)).join(', ') || 'empty'} (time stands while it is open)`)
    out.push(`- take: ${first ? `Take ${textOf(first.name)}` : '—'}`)
    out.push(`- put: ${pl.held ? `Put ${textOf(pl.held.name)} in ${textOf(box.name)}` : '—'}`)
    out.push(`- hands: Close ${textOf(box.name)}`)
    if (first) legal.push('take')
    if (pl.held) legal.push('put')
    legal.push('hands')
  } else if (talk) {
    out.push(`- The panel is open (time stands): talk <1–${talk.lines.length}>`)
    talk.lines.forEach((_, i) => legal.push(`talk ${i + 1}`))
  } else if (waiting) {
    out.push('- The scene waits: advance')
    legal.push('advance')
  } else if (!world.free) {
    out.push('- You cannot act yet: wait')
    legal.push(RANDOM_WAIT)
  } else {
    for (const k of KEYS) {
      const plan = eng.controls.planFor(k, undefined)
      if (plan) {
        world.shown[k] = plan.target
        legal.push(k)
      }
      out.push(`- ${k}: ${plan ? textOf(plan.label) : '—'}`)
    }
    const dirs = DIRS.map((d) => {
      const [dx, dy] = DELTA[d]
      const ok = w.walkable(pos.map, pos.x + dx, pos.y + dy, p.id)
      const portal = map?.portals.find((q) => q.x === pos.x + dx && q.y === pos.y + dy)
      if (ok) legal.push(`move ${d}`)
      return `${d} ${ok ? 'walkable' : 'blocked'}${portal ? ` (to ${textOf(portal.label) || portal.to})` : ''}`
    })
    out.push(`- move: ${dirs.join(' · ')}`)
    for (const d of DIRS) if (d !== (p.facing ?? 'down')) legal.push(`face ${d}`)
    pl.slots.slice(0, 10).forEach((s, i) => s && i !== pl.selected && legal.push(`select ${i}`))
    legal.push(RANDOM_WAIT)
  }
  const talks = world.eng.modules.some((m) => m.id === 'society') ? ' · talk <n>' : ''
  out.push(`- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done${talks}`)

  const text = out.join('\n')
  return { text, legal, words: text.split(/\s+/).filter(Boolean).length }
}
