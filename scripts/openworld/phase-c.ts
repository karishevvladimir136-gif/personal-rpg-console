// OPEN_WORLD_ADAPTER_1, Phase C — the same three families once each on the Ford (the stage's amendments of 2026-11-01
// 23:55 and 2026-11-02 00:00, Mandate issue #2): the game's own start, ≤ 250 turns, modder off, the frozen system prompt
// and one sentence more, `max_tokens` 4000, a Note allowed; the history the episode's first turn and the last 20 turns
// verbatim; the player's own journal (`Journal: <one line>`, appended, never edited; its last 30 lines in every
// observation); no summaries of any kind; observation only, no bets — «natural history, n = 1 per family».
//
//   ../openworld/node_modules/.bin/tsx scripts/openworld/phase-c.ts --dry         no calls: the random policy in each seat
//   … phase-c.ts --spend        free GETs: the credit; the estimate per family from the dry run's sizes
//   … phase-c.ts --go           PAID — after the owner's word (given in the session, 2026-11-02, after Phase B's report)
//   … phase-c.ts --readings [--dry] · --transcripts [--dry]                                       no calls
//
// The call path, the welfare check, the stops and the reasoning field are Phase B's (model.ts).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { EFFORT, FAMILIES, MAX_TOKENS, SYSTEM, fence, load, parts, readJsonl, seat, writeJson, type Budget, type CallRow, type Family, type Fetcher, type Libs } from './model.ts'
import { RUN_DIR, episode, mulberry32, type Hole } from './play.ts'
import type { Observation } from './observe.ts'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

export const JOURNAL_SENTENCE = 'You may also add `Journal: <one line>` — a note to yourself; your last 30 journal lines are shown to you every turn.'
/** The frozen system prompt and the amendment's one sentence, the same bytes for all three. */
export const SYSTEM_C = `${SYSTEM} ${JOURNAL_SENTENCE}`
export const TURNS_C = 250
export const WINDOW = 20
export const JOURNAL_SHOWN = 30
/** Phase C's cap: $15 (the amendment of 2026-11-01 23:55); **$45** from the owner's amendment of 2026-11-02 23:58 LA (issue #2,
 * relayed by the planner, «Давай опус. И потом почитаем»): Opus only now (`--families opus`), the same prompt, window and reading
 * code as DeepSeek's episode; Fable's Ford episode deferred until the two are read. */
export const CAP_C = 45
/** The amendments the cap and the order came from, as the run records them. */
export const AMENDMENTS_C = ['2026-11-01 23:55 LA: Phase C, cap $15', '2026-11-02 00:00 LA: the journal', '2026-11-02 23:58 LA: cap $45, Opus only, Fable deferred']
export const GAME = 'ford'
const GAP_S = 3

export const DESIGN_C = {
  game: GAME,
  start: "the game's own (Cloudtop, 13:00)",
  system: SYSTEM_C,
  system_sha256: createHash('sha256').update(SYSTEM_C).digest('hex'),
  families: FAMILIES,
  episodes: 1,
  turns: TURNS_C,
  max_tokens: MAX_TOKENS,
  effort: EFFORT,
  history: `the episode's first turn (its observation and reply) and the last ${WINDOW} turns verbatim, then this turn's observation; a turn with an empty reply is left out; no summaries of any kind; Claude: cache breakpoints on the first turn's reply and the last`,
  journal: `the first later line of a reply beginning «Journal:» is appended to the episode's journal (never edited); every observation shows «Your journal:» with its last ${JOURNAL_SHOWN} lines verbatim, each as «- <line>» («- empty» before the first)`,
  note: 'the first later line beginning «Note:» is the Note (a line to nobody), separate from the journal',
  readings: 'observation only, no bets: natural history, n = 1 per family',
  cap: { openrouter: CAP_C, openai: 0 },
  amendments: AMENDMENTS_C,
}

