# Phase B · opus · episode 2 (DRY)

`claude-opus-5-5` through OpenRouter · 80 turns · stages {}. Each turn: the observation the model was sent, then its action line and Note (the reasoning field, where there is one, is kept in the log and not shown).

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

> **move right**

## Turn 3

```text
Day 1, 08:00, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............**......XXXXXXXX
..................t1..XXXXDDXX
..............==============..
..TT........t2==..............
..............==..........TT..
..............@@>>............
......t3......==..........**..
..............==..........TT..
......**......==..............
..TT..........==............TT
..............==......t4......
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

> **face up**

## Turn 4

```text
Day 1, 08:00, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............**......XXXXXXXX
..................t1..XXXXDDXX
..............==============..
..TT........t2==..............
..............^^..........TT..
..............@@..............
......t3......==..........**..
..............==..........TT..
......**......==..............
..TT..........==............TT
..............==......t4......
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
- hands: Interact with dirt road
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face left**

## Turn 5

```text
Day 1, 08:00, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............**......XXXXXXXX
..................t1..XXXXDDXX
..............==============..
..TT........t2==..............
..............==..........TT..
............<<@@..............
......t3......==..........**..
..............==..........TT..
......**......==..............
..TT..........==............TT
..............==......t4......
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

> **move down**

## Turn 6

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

> **face up**

## Turn 7

```text
Day 1, 08:01, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..................t1..XXXXDDXX
..............==============..
..TT........t2==..............
..............==..........TT..
..............^^..............
......t3......@@..........**..
..............==..........TT..
......**......==..............
..TT..........==............TT
..............==......t4......
..........**..................
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
- hands: Interact with dirt road
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face down** · Note: «(dry) a note on turn 7.»

## Turn 8

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

> **move left**

## Turn 9

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

> **hands**

*no rule: «grass is sent handle from you» (terrain)*

## Turn 10

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

## Turn 11

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

> **move left**

## Turn 12

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

> **face up**

## Turn 13

```text
Day 1, 08:02, sun — The Glade

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

> ****hands**** · *not an action*

## Turn 14

```text
Day 1, 08:02, sun — The Glade

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

> **move up** · Note: «(dry) a note on turn 14.»

## Turn 15

```text
Day 1, 08:02, sun — The Glade

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

> **face right**

## Turn 16

```text
Day 1, 08:02, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
................**......XXXXXX
....................t1..XXXXDD
................==============
....TT........t2==............
................==..........TT
..............@@>>............
~~......t3......==..........**
................==..........TT
........**......==............
....TT..........==............
................==......t4....
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall, ~~ water
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
- hands: Interact with dirt road
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move right**

## Turn 17

```text
Day 1, 08:02, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............**......XXXXXXXX
..................t1..XXXXDDXX
..............==============..
..TT........t2==..............
..............==..........TT..
..............@@>>............
......t3......==..........**..
..............==..........TT..
......**......==..............
..TT..........==............TT
..............==......t4......
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

> **move down**

## Turn 18

```text
Day 1, 08:02, sun — The Glade

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

> **move up**

## Turn 19

```text
Day 1, 08:03, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............**......XXXXXXXX
..................t1..XXXXDDXX
..............==============..
..TT........t2==..............
..............^^..........TT..
..............@@..............
......t3......==..........**..
..............==..........TT..
......**......==..............
..TT..........==............TT
..............==......t4......
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
- hands: Interact with dirt road
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face down**

## Turn 20

```text
Day 1, 08:03, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............**......XXXXXXXX
..................t1..XXXXDDXX
..............==============..
..TT........t2==..............
..............==..........TT..
..............@@..............
......t3......vv..........**..
..............==..........TT..
......**......==..............
..TT..........==............TT
..............==......t4......
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

> **move up**

## Turn 21

```text
Day 1, 08:03, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..TT....P1............XXXXXXXX
..............**......XXXXXXXX
..................t1..XXXXDDXX
..............==============..
..TT........t2^^..............
..............@@..........TT..
..............==..............
......t3......==..........**..
..............==..........TT..
......**......==..............
..TT..........==............TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up
P1 Mira
t1 chest
t2 sign
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

> **(empty)** · *not an action*

## Turn 22

```text
Day 1, 08:03, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..TT....P1............XXXXXXXX
..............**......XXXXXXXX
..................t1..XXXXDDXX
..............==============..
..TT........t2^^..............
..............@@..........TT..
..............==..............
......t3......==..........**..
..............==..........TT..
......**......==..............
..TT..........==............TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up
P1 Mira
t1 chest
t2 sign
t3 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- Not an action: 

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

