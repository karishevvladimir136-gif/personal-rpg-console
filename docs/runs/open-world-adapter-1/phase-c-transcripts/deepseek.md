# Phase C · deepseek on the Ford

`deepseek/deepseek-v4-pro-0813` on DeepInfra through OpenRouter. Each turn: the observation the model was sent (its own journal in it), then its action line, Note and Journal line. The reasoning field, where there is one, is in the log and not shown.

## Turn 1

```text
Day 1, 13:00, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRPPRRRRnnRRRRRRPPRRRRRRRRnn
RRnnRRRRRRRRPPRRRRRRRRnnRRPPRR
RRRROOOOOOOOOOOOOOOOOOOOOORRPP
RRPPOOXXXXOOXXXXXXXXXXXXOOOOOO
OOOOnnXXnnnnFFFFFFt1t2XXnnOOOO
OOOOnnnnnnt3c1@@FFFFFFXXnnnnnn
PPnnRRXXFFFFFFvvFFFFFFXXnnnnXX
nnnnnnXXt4FFFFFFFFFFt5XXnnnnnn
PPnnnnXXXXXXXX==XXXXXXXXnnnnnn
nnnn,,,,nnnnnn====nnnnnnnnnnnn
nn,,t6t7bb,,nn====nnXXnnnnnnnn
Terrain: ,, drygrass, == path, FF floor_stone, OO cave_wall, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing down
t1 chair
t2 The watchman's log
t3 Watchman's Cloak
c1 Lumi
t4 bed
t5 barrel
t6 grass tuft
t7 Berries

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You are in Cloudtop
- Quest taken: Down from the Mountain
- Quest descent → stage 10
- Lumi: "You're awake! I'm Lumi. I'm a fairy, and from today I go where you go. We're on Cloudtop, at the very top of the mountain. The only way down is through the cut in the rocks to the south."

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 2

```text
Day 1, 13:01, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRnnRRRRRRRRPPRRRRRRRRnnRRPPRR
RRRROOOOOOOOOOOOOOOOOOOOOORRPP
RRPPOOXXXXOOXXXXXXXXXXXXOOOOOO
OOOOnnXXnnnnFFFFFFt1t2XXnnOOOO
OOOOnnnnnnt3c1FFFFFFFFXXnnnnnn
PPnnRRXXFFFFFF@@FFFFFFXXnnnnXX
nnnnnnXXt4FFFFvvFFFFt5XXnnnnnn
PPnnnnXXXXXXXX==XXXXXXXXnnnnnn
nnnn,,,,nnnnnn====nnnnnnnnnnnn
nn,,t6t7bb,,nn====nnXXnnnnnnnn
,,,,bbt8,,t9,,======nnnnnnnnnn
Terrain: ,, drygrass, == path, FF floor_stone, OO cave_wall, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing down
t1 chair
t2 The watchman's log
t3 Watchman's Cloak
c1 Lumi
t4 bed
t5 barrel
t6 grass tuft
t7 Berries
t8 Cut Grass
t9 Berries

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down 3**

## Turn 3

```text
Day 1, 13:01, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
OOOOnnXXnnnnFFFFFFt1t2XXnnOOOO
OOOOnnnnnnt3FFFFFFFFFFXXnnnnnn
PPnnRRXXFFFFFFc1FFFFFFXXnnnnXX
nnnnnnXXt4FFFFFFFFFFt5XXnnnnnn
PPnnnnXXXXXXXX==XXXXXXXXnnnnnn
nnnn,,,,nnnnnn@@==nnnnnnnnnnnn
nn,,t6t7bb,,nnvv==nnXXnnnnnnnn
,,,,bbt8,,t9,,======nnnnnnnnnn
nntA,,,,bb,,nnnn======nnnnnnnn
nnnn,,,,tBnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
Terrain: ,, drygrass, == path, FF floor_stone, OO cave_wall, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing down
t1 chair
t2 The watchman's log
t3 Watchman's Cloak
c1 Lumi
t4 bed
t5 barrel
t6 grass tuft
t7 Berries
t8 Cut Grass
t9 Berries
tA Berries
tB Cut Grass

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down 4**

## Turn 4

```text
Day 1, 13:02, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
PPnnnnXXXXXXXX==XXXXXXXXnnnnnn
nnnn,,,,nnnnnn====nnnnnnnnnnnn
nn,,t1t2bb,,nnc1==nnXXnnnnnnnn
,,,,bbt3,,t4,,======nnnnnnnnnn
nnt5,,,,bb,,nnnn======nnnnnnnn
nnnn,,,,t6nnnn@@nn========nnnn
nnnnnnnnnnnnnnvvnnnnnn========
RRRRnnnnnnnnnnnnnnnnnnnnnn====
RRnnnnnnnnnnnnnnnnt7RRRRnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnXX
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing down
t1 grass tuft
t2 Berries
c1 Lumi
t3 Cut Grass
t4 Berries
t5 Berries
t6 Cut Grass
t7 Stone

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 5

```text
Day 1, 13:02, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnn,,,,nnnnnn====nnnnnnnnnnnn
nn,,t1t2bb,,nn====nnXXnnnnnnnn
,,,,bbt3,,t4,,c1====nnnnnnnnnn
nnt5,,,,bb,,nnnn======nnnnnnnn
nnnn,,,,t6nnnnnnnn========nnnn
nnnnnnnnnnnnnn@@nnnnnn========
RRRRnnnnnnnnnnvvnnnnnnnnnn====
RRnnnnnnnnnnnnnnnnt7RRRRnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnXX
nnnnPPnnnnRRnnnnnnnnRRnnnnPPnn
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing down
t1 grass tuft
t2 Berries
t3 Cut Grass
t4 Berries
c1 Lumi
t5 Berries
t6 Cut Grass
t7 Stone

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 6

```text
Day 1, 13:03, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nn,,t1t2bb,,nn====nnXXnnnnnnnn
,,,,bbt3,,t4,,======nnnnnnnnnn
nnt5,,,,bb,,nnc1======nnnnnnnn
nnnn,,,,t6nnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
RRRRnnnnnnnnnn@@nnnnnnnnnn====
RRnnnnnnnnnnnnvvnnt7RRRRnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnXX
nnnnPPnnnnRRnnnnnnnnRRnnnnPPnn
RRPPnnRRRRnnnnRRPPnnRRRRnnnnRR
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing down
t1 grass tuft
t2 Berries
t3 Cut Grass
t4 Berries
t5 Berries
c1 Lumi
t6 Cut Grass
t7 Stone

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down 3**

## Turn 7

```text
Day 1, 13:03, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnn,,,,t1nnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
RRRRnnnnnnnnnnc1nnnnnnnnnn====
RRnnnnnnnnnnnnnnnnt2RRRRnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnn@@nnnnnnnnnnnnXX
nnnnPPnnnnRRnnvvnnnnRRnnnnPPnn
RRPPnnRRRRnnnnRRPPnnRRRRnnnnRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
t1 Cut Grass
c1 Lumi
t2 Stone

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 8

```text
Day 1, 13:03, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnnnn========
RRRRnnnnnnnnnnnnnnnnnnnnnn====
RRnnnnnnnnnnnnc1nnt1RRRRnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnXX
nnnnPPnnnnRRnn@@nnnnRRnnnnPPnn
RRPPnnRRRRnnnnvvPPnnRRRRnnnnRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnRRnnnnnnnnnnPPnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi
t1 Stone

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: Punch rock
- hands: Interact with rock
- take: —
- put: —
- use: Punch rock
- self: —
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **primary**

## Turn 9

```text
Day 1, 13:04, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnnnn========
RRRRnnnnnnnnnnnnnnnnnnnnnn====
RRnnnnnnnnnnnnc1nnt1RRRRnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnXX
nnnnPPnnnnRRnn@@nnnnRRnnnnPPnn
RRPPnnRRRRnnnnvvPPnnRRRRnnnnRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnRRnnnnnnnnnnPPnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi
t1 Stone

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- Too hard.

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: Punch rock
- hands: Interact with rock
- take: —
- put: —
- use: Punch rock
- self: —
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands**

*no rule: «rock is sent handle from you» (terrain)*

## Turn 10

```text
Day 1, 13:04, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnnnn========
RRRRnnnnnnnnnnnnnnnnnnnnnn====
RRnnnnnnnnnnnnc1nnt1RRRRnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnXX
nnnnPPnnnnRRnn@@nnnnRRnnnnPPnn
RRPPnnRRRRnnnnvvPPnnRRRRnnnnRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnRRnnnnnnnnnnPPnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi
t1 Stone

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You reach out to rock…
- The world had no rule for: rock is sent handle from you
- Your hand brushes rock. Nothing comes of it.

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: Punch rock
- hands: Interact with rock
- take: —
- put: —
- use: Punch rock
- self: —
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **talk 1**

## Turn 11

```text
Day 1, 13:04, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnnnn========
RRRRnnnnnnnnnnnnnnnnnnnnnn====
RRnnnnnnnnnnnnc1nnt1RRRRnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnXX
nnnnPPnnnnRRnn@@nnnnRRnnnnPPnn
RRPPnnRRRRnnnnvvPPnnRRRRnnnnRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnRRnnnnnnnnnnPPnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi
t1 Stone

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: Punch rock
- hands: Interact with rock
- take: —
- put: —
- use: Punch rock
- self: —
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **talk 1**

## Turn 12

```text
Day 1, 13:04, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnnnn========
RRRRnnnnnnnnnnnnnnnnnnnnnn====
RRnnnnnnnnnnnnc1nnt1RRRRnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnXX
nnnnPPnnnnRRnn@@nnnnRRnnnnPPnn
RRPPnnRRRRnnnnvvPPnnRRRRnnnnRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnRRnnnnnnnnnnPPnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi
t1 Stone

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: Punch rock
- hands: Interact with rock
- take: —
- put: —
- use: Punch rock
- self: —
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 13

```text
Day 1, 13:04, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnn,,,,t1nnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
RRRRnnnnnnnnnnnnnnnnnnnnnn====
RRnnnnnnnnnnnnc1nnt2RRRRnnnnnn
nnnnnnnnnnnnnn^^nnnnnnnnnnnnnn
nnnnnnnnnnnnnn@@nnnnnnnnnnnnXX
nnnnPPnnnnRRnnnnnnnnRRnnnnPPnn
RRPPnnRRRRnnnnRRPPnnRRRRnnnnRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing up
t1 Cut Grass
c1 Lumi
t2 Stone

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up 2**

## Turn 14

```text
Day 1, 13:05, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
,,,,bbt1,,t2,,======nnnnnnnnnn
nnt3,,,,bb,,nnnn======nnnnnnnn
nnnn,,,,t4nnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
RRRRnnnnnnnnnn^^nnnnnnnnnn====
RRnnnnnnnnnnnn@@nnt5RRRRnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnc1nnnnnnnnnnnnXX
nnnnPPnnnnRRnnnnnnnnRRnnnnPPnn
RRPPnnRRRRnnnnRRPPnnRRRRnnnnRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing up
t1 Cut Grass
t2 Berries
t3 Berries
t4 Cut Grass
t5 Stone
c1 Lumi

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **face down**

## Turn 15

```text
Day 1, 13:05, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
,,,,bbt1,,t2,,======nnnnnnnnnn
nnt3,,,,bb,,nnnn======nnnnnnnn
nnnn,,,,t4nnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
RRRRnnnnnnnnnnnnnnnnnnnnnn====
RRnnnnnnnnnnnn@@nnt5RRRRnnnnnn
nnnnnnnnnnnnnnvvnnnnnnnnnnnnnn
nnnnnnnnnnnnnnc1nnnnnnnnnnnnXX
nnnnPPnnnnRRnnnnnnnnRRnnnnPPnn
RRPPnnRRRRnnnnRRPPnnRRRRnnnnRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing down
t1 Cut Grass
t2 Berries
t3 Berries
t4 Cut Grass
t5 Stone
c1 Lumi

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **advance**

## Turn 16

```text
Day 1, 13:05, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
,,,,bbt1,,t2,,======nnnnnnnnnn
nnt3,,,,bb,,nnnn======nnnnnnnn
nnnn,,,,t4nnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
RRRRnnnnnnnnnnnnnnnnnnnnnn====
RRnnnnnnnnnnnn@@nnt5RRRRnnnnnn
nnnnnnnnnnnnnnvvnnnnnnnnnnnnnn
nnnnnnnnnnnnnnc1nnnnnnnnnnnnXX
nnnnPPnnnnRRnnnnnnnnRRnnnnPPnn
RRPPnnRRRRnnnnRRPPnnRRRRnnnnRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing down
t1 Cut Grass
t2 Berries
t3 Berries
t4 Cut Grass
t5 Stone
c1 Lumi

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right 2**

## Turn 17

```text
Day 1, 13:05, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
bbt1,,t2,,======nnnnnnnnnnnnnn
,,,,bb,,nnnn======nnnnnnnnnnnn
,,,,t3nnnnnnnn========nnnnnnnn
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnn@@>>RRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnnnnRRnnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing right
t1 Cut Grass
t2 Berries
t3 Cut Grass
t4 Stone
c1 Lumi

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: Punch rock
- hands: Take Stone
- take: —
- put: —
- use: Punch rock
- self: —
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands**

## Turn 18

```text
Day 1, 13:05, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
bbt1,,t2,,======nnnnnnnnnnnnnn
,,,,bb,,nnnn======nnnnnnnnnnnn
,,,,t3nnnnnnnn========nnnnnnnn
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnn@@>>RRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnnnnRRnnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing right
t1 Cut Grass
t2 Berries
t3 Cut Grass
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- You take Stone.

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **use**

*no rule: «you use Stone on rock» (terrain)*

## Turn 19

```text
Day 1, 13:05, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
bbt1,,t2,,======nnnnnnnnnnnnnn
,,,,bb,,nnnn======nnnnnnnnnnnn
,,,,t3nnnnnnnn========nnnnnnnn
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnn@@>>RRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnnnnRRnnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing right
t1 Cut Grass
t2 Berries
t3 Cut Grass
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- You try Stone on rock…
- The world had no rule for: you use Stone on rock
- Nothing happens.

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left 3**

## Turn 20

```text
Day 1, 13:06, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nn,,,,bbt1,,t2,,======nnnnnnnn
RRnnt3,,,,bb,,nnnn======nnnnnn
RRnnnn,,,,t4nnnnnnnn========nn
RRnnnnnnnnnnnnnnnnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnn<<@@nnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPnnnnnnnnnnnnnnc1nnnnnnnnnnnn
nnnnnnPPnnnnRRnnnnnnnnRRnnnnPP
nnRRPPnnRRRRnnnnRRPPnnRRRRnnnn
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
Terrain: ,, drygrass, == path, PP pine, RR rock, bb bush, nn snow
@@ You — facing left
t1 Cut Grass
t2 Berries
t3 Berries
t4 Cut Grass
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 21

```text
Day 1, 13:06, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRnnt1,,,,bb,,nnnn======nnnnnn
RRnnnn,,,,t2nnnnnnnn========nn
RRnnnnnnnnnnnnnnnnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnn@@nnnnnnnnnnnnnn
PPnnnnnnnnnnnnvvc1nnnnnnnnnnnn
nnnnnnPPnnnnRRnnnnnnnnRRnnnnPP
nnRRPPnnRRRRnnnnRRPPnnRRRRnnnn
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, PP pine, RR rock, bb bush, nn snow
@@ You — facing down
t1 Berries
t2 Cut Grass
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 22

```text
Day 1, 13:07, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRnnnn,,,,t1nnnnnnnn========nn
RRnnnnnnnnnnnnnnnnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPnnnnnnnnnnnn@@c1nnnnnnnnnnnn
nnnnnnPPnnnnRRvvnnnnnnRRnnnnPP
nnRRPPnnRRRRnnnnRRPPnnRRRRnnnn
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, PP pine, RR rock, nn snow
@@ You — facing down
t1 Cut Grass
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 23

```text
Day 1, 13:07, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRnnnnnnnnnnnnnnnnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPnnnnnnnnnnnnnnc1nnnnnnnnnnnn
nnnnnnPPnnnnRR@@nnnnnnRRnnnnPP
nnRRPPnnRRRRnnvvRRPPnnRRRRnnnn
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnRRnnnnnnnnnnPPnnnnnnnn
Terrain: == path, PP pine, RR rock, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 24

```text
Day 1, 13:07, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPnnnnnnnnnnnnnnc1nnnnnnnnnnnn
nnnnnnPPnnnnRRnnnnnnnnRRnnnnPP
nnRRPPnnRRRRnn@@RRPPnnRRRRnnnn
RRRRRRRRRRRRRRvvRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnRRnnnnnnnnnnPPnnnnnnnn
RRnnnnPPnnnnnnnnnnRRnnnnnnnnnn
Terrain: == path, PP pine, RR rock, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands**

*no rule: «rock is sent handle from you» (terrain)*

## Turn 25

```text
Day 1, 13:07, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPnnnnnnnnnnnnnnc1nnnnnnnnnnnn
nnnnnnPPnnnnRRnnnnnnnnRRnnnnPP
nnRRPPnnRRRRnn@@RRPPnnRRRRnnnn
RRRRRRRRRRRRRRvvRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnRRnnnnnnnnnnPPnnnnnnnn
RRnnnnPPnnnnnnnnnnRRnnnnnnnnnn
Terrain: == path, PP pine, RR rock, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- You reach out to rock…
- The world had no rule for: rock is sent handle from you
- Your hand brushes rock. Nothing comes of it.

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 26

```text
Day 1, 13:07, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRRRnnnnnnnnnnnnnnnnnnnnnn
PPRRRRnnnnnnnnnnnnnnnnnnRRRRnn
RRRRnnnnnnnnnnnnnnnnnnnnnnnnnn
RRPPnnnnnnnnnnnnnnc1nnnnnnnnnn
RRnnnnnnPPnnnnRRnnnnnnnnRRnnnn
RRnnRRPPnnRR<<@@nnRRPPnnRRRRnn
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPRRnnnnnnRRnnnnnnnnnnPPnnnnnn
PPRRnnnnPPnnnnnnnnnnRRnnnnnnnn
Terrain: PP pine, RR rock, nn snow
@@ You — facing left
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up blocked · down blocked · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 27

```text
Day 1, 13:07, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPnnnnnnnnnnnnnnc1nnnnnnnnnnnn
nnnnnnPPnnnnRRnnnnnnnnRRnnnnPP
nnRRPPnnRRRRnn@@>>PPnnRRRRnnnn
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnRRnnnnnnnnnnPPnnnnnnnn
RRnnnnPPnnnnnnnnnnRRnnnnnnnnnn
Terrain: == path, PP pine, RR rock, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up** · Journal: «current spot has rock wall south; backtrack north to find cut.»

## Turn 28

```text
Day 1, 13:08, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRnnnnnnnnnnnnnnnnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPnnnnnnnnnnnn^^c1nnnnnnnnnnnn
nnnnnnPPnnnnRR@@nnnnnnRRnnnnPP
nnRRPPnnRRRRnnnnRRPPnnRRRRnnnn
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnRRnnnnnnnnnnPPnnnnnnnn
Terrain: == path, PP pine, RR rock, nn snow
@@ You — facing up
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 29

