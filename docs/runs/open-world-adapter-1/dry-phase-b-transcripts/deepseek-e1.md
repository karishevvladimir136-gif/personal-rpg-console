# Phase B · deepseek · episode 1 (DRY)

`deepseek/deepseek-v4-pro-0813` on DeepInfra through OpenRouter · 80 turns · stages {}. Each turn: the observation the model was sent, then its action line and Note (the reasoning field, where there is one, is kept in the log and not shown).

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

> **move up**

## Turn 4

```text
Day 1, 08:00, sun — The Glade

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

> **move left**

## Turn 5

```text
Day 1, 08:01, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....TT....P1............XXXXXX
................**......XXXXXX
....................t1..XXXXDD
................==============
....TT........t2==............
............<<@@==..........TT
................==............
~~......t3......==..........**
................==..........TT
........**......==............
....TT..........==............
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall, ~~ water
@@ You — facing left
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
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move down**

## Turn 6

```text
Day 1, 08:01, sun — The Glade

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

> **face up**

## Turn 7

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

> **move down** · Note: «(dry) a note on turn 7.»

## Turn 8

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

> **move down**

## Turn 10

```text
Day 1, 08:01, sun — The Glade

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

> **move left**

## Turn 11

```text
Day 1, 08:02, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
................==============
....TT........t1==............
................==..........TT
................==............
~~......t2......==..........**
............<<@@==..........TT
........**......==............
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

> **move up**

## Turn 12

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

> **move left**

## Turn 13

```text
Day 1, 08:02, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
TT....................t1..XXXX
..................============
......TT........t2==..........
..................==..........
~~................==..........
~~~~......t3<<@@..==..........
~~................==..........
..........**......==..........
......TT..........==..........
..................==......t4..
..............**..............
Terrain: ** flowers, .. grass, == path, TT tree, XX wall, ~~ water
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
Day 1, 08:02, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
TT....................t1..XXXX
..................============
......TT........t2==..........
..................==..........
~~................==..........
~~~~......t3<<@@..==..........
~~................==..........
..........**......==..........
......TT..........==..........
..................==......t4..
..............**..............
Terrain: ** flowers, .. grass, == path, TT tree, XX wall, ~~ water
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

> **move up** · Note: «(dry) a note on turn 14.»

## Turn 15

```text
Day 1, 08:02, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..................**......XXXX
TT....................t1..XXXX
..................============
......TT........t2==..........
..............^^..==..........
~~............@@..==..........
~~~~......t3......==..........
~~................==..........
..........**......==..........
......TT..........==..........
..................==......t4..
Terrain: ** flowers, .. grass, == path, TT tree, XX wall, ~~ water
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

> **hands**

*no rule: «grass is sent handle from you» (terrain)*

## Turn 16

```text
Day 1, 08:02, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..................**......XXXX
TT....................t1..XXXX
..................============
......TT........t2==..........
..............^^..==..........
~~............@@..==..........
~~~~......t3......==..........
~~................==..........
..........**......==..........
......TT..........==..........
..................==......t4..
Terrain: ** flowers, .. grass, == path, TT tree, XX wall, ~~ water
@@ You — facing up
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

## Turn 17

```text
Day 1, 08:03, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
TT....................t1..XXXX
..................============
......TT........t2==..........
..................==..........
~~................==..........
~~~~......t3..@@..==..........
~~............vv..==..........
..........**......==..........
......TT..........==..........
..................==......t4..
..............**..............
Terrain: ** flowers, .. grass, == path, TT tree, XX wall, ~~ water
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

> **move left**

## Turn 18

```text
Day 1, 08:03, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..TT....................t1..XX
....................==========
........TT........t2==........
....................==........
~~~~................==........
~~~~~~......t3@@....==........
~~~~................==........
............**......==........
........TT..........==........
....................==......t4
................**............
Terrain: ** flowers, .. grass, == path, TT tree, XX wall, ~~ water
@@ You — facing left (in front: t3)
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
- hands: Take Stone
- take: Take Stone
- put: —
- use: Punch Stone
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move down**

## Turn 19

