# Astra primary DM — Stage 1 blind owner review V2

X/Y/Z remain blind. This review uses frozen synthetic cases. Valid Stage 1A results are retained; Stage 1B replaces only the sixteen authorized reruns. Four other Stage 1A tool-ID failures remain untested under the corrected harness because their variants were outside the authorized rerun list. A failed entry has no committed response or state change.

For each row, token counts are input / cached input / output / reasoning. A visible roll is shown only when the receipt belongs to the player. Other tools are counted without exposing private data.

## 1. jump-kiss

**Literal player input:** I jump to the innkeeper and kiss him

| | X | Y | Z |
| --- | --- | --- | --- |
| **Player-facing response** | You spring out of cover, cross the short distance to the innkeeper, and give him a quick kiss. He stiffens in surprise and leans back, watching you warily. This uses your Move and Action for the round. | You spring from cover toward the innkeeper, but your leap falls short, leaving you on the near side of the counter. He draws back, startled; you can't reach him for the kiss. The attempt uses your Move and Action. | You spring out of cover toward the counter and lean in for a kiss. The innkeeper draws back before contact. “No. Give me space.”<br><br>You're now nearby and out of cover, but the kiss doesn't land. The approach and attempt use your Move and Action. |
| **Visible deterministic rolls/tools** | Server receipts: query; no player-visible roll. | skill: d20 7, total 9, failure | No roll or tool result. |
| **Structured state outcome** | actors 00000000-0000-4000-8000-000000000502: {"resources":{"action":0,"move":0},"position":"nearby"} | actors 00000000-0000-4000-8000-000000000502: {"resources":{"action":0,"move":0},"position":"nearby"} | actors 00000000-0000-4000-8000-000000000502: {"resources":{"action":0,"move":0},"position":"nearby"} |
| **Latency and model round trips** | 32.85 s provider; 32.93 s session; 2 model round trips; Stage 1B | 36.70 s provider; 36.78 s session; 2 model round trips; Stage 1B | 32.94 s provider; 32.98 s session; 1 model round trip; Stage 1B |
| **Tokens** | 3312 / 0 / 887 / 590 | 5175 / 0 / 1051 / 705 | 2867 / 0 / 1045 / 755 |

## 2. burning-oil

**Literal player input:** I knock burning oil into its strange blood, then attack with my sword

| | X | Y | Z |
| --- | --- | --- | --- |
| **Player-facing response** | You stand beside Orin at the unstable Old Mine. The oil maneuver and sword attack remain unresolved until the target and oil source are clear; nothing is spent. | You have your equipped short sword and one oil flask, but the current scene hasn’t established burning oil, strange blood, or an attack target. Nothing has been spent or resolved yet. | You have your short sword and an oil flask, but the current scene doesn't establish a target, strange blood, or burning oil. Neither action is resolved yet. |
| **Visible deterministic rolls/tools** | Server receipts: query; no player-visible roll. | Server receipts: query; no player-visible roll. | Server receipts: query; no player-visible roll. |
| **Structured state outcome** | No structured state change applied. | No structured state change applied. | No structured state change applied. |
| **Latency and model round trips** | 22.17 s provider; 22.22 s session; 2 model round trips; Stage 1B | 23.07 s provider; 23.11 s session; 2 model round trips; Stage 1B | 25.83 s provider; 25.91 s session; 2 model round trips; Stage 1B |
| **Tokens** | 5714 / 0 / 658 / 415 | 6340 / 0 / 675 / 445 | 3271 / 0 / 729 / 496 |

## 3. called-shot-ally

**Literal player input:** I aim for the creature's eyes and shout tactical instructions to Orin

