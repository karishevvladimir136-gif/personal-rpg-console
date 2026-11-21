#!/bin/bash
# TOWN_8 amendment 1: keeps sol-unknown-c72 running until its folder is written (resumes from its save after any exit).
cd "$(dirname "$0")/../.." || exit 1
export PATH=/opt/node24/bin:$PATH
log=.town-8-work/live-a1/sol-unknown-c72.log
mkdir -p .town-8-work/live-a1
for i in $(seq 1 30); do
  [ -f docs/runs/town-8-worlds/sol-unknown-c72/summary.json ] && break
  [ -f .town-8-work/live-a1/STOP ] && break
  echo "=== start $i $(date -u +%FT%TZ)" >> "$log"
  node scripts/town-8/continue.mjs run >> "$log" 2>&1 && break
  echo "=== exit $? $(date -u +%FT%TZ)" >> "$log"
  grep -q '"stopped": "' .town-8-work/live-a1/ledger.json && break
  grep -q 'the spend check failed' "$log" && break
  sleep 30
done
echo "=== loop end $(date -u +%FT%TZ)" >> "$log"
