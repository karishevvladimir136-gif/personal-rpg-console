-- World Lab D1: detached manifests use the existing immutable version vault.
-- No active projection restore, provider request, seed data or fictional wall clock.
begin;

alter table rpg_private.timelines add column purpose text not null default 'playable' check(purpose in ('playable','simulation'));
alter table rpg_private.timelines add column head_revision integer not null default 0 check(head_revision>=0);
alter table rpg_private.timeline_manifests add column lab_run_id uuid;

create table rpg_private.world_lab_runs (
 id uuid primary key, campaign_id uuid not null references public.rpg_campaigns(id), owner_id uuid not null references auth.users(id),
 timeline_id uuid not null unique, label text not null check(length(btrim(label)) between 1 and 160),
 input_bundle jsonb not null, input_digest text not null check(input_digest ~ '^[0-9a-f]{64}$'),
 status text not null check(status in ('prepared','running','paused','completed','cancelled','failed')),
 reason text check(reason in ('review_required','source_changed','unsupported','work_limit','cancelled','unavailable')),
 revision integer not null default 1 check(revision>0), lease_generation integer not null default 1 check(lease_generation>0),
 head_revision integer not null default 0 check(head_revision>=0), head_manifest_id uuid not null, last_checkpoint_id uuid not null,
 current_world_minutes integer not null check(current_world_minutes>=0), step_count integer not null default 0 check(step_count between 0 and 32),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(campaign_id,id),
 foreign key(campaign_id,timeline_id) references rpg_private.timelines(campaign_id,id),
 foreign key(campaign_id,head_manifest_id) references rpg_private.timeline_manifests(campaign_id,id) deferrable initially deferred,
 foreign key(campaign_id,last_checkpoint_id) references rpg_private.timeline_manifests(campaign_id,id) deferrable initially deferred
);
alter table rpg_private.timeline_manifests add foreign key(campaign_id,lab_run_id) references rpg_private.world_lab_runs(campaign_id,id) deferrable initially deferred;
create table rpg_private.world_lab_commands (
 operation_id uuid not null, stage text not null check(stage in ('prepare','claim','commit','pause','cancel','resume')),
 owner_id uuid not null references auth.users(id), campaign_id uuid not null references public.rpg_campaigns(id),
 run_id uuid not null, request jsonb not null, result jsonb not null, created_at timestamptz not null default now(),
 primary key(operation_id,stage), foreign key(campaign_id,run_id) references rpg_private.world_lab_runs(campaign_id,id)
);
alter table rpg_private.world_lab_runs enable row level security;
alter table rpg_private.world_lab_commands enable row level security;
create trigger immutable_lab_receipt before update or delete on rpg_private.world_lab_commands for each row execute function rpg_private.timeline_immutable();
create function rpg_private.lab_preserve_input() returns trigger language plpgsql set search_path='' as $$
begin
 if tg_op='DELETE' or (to_jsonb(new)-array['status','reason','revision','lease_generation','head_revision','head_manifest_id','last_checkpoint_id','current_world_minutes','step_count','updated_at']) is distinct from (to_jsonb(old)-array['status','reason','revision','lease_generation','head_revision','head_manifest_id','last_checkpoint_id','current_world_minutes','step_count','updated_at']) then raise exception 'rpg_immutable_history' using errcode='42501'; end if;
 return new;
end $$;
create trigger immutable_lab_input before update or delete on rpg_private.world_lab_runs for each row execute function rpg_private.lab_preserve_input();

