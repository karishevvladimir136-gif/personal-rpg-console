# 2D Rendering Direction — future product reference

September 19, 2026. **Product direction only; no renderer implementation is authorized by this document.** This records the owner's intended first visual gameplay target after the backend and Phase 4 asset foundation. It must not narrow the permanent Text RPG mode or force a single art style.

## Core idea

The first 2D game layer should feel closer to **Fabled Lands exploration + Sorcery! encounters/combat**, enhanced by the existing unrestricted AI DM. It is not trying to be Skyrim, GTA, a seamless simulation, or a mandatory replacement for text play.

The same authoritative campaign may be viewed as Text, future 2D Live presentation, or optional EXPLORE. Rendering never decides canon/state.

## Interaction references, not art prescriptions

| Reference | Borrowed product idea |
| --- | --- |
| Everweave | polished AI-RPG presentation and cinematic narrative framing |
| Sorcery! | gamebook flow, checks and compact readable combat/events |
| Duskpunk | dialogue/check/RPG presentation |
| Quest for Infamy | local 2D scene presence and interaction |
| Fabled Lands | open exploration and world/region/town/local hierarchy |
| Sunless Sea | atmospheric travel, discoveries and encounters |
| Sunless Skies | region traversal, POIs and environmental presentation |

Do not copy proprietary assets/UI. The renderer itself must be style-agnostic: pixel, painterly, illustrated, graphic-novel or another campaign style can all sit on the same semantics.

## Systemic references, not visual references

**Terra Randoma** and **Approaching Infinity** are additional systemic references. Their graphics are not targets. Use them for procedural world density, travel incidents, settlement/faction state, hidden discoveries, selective simulation and multi-scale abstraction. Detailed lessons live in [Systemic World References](SYSTEMIC_WORLD_REFERENCES.md).

Especially important: a world/region/town/local view does not need physically continuous scale. A future renderer may deliberately abstract distance/time between presentation scales while authoritative Location relationships and consequences remain exact.

## Minimal gameplay loop

Example:

1. Player: “We drive to Chicago.”
2. Region/world map displays the validated route and moves the current vehicle marker along it as presentation.
3. Bounded travel events/discoveries may surface from World Engine state.
4. Player notices a town or receives a hook and says: “Forget Chicago, let's stop there.”
5. Backend creates/reuses the stable Location and its public overview; renderer shows a town map/graph with only known districts/POIs.
6. Player chooses the market; a local 2D scene appears.
7. Dialogue, checks, combat or free-form actions use the normal DM/rules pipeline.
8. Player may return to Text at any point without losing capability or state.

Maps may be beautiful generated/assembled presentations, but connectivity and facts come from authoritative location/POI records rather than pixels.

## POIs make freedom interesting

A generative open world risks becoming unlimited but empty. Each meaningful area may therefore have a bounded pool of potential Adventure Hooks: places, rumors, people, activities, mysteries or dangers that make exploration attractive without forcing objectives.

A new town might privately contain seeds for an old cemetery, abandoned bank vault, sealed mine, strange house or travelling collector. The player sees only what their character can know. Public geography can appear immediately; an NPC rumor may reveal the mine; direct observation may reveal strange lights; later evidence can enrich the same POI.

Do not equate POI with quest. Some become short scenes, treasures, NPCs, dungeons, traps, atmosphere, major arcs or nothing important. Do not reveal which is which in advance.

## Map marker visibility

The 2D renderer must not impose a single philosophy about quest markers. Campaign/player presentation supports **Off / Tracked Only / Standard / All Known** marker visibility. All modes use the same underlying discovered/known state; only presentation changes. “All Known” is intentionally convenient and may show every known quest objective/POI/lead/rumor marker, while “Off” removes automatic markers entirely. Neither mode reveals latent DM-private hooks or undiscovered facts. Manual pins/current destination remain separately useful.

## Chat with DM as the campaign director control

The owner can later say naturally:

- “This area is boring; seed more adventures.”
- “More mysteries and weird places, fewer generic bandits.”
- “Give me several grounded detective hooks.”
- “Add some dangerous places I probably shouldn't enter yet.”
- “Put five interesting opportunities within a day's travel; make one potentially much larger, but don't tell me which.”

This creates a bounded authoring operation that seeds latent private hooks/Threads. It does not immediately reveal them, push ten quests into the journal or advance time. Discovery remains in-world.

## Lazy generation

Do not prebuild every street/interior/quest. Create detail at the scale currently needed and persist meaningful accepted results:

world/region → town overview → district → local scene → interior/sub-location.

A place can exist structurally before visual assets for all children exist. If the player never visits the abandoned foundry, its detailed scene need not be generated.

## First combat target

Keep the first combat layer compact and legible rather than tactical-grid heavy. Use Sorcery!-style presentation as inspiration, with visible checks/dice/resources as appropriate and free-form action always available. Buttons are conveniences, not the action vocabulary.

## Later visual life and mutations

Polish can add parallax, weather, lighting, particles, idle animation, camera movement and richer character/object assets. After the basic renderer is stable, validated world changes may be visualized through state swaps, decals/effects, reusable variants, bounded local AI edits or rare scene recomposition.

The rule stays simple: **DM/rules decide what happened; authoritative state remembers it; renderer shows it.** Pixels never decide what happened.
