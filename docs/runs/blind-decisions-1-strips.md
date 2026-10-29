# Blind decisions 1 — every strip

Design sha256 `2cfba712ffd3612996f2eb7f1fefc8d8edfd6c9df01bfc34e769953a89545993`. The 58 completed table sessions, each as its decision strip, with who played it (the judges never saw this line). The vocabulary and the rules: `docs/runs/blind-decisions-1-vocabulary.md`; the codes per turn and the fork counts: `docs/runs/blind-decisions-1-strips.json`. Anyone can re-judge from here.

## group 1

### G1:A-opus — Claude Opus 5.5

```text
Strip G1:A-opus · Table A · 20 turns
t01 OFFER(service) · DECLINE(card) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t02 ASK(vendor,person) · ASK(vendor,place) · OFFER(coin) · DECLINE(card) · SCOUT(cat) · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t03 ASK(stranger,person) · ASK(stranger,place) · OFFER(coin) · SPEND(coin-medium) · SCOUT(cat) · LEAVE(scene) · DISCOVER(world) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t04 MOVE(street) · ASK(authority,person) · OFFER(service) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t05 MOVE(official) · WAIT
t06 ASK(authority,lore) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t07 ASK(authority,person) · OFFER(service) · ASSERT(backstory)
t08 DECLINE(card) · SCOUT(cat) · SCOUT(self) · ASSERT(backstory) ‖ FORK(check|accept)→accept · FORK(protect|use|leave)→use
t09 MOVE(private) · ASK(vendor,place) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) · LEAVE(scene) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t10 SCOUT(cat) · SCOUT(self) · WAIT ‖ FORK(protect|use|leave)→use
t11 ASK(vendor,person) · ASK(vendor,place) · OFFER(coin) ‖ FORK(spend|haggle|keep)→spend
t12 MOVE(street) · OFFER(coin) · SPEND(coin-large) · SCOUT(cat) · ASSERT(world) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t13 ASK(vendor,person) · ASK(vendor,danger) · OFFER(coin) · SPEND(coin-medium) · SCOUT(cat) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t14 MOVE(street) · ASK(vendor,person) · OFFER(coin) · SPEND(coin-small) · DECLINE(reroll) · SCOUT(self) · LEAVE(scene) · ASSERT(world) · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend · FORK(reroll|keep)→keep · FORK(protect|use|leave)→use
t15 MOVE(tavern) · PROTECT(self) · SPEND(coin-large) · SCOUT(cat) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t16 ASK(vendor,person) · ASK(vendor,place) · ASK(vendor,other) · OFFER(coin) · SPEND(coin-small) · CAST(cantrip) · DECEIVE · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend
t17 MOVE(street) · DECLINE(reroll) · SCOUT(cat) · SCOUT(self) · PRESS(roll) · PRESS(onward) ‖ FORK(reroll|keep)→keep · FORK(protect|use|leave)→use
t18 ASK(authority,other) · SCOUT(cat) · ASSERT(world) · ASSERT(event) ‖ FORK(protect|use|leave)→use
t19 MOVE(street) · SCOUT(cat) · LEAVE(scene) · ASSERT(world) ‖ FORK(protect|use|leave)→use
t20 MOVE(private) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) · SCOUT(self) · WAIT · ASSERT(backstory) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
```

### G1:A-fable — Claude Fable 5.1

```text
Strip G1:A-fable · Table A · 20 turns
t01 ASK(authority,work) · ASK(vendor,place) · ASSERT(backstory) ‖ FORK(help|refuse|price|defer)→help · FORK(check|accept)→accept · FORK(spend|haggle|keep)→spend
t02 ASK(vendor,person) · OFFER(trade) · DECLINE(reroll) · DECLINE(card) · OOC(clarify) · ASSERT(backstory) · PRESS(roll) · PRESS(onward) · PRESS(text) ‖ FORK(check|accept)→check · FORK(reroll|keep)→keep
t03 OOC(clarify)
t04 MOVE(tavern) · ASK(stranger,other)
t05 ASK(vendor,place) · ASK(vendor,other) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t06 ASK(vendor,danger) · OFFER(coin) · SPEND(coin-medium) · ASSERT(world) ‖ FORK(spend|haggle|keep)→spend
t07 ASK(stranger,danger) · OFFER(coin) · SPEND(coin-small) · ASSERT(backstory) · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend
t08 ASK(companion,other) · SCOUT(cat) · WAIT ‖ FORK(protect|use|leave)→use
t09 ASK(vendor,place) · ASK(vendor,lore) · DISCOVER(world)
t10 MOVE(private) · OFFER(coin) · SPEND(coin-small) · SCOUT(self) ‖ FORK(spend|haggle|keep)→spend
t11 OOC(clarify) · ASSERT(backstory) · ENFORCE(backstory)
t12 SCOUT(cat) · ASSERT(backstory)
t13 DECLINE(reroll) · WAIT · PRESS(roll) · PRESS(onward) ‖ FORK(reroll|keep)→keep
t14 SCOUT(self) · WAIT
t15 MOVE(tavern) · ASK(vendor,person) · ASK(vendor,place) · ASK(vendor,rule) · ASK(vendor,other) · OFFER(coin) · SPEND(coin-small) · ASSERT(backstory) ‖ FORK(spend|haggle|keep)→spend
t16 MOVE(street) · ASK(vendor,place) · OFFER(coin) · SPEND(coin-small) · ASSERT(backstory) ‖ FORK(spend|haggle|keep)→spend
t17 MOVE(private) · ASK(stranger,place) · ASSERT(backstory)
t18 ASK(stranger,work) · ASK(stranger,person) · ASSERT(backstory) · ASSERT(world) · ASSERT(event)
t19 ASK(stranger,person) · OFFER(service) · ASSERT(backstory) · ASSERT(world)
t20 MOVE(private) · OFFER(service) · SCOUT(self) · ASSERT(world) ‖ FORK(help|refuse|price|defer)→help
```

### G1:A-astra — GPT-6 Astra

```text
Strip G1:A-astra · Table A · 20 turns
t01 ASK(authority,place)
t02 ASK(authority,place) · DECLINE(card) ‖ FORK(help|refuse|price|defer)→refuse · FORK(hold|leave)→hold
t03 ASK(stranger,place) · ASK(stranger,other) · DECLINE(offer) ‖ FORK(help|refuse|price|defer)→defer · FORK(check|accept)→check
t04 ASK(vendor,lore) · DECLINE(reroll) · OOC(correct-rule) · PRESS(roll) · PRESS(onward) · PRESS(text) ‖ FORK(spend|haggle|keep)→keep · FORK(reroll|keep)→keep
t05 ASK(vendor,place) · DECLINE(offer) ‖ FORK(check|accept)→accept
t06 ASK(authority,other)
t07 ASK(authority,person) ‖ FORK(check|accept)→check
t08 MOVE(street) · ASK(authority,rule) · LEAVE(scene) ‖ FORK(help|refuse|price|defer)→help
t09 ASK(authority,person)
t10 ASK(stranger,other) · WAIT · PROPOSE(world)
t11 ASK(companion,danger) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t12 ASK(stranger,other)
t13 ASK(stranger,danger) · DECLINE(reroll) · ASSERT(event) · PRESS(roll) · PRESS(onward) ‖ FORK(help|refuse|price|defer)→defer · FORK(spend|haggle|keep)→keep · FORK(reroll|keep)→keep
t14 MOVE(tavern) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) ‖ FORK(help|refuse|price|defer)→help · FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t15 ASK(vendor,place) · ASK(vendor,price) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t16 OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t17 MOVE(private) · PROTECT(self) · SCOUT(self)
t18 PROTECT(self) · SCOUT(cat) · WAIT ‖ FORK(protect|use|leave)→use
t19 ASK(stranger,person) · PROTECT(self) · DECLINE(reroll) · PRESS(roll) · PRESS(onward) ‖ FORK(reroll|keep)→keep
t20 CAST(cantrip) · SCOUT(cat) · SCOUT(self) ‖ FORK(protect|use|leave)→use
```

### G1:A-sol — GPT-6.1 Sol

```text
Strip G1:A-sol · Table A · 20 turns
t01 ASK(authority,place) · LEAVE(scene)
t02 ASK(child,person) · ASK(child,danger) · ASSERT(event)
t03 ASK(child,place)
t04 MOVE(street) · ASK(child,person) · OFFER(coin) ‖ FORK(help|refuse|price|defer)→help · FORK(spend|haggle|keep)→spend
t05 ASK(child,other) · DECLINE(reroll) · SCOUT(self) · PRESS(roll) · PRESS(onward) ‖ FORK(reroll|keep)→keep
t06 MOVE(private) · ASK(child,place) · SPEND(coin-small) · LEAVE(scene) ‖ FORK(spend|haggle|keep)→spend · FORK(hold|leave)→leave
t07 ASK(vendor,other) · WAIT · PROPOSE(world)
t08 SCOUT(cat) · WAIT ‖ FORK(protect|use|leave)→use
t09 PROTECT(npc) · WAIT ‖ FORK(protect|use|leave)→use
t10 SCOUT(cat) · WAIT · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→use
t11 PROTECT(npc) · SCOUT(cat) · WAIT ‖ FORK(protect|use|leave)→use
t12 OFFER(help) · PROTECT(npc) · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→use
t13 DECEIVE · LEAVE(scene) · ASSERT(backstory) ‖ FORK(protect|use|leave)→leave · FORK(hold|leave)→leave
t14 MOVE(official) · ASK(vendor,place) · SPEND(reroll) · SCOUT(self) · PRESS(roll) · PRESS(onward) · PRESS(reroll) ‖ FORK(reroll|keep)→reroll
t15 PROTECT(npc) ‖ FORK(protect|use|leave)→use
t16 PROTECT(companion) · PROTECT(npc) · CAST(slot) · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→protect
t17 MOVE(street) · ASK(child,person) · PROTECT(npc) · SCOUT(cat) · LEAVE(scene) · ASSERT(backstory) ‖ FORK(protect|use|leave)→use
t18 ASK(stranger,other) · OFFER(help) · WAIT ‖ FORK(check|accept)→accept · FORK(spend|haggle|keep)→spend
t19 MOVE(private) · OFFER(coin) · SPEND(coin-small) ‖ FORK(check|accept)→accept · FORK(spend|haggle|keep)→spend
t20 MOVE(street) · ASK(stranger,other) · ASSERT(backstory) · ASSERT(event)
```

### G1:B-opus — Claude Opus 5.5

```text
Strip G1:B-opus · Table B · 20 turns
t01 ASK(authority,work) · ASK(authority,place) · OFFER(coin) · SPEND(coin-small) · SCOUT(self) ‖ FORK(spend|haggle|keep)→spend
t02 ASK(vendor,person) · OFFER(coin) · SPEND(coin-small) · DECLINE(card) · SCOUT(cat) · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t03 MOVE(street) · ASK(companion,danger) · DECLINE(reroll) · DECLINE(offer) · SCOUT(self) · PRESS(roll) · PRESS(onward) ‖ FORK(reroll|keep)→keep · FORK(protect|use|leave)→use · FORK(hold|leave)→hold
t04 CAST(cantrip) · SCOUT(cat) · SCOUT(self) · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→use
t05 ASK(companion,danger) · SCOUT(cat) · SCOUT(self) ‖ FORK(protect|use|leave)→use
t06 SCOUT(cat) · SCOUT(self) · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→use
t07 OFFER(trade) · OFFER(coin) · DECLINE(reroll) · DECEIVE · OOC(correct-rule) · ASSERT(world) · PRESS(roll) · PRESS(onward) · PRESS(text) ‖ FORK(spend|haggle|keep)→spend · FORK(reroll|keep)→keep
t08 MOVE(private) · ASK(vendor,person) · OFFER(coin) · SPEND(coin-small) · ASSERT(event) · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend
t09 ASK(stranger,person) · ASK(stranger,other) · SCOUT(cat) · OOC(clarify) ‖ FORK(protect|use|leave)→use
t10 MOVE(tavern) · PROTECT(npc) · SPEND(coin-small) · SCOUT(cat) · DECEIVE · WAIT · LEAVE(scene) · OOC(other) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use · FORK(hold|leave)→hold
t11 MOVE(official) · ASK(stranger,person) · ASK(stranger,lore) · OFFER(coin) · SPEND(coin-small) · WAIT · OOC(other) · ASSERT(backstory) · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend
t12 SCOUT(cat) · WAIT ‖ FORK(protect|use|leave)→use
t13 SCOUT(cat) ‖ FORK(protect|use|leave)→use
t14 PROTECT(companion) · WAIT ‖ FORK(protect|use|leave)→protect
t15 ASK(stranger,place) · PROTECT(companion) · SPEND(reroll) · DECEIVE · ASSERT(backstory) · ASSERT(world) · PRESS(roll) · PRESS(onward) · PRESS(reroll) ‖ FORK(reroll|keep)→reroll · FORK(protect|use|leave)→protect
t16 ASK(stranger,danger) · SCOUT(cat) · WAIT · OOC(clarify) ‖ FORK(protect|use|leave)→use
t17 MOVE(tavern) · OFFER(coin) · PROTECT(npc) · SPEND(coin-large) · DECEIVE · LEAVE(scene) · ASSERT(world) ‖ FORK(spend|haggle|keep)→spend
t18 MOVE(private) · OFFER(coin) · SPEND(coin-medium) · DECEIVE · OOC(clarify) · ASSERT(world) ‖ FORK(spend|haggle|keep)→spend
t19 SCOUT(self) · WAIT · OOC(other) · ASSERT(event)
t20 SCOUT(self) · OOC(clarify) ‖ FORK(protect|use|leave)→use
```

### G1:B-fable — Claude Fable 5.1

```text
Strip G1:B-fable · Table B · 20 turns
t01 ASK(stranger,person) · DECLINE(card) ‖ FORK(hold|leave)→hold
t02 ASK(stranger,person) · DECLINE(card) · WAIT · ASSERT(world) · PRESS(roll) · PRESS(onward)
t03 ASK(stranger,price) · ASK(stranger,danger) · SCOUT(cat) · SCOUT(self) · ASSERT(world) · ASSERT(event) ‖ FORK(protect|use|leave)→use
t04 MOVE(official) · PROTECT(npc) · DECEIVE · LEAVE(scene) · ASSERT(backstory)
t05 ASK(authority,danger) · OFFER(service) · DECLINE(reroll) · DECLINE(card) · DECEIVE · PRESS(roll) · PRESS(onward) ‖ FORK(reroll|keep)→keep
t06 ASK(authority,place) · SCOUT(self) · ASSERT(world) · ASSERT(event)
t07 MOVE(tavern) · ASK(stranger,place) · SCOUT(cat) · LEAVE(scene) · ASSERT(world) ‖ FORK(protect|use|leave)→use
t08 ASK(vendor,other) · OFFER(coin) · SPEND(coin-medium) · ASSERT(backstory) ‖ FORK(check|accept)→check · FORK(spend|haggle|keep)→spend
t09 ASK(vendor,person) · ASK(vendor,danger) · SCOUT(cat) · SCOUT(self) · ASSERT(world) ‖ FORK(protect|use|leave)→use
t10 ASK(stranger,person) · ASK(stranger,other) · SCOUT(cat) · ASSERT(backstory) · ASSERT(event) · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→use
t11 PROTECT(npc) · OOC(correct-rule) · ASSERT(backstory) · ASSERT(world) · PRESS(roll) · PRESS(onward) · PRESS(text) ‖ FORK(check|accept)→check
t12 PROTECT(npc) · ASSERT(backstory) · ASSERT(world)
t13 OFFER(coin) · SCOUT(cat) · SCOUT(self) · DECEIVE · WAIT ‖ FORK(hold|leave)→leave
t14 MOVE(street) · SPEND(reroll) · DECLINE(reroll) · SCOUT(self) · LEAVE(scene) · OOC(other) · ASSERT(world) · PRESS(roll) · PRESS(onward) · PRESS(reroll) · PRESS(text) ‖ FORK(reroll|keep)→keep · FORK(reroll|keep)→reroll · FORK(reroll|keep)→reroll · FORK(protect|use|leave)→use · FORK(hold|leave)→leave
t15 ASK(child,person) · OFFER(coin) · SPEND(coin-medium) · SPEND(reroll) · DECEIVE · OOC(correct-rule) · ASSERT(world) · PRESS(roll) · PRESS(onward) · PRESS(reroll) · PRESS(text) ‖ FORK(spend|haggle|keep)→spend · FORK(reroll|keep)→reroll · FORK(reroll|keep)→reroll
t16 ASK(companion,place) · SCOUT(self) · DECEIVE · WAIT · OOC(clarify) · PRESS(roll) · PRESS(onward) · PRESS(text)
t17 PROTECT(npc) · SCOUT(cat) · DECEIVE · WAIT · ASSERT(world) ‖ FORK(protect|use|leave)→use
t18 SCOUT(cat) · SCOUT(self) · WAIT · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→use
t19 PROTECT(companion) · WAIT · ASSERT(world) ‖ FORK(protect|use|leave)→protect
t20 MOVE(private) · SCOUT(self) · LEAVE(scene) · PRESS(roll) · PRESS(onward)
```

