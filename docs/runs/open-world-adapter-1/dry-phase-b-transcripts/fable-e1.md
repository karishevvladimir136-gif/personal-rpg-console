# Phase B · fable · episode 1 (DRY)

`claude-fable-5-1` through OpenRouter · 80 turns · stages {}. Each turn: the observation the model was sent, then its action line and Note (the reasoning field, where there is one, is kept in the log and not shown).

## Turn 1

```text
Day 1, 08:00, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
................**......XXXXXX
....................t1..XXXXDD
................==============
....TT........t2==............
................==..........TT
..............@@==............
~~......t3....vv==..........**
................==..........TT
........**......==............
....TT..........==............
................==......t4....
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall, ~~ water
@@ You — facing down
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You are in The Glade
- You: "A glade, and a cottage. Someone lives here."

Journal:
- empty

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **advance**

## Turn 2

```text
Day 1, 08:00, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
................**......XXXXXX
....................t1..XXXXDD
................==============
....TT........t2==............
................==..........TT
..............@@==............
~~......t3....vv==..........**
................==..........TT
........**......==............
....TT..........==............
................==......t4....
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall, ~~ water
@@ You — facing down
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move down**

## Turn 3

```text
Day 1, 08:00, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....................t1..XXXXDD
................==============
....TT........t2==............
................==..........TT
................==............
~~......t3....@@==..........**
..............vv==..........TT
........**......==............
....TT..........==............
................==......t4....
............**................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall, ~~ water
@@ You — facing down
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **hands**

*no rule: «grass is sent handle from you» (terrain)*

## Turn 4

```text
Day 1, 08:00, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....................t1..XXXXDD
................==============
....TT........t2==............
................==..........TT
................==............
~~......t3....@@==..........**
..............vv==..........TT
........**......==............
....TT..........==............
................==......t4....
............**................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall, ~~ water
@@ You — facing down
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You reach out to grass…
- The world had no rule for: grass is sent handle from you
- You run a hand over grass.

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face up**

## Turn 5

```text
Day 1, 08:00, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....................t1..XXXXDD
................==============
....TT........t2==............
................==..........TT
..............^^==............
~~......t3....@@==..........**
................==..........TT
........**......==............
....TT..........==............
................==......t4....
............**................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall, ~~ water
@@ You — facing up
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move up**

## Turn 6

```text
Day 1, 08:01, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
................**......XXXXXX
....................t1..XXXXDD
................==============
....TT........t2==............
..............^^==..........TT
..............@@==............
~~......t3......==..........**
................==..........TT
........**......==............
....TT..........==............
................==......t4....
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall, ~~ water
@@ You — facing up
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move down**

## Turn 7

```text
Day 1, 08:01, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....................t1..XXXXDD
................==============
....TT........t2==............
................==..........TT
................==............
~~......t3....@@==..........**
..............vv==..........TT
........**......==............
....TT..........==............
................==......t4....
............**................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall, ~~ water
@@ You — facing down
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face left** · Note: «(dry) a note on turn 7.»

## Turn 8

```text
Day 1, 08:01, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....................t1..XXXXDD
................==============
....TT........t2==............
................==..........TT
................==............
~~......t3..<<@@==..........**
................==..........TT
........**......==............
....TT..........==............
................==......t4....
............**................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall, ~~ water
@@ You — facing left
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move right**

## Turn 9

```text
Day 1, 08:01, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..................t1..XXXXDDXX
..............==============..
..TT........t2==..............
..............==..........TT..
..............==..............
......t3......@@>>........**..
..............==..........TT..
......**......==..............
..TT..........==............TT
..............==......t4......
..........**..................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face down**

## Turn 10

```text
Day 1, 08:01, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..................t1..XXXXDDXX
..............==============..
..TT........t2==..............
..............==..........TT..
..............==..............
......t3......@@..........**..
..............vv..........TT..
......**......==..............
..TT..........==............TT
..............==......t4......
..........**..................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing down
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with dirt road
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face left**

## Turn 11

