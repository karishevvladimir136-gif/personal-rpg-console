# Phase C · fable on the Ford

`claude-fable-5-1` through OpenRouter. Each turn: the observation the model was sent (its own journal in it), then its action line, Note and Journal line. The reasoning field, where there is one, is in the log and not shown.

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

> **move left 2** · Journal: «Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.»

## Turn 2

```text
Day 1, 13:01, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRRRPPRRRRnnRRRRRRPPRRRRRR
PPRRRRnnRRRRRRRRPPRRRRRRRRnnRR
RRPPRRRROOOOOOOOOOOOOOOOOOOOOO
RRRRRRPPOOXXXXOOXXXXXXXXXXXXOO
OOOOOOOOnnXXnnnnFFFFFFt1t2XXnn
OOOOOOOOnnnn<<@@FFc1FFFFFFXXnn
RRRRPPnnRRXXFFFFFFFFFFFFFFXXnn
RRRRnnnnnnXXt4FFFFFFFFFFt5XXnn
RRRRPPnnnnXXXXXXXX==XXXXXXXXnn
RRRRnnnn,,,,nnnnnn====nnnnnnnn
RRnnnn,,t6t7bb,,nn====nnXXnnnn
Terrain: ,, drygrass, == path, FF floor_stone, OO cave_wall, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing left
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
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.

Actions:
- primary: —
- hands: Take Watchman's Cloak
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands**

## Turn 3

```text
Day 1, 13:01, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRRRPPRRRRnnRRRRRRPPRRRRRR
PPRRRRnnRRRRRRRRPPRRRRRRRRnnRR
RRPPRRRROOOOOOOOOOOOOOOOOOOOOO
RRRRRRPPOOXXXXOOXXXXXXXXXXXXOO
OOOOOOOOnnXXnnnnFFFFFFt1t2XXnn
OOOOOOOOnnnn<<@@FFc1FFFFFFXXnn
RRRRPPnnRRXXFFFFFFFFFFFFFFXXnn
RRRRnnnnnnXXt3FFFFFFFFFFt4XXnn
RRRRPPnnnnXXXXXXXX==XXXXXXXXnn
RRRRnnnn,,,,nnnnnn====nnnnnnnn
RRnnnn,,t5t6bb,,nn====nnXXnnnn
Terrain: ,, drygrass, == path, FF floor_stone, OO cave_wall, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing left
t1 chair
t2 The watchman's log
c1 Lumi
t3 bed
t4 barrel
t5 grass tuft
t6 Berries

You: hp 40/40 · held: Watchman's Cloak · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Watchman's Cloak (selected)

Since your last action:
- You take Watchman's Cloak.

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.

Actions:
- primary: Put on Watchman's Cloak
- hands: —
- take: —
- put: Place Watchman's Cloak
- use: Use Watchman's Cloak on snow
- self: Put on Watchman's Cloak
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **self**

## Turn 4

```text
Day 1, 13:01, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRRRPPRRRRnnRRRRRRPPRRRRRR
PPRRRRnnRRRRRRRRPPRRRRRRRRnnRR
RRPPRRRROOOOOOOOOOOOOOOOOOOOOO
RRRRRRPPOOXXXXOOXXXXXXXXXXXXOO
OOOOOOOOnnXXnnnnFFFFFFt1t2XXnn
OOOOOOOOnnnn<<@@FFc1FFFFFFXXnn
RRRRPPnnRRXXFFFFFFFFFFFFFFXXnn
RRRRnnnnnnXXt3FFFFFFFFFFt4XXnn
RRRRPPnnnnXXXXXXXX==XXXXXXXXnn
RRRRnnnn,,,,nnnnnn====nnnnnnnn
RRnnnn,,t5t6bb,,nn====nnXXnnnn
Terrain: ,, drygrass, == path, FF floor_stone, OO cave_wall, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing left
t1 chair
t2 The watchman's log
c1 Lumi
t3 bed
t4 barrel
t5 grass tuft
t6 Berries

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You put on Watchman's Cloak.

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.

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

> **move up 1**

## Turn 5

```text
Day 1, 13:01, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):

RRRRRRRRPPRRRRnnRRRRRRPPRRRRRR
PPRRRRnnRRRRRRRRPPRRRRRRRRnnRR
RRPPRRRROOOOOOOOOOOOOOOOOOOOOO
RRRRRRPPOOXXXX^^XXXXXXXXXXXXOO
OOOOOOOOnnXXnn@@FFFFFFt1t2XXnn
OOOOOOOOnnnnnnFFFFc1FFFFFFXXnn
RRRRPPnnRRXXFFFFFFFFFFFFFFXXnn
RRRRnnnnnnXXt3FFFFFFFFFFt4XXnn
RRRRPPnnnnXXXXXXXX==XXXXXXXXnn
RRRRnnnn,,,,nnnnnn====nnnnnnnn
Terrain: ,, drygrass, == path, FF floor_stone, OO cave_wall, PP pine, RR rock, XX wall, nn snow
@@ You — facing up
t1 chair
t2 The watchman's log
c1 Lumi
t3 bed
t4 barrel

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.

Actions:
- primary: Punch cave wall
- hands: Interact with cave wall
- take: —
- put: —
- use: Punch cave wall
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right 4**

## Turn 6

```text
Day 1, 13:02, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):

PPRRRRnnRRRRRRPPRRRRRRRRnnRRRR
RRRRRRRRPPRRRRRRRRnnRRPPRRRRRR
OOOOOOOOOOOOOOOOOOOOOORRPPRROO
OOXXXXOOXXXXXXXXXXXXOOOOOOOOOO
nnXXnnnnFFFFFF@@t2XXnnOOOOOOnn
nnnnnnFFFFc1FFFFFFXXnnnnnnnnnn
RRXXFFFFFFFFFFFFFFXXnnnnXXnnnn
nnXXt3FFFFFFFFFFt4XXnnnnnnnnnn
nnXXXXXXXX==XXXXXXXXnnnnnnnnnn
,,,,nnnnnn====nnnnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, FF floor_stone, OO cave_wall, PP pine, RR rock, XX wall, nn snow
@@ You — facing right (in front: t2)
t1 chair
t2 The watchman's log
c1 Lumi
t3 bed
t4 barrel

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.

Actions:
- primary: Punch The watchman's log
- hands: Read The watchman's log
- take: —
- put: —
- use: Punch The watchman's log
- self: —
- move: up blocked · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands**

## Turn 7

```text
Day 1, 13:02, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):

PPRRRRnnRRRRRRPPRRRRRRRRnnRRRR
RRRRRRRRPPRRRRRRRRnnRRPPRRRRRR
OOOOOOOOOOOOOOOOOOOOOORRPPRROO
OOXXXXOOXXXXXXXXXXXXOOOOOOOOOO
nnXXnnnnFFFFFF@@t2XXnnOOOOOOnn
nnnnnnFFFFc1FFFFFFXXnnnnnnnnnn
RRXXFFFFFFFFFFFFFFXXnnnnXXnnnn
nnXXt3FFFFFFFFFFt4XXnnnnnnnnnn
nnXXXXXXXX==XXXXXXXXnnnnnnnnnn
,,,,nnnnnn====nnnnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, FF floor_stone, OO cave_wall, PP pine, RR rock, XX wall, nn snow
@@ You — facing right (in front: t2)
t1 chair
t2 The watchman's log
c1 Lumi
t3 bed
t4 barrel

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- The watchman's log: "SUNSET, CLOUDTOP WATCH. Year 401: 19:42 at midsummer. Year 405: 19:31. Year 409: 19:12 — I have checked the glass twice. Year 411: the reports go down the mountain and nothing comes back. Last page: Found a small light asleep in the snow by the cairn, warm as a coal. It woke and asked me how old it was. I did not know what to tell it."
- You: "(A logbook lies open on the table, its pages stiff with cold. Column after column of sunset times, year after year, each a little earlier than the last.)"

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **advance** · Journal: «Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.»

## Turn 8

```text
Day 1, 13:02, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):

PPRRRRnnRRRRRRPPRRRRRRRRnnRRRR
RRRRRRRRPPRRRRRRRRnnRRPPRRRRRR
OOOOOOOOOOOOOOOOOOOOOORRPPRROO
OOXXXXOOXXXXXXXXXXXXOOOOOOOOOO
nnXXnnnnFFFFFF@@t2XXnnOOOOOOnn
nnnnnnFFFFc1FFFFFFXXnnnnnnnnnn
RRXXFFFFFFFFFFFFFFXXnnnnXXnnnn
nnXXt3FFFFFFFFFFt4XXnnnnnnnnnn
nnXXXXXXXX==XXXXXXXXnnnnnnnnnn
,,,,nnnnnn====nnnnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, FF floor_stone, OO cave_wall, PP pine, RR rock, XX wall, nn snow
@@ You — facing right (in front: t2)
t1 chair
t2 The watchman's log
c1 Lumi
t3 bed
t4 barrel

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You: "(The last page: "Found a small light asleep in the snow by the cairn, warm as a coal. It woke and asked me how old it was.")"

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **advance**

## Turn 9

```text
Day 1, 13:03, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):

PPRRRRnnRRRRRRPPRRRRRRRRnnRRRR
RRRRRRRRPPRRRRRRRRnnRRPPRRRRRR
OOOOOOOOOOOOOOOOOOOOOORRPPRROO
OOXXXXOOXXXXXXXXXXXXOOOOOOOOOO
nnXXnnnnFFFFFF@@t2XXnnOOOOOOnn
nnnnnnFFFFc1FFFFFFXXnnnnnnnnnn
RRXXFFFFFFFFFFFFFFXXnnnnXXnnnn
nnXXt3FFFFFFFFFFt4XXnnnnnnnnnn
nnXXXXXXXX==XXXXXXXXnnnnnnnnnn
,,,,nnnnnn====nnnnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, FF floor_stone, OO cave_wall, PP pine, RR rock, XX wall, nn snow
@@ You — facing right (in front: t2)
t1 chair
t2 The watchman's log
c1 Lumi
t3 bed
t4 barrel

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- Lumi: "It's so cold in here... Let's go."

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **advance**

## Turn 10

```text
Day 1, 13:03, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):

PPRRRRnnRRRRRRPPRRRRRRRRnnRRRR
RRRRRRRRPPRRRRRRRRnnRRPPRRRRRR
OOOOOOOOOOOOOOOOOOOOOORRPPRROO
OOXXXXOOXXXXXXXXXXXXOOOOOOOOOO
nnXXnnnnFFFFFF@@t2XXnnOOOOOOnn
nnnnnnFFFFc1FFFFFFXXnnnnnnnnnn
RRXXFFFFFFFFFFFFFFXXnnnnXXnnnn
nnXXt3FFFFFFFFFFt4XXnnnnnnnnnn
nnXXXXXXXX==XXXXXXXXnnnnnnnnnn
,,,,nnnnnn====nnnnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, FF floor_stone, OO cave_wall, PP pine, RR rock, XX wall, nn snow
@@ You — facing right (in front: t2)
t1 chair
t2 The watchman's log
c1 Lumi
t3 bed
t4 barrel

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.

Actions:
- primary: Punch The watchman's log
- hands: Read The watchman's log
- take: —
- put: —
- use: Punch The watchman's log
- self: —
- move: up blocked · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down 3**

## Turn 11

```text
Day 1, 13:03, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
OOOOOOOOOOOOOOOOOOOOOORRPPRROO
OOXXXXOOXXXXXXXXXXXXOOOOOOOOOO
nnXXnnnnFFFFFFt1t2XXnnOOOOOOnn
nnnnnnFFFFc1FFFFFFXXnnnnnnnnnn
RRXXFFFFFFFFFFFFFFXXnnnnXXnnnn
nnXXt3FFFFFFFF@@t4XXnnnnnnnnnn
nnXXXXXXXX==XXvvXXXXnnnnnnnnnn
,,,,nnnnnn====nnnnnnnnnnnnnnnn
t5t6bb,,nn====nnXXnnnnnnnnnnnn
bbt7,,t8,,======nnnnnnnnnnnnnn
,,,,bb,,nnnn======nnnnnnnnnnnn
Terrain: ,, drygrass, == path, FF floor_stone, OO cave_wall, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing down
t1 chair
t2 The watchman's log
c1 Lumi
t3 bed
t4 barrel
t5 grass tuft
t6 Berries
t7 Cut Grass
t8 Berries

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.

Actions:
- primary: Punch stone wall
- hands: Interact with stone wall
- take: —
- put: —
- use: Punch stone wall
- self: —
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **face right**

## Turn 12

```text
Day 1, 13:03, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
OOOOOOOOOOOOOOOOOOOOOORRPPRROO
OOXXXXOOXXXXXXXXXXXXOOOOOOOOOO
nnXXnnnnFFFFFFt1t2XXnnOOOOOOnn
nnnnnnFFFFc1FFFFFFXXnnnnnnnnnn
RRXXFFFFFFFFFFFFFFXXnnnnXXnnnn
nnXXt3FFFFFFFF@@t4XXnnnnnnnnnn
nnXXXXXXXX==XXXXXXXXnnnnnnnnnn
,,,,nnnnnn====nnnnnnnnnnnnnnnn
t5t6bb,,nn====nnXXnnnnnnnnnnnn
bbt7,,t8,,======nnnnnnnnnnnnnn
,,,,bb,,nnnn======nnnnnnnnnnnn
Terrain: ,, drygrass, == path, FF floor_stone, OO cave_wall, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing right (in front: t4)
t1 chair
t2 The watchman's log
c1 Lumi
t3 bed
t4 barrel
t5 grass tuft
t6 Berries
t7 Cut Grass
t8 Berries

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.

Actions:
- primary: Punch barrel
- hands: Open barrel
- take: —
- put: —
- use: Punch barrel
- self: —
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands**

## Turn 13

```text
Day 1, 13:03, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
OOOOOOOOOOOOOOOOOOOOOORRPPRROO
OOXXXXOOXXXXXXXXXXXXOOOOOOOOOO
nnXXnnnnFFFFFFt1t2XXnnOOOOOOnn
nnnnnnFFFFc1FFFFFFXXnnnnnnnnnn
RRXXFFFFFFFFFFFFFFXXnnnnXXnnnn
nnXXt3FFFFFFFF@@t4XXnnnnnnnnnn
nnXXXXXXXX==XXXXXXXXnnnnnnnnnn
,,,,nnnnnn====nnnnnnnnnnnnnnnn
t5t6bb,,nn====nnXXnnnnnnnnnnnn
bbt7,,t8,,======nnnnnnnnnnnnnn
,,,,bb,,nnnn======nnnnnnnnnnnn
Terrain: ,, drygrass, == path, FF floor_stone, OO cave_wall, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing right (in front: t4)
t1 chair
t2 The watchman's log
c1 Lumi
t3 bed
t4 barrel — open
t5 grass tuft
t6 Berries
t7 Cut Grass
t8 Berries

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.

Actions:
- Open: barrel — empty (time stands while it is open)
- take: —
- put: —
- hands: Close barrel
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands**

## Turn 14

```text
Day 1, 13:03, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
OOOOOOOOOOOOOOOOOOOOOORRPPRROO
OOXXXXOOXXXXXXXXXXXXOOOOOOOOOO
nnXXnnnnFFFFFFt1t2XXnnOOOOOOnn
nnnnnnFFFFc1FFFFFFXXnnnnnnnnnn
RRXXFFFFFFFFFFFFFFXXnnnnXXnnnn
nnXXt3FFFFFFFF@@t4XXnnnnnnnnnn
nnXXXXXXXX==XXXXXXXXnnnnnnnnnn
,,,,nnnnnn====nnnnnnnnnnnnnnnn
t5t6bb,,nn====nnXXnnnnnnnnnnnn
bbt7,,t8,,======nnnnnnnnnnnnnn
,,,,bb,,nnnn======nnnnnnnnnnnn
Terrain: ,, drygrass, == path, FF floor_stone, OO cave_wall, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing right (in front: t4)
t1 chair
t2 The watchman's log
c1 Lumi
t3 bed
t4 barrel
t5 grass tuft
t6 Berries
t7 Cut Grass
t8 Berries

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.

Actions:
- primary: Punch barrel
- hands: Open barrel
- take: —
- put: —
- use: Punch barrel
- self: —
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left 2**

## Turn 15

```text
Day 1, 13:04, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRROOOOOOOOOOOOOOOOOOOOOORRPP
RRPPOOXXXXOOXXXXXXXXXXXXOOOOOO
OOOOnnXXnnnnFFFFFFt1t2XXnnOOOO
OOOOnnnnnnFFFFc1FFFFFFXXnnnnnn
PPnnRRXXFFFFFFFFFFFFFFXXnnnnXX
nnnnnnXXt3FF<<@@FFFFt4XXnnnnnn
PPnnnnXXXXXXXX==XXXXXXXXnnnnnn
nnnn,,,,nnnnnn====nnnnnnnnnnnn
nn,,t5t6bb,,nn====nnXXnnnnnnnn
,,,,bbt7,,t8,,======nnnnnnnnnn
nnt9,,,,bb,,nnnn======nnnnnnnn
Terrain: ,, drygrass, == path, FF floor_stone, OO cave_wall, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing left
t1 chair
t2 The watchman's log
c1 Lumi
t3 bed
t4 barrel
t5 grass tuft
t6 Berries
t7 Cut Grass
t8 Berries
t9 Berries

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.

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

## Turn 16

```text
Day 1, 13:04, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
OOOOnnnnnnFFFFFFFFFFFFXXnnnnnn
PPnnRRXXFFFFFFFFFFFFFFXXnnnnXX
nnnnnnXXt1FFFFc1FFFFt2XXnnnnnn
PPnnnnXXXXXXXX==XXXXXXXXnnnnnn
nnnn,,,,nnnnnn====nnnnnnnnnnnn
nn,,t3t4bb,,nn@@==nnXXnnnnnnnn
,,,,bbt5,,t6,,vv====nnnnnnnnnn
nnt7,,,,bb,,nnnn======nnnnnnnn
nnnn,,,,t8nnnnnnnn========nnnn
nnnnnnnnnnnnnnnnnnnnnn========
RRRRnnnnnnnnnnnnnnnnnnnnnn====
Terrain: ,, drygrass, == path, FF floor_stone, OO cave_wall, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing down
t1 bed
c1 Lumi
t2 barrel
t3 grass tuft
t4 Berries
t5 Cut Grass
t6 Berries
t7 Berries
t8 Cut Grass

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.

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

> **move left 3**

## Turn 17

```text
Day 1, 13:05, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
OOOOOOOOOOnnnnnnFFFFFFFFFFFFXX
RRRRRRPPnnRRXXFFFFFFFFFFFFFFXX
RRRRRRnnnnnnXXt1FFFFc1FFFFt2XX
RRRRRRPPnnnnXXXXXXXX==XXXXXXXX
RRRRRRnnnn,,,,nnnnnn====nnnnnn
RRRRnnnn,,t3t4@@,,nn====nnXXnn
RRRRnn,,,,bbt5,,t6,,======nnnn
PPRRRRnnt7,,,,bb,,nnnn======nn
RRPPRRnnnn,,,,t8nnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRRRRRRRnnnnnnnnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, FF floor_stone, OO cave_wall, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing left (in front: t4)
t1 bed
c1 Lumi
t2 barrel
t3 grass tuft
t4 Berries
t5 Cut Grass
t6 Berries
t7 Berries
t8 Cut Grass

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.

Actions:
- primary: —
- hands: Take Berries
- take: Take Berries
- put: —
- use: Punch Berries
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **take**

## Turn 18

```text
Day 1, 13:05, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
OOOOOOOOOOnnnnnnFFFFFFFFFFFFXX
RRRRRRPPnnRRXXFFFFFFFFFFFFFFXX
RRRRRRnnnnnnXXt1FFFFc1FFFFt2XX
RRRRRRPPnnnnXXXXXXXX==XXXXXXXX
RRRRRRnnnn,,,,nnnnnn====nnnnnn
RRRRnnnn,,t3<<@@,,nn====nnXXnn
RRRRnn,,,,bbt4,,t5,,======nnnn
PPRRRRnnt6,,,,bb,,nnnn======nn
RRPPRRnnnn,,,,t7nnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRRRRRRRnnnnnnnnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, FF floor_stone, OO cave_wall, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing left
t1 bed
c1 Lumi
t2 barrel
t3 grass tuft
t4 Cut Grass
t5 Berries
t6 Berries
t7 Cut Grass

You: hp 40/40 · held: Berries · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries (selected)

Since your last action:
- You take Berries.

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.

Actions:
- primary: Eat Berries
- hands: —
- take: —
- put: Place Berries
- use: Use Berries on dry grass
- self: Eat Berries
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down 1**

## Turn 19

```text
Day 1, 13:05, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRPPnnRRXXFFFFFFFFFFFFFFXX
RRRRRRnnnnnnXXt1FFFFFFFFFFt2XX
RRRRRRPPnnnnXXXXXXc1==XXXXXXXX
RRRRRRnnnn,,,,nnnnnn====nnnnnn
RRRRnnnn,,t3,,bb,,nn====nnXXnn
RRRRnn,,,,bbt4@@t5,,======nnnn
PPRRRRnnt6,,,,vv,,nnnn======nn
RRPPRRnnnn,,,,t7nnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRRRRRRRnnnnnnnnnnnnnnnnnnnn
RRPPRRRRnnnnnnnnnnnnnnnnt8RRRR
Terrain: ,, drygrass, == path, FF floor_stone, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing down
t1 bed
t2 barrel
c1 Lumi
t3 grass tuft
t4 Cut Grass
t5 Berries
t6 Berries
t7 Cut Grass
t8 Stone

You: hp 40/40 · held: Berries · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.

Actions:
- primary: Eat Berries
- hands: Interact with bush
- take: —
- put: Place Berries
- use: Use Berries on bush
- self: Eat Berries
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **face right**

## Turn 20

