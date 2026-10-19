# Message for the local Claude session: the home screen fix (session 2)

The planner pushed commit `d74b6c6` to `claude/session-2-prep`: on the home screen the side menu and the phone tab bar are
gone, the menu card sits in the middle of the window and is larger; the Phase 0 mockup link is off the home; the side
menu on inner pages says «Мастерство Ведущего»; the picture-models caption says Sunburst for live frames. The planner's
container has no package registry, so nothing was run there.

```
Owner request: put the home screen fix into my sandbox. No paid calls. Talk to me in RUSSIAN, briefly.

Hard rules: sandbox only (Supabase «personal-rpg-console-sandbox», ports 4432x; the app on :3100) — never my real project
and never port 3000; never print, log or commit a key; nothing to main.

1. In the sandbox checkout (on claude/session-2-prep): git fetch, then fast-forward to origin/claude/session-2-prep
   (commit d74b6c6 on top of 9e2bbe9). If there are local changes, stop and tell me.
2. pnpm typecheck and pnpm lint. If either fails on these seven files, fix it on the branch, commit, push.
3. Look at it: the home page at 1440×900, 1920×1080 and a phone (390×844): the card is centred both ways, no side menu,
   no tab bar, nothing cut off or scrolling sideways; then /campaigns still has its side menu (desktop) and tab bar
   (phone). Settings → «Картинки»: the caption under «Модели картинок» says Sunburst for live frames. Send me one
   screenshot of the home page at 1440×900.
4. If the app on :3100 does not pick the change up by itself, restart it the way the sandbox start script does.
   Do not touch the database.
```
