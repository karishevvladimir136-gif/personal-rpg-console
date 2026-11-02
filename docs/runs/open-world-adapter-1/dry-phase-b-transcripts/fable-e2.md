# Phase B · fable · episode 2 (DRY)

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

> **hands**

*no rule: «grass is sent handle from you» (terrain)*

## Turn 3

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

## Turn 4

```text
Day 1, 08:00, sun — The Glade

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

> **wait 10**

## Turn 5

```text
Day 1, 08:10, sun — The Glade

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

> **move left**

## Turn 6

```text
Day 1, 08:11, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..................**......XXXX
TT....................t1..XXXX
..................============
......TT........t2==..........
..................==..........
~~..........<<@@..==..........
~~~~......t3......==..........
~~................==..........
..........**......==..........
......TT..........==..........
..................==......t4..
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

> **move right**

## Turn 7

```text
Day 1, 08:11, sun — The Glade

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

> **face down** · Note: «(dry) a note on turn 7.»

## Turn 8

```text
Day 1, 08:11, sun — The Glade

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

> **face right**

## Turn 9

```text
Day 1, 08:11, sun — The Glade

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

> **wait 10**

## Turn 10

```text
Day 1, 08:21, sun — The Glade

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

> **face up**

## Turn 11

```text
Day 1, 08:21, sun — The Glade

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

> **move up**

## Turn 12

```text
Day 1, 08:21, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....TT....P1............XXXXXX
................**......XXXXXX
....................t1..XXXXDD
................==============
....TT........t2==............
..............@@==..........TT
................==............
~~......t3......==..........**
................==..........TT
........**......==............
....TT..........==............
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall, ~~ water
@@ You — facing up (in front: t2)
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
- primary: Punch sign
- hands: Read sign
- take: —
- put: —
- use: Punch sign
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **primary**

*no rule: «sign is sent strike (blunt) from you» (thing)*

## Turn 13

```text
Day 1, 08:22, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....TT....P1............XXXXXX
................**......XXXXXX
....................t1..XXXXDD
................==============
....TT........t2==............
..............@@==..........TT
................==............
~~......t3......==..........**
................==..........TT
........**......==............
....TT..........==............
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall, ~~ water
@@ You — facing up (in front: t2)
P1 Mira
t1 chest
t2 sign
t3 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- Your blow lands on sign…
- The world had no rule for: sign is sent strike (blunt) from you

Journal:
- empty

Actions:
- primary: Punch sign
- hands: Read sign
- take: —
- put: —
- use: Punch sign
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> ****primary**** · *not an action*

## Turn 14

```text
Day 1, 08:22, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....TT....P1............XXXXXX
................**......XXXXXX
....................t1..XXXXDD
................==============
....TT........t2==............
..............@@==..........TT
................==............
~~......t3......==..........**
................==..........TT
........**......==............
....TT..........==............
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall, ~~ water
@@ You — facing up (in front: t2)
P1 Mira
t1 chest
t2 sign
t3 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- Not an action: **primary**

Journal:
- empty

Actions:
- primary: Punch sign
- hands: Read sign
- take: —
- put: —
- use: Punch sign
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **primary** · Note: «(dry) a note on turn 14.»

*no rule: «sign is sent strike (blunt) from you» (thing)*

## Turn 15

```text
Day 1, 08:22, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....TT....P1............XXXXXX
................**......XXXXXX
....................t1..XXXXDD
................==============
....TT........t2==............
..............@@==..........TT
................==............
~~......t3......==..........**
................==..........TT
........**......==............
....TT..........==............
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall, ~~ water
@@ You — facing up (in front: t2)
P1 Mira
t1 chest
t2 sign
t3 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- Your blow lands on sign…
- The world had no rule for: sign is sent strike (blunt) from you

Journal:
- empty

Actions:
- primary: Punch sign
- hands: Read sign
- take: —
- put: —
- use: Punch sign
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **wait 10**

## Turn 16

```text
Day 1, 08:32, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....TT....P1............XXXXXX
................**......XXXXXX
....................t1..XXXXDD
................==============
....TT........t2==............
..............@@==..........TT
................==............
~~......t3......==..........**
................==..........TT
........**......==............
....TT..........==............
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall, ~~ water
@@ You — facing up (in front: t2)
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
- primary: Punch sign
- hands: Read sign
- take: —
- put: —
- use: Punch sign
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **hands**

## Turn 17

```text
Day 1, 08:33, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....TT....P1............XXXXXX
................**......XXXXXX
....................t1..XXXXDD
................==============
....TT........t2==............
..............@@==..........TT
................==............
~~......t3......==..........**
................==..........TT
........**......==............
....TT..........==............
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall, ~~ water
@@ You — facing up (in front: t2)
P1 Mira
t1 chest
t2 sign
t3 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- sign: "The Glade. Mira's cottage, north-east."