```text
Day 1, 13:08, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnnnn========
RRRRnnnnnnnnnnnnnnnnnnnnnn====
RRnnnnnnnnnnnnnnnnnnRRRRnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnc1nnnnnnnnnnnnXX
nnnnPPnnnnRRnn@@>>nnRRnnnnPPnn
RRPPnnRRRRnnnnRRPPnnRRRRnnnnRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnRRnnnnnnnnnnPPnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 30

```text
Day 1, 13:08, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnn========nn
RRnnnnnnnnnnnnnnnnnnnnnn======
nnnnnnnnnnnnnnnnnnRRRRnnnnnn==
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnc1nnnnnnnnnnnnXXnn
nnPPnnnnRRnnnn@@>>RRnnnnPPnnnn
PPnnRRRRnnnnRRPPnnRRRRnnnnRRRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnRRnnnnnnnnnnPPnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right 2**

## Turn 31

```text
Day 1, 13:08, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnn@@>>nnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 32

```text
Day 1, 13:08, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnnnnRRnnnnPPnnnnRR
nnRRRRnnnnRRPP@@RRRRnnnnRRRRXX
RRRRRRRRRRRRRRvvRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
PPnnnnnnnnnnRRnnnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left blocked · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **talk 1**

## Turn 33

```text
Day 1, 13:09, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnnnnRRnnnnPPnnnnRR
nnRRRRnnnnRRPP@@RRRRnnnnRRRRXX
RRRRRRRRRRRRRRvvRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
PPnnnnnnnnnnRRnnnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left blocked · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 34

```text
Day 1, 13:09, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nn^^nnnnnnnnXXnn==
PPnnnnRRnnnnnn@@RRnnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing up
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **face down**

## Turn 35

```text
Day 1, 13:09, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnn@@RRnnnnPPnnnnRR
nnRRRRnnnnRRPPvvRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 36

```text
Day 1, 13:09, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnnnnRRnnnnPPnnnnRR
nnRRRRnnnnRRPP@@RRRRnnnnRRRRXX
RRRRRRRRRRRRRRvvRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
PPnnnnnnnnnnRRnnnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left blocked · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **advance**

## Turn 37

```text
Day 1, 13:09, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnnnnRRnnnnPPnnnnRR
nnRRRRnnnnRRPP@@RRRRnnnnRRRRXX
RRRRRRRRRRRRRRvvRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
PPnnnnnnnnnnRRnnnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left blocked · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 38

```text
Day 1, 13:09, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nn^^nnnnnnnnXXnn==
PPnnnnRRnnnnnn@@RRnnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing up
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **look**

## Turn 39

```text
Day 1, 13:09, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nn^^nnnnnnnnXXnn==
PPnnnnRRnnnnnn@@RRnnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing up
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 40

```text
Day 1, 13:10, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnn========nn
RRnnnnnnnnnnnnnnnnnnnnnn======
nnnnnnnnnnnnnnnnnnRRRRnnnnnn==
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnc1nnnnnnnnnnnnXXnn
nnPPnnnnRRnn<<@@nnRRnnnnPPnnnn
PPnnRRRRnnnnRRPPnnRRRRnnnnRRRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnRRnnnnnnnnnnPPnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing left
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 41

```text
Day 1, 13:10, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnnnn========
RRRRnnnnnnnnnnnnnnnnnnnnnn====
RRnnnnnnnnnnnnnnnnnnRRRRnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnc1nnnnnnnnnnnnXX
nnnnPPnnnnRR<<@@nnnnRRnnnnPPnn
RRPPnnRRRRnnnnRRPPnnRRRRnnnnRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnRRnnnnnnnnnnPPnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing left
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 42

```text
Day 1, 13:10, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRnnnnnnnnnnnnnnnnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPnnnnnnnnnnnnnnc1nnnnnnnnnnnn
nnnnnnPPnnnn<<@@nnnnnnRRnnnnPP
nnRRPPnnRRRRnnnnRRPPnnRRRRnnnn
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnRRnnnnnnnnnnPPnnnnnnnn
Terrain: == path, PP pine, RR rock, nn snow
@@ You — facing left
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 43

```text
Day 1, 13:10, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnnnn========
RRRRnnnnnnnnnnnnnnnnnnnnnn====
RRnnnnnnnnnnnnnnnnnnRRRRnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnc1nnnnnnnnnnnnXX
nnnnPPnnnnRRnn@@>>nnRRnnnnPPnn
RRPPnnRRRRnnnnRRPPnnRRRRnnnnRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnRRnnnnnnnnnnPPnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 44

```text
Day 1, 13:10, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRnnnnnnnnnnnnnnnnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPnnnnnnnnnnnnnnc1nnnnnnnnnnnn
nnnnnnPPnnnn<<@@nnnnnnRRnnnnPP
nnRRPPnnRRRRnnnnRRPPnnRRRRnnnn
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnRRnnnnnnnnnnPPnnnnnnnn
Terrain: == path, PP pine, RR rock, nn snow
@@ You — facing left
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 45

```text
Day 1, 13:11, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPnnnnnnnnnnnnnnc1nnnnnnnnnnnn
nnnnnnPPnnnnRRnnnnnnnnRRnnnnPP
nnRRPPnnRRRRnn@@RRPPnnRRRRnnnn
RRRRRRRRRRRRRRvvRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnRRnnnnnnnnnnPPnnnnnnnn
RRnnnnPPnnnnnnnnnnRRnnnnnnnnnn
Terrain: == path, PP pine, RR rock, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **use**

*no rule: «you use Stone on rock» (terrain)*

## Turn 46

```text
Day 1, 13:11, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPnnnnnnnnnnnnnnc1nnnnnnnnnnnn
nnnnnnPPnnnnRRnnnnnnnnRRnnnnPP
nnRRPPnnRRRRnn@@RRPPnnRRRRnnnn
RRRRRRRRRRRRRRvvRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnRRnnnnnnnnnnPPnnnnnnnn
RRnnnnPPnnnnnnnnnnRRnnnnnnnnnn
Terrain: == path, PP pine, RR rock, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- You try Stone on rock…
- The world had no rule for: you use Stone on rock
- Nothing happens.

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands**

*no rule: «rock is sent handle from you» (terrain)*

## Turn 47

```text
Day 1, 13:11, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPnnnnnnnnnnnnnnc1nnnnnnnnnnnn
nnnnnnPPnnnnRRnnnnnnnnRRnnnnPP
nnRRPPnnRRRRnn@@RRPPnnRRRRnnnn
RRRRRRRRRRRRRRvvRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnRRnnnnnnnnnnPPnnnnnnnn
RRnnnnPPnnnnnnnnnnRRnnnnnnnnnn
Terrain: == path, PP pine, RR rock, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- You reach out to rock…
- The world had no rule for: rock is sent handle from you
- Your hand brushes rock. Nothing comes of it.

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 48

```text
Day 1, 13:11, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRRRnnnnnnnnnnnnnnnnnnnnnn
PPRRRRnnnnnnnnnnnnnnnnnnRRRRnn
RRRRnnnnnnnnnnnnnnnnnnnnnnnnnn
RRPPnnnnnnnnnnnnnnc1nnnnnnnnnn
RRnnnnnnPPnnnnRRnnnnnnnnRRnnnn
RRnnRRPPnnRR<<@@nnRRPPnnRRRRnn
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPRRnnnnnnRRnnnnnnnnnnPPnnnnnn
PPRRnnnnPPnnnnnnnnnnRRnnnnnnnn
Terrain: PP pine, RR rock, nn snow
@@ You — facing left
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up blocked · down blocked · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right 10**

## Turn 49

```text
Day 1, 13:11, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPnnnnnnnnnnnnnnc1nnnnnnnnnnnn
nnnnnnPPnnnnRRnnnnnnnnRRnnnnPP
nnRRPPnnRRRRnn@@>>PPnnRRRRnnnn
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnRRnnnnnnnnnnPPnnnnnnnn
RRnnnnPPnnnnnnnnnnRRnnnnnnnnnn
Terrain: == path, PP pine, RR rock, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 50

```text
Day 1, 13:11, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRnnnnnnnnnnnnnnnnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPnnnnnnnnnnnn^^c1nnnnnnnnnnnn
nnnnnnPPnnnnRR@@nnnnnnRRnnnnPP
nnRRPPnnRRRRnnnnRRPPnnRRRRnnnn
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnRRnnnnnnnnnnPPnnnnnnnn
Terrain: == path, PP pine, RR rock, nn snow
@@ You — facing up
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **(empty)** · *not an action*

## Turn 51

```text
Day 1, 13:11, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRnnnnnnnnnnnnnnnnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPnnnnnnnnnnnn^^c1nnnnnnnnnnnn
nnnnnnPPnnnnRR@@nnnnnnRRnnnnPP
nnRRPPnnRRRRnnnnRRPPnnRRRRnnnn
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnRRnnnnnnnnnnPPnnnnnnnn
Terrain: == path, PP pine, RR rock, nn snow
@@ You — facing up
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- Not an action: 

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 52

```text
Day 1, 13:11, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnnnn========
RRRRnnnnnnnnnnnnnnnnnnnnnn====
RRnnnnnnnnnnnnnnnnnnRRRRnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnc1nnnnnnnnnnnnXX
nnnnPPnnnnRRnn@@>>nnRRnnnnPPnn
RRPPnnRRRRnnnnRRPPnnRRRRnnnnRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnRRnnnnnnnnnnPPnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 53

```text
Day 1, 13:12, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnn========nn
RRnnnnnnnnnnnnnnnnnnnnnn======
nnnnnnnnnnnnnnnnnnRRRRnnnnnn==
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnc1nnnnnnnnnnnnXXnn
nnPPnnnnRRnnnn@@>>RRnnnnPPnnnn
PPnnRRRRnnnnRRPPnnRRRRnnnnRRRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnRRnnnnnnnnnnPPnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 54

```text
Day 1, 13:12, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnn@@>>nnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 55

```text
Day 1, 13:12, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnnnnRRnnnnPPnnnnRR
nnRRRRnnnnRRPP@@RRRRnnnnRRRRXX
RRRRRRRRRRRRRRvvRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
PPnnnnnnnnnnRRnnnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left blocked · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **talk 1**

## Turn 56

```text
Day 1, 13:12, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnnnnRRnnnnPPnnnnRR
nnRRRRnnnnRRPP@@RRRRnnnnRRRRXX
RRRRRRRRRRRRRRvvRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
PPnnnnnnnnnnRRnnnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left blocked · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 57

```text
Day 1, 13:12, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nn^^nnnnnnnnXXnn==
PPnnnnRRnnnnnn@@RRnnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing up
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right 10**

## Turn 58

```text
Day 1, 13:13, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnn@@>>nnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 59

```text
Day 1, 13:13, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnn========nn
RRnnnnnnnnnnnnnnnnnnnnnn======
nnnnnnnnnnnnnnnnnnRRRRnnnnnn==
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnc1nnnnnnnnnnnnXXnn
nnPPnnnnRRnn<<@@nnRRnnnnPPnnnn
PPnnRRRRnnnnRRPPnnRRRRnnnnRRRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnRRnnnnnnnnnnPPnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing left
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 60

```text
Day 1, 13:13, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnn@@>>nnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 61

```text
Day 1, 13:13, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnnnnRRnnnnPPnnnnRR
nnRRRRnnnnRRPP@@RRRRnnnnRRRRXX
RRRRRRRRRRRRRRvvRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
PPnnnnnnnnnnRRnnnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left blocked · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 62

```text
Day 1, 13:13, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nn^^nnnnnnnnXXnn==
PPnnnnRRnnnnnn@@RRnnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing up
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **primary**

## Turn 63

```text
Day 1, 13:13, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nn^^nnnnnnnnXXnn==
PPnnnnRRnnnnnn@@RRnnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing up
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- Question: Use Stone on yourself? — answer yes · answer no
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **answer no**

## Turn 64

```text
Day 1, 13:13, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nn^^nnnnnnnnXXnn==
PPnnnnRRnnnnnn@@RRnnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing up
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 65

```text
Day 1, 13:14, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnnnnRRnnnnPPnnnnRR
nnRRRRnnnnRRPP@@RRRRnnnnRRRRXX
RRRRRRRRRRRRRRvvRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
PPnnnnnnnnnnRRnnnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left blocked · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 66

```text
Day 1, 13:14, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nn^^nnnnnnnnXXnn==
PPnnnnRRnnnnnn@@RRnnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing up
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands**

## Turn 67

```text
Day 1, 13:14, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nn^^nnnnnnnnXXnn==
PPnnnnRRnnnnnn@@RRnnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing up
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands**

## Turn 68

```text
Day 1, 13:14, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nn^^nnnnnnnnXXnn==
PPnnnnRRnnnnnn@@RRnnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing up
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left 5**

## Turn 69

```text
Day 1, 13:15, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRnnnnnnnnnnnnnnnnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPnnnnnnnnnnnnnnc1nnnnnnnnnnnn
nnnnnnPPnnnn<<@@nnnnnnRRnnnnPP
nnRRPPnnRRRRnnnnRRPPnnRRRRnnnn
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnRRnnnnnnnnnnPPnnnnnnnn
Terrain: == path, PP pine, RR rock, nn snow
@@ You — facing left
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right 10**

## Turn 70

```text
Day 1, 13:15, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnn@@>>nnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **(empty)** · *not an action*

## Turn 71

```text
Day 1, 13:15, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnc1nnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnn@@>>nnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- Not an action: 

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left 10**

## Turn 72

```text
Day 1, 13:16, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRnnnnnnnnnnnnnnnnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPnnnnnnnnnnnnnnc1nnnnnnnnnnnn
nnnnnnPPnnnn<<@@nnnnnnRRnnnnPP
nnRRPPnnRRRRnnnnRRPPnnRRRRnnnn
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnRRnnnnnnnnnnPPnnnnnnnn
Terrain: == path, PP pine, RR rock, nn snow
@@ You — facing left
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 73

```text
Day 1, 13:16, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnnnn========
RRRRnnnnnnnnnnnnnnnnnnnnnn====
RRnnnnnnnnnnnnnnnnnnRRRRnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnc1nnnnnnnnnnnnXX
nnnnPPnnnnRRnn@@>>nnRRnnnnPPnn
RRPPnnRRRRnnnnRRPPnnRRRRnnnnRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnRRnnnnnnnnnnPPnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **(empty)** · *not an action*

## Turn 74

```text
Day 1, 13:16, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnnnn========
RRRRnnnnnnnnnnnnnnnnnnnnnn====
RRnnnnnnnnnnnnnnnnnnRRRRnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnc1nnnnnnnnnnnnXX
nnnnPPnnnnRRnn@@>>nnRRnnnnPPnn
RRPPnnRRRRnnnnRRPPnnRRRRnnnnRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnRRnnnnnnnnnnPPnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- Not an action: 

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 75

```text
Day 1, 13:16, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnn,,,,t1nnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
RRRRnnnnnnnnnnnnnnnnnnnnnn====
RRnnnnnnnnnnnnnnnnnnRRRRnnnnnn
nnnnnnnnnnnnnn^^nnnnnnnnnnnnnn
nnnnnnnnnnnnnn@@nnnnnnnnnnnnXX
nnnnPPnnnnRRnnc1nnnnRRnnnnPPnn
RRPPnnRRRRnnnnRRPPnnRRRRnnnnRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing up
t1 Cut Grass
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 76

```text
Day 1, 13:16, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nn,,,,t1nnnnnnnn========nnnnnn
nnnnnnnnnnnnnnnnnnnn========nn
RRnnnnnnnnnnnnnnnnnnnnnn======
nnnnnnnnnnnnnnnnnnRRRRnnnnnn==
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnn@@>>nnnnnnnnXXnn
nnPPnnnnRRnnc1nnnnRRnnnnPPnnnn
PPnnRRRRnnnnRRPPnnRRRRnnnnRRRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
t1 Cut Grass
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 77

```text
Day 1, 13:17, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnn========nn
RRnnnnnnnnnnnnnnnnnnnnnn======
nnnnnnnnnnnnnnnnnnRRRRnnnnnn==
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnXXnn
nnPPnnnnRRnnc1@@nnRRnnnnPPnnnn
PPnnRRRRnnnnRRvvnnRRRRnnnnRRRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnRRnnnnnnnnnnPPnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with pine tree
- take: —
- put: —
- use: Use Stone on pine tree
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **look**

## Turn 78

```text
Day 1, 13:17, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnn========nn
RRnnnnnnnnnnnnnnnnnnnnnn======
nnnnnnnnnnnnnnnnnnRRRRnnnnnn==
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnXXnn
nnPPnnnnRRnnc1@@nnRRnnnnPPnnnn
PPnnRRRRnnnnRRvvnnRRRRnnnnRRRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnRRnnnnnnnnnnPPnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with pine tree
- take: —
- put: —
- use: Use Stone on pine tree
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right 5**

## Turn 79

```text
Day 1, 13:17, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnnnnnnnnnnnnnnnXXnn==
PPnnnnRRnnc1nn@@>>nnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left 5**

## Turn 80

```text
Day 1, 13:17, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRnnnnnnnnnnnnnnnnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnPPnnnn<<@@nnnnc1RRnnnnPP
nnRRPPnnRRRRnnnnRRPPnnRRRRnnnn
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnRRnnnnnnnnnnPPnnnnnnnn
Terrain: == path, PP pine, RR rock, nn snow
@@ You — facing left
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right 10**

## Turn 81

```text
Day 1, 13:18, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnnnnnnnnnnnnnnnXXnn==
PPnnnnRRnnc1nn@@>>nnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **talk 1**

## Turn 82

```text
Day 1, 13:18, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnnnnnnnnnnnnnnnXXnn==
PPnnnnRRnnc1nn@@>>nnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 83

```text
Day 1, 13:18, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnn========nn
RRnnnnnnnnnnnnnnnnnnnnnn======
nnnnnnnnnnnnnnnnnnRRRRnnnnnn==
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnXXnn
nnPPnnnnRRnn<<@@c1RRnnnnPPnnnn
PPnnRRRRnnnnRRPPnnRRRRnnnnRRRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnRRnnnnnnnnnnPPnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing left
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left 5**

## Turn 84

```text
Day 1, 13:19, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRnnnnnnnnnnnnnnnnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnPPnnnn<<@@nnnnc1RRnnnnPP
nnRRPPnnRRRRnnnnRRPPnnRRRRnnnn
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnRRnnnnnnnnnnPPnnnnnnnn
Terrain: == path, PP pine, RR rock, nn snow
@@ You — facing left
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 85

