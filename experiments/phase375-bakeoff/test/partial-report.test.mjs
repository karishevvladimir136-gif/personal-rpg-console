import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {analyzePartialRun} from '../src/partial-report.mjs';
import {digest} from '../src/fixtures.mjs';

globalThis.fetch=()=>{throw new Error('NETWORK_DISABLED_IN_REPORT_TESTS');};
const read=name=>JSON.parse(readFileSync(new URL('../'+name,import.meta.url),'utf8'));
const evidence=read('results/full-run-observations.json'),protocol=read('fixtures/frozen-protocol.json');
const report=read('results/full-run-analysis.json');
const calculate=(e=evidence,p=protocol)=>analyzePartialRun(e,p);
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-12);
test('committed partial analysis exactly recomputes from sanitized observations and unchanged gold',()=>{
 assert.deepEqual(calculate(),report);
});
test('stopped coverage is 13 attempts, 12 successes, 1 failure and 107 unattempted; never a completed benchmark',()=>{
 assert.deepEqual([report.counts.attempted,report.counts.successful,report.counts.failed,report.counts.notAttempted,report.counts.cumulativeAttempts],[13,12,1,107,21]);
 assert.equal(report.status,'STOPPED_INCOMPLETE');assert.equal(report.development.astra.successfulSnapshots,0);
 assert.equal(report.counts.heldout.attempted,0);assert.equal(report.counts.sentinel.attempted,0);
});
test('reservations include all history while failed billing is unknown, not zero',()=>{
 assert.equal(report.money.newReservedUSD,.26);assert.equal(report.money.cumulativeReservedUSD,2.69696);
 assert.equal(report.money.cumulativeKnownReportedCostUSD,.0969725);
 assert.equal(report.money.newKnownReportedCostUSD,0);assert.equal(report.money.newTotalCostUSD,null);
 assert.equal(report.money.cumulativeTotalCostUSD,null);
 assert.deepEqual(report.money.unknownChargeRequestIds,['smoke-plan','smoke-narration','beacon-batteries-jev']);
 assert.equal(report.money.permissionToUseHeadroom,false);
 assert.equal(evidence.history.ownerReportedPrior403SpendUSD,0);
});
test('success routing retains UNKNOWN model and failure metadata is not inferred',()=>{
 assert.equal(report.routing.verifiedRequests,12);assert.equal(report.routing.actualModel,null);
 assert.equal(report.routing.modelAttemptsPerVerifiedRequest,1);assert.equal(report.routing.providerAttemptsPerVerifiedRequest,1);
 assert.equal(report.routing.failedRouting,null);assert.equal(report.failure.httpStatus,null);
 assert.equal(report.usage.failedInputTokens,null);assert.equal(report.usage.failedOutputTokens,null);
 assert.equal(report.usage.successfulInputTokens,40660);assert.equal(report.usage.successfulOutputTokens,11985);
 assert.equal(report.routing.retriesMade,0);assert.equal(report.failure.error.retryable,true);
});
test('partial calibration is diagnostic only; missing comparison scores cannot count toward frozen coverage',()=>{
 const j=report.development.jev;assert.equal(j.observedScores,216);assert.equal(j.requiredScores,288);
 assert.equal(j.successfulSnapshots,12);assert.equal(j.requiredSnapshots,16);
 assert.equal(j.calibrated,false);assert.equal(j.calibrationFrozen,false);
 near(j.subset.calibrationDiagnostic.ece,.14574074074074087);
 near(j.subset.calibrationDiagnostic.brier,.11981111111111112);
 assert.equal(report.development.astra.calibration,null);assert.equal(report.development.byFamily.comparison,null);
});
test('raw admission misses three relevant source items; uncalibrated protection retains all without savings',()=>{
 const s=report.development.jev.subset;
 assert.equal(s.labels.correct,177);assert.equal(s.labels.n,240);assert.equal(s.labels.confusion['relevant->irrelevant'],42);
 assert.equal(s.rawThresholdDiagnostic.falseNegative,3);assert.equal(s.rawThresholdDiagnostic.criticalMisses,0);
 assert.equal(s.protectedUncalibratedReplay.falseNegative,0);assert.equal(s.candidateReduction.protectedAvoided,0);
 assert.equal(s.candidateReduction.rawAvoided,36);
 assert.equal(s.byteReduction.protectedAvoided,0);assert.equal(s.byteReduction.protectedNetSerializedBytesAvoided,-130835);
 assert.equal(s.labels.uncertain,9);assert.equal(s.labels.omitted,0);assert.equal(s.protectedUncalibratedReplay.uncertainLost,0);
 assert.ok(s.falseNegatives.every(r=>r.snapshot==='water-charter'&&r.language==='ru'&&r.family==='source'));
});
test('family and language diagnostics stay separate from unobserved held-out performance',()=>{
 const d=report.development;
 assert.equal(d.byLanguage.en.labels.correct,97);assert.equal(d.byLanguage.ru.labels.correct,80);
 assert.equal(d.byLanguage.en.rawThresholdDiagnostic.falseNegative,0);assert.equal(d.byLanguage.ru.rawThresholdDiagnostic.falseNegative,3);
 assert.deepEqual(['thread','actor','source'].map(f=>d.byFamily[f].labels.correct),[61,65,51]);
 for(const v of Object.values(report.recommendations))assert.equal(v,'DO NOT ADOPT');
});
test('all eight sentinel comparisons remain unmeasured rather than fabricated zero-error results',()=>{
 assert.equal(report.heldout.recall,null);assert.equal(report.heldout.scopeTimelineFailures,null);
 assert.equal(report.sentinels.length,8);
 for(const r of report.sentinels){assert.equal(r.status,'NOT_RUN');for(const k of ['A','B','C','lostFindingsVersusA','unsupportedClaims','scopeTimelineFailures'])assert.equal(r[k],null);}
 assert.equal(report.latency.pairedPipelineSavings,null);
});
test('archived fingerprints include every original accepted artifact and all new stopped records',()=>{
 const accepted=read('fixtures/accepted-smoke-recovery-2.json');
 assert.equal(Object.keys(evidence.originalArtifactSHA256).length,29);
 for(const [name,hash] of Object.entries(accepted.artifactHashes))assert.equal(evidence.originalArtifactSHA256[name],hash);
 assert.equal(Object.keys(evidence.observationDigests).length,13);
 assert.equal(evidence.history.evidenceHash,digest(accepted));
 assert.equal(evidence.githubMain,'cb7f6be2fb513de13604d381046a3240f3261383');
 assert.notEqual(evidence.githubMain,evidence.localMainRef);
});
test('altered probabilities without matching evidence hash are rejected',()=>{
 const copy=structuredClone(evidence);copy.observations[0].result.envelope.decisions[0].label='irrelevant';
 assert.throws(()=>calculate(copy),/observation_digest/);
});
test('wrong provider remains rejected even if a derived observation digest is refreshed',()=>{
 const copy=structuredClone(evidence);copy.observations[0].result.metadata.finalProvider='unexpected';
 copy.observationDigests[copy.observations[0].id]=digest(copy.observations[0]);
 assert.throws(()=>calculate(copy),e=>e.category==='unqualified_routing_or_billing');
});
test('duplicate requests, changed reservation amount, extra call after failure and changed protocol fail',()=>{
 let copy=structuredClone(evidence);copy.fullLedger[1]=copy.fullLedger[0];assert.throws(()=>calculate(copy),/request_order_or_duplicate/);
 copy=structuredClone(evidence);copy.fullLedger[0].reserveUSD=0;assert.throws(()=>calculate(copy),/reservation_mismatch/);
 copy=structuredClone(evidence);copy.observations.push(copy.observations[0]);copy.fullLedger.push(copy.fullLedger[0]);assert.throws(()=>calculate(copy),/stop_prefix_mismatch/);
 const changed=structuredClone(protocol);changed.policy.irrelevantThreshold=.5;assert.throws(()=>calculate(evidence,changed),/frozen_contract_mismatch/);
});
