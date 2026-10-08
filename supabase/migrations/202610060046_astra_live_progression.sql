-- Post-takeover earned mechanics only. Historical World definitions, actors,
-- topology and events remain frozen. A committed fenced Game operation is the
-- award receipt; explicit player choices use existing runtime command receipts.
begin;

create function rpg_private.astra_progression_after(
  cid uuid, op uuid, state jsonb, baseline jsonb, intent jsonb
) returns jsonb language plpgsql stable set search_path='' as $$
#variable_conflict use_variable
declare hero uuid; track jsonb; progress jsonb; progress_rows jsonb;
  pending_rows jsonb; next_progress jsonb; options jsonb; owned jsonb;
  amount integer; value_after bigint; rank_before integer; earned integer;
  n integer; idx integer; chosen jsonb; chosen_pending jsonb;
  row_value jsonb; filtered jsonb; result jsonb;
begin
 perform rpg_private.assert(intent->>'kind'='progression_award' and
   state->>'progression'='on' and jsonb_typeof(baseline)='array' and
   rpg_private.wave4_integer(intent->'amount',1,100));
 hero:=(intent->>'recipientId')::uuid;
 perform rpg_private.assert(exists(select 1 from public.rpg_entities
   where campaign_id=cid and id=hero and kind='player'));
 amount:=(intent->>'amount')::integer;
 select value into track from jsonb_array_elements(state->'tracks') x
   where x->>'id'=intent->>'trackId';
 perform rpg_private.assert(track is not null);
 progress_rows:=state->'progress'; pending_rows:=state->'pending';
 select x.value,x.n::integer-1 into progress,idx
   from jsonb_array_elements(progress_rows) with ordinality x(value,n)
   where x.value->>'entityId'=hero::text and
     x.value->>'trackId'=intent->>'trackId';
 if progress is null then
   progress:=jsonb_build_object('entityId',hero,'trackId',intent->>'trackId',
     'value',0,'rank',0,'unlocks','[]'::jsonb);
 end if;
 value_after:=(progress->>'value')::bigint+amount;
 perform rpg_private.assert(value_after<=1000000000);
 rank_before:=(progress->>'rank')::integer;
 select count(*)::integer into earned from jsonb_array_elements(track->'thresholds') x
   where (x.value#>>'{}')::bigint<=value_after;
 next_progress:=jsonb_set(progress,'{value}',to_jsonb(value_after));
 if jsonb_array_length(track->'choices')=0 then
   next_progress:=jsonb_set(next_progress,'{rank}',
     to_jsonb(greatest(rank_before,earned)));
 else
   perform rpg_private.assert(not exists(select 1 from
     jsonb_array_elements(pending_rows) p where
       p.value->>'entityId'=hero::text and
       p.value->>'trackId'=intent->>'trackId' and
       (p.value->>'trackVersion')::integer<>(track->>'version')::integer));
   select coalesce(jsonb_agg(v),'[]'::jsonb) into owned from (
     select value v from jsonb_array_elements(baseline)
     union
     select u.value from jsonb_array_elements(progress_rows) p,
       jsonb_array_elements(p.value->'unlocks') u
       where p.value->>'entityId'=hero::text
   ) all_owned;
   select coalesce(jsonb_agg(c.value order by c.n),'[]'::jsonb)
     into options from jsonb_array_elements(track->'choices')
       with ordinality c(value,n)
     where not exists(select 1 from jsonb_array_elements(owned) o
       where o.value=c.value->'capability');
   perform rpg_private.assert(jsonb_array_length(options)>=earned-rank_before);
   for n in rank_before+1..earned loop
     if not exists(select 1 from jsonb_array_elements(pending_rows) p
       where p.value->>'entityId'=hero::text and
         p.value->>'trackId'=intent->>'trackId' and
         (p.value->>'rank')::integer=n) then
       pending_rows:=pending_rows||jsonb_build_array(jsonb_build_object(
         'id',rpg_private.wave4_id(op,'advancement-v1:'||hero::text||':'||
           (intent->>'trackId')||':'||n::text),
         'entityId',hero,'trackId',intent->>'trackId',
         'trackVersion',track->'version','rank',n,'options',options));
     end if;
   end loop;
   perform rpg_private.assert(jsonb_array_length(pending_rows)<=128);
 end if;
 if idx is null then progress_rows:=progress_rows||jsonb_build_array(next_progress);
 else progress_rows:=jsonb_set(progress_rows,array[idx::text],next_progress);
 end if;
 result:=jsonb_set(jsonb_set(jsonb_set(state,'{progress}',progress_rows),
   '{pending}',pending_rows),'{version}',
   to_jsonb((state->>'version')::integer+1));
 perform rpg_private.wave4_state(cid,result,state->'profile');
 return result;
end $$;



create function rpg_private.astra_advancement_after(
  cid uuid, state jsonb, baseline jsonb, pending_id uuid,
  option_id text, track_version integer, hero uuid
) returns jsonb language plpgsql stable set search_path='' as $$
#variable_conflict use_variable
declare pending jsonb; track jsonb; progress jsonb; option_row jsonb;
  progress_rows jsonb; pending_rows jsonb; owned jsonb; result jsonb;
  idx integer; changed jsonb;
begin
 perform rpg_private.assert(state->>'progression'='on' and
   jsonb_typeof(baseline)='array' and track_version>=1 and
   hero is not null and pending_id is not null and
   option_id ~ '^[a-z0-9][a-z0-9._:-]{0,79}$');
 select value into pending from jsonb_array_elements(state->'pending') p
   where p.value->>'id'=pending_id::text and
     p.value->>'entityId'=hero::text;
 perform rpg_private.assert(pending is not null);
 select value into track from jsonb_array_elements(state->'tracks') x
   where x.value->>'id'=pending->>'trackId';
 perform rpg_private.assert(track is not null and
   (pending->>'trackVersion')::integer=track_version and
   (track->>'version')::integer=track_version);
 progress_rows:=state->'progress';
 select x.value,x.n::integer-1 into progress,idx
   from jsonb_array_elements(progress_rows) with ordinality x(value,n)
   where x.value->>'entityId'=hero::text and
     x.value->>'trackId'=pending->>'trackId';
 perform rpg_private.assert(progress is not null and
   (pending->>'rank')::integer=(progress->>'rank')::integer+1 and
   (progress->>'value')::bigint >=
     ((track->'thresholds')->((pending->>'rank')::integer-1))::text::bigint);
 select value into option_row from jsonb_array_elements(pending->'options') x
   where x.value->>'id'=option_id;
 perform rpg_private.assert(option_row is not null and
   exists(select 1 from jsonb_array_elements(track->'choices') x
     where x.value=option_row));
 select coalesce(jsonb_agg(v),'[]'::jsonb) into owned from (
   select value v from jsonb_array_elements(baseline)
   union
   select u.value from jsonb_array_elements(progress_rows) p,
     jsonb_array_elements(p.value->'unlocks') u
     where p.value->>'entityId'=hero::text
 ) all_owned;
 perform rpg_private.assert(not exists(select 1 from
   jsonb_array_elements(owned) o where o.value=option_row->'capability'));
 changed:=jsonb_set(jsonb_set(progress,'{rank}',pending->'rank'),
   '{unlocks}',progress->'unlocks'||jsonb_build_array(option_row->'capability'));
 progress_rows:=jsonb_set(progress_rows,array[idx::text],changed);
 select coalesce(jsonb_agg(case when p.value->>'entityId'=hero::text then
   jsonb_set(p.value,'{options}',coalesce((select jsonb_agg(o.value order by o.n)
     from jsonb_array_elements(p.value->'options') with ordinality o(value,n)
     where o.value->'capability'<>option_row->'capability'),'[]'::jsonb))
   else p.value end order by p.n),'[]'::jsonb) into pending_rows
   from jsonb_array_elements(state->'pending') with ordinality p(value,n)
   where p.value->>'id'<>pending_id::text;
 perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(
   pending_rows) p where jsonb_array_length(p.value->'options')=0));
 result:=jsonb_set(jsonb_set(jsonb_set(state,'{progress}',progress_rows),
   '{pending}',pending_rows),'{version}',
   to_jsonb((state->>'version')::integer+1));
 perform rpg_private.wave4_state(cid,result,state->'profile');
 return result;
