// Read-only verification of the owner's accepted recovery-2 evidence. No provider calls or ledger writes.
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {digest,generateFixtures} from './fixtures.mjs';
import {buildPlan,LIMITS,RESERVATION} from './plan.mjs';
import {executionProfile,SafeFailure} from './transport.mjs';
import {fileHash,verifyHistory,metadataFailure,PROTOCOL_HASH,BASE_COMMIT} from './smoke-recovery.mjs';
/** @param {string} category @returns {never} */
const fail=category=>{throw new SafeFailure('configuration',category);};
/** @param {string} path */
const json=path=>JSON.parse(readFileSync(path,'utf8'));
/** @param {string} path @returns {Record<string,any>[]} */
export const jsonLines=path=>readFileSync(path,'utf8').trim().split('\n').filter(Boolean).map(line=>JSON.parse(line));
/** @param {number} value */
export const money=value=>Math.round(value*1e8)/1e8;
/** @param {unknown} value */
const finiteCost=value=>typeof value==='number'&&Number.isFinite(value)&&value>=0;
/** Validate ledger membership and cost provenance independently of smoke qualification.
 * @param {{name:string,entries:Record<string,any>[],requests:Record<string,any>[],manifestHash:string|null,observations:Record<string,any>[]}[]} ledgers
 * @param {string} protocolHash
 */
export function aggregateHistoricalAccounting(ledgers,protocolHash){
  const seen=new Set();let reserved=0,known=0;
  /** @type {string[]} */ const unknownChargeRequestIds=[];
  /** @type {{name:string,attempts:number,reservedUSD:number}[]} */ const ledgerTotals=[];
  for(const ledger of ledgers){
    let subtotal=0;
    for(let i=0;i<ledger.entries.length;i++){
      const row=ledger.entries[i],request=ledger.requests[i],observation=ledger.observations[i];
      if(seen.has(row.requestId))fail('duplicate_historical_request_id');seen.add(row.requestId);
      if(!request||row.requestId!==request.id||row.kind!==request.kind||row.protocolHash!==protocolHash||!['astra','jev'].includes(row.kind)||row.reserveUSD!==RESERVATION[/** @type {'astra'|'jev'} */(row.kind)]||(ledger.manifestHash?row.recoveryManifestHash!==ledger.manifestHash:row.recoveryManifestHash!=null))fail('historical_ledger_manifest_mismatch');
      if(!observation||observation.id!==row.requestId||observation.kind!==row.kind||observation.protocolHash!==protocolHash)fail('historical_observation_mismatch');
      const cost=observation.metadata?.costUSD??observation.result?.metadata?.costUSD;
      if(cost==null)unknownChargeRequestIds.push(row.requestId);
      else if(!finiteCost(cost)||cost>row.reserveUSD)fail('historical_cost_exceeds_reservation_or_invalid');
      else known+=cost;
      subtotal+=row.reserveUSD;
    }
    reserved+=subtotal;ledgerTotals.push({name:ledger.name,attempts:ledger.entries.length,reservedUSD:money(subtotal)});
  }
  if(seen.size>LIMITS.totalCalls||money(reserved)>LIMITS.totalUSD)fail('historical_budget_exhausted');
  return {requestIds:[...seen],attempts:seen.size,reservedUSD:money(reserved),knownReportedCostUSD:money(known),reportedCostUSD:unknownChargeRequestIds.length?null:money(known),unknownChargeRequestIds,ledgerTotals,remainingReservationUSD:money(LIMITS.totalUSD-reserved)};
}
/** Verify metadata already sanitized and byte-anchored at the accepted execution checkpoint.
 * UNKNOWN actual provider API model is valid; SDK response.modelId is never consulted.
 * @param {Record<string,any>} m @param {Readonly<import('./transport.mjs').Profile>} profile @param {boolean} [requireCanonical]
 */
