-- Fix run after session 2, stage D (§5, §9 of docs/runs/fix-s2-inventory-design.md): the owner's corrections carry
-- what the inventory model keeps outside the Phase 1 columns. Additive: the owner's save of an item may send its
-- `detail` (the history line of an owner move, a lent or pledged status) and `rarity`; of a storage its `detail` (a
-- place pile's location and coins) and the kind 'place'; of a character its `character_sheet` (the owner edits the
-- sheet; the table's check validates it) and `public_profile` (counter labels). Every other rule of the save holds.
begin;

do $$ declare d text; needle constant text:='perform rpg_private.fields(p_payload,required,array[''id'']);'; begin
 select pg_get_functiondef('rpg_private.apply_base_mutation(uuid,text,uuid,integer,jsonb)'::regprocedure) into d;
 perform rpg_private.assert(position(needle in d)>0);
 d:=replace(d,needle,'perform rpg_private.fields(p_payload,required,array[''id'']||case tab when ''rpg_items'' then array[''detail'',''rarity'']
      when ''rpg_storages'' then array[''detail''] when ''rpg_entities'' then array[''character_sheet'',''public_profile''] else ''{}''::text[] end);');
 execute d;
end $$;

revoke all on function rpg_private.apply_base_mutation(uuid,text,uuid,integer,jsonb) from public,anon,authenticated;

commit;
