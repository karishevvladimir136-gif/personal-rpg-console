-- Additive Phase 2 runtime. Service-only execution after independently verified
-- owner authorization; no private schema exposure or authenticated private RPC.
begin;
create table rpg_private.runtime_state (
  campaign_id uuid primary key references public.rpg_campaigns(id),
  revision integer not null default 1 check(revision > 0),
  world_minutes integer not null default 0 check(world_minutes >= 0),
  configuration jsonb, updated_at timestamptz not null default now()
);
create table rpg_private.turns (
  id uuid primary key, campaign_id uuid not null references public.rpg_campaigns(id),
  owner_id uuid not null references auth.users(id), session_id uuid,
  input jsonb not null, status text not null default 'pending' check(status in ('pending','generating','awaiting_confirmation','committed','failed','cancelled')),
  expected_revision integer not null, committed_revision integer, settings_revision integer not null,
  settings jsonb not null, guide_revision integer not null, guide_version_id uuid,
  source jsonb, checkpoint jsonb not null default '{"plan":null,"checks":[],"resolution":null,"narration":null,"feedback":null,"usage":[]}',
  lease_token uuid, lease_until timestamptz,
  narration text, visual_description text, proposal jsonb,
  failure text check(failure in ('configuration','provider','context','validation','conflict','unavailable')),
  retryable boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  sequence bigint generated always as identity,
  unique(campaign_id,id),
  foreign key(campaign_id,session_id) references public.rpg_sessions(campaign_id,id),
  foreign key(campaign_id,settings_revision) references public.rpg_settings_revisions(campaign_id,revision)
);
create table rpg_private.runtime_commands (
  id uuid primary key, campaign_id uuid not null references public.rpg_campaigns(id),
  owner_id uuid not null references auth.users(id), operation_id uuid,
  request jsonb not null, result jsonb not null, created_at timestamptz not null default now(),
  foreign key(campaign_id,operation_id) references rpg_private.turns(campaign_id,id)
);
create table rpg_private.runtime_events (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.rpg_campaigns(id),
  operation_id uuid not null, payload jsonb not null, created_at timestamptz not null default now(),
  foreign key(campaign_id,operation_id) references rpg_private.turns(campaign_id,id)
);
create table public.rpg_session_guidance (
  id uuid primary key, campaign_id uuid not null references public.rpg_campaigns(id), session_id uuid not null,
  text text not null check(length(btrim(text)) between 1 and 2000), created_at timestamptz not null default now(),
  foreign key(campaign_id,session_id) references public.rpg_sessions(campaign_id,id), unique(campaign_id,id)
);
create table public.rpg_provenance (
  id uuid primary key, campaign_id uuid not null references public.rpg_campaigns(id), operation_id uuid not null,
  session_id uuid not null, inputs jsonb not null, "outputItemIds" jsonb not null,
  foreign key(campaign_id,session_id) references public.rpg_sessions(campaign_id,id),
  foreign key(campaign_id,operation_id) references rpg_private.turns(campaign_id,id), unique(campaign_id,id)
);
create trigger immutable_runtime_events before update or delete on rpg_private.runtime_events for each row execute function rpg_private.immutable_history();
create trigger immutable_runtime_commands before update or delete on rpg_private.runtime_commands for each row execute function rpg_private.immutable_history();
create trigger immutable_session_guidance before update or delete on public.rpg_session_guidance for each row execute function rpg_private.immutable_history();
create trigger immutable_provenance before update or delete on public.rpg_provenance for each row execute function rpg_private.immutable_history();

create function rpg_private.runtime_revision() returns trigger language plpgsql security definer set search_path='' as $$
declare cid uuid := coalesce(new.campaign_id,old.campaign_id);
begin
  insert into rpg_private.runtime_state(campaign_id) values(cid)
    on conflict(campaign_id) do update set revision=rpg_private.runtime_state.revision+1,updated_at=now();
  return coalesce(new,old);
end;
$$;
insert into rpg_private.runtime_state(campaign_id) select id from public.rpg_campaigns;
do $$ declare t text; begin
  foreach t in array array['rpg_campaigns','rpg_settings','rpg_documents','rpg_entities','rpg_storages','rpg_items','rpg_sessions','rpg_scenes','rpg_public_state','rpg_quests','rpg_locations','rpg_conversations','rpg_rest_records','rpg_recipes','rpg_effects','rpg_encounters','rpg_encounter_participants','rpg_pending_actions','rpg_session_guidance'] loop
    execute format('create trigger runtime_revision after insert or update or delete on public.%I for each row execute function rpg_private.runtime_revision()',t);
  end loop;
end $$;