> **move right**

## Turn 23

```text
Day 1, 08:03, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
TT....P1............XXXXXXXXXX
............**......XXXXXXXXXX
................t1..XXXXDDXXXX
............==============....
TT........t2==................
............==@@>>......TT....
............==................
....t3......==..........**....
............==..........TT....
....**......==................
TT..........==............TT..
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
P1 Mira
t1 chest
t2 sign
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

## Turn 24

```text
Day 1, 08:03, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....P1............XXXXXXXXXXXX
..........**......XXXXXXXXXXXX
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..@@>>....TT......
..........==..................
..t3......==..........**......
..........==..........TT....c1
..**......==..................
..........==............TT....
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
P1 Mira
t1 chest
t2 sign
t3 Stone
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

## Turn 25

```text
Day 1, 08:03, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..P1............XXXXXXXXXXXX..
........**......XXXXXXXXXXXX..
............t1..XXXXDDXXXXXX..
........==============........
......t2==....................
........==....@@>>..TT........
........==....................
t3......==..........**........
........==..........TT....c1..
**......==....................
........==............TT......
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
P1 Mira
t1 chest
t2 sign
t3 Stone
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

> **move down**

## Turn 26

```text
Day 1, 08:04, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
........**......XXXXXXXXXXXX..
............t1..XXXXDDXXXXXX..
........==============........
......t2==....................
........==..........TT........
........==....@@..............
t3......==....vv....**........
........==..........TT....c1..
**......==....................
........==............TT......
........==......t4............
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing down
t1 chest
t2 sign
t3 Stone
c1 slime — hostile
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

## Turn 27

```text
Day 1, 08:14, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
........**......XXXXXXXXXXXX..
............t1..XXXXDDXXXXXX..
........==============........
......t2==....................
........==..........TT........
........==....@@..............
t3......==....vv....**......c1
........==..........TT........
**......==....................
........==............TT......
........==......t4............
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing down
t1 chest
t2 sign
t3 Stone
c1 slime — hostile
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

## Turn 28

```text
Day 1, 08:14, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
........**......XXXXXXXXXXXX..
............t1..XXXXDDXXXXXX..
........==============........
......t2==....................
........==..........TT........
........==....@@..............
t3......==....vv....**......c1
........==..........TT........
**......==....................
........==............TT......
........==......t4............
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing down
t1 chest
t2 sign
t3 Stone
c1 slime — hostile
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

> **move down** · Note: «(dry) a note on turn 28.»

## Turn 29

```text
Day 1, 08:14, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
............t1..XXXXDDXXXXXX..
........==============........
......t2==....................
........==..........TT........
........==....................
t3......==....@@....**......c1
........==....vv....TT........
**......==....................
........==............TT......
........==......t4............
....**........................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing down
t1 chest
t2 sign
t3 Stone
c1 slime — hostile
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

## Turn 30

```text
Day 1, 08:14, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
............t1..XXXXDDXXXXXX..
........==============........
......t2==....................
........==..........TT........
........==....^^..............
t3......==....@@....**......c1
........==..........TT........
**......==....................
........==............TT......
........==......t4............
....**........................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up
t1 chest
t2 sign
t3 Stone
c1 slime — hostile
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

## Turn 31

```text
Day 1, 08:14, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
........**......XXXXXXXXXXXX..
............t1..XXXXDDXXXXXX..
........==============........
......t2==....................
........==....^^....TT........
........==....@@..............
t3......==..........**......c1
........==..........TT........
**......==....................
........==............TT......
........==......t4............
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up
t1 chest
t2 sign
t3 Stone
c1 slime — hostile
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

## Turn 32

```text
Day 1, 08:14, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
........**......XXXXXXXXXXXX..
............t1..XXXXDDXXXXXX..
........==============........
......t2==....................
........==..........TT........
........==....@@..............
t3......==....vv....**......c1
........==..........TT........
**......==....................
........==............TT......
........==......t4............
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing down
t1 chest
t2 sign
t3 Stone
c1 slime — hostile
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

## Turn 33

```text
Day 1, 08:15, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
........**......XXXXXXXXXXXX..
............t1..XXXXDDXXXXXX..
........==============........
......t2==....................
........==..........TT........
........==..<<@@..............
t3......==..........**......c1
........==..........TT........
**......==....................
........==............TT......
........==......t4............
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing left
t1 chest
t2 sign
t3 Stone
c1 slime — hostile
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

## Turn 34

```text
Day 1, 08:25, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
........**......XXXXXXXXXXXX..
............t1..XXXXDDXXXXXX..
........==============........
......t2==....................
........==..........TT........
........==..<<@@............c1
t3......==..........**........
........==..........TT........
**......==....................
........==............TT......
........==......t4............
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

