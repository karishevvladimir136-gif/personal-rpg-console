"use client";

import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import { useGameplayRuntime } from "../gameplay-runtime";
import { RecordBoundary } from "../persistent-records";
import { Live2dScreen } from "./live2d-screen";

/** The «2D» screen of a live campaign: the records from the campaign provider, the play snapshot (who is present,
 * the turns' travel receipts) beside them. Fix S3-accept Б4: through the play runtime «Игра» uses — a turn sent from
 * the scene polls, refreshes and resumes exactly as there. */
export function LiveRoute() {
  return <RecordBoundary>{(data) => <LiveWithPlay data={data} />}</RecordBoundary>;
}

function LiveWithPlay({ data }: { data: CampaignSnapshot }) {
  const runtime = useGameplayRuntime();
  return <Live2dScreen snapshot={data} play={runtime.play} onSaved={runtime.afterMutation} />;
}
