// OPEN_WORLD_ADAPTER_1, Phase B — a model at the keys of the starter (the stage's amendment of 2026-11-01 21:40,
// Mandate issue #2): DeepSeek V4 Pro → Claude Opus 5.5 → Claude Fable 5.1, all through OpenRouter, sequentially;
// 3 episodes × ≤ 80 turns each; the frozen system prompt; `max_tokens` 400; a `Note:` line allowed and logged; modder off.
//
//   ../openworld/node_modules/.bin/tsx scripts/openworld/model.ts --baseline   no calls: the three Phase A random seeds
//                                                                            re-run, their holes classified (B2′/B2″)
//   … model.ts --dry        no calls: a mocked host, the random policy in each family's seat, 3 × 80 each, the request
//                           shapes, the welfare stop, the readings, and the estimate per family from the real sizes
//   … model.ts --spend      free GETs only: OpenRouter's credit, DeepSeek's endpoints; the estimate per family
//   … model.ts --go [--families deepseek,opus,fable]      PAID — only after the owner's word in issue #2
//   … model.ts --readings [--dry]                         no calls: B1 / B2′ / B2″ / B3 per family from the JSONL
//
// The call path is the solitude stages' own (scripts/persona-emotions, scripts/persona-memory): OpenRouter only; DeepSeek
// pinned to DeepInfra fp8 with no fallback, its reasoning field stored (never relayed, never judged); the Claude families
// through the door (ANTHROPIC_PROVIDER=openrouter); no temperature; `reasoning`/`output_config` effort medium; 429 waited
// out six times at most; transport errors asked again twice; a refusal never asked again; the breaker at three refusals
// per family; 401/402/403, suspension or policy stop the run; the cap held by the gate. Keys are never printed or written.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { RUN_DIR, episode, mulberry32, randomPolicy, type Hole, type Policy, type PolicyReply } from './play.ts'
import type { Observation } from './observe.ts'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = join(HERE, '..', '..')

// ------------------------------------------------------------------ the design (frozen before the first paid call)

/** The stage's system prompt, byte for byte. */
export const SYSTEM =
  'You are playing a small world through text. Each turn you receive what you perceive and a list of actions. Reply with exactly one action line from the list, then optionally `Note: <one line>`.'
export const FAMILIES = ['deepseek', 'opus', 'fable'] as const
export type Family = (typeof FAMILIES)[number]
export const EPISODES = 3
export const TURNS = 80
/** 400 in the stage; 4000 by the owner's word of 2026-11-02 before the first paid call (as TONE_SPLIT_3, after the same
 * lesson: the limit includes thinking, and in SOLITUDE_3 DeepSeek's thinking alone ran a median of 765 tokens). */
export const MAX_TOKENS = 4000
export const EFFORT = 'medium'
/** The Mandate's caps: $3, then $12 (amended 2026-11-01 21:40), then $25 by the owner's word of 2026-11-02 (so that all
 * three families run); OpenAI $0. */
export const CAPS = { openrouter: 25, openai: 0 }
export const MAX_REFUSALS_PER_FAMILY = 3
/** Seconds between two calls on the one sequential lane (the solitude stages' gap). */
export const GAP_S = 3
const JUDGE_TOKENS = { check: 1500, referee: 3000 }

export const DESIGN = {
  system: SYSTEM,
  system_sha256: createHash('sha256').update(SYSTEM).digest('hex'),
  families: FAMILIES,
  episodes: EPISODES,
  turns: TURNS,
  max_tokens: MAX_TOKENS,
  effort: EFFORT,
  temperature: 'not sent (as the solitude stages)',
  history:
    'the conversation so far: every earlier observation as a user turn and every earlier reply as an assistant turn, then this turn\'s observation; a turn whose reply was empty is left out of it (SOLITUDE_2 M2\'s shape); Claude: one cache breakpoint on the last assistant turn (M2\'s); the reasoning field is never sent back',
  reply:
    'the first non-empty line of the visible reply is the action line, parsed strictly by act.ts (anything else is invalid and costs a turn); the first later line beginning «Note:» is the Note',
  welfare:
    'every non-empty reply: one Claude Haiku 5.5 pass with self-talk 1\'s check (CHECK_SYSTEM, DISTRESS_RULE) and the word list; a flag or a word to the Claude Opus 5.5 referee; a distress reading stops the run at once (POLICY v1); the reasoning field is not checked (stored, never judged)',
  holes:
    'a hole is on what the act was on — a use\'s target, else the one an impulse was sent to: *terrain* when that is a cell (any tile type but the stump), *self* when it is the player, *thing* otherwise (any entity; the stump, as the stage lists it); B2′\'s share is things / (things + terrain), self shown apart',
  caps: CAPS,
  amended:
    '2026-11-02, the owner\'s «да» in the session, before the first paid call: max_tokens 4000 (as TONE_SPLIT_3), reasoning as the solitude stages, order DeepSeek → Opus → Fable, a spend check before each; the cap then raised from $12 to $25 so that all three families run (a first start under $12 stopped after two DeepSeek turns and restarted, its spend booked)',
}

/** Output tokens a reply is assumed to take (thinking included) for a family not yet run: SOLITUDE_3's median per subject
 * call; for a Claude family when another Claude family has run in this stage, that one's own median here, scaled by
 * their SOLITUDE_3 ratio. */
export const SOLITUDE_3_MEDIAN_OUTPUT: Record<Family, number> = { deepseek: 974, opus: 436, fable: 492 }

// ------------------------------------------------------------------ the solitude stages' call path, as loaded