```text
Day 1, 08:01, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..................t1..XXXXDDXX
..............==============..
..TT........t2==..............
..............==..........TT..
..............==..............
......t3....<<@@..........**..
..............==..........TT..
......**......==..............
..TT..........==............TT
..............==......t4......
..........**..................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **wait 10**

## Turn 12

```text
Day 1, 08:11, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..................t1..XXXXDDXX
..............==============..
..TT........t2==..............
..............==..........TT..
..............==..............
......t3....<<@@..........**..
..............==..........TT..
......**......==..............
..TT..........==............TT
..............==......t4......
..........**..................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **wait 10**

## Turn 13

```text
Day 1, 08:22, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..................t1..XXXXDDXX
..............==============..
..TT........t2==..............
..............==..........TT..
..............==..............
......t3....<<@@..........**..
..............==..........TT..
......**......==..............
..TT..........==............TT
..............==......t4......
..........**..................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> ****hands**** · *not an action*

## Turn 14

```text
Day 1, 08:22, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..................t1..XXXXDDXX
..............==============..
..TT........t2==..............
..............==..........TT..
..............==..............
......t3....<<@@..........**..
..............==..........TT..
......**......==..............
..TT..........==............TT
..............==......t4......
..........**..................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- Not an action: **hands**

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **hands** · Note: «(dry) a note on turn 14.»

*no rule: «grass is sent handle from you» (terrain)*

## Turn 15

```text
Day 1, 08:22, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..................t1..XXXXDDXX
..............==============..
..TT........t2==..............
..............==..........TT..
..............==..............
......t3....<<@@..........**..
..............==..........TT..
......**......==..............
..TT..........==............TT
..............==......t4......
..........**..................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You reach out to grass…
- The world had no rule for: grass is sent handle from you
- You run a hand over grass.

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move right**

## Turn 16

```text
Day 1, 08:22, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
................t1..XXXXDDXXXX
............==============....
TT........t2==................
............==..........TT....
............==................
....t3......==@@>>......**....
............==..........TT....
....**......==................
TT..........==............TT..
............==......t4........
........**....................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **hands**

*no rule: «grass is sent handle from you» (terrain)*

## Turn 17

```text
Day 1, 08:22, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
................t1..XXXXDDXXXX
............==============....
TT........t2==................
............==..........TT....
............==................
....t3......==@@>>......**....
............==..........TT....
....**......==................
TT..........==............TT..
............==......t4........
........**....................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You reach out to grass…
- The world had no rule for: grass is sent handle from you
- You run a hand over grass.

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **wait 10**

## Turn 18

```text
Day 1, 08:32, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
................t1..XXXXDDXXXX
............==============....
TT........t2==................
............==..........TT....
............==................
....t3......==@@>>......**....
............==..........TT....
....**......==................
TT..........==............TT..
............==......t4........
........**....................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move right**

## Turn 19

```text
Day 1, 08:32, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..........TT......
..........==..................
..t3......==..@@>>....**......
..........==..........TT......
..**......==..................
..........==............TT....
..........==......t4..........
......**......................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move up**

## Turn 20

```text
Day 1, 08:32, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........**......XXXXXXXXXXXX
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..^^......TT......
..........==..@@..............
..t3......==..........**......
..........==..........TT......
..**......==..................
..........==............TT....
..........==......t4..........
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face left**

## Turn 21

```text
Day 1, 08:33, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........**......XXXXXXXXXXXX
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..........TT......
..........==<<@@..............
..t3......==..........**......
..........==..........TT......
..**......==..................
..........==............TT....
..........==......t4..........
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **(empty)** · *not an action*

## Turn 22

```text
Day 1, 08:33, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........**......XXXXXXXXXXXX
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..........TT......
..........==<<@@..............
..t3......==..........**......
..........==..........TT......
..**......==..................
..........==............TT....
..........==......t4..........
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- Not an action: 

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move down**

## Turn 23

```text
Day 1, 08:33, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..........TT......
..........==..................
..t3......==..@@......**......
..........==..vv......TT......
..**......==..................
..........==............TT....
..........==......t4..........
......**......................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing down
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face up**

## Turn 24

```text
Day 1, 08:33, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..........TT......
..........==..^^..............
..t3......==..@@......**......
..........==..........TT......
..**......==..................
..........==............TT....
..........==......t4..........
......**......................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face left**