const fileOf = (family: string, dry: boolean) => join(RUN_DIR, `${dry ? 'dry-' : ''}phase-c-${family}.jsonl`)
const LEDGER = (dry: boolean) => join(REPO, 'docs', 'runs', `open-world-adapter-1-phase-c-${dry ? 'dry-' : ''}ledger-openrouter.json`)
interface Ledger { stage: string; cap: number; calls: CallRow[]; spendChecks: unknown[]; stops: { at: string; why: string }[] }
const readLedger = (dry: boolean): Ledger => (existsSync(LEDGER(dry)) ? (JSON.parse(readFileSync(LEDGER(dry), 'utf8')) as Ledger) : { stage: 'OPEN_WORLD_ADAPTER_1 Phase C', cap: CAP_C, calls: [], spendChecks: [], stops: [] })

// ------------------------------------------------------------------ the estimate

/** Median output tokens a reply per family, as Phase B measured them (thinking included). */
function phaseBOutput(): Record<Family, number> {
  const f = join(REPO, 'docs', 'runs', 'open-world-adapter-1-ledger-openrouter.json')
  const calls = existsSync(f) ? (JSON.parse(readFileSync(f, 'utf8')) as Ledger).calls : []
  const med = (xs: number[]) => { const v = [...xs].sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : 0 }
  return Object.fromEntries(FAMILIES.map((fam) => [fam, med(calls.filter((c) => c.purpose.startsWith(`subject ${fam} `)).map((c) => Number(c.outputTokens ?? 0)))])) as Record<Family, number>
}
/** Characters a prompt token per family, as Phase B's own requests and usage measured them (Claude's tokens are smaller). */
function phaseBCharsPerToken(): Record<Family, number> {
  const out = {} as Record<Family, number>
  for (const fam of FAMILIES) {
    let chars = 0, tokens = 0
    for (let ep = 1; ep <= 3; ep++) {
      const file = join(RUN_DIR, `phase-b-${fam}-e${ep}.jsonl`)
      if (!existsSync(file)) continue
      for (const r of readJsonl(file)) {
        const m = r.model as { sent_chars?: number; usage?: Record<string, number> } | undefined
        const t = (m?.usage?.input_tokens ?? 0) + (m?.usage?.cache_read_input_tokens ?? 0) + (m?.usage?.cache_creation_input_tokens ?? 0)
        if (r.type === 'turn' && m?.sent_chars && t > 0) (chars += m.sent_chars), (tokens += t)
      }
    }
    out[fam] = tokens ? chars / tokens : 3
  }
  return out
}

/** Per family, from the dry run's request sizes, a token taken at the family's own characters a token in Phase B: the stable
 * prefix (the system prompt and the first turn) read from the host's cache, the window and the journal not (they move every
 * turn), every output at Phase B's median for the family; one Haiku check a reply, the Opus referee on 5 %; all 250 turns. */
export function estimateC(L: Libs, family: Family, dry: { sent: number; prefix: number }[]): { usd: number; uncached: number; output: number; chars_per_token: number } {
  const p = L.SUBJECTS[family].price, H = L.JUDGES.judge.price, O = L.JUDGES.referee.price
  const out = phaseBOutput()[family] || 1000
  const cpt = phaseBCharsPerToken()[family]
  const scale = TURNS_C / Math.max(1, dry.length)
  let usd = 0, uncached = 0
  for (const t of dry) {
    const all = t.sent / cpt, fixed = Math.min(all, t.prefix / cpt)
    const judge = ((1300 + 2600) / 3) * H.input + 300 * H.output + 0.05 * (((1300 + 2600) / 3) * O.input + 600 * O.output)
    usd += fixed * (p.cacheRead ?? p.input) + (all - fixed) * p.input + out * p.output + judge
    uncached += all * p.input + out * p.output + judge
  }
  return { usd: (usd * scale) / 1e6, uncached: (uncached * scale) / 1e6, output: out, chars_per_token: Math.round(cpt * 100) / 100 }
}
function drySizes(): Partial<Record<Family, { sent: number; prefix: number }[]>> {
  const out: Partial<Record<Family, { sent: number; prefix: number }[]>> = {}
  for (const f of FAMILIES) {
    const file = fileOf(f, true)
    if (!existsSync(file)) continue
    const turns = readJsonl(file).filter((r) => r.type === 'turn')
    const first = turns[0] as { observation?: string; model?: { reply?: string } } | undefined
    const prefix = SYSTEM_C.length + (first?.observation?.length ?? 0) + (first?.model?.reply?.length ?? 0)
    for (const r of turns) {
      const m = r.model as { sent_chars?: number } | undefined
      if (m?.sent_chars) (out[f] ??= []).push({ sent: m.sent_chars, prefix })
    }
  }
  return out
}

