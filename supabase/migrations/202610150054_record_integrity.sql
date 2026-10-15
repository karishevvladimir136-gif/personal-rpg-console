-- Stage 3: record integrity and campaign limits. Additive only.
--   * the database itself guards the invariants of the turn loop: resource
--     balances and counters stay within their stored bounds (table CHECK),
--     a quest reward is claimed at most once (row guard + trigger + FK),
--     a committed turn is never rewritten or deleted (trigger);
--   * per-turn campaign limits live in rpg_private.dm_settings (null means the
--     TypeScript defaults), are pinned into the operation with the model, and
--     the commit re-checks the pinned time and character limits;
--   * dm-loop-v1 commits honour the per-turn autosave policy like older runtimes;
--   * the Character Model validator used by the owner's correction screen and
--     the old Astra commit gets the Stage 2b anti-garbage bounds.
-- Logic stays in TypeScript; SQL only applies and guards (CLAUDE.md §5).
begin;

-- 1. Resources: never negative, never above a stored "<name>_max" cap --------
-- Whatever a ruleset stores is respected: a counter without a cap has no upper
-- bound here (the applier's 1,000,000 ceiling and number_map still apply).
create function rpg_private.resources_within_bounds(v jsonb) returns boolean
language sql immutable set search_path='' as $$
 select jsonb_typeof(v)='object' and not exists(
   select 1 from jsonb_each(v) e
   where jsonb_typeof(e.value)<>'number' or (e.value#>>'{}')::numeric<0
      or (jsonb_typeof(v->(e.key||'_max'))='number' and (e.value#>>'{}')::numeric>(v->>(e.key||'_max'))::numeric))
$$;
-- NOT VALID still checks every new write; validation of existing rows is
-- attempted here and, when a legacy row violates it, left for stage 6
-- (docs/RELEASE_CHECKLIST.md names the query) instead of failing the upgrade.
alter table public.rpg_entities add constraint rpg_entities_resources_within_bounds
  check (rpg_private.resources_within_bounds(resources)) not valid;
do $$ begin
 begin
  alter table public.rpg_entities validate constraint rpg_entities_resources_within_bounds;
 exception when check_violation then
  raise notice 'rpg_entities_resources_within_bounds stays NOT VALID: existing rows violate it; new writes are checked.';
 end;
end $$;

-- 2. A quest reward is claimed at most once -----------------------------------
-- The claim column points at the committing operation of the same campaign …
alter table public.rpg_quests add constraint rpg_quests_reward_operation_fk
  foreign key (campaign_id,reward_operation_id) references rpg_private.turns(campaign_id,id)
  deferrable initially deferred not valid;
do $$ begin
 begin
  alter table public.rpg_quests validate constraint rpg_quests_reward_operation_fk;
 exception when foreign_key_violation then
  raise notice 'rpg_quests_reward_operation_fk stays NOT VALID: existing rows violate it; new writes are checked.';
 end;
end $$;
-- … and once set it never moves or clears, except while a save is restored.
create function rpg_private.reward_claim_once() returns trigger
language plpgsql set search_path='' as $$
begin
 if old.reward_operation_id is not null and new.reward_operation_id is distinct from old.reward_operation_id
    and not rpg_private.timeline_restoring(old.campaign_id) then
   raise exception 'rpg_reward_claimed' using errcode='23514';
 end if;
 return new;
end $$;
create trigger reward_claim_once before update on public.rpg_quests
  for each row execute function rpg_private.reward_claim_once();

-- 3. A committed operation stays committed, with its input and narration -------
-- Operation IDs are already unique (primary key). Restores replace projection
-- rows under the timeline guard; everything else keeps history as written.
create function rpg_private.committed_turn_immutable() returns trigger
language plpgsql set search_path='' as $$
begin
 if rpg_private.timeline_restoring(old.campaign_id) then return coalesce(new,old); end if;
 if tg_op='DELETE' then
   if old.status='committed' then raise exception 'rpg_immutable_history' using errcode='42501'; end if;
   return old;
 end if;
 if old.status='committed' and (new.status<>'committed' or new.id<>old.id or new.campaign_id<>old.campaign_id
    or new.input<>old.input or new.narration is distinct from old.narration
    or new.runtime_identity is distinct from old.runtime_identity) then
   raise exception 'rpg_immutable_history' using errcode='42501';
 end if;
 return new;
end $$;
create trigger committed_turn_immutable before update or delete on rpg_private.turns
  for each row execute function rpg_private.committed_turn_immutable();

-- 4. Campaign limits as settings ----------------------------------------------
-- Null = the TypeScript defaults (src/lib/gameplay/dm-loop/limits.ts). The
-- ceilings here are the hard bounds the commit itself tolerates.
create function rpg_private.dm_turn_limits_valid(v jsonb) returns boolean
language sql immutable set search_path='' as $$
 select jsonb_typeof(v)='object' and (select count(*) from jsonb_object_keys(v))=6
   and rpg_private.wave4_integer(v->'moneyPerTurn',1,1000000)
   and rpg_private.wave4_integer(v->'itemsPerTurn',1,200)
   and rpg_private.wave4_integer(v->'charactersPerTurn',1,100)
   and rpg_private.wave4_integer(v->'minutesPerTurn',1,20160)
   and rpg_private.wave4_integer(v->'toolCallsPerTurn',1,199)
   and rpg_private.wave4_integer(v->'modelRequestsPerTurn',1,50)
$$;
alter table rpg_private.dm_settings add column limits jsonb;
alter table rpg_private.dm_settings add constraint dm_settings_limits_check
  check (limits is null or rpg_private.dm_turn_limits_valid(limits));

create or replace function rpg_private.dm_settings_read(cid uuid) returns jsonb
language sql stable set search_path='' as $$
 select coalesce((select jsonb_build_object('campaignId',s.campaign_id,'runtime',s.runtime,
   'dmTurn',s.dm_turn,'limits',s.limits,'revision',s.revision) from rpg_private.dm_settings s where s.campaign_id=cid),
   jsonb_build_object('campaignId',cid,'runtime','dm-loop-v1','dmTurn',null,'limits',null,'revision',0))
$$;

-- As in migration 53, plus `limits`: absent keeps the stored value, null
-- returns to the defaults, an object is validated and stored.
create or replace function public.rpg_dm_settings(p_owner_id uuid,p_campaign_id uuid,p_action text,
  p_payload jsonb default '{}',p_timeline jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare current jsonb; requested text; selection jsonb; stored_limits jsonb; next_limits jsonb; begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id)
   then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id for update;
 if not found then raise exception 'rpg_not_found'; end if;
 current:=rpg_private.dm_settings_read(p_campaign_id);
 if p_action='read' then
   perform rpg_private.fields(p_payload,'{}');
   return current;
 end if;
 perform rpg_private.assert(p_action='save');
 perform rpg_private.fields(p_payload,array['expectedRevision','runtime','dmTurn'],array['limits']);
 if (p_payload->>'expectedRevision')::integer<>(current->>'revision')::integer then
   raise exception 'rpg_conflict'; end if;
 requested:=p_payload->>'runtime';
 perform rpg_private.assert(requested in ('astra-primary-v1','dm-loop-v1'));
 selection:=p_payload->'dmTurn';
 if selection<>'null'::jsonb then perform rpg_private.dm_turn_model_selection(selection); end if;
 select s.limits into stored_limits from rpg_private.dm_settings s where s.campaign_id=p_campaign_id;
 next_limits:=case when p_payload ? 'limits' then nullif(p_payload->'limits','null'::jsonb) else stored_limits end;
 if next_limits is not null then perform rpg_private.assert(rpg_private.dm_turn_limits_valid(next_limits)); end if;
 -- A turn in flight keeps its own pin; the new choice applies to the next operation.
 insert into rpg_private.dm_settings(campaign_id,runtime,dm_turn,limits,revision)
   values(p_campaign_id,requested,nullif(selection,'null'::jsonb),next_limits,1)
   on conflict(campaign_id) do update set runtime=excluded.runtime,dm_turn=excluded.dm_turn,
     limits=excluded.limits,revision=rpg_private.dm_settings.revision+1,updated_at=now();
 return rpg_private.dm_settings_read(p_campaign_id);
end $$;

-- 5. Character Model validator: the Stage 2b anti-garbage bounds --------------
-- Same checks as migration 20 (identity fixed in play, evidence from Memory,
-- actors of the campaign); only the sizes change: 12 entries per list, 400–600
-- characters per text, 6000 bytes per model — what the loop's note_character
-- and parseCharacterModel accept. Used by the old Astra commit and by the
-- owner's correction (rpg_character_model), which no longer rejects what the
-- loop stored.
create or replace function rpg_private.character_model_valid(cid uuid,actor uuid,model jsonb,previous jsonb,owner_correction boolean default false)
returns void language plpgsql stable set search_path='' as $$
declare x jsonb; y jsonb; ref jsonb; bucket text; entry jsonb; target uuid; source_visibility text; begin
 perform rpg_private.assert(exists(select 1 from public.rpg_entities where campaign_id=cid and id=actor and kind in ('npc','companion')));
 perform rpg_private.assert(jsonb_typeof(model)='object' and octet_length(model::text)<=6000);
 perform rpg_private.fields(model,array['schemaVersion','actorId','basisOperationId','identity','current','beliefs','relationships','episodes']);
 perform rpg_private.assert(model->'schemaVersion'='1'::jsonb and model->>'actorId'=actor::text);
 perform rpg_private.assert(model->'basisOperationId'='null'::jsonb or ((model->>'basisOperationId')::uuid is not null));
 x:=model->'identity'; perform rpg_private.fields(x,array['values','wants','boundaries','loyalties','signatures','observableVoice']);
 perform rpg_private.assert(jsonb_typeof(x->'observableVoice')='string' and length(btrim(x->>'observableVoice')) between 1 and 600);
 for bucket in select unnest(array['values','wants','boundaries','loyalties','signatures']) loop
  perform rpg_private.assert(jsonb_typeof(x->bucket)='array' and jsonb_array_length(x->bucket)<=12);
  for y in select value from jsonb_array_elements(x->bucket) loop
   perform rpg_private.assert(jsonb_typeof(y)='string' and length(btrim(y#>>'{}')) between 1 and 400);
  end loop;
 end loop;
 if not owner_correction then
  perform rpg_private.assert(previous is not null and jsonb_typeof(previous)='object' and previous->'identity'=model->'identity');
 end if;
 x:=model->'current'; perform rpg_private.fields(x,array['goal','stress','preoccupation','obligation']);
 perform rpg_private.assert(x->>'stress' in ('settled','strained','acute'));
 for bucket in select unnest(array['goal','preoccupation','obligation']) loop
  perform rpg_private.assert(x->bucket='null'::jsonb or (jsonb_typeof(x->bucket)='string' and length(btrim(x->>bucket)) between 1 and 400));
 end loop;
 perform rpg_private.assert(jsonb_typeof(model->'beliefs')='array' and jsonb_array_length(model->'beliefs')<=12 and jsonb_typeof(model->'relationships')='array' and jsonb_array_length(model->'relationships')<=12 and jsonb_typeof(model->'episodes')='array' and jsonb_array_length(model->'episodes')<=20);
 for bucket in select unnest(array['beliefs','relationships','episodes']) loop
  for entry in select value from jsonb_array_elements(model->bucket) loop
   if bucket='beliefs' then
    perform rpg_private.fields(entry,array['text','confidence','aboutActorId','evidence']);
    perform rpg_private.assert(jsonb_typeof(entry->'text')='string' and length(btrim(entry->>'text')) between 1 and 600 and entry->>'confidence' in ('tentative','supported'));
    if entry->'aboutActorId'<>'null'::jsonb then
     target:=(entry->>'aboutActorId')::uuid;
     perform rpg_private.assert(exists(select 1 from public.rpg_entities where campaign_id=cid and id=target));
    end if;
   elsif bucket='relationships' then
    perform rpg_private.fields(entry,array['actorId','affection','trust','respect','unresolvedHurt','evidence']);
    target:=(entry->>'actorId')::uuid;
    perform rpg_private.assert(target<>actor and exists(select 1 from public.rpg_entities where campaign_id=cid and id=target));
    perform rpg_private.assert(entry->>'affection' in ('distant','open','close') and entry->>'trust' in ('low','guarded','earned') and entry->>'respect' in ('low','mixed','high'));
    perform rpg_private.assert(entry->'unresolvedHurt'='null'::jsonb or (jsonb_typeof(entry->'unresolvedHurt')='string' and length(btrim(entry->>'unresolvedHurt')) between 1 and 400));
   else
    perform rpg_private.fields(entry,array['evidence','meaning','cue']);
    perform rpg_private.assert(jsonb_typeof(entry->'meaning')='string' and length(btrim(entry->>'meaning')) between 1 and 600);
    perform rpg_private.assert(entry->'cue'='null'::jsonb or (jsonb_typeof(entry->'cue')='string' and length(btrim(entry->>'cue')) between 1 and 160));
   end if;
   ref:=entry->'evidence'; perform rpg_private.fields(ref,array['kind','id','version','part','visibility']);
   perform rpg_private.assert(ref->>'kind' in ('scene','event','private_event') and ref->>'visibility' in ('public','private') and jsonb_typeof(ref->'version')='string' and length(btrim(ref->>'version')) between 1 and 80 and jsonb_typeof(ref->'part')='number' and (ref->>'part')::integer between 0 and 20);
   source_visibility:=ref->>'visibility';
   perform rpg_private.assert(exists(
    select 1 from rpg_private.memory_sources(cid,source_visibility) s
    where s.kind=ref->>'kind' and s.source_id=(ref->>'id')::uuid and s.version=ref->>'version' and s.part=(ref->>'part')::integer
      and s.current and s.status='valid' and actor=any(s.known_by) and not s.oversized
      and rpg_private.memory_refs_valid(cid,s.source_refs,source_visibility)
   ));
  end loop;
 end loop;
end $$;

-- 6. The dm-loop-v1 commit: pinned limits, one reward claim, autosave ---------
alter function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) rename to rpg_runtime_before_record_integrity;

create function public.rpg_runtime(p_owner_id uuid,p_campaign_id uuid,p_action text,
  p_payload jsonb default '{}',p_timeline jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare t rpg_private.turns%rowtype; op uuid; result jsonb; limits jsonb; packet jsonb; entry jsonb; qid uuid;
  paid text; terms jsonb; before_minutes integer; after_minutes integer; new_characters integer; touched boolean:=false;
begin
 if p_action<>'commit' then
   return public.rpg_runtime_before_record_integrity(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);
 end if;
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id)
   then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id for update;
 if not found then raise exception 'rpg_not_found'; end if;
 op:=(p_payload->>'operationId')::uuid;
 select * into t from rpg_private.turns where id=op and campaign_id=p_campaign_id and owner_id=p_owner_id for update;
 if t.id is null or t.runtime_identity is distinct from 'dm-loop-v1' or t.status='committed' then
   return public.rpg_runtime_before_record_integrity(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);
 end if;
 packet:=p_payload->'packet';
 -- The limits pinned when the turn started (campaign settings at that moment):
 -- TypeScript enforces every one of them per call; the commit re-checks the
 -- two it can read directly from the packet. An older pin without limits
 -- keeps the applier's own ceilings.
 limits:=t.checkpoint#>'{dmLoop,pin,limits}';
 if jsonb_typeof(limits)='object' then
   perform rpg_private.assert(rpg_private.dm_turn_limits_valid(limits));
   select world_minutes into before_minutes from rpg_private.runtime_state where campaign_id=p_campaign_id;
   after_minutes:=(packet#>>'{resolution,worldMinutes}')::integer;
   if after_minutes-before_minutes>(limits->>'minutesPerTurn')::integer then
     raise exception 'rpg_limit_exceeded' using errcode='23514'; end if;
   select count(*) into new_characters from jsonb_array_elements(coalesce(packet#>'{resolution,changes}','[]'::jsonb)) c
     where c.value->>'family'='entities' and c.value->'expectedRevision'='null'::jsonb
       and c.value#>>'{values,kind}' in ('npc','companion');
   if new_characters>(limits->>'charactersPerTurn')::integer then
     raise exception 'rpg_limit_exceeded' using errcode='23514'; end if;
 end if;
 result:=public.rpg_runtime_before_record_integrity(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);
 -- A reward is paid exactly once. The loop keeps the terms privately
 -- (fact quest_reward_<quest>) and marks the paying operation in them; the
 -- quest row records the same claim, so a second payment — by claim_reward, by
 -- a settling transfer, by a later tool, or by a bug — fails here.
 for entry in select x.value from jsonb_array_elements(coalesce(packet->'privatePatches','[]'::jsonb)) x loop
   if entry->>'kind'<>'fact' or entry->>'operation'<>'set' or entry->>'key' not like 'quest\_reward\_%' then continue; end if;
   qid:=substr(entry->>'key',14)::uuid;
   terms:=(entry->>'value')::jsonb;
   perform rpg_private.assert(jsonb_typeof(terms)='object' and
     exists(select 1 from public.rpg_quests q where q.campaign_id=p_campaign_id and q.id=qid));
   paid:=terms->>'paidOperationId';
   if paid is null then
     if exists(select 1 from public.rpg_quests q where q.campaign_id=p_campaign_id and q.id=qid and q.reward_operation_id is not null) then
       raise exception 'rpg_reward_claimed' using errcode='23514'; end if;
   else
     perform rpg_private.assert(paid=op::text);
     update public.rpg_quests set reward_operation_id=op
       where campaign_id=p_campaign_id and id=qid and reward_operation_id is null;
     if not found then raise exception 'rpg_reward_claimed' using errcode='23514'; end if;
     touched:=true;
   end if;
 end loop;
 if touched then
   -- The quest rows advanced the runtime revision; the committed turn points at
   -- the final one (as the Astra settlement wrappers do).
   update rpg_private.turns set committed_revision=(select revision from rpg_private.runtime_state where campaign_id=p_campaign_id)
     where id=op and campaign_id=p_campaign_id returning * into t;
   result:=rpg_private.timeline_stamp(rpg_private.runtime_public_turn(t),rpg_private.timeline_fence(p_campaign_id));
 end if;
 -- The per-turn autosave policy applies to this runtime as to the older ones.
 if result->>'status'='committed' and t.input->>'mode' in ('game','companion') and
    (select policy->>'autosave'='turn' from rpg_private.timeline_campaigns where campaign_id=p_campaign_id) then
   perform rpg_private.timeline_save(p_campaign_id,'autosave','After action','turn:'||op::text);
 end if;
 return result;
end $$;

revoke all on function public.rpg_runtime_before_record_integrity(uuid,uuid,text,jsonb,jsonb)
  from public,anon,authenticated,service_role;
revoke all on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) to service_role;
revoke all on function public.rpg_dm_settings(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated;
do $$ begin if exists(select 1 from pg_roles where rolname='service_role') then
 grant execute on function public.rpg_dm_settings(uuid,uuid,text,jsonb,jsonb) to service_role;
end if; end $$;
revoke all on all functions in schema rpg_private from public,anon,authenticated;

commit;