```text
Day 1, 08:03, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....................==========
........TT........t1==........
....................==........
~~~~................==........
~~~~~~......t2......==........
~~~~..........@@....==........
............**vv....==........
........TT..........==........
....................==......t3
................**............
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
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

> **hands**

*no rule: «grass is sent handle from you» (terrain)*

## Turn 20

```text
Day 1, 08:03, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....................==========
........TT........t1==........
....................==........
~~~~................==........
~~~~~~......t2......==........
~~~~..........@@....==........
............**vv....==........
........TT..........==........
....................==......t3
................**............
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing down
t1 sign
t2 Stone
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

## Turn 21

```text
Day 1, 08:03, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....................==========
........TT........t1==........
....................==........
~~~~................==........
~~~~~~......t2......==........
~~~~..........@@....==........
............**vv....==........
........TT..........==........
....................==......t3
................**............
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing down
t1 sign
t2 Stone
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

> **(empty)** · *not an action*

## Turn 22

```text
Day 1, 08:03, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....................==========
........TT........t1==........
....................==........
~~~~................==........
~~~~~~......t2......==........
~~~~..........@@....==........
............**vv....==........
........TT..........==........
....................==......t3
................**............
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing down
t1 sign
t2 Stone
t3 Stone

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

> **face right**

## Turn 23

```text
Day 1, 08:03, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....................==========
........TT........t1==........
....................==........
~~~~................==........
~~~~~~......t2......==........
~~~~..........@@>>..==........
............**......==........
........TT..........==........
....................==......t3
................**............
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
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

## Turn 24

```text
Day 1, 08:13, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....................==========
........TT........t1==........
....................==........
~~~~................==........
~~~~~~......t2......==........
~~~~..........@@>>..==........
............**......==........
........TT..........==........
....................==......t3
................**............
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
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

## Turn 25

```text
Day 1, 08:14, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
......................========
..........TT........t1==......
......................==......
~~~~~~................==......
~~~~~~~~......t2......==......
~~~~~~......<<@@......==......
..............**......==......
..........TT..........==......
......................==......
..................**..........
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing left
t1 sign
t2 Stone

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

## Turn 26

```text
Day 1, 08:14, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
......................========
..........TT........t1==......
......................==......
~~~~~~................==......
~~~~~~~~......t2......==......
~~~~~~........@@......==......
..............vv......==......
..........TT..........==......
......................==......
..................**..........
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing down
t1 sign
t2 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with flowers
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **hands**

*no rule: «flowers is sent handle from you» (terrain)*

## Turn 27

```text
Day 1, 08:14, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
......................========
..........TT........t1==......
......................==......
~~~~~~................==......
~~~~~~~~......t2......==......
~~~~~~........@@......==......
..............vv......==......
..........TT..........==......
......................==......
..................**..........
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing down
t1 sign
t2 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You reach out to flowers…
- The world had no rule for: flowers is sent handle from you
- You run a hand over flowers.

Journal:
- empty

Actions:
- primary: —
- hands: Interact with flowers
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move left**

## Turn 28

```text
Day 1, 08:14, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
TT......................======
TT..........TT........t1==....
TT......................==....
TT~~~~~~................==....
TT~~~~~~~~......t2......==....
TT~~~~~~....<<@@........==....
TT..............**......==....
TT..........TT..........==....
TT......................==....
TT..................**........
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing left
t1 sign
t2 Stone

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

> **face right** · Note: «(dry) a note on turn 28.»

## Turn 29

```text
Day 1, 08:14, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
TT......................======
TT..........TT........t1==....
TT......................==....
TT~~~~~~................==....
TT~~~~~~~~......t2......==....
TT~~~~~~......@@>>......==....
TT..............**......==....
TT..........TT..........==....
TT......................==....
TT..................**........
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing right
t1 sign
t2 Stone

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
Day 1, 08:14, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
TT......................======
TT..........TT........t1==....
TT......................==....
TT~~~~~~................==....
TT~~~~~~~~......t2......==....
TT~~~~~~......@@>>......==....
TT..............**......==....
TT..........TT..........==....
TT......................==....
TT..................**........
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing right
t1 sign
t2 Stone

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

## Turn 31

```text
Day 1, 08:14, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
......................========
..........TT........t1==......
......................==......
~~~~~~................==......
~~~~~~~~......t2......==......
~~~~~~........@@>>....==......
..............**......==......
..........TT..........==......
......................==......
..................**..........
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing right
t1 sign
t2 Stone

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

