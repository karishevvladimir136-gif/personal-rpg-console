---
name: Mandate
about: A unit of work for a cloud session — immutable once issued; changes are new comments
title: "MANDATE: <stage or task>"
labels: mandate
---

<!-- Immutable once issued. Do not edit the body; append a dated comment instead. -->

**Goal** — one sentence.

**Stage** — `docs/stages/<FILE>.md` at commit `<hash>` on `claude/handoff` (the session reads this hash, not HEAD).

**Scope** — what is in; what is explicitly out.

**Strength** —
- may do without asking: …
- stops and waits for the owner's word in this thread: …
- never: … (see Policy)

**Policy** — `docs/POLICY.md` v<N>.

**Caps** — $<n> OpenRouter / $<n> OpenAI / other; spend check before the first paid call.

**Branch** — `claude/<name>` from `origin/<base>`.

**Done when** — the list from the stage, or shorter.

**Report** — `docs/runs/<name>-report.md`; final comment in this thread with spend by door.

**Launch prompt for the session** —
> Read issue #<n> in this repository and follow it: the stage it names at the hash it names, `docs/POLICY.md` at the
> version it names. Comment on the issue when you accept (hash, policy version, branch), at every stop point, and when
> you finish. English, briefly.