> **move left**

## Turn 35

```text
Day 1, 08:25, sun — The Glade

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

> **move down** · Note: «(dry) a note on turn 35.»

## Turn 36

```text
Day 1, 08:25, sun — The Glade

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

## Turn 37

```text
Day 1, 08:25, sun — The Glade

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

> **move down**

## Turn 38

```text
Day 1, 08:25, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........==============......
........t1==..................
..........==..........TT......
..........==..................
..t2......==..........**......
..........==..@@......TT......
..**......==..vv..............
..........==............TT....
..........==......t3..........
......**......................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing down
t1 sign
t2 Stone
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

> **face right**

## Turn 39

```text
Day 1, 08:25, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........==============......
........t1==..................
..........==..........TT......
..........==..................
..t2......==..........**......
..........==..@@>>....TT......
..**......==..................
..........==............TT....
..........==......t3..........
......**......................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing right
t1 sign
t2 Stone
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

## Turn 40

```text
Day 1, 08:26, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
........==============........
......t1==....................
........==..........TT........
........==..................c1
t2......==..........**........
........==....@@>>..TT........
**......==....................
........==............TT......
........==......t3............
....**........................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing right
t1 sign
c1 slime — hostile
t2 Stone
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

> **move left**

## Turn 41

```text
Day 1, 08:26, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........==============......
........t1==..................
..........==..........TT......
..........==..................
..t2......==..........**......
..........==<<@@......TT......
..**......==..................
..........==............TT....
..........==......t3..........
......**......................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing left
t1 sign
t2 Stone
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

> **face up**

## Turn 42

```text
Day 1, 08:26, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........==============......
........t1==..................
..........==..........TT......
..........==..................
..t2......==..^^......**......
..........==..@@......TT......
..**......==..................
..........==............TT....
..........==......t3..........
......**......................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing up
t1 sign
t2 Stone
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

> **wait 10** · Note: «(dry) a note on turn 42.»

## Turn 43

```text
Day 1, 08:36, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........==============......
........t1==..................
..........==..........TT......
..........==..................
..t2......==..^^......**......
..........==..@@......TT......
..**......==..................
..........==............TT....
..........==......t3..........
......**......................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing up
t1 sign
t2 Stone
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

> **face left**

## Turn 44

```text
Day 1, 08:36, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........==============......
........t1==..................
..........==..........TT......
..........==..................
..t2......==..........**......
..........==<<@@......TT......
..**......==..................
..........==............TT....
..........==......t3..........
......**......................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing left
t1 sign
t2 Stone
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

> **face right**

## Turn 45

```text
Day 1, 08:36, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........==============......
........t1==..................
..........==..........TT......
..........==..................
..t2......==..........**......
..........==..@@>>....TT......
..**......==..................
..........==............TT....
..........==......t3..........
......**......................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing right
t1 sign
t2 Stone
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

> **face left**

## Turn 46

```text
Day 1, 08:36, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........==============......
........t1==..................
..........==..........TT......
..........==..................
..t2......==..........**......
..........==<<@@......TT......
..**......==..................
..........==............TT....
..........==......t3..........
......**......................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing left
t1 sign
t2 Stone
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
..........==============......
........t1==..................
..........==..........TT......
..........==..................
..t2......==..........**......
..........==..@@......TT......
..**......==..vv..............
..........==............TT....
..........==......t3..........
......**......................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing down
t1 sign
t2 Stone
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

> **wait 10**

## Turn 48

```text
Day 1, 08:46, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........==============......
........t1==..................
..........==..........TT......
..........==..............c1..
..t2......==..........**......
..........==..@@......TT......
..**......==..vv..............
..........==............TT....
..........==......t3..........
......**......................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing down
t1 sign
c1 slime — hostile
t2 Stone
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

> **face right**

## Turn 49

```text
Day 1, 08:47, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........==============......
........t1==..................
..........==..........TT......
..........==..............c1..
..t2......==..........**......
..........==..@@>>....TT......
..**......==..................
..........==............TT....
..........==......t3..........
......**......................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing right
t1 sign
c1 slime — hostile
t2 Stone
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

> **face down** · Note: «(dry) a note on turn 49.»

## Turn 50