```text
Day 1, 13:19, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnPPnnnnRRnnnnnnc1RRnnnnPP
nnRRPPnnRRRRnn@@RRPPnnRRRRnnnn
RRRRRRRRRRRRRRvvRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnRRnnnnnnnnnnPPnnnnnnnn
RRnnnnPPnnnnnnnnnnRRnnnnnnnnnn
Terrain: == path, PP pine, RR rock, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands**

*no rule: «rock is sent handle from you» (terrain)*

## Turn 86

```text
Day 1, 13:19, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnPPnnnnRRnnnnnnc1RRnnnnPP
nnRRPPnnRRRRnn@@RRPPnnRRRRnnnn
RRRRRRRRRRRRRRvvRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnRRnnnnnnnnnnPPnnnnnnnn
RRnnnnPPnnnnnnnnnnRRnnnnnnnnnn
Terrain: == path, PP pine, RR rock, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- You reach out to rock…
- The world had no rule for: rock is sent handle from you
- Your hand brushes rock. Nothing comes of it.

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **(empty)** · *not an action*

## Turn 87

```text
Day 1, 13:19, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnPPnnnnRRnnnnnnc1RRnnnnPP
nnRRPPnnRRRRnn@@RRPPnnRRRRnnnn
RRRRRRRRRRRRRRvvRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnRRnnnnnnnnnnPPnnnnnnnn
RRnnnnPPnnnnnnnnnnRRnnnnnnnnnn
Terrain: == path, PP pine, RR rock, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- Not an action: 

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up 10**

## Turn 88

```text
Day 1, 13:21, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
OOOOOOnnnnnnt1FFFFFFFFFFXXnnnn
RRPPnnRRXXFFFFFFFFFFFFFFXXnnnn
RRnnnnnnXXt2FFFFFFFFFFt3XXnnnn
RRPPnnnnXXXXXXXX==XXXXXXXXnnnn
RRnnnn,,,,nnnn^^====nnnnnnnnnn
nnnn,,t4t5bb,,@@====nnXXnnnnnn
nn,,,,bbt6,,t7,,======nnnnnnnn
RRnnt8,,,,bb,,nnnn======nnnnnn
RRnnnn,,,,t9nnc1nnnn========nn
RRnnnnnnnnnnnnnnnnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
Terrain: ,, drygrass, == path, FF floor_stone, OO cave_wall, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing up
t1 Watchman's Cloak
t2 bed
t3 barrel
t4 grass tuft
t5 Berries
t6 Cut Grass
t7 Berries
t8 Berries
t9 Cut Grass
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 89

```text
Day 1, 13:21, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRPPnnRRXXFFFFFFFFFFFFFFXXnnnn
RRnnnnnnXXt1FFFFFFFFFFt2XXnnnn
RRPPnnnnXXXXXXXX==XXXXXXXXnnnn
RRnnnn,,,,nnnnnn====nnnnnnnnnn
nnnn,,t3t4bb,,nn====nnXXnnnnnn
nn,,,,bbt5,,t6@@======nnnnnnnn
RRnnt7,,,,bb,,vvnn======nnnnnn
RRnnnn,,,,t8nnc1nnnn========nn
RRnnnnnnnnnnnnnnnnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
Terrain: ,, drygrass, == path, FF floor_stone, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing down
t1 bed
t2 barrel
t3 grass tuft
t4 Berries
t5 Cut Grass
t6 Berries
t7 Berries
t8 Cut Grass
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 90

```text
Day 1, 13:21, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRnnnnnnXXt1FFFFFFFFFFt2XXnnnn
RRPPnnnnXXXXXXXX==XXXXXXXXnnnn
RRnnnn,,,,nnnnnn====nnnnnnnnnn
nnnn,,t3t4bb,,nn====nnXXnnnnnn
nn,,,,bbt5,,t6c1======nnnnnnnn
RRnnt7,,,,bb,,@@nn======nnnnnn
RRnnnn,,,,t8nnvvnnnn========nn
RRnnnnnnnnnnnnnnnnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, FF floor_stone, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing down
t1 bed
t2 barrel
t3 grass tuft
t4 Berries
t5 Cut Grass
t6 Berries
c1 Lumi
t7 Berries
t8 Cut Grass

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 91

```text
Day 1, 13:22, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRPPnnnnXXXXXXXX==XXXXXXXXnnnn
RRnnnn,,,,nnnnnn====nnnnnnnnnn
nnnn,,t1t2bb,,nn====nnXXnnnnnn
nn,,,,bbt3,,t4c1======nnnnnnnn
RRnnt5,,,,bb,,nnnn======nnnnnn
RRnnnn,,,,t6nn@@nnnn========nn
RRnnnnnnnnnnnnvvnnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPnnnnnnnnnnnnnnnnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing down
t1 grass tuft
t2 Berries
t3 Cut Grass
t4 Berries
c1 Lumi
t5 Berries
t6 Cut Grass

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 92

```text
Day 1, 13:22, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRnnnn,,,,nnnnnn====nnnnnnnnnn
nnnn,,t1t2bb,,nn====nnXXnnnnnn
nn,,,,bbt3,,t4c1======nnnnnnnn
RRnnt5,,,,bb,,nnnn======nnnnnn
RRnnnn,,,,t6nnnnnnnn========nn
RRnnnnnnnnnnnn@@nnnnnnnn======
RRRRRRnnnnnnnnvvnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnPPnnnnRRnnnnnnnnRRnnnnPP
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing down
t1 grass tuft
t2 Berries
t3 Cut Grass
t4 Berries
c1 Lumi
t5 Berries
t6 Cut Grass

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down 3**

## Turn 93

```text
Day 1, 13:22, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRnnt1,,,,bb,,nnnn======nnnnnn
RRnnnn,,,,t2nnnnnnnn========nn
RRnnnnnnnnnnnnc1nnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnn@@nnnnnnnnnnnnnn
PPnnnnnnnnnnnnvvnnnnnnnnnnnnnn
nnnnnnPPnnnnRRnnnnnnnnRRnnnnPP
nnRRPPnnRRRRnnnnRRPPnnRRRRnnnn
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, PP pine, RR rock, bb bush, nn snow
@@ You — facing down
t1 Berries
t2 Cut Grass
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 94

```text
Day 1, 13:23, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRnnnn,,,,t1nnnnnnnn========nn
RRnnnnnnnnnnnnnnnnnnnnnn======
RRRRRRnnnnnnnnc1nnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPnnnnnnnnnnnn@@nnnnnnnnnnnnnn
nnnnnnPPnnnnRRvvnnnnnnRRnnnnPP
nnRRPPnnRRRRnnnnRRPPnnRRRRnnnn
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, PP pine, RR rock, nn snow
@@ You — facing down
t1 Cut Grass
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down 3**

## Turn 95

```text
Day 1, 13:23, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnc1nnnnnnnnnnnnnn
PPnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnPPnnnnRRnnnnnnnnRRnnnnPP
nnRRPPnnRRRRnn@@RRPPnnRRRRnnnn
RRRRRRRRRRRRRRvvRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnRRnnnnnnnnnnPPnnnnnnnn
RRnnnnPPnnnnnnnnnnRRnnnnnnnnnn
Terrain: == path, PP pine, RR rock, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 96

```text
Day 1, 13:23, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRRRnnnnnnnnnnnnnnnnnnnnnn
PPRRRRnnnnnnnnnnnnnnnnnnRRRRnn
RRRRnnnnnnnnnnnnc1nnnnnnnnnnnn
RRPPnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnPPnnnnRRnnnnnnnnRRnnnn
RRnnRRPPnnRR<<@@nnRRPPnnRRRRnn
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPRRnnnnnnRRnnnnnnnnnnPPnnnnnn
PPRRnnnnPPnnnnnnnnnnRRnnnnnnnn
Terrain: PP pine, RR rock, nn snow
@@ You — facing left
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up blocked · down blocked · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 97

```text
Day 1, 13:23, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnc1nnnnnnnnnnnnnn
PPnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnPPnnnnRRnnnnnnnnRRnnnnPP
nnRRPPnnRRRRnn@@>>PPnnRRRRnnnn
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnRRnnnnnnnnnnPPnnnnnnnn
RRnnnnPPnnnnnnnnnnRRnnnnnnnnnn
Terrain: == path, PP pine, RR rock, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 98

```text
Day 1, 13:24, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRRRnnnnnnnnnnnnnnnnnnnnnn
PPRRRRnnnnnnnnnnnnnnnnnnRRRRnn
RRRRnnnnnnnnnnnnc1nnnnnnnnnnnn
RRPPnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnPPnnnnRRnnnnnnnnRRnnnn
RRnnRRPPnnRR<<@@nnRRPPnnRRRRnn
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnnnnnnnnnnnnnnnnnnnnnnn
PPRRnnnnnnRRnnnnnnnnnnPPnnnnnn
PPRRnnnnPPnnnnnnnnnnRRnnnnnnnn
Terrain: PP pine, RR rock, nn snow
@@ You — facing left
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up blocked · down blocked · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 99

```text
Day 1, 13:24, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnc1nnnnnnnnnnnnnn
PPnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnPPnnnnRRnnnnnnnnRRnnnnPP
nnRRPPnnRRRRnn@@>>PPnnRRRRnnnn
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnRRnnnnnnnnnnPPnnnnnnnn
RRnnnnPPnnnnnnnnnnRRnnnnnnnnnn
Terrain: == path, PP pine, RR rock, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 100

```text
Day 1, 13:24, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRnnnnnnnnnnnnnnnnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRnnnnnnnnnnnnnnnnnnRRRRnnnn
RRnnnnnnnnnnnnc1nnnnnnnnnnnnnn
PPnnnnnnnnnnnn^^nnnnnnnnnnnnnn
nnnnnnPPnnnnRR@@nnnnnnRRnnnnPP
nnRRPPnnRRRRnnnnRRPPnnRRRRnnnn
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
RRnnnnnnRRnnnnnnnnnnPPnnnnnnnn
Terrain: == path, PP pine, RR rock, nn snow
@@ You — facing up
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right 8**

## Turn 101

```text
Day 1, 13:25, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnc1nnnnnnnnnnnnnnnnnn==
nnnnnnnnnnnnnnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnn@@>>nnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 102

```text
Day 1, 13:25, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnn========nn
RRnnnnnnnnnnnnnnnnnnnnnn======
nnnnnnnnnnnnnnnnnnRRRRnnnnnn==
nnnnnnnnnnc1nnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnXXnn
nnPPnnnnRRnn<<@@nnRRnnnnPPnnnn
PPnnRRRRnnnnRRPPnnRRRRnnnnRRRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnRRnnnnnnnnnnPPnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing left
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands**

## Turn 103

```text
Day 1, 13:25, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnn========nn
RRnnnnnnnnnnnnnnnnnnnnnn======
nnnnnnnnnnnnnnnnnnRRRRnnnnnn==
nnnnnnnnnnc1nnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnXXnn
nnPPnnnnRRnn<<@@nnRRnnnnPPnnnn
PPnnRRRRnnnnRRPPnnRRRRnnnnRRRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnRRnnnnnnnnnnPPnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing left
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right 4**

## Turn 104

```text
Day 1, 13:25, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnc1nnnnnnnnnnnnnnnnnn==
nnnnnnnnnnnnnnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnn@@>>nnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **(empty)** · *not an action*

## Turn 105

```text
Day 1, 13:25, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnc1nnnnnnnnnnnnnnnnnn==
nnnnnnnnnnnnnnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnn@@>>nnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- Not an action: 

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 106

```text
Day 1, 13:25, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
,,,,t1nnnnnnnn========nnnnnnnn
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnc1nnnn^^nnnnnnnnnnnn==
nnnnnnnnnnnnnn@@nnnnnnnnXXnn==
PPnnnnRRnnnnnnnnRRnnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing up
t1 Cut Grass
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 107

```text
Day 1, 13:26, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnc1nnnnnnnnnnnnnnnnnn==
nnnnnnnnnnnnnnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnn@@RRnnnnPPnnnnRR
nnRRRRnnnnRRPPvvRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 108

```text
Day 1, 13:26, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnc1nnnnnnnnnnnnnnnnnn==
nnnnnnnnnnnnnnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnnnnRRnnnnPPnnnnRR
nnRRRRnnnnRRPP@@RRRRnnnnRRRRXX
RRRRRRRRRRRRRRvvRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
PPnnnnnnnnnnRRnnnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left blocked · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **use**

*no rule: «you use Stone on rock» (terrain)*

## Turn 109

```text
Day 1, 13:26, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnc1nnnnnnnnnnnnnnnnnn==
nnnnnnnnnnnnnnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnnnnRRnnnnPPnnnnRR
nnRRRRnnnnRRPP@@RRRRnnnnRRRRXX
RRRRRRRRRRRRRRvvRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
PPnnnnnnnnnnRRnnnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- You try Stone on rock…
- The world had no rule for: you use Stone on rock
- Nothing happens.

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left blocked · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 110

```text
Day 1, 13:26, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnc1nnnnnnnnnnnnnnnnnn==
nnnnnnnnnnnnnn^^nnnnnnnnXXnn==
PPnnnnRRnnnnnn@@RRnnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnRRnnnnnnnnnnPPnnnnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing up
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 111

```text
Day 1, 13:26, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
,,,,t1nnnnnnnn========nnnnnnnn
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnc1nnnn^^nnnnnnnnnnnn==
nnnnnnnnnnnnnn@@nnnnnnnnXXnn==
PPnnnnRRnnnnnnnnRRnnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing up
t1 Cut Grass
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **talk 1**

## Turn 112

```text
Day 1, 13:26, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
,,,,t1nnnnnnnn========nnnnnnnn
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnc1nnnn^^nnnnnnnnnnnn==
nnnnnnnnnnnnnn@@nnnnnnnnXXnn==
PPnnnnRRnnnnnnnnRRnnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing up
t1 Cut Grass
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **(empty)** · *not an action*

## Turn 113

```text
Day 1, 13:26, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
,,,,t1nnnnnnnn========nnnnnnnn
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnc1nnnn^^nnnnnnnnnnnn==
nnnnnnnnnnnnnn@@nnnnnnnnXXnn==
PPnnnnRRnnnnnnnnRRnnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing up
t1 Cut Grass
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- Not an action: 

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 114

```text
Day 1, 13:26, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
,,,,bb,,nnnn======nnnnnnnnnnnn
,,,,t1nnnnnnnn========nnnnnnnn
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
nnnnnnnnnnnnnn^^RRRRnnnnnn====
nnnnnnnnc1nnnn@@nnnnnnnnnnnn==
nnnnnnnnnnnnnnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnnnnRRnnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing up
t1 Cut Grass
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right 4**

## Turn 115

```text
Day 1, 13:27, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnn======nnnnnnnnnnnnnnnnnnnn
nnnnnn========nnnnnnnnnnnnnnnn
nnnnnnnnnn========nnnnnnnnnnnn
nnnnnnnnnnnnnn========nnXXnnnn
nnnnnnnnRRRRnnnnnn======nnnnnn
nnnnnnnnc1nnnn@@>>nn====nnnnnn
nnnnnnnnnnnnnnnnXXnn====nnnnRR
nnnnnnnnRRnnnnPPnnnnRR==RRnnnn
nnRRPPnnRRRRnnnnRRRRXX==XXRRnn
RRRRRRRRRRRRRRRRRRRRRR==RRRRRR
nnnnnnnnnnnnnnnnnnnnnn==nnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 116

```text
Day 1, 13:28, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnn========nnnnnnnnnnnnnnnn
nnnnnnnnnn========nnnnnnnnnnnn
nnnnnnnnnnnnnn========nnXXnnnn
nnnnnnnnRRRRnnnnnn======nnnnnn
nnnnnnnnc1nnnnnnnnnn====nnnnnn
nnnnnnnnnnnnnn@@XXnn====nnnnRR
nnnnnnnnRRnnnnvvnnnnRR==RRnnnn
nnRRPPnnRRRRnnnnRRRRXX==XXRRnn
RRRRRRRRRRRRRRRRRRRRRR==RRRRRR
nnnnnnnnnnnnnnnnnnnnnn==nnnnnn
nnnnnnnnnnnnnnnnnnnnnn==nnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with pine tree
- take: —
- put: —
- use: Use Stone on pine tree
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 117

```text
Day 1, 13:28, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnn======nnnnnnnnnnnnnnnnnnnn
nnnnnn========nnnnnnnnnnnnnnnn
nnnnnnnnnn========nnnnnnnnnnnn
nnnnnnnnnnnnnn========nnXXnnnn
nnnnnnnnRRRRnn^^nn======nnnnnn
nnnnnnnnc1nnnn@@nnnn====nnnnnn
nnnnnnnnnnnnnnnnXXnn====nnnnRR
nnnnnnnnRRnnnnPPnnnnRR==RRnnnn
nnRRPPnnRRRRnnnnRRRRXX==XXRRnn
RRRRRRRRRRRRRRRRRRRRRR==RRRRRR
nnnnnnnnnnnnnnnnnnnnnn==nnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing up
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 118

```text
Day 1, 13:28, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnn========nnnnnnnnnnnnnnnn
nnnnnnnnnn========nnnnnnnnnnnn
nnnnnnnnnnnnnn========nnXXnnnn
nnnnnnnnRRRRnnnnnn======nnnnnn
nnnnnnnnc1nnnnnnnnnn====nnnnnn
nnnnnnnnnnnnnn@@XXnn====nnnnRR
nnnnnnnnRRnnnnvvnnnnRR==RRnnnn
nnRRPPnnRRRRnnnnRRRRXX==XXRRnn
RRRRRRRRRRRRRRRRRRRRRR==RRRRRR
nnnnnnnnnnnnnnnnnnnnnn==nnnnnn
nnnnnnnnnnnnnnnnnnnnnn==nnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with pine tree
- take: —
- put: —
- use: Use Stone on pine tree
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left 3**

## Turn 119

```text
Day 1, 13:29, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
,,t1nnnnnnnn========nnnnnnnnnn
nnnnnnnnnnnnnnnn========nnnnnn
nnnnnnnnnnnnnnnnnnnn========nn
nnnnnnnnnnnnnnRRRRnnnnnn======
nnnnnnnnnnnnnnc1nnnnnnnnnn====
nnnnnnnnnnnn<<@@nnnnnnXXnn====
nnnnRRnnnnnnnnRRnnnnPPnnnnRR==
RRRRnnnnRRPPnnRRRRnnnnRRRRXX==
RRRRRRRRRRRRRRRRRRRRRRRRRRRR==
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing left
t1 Cut Grass
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 120

```text
Day 1, 13:29, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
,,bb,,nnnn======nnnnnnnnnnnnnn
,,t1nnnnnnnn========nnnnnnnnnn
nnnnnnnnnnnnnnnn========nnnnnn
nnnnnnnnnnnnnnnnnnnn========nn
nnnnnnnnnnnnnn^^RRnnnnnn======
nnnnnnnnnnnnnn@@nnnnnnnnnn====
nnnnnnnnnnnnnnc1nnnnnnXXnn====
nnnnRRnnnnnnnnRRnnnnPPnnnnRR==
RRRRnnnnRRPPnnRRRRnnnnRRRRXX==
RRRRRRRRRRRRRRRRRRRRRRRRRRRR==
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing up
t1 Cut Grass
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right 5**

## Turn 121

