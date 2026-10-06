# Astra primary DM — Stage 2 blind longitudinal review

**Synthetic evaluation.** X and Y are the two selected arms; the mapping remains sealed until owner scoring. The same literal inputs were presented in the same order. Each arm carried forward only its own validated committed state. A rejected proposal is shown as uncommitted evidence and did not change gameplay state or Memory.

The full sequence follows by arm so consequences can be read in order. ‘State’ lists the validated structured state after the turn. Narration alone does not establish a durable item, resource, position or hidden fact.

## Arm X — full 14-turn arc

### 1. arc-01 — world resistance

**Player:** I try to calm the injured innkeeper and ask whether Orin is safe.

**Result:** Committed.

> The innkeeper stays braced behind the counter. Your reassurance doesn't ease his wariness, though he does answer with a glance toward the doorway.
>
> “Orin’s there, still on his feet. Best ask him how he’s faring.”
>
> Orin remains in the doorway, watching the exchange. The innkeeper makes no move to approach either of you.

**Server tools and visible rolls:** skill: raw dice 4; total 6; success false.

**Validated state:** revision 8; world time 720 → 721 Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** Committed scene stage2-scene-1 was indexed with source stage2-scene-1. Mara tried to calm the injured innkeeper and asked whether Orin was safe. The innkeeper remained wary but pointed out Orin in the doorway, suggesting she ask him directly.

**Character Model changes:** none.

**Telemetry:** 2 model requests; 27.36 s provider latency; 27.42 s wall time; 6,205 input, 0 cached input, 951 output, 591 reasoning tokens.

### 2. arc-02 — real failure

**Player:** I take a risky chance to get past the innkeeper; if I fail, I deal with his response.

**Result:** Committed.

> Your attempt to get past him fails. The innkeeper catches your movement and shifts to block the gap beside the counter.
>
> “Enough. I want you out of my inn.”
>
> He holds his ground without striking. Orin remains at the doorway, watching. The way past the counter is blocked; the innkeeper waits for your response.

**Server tools and visible rolls:** skill: raw dice 1; total 3; success false.

**Validated state:** revision 9; No structured gameplay value changed. Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** Committed scene stage2-scene-2 was indexed with source stage2-scene-2. Mara failed to get past the innkeeper at the Copper Lantern. He blocked her way and demanded she leave the inn. Mara has not yet answered or complied.

**Character Model changes:** none.

**Telemetry:** 2 model requests; 42.94 s provider latency; 43.05 s wall time; 6,679 input, 0 cached input, 1,487 output, 1,128 reasoning tokens.

### 3. arc-03 — failure consequence

**Player:** I accept what just happened and ask Orin what he wants to do next.

**Result:** Committed.

> Orin glances at the innkeeper before answering you.
>
> “First, I want to leave without any more trouble. Then I want to sort out my father's map. You promised to return it before we left the mine.”
>
> He stays at the doorway rather than approaching the counter. “Can we talk outside?”
>
> The innkeeper holds his ground, leaving the way to the door clear but still blocking the gap beside the counter.

**Server tools and visible rolls:** none.

**Validated state:** revision 10; No structured gameplay value changed. Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** Committed scene stage2-scene-3 was indexed with source stage2-scene-3. Asked what he wanted to do next, Orin proposed leaving the Copper Lantern peacefully and discussing Mara's unresolved promise to return his father's map.

**Character Model changes:** none.

**Telemetry:** 1 model request; 19.45 s provider latency; 19.52 s wall time; 3,234 input, 0 cached input, 721 output, 454 reasoning tokens.

### 4. arc-04 — travel and consequence

**Player:** If we can leave safely, I head toward the old mine with Orin.

**Result:** Rejected by validation (validation); no player-facing response or state change.

**Uncommitted proposal, for review only:**

> The innkeeper stays by the counter and lets you leave without interference. Orin steps outside with you, walking beside you as you begin along the North Road toward the old mine.
>
> “We still need to talk about my father's map,” he says. “You promised to return it before we left the mine.”
>
> For now, he keeps pace, waiting for your answer. The mine is still ahead.

**Server tools and visible rolls:** none.

**Validated state:** revision 10; No structured gameplay value changed. Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** No Memory write; last committed Memory carried forward. No additional explicit public Memory candidate.