```text
Day 1, 13:05, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRPPnnRRXXFFFFFFFFFFFFFFXX
RRRRRRnnnnnnXXt1FFFFFFFFFFt2XX
RRRRRRPPnnnnXXXXXXc1==XXXXXXXX
RRRRRRnnnn,,,,nnnnnn====nnnnnn
RRRRnnnn,,t3,,bb,,nn====nnXXnn
RRRRnn,,,,bbt4@@t5,,======nnnn
PPRRRRnnt6,,,,bb,,nnnn======nn
RRPPRRnnnn,,,,t7nnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRRRRRRRnnnnnnnnnnnnnnnnnnnn
RRPPRRRRnnnnnnnnnnnnnnnnt8RRRR
Terrain: ,, drygrass, == path, FF floor_stone, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing right (in front: t5)
t1 bed
t2 barrel
c1 Lumi
t3 grass tuft
t4 Cut Grass
t5 Berries
t6 Berries
t7 Cut Grass
t8 Stone

You: hp 40/40 · held: Berries · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.

Actions:
- primary: Eat Berries
- hands: Take Berries
- take: Take Berries
- put: Put Berries down by Berries
- use: Use Berries on Berries
- self: Eat Berries
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **take**

## Turn 21

```text
Day 1, 13:05, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRPPnnRRXXFFFFFFFFFFFFFFXX
RRRRRRnnnnnnXXt1FFFFFFFFFFt2XX
RRRRRRPPnnnnXXXXXXc1==XXXXXXXX
RRRRRRnnnn,,,,nnnnnn====nnnnnn
RRRRnnnn,,t3,,bb,,nn====nnXXnn
RRRRnn,,,,bbt4@@>>,,======nnnn
PPRRRRnnt5,,,,bb,,nnnn======nn
RRPPRRnnnn,,,,t6nnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRRRRRRRnnnnnnnnnnnnnnnnnnnn
RRPPRRRRnnnnnnnnnnnnnnnnt7RRRR
Terrain: ,, drygrass, == path, FF floor_stone, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing right
t1 bed
t2 barrel
c1 Lumi
t3 grass tuft
t4 Cut Grass
t5 Berries
t6 Cut Grass
t7 Stone

You: hp 40/40 · held: Berries · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries ×2 (selected)

Since your last action:
- You take Berries.

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.

Actions:
- primary: Eat Berries
- hands: —
- take: —
- put: Place Berries
- use: Use Berries on dry grass
- self: Eat Berries
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down 1**

## Turn 22

```text
Day 1, 13:06, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRnnnnnnXXt1FFFFFFFFFFt2XX
RRRRRRPPnnnnXXXXXXXX==XXXXXXXX
RRRRRRnnnn,,,,nnc1nn====nnnnnn
RRRRnnnn,,t3,,bb,,nn====nnXXnn
RRRRnn,,,,bbt4,,,,,,======nnnn
PPRRRRnnt5,,,,@@,,nnnn======nn
RRPPRRnnnn,,,,t6nnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRRRRRRRnnnnnnnnnnnnnnnnnnnn
RRPPRRRRnnnnnnnnnnnnnnnnt7RRRR
RRRRRRnnnnnnnnnnnnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, FF floor_stone, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing down (in front: t6)
t1 bed
t2 barrel
c1 Lumi
t3 grass tuft
t4 Cut Grass
t5 Berries
t6 Cut Grass
t7 Stone

You: hp 40/40 · held: Berries · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries ×2 (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.

Actions:
- primary: Eat Berries
- hands: Take Cut Grass
- take: Take Cut Grass
- put: Put Berries down by Cut Grass
- use: Use Berries on Cut Grass
- self: Eat Berries
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **take**

## Turn 23

```text
Day 1, 13:06, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRRRnnnnnnXXt1FFFFFFFFFFt2XX
RRRRRRPPnnnnXXXXXXXX==XXXXXXXX
RRRRRRnnnn,,,,nnc1nn====nnnnnn
RRRRnnnn,,t3,,bb,,nn====nnXXnn
RRRRnn,,,,bbt4,,,,,,======nnnn
PPRRRRnnt5,,,,@@,,nnnn======nn
RRPPRRnnnn,,,,vvnnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRRRRRRRnnnnnnnnnnnnnnnnnnnn
RRPPRRRRnnnnnnnnnnnnnnnnt6RRRR
RRRRRRnnnnnnnnnnnnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, FF floor_stone, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing down
t1 bed
t2 barrel
c1 Lumi
t3 grass tuft
t4 Cut Grass
t5 Berries
t6 Stone

You: hp 40/40 · held: Berries · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries ×2 (selected) · [1] Cut Grass

Since your last action:
- You take Cut Grass.

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.

Actions:
- primary: Eat Berries
- hands: —
- take: —
- put: Place Berries
- use: Use Berries on dry grass
- self: Eat Berries
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down 4**

## Turn 24

```text
Day 1, 13:07, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRnn,,,,bbt1,,,,,,======nnnn
PPRRRRnnt2,,,,bb,,nnnn======nn
RRPPRRnnnn,,,,c1nnnnnnnn======
RRRRRRnnnnnnnnnnnnnnnnnnnnnn==
RRRRRRRRRRnnnnnnnnnnnnnnnnnnnn
RRPPRRRRnnnnnn@@nnnnnnnnt3RRRR
RRRRRRnnnnnnnnvvnnnnnnnnnnnnnn
RRRRPPnnnnnnnnnnnnnnnnnnnnnnnn
RRRRnnnnnnPPnnnnRRnnnnnnnnRRnn
RRRRnnRRPPnnRRRRnnnnRRPPnnRRRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
Terrain: ,, drygrass, == path, PP pine, RR rock, bb bush, nn snow
@@ You — facing down
t1 Cut Grass
t2 Berries
c1 Lumi
t3 Stone

You: hp 40/40 · held: Berries · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries ×2 (selected) · [1] Cut Grass

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.

Actions:
- primary: Eat Berries
- hands: —
- take: —
- put: Place Berries
- use: Use Berries on snow
- self: Eat Berries
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right 5**

## Turn 25

```text
Day 1, 13:08, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
bbt1,,,,,,======nnnnnnnnnnnnnn
,,,,bb,,nnnn======nnnnnnnnnnnn
,,,,,,nnnnnnnn========nnnnnnnn
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnc1nnnnnnnnnnnn========
nnnnnnnnnnnnnn@@>>RRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnnnnnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnnnnRRnnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing right
t1 Cut Grass
c1 Lumi
t2 Stone

You: hp 40/40 · held: Berries · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries ×2 (selected) · [1] Cut Grass

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.

Actions:
- primary: Eat Berries
- hands: Take Stone
- take: —
- put: —
- use: Use Berries on rock
- self: Eat Berries
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands**

## Turn 26

```text
Day 1, 13:08, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
bbt1,,,,,,======nnnnnnnnnnnnnn
,,,,bb,,nnnn======nnnnnnnnnnnn
,,,,,,nnnnnnnn========nnnnnnnn
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnc1nnnnnnnnnnnn========
nnnnnnnnnnnnnn@@>>RRnnnnnn====
nnnnnnnnnnnnnnnnnnnnnnnnnnnn==
nnnnnnnnnnnnnnnnnnnnnnnnXXnn==
PPnnnnRRnnnnnnnnRRnnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing right
t1 Cut Grass
c1 Lumi

You: hp 40/40 · held: Berries · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries ×2 (selected) · [1] Cut Grass · [2] Stone

Since your last action:
- You take Stone.

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.

Actions:
- primary: Eat Berries
- hands: Interact with rock
- take: —
- put: —
- use: Use Berries on rock
- self: Eat Berries
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down 1**

## Turn 27

```text
Day 1, 13:08, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
,,,,bb,,nnnn======nnnnnnnnnnnn
,,,,,,nnnnnnnn========nnnnnnnn
nnnnnnnnnnnnnnnnnn========nnnn
nnnnnnnnc1nnnnnnnnnnnn========
nnnnnnnnnnnnnnnnRRRRnnnnnn====
nnnnnnnnnnnnnn@@nnnnnnnnnnnn==
nnnnnnnnnnnnnnvvnnnnnnnnXXnn==
PPnnnnRRnnnnnnnnRRnnnnPPnnnnRR
nnRRRRnnnnRRPPnnRRRRnnnnRRRRXX
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: Berries · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries ×2 (selected) · [1] Cut Grass · [2] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.

Actions:
- primary: Eat Berries
- hands: —
- take: —
- put: Place Berries
- use: Use Berries on snow
- self: Eat Berries
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right 7**

## Turn 28

```text
Day 1, 13:09, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
====nnnnnnnnnnnnnnnnnnnnnnnnnn
========nnnnnnnnnnnnnnnnnnnnnn
nnnn========nnnnnnnnnnnnnnnnRR
nnnnnnnn========nnXXnnnnnnnnRR
nnRRRRnnnnnn======nnnnnnnnnnnn
nnnnnnnnc1nnnn@@>>nnnnnnnnnnnn
nnnnnnnnnnXXnn====nnnnRRnnnnnn
nnRRnnnnPPnnnnRR==RRnnnnPPnnnn
nnRRRRnnnnRRRRXX==XXRRnnnnRRPP
RRRRRRRRRRRRRRRR==RRRRRRRRRRRR
nnnnnnnnnnnnnnnn==nnnnnnnnnnnn
Terrain: == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Berries · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries ×2 (selected) · [1] Cut Grass · [2] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.

Actions:
- primary: Eat Berries
- hands: —
- take: —
- put: Place Berries
- use: Use Berries on dirt road
- self: Eat Berries
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right 1**

## Turn 29

```text
Day 1, 13:10, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
==nnnnnnnnnnnnnnnnnnnnnnnnnnPP
======nnnnnnnnnnnnnnnnnnnnnnnn
nn========nnnnnnnnnnnnnnnnRRRR
nnnnnn========nnXXnnnnnnnnRRRR
RRRRnnnnnn======nnnnnnnnnnnnnn
nnnnnnnnc1nn==@@>>nnnnnnnnnn,,
nnnnnnnnXXnn====nnnnRRnnnnnnnn
RRnnnnPPnnnnRR==RRnnnnPPnnnnRR
RRRRnnnnRRRRXX==XXRRnnnnRRPPnn
RRRRRRRRRRRRRR==RRRRRRRRRRRRRR
nnnnnnnnnnnnnn==nnnnnnnnnnnnnn
Terrain: ,, drygrass, == path, PP pine, RR rock, XX wall, nn snow
@@ You — facing right
c1 Lumi

You: hp 40/40 · held: Berries · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries ×2 (selected) · [1] Cut Grass · [2] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.

Actions:
- primary: Eat Berries
- hands: —
- take: —
- put: Place Berries
- use: Use Berries on snow
- self: Eat Berries
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down 5**

## Turn 30

```text
Day 1, 13:11, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
nnnnnnnnnnnn====nnnnnnnnnnnn,,
nnnnnnnnXXnn====nnnnRRnnnnnnnn
RRnnnnPPnnnnc1==RRnnnnPPnnnnRR
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

You: hp 40/40 · held: Berries · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries ×2 (selected) · [1] Cut Grass · [2] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.

Actions:
- primary: Eat Berries
- hands: —
- take: —
- put: Place Berries
- use: Use Berries on dirt road
- self: Eat Berries
- move: up walkable · down walkable · left blocked · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down 5** · Journal: «Passed through the cut in rocks south of Cloudtop at 13:11; following path south.»

## Turn 31

```text
Day 1, 13:11, cloud — Cloudtop

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

You: hp 40/40 · held: Berries · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Berries ×2 (selected) · [1] Cut Grass · [2] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.

Actions:
- primary: Eat Berries
- hands: —
- take: —
- put: Place Berries
- use: Use Berries on dirt road
- self: Eat Berries
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **self**

## Turn 32

```text
Day 1, 13:11, cloud — Cloudtop

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

You: hp 40/40 · held: Berries · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: hungry
Bag (slots 0–9 are the toolbar): [0] Berries ×2 (selected) · [1] Cut Grass · [2] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.

Actions:
- Question: Eat Berries? — answer yes · answer no
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **answer yes**

## Turn 33

```text
Day 1, 13:12, cloud — Cloudtop

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

You: hp 40/40 · held: Berries · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries (selected) · [1] Cut Grass · [2] Stone

Since your last action:
- You eat Berries.

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.

Actions:
- primary: Eat Berries
- hands: —
- take: —
- put: Place Berries
- use: Use Berries on dirt road
- self: Eat Berries
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down 3**

## Turn 34

```text
Day 1, 13:12, cloud — Woundstone Foot

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

You: hp 40/40 · held: Berries · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries (selected) · [1] Cut Grass · [2] Stone

Since your last action:
- You are in Woundstone Foot

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.

Actions:
- primary: Eat Berries
- hands: —
- take: —
- put: Place Berries
- use: Use Berries on dirt road
- self: Eat Berries
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down 6** · Journal: «Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.»

## Turn 35

```text
Day 1, 13:13, cloud — Woundstone Foot

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

You: hp 40/40 · held: Berries · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries (selected) · [1] Cut Grass · [2] Stone

Since your last action:
- Quest descent → stage 20
- Lumi: "It's cold near it. I don't like it. I don't know why I don't like it. ...Try doing something to it, anything. Whatever you do, the world will answer."

Journal:
- Down from the Mountain (descent): active, stage 20 — An old stone with five marks cut in it; the first one is cracked. Lumi said it was cold near it.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.

Actions:
- primary: Eat Berries
- hands: —
- take: —
- put: Place Berries
- use: Use Berries on dirt road
- self: Eat Berries
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down 3**

## Turn 36

```text
Day 1, 13:14, cloud — Woundstone Foot

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

You: hp 40/40 · held: Berries · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries (selected) · [1] Cut Grass · [2] Stone

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 20 — An old stone with five marks cut in it; the first one is cracked. Lumi said it was cold near it.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.

Actions:
- primary: Eat Berries
- hands: Interact with five-wound shrine stone
- take: —
- put: Set Berries down by five-wound shrine stone
- use: Use Berries on five-wound shrine stone
- self: Eat Berries
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **use**

*no rule: «you use Berries on five-wound shrine stone» (thing)*

## Turn 37

```text
Day 1, 13:14, cloud — Woundstone Foot

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

You: hp 40/40 · held: Berries · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries (selected) · [1] Cut Grass · [2] Stone

Since your last action:
- You try Berries on five-wound shrine stone…
- The world had no rule for: you use Berries on five-wound shrine stone
- Nothing happens.

Journal:
- Down from the Mountain (descent): active, stage 20 — An old stone with five marks cut in it; the first one is cracked. Lumi said it was cold near it.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.

Actions:
- primary: Eat Berries
- hands: Interact with five-wound shrine stone
- take: —
- put: Set Berries down by five-wound shrine stone
- use: Use Berries on five-wound shrine stone
- self: Eat Berries
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **select 2**

## Turn 38

```text
Day 1, 13:14, cloud — Woundstone Foot

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

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected)

Since your last action:
- Quest descent → stage 30
- Lumi: "Did you see that? It answered! Whatever the world learns is kept in the Threadbook: {key:journal}. Come on, down to Vesper Ford!"

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.

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

> **move right 1** · Journal: «Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.»

## Turn 39

```text
Day 1, 13:14, cloud — Woundstone Foot

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

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.

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

> **move down 5**

## Turn 40

```text
Day 1, 13:15, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
****..**##########**..****XX..
**XX..######t1######..XX**XX..
..******######c1t2******......
..************====****........
....**********====**..........
..XX....**..**@@==....XX......
..............vv==..,,t3..TT..
..............====..,,........
================..............
............====....t4........
............====..............
Terrain: ## cobble, ** flowers, ,, drygrass, .. grass, == path, TT tree, XX wall
@@ You — facing down
t1 five-wound shrine stone
c1 Lumi
t2 chalk drawing of a stone
t3 grass tuft
t4 Woundstone Foot statue

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected)

Since your last action:
- Lumi: "Look, a waypoint statue! Walk up to it and press {key:hands} to wake it. After that, the map ({key:map}) can bring you back to it from anywhere."

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.

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

> **move down 4**

## Turn 41

```text
Day 1, 13:16, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
....**********====**..........
..XX....**..**====....XX......
..............c1==..,,t1..TT..
..............====..,,........
================..............
............==@@....t2........
............==vv..............
..........====....t3..........
......t4..====..........,,,,,,
........====....XX......,,,,,,
........====t5..........,,,,,,
Terrain: ** flowers, ,, drygrass, .. grass, == path, TT tree, XX wall
@@ You — facing down
c1 Lumi
t1 grass tuft
t2 Woundstone Foot statue
t3 grass tuft
t4 wildflowers
t5 sign

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.

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

> **The statue is 3 cells to the right. Let me go wake it.** · *not an action*

## Turn 42

```text
Day 1, 13:16, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
....**********====**..........
..XX....**..**====....XX......
..............c1==..,,t1..TT..
..............====..,,........
================..............
............==@@....t2........
............==vv..............
..........====....t3..........
......t4..====..........,,,,,,
........====....XX......,,,,,,
........====t5..........,,,,,,
Terrain: ** flowers, ,, drygrass, .. grass, == path, TT tree, XX wall
@@ You — facing down
c1 Lumi
t1 grass tuft
t2 Woundstone Foot statue
t3 grass tuft
t4 wildflowers
t5 sign

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected)

Since your last action:
- Not an action: The statue is 3 cells to the right. Let me go wake it.

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.

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

> **move right 2**

## Turn 43

```text
Day 1, 13:17, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
**********====**..............
....**..**====....XX..........
..........c1==..,,t1..TT......
..........====..,,............
============..................
........====..@@t2............
........====..................
......====....t3..........t4..
..t5..====..........,,,,,,,,,,
....====....XX......,,,,,,,,,,
....====t6..........,,,,,,,,t7
Terrain: ** flowers, ,, drygrass, .. grass, == path, TT tree, XX wall
@@ You — facing right (in front: t2)
c1 Lumi
t1 grass tuft
t2 Woundstone Foot statue
t3 grass tuft
t4 Stone
t5 wildflowers
t6 sign
t7 Cut Grass

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.

Actions:
- primary: Use Stone on yourself
- hands: Wake Woundstone Foot statue
- take: —
- put: Set Stone down by Woundstone Foot statue
- use: Use Stone on Woundstone Foot statue
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands** · Journal: «Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).»

## Turn 44

```text
Day 1, 13:17, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
**********====**..............
....**..**====....XX..........
..........c1==..,,t1..TT......
..........====..,,............
============..................
........====..@@t2............
........====..................
......====....t3..........t4..
..t5..====..........,,,,,,,,,,
....====....XX......,,,,,,,,,,
....====t6..........,,,,,,,,t7
Terrain: ** flowers, ,, drygrass, .. grass, == path, TT tree, XX wall
@@ You — facing right (in front: t2)
c1 Lumi
t1 grass tuft
t2 Woundstone Foot statue
t3 grass tuft
t4 Stone
t5 wildflowers
t6 sign
t7 Cut Grass

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected)

Since your last action:
- The statue wakes under your hand. ({key:map}: the map — travel to any statue you have woken.)

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).

Actions:
- primary: Use Stone on yourself
- hands: Listen to Woundstone Foot statue
- take: —
- put: Set Stone down by Woundstone Foot statue
- use: Use Stone on Woundstone Foot statue
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands**

## Turn 45

```text
Day 1, 13:17, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
**********====**..............
....**..**====....XX..........
..........c1==..,,t1..TT......
..........====..,,............
============..................
........====..@@t2............
........====..................
......====....t3..........t4..
..t5..====..........,,,,,,,,,,
....====....XX......,,,,,,,,,,
....====t6..........,,,,,,,,t7
Terrain: ** flowers, ,, drygrass, .. grass, == path, TT tree, XX wall
@@ You — facing right (in front: t2)
c1 Lumi
t1 grass tuft
t2 Woundstone Foot statue
t3 grass tuft
t4 Stone
t5 wildflowers
t6 sign
t7 Cut Grass

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected)

Since your last action:
- The statue hums. Open the map ({key:map}) to travel to another one.

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).

Actions:
- primary: Use Stone on yourself
- hands: Listen to Woundstone Foot statue
- take: —
- put: Set Stone down by Woundstone Foot statue
- use: Use Stone on Woundstone Foot statue
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left 2**

## Turn 46

```text
Day 1, 13:17, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
....**********====**..........
..XX....**..**====....XX......
..............c1==..,,t1..TT..
..............====..,,........
================..............
............<<@@....t2........
............====..............
..........====....t3..........
......t4..====..........,,,,,,
........====....XX......,,,,,,
........====t5..........,,,,,,
Terrain: ** flowers, ,, drygrass, .. grass, == path, TT tree, XX wall
@@ You — facing left
c1 Lumi
t1 grass tuft
t2 Woundstone Foot statue
t3 grass tuft
t4 wildflowers
t5 sign

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).

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

> **move down 2**

## Turn 47

```text
Day 1, 13:18, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
..............====..,,t1..TT..
..............====..,,........
==============c1..............
............====....t2........
............====..............
..........====@@..t3..........
......t4..====vv........,,,,,,
........====....XX......,,,,,,
........====t5..........,,,,,,
......====......,,,,,,,,......
......====,,,,,,,,TTTTPPTTPPTT
Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing down
t1 grass tuft
c1 Lumi
t2 Woundstone Foot statue
t3 grass tuft
t4 wildflowers
t5 sign

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).

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

> **move down 3**

## Turn 48

```text
Day 1, 13:18, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
............====....t1........
............====..............
..........====c1..t2..........
......t3..====..........,,,,,,
........====....XX......,,,,,,
........====t4@@........,,,,,,
......====....vv,,,,,,,,......
......====,,,,,,,,TTTTPPTTPPTT
......====,,PPTTTTPPTTTTTTPPTT
TTTTPP====PPTTTTTTPPTTTTPPTTTT

Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing down
t1 Woundstone Foot statue
c1 Lumi
t2 grass tuft
t3 wildflowers
t4 sign

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).

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

> **face left**

## Turn 49

```text
Day 1, 13:18, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
............====....t1........
............====..............
..........====c1..t2..........
......t3..====..........,,,,,,
........====....XX......,,,,,,
........====t4@@........,,,,,,
......====......,,,,,,,,......
......====,,,,,,,,TTTTPPTTPPTT
......====,,PPTTTTPPTTTTTTPPTT
TTTTPP====PPTTTTTTPPTTTTPPTTTT

Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing left (in front: t4)
t1 Woundstone Foot statue
c1 Lumi
t2 grass tuft
t3 wildflowers
t4 sign

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).

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

## Turn 50