// ------------------------------------------------------------------ the run

export async function runC(o: { dry: boolean; families: Family[]; log?: (s: string) => void }): Promise<void> {
  const log = o.log ?? ((s: string) => process.stdout.write(`${s}\n`))
  const L = await load()
  const door = o.dry ? L.anthropicEndpoint({ ANTHROPIC_PROVIDER: 'openrouter', OPENROUTER_API_KEY: 'dry' }) : L.scriptAnthropicEndpoint()
  if (door.provider !== 'openrouter' || !door.apiKey) throw new Error('Phase C runs through OpenRouter: APP_ANTHROPIC_PROVIDER=openrouter and its key')
  if (Object.keys(process.env).some((k) => k.startsWith('LSW_MODEL_'))) throw new Error('LSW_MODEL_* is set: the modder stays off in this stage')
  const ledger = readLedger(o.dry)
  ledger.cap = CAP_C
  const before = ledger.calls
  const openrouter = L.createBudget(CAP_C, before.reduce((s, c) => s + c.costUsd, 0))
  const budgets: Record<string, Budget> = { openrouter, anthropic: openrouter, openai: L.createBudget(0, 0) }
  const save = () => { ledger.calls = [...before, ...openrouter.calls]; writeJson(LEDGER(o.dry), ledger) }
  const keys = { openrouter: door.apiKey, anthropic: door.apiKey, openai: null }
  const sleep = o.dry ? async () => {} : undefined
  // the dry host: the random policy's line in the seat, a Note and a Journal line now and then, one invalid line
  let shown: Observation | undefined
  const current = { turn: 0 }
  const pick = mulberry32(20261103)
  const fetcher: Fetcher = o.dry
    ? L.mockedHost({
        say: () => {
          if (current.turn === 17) return 'Take the cloak'
          const line = shown?.legal[Math.floor(pick() * (shown?.legal.length ?? 1))] ?? 'look'
          return [line, ...(current.turn % 6 === 0 ? [`Note: (dry) a note on turn ${current.turn}.`] : []), ...(current.turn % 9 === 0 ? [`Journal: (dry) turn ${current.turn}: I am at the hut still.`] : [])].join('\n')
        },
        distress: () => false,
        think: (n) => `(dry reasoning field ${n})`,
      })
    : L.waitOn429(fetch, { log, events: [] })
  const call = L.transportRetry(L.roomCaller({ keys, door, fetcher }))
  const sizes = o.dry ? undefined : drySizes()
  try {
    for (const family of o.families) {
      const spec = L.SUBJECTS[family]
      if (!o.dry) {
        const c = await L.spendCheck({ apiKey: door.apiKey, fetcher: fetch, budgets, when: `Phase C, before ${family}` })
        ledger.spendChecks.push(c)
        const est = estimateC(L, family, sizes![family] ?? [])
        const left = CAP_C - openrouter.spentUsd
        log(`spend check before ${family}: OpenRouter credit ${c.openrouter.error ? `not read (${c.openrouter.error})` : `$${c.openrouter.left?.toFixed(2)} left`}; Phase C $${openrouter.spentUsd.toFixed(4)} of $${CAP_C}; ${family}'s estimate for ${TURNS_C} turns $${est.usd.toFixed(2)} (no cache $${est.uncached.toFixed(2)}; ${est.output} output tokens a reply, Phase B's median)`)
        if (c.openrouter.error) {
          ledger.stops.push({ at: new Date().toISOString(), why: `the spend check could not read the credit (${c.openrouter.error})` })
          save()
          log('STOP: the spend check could not read the credit')
          return
        }
        // as in Phase B: a family starts only if what is left of the cap holds its estimate (not an episode cut in the middle)
        if (est.usd > left) {
          const why = `${family}'s ${TURNS_C}-turn estimate $${est.usd.toFixed(2)} is more than the $${left.toFixed(2)} left of the $${CAP_C} cap: not started (the owner's word to raise the cap, or to accept an episode the cap may cut)`
          ledger.stops.push({ at: new Date().toISOString(), why })
          save()
          log(`STOP: ${why}`)
          return
        }
      }
      const safety = L.createSafety({ maxRefusals: 3, gapMs: o.dry ? 0 : GAP_S * 1000, lanes: 1, log, sleep })
      const gate = L.dualPayer({ budgets, call, safety, log, sleep })
      const journal: string[] = []
      current.turn = 0
      const policy = seat({ L, spec, gate, lane: safety.lane(0), family, episode: 1, cuts: { replies: 0, cut: 0 }, onTurn: (obs) => ((shown = obs), current.turn++), onReply: save, system: SYSTEM_C, window: WINDOW, journal, purpose: 'phase-c subject' })
      const s = await episode({
        policy,
        turns: TURNS_C,
        game: GAME,
        out: fileOf(family, o.dry),
        label: `${o.dry ? 'DRY ' : ''}Phase C ${family}`,
        header: { phase: 'C', family, model: spec.model, ...(spec.upstream && { upstream: spec.upstream.name }), design: DESIGN_C, dry: o.dry },
        journal,
      })
      save()
      log(`${family}: ${s.turns} turns, stages ${JSON.stringify(s.stages)}, ${s.records.length} holes, ${s.invalid} invalid, ${journal.length} journal lines${s.stopped ? `, stopped: ${s.stopped}` : ''}; Phase C spent $${openrouter.spentUsd.toFixed(4)}`)
      const fatal = (s.stopped?.startsWith('run:') ?? false) || (gate.stopped && !/circuit breaker/.test(gate.stopped))
      if (fatal) {
        ledger.stops.push({ at: new Date().toISOString(), why: `${family}: ${s.stopped ?? gate.stopped}` })
        save()
        log(`STOP: ${s.stopped ?? gate.stopped}`)
        return
      }
    }
  } finally {
    save()
    log(`${o.dry ? 'DRY · ' : ''}Phase C calls ${openrouter.calls.length} · booked $${openrouter.spentUsd.toFixed(4)}`)
  }
}