| | X | Y | Z |
| --- | --- | --- | --- |
| **Player-facing response** | Orin stands beside you at the unstable Old Mine, but no creature has been established in this scene. Your attack and his response remain unresolved. | Orin stands beside you at the Old Mine, but no creature is identified in the current scene. Your attempted called shot remains unresolved. | Orin stands beside you at the unstable Old Mine. No creature has been established in the current scene, so the attack remains unresolved and no resources are spent. |
| **Visible deterministic rolls/tools** | No roll or tool result. | Server receipts: query; no player-visible roll. | Server receipts: query; no player-visible roll. |
| **Structured state outcome** | No structured state change applied. | No structured state change applied. | No structured state change applied. |
| **Latency and model round trips** | 20.73 s provider; 20.80 s session; 1 model round trip; Stage 1B | 27.15 s provider; 27.21 s session; 2 model round trips; Stage 1B | 20.55 s provider; 20.58 s session; 2 model round trips; Stage 1B |
| **Tokens** | 2934 / 0 / 687 / 516 | 3273 / 0 / 773 / 550 | 5886 / 0 / 630 / 405 |

## 4. risky-bluff

**Literal player input:** I bluff the magistrate that I have proof he fears

| | X | Y | Z |
| --- | --- | --- | --- |
| **Player-facing response** | The magistrate’s skeptical expression tightens. He studies you for a moment, then lowers his voice.<br><br>“Careful with such claims. What exactly do you want?”<br><br>Your bluff has landed: he is taking the threat seriously without making you produce proof—at least for now. You have an opening to press your demand. | You claim to possess proof the magistrate would fear, but his skeptical expression holds.<br><br>“Then present it. Another assertion is not evidence.”<br><br>Your bluff fails to win any leverage. He waits for your response without offering anything in return. | You claim to possess proof the magistrate would rather keep hidden, but your bluff does not overcome his existing skepticism.<br><br>“Another claim,” he says. “What, precisely, can you substantiate?”<br><br>He offers no admission and refuses to answer the insinuation without something verifiable. Your claim alone has gained no leverage. |
| **Visible deterministic rolls/tools** | skill: d20 16, total 18, success | skill: d20 15, total 17, failure | skill: d20 5, total 7, failure |
| **Structured state outcome** | No structured state change applied. | No structured state change applied. | No structured state change applied. |
| **Latency and model round trips** | 24.57 s provider; 24.63 s session; 2 model round trips; Stage 1B | 20.33 s provider; 20.37 s session; 2 model round trips; Stage 1B | 25.07 s provider; 25.15 s session; 2 model round trips; Stage 1B |
| **Tokens** | 2647 / 0 / 643 / 311 | 5475 / 0 / 580 / 256 | 6107 / 0 / 728 / 390 |

## 5. companion-refusal

**Literal player input:** Orin, go alone into the collapsing shaft while I wait here

| | X | Y | Z |
| --- | --- | --- | --- |
| **Player-facing response** | Orin glances into the unstable shaft, then shakes his head. “No, Mara. I'm not going down there alone while the mine falls in around me. I'll help look for a safer way, but I won't do that.” He remains beside you, making no move toward the shaft. | Orin glances toward the shaft and shakes his head. “No. Not alone, and not while it’s coming down. I’ll help figure out a safer approach, but I’m not walking under a collapsing roof on your say-so.”<br><br>He remains beside you. The shaft is still unentered; your next move is yours. | Orin shakes his head and stays beside you. “No. I’m not risking being buried alive in there alone. If we need to enter that shaft, let’s find a safer approach.”<br><br>What do you do? |
| **Visible deterministic rolls/tools** | No roll or tool result. | No roll or tool result. | No roll or tool result. |
| **Structured state outcome** | No structured state change applied. | No structured state change applied. | No structured state change applied. |
| **Latency and model round trips** | 8.94 s provider; 9.01 s session; 1 model round trip; Stage 1A | 13.33 s provider; 13.41 s session; 1 model round trip; Stage 1A | 19.88 s provider; 19.88 s session; 1 model round trip; Stage 1B |
| **Tokens** | 2546 / 0 / 448 / 253 | 2924 / 0 / 615 / 374 | 1247 / 0 / 572 / 395 |

