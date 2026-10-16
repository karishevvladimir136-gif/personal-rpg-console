# Message for a local Claude Code session on the owner's Windows laptop (sandbox setup)

Send this to a NEW local session (Desktop app, Local, any folder) after `claude/integration` is pushed.

```
Owner request: set up the sandbox for my first play of the new Personal RPG Console, on this Windows laptop. You have my
full permission for the steps below. Talk to me in RUSSIAN, one short step at a time; keep commits and reports in English.

Hard rules: never touch my real database or my running Supabase project with real campaigns (the sandbox is a SEPARATE
Supabase project with its own ports and Docker volumes); never push or merge to main; never print, log or commit any key;
do not modify or delete the old project folder in OneDrive (C:\Users\karis\OneDrive\Documents\GitHub\personal-rpg-console)
or its worktrees.

1. Check: git, Node 24, pnpm, Docker Desktop (running). If Docker Desktop is not running, ask me to start it and wait.
2. Fresh clone into C:\dev\personal-rpg-console (create C:\dev if needed; if the folder exists, stop and ask me).
   Check out the branch `claude/integration`.
3. Create .env.local there (git-ignored) without printing values: take ANTHROPIC_API_KEY and OPENAI_API_KEY from the old
   project's .env.local in the OneDrive folder, and FAL_KEY from the .env.local in the sibling folder `rpg-console-ui`.
   Read only; change nothing in those folders. Set everything else the sandbox needs exactly as docs/SANDBOX.md says.
4. pnpm install.
5. Follow docs/SANDBOX.md to start the sandbox (the separate Supabase project and the app on its own port). Before
   starting, confirm that the sandbox ports and Docker project name differ from my real project's; if anything would
   reuse my real project's volumes, stop and tell me.
6. Open the sandbox app in my browser and tell me in Russian: the address, how to stop and start the sandbox later
   (the `Start Sandbox.cmd` shortcut), and that my real campaigns are untouched.
7. Report in English: what was installed, the branch and commit, the sandbox ports and project name, any problem.
```