### G1:B-astra — GPT-6 Astra

```text
Strip G1:B-astra · Table B · 20 turns
t01 ASK(authority,rule) · OFFER(help)
t02 ASK(authority,danger) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t03 ASK(stranger,person) · DECLINE(reroll) · PRESS(roll) · PRESS(onward) ‖ FORK(reroll|keep)→keep
t04 ASK(stranger,place) · ASSERT(event)
t05 SCOUT(self) · LEAVE(scene) · PRESS(roll) · PRESS(onward)
t06 DECLINE(card) · PROPOSE(world) · ASSERT(event) ‖ FORK(spend|haggle|keep)→keep · FORK(hold|leave)→hold
t07 ASK(vendor,person) · SPEND(reroll) · DECLINE(reroll) · OOC(correct-rule) · ASSERT(world) · PRESS(roll) · PRESS(onward) · PRESS(reroll) · PRESS(text) ‖ FORK(check|accept)→check · FORK(reroll|keep)→keep · FORK(reroll|keep)→reroll
t08 MOVE(street) · ASK(vendor,person) · ASSERT(world) · ASSERT(event)
t09 MOVE(street) · ASK(authority,person) · OFFER(service) · LEAVE(scene) · ASSERT(world) ‖ FORK(hold|leave)→leave
t10 MOVE(tavern) · ASK(stranger,place) · DECLINE(reroll) · SCOUT(self) · PRESS(roll) · PRESS(onward) ‖ FORK(reroll|keep)→keep
t11 ASK(vendor,person) · OFFER(coin) · SCOUT(cat) · ASSERT(backstory) ‖ FORK(protect|use|leave)→use
t12 ASK(vendor,price) ‖ FORK(check|accept)→accept
t13 OFFER(coin) · SPEND(coin-small) · ASSERT(backstory) ‖ FORK(spend|haggle|keep)→spend
t14 ASK(stranger,danger) · ASSERT(world) · ASSERT(event)
t15 OFFER(service) · PROTECT(npc) · SCOUT(cat) · PRESS(roll) · PRESS(onward) ‖ FORK(help|refuse|price|defer)→help · FORK(protect|use|leave)→use
t16 ASK(stranger,person)
t17 MOVE(private) · OFFER(help) · OFFER(coin) · SCOUT(cat) · LEAVE(scene) ‖ FORK(protect|use|leave)→use
t18 MOVE(street) · SCOUT(cat) · SCOUT(self) · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→use
t19 MOVE(tavern) · ASK(vendor,place) · ASK(vendor,price) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t20 MOVE(private) · OFFER(coin) · PROTECT(self) · SPEND(coin-medium) · SCOUT(self) ‖ FORK(spend|haggle|keep)→spend
```

### G1:B-sol — GPT-6.1 Sol

```text
Strip G1:B-sol · Table B · 20 turns
t01 ASK(authority,price) · DECLINE(card) ‖ FORK(spend|haggle|keep)→keep
t02 ASK(authority,place) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t03 ASK(authority,person)
t04 MOVE(street) · ASK(companion,other) · LEAVE(scene) ‖ FORK(protect|use|leave)→use
t05 MOVE(tavern) · ASK(vendor,place) · SPEND(coin-small) · DECLINE(card) · LEAVE(scene) ‖ FORK(spend|haggle|keep)→spend · FORK(hold|leave)→hold
t06 ASK(vendor,other) · OFFER(coin) · SPEND(coin-medium) · DECLINE(reroll) · ASSERT(backstory) · ASSERT(world) · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend · FORK(reroll|keep)→keep
t07 ASK(stranger,person) · ASSERT(backstory)
t08 ASK(stranger,other) · ASSERT(world) ‖ FORK(check|accept)→check
t09 ASK(stranger,other)
t10 MOVE(private) · ASK(companion,lore) · LEAVE(scene)
t11 PROTECT(self) · DECLINE(card) · WAIT · ASSERT(world) ‖ FORK(hold|leave)→hold
t12 MOVE(tavern) · ASK(vendor,place) · OOC(clarify)
t13 ASK(vendor,person) · OFFER(coin) · SPEND(coin-medium) ‖ FORK(check|accept)→check · FORK(spend|haggle|keep)→spend
t14 MOVE(street) · ASK(authority,rule)
t15 ASK(authority,rule) ‖ FORK(check|accept)→accept
t16 MOVE(official) · ASK(authority,work) · SCOUT(self)
t17 ASK(authority,other) · ASSERT(event)
t18 DECLINE(card) ‖ FORK(help|refuse|price|defer)→help
t19 MOVE(official) · ASK(authority,rule) · OFFER(service) · PRESS(roll) · PRESS(onward) ‖ FORK(help|refuse|price|defer)→help
t20 ASK(authority,person) · ASK(authority,lore) · PROPOSE(world)
```

### G1:C-opus — Claude Opus 5.5 (ended: stuck)

```text
Strip G1:C-opus · Table C · 14 turns
t01 ASK(companion,other) · OFFER(coin) · DECLINE(reroll) · SCOUT(self) · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend · FORK(reroll|keep)→keep · FORK(protect|use|leave)→use
t02 MOVE(tavern) · ASK(vendor,person) · OFFER(coin) · SCOUT(cat) · SCOUT(self) · OOC(other) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t03 OFFER(coin) · SPEND(coin-small) · WAIT · OOC(other) ‖ FORK(spend|haggle|keep)→spend
t04 ASK(stranger,other) · DECLINE(reroll) · OOC(other) · ASSERT(event) · PRESS(roll) · PRESS(onward) ‖ FORK(check|accept)→check · FORK(reroll|keep)→keep
t05 OFFER(service) · DECLINE(offer) · OOC(clarify) ‖ FORK(check|accept)→check · FORK(spend|haggle|keep)→keep
t06 OOC(clarify) · ASSERT(backstory) · ASSERT(world) · PRESS(roll) · PRESS(onward)
t07 SCOUT(self) · OOC(other) · PRESS(roll) · PRESS(onward) ‖ FORK(check|accept)→check
t08 OOC(correct-rule) · PRESS(roll) · PRESS(onward) · PRESS(text) ‖ FORK(check|accept)→check
t09 ASK(stranger,other) · OOC(other)
t10 ASK(vendor,other) · ASK(stranger,other) · OFFER(coin) · OOC(other) · PRESS(roll) · PRESS(onward) ‖ FORK(check|accept)→check · FORK(spend|haggle|keep)→spend
t11 OOC(clarify) ‖ FORK(check|accept)→check
t12 ASK(stranger,person) · ASK(stranger,place) · SCOUT(cat) · OOC(clarify) · DISCOVER(world) ‖ FORK(help|refuse|price|defer)→defer · FORK(protect|use|leave)→use
t13 ASK(stranger,other) · PROTECT(companion) · DECLINE(reroll) · SCOUT(self) · OOC(other) · PRESS(roll) · PRESS(onward) ‖ FORK(reroll|keep)→keep · FORK(protect|use|leave)→protect
t14 OFFER(service) · OOC(correct-rule) · ASSERT(world) · PRESS(roll) · PRESS(text) ‖ FORK(check|accept)→check · FORK(reroll|keep)→reroll
```

### G1:C-fable — Claude Fable 5.1

```text
Strip G1:C-fable · Table C · 20 turns
t01 ASK(companion,danger) · SCOUT(self) ‖ FORK(protect|use|leave)→use
t02 MOVE(tavern) · SCOUT(self)
t03 SCOUT(self) · WAIT
t04 ASK(child,person) · ASK(child,place) · ASK(child,danger) · ASK(child,other) · OFFER(help) · ASSERT(world) ‖ FORK(help|refuse|price|defer)→defer · FORK(spend|haggle|keep)→keep
t05 MOVE(wild) · PROTECT(npc) · SPEND(coin-small) · SCOUT(self) · LEAVE(scene) · ASSERT(world) ‖ FORK(help|refuse|price|defer)→help · FORK(spend|haggle|keep)→spend
t06 MOVE(official) · ASK(authority,person) · ASK(authority,danger) · PRESS(roll) · PRESS(onward)
t07 ASK(authority,person) · ASK(authority,place) · ASK(authority,danger) ‖ FORK(check|accept)→check
t08 MOVE(tavern) · ASK(vendor,person) · SPEND(coin-large) · LEAVE(scene) ‖ FORK(spend|haggle|keep)→spend
t09 MOVE(wild) · ASK(vendor,other) · OFFER(trade)
t10 MOVE(wild) · SCOUT(cat) · WAIT · LEAVE(scene) ‖ FORK(protect|use|leave)→use · FORK(hold|leave)→leave
t11 MOVE(official) · ASK(companion,person) · DECLINE(fight) · WAIT · LEAVE(scene) · PROPOSE(world) ‖ FORK(protect|use|leave)→use
t12 ASK(authority,person) · ASSERT(world) · ASSERT(event)
t13 OFFER(coin) · PROTECT(npc) · SCOUT(self) · ASSERT(world)
t14 MOVE(private) · SCOUT(cat) · SCOUT(self) · ASSERT(world) ‖ FORK(protect|use|leave)→use
t15 ASK(vendor,person) · ASK(vendor,place) · ASK(vendor,price) · PRESS(roll) · PRESS(onward)
t16 ASK(vendor,person) · ASK(vendor,place) · ASSERT(event)
t17 MOVE(tavern) · MOVE(private) · OFFER(coin) · SPEND(coin-medium) · SCOUT(cat) · SCOUT(self) · DECEIVE · LEAVE(scene) · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t18 SPEND(reroll) · DECLINE(reroll) · DECLINE(card) · DECEIVE · OOC(other) · ASSERT(backstory) · PRESS(roll) · PRESS(onward) · PRESS(reroll) · PRESS(text) ‖ FORK(reroll|keep)→keep · FORK(reroll|keep)→reroll · FORK(hold|leave)→hold
t19 DECEIVE · ASSERT(backstory) · ASSERT(world) · ASSERT(event) · PRESS(roll) · PRESS(onward)
t20 MOVE(private) · ASK(companion,danger) · SCOUT(self) · DECEIVE · LEAVE(scene) · ASSERT(backstory) ‖ FORK(protect|use|leave)→use
```

### G1:C-astra — GPT-6 Astra

```text
Strip G1:C-astra · Table C · 20 turns
t01 ASK(vendor,person) · OFFER(coin) · DECLINE(card) ‖ FORK(spend|haggle|keep)→spend
t02 MOVE(tavern) · OFFER(service) ‖ FORK(check|accept)→accept
t03 ASK(stranger,person) · ASK(stranger,price) ‖ FORK(check|accept)→check
t04 MOVE(private) · SCOUT(cat) · LEAVE(scene) ‖ FORK(help|refuse|price|defer)→defer · FORK(check|accept)→check · FORK(spend|haggle|keep)→keep · FORK(protect|use|leave)→use
t05 DECLINE(reroll) · SCOUT(self) · PRESS(roll) · PRESS(onward) ‖ FORK(reroll|keep)→keep
t06 MOVE(tavern) · ASK(stranger,other) ‖ FORK(spend|haggle|keep)→haggle
t07 ASK(stranger,work) · ASK(stranger,person) · DECLINE(offer) · ASSERT(world) ‖ FORK(spend|haggle|keep)→keep
t08 OFFER(help)
t09 —
t10 ASK(vendor,danger) · OFFER(coin) ‖ FORK(spend|haggle|keep)→spend
t11 MOVE(wild) · ASK(stranger,danger) · LEAVE(scene) ‖ FORK(hold|leave)→leave
t12 ASK(companion,danger) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t13 MOVE(wild) · LEAVE(scene) · PROPOSE(world)
t14 MOVE(wild) · OFFER(coin) ‖ FORK(spend|haggle|keep)→spend
t15 ASK(stranger,danger) · ASSERT(backstory) · ASSERT(world) ‖ FORK(help|refuse|price|defer)→help · FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→leave
t16 ASK(companion,lore) · ASSERT(world)
t17 ‖ FORK(help|refuse|price|defer)→help
t18 WAIT
t19 ASK(child,other) · ASSERT(backstory)
t20 OFFER(service) · ASSERT(world)
```

### G1:C-sol — GPT-6.1 Sol

```text
Strip G1:C-sol · Table C · 20 turns
t01 ASK(vendor,place)
t02 ASK(authority,work) · OFFER(service) · DECLINE(card)
t03 ASK(authority,person) · ASK(authority,danger) · OFFER(service) ‖ FORK(help|refuse|price|defer)→help · FORK(spend|haggle|keep)→keep
t04 ASK(authority,work) · OFFER(service)
t05 ASK(vendor,price) · SPEND(coin-small) · DECLINE(card) · LEAVE(scene) ‖ FORK(help|refuse|price|defer)→help · FORK(spend|haggle|keep)→spend · FORK(hold|leave)→hold
t06 MOVE(tavern) · ASK(stranger,work) · ASSERT(event)
t07 ASK(stranger,danger) · ASSERT(event) ‖ FORK(check|accept)→check
t08 ASK(stranger,danger) · LEAVE(scene)
t09 SCOUT(self) · PRESS(roll) · PRESS(onward)
t10 PROPOSE(world) · PROPOSE(event)
t11 ASK(authority,person)
t12 MOVE(wild) · LEAVE(scene) ‖ FORK(help|refuse|price|defer)→help · FORK(check|accept)→accept
t13 WAIT
t14 ASK(vendor,place) · ASK(vendor,price) · ASSERT(world) · ASSERT(event)
t15 OFFER(coin) · SPEND(coin-large) · ASSERT(world) · ASSERT(event) ‖ FORK(spend|haggle|keep)→spend
t16 MOVE(tavern) · ASK(stranger,danger) · PROPOSE(event)
t17 MOVE(wild) · SCOUT(self) · ASSERT(event)
t18 MOVE(wild) · SCOUT(cat) · SCOUT(self)
t19 WAIT
t20 ASK(companion,danger) · SCOUT(cat) · SCOUT(self) ‖ FORK(protect|use|leave)→use
```

## group 2

### G2:A-opus — Claude Opus 5.5 (ended: stuck)

```text
Strip G2:A-opus · Table A · 4 turns
t01 DECLINE(card) ‖ FORK(protect|use|leave)→protect · FORK(hold|leave)→hold
t02 ASK(child,other) · DECLINE(reroll) · SCOUT(self) · ASSERT(world) · PRESS(roll) · PRESS(onward) ‖ FORK(reroll|keep)→keep
t03 ASK(child,person) · ASK(child,place) · OFFER(help) · OOC(clarify) ‖ FORK(help|refuse|price|defer)→help
t04 OFFER(coin) · PROTECT(npc) · DECEIVE · OOC(correct-rule) · ASSERT(world) · PRESS(roll) · PRESS(text)
```

### G2:A-fable — Claude Fable 5.1

