#!/bin/bash
# TOWN_11: the stated order, two worlds at a time at most — haiku-week with deepseek-week; when a slot frees, the three
# Claude seating checks (Opus 5.5, Fable 5.2, Fable 5.1; each once); then opus-week and fable52-week, each only if seated,
# each when a slot is free. Log: .town-11-work/live/chain.log
cd "$(dirname "$0")/../.." || exit 1
export PATH=/opt/node24/bin:$PATH
L=.town-11-work/live/chain.log
mkdir -p .town-11-work/live
say() { echo "$(date -u +%FT%TZ) $*" >> "$L"; }
running() { pgrep -fc 'scripts/town-11/loop.sh' || true; }
start() { say "start $1"; setsid nohup scripts/town-11/loop.sh "$1" > /dev/null 2>&1 < /dev/null & sleep 20; }
stopped() { [ -f .town-11-work/live/STOP ] || grep -q '"stopped": "' docs/runs/town-11-worlds/stage-ledger.json 2>/dev/null; }
for w in haiku-week deepseek-week; do [ -f "docs/runs/town-11-worlds/$w/summary.json" ] || start "$w"; done
while [ "$(running)" -ge 2 ]; do sleep 60; done
stopped && { say "stage stopped; chain ends"; exit 0; }
for s in seat-opus seat-fable52 fable51-check; do say "seat $s"; node scripts/town-11/pilot.mjs seat "$s" >> "$L" 2>&1 || say "seat $s exited $?"; done
for w in opus-week fable52-week; do
  f=docs/runs/town-11-worlds/seat-${w%-week}.json
  if ! grep -q '"seated": true' "$f" 2>/dev/null; then say "$w not seated: not run"; continue; fi
  while [ "$(running)" -ge 2 ]; do sleep 60; done
  stopped && { say "stage stopped; chain ends"; exit 0; }
  [ -f "docs/runs/town-11-worlds/$w/summary.json" ] || start "$w"
done
say "chain end"
