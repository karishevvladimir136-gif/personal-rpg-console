-- Fix S4 run 1 (FIX_S4_TABLE items 3, 11b, 11r): what the player can do while a roll card waits.
--   * The public turn says which cards of a dm-loop-v1 turn still wait. A check resolved at an earlier pause of the same
--     turn («Onward») carries `resolved: true`; one the DM (on the player's «?») or the owner withdrew before it counted
--     carries `withdrawn: {by, reason}`; one the owner voided after it was rolled carries `voided: {by, note, at}`. None of
--     them can be rerolled (`canReroll` false), and the chip of a withdrawn or voided roll says so in the campaign's
--     language. The marks are entries of the turn's own `checkpoint.dmLoop.diagnostics`: the loop writes
--     `checks_resolved` at «Onward» through the existing checkpoint action; the action below writes the other two.
--   * `check_correction`: one mark appended to the turn's diagnostics — never a check, a receipt or a text changed or
--     removed (the record is amended, not rewritten; the first roll stays as it was). A withdrawal is for a waiting card
--     of a paused turn; a void is the owner's, on a paused or a committed turn. Refused while a claimant holds the
--     turn's lease, for a check that is not one of the turn's player-visible checks, for a withdrawal of a resolved
--     check, and a second time for the same check; the same request again returns the turn as it is.
--   * The invariant behind the loop's own refusal: a resolved, withdrawn or voided check is never rerolled.
-- Additive only: one wrapper over the public turn and one over the runtime entry point; no table, column or row changed.
begin;

-- 1. The public turn --------------------------------------------------------------------------------------------------
alter function rpg_private.runtime_public_turn(rpg_private.turns) rename to runtime_public_turn_before_fix_s4_cards;
create function rpg_private.runtime_public_turn(t rpg_private.turns)
returns jsonb language plpgsql stable set search_path='' as $$
declare result jsonb:=rpg_private.runtime_public_turn_before_fix_s4_cards(t); marks jsonb; checks jsonb:='[]'::jsonb;
 entry jsonb; mark jsonb; line text; at integer; ru boolean; begin
 if t.runtime_identity is distinct from 'dm-loop-v1' or jsonb_typeof(result->'checks') is distinct from 'array'
   or jsonb_array_length(result->'checks')=0 then return result; end if;
 marks:=t.checkpoint#>'{dmLoop,diagnostics}';
 if jsonb_typeof(marks) is distinct from 'array' or not exists(select 1 from jsonb_array_elements(marks) d
   where d->>'kind' in ('checks_resolved','check_withdrawn','check_voided')) then return result; end if;
 for entry in select v.value from jsonb_array_elements(result->'checks') with ordinality v(value,n) order by v.n loop
   if exists(select 1 from jsonb_array_elements(marks) d where d->>'kind'='checks_resolved'
     and jsonb_typeof(d->'ids')='array' and d->'ids' ? (entry->>'id')) then
     entry:=entry||jsonb_build_object('canReroll',false,'resolved',true);
   end if;
   select d into mark from jsonb_array_elements(marks) d where d->>'kind'='check_withdrawn' and d->>'id'=entry->>'id' limit 1;
   if mark is not null then
     entry:=entry||jsonb_build_object('canReroll',false,'withdrawn',jsonb_build_object('by',mark->'by','reason',coalesce(mark->'reason','null'::jsonb)));
   end if;
   select d into mark from jsonb_array_elements(marks) d where d->>'kind'='check_voided' and d->>'id'=entry->>'id' limit 1;
   if mark is not null then
     entry:=entry||jsonb_build_object('canReroll',false,'voided',jsonb_build_object('by',mark->'by','note',coalesce(mark->'reason','null'::jsonb),'at',coalesce(mark->'at','null'::jsonb)));
   end if;
   checks:=checks||jsonb_build_array(entry);
 end loop;
 result:=jsonb_set(result,'{checks}',checks);
 -- A committed turn's chip of a withdrawn or voided roll: the receipt's own line, amended (never replaced).
 if jsonb_typeof(result->'changes')='array' then
   ru:=coalesce(t.settings->>'language','')='ru';
   for mark in select d from jsonb_array_elements(marks) d where d->>'kind' in ('check_withdrawn','check_voided') loop
     select r.value#>>'{result,player}' into line from jsonb_array_elements(coalesce(t.checkpoint#>'{dmLoop,receipts}','[]'::jsonb)) r
       where r.value#>>'{result,check,id}'=mark->>'id' limit 1;
     if line is null then continue; end if;
     at:=null;
     select (c.n-1)::integer into at from jsonb_array_elements(result->'changes') with ordinality c(value,n)
       where c.value->>'tool'='roll' and c.value->>'summary'=line and not (c.value ? 'checkId') order by c.n limit 1;
     if at is null then continue; end if;
     result:=jsonb_set(result,array['changes',at::text],(result->'changes'->at)||jsonb_build_object('checkId',mark->>'id',
       'summary',line||case when mark->>'kind'='check_withdrawn'
         then case when ru then ' — снят за столом' else ' — withdrawn at the table' end
         else case when ru then ' — отменён владельцем: этого броска не было' else ' — voided by the owner: this roll did not happen' end end,
       case when mark->>'kind'='check_withdrawn' then 'withdrawn' else 'voided' end,true));
   end loop;
 end if;
 return result;
end $$;
revoke all on function rpg_private.runtime_public_turn_before_fix_s4_cards(rpg_private.turns),rpg_private.runtime_public_turn(rpg_private.turns) from public,anon,authenticated;

-- 2. The runtime entry point: `check_correction`, and the reroll invariant --------------------------------------------
alter function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) rename to rpg_runtime_before_fix_s4_cards;

