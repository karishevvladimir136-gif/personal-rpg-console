# START HERE
## Zero-coding guide for building your Personal RPG Console

You do NOT need to learn programming before starting.

**Current work: review the source-of-truth integration candidate.** Phases 0–3.5 remain owner-accepted and the [Phase 3.75 decision](PHASE375_ARCHITECTURE_DECISION.md) is unchanged. The complete owner-approved roadmap is integrated with the [final Phase 3.8B decisions](PHASE38B_ARCHITECTURE_FREEZE.md): architecture/capability evidence is complete with documented limitations. Main has not advanced. Review the [integration summary](SOURCE_OF_TRUTH_INTEGRATION.md) and [actual verification](DEV_STATUS.md); explicit owner approval is required before main changes. Broad product research/design is closed. The next phase after approved integration is the separately scoped Production Multi-Agent Coding Sprint. No new spatial experiment, keys, accounts, installs or paid calls are needed now. Text remains independent; 2D Live is the planned primary visual layer; optional EXPLORE follows FRAME / Visual Bible. The staged guide below is historical, not an instruction to reset the database, start coding, deploy or import real material.

Your job is:
- product owner;
- tester;
- person who says what feels good or bad.

The coding agent's job is:
- write code;
- run tests;
- fix bugs;
- create migrations;
- connect services;
- explain what it needs from you.

The most important rule:

**Do not ask the agent to build the entire final product in one giant prompt.**

Build one phase, preview it, approve it, then move on.

---

# STEP 1 — CREATE THE ACCOUNTS

You need:

1. GitHub
   - stores the code
   - gives you version history

2. Supabase
   - database
   - file storage
   - one-user authentication

3. Vercel
   - puts the app on the web so you can use it on desktop and iPhone

4. OpenAI Platform
   - future server-side DM text in Phase 2, not Phase 1

5. Image/video provider accounts, only in their later phases
   - the owner chooses supported image and video providers/models independently
   - OpenAI and fal are candidates, not fixed or exclusive media requirements

No AI/media account or paid call is required for Phase 1. See MASTER_SPEC section 32.

---

# STEP 2 — CREATE ONE EMPTY GITHUB REPOSITORY

Name it something simple:

`personal-rpg-console`

Make it private.

Do not manually create a complicated folder structure.

---

# STEP 3 — OPEN CODEX / CODING AGENT AND CONNECT THE REPOSITORY

Use Codex in ChatGPT or the Codex app if it is available to you.

Connect/open the private GitHub repo.

Copy the entire Build Pack into the repository.

The important files are:

- `MASTER_SPEC.md`
- `AGENTS.md`
- `DEVELOPMENT_PLAN.md`
- `/design/*.png`

The design images are references.
They are not assets that must appear literally in the app.

---

# STEP 4 — SEND THIS FIRST PROMPT TO THE CODING AGENT

Copy exactly:

> Read `MASTER_SPEC.md`, `AGENTS.md`, `DEVELOPMENT_PLAN.md`, and every image in `/design`.
>
> This is a private single-user home project for a non-technical owner.
>
> Build ONLY Phase 0: the static UI shell with realistic mock data.
>
> Use current stable Next.js + TypeScript + Tailwind.
>
> Do not add AI, Supabase, authentication, OpenAI, fal, or complicated backend logic yet.
>
> Match the supplied UI references closely: dark charcoal, warm bronze/gold, literary typography, cinematic artwork areas, three-column desktop Game layout, responsive mobile layout, simple character doll/equipment slots.
>
> Implement routes/screens for Campaigns, Game, Character/Inventory, Journal/Evidence, Map, Library, Sessions/Recap and Settings.
>
> Use reusable components and fake data.
>
> Run the app, run lint/type checks, fix errors, and give me a preview-ready result.
>
> Do not redesign this into a generic SaaS dashboard.
>
> When done, explain in plain language what changed and exactly how I can preview it.

Then wait.

Do not interrupt the agent every two minutes.

---

# STEP 5 — LOOK AT THE PREVIEW

You do NOT review code.

You click around.

Ask only product questions:

- Does it look right?
- Is the text readable?
- Is the Game screen too crowded?
- Does Character feel good?
- Does mobile work?
- Is anything confusing?

Write feedback like:

> The right sidebar is too wide.
> Keep the central story column larger.
> Make FRAME and VIDEO more prominent.
> Character screen should match mockup 02 more closely.
> Do not show suggested actions unless I enable them.

This is excellent vibe-coding feedback.

Do NOT say:

> Refactor useMemo in component X.

That is not your job.

---

# STEP 6 — APPROVE PHASE 0 BEFORE ADDING ANY AI

When the UI feels good, tell the agent:

> Phase 0 is approved.
> Create a clean commit.
> Do not start the next phase until I ask.

This gives you a safe restore point.

---

# STEP 7 — CREATE A SUPABASE PROJECT

Now create one Supabase project.

The agent will eventually ask for values such as:
- project URL;
- public anon/publishable key;
- server secret/service key.

Do not paste secret keys into chat messages unless the environment specifically requests them securely.

Secrets go into environment variables.

Never commit them into GitHub.

Ask the agent:

> Give me exact click-by-click instructions for creating the Supabase project and tell me which values go into which environment variables.

Follow the steps.

You do not need to understand SQL.

---

# STEP 8 — BUILD PHASE 1

Send:

> Implement Phase 1 from `DEVELOPMENT_PLAN.md`.
> Add Supabase persistence for campaigns, documents/versioning, sessions, scenes, character state, inventory, quests, known NPCs, locations and asset metadata.
> Keep DM-private state server-only by architecture.
> Create database migrations in the repository.
> Use two unrelated, explicitly synthetic test campaigns. Do not import real James campaign data or DM secrets.
> Complete one-owner authentication and access checks, with no public registration.
> Do not add OpenAI yet.
> Run tests and give me a simple persistence checklist.