## Turn 32

```text
Day 1, 08:15, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
TT......................======
TT..........TT........t1==....
TT......................==....
TT~~~~~~................==....
TT~~~~~~~~......t2......==....
TT~~~~~~....<<@@........==....
TT..............**......==....
TT..........TT..........==....
TT......................==....
TT..................**........
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing left
t1 sign
t2 Stone

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
Day 1, 08:15, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
  TT......................====
  TT..........TT........t1==..
  TT......................==..
  TT~~~~~~................==..
  TT~~~~~~~~......t2......==..
  TT~~~~~~..<<@@..........==..
  TT..............**......==..
  TT..........TT..........==..
  TT......................==..
  TT..................**......
  TTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing left
t1 sign
t2 Stone

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

## Turn 34

```text
Day 1, 08:15, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
  TT......................====
  TT..........TT........t1==..
  TT......................==..
  TT~~~~~~................==..
  TT~~~~~~~~......t2......==..
  TT~~~~~~..<<@@..........==..
  TT..............**......==..
  TT..........TT..........==..
  TT......................==..
  TT..................**......
  TTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing left
t1 sign
t2 Stone

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

> **face down**

## Turn 35

```text
Day 1, 08:15, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
  TT......................====
  TT..........TT........t1==..
  TT......................==..
  TT~~~~~~................==..
  TT~~~~~~~~......t2......==..
  TT~~~~~~....@@..........==..
  TT..........vv..**......==..
  TT..........TT..........==..
  TT......................==..
  TT..................**......
  TTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing down
t1 sign
t2 Stone

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

> **wait 10** · Note: «(dry) a note on turn 35.»

## Turn 36

```text
Day 1, 08:25, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
  TT......................====
  TT..........TT........t1==..
  TT......................==..
  TT~~~~~~................==..
  TT~~~~~~~~......t2......==..
  TT~~~~~~....@@..........==..
  TT..........vv..**......==..
  TT..........TT..........==..
  TT......................==..
  TT..................**......
  TTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing down
t1 sign
t2 Stone

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

## Turn 37

```text
Day 1, 08:25, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
    TT......................==
    TT..........TT........t1==
    TT......................==
    TT~~~~~~................==
    TT~~~~~~~~......t2......==
    TT~~~~~~<<@@............==
    TT..............**......==
    TT..........TT..........==
    TT......................==
    TT..................**....
    TTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing left
t1 sign
t2 Stone

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

## Turn 38

```text
Day 1, 08:25, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
    TT......................==
    TT..........TT........t1==
    TT......................==
    TT~~~~~~................==
    TT~~~~~~~~^^....t2......==
    TT~~~~~~..@@............==
    TT..............**......==
    TT..........TT..........==
    TT......................==
    TT..................**....
    TTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing up
t1 sign
t2 Stone

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
Day 1, 08:26, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
    TT......................==
    TT..........TT........t1==
    TT......................==
    TT~~~~~~................==
    TT~~~~~~~~^^....t2......==
    TT~~~~~~..@@............==
    TT..............**......==
    TT..........TT..........==
    TT......................==
    TT..................**....
    TTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing up
t1 sign
t2 Stone

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

## Turn 40

```text
Day 1, 08:26, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
  TT......................====
  TT..........TT........t1==..
  TT......................==..
  TT~~~~~~................==..
  TT~~~~~~~~......t2......==..
  TT~~~~~~....@@>>........==..
  TT..............**......==..
  TT..........TT..........==..
  TT......................==..
  TT..................**......
  TTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing right
t1 sign
t2 Stone

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

## Turn 41

```text
Day 1, 08:26, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
  TT....TT....................
  TT......................====
  TT..........TT........t1==..
  TT......................==..
  TT~~~~~~....^^..........==..
  TT~~~~~~~~..@@..t2......==..
  TT~~~~~~................==..
  TT..............**......==..
  TT..........TT..........==..
  TT......................==..
  TT..................**......
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing up
t1 sign
t2 Stone

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
Day 1, 08:26, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
    TT....TT..................
    TT......................==
    TT..........TT........t1==
    TT......................==
    TT~~~~~~................==
    TT~~~~~~<<@@....t2......==
    TT~~~~~~................==
    TT..............**......==
    TT..........TT..........==
    TT......................==
    TT..................**....
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing left
t1 sign
t2 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with water
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move up** · Note: «(dry) a note on turn 42.»

