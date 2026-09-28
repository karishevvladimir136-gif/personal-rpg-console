-- V1: exact single-model checkpoint children and receipt-aware reference notes.
-- Lead-owned additive extension. No active projection restore, new save system,
-- provider call or old manifest/schema reinterpretation. Disposable verification only.
begin;

create function rpg_private.lab_continuation_base(uid uuid,cid uuid,selection jsonb) returns jsonb
language plpgsql stable set search_path='' as $$
declare r rpg_private.world_lab_runs%rowtype; m rpg_private.timeline_manifests%rowtype;
 continuation jsonb; state jsonb; docs jsonb; heads jsonb; basis jsonb;
begin
 perform rpg_private.fields(selection,array['sourceRunId','sourceCheckpointId','expectedRevision']);
 perform rpg_private.assert(jsonb_typeof(selection->'expectedRevision')='number' and selection->>'expectedRevision' ~ '^[1-9][0-9]{0,9}$' and (selection->>'expectedRevision')::bigint between 1 and 2147483646);
 select * into r from rpg_private.world_lab_runs where id=(selection->>'sourceRunId')::uuid and owner_id=uid and campaign_id=cid;
 if not found then raise exception 'rpg_not_found'; end if;
 if r.revision<>(selection->>'expectedRevision')::integer or not rpg_private.lab_fresh(r) then raise exception 'rpg_conflict'; end if;
 select * into m from rpg_private.timeline_manifests where id=(selection->>'sourceCheckpointId')::uuid and campaign_id=cid and timeline_id=r.timeline_id and lab_run_id=r.id and schema_version=3;
 if not found then raise exception 'rpg_not_found'; end if;
 perform rpg_private.lab_validate_manifest(cid,m.id);
 perform rpg_private.assert(m.canon_generation=(select canon_generation from rpg_private.timeline_campaigns where campaign_id=cid) and m.public_metadata->'pendingAction'='false'::jsonb);
 perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(rpg_private.lab_rows(cid,m.id,'rpg_private.turns')) t where t->>'owner_id'<>uid::text or t->>'status' not in ('committed','cancelled','failed') or (t->>'status'='failed' and t->>'retryable'<>'false')));
 perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(rpg_private.lab_rows(cid,m.id,'public.rpg_pending_actions')) a where a->>'status' not in ('resolved','cancelled')));
 perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(rpg_private.lab_rows(cid,m.id,'rpg_private.world_stages')) st where not exists(select 1 from jsonb_array_elements(rpg_private.lab_rows(cid,m.id,'rpg_private.turns')) t where t->>'id'=st->>'id' and t->>'status'='committed')));
 perform rpg_private.assert((m.public_metadata->>'worldMinutes')::integer=(rpg_private.lab_rows(cid,m.id,'rpg_private.runtime_state')->0->>'world_minutes')::integer);
 continuation:=jsonb_build_object('sourceRunId',r.id,'sourceCheckpointId',m.id,'sourceRunRevision',r.revision,'sourceInputDigest',r.input_digest);
 heads:=r.input_bundle->'sourceHeads'; docs:=r.input_bundle->'documentVersions';
 state:=rpg_private.lab_read_state(uid,cid,m.id,r.id,rpg_private.lab_run_library(r),docs);
 basis:=jsonb_build_object('ownerId',uid,'campaignId',cid,'saveId',r.input_bundle#>'{base,saveId}','manifestId',m.id,'canonGeneration',m.canon_generation,'sourceHeads',heads,'documents',docs,'continuation',continuation);
 return jsonb_build_object('state',state,'sourceHeads',heads,'documents',docs,'base',jsonb_build_object('saveId',r.input_bundle#>'{base,saveId}','timelineId',r.timeline_id,'label',r.label,'worldMinutes',m.public_metadata->'worldMinutes'),'basisDigest',rpg_private.lab_digest(basis),'continuation',continuation);
end $$;

create or replace function rpg_private.lab_composition_valid(uid uuid,cid uuid,mid uuid,body jsonb) returns void
language plpgsql stable set search_path='' as $$
declare meta jsonb:=body->'composition'; basis jsonb:=meta->'basis'; ctx jsonb; packs jsonb; sources jsonb; question record; begin
 perform rpg_private.fields(meta,array['schemaVersion','phase','operationId','premise','language','basis','composeProfile','simulationProfile','choices','originalProposal','review','ownerEdit','usage']);
 perform rpg_private.fields(basis,array['ownerId','campaignId','saveId','baseManifestId','baseTimelineId','canonGeneration','basisDigest','sourceHeads','documents','packVersionIds','sourceVersionIds','startWorldMinutes'],array['continuation']);
 perform rpg_private.assert(meta->>'schemaVersion'='1' and meta->>'phase' in ('requested','review','approved') and meta->>'language' in ('en','ru') and (meta->>'operationId')::uuid is not null and length(btrim(meta->>'premise')) between 1 and 6000);
 perform rpg_private.assert(basis->>'ownerId'=uid::text and basis->>'campaignId'=cid::text and basis->>'baseManifestId'=mid::text);
 if basis ? 'continuation' then
  ctx:=rpg_private.lab_continuation_base(uid,cid,jsonb_build_object('sourceRunId',basis#>'{continuation,sourceRunId}','sourceCheckpointId',basis#>'{continuation,sourceCheckpointId}','expectedRevision',basis#>'{continuation,sourceRunRevision}'));
  perform rpg_private.assert(ctx->'continuation'=basis->'continuation' and ctx#>'{base,saveId}'=basis->'saveId');
 else ctx:=rpg_private.lab_composition_base(uid,cid,(basis->>'saveId')::uuid); end if;
 perform rpg_private.assert(ctx#>>'{state,manifest,id}'=mid::text and ctx#>'{state,manifest,timelineId}'=basis->'baseTimelineId' and ctx#>'{state,canonGeneration}'=basis->'canonGeneration'
  and ctx->'basisDigest'=basis->'basisDigest' and ctx->'sourceHeads'=basis->'sourceHeads' and ctx->'documents'=basis->'documents' and ctx#>'{base,worldMinutes}'=basis->'startWorldMinutes');
 select coalesce(jsonb_agg(v->'versionId' order by v->>'versionId'),'[]') into packs from jsonb_array_elements(ctx#>'{state,libraryRecords}') v where v->>'kind'='pack';
 select coalesce(jsonb_agg(v->'versionId' order by v->>'versionId'),'[]') into sources from jsonb_array_elements(ctx#>'{state,libraryRecords}') v where v->>'kind'='source';
 perform rpg_private.assert(basis->'packVersionIds'=packs and basis->'sourceVersionIds'=sources and body->'packVersionIds'=packs and body->'sourceVersionIds'=sources and body->'sourcePriority'=sources);
 perform rpg_private.assert(body#>'{entry,worldMinutes}'=basis->'startWorldMinutes' and body#>'{entry,evidence}'='[]'::jsonb and body->>'adaptation'='original' and body->'identities'='[]'::jsonb and body->'carriedClaimIds'='[]'::jsonb and body->'localHistory'='null'::jsonb and body->'unresolvedConflictIds'='[]'::jsonb);
 perform rpg_private.lab_execution_profile(meta->'composeProfile','world.compose');
 perform rpg_private.lab_execution_profile(meta->'simulationProfile','world.resolve');
 perform rpg_private.assert(meta#>'{composeProfile,policyRevision}'=meta#>'{simulationProfile,policyRevision}');
 if meta->>'phase'='requested' then
  perform rpg_private.assert(meta->'originalProposal'='null'::jsonb and meta->'review'='null'::jsonb and meta->'ownerEdit'='null'::jsonb and meta->'usage'='null'::jsonb);
 else
  perform rpg_private.assert(jsonb_typeof(meta->'originalProposal')='object' and jsonb_typeof(meta->'review')='object' and jsonb_typeof(meta->'usage')='object');
  perform rpg_private.assert(body->'title'=meta#>'{review,title}' and jsonb_array_length(meta#>'{review,ambiguityAnswers}')=jsonb_array_length(meta#>'{originalProposal,ambiguities}'));
 end if;
 perform rpg_private.assert((body->>'status'='approved')=(meta->>'phase'='approved') and (body->'approval'<>'null'::jsonb)=(meta->>'phase'='approved'));
 if meta->>'phase'='approved' then
  perform rpg_private.assert(body#>>'{approval,ownerId}'=uid::text and meta#>>'{review,divergenceType}' in ('circumstance','actor_intent','resource')
   and (meta#>>'{review,offsetMinutes}')::integer>=0 and (meta#>>'{review,offsetMinutes}')::integer<(meta#>>'{review,horizonMinutes}')::integer
   and (meta#>>'{review,horizonMinutes}')::integer between 1 and 43200 and meta#>'{review,policy}'=(rpg_private.lab_rows(cid,mid,'rpg_private.world_foundations')->0)#>'{world,policy}');
  for question in select value,n from jsonb_array_elements(meta#>'{originalProposal,ambiguities}') with ordinality q(value,n) loop
   perform rpg_private.assert(question.value->>'consequential'<>'true' or length(btrim(meta#>>array['review','ambiguityAnswers',(question.n-1)::text]))>0);
  end loop;
 end if;
end $$;

create or replace function rpg_private.lab_input(uid uuid,cid uuid,req jsonb,context jsonb) returns jsonb language plpgsql stable set search_path='' as $$
declare mid uuid:=(context#>>'{state,manifest,id}')::uuid; f jsonb; guide jsonb; start_minute integer; horizon integer; packs jsonb; sources jsonb; composition jsonb; result jsonb; begin
 perform rpg_private.fields(req,array['operationId','campaignId','saveId','scenarioVersionId','divergenceVersionId','label','horizonMinutes']);
 perform rpg_private.assert(req->>'campaignId'=cid::text and (req->>'operationId')::uuid is not null and jsonb_typeof(req->'label')='string' and length(btrim(req->>'label')) between 1 and 160 and btrim(req->>'label')=req->>'label');
 perform rpg_private.assert(jsonb_typeof(req->'horizonMinutes')='number' and (req->>'horizonMinutes')::numeric=trunc((req->>'horizonMinutes')::numeric));
 horizon:=(req->>'horizonMinutes')::integer; perform rpg_private.assert(horizon between 1 and 43200);
 f:=rpg_private.lab_rows(cid,mid,'rpg_private.world_foundations')->0; guide:=rpg_private.lab_rows(cid,mid,'public.rpg_documents')->0;
 start_minute:=(rpg_private.lab_rows(cid,mid,'rpg_private.runtime_state')->0->>'world_minutes')::integer;
 perform rpg_private.assert(start_minute between 0 and 2147483646-horizon);
 select coalesce(jsonb_agg(value->'versionId' order by value->>'versionId'),'[]') into packs from jsonb_array_elements(context#>'{state,libraryRecords}') where value->>'kind'='pack';
 select coalesce(jsonb_agg(value->'versionId' order by value->>'versionId'),'[]') into sources from jsonb_array_elements(context#>'{state,libraryRecords}') where value->>'kind'='source';
 select value#>'{body,composition}' into composition from jsonb_array_elements(context#>'{state,libraryRecords}') where value->'versionId'=req->'scenarioVersionId';
 if composition is not null then perform rpg_private.assert(composition#>'{basis,saveId}'=req->'saveId' and composition#>'{review,horizonMinutes}'=req->'horizonMinutes'); end if;
 result:=jsonb_build_object('schemaVersion',1,'purpose','simulation','nonCanon',true,'ownerId',uid,'campaignId',cid,
 'base',jsonb_build_object('saveId',req->'saveId','timelineId',context#>'{state,manifest,timelineId}','manifestId',mid,'schemaVersion',context#>'{state,manifest,schemaVersion}'),
 'scenarioVersionId',req->'scenarioVersionId','divergenceVersionId',req->'divergenceVersionId','packVersionIds',packs,'sourceVersionIds',sources,
 'documentVersions',context->'documents','sourceHeads',context->'sourceHeads','canonGeneration',context#>'{state,canonGeneration}','ruleset',f->'ruleset',
 'effectiveSettings',rpg_private.lab_rows(cid,mid,'public.rpg_settings')->0->'values',
 'effectiveGuidance',jsonb_build_object('documentId',guide->'id','versionId',guide->'current_version_id','sessionGuidance',rpg_private.lab_rows(cid,mid,'public.rpg_session_guidance')),
 'resolutionPolicy',jsonb_build_object('id','deterministic-world-v1','version',1,'maxSteps',32),'startWorldMinutes',start_minute,'throughWorldMinutes',start_minute+horizon);
 if composition is not null then result:=jsonb_set(result,'{resolutionPolicy,id}','"single-model-world-v1"')||jsonb_build_object('executionProfile',composition->'simulationProfile'); end if;
 if context ? 'continuation' then result:=result||jsonb_build_object('continuation',context->'continuation'); end if;
 return result;
end $$;

-- Keep the exact accepted RPC implementation for unaffected actions.
alter function public.rpg_world_lab(uuid,uuid,text,jsonb) set schema rpg_private;
alter function rpg_private.rpg_world_lab(uuid,uuid,text,jsonb) rename to lab_rpc_before_continuation;

create function public.rpg_world_lab(p_owner_id uuid,p_campaign_id uuid,p_action text,p_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=p_owner_id; cid uuid:=p_campaign_id; ctx jsonb; req jsonb; normal_req jsonb; input jsonb; library jsonb;
 receipt rpg_private.world_lab_commands%rowtype; base rpg_private.timeline_manifests%rowtype; r rpg_private.world_lab_runs%rowtype;
 op uuid; rid uuid; tid uuid; mid uuid; result jsonb;
begin
 if p_action not in ('continuation_base','continuation_prepare') then return rpg_private.lab_rpc_before_continuation(uid,cid,p_action,p_payload); end if;
 if uid is null or not exists(select 1 from rpg_private.owner_registry where user_id=uid) then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 if not exists(select 1 from public.rpg_campaigns where id=cid) then raise exception 'rpg_not_found'; end if;
 perform rpg_private.assert(jsonb_typeof(p_payload)='object' and length(p_payload::text)<=2000000);
 if p_action='continuation_base' then return rpg_private.lab_continuation_base(uid,cid,p_payload); end if;
 perform rpg_private.fields(p_payload,array['request','input','inputDigest']); req:=p_payload->'request';
 perform rpg_private.fields(req,array['operationId','campaignId','sourceRunId','sourceCheckpointId','expectedRevision','scenarioVersionId','divergenceVersionId','label','horizonMinutes']);
 perform rpg_private.assert(req->>'campaignId'=cid::text); op:=(req->>'operationId')::uuid; perform rpg_private.assert(op is not null);
 perform pg_advisory_xact_lock(hashtextextended(op::text,0));
 select * into receipt from rpg_private.world_lab_commands where operation_id=op and stage='prepare';
 if found then
  if receipt.owner_id<>uid or receipt.campaign_id<>cid or receipt.request<>p_payload then raise exception 'rpg_conflict'; end if;
  return receipt.result;
 end if;
 perform rpg_private.assert(not exists(select 1 from rpg_private.world_lab_commands where operation_id=op));
 perform 1 from rpg_private.owner_registry where user_id=uid for share;
 perform 1 from rpg_private.timeline_campaigns where campaign_id=cid for share;
 perform 1 from rpg_private.world_lab_runs where id=(req->>'sourceRunId')::uuid and owner_id=uid and campaign_id=cid for share;
 ctx:=rpg_private.lab_continuation_base(uid,cid,jsonb_build_object('sourceRunId',req->'sourceRunId','sourceCheckpointId',req->'sourceCheckpointId','expectedRevision',req->'expectedRevision'));
 library:=rpg_private.lab_dependencies(uid,cid,(ctx#>>'{state,manifest,id}')::uuid,(req->>'scenarioVersionId')::uuid,(req->>'divergenceVersionId')::uuid);
 perform rpg_private.assert(exists(select 1 from jsonb_array_elements(library) sc where sc->>'versionId'=req->>'scenarioVersionId' and sc#>'{body,composition,basis,continuation}'=ctx->'continuation'));
 ctx:=jsonb_set(ctx,'{state,libraryRecords}',library);
 normal_req:=(req-'sourceRunId'-'sourceCheckpointId'-'expectedRevision')||jsonb_build_object('saveId',ctx#>'{base,saveId}');
 input:=rpg_private.lab_input(uid,cid,normal_req,ctx);
 perform rpg_private.assert(input=p_payload->'input' and rpg_private.lab_digest(input)=p_payload->>'inputDigest');
 select * into strict base from rpg_private.timeline_manifests where id=(input#>>'{base,manifestId}')::uuid and campaign_id=cid;
 rid:=gen_random_uuid(); tid:=gen_random_uuid(); mid:=gen_random_uuid();
 insert into rpg_private.timelines(id,campaign_id,label,parent_timeline_id,fork_save_id,purpose) values(tid,cid,req->>'label',base.timeline_id,null,'simulation');
 insert into rpg_private.world_lab_runs(id,campaign_id,owner_id,timeline_id,label,input_bundle,input_digest,status,head_manifest_id,last_checkpoint_id,current_world_minutes) values(rid,cid,uid,tid,req->>'label',input,p_payload->>'inputDigest','prepared',mid,mid,(input->>'startWorldMinutes')::integer) returning * into r;
 insert into rpg_private.timeline_manifests(id,campaign_id,timeline_id,refs,public_metadata,canon_generation,schema_version,lab_run_id) values(mid,cid,tid,base.refs,base.public_metadata||jsonb_build_object('labOrdinal',0),base.canon_generation,3,rid);
 update rpg_private.timelines set head_manifest_id=mid,head_public=base.public_metadata,head_revision=0 where campaign_id=cid and id=tid;
 result:=rpg_private.lab_run_json(r);
 insert into rpg_private.world_lab_commands(operation_id,stage,owner_id,campaign_id,run_id,request,result) values(op,'prepare',uid,cid,rid,p_payload,result);
 return result;
end $$;

-- Read an already-committed ordinary mutation receipt before reference-note
-- preflight. Existing mutation/timeline authorities own writes and fencing.
create function public.rpg_mutation_receipt(p_owner_id uuid,p_mutation jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=p_owner_id; cid uuid; receipt rpg_private.mutation_receipts%rowtype; req jsonb; result jsonb; rid uuid;
begin
 if uid is null or not exists(select 1 from rpg_private.owner_registry where user_id=uid) then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform rpg_private.fields(p_mutation,array['requestId','operation','campaignId','expectedRevision','payload','timeline'],array['correctionScope']);
 perform rpg_private.assert(p_mutation->>'operation' in ('document.save','document.restore','asset.save') and length(p_mutation::text)<=1000000);
 cid:=(p_mutation->>'campaignId')::uuid; rid:=(p_mutation->>'requestId')::uuid;
 perform rpg_private.assert(cid is not null and rid is not null and jsonb_typeof(p_mutation->'expectedRevision')='number');
 if not exists(select 1 from public.rpg_campaigns where id=cid) then raise exception 'rpg_not_found'; end if;
 perform rpg_private.timeline_assert(cid,p_mutation->'timeline');
 if exists(select 1 from rpg_private.timeline_mutation_receipts t where t.request_id=rid and (t.campaign_id<>cid or jsonb_build_object('timelineId',t.timeline_id,'epoch',t.epoch)<>p_mutation->'timeline')) then raise exception 'rpg_conflict'; end if;
 select * into receipt from rpg_private.mutation_receipts where request_id=rid;
 if not found then return 'null'::jsonb; end if;
 req:=jsonb_build_object('operation',p_mutation->'operation','campaign_id',cid,'expected_revision',p_mutation->'expectedRevision','payload',p_mutation->'payload');
 if receipt.owner_id<>uid or receipt.campaign_id<>cid or receipt.request<>req then raise exception 'rpg_conflict'; end if;
 if p_mutation->>'operation' in ('document.save','document.restore') and p_mutation->>'correctionScope' is distinct from 'campaign' then raise exception 'rpg_validation'; end if;
 result:=jsonb_build_object('id',receipt.result->'id','revision',receipt.result->'revision','campaign_id',cid,'timeline',rpg_private.timeline_fence(cid));
 return result;
end $$;

revoke all on all functions in schema rpg_private from public,anon,authenticated,service_role;
revoke all on function public.rpg_world_lab(uuid,uuid,text,jsonb) from public,anon,authenticated;
revoke all on function public.rpg_mutation_receipt(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.rpg_world_lab(uuid,uuid,text,jsonb) to service_role;
grant execute on function public.rpg_mutation_receipt(uuid,jsonb) to service_role;
commit;
