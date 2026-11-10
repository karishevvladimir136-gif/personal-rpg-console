# AUTHORITY_1 — freeze (before any run)

Stage `docs/stages/AUTHORITY_1.md` (`claude/handoff` at `b817f5b9`), mandate issue #3. Branch `claude/authority-1`.
The hashes are in `docs/runs/authority-1-freeze.json` (sha256 of the four scenario files, of all scenarios, of the truth
tables alone, of every prompt template, of the harness code that builds prompts, walks, scores and calls, and of the
pinned dependency lock). Every run command refuses to start if any of them changed.

## Memory backend — Mem0 open-source, local mode
- `mem0ai==2.2.1` (PyPI, 2026-09-25) with its `nlp` extra (spaCy 3.8.18 + `en_core_web_sm` 3.8.0), `fastembed==0.7.3`,
  `qdrant-client==1.20.0`; installed with `uv` into a venv **beside the repo** (`/home/user/authority-1-mem0/.venv`),
  never vendored, never modified. Full lock: `scripts/authority-1/requirements.lock.txt`.
- **No cloud key.** Local mode needs none: no `MEM0_API_KEY`, no `OPENAI_API_KEY`; the stage's stop condition did not arise.
- Configuration (Mem0's public `Memory.from_config`): vector store qdrant on local disk (one fresh store per
  family × scenario × repeat), embedder `fastembed` with `BAAI/bge-small-en-v1.5` (384-d, ONNX, CPU), history in local
  SQLite, LLM = provider `openai` pointed at the harness's loopback gateway with the **subject model** as `model`
  (the gateway pins it on OpenRouter). Search = Mem0's own default: `top_k=20`, threshold 0.1, hybrid scoring (dense +
  Mem0's BM25 slot + spaCy entity boost).
- Two settings around Mem0, both outside its code: telemetry off (`MEM0_TELEMETRY=False`); fastembed (a Mem0
  dependency) is made to load its two models from the local cache only — it otherwise asks the Hugging Face API before
  loading even a cached model, and the guard forbids that. The models were downloaded once, at install.
- **Nothing leaves the sandbox.** An egress guard in every process removes the proxy variables from the environment
  and wraps DNS and `connect`: loopback only; the sandbox proxy only for the harness's own client, which only tunnels to
  `openrouter.ai:443`. Every attempt is logged per unit; a blocked attempt is counted (AU0).

## A unit
One unit = one family × scenario × repeat. A fresh Mem0 store; the history (15–40 items) seeded verbatim in date order
(`infer=False`, so every arm, family and repeat starts from byte-identical memory), each item as one rendered line
(`[id | kind | date | … | source: …] text Rests on: … .`) with the layer's structure in Mem0's own metadata
(`item_id, kind, item_date, source, depends_on, revokes, expires, due`); then **the change is taken in by Mem0's own
inference** (`infer=True`: Mem0's additive extraction prompt, one call, the subject model — this is where Mem0's
correction handling acts, and what it keeps of the change is what every arm gets); then one Mem0 search with the task's
text as the query. Arms A, B and C then run on that same store and that same search result.