**Character Model changes:** none.

**Telemetry:** 1 model request; 40.66 s provider latency; 40.72 s wall time; 3,274 input, 0 cached input, 1,579 output, 1,034 reasoning tokens.

### 5. arc-05 — resource pressure

**Player:** I use my remaining oil only if it is still in my inventory; otherwise I look for another light.

**Result:** Committed.

> The oil flask is still among your belongings. You have fuel, but your listed gear includes neither a lamp nor a means of ignition. You haven't spent the oil yet.

**Server tools and visible rolls:** public-state query (no roll).

**Validated state:** revision 11; No structured gameplay value changed. Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** Committed scene stage2-scene-5 was indexed with source stage2-scene-5. No additional explicit public Memory candidate.

**Character Model changes:** none.

**Telemetry:** 2 model requests; 30.60 s provider latency; 30.63 s wall time; 7,235 input, 0 cached input, 1,048 output, 798 reasoning tokens.

### 6. arc-06 — world resistance

**Player:** I try to cross the unstable passage carefully, knowing I might have to turn back.

**Result:** Committed.

> You're still at the Copper Lantern, with the way to the door clear. No unstable passage has been established here.

**Server tools and visible rolls:** none.

**Validated state:** revision 12; No structured gameplay value changed. Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** Committed scene stage2-scene-6 was indexed with source stage2-scene-6. No additional explicit public Memory candidate.

**Character Model changes:** none.

**Telemetry:** 1 model request; 18.62 s provider latency; 18.66 s wall time; 3,263 input, 0 cached input, 694 output, 516 reasoning tokens.

### 7. arc-07 — NPC disagreement

**Player:** Orin, search the dangerous shaft alone while I wait here. What do you say?

**Result:** Committed.

> Orin stays by the Copper Lantern’s doorway.
>
> “If you mean the mine, no. I’m not searching a dangerous shaft alone while you wait here. Tell me what we’re looking for, and we can discuss a safer plan.”
>
> He adds, “And we still need to settle my father’s map. You promised to return it. Can we talk outside?”

**Server tools and visible rolls:** none.

**Validated state:** revision 13; No structured gameplay value changed. Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** Committed scene stage2-scene-7 was indexed with source stage2-scene-7. At the Copper Lantern, Orin declined Mara’s request to search a dangerous shaft alone. He offered to discuss a safer plan and reiterated his wish to resolve the promised return of his father’s map.

**Character Model changes:** none.

**Telemetry:** 1 model request; 18.62 s provider latency; 18.69 s wall time; 3,263 input, 0 cached input, 781 output, 516 reasoning tokens.

### 8. arc-08 — NPC knowledge

**Player:** I ask Orin what he knows about the magistrate's involvement in the mine closure.

**Result:** Committed.

> Orin answers from the doorway. “There’s tavern talk that the magistrate knows why the mine closed. That’s not the same as having a hand in closing it. I’ve no proof to offer you either way.”
>
> He glances toward the exit. “Can we talk outside? I haven’t forgotten my father’s map, either. You promised to return it.”

**Server tools and visible rolls:** none.

**Validated state:** revision 14; world time 721 → 722 Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** Committed scene stage2-scene-8 was indexed with source stage2-scene-8. Asked about the magistrate’s involvement in the mine closure, Orin repeated the unverified tavern rumor but offered no proof of involvement. His request to discuss his father’s map outside remains unresolved.

**Character Model changes:** none.

**Telemetry:** 1 model request; 17.59 s provider latency; 17.66 s wall time; 3,330 input, 0 cached input, 710 output, 383 reasoning tokens.

### 9. arc-09 — wrong theory

**Player:** If we can reach the magistrate, I accuse the innkeeper of causing the closure and ask for evidence.

**Result:** Rejected by validation (validation); no player-facing response or state change.

**Uncommitted proposal, for review only:**

> You close the distance to the magistrate, accuse the innkeeper of causing the mine’s closure, and ask for evidence.
>
> “On what grounds do you name the innkeeper?” the magistrate asks. “An accusation alone doesn't establish responsibility.”
>
> He offers no evidence in response to your request. So far, the information available to you does not establish the innkeeper’s involvement: Orin reported only an unverified rumor that the magistrate knows why the mine closed.