export function verifyPinnedMetadata(m,profile,requireCanonical=false){
  if(metadataFailure(m,profile)||m.requestedModel!==profile.model||m.profileHash!==digest(profile)||m.successfulProvider!==profile.provider||m.successfulProviderAttempts!==1||m.canonicalRoutingMatches!==true)fail('unqualified_routing_or_billing');
  if([m.gatewayOriginalModel,m.gatewayCanonicalModel,m.modelAttemptCanonicalModel].some(v=>v!=null&&v!==profile.model))fail('canonical_model_mismatch');
  // Recovery-2's accepted records have both canonical slugs; none is invented from SDK echoes.
  if(requireCanonical&&(m.gatewayCanonicalModel!==profile.model||m.modelAttemptCanonicalModel!==profile.model))fail('missing_accepted_canonical_evidence');
  if(m.modelAttemptId!=null&&![profile.model,profile.model.replace('/',':')].includes(m.modelAttemptId))fail('model_attempt_mismatch');
  const pattern=profile.kind==='language'?/^(?:openai\/)?gpt-6-astra(?:-\d{4}-\d{2}-\d{2})?$/:/^(?:typesafe-ai\/)?jev(?:-[\d.]+)?$/;
  if(m.actualModel!=null&&(typeof m.actualModel!=='string'||!pattern.test(m.actualModel)))fail('unsafe_actual_model');
  if(!Number.isSafeInteger(m.inputTokens)||!Number.isSafeInteger(m.outputTokens))fail('invalid_usage');
}
/** Trusted definitions are loaded from committed experiment fixtures by readAcceptedSmoke below.
 * The explicit dependency arguments allow synthetic filesystem/lineage tests without any live call.
 * @param {{outputDir:string,protocolHash:string,accepted:Record<string,any>,manifests:Record<string,any>[],isAncestor:(ancestor:string,descendant:string)=>boolean}} options
 */
