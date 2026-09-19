-- Phase 3.5: immutable deduplicated versions + one active campaign projection.
-- No provider calls, database reset, imported campaign or discarded history.
begin;

create table rpg_private.timeline_campaigns (
 campaign_id uuid primary key references public.rpg_campaigns(id), active_timeline_id uuid not null,
 epoch integer not null default 1 check(epoch>0), revision integer not null default 1,
 canon_generation integer not null default 1,
 policy jsonb not null default '{"autosave":"session","retention":15,"loadMode":"unrestricted"}'
);
create table rpg_private.timelines (
 id uuid primary key, campaign_id uuid not null references public.rpg_campaigns(id), label text not null,
 parent_timeline_id uuid, fork_save_id uuid, head_manifest_id uuid, quick_save_id uuid,
 head_public jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(campaign_id,id), foreign key(campaign_id,parent_timeline_id) references rpg_private.timelines(campaign_id,id)
);
alter table rpg_private.timeline_campaigns add foreign key(campaign_id,active_timeline_id) references rpg_private.timelines(campaign_id,id) deferrable initially deferred;
create table rpg_private.timeline_versions (
 id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.rpg_campaigns(id),
 table_name text not null, row_key text not null, digest text not null, payload jsonb not null,
 origin_timeline_id uuid not null, created_at timestamptz not null default now(),
 unique(campaign_id,table_name,row_key,digest), unique(campaign_id,id),
 foreign key(campaign_id,origin_timeline_id) references rpg_private.timelines(campaign_id,id)
);
create table rpg_private.timeline_manifests (
 id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.rpg_campaigns(id),
 timeline_id uuid not null, refs jsonb not null, public_metadata jsonb not null,
 canon_generation integer not null, schema_version integer not null default 1,
 created_at timestamptz not null default now(), unique(campaign_id,id),
 foreign key(campaign_id,timeline_id) references rpg_private.timelines(campaign_id,id)
);
create table rpg_private.save_points (
 id uuid primary key default gen_random_uuid(), campaign_id uuid not null, timeline_id uuid not null,
 manifest_id uuid not null, kind text not null check(kind in ('manual','quick','autosave','safety')),
 name text not null check(length(btrim(name)) between 1 and 200), public_metadata jsonb not null,
 trigger_key text, created_at timestamptz not null default now(), unique(campaign_id,id),
 unique(campaign_id,timeline_id,trigger_key),
 foreign key(campaign_id,timeline_id) references rpg_private.timelines(campaign_id,id),
 foreign key(campaign_id,manifest_id) references rpg_private.timeline_manifests(campaign_id,id)
);
alter table rpg_private.timelines add foreign key(campaign_id,fork_save_id) references rpg_private.save_points(campaign_id,id);
alter table rpg_private.timelines add foreign key(campaign_id,quick_save_id) references rpg_private.save_points(campaign_id,id);
alter table rpg_private.timelines add foreign key(campaign_id,head_manifest_id) references rpg_private.timeline_manifests(campaign_id,id);
create table rpg_private.save_commands (
 id uuid primary key, campaign_id uuid not null references public.rpg_campaigns(id), owner_id uuid not null references auth.users(id),
 request jsonb not null, result jsonb not null, created_at timestamptz not null default now()
);
create table rpg_private.timeline_restore_guards (
 backend integer not null, transaction_id bigint not null, campaign_id uuid not null,
 primary key(backend,transaction_id,campaign_id)
);
create table rpg_private.session_identities (
 campaign_id uuid not null references public.rpg_campaigns(id), id uuid not null, primary key(campaign_id,id)
);
insert into rpg_private.session_identities select campaign_id,id from public.rpg_sessions;
create function rpg_private.timeline_session_identity() returns trigger language plpgsql set search_path='' as $$
begin insert into rpg_private.session_identities values(new.campaign_id,new.id) on conflict do nothing; return new; end $$;
create trigger timeline_session_identity after insert on public.rpg_sessions for each row execute function rpg_private.timeline_session_identity();
do $$ declare c record; begin
 for c in select conname from pg_constraint where conrelid='rpg_private.turns'::regclass and confrelid='public.rpg_sessions'::regclass and contype='f' loop
  execute format('alter table rpg_private.turns drop constraint %I',c.conname);
 end loop;
