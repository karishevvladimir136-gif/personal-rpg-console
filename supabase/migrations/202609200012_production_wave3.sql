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

-- Assisted compilation retains the existing Library authority and job lifecycle.
create function rpg_private.wave3_library_id(seed text) returns uuid language sql immutable set search_path='' as $$
 select overlay(overlay(substr(encode(sha256(convert_to(seed,'UTF8')),'hex'),1,32) placing '5' from 13 for 1) placing 'a' from 17 for 1)::uuid;
$$;
create function rpg_private.wave3_compiler_result(v jsonb,profile jsonb) returns void language plpgsql immutable set search_path='' as $$
#variable_conflict use_column
declare p jsonb; e jsonb; c jsonb; x jsonb; k text;
begin
 perform rpg_private.fields(v,array['proposal','usage']);
 perform rpg_private.fields(v->'usage',array['model','inputTokens','outputTokens','calls','latencyMs']);
 perform rpg_private.assert(v#>'{usage,calls}'='1' and (v#>>'{usage,model}'=profile->>'modelId' or
  v#>>'{usage,model}' ~ ('^'||(profile->>'modelId')||'-[0-9]{4}-[0-9]{2}-[0-9]{2}$')));
 foreach k in array array['inputTokens','outputTokens','latencyMs'] loop
  perform rpg_private.assert(jsonb_typeof(v->'usage'->k)='number' and v->'usage'->>k ~ '^[0-9]{1,7}$'
    and (v->'usage'->>k)::integer between 0 and case k when 'latencyMs' then 3600000 else 2000000 end);
 end loop;
 p:=v->'proposal';
 perform rpg_private.fields(p,array['schemaVersion','title','entities','candidates','contradictions','unknowns','coverage']);
 perform rpg_private.assert(p->'schemaVersion'='1' and octet_length(p::text)<=200000 and length(btrim(p->>'title')) between 1 and 240);
 foreach k in array array['entities','candidates','contradictions','unknowns','coverage'] loop
  perform rpg_private.assert(jsonb_typeof(p->k)='array' and jsonb_array_length(p->k)<=case k when 'entities' then 48 when 'candidates' then 96 when 'coverage' then 8 else 24 end);
 end loop;
 for e in select value from jsonb_array_elements(p->'entities') loop
  perform rpg_private.fields(e,array['key','name','kind','aliases','evidenceIndexes']);
  perform rpg_private.assert(e->>'key' ~ '^[a-zA-Z0-9_-]{1,48}$' and length(btrim(e->>'name')) between 1 and 240
    and e->>'kind' in ('person','group','faction','location','object','institution') and jsonb_array_length(e->'aliases')<=12);
 end loop;
 for c in select value from jsonb_array_elements(p->'candidates') loop
  perform rpg_private.fields(c,array['key','subjectKey','kind','predicate','text','basis','epistemic','evidenceIndexes','uncertainty','objectKey','position']);
  perform rpg_private.assert(c->>'key' ~ '^[a-zA-Z0-9_-]{1,48}$' and length(btrim(c->>'text')) between 1 and 2000 and length(btrim(c->>'predicate')) between 1 and 100
    and c->>'basis' in ('quote','inference','assumption') and c->>'epistemic' in ('fact','rumor','lie','hypothesis','intention','unknown')
    and c->>'kind' in ('description','premise','relationship','geography','timeline','rule')
    and (c->>'kind' in ('relationship','geography'))=(c->>'objectKey' is not null)
    and (c->>'kind'='timeline')=(c->>'position' is not null)
    and exists(select 1 from jsonb_array_elements(p->'entities') x where x->>'key'=c->>'subjectKey')
    and (c->>'objectKey' is null or exists(select 1 from jsonb_array_elements(p->'entities') x where x->>'key'=c->>'objectKey'))
    and (c->>'basis'='quote' or c->>'uncertainty' is not null));
 end loop;
 for e in select value from jsonb_array_elements((p->'entities')||(p->'candidates')) loop
  perform rpg_private.assert(jsonb_typeof(e->'evidenceIndexes')='array' and jsonb_array_length(e->'evidenceIndexes') between 1 and 32
    and (select count(*)=count(distinct value) from jsonb_array_elements(e->'evidenceIndexes')));
  for x in select value from jsonb_array_elements(e->'evidenceIndexes') loop
    perform rpg_private.assert(jsonb_typeof(x)='number' and x#>>'{}' ~ '^[0-9]{1,3}$' and (x#>>'{}')::integer<160);
  end loop;
 end loop;
 for c in select value from jsonb_array_elements(p->'contradictions') loop
  perform rpg_private.fields(c,array['key','candidateKeys']);
  perform rpg_private.assert(c->>'key' ~ '^[a-zA-Z0-9_-]{1,48}$' and jsonb_array_length(c->'candidateKeys') between 2 and 12
   and (select count(*)=count(distinct value) from jsonb_array_elements(c->'candidateKeys')));
  for k in select jsonb_array_elements_text(c->'candidateKeys') loop
    perform rpg_private.assert(exists(select 1 from jsonb_array_elements(p->'candidates') x where x->>'key'=k));
  end loop;
 end loop;
 for e in select value from jsonb_array_elements(p->'unknowns') loop
  perform rpg_private.fields(e,array['key','question','entityKey']);
  perform rpg_private.assert(e->>'key' ~ '^[a-zA-Z0-9_-]{1,48}$' and length(btrim(e->>'question')) between 1 and 240
   and (e->>'entityKey' is null or exists(select 1 from jsonb_array_elements(p->'entities') x where x->>'key'=e->>'entityKey')));
 end loop;
 foreach k in array array['entities','candidates','contradictions','unknowns'] loop
  perform rpg_private.assert((select count(*)=count(distinct value->>'key') from jsonb_array_elements(p->k)));
 end loop;
end $$;

-- Reconstruct the bounded extraction independently for first draft publication.
-- UTF-16 offsets match the preserved JS originals, including astral characters.
create function rpg_private.wave3_utf16_length(s text) returns integer language sql immutable set search_path='' as $$
 select coalesce(sum(case when ascii(ch)>65535 then 2 else 1 end),0)::integer from regexp_split_to_table(s,'') ch;
$$;
create function rpg_private.wave3_compiler_passages(uid uuid,job jsonb) returns jsonb language plpgsql stable set search_path='' as $$
declare source jsonb; version_id text; part text; remaining integer:=(job#>>'{budget,maxUnits}')::integer/3;
 pos integer; units integer; total integer; eligible integer; processed integer; gaps jsonb; evidence jsonb:='[]'; coverage jsonb:='[]';
 trim_chars text:=' '||chr(9)||chr(10)||chr(11)||chr(12)||chr(13)||chr(160)||chr(5760)||chr(8192)||chr(8193)||chr(8194)||chr(8195)||chr(8196)||chr(8197)||chr(8198)||chr(8199)||chr(8200)||chr(8201)||chr(8202)||chr(8232)||chr(8233)||chr(8239)||chr(8287)||chr(12288)||chr(65279);
begin
 for version_id in select jsonb_array_elements_text(job->'sourcePriority') loop
  source:=rpg_private.library_ref(uid,version_id,'source');
  perform rpg_private.assert(source#>>'{body,format}' in ('txt','md') and source#>>'{body,original,kind}'='text');
  pos:=0;total:=0;eligible:=0;processed:=0;gaps:='[]';
  for part in select (regexp_matches(source#>>'{body,original,text}',E'([^\\r\\n]+|[\\r\\n])','g'))[1] loop
   units:=rpg_private.wave3_utf16_length(part);
   if length(btrim(part,trim_chars))>0 then
    total:=total+1;
    if units<=4000 then
     eligible:=eligible+1;
     if remaining>0 then
      evidence:=evidence||jsonb_build_array(jsonb_build_object('excerpt',part,'authored',(source->'body') ? 'provenance','locator',
       jsonb_build_object('ownerId',uid,'sourceId',source->'id','sourceVersionId',version_id,'locator',jsonb_build_object('kind','text','value',pos||':'||(pos+units)),
        'digest',encode(sha256(convert_to(part,'UTF8')),'hex'),'visibility',source#>'{body,visibility}','knowledge',coalesce(source#>'{body,knowledge}','"source"'))));
      remaining:=remaining-1;processed:=processed+1;
     end if;
    end if;
   end if;
   pos:=pos+units;
  end loop;
  if eligible<>total then gaps:=gaps||'"Lines longer than 4,000 characters were preserved but not indexed."'::jsonb; end if;
  if processed<>eligible then gaps:=gaps||'"The explicit passage budget ended; remaining lines are preserved for another compilation."'::jsonb; end if;
  coverage:=coverage||jsonb_build_array(jsonb_build_object('sourceVersionId',version_id,'status',case when processed=total then 'complete' when processed>0 then 'partial' else 'unprocessed' end,'processedUnits',processed,'totalUnits',total,'gaps',gaps));
 end loop;
 return jsonb_build_object('evidence',evidence,'coverage',coverage);
end $$;

create function rpg_private.wave3_library_guard() returns trigger language plpgsql set search_path='' as $$
declare b jsonb:=new.body; old rpg_private.library_records; job rpg_private.library_records; src rpg_private.library_records;
 a jsonb; prev jsonb; profile jsonb; r jsonb; e jsonb; claim jsonb; cp jsonb; n integer; units integer; k text; v text; base jsonb; proposal jsonb; prefix text;
 extraction jsonb; evidence jsonb; cited jsonb; locator jsonb; authored boolean; quoted boolean; visibility text; knowledge text; structure jsonb; origin text;
 original_coverage jsonb; coverage jsonb:='[]'; gaps jsonb; considered jsonb:='[]'; unknowns jsonb; contradictions jsonb;
begin
 select * into old from rpg_private.library_records where owner_id=new.owner_id and kind=new.kind and id=new.id order by version desc limit 1;
 if new.kind='source' then
  if b ? 'provenance' then
   perform rpg_private.fields(b->'provenance',array['kind','method','language','authoredBy']);
   perform rpg_private.assert(b#>>'{provenance,kind}'='owner_authored' and b#>>'{provenance,method}'='describe'
    and b#>>'{provenance,language}' in ('en','ru') and b#>>'{provenance,authoredBy}'=new.owner_id::text
    and b#>>'{original,kind}'='text' and b->>'format'='txt');
  end if;
  if old.id is not null then
   perform rpg_private.assert((b ? 'provenance')=(old.body ? 'provenance'));
   if b ? 'provenance' then perform rpg_private.assert(((b->'provenance')-'language')=((old.body->'provenance')-'language')); end if;
  end if;
 elsif new.kind='compiler_job' and b ? 'assistance' then
  perform rpg_private.fields(b,array['schemaVersion','targetPackId','sourceVersionIds','sourcePriority','inputDigest','status','budget','checkpoints','errorCode','assistance']);
  a:=b->'assistance'; prev:=old.body->'assistance'; profile:=a->'executionProfile';
  perform rpg_private.fields(a,array['schemaVersion','executionProfile','refinement','result']);
  perform rpg_private.fields(profile,array['schemaVersion','id','policyRevision','registryVersion','task','providerId','modelId','reasoning']);
  perform rpg_private.wave2_model_selection(profile-array['schemaVersion','id','policyRevision','registryVersion','task']);
  perform rpg_private.assert(a->'schemaVersion'='1' and profile->'schemaVersion'='1' and (profile->>'id')::uuid is not null
    and profile->>'task'='canon.compile' and profile->>'registryVersion'='openai-responses-v1'
    and profile->'reasoning'<>'null' and (profile->>'policyRevision')::integer>=0);
  perform rpg_private.fields(b->'budget',array['maxUnits','maxPasses']);
  perform rpg_private.assert(b#>>'{budget,maxPasses}'='4' and (b#>>'{budget,maxUnits}')::integer between 3 and 480
    and jsonb_array_length(b->'sourceVersionIds') between 1 and 8 and b->>'inputDigest' ~ '^[0-9a-f]{64}$');
  if a->'refinement'<>'null' then
   perform rpg_private.fields(a->'refinement',array['packVersionId','text']);
   r:=rpg_private.library_ref(new.owner_id,a#>>'{refinement,packVersionId}','pack');
   perform rpg_private.assert(r->>'id'=b->>'targetPackId' and r#>'{body,sourcePriority}'=b->'sourcePriority' and length(btrim(a#>>'{refinement,text}')) between 1 and 4000);
  end if;
  if old.id is not null then
   perform rpg_private.assert(prev is not null and (a-'result')=(prev-'result'));
   if prev->'result'<>'null' then perform rpg_private.assert(a->'result'=prev->'result');
   elsif a->'result'<>'null' then perform rpg_private.assert(old.body->>'status'='indexing' and b->>'status'='auditing' and jsonb_array_length(old.body->'checkpoints')=2); end if;
  else perform rpg_private.assert(a->'result'='null'); end if;
  n:=jsonb_array_length(b->'checkpoints');
  perform rpg_private.assert(n<=4 and ((a->'result'<>'null')=(n>=3)));
  if b->>'status' not in ('failed','invalidated') then
   perform rpg_private.assert(case b->>'status' when 'queued' then n=0 when 'extracting' then n=0 when 'indexing' then n in (1,2) when 'auditing' then n=3 when 'awaiting_review' then n=4 when 'completed' then n=4 else false end and b->'errorCode'='null');
  else perform rpg_private.assert(b->>'errorCode' in ('unreadable','unsupported','budget','invalidated','provider','configuration','validation')); end if;
  units:=coalesce((b#>>'{checkpoints,0,cursor}')::integer,0);
  for cp,k in select value,ordinality::text from jsonb_array_elements(b->'checkpoints') with ordinality loop
   perform rpg_private.fields(cp,array['pass','cursor','digest']);
   perform rpg_private.assert(cp->>'digest' ~ '^[0-9a-f]{64}$' and cp->>'pass'=case k when '1' then 'extracting' when '4' then 'auditing' else 'indexing' end
    and (cp->>'cursor')::integer=case k when '2' then 0 else units end and units between 1 and (b#>>'{budget,maxUnits}')::integer/3);
  end loop;
  if a->'result'<>'null' then perform rpg_private.wave3_compiler_result(a->'result',profile); end if;
 elsif new.kind='pack' then
  for claim in select value from jsonb_array_elements(b->'claims') loop
   for v in select value->>'sourceVersionId' from jsonb_array_elements(claim->'evidence') loop
    select * into src from rpg_private.library_records where owner_id=new.owner_id and kind='source' and version_id=v::uuid;
    if src.body ? 'provenance' then perform rpg_private.assert(claim->>'origin'<>'source_fact'); end if;
   end loop;
  end loop;
  if b->>'compilerJobVersionId' is not null then
   select * into job from rpg_private.library_records where owner_id=new.owner_id and kind='compiler_job' and version_id=(b->>'compilerJobVersionId')::uuid;
   if job.body ? 'assistance' and (old.id is null or old.body->'compilerJobVersionId' is distinct from b->'compilerJobVersionId') then
    perform rpg_private.assert(job.body->>'status' in ('awaiting_review','completed') and b->>'status'='draft' and b->'approval'='null'
     and not exists(select 1 from jsonb_array_elements(b->'claims') c where c->>'authority'<>'reference'));
    if job.body#>>'{assistance,refinement,packVersionId}' is not null then
     perform rpg_private.assert(old.version_id::text=job.body#>>'{assistance,refinement,packVersionId}'); base:=old.body;
    else perform rpg_private.assert(old.id is null); base:='{}'; end if;
    proposal:=job.body#>'{assistance,result,proposal}'; prefix:=new.id::text||':'||(job.body#>>'{assistance,executionProfile,id}');
    extraction:=rpg_private.wave3_compiler_passages(new.owner_id,job.body);evidence:=extraction->'evidence';
    visibility:=case when exists(select 1 from rpg_private.library_records s where s.owner_id=new.owner_id and s.kind='source' and job.body->'sourceVersionIds' ? s.version_id::text and s.body->>'visibility'='private')
      or exists(select 1 from jsonb_array_elements(coalesce(base->'claims','[]')) c where c->>'visibility'='private') then 'private' else 'public' end;
    knowledge:=case when exists(select 1 from rpg_private.library_records s where s.owner_id=new.owner_id and s.kind='source' and job.body->'sourceVersionIds' ? s.version_id::text and s.body->>'knowledge'='future_source')
      or exists(select 1 from jsonb_array_elements(coalesce(base->'claims','[]')) c where c->>'knowledge'='future_source') then 'future_source' else 'source' end;
    perform rpg_private.assert(b->'sourcePriority'=job.body->'sourcePriority' and b->'sourceVersionIds'=job.body->'sourceVersionIds'
     and (select jsonb_agg(value->'sourceVersionId' order by value->>'sourceVersionId') from jsonb_array_elements(proposal->'coverage'))=(select jsonb_agg(value order by value#>>'{}') from jsonb_array_elements(job.body->'sourceVersionIds')));
    for original_coverage in select value from jsonb_array_elements(extraction->'coverage') loop
     select value into cp from jsonb_array_elements(proposal->'coverage') where value->'sourceVersionId'=original_coverage->'sourceVersionId';
     perform rpg_private.fields(cp,array['sourceVersionId','evidenceIndexes','gaps']);
     perform rpg_private.assert(jsonb_typeof(cp->'evidenceIndexes')='array' and jsonb_typeof(cp->'gaps')='array'
      and (select count(*)=count(distinct value) from jsonb_array_elements(cp->'evidenceIndexes')));
     for r in select value from jsonb_array_elements(cp->'evidenceIndexes') loop
      perform rpg_private.assert(jsonb_typeof(r)='number' and r#>>'{}' ~ '^[0-9]{1,3}$' and evidence->((r#>>'{}')::integer)#>'{locator,sourceVersionId}'=cp->'sourceVersionId');
     end loop;
     considered:=considered||(cp->'evidenceIndexes');
     n:=jsonb_array_length(cp->'evidenceIndexes');gaps:=(original_coverage->'gaps')||(cp->'gaps');
     if n<(original_coverage->>'processedUnits')::integer then gaps:=gaps||'"Some supplied passages were not covered by the proposal."'::jsonb; end if;
     coverage:=coverage||jsonb_build_array(original_coverage||jsonb_build_object('processedUnits',n,'gaps',gaps,'status',case when n=(original_coverage->>'totalUnits')::integer and gaps='[]' then 'complete' when n>0 then 'partial' else 'unprocessed' end));
    end loop;
    perform rpg_private.assert(b->'coverage'=coverage and b->'entities' @> coalesce(base->'entities','[]'));
    perform rpg_private.assert(b->'title'=proposal->'title' and jsonb_array_length(b->'claims')=jsonb_array_length(proposal->'candidates')+coalesce(jsonb_array_length(base->'claims'),0)
     and jsonb_array_length(b->'entities')=jsonb_array_length(proposal->'entities')+coalesce(jsonb_array_length(base->'entities'),0));
    for claim in select value from jsonb_array_elements(coalesce(base->'claims','[]')) loop
     perform rpg_private.assert(b->'claims' @> jsonb_build_array(jsonb_set(claim,'{authority}','"reference"')));
    end loop;
    for e in select value from jsonb_array_elements(proposal->'entities') loop
     perform rpg_private.assert(considered @> (e->'evidenceIndexes'));
     perform rpg_private.assert(b->'entities' @> jsonb_build_array(jsonb_build_object('id',rpg_private.wave3_library_id(prefix||':entity:'||(e->>'key')),'name',e->'name','kind',e->'kind','aliases',e->'aliases')));
    end loop;
    for e in select value from jsonb_array_elements(proposal->'candidates') loop
     perform rpg_private.assert(considered @> (e->'evidenceIndexes'));
     cited:='[]';authored:=false;quoted:=false;
     for r in select value from jsonb_array_elements(e->'evidenceIndexes') loop
      locator:=evidence->((r#>>'{}')::integer);perform rpg_private.assert(locator is not null);
      authored:=authored or (locator->>'authored')::boolean;quoted:=quoted or locator->'excerpt'=e->'text';
      cited:=cited||jsonb_build_array((locator->'locator')||jsonb_build_object('visibility',visibility,'knowledge',knowledge));
     end loop;
     perform rpg_private.assert(e->>'basis'<>'quote' or quoted);
     origin:=case when e->>'basis'='assumption' or (authored and e->>'basis'='quote') then 'scenario_assumption' when e->>'basis'='quote' then 'source_fact' else 'source_inference' end;
     structure:=jsonb_build_object('kind',e->'kind');
     if e->>'kind' in ('relationship','geography') then structure:=structure||jsonb_build_object('objectId',rpg_private.wave3_library_id(prefix||':entity:'||(e->>'objectKey')));
     elsif e->>'kind'='timeline' then structure:=structure||jsonb_build_object('position',e->'position'); end if;
     select value into claim from jsonb_array_elements(b->'claims') where value->>'id'=rpg_private.wave3_library_id(prefix||':claim:'||(e->>'key'))::text;
     perform rpg_private.assert(claim=jsonb_build_object('id',rpg_private.wave3_library_id(prefix||':claim:'||(e->>'key')),
      'subjectId',rpg_private.wave3_library_id(prefix||':entity:'||(e->>'subjectKey')),'text',e->'text','predicate',e->'predicate','epistemic',e->'epistemic',
      'origin',origin,'authority','reference','visibility',visibility,'knowledge',knowledge,'validFrom',null,'validUntil',null,'knownByEntityIds','[]'::jsonb,
      'evidence',cited,'structure',structure,'uncertainty',case when e->'uncertainty'<>'null' then e->'uncertainty' when authored then to_jsonb('Owner-authored world premise; not an external source fact.'::text) else 'null'::jsonb end));
    end loop;
    contradictions:=coalesce(base->'contradictions','[]');
    for e in select value from jsonb_array_elements(proposal->'contradictions') loop
     contradictions:=contradictions||jsonb_build_array(jsonb_build_object('id',rpg_private.wave3_library_id((job.body#>>'{assistance,executionProfile,id}')||':conflict:'||(e->>'key')),
      'status','unresolved','resolution',null,'claimIds',(select jsonb_agg(rpg_private.wave3_library_id(prefix||':claim:'||value) order by ordinality) from jsonb_array_elements_text(e->'candidateKeys') with ordinality)));
    end loop;
    unknowns:=coalesce(base->'unknowns','[]');
    for e in select value from jsonb_array_elements(proposal->'unknowns') loop
     unknowns:=unknowns||jsonb_build_array(jsonb_build_object('id',rpg_private.wave3_library_id(prefix||':unknown:'||(e->>'key')),'question',e->'question','entityId',case when e->>'entityKey' is null then null else rpg_private.wave3_library_id(prefix||':entity:'||(e->>'entityKey')) end));
    end loop;
    unknowns:=unknowns||jsonb_build_array(jsonb_build_object('id',rpg_private.wave3_library_id((job.body#>>'{assistance,executionProfile,id}')||':review'),'entityId',null,'question','Model-generated candidates require owner review. Evidence citations do not prove an inference; geography, relationships, chronology and rules may be incomplete.'));
    if old.id is not null then unknowns:=unknowns||jsonb_build_array(jsonb_build_object('id',rpg_private.wave3_library_id((job.body#>>'{assistance,executionProfile,id}')||':refinement'),'entityId',null,'question','Refinement proposals were added beside the prior draft. Existing owner corrections remain; explicitly reject or edit alternatives before approval.')); end if;
    for cp in select value from jsonb_array_elements(coverage) where value->>'status'<>'complete' loop
     unknowns:=unknowns||jsonb_build_array(jsonb_build_object('id',rpg_private.wave3_library_id((job.body#>>'{assistance,executionProfile,id}')||':coverage:'||(cp->>'sourceVersionId')),'entityId',null,'question','Source coverage is '||(cp->>'status')||'; '||(cp->>'processedUnits')||' of '||coalesce(cp->>'totalUnits','unknown')||' passages were reviewed.'));
    end loop;
    perform rpg_private.assert(b->'contradictions'=contradictions and b->'unknowns'=unknowns);
   end if;
  end if;
 end if;
 return new;
end $$;
create trigger wave3_library_guard before insert on rpg_private.library_records for each row execute function rpg_private.wave3_library_guard();
do $$ declare d text; old text; begin
 d:=pg_get_functiondef('public.rpg_library(uuid,uuid,text,jsonb,jsonb)'::regprocedure); old:=d;
 d:=replace(d,'perform rpg_private.assert((b-array[''status'',''checkpoints'',''errorCode''])=(old.body-array[''status'',''checkpoints'',''errorCode'']));',
 'perform rpg_private.assert((b-array[''status'',''checkpoints'',''errorCode'',''assistance''])=(old.body-array[''status'',''checkpoints'',''errorCode'',''assistance'']) and (b ? ''assistance'')=(old.body ? ''assistance'') and (not (b ? ''assistance'') or ((b->''assistance'')-''result'')=((old.body->''assistance'')-''result'')));');
 perform rpg_private.assert(d<>old); execute d;
end $$;

-- Re-enable at an idle fenced boundary. SQL derives every schedule itself.
create function rpg_private.wave3_step_enabled(policy jsonb,step jsonb,terminal boolean) returns boolean
language sql immutable set search_path='' as $$
 select policy->>'simulation'='true' and case step#>>'{trigger,kind}'
 when 'deadline' then policy->>'deadlinePressure'='normal' or
   (policy->>'deadlinePressure'='critical_only' and step#>>'{trigger,scenarioCritical}'='true' and step#>>'{trigger,established}'='true')
 when 'autonomy' then array_position(array['local','related','broad'],step#>>'{trigger,scope}')<=array_position(array['low','moderate','high'],policy->>'autonomy')
   and (policy->>'deadlinePressure'='normal' or (not terminal and jsonb_array_length(step->'hookChanges')=0 and step->>'consequence'='background'))
 else false end;
$$;
create function rpg_private.wave3_reconcile_world(w jsonb,policy jsonb,at_minute bigint,choice jsonb) returns jsonb
language plpgsql immutable set search_path='' as $$
declare previous jsonb:=w->'policy'; expansion boolean; grace bigint; th jsonb; st jsonb; receipt jsonb;
 ti integer; si integer; required text[]; floors jsonb:='{}'; last_restart bigint; effective_at bigint; floor_at bigint; target text;
begin
 expansion:=policy->>'simulation'='true' and (previous->>'simulation'='false' or
   array_position(array['off','critical_only','normal'],policy->>'deadlinePressure')>array_position(array['off','critical_only','normal'],previous->>'deadlinePressure'));
 perform rpg_private.assert(expansion=(choice is not null and choice<>'null'::jsonb));
 if expansion then
   perform rpg_private.fields(choice,array['schemaVersion','kind','graceMinutes']);
   perform rpg_private.assert(choice->'schemaVersion'='1' and choice->>'kind'='restart_overdue' and jsonb_typeof(choice->'graceMinutes')='number');
   perform rpg_private.assert(choice->>'graceMinutes' ~ '^[0-9]{1,5}$');
   grace:=(choice->>'graceMinutes')::bigint;
   perform rpg_private.assert((choice->>'graceMinutes')::numeric=grace and grace between 1 and 10080 and at_minute+grace<=1000000000);
   for receipt in select value from jsonb_array_elements(w->'warnings') loop
     floors:=jsonb_set(floors,array[receipt->>'stepId'],to_jsonb((receipt->>'opportunityUntilWorldMinutes')::bigint+1));
   end loop;
   for th,ti in select value,(ordinality-1)::integer from jsonb_array_elements(w->'threads') with ordinality loop
     required:=array[]::text[];
     for st,si in select value,(ordinality-1)::integer from jsonb_array_elements(th->'steps') with ordinality loop
       if th->>'status'='active' and si>=(th->>'cursor')::integer and st#>>'{trigger,kind}' in ('deadline','autonomy')
         and (st#>>'{trigger,atWorldMinutes}')::bigint<=at_minute
         and not rpg_private.wave3_step_enabled(previous,st,si=jsonb_array_length(th->'steps')-1)
         and rpg_private.wave3_step_enabled(policy,st,si=jsonb_array_length(th->'steps')-1) then
         required:=array_append(required,st->>'id');
       end if;
     end loop;
     last_restart:=at_minute;
     for st,si in select value,(ordinality-1)::integer from jsonb_array_elements(th->'steps') with ordinality loop
       if st#>>'{trigger,kind}'='causal' then continue; end if;
       effective_at:=(st#>>'{trigger,atWorldMinutes}')::bigint;
       if st->>'id'=any(required) then
         effective_at:=greatest(last_restart+grace,coalesce((floors->>(st->>'id'))::bigint,0));
         perform rpg_private.assert(effective_at between 0 and 1000000000);
         w:=jsonb_set(w,array['threads',ti::text,'steps',si::text,'trigger','atWorldMinutes'],to_jsonb(effective_at));
         last_restart:=effective_at;
       end if;
       target:=st#>>'{warning,forStepId}';
       if si>=(th->>'cursor')::integer and target=any(required) then
         floor_at:=greatest(at_minute,effective_at)+(st#>>'{warning,opportunityMinutes}')::bigint+1;
         perform rpg_private.assert(floor_at between 0 and 1000000000);
         floors:=jsonb_set(floors,array[target],to_jsonb(greatest(coalesce((floors->>target)::bigint,0),floor_at)));
       end if;
     end loop;
   end loop;
 end if;
 return jsonb_set(jsonb_set(w,'{policy}',policy),'{policyChangedAtWorldMinutes}',to_jsonb(at_minute));
end $$;
do $$ declare d text; old text; start_at integer; end_at integer; begin
 d:=pg_get_functiondef('rpg_private.world_before_wave2_recovery(uuid,uuid,text,jsonb,jsonb)'::regprocedure); old:=d;
 d:=replace(d,'perform rpg_private.fields(p_payload,array[''command'',''worldPolicy'',''ruleset'',''executionPolicy'']);',
   'perform rpg_private.fields(p_payload,array[''command'',''worldPolicy'',''ruleset'',''executionPolicy''],array[''reconciliation'']);');
 start_at:=position('  w:=nullif(snap->''world'',''null'');' in d);
 end_at:=position('  perform rpg_private.world_validate_state(p_owner_id,cid,w,snap->''bindings'');' in substring(d from start_at));
 perform rpg_private.assert(start_at>0 and end_at>0);
 d:=substring(d from 1 for start_at-1)||$body$
  w:=nullif(snap->'world','null');
  if w is null then
    w:=jsonb_build_object('schemaVersion',1,'campaignId',cid,'policy',jsonb_build_object('simulation',false,'autonomy',v->'autonomy','deadlinePressure','off'),
      'policyChangedAtWorldMinutes',snap->'worldMinutes','actors','[]'::jsonb,'threads','[]'::jsonb,'hooks','[]'::jsonb,'warnings','[]'::jsonb);
  end if;
  w:=rpg_private.wave3_reconcile_world(w,v,(snap->>'worldMinutes')::bigint,p_payload->'reconciliation');
$body$||substring(d from start_at+end_at-1);
 perform rpg_private.assert(d<>old); execute d;
end $$;

-- Finite consequences are recomputed from current records, never accepted as patches.
create function rpg_private.wave3_consequences(cid uuid,w jsonb,effects jsonb,mode text,decisions jsonb,caps jsonb,act text,elapsed bigint)
returns jsonb language plpgsql stable set search_path='' as $$
#variable_conflict use_column
declare effect jsonb; kind text; cap text; target jsonb; holder jsonb; protected_ids jsonb; entity jsonb; item jsonb; destination jsonb; quest jsonb;
 auth jsonb:='[]'; facts jsonb:='[]'; texts jsonb:='[]'; actors jsonb:=w->'actors'; before_value jsonb; after_value jsonb; changes jsonb:='[]';
 family text; rid text; rev integer; field text; idx integer; row_index integer; oldentry jsonb; current_location uuid; amount integer; resource text; fact text;
 seen text[]:=array[]::text[]; effect_key text; russian boolean; line text;
begin
 perform rpg_private.assert(mode in ('action','resolver') and jsonb_typeof(effects)='array' and jsonb_array_length(effects)<=6 and elapsed between 0 and 1000000000);
 perform rpg_private.uuid_array(decisions); perform rpg_private.assert(jsonb_typeof(caps)='array');
 select current_location_id into current_location from public.rpg_public_state where campaign_id=cid;
 select language='ru' into russian from public.rpg_campaigns where id=cid;
 select coalesce(jsonb_agg(distinct value),'[]') into protected_ids from (
  select to_jsonb(id::text) value from public.rpg_entities where campaign_id=cid and kind='player'
  union all select value from rpg_private.runtime_state r,jsonb_array_elements(coalesce(r.configuration->'controlledEntityIds','[]')) where r.campaign_id=cid
  union all select to_jsonb(coalesce(a->>'entityId',a->>'id')) from jsonb_array_elements(actors) a where a->>'control'='player'
 ) protected;
 if mode='action' and jsonb_array_length(effects)>0 then
  perform rpg_private.assert(jsonb_array_length(decisions)=1 and protected_ids @> decisions);
 elsif mode='resolver' then perform rpg_private.assert(not exists(select 1 from jsonb_array_elements_text(decisions) d where protected_ids ? d)); end if;
 if exists(select 1 from jsonb_array_elements(effects) e where e->>'kind'<>'fact.observe') then
  perform rpg_private.assert(not exists(select 1 from public.rpg_encounters where campaign_id=cid and status='active')
   and not exists(select 1 from public.rpg_rest_records where campaign_id=cid and status='planned')
   and not exists(select 1 from public.rpg_pending_actions where campaign_id=cid and status in ('proposed','confirmed')));
 end if;
 for effect in select value from jsonb_array_elements(effects) loop
  kind:=effect->>'kind'; target:=null; family:=null; rid:=null; rev:=null; field:=null; before_value:=null; after_value:=null; line:=null;
  case kind
   when 'inventory.consume' then
    perform rpg_private.fields(effect,array['kind','actorId','itemId','quantity']);
    perform rpg_private.assert(jsonb_typeof(effect->'quantity')='number' and effect->>'quantity' ~ '^[0-9]{1,2}$' and (effect->>'quantity')::integer between 1 and 20);
    cap:='world.consume:'||(effect->>'itemId'); effect_key:='item:'||(effect->>'itemId');
   when 'resource.spend' then
    perform rpg_private.fields(effect,array['kind','actorId','resource','amount']);
    perform rpg_private.assert(jsonb_typeof(effect->'amount')='number' and effect->>'amount' ~ '^[0-9]{1,2}$' and (effect->>'amount')::integer between 1 and 20
      and effect->>'resource' ~ '^[a-z][a-z0-9_-]{0,47}$' and effect->>'resource' not in ('constructor','prototype','__proto__'));
    cap:='world.spend:'||(effect->>'resource'); effect_key:='resource:'||(effect->>'actorId')||':'||(effect->>'resource');
   when 'condition.add','condition.remove' then
    perform rpg_private.fields(effect,array['kind','actorId','condition']);
    perform rpg_private.assert(effect->>'condition' in ('wet','cold','tired','hungry','thirsty','dirty'));
    cap:='world.'||kind||':'||(effect->>'condition'); effect_key:='condition:'||(effect->>'actorId')||':'||(effect->>'condition');
   when 'actor.relocate' then
    perform rpg_private.fields(effect,array['kind','actorId','fromLocationId','toLocationId']);
    cap:='world.relocate:'||(effect->>'actorId')||':'||(effect->>'toLocationId'); effect_key:='actor:'||(effect->>'actorId');
   when 'fact.observe' then
    perform rpg_private.fields(effect,array['kind','family','recordId']);
    perform rpg_private.assert(effect->>'family' in ('entities','locations','quests'));
    cap:='world.observe:'||(effect->>'family')||':'||(effect->>'recordId'); effect_key:='fact:'||(effect->>'family')||':'||(effect->>'recordId');
   when 'quest.complete' then
    perform rpg_private.fields(effect,array['kind','questId']);
    cap:='world.complete:'||(effect->>'questId'); effect_key:='quest:'||(effect->>'questId');
   else raise exception 'rpg_validation';
  end case;
  perform rpg_private.assert(not effect_key=any(seen)); seen:=array_append(seen,effect_key);
  if effect ? 'actorId' then
   select value into target from jsonb_array_elements(actors) where value->>'id'=effect->>'actorId' and value->>'campaignId'=cid::text;
   perform rpg_private.assert(target is not null);
   if mode='resolver' then perform rpg_private.assert(not protected_ids ? coalesce(target->>'entityId',target->>'id') and decisions ? (target->>'id'));
   elsif kind<>'actor.relocate' then perform rpg_private.assert(target->'id'=decisions->0); end if;
  end if;
  perform rpg_private.assert(exists(select 1 from jsonb_array_elements(actors) a where decisions ? (a->>'id') and a->'capabilities' ? cap
    and caps ? case mode when 'action' then cap else (a->>'id')||':'||cap end
    and (mode='action' or target is null or kind='actor.relocate' or a->>'id'=target->>'id')));
  if kind='actor.relocate' then
   perform rpg_private.assert(not protected_ids ? coalesce(target->>'entityId',target->>'id') and effect->'fromLocationId'<>effect->'toLocationId'
    and target->'locationId'=effect->'fromLocationId' and elapsed>0);
   select to_jsonb(l) into destination from public.rpg_locations l where campaign_id=cid and id=(effect->>'toLocationId')::uuid and status in ('known','visited');
   perform rpg_private.assert(destination is not null and exists(select 1 from public.rpg_locations where campaign_id=cid and id=(effect->>'fromLocationId')::uuid));
   if mode='action' then perform rpg_private.assert(target->>'publicName' is not null and target->>'locationId'=current_location::text and act in ('attempt','speak','move')); end if;
   family:='world.actors';rid:=target->>'id';rev:=(target->>'revision')::integer;
   before_value:=jsonb_build_object('locationId',target->'locationId','revision',rev); after_value:=jsonb_build_object('locationId',effect->'toLocationId','revision',rev+1);
   select ordinality::integer-1 into idx from jsonb_array_elements(actors) with ordinality where value->>'id'=rid;
   actors:=jsonb_set(actors,array[idx::text],target||after_value);
   line:=case when russian then (target->>'publicName')||' прибывает: '||(destination->>'name')||'.' else (target->>'publicName')||' reaches '||(destination->>'name')||'.' end;
  elsif kind='inventory.consume' then
   select to_jsonb(i) into item from public.rpg_items i where campaign_id=cid and id=(effect->>'itemId')::uuid;
   amount:=(effect->>'quantity')::integer;
   perform rpg_private.assert(target->>'entityId' is not null and item->>'owner_entity_id'=target->>'entityId'
    and exists(select 1 from public.rpg_storages where campaign_id=cid and id=(item->>'storage_id')::uuid and entity_id=(target->>'entityId')::uuid)
    and item->'equipped_entity_id'='null' and item->'equipped_slot'='null' and (item->>'quantity')::integer>=amount
    and (mode='resolver' or act in ('attempt','move','wait')));
   family:='items';rid:=item->>'id';rev:=(item->>'revision')::integer;field:='quantity';
   before_value:=jsonb_build_object('quantity',item->'quantity');after_value:=jsonb_build_object('quantity',(item->>'quantity')::integer-amount);
   line:=case when russian then (item->>'name')||': израсходовано '||amount||'.' else (item->>'name')||': '||amount||' consumed.' end;
  elsif kind in ('resource.spend','condition.add','condition.remove') then
   select to_jsonb(e) into entity from public.rpg_entities e where campaign_id=cid and id=(target->>'entityId')::uuid;
   perform rpg_private.assert(entity is not null);
   family:='entities';rid:=entity->>'id';rev:=(entity->>'revision')::integer;
   field:=case when kind='resource.spend' then 'resources' else 'conditions' end;
   select value into oldentry from jsonb_array_elements(auth) where value->>'family'=family and value->>'id'=rid and value->'after' ? field;
   before_value:=jsonb_build_object(field,entity->field);after_value:=coalesce(oldentry->'after',before_value);
   if kind='resource.spend' then
    resource:=effect->>'resource';amount:=(effect->>'amount')::integer;
    perform rpg_private.assert(entity->'resources' ? resource and jsonb_typeof(entity->'resources'->resource)='number' and entity->'resources'->>resource ~ '^[0-9]{1,7}$'
     and (entity->'resources'->>resource)::bigint>=amount and (mode='resolver' or act in ('attempt','move','speak')));
    after_value:=jsonb_set(after_value,array['resources',resource],to_jsonb((entity->'resources'->>resource)::bigint-amount));
    line:=case when russian then (entity->>'name')||': потрачено '||amount||' ('||resource||').' else (entity->>'name')||': '||amount||' '||resource||' spent.' end;
   else
    perform rpg_private.assert((entity->'conditions' ? (effect->>'condition'))=(kind='condition.remove') and (mode='resolver' or act in ('attempt','move','wait')));
    if kind='condition.add' then after_value:=jsonb_set(after_value,'{conditions}',(after_value->'conditions')||jsonb_build_array(effect->>'condition'));
    else after_value:=jsonb_set(after_value,'{conditions}',coalesce((select jsonb_agg(value order by ordinality) from jsonb_array_elements(after_value->'conditions') with ordinality where value<>effect->'condition'),'[]')); end if;
    perform rpg_private.assert(jsonb_array_length(after_value->'conditions')<=50);
    line:=case when russian then (entity->>'name')||': '||(effect->>'condition')||' — '||case kind when 'condition.add' then 'добавлено.' else 'снято.' end
     else (entity->>'name')||': '||(effect->>'condition')||' '||case kind when 'condition.add' then 'added.' else 'removed.' end end;
   end if;
  elsif kind='quest.complete' then
   select to_jsonb(q) into quest from public.rpg_quests q where campaign_id=cid and id=(effect->>'questId')::uuid;
   perform rpg_private.assert(mode='action' and act='attempt' and quest->>'status'='open');
   family:='quests';rid:=quest->>'id';rev:=(quest->>'revision')::integer;field:='status';before_value:=jsonb_build_object('status','open');after_value:=jsonb_build_object('status','complete');
   line:=case when russian then 'Цель достигнута: '||(quest->>'title')||'.' else 'Objective completed: '||(quest->>'title')||'.' end;
  else
   perform rpg_private.assert(mode='resolver' or act in ('observe','attempt','speak'));
   case effect->>'family'
    when 'locations' then
     select description into fact from public.rpg_locations where campaign_id=cid and id=(effect->>'recordId')::uuid;
     perform rpg_private.assert(case mode when 'action' then effect->>'recordId'=current_location::text else exists(select 1 from jsonb_array_elements(actors) a where decisions ? (a->>'id') and a->'locationId'=effect->'recordId') end);
    when 'entities' then
     select details into fact from public.rpg_entities where campaign_id=cid and id=(effect->>'recordId')::uuid;
     select value into holder from jsonb_array_elements(actors) where value->'entityId'=effect->'recordId' and value->>'publicName' is not null;
     perform rpg_private.assert(holder->>'locationId' is not null and case mode when 'action' then holder->>'locationId'=current_location::text else exists(select 1 from jsonb_array_elements(actors) a where decisions ? (a->>'id') and a->'locationId'=holder->'locationId') end);
    when 'quests' then select description into fact from public.rpg_quests where campaign_id=cid and id=(effect->>'recordId')::uuid and status<>'archived';
   end case;
   perform rpg_private.assert(length(btrim(fact)) between 1 and 4000);
   facts:=facts||jsonb_build_array(jsonb_build_object('family',effect->'family','recordId',effect->'recordId','text',fact));line:=fact;
  end if;
  if family is not null then
   row_index:=null;
   if field is not null then select ordinality::integer-1 into row_index from jsonb_array_elements(auth) with ordinality where value->>'family'=family and value->>'id'=rid and value->'after' ? field; end if;
   if row_index is null then auth:=auth||jsonb_build_array(jsonb_build_object('family',family,'id',rid,'expectedRevision',rev,'before',before_value,'after',after_value));
   else auth:=jsonb_set(auth,array[row_index::text,'after'],after_value); end if;
  end if;
  if mode='action' and line is not null then texts:=texts||jsonb_build_array(line); end if;
 end loop;
 for oldentry in select value from jsonb_array_elements(auth) where value->>'family'<>'world.actors' loop
  select ordinality::integer-1 into idx from jsonb_array_elements(changes) with ordinality where value->'family'=oldentry->'family' and value->'id'=oldentry->'id';
  if idx is null then changes:=changes||jsonb_build_array(jsonb_build_object('family',oldentry->'family','id',oldentry->'id','expectedRevision',oldentry->'expectedRevision','values',oldentry->'after'));
  else changes:=jsonb_set(changes,array[idx::text,'values'],(changes->idx->'values')||(oldentry->'after')); end if;
 end loop;
 return jsonb_build_object('authority',auth,'facts',facts,'publicTexts',texts,'actors',actors,'changes',changes);
end $$;

create function rpg_private.wave3_strip_changes(changes jsonb,authority jsonb,required boolean) returns jsonb
language plpgsql immutable set search_path='' as $$
#variable_conflict use_column
declare a jsonb; c jsonb; idx integer; field text; value jsonb;
begin
 for a in select value from jsonb_array_elements(authority) where value->>'family'<>'world.actors' loop
  select element,ordinality::integer-1 into c,idx from jsonb_array_elements(changes) with ordinality rows(element,ordinality)
   where element->'family'=a->'family' and element->'id'=a->'id';
  if c is null then perform rpg_private.assert(not required); continue; end if;
  for field,value in select key,value from jsonb_each(a->'after') loop
   if c->'values' ? field then
    perform rpg_private.assert(c->'expectedRevision'=a->'expectedRevision' and c->'values'->field=value);
    c:=jsonb_set(c,'{values}',(c->'values')-field);
   else perform rpg_private.assert(not required); end if;
  end loop;
  changes:=jsonb_set(changes,array[idx::text],c);
 end loop;
 return coalesce((select jsonb_agg(value order by ordinality) from jsonb_array_elements(changes) with ordinality where value->'values'<>'{}'),'[]');
end $$;

alter function rpg_private.world_validate_settlement(uuid,uuid,jsonb,rpg_private.turns) rename to world_validate_settlement_before_wave3;
create function rpg_private.world_validate_settlement(uid uuid,cid uuid,p jsonb,t rpg_private.turns) returns void
language plpgsql stable set search_path='' as $$
#variable_conflict use_column
declare snapshot jsonb; w jsonb; proposal jsonb:=t.checkpoint->'worldLogic'; transformed jsonb:=p; legacy_turn rpg_private.turns:=t;
 e jsonb; payload jsonb; result jsonb; action_result jsonb; action_actors jsonb; expected_actors jsonb; th jsonb; st jsonb; a jsonb;
 row_index integer; event_index integer; accumulated jsonb:='[]'; resolver_authority jsonb:='[]'; action_authority jsonb:='[]'; field text; previous jsonb; current_entry jsonb;
 russian boolean; actor_name text; destination_name text; expected_text text; route text; action_event jsonb;
begin
 snapshot:=rpg_private.foundation_fence(uid,cid,p);w:=snapshot->'world';
 -- Detect typed authority from stored steps as well as the untrusted candidate.
 -- Removing all typed payload fields must never downgrade a resolver to legacy.
 if coalesce(proposal->>'schemaVersion','1')<>'2'
  and not exists(select 1 from jsonb_array_elements(p->'events') event where event->'payload' ?| array['consequences','consequenceAuthority','consequenceFacts'])
  and not exists(select 1 from jsonb_array_elements(w->'threads') thread,jsonb_array_elements(thread->'steps') step where step ? 'consequences') then
  perform rpg_private.world_validate_settlement_before_wave3(uid,cid,p,t); return;
 end if;
 action_actors:=w->'actors'; expected_actors:=action_actors;
 select language='ru' into russian from public.rpg_campaigns where id=cid;
 select value into action_event from jsonb_array_elements(p->'events') where value->>'kind'='world.logic.resolved';
 if action_event is not null then
  if proposal->>'action'='move' and proposal->>'outcome'='completed' then
   select coalesce(jsonb_agg(case when value->>'entityId'=proposal->>'actorId' then jsonb_set(jsonb_set(value,'{locationId}',proposal->'destinationId'),'{revision}',to_jsonb((value->>'revision')::integer+1)) else value end order by ordinality),'[]') into action_actors from jsonb_array_elements(w->'actors') with ordinality;
   if proposal->>'schemaVersion'='2' then
    route:='world.travel:'||(select current_location_id::text from public.rpg_public_state where campaign_id=cid)||':'||(proposal->>'destinationId');
    perform rpg_private.assert(proposal->'capabilityRefs' ? route and exists(select 1 from jsonb_array_elements(w->'actors') actor where actor->>'entityId'=proposal->>'actorId' and actor->'capabilities' ? route));
   end if;
  end if;
  expected_actors:=action_actors;
  if proposal->>'schemaVersion'='2' then
   perform rpg_private.fields(proposal,array['schemaVersion','actorId','input','action','outcome','uncertainty','capabilityRefs','circumstanceRefs','evidenceIndexes','publicText','elapsedMinutes','destinationId','consequences']);
   perform rpg_private.assert(proposal->>'outcome'<>'blocked' or proposal->'consequences'='[]');
   action_result:=rpg_private.wave3_consequences(cid,jsonb_set(w,'{actors}',action_actors),proposal->'consequences','action',jsonb_build_array(proposal->'actorId'),proposal->'capabilityRefs',proposal->>'action',(proposal->>'elapsedMinutes')::bigint);
   action_authority:=action_result->'authority';expected_actors:=action_result->'actors';accumulated:=action_authority;
   perform rpg_private.assert(action_event->'payload'=(proposal-array['uncertainty','evidenceIndexes','publicText'])||jsonb_build_object('consequenceAuthority',action_authority));
   select name into actor_name from public.rpg_entities where campaign_id=cid and id=(proposal->>'actorId')::uuid;
   select name into destination_name from public.rpg_locations where campaign_id=cid and id=(proposal->>'destinationId')::uuid;
   expected_text:=case when proposal->>'outcome'='blocked' then case when russian then 'Запрошенное действие пока невозможно.' else 'The requested action remains blocked.' end
    when russian then case proposal->>'action' when 'observe' then actor_name||' осматривается.' when 'speak' then actor_name||' говорит.' when 'attempt' then actor_name||' выполняет запрошенное действие.' when 'move' then actor_name||' прибывает: '||coalesce(destination_name,'')||'.' when 'wait' then actor_name||' ждёт '||(proposal->>'elapsedMinutes')||' мин.' end
    else case proposal->>'action' when 'observe' then actor_name||' observes the surroundings.' when 'speak' then actor_name||' speaks.' when 'attempt' then actor_name||' performs the requested action.' when 'move' then actor_name||' reaches '||coalesce(destination_name,'')||'.' when 'wait' then actor_name||' waits '||(proposal->>'elapsedMinutes')||' minutes.' end end;
   if jsonb_array_length(action_result->'publicTexts')>0 then expected_text:=expected_text||chr(10)||(select string_agg(value,chr(10) order by ordinality) from jsonb_array_elements_text(action_result->'publicTexts') with ordinality); end if;
   perform rpg_private.assert(action_event->>'text'=expected_text and length(expected_text)<=4000);
   legacy_turn.checkpoint:=jsonb_set(legacy_turn.checkpoint,'{worldLogic}',jsonb_set(proposal-'consequences','{schemaVersion}','1'));
  end if;
 end if;
 for e,event_index in select value,ordinality::integer-1 from jsonb_array_elements(p->'events') with ordinality loop
  if e->>'originTimelineId'<>p#>>'{timeline,timelineId}' then
   perform rpg_private.assert((p-array['events','nextWorld'])=(rpg_private.wave2_effective_stage(cid,t.id,t.lease_token)-array['events','nextWorld'])
    and exists(select 1 from rpg_private.world_stages s,jsonb_array_elements(s.settlement->'events') old_event where s.campaign_id=cid and s.id=t.id and old_event=e));
   e:=jsonb_set(e,'{originTimelineId}',p#>'{timeline,timelineId}');
  end if;
  if e->>'kind'='world.logic.resolved' and proposal->>'schemaVersion'='2' then
   e:=jsonb_set(jsonb_set(e,'{text}',proposal->'publicText'),'{payload}',jsonb_set((e->'payload')-array['consequences','consequenceAuthority'],'{schemaVersion}','1'));
  elsif e->>'kind'='world.thread.advanced' then
   select value into th from jsonb_array_elements(w->'threads') where value->'id'=e->'threadIds'->0;
   st:=th->'steps'->(e#>>'{payload,previousCursor}')::integer;
   if st ? 'consequences' then
    payload:=e->'payload';
    perform rpg_private.fields(payload,array['schemaVersion','stepId','previousCursor','nextCursor','hookChanges','resolverReceipt','consequences','consequenceAuthority','consequenceFacts']);
    perform rpg_private.assert(st->>'resolution'='resolver_required' and payload->'consequences'=st->'consequences');
    result:=rpg_private.wave3_consequences(cid,w,st->'consequences','resolver',th->'decisionActorIds',payload#>'{resolverReceipt,capabilityRefs}',null,(p->>'throughWorldMinutes')::bigint-(p->>'fromWorldMinutes')::bigint);
    perform rpg_private.assert(payload->'consequenceAuthority'=result->'authority' and payload->'consequenceFacts'=result->'facts');
    for a in select value from jsonb_array_elements(result->'authority') loop
     for field in select jsonb_object_keys(a->'after') loop
      perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(accumulated) previous where previous->'family'=a->'family' and previous->'id'=a->'id' and previous->'after' ? field));
     end loop;
     if a->>'family'='world.actors' then
      select value,ordinality::integer-1 into current_entry,row_index from jsonb_array_elements(expected_actors) with ordinality where value->'id'=a->'id';
      perform rpg_private.assert(current_entry->'locationId'=a#>'{before,locationId}' and current_entry->'revision'=a#>'{before,revision}');
      expected_actors:=jsonb_set(expected_actors,array[row_index::text],current_entry||(a->'after'));
     end if;
    end loop;
    accumulated:=accumulated||(result->'authority');resolver_authority:=resolver_authority||(result->'authority');
    e:=jsonb_set(e,'{payload}',payload-array['consequences','consequenceAuthority','consequenceFacts']);
   else perform rpg_private.assert(not ((e->'payload') ?| array['consequences','consequenceAuthority','consequenceFacts'])); end if;
  end if;
  transformed:=jsonb_set(transformed,array['events',event_index::text],e);
 end loop;
 perform rpg_private.assert(p#>'{nextWorld,actors}'=expected_actors);
 transformed:=jsonb_set(transformed,'{nextWorld,actors}',action_actors);
 legacy_turn.checkpoint:=jsonb_set(legacy_turn.checkpoint,'{resolution,changes}',rpg_private.wave3_strip_changes(rpg_private.wave3_strip_changes(t.checkpoint#>'{resolution,changes}',resolver_authority,false),action_authority,true));
 perform rpg_private.world_validate_settlement_before_wave3(uid,cid,transformed,legacy_turn);
end $$;

-- Committing always requires every validated consequence in the same packet.
create function rpg_private.wave3_commit_consequences(packet jsonb) returns void language plpgsql immutable set search_path='' as $$
declare e jsonb; remaining jsonb:=packet#>'{resolution,changes}'; begin
 for e in select value from jsonb_array_elements(coalesce(packet#>'{worldSettlement,events}','[]')) loop
  if e->'payload' ? 'consequenceAuthority' then
   remaining:=rpg_private.wave3_strip_changes(remaining,e#>'{payload,consequenceAuthority}',true);
  end if;
 end loop;
end $$;
do $$ declare d text; old text; begin
 d:=pg_get_functiondef('public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)'::regprocedure);old:=d;
 d:=replace(d,'if p_action=''commit'' and', 'if p_action=''commit'' then perform rpg_private.wave3_commit_consequences(p_payload->''packet''); end if; if p_action=''commit'' and');
 perform rpg_private.assert(d<>old);execute d;
end $$;

-- SQL heap order is not record authority. Save restoration may reorder these
-- explicitly unordered identity collections. Compare both old and fresh proofs
-- canonically without rewriting a stored proof, stage, event or ordered history.
create function rpg_private.wave3_recovery_authority(v jsonb) returns jsonb
language plpgsql immutable set search_path='' as $$
declare section text; field text; path text[]; rows jsonb; begin
 foreach section in array array['snapshot','runtime'] loop
  foreach field in array case section when 'snapshot' then array['documents','entities','storages','items','sessions','quests','locations']
   else array['recipes','effects','encounters','pendingActions','conversations','sessionGuidance','provenance'] end loop
   path:=array['source',section,field];
   if jsonb_typeof(v#>path)='array' then
    select coalesce(jsonb_agg(value order by value->>'id',value::text),'[]') into rows from jsonb_array_elements(v#>path);
    v:=jsonb_set(v,path,rows);
   end if;
  end loop;
 end loop;
 return v;
end $$;
do $$ declare d text; old text; begin
 d:=pg_get_functiondef('public.rpg_world(uuid,uuid,text,jsonb,jsonb)'::regprocedure);old:=d;
 d:=replace(d,'oldstage.authority<>fresh','rpg_private.wave3_recovery_authority(oldstage.authority)<>rpg_private.wave3_recovery_authority(fresh)');
 perform rpg_private.assert(d<>old);execute d;
end $$;

revoke all on all tables in schema rpg_private from public,anon,authenticated;
revoke all on all functions in schema rpg_private from public,anon,authenticated;
revoke all on function public.rpg_campaign_premise(uuid,text,jsonb,jsonb) from public,anon;
grant execute on function public.rpg_campaign_premise(uuid,text,jsonb,jsonb) to authenticated;
commit;
