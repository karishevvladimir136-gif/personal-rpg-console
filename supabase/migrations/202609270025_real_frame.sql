-- Real FRAME presentation jobs reuse Documents, Assets and fenced receipts.
-- Operational charge reservations are not gameplay currency or world state.
begin;
create table rpg_private.media_budgets (
 id uuid primary key, owner_id uuid not null references auth.users(id),
 model text not null check(model in ('gpt-image-2.5-sunburst-2026-09-08','gpt-image-2.5-flare-2026-09-08')),
 limit_usd_micros bigint not null check(limit_usd_micros between 400000 and 20000000),
 maximum_calls integer not null check(maximum_calls between 1 and 50),
 reserved_usd_micros bigint not null default 0 check(reserved_usd_micros>=0 and reserved_usd_micros<=limit_usd_micros),
 created_at timestamptz not null default now()
);
create table rpg_private.media_reservations (
 request_id uuid primary key, budget_id uuid not null references rpg_private.media_budgets(id),
 owner_id uuid not null references auth.users(id), campaign_id uuid not null references public.rpg_campaigns(id),
 job_id uuid not null, reservation_usd_micros bigint not null check(reservation_usd_micros=400000),
 created_at timestamptz not null default now(), unique(campaign_id,job_id)
);
alter table rpg_private.media_budgets enable row level security;
alter table rpg_private.media_reservations enable row level security;
create trigger immutable_media_reservation before update or delete on rpg_private.media_reservations for each row execute function rpg_private.timeline_immutable();

-- Explicit server-side budget provisioning, never a browser-controlled grant.
create function public.rpg_media_budget_prepare(p_owner_id uuid,p_budget_id uuid,p_model text,p_limit_usd_micros bigint,p_maximum_calls integer) returns void
language plpgsql security definer set search_path='' as $$
declare b rpg_private.media_budgets%rowtype;
begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id) then raise exception 'rpg_forbidden'; end if;
 perform rpg_private.assert(p_budget_id is not null and p_model in ('gpt-image-2.5-sunburst-2026-09-08','gpt-image-2.5-flare-2026-09-08') and p_limit_usd_micros between 400000 and 20000000 and p_maximum_calls between 1 and 50);
 perform pg_advisory_xact_lock(hashtextextended(p_budget_id::text,0));
 select * into b from rpg_private.media_budgets where id=p_budget_id;
 if found then
  if b.owner_id<>p_owner_id or b.model<>p_model or b.limit_usd_micros<>p_limit_usd_micros or b.maximum_calls<>p_maximum_calls then raise exception 'rpg_conflict'; end if;
  return;
 end if;
 insert into rpg_private.media_budgets(id,owner_id,model,limit_usd_micros,maximum_calls) values(p_budget_id,p_owner_id,p_model,p_limit_usd_micros,p_maximum_calls);
end $$;
create function public.rpg_frame_basis(p_owner_id uuid,p_campaign_id uuid,p_timeline jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id) then raise exception 'rpg_forbidden'; end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id; if not found then raise exception 'rpg_not_found'; end if;
 perform rpg_private.timeline_assert(p_campaign_id,p_timeline);
 return (select jsonb_build_object('expectedHeadId',t.head_manifest_id,'canonGeneration',c.canon_generation) from rpg_private.timeline_campaigns c join rpg_private.timelines t on t.campaign_id=c.campaign_id and t.id=c.active_timeline_id where c.campaign_id=p_campaign_id);
end $$;

