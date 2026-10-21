-- Fixes before session 3 (docs/stages/FIX_S3_PRE.md, audit row B-1): the owner's rule (BG3) for a REROLL too. A preset
-- reroll used to re-score the new die as total >= dc under the old die's natural label (a rerolled 20 against DC 30 came
-- back a failure labelled «fumble»). The turn loop now recomputes the label and the verdict from the new die
-- (src/lib/gameplay/dice.ts withNatural); the reroll write of rpg_runtime_phase2 asserted that a reroll keeps every
-- field but the dice (the natural label included) and that success = total >= dc, and would refuse it. The reroll now
-- may change the natural label — only to the label of its own kept die — and the verdict also admits a natural 20
-- recorded as a success and a natural 1 as a failure, as migration 75 did for the first roll. Every reroll and check
-- that passed before still passes. Additive: a function body rewritten from its current definition.
begin;

do $$ declare r record; d text; n integer:=0;
  old_same text:='(entry - array[''dice'',''kept'',''total'',''success'',''rollNumber''])=(old_check - array[''dice'',''kept'',''total'',''success'',''rollNumber''])';
  new_same text:='(entry - array[''dice'',''kept'',''total'',''success'',''rollNumber'',''natural''])=(old_check - array[''dice'',''kept'',''total'',''success'',''rollNumber'',''natural''])
         and (not (old_check ? ''natural'') or entry ? ''natural'')
         and (not (entry ? ''natural'') or jsonb_typeof(entry->''natural'')=''null'' and (entry->>''kept'')::integer not in (1,20)
           or entry->>''natural''=case (entry->>''kept'')::integer when 20 then ''crit'' when 1 then ''fumble'' end)';
  old_rule text:='(entry->>''success'')::boolean=((entry->>''total'')::integer>=(entry->>''dc'')::integer)';
  new_rule text:='((entry->>''success'')::boolean=((entry->>''total'')::integer>=(entry->>''dc'')::integer)
         or ((entry->>''kept'')::integer=20 and (entry->>''success'')::boolean)
         or ((entry->>''kept'')::integer=1 and not (entry->>''success'')::boolean))';
begin
 for r in select p.oid from pg_proc p join pg_namespace s on s.oid=p.pronamespace
   where s.nspname in ('public','rpg_private') and p.prosrc like '%' || old_same || '%' and p.prosrc like '%' || old_rule || '%' loop
   d:=replace(replace(pg_get_functiondef(r.oid),old_same,new_same),old_rule,new_rule);
   execute d;
   n:=n+1;
 end loop;
 perform rpg_private.assert(n=1);
end $$;

revoke all on all functions in schema rpg_private from public,anon,authenticated;

commit;