```text
Strip G2:A-fable · Table A · 20 turns
t01 DECLINE(card) ‖ FORK(hold|leave)→hold
t02 MOVE(tavern) · SCOUT(cat) · LEAVE(scene) ‖ FORK(protect|use|leave)→use · FORK(hold|leave)→leave
t03 ASK(vendor,danger) · OFFER(coin) · SPEND(coin-medium) · SCOUT(self) ‖ FORK(spend|haggle|keep)→spend
t04 ASK(stranger,person) · ASSERT(backstory)
t05 ASK(stranger,other) · OFFER(trade) · ASSERT(backstory)
t06 ASK(stranger,other) · DECLINE(reroll) · PRESS(roll) · PRESS(onward) ‖ FORK(check|accept)→check · FORK(reroll|keep)→keep
t07 ASK(stranger,person) · DECLINE(card)
t08 ASK(stranger,person)
t09 OFFER(service) · SPEND(coin-small) · SCOUT(cat) · WAIT · PROPOSE(world) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t10 DECLINE(card) · ASSERT(backstory)
t11 ASK(stranger,person) · ASK(stranger,danger) · PROTECT(npc) · DECEIVE · ASSERT(backstory) ‖ FORK(help|refuse|price|defer)→help
t12 ASK(stranger,place) · PROTECT(npc) ‖ FORK(hold|leave)→hold
t13 MOVE(private) · ASK(stranger,lore) · PROTECT(self) · WAIT · ASSERT(backstory)
t14 MOVE(street) · ASK(vendor,lore) · OFFER(coin) · SPEND(coin-medium) · SCOUT(self) ‖ FORK(spend|haggle|keep)→spend
t15 MOVE(private) · ASK(authority,rule) · ASK(stranger,person) · OFFER(coin) · DECEIVE · ASSERT(backstory)
t16 ASK(authority,price) · ASK(authority,rule) · ASK(authority,other) · OFFER(coin) · SCOUT(cat) · SCOUT(self) · DECEIVE · ASSERT(backstory) · PRESS(roll) · PRESS(onward) ‖ FORK(check|accept)→check · FORK(protect|use|leave)→use
t17 ASK(vendor,other) · OFFER(coin) · SPEND(coin-medium) · DECEIVE · ASSERT(backstory) · ASSERT(event) ‖ FORK(spend|haggle|keep)→spend
t18 ASK(authority,person) · ASK(authority,lore) · SPEND(coin-small) · DECEIVE · ASSERT(world) ‖ FORK(spend|haggle|keep)→spend
t19 MOVE(street) · ASK(stranger,person) · ASK(stranger,place) · SPEND(coin-small) · LEAVE(scene) ‖ FORK(spend|haggle|keep)→spend
t20 MOVE(street) · ASK(stranger,place) · LEAVE(scene) · ASSERT(world)
```

### G2:A-astra — GPT-6 Astra

```text
Strip G2:A-astra · Table A · 20 turns
t01 DECLINE(card) · SCOUT(cat) ‖ FORK(protect|use|leave)→use · FORK(hold|leave)→hold
t02 SCOUT(self) · PRESS(roll) · PRESS(onward)
t03 ASK(child,person) · ASK(child,other) ‖ FORK(help|refuse|price|defer)→defer · FORK(spend|haggle|keep)→keep
t04 DECEIVE
t05 MOVE(street) · ASK(authority,danger) · ASSERT(event)
t06 ASK(child,place) ‖ FORK(spend|haggle|keep)→keep
t07 MOVE(private) · PROTECT(npc)
t08 MOVE(private) · ASK(stranger,rule) · ASSERT(backstory) · ASSERT(world)
t09 ASK(stranger,danger) · ASK(stranger,lore)
t10 ASK(stranger,lore) ‖ FORK(help|refuse|price|defer)→help
t11 ASK(stranger,other) · ASSERT(backstory)
t12 MOVE(private) · OFFER(coin) · OFFER(service)
t13 ASK(vendor,place) · ASK(vendor,rule) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t14 MOVE(street) · OFFER(coin) · SPEND(coin-small) · LEAVE(scene) ‖ FORK(spend|haggle|keep)→spend
t15 SPEND(reroll) · DECLINE(reroll) · CAST(cantrip) · WAIT · PRESS(roll) · PRESS(onward) · PRESS(reroll) ‖ FORK(reroll|keep)→keep · FORK(reroll|keep)→reroll
t16 OFFER(help)
t17 ASK(stranger,danger) · PRESS(roll) · PRESS(onward)
t18 SCOUT(self) · ASSERT(world)
t19 ASK(stranger,other)
t20 ASK(stranger,lore) · ASSERT(world)
```

### G2:A-sol — GPT-6.1 Sol

```text
Strip G2:A-sol · Table A · 20 turns
t01 DECLINE(card) · SCOUT(self) · PRESS(roll) · PRESS(onward) ‖ FORK(hold|leave)→hold
t02 ASK(authority,other) ‖ FORK(spend|haggle|keep)→keep
t03 OFFER(coin) · SPEND(coin-small) · DECLINE(card) · SCOUT(self) ‖ FORK(spend|haggle|keep)→spend · FORK(hold|leave)→hold
t04 SCOUT(self)
t05 MOVE(tavern) · ASK(vendor,place)
t06 ASK(vendor,price) · OFFER(coin) · PROTECT(self) · SPEND(coin-small) · SCOUT(self) ‖ FORK(spend|haggle|keep)→spend
t07 SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t08 ASK(stranger,lore)
t09 ASK(stranger,other) · ASSERT(event)
t10 ASK(stranger,place) · ASK(stranger,danger) · DISCOVER(world) · DISCOVER(event) ‖ FORK(check|accept)→check
t11 ASK(stranger,person) · ASK(stranger,place)
t12 ASK(stranger,rule)
t13 ASSERT(world)
t14 MOVE(private) · PROTECT(self) · SCOUT(self) · WAIT
t15 WAIT
t16 SCOUT(cat) ‖ FORK(protect|use|leave)→use
t17 SCOUT(cat) ‖ FORK(protect|use|leave)→use
t18 SCOUT(cat) · WAIT ‖ FORK(protect|use|leave)→use
t19 ASK(companion,person) · ASK(companion,place) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t20 MOVE(tavern) · WAIT ‖ FORK(protect|use|leave)→leave
```

### G2:B-opus — Claude Opus 5.5

```text
Strip G2:B-opus · Table B · 20 turns
t01 ASK(authority,price) · SPEND(coin-small) · DECLINE(card) · SCOUT(cat) · SCOUT(self) · ASSERT(backstory) ‖ FORK(check|accept)→accept · FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t02 ASK(authority,work) · ASK(authority,place) · ASK(authority,danger) · DECLINE(reroll) · PRESS(roll) · PRESS(onward) ‖ FORK(reroll|keep)→keep
t03 MOVE(wild) · ASK(vendor,place) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t04 MOVE(private) · SCOUT(cat) · SCOUT(self) · DECEIVE · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→use
t05 ASK(vendor,person) · DECLINE(reroll) · SCOUT(cat) · OOC(clarify) · ASSERT(world) · ASSERT(event) · PRESS(roll) · PRESS(onward) · PRESS(text) ‖ FORK(reroll|keep)→keep · FORK(protect|use|leave)→use
t06 MOVE(street) · SCOUT(cat) · DECEIVE · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→use
t07 ASK(companion,lore) · DECLINE(reroll) · SCOUT(self) · OOC(correct-rule) · PROPOSE(world) · PRESS(roll) · PRESS(onward) · PRESS(text) ‖ FORK(reroll|keep)→keep · FORK(protect|use|leave)→use
t08 MOVE(street) · SCOUT(cat) · SCOUT(self) · DECEIVE ‖ FORK(protect|use|leave)→use
t09 SCOUT(cat) · WAIT ‖ FORK(protect|use|leave)→use
t10 SCOUT(cat) · WAIT · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→use
t11 MOVE(street) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t12 ASK(vendor,person) · OFFER(coin) · SCOUT(cat) · ASSERT(event) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t13 OFFER(coin) · SPEND(coin-medium) · SCOUT(cat) · ASSERT(world) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t14 MOVE(tavern) · ASK(vendor,place) · SPEND(coin-medium) · DECLINE(card) · LEAVE(scene) · ASSERT(backstory) · ASSERT(world) ‖ FORK(spend|haggle|keep)→spend
t15 ASK(vendor,person) · OFFER(coin) · DECLINE(reroll) · SCOUT(cat) · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend · FORK(reroll|keep)→keep · FORK(protect|use|leave)→use
t16 MOVE(private) · PROTECT(self) · SCOUT(self) · WAIT · LEAVE(scene) ‖ FORK(hold|leave)→leave
t17 ASK(companion,danger) · SCOUT(cat) · SCOUT(self) ‖ FORK(protect|use|leave)→use
t18 MOVE(street) · OFFER(coin) · SPEND(coin-small) · DECLINE(reroll) · SCOUT(cat) · DECEIVE · WAIT · ASSERT(backstory) · ASSERT(event) · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend · FORK(reroll|keep)→keep · FORK(protect|use|leave)→use
t19 ASK(vendor,danger) · OFFER(trade) · SCOUT(cat) · ASSERT(event) ‖ FORK(protect|use|leave)→use
t20 MOVE(tavern) · ASK(vendor,person) · ASK(vendor,place) · OFFER(coin) · SPEND(coin-small) · SCOUT(self) · LEAVE(scene) ‖ FORK(spend|haggle|keep)→spend
```

### G2:B-fable — Claude Fable 5.1

```text
Strip G2:B-fable · Table B · 20 turns
t01 ASK(child,place) · ASK(stranger,person) · OFFER(coin) · PROTECT(companion) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→protect
t02 ASK(child,person) ‖ FORK(spend|haggle|keep)→keep
t03 ASK(authority,price)
t04 OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t05 MOVE(tavern) · ASK(child,danger) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t06 ASK(authority,person) · ASK(child,place) ‖ FORK(check|accept)→accept
t07 ASK(vendor,person) · OFFER(coin) · SPEND(coin-medium) · SCOUT(cat) · ASSERT(world) · ASSERT(event) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t08 ASK(child,other) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) · ASSERT(backstory) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t09 ASK(companion,danger) · DECEIVE · ASSERT(world)
t10 MOVE(private) · ASK(vendor,place) · ASK(companion,other) · SCOUT(self) · LEAVE(scene) ‖ FORK(protect|use|leave)→use
t11 ASK(companion,other) · SCOUT(cat) · ASSERT(backstory) · ASSERT(event) ‖ FORK(protect|use|leave)→use
t12 SCOUT(cat) · WAIT
t13 MOVE(street) · ASK(vendor,person) · OFFER(coin) · SPEND(coin-medium) ‖ FORK(spend|haggle|keep)→spend
t14 ASK(vendor,price) · ASK(vendor,other) · OFFER(coin) · SPEND(coin-small) · ASSERT(backstory) ‖ FORK(spend|haggle|keep)→spend
t15 ASK(vendor,person) · ASK(vendor,danger) · ASSERT(world) · ASSERT(event)
t16 ASK(vendor,other) · OFFER(coin) · SPEND(coin-small) · PROPOSE(world) · PRESS(roll) · PRESS(onward) ‖ FORK(check|accept)→check · FORK(spend|haggle|keep)→spend
t17 MOVE(street) · SCOUT(cat) · LEAVE(scene) · ASSERT(world) ‖ FORK(protect|use|leave)→use · FORK(hold|leave)→leave
t18 ASK(stranger,person) · ASK(stranger,other) · DECEIVE · ASSERT(backstory) · ASSERT(world) · ASSERT(event) · PRESS(roll) · PRESS(onward)
t19 SCOUT(cat) · ASSERT(world) · ASSERT(event) ‖ FORK(protect|use|leave)→use
t20 MOVE(street) · SPEND(reroll) · DECLINE(reroll) · SCOUT(self) · PRESS(roll) · PRESS(onward) · PRESS(reroll) ‖ FORK(reroll|keep)→keep · FORK(reroll|keep)→reroll
```

### G2:B-astra — GPT-6 Astra

```text
Strip G2:B-astra · Table B · 20 turns
t01 ASK(vendor,danger)
t02 ASK(vendor,danger) · DECLINE(card) · ASSERT(backstory) ‖ FORK(hold|leave)→hold
t03 ASK(companion,danger) ‖ FORK(protect|use|leave)→use
t04 ASK(vendor,person) · PROPOSE(world)
t05 ASK(vendor,other) · SCOUT(cat) · ASSERT(event)
t06 DECLINE(reroll) · SCOUT(self) · PRESS(roll) · PRESS(onward) ‖ FORK(check|accept)→check · FORK(reroll|keep)→keep
t07 ASK(stranger,person)
t08 ASK(stranger,person) · DECLINE(offer) · DECLINE(card) · ASSERT(world) ‖ FORK(hold|leave)→hold
t09 ASK(vendor,work) · DECLINE(card) · LEAVE(scene) · ASSERT(event) ‖ FORK(help|refuse|price|defer)→refuse · FORK(hold|leave)→leave
t10 PROTECT(npc) · WAIT
t11 ASK(vendor,other) · OFFER(coin) · SPEND(coin-medium) ‖ FORK(spend|haggle|keep)→spend
t12 ASK(vendor,person) · ASSERT(event) ‖ FORK(check|accept)→accept · FORK(protect|use|leave)→use
t13 MOVE(private) · SCOUT(self) · LEAVE(scene)
t14 SPEND(reroll) · DECLINE(reroll) · SCOUT(self) · WAIT · PRESS(roll) · PRESS(onward) · PRESS(reroll) ‖ FORK(reroll|keep)→keep · FORK(reroll|keep)→reroll
t15 WAIT
t16 MOVE(tavern) · ASK(vendor,price)
t17 OFFER(coin) · SPEND(coin-medium) ‖ FORK(spend|haggle|keep)→spend
t18 ASK(vendor,place)
t19 MOVE(street) · LEAVE(scene)
t20 ASK(child,price) ‖ FORK(help|refuse|price|defer)→defer · FORK(spend|haggle|keep)→keep
```

### G2:B-sol — GPT-6.1 Sol

```text
Strip G2:B-sol · Table B · 20 turns
t01 ASK(companion,other) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t02 ASK(authority,danger) · ASSERT(backstory) · ASSERT(world)
t03 ASK(companion,danger) · DECLINE(reroll) · SCOUT(cat) · PRESS(roll) · PRESS(onward) ‖ FORK(reroll|keep)→keep · FORK(protect|use|leave)→use
t04 ASK(stranger,person) · ASK(stranger,danger) · OFFER(coin) · SPEND(coin-medium) ‖ FORK(help|refuse|price|defer)→help · FORK(spend|haggle|keep)→spend
t05 SCOUT(self) · DISCOVER(backstory) · PRESS(roll) · PRESS(onward)
t06 PROTECT(companion) · DECLINE(reroll) · SCOUT(self) · PRESS(roll) · PRESS(onward) ‖ FORK(reroll|keep)→keep · FORK(protect|use|leave)→protect
t07 ASK(vendor,place) · PROTECT(npc)
t08 MOVE(tavern) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t09 SCOUT(cat) ‖ FORK(protect|use|leave)→use
t10 MOVE(street) · LEAVE(scene)
t11 MOVE(street) · SCOUT(self) · PRESS(roll) · PRESS(onward)
t12 PROTECT(companion) · DECEIVE · WAIT ‖ FORK(protect|use|leave)→protect
t13 PROTECT(npc) · ASSERT(event)
t14 ASK(stranger,danger) · ASSERT(world)
t15 ASK(stranger,person) · OFFER(help) · PROTECT(npc) · DECLINE(reroll) · OOC(correct-rule) · PRESS(roll) · PRESS(onward) · PRESS(text) ‖ FORK(reroll|keep)→keep
t16 ASK(authority,lore) · ASSERT(event) · PRESS(roll) · PRESS(onward)
t17 PROTECT(npc) · SCOUT(cat) · ASSERT(world) · ASSERT(event) ‖ FORK(protect|use|leave)→use
t18 OFFER(service) · ASSERT(backstory)
t19 OFFER(service) · SPEND(heal) ‖ FORK(help|refuse|price|defer)→help · FORK(spend|haggle|keep)→keep
t20 WAIT · ASSERT(backstory)
```