create function rpg_private.real_frame_value(body text,cid uuid) returns jsonb language plpgsql set search_path='' as $$
declare v jsonb; b jsonb; r jsonb; k text; prefix text:=E'RPG_VISUAL_FRAME_V0\n';
begin
 perform rpg_private.assert(length(body)<=60000 and left(body,length(prefix))=prefix);
 v:=substring(body from length(prefix)+1)::jsonb;
 perform rpg_private.fields(v,array['schema','kind','campaign_id','provider','model','status','composition','art','basis','prompt','parameters','retryOf','dispatch','resultAssetId','failure']);
 perform rpg_private.assert(v->'schema'='2' and v->>'kind'='frame' and v->>'campaign_id'=cid::text and v->>'provider'='OpenAI' and v->>'model' in ('gpt-image-2.5-sunburst-2026-09-08','gpt-image-2.5-flare-2026-09-08'));
 perform rpg_private.assert(v->>'status' in ('queued','generating','completed','failed','cancelled','uncertain') and v->>'composition' in ('wide','portrait','location','item') and v->>'art' in ('landscape','portrait','object','abstract') and jsonb_typeof(v->'prompt')='string' and length(btrim(v->>'prompt')) between 1 and 30000 and octet_length(v->>'prompt')<=60000);
 perform rpg_private.fields(v->'parameters',array['size','quality','outputFormat','n']);
 perform rpg_private.assert(v#>>'{parameters,size}' in ('1536x1024','1024x1024','1024x1536') and v#>>'{parameters,quality}' in ('low','medium','high') and v#>>'{parameters,outputFormat}'='png' and v#>'{parameters,n}'='1');
 perform rpg_private.assert(v->'retryOf'='null' or (jsonb_typeof(v->'retryOf')='string' and (v->>'retryOf')::uuid is not null));
 b:=v->'basis'; perform rpg_private.fields(b,array['timeline','expectedHeadId','canonGeneration','publicStateRevision','scene','references']);
 perform rpg_private.fields(b->'timeline',array['timelineId','epoch']);
 perform rpg_private.assert((b#>>'{timeline,timelineId}')::uuid is not null and jsonb_typeof(b#>'{timeline,epoch}')='number' and (b#>>'{timeline,epoch}')::numeric>=1 and mod((b#>>'{timeline,epoch}')::numeric,1)=0);
 perform rpg_private.assert(b->'expectedHeadId'='null' or (jsonb_typeof(b->'expectedHeadId')='string' and (b->>'expectedHeadId')::uuid is not null));
 foreach k in array array['canonGeneration','publicStateRevision'] loop perform rpg_private.assert(jsonb_typeof(b->k)='number' and (b->>k)::numeric>=0 and mod((b->>k)::numeric,1)=0); end loop;
 perform rpg_private.fields(b->'scene',array['id','revision','title','body']);
 perform rpg_private.assert((b#>>'{scene,id}')::uuid is not null and jsonb_typeof(b#>'{scene,revision}')='number' and (b#>>'{scene,revision}')::numeric>=0 and mod((b#>>'{scene,revision}')::numeric,1)=0 and jsonb_typeof(b#>'{scene,title}')='string' and length(b#>>'{scene,title}')<=200 and jsonb_typeof(b#>'{scene,body}')='string' and length(btrim(b#>>'{scene,body}')) between 1 and 6000);
 perform rpg_private.assert(jsonb_typeof(b->'references')='array' and jsonb_array_length(b->'references')<=8 and (select count(*)=count(distinct x->>'documentId') from jsonb_array_elements(b->'references') x));
 for r in select value from jsonb_array_elements(b->'references') loop
  perform rpg_private.fields(r,array['documentId','versionId','subject','sourceRevision','imageAssetId','imageAssetRevision']); perform rpg_private.fields(r->'subject',array['kind','id']);
  perform rpg_private.assert((r->>'documentId')::uuid is not null and (r->>'versionId')::uuid is not null and (r#>>'{subject,id}')::uuid is not null and r#>>'{subject,kind}' in ('entity','location','item','style') and jsonb_typeof(r->'sourceRevision')='number' and (r->>'sourceRevision')::numeric>=0 and mod((r->>'sourceRevision')::numeric,1)=0);
  -- Pixel-reference billing is not yet bounded; reject rather than omit it.
  perform rpg_private.assert(r->'imageAssetId'='null' and r->'imageAssetRevision'='null');
 end loop;
 if v->'dispatch'<>'null' then
  perform rpg_private.fields(v->'dispatch',array['requestId','reservationUsdMicros']);
  perform rpg_private.assert((v#>>'{dispatch,requestId}')::uuid is not null and v#>'{dispatch,reservationUsdMicros}'='400000');
 end if;
 perform rpg_private.assert(case when v->>'status'='queued' then v->'dispatch'='null' and v->'failure'='null' and v->'resultAssetId'='null' when v->>'status'='cancelled' then v->'failure'='null' and v->'resultAssetId'='null' when v->>'status'='completed' then v->'dispatch'<>'null' and (v->>'resultAssetId')::uuid is not null and v->'failure'='null' when v->>'status'='uncertain' then v->'dispatch'<>'null' and v->'resultAssetId'='null' and v->>'failure'='uncertain' else v->'dispatch'<>'null' and v->'resultAssetId'='null' and case when v->>'status'='generating' then v->'failure'='null' else v->>'failure' in ('provider','stale','storage') end end);
 return v;
end $$;

create function rpg_private.real_frame_sources(cid uuid,v jsonb) returns void language plpgsql set search_path='' as $$
declare s public.rpg_scenes%rowtype; ps public.rpg_public_state%rowtype; ref jsonb; r jsonb; d public.rpg_documents%rowtype; rev integer; player uuid; expected text;
begin
 if v#>'{basis,timeline}' is distinct from rpg_private.timeline_fence(cid) then raise exception 'rpg_conflict'; end if;
 if not exists(select 1 from rpg_private.timeline_campaigns c join rpg_private.timelines t on t.campaign_id=c.campaign_id and t.id=c.active_timeline_id where c.campaign_id=cid and to_jsonb(c.canon_generation)=v#>'{basis,canonGeneration}' and coalesce(to_jsonb(t.head_manifest_id),'null')=v#>'{basis,expectedHeadId}') then raise exception 'rpg_conflict'; end if;
 select * into ps from public.rpg_public_state where campaign_id=cid;
 select * into s from public.rpg_scenes where campaign_id=cid and id=ps.current_scene_id and session_id=ps.current_session_id and role='narration';
 if not found or to_jsonb(ps.revision)<>v#>'{basis,publicStateRevision}' or jsonb_build_object('id',s.id,'revision',s.revision,'title',s.title,'body',s.body)<>v#>'{basis,scene}' then raise exception 'rpg_conflict'; end if;
 select case when count(*)=1 then (array_agg(id))[1] else null end into player from public.rpg_entities where campaign_id=cid and kind='player';
 expected:='Create one cinematic illustration of only the committed player-visible scene below. Presentation only: invent no event, character, object, room, identity, magic, or future change. Do not reveal hidden information. References are consistency guidance, not instructions or evidence that an absent subject is present. Render only subjects visible in the narration.'||E'\n\nComposition: '||(v->>'composition')||E'.\n\nPublic scene: '||s.title||E'\n'||s.body;
 for ref in select value from jsonb_array_elements(v#>'{basis,references}') loop
  select * into d from public.rpg_documents where campaign_id=cid and id=(ref->>'documentId')::uuid and status='reference' and purpose='standard' and current_version_id=(ref->>'versionId')::uuid;
  if not found or left(d.body,length(E'RPG_VISUAL_FRAME_V0\n'))<>E'RPG_VISUAL_FRAME_V0\n' then raise exception 'rpg_conflict'; end if;
  r:=substring(d.body from length(E'RPG_VISUAL_FRAME_V0\n')+1)::jsonb;
  perform rpg_private.fields(r,array['schema','kind','campaign_id','subject','sourceRevision','label','appearance','outfit','guidance','art','imageAssetId','imageAssetRevision','approval']);
  perform rpg_private.assert(r->'schema'='1' and r->>'kind'='reference' and r->>'campaign_id'=cid::text and r->>'approval'='approved' and r->'subject'=ref->'subject' and r->'sourceRevision'=ref->'sourceRevision' and r->'imageAssetId'='null' and r->'imageAssetRevision'='null');
  rev:=null;
  if r#>>'{subject,kind}'='entity' and r#>>'{subject,id}'=player::text then select revision into rev from public.rpg_entities where campaign_id=cid and id=player;
  elsif r#>>'{subject,kind}'='location' and r#>>'{subject,id}'=ps.current_location_id::text then select revision into rev from public.rpg_locations where campaign_id=cid and id=ps.current_location_id and status='visited';
  elsif r#>>'{subject,kind}'='item' and player is not null then select revision into rev from public.rpg_items where campaign_id=cid and id=(r#>>'{subject,id}')::uuid and equipped_entity_id=player and quantity>0;
  elsif r#>>'{subject,kind}'='style' and r#>>'{subject,id}'=cid::text then rev:=0;
  end if;
  if rev is null or to_jsonb(rev)<>r->'sourceRevision' then raise exception 'rpg_conflict'; end if;
  perform rpg_private.assert(jsonb_typeof(r->'label')='string' and length(btrim(r->>'label')) between 1 and 200 and jsonb_typeof(r->'appearance')='string' and length(r->>'appearance')<=1600 and jsonb_typeof(r->'outfit')='string' and length(r->>'outfit')<=800 and jsonb_typeof(r->'guidance')='string' and length(r->>'guidance')<=1200 and r->>'art' in ('landscape','portrait','object','abstract'));
  expected:=expected||E'\n\nOwner-approved public visual reference: '||(r->>'label')||E'\nAppearance: '||(r->>'appearance')||E'\nOutfit/variant: '||(r->>'outfit')||E'\nVisual guidance: '||(r->>'guidance');
 end loop;
 perform rpg_private.assert(v->>'prompt'=expected and v->>'art'=case v->>'composition' when 'portrait' then 'portrait' when 'item' then 'object' else 'landscape' end);
end $$;

-- The receipt check precedes mutable preflight, but still enforces exact owner,
-- Campaign and timeline. A completed replay cannot redispatch or reattach.
create function rpg_private.real_frame_receipt(uid uuid,m jsonb) returns jsonb language plpgsql set search_path='' as $$
declare cid uuid;
begin
 if uid is null or not exists(select 1 from rpg_private.owner_registry where user_id=uid) then raise exception 'rpg_forbidden'; end if;
 perform rpg_private.fields(m,array['requestId','operation','campaignId','expectedRevision','payload','timeline','correctionScope']);
 perform rpg_private.assert(m->>'operation'='document.save' and m->>'correctionScope'='campaign' and octet_length(m::text)<=1000000 and (m->>'requestId')::uuid is not null and jsonb_typeof(m->'expectedRevision')='number' and (m->>'expectedRevision')::numeric between 0 and 2147483646 and mod((m->>'expectedRevision')::numeric,1)=0);
 cid:=(m->>'campaignId')::uuid;
 perform 1 from public.rpg_campaigns where id=cid for update; if not found then raise exception 'rpg_not_found'; end if;
 perform rpg_private.timeline_assert(cid,m->'timeline');
 return public.rpg_mutation_receipt(uid,m);
end $$;
create function rpg_private.real_frame_mutation(m jsonb) returns jsonb language plpgsql set search_path='' as $$
declare cid uuid:=(m->>'campaignId')::uuid; p jsonb:=m->'payload'; v jsonb; old public.rpg_documents%rowtype; previous jsonb;
begin
 perform rpg_private.fields(p,array['title','status','body'],array['id']);
 perform rpg_private.assert(p->>'status'='reference' and jsonb_typeof(p->'body')='string');
 v:=rpg_private.real_frame_value(p->>'body',cid);
 perform rpg_private.assert(p->>'title'=left('FRAME: '||(v#>>'{basis,scene,title}'),200));
 if p ? 'id' then
  select * into old from public.rpg_documents where campaign_id=cid and id=(p->>'id')::uuid;
  if not found then raise exception 'rpg_not_found'; end if;
  if old.status<>'reference' or old.purpose<>'standard' or exists(select 1 from public.rpg_dm_guides where campaign_id=cid and document_id=old.id) then raise exception 'rpg_validation'; end if;
  if old.revision<>(m->>'expectedRevision')::integer then raise exception 'rpg_conflict'; end if;
  previous:=rpg_private.real_frame_value(old.body,cid);
 else perform rpg_private.assert(m->'expectedRevision'='0'); end if;
 return jsonb_build_object('value',v,'previous',previous,'documentId',old.id,'versionId',old.current_version_id);
end $$;
create function rpg_private.real_frame_apply(uid uuid,m jsonb) returns jsonb language plpgsql set search_path='' as $$
declare prior text:=current_setting('request.jwt.claim.sub',true); result jsonb; runtime_before rpg_private.runtime_state%rowtype;
begin
 select * into runtime_before from rpg_private.runtime_state where campaign_id=(m->>'campaignId')::uuid;
 perform set_config('request.jwt.claim.sub',uid::text,true);
 result:=rpg_private.apply_fenced_mutation((m->>'requestId')::uuid,'document.save',(m->>'campaignId')::uuid,(m->>'expectedRevision')::integer,m->'payload',m->'timeline','campaign',true);
 -- The generic Document trigger fences factual edits. This strictly validated
 -- service-only presentation operation has no gameplay inputs to invalidate.
 -- The Campaign lock serializes the writer; no client flag or prefix bypass.
 update rpg_private.runtime_state set revision=runtime_before.revision,updated_at=runtime_before.updated_at where campaign_id=runtime_before.campaign_id;
 perform set_config('request.jwt.claim.sub',coalesce(prior,''),true); return result;
end $$;
create function public.rpg_real_frame_lifecycle(p_owner_id uuid,p_mutation jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare receipt jsonb; data jsonb; v jsonb; old jsonb; cid uuid; body text; existing jsonb; retry public.rpg_documents%rowtype;
begin
 receipt:=rpg_private.real_frame_receipt(p_owner_id,p_mutation); if receipt<>'null' then return receipt; end if;
 data:=rpg_private.real_frame_mutation(p_mutation); v:=data->'value'; old:=data->'previous'; cid:=(p_mutation->>'campaignId')::uuid;
 if old='null' then
  perform rpg_private.assert(v->>'status'='queued'); perform rpg_private.real_frame_sources(cid,v);
  if v->'retryOf'<>'null' then
   select * into retry from public.rpg_documents d where d.campaign_id=cid and d.id=(v->>'retryOf')::uuid and d.status='reference' and d.purpose='standard';
   if not found then raise exception 'rpg_conflict'; end if;
   existing:=rpg_private.real_frame_value(retry.body,cid); perform rpg_private.assert(existing->>'status' in ('completed','cancelled','failed','uncertain'));
  end if;
  for body in select d.body from public.rpg_documents d where d.campaign_id=cid and d.status='reference' and left(d.body,length(E'RPG_VISUAL_FRAME_V0\n'))=E'RPG_VISUAL_FRAME_V0\n' loop
   begin existing:=rpg_private.real_frame_value(body,cid); exception when data_exception then existing:=null; when raise_exception then if sqlerrm='rpg_validation' then existing:=null; else raise; end if; end;
   if existing->>'status' in ('queued','generating','uncertain') and existing->'basis'=v->'basis' and existing->'model'=v->'model' and existing->'parameters'=v->'parameters' then raise exception 'rpg_conflict'; end if;
  end loop;
 else
  perform rpg_private.assert(old->>'status' in ('queued','generating','uncertain') and v->>'status' in ('cancelled','failed','uncertain') and (old-'status'-'failure')=(v-'status'-'failure') and case when v->>'status'='cancelled' then true else old->>'status'='generating' end);
 end if;
 return rpg_private.real_frame_apply(p_owner_id,p_mutation);
end $$;
create function public.rpg_real_frame_claim(p_owner_id uuid,p_mutation jsonb,p_budget_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare receipt jsonb; data jsonb; v jsonb; old jsonb; b rpg_private.media_budgets%rowtype; result jsonb; cid uuid;
begin
 receipt:=rpg_private.real_frame_receipt(p_owner_id,p_mutation);
 if receipt<>'null' then
  if not exists(select 1 from rpg_private.media_reservations r join rpg_private.media_budgets budget_row on budget_row.id=r.budget_id where r.request_id=(p_mutation->>'requestId')::uuid and r.budget_id=p_budget_id and r.owner_id=p_owner_id and r.campaign_id=(p_mutation->>'campaignId')::uuid and r.job_id=(p_mutation#>>'{payload,id}')::uuid and budget_row.owner_id=p_owner_id) then raise exception 'rpg_conflict'; end if;
  return jsonb_build_object('result',receipt,'claimed',false);
 end if;
 data:=rpg_private.real_frame_mutation(p_mutation); v:=data->'value'; old:=data->'previous'; cid:=(p_mutation->>'campaignId')::uuid;
 perform rpg_private.assert(old->>'status'='queued' and v->>'status'='generating' and (old-'status'-'dispatch')=(v-'status'-'dispatch') and p_mutation->'requestId'=v#>'{dispatch,requestId}');
 perform rpg_private.real_frame_sources(cid,v);
 select * into b from rpg_private.media_budgets where id=p_budget_id and owner_id=p_owner_id for update;
 if not found then raise exception 'rpg_not_found'; end if;
 if b.model<>v->>'model' or b.reserved_usd_micros+400000>b.limit_usd_micros or (select count(*) from rpg_private.media_reservations where budget_id=b.id)>=b.maximum_calls then raise exception 'rpg_conflict'; end if;
 insert into rpg_private.media_reservations(request_id,budget_id,owner_id,campaign_id,job_id,reservation_usd_micros) values((p_mutation->>'requestId')::uuid,b.id,p_owner_id,cid,(data->>'documentId')::uuid,400000);
 update rpg_private.media_budgets set reserved_usd_micros=reserved_usd_micros+400000 where id=b.id;
 result:=rpg_private.real_frame_apply(p_owner_id,p_mutation);
 return jsonb_build_object('result',result,'claimed',true);
end $$;
create function public.rpg_real_frame_complete(p_owner_id uuid,p_mutation jsonb,p_asset jsonb,p_output jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare receipt jsonb; data jsonb; v jsonb; old jsonb; cid uuid; jid uuid; provenance jsonb; assetpayload jsonb; prior text:=current_setting('request.jwt.claim.sub',true); result jsonb; key text;
begin
 receipt:=rpg_private.real_frame_receipt(p_owner_id,p_mutation); if receipt<>'null' then return receipt; end if;
 data:=rpg_private.real_frame_mutation(p_mutation); v:=data->'value'; old:=data->'previous'; cid:=(p_mutation->>'campaignId')::uuid; jid:=(data->>'documentId')::uuid;
 perform rpg_private.assert(old->>'status'='generating' and v->>'status'='completed' and (old-'status'-'resultAssetId')=(v-'status'-'resultAssetId') and p_mutation->>'requestId'=jid::text and v->>'resultAssetId'=jid::text);
 perform rpg_private.assert(exists(select 1 from rpg_private.media_reservations r join rpg_private.media_budgets b on b.id=r.budget_id where r.request_id=(old#>>'{dispatch,requestId}')::uuid and r.owner_id=p_owner_id and r.campaign_id=cid and r.job_id=jid and r.reservation_usd_micros=400000 and b.model=old->>'model'));
 perform rpg_private.real_frame_sources(cid,v);
 perform rpg_private.fields(p_output,array['storagePath','sha256','bytes','contentType','usage','providerRequestId']);
 perform rpg_private.assert(p_output->>'storagePath'=cid::text||'/frames/'||jid::text||'/output.png' and p_output->>'sha256' ~ '^[a-f0-9]{64}$' and jsonb_typeof(p_output->'bytes')='number' and (p_output->>'bytes')::numeric between 1 and 12000000 and mod((p_output->>'bytes')::numeric,1)=0 and p_output->>'contentType'='image/png' and (p_output->'providerRequestId'='null' or (jsonb_typeof(p_output->'providerRequestId')='string' and p_output->>'providerRequestId' ~ '^[a-zA-Z0-9_-]{1,200}$')));
 if p_output->'usage'<>'null' then
  perform rpg_private.fields(p_output->'usage',array['textInputTokens','imageInputTokens','outputTokens']);
  foreach key in array array['textInputTokens','imageInputTokens','outputTokens'] loop perform rpg_private.assert(jsonb_typeof(p_output#>array['usage',key])='number' and (p_output#>>array['usage',key])::numeric>=0 and mod((p_output#>>array['usage',key])::numeric,1)=0); end loop;
  perform rpg_private.assert(p_output#>'{usage,imageInputTokens}'='0' and (p_output#>>'{usage,textInputTokens}')::numeric*5+(p_output#>>'{usage,outputTokens}')::numeric*30<=400000);
 end if;
 provenance:=jsonb_build_object('campaign_id',cid,'job_document_id',jid,'job_version_id',data->'versionId','scene_id',v#>'{basis,scene,id}','scene_revision',v#>'{basis,scene,revision}','timeline',v#>'{basis,timeline}','provider','OpenAI','model',v->'model','dispatchRequestId',v#>'{dispatch,requestId}','output',p_output);
 assetpayload:=jsonb_build_object('id',jid,'title',left('FRAME: '||(v#>>'{basis,scene,title}'),200),'kind','image','storage_path',p_output->'storagePath','description',E'RPG_REAL_FRAME_ASSET_V1\n'||provenance::text);
 perform rpg_private.fields(p_asset,array['requestId','operation','campaignId','expectedRevision','payload','timeline']);
 perform rpg_private.assert(p_asset->'requestId'=data->'versionId' and p_asset->>'operation'='asset.save' and p_asset->>'campaignId'=cid::text and p_asset->'expectedRevision'='0' and p_asset->'timeline'=v#>'{basis,timeline}' and p_asset#>>'{payload,description}' like E'RPG_REAL_FRAME_ASSET_V1\n%' and substring(p_asset#>>'{payload,description}' from length(E'RPG_REAL_FRAME_ASSET_V1\n')+1)::jsonb=provenance and ((p_asset->'payload')-'description')=(assetpayload-'description'));
 perform set_config('request.jwt.claim.sub',p_owner_id::text,true);
 -- The ordinary asset writer already accepts a new deterministic explicit ID.
 perform rpg_private.apply_fenced_mutation((p_asset->>'requestId')::uuid,'asset.save',cid,0,p_asset->'payload',p_asset->'timeline',null,false);
 result:=rpg_private.real_frame_apply(p_owner_id,p_mutation);
 perform set_config('request.jwt.claim.sub',coalesce(prior,''),true); return result;
end $$;

-- Supabase owns this private bucket; disposable SQL without Storage skips it.
do $$ begin
 if to_regclass('storage.buckets') is not null then
  execute 'insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values (''rpg-media'',''rpg-media'',false,12000000,array[''image/png'']) on conflict(id) do nothing';
  if exists(select 1 from storage.buckets where id='rpg-media' and public) then raise exception 'rpg_conflict'; end if;
 end if;
end $$;
revoke all on function rpg_private.real_frame_value(text,uuid),rpg_private.real_frame_sources(uuid,jsonb),rpg_private.real_frame_receipt(uuid,jsonb),rpg_private.real_frame_mutation(jsonb),rpg_private.real_frame_apply(uuid,jsonb) from public,anon,authenticated,service_role;
revoke all on function public.rpg_media_budget_prepare(uuid,uuid,text,bigint,integer),public.rpg_frame_basis(uuid,uuid,jsonb),public.rpg_real_frame_lifecycle(uuid,jsonb),public.rpg_real_frame_claim(uuid,jsonb,uuid),public.rpg_real_frame_complete(uuid,jsonb,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.rpg_media_budget_prepare(uuid,uuid,text,bigint,integer),public.rpg_frame_basis(uuid,uuid,jsonb),public.rpg_real_frame_lifecycle(uuid,jsonb),public.rpg_real_frame_claim(uuid,jsonb,uuid),public.rpg_real_frame_complete(uuid,jsonb,jsonb,jsonb) to service_role;
commit;