create function public.rpg_runtime(p_owner_id uuid,p_campaign_id uuid,p_action text,
  p_payload jsonb default '{}',p_timeline jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare t rpg_private.turns%rowtype; marks jsonb; mark jsonb; uuid_pattern text:='^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
begin
 if p_action='check_correction' then
   if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id)
     then raise exception 'rpg_forbidden' using errcode='42501'; end if;
   perform rpg_private.fields(p_payload,array['requestId','operationId','checkId','kind','by','reason']);
   perform rpg_private.assert(p_payload->>'requestId' ~ uuid_pattern and p_payload->>'operationId' ~ uuid_pattern and
     jsonb_typeof(p_payload->'checkId')='string' and length(p_payload->>'checkId') between 1 and 200 and
     p_payload->>'kind' in ('withdraw','void') and p_payload->>'by' in ('dm','owner') and
     (p_payload->>'kind'='withdraw' or p_payload->>'by'='owner') and
     (p_payload->'reason'='null'::jsonb or (jsonb_typeof(p_payload->'reason')='string' and length(p_payload->>'reason')<=300)));
   -- The lock order of every runtime action: the campaign first, then the turn.
   perform 1 from public.rpg_campaigns where id=p_campaign_id for update;
   if not found then raise exception 'rpg_not_found'; end if;
   select * into t from rpg_private.turns where id=(p_payload->>'operationId')::uuid and campaign_id=p_campaign_id
     and owner_id=p_owner_id for update;
   if t.id is null then raise exception 'rpg_not_found'; end if;
   perform rpg_private.timeline_assert(p_campaign_id,p_timeline,true);
   perform rpg_private.assert(t.runtime_identity='dm-loop-v1' and t.input->>'mode' in ('game','companion') and
     jsonb_typeof(t.checkpoint#>'{dmLoop,diagnostics}')='array');
   marks:=t.checkpoint#>'{dmLoop,diagnostics}';
   if exists(select 1 from jsonb_array_elements(marks) d where d->>'requestId'=p_payload->>'requestId') then
     return rpg_private.timeline_stamp(rpg_private.runtime_public_turn(t),rpg_private.timeline_fence(p_campaign_id));
   end if;
   -- Never while the turn is running: a claimant's next checkpoint would not carry the mark.
   if t.lease_token is not null and t.lease_until>now() then raise exception 'rpg_conflict'; end if;
   perform rpg_private.assert(exists(select 1 from jsonb_array_elements(coalesce(t.checkpoint->'checks','[]'::jsonb)) c
       where c->>'id'=p_payload->>'checkId' and c->>'visibility'='player') and
     not exists(select 1 from jsonb_array_elements(marks) d where d->>'kind' in ('check_withdrawn','check_voided')
       and d->>'id'=p_payload->>'checkId'));
   if p_payload->>'kind'='withdraw' then
     perform rpg_private.assert(t.status='awaiting_confirmation' and not exists(select 1 from jsonb_array_elements(marks) d
       where d->>'kind'='checks_resolved' and jsonb_typeof(d->'ids')='array' and d->'ids' ? (p_payload->>'checkId')));
   else
     perform rpg_private.assert(t.status in ('awaiting_confirmation','committed'));
   end if;
   mark:=jsonb_build_object('kind',case when p_payload->>'kind'='withdraw' then 'check_withdrawn' else 'check_voided' end,
     'id',p_payload->>'checkId','by',p_payload->>'by','reason',p_payload->'reason','requestId',p_payload->>'requestId','at',now());
   update rpg_private.turns set checkpoint=jsonb_set(checkpoint,'{dmLoop,diagnostics}',marks||jsonb_build_array(mark)),updated_at=now()
     where id=t.id and campaign_id=p_campaign_id returning * into t;
   return rpg_private.timeline_stamp(rpg_private.runtime_public_turn(t),rpg_private.timeline_fence(p_campaign_id));
 end if;
 if p_action='reroll' and jsonb_typeof(p_payload)='object' and coalesce(p_payload->>'operationId','') ~ uuid_pattern then
   select * into t from rpg_private.turns where id=(p_payload->>'operationId')::uuid and campaign_id=p_campaign_id;
   if t.runtime_identity='dm-loop-v1' and jsonb_typeof(t.checkpoint#>'{dmLoop,diagnostics}')='array' and exists(
     select 1 from jsonb_array_elements(t.checkpoint#>'{dmLoop,diagnostics}') d
     where (d->>'kind' in ('check_withdrawn','check_voided') and d->>'id'=p_payload#>>'{command,checkId}') or
       (d->>'kind'='checks_resolved' and jsonb_typeof(d->'ids')='array' and d->'ids' ? (p_payload#>>'{command,checkId}'))) then
     raise exception 'rpg_validation';
   end if;
 end if;
 return public.rpg_runtime_before_fix_s4_cards(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);
end $$;

revoke all on function public.rpg_runtime_before_fix_s4_cards(uuid,uuid,text,jsonb,jsonb)
  from public,anon,authenticated,service_role;
revoke all on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) to service_role;
revoke all on all functions in schema rpg_private from public,anon,authenticated;

commit;