## Turn 25

```text
Day 1, 08:33, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..........TT......
..........==..................
..t3......==<<@@......**......
..........==..........TT......
..**......==..................
..........==............TT....
..........==......t4..........
......**......................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face up**

## Turn 26

```text
Day 1, 08:33, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..........TT......
..........==..^^..............
..t3......==..@@......**......
..........==..........TT......
..**......==..................
..........==............TT....
..........==......t4..........
......**......................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move left**

## Turn 27

```text
Day 1, 08:33, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
................t1..XXXXDDXXXX
............==============....
TT........t2==................
............==..........TT....
............==................
....t3......<<@@........**....
............==..........TT....
....**......==................
TT..........==............TT..
............==......t4........
........**....................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with dirt road
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move up**

## Turn 28

```text
Day 1, 08:33, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
............**......XXXXXXXXXX
................t1..XXXXDDXXXX
............==============....
TT........t2==................
............==^^........TT....
............==@@..............
....t3......==..........**....
............==..........TT....
....**......==................
TT..........==............TT..
............==......t4........
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move right** · Note: «(dry) a note on turn 28.»

## Turn 29

```text
Day 1, 08:34, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........**......XXXXXXXXXXXX
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..........TT......
..........==..@@>>............
..t3......==..........**......
..........==..........TT......
..**......==..................
..........==............TT....
..........==......t4..........
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **hands**

*no rule: «grass is sent handle from you» (terrain)*

## Turn 30

```text
Day 1, 08:34, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........**......XXXXXXXXXXXX
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..........TT......
..........==..@@>>............
..t3......==..........**......
..........==..........TT......
..**......==..................
..........==............TT....
..........==......t4..........
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You reach out to grass…
- The world had no rule for: grass is sent handle from you
- You run a hand over grass.

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move down**

## Turn 31

```text
Day 1, 08:34, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..........TT......
..........==..................
..t3......==..@@......**......
..........==..vv......TT......
..**......==..................
..........==............TT....
..........==......t4..........
......**......................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing down
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move right**

## Turn 32

```text
Day 1, 08:34, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
............t1..XXXXDDXXXXXX..
........==============........
......t2==....................
........==..........TT........
........==..................c1
t3......==....@@>>..**........
........==..........TT........
**......==....................
........==............TT......
........==......t4............
....**........................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 chest
t2 sign
c1 slime — hostile
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move left**

## Turn 33

```text
Day 1, 08:34, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..........TT......
..........==..................
..t3......==<<@@......**......
..........==..........TT......
..**......==..................
..........==............TT....
..........==......t4..........
......**......................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move up**

## Turn 34

```text
Day 1, 08:35, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........**......XXXXXXXXXXXX
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..^^......TT......
..........==..@@..............
..t3......==..........**......
..........==..........TT......
..**......==..................
..........==............TT....
..........==......t4..........
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face right**

## Turn 35

```text
Day 1, 08:35, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........**......XXXXXXXXXXXX
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..........TT......
..........==..@@>>............
..t3......==..........**......
..........==..........TT......
..**......==..................
..........==............TT....
..........==......t4..........
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **hands** · Note: «(dry) a note on turn 35.»

*no rule: «grass is sent handle from you» (terrain)*

## Turn 36

```text
Day 1, 08:35, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........**......XXXXXXXXXXXX
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..........TT......
..........==..@@>>............
..t3......==..........**......
..........==..........TT......
..**......==..................
..........==............TT....
..........==......t4..........
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You reach out to grass…
- The world had no rule for: grass is sent handle from you
- You run a hand over grass.

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move down**

## Turn 37

```text
Day 1, 08:35, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..........TT......
..........==..................
..t3......==..@@......**......
..........==..vv......TT......
..**......==..................
..........==............TT....
..........==......t4..........
......**......................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing down
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move right**

## Turn 38

```text
Day 1, 08:35, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
............t1..XXXXDDXXXXXX..
........==============........
......t2==....................
........==..........TT........
........==..................c1
t3......==....@@>>..**........
........==..........TT........
**......==....................
........==............TT......
........==......t4............
....**........................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 chest
t2 sign
c1 slime — hostile
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **hands**

