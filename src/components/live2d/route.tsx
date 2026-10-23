"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import type { PlaySnapshot } from "@/lib/gameplay/contracts";
import { loadPlay } from "@/lib/gameplay/client";
import { RecordBoundary } from "../persistent-records";
import { PersistentSupporting } from "../persistent-game";
import { registry as r, useCopy } from "../registry/primitives";
import { Live2dScreen } from "./live2d-screen";
import s from "./live2d.module.css";

/** The «2D» screen of a live campaign: the records from the campaign provider, the play
 * snapshot (who is present, the turns' travel receipts) loaded beside them. */
export function LiveRoute() {
  return <RecordBoundary>{(data) => <LiveWithPlay data={data} entry="live" />}</RecordBoundary>;
}

/** Fix S3-accept Д1: «Карта» — the same screen, opened as the tree of places at its deepest level with content; the
 * old atlas's owner tools under the map's «Ещё». The old atlas route is gone from the campaign. */
export function MapRoute() {
  return <RecordBoundary>{(data) => <LiveWithPlay data={data} entry="map" />}</RecordBoundary>;
}

function LiveWithPlay({ data, entry }: { data: CampaignSnapshot; entry: "map" | "live" }) {
  const [play, setPlay] = useState<PlaySnapshot | null>(null);
  const campaignId = data.campaign.id;
  const revision = data.publicState.revision;
  useEffect(() => {
    let alive = true;
    loadPlay(campaignId).then((next) => { if (alive) setPlay(next); }, () => {});
    return () => { alive = false; };
  }, [campaignId, revision]);
  return <Live2dScreen snapshot={data} play={play} entry={entry} tools={<MapTools campaignId={campaignId} />} />;
}

/** The old atlas's extra sections, folded under the map's «Ещё»: the records of the known places, «что, если», the
 * places of belonging. */
function MapTools({ campaignId }: { campaignId: string }) {
  const c = useCopy();
  const href = (screen: string) => `/campaigns/${encodeURIComponent(campaignId)}/${screen}`;
  return (
    <>
      <section className={s.moreSection} aria-label={c("Что, если", "What if")}>
        <b>{c("Что, если", "What if")}</b>
        <p className={`${r.small} ${r.muted}`}>{c("Мастерская мира показывает отдельную возможность: её места и дороги не меняют эту карту.", "World Lab shows a detached possibility: its places and roads do not change this map.")}</p>
        <Link className={r.small} href={href("world")} style={{ color: "var(--brass)" }}>{c("Исследовать «что, если»", "Explore a what-if")}</Link>
        <Link className={r.small} href={href("home")} style={{ color: "var(--brass)" }}>{c("Места, где вы дома", "Places of belonging")}</Link>
      </section>
      <section className={s.moreSection} aria-label={c("Исправить записи", "Correct the records")}>
        <b>{c("Исправить записи", "Correct the records")}</b>
        <PersistentSupporting screen="map" />
      </section>
    </>
  );
}
