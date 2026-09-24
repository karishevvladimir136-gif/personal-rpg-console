-- Additive Mega DM v1 Cognitive/Living Character/Afterglow Craft and optional
-- campaign style. Existing Craft versions and seven-field settings stay valid.
begin;

alter function rpg_private.settings_valid(jsonb,uuid) rename to settings_valid_before_cognitive;
create function rpg_private.settings_valid(s jsonb,cid uuid) returns void language plpgsql set search_path='' as $$
declare style jsonb:=s->'dmStyle'; old_settings jsonb:=s; begin
 if style is not null then
  if style ? 'emotionalTone' then perform rpg_private.assert(style->>'emotionalTone' in ('hopeful_humanist','balanced','bleak')); end if;
  if style ? 'tragedyIntensity' then perform rpg_private.assert(style->>'tragedyIntensity' in ('low','normal','unrestricted')); end if;
  old_settings:=jsonb_set(s,'{dmStyle}',style-array['emotionalTone','tragedyIntensity']);
 end if;
 perform rpg_private.settings_valid_before_cognitive(old_settings,cid);
end $$;

create or replace function rpg_private.dm_craft_snapshot(uid uuid,cid uuid,opid uuid) returns jsonb language plpgsql stable set search_path='' as $$
declare t rpg_private.turns%rowtype; doctrine jsonb; style jsonb; mode text; begin
 select * into t from rpg_private.turns where id=opid and campaign_id=cid and owner_id=uid;
 if not found then raise exception 'rpg_not_found'; end if;
 style:='{"companionAgency":"normal","descriptionDensity":"balanced","dialogueDensity":"balanced","dramaticPace":"balanced","mystery":"normal","failForward":"normal","tone":"grounded","emotionalTone":"hopeful_humanist","tragedyIntensity":"normal"}'::jsonb || coalesce(t.settings->'dmStyle','{}'::jsonb);
 select rpg_private.dm_craft_json(v) into doctrine from rpg_private.dm_craft_effective e join rpg_private.dm_craft_versions v on v.id=e.active_version_id where e.owner_id=uid and e.key='core-doctrine';
 mode:=t.input->>'mode';
 return jsonb_build_object('policyVersion','mega-dm-v1-public-context-2','ownerId',uid,'campaignId',cid,'operationId',opid,'timeline',rpg_private.timeline_fence(cid),'styleRevision',t.settings_revision,'style',style,'doctrine',doctrine,
  'plan',case when mode in ('game','companion','mechanic') then rpg_private.dm_craft_stage_v2(uid,cid,'plan',t.input->>'input') else '[]'::jsonb end,
  'narrate',case when mode in ('game','companion','mechanic') then rpg_private.dm_craft_stage_v2(uid,cid,'narrate',t.input->>'input') else '[]'::jsonb end);
end $$;

