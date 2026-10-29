-- Multi-hero 1 (docs/stages/MULTI_HERO_1.md): at a company table — the DM option `company` (dm_settings.dm_options,
-- migration 73; src/lib/gameplay/dm-loop/company.ts) — each player has their own allowed rerolls: the session's
-- allowance («rerollsPerSession», 2 by default) counts per player character, not for the table.
--   * The public turn: a waiting card of a company table can be rerolled while its own character's rerolls of the
--     session are under the allowance (a resolved, withdrawn, voided or damage-carrying card still never can).
--   * The reroll itself: the runtime's count of the session's rerolls (rpg_runtime_phase2, the one place that counts
--     them) counts, at a company table, only the rerolls of the same character's cards.
-- Any other campaign reads and rerolls exactly as before: both changes are behind rpg_private.company_table(cid).
-- Additive only: three helper functions, one wrapper over the public turn and one function body edited in place (the
-- established pattern of migration 73); no table, column or row changed.
begin;

create function rpg_private.company_table(cid uuid) returns boolean
language sql stable set search_path='' as $$
 select coalesce((select d.dm_options->>'company' from rpg_private.dm_settings d where d.campaign_id=cid),'false')='true'
$$;

-- The character whose card a check of a turn's checkpoint is.
create function rpg_private.reroll_actor(checkpoint jsonb, check_id text) returns text
language sql immutable set search_path='' as $$
 select c->>'actorId' from jsonb_array_elements(coalesce(checkpoint->'checks','[]'::jsonb)) c where c->>'id'=check_id limit 1
$$;

-- The rerolls of one character's cards in one session (the commands the runtime keeps).
create function rpg_private.rerolls_used_by(cid uuid, sid uuid, actor text) returns integer
language sql stable set search_path='' as $$
 select count(*)::integer from rpg_private.runtime_commands q join rpg_private.turns r on q.operation_id=r.id
  where q.campaign_id=cid and r.session_id is not distinct from sid and q.request->>'action'='reroll'
    and rpg_private.reroll_actor(r.checkpoint,q.request->>'checkId') is not distinct from actor
$$;
revoke all on function rpg_private.company_table(uuid),rpg_private.reroll_actor(jsonb,text),rpg_private.rerolls_used_by(uuid,uuid,text)
  from public,anon,authenticated;

-- 1. The public turn --------------------------------------------------------------------------------------------------
alter function rpg_private.runtime_public_turn(rpg_private.turns) rename to runtime_public_turn_before_multi_hero;
create function rpg_private.runtime_public_turn(t rpg_private.turns)
returns jsonb language plpgsql stable set search_path='' as $$
declare result jsonb:=rpg_private.runtime_public_turn_before_multi_hero(t); checks jsonb:='[]'::jsonb; entry jsonb; begin
 if jsonb_typeof(result->'checks') is distinct from 'array' or jsonb_array_length(result->'checks')=0
   or not rpg_private.company_table(t.campaign_id) then return result; end if;
 for entry in select v.value from jsonb_array_elements(result->'checks') with ordinality v(value,n) order by v.n loop
   if not (entry ? 'resolved' or entry ? 'withdrawn' or entry ? 'voided' or entry ? 'bundledDamage') then
     entry:=entry||jsonb_build_object('canReroll',t.status='awaiting_confirmation' and
       (t.settings#>>'{difficulty,rerolls}'='unlimited' or (t.settings#>>'{difficulty,rerolls}'='limited' and
        rpg_private.rerolls_used_by(t.campaign_id,t.session_id,entry->>'actorId')<(t.settings#>>'{difficulty,rerollsPerSession}')::integer)));
   end if;
   checks:=checks||jsonb_build_array(entry);
 end loop;
 return jsonb_set(result,'{checks}',checks);
end $$;
revoke all on function rpg_private.runtime_public_turn_before_multi_hero(rpg_private.turns),rpg_private.runtime_public_turn(rpg_private.turns)
  from public,anon,authenticated;

-- 2. The reroll: the session's count, per character at a company table ----------------------------------------------
do $$ declare d text; before text; begin
 select pg_get_functiondef('public.rpg_runtime_phase2(uuid,uuid,text,jsonb)'::regprocedure) into d;
 before:=d;
 d:=replace(d,
  'where q.campaign_id=cid and r.session_id is not distinct from turn.session_id and q.request->>''action''=''reroll'';',
  'where q.campaign_id=cid and r.session_id is not distinct from turn.session_id and q.request->>''action''=''reroll'' and (not rpg_private.company_table(cid) or rpg_private.reroll_actor(r.checkpoint,q.request->>''checkId'') is not distinct from old_check->>''actorId'');');
 perform rpg_private.assert(d<>before and d like '%rpg_private.company_table(cid)%'
   and position('select c into old_check' in d)<position('rpg_private.company_table(cid)' in d));
 execute d;
end $$;

commit;