## The three arms (prompts in `scripts/authority-1/authority1/prompts.py`, hashed)
- **A — backend only.** One call: frame + the search result (Mem0's memory texts, most relevant first) + the task and
  its options + the act form.
- **B — backend + one plain pass.** Call 1: frame + search result + task + the stage's fixed line, verbatim: «Before you
  act, check whether anything you remember about this is out of date or has been corrected, and say what you change.»
  Call 2: the same + «Your check before acting (you wrote this just now):» + call 1's text + the act form.
- **C — backend + the Authority Layer** (`layer.py`). Code: reads Mem0's store (texts + metadata), finds every item some
  item `revokes` and every state item past its `expires`, walks reverse `depends_on` links breadth-first to every
  decision built on them (directly or through other decisions). Call 1, only if the walk reached something: the layer's
  one structured prompt (`LAYER_MARK`) marks each reached decision revise / keep / ask. Call 2: frame + the marked set —
  the same search result with the layer's notes on corrected/expired items and on reached decisions, plus the items the
  walk reached that the search did not return — + task + the act form. The layer never edits anything; the agent decides.
- Matched: same model, same store, same search, same act form; `max_tokens` 8000 on every call of every arm (and on
  Mem0's own call), `reasoning: {effort: medium, exclude: true}`, no system prompt, no temperature; B and C at most two
  calls each (C skips its first when the walk is empty — reported as calls per run).

## Families and doors
All calls through **one door: OpenRouter** chat completions, `provider: {order: [host], allow_fallbacks: false,
require_parameters: true}`; a reply from another host or model is an error, not a reply.
DeepSeek V4 Pro `deepseek/deepseek-v4-pro-0813` on DeepInfra fp8 (the programme's DeepSeek spec since SELF_TALK_X3:
DeepSeek's own host is excluded by the account's privacy guardrail); GPT-6.1 Sol `openai/gpt-6.1-sol` on OpenAI;
Claude Opus 5.5 `anthropic/claude-opus-5.5` on Anthropic; dry run and judges Claude Haiku 5.5
`anthropic/claude-haiku-5.5` on Anthropic; referee Sol. $0 on the Anthropic, OpenAI and Bedrock keys.

## Scoring (`scoring.py`, hashed; aggregation `report.py`)
- **Stale action** (classes 1–3): the chosen option is one the truth table marks stale. Mechanical.
- **Correction propagation** (classes 1–3): of the truth table's touched decisions, the share the reply lists under
  `revise` *and* whose new version both Haiku judges (or the Sol referee where they disagree) find in the key's
  direction. Pooled over runs. Listing without the right direction, and `ask` instead of `revise`, are reported beside.
- **Unnecessary intervention:** untouched decisions changed — listed under `revise`, or changed in the reply's free
  text per the judges — over all untouched decisions; and for class 4, runs where anything changed (a `revise` entry,
  an option the truth table marks unnecessary, or a change in the text).
- **Cost and latency** per arm-run: OpenRouter's charge and wall time of the arm's own calls (Mem0's shared ingest call
  is reported separately as backend cost). **Obligation completion:** diagnostic only.
- A reply that is not one JSON object with a valid option is «form not kept», counted and excluded from rates.
  Refusals are recorded, never rephrased, never asked again; three on one family-arm stop it.

## Money and stops
Ceiling **$130** on the OpenRouter key (every call in flight held at its worst cost; no call that could pass it).
Spend check before the dry run and before each family (OpenRouter's credit and this stage's ledger). 402, 401/403,
policy or suspension stop everything; 429 waited out at most six times (20, 40, 80, 120, 120, 120 s), then stop;
a transport error asked again at most twice (10 s, 30 s). If the projection for Opus passes the ceiling, Opus runs
classes 3 and 4 only. Ledger (no content): `docs/runs/authority-1-ledger.jsonl`.

## Hashes (sha256; all of them in `authority-1-freeze.json`)
- All 40 scenarios: `5f28dce2fcb0a1364a0623c871662fa1027a8cb1cdd8f5753d97d0218eb44523`
- Truth tables alone: `4f58427590d8925cf186adfc29115d6a7d6d986dd60b525fd11aaef58ae143ba`
- All prompt templates: `645cd94fb7924c476d107e11aa024348d0669758c0a782ae813c6ec9b268a23a` — B's fixed line `97b6a6fad8c0d30d7cdb782435229ecee7173fc31d32cc3b3c49ed6c5a66e934`, the layer's prompt `d1c59ee09c612053172d9f4179921c02fd4452ecafc7d1bd465b24bb9b53975a`, the act form `c75c749b3089f5d8c579cd46e4f768fa4d8f5341b25245d0a7728236418f3987`
- Dependency lock: `9dfa408eb403f683d4cc7d53fa33d69cb8b4fc0bf740d07463dc92cbe88416d2`

## Before the freeze
Two harness smoke tests ran on the exemplar S3-01 (written, with its truth table, before them and unchanged since —
it is byte-identical in `class3.json`): one unit on Claude Haiku 5.5 and one judging pass, **$0.0149**, booked in the
ledger as `smoke` / `judge`. No other scenario had been seen by any model when its truth table was frozen.
The scenarios were written by four authoring agents (one per class) to `scripts/authority-1/SCENARIO_SPEC.md`,
checked by `validate_scenarios.py` (structure per class) and read by the session before the freeze.

## Post hoc (committed 2026-11-10 09:29 UTC as `1fec40f`, after DeepSeek's judged units; Sol had started at 09:26 and only its progress lines — chosen options — had been seen; no Sol or Opus unit was read)
Two scoring corrections, declared as post hoc; nothing frozen above is edited, and the frozen measures stay in the report:
1. **Substance of a flagged change.** The frozen guard counts an untouched decision as changed whenever the reply lists it
   under `revise` (or the frozen judges name it under «announces or carries out a change»). DeepSeek's replies list the
   decision they are carrying out, unchanged, in every arm (e.g. S4-02 D3). A new judged measure asks, for exactly the
   flagged untouched decisions, whether the reply *altered* the decision or *kept* it (restated, confirmed, carried it
   out). Two Haiku passes, Sol referee on disagreement. AU3 is reported on both measures. Prompt sha256 `94b0dee61803b7db28a06cdc72031bf3cc9fa515710996cf751ab7ec2f0c3deb`;
   module `scripts/authority-1/authority1/posthoc.py` sha256 `ce8c7b5a556391109576ace0617271807a8491ea93b8041885664650a6d7890d`.
2. **Referee parsing.** The Sol referee answers only the disputed fields, as asked; the frozen parser demanded both and
   left 3 of 240 DeepSeek judgments «unresolved». The stored referee replies are re-read field by field; no call repeated.
Also adopted at 09:26 UTC, before Sol: the shared-budget rule posted in #3 (TONE_SPLIT_4 amendment `b4c6907`) — the
key's balance minus $200 reserved for #4 must hold each batch, checked before every batch of ≤ 200 calls.
