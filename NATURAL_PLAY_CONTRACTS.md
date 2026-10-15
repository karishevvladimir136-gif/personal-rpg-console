# Natural play closure — implementation contract

Starting candidate: `65dc99c105d86b2860d284d10846c450d20b3e2d`.
Isolated branch: `codex/natural-play-exhaustive-closure`.

This is a development contract, not an activation record. Owner/main remain unchanged.

## Authority

One Astra runtime remains `astra-primary-v1`. New operations may additionally pin a private `natural-v1` contract at durable begin. Missing historical pins preserve their original semantics. Migration 52 is the only authorized additive migration and is disposable-only.

Ephemeral public continuity belongs to bounded Scene metadata, not new Entity/Location rows. Subject references are server-derived public continuity identities, not gameplay record IDs. Materialization is private, append-only, lease/fence/revision-checked authority until final atomic commit. Its public records use the existing stores. No separate journal, reward ledger or World writes.

## Shared shapes

`SceneContinuityV1`: schemaVersion 1; parentLocationId (existing known current Location); locale (null or bounded name/description); subjects (maximum 12 public incidental subjects with id, kind npc/creature/place/item, name, description, originSceneId and originOperationId).

`NaturalMaterializationRequest`: subjectRef (existing selected public subject ID or `input:<exact literal public name>`); kind npc/creature/place/item; purpose job/trade/inventory/combat/party/track/recurring; ownerRef (null except trade Item, where it is an existing present NPC or prior materialization reference). Maximum three per response and eight per operation. No model IDs, stats, wealth, mechanics or hidden descriptions.

`NaturalBehavior`: actorId; stance accept/refuse/hesitate/deflect/leave/attack/offer_conditions; tone neutral/warm/firm/guarded/angry/fearful/tired; intensity 1/2/3. No free text/reason/secret. Maximum two, actual present NPCs only.

Natural responses extend the existing root with `materializations`; natural finals additionally have `continuity` and `behavior`. Public-unified narration additionally requires a nonempty `independentBeat`. Private-informed finals do not author public continuity: the public-safe narrator authors it. Existing root/schema stays unchanged for older operations.

## Promotion

Server derives IDs from operation + subject reference; established public capsule provides identity/description, exact input-only names receive a neutral description. Default mundane actor HP/max HP 8, attack 0, defense 10, skill 0, basic unarmed damage 2; zero currency. No species profile or model-authored power. Item default quantity one, no mechanics, bounded mundane category. NPC storage is standard merchant/companion authority; ground placement must use a genuine location-anchored standard storage extension, never pretend ground is a camp.

Promotion must be used by a real accepted durable trigger. Mere dialogue/offer/refusal creates nothing. Provisional target tools must execute the full existing five-kind authority and dice guards against an independently reconstructed virtual source. Public rows cannot survive a failed turn.

## SQL safety

Validate the original claim source, owner, operation, timeline, lease and revision before constructing a virtual projection. The projection may add only independently derived new rows/presence/routes; no existing HP/resources/time/state replacement. Creation and later mutations are disjoint; new public rows have server-owned revision 1. Existing commit/dice/effect guards must still execute. Never expose a generic guard-skip flag.

Any internal temporary projection must be restored before immutable save capture. Defer delegated autosave, restore original source, then use existing save authority. Successful replay returns the stored result before provisional insertion. Every error rolls back all public rows/config/Scene changes. Predecessor RPC execution revoked from public, anon, authenticated and service_role; internal SECURITY DEFINER delegation retained.

## Verification boundary

No owner queries/mutations or paid calls during implementation. HTTP tests must explicitly use a credential-free isolated preview via PREVIEW_URL; never default to owner port 3000. Offline acceptance and 200-turn soak precede at most ten synthetic text requests/$5. Runtime acceptance precedes separate UX commits.
