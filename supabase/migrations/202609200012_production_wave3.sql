-- Wave 3: additive owner-authored advisory documents, bounded compiler/World extensions.
-- Verify only on disposable databases during this sprint. No owner data or model calls.
begin;

alter table public.rpg_documents add column purpose text not null default 'standard'
  check(purpose in ('standard','campaign_premise'));
alter table public.rpg_documents add constraint premise_reference_only
  check(purpose<>'campaign_premise' or status='reference');
create unique index one_campaign_premise on public.rpg_documents(campaign_id) where purpose='campaign_premise';
alter table public.rpg_document_versions add column premise_metadata jsonb;

create table rpg_private.premise_commands (
  id uuid primary key, campaign_id uuid not null references public.rpg_campaigns(id),
  owner_id uuid not null references auth.users(id), request jsonb not null, result jsonb not null,
  created_at timestamptz not null default now()
);
create trigger immutable_premise_commands before update or delete on rpg_private.premise_commands
  for each row execute function rpg_private.immutable_history();

create function rpg_private.premise_version(v public.rpg_document_versions) returns jsonb
language sql stable set search_path='' as $$
 select jsonb_build_object('id',v.id,'documentId',v.document_id,'version',v.version,'text',v.body,
 'language',v.premise_metadata->'language','reviewStatus',v.premise_metadata->'reviewStatus',
 'authoredBy',v.premise_metadata->'authoredBy','digest',v.premise_metadata->'digest',
 'previousVersionId',v.premise_metadata->'previousVersionId','restoredFromVersionId',v.restored_from,'createdAt',v.created_at);
$$;
create function rpg_private.premise_read(cid uuid,before_version integer default null) returns jsonb
language plpgsql stable set search_path='' as $$
declare doc public.rpg_documents%rowtype; versions jsonb; oldest integer; more boolean;
begin
 select * into doc from public.rpg_documents where campaign_id=cid and purpose='campaign_premise';
 select coalesce(jsonb_agg(rpg_private.premise_version(v) order by v.version desc),'[]'),min(v.version)
 into versions,oldest from (select * from public.rpg_document_versions where campaign_id=cid and document_id=doc.id
   and (before_version is null or version<before_version) order by version desc limit 32) v;
 more:=exists(select 1 from public.rpg_document_versions where campaign_id=cid and document_id=doc.id and version<oldest);
 return jsonb_build_object('schemaVersion',1,'campaignId',cid,'timeline',rpg_private.timeline_fence(cid),
 'revision',coalesce(doc.revision,0),'current',(select rpg_private.premise_version(v) from public.rpg_document_versions v
 where campaign_id=cid and document_id=doc.id and id=doc.current_version_id),'versions',versions,
 'olderThan',case when more then oldest else null end);
end $$;

create function rpg_private.premise_write(cid uuid,uid uuid,body_text text,lang text,review_status text,
 expected_revision integer,restored_from_id uuid default null) returns void language plpgsql set search_path='' as $$
declare doc public.rpg_documents%rowtype; did uuid; vid uuid:=gen_random_uuid(); rev integer; meta jsonb;
begin
 perform rpg_private.assert(length(btrim(body_text)) between 1 and 20000 and lang in ('en','ru') and review_status in ('draft','reviewed'));
 select * into doc from public.rpg_documents where campaign_id=cid and purpose='campaign_premise' for update;
 if coalesce(doc.revision,0)<>expected_revision then raise exception 'rpg_conflict'; end if;
 did:=coalesce(doc.id,gen_random_uuid()); rev:=coalesce(doc.revision,0)+1;
 meta:=jsonb_build_object('schemaVersion',1,'kind','owner_authored','purpose','campaign_premise','language',lang,
   'authoredBy',uid,'reviewStatus',review_status,'digest',encode(sha256(convert_to(body_text,'UTF8')),'hex'),
   'previousVersionId',doc.current_version_id);
 insert into public.rpg_documents(id,campaign_id,title,status,body,current_version_id,revision,purpose)
 values(did,cid,'Campaign premise','reference',body_text,vid,rev,'campaign_premise')
 on conflict(id) do update set body=excluded.body,current_version_id=excluded.current_version_id,revision=excluded.revision,updated_at=now();
 insert into public.rpg_document_versions(id,campaign_id,document_id,version,title,status,body,restored_from,premise_metadata)
 values(vid,cid,did,rev,'Campaign premise','reference',body_text,restored_from_id,meta);
end $$;

create function public.rpg_campaign_premise(p_campaign_id uuid,p_action text,p_payload jsonb default '{}',p_timeline jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); op uuid; req jsonb; receipt rpg_private.premise_commands%rowtype;
 doc public.rpg_documents%rowtype; source public.rpg_document_versions%rowtype; result jsonb; before_version integer;