Journal:
- empty

Actions:
- primary: Punch sign
- hands: Read sign
- take: —
- put: —
- use: Punch sign
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move down**

## Turn 18

```text
Day 1, 08:33, sun — The Glade

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

## Turn 19

```text
Day 1, 08:33, sun — The Glade

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

> **move up**

## Turn 20

```text
Day 1, 08:33, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....TT....P1............XXXXXX
................**......XXXXXX
....................t1..XXXXDD
................==============
....TT........t2==............
..............@@==..........TT
................==............
~~......t3......==..........**
................==..........TT
........**......==............
....TT..........==............
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall, ~~ water
@@ You — facing up (in front: t2)
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
- primary: Punch sign
- hands: Read sign
- take: —
- put: —
- use: Punch sign
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **use**

*no rule: «sign is sent strike (blunt) from you» (thing)*

## Turn 21

```text
Day 1, 08:33, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....TT....P1............XXXXXX
................**......XXXXXX
....................t1..XXXXDD
................==============
....TT........t2==............
..............@@==..........TT
................==............
~~......t3......==..........**
................==..........TT
........**......==............
....TT..........==............
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall, ~~ water
@@ You — facing up (in front: t2)
P1 Mira
t1 chest
t2 sign
t3 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- Your blow lands on sign…
- The world had no rule for: sign is sent strike (blunt) from you

Journal:
- empty

Actions:
- primary: Punch sign
- hands: Read sign
- take: —
- put: —
- use: Punch sign
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **(empty)** · *not an action*

## Turn 22

```text
Day 1, 08:33, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....TT....P1............XXXXXX
................**......XXXXXX
....................t1..XXXXDD
................==============
....TT........t2==............
..............@@==..........TT
................==............
~~......t3......==..........**
................==..........TT
........**......==............
....TT..........==............
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall, ~~ water
@@ You — facing up (in front: t2)
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
- primary: Punch sign
- hands: Read sign
- take: —
- put: —
- use: Punch sign
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face right**

## Turn 23

```text
Day 1, 08:34, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....TT....P1............XXXXXX
................**......XXXXXX
....................t1..XXXXDD
................==============
....TT........t2==............
..............@@>>..........TT
................==............
~~......t3......==..........**
................==..........TT
........**......==............
....TT..........==............
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall, ~~ water
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
- hands: Interact with dirt road
- take: —
- put: —
- use: —
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move left**

## Turn 24

```text
Day 1, 08:34, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
......TT....P1............XXXX
..................**......XXXX
TT....................t1..XXXX
..................============
......TT........t2==..........
............<<@@..==..........
~~................==..........
~~~~......t3......==..........
~~................==..........
..........**......==..........
......TT..........==..........
Terrain: ** flowers, .. grass, == path, TT tree, XX wall, ~~ water
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
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move right**

## Turn 25

```text
Day 1, 08:34, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....TT....P1............XXXXXX
................**......XXXXXX
....................t1..XXXXDD
................==============
....TT........t2==............
..............@@>>..........TT
................==............
~~......t3......==..........**
................==..........TT
........**......==............
....TT..........==............
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall, ~~ water
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
- hands: Interact with dirt road
- take: —
- put: —
- use: —
- self: —
- move: up blocked · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move right**

## Turn 26

```text
Day 1, 08:34, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..TT....P1............XXXXXXXX
..............**......XXXXXXXX
..................t1..XXXXDDXX
..............==============..
..TT........t2==..............
..............@@>>........TT..
..............==..............
......t3......==..........**..
..............==..........TT..
......**......==..............
..TT..........==............TT
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

> **face left**

## Turn 27

```text
Day 1, 08:34, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..TT....P1............XXXXXXXX
..............**......XXXXXXXX
..................t1..XXXXDDXX
..............==============..
..TT........t2==..............
............<<@@..........TT..
..............==..............
......t3......==..........**..
..............==..........TT..
......**......==..............
..TT..........==............TT
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
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
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face up**

## Turn 28

