import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SafeFailure,safeError} from '../src/transport.mjs';
globalThis.fetch=()=>{throw new Error('NETWORK_DISABLED_IN_TESTS');};
const source=readFileSync(new URL('../src/run-live.mjs',import.meta.url),'utf8');
const begin=source.indexOf('  async function attempt('),end=source.indexOf('  /** @param {import',begin);
assert.ok(begin>0&&end>begin);
const block=source.slice(begin,end),AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
async function simulate(first){
 const rows=[],reserved=[],called=[];
 const run=new AsyncFunction('first','called','safeError','existsSync','gate','save','outputDir','approvedHash','observations','readFileSync',
 'let newRequests=0;'+block+"\nlet stopped=false;try{await attempt('synthetic-first','astra',async()=>{called.push('first');return await first();});await attempt('synthetic-next','astra',async()=>{called.push('next');return {metadata:{costUSD:0,inputTokens:1,outputTokens:1}};});}catch{stopped=true;}return {stopped,newRequests};");
 const result=await run(first,called,safeError,()=>false,{reserve:id=>reserved.push(id)},(_name,row)=>rows.push(row),new URL('file:///synthetic-only/'),'synthetic-protocol',[],()=>{throw new Error('NO_FILE_READ_EXPECTED');});
 return {...result,rows,reserved,called};
}
for(const [code,category] of [['validation','malformed'],['provider','unverified_routing'],['provider','unavailable'],['configuration','unsupported_options'],['provider','incomplete'],['provider','quota']]){
 test('full runner durably records '+category+' then stops before another reservation/request',async()=>{
  const r=await simulate(async()=>{throw new SafeFailure(code,category);});
  assert.equal(r.stopped,true);assert.equal(r.newRequests,1);assert.deepEqual(r.called,['first']);assert.deepEqual(r.reserved,['synthetic-first']);assert.equal(r.rows.length,1);assert.equal(r.rows[0].status,'failed');assert.equal(r.rows[0].error.category,category);
 });
}
test('missing billing still stops immediately after recording the observation',async()=>{
 const r=await simulate(async()=>({metadata:{costUSD:null,inputTokens:1,outputTokens:1}}));assert.equal(r.stopped,true);assert.equal(r.newRequests,1);assert.deepEqual(r.called,['first']);assert.equal(r.rows.length,1);
});
test('successful validated observations continue normally without altered request sequencing',async()=>{
 const r=await simulate(async()=>({metadata:{costUSD:0,inputTokens:1,outputTokens:1}}));assert.equal(r.stopped,false);assert.equal(r.newRequests,2);assert.deepEqual(r.called,['first','next']);assert.equal(r.rows.every(x=>x.status==='success'),true);
});
