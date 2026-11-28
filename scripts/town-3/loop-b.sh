#!/bin/bash
# TOWN_3 amendment 5: keeps sol-B running until its folder is written (resumes from its save after any exit).
cd "$(dirname "$0")/../.." || exit 1
export PATH=/opt/node24/bin:$PATH
log=.town-3-work/live-b/sol-B.log
mkdir -p .town-3-work/live-b
for i in $(seq 1 30); do
  [ -f docs/runs/town-3-worlds/sol-B/summary.json ] && break
  [ -f .town-3-work/live-b/STOP ] && break
  echo "=== start $i $(date -u +%FT%TZ)" >> "$log"
  node scripts/town-3/sol-b.mjs run >> "$log" 2>&1 && break
  echo "=== exit $? $(date -u +%FT%TZ)" >> "$log"
  grep -q '"stopped": "' .town-3-work/live-b/ledger.json && break
  grep -q 'the spend check failed' "$log" && break
  sleep 30
done
echo "=== loop end $(date -u +%FT%TZ)" >> "$log"
