// Full stage only: read accepted history; append new reservations to a separate durable ledger.
import {readFileSync,existsSync,mkdirSync,openSync,writeSync,fsyncSync,closeSync} from 'node:fs';
import {join} from 'node:path';
import {generateFixtures,digest} from './fixtures.mjs';
import {buildPlan,LIMITS,RESERVATION} from './plan.mjs';
import {SafeFailure,executionProfile} from './transport.mjs';
import {jsonLines,money,readAcceptedSmoke,verifyPinnedMetadata} from './smoke-evidence.mjs';
/** @param {string} category @returns {never} */
const fail=category=>{throw new SafeFailure('configuration',category);};
/** Only a projection of the original frozen plan; does not regenerate or edit any artifact. */
export function fullWorkload(){
  const plan=buildPlan(generateFixtures());
  const manifest=plan.manifest.filter(r=>['development','heldout','sentinel'].includes(r.stage));
  const counts=Object.fromEntries(['development','heldout','sentinel'].map(stage=>[stage,manifest.filter(r=>r.stage===stage).length]));
  if(manifest.length!==120||counts.development!==32||counts.heldout!==64||counts.sentinel!==24||new Set(manifest.map(r=>r.id)).size!==120)fail('full_workload_mismatch');
  return {manifest,counts,reservedUSD:money(manifest.reduce((n,r)=>n+RESERVATION[/** @type {'astra'|'jev'} */(r.kind)],0)),planHash:digest(plan)};
}
/** @param {{attempts:number,reservedUSD:number}} history @param {{manifest:{id:string}[],reservedUSD:number}} workload */
export function assertCumulativeCapacity(history,workload){
  if(!Number.isSafeInteger(history.attempts)||history.attempts<0||!Number.isFinite(history.reservedUSD)||history.reservedUSD<0||history.attempts+workload.manifest.length>LIMITS.totalCalls||money(history.reservedUSD+workload.reservedUSD)>LIMITS.totalUSD)fail('cumulative_full_budget_exhausted');
}
/** readHistory is a test seam; the CLI always uses readAcceptedSmoke and committed definitions.
 * @param {{approved:boolean,apiKey:string|undefined,protocolHash:string,outputDir:string,readHistory?:typeof readAcceptedSmoke}} options
 */
export function fullRunGate({approved,apiKey,protocolHash,outputDir,readHistory=readAcceptedSmoke}){
  if(!approved||!apiKey)fail('owner_approval_and_gateway_key_required');
  const protocol=JSON.parse(readFileSync(new URL('../fixtures/frozen-protocol.json',import.meta.url),'utf8'));
  const workload=fullWorkload(),savedPlan=JSON.parse(readFileSync(new URL('../results/live-plan.json',import.meta.url),'utf8'));
  if(digest(protocol)!==protocolHash||protocol.planHash!==workload.planHash||savedPlan.protocolHash!==protocolHash||digest({...savedPlan,protocolHash:undefined})!==workload.planHash)fail('frozen_protocol_or_plan_mismatch');
  const history=readHistory(outputDir,protocolHash);assertCumulativeCapacity(history,workload);
  const ledgerPath=join(outputDir,'full-reservations.jsonl');
  const previous=existsSync(ledgerPath)?jsonLines(ledgerPath):[];
  const used=new Set(history.requestIds);let count=history.attempts,cost=history.reservedUSD;
  for(const row of previous){
    const r=workload.manifest.find(r=>r.id===row.requestId&&r.kind===row.kind);
    if(!r||used.has(row.requestId)||row.protocolHash!==protocolHash||row.acceptedSmokeEvidenceHash!==history.evidenceHash||row.reserveUSD!==RESERVATION[/** @type {'astra'|'jev'} */(r.kind)])fail('invalid_full_ledger');
    used.add(row.requestId);count++;cost=money(cost+row.reserveUSD);
  }
  if(count>LIMITS.totalCalls||cost>LIMITS.totalUSD)fail('cumulative_full_budget_exhausted');
  let ledgerDigest=digest(previous);
  const ensureUnchanged=()=>{
    if(digest(readHistory(outputDir,protocolHash))!==digest(history))fail('historical_accounting_changed');
    const current=existsSync(ledgerPath)?jsonLines(ledgerPath):[];
    if(digest(current)!==ledgerDigest)fail('full_ledger_changed_outside_serialized_run');
    return current;
  };
  return {
    history,workload,
    snapshot:()=>({historicalAttempts:history.attempts,historicalReservedUSD:history.reservedUSD,historicalKnownReportedCostUSD:history.knownReportedCostUSD,historicalReportedCostUSD:history.reportedCostUSD,historicalUnknownChargeRequestIds:history.unknownChargeRequestIds,fullReservedAttempts:count-history.attempts,cumulativeReservedAttempts:count,cumulativeReservedUSD:cost,remainingReservationUSD:money(LIMITS.totalUSD-cost)}),
    /** @param {string} requestId @param {'astra'|'jev'} kind */
    reserve(requestId,kind){
      const planned=workload.manifest.find(r=>r.id===requestId&&r.kind===kind);
      if(!planned)fail('request_outside_full_manifest');
      if(used.has(requestId))fail('request_already_reserved');
      const prior=ensureUnchanged(),reserveUSD=RESERVATION[kind];
      if(count>=LIMITS.totalCalls||money(cost+reserveUSD)>LIMITS.totalUSD)fail('approved_budget_exhausted');
      const row={requestId,kind,protocolHash,acceptedSmokeEvidenceHash:history.evidenceHash,reserveUSD};
      mkdirSync(outputDir,{recursive:true});const fd=openSync(ledgerPath,prior.length?'a':'wx');
      try{writeSync(fd,JSON.stringify(row)+'\n');fsyncSync(fd);}finally{closeSync(fd);}
      ledgerDigest=digest([...prior,row]);used.add(requestId);count++;cost=money(cost+reserveUSD);
      return {count,reservedUSD:cost};
    },
    /** Resume only recorded attempts; an absent result for a reservation can never be retried.
     * @param {string} id @param {'astra'|'jev'} kind @param {Record<string,any>} row
     */
    validateObservation(id,kind,row){
      ensureUnchanged();
      if(!workload.manifest.some(r=>r.id===id&&r.kind===kind)||!used.has(id)||row.id!==id||row.kind!==kind||row.protocolHash!==protocolHash||!['success','failed'].includes(row.status))fail('unreserved_or_invalid_full_observation');
      if(row.status==='success')verifyPinnedMetadata(row.result?.metadata,executionProfile(kind));
    },
  };
}
