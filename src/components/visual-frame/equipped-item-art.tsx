"use client";

import Image from "next/image";
import type { CampaignSnapshot, Item } from "@/lib/persistence/contracts";
import { itemIcon } from "@/lib/persistence/record-model";
import { selectSubjectVisual } from "@/lib/visual-frame/subject-visual";
import { Icon } from "../ui";

/** Ordinary equipment art uses accepted public assets only; rendering never starts a media job. */
export function EquippedItemArt({
  snapshot,
  item,
  className,
}: {
  snapshot: CampaignSnapshot;
  item: Item | undefined;
  className: string;
}) {
  const selected = item && item.campaign_id === snapshot.campaign.id
    ? selectSubjectVisual(snapshot, { kind: "item", id: item.id }, { acceptedOnly: true })
    : null;
  if (selected?.image?.kind === "real")
    return <Image unoptimized src={selected.image.url} alt="" width={58} height={58} className={className} />;
  return <Icon name={item ? itemIcon(item.category) : "Package"} size={24} />;
}
