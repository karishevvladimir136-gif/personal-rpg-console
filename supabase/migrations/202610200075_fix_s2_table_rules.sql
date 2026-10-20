-- Fix run after session 2, B3 — the owner's rule decision of 2026-10-19 23:19 (BG3): on an ability check or a saving
-- throw a natural 20 succeeds and a natural 1 fails, whatever the total. The turn loop's server dice decide success so
-- (src/lib/gameplay/dm-loop/execute.ts); the dm_tool write of rpg_runtime asserted success = total >= dc and would
-- refuse such a check. The assertion now also admits a natural 20 recorded as a success and a natural 1 as a failure.
-- Only the turn loop's function is rewritten (the one whose body handles 'dm_tool'); every check that passed before
-- still passes. Additive: a function body rewritten from its current definition.
begin;

do $$ declare r record; d text; n integer:=0;
  old_rule text:='(check_row->>''success'')::boolean=((check_row->>''total'')::integer>=(check_row->>''dc'')::integer)';
  new_rule text:='((check_row->>''success'')::boolean=((check_row->>''total'')::integer>=(check_row->>''dc'')::integer)
         or ((check_row->>''kept'')::integer=20 and (check_row->>''success'')::boolean)
         or ((check_row->>''kept'')::integer=1 and not (check_row->>''success'')::boolean))';
begin
 for r in select p.oid from pg_proc p join pg_namespace s on s.oid=p.pronamespace
   where s.nspname in ('public','rpg_private') and p.prosrc like '%' || old_rule || '%' and p.prosrc like '%''dm_tool''%' loop
   d:=replace(pg_get_functiondef(r.oid),old_rule,new_rule);
   execute d;
   n:=n+1;
 end loop;
 perform rpg_private.assert(n=1);
end $$;

revoke all on all functions in schema rpg_private from public,anon,authenticated;

commit;