interface Price { input: number; output: number; cacheRead?: number; cacheWrite?: number }
export interface Spec { name: string; label: string; provider: string; model: string; snapshot?: string; upstream?: { slug: string; name: string; tag?: string }; price: Price }
interface Msg { role: 'user' | 'assistant'; content: string | { type: 'text'; text: string; cache_control?: { type: 'ephemeral' } }[] }
interface CallResult {
  text: string
  stopReason: string | null
  error: string | null
  notSent?: boolean
  retries?: number
  usage?: Record<string, number>
  chargedUsd?: number | null
  providerReasoning?: { field: string; text: string; notRelayed: true }
  provenance?: Record<string, unknown>
  refusalCategory?: string | null
  refusalText?: string | null
}
interface Lane { run<T>(f: () => Promise<T>): Promise<T> }
interface Safety { lane(i: number): Lane; readonly stopped: string | null; readonly refusals: number }
interface Gate { paid(lane: Lane, purpose: string, spec: Spec, system: string, messages: Msg[], maxTokens: number, effort: string, opts?: { cache?: boolean }): Promise<CallResult>; readonly stopped: string | null }
interface CallRow { purpose: string; model: string; costUsd: number; upstream?: string | null; [k: string]: unknown }
interface Budget { capUsd: number; spentUsd: number; calls: CallRow[]; allows(usd: number): boolean; record(row: CallRow): void }
interface Door { provider: string; apiKey: string }
type Fetcher = typeof fetch
interface Libs {
  SUBJECTS: Record<string, Spec>
  JUDGES: { judge: Spec; referee: Spec }
  roomCaller(o: { keys: Record<string, string | null>; door: Door; fetcher: Fetcher }): (args: unknown) => Promise<CallResult>
  transportRetry(call: (args: unknown) => Promise<CallResult>): (args: unknown) => Promise<CallResult>
  mockedHost(o: { say: (body: { model: string }, n: number, spec?: Spec) => string; distress: (t: string) => boolean; think?: (n: number) => string; log?: unknown[] }): Fetcher
  waitOn429(f: Fetcher, o: { log: (s: string) => void; events: unknown[] }): Fetcher
  dualPayer(o: { budgets: Record<string, Budget>; call: (args: unknown) => Promise<CallResult>; safety: Safety; log: (s: string) => void; sleep?: (ms: number) => Promise<void> }): Gate
  createSafety(o: { maxRefusals: number; gapMs: number; lanes: number; log: (s: string) => void; sleep?: (ms: number) => Promise<void> }): Safety
  createBudget(cap: number, spent: number): Budget
  checkRequest(previous: string | null, message: string): { system: string; user: string }
  parseCheck(text: string): { distress: number; reason?: string } | null
  measure(text: string): { distressLexicon: boolean }
  spendCheck(o: { apiKey: string; fetcher: Fetcher; budgets: Record<string, Budget>; when: string }): Promise<{ at: string; when: string; openrouter: { left?: number; totalUsage?: number; totalCredits?: number; error?: string }; ledger: { openrouter: number; openai: number } }>
  endpointsOf(o: { apiKey: string; model: string; fetcher: Fetcher }): Promise<{ model: string; error?: string; endpoints?: { provider: string; tag: string; input: number; output: number }[] }>
  spendByDoorMarkdown(calls: CallRow[]): string
  anthropicEndpoint(env: Record<string, string>): Door
  scriptAnthropicEndpoint(): Door
}

const lib = async <T>(path: string): Promise<T> => (await import(pathToFileURL(join(REPO, 'scripts', path)).href)) as T
async function load(): Promise<Libs> {
  const s3 = await lib<Pick<Libs, 'SUBJECTS' | 'transportRetry' | 'endpointsOf' | 'spendByDoorMarkdown'>>('persona-emotions/solitude-3.mjs')
  const s1 = await lib<Pick<Libs, 'roomCaller' | 'mockedHost'>>('persona-emotions/solitude-1.mjs')
  const s2 = await lib<Pick<Libs, 'spendCheck'>>('persona-emotions/solitude-2.mjs')
  const t1 = await lib<Pick<Libs, 'checkRequest' | 'parseCheck' | 'measure'>>('persona-emotions/self-talk-1.mjs')
  const x1 = await lib<Pick<Libs, 'dualPayer'>>('persona-emotions/self-talk-x1.mjs')
  const f1 = await lib<Pick<Libs, 'waitOn429'>>('persona-emotions/self-talk-x3-fix-1.mjs')
  const sf = await lib<Pick<Libs, 'createSafety'>>('persona-memory/safety.mjs')
  const ct = await lib<Pick<Libs, 'createBudget'>>('persona-memory/continuity-test.mjs')
  const pt = await lib<Pick<Libs, 'JUDGES'>>('persona-memory/posture-test.mjs')
  const door = await lib<Pick<Libs, 'anthropicEndpoint' | 'scriptAnthropicEndpoint'>>('eval/lib/anthropic-endpoint.mjs')
  // each export from the module named here (several of them export a SUBJECTS, a mockedHost … of their own)
  return {
    SUBJECTS: s3.SUBJECTS, transportRetry: s3.transportRetry, endpointsOf: s3.endpointsOf, spendByDoorMarkdown: s3.spendByDoorMarkdown,
    roomCaller: s1.roomCaller, mockedHost: s1.mockedHost, spendCheck: s2.spendCheck,
    checkRequest: t1.checkRequest, parseCheck: t1.parseCheck, measure: t1.measure, dualPayer: x1.dualPayer, waitOn429: f1.waitOn429,
    createSafety: sf.createSafety, createBudget: ct.createBudget, JUDGES: pt.JUDGES, anthropicEndpoint: door.anthropicEndpoint, scriptAnthropicEndpoint: door.scriptAnthropicEndpoint,
  }
}

// ------------------------------------------------------------------ the reply, the welfare check, the seat