```text
Day 1, 08:47, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........==============......
........t1==..................
..........==..........TT......
..........==..............c1..
..t2......==..........**......
..........==..@@......TT......
..**......==..vv..............
..........==............TT....
..........==......t3..........
......**......................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing down
t1 sign
c1 slime — hostile
t2 Stone
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

> **face right**

## Turn 51

```text
Day 1, 08:47, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........==============......
........t1==..................
..........==..........TT......
..........==..............c1..
..t2......==..........**......
..........==..@@>>....TT......
..**......==..................
..........==............TT....
..........==......t3..........
......**......................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing right
t1 sign
c1 slime — hostile
t2 Stone
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

> **face up**

## Turn 52

```text
Day 1, 08:47, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........==============......
........t1==..................
..........==..........TT......
..........==..............c1..
..t2......==..^^......**......
..........==..@@......TT......
..**......==..................
..........==............TT....
..........==......t3..........
......**......................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing up
t1 sign
c1 slime — hostile
t2 Stone
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

> **wait 10**

## Turn 53

```text
Day 1, 08:57, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........==============......
........t1==..................
..........==..........TT......
..........==..................
..t2......==..^^......**..c1..
..........==..@@......TT......
..**......==..................
..........==............TT....
..........==......t3..........
......**......................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing up
t1 sign
t2 Stone
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

> **move up**

## Turn 54

```text
Day 1, 08:57, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..........TT......
..........==..^^..............
..t3......==..@@......**..c1..
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
c1 slime — hostile
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

## Turn 55

```text
Day 1, 08:57, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
................t1..XXXXDDXXXX
............==============....
TT........t2==................
............==..........TT....
............==................
....t3......<<@@........**..c1
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
c1 slime — hostile
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

> **hands**

*no rule: «dirt road is sent handle from you» (terrain)*

## Turn 56

```text
Day 1, 08:58, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
................t1..XXXXDDXXXX
............==============....
TT........t2==................
............==..........TT....
............==................
....t3......<<@@........**..c1
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
c1 slime — hostile
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You reach out to dirt road…
- The world had no rule for: dirt road is sent handle from you
- You run a hand over dirt road.

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

> **hands** · Note: «(dry) a note on turn 56.»

*no rule: «dirt road is sent handle from you» (terrain)*

## Turn 57

```text
Day 1, 08:58, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
................t1..XXXXDDXXXX
............==============....
TT........t2==................
............==..........TT....
............==................
....t3......<<@@........**..c1
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
c1 slime — hostile
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You reach out to dirt road…
- The world had no rule for: dirt road is sent handle from you
- You run a hand over dirt road.

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

> **hands**

*no rule: «dirt road is sent handle from you» (terrain)*

## Turn 58

```text
Day 1, 08:58, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
................t1..XXXXDDXXXX
............==============....
TT........t2==................
............==..........TT....
............==................
....t3......<<@@........**..c1
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
c1 slime — hostile
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You reach out to dirt road…
- The world had no rule for: dirt road is sent handle from you
- You run a hand over dirt road.

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

> **move left**

## Turn 59

```text
Day 1, 08:58, sun — The Glade

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

> **face right**

## Turn 60

```text
Day 1, 08:58, sun — The Glade

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

> **face up**

## Turn 61

```text
Day 1, 08:58, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..................t1..XXXXDDXX
..............==============..
..TT........t2==..............
..............==..........TT..
..............^^..............
......t3......@@..........**..
..............==..........TT..
......**......==..............
..TT..........==............TT
..............==......t4......
..........**..................
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
- hands: Interact with dirt road
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move down**

## Turn 62

```text
Day 1, 08:58, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............==============..
..TT........t1==..............
..............==..........TT..
..............==..............
......t2......==..........**..
..............@@..........TT..
......**......vv..............
..TT..........==............TT
..............==......t3......
..........**..................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing down
t1 sign
t2 Stone
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

> **move up**

## Turn 63

```text
Day 1, 08:59, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..................t1..XXXXDDXX
..............==============..
..TT........t2==..............
..............==..........TT..
..............^^..............
......t3......@@..........**..
..............==..........TT..
......**......==..............
..TT..........==............TT
..............==......t4......
..........**..................
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
- hands: Interact with dirt road
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **hands** · Note: «(dry) a note on turn 63.»

*no rule: «dirt road is sent handle from you» (terrain)*

## Turn 64

```text
Day 1, 08:59, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..................t1..XXXXDDXX
..............==============..
..TT........t2==..............
..............==..........TT..
..............^^..............
......t3......@@..........**..
..............==..........TT..
......**......==..............
..TT..........==............TT
..............==......t4......
..........**..................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You reach out to dirt road…
- The world had no rule for: dirt road is sent handle from you
- You run a hand over dirt road.

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

> **face right**

## Turn 65

```text
Day 1, 08:59, sun — The Glade

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

