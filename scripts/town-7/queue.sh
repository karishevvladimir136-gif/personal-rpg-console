#!/bin/bash
# TOWN_7: starts the given worlds in order, keeping at most two running at once (the stage: two at a time).
cd "$(dirname "$0")/../.." || exit 1
for w in "$@"; do
  while [ "$(pgrep -fc 'scripts/town-7/loop.sh')" -ge 2 ]; do sleep 30; done
  [ -f .town-7-work/live/STOP ] && exit 0
  echo "$(date -u +%FT%TZ) start $w" >> .town-7-work/live/queue.log
  setsid nohup scripts/town-7/loop.sh "$w" > /dev/null 2>&1 < /dev/null &
  sleep 20
done
