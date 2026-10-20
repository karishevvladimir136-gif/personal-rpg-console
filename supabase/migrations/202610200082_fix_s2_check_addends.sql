-- Fix run after session 2, stage C (item 66, the roll card): a recorded check may carry its addends — every part of
-- the modifier with its own source (the sheet's skill or stat, each worn thing, each bonus of the fiction, the
-- formula's own number, the cap) — and the public turn's checks carry them to the roll card. Optional; older checks
-- have none. Additive only: the functions that list a check's fields strictly (as migration 58 widened them) and the
-- public projection of the checks are patched in place.
begin;

do $$ declare r record; d text; n integer:=0; begin
 for r in select p.oid from pg_proc p join pg_namespace s on s.oid=p.pronamespace
   where s.nspname in ('public','rpg_private') and p.prosrc like '%''reason'',''bonuses'',''advantageReason'',''difficulty'',''natural'']);%'
     and p.prosrc not like '%''natural'',''addends'']);%' loop
  select pg_get_functiondef(r.oid) into d;
  d:=replace(d,'''reason'',''bonuses'',''advantageReason'',''difficulty'',''natural'']);',
    '''reason'',''bonuses'',''advantageReason'',''difficulty'',''natural'',''addends'']);');
  if d like '%perform rpg_private.assert(coalesce(length(check_row->>''reason''),0)<=400 and%' then
    d:=replace(d,'perform rpg_private.assert(coalesce(length(check_row->>''reason''),0)<=400 and',
      'perform rpg_private.assert(coalesce(jsonb_array_length(case when jsonb_typeof(check_row->''addends'')=''array'' then check_row->''addends'' end),0)<=10
       and (not (check_row ? ''addends'') or jsonb_typeof(check_row->''addends'')=''array'') and octet_length(coalesce(check_row->''addends'',''[]''::jsonb)::text)<=2000);
     perform rpg_private.assert(coalesce(length(check_row->>''reason''),0)<=400 and');
  end if;
  execute d;
  n:=n+1;
 end loop;
 perform rpg_private.assert(n>=2);
end $$;

-- The public turn: each visible check carries its addends (the function of migration 58, renamed by 59).
do $m$ declare d text; begin
 select pg_get_functiondef('rpg_private.runtime_public_turn_before_polish_speed(rpg_private.turns)'::regprocedure) into d;
 d:=replace(d,$a$'difficulty',c.value->'difficulty','natural',c.value->'natural'))$a$,
  $b$'difficulty',c.value->'difficulty','natural',c.value->'natural','addends',c.value->'addends'))$b$);
 perform rpg_private.assert(d like '%''natural'',c.value->''natural'',''addends'',c.value->''addends''))%');
 execute d;
end $m$;

commit;
