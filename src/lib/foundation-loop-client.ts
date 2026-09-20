import type {
  FoundationLoopView,
  FoundationUiCommand,
} from "./foundation-loop/client-contracts.ts";
import type { TradeQuote } from "./foundation-loop/contracts.ts";
import type { TimelineFence } from "./saves/contracts.ts";
import { isTimelineFence, sameTimeline } from "./saves/fence.ts";

export class FoundationClientError extends Error {
  readonly code: string;
  readonly uncertain: boolean;
  constructor(code: string, uncertain = false) {
    super(code);
    this.code = code;
    this.uncertain = uncertain;
  }
}

const codes = new Set([
  "validation",
  "configuration",
  "conflict",
  "busy",
  "scope",
  "unavailable",
  "unauthenticated",
  "forbidden",
  "not_found",
  "ineligible",
  "already_claimed",
  "invalid_progression",
  "stale_progression",
  "source_ineligible",
  "reward_claimed",
  "advancement_unavailable",
]);

async function request(
  campaignId: string,
  input?: FoundationUiCommand,
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(
      `/api/campaigns/${encodeURIComponent(campaignId)}/foundation`,
      {
        method: input ? "POST" : "GET",
        credentials: "same-origin",
        cache: "no-store",
        ...(input
          ? {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(input),
            }
          : {}),
      },
    );
  } catch {
    throw new FoundationClientError(
      "connection",
      !!input && input.kind !== "quote",
    );
  }
  const value = await response.json().catch(() => null);
  if (!response.ok) {
    const code =
      typeof value?.error?.code === "string" && codes.has(value.error.code)
        ? value.error.code
        : "connection";
    throw new FoundationClientError(
      code,
      !!input &&
        input.kind !== "quote" &&
        (response.status >= 500 || code === "connection"),
    );
  }
  return value;
}

export function foundationScopeMatches(
  view: FoundationLoopView,
  campaignId: string,
  timeline: TimelineFence | undefined,
): boolean {
  return (
    view.campaignId === campaignId &&
    sameTimeline(view.command.timeline, timeline)
  );
}

/** Transport validation guards scope and malformed success. Server owns full DTO allowlisting. */
export function validateFoundationView(
  value: unknown,
  campaignId: string,
): FoundationLoopView {
  const view = value as FoundationLoopView | null;
  if (
    !view ||
    view.campaignId !== campaignId ||
    view.command?.campaignId !== campaignId ||
    !isTimelineFence(view.command?.timeline) ||
    !Number.isSafeInteger(view.stateVersion) ||
    !view.owner ||
    !Array.isArray(view.owner.currencies) ||
    !Array.isArray(view.owner.itemPolicies) ||
    !Array.isArray(view.owner.merchants) ||
    !Array.isArray(view.owner.tracks) ||
    !Array.isArray(view.owner.rewards) ||
    !Array.isArray(view.owner.entities) ||
    !Array.isArray(view.owner.items) ||
    !Array.isArray(view.owner.storages) ||
    !Array.isArray(view.owner.sources) ||
    !Array.isArray(view.availableRewards) ||
    !Array.isArray(view.history) ||
    !Array.isArray(view.progression?.progress) ||
    !Array.isArray(view.progression.pending) ||
    (view.commerce !== null &&
      (!Array.isArray(view.commerce?.merchants) ||
        !Array.isArray(view.commerce.currencies) ||
        !Array.isArray(view.commerce.inventory)))
  ) {
    throw new FoundationClientError("connection");
  }
  return view;
}

export async function loadFoundationLoop(
  campaignId: string,
): Promise<FoundationLoopView> {
  return validateFoundationView(await request(campaignId), campaignId);
}

export function foundationAttempt(
  view: FoundationLoopView,
  kind: FoundationUiCommand["kind"],
  input: unknown,
  previous: FoundationUiCommand | null = null,
  createId: () => string = () => crypto.randomUUID(),
): FoundationUiCommand {
  if (previous) return structuredClone(previous);
  // The quote's operation identity is the identity later committed by trade.
  const command =
    kind === "trade"
      ? (input as TradeQuote).command
      : { ...view.command, operationId: createId() };
  return structuredClone({ command, kind, input });
}

export async function sendFoundationCommand(
  campaignId: string,
  attempt: FoundationUiCommand,
): Promise<FoundationLoopView | TradeQuote> {
  const value = await request(campaignId, attempt);
  try {
    if (attempt.kind === "quote") {
      const quote = value as TradeQuote;
      if (
        !quote ||
        quote.schemaVersion !== 1 ||
        quote.command?.operationId !== attempt.command.operationId ||
        !sameValue(quote.command, attempt.command) ||
        !sameValue(quote.intent, attempt.input) ||
        !Array.isArray(quote.lines) ||
        !Number.isSafeInteger(quote.payment)
      )
        throw new Error("quote");
      return quote;
    }
    const view = validateFoundationView(value, campaignId);
    if (!sameTimeline(view.command.timeline, attempt.command.timeline))
      throw new Error("scope");
    return view;
  } catch {
    throw new FoundationClientError("connection", attempt.kind !== "quote");
  }
}

export function sameValue(a: unknown, b: unknown): boolean {
  const canonical = (v: unknown): string =>
    Array.isArray(v)
      ? `[${v.map(canonical).join(",")}]`
      : v && typeof v === "object"
        ? `{${Object.entries(v)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, value]) => `${JSON.stringify(k)}:${canonical(value)}`)
            .join(",")}}`
        : JSON.stringify(v);
  return canonical(a) === canonical(b);
}

/** Only changed rows advance; retry never recalculates versions. */
export function versionDefinitions<T extends { version: number }>(
  baseline: T[],
  draft: T[],
  key: (row: T) => string,
): T[] {
  return draft.map((row) => {
    const prior = baseline.find((old) => key(old) === key(row));
    if (!prior) return { ...structuredClone(row), version: 1 };
    const next = { ...row, version: prior.version };
    return sameValue(prior, next)
      ? structuredClone(prior)
      : { ...structuredClone(next), version: prior.version + 1 };
  });
}

export type CommerceDraft = Pick<
  FoundationLoopView["owner"],
  "currencies" | "itemPolicies" | "merchants"
>;
export type ProgressionDraft = Pick<
  FoundationLoopView["owner"],
  "progression" | "tracks" | "rewards"
>;

export function commerceInput(
  view: FoundationLoopView,
  draft: CommerceDraft,
): CommerceDraft {
  return {
    currencies: versionDefinitions(
      view.owner.currencies,
      draft.currencies,
      (r) => r.id,
    ),
    itemPolicies: versionDefinitions(
      view.owner.itemPolicies,
      draft.itemPolicies,
      (r) => r.itemId,
    ),
    merchants: versionDefinitions(
      view.owner.merchants,
      draft.merchants,
      (r) => r.actorId,
    ),
  };
}
export function progressionInput(
  view: FoundationLoopView,
  draft: ProgressionDraft,
): ProgressionDraft {
  return {
    progression: draft.progression,
    tracks: versionDefinitions(view.owner.tracks, draft.tracks, (r) => r.id),
    rewards: versionDefinitions(view.owner.rewards, draft.rewards, (r) => r.id),
  };
}