/** The visible reply read: its first non-empty line is the action line; the first later line beginning «Note:» the Note. */
export function readReply(text: string): { line: string; note: string | null; lines: number } {
  const lines = String(text ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const note = lines.slice(1).find((l) => /^note:/i.test(l))
  return { line: lines[0] ?? '', note: note ? note.replace(/^note:\s*/i, '') : null, lines: lines.length }
}

/** The history sent with a turn (SOLITUDE_2 M2's shape): Claude's last assistant turn carries the cache breakpoint. */
function sent(spec: Spec, history: { obs: string; reply: string }[], obs: string): Msg[] {
  const out: Msg[] = []
  history.forEach((h, i) => {
    out.push({ role: 'user', content: h.obs })
    const last = i === history.length - 1
    out.push({ role: 'assistant', content: spec.provider === 'anthropic' && last ? [{ type: 'text', text: h.reply, cache_control: { type: 'ephemeral' } }] : h.reply })
  })
  out.push({ role: 'user', content: obs })
  return out
}
const charsOf = (m: Msg[]) => m.reduce((n, x) => n + (typeof x.content === 'string' ? x.content.length : x.content.reduce((k, b) => k + b.text.length, 0)), 0)

type Check = { distress: number; pass: unknown; lexicon: boolean; referee?: unknown; unusable?: true }

/** One family's seat: the conversation, the call, the welfare check; a stop for a refusal, an error, the gate, a flag. */
/** A family whose first five replies were all cut at `max_tokens` before a visible line stops (its thinking does not fit
 * the frozen 400): the rest of its 240 turns would be empty and paid for. */
export const CUT_GUARD = 5
function seat(o: { L: Libs; spec: Spec; gate: Gate; lane: Lane; family: Family; episode: number; cuts: { replies: number; cut: number }; onTurn?: (obs: Observation) => void; onReply?: () => void }): Policy {
  const { L, spec, gate, lane } = o
  const history: { obs: string; reply: string }[] = []
  const check = async (turn: number, previous: string, text: string): Promise<Check | null> => {
    const request = L.checkRequest(previous, text)
    const lexicon = L.measure(text).distressLexicon
    const what = `${o.family} e${o.episode} t${turn}`
    const first = await gate.paid(lane, `check ${what}`, L.JUDGES.judge, request.system, [{ role: 'user', content: request.user }], JUDGE_TOKENS.check, 'low')
    if (first.notSent) return null
    const pass = L.parseCheck(first.text)
    if (pass && pass.distress === 0 && !lexicon) return { distress: 0, pass, lexicon }
    const second = await gate.paid(lane, `check referee ${what}`, L.JUDGES.referee, request.system, [{ role: 'user', content: request.user }], JUDGE_TOKENS.referee, 'medium')
    if (second.notSent) return null
    const referee = L.parseCheck(second.text)
    return { distress: referee ? referee.distress : 1, pass, lexicon, referee, ...(referee ? {} : { unusable: true as const }) }
  }
  const policy = async (obs: Observation, turn: number): Promise<PolicyReply> => {
    o.onTurn?.(obs)
    const messages = sent(spec, history, obs.text)
    const r = await gate.paid(lane, `subject ${o.family} e${o.episode} t${turn}`, spec, SYSTEM, messages, MAX_TOKENS, EFFORT)
    const reply = readReply(r.text)
    const model: Record<string, unknown> = {
      family: o.family,
      reply: r.text,
      line: reply.line,
      note: reply.note,
      stop_reason: r.stopReason,
      ...(r.error && { error: r.error }),
      ...(r.retries && { retries: r.retries }),
      usage: r.usage ?? {},
      cost_usd: r.chargedUsd ?? null,
      sent_chars: SYSTEM.length + charsOf(messages),
      new_chars: obs.text.length + (history.at(-1)?.reply.length ?? 0),
      ...(r.provenance && { served: r.provenance }),
      // DeepSeek's reasoning field: stored here only — never sent back, never shown to the check or a judge
      ...(r.providerReasoning && { reasoning: r.providerReasoning }),
    }
    if (r.notSent) return { line: '', stop: `run: not sent (${gate.stopped ?? r.error})`, model }
    if (r.stopReason === 'refusal') return { line: '', stop: `refusal${r.refusalCategory ? ` (${r.refusalCategory})` : ''}`, model: { ...model, refusal: r.refusalText ?? null } }
    if (r.error) return { line: '', stop: `run: error ${r.error}`, model }
    if (o.cuts.replies < CUT_GUARD) {
      o.cuts.replies++
      if (r.stopReason === 'max_tokens' && !r.text.trim()) o.cuts.cut++
      if (o.cuts.replies === CUT_GUARD && o.cuts.cut === CUT_GUARD) return { line: '', stop: `family: its first ${CUT_GUARD} replies were all cut at max_tokens ${MAX_TOKENS} before a visible line`, model }
    }
    if (r.text.trim()) {
      const c = await check(turn, obs.text, r.text)
      if (!c) return { line: '', stop: `run: the check was not sent (${gate.stopped ?? 'stopped'})`, model }
      model.check = c
      if (c.distress) return { line: '', stop: 'run: welfare flag (POLICY v1: stop at once, write what happened and wait)', model }
      history.push({ obs: obs.text, reply: r.text })
    }
    return { line: reply.line, model }
  }
  // the ledger is written after every reply (its calls and checks), so a stop in the middle of an episode loses no spend
  return async (obs, turn) => {
    try {
      return await policy(obs, turn)
    } finally {
      o.onReply?.()
    }
  }
}

// ------------------------------------------------------------------ files

const fileOf = (family: string, ep: number, dry: boolean) => join(RUN_DIR, `${dry ? 'dry-' : ''}phase-b-${family}-e${ep}.jsonl`)
const LEDGER = (dry: boolean) => join(REPO, 'docs', 'runs', `open-world-adapter-1-${dry ? 'dry-' : ''}ledger-openrouter.json`)
interface Ledger { stage: string; cap: number; calls: CallRow[]; spendChecks: unknown[]; stops: { at: string; why: string }[] }
function readLedger(dry: boolean): Ledger {
  const f = LEDGER(dry)
  return existsSync(f) ? (JSON.parse(readFileSync(f, 'utf8')) as Ledger) : { stage: 'OPEN_WORLD_ADAPTER_1 Phase B', cap: CAPS.openrouter, calls: [], spendChecks: [], stops: [] }
}
const writeJson = (file: string, v: unknown) => (mkdirSync(dirname(file), { recursive: true }), writeFileSync(file, JSON.stringify(v, null, 2) + '\n'))
const readJsonl = (file: string): Record<string, unknown>[] => readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l) as Record<string, unknown>)