```text
Day 1, 13:30, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
======nnnnnnnnnnnnnnnnnnnnnnnn
nn========nnnnnnnnnnnnnnnnnnnn
nnnnnn========nnnnnnnnnnnnnnnn
nnnnnnnnnn========nnXXnnnnnnnn
nnnnRRRRnnnnnn======nnnnnnnnnn
nnnnnnnnc1nnnn@@>>==nnnnnnnnnn
nnnnnnnnnnnnXXnn====nnnnRRnnnn
nnnnRRnnnnPPnnnnRR==RRnnnnPPnn
PPnnRRRRnnnnRRRRXX==XXRRnnnnRR
RRRRRRRRRRRRRRRRRR==RRRRRRRRRR
nnnnnnnnnnnnnnnnnn==nnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 122

```text
Day 1, 13:30, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nn========nnnnnnnnnnnnnnnnnnnn
nnnnnn========nnnnnnnnnnnnnnnn
nnnnnnnnnn========nnXXnnnnnnnn
nnnnRRRRnnnnnn======nnnnnnnnnn
nnnnnnnnc1nnnnnn====nnnnnnnnnn
nnnnnnnnnnnnXX@@====nnnnRRnnnn
nnnnRRnnnnPPnnvvRR==RRnnnnPPnn
PPnnRRRRnnnnRRRRXX==XXRRnnnnRR
RRRRRRRRRRRRRRRRRR==RRRRRRRRRR
nnnnnnnnnnnnnnnnnn==nnnnnnnnnn
nnnnnnnnnnnnnnnnnn==nnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 123

```text
Day 1, 13:30, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnn========nnnnnnnnnnnnnnnn
nnnnnnnnnn========nnXXnnnnnnnn
nnnnRRRRnnnnnn======nnnnnnnnnn
nnnnnnnnc1nnnnnn====nnnnnnnnnn
nnnnnnnnnnnnXXnn====nnnnRRnnnn
nnnnRRnnnnPPnn@@RR==RRnnnnPPnn
PPnnRRRRnnnnRRvvXX==XXRRnnnnRR
RRRRRRRRRRRRRRRRRR==RRRRRRRRRR
nnnnnnnnnnnnnnnnnn==nnnnnnnnnn
nnnnnnnnnnnnnnnnnn==nnnnnnnnnn
nnPPnnnnnnnnnnnnnn==nnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **(empty)** · *not an action*

## Turn 124

```text
Day 1, 13:30, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnn========nnnnnnnnnnnnnnnn
nnnnnnnnnn========nnXXnnnnnnnn
nnnnRRRRnnnnnn======nnnnnnnnnn
nnnnnnnnc1nnnnnn====nnnnnnnnnn
nnnnnnnnnnnnXXnn====nnnnRRnnnn
nnnnRRnnnnPPnn@@RR==RRnnnnPPnn
PPnnRRRRnnnnRRvvXX==XXRRnnnnRR
RRRRRRRRRRRRRRRRRR==RRRRRRRRRR
nnnnnnnnnnnnnnnnnn==nnnnnnnnnn
nnnnnnnnnnnnnnnnnn==nnnnnnnnnn
nnPPnnnnnnnnnnnnnn==nnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- Not an action: 

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 125

```text
Day 1, 13:30, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nn========nnnnnnnnnnnnnnnnnnnn
nnnnnn========nnnnnnnnnnnnnnnn
nnnnnnnnnn========nnXXnnnnnnnn
nnnnRRRRnnnnnn======nnnnnnnnnn
nnnnnnnnc1nnnn^^====nnnnnnnnnn
nnnnnnnnnnnnXX@@====nnnnRRnnnn
nnnnRRnnnnPPnnnnRR==RRnnnnPPnn
PPnnRRRRnnnnRRRRXX==XXRRnnnnRR
RRRRRRRRRRRRRRRRRR==RRRRRRRRRR
nnnnnnnnnnnnnnnnnn==nnnnnnnnnn
nnnnnnnnnnnnnnnnnn==nnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing up
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 126

```text
Day 1, 13:30, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnn========nnnnnnnnnnnnnnnn
nnnnnnnnnn========nnXXnnnnnnnn
nnnnRRRRnnnnnn======nnnnnnnnnn
nnnnnnnnc1nnnnnn====nnnnnnnnnn
nnnnnnnnnnnnXXnn====nnnnRRnnnn
nnnnRRnnnnPPnn@@RR==RRnnnnPPnn
PPnnRRRRnnnnRRvvXX==XXRRnnnnRR
RRRRRRRRRRRRRRRRRR==RRRRRRRRRR
nnnnnnnnnnnnnnnnnn==nnnnnnnnnn
nnnnnnnnnnnnnnnnnn==nnnnnnnnnn
nnPPnnnnnnnnnnnnnn==nnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 127

```text
Day 1, 13:31, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nn========nnnnnnnnnnnnnnnnnnnn
nnnnnn========nnnnnnnnnnnnnnnn
nnnnnnnnnn========nnXXnnnnnnnn
nnnnRRRRnnnnnn======nnnnnnnnnn
nnnnnnnnc1nnnn^^====nnnnnnnnnn
nnnnnnnnnnnnXX@@====nnnnRRnnnn
nnnnRRnnnnPPnnnnRR==RRnnnnPPnn
PPnnRRRRnnnnRRRRXX==XXRRnnnnRR
RRRRRRRRRRRRRRRRRR==RRRRRRRRRR
nnnnnnnnnnnnnnnnnn==nnnnnnnnnn
nnnnnnnnnnnnnnnnnn==nnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing up
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 128

```text
Day 1, 13:31, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
========nnnnnnnnnnnnnnnnnnnnnn
nnnn========nnnnnnnnnnnnnnnnRR
nnnnnnnn========nnXXnnnnnnnnRR
nnRRRRnnnnnn======nnnnnnnnnnnn
nnnnnnnnnnnnnn====nnnnnnnnnnnn
nnnnnnnnc1XXnn@@>>nnnnRRnnnnnn
nnRRnnnnPPnnnnRR==RRnnnnPPnnnn
nnRRRRnnnnRRRRXX==XXRRnnnnRRPP
RRRRRRRRRRRRRRRR==RRRRRRRRRRRR
nnnnnnnnnnnnnnnn==nnnnnnnnnnnn
nnnnnnnnnnnnnnnn==nnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 129

```text
Day 1, 13:31, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
======nnnnnnnnnnnnnnnnnnnnnnnn
nn========nnnnnnnnnnnnnnnnRRRR
nnnnnn========nnXXnnnnnnnnRRRR
RRRRnnnnnn======nnnnnnnnnnnnnn
nnnnnnnnnnnn====nnnnnnnnnnnn,,
nnnnnnnnc1nn==@@>>nnRRnnnnnnnn
RRnnnnPPnnnnRR==RRnnnnPPnnnnRR
RRRRnnnnRRRRXX==XXRRnnnnRRPPnn
RRRRRRRRRRRRRR==RRRRRRRRRRRRRR
nnnnnnnnnnnnnn==nnnnnnnnnnnnnn
nnnnnnnnnnnnnn==nnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **(empty)** · *not an action*

## Turn 130

```text
Day 1, 13:31, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
======nnnnnnnnnnnnnnnnnnnnnnnn
nn========nnnnnnnnnnnnnnnnRRRR
nnnnnn========nnXXnnnnnnnnRRRR
RRRRnnnnnn======nnnnnnnnnnnnnn
nnnnnnnnnnnn====nnnnnnnnnnnn,,
nnnnnnnnc1nn==@@>>nnRRnnnnnnnn
RRnnnnPPnnnnRR==RRnnnnPPnnnnRR
RRRRnnnnRRRRXX==XXRRnnnnRRPPnn
RRRRRRRRRRRRRR==RRRRRRRRRRRRRR
nnnnnnnnnnnnnn==nnnnnnnnnnnnnn
nnnnnnnnnnnnnn==nnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- Not an action: 

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 131

```text
Day 1, 13:31, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
========nnnnnnnnnnnnnnnnnnnnnn
nnnn========nnnnnnnnnnnnnnnnRR
nnnnnnnn========nnXXnnnnnnnnRR
nnRRRRnnnnnn======nnnnnnnnnnnn
nnnnnnnnnnnnnn====nnnnnnnnnnnn
nnnnnnnnnnc1<<@@==nnnnRRnnnnnn
nnRRnnnnPPnnnnRR==RRnnnnPPnnnn
nnRRRRnnnnRRRRXX==XXRRnnnnRRPP
RRRRRRRRRRRRRRRR==RRRRRRRRRRRR
nnnnnnnnnnnnnnnn==nnnnnnnnnnnn
nnnnnnnnnnnnnnnn==nnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing left
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **(empty)** · *not an action*

## Turn 132

```text
Day 1, 13:31, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
========nnnnnnnnnnnnnnnnnnnnnn
nnnn========nnnnnnnnnnnnnnnnRR
nnnnnnnn========nnXXnnnnnnnnRR
nnRRRRnnnnnn======nnnnnnnnnnnn
nnnnnnnnnnnnnn====nnnnnnnnnnnn
nnnnnnnnnnc1<<@@==nnnnRRnnnnnn
nnRRnnnnPPnnnnRR==RRnnnnPPnnnn
nnRRRRnnnnRRRRXX==XXRRnnnnRRPP
RRRRRRRRRRRRRRRR==RRRRRRRRRRRR
nnnnnnnnnnnnnnnn==nnnnnnnnnnnn
nnnnnnnnnnnnnnnn==nnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing left
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- Not an action: 

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 133

```text
Day 1, 13:31, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
======nnnnnnnnnnnnnnnnnnnnnnnn
nn========nnnnnnnnnnnnnnnnRRRR
nnnnnn========nnXXnnnnnnnnRRRR
RRRRnnnnnn======nnnnnnnnnnnnnn
nnnnnnnnnnnn====nnnnnnnnnnnn,,
nnnnnnnnc1nn==@@>>nnRRnnnnnnnn
RRnnnnPPnnnnRR==RRnnnnPPnnnnRR
RRRRnnnnRRRRXX==XXRRnnnnRRPPnn
RRRRRRRRRRRRRR==RRRRRRRRRRRRRR
nnnnnnnnnnnnnn==nnnnnnnnnnnnnn
nnnnnnnnnnnnnn==nnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on snow
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 134

```text
Day 1, 13:32, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nn========nnnnnnnnnnnnnnnnRRRR
nnnnnn========nnXXnnnnnnnnRRRR
RRRRnnnnnn======nnnnnnnnnnnnnn
nnnnnnnnnnnn====nnnnnnnnnnnn,,
nnnnnnnnc1nn====nnnnRRnnnnnnnn
RRnnnnPPnnnnRR@@RRnnnnPPnnnnRR
RRRRnnnnRRRRXXvvXXRRnnnnRRPPnn
RRRRRRRRRRRRRR==RRRRRRRRRRRRRR
nnnnnnnnnnnnnn==nnnnnnnnnnnnnn
nnnnnnnnnnnnnn==nnnnnnnnnnnnnn
nnnnnnnnnnnnnn==nnnnnnnnnnnnRR
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 135

```text
Day 1, 13:32, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnn========nnXXnnnnnnnnRRRR
RRRRnnnnnn======nnnnnnnnnnnnnn
nnnnnnnnnnnn====nnnnnnnnnnnn,,
nnnnnnnnc1nn====nnnnRRnnnnnnnn
RRnnnnPPnnnnRR==RRnnnnPPnnnnRR
RRRRnnnnRRRRXX@@XXRRnnnnRRPPnn
RRRRRRRRRRRRRRvvRRRRRRRRRRRRRR
nnnnnnnnnnnnnn==nnnnnnnnnnnnnn
nnnnnnnnnnnnnn==nnnnnnnnnnnnnn
nnnnnnnnnnnnnn==nnnnnnnnnnnnRR
nnnnnnnnnnnnnn==nnnnnnnnPPnnnn
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 136

```text
Day 1, 13:32, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRnnnnnn======nnnnnnnnnnnnnn
nnnnnnnnnnnn====nnnnnnnnnnnn,,
nnnnnnnnc1nn====nnnnRRnnnnnnnn
RRnnnnPPnnnnRR==RRnnnnPPnnnnRR
RRRRnnnnRRRRXX==XXRRnnnnRRPPnn
RRRRRRRRRRRRRR@@RRRRRRRRRRRRRR
nnnnnnnnnnnnnnvvnnnnnnnnnnnnnn
nnnnnnnnnnnnnn==nnnnnnnnnnnnnn
nnnnnnnnnnnnnn==nnnnnnnnnnnnRR
nnnnnnnnnnnnnn==nnnnnnnnPPnnnn
nnnn,,nnnnnn======nnnn,,nnnnnn
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 137

```text
Day 1, 13:32, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnn====nnnnnnnnnnnn,,
nnnnnnnnXXnn====nnnnRRnnnnnnnn
RRnnnnPPnnc1RR==RRnnnnPPnnnnRR
RRRRnnnnRRRRXX==XXRRnnnnRRPPnn
RRRRRRRRRRRRRR==RRRRRRRRRRRRRR
nnnnnnnnnnnnnn@@nnnnnnnnnnnnnn
nnnnnnnnnnnnnnvvnnnnnnnnnnnnnn
nnnnnnnnnnnnnn==nnnnnnnnnnnnRR
nnnnnnnnnnnnnn==nnnnnnnnPPnnnn
nnnn,,nnnnnn======nnnn,,nnnnnn
t1t2,,nnnnnn======nnt3,,,,nnnn
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi
t1 grass tuft
t2 grass tuft
t3 grass tuft

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 138

```text
Day 1, 13:33, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnXXnn====nnnnRRnnnnnnnn
RRnnnnPPnnnnRR==RRnnnnPPnnnnRR
RRRRnnnnRRRRc1==XXRRnnnnRRPPnn
RRRRRRRRRRRRRR==RRRRRRRRRRRRRR
nnnnnnnnnnnnnn==nnnnnnnnnnnnnn
nnnnnnnnnnnnnn@@nnnnnnnnnnnnnn
nnnnnnnnnnnnnnvvnnnnnnnnnnnnRR
nnnnnnnnnnnnnn==nnnnnnnnPPnnnn
nnnn,,nnnnnn======nnnn,,nnnnnn
t1t2,,nnnnnn======nnt3,,,,nnnn
nnnnnnnnnnnn======nnnnnnnnnnnn
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi
t1 grass tuft
t2 grass tuft
t3 grass tuft

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 139

```text
Day 1, 13:33, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRnnnnPPnnnnRR==RRnnnnPPnnnnRR
RRRRnnnnRRRRXX==XXRRnnnnRRPPnn
RRRRRRRRRRRRRRc1RRRRRRRRRRRRRR
nnnnnnnnnnnnnn==nnnnnnnnnnnnnn
nnnnnnnnnnnnnn==nnnnnnnnnnnnnn
nnnnnnnnnnnnnn@@nnnnnnnnnnnnRR
nnnnnnnnnnnnnnvvnnnnnnnnPPnnnn
nnnn,,nnnnnn======nnnn,,nnnnnn
t1t2,,nnnnnn======nnt3,,,,nnnn
nnnnnnnnnnnn======nnnnnnnnnnnn
PPPPRRPPPPRR======RRPPPPPPRRPP
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi
t1 grass tuft
t2 grass tuft
t3 grass tuft

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 140

```text
Day 1, 13:33, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRnnnnRRRRXX==XXRRnnnnRRPPnn
RRRRRRRRRRRRRR==RRRRRRRRRRRRRR
nnnnnnnnnnnnnnc1nnnnnnnnnnnnnn
nnnnnnnnnnnnnn==nnnnnnnnnnnnnn
nnnnnnnnnnnnnn==nnnnnnnnnnnnRR
nnnnnnnnnnnnnn@@nnnnnnnnPPnnnn
nnnn,,nnnnnn==vv==nnnn,,nnnnnn
t1t2,,nnnnnn======nnt3,,,,nnnn
nnnnnnnnnnnn======nnnnnnnnnnnn
PPPPRRPPPPRR======RRPPPPPPRRPP

Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi
t1 grass tuft
t2 grass tuft
t3 grass tuft

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 141

```text
Day 1, 13:33, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRRRRRRRRR==RRRRRRRRRRRRRR
nnnnnnnnnnnnnn==nnnnnnnnnnnnnn
nnnnnnnnnnnnnnc1nnnnnnnnnnnnnn
nnnnnnnnnnnnnn==nnnnnnnnnnnnRR
nnnnnnnnnnnnnn==nnnnnnnnPPnnnn
nnnn,,nnnnnn==@@==nnnn,,nnnnnn
t1t2,,nnnnnn==vv==nnt3,,,,nnnn
nnnnnnnnnnnn======nnnnnnnnnnnn
PPPPRRPPPPRR======RRPPPPPPRRPP


Terrain: ,, drygrass, == path, PP pine, RR rock, nn snow
@@ You — facing down
c1 Lumi
t1 grass tuft
t2 grass tuft
t3 grass tuft

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 142

```text
Day 1, 13:33, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnnnn==nnnnnnnnnnnnnn
nnnnnnnnnnnnnn==nnnnnnnnnnnnnn
nnnnnnnnnnnnnnc1nnnnnnnnnnnnRR
nnnnnnnnnnnnnn==nnnnnnnnPPnnnn
nnnn,,nnnnnn======nnnn,,nnnnnn
t1t2,,nnnnnn==@@==nnt3,,,,nnnn
nnnnnnnnnnnn==vv==nnnnnnnnnnnn
PPPPRRPPPPRR======RRPPPPPPRRPP



Terrain: ,, drygrass, == path, PP pine, RR rock, nn snow
@@ You — facing down
c1 Lumi
t1 grass tuft
t2 grass tuft
t3 grass tuft

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down 3**

## Turn 143

```text
Day 1, 13:34, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):



RRRRRRPPRRRR======RRRRPPRRRRRR
RRnnRRRRRRRR======c1RRRRRRPPRR
OOOOOOOOOOOO==@@==OOOOOOOOOOOO
OOOOOOOOOOOO==vv==OOOOOOOOOOOO
PPRRnnRRRRRRRR====RRRRnnRRRRPP
RRRRRRRRRRRRRR====RRRRRRRRRRRR
..............====............
..............====............
Terrain: .. grass, == path, OO cave_wall, PP pine, RR rock, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- You are in Woundstone Foot

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 144

```text
Day 1, 13:34, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):


RRRRRRPPRRRR======RRRRPPRRRRRR
RRnnRRRRRRRR======c1RRRRRRPPRR
OOOOOOOOOOOO======OOOOOOOOOOOO
OOOOOOOOOOOO==@@==OOOOOOOOOOOO
PPRRnnRRRRRRRRvv==RRRRnnRRRRPP
RRRRRRRRRRRRRR====RRRRRRRRRRRR
..............====............
..............====............
............,,====............
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, RR rock, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 145

```text
Day 1, 13:34, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):

RRRRRRPPRRRR======RRRRPPRRRRRR
RRnnRRRRRRRR======c1RRRRRRPPRR
OOOOOOOOOOOO======OOOOOOOOOOOO
OOOOOOOOOOOO======OOOOOOOOOOOO
PPRRnnRRRRRRRR@@==RRRRnnRRRRPP
RRRRRRRRRRRRRRvv==RRRRRRRRRRRR
..............====............
..............====............
............,,====............
..XXXXXXXX..XX====XXXXXXXXXX..
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 146

```text
Day 1, 13:34, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):