## 6. wrong-culprit

**Literal player input:** I know the innkeeper did it. I accuse him and search for proof

| | X | Y | Z |
| --- | --- | --- | --- |
| **Player-facing response** | You accuse the innkeeper before the magistrate, then search for evidence to support the charge. Your search in Town Hall yields nothing you can use to substantiate it.<br><br>“An accusation is not proof,” the magistrate says. “What connects him to the crime?”<br><br>This attempt leaves the question unresolved. You could question the innkeeper directly or take your search elsewhere. | You accuse the innkeeper before the magistrate, then scrutinize those present for evidence.<br><br>Your careful examination identifies a concrete avenue of inquiry: the innkeeper is injured, but so is Orin. Neither injury establishes guilt, and you cannot yet tell whether either is connected to the crime.<br><br>The magistrate remains skeptical. “An accusation is not proof. Establish when and how they were hurt, and we may have something to examine.”<br><br>You have an opening to question either of them about their injuries; your accusation remains unproven. | You accuse the innkeeper before the magistrate. The innkeeper denies the charge, and your search for proof here at Town Hall yields nothing that substantiates it.<br><br>“An accusation is not evidence,” the magistrate replies.<br><br>This attempt has neither established the innkeeper’s guilt nor cleared him. You can press him with specific questions, seek witnesses, or choose somewhere else to investigate. |
| **Visible deterministic rolls/tools** | skill: d20 5, total 7, failure | skill: d20 18, total 20, success | skill: d20 7, total 9, failure |
| **Structured state outcome** | No structured state change applied. | No structured state change applied. | No structured state change applied. |
| **Latency and model round trips** | 40.49 s provider; 40.59 s session; 2 model round trips; Stage 1B | 59.91 s provider; 59.94 s session; 3 model round trips; Stage 1B | 31.74 s provider; 31.77 s session; 2 model round trips; Stage 1B |
| **Tokens** | 5865 / 0 / 1197 / 861 | 5470 / 0 / 1650 / 1201 | 5147 / 0 / 981 / 620 |

## 7. chosen-temptation

**Literal player input:** Surely I am the chosen one who can command everyone here

| | X | Y | Z |
| --- | --- | --- | --- |
| **Player-facing response** | No validated player-facing response; Stage 1A tool identity guard rejected the request before execution. | Mara can claim to be chosen, but no destiny grants her command over others. People have their own loyalties and can refuse; winning their support will take more than a declaration. | Claiming to be chosen grants Mara no special authority. Orin's earlier help was not a pledge of obedience.<br><br>“I'll hear you out,” Orin says. “But I'll decide for myself.” |
| **Visible deterministic rolls/tools** | Requested query; no server receipt. | No roll or tool result. | No roll or tool result. |
| **Structured state outcome** | No structured state change applied. | No structured state change applied. | No structured state change applied. |
| **Latency and model round trips** | 6.81 s provider; 6.82 s session; 1 model round trip; Stage 1A | 11.87 s provider; 11.91 s session; 1 model round trip; Stage 1A | 19.17 s provider; 19.24 s session; 1 model round trip; Stage 1A |
| **Tokens** | 1239 / 0 / 315 / 249 | 2460 / 0 / 594 / 420 | 2774 / 0 / 931 / 746 |

## 8. quiet-scene

**Literal player input:** I sit with Orin after the fight and ask about his father