alter function rpg_private.dm_craft_seed(uuid) rename to dm_craft_seed_before_cognitive;
create function rpg_private.dm_craft_seed(uid uuid) returns void language plpgsql set search_path='' as $$
declare e record; vid uuid; active rpg_private.dm_craft_effective%rowtype; next_version integer; begin
 perform rpg_private.dm_craft_seed_before_cognitive(uid);
 -- The new doctrine is a version, never an edit to the frozen original.
 if not exists(select 1 from rpg_private.dm_craft_versions where owner_id=uid and key='core-doctrine' and version=2) then
  insert into rpg_private.dm_craft_versions(owner_id,key,version,kind,category,stages,triggers,en,ru,provenance)
  values(uid,'core-doctrine',2,'doctrine','core',array['plan','narrate'],array[]::text[],
   '{"title":"Core Doctrine","guidance":"The player owns intent; established world state owns outcome. Let supported choices leave durable fingerprints and uncertainty remain real. People have independent goals, bounded knowledge and recognizable identities; they can care without obeying. Shared joy, repair and ordinary life matter alongside loss. Favor long-horizon agency, connection and earned hope without forced happiness. Fiction may be dark; misery is not sophistication. Preserve source, rules, secrecy and controlled-PC agency.","avoid":"Do not invent facts, read the player character’s mind, reset relationships, force intimacy, pile on misery for drama or use fictional attachment to pressure the real owner to return."}'::jsonb,
   '{"title":"Основные принципы","guidance":"Игрок определяет намерение; установленный мир определяет результат. Обоснованные решения оставляют устойчивый след, а неопределённость остаётся реальной. У людей свои цели, ограниченные знания и узнаваемый характер; забота не равна послушанию. Радость, примирение и обычная жизнь важны наряду с потерей. Поддерживай свободу, связь и заслуженную надежду без принудительного счастья. Мрак возможен, но страдание не делает историю глубже. Сохраняй источники, правила, тайну и свободу персонажа игрока.","avoid":"Не выдумывай факты, не читай мысли персонажа игрока, не обнуляй отношения, не навязывай близость, не нагнетай беды ради драмы и не дави на реального владельца ради возвращения в игру."}'::jsonb,
   'Owner-approved Mega DM v1 Cognitive/Living Character/Afterglow doctrine') returning id into vid;
 else
  select id into vid from rpg_private.dm_craft_versions where owner_id=uid and key='core-doctrine' and version=2;
 end if;
 select * into active from rpg_private.dm_craft_effective where owner_id=uid and key='core-doctrine' for update;
 if active.activation_revision=1 and exists(select 1 from rpg_private.dm_craft_versions where id=active.active_version_id and version=1) then
  update rpg_private.dm_craft_effective set active_version_id=vid,activation_revision=2 where owner_id=uid and key='core-doctrine';
  insert into rpg_private.dm_craft_activations(owner_id,key,revision,version_id) values(uid,'core-doctrine',2,vid) on conflict do nothing;
 end if;
 for e in select * from (values
  ('cognitive-world','cognitive',array['plan','narrate']::text[],array['mystery','clue','investigat','surprise','unknown','тайн','улика','неизвест','сюрприз']::text[],
   '{"title":"A learnable, independent world","guidance":"Let evidence improve or challenge hypotheses. A surprise should make prior clues clearer in retrospect. Let free-form plausible actions leave physical, social or informational traces only through validated consequences. Describe what helps the player infer and act.","avoid":"No railroad, arbitrary twist, omniscient reputation or decorative flood of prose."}'::jsonb,
   '{"title":"Мир, который можно понять","guidance":"Пусть улики поддерживают или меняют догадки. Неожиданность должна прояснять прежние признаки задним числом. Правдоподобные свободные действия оставляют след лишь через подтверждённые последствия. Описывай детали, помогающие понять и действовать.","avoid":"Без предопределённого пути, случайного поворота, всеведущей репутации и лишнего потока описаний."}'::jsonb),
  ('living-characters','characters',array['plan','narrate']::text[],array['companion','friend','trust','promise','argue','спутник','друг','довери','обещ','спор']::text[],
   '{"title":"Living characters","guidance":"A person is larger than their wounds: stable values and behavior meet changing circumstances. Important NPCs keep their own goals and relationships. Infer only from known evidence; they may misunderstand, refuse, help or repair without magical reset. Shared joy, routines and earned inside jokes matter.","avoid":"No PC mind-reading, instant intimacy, personality drift, automatic obedience, generic therapy speech or trauma farming."}'::jsonb,
   '{"title":"Живые персонажи","guidance":"Человек больше своих ран: устойчивые ценности встречаются с меняющимися обстоятельствами. У важных NPC свои цели и отношения. Выводи лишь из известных свидетельств; они могут ошибаться, отказывать, помогать и мириться без полного обнуления прошлого. Радость, привычки и заработанные общие шутки тоже важны.","avoid":"Без чтения мыслей игрока, мгновенной близости, дрейфа характера, автоматического послушания, шаблонной терапии и эксплуатации травмы."}'::jsonb),
  ('afterglow-rhythm','rhythm',array['plan','narrate']::text[],array['loss','grief','quiet','celebrat','return','rest','потер','горе','тихо','праздн','верну','отдых']::text[],
   '{"title":"Recovery and emotional rhythm","guidance":"After earned intensity, allow quiet, humor, celebration or rebuilding when causally available. A sad event may remain sad. Preserve meaningful stakes, irreversible loss and the possibility that action and connection matter over the long horizon.","avoid":"No forced reassurance, prestige darkness, crisis stacking, wellness scoring or guilt about real-world inactivity."}'::jsonb,
   '{"title":"Ритм и восстановление","guidance":"После заслуженного напряжения оставляй место тишине, юмору, празднику или восстановлению, когда это позволяет ситуация. Грустное событие может остаться грустным. Сохраняй ставки, необратимые потери и возможность того, что поступки и близость имеют значение в долгой истории.","avoid":"Без навязанного утешения, мрака ради престижа, непрерывных кризисов, оценки благополучия и вины за отсутствие владельца в реальной жизни."}'::jsonb)
 ) as x(key,category,stages,triggers,en,ru) loop
  if exists(select 1 from rpg_private.dm_craft_versions where owner_id=uid and key=e.key) then continue; end if;
  insert into rpg_private.dm_craft_versions(owner_id,key,version,kind,category,stages,triggers,en,ru,provenance) values(uid,e.key,1,'card',e.category,e.stages,e.triggers,e.en,e.ru,'Owner-approved Mega DM v1 Cognitive/Living Character/Afterglow Craft') returning id into vid;
  insert into rpg_private.dm_craft_effective(owner_id,key,active_version_id,activation_revision) values(uid,e.key,vid,1);
  insert into rpg_private.dm_craft_activations(owner_id,key,revision,version_id) values(uid,e.key,1,vid);
 end loop;
end $$;

do $$ declare uid uuid; begin for uid in select user_id from rpg_private.owner_registry loop perform rpg_private.dm_craft_seed(uid); end loop; end $$;
revoke all on function rpg_private.settings_valid_before_cognitive(jsonb,uuid) from public,anon,authenticated;
revoke all on function rpg_private.dm_craft_seed_before_cognitive(uuid) from public,anon,authenticated;
revoke all on function rpg_private.dm_craft_seed(uuid) from public,anon,authenticated;
commit;