```text
Day 1, 13:18, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
............====....t1........
............====..............
..........====c1..t2..........
......t3..====..........,,,,,,
........====....XX......,,,,,,
........====t4@@........,,,,,,
......====......,,,,,,,,......
......====,,,,,,,,TTTTPPTTPPTT
......====,,PPTTTTPPTTTTTTPPTT
TTTTPP====PPTTTTTTPPTTTTPPTTTT

Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing left (in front: t4)
t1 Woundstone Foot statue
c1 Lumi
t2 grass tuft
t3 wildflowers
t4 sign

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected)

Since your last action:
- sign: "Vesper Ford ↓"

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).

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

> **move down 1**

## Turn 51

```text
Day 1, 13:19, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
............====..............
..........====....t1..........
......t2..====c1........,,,,,,
........====....XX......,,,,,,
........====t3..........,,,,,,
......====....@@,,,,,,,,......
......====,,,,vv,,TTTTPPTTPPTT
......====,,PPTTTTPPTTTTTTPPTT
TTTTPP====PPTTTTTTPPTTTTPPTTTT


Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing down
t1 grass tuft
t2 wildflowers
c1 Lumi
t3 sign

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).

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

> **move left 3**

## Turn 52

```text
Day 1, 13:19, cloud — Woundstone Foot

Around you (each cell two characters; north is up; blank is outside the map):
,,,,,,............====........
,,,,,,..........====....t1....
,,,,,,......t2..====c1........
,,,,,,........====....XX......
TT,,,,........====t3..........
,,,,,,......<<@@......,,,,,,,,
,,,,,,......====,,,,,,,,TTTTPP
TTTTTT......====,,PPTTTTPPTTTT
TTPPTTTTTTPP====PPTTTTTTPPTTTT


Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing left
t1 grass tuft
t2 wildflowers
c1 Lumi
t3 sign

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected)

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 30 — I did something the world had never seen, and it answered. What it learns is kept in the Threadbook.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).

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

> **move down 4**

## Turn 53

```text
Day 1, 13:20, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):



OOOOOOOOOOOO====OOOOOOOOTTTTTT
OOOOOOOOOOOO====OOc1OOOOPPbbPP
OOOOOOOOOOOO==@@OOOOOOOOTTnnnn
..........XX==vvXX......TTnnc2
............==TTt1..t2....nnnn
,,,,,,......==TT..t3........nn
t4,,,,,,..t5==......t6........
,,t7,,,,====t8..t9....TT......
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing down
c1 Lumi
c2 frost slime
t1 fallen leaves
t2 boulder
t3 boulder
t4 Cut Grass
t5 Stone
t6 Stone
t7 Cut Grass
t8 Stone
t9 grass tuft

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected)

Since your last action:
- You are in Vesper Ford
- Quest descent → stage 40
- Lumi: "That's Vesper Ford! Someone down there looks like they need help."

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).

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

> **move down 1** · Journal: «Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.»

## Turn 54

```text
Day 1, 13:21, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):


OOOOOOOOOOOO====OOOOOOOOTTTTTT
OOOOOOOOOOOO====OOc1OOOOPPbbPP
OOOOOOOOOOOO====OOOOOOOOTTnnnn
..........XX==@@XX......TTnnc2
............==vvt1..t2....nnnn
,,,,,,....P1==TT..t3........nn
t4,,,,,,..t5==......t6........
,,t7,,,,====t8..t9....TT......
==,,,,,,==,,........TTTT......
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing down
c1 Lumi
c2 frost slime
t1 fallen leaves
t2 boulder
P1 Hesper
t3 boulder
t4 Cut Grass
t5 Stone
t6 Stone
t7 Cut Grass
t8 Stone
t9 grass tuft

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected)

Since your last action:
- Hesper: "Off the mountain? Nobody has come down that stair since the storm. And the evenings come sooner every week."

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **advance**

## Turn 55

```text
Day 1, 13:21, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):


OOOOOOOOOOOO====OOOOOOOOTTTTTT
OOOOOOOOOOOO====OOc1OOOOPPbbPP
OOOOOOOOOOOO====OOOOOOOOTTnnnn
..........XX==@@XX......TTnnc2
............==vvt1..t2....nnnn
,,,,,,....P1==TT..t3........nn
t4,,,,,,..t5==......t6........
,,t7,,,,====t8..t9....TT......
==,,,,,,==,,........TTTT......
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing down
c1 Lumi
c2 frost slime
t1 fallen leaves
t2 boulder
P1 Hesper
t3 boulder
t4 Cut Grass
t5 Stone
t6 Stone
t7 Cut Grass
t8 Stone
t9 grass tuft

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected)

Since your last action:
- Hesper: "The storm took my ferry rope. The bridge was a rider. He was all in white, with a crown of thorns grown through his helm. He pulled the planks up with his hands and laid the nails out on my pier in a row, like a toll."

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **advance** · Journal: «Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.»

## Turn 56

```text
Day 1, 13:22, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):


OOOOOOOOOOOO====OOOOOOOOTTTTTT
OOOOOOOOOOOO====OOc1OOOOPPbbPP
OOOOOOOOOOOO====OOOOOOOOTTnnnn
..........XX==@@XX......TTnnc2
............==vvt1..t2....nnnn
,,,,,,....P1==TT..t3........nn
t4,,,,,,..t5==......t6........
,,t7,,,,====t8..t9....TT......
==,,,,,,==,,........TTTT......
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing down
c1 Lumi
c2 frost slime
t1 fallen leaves
t2 boulder
P1 Hesper
t3 boulder
t4 Cut Grass
t5 Stone
t6 Stone
t7 Cut Grass
t8 Stone
t9 grass tuft

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected)

Since your last action:
- Hesper: "Three planks would mend it. There's an old axe by the stump, and the woods are full of trees."

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **advance** · Journal: «Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.»

## Turn 57

```text
Day 1, 13:22, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):


OOOOOOOOOOOO====OOOOOOOOTTTTTT
OOOOOOOOOOOO====OOc1OOOOPPbbPP
OOOOOOOOOOOO====OOOOOOOOTTnnnn
..........XX==@@XX......TTnnc2
............==vvt1..t2....nnnn
,,,,,,....P1==TT..t3........nn
t4,,,,,,..t5==......t6........
,,t7,,,,====t8..t9....TT......
==,,,,,,==,,........TTTT......
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing down
c1 Lumi
c2 frost slime
t1 fallen leaves
t2 boulder
P1 Hesper
t3 boulder
t4 Cut Grass
t5 Stone
t6 Stone
t7 Cut Grass
t8 Stone
t9 grass tuft

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected)

Since your last action:
- Hesper: "West of here is Firstlight Village. Tobin keeps his cart there now. A meal might buy you something useful from him."

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **advance** · Journal: «Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.»

## Turn 58

```text
Day 1, 13:22, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):


OOOOOOOOOOOO====OOOOOOOOTTTTTT
OOOOOOOOOOOO====OOc1OOOOPPbbPP
OOOOOOOOOOOO====OOOOOOOOTTnnnn
..........XX==@@XX......TTnnc2
............==vvt1..t2....nnnn
,,,,,,....P1==TT..t3........nn
t4,,,,,,..t5==......t6........
,,t7,,,,====t8..t9....TT......
==,,,,,,==,,........TTTT......
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing down
c1 Lumi
c2 frost slime
t1 fallen leaves
t2 boulder
P1 Hesper
t3 boulder
t4 Cut Grass
t5 Stone
t6 Stone
t7 Cut Grass
t8 Stone
t9 grass tuft

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected)

Since your last action:
- Hesper: "It's a small place. Good soil, a well, and a roof when the weather turns."

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **advance**

## Turn 59

```text
Day 1, 13:22, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):


OOOOOOOOOOOO====OOOOOOOOTTTTTT
OOOOOOOOOOOO====OOc1OOOOPPbbPP
OOOOOOOOOOOO====OOOOOOOOTTnnnn
..........XX==@@XX......TTnnc2
............==vvt1..t2....nnnn
,,,,,,....P1==TT..t3........nn
t4,,,,,,..t5==......t6........
,,t7,,,,====t8..t9....TT......
==,,,,,,==,,........TTTT......
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing down
c1 Lumi
c2 frost slime
t1 fallen leaves
t2 boulder
P1 Hesper
t3 boulder
t4 Cut Grass
t5 Stone
t6 Stone
t7 Cut Grass
t8 Stone
t9 grass tuft

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected)

Since your last action:
- Hesper: "They've had it worse than me, though. Two of theirs went missing in the storm, I hear. Rowan, their elder, is asking anyone who can hold a blade. The bridge can wait. Go to them first."

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **advance** · Journal: «Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.»

## Turn 60

```text
Day 1, 13:22, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):


OOOOOOOOOOOO====OOOOOOOOTTTTTT
OOOOOOOOOOOO====OOc1OOOOPPbbPP
OOOOOOOOOOOO====OOOOOOOOTTnnnn
..........XX==@@XX......TTnnc2
............==vvt1..t2....nnnn
,,,,,,....P1==TT..t3........nn
t4,,,,,,..t5==......t6........
,,t7,,,,====t8..t9....TT......
==,,,,,,==,,........TTTT......
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing down
c1 Lumi
c2 frost slime
t1 fallen leaves
t2 boulder
P1 Hesper
t3 boulder
t4 Cut Grass
t5 Stone
t6 Stone
t7 Cut Grass
t8 Stone
t9 grass tuft

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread

Since your last action:
- You: "(In your pack: the end of a travel loaf.)"

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **advance** · Journal: «Got Bread (slot 3) — could trade as "meal" to Tobin.»

## Turn 61

```text
Day 1, 13:22, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):


OOOOOOOOOOOO====OOOOOOOOTTTTTT
OOOOOOOOOOOO====OOc1OOOOPPbbPP
OOOOOOOOOOOO====OOOOOOOOTTnnnn
..........XX==@@XX......TTnnc2
............==vvt1..t2....nnnn
,,,,,,....P1==TT..t3........nn
t4,,,,,,..t5==......t6........
,,t7,,,,====t8..t9....TT......
==,,,,,,==,,........TTTT......
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing down
c1 Lumi
c2 frost slime
t1 fallen leaves
t2 boulder
P1 Hesper
t3 boulder
t4 Cut Grass
t5 Stone
t6 Stone
t7 Cut Grass
t8 Stone
t9 grass tuft

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.

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

> **move left 1**

## Turn 62

```text
Day 1, 13:22, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):


OOOOOOOOOOOOOO====OOOOOOOOTTTT
OOOOOOOOOOOOOO====OOc1OOOOPPbb
OOOOOOOOOOOOOO====OOOOOOOOTTnn
t1..........<<@@..XX......TTnn
..............==TTt2..t3....nn
t4,,,,,,......P1TT..t5........
,,t6,,,,,,..t7==......t8......
,,,,t9,,,,====tA..tB....TT....
====,,,,,,==,,........TTTT....
Terrain: ,, drygrass, .. grass, == path, OO cave_wall, PP pine, TT tree, XX wall, bb bush, nn snow
@@ You — facing left
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

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.

Actions:
- primary: Use Stone on yourself
- hands: Interact with stone wall
- take: —
- put: —
- use: Use Stone on stone wall
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down 1**

## Turn 63

```text
Day 1, 13:22, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):

OOOOOOOOOOOOOO====OOOOOOOOTTTT
OOOOOOOOOOOOOO====OOc1OOOOPPbb
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

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.

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

> **move left 1**

## Turn 64

```text
Day 1, 13:23, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):

OOOOOOOOOOOOOOOO====OOOOOOOOTT
OOOOOOOOOOOOOOOO====OOOOOOOOPP
OOOOOOOOOOOOOOOO====c1OOOOOOTT
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

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.

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

> **move left 6**

## Turn 65

```text
Day 1, 13:24, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):

OOOOOOOOOOOOOOOOOOOOOOOOOOOO==
OOOOOOOOOOOOOOOOOOOOOOOOOOOO==
OOOOOOOOOOOOOOOOOOOOOOOOOOOO==
..............t1..........XX==
t2::t3::::t4<<@@....c1......==
::::::::::::..t5,,,,,,......==
t6::c2::====,,,,t7,,,,,,..t8==
..::..,,t9====,,,,tA,,,,====tB
..,,,,,,,,,,======,,,,,,==,,..
PP....,,,,,,,,,,====,,====..tC
Terrain: ,, drygrass, .. grass, :: dirt, == path, OO cave_wall, PP pine, XX wall
@@ You — facing left
t1 boulder
t2 moss
t3 slime burrow
t4 boulder
c1 Lumi
t5 Cut Grass
t6 Bone
c2 fire slime
t7 Cut Grass
t8 Stone
t9 Bone
tA Cut Grass
tB Stone
tC boulder

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.

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

> **move left 1** · Journal: «Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.»

## Turn 66

```text
Day 1, 13:24, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):

OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
TT..............t1..........XX
t2t3::t4::::t5@@....c1........
TT::::::::::::..t6,,,,,,......
TTt7::c2::====,,,,t8,,,,,,..t9
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

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.

Actions:
- primary: Use Stone on yourself
- hands: Interact with boulder
- take: —
- put: Set Stone down by boulder
- use: Use Stone on boulder
- self: Use Stone on yourself
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up 1**

## Turn 67

```text
Day 1, 13:24, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):


OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOO^^OOOOOOOOOOOOOO
TT............@@t1..........XX
t2t3::t4::::t5......c1........
TT::::::::::::..t6,,,,,,......
TTt7::c2::====,,,,t8,,,,,,..t9
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

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.

Actions:
- primary: Use Stone on yourself
- hands: Interact with cave wall
- take: —
- put: —
- use: Use Stone on cave wall
- self: Use Stone on yourself
- move: up blocked · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left 6**

## Turn 68

```text
Day 1, 13:25, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):


OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
TTTTTT......<<@@....c1........
PPTTt2t3::t4::::t5............
TTTTTT::::::::::::..t6,,,,,,..
TTTTTTt7::c2::====,,,,t8,,,,,,
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

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.

Actions:
- primary: Use Stone on yourself
- hands: Interact with slime burrow
- take: —
- put: Set Stone down by slime burrow
- use: Use Stone on slime burrow
- self: Use Stone on yourself
- move: up blocked · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down 2**

## Turn 69

```text
Day 1, 13:25, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
TTTTTT..............c1........
PPTTt2t3::t4::::t5............
TTTTTT::::::::@@::..t6,,,,,,..
TTTTTTt7::c2::vv==,,,,t8,,,,,,
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

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.

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

## Turn 70

```text
Day 1, 13:26, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
TTTTTT..............t1........
PPTTt2t3::t4::::t5............
TTTTTT::::::::::c1..t6,,,,,,..
TTTTTTt7::::c2====,,,,t8,,,,,,
TTPPTT..::..,,t9====,,,,tA,,,,
PPTTPP..,,,,,,@@,,======,,,,,,
TTPPTTPP....,,vv,,,,,,====,,==
TTTT..............tB....======
PPTT..TT....tC............==..
TTTTPPbbPP....tD..........====
PPTT..TTPPPP....tE..........==
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
t8 Cut Grass
t9 Bone
tA Cut Grass
tB haystack
tC Stick
tD Stick
tE Stick

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.

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

> **move down 3**

## Turn 71

```text
Day 1, 13:26, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
TTTTTTt1::::c1====,,,,t2,,,,,,
TTPPTT..::..,,t3====,,,,t4,,,,
PPTTPP..,,,,,,c2,,======,,,,,,
TTPPTTPP....,,,,,,,,,,====,,==
TTTT..............t5....======
PPTT..TT....t6@@..........==..
TTTTPPbbPP....t7..........====
PPTT..TTPPPP....t8..........==
TTTTbb..TT..........t9..tA..==
TTTTTT..........tB............
TTTTTT......tCtD........tE..tF
Terrain: ,, drygrass, .. grass, :: dirt, == path, PP pine, TT tree, bb bush
@@ You — facing down (in front: t7)
t1 Bone
c1 fire slime
t2 Cut Grass
t3 Bone
t4 Cut Grass
c2 Lumi
t5 haystack
t6 Stick
t7 Stick
t8 Stick
t9 tent
tA chest
tB firewood
tC stump
tD Old Axe
tE grass tuft
tF campfire

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.

Actions:
- primary: Use Stone on yourself
- hands: Take Stick
- take: Take Stick
- put: Put Stone down by Stick
- use: Use Stone on Stick
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **take**

## Turn 72

```text
Day 1, 13:26, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
TTTTTTt1::::c1====,,,,t2,,,,,,
TTPPTT..::..,,t3====,,,,t4,,,,
PPTTPP..,,,,,,c2,,======,,,,,,
TTPPTTPP....,,,,,,,,,,====,,==
TTTT..............t5....======
PPTT..TT....t6@@..........==..
TTTTPPbbPP....vv..........====
PPTT..TTPPPP....t7..........==
TTTTbb..TT..........t8..t9..==
TTTTTT..........tA............
TTTTTT......tBtC........tD..tE
Terrain: ,, drygrass, .. grass, :: dirt, == path, PP pine, TT tree, bb bush
@@ You — facing down
t1 Bone
c1 fire slime
t2 Cut Grass
t3 Bone
t4 Cut Grass
c2 Lumi
t5 haystack
t6 Stick
t7 Stick
t8 tent
t9 chest
tA firewood
tB stump
tC Old Axe
tD grass tuft
tE campfire

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread · [4] Stick

Since your last action:
- You take Stick.

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.

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

> **move down 4** · Journal: «Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.»

## Turn 73

```text
Day 1, 13:27, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
TTTT..............t1....======
PPTT..TT....t2............==..
TTTTPPbbPP....c1..........====
PPTT..TTPPPP....t3..........==
TTTTbb..TT..........t4..t5..==
TTTTTT........@@t6............
TTTTTT......t7t8........t9..tA
TTTTTT..........::::..........
==..::....==========........tB
==========================....
==::::::::==....::============
Terrain: .. grass, :: dirt, == path, PP pine, TT tree, bb bush
@@ You — facing down (in front: t8)
t1 haystack
t2 Stick
c1 Lumi
t3 Stick
t4 tent
t5 chest
t6 firewood
t7 stump
t8 Old Axe
t9 grass tuft
tA campfire
tB log bench

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread · [4] Stick

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.

Actions:
- primary: Use Stone on yourself
- hands: Take Old Axe
- take: Take Old Axe
- put: Put Stone down by Old Axe
- use: Use Stone on Old Axe
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **take** · Journal: «Took Old Axe at camp (13:27). Can cut trees for planks later.»

## Turn 74

```text
Day 1, 13:27, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
TTTT..............t1....======
PPTT..TT....t2............==..
TTTTPPbbPP....c1..........====
PPTT..TTPPPP....t3..........==
TTTTbb..TT..........t4..t5..==
TTTTTT........@@t6............
TTTTTT......t7vv........t8..t9
TTTTTT..........::::..........
==..::....==========........tA
==========================....
==::::::::==....::============
Terrain: .. grass, :: dirt, == path, PP pine, TT tree, bb bush
@@ You — facing down
t1 haystack
t2 Stick
c1 Lumi
t3 Stick
t4 tent
t5 chest
t6 firewood
t7 stump
t8 grass tuft
t9 campfire
tA log bench

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread · [4] Stick · [5] Old Axe

Since your last action:
- You take Old Axe.

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.

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

> **move up 1**

## Turn 75

```text
Day 1, 13:27, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
TTPPTTPP....,,,,,,,,,,====,,==
TTTT..............t1....======
PPTT..TT....t2............==..
TTTTPPbbPP....c1..........====
PPTT..TTPPPP..^^t3..........==
TTTTbb..TT....@@....t4..t5..==
TTTTTT..........t6............
TTTTTT......t7..........t8..t9
TTTTTT..........::::..........
==..::....==========........tA
==========================....
Terrain: ,, drygrass, .. grass, :: dirt, == path, PP pine, TT tree, bb bush
@@ You — facing up
t1 haystack
t2 Stick
c1 Lumi
t3 Stick
t4 tent
t5 chest
t6 firewood
t7 stump
t8 grass tuft
t9 campfire
tA log bench

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread · [4] Stick · [5] Old Axe

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.

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

> **move right 4**

## Turn 76

```text
Day 1, 13:28, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
PPTTPP....,,,,,,,,,,====,,====
TT..............t1....======..
TT..TT....t2............==....
TTPPbbPP....c1..........====..
TT..TTPPPP....t3..........==..
TTbb..TT......@@>>t4..t5..==..
TTTT..........t6..............
TTTT......t7..........t8..t9..
TTTT..........::::..........tA
..::....==========........tB..
========================......
Terrain: ,, drygrass, .. grass, :: dirt, == path, PP pine, TT tree, bb bush
@@ You — facing right
t1 haystack
t2 Stick
c1 Lumi
t3 Stick
t4 tent
t5 chest
t6 firewood
t7 stump
t8 grass tuft
t9 campfire
tA Torch
tB log bench

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread · [4] Stick · [5] Old Axe

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.

Actions:
- primary: Use Stone on yourself
- hands: Go into tent
- take: —
- put: Set Stone down by tent
- use: Use Stone on tent
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up 1**

## Turn 77

```text
Day 1, 13:28, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
TTPP..,,,,,,,,,,======,,,,,,==
PPTTPP....,,,,,,,,,,====,,====
TT..............t1....======..
TT..TT....t2............==....
TTPPbbPP....c1^^........====..
TT..TTPPPP....@@..........==..
TTbb..TT..........t4..t5..==..
TTTT..........t6..............
TTTT......t7..........t8..t9..
TTTT..........::::..........tA
..::....==========........tB..
Terrain: ,, drygrass, .. grass, :: dirt, == path, PP pine, TT tree, bb bush
@@ You — facing up
t1 haystack
t2 Stick
c1 Lumi
t3 Stick
t4 tent
t5 chest
t6 firewood
t7 stump
t8 grass tuft
t9 campfire
tA Torch
tB log bench

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread · [4] Stick · [5] Old Axe

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.

Actions:
- primary: Use Stone on yourself
- hands: Take Stick
- take: —
- put: Place Stone
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands**

## Turn 78