### G2:C-opus — Claude Opus 5.5 (ended: stuck)

```text
Strip G2:C-opus · Table C · 12 turns
t01 OOC(clarify)
t02 ASK(vendor,person) · ASK(vendor,danger) · OFFER(coin) · DECEIVE · OOC(other) ‖ FORK(spend|haggle|keep)→spend
t03 ASK(vendor,place) · OFFER(coin) · PROTECT(companion) · SPEND(coin-medium) · DECEIVE · OOC(clarify) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→protect
t04 SCOUT(cat) · OOC(clarify) ‖ FORK(protect|use|leave)→use
t05 ASK(stranger,person) · OOC(clarify) · ASSERT(backstory) ‖ FORK(check|accept)→check
t06 ASK(stranger,person) · OFFER(coin) · OOC(clarify) ‖ FORK(help|refuse|price|defer)→defer · FORK(check|accept)→check · FORK(spend|haggle|keep)→spend
t07 MOVE(private) · SCOUT(self) · OOC(clarify)
t08 ASK(vendor,person) · OOC(correct-rule) · PROPOSE(world) · ASSERT(event) · PRESS(roll) · PRESS(onward) · PRESS(text)
t09 SCOUT(cat) · WAIT · OOC(correct-rule) ‖ FORK(protect|use|leave)→use
t10 ASK(stranger,other) · OFFER(trade) · DECLINE(offer) · OOC(clarify) · ASSERT(world) · PRESS(roll) · PRESS(onward) · PRESS(text) ‖ FORK(spend|haggle|keep)→keep
t11 SCOUT(cat) · OOC(clarify) ‖ FORK(check|accept)→check · FORK(protect|use|leave)→use
t12 OFFER(help) · PROTECT(npc) · OOC(other) · PRESS(roll) · PRESS(onward) · PRESS(text)
```

### G2:C-fable — Claude Fable 5.1

```text
Strip G2:C-fable · Table C · 20 turns
t01 ASK(companion,other) · SCOUT(cat) · SCOUT(self) ‖ FORK(protect|use|leave)→use
t02 ASK(vendor,price) · ASK(stranger,person) · OOC(clarify)
t03 MOVE(private) · ASK(vendor,person) · ASK(vendor,price) · PROPOSE(world)
t04 ASK(vendor,place) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t05 ASK(vendor,place) · OFFER(coin) · OFFER(service) · ASSERT(backstory)
t06 OFFER(service) · ASSERT(backstory) · ASSERT(world) ‖ FORK(help|refuse|price|defer)→help
t07 ASK(vendor,person) · ASK(vendor,other) · WAIT · ASSERT(event)
t08 ASSERT(event)
t09 ASK(vendor,person) · SCOUT(self)
t10 MOVE(tavern) · SPEND(coin-small) · SCOUT(cat) · WAIT ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t11 MOVE(street) · ASK(vendor,person) · SPEND(coin-small) · SCOUT(cat) · SCOUT(self) · PROPOSE(world) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t12 ASK(vendor,person) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t13 MOVE(private) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t14 MOVE(tavern) · SCOUT(cat) · WAIT · LEAVE(scene) ‖ FORK(protect|use|leave)→use · FORK(hold|leave)→leave
t15 ASK(vendor,person) · SPEND(coin-small) · SCOUT(self) · ASSERT(event) ‖ FORK(spend|haggle|keep)→spend
t16 MOVE(tavern) · ASK(authority,person) · ASK(authority,lore) · OFFER(coin) · SPEND(coin-medium) · SCOUT(cat) · WAIT · LEAVE(scene) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t17 ASK(authority,person) · OFFER(coin) · SPEND(coin-medium) · DECLINE(reroll) · SCOUT(self) · PRESS(roll) · PRESS(onward) ‖ FORK(help|refuse|price|defer)→help · FORK(spend|haggle|keep)→spend · FORK(reroll|keep)→keep
t18 MOVE(tavern) · ASK(companion,danger) · SCOUT(cat) · LEAVE(scene) ‖ FORK(help|refuse|price|defer)→help · FORK(protect|use|leave)→use
t19 ASK(vendor,danger) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t20 ASK(vendor,place) · OFFER(coin) · SPEND(coin-small) · DECLINE(offer) ‖ FORK(spend|haggle|keep)→spend
```

### G2:C-astra — GPT-6 Astra

```text
Strip G2:C-astra · Table C · 20 turns
t01 MOVE(tavern) · ASK(vendor,place)
t02 ASK(authority,price) · ASK(authority,danger) · OFFER(service)
t03 OFFER(service) · PRESS(roll) · PRESS(onward) ‖ FORK(help|refuse|price|defer)→price · FORK(spend|haggle|keep)→haggle
t04 MOVE(private) · ASK(stranger,danger) ‖ FORK(help|refuse|price|defer)→help · FORK(spend|haggle|keep)→keep
t05 OFFER(help) ‖ FORK(help|refuse|price|defer)→help
t06 ASK(companion,other) · DECLINE(reroll) · SCOUT(self) · PRESS(roll) · PRESS(onward) ‖ FORK(check|accept)→check · FORK(reroll|keep)→keep · FORK(protect|use|leave)→use
t07 ASK(vendor,person)
t08 MOVE(private) · ASK(vendor,other) · SCOUT(self) ‖ FORK(check|accept)→check
t09 ASK(vendor,price) · ASK(vendor,lore) · ASSERT(event)
t10 ASK(vendor,other) · OFFER(coin) · SPEND(coin-medium) · ASSERT(world) · ASSERT(event) ‖ FORK(spend|haggle|keep)→spend
t11 MOVE(private) · ASK(companion,person) · ASSERT(event) ‖ FORK(protect|use|leave)→use
t12 ASSERT(world)
t13 ASK(stranger,person) · ASK(stranger,place) ‖ FORK(help|refuse|price|defer)→help
t14 MOVE(wild) · SCOUT(self) · ASSERT(world) · ASSERT(event)
t15 MOVE(wild) · SCOUT(cat) · SCOUT(self) · OOC(correct-rule) · PRESS(roll) · PRESS(onward) · PRESS(text) ‖ FORK(help|refuse|price|defer)→help · FORK(protect|use|leave)→use
t16 PROTECT(npc) · ASSERT(backstory)
t17 PROTECT(npc) · SCOUT(cat) · WAIT ‖ FORK(protect|use|leave)→use
t18 PROTECT(companion) · PROTECT(npc) · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→protect
t19 PROTECT(npc) · DECLINE(fight) ‖ FORK(hold|leave)→hold
t20 MOVE(wild) · OFFER(help)
```

### G2:C-sol — GPT-6.1 Sol

```text
Strip G2:C-sol · Table C · 20 turns
t01 ASK(vendor,person) · ASK(companion,other)
t02 SCOUT(self) · PRESS(roll) · PRESS(onward) ‖ FORK(check|accept)→accept
t03 MOVE(tavern) · LEAVE(scene)
t04 ASK(stranger,person) ‖ FORK(check|accept)→accept
t05 ASK(stranger,work) · ASK(stranger,danger) · OFFER(help) · ASSERT(event) ‖ FORK(help|refuse|price|defer)→help
t06 ASK(stranger,place) · ASK(stranger,danger) ‖ FORK(check|accept)→check
t07 MOVE(private) · DECLINE(reroll) · SCOUT(cat) · SCOUT(self) · PRESS(roll) · PRESS(onward) ‖ FORK(reroll|keep)→keep
t08 MOVE(tavern) · PROTECT(npc)
t09 ASK(authority,other) · ASSERT(world) · ASSERT(event)
t10 MOVE(tavern) · ASK(vendor,other)
t11 MOVE(private)
t12 PROTECT(companion) · ASSERT(backstory) ‖ FORK(protect|use|leave)→protect
t13 MOVE(tavern) · ASK(authority,danger) ‖ FORK(check|accept)→check
t14 MOVE(tavern) · ASK(vendor,price) · OFFER(service) ‖ FORK(help|refuse|price|defer)→help
t15 OFFER(coin) · OFFER(service) · ASSERT(event) · PRESS(roll) · PRESS(onward) ‖ FORK(help|refuse|price|defer)→help · FORK(spend|haggle|keep)→spend
t16 MOVE(tavern) · ASK(stranger,other) · OFFER(coin) · SPEND(coin-medium) ‖ FORK(spend|haggle|keep)→spend
t17 MOVE(wild) · OFFER(coin) · SPEND(coin-small) · LEAVE(scene) ‖ FORK(spend|haggle|keep)→spend
t18 ASK(stranger,place) · ASK(stranger,danger)
t19 ASSERT(backstory) · ASSERT(event)
t20 MOVE(wild) · OFFER(service) · SCOUT(self)
```

## DeepSeek (REPLICATE_1)

### DS:A-deepseek-1 — DeepSeek V4 Pro (ended: stuck)

```text
Strip DS:A-deepseek-1 · Table A · 3 turns
t01 ASK(stranger,person)
t02 MOVE(street) · ASK(stranger,person) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t03 ASK(stranger,lore) · ASK(stranger,other) · SPEND(reroll) · CAST(cantrip) · ASSERT(world) · PRESS(roll) · PRESS(reroll) · PRESS(text) ‖ FORK(reroll|keep)→reroll
```

### DS:A-deepseek-2 — DeepSeek V4 Pro (ended: stuck)

```text
Strip DS:A-deepseek-2 · Table A · 3 turns
t01 SCOUT(cat)
t02 MOVE(street) · ASK(stranger,other) · SCOUT(cat) ‖ FORK(help|refuse|price|defer)→defer · FORK(check|accept)→check · FORK(protect|use|leave)→use
t03 ASK(stranger,danger) · SCOUT(cat) · SCOUT(self) · PRESS(text) ‖ FORK(help|refuse|price|defer)→help · FORK(protect|use|leave)→use
```

### DS:B-deepseek-1 — DeepSeek V4 Pro (ended: stuck)

```text
Strip DS:B-deepseek-1 · Table B · 11 turns
t01 WAIT
t02 ASK(child,person) · DECLINE(card) ‖ FORK(check|accept)→check
t03 ‖ FORK(check|accept)→accept
t04 MOVE(street) · LEAVE(scene) ‖ FORK(protect|use|leave)→leave
t05 MOVE(wild) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t06 WAIT
t07 DECLINE(offer) · SCOUT(cat) ‖ FORK(spend|haggle|keep)→keep · FORK(protect|use|leave)→use · FORK(hold|leave)→hold
t08 MOVE(private) · WAIT
t09 ASK(stranger,person) · ASK(stranger,self)
t10 ASK(stranger,other) ‖ FORK(help|refuse|price|defer)→defer
t11 ASK(stranger,place) · SCOUT(self) · DISCOVER(world) · ASSERT(world) · ASSERT(event) · PRESS(text) ‖ FORK(help|refuse|price|defer)→defer · FORK(check|accept)→check
```

### DS:B-deepseek-2 — DeepSeek V4 Pro (ended: stuck)

```text
Strip DS:B-deepseek-2 · Table B · 12 turns
t01 —
t02 ASK(authority,rule) · ASSERT(backstory)
t03 ASSERT(backstory)
t04 MOVE(street) · DECLINE(card) · LEAVE(scene) ‖ FORK(hold|leave)→leave
t05 MOVE(tavern) · ASK(vendor,place) · OFFER(coin) ‖ FORK(spend|haggle|keep)→spend
t06 ASK(vendor,place) · OFFER(coin) · SPEND(coin-small) · DECEIVE ‖ FORK(spend|haggle|keep)→spend
t07 OFFER(coin) · SPEND(coin-small) · OOC(other) ‖ FORK(spend|haggle|keep)→spend
t08 ASK(stranger,place) · ASSERT(world)
t09 OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t10 ASK(stranger,other) · OFFER(coin) · SPEND(coin-small) ‖ FORK(check|accept)→check · FORK(spend|haggle|keep)→spend
t11 ASK(stranger,place) · ASK(stranger,other) · DISCOVER(world) · DISCOVER(event) ‖ FORK(check|accept)→check
t12 ASK(stranger,danger) · WAIT · PROPOSE(event) · PRESS(text) ‖ FORK(protect|use|leave)→use
```

### DS:C-deepseek-1 — DeepSeek V4 Pro (ended: stuck)

```text
Strip DS:C-deepseek-1 · Table C · 1 turns
t01 CAST(cantrip) · SCOUT(self) · ASSERT(event) · PRESS(roll) · PRESS(text)
```

### DS:C-deepseek-2 — DeepSeek V4 Pro

```text
Strip DS:C-deepseek-2 · Table C · 20 turns
t01 SCOUT(self)
t02 MOVE(tavern) · SPEND(coin-large) · DECLINE(card) ‖ FORK(spend|haggle|keep)→spend
t03 OFFER(coin) · SPEND(coin-small) · ASSERT(backstory) ‖ FORK(spend|haggle|keep)→spend
t04 ASK(vendor,work)
t05 ASK(stranger,work) · ASK(stranger,danger) ‖ FORK(check|accept)→check
t06 ASK(stranger,danger) ‖ FORK(help|refuse|price|defer)→defer · FORK(check|accept)→check
t07 MOVE(street) · LEAVE(scene) ‖ FORK(spend|haggle|keep)→keep · FORK(hold|leave)→leave
t08 ASSERT(world) · ASSERT(event)
t09 ASK(vendor,other) · ASSERT(event)
t10 ASSERT(backstory) · ASSERT(event)
t11 ASK(vendor,place) · ASK(vendor,danger) · ASSERT(backstory)
t12 MOVE(official) · SCOUT(self) ‖ FORK(check|accept)→check
t13 ASK(authority,person) · ASK(authority,danger)
t14 —
t15 WAIT
t16 ASK(authority,danger) · ASSERT(backstory)
t17 MOVE(tavern) · ASK(vendor,price) · ASK(vendor,danger) · OOC(clarify)
t18 ASK(vendor,person) · OFFER(coin) · ASSERT(world) ‖ FORK(help|refuse|price|defer)→help · FORK(spend|haggle|keep)→spend
t19 MOVE(tavern) · MOVE(private) · OFFER(coin) · SPEND(coin-small) · LEAVE(scene) · OOC(clarify) · ASSERT(world) ‖ FORK(spend|haggle|keep)→spend
t20 MOVE(tavern) · OFFER(coin) · SPEND(coin-large) · WAIT · ASSERT(world) ‖ FORK(spend|haggle|keep)→spend
```

## SAME_WORLD_1

### SW:A-opus-1 — Claude Opus 5.5