end $$;
alter table rpg_private.turns add foreign key(campaign_id,session_id) references rpg_private.session_identities(campaign_id,id) deferrable initially deferred;

create function rpg_private.timeline_immutable() returns trigger language plpgsql set search_path='' as $$
begin raise exception 'rpg_immutable_history' using errcode='42501'; end $$;
do $$ declare t text; begin
 foreach t in array array['timeline_versions','timeline_manifests','save_points','save_commands','session_identities'] loop
  execute format('create trigger immutable_timeline_record before update or delete on rpg_private.%I for each row execute function rpg_private.timeline_immutable()',t);
 end loop;
end $$;
create function rpg_private.timeline_initialize(cid uuid) returns void language plpgsql set search_path='' as $$
declare tid uuid:=gen_random_uuid(); begin
 if exists(select 1 from rpg_private.timeline_campaigns where campaign_id=cid) then return; end if;
 insert into rpg_private.timelines(id,campaign_id,label) values(tid,cid,'Main timeline');
 insert into rpg_private.timeline_campaigns(campaign_id,active_timeline_id) values(cid,tid);
end $$;
do $$ declare cid uuid; begin for cid in select id from public.rpg_campaigns loop perform rpg_private.timeline_initialize(cid); end loop; end $$;
create function rpg_private.timeline_new_campaign() returns trigger language plpgsql set search_path='' as $$
begin perform rpg_private.timeline_initialize(new.id); return new; end $$;
create trigger timeline_new_campaign after insert on public.rpg_campaigns for each row execute function rpg_private.timeline_new_campaign();
create function rpg_private.timeline_fence(cid uuid) returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('timelineId',active_timeline_id,'epoch',epoch) from rpg_private.timeline_campaigns where campaign_id=cid
$$;
create function rpg_private.timeline_assert(cid uuid, fence jsonb, writing boolean default true) returns void language plpgsql set search_path='' as $$
declare current_fence jsonb:=rpg_private.timeline_fence(cid); begin
 if current_fence is null then raise exception 'rpg_not_found'; end if;
 if fence is null then
  if writing and (current_fence->>'epoch')::integer<>1 then raise exception 'rpg_conflict'; end if;
 elsif fence<>current_fence then raise exception 'rpg_conflict'; end if;
end $$;
create function rpg_private.timeline_restoring(cid uuid) returns boolean language sql stable set search_path='' as $$
 select exists(select 1 from rpg_private.timeline_restore_guards where backend=pg_backend_pid() and transaction_id=txid_current() and campaign_id=cid)
$$;
create function rpg_private.timeline_stamp(value jsonb, fence jsonb, top_level boolean default true) returns jsonb language plpgsql immutable set search_path='' as $$
declare answer jsonb; item record; begin
 if jsonb_typeof(value)='object' then
  answer:='{}';
  for item in select key,val from jsonb_each(value) e(key,val) loop
   -- These are opaque authored/mechanical JSON, not transport envelopes.
   answer:=answer||jsonb_build_object(item.key,case when item.key=any(array['privateState','contents','resources','stats','values','configuration','definition','public_outcome','public_position','public_resources','public_proposal','ingredients','effect_definition','mechanic','publicPatches','privatePatches','checks','plan','resolution','narration','feedback','usage','conditions','equipment_slots','inputs','outputItemIds','outcomes','proposal','exactState']) then item.val else rpg_private.timeline_stamp(item.val,fence,false) end);
  end loop;
  if top_level or value ? 'campaignId' or value ? 'campaign_id' or (value ?& array['campaign','publicState','settings']) then answer:=answer||jsonb_build_object('timeline',fence); end if;
  return answer;
 elsif jsonb_typeof(value)='array' then
  select coalesce(jsonb_agg(rpg_private.timeline_stamp(v,fence,false) order by n),'[]') into answer from jsonb_array_elements(value) with ordinality a(v,n);
  return answer;
 end if;
 return value;
end $$;