*no rule: «grass is sent handle from you» (terrain)*

## Turn 39

```text
Day 1, 08:35, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
............t1..XXXXDDXXXXXX..
........==============........
......t2==....................
........==..........TT........
........==..................c1
t3......==....@@>>..**........
........==..........TT........
**......==....................
........==............TT......
........==......t4............
....**........................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 chest
t2 sign
c1 slime — hostile
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You reach out to grass…
- The world had no rule for: grass is sent handle from you
- You run a hand over grass.

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face left**

## Turn 40

```text
Day 1, 08:35, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
............t1..XXXXDDXXXXXX..
........==============........
......t2==....................
........==..........TT........
........==..................c1
t3......==..<<@@....**........
........==..........TT........
**......==....................
........==............TT......
........==......t4............
....**........................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
t1 chest
t2 sign
c1 slime — hostile
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face right**

## Turn 41

```text
Day 1, 08:35, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
............t1..XXXXDDXXXXXX..
........==============........
......t2==....................
........==..........TT........
........==..................c1
t3......==....@@>>..**........
........==..........TT........
**......==....................
........==............TT......
........==......t4............
....**........................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 chest
t2 sign
c1 slime — hostile
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move left**

## Turn 42

```text
Day 1, 08:36, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..........TT......
..........==..................
..t3......==<<@@......**......
..........==..........TT......
..**......==..................
..........==............TT....
..........==......t4..........
......**......................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **hands** · Note: «(dry) a note on turn 42.»

*no rule: «grass is sent handle from you» (terrain)*

## Turn 43

```text
Day 1, 08:36, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..........TT......
..........==..................
..t3......==<<@@......**......
..........==..........TT......
..**......==..................
..........==............TT....
..........==......t4..........
......**......................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You reach out to grass…
- The world had no rule for: grass is sent handle from you
- You run a hand over grass.

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move right**

## Turn 44

```text
Day 1, 08:36, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
............t1..XXXXDDXXXXXX..
........==============........
......t2==....................
........==..........TT........
........==..................c1
t3......==....@@>>..**........
........==..........TT........
**......==....................
........==............TT......
........==......t4............
....**........................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 chest
t2 sign
c1 slime — hostile
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move up**

## Turn 45

```text
Day 1, 08:36, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
........**......XXXXXXXXXXXX..
............t1..XXXXDDXXXXXX..
........==============........
......t2==....................
........==....^^....TT........
........==....@@............c1
t3......==..........**........
........==..........TT........
**......==....................
........==............TT......
........==......t4............
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up
t1 chest
t2 sign
c1 slime — hostile
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move up**

## Turn 46

```text
Day 1, 08:36, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..P1............XXXXXXXXXXXX..
........**......XXXXXXXXXXXX..
............t1..XXXXDDXXXXXX..
........==============........
......t2==....^^..............
........==....@@....TT........
........==..................c1
t3......==..........**........
........==..........TT........
**......==....................
........==............TT......
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up
P1 Mira
t1 chest
t2 sign
c1 slime — hostile
t3 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face down**

## Turn 47

```text
Day 1, 08:36, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..P1............XXXXXXXXXXXX..
........**......XXXXXXXXXXXX..
............t1..XXXXDDXXXXXX..
........==============........
......t2==....................
........==....@@....TT........
........==....vv............c1
t3......==..........**........
........==..........TT........
**......==....................
........==............TT......
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing down
P1 Mira
t1 chest
t2 sign
c1 slime — hostile
t3 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **hands**

*no rule: «grass is sent handle from you» (terrain)*

## Turn 48

```text
Day 1, 08:37, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..P1............XXXXXXXXXXXX..
........**......XXXXXXXXXXXX..
............t1..XXXXDDXXXXXX..
........==============........
......t2==....................
........==....@@....TT........
........==....vv............c1
t3......==..........**........
........==..........TT........
**......==....................
........==............TT......
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing down
P1 Mira
t1 chest
t2 sign
c1 slime — hostile
t3 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You reach out to grass…
- The world had no rule for: grass is sent handle from you
- You run a hand over grass.

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **hands**