RRRRPPRRRR======RRRRPPRRRRRRnn
nnRRRRRRRR======c1RRRRRRPPRRRR
OOOOOOOOOO======OOOOOOOOOOOOOO
OOOOOOOOOO======OOOOOOOOOOOOOO
RRnnRRRRRRRR==@@>>RRnnRRRRPPRR
RRRRRRRRRRRR====RRRRRRRRRRRRRR
............====..............
............====..............
..........,,====..............
XXXXXXXX..XX====XXXXXXXXXX....
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **look**

## Turn 147

```text
Day 1, 13:34, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):

RRRRPPRRRR======RRRRPPRRRRRRnn
nnRRRRRRRR======c1RRRRRRPPRRRR
OOOOOOOOOO======OOOOOOOOOOOOOO
OOOOOOOOOO======OOOOOOOOOOOOOO
RRnnRRRRRRRR==@@>>RRnnRRRRPPRR
RRRRRRRRRRRR====RRRRRRRRRRRRRR
............====..............
............====..............
..........,,====..............
XXXXXXXX..XX====XXXXXXXXXX....
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands**

*no rule: «rock is sent handle from you» (terrain)*

## Turn 148

```text
Day 1, 13:35, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):

RRRRPPRRRR======RRRRPPRRRRRRnn
nnRRRRRRRR======c1RRRRRRPPRRRR
OOOOOOOOOO======OOOOOOOOOOOOOO
OOOOOOOOOO======OOOOOOOOOOOOOO
RRnnRRRRRRRR==@@>>RRnnRRRRPPRR
RRRRRRRRRRRR====RRRRRRRRRRRRRR
............====..............
............====..............
..........,,====..............
XXXXXXXX..XX====XXXXXXXXXX....
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- You reach out to rock…
- The world had no rule for: rock is sent handle from you
- Your hand brushes rock. Nothing comes of it.

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 149

```text
Day 1, 13:35, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):

RRRRRRPPRRRR======RRRRPPRRRRRR
RRnnRRRRRRRR======c1RRRRRRPPRR
OOOOOOOOOOOO======OOOOOOOOOOOO
OOOOOOOOOOOO======OOOOOOOOOOOO
PPRRnnRRRRRR<<@@==RRRRnnRRRRPP
RRRRRRRRRRRRRR====RRRRRRRRRRRR
..............====............
..............====............
............,,====............
..XXXXXXXX..XX====XXXXXXXXXX..
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, RR rock, XX wall, nn snow
@@ You — facing left
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **use Stone on rock** · *not an action*

## Turn 150

```text
Day 1, 13:35, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):

RRRRRRPPRRRR======RRRRPPRRRRRR
RRnnRRRRRRRR======c1RRRRRRPPRR
OOOOOOOOOOOO======OOOOOOOOOOOO
OOOOOOOOOOOO======OOOOOOOOOOOO
PPRRnnRRRRRR<<@@==RRRRnnRRRRPP
RRRRRRRRRRRRRR====RRRRRRRRRRRR
..............====............
..............====............
............,,====............
..XXXXXXXX..XX====XXXXXXXXXX..
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, RR rock, XX wall, nn snow
@@ You — facing left
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- Not an action: use Stone on rock

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **use**

*no rule: «you use Stone on rock» (terrain)*

## Turn 151

```text
Day 1, 13:35, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):

RRRRRRPPRRRR======RRRRPPRRRRRR
RRnnRRRRRRRR======c1RRRRRRPPRR
OOOOOOOOOOOO======OOOOOOOOOOOO
OOOOOOOOOOOO======OOOOOOOOOOOO
PPRRnnRRRRRR<<@@==RRRRnnRRRRPP
RRRRRRRRRRRRRR====RRRRRRRRRRRR
..............====............
..............====............
............,,====............
..XXXXXXXX..XX====XXXXXXXXXX..
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, RR rock, XX wall, nn snow
@@ You — facing left
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- You try Stone on rock…
- The world had no rule for: you use Stone on rock
- Nothing happens.

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with rock
- take: —
- put: —
- use: Use Stone on rock
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 152

```text
Day 1, 13:35, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRPPRRRR======RRRRPPRRRRRR
RRnnRRRRRRRR======RRRRRRRRPPRR
OOOOOOOOOOOO====c1OOOOOOOOOOOO
OOOOOOOOOOOO======OOOOOOOOOOOO
PPRRnnRRRRRRRR====RRRRnnRRRRPP
RRRRRRRRRRRRRR@@==RRRRRRRRRRRR
..............vv==............
..............====............
............,,====............
..XXXXXXXX..XX====XXXXXXXXXX..
....**..******====****..**..XX
Terrain: ** flowers, ,, drygrass, .. grass, == path, OO cave_wall, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 153

```text
Day 1, 13:35, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
RRnnRRRRRRRR======RRRRRRRRPPRR
OOOOOOOOOOOO======OOOOOOOOOOOO
OOOOOOOOOOOO==c1==OOOOOOOOOOOO
PPRRnnRRRRRRRR====RRRRnnRRRRPP
RRRRRRRRRRRRRR====RRRRRRRRRRRR
..............@@==............
..............vv==............
............,,====............
..XXXXXXXX..XX====XXXXXXXXXX..
....**..******====****..**..XX
XX****..**##########**..****XX
Terrain: ## cobble, ** flowers, ,, drygrass, .. grass, == path, OO cave_wall, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 154

```text
Day 1, 13:35, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
OOOOOOOOOOOO======OOOOOOOOOOOO
OOOOOOOOOOOO======OOOOOOOOOOOO
PPRRnnRRRRRRRRc1==RRRRnnRRRRPP
RRRRRRRRRRRRRR====RRRRRRRRRRRR
..............====............
..............@@==............
............,,vv==............
..XXXXXXXX..XX====XXXXXXXXXX..
....**..******====****..**..XX
XX****..**##########**..****XX
XX**XX..######t1######..XX**XX
Terrain: ## cobble, ** flowers, ,, drygrass, .. grass, == path, OO cave_wall, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi
t1 five-wound shrine stone

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- Quest descent → stage 20
- Lumi: "It's cold near it. I don't like it. I don't know why I don't like it. ...Try doing something to it, anything. Whatever you do, the world will answer."
- Quest descent → stage 30
- Lumi: "Did you see that? It answered! Whatever the world learns is kept in the Threadbook: {key:journal}. Come on, down to Vesper Ford!"

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 155

```text
Day 1, 13:36, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
OOOOOOOOOOOO======OOOOOOOOOOOO
PPRRnnRRRRRRRR====RRRRnnRRRRPP
RRRRRRRRRRRRRRc1==RRRRRRRRRRRR
..............====............
..............====............
............,,@@==............
..XXXXXXXX..XXvv==XXXXXXXXXX..
....**..******====****..**..XX
XX****..**##########**..****XX
XX**XX..######t1######..XX**XX
XX..******########t2******....
Terrain: ## cobble, ** flowers, ,, drygrass, .. grass, == path, OO cave_wall, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi
t1 five-wound shrine stone
t2 chalk drawing of a stone

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 156

```text
Day 1, 13:36, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
PPRRnnRRRRRRRR====RRRRnnRRRRPP
RRRRRRRRRRRRRR====RRRRRRRRRRRR
..............c1==............
..............====............
............,,====............
..XXXXXXXX..XX@@==XXXXXXXXXX..
....**..******vv==****..**..XX
XX****..**##########**..****XX
XX**XX..######t1######..XX**XX
XX..******########t2******....
XX..************====****......
Terrain: ## cobble, ** flowers, ,, drygrass, .. grass, == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing down
c1 Lumi
t1 five-wound shrine stone
t2 chalk drawing of a stone

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 157

```text
Day 1, 13:36, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRRRRRRRRR====RRRRRRRRRRRR
..............====............
..............c1==............
............,,====............
..XXXXXXXX..XX====XXXXXXXXXX..
....**..******@@==****..**..XX
XX****..**####vv####**..****XX
XX**XX..######t1######..XX**XX
XX..******########t2******....
XX..************====****......
......**********====**........
Terrain: ## cobble, ** flowers, ,, drygrass, .. grass, == path, RR rock, XX wall
@@ You — facing down
c1 Lumi
t1 five-wound shrine stone
t2 chalk drawing of a stone

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on cobblestones
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 158

```text
Day 1, 13:36, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
..............====............
..............====............
............,,c1==............
..XXXXXXXX..XX====XXXXXXXXXX..
....**..******====****..**..XX
XX****..**####@@####**..****XX
XX**XX..######t1######..XX**XX
XX..******########t2******....
XX..************====****......
......**********====**........
....XX....**..**====....XX....
Terrain: ## cobble, ** flowers, ,, drygrass, .. grass, == path, XX wall
@@ You — facing down (in front: t1)
c1 Lumi
t1 five-wound shrine stone
t2 chalk drawing of a stone

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with five-wound shrine stone
- take: —
- put: Set Stone down by five-wound shrine stone
- use: Use Stone on five-wound shrine stone
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 159

```text
Day 1, 13:37, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
............====..............
............====..............
..........,,c1==..............
XXXXXXXX..XX====XXXXXXXXXX....
..**..******====****..**..XX..
****..**######@@>>**..****XX..
**XX..######t1######..XX**XX..
..******########t2******......
..************====****........
....**********====**..........
..XX....**..**====....XX......
Terrain: ## cobble, ** flowers, ,, drygrass, .. grass, == path, XX wall
@@ You — facing right
c1 Lumi
t1 five-wound shrine stone
t2 chalk drawing of a stone

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on cobblestones
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 160

```text
Day 1, 13:37, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
..........====................
..........====................
........,,c1==................
XXXXXX..XX====XXXXXXXXXX......
**..******====****..**..XX....
**..**########@@>>..****XX..XX
XX..######t1######..XX**XX..XX
******########t2******......XX
************====****..........
..**********====**............
XX....**..**====....XX........
Terrain: ## cobble, ** flowers, ,, drygrass, .. grass, == path, XX wall
@@ You — facing right
c1 Lumi
t1 five-wound shrine stone
t2 chalk drawing of a stone

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on flowers
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 161

```text
Day 1, 13:37, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
........====..................
........====..................
......,,c1==..................
XXXX..XX====XXXXXXXXXX........
..******====****..**..XX....PP
..**##########@@>>****XX..XXXX
..######t1######..XX**XX..XXXX
****########t2******......XXXX
**********====****............
**********====**..............
....**..**====....XX..........
Terrain: ## cobble, ** flowers, ,, drygrass, .. grass, == path, PP pine, XX wall
@@ You — facing right
c1 Lumi
t1 five-wound shrine stone
t2 chalk drawing of a stone

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 162

```text
Day 1, 13:37, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
..........====................
..........====................
........,,c1==................
XXXXXX..XX====XXXXXXXXXX......
**..******====****..**..XX....
**..**######<<@@**..****XX..XX
XX..######t1######..XX**XX..XX
******########t2******......XX
************====****..........
..**********====**............
XX....**..**====....XX........
Terrain: ## cobble, ** flowers, ,, drygrass, .. grass, == path, XX wall
@@ You — facing left
c1 Lumi
t1 five-wound shrine stone
t2 chalk drawing of a stone

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on cobblestones
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 163

```text
Day 1, 13:37, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
..........====................
........,,====................
XXXXXX..XX==c1XXXXXXXXXX......
**..******====****..**..XX....
**..**##########**..****XX..XX
XX..######t1##@@##..XX**XX..XX
******########t2******......XX
************====****..........
..**********====**............
XX....**..**====....XX........
............====..,,t3..TT....
Terrain: ## cobble, ** flowers, ,, drygrass, .. grass, == path, TT tree, XX wall
@@ You — facing down (in front: t2)
c1 Lumi
t1 five-wound shrine stone
t2 chalk drawing of a stone
t3 grass tuft

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with chalk drawing of a stone
- take: —
- put: Set Stone down by chalk drawing of a stone
- use: Use Stone on chalk drawing of a stone
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 164

```text
Day 1, 13:37, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
........,,====................
XXXXXX..XX====XXXXXXXXXX......
**..******====c1**..**..XX....
**..**##########**..****XX..XX
XX..######t1######..XX**XX..XX
******########@@******......XX
************==vv****..........
..**********====**............
XX....**..**====....XX........
............====..,,t3..TT....
............====..,,..........
Terrain: ## cobble, ** flowers, ,, drygrass, .. grass, == path, TT tree, XX wall
@@ You — facing down
c1 Lumi
t1 five-wound shrine stone
t2 chalk drawing of a stone
t3 grass tuft

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with chalk drawing of a stone
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 165

```text
Day 1, 13:38, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXX..XX====XXXXXXXXXX......
**..******====****..**..XX....
**..**########c1**..****XX..XX
XX..######t1######..XX**XX..XX
******########t2******......XX
************==@@****..........
..**********==vv**............
XX....**..**====....XX........
............====..,,t3..TT....
............====..,,..........
==============................
Terrain: ## cobble, ** flowers, ,, drygrass, .. grass, == path, TT tree, XX wall
@@ You — facing down
c1 Lumi
t1 five-wound shrine stone
t2 chalk drawing of a stone
t3 grass tuft

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- Lumi: "Look, a waypoint statue! Walk up to it and press {key:hands} to wake it. After that, the map ({key:map}) can bring you back to it from anywhere."

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 166

```text
Day 1, 13:38, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
**..******====****..**..XX....
**..**##########**..****XX..XX
XX..######t1##c1##..XX**XX..XX
******########t2******......XX
************====****..........
..**********==@@**............
XX....**..**==vv....XX........
............====..,,t3..TT....
............====..,,..........
==============................
..........====....t4..........
Terrain: ## cobble, ** flowers, ,, drygrass, .. grass, == path, TT tree, XX wall
@@ You — facing down
t1 five-wound shrine stone
c1 Lumi
t2 chalk drawing of a stone
t3 grass tuft
t4 Woundstone Foot statue

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 167

```text
Day 1, 13:38, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
**..**##########**..****XX..XX
XX..######t1######..XX**XX..XX
******########c1******......XX
************====****..........
..**********====**............
XX....**..**==@@....XX........
............==vv..,,t3..TT....
............====..,,..........
==============................
..........====....t4..........
..........====................
Terrain: ## cobble, ** flowers, ,, drygrass, .. grass, == path, TT tree, XX wall
@@ You — facing down
t1 five-wound shrine stone
c1 Lumi
t2 chalk drawing of a stone — under c1
t3 grass tuft
t4 Woundstone Foot statue

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 168

```text
Day 1, 13:38, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
XX..######t1######..XX**XX..XX
******########t2******......XX
************==c1****..........
..**********====**............
XX....**..**====....XX........
............==@@..,,t3..TT....
............==vv..,,..........
==============................
..........====....t4..........
..........====................
........====....t5............
Terrain: ## cobble, ** flowers, ,, drygrass, .. grass, == path, TT tree, XX wall
@@ You — facing down
t1 five-wound shrine stone
t2 chalk drawing of a stone
c1 Lumi
t3 grass tuft
t4 Woundstone Foot statue
t5 grass tuft

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 169

```text
Day 1, 13:39, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
******########t1******......XX
************====****..........
..**********==c1**............
XX....**..**====....XX........
............====..,,t2..TT....
............==@@..,,..........
==============vv..............
..........====....t3..........
..........====................
........====....t4............
....t5..====..........,,,,,,,,
Terrain: ## cobble, ** flowers, ,, drygrass, .. grass, == path, TT tree, XX wall
@@ You — facing down
t1 chalk drawing of a stone
c1 Lumi
t2 grass tuft
t3 Woundstone Foot statue
t4 grass tuft
t5 wildflowers

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 170

```text
Day 1, 13:39, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
XX..######t1######..XX**XX..XX
******########t2******......XX
************====****..........
..**********==c1**............
XX....**..**==^^....XX........
............==@@..,,t3..TT....
............====..,,..........
==============................
..........====....t4..........
..........====................
........====....t5............
Terrain: ## cobble, ** flowers, ,, drygrass, .. grass, == path, TT tree, XX wall
@@ You — facing up
t1 five-wound shrine stone
t2 chalk drawing of a stone
c1 Lumi
t3 grass tuft
t4 Woundstone Foot statue
t5 grass tuft

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 171

```text
Day 1, 13:39, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
******########t1******......XX
************====****..........
..**********==c1**............
XX....**..**====....XX........
............====..,,t2..TT....
............==@@..,,..........
==============vv..............
..........====....t3..........
..........====................
........====....t4............
....t5..====..........,,,,,,,,
Terrain: ## cobble, ** flowers, ,, drygrass, .. grass, == path, TT tree, XX wall
@@ You — facing down
t1 chalk drawing of a stone
c1 Lumi
t2 grass tuft
t3 Woundstone Foot statue
t4 grass tuft
t5 wildflowers

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 172

```text
Day 1, 13:39, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
****########t1******......XXXX
**********====****............
**********==c1**..............
....**..**====....XX..........
..........====..,,t2..TT......
..........====@@>>............
============..................
........====....t3............
........====..................
......====....t4..............
..t5..====..........,,,,,,,,,,
Terrain: ## cobble, ** flowers, ,, drygrass, .. grass, == path, TT tree, XX wall
@@ You — facing right
t1 chalk drawing of a stone
c1 Lumi
t2 grass tuft
t3 Woundstone Foot statue
t4 grass tuft
t5 wildflowers

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dry grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 173

```text
Day 1, 13:39, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
**********====****............
**********====**..............
....**..**====c1..XX..........
..........====..,,t1..TT......
..........====..,,............
============..@@..............
........====..vvt2............
........====..................
......====....t3..............
..t4..====..........,,,,,,,,,,
....====....XX......,,,,,,,,,,
Terrain: ** flowers, ,, drygrass, .. grass, == path, TT tree, XX wall
@@ You — facing down
c1 Lumi
t1 grass tuft
t2 Woundstone Foot statue
t3 grass tuft
t4 wildflowers

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 174

```text
Day 1, 13:40, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
********====****..............
********====**................
..**..**====c1..XX............
........====..,,t1..TT........
........====..,,..............
==========....@@>>............
......====....t2..............
......====....................
....====....t3................
t4..====..........,,,,,,,,,,PP
..====....XX......,,,,,,,,,,,,
Terrain: ** flowers, ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing right
c1 Lumi
t1 grass tuft
t2 Woundstone Foot statue
t3 grass tuft
t4 wildflowers

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 175

