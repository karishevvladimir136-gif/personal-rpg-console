// OPEN_WORLD_ADAPTER_1 — the loop: observation → policy → action → execute → log.
//
//   OPENWORLD_DIR=../openworld ../openworld/node_modules/.bin/tsx scripts/openworld/play.ts --selftest
//   … play.ts --random <seed> [--turns 300] [--game starter|ford] [--out file.jsonl]
//   … play.ts --script <file> [--turns n] [--game starter|ford] [--out file.jsonl] [--print]
//   … play.ts --model <id>                      (Phase B; refused in Phase A)
//
// No network, no model, no key. One JSONL line per turn; a game.save() checkpoint every 50 turns and at the end
// (<out>.saves.jsonl). `--selftest`: the firewood walkthrough twice, byte-identical logs (timestamps stripped),
// stage 100 within 60 actions, the save loads back, the undefined records listed.

import { mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execute, parse, type Executed } from './act.ts'
import { observe, type Observation } from './observe.ts'
import { OPENWORLD_DIR, OpenWorld, type Dir, type Entity, type Frame, type Pos } from './world.ts'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = join(HERE, '..', '..')
export const RUN_DIR = join(REPO, 'docs', 'runs', 'open-world-adapter-1')
export const CHECKPOINT_EVERY = 50
/** Fields that carry wall-clock time: stripped before two logs are compared. */
export const TIME_FIELDS = ['started', 'elapsed_s', 'seconds_per_turn', 'savedAt', 'load_s']

export type Policy = (obs: Observation, turn: number) => string

/** mulberry32: the policy's own generator (the world's is the game's, seeded from game.json). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const randomPolicy = (seed: number): Policy => {
  const rand = mulberry32(seed)
  return (obs) => obs.legal[Math.floor(rand() * obs.legal.length)] ?? 'look'
}

/** A script: one action line each (blank lines and `#` comments skipped), `done` once it runs out. */
export const scriptLines = (file: string): string[] =>
  readFileSync(file, 'utf8')
    .split('\n')
    .map((l) => l.replace(/\r$/, ''))
    .filter((l) => l.trim() && !l.trim().startsWith('#'))
export const scriptPolicy = (lines: string[]): Policy => (_obs, turn) => lines[turn - 1] ?? 'done'

const stages = (frame: Frame): Record<string, number> =>
  Object.fromEntries(frame.quests.journal.map((q) => [q.quest, q.log[q.log.length - 1]?.stage ?? 0]))

export interface EpisodeSummary {
  out: string
  saves: string
  turns: number
  actions: number
  invalid: number
  ticks: number
  maxWords: number
  firstWords: number
  stages: Record<string, number>
  firstReached: Record<string, number>
  records: { id: string; tick: number; status: string; origin: string; summary: string }[]
  cells: number
  elapsed_s: number
  /** Seconds the load took (import, build, new game and its opening): apart from the turns. */
  load_s: number
  /** Observations kept for the report: turn 1, and the one after the axe came into the bag. */
  firstObservation: string
  axeObservation?: { turn: number; text: string }
}

