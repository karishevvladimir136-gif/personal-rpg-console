// Visual autopilot (Stage 5): looks at a committed public snapshot and decides
// which existing subject-visual jobs to queue next. It never touches the turn
// runtime: it runs in the browser after the saved turn refreshes the records.
import type { CampaignSnapshot } from "../persistence/contracts.ts";
import { subjectVisualDocuments } from "../visual-frame/subject-job.ts";
import { itemTypeKey } from "./rarity.ts";
import { subjectImageFor, type SubjectKind } from "./subject-images.ts";

export type AutopilotProvider = "openai" | "fal";
export type AutopilotSettings = {
  enabled: boolean;
  items: boolean;
  portraits: boolean;
  places: boolean;
  holdings: boolean;
  /** Accept a finished picture automatically when the safety review raised no warning. */
  autoAccept: boolean;
  dailyCap: number;
  provider: AutopilotProvider;
};
export const defaultAutopilotSettings: AutopilotSettings = {
  enabled: false, items: true, portraits: true, places: true, holdings: true, autoAccept: true, dailyCap: 20, provider: "openai",
};
export type AutopilotLedger = { day: string; count: number; attempted: string[] };
export type AutopilotReason = "item" | "portrait" | "place" | "holding";
export type AutopilotPlan = { subject: { kind: SubjectKind; id: string }; reason: AutopilotReason; label: string }[];

export const subjectKey = (subject: { kind: SubjectKind; id: string }) => `${subject.kind}:${subject.id}`;
export const autopilotStorageKey = (campaignId: string) => `rpg-visual-autopilot-v1:${campaignId}`;

export function parseAutopilotSettings(raw: unknown): AutopilotSettings {
  const value = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const flag = (key: keyof AutopilotSettings) => typeof value[key] === "boolean" ? value[key] as boolean : defaultAutopilotSettings[key] as boolean;
  const cap = Number(value.dailyCap);
  return {
    enabled: flag("enabled"), items: flag("items"), portraits: flag("portraits"), places: flag("places"), holdings: flag("holdings"),
    autoAccept: flag("autoAccept"),
    dailyCap: Number.isSafeInteger(cap) && cap >= 0 && cap <= 200 ? cap : defaultAutopilotSettings.dailyCap,
    provider: value.provider === "fal" ? "fal" : "openai",
  };
}
export function parseLedger(raw: unknown, today: string): AutopilotLedger {
  const value = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const attempted = Array.isArray(value.attempted) ? value.attempted.filter((row): row is string => typeof row === "string").slice(-500) : [];
  const count = Number(value.count);
  return value.day === today && Number.isSafeInteger(count) && count >= 0
    ? { day: today, count, attempted }
    : { day: today, count: 0, attempted };
}

/** The next jobs to queue, most visible first. One picture per item type. */
export function planVisualAutopilot(
  snapshot: CampaignSnapshot,
  settings: AutopilotSettings,
  ledger: AutopilotLedger,
  limit = 1,
): AutopilotPlan {
  if (!settings.enabled) return [];
  const remaining = Math.max(0, settings.dailyCap - ledger.count);
  if (!remaining) return [];
  // One job at a time: a queued or generating job means the autopilot waits.
  const busy = subjectVisualDocuments(snapshot).some(({ value }) => value.status === "queued" || value.status === "generating");
  if (busy) return [];
  const tried = new Set(ledger.attempted);
  const plan: AutopilotPlan = [];
  const consider = (kind: SubjectKind, id: string, reason: AutopilotReason, label: string) => {
    const subject = { kind, id };
    if (tried.has(subjectKey(subject))) return;
    const image = subjectImageFor(snapshot, subject);
    if (image.url || image.drawing) return;
    plan.push({ subject, reason, label });
  };
  if (settings.holdings)
    for (const row of snapshot.entities.filter((entity) => entity.kind === "transport" || entity.kind === "mount"))
      consider("entity", row.id, "holding", row.name);
  if (settings.portraits)
    for (const row of snapshot.entities.filter((entity) => entity.kind === "player" || entity.kind === "companion"))
      consider("entity", row.id, "portrait", row.name);
  if (settings.places)
    for (const row of snapshot.locations.filter((location) => location.status === "visited"))
      consider("location", row.id, "place", row.name);
  if (settings.items) {
    const types = new Set<string>();
    for (const row of [...snapshot.items].filter((item) => item.quantity > 0).sort((a, b) => b.updated_at.localeCompare(a.updated_at))) {
      const type = itemTypeKey(row);
      if (types.has(type)) continue;
      types.add(type);
      consider("item", row.id, "item", row.name);
    }
  }
  return plan.slice(0, Math.min(limit, remaining));
}

/** The artist's workshop: every subject job of the campaign, newest first. */
export function workshopJobs(snapshot: CampaignSnapshot) {
  return subjectVisualDocuments(snapshot)
    .map(({ record, value }) => ({ id: record.id, updatedAt: record.updated_at, status: value.status, name: value.basis.subject.name, kind: value.basis.subject.kind, review: value.review?.status ?? null }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