```text
Day 1, 08:34, sun — The Glade

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

> **move up** · Note: «(dry) a note on turn 28.»

## Turn 29

```text
Day 1, 08:35, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
........**............XXXXXXXX
..TT....P1............XXXXXXXX
..............**......XXXXXXXX
..................t1..XXXXDDXX
..............^^============..
..TT........t2@@..............
..............==..........TT..
..............==..............
......t3......==..........**..
..............==..........TT..
......**......==..............
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
- move: up walkable · down walkable · left blocked · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move right**

## Turn 30

```text
Day 1, 08:35, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
......**............XXXXXXXXXX
TT....P1............XXXXXXXXXX
............**......XXXXXXXXXX
................t1..XXXXDDXXXX
............==============....
TT........t2==@@>>............
............==..........TT....
............==................
....t3......==..........**....
............==..........TT....
....**......==................
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

> **hands**

*no rule: «grass is sent handle from you» (terrain)*

## Turn 31

```text
Day 1, 08:35, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
......**............XXXXXXXXXX
TT....P1............XXXXXXXXXX
............**......XXXXXXXXXX
................t1..XXXXDDXXXX
............==============....
TT........t2==@@>>............
............==..........TT....
............==................
....t3......==..........**....
............==..........TT....
....**......==................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing right
P1 Mira
t1 chest
t2 sign
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

> **face down**

## Turn 32

```text
Day 1, 08:35, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
......**............XXXXXXXXXX
TT....P1............XXXXXXXXXX
............**......XXXXXXXXXX
................t1..XXXXDDXXXX
............==============....
TT........t2==@@..............
............==vv........TT....
............==................
....t3......==..........**....
............==..........TT....
....**......==................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing down
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

> **face left**

## Turn 33

```text
Day 1, 08:35, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
......**............XXXXXXXXXX
TT....P1............XXXXXXXXXX
............**......XXXXXXXXXX
................t1..XXXXDDXXXX
............==============....
TT........t2<<@@..............
............==..........TT....
............==................
....t3......==..........**....
............==..........TT....
....**......==................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
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
- hands: Interact with dirt road
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face down**

## Turn 34

```text
Day 1, 08:35, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
......**............XXXXXXXXXX
TT....P1............XXXXXXXXXX
............**......XXXXXXXXXX
................t1..XXXXDDXXXX
............==============....
TT........t2==@@..............
............==vv........TT....
............==................
....t3......==..........**....
............==..........TT....
....**......==................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing down
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

> **hands**

*no rule: «grass is sent handle from you» (terrain)*

## Turn 35

```text
Day 1, 08:35, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
......**............XXXXXXXXXX
TT....P1............XXXXXXXXXX
............**......XXXXXXXXXX
................t1..XXXXDDXXXX
............==============....
TT........t2==@@..............
............==vv........TT....
............==................
....t3......==..........**....
............==..........TT....
....**......==................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing down
P1 Mira
t1 chest
t2 sign
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

> **move right** · Note: «(dry) a note on turn 35.»

## Turn 36

```text
Day 1, 08:35, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....**............XXXXXXXXXXXX
....P1............XXXXXXXXXXXX
..........**......XXXXXXXXXXXX
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..@@>>............
..........==..........TT......
..........==..................
..t3......==..........**......
..........==..........TT......
..**......==..................
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

> **move down**

## Turn 37

```text
Day 1, 08:36, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....P1............XXXXXXXXXXXX
..........**......XXXXXXXXXXXX
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..@@......TT......
..........==..vv..............
..t3......==..........**......
..........==..........TT......
..**......==..................
..........==............TT....
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing down
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

> **move left**

## Turn 38

```text
Day 1, 08:36, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
TT....P1............XXXXXXXXXX
............**......XXXXXXXXXX
................t1..XXXXDDXXXX
............==============....
TT........t2==................
............<<@@........TT....
............==................
....t3......==..........**....
............==..........TT....
....**......==................
TT..........==............TT..
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
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
- hands: Interact with dirt road
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move down**

## Turn 39

```text
Day 1, 08:36, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
............**......XXXXXXXXXX
................t1..XXXXDDXXXX
............==============....
TT........t2==................
............==..........TT....
............==@@..............
....t3......==vv........**....
............==..........TT....
....**......==................
TT..........==............TT..
............==......t4........
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

> **wait 10**

## Turn 40

