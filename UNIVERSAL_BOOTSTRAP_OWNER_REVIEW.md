# Universal Bootstrap V1 — correction review

The live-gate protagonist-copy defect is fixed and verified offline. Owner acceptance and real-local activation remain pending. All original live responses and the earlier review guide below are preserved.

## What changed for the owner

The opening review now says **New visible people / creatures**. List only additional new NPCs here. Your protagonist already exists and is automatically present at the approved starting place. Server and database guards reject a copied protagonist, including when an old result is recovered or a copy is entered during manual review; no partial opening is created.

Unknown possession quantities or resource balances now say **Enter a value before creation** / **Укажите значение перед созданием**. Fill the value directly by hand; no extra AI request is needed. Create remains disabled until required values are valid. A prose clarification alone cannot replace the numeric field.

The revised opening instructions leave optional paid-work details, rumors, causes and motives unknown for play instead of asking the owner to pre-decide future story possibilities. Required public opening facts, secrecy and protagonist agency still gate approval.

## Safe synthetic review

Open <http://127.0.0.1:3116/preview/bootstrap> on this computer. This runs the actual review components with scripted responses, empty provider credentials and no database writes.

1. Use the displayed example to prepare a character proposal. Clear a Quantity, or add a Resource with a blank Balance. Check the required-value message and disabled Create button.
2. Record your chosen quantity/balance by hand (six and zero are valid synthetic examples). Create becomes available when the other required fields are valid; no second AI action is needed.
3. Prepare an Evening Adventure for an unknown traveller seeking ordinary paid work. Start, prepare the scripted opening, and inspect **New visible people / creatures** and its explanation. The proposed work organiser is new; the protagonist is not listed here.
4. Confirm the public-only opening and approve to open the read-only Game preview. Switch English/Russian to review the same controls. Refresh resets synthetic data.

| View | Required-value review | New-person opening review |
| --- | --- | --- |
| EN desktop | [Required values](docs/review/universal-bootstrap-correction/en-desktop-required-values.png) | [Opening](docs/review/universal-bootstrap-correction/en-desktop-opening.png) |
| EN mobile | [Required values](docs/review/universal-bootstrap-correction/en-mobile-required-values.png) | [Opening](docs/review/universal-bootstrap-correction/en-mobile-opening.png) |
| RU desktop | [Required values](docs/review/universal-bootstrap-correction/ru-desktop-required-values.png) | [Opening](docs/review/universal-bootstrap-correction/ru-desktop-opening.png) |
| RU mobile | [Required values](docs/review/universal-bootstrap-correction/ru-mobile-required-values.png) | [Opening](docs/review/universal-bootstrap-correction/ru-mobile-opening.png) |

Desktop/mobile viewport checks are synthetic, not physical-iPhone or real-local database activation. Existing live evidence is retained; this correction made zero provider calls. Migration31 was amended only on the branch and disposable databases; migration30 is unchanged. Main remains unchanged. No revised live gate runs automatically: separate owner authorization is required for the two revised opening cases. [Fresh verification](UNIVERSAL_BOOTSTRAP_VERIFICATION.md).

---

## Preserved earlier owner review guide — unchanged

# Universal AI-DM Bootstrap V1 — owner review

Status: implemented and integrated; owner acceptance and real-local activation are pending. Branch: `codex/universal-ai-dm-bootstrap-v1`, based on accepted `6b71f8fd5e1be5c0ae7022c0060835227fffeb81`.

## What the normal flow now does

New Campaign starts with World Logic. Choose/create a World, give your protagonist a name, and describe who they are. Class, level, HP, species and equipment slots are not required. An explicit **Prepare proposal with AI** action requests the already configured model; merely opening the form does not. Its cost disclosure appears before the button.

Review and correct the proposed name, description, capabilities, limitations, possessions and resource balances directly. Resolve consequential questions and unknown quantities before **Create protagonist and campaign**. These are owner-authored facts, not external Canon or permission for unsupported mechanics. The original description/proposal and approved manual corrections remain in immutable history. The supported starter Fighter remains under **Other supported rules**; existing campaigns retain their rules and records.

Prepare the first Adventure with its ordinary pacing and owner guidance. **Start Adventure** now opens a public opening review for a wholly fresh campaign created through this path. Explicitly prepare the proposal, correct the location, observable situation, narration and visible Actors by hand, answer consequential questions, and confirm the public-only scope. **Approve opening and play** commits the opening and Adventure activation together, then navigates to Game. It creates no automatically accepted quest, reward, combat result, hidden explanation or protagonist decision.

