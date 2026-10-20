// The music stage's synthetic session log: the 20-turn «Мир Шва» scene replayed through the
// mood chooser and the hysteresis reducer, showing which mood played when and why. No paid
// call, no database: the public scene signals come from test-fixtures/music/shov-20-turn-signals.json.
//   node scripts/music-session-log.mjs            writes docs/runs/music-session-log.md
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chooseMood, initialMoodState, placeKind, stepMood } from "../src/lib/audio/mood-select.ts";
import { moodLabel } from "../src/lib/audio/moods.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const scene = JSON.parse(readFileSync(join(root, "test-fixtures", "stage-v", "shov-scene.json"), "utf8"));
const signals = JSON.parse(readFileSync(join(root, "test-fixtures", "music", "shov-20-turn-signals.json"), "utf8"));

export function replaySession() {
  let state = initialMoodState();
  const rows = [];
  signals.turns.forEach((row, index) => {
    const turn = scene.turns[row.turn - 1];
    const place = { name: scene.places[row.place], description: "" };
    const signal = { turnId: `t${row.turn}`, sceneKinds: row.sceneKinds, tension: row.tension, hint: row.hint, playerMoment: row.playerMoment, encounterActive: row.encounterActive, worldMinutes: row.minutes, place };
    const choice = chooseMood(signal);
    const now = index * signals.secondsPerTurn * 1000;
    const step = stepMood({ ...state, lastTurnId: signal.turnId }, choice, now);
    state = step.state;
    rows.push({ turn: row.turn, place: place.name, placeKind: placeKind(place), input: turn.input, sceneKinds: row.sceneKinds, tension: row.tension, hint: row.hint, encounter: row.encounterActive, moment: row.playerMoment,
      wanted: choice.mood, playing: step.mood, switched: step.switched, reason: step.reason, at: now / 1000 });
  });
  return rows;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const rows = replaySession();
  const line = (r) => `| ${r.turn} | ${r.at} s | ${r.place} | ${r.input.replace(/\|/g, "/")} | ${r.sceneKinds.join(", ")} | ${r.tension ?? "—"}${r.hint ? ` → ${r.hint}` : ""}${r.encounter ? " · fight" : ""}${r.moment ? " · moment" : ""} | ${moodLabel(r.wanted, "ru")} | **${moodLabel(r.playing, "ru")}**${r.switched ? " ↺" : ""} | ${r.reason} |`;
  const switches = rows.filter((r) => r.switched).length;
  const text = `# Music stage — a 20-turn synthetic session: which mood played when and why

The 20-turn «Мир Шва» scene of Stage V (\`test-fixtures/stage-v/shov-scene.json\`), with the public scene signal of every turn labelled by the session the way \`finish_turn\` records it (\`test-fixtures/music/shov-20-turn-signals.json\`: scene kinds, the server's tension reading, the DM's hint for the next turn, an active encounter, the player's moment, the world clock), replayed through \`chooseMood\` and the hysteresis reducer \`stepMood\` with one turn every ${signals.secondsPerTurn} s. No paid call. «Wanted» is the mood the scene asks for; «Playing» is what the player keeps after hysteresis (↺ marks a switch). ${switches} switches in 20 turns.

Rules in one line: a fight or a jump of two energy steps switches at once; anything else waits until the new mood held for two turns or the current one played 90 s; nothing private is read (no ambush music for a private note).

| Turn | At | Place | Player | Scene kinds | Tension → hint | Wanted | Playing | Why |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows.map(line).join("\n")}
`;
  writeFileSync(join(root, "docs", "runs", "music-session-log.md"), text);
  console.log(`${rows.length} turns, ${switches} switches → docs/runs/music-session-log.md`);
}