```text
Day 1, 13:28, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
TTPP..,,,,,,,,,,======,,,,,,==
PPTTPP....,,,,,,,,,,====,,====
TT..............t1....======..
TT..TT....t2............==....
TTPPbbPP....c1^^........====..
TT..TTPPPP....@@..........==..
TTbb..TT..........t3..t4..==..
TTTT..........t5..............
TTTT......t6..........t7..t8..
TTTT..........::::..........t9
..::....==========........tA..
Terrain: ,, drygrass, .. grass, :: dirt, == path, PP pine, TT tree, bb bush
@@ You — facing up
t1 haystack
t2 Stick
c1 Lumi
t3 tent
t4 chest
t5 firewood
t6 stump
t7 grass tuft
t8 campfire
t9 Torch
tA log bench

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread · [4] Stick ×2 · [5] Old Axe

Since your last action:
- You take Stick.

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.

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

> **move right 4**

## Turn 79

```text
Day 1, 13:28, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
TTPP..,,,,,,,,,,======,,,,,,==
PPTTPP....,,,,,,,,,,====,,====
TT..............t1....======..
TT..TT....t2............==....
TTPPbbPP....c1..........====..
TT..TTPPPP....@@>>........==..
TTbb..TT..........t3..t4..==..
TTTT..........t5..............
TTTT......t6..........t7..t8..
TTTT..........::::..........t9
..::....==========........tA..
Terrain: ,, drygrass, .. grass, :: dirt, == path, PP pine, TT tree, bb bush
@@ You — facing right
t1 haystack
t2 Stick
c1 Lumi
t3 tent
t4 chest
t5 firewood
t6 stump
t7 grass tuft
t8 campfire
t9 Torch
tA log bench

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.

Actions:
- primary: Use Stone on yourself
- hands: Go into tent
- take: —
- put: Set Stone down by tent
- use: Use Stone on tent
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up 1**

## Turn 80

```text
Day 1, 13:28, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
PPTT..::..,,t1====,,,,t2,,,,==
TTPP..,,,,,,,,,,======,,,,,,==
PPTTPP....,,,,,,,,,,====,,====
TT..............t3....======..
TT..TT....t4..^^........==....
TTPPbbPP....c1@@........====..
TT..TTPPPP................==..
TTbb..TT..........t5..t6..==..
TTTT..........t7..............
TTTT......t8..........t9..tA..
TTTT..........::::..........tB
Terrain: ,, drygrass, .. grass, :: dirt, == path, PP pine, TT tree, bb bush
@@ You — facing up
t1 Bone
t2 Cut Grass
t3 haystack
t4 Stick
c1 Lumi
t5 tent
t6 chest
t7 firewood
t8 stump
t9 grass tuft
tA campfire
tB Torch

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.

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

> **move down 5** · Journal: «West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.»

## Turn 81

```text
Day 1, 13:29, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
PPTTPP....,,,,,,,,,,====,,====
TT..............t1....======..
TT..TT....t2............==....
TTPPbbPP....c1..........====..
TT..TTPPPP................==..
TTbb..TT......@@..t3..t4..==..
TTTT..........t5..............
TTTT......t6..........t7..t8..
TTTT..........::::..........t9
..::....==========........tA..
========================......
Terrain: ,, drygrass, .. grass, :: dirt, == path, PP pine, TT tree, bb bush
@@ You — facing down (in front: t5)
t1 haystack
t2 Stick
c1 Lumi
t3 tent
t4 chest
t5 firewood
t6 stump
t7 grass tuft
t8 campfire
t9 Torch
tA log bench

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.

Actions:
- primary: Use Stone on yourself
- hands: Interact with firewood
- take: —
- put: Set Stone down by firewood
- use: Use Stone on firewood
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left 1**

## Turn 82

```text
Day 1, 13:29, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
TTPPTTPP....,,,,,,,,,,====,,==
TTTT..............t1....======
PPTT..TT....t2............==..
TTTTPPbbPP....c1..........====
PPTT..TTPPPP................==
TTTTbb..TT..<<@@....t3..t4..==
TTTTTT..........t5............
TTTTTT......t6..........t7..t8
TTTTTT..........::::..........
==..::....==========........t9
==========================....
Terrain: ,, drygrass, .. grass, :: dirt, == path, PP pine, TT tree, bb bush
@@ You — facing left
t1 haystack
t2 Stick
c1 Lumi
t3 tent
t4 chest
t5 firewood
t6 stump
t7 grass tuft
t8 campfire
t9 log bench

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.

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

> **move down 4**

## Turn 83

```text
Day 1, 13:30, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
PPTT..TTPPPP................==
TTTTbb..TT..........t1..t2..==
TTTTTT........c1t3............
TTTTTT......t4..........t5..t6
TTTTTT..........::::..........
==..::....====@@====........t7
==============vv==========....
==::::::::==....::============
TTPP..................::======
TTTTTTPP......................
TTPPTTPPTTTT..................
Terrain: .. grass, :: dirt, == path, PP pine, TT tree, bb bush
@@ You — facing down
t1 tent
t2 chest
c1 Lumi
t3 firewood
t4 stump
t5 grass tuft
t6 campfire
t7 log bench

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.

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

> **move down 1**

## Turn 84

```text
Day 1, 13:30, cloud — Vesper Ford

Around you (each cell two characters; north is up; blank is outside the map):
TTTTbb..TT..........t1..t2..==
TTTTTT..........t3............
TTTTTT......t4c1........t5..t6
TTTTTT..........::::..........
==..::....==========........t7
==============@@==========....
==::::::::==..vv::============
TTPP..................::======
TTTTTTPP......................
TTPPTTPPTTTT..................
TTTTTT..TTTT..bbTTTTTTt8......
Terrain: .. grass, :: dirt, == path, PP pine, TT tree, bb bush
@@ You — facing down
t1 tent
t2 chest
t3 firewood
t4 stump
c1 Lumi
t5 grass tuft
t6 campfire
t7 log bench
t8 fallen leaves

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.

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

> **move left 7**

## Turn 85

```text
Day 1, 13:31, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXXt1PPTTPP
XXXXXXXXXXt2PPPPTT
XXXXXXXXXXt3..TTTT
============XXc1==
==================
============<<@@==
......============
******..t4....TTTT
********....TTTTTT
TT....TTt5TTTTTTTT
..............TTPP
Terrain: ** flowers, .. grass, == path, PP pine, TT tree, XX wall
@@ You — facing left
t1 fallen leaves
t2 crate
t3 lamp post
c1 Lumi
t4 sign
t5 fallen leaves

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread · [4] Stick ×2 · [5] Old Axe

Since your last action:
- You are in Firstlight Village

Journal:
- Down from the Mountain (descent): active, stage 40 — I reached Vesper Ford. The bridge is broken and the ferry rope has snapped. Hesper, the ferrykeeper, sent me west to the village first.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (open)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.

Actions:
- primary: Use Stone on yourself
- hands: —
- take: —
- put: Place Stone
- use: Use Stone on dirt road
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable (to Vesper Ford)
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left 6** · Journal: «Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.»

## Turn 86

```text
Day 1, 13:31, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXXXXt1PPTTPP
XXXXXXXXXXXXt2PPPPTT
DDXXXXXXXXXXt3..TTTT
==============XXc1==
====================
============<<@@====
........============
..******..t4....TTTT
**********....TTTTTT
t5TT....TTt6TTTTTTTT
................TTPP
Terrain: ** flowers, .. grass, == path, DD door, PP pine, TT tree, XX wall
@@ You — facing left
t1 fallen leaves
t2 crate
t3 lamp post
c1 Lumi
t4 sign
t5 fallen leaves
t6 fallen leaves

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread · [4] Stick ×2 · [5] Old Axe · [6] Traveller's Boots

Since your last action:
- Quest taken: Lost in the Barrow
- Quest rescue → stage 10
- Quest complete: Down from the Mountain
- Quest descent → stage 100
- +16 XP
- Sister Ilse: "A traveller down from the mountain, and a fairy with you... We have not had a guest like you in a long while. Welcome to Firstlight. Come and warm your hands at the flame; it was lit on the first morning after the First Night."

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **advance** · Journal: «13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.»

## Turn 87

```text
Day 1, 13:31, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXXXXt1PPTTPP
XXXXXXXXXXXXt2PPPPTT
DDXXXXXXXXXXt3..TTTT
==============XXc1==
====================
============<<@@====
........============
..******..t4....TTTT
**********....TTTTTT
t5TT....TTt6TTTTTTTT
................TTPP
Terrain: ** flowers, .. grass, == path, DD door, PP pine, TT tree, XX wall
@@ You — facing left
t1 fallen leaves
t2 crate
t3 lamp post
c1 Lumi
t4 sign
t5 fallen leaves
t6 fallen leaves

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread · [4] Stick ×2 · [5] Old Axe · [6] Traveller's Boots

Since your last action:
- Pell: "A fairy! Can I draw her? Can I? Don't move, either of you!"

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **advance**

## Turn 88

```text
Day 1, 13:32, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXXXXt1PPTTPP
XXXXXXXXXXXXt2PPPPTT
DDXXXXXXXXXXt3..TTTT
==============XXc1==
====================
============<<@@====
........============
..******..t4....TTTT
**********....TTTTTT
t5TT....TTt6TTTTTTTT
................TTPP
Terrain: ** flowers, .. grass, == path, DD door, PP pine, TT tree, XX wall
@@ You — facing left
t1 fallen leaves
t2 crate
t3 lamp post
c1 Lumi
t4 sign
t5 fallen leaves
t6 fallen leaves

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread · [4] Stick ×2 · [5] Old Axe · [6] Traveller's Boots

Since your last action:
- Lumi: "Draw me? ...All right. But be quick. I'm no good at keeping still."

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **advance**

## Turn 89

```text
Day 1, 13:32, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXXXXt1PPTTPP
XXXXXXXXXXXXt2PPPPTT
DDXXXXXXXXXXt3..TTTT
==============XXc1==
====================
============<<@@====
........============
..******..t4....TTTT
**********....TTTTTT
t5TT....TTt6TTTTTTTT
................TTPP
Terrain: ** flowers, .. grass, == path, DD door, PP pine, TT tree, XX wall
@@ You — facing left
t1 fallen leaves
t2 crate
t3 lamp post
c1 Lumi
t4 sign
t5 fallen leaves
t6 fallen leaves

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread · [4] Stick ×2 · [5] Old Axe · [6] Traveller's Boots

Since your last action:
- Rowan: "Pell, let them be. — Traveller, I am sorry you have come at a bad time. Two of ours are missing. When you have warmed up, come and find me, and I will tell you the rest."

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **advance**

## Turn 90

```text
Day 1, 13:32, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXXXXt1PPTTPP
XXXXXXXXXXXXt2PPPPTT
DDXXXXXXXXXXt3..TTTT
==============XXc1==
====================
============<<@@====
........============
..******..t4....TTTT
**********....TTTTTT
t5TT....TTt6TTTTTTTT
................TTPP
Terrain: ** flowers, .. grass, == path, DD door, PP pine, TT tree, XX wall
@@ You — facing left
t1 fallen leaves
t2 crate
t3 lamp post
c1 Lumi
t4 sign
t5 fallen leaves
t6 fallen leaves

You: hp 40/40 · held: Stone · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone (selected) · [3] Bread · [4] Stick ×2 · [5] Old Axe · [6] Traveller's Boots

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.

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

> **select 6** · Journal: «Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.»

## Turn 91

```text
Day 1, 13:32, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXXXXt1PPTTPP
XXXXXXXXXXXXt2PPPPTT
DDXXXXXXXXXXt3..TTTT
==============XXc1==
====================
============<<@@====
........============
..******..t4....TTTT
**********....TTTTTT
t5TT....TTt6TTTTTTTT
................TTPP
Terrain: ** flowers, .. grass, == path, DD door, PP pine, TT tree, XX wall
@@ You — facing left
t1 fallen leaves
t2 crate
t3 lamp post
c1 Lumi
t4 sign
t5 fallen leaves
t6 fallen leaves

You: hp 40/40 · held: Traveller's Boots · worn: Watchman's Cloak (shoulders) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [3] Bread · [4] Stick ×2 · [5] Old Axe · [6] Traveller's Boots (selected)

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.

Actions:
- primary: Put on Traveller's Boots
- hands: —
- take: —
- put: Place Traveller's Boots
- use: Use Traveller's Boots on dirt road
- self: Put on Traveller's Boots
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **primary**

## Turn 92

```text
Day 1, 13:32, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXXXXt1PPTTPP
XXXXXXXXXXXXt2PPPPTT
DDXXXXXXXXXXt3..TTTT
==============XXc1==
====================
============<<@@====
........============
..******..t4....TTTT
**********....TTTTTT
t5TT....TTt6TTTTTTTT
................TTPP
Terrain: ** flowers, .. grass, == path, DD door, PP pine, TT tree, XX wall
@@ You — facing left
t1 fallen leaves
t2 crate
t3 lamp post
c1 Lumi
t4 sign
t5 fallen leaves
t6 fallen leaves

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [3] Bread · [4] Stick ×2 · [5] Old Axe

Since your last action:
- You put on Traveller's Boots.

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.

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

> **move left 2**

## Turn 93

```text
Day 1, 13:32, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXXXXXXXXt1PPTTPP
XXXXXXXXXXXXXXXXt2PPPPTT
XXXXDDXXXXXXXXXXt3..TTTT
==t4==============XXc1==
========================
============<<@@========
............============
......******..t5....TTTT
....**********....TTTTTT
TT..t6TT....TTt7TTTTTTTT
....................TTPP
Terrain: ** flowers, .. grass, == path, DD door, PP pine, TT tree, XX wall
@@ You — facing left
t1 fallen leaves
t2 crate
t3 lamp post
t4 sign
c1 Lumi
t5 sign
t6 fallen leaves
t7 fallen leaves

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [3] Bread · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.

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

> **move left 5**

## Turn 94

```text
Day 1, 13:33, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXXXXXXXXXXXXXXXXXXt1PP
XXXXXXXXXXXXXXXXXXXXXXXXXXt2PP
XXXXXXXXXXXXXXDDXXXXXXXXXXt3..
============t4==============XX
==============================
============<<@@====c1========
....t5**..............========
**********......******..t6....
********......**********....TT
....****..TT..t7TT....TTt8TTTT
HHHH..........................
Terrain: ** flowers, .. grass, == path, DD door, HH woodwall, PP pine, TT tree, XX wall
@@ You — facing left
t1 fallen leaves
t2 crate
t3 lamp post
t4 sign
c1 Lumi
t5 lamp post
t6 sign
t7 fallen leaves
t8 fallen leaves

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [3] Bread · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.

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

> **move left 6**

## Turn 95

```text
Day 1, 13:34, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
....XXXXXXXXXXXXXXXXXXXXXXXXXX
....XXXXXXXXXXXXXXXXXXXXXXXXXX
..t1XXXXXXDDXXXXXXXXXXXXXXDDXX
======t2================t3====
==============================
============<<@@====c1========
................t4**..........
........**************......**
t5..........********......****
................****..TT..t6TT
HHHHHHHHHHHHHHHH..............
Terrain: ** flowers, .. grass, == path, DD door, HH woodwall, TT tree, XX wall
@@ You — facing left
t1 barrel
t2 sign
t3 sign
c1 Lumi
t4 lamp post
t5 Stone
t6 fallen leaves

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [3] Bread · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.

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

> **move left 4**

## Turn 96

```text
Day 1, 13:35, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
............XXXXXXXXXXXXXXXXXX
....P1XX....XXXXXXXXXXXXXXXXXX
..........t1XXXXXXDDXXXXXXXXXX
==============t2==============
==============================
============<<@@====c1========
....t3..................t4**..
......t5........**************
......TTt6..........********..
........................****..
HHHHHHHHHHHHHHHHHHHHHHHH......
Terrain: ** flowers, .. grass, == path, DD door, HH woodwall, TT tree, XX wall
@@ You — facing left
P1 Vigo
t1 barrel
t2 sign
c1 Lumi
t3 trough
t4 lamp post
t5 Stone
t6 Stone

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [3] Bread · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.

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

> **move up 3**

## Turn 97

```text
Day 1, 13:35, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
........XXXXXXXXXXXXXXXXXXXXXX
............XXXXXXXXXXXXXXXXXX
....P1XX....XXXXXXXXXXXXXXXXXX
..........t1XXXXXXDDXXXXXXXXXX
==============t2==============
==============@@==============
====================c1========
....t3..................t4**..
......t5........**************
......TTt6..........********..
........................****..
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up (in front: t2)
P1 Vigo
t1 barrel
t2 sign
c1 Lumi
t3 trough
t4 lamp post
t5 Stone
t6 Stone

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [3] Bread · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.

Actions:
- primary: Punch sign
- hands: Read sign
- take: —
- put: —
- use: Punch sign
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands**

## Turn 98

```text
Day 1, 13:35, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
........XXXXXXXXXXXXXXXXXXXXXX
............XXXXXXXXXXXXXXXXXX
....P1XX....XXXXXXXXXXXXXXXXXX
..........t1XXXXXXDDXXXXXXXXXX
==============t2==============
==============@@==============
====================c1========
....t3..................t4**..
......t5........**************
......TTt6..........********..
........................****..
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up (in front: t2)
P1 Vigo
t1 barrel
t2 sign
c1 Lumi
t3 trough
t4 lamp post
t5 Stone
t6 Stone

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [3] Bread · [4] Stick ×2 · [5] Old Axe

Since your last action:
- sign: "GENERAL STORE — Greta's. Lamps, rope, bread, potions; she buys herbs, hides and eggs."

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.

Actions:
- primary: Punch sign
- hands: Read sign
- take: —
- put: —
- use: Punch sign
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left 5** · Journal: «Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.»

## Turn 99

```text
Day 1, 13:37, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
####======........XXXXXXXXXXXX
######................XXXXXXXX
####t1........P1XX....XXXXXXXX
####P2..............t4XXXXXXDD
######==================t5====
######======<<@@====c1========
####t6========================
####==........t7..............
......t8........t9........****
tAtB....tC......TTtD..........
tEtF..tG......................
Terrain: ## cobble, ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
t1 handcart
t2 Flask of Oil — under t1
t3 Frost Wand — under t1
P1 Vigo
P2 Tobin
t4 barrel
t5 sign
c1 Lumi
t6 Firstlight statue
t7 trough
t8 wildflowers
t9 Stone
tA tomato sprout
tB pumpkin sprout
tC Stone
tD Stone
tE young tomato
tF young pumpkin
tG Garden Supplies

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [3] Bread · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.

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

> **move left 5** · Journal: «Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.»

## Turn 100

```text
Day 1, 13:37, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
####t1########======........XX
##t2############..............
########P1####t3........P2XX..
######t6######P3..............
######P4########==============
############<<@@====c1========
##############t7==============
##############==........t8....
====............t9........tA..
====..tBtCtDtE....tF......TTtG
====..tHtItJtK..tL............
Terrain: ## cobble, .. grass, == path, TT tree, XX wall
@@ You — facing left
t1 lamp post
t2 Astra's altar
P1 Nessa Quill
t3 handcart
t4 Flask of Oil — under t3
t5 Frost Wand — under t3
P2 Vigo
t6 standing mirror
P3 Tobin
P4 Odette
c1 Lumi
t7 Firstlight statue
t8 trough
t9 wildflowers
tA Stone
tB carrot sprout
tC turnip sprout
tD tomato sprout
tE pumpkin sprout
tF Stone
tG Stone
tH young carrot
tI young turnip
tJ young tomato
tK young pumpkin
tL Garden Supplies

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [3] Bread · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up 1**

## Turn 101

```text
Day 1, 13:38, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXDDXXXXXXXX====..======......
####t1########======........XX
##t2############..............
########P1####t3........P2XX..
######t6######P3..............
######P4######@@==============
################====c1========
##############t7==============
##############==........t8....
====............t9........tA..
====..tBtCtDtE....tF......TTtG
Terrain: ## cobble, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up (in front: P3)
t1 lamp post
t2 Astra's altar
P1 Nessa Quill
t3 handcart
t4 Flask of Oil — under t3
t5 Frost Wand — under t3
P2 Vigo
t6 standing mirror
P3 Tobin
P4 Odette
c1 Lumi
t7 Firstlight statue
t8 trough
t9 wildflowers
tA Stone
tB carrot sprout
tC turnip sprout
tD tomato sprout
tE pumpkin sprout
tF Stone
tG Stone

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [3] Bread · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.

Actions:
- primary: Punch Tobin
- hands: Talk to Tobin
- take: —
- put: —
- use: Punch Tobin
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands**

## Turn 102

```text
Day 1, 13:38, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXDDXXXXXXXX====..======......
####t1########======........XX
##t2############..............
########P1####t3........P2XX..
######t6######P3..............
######P4######@@==============
################====c1========
##############t7==============
##############==........t8....
====............t9........tA..
====..tBtCtDtE....tF......TTtG
Terrain: ## cobble, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up (in front: P3)
t1 lamp post
t2 Astra's altar
P1 Nessa Quill
t3 handcart
t4 Flask of Oil — under t3
t5 Frost Wand — under t3
P2 Vigo
t6 standing mirror
P3 Tobin
P4 Odette
c1 Lumi
t7 Firstlight statue
t8 trough
t9 wildflowers
tA Stone
tB carrot sprout
tC turnip sprout
tD tomato sprout
tE pumpkin sprout
tF Stone
tG Stone

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [3] Bread · [4] Stick ×2 · [5] Old Axe

Since your last action:
- Tobin: "Welcome to Firstlight Village! Tobin, of the eastern road. Charms, oils, oddments — the ferry is still broken, so I brought the cart here. You wouldn't have anything to eat?"

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.

Talk with Tobin (neutral):
1. What news?
2. Let's talk a while.
3. I have something for you.
4. Let's trade.
5. Come with me.
6. Your money or your life.
7. (Slip a hand into their pocket.)
8. There are no gods watching, you know.
9. Goodbye.

Actions:
- The panel is open (time stands): talk <1–9>
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **talk 3**

## Turn 103

```text
Day 1, 13:38, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXDDXXXXXXXX====..======......
####t1########======........XX
##t2############..............
########P1####t3........P2XX..
######t6######P3..............
######P4######@@==============
################====c1========
##############t7==============
##############==........t8....
====............t9........tA..
====..tBtCtDtE....tF......TTtG
Terrain: ## cobble, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up (in front: P3)
t1 lamp post
t2 Astra's altar
P1 Nessa Quill
t3 handcart
t4 Flask of Oil — under t3
t5 Frost Wand — under t3
P2 Vigo
t6 standing mirror
P3 Tobin
P4 Odette
c1 Lumi
t7 Firstlight statue
t8 trough
t9 wildflowers
tA Stone
tB carrot sprout
tC turnip sprout
tD tomato sprout
tE pumpkin sprout
tF Stone
tG Stone

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [3] Bread · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.