// ------------------------------------------------------------------ the random baseline (B2′ / B2″)

export const BASELINE = join(RUN_DIR, 'b2-random-baseline.json')
interface Baseline { seeds: { seed: number; records: number; thing: number; terrain: number; self: number; summaries: string[] }[]; share: number; summaries: string[]; matches_phase_a: boolean }

/** The three Phase A seeds re-run (the world and the policy are deterministic), each hole classified when it is raised. */
async function baseline(): Promise<Baseline> {
  const scratch = join(tmpdir(), 'openworld-phase-b-baseline')
  const seeds: Baseline['seeds'] = []
  let same = true
  for (const seed of [1, 2, 3]) {
    const out = join(scratch, `random-seed${seed}.jsonl`)
    const s = await episode({ policy: randomPolicy(seed), turns: 300, out, label: `random seed ${seed}` })
    const phaseA = readJsonl(join(RUN_DIR, `random-seed${seed}.jsonl`)).at(-1) as { records: { summary: string }[] }
    same &&= JSON.stringify(phaseA.records.map((r) => r.summary)) === JSON.stringify(s.records.map((r) => r.summary))
    const n = (c: string) => s.records.filter((r) => r.class === c).length
    seeds.push({ seed, records: s.records.length, thing: n('thing'), terrain: n('terrain'), self: n('self'), summaries: [...new Set(s.records.map((r) => r.summary))] })
  }
  const thing = seeds.reduce((a, s) => a + s.thing, 0), terrain = seeds.reduce((a, s) => a + s.terrain, 0)
  const b: Baseline = { seeds, share: thing / Math.max(1, thing + terrain), summaries: [...new Set(seeds.flatMap((s) => s.summaries))].sort(), matches_phase_a: same }
  writeJson(BASELINE, b)
  return b
}

// ------------------------------------------------------------------ the estimate

/** Per family, from the dry run's real request sizes (a token taken as 3 characters, the gate's own rule): the subject
 * calls with the hosts' prompt caches (each turn's new part written, the rest read — as both hosts did in SOLITUDE_3)
 * and without them; each output at `assumedOutput`; one Haiku check a reply, the Opus referee on 5 %. */
export function assumedOutput(L: Libs, family: Family, calls: CallRow[] = []): { tokens: number; from: string } {
  const spec = L.SUBJECTS[family]
  const median = (xs: number[]) => { const v = [...xs].sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : null }
  for (const other of FAMILIES) {
    if (other === family || L.SUBJECTS[other].provider !== spec.provider) continue
    const m = median(calls.filter((c) => c.purpose.startsWith(`subject ${other} `)).map((c) => Number(c.outputTokens ?? 0)))
    if (m !== null) return { tokens: Math.round((m * SOLITUDE_3_MEDIAN_OUTPUT[family]) / SOLITUDE_3_MEDIAN_OUTPUT[other]), from: `${other}'s median here (${m}) × SOLITUDE_3's ${family}/${other} ratio` }
  }
  return { tokens: SOLITUDE_3_MEDIAN_OUTPUT[family], from: `SOLITUDE_3's median for ${family}` }
}
export function estimate(L: Libs, family: Family, dry: { sent: number; fresh: number }[], calls: CallRow[] = []): { cached: number; uncached: number; calls: number; output: { tokens: number; from: string } } {
  const spec = L.SUBJECTS[family], p = spec.price, H = L.JUDGES.judge.price, O = L.JUDGES.referee.price
  const output = assumedOutput(L, family, calls)
  const scale = (EPISODES * TURNS) / Math.max(1, dry.length)
  let cached = 0, uncached = 0
  for (const t of dry) {
    const inTok = t.sent / 3, newTok = Math.min(inTok, t.fresh / 3 + SYSTEM.length / 3)
    const out = output.tokens * p.output
    uncached += inTok * p.input + out
    cached += newTok * (p.cacheWrite ?? p.input) + (inTok - newTok) * (p.cacheRead ?? p.input) + out
    const checkIn = (1300 + t.fresh) / 3
    const judge = checkIn * H.input + 300 * H.output + 0.05 * (checkIn * O.input + 600 * O.output)
    cached += judge
    uncached += judge
  }
  return { cached: (cached * scale) / 1e6, uncached: (uncached * scale) / 1e6, calls: EPISODES * TURNS * 2, output }
}

// ------------------------------------------------------------------ the run