*no rule: «grass is sent handle from you» (terrain)*

## Turn 49

```text
Day 1, 08:37, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..P1............XXXXXXXXXXXX..
........**......XXXXXXXXXXXX..
............t1..XXXXDDXXXXXX..
........==============........
......t2==....................
........==....@@....TT........
........==....vv............c1
t3......==..........**........
........==..........TT........
**......==....................
........==............TT......
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing down
P1 Mira
t1 chest
t2 sign
c1 slime — hostile
t3 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You reach out to grass…
- The world had no rule for: grass is sent handle from you
- You run a hand over grass.

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move down** · Note: «(dry) a note on turn 49.»

## Turn 50

```text
Day 1, 08:37, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
........**......XXXXXXXXXXXX..
............t1..XXXXDDXXXXXX..
........==============........
......t2==....................
........==..........TT........
........==....@@............c1
t3......==....vv....**........
........==..........TT........
**......==....................
........==............TT......
........==......t4............
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing down
t1 chest
t2 sign
c1 slime — hostile
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **hands**

*no rule: «grass is sent handle from you» (terrain)*

## Turn 51

```text
Day 1, 08:37, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
........**......XXXXXXXXXXXX..
............t1..XXXXDDXXXXXX..
........==============........
......t2==....................
........==..........TT........
........==....@@............c1
t3......==....vv....**........
........==..........TT........
**......==....................
........==............TT......
........==......t4............
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing down
t1 chest
t2 sign
c1 slime — hostile
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You reach out to grass…
- The world had no rule for: grass is sent handle from you
- You run a hand over grass.

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move up**

## Turn 52

```text
Day 1, 08:37, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..P1............XXXXXXXXXXXX..
........**......XXXXXXXXXXXX..
............t1..XXXXDDXXXXXX..
........==============........
......t2==....^^..............
........==....@@....TT........
........==..................c1
t3......==..........**........
........==..........TT........
**......==....................
........==............TT......
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up
P1 Mira
t1 chest
t2 sign
c1 slime — hostile
t3 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move right**

## Turn 53

```text
Day 1, 08:37, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
P1............XXXXXXXXXXXX..TT
......**......XXXXXXXXXXXX..TT
..........t1..XXXXDDXXXXXX..TT
......==============........TT
....t2==....................TT
......==......@@>>TT........TT
......==..................c1TT
......==..........**........TT
......==..........TT........TT
......==....................TT
......==............TT......TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
P1 Mira
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move right**

## Turn 54

```text
Day 1, 08:37, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
............XXXXXXXXXXXX..TT
....**......XXXXXXXXXXXX..TT
........t1..XXXXDDXXXXXX..TT
....==============........TT
..t2==....................TT
....==........@@>>........TT
....==..................c1TT
....==..........**........TT
....==..........TT........TT
....==....................TT
....==............TT......TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: Punch tree
- hands: Interact with tree
- take: —
- put: —
- use: Punch tree
- self: —
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face down**

## Turn 55

```text
Day 1, 08:38, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
............XXXXXXXXXXXX..TT
....**......XXXXXXXXXXXX..TT
........t1..XXXXDDXXXXXX..TT
....==============........TT
..t2==....................TT
....==........@@TT........TT
....==........vv........c1TT
....==..........**........TT
....==..........TT........TT
....==....................TT
....==............TT......TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing down
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face left**

## Turn 56

```text
Day 1, 08:38, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
............XXXXXXXXXXXX..TT
....**......XXXXXXXXXXXX..TT
........t1..XXXXDDXXXXXX..TT
....==============........TT
..t2==....................TT
....==......<<@@TT........TT
....==..................c1TT
....==..........**........TT
....==..........TT........TT
....==....................TT
....==............TT......TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face right** · Note: «(dry) a note on turn 56.»

## Turn 57