```text
Day 1, 08:46, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
......P1....**......XXXXXXXXXX
................t1..XXXXDDXXXX
............==============....
TT........t2==................
............==..........TT....
............==@@............c1
....t3......==vv........**....
............==..........TT....
....**......==................
TT..........==............TT..
............==......t4........
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing down
P1 Mira
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

> **face up**

## Turn 41

```text
Day 1, 08:46, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
......P1....**......XXXXXXXXXX
................t1..XXXXDDXXXX
............==============....
TT........t2==................
............==^^........TT....
............==@@............c1
....t3......==..........**....
............==..........TT....
....**......==................
TT..........==............TT..
............==......t4........
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing up
P1 Mira
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

> **wait 10**

## Turn 42

```text
Day 1, 08:56, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
............**......XXXXXXXXXX
................t1..XXXXDDXXXX
............==============....
TT........t2==................
............==^^........TT....
............==@@..............
....t3......==..........**..c1
............==..........TT....
....**......==................
TT..........==............TT..
............==......t4........
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

> **move left** · Note: «(dry) a note on turn 42.»

## Turn 43

```text
Day 1, 08:57, sun — The Glade

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

> **move right**

## Turn 44

```text
Day 1, 08:57, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
............**......XXXXXXXXXX
................t1..XXXXDDXXXX
............==============....
TT........t2==................
............==..........TT....
............==@@>>............
....t3......==..........**..c1
............==..........TT....
....**......==................
TT..........==............TT..
............==......t4........
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

> **move left**

## Turn 45

```text
Day 1, 08:57, sun — The Glade

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

> **move up**

## Turn 46

```text
Day 1, 08:57, sun — The Glade

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

> **move down**

## Turn 47

```text
Day 1, 08:57, sun — The Glade

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

> **hands**

*no rule: «dirt road is sent handle from you» (terrain)*

## Turn 48

```text
Day 1, 08:58, sun — The Glade

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

## Turn 49

```text
Day 1, 08:58, sun — The Glade

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

> **move right** · Note: «(dry) a note on turn 49.»

## Turn 50

```text
Day 1, 08:58, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
............**......XXXXXXXXXX
................t1..XXXXDDXXXX
............==============....
TT........t2==................
............==..........TT....
............==@@>>............
....t3......==..........**..c1
............==..........TT....
....**......==................
TT..........==............TT..
............==......t4........
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

> **move right**

## Turn 51

```text
Day 1, 08:58, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........**......XXXXXXXXXXXX
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..........TT......
..........==..@@>>............
..t3......==..........**..c1..
..........==..........TT......
..**......==..................
..........==............TT....
..........==......t4..........
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

> **hands**

*no rule: «grass is sent handle from you» (terrain)*

## Turn 52

```text
Day 1, 08:58, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........**......XXXXXXXXXXXX
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..........TT......
..........==..@@>>............
..t3......==..........**..c1..
..........==..........TT......
..**......==..................
..........==............TT....
..........==......t4..........
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

## Turn 53

```text
Day 1, 08:58, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..........TT......
..........==..................
..t3......==..@@......**..c1..
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

## Turn 54

```text
Day 1, 08:58, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..........TT......
..........==..................
..t3......==<<@@......**..c1..
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

## Turn 55

```text
Day 1, 09:09, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..........TT......
..........==..................
..t3......==<<@@......**......
..........==..........TT..c1..
..**......==..................
..........==............TT....
..........==......t4..........
......**......................
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

> **face down**

## Turn 56

```text
Day 1, 09:09, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..........TT......
..........==..................
..t3......==..@@......**......
..........==..vv......TT..c1..
..**......==..................
..........==............TT....
..........==......t4..........
......**......................
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

> **move down** · Note: «(dry) a note on turn 56.»

## Turn 57

```text
Day 1, 09:09, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........==============......
........t1==..................
..........==..........TT......
..........==..................
..t2......==..........**......
..........==..@@......TT..c1..
..**......==..vv..............
..........==............TT....
..........==......t3..........
......**......................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing down
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

> **move down**

## Turn 58

```text
Day 1, 09:09, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
........t1==..................
..........==..........TT......
..........==..................
..t2......==..........**......
..........==..........TT..c1..
..**......==..@@..............
..........==..vv........TT....
..........==......t3..........
......**......................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT

Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing down
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

> **move down**

## Turn 59

```text
Day 1, 09:09, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
..........==..........TT......
..........==..................
..t1......==..........**......
..........==..........TT..c1..
..**......==..................
..........==..@@........TT....
..........==..vv..t2..........
......**......................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT


Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing down
t1 Stone
c1 slime — hostile
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

> **move right**

## Turn 60