-- The only eligible projection families. Global canon/history/feedback are excluded.
create function rpg_private.timeline_tables() returns text[] language sql immutable set search_path='' as $$
 select array['public.rpg_settings','public.rpg_documents','public.rpg_entities','public.rpg_storages','public.rpg_items',
 'public.rpg_sessions','public.rpg_scenes','public.rpg_public_state','public.rpg_quests','public.rpg_locations',
 'public.rpg_conversations','public.rpg_rest_records','public.rpg_recipes','public.rpg_effects','public.rpg_encounters',
 'public.rpg_encounter_participants','public.rpg_pending_actions','public.rpg_session_guidance','public.rpg_provenance',
 'rpg_private.runtime_state','rpg_private.turns','rpg_private.runtime_commands','rpg_private.runtime_events','rpg_private.dm_state',
 'rpg_private.memory_state','rpg_private.memory_public_sources','rpg_private.memory_private_sources','rpg_private.memory_aliases',
 'rpg_private.memory_restrictions','rpg_private.memory_boundaries','rpg_private.memory_checkpoints','public.rpg_memory_summaries',
 'rpg_private.memory_summaries','rpg_private.memory_jobs','rpg_private.memory_commands']::text[]
$$;
create function rpg_private.timeline_filter(tab text) returns text language plpgsql immutable set search_path='' as $$
begin
 if tab='public.rpg_documents' then return ' and id in (select document_id from public.rpg_dm_guides where campaign_id=$1)'; end if;
 if tab='rpg_private.turns' then return ' and input->>''mode''<>''feedback'''; end if;
 if tab in ('rpg_private.runtime_commands','rpg_private.runtime_events') then return ' and (operation_id is null or operation_id not in (select id from rpg_private.turns where campaign_id=$1 and input->>''mode''=''feedback''))'; end if;
 return '';
end $$;
create function rpg_private.timeline_public_metadata(cid uuid) returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('sessionTitle',s.title,'sceneTitle',sc.title,'locationName',l.name,'worldMinutes',r.world_minutes,
 'pendingAction',exists(select 1 from rpg_private.turns t where t.campaign_id=cid and t.input->>'mode' in ('game','companion','mechanic') and (t.status in ('pending','generating','awaiting_confirmation') or (t.status='failed' and t.retryable))))
 from public.rpg_public_state p join rpg_private.runtime_state r on r.campaign_id=p.campaign_id
 left join public.rpg_sessions s on s.campaign_id=cid and s.id=p.current_session_id
 left join public.rpg_scenes sc on sc.campaign_id=cid and sc.id=p.current_scene_id
 left join public.rpg_locations l on l.campaign_id=cid and l.id=p.current_location_id where p.campaign_id=cid
$$;
create function rpg_private.timeline_capture(cid uuid) returns uuid language plpgsql set search_path='' as $$
declare tab text; rowdata jsonb; ref uuid; mid uuid; tid uuid; refs jsonb:='{}'; ids jsonb; key text; hash text; cg integer;
begin
 select active_timeline_id,canon_generation into strict tid,cg from rpg_private.timeline_campaigns where campaign_id=cid;
 foreach tab in array rpg_private.timeline_tables() loop
  ids:='[]';
  for rowdata in execute format('select to_jsonb(t)-''search_vector'' from %s t where campaign_id=$1%s order by to_jsonb(t)::text',tab,rpg_private.timeline_filter(tab)) using cid loop
   key:=coalesce(rowdata->>'id',rowdata->>'campaign_id');
   if tab='rpg_private.memory_aliases' then key:=(rowdata->>'entity_id')||':'||(rowdata->>'alias'); end if;
   if tab='rpg_private.memory_restrictions' then key:=(rowdata->>'kind')||':'||(rowdata->>'source_id'); end if;
   hash:=encode(sha256(convert_to(rowdata::text,'UTF8')),'hex');
   insert into rpg_private.timeline_versions(campaign_id,table_name,row_key,digest,payload,origin_timeline_id) values(cid,tab,key,hash,rowdata,tid)
    on conflict(campaign_id,table_name,row_key,digest) do nothing;
   select id into strict ref from rpg_private.timeline_versions where campaign_id=cid and table_name=tab and row_key=key and digest=hash and payload=rowdata;
   ids:=ids||jsonb_build_array(ref);
  end loop;
  refs:=refs||jsonb_build_object(tab,ids);
 end loop;
 insert into rpg_private.timeline_manifests(campaign_id,timeline_id,refs,public_metadata,canon_generation)
 values(cid,tid,refs,rpg_private.timeline_public_metadata(cid),cg) returning id into mid;
 return mid;
