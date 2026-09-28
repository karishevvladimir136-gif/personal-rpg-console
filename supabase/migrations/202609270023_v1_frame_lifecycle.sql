-- FRAME jobs are representation bookkeeping, not factual campaign corrections.
-- Keep one fenced mutation core and the existing immutable versions/receipts.
begin;

create function rpg_private.apply_fenced_mutation(p_request_id uuid,p_operation text,p_campaign_id uuid,p_expected_revision integer,p_payload jsonb,p_timeline jsonb default null,p_correction_scope text default null,p_frame_lifecycle boolean default false)
returns jsonb language plpgsql set search_path='' as $$
declare result jsonb; scope text; doc uuid; exists_before boolean;
begin
 if not public.rpg_is_owner() then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 if p_frame_lifecycle and p_operation is distinct from 'document.save' then raise exception 'rpg_validation'; end if;
 if p_campaign_id is not null then
  perform 1 from public.rpg_campaigns where id=p_campaign_id for update; if not found then raise exception 'rpg_not_found'; end if;
  perform rpg_private.timeline_assert(p_campaign_id,p_timeline);
  if exists(select 1 from rpg_private.timeline_mutation_receipts r where r.request_id=p_request_id and jsonb_build_object('timelineId',r.timeline_id,'epoch',r.epoch)<>rpg_private.timeline_fence(p_campaign_id)) then raise exception 'rpg_conflict'; end if;
  doc:=(p_payload->>'id')::uuid;
  scope:=case when p_operation in ('campaign.save','feedback.send','asset.save') then null
    when p_operation in ('document.save','document.restore') and not exists(select 1 from public.rpg_dm_guides where campaign_id=p_campaign_id and document_id=doc) then 'campaign' else 'timeline' end;
  if scope is not null and p_correction_scope is not null and p_correction_scope<>scope then raise exception 'rpg_validation'; end if;
  if scope is not null and p_correction_scope is null and (select epoch>1 from rpg_private.timeline_campaigns where campaign_id=p_campaign_id) then raise exception 'rpg_validation'; end if;
 end if;
 exists_before:=exists(select 1 from rpg_private.mutation_receipts where request_id=p_request_id);
 result:=rpg_private.mutation_before_timelines(p_request_id,p_operation,p_campaign_id,p_expected_revision,p_payload);
 if not exists_before and p_campaign_id is not null then
  insert into rpg_private.timeline_mutation_receipts select p_request_id,p_campaign_id,active_timeline_id,epoch from rpg_private.timeline_campaigns where campaign_id=p_campaign_id;
 end if;
 if not exists_before and not p_frame_lifecycle and scope='campaign' and p_operation in ('document.save','document.restore') then
  update rpg_private.timeline_campaigns set canon_generation=canon_generation+1 where campaign_id=p_campaign_id;
 end if;
 return case when result ? 'campaign_id' then result||jsonb_build_object('timeline',rpg_private.timeline_fence((result->>'campaign_id')::uuid)) else result end;
end $$;