/** One episode: a new game, `policy` for up to `turns` turns, logged to `out` (JSONL) and its saves beside it. */
export async function episode(opts: { policy: Policy; turns: number; out: string; label: string; game?: string; print?: boolean }): Promise<EpisodeSummary> {
  const t0 = performance.now()
  const world = await OpenWorld.open({ game: opts.game })
  const saves = opts.out.replace(/\.jsonl$/, '') + '.saves.jsonl'
  mkdirSync(dirname(opts.out), { recursive: true })
  writeFileSync(opts.out, '')
  writeFileSync(saves, '')
  const log = (rec: unknown) => appendFileSync(opts.out, JSON.stringify(rec) + '\n')
  const checkpoint = (turn: number) => appendFileSync(saves, JSON.stringify({ turn, save: world.save() }) + '\n')
  log({ type: 'header', stage: 'OPEN_WORLD_ADAPTER_1', label: opts.label, openworld_dir: OPENWORLD_DIR, openworld_commit: world.commit, game: world.gameName, turns: opts.turns, started: new Date().toISOString() })

  let frame = world.frame()
  let obs = observe(world, frame)
  const firstObservation = obs.text
  let axeObservation: EpisodeSummary['axeObservation']
  let maxWords = obs.words
  let invalid = 0
  let actions = 0
  let turn = 0
  const firstReached: Record<string, number> = {}
  const cells = new Set<string>()
  const startTick = frame.tick
  for (turn = 1; turn <= opts.turns; turn++) {
    if (opts.print) console.log(`\n===== turn ${turn} (tick ${frame.tick}, ${obs.words} words)\n${obs.text}`)
    const line = opts.policy(obs, turn)
    const parsed = parse(line)
    let res: Executed = { ticks: 0 }
    if (parsed.ok) {
      actions++
      res = execute(world, parsed.action)
    } else invalid++
    if (opts.print) console.log(`> ${line}${parsed.ok ? '' : '   [invalid]'}${res.ignored ? `   [ignored: ${res.ignored}]` : ''}`)
    const hadAxe = !!frame.player.slots.some((s) => s?.item.type === 'item/tool/axe')
    frame = world.frame()
    const pos = world.pos()
    cells.add(`${pos.map}:${pos.x},${pos.y}`)
    const st = stages(frame)
    for (const [q, s] of Object.entries(st)) for (const n of [10, 20, 100]) if (s >= n && firstReached[`${q}@${n}`] === undefined) firstReached[`${q}@${n}`] = turn
    log({
      type: 'turn',
      turn,
      tick: frame.tick,
      observation: obs.text,
      words: obs.words,
      legal: obs.legal,
      action: line,
      parse: parsed.ok ? { ok: true, action: parsed.action } : { ok: false, error: parsed.error },
      result: res,
      fx: frame.fx,
      pos,
      quests: st,
      records: world.records.length,
    })
    if (turn % CHECKPOINT_EVERY === 0) checkpoint(turn)
    if (res.done) break
    obs = observe(world, frame, parsed.ok ? {} : { notAction: line })
    maxWords = Math.max(maxWords, obs.words)
    if (!hadAxe && !axeObservation && frame.player.slots.some((s) => s?.item.type === 'item/tool/axe')) axeObservation = { turn: turn + 1, text: obs.text }
  }
  const turns = Math.min(turn, opts.turns)
  if (turns % CHECKPOINT_EVERY !== 0 || turn > opts.turns) checkpoint(turns)
  const records = world.records.map((r) => ({ id: r.id, tick: r.tick, status: r.status, origin: r.origin, summary: r.request.summary }))
  const elapsed_s = (performance.now() - t0) / 1000
  const summary: EpisodeSummary = {
    out: opts.out,
    saves,
    turns,
    actions,
    invalid,
    ticks: frame.tick - startTick,
    maxWords,
    firstWords: firstObservation.split(/\s+/).filter(Boolean).length,
    stages: stages(frame),
    firstReached,
    records,
    cells: cells.size,
    elapsed_s,
    load_s: world.load_s,
    firstObservation,
    axeObservation,
  }
  const missing = [...world.missingMaps]
  log({ type: 'end', turns, actions, invalid, ticks: summary.ticks, stages: summary.stages, first_reached: firstReached, records, cells: cells.size, max_words: maxWords, ...(missing.length && { missing_maps: missing }), elapsed_s, load_s: world.load_s, seconds_per_turn: (elapsed_s - world.load_s) / Math.max(1, turns) })
  return summary
}

/** A log with its wall-clock fields taken out, for comparing two runs byte for byte. */
export function stripped(file: string): string {
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.stringify(JSON.parse(l), (k, v) => (TIME_FIELDS.includes(k) ? undefined : v)))
    .join('\n')
}