A gift for Tobin (open):
1. Close.

Actions:
- The panel is open (time stands): talk <1–1>
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **talk 1**

## Turn 104

```text
Day 1, 13:38, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXDDXXXXXXXX====..======......
####t1########======........XX
##t2############..............
########P1####t3........P2XX..
######t6######P3..............
######P4######@@==============
################====c1========
##############t7==============
##############==........t8....
====............t9........tA..
====..tBtCtDtE....tF......TTtG
Terrain: ## cobble, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up (in front: P3)
t1 lamp post
t2 Astra's altar
P1 Nessa Quill
t3 handcart
t4 Flask of Oil — under t3
t5 Frost Wand — under t3
P2 Vigo
t6 standing mirror
P3 Tobin
P4 Odette
c1 Lumi
t7 Firstlight statue
t8 trough
t9 wildflowers
tA Stone
tB carrot sprout
tC turnip sprout
tD tomato sprout
tE pumpkin sprout
tF Stone
tG Stone

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [3] Bread · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.

Actions:
- primary: Punch Tobin
- hands: Talk to Tobin
- take: —
- put: —
- use: Punch Tobin
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **select 3**

## Turn 105

```text
Day 1, 13:38, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXDDXXXXXXXX====..======......
####t1########======........XX
##t2############..............
########P1####t3........P2XX..
######t6######P3..............
######P4######@@==============
################====c1========
##############t7==============
##############==........t8....
====............t9........tA..
====..tBtCtDtE....tF......TTtG
Terrain: ## cobble, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up (in front: P3)
t1 lamp post
t2 Astra's altar
P1 Nessa Quill
t3 handcart
t4 Flask of Oil — under t3
t5 Frost Wand — under t3
P2 Vigo
t6 standing mirror
P3 Tobin
P4 Odette
c1 Lumi
t7 Firstlight statue
t8 trough
t9 wildflowers
tA Stone
tB carrot sprout
tC turnip sprout
tD tomato sprout
tE pumpkin sprout
tF Stone
tG Stone

You: hp 40/40 · held: Bread · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [3] Bread (selected) · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.

Actions:
- primary: Eat Bread
- hands: Talk to Tobin
- take: —
- put: Give Bread to Tobin
- use: Feed Bread to Tobin
- self: Eat Bread
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **put**

## Turn 106

```text
Day 1, 13:38, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXDDXXXXXXXX====..======......
####t1########======........XX
##t2############..............
########P1####t3........P2XX..
######t6######P3..............
######P4######@@==============
################====c1========
##############t7==============
##############==........t8....
====............t9........tA..
====..tBtCtDtE....tF......TTtG
Terrain: ## cobble, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up (in front: P3)
t1 lamp post
t2 Astra's altar
P1 Nessa Quill
t3 handcart
t4 Flask of Oil — under t3
t5 Frost Wand — under t3
P2 Vigo
t6 standing mirror
P3 Tobin
P4 Odette
c1 Lumi
t7 Firstlight statue
t8 trough
t9 wildflowers
tA Stone
tB carrot sprout
tC turnip sprout
tD tomato sprout
tE pumpkin sprout
tF Stone
tG Stone

You: hp 40/40 · held: Bread · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [3] Bread (selected) · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.

Actions:
- Question: Give Bread to Tobin? — answer yes · answer no
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **answer yes**

## Turn 107

```text
Day 1, 13:38, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXDDXXXXXXXX====..======......
####t1########======........XX
##t2############..............
########P1####t3........P2XX..
######t6######P3..............
######P4######@@==============
################====c1========
##############t7==============
##############==........t8....
====............t9........tA..
====..tBtCtDtE....tF......TTtG
Terrain: ## cobble, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up (in front: P3)
t1 lamp post
t2 Astra's altar
P1 Nessa Quill
t3 handcart
t4 Flask of Oil — under t3
t5 Frost Wand — under t3
P2 Vigo
t6 standing mirror
P3 Tobin
P4 Odette
c1 Lumi
t7 Firstlight statue
t8 trough
t9 wildflowers
tA Stone
tB carrot sprout
tC turnip sprout
tD tomato sprout
tE pumpkin sprout
tF Stone
tG Stone

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- Tobin: "Bless you, friend. The wand on my cart, the blue one, it's yours. Point it right and frost comes off the tip."

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.

Actions:
- primary: Punch Tobin
- hands: Talk to Tobin
- take: —
- put: —
- use: Punch Tobin
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right 1** · Journal: «Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.»

## Turn 108

```text
Day 1, 13:38, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
DDXXXXXXXX====..======........
##t1########======........XXXX
t2############................
######P1####t3........P2XX....
####t6######P3..............t7
####P4########@@>>============
##############====c1==========
############t8================
############==........t9......
==............tA........tB....
==..tCtDtEtF....tG......TTtH..
Terrain: ## cobble, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 lamp post
t2 Astra's altar
P1 Nessa Quill
t3 handcart
t4 Flask of Oil — under t3
t5 Frost Wand — under t3
P2 Vigo
t6 standing mirror
P3 Tobin
t7 barrel
P4 Odette
c1 Lumi
t8 Firstlight statue
t9 trough
tA wildflowers
tB Stone
tC carrot sprout
tD turnip sprout
tE tomato sprout
tF pumpkin sprout
tG Stone
tH Stone

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.

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

## Turn 109

```text
Day 1, 13:39, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXX====t1XX..==..XX....
XXXXXXXXXX====......==t2t3t4..
DDXXXXXXXX====..======........
##t5########======........XXXX
t6############^^..............
######P1####t7@@......P2XX....
####tA######P3..............tB
####P4########================
##############====c1==========
############tC================
############==........tD......
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing up
t1 wildflowers
t2 wildflowers
t3 wildflowers
t4 wildflowers
t5 lamp post
t6 Astra's altar
P1 Nessa Quill
t7 handcart
t8 Flask of Oil — under t7
t9 Frost Wand — under t7
P2 Vigo
tA standing mirror
P3 Tobin
tB barrel
P4 Odette
c1 Lumi
tC Firstlight statue
tD trough

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.

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

> **face left**

## Turn 110

```text
Day 1, 13:39, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXX====t1XX..==..XX....
XXXXXXXXXX====......==t2t3t4..
DDXXXXXXXX====..======........
##t5########======........XXXX
t6############................
######P1####t7@@......P2XX....
####tA######P3..............tB
####P4########================
##############====c1==========
############tC================
############==........tD......
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing left (in front: t7)
t1 wildflowers
t2 wildflowers
t3 wildflowers
t4 wildflowers
t5 lamp post
t6 Astra's altar
P1 Nessa Quill
t7 handcart
t8 Flask of Oil — under t7
t9 Frost Wand — under t7
P2 Vigo
tA standing mirror
P3 Tobin
tB barrel
P4 Odette
c1 Lumi
tC Firstlight statue
tD trough

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.

Actions:
- primary: Punch handcart
- hands: Steal Flask of Oil
- take: Steal Flask of Oil
- put: —
- use: Punch Flask of Oil
- self: —
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down 2**

## Turn 111

```text
Day 1, 13:39, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
DDXXXXXXXX====..======........
##t1########======........XXXX
t2############................
######P1####t3........P2XX....
####t6######P3..............t7
####P4########@@==============
##############vv==c1==========
############t8================
############==........t9......
==............tA........tB....
==..tCtDtEtF....tG......TTtH..
Terrain: ## cobble, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing down
t1 lamp post
t2 Astra's altar
P1 Nessa Quill
t3 handcart
t4 Flask of Oil — under t3
t5 Frost Wand — under t3
P2 Vigo
t6 standing mirror
P3 Tobin
t7 barrel
P4 Odette
c1 Lumi
t8 Firstlight statue
t9 trough
tA wildflowers
tB Stone
tC carrot sprout
tD turnip sprout
tE tomato sprout
tF pumpkin sprout
tG Stone
tH Stone

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.

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

> **move left 1**

## Turn 112

```text
Day 1, 13:39, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXDDXXXXXXXX====..======......
####t1########======........XX
##t2############..............
########P1####t3........P2XX..
######t6######P3..............
######P4####<<@@==============
################====c1========
##############t7==============
##############==........t8....
====............t9........tA..
====..tBtCtDtE....tF......TTtG
Terrain: ## cobble, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
t1 lamp post
t2 Astra's altar
P1 Nessa Quill
t3 handcart
t4 Flask of Oil — under t3
t5 Frost Wand — under t3
P2 Vigo
t6 standing mirror
P3 Tobin
P4 Odette
c1 Lumi
t7 Firstlight statue
t8 trough
t9 wildflowers
tA Stone
tB carrot sprout
tC turnip sprout
tD tomato sprout
tE pumpkin sprout
tF Stone
tG Stone

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.

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

> **move right 1**

## Turn 113

```text
Day 1, 13:39, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
DDXXXXXXXX====..======........
##t1########======........XXXX
t2############................
######P1####t3........P2XX....
####t6######P3..............t7
####P4########@@>>============
##############====c1==========
############t8================
############==........t9......
==............tA........tB....
==..tCtDtEtF....tG......TTtH..
Terrain: ## cobble, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 lamp post
t2 Astra's altar
P1 Nessa Quill
t3 handcart
t4 Flask of Oil — under t3
t5 Frost Wand — under t3
P2 Vigo
t6 standing mirror
P3 Tobin
t7 barrel
P4 Odette
c1 Lumi
t8 Firstlight statue
t9 trough
tA wildflowers
tB Stone
tC carrot sprout
tD turnip sprout
tE tomato sprout
tF pumpkin sprout
tG Stone
tH Stone

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.

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

> **move left 1**

## Turn 114

```text
Day 1, 13:40, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXDDXXXXXXXX====..======......
####t1########======........XX
##t2############..............
########P1####t3........P2XX..
######t6######P3..............
######P4####<<@@==============
################====c1========
##############t7==============
##############==........t8....
====............t9........tA..
====..tBtCtDtE....tF......TTtG
Terrain: ## cobble, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
t1 lamp post
t2 Astra's altar
P1 Nessa Quill
t3 handcart
t4 Flask of Oil — under t3
t5 Frost Wand — under t3
P2 Vigo
t6 standing mirror
P3 Tobin
P4 Odette
c1 Lumi
t7 Firstlight statue
t8 trough
t9 wildflowers
tA Stone
tB carrot sprout
tC turnip sprout
tD tomato sprout
tE pumpkin sprout
tF Stone
tG Stone

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.

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

> **move right 1**

## Turn 115

```text
Day 1, 13:40, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
DDXXXXXXXX====..======........
##t1########======........XXXX
t2############................
######P1####t3........P2XX....
####t6######P3..............t7
####P4########@@>>============
##############====c1==========
############t8================
############==........t9......
==............tA........tB....
==..tCtDtEtF....tG......TTtH..
Terrain: ## cobble, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 lamp post
t2 Astra's altar
P1 Nessa Quill
t3 handcart
t4 Flask of Oil — under t3
t5 Frost Wand — under t3
P2 Vigo
t6 standing mirror
P3 Tobin
t7 barrel
P4 Odette
c1 Lumi
t8 Firstlight statue
t9 trough
tA wildflowers
tB Stone
tC carrot sprout
tD turnip sprout
tE tomato sprout
tF pumpkin sprout
tG Stone
tH Stone

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.

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

> **move left 1**

## Turn 116

```text
Day 1, 13:40, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXDDXXXXXXXX====..======......
####t1########======........XX
##t2############..............
########P1####t3........P2XX..
######t6######P3..............
######P4####<<@@==============
################====c1========
##############t7==============
##############==........t8....
====............t9........tA..
====..tBtCtDtE....tF......TTtG
Terrain: ## cobble, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
t1 lamp post
t2 Astra's altar
P1 Nessa Quill
t3 handcart
t4 Flask of Oil — under t3
t5 Frost Wand — under t3
P2 Vigo
t6 standing mirror
P3 Tobin
P4 Odette
c1 Lumi
t7 Firstlight statue
t8 trough
t9 wildflowers
tA Stone
tB carrot sprout
tC turnip sprout
tD tomato sprout
tE pumpkin sprout
tF Stone
tG Stone

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.

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

> **face up**

## Turn 117

```text
Day 1, 13:40, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXDDXXXXXXXX====..======......
####t1########======........XX
##t2############..............
########P1####t3........P2XX..
######t6######P3..............
######P4######@@==============
################====c1========
##############t7==============
##############==........t8....
====............t9........tA..
====..tBtCtDtE....tF......TTtG
Terrain: ## cobble, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up (in front: P3)
t1 lamp post
t2 Astra's altar
P1 Nessa Quill
t3 handcart
t4 Flask of Oil — under t3
t5 Frost Wand — under t3
P2 Vigo
t6 standing mirror
P3 Tobin
P4 Odette
c1 Lumi
t7 Firstlight statue
t8 trough
t9 wildflowers
tA Stone
tB carrot sprout
tC turnip sprout
tD tomato sprout
tE pumpkin sprout
tF Stone
tG Stone

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.

Actions:
- primary: Punch Tobin
- hands: Talk to Tobin
- take: —
- put: —
- use: Punch Tobin
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands**

## Turn 118

```text
Day 1, 13:40, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXDDXXXXXXXX====..======......
####t1########======........XX
##t2############..............
########P1####t3........P2XX..
######t6######P3..............
######P4######@@==============
################====c1========
##############t7==============
##############==........t8....
====............t9........tA..
====..tBtCtDtE....tF......TTtG
Terrain: ## cobble, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up (in front: P3)
t1 lamp post
t2 Astra's altar
P1 Nessa Quill
t3 handcart
t4 Flask of Oil — under t3
t5 Frost Wand — under t3
P2 Vigo
t6 standing mirror
P3 Tobin
P4 Odette
c1 Lumi
t7 Firstlight statue
t8 trough
t9 wildflowers
tA Stone
tB carrot sprout
tC turnip sprout
tD tomato sprout
tE pumpkin sprout
tF Stone
tG Stone

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- Tobin: "Go on, take the wand off the cart. A deal is a deal, and that bread was a very good deal."

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.

Talk with Tobin (neutral):
1. What news?
2. Let's talk a while.
3. I have something for you.
4. Let's trade.
5. Come with me.
6. Your money or your life.
7. (Slip a hand into their pocket.)
8. There are no gods watching, you know.
9. Goodbye.

Actions:
- The panel is open (time stands): talk <1–9>
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **talk 4**

## Turn 119

```text
Day 1, 13:40, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXDDXXXXXXXX====..======......
####t1########======........XX
##t2############..............
########P1####t3........P2XX..
######t6######P3..............
######P4######@@==============
################====c1========
##############t7==============
##############==........t8....
====............t9........tA..
====..tBtCtDtE....tF......TTtG
Terrain: ## cobble, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up (in front: P3)
t1 lamp post
t2 Astra's altar
P1 Nessa Quill
t3 handcart
t4 Flask of Oil — under t3
t5 Frost Wand — under t3
P2 Vigo
t6 standing mirror
P3 Tobin
P4 Odette
c1 Lumi
t7 Firstlight statue
t8 trough
t9 wildflowers
tA Stone
tB carrot sprout
tC turnip sprout
tD tomato sprout
tE pumpkin sprout
tF Stone
tG Stone

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- Tobin: "Have a look."

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.

Trade with Tobin (open):
1. Close.

Actions:
- The panel is open (time stands): talk <1–1>
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **talk 1**

## Turn 120

```text
Day 1, 13:40, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXDDXXXXXXXX====..======......
####t1########======........XX
##t2############..............
########P1####t3........P2XX..
######t6######P3..............
######P4######@@==============
################====c1========
##############t7==============
##############==........t8....
====............t9........tA..
====..tBtCtDtE....tF......TTtG
Terrain: ## cobble, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up (in front: P3)
t1 lamp post
t2 Astra's altar
P1 Nessa Quill
t3 handcart
t4 Flask of Oil — under t3
t5 Frost Wand — under t3
P2 Vigo
t6 standing mirror
P3 Tobin
P4 Odette
c1 Lumi
t7 Firstlight statue
t8 trough
t9 wildflowers
tA Stone
tB carrot sprout
tC turnip sprout
tD tomato sprout
tE pumpkin sprout
tF Stone
tG Stone

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.

Actions:
- primary: Punch Tobin
- hands: Talk to Tobin
- take: —
- put: —
- use: Punch Tobin
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right 1**

## Turn 121

```text
Day 1, 13:40, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
DDXXXXXXXX====..======........
##t1########======........XXXX
t2############................
######P1####t3........P2XX....
####t6######P3..............t7
####P4########@@>>============
##############====c1==========
############t8================
############==........t9......
==............tA........tB....
==..tCtDtEtF....tG......TTtH..
Terrain: ## cobble, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 lamp post
t2 Astra's altar
P1 Nessa Quill
t3 handcart
t4 Flask of Oil — under t3
t5 Frost Wand — under t3
P2 Vigo
t6 standing mirror
P3 Tobin
t7 barrel
P4 Odette
c1 Lumi
t8 Firstlight statue
t9 trough
tA wildflowers
tB Stone
tC carrot sprout
tD turnip sprout
tE tomato sprout
tF pumpkin sprout
tG Stone
tH Stone

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.

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

## Turn 122

```text
Day 1, 13:41, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXX====t1XX..==..XX....
XXXXXXXXXX====......==t2t3t4..
DDXXXXXXXX====..======........
##t5########======........XXXX
t6############^^..............
######P1####t7@@......P2XX....
####tA####P3##..............tB
####P4########================
##############====c1==========
############tC================
############==........tD......
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing up
t1 wildflowers
t2 wildflowers
t3 wildflowers
t4 wildflowers
t5 lamp post
t6 Astra's altar
P1 Nessa Quill
t7 handcart
t8 Flask of Oil — under t7
t9 Frost Wand — under t7
P2 Vigo
tA standing mirror
P3 Tobin
tB barrel
P4 Odette
c1 Lumi
tC Firstlight statue
tD trough

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.

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

> **face left**

## Turn 123

```text
Day 1, 13:41, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXX====t1XX..==..XX....
XXXXXXXXXX====......==t2t3t4..
DDXXXXXXXX====..======........
##t5########======........XXXX
t6############................
######P1####t7@@......P2XX....
####tA####P3##..............tB
####P4########================
##############====c1==========
############tC================
############==........tD......
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing left (in front: t7)
t1 wildflowers
t2 wildflowers
t3 wildflowers
t4 wildflowers
t5 lamp post
t6 Astra's altar
P1 Nessa Quill
t7 handcart
t8 Flask of Oil — under t7
t9 Frost Wand — under t7
P2 Vigo
tA standing mirror
P3 Tobin
tB barrel
P4 Odette
c1 Lumi
tC Firstlight statue
tD trough

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.

Actions:
- primary: Punch handcart
- hands: Steal Flask of Oil
- take: Steal Flask of Oil
- put: —
- use: Punch Flask of Oil
- self: —
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **look**

## Turn 124

```text
Day 1, 13:41, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXX====t1XX..==..XX....
XXXXXXXXXX====......==t2t3t4..
DDXXXXXXXX====..======........
##t5########======........XXXX
t6############................
######P1####t7@@......P2XX....
####tA####P3##..............tB
####P4########================
##############====c1==========
############tC================
############==........tD......
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing left (in front: t7)
t1 wildflowers
t2 wildflowers
t3 wildflowers
t4 wildflowers
t5 lamp post
t6 Astra's altar
P1 Nessa Quill
t7 handcart
t8 Flask of Oil — under t7
t9 Frost Wand — under t7
P2 Vigo
tA standing mirror
P3 Tobin
tB barrel
P4 Odette
c1 Lumi
tC Firstlight statue
tD trough

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.

Actions:
- primary: Punch handcart
- hands: Steal Flask of Oil
- take: Steal Flask of Oil
- put: —
- use: Punch Flask of Oil
- self: —
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up 1** · Note: «Try approaching the cart from the north to see if a different item is targetable.»

## Turn 125

```text
Day 1, 13:41, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXX====XXXXXXDDXXXXXXXX
XXXXXXXXXX====t1XX..==..XX....
XXXXXXXXXX====......==t2t3t4..
DDXXXXXXXX====..======........
##t5########==^^==........XXXX
t6############@@..............
######P1####t7........P2XX....
####tA####P3##..............tB
####P4########==c1============
##############================
############tC================
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing up
t1 wildflowers
t2 wildflowers
t3 wildflowers
t4 wildflowers
t5 lamp post
t6 Astra's altar
P1 Nessa Quill
t7 handcart
t8 Flask of Oil — under t7
t9 Frost Wand — under t7
P2 Vigo
tA standing mirror
P3 Tobin
tB barrel
P4 Odette
c1 Lumi
tC Firstlight statue

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.

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

> **move left 1**

## Turn 126

```text
Day 1, 13:41, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXXXX====XXXXXXDDXXXXXX
XXXXXXXXXXXX====t1XX..==..XX..
XXXXXXXXXXXX====......==t2t3t4
XXDDXXXXXXXX====..======......
####t5########======........XX
##t6########<<@@..............
########P1####t7........P2XX..
######tA####P3##..............
######P4########==c1==========
################==============
##############tB==============
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing left
t1 wildflowers
t2 wildflowers
t3 wildflowers
t4 wildflowers
t5 lamp post
t6 Astra's altar
P1 Nessa Quill
t7 handcart
t8 Flask of Oil — under t7
t9 Frost Wand — under t7
P2 Vigo
tA standing mirror
P3 Tobin
P4 Odette
c1 Lumi
tB Firstlight statue

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **face down**

## Turn 127

```text
Day 1, 13:41, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXXXX====XXXXXXDDXXXXXX
XXXXXXXXXXXX====t1XX..==..XX..
XXXXXXXXXXXX====......==t2t3t4
XXDDXXXXXXXX====..======......
####t5########======........XX
##t6##########@@..............
########P1####t7........P2XX..
######tA####P3##..............
######P4########==c1==========
################==============
##############tB==============
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing down (in front: t7)
t1 wildflowers
t2 wildflowers
t3 wildflowers
t4 wildflowers
t5 lamp post
t6 Astra's altar
P1 Nessa Quill
t7 handcart
t8 Flask of Oil — under t7
t9 Frost Wand — under t7
P2 Vigo
tA standing mirror
P3 Tobin
P4 Odette
c1 Lumi
tB Firstlight statue

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.

