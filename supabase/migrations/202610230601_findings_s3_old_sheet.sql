-- Findings S3, item 4 (docs/stages/FINDINGS_S3.md «Old sheets under the 5e module»): the owner's hero of «Приключения
-- начинаются», Джеймс Вордсден, keeps the sheet his creation wrote (schema 1: no level, no save lines; the role «Маг школы
-- Воплощения…»), so the 5e module could not add the proficiency bonus to his saves. The owner's one-time correction: level
-- 5, and only the level — the save lines stay empty, so the class his role names (a wizard: Intelligence and Wisdom)
-- gives the proficient saves with the proficiency of his level (+3 at 5), and they follow the level when it changes.
-- Found by shape, not by id (the owner's database is not in the repository): a campaign titled «Приключения начинаются»,
-- its player hero whose name holds «Вордсден», whose role names a wizard and whose sheet has no level (on the sheet or as a
-- stat). Saved as the owner's own «Изменить лист» would save it: through `rpg_apply_mutation` as the owner (`entity.save`,
-- correction scope `timeline`) — a new revision, the sheet of schema 2 as `patchSheet` makes it (every line kept as it
-- is), the immutable owner-correction receipt (request id `wave4_id(<hero id>, 'findings-s3:old-sheet')`, its payload the
-- whole corrected record) and the record marked as an owner correction for the DM's memory. Idempotent: a corrected sheet
-- has a level. Without such a campaign or hero (a fresh, cloud or test database) nothing changes; a record the owner's
-- save refuses is left as it is with a warning, and the load goes on.
begin;

do $$ declare c record; e record; owner uuid; prior text:=current_setting('request.jwt.claim.sub',true); s jsonb; n integer:=0;
begin
 select r.user_id into owner from rpg_private.owner_registry r;
 if owner is null then raise notice 'findings_s3_old_sheet: no owner yet, nothing to correct'; return; end if;
 for c in select x.id from public.rpg_campaigns x where btrim(x.title) ~ '^[Пп]риключения\s+начинаются[.!…]*$' order by x.id loop
  for e in select en.* from public.rpg_entities en
    where en.campaign_id=c.id and en.kind='player' and en.name ~ '[Вв]ордсден'
      and jsonb_typeof(en.character_sheet)='object' and en.character_sheet->>'schemaVersion' in ('1','2')
      and coalesce(en.character_sheet->'level','null'::jsonb)='null'::jsonb and not (en.stats ? 'level')
      and coalesce(en.character_sheet->>'role','') ~ '(^|[^А-Яа-яЁёA-Za-z])([Мм]аг|[Вв]олшебни[а-яё]*|[Ww]izard)([^А-Яа-яЁёA-Za-z]|$)'
    order by en.id for update loop
   s:=e.character_sheet;
   -- The sheet of schema 2, as patchSheet makes it from schema 1 (every line kept, no spells yet).
   if s->>'schemaVersion'='1' then
    s:=jsonb_build_object('schemaVersion',2,'mode',s->'mode','role',s->'role','background',coalesce(s->'background','""'::jsonb),'level',null,
      'tier',coalesce(s->'tier','null'::jsonb),'attributes',coalesce(s->'attributes','null'::jsonb),'skills',coalesce(s->'skills','[]'::jsonb),
      'abilities',coalesce(s->'abilities','[]'::jsonb),'limitations',coalesce(s->'limitations','[]'::jsonb),'spells','[]'::jsonb);
   end if;
   -- Only the level: the class gives the proficient saves (no save lines are written).
   s:=jsonb_set(s,'{level}','5'::jsonb);
   -- A record the owner's save refuses is left as it is (the load goes on; the sheet then asks for its level itself).
   begin
    perform set_config('request.jwt.claim.sub',owner::text,true);
    perform public.rpg_apply_mutation(rpg_private.wave4_id(e.id,'findings-s3:old-sheet'),'entity.save',c.id,e.revision,
      jsonb_build_object('id',e.id,'kind',e.kind,'name',e.name,'details',e.details,'hp',e.hp,'max_hp',e.max_hp,'stats',e.stats,'resources',e.resources,
        'conditions',e.conditions,'equipment_slots',e.equipment_slots,'character_sheet',s),
      rpg_private.timeline_fence(c.id),'timeline');
    perform set_config('request.jwt.claim.sub',coalesce(prior,''),true);
    raise notice 'findings_s3_old_sheet: % — the owner''s correction: level 5', e.name;
    n:=n+1;
   exception when others then
    perform set_config('request.jwt.claim.sub',coalesce(prior,''),true);
    raise warning 'findings_s3_old_sheet: % not corrected (% %); «Изменить лист» sets the level by hand', e.name, sqlstate, sqlerrm;
   end;
  end loop;
 end loop;
 raise notice 'findings_s3_old_sheet: % sheet(s) corrected', n;
end $$;

commit;