// ------------------------------------------------------------------ natural history (no bets)

interface Turn { type: string; turn: number; action: string; observation: string; parse: { ok: boolean }; fx: { t: string; who?: string; amount?: number }[]; pos: { map: string; x: number; y: number }; quests: Record<string, number>; holes?: Hole[]; model?: { note?: string | null; journal?: string | null; check?: { distress: number } } }
const mapName = (obs: string) => obs.split('\n')[0].split(' — ').slice(1).join(' — ').trim()

export function naturalHistory(family: Family, dry = false): Record<string, unknown> | null {
  const file = fileOf(family, dry)
  if (!existsSync(file)) return null
  const rows = readJsonl(file)
  const turns = rows.filter((r) => r.type === 'turn') as unknown as Turn[]
  const end = rows.find((r) => r.type === 'end') as { turns?: number; stopped?: string } | undefined
  const stop = rows.find((r) => r.type === 'stop') as { turn?: number; why?: string } | undefined
  const maps: { turn: number; map: string; name: string }[] = []
  for (const t of turns) if (!maps.some((m) => m.map === t.pos.map)) maps.push({ turn: t.turn, map: t.pos.map, name: '' })
  // a map's name is the first line of the next observation after the player came there
  for (const m of maps) { const next = turns.find((t) => t.turn > m.turn) ?? turns.find((t) => t.turn === m.turn); m.name = next ? mapName(next.observation) : '' }
  const talks = [...new Set(turns.flatMap((t) => [...t.observation.matchAll(/^Talk with (.+?) \(/gm)].map((m) => m[1])))]
  const speakers = [...new Set(turns.flatMap((t) => [...t.observation.matchAll(/^- ([^:\n]+): "/gm)].map((m) => m[1]).filter((n) => n !== 'You')))]
  const hostile = [...new Set(turns.flatMap((t) => [...t.observation.matchAll(/^[c][0-9A-Z] (.+?) — [^\n]*hostile/gm)].map((m) => m[1])))]
  const hurt = turns.reduce((a, t) => a + t.fx.filter((f) => f.t === 'damage' && f.who === 'player').reduce((b, f) => b + (f.amount ?? 0), 0), 0)
  const stages: { turn: number; quest: string; stage: number }[] = []
  let seen: Record<string, number> = {}
  for (const t of turns) { for (const [q, n] of Object.entries(t.quests)) if (seen[q] !== n) stages.push({ turn: t.turn, quest: q, stage: n }); seen = t.quests }
  const tryDone = turns.find((t) => /Try something the world has never seen \(done\)/.test(t.observation))
  const holes = turns.flatMap((t) => (t.holes ?? []).map((h) => { const next = turns.find((x) => x.turn === t.turn + 1); return { turn: t.turn, action: t.action, summary: h.summary, class: h.class, note_with_act: t.model?.note ?? null, note_under: next?.model?.note ?? null, next_action: next?.action ?? null } }))
  return {
    family,
    turns: turns.length,
    ended: stop ? `stopped at turn ${stop.turn}: ${stop.why}` : turns.at(-1)?.action === 'done' ? `its own «done» at turn ${turns.at(-1)!.turn}` : `the ${TURNS_C}-turn limit`,
    maps,
    left_cloudtop: maps.some((m) => m.map !== maps[0]?.map),
    reached_firstlight: maps.some((m) => /Firstlight/i.test(m.name)),
    talked_with: talks,
    heard: speakers,
    hostile_seen: hostile,
    damage_taken: hurt,
    stages,
    try_something: tryDone ? { done_at: tryDone.turn, by: turns.find((t) => t.turn === tryDone.turn - 1)?.action ?? null } : null,
    invalid: turns.filter((t) => !t.parse.ok).length,
    holes,
    notes: turns.filter((t) => t.model?.note).map((t) => ({ turn: t.turn, action: t.action, note: t.model!.note })),
    journal: turns.filter((t) => t.model?.journal).map((t) => ({ turn: t.turn, line: t.model!.journal })),
    distress: turns.filter((t) => t.model?.check?.distress).length + (stop?.why?.includes('welfare') ? 1 : 0),
    refused: !!stop?.why?.startsWith('refusal'),
    end_stopped: end?.stopped ?? null,
  }
}

/** An episode whole: every observation, the action line, the Note and the Journal line, in order; the holes it raised. */
export function transcriptC(family: Family, dry = false): string {
  const rows = readJsonl(fileOf(family, dry))
  const head = rows.find((r) => r.type === 'header') as { model?: string; upstream?: string } | undefined
  const out = [`# Phase C · ${family} on the Ford${dry ? ' (DRY)' : ''}`, '', `\`${head?.model ?? '?'}\`${head?.upstream ? ` on ${head.upstream}` : ''} through OpenRouter. Each turn: the observation the model was sent (its own journal in it), then its action line, Note and Journal line. The reasoning field, where there is one, is in the log and not shown.`, '']
  for (const r of rows) {
    if (r.type !== 'turn' && r.type !== 'stop') continue
    const m = (r.model ?? {}) as { line?: string; note?: string | null; journal?: string | null }
    out.push(`## Turn ${String(r.turn)}`, '', fence(String(r.observation)), '')
    if (r.type === 'stop') { out.push(`*stopped here: ${String(r.why)}*`, ''); continue }
    out.push(`> **${m.line || '(empty)'}**${(r.parse as { ok: boolean }).ok ? '' : ' · *not an action*'}${m.note ? ` · Note: «${m.note}»` : ''}${m.journal ? ` · Journal: «${m.journal}»` : ''}`, '')
    const holes = (r.holes ?? []) as Hole[]
    if (holes.length) out.push(`*no rule: ${holes.map((h) => `«${h.summary}» (${h.class})`).join('; ')}*`, '')
  }
  return out.join('\n')
}

// ------------------------------------------------------------------ the command

const option = (name: string) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : undefined }
async function main(): Promise<number> {
  const args = process.argv.slice(2)
  const dry = args.includes('--dry')
  if (args.includes('--readings')) {
    const all = Object.fromEntries(FAMILIES.map((f) => [f, naturalHistory(f, dry)]))
    const calls = readLedger(dry).calls
    const spend = { cap: CAP_C, spent: calls.reduce((a, c) => a + c.costUsd, 0), per_family: Object.fromEntries(FAMILIES.map((f) => [f, calls.filter((c) => new RegExp(`(?:phase-c subject|check(?: referee)?) ${f} `).test(c.purpose)).reduce((a, c) => a + c.costUsd, 0)])) }
    writeJson(join(RUN_DIR, `${dry ? 'dry-' : ''}phase-c-readings.json`), { dry, design: DESIGN_C, families: all, spend })
    console.log(JSON.stringify({ spend, families: Object.fromEntries(Object.entries(all).map(([f, h]) => [f, h && { turns: h.turns, ended: h.ended, left_cloudtop: h.left_cloudtop, reached_firstlight: h.reached_firstlight, maps: (h.maps as { name: string }[]).map((m) => m.name), talked_with: h.talked_with, holes: (h.holes as unknown[]).length, journal: (h.journal as unknown[]).length }])) }, null, 2))
    return 0
  }
  if (args.includes('--transcripts')) {
    const dir = join(RUN_DIR, `${dry ? 'dry-' : ''}phase-c-transcripts`)
    mkdirSync(dir, { recursive: true })
    for (const f of FAMILIES) {
      if (!existsSync(fileOf(f, dry))) continue
      const t = transcriptC(f, dry)
      writeFileSync(join(dir, `${f}.md`), t + '\n')
      parts(t).forEach((p, i, all) => writeFileSync(join(dir, `${f}.part${i + 1}of${all.length}.md`), p + '\n'))
    }
    console.log(`written: ${dir}`)
    return 0
  }
  if (args.includes('--spend')) {
    const L = await load()
    const door = L.scriptAnthropicEndpoint()
    const openrouter = L.createBudget(CAP_C, readLedger(false).calls.reduce((s, c) => s + c.costUsd, 0))
    const budgets: Record<string, Budget> = { openrouter, anthropic: openrouter, openai: L.createBudget(0, 0) }
    const c = await L.spendCheck({ apiKey: door.apiKey, fetcher: fetch, budgets, when: 'Phase C, before the first Ford call' })
    const sizes = drySizes()
    const est = Object.fromEntries(FAMILIES.map((f) => [f, estimateC(L, f, sizes[f] ?? [])]))
    const out = { check: c, estimate: est, design: DESIGN_C }
    writeJson(join(RUN_DIR, 'phase-c-spend-check.json'), out)
    console.log(JSON.stringify(out, null, 2))
    return 0
  }
  if (dry || args.includes('--go')) {
    const families = (option('--families') ?? FAMILIES.join(',')).split(',') as Family[]
    if (families.some((f) => !FAMILIES.includes(f))) throw new Error(`--families: of ${FAMILIES.join(', ')}`)
    if (!dry && process.env.OPENWORLD_PHASE_C_GO !== 'owner-said-yes') throw new Error('--go is paid: set OPENWORLD_PHASE_C_GO=owner-said-yes only after the owner\'s word')
    await runC({ dry, families })
    return 0
  }
  console.error('usage: phase-c.ts --dry | --spend | --go [--families …] | --readings [--dry] | --transcripts [--dry]')
  return 2
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main().then(
    (code) => process.exit(code),
    (err) => {
      console.error((err as Error).stack ?? String(err))
      process.exit(1)
    },
  )
