import {
  getCheckPresentation,
  type DemoFixture,
  type DicePreferences,
} from "./dice-preview.ts";

// A finite, authored UI demonstration, NOT D&D resolution or campaign state.
// Every field is synthetic and public. Future private encounter data stays server-side.
export const combatants = [
  {
    id: "james",
    name: "James",
    side: "party",
    maxHp: 24,
    position: "Nearby",
    description:
      "A steady hand and a borrowed light. Public demo character details.",
  },
  {
    id: "jinn",
    name: "Jinn",
    side: "party",
    maxHp: 18,
    position: "Nearby",
    description:
      "A watchful companion. Directly controlled by you in this demonstration.",
  },
  {
    id: "lookout",
    name: "Raincoat lookout",
    side: "enemy",
    maxHp: 12,
    position: "Nearby",
    description:
      "An invented opponent blocking the alley. No campaign canon is changed.",
  },
  {
    id: "sentry",
    name: "Bridge sentry",
    side: "enemy",
    maxHp: 12,
    position: "In Cover",
    description: "An invented opponent beside the shuttered kiosk.",
  },
] as const;
export type CombatantId = (typeof combatants)[number]["id"];
export type PartyId = "james" | "jinn";
export const combatActions = {
  attack: {
    label: "Attack",
    icon: "Swords",
    detail: "A fixed sample strike; 6 preview damage.",
    cost: "1 action",
    target: "enemy",
    damage: 6,
  },
  spell: {
    label: "Abilities / Spells",
    icon: "Sparkles",
    detail: "Lantern flare — an invented ability; 8 preview damage.",
    cost: "1 action · 1 demo charge",
    target: "enemy",
    damage: 8,
  },
  item: {
    label: "Item",
    icon: "FlaskConical",
    detail: "Demo tonic — restores 4 preview HP to a party member.",
    cost: "1 bonus action · 1 demo tonic",
    target: "party",
    damage: 0,
  },
  move: {
    label: "Move",
    icon: "ArrowRight",
    detail: "Step into cover using a public position label.",
    cost: "10 ft movement",
    target: "self",
    damage: 0,
  },
  defend: {
    label: "Defend",
    icon: "Shield",
    detail: "Guard until your next turn; the scripted incoming hit is reduced.",
    cost: "1 action",
    target: "self",
    damage: 0,
  },
} as const;
export type CombatAction = keyof typeof combatActions;
export type TurnResources = {
  action: number;
  bonus: number;
  reaction: number;
  movement: number;
};
export const demoResourceLabels: Record<keyof TurnResources, string> = {
  action: "Action",
  bonus: "Bonus action",
  reaction: "Reaction",
  movement: "Movement (ft)",
};
const freshResources = (): TurnResources => ({
  action: 1,
  bonus: 1,
  reaction: 1,
  movement: 30,
});
export type PublicLog = {
  id: number;
  message: string;
  actor?: CombatantId;
  target?: CombatantId;
  amount?: number;
  text?: string;
  fixture?: DemoFixture;
  important?: boolean;
};
type Pending = {
  id: number;
  actor: PartyId;
  action: CombatAction;
  target: CombatantId;
  fixture?: DemoFixture;
  resolved: boolean;
};
export type CombatPreview = {
  mode: "game" | "combat" | "summary";
  round: number;
  turn: number;
  active: PartyId | "enemy";
  hp: Record<CombatantId, number>;
  positions: Record<CombatantId, string>;
  guarded: Record<PartyId, boolean>;
  resources: TurnResources;
  charges: Record<PartyId, number>;
  tonics: number;
  spent: {
    actions: number;
    bonus: number;
    charges: number;
    tonics: number;
    movement: number;
  };
  sequence: number;
  draft: {
    id: number;
    action: CombatAction;
    target: CombatantId | null;
  } | null;
  pending: Pending | null;
  log: PublicLog[];
  lootClaimed: boolean;
};
export function createCombatPreview(): CombatPreview {
  return {
    mode: "game",
    round: 1,
    turn: 1,
    active: "james",
    hp: { james: 24, jinn: 18, lookout: 12, sentry: 12 },
    positions: Object.fromEntries(
      combatants.map((p) => [p.id, p.position]),
    ) as Record<CombatantId, string>,
    guarded: { james: false, jinn: false },
    resources: freshResources(),
    charges: { james: 1, jinn: 1 },
    tonics: 2,
    spent: { actions: 0, bonus: 0, charges: 0, tonics: 0, movement: 0 },
    sequence: 0,
    draft: null,
    pending: null,
    log: [],
    lootClaimed: false,
  };
}
export function enemyHealth(hp: number) {
  return hp <= 0
    ? "Withdrawn"
    : hp <= 4
      ? "Near Death"
      : hp < 12
        ? "Wounded"
        : "Unhurt";
}
export function encounterWon(state: CombatPreview) {
  return state.hp.lookout === 0 && state.hp.sentry === 0;
}
export function canChooseAction(state: CombatPreview, action: CombatAction) {
  if (
    state.mode !== "combat" ||
    state.active === "enemy" ||
    (state.pending && !state.pending.resolved) ||
    encounterWon(state)
  )
    return false;
  if (action === "item") return state.resources.bonus > 0 && state.tonics > 0;
  if (action === "move")
    return (
      state.resources.movement >= 10 &&
      state.positions[state.active] !== "In Cover"
    );
  return (
    state.resources.action > 0 &&
    (action !== "spell" || state.charges[state.active] > 0)
  );
}
export function eligibleTargets(
  state: CombatPreview,
  action: CombatAction,
): CombatantId[] {
  return combatants
    .filter(
      (p) =>
        state.hp[p.id] > 0 &&
        (combatActions[action].target === "self"
          ? p.id === state.active
          : p.side === combatActions[action].target),
    )
    .map((p) => p.id);
}
export function combatRoll(action: CombatAction): DemoFixture | undefined {
  if (action !== "attack" && action !== "spell") return;
  return {
    id: `combat-${action}`,
    label: "Synthetic combat roll",
    skill: action === "attack" ? "Sample attack" : "Sample ability",
    action:
      "A fixed public demonstration roll. The preview consequence is authored, not calculated by combat rules.",
    mode: "ordinary",
    dice: [14],
    modifiers: [
      {
        label: "Demo attack bonus",
        explanation: "An invented +4 for this illustration only.",
        value: 4,
      },
    ],
    outcome: "success",
    narrative:
      action === "attack"
        ? "The sample strike lands for 6 preview damage."
        : "The lantern flares for 8 preview damage.",
    // No target number is supplied for these attack fixtures. Show DC cannot invent one.
  };
}
export function combatPresentation(preferences: DicePreferences) {
  return getCheckPresentation(preferences, {
    visibility: "player",
    important: true,
  });
}
function appendLog(
  state: CombatPreview,
  entry: Omit<PublicLog, "id">,
): CombatPreview {
  return {
    ...state,
    log: [...state.log, { ...entry, id: state.log.length + 1 }],
  };
}
function resolvePending(state: CombatPreview, id: number): CombatPreview {
  const pending = state.pending;
  if (
    !pending ||
    pending.id !== id ||
    pending.resolved ||
    state.mode !== "combat"
  )
    return state;
  const { action, target, actor } = pending;
  const next = {
    ...state,
    hp: { ...state.hp },
    positions: { ...state.positions },
    guarded: { ...state.guarded },
    pending: { ...pending, resolved: true },
  };
  let message = "{actor} guards against the next scripted hit.";
  let amount = 0;
  if (action === "attack" || action === "spell") {
    amount = Math.min(state.hp[target], combatActions[action].damage);
    next.hp[target] -= amount;
    message = "{actor} hits {target}: −{amount} preview HP.";
  } else if (action === "item") {
    amount = Math.min(
      4,
      combatants.find((p) => p.id === target)!.maxHp - state.hp[target],
    );
    next.hp[target] += amount;
    message = "{actor} offers a demo tonic to {target}: +{amount} preview HP.";
  } else if (action === "move") {
    next.positions[actor] = "In Cover";
    message =
      "{actor} moves into cover. Illustration coordinates have no rules meaning.";
  } else next.guarded[actor] = true;
  return appendLog(next, {
    message,
    actor,
    target,
    amount,
    fixture: pending.fixture,
    important: true,
  });
}
export type CombatEvent =
  | { type: "enter" | "exit" | "reset" | "summary" | "loot" }
  | { type: "choose"; action: CombatAction }
  | { type: "target"; target: CombatantId }
  | { type: "confirm"; id: number; preferences: DicePreferences }
  | { type: "resolve"; id: number }
  | { type: "end-turn" | "enemy-turn"; turn: number }
  | { type: "describe"; text: string; id: number };
