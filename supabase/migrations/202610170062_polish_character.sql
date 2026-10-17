-- Polish stage, group 8 (docs/stages/POLISH.md «Character and inventory for any
-- ruleset»): a hero with a narrative sheet gets the humanoid equipment slots too
-- (the universal paper doll for any ruleset). Additive only: the two asserts that
-- tied standard_humanoid to a structured sheet become no-ops in every function
-- that carries them (the bootstrap proposal and review checks of migration 42).
begin;
do $$ declare r record; d text; n integer:=0; begin
 for r in select p.oid from pg_proc p join pg_namespace s on s.oid=p.pronamespace
   where s.nspname in ('public','rpg_private')
     and (p.prosrc like '%''equipmentProfile''<>''standard_humanoid'' or p#>>''{sheet,mode}''=''structured_rpg''%'
       or p.prosrc like '%''equipmentProfile''<>''standard_humanoid'' or r#>>''{sheet,mode}''=''structured_rpg''%') loop
  select pg_get_functiondef(r.oid) into d;
  d:=replace(d,'perform rpg_private.assert(p->>''equipmentProfile''<>''standard_humanoid'' or p#>>''{sheet,mode}''=''structured_rpg'');','perform rpg_private.assert(true);');
  d:=replace(d,'perform rpg_private.assert(r->>''equipmentProfile''<>''standard_humanoid'' or r#>>''{sheet,mode}''=''structured_rpg'');','perform rpg_private.assert(true);');
  execute d;
  n:=n+1;
 end loop;
 perform rpg_private.assert(n>=1);
end $$;
commit;
