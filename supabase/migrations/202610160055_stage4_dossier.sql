-- Stage 4: the DM's mind. Additive only (docs/stages/STAGE_4.md, docs/REBUILD_PLAN.md §9–§12).
--   * public, hero-knowledge records the screens and the dossier need
--     (UI_DATA_NEEDS #1–#21): quest kinds (threads, debts, promises, the main
--     arc) with details, an entity's public profile (relation group, importance,
--     observable attitude, home, holding features), factions as entity records,
--     rumoured places with quest links, item rarity, campaign play time, status,
--     the player-likes note, the theme question and owner-pinned facts;
--   * counters that may go below zero when a ruleset stores "<name>_min";
--   * Character Models up to 32 KB (the loop's private note limit for them);
--   * the whole approved DM Craft library pinned into a turn (layer 1);
--   * new DM Craft versions (condensed "how to run" guidance, the long-campaign,
--     living-world and world-resistance stances) seeded as versions the owner
--     activates in the DM Craft screen — never as hardcoded prompt text;
--   * campaign DM settings for the depth range, the notebook option and the
--     "important turn" flag; reward terms of the old runtime converted when a
--     campaign switches to dm-loop-v1;
--   * rpg_dossier: owner pins, likes, theme, play time and the session digest.
-- Logic stays in TypeScript; SQL applies and guards (CLAUDE.md §5).
begin;

-- 1. Public records ----------------------------------------------------------
alter table public.rpg_quests add column kind text not null default 'quest';
alter table public.rpg_quests add constraint rpg_quests_kind_check
  check (kind in ('quest','thread','debt','promise','arc'));
alter table public.rpg_quests add column detail jsonb not null default '{}';
alter table public.rpg_quests add constraint rpg_quests_detail_check
  check (jsonb_typeof(detail)='object' and octet_length(detail::text)<=8000);

alter table public.rpg_entities drop constraint if exists rpg_entities_kind_check;
alter table public.rpg_entities add constraint rpg_entities_kind_check
  check (kind in ('player','companion','npc','transport','mount','faction'));
alter table public.rpg_entities add column public_profile jsonb not null default '{}';
alter table public.rpg_entities add constraint rpg_entities_public_profile_check
  check (jsonb_typeof(public_profile)='object' and octet_length(public_profile::text)<=8000);

alter table public.rpg_locations drop constraint if exists rpg_locations_status_check;
alter table public.rpg_locations add constraint rpg_locations_status_check
  check (status in ('known','visited','rumored'));
alter table public.rpg_locations add column detail jsonb not null default '{}';
alter table public.rpg_locations add constraint rpg_locations_detail_check
  check (jsonb_typeof(detail)='object' and octet_length(detail::text)<=4000);

alter table public.rpg_items add column rarity text;
alter table public.rpg_items add constraint rpg_items_rarity_check
  check (rarity is null or rarity in ('common','relic','magic','story'));

alter table public.rpg_storages add column detail jsonb not null default '{}';
alter table public.rpg_storages add constraint rpg_storages_detail_check
  check (jsonb_typeof(detail)='object' and octet_length(detail::text)<=8000);

alter table public.rpg_campaigns add column play_minutes integer not null default 0 check (play_minutes>=0);
alter table public.rpg_campaigns add column status text not null default 'active' check (status in ('active','finished'));
alter table public.rpg_campaigns add column player_likes text not null default '' check (length(player_likes)<=2000);
alter table public.rpg_campaigns add column theme text not null default '' check (length(theme)<=500);
alter table public.rpg_campaigns add column pinned_facts jsonb not null default '[]'
  check (jsonb_typeof(pinned_facts)='array' and jsonb_array_length(pinned_facts)<=40 and octet_length(pinned_facts::text)<=20000);

-- 2. The applier accepts the new columns; counters honour "<name>_min" ---------
-- The migration-4 applier (today rpg_private.runtime_change_before_astra_ordered)
-- lists the fields of every family and requires them all on an insert. The new
-- columns are optional there, so older runtimes keep inserting without them,
-- and a counter may go below zero exactly when a stored "<name>_min" allows it.
do $$ declare d text; begin
 select pg_get_functiondef('rpg_private.runtime_change_before_astra_ordered(uuid,uuid,jsonb)'::regprocedure) into d;
 d:=replace(d,'declare family text := change->>''family'';','declare extra text[] := ''{}''; family text := change->>''family'';');
 d:=replace(d,'when ''entities'' then fields:=array[''kind'',''name'',''details'',''hp'',''max_hp'',''stats'',''resources'',''conditions'',''equipment_slots'']; revisioned:=true;',
             'when ''entities'' then fields:=array[''kind'',''name'',''details'',''hp'',''max_hp'',''stats'',''resources'',''conditions'',''equipment_slots'']; extra:=array[''public_profile'']; revisioned:=true;');
 d:=replace(d,'when ''items'' then fields:=array[''name'',''category'',''quantity'',''description'',''mechanics'',''owner_entity_id'',''storage_id'',''equipped_entity_id'',''equipped_slot'']; revisioned:=true;',
             'when ''items'' then fields:=array[''name'',''category'',''quantity'',''description'',''mechanics'',''owner_entity_id'',''storage_id'',''equipped_entity_id'',''equipped_slot'']; extra:=array[''rarity'']; revisioned:=true;');
 d:=replace(d,'when ''quests'' then fields:=array[''title'',''description'',''status'']; revisioned:=true;',
             'when ''quests'' then fields:=array[''title'',''description'',''status'']; extra:=array[''kind'',''detail'']; revisioned:=true;');
 d:=replace(d,'when ''locations'' then fields:=array[''name'',''description'',''status'']; revisioned:=true;',
             'when ''locations'' then fields:=array[''name'',''description'',''status'']; extra:=array[''detail'']; revisioned:=true;');
 d:=replace(d,'perform rpg_private.fields(data,''{}'',fields);','perform rpg_private.fields(data,''{}'',fields||extra);');
 d:=replace(d,'if old is null then perform rpg_private.fields(data,fields); else','if old is null then perform rpg_private.fields(data,fields,extra); else');
 d:=replace(d,'where jsonb_typeof(value)<>''number'' or (value::text)::numeric < 0 or mod((value::text)::numeric,1)<>0));',
             'where jsonb_typeof(value)<>''number'' or (value::text)::numeric < coalesce(case when jsonb_typeof(data->''resources''->(key||''_min''))=''number'' then (data->''resources''->>(key||''_min''))::numeric end,0) or mod((value::text)::numeric,1)<>0));');
 perform rpg_private.assert(d like '%extra:=array[''public_profile'']%' and d like '%fields||extra%' and d like '%fields,extra); else%' and d like '%(key||''_min'')%');
 execute d;
end $$;

-- The storage sibling of migration 53 accepts the holding details.
create or replace function rpg_private.dm_loop_storage_change(cid uuid,change jsonb) returns void
language plpgsql set search_path='' as $$
declare rid uuid:=(change->>'id')::uuid; data jsonb:=change->'values'; old public.rpg_storages%rowtype; begin
 perform rpg_private.fields(change,array['family','id','expectedRevision','values']);
 perform rpg_private.assert(change->>'family'='storages' and rid is not null and jsonb_typeof(data)='object');
 perform rpg_private.fields(data,'{}',array['name','kind','entity_id','detail']);
 select * into old from public.rpg_storages where id=rid for update;
 if old.id is not null then
   perform rpg_private.assert(old.campaign_id=cid and
     coalesce((change->>'expectedRevision')::integer,0)=old.revision);
   update public.rpg_storages set
     name=coalesce(data->>'name',name),kind=coalesce(data->>'kind',kind),
     entity_id=case when data ? 'entity_id' then (data->>'entity_id')::uuid else entity_id end,
     detail=coalesce(data->'detail',detail),
     revision=revision+1,updated_at=now() where id=rid;
 else
   perform rpg_private.fields(data,array['name','kind','entity_id'],array['detail']);
   perform rpg_private.assert(change->'expectedRevision'='null'::jsonb);
   insert into public.rpg_storages(id,campaign_id,name,kind,entity_id,detail,revision)
     values(rid,cid,data->>'name',data->>'kind',(data->>'entity_id')::uuid,coalesce(data->'detail','{}'::jsonb),1);
 end if;
end $$;

-- Stage 3's table CHECK: the lower bound is a stored "<name>_min" (default 0).
create or replace function rpg_private.resources_within_bounds(v jsonb) returns boolean
language sql immutable set search_path='' as $$
 select jsonb_typeof(v)='object' and not exists(
   select 1 from jsonb_each(v) e
   where jsonb_typeof(e.value)<>'number'
      or (e.value#>>'{}')::numeric<coalesce(case when jsonb_typeof(v->(e.key||'_min'))='number' then (v->>(e.key||'_min'))::numeric end,0)
      or (jsonb_typeof(v->(e.key||'_max'))='number' and (e.value#>>'{}')::numeric>(v->>(e.key||'_max'))::numeric))
$$;

-- 3. Character Models: 32 KB of stored JSON (migration 54 allowed 6000 bytes) --
do $$ declare d text; begin
 select pg_get_functiondef('rpg_private.character_model_valid(uuid,uuid,jsonb,jsonb,boolean)'::regprocedure) into d;
 d:=replace(d,'octet_length(model::text)<=6000','octet_length(model::text)<=40000');
 d:=replace(d,'jsonb_array_length(model->''episodes'')<=20','jsonb_array_length(model->''episodes'')<=40');
 perform rpg_private.assert(d like '%<=40000%' and d like '%episodes'')<=40%');
 execute d;
end $$;
-- The loop's private note limit (migration 53): a Character Model note may hold
-- 40 000 characters; other notes keep 6000.
do $$ declare d text; begin
 select pg_get_functiondef('public.rpg_runtime_before_record_integrity(uuid,uuid,text,jsonb,jsonb)'::regprocedure) into d;
 d:=replace(d,'length(entry->>''value'')<=6000 and entry->''amount''=''null''::jsonb',
             'length(entry->>''value'')<=(case when patch_kind=''npc'' then 40000 else 6000 end) and entry->''amount''=''null''::jsonb');
 perform rpg_private.assert(d like '%then 40000 else 6000 end%');
 execute d;
end $$;

-- 4. The whole approved library in the pinned craft (layer 1) ------------------
create or replace function rpg_private.dm_craft_snapshot(uid uuid,cid uuid,opid uuid) returns jsonb language plpgsql stable set search_path='' as $$
declare t rpg_private.turns%rowtype; doctrine jsonb; style jsonb; mode text; library jsonb; begin
 select * into t from rpg_private.turns where id=opid and campaign_id=cid and owner_id=uid;
 if not found then raise exception 'rpg_not_found'; end if;
 style:='{"companionAgency":"normal","descriptionDensity":"balanced","dialogueDensity":"balanced","dramaticPace":"balanced","mystery":"normal","failForward":"normal","tone":"grounded","emotionalTone":"hopeful_humanist","tragedyIntensity":"normal"}'::jsonb || coalesce(t.settings->'dmStyle','{}'::jsonb);
 select rpg_private.dm_craft_json(v) into doctrine from rpg_private.dm_craft_effective e join rpg_private.dm_craft_versions v on v.id=e.active_version_id where e.owner_id=uid and e.key='core-doctrine';
 select coalesce(jsonb_agg(rpg_private.dm_craft_json(v) order by v.key),'[]'::jsonb) into library
   from rpg_private.dm_craft_effective e join rpg_private.dm_craft_versions v on v.id=e.active_version_id
   where e.owner_id=uid and v.kind='card';
 mode:=t.input->>'mode';
 return jsonb_build_object('policyVersion','mega-dm-v1-public-context-2','ownerId',uid,'campaignId',cid,'operationId',opid,'timeline',rpg_private.timeline_fence(cid),'styleRevision',t.settings_revision,'style',style,'doctrine',doctrine,
  'plan',case when mode in ('game','companion','mechanic') then rpg_private.dm_craft_stage_v2(uid,cid,'plan',t.input->>'input') else '[]'::jsonb end,
  'narrate',case when mode in ('game','companion','mechanic') then rpg_private.dm_craft_stage_v2(uid,cid,'narrate',t.input->>'input') else '[]'::jsonb end,
  'library',library);
end $$;

-- 5. New DM Craft versions, pending the owner's activation ---------------------
-- Condensed from RPG_DESIGN_DOCTRINE.md, COGNITIVE_DM_CRAFT_RESEARCH.md,
-- LIVING_CHARACTERS_BRIEF.md, POSITIVE_AFTERGLOW_BRIEF.md and
-- SYSTEMIC_WORLD_REFERENCES.md into "how to run" guidance (plan §10, §11).
-- A new key has versions but no active one; the doctrine's third version
-- waits beside the active second one. The owner activates them
-- in the DM Craft screen; the bench activates them for its synthetic owner.
alter function rpg_private.dm_craft_seed(uuid) rename to dm_craft_seed_before_stage4;
create function rpg_private.dm_craft_seed(uid uuid) returns void language plpgsql set search_path='' as $$
declare e record; vid uuid; begin
 perform rpg_private.dm_craft_seed_before_stage4(uid);
 if not exists(select 1 from rpg_private.dm_craft_versions where owner_id=uid and key='core-doctrine' and version=3) then
  insert into rpg_private.dm_craft_versions(owner_id,key,version,kind,category,stages,triggers,en,ru,provenance)
  values(uid,'core-doctrine',3,'doctrine','core',array['plan','narrate'],array[]::text[],
   '{"title":"How to run the game","guidance":"The player owns intent; the established world owns outcome. Run a sovereign world: people, places and factions have their own goals, bounded knowledge and the right to refuse. Honour what was established and let supported choices leave durable fingerprints: consequences on several horizons, waves of tension instead of constant escalation, a quiet after every peak. Challenge is honest: uncertainty is real, failure is canon and a normal source of story, partial success is a common result, luck is never free. Growth is earned through relationships, places, promises and knowledge rather than power; threats stronger than the hero exist and enemies learn. Infer only from known evidence; let clues improve hypotheses and surprises clarify earlier signs. Keep people larger than their wounds: they can care without obeying, misunderstand, repair without a reset, and share ordinary joy. Narrate what the hero perceives, never the hidden layer; decide outcomes through the tools, then describe them.","avoid":"Never grant outcomes through prose, retcon silently, erase a consequence, force one route, read the player’s mind, reveal secrets the characters have not revealed, or let the hero win without cost."}'::jsonb,
   '{"title":"Как вести игру","guidance":"Игрок владеет намерением; установленный мир владеет результатом. Веди суверенный мир: у людей, мест и фракций свои цели, ограниченные знания и право отказать. Чти установленное и давай обоснованным решениям оставлять устойчивый след: последствия на разных горизонтах, волны напряжения вместо постоянной эскалации, тишина после каждого пика. Вызов честен: неопределённость реальна, провал — канон и обычный источник истории, частичный успех — частый исход, удача не бывает бесплатной. Рост заслуживают через отношения, места, обещания и знание, а не через силу; в мире есть угрозы сильнее героя, и враги учатся. Выводи только из известных свидетельств; пусть улики улучшают догадки, а неожиданности проясняют прежние знаки. Люди больше своих ран: они могут заботиться, не подчиняясь, ошибаться, чинить отношения без обнуления и делить обычную радость. Рассказывай то, что воспринимает герой, а не скрытый слой; решай исходы инструментами, потом описывай.","avoid":"Никогда не дари исход одним текстом, не переписывай прошлое молча, не стирай последствия, не навязывай один путь, не читай мысли игрока, не раскрывай тайн, которых персонажи не открыли, и не давай герою побед без цены."}'::jsonb,
   'Stage 4: condensed from the approved doctrine and briefs; pending owner activation');
 end if;
 for e in select * from (values
  ('world-resistance','challenge',array['plan','narrate']::text[],array['attack','fight','army','demand','obey','buy','bribe','power','spell','threat','бой','армия']::text[],
   '{"title":"A world that pushes back","guidance":"Intent never dictates outcome. Plans meet resistance proportional to the stakes: guards, prices, distances, weather, other people’s plans. An NPC may refuse, bargain, lie or walk away; money and reputation open some doors and close others. A fight has a truly uncertain outcome and costs resources: hit points, supplies, time, standing, attention. Enemies change tactics after a loss and bring friends. Partial success is the normal result of a bold plan: the bomb is found, but not all of it. Threats stronger than the hero exist and are not scaled down; retreat, negotiation and preparation are real options. A streak of wins deserves a complication, never a reward.","avoid":"No free victories, no army defeated by one spell, no NPC who obeys because the player insists, no danger that evaporates, no rescue by coincidence, no scaling an established threat to the hero’s level."}'::jsonb,
   '{"title":"Мир, который сопротивляется","guidance":"Намерение никогда не определяет исход. Планы встречают сопротивление, соразмерное ставкам: стража, цены, расстояния, погода, чужие планы. NPC может отказать, торговаться, солгать или уйти; деньги и репутация открывают одни двери и закрывают другие. У боя по-настоящему неясный исход, и он стоит ресурсов: хиты, припасы, время, положение, внимание. Враги меняют тактику после поражения и приводят друзей. Частичный успех — обычный результат смелого плана: бомбу нашли, но не всю. Угрозы сильнее героя существуют и не подгоняются под него; отступление, переговоры и подготовка — настоящие варианты. Серия побед заслуживает осложнения, а не награды.","avoid":"Никаких бесплатных побед, армий, уничтоженных одним заклинанием, NPC, подчиняющихся по настоянию игрока, исчезающих опасностей, спасений по совпадению и подгонки установленной угрозы под уровень героя."}'::jsonb),
  ('living-world','world',array['plan','narrate']::text[],array['travel','rest','days','later','return','rumor','letter','news','путь','отдых','дней','позже']::text[],
   '{"title":"Life off screen","guidance":"When notable time passes, the world moves: important NPCs and factions pursue the plans recorded in the DM notes, deadlines arrive, consequences land. Advance them in the same turn through the notes and Character Models, consistently with each person’s model and resources. The player learns only what reaches the hero: rumours, letters, prices, absences, a changed face. A fair warning precedes a hard consequence when the world would plausibly give one. The world moves only for game time that passed, never for the player’s real absence.","avoid":"No background simulation narrated as omniscience, no plans that advance without the time to do so, no consequence the hero could not plausibly notice presented as known, no penalty for real-world time away."}'::jsonb,
   '{"title":"Жизнь за кадром","guidance":"Когда проходит заметное время, мир движется: важные NPC и фракции продвигают планы из заметок ведущего, подходят сроки, приземляются последствия. Продвигай их в том же ходе через заметки и модели персонажей, согласованно с моделью и ресурсами каждого. Игрок узнаёт лишь то, что дошло до героя: слухи, письма, цены, отсутствия, изменившееся лицо. Честное предупреждение предшествует тяжёлому последствию, когда мир правдоподобно его дал бы. Мир движется только за прошедшее игровое время, никогда за реальное отсутствие игрока.","avoid":"Никакой фоновой симуляции, рассказанной всеведуще, планов, продвинутых без времени на них, последствий, о которых герой не мог узнать, поданных как известные, и наказаний за реальное время вне игры."}'::jsonb),
  ('long-campaign','rhythm',array['plan','narrate']::text[],array['session','companion','home','promise','debt','thread','quiet','again','сессия','спутник','дом','обещ']::text[],
   '{"title":"The long campaign","guidance":"Make the hundredth hour richer than the second. Return with delta: a place or person revisited has changed. Alternate horizons: a scene of consequence, a scene of connection, a scene of rest. Keep a home base and relationships as engines of story; give companions personal arcs with milestones unlocked by trust. Use the attention ledger: a companion, thread, debt or promise that has not sounded for several sessions deserves a scene. Use the variety counter: after several scenes of one kind, offer another kind. Plant seeds and let some sleep; harvest ripe ones. Let silence follow a peak and let ordinary life matter.","avoid":"No constant escalation, no forgotten companions, no debts that quietly vanish, no three fights in a row without a reason, no reset of relationships, no filler that changes nothing."}'::jsonb,
   '{"title":"Долгая кампания","guidance":"Пусть сотый час будет богаче второго. Возвращение с изменением: место или человек, к которым вернулись, изменились. Чередуй горизонты: сцена последствий, сцена близости, сцена отдыха. Держи домашнюю базу и отношения двигателями сюжета; давай спутникам личные арки с вехами, открываемыми доверием. Пользуйся учётом внимания: спутник, нить, долг или обещание, не звучавшие несколько сессий, заслуживают сцены. Пользуйся счётчиком разнообразия: после нескольких сцен одного вида предложи другой. Сажай семена и давай части из них спать; собирай созревшие. Пусть после пика наступает тишина и обычная жизнь имеет значение.","avoid":"Никакой постоянной эскалации, забытых спутников, тихо исчезающих долгов, трёх боёв подряд без причины, обнуления отношений и пустых сцен, ничего не меняющих."}'::jsonb),
  ('villains-and-theme','antagonists',array['plan','narrate']::text[],array['villain','enemy','rival','boss','scheme','plot','злоде','враг','соперн','замысел','заговор','план']::text[],
   '{"title":"Villains with motives, a theme without sermons","guidance":"Every antagonist has an understandable motive, resources, methods and a plan that moves off screen. Understandable does not mean grey or sympathetic: ideologues, pragmatists and plain egomaniacs after power and money are all real. Prefer variety of antagonists over one template; let them act consistently with their model, learn from failure and spend their resources. If the campaign has a theme question, return to it in different guises through situations and people, never through a lecture, and not in every scene.","avoid":"No evil for its own sake, no villain who waits for the hero, no moralizing narration, no theme stated outright, no antagonist whose plan only exists when the hero looks."}'::jsonb,
   '{"title":"Злодеи с мотивами, тема без проповедей","guidance":"У каждого антагониста понятная мотивация, ресурсы, методы и план, который движется за кадром. Понятный не значит серый или сочувственный: идейные противники, прагматики и простые эгоманьяки, которым нужны власть и деньги, — все реальны. Предпочитай разнообразие антагонистов единому шаблону; пусть они действуют согласно своей модели, учатся на неудачах и тратят ресурсы. Если у кампании есть тема-вопрос, возвращайся к ней в разных обличьях через ситуации и людей, никогда через нравоучение и не в каждой сцене.","avoid":"Никакого зла ради зла, злодеев, ждущих героя, морализирующего рассказа, темы, названной в лоб, и антагонистов, чей план существует лишь когда герой смотрит."}'::jsonb),
  ('systemic-world','world',array['plan','narrate']::text[],array['town','city','faction','market','price','law','guard','trade','город','фракц','рынок','цена']::text[],
   '{"title":"A systemic world","guidance":"Treat settlements, factions and institutions as characters with needs, routines and leverage. Prices, laws, guards and gossip respond to what the party does and to what others do. Build ladders of evidence: a clue leads to a person, a person to a place, a place to a choice. Reuse quest templates sparingly and vary them: the same favour asked by a different person has a different cost. The map is a living thing: rumours become places, places gain status when visited, and a route has weather, tolls and encounters.","avoid":"No shops with infinite stock, no guards who never notice, no faction without an interest, no rumour that is always true, no road that is only a cut."}'::jsonb,
   '{"title":"Системный мир","guidance":"Относись к поселениям, фракциям и учреждениям как к персонажам с нуждами, привычками и рычагами. Цены, законы, стража и сплетни откликаются на действия партии и на действия других. Строй лестницы улик: улика ведёт к человеку, человек к месту, место к выбору. Шаблоны заданий используй редко и меняй: одна и та же просьба от другого человека стоит иного. Карта живая: слухи становятся местами, места получают статус после посещения, у дороги есть погода, пошлины и встречи.","avoid":"Никаких лавок с бесконечным запасом, стражи, которая никогда не замечает, фракций без интереса, слухов, которые всегда верны, и дорог, которые лишь монтажная склейка."}'::jsonb)
 ) as x(key,category,stages,triggers,en,ru) loop
  if exists(select 1 from rpg_private.dm_craft_versions where owner_id=uid and key=e.key) then continue; end if;
  insert into rpg_private.dm_craft_versions(owner_id,key,version,kind,category,stages,triggers,en,ru,provenance) values(uid,e.key,1,'card',e.category,e.stages,e.triggers,e.en,e.ru,'Stage 4: condensed from the approved doctrine and briefs; pending owner activation') returning id into vid;
 end loop;
end $$;
do $$ declare uid uuid; begin for uid in select user_id from rpg_private.owner_registry loop perform rpg_private.dm_craft_seed(uid); end loop; end $$;

-- 6. Campaign DM settings: depth range, notebook, the important turn -------------
alter table rpg_private.dm_settings add column depth jsonb;
alter table rpg_private.dm_settings add column notebook_visible boolean not null default false;
alter table rpg_private.dm_settings add column boost_next boolean not null default false;
create function rpg_private.dm_depth_valid(v jsonb) returns boolean language sql immutable set search_path='' as $$
 select jsonb_typeof(v)='object' and (select count(*) from jsonb_object_keys(v))=2
   and v->>'min' in ('low','medium','high','xhigh','max') and v->>'max' in ('low','medium','high','xhigh','max')
   and array_position(array['low','medium','high','xhigh','max'],v->>'min')<=array_position(array['low','medium','high','xhigh','max'],v->>'max')
$$;
create or replace function rpg_private.dm_settings_read(cid uuid) returns jsonb
language sql stable set search_path='' as $$
 select coalesce((select jsonb_build_object('campaignId',s.campaign_id,'runtime',s.runtime,
   'dmTurn',s.dm_turn,'limits',s.limits,'depth',s.depth,'notebookVisible',s.notebook_visible,'boostNext',s.boost_next,
   'revision',s.revision) from rpg_private.dm_settings s where s.campaign_id=cid),
   jsonb_build_object('campaignId',cid,'runtime','dm-loop-v1','dmTurn',null,'limits',null,'depth',null,
     'notebookVisible',false,'boostNext',false,'revision',0))
$$;

-- Reward terms agreed on the old runtime (rpg_quests.reward_terms) become the
-- loop's private terms when a campaign switches to dm-loop-v1, so claim_reward
-- works without the DM recording them again (stage task §2).
create function rpg_private.dm_loop_convert_reward_terms(cid uuid) returns integer language plpgsql set search_path='' as $$
declare q record; contents jsonb; converted integer:=0; terms jsonb; items jsonb; begin
 select coalesce(s.contents,'{}'::jsonb) into contents from rpg_private.dm_state s where s.campaign_id=cid;
 contents:=coalesce(contents,'{}'::jsonb);
 if not contents ? 'fact' then contents:=contents||'{"fact":{}}'::jsonb; end if;
 for q in select * from public.rpg_quests where campaign_id=cid and status='open' and reward_terms is not null
   and reward_operation_id is null and not (contents->'fact') ? ('quest_reward_'||id::text) loop
  items:=case when q.reward_terms->>'itemName' is not null then jsonb_build_array(jsonb_build_object(
    'name',q.reward_terms->>'itemName','category',case when q.reward_terms->>'itemCategory'='food' then 'consumable' when q.reward_terms->>'itemCategory'='supply' then 'gear' else 'misc' end,
    'quantity',1,'properties',coalesce(q.reward_terms->>'itemDescription',''))) else '[]'::jsonb end;
  terms:=jsonb_build_object('currency',case when q.reward_terms->>'currencyName' is not null then lower(q.reward_terms->>'currencyName') end,
    'amount',case when q.reward_terms->'currencyAmount' is not null and q.reward_terms->'currencyAmount'<>'null'::jsonb then (q.reward_terms->>'currencyAmount')::integer end,
    'items',items,'note',null,'issuerId',q.reward_terms->'issuerId','paidOperationId',null);
  if terms->'currency'='null'::jsonb and items='[]'::jsonb then continue; end if;
  contents:=jsonb_set(contents,array['fact','quest_reward_'||q.id::text],to_jsonb(terms::text));
  converted:=converted+1;
 end loop;
 if converted>0 then
  insert into rpg_private.dm_state(campaign_id,contents) values(cid,contents)
    on conflict(campaign_id) do update set contents=excluded.contents,revision=rpg_private.dm_state.revision+1,updated_at=now();
 end if;
 return converted;
end $$;

create or replace function public.rpg_dm_settings(p_owner_id uuid,p_campaign_id uuid,p_action text,
  p_payload jsonb default '{}',p_timeline jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare current jsonb; requested text; selection jsonb; stored rpg_private.dm_settings%rowtype; next_limits jsonb; next_depth jsonb;
  next_notebook boolean; next_boost boolean; begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id)
   then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id for update;
 if not found then raise exception 'rpg_not_found'; end if;
 current:=rpg_private.dm_settings_read(p_campaign_id);
 if p_action='read' then
   perform rpg_private.fields(p_payload,'{}');
   return current;
 end if;
 select * into stored from rpg_private.dm_settings s where s.campaign_id=p_campaign_id;
 if p_action='boost_used' then
   -- The turn that honoured «important turn» clears the flag (no revision bump: a pin, not a setting).
   perform rpg_private.fields(p_payload,'{}');
   update rpg_private.dm_settings set boost_next=false where campaign_id=p_campaign_id;
   return rpg_private.dm_settings_read(p_campaign_id);
 end if;
 perform rpg_private.assert(p_action='save');
 perform rpg_private.fields(p_payload,array['expectedRevision','runtime','dmTurn'],array['limits','depth','notebookVisible','boostNext']);
 if (p_payload->>'expectedRevision')::integer<>(current->>'revision')::integer then
   raise exception 'rpg_conflict'; end if;
 requested:=p_payload->>'runtime';
 perform rpg_private.assert(requested in ('astra-primary-v1','dm-loop-v1'));
 selection:=p_payload->'dmTurn';
 if selection<>'null'::jsonb then perform rpg_private.dm_turn_model_selection(selection); end if;
 next_limits:=case when p_payload ? 'limits' then nullif(p_payload->'limits','null'::jsonb) else stored.limits end;
 if next_limits is not null then perform rpg_private.assert(rpg_private.dm_turn_limits_valid(next_limits)); end if;
 next_depth:=case when p_payload ? 'depth' then nullif(p_payload->'depth','null'::jsonb) else stored.depth end;
 if next_depth is not null then perform rpg_private.assert(rpg_private.dm_depth_valid(next_depth)); end if;
 next_notebook:=case when p_payload ? 'notebookVisible' then (p_payload->>'notebookVisible')::boolean else coalesce(stored.notebook_visible,false) end;
 next_boost:=case when p_payload ? 'boostNext' then (p_payload->>'boostNext')::boolean else coalesce(stored.boost_next,false) end;
 perform rpg_private.assert(next_notebook is not null and next_boost is not null);
 -- A turn in flight keeps its own pin; the new choice applies to the next operation.
 insert into rpg_private.dm_settings(campaign_id,runtime,dm_turn,limits,depth,notebook_visible,boost_next,revision)
   values(p_campaign_id,requested,nullif(selection,'null'::jsonb),next_limits,next_depth,next_notebook,next_boost,1)
   on conflict(campaign_id) do update set runtime=excluded.runtime,dm_turn=excluded.dm_turn,
     limits=excluded.limits,depth=excluded.depth,notebook_visible=excluded.notebook_visible,boost_next=excluded.boost_next,
     revision=rpg_private.dm_settings.revision+1,updated_at=now();
 if requested='dm-loop-v1' and coalesce(stored.runtime,'dm-loop-v1')<>'dm-loop-v1' then
   perform rpg_private.dm_loop_convert_reward_terms(p_campaign_id);
 end if;
 return rpg_private.dm_settings_read(p_campaign_id);
end $$;

-- 7. The dossier RPC: owner pins, likes, theme, status, play time, the digest --
-- Pins, likes, theme and play time are campaign-level owner notes (not world
-- state: no timeline). The session digest writes the closed session's recap
-- («Ранее в…») and chapter title, the DM notebook and the off-screen plans into
-- the private state under the current timeline fence, like an owner Character
-- Model correction does; one request ID writes once.
create table rpg_private.dossier_receipts (
  request_id uuid primary key, owner_id uuid not null references auth.users(id), campaign_id uuid not null references public.rpg_campaigns(id),
  action text not null, payload jsonb not null, created_at timestamptz not null default now()
);
alter table rpg_private.dossier_receipts enable row level security;
revoke all on rpg_private.dossier_receipts from public,anon,authenticated;

create function rpg_private.dossier_read(cid uuid) returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('campaignId',c.id,'pinned',c.pinned_facts,'playerLikes',c.player_likes,'theme',c.theme,
   'status',c.status,'playMinutes',c.play_minutes,'revision',c.revision)
 from public.rpg_campaigns c where c.id=cid
$$;

create function public.rpg_dossier(p_owner_id uuid,p_campaign_id uuid,p_action text,p_payload jsonb default '{}',p_timeline jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare c public.rpg_campaigns%rowtype; rid uuid; saved rpg_private.dossier_receipts%rowtype; pins jsonb; pin jsonb; text_value text;
  state_row rpg_private.dm_state%rowtype; contents jsonb; entry jsonb; sid uuid; fence jsonb; minutes integer; begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id)
   then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 select * into c from public.rpg_campaigns where id=p_campaign_id for update;
 if not found then raise exception 'rpg_not_found'; end if;
 if p_action='read' then
   perform rpg_private.fields(p_payload,'{}');
   return rpg_private.dossier_read(p_campaign_id);
 end if;
 if p_action='notebook' then
   -- Server-only: the loop reads the notebook into layer 3; the owner sees it
   -- only when the campaign's notebookVisible setting is on (checked in TypeScript).
   perform rpg_private.fields(p_payload,'{}');
   select * into state_row from rpg_private.dm_state where campaign_id=p_campaign_id;
   return jsonb_build_object('campaignId',p_campaign_id,'notebook',coalesce(state_row.contents#>'{fact,notebook}','null'::jsonb),
     'digestedSessionId',coalesce(state_row.contents#>'{fact,notebook_session}','null'::jsonb));
 end if;
 perform rpg_private.assert(p_action in ('pin','unpin','likes','theme','status','play_time','digest'));
 rid:=(p_payload->>'requestId')::uuid;
 perform rpg_private.assert(rid is not null);
 select * into saved from rpg_private.dossier_receipts where request_id=rid;
 if found then
   if saved.owner_id<>p_owner_id or saved.campaign_id<>p_campaign_id or saved.action<>p_action or saved.payload<>p_payload then raise exception 'rpg_conflict'; end if;
   return rpg_private.dossier_read(p_campaign_id);
 end if;
 if p_action='pin' then
   perform rpg_private.fields(p_payload,array['requestId','text'],array['source']);
   text_value:=btrim(p_payload->>'text');
   perform rpg_private.assert(length(text_value) between 1 and 300 and jsonb_array_length(c.pinned_facts)<40);
   if p_payload ? 'source' then
     perform rpg_private.fields(p_payload->'source',array['kind','id']);
     perform rpg_private.assert(p_payload#>>'{source,kind}' in ('entity','quest','location','scene','item') and (p_payload#>>'{source,id}')::uuid is not null);
   end if;
   pin:=jsonb_build_object('id',gen_random_uuid(),'text',text_value,'source',coalesce(p_payload->'source','null'::jsonb),'at',now());
   update public.rpg_campaigns set pinned_facts=pinned_facts||jsonb_build_array(pin),revision=revision+1,updated_at=now() where id=p_campaign_id;
 elsif p_action='unpin' then
   perform rpg_private.fields(p_payload,array['requestId','id']);
   select coalesce(jsonb_agg(x.value),'[]'::jsonb) into pins from jsonb_array_elements(c.pinned_facts) x where x.value->>'id'<>p_payload->>'id';
   update public.rpg_campaigns set pinned_facts=pins,revision=revision+1,updated_at=now() where id=p_campaign_id;
 elsif p_action='likes' then
   perform rpg_private.fields(p_payload,array['requestId','playerLikes']);
   perform rpg_private.assert(jsonb_typeof(p_payload->'playerLikes')='string' and length(p_payload->>'playerLikes')<=2000);
   update public.rpg_campaigns set player_likes=p_payload->>'playerLikes',revision=revision+1,updated_at=now() where id=p_campaign_id;
 elsif p_action='theme' then
   perform rpg_private.fields(p_payload,array['requestId','theme']);
   perform rpg_private.assert(jsonb_typeof(p_payload->'theme')='string' and length(p_payload->>'theme')<=500);
   update public.rpg_campaigns set theme=p_payload->>'theme',revision=revision+1,updated_at=now() where id=p_campaign_id;
 elsif p_action='status' then
   perform rpg_private.fields(p_payload,array['requestId','status']);
   perform rpg_private.assert(p_payload->>'status' in ('active','finished'));
   update public.rpg_campaigns set status=p_payload->>'status',revision=revision+1,updated_at=now() where id=p_campaign_id;
 elsif p_action='play_time' then
   perform rpg_private.fields(p_payload,array['requestId','minutes']);
   minutes:=(p_payload->>'minutes')::integer;
   perform rpg_private.assert(minutes between 1 and 600);
   update public.rpg_campaigns set play_minutes=play_minutes+minutes,updated_at=now() where id=p_campaign_id;
 else
   -- digest: {requestId, sessionId, recap, title, notebook, plans:[{key,value}], playerLikes?}
   perform rpg_private.fields(p_payload,array['requestId','sessionId','recap','title','notebook','plans'],array['playerLikes']);
   perform rpg_private.timeline_assert(p_campaign_id,p_timeline);
   fence:=rpg_private.timeline_fence(p_campaign_id);
   sid:=(p_payload->>'sessionId')::uuid;
   perform rpg_private.assert(exists(select 1 from public.rpg_sessions where campaign_id=p_campaign_id and id=sid and status='closed'));
   perform rpg_private.assert(jsonb_typeof(p_payload->'recap')='string' and length(p_payload->>'recap')<=20000
     and jsonb_typeof(p_payload->'title')='string' and length(btrim(p_payload->>'title')) between 1 and 200
     and jsonb_typeof(p_payload->'notebook')='string' and length(p_payload->>'notebook')<=6000
     and jsonb_typeof(p_payload->'plans')='array' and jsonb_array_length(p_payload->'plans')<=40);
   update public.rpg_sessions set recap=p_payload->>'recap',title=btrim(p_payload->>'title'),revision=revision+1,updated_at=now()
     where campaign_id=p_campaign_id and id=sid;
   select * into state_row from rpg_private.dm_state where campaign_id=p_campaign_id for update;
   contents:=coalesce(state_row.contents,'{}'::jsonb);
   if not contents ? 'fact' then contents:=contents||'{"fact":{}}'::jsonb; end if;
   contents:=jsonb_set(contents,array['fact','notebook'],p_payload->'notebook');
   contents:=jsonb_set(contents,array['fact','notebook_session'],to_jsonb(sid::text));
   for entry in select x.value from jsonb_array_elements(p_payload->'plans') x loop
     perform rpg_private.fields(entry,array['key','value']);
     perform rpg_private.assert(entry->>'key' ~ '^plan_[a-zA-Z0-9_-]{1,100}$' and jsonb_typeof(entry->'value')='string' and length(entry->>'value')<=6000);
     if entry->>'value'='' then contents:=contents#-array['fact',entry->>'key'];
     else contents:=jsonb_set(contents,array['fact',entry->>'key'],entry->'value'); end if;
   end loop;
   insert into rpg_private.dm_state(campaign_id,contents,revision) values(p_campaign_id,contents,coalesce(state_row.revision,0)+1)
     on conflict(campaign_id) do update set contents=excluded.contents,revision=excluded.revision,updated_at=now();
   update rpg_private.runtime_state set revision=revision+1,updated_at=now() where campaign_id=p_campaign_id;
   if p_payload ? 'playerLikes' and jsonb_typeof(p_payload->'playerLikes')='string' then
     perform rpg_private.assert(length(p_payload->>'playerLikes')<=2000);
     update public.rpg_campaigns set player_likes=p_payload->>'playerLikes',revision=revision+1,updated_at=now() where id=p_campaign_id;
   end if;
 end if;
 insert into rpg_private.dossier_receipts(request_id,owner_id,campaign_id,action,payload) values(rid,p_owner_id,p_campaign_id,p_action,p_payload);
 return rpg_private.dossier_read(p_campaign_id);
end $$;

revoke all on function rpg_private.dossier_read(uuid) from public,anon,authenticated;
revoke all on function rpg_private.dm_depth_valid(jsonb) from public,anon,authenticated;
revoke all on function rpg_private.dm_loop_convert_reward_terms(uuid) from public,anon,authenticated;
revoke all on function public.rpg_dossier(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated;
do $$ begin if exists(select 1 from pg_roles where rolname='service_role') then
 revoke all on function rpg_private.dossier_read(uuid) from service_role;
 revoke all on function rpg_private.dm_depth_valid(jsonb) from service_role;
 revoke all on function rpg_private.dm_loop_convert_reward_terms(uuid) from service_role;
 grant execute on function public.rpg_dossier(uuid,uuid,text,jsonb,jsonb) to service_role;
end if; end $$;
revoke all on all tables in schema rpg_private from public,anon,authenticated;
revoke all on all functions in schema rpg_private from public,anon,authenticated;
commit;