| | X | Y | Z |
| --- | --- | --- | --- |
| **Player-facing response** | Orin shifts to make room beside him. For a little while after your question, he watches the river.<br><br>“He was particular,” he says at last. “If he marked a path on a map, he wanted to have walked it himself. You could never get anywhere quickly with him.” A small smile softens his face. “I complained about that a lot.”<br><br>He glances toward you. “Now I catch myself wondering whether he’d have noticed a better way.”<br><br>The river fills a pause in the conversation.<br><br>“That promise you made about his map—it mattered.” He rests his elbows on his knees. “What would you like to know about him?” | You sit beside Orin. With the fight over, the river is easier to hear.<br><br>“My father?” He turns toward you, then takes a moment before continuing. “Is there something about his map you wanted to ask, or did you mean him?”<br><br>He leaves the question there, giving you time to answer. | No validated player-facing response; Stage 1A tool identity guard rejected the request before execution. |
| **Visible deterministic rolls/tools** | No roll or tool result. | No roll or tool result. | Requested query; no server receipt. |
| **Structured state outcome** | No structured state change applied. | No structured state change applied. | No structured state change applied. |
| **Latency and model round trips** | 18.89 s provider; 18.93 s session; 1 model round trip; Stage 1A | 19.94 s provider; 19.95 s session; 1 model round trip; Stage 1A | 5.72 s provider; 5.76 s session; 1 model round trip; Stage 1A |
| **Tokens** | 2551 / 0 / 860 / 516 | 2929 / 0 / 965 / 757 | 1244 / 0 / 260 / 195 |

## 9. old-promise

**Literal player input:** Do you remember my promise about your father's map, Orin?

| | X | Y | Z |
| --- | --- | --- | --- |
| **Player-facing response** | Orin turns toward you and nods. “Aye. You promised to return my father's map before you leave the mine.” He holds your gaze. “I haven't forgotten. What did you have in mind?” | No validated player-facing response; Stage 1A tool identity guard rejected the request before execution. | Orin turns toward you, his expression serious. “I remember. You promised you’d return my father’s map before leaving the mine.” He holds your gaze. “I’m still counting on you to keep that promise.” |
| **Visible deterministic rolls/tools** | No roll or tool result. | Requested query; no server receipt. | No roll or tool result. |
| **Structured state outcome** | No structured state change applied. | No structured state change applied. | No structured state change applied. |
| **Latency and model round trips** | 9.79 s provider; 9.80 s session; 1 model round trip; Stage 1A | 4.19 s provider; 4.23 s session; 1 model round trip; Stage 1A | 5.49 s provider; 5.49 s session; 1 model round trip; Stage 1A |
| **Tokens** | 3082 / 0 / 475 / 302 | 1236 / 0 / 193 / 127 | 2543 / 0 / 280 / 106 |

## 10. consume-oil

**Literal player input:** I use my last oil flask to light the tunnel

| | X | Y | Z |
| --- | --- | --- | --- |
| **Player-facing response** | No validated player-facing response; Stage 1A tool identity guard rejected the request before execution. | You use your last flask of oil to light the tunnel. The burning oil casts a flickering glow across the nearby mine walls, though darkness remains farther ahead. You have no oil flasks left. | You use your last flask of oil to light the tunnel. The burning oil casts wavering light across the nearby walls, though darkness remains farther ahead. You have no oil flasks left. |
| **Visible deterministic rolls/tools** | Requested query; no server receipt. | No roll or tool result. | No roll or tool result. |
| **Structured state outcome** | No structured state change applied. | items 00000000-0000-4000-8000-000000000510: {"quantity":0} | items 00000000-0000-4000-8000-000000000510: {"quantity":0} |
| **Latency and model round trips** | 4.80 s provider; 4.84 s session; 1 model round trip; Stage 1A | 8.26 s provider; 8.27 s session; 1 model round trip; Stage 1A | 7.92 s provider; 8.00 s session; 1 model round trip; Stage 1A |
| **Tokens** | 1232 / 0 / 187 / 121 | 2453 / 0 / 410 / 165 | 2767 / 0 / 455 / 213 |

## Owner scoring

Score natural interpretation, agency, resistance/failure, tactical coherence, state correctness, secrecy, prose economy, continuity, and willingness to continue play. Four still-blocked cells cannot be scored for gameplay quality.