export function combatReducer(
  state: CombatPreview,
  event: CombatEvent,
): CombatPreview {
  if (event.type === "enter")
    return state.mode === "game"
      ? { ...createCombatPreview(), mode: "combat" }
      : state;
  if (event.type === "exit") return createCombatPreview();
  if (event.type === "reset")
    return { ...createCombatPreview(), mode: "combat" };
  if (event.type === "summary")
    return state.mode === "combat" && (!state.pending || state.pending.resolved)
      ? { ...state, mode: "summary", draft: null }
      : state;
  if (event.type === "loot")
    return state.mode === "summary" && encounterWon(state) && !state.lootClaimed
      ? { ...state, lootClaimed: true }
      : state;
  if (state.mode !== "combat") return state;
  if (event.type === "choose")
    return canChooseAction(state, event.action)
      ? {
          ...state,
          sequence: state.sequence + 1,
          draft: { id: state.sequence + 1, action: event.action, target: null },
        }
      : state;
  if (event.type === "target")
    return state.draft &&
      eligibleTargets(state, state.draft.action).includes(event.target)
      ? { ...state, draft: { ...state.draft, target: event.target } }
      : state;
  if (event.type === "confirm") {
    const draft = state.draft;
    if (
      !draft ||
      event.id !== draft.id ||
      !draft.target ||
      !canChooseAction(state, draft.action) ||
      !eligibleTargets(state, draft.action).includes(draft.target) ||
      state.active === "enemy"
    )
      return state;
    const { action, target } = draft;
    const next: CombatPreview = {
      ...state,
      draft: null,
      resources: { ...state.resources },
      spent: { ...state.spent },
      charges: { ...state.charges },
      pending: {
        id: draft.id,
        actor: state.active,
        action,
        target,
        fixture: combatRoll(action),
        resolved: false,
      },
    };
    if (action === "item") {
      next.resources.bonus--;
      next.tonics--;
      next.spent.bonus++;
      next.spent.tonics++;
    } else if (action === "move") {
      next.resources.movement -= 10;
      next.spent.movement += 10;
    } else {
      next.resources.action--;
      next.spent.actions++;
    }
    if (action === "spell") {
      next.charges[state.active]--;
      next.spent.charges++;
    }
    return next.pending!.fixture &&
      combatPresentation(event.preferences) === "interactive"
      ? next
      : resolvePending(next, draft.id);
  }
  if (event.type === "resolve") return resolvePending(state, event.id);
  if (event.type === "describe") {
    if (
      event.id !== state.sequence ||
      !event.text.trim() ||
      state.active === "enemy" ||
      (state.pending && !state.pending.resolved) ||
      encounterWon(state)
    )
      return state;
    return appendLog(
      { ...state, sequence: state.sequence + 1 },
      {
        message:
          "Authored demo response: your proposal is recorded literally. No live DM interpreted it; no cost or effect was applied.",
        text: event.text,
        actor: state.active,
      },
    );
  }
  if (event.type === "end-turn") {
    if (
      event.turn !== state.turn ||
      state.active === "enemy" ||
      (state.pending && !state.pending.resolved) ||
      encounterWon(state)
    )
      return state;
    const active = state.active === "james" ? "jinn" : "enemy";
    return appendLog(
      {
        ...state,
        active,
        turn: state.turn + 1,
        draft: null,
        pending: null,
        resources: freshResources(),
        guarded: {
          ...state.guarded,
          ...(active === "jinn" ? { jinn: false } : {}),
        },
      },
      { message: "{actor} ends their preview turn.", actor: state.active },
    );
  }
  if (event.type === "enemy-turn") {
    if (state.active !== "enemy" || event.turn !== state.turn) return state;
    let next = {
      ...state,
      hp: { ...state.hp },
      active: "james" as const,
      round: state.round + 1,
      turn: state.turn + 1,
      resources: freshResources(),
    } as CombatPreview;
    for (const [enemy, target] of [
      ["lookout", "james"],
      ["sentry", "jinn"],
    ] as const) {
      if (state.hp[enemy] === 0) continue;
      // Script stops at 1 HP: this is a finite UI sample, not a defeat/death engine.
      const amount = Math.min(
        state.hp[target] - 1,
        state.guarded[target] ? 1 : 3,
      );
      next.hp[target] -= amount;
      next = appendLog(next, {
        message:
          "Scripted response: {actor} pressures {target}: −{amount} preview HP. No enemy roll is supplied.",
        actor: enemy,
        target,
        amount,
      });
    }
    next.guarded = { ...state.guarded, james: false };
    return next;
  }
  return state;
}
