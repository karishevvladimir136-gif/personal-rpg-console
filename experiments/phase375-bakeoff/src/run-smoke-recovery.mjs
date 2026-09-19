// This entry point supports only the separately authorized recovery manifest, never the full benchmark.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runRecovery,BASE_COMMIT } from './smoke-recovery.mjs';
import { safeError } from './transport.mjs';
try {
  const args=process.argv.slice(2);
  if(args.length!==1||!args[0].startsWith('--approved='))throw new Error('explicit_recovery_approval_required');
  const root=fileURLToPath(new URL('../../../',import.meta.url));
  const git=(/** @type {string[]} */ args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
  if(git(['branch','--show-current'])!=='codex/phase375-technical-bakeoff'||git(['status','--porcelain=v1']))throw new Error('committed_clean_recovery_required');
  git(['merge-base','--is-ancestor',BASE_COMMIT,'HEAD']);
  const manifest=JSON.parse(readFileSync(new URL('../fixtures/smoke-recovery-1.json',import.meta.url),'utf8'));
  const result=await runRecovery({manifest,approvedHash:args[0].slice('--approved='.length),apiKey:process.env.AI_GATEWAY_API_KEY??'',outputDir:fileURLToPath(new URL('../private-live-results/',import.meta.url)),fetcher:fetch,executionCommit:git(['rev-parse','HEAD'])});
  console.log(JSON.stringify(result));
  if(result.status!=='RECOVERY_SMOKE_PASSED')process.exitCode=1;
}catch(error){console.log(JSON.stringify({status:'RECOVERY_STOPPED',error:safeError(error),note:'No automatic retry or diagnostic. Preserve all reservations and observations.'}));process.exitCode=1;}