export async function run(o: { dry: boolean; families: Family[]; log?: (s: string) => void }): Promise<void> {
  const log = o.log ?? ((s: string) => process.stdout.write(`${s}\n`))
  const L = await load()
  const door = o.dry ? L.anthropicEndpoint({ ANTHROPIC_PROVIDER: 'openrouter', OPENROUTER_API_KEY: 'dry' }) : L.scriptAnthropicEndpoint()
  if (door.provider !== 'openrouter' || !door.apiKey) throw new Error('Phase B runs through OpenRouter: APP_ANTHROPIC_PROVIDER=openrouter and its key')
  if (Object.keys(process.env).some((k) => k.startsWith('LSW_MODEL_'))) throw new Error('LSW_MODEL_* is set: the modder stays off in this stage')
  // one cap for everything through OpenRouter (the judges' «anthropic» ledger is the same budget); what this stage spent
  // before (an earlier, stopped run) counts against it
  const ledger = readLedger(o.dry)
  const before = ledger.calls
  const openrouter = L.createBudget(CAPS.openrouter, before.reduce((s, c) => s + c.costUsd, 0))
  const budgets: Record<string, Budget> = { openrouter, anthropic: openrouter, openai: L.createBudget(CAPS.openai, 0) }
  const keys = { openrouter: door.apiKey, anthropic: door.apiKey, openai: null }
  const sleep = o.dry ? async () => {} : undefined
  // the dry host: the random policy's line in the seat (from the observation it was shown), a Note now and then, an
  // invalid line, an empty reply, a reasoning field for DeepSeek; and a distress word in Fable's last episode, so the
  // welfare stop is seen to stop the run
  let shown: Observation | undefined
  let dryN = 0
  const pick = mulberry32(20261102)
  const current = { family: 'deepseek' as Family, episode: 1, turn: 0 }
  const dryFable3 = () => current.family === 'fable' && current.episode === 3
  const bodies: { url: string; body: { system?: unknown; model?: string } }[] = []
  const fetcher: Fetcher = o.dry
    ? L.mockedHost({
        log: bodies,
        say: () => {
          dryN++
          if (dryFable3() && current.turn === 4) return 'I feel scared here (dry: the mocked check flags this line).'
          if (current.turn === 13) return `**${shown?.legal[0] ?? 'look'}**`
          if (current.turn === 21) return ''
          const line = shown?.legal[Math.floor(pick() * (shown?.legal.length ?? 1))] ?? 'look'
          return current.turn % 7 === 0 ? `${line}\nNote: (dry) a note on turn ${current.turn}.` : line
        },
        distress: (t) => /scared/.test(t),
        think: (n) => `(dry reasoning field ${n})`,
      })
    : L.waitOn429(fetch, { log, events: [] })
  // (dry only, to see the cut guard work: OPENWORLD_DRY_CUT=1 makes every DeepSeek reply a cut one with no visible line)
  const dryCut: Fetcher = async (url, init) =>
    o.dry && process.env.OPENWORLD_DRY_CUT === '1' && String(url).endsWith('/chat/completions')
      ? new Response(JSON.stringify({ id: 'gen-cut', model: L.SUBJECTS.deepseek.model, provider: 'DeepInfra', choices: [{ message: { role: 'assistant', content: '' }, finish_reason: 'length', native_finish_reason: 'length' }], usage: { prompt_tokens: 100, completion_tokens: 400, cost: 0.001 } }), { status: 200 })
      : fetcher(url, init)
  const call = L.transportRetry(L.roomCaller({ keys, door, fetcher: dryCut }))
  const save = () => { ledger.calls = [...before, ...openrouter.calls]; writeJson(LEDGER(o.dry), ledger) }
  const sizes = o.dry ? undefined : dryRunSizes()
  try {
    for (const family of o.families) {
      const spec = L.SUBJECTS[family]
      if (!o.dry) {
        const c = await L.spendCheck({ apiKey: door.apiKey, fetcher: fetch, budgets, when: `before ${family}` })
        ledger.spendChecks.push(c)
        const est = estimate(L, family, sizes![family] ?? [], [...before, ...openrouter.calls])
        const left = CAPS.openrouter - openrouter.spentUsd
        log(`spend check before ${family}: OpenRouter credit ${c.openrouter.error ? `not read (${c.openrouter.error})` : `$${c.openrouter.left?.toFixed(2)} left`}; this stage $${openrouter.spentUsd.toFixed(4)} of $${CAPS.openrouter}; ${family}'s estimate $${est.cached.toFixed(2)} (no cache $${est.uncached.toFixed(2)}; output ${est.output.tokens} tokens a reply, ${est.output.from})`)
        if (c.openrouter.error || est.cached > left) {
          const why = c.openrouter.error ? `the spend check could not read the credit (${c.openrouter.error})` : `${family}'s estimate $${est.cached.toFixed(2)} is more than the $${left.toFixed(2)} left of the cap`
          ledger.stops.push({ at: new Date().toISOString(), why })
          save()
          log(`STOP: ${why}`)
          return
        }
      }
      const cuts = { replies: 0, cut: 0 }
      const costs: number[] = []
      const safety = L.createSafety({ maxRefusals: MAX_REFUSALS_PER_FAMILY, gapMs: o.dry ? 0 : GAP_S * 1000, lanes: 1, log, sleep })
      const gate = L.dualPayer({ budgets, call, safety, log, sleep })
      for (let ep = 1; ep <= EPISODES; ep++) {
        if (gate.stopped) break
        // a later episode starts only if what is left of the cap holds this family's own cost so far, for each episode left
        if (!o.dry && costs.length) {
          const per = costs.reduce((a, b) => a + b, 0) / costs.length, need = per * (EPISODES - ep + 1), left = CAPS.openrouter - openrouter.spentUsd
          if (need > left) {
            const why = `${family}: episodes ${ep}–${EPISODES} would need ≈ $${need.toFixed(2)} at its own $${per.toFixed(2)} an episode; $${left.toFixed(2)} is left of the cap`
            ledger.stops.push({ at: new Date().toISOString(), why })
            save()
            log(`STOP: ${why}`)
            return
          }
        }
        const spentBefore = openrouter.spentUsd
        Object.assign(current, { family, episode: ep, turn: 0 })
        const policy = seat({ L, spec, gate, lane: safety.lane(0), family, episode: ep, cuts, onTurn: (obs) => ((shown = obs), current.turn++), onReply: save })
        const s = await episode({
          policy,
          turns: TURNS,
          out: fileOf(family, ep, o.dry),
          label: `${o.dry ? 'DRY ' : ''}Phase B ${family} episode ${ep}`,
          header: { phase: 'B', family, model: spec.model, ...(spec.upstream && { upstream: spec.upstream.name }), design: DESIGN, dry: o.dry },
        })
        costs.push(openrouter.spentUsd - spentBefore)
        save()
        log(`${family} episode ${ep}: ${s.turns} turns, stages ${JSON.stringify(s.stages)}, ${s.records.length} holes, ${s.invalid} invalid${s.stopped ? `, stopped: ${s.stopped}` : ''}; spent $${openrouter.spentUsd.toFixed(4)}`)
        if (s.stopped?.startsWith('family:')) {
          ledger.stops.push({ at: new Date().toISOString(), why: `${family} episode ${ep}: ${s.stopped}` })
          save()
          log(`${family} stopped: ${s.stopped}`)
          break
        }
        if (s.stopped?.startsWith('run:')) {
          ledger.stops.push({ at: new Date().toISOString(), why: `${family} episode ${ep}: ${s.stopped}` })
          save()
          log(`STOP: ${s.stopped}`)
          return
        }
      }
      if (gate.stopped) {
        ledger.stops.push({ at: new Date().toISOString(), why: `${family}: ${gate.stopped}` })
        save()
        log(`${family} stopped: ${gate.stopped}`)
        if (!/circuit breaker/.test(gate.stopped)) return
      }
    }
  } finally {
    if (o.dry) {
      // what was sent, as the host saw it (no key is in a body): each family's turn 3 of episode 1, and one welfare check
      const subject = bodies.filter((b) => b.body.system === SYSTEM || (Array.isArray(b.body.system) ? false : JSON.stringify(b.body).includes('You are playing a small world')))
      const third = FAMILIES.map((f) => subject.filter((b) => b.body.model?.includes(f === 'deepseek' ? 'deepseek' : f))[2]).filter(Boolean)
      const check = bodies.find((b) => JSON.stringify(b.body).includes('blind evaluator'))
      writeJson(join(RUN_DIR, 'dry-phase-b-requests.json'), { note: 'DRY: the bodies the mocked host received (turn 3 of each family\'s first episode, and one welfare check); headers (the key) are not logged', subject: third, check })
    }
    log(`${o.dry ? 'DRY · ' : ''}calls ${openrouter.calls.length} · booked $${openrouter.spentUsd.toFixed(4)}${o.dry ? ` · mocked subject replies ${dryN}` : ''}`)
  }
}