export function inspectAcceptedSmoke({outputDir,protocolHash,accepted,manifests,isAncestor}){
  if(protocolHash!==PROTOCOL_HASH||accepted.protocolHash!==protocolHash||accepted.baseCommit!==BASE_COMMIT||accepted.status!=='OWNER_ACCEPTED_QUALIFYING_TRANSPORT_SMOKE'||manifests.length!==2)fail('accepted_smoke_protocol_mismatch');
  const names=['reservations.jsonl','smoke-plan.json','smoke-narration.json'];
  for(const manifest of manifests){
    if(!['smoke-recovery-1','smoke-recovery-2'].includes(manifest.id)||manifest.protocolHash!==protocolHash||manifest.baseCommit!==BASE_COMMIT||digest(manifest)!==accepted.manifestHashes[manifest.id])fail('accepted_recovery_manifest_mismatch');
    names.push(manifest.id+'-manifest.json',manifest.id+'-reservations.jsonl',manifest.id+'-results.jsonl');
    names.push(...manifest.requests.slice(0,manifest.id==='smoke-recovery-1'?1:5).map((/** @type {{id:string}} */ r)=>r.id+'.json'));
  }
  if(manifests.map(m=>m.id).join()!=='smoke-recovery-1,smoke-recovery-2'||Object.keys(accepted.artifactHashes).sort().join()!==names.sort().join())fail('accepted_artifact_set_mismatch');
  for(const name of names)if(fileHash(join(outputDir,name))!==accepted.artifactHashes[name])fail('accepted_historical_artifact_changed');
  if(!isAncestor(BASE_COMMIT,accepted.priorRecoveryCommit)||!isAncestor(accepted.priorRecoveryCommit,accepted.executionCommit)||!isAncestor(accepted.executionCommit,'HEAD'))fail('accepted_execution_lineage_mismatch');
  const fullPlan=buildPlan(generateFixtures());
  const originalEntries=jsonLines(join(outputDir,'reservations.jsonl'));
  /** @type {{name:string,entries:Record<string,any>[],requests:Record<string,any>[],manifestHash:string|null,observations:Record<string,any>[]}[]} */
  const ledgers=[{name:'reservations.jsonl',entries:originalEntries,requests:fullPlan.manifest.filter(r=>r.stage==='smoke'),manifestHash:null,observations:originalEntries.map(r=>json(join(outputDir,r.requestId+'.json')))}];
  if(originalEntries.length!==2)fail('original_smoke_count_mismatch');
  /** @type {Record<string,any>|null} */ let completed=null;
  /** @type {Record<string,any>[]} */ let qualifying=[];
  for(const manifest of manifests){
    verifyHistory(manifest,outputDir);
    const snapshot=json(join(outputDir,manifest.id+'-manifest.json')),hash=digest(manifest);
    const execution=manifest.id==='smoke-recovery-2'?accepted.executionCommit:accepted.priorRecoveryCommit;
    if(digest(snapshot.manifest)!==hash||snapshot.manifestHash!==hash||snapshot.executionCommit!==execution)fail('accepted_execution_snapshot_mismatch');
    const entries=jsonLines(join(outputDir,manifest.id+'-reservations.jsonl'));
    const expectedCount=manifest.id==='smoke-recovery-2'?5:1;
    if(entries.length!==expectedCount)fail('partial_recovery_ledger');
    const observations=entries.map(r=>json(join(outputDir,r.requestId+'.json')));
    const events=jsonLines(join(outputDir,manifest.id+'-results.jsonl'));
    if(events.length!==expectedCount+2||events[0].event!=='started'||events[0].manifestHash!==hash||events[0].executionCommit!==execution)fail('partial_recovery_result_log');
    observations.forEach((row,i)=>{
      const request=manifest.requests[i],{event,...recorded}=events[i+1];
      if(event!=='observation'||digest(recorded)!==digest(row)||row.recoveryManifestHash!==hash||row.requestHash!==request.requestHash||row.capability!==request.capability||row.httpRequests!==1)fail('recovery_observation_log_mismatch');
    });
    const end=events.at(-1)??{};
    if(end?.event!=='completed'||end.executionCommit!==execution||end.protocolHash!==protocolHash||end.recoveryManifestHash!==hash||end.additionalHTTPRequests!==expectedCount||end.additionalReservations!==expectedCount||end.retries!==0||end.fallbackConfigured!==false||end.originalHistoryPreserved!==true)fail('recovery_completion_mismatch');
    if(manifest.id==='smoke-recovery-2'){
      if(end.status!=='RECOVERY_SMOKE_PASSED'||Object.keys(end.capabilities).sort().join()!=='feedback,jev,narration,plan,summary'||Object.values(end.capabilities).some(v=>v!=='success'))fail('five_successful_capabilities_required');
      observations.forEach((row,i)=>{
        const request=manifest.requests[i],profile=executionProfile(request.kind);
        if(row.status!=='success'||row.error!==null||row.httpStatus!==200||row.warningsCount!==0||typeof row.outputHash!=='string'||!/^[a-f0-9]{64}$/.test(row.outputHash))fail('unsuccessful_smoke_observation');
        verifyPinnedMetadata(row.metadata,profile,true);
      });
      qualifying=observations;completed=end;
    }
    ledgers.push({name:manifest.id+'-reservations.jsonl',entries,requests:manifest.requests,manifestHash:hash,observations});
  }
  const accounting=aggregateHistoricalAccounting(ledgers,protocolHash);
  const smokeCost=money(qualifying.reduce((n,r)=>n+r.metadata.costUSD,0));
  if(!completed||accounting.attempts!==8||completed.cumulativeHTTPRequests!==accounting.attempts||money(completed.cumulativeReservedUSD)!==accounting.reservedUSD||money(completed.reportedAdditionalCostUSD)!==smokeCost||money(completed.reportedCumulativeKnownCostUSD)!==accounting.knownReportedCostUSD)fail('recovery_accounting_mismatch');
  return {...accounting,evidenceHash:digest(accepted),qualifyingSmoke:'smoke-recovery-2',executionCommit:accepted.executionCommit,qualifyingCapabilities:qualifying.map(r=>r.capability),ownerReportedPrior403SpendUSD:manifests[0].historyEvidence.providerSpendUSD,ownerReportedPrior403Source:manifests[0].historyEvidence.source};
}
/** Canonical filesystem gate used by the full runner. No key, provider client or network needed.
 * @param {string} outputDir @param {string} protocolHash
 */
export function readAcceptedSmoke(outputDir,protocolHash){
  const fixture=(/** @type {string} */ name)=>json(fileURLToPath(new URL('../fixtures/'+name,import.meta.url)));
  const root=fileURLToPath(new URL('../../../',import.meta.url));
  const isAncestor=(/** @type {string} */ a,/** @type {string} */ b)=>{
    if(!/^[a-f0-9]{40}$/.test(a)||!(b==='HEAD'||/^[a-f0-9]{40}$/.test(b)))return false;
    try{execFileSync('git',['merge-base','--is-ancestor',a,b],{cwd:root,stdio:'ignore'});return true;}catch{return false;}
  };
  return inspectAcceptedSmoke({outputDir,protocolHash,accepted:fixture('accepted-smoke-recovery-2.json'),manifests:[fixture('smoke-recovery-1.json'),fixture('smoke-recovery-2.json')],isAncestor});
}