Established continuities resume their existing state. This is not a retroactive repair of Garrick or another already-active empty Adventure.

## Safe local review

Open <http://127.0.0.1:3116/preview/bootstrap> on this computer. This is a labelled synthetic harness using the actual new Campaign and Adventure review components with scripted transports. It does not contact a provider or database. Refresh deliberately resets its synthetic scene; ordinary application drafts use exact pending-command recovery and a public review cache.

1. Choose the fantasy World, enter a Campaign title and Name, and paste the displayed wanderer example into **Who are you?**
2. Press **Prepare proposal with AI**. In this harness the result is scripted and free. Correct the Name or a capability manually, then create the protagonist.
3. Prepare an Evening Adventure asking for ordinary paid work for an unknown traveller. Review and save it.
4. Press **Start Adventure**, then explicitly prepare and review its public opening. Change the place name or NPC description if desired. Confirm and approve.
5. The harness opens a read-only Game preview. It does not run gameplay actions. Real authoritative observe/speak turns, duplicate replay and save/load are proven separately in disposable SQL integration tests.
6. Switch to Jupiter and/or Russian to review the same controls. For Jupiter, use the cargo-pilot example and ask to investigate an unresponsive supply shuttle. The public opening supplies an arrivals dock and coordinator; it does not invent the shuttle's fate or add fantasy equipment.

The preview's old Fighter creation and World-creation buttons are not implemented by its scripted transport. The ordinary application retains those existing paths; this preview provides two synthetic Worlds for this review.

## Screenshots and browser evidence

Actual production forms in the synthetic harness were checked at 1440×1000 and 390×844, in EN/RU. Manual name, capability and location corrections were exercised. Start approval was initially disabled until public confirmation. Each completed flow opened its read-only Game preview. Checked mobile reviews had document width 390 and viewport width 390; the browser error log was empty. These are browser viewport checks, not physical iPhone, hosted Supabase or live model-quality tests.

| View | Character review | Opening review | After approval |
| --- | --- | --- | --- |
| EN desktop, fantasy | [Character](docs/review/universal-bootstrap/en-desktop-character.jpg) | [Opening](docs/review/universal-bootstrap/en-desktop-opening.jpg) | [Game preview](docs/review/universal-bootstrap/en-desktop-game.jpg) |
| RU desktop, Jupiter | [Character](docs/review/universal-bootstrap/ru-desktop-character.jpg) | [Opening](docs/review/universal-bootstrap/ru-desktop-opening.jpg) | [Game preview](docs/review/universal-bootstrap/ru-desktop-game.jpg) |
| EN mobile, Jupiter | [Character](docs/review/universal-bootstrap/en-mobile-character.jpg) | [Opening](docs/review/universal-bootstrap/en-mobile-opening.jpg) | [Game preview](docs/review/universal-bootstrap/en-mobile-game.jpg) |
| RU mobile, fantasy | [Character](docs/review/universal-bootstrap/ru-mobile-character.jpg) | [Opening](docs/review/universal-bootstrap/ru-mobile-opening.jpg) | [Game preview](docs/review/universal-bootstrap/ru-mobile-game.jpg) |

## Boundaries and setup before real use

- Migration 31 is required for the ordinary application, but has **not** been applied to the owner's database. Real-local activation requires a separate approved backup/preflight/migration step. Migration 30 and its starter compatibility behavior are unchanged.
- Creation/opening use the existing `world.compose` Model Runtime task, configured server credentials, task budget and timeout. Unavailable/unsupported configuration fails; no fallback or live call was tested here.
- The bootstrap preserves one Campaign/Entity/WorldActor/Item/Storage/World Event/Memory/Save system. The writer validates immutable input, review, source versions, head/revision/epoch and Canon generation. No new record store or save system is introduced.
- An interrupted proposal reserves at most one dispatch. Recovery retrieves the existing result or reports the unconfirmed/failed attempt. A new paid proposal requires an explicit new action; a pending commit must be recovered with its exact original identity.
- Capabilities/limitations are descriptive. This does not add universal magic, combat, travel, currency, reward or progression mechanics. Unsupported durable consequences still pause through the accepted finite World Logic validators.
- Pack-backed Worlds retain explicit Pack preparation/pinning. This authoring slice uses their public World premise; it does not automatically instantiate or expose private/future Pack facts. Partly authored/advanced empty campaigns require their existing manual preparation path.
- No real database mutation, deployment, provider request, real Adventure or next feature lane occurred. Main remains unchanged. Stop for owner/supervisor review.

Fresh automated results and precise architecture notes: [verification report](UNIVERSAL_BOOTSTRAP_VERIFICATION.md).