```text
Day 1, 08:38, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
............XXXXXXXXXXXX..TT
....**......XXXXXXXXXXXX..TT
........t1..XXXXDDXXXXXX..TT
....==============........TT
..t2==....................TT
....==........@@>>........TT
....==..................c1TT
....==..........**........TT
....==..........TT........TT
....==....................TT
....==............TT......TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: Punch tree
- hands: Interact with tree
- take: —
- put: —
- use: Punch tree
- self: —
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **hands**

*no rule: «tree is sent handle from you» (terrain)*

## Turn 58

```text
Day 1, 08:38, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
............XXXXXXXXXXXX..TT
....**......XXXXXXXXXXXX..TT
........t1..XXXXDDXXXXXX..TT
....==============........TT
..t2==....................TT
....==........@@>>........TT
....==..................c1TT
....==..........**........TT
....==..........TT........TT
....==....................TT
....==............TT......TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You reach out to tree…
- The world had no rule for: tree is sent handle from you
- You run a hand over tree.

Journal:
- empty

Actions:
- primary: Punch tree
- hands: Interact with tree
- take: —
- put: —
- use: Punch tree
- self: —
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **hands**

*no rule: «tree is sent handle from you» (terrain)*

## Turn 59

```text
Day 1, 08:38, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
............XXXXXXXXXXXX..TT
....**......XXXXXXXXXXXX..TT
........t1..XXXXDDXXXXXX..TT
....==============........TT
..t2==....................TT
....==........@@>>........TT
....==..................c1TT
....==..........**........TT
....==..........TT........TT
....==....................TT
....==............TT......TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You reach out to tree…
- The world had no rule for: tree is sent handle from you
- You run a hand over tree.

Journal:
- empty

Actions:
- primary: Punch tree
- hands: Interact with tree
- take: —
- put: —
- use: Punch tree
- self: —
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face left**

## Turn 60

```text
Day 1, 08:38, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
............XXXXXXXXXXXX..TT
....**......XXXXXXXXXXXX..TT
........t1..XXXXDDXXXXXX..TT
....==============........TT
..t2==....................TT
....==......<<@@TT........TT
....==..................c1TT
....==..........**........TT
....==..........TT........TT
....==....................TT
....==............TT......TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face right**

## Turn 61

```text
Day 1, 08:38, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
............XXXXXXXXXXXX..TT
....**......XXXXXXXXXXXX..TT
........t1..XXXXDDXXXXXX..TT
....==============........TT
..t2==....................TT
....==........@@>>........TT
....==..................c1TT
....==..........**........TT
....==..........TT........TT
....==....................TT
....==............TT......TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: Punch tree
- hands: Interact with tree
- take: —
- put: —
- use: Punch tree
- self: —
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **hands**

*no rule: «tree is sent handle from you» (terrain)*

## Turn 62

```text
Day 1, 08:38, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
............XXXXXXXXXXXX..TT
....**......XXXXXXXXXXXX..TT
........t1..XXXXDDXXXXXX..TT
....==============........TT
..t2==....................TT
....==........@@>>........TT
....==..................c1TT
....==..........**........TT
....==..........TT........TT
....==....................TT
....==............TT......TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You reach out to tree…
- The world had no rule for: tree is sent handle from you
- You run a hand over tree.

Journal:
- empty

Actions:
- primary: Punch tree
- hands: Interact with tree
- take: —
- put: —
- use: Punch tree
- self: —
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face up**

## Turn 63

```text
Day 1, 08:38, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
............XXXXXXXXXXXX..TT
....**......XXXXXXXXXXXX..TT
........t1..XXXXDDXXXXXX..TT
....==============........TT
..t2==........^^..........TT
....==........@@TT........TT
....==..................c1TT
....==..........**........TT
....==..........TT........TT
....==....................TT
....==............TT......TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right blocked
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move left** · Note: «(dry) a note on turn 63.»

## Turn 64

```text
Day 1, 08:39, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
P1............XXXXXXXXXXXX..TT
......**......XXXXXXXXXXXX..TT
..........t1..XXXXDDXXXXXX..TT
......==============........TT
....t2==....................TT
......==....<<@@..TT........TT
......==..................c1TT
......==..........**........TT
......==..........TT........TT
......==....................TT
......==............TT......TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
P1 Mira
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **hands**