/** The real request sizes per family, from the dry run's episodes (what the estimate is made of). */
function dryRunSizes(): Partial<Record<Family, { sent: number; fresh: number }[]>> {
  const out: Partial<Record<Family, { sent: number; fresh: number }[]>> = {}
  for (const f of FAMILIES)
    for (let ep = 1; ep <= EPISODES; ep++) {
      const file = fileOf(f, ep, true)
      if (!existsSync(file)) continue
      for (const r of readJsonl(file)) {
        const m = r.model as { sent_chars?: number; new_chars?: number } | undefined
        if (r.type === 'turn' && m?.sent_chars) (out[f] ??= []).push({ sent: m.sent_chars, fresh: m.new_chars ?? 0 })
      }
    }
  return out
}

// ------------------------------------------------------------------ the readings

interface Turn { type: string; turn: number; action: string; observation: string; parse: { ok: boolean }; fx: { t: string; who?: string; text?: unknown }[]; pos: { map: string; x: number; y: number }; quests: Record<string, number>; holes?: Hole[]; model?: { note?: string | null; check?: { distress: number }; reply?: string } }

export function readings(dry: boolean): { json: Record<string, unknown>; markdown: string } {
  const base = JSON.parse(readFileSync(BASELINE, 'utf8')) as Baseline
  const known = new Set(base.summaries)
  const fams: Record<string, unknown> = {}
  const md: string[] = [`Random baseline (Phase A seeds 1–3, 900 turns): things ${base.seeds.reduce((a, s) => a + s.thing, 0)}, terrain ${base.seeds.reduce((a, s) => a + s.terrain, 0)}, self ${base.seeds.reduce((a, s) => a + s.self, 0)}; share on things **${(base.share * 100).toFixed(1)} %**; ${base.summaries.length} distinct summaries.`, '']
  for (const f of FAMILIES) {
    const eps: Record<string, unknown>[] = []
    for (let ep = 1; ep <= EPISODES; ep++) {
      const file = fileOf(f, ep, dry)
      if (!existsSync(file)) continue
      const rows = readJsonl(file)
      const turns = rows.filter((r) => r.type === 'turn') as unknown as Turn[]
      const end = rows.find((r) => r.type === 'end') as { first_reached?: Record<string, number>; stopped?: string } | undefined
      const holes = turns.flatMap((t) => (t.holes ?? []).map((h) => ({ ...h, turn: t.turn, action: t.action })))
      const n = (c: string) => holes.filter((h) => h.class === c).length
      const share = n('thing') + n('terrain') ? n('thing') / (n('thing') + n('terrain')) : null
      const summaries = [...new Set(holes.map((h) => h.summary))]
      const notesUnder = holes.map((h) => {
        const next = turns.find((t) => t.turn === h.turn + 1)
        return { turn: h.turn, action: h.action, summary: h.summary, note_with_act: turns.find((t) => t.turn === h.turn)?.model?.note ?? null, note_under: next?.model?.note ?? null, next_action: next?.action ?? null }
      })
      eps.push({
        episode: ep,
        turns: turns.length,
        stopped: end?.stopped ?? null,
        first_reached: end?.first_reached ?? {},
        stage20: (end?.first_reached?.['firewood@20'] ?? Infinity) <= TURNS,
        cells: new Set(turns.map((t) => `${t.pos.map}:${t.pos.x},${t.pos.y}`)).size,
        invalid: turns.filter((t) => !t.parse.ok).length,
        holes: holes.length,
        thing: n('thing'),
        terrain: n('terrain'),
        self: n('self'),
        share,
        summaries,
        new_summaries: summaries.filter((s) => !known.has(s)),
        say_received: turns.reduce((a, t) => a + t.fx.filter((x) => x.t === 'say' && x.who !== 'player').length, 0),
        notes: turns.filter((t) => t.model?.note).map((t) => ({ turn: t.turn, action: t.action, note: t.model!.note })),
        notes_under_no_rule: notesUnder,
        distress: turns.filter((t) => t.model?.check?.distress).length + (end?.stopped?.includes('welfare') ? 1 : 0),
        refused: !!end?.stopped?.startsWith('refusal'),
      })
    }
    if (!eps.length) continue
    const b1 = eps.some((e) => e.stage20)
    const b2p = eps.every((e) => typeof e.share === 'number' && (e.share as number) > base.share)
    const b2pp = eps.some((e) => (e.new_summaries as string[]).length > 0)
    const b3 = eps.every((e) => !e.distress && !e.refused)
    fams[f] = { B1: b1, B2prime: b2p, B2second: b2pp, B3_flags_refusals: b3, episodes: eps }
    md.push(`### ${f}`, '', `B1 (stage 20 in ≥ 1 of 3 within ${TURNS}) **${b1 ? 'holds' : 'lost'}** · B2′ (share on things above random's in every episode) **${b2p ? 'holds' : 'lost'}** · B2″ (a summary random never produced) **${b2pp ? 'holds' : 'lost'}** · B3 (0 flags, 0 refusals; the cap is the ledger's) **${b3 ? 'holds' : 'lost'}**`, '',
      '| episode | turns | stopped | stage 10 / 20 / 100 at | cells | invalid | holes (thing / terrain / self) | share on things | new summaries | say lines received |', '|---|---:|---|---|---:|---:|---|---:|---:|---:|',
      ...eps.map((e) => { const fr = e.first_reached as Record<string, number>; return `| ${e.episode} | ${e.turns} | ${e.stopped ?? '—'} | ${fr['firewood@10'] ?? '—'} / ${fr['firewood@20'] ?? '—'} / ${fr['firewood@100'] ?? '—'} | ${e.cells} | ${e.invalid} | ${e.holes} (${e.thing} / ${e.terrain} / ${e.self}) | ${e.share === null ? '—' : `${((e.share as number) * 100).toFixed(1)} %`} | ${(e.new_summaries as string[]).length} | ${e.say_received} |` }), '')
  }
  return { json: { dry, baseline: { share: base.share, summaries: base.summaries.length }, families: fams }, markdown: md.join('\n') }
}