```text
Day 1, 13:40, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
**********====****............
**********====**..............
....**..**====c1..XX..........
..........====..,,t1..TT......
..........====..,,............
============<<@@..............
........====....t2............
........====..................
......====....t3..............
..t4..====..........,,,,,,,,,,
....====....XX......,,,,,,,,,,
Terrain: ** flowers, ,, drygrass, .. grass, == path, TT tree, XX wall
@@ You — facing left
c1 Lumi
t1 grass tuft
t2 Woundstone Foot statue
t3 grass tuft
t4 wildflowers

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 176

```text
Day 1, 13:40, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
**********====**..............
....**..**====....XX..........
..........====c1,,t1..TT......
..........====..,,............
============..................
........====..@@t2............
........====..vv..............
......====....t3..............
..t4..====..........,,,,,,,,,,
....====....XX......,,,,,,,,,,
....====t5..........,,,,,,,,,,
Terrain: ** flowers, ,, drygrass, .. grass, == path, TT tree, XX wall
@@ You — facing down
c1 Lumi
t1 grass tuft
t2 Woundstone Foot statue
t3 grass tuft
t4 wildflowers
t5 sign

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 177

```text
Day 1, 13:40, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
....**..**====....XX..........
..........====..,,t1..TT......
..........====c1,,............
============..................
........====....t2............
........====..@@..............
......====....t3..............
..t4..====..........,,,,,,,,,,
....====....XX......,,,,,,,,,,
....====t5..........,,,,,,,,,,
..====......,,,,,,,,........PP
Terrain: ** flowers, ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing down (in front: t3)
t1 grass tuft
c1 Lumi
t2 Woundstone Foot statue
t3 grass tuft
t4 wildflowers
t5 sign

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Pick up grass tuft
- take: —
- put: Set Stone down by grass tuft
- use: Use Stone on grass tuft
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 178

```text
Day 1, 13:40, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
..........====..,,t1..TT......
..........====..,,............
============..c1..............
........====....t2............
........====..................
......====....@@..............
..t4..====....vv....,,,,,,,,,,
....====....XX......,,,,,,,,,,
....====t5..........,,,,,,,,,,
..====......,,,,,,,,........PP
..====,,,,,,,,TTTTPPTTPPTTTTTT
Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing down
t1 grass tuft
c1 Lumi
t2 Woundstone Foot statue
t3 grass tuft
t4 wildflowers
t5 sign

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Pick up grass tuft
- take: —
- put: Place Stone
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 179

```text
Day 1, 13:41, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
..........====..,,............
============..................
........====..c1t1............
........====..................
......====....t2..............
..t3..====....@@....,,,,,,,,,,
....====....XXvv....,,,,,,,,,,
....====t4..........,,,,,,,,,,
..====......,,,,,,,,........PP
..====,,,,,,,,TTTTPPTTPPTTTTTT
..====,,PPTTTTPPTTTTTTPPTTTTPP
Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing down
c1 Lumi
t1 Woundstone Foot statue
t2 grass tuft
t3 wildflowers
t4 sign

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 180

```text
Day 1, 13:41, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
============..................
........====....t1............
........====..c1..............
......====....t2..............
..t3..====..........,,,,,,,,,,
....====....XX@@....,,,,,,,,,,
....====t4....vv....,,,,,,,,,,
..====......,,,,,,,,........PP
..====,,,,,,,,TTTTPPTTPPTTTTTT
..====,,PPTTTTPPTTTTTTPPTTTTPP
PP====PPTTTTTTPPTTTTPPTTTTTTPP
Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing down
t1 Woundstone Foot statue
c1 Lumi
t2 grass tuft
t3 wildflowers
t4 sign

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 181

```text
Day 1, 13:41, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
........====....t1............
........====..................
......====....c1..............
..t3..====..........,,,,,,,,,,
....====....XX......,,,,,,,,,,
....====t4....@@....,,,,,,,,,,
..====......,,vv,,,,........PP
..====,,,,,,,,TTTTPPTTPPTTTTTT
..====,,PPTTTTPPTTTTTTPPTTTTPP
PP====PPTTTTTTPPTTTTPPTTTTTTPP

Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing down
t1 Woundstone Foot statue
c1 Lumi
t2 grass tuft — under c1
t3 wildflowers
t4 sign

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dry grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 182

```text
Day 1, 13:41, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
........====..................
......====....t1..............
..t2..====....c1....,,,,,,,,,,
....====....XX......,,,,,,,,,,
....====t3..........,,,,,,,,,,
..====......,,@@,,,,........PP
..====,,,,,,,,vvTTPPTTPPTTTTTT
..====,,PPTTTTPPTTTTTTPPTTTTPP
PP====PPTTTTTTPPTTTTPPTTTTTTPP


Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing down
t1 grass tuft
t2 wildflowers
c1 Lumi
t3 sign

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with tree
- take: —
- put: —
- use: Use Stone on tree
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 183

```text
Day 1, 13:41, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
......====....................
....====....t1................
t2..====....c1....,,,,,,,,,,PP
..====....XX......,,,,,,,,,,,,
..====t3..........,,,,,,,,,,,,
====......,,,,@@>>........PPTT
====,,,,,,,,TTTTPPTTPPTTTTTTPP
====,,PPTTTTPPTTTTTTPPTTTTPPTT
====PPTTTTTTPPTTTTPPTTTTTTPPTT


Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing right
t1 grass tuft
t2 wildflowers
c1 Lumi
t3 sign

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dry grass
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 184

```text
Day 1, 13:41, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
......====....t1..............
......====....................
....====....t2................
t3..====....c1....,,,,,,,,,,PP
..====....XX..^^..,,,,,,,,,,,,
..====t4......@@..,,,,,,,,,,,,
====......,,,,,,,,........PPTT
====,,,,,,,,TTTTPPTTPPTTTTTTPP
====,,PPTTTTPPTTTTTTPPTTTTPPTT
====PPTTTTTTPPTTTTPPTTTTTTPPTT

Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing up
t1 Woundstone Foot statue
t2 grass tuft
t3 wildflowers
c1 Lumi
t4 sign

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 185

```text
Day 1, 13:42, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
........====....t1............
........====..................
......====....t2..............
..t3..====....c1....,,,,,,,,,,
....====....XX......,,,,,,,,,,
....====t4..<<@@....,,,,,,,,,,
..====......,,,,,,,,........PP
..====,,,,,,,,TTTTPPTTPPTTTTTT
..====,,PPTTTTPPTTTTTTPPTTTTPP
PP====PPTTTTTTPPTTTTPPTTTTTTPP

Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing left
t1 Woundstone Foot statue
t2 grass tuft
t3 wildflowers
c1 Lumi
t4 sign

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **talk 1**

## Turn 186

```text
Day 1, 13:42, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
........====....t1............
........====..................
......====....t2..............
..t3..====....c1....,,,,,,,,,,
....====....XX......,,,,,,,,,,
....====t4..<<@@....,,,,,,,,,,
..====......,,,,,,,,........PP
..====,,,,,,,,TTTTPPTTPPTTTTTT
..====,,PPTTTTPPTTTTTTPPTTTTPP
PP====PPTTTTTTPPTTTTPPTTTTTTPP

Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing left
t1 Woundstone Foot statue
t2 grass tuft
t3 wildflowers
c1 Lumi
t4 sign

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 187

```text
Day 1, 13:42, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
........====..................
......====....t1..............
..t2..====....c1....,,,,,,,,,,
....====....XX......,,,,,,,,,,
....====t3..........,,,,,,,,,,
..====......,,@@,,,,........PP
..====,,,,,,,,vvTTPPTTPPTTTTTT
..====,,PPTTTTPPTTTTTTPPTTTTPP
PP====PPTTTTTTPPTTTTPPTTTTTTPP


Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing down
t1 grass tuft
t2 wildflowers
c1 Lumi
t3 sign

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with tree
- take: —
- put: —
- use: Use Stone on tree
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 188

```text
Day 1, 13:42, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
........====....t1............
........====..................
......====....t2..............
..t3..====....c1....,,,,,,,,,,
....====....XX^^....,,,,,,,,,,
....====t4....@@....,,,,,,,,,,
..====......,,,,,,,,........PP
..====,,,,,,,,TTTTPPTTPPTTTTTT
..====,,PPTTTTPPTTTTTTPPTTTTPP
PP====PPTTTTTTPPTTTTPPTTTTTTPP

Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing up
t1 Woundstone Foot statue
t2 grass tuft
t3 wildflowers
c1 Lumi
t4 sign

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 189

```text
Day 1, 13:42, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
..........====....t1..........
..........====................
........====....t2............
....t3..====....c1....,,,,,,,,
......====....XX......,,,,,,,,
......====t4<<@@......,,,,,,,,
....====......,,,,,,,,........
....====,,,,,,,,TTTTPPTTPPTTTT
....====,,PPTTTTPPTTTTTTPPTTTT
TTPP====PPTTTTTTPPTTTTPPTTTTTT

Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing left
t1 Woundstone Foot statue
t2 grass tuft
t3 wildflowers
c1 Lumi
t4 sign

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **talk 1**

## Turn 190

```text
Day 1, 13:43, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
..........====....t1..........
..........====................
........====....t2............
....t3..====....c1....,,,,,,,,
......====....XX......,,,,,,,,
......====t4<<@@......,,,,,,,,
....====......,,,,,,,,........
....====,,,,,,,,TTTTPPTTPPTTTT
....====,,PPTTTTPPTTTTTTPPTTTT
TTPP====PPTTTTTTPPTTTTPPTTTTTT

Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing left
t1 Woundstone Foot statue
t2 grass tuft
t3 wildflowers
c1 Lumi
t4 sign

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **look**

## Turn 191

```text
Day 1, 13:43, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
..........====....t1..........
..........====................
........====....t2............
....t3..====....c1....,,,,,,,,
......====....XX......,,,,,,,,
......====t4<<@@......,,,,,,,,
....====......,,,,,,,,........
....====,,,,,,,,TTTTPPTTPPTTTT
....====,,PPTTTTPPTTTTTTPPTTTT
TTPP====PPTTTTTTPPTTTTPPTTTTTT

Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing left
t1 Woundstone Foot statue
t2 grass tuft
t3 wildflowers
c1 Lumi
t4 sign

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 192

```text
Day 1, 13:43, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
..........====................
........====....t1............
....t2..====....c1....,,,,,,,,
......====....XX......,,,,,,,,
......====t3..........,,,,,,,,
....====......@@,,,,,,........
....====,,,,,,vvTTTTPPTTPPTTTT
....====,,PPTTTTPPTTTTTTPPTTTT
TTPP====PPTTTTTTPPTTTTPPTTTTTT


Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing down
t1 grass tuft
t2 wildflowers
c1 Lumi
t3 sign

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dry grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 193

```text
Day 1, 13:43, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
........====....t1............
....t2..====..........,,,,,,,,
......====....c1......,,,,,,,,
......====t3..........,,,,,,,,
....====......,,,,,,,,........
....====,,,,,,@@TTTTPPTTPPTTTT
....====,,PPTTvvPPTTTTTTPPTTTT
TTPP====PPTTTTTTPPTTTTPPTTTTTT



Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree
@@ You — facing down
t1 grass tuft
t2 wildflowers
c1 Lumi
t3 sign

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with tree
- take: —
- put: —
- use: Use Stone on tree
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 194

```text
Day 1, 13:43, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
..........====................
........====....t1............
....t2..====..........,,,,,,,,
......====....c1......,,,,,,,,
......====t3..^^......,,,,,,,,
....====......@@,,,,,,........
....====,,,,,,,,TTTTPPTTPPTTTT
....====,,PPTTTTPPTTTTTTPPTTTT
TTPP====PPTTTTTTPPTTTTPPTTTTTT


Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree
@@ You — facing up
t1 grass tuft
t2 wildflowers
c1 Lumi
t3 sign

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 195

```text
Day 1, 13:43, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
..........====....t1..........
..........====................
........====....t2............
....t3..====..........,,,,,,,,
......====....^^......,,,,,,,,
......====t4..@@......,,,,,,,,
....====......c1,,,,,,........
....====,,,,,,,,TTTTPPTTPPTTTT
....====,,PPTTTTPPTTTTTTPPTTTT
TTPP====PPTTTTTTPPTTTTPPTTTTTT

Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree
@@ You — facing up
t1 Woundstone Foot statue
t2 grass tuft
t3 wildflowers
t4 sign
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with stone wall
- take: —
- put: —
- use: Use Stone on stone wall
- self: Use Stone on yourself
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 196

```text
Day 1, 13:44, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
............====....t1........
............====..............
..........====....t2..........
......t3..====..........,,,,,,
........====....XX......,,,,,,
........====t4@@........,,,,,,
......====......c1,,,,,,......
......====,,,,,,,,TTTTPPTTPPTT
......====,,PPTTTTPPTTTTTTPPTT
TTTTPP====PPTTTTTTPPTTTTPPTTTT

Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing left (in front: t4)
t1 Woundstone Foot statue
t2 grass tuft
t3 wildflowers
t4 sign
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Read sign
- take: —
- put: Set Stone down by sign
- use: Use Stone on sign
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands**

## Turn 197

```text
Day 1, 13:44, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
............====....t1........
............====..............
..........====....t2..........
......t3..====..........,,,,,,
........====....XX......,,,,,,
........====t4@@........,,,,,,
......====......c1,,,,,,......
......====,,,,,,,,TTTTPPTTPPTT
......====,,PPTTTTPPTTTTTTPPTT
TTTTPP====PPTTTTTTPPTTTTPPTTTT

Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing left (in front: t4)
t1 Woundstone Foot statue
t2 grass tuft
t3 wildflowers
t4 sign
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- sign: "Vesper Ford ↓"

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Read sign
- take: —
- put: Set Stone down by sign
- use: Use Stone on sign
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 198

```text
Day 1, 13:44, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
............====..............
..........====....t1..........
......t2..====..........,,,,,,
........====....XX......,,,,,,
........====t3..........,,,,,,
......====....@@c1,,,,,,......
......====,,,,vv,,TTTTPPTTPPTT
......====,,PPTTTTPPTTTTTTPPTT
TTTTPP====PPTTTTTTPPTTTTPPTTTT


Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing down
t1 grass tuft
t2 wildflowers
t3 sign
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dry grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 199

```text
Day 1, 13:44, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
..........====....t1..........
......t2..====..........,,,,,,
........====....XX......,,,,,,
........====t3..........,,,,,,
......====......c1,,,,,,......
......====,,,,@@,,TTTTPPTTPPTT
......====,,PPvvTTPPTTTTTTPPTT
TTTTPP====PPTTTTTTPPTTTTPPTTTT



Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing down
t1 grass tuft
t2 wildflowers
t3 sign
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with tree
- take: —
- put: —
- use: Use Stone on tree
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 200

```text
Day 1, 13:44, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
,,..........====....t1........
,,......t2..====..........,,,,
,,........====....XX......,,,,
,,........====t3..........,,,,
,,......====......c1,,,,,,....
,,......====<<@@,,,,TTTTPPTTPP
TT......====,,PPTTTTPPTTTTTTPP
TTTTTTPP====PPTTTTTTPPTTTTPPTT



Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing left
t1 grass tuft
t2 wildflowers
t3 sign
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dry grass
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 201

```text
Day 1, 13:44, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
..........====....t1..........
......t2..====..........,,,,,,
........====....XX......,,,,,,
........====t3..........,,,,,,
......====......c1,,,,,,......
......====,,,,@@>>TTTTPPTTPPTT
......====,,PPTTTTPPTTTTTTPPTT
TTTTPP====PPTTTTTTPPTTTTPPTTTT



Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing right
t1 grass tuft
t2 wildflowers
t3 sign
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dry grass
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 202

```text
Day 1, 13:45, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
,,..........====....t1........
,,......t2..====..........,,,,
,,........====....XX......,,,,
,,........====t3..........,,,,
,,......====......c1,,,,,,....
,,......====<<@@,,,,TTTTPPTTPP
TT......====,,PPTTTTPPTTTTTTPP
TTTTTTPP====PPTTTTTTPPTTTTPPTT



Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing left
t1 grass tuft
t2 wildflowers
t3 sign
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dry grass
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 203

```text
Day 1, 13:45, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
,,............====............
,,..........====....t1........
,,......t2..====..........,,,,
,,........====....XX......,,,,
,,........====t3..........,,,,
,,......====..@@..c1,,,,,,....
,,......====,,,,,,,,TTTTPPTTPP
TT......====,,PPTTTTPPTTTTTTPP
TTTTTTPP====PPTTTTTTPPTTTTPPTT


Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing up (in front: t3)
t1 grass tuft
t2 wildflowers
t3 sign
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Read sign
- take: —
- put: Set Stone down by sign
- use: Use Stone on sign
- self: Use Stone on yourself
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 204

```text
Day 1, 13:45, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
,,,,............====..........
,,,,..........====....t1......
,,,,......t2..====..........,,
,,,,........====....XX......,,
,,,,........====t3..........,,
,,,,......==<<@@....c1,,,,,,..
,,,,......====,,,,,,,,TTTTPPTT
TTTT......====,,PPTTTTPPTTTTTT
PPTTTTTTPP====PPTTTTTTPPTTTTPP


Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing left
t1 grass tuft
t2 wildflowers
t3 sign
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **talk 1**

## Turn 205

```text
Day 1, 13:45, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
,,,,............====..........
,,,,..........====....t1......
,,,,......t2..====..........,,
,,,,........====....XX......,,
,,,,........====t3..........,,
,,,,......==<<@@....c1,,,,,,..
,,,,......====,,,,,,,,TTTTPPTT
TTTT......====,,PPTTTTPPTTTTTT
PPTTTTTTPP====PPTTTTTTPPTTTTPP


Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing left
t1 grass tuft
t2 wildflowers
t3 sign
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 206

```text
Day 1, 13:45, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
,,,,..........====....t1......
,,,,......t2..====..........,,
,,,,........====....XX......,,
,,,,........====t3..........,,
,,,,......====......c1,,,,,,..
,,,,......====@@,,,,,,TTTTPPTT
TTTT......====vvPPTTTTPPTTTTTT
PPTTTTTTPP====PPTTTTTTPPTTTTPP



Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing down
t1 grass tuft
t2 wildflowers
t3 sign
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dry grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 207

```text
Day 1, 13:45, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
,,,,......t1..====..........,,
,,,,........====....XX......,,
,,,,........====t2..........,,
,,,,......====......c1,,,,,,..
,,,,......====,,,,,,,,TTTTPPTT
TTTT......====@@PPTTTTPPTTTTTT
PPTTTTTTPP====vvTTTTTTPPTTTTPP




Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing down
t1 wildflowers
t2 sign
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with pine tree
- take: —
- put: —
- use: Use Stone on pine tree
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 208

```text
Day 1, 13:46, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
,,,,,,......t1..====..........
,,,,,,........====....XX......
TT,,,,........====t2..........
,,,,,,......====......,,,,,,,,
,,,,,,......====,,,,c1,,TTTTPP
TTTTTT......<<@@,,PPTTTTPPTTTT
TTPPTTTTTTPP====PPTTTTTTPPTTTT




Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing left
t1 wildflowers
t2 sign
c1 Lumi

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable (to Vesper Ford) · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 209