end $$;

-- Projection replacement is authorized by a private transaction row, never SET.
create or replace function rpg_private.immutable_history() returns trigger language plpgsql set search_path='' as $$
begin
 if (tg_table_schema||'.'||tg_table_name)=any(rpg_private.timeline_tables()) and rpg_private.timeline_restoring(coalesce(new.campaign_id,old.campaign_id)) then return coalesce(new,old); end if;
 raise exception 'rpg_immutable_history' using errcode='42501';
end $$;
create or replace function rpg_private.memory_preserve_history() returns trigger language plpgsql set search_path='' as $$
begin
 if rpg_private.timeline_restoring(coalesce(new.campaign_id,old.campaign_id)) then return coalesce(new,old); end if;
 if tg_op='DELETE' or (to_jsonb(new)-'valid') is distinct from (to_jsonb(old)-'valid') or (not old.valid and new.valid) then raise exception 'rpg_immutable_history' using errcode='42501'; end if;
 return new;
end $$;
do $$ declare name text; definition text; begin
 foreach name in array array['runtime_revision','memory_record_source','memory_runtime_event'] loop
  select pg_get_functiondef(p.oid) into strict definition from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='rpg_private' and p.proname=name;
  definition:=regexp_replace(definition,E'\nBEGIN|\nbegin',E'\nBEGIN\n if rpg_private.timeline_restoring(coalesce(new.campaign_id,old.campaign_id)) then return coalesce(new,old); end if;','i');
  execute definition;
 end loop;
end $$;
-- Deferring existing references changes no relationship or constraint strength.
do $$ declare c record; begin
 for c in select conrelid::regclass tab,conname from pg_constraint where contype='f' and conrelid=any(select t::regclass from unnest(rpg_private.timeline_tables()) t) loop
  execute format('alter table %s alter constraint %I deferrable initially deferred',c.tab,c.conname);
 end loop;
end $$;

