-- Polish stage, group 2 (docs/stages/POLISH.md): rolls. Additive only.
--   * a recorded check may carry the DM's reason, the bonuses with their sources,
--     why advantage was granted, the difficulty in words and a natural 20 / 1
--     (optional keys; older checks have none);
--   * the public turn's checks carry those keys to the roll card.
begin;

-- 1. Every runtime function that lists a recorded check's fields strictly (the
--    phase-2 checks/reroll path and the loop's dm_tool receipt of migration 53)
--    accepts the optional keys; the loop's receipt also bounds them.
do $$ declare r record; d text; n integer:=0; begin
 for r in select p.oid from pg_proc p join pg_namespace s on s.oid=p.pronamespace
   where s.nspname in ('public','rpg_private') and p.prosrc like '%''success'',''rollNumber'']);%'
     and p.prosrc not like '%''advantageReason'',''difficulty'',''natural''%' loop
  select pg_get_functiondef(r.oid) into d;
  d:=replace(d,'''success'',''rollNumber'']);',
    '''success'',''rollNumber''],array[''reason'',''bonuses'',''advantageReason'',''difficulty'',''natural'']);');
  if d like '%perform rpg_private.assert(check_index<8 and (check_row->>''index'')::integer=check_index and%' then
    d:=replace(d,'perform rpg_private.assert(check_index<8 and (check_row->>''index'')::integer=check_index and',
      'perform rpg_private.assert(coalesce(length(check_row->>''reason''),0)<=400 and coalesce(jsonb_array_length(check_row->''bonuses''),0)<=4 and
       coalesce(check_row->>''difficulty'',''normal'') in (''easy'',''normal'',''hard'',''very_hard'',''nearly_impossible'') and
       coalesce(check_row->>''natural'',''crit'') in (''crit'',''fumble''));
     perform rpg_private.assert(check_index<8 and (check_row->>''index'')::integer=check_index and');
  end if;
  execute d;
  n:=n+1;
 end loop;
 perform rpg_private.assert(n>=2);
end $$;

-- 2. The public turn: each visible check carries the words of its moment.
alter function rpg_private.runtime_public_turn(rpg_private.turns) rename to runtime_public_turn_before_polish_rolls;
create function rpg_private.runtime_public_turn(t rpg_private.turns)
returns jsonb language plpgsql stable set search_path='' as $$
declare result jsonb:=rpg_private.runtime_public_turn_before_polish_rolls(t); checks jsonb; begin
 if jsonb_typeof(result->'checks')='array' and jsonb_array_length(result->'checks')>0 then
   select coalesce(jsonb_agg(v.value||jsonb_strip_nulls(jsonb_build_object(
       'reason',c.value->'reason','bonuses',c.value->'bonuses','advantageReason',c.value->'advantageReason',
       'difficulty',c.value->'difficulty','natural',c.value->'natural')) order by v.ordinality),'[]'::jsonb) into checks
     from jsonb_array_elements(result->'checks') with ordinality v(value,ordinality)
     left join lateral (select x.value from jsonb_array_elements(coalesce(t.checkpoint->'checks','[]'::jsonb)) x where x.value->>'id'=v.value->>'id' limit 1) c on true;
   result:=jsonb_set(result,'{checks}',checks);
 end if;
 return result;
end $$;
revoke all on function rpg_private.runtime_public_turn_before_polish_rolls(rpg_private.turns),rpg_private.runtime_public_turn(rpg_private.turns) from public,anon,authenticated;

commit;