```text
Day 1, 09:09, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
........==..........TT........
........==....................
t1......==..........**........
........==..........TT..c1....
**......==....................
........==....@@>>....TT......
........==......t2............
....**........................
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT


Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing right
t1 Stone
c1 slime — hostile
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

> **move down**

## Turn 61

```text
Day 1, 09:10, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
........==....................
t1......==..........**........
........==..........TT....c1..
**......==....................
........==............TT......
........==....@@t2............
....**........vv..............
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT



Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing down
t1 Stone
c1 slime — hostile
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

> **move right**

## Turn 62

```text
Day 1, 09:10, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
......==....................TT
......==..........**........TT
......==..........TT....c1..TT
......==....................TT
......==............TT......TT
......==......@@>>..........TT
..**........................TT
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT



Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing right
c1 slime — hostile
t1 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: —
- hands: Take Stone
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **hands**

## Turn 63

```text
Day 1, 09:10, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
......==....................TT
......==..........**........TT
......==..........TT....c1..TT
......==....................TT
......==............TT......TT
......==......@@>>..........TT
..**........................TT
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT



Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing right
c1 slime — hostile

You: hp 30/30 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- You take Stone.

Journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: Interact with grass
- take: —
- put: —
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face up** · Note: «(dry) a note on turn 63.»

## Turn 64

```text
Day 1, 09:10, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
......==....................TT
......==..........**........TT
......==..........TT....c1..TT
......==....................TT
......==......^^....TT......TT
......==......@@............TT
..**........................TT
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT



Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing up
c1 slime — hostile

You: hp 30/30 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: Interact with grass
- take: —
- put: —
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face down**

## Turn 65

```text
Day 1, 09:10, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
......==....................TT
......==..........**........TT
......==..........TT....c1..TT
......==....................TT
......==............TT......TT
......==......@@............TT
..**..........vv............TT
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT



Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing down
c1 slime — hostile

You: hp 30/30 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: Interact with grass
- take: —
- put: —
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face left**

## Turn 66

```text
Day 1, 09:10, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
......==....................TT
......==..........**........TT
......==..........TT....c1..TT
......==....................TT
......==............TT......TT
......==....<<@@............TT
..**........................TT
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT



Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing left
c1 slime — hostile

You: hp 30/30 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: Interact with grass
- take: —
- put: —
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move down**

## Turn 67

```text
Day 1, 09:10, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
......==..........**........TT
......==..........TT....c1..TT
......==....................TT
......==............TT......TT
......==....................TT
..**..........@@............TT
TTTTTTTTTTTTTTvvTTTTTTTTTTTTTT




Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing down
c1 slime — hostile

You: hp 30/30 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: Interact with tree
- take: —
- put: —
- use: Use Stone on tree
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **self**

*no rule: «you use Stone on you» (self)*

## Turn 68

```text
Day 1, 09:11, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
......==..........**........TT
......==..........TT....c1..TT
......==....................TT
......==............TT......TT
......==....................TT
..**..........@@............TT
TTTTTTTTTTTTTTvvTTTTTTTTTTTTTT




Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing down
c1 slime — hostile

You: hp 30/30 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- You try Stone on yourself…
- The world had no rule for: you use Stone on you
- Nothing happens.

Journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: Interact with tree
- take: —
- put: —
- use: Use Stone on tree
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face right**

## Turn 69

```text
Day 1, 09:11, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
......==..........**........TT
......==..........TT....c1..TT
......==....................TT
......==............TT......TT
......==....................TT
..**..........@@>>..........TT
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT




Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing right
c1 slime — hostile

You: hp 30/30 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: Interact with grass
- take: —
- put: —
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **use**

*no rule: «you use Stone on grass» (terrain)*

## Turn 70

```text
Day 1, 09:11, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
......==..........**........TT
......==..........TT....c1..TT
......==....................TT
......==............TT......TT
......==....................TT
..**..........@@>>..........TT
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT




Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing right
c1 slime — hostile

You: hp 30/30 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- You try Stone on grass…
- The world had no rule for: you use Stone on grass
- Nothing happens.

Journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: Interact with grass
- take: —
- put: —
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move right** · Note: «(dry) a note on turn 70.»

## Turn 71

```text
Day 1, 09:11, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....==..........**........TT
....==..........TT....c1..TT
....==....................TT
....==............TT......TT
....==....................TT
**............@@>>........TT
TTTTTTTTTTTTTTTTTTTTTTTTTTTT




Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing right
c1 slime — hostile

You: hp 30/30 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: Interact with grass
- take: —
- put: —
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face left**

## Turn 72