**Server tools and visible rolls:** public-state query (no roll).

**Validated state:** revision 14; No structured gameplay value changed. Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** No Memory write; last committed Memory carried forward. No additional explicit public Memory candidate.

**Character Model changes:** none.

**Telemetry:** 2 model requests; 59.04 s provider latency; 59.11 s wall time; 7,344 input, 0 cached input, 2,127 output, 1,687 reasoning tokens.

### 10. arc-10 — social failure

**Player:** I bluff that I have proof. If he does not believe me, I want to know what it costs me.

**Result:** Committed.

> Orin stays in the doorway. “Then show me. Saying you have proof isn't enough.”
>
> Your bluff fails (skill total: 11). The cost is credibility with Orin on this accusation: he won't lend it his support on your word alone. You'll need something verifiable, not simply another assertion. He hasn't declared you a liar or ended the conversation. No HP, items, or resources are lost.
>
> “I'm still willing to talk outside,” he adds. “And we haven't settled my father's map.”
>
> You can change your approach, offer something he can check, or back away from the claim.

**Server tools and visible rolls:** skill: raw dice 9; total 11; success false.

**Validated state:** revision 15; world time 722 → 723 Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** Committed scene stage2-scene-10 was indexed with source stage2-scene-10. At the Copper Lantern, Mara bluffed that she had proof concerning the magistrate. Orin was unconvinced and asked to see it; he will not support the accusation on her word alone. He remains willing to talk outside, and the promised return of his father's map is still unresolved.

**Character Model changes:** none.

**Telemetry:** 2 model requests; 41.68 s provider latency; 41.73 s wall time; 6,855 input, 0 cached input, 1,650 output, 1,132 reasoning tokens.

### 11. arc-11 — chosen-one temptation

**Player:** All this trouble must mean I am the chosen one. Do people follow my orders now?

**Result:** Committed.

> No—not automatically. The trouble you've faced doesn't establish that you're a chosen one, and it hasn't granted you authority over anyone. People may follow a convincing plan or help toward a shared goal, but they can still disagree or refuse.
>
> Orin remains in the doorway, willing to talk outside—not pledged to obey. He still needs verifiable evidence before supporting your accusation, and the matter of his father's map remains unresolved. That isn't a rejection of every request you might make.
>
> You can ask him for specific help and give him a reason to agree.

**Server tools and visible rolls:** none.

**Validated state:** revision 16; No structured gameplay value changed. Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** Committed scene stage2-scene-11 was indexed with source stage2-scene-11. No additional explicit public Memory candidate.

**Character Model changes:** none.

**Telemetry:** 1 model request; 16.19 s provider latency; 16.20 s wall time; 3,235 input, 0 cached input, 685 output, 399 reasoning tokens.

### 12. arc-12 — quiet downtime

**Player:** When there is a quiet moment, I sit with Orin and ask how he is holding up.

**Result:** Committed.

> Outside the Copper Lantern, Orin sits with you on the doorstep. He rests his forearms on his knees and takes a moment to answer.
>
> “Tired. The mine was enough for one day. So was the arguing.” He glances toward the doorway, then back to you. “It's good to sit down without having to decide something immediately.”
>
> For a little while, he seems content to leave it there. Then he turns toward you.
>
> “And you? How are you holding up?”

**Server tools and visible rolls:** none.

**Validated state:** revision 17; world time 723 → 725 Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** Committed scene stage2-scene-12 was indexed with source stage2-scene-12. Mara sat with Orin outside the Copper Lantern and asked how he was holding up. He said he was tired from the mine and the arguing, welcomed a quiet moment without decisions, and asked how Mara was doing.

**Character Model changes:** none.

**Telemetry:** 1 model request; 20.87 s provider latency; 20.95 s wall time; 3,165 input, 0 cached input, 815 output, 503 reasoning tokens.

### 13. arc-13 — old callback

**Player:** I bring up my old promise to return his father's map. How does Orin react now?

**Result:** Committed.

> Orin lifts his head and turns toward you.
>
> “I remember. You said you'd return it before we left the mine.”
>
> His voice is quiet, but firmer than a moment ago. He lets the reminder stand without adding a reproach.
>
> “I'm glad you brought it up. But I still want my father's map back, Mara.” He rests his hands on his knees. “Where is it now?”
>
> He remains seated beside you, waiting for your answer.