Then test:

- create campaign;
- reload;
- still there;
- edit document;
- reload;
- still there;
- inventory persists;
- second campaign remains isolated.

---

# STEP 9 — DEPLOY TO VERCEL

**Deployment is a separate, explicitly authorized step. Do not deploy during Phase 1.**

Before any deployment, complete and verify owner sign-in/sign-out, the single-owner restriction, database access policies, campaign isolation and server-only DM-private boundaries. A hard-to-guess URL is not access control. Do not put an unprotected app online.

Only after those checks pass and the owner approves deployment, connect the GitHub repo to Vercel.

Ask the agent:

> Give me click-by-click Vercel deployment instructions for this repository and list every environment variable required.

Add the variables in Vercel settings.

Deploy only after the owner explicitly authorizes it. Recheck unauthenticated and unauthorized direct requests on the deployed environment before using real campaign data.

---

# STEP 10 — ADD OPENAI ONLY AFTER THE DATABASE WORKS

Get an OpenAI API key from the OpenAI Platform.

Store it as a server environment variable.

Never put it in browser code.

Typical name:

`OPENAI_API_KEY`

Then send the Phase 2 prompt from `DEVELOPMENT_PLAN.md`.

The first AI milestone is NOT perfect long-term memory.

It is:

> I type an action → the DM responds → HP/inventory/quests/private state can update safely.

---

# STEP 11 — TEST WITH A THROWAWAY CAMPAIGN FIRST

Do not immediately risk your canonical James campaign.

Create:

`TEST CAMPAIGN`

Give it tiny fake canon.

Play 20 turns.

Try to break it:
- spend an item;
- take damage;
- heal;
- meet an NPC;
- leave and return;
- end session;
- start new session.

Only after this works do you import James.

---

# STEP 12 — IMPORT JAMES & JINN

Create Campaign 01.

Upload:
- Instructions
- World Bible 1
- World Bible 2
- Character Bible
- Campaign Brief

Import the current DM Ledger/private state through the spoiler/private import path.

Verify before playing:
- correct James;
- correct Jinn;
- correct level/resources;
- no DM text visible in normal UI.

---

# STEP 13 — MEMORY PHASE

Only after ordinary play works.

Send the Phase 3 prompt.

Test:
- recurring NPC remembers you;
- old promise can be retrieved;
- consumed ammunition does not return;
- current canon beats an archived document;
- second campaign never contaminates first.

---

# STEP 14 — FRAME

Now add the owner-selected supported image provider/model. OpenAI is a candidate; preserve manual model choice, campaign defaults and per-generation overrides as specified in MASTER_SPEC section 32.

Do not auto-generate every scene.

FRAME remains a button.

Approve a canonical James reference image.

Generate 5 scenes and verify visual continuity.

If it is bad:
fix the reference/prompt system before adding video.

---

# STEP 15 — VIDEO

Only now configure the owner-selected supported video provider/model. fal is a candidate, not an exclusive requirement. Confirm capabilities before integration; keep provider keys (for example `FAL_KEY` when fal is chosen) server-side.

Implement asynchronous jobs.

Do not make the user wait for video before continuing the story.

Start with:
- a short duration supported by the selected model;
- current scene frame as primary image;
- character/location references.

Only add long cinematic clips later.

---

# STEP 16 — YOUR NORMAL DEVELOPMENT LOOP

From this point the workflow is:

1. Notice something annoying.
2. Describe it in ordinary language.
3. Ask agent to fix ONLY that thing.
4. Preview.
5. If good, commit.
6. If bad, ask it to revert or adjust.

Example:

> On iPhone the Game input is hidden by the keyboard.
> Fix only mobile input behavior.
> Do not alter desktop layout.
> Test on common mobile viewport sizes.

This is vibe coding.

---

# WHEN SOMETHING BREAKS

Do not panic.

Do NOT randomly delete databases or environment variables.

Copy the exact error and tell the agent:

> This happened when I clicked X.
> Reproduce it, identify the root cause, fix it, add a regression test if appropriate, and explain the fix in plain language.

If a migration is involved, ask:

> Is this migration destructive?
> Do I need a backup first?

---

# FIVE THINGS YOU SHOULD LEARN

Only five concepts are necessary:

## Repository
The project's home on GitHub.

## Commit
A safe saved version of the code.

## Deploy
Putting that version online.

## Environment variable
A secure place for API keys/configuration.

## Logs
The place to look when something fails.

You do not need to learn React, SQL or TypeScript to begin.

---

# RED FLAGS

Stop and ask questions if the agent proposes:

- Kubernetes;
- microservices;
- Redis + Kafka + five queues for v1;
- a custom vector database;
- a native iOS app before the web app works;
- putting API keys in frontend code;
- sending DM-private data to the browser and “hiding it with CSS”;
- deleting the DB because a migration is annoying;
- rewriting the entire application for a small feature.

For this project, simpler is better.

---

# REALISTIC BUILD EXPECTATION

A functional personal prototype is a small project by modern agentic-development standards.

A polished reliable version still takes iteration.

Think in milestones, not promises:

- Phase 0: looks like the app
- Phase 1: remembers data
- Phase 2: plays
- Phase 3: remembers campaigns well
- Phase 4: generates frames
- Phase 5: generates video
- Phase 6: becomes pleasant

The first objective is NOT perfection.

The first objective is:

**Continue James & Jinn outside ChatGPT without losing the quality of the campaign.**