```text
Day 1, 09:11, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....==..........**........TT
....==..........TT....c1..TT
....==....................TT
....==............TT......TT
....==....................TT
**..........<<@@..........TT
TTTTTTTTTTTTTTTTTTTTTTTTTTTT




Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing left
c1 slime — hostile

You: hp 30/30 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: Interact with grass
- take: —
- put: —
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **self**

*no rule: «you use Stone on you» (self)*

## Turn 73

```text
Day 1, 09:11, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....==..........**........TT
....==..........TT....c1..TT
....==....................TT
....==............TT......TT
....==....................TT
**..........<<@@..........TT
TTTTTTTTTTTTTTTTTTTTTTTTTTTT




Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing left
c1 slime — hostile

You: hp 30/30 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- You try Stone on yourself…
- The world had no rule for: you use Stone on you
- Nothing happens.

Journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: Interact with grass
- take: —
- put: —
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **face up**

## Turn 74

```text
Day 1, 09:11, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....==..........**........TT
....==..........TT....c1..TT
....==....................TT
....==............TT......TT
....==........^^..........TT
**............@@..........TT
TTTTTTTTTTTTTTTTTTTTTTTTTTTT




Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing up
c1 slime — hostile

You: hp 30/30 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: Interact with grass
- take: —
- put: —
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **primary**

## Turn 75

```text
Day 1, 09:11, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....==..........**........TT
....==..........TT....c1..TT
....==....................TT
....==............TT......TT
....==........^^..........TT
**............@@..........TT
TTTTTTTTTTTTTTTTTTTTTTTTTTTT




Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing up
c1 slime — hostile

You: hp 30/30 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- empty

Actions:
- Question: Use Stone on yourself? — answer yes · answer no
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **answer yes**

*no rule: «you use Stone on you» (self)*

## Turn 76

```text
Day 1, 09:11, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....==..........**........TT
....==..........TT....c1..TT
....==....................TT
....==............TT......TT
....==........^^..........TT
**............@@..........TT
TTTTTTTTTTTTTTTTTTTTTTTTTTTT




Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing up
c1 slime — hostile

You: hp 30/30 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- You try Stone on yourself…
- The world had no rule for: you use Stone on you
- Nothing happens.

Journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: Interact with grass
- take: —
- put: —
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move up**

## Turn 77

```text
Day 1, 09:11, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....==....................TT
....==..........**........TT
....==..........TT....c1..TT
....==....................TT
....==........^^..TT......TT
....==........@@..........TT
**........................TT
TTTTTTTTTTTTTTTTTTTTTTTTTTTT



Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing up
c1 slime — hostile

You: hp 30/30 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: Interact with grass
- take: —
- put: —
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move down** · Note: «(dry) a note on turn 77.»

## Turn 78

```text
Day 1, 09:12, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....==..........**........TT
....==..........TT....c1..TT
....==....................TT
....==............TT......TT
....==....................TT
**............@@..........TT
TTTTTTTTTTTTTTvvTTTTTTTTTTTT




Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing down
c1 slime — hostile

You: hp 30/30 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: Interact with tree
- take: —
- put: —
- use: Use Stone on tree
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **self**

*no rule: «you use Stone on you» (self)*

## Turn 79

```text
Day 1, 09:12, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....==..........**........TT
....==..........TT....c1..TT
....==....................TT
....==............TT......TT
....==....................TT
**............@@..........TT
TTTTTTTTTTTTTTvvTTTTTTTTTTTT




Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing down
c1 slime — hostile

You: hp 30/30 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- You try Stone on yourself…
- The world had no rule for: you use Stone on you
- Nothing happens.

Journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: Interact with tree
- take: —
- put: —
- use: Use Stone on tree
- self: Use Stone on yourself
- move: up walkable · down blocked · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **move up**

## Turn 80

```text
Day 1, 09:12, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
....==....................TT
....==..........**........TT
....==..........TT....c1..TT
....==....................TT
....==........^^..TT......TT
....==........@@..........TT
**........................TT
TTTTTTTTTTTTTTTTTTTTTTTTTTTT



Terrain: ** flowers, .. grass, == path, TT tree
@@ You — facing up
c1 slime — hostile

You: hp 30/30 · held: Stone · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Stone (selected)

Since your last action:
- nothing

Journal:
- empty

Actions:
- primary: Use Stone on yourself
- hands: Interact with grass
- take: —
- put: —
- use: Use Stone on grass
- self: Use Stone on yourself
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

> **wait 10**