create function rpg_private.timeline_validate(cid uuid, mid uuid) returns void language plpgsql set search_path='' as $$
declare m rpg_private.timeline_manifests%rowtype; tab text; idtext text; stored rpg_private.timeline_versions%rowtype; begin
 select * into m from rpg_private.timeline_manifests where campaign_id=cid and id=mid;
 if not found or m.schema_version<>1 then raise exception 'rpg_validation'; end if;
 if (select count(*) from jsonb_object_keys(m.refs))<>cardinality(rpg_private.timeline_tables()) then raise exception 'rpg_validation'; end if;
 foreach tab in array rpg_private.timeline_tables() loop
  perform rpg_private.assert(jsonb_typeof(m.refs->tab)='array');
  for idtext in select jsonb_array_elements_text(m.refs->tab) loop
   select * into stored from rpg_private.timeline_versions where campaign_id=cid and id=idtext::uuid and table_name=tab;
   perform rpg_private.assert(stored.id is not null and stored.payload->>'campaign_id'=cid::text and stored.digest=encode(sha256(convert_to(stored.payload::text,'UTF8')),'hex'));
  end loop;
 end loop;
 if m.canon_generation<>(select canon_generation from rpg_private.timeline_campaigns where campaign_id=cid) and exists(
  select 1 from jsonb_array_elements_text(m.refs->'rpg_private.turns') ref join rpg_private.timeline_versions v on v.id=ref::uuid
  where v.campaign_id=cid and (v.payload->>'status' in ('pending','generating','awaiting_confirmation') or (v.payload->>'status'='failed' and (v.payload->>'retryable')::boolean))
  and (v.payload#>'{checkpoint,plan}'<>'null'::jsonb or v.payload#>'{checkpoint,resolution}'<>'null'::jsonb or v.payload#>'{checkpoint,narration}'<>'null'::jsonb)
 ) then raise exception 'rpg_conflict'; end if;
end $$;

create function rpg_private.timeline_activate(cid uuid, mid uuid, target uuid) returns void language plpgsql set search_path='' as $$
declare m rpg_private.timeline_manifests%rowtype; tab text; cols text; vals text; rowdata jsonb; savedrev integer; newrev integer; generation integer; doc record; cp record; clean jsonb; fence jsonb;
begin
 perform rpg_private.timeline_validate(cid,mid);
 select * into strict m from rpg_private.timeline_manifests where campaign_id=cid and id=mid;
 perform rpg_private.assert(exists(select 1 from rpg_private.timelines where campaign_id=cid and id=target));
 select revision+1 into newrev from rpg_private.runtime_state where campaign_id=cid;
 select canon_generation into generation from rpg_private.timeline_campaigns where campaign_id=cid;
 -- Capture is mandatory even for internal activation; every old projection row is vaulted.
 perform rpg_private.timeline_capture(cid);
 insert into rpg_private.timeline_restore_guards values(pg_backend_pid(),txid_current(),cid);
 set constraints all deferred;
 -- Keep guide identity for immutable global versions; replace its current value in place.
 foreach tab in array rpg_private.timeline_tables() loop
  if tab='public.rpg_documents' then continue; end if;
  execute format('delete from %s where campaign_id=$1%s',tab,rpg_private.timeline_filter(tab)) using cid;
 end loop;
 foreach tab in array rpg_private.timeline_tables() loop
  select string_agg(quote_ident(a.attname),',' order by a.attnum),string_agg('x.'||quote_ident(a.attname),',' order by a.attnum)
  into cols,vals from pg_attribute a where a.attrelid=tab::regclass and a.attnum>0 and not a.attisdropped and a.attgenerated='';
  for rowdata in select v.payload from jsonb_array_elements_text(m.refs->tab) ref join rpg_private.timeline_versions v on v.id=ref::uuid and v.campaign_id=cid loop
   if tab='public.rpg_documents' then
    update public.rpg_documents set title=rowdata->>'title',status=rowdata->>'status',body=rowdata->>'body',current_version_id=(rowdata->>'current_version_id')::uuid,revision=(rowdata->>'revision')::integer,updated_at=(rowdata->>'updated_at')::timestamptz where campaign_id=cid and id=(rowdata->>'id')::uuid;
   else execute format('insert into %s(%s) overriding system value select %s from jsonb_populate_record(null::%s,$1) x',tab,cols,vals,tab) using rowdata; end if;
  end loop;
 end loop;
 select revision into savedrev from rpg_private.runtime_state where campaign_id=cid;
 newrev:=greatest(newrev,savedrev+1);
 update rpg_private.runtime_state set revision=newrev,updated_at=now() where campaign_id=cid;
 update rpg_private.timeline_campaigns set active_timeline_id=target,epoch=epoch+1,revision=revision+1 where campaign_id=cid;
 fence:=rpg_private.timeline_fence(cid);
 -- Only still-valid pending envelopes rebind; already stale proposals stay stale.
 update rpg_private.turns set expected_revision=newrev,input=jsonb_set(input,'{expectedRevision}',to_jsonb(newrev)),
  source=case when source is null then null else rpg_private.timeline_stamp(jsonb_set(source,'{runtime,revision}',to_jsonb(newrev)),fence,false) end,
  lease_token=null,lease_until=null
 where campaign_id=cid and input->>'mode'<>'feedback' and expected_revision=savedrev and (status in ('pending','generating','awaiting_confirmation') or (status='failed' and retryable));
 update rpg_private.turns set input=input-'timeline',source=case when source is null then null else jsonb_set(source,'{snapshot}',(source->'snapshot')||jsonb_build_object('timeline',fence)) end
 where campaign_id=cid and input->>'mode'<>'feedback' and expected_revision=newrev and (status in ('pending','generating','awaiting_confirmation') or (status='failed' and retryable));
 update rpg_private.turns set source=jsonb_set(source,'{memory,stateRevision}',to_jsonb(newrev)) where campaign_id=cid and expected_revision=newrev and source->'memory' is not null;
 update rpg_private.turns set lease_token=null,lease_until=null where campaign_id=cid;
 update rpg_private.memory_jobs set token=null,lease_until=null,status=case when status='generating' then 'pending' else status end,state_revision=newrev where campaign_id=cid;
 -- Saved checkpoint originals remain vaulted; the active envelope has a fresh technical revision.
 update rpg_private.memory_checkpoints set payload=jsonb_set(payload,'{stateRevision}',to_jsonb(newrev)) where campaign_id=cid and valid;
 update public.rpg_memory_summaries set state_revision=newrev where campaign_id=cid and valid;
 update rpg_private.memory_summaries set state_revision=newrev where campaign_id=cid and valid;
 update public.rpg_campaigns set language=(select values->>'language' from public.rpg_settings where campaign_id=cid) where id=cid;
 delete from rpg_private.timeline_restore_guards where backend=pg_backend_pid() and transaction_id=txid_current() and campaign_id=cid;
 if m.canon_generation<>generation then
  update rpg_private.memory_public_sources set current=false,status='superseded' where campaign_id=cid and kind='document';
  update rpg_private.memory_private_sources set current=false,status='superseded' where campaign_id=cid and kind='document';
  for doc in select d.* from public.rpg_documents d where campaign_id=cid and status<>'archived' and not exists(select 1 from public.rpg_dm_guides g where g.campaign_id=cid and g.document_id=d.id) loop
   perform rpg_private.memory_index(cid,'document',doc.id,doc.revision::text,doc.body,'public',null,'{}','{}',case doc.status when 'canon' then 'canon' else 'reference' end);
   update rpg_private.memory_public_sources set current=true,status='valid' where campaign_id=cid and kind='document' and source_id=doc.id and version=doc.revision::text;
  end loop;
  perform rpg_private.memory_invalidate(cid);
  for doc in select * from rpg_private.timeline_global_restrictions where campaign_id=cid loop
   perform rpg_private.memory_restrict_source_phase3(cid,doc.kind,doc.source_id);
  end loop;
 end if;
 set constraints all immediate;
end $$;

create function rpg_private.timeline_save(cid uuid, kind text, name text, trigger_key text default null) returns uuid language plpgsql set search_path='' as $$
declare mid uuid; sid uuid; tid uuid; metadata jsonb; begin
 select active_timeline_id into strict tid from rpg_private.timeline_campaigns where campaign_id=cid;
 if trigger_key is not null then
  select id into sid from rpg_private.save_points s where campaign_id=cid and timeline_id=tid and s.trigger_key=timeline_save.trigger_key;
  if found then return sid; end if;
 end if;
 mid:=rpg_private.timeline_capture(cid); metadata:=rpg_private.timeline_public_metadata(cid);
 insert into rpg_private.save_points(campaign_id,timeline_id,manifest_id,kind,name,public_metadata,trigger_key)
 values(cid,tid,mid,kind,name,metadata,trigger_key) returning id into sid;
 update rpg_private.timelines set head_manifest_id=mid,head_public=metadata,updated_at=now(),quick_save_id=case when kind='quick' then sid else quick_save_id end where campaign_id=cid and id=tid;
 update rpg_private.timeline_campaigns set revision=revision+1 where campaign_id=cid;
 return sid;
end $$;
create function rpg_private.timeline_read(cid uuid) returns jsonb language plpgsql stable set search_path='' as $$
declare state rpg_private.timeline_campaigns%rowtype; result jsonb; begin
 select * into strict state from rpg_private.timeline_campaigns where campaign_id=cid;
 return jsonb_build_object('campaignId',cid,'timeline',rpg_private.timeline_fence(cid),'runtimeRevision',(select revision from rpg_private.runtime_state where campaign_id=cid),'revision',state.revision,'policy',state.policy,
 'saves',coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'campaign_id',cid,'timelineId',s.timeline_id,'name',s.name,'kind',s.kind,'createdAt',s.created_at)||s.public_metadata order by s.created_at desc,s.id) from rpg_private.save_points s where s.campaign_id=cid and
  (s.kind in ('manual','safety') or (s.kind='quick' and exists(select 1 from rpg_private.timelines t where t.campaign_id=cid and t.quick_save_id=s.id)) or (s.kind='autosave' and s.id in (select a.id from rpg_private.save_points a where a.campaign_id=cid and a.timeline_id=s.timeline_id and a.kind='autosave' order by a.created_at desc,a.id desc limit (state.policy->>'retention')::integer)))),'[]'),
 'timelines',coalesce((select jsonb_agg(jsonb_build_object('id',t.id,'campaign_id',cid,'label',t.label,'parentTimelineId',t.parent_timeline_id,'forkSaveId',t.fork_save_id,'createdAt',t.created_at,'updatedAt',t.updated_at,'active',t.id=state.active_timeline_id,'quickSaveId',t.quick_save_id,'locationName',case when t.id=state.active_timeline_id then rpg_private.timeline_public_metadata(cid)->'locationName' else t.head_public->'locationName' end,'worldMinutes',case when t.id=state.active_timeline_id then rpg_private.timeline_public_metadata(cid)->'worldMinutes' else coalesce(t.head_public->'worldMinutes','0'::jsonb) end) order by t.created_at,t.id) from rpg_private.timelines t where t.campaign_id=cid),'[]'));
