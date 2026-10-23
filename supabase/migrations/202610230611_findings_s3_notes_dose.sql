-- Findings S3, item 7 (docs/stages/FINDINGS_S3.md «The dose of the DM's own notes»; the owner's decision): the DM's
-- hidden layer — its own notes between sessions, written by the prep and rewritten by every session digest — may hold
-- 24 000 characters (it was 6 000, `HIDDEN_LAYER_MAX_CHARS` in hidden-layer.ts). The private-notes write of
-- rpg_dossier (migration 202610200074) checked every value against 6 000 characters; now the one reserved key
-- `hidden_layer` is checked against 24 000 and every other note keeps 6 000. Additive: the function is patched in place,
-- as 0074 and 0080 patched it; no row changes.
begin;

do $$ declare d text; before text; begin
 select pg_get_functiondef('public.rpg_dossier(uuid,uuid,text,jsonb,jsonb)'::regprocedure) into d;
 before:=d;
 d:=replace(d,'length(x.value->>''value'') not between 1 and 6000',
  'length(x.value->>''value'') not between 1 and (case when x.value->>''key''=''hidden_layer'' then 24000 else 6000 end)');
 perform rpg_private.assert(d<>before and d like '%then 24000 else 6000 end%');
 execute d;
end $$;

commit;