## Turn 43

```text
Day 1, 08:26, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
    TT......................**
    TT....TT..................
    TT......................==
    TT..........TT........t1==
    TT........^^............==
    TT~~~~~~..@@............==
    TT~~~~~~~~......t2......==
    TT~~~~~~................==
    TT..............**......==
    TT..........TT..........==
    TT......................==
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing up
t1 sign
t2 Stone

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

## Turn 44

```text
Day 1, 08:26, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
    TT......................**
    TT....TT..................
    TT......................==
    TT..........TT........t1==
    TT......................==
    TT~~~~~~..@@............==
    TT~~~~~~~~vv....t2......==
    TT~~~~~~................==
    TT..............**......==
    TT..........TT..........==
    TT......................==
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing down
t1 sign
t2 Stone

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
Day 1, 08:26, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
    TT......................**
    TT....TT..................
    TT......................==
    TT..........TT........t1==
    TT......................==
    TT~~~~~~..@@>>..........==
    TT~~~~~~~~......t2......==
    TT~~~~~~................==
    TT..............**......==
    TT..........TT..........==
    TT......................==
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing right
t1 sign
t2 Stone

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

## Turn 46

```text
Day 1, 08:27, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
      TT......................
      TT....TT................
      TT......................
      TT..........TT........t1
      TT......................
      TT~~~~<<@@..............
      TT~~~~~~~~......t2......
      TT~~~~~~................
      TT..............**......
      TT..........TT..........
      TT......................
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing left
t1 sign
t2 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with water
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down blocked · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **hands**

*no rule: «water is sent handle from you» (terrain)*

## Turn 47

```text
Day 1, 08:27, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
      TT......................
      TT....TT................
      TT......................
      TT..........TT........t1
      TT......................
      TT~~~~<<@@..............
      TT~~~~~~~~......t2......
      TT~~~~~~................
      TT..............**......
      TT..........TT..........
      TT......................
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing left
t1 sign
t2 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You reach out to water…
- The world had no rule for: water is sent handle from you
- You run a hand over water.

Journal:
- empty

Actions:
- primary: —
- hands: Interact with water
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down blocked · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **hands**

*no rule: «water is sent handle from you» (terrain)*

## Turn 48

```text
Day 1, 08:27, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
      TT......................
      TT....TT................
      TT......................
      TT..........TT........t1
      TT......................
      TT~~~~<<@@..............
      TT~~~~~~~~......t2......
      TT~~~~~~................
      TT..............**......
      TT..........TT..........
      TT......................
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing left
t1 sign
t2 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You reach out to water…
- The world had no rule for: water is sent handle from you
- You run a hand over water.

Journal:
- empty

Actions:
- primary: —
- hands: Interact with water
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down blocked · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **hands**

*no rule: «water is sent handle from you» (terrain)*

## Turn 49

```text
Day 1, 08:27, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
      TT......................
      TT....TT................
      TT......................
      TT..........TT........t1
      TT......................
      TT~~~~<<@@..............
      TT~~~~~~~~......t2......
      TT~~~~~~................
      TT..............**......
      TT..........TT..........
      TT......................
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing left
t1 sign
t2 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You reach out to water…
- The world had no rule for: water is sent handle from you
- You run a hand over water.

Journal:
- empty

Actions:
- primary: —
- hands: Interact with water
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down blocked · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **hands** · Note: «(dry) a note on turn 49.»

*no rule: «water is sent handle from you» (terrain)*

## Turn 50

