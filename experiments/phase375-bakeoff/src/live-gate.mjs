import { readFileSync,appendFileSync,mkdirSync,existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { digest } from './fixtures.mjs';
import { SafeFailure } from './transport.mjs';
import { buildPlan, LIMITS, RESERVATION } from './plan.mjs';
import { generateFixtures } from './fixtures.mjs';

/** Durable request reservation prevents repeated CLI invocation from resetting the approved budget.
 * Failure/uncertain billing keeps its full reservation; no retries or implicit budget replenishment.
 * @param {{approved:boolean,apiKey:string|undefined,protocolHash:string,ledgerPath:string,phase:'smoke'|'full',approvedDiagnosticIds?:string[]}} options
 */
export function liveGate({approved,apiKey,protocolHash,ledgerPath,phase,approvedDiagnosticIds=[]}){
  if(!approved||!apiKey)throw new SafeFailure('configuration','owner_approval_and_gateway_key_required');
  const protocol=JSON.parse(readFileSync(new URL('../fixtures/frozen-protocol.json',import.meta.url),'utf8'));
  const plan=JSON.parse(readFileSync(new URL('../results/live-plan.json',import.meta.url),'utf8'));
  if(digest(protocol)!==protocolHash||protocolHash!==plan.protocolHash)throw new SafeFailure('configuration','frozen_protocol_mismatch');
  const expected=buildPlan(generateFixtures());
  if(digest(expected)!==protocol.planHash||digest({...plan,protocolHash:undefined})!==digest(expected))throw new SafeFailure('configuration','frozen_plan_mismatch');
  const previous=existsSync(ledgerPath)?readFileSync(ledgerPath,'utf8').trim().split('\n').filter(Boolean).map(x=>JSON.parse(x)):[];
  if(previous.some(x=>x.protocolHash!==protocolHash||!Number.isFinite(x.reserveUSD)||x.reserveUSD<0)||new Set(previous.map(x=>x.requestId)).size!==previous.length||!['smoke','full'].includes(phase))throw new SafeFailure('configuration','invalid_ledger_or_phase');
  const used=new Set(previous.map(x=>x.requestId));let count=previous.length,cost=previous.reduce((n,x)=>n+x.reserveUSD,0);
  // Serialized runner only. Simultaneous CLI processes are not supported; future owner run acquires its file lock.
  return {
    /** @param {string} requestId @param {'astra'|'jev'} kind */
    reserve(requestId,kind){
      if(!['astra','jev'].includes(kind))throw new SafeFailure('configuration','unknown_model');
      if(used.has(requestId))throw new SafeFailure('configuration','request_already_reserved');
      const planned=expected.manifest.find(r=>r.id===requestId&&r.kind===kind);
      if(!planned||phase==='smoke'&&!['smoke','diagnostic-separate-approval'].includes(planned.stage)||planned.stage==='diagnostic-separate-approval'&&!approvedDiagnosticIds.includes(requestId))throw new SafeFailure('configuration','request_outside_approved_manifest');
      const reserveUSD=RESERVATION[kind];
      if(count>= (phase==='smoke'?LIMITS.smokeCalls:LIMITS.totalCalls)||cost+reserveUSD> (phase==='smoke'?LIMITS.smokeUSD:LIMITS.totalUSD))throw new SafeFailure('configuration','approved_budget_exhausted');
      mkdirSync(dirname(ledgerPath),{recursive:true});
      appendFileSync(ledgerPath,JSON.stringify({requestId,kind,protocolHash,reserveUSD})+'\n');
      count++;cost+=reserveUSD;used.add(requestId);return {count,reservedUSD:cost};
    },
  };
}
