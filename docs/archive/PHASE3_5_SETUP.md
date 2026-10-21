# Phase 3.5 — local owner review

Phase 3.5 adds save games and preserved timelines. Implementation readiness is separate from owner approval. Do not deploy, import real campaign/private material, or begin another phase as part of this review.

## Open the prepared preview

Keep Docker Desktop running. Open **http://127.0.0.1:3001/campaigns** and sign in with the existing synthetic owner account if needed. No new account, API key or provider setup is required. Never paste credentials into chat.

Choose **Synthetic Phase 3.5 · Amber Observatory** or **Synthetic Phase 3.5 · Silver Current**. Both are invented test campaigns. Inside the campaign, open **Saves** after Sessions in the desktop sidebar; on mobile, choose **More → Saves**.

The Phase 3.5 preview runs from the isolated `.worktrees/phase35-lead` checkout on port **3001**. The original checkout and its older port-3000 preview were left alone to preserve the owner's two pre-existing document edits. Use port 3001 for this milestone.

If this preview stops, open PowerShell and run these two commands, one at a time. Leave that PowerShell window open:

```powershell
Set-Location 'C:\Users\<owner>\OneDrive\Documents\GitHub\personal-rpg-console\.worktrees\phase35-lead'
& 'C:\Users\<owner>\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3001
```

This uses the prepared production build and ignored local configuration. It does not deploy anything. If PowerShell says port 3001 is already in use, try the preview URL before starting another process.

## Short click-through

1. In **Save Games**, enter a name and choose **Create manual save**. Refresh: the card remains.
2. Choose **Quick Save**, then choose it again. There is one current Quick Save card for this timeline; its previous immutable records are preserved internally.
3. Load a recent manual save. Read the confirmation, optionally name the new path, then confirm. The app creates a safety save and activates the new timeline. Loading does not replay scenes or generate a new dice result.
4. Open **Timelines**. Return to the original timeline and confirm. Its later progress remains available. Each timeline shows its own save cards.
5. Optionally open the same synthetic campaign in another tab. Start editing a character, then switch timelines in the first tab. The draft remains, with a notice that it needs review; an old-tab save cannot silently overwrite the newly active timeline.
6. In the main menu's **General Settings**, save Russian as the Interface Language. Open **Сохранения → Временные линии** and try a narrow window. Owner-written names and story text keep their original language. Restore your preferred interface language afterward.

The Amber campaign contains deliberately different historical checkpoints, including an old pending check created before a later campaign-wide canon correction. That particular stale proposal is intentionally not loadable: the server refuses to resume a plan based on superseded canon. For the normal click-through, use a newly created manual save or **Browser · before the observatory**.

## Save behavior and recovery

- **Load** starts a new path from the selected save. **Return to timeline** resumes an existing preserved path. Neither deletes the old future.
- Saved HP, resources, consumed items, equipment/storage, quests, location/time, rests/encounters, pending checks, settings and effective DM guidance are restored as exact records. Summaries are not the restore source.
- History, knowledge and public/private memory are limited to the selected path and its inherited records. An NPC does not inherit a secret revealed only in an abandoned future.
- Campaign-wide canon/reference corrections remain effective across timelines. Character/scene/state corrections, settings and effective guidance belong to their timeline. Existing document and settings version histories are retained; later edits create new versions.
- **Save policy** defaults to session-boundary autosaves and 15 recent autosave slots per timeline. The owner can choose 10–20 slots, turn autosaves off, or select committed gameplay actions. Feedback, polling and typing do not create autosaves. Saving itself never calls OpenAI.
- The load policy is optional. An explicitly confirmed owner recovery can bypass that policy, but cannot bypass authorization, stale-tab checks or invalid references.
- If a request cannot be confirmed, keep its title and use **Retry same request**. The saved request identity prevents duplicate forks. If another tab changed the timeline or policy, refresh and review the current values before submitting new changes.
- Historical records referenced by saves and timelines remain preserved even when an autosave disappears from the recent list. This is not a full database-backup/export feature; storage can grow as history accumulates.

## Verification and boundaries

See **DEV_STATUS.md** for actual integrated test, populated-database, Auth/API/privacy and browser results. The migration was applied to the existing disposable local database after a local backup, without resetting prior synthetic campaigns. No real campaign or private material was used, and Phase 3.5 verification made no OpenAI calls.

For developer reruns, use the existing `typecheck`, `lint`, `test` and `build` package scripts. Set `PREVIEW_URL=http://127.0.0.1:3001` for HTTP tests. Keep the Phase 1 empty-database seed test disabled on the populated database. `scripts/saves-app-acceptance.mjs` requires the existing explicit disposable-local opt-in and ignored acceptance environment; it appends two synthetic campaigns. `scripts/saves-privacy-acceptance.mjs` reads those fixtures and checks public responses, HTML, bundles and logs without changing gameplay. Do not publish local credentials, database backups or ignored acceptance reports.

Physical iPhone/Safari and the optional historical Phase 1 conflict-rebase confirmation remain unverified. Desktop browser resizing is not a physical-device test. Finite synthetic tests are not a guarantee of perfect branching or memory. No hosted deployment or real-data acceptance has occurred. Stop for owner review at **PHASE 3.5 READY FOR OWNER ACCEPTANCE**.
