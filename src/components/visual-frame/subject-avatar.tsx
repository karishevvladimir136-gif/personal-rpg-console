"use client";

import Image from "next/image";
import type { CampaignSnapshot, Entity } from "@/lib/persistence/contracts";
import { selectSubjectVisual } from "@/lib/visual-frame/subject-visual";
import { Icon } from "../ui";

/** Small public portrait. Draft references never become ordinary character art. */
export function SubjectAvatar({
  snapshot,
  entity,
  className,
  fallback = "initial",
}: {
  snapshot: CampaignSnapshot;
  entity: Entity;
  className: string;
  fallback?: "initial" | "icon";
}) {
  const visual = entity.campaign_id === snapshot.campaign.id
    ? selectSubjectVisual(snapshot, { kind: "entity", id: entity.id }, { acceptedOnly: true })
    : null;
  return (
    <span className={className} aria-hidden="true" style={{ overflow: "hidden" }}>
      {visual?.image?.kind === "real" ? (
        <Image
          unoptimized
          src={visual.image.url}
          alt=""
          width={96}
          height={96}
          sizes="66px"
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}
        />
      ) : fallback === "icon" ? (
        <Icon name="UserRound" size={36} />
      ) : (
        entity.name.trim().slice(0, 1)
      )}
    </span>
  );
}