Actions:
- primary: Punch handcart
- hands: Steal Flask of Oil
- take: Steal Flask of Oil
- put: —
- use: Punch Flask of Oil
- self: —
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down 1** · Note: «Can't target the wand under the flask; blocked by cart. I'll ask Tobin directly.»

## Turn 128

```text
Day 1, 13:41, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXXXX====XXXXXXDDXXXXXX
XXXXXXXXXXXX====t1XX..==..XX..
XXXXXXXXXXXX====......==t2t3t4
XXDDXXXXXXXX====..======......
####t5########======........XX
##t6##########@@..............
########P1####t7........P2XX..
######tA####P3##..............
######P4########==c1==========
################==============
##############tB==============
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing down (in front: t7)
t1 wildflowers
t2 wildflowers
t3 wildflowers
t4 wildflowers
t5 lamp post
t6 Astra's altar
P1 Nessa Quill
t7 handcart
t8 Flask of Oil — under t7
t9 Frost Wand — under t7
P2 Vigo
tA standing mirror
P3 Tobin
P4 Odette
c1 Lumi
tB Firstlight statue

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.

Actions:
- primary: Punch handcart
- hands: Steal Flask of Oil
- take: Steal Flask of Oil
- put: —
- use: Punch Flask of Oil
- self: —
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **take** · Note: «Taking the flask to uncover the wand; will put the flask back on the cart afterward.»

## Turn 129

```text
Day 1, 13:41, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXXXX====XXXXXXDDXXXXXX
XXXXXXXXXXXX====t1XX..==..XX..
XXXXXXXXXXXX====......==t2t3t4
XXDDXXXXXXXX====..======......
####t5########======........XX
##t6##########@@..............
########P1####t7........P2XX..
######tA####P3##..............
######P4########==c1==========
################==============
##############tB==============
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing down (in front: t7)
t1 wildflowers
t2 wildflowers
t3 wildflowers
t4 wildflowers
t5 lamp post
t6 Astra's altar
P1 Nessa Quill
t7 handcart
t8 Flask of Oil — under t7
t9 Frost Wand — under t7
P2 Vigo
tA standing mirror
P3 Tobin
P4 Odette
c1 Lumi
tB Firstlight statue

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.

Actions:
- Question: Steal Flask of Oil? — answer yes · answer no
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **answer no** · Note: «Won't steal. I'll talk to Tobin again and ask about the wand instead.»

## Turn 130

```text
Day 1, 13:42, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXXXX====XXXXXXDDXXXXXX
XXXXXXXXXXXX====t1XX..==..XX..
XXXXXXXXXXXX====......==t2t3t4
XXDDXXXXXXXX====..======......
####t5########======........XX
##t6##########@@..............
########P1####t7........P2XX..
######tA####P3##..............
######P4########==c1==========
################==============
##############tB==============
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing down (in front: t7)
t1 wildflowers
t2 wildflowers
t3 wildflowers
t4 wildflowers
t5 lamp post
t6 Astra's altar
P1 Nessa Quill
t7 handcart
t8 Flask of Oil — under t7
t9 Frost Wand — under t7
P2 Vigo
tA standing mirror
P3 Tobin
P4 Odette
c1 Lumi
tB Firstlight statue

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.

Actions:
- primary: Punch handcart
- hands: Steal Flask of Oil
- take: Steal Flask of Oil
- put: —
- use: Punch Flask of Oil
- self: —
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right 1** · Journal: «13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.»

## Turn 131

```text
Day 1, 13:42, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXX====XXXXXXDDXXXXXXXX
XXXXXXXXXX====t1XX..==..XX....
XXXXXXXXXX====......==t2t3t4..
DDXXXXXXXX====..======........
##t5########======........XXXX
t6############@@>>............
######P1####t7........P2XX....
####tA####P3##..............tB
####P4########==c1============
##############================
############tC================
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing right
t1 wildflowers
t2 wildflowers
t3 wildflowers
t4 wildflowers
t5 lamp post
t6 Astra's altar
P1 Nessa Quill
t7 handcart
t8 Flask of Oil — under t7
t9 Frost Wand — under t7
P2 Vigo
tA standing mirror
P3 Tobin
tB barrel
P4 Odette
c1 Lumi
tC Firstlight statue

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.

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

> **move left 2**

## Turn 132

```text
Day 1, 13:42, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
..XXXXXXXXXXXX====XXXXXXDDXXXX
..XXXXXXXXXXXX====t1XX..==..XX
..XXXXXXXXXXXX====......==t2t3
t4XXDDXXXXXXXX====..======....
######t5########======........
####t6######<<@@##............
##########P1####t7........P2XX
P3######tA####P4##............
tB######P5########==c1========
##################============
################tC============
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing left
t1 wildflowers
t2 wildflowers
t3 wildflowers
t4 sign
t5 lamp post
t6 Astra's altar
P1 Nessa Quill
t7 handcart
t8 Flask of Oil — under t7
t9 Frost Wand — under t7
P2 Vigo
P3 Sister Ilse
tA standing mirror
P4 Tobin
tB campfire
P5 Odette
c1 Lumi
tC Firstlight statue

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.

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

> **move left 3**

## Turn 133

```text
Day 1, 13:43, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
........XXXXXXXXXXXX====XXXXXX
........XXXXXXXXXXXX====t1XX..
........XXXXXXXXXXXX====......
......t2XXDDXXXXXXXX====..====
t3t4########t5########======..
####t6####t7<<@@####c1##......
################P1####t8......
##tB##P2######tC####P3##......
######tD######P4########======
##P5P6##################======
##tE##################tF======
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing left
t1 wildflowers
t2 sign
t3 notice board
t4 commission board
t5 lamp post
t6 well
t7 Astra's altar
c1 Lumi
P1 Nessa Quill
t8 handcart
t9 Flask of Oil — under t8
tA Frost Wand — under t8
tB chalk drawing of a grey man
P2 Sister Ilse
tC standing mirror
P3 Tobin
tD campfire
P4 Odette
P5 Fennick
P6 Marta
tE log bench
tF Firstlight statue

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.

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

> **move left 6** · Journal: «13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.»

## Turn 134

```text
Day 1, 13:43, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XX........XXXXXXXXXXXX====XXXX
P1........XXXXXXXXXXXX====t1XX
..........XXXXXXXXXXXX====....
........t2XXDDXXXXXXXX====..==
##t3t4########t5########======
P2####t6####t7@@####c1####....
##################P3####t8....
####tB##P4######tC####P5##....
########tD######P6########====
####P7P8##################====
####tE##################tF====
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing left (in front: t7)
P1 Rowan
t1 wildflowers
t2 sign
t3 notice board
t4 commission board
t5 lamp post
P2 Pell
t6 well
t7 Astra's altar
c1 Lumi
P3 Nessa Quill
t8 handcart
t9 Flask of Oil — under t8
tA Frost Wand — under t8
tB chalk drawing of a grey man
P4 Sister Ilse
tC standing mirror
P5 Tobin
tD campfire
P6 Odette
P7 Fennick
P8 Marta
tE log bench
tF Firstlight statue

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.

Actions:
- primary: Punch Astra's altar
- hands: Pray at Astra's altar
- take: —
- put: —
- use: Punch Astra's altar
- self: —
- move: up blocked · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down 1**

## Turn 135

```text
Day 1, 13:43, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
P1........XXXXXXXXXXXX====t1XX
..........XXXXXXXXXXXX====....
........t2XXDDXXXXXXXX====..==
##t3t4########t5########======
P2####t6####t7######c1####....
##############@@##P3####t8....
####tB####P4##vvtC####P5##....
########tD######P6########====
####P7P8##################====
####tE##################tF====
########################==....
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing down
P1 Rowan
t1 wildflowers
t2 sign
t3 notice board
t4 commission board
t5 lamp post
P2 Pell
t6 well
t7 Astra's altar
c1 Lumi
P3 Nessa Quill
t8 handcart
t9 Flask of Oil — under t8
tA Frost Wand — under t8
tB chalk drawing of a grey man
P4 Sister Ilse
tC standing mirror
P5 Tobin
tD campfire
P6 Odette
P7 Fennick
P8 Marta
tE log bench
tF Firstlight statue

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.

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

> **move left 3**

## Turn 136

```text
Day 1, 13:44, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
....==P1........XXXXXXXXXXXX==
==..==..........XXXXXXXXXXXX==
======........t1XXDDXXXXXXXX==
..t2==##t3t4########t5########
....P2P3####t6####t7##########
....########<<@@####c1##P4##P5
....######t8####P6####t9######
====##########tA######P7######
====######P8P9################
====######tB##################
..~~==########################
Terrain: ## cobble, .. grass, == path, DD door, XX wall, ~~ water
@@ You — facing left
P1 Rowan
t1 sign
t2 loom
t3 notice board
t4 commission board
t5 lamp post
P2 Cass
P3 Pell
t6 well
t7 Astra's altar
c1 Lumi
P4 Nessa Quill
P5 Tobin
t8 chalk drawing of a grey man
P6 Sister Ilse
t9 standing mirror
tA campfire
P7 Odette
P8 Fennick
P9 Marta
tB log bench

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.

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

> **move up 5**

## Turn 137

```text
Day 1, 13:44, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXXXXXX..XXXXXXXXXXXX==
..XXDDXX........XXXXXXXXXXXX==
....==P1........XXXXXXXXXXXX==
==..==..........XXXXXXXXXXXX==
======........t1XXDDXXXXXXXX==
..t2==##t3t4##@@####t5########
....P2P3####t6####t7##########
....################c1##P4##P5
....######t8####P6####t9######
====##########tA######P7######
====######P8P9################
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing up (in front: t1)
P1 Rowan
t1 sign
t2 loom
t3 notice board
t4 commission board
t5 lamp post
P2 Cass
P3 Pell
t6 well
t7 Astra's altar
c1 Lumi
P4 Nessa Quill
P5 Tobin
t8 chalk drawing of a grey man
P6 Sister Ilse
t9 standing mirror
tA campfire
P7 Odette
P8 Fennick
P9 Marta

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.

Actions:
- primary: Punch sign
- hands: Read sign
- take: —
- put: —
- use: Punch sign
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands**

## Turn 138

```text
Day 1, 13:44, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXXXXXX..XXXXXXXXXXXX==
..XXDDXX........XXXXXXXXXXXX==
....==P1........XXXXXXXXXXXX==
==..==..........XXXXXXXXXXXX==
======........t1XXDDXXXXXXXX==
..t2==##t3t4##@@####t5########
....P2P3####t6####t7##########
....################c1##P4##P5
....######t8####P6####t9######
====##########tA######P7######
====######P8P9################
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing up (in front: t1)
P1 Rowan
t1 sign
t2 loom
t3 notice board
t4 commission board
t5 lamp post
P2 Cass
P3 Pell
t6 well
t7 Astra's altar
c1 Lumi
P4 Nessa Quill
P5 Tobin
t8 chalk drawing of a grey man
P6 Sister Ilse
t9 standing mirror
tA campfire
P7 Odette
P8 Fennick
P9 Marta

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- sign: "FIRSTLIGHT CHAPEL. The flame and Astra's altar, kept by Sister Ilse. Skill books at the bookstand within; ask Brother Anselm."

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.

Actions:
- primary: Punch sign
- hands: Read sign
- take: —
- put: —
- use: Punch sign
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left 1** · Journal: «13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.»

## Turn 139

```text
Day 1, 13:44, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXXXXXXXX..XXXXXXXXXXXX
....XXDDXX........XXXXXXXXXXXX
......==P1........XXXXXXXXXXXX
====..==..........XXXXXXXXXXXX
..======........t1XXDDXXXXXXXX
t2..t3==##t4t5@@######t6######
......P2P3####t7####c1########
......####################P4##
......######t9####P5####tA####
======##########tB######P6####
======######P7P8##############
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing left (in front: t5)
P1 Rowan
t1 sign
t2 firewood
t3 loom
t4 notice board
t5 commission board
t6 lamp post
P2 Cass
P3 Pell
t7 well
c1 Lumi
t8 Astra's altar — under c1
P4 Nessa Quill
t9 chalk drawing of a grey man
P5 Sister Ilse
tA standing mirror
tB campfire
P6 Odette
P7 Fennick
P8 Marta

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.

Actions:
- primary: Punch commission board
- hands: Look at commission board
- take: —
- put: —
- use: Punch commission board
- self: —
- move: up walkable · down blocked · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands**

## Turn 140

```text
Day 1, 13:45, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXXXXXXXXXXXX..XXXXXXXXXXXX
....XXDDXX........XXXXXXXXXXXX
......==P1........XXXXXXXXXXXX
====..==..........XXXXXXXXXXXX
..======........t1XXDDXXXXXXXX
t2..t3==##t4t5@@######t6######
......P2P3####t7####c1########
......####################P4##
......######t9####P5####tA####
======##########tB######P6####
======######P7P8##############
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing left (in front: t5)
P1 Rowan
t1 sign
t2 firewood
t3 loom
t4 notice board
t5 commission board
t6 lamp post
P2 Cass
P3 Pell
t7 well
c1 Lumi
t8 Astra's altar — under c1
P4 Nessa Quill
t9 chalk drawing of a grey man
P5 Sister Ilse
tA standing mirror
tB campfire
P6 Odette
P7 Fennick
P8 Marta

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.

Actions:
- primary: Punch commission board
- hands: Look at commission board
- take: —
- put: —
- use: Punch commission board
- self: —
- move: up walkable · down blocked · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up 3**

## Turn 141

```text
Day 1, 13:45, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
..............................
XXXXXXXXXXXXXXXX..............
XXXXXXXXXXXXXXXX..XXXXXXXXXXXX
XXXXXXXXXXXXXXXX..XXXXXXXXXXXX
....XXDDXX....^^..XXXXXXXXXXXX
......==P1....@@..XXXXXXXXXXXX
====..==..........XXXXXXXXXXXX
..======........t1XXDDXXXXXXXX
t2..t3==##t4t5####c1##t6######
....P2##P3####t7####t8########
......####################P4##
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing up
P1 Rowan
t1 sign
t2 firewood
t3 loom
t4 notice board
t5 commission board
c1 Lumi
t6 lamp post
P2 Cass
P3 Pell
t7 well
t8 Astra's altar
P4 Nessa Quill

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.

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

> **move left 2**

## Turn 142

```text
Day 1, 13:45, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
..............................
....XXXXXXXXXXXXXXXX..........
....XXXXXXXXXXXXXXXX..XXXXXXXX
XX..XXXXXXXXXXXXXXXX..XXXXXXXX
........XXDDXX........XXXXXXXX
..........==P1@@......XXXXXXXX
========..==..........XXXXXXXX
......======........c1XXDDXXXX
....t2..t3==P2t4t5########t6##
t7......P3########t8####t9####
..tA......####################
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing left (in front: P1)
P1 Rowan
c1 Lumi
t1 sign — under c1
t2 firewood
t3 loom
P2 Pell
t4 notice board
t5 commission board
t6 lamp post
t7 workbench
P3 Cass
t8 well
t9 Astra's altar
tA wood pile — open

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.

Actions:
- primary: Punch Rowan
- hands: Talk to Rowan
- take: —
- put: —
- use: Punch Rowan
- self: —
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands**

## Turn 143

```text
Day 1, 13:45, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
..............................
....XXXXXXXXXXXXXXXX..........
....XXXXXXXXXXXXXXXX..XXXXXXXX
XX..XXXXXXXXXXXXXXXX..XXXXXXXX
........XXDDXX........XXXXXXXX
..........==P1@@......XXXXXXXX
========..==..........XXXXXXXX
......======........c1XXDDXXXX
....t2..t3==P2t4t5########t6##
t7......P3########t8####t9####
..tA......####################
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing left (in front: P1)
P1 Rowan
c1 Lumi
t1 sign — under c1
t2 firewood
t3 loom
P2 Pell
t4 notice board
t5 commission board
t6 lamp post
t7 workbench
P3 Cass
t8 well
t9 Astra's altar
tA wood pile — open

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- Rowan: "The barrow is to the south, in Thornwood Hollow, between two standing stones. Lina and Oskar — I'm counting on you."

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.

Talk with Rowan (neutral):
1. What news?
2. Let's talk a while.
3. I have something for you.
4. Let's trade.
5. Come with me.
6. Your money or your life.
7. (Slip a hand into their pocket.)
8. There are no gods watching, you know.
9. Goodbye.

Actions:
- The panel is open (time stands): talk <1–9>
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **talk 1**

## Turn 144

```text
Day 1, 13:45, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
..............................
....XXXXXXXXXXXXXXXX..........
....XXXXXXXXXXXXXXXX..XXXXXXXX
XX..XXXXXXXXXXXXXXXX..XXXXXXXX
........XXDDXX........XXXXXXXX
..........==P1@@......XXXXXXXX
========..==..........XXXXXXXX
......======........c1XXDDXXXX
....t2..t3==P2t4t5########t6##
t7......P3########t8####t9####
..tA......####################
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing left (in front: P1)
P1 Rowan
c1 Lumi
t1 sign — under c1
t2 firewood
t3 loom
P2 Pell
t4 notice board
t5 commission board
t6 lamp post
t7 workbench
P3 Cass
t8 well
t9 Astra's altar
tA wood pile — open

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- Rowan: "Nothing much has happened. Quiet days."

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.

Talk with Rowan (neutral):
1. What news?
2. Let's talk a while.
3. I have something for you.
4. Let's trade.
5. Come with me.
6. Your money or your life.
7. (Slip a hand into their pocket.)
8. There are no gods watching, you know.
9. Goodbye.

Actions:
- The panel is open (time stands): talk <1–9>
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **talk 9** · Journal: «13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).»

## Turn 145

```text
Day 1, 13:46, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
..............................
....XXXXXXXXXXXXXXXX..........
....XXXXXXXXXXXXXXXX..XXXXXXXX
XX..XXXXXXXXXXXXXXXX..XXXXXXXX
........XXDDXX........XXXXXXXX
..........==P1@@......XXXXXXXX
========..==..........XXXXXXXX
......======........c1XXDDXXXX
....t2..t3==P2t4t5########t6##
t7......P3########t8####t9####
..tA......####################
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing left (in front: P1)
P1 Rowan
c1 Lumi
t1 sign — under c1
t2 firewood
t3 loom
P2 Pell
t4 notice board
t5 commission board
t6 lamp post
t7 workbench
P3 Cass
t8 well
t9 Astra's altar
tA wood pile — open

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).

Actions:
- primary: Punch Rowan
- hands: Talk to Rowan
- take: —
- put: —
- use: Punch Rowan
- self: —
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down 2**

## Turn 146

```text
Day 1, 13:46, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
....XXXXXXXXXXXXXXXX..XXXXXXXX
XX..XXXXXXXXXXXXXXXX..XXXXXXXX
........XXDDXX........XXXXXXXX
..........==..........XXXXXXXX
========..==P1........XXXXXXXX
......======..@@....c1XXDDXXXX
....t2..t3==P2t4t5########t6##
t7......P3########t8####t9####
..tA......####################
tBtC......######tD####P4####tE
==P5======##########tF######P6
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing down (in front: t4)
P1 Rowan
c1 Lumi
t1 sign — under c1
t2 firewood
t3 loom
P2 Pell
t4 notice board
t5 commission board
t6 lamp post
t7 workbench
P3 Cass
t8 well
t9 Astra's altar
tA wood pile — open
tB lamp post
tC wildflowers
tD chalk drawing of a grey man
P4 Sister Ilse
tE standing mirror
P5 Gus
tF campfire
P6 Odette

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).

Actions:
- primary: Punch notice board
- hands: Read notice board
- take: —
- put: —
- use: Punch notice board
- self: —
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands**

## Turn 147

```text
Day 1, 13:46, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
....XXXXXXXXXXXXXXXX..XXXXXXXX
XX..XXXXXXXXXXXXXXXX..XXXXXXXX
........XXDDXX........XXXXXXXX
..........==..........XXXXXXXX
========..==P1........XXXXXXXX
......======..@@....c1XXDDXXXX
....t2..t3==P2t4t5########t6##
t7......P3########t8####t9####
..tA......####################
tBtC......######tD####P4####tE
==P5======##########tF######P6
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing down (in front: t4)
P1 Rowan
c1 Lumi
t1 sign — under c1
t2 firewood
t3 loom
P2 Pell
t4 notice board
t5 commission board
t6 lamp post
t7 workbench
P3 Cass
t8 well
t9 Astra's altar
tA wood pile — open
tB lamp post
tC wildflowers
tD chalk drawing of a grey man
P4 Sister Ilse
tE standing mirror
P5 Gus
tF campfire
P6 Odette

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- notice board: "FIRSTLIGHT VILLAGE. East: Vesper Ford. West: Millbrook. North: Dawn Hill. South: Dusklea, and Hushwood beyond."

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).

Actions:
- primary: Punch notice board
- hands: Read notice board
- take: —
- put: —
- use: Punch notice board
- self: —
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left 2** · Journal: «13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.»

## Turn 148

```text
Day 1, 13:46, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XX......XXXXXXXXXXXXXXXX..XXXX
XXXXXX..XXXXXXXXXXXXXXXX..XXXX
............XXDDXX........XXXX
t1............==..........XXXX
============..==P1........XXXX
t2........==<<@@....c1..t3XXDD
..t4....t5..t6==P2t7t8########
....t9......P3########tA####tB
XXXX..tC......################
....tDtE......######tF####P4##
======P5======##########tG####
Terrain: ## cobble, .. grass, == path, DD door, XX wall
@@ You — facing left
t1 wildflowers
P1 Rowan
t2 wildflowers
c1 Lumi
t3 sign
t4 stump
t5 firewood
t6 loom
P2 Pell
t7 notice board
t8 commission board
t9 workbench
P3 Cass
tA well
tB Astra's altar
tC wood pile — open
tD lamp post
tE wildflowers
tF chalk drawing of a grey man
P4 Sister Ilse
P5 Gus
tG campfire

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.

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

> **move down 5**

## Turn 149

```text
Day 1, 13:47, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
t1........======........t2XXDD
..t3....t4..t5==P1t6t7########
....t8......P2##c1####t9####tA
XXXX..tB......################
....tCtD......######tE####P3##
======P4======@@########tF####
==============vv####P5P6######
==tGP7========######tH########
hh..........~~==##############
hh........~~~~~~........======
hh......~~~~~~~~~~P8....======
Terrain: ## cobble, .. grass, == path, DD door, XX wall, hh spring, ~~ water
@@ You — facing down
t1 wildflowers
t2 sign
t3 stump
t4 firewood
t5 loom
P1 Pell
t6 notice board
t7 commission board
t8 workbench
P2 Cass
c1 Lumi
t9 well
tA Astra's altar
tB wood pile — open
tC lamp post
tD wildflowers
tE chalk drawing of a grey man
P3 Sister Ilse
P4 Gus
tF campfire
P5 Fennick
P6 Marta
tG sign
P7 Joss
tH log bench
P8 Mia

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.

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