*no rule: «grass is sent handle from you» (terrain)*

## Turn 65

```text
Day 1, 08:39, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
P1............XXXXXXXXXXXX..TT
......**......XXXXXXXXXXXX..TT
..........t1..XXXXDDXXXXXX..TT
......==============........TT
....t2==....................TT
......==....<<@@..TT........TT
......==..................c1TT
......==..........**........TT
......==..........TT........TT
......==....................TT
......==............TT......TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
P1 Mira
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You reach out to grass…
- The world had no rule for: grass is sent handle from you
- You run a hand over grass.

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move left**

## Turn 66

```text
Day 1, 08:39, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..P1............XXXXXXXXXXXX..
........**......XXXXXXXXXXXX..
............t1..XXXXDDXXXXXX..
........==============........
......t2==....................
........==..<<@@....TT........
........==................c1..
t3......==..........**........
........==..........TT........
**......==....................
........==............TT......
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
P1 Mira
t1 chest
t2 sign
c1 slime — hostile
t3 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move right**

## Turn 67

```text
Day 1, 08:39, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
P1............XXXXXXXXXXXX..TT
......**......XXXXXXXXXXXX..TT
..........t1..XXXXDDXXXXXX..TT
......==============........TT
....t2==....................TT
......==......@@>>TT........TT
......==................c1..TT
......==..........**........TT
......==..........TT........TT
......==....................TT
......==............TT......TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
P1 Mira
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move up**

## Turn 68

```text
Day 1, 08:39, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
**............XXXXXXXXXXXXTTTT
P1............XXXXXXXXXXXX..TT
......**......XXXXXXXXXXXX..TT
..........t1..XXXXDDXXXXXX..TT
......========^^====........TT
....t2==......@@............TT
......==..........TT........TT
......==................c1..TT
......==..........**........TT
......==..........TT........TT
......==....................TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up
P1 Mira
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with dirt road
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move up**

## Turn 69

```text
Day 1, 08:39, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
**............XXXXXXXXXXXXTTTT
P1............XXXXXXXXXXXX..TT
......**......XXXXXXXXXXXX..TT
..........t1..^^XXDDXXXXXX..TT
......========@@====........TT
....t2==....................TT
......==..........TT........TT
......==................c1..TT
......==..........**........TT
......==..........TT........TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up
P1 Mira
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with wall
- take: —
- put: —
- use: —
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move left**

## Turn 70

```text
Day 1, 08:40, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
..**............XXXXXXXXXXXXTT
..P1............XXXXXXXXXXXX..
........**......XXXXXXXXXXXX..
............t1..XXXXDDXXXXXX..
........====<<@@======........
......t2==....................
........==..........TT........
........==................c1..
t3......==..........**........
........==..........TT........
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
P1 Mira
t1 chest
t2 sign
c1 slime — hostile
t3 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with dirt road
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move right** · Note: «(dry) a note on turn 70.»

## Turn 71

```text
Day 1, 08:40, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
**............XXXXXXXXXXXXTTTT
P1............XXXXXXXXXXXX..TT
......**......XXXXXXXXXXXX..TT
..........t1..XXXXDDXXXXXX..TT
......========@@>>==........TT
....t2==....................TT
......==..........TT........TT
......==................c1..TT
......==..........**........TT
......==..........TT........TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
P1 Mira
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with dirt road
- take: —
- put: —
- use: —
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move right**

## Turn 72

```text
Day 1, 08:40, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
TTTTTTTTTTTTTTTTTTTTTTTTTTTT
............XXXXXXXXXXXXTTTT
............XXXXXXXXXXXX..TT
....**......XXXXXXXXXXXX..TT
........t1..XXXXDDXXXXXX..TT
....==========@@>>........TT
..t2==....................TT
....==..........TT........TT
....==................c1..TT
....==..........**........TT
....==..........TT........TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with dirt road
- take: —
- put: —
- use: —
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face down**

## Turn 73