```text
Day 1, 08:27, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
      TT......................
      TT....TT................
      TT......................
      TT..........TT........t1
      TT......................
      TT~~~~<<@@..............
      TT~~~~~~~~......t2......
      TT~~~~~~................
      TT..............**......
      TT..........TT..........
      TT......................
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing left
t1 sign
t2 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You reach out to water…
- The world had no rule for: water is sent handle from you
- You run a hand over water.

Journal:
- empty

Actions:
- primary: —
- hands: Interact with water
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down blocked · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face right**

## Turn 51

```text
Day 1, 08:27, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
      TT......................
      TT....TT................
      TT......................
      TT..........TT........t1
      TT......................
      TT~~~~~~@@>>............
      TT~~~~~~~~......t2......
      TT~~~~~~................
      TT..............**......
      TT..........TT..........
      TT......................
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing right
t1 sign
t2 Stone

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
- move: up walkable · down blocked · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face up**

## Turn 52

```text
Day 1, 08:27, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
      TT......................
      TT....TT................
      TT......................
      TT..........TT........t1
      TT......^^..............
      TT~~~~~~@@..............
      TT~~~~~~~~......t2......
      TT~~~~~~................
      TT..............**......
      TT..........TT..........
      TT......................
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing up
t1 sign
t2 Stone

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
- move: up walkable · down blocked · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **hands**

*no rule: «grass is sent handle from you» (terrain)*

## Turn 53

```text
Day 1, 08:27, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
      TT......................
      TT....TT................
      TT......................
      TT..........TT........t1
      TT......^^..............
      TT~~~~~~@@..............
      TT~~~~~~~~......t2......
      TT~~~~~~................
      TT..............**......
      TT..........TT..........
      TT......................
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing up
t1 sign
t2 Stone

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
- move: up walkable · down blocked · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move right**

## Turn 54

```text
Day 1, 08:28, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
    TT......................**
    TT....TT..................
    TT......................==
    TT..........TT........t1==
    TT......................==
    TT~~~~~~..@@>>..........==
    TT~~~~~~~~......t2......==
    TT~~~~~~................==
    TT..............**......==
    TT..........TT..........==
    TT......................==
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing right
t1 sign
t2 Stone

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

## Turn 55

```text
Day 1, 08:28, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
    TT......................**
    TT....TT..................
    TT......................==
    TT..........TT........t1==
    TT......................==
    TT~~~~~~..@@>>..........==
    TT~~~~~~~~......t2......==
    TT~~~~~~................==
    TT..............**......==
    TT..........TT..........==
    TT......................==
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing right
t1 sign
t2 Stone

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

## Turn 56

```text
Day 1, 08:28, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
    TT......................**
    TT....TT..................
    TT......................==
    TT..........TT........t1==
    TT........^^............==
    TT~~~~~~..@@............==
    TT~~~~~~~~......t2......==
    TT~~~~~~................==
    TT..............**......==
    TT..........TT..........==
    TT......................==
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing up
t1 sign
t2 Stone

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

> **face down** · Note: «(dry) a note on turn 56.»

## Turn 57

```text
Day 1, 08:28, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
    TT......................**
    TT....TT..................
    TT......................==
    TT..........TT........t1==
    TT......................==
    TT~~~~~~..@@............==
    TT~~~~~~~~vv....t2......==
    TT~~~~~~................==
    TT..............**......==
    TT..........TT..........==
    TT......................==
Terrain: ** flowers, .. grass, == path, TT tree, ~~ water
@@ You — facing down
t1 sign
t2 Stone

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

## Turn 58

```text
Day 1, 08:28, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
      TT......................
      TT....TT................
      TT......................
      TT..........TT........t1
      TT......................
      TT~~~~<<@@..............
      TT~~~~~~~~......t2......
      TT~~~~~~................
      TT..............**......
      TT..........TT..........
      TT......................
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing left
t1 sign
t2 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with water
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down blocked · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move up**

## Turn 59

```text
Day 1, 08:28, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
      TT..........TT..........
      TT......................
      TT....TT................
      TT......................
      TT......^^..TT........t1
      TT......@@..............
      TT~~~~~~................
      TT~~~~~~~~......t2......
      TT~~~~~~................
      TT..............**......
      TT..........TT..........
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing up
t1 sign
t2 Stone

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

## Turn 60

