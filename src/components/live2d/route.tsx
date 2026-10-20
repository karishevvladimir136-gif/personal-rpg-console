"use client";

import { useEffect, useState } from "react";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import type { PlaySnapshot } from "@/lib/gameplay/contracts";
import { loadPlay } from "@/lib/gameplay/client";
import { RecordBoundary } from "../persistent-records";
import { Live2dScreen } from "./live2d-screen";

/** The «2D» screen of a live campaign: the records from the campaign provider, the play
 * snapshot (who is present, the turns' travel receipts) loaded beside them. */
export function LiveRoute() {
  return <RecordBoundary>{(data) => <LiveWithPlay data={data} />}</RecordBoundary>;
}

function LiveWithPlay({ data }: { data: CampaignSnapshot }) {
  const [play, setPlay] = useState<PlaySnapshot | null>(null);
  const campaignId = data.campaign.id;
  const revision = data.publicState.revision;
  useEffect(() => {
    let alive = true;
    loadPlay(campaignId).then((next) => { if (alive) setPlay(next); }, () => {});
    return () => { alive = false; };
  }, [campaignId, revision]);
  return <Live2dScreen snapshot={data} play={play} />;
}