## Turn 66

```text
Day 1, 08:59, sun — The Glade

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

> **face right**

## Turn 67

```text
Day 1, 08:59, sun — The Glade

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

> **move down**

## Turn 68

```text
Day 1, 08:59, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............==============..
..TT........t1==..............
..............==..........TT..
..............==..............
......t2......==..........**..
..............@@..........TT..
......**......vv..............
..TT..........==............TT
..............==......t3......
..........**..................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing down
t1 sign
t2 Stone
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

> **move down**

## Turn 69

```text
Day 1, 08:59, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..TT........t1==..............
..............==..........TT..
..............==..............
......t2......==..........**..
..............==..........TT..
......**......@@..............
..TT..........vv............TT
..............==......t3......
..........**..................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT

Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing down
t1 sign
t2 Stone
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

> **wait 10**

## Turn 70

```text
Day 1, 09:09, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..TT........t1==..............
..............==..........TT..
..............==..............
......t2......==..........**..
..............==..........TT..
......**......@@..............
..TT..........vv............TT
..............==......t3......
..........**..................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT

Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing down
t1 sign
t2 Stone
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

> **face right** · Note: «(dry) a note on turn 70.»

## Turn 71

```text
Day 1, 09:09, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..TT........t1==..............
..............==..........TT..
..............==..............
......t2......==..........**..
..............==..........TT..
......**......@@>>............
..TT..........==............TT
..............==......t3......
..........**..................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT

Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing right
t1 sign
t2 Stone
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

> **move left**

## Turn 72

```text
Day 1, 09:10, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....TT........t1==............
................==..........TT
................==............
~~......t2......==..........**
................==..........TT
........**..<<@@==............
....TT..........==............
................==......t3....
............**................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT

Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing left
t1 sign
t2 Stone
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

## Turn 73

```text
Day 1, 09:10, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..TT........t1==..............
..............==..........TT..
..............==..............
......t2......==..........**..
..............==..........TT..
......**......@@>>............
..TT..........==............TT
..............==......t3......
..........**..................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT

Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing right
t1 sign
t2 Stone
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

> **move up**

## Turn 74

```text
Day 1, 09:10, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............==============..
..TT........t1==..............
..............==..........TT..
..............==..............
......t2......^^..........**..
..............@@..........TT..
......**......==..............
..TT..........==............TT
..............==......t3......
..........**..................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing up
t1 sign
t2 Stone
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

> **face right**

## Turn 75

```text
Day 1, 09:10, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............==============..
..TT........t1==..............
..............==..........TT..
..............==..............
......t2......==..........**..
..............@@>>........TT..
......**......==..............
..TT..........==............TT
..............==......t3......
..........**..................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing right
t1 sign
t2 Stone
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

> **wait 10**

## Turn 76

```text
Day 1, 09:20, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............==============..
..TT........t1==..............
..............==..........TT..
..............==..............
......t2......==..........**..
..............@@>>........TT..
......**......==..............
..TT..........==............TT
..............==......t3......
..........**..................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing right
t1 sign
t2 Stone
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

> **wait 10**

## Turn 77

```text
Day 1, 09:30, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............==============..
..TT........t1==..............
..............==..........TT..
..............==..............
......t2......==..........**c1
..............@@>>........TT..
......**......==..............
..TT..........==............TT
..............==......t3......
..........**..................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing right
t1 sign
t2 Stone
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

> **move up** · Note: «(dry) a note on turn 77.»

## Turn 78

```text
Day 1, 09:31, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..................t1..XXXXDDXX
..............==============..
..TT........t2==..............
..............==..........TT..
..............^^..............
......t3......@@..........**c1
..............==..........TT..
......**......==..............
..TT..........==............TT
..............==......t4......
..........**..................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up
t1 chest
t2 sign
t3 Stone
c1 slime — hostile
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

> **face right**

## Turn 79

```text
Day 1, 09:31, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..................t1..XXXXDDXX
..............==============..
..TT........t2==..............
..............==..........TT..
..............==..............
......t3......@@>>........**c1
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
c1 slime — hostile
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

## Turn 80

```text
Day 1, 09:31, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..................t1..XXXXDDXX
..............==============..
..TT........t2==..............
..............==..........TT..
..............^^..............
......t3......@@..........**c1
..............==..........TT..
......**......==..............
..TT..........==............TT
..............==......t4......
..........**..................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up
t1 chest
t2 sign
t3 Stone
c1 slime — hostile
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

> **hands**

*no rule: «dirt road is sent handle from you» (terrain)*