```text
Day 1, 08:40, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
TTTTTTTTTTTTTTTTTTTTTTTTTTTT
............XXXXXXXXXXXXTTTT
............XXXXXXXXXXXX..TT
....**......XXXXXXXXXXXX..TT
........t1..XXXXDDXXXXXX..TT
....==========@@==........TT
..t2==........vv..........TT
....==..........TT........TT
....==................c1..TT
....==..........**........TT
....==..........TT........TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing down
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face left**

## Turn 74

```text
Day 1, 08:40, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
TTTTTTTTTTTTTTTTTTTTTTTTTTTT
............XXXXXXXXXXXXTTTT
............XXXXXXXXXXXX..TT
....**......XXXXXXXXXXXX..TT
........t1..XXXXDDXXXXXX..TT
....========<<@@==........TT
..t2==....................TT
....==..........TT........TT
....==................c1..TT
....==..........**........TT
....==..........TT........TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with dirt road
- take: —
- put: —
- use: —
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **wait 10**

## Turn 75

```text
Day 1, 08:50, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
TTTTTTTTTTTTTTTTTTTTTTTTTTTT
............XXXXXXXXXXXXTTTT
............XXXXXXXXXXXX..TT
....**......XXXXXXXXXXXX..TT
........t1..XXXXDDXXXXXX..TT
....========<<@@==........TT
..t2==....................TT
....==..........TT........TT
....==..............c1....TT
....==..........**........TT
....==..........TT........TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with dirt road
- take: —
- put: —
- use: —
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face down**

## Turn 76

```text
Day 1, 08:50, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
TTTTTTTTTTTTTTTTTTTTTTTTTTTT
............XXXXXXXXXXXXTTTT
............XXXXXXXXXXXX..TT
....**......XXXXXXXXXXXX..TT
........t1..XXXXDDXXXXXX..TT
....==========@@==........TT
..t2==........vv..........TT
....==..........TT........TT
....==..............c1....TT
....==..........**........TT
....==..........TT........TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing down
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with grass
- take: —
- put: —
- use: —
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move left**

## Turn 77

```text
Day 1, 08:51, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
**............XXXXXXXXXXXXTTTT
..............XXXXXXXXXXXX..TT
P1....**......XXXXXXXXXXXX..TT
..........t1..XXXXDDXXXXXX..TT
......======<<@@====........TT
....t2==....................TT
......==..........TT........TT
......==..............c1....TT
......==..........**........TT
......==..........TT........TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
P1 Mira
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with dirt road
- take: —
- put: —
- use: —
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face up** · Note: «(dry) a note on turn 77.»

## Turn 78

```text
Day 1, 08:51, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
**............XXXXXXXXXXXXTTTT
..............XXXXXXXXXXXX..TT
P1....**......XXXXXXXXXXXX..TT
..........t1..^^XXDDXXXXXX..TT
......========@@====........TT
....t2==....................TT
......==..........TT........TT
......==..............c1....TT
......==..........**........TT
......==..........TT........TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up
P1 Mira
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with wall
- take: —
- put: —
- use: —
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face left**

## Turn 79

```text
Day 1, 08:51, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
**............XXXXXXXXXXXXTTTT
..............XXXXXXXXXXXX..TT
P1....**......XXXXXXXXXXXX..TT
..........t1..XXXXDDXXXXXX..TT
......======<<@@====........TT
....t2==....................TT
......==..........TT........TT
......==..............c1....TT
......==..........**........TT
......==..........TT........TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
P1 Mira
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with dirt road
- take: —
- put: —
- use: —
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move right**

## Turn 80

```text
Day 1, 08:51, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
TTTTTTTTTTTTTTTTTTTTTTTTTTTT
............XXXXXXXXXXXXTTTT
............XXXXXXXXXXXX..TT
....**......XXXXXXXXXXXX..TT
........t1..XXXXDDXXXXXX..TT
....==========@@>>........TT
..t2==....................TT
....==..........TT........TT
....==..............c1....TT
....==..........**........TT
....==..........TT........TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
t1 chest
t2 sign
c1 slime — hostile

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with dirt road
- take: —
- put: —
- use: —
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **hands**

*no rule: «dirt road is sent handle from you» (terrain)*