```text
Strip SW:A-opus-1 · Table A · 20 turns
t01 ASK(vendor,work) · ASK(vendor,place) · OFFER(coin) · SPEND(coin-small) · DECLINE(card) ‖ FORK(check|accept)→accept · FORK(spend|haggle|keep)→spend · FORK(hold|leave)→hold
t02 MOVE(street) · ASK(child,person) · ASK(child,rule) · DISCOVER(world)
t03 MOVE(street) · ASK(child,work) · ASK(child,place) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→leave
t04 MOVE(private) · ASK(vendor,place) · OFFER(coin) · SPEND(coin-small) · ASSERT(world) ‖ FORK(spend|haggle|keep)→spend
t05 OFFER(coin) · SPEND(coin-medium) ‖ FORK(spend|haggle|keep)→spend
t06 MOVE(street) · SCOUT(cat) · SCOUT(self) · DECEIVE · WAIT ‖ FORK(protect|use|leave)→use
t07 MOVE(private) · SCOUT(cat) · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→use
t08 MOVE(private) · ASK(companion,other) · SCOUT(cat) · DECEIVE · WAIT ‖ FORK(protect|use|leave)→use
t09 MOVE(street) · SCOUT(cat) · WAIT · ASSERT(world) ‖ FORK(protect|use|leave)→use
t10 SCOUT(cat) · SCOUT(self) · DECEIVE · WAIT ‖ FORK(protect|use|leave)→use
t11 MOVE(official) · ASK(vendor,price) · ASK(stranger,work) · ASK(stranger,other) · OFFER(service) · SCOUT(cat) · ASSERT(backstory) ‖ FORK(help|refuse|price|defer)→defer · FORK(protect|use|leave)→use
t12 MOVE(street) · ASK(vendor,person) · OFFER(coin) · SPEND(coin-small) · DECEIVE · LEAVE(scene) · ASSERT(backstory) ‖ FORK(help|refuse|price|defer)→help · FORK(check|accept)→check · FORK(spend|haggle|keep)→spend · FORK(hold|leave)→leave
t13 ASK(stranger,person) · ASK(stranger,place) · OFFER(coin) · OFFER(service) · SPEND(coin-small) · DECEIVE · PROPOSE(world) ‖ FORK(spend|haggle|keep)→spend
t14 MOVE(street) · ASK(stranger,person) · PROTECT(npc) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t15 ASK(vendor,person) · ASK(vendor,other) · OFFER(coin) · SPEND(coin-medium) · SCOUT(cat) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t16 MOVE(street) · OFFER(coin) · SPEND(coin-medium) · DECLINE(reroll) · SCOUT(cat) · ASSERT(world) · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend · FORK(reroll|keep)→keep · FORK(protect|use|leave)→use
t17 ASK(vendor,person) · ASK(companion,place) · OFFER(coin) · SPEND(coin-small) · SPEND(reroll) · DECLINE(reroll) · SCOUT(cat) · DECEIVE · PROPOSE(world) · ASSERT(backstory) · PRESS(roll) · PRESS(onward) · PRESS(reroll) ‖ FORK(spend|haggle|keep)→spend · FORK(reroll|keep)→keep · FORK(reroll|keep)→reroll · FORK(protect|use|leave)→use
t18 ASK(stranger,person) · DECLINE(offer) · ASSERT(event) ‖ FORK(spend|haggle|keep)→keep
t19 ASK(child,person) · ASK(child,place) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) · ASSERT(world) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t20 MOVE(street) · ASK(stranger,place) · ASK(stranger,danger) · SPEND(coin-small) · SCOUT(cat) · DECEIVE ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
```

### SW:A-fable-1 — Claude Fable 5.1

```text
Strip SW:A-fable-1 · Table A · 20 turns
t01 ASK(authority,place) · OFFER(service) · DECLINE(card) ‖ FORK(hold|leave)→hold
t02 MOVE(street) · ASK(authority,person) · ASK(child,danger) · OFFER(coin) · SCOUT(cat) · SCOUT(self) ‖ FORK(check|accept)→accept · FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t03 MOVE(tavern) · ASK(child,person) · OFFER(coin) ‖ FORK(spend|haggle|keep)→spend
t04 ASK(child,place) · ASK(child,danger) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t05 ASK(vendor,lore) · OFFER(coin) · SPEND(coin-medium) · ASSERT(backstory) ‖ FORK(spend|haggle|keep)→spend
t06 ASSERT(backstory)
t07 OOC(other) · ASSERT(backstory) · ASSERT(world)
t08 MOVE(private) · WAIT · ASSERT(backstory)
t09 ASK(companion,other) · SPEND(reroll) · DECLINE(reroll) · WAIT · PRESS(roll) · PRESS(onward) · PRESS(reroll) ‖ FORK(reroll|keep)→keep · FORK(reroll|keep)→reroll
t10 MOVE(tavern) · ASK(vendor,place) · ASK(vendor,rule) · SCOUT(cat) · SCOUT(self) · ASSERT(backstory)
t11 MOVE(street) · OFFER(coin) · OFFER(service) · SPEND(coin-small) · ASSERT(backstory) ‖ FORK(spend|haggle|keep)→spend
t12 MOVE(official) · ASK(authority,person) · SPEND(coin-small) · ASSERT(backstory) ‖ FORK(spend|haggle|keep)→spend
t13 MOVE(official) · WAIT · ASSERT(backstory)
t14 ASK(authority,person) · ASK(authority,lore) · ASSERT(backstory) · ASSERT(world)
t15 MOVE(official) · ASSERT(backstory)
t16 ASK(authority,lore) · ASSERT(world)
t17 MOVE(street) · SCOUT(cat) · DECEIVE · WAIT · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→use
t18 MOVE(tavern) · ASK(vendor,place) · OFFER(coin) · PROTECT(companion) · SPEND(coin-small) · ASSERT(backstory) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→protect
t19 MOVE(street) · ASK(vendor,place) · OFFER(coin) · SPEND(coin-small) · DECEIVE · LEAVE(scene) ‖ FORK(spend|haggle|keep)→spend
t20 WAIT ‖ FORK(protect|use|leave)→use
```

### SW:A-astra-1 — GPT-6 Astra

```text
Strip SW:A-astra-1 · Table A · 20 turns
t01 ASK(vendor,person) · ASK(vendor,place) · ASK(vendor,price)
t02 ASK(companion,danger) · OFFER(coin) · SCOUT(cat) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t03 MOVE(street) · ASK(child,danger) ‖ FORK(check|accept)→accept · FORK(protect|use|leave)→leave
t04 MOVE(private) · DECLINE(card) · DECEIVE ‖ FORK(check|accept)→accept · FORK(hold|leave)→hold
t05 ASK(child,other) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t06 ASK(companion,danger) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t07 ASK(vendor,price) · OFFER(service) ‖ FORK(protect|use|leave)→use
t08 MOVE(private) · ASSERT(backstory) ‖ FORK(help|refuse|price|defer)→help · FORK(spend|haggle|keep)→spend
t09 OOC(clarify) · ENFORCE(backstory)
t10 OOC(other) · ENFORCE(backstory)
t11 —
t12 ASK(companion,danger) · SCOUT(self) ‖ FORK(protect|use|leave)→use
t13 SCOUT(self) ‖ FORK(protect|use|leave)→use
t14 PRESS(roll) · PRESS(onward)
t15 WAIT
t16 MOVE(street) · OFFER(help) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t17 OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t18 MOVE(official) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t19 ASK(authority,other) · WAIT · ASSERT(backstory)
t20 ASK(companion,other) · SCOUT(cat) · WAIT ‖ FORK(protect|use|leave)→use
```

### SW:A-sol-1 — GPT-6.1 Sol

```text
Strip SW:A-sol-1 · Table A · 20 turns
t01 ASK(vendor,place) · ASK(vendor,price) · OFFER(coin) · DECLINE(card) ‖ FORK(spend|haggle|keep)→spend
t02 ASK(child,person) · ASK(child,danger) · DECLINE(card) ‖ FORK(help|refuse|price|defer)→help · FORK(spend|haggle|keep)→spend
t03 ASSERT(world)
t04 MOVE(tavern) · ASK(companion,other)
t05 ASK(stranger,danger) · OFFER(coin) · SPEND(coin-small) ‖ FORK(check|accept)→check · FORK(spend|haggle|keep)→spend
t06 SCOUT(self) · PROPOSE(event)
t07 ASK(vendor,place) · OFFER(coin) · SPEND(coin-small) · ASSERT(backstory) ‖ FORK(spend|haggle|keep)→spend
t08 MOVE(private) · WAIT
t09 SCOUT(self) ‖ FORK(protect|use|leave)→use
t10 WAIT
t11 OOC(clarify)
t12 OOC(clarify)
t13 WAIT
t14 MOVE(tavern) · ASK(vendor,person)
t15 MOVE(street) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t16 ASK(stranger,work) · ASK(stranger,lore) · PROPOSE(world)
t17 MOVE(street) · LEAVE(scene) ‖ FORK(hold|leave)→leave
t18 MOVE(official) · WAIT
t19 ASSERT(world)
t20 ASK(authority,other) · WAIT ‖ FORK(help|refuse|price|defer)→defer · FORK(check|accept)→check
```

### SW:A-deepseek-1 — DeepSeek V4 Pro

```text
Strip SW:A-deepseek-1 · Table A · 20 turns
t01 ASK(authority,danger) · DECLINE(card) · SCOUT(cat) ‖ FORK(check|accept)→accept
t02 ASK(authority,place) · DECLINE(card) · OOC(other)
t03 MOVE(tavern) · ASK(child,place) · ASK(child,danger) · OFFER(service) · DECLINE(card) · SCOUT(cat) · OOC(other) ‖ FORK(help|refuse|price|defer)→help · FORK(check|accept)→accept · FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use · FORK(hold|leave)→hold
t04 ASK(child,work) · ASK(child,place) · OFFER(coin) · SPEND(coin-small) · OOC(other) ‖ FORK(spend|haggle|keep)→spend
t05 MOVE(private) · SPEND(coin-small) · SCOUT(self) · WAIT ‖ FORK(spend|haggle|keep)→spend
t06 MOVE(tavern) · ASK(vendor,other) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t07 MOVE(private) · PROTECT(self) · WAIT
t08 ASK(companion,danger) · SCOUT(cat) · SCOUT(self) ‖ FORK(protect|use|leave)→use
t09 MOVE(tavern) · ASK(companion,place) · SCOUT(self) · WAIT · ASSERT(backstory) ‖ FORK(protect|use|leave)→use
t10 MOVE(official) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t11 ASK(stranger,other) · SCOUT(self) · DECEIVE · ASSERT(world)
t12 MOVE(street) · SCOUT(cat) · SCOUT(self) · LEAVE(scene) · ASSERT(world) · PRESS(roll) · PRESS(onward) · PRESS(text) ‖ FORK(check|accept)→accept · FORK(protect|use|leave)→use · FORK(hold|leave)→leave
t13 MOVE(street) · SCOUT(cat) · ASSERT(world) ‖ FORK(protect|use|leave)→use
t14 ASK(child,work) · WAIT · PROPOSE(world)
t15 SCOUT(cat) · WAIT · ASSERT(event)
t16 SCOUT(self) ‖ FORK(check|accept)→check
t17 ASK(stranger,work) · OFFER(service) · SCOUT(cat) ‖ FORK(help|refuse|price|defer)→defer · FORK(protect|use|leave)→use
t18 OFFER(service) · ASSERT(world) ‖ FORK(help|refuse|price|defer)→price · FORK(spend|haggle|keep)→keep
t19 MOVE(private) · PROTECT(npc) · SPEND(heal) · DECLINE(offer) · OOC(other) ‖ FORK(help|refuse|price|defer)→help
t20 ASSERT(world)
```

### SW:A-opus-2 — Claude Opus 5.5

```text
Strip SW:A-opus-2 · Table A · 20 turns
t01 OOC(clarify)
t02 OOC(clarify) · ENFORCE(backstory) · ENFORCE(world)
t03 OOC(clarify)
t04 ASK(child,work) · ASK(child,person) · ASK(child,place) · OFFER(coin) · SPEND(coin-large) · DECLINE(card) · SCOUT(cat) · OOC(clarify) · ASSERT(backstory) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use · FORK(hold|leave)→hold
t05 ASK(companion,person) · OFFER(coin) · SPEND(coin-medium) · SCOUT(cat) · OOC(other) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t06 MOVE(street) · ASK(stranger,person) · ASK(stranger,other) · SCOUT(cat) · DISCOVER(world) ‖ FORK(protect|use|leave)→use
t07 MOVE(private) · ASK(vendor,rule) · OFFER(service) · PROTECT(npc) · SPEND(coin-medium) · ASSERT(backstory) ‖ FORK(spend|haggle|keep)→spend
t08 ASK(companion,danger) · SCOUT(cat) · OOC(other) ‖ FORK(protect|use|leave)→use
t09 SCOUT(self) · WAIT · OOC(clarify) · ASSERT(backstory) · ENFORCE(backstory)
t10 MOVE(tavern) · ASK(child,person) · ASK(child,place) · ASK(child,other) · OFFER(coin) · SPEND(coin-small) · CAST(cantrip) · OOC(clarify) ‖ FORK(spend|haggle|keep)→spend
t11 MOVE(tavern) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t12 ASK(stranger,danger) · OFFER(coin) · SCOUT(cat) · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t13 MOVE(tavern) · ASK(authority,danger) · DECLINE(offer) · SCOUT(cat) · LEAVE(scene) · ASSERT(backstory) ‖ FORK(help|refuse|price|defer)→defer · FORK(check|accept)→check · FORK(spend|haggle|keep)→keep · FORK(protect|use|leave)→use · FORK(hold|leave)→leave
t14 ASK(vendor,person) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) · ASSERT(backstory) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t15 PROTECT(npc) · SCOUT(cat) · ASSERT(backstory) · ASSERT(event) ‖ FORK(check|accept)→accept · FORK(protect|use|leave)→use
t16 ASK(stranger,other) · SCOUT(self) · DECEIVE · ASSERT(backstory) · ASSERT(event)
t17 ASK(child,person) · ASK(child,danger) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) · ASSERT(event) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t18 ASK(stranger,place) · ASK(stranger,danger) · OFFER(coin) · PROTECT(npc) · SPEND(coin-medium) · DECEIVE · OOC(clarify) · ASSERT(world) ‖ FORK(spend|haggle|keep)→spend
t19 MOVE(tavern) · ASK(child,place) · OOC(other) ‖ FORK(help|refuse|price|defer)→defer
t20 MOVE(tavern) · ASK(vendor,other) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) · SCOUT(self) · OOC(clarify) · ASSERT(backstory) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
```

### SW:A-fable-2 — Claude Fable 5.1

```text
Strip SW:A-fable-2 · Table A · 20 turns
t01 ASK(authority,place) · DECLINE(card) · ASSERT(backstory) ‖ FORK(hold|leave)→hold
t02 MOVE(tavern) · ASK(child,lore) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t03 ASK(stranger,place) · OFFER(coin) · SPEND(coin-small) · SCOUT(self) ‖ FORK(spend|haggle|keep)→spend
t04 ASK(vendor,work) · ASK(vendor,lore) · OFFER(coin) · SPEND(coin-medium) ‖ FORK(spend|haggle|keep)→spend
t05 OFFER(coin) · OFFER(service) · SPEND(coin-small) · DECLINE(card) · ASSERT(backstory) ‖ FORK(spend|haggle|keep)→spend
t06 ASSERT(backstory) ‖ FORK(help|refuse|price|defer)→defer
t07 ASK(authority,danger) · ASSERT(backstory) ‖ FORK(help|refuse|price|defer)→help · FORK(check|accept)→check
t08 MOVE(private) · PROTECT(self) · SCOUT(cat) · SCOUT(self) ‖ FORK(protect|use|leave)→use
t09 MOVE(street) · SCOUT(cat) · SCOUT(self) ‖ FORK(protect|use|leave)→use
t10 SPEND(coin-small) · CAST(cantrip) · SCOUT(cat) · SCOUT(self) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t11 MOVE(private) · SCOUT(cat) · WAIT · LEAVE(scene)
t12 WAIT
t13 MOVE(street) · ASK(stranger,danger) · OFFER(coin) · OFFER(service) · PROTECT(companion) · SPEND(coin-small) · SCOUT(cat) · SCOUT(self) · ASSERT(backstory) ‖ FORK(spend|haggle|keep)→spend
t14 ASK(stranger,person) · ASK(stranger,danger) · ASSERT(world) · ASSERT(event) ‖ FORK(check|accept)→check
t15 MOVE(official) · SCOUT(self)
t16 ASK(authority,person) · ASK(vendor,other) · OFFER(coin) · SPEND(coin-large) · ASSERT(backstory) · ASSERT(event) ‖ FORK(spend|haggle|keep)→spend
t17 MOVE(street) · ASK(vendor,person) · SCOUT(self) · ASSERT(backstory)
t18 ASK(vendor,person) · ASK(vendor,place) · ASK(vendor,rule) · OFFER(coin) · SPEND(coin-small) · ASSERT(world) ‖ FORK(spend|haggle|keep)→spend
t19 MOVE(street) · OFFER(service) · SPEND(coin-small) · SCOUT(cat) · LEAVE(scene) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t20 ASK(stranger,place) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) · SCOUT(self) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
```

