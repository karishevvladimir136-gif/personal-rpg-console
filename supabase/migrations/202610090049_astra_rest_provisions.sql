-- Keep the independent migration-48 rest reconstruction aligned with ordinary
-- player-facing food and supplies. All other ordered-effect guards stay intact.
begin;

create function rpg_private.astra_rest_provision(s jsonb,rid uuid)
returns boolean language sql immutable set search_path='' as $$
 select rpg_private.astra_shadow_row(s,'items',rid) is not null
   and lower(coalesce(rpg_private.astra_shadow_row(s,'items',rid)->>'category',''))
     not in ('weapon','weapons')
   and not rpg_private.astra_mechanic_tagged(s,rid,'weapon')
   and (lower(coalesce(rpg_private.astra_shadow_row(s,'items',rid)->>'category',''))
       in ('food','supply') or rpg_private.astra_mechanic_tagged(s,rid,'supply'))
   and not rpg_private.astra_mechanic_tagged(s,rid,'meal-serving')
   and not rpg_private.astra_mechanic_tagged(s,rid,'coffee-serving')
$$;

-- Replace exactly the two rest-provision predicates in the effective 48
-- function. Guarded replacement preserves the same function identity, grants,
-- and every unrelated reconstruction branch without carrying a stale copy.
do $migration$
declare definition text:=pg_get_functiondef(
  'rpg_private.astra_mechanics_expected(uuid,rpg_private.turns,jsonb)'::regprocedure);
 selector_old text:=$old$not rpg_private.astra_mechanic_tagged(t.source,(item->>'id')::uuid,'supply') or$old$;
 selector_new text:=$new$not rpg_private.astra_rest_provision(t.source,(item->>'id')::uuid) or$new$;
 completion_old text:=$old$and rpg_private.astra_mechanic_tagged(s,item_id,'supply') and$old$;
 completion_new text:=$new$and rpg_private.astra_rest_provision(s,item_id) and$new$;
begin
 if definition is null or
   length(definition)-length(replace(definition,selector_old,''))<>length(selector_old) or
   length(definition)-length(replace(definition,completion_old,''))<>length(completion_old)
 then raise exception 'rpg_conflict'; end if;
 definition:=replace(replace(definition,selector_old,selector_new),completion_old,completion_new);
 execute definition;
end $migration$;

revoke all on function rpg_private.astra_rest_provision(jsonb,uuid)
  from public,anon,authenticated;
commit;
