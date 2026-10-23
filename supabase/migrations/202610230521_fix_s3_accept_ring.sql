-- Fixes from the owner's acceptance pass (docs/stages/FIX_S3_ACCEPT.md А3): the ring of minor protection in the owner's
-- campaign lies in the hero's bag with the description «… у куклы пока нет слота для колец» — written before the doll had
-- ring slots (migration 76) — and is not worn. Found by shape, not by id (the owner's database is not in the repository):
-- a ring («кольц», «перстен», «ring» in its name) whose description or properties carry that phrase. Each such ring
--   * loses the phrase: a bracket holding it goes, else the clause after a comma, a semicolon or a dash, else its sentence;
--   * is put on its owner's «Кольцо (правая)» (the older ring first; the left ring when the right one is taken; left in
--     the bag when both are, when it is worn already, lent, pledged or lost, when it needs attunement and three attuned
--     things are worn, or when the owner's doll has no ring slots), as the owner's «Надеть» would (the slot takes
--     jewellery, so the kind becomes jewellery when it was another);
--   * keeps its history: a new revision, and the item's history gains «поправка: …» and «надето: <owner> — <slot>» (the
--     DM reads the second as an owner move next turn, as after the owner's own «Надеть»).
-- Idempotent: a fixed ring no longer carries the phrase. Applying it changes only such rings; nothing else is touched.
begin;

do $$ declare i record; e record; ru boolean; minutes integer; slot jsonb; target text; label text; texts text[]; t text;
  history jsonb; next_kind text; n integer:=0; worn integer:=0;
  phrase constant text:='[Уу]\s+куклы\s+пока\s+нет\s+слота\s+для\s+колец';
begin
 for i in select it.* from public.rpg_items it
   where (it.description ~ phrase or it.mechanics ~ phrase) and it.name ~ '([Кк]ольц|[Пп]ерстен|[Rr]ing)' and it.quantity>0
   order by it.campaign_id,it.updated_at,it.id for update loop
  select c.language='ru' into ru from public.rpg_campaigns c where c.id=i.campaign_id;
  minutes:=coalesce((select r.world_minutes from rpg_private.runtime_state r where r.campaign_id=i.campaign_id),0);
  -- 1. The phrase goes: in brackets, as a clause, or as its own sentence; then the spacing and the punctuation are tidied.
  texts:=array[i.description,i.mechanics];
  for k in 1..2 loop
   t:=texts[k];
   t:=regexp_replace(t,'\s*\([^()]*'||phrase||'[^()]*\)','','g');
   t:=regexp_replace(t,'\s*[,;—–-]\s*[^,;.!?()]*'||phrase||'[^.!?;()]*','','g');
   t:=regexp_replace(t,'[^.!?]*'||phrase||'[^.!?]*[.!?]?','','g');
   t:=regexp_replace(regexp_replace(t,'[ \t]{2,}',' ','g'),'[ \t]+([.,;!?])','\1','g');
   texts[k]:=btrim(regexp_replace(t,'^[\s.,;—–-]+',''));
  end loop;
  history:=coalesce(i.detail->'history','[]'::jsonb)||jsonb_build_array(jsonb_build_object('at',minutes,'event','owner_corrected',
    'note',case when ru then 'поправка перед сессией 3: из описания убрано «у куклы пока нет слота для колец»'
      else 'correction before session 3: «у куклы пока нет слота для колец» removed from the description' end));
  next_kind:=i.category; target:=null; label:=null;
  -- 2. On the doll: the right ring, else the left one, when the owner wears things and the ring is free to be worn.
  select en.* into e from public.rpg_entities en where en.campaign_id=i.campaign_id and en.id=i.owner_entity_id and en.kind in ('player','companion','npc');
  if e.id is not null and i.equipped_entity_id is null and coalesce(i.detail->>'status','') not in ('lent','pledged','lost')
     and not (coalesce(i.detail->>'attunement','')='true' and (select count(*) from public.rpg_items w where w.campaign_id=i.campaign_id
       and w.equipped_entity_id=e.id and w.quantity>0 and w.detail->>'attunement'='true')>=3) then
   for k in 1..2 loop
    slot:=(select value from jsonb_array_elements(e.equipment_slots) where value->>'id'=(array['ring_right','ring_left'])[k] limit 1);
    if slot is not null and not exists(select 1 from public.rpg_items w where w.campaign_id=i.campaign_id and w.equipped_entity_id=e.id
        and w.equipped_slot=slot->>'id' and w.quantity>0) then
     target:=slot->>'id'; label:=coalesce(slot->>'label',target);
     if jsonb_typeof(slot->'accepts')='array' and not (slot->'accepts' ? next_kind) then next_kind:='jewelry'; end if;
     exit;
    end if;
   end loop;
  end if;
  if target is not null then
   history:=history||jsonb_build_array(jsonb_build_object('at',minutes,'event','owner_equipped','note',left(e.name,120)||' — '||label));
   worn:=worn+1;
  end if;
  if jsonb_array_length(history)>20 then
   history:=(select jsonb_agg(x.h order by x.o) from jsonb_array_elements(history) with ordinality x(h,o) where x.o>jsonb_array_length(history)-20);
  end if;
  update public.rpg_items it set description=texts[1],mechanics=texts[2],category=next_kind,
    equipped_entity_id=case when target is not null then e.id else it.equipped_entity_id end,
    equipped_slot=coalesce(target,it.equipped_slot),
    detail=jsonb_set(it.detail,'{history}',history),revision=it.revision+1,updated_at=now()
   where it.id=i.id;
  n:=n+1;
 end loop;
 raise notice 'fix_s3_accept_ring: % ring(s) fixed, % put on', n, worn;
end $$;

commit;
