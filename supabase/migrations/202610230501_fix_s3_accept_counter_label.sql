-- Fix S3-accept Г2 (docs/stages/FIX_S3_ACCEPT.md): the owner's sheet showed the counter «Shaman tusk» — the key
-- `shaman_tusk` made readable, because the counter was recorded in session 1, before a counter needed its name in the
-- campaign language (fix run D, public_profile.counterLabels). Additive and idempotent, written by shape (the owner's
-- database is not here): a person of a Russian campaign who keeps the counter `shaman_tusk` (or `resource_shaman_tusk`)
-- without a name gets the name «Клык шамана» (the thing the counter belongs to, as his inventory names it) in a new
-- revision of the record; a name already given (by the DM or the owner) is never touched; the counter's value and
-- maximum stay as they are.
begin;

do $$ declare r record; begin
 for r in select e.id, k.key from public.rpg_entities e join public.rpg_campaigns c on c.id=e.campaign_id
   cross join lateral (select key from jsonb_object_keys(e.resources) key where key in ('shaman_tusk','resource_shaman_tusk')) k
   where c.language='ru' and e.kind in ('player','companion','npc')
     and coalesce(btrim(e.public_profile#>>array['counterLabels',k.key]),'')=''
   for update of e loop
  update public.rpg_entities
     set public_profile=(case when jsonb_typeof(public_profile)='object' then public_profile else '{}'::jsonb end)||jsonb_build_object('counterLabels',
           (case when jsonb_typeof(public_profile->'counterLabels')='object' then public_profile->'counterLabels' else '{}'::jsonb end)
           ||jsonb_build_object(r.key,'Клык шамана')),
         revision=revision+1,updated_at=now()
   where id=r.id;
 end loop;
end $$;

commit;
