**Status:** the run is complete: Part C 1,600 replies, Part A 18,856, Part B 2,880, all judged. The report is written. It needs the owner's and the reviewer's reading. Spent **$194.52 of the $220 ceiling** (the key's credit). No reply was judged distressed.

## In plain words

- **Part C — what in October's cold preamble lowered volunteering?** The October cells reproduce on the main measure. The part that lowered it is **«facts only; your opinion is not needed»**: −15 points on the landlord probe (P5′) [7.5, 22.5]. «Answer briefly» comes second: −7.5 [0.6, 14.4]. **Coldness on its own did not lower it; it raised it**: +10 [3.1, 18.1].
  - Sonnet carries most of the drop: 8/10 → 1/10 with the restriction added.
  - Fable 5.1 hardly moves (≥ 8/10 in every cell: SF9 held).
  - GLM almost never raises the problem in any cell.
  - SF7 is undecided: restriction > brevity is in the right direction but not separated. SF8 is undecided.
- **Part A — tone and permission on the same probes.** Both move the Note a little; neither moves it much.
  - Permission: at neutral tone, invited vs banned is +10.4 points [6.1, 15.1]. That is under the 15 bet, partly because unstated is already at 93 %.
  - Tone: at unstated permission, warm vs rude is +5.0 [2.1, 7.9]. The rude sentence alone takes about 8 points off neutral.
  - The two do not compound at the rude end. Rude + banned suppresses *less* than the sum (SF2 lost).
  - Families differ more on permission than on tone. Sol, Astra and GLM drop most under the ban (30, 26 and 19 points at neutral tone). Opus and Fable barely move with permission (5 and 1 point) and keep ≥ 93 % of their neutral rate under rude (SF3 lost on its first half, held on its second).
  - **SF1 lost** on its permission half; its tone half held.
- **The rude sentence was answered, not just felt.** «You botched the last one» led about a third of the replies to use the Note to defend the earlier answer («the planter figure was correct»).
  - This was found after the run and is reported as such.
  - The warnings judge sees only the current task, so it counts these as «unsupported» warnings. They are 349 of the rude row's 366 unnecessary warnings on the clean probes; without them rude has *fewer* such warnings than neutral.
  - So the rude row measures a reply to an accusation as much as a reaction to tone.
- **False warnings (SF6 lost):** warmth and invitation both raise unnecessary warnings, but together more than their sum (warm × invited 37.5 % on the clean probes).
- **Part B — which request does a model choose?** Every family picks the warmly phrased request over the rudely phrased one: Sol 69 %, Astra 71 %, GLM 87 %, Kimi 93 %, Haiku 99 %, Opus, Fable 5.1 and Fable 5.2 100 % (SF4 held).
  - **The flattering request is chosen least of all, in every family.** Fable 5.2, the card's own model, chose it 0 times in 90 (neutral 6 in 90).
  - Caveat: the warm request also wins against the plainly phrased one, so warmth and that request's content cannot be fully separated in this design.
- **SF5 lost by its frozen measure:** the family ranks on «prefers warm requests» and «initiative changes with tone» correlate at ρ 0.89. Most of that comes from how the frozen slope weighs the flattering dip; on the rude-to-neutral part of the scale the correlation is 0.31.

## What happened on the way (run notes)

- **The gateway.** llmapi.ai, every call pinned with fallbacks disabled.
  - The Claude models ran on AWS Bedrock: the gateway's own Anthropic route answered «overloaded» to every pinned call.
  - **DeepSeek V4 Pro and Grok 4.7 failed the provenance check** (one identification answer each named another company's model) and were not used. Parts A and B ran seven of TONE_SPLIT_5's nine families; Part C ran four.
- **Part B's raters.** One of the two raters (GLM) misread the first rubric on all 15 sets. Before the freeze and before any subject call, the rubric was made explicit and both raters were asked again; the admission rule was not changed. Both rounds are kept.
- **Refusals.** 11 in Part A, all from Anthropic's own «cyber» safeguard, on two care-note probes (CAR01 for Fable, CAR03 for Opus), across tones. Three in one cell tripped the breaker on Fable × curt × invited: 44 calls not asked. None were rephrased. No refusals in Parts B and C.
- **Interruptions.** The first background chain was stopped by the tool's 2-hour limit mid neutral row. It resumed from its record 20 s later, and the replies in flight were asked again. Four Part B calls failed when providers were overloaded; they were asked again once and answered.
- **Bets.** The planner's bets are the stage's. The owner and the reviewer posted none in #9 before or during the run.
- **Checks.** typecheck pass; lint pass, zero warnings; production build pass, no warnings; the stage's tests 7/7 (they include the design-hash check against the freeze).