```text
Day 1, 13:46, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):




OOOOOOOOOOOO====OOOOOOOOTTTTTT
OOOOOOOOOOOO==@@OOc1OOOOPPbbPP
OOOOOOOOOOOO==vvOOOOOOOOTTnnnn
..........XX==..XX......TTnnnn
............==TTt1..t2....nnnn
,,,,,,......==TT..t3........nn
t4,,,,,,..t5==......t6........
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing down
c1 Lumi
t1 fallen leaves
t2 boulder
t3 boulder
t4 Cut Grass
t5 Stone
t6 Stone

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- You are in Vesper Ford

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable (to Woundstone Foot) · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **talk 1**

## Turn 210

```text
Day 1, 13:46, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):




OOOOOOOOOOOO====OOOOOOOOTTTTTT
OOOOOOOOOOOO==@@OOc1OOOOPPbbPP
OOOOOOOOOOOO==vvOOOOOOOOTTnnnn
..........XX==..XX......TTnnnn
............==TTt1..t2....nnnn
,,,,,,......==TT..t3........nn
t4,,,,,,..t5==......t6........
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing down
c1 Lumi
t1 fallen leaves
t2 boulder
t3 boulder
t4 Cut Grass
t5 Stone
t6 Stone

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- Quest descent → stage 40
- Lumi: "That's Vesper Ford! Someone down there looks like they need help."

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable (to Woundstone Foot) · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 211

```text
Day 1, 13:46, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):




OOOOOOOOOOOOOO====OOOOOOOOTTTT
OOOOOOOOOOOO<<@@==OOc1OOOOPPbb
OOOOOOOOOOOOOO====OOOOOOOOTTnn
t1..........XX==..XX......TTnn
..............==TTt2..t3....nn
t4,,,,,,......==TT..t5........
,,t6,,,,,,..t7==......t8......
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing left
c1 Lumi
t1 boulder
t2 fallen leaves
t3 boulder
t4 Cut Grass
t5 boulder
t6 Cut Grass
t7 Stone
t8 Stone

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Interact with cave wall
- take: —
- put: —
- use: Use Stone on cave wall
- self: Use Stone on yourself
- move: up walkable (to Woundstone Foot) · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 212

```text
Day 1, 13:47, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):



OOOOOOOOOOOOOO====OOOOOOOOTTTT
OOOOOOOOOOOOOO====OOc1OOOOPPbb
OOOOOOOOOOOOOO@@==OOOOOOOOTTnn
t1..........XXvv..XX......TTnn
..............==TTt2..t3....nn
t4,,,,,,....P1==TT..t5........
,,t6,,,,,,..t7==......t8......
,,,,t9,,,,====tA..tB....TT....
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing down
c1 Lumi
t1 boulder
t2 fallen leaves
t3 boulder
t4 Cut Grass
P1 Hesper
t5 boulder
t6 Cut Grass
t7 Stone
t8 Stone
t9 Cut Grass
tA Stone
tB grass tuft

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- Hesper: "Off the mountain? Nobody has come down that stair since the storm. And the evenings come sooner every week."

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **advance**

## Turn 213

```text
Day 1, 13:48, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):



OOOOOOOOOOOOOO====c1OOOOOOTTTT
OOOOOOOOOOOOOO====OOOOOOOOPPbb
OOOOOOOOOOOOOO@@==OOOOOOOOTTnn
t1..........XXvv..XX......TTnn
..............==TTt2..t3....nn
t4,,,,,,....P1==TT..t5........
,,t6,,,,,,..t7==......t8......
,,,,t9,,,,====tA..tB....TT....
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing down
c1 Lumi
t1 boulder
t2 fallen leaves
t3 boulder
t4 Cut Grass
P1 Hesper
t5 boulder
t6 Cut Grass
t7 Stone
t8 Stone
t9 Cut Grass
tA Stone
tB grass tuft

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- Hesper: "The storm took my ferry rope. The bridge was a rider. He was all in white, with a crown of thorns grown through his helm. He pulled the planks up with his hands and laid the nails out on my pier in a row, like a toll."

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **advance**

## Turn 214

```text
Day 1, 13:48, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):



OOOOOOOOOOOOOO====c1OOOOOOTTTT
OOOOOOOOOOOOOO====OOOOOOOOPPbb
OOOOOOOOOOOOOO@@==OOOOOOOOTTnn
t1..........XXvv..XX......TTnn
..............==TTt2..t3....nn
t4,,,,,,....P1==TT..t5........
,,t6,,,,,,..t7==......t8......
,,,,t9,,,,====tA..tB....TT....
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing down
c1 Lumi
t1 boulder
t2 fallen leaves
t3 boulder
t4 Cut Grass
P1 Hesper
t5 boulder
t6 Cut Grass
t7 Stone
t8 Stone
t9 Cut Grass
tA Stone
tB grass tuft

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- Hesper: "Three planks would mend it. There's an old axe by the stump, and the woods are full of trees."

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 215

```text
Day 1, 13:48, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):



OOOOOOOOOOOOOO====c1OOOOOOTTTT
OOOOOOOOOOOOOO====OOOOOOOOPPbb
OOOOOOOOOOOOOO@@==OOOOOOOOTTnn
t1..........XXvv..XX......TTnn
..............==TTt2..t3....nn
t4,,,,,,....P1==TT..t5........
,,t6,,,,,,..t7==......t8......
,,,,t9,,,,====tA..tB....TT....
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing down
c1 Lumi
t1 boulder
t2 fallen leaves
t3 boulder
t4 Cut Grass
P1 Hesper
t5 boulder
t6 Cut Grass
t7 Stone
t8 Stone
t9 Cut Grass
tA Stone
tB grass tuft

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **advance**

## Turn 216

```text
Day 1, 13:48, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):



OOOOOOOOOOOOOO====c1OOOOOOTTTT
OOOOOOOOOOOOOO====OOOOOOOOPPbb
OOOOOOOOOOOOOO@@==OOOOOOOOTTnn
t1..........XXvv..XX......TTnn
..............==TTt2..t3....nn
t4,,,,,,....P1==TT..t5........
,,t6,,,,,,..t7==......t8......
,,,,t9,,,,====tA..tB....TT....
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing down
c1 Lumi
t1 boulder
t2 fallen leaves
t3 boulder
t4 Cut Grass
P1 Hesper
t5 boulder
t6 Cut Grass
t7 Stone
t8 Stone
t9 Cut Grass
tA Stone
tB grass tuft

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- Hesper: "West of here is Firstlight Village. Tobin keeps his cart there now. A meal might buy you something useful from him."

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 217

```text
Day 1, 13:48, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):



OOOOOOOOOOOOOO====c1OOOOOOTTTT
OOOOOOOOOOOOOO====OOOOOOOOPPbb
OOOOOOOOOOOOOO@@==OOOOOOOOTTnn
t1..........XXvv..XX......TTnn
..............==TTt2..t3....nn
t4,,,,,,....P1==TT..t5........
,,t6,,,,,,..t7==......t8......
,,,,t9,,,,====tA..tB....TT....
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing down
c1 Lumi
t1 boulder
t2 fallen leaves
t3 boulder
t4 Cut Grass
P1 Hesper
t5 boulder
t6 Cut Grass
t7 Stone
t8 Stone
t9 Cut Grass
tA Stone
tB grass tuft

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **advance**

## Turn 218

```text
Day 1, 13:48, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):



OOOOOOOOOOOOOO====c1OOOOOOTTTT
OOOOOOOOOOOOOO====OOOOOOOOPPbb
OOOOOOOOOOOOOO@@==OOOOOOOOTTnn
t1..........XXvv..XX......TTnn
..............==TTt2..t3....nn
t4,,,,,,....P1==TT..t5........
,,t6,,,,,,..t7==......t8......
,,,,t9,,,,====tA..tB....TT....
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing down
c1 Lumi
t1 boulder
t2 fallen leaves
t3 boulder
t4 Cut Grass
P1 Hesper
t5 boulder
t6 Cut Grass
t7 Stone
t8 Stone
t9 Cut Grass
tA Stone
tB grass tuft

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- Hesper: "It's a small place. Good soil, a well, and a roof when the weather turns."

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **advance**

## Turn 219

```text
Day 1, 13:48, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):



OOOOOOOOOOOOOO====c1OOOOOOTTTT
OOOOOOOOOOOOOO====OOOOOOOOPPbb
OOOOOOOOOOOOOO@@==OOOOOOOOTTnn
t1..........XXvv..XX......TTnn
..............==TTt2..t3....nn
t4,,,,,,....P1==TT..t5........
,,t6,,,,,,..t7==......t8......
,,,,t9,,,,====tA..tB....TT....
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing down
c1 Lumi
t1 boulder
t2 fallen leaves
t3 boulder
t4 Cut Grass
P1 Hesper
t5 boulder
t6 Cut Grass
t7 Stone
t8 Stone
t9 Cut Grass
tA Stone
tB grass tuft

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- Hesper: "They've had it worse than me, though. Two of theirs went missing in the storm, I hear. Rowan, their elder, is asking anyone who can hold a blade. The bridge can wait. Go to them first."

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **advance**

## Turn 220

```text
Day 1, 13:48, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):



OOOOOOOOOOOOOO====c1OOOOOOTTTT
OOOOOOOOOOOOOO====OOOOOOOOPPbb
OOOOOOOOOOOOOO@@==OOOOOOOOTTnn
t1..........XXvv..XX......TTnn
..............==TTt2..t3....nn
t4,,,,,,....P1==TT..t5........
,,t6,,,,,,..t7==......t8......
,,,,t9,,,,====tA..tB....TT....
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing down
c1 Lumi
t1 boulder
t2 fallen leaves
t3 boulder
t4 Cut Grass
P1 Hesper
t5 boulder
t6 Cut Grass
t7 Stone
t8 Stone
t9 Cut Grass
tA Stone
tB grass tuft

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected) · [1] Bread

Since your last action:
- You: "(In your pack: the end of a travel loaf.)"

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **select 1**

## Turn 221

```text
Day 1, 13:48, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):



OOOOOOOOOOOOOO====c1OOOOOOTTTT
OOOOOOOOOOOOOO====OOOOOOOOPPbb
OOOOOOOOOOOOOO@@==OOOOOOOOTTnn
t1..........XXvv..XX......TTnn
..............==TTt2..t3....nn
t4,,,,,,....P1==TT..t5........
,,t6,,,,,,..t7==......t8......
,,,,t9,,,,====tA..tB....TT....
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing down
c1 Lumi
t1 boulder
t2 fallen leaves
t3 boulder
t4 Cut Grass
P1 Hesper
t5 boulder
t6 Cut Grass
t7 Stone
t8 Stone
t9 Cut Grass
tA Stone
tB grass tuft

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected) · [1] Bread

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **select 1**

## Turn 222

```text
Day 1, 13:48, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):



OOOOOOOOOOOOOO====c1OOOOOOTTTT
OOOOOOOOOOOOOO====OOOOOOOOPPbb
OOOOOOOOOOOOOO@@==OOOOOOOOTTnn
t1..........XXvv..XX......TTnn
..............==TTt2..t3....nn
t4,,,,,,....P1==TT..t5........
,,t6,,,,,,..t7==......t8......
,,,,t9,,,,====tA..tB....TT....
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing down
c1 Lumi
t1 boulder
t2 fallen leaves
t3 boulder
t4 Cut Grass
P1 Hesper
t5 boulder
t6 Cut Grass
t7 Stone
t8 Stone
t9 Cut Grass
tA Stone
tB grass tuft

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected) · [1] Bread

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **advance**

## Turn 223

```text
Day 1, 13:48, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):



OOOOOOOOOOOOOO====c1OOOOOOTTTT
OOOOOOOOOOOOOO====OOOOOOOOPPbb
OOOOOOOOOOOOOO@@==OOOOOOOOTTnn
t1..........XXvv..XX......TTnn
..............==TTt2..t3....nn
t4,,,,,,....P1==TT..t5........
,,t6,,,,,,..t7==......t8......
,,,,t9,,,,====tA..tB....TT....
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing down
c1 Lumi
t1 boulder
t2 fallen leaves
t3 boulder
t4 Cut Grass
P1 Hesper
t5 boulder
t6 Cut Grass
t7 Stone
t8 Stone
t9 Cut Grass
tA Stone
tB grass tuft

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected) · [1] Bread

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 224

```text
Day 1, 13:48, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):


OOOOOOOOOOOOOO====c1OOOOOOTTTT
OOOOOOOOOOOOOO====OOOOOOOOPPbb
OOOOOOOOOOOOOO====OOOOOOOOTTnn
t1..........XX@@..XX......TTnn
..............vvTTt2..t3....nn
t4,,,,,,......P1TT..t5........
,,t6,,,,,,..t7==......t8......
,,,,t9,,,,====tA..tB....TT....
====,,,,,,==,,........TTTT....
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing down
c1 Lumi
t1 boulder
t2 fallen leaves
t3 boulder
t4 Cut Grass
P1 Hesper
t5 boulder
t6 Cut Grass
t7 Stone
t8 Stone
t9 Cut Grass
tA Stone
tB grass tuft

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected) · [1] Bread

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 225

```text
Day 1, 13:48, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):

OOOOOOOOOOOOOO====OOOOOOOOTTTT
OOOOOOOOOOOOOO==c1OOOOOOOOPPbb
OOOOOOOOOOOOOO====OOOOOOOOTTnn
t1..........XX==..XX......TTnn
..............@@TTt2..t3....nn
t4,,,,,,......P1TT..t5........
,,t6,,,,,,..t7==......t8......
,,,,t9,,,,====tA..tB....TT....
====,,,,,,==,,........TTTT....
,,====,,====..tC........bb....
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing down (in front: P1)
c1 Lumi
t1 boulder
t2 fallen leaves
t3 boulder
t4 Cut Grass
P1 Hesper
t5 boulder
t6 Cut Grass
t7 Stone
t8 Stone
t9 Cut Grass
tA Stone
tB grass tuft
tC boulder

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected) · [1] Bread

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: Talk to Hesper
- take: —
- put: Give Stone to Hesper
- use: Use Stone on Hesper
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 226

```text
Day 1, 13:49, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):

OOOOOOOOOOOOOOOO====OOOOOOOOTT
OOOOOOOOOOOOOOOO==c1OOOOOOOOPP
OOOOOOOOOOOOOOOO====OOOOOOOOTT
..t1..........XX==..XX......TT
............<<@@==TTt2..t3....
..t4,,,,,,......==TT..t5......
,,,,t6,,,,,,..t7P1......t8....
==,,,,t9,,,,====tA..tB....TT..
======,,,,,,==,,........TTTT..
,,,,====,,====..tC........bb..
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush
@@ You — facing left
c1 Lumi
t1 boulder
t2 fallen leaves
t3 boulder
t4 Cut Grass
t5 boulder
t6 Cut Grass
t7 Stone
P1 Hesper
t8 Stone
t9 Cut Grass
tA Stone
tB grass tuft
tC boulder

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected) · [1] Bread

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 227

```text
Day 1, 13:49, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):

OOOOOOOOOOOOOOOOOO====OOOOOOOO
OOOOOOOOOOOOOOOOOO==c1OOOOOOOO
OOOOOOOOOOOOOOOOOO====OOOOOOOO
....t1..........XX==..XX......
t2..........<<@@..==TTt3..t4..
::..t5,,,,,,......==TT..t6....
==,,,,t7,,,,,,..t8P1......t9..
====,,,,tA,,,,====tB..tC....TT
,,======,,,,,,==,,........TTTT
,,,,,,====,,====..tD........bb
Terrain: ,, drygrass, .. grass, :: dirt, == path, OO cave_wall, TT tree, XX wall, bb bush
@@ You — facing left
c1 Lumi
t1 boulder
t2 boulder
t3 fallen leaves
t4 boulder
t5 Cut Grass
t6 boulder
t7 Cut Grass
t8 Stone
P1 Hesper
t9 Stone
tA Cut Grass
tB Stone
tC grass tuft
tD boulder

You: hp 40/40 · held: Stone · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone (selected) · [1] Bread

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **select 1**

## Turn 228

```text
Day 1, 13:49, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):

OOOOOOOOOOOOOOOOOO====OOOOOOOO
OOOOOOOOOOOOOOOOOO==c1OOOOOOOO
OOOOOOOOOOOOOOOOOO====OOOOOOOO
....t1..........XX==..XX......
t2..........<<@@..==TTt3..t4..
::..t5,,,,,,......==TT..t6....
==,,,,t7,,,,,,..t8==......t9..
====,,,,tA,,,,====P1..tC....TT
,,======,,,,,,==,,........TTTT
,,,,,,====,,====..tD........bb
Terrain: ,, drygrass, .. grass, :: dirt, == path, OO cave_wall, TT tree, XX wall, bb bush
@@ You — facing left
c1 Lumi
t1 boulder
t2 boulder
t3 fallen leaves
t4 boulder
t5 Cut Grass
t6 boulder
t7 Cut Grass
t8 Stone
t9 Stone
tA Cut Grass
P1 Hesper
tB Stone — under P1
tC grass tuft
tD boulder

You: hp 40/40 · held: Bread · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone · [1] Bread (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Eat Bread
- hands: —
- take: —
- put: Place Bread
- use: Use Bread on grass
- self: Eat Bread
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **primary**

## Turn 229

```text
Day 1, 13:49, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):

OOOOOOOOOOOOOOOOOO====OOOOOOOO
OOOOOOOOOOOOOOOOOO==c1OOOOOOOO
OOOOOOOOOOOOOOOOOO====OOOOOOOO
....t1..........XX==..XX......
t2..........<<@@..==TTt3..t4..
::..t5,,,,,,......==TT..t6....
==,,,,t7,,,,,,..t8==......t9..
====,,,,tA,,,,====P1..tC....TT
,,======,,,,,,==,,........TTTT
,,,,,,====,,====..tD........bb
Terrain: ,, drygrass, .. grass, :: dirt, == path, OO cave_wall, TT tree, XX wall, bb bush
@@ You — facing left
c1 Lumi
t1 boulder
t2 boulder
t3 fallen leaves
t4 boulder
t5 Cut Grass
t6 boulder
t7 Cut Grass
t8 Stone
t9 Stone
tA Cut Grass
P1 Hesper
tB Stone — under P1
tC grass tuft
tD boulder

You: hp 40/40 · held: Bread · worn: nothing · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Stone · [1] Bread (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- Question: Eat Bread? — answer yes · answer no
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **answer yes**

## Turn 230

```text
Day 1, 13:49, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):

OOOOOOOOOOOOOOOOOO====OOOOOOOO
OOOOOOOOOOOOOOOOOO==c1OOOOOOOO
OOOOOOOOOOOOOOOOOO====OOOOOOOO
....t1..........XX==..XX......
t2..........<<@@..==TTt3..t4..
::..t5,,,,,,......==TT..t6....
==,,,,t7,,,,,,..t8==......t9..
====,,,,tA,,,,====P1..tC....TT
,,======,,,,,,==,,........TTTT
,,,,,,====,,====..tD........bb
Terrain: ,, drygrass, .. grass, :: dirt, == path, OO cave_wall, TT tree, XX wall, bb bush
@@ You — facing left
c1 Lumi
t1 boulder
t2 boulder
t3 fallen leaves
t4 boulder
t5 Cut Grass
t6 boulder
t7 Cut Grass
t8 Stone
t9 Stone
tA Cut Grass
P1 Hesper
tB Stone — under P1
tC grass tuft
tD boulder

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone

Since your last action:
- You eat Bread.

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left 10**

## Turn 231

```text
Day 1, 13:50, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):

OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
TT..............t1..........XX
t2t3::t4::::t5@@....c1........
TT::::::::::::..t6,,,,,,......
TTt7::::c2====,,,,t8,,,,,,..t9
TT..::..,,tA====,,,,tB,,,,====
PP..,,,,,,,,,,======,,,,,,==,,
TTPP....,,,,,,,,,,====,,====..
Terrain: ,, drygrass, .. grass, :: dirt, == path, OO cave_wall, PP pine, TT tree, XX wall
@@ You — facing left (in front: t5)
t1 boulder
t2 boulder
t3 moss
t4 slime burrow
t5 boulder
c1 Lumi
t6 Cut Grass
t7 Bone
c2 fire slime
t8 Cut Grass
t9 Stone
tA Bone
tB Cut Grass

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Punch boulder
- hands: Interact with boulder
- take: —
- put: —
- use: Punch boulder
- self: —
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 232

```text
Day 1, 13:50, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):


OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOO^^OOOOOOOOOOOOOO
TT............@@t1..........XX
t2t3::t4::::t5......c1........
TT::::::::::::..t6,,,,,,......
TTt7::::c2====,,,,t8,,,,,,..t9
TT..::..,,tA====,,,,tB,,,,====
PP..,,,,,,,,,,======,,,,,,==,,
Terrain: ,, drygrass, .. grass, :: dirt, == path, OO cave_wall, PP pine, TT tree, XX wall
@@ You — facing up
t1 boulder
t2 boulder
t3 moss
t4 slime burrow
t5 boulder
c1 Lumi
t6 Cut Grass
t7 Bone
c2 fire slime
t8 Cut Grass
t9 Stone
tA Bone
tB Cut Grass

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Punch cave wall
- hands: Interact with cave wall
- take: —
- put: —
- use: Punch cave wall
- self: —
- move: up blocked · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 233

```text
Day 1, 13:51, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):


OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
TTTT........<<@@..t1c1........
TTt2t3::t4::::t5..............
TTTT::::::::::::..t6,,,,,,....
TTTTt7::::c2====,,,,t8,,,,,,..
PPTT..::..,,t9====,,,,tA,,,,==
TTPP..,,,,,,,,,,======,,,,,,==
Terrain: ,, drygrass, .. grass, :: dirt, == path, OO cave_wall, PP pine, TT tree
@@ You — facing left
t1 boulder
c1 Lumi
t2 boulder
t3 moss
t4 slime burrow
t5 boulder
t6 Cut Grass
t7 Bone
c2 fire slime
t8 Cut Grass
t9 Bone
tA Cut Grass

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up blocked · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 234

```text
Day 1, 13:51, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):


OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
TTTTTT......<<@@....c1........
PPTTt2t3::t4::::t5............
TTTTTT::::::::::::..t6,,,,,,..
TTTTTTt7::::c2====,,,,t8,,,,,,
TTPPTT..::..,,t9====,,,,tA,,,,
PPTTPP..,,,,,,,,,,======,,,,,,
Terrain: ,, drygrass, .. grass, :: dirt, == path, OO cave_wall, PP pine, TT tree
@@ You — facing left
c1 Lumi
t1 boulder — under c1
t2 boulder
t3 moss
t4 slime burrow
t5 boulder
t6 Cut Grass
t7 Bone
c2 fire slime
t8 Cut Grass
t9 Bone
tA Cut Grass

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Punch slime burrow
- hands: Interact with slime burrow
- take: —
- put: —
- use: Punch slime burrow
- self: —
- move: up blocked · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 235

```text
Day 1, 13:51, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):

OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
TTTTTT..............c1........
PPTTt2t3::t4::@@t5............
TTTTTT::::::::vv::..t6,,,,,,..
TTTTTTt7::::c2====,,,,t8,,,,,,
TTPPTT..::..,,t9====,,,,tA,,,,
PPTTPP..,,,,,,,,,,======,,,,,,
TTPPTTPP....,,,,,,,,,,====,,==
Terrain: ,, drygrass, .. grass, :: dirt, == path, OO cave_wall, PP pine, TT tree
@@ You — facing down
c1 Lumi
t1 boulder — under c1
t2 boulder
t3 moss
t4 slime burrow
t5 boulder
t6 Cut Grass
t7 Bone
c2 fire slime
t8 Cut Grass
t9 Bone
tA Cut Grass

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left blocked · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 236

```text
Day 1, 13:51, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
TTTTTT..............c1........
PPTTt2t3::t4::::t5............
TTTTTT::::::::@@::..t6,,,,,,..
TTTTTTt7::::c2vv==,,,,t8,,,,,,
TTPPTT..::..,,t9====,,,,tA,,,,
PPTTPP..,,,,,,,,,,======,,,,,,
TTPPTTPP....,,,,,,,,,,====,,==
TTTT..............tB....======
Terrain: ,, drygrass, .. grass, :: dirt, == path, OO cave_wall, PP pine, TT tree
@@ You — facing down
c1 Lumi
t1 boulder — under c1
t2 boulder
t3 moss
t4 slime burrow
t5 boulder
t6 Cut Grass
t7 Bone
c2 fire slime
t8 Cut Grass
t9 Bone
tA Cut Grass
tB haystack

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 237

```text
Day 1, 13:52, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
  OOOOOOOOOOOOOOOOOOOOOOOOOOOO
  OOOOOOOOOOOOOOOOOOOOOOOOOOOO
  OOOOOOOOOOOOOOOOOOOOOOOOOOOO
  TTTTTT..............t1......
  PPTTt2t3::t4::::t5c1........
  TTTTTT::::<<@@::::..t6,,,,,,
  TTTTTTt7::c2::====,,,,t8,,,,
  TTPPTT..::..,,t9====,,,,tA,,
  PPTTPP..,,,,,,,,,,======,,,,
  TTPPTTPP....,,,,,,,,,,====,,
  TTTT..............tB....====
Terrain: ,, drygrass, .. grass, :: dirt, == path, OO cave_wall, PP pine, TT tree
@@ You — facing left
t1 boulder
t2 boulder
t3 moss
t4 slime burrow
t5 boulder
c1 Lumi
t6 Cut Grass
t7 Bone
c2 fire slime
t8 Cut Grass
t9 Bone
tA Cut Grass
tB haystack

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left 10**

## Turn 238

```text
Day 1, 13:52, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
        OOOOOOOOOOOOOOOOOOOOOO
        OOOOOOOOOOOOOOOOOOOOOO
        OOOOOOOOOOOOOOOOOOOOOO
        TTTTTT..............t1
        PPTTt2t3::t4::::t5....
        TTTT<<@@::::c1::::..t6
        TTTTTTt7::c2::====,,,,
        TTPPTT..::..,,t8====,,
        PPTTPP..,,,,,,,,,,====
        TTPPTTPP....,,,,,,,,,,
        TTTT..............t9..
Terrain: ,, drygrass, .. grass, :: dirt, == path, OO cave_wall, PP pine, TT tree
@@ You — facing left
t1 boulder
t2 boulder
t3 moss
t4 slime burrow
t5 boulder
c1 Lumi
t6 Cut Grass
t7 Bone
c2 fire slime
t8 Bone
t9 haystack

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Punch tree
- hands: Interact with tree
- take: —
- put: —
- use: Punch tree
- self: —
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 239

```text
Day 1, 13:52, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
        OOOOOOOOOOOOOOOOOOOOOO
        OOOOOOOOOOOOOOOOOOOOOO
        TTTTTT..............t1
        PPTTt2t3::t4::::t5....
        TTTTTT::::::c1::::..t6
        TTTTTT@@::c2::====,,,,
        TTPPTTvv::..,,t8====,,
        PPTTPP..,,,,,,,,,,====
        TTPPTTPP....,,,,,,,,,,
        TTTT..............t9..
        PPTT..TT....tA........
Terrain: ,, drygrass, .. grass, :: dirt, == path, OO cave_wall, PP pine, TT tree
@@ You — facing down
t1 boulder
t2 boulder
t3 moss
t4 slime burrow
t5 boulder
c1 Lumi
t6 Cut Grass
t7 Bone
c2 fire slime
t8 Bone
t9 haystack
tA Stick

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: —
- hands: Take Bone
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 240

```text
Day 1, 13:52, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
        OOOOOOOOOOOOOOOOOOOOOO
        TTTTTT..............t1
        PPTTt2t3::t4::::t5....
        TTTTTT::::::c1::::..t6
        TTTTTTt7::c2::====,,,,
        TTPPTT@@::..,,t8====,,
        PPTTPPvv,,,,,,,,,,====
        TTPPTTPP....,,,,,,,,,,
        TTTT..............t9..
        PPTT..TT....tA........
        TTTTPPbbPP....tB......
Terrain: ,, drygrass, .. grass, :: dirt, == path, OO cave_wall, PP pine, TT tree, bb bush
@@ You — facing down
t1 boulder
t2 boulder
t3 moss
t4 slime burrow
t5 boulder
c1 Lumi
t6 Cut Grass
t7 Bone
c2 fire slime
t8 Bone
t9 haystack
tA Stick
tB Stick

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 241

```text
Day 1, 13:53, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
        TTTTTT..............t1
        PPTTt2t3::t4::::t5....
        TTTTTT::::::c1::::..t6
        TTTTTTt7::c2::====,,,,
        TTPPTT..::..,,t8====,,
        PPTTPP@@,,,,,,,,,,====
        TTPPTTvv....,,,,,,,,,,
        TTTT..............t9..
        PPTT..TT....tA........
        TTTTPPbbPP....tB......
        PPTT..TTPPPP....tC....
Terrain: ,, drygrass, .. grass, :: dirt, == path, PP pine, TT tree, bb bush
@@ You — facing down
t1 boulder
t2 boulder
t3 moss
t4 slime burrow
t5 boulder
c1 Lumi
t6 Cut Grass
t7 Bone
c2 fire slime
t8 Bone
t9 haystack
tA Stick
tB Stick
tC Stick

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Punch pine tree
- hands: Interact with pine tree
- take: —
- put: —
- use: Punch pine tree
- self: —
- move: up walkable · down blocked · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 242

```text
Day 1, 13:53, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
      TTTTTT..............t1..
      PPTTt2t3::t4::::t5......
      TTTTTT::::::c1::::..t6,,
      TTTTTTt7::c2::====,,,,t8
      TTPPTT..::..,,t9====,,,,
      PPTTPP..@@>>,,,,,,======
      TTPPTTPP....,,,,,,,,,,==
      TTTT..............tA....
      PPTT..TT....tB..........
      TTTTPPbbPP....tC........
      PPTT..TTPPPP....tD......
Terrain: ,, drygrass, .. grass, :: dirt, == path, PP pine, TT tree, bb bush
@@ You — facing right
t1 boulder
t2 boulder
t3 moss
t4 slime burrow
t5 boulder
c1 Lumi
t6 Cut Grass
t7 Bone
c2 fire slime
t8 Cut Grass
t9 Bone
tA haystack
tB Stick
tC Stick
tD Stick

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 243

```text
Day 1, 13:53, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
    TTTTTT..............t1....
    PPTTt2t3::t4::::t5........
    TTTTTT::::::c1::::..t6,,,,
    TTTTTTt7::c2::====,,,,t8,,
    TTPPTT..::..,,t9====,,,,tA
    PPTTPP..,,@@>>,,,,======,,
    TTPPTTPP....,,,,,,,,,,====
    TTTT..............tB....==
    PPTT..TT....tC............
    TTTTPPbbPP....tD..........
    PPTT..TTPPPP....tE........
Terrain: ,, drygrass, .. grass, :: dirt, == path, PP pine, TT tree, bb bush
@@ You — facing right
t1 boulder
t2 boulder
t3 moss
t4 slime burrow
t5 boulder
c1 Lumi
t6 Cut Grass
t7 Bone
c2 fire slime
t8 Cut Grass
t9 Bone
tA Cut Grass
tB haystack
tC Stick
tD Stick
tE Stick

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 244

```text
Day 1, 13:53, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
      TTTTTT..............t1..
      PPTTt2t3::t4::::t5......
      TTTTTT::::::c1::::..t6,,
      TTTTTTt7::c2::====,,,,t8
      TTPPTT..::..,,t9====,,,,
      PPTTPP<<@@,,,,,,,,======
      TTPPTTPP....,,,,,,,,,,==
      TTTT..............tA....
      PPTT..TT....tB..........
      TTTTPPbbPP....tC........
      PPTT..TTPPPP....tD......
Terrain: ,, drygrass, .. grass, :: dirt, == path, PP pine, TT tree, bb bush
@@ You — facing left
t1 boulder
t2 boulder
t3 moss
t4 slime burrow
t5 boulder
c1 Lumi
t6 Cut Grass
t7 Bone
c2 fire slime
t8 Cut Grass
t9 Bone
tA haystack
tB Stick
tC Stick
tD Stick

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 245

```text
Day 1, 13:54, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
        TTTTTT..............t1
        PPTTt2t3::t4::::t5....
        TTTTTT::::::c1::::..t6
        TTTTTTt7::c2::====,,,,
        TTPPTT..::..,,t8====,,
        PPTT<<@@,,,,,,,,,,====
        TTPPTTPP....,,,,,,,,,,
        TTTT..............t9..
        PPTT..TT....tA........
        TTTTPPbbPP....tB......
        PPTT..TTPPPP....tC....
Terrain: ,, drygrass, .. grass, :: dirt, == path, PP pine, TT tree, bb bush
@@ You — facing left
t1 boulder
t2 boulder
t3 moss
t4 slime burrow
t5 boulder
c1 Lumi
t6 Cut Grass
t7 Bone
c2 fire slime
t8 Bone
t9 haystack
tA Stick
tB Stick
tC Stick

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Punch pine tree
- hands: Interact with pine tree
- take: —
- put: —
- use: Punch pine tree
- self: —
- move: up walkable · down blocked · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 246

```text
Day 1, 13:54, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
        OOOOOOOOOOOOOOOOOOOOOO
        TTTTTT..............t1
        PPTTt2t3::t4::::t5....
        TTTTTT::::::c1::::..t6
        TTTTTTt7::c2::====,,,,
        TTPPTT@@::..,,t8====,,
        PPTTPP..,,,,,,,,,,====
        TTPPTTPP....,,,,,,,,,,
        TTTT..............t9..
        PPTT..TT....tA........
        TTTTPPbbPP....tB......
Terrain: ,, drygrass, .. grass, :: dirt, == path, OO cave_wall, PP pine, TT tree, bb bush
@@ You — facing up (in front: t7)
t1 boulder
t2 boulder
t3 moss
t4 slime burrow
t5 boulder
c1 Lumi
t6 Cut Grass
t7 Bone
c2 fire slime
t8 Bone
t9 haystack
tA Stick
tB Stick

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: —
- hands: Take Bone
- take: Take Bone
- put: —
- use: Punch Bone
- self: —
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down**

## Turn 247

```text
Day 1, 13:54, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
        TTTTTT..............t1
        PPTTt2t3::t4::::t5....
        TTTTTT::::::c1::::..t6
        TTTTTTt7::c2::====,,,,
        TTPPTT..::..,,t8====,,
        PPTTPP@@,,,,,,,,,,====
        TTPPTTvv....,,,,,,,,,,
        TTTT..............t9..
        PPTT..TT....tA........
        TTTTPPbbPP....tB......
        PPTT..TTPPPP....tC....
Terrain: ,, drygrass, .. grass, :: dirt, == path, PP pine, TT tree, bb bush
@@ You — facing down
t1 boulder
t2 boulder
t3 moss
t4 slime burrow
t5 boulder
c1 Lumi
t6 Cut Grass
t7 Bone
c2 fire slime
t8 Bone
t9 haystack
tA Stick
tB Stick
tC Stick

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Punch pine tree
- hands: Interact with pine tree
- take: —
- put: —
- use: Punch pine tree
- self: —
- move: up walkable · down blocked · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

## Turn 248

```text
Day 1, 13:54, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
        OOOOOOOOOOOOOOOOOOOOOO
        TTTTTT..............t1
        PPTTt2t3::t4::::t5....
        TTTTTT::::::c1::::..t6
        TTTTTTt7::c2::====,,,,
        TTPPTT@@::..,,t8====,,
        PPTTPP..,,,,,,,,,,====
        TTPPTTPP....,,,,,,,,,,
        TTTT..............t9..
        PPTT..TT....tA........
        TTTTPPbbPP....tB......
Terrain: ,, drygrass, .. grass, :: dirt, == path, OO cave_wall, PP pine, TT tree, bb bush
@@ You — facing up (in front: t7)
t1 boulder
t2 boulder
t3 moss
t4 slime burrow
t5 boulder
c1 Lumi
t6 Cut Grass
t7 Bone
c2 fire slime
t8 Bone
t9 haystack
tA Stick
tB Stick

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: —
- hands: Take Bone
- take: Take Bone
- put: —
- use: Punch Bone
- self: —
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right**

## Turn 249

```text
Day 1, 13:54, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
      OOOOOOOOOOOOOOOOOOOOOOOO
      TTTTTT..............t1..
      PPTTt2t3::t4::::t5......
      TTTTTT::::::c1::::..t6,,
      TTTTTTt7::c2::====,,,,t8
      TTPPTT..@@>>,,t9====,,,,
      PPTTPP..,,,,,,,,,,======
      TTPPTTPP....,,,,,,,,,,==
      TTTT..............tA....
      PPTT..TT....tB..........
      TTTTPPbbPP....tC........
Terrain: ,, drygrass, .. grass, :: dirt, == path, OO cave_wall, PP pine, TT tree, bb bush
@@ You — facing right
t1 boulder
t2 boulder
t3 moss
t4 slime burrow
t5 boulder
c1 Lumi
t6 Cut Grass
t7 Bone
c2 fire slime
t8 Cut Grass
t9 Bone
tA haystack
tB Stick
tC Stick

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left**

## Turn 250

```text
Day 1, 13:55, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
        OOOOOOOOOOOOOOOOOOOOOO
        TTTTTT..............t1
        PPTTt2t3::t4::::t5....
        TTTTTT::::::c1::::..t6
        TTTTTTt7::c2::====,,,,
        TTPP<<@@::..,,t8====,,
        PPTTPP..,,,,,,,,,,====
        TTPPTTPP....,,,,,,,,,,
        TTTT..............t9..
        PPTT..TT....tA........
        TTTTPPbbPP....tB......
Terrain: ,, drygrass, .. grass, :: dirt, == path, OO cave_wall, PP pine, TT tree, bb bush
@@ You — facing left
t1 boulder
t2 boulder
t3 moss
t4 slime burrow
t5 boulder
c1 Lumi
t6 Cut Grass
t7 Bone
c2 fire slime
t8 Bone
t9 haystack
tA Stick
tB Stick

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- current spot has rock wall south; backtrack north to find cut.

Actions:
- primary: Punch tree
- hands: Interact with tree
- take: —
- put: —
- use: Punch tree
- self: —
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up**