### SW:A-astra-2 — GPT-6 Astra

```text
Strip SW:A-astra-2 · Table A · 20 turns
t01 ASK(vendor,person) · ASK(vendor,place) · ASK(vendor,price) · OFFER(coin) ‖ FORK(spend|haggle|keep)→spend
t02 MOVE(official) · DECEIVE · ASSERT(backstory) ‖ FORK(spend|haggle|keep)→spend
t03 ASK(companion,other) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t04 SPEND(coin-small) · WAIT ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→protect
t05 MOVE(street) · ASK(child,person)
t06 MOVE(tavern) · ASK(child,other)
t07 ASK(vendor,price)
t08 ASK(vendor,rule) · OFFER(coin) · SPEND(coin-medium) ‖ FORK(spend|haggle|keep)→spend
t09 MOVE(private) · ASSERT(backstory)
t10 SCOUT(self) · OOC(clarify) · ENFORCE(backstory)
t11 SCOUT(self)
t12 SCOUT(self) · PRESS(roll) · PRESS(onward)
t13 —
t14 WAIT
t15 ASK(vendor,person)
t16 MOVE(street) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t17 DECLINE(reroll) · SCOUT(self) · PRESS(roll) · PRESS(onward) ‖ FORK(reroll|keep)→keep
t18 WAIT
t19 ASK(child,place) · DECLINE(offer) · PROPOSE(world) ‖ FORK(help|refuse|price|defer)→refuse · FORK(spend|haggle|keep)→keep
t20 MOVE(official) · LEAVE(scene) · ASSERT(backstory) ‖ FORK(check|accept)→accept · FORK(hold|leave)→leave
```

### SW:A-sol-2 — GPT-6.1 Sol

```text
Strip SW:A-sol-2 · Table A · 20 turns
t01 ASK(child,price) · DECLINE(card) ‖ FORK(help|refuse|price|defer)→defer · FORK(hold|leave)→hold
t02 OFFER(coin) · ASSERT(backstory) ‖ FORK(spend|haggle|keep)→spend
t03 ASK(authority,danger)
t04 ASK(authority,person) · ASSERT(world)
t05 MOVE(official) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t06 SPEND(coin-small) · SCOUT(cat) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t07 ASK(vendor,person)
t08 MOVE(tavern) · ASK(vendor,place) · ASSERT(event)
t09 ASK(vendor,danger) · ASK(vendor,rule) · OFFER(coin) · SPEND(coin-small) · PROPOSE(event) ‖ FORK(spend|haggle|keep)→spend
t10 SCOUT(cat) ‖ FORK(protect|use|leave)→use
t11 MOVE(private) · WAIT · LEAVE(scene)
t12 ASK(companion,other) · ASSERT(backstory)
t13 CAST(cantrip) · SCOUT(self) · OOC(other)
t14 OOC(clarify)
t15 —
t16 CAST(cantrip)
t17 PRESS(roll) · PRESS(onward)
t18 MOVE(tavern) · ASK(vendor,person) · ASSERT(event)
t19 ASK(vendor,place) · OOC(other) · ASSERT(backstory)
t20 MOVE(private) · LEAVE(scene) ‖ FORK(check|accept)→accept
```

### SW:A-deepseek-2 — DeepSeek V4 Pro

```text
Strip SW:A-deepseek-2 · Table A · 20 turns
t01 DECLINE(card) · SCOUT(self) · WAIT
t02 MOVE(street) · SCOUT(cat) · SCOUT(self) ‖ FORK(protect|use|leave)→use
t03 MOVE(street) · SCOUT(cat) · SCOUT(self) ‖ FORK(protect|use|leave)→use
t04 ASK(stranger,person) · ASK(stranger,place) · ASK(stranger,danger) · ASSERT(world) · PRESS(roll) · PRESS(onward) · PRESS(text) ‖ FORK(check|accept)→check · FORK(spend|haggle|keep)→keep
t05 ASK(child,place) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t06 ASSERT(world) · ASSERT(event)
t07 MOVE(street) · SCOUT(cat) ‖ FORK(help|refuse|price|defer)→help · FORK(spend|haggle|keep)→keep · FORK(protect|use|leave)→use
t08 ASK(vendor,place) · SPEND(coin-small) · SCOUT(cat) · ASSERT(world) · PRESS(roll) · PRESS(onward) · PRESS(text) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t09 —
t10 ASK(stranger,lore) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t11 ASK(stranger,lore) · OFFER(service) · ASSERT(backstory)
t12 MOVE(tavern) · ASK(stranger,lore) · ASSERT(backstory)
t13 OFFER(coin) · SCOUT(cat) · SCOUT(self) ‖ FORK(protect|use|leave)→use
t14 ASK(vendor,place) · ASK(vendor,lore) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t15 MOVE(private) · WAIT · LEAVE(scene) ‖ FORK(protect|use|leave)→leave
t16 DECLINE(card) · WAIT · ASSERT(backstory)
t17 WAIT · ASSERT(backstory)
t18 MOVE(tavern) · ASK(vendor,person) · ASK(companion,danger) ‖ FORK(protect|use|leave)→use
t19 MOVE(street) · ASK(vendor,lore) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) ‖ FORK(check|accept)→accept · FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t20 ASK(stranger,other) · SCOUT(cat) · SCOUT(self) ‖ FORK(protect|use|leave)→use
```

### SW:B-opus-1 — Claude Opus 5.5

```text
Strip SW:B-opus-1 · Table B · 20 turns
t01 ASK(authority,price) · ASK(authority,danger) · SCOUT(cat) · ASSERT(backstory) ‖ FORK(protect|use|leave)→use
t02 ASK(authority,danger) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) ‖ FORK(check|accept)→check · FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t03 ASK(authority,work) · SCOUT(cat) · ASSERT(event) ‖ FORK(protect|use|leave)→use
t04 MOVE(street) · SCOUT(cat) · SCOUT(self) ‖ FORK(protect|use|leave)→use
t05 ASK(companion,danger) · OFFER(coin) · PROTECT(npc) · SPEND(coin-small) · SCOUT(self) · ASSERT(backstory) ‖ FORK(spend|haggle|keep)→spend
t06 ASK(child,person) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t07 MOVE(street) · ASK(child,person) · ASK(child,place) · PROTECT(npc) · SCOUT(cat) · ASSERT(world) ‖ FORK(check|accept)→accept · FORK(protect|use|leave)→use
t08 OFFER(trade) · SCOUT(cat) · DECEIVE · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t09 OFFER(coin) · SPEND(coin-medium) · ASSERT(world) ‖ FORK(check|accept)→accept · FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t10 ASK(stranger,person) · ASK(stranger,place) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t11 MOVE(street) · SCOUT(cat) · LEAVE(scene) · ASSERT(world) ‖ FORK(protect|use|leave)→use
t12 PROTECT(companion) · WAIT · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→protect
t13 MOVE(street) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t14 ASK(stranger,person) · SCOUT(cat) · ASSERT(event) ‖ FORK(protect|use|leave)→use
t15 ASK(stranger,place) · ASK(stranger,other) · DECLINE(offer) · SCOUT(cat) · ASSERT(world) · ASSERT(event) ‖ FORK(help|refuse|price|defer)→defer · FORK(spend|haggle|keep)→keep · FORK(protect|use|leave)→use
t16 MOVE(private) · ASK(stranger,place) · SCOUT(cat) · SCOUT(self) ‖ FORK(protect|use|leave)→use
t17 MOVE(wild) · ASK(vendor,other) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) · LEAVE(scene) · ASSERT(world) ‖ FORK(check|accept)→check · FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t18 ASK(authority,work) · OFFER(help) · ASSERT(world) · ASSERT(event)
t19 MOVE(private) · ASK(companion,danger) · SCOUT(cat) · WAIT · LEAVE(scene) · OOC(clarify) ‖ FORK(protect|use|leave)→use · FORK(hold|leave)→leave
t20 MOVE(street) · ASK(vendor,person) · ASK(vendor,place) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) · ASSERT(world) · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
```

### SW:B-fable-1 — Claude Fable 5.1

```text
Strip SW:B-fable-1 · Table B · 20 turns
t01 ASK(authority,work) · ASSERT(backstory)
t02 ASK(companion,danger) · SCOUT(cat) · LEAVE(scene) ‖ FORK(check|accept)→accept · FORK(protect|use|leave)→use · FORK(hold|leave)→leave
t03 MOVE(wild) · SCOUT(cat) · SCOUT(self) ‖ FORK(protect|use|leave)→use
t04 ASK(child,place) · ASK(child,danger) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) · ASSERT(backstory) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t05 ASK(child,person) · ASK(child,danger) ‖ FORK(check|accept)→check
t06 MOVE(street) · SCOUT(cat) · DECEIVE · ASSERT(event) ‖ FORK(help|refuse|price|defer)→help · FORK(check|accept)→check · FORK(protect|use|leave)→use
t07 ASK(child,place) · OFFER(service) · PROTECT(npc) · ASSERT(event) · PRESS(roll) · PRESS(onward)
t08 MOVE(tavern) · ASK(child,person) · OFFER(coin) · SPEND(coin-small) · DECLINE(card) · ASSERT(event) ‖ FORK(help|refuse|price|defer)→refuse · FORK(spend|haggle|keep)→spend
t09 OFFER(coin) · SPEND(coin-small) ‖ FORK(help|refuse|price|defer)→help · FORK(spend|haggle|keep)→spend
t10 ASK(child,other) · OFFER(coin) · SPEND(coin-small) · ASSERT(backstory) ‖ FORK(spend|haggle|keep)→spend
t11 MOVE(tavern) · ASK(child,person) · OFFER(help) · PROPOSE(event)
t12 PROTECT(npc) · SCOUT(self) · ASSERT(world)
t13 ASK(child,person) · OFFER(trade) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t14 OFFER(trade) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) · WAIT ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t15 OFFER(trade) · OFFER(coin) · WAIT ‖ FORK(spend|haggle|keep)→spend
t16 OFFER(coin) · OFFER(service) · SPEND(coin-medium) ‖ FORK(spend|haggle|keep)→spend
t17 ASK(child,place) · OFFER(coin) · SPEND(coin-small) · ASSERT(world) ‖ FORK(spend|haggle|keep)→spend
t18 MOVE(tavern) · ASK(vendor,price) · OFFER(coin) · PROTECT(npc) · ASSERT(world)
t19 OFFER(coin) · SPEND(coin-small) · ASSERT(backstory) · ASSERT(world) ‖ FORK(spend|haggle|keep)→spend
t20 MOVE(private) · SCOUT(cat) · WAIT ‖ FORK(protect|use|leave)→use
```

### SW:B-astra-1 — GPT-6 Astra

```text
Strip SW:B-astra-1 · Table B · 20 turns
t01 ASK(companion,danger) · SCOUT(self) · WAIT ‖ FORK(protect|use|leave)→use
t02 ASK(authority,place)
t03 MOVE(street) · ASK(companion,danger) · LEAVE(scene) ‖ FORK(protect|use|leave)→use · FORK(hold|leave)→hold
t04 MOVE(street) · ASK(authority,danger) · ASSERT(event)
t05 LEAVE(scene) · ASSERT(event)
t06 MOVE(tavern) ‖ FORK(hold|leave)→leave
t07 ASK(stranger,person) · ASK(stranger,other)
t08 DECLINE(reroll) · SCOUT(self) · PRESS(roll) · PRESS(onward) ‖ FORK(help|refuse|price|defer)→help · FORK(check|accept)→check · FORK(reroll|keep)→keep
t09 ASK(child,person)
t10 MOVE(street) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t11 SCOUT(cat) ‖ FORK(protect|use|leave)→use
t12 ASK(child,lore) · OFFER(help) · ASSERT(world) · ASSERT(event)
t13 OFFER(coin) · PROTECT(npc) · SPEND(coin-small) · ASSERT(world) · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend
t14 ASK(companion,danger) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t15 ASK(companion,danger) ‖ FORK(protect|use|leave)→use
t16 MOVE(official) · PROTECT(npc) · ASSERT(world) · ASSERT(event)
t17 ASK(authority,danger) · ASSERT(world) · ASSERT(event) ‖ FORK(check|accept)→check
t18 MOVE(private) · ASK(authority,other) · SCOUT(cat) · SCOUT(self) · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→use
t19 SCOUT(cat) ‖ FORK(protect|use|leave)→use
t20 MOVE(street) · SCOUT(cat) · WAIT · LEAVE(scene) ‖ FORK(protect|use|leave)→use · FORK(hold|leave)→leave
```

### SW:B-sol-1 — GPT-6.1 Sol

```text
Strip SW:B-sol-1 · Table B · 20 turns
t01 ASK(companion,danger) · DECLINE(card) · SCOUT(cat) ‖ FORK(spend|haggle|keep)→keep · FORK(protect|use|leave)→use
t02 ASK(authority,danger) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t03 ASK(companion,other) · SCOUT(cat) · SCOUT(self) ‖ FORK(protect|use|leave)→use
t04 ASK(stranger,other)
t05 PROTECT(npc) · DECLINE(reroll) · SCOUT(self) · ASSERT(event) · PRESS(roll) · PRESS(onward) ‖ FORK(reroll|keep)→keep
t06 —
t07 MOVE(street) · OFFER(coin) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t08 ASK(vendor,place) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t09 ASK(vendor,place) · ASK(vendor,rule) · ASSERT(world)
t10 ASK(child,person) · ASK(child,danger) ‖ FORK(check|accept)→check
t11 MOVE(private) ‖ FORK(help|refuse|price|defer)→help · FORK(check|accept)→accept
t12 ASK(child,other) · ASSERT(event)
t13 OFFER(help) · PROTECT(npc) · ASSERT(world) ‖ FORK(check|accept)→check
t14 MOVE(street) · ASK(child,person) · PROTECT(npc) · PRESS(roll) · PRESS(onward)
t15 OFFER(help) · OFFER(service) · SPEND(heal)
t16 PROTECT(npc) · WAIT
t17 ASK(authority,place) · PROTECT(npc) · ASSERT(backstory) · ASSERT(world) · ASSERT(event)
t18 MOVE(tavern) · ASK(authority,other) · OFFER(coin) · PROTECT(npc) · SPEND(coin-small) · LEAVE(scene) · ASSERT(world) ‖ FORK(spend|haggle|keep)→spend
t19 OFFER(coin) · SPEND(coin-medium) · WAIT · ASSERT(event) ‖ FORK(spend|haggle|keep)→spend
t20 OFFER(help) · PROTECT(npc) · WAIT ‖ FORK(check|accept)→accept
```

### SW:B-deepseek-1 — DeepSeek V4 Pro (ended: stuck)

```text
Strip SW:B-deepseek-1 · Table B · 6 turns
t01 ASSERT(event)
t02 ASK(authority,work)
t03 —
t04 ASK(vendor,work) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t05 —
t06 ASK(child,lore) · OFFER(trade) · ASSERT(backstory) · ASSERT(world) · PRESS(roll) · PRESS(text) ‖ FORK(check|accept)→check
```

### SW:B-opus-2 — Claude Opus 5.5

