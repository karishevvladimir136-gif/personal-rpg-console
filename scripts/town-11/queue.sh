#!/bin/bash
# TOWN_11: starts the given worlds in order, keeping at most two running at once (the stage: two at a time, the week last).
cd "$(dirname "$0")/../.." || exit 1
for w in "$@"; do
  while [ "$(pgrep -fc 'scripts/town-11/loop.sh')" -ge 2 ]; do sleep 30; done
  [ -f .town-11-work/live/STOP ] && exit 0
  echo "$(date -u +%FT%TZ) start $w" >> .town-11-work/live/queue.log
  setsid nohup scripts/town-11/loop.sh "$w" > /dev/null 2>&1 < /dev/null &
  sleep 20
done
