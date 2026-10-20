-- Fix run after session 2, stage A1: the lease of a dm-loop-v1 turn is renewed while the model streams.
--   Migration 71 renews the lease at every fenced write (a receipt, a checkpoint, the commit, the failure),
--   but one model request at the new output cap (32 000 tokens, about five and a half minutes at ~95
--   tokens a second) writes nothing while it streams, so the lease could still run out inside a request.
--   The loop now sends a heartbeat every minute while a request streams: `lease_heartbeat` renews the lease
--   of the claimant that still holds it (the token is the fence, exactly as in migration 71) and answers
--   whether it did. A heartbeat from a fenced-out claimant renews nothing and changes nothing.
-- Additive only: one wrapper over the current entry point; no column, row or function removed.
begin;

alter function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) rename to rpg_runtime_before_heartbeat;

create function public.rpg_runtime(p_owner_id uuid,p_campaign_id uuid,p_action text,
  p_payload jsonb default '{}',p_timeline jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare op uuid; token uuid; renewed int;
begin
 if p_action='lease_heartbeat' then
   if jsonb_typeof(p_payload)<>'object' or p_owner_id is null or
     coalesce(p_payload->>'operationId','') !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' or
     coalesce(p_payload->>'token','') !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' or
     not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id) then
     raise exception 'rpg_validation';
   end if;
   op:=(p_payload->>'operationId')::uuid;
   token:=(p_payload->>'token')::uuid;
   -- No campaign lock: a heartbeat touches only its own turn row and never waits behind a commit.
   update rpg_private.turns set lease_until=greatest(lease_until,now()+interval '300 seconds')
     where id=op and campaign_id=p_campaign_id and owner_id=p_owner_id
       and runtime_identity='dm-loop-v1' and status in ('pending','generating')
       and lease_token is not null and lease_token=token;
   get diagnostics renewed=row_count;
   return jsonb_build_object('renewed',renewed>0);
 end if;
 return public.rpg_runtime_before_heartbeat(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);
end $$;

revoke all on function public.rpg_runtime_before_heartbeat(uuid,uuid,text,jsonb,jsonb)
  from public,anon,authenticated,service_role;
revoke all on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) to service_role;
revoke all on all functions in schema rpg_private from public,anon,authenticated;

commit;