```text
Strip SW:B-opus-2 · Table B · 20 turns
t01 ASK(authority,place) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t02 SCOUT(cat) · SCOUT(self) ‖ FORK(protect|use|leave)→use
t03 MOVE(street) · SCOUT(cat) · SCOUT(self) · ASSERT(world) ‖ FORK(protect|use|leave)→use
t04 MOVE(tavern) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t05 SPEND(coin-small) · SPEND(reroll) · DECLINE(reroll) · SCOUT(cat) · DECEIVE · ASSERT(backstory) · PRESS(roll) · PRESS(onward) · PRESS(reroll) ‖ FORK(check|accept)→check · FORK(spend|haggle|keep)→spend · FORK(reroll|keep)→keep · FORK(reroll|keep)→reroll · FORK(protect|use|leave)→use
t06 OFFER(trade) · DECLINE(reroll) · OOC(other) · ASSERT(event) · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend · FORK(reroll|keep)→keep
t07 ASK(stranger,danger) · ASK(stranger,lore) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) ‖ FORK(check|accept)→check · FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t08 OFFER(coin) · SPEND(coin-small) · SCOUT(cat) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t09 ASK(stranger,person) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t10 MOVE(private) · ASK(child,person) · ASK(child,other) · OFFER(help) · DECLINE(offer) · SCOUT(cat) ‖ FORK(help|refuse|price|defer)→help · FORK(spend|haggle|keep)→keep · FORK(protect|use|leave)→use
t11 ASK(child,person) · OFFER(trade) · SPEND(coin-small) · SCOUT(cat) · ASSERT(event) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t12 ASK(child,person) · SPEND(heal) · SCOUT(cat) · OOC(other) · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→use
t13 ASK(stranger,other) · PROTECT(npc) · SCOUT(cat) · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→use
t14 ASK(stranger,place) · PROTECT(npc) · SCOUT(cat) · PROPOSE(world) ‖ FORK(protect|use|leave)→use
t15 ASK(stranger,place) · OFFER(coin) · OFFER(service) · SPEND(coin-small) · SCOUT(cat) · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t16 MOVE(private) · SCOUT(cat) · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→use
t17 ASK(vendor,place) · OFFER(coin) · SPEND(coin-medium) · SCOUT(cat) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t18 ASK(vendor,person) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) · PROPOSE(world) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t19 MOVE(street) · SCOUT(cat) · WAIT · OOC(other) · PRESS(roll) · PRESS(onward) ‖ FORK(check|accept)→accept · FORK(protect|use|leave)→use
t20 MOVE(official) · OFFER(coin) · SPEND(coin-small) · DECLINE(reroll) · SCOUT(self) · WAIT · OOC(clarify) · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend · FORK(reroll|keep)→keep
```

### SW:B-fable-2 — Claude Fable 5.1

```text
Strip SW:B-fable-2 · Table B · 20 turns
t01 ASK(authority,work) · ASK(authority,place) · DECLINE(card) · SCOUT(cat) · DISCOVER(world) ‖ FORK(protect|use|leave)→use
t02 ASK(companion,danger) · SCOUT(cat) · LEAVE(scene) ‖ FORK(protect|use|leave)→use
t03 ASK(stranger,place) · OFFER(service) · PROTECT(npc) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t04 MOVE(street) · ASK(companion,other) · OFFER(coin) · SCOUT(cat) · SCOUT(self) · DECEIVE · ASSERT(backstory) · PRESS(roll) · PRESS(onward) ‖ FORK(check|accept)→check · FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t05 MOVE(tavern) · OFFER(coin) · SCOUT(cat) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t06 ASK(companion,person) · WAIT ‖ FORK(protect|use|leave)→use
t07 ASK(stranger,person) · ASK(stranger,other) · ASSERT(world)
t08 MOVE(street) · OFFER(coin) · PROTECT(npc) · SPEND(coin-small) · SCOUT(cat) ‖ FORK(help|refuse|price|defer)→help · FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t09 MOVE(private) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t10 ASK(child,other) · OFFER(help) · SPEND(reroll) · SCOUT(self) · PRESS(roll) · PRESS(onward) · PRESS(reroll) ‖ FORK(check|accept)→check · FORK(reroll|keep)→reroll
t11 OFFER(service) · SPEND(heal) · ASSERT(world) · ASSERT(event)
t12 MOVE(street) · ASK(stranger,work) · SCOUT(cat) · ASSERT(event) ‖ FORK(protect|use|leave)→use
t13 ASK(stranger,person) · ASK(stranger,danger) · OFFER(coin) · SPEND(coin-small) · SPEND(reroll) · DECLINE(card) · ASSERT(world) · ASSERT(event) · PRESS(roll) · PRESS(onward) · PRESS(reroll) ‖ FORK(spend|haggle|keep)→spend · FORK(reroll|keep)→reroll · FORK(hold|leave)→hold
t14 ASK(stranger,place) · SCOUT(cat) · LEAVE(scene) ‖ FORK(protect|use|leave)→use
t15 ASK(vendor,price) · OFFER(coin) · PROTECT(npc) · LEAVE(scene) ‖ FORK(spend|haggle|keep)→spend
t16 MOVE(street) · OFFER(coin) · SPEND(coin-medium) · LEAVE(scene) ‖ FORK(check|accept)→accept · FORK(spend|haggle|keep)→spend · FORK(hold|leave)→leave
t17 MOVE(tavern) · SCOUT(cat) · ASSERT(world)
t18 ASK(vendor,person) · ASK(vendor,place) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t19 MOVE(private) · SCOUT(cat) · SCOUT(self) · WAIT · ASSERT(world) ‖ FORK(protect|use|leave)→use
t20 MOVE(official) · ASK(authority,lore) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) · ASSERT(event) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
```

### SW:B-astra-2 — GPT-6 Astra

```text
Strip SW:B-astra-2 · Table B · 20 turns
t01 ASK(companion,danger) · DECLINE(card) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t02 ASK(authority,place)
t03 SCOUT(cat) · SCOUT(self) ‖ FORK(protect|use|leave)→use
t04 MOVE(street) · ASK(child,other) · OFFER(coin) · DECLINE(reroll) · DECLINE(card) · LEAVE(scene) · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend · FORK(reroll|keep)→keep · FORK(hold|leave)→leave
t05 OFFER(trade) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t06 ASK(vendor,place) · ASSERT(world)
t07 MOVE(official) · OFFER(coin) · SPEND(coin-small) · DECEIVE · LEAVE(scene) ‖ FORK(spend|haggle|keep)→spend
t08 ASK(stranger,other) · ASSERT(world) · ASSERT(event) ‖ FORK(help|refuse|price|defer)→defer · FORK(check|accept)→check · FORK(spend|haggle|keep)→keep
t09 MOVE(private) · ASK(stranger,place) · OFFER(service) ‖ FORK(help|refuse|price|defer)→help · FORK(spend|haggle|keep)→keep
t10 ASK(child,other) · ASSERT(event)
t11 OFFER(coin) ‖ FORK(spend|haggle|keep)→spend
t12 MOVE(official) · PROTECT(npc) · LEAVE(scene)
t13 OFFER(coin) · ASSERT(world) · ASSERT(event) ‖ FORK(spend|haggle|keep)→spend
t14 ASK(vendor,lore) · OFFER(coin) · SPEND(coin-medium) ‖ FORK(spend|haggle|keep)→spend
t15 OFFER(coin) · SPEND(coin-large) · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend
t16 MOVE(private) · LEAVE(scene) ‖ FORK(check|accept)→check
t17 MOVE(private) · LEAVE(scene) · ASSERT(backstory) ‖ FORK(hold|leave)→leave
t18 ASK(stranger,place) · OFFER(help) · PROTECT(npc) ‖ FORK(help|refuse|price|defer)→help · FORK(spend|haggle|keep)→spend
t19 MOVE(tavern) · ASK(stranger,other) · PRESS(roll) · PRESS(onward) ‖ FORK(check|accept)→check · FORK(hold|leave)→leave
t20 ASK(vendor,place) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
```

### SW:B-sol-2 — GPT-6.1 Sol

```text
Strip SW:B-sol-2 · Table B · 20 turns
t01 ASK(companion,danger) · DECLINE(card) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t02 ASK(authority,danger)
t03 ASK(authority,danger) · ASSERT(world) ‖ FORK(protect|use|leave)→use
t04 SCOUT(cat) · SCOUT(self) ‖ FORK(check|accept)→check · FORK(protect|use|leave)→use
t05 ASK(child,other) · DECLINE(card) ‖ FORK(spend|haggle|keep)→keep · FORK(hold|leave)→hold
t06 ASK(child,danger) · ASSERT(event)
t07 ASK(child,other) · ASSERT(world) · ASSERT(event)
t08 OFFER(coin) · ASSERT(event)
t09 ASK(authority,place) · ASK(authority,danger) · ASK(child,rule)
t10 MOVE(official) · ASK(vendor,person)
t11 ASK(stranger,place) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t12 MOVE(street) · OFFER(coin) · PROTECT(npc)
t13 MOVE(tavern) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) ‖ FORK(check|accept)→accept · FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t14 ASK(vendor,other) · OFFER(help) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t15 ASK(child,danger) · ASK(vendor,other) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend
t16 ASK(companion,person) ‖ FORK(check|accept)→accept
t17 ASK(companion,other) · DISCOVER(world) · PRESS(roll) · PRESS(onward)
t18 ASK(child,other) · PROTECT(npc)
t19 WAIT · ASSERT(backstory)
t20 ASK(stranger,other) · WAIT ‖ FORK(check|accept)→check
```

### SW:B-deepseek-2 — DeepSeek V4 Pro

```text
Strip SW:B-deepseek-2 · Table B · 20 turns
t01 WAIT · ASSERT(world)
t02 SCOUT(cat) · DECEIVE ‖ FORK(protect|use|leave)→use
t03 ASK(authority,place)
t04 OFFER(help) · PROPOSE(world) · ASSERT(world)
t05 ASSERT(world) · ASSERT(event)
t06 PROTECT(npc) · SCOUT(cat) · ASSERT(event) ‖ FORK(protect|use|leave)→use
t07 MOVE(street) · ASK(child,person) · ASK(child,danger)
t08 PROTECT(npc) · SCOUT(cat) · ASSERT(world) ‖ FORK(protect|use|leave)→use
t09 PROTECT(npc) · SCOUT(cat) · DECEIVE · ASSERT(backstory) · ASSERT(event) · PRESS(roll) · PRESS(onward) · PRESS(text) ‖ FORK(check|accept)→accept · FORK(protect|use|leave)→use
t10 ‖ FORK(help|refuse|price|defer)→defer
t11 OFFER(help) · PROTECT(npc) · SCOUT(cat) ‖ FORK(help|refuse|price|defer)→help · FORK(protect|use|leave)→use
t12 MOVE(street) · SCOUT(cat) · LEAVE(scene) · OOC(other) ‖ FORK(protect|use|leave)→use
t13 DECLINE(offer) · DECEIVE · OOC(clarify) ‖ FORK(help|refuse|price|defer)→defer · FORK(spend|haggle|keep)→keep · FORK(hold|leave)→hold
t14 ASSERT(world)
t15 —
t16 MOVE(tavern) · SCOUT(cat)
t17 ASK(vendor,person) · OFFER(coin) ‖ FORK(spend|haggle|keep)→spend
t18 OFFER(coin) · SPEND(coin-small) · WAIT ‖ FORK(spend|haggle|keep)→spend
t19 SCOUT(cat) · ASSERT(world) ‖ FORK(protect|use|leave)→use
t20 MOVE(private) · WAIT
```

## COMBAT_1

### CW:CW-opus — Claude Opus 5.5

```text
Strip CW:CW-opus · Table CW · 25 turns
t01 PROTECT(companion) · SCOUT(cat) ‖ FORK(protect|use|leave)→protect
t02 ASK(stranger,danger) · SCOUT(cat) · WAIT ‖ FORK(protect|use|leave)→use
t03 MOVE(wild) · OFFER(service) · SCOUT(cat) · SCOUT(self) · PRESS(roll) · PRESS(onward) ‖ FORK(help|refuse|price|defer)→price · FORK(spend|haggle|keep)→keep · FORK(protect|use|leave)→use
t04 CAST(slot) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t05 CAST(cantrip) · PRESS(roll) · PRESS(onward)
t06 OOC(correct-rule)
t07 OOC(other)
t08 OFFER(trade) · CAST(cantrip) · SCOUT(cat) · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→use
t09 ASK(stranger,other) · OFFER(trade) · PROTECT(npc) · OOC(other) ‖ FORK(protect|use|leave)→use
t10 ASK(stranger,person) · OFFER(coin) · OOC(other) ‖ FORK(check|accept)→accept · FORK(spend|haggle|keep)→spend
t11 OFFER(coin) · SPEND(coin-large) · WAIT · ASSERT(world) ‖ FORK(check|accept)→accept · FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t12 PROTECT(npc) · DECLINE(fight) · CAST(cantrip) · OOC(other) ‖ FORK(protect|use|leave)→use · FORK(hold|leave)→hold
t13 CAST(cantrip) · SCOUT(cat) · OOC(other) · PROPOSE(world) ‖ FORK(protect|use|leave)→use
t14 PROTECT(npc) · SPEND(heal) · OOC(other)
t15 MOVE(wild) · ASK(companion,person) · OFFER(coin) · SCOUT(cat) · LEAVE(scene) · OOC(other) ‖ FORK(protect|use|leave)→use · FORK(hold|leave)→leave
t16 ASK(child,place) · DECLINE(offer) · OOC(other) · ASSERT(event)
t17 MOVE(wild) · CAST(cantrip) · SCOUT(self) · OOC(clarify) · PROPOSE(world) ‖ FORK(protect|use|leave)→use
t18 ASK(child,danger) · WAIT · OOC(clarify)
t19 MOVE(tavern) · OFFER(coin) · OOC(clarify) · ASSERT(world)
t20 MOVE(tavern) · OFFER(coin) · ASSERT(event) ‖ FORK(spend|haggle|keep)→spend
t21 MOVE(tavern) · OFFER(coin) · SPEND(coin-small) · OOC(clarify) ‖ FORK(spend|haggle|keep)→spend
t22 OFFER(coin) · SPEND(coin-medium) · SCOUT(cat) · OOC(clarify) · ASSERT(event) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t23 ASK(vendor,person) · OOC(clarify) · ASSERT(world)
t24 SCOUT(cat) · OOC(clarify) · ASSERT(event) · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→use
t25 ASK(stranger,price) · DECEIVE · OOC(clarify) · ASSERT(world) · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→use
```

### CW:CW-fable — Claude Fable 5.1

```text
Strip CW:CW-fable · Table CW · 25 turns
t01 PROTECT(npc) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t02 ASK(stranger,other) · PROTECT(companion) ‖ FORK(protect|use|leave)→protect
t03 ASK(stranger,person) · ASK(stranger,other) · ASSERT(backstory) ‖ FORK(check|accept)→check
t04 MOVE(wild) · PROTECT(npc) · SCOUT(self) · WAIT · ASSERT(world) · PRESS(roll) · PRESS(onward) ‖ FORK(help|refuse|price|defer)→help · FORK(check|accept)→check · FORK(protect|use|leave)→leave
t05 MOVE(street) · SCOUT(cat) · SCOUT(self) · WAIT · OOC(other) · PRESS(roll) · PRESS(onward) · PRESS(text) ‖ FORK(protect|use|leave)→use
t06 MOVE(wild) · SCOUT(self) · WAIT · ASSERT(world) · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→protect
t07 SCOUT(cat) · SCOUT(self) · WAIT · PROPOSE(world) ‖ FORK(protect|use|leave)→use
t08 CAST(slot) · SCOUT(cat) · DECEIVE · ASSERT(event) · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→use
t09 PROTECT(npc) · SCOUT(cat) · WAIT · LEAVE(scene) ‖ FORK(protect|use|leave)→use
t10 PROTECT(npc) · SCOUT(cat) · LEAVE(scene) · ASSERT(backstory) ‖ FORK(protect|use|leave)→use · FORK(hold|leave)→leave
t11 MOVE(wild) · PROTECT(npc) · DECLINE(offer) · SCOUT(cat) · LEAVE(scene) · ASSERT(backstory) ‖ FORK(help|refuse|price|defer)→refuse · FORK(protect|use|leave)→use · FORK(hold|leave)→leave
t12 MOVE(wild) · ASK(child,danger) · CAST(cantrip) · SCOUT(cat) · ASSERT(world) · ASSERT(event) ‖ FORK(protect|use|leave)→use
t13 ASK(child,place) · SCOUT(cat) · DECEIVE ‖ FORK(protect|use|leave)→use
t14 MOVE(street) · DECEIVE
t15 PROTECT(npc) · SCOUT(cat) · DECEIVE · LEAVE(scene) ‖ FORK(protect|use|leave)→use
t16 MOVE(private) · ASK(stranger,person) · ASSERT(event)
t17 ASK(vendor,other) · PROTECT(npc) · ASSERT(backstory) · ASSERT(world) · ASSERT(event)
t18 ASK(vendor,place) · ASK(vendor,other) · OFFER(coin) · WAIT · PROPOSE(event) ‖ FORK(spend|haggle|keep)→spend
t19 ASK(vendor,place) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) · DECEIVE · WAIT · ASSERT(world) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t20 SCOUT(cat) · WAIT ‖ FORK(protect|use|leave)→use
t21 WAIT · ASSERT(world)
t22 MOVE(street) · DECEIVE · ASSERT(event) ‖ FORK(spend|haggle|keep)→keep
t23 MOVE(private) · DECEIVE · ASSERT(backstory)
t24 ASK(authority,rule) · ASK(authority,other) · DECEIVE · ASSERT(backstory) · ASSERT(world) · ASSERT(event) · PRESS(roll) · PRESS(onward)
t25 ASK(authority,person) · SPEND(reroll) · DECLINE(reroll) · DECEIVE · ASSERT(world) · PRESS(roll) · PRESS(onward) · PRESS(reroll) ‖ FORK(check|accept)→check · FORK(reroll|keep)→keep · FORK(reroll|keep)→reroll
```

