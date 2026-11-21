#!/bin/bash
# TOWN_8: keeps one world running until its folder is written — resumes from its save after a crash, a kill or a
# container's time limit (the world's state is saved after every turn). Log: .town-8-work/live/<world>.log
cd "$(dirname "$0")/../.." || exit 1
export PATH=/opt/node24/bin:$PATH
w=$1
log=.town-8-work/live/$w.log
mkdir -p .town-8-work/live
for i in $(seq 1 40); do
  [ -f "docs/runs/town-8-worlds/$w/summary.json" ] && break
  [ -f .town-8-work/live/STOP ] && break
  echo "=== start $i $(date -u +%FT%TZ)" >> "$log"
  node scripts/town-8/pilot.mjs run "$w" >> "$log" 2>&1 && break
  echo "=== exit $? $(date -u +%FT%TZ)" >> "$log"
  grep -q '"stopped": "' .town-8-work/live/stage-ledger.json && break
  grep -q 'the spend check failed' "$log" && break
  sleep 30
done
echo "=== loop end $(date -u +%FT%TZ)" >> "$log"