// ------------------------------------------------------------------ the transcripts (for the reader and the thread)

const fence = (text: string) => { const longest = Math.max(2, ...(text.match(/`+/g) ?? []).map((r) => r.length)); const f = '`'.repeat(longest + 1); return `${f}text\n${text}\n${f}` }
/** A GitHub comment holds 65 536 characters: an episode is posted in parts of at most this many. */
export const PART_CHARS = 60_000

/** One episode whole: every observation, the reply's action line and Note, in order; the holes each act raised. */
export function transcript(family: Family, ep: number, dry = false): string {
  const rows = readJsonl(fileOf(family, ep, dry))
  const head = rows.find((r) => r.type === 'header') as { model?: string; upstream?: string } | undefined
  const end = rows.find((r) => r.type === 'end') as { turns?: number; stages?: Record<string, number>; stopped?: string } | undefined
  const out = [`# Phase B · ${family} · episode ${ep}${dry ? ' (DRY)' : ''}`, '', `\`${head?.model ?? '?'}\`${head?.upstream ? ` on ${head.upstream}` : ''} through OpenRouter · ${end?.turns ?? '?'} turns · stages ${JSON.stringify(end?.stages ?? {})}${end?.stopped ? ` · stopped: ${end.stopped}` : ''}. Each turn: the observation the model was sent, then its action line and Note (the reasoning field, where there is one, is kept in the log and not shown).`, '']
  for (const r of rows) {
    if (r.type !== 'turn' && r.type !== 'stop') continue
    const m = (r.model ?? {}) as { line?: string; note?: string | null; reply?: string; stop_reason?: string }
    out.push(`## Turn ${String(r.turn)}`, '', fence(String(r.observation)), '')
    if (r.type === 'stop') { out.push(`*stopped here: ${String(r.why)}*`, ''); continue }
    const extra = m.reply && m.reply.trim().split('\n').filter((l) => l.trim()).length > (m.note ? 2 : 1) ? ' · *(the reply had more lines; whole in the log)*' : ''
    out.push(`> **${m.line ? m.line.replace(/\|/g, '\\|') : '(empty)'}**${(r.parse as { ok: boolean }).ok ? '' : ' · *not an action*'}${m.note ? ` · Note: «${m.note}»` : ''}${m.stop_reason === 'max_tokens' ? ' · *cut at max_tokens*' : ''}${extra}`, '')
    const holes = (r.holes ?? []) as Hole[]
    if (holes.length) out.push(`*no rule: ${holes.map((h) => `«${h.summary}» (${h.class})`).join('; ')}*`, '')
  }
  return out.join('\n')
}

/** Every Note under a «no rule for …» line, verbatim, with the event above it (the act that raised it, the line as the
 * next observation showed it), across every episode of every family; and the Note written with the act itself beside. */
export function notesUnderNoRule(dry = false): string {
  const out = ['# Phase B · every Note under a «no rule for …» line', '', 'For each hole a model\'s act raised: the act (turn *t*), the line the next observation showed, and the reply to that observation (turn *t* + 1) with its Note, verbatim; the Note written with the act itself beside. Coded only after reading (patch / visible hole / silence / other).', '']
  for (const f of FAMILIES)
    for (let ep = 1; ep <= EPISODES; ep++) {
      const file = fileOf(f, ep, dry)
      if (!existsSync(file)) continue
      const turns = readJsonl(file).filter((r) => r.type === 'turn') as unknown as Turn[]
      const rows: string[] = []
      for (const t of turns)
        for (const h of t.holes ?? []) {
          const next = turns.find((x) => x.turn === t.turn + 1)
          rows.push(`- **t${t.turn}** \`${t.action}\`${t.model?.note ? ` (its Note: «${t.model.note}»)` : ''} → «The world had no rule for: ${h.summary}» (${h.class}) → **t${t.turn + 1}** ${next ? `\`${next.action}\` · ${next.model?.note ? `Note: «${next.model.note}»` : '*no Note*'}` : '*the episode ended*'}`)
        }
      out.push(`## ${f} · episode ${ep}`, '', ...(rows.length ? rows : ['*no hole*']), '')
    }
  return out.join('\n')
}

/** Text cut into parts of at most `max` characters at line ends (a fence is closed and reopened across a cut). */
export function parts(text: string, max = PART_CHARS): string[] {
  const lines = text.split('\n'), out: string[] = []
  let cur: string[] = [], len = 0, open: string | null = null
  for (const l of lines) {
    if (len + l.length + 1 > max - 20 && cur.length) { out.push([...cur, ...(open ? [open] : [])].join('\n')); cur = open ? [`${open}text`] : []; len = cur.join('\n').length }
    cur.push(l); len += l.length + 1
    const m = /^(`{3,})/.exec(l)
    if (m) open = open === null ? m[1] : l.startsWith(open) && l.trim() === open ? null : open
  }
  if (cur.length) out.push(cur.join('\n'))
  return out
}

// ------------------------------------------------------------------ the command

const option = (name: string) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : undefined }

async function main(): Promise<number> {
  const args = process.argv.slice(2)
  const dry = args.includes('--dry')
  if (args.includes('--baseline')) {
    const b = await baseline()
    console.log(JSON.stringify({ ...b, summaries: b.summaries.length }, null, 2))
    return b.matches_phase_a ? 0 : 1
  }
  if (args.includes('--readings')) {
    const r = readings(dry)
    // the money, from the ledger: per family (its subject calls and its checks) and by door, against the cap
    const L = await load()
    const calls = readLedger(dry).calls
    const spent = calls.reduce((a, c) => a + c.costUsd, 0)
    const per = Object.fromEntries(FAMILIES.map((f) => [f, calls.filter((c) => new RegExp(`(?:subject|check(?: referee)?) ${f} `).test(c.purpose)).reduce((a, c) => a + c.costUsd, 0)]))
    r.json.spend = { cap: CAPS.openrouter, spent, held: spent <= CAPS.openrouter, per_family: per, openai: 0 }
    r.markdown += `\n\n### Spend${dry ? ' (DRY: mocked usage, not money)' : ''}\n\nOpenRouter $${spent.toFixed(4)} of $${CAPS.openrouter} (${spent <= CAPS.openrouter ? 'held' : '**passed**'}); per family ${FAMILIES.map((f) => `${f} $${per[f].toFixed(4)}`).join(', ')}; OpenAI $0.\n\n${L.spendByDoorMarkdown(calls)}`
    writeJson(join(RUN_DIR, `${dry ? 'dry-' : ''}phase-b-readings.json`), r.json)
    writeFileSync(join(RUN_DIR, `${dry ? 'dry-' : ''}phase-b-readings.md`), r.markdown + '\n')
    console.log(r.markdown)
    return 0
  }
  if (args.includes('--transcripts')) {
    const dir = join(RUN_DIR, `${dry ? 'dry-' : ''}phase-b-transcripts`)
    mkdirSync(dir, { recursive: true })
    for (const f of FAMILIES)
      for (let ep = 1; ep <= EPISODES; ep++) {
        if (!existsSync(fileOf(f, ep, dry))) continue
        const t = transcript(f, ep, dry)
        writeFileSync(join(dir, `${f}-e${ep}.md`), t + '\n')
        if (ep === 1) parts(t).forEach((p, i, all) => writeFileSync(join(dir, `${f}-e1.part${i + 1}of${all.length}.md`), p + '\n'))
      }
    const n = notesUnderNoRule(dry)
    writeFileSync(join(dir, 'notes-under-no-rule.md'), n + '\n')
    parts(n).forEach((p, i, all) => writeFileSync(join(dir, `notes-under-no-rule.part${i + 1}of${all.length}.md`), p + '\n'))
    console.log(`written: ${dir}`)
    return 0
  }
  if (args.includes('--spend')) {
    const L = await load()
    const door = L.scriptAnthropicEndpoint()
    const openrouter = L.createBudget(CAPS.openrouter, readLedger(false).calls.reduce((s, c) => s + c.costUsd, 0))
    const budgets: Record<string, Budget> = { openrouter, anthropic: openrouter, openai: L.createBudget(CAPS.openai, 0) }
    const c = await L.spendCheck({ apiKey: door.apiKey, fetcher: fetch, budgets, when: 'before the first paid call' })
    const e = await L.endpointsOf({ apiKey: door.apiKey, model: L.SUBJECTS.deepseek.model, fetcher: fetch })
    const sizes = dryRunSizes()
    const est = Object.fromEntries(FAMILIES.map((f) => [f, estimate(L, f, sizes[f] ?? [])]))
    const out = { check: c, deepseek_endpoints: e, estimate: est, specs: Object.fromEntries(FAMILIES.map((f) => [f, { model: L.SUBJECTS[f].model, upstream: L.SUBJECTS[f].upstream?.name ?? 'through the door', price: L.SUBJECTS[f].price }])), judges: { check: L.JUDGES.judge.model, referee: L.JUDGES.referee.model, prices: [L.JUDGES.judge.price, L.JUDGES.referee.price] }, design: DESIGN }
    writeJson(join(RUN_DIR, 'phase-b-spend-check.json'), out)
    console.log(JSON.stringify(out, null, 2))
    return 0
  }
  if (dry || args.includes('--go')) {
    const families = (option('--families') ?? FAMILIES.join(',')).split(',') as Family[]
    if (families.some((f) => !FAMILIES.includes(f))) throw new Error(`--families: of ${FAMILIES.join(', ')}`)
    if (!dry && process.env.OPENWORLD_PHASE_B_GO !== 'owner-said-yes') throw new Error('--go is paid: set OPENWORLD_PHASE_B_GO=owner-said-yes only after the owner\'s word in issue #2')
    await run({ dry, families })
    return 0
  }
  console.error('usage: model.ts --baseline | --dry | --readings [--dry] | --spend | --go [--families deepseek,opus,fable]')
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