end $$;

create function rpg_private.timeline_campaign_json(cid uuid,uid uuid) returns jsonb language plpgsql stable set search_path='' as $$
declare result jsonb:=rpg_private.runtime_source(cid,uid,'feedback')->'snapshot'; field text; begin
 result:=result||jsonb_build_object('timeline',rpg_private.timeline_fence(cid),
 'settingsHistory',coalesce((select jsonb_agg(jsonb_build_object('id',id,'campaign_id',campaign_id,'revision',revision,'values',values,'created_at',created_at) order by revision) from public.rpg_settings_revisions s where campaign_id=cid),'[]'),
 'assets',coalesce((select jsonb_agg(jsonb_build_object('id',id,'campaign_id',campaign_id,'revision',revision,'updated_at',updated_at,'title',title,'kind',kind,'storage_path',storage_path,'description',description) order by id) from public.rpg_assets a where campaign_id=cid),'[]'));
 foreach field in array array['documents','entities','storages','items','sessions','quests','locations'] loop
  result:=jsonb_set(result,array[field],(select coalesce(jsonb_agg(value order by value->>'id'),'[]') from jsonb_array_elements(result->field)));
 end loop;
 return result;
end $$;
create function public.rpg_saves(p_owner_id uuid,p_campaign_id uuid,p_action text,p_payload jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare cid uuid:=p_campaign_id; uid uuid:=p_owner_id; state rpg_private.timeline_campaigns%rowtype; command rpg_private.save_commands%rowtype;
 request_id uuid; target uuid; sid uuid; safety uuid; mid uuid; result jsonb; req jsonb; point rpg_private.save_points%rowtype; next_policy jsonb;
begin
 if uid is null or not exists(select 1 from rpg_private.owner_registry where user_id=uid) then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform rpg_private.assert(cid is not null and jsonb_typeof(p_payload)='object' and octet_length(p_payload::text)<=10000);
 perform 1 from public.rpg_campaigns where id=cid for update; if not found then raise exception 'rpg_not_found'; end if;
 perform rpg_private.timeline_initialize(cid);
 select * into strict state from rpg_private.timeline_campaigns where campaign_id=cid for update;
 if p_action='fence' then return rpg_private.timeline_fence(cid); end if;
 if p_action='read' then return rpg_private.timeline_read(cid); end if;
 if p_action='campaign' then return rpg_private.timeline_campaign_json(cid,uid); end if;
 request_id:=(p_payload->>'requestId')::uuid; req:=jsonb_build_object('action',p_action,'payload',p_payload);
 perform rpg_private.assert(request_id is not null and p_payload->>'campaignId'=cid::text);
 select * into command from rpg_private.save_commands where id=request_id;
 if found then
  if command.owner_id<>uid or command.campaign_id<>cid or command.request<>req then raise exception 'rpg_conflict'; end if;
  return command.result||jsonb_build_object('snapshot',rpg_private.timeline_read(cid));
 end if;
 perform rpg_private.timeline_assert(cid,p_payload->'timeline');
 if p_payload->>'expectedRevision' is distinct from (select revision::text from rpg_private.runtime_state where campaign_id=cid) or p_payload->>'expectedSavesRevision' is distinct from state.revision::text then raise exception 'rpg_conflict'; end if;
 target:=state.active_timeline_id;
 if p_action='create' then
  perform rpg_private.fields(p_payload,array['requestId','campaignId','timeline','expectedRevision','expectedSavesRevision','kind','name']);
  perform rpg_private.assert(p_payload->>'kind' in ('manual','quick') and jsonb_typeof(p_payload->'name')='string' and length(btrim(p_payload->>'name')) between 1 and 200);
  sid:=rpg_private.timeline_save(cid,p_payload->>'kind',btrim(p_payload->>'name'));
 elsif p_action in ('load','switch') then
  perform rpg_private.fields(p_payload,array['requestId','campaignId','timeline','expectedRevision','expectedSavesRevision','recovery']||case p_action when 'load' then array['saveId','label'] else array['timelineId'] end);
  perform rpg_private.assert(jsonb_typeof(p_payload->'recovery')='boolean');
  if p_action='load' then
   select * into point from rpg_private.save_points where campaign_id=cid and id=(p_payload->>'saveId')::uuid;
   if not found then raise exception 'rpg_not_found'; end if;
   if point.kind='autosave' and not (p_payload->>'recovery')::boolean and point.id not in (select s.id from rpg_private.save_points s where s.campaign_id=cid and s.timeline_id=point.timeline_id and s.kind='autosave' order by s.created_at desc,s.id desc limit (state.policy->>'retention')::integer) then raise exception 'rpg_validation'; end if;
   perform rpg_private.assert(jsonb_typeof(p_payload->'label')='string' and length(btrim(p_payload->>'label')) between 1 and 200);
   if not (p_payload->>'recovery')::boolean and (state.policy->>'loadMode'='restricted' or (state.policy->>'loadMode'='checkpoints' and point.kind not in ('autosave','safety'))) then raise exception 'rpg_validation'; end if;
   mid:=point.manifest_id;
  else
   target:=(p_payload->>'timelineId')::uuid;
   select head_manifest_id into mid from rpg_private.timelines where campaign_id=cid and id=target;
   if not found then raise exception 'rpg_not_found'; end if;
   if target=state.active_timeline_id then mid:=null;
   elsif not (p_payload->>'recovery')::boolean and state.policy->>'loadMode'<>'unrestricted' then raise exception 'rpg_validation'; end if;
  end if;
  if p_action='load' or target<>state.active_timeline_id then
   perform rpg_private.timeline_validate(cid,mid);
   safety:=rpg_private.timeline_save(cid,'safety','Before load — '||to_char(now(),'YYYY-MM-DD HH24:MI:SS'));
   if p_action='load' then
    target:=gen_random_uuid();
    insert into rpg_private.timelines(id,campaign_id,label,parent_timeline_id,fork_save_id,head_manifest_id,head_public)
    values(target,cid,btrim(p_payload->>'label'),point.timeline_id,point.id,mid,point.public_metadata);
    sid:=point.id;
   end if;
   perform rpg_private.timeline_activate(cid,mid,target);
  end if;
 elsif p_action='policy' then
  perform rpg_private.fields(p_payload,array['requestId','campaignId','timeline','expectedRevision','expectedSavesRevision','policy']);
  next_policy:=p_payload->'policy'; perform rpg_private.fields(next_policy,array['autosave','retention','loadMode']);
  perform rpg_private.assert(next_policy->>'autosave' in ('off','session','turn') and next_policy->>'loadMode' in ('unrestricted','checkpoints','restricted') and jsonb_typeof(next_policy->'retention')='number' and (next_policy->>'retention')::numeric between 10 and 20 and mod((next_policy->>'retention')::numeric,1)=0);
  update rpg_private.timeline_campaigns set policy=next_policy,revision=revision+1 where campaign_id=cid;
 else raise exception 'rpg_validation'; end if;
 result:=jsonb_build_object('snapshot',rpg_private.timeline_read(cid),'requestId',request_id,'saveId',sid,'timelineId',target,'safetySaveId',safety);
 insert into rpg_private.save_commands(id,campaign_id,owner_id,request,result) values(request_id,cid,uid,req,result);
 return result;
end $$;

-- Wrappers and grants follow in the companion migration. All new storage is private.
set constraints all immediate;
do $$ declare t text; begin
 foreach t in array array['timeline_campaigns','timelines','timeline_versions','timeline_manifests','save_points','save_commands','timeline_restore_guards','session_identities'] loop
  execute format('alter table rpg_private.%I enable row level security',t);
 end loop;
end $$;
revoke all on all tables in schema rpg_private from public,anon,authenticated;
revoke all on all functions in schema rpg_private from public,anon,authenticated;
revoke all on function public.rpg_saves(uuid,uuid,text,jsonb) from public,anon,authenticated;
do $$ begin if exists(select 1 from pg_roles where rolname='service_role') then grant execute on function public.rpg_saves(uuid,uuid,text,jsonb) to service_role; end if; end $$;
commit;