```text
Day 1, 08:28, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
      TT..........TT..........
      TT......................
      TT....TT................
      TT......................
      TT..........TT........t1
      TT....<<@@..............
      TT~~~~~~................
      TT~~~~~~~~......t2......
      TT~~~~~~................
      TT..............**......
      TT..........TT..........
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing left
t1 sign
t2 Stone

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

## Turn 61

```text
Day 1, 08:29, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
      TTTT..............P1....
      TT..........TT..........
      TT......................
      TT....TT................
      TT......^^..............
      TT......@@..TT........t1
      TT......................
      TT~~~~~~................
      TT~~~~~~~~......t2......
      TT~~~~~~................
      TT..............**......
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing up
P1 Mira
t1 sign
t2 Stone

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

## Turn 62

```text
Day 1, 08:29, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
      TTTT..............P1....
      TT..........TT..........
      TT......................
      TT....TT................
      TT......................
      TT....<<@@..TT........t1
      TT......................
      TT~~~~~~................
      TT~~~~~~~~......t2......
      TT~~~~~~................
      TT..............**......
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing left
P1 Mira
t1 sign
t2 Stone

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

## Turn 63

```text
Day 1, 08:29, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
      TTTT..............P1....
      TT..........TT..........
      TT......................
      TT....TT................
      TT......................
      TT....<<@@..TT........t1
      TT......................
      TT~~~~~~................
      TT~~~~~~~~......t2......
      TT~~~~~~................
      TT..............**......
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing left
P1 Mira
t1 sign
t2 Stone

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

> **face up** · Note: «(dry) a note on turn 63.»

## Turn 64

```text
Day 1, 08:29, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
      TTTT..............P1....
      TT..........TT..........
      TT......................
      TT....TT................
      TT......^^..............
      TT......@@..TT........t1
      TT......................
      TT~~~~~~................
      TT~~~~~~~~......t2......
      TT~~~~~~................
      TT..............**......
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing up
P1 Mira
t1 sign
t2 Stone

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

## Turn 65

```text
Day 1, 08:29, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
      TTTT..............P1....
      TT..........TT..........
      TT......................
      TT....TT................
      TT......................
      TT......@@>>TT........t1
      TT......................
      TT~~~~~~................
      TT~~~~~~~~......t2......
      TT~~~~~~................
      TT..............**......
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing right
P1 Mira
t1 sign
t2 Stone

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

## Turn 66

```text
Day 1, 08:29, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
      TTTT..............P1....
      TT..........TT..........
      TT......................
      TT....TT................
      TT......................
      TT......@@>>TT........t1
      TT......................
      TT~~~~~~................
      TT~~~~~~~~......t2......
      TT~~~~~~................
      TT..............**......
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing right
P1 Mira
t1 sign
t2 Stone

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

## Turn 67

```text
Day 1, 08:29, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
        TTTT..............P1..
        TT..........TT........
        TT....................
        TT....TT..............
        TT....................
        TT..<<@@....TT........
        TT....................
        TT~~~~~~..............
        TT~~~~~~~~......t1....
        TT~~~~~~..............
        TT..............**....
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing left
P1 Mira
t1 Stone

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
Day 1, 08:30, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
        TTTTTTTTTTTTTTTTTTTTTT
        TTTT..............**..
        TT..........TT....P1..
        TT....................
        TT....^^..............
        TT....@@..............
        TT..........TT........
        TT....................
        TT~~~~~~..............
        TT~~~~~~~~......t1....
        TT~~~~~~..............
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing up
P1 Mira
t1 Stone

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
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move down**

## Turn 69

```text
Day 1, 08:30, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
        TTTT..............**..
        TT..........TT....P1..
        TT....................
        TT....TT..............
        TT....................
        TT....@@....TT........
        TT....vv..............
        TT~~~~~~..............
        TT~~~~~~~~......t1....
        TT~~~~~~..............
        TT..............**....
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing down
P1 Mira
t1 Stone

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

## Turn 70

```text
Day 1, 08:30, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
        TT..........TT....P1..
        TT....................
        TT....TT..............
        TT....................
        TT..........TT........
        TT....@@..............
        TT~~~~vv..............
        TT~~~~~~~~......t1....
        TT~~~~~~..............
        TT..............**....
        TT..........TT........
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing down
P1 Mira
t1 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Interact with water
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move up** · Note: «(dry) a note on turn 70.»