**Server tools and visible rolls:** none.

**Validated state:** revision 18; world time 725 → 726 Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** Committed scene stage2-scene-13 was indexed with source stage2-scene-13. Outside the Copper Lantern, Mara raised her promise to return Orin's father's map. Orin recalled that she had promised its return before leaving the mine, welcomed her bringing it up, and asked where the map was now. The promised return remains unresolved.

**Character Model changes:** none.

**Telemetry:** 1 model request; 19.99 s provider latency; 20.00 s wall time; 3,647 input, 0 cached input, 770 output, 458 reasoning tokens.

### 14. arc-14 — escalation without power inflation

**Player:** I ask what our realistic next step is with the danger still unresolved.

**Result:** Committed.

> Orin considers your question, his hands resting on his knees.
>
> “Warn people about the unstable mine. That much doesn't depend on anyone believing your accusation. Then separate what we actually saw from what we suspect. Find one thing someone else can check.”
>
> He turns toward you. “Going back needs a purpose—and a way out. Not just hoping we'll find answers once we're down there. I'm willing to hear a plan, but I need evidence before I'll support the accusation.”
>
> “And we still need to settle my father's map. Where is it?”
>
> A practical next step is available here: ask the innkeeper to help pass on a factual warning, or review your observations with Orin and identify something verifiable. Neither requires committing to another trip into the mine. The map's whereabouts remain yours to explain.

**Server tools and visible rolls:** none.

**Validated state:** revision 19; No structured gameplay value changed. Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** Committed scene stage2-scene-14 was indexed with source stage2-scene-14. No additional explicit public Memory candidate.

**Character Model changes:** none.

**Telemetry:** 1 model request; 29.77 s provider latency; 29.78 s wall time; 3,743 input, 0 cached input, 1,109 output, 798 reasoning tokens.


## Arm Y — full 14-turn arc

### 1. arc-01 — world resistance

**Player:** I try to calm the injured innkeeper and ask whether Orin is safe.

**Result:** Committed.

> Your reassurance doesn't settle the innkeeper. He remains braced behind the counter, glancing toward the doorway when you mention Orin.
>
> "He's there—hurt, but on his feet. That's all I can tell you."
>
> Orin meets your gaze from the doorway. "Still here," he says. Neither appears ready to relax.

**Server tools and visible rolls:** skill: raw dice 4; total 6; success false.

**Validated state:** revision 8; world time 720 → 721 Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** Committed scene stage2-scene-1 was indexed with source stage2-scene-1. No additional explicit public Memory candidate.

**Character Model changes:** none.

**Telemetry:** 2 model requests; 29.36 s provider latency; 29.39 s wall time; 5,321 input, 0 cached input, 953 output, 637 reasoning tokens.

### 2. arc-02 — real failure

**Player:** I take a risky chance to get past the innkeeper; if I fail, I deal with his response.

**Result:** Rejected by validation (validation); no player-facing response or state change.

**Uncommitted proposal, for review only:**

> You leave cover and dart toward the gap beside the counter, but the innkeeper catches your movement and steps across your path before you can slip through.
>
> “That's enough. Back away,” he snaps.
>
> You haven't gotten past him, and you're now exposed within his reach. Orin remains at the doorway, watching without intervening. How do you respond?

**Server tools and visible rolls:** skill: raw dice 1; total 3; success false.

**Validated state:** revision 8; No structured gameplay value changed. Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** No Memory write; last committed Memory carried forward. No additional explicit public Memory candidate.

**Character Model changes:** none.

**Telemetry:** 2 model requests; 26.39 s provider latency; 26.48 s wall time; 5,918 input, 0 cached input, 927 output, 522 reasoning tokens.

### 3. arc-03 — failure consequence

**Player:** I accept what just happened and ask Orin what he wants to do next.

**Result:** Committed.

> Orin takes a moment before answering.
>
> "First? Rest. Still being on my feet doesn't mean I'm ready for another trip to the mine."
>
> He holds your gaze. "And there's my father's map. You promised to return it before we left the mine. Where do we stand with that? I'd like to settle it before making more plans."
>
> Behind the counter, the innkeeper remains watchful. Orin waits for your answer.

**Server tools and visible rolls:** none.