## Turn 150

```text
Day 1, 13:48, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XXXX..t1......################
....t2t3......######t4####P1##
======P2======c1########t5####
==============####P3##P4######
==t6P5========######t7########
hh..........~~@@##############
hh........~~~~vv..P6....======
hh......~~~~~~~~~~......======
........~~~~~~~~~~......======
..........t8............======
....t9....**............======
Terrain: ## cobble, ** flowers, .. grass, == path, XX wall, hh spring, ~~ water
@@ You — facing down
t1 wood pile — open
t2 lamp post
t3 wildflowers
t4 chalk drawing of a grey man
P1 Sister Ilse
P2 Gus
c1 Lumi
t5 campfire
P3 Fennick
P4 Marta
t6 sign
P5 Joss
t7 log bench
P6 Mia
t8 wildflowers
t9 grass tuft

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- New guide: The First Cast
- Lumi: "Look, a pond! Something just jumped. Make a rod from two sticks and two tufts of grass; you can do it by hand ({key:craft}). Then stand on the bank, hold it and left click the water."
- Quest guide_fish → stage 10

Journal:
- The First Cast (guide_fish): active, stage 10 — There is a pond in the village. Lumi wants me to try fishing.
  · Get a fishing rod ({key:craft}: two sticks and two tufts of grass; or the general store) (open)
  · Catch a fish in the pond (hold the rod, left click the water) (open)
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down blocked · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move right 1** · Journal: «13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.»

## Turn 151

```text
Day 1, 13:48, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XX..t1......##################
..t2t3......######t4####P1####
====P2======c1########t5######
============####P3##P4########
t6P5========######t7##########
..........~~==@@>>############
........~~~~~~..P6....======..
......~~~~~~~~~~......======..
......~~~~~~~~~~......======..
........t8............======..
..t9....**............======..
Terrain: ## cobble, ** flowers, .. grass, == path, XX wall, ~~ water
@@ You — facing right
t1 wood pile — open
t2 lamp post
t3 wildflowers
t4 chalk drawing of a grey man
P1 Sister Ilse
P2 Gus
c1 Lumi
t5 campfire
P3 Fennick
P4 Marta
t6 sign
P5 Joss
t7 log bench
P6 Mia
t8 wildflowers
t9 grass tuft

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- The First Cast (guide_fish): active, stage 10 — There is a pond in the village. Lumi wants me to try fishing.
  · Get a fishing rod ({key:craft}: two sticks and two tufts of grass; or the general store) (open)
  · Catch a fish in the pond (hold the rod, left click the water) (open)
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.
- 13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.

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

> **move down 5**

## Turn 152

```text
Day 1, 13:48, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
..t1t2......######t3####P1####
====P2======##########t4######
============##c1P3##P4########
t5P5========######t6##########
..........~~==################
........~~~~~~@@P6....======..
......~~~~~~~~vv......======..
......~~~~~~~~~~......======..
........t7............======..
..t8....**............======..
........**............======..
Terrain: ## cobble, ** flowers, .. grass, == path, ~~ water
@@ You — facing down
t1 lamp post
t2 wildflowers
t3 chalk drawing of a grey man
P1 Sister Ilse
P2 Gus
t4 campfire
c1 Lumi
P3 Fennick
P4 Marta
t5 sign
P5 Joss
t6 log bench
P6 Mia
t7 wildflowers
t8 grass tuft

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- The First Cast (guide_fish): active, stage 10 — There is a pond in the village. Lumi wants me to try fishing.
  · Get a fishing rod ({key:craft}: two sticks and two tufts of grass; or the general store) (open)
  · Catch a fish in the pond (hold the rod, left click the water) (open)
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.
- 13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down blocked · left blocked · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move up 1**

## Turn 153

```text
Day 1, 13:49, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
XX..t1......##################
..t2t3......######t4####P1####
====P2======##########t5######
============##c1P3##P4########
t6P5========##^^##t7##########
..........~~==@@##############
........~~~~~~..P6....======..
......~~~~~~~~~~......======..
......~~~~~~~~~~......======..
........t8............======..
..t9....**............======..
Terrain: ## cobble, ** flowers, .. grass, == path, XX wall, ~~ water
@@ You — facing up
t1 wood pile — open
t2 lamp post
t3 wildflowers
t4 chalk drawing of a grey man
P1 Sister Ilse
P2 Gus
t5 campfire
c1 Lumi
P3 Fennick
P4 Marta
t6 sign
P5 Joss
t7 log bench
P6 Mia
t8 wildflowers
t9 grass tuft

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- The First Cast (guide_fish): active, stage 10 — There is a pond in the village. Lumi wants me to try fishing.
  · Get a fishing rod ({key:craft}: two sticks and two tufts of grass; or the general store) (open)
  · Catch a fish in the pond (hold the rod, left click the water) (open)
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.
- 13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.

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

> **move right 3**

## Turn 154

```text
Day 1, 13:49, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
......##################P1####
......######t1####P2####t2####
======##########t3######P3####
======##c1P4##P5##############
======######t4################
....~~==######@@>>############
..~~~~~~..P6....======........
~~~~~~~~~~......======..t5t6t7
~~~~~~~~~~......======..t8t9tA
..tB............======..tCtDtE
..**............======..mmmmmm
Terrain: ## cobble, ** flowers, .. grass, == path, mm farmland, ~~ water
@@ You — facing right
P1 Nessa Quill
t1 chalk drawing of a grey man
P2 Sister Ilse
t2 standing mirror
t3 campfire
P3 Odette
c1 Lumi
P4 Fennick
P5 Marta
t4 log bench
P6 Mia
t5 carrot sprout
t6 turnip sprout
t7 tomato sprout
t8 young carrot
t9 young turnip
tA young tomato
tB wildflowers
tC ripe carrot
tD ripe turnip
tE ripe tomato

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- The First Cast (guide_fish): active, stage 10 — There is a pond in the village. Lumi wants me to try fishing.
  · Get a fishing rod ({key:craft}: two sticks and two tufts of grass; or the general store) (open)
  · Catch a fish in the pond (hold the rod, left click the water) (open)
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.
- 13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.

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

> **move down 1**

## Turn 155

```text
Day 1, 13:49, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
......######t1####P1####t2####
======##########t3######P2####
======##c1P3##P4##############
======######t4################
....~~==######################
..~~~~~~..P5..@@======........
~~~~~~~~~~....vv======..t5t6t7
~~~~~~~~~~......======..t8t9tA
..tB............======..tCtDtE
..**............======..mmmmmm
..**............======P6tF....
Terrain: ## cobble, ** flowers, .. grass, == path, mm farmland, ~~ water
@@ You — facing down
t1 chalk drawing of a grey man
P1 Sister Ilse
t2 standing mirror
t3 campfire
P2 Odette
c1 Lumi
P3 Fennick
P4 Marta
t4 log bench
P5 Mia
t5 carrot sprout
t6 turnip sprout
t7 tomato sprout
t8 young carrot
t9 young turnip
tA young tomato
tB wildflowers
tC ripe carrot
tD ripe turnip
tE ripe tomato
P6 Holt
tF Cut Grass

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- The First Cast (guide_fish): active, stage 10 — There is a pond in the village. Lumi wants me to try fishing.
  · Get a fishing rod ({key:craft}: two sticks and two tufts of grass; or the general store) (open)
  · Catch a fish in the pond (hold the rod, left click the water) (open)
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.
- 13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.

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

> **move right 1**

## Turn 156

```text
Day 1, 13:50, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
....######t1####P1####t2######
====##########t3######P2######
====####P3##P4################
====####c1t4##################
..~~==########################
~~~~~~..P5....@@>>==..........
~~~~~~~~......======..t5t6t7t8
~~~~~~~~......======..t9tAtBtC
tD............======..tEtFtGtH
**............======..mmmmmmmm
**............======P6tI......
Terrain: ## cobble, ** flowers, .. grass, == path, mm farmland, ~~ water
@@ You — facing right
t1 chalk drawing of a grey man
P1 Sister Ilse
t2 standing mirror
t3 campfire
P2 Odette
P3 Fennick
P4 Marta
c1 Lumi
t4 log bench
P5 Mia
t5 carrot sprout
t6 turnip sprout
t7 tomato sprout
t8 pumpkin sprout
t9 young carrot
tA young turnip
tB young tomato
tC young pumpkin
tD wildflowers
tE ripe carrot
tF ripe turnip
tG ripe tomato
tH ripe pumpkin
P6 Holt
tI Cut Grass

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- The First Cast (guide_fish): active, stage 10 — There is a pond in the village. Lumi wants me to try fishing.
  · Get a fishing rod ({key:craft}: two sticks and two tufts of grass; or the general store) (open)
  · Catch a fish in the pond (hold the rod, left click the water) (open)
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.
- 13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.

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

> **move down 5** · Journal: «13:50 Farm plots (carrot/turnip/tomato/pumpkin) E of south path; Holt farmer + Cut Grass at bottom. Path continues south toward Dusklea.»

## Turn 157

```text
Day 1, 13:50, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
~~~~~~..P1....======..........
~~~~~~~~......======..t1t2t3t4
~~~~~~~~......c1====..t5t6t7t8
t9............======..tAtBtCtD
**............======..mmmmmmmm
**............@@====P2tE......
..........TT..vv====..******..
..........tF..======********..
....HHHHHHHHHH======..******..
XXXXHHmmmmmmHH======********..
XXXX..mmmmmmHH======..TT....XX
Terrain: ** flowers, .. grass, == path, HH woodwall, TT tree, XX wall, mm farmland, ~~ water
@@ You — facing down
P1 Mia
t1 carrot sprout
t2 turnip sprout
t3 tomato sprout
t4 pumpkin sprout
c1 Lumi
t5 young carrot
t6 young turnip
t7 young tomato
t8 young pumpkin
t9 wildflowers
tA ripe carrot
tB ripe turnip
tC ripe tomato
tD ripe pumpkin
P2 Holt
tE Cut Grass
tF wildflowers

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- The First Cast (guide_fish): active, stage 10 — There is a pond in the village. Lumi wants me to try fishing.
  · Get a fishing rod ({key:craft}: two sticks and two tufts of grass; or the general store) (open)
  · Catch a fish in the pond (hold the rod, left click the water) (open)
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.
- 13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.
- 13:50 Farm plots (carrot/turnip/tomato/pumpkin) E of south path; Holt farmer + Cut Grass at bottom. Path continues south toward Dusklea.

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

> **move down 1**

## Turn 158

```text
Day 1, 13:51, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
~~~~~~~~......======..t1t2t3t4
~~~~~~~~......======..t5t6t7t8
t9............c1====..tAtBtCtD
**............======..mmmmmmmm
**............======P1tE......
..........TT..@@====..******..
..........tF..vv====********..
....HHHHHHHHHH======..******..
XXXXHHmmmmmmHH======********..
XXXX..mmmmmmHH======..TT....XX
XXXXHHHHHHHHHH======........XX
Terrain: ** flowers, .. grass, == path, HH woodwall, TT tree, XX wall, mm farmland, ~~ water
@@ You — facing down
t1 carrot sprout
t2 turnip sprout
t3 tomato sprout
t4 pumpkin sprout
t5 young carrot
t6 young turnip
t7 young tomato
t8 young pumpkin
t9 wildflowers
c1 Lumi
tA ripe carrot
tB ripe turnip
tC ripe tomato
tD ripe pumpkin
P1 Holt
tE Cut Grass
tF wildflowers

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- The First Cast (guide_fish): active, stage 10 — There is a pond in the village. Lumi wants me to try fishing.
  · Get a fishing rod ({key:craft}: two sticks and two tufts of grass; or the general store) (open)
  · Catch a fish in the pond (hold the rod, left click the water) (open)
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.
- 13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.
- 13:50 Farm plots (carrot/turnip/tomato/pumpkin) E of south path; Holt farmer + Cut Grass at bottom. Path continues south toward Dusklea.

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

> **move down 6**

## Turn 159

```text
Day 1, 13:52, cloud — Firstlight Village

Around you (each cell two characters; north is up; blank is outside the map):
..........t1..======********..
....HHHHHHHHHH======..******..
XXXXHHmmmmmmHHc1====********..
XXXX..mmmmmmHH======..TT....XX
XXXXHHHHHHHHHH======........XX
..............@@====......XXXX
==============vv==============
..............======..XX......
..............======..........
..TTTT....t2..======......TT..
TTTTTTTTPPTTTT======TTTTTTTTTT
Terrain: ** flowers, .. grass, == path, HH woodwall, PP pine, TT tree, XX wall, mm farmland
@@ You — facing down
t1 wildflowers
c1 Lumi
t2 fallen leaves

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- The First Cast (guide_fish): active, stage 10 — There is a pond in the village. Lumi wants me to try fishing.
  · Get a fishing rod ({key:craft}: two sticks and two tufts of grass; or the general store) (open)
  · Catch a fish in the pond (hold the rod, left click the water) (open)
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.
- 13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.
- 13:50 Farm plots (carrot/turnip/tomato/pumpkin) E of south path; Holt farmer + Cut Grass at bottom. Path continues south toward Dusklea.

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

> **move down 6**

## Turn 160

```text
Day 1, 13:53, cloud — Dusklea

Around you (each cell two characters; north is up; blank is outside the map):




PPTTTTTTTTTTTT======TTTTTTPPTT
TTTTTTTTTTTTTT@@==c1TTTTTTPPPP
........t1....vv==PPPPTTTTPP..
......t2......====............
........t3....====............
..............====........,,,,
..c2..........====..........,,
Terrain: ,, drygrass, .. grass, == path, PP pine, TT tree
@@ You — facing down
c1 Lumi
t1 fallen leaves
t2 Cut Grass
t3 Cut Grass
c2 cow

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- You are in Dusklea

Journal:
- The First Cast (guide_fish): active, stage 10 — There is a pond in the village. Lumi wants me to try fishing.
  · Get a fishing rod ({key:craft}: two sticks and two tufts of grass; or the general store) (open)
  · Catch a fish in the pond (hold the rod, left click the water) (open)
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.
- 13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.
- 13:50 Farm plots (carrot/turnip/tomato/pumpkin) E of south path; Holt farmer + Cut Grass at bottom. Path continues south toward Dusklea.

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up walkable (to Firstlight Village) · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down 6** · Journal: «13:53 Entered Dusklea from Firstlight south path. Cut Grass x2 just W of path at north end; cow SW.»

## Turn 161

```text
Day 1, 13:54, cloud — Dusklea

Around you (each cell two characters; north is up; blank is outside the map):
........t1....====PPPPTTTTPP..
......t2......====............
........t3....c1==............
..............====........,,,,
..c2..........====..........,,
..t4..........@@==..t5........
XXXXXX........vv==....HHHHHHHH
....XXt6....t7====..t8HH..c3..
....====================....t9
....XXtA......======..HHc4....
tB..XX....P1....====..HHHHHHHH
Terrain: ,, drygrass, .. grass, == path, HH woodwall, PP pine, TT tree, XX wall
@@ You — facing down
t1 fallen leaves
t2 Cut Grass
t3 Cut Grass
c1 Lumi
c2 cow
t4 wildflowers
t5 wildflowers
t6 wildflowers
t7 lantern post
t8 wildflowers
c3 chicken
t9 grass tuft
tA barrel
c4 chicken
tB trough
P1 Brin

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- Lumi: "The cows are all crowded at the north end, as far from the trees as they can get. Are they afraid of something?"

Journal:
- The First Cast (guide_fish): active, stage 10 — There is a pond in the village. Lumi wants me to try fishing.
  · Get a fishing rod ({key:craft}: two sticks and two tufts of grass; or the general store) (open)
  · Catch a fish in the pond (hold the rod, left click the water) (open)
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Start: pick up Watchman's Cloak (t3 west), check log (t2), then exit south via path.
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.
- 13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.
- 13:50 Farm plots (carrot/turnip/tomato/pumpkin) E of south path; Holt farmer + Cut Grass at bottom. Path continues south toward Dusklea.
- 13:53 Entered Dusklea from Firstlight south path. Cut Grass x2 just W of path at north end; cow SW.

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

> **move down 6** · Journal: «13:54 Dusklea: Lumi notes cows crowded north, afraid of trees. Farmhouse E of path, Brin SW near crossroads.»

## Turn 162

```text
Day 1, 13:55, cloud — Dusklea

Around you (each cell two characters; north is up; blank is outside the map):
XXXXXX........====....HHHHHHHH
....XXt1....t2====..t3HH..c1..
....==========c2========....t4
....XXt5......======..HH..c3..
t6..XX....P1....====..HHHHHHHH
XXXXXX..t7....@@====..........
..............vv====..........
................====........t8
................====..XXXXXXXX
bb..............====....,,,,,,
t9..............====....,,,,,,
Terrain: ,, drygrass, .. grass, == path, HH woodwall, XX wall, bb bush
@@ You — facing down
t1 wildflowers
t2 lantern post
t3 wildflowers
c1 chicken
c2 Lumi
t4 grass tuft
t5 barrel
c3 chicken
t6 trough
P1 Brin
t7 Brin's bench
t8 wildflowers
t9 fallen leaves

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- The First Cast (guide_fish): active, stage 10 — There is a pond in the village. Lumi wants me to try fishing.
  · Get a fishing rod ({key:craft}: two sticks and two tufts of grass; or the general store) (open)
  · Catch a fish in the pond (hold the rod, left click the water) (open)
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.
- 13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.
- 13:50 Farm plots (carrot/turnip/tomato/pumpkin) E of south path; Holt farmer + Cut Grass at bottom. Path continues south toward Dusklea.
- 13:53 Entered Dusklea from Firstlight south path. Cut Grass x2 just W of path at north end; cow SW.
- 13:54 Dusklea: Lumi notes cows crowded north, afraid of trees. Farmhouse E of path, Brin SW near crossroads.

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

> **move down 8**

## Turn 163

```text
Day 1, 13:57, cloud — Dusklea

Around you (each cell two characters; north is up; blank is outside the map):
................====..XXXXXXXX
bb..............====....,,,,,,
t1............c1====....,,,,,,
................====....,,,,,,
..............======....,,,,t2
****..........@@====..,,,,,,,,
**............vv==....,,,,,,,,
****......t3..====....,,,,,,,,
..............====..........,,
....t4........====..t5........
..PPTT....TTTT====TTPP......TT
Terrain: ** flowers, ,, drygrass, .. grass, == path, PP pine, TT tree, XX wall, bb bush
@@ You — facing down
t1 fallen leaves
c1 Lumi
t2 haystack
t3 grass tuft
t4 ferns
t5 fallen leaves

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- The First Cast (guide_fish): active, stage 10 — There is a pond in the village. Lumi wants me to try fishing.
  · Get a fishing rod ({key:craft}: two sticks and two tufts of grass; or the general store) (open)
  · Catch a fish in the pond (hold the rod, left click the water) (open)
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.
- 13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.
- 13:50 Farm plots (carrot/turnip/tomato/pumpkin) E of south path; Holt farmer + Cut Grass at bottom. Path continues south toward Dusklea.
- 13:53 Entered Dusklea from Firstlight south path. Cut Grass x2 just W of path at north end; cow SW.
- 13:54 Dusklea: Lumi notes cows crowded north, afraid of trees. Farmhouse E of path, Brin SW near crossroads.

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

> **move down 6**

## Turn 164

```text
Day 1, 13:58, cloud — Dusklea

Around you (each cell two characters; north is up; blank is outside the map):
**............====....,,,,,,,,
****......t1..====....,,,,,,,,
..............c1==..........,,
....t2........====..t3........
..PPTT....TTTT====TTPP......TT
TTTTTTTTPPTTTT@@==TTTTTT..TTTT
TTPPPPPPTTPPTTvv====TTTTTTTTTT
TTPPPPTTPPTTTT======TTTTTTTTPP



Terrain: ** flowers, ,, drygrass, .. grass, == path, PP pine, TT tree
@@ You — facing down
t1 grass tuft
c1 Lumi
t2 ferns
t3 fallen leaves

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- The First Cast (guide_fish): active, stage 10 — There is a pond in the village. Lumi wants me to try fishing.
  · Get a fishing rod ({key:craft}: two sticks and two tufts of grass; or the general store) (open)
  · Catch a fish in the pond (hold the rod, left click the water) (open)
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.
- 13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.
- 13:50 Farm plots (carrot/turnip/tomato/pumpkin) E of south path; Holt farmer + Cut Grass at bottom. Path continues south toward Dusklea.
- 13:53 Entered Dusklea from Firstlight south path. Cut Grass x2 just W of path at north end; cow SW.
- 13:54 Dusklea: Lumi notes cows crowded north, afraid of trees. Farmhouse E of path, Brin SW near crossroads.

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

> **move down 3**

## Turn 165

```text
Day 1, 13:59, cloud — Hushwood

Around you (each cell two characters; north is up; blank is outside the map):



PPTTTTTTTTTTPP======TTPPTTTTTT
TTPPTTTTTTPPTT====c1TTPPPPTTTT
PPPPTTTTTTTTTT@@==TTTTTTTTTTTT
TTTTTTPPt1....vv==t2t3..TTTTTT
TTTTt4..t5....====t6....t7t8TT
TTTT......t9..====..tA........
TTPPPPtB....tC====....tD....tE
TTTT..........====..tF........
Terrain: .. grass, == path, PP pine, TT tree
@@ You — facing down
c1 Lumi
t1 stump
t2 fallen leaves
t3 stump
t4 stump
t5 Stick
t6 Stick
t7 beehive
t8 stump
t9 firewood
tA Stick
tB stump
tC Stick
tD Chopping block
tE stump
tF firewood

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- You are in Hushwood
- Lumi: "Listen. ...There are no birds. Not one. A forest this big ought to be noisy in the afternoon."

