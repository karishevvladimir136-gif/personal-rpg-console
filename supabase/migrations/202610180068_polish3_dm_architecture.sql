-- Polish 3 (docs/stages/POLISH_3.md): the DM architecture as a campaign setting (§2), the
-- state snapshot at every committed turn for replayable blind tests (§4), and the picture
-- defaults by the owner's second blind page (§5). Additive: new columns with defaults, one
-- new table, one new RPC; the functions that change are replaced in full.
begin;

-- 1. The models in their roles ------------------------------------------------------------
-- Migration 52 admitted Claude Opus 5.5 and GPT-6 Astra for the campaign's turn. The split
-- (the bake-off's C and D) names a writer — Opus 5.5 or Fable 5.1 — and a bookkeeper —
-- Opus 5.5 or Sonnet 5.5. The execution-profile pin of a loop turn («dm.turn») and the
-- opening's «world.compose» ticket take any writer («pin»); the single loop's own choice
-- («turn») stays Opus or Astra. Callers in plpgsql resolve the name at run time, so the
-- one-argument function is replaced by one with a defaulted role.
drop function rpg_private.dm_turn_model_selection(jsonb);
create function rpg_private.dm_turn_model_selection(v jsonb, role text default 'turn') returns void
language plpgsql immutable set search_path='' as $$
declare m text; begin
 perform rpg_private.fields(v,array['providerId','modelId','reasoning']);
 perform rpg_private.assert(role in ('turn','writer','bookkeeper','pin'));
 m:=v->>'modelId';
 perform rpg_private.assert(
  (v->>'providerId'='anthropic' and (m='claude-opus-5-5'
    or (m='claude-fable-5-1' and role in ('writer','pin'))
    or (m='claude-sonnet-5-5' and role='bookkeeper')))
  or (v->>'providerId'='openai' and m='gpt-6-astra' and role in ('turn','pin')));
 perform rpg_private.assert(v->'reasoning'='null'::jsonb or (jsonb_typeof(v->'reasoning')='string'
  and v->>'reasoning' in ('low','medium','high','xhigh','max')));
end $$;
revoke all on function rpg_private.dm_turn_model_selection(jsonb,text) from public,anon,authenticated;
do $$ begin if exists(select 1 from pg_roles where rolname='service_role') then
 revoke all on function rpg_private.dm_turn_model_selection(jsonb,text) from service_role;
end if; end $$;

-- The split itself: a writer and a bookkeeper, each a model selection with its reasoning.
create function rpg_private.dm_split_valid(v jsonb) returns void
language plpgsql immutable set search_path='' as $$
begin
 perform rpg_private.fields(v,array['writer','bookkeeper']);
 perform rpg_private.dm_turn_model_selection(v->'writer','writer');
 perform rpg_private.dm_turn_model_selection(v->'bookkeeper','bookkeeper');
end $$;
revoke all on function rpg_private.dm_split_valid(jsonb) from public,anon,authenticated;
do $$ begin if exists(select 1 from pg_roles where rolname='service_role') then
 revoke all on function rpg_private.dm_split_valid(jsonb) from service_role;
end if; end $$;

-- The turn's pin (migration 52/53): a «dm.turn» profile may now name a writer.
create or replace function public.rpg_execution_profile(p_owner_id uuid,p_campaign_id uuid,p_operation_id uuid,p_profiles jsonb,p_timeline jsonb,p_token uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_column
declare result jsonb; p jsonb; t rpg_private.turns%rowtype; j rpg_private.memory_jobs%rowtype; task text; begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id) then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id for update; if not found then raise exception 'rpg_not_found'; end if;
 perform rpg_private.timeline_assert(p_campaign_id,p_timeline);
 select coalesce(jsonb_object_agg(e.task,e.profile),'{}') into result from rpg_private.execution_profiles e where e.campaign_id=p_campaign_id and e.operation_id=p_operation_id;
 if result<>'{}' then return result; end if;
 if p_profiles is null then return '{}'::jsonb; end if;
 select * into t from rpg_private.turns where campaign_id=p_campaign_id and id=p_operation_id;
 if found then
  perform rpg_private.assert((t.status in ('pending','generating','awaiting_confirmation') or (t.status='failed' and t.retryable)) and t.lease_until>now() and t.expected_revision=(select revision from rpg_private.runtime_state where campaign_id=p_campaign_id));
  if t.input->>'mode' in ('feedback','ooc') then perform rpg_private.fields(p_profiles,array['dm.feedback']);
  elsif t.runtime_identity='dm-loop-v1' then perform rpg_private.fields(p_profiles,array['dm.turn']);
  elsif t.runtime_identity='astra-primary-v1' then perform rpg_private.fields(p_profiles,array['dm.turn','dm.plan','dm.narrate']);
  elsif (select ruleset->>'id' from rpg_private.world_foundations where campaign_id=p_campaign_id)='world-logic-v1' then perform rpg_private.fields(p_profiles,array['world.resolve','dm.narrate']);
  else perform rpg_private.fields(p_profiles,array['dm.plan','dm.narrate'],array['world.resolve']); end if;
 else
  select * into j from rpg_private.memory_jobs where campaign_id=p_campaign_id and id=p_operation_id;
  perform rpg_private.assert(j.id is not null and j.token=p_token and j.status='generating' and j.lease_until>now());
  perform rpg_private.fields(p_profiles,array['memory.summary']);
 end if;
 for task,p in select key,value from jsonb_each(p_profiles) loop
  perform rpg_private.fields(p,array['schemaVersion','id','policyRevision','registryVersion','task','providerId','modelId','reasoning']);
  if task='dm.turn' then
   perform rpg_private.assert(p->>'schemaVersion'='1' and p->>'task'=task and p->>'registryVersion'='dm-models-v1' and (p->>'policyRevision')::integer>=0 and p->'reasoning'<>'null'::jsonb);
   perform rpg_private.dm_turn_model_selection(p-array['schemaVersion','id','policyRevision','registryVersion','task'],'pin');
  else
   perform rpg_private.assert(p->>'schemaVersion'='1' and p->>'task'=task and p->>'providerId'='openai' and p->>'modelId' in ('gpt-6-astra','gpt-5.4','gpt-5.4-mini') and (p->>'policyRevision')::integer>=0 and length(p->>'registryVersion') between 1 and 100);
  end if;
  insert into rpg_private.execution_profiles values((p->>'id')::uuid,p_campaign_id,p_operation_id,task,p);
 end loop;
 return p_profiles;
end $$;

-- The opening's ticket (migration 66): the campaign's writer may write the opening.
create or replace function rpg_private.lab_execution_profile(profile jsonb,task text) returns void
language plpgsql immutable set search_path='' as $$
begin
 perform rpg_private.fields(profile,array['schemaVersion','id','policyRevision','registryVersion','task','providerId','modelId','reasoning']);
 perform rpg_private.assert(profile->>'schemaVersion'='1' and (profile->>'id')::uuid is not null
  and profile->>'registryVersion'='openai-responses-v1' and profile->>'task'=task and task in ('world.compose','world.resolve')
  and jsonb_typeof(profile->'policyRevision')='number' and (profile->>'policyRevision')::numeric=trunc((profile->>'policyRevision')::numeric)
  and (profile->>'policyRevision')::numeric between 0 and 2147483646 and profile->'reasoning'<>'null'::jsonb);
 if task='world.compose' and profile->>'providerId'='anthropic' then
  perform rpg_private.dm_turn_model_selection(jsonb_build_object('providerId',profile->'providerId','modelId',profile->'modelId','reasoning',profile->'reasoning'),'pin');
 else
  perform rpg_private.wave2_model_selection(jsonb_build_object('providerId',profile->'providerId','modelId',profile->'modelId','reasoning',profile->'reasoning'));
 end if;
end $$;

-- 2. The campaign's DM settings: the split and the snapshot retention ----------------------
-- dm_split: null — today's loop (one model narrates and records); an object {writer, bookkeeper}
-- — the writer narrates with the roll tool and closes with a private ledger, the bookkeeper
-- records. snapshots_keep: how many of the newest turn snapshots to keep; null — all (§4).
alter table rpg_private.dm_settings add column dm_split jsonb;
alter table rpg_private.dm_settings add column snapshots_keep integer check (snapshots_keep is null or snapshots_keep>=1);

-- The snapshots table and its pruning come first: the settings function below prunes on a save.
create table rpg_private.turn_snapshots (
  campaign_id uuid not null references public.rpg_campaigns(id),
  operation_id uuid not null,
  turn_no integer not null check (turn_no>0),
  player_input text not null,
  encoding text not null check (encoding in ('gzip-base64')),
  bytes integer not null check (bytes>=0),
  source text not null,
  created_at timestamptz not null default now(),
  primary key (campaign_id,operation_id)
);
create index turn_snapshots_turn_no on rpg_private.turn_snapshots(campaign_id,turn_no);
alter table rpg_private.turn_snapshots enable row level security;
revoke all on rpg_private.turn_snapshots from public,anon,authenticated;

create function rpg_private.turn_snapshots_prune(cid uuid) returns integer
language plpgsql set search_path='' as $$
declare keep integer; removed integer; begin
 select s.snapshots_keep into keep from rpg_private.dm_settings s where s.campaign_id=cid;
 if keep is null then return 0; end if;
 delete from rpg_private.turn_snapshots x where x.campaign_id=cid and x.turn_no not in
   (select y.turn_no from rpg_private.turn_snapshots y where y.campaign_id=cid order by y.turn_no desc limit keep);
 get diagnostics removed=row_count;
 return removed;
end $$;
revoke all on function rpg_private.turn_snapshots_prune(uuid) from public,anon,authenticated;

create or replace function rpg_private.dm_settings_read(cid uuid) returns jsonb
language sql stable set search_path='' as $$
 select coalesce((select jsonb_build_object('campaignId',s.campaign_id,'runtime',s.runtime,
   'dmTurn',s.dm_turn,'limits',s.limits,'depth',s.depth,'notebookVisible',s.notebook_visible,'boostNext',s.boost_next,'voiceExamples',s.voice_examples,
   'split',s.dm_split,'snapshotsKeep',s.snapshots_keep,
   'revision',s.revision) from rpg_private.dm_settings s where s.campaign_id=cid),
   jsonb_build_object('campaignId',cid,'runtime','dm-loop-v1','dmTurn',null,'limits',null,'depth',null,
     'notebookVisible',false,'boostNext',false,'voiceExamples',false,'split',null,'snapshotsKeep',null,'revision',0))
$$;

create or replace function public.rpg_dm_settings(p_owner_id uuid,p_campaign_id uuid,p_action text,
  p_payload jsonb default '{}',p_timeline jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare current jsonb; requested text; selection jsonb; stored rpg_private.dm_settings%rowtype; next_limits jsonb; next_depth jsonb;
  next_notebook boolean; next_boost boolean; next_voice boolean; next_split jsonb; next_keep integer; begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id)
   then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id for update;
 if not found then raise exception 'rpg_not_found'; end if;
 current:=rpg_private.dm_settings_read(p_campaign_id);
 if p_action='read' then
   perform rpg_private.fields(p_payload,'{}');
   return current;
 end if;
 select * into stored from rpg_private.dm_settings s where s.campaign_id=p_campaign_id;
 if p_action='boost_used' then
   -- The turn that honoured «important turn» clears the flag (no revision bump: a pin, not a setting).
   perform rpg_private.fields(p_payload,'{}');
   update rpg_private.dm_settings set boost_next=false where campaign_id=p_campaign_id;
   return rpg_private.dm_settings_read(p_campaign_id);
 end if;
 perform rpg_private.assert(p_action='save');
 perform rpg_private.fields(p_payload,array['expectedRevision','runtime','dmTurn'],array['limits','depth','notebookVisible','boostNext','voiceExamples','split','snapshotsKeep']);
 if (p_payload->>'expectedRevision')::integer<>(current->>'revision')::integer then
   raise exception 'rpg_conflict'; end if;
 requested:=p_payload->>'runtime';
 perform rpg_private.assert(requested in ('astra-primary-v1','dm-loop-v1'));
 selection:=p_payload->'dmTurn';
 if selection<>'null'::jsonb then perform rpg_private.dm_turn_model_selection(selection,'turn'); end if;
 next_limits:=case when p_payload ? 'limits' then nullif(p_payload->'limits','null'::jsonb) else stored.limits end;
 if next_limits is not null then perform rpg_private.assert(rpg_private.dm_turn_limits_valid(next_limits)); end if;
 next_depth:=case when p_payload ? 'depth' then nullif(p_payload->'depth','null'::jsonb) else stored.depth end;
 if next_depth is not null then perform rpg_private.assert(rpg_private.dm_depth_valid(next_depth)); end if;
 next_notebook:=case when p_payload ? 'notebookVisible' then (p_payload->>'notebookVisible')::boolean else coalesce(stored.notebook_visible,false) end;
 next_boost:=case when p_payload ? 'boostNext' then (p_payload->>'boostNext')::boolean else coalesce(stored.boost_next,false) end;
 perform rpg_private.assert(next_notebook is not null and next_boost is not null);
 next_voice:=case when p_payload ? 'voiceExamples' then (p_payload->>'voiceExamples')::boolean else coalesce(stored.voice_examples,false) end;
 perform rpg_private.assert(next_voice is not null);
 -- Polish 3 §2: the split (writer + bookkeeper), or null for today's loop.
 next_split:=case when p_payload ? 'split' then nullif(p_payload->'split','null'::jsonb) else stored.dm_split end;
 if next_split is not null then perform rpg_private.dm_split_valid(next_split); end if;
 -- Polish 3 §4: how many turn snapshots to keep (null: all).
 if not (p_payload ? 'snapshotsKeep') then next_keep:=stored.snapshots_keep;
 elsif p_payload->'snapshotsKeep'='null'::jsonb then next_keep:=null;
 else
   perform rpg_private.assert(jsonb_typeof(p_payload->'snapshotsKeep')='number' and (p_payload->>'snapshotsKeep')::numeric between 1 and 100000
     and mod((p_payload->>'snapshotsKeep')::numeric,1)=0);
   next_keep:=(p_payload->>'snapshotsKeep')::integer;
 end if;
 -- A turn in flight keeps its own pin; the new choice applies to the next operation.
 insert into rpg_private.dm_settings(campaign_id,runtime,dm_turn,limits,depth,notebook_visible,boost_next,voice_examples,dm_split,snapshots_keep,revision)
   values(p_campaign_id,requested,nullif(selection,'null'::jsonb),next_limits,next_depth,next_notebook,next_boost,next_voice,next_split,next_keep,1)
   on conflict(campaign_id) do update set runtime=excluded.runtime,dm_turn=excluded.dm_turn,
     limits=excluded.limits,depth=excluded.depth,notebook_visible=excluded.notebook_visible,boost_next=excluded.boost_next,voice_examples=excluded.voice_examples,
     dm_split=excluded.dm_split,snapshots_keep=excluded.snapshots_keep,
     revision=rpg_private.dm_settings.revision+1,updated_at=now();
 if requested='dm-loop-v1' and coalesce(stored.runtime,'dm-loop-v1')<>'dm-loop-v1' then
   perform rpg_private.dm_loop_convert_reward_terms(p_campaign_id);
 end if;
 if p_payload ? 'snapshotsKeep' then perform rpg_private.turn_snapshots_prune(p_campaign_id); end if;
 return rpg_private.dm_settings_read(p_campaign_id);
end $$;

-- 3. The state snapshot at every committed turn (§4) ---------------------------------------
-- The runtime source the turn started from (the public snapshot, the runtime state and the
-- private DM state), gzip-compressed and base64-encoded by the server at commit: compact,
-- private, owner-only. Never read by the DM or the player; the real-replay tool restores it
-- into an isolated copy. Pruned by dm_settings.snapshots_keep (null: keep all).
create function rpg_private.turn_snapshot_json(x rpg_private.turn_snapshots,with_source boolean) returns jsonb
language sql immutable set search_path='' as $$
 select jsonb_build_object('operationId',x.operation_id,'turnNo',x.turn_no,'input',x.player_input,'bytes',x.bytes,'createdAt',x.created_at,'stored','snapshot')
   || case when with_source then jsonb_build_object('encoding',x.encoding,'source',x.source) else '{}'::jsonb end
$$;
revoke all on function rpg_private.turn_snapshot_json(rpg_private.turn_snapshots,boolean) from public,anon,authenticated;

-- The number of a committed loop turn among the campaign's committed loop turns (the opening and
-- the earlier runtimes' turns do not count): what the owner's report calls «turn N».
create function rpg_private.loop_turn_no(cid uuid,op uuid) returns integer
language sql stable set search_path='' as $$
 select count(*)::integer from rpg_private.turns y, rpg_private.turns t
  where t.campaign_id=cid and t.id=op and y.campaign_id=cid and y.status='committed' and y.runtime_identity='dm-loop-v1' and y.sequence<=t.sequence
$$;
revoke all on function rpg_private.loop_turn_no(uuid,uuid) from public,anon,authenticated;

-- A committed loop turn keeps the runtime source it was claimed with (rpg_private.turns.source,
-- since the phase 2 runtime): the same state the snapshot would hold, uncompressed. Turns played
-- before this migration (session 1 among them) are read from it when no snapshot row exists.
create function rpg_private.turn_row_snapshot_json(t rpg_private.turns,with_source boolean) returns jsonb
language sql stable set search_path='' as $$
 select jsonb_build_object('operationId',t.id,'turnNo',rpg_private.loop_turn_no(t.campaign_id,t.id),'input',coalesce(t.input->>'input',''),
   'bytes',length(t.source::text),'createdAt',t.created_at,'stored','turn')
   || case when with_source then jsonb_build_object('encoding','json','source',jsonb_build_object('schemaVersion',1,'input',t.input,'source',t.source,'takenAt',t.created_at))
      else '{}'::jsonb end
$$;
revoke all on function rpg_private.turn_row_snapshot_json(rpg_private.turns,boolean) from public,anon,authenticated;

create function public.rpg_turn_snapshots(p_owner_id uuid,p_campaign_id uuid,p_action text,p_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare t rpg_private.turns%rowtype; x rpg_private.turn_snapshots%rowtype; n integer; removed integer; keep jsonb; begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id)
   then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id for update;
 if not found then raise exception 'rpg_not_found'; end if;
 if p_action='save' then
  perform rpg_private.fields(p_payload,array['operationId','source','bytes']);
  perform rpg_private.assert(jsonb_typeof(p_payload->'source')='string' and length(p_payload->>'source') between 1 and 50000000
    and jsonb_typeof(p_payload->'bytes')='number' and (p_payload->>'bytes')::numeric between 0 and 50000000);
  select * into t from rpg_private.turns where campaign_id=p_campaign_id and id=(p_payload->>'operationId')::uuid;
  if not found then raise exception 'rpg_not_found'; end if;
  perform rpg_private.assert(t.status='committed' and t.runtime_identity='dm-loop-v1');
  n:=rpg_private.loop_turn_no(p_campaign_id,t.id);
  insert into rpg_private.turn_snapshots(campaign_id,operation_id,turn_no,player_input,encoding,bytes,source)
   values(p_campaign_id,t.id,greatest(n,1),coalesce(t.input->>'input',''),'gzip-base64',(p_payload->>'bytes')::integer,p_payload->>'source')
   on conflict(campaign_id,operation_id) do nothing;
  removed:=rpg_private.turn_snapshots_prune(p_campaign_id);
  select * into x from rpg_private.turn_snapshots s where s.campaign_id=p_campaign_id and s.operation_id=t.id;
  return jsonb_build_object('saved',found,'turnNo',case when found then x.turn_no else null end,'pruned',removed);
 end if;
 if p_action='list' then
  perform rpg_private.fields(p_payload,'{}');
  select to_jsonb(d.snapshots_keep) into keep from rpg_private.dm_settings d where d.campaign_id=p_campaign_id;
  -- The snapshot rows, plus the committed loop turns that keep their claim source and have no row yet.
  return jsonb_build_object('campaignId',p_campaign_id,'keep',coalesce(keep,'null'::jsonb),
   'snapshots',coalesce((select jsonb_agg(r.row order by (r.row->>'turnNo')::integer,r.row->>'createdAt') from (
     select rpg_private.turn_snapshot_json(s,false) row from rpg_private.turn_snapshots s where s.campaign_id=p_campaign_id
     union all
     select rpg_private.turn_row_snapshot_json(t,false) row from rpg_private.turns t where t.campaign_id=p_campaign_id and t.status='committed'
       and t.runtime_identity='dm-loop-v1' and t.source is not null and t.input->>'mode' in ('game','companion')
       and not exists(select 1 from rpg_private.turn_snapshots s where s.campaign_id=t.campaign_id and s.operation_id=t.id)
   ) r),'[]'::jsonb));
 end if;
 if p_action='read' then
  perform rpg_private.fields(p_payload,'{}'::text[],array['operationId','turnNo']);
  if p_payload ? 'operationId' then
   select * into x from rpg_private.turn_snapshots s where s.campaign_id=p_campaign_id and s.operation_id=(p_payload->>'operationId')::uuid;
   if not found then
    select * into t from rpg_private.turns y where y.campaign_id=p_campaign_id and y.id=(p_payload->>'operationId')::uuid and y.status='committed'
      and y.runtime_identity='dm-loop-v1' and y.source is not null;
    if not found then raise exception 'rpg_not_found'; end if;
    return rpg_private.turn_row_snapshot_json(t,true);
   end if;
  else
   select * into x from rpg_private.turn_snapshots s where s.campaign_id=p_campaign_id and s.turn_no=(p_payload->>'turnNo')::integer order by s.created_at desc limit 1;
   if not found then
    select * into t from rpg_private.turns y where y.campaign_id=p_campaign_id and y.status='committed' and y.runtime_identity='dm-loop-v1' and y.source is not null
      and y.input->>'mode' in ('game','companion') and rpg_private.loop_turn_no(p_campaign_id,y.id)=(p_payload->>'turnNo')::integer order by y.sequence limit 1;
    if not found then raise exception 'rpg_not_found'; end if;
    return rpg_private.turn_row_snapshot_json(t,true);
   end if;
  end if;
  return rpg_private.turn_snapshot_json(x,true);
 end if;
 if p_action='prune' then
  perform rpg_private.fields(p_payload,'{}');
  return jsonb_build_object('pruned',rpg_private.turn_snapshots_prune(p_campaign_id));
 end if;
 raise exception 'rpg_validation' using errcode='22023';
end $$;
revoke all on function public.rpg_turn_snapshots(uuid,uuid,text,jsonb) from public,anon,authenticated;
do $$ begin if exists(select 1 from pg_roles where rolname='service_role') then
 revoke all on function rpg_private.turn_snapshots_prune(uuid) from service_role;
 revoke all on function rpg_private.turn_snapshot_json(rpg_private.turn_snapshots,boolean) from service_role;
 revoke all on function rpg_private.turn_row_snapshot_json(rpg_private.turns,boolean) from service_role;
 revoke all on function rpg_private.loop_turn_no(uuid,uuid) from service_role;
 grant execute on function public.rpg_turn_snapshots(uuid,uuid,text,jsonb) to service_role;
end if; end $$;

-- 4. Pictures by the owner's second blind page (§5) ----------------------------------------
-- One line against the shot director on Sunburst and Flare, seven scenes: the director does
-- not win and costs time, so its switch is off by default (kept in the settings; existing
-- campaigns are switched off too — the owner can turn it back on). The live tier's default
-- model (Sunburst) lives in TypeScript (DEFAULT_TIER_MODELS); the stored «models» stay.
alter table rpg_private.picture_settings alter column director set default false;
update rpg_private.picture_settings set director=false where director;

create or replace function rpg_private.picture_settings_json(cid uuid) returns jsonb
language sql stable set search_path='' as $$
 select coalesce((select jsonb_build_object('frames',s.frames,'quality',s.quality,'dailyCap',s.daily_cap,'autopilot',s.autopilot,'models',s.models,'director',s.director,'revision',s.revision)
   from rpg_private.picture_settings s where s.campaign_id=cid),
  jsonb_build_object('frames','every','quality','fast','dailyCap',60,
   'autopilot','{"enabled":false,"items":true,"portraits":true,"figures":true,"places":true,"holdings":true,"autoAccept":true,"provider":"fal"}'::jsonb,'models','{}'::jsonb,'director',false,'revision',0))
$$;

do $m$ declare d text; begin
 select pg_get_functiondef('public.rpg_pictures(uuid,uuid,text,jsonb)'::regprocedure) into d;
 d:=replace(d,'coalesce((p_payload->>''director'')::boolean,true)','coalesce((p_payload->>''director'')::boolean,false)');
 perform rpg_private.assert(d like '%coalesce((p_payload->>''director'')::boolean,false)%');
 execute d;
end $m$;

commit;