async function selftest(): Promise<number> {
  const script = join(HERE, 'firewood.txt')
  const lines = scriptLines(script)
  const run = (tag: string) => episode({ policy: scriptPolicy(lines), turns: lines.length, out: join(RUN_DIR, `selftest-${tag}.jsonl`), label: 'selftest' })
  const a = await run('a')
  const b = await run('b')
  const sameLog = stripped(a.out) === stripped(b.out)
  const sameSaves = stripped(a.saves) === stripped(b.saves)
  // the end save loads into the same world (Game.load, as the kernel test does)
  const last = readFileSync(a.saves, 'utf8').trim().split('\n').pop()!
  const save = (JSON.parse(last) as { save: Record<string, unknown> }).save
  const back = await OpenWorld.open({ save })
  const endTurn = JSON.parse(readFileSync(a.out, 'utf8').trim().split('\n').slice(-2)[0]) as { tick: number; pos: unknown }
  const loads = back.w.state.tick === endTurn.tick && JSON.stringify(back.pos()) === JSON.stringify(endTurn.pos)
  const stage = a.stages.firewood ?? 0
  const ok = stage === 100 && a.actions <= 60 && a.invalid === 0 && sameLog && sameSaves && loads
  const result = {
    ok,
    openworld_commit: back.commit,
    script: 'scripts/openworld/firewood.txt',
    actions: a.actions,
    invalid: a.invalid,
    firewood_stage: stage,
    first_reached: a.firstReached,
    byte_identical_logs: sameLog,
    byte_identical_saves: sameSaves,
    save_loads_back: loads,
    max_words: Math.max(a.maxWords, b.maxWords),
    first_words: a.firstWords,
    records: a.records,
    logs: [a.out, b.out].map((f) => f.slice(REPO.length + 1)),
  }
  writeFileSync(join(RUN_DIR, 'selftest-summary.json'), JSON.stringify(result, null, 2) + '\n')
  writeFileSync(join(RUN_DIR, 'observation-turn-1.txt'), a.firstObservation + '\n')
  if (a.axeObservation) writeFileSync(join(RUN_DIR, `observation-axe-taken-turn-${a.axeObservation.turn}.txt`), a.axeObservation.text + '\n')
  console.log(JSON.stringify({ ...result, records: result.records.map((r) => `${r.id} ${r.status} ${r.origin} — ${r.summary}`) }, null, 2))
  console.log(ok ? 'SELFTEST PASS' : 'SELFTEST FAIL')
  return ok ? 0 : 1
}

/**
 * The Ford's talk, end to end (A4; the random walk never meets a person on Cloudtop): the author's hand — here only,
 * a self-test's setting — puts the player beside Hesper, facing him; then the grammar alone: `hands` opens the talk,
 * `talk 1` says its first verb, the last line («Goodbye.») closes it.
 */