## Turn 71

```text
Day 1, 08:30, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
        TTTT..............**..
        TT..........TT....P1..
        TT....................
        TT....TT..............
        TT....^^..............
        TT....@@....TT........
        TT....................
        TT~~~~~~..............
        TT~~~~~~~~......t1....
        TT~~~~~~..............
        TT..............**....
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing up
P1 Mira
t1 Stone

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

## Turn 72

```text
Day 1, 08:30, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
        TTTTTTTTTTTTTTTTTTTTTT
        TTTT..............**..
        TT..........TT....P1..
        TT....................
        TT....^^..............
        TT....@@..............
        TT..........TT........
        TT....................
        TT~~~~~~..............
        TT~~~~~~~~......t1....
        TT~~~~~~..............
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing up
P1 Mira
t1 Stone

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
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face left**

## Turn 73

```text
Day 1, 08:30, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
        TTTTTTTTTTTTTTTTTTTTTT
        TTTT..............**..
        TT..........TT....P1..
        TT....................
        TT....TT..............
        TT..<<@@..............
        TT..........TT........
        TT....................
        TT~~~~~~..............
        TT~~~~~~~~......t1....
        TT~~~~~~..............
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing left
P1 Mira
t1 Stone

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

## Turn 74

```text
Day 1, 08:31, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
          TTTTTTTTTTTTTTTTTTTT
          TTTT..............**
          TT..........TT....P1
          TT..................
          TT....TT............
          TT<<@@..............
          TT..........TT......
          TT..................
          TT~~~~~~............
          TT~~~~~~~~......t1..
          TT~~~~~~............
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing left
P1 Mira
t1 Stone

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

## Turn 75

```text
Day 1, 08:31, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
          TTTTTTTTTTTTTTTTTTTT
          TTTT..............**
          TT..........TT....P1
          TT..................
          TT....TT............
          TT..@@>>............
          TT..........TT......
          TT..................
          TT~~~~~~............
          TT~~~~~~~~......t1..
          TT~~~~~~............
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing right
P1 Mira
t1 Stone

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

## Turn 76

```text
Day 1, 08:31, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
          TTTTTTTTTTTTTTTTTTTT
          TTTT..............**
          TT..........TT....P1
          TT..................
          TT..^^TT............
          TT..@@..............
          TT..........TT......
          TT..................
          TT~~~~~~............
          TT~~~~~~~~......t1..
          TT~~~~~~............
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing up
P1 Mira
t1 Stone

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

## Turn 77

```text
Day 1, 08:31, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
          TTTT..............**
          TT..........TT....P1
          TT..................
          TT....TT............
          TT..................
          TT..@@......TT......
          TT..vv..............
          TT~~~~~~............
          TT~~~~~~~~......t1..
          TT~~~~~~............
          TT..............**..
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing down
P1 Mira
t1 Stone

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

> **face left** · Note: «(dry) a note on turn 77.»

## Turn 78

```text
Day 1, 08:31, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
          TTTT..............**
          TT..........TT....P1
          TT..................
          TT....TT............
          TT..................
          TT<<@@......TT......
          TT..................
          TT~~~~~~............
          TT~~~~~~~~......t1..
          TT~~~~~~............
          TT..............**..
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing left
P1 Mira
t1 Stone

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

## Turn 79

```text
Day 1, 08:31, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
        TTTT..............**..
        TT..........TT....P1..
        TT....................
        TT....TT..............
        TT....................
        TT....@@>>..TT........
        TT....................
        TT~~~~~~..............
        TT~~~~~~~~......t1....
        TT~~~~~~..............
        TT..............**....
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing right
P1 Mira
t1 Stone

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

## Turn 80

```text
Day 1, 08:31, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
        TTTT..............**..
        TT..........TT....P1..
        TT....................
        TT....TT..............
        TT....................
        TT..<<@@....TT........
        TT....................
        TT~~~~~~..............
        TT~~~~~~~~......t1....
        TT~~~~~~..............
        TT..............**....
Terrain: ** flowers, .. grass, TT tree, ~~ water
@@ You — facing left
P1 Mira
t1 Stone

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