-- Ordinary callers cannot select the private lifecycle mode, even with a
-- reserved prefix or a valid frame-shaped body. Their correction semantics stay.
create or replace function public.rpg_apply_mutation(p_request_id uuid,p_operation text,p_campaign_id uuid,p_expected_revision integer,p_payload jsonb,p_timeline jsonb default null,p_correction_scope text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 return rpg_private.apply_fenced_mutation(p_request_id,p_operation,p_campaign_id,p_expected_revision,p_payload,p_timeline,p_correction_scope,false);
end $$;

create function rpg_private.frame_value(body text,cid uuid) returns jsonb
language plpgsql set search_path='' as $$
declare v jsonb; item jsonb; basis jsonb; scene jsonb; prefix text:=E'RPG_VISUAL_FRAME_V0\n';
begin
 perform rpg_private.assert(length(body)<=60000 and left(body,length(prefix))=prefix);
 v:=substring(body from length(prefix)+1)::jsonb;
 perform rpg_private.fields(v,array['schema','kind','campaign_id','provider','model','status','composition','basis','prompt','art','resultAssetId']);
 perform rpg_private.assert(v->'schema'='1'::jsonb and v->>'kind'='frame' and v->>'campaign_id'=cid::text and v->>'provider'='MOCK' and v->>'model'='local-placeholder-v0');
 perform rpg_private.assert(v->>'status' in ('queued','completed','failed','cancelled') and v->>'composition' in ('wide','portrait','location','item') and v->>'art' in ('landscape','portrait','object','abstract'));
 perform rpg_private.assert(jsonb_typeof(v->'prompt')='string' and length(v->>'prompt')<=30000);
 perform rpg_private.assert(case when v->>'status'='completed' then jsonb_typeof(v->'resultAssetId')='string' and (v->>'resultAssetId')::uuid is not null else v->'resultAssetId'='null'::jsonb end);
 basis:=v->'basis'; scene:=basis->'scene';
 perform rpg_private.fields(basis,array['timeline','scene','references']);
 perform rpg_private.fields(basis->'timeline',array['timelineId','epoch']);
 perform rpg_private.assert(jsonb_typeof(basis#>'{timeline,timelineId}')='string' and (basis#>>'{timeline,timelineId}')::uuid is not null and jsonb_typeof(basis#>'{timeline,epoch}')='number' and (basis#>>'{timeline,epoch}')::numeric>=1 and mod((basis#>>'{timeline,epoch}')::numeric,1)=0);
 perform rpg_private.fields(scene,array['id','revision','title','body']);
 perform rpg_private.assert(jsonb_typeof(scene->'id')='string' and (scene->>'id')::uuid is not null and jsonb_typeof(scene->'revision')='number' and (scene->>'revision')::numeric>=0 and mod((scene->>'revision')::numeric,1)=0 and jsonb_typeof(scene->'title')='string' and length(scene->>'title')<=200 and jsonb_typeof(scene->'body')='string' and length(scene->>'body')<=6000);
 perform rpg_private.assert(jsonb_typeof(basis->'references')='array' and jsonb_array_length(basis->'references')<=8);
 for item in select value from jsonb_array_elements(basis->'references') loop
  perform rpg_private.fields(item,array['documentId','versionId']);
  perform rpg_private.assert(jsonb_typeof(item->'documentId')='string' and (item->>'documentId')::uuid is not null and jsonb_typeof(item->'versionId')='string' and (item->>'versionId')::uuid is not null);
 end loop;
 perform rpg_private.assert((select count(*)=count(distinct value->>'documentId') from jsonb_array_elements(basis->'references')));
 return v;
end $$;

-- Called under the campaign mutation lock. Queue/completion must still use the
-- exact current public scene and approved reference/source versions. Cleanup
-- may close a stale job, but cannot change its frozen input or perform a result.
create function rpg_private.frame_sources_current(cid uuid,v jsonb) returns void
language plpgsql set search_path='' as $$
declare scene public.rpg_scenes%rowtype; ref jsonb; document public.rpg_documents%rowtype; r jsonb; expected_prompt text; source_revision integer;
begin
 if v#>'{basis,timeline}' is distinct from rpg_private.timeline_fence(cid) then raise exception 'rpg_conflict'; end if;
 select * into scene from public.rpg_scenes where campaign_id=cid and id=(v#>>'{basis,scene,id}')::uuid;
 if not found or scene.role<>'narration' or scene.revision<>(v#>>'{basis,scene,revision}')::integer or scene.title is distinct from v#>>'{basis,scene,title}' or scene.body is distinct from v#>>'{basis,scene,body}' then raise exception 'rpg_conflict'; end if;
 expected_prompt:='MOCK preview only. Render no new events or hidden details.'||E'\n\nComposition: '||(v->>'composition')||E'.\n\nPublic scene: '||scene.title||E'\n'||scene.body;
 for ref in select value from jsonb_array_elements(v#>'{basis,references}') loop
  select * into document from public.rpg_documents where campaign_id=cid and id=(ref->>'documentId')::uuid;
  if not found or document.status<>'reference' or document.purpose<>'standard' or document.current_version_id<>(ref->>'versionId')::uuid then raise exception 'rpg_conflict'; end if;
  perform rpg_private.assert(left(document.body,length(E'RPG_VISUAL_FRAME_V0\n'))=E'RPG_VISUAL_FRAME_V0\n');
  r:=substring(document.body from length(E'RPG_VISUAL_FRAME_V0\n')+1)::jsonb;
  perform rpg_private.fields(r,array['schema','kind','campaign_id','subject','sourceRevision','label','appearance','outfit','guidance','art','imageAssetId','imageAssetRevision','approval']);
  perform rpg_private.fields(r->'subject',array['kind','id']);
  perform rpg_private.assert(r->'schema'='1'::jsonb and r->>'kind'='reference' and r->>'campaign_id'=cid::text and r->>'approval'='approved' and jsonb_typeof(r->'sourceRevision')='number' and (r->>'sourceRevision')::numeric>=0 and mod((r->>'sourceRevision')::numeric,1)=0);
  source_revision:=null;
  if r#>>'{subject,kind}'='entity' then select revision into source_revision from public.rpg_entities where campaign_id=cid and id=(r#>>'{subject,id}')::uuid;
  elsif r#>>'{subject,kind}'='location' then select revision into source_revision from public.rpg_locations where campaign_id=cid and id=(r#>>'{subject,id}')::uuid;
  elsif r#>>'{subject,kind}'='item' then select revision into source_revision from public.rpg_items where campaign_id=cid and id=(r#>>'{subject,id}')::uuid;
  elsif r#>>'{subject,kind}'='style' and r#>>'{subject,id}'=cid::text then source_revision:=0;
  end if;
  if source_revision is null or source_revision<>(r->>'sourceRevision')::integer then raise exception 'rpg_conflict'; end if;
  perform rpg_private.assert(jsonb_typeof(r->'label')='string' and length(btrim(r->>'label')) between 1 and 200 and jsonb_typeof(r->'appearance')='string' and length(r->>'appearance')<=1600 and jsonb_typeof(r->'outfit')='string' and length(r->>'outfit')<=800 and jsonb_typeof(r->'guidance')='string' and length(r->>'guidance')<=1200 and r->>'art' in ('landscape','portrait','object','abstract'));
  if r->'imageAssetId'='null'::jsonb then
   perform rpg_private.assert(r->'imageAssetRevision'='null'::jsonb);
  elsif not exists(select 1 from public.rpg_assets where campaign_id=cid and id=(r->>'imageAssetId')::uuid and revision=(r->>'imageAssetRevision')::integer and kind='image') then raise exception 'rpg_conflict';
  end if;
  expected_prompt:=expected_prompt||E'\n\nOwner-approved public visual reference: '||(r->>'label')||E'\nAppearance: '||(r->>'appearance')||E'\nOutfit/variant: '||(r->>'outfit')||E'\nVisual guidance: '||(r->>'guidance');
 end loop;
 perform rpg_private.assert(length(expected_prompt)<=30000 and v->>'prompt'=expected_prompt and v->>'art'=case v->>'composition' when 'portrait' then 'portrait' when 'item' then 'object' else 'landscape' end);
end $$;

create function public.rpg_frame_lifecycle(p_owner_id uuid,p_mutation jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare cid uuid; rid uuid; payload jsonb; v jsonb; previous jsonb; old public.rpg_documents%rowtype; receipt jsonb; result jsonb; prior_subject text:=current_setting('request.jwt.claim.sub',true); expected_asset jsonb; queued_body text; queued_value jsonb;
begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id) then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform rpg_private.fields(p_mutation,array['requestId','operation','campaignId','expectedRevision','payload','timeline','correctionScope']);
 perform rpg_private.assert(p_mutation->>'operation'='document.save' and p_mutation->>'correctionScope'='campaign' and length(p_mutation::text)<=1000000);
 cid:=(p_mutation->>'campaignId')::uuid; rid:=(p_mutation->>'requestId')::uuid; payload:=p_mutation->'payload';
 perform rpg_private.assert(cid is not null and rid is not null and jsonb_typeof(p_mutation->'expectedRevision')='number' and (p_mutation->>'expectedRevision')::numeric>=0 and mod((p_mutation->>'expectedRevision')::numeric,1)=0);
 perform rpg_private.fields(p_mutation->'timeline',array['timelineId','epoch']);
 perform 1 from public.rpg_campaigns where id=cid for update; if not found then raise exception 'rpg_not_found'; end if;
 perform rpg_private.timeline_assert(cid,p_mutation->'timeline');
 -- Exact completed receipts win before mutable scene/reference preflight.
 receipt:=public.rpg_mutation_receipt(p_owner_id,p_mutation);
 if receipt<>'null'::jsonb then return receipt; end if;
 perform rpg_private.fields(payload,array['title','status','body'],array['id']);
 perform rpg_private.assert(payload->>'status'='reference' and jsonb_typeof(payload->'body')='string');
 v:=rpg_private.frame_value(payload->>'body',cid);
 if payload ? 'id' then
  select * into old from public.rpg_documents where campaign_id=cid and id=(payload->>'id')::uuid;
  if not found then raise exception 'rpg_not_found'; end if;
  if old.status<>'reference' or old.purpose<>'standard' or exists(select 1 from public.rpg_dm_guides where campaign_id=cid and document_id=old.id) then raise exception 'rpg_validation'; end if;
  if old.revision<>(p_mutation->>'expectedRevision')::integer then raise exception 'rpg_conflict'; end if;
  previous:=rpg_private.frame_value(old.body,cid);
  perform rpg_private.assert(previous->>'status'='queued' and v->>'status' in ('completed','failed','cancelled') and (previous-'status'-'resultAssetId')=(v-'status'-'resultAssetId'));
 else
  perform rpg_private.assert(p_mutation->'expectedRevision'='0'::jsonb and v->>'status'='queued');
  for queued_body in select d.body from public.rpg_documents d where d.campaign_id=cid and d.status='reference' and left(d.body,length(E'RPG_VISUAL_FRAME_V0\n'))=E'RPG_VISUAL_FRAME_V0\n' loop
   begin
    queued_value:=rpg_private.frame_value(queued_body,cid);
   exception when data_exception then queued_value:=null;
    when raise_exception then
     if sqlerrm='rpg_validation' then queued_value:=null; else raise; end if;
   end;
   if queued_value->>'status'='queued' and queued_value->'basis'=v->'basis' and queued_value->>'prompt'=v->>'prompt' then raise exception 'rpg_conflict'; end if;
  end loop;
 end if;
 if v->>'status' in ('queued','completed') then perform rpg_private.frame_sources_current(cid,v); end if;
 if v->>'status'='completed' then
  perform rpg_private.assert(rid=(v->>'resultAssetId')::uuid);
  expected_asset:=jsonb_build_object('campaign_id',cid,'job_document_id',old.id,'job_version_id',old.current_version_id,'scene_id',previous#>'{basis,scene,id}','scene_revision',previous#>'{basis,scene,revision}','provider','MOCK','model','local-placeholder-v0','art',previous->'art');
  if not exists(select 1 from public.rpg_assets a where a.campaign_id=cid and a.id=(v->>'resultAssetId')::uuid and a.kind='image' and a.storage_path is null and left(a.description,length(E'RPG_VISUAL_FRAME_ASSET_V0\n'))=E'RPG_VISUAL_FRAME_ASSET_V0\n' and substring(a.description from length(E'RPG_VISUAL_FRAME_ASSET_V0\n')+1)::jsonb=expected_asset) then raise exception 'rpg_validation'; end if;
 end if;
 -- Service-only owner delegation; no JWT or client flag can enable this mode.
 -- The existing private base writer still checks the authoritative owner.
 perform set_config('request.jwt.claim.sub',p_owner_id::text,true);
 result:=rpg_private.apply_fenced_mutation(rid,'document.save',cid,(p_mutation->>'expectedRevision')::integer,payload,p_mutation->'timeline','campaign',true);
 perform set_config('request.jwt.claim.sub',coalesce(prior_subject,''),true);
 return result;
end $$;

revoke all on function rpg_private.apply_fenced_mutation(uuid,text,uuid,integer,jsonb,jsonb,text,boolean) from public,anon,authenticated,service_role;
revoke all on function rpg_private.frame_value(text,uuid) from public,anon,authenticated,service_role;
revoke all on function rpg_private.frame_sources_current(uuid,jsonb) from public,anon,authenticated,service_role;
revoke all on function public.rpg_frame_lifecycle(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.rpg_frame_lifecycle(uuid,jsonb) to service_role;
commit;