### CW:CW-astra — GPT-6 Astra

```text
Strip CW:CW-astra · Table CW · 25 turns
t01 SCOUT(cat) · WAIT ‖ FORK(protect|use|leave)→use
t02 MOVE(wild) · PROTECT(npc) · SCOUT(self) · PRESS(roll) · PRESS(onward)
t03 —
t04 SCOUT(self) · PRESS(roll) · PRESS(onward) ‖ FORK(check|accept)→check
t05 SCOUT(self) · PRESS(roll) · PRESS(onward)
t06 PROTECT(companion) · CAST(slot) ‖ FORK(protect|use|leave)→protect
t07 PROTECT(npc) · CAST(cantrip) · PRESS(roll) · PRESS(onward)
t08 PROTECT(companion) · CAST(cantrip) · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→protect
t09 PROTECT(npc) · SPEND(reroll) · PRESS(roll) · PRESS(onward) · PRESS(reroll) ‖ FORK(reroll|keep)→reroll
t10 ASK(stranger,price) · PROTECT(npc) · CAST(cantrip) · PRESS(roll) · PRESS(onward)
t11 OFFER(trade) · OFFER(coin) ‖ FORK(spend|haggle|keep)→haggle
t12 OFFER(coin) · SPEND(coin-large) ‖ FORK(spend|haggle|keep)→spend
t13 PROTECT(npc) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t14 PROTECT(npc) · CAST(cantrip) · PRESS(roll) · PRESS(onward)
t15 LEAVE(scene)
t16 ASK(stranger,work) · ASK(stranger,other) · ASSERT(world)
t17 MOVE(wild) · SCOUT(cat) · LEAVE(scene) ‖ FORK(protect|use|leave)→use · FORK(hold|leave)→leave
t18 LEAVE(scene) · ASSERT(event) ‖ FORK(check|accept)→accept
t19 ASK(vendor,place) · ASK(companion,danger) · WAIT ‖ FORK(check|accept)→check
t20 ASK(vendor,person) · CAST(cantrip)
t21 MOVE(wild)
t22 MOVE(tavern) · CAST(cantrip) · SCOUT(self)
t23 ASSERT(world)
t24 MOVE(official)
t25 ASK(authority,lore) · ASSERT(backstory) · ASSERT(world) · ASSERT(event)
```

### CW:CW-sol — GPT-6.1 Sol

```text
Strip CW:CW-sol · Table CW · 25 turns
t01 MOVE(wild) · PROTECT(npc) · SCOUT(self)
t02 ASK(stranger,rule)
t03 ASK(child,person) · ASK(child,place) · OFFER(help) · SCOUT(cat) ‖ FORK(help|refuse|price|defer)→help · FORK(check|accept)→accept · FORK(protect|use|leave)→use
t04 MOVE(wild) · PROTECT(npc) · SCOUT(cat) · SCOUT(self) ‖ FORK(protect|use|leave)→use
t05 MOVE(wild) · SCOUT(self) · PRESS(roll) · PRESS(onward)
t06 SCOUT(self) ‖ FORK(protect|use|leave)→leave
t07 MOVE(wild) · SCOUT(cat) · SCOUT(self) · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→use
t08 CAST(cantrip) · CAST(slot)
t09 MOVE(wild) · PROTECT(npc) · LEAVE(scene) · ASSERT(backstory) · PRESS(roll) · PRESS(onward)
t10 PROTECT(npc) · LEAVE(scene) · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→use
t11 MOVE(wild) · OFFER(help) · PROTECT(npc) · PRESS(roll) · PRESS(onward)
t12 MOVE(wild) · PROTECT(npc) · SPEND(reroll) · ASSERT(event) · PRESS(roll) · PRESS(onward) · PRESS(reroll) ‖ FORK(reroll|keep)→reroll
t13 MOVE(wild) · PROTECT(npc) · SCOUT(cat) · ASSERT(world) · PRESS(roll) · PRESS(onward) ‖ FORK(protect|use|leave)→use
t14 ASK(stranger,place) · PROTECT(npc)
t15 MOVE(wild) · SCOUT(cat) ‖ FORK(check|accept)→accept
t16 ASK(stranger,place)
t17 OFFER(service) · ASSERT(event)
t18 WAIT
t19 OFFER(help) · WAIT
t20 ASK(stranger,person)
t21 ASK(stranger,danger) ‖ FORK(check|accept)→check
t22 PROTECT(npc)
t23 MOVE(wild) · OFFER(service) · PROPOSE(world)
t24 SCOUT(self) · DISCOVER(world) · PRESS(roll) · PRESS(onward)
t25 MOVE(wild) · ASK(stranger,other)
```

## VILLAIN_1

### VL:V-opus — Claude Opus 5.5

```text
Strip VL:V-opus · Table V · 20 turns
t01 ASK(child,person) · ASK(child,place) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) · DECEIVE ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t02 MOVE(tavern) · ASK(child,person) · ASK(vendor,person) · OFFER(coin) · SPEND(coin-medium) · SCOUT(self) · DECEIVE ‖ FORK(check|accept)→accept · FORK(spend|haggle|keep)→spend
t03 ASK(stranger,work) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) · ASSERT(world) · ASSERT(event) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t04 ASK(stranger,price) · ASK(stranger,other) · DECLINE(offer) · DECEIVE · ASSERT(world)
t05 OFFER(trade) · OFFER(coin) · SPEND(coin-medium) · DECEIVE ‖ FORK(help|refuse|price|defer)→price · FORK(spend|haggle|keep)→spend
t06 ASK(vendor,person) · ASK(vendor,place) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t07 MOVE(private) · OFFER(coin) · SPEND(coin-small) · SCOUT(cat) · DECEIVE ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t08 MOVE(private) · SCOUT(self)
t09 ASK(vendor,person) · OFFER(coin) · SPEND(coin-small) · DECLINE(reroll) · DECEIVE · OOC(other) · ASSERT(backstory) · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend · FORK(reroll|keep)→keep
t10 ASK(vendor,place) · SCOUT(cat)
t11 MOVE(private) · SCOUT(cat) · SCOUT(self) ‖ FORK(check|accept)→check · FORK(protect|use|leave)→use
t12 ASK(vendor,person) · ASK(vendor,price) · ASSERT(backstory)
t13 OFFER(coin) · SPEND(coin-medium) · DECEIVE · ASSERT(world) ‖ FORK(spend|haggle|keep)→spend
t14 MOVE(street) · ASK(vendor,person) · OFFER(trade) · LEAVE(scene) · ASSERT(world) · PRESS(roll) · PRESS(onward)
t15 MOVE(tavern) · ASK(vendor,person) · OFFER(trade) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t16 OFFER(coin) · SPEND(coin-small) · SCOUT(cat) · ASSERT(world) · ASSERT(event) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t17 MOVE(private) · SCOUT(self) · LEAVE(scene) · ASSERT(world)
t18 OFFER(trade) · DECLINE(reroll) · SCOUT(cat) · ASSERT(backstory) · PRESS(roll) · PRESS(onward) ‖ FORK(reroll|keep)→keep
t19 OFFER(trade) · OOC(clarify) · ASSERT(backstory) · ASSERT(world)
t20 MOVE(private) · SCOUT(cat) · LEAVE(scene) · ASSERT(backstory) ‖ FORK(protect|use|leave)→use · FORK(hold|leave)→hold
```

### VL:V-fable — Claude Fable 5.1

```text
Strip VL:V-fable · Table V · 20 turns
t01 ASK(vendor,person) · ASK(vendor,other) · OFFER(coin) · DECEIVE · ASSERT(backstory)
t02 MOVE(private) · OFFER(trade) · SPEND(coin-medium) · DECEIVE · ASSERT(backstory) · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend
t03 MOVE(private) · SCOUT(cat) ‖ FORK(protect|use|leave)→use
t04 ASK(vendor,person) · DECEIVE · ASSERT(backstory) · ASSERT(world) · PRESS(roll) · PRESS(onward) ‖ FORK(check|accept)→check · FORK(spend|haggle|keep)→haggle
t05 ASK(vendor,person) · ASK(vendor,other) · OFFER(trade) · OFFER(coin) · SPEND(reroll) · DECLINE(reroll) · DECEIVE · ASSERT(world) · PRESS(roll) · PRESS(onward) · PRESS(reroll) ‖ FORK(spend|haggle|keep)→spend · FORK(reroll|keep)→keep · FORK(reroll|keep)→reroll
t06 MOVE(street) · OFFER(coin) · SPEND(coin-medium) · LEAVE(scene) · ASSERT(backstory) · ASSERT(world) · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend · FORK(hold|leave)→leave
t07 ASK(child,person) · OFFER(help)
t08 MOVE(street) · SCOUT(self) · LEAVE(scene) · ASSERT(backstory) ‖ FORK(check|accept)→check · FORK(protect|use|leave)→use
t09 MOVE(tavern) · ASK(authority,lore) · ASK(companion,other) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t10 MOVE(street) · ASK(stranger,person) · SPEND(coin-small) · DECEIVE · LEAVE(scene) ‖ FORK(spend|haggle|keep)→spend
t11 MOVE(tavern) · ASK(stranger,place) · ASSERT(world)
t12 ASK(vendor,other) · OFFER(coin) · SPEND(coin-small) · DECEIVE · ASSERT(backstory) · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend
t13 OFFER(coin) · SPEND(coin-medium) · ASSERT(world) · ASSERT(event) ‖ FORK(spend|haggle|keep)→spend
t14 MOVE(private) · ASK(vendor,person) · ASSERT(world)
t15 ASK(vendor,price) · OFFER(trade) · ASSERT(world) · ASSERT(event)
t16 OFFER(trade) · OFFER(coin) · PROTECT(npc) · SPEND(coin-small) · ASSERT(backstory) · ASSERT(world) · PRESS(roll) · PRESS(onward) ‖ FORK(spend|haggle|keep)→spend
t17 MOVE(tavern) · ASK(vendor,place) · OFFER(coin) · SPEND(coin-small) · PROPOSE(world) ‖ FORK(check|accept)→accept · FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→use
t18 OFFER(coin) · PROTECT(npc) · SPEND(coin-medium) · ASSERT(backstory) ‖ FORK(spend|haggle|keep)→spend
t19 MOVE(official) · LEAVE(scene) · ASSERT(event) ‖ FORK(protect|use|leave)→use
t20 ASK(authority,price) · ASK(authority,rule) · OFFER(coin) · ASSERT(backstory) · ASSERT(world) · ASSERT(event)
```

### VL:V-astra — GPT-6 Astra

```text
Strip VL:V-astra · Table V · 20 turns
t01 ASK(vendor,person) · ASSERT(backstory)
t02 ASK(vendor,other) · OFFER(service) · PROPOSE(backstory) ‖ FORK(check|accept)→check
t03 MOVE(tavern) · ASK(vendor,place) · ASSERT(backstory)
t04 ASK(vendor,place)
t05 MOVE(private) · SCOUT(self) · WAIT
t06 ASK(vendor,work) · ASK(vendor,price) · SCOUT(self) · ASSERT(world) · ASSERT(event)
t07 ASK(vendor,danger) · OFFER(coin) · SPEND(coin-small) ‖ FORK(spend|haggle|keep)→spend · FORK(protect|use|leave)→leave
t08 MOVE(street) · ASK(vendor,price) · OFFER(trade) · SCOUT(self) · LEAVE(scene) ‖ FORK(protect|use|leave)→use
t09 ASK(vendor,work) · ASK(vendor,person) · ASK(vendor,price) · ASK(vendor,other) ‖ FORK(spend|haggle|keep)→keep
t10 ASK(vendor,other) · OFFER(trade) ‖ FORK(spend|haggle|keep)→spend
t11 MOVE(private) · ASK(vendor,price) · LEAVE(scene) · ASSERT(world)
t12 ASK(vendor,place) ‖ FORK(spend|haggle|keep)→keep
t13 ASK(vendor,person)
t14 MOVE(private) · ASK(stranger,person) · SCOUT(self) · ASSERT(world)
t15 ASK(stranger,danger) · DECEIVE
t16 ASK(stranger,danger) · WAIT
t17 ASK(stranger,work) · OFFER(trade) ‖ FORK(spend|haggle|keep)→keep
t18 ASK(stranger,work) · OFFER(trade) · SCOUT(self) · ASSERT(world) ‖ FORK(spend|haggle|keep)→keep
t19 OFFER(trade) · ASSERT(world)
t20 MOVE(private) · OFFER(service)
```

### VL:V-sol — GPT-6.1 Sol

```text
Strip VL:V-sol · Table V · 20 turns
t01 ASK(vendor,person)
t02 ASK(vendor,person) · OFFER(trade) ‖ FORK(check|accept)→check
t03 MOVE(private) · SCOUT(self) · DECEIVE
t04 ASK(vendor,price) · OFFER(trade) · DECEIVE
t05 ASK(vendor,rule) · OFFER(trade) · DECEIVE · PROPOSE(world) · ASSERT(world) ‖ FORK(spend|haggle|keep)→haggle
t06 ASK(vendor,other) · OFFER(trade) · PROPOSE(world) ‖ FORK(spend|haggle|keep)→keep
t07 MOVE(street) · LEAVE(scene) · ASSERT(backstory) ‖ FORK(check|accept)→accept · FORK(hold|leave)→leave
t08 MOVE(private) · ASK(stranger,person) · DECEIVE · ASSERT(event)
t09 ASK(stranger,place) · ASSERT(backstory)
t10 ASK(stranger,danger) · WAIT
t11 ASK(stranger,place) · ASK(stranger,danger) ‖ FORK(check|accept)→check
t12 MOVE(official) · ASK(authority,other) · LEAVE(scene) ‖ FORK(help|refuse|price|defer)→help · FORK(check|accept)→accept
t13 ASK(authority,other) · DECEIVE · ASSERT(event)
t14 MOVE(private) · LEAVE(scene) · ASSERT(event)
t15 MOVE(tavern) · DECLINE(offer) · LEAVE(scene) ‖ FORK(spend|haggle|keep)→keep · FORK(hold|leave)→leave
t16 ASK(vendor,price) · OFFER(coin) · ASSERT(backstory) ‖ FORK(spend|haggle|keep)→spend
t17 OFFER(trade) ‖ FORK(help|refuse|price|defer)→price
t18 OFFER(service) · ASSERT(event)
t19 MOVE(private) · OFFER(trade) · OFFER(coin) · SPEND(coin-medium) ‖ FORK(help|refuse|price|defer)→help · FORK(spend|haggle|keep)→spend
t20 MOVE(tavern) · OFFER(trade)
```