async function selftestTalk(): Promise<number> {
  const world = await OpenWorld.open({ game: 'ford' })
  const eng = world.eng as typeof world.eng & { author<T>(f: () => T): T; teleport(e: Entity, to: Pos): void }
  const w = world.w
  const who = w.get('npc.hesper')
  const at = who && w.posOf(who)
  if (!who || !at) throw new Error('no npc.hesper in the Ford')
  const sides: [Dir, number, number][] = [['up', 0, 1], ['down', 0, -1], ['left', 1, 0], ['right', -1, 0]]
  const side = sides.find(([, dx, dy]) => w.walkable(at.map, at.x + dx, at.y + dy, w.player.id))
  if (!side) throw new Error('nowhere to stand beside Hesper')
  const [face, dx, dy] = side
  eng.author(() => eng.teleport(w.player, { map: at.map, x: at.x + dx, y: at.y + dy }))
  world.frame()
  const steps = [`face ${face}`, 'hands', 'talk 1']
  const seen: { action: string; observation: string }[] = []
  let frame = world.frame()
  for (const line of steps) {
    const parsed = parse(line)
    if (!parsed.ok) throw new Error(parsed.error)
    execute(world, parsed.action)
    frame = world.frame()
    seen.push({ action: line, observation: observe(world, frame).text })
  }
  const opened = !!frame.talk
  const verbs = frame.talk?.verbs.length ?? 0
  const bye = `talk ${verbs + 1}`
  const parsed = parse(bye)
  if (parsed.ok) execute(world, parsed.action)
  frame = world.frame()
  seen.push({ action: bye, observation: observe(world, frame).text })
  const closed = !frame.talk && !world.peoplePanel
  // again, and «Let's trade.» when Hesper trades: the trade panel opens (time stands), its only line closes it
  const say = (line: string) => {
    const p = parse(line)
    if (!p.ok) throw new Error(p.error)
    execute(world, p.action)
    frame = world.frame()
    seen.push({ action: line, observation: observe(world, frame).text })
  }
  say('hands')
  const tradeAt = (frame.talk?.verbs.findIndex((v) => v.id === 'trade') ?? -1) + 1
  let traded = true
  if (tradeAt > 0) {
    say(`talk ${tradeAt}`)
    const tradeOpen = !!frame.trade && world.peoplePanel
    say('talk 1')
    traded = tradeOpen && !frame.trade && !world.peoplePanel
  } else say(`talk ${(frame.talk?.verbs.length ?? 0) + 1}`)
  const ok = opened && verbs > 0 && closed && traded
  writeFileSync(join(RUN_DIR, 'ford-talk-selftest.txt'), seen.map((s) => `> ${s.action}\n\n${s.observation}\n`).join('\n'))
  console.log(JSON.stringify({ ok, with: 'npc.hesper', map: at.map, opened, verbs, closed_by: bye, trade_opened_and_closed: tradeAt > 0 ? traded : 'no trade verb', file: 'docs/runs/open-world-adapter-1/ford-talk-selftest.txt' }, null, 2))
  console.log(ok ? 'TALK SELFTEST PASS' : 'TALK SELFTEST FAIL')
  return ok ? 0 : 1
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const prefix0 = (game: string | undefined) => (game && game !== 'starter' ? `${game} ` : '')

async function main(): Promise<number> {
  if (process.argv.includes('--selftest-talk')) return selftestTalk()
  if (process.argv.includes('--selftest')) return selftest()
  if (arg('--model') !== undefined) {
    console.error('--model is Phase B: not run until the owner says so.')
    return 2
  }
  const game = arg('--game')
  const print = process.argv.includes('--print')
  const seed = arg('--random')
  const scriptFile = arg('--script')
  let policy: Policy
  let label: string
  let turns = Number(arg('--turns') ?? 300)
  if (seed !== undefined) {
    if (!/^\d+$/.test(seed)) throw new Error('--random takes a whole number seed')
    policy = randomPolicy(Number(seed))
    label = `${prefix0(game)}random seed ${seed}`
  } else if (scriptFile) {
    const lines = scriptLines(scriptFile)
    policy = scriptPolicy(lines)
    label = `script ${scriptFile}`
    if (arg('--turns') === undefined) turns = lines.length
  } else {
    console.error('usage: play.ts --selftest | --random <seed> | --script <file> [--game starter|ford] [--turns n] [--out file] [--print]')
    return 2
  }
  const prefix = game && game !== 'starter' ? `${game}-` : ''
  const out = arg('--out') ?? join(RUN_DIR, `${prefix}${seed !== undefined ? `random-seed${seed}` : 'script'}.jsonl`)
  const s = await episode({ policy, turns, out, label, game, print })
  console.log(
    JSON.stringify(
      {
        label,
        out: s.out.slice(REPO.length + 1),
        turns: s.turns,
        actions: s.actions,
        invalid: s.invalid,
        ticks: s.ticks,
        stages: s.stages,
        first_reached: s.firstReached,
        cells: s.cells,
        max_words: s.maxWords,
        records: s.records.length,
        record_summaries: [...new Set(s.records.map((r) => r.summary))].map((m) => `${s.records.filter((r) => r.summary === m).length}× ${m}`),
        load_s: +s.load_s.toFixed(2),
        seconds_per_turn: +((s.elapsed_s - s.load_s) / Math.max(1, s.turns)).toFixed(4),
      },
      null,
      2,
    ),
  )
  return 0
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error((err as Error).stack ?? String(err))
    process.exit(1)
  },
)