end $$;

alter function rpg_private.astra_settlement_expected(
  uuid,rpg_private.turns,jsonb) rename to astra_settlement_expected_before_progression;
create function rpg_private.astra_settlement_expected(
  cid uuid,t rpg_private.turns,plan jsonb
) returns jsonb language plpgsql stable set search_path='' as $$
declare intent jsonb; f rpg_private.world_foundations%rowtype;
  next_state jsonb; progress jsonb; pending_ids jsonb; hero uuid;
begin
 if plan->>'kind'<>'progression_award' then
   return rpg_private.astra_settlement_expected_before_progression(cid,t,plan);
 end if;
 perform rpg_private.fields(plan,array['schemaVersion','kind','intent',
   'changes','currencyDefinition','publicOutcome','progressionState']);
 intent:=plan->'intent';
 perform rpg_private.fields(intent,array['kind','recipientId','trackId','amount']);
 hero:=(intent->>'recipientId')::uuid;
 perform rpg_private.assert(plan->'schemaVersion'='1'::jsonb and
   intent->>'kind'='progression_award' and plan->'changes'='[]'::jsonb and
   plan->'currencyDefinition'='null'::jsonb and t.campaign_id=cid and
   t.runtime_identity='astra-primary-v1' and t.input->>'mode'='game' and
   t.source->'worldTakeover' is not null and
   rpg_private.astra_takeover_active(cid) and
   jsonb_array_length(t.source#>'{runtime,configuration,controlledEntityIds}')=1
   and t.source#>>'{runtime,configuration,controlledEntityIds,0}'=hero::text);
 select * into strict f from rpg_private.world_foundations where campaign_id=cid;
 perform rpg_private.assert(t.source->'astraProgressionState'=f.loop_state and
   t.source->'astraProgressionBaseline'=coalesce((
     select a.value->'capabilities' from jsonb_array_elements(f.world->'actors') a
       where a.value->>'entityId'=hero::text limit 1),'[]'::jsonb));
 next_state:=rpg_private.astra_progression_after(cid,t.id,f.loop_state,
   t.source->'astraProgressionBaseline',intent);
 select value into progress from jsonb_array_elements(next_state->'progress') p
   where p.value->>'entityId'=hero::text and
     p.value->>'trackId'=intent->>'trackId';
 select coalesce(jsonb_agg(p.value->'id' order by p.n),'[]'::jsonb)
   into pending_ids from jsonb_array_elements(next_state->'pending')
   with ordinality p(value,n) where p.value->>'entityId'=hero::text and
     p.value->>'trackId'=intent->>'trackId';
 return jsonb_build_object('schemaVersion',1,'kind','progression_award',
   'intent',intent,'changes','[]'::jsonb,'currencyDefinition',null,
   'progressionState',next_state,'publicOutcome',jsonb_build_object(
     'kind','progression_award','questId',null,'questStatus',null,
     'currency',null,'item',null,'progression',jsonb_build_object(
       'trackId',intent->>'trackId','value',progress->'value',
       'rank',progress->'rank','pendingIds',pending_ids)));
end $$;

-- Preserve the migration-45 currency-only exception and add exactly the
-- pinned progression mechanics delta. No World actor/event write is allowed.
create or replace function rpg_private.astra_takeover_freeze_world()
returns trigger language plpgsql set search_path='' as $$
declare op text:=current_setting('rpg.astra_settlement_operation',true);
  progress_op text:=current_setting('rpg.astra_progression_operation',true);
  pinned jsonb; expected jsonb;
begin
 if tg_op='DELETE' then
   if old.astra_takeover is not null and
     not rpg_private.timeline_restoring(old.campaign_id) then
     raise exception 'rpg_conflict'; end if;
   return old;
 end if;
 if old.astra_takeover is not null and
   not rpg_private.timeline_restoring(old.campaign_id) and
   (to_jsonb(new)-'revision'-'updated_at') is distinct from
   (to_jsonb(old)-'revision'-'updated_at') then
   if op ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
     select t.astra_settlement into pinned from rpg_private.turns t
       where t.campaign_id=old.campaign_id and t.id=op::uuid
         and t.runtime_identity='astra-primary-v1' and t.status='committed';
     if pinned->'currencyDefinition'<>'null'::jsonb and
       new.campaign_id=old.campaign_id and
       new.revision=old.revision+1 and
       new.loop_state is not null and old.loop_state is not null and
       new.loop_state->'currencies'=old.loop_state->'currencies'||
         jsonb_build_array(pinned->'currencyDefinition') and
       new.loop_state->'version'=to_jsonb((old.loop_state->>'version')::integer+1)
       then
       expected:=jsonb_set(jsonb_set(old.loop_state,'{currencies}',
         old.loop_state->'currencies'||jsonb_build_array(
           pinned->'currencyDefinition')),'{version}',
         to_jsonb((old.loop_state->>'version')::integer+1));
       if new.loop_state=expected and
         (to_jsonb(new)-'revision'-'updated_at'-'loop_state')=
         (to_jsonb(old)-'revision'-'updated_at'-'loop_state') then
         perform rpg_private.wave4_state(old.campaign_id,new.loop_state,
           old.ruleset);
         return new;
       end if;
     end if;
   end if;
   if progress_op ~
     '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
     select t.astra_settlement into pinned from rpg_private.turns t
       where t.campaign_id=old.campaign_id and t.id=progress_op::uuid
         and t.runtime_identity='astra-primary-v1' and t.status='committed';
     if pinned->>'kind'='progression_award' and
       new.loop_state=pinned->'progressionState' and
       (new.loop_state-'progress'-'pending'-'version')=
         (old.loop_state-'progress'-'pending'-'version') and
       new.loop_state->'version'=to_jsonb((old.loop_state->>'version')::integer+1)
       and new.revision=old.revision+1 and
       (to_jsonb(new)-'revision'-'updated_at'-'loop_state')=
         (to_jsonb(old)-'revision'-'updated_at'-'loop_state') then
       perform rpg_private.wave4_state(old.campaign_id,new.loop_state,
         old.ruleset);
       return new;
     end if;
   end if;
   if current_setting('rpg.astra_advancement_request',true) ~
     '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
     expected:=rpg_private.astra_advancement_after(old.campaign_id,
       old.loop_state,coalesce((select a.value->'capabilities'
         from jsonb_array_elements(old.world->'actors') a
         where a.value->>'entityId'=
           current_setting('rpg.astra_advancement_hero',true) limit 1),
         '[]'::jsonb),
       current_setting('rpg.astra_advancement_pending',true)::uuid,
       current_setting('rpg.astra_advancement_option',true),
       current_setting('rpg.astra_advancement_track_version',true)::integer,
       current_setting('rpg.astra_advancement_hero',true)::uuid);
     if new.loop_state=expected and new.revision=old.revision+1 and
       (to_jsonb(new)-'revision'-'updated_at'-'loop_state')=
         (to_jsonb(old)-'revision'-'updated_at'-'loop_state') then
       return new;
     end if;
   end if;
   raise exception 'rpg_conflict';
 end if;
 return new;
end $$;

-- The delegated migration-45 commit deliberately autosaves only after its
-- settlement. Delay that save again for an earned progression delta.
alter function rpg_private.timeline_save(uuid,text,text,text)
  rename to timeline_save_before_astra_progression;
create function rpg_private.timeline_save(cid uuid,kind text,name text,
  trigger_key text default null) returns uuid language plpgsql
  set search_path='' as $$
declare op text:=current_setting('rpg.astra_progression_operation',true);
begin
 if kind='autosave' and op ~
   '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
   and trigger_key='turn:'||op then return null; end if;
 return rpg_private.timeline_save_before_astra_progression(cid,kind,name,
   trigger_key);
end $$;

-- A public scene identifier is presentation metadata, not a private receipt.
-- Existing stored media can be placed after its actual narration turn.
alter function rpg_private.runtime_public_turn(rpg_private.turns)
  rename to runtime_public_turn_before_media_anchor;
create function rpg_private.runtime_public_turn(t rpg_private.turns)
returns jsonb language sql stable set search_path='' as $$
 select rpg_private.runtime_public_turn_before_media_anchor(t)||
   jsonb_build_object('narrationSceneId',(
     select e.payload->>'narrationSceneId' from rpg_private.runtime_events e
     where e.campaign_id=t.campaign_id and e.operation_id=t.id
     order by e.created_at desc limit 1))
$$;

alter function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)
  rename to rpg_runtime_before_astra_progression;
create function public.rpg_runtime(p_owner_id uuid,p_campaign_id uuid,
  p_action text,p_payload jsonb default '{}',p_timeline jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare t rpg_private.turns%rowtype; result jsonb; source jsonb;
  state jsonb; baseline jsonb; op uuid; request_id uuid;
  saved rpg_private.runtime_commands%rowtype;
  f rpg_private.world_foundations%rowtype; hero uuid; next_state jsonb;
  rt rpg_private.runtime_state%rowtype; payload jsonb;
begin
 if p_action not in ('claim','commit','astra_advancement') then
   return public.rpg_runtime_before_astra_progression(p_owner_id,
     p_campaign_id,p_action,p_payload,p_timeline);
 end if;
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry
   where user_id=p_owner_id) then
   raise exception 'rpg_forbidden' using errcode='42501';
 end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id for update;
 if not found then raise exception 'rpg_not_found'; end if;
 if p_action='astra_advancement' then
   perform rpg_private.timeline_assert(p_campaign_id,p_timeline,true);
   perform rpg_private.fields(p_payload,array['requestId','campaignId',
     'expectedRevision','expectedWorldRevision','expectedStateVersion',
     'recipientId','pendingId','optionId','expectedTrackVersion']);
   request_id:=(p_payload->>'requestId')::uuid;
   perform rpg_private.assert(request_id is not null and
     p_payload->>'campaignId'=p_campaign_id::text);
   perform pg_advisory_xact_lock(hashtextextended(request_id::text,0));
   select * into saved from rpg_private.runtime_commands where id=request_id;
   if saved.id is not null then
     if saved.campaign_id<>p_campaign_id or saved.owner_id<>p_owner_id or
       saved.request<>p_payload then raise exception 'rpg_conflict'; end if;
     return saved.result;
   end if;
   if exists(select 1 from rpg_private.timeline_command_ids
     where category='runtime' and id=request_id) then
     raise exception 'rpg_conflict'; end if;
   select * into strict f from rpg_private.world_foundations
     where campaign_id=p_campaign_id for update;
   select * into strict rt from rpg_private.runtime_state
     where campaign_id=p_campaign_id for update;
   hero:=(p_payload->>'recipientId')::uuid;
   perform rpg_private.assert(f.astra_takeover->>'runtime'='astra-primary-v1'
     and f.ruleset->>'id'='world-logic-v1' and
     (p_payload->>'expectedRevision')::integer=rt.revision and
     (p_payload->>'expectedWorldRevision')::integer=f.revision and
     (p_payload->>'expectedStateVersion')::integer=
       (f.loop_state->>'version')::integer and
     rt.configuration->'controlledEntityIds'=jsonb_build_array(hero));
   next_state:=rpg_private.astra_advancement_after(p_campaign_id,
     f.loop_state,coalesce((select a.value->'capabilities'
       from jsonb_array_elements(f.world->'actors') a
       where a.value->>'entityId'=hero::text limit 1),'[]'::jsonb),
     (p_payload->>'pendingId')::uuid,p_payload->>'optionId',
     (p_payload->>'expectedTrackVersion')::integer,hero);
   perform set_config('rpg.astra_advancement_request',request_id::text,true);
   perform set_config('rpg.astra_advancement_hero',hero::text,true);
   perform set_config('rpg.astra_advancement_pending',
     p_payload->>'pendingId',true);
   perform set_config('rpg.astra_advancement_option',
     p_payload->>'optionId',true);
   perform set_config('rpg.astra_advancement_track_version',
     p_payload->>'expectedTrackVersion',true);
   update rpg_private.world_foundations set loop_state=next_state,
     revision=revision+1 where campaign_id=p_campaign_id;
   perform set_config('rpg.astra_advancement_request','',true);
   result:=rpg_private.timeline_stamp(jsonb_build_object('status','selected',
     'pendingId',p_payload->'pendingId','optionId',p_payload->'optionId',
     'stateVersion',next_state->'version'),
     rpg_private.timeline_fence(p_campaign_id));
   insert into rpg_private.runtime_commands(id,campaign_id,owner_id,
     request,result) values(request_id,p_campaign_id,p_owner_id,p_payload,result);
   if (select policy->>'autosave'='turn' from rpg_private.timeline_campaigns
     where campaign_id=p_campaign_id) then
     perform rpg_private.timeline_save(p_campaign_id,'autosave',
       'After advancement','advancement:'||request_id::text);
   end if;
   return result;
 end if;
 op:=(p_payload->>'operationId')::uuid;
 if p_action='claim' then
   result:=public.rpg_runtime_before_astra_progression(p_owner_id,
     p_campaign_id,p_action,p_payload,p_timeline);
   if result is null then return null; end if;
   select * into strict t from rpg_private.turns where id=op and
     campaign_id=p_campaign_id for update;
   if t.runtime_identity<>'astra-primary-v1' or
     not rpg_private.astra_takeover_active(p_campaign_id) then return result;
   end if;
   source:=t.source;
   if not source ? 'astraProgressionState' then
     select * into strict f from rpg_private.world_foundations
       where campaign_id=p_campaign_id;
     hero:=(source#>>'{runtime,configuration,controlledEntityIds,0}')::uuid;
     baseline:=coalesce((select a.value->'capabilities'
       from jsonb_array_elements(f.world->'actors') a
       where a.value->>'entityId'=hero::text limit 1),'[]'::jsonb);
     source:=source||jsonb_build_object('astraProgressionState',
       f.loop_state,'astraProgressionBaseline',baseline);
     update rpg_private.turns set source=source where id=op and
       campaign_id=p_campaign_id;
   end if;
   return jsonb_set(result,'{source}',source);
 end if;
 select * into t from rpg_private.turns where id=op and
   campaign_id=p_campaign_id for update;
 if t.astra_settlement is null or
   t.astra_settlement->>'kind'<>'progression_award' or
   t.status='committed' then
   return public.rpg_runtime_before_astra_progression(p_owner_id,
     p_campaign_id,p_action,p_payload,p_timeline);
 end if;
 perform set_config('rpg.astra_progression_operation',op::text,true);
 result:=public.rpg_runtime_before_astra_progression(p_owner_id,
   p_campaign_id,p_action,p_payload,p_timeline);
 perform rpg_private.assert(result->>'status'='committed');
 select * into strict f from rpg_private.world_foundations
   where campaign_id=p_campaign_id for update;
 perform rpg_private.assert(f.loop_state=t.source->'astraProgressionState');
 next_state:=t.astra_settlement->'progressionState';
 update rpg_private.world_foundations set loop_state=next_state,
   revision=revision+1 where campaign_id=p_campaign_id;
 perform set_config('rpg.astra_progression_operation','',true);
 if (select policy->>'autosave'='turn' from rpg_private.timeline_campaigns
   where campaign_id=p_campaign_id) then
   perform rpg_private.timeline_save(p_campaign_id,'autosave',
     'After action','turn:'||op::text);
 end if;
 return result;
end $$;

revoke all on function rpg_private.astra_progression_after(uuid,uuid,jsonb,jsonb,jsonb),
  rpg_private.astra_advancement_after(uuid,jsonb,jsonb,uuid,text,integer,uuid),
  rpg_private.astra_settlement_expected_before_progression(uuid,rpg_private.turns,jsonb),
  rpg_private.astra_settlement_expected(uuid,rpg_private.turns,jsonb),
  rpg_private.timeline_save_before_astra_progression(uuid,text,text,text),
  rpg_private.timeline_save(uuid,text,text,text),
  rpg_private.runtime_public_turn_before_media_anchor(rpg_private.turns),
  rpg_private.runtime_public_turn(rpg_private.turns)
  from public,anon,authenticated;
revoke all on function public.rpg_runtime_before_astra_progression(
  uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated,service_role;
revoke all on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)
  from public,anon,authenticated;
grant execute on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)
  to service_role;

commit;