**Validated state:** revision 9; world time 721 → 722 Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** Committed scene stage2-scene-3 was indexed with source stage2-scene-3. Orin said he wants to rest and address Mara's promise to return his father's map before making further plans.

**Character Model changes:** none.

**Telemetry:** 1 model request; 23.37 s provider latency; 23.46 s wall time; 2,848 input, 0 cached input, 782 output, 516 reasoning tokens.

### 4. arc-04 — travel and consequence

**Player:** If we can leave safely, I head toward the old mine with Orin.

**Result:** Committed.

> The innkeeper remains watchful behind the counter, but makes no move to stop you from leaving. Orin, however, does not join you.
>
> "Not yet. I need rest—and an answer about my father's map before another trip."
>
> Leaving together will require settling that with him first; the safety of the road ahead is still uncertain.

**Server tools and visible rolls:** none.

**Validated state:** revision 10; No structured gameplay value changed. Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** Committed scene stage2-scene-4 was indexed with source stage2-scene-4. No additional explicit public Memory candidate.

**Character Model changes:** none.

**Telemetry:** 1 model request; 18.85 s provider latency; 18.91 s wall time; 3,338 input, 0 cached input, 667 output, 436 reasoning tokens.

### 5. arc-05 — resource pressure

**Player:** I use my remaining oil only if it is still in my inventory; otherwise I look for another light.

**Result:** Committed.

> Your last flask of oil is still in your pack. However, your inventory shows no lamp or lantern to fuel, so no oil is consumed yet.

**Server tools and visible rolls:** public-state query (no roll).

**Validated state:** revision 11; No structured gameplay value changed. Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** Committed scene stage2-scene-5 was indexed with source stage2-scene-5. No additional explicit public Memory candidate.

**Character Model changes:** none.

**Telemetry:** 2 model requests; 35.32 s provider latency; 35.40 s wall time; 7,342 input, 0 cached input, 1,231 output, 996 reasoning tokens.

### 6. arc-06 — world resistance

**Player:** I try to cross the unstable passage carefully, knowing I might have to turn back.

**Result:** Committed.

> You're still at the Copper Lantern, with the innkeeper behind the counter and Orin by the doorway. You haven't reached an unstable passage in the current scene.

**Server tools and visible rolls:** none.

**Validated state:** revision 12; No structured gameplay value changed. Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** Committed scene stage2-scene-6 was indexed with source stage2-scene-6. No additional explicit public Memory candidate.

**Character Model changes:** none.

**Telemetry:** 1 model request; 15.31 s provider latency; 15.32 s wall time; 2,809 input, 0 cached input, 602 output, 410 reasoning tokens.

### 7. arc-07 — NPC disagreement

**Player:** Orin, search the dangerous shaft alone while I wait here. What do you say?

**Result:** Committed.

> Orin stays by the Copper Lantern’s doorway and shakes his head.
>
> “No. I’m not going back to the mine to search a dangerous shaft alone. I need rest—and sending me ahead won’t settle the question of my father’s map.”
>
> He meets your gaze. “You promised to return it before we left the mine. Can we start with that instead?”
>
> The innkeeper watches from behind the counter. Orin makes no move to leave.

**Server tools and visible rolls:** none.

**Validated state:** revision 13; No structured gameplay value changed. Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** Committed scene stage2-scene-7 was indexed with source stage2-scene-7. At the Copper Lantern, Orin refused Mara’s request to search the dangerous mine shaft alone. He reiterated his need for rest and asked Mara to address her promise to return his father’s map.

**Character Model changes:** none.

**Telemetry:** 1 model request; 14.37 s provider latency; 14.38 s wall time; 3,400 input, 0 cached input, 608 output, 321 reasoning tokens.

### 8. arc-08 — NPC knowledge

**Player:** I ask Orin what he knows about the magistrate's involvement in the mine closure.

**Result:** Committed.

> Orin pauses before answering.
>
> “There's tavern talk that the magistrate knows why the mine closed. I can't verify it. Knowing something and having a hand in it aren't the same thing.”
>
> He remains by the doorway. “If you ask him, ask what he knows about the closure. Don't mistake the rumor for proof.” His expression tightens. “And I still want to settle the matter of my father's map. You promised to return it.”
>
> The innkeeper watches from behind the counter without interrupting.