Journal:
- The First Cast (guide_fish): active, stage 10 — There is a pond in the village. Lumi wants me to try fishing.
  · Get a fishing rod ({key:craft}: two sticks and two tufts of grass; or the general store) (open)
  · Catch a fish in the pond (hold the rod, left click the water) (open)
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Log: sunsets getting earlier each year (401:19:42→409:19:12); reports sent down never return; Lumi found asleep in snow by cairn, asked her age.
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.
- 13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.
- 13:50 Farm plots (carrot/turnip/tomato/pumpkin) E of south path; Holt farmer + Cut Grass at bottom. Path continues south toward Dusklea.
- 13:53 Entered Dusklea from Firstlight south path. Cut Grass x2 just W of path at north end; cow SW.
- 13:54 Dusklea: Lumi notes cows crowded north, afraid of trees. Farmhouse E of path, Brin SW near crossroads.

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

> **move down 6** · Journal: «13:59 Entered Hushwood (no birds, eerie). Woodcutter clearing with sticks, firewood, chopping block, beehive near north end.»

## Turn 166

```text
Day 1, 14:00, cloud — Hushwood

Around you (each cell two characters; north is up; blank is outside the map):
TTTTTTPPt1....====t2t3..TTTTTT
TTTTt4..t5....====t6....t7t8TT
TTTT......t9..c1==..tA........
TTPPPPtB....tC====....tD....tE
TTTT..........====..tF........
TTTTtG........@@==..........TT
TTTTPP........vv==......tHPPTT
PPTTTTTTPPtI..====....PPTTTTTT
TTTTTTTTPPTTTT====TTTTTTTTTTPP
TTPPTTTT......====TTTTTTtJTTTT
TTTTtK..tL....====TTTTTTTTTTTT
Terrain: .. grass, == path, PP pine, TT tree
@@ You — facing down
t1 stump
t2 fallen leaves
t3 stump
t4 stump
t5 Stick
t6 Stick
t7 beehive
t8 stump
t9 firewood
c1 Lumi
tA Stick
tB stump
tC Stick
tD Chopping block
tE stump
tF firewood
tG stump
tH stump
tI stump
tJ fallen leaves
tK moss
tL sign

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- The First Cast (guide_fish): active, stage 10 — There is a pond in the village. Lumi wants me to try fishing.
  · Get a fishing rod ({key:craft}: two sticks and two tufts of grass; or the general store) (open)
  · Catch a fish in the pond (hold the rod, left click the water) (open)
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.
- 13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.
- 13:50 Farm plots (carrot/turnip/tomato/pumpkin) E of south path; Holt farmer + Cut Grass at bottom. Path continues south toward Dusklea.
- 13:53 Entered Dusklea from Firstlight south path. Cut Grass x2 just W of path at north end; cow SW.
- 13:54 Dusklea: Lumi notes cows crowded north, afraid of trees. Farmhouse E of path, Brin SW near crossroads.
- 13:59 Entered Hushwood (no birds, eerie). Woodcutter clearing with sticks, firewood, chopping block, beehive near north end.

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

> **move down 6**

## Turn 167

```text
Day 1, 14:01, cloud — Hushwood

Around you (each cell two characters; north is up; blank is outside the map):
TTTTPP........====......t1PPTT
PPTTTTTTPPt2..====....PPTTTTTT
TTTTTTTTPPTTTTc1==TTTTTTTTTTPP
TTPPTTTT......====TTTTTTt3TTTT
TTTTt4..t5....====TTTTTTTTTTTT
====t6........@@==..TTTT......
TT============vv====TT........
PPTT......==......========....
TTTTPP....==....TTTTPPTT======
TTTTTTTT====TTTTTTTTPPTTTTTT::
TTPPTTTT==PPTTTTTTTTTTTTTTPP::
Terrain: .. grass, :: dirt, == path, PP pine, TT tree
@@ You — facing down
t1 stump
t2 stump
c1 Lumi
t3 fallen leaves
t4 moss
t5 sign
t6 fallen leaves

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- The First Cast (guide_fish): active, stage 10 — There is a pond in the village. Lumi wants me to try fishing.
  · Get a fishing rod ({key:craft}: two sticks and two tufts of grass; or the general store) (open)
  · Catch a fish in the pond (hold the rod, left click the water) (open)
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.
- 13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.
- 13:50 Farm plots (carrot/turnip/tomato/pumpkin) E of south path; Holt farmer + Cut Grass at bottom. Path continues south toward Dusklea.
- 13:53 Entered Dusklea from Firstlight south path. Cut Grass x2 just W of path at north end; cow SW.
- 13:54 Dusklea: Lumi notes cows crowded north, afraid of trees. Farmhouse E of path, Brin SW near crossroads.
- 13:59 Entered Hushwood (no birds, eerie). Woodcutter clearing with sticks, firewood, chopping block, beehive near north end.

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

> **move up 1**

## Turn 168

```text
Day 1, 14:01, cloud — Hushwood

Around you (each cell two characters; north is up; blank is outside the map):
TTTTt1........====..........TT
TTTTPP........====......t2PPTT
PPTTTTTTPPt3..====....PPTTTTTT
TTTTTTTTPPTTTTc1==TTTTTTTTTTPP
TTPPTTTT......^^==TTTTTTt4TTTT
TTTTt5..t6....@@==TTTTTTTTTTTT
====t7........====..TTTT......
TT==================TT........
PPTT......==......========....
TTTTPP....==....TTTTPPTT======
TTTTTTTT====TTTTTTTTPPTTTTTT::
Terrain: .. grass, :: dirt, == path, PP pine, TT tree
@@ You — facing up
t1 stump
t2 stump
t3 stump
c1 Lumi
t4 fallen leaves
t5 moss
t6 sign
t7 fallen leaves

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- The First Cast (guide_fish): active, stage 10 — There is a pond in the village. Lumi wants me to try fishing.
  · Get a fishing rod ({key:craft}: two sticks and two tufts of grass; or the general store) (open)
  · Catch a fish in the pond (hold the rod, left click the water) (open)
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.
- 13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.
- 13:50 Farm plots (carrot/turnip/tomato/pumpkin) E of south path; Holt farmer + Cut Grass at bottom. Path continues south toward Dusklea.
- 13:53 Entered Dusklea from Firstlight south path. Cut Grass x2 just W of path at north end; cow SW.
- 13:54 Dusklea: Lumi notes cows crowded north, afraid of trees. Farmhouse E of path, Brin SW near crossroads.
- 13:59 Entered Hushwood (no birds, eerie). Woodcutter clearing with sticks, firewood, chopping block, beehive near north end.

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

> **move left 2**

## Turn 169

```text
Day 1, 14:02, cloud — Hushwood

Around you (each cell two characters; north is up; blank is outside the map):
TTTTTTTTt1........====........
TT..TTTTPP........====......t2
TTTTPPTTTTTTPPt3..====....PPTT
TTTTTTTTTTTTPPTTTTc1==TTTTTTTT
PPPPTTPPTTTT......====TTTTTTt4
TTPPTTTTt5..t6@@..====TTTTTTTT
========t7........====..TTTT..
PPPPTT==================TT....
TTTTPPTT......==......========
TTPPTTTTPP....==....TTTTPPTT==
TTTTTTTTTTTT====TTTTTTTTPPTTTT
Terrain: .. grass, == path, PP pine, TT tree
@@ You — facing left (in front: t6)
t1 stump
t2 stump
t3 stump
c1 Lumi
t4 fallen leaves
t5 moss
t6 sign
t7 fallen leaves

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- The First Cast (guide_fish): active, stage 10 — There is a pond in the village. Lumi wants me to try fishing.
  · Get a fishing rod ({key:craft}: two sticks and two tufts of grass; or the general store) (open)
  · Catch a fish in the pond (hold the rod, left click the water) (open)
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.
- 13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.
- 13:50 Farm plots (carrot/turnip/tomato/pumpkin) E of south path; Holt farmer + Cut Grass at bottom. Path continues south toward Dusklea.
- 13:53 Entered Dusklea from Firstlight south path. Cut Grass x2 just W of path at north end; cow SW.
- 13:54 Dusklea: Lumi notes cows crowded north, afraid of trees. Farmhouse E of path, Brin SW near crossroads.
- 13:59 Entered Hushwood (no birds, eerie). Woodcutter clearing with sticks, firewood, chopping block, beehive near north end.

Actions:
- primary: Punch sign
- hands: Read sign
- take: —
- put: —
- use: Punch sign
- self: —
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **hands**

## Turn 170

```text
Day 1, 14:02, cloud — Hushwood

Around you (each cell two characters; north is up; blank is outside the map):
TTTTTTTTt1........====........
TT..TTTTPP........====......t2
TTTTPPTTTTTTPPt3..====....PPTT
TTTTTTTTTTTTPPTTTTc1==TTTTTTTT
PPPPTTPPTTTT......====TTTTTTt4
TTPPTTTTt5..t6@@..====TTTTTTTT
========t7........====..TTTT..
PPPPTT==================TT....
TTTTPPTT......==......========
TTPPTTTTPP....==....TTTTPPTT==
TTTTTTTTTTTT====TTTTTTTTPPTTTT
Terrain: .. grass, == path, PP pine, TT tree
@@ You — facing left (in front: t6)
t1 stump
t2 stump
t3 stump
c1 Lumi
t4 fallen leaves
t5 moss
t6 sign
t7 fallen leaves

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- sign: "NORTH — Dusklea, and Firstlight. WEST — the Charcoal Dell. EAST — over the brook to the Reed Bend. SOUTH — Thornwood Hollow; keep to the path."

Journal:
- The First Cast (guide_fish): active, stage 10 — There is a pond in the village. Lumi wants me to try fishing.
  · Get a fishing rod ({key:craft}: two sticks and two tufts of grass; or the general store) (open)
  · Catch a fish in the pond (hold the rod, left click the water) (open)
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Passed through the cut in rocks south of Cloudtop at 13:11; following path south.
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.
- 13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.
- 13:50 Farm plots (carrot/turnip/tomato/pumpkin) E of south path; Holt farmer + Cut Grass at bottom. Path continues south toward Dusklea.
- 13:53 Entered Dusklea from Firstlight south path. Cut Grass x2 just W of path at north end; cow SW.
- 13:54 Dusklea: Lumi notes cows crowded north, afraid of trees. Farmhouse E of path, Brin SW near crossroads.
- 13:59 Entered Hushwood (no birds, eerie). Woodcutter clearing with sticks, firewood, chopping block, beehive near north end.

Actions:
- primary: Punch sign
- hands: Read sign
- take: —
- put: —
- use: Punch sign
- self: —
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move down 5** · Journal: «14:02 Hushwood sign at crossroads: W Charcoal Dell, E Reed Bend (over brook), S Thornwood Hollow (keep to path). South path is directly below the sign.»

## Turn 171

```text
Day 1, 14:03, cloud — Hushwood

Around you (each cell two characters; north is up; blank is outside the map):
TTPPTTTTt1..t2....====TTTTTTTT
========t3........====..TTTT..
PPPPTT========c1========TT....
TTTTPPTT......==......========
TTPPTTTTPP....==....TTTTPPTT==
TTTTTTTTTTTT==@@TTTTTTTTPPTTTT
PPPPTTPPTTTT==vvTTTTTTTTTTTTTT
PPPPTTPPTT====PPPPTTPPTTTTTTTT
PPPPPPTT====TTPPTTTTPPTTTTTTt4
PPPPPP====TTTTTTTTPPPPTTPP....
::::::==PPPPPPTTTTPPTTPPTT....
Terrain: .. grass, :: dirt, == path, PP pine, TT tree
@@ You — facing down
t1 moss
t2 sign
t3 fallen leaves
c1 Lumi
t4 A proclamation nailed to a tree

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- The First Cast (guide_fish): active, stage 10 — There is a pond in the village. Lumi wants me to try fishing.
  · Get a fishing rod ({key:craft}: two sticks and two tufts of grass; or the general store) (open)
  · Catch a fish in the pond (hold the rod, left click the water) (open)
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.
- 13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.
- 13:50 Farm plots (carrot/turnip/tomato/pumpkin) E of south path; Holt farmer + Cut Grass at bottom. Path continues south toward Dusklea.
- 13:53 Entered Dusklea from Firstlight south path. Cut Grass x2 just W of path at north end; cow SW.
- 13:54 Dusklea: Lumi notes cows crowded north, afraid of trees. Farmhouse E of path, Brin SW near crossroads.
- 13:59 Entered Hushwood (no birds, eerie). Woodcutter clearing with sticks, firewood, chopping block, beehive near north end.
- 14:02 Hushwood sign at crossroads: W Charcoal Dell, E Reed Bend (over brook), S Thornwood Hollow (keep to path). South path is directly below the sign.

Actions:
- primary: Punch pine tree
- hands: Interact with pine tree
- take: —
- put: —
- use: Punch pine tree
- self: —
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left 1**

## Turn 172

```text
Day 1, 14:03, cloud — Hushwood

Around you (each cell two characters; north is up; blank is outside the map):
TTTTPPTTTTt1..t2....====TTTTTT
==========t3........====..TTTT
PPPPPPTT========c1========TT..
TTTTTTPPTT......==......======
TTTTPPTTTTPP....==....TTTTPPTT
TTTTTTTTTTTT<<@@==TTTTTTTTPPTT
PPPPPPTTPPTTTT==PPTTTTTTTTTTTT
PPPPPPTTPPTT====PPPPTTPPTTTTTT
TTPPPPPPTT====TTPPTTTTPPTTTTTT
::PPPPPP====TTTTTTTTPPPPTTPP..
::::::::==PPPPPPTTTTPPTTPPTT..
Terrain: .. grass, :: dirt, == path, PP pine, TT tree
@@ You — facing left
t1 moss
t2 sign
t3 fallen leaves
c1 Lumi

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- The First Cast (guide_fish): active, stage 10 — There is a pond in the village. Lumi wants me to try fishing.
  · Get a fishing rod ({key:craft}: two sticks and two tufts of grass; or the general store) (open)
  · Catch a fish in the pond (hold the rod, left click the water) (open)
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.
- 13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.
- 13:50 Farm plots (carrot/turnip/tomato/pumpkin) E of south path; Holt farmer + Cut Grass at bottom. Path continues south toward Dusklea.
- 13:53 Entered Dusklea from Firstlight south path. Cut Grass x2 just W of path at north end; cow SW.
- 13:54 Dusklea: Lumi notes cows crowded north, afraid of trees. Farmhouse E of path, Brin SW near crossroads.
- 13:59 Entered Hushwood (no birds, eerie). Woodcutter clearing with sticks, firewood, chopping block, beehive near north end.
- 14:02 Hushwood sign at crossroads: W Charcoal Dell, E Reed Bend (over brook), S Thornwood Hollow (keep to path). South path is directly below the sign.

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

> **move down 2**

## Turn 173

```text
Day 1, 14:03, cloud — Hushwood

Around you (each cell two characters; north is up; blank is outside the map):
PPPPPPTT==================TT..
TTTTTTPPTT......==......======
TTTTPPTTTTPP..c1==....TTTTPPTT
TTTTTTTTTTTTTT====TTTTTTTTPPTT
PPPPPPTTPPTTTT==PPTTTTTTTTTTTT
PPPPPPTTPPTT==@@PPPPTTPPTTTTTT
TTPPPPPPTT====vvPPTTTTPPTTTTTT
::PPPPPP====TTTTTTTTPPPPTTPP..
::::::::==PPPPPPTTTTPPTTPPTT..
PPPPPP==PPPPTTPPPPTTPPPPTTPP..
PPTT====TTTTTTPPTTPPTTPPPPTT..
Terrain: .. grass, :: dirt, == path, PP pine, TT tree
@@ You — facing down
c1 Lumi

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- The First Cast (guide_fish): active, stage 10 — There is a pond in the village. Lumi wants me to try fishing.
  · Get a fishing rod ({key:craft}: two sticks and two tufts of grass; or the general store) (open)
  · Catch a fish in the pond (hold the rod, left click the water) (open)
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.
- 13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.
- 13:50 Farm plots (carrot/turnip/tomato/pumpkin) E of south path; Holt farmer + Cut Grass at bottom. Path continues south toward Dusklea.
- 13:53 Entered Dusklea from Firstlight south path. Cut Grass x2 just W of path at north end; cow SW.
- 13:54 Dusklea: Lumi notes cows crowded north, afraid of trees. Farmhouse E of path, Brin SW near crossroads.
- 13:59 Entered Hushwood (no birds, eerie). Woodcutter clearing with sticks, firewood, chopping block, beehive near north end.
- 14:02 Hushwood sign at crossroads: W Charcoal Dell, E Reed Bend (over brook), S Thornwood Hollow (keep to path). South path is directly below the sign.

Actions:
- primary: Punch tree
- hands: Interact with tree
- take: —
- put: —
- use: Punch tree
- self: —
- move: up walkable · down blocked · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

> **move left 1**

## Turn 174

```text
Day 1, 14:03, cloud — Hushwood

Around you (each cell two characters; north is up; blank is outside the map):
TTPPPPPPTT==================TT
PPTTTTTTPPTT......==......====
PPTTTTPPTTTTPP..c1==....TTTTPP
PPTTTTTTTTTTTTTT====TTTTTTTTPP
PPPPPPPPTTPPTTTT==PPTTTTTTTTTT
..PPPPPPTTPP<<@@==PPPPTTPPTTTT
t1TTPPPPPPTT====TTPPTTTTPPTTTT
::::PPPPPP====TTTTTTTTPPPPTTPP
PP::::::::==PPPPPPTTTTPPTTPPTT
TTPPPPPP==PPPPTTPPPPTTPPPPTTPP
PPPPTT====TTTTTTPPTTPPTTPPPPTT
Terrain: .. grass, :: dirt, == path, PP pine, TT tree
@@ You — facing left
c1 Lumi
t1 Frostcap

You: hp 40/40 · held: nothing · worn: Watchman's Cloak (shoulders), Traveller's Boots (feet) · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Berries · [1] Cut Grass · [2] Stone · [4] Stick ×2 · [5] Old Axe

Since your last action:
- nothing

Journal:
- The First Cast (guide_fish): active, stage 10 — There is a pond in the village. Lumi wants me to try fishing.
  · Get a fishing rod ({key:craft}: two sticks and two tufts of grass; or the general store) (open)
  · Catch a fish in the pond (hold the rod, left click the water) (open)
- Lost in the Barrow (rescue): active, stage 10 — Rowan says Lina and Oskar went into Longsleep Barrow when the storm broke. He says the dead down there haven't been lying quiet.
  · Go south through Dusklea and Hushwood to the barrow mouth in Thornwood Hollow (open)
  · Find Lina (open)
  · Find Oskar in the ossuary, on the second floor (open)
  · Put down the warden in the sanctum, on the deepest floor (open)
- Down from the Mountain (descent): done, stage 100 — I came to Firstlight Village. A flame is kept burning in its chapel.
  · Find the shrine stone at Woundstone Foot (done)
  · Try something the world has never seen (done)
  · Take the cliff stair down to Vesper Ford (done)
  · Go west to Firstlight Village (done)

Your journal:
- Entered Woundstone Foot at 13:12 via north path; looking for shrine stone.
- Shrine stone answered at 13:14 (quest stage 30); next: cliff stair south to Vesper Ford.
- Woke Woundstone Foot waypoint statue at 13:17 (east of path south of shrine).
- Vesper Ford 13:20: bridge broken, ferry rope snapped; Hesper (ferrykeeper) sent me west to Firstlight Village. Frost slime NE—avoid.
- Hesper: bridge broken by a rider in white with crown of thorns through his helm; laid nails on pier like a toll.
- Hesper: 3 planks mend bridge; old axe by the stump; woods full of trees.
- Hesper: Tobin keeps a cart in Firstlight Village (west); a meal might buy something useful from him.
- Hesper: Firstlight lost 2 people in storm; elder Rowan wants anyone who can hold a blade. Go to village first, bridge later.
- Got Bread (slot 3) — could trade as "meal" to Tobin.
- Fire slime + slime burrow in dirt area W of Vesper Ford; moving carefully west.
- Camp south of Vesper Ford dirt area: tent, chest, firewood, stump + Old Axe, campfire. Sticks around.
- Took Old Axe at camp (13:27). Can cut trees for planks later.
- West of camp is dense trees; try the path at the bottom-left (south) heading west toward Firstlight.
- Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.
- 13:31 Firstlight: quest Lost in the Barrow — Lina & Oskar in Longsleep Barrow (south via Dusklea, Hushwood, Thornwood Hollow). Got Traveller's Boots (slot 6). Sister Ilse keeps chapel flame.
- Rowan (elder) wants me to find him in village after warming up; Pell is a kid who draws.
- Greta's General Store in Firstlight: door N of path near west end; buys herbs, hides, eggs. Vigo NW of store.
- Tobin + handcart (Flask of Oil, Frost Wand under it) at far west end of Firstlight main street, NW of statue.
- Gave Bread to Tobin at 13:38; he gave me the Frost Wand (under his handcart) — take it.
- 13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.
- 13:43 West square of Firstlight: notice board + commission board NW, well, chalk drawing of grey man, Fennick & Marta, Sister Ilse. Look for Rowan here.
- 13:44 Chapel door at NW square (DD west of sign): Sister Ilse, Brother Anselm sells skill books at bookstand inside. Rowan is NW of chapel sign on grass.
- 13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).
- 13:46 Notice board: E Vesper Ford, W Millbrook, N Dawn Hill, S Dusklea then Hushwood. Take SW path out of chapel square south.
- 13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.
- 13:50 Farm plots (carrot/turnip/tomato/pumpkin) E of south path; Holt farmer + Cut Grass at bottom. Path continues south toward Dusklea.
- 13:53 Entered Dusklea from Firstlight south path. Cut Grass x2 just W of path at north end; cow SW.
- 13:54 Dusklea: Lumi notes cows crowded north, afraid of trees. Farmhouse E of path, Brin SW near crossroads.
- 13:59 Entered Hushwood (no birds, eerie). Woodcutter clearing with sticks, firewood, chopping block, beehive near north end.
- 14:02 Hushwood sign at crossroads: W Charcoal Dell, E Reed Bend (over brook), S Thornwood Hollow (keep to path). South path is directly below the sign.

Actions:
- primary: Punch tree
- hands: Interact with tree
- take: —
- put: —
- use: Punch tree
- self: —
- move: up blocked · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

*stopped here: run: not sent (the anthropic cap of $100 would be passed (spent $99.3834))*