create function rpg_private.runtime_public_turn(t rpg_private.turns) returns jsonb language plpgsql stable set search_path='' as $$
declare checks jsonb := '[]'; c jsonb; actor text; remaining integer; used integer;
begin
  select count(*)::integer into used from rpg_private.runtime_commands q join rpg_private.turns r on q.operation_id=r.id
    where q.campaign_id=t.campaign_id and r.session_id is not distinct from t.session_id and q.request->>'action'='reroll';
  remaining := greatest(0,(t.settings#>>'{difficulty,rerollsPerSession}')::integer-used);
  if t.settings->>'dicePresentation' <> 'hidden' then
    for c in select value from jsonb_array_elements(t.checkpoint->'checks') loop
      if c->>'visibility' <> 'player' or (t.settings->>'dicePresentation'='key-rolls' and not (c->>'important')::boolean) then continue; end if;
      select e->>'name' into actor from jsonb_array_elements(coalesce(t.source#>'{snapshot,entities}','[]')) e where e->>'id'=c->>'actorId';
      checks := checks || jsonb_build_array(jsonb_build_object('id',c->'id','kind',c->'kind','actorId',c->'actorId','actorName',coalesce(actor,''),'dice',c->'dice','kept',c->'kept','modifier',c->'modifier','total',c->'total','success',c->'success','dc',case when (t.settings->>'showDc')::boolean and (c->>'dcPublic')::boolean then c->'dc' else 'null'::jsonb end,'advantage',c->'advantage','interactive',t.settings->'interactiveDice','canReroll',t.status='awaiting_confirmation' and (t.settings#>>'{difficulty,rerolls}'='unlimited' or (t.settings#>>'{difficulty,rerolls}'='limited' and remaining>0)),'rollNumber',c->'rollNumber'));
    end loop;
  end if;
  return jsonb_build_object('id',t.id,'campaign_id',t.campaign_id,'session_id',t.session_id,'mode',t.input->'mode','input',t.input->'input','companionId',t.input->'companionId','listenerIds',t.input->'listenerIds','status',t.status,'expectedRevision',t.expected_revision,'committedRevision',t.committed_revision,'settingsRevision',t.settings_revision,'created_at',t.created_at,'updated_at',t.updated_at,'narration',t.narration,'visualDescription',t.visual_description,'checks',checks,'proposal',t.proposal,'failure',t.failure,'canRetry',t.status='failed' and t.retryable,'canCancel',t.status not in ('committed','cancelled'));
end;
$$;

create function rpg_private.runtime_play(cid uuid) returns jsonb language plpgsql stable set search_path='' as $$
declare state rpg_private.runtime_state%rowtype;
begin
  select * into strict state from rpg_private.runtime_state where campaign_id=cid;
  return jsonb_build_object('campaignId',cid,'revision',state.revision,'configured',state.configuration is not null,'model',null,'configuration',state.configuration,'worldMinutes',state.world_minutes,
    'turns',coalesce((select jsonb_agg(rpg_private.runtime_public_turn(t) order by t.sequence) from rpg_private.turns t where campaign_id=cid and (t.status not in ('committed','cancelled') or t.id in (select recent.id from rpg_private.turns recent where recent.campaign_id=cid and recent.status in ('committed','cancelled') order by recent.sequence desc limit 64))),'[]'),
    'restRecords',coalesce((select jsonb_agg(jsonb_build_object('id',id,'campaign_id',campaign_id,'kind',kind,'status',status,'settings_revision',settings_revision,'public_outcome',public_outcome,'created_at',created_at) order by created_at,id) from public.rpg_rest_records where campaign_id=cid),'[]'),
    'recipes',coalesce((select jsonb_agg(jsonb_build_object('id',id,'campaign_id',campaign_id,'name',name,'ingredients',ingredients,'effect_definition',effect_definition)) from public.rpg_recipes where campaign_id=cid),'[]'),
    'effects',coalesce((select jsonb_agg(jsonb_build_object('id',id,'campaign_id',campaign_id,'entity_id',entity_id,'recipe_id',recipe_id,'definition',definition)) from public.rpg_effects where campaign_id=cid),'[]'),
    'encounters',coalesce((select jsonb_agg(jsonb_build_object('id',id,'campaign_id',campaign_id,'status',status,'round',round,'outcome',outcome,'settings_revision',settings_revision,'public_summary',public_summary)) from public.rpg_encounters where campaign_id=cid),'[]'),
    'participants',coalesce((select jsonb_agg(jsonb_build_object('id',id,'campaign_id',campaign_id,'encounter_id',encounter_id,'entity_id',entity_id,'public_name',public_name,'turn_order',turn_order,'public_position',public_position,'public_resources',public_resources) order by turn_order) from public.rpg_encounter_participants where campaign_id=cid),'[]'),
    'pendingActions',coalesce((select jsonb_agg(jsonb_build_object('id',id,'campaign_id',campaign_id,'encounter_id',encounter_id,'participant_id',participant_id,'status',status,'public_proposal',public_proposal)) from public.rpg_pending_actions where campaign_id=cid),'[]'),
    'conversations',coalesce((select jsonb_agg(jsonb_build_object('id',id,'campaign_id',campaign_id,'entity_id',entity_id,'entries',entries,'created_at',created_at)) from public.rpg_conversations where campaign_id=cid),'[]'),
    'sessionGuidance',coalesce((select jsonb_agg(jsonb_build_object('id',g.id,'campaign_id',g.campaign_id,'session_id',g.session_id,'text',g.text,'created_at',g.created_at)) from public.rpg_session_guidance g join public.rpg_sessions s on s.id=g.session_id and s.campaign_id=g.campaign_id where g.campaign_id=cid and s.status='open'),'[]'),
    'provenance',coalesce((select jsonb_agg(jsonb_build_object('id',id,'campaign_id',campaign_id,'operation_id',operation_id,'session_id',session_id,'inputs',inputs,'outputItemIds',"outputItemIds")) from public.rpg_provenance where campaign_id=cid),'[]'));
end;
$$;

create function rpg_private.runtime_source(cid uuid,uid uuid,mode text default 'game') returns jsonb language plpgsql stable set search_path='' as $$
declare snapshot jsonb;
begin
  snapshot := jsonb_build_object(
    'campaign',(select jsonb_build_object('id',id,'campaign_id',campaign_id,'title',title,'subtitle',subtitle,'language',language,'revision',revision,'updated_at',updated_at) from public.rpg_campaigns where id=cid),
    'settings',(select jsonb_build_object('campaign_id',campaign_id,'revision',revision,'updated_at',updated_at,'values',values) from public.rpg_settings where campaign_id=cid),
    'settingsHistory','[]'::jsonb,
    'documents',coalesce((select jsonb_agg(jsonb_build_object('id',id,'campaign_id',campaign_id,'title',title,'status',status,'body',body,'current_version_id',current_version_id,'revision',revision,'updated_at',updated_at)) from public.rpg_documents where campaign_id=cid),'[]'),
    'entities',coalesce((select jsonb_agg(jsonb_build_object('id',id,'campaign_id',campaign_id,'kind',kind,'name',name,'details',details,'hp',hp,'max_hp',max_hp,'stats',stats,'resources',resources,'conditions',conditions,'equipment_slots',equipment_slots,'revision',revision,'updated_at',updated_at)) from public.rpg_entities where campaign_id=cid),'[]'),
    'storages',coalesce((select jsonb_agg(jsonb_build_object('id',id,'campaign_id',campaign_id,'name',name,'kind',kind,'entity_id',entity_id,'revision',revision,'updated_at',updated_at)) from public.rpg_storages where campaign_id=cid),'[]'),
    'items',coalesce((select jsonb_agg(jsonb_build_object('id',id,'campaign_id',campaign_id,'name',name,'category',category,'quantity',quantity,'description',description,'mechanics',mechanics,'owner_entity_id',owner_entity_id,'storage_id',storage_id,'equipped_entity_id',equipped_entity_id,'equipped_slot',equipped_slot,'revision',revision,'updated_at',updated_at)) from public.rpg_items where campaign_id=cid),'[]'),
    'sessions',coalesce((select jsonb_agg(jsonb_build_object('id',id,'campaign_id',campaign_id,'title',title,'status',status,'recap',recap,'revision',revision,'updated_at',updated_at)) from public.rpg_sessions where campaign_id=cid),'[]'),
    'scenes',coalesce((select jsonb_agg(jsonb_build_object('id',id,'campaign_id',campaign_id,'session_id',session_id,'title',title,'body',body,'role',role,'settings_revision',settings_revision,'created_at',created_at,'revision',revision,'updated_at',updated_at,'sequence',sequence) order by sequence) from public.rpg_scenes where campaign_id=cid),'[]'),
    'publicState',(select jsonb_build_object('campaign_id',campaign_id,'summary',summary,'current_session_id',current_session_id,'current_scene_id',current_scene_id,'current_location_id',current_location_id,'revision',revision,'updated_at',updated_at) from public.rpg_public_state where campaign_id=cid),
    'quests',coalesce((select jsonb_agg(jsonb_build_object('id',id,'campaign_id',campaign_id,'title',title,'description',description,'status',status,'revision',revision,'updated_at',updated_at)) from public.rpg_quests where campaign_id=cid),'[]'),
    'locations',coalesce((select jsonb_agg(jsonb_build_object('id',id,'campaign_id',campaign_id,'name',name,'description',description,'status',status,'revision',revision,'updated_at',updated_at)) from public.rpg_locations where campaign_id=cid),'[]'),
    'assets','[]'::jsonb,
    'feedback',coalesce((select jsonb_agg(jsonb_build_object('id',id,'campaign_id',campaign_id,'body',body,'created_at',created_at,'sequence',sequence) order by sequence) from public.rpg_dm_feedback where campaign_id=cid),'[]'),
    'dmGuideDocumentId',(select document_id from public.rpg_dm_guides where campaign_id=cid));
  return jsonb_build_object('ownerId',uid,'snapshot',snapshot,'runtime',rpg_private.runtime_play(cid),'privateState',case when mode in ('feedback','ooc','companion') then '{}'::jsonb else coalesce((select contents from rpg_private.dm_state where campaign_id=cid),'{}') end,'checkpoint',null,'historyComplete',(select count(*)<=64 from rpg_private.turns where campaign_id=cid and status='committed'));
end;
$$;

-- Explicit bounded mutable field lists, including the pre-existing inert families.
create function rpg_private.runtime_change(cid uuid,opid uuid,change jsonb) returns void language plpgsql set search_path='' as $$
declare family text := change->>'family'; rid uuid := (change->>'id')::uuid; data jsonb := change->'values'; fields text[]; tbl text; old jsonb; rowdata jsonb; assignments text; column_list text; select_list text; revisioned boolean := false; field text; ref uuid;
begin
  perform rpg_private.fields(change,array['family','id','expectedRevision','values']);
  perform rpg_private.assert(rid is not null and jsonb_typeof(data)='object');
  case family
    when 'entities' then fields:=array['kind','name','details','hp','max_hp','stats','resources','conditions','equipment_slots']; revisioned:=true;
    when 'items' then fields:=array['name','category','quantity','description','mechanics','owner_entity_id','storage_id','equipped_entity_id','equipped_slot']; revisioned:=true;
    when 'quests' then fields:=array['title','description','status']; revisioned:=true;
    when 'locations' then fields:=array['name','description','status']; revisioned:=true;
    when 'public_state' then fields:=array['summary','current_session_id','current_scene_id','current_location_id']; revisioned:=true;
    when 'conversations' then fields:=array['entity_id','entries'];
    when 'rest_records' then fields:=array['kind','status','settings_revision','public_outcome'];
    when 'recipes' then fields:=array['name','ingredients','effect_definition'];
    when 'effects' then fields:=array['entity_id','recipe_id','definition'];
    when 'encounters' then fields:=array['status','round','outcome','settings_revision','public_summary'];
    when 'encounter_participants' then fields:=array['encounter_id','entity_id','public_name','turn_order','public_position','public_resources'];
    when 'pending_actions' then fields:=array['encounter_id','participant_id','status','public_proposal'];
    when 'provenance' then fields:=array['operation_id','session_id','inputs','outputItemIds'];
    else raise exception 'rpg_validation';
  end case;
  perform rpg_private.fields(data,'{}',fields);
  tbl := 'rpg_' || family;
  if family='public_state' then
    perform rpg_private.assert(rid=cid);
    select to_jsonb(s) into old from public.rpg_public_state s where campaign_id=cid for update;
  else
    execute format('select to_jsonb(t) from public.%I t where id=$1 and campaign_id=$2 for update',tbl) into old using rid,cid;
    -- An ID in another campaign cannot be adopted by an INSERT/UPSERT.
    if old is null then execute format('select to_jsonb(t) from public.%I t where id=$1',tbl) into rowdata using rid; perform rpg_private.assert(rowdata is null); end if;
  end if;
  if old is null then perform rpg_private.fields(data,fields); else data := (old - array['id','campaign_id','revision','updated_at','created_at','sequence']) || data; end if;
  if revisioned and coalesce((old->>'revision')::integer,0) <> coalesce((change->>'expectedRevision')::integer,0) then raise exception 'rpg_conflict'; end if;
  if not revisioned then perform rpg_private.assert(change->'expectedRevision'='null'); end if;
  if family='entities' then
    perform rpg_private.assert(jsonb_typeof(data->'stats')='object' and jsonb_typeof(data->'resources')='object' and jsonb_typeof(data->'conditions')='array' and jsonb_typeof(data->'equipment_slots')='array');
    perform rpg_private.assert(not exists(select 1 from jsonb_each(data->'resources') where jsonb_typeof(value)<>'number' or (value::text)::numeric < 0 or mod((value::text)::numeric,1)<>0));
  elsif family='items' then
    perform rpg_private.assert(jsonb_typeof(data->'quantity')='number' and mod((data->>'quantity')::numeric,1)=0);
    if data->>'equipped_entity_id' is not null then
      perform rpg_private.assert(exists(select 1 from public.rpg_entities e join public.rpg_storages s on s.entity_id=e.id and s.campaign_id=e.campaign_id where e.campaign_id=cid and e.id=(data->>'equipped_entity_id')::uuid and s.id=(data->>'storage_id')::uuid and exists(select 1 from jsonb_array_elements(e.equipment_slots) slot where slot->>'id'=data->>'equipped_slot' and slot->'accepts' ? (data->>'category'))));
    end if;
  elsif family='provenance' then
    perform rpg_private.assert(data->>'operation_id'=opid::text and old is null and jsonb_typeof(data->'inputs')='array' and jsonb_typeof(data->'outputItemIds')='array');
    for rowdata in select value from jsonb_array_elements(data->'inputs') loop
      perform rpg_private.fields(rowdata,array['itemId','quantity','disposition']);
      perform rpg_private.assert(rowdata->>'disposition' in ('consumed','embedded','retained') and (rowdata->>'quantity')::integer>0 and exists(select 1 from public.rpg_items where campaign_id=cid and id=(rowdata->>'itemId')::uuid));
    end loop;
    for ref in select value::text::uuid from jsonb_array_elements_text(data->'outputItemIds') loop
      perform rpg_private.assert(exists(select 1 from public.rpg_items where campaign_id=cid and id=ref));
    end loop;
  end if;
  rowdata := coalesce(old,'{}') || data || jsonb_build_object('campaign_id',cid);
  if family <> 'public_state' then rowdata := rowdata || jsonb_build_object('id',rid); end if;
  if revisioned then rowdata := rowdata || jsonb_build_object('revision',coalesce((old->>'revision')::integer,0)+1,'updated_at',now()); end if;
  if family in ('conversations','rest_records') and old is null then rowdata := rowdata || jsonb_build_object('created_at',now()); end if;
  select string_agg(format('%I=source.%I',key,key),',') into assignments from jsonb_object_keys(rowdata) key where key <> 'id' and key <> 'campaign_id' and key <> 'created_at';
  if old is not null then
    execute format('update public.%I t set %s from jsonb_populate_record(null::public.%I,$1) source where t.campaign_id=$2 and %s',tbl,assignments,tbl,case when family='public_state' then 'true' else 't.id=$3' end) using rowdata,cid,rid;
  else
    select string_agg(format('%I',key),','),string_agg(format('source.%I',key),',') into column_list,select_list from jsonb_object_keys(rowdata) key;
    execute format('insert into public.%I(%s) select %s from jsonb_populate_record(null::public.%I,$1) source',tbl,column_list,select_list,tbl) using rowdata;
  end if;
end;
$$;

create function public.rpg_runtime(p_owner_id uuid,p_campaign_id uuid,p_action text,p_payload jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare cid uuid:=p_campaign_id; uid uuid:=p_owner_id; state rpg_private.runtime_state%rowtype; turn rpg_private.turns%rowtype;
  operation_id uuid; token uuid; request_id uuid; saved rpg_private.runtime_commands%rowtype; result jsonb; data jsonb; config jsonb; guide public.rpg_documents%rowtype;
  row_revision integer; sid uuid; player_scene_id uuid; narration_id uuid; previous jsonb; entry jsonb; checks jsonb; existing jsonb; old_check jsonb; used integer; check_index integer; patch_kind text; key text; private_value jsonb;
begin
  if uid is null or not exists(select 1 from rpg_private.owner_registry where user_id=uid) then raise exception 'rpg_forbidden' using errcode='42501'; end if;
  perform rpg_private.assert(cid is not null and jsonb_typeof(p_payload)='object' and octet_length(p_payload::text)<=2000000);
  -- Shared lock order with Phase 1 corrections: campaign first, then runtime.
  perform 1 from public.rpg_campaigns where id=cid for update;
  if not found then raise exception 'rpg_not_found'; end if;
  insert into rpg_private.runtime_state(campaign_id) values(cid) on conflict do nothing;
  select * into strict state from rpg_private.runtime_state where campaign_id=cid for update;
  if p_action='play' then return rpg_private.runtime_play(cid); end if;
  if p_action='configure' then
    request_id := (p_payload->>'requestId')::uuid;
    select * into saved from rpg_private.runtime_commands where id=request_id;
    if found then
      if saved.owner_id<>uid or saved.campaign_id<>cid or saved.request<>p_payload then raise exception 'rpg_conflict'; end if;
      return rpg_private.runtime_play(cid);
    end if;
    perform rpg_private.fields(p_payload,array['requestId','campaignId','expectedRevision','configuration']);
    perform rpg_private.assert(request_id is not null and p_payload->>'campaignId'=cid::text);
    if (p_payload->>'expectedRevision')::integer<>state.revision then raise exception 'rpg_conflict'; end if;
    config:=p_payload->'configuration';
    perform rpg_private.fields(config,array['profile','controlledEntityIds','presentEntityIds','nearbyStorageIds','safeLocationIds','itemRules']);
    perform rpg_private.assert(config->>'profile'='console-basic-v1');
    foreach key in array array['controlledEntityIds','presentEntityIds','nearbyStorageIds','safeLocationIds','itemRules'] loop
      perform rpg_private.assert(jsonb_typeof(config->key)='array' and jsonb_array_length(config->key)<=100);
    end loop;
    perform rpg_private.assert(jsonb_array_length(config->'controlledEntityIds')>0);
    for entry in select value from jsonb_array_elements(config->'controlledEntityIds') loop
      perform rpg_private.assert(exists(select 1 from public.rpg_entities where campaign_id=cid and id=(entry#>>'{}')::uuid and kind in ('player','companion')));
    end loop;
    for entry in select value from jsonb_array_elements(config->'presentEntityIds') loop perform rpg_private.assert(exists(select 1 from public.rpg_entities where campaign_id=cid and id=(entry#>>'{}')::uuid)); end loop;
    for entry in select value from jsonb_array_elements(config->'nearbyStorageIds') loop perform rpg_private.assert(exists(select 1 from public.rpg_storages where campaign_id=cid and id=(entry#>>'{}')::uuid and kind='transport')); end loop;
    for entry in select value from jsonb_array_elements(config->'safeLocationIds') loop perform rpg_private.assert(exists(select 1 from public.rpg_locations where campaign_id=cid and id=(entry#>>'{}')::uuid)); end loop;
    for entry in select value from jsonb_array_elements(config->'itemRules') loop
      perform rpg_private.fields(entry,array['itemId','tag','damage']);
      perform rpg_private.assert(exists(select 1 from public.rpg_items where campaign_id=cid and id=(entry->>'itemId')::uuid) and entry->>'tag' in ('supply','meat','coffee','water','knife','stick','binding','cutting-tool','weapon','healing','meal-serving','coffee-serving') and (entry->'damage'='null' or (jsonb_typeof(entry->'damage')='number' and (entry->>'damage')::integer between 1 and 20)));
    end loop;
    select values,public.rpg_settings.revision into data,row_revision from public.rpg_settings where campaign_id=cid;
    data:=jsonb_set(data,'{rulesSystem}','{"id":"console-basic-v1","label":"Console basic house rules","enemyHpScaling":true,"enemyDamageScaling":true}');
    update public.rpg_settings set values=data,revision=row_revision+1,updated_at=now() where campaign_id=cid;
    insert into public.rpg_settings_revisions(campaign_id,values,revision) values(cid,data,row_revision+1);
    update rpg_private.runtime_state set configuration=config,revision=revision+1,updated_at=now() where campaign_id=cid;
    result:=rpg_private.runtime_play(cid);
    insert into rpg_private.runtime_commands(id,campaign_id,owner_id,request,result) values(request_id,cid,uid,p_payload,result);
    return result;
  end if;
  operation_id := (p_payload->>'operationId')::uuid;
  perform rpg_private.assert(operation_id is not null);
  select * into turn from rpg_private.turns where id=operation_id for update;
  if found and (turn.campaign_id<>cid or turn.owner_id<>uid) then raise exception 'rpg_not_found'; end if;
  if p_action='begin' then
    if turn.id is not null then if turn.input<>p_payload then raise exception 'rpg_conflict'; end if; return rpg_private.runtime_public_turn(turn); end if;
    perform rpg_private.fields(p_payload,array['operationId','campaignId','expectedRevision','mode','input','companionId','listenerIds','mechanic']);
    perform rpg_private.assert(p_payload->>'campaignId'=cid::text and p_payload->>'mode' in ('game','companion','feedback','ooc','mechanic') and jsonb_typeof(p_payload->'input')='string' and length(btrim(p_payload->>'input')) between 1 and 20000 and jsonb_typeof(p_payload->'listenerIds')='array' and jsonb_array_length(p_payload->'listenerIds')<=20);
    if (p_payload->>'expectedRevision')::integer<>state.revision then raise exception 'rpg_conflict'; end if;
    if p_payload->>'mode' in ('game','companion','mechanic') and exists(select 1 from rpg_private.turns where campaign_id=cid and input->>'mode' in ('game','companion','mechanic') and (status in ('pending','generating','awaiting_confirmation') or (status='failed' and retryable))) then raise exception 'rpg_conflict'; end if;
    select current_session_id into sid from public.rpg_public_state where campaign_id=cid;
    if p_payload->>'mode' in ('game','companion','mechanic') then perform rpg_private.assert(sid is not null and exists(select 1 from public.rpg_sessions where campaign_id=cid and id=sid and status='open')); end if;
    if p_payload->>'mode'='companion' then
      perform rpg_private.assert(exists(select 1 from public.rpg_entities where campaign_id=cid and id=(p_payload->>'companionId')::uuid and kind='companion') and state.configuration->'presentEntityIds' ? (p_payload->>'companionId'));
    else perform rpg_private.assert(p_payload->'companionId'='null'); end if;
    for entry in select value from jsonb_array_elements(p_payload->'listenerIds') loop perform rpg_private.assert(exists(select 1 from public.rpg_entities where campaign_id=cid and id=(entry#>>'{}')::uuid) and state.configuration->'presentEntityIds' ? (entry#>>'{}')); end loop;
    select d.* into strict guide from public.rpg_documents d join public.rpg_dm_guides g on g.document_id=d.id and g.campaign_id=d.campaign_id where g.campaign_id=cid;
    select values,public.rpg_settings.revision into data,row_revision from public.rpg_settings where campaign_id=cid;
    insert into rpg_private.turns(id,campaign_id,owner_id,session_id,input,expected_revision,settings_revision,settings,guide_revision,guide_version_id) values(operation_id,cid,uid,sid,p_payload,state.revision,row_revision,data,guide.revision,guide.current_version_id) returning * into turn;
    return rpg_private.runtime_public_turn(turn);
  end if;
  if turn.id is null then raise exception 'rpg_not_found'; end if;
  if p_action='get' then return rpg_private.runtime_public_turn(turn); end if;
  if p_action='claim' then
    if turn.status in ('committed','cancelled') or (turn.status='failed' and not turn.retryable) then return null; end if;
    if turn.lease_until>now() then return null; end if;
    if turn.expected_revision<>state.revision then
      update rpg_private.turns set status='failed',failure='conflict',retryable=false,lease_token=null,lease_until=null,updated_at=now() where id=operation_id;
      return null;
    end if;
    token:=gen_random_uuid();
    update rpg_private.turns set lease_token=token,lease_until=now()+interval '300 seconds',source=coalesce(source,rpg_private.runtime_source(cid,uid,turn.input->>'mode')),updated_at=now() where id=operation_id returning * into turn;
    return jsonb_build_object('lease',jsonb_build_object('campaignId',cid,'operationId',operation_id,'token',token,'expectedRevision',turn.expected_revision),'turn',jsonb_build_object('input',turn.input,'public',rpg_private.runtime_public_turn(turn),'checkpoint',turn.checkpoint),'source',turn.source);
  end if;
  if p_action='cancel' then
    perform rpg_private.fields(p_payload,array['commandId','campaignId','operationId','action','checkId']);
    request_id:=(p_payload->>'commandId')::uuid;
    perform rpg_private.assert(request_id is not null and p_payload->>'campaignId'=cid::text and p_payload->>'action'='cancel' and p_payload->'checkId'='null');
    select * into saved from rpg_private.runtime_commands where id=request_id;
    if found then
      if saved.owner_id<>uid or saved.campaign_id<>cid or saved.request<>p_payload then raise exception 'rpg_conflict'; end if;
      return rpg_private.runtime_public_turn(turn);
    end if;
    if turn.status='committed' then raise exception 'rpg_conflict'; end if;
    if turn.status<>'cancelled' then update rpg_private.turns set status='cancelled',lease_token=null,lease_until=null,retryable=false,updated_at=now() where id=operation_id returning * into turn; end if;
    result:=rpg_private.runtime_public_turn(turn);
    insert into rpg_private.runtime_commands(id,campaign_id,owner_id,operation_id,request,result) values(request_id,cid,uid,operation_id,p_payload,result);
    return result;
  end if;
  if p_action='guidance' then
    request_id:=(p_payload->>'requestId')::uuid;
    select * into saved from rpg_private.runtime_commands where id=request_id;
    if found then if saved.owner_id<>uid or saved.campaign_id<>cid or saved.request<>p_payload then raise exception 'rpg_conflict'; end if; return saved.result; end if;
    perform rpg_private.fields(p_payload,array['requestId','campaignId','operationId','proposalId','scope','sessionId','expectedGuideRevision']);
    perform rpg_private.assert(request_id is not null and p_payload->>'campaignId'=cid::text and turn.status='committed' and turn.input->>'mode'='feedback' and turn.proposal is not null and turn.proposal->>'id'=p_payload->>'proposalId' and turn.proposal->>'status'='proposed' and p_payload->>'scope' in ('session','campaign'));
    select d.* into strict guide from public.rpg_documents d join public.rpg_dm_guides g on g.document_id=d.id and g.campaign_id=d.campaign_id where g.campaign_id=cid for update of d;
    if guide.revision is distinct from (p_payload->>'expectedGuideRevision')::integer or (turn.proposal->>'documentRevision')::integer is distinct from (p_payload->>'expectedGuideRevision')::integer then raise exception 'rpg_conflict'; end if;
    if p_payload->>'scope'='session' then
      sid:=(p_payload->>'sessionId')::uuid;
      perform rpg_private.assert(sid is not null and sid=turn.session_id and exists(select 1 from public.rpg_public_state p join public.rpg_sessions s on s.id=p.current_session_id and s.campaign_id=p.campaign_id where p.campaign_id=cid and s.id=sid and s.status='open'));
      insert into public.rpg_session_guidance(id,campaign_id,session_id,text) values(request_id,cid,sid,turn.proposal->>'text');
    else
      perform rpg_private.assert(p_payload->'sessionId'='null');
      data:=to_jsonb(guide.body || case when guide.body='' then '' else E'\n\n' end || (turn.proposal->>'text'));
      perform rpg_private.assert(length(data#>>'{}')<=200000);
      token:=gen_random_uuid();
      update public.rpg_documents set body=data#>>'{}',revision=guide.revision+1,current_version_id=token,updated_at=now() where id=guide.id;
      insert into public.rpg_document_versions(id,campaign_id,document_id,version,title,status,body) values(token,cid,guide.id,guide.revision+1,guide.title,guide.status,data#>>'{}');
    end if;
    data:=turn.proposal || jsonb_build_object('status','approved','scope',p_payload->'scope','sessionId',p_payload->'sessionId','documentRevision',guide.revision+case when p_payload->>'scope'='campaign' then 1 else 0 end);
    update rpg_private.turns set proposal=data,updated_at=now() where id=operation_id;
    result:=jsonb_build_object('proposal',data,'revision',(select r.revision from rpg_private.runtime_state r where campaign_id=cid));
    insert into rpg_private.runtime_commands(id,campaign_id,owner_id,operation_id,request,result) values(request_id,cid,uid,operation_id,p_payload,result);
    return result;
  end if;
  if p_action='commit' and turn.status='committed' then
    if exists(select 1 from rpg_private.runtime_events e where e.campaign_id=cid and e.operation_id=turn.id and e.payload->'packet'=p_payload->'packet') then return rpg_private.runtime_public_turn(turn); end if;
    raise exception 'rpg_conflict';
  end if;
  -- All remaining writes are fenced. A timed-out claimant cannot mutate anything.
  token:=(p_payload->>'token')::uuid;
  if turn.lease_token is distinct from token or token is null or turn.lease_until<=now() or turn.status in ('committed','cancelled') then raise exception 'rpg_conflict'; end if;
  if (turn.expected_revision<>state.revision or (p_payload->>'expectedRevision')::integer<>state.revision) and not (p_action='fail' and p_payload->>'failure'='conflict') then raise exception 'rpg_conflict'; end if;
  if p_action='fail' then
    perform rpg_private.assert(p_payload->>'failure' in ('configuration','provider','context','validation','conflict','unavailable') and jsonb_typeof(p_payload->'retryable')='boolean');
    update rpg_private.turns set status='failed',failure=p_payload->>'failure',retryable=(p_payload->>'retryable')::boolean and p_payload->>'failure'<>'conflict',lease_token=null,lease_until=null,updated_at=now() where id=operation_id returning * into turn;
    return rpg_private.runtime_public_turn(turn);
  elsif p_action='checkpoint' then
    data:=p_payload->'checkpoint';
    perform rpg_private.fields(data,array['plan','checks','resolution','narration','feedback','usage']);
    perform rpg_private.assert(data->'checks'=turn.checkpoint->'checks' and p_payload->>'status' in ('generating','awaiting_confirmation'));
    if turn.checkpoint->'plan'<>'null' then perform rpg_private.assert(data->'plan'=turn.checkpoint->'plan'); end if;
    if p_payload->>'status'='awaiting_confirmation' then perform rpg_private.assert(exists(select 1 from jsonb_array_elements(data->'checks') c where c->>'visibility'='player' and turn.settings->>'dicePresentation'<>'hidden' and (turn.settings->>'dicePresentation'='all-player-rolls' or (c->>'important')::boolean))); end if;
    update rpg_private.turns set checkpoint=data,status=p_payload->>'status',failure=null,retryable=false,lease_token=case when p_payload->>'status'='awaiting_confirmation' then null else token end,lease_until=case when p_payload->>'status'='awaiting_confirmation' then null else lease_until end,updated_at=now() where id=operation_id;
    return null;
  elsif p_action in ('checks','reroll') then
    checks:=p_payload->'checks';
    if p_action='checks' and jsonb_array_length(turn.checkpoint->'checks')>0 then return turn.checkpoint->'checks'; end if;
    if p_action='reroll' then
      data:=p_payload->'command'; request_id:=(data->>'commandId')::uuid;
      select * into saved from rpg_private.runtime_commands where id=request_id;
      if found then if saved.owner_id<>uid or saved.campaign_id<>cid or saved.request<>data then raise exception 'rpg_conflict'; end if; return turn.checkpoint->'checks'; end if;
      perform rpg_private.assert(request_id is not null and data->>'action'='reroll' and data->>'campaignId'=cid::text and data->>'operationId'=operation_id::text and turn.status='awaiting_confirmation');
      select c into old_check from jsonb_array_elements(turn.checkpoint->'checks') c where c->>'id'=data->>'checkId';
      perform rpg_private.assert(old_check is not null and old_check->>'visibility'='player' and turn.settings->>'dicePresentation'<>'hidden' and (turn.settings->>'dicePresentation'='all-player-rolls' or (old_check->>'important')::boolean));
      select count(*)::integer into used from rpg_private.runtime_commands q join rpg_private.turns r on q.operation_id=r.id where q.campaign_id=cid and r.session_id is not distinct from turn.session_id and q.request->>'action'='reroll';
      perform rpg_private.assert(turn.settings#>>'{difficulty,rerolls}'='unlimited' or (turn.settings#>>'{difficulty,rerolls}'='limited' and used<(turn.settings#>>'{difficulty,rerollsPerSession}')::integer));
      entry:=p_payload->'check';
      perform rpg_private.assert(entry->>'id'=old_check->>'id' and (entry->>'rollNumber')::integer=(old_check->>'rollNumber')::integer+1 and (entry - array['dice','kept','total','success','rollNumber'])=(old_check - array['dice','kept','total','success','rollNumber']));
      select jsonb_agg(case when c->>'id'=entry->>'id' then entry else c end order by (c->>'index')::integer) into checks from jsonb_array_elements(turn.checkpoint->'checks') c;
    end if;
    perform rpg_private.assert(jsonb_typeof(checks)='array' and jsonb_array_length(checks)<=8 and turn.checkpoint->'plan'<>'null');
    for entry in select value from jsonb_array_elements(checks) loop
      perform rpg_private.fields(entry,array['index','actorId','targetId','kind','stat','dc','dcPublic','visibility','important','uncertainty','advantage','id','dice','kept','modifier','total','success','rollNumber']);
      perform rpg_private.assert(exists(select 1 from public.rpg_entities where campaign_id=cid and id=(entry->>'actorId')::uuid) and (entry->>'targetId' is null or exists(select 1 from public.rpg_entities where campaign_id=cid and id=(entry->>'targetId')::uuid)));
      perform rpg_private.assert(entry->>'visibility' in ('player','private') and entry->>'kind' in ('skill','attack','save','transform') and entry->>'stat' in ('skill','attack','save') and (entry->>'index')::integer between 0 and 7 and (entry->>'dc')::integer between 1 and 40 and (entry->>'rollNumber')::integer>=1);
      perform rpg_private.assert(jsonb_typeof(entry->'dice')='array' and jsonb_array_length(entry->'dice')=case when entry->>'advantage'='normal' then 1 else 2 end and not exists(select 1 from jsonb_array_elements(entry->'dice') d where jsonb_typeof(d)<>'number' or (d::text)::integer not between 1 and 20));
      perform rpg_private.assert((entry->>'kept')::integer=case when entry->>'advantage'='disadvantage' then (select min((v::text)::integer) from jsonb_array_elements(entry->'dice') v) else (select max((v::text)::integer) from jsonb_array_elements(entry->'dice') v) end and (entry->>'total')::integer=(entry->>'kept')::integer+(entry->>'modifier')::integer and (entry->>'success')::boolean=((entry->>'total')::integer>=(entry->>'dc')::integer));
    end loop;
    perform rpg_private.assert((select count(*)=count(distinct value->>'id') and count(*)=count(distinct value->>'index') from jsonb_array_elements(checks)));
    update rpg_private.turns set checkpoint=jsonb_set(checkpoint,'{checks}',checks),updated_at=now() where id=operation_id;
    if p_action='reroll' then insert into rpg_private.runtime_commands(id,campaign_id,owner_id,operation_id,request,result) values(request_id,cid,uid,operation_id,data,checks); end if;
    return checks;
  elsif p_action='commit' then
    data:=p_payload->'packet';
    perform rpg_private.fields(data,array['narration','visualDescription','resolution','privatePatches','checks','guidanceProposal']);
    perform rpg_private.assert(jsonb_typeof(data->'narration')='string' and length(btrim(data->>'narration')) between 1 and 6000 and jsonb_typeof(data->'visualDescription')='string' and length(data->>'visualDescription')<=2000 and data->'checks'=turn.checkpoint->'checks');
    perform rpg_private.fields(data->'resolution',array['changes','worldMinutes','configuration','outcomes']);
    perform rpg_private.assert(jsonb_typeof(data#>'{resolution,changes}')='array' and jsonb_array_length(data#>'{resolution,changes}')<=100 and jsonb_typeof(data->'privatePatches')='array' and jsonb_array_length(data->'privatePatches')<=20);
    if turn.input->>'mode' in ('feedback','ooc') then
      perform rpg_private.assert(data#>'{resolution,changes}'='[]' and data->'privatePatches'='[]' and data->'checks'='[]' and (data#>>'{resolution,worldMinutes}')::integer=state.world_minutes and data#>'{resolution,configuration}' is not distinct from coalesce(state.configuration,'null'));
      if turn.input->>'mode'='feedback' then insert into public.rpg_dm_feedback(id,campaign_id,body) values(operation_id,cid,turn.input->>'input'); end if;
    else
      perform rpg_private.assert(data->'guidanceProposal'='null' and turn.session_id is not null and exists(select 1 from public.rpg_sessions where id=turn.session_id and campaign_id=cid and status='open'));
      for entry in select value from jsonb_array_elements(data#>'{resolution,changes}') loop perform rpg_private.runtime_change(cid,operation_id,entry); end loop;
      perform rpg_private.assert((data#>>'{resolution,worldMinutes}')::integer>=state.world_minutes and (data#>>'{resolution,worldMinutes}')::integer<=state.world_minutes+1440);
      update rpg_private.runtime_state set world_minutes=(data#>>'{resolution,worldMinutes}')::integer,configuration=data#>'{resolution,configuration}',revision=revision+1,updated_at=now() where campaign_id=cid;
      player_scene_id:=gen_random_uuid();
      insert into public.rpg_scenes(id,campaign_id,session_id,title,body,role,settings_revision,revision) values(player_scene_id,cid,turn.session_id,'Player action',turn.input->>'input','player',turn.settings_revision,1);
      narration_id:=gen_random_uuid();
      insert into public.rpg_scenes(id,campaign_id,session_id,title,body,role,settings_revision,revision) values(narration_id,cid,turn.session_id,'DM',data->>'narration','narration',turn.settings_revision,1);
      update public.rpg_public_state set current_scene_id=narration_id,current_session_id=turn.session_id,revision=public.rpg_public_state.revision+1,updated_at=now() where campaign_id=cid;
      if turn.input->>'mode'='companion' then
        insert into public.rpg_conversations(id,campaign_id,entity_id,entries) values(operation_id,cid,(turn.input->>'companionId')::uuid,jsonb_build_array(jsonb_build_object('operationId',operation_id,'sessionId',turn.session_id,'listenerIds',turn.input->'listenerIds','input',turn.input->'input','reply',data->'narration')));
      end if;
      if jsonb_array_length(data->'privatePatches')>0 then
        select contents into private_value from rpg_private.dm_state where campaign_id=cid for update; private_value:=coalesce(private_value,'{}');
        for entry in select value from jsonb_array_elements(data->'privatePatches') loop
          perform rpg_private.fields(entry,array['kind','key','operation','value','amount']);
          patch_kind:=entry->>'kind'; key:=entry->>'key';
          perform rpg_private.assert(patch_kind in ('fact','clock','npc','faction','consequence') and key ~ '^[a-zA-Z0-9_-]{1,80}$');
          if not private_value ? patch_kind then private_value:=private_value||jsonb_build_object(patch_kind,'{}'::jsonb); end if;
          if entry->>'operation'='set' then
            perform rpg_private.assert(jsonb_typeof(entry->'value')='string' and length(entry->>'value')<=2000 and entry->'amount'='null');
            private_value:=jsonb_set(private_value,array[patch_kind,key],entry->'value');
          else
            perform rpg_private.assert(entry->>'operation'='advance' and patch_kind='clock' and entry->'value'='null' and (entry->>'amount')::integer between 0 and 100);
            private_value:=jsonb_set(private_value,array[patch_kind,key],to_jsonb(coalesce((private_value#>>array[patch_kind,key])::integer,0)+(entry->>'amount')::integer));
          end if;
        end loop;
        insert into rpg_private.dm_state(campaign_id,contents) values(cid,private_value) on conflict(campaign_id) do update set contents=excluded.contents,revision=rpg_private.dm_state.revision+1,updated_at=now();
      end if;
    end if;
    if data->>'guidanceProposal' is not null then
      perform rpg_private.assert(turn.input->>'mode'='feedback' and length(btrim(data->>'guidanceProposal')) between 1 and 2000);
      previous:=jsonb_build_object('id',gen_random_uuid(),'text',data->'guidanceProposal','status','proposed','scope',null,'sessionId',null,'documentRevision',turn.guide_revision);
    else previous:=null; end if;
    insert into rpg_private.runtime_events(campaign_id,operation_id,payload) values(cid,operation_id,jsonb_build_object('input',turn.input,'packet',data,'sourceRevision',turn.expected_revision,'settingsRevision',turn.settings_revision,'guideVersionId',turn.guide_version_id,'playerSceneId',player_scene_id,'narrationSceneId',narration_id));
    update rpg_private.turns set status='committed',committed_revision=(select r.revision from rpg_private.runtime_state r where campaign_id=cid),narration=data->>'narration',visual_description=data->>'visualDescription',proposal=previous,lease_token=null,lease_until=null,failure=null,retryable=false,updated_at=now() where id=operation_id returning * into turn;
    return rpg_private.runtime_public_turn(turn);
  end if;
  raise exception 'rpg_validation';
end;
$$;

do $$ declare t text; begin
  foreach t in array array['runtime_state','turns','runtime_commands','runtime_events'] loop
    execute format('alter table rpg_private.%I enable row level security',t);
  end loop;
  foreach t in array array['rpg_session_guidance','rpg_provenance'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from public,anon,authenticated',t);
    execute format('grant select on public.%I to authenticated',t);
    execute format('create policy owner_read on public.%I for select to authenticated using ((select public.rpg_is_owner()))',t);
  end loop;
end $$;
revoke all on all tables in schema rpg_private from public,anon,authenticated;
revoke all on all sequences in schema rpg_private from public,anon,authenticated;
revoke all on all functions in schema rpg_private from public,anon,authenticated;
revoke all on function public.rpg_runtime(uuid,uuid,text,jsonb) from public,anon,authenticated;
do $$ begin
  if exists(select 1 from pg_roles where rolname='service_role') then
    grant execute on function public.rpg_runtime(uuid,uuid,text,jsonb) to service_role;
  end if;
end $$;
commit;