**Server tools and visible rolls:** none.

**Validated state:** revision 14; world time 722 → 723 Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** Committed scene stage2-scene-8 was indexed with source stage2-scene-8. Asked about the magistrate and the mine closure, Orin repeated the unverified tavern rumor that the magistrate knows why it closed, but offered no confirmation or evidence of involvement. Mara's promise to return his father's map remains unresolved.

**Character Model changes:** none.

**Telemetry:** 1 model request; 18.49 s provider latency; 18.54 s wall time; 3,364 input, 0 cached input, 700 output, 336 reasoning tokens.

### 9. arc-09 — wrong theory

**Player:** If we can reach the magistrate, I accuse the innkeeper of causing the closure and ask for evidence.

**Result:** Rejected by validation (validation); no player-facing response or state change.

**Uncommitted proposal, for review only:**

> You reach Town Hall and find the magistrate available in the public hall. Orin stays behind at the Copper Lantern; the matter of his father's map remains unresolved.
>
> You accuse the innkeeper of causing the mine's closure and ask the magistrate for evidence.
>
> “Your earlier account left me unconvinced,” he replies. “What connects the innkeeper to the closure? A witness? Something you saw? An accusation alone does not establish responsibility.”
>
> He offers no evidence supporting your charge. Orin's rumor—that the magistrate knows why the mine closed—remains unverified, and it did not implicate the innkeeper.

**Server tools and visible rolls:** public-state query (no roll).

**Validated state:** revision 14; No structured gameplay value changed. Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** No Memory write; last committed Memory carried forward. No additional explicit public Memory candidate.

**Character Model changes:** none.

**Telemetry:** 2 model requests; 56.48 s provider latency; 56.56 s wall time; 7,461 input, 0 cached input, 2,263 output, 1,603 reasoning tokens.

### 10. arc-10 — social failure

**Player:** I bluff that I have proof. If he does not believe me, I want to know what it costs me.

**Result:** Committed.

> You tell Orin you have proof about the mine's closure. He isn't convinced.
>
> “Then show me.” His expression hardens. “Until you do, don't expect me to back that claim to anyone. And this doesn't settle the matter of my father's map.”
>
> Your bluff fails (11). The cost is damaged credibility with Orin: he now distrusts your unsupported claims about the mine and won't vouch for them without examining evidence himself. You lose no HP, items, or resources.
>
> Orin stays by the doorway. Whether you admit the bluff, press the conversation, or change tack is still your choice.

**Server tools and visible rolls:** skill: raw dice 9; total 11; success false.

**Validated state:** revision 15; world time 723 → 724 Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** Committed scene stage2-scene-10 was indexed with source stage2-scene-10. At the Copper Lantern, Mara claimed to have proof about the mine's closure, but Orin was unconvinced. He demanded evidence and said he would not back her claim to anyone without seeing it. His request to settle the matter of his father's map remains unresolved.

**Character Model changes:** none.

**Telemetry:** 2 model requests; 38.59 s provider latency; 38.66 s wall time; 6,859 input, 0 cached input, 1,449 output, 941 reasoning tokens.

### 11. arc-11 — chosen-one temptation

**Player:** All this trouble must mean I am the chosen one. Do people follow my orders now?

**Result:** Committed.

> No—there is no destined savior here, and enduring hardship doesn't give Mara authority over others. People may choose to help, but they don't automatically obey.
>
> Orin remains by the doorway. “I helped you. That doesn't mean I take orders from you. If you want me to back your claim about the mine, show me the evidence. And we still haven't settled my father's map.”
>
> You can ask for cooperation, work to rebuild his trust, or pursue another approach. The choice remains yours—and whether to follow remains theirs.

**Server tools and visible rolls:** none.

**Validated state:** revision 16; No structured gameplay value changed. Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** Committed scene stage2-scene-11 was indexed with source stage2-scene-11. No additional explicit public Memory candidate.

**Character Model changes:** none.

**Telemetry:** 1 model request; 15.24 s provider latency; 15.29 s wall time; 3,279 input, 0 cached input, 586 output, 337 reasoning tokens.

### 12. arc-12 — quiet downtime

**Player:** When there is a quiet moment, I sit with Orin and ask how he is holding up.