-- Canonical JSON matches the existing Library canonical format for bounded inputs.
create function rpg_private.lab_canonical(v jsonb) returns text language plpgsql immutable set search_path='' as $$
declare result text; begin
 case jsonb_typeof(v)
 when 'object' then select '{'||coalesce(string_agg(to_jsonb(key)::text||':'||rpg_private.lab_canonical(value),',' order by key collate "C"),'')||'}' into result from jsonb_each(v);
 when 'array' then select '['||coalesce(string_agg(rpg_private.lab_canonical(value),',' order by n),'')||']' into result from jsonb_array_elements(v) with ordinality a(value,n);
 when 'number' then result:=trim_scale((v#>>'{}')::numeric)::text;
 else result:=v::text;
 end case;
 return result;
end $$;
create function rpg_private.lab_digest(v jsonb) returns text language sql immutable set search_path='' as $$
 select encode(sha256(convert_to(rpg_private.lab_canonical(v),'UTF8')),'hex')
$$;
create function rpg_private.lab_rows(cid uuid,mid uuid,tab text) returns jsonb language sql stable set search_path='' as $$
 select coalesce(jsonb_agg(v.payload order by x.n),'[]') from rpg_private.timeline_manifests m,
 lateral jsonb_array_elements_text(m.refs->tab) with ordinality x(id,n)
 join rpg_private.timeline_versions v on v.campaign_id=cid and v.id=x.id::uuid and v.table_name=tab
 where m.campaign_id=cid and m.id=mid
$$;
create function rpg_private.lab_validate_manifest(cid uuid,mid uuid) returns void language plpgsql stable set search_path='' as $$
declare m rpg_private.timeline_manifests%rowtype; families text[]; tab text; ids jsonb; v record; begin
 select * into m from rpg_private.timeline_manifests where campaign_id=cid and id=mid;
 perform rpg_private.assert(m.id is not null and m.schema_version in (1,2,3));
 families:=case when m.schema_version=1 then rpg_private.timeline_tables_v1() else rpg_private.timeline_tables() end;
 perform rpg_private.assert(jsonb_typeof(m.refs)='object' and (select count(*) from jsonb_object_keys(m.refs))=cardinality(families));
 if m.schema_version=3 then
  perform rpg_private.assert(m.lab_run_id is not null and exists(select 1 from rpg_private.world_lab_runs r join rpg_private.timelines t on t.id=r.timeline_id and t.campaign_id=r.campaign_id where r.campaign_id=cid and r.id=m.lab_run_id and r.timeline_id=m.timeline_id and t.purpose='simulation' and (r.input_bundle->>'canonGeneration')::integer=m.canon_generation));
 else perform rpg_private.assert(m.lab_run_id is null); end if;
 foreach tab in array families loop
  ids:=m.refs->tab; perform rpg_private.uuid_array(ids,100000);
  perform rpg_private.assert((select count(*) from rpg_private.timeline_versions where campaign_id=cid and table_name=tab and id in (select value::uuid from jsonb_array_elements_text(ids)))=jsonb_array_length(ids));
  perform rpg_private.assert((select count(distinct row_key) from rpg_private.timeline_versions where campaign_id=cid and table_name=tab and id in (select value::uuid from jsonb_array_elements_text(ids)))=jsonb_array_length(ids));
  for v in select * from rpg_private.timeline_versions where campaign_id=cid and table_name=tab and id in (select value::uuid from jsonb_array_elements_text(ids)) loop
   perform rpg_private.assert(v.payload->>'campaign_id'=cid::text and v.digest=encode(sha256(convert_to(v.payload::text,'UTF8')),'hex'));
   perform rpg_private.assert(v.row_key=case tab when 'rpg_private.memory_aliases' then (v.payload->>'entity_id')||':'||(v.payload->>'alias') when 'rpg_private.memory_restrictions' then (v.payload->>'kind')||':'||(v.payload->>'source_id') else coalesce(v.payload->>'id',v.payload->>'campaign_id') end);
  end loop;
 end loop;
end $$;
alter function rpg_private.timeline_validate(uuid,uuid) rename to timeline_validate_before_lab;
create function rpg_private.timeline_validate(cid uuid,mid uuid) returns void language plpgsql set search_path='' as $$
begin
 if (select schema_version from rpg_private.timeline_manifests where campaign_id=cid and id=mid)=3 then perform rpg_private.lab_validate_manifest(cid,mid);
 else perform rpg_private.timeline_validate_before_lab(cid,mid); end if;
end $$;
alter function rpg_private.timeline_activate(uuid,uuid,uuid) rename to timeline_activate_before_lab;
create function rpg_private.timeline_activate(cid uuid,mid uuid,target uuid) returns void language plpgsql set search_path='' as $$
begin
 if exists(select 1 from rpg_private.timelines where campaign_id=cid and id=target and purpose='simulation') or exists(select 1 from rpg_private.timeline_manifests where campaign_id=cid and id=mid and (schema_version=3 or lab_run_id is not null)) then raise exception 'rpg_validation'; end if;
 perform rpg_private.timeline_activate_before_lab(cid,mid,target);
end $$;
-- Existing Saves continues to list only playable timelines; old schemas unchanged.
do $$ declare d text; begin
 d:=pg_get_functiondef('rpg_private.timeline_read(uuid)'::regprocedure);
 d:=replace(d,'from rpg_private.timelines t where t.campaign_id=cid)', 'from rpg_private.timelines t where t.campaign_id=cid and t.purpose=''playable'')');
 execute d;
end $$;

create function rpg_private.lab_run_json(r rpg_private.world_lab_runs) returns jsonb language sql immutable set search_path='' as $$
 select jsonb_build_object('id',r.id,'ownerId',r.owner_id,'campaignId',r.campaign_id,'timelineId',r.timeline_id,'label',r.label,
 'input',r.input_bundle,'inputDigest',r.input_digest,'status',r.status,'reason',r.reason,'revision',r.revision,
 'leaseGeneration',r.lease_generation,'headRevision',r.head_revision,'headManifestId',r.head_manifest_id,
 'lastCheckpointId',r.last_checkpoint_id,'currentWorldMinutes',r.current_world_minutes)
$$;
create function rpg_private.lab_manifest_json(m rpg_private.timeline_manifests) returns jsonb language sql immutable set search_path='' as $$
 select jsonb_build_object('id',m.id,'campaignId',m.campaign_id,'timelineId',m.timeline_id,'schemaVersion',m.schema_version,
 'canonGeneration',m.canon_generation,'refs',m.refs,'publicMetadata',m.public_metadata,'runId',m.lab_run_id)
$$;
create function rpg_private.lab_fence(r rpg_private.world_lab_runs) returns jsonb language sql immutable set search_path='' as $$
 select jsonb_build_object('kind','detached','ownerId',r.owner_id,'campaignId',r.campaign_id,'timelineId',r.timeline_id,'runId',r.id,
 'leaseGeneration',r.lease_generation,'headRevision',r.head_revision,'manifestId',r.head_manifest_id,
 'scenarioVersionId',r.input_bundle->'scenarioVersionId','divergenceVersionId',r.input_bundle->'divergenceVersionId',
 'inputDigest',r.input_digest,'canonGeneration',r.input_bundle->'canonGeneration')
$$;
create function rpg_private.lab_fresh(r rpg_private.world_lab_runs) returns boolean language sql stable set search_path='' as $$
 select (r.input_bundle->>'canonGeneration')::integer=(select canon_generation from rpg_private.timeline_campaigns where campaign_id=r.campaign_id)
 and not exists(select 1 from jsonb_array_elements(r.input_bundle->'sourceHeads') h where h->>'versionId' is distinct from
  (select version_id::text from rpg_private.library_records where owner_id=r.owner_id and kind='source' and id=(h->>'sourceId')::uuid order by version desc limit 1))
$$;

create function rpg_private.lab_dependencies(uid uuid,cid uuid,mid uuid,scid uuid,dvid uuid) returns jsonb language plpgsql stable set search_path='' as $$
declare sc jsonb:=rpg_private.library_ref(uid,scid::text,'scenario'); dv jsonb:=rpg_private.library_ref(uid,dvid::text,'divergence'); f jsonb; s jsonb; p jsonb; i jsonb; sources jsonb:='[]'; result jsonb; minute integer; begin
 perform rpg_private.lab_validate_manifest(cid,mid);
 f:=rpg_private.lab_rows(cid,mid,'rpg_private.world_foundations')->0;
 minute:=(rpg_private.lab_rows(cid,mid,'rpg_private.runtime_state')->0->>'world_minutes')::integer;
 perform rpg_private.fields(sc->'body',array['schemaVersion','title','status','packVersionIds','sourceVersionIds','sourcePriority','entry','adaptation','identities','assumptions','carriedClaimIds','localHistory','unresolvedConflictIds','approval']);
 perform rpg_private.fields(dv->'body',array['schemaVersion','scenarioVersionId','title','changes','approval']);
 perform rpg_private.fields(sc#>'{body,approval}',array['ownerId','reviewedConflictIds','reviewedUnknownIds']);
 perform rpg_private.fields(dv#>'{body,approval}',array['ownerId','reviewedConflictIds','reviewedUnknownIds']);
 perform rpg_private.uuid_array(dv#>'{body,approval,reviewedConflictIds}'); perform rpg_private.uuid_array(dv#>'{body,approval,reviewedUnknownIds}');
 perform rpg_private.assert(jsonb_typeof(sc#>'{body,title}')='string' and length(btrim(sc#>>'{body,title}')) between 1 and 240 and jsonb_typeof(dv#>'{body,title}')='string' and length(btrim(dv#>>'{body,title}')) between 1 and 240);
 perform rpg_private.fields(sc#>'{body,entry}',array['label','worldMinutes','evidence']);
 perform rpg_private.assert(jsonb_typeof(sc#>'{body,entry,label}')='string' and length(btrim(sc#>>'{body,entry,label}')) between 1 and 1000);
 perform rpg_private.assert(sc#>>'{body,schemaVersion}'='1' and sc#>>'{body,status}'='approved' and sc#>>'{body,approval,ownerId}'=uid::text and dv#>>'{body,schemaVersion}'='1' and dv#>>'{body,scenarioVersionId}'=scid::text and dv#>>'{body,approval,ownerId}'=uid::text);
 perform rpg_private.assert(jsonb_typeof(sc#>'{body,entry,worldMinutes}')='number' and (sc#>>'{body,entry,worldMinutes}')::integer between 0 and minute);
 perform rpg_private.assert(sc#>>'{body,adaptation}' in ('original','literal_crossover','native_adaptation'));
 perform rpg_private.uuid_array(sc#>'{body,carriedClaimIds}',1000);
 perform rpg_private.assert(sc#>'{body,localHistory}'='null'::jsonb or (jsonb_typeof(sc#>'{body,localHistory}')='string' and length(btrim(sc#>>'{body,localHistory}')) between 1 and 8000));
 perform rpg_private.assert(sc#>>'{body,adaptation}'='literal_crossover' or sc#>'{body,carriedClaimIds}'='[]'::jsonb);
 perform rpg_private.assert(sc#>>'{body,adaptation}'<>'native_adaptation' or sc#>'{body,localHistory}'<>'null'::jsonb);
 perform rpg_private.assert(jsonb_typeof(sc#>'{body,identities}')='array' and jsonb_array_length(sc#>'{body,identities}')<=500);
 for i in select value from jsonb_array_elements(sc#>'{body,identities}') loop
  perform rpg_private.fields(i,array['packVersionId','packEntityId','scenarioEntityId']);
  perform rpg_private.assert((i->>'scenarioEntityId')::uuid is not null and (sc#>'{body,packVersionIds}') ? (i->>'packVersionId'));
  p:=rpg_private.library_ref(uid,i->>'packVersionId','pack');
  perform rpg_private.assert(exists(select 1 from jsonb_array_elements(p#>'{body,entities}') e where e->'id'=i->'packEntityId'));
 end loop;
 perform rpg_private.assert((select count(*)=count(distinct value->>'scenarioEntityId') and count(*)=count(distinct (value->>'packVersionId')||':'||(value->>'packEntityId')) from jsonb_array_elements(sc#>'{body,identities}')));
 perform rpg_private.uuid_array(sc#>'{body,packVersionIds}');
 perform rpg_private.source_set(uid,sc#>'{body,sourceVersionIds}',sc#>'{body,sourcePriority}');
 perform rpg_private.uuid_array(sc#>'{body,unresolvedConflictIds}');
 perform rpg_private.assert(sc#>'{body,unresolvedConflictIds}'='[]'::jsonb and sc#>'{body,approval,reviewedConflictIds}'='[]'::jsonb and sc#>'{body,approval,reviewedUnknownIds}'='[]'::jsonb);
 perform rpg_private.assert(jsonb_typeof(sc#>'{body,assumptions}')='array' and jsonb_typeof(dv#>'{body,changes}')='array' and jsonb_array_length(dv#>'{body,changes}') between 1 and 200);
 perform rpg_private.assert(jsonb_array_length(sc#>'{body,assumptions}')<=200 and (select count(*)=count(distinct value->>'id') from jsonb_array_elements(sc#>'{body,assumptions}')) and (select count(*)=count(distinct value->>'id') from jsonb_array_elements(dv#>'{body,changes}')));
 for i in select value from jsonb_array_elements((sc#>'{body,assumptions}')||(dv#>'{body,changes}')) loop
  perform rpg_private.fields(i,array['id','text','visibility']); perform rpg_private.assert((i->>'id')::uuid is not null and jsonb_typeof(i->'text')='string' and length(btrim(i->>'text')) between 1 and 4000 and i->>'visibility' in ('public','private'));
 end loop;
 result:=jsonb_build_array(sc,dv);
 for i in select value from jsonb_array_elements(sc#>'{body,packVersionIds}') loop
  p:=rpg_private.library_ref(uid,i#>>'{}','pack'); perform rpg_private.assert(p#>>'{body,status}'='approved' and p#>>'{body,approval,ownerId}'=uid::text);
  perform rpg_private.assert(exists(select 1 from jsonb_array_elements(coalesce(f->'bindings','[]')) b where b->>'ownerId'=uid::text and b->>'campaignId'=cid::text and b->>'scenarioVersionId'=scid::text and b->'sourceVersionIds'=sc#>'{body,sourceVersionIds}'));
  sources:=sources||(p#>'{body,sourceVersionIds}'); result:=result||jsonb_build_array(p);
 end loop;
 perform rpg_private.assert(sources @> (sc#>'{body,sourceVersionIds}') and (sc#>'{body,sourceVersionIds}') @> sources);
 for i in select value from jsonb_array_elements(sc#>'{body,sourceVersionIds}') loop s:=rpg_private.library_ref(uid,i#>>'{}','source'); result:=result||jsonb_build_array(s); end loop;
 perform rpg_private.library_evidence(uid,sc#>'{body,entry,evidence}',sc#>'{body,sourceVersionIds}');
 perform rpg_private.assert(jsonb_array_length(sc#>'{body,packVersionIds}')>0 or jsonb_array_length(sc#>'{body,assumptions}')>0);
 -- Every saved binding participates, even if another Scenario was selected.
 for i in select value from jsonb_array_elements(coalesce(f->'bindings','[]')) loop
  perform rpg_private.assert(i->>'ownerId'=uid::text and i->>'campaignId'=cid::text);
  p:=rpg_private.library_ref(uid,i->>'packVersionId','pack');
  perform rpg_private.assert(p->>'id'=i->>'packId' and p#>>'{body,status}'='approved' and p#>>'{body,approval,ownerId}'=uid::text);
  result:=result||jsonb_build_array(p);
  if i->>'scenarioVersionId' is null then perform rpg_private.assert(i->'sourceVersionIds'=p#>'{body,sourceVersionIds}'); end if;
  if i->>'scenarioVersionId' is not null then
   p:=rpg_private.library_ref(uid,i->>'scenarioVersionId','scenario');
   perform rpg_private.assert(p#>>'{body,status}'='approved' and p#>'{body,entry}'=i->'entry' and p#>'{body,sourcePriority}'=i->'sourcePriority');
   result:=result||jsonb_build_array(p);
   for s in select value from jsonb_array_elements(p#>'{body,packVersionIds}') loop result:=result||jsonb_build_array(rpg_private.library_ref(uid,s#>>'{}','pack')); end loop;
  end if;
  for s in select value from jsonb_array_elements(i->'sourceVersionIds') loop result:=result||jsonb_build_array(rpg_private.library_ref(uid,s#>>'{}','source')); end loop;
 end loop;
 select coalesce(jsonb_agg(value order by value->>'versionId'),'[]') into result from (select distinct value from jsonb_array_elements(result)) x;
 for p in select value from jsonb_array_elements(result) where value->>'kind'='pack' loop
  perform rpg_private.assert(p#>>'{body,status}'='approved' and p#>>'{body,approval,ownerId}'=uid::text and jsonb_typeof(p#>'{body,contradictions}')='array');
  perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(p#>'{body,contradictions}') contradiction where contradiction->>'status' is distinct from 'resolved'));
  perform rpg_private.assert(not exists(select 1 from jsonb_array_elements_text(p#>'{body,sourceVersionIds}') pin where not exists(select 1 from jsonb_array_elements(result) source_record where source_record->>'kind'='source' and source_record->>'versionId'=pin.value)));
 end loop;
 return result;
end $$;

create function rpg_private.lab_read_state(uid uuid,cid uuid,mid uuid,rid uuid,library jsonb,docs jsonb) returns jsonb language plpgsql stable set search_path='' as $$
declare m rpg_private.timeline_manifests%rowtype; r rpg_private.world_lab_runs%rowtype; versions jsonb; docrows jsonb; restrictions jsonb; begin
 perform rpg_private.lab_validate_manifest(cid,mid);
 select * into strict m from rpg_private.timeline_manifests where campaign_id=cid and id=mid;
 if rid is not null then select * into r from rpg_private.world_lab_runs where id=rid and campaign_id=cid and owner_id=uid; perform rpg_private.assert(r.id is not null and m.lab_run_id=r.id and m.timeline_id=r.timeline_id); end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',v.id,'campaignId',v.campaign_id,'tableName',v.table_name,'rowKey',v.row_key,'digest',v.digest,'payload',v.payload,'originTimelineId',v.origin_timeline_id) order by v.table_name,v.row_key),'[]') into versions from rpg_private.timeline_versions v where v.campaign_id=cid and exists(select 1 from jsonb_each(m.refs) e, jsonb_array_elements_text(e.value) a where e.key=v.table_name and a.value::uuid=v.id);
 select coalesce(jsonb_agg(to_jsonb(v) order by v.document_id),'[]') into docrows from public.rpg_document_versions v where v.campaign_id=cid and exists(select 1 from jsonb_array_elements(docs) d where d->>'documentId'=v.document_id::text and d->>'versionId'=v.id::text);
 select coalesce(jsonb_agg(x.row),'[]') into restrictions from (select to_jsonb(t) row from rpg_private.timeline_global_restrictions t where campaign_id=cid union select value from jsonb_array_elements(rpg_private.lab_rows(cid,mid,'rpg_private.memory_restrictions'))) x;
 return jsonb_build_object('ownerId',uid,'campaignId',cid,'manifest',rpg_private.lab_manifest_json(m),'versions',versions,
 'canonGeneration',(select canon_generation from rpg_private.timeline_campaigns where campaign_id=cid),'libraryRecords',library,'documentVersions',docrows,'restrictions',restrictions,'run',case when rid is null then null else rpg_private.lab_run_json(r) end);
end $$;

-- Additional prepare/lease/commit dispatch below. No historical family list is expanded.

-- A stable saved projection plus immutable global documents. The DM Guide comes
-- from the selected manifest, never the currently active guide projection.
create function rpg_private.lab_preparation(uid uuid,cid uuid,sid uuid,scid uuid,dvid uuid) returns jsonb language plpgsql stable set search_path='' as $$
declare s rpg_private.save_points%rowtype; m rpg_private.timeline_manifests%rowtype; f jsonb; guide jsonb; library jsonb; heads jsonb; docs jsonb; begin
 select * into s from rpg_private.save_points where campaign_id=cid and id=sid;
 perform rpg_private.assert(s.id is not null and exists(select 1 from rpg_private.timelines where campaign_id=cid and id=s.timeline_id and purpose='playable'));
 select * into strict m from rpg_private.timeline_manifests where campaign_id=cid and id=s.manifest_id;
 perform rpg_private.lab_validate_manifest(cid,m.id);
 perform rpg_private.assert(m.schema_version=2 and m.lab_run_id is null and m.canon_generation=(select canon_generation from rpg_private.timeline_campaigns where campaign_id=cid));
 perform rpg_private.assert(m.public_metadata->'pendingAction'='false'::jsonb);
 perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(rpg_private.lab_rows(cid,m.id,'rpg_private.turns')) t where t->>'owner_id'<>uid::text or t->>'status' not in ('committed','cancelled','failed') or (t->>'status'='failed' and t->>'retryable'<>'false')));
 perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(rpg_private.lab_rows(cid,m.id,'public.rpg_pending_actions')) a where a->>'status' not in ('resolved','cancelled')));
 perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(rpg_private.lab_rows(cid,m.id,'rpg_private.world_stages')) st where not exists(select 1 from jsonb_array_elements(rpg_private.lab_rows(cid,m.id,'rpg_private.turns')) t where t->>'id'=st->>'id' and t->>'status'='committed')));
 f:=rpg_private.lab_rows(cid,m.id,'rpg_private.world_foundations')->0;
 perform rpg_private.assert(f->'world' is not null and f->'world'<>'null'::jsonb and f#>>'{ruleset,id}' in ('console-basic-v1','world-logic-v1'));
 perform rpg_private.assert((m.public_metadata->>'worldMinutes')::integer=(rpg_private.lab_rows(cid,m.id,'rpg_private.runtime_state')->0->>'world_minutes')::integer);
 library:=rpg_private.lab_dependencies(uid,cid,m.id,scid,dvid);
 select coalesce(jsonb_agg(jsonb_build_object('sourceId',source_row.value->'id','versionId',latest.version_id) order by source_row.value->>'id'),'[]') into heads
 from jsonb_array_elements(library) source_row cross join lateral (select version_id from rpg_private.library_records where owner_id=uid and kind='source' and id=(source_row.value->>'id')::uuid order by version desc limit 1) latest where source_row.value->>'kind'='source';
 perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(library) source_row where source_row->>'kind'='source' and not exists(select 1 from jsonb_array_elements(heads) h where h->'sourceId'=source_row->'id' and h->'versionId'=source_row->'versionId')));
 guide:=rpg_private.lab_rows(cid,m.id,'public.rpg_documents')->0;
 perform rpg_private.assert(guide is not null and exists(select 1 from public.rpg_document_versions v where v.campaign_id=cid and v.id=(guide->>'current_version_id')::uuid and v.document_id=(guide->>'id')::uuid and v.body=guide->>'body' and v.title=guide->>'title' and v.status=guide->>'status'));
 select coalesce(jsonb_agg(jsonb_build_object('documentId',v.document_id,'versionId',v.id,'digest',encode(sha256(convert_to(v.body,'UTF8')),'hex')) order by v.document_id),'[]') into docs
 from public.rpg_document_versions v where v.campaign_id=cid and (v.id=(guide->>'current_version_id')::uuid or exists(select 1 from public.rpg_documents d where d.campaign_id=cid and d.id=v.document_id and d.current_version_id=v.id and d.id<>(guide->>'id')::uuid and not exists(select 1 from public.rpg_dm_guides g where g.campaign_id=cid and g.document_id=d.id)));
 return jsonb_build_object('state',rpg_private.lab_read_state(uid,cid,m.id,null,library,docs),'sourceHeads',heads,'documents',docs);
end $$;

create function rpg_private.lab_input(uid uuid,cid uuid,req jsonb,context jsonb) returns jsonb language plpgsql stable set search_path='' as $$
declare mid uuid:=(context#>>'{state,manifest,id}')::uuid; f jsonb; guide jsonb; start_minute integer; horizon integer; packs jsonb; sources jsonb; begin
 perform rpg_private.fields(req,array['operationId','campaignId','saveId','scenarioVersionId','divergenceVersionId','label','horizonMinutes']);
 perform rpg_private.assert(req->>'campaignId'=cid::text and (req->>'operationId')::uuid is not null and jsonb_typeof(req->'label')='string' and length(btrim(req->>'label')) between 1 and 160 and btrim(req->>'label')=req->>'label');
 perform rpg_private.assert(jsonb_typeof(req->'horizonMinutes')='number' and (req->>'horizonMinutes')::numeric=trunc((req->>'horizonMinutes')::numeric));
 horizon:=(req->>'horizonMinutes')::integer; perform rpg_private.assert(horizon between 1 and 43200);
 f:=rpg_private.lab_rows(cid,mid,'rpg_private.world_foundations')->0; guide:=rpg_private.lab_rows(cid,mid,'public.rpg_documents')->0;
 start_minute:=(rpg_private.lab_rows(cid,mid,'rpg_private.runtime_state')->0->>'world_minutes')::integer;
 perform rpg_private.assert(start_minute between 0 and 2147483646-horizon);
 select coalesce(jsonb_agg(value->'versionId' order by value->>'versionId'),'[]') into packs from jsonb_array_elements(context#>'{state,libraryRecords}') where value->>'kind'='pack';
 select coalesce(jsonb_agg(value->'versionId' order by value->>'versionId'),'[]') into sources from jsonb_array_elements(context#>'{state,libraryRecords}') where value->>'kind'='source';
 return jsonb_build_object('schemaVersion',1,'purpose','simulation','nonCanon',true,'ownerId',uid,'campaignId',cid,
 'base',jsonb_build_object('saveId',req->'saveId','timelineId',context#>'{state,manifest,timelineId}','manifestId',mid,'schemaVersion',2),
 'scenarioVersionId',req->'scenarioVersionId','divergenceVersionId',req->'divergenceVersionId','packVersionIds',packs,'sourceVersionIds',sources,
 'documentVersions',context->'documents','sourceHeads',context->'sourceHeads','canonGeneration',context#>'{state,canonGeneration}','ruleset',f->'ruleset',
 'effectiveSettings',rpg_private.lab_rows(cid,mid,'public.rpg_settings')->0->'values',
 'effectiveGuidance',jsonb_build_object('documentId',guide->'id','versionId',guide->'current_version_id','sessionGuidance',rpg_private.lab_rows(cid,mid,'public.rpg_session_guidance')),
 'resolutionPolicy',jsonb_build_object('id','deterministic-world-v1','version',1,'maxSteps',32),'startWorldMinutes',start_minute,'throughWorldMinutes',start_minute+horizon);
end $$;

create function rpg_private.lab_run_library(r rpg_private.world_lab_runs) returns jsonb language plpgsql stable set search_path='' as $$
declare ids jsonb; b jsonb; result jsonb; begin
 ids:=jsonb_build_array(r.input_bundle->'scenarioVersionId',r.input_bundle->'divergenceVersionId')||(r.input_bundle->'packVersionIds')||(r.input_bundle->'sourceVersionIds');
 for b in select value from jsonb_array_elements(rpg_private.lab_rows(r.campaign_id,r.head_manifest_id,'rpg_private.world_foundations')->0->'bindings') loop
  if b->>'scenarioVersionId' is not null then ids:=ids||jsonb_build_array(b->'scenarioVersionId'); end if;
 end loop;
 select coalesce(jsonb_agg(rpg_private.library_record_json(l) order by l.version_id),'[]') into result from rpg_private.library_records l where l.owner_id=r.owner_id and ids ? l.version_id::text;
 perform rpg_private.assert(jsonb_array_length(result)=(select count(distinct value) from jsonb_array_elements(ids)));
 return result;
end $$;

create function rpg_private.lab_refresh(rid uuid) returns rpg_private.world_lab_runs language plpgsql set search_path='' as $$
declare r rpg_private.world_lab_runs%rowtype; begin
 select * into strict r from rpg_private.world_lab_runs where id=rid for update;
 if not rpg_private.lab_fresh(r) and r.status not in ('completed','cancelled') and not (r.status='paused' and r.reason='source_changed') then
  update rpg_private.world_lab_runs set status='paused',reason='source_changed',revision=revision+1,lease_generation=lease_generation+1,updated_at=now() where id=rid returning * into r;
 end if;
 return r;
end $$;

-- Detached adapter for the accepted bounded World settlement validator. It
-- derives the same deterministic configured steps from exact vault rows; it
-- neither queries nor temporarily installs the active World projection.
create function rpg_private.lab_world_step(r rpg_private.world_lab_runs,op uuid,through_minute integer,trigger_kind text) returns jsonb language plpgsql stable set search_path='' as $$
declare cid uuid:=r.campaign_id; mid uuid:=r.head_manifest_id; f jsonb:=rpg_private.lab_rows(cid,mid,'rpg_private.world_foundations')->0; rt jsonb:=rpg_private.lab_rows(cid,mid,'rpg_private.runtime_state')->0; oldw jsonb:=f->'world'; nextw jsonb:=oldw; events jsonb:='[]'; sources jsonb; protected jsonb; entities jsonb:=rpg_private.lab_rows(cid,mid,'public.rpg_entities'); current_location text:=rpg_private.lab_rows(cid,mid,'public.rpg_public_state')->0->>'current_location_id'; candidate record; th jsonb; st jsonb; ev jsonb; evidence jsonb; actor jsonb; hc jsonb; hidx integer; idx integer; at_minute integer; boundary integer:=r.current_world_minutes; seen_threads jsonb:='[]'; seen_actors jsonb:='[]'; max_threads integer; max_actors integer; private_id uuid; public_id uuid; begin
 perform rpg_private.assert(trigger_kind in ('time_skip','session_boundary','none') and through_minute between r.current_world_minutes and (r.input_bundle->>'throughWorldMinutes')::integer);
 perform rpg_private.assert(through_minute::bigint-r.current_world_minutes<=60);
 perform rpg_private.assert(trigger_kind not in ('session_boundary','none') or through_minute=r.current_world_minutes);
 if oldw is null or oldw='null'::jsonb or trigger_kind='none' or (trigger_kind<>'session_boundary' and through_minute=r.current_world_minutes) then return 'null'::jsonb; end if;
 perform rpg_private.assert((oldw->>'policyChangedAtWorldMinutes')::integer<=r.current_world_minutes);
 perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(oldw->'threads') t,jsonb_array_elements(t->'steps') with ordinality st(v,n) where n>(t->>'cursor')::integer and coalesce(st.v->'consequences','[]')<>'[]'::jsonb));
 select coalesce(jsonb_agg(distinct s.value order by s.value),'[]') into sources from jsonb_array_elements(f->'bindings') b,jsonb_array_elements(b->'sourceVersionIds') s;
 select coalesce(jsonb_agg(a->'id'),'[]') into protected from jsonb_array_elements(oldw->'actors') a where a->>'control'='player' or exists(select 1 from jsonb_array_elements(entities) e where e->>'kind'='player' and e->'id'=a->'entityId') or coalesce(rt#>'{configuration,controlledEntityIds}','[]') ? (a->>'entityId');
 max_threads:=case oldw#>>'{policy,autonomy}' when 'low' then 3 when 'moderate' then 8 when 'high' then 12 end;
 max_actors:=case oldw#>>'{policy,autonomy}' when 'low' then 8 when 'moderate' then 16 when 'high' then 24 end;
 perform rpg_private.assert(max_threads is not null);
 loop
  select x.th,x.st,x.idx,greatest(boundary,(x.st#>>'{trigger,atWorldMinutes}')::integer) as at into candidate from
   (select t.value th,t.value->'steps'->(t.value->>'cursor')::integer st,(t.n-1)::integer idx from jsonb_array_elements(nextw->'threads') with ordinality t(value,n) where t.value->>'status'='active') x
   where oldw#>>'{policy,simulation}'='true' and x.st#>>'{trigger,kind}' in ('autonomy','deadline') and (x.st#>>'{trigger,atWorldMinutes}')::integer<=through_minute
   and not exists(select 1 from jsonb_array_elements_text(x.th->'prerequisiteThreadIds') p where not exists(select 1 from jsonb_array_elements(nextw->'threads') done where done->>'id'=p.value and done->>'status'='resolved'))
   and ((x.st#>>'{trigger,kind}'='deadline' and (oldw#>>'{policy,deadlinePressure}'='normal' or (oldw#>>'{policy,deadlinePressure}'='critical_only' and x.st#>>'{trigger,scenarioCritical}'='true' and x.st#>>'{trigger,established}'='true')))
    or (x.st#>>'{trigger,kind}'='autonomy' and array_position(array['local','related','broad'],x.st#>>'{trigger,scope}')<=array_position(array['low','moderate','high'],oldw#>>'{policy,autonomy}')
     and (oldw#>>'{policy,deadlinePressure}'='normal' or ((x.th->>'cursor')::integer<jsonb_array_length(x.th->'steps')-1 and x.st->'hookChanges'='[]'::jsonb and x.st->>'consequence'='background'))
     and (x.st#>>'{trigger,scope}'<>'local' or x.th->'locationIds'='[]'::jsonb or x.th->'locationIds' ? current_location)))
   order by greatest(boundary,(x.st#>>'{trigger,atWorldMinutes}')::integer),x.th->>'id',x.st->>'id' limit 1;
  exit when not found;
  th:=candidate.th; st:=candidate.st; idx:=candidate.idx; at_minute:=candidate.at;
  if not seen_threads ? (th->>'id') then seen_threads:=seen_threads||jsonb_build_array(th->'id'); end if;
  select coalesce(jsonb_agg(distinct value),'[]') into seen_actors from jsonb_array_elements(seen_actors||(th->'actorIds'));
  perform rpg_private.assert(jsonb_array_length(seen_threads)<=max_threads and jsonb_array_length(seen_actors)<=max_actors and jsonb_array_length(events)+case when st->'publicOutcome'='null'::jsonb then 1 else 2 end<=8);
  perform rpg_private.assert(st->>'resolution'='deterministic' and not exists(select 1 from jsonb_array_elements_text(th->'decisionActorIds') a where protected ? a.value));
  perform rpg_private.library_evidence(r.owner_id,st->'evidence',sources);
  for evidence in select value from jsonb_array_elements(st->'evidence') loop
   perform rpg_private.assert(evidence->>'knowledge' not in ('source','future_source'));
   for actor in select value from jsonb_array_elements(oldw->'actors') a where th->'decisionActorIds' ? (a->>'id') loop perform rpg_private.assert(actor->'knowledge' @> jsonb_build_array(evidence)); end loop;
  end loop;
  if st->>'consequence'='surface_before_complete' then perform rpg_private.assert(exists(select 1 from jsonb_array_elements(oldw->'warnings') w where w->'stepId'=st->'id' and (w->>'opportunityUntilWorldMinutes')::integer<=r.current_world_minutes and (w->>'atWorldMinutes')::integer<r.current_world_minutes and exists(select 1 from jsonb_array_elements_text(w->'recipientActorIds') a where protected ? a.value))); end if;
  boundary:=at_minute; private_id:=rpg_private.world_event_id(op,th->>'id',st->>'id','private'); public_id:=rpg_private.world_event_id(op,th->>'id',st->>'id','public');
  ev:=jsonb_build_object('schemaVersion',1,'id',private_id,'campaignId',cid,'originTimelineId',r.timeline_id,'operationId',op,'worldMinutes',at_minute,'kind','world.thread.advanced','actorIds',th->'actorIds','threadIds',jsonb_build_array(th->'id'),'visibility','private','text',st->'privateText','evidence',st->'evidence','payload',jsonb_build_object('schemaVersion',1,'stepId',st->'id','previousCursor',th->'cursor','nextCursor',(th->>'cursor')::integer+1,'hookChanges',st->'hookChanges'));
  events:=events||jsonb_build_array(ev);
  if st->'publicOutcome'<>'null'::jsonb then
   perform rpg_private.library_evidence(r.owner_id,st#>'{publicOutcome,evidence}',sources,true);
   perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(st#>'{publicOutcome,evidence}') e where e->>'knowledge'<>'character'));
   ev:=jsonb_build_object('schemaVersion',1,'id',public_id,'campaignId',cid,'originTimelineId',r.timeline_id,'operationId',op,'worldMinutes',at_minute,'kind','world.observed','actorIds',st#>'{publicOutcome,actorIds}','threadIds',case when th->>'publicTitle' is null then '[]'::jsonb else jsonb_build_array(th->'id') end,'visibility','public','text',st#>'{publicOutcome,text}','evidence',st#>'{publicOutcome,evidence}','payload','{}'::jsonb);
   events:=events||jsonb_build_array(ev);
   if st->'warning'<>'null'::jsonb then
    perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(nextw->'warnings') w where w->'stepId'=st#>'{warning,forStepId}'));
    nextw:=jsonb_set(nextw,'{warnings}',(nextw->'warnings')||jsonb_build_array(jsonb_build_object('stepId',st#>'{warning,forStepId}','eventId',public_id,'atWorldMinutes',at_minute,'opportunityUntilWorldMinutes',at_minute+(st#>>'{warning,opportunityMinutes}')::integer,'recipientActorIds',st#>'{warning,recipientActorIds}')));
   end if;
  end if;
  for hc in select value from jsonb_array_elements(st->'hookChanges') loop
   select (h.n-1)::integer into hidx from jsonb_array_elements(nextw->'hooks') with ordinality h(value,n) where h.value->'id'=hc->'hookId' and h.value->>'status' not in ('resolved','expired');
   perform rpg_private.assert(hidx is not null); nextw:=jsonb_set(nextw,array['hooks',hidx::text,'status'],hc->'status');
  end loop;
  th:=th||jsonb_build_object('cursor',(th->>'cursor')::integer+1,'revision',(th->>'revision')::integer+1,'status',case when (th->>'cursor')::integer+1=jsonb_array_length(th->'steps') then 'resolved' else 'active' end);
  nextw:=jsonb_set(nextw,array['threads',idx::text],th);
 end loop;
 if events='[]'::jsonb then return 'null'::jsonb; end if;
 return jsonb_build_object('operationId',op,'campaignId',cid,'timeline',jsonb_build_object('timelineId',r.timeline_id,'epoch',1),'expectedRevision',f->'revision','expectedRuntimeRevision',rt->'revision','expectedHeadId',mid,'schemaVersion',1,'status','staged','fromWorldMinutes',r.current_world_minutes,'throughWorldMinutes',through_minute,'sourceVersionIds',sources,'events',events,'nextWorld',nextw);
end $$;

create function rpg_private.lab_commit(uid uuid,cid uuid,p jsonb) returns jsonb language plpgsql set search_path='' as $$
declare r rpg_private.world_lab_runs%rowtype; m rpg_private.timeline_manifests%rowtype; newm rpg_private.timeline_manifests%rowtype; v rpg_private.timeline_versions%rowtype; rt rpg_private.timeline_versions%rowtype; wf rpg_private.timeline_versions%rowtype; op uuid; through_minute integer; settlement jsonb; expected jsonb:='[]'; writes jsonb; e jsonb; w jsonb; refs jsonb; new_payload jsonb; metadata jsonb; seq bigint; vid uuid; mid uuid; hash text; begin
 if p->>'kind'='pause' then perform rpg_private.fields(p,array['operationId','fence','kind','reason']);
 else perform rpg_private.fields(p,array['operationId','fence','kind','throughWorldMinutes','writes','proof']); end if;
 op:=(p->>'operationId')::uuid;
 select * into r from rpg_private.world_lab_runs where id=(p#>>'{fence,runId}')::uuid and campaign_id=cid and owner_id=uid for update;
 if not found then raise exception 'rpg_not_found'; end if;
 if r.status<>'running' or rpg_private.lab_fence(r)<>p->'fence' or not rpg_private.lab_fresh(r) or r.step_count>=32 then raise exception 'rpg_conflict'; end if;
 perform 1 from rpg_private.timelines where campaign_id=cid and id=r.timeline_id and purpose='simulation' and head_manifest_id=r.head_manifest_id and head_revision=r.head_revision for update;
 if not found then raise exception 'rpg_conflict'; end if;
 perform rpg_private.lab_validate_manifest(cid,r.head_manifest_id);
 select * into strict m from rpg_private.timeline_manifests where campaign_id=cid and id=r.head_manifest_id;
 if p->>'kind'='pause' then
  perform rpg_private.assert(p->>'reason' in ('review_required','unsupported','work_limit'));
  update rpg_private.world_lab_runs set status='paused',reason=p->>'reason',revision=revision+1,lease_generation=lease_generation+1,updated_at=now() where id=r.id returning * into r;
  return jsonb_build_object('run',rpg_private.lab_run_json(r),'manifest',rpg_private.lab_manifest_json(m),'operationId',op,'committed',false);
 end if;
 perform rpg_private.assert(jsonb_typeof(p->'throughWorldMinutes')='number' and (p->>'throughWorldMinutes')::numeric=trunc((p->>'throughWorldMinutes')::numeric));
 through_minute:=(p->>'throughWorldMinutes')::integer;
 perform rpg_private.fields(p->'proof',array['schemaVersion','trigger','settlement']); perform rpg_private.assert(p#>>'{proof,schemaVersion}'='1');
 settlement:=rpg_private.lab_world_step(r,op,through_minute,p#>>'{proof,trigger}');
 perform rpg_private.assert(settlement=p#>'{proof,settlement}');
 select * into strict rt from rpg_private.timeline_versions where campaign_id=cid and table_name='rpg_private.runtime_state' and m.refs->'rpg_private.runtime_state' ? id::text;
 perform rpg_private.assert((rt.payload->>'world_minutes')::integer=r.current_world_minutes);
 if settlement<>'null'::jsonb then
  select * into strict wf from rpg_private.timeline_versions where campaign_id=cid and table_name='rpg_private.world_foundations' and m.refs->'rpg_private.world_foundations' ? id::text;
  expected:=expected||jsonb_build_array(jsonb_build_object('tableName',wf.table_name,'rowKey',wf.row_key,'expectedVersionId',wf.id,'payload',wf.payload||jsonb_build_object('world',settlement->'nextWorld','revision',(wf.payload->>'revision')::integer+1)));
 end if;
 if settlement<>'null'::jsonb or through_minute<>r.current_world_minutes then expected:=expected||jsonb_build_array(jsonb_build_object('tableName',rt.table_name,'rowKey',rt.row_key,'expectedVersionId',rt.id,'payload',rt.payload||jsonb_build_object('world_minutes',through_minute,'revision',(rt.payload->>'revision')::integer+1))); end if;
 select coalesce(max((value->>'sequence')::bigint),0) into seq from jsonb_array_elements(rpg_private.lab_rows(cid,m.id,'rpg_private.world_events'));
 for e in select value from jsonb_array_elements(coalesce(nullif(settlement,'null')->'events','[]')) loop
  perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(rpg_private.lab_rows(cid,m.id,'rpg_private.world_events')) old where old->'id'=e->'id'));
  seq:=seq+1;
  expected:=expected||jsonb_build_array(jsonb_build_object('tableName','rpg_private.world_events','rowKey',e->'id','expectedVersionId',null,'payload',jsonb_build_object('id',e->'id','campaign_id',cid,'operation_id',op,'sequence',seq,'event',e)));
 end loop;
 perform rpg_private.assert(p->'writes'=expected and p->>'kind'=case when expected='[]'::jsonb then 'noop' else 'deterministic_world' end);
 refs:=m.refs; mid:=m.id; newm:=m;
 if expected<>'[]'::jsonb then
  for w in select value from jsonb_array_elements(expected) loop
   new_payload:=w->'payload'; hash:=encode(sha256(convert_to(new_payload::text,'UTF8')),'hex');
   insert into rpg_private.timeline_versions(campaign_id,table_name,row_key,digest,payload,origin_timeline_id) values(cid,w->>'tableName',w->>'rowKey',hash,new_payload,r.timeline_id) on conflict(campaign_id,table_name,row_key,digest) do nothing;
   select id into strict vid from rpg_private.timeline_versions where campaign_id=cid and table_name=w->>'tableName' and row_key=w->>'rowKey' and digest=hash and timeline_versions.payload=new_payload;
   if w->>'expectedVersionId' is null then writes:=(refs->(w->>'tableName'))||jsonb_build_array(vid);
   else select jsonb_agg(case when value=w->'expectedVersionId' then to_jsonb(vid) else value end order by n) into writes from jsonb_array_elements(refs->(w->>'tableName')) with ordinality a(value,n); end if;
   refs:=jsonb_set(refs,array[w->>'tableName'],writes);
  end loop;
  mid:=gen_random_uuid(); metadata:=m.public_metadata||jsonb_build_object('worldMinutes',through_minute,'labOrdinal',r.head_revision+1);
  insert into rpg_private.timeline_manifests(id,campaign_id,timeline_id,refs,public_metadata,canon_generation,schema_version,lab_run_id) values(mid,cid,r.timeline_id,refs,metadata,m.canon_generation,3,r.id) returning * into newm;
  update rpg_private.timelines set head_manifest_id=mid,head_revision=head_revision+1,head_public=metadata,updated_at=now() where campaign_id=cid and id=r.timeline_id and purpose='simulation' and head_manifest_id=r.head_manifest_id and head_revision=r.head_revision;
  if not found then raise exception 'rpg_conflict'; end if;
 end if;
 update rpg_private.world_lab_runs set head_manifest_id=mid,last_checkpoint_id=mid,head_revision=head_revision+case when mid<>m.id then 1 else 0 end,step_count=step_count+case when mid<>m.id then 1 else 0 end,current_world_minutes=through_minute,revision=revision+1,
 status=case when through_minute=(input_bundle->>'throughWorldMinutes')::integer then 'completed' when step_count+case when mid<>m.id then 1 else 0 end>=32 then 'paused' else 'running' end,
 reason=case when through_minute<>(input_bundle->>'throughWorldMinutes')::integer and step_count+case when mid<>m.id then 1 else 0 end>=32 then 'work_limit' else null end,updated_at=now() where id=r.id returning * into r;
 return jsonb_build_object('run',rpg_private.lab_run_json(r),'manifest',rpg_private.lab_manifest_json(newm),'operationId',op,'committed',mid<>m.id);
end $$;
create function rpg_private.lab_read_run(r rpg_private.world_lab_runs) returns jsonb language plpgsql stable set search_path='' as $$
declare library jsonb:=rpg_private.lab_run_library(r); checkpoints jsonb; base jsonb; scenario jsonb; sc jsonb; dv jsonb; begin
 select jsonb_build_object('saveId',s.id,'timelineId',s.timeline_id,'label',s.name,'worldMinutes',(s.public_metadata->>'worldMinutes')::integer) into strict base from rpg_private.save_points s where s.campaign_id=r.campaign_id and s.id=(r.input_bundle#>>'{base,saveId}')::uuid;
 sc:=rpg_private.library_ref(r.owner_id,r.input_bundle->>'scenarioVersionId','scenario'); dv:=rpg_private.library_ref(r.owner_id,r.input_bundle->>'divergenceVersionId','divergence');
 scenario:=jsonb_build_object('scenarioVersionId',sc->'versionId','divergenceVersionId',dv->'versionId','scenarioTitle',sc#>'{body,title}','divergenceTitle',dv#>'{body,title}',
 'assumptions',(select coalesce(jsonb_agg(a.value->'text' order by a.n),'[]') from jsonb_array_elements(sc#>'{body,assumptions}') with ordinality a(value,n) where a.value->>'visibility'='public'),
 'changes',(select coalesce(jsonb_agg(a.value->'text' order by a.n),'[]') from jsonb_array_elements(dv#>'{body,changes}') with ordinality a(value,n) where a.value->>'visibility'='public'));
 select coalesce(jsonb_agg(jsonb_set(rpg_private.lab_read_state(r.owner_id,r.campaign_id,m.id,r.id,library,r.input_bundle->'documentVersions'),'{run}',rpg_private.lab_run_json(r)) order by (m.public_metadata->>'labOrdinal')::integer),'[]') into checkpoints from rpg_private.timeline_manifests m where m.campaign_id=r.campaign_id and m.timeline_id=r.timeline_id and m.lab_run_id=r.id and (m.public_metadata->>'labOrdinal')::integer<=r.head_revision;
 return jsonb_build_object('run',rpg_private.lab_run_json(r),'base',base,'scenario',scenario,'checkpoints',checkpoints,'applicable',rpg_private.lab_fresh(r));
end $$;

-- Re-project an immutable operation outcome with today's visibility restrictions.
-- This preserves its exact checkpoint without granting its old lease new power.
create function rpg_private.lab_result_view(uid uuid,cid uuid,action text,req jsonb) returns jsonb language plpgsql stable set search_path='' as $$
declare saved rpg_private.world_lab_commands%rowtype; committed rpg_private.world_lab_commands%rowtype; r rpg_private.world_lab_runs%rowtype; outcome jsonb; begin
 perform rpg_private.assert(action in ('prepare','continue','pause','cancel','resume'));
 select * into saved from rpg_private.world_lab_commands where operation_id=(req->>'operationId')::uuid and stage=case when action='continue' then 'claim' else action end;
 if not found then raise exception 'rpg_not_found'; end if;
 if saved.owner_id<>uid or saved.campaign_id<>cid or (case when action='prepare' then saved.request->'request' else saved.request end)<>req then raise exception 'rpg_conflict'; end if;
 if action='continue' then
  select * into committed from rpg_private.world_lab_commands where operation_id=saved.operation_id and stage='commit' and run_id=saved.run_id and campaign_id=cid and owner_id=uid;
  if not found then raise exception 'rpg_conflict'; end if; outcome:=committed.result->'run';
 else outcome:=saved.result; end if;
 select * into strict r from rpg_private.world_lab_runs where id=saved.run_id and campaign_id=cid and owner_id=uid;
 perform rpg_private.assert(outcome->>'inputDigest'=r.input_digest and outcome->'input'=r.input_bundle and outcome->>'id'=r.id::text and outcome->>'timelineId'=r.timeline_id::text);
 r.status:=outcome->>'status'; r.reason:=outcome->>'reason'; r.revision:=(outcome->>'revision')::integer; r.lease_generation:=(outcome->>'leaseGeneration')::integer; r.head_revision:=(outcome->>'headRevision')::integer;
 r.head_manifest_id:=(outcome->>'headManifestId')::uuid; r.last_checkpoint_id:=(outcome->>'lastCheckpointId')::uuid; r.current_world_minutes:=(outcome->>'currentWorldMinutes')::integer;
 return rpg_private.lab_read_run(r);
end $$;

-- Only the service role can use this private-data RPC. The normal browser route
-- validates selection-only requests and projects a separate public allowlist.
create function public.rpg_world_lab(p_owner_id uuid,p_campaign_id uuid,p_action text,p_payload jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_column
declare uid uuid:=p_owner_id; cid uuid:=p_campaign_id; req jsonb; ctx jsonb; input jsonb; result jsonb; r rpg_private.world_lab_runs%rowtype; receipt rpg_private.world_lab_commands%rowtype; base rpg_private.timeline_manifests%rowtype; m rpg_private.timeline_manifests%rowtype; op uuid; rid uuid; tid uuid; mid uuid; status_value text; reason_value text; library jsonb; bases jsonb; scenarios jsonb; runs jsonb; begin
 if uid is null or not exists(select 1 from rpg_private.owner_registry where user_id=uid) then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 if not exists(select 1 from public.rpg_campaigns where id=cid) then raise exception 'rpg_not_found'; end if;
 perform rpg_private.assert(jsonb_typeof(p_payload)='object' and length(p_payload::text)<=2000000);
 if p_action='read_result' then
  perform rpg_private.fields(p_payload,array['action','request']);
  return rpg_private.lab_result_view(uid,cid,p_payload->>'action',p_payload->'request');
 elsif p_action='read' and p_payload ? 'operationId' then
  perform rpg_private.fields(p_payload,array['operationId','request']);
  if p_payload->'request' ? 'runId' then
   select * into receipt from rpg_private.world_lab_commands where operation_id=(p_payload->>'operationId')::uuid and stage='claim';
   if not found then return 'null'::jsonb; end if;
   if receipt.owner_id<>uid or receipt.campaign_id<>cid or receipt.request<>p_payload->'request' then raise exception 'rpg_conflict'; end if;
   return jsonb_build_object('claim',receipt.result,'commit',(select c.result from rpg_private.world_lab_commands c where c.operation_id=receipt.operation_id and c.stage='commit' and c.run_id=receipt.run_id and c.owner_id=uid and c.campaign_id=cid));
  end if;
  select * into receipt from rpg_private.world_lab_commands where operation_id=(p_payload->>'operationId')::uuid and stage='prepare';
  if not found then return 'null'::jsonb; end if;
  if receipt.owner_id<>uid or receipt.campaign_id<>cid or receipt.request->'request'<>p_payload->'request' then raise exception 'rpg_conflict'; end if;
  return receipt.result;
 elsif p_action='read_detached' then
  if p_payload ? 'saveId' then
   perform rpg_private.fields(p_payload,array['saveId','scenarioVersionId','divergenceVersionId']);
   return rpg_private.lab_preparation(uid,cid,(p_payload->>'saveId')::uuid,(p_payload->>'scenarioVersionId')::uuid,(p_payload->>'divergenceVersionId')::uuid);
  end if;
  perform rpg_private.fields(p_payload,array['runId'],array['manifestId']);
  select * into r from rpg_private.world_lab_runs where id=(p_payload->>'runId')::uuid and owner_id=uid and campaign_id=cid;
  if not found then raise exception 'rpg_not_found'; end if;
  r:=rpg_private.lab_refresh(r.id); mid:=coalesce((p_payload->>'manifestId')::uuid,r.head_manifest_id);
  return rpg_private.lab_read_state(uid,cid,mid,r.id,rpg_private.lab_run_library(r),r.input_bundle->'documentVersions');
 elsif p_action='read' then
  perform rpg_private.fields(p_payload,array['runId']);
  select * into r from rpg_private.world_lab_runs where id=(p_payload->>'runId')::uuid and owner_id=uid and campaign_id=cid;
  if not found then raise exception 'rpg_not_found'; end if;
  return rpg_private.lab_read_run(rpg_private.lab_refresh(r.id));
 elsif p_action='catalog' then
  perform rpg_private.fields(p_payload,'{}');
  select coalesce(jsonb_agg(jsonb_build_object('saveId',s.id,'timelineId',s.timeline_id,'label',s.name,'worldMinutes',(s.public_metadata->>'worldMinutes')::integer) order by s.created_at desc),'[]') into bases from
   (select s.* from rpg_private.save_points s join rpg_private.timeline_manifests m on m.campaign_id=s.campaign_id and m.id=s.manifest_id join rpg_private.timelines t on t.campaign_id=s.campaign_id and t.id=s.timeline_id where s.campaign_id=cid and t.purpose='playable' and m.schema_version=2 and m.lab_run_id is null and m.canon_generation=(select canon_generation from rpg_private.timeline_campaigns where campaign_id=cid) and m.public_metadata->'pendingAction'='false'::jsonb and rpg_private.lab_rows(cid,m.id,'rpg_private.world_foundations')->0->'world'<>'null'::jsonb order by s.created_at desc limit 100) s;
  select coalesce(jsonb_agg(jsonb_build_object('scenario',rpg_private.library_record_json(sc),'divergence',rpg_private.library_record_json(dv)) order by dv.created_at desc),'[]') into scenarios from rpg_private.library_records sc join rpg_private.library_records dv on dv.owner_id=sc.owner_id and dv.kind='divergence' and dv.body->>'scenarioVersionId'=sc.version_id::text where sc.owner_id=uid and sc.kind='scenario' and sc.body->>'status'='approved' and sc.body#>>'{approval,ownerId}'=uid::text and dv.body#>>'{approval,ownerId}'=uid::text;
  runs:='[]'; for rid in select id from rpg_private.world_lab_runs where campaign_id=cid and owner_id=uid order by created_at desc limit 100 loop runs:=runs||jsonb_build_array(rpg_private.lab_read_run(rpg_private.lab_refresh(rid))); end loop;
  return jsonb_build_object('campaignId',cid,'bases',bases,'scenarios',scenarios,'runs',runs);
 end if;
 perform rpg_private.assert(p_action in ('prepare','claim','pause','cancel','resume','commit'));
 req:=case when p_action='prepare' then p_payload->'request' else p_payload end;
 op:=(req->>'operationId')::uuid; perform rpg_private.assert(op is not null);
 -- Serialize only this operation. Different detached branches do not depend on
 -- the active campaign epoch; locking the source-generation row never edits it.
 perform pg_advisory_xact_lock(hashtextextended(op::text,0));
 select * into receipt from rpg_private.world_lab_commands where operation_id=op and stage=p_action;
 if found then
  if receipt.owner_id<>uid or receipt.campaign_id<>cid or receipt.request<>p_payload then raise exception 'rpg_conflict'; end if;
  return receipt.result;
 end if;
 perform rpg_private.assert(not exists(select 1 from rpg_private.world_lab_commands where operation_id=op and (owner_id<>uid or campaign_id<>cid or (stage not in ('claim','commit') or p_action not in ('claim','commit')))));
 -- Source append takes the owner-registry row FOR UPDATE. This shared lock
 -- fences even a source no longer bound in the currently active projection.
 perform 1 from rpg_private.owner_registry where user_id=uid for share;
 perform 1 from rpg_private.timeline_campaigns where campaign_id=cid for share;
 if p_action='prepare' then
  perform rpg_private.fields(p_payload,array['request','input','inputDigest']);
  ctx:=rpg_private.lab_preparation(uid,cid,(req->>'saveId')::uuid,(req->>'scenarioVersionId')::uuid,(req->>'divergenceVersionId')::uuid);
  input:=rpg_private.lab_input(uid,cid,req,ctx);
  perform rpg_private.assert(input=p_payload->'input' and rpg_private.lab_digest(input)=p_payload->>'inputDigest');
  select * into strict base from rpg_private.timeline_manifests where campaign_id=cid and id=(input#>>'{base,manifestId}')::uuid;
  rid:=gen_random_uuid(); tid:=gen_random_uuid(); mid:=gen_random_uuid();
  insert into rpg_private.timelines(id,campaign_id,label,parent_timeline_id,fork_save_id,purpose) values(tid,cid,req->>'label',base.timeline_id,(req->>'saveId')::uuid,'simulation');
  insert into rpg_private.world_lab_runs(id,campaign_id,owner_id,timeline_id,label,input_bundle,input_digest,status,head_manifest_id,last_checkpoint_id,current_world_minutes) values(rid,cid,uid,tid,req->>'label',input,p_payload->>'inputDigest','prepared',mid,mid,(input->>'startWorldMinutes')::integer) returning * into r;
  insert into rpg_private.timeline_manifests(id,campaign_id,timeline_id,refs,public_metadata,canon_generation,schema_version,lab_run_id) values(mid,cid,tid,base.refs,base.public_metadata||jsonb_build_object('labOrdinal',0),base.canon_generation,3,rid);
  update rpg_private.timelines set head_manifest_id=mid,head_public=base.public_metadata,head_revision=0 where campaign_id=cid and id=tid;
  result:=rpg_private.lab_run_json(r);
 elsif p_action='commit' then
  perform rpg_private.assert(not exists(select 1 from rpg_private.world_lab_commands where operation_id=op and stage='claim' and run_id::text is distinct from p_payload#>>'{fence,runId}'));
  result:=rpg_private.lab_commit(uid,cid,p_payload); rid:=(result#>>'{run,id}')::uuid;
 else
  perform rpg_private.fields(req,array['operationId','campaignId','runId','expectedRevision']);
  perform rpg_private.assert(req->>'campaignId'=cid::text);
  perform rpg_private.assert(jsonb_typeof(req->'expectedRevision')='number' and (req->>'expectedRevision')::numeric=trunc((req->>'expectedRevision')::numeric) and (req->>'expectedRevision')::numeric between 1 and 2147483646);
  select * into r from rpg_private.world_lab_runs where id=(req->>'runId')::uuid and campaign_id=cid and owner_id=uid for update;
  if not found then raise exception 'rpg_not_found'; end if;
  if r.revision<>(req->>'expectedRevision')::integer or r.status in ('completed','cancelled') then raise exception 'rpg_conflict'; end if;
  if p_action in ('claim','resume') and not rpg_private.lab_fresh(r) then raise exception 'rpg_conflict'; end if;
  if p_action='claim' then perform rpg_private.assert(r.status in ('prepared','running')); status_value:='running';
  elsif p_action='resume' then perform rpg_private.assert(r.status in ('paused','failed','running') and r.step_count<32 and r.current_world_minutes<(r.input_bundle->>'throughWorldMinutes')::integer); status_value:='running';
  elsif p_action='pause' then perform rpg_private.assert(r.status in ('prepared','running')); status_value:='paused'; reason_value:='review_required';
  else status_value:='cancelled'; reason_value:='cancelled'; end if;
  update rpg_private.world_lab_runs set status=status_value,reason=reason_value,revision=revision+1,lease_generation=lease_generation+1,updated_at=now() where id=r.id returning * into r;
  rid:=r.id; result:=rpg_private.lab_run_json(r);
 end if;
 insert into rpg_private.world_lab_commands(operation_id,stage,owner_id,campaign_id,run_id,request,result) values(op,p_action,uid,cid,rid,p_payload,result);
 return result;
end $$;

revoke all on all tables in schema rpg_private from public,anon,authenticated;
revoke all on all functions in schema rpg_private from public,anon,authenticated;
revoke all on function public.rpg_world_lab(uuid,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.rpg_world_lab(uuid,uuid,text,jsonb) to service_role;
commit;