begin
 if uid is null or not public.rpg_is_owner() then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id for update; if not found then raise exception 'rpg_not_found'; end if;
 perform rpg_private.timeline_assert(p_campaign_id,p_timeline,p_action<>'read');
 if p_action='read' then
   perform rpg_private.fields(p_payload,array['before']);
   before_version:=(p_payload->>'before')::integer;
   perform rpg_private.assert(p_payload->'before'='null'::jsonb or (jsonb_typeof(p_payload->'before')='number' and before_version>0));
   return rpg_private.premise_read(p_campaign_id,before_version);
 end if;
 perform rpg_private.assert(p_action in ('save','review','restore') and p_payload->>'action'=p_action);
 perform rpg_private.fields(p_payload,array['operationId','timeline','expectedRevision','action'] ||
   case p_action when 'save' then array['text','language'] when 'restore' then array['versionId'] else array[]::text[] end);
 perform rpg_private.assert(p_payload->'timeline'=p_timeline and jsonb_typeof(p_payload->'expectedRevision')='number'
   and (p_payload->>'expectedRevision')::integer>=0);
 op:=(p_payload->>'operationId')::uuid; perform rpg_private.assert(op is not null);
 req:=jsonb_build_object('campaignId',p_campaign_id,'input',p_payload);
 perform pg_advisory_xact_lock(hashtextextended(op::text,0));
 select * into receipt from rpg_private.premise_commands where id=op;
 if found then
   if receipt.owner_id<>uid or receipt.campaign_id<>p_campaign_id or receipt.request<>req then raise exception 'rpg_conflict'; end if;
   return receipt.result;
 end if;
 if exists(select 1 from rpg_private.turns where campaign_id=p_campaign_id and status not in ('committed','cancelled')) then raise exception 'rpg_conflict'; end if;
 select * into doc from public.rpg_documents where campaign_id=p_campaign_id and purpose='campaign_premise';
 if p_action='save' then
   perform rpg_private.assert(jsonb_typeof(p_payload->'text')='string' and jsonb_typeof(p_payload->'language')='string');
   perform rpg_private.premise_write(p_campaign_id,uid,p_payload->>'text',p_payload->>'language','draft',(p_payload->>'expectedRevision')::integer);
 else
   select * into source from public.rpg_document_versions where campaign_id=p_campaign_id and document_id=doc.id
     and id=case p_action when 'review' then doc.current_version_id else (p_payload->>'versionId')::uuid end;
   if not found then raise exception 'rpg_not_found'; end if;
   perform rpg_private.premise_write(p_campaign_id,uid,source.body,source.premise_metadata->>'language',
     case p_action when 'review' then 'reviewed' else 'draft' end,(p_payload->>'expectedRevision')::integer,
     case p_action when 'restore' then source.id else null end);
 end if;
 result:=rpg_private.premise_read(p_campaign_id);
 insert into rpg_private.premise_commands(id,campaign_id,owner_id,request,result) values(op,p_campaign_id,uid,req,result);
 return result;
end $$;

-- Keep this advisory document out of ordinary record editing, runtime and Memory.
-- Existing explicit snapshot projections and immutable version/history remain in use.
do $$ declare d text; changed text; begin
 d:=pg_get_functiondef('rpg_private.apply_base_mutation(uuid,text,uuid,integer,jsonb)'::regprocedure);
 changed:=replace(d,'perform rpg_private.fields(p_payload,array[''title'',''subtitle'',''language'']);',
 'perform rpg_private.fields(p_payload,array[''title'',''subtitle'',''language''],array[''premise'']);');
 changed:=replace(changed,'insert into public.rpg_public_state(campaign_id,summary,revision) values(cid,'''',1);',
 'insert into public.rpg_public_state(campaign_id,summary,revision) values(cid,'''',1);
    if p_payload ? ''premise'' then
      perform rpg_private.fields(p_payload->''premise'',array[''text'',''language'']);
      perform rpg_private.assert(jsonb_typeof(p_payload#>''{premise,text}'')=''string'' and jsonb_typeof(p_payload#>''{premise,language}'')=''string'');
      perform rpg_private.premise_write(cid,uid,p_payload#>>''{premise,text}'',p_payload#>>''{premise,language}'',''draft'',0);
    end if;');
 changed:=replace(changed,'elsif p_operation in (''document.save'',''document.restore'') then',
 'elsif p_operation in (''document.save'',''document.restore'') then
    if exists(select 1 from public.rpg_documents where campaign_id=cid and id=(p_payload->>''id'')::uuid and purpose=''campaign_premise'') then raise exception ''rpg_validation''; end if;');
 perform rpg_private.assert(changed<>d and position('premise_write' in changed)>0 and position('purpose=''campaign_premise''' in changed)>0); execute changed;
 d:=pg_get_functiondef('rpg_private.runtime_source(uuid,uuid,text)'::regprocedure);
 changed:=replace(d,'from public.rpg_documents where campaign_id=cid)',
 'from public.rpg_documents where campaign_id=cid and purpose=''standard'')');
 perform rpg_private.assert(changed<>d); execute changed;
 d:=pg_get_functiondef('rpg_private.memory_record_source()'::regprocedure);
 d:=replace(d,chr(13),'');
 changed:=replace(d,'BEGIN'||chr(10), 'begin'||chr(10)||' if tg_table_name=''rpg_documents'' and row->>''purpose''=''campaign_premise'' then return new; end if;'||chr(10));
 perform rpg_private.assert(changed<>d); execute changed;
 d:=pg_get_functiondef('rpg_private.runtime_revision()'::regprocedure);
 d:=replace(d,chr(13),'');
 changed:=replace(d,'BEGIN'||chr(10), 'begin'||chr(10)||' if tg_table_name=''rpg_documents'' and coalesce(to_jsonb(new),to_jsonb(old))->>''purpose''=''campaign_premise'' then return coalesce(new,old); end if;'||chr(10));
 perform rpg_private.assert(changed<>d); execute changed;
 d:=pg_get_functiondef('rpg_private.timeline_activate_before_wave1(uuid,uuid,uuid)'::regprocedure);
 changed:=replace(d,'from public.rpg_documents d where campaign_id=cid and status<>''archived''',
 'from public.rpg_documents d where campaign_id=cid and purpose=''standard'' and status<>''archived''');
 perform rpg_private.assert(changed<>d); execute changed;
end $$;

revoke all on all tables in schema rpg_private from public,anon,authenticated;
revoke all on all functions in schema rpg_private from public,anon,authenticated;
revoke all on function public.rpg_campaign_premise(uuid,text,jsonb,jsonb) from public,anon;
grant execute on function public.rpg_campaign_premise(uuid,text,jsonb,jsonb) to authenticated;
commit;