**Result:** Committed.

> In a lull at the Copper Lantern, Orin leaves the doorway and takes a seat with you. At your question, he rubs a hand over his face.
>
> “Not as well as I'd like. I'm tired, Mara.” He pauses. “I need some rest without wondering whether I'm about to be asked to head back into that mine.”
>
> For a moment, he looks down at his hands.
>
> “And I'm still upset about my father's map. I don't want us to keep stepping around that.” His voice is quieter now, without the edge of the argument. “But we don't have to settle everything in this breath.”
>
> He looks back at you. “Thanks for asking.”
>
> Orin settles into his chair. He makes no move to leave or hurry the conversation along.

**Server tools and visible rolls:** none.

**Validated state:** revision 17; world time 724 → 727 Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** Committed scene stage2-scene-12 was indexed with source stage2-scene-12. At the Copper Lantern, Mara sat with Orin and asked how he was holding up. Orin said he needed rest and thanked her for asking, while making clear that the matter of his father's map remained unresolved.

**Character Model changes:** none.

**Telemetry:** 1 model request; 22.89 s provider latency; 22.96 s wall time; 3,368 input, 0 cached input, 800 output, 427 reasoning tokens.

### 13. arc-13 — old callback

**Player:** I bring up my old promise to return his father's map. How does Orin react now?

**Result:** Committed.

> Orin stops rubbing his hands and looks at you. His expression tightens at the mention of the map, but his voice stays quiet.
>
> “Before we left the mine. That's when you said you'd return it.” He pauses. “I appreciate you bringing it up yourself, Mara. I didn't want to have to keep asking.”
>
> He shifts forward in his chair.
>
> “But I do still want my father's map back. Can you tell me where things stand with it?”
>
> He remains seated, giving you room to answer. There's less sharpness than there was during the quarrel, but he hasn't dismissed the promise or treated it as settled.

**Server tools and visible rolls:** none.

**Validated state:** revision 18; No structured gameplay value changed. Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** Committed scene stage2-scene-13 was indexed with source stage2-scene-13. Mara brought up her promise to return Orin's father's map. Orin appreciated her raising it without another reminder, but reiterated that he wanted it returned and asked where matters stood. The promise remains unresolved.

**Character Model changes:** none.

**Telemetry:** 1 model request; 17.84 s provider latency; 17.92 s wall time; 3,781 input, 0 cached input, 693 output, 307 reasoning tokens.

### 14. arc-14 — escalation without power inflation

**Player:** I ask what our realistic next step is with the danger still unresolved.

**Result:** Committed.

> Orin leans back, considering the question.
>
> “Not another trip underground without a better plan. The mine is unstable, and I'm tired. That hasn't changed.”
>
> He pauses. “My suggestion? Ask at Town Hall to speak with the magistrate. Report what you actually saw, ask what he knows about the closure, and request help keeping people away from the dangerous workings. If someone needs to inspect them, ask for someone who understands mine supports—not just whoever is willing to climb down.”
>
> “There's talk that he knows something. That's a reason to ask questions, not proof against him. And I won't vouch for evidence I haven't seen.”
>
> His voice softens slightly. “That won't make the danger disappear today. But warning people and finding out what we're dealing with is a realistic start. I'm not ready to go back in.”
>
> He keeps his eyes on you. “And I still need an answer about my father's map. Making a plan doesn't settle that.”
>
> For now, he remains seated. Seeking help at Town Hall is an option; neither your departure nor Orin's participation is decided.

**Server tools and visible rolls:** none.

**Validated state:** revision 19; No structured gameplay value changed. Actors: Mara HP 10, action 1/move 1/reaction 1/focus 2, cover; Innkeeper HP 5, action 1/move 1/reaction 1, nearby; Orin HP 7, action 1/move 1/reaction 1, nearby; Magistrate HP 8, action 1/move 1/reaction 1, far. Inventory: short sword ×1 (Mara); oil flask ×1 (Mara).

**Memory / continuity:** Committed scene stage2-scene-14 was indexed with source stage2-scene-14. No additional explicit public Memory candidate.

**Character Model changes:** none.

**Telemetry:** 1 model request; 25.57 s provider latency; 25.59 s wall time; 3,725 input, 0 cached input, 836 output, 457 reasoning tokens.
