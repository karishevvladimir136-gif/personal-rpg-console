-- Polish stage, group 4 (docs/stages/POLISH.md, items 9, 15–18, 23 and the
-- doctrine lines of 10, 20, 21): the DM's craft from session 1. Additive only.
--   * the likes note in two parts: the player's own words (player_likes, written
--     by the wizard and the owner, never by the DM) and the DM's observations
--     (dm_likes, written by finish_turn and the digest);
--   * new DM Craft cards, pending the owner's approval in the DM Craft screen —
--     never activated here; each version's provenance is its one line «what changes».
begin;

-- 1. The DM's observations next to the player's own words ---------------------
alter table public.rpg_campaigns add column dm_likes text not null default '' check (length(dm_likes)<=2000);

create or replace function rpg_private.dossier_read(cid uuid) returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('campaignId',c.id,'pinned',c.pinned_facts,'playerLikes',c.player_likes,'dmLikes',c.dm_likes,'theme',c.theme,
   'status',c.status,'playMinutes',c.play_minutes,'revision',c.revision)
 from public.rpg_campaigns c where c.id=cid
$$;

-- rpg_dossier: a server-only action dm_likes {requestId, playerLikes} writes the
-- DM's note; the digest's playerLikes now refreshes the DM's note, not the
-- player's words. The owner's likes action is unchanged.
do $$ declare d text; begin
 select pg_get_functiondef('public.rpg_dossier(uuid,uuid,text,jsonb,jsonb)'::regprocedure) into d;
 d:=replace(d,'perform rpg_private.assert(p_action in (''pin'',''unpin'',''likes'',''theme'',''status'',''play_time'',''digest''));',
             'perform rpg_private.assert(p_action in (''pin'',''unpin'',''likes'',''dm_likes'',''theme'',''status'',''play_time'',''digest''));');
 d:=replace(d,' elsif p_action=''theme'' then',
  ' elsif p_action=''dm_likes'' then
   perform rpg_private.fields(p_payload,array[''requestId'',''playerLikes'']);
   perform rpg_private.assert(jsonb_typeof(p_payload->''playerLikes'')=''string'' and length(p_payload->>''playerLikes'')<=2000);
   update public.rpg_campaigns set dm_likes=p_payload->>''playerLikes'',revision=revision+1,updated_at=now() where id=p_campaign_id;
 elsif p_action=''theme'' then');
 d:=replace(d,'     perform rpg_private.assert(length(p_payload->>''playerLikes'')<=2000);
     update public.rpg_campaigns set player_likes=p_payload->>''playerLikes'',revision=revision+1,updated_at=now() where id=p_campaign_id;',
  '     perform rpg_private.assert(length(p_payload->>''playerLikes'')<=2000);
     update public.rpg_campaigns set dm_likes=p_payload->>''playerLikes'',revision=revision+1,updated_at=now() where id=p_campaign_id;');
 perform rpg_private.assert(d like '%p_action=''dm_likes''%' and d like '%''likes'',''dm_likes'',''theme''%' and d like '%set dm_likes=p_payload->>''playerLikes''%');
 execute d;
end $$;

-- The turn's source and the saves carry the DM's note on the campaign row.
alter function rpg_private.runtime_source(uuid,uuid,text) rename to runtime_source_before_polish_craft;
create function rpg_private.runtime_source(cid uuid,uid uuid,mode text default 'game') returns jsonb
language plpgsql stable set search_path='' as $$
declare result jsonb:=rpg_private.runtime_source_before_polish_craft(cid,uid,mode); rows jsonb; begin
 select (result#>'{snapshot,campaign}')||jsonb_build_object('dm_likes',c.dm_likes) into rows from public.rpg_campaigns c where c.id=cid;
 result:=jsonb_set(result,'{snapshot,campaign}',rows);
 return result;
end $$;
revoke all on function rpg_private.runtime_source_before_polish_craft(uuid,uuid,text),rpg_private.runtime_source(uuid,uuid,text) from public,anon,authenticated;

-- 2. New DM Craft cards, pending the owner's approval -------------------------
-- Written from the session 1 mission report (POLISH.md «Session 1 mission report
-- — findings»). A new key has a version but no active one; nothing here
-- activates anything. The owner approves them in the DM Craft screen («Pending
-- versions» → «Review and approve»); the bench activates them for its synthetic owner.
alter function rpg_private.dm_craft_seed(uuid) rename to dm_craft_seed_before_polish;
create function rpg_private.dm_craft_seed(uid uuid) returns void language plpgsql set search_path='' as $$
declare e record; begin
 perform rpg_private.dm_craft_seed_before_polish(uid);
 for e in select * from (values
  ('heros-knowledge','knowledge',array['plan','narrate']::text[],array['know','remember','clue','mystery','trade','old','знае','помн','улик','тайн','ремесл','стари']::text[],
   $j${"title":"The hero's own knowledge, and three clues per mystery","guidance":"What the hero knows from their trade, past and origin, the player learns when it matters: plainly in the narration («you have heard this before, on the Guild barge, and you know what the old men meant…»), or through a knowledge check when it is uncertain. A clue only you can read is not a clue. Every conclusion the story wants reachable has at least three clues of different kinds (a thing seen, a thing said, a thing the hero already knows), at least one direct. Keep a private fact per mystery (note_world fact clues_<mystery>: seen / next) so you know which clues the player has met and what to offer next; the digest's notebook names the next clue.","avoid":"Keeping the hero's own knowledge as a secret from the player; a mystery whose key only you hold; a single oblique clue repeated three times; explaining the mystery instead of letting the hero recognise it."}$j$::jsonb,
   $j${"title":"Знание героя и три улики на тайну","guidance":"То, что герой знает по ремеслу, прошлому и происхождению, игрок узнаёт, когда это важно: прямо в повествовании («ты это уже слышал на гильдейской барже — и знаешь, о чём говорили старики…») или через проверку знания, когда это неточно. Улика, которую можешь прочесть только ты, — не улика. У каждого вывода, к которому история хочет подвести, не меньше трёх улик разного рода (увиденное, сказанное, то, что герой уже знает), хотя бы одна прямая. Держи приватный факт на каждую тайну (note_world fact clues_<тайна>: seen / next), чтобы знать, какие улики игрок уже встретил и что предложить дальше; блокнот дайджеста называет следующую улику.","avoid":"Держать знание самого героя в секрете от игрока; тайна, ключ от которой только у тебя; одна косвенная улика, повторённая трижды; объяснять тайну вместо того, чтобы дать герою её узнать."}$j$::jsonb,
   'Polish: a new card — the hero''s own knowledge reaches the player when it matters, and every mystery has three clues with a private note of which the player has seen'),
  ('danger-and-pacing','rhythm',array['plan','narrate']::text[],array['fight','attack','ambush','threat','danger','prepare','бой','напад','засад','угроз','опасн','готов']::text[],
   $j${"title":"Danger from an opponent, a fight that plays as a fight, a clear end","guidance":"Build the cast so that someone's rational interest is to take by force — a rival crew, agents quietly hunting what the hero holds, smugglers who would rather rob than pay, something in the water — tied to the campaign's secrets, with their plans recorded as off-screen plans with warnings. When the player's note says they enjoy fights and several scenes have passed without danger from an opponent, let a fitting threat escalate to violence: never forced, always from the fiction. A clash, with or without the combat tool, plays as a fight: the hero acts at least twice, the opponent acts with intent, there is a cost, and the hero's success is narrated first. Once the player's plan is clear, compress preparation into a montage. Each session opens or advances one thread toward a larger mystery and ends on a clear beat — a chapter close, a reveal or a cliffhanger.","avoid":"Hours of preparation with every opponent a calculating trader; a clash settled in one roll per side; a companion taking the decisive beat; tension only from weather, prices and bluff; a session that winds down quietly with the hook still off screen."}$j$::jsonb,
   $j${"title":"Опасность от противника, бой как бой, ясный финал","guidance":"Строй состав так, чтобы кому-то было разумно взять силой — соперничающая артель, агенты, тихо ищущие то, что у героя, контрабандисты, которым проще ограбить, чем заплатить, что-то в воде — в связке с тайнами кампании, а их планы записаны как планы за кадром с предупреждениями. Когда в записке игрока сказано, что он любит бои, а несколько сцен прошли без опасности от противника, дай подходящей угрозе дойти до насилия: никогда насильно, всегда из истории. Стычка, с инструментом боя или без, играется как бой: герой действует не меньше двух раз, противник действует с намерением, есть цена, и успех героя рассказан первым. Когда план игрока ясен, сжимай подготовку в монтаж. Каждая сессия открывает или продвигает одну нить к большей тайне и заканчивается ясным ударом — закрытием главы, раскрытием или обрывом на самом интересном.","avoid":"Часы подготовки, где каждый противник — расчётливый торговец; стычка, решённая одним броском с каждой стороны; спутник забирает решающий момент; напряжение только от погоды, цен и блефа; сессия, тихо сходящая на нет, пока крючок остаётся за кадром."}$j$::jsonb,
   'Polish: a new card — someone in the cast wants to take by force, a clash plays as a fight with a cost, preparation becomes a montage, every session ends on a clear beat'),
  ('heros-moment','agency',array['plan','narrate']::text[],array['natural 20','critical','decisive','moment','how do you','companion','крит','решающ','момент','как ты','спутник']::text[],
   $j${"title":"The hero's moment, and never deciding for the hero","guidance":"A natural 20 or a decisive success belongs to the hero: narrate the hero's success first and in full; companions support and never take the decisive beat; a natural 20 gives more than was asked — an extra effect in the hero's favour. «How do you want to do this?» (playerMoment) is for climaxes — finishing an important enemy, the decisive act of a scene — after a successful visible roll, rarely, never for every success. The player owns the hero's choices, words and feelings: when the next step is the hero's decision, end the turn on the question and wait; narrate what the hero perceives and what the world does, not what the hero decides.","avoid":"A companion's private roll swallowing the hero's natural 20; a success that only ticks a box; «your moment» on a quiet walk or without a roll; writing the hero's decision, line or reaction for the player; asking «how do you want to do this?» every other turn."}$j$::jsonb,
   $j${"title":"Момент героя — и никогда не решать за героя","guidance":"Естественная двадцатка или решающий успех принадлежат герою: успех героя рассказывай первым и полностью; спутники поддерживают и никогда не забирают решающий момент; естественная двадцатка даёт больше, чем просили, — дополнительный эффект в пользу героя. «Как ты хочешь это сделать?» (playerMoment) — для кульминаций: добить важного врага, решающее действие сцены — после успешного открытого броска, редко, не на каждый успех. Выбор, слова и чувства героя принадлежат игроку: когда следующий шаг — решение героя, заканчивай ход на вопросе и жди; рассказывай, что герой видит и что делает мир, а не что герой решает.","avoid":"Приватный бросок спутника, проглотивший двадцатку героя; успех, который лишь ставит галочку; «твой момент» на тихой прогулке или без броска; писать за игрока решение, реплику или реакцию героя; спрашивать «как ты хочешь это сделать?» через ход."}$j$::jsonb,
   'Polish: a new card — a natural 20 and the decisive success are the hero''s, «how do you want to do this?» only for a climax after a roll, and the hero''s choices are never written for the player'),
  ('time-and-clock','world',array['plan','narrate']::text[],array['morning','evening','night','hour','since','ago','утр','вечер','ноч','час','с утра','назад']::text[],
   $j${"title":"Time words against the clock","guidance":"The dossier shows the game clock with the part of the day in words and the game time of recent exchanges. Before you write «this morning», «since six», «last night» or «an hour ago», check them against that clock: the day and hour of the current state and of the event you refer to. Let the light, the tide, the meals and the fatigue follow the hour. When time passes, say so through advance_time, move_party or rest so the clock stays true, and let the world's own schedule (shops, watches, boats) match it.","avoid":"«In the morning you asked» about something asked at half past five in the evening; a morning scene on a clock that says night; a character who «has been sitting here since six» two hours after he arrived; time passing in the text without the tool."}$j$::jsonb,
   $j${"title":"Слова о времени — по часам","guidance":"Досье показывает игровые часы с временем суток словами и игровое время недавних реплик. Прежде чем написать «утром», «с шести», «вчера ночью» или «час назад», сверь это с часами: день и час текущего состояния и того события, на которое ссылаешься. Пусть свет, прилив, еда и усталость идут за часом. Когда время проходит, говори об этом через advance_time, move_party или rest, чтобы часы оставались верными, и пусть распорядок мира (лавки, вахты, лодки) совпадает с ними.","avoid":"«Утром вы спрашивали» о том, что спросили в половине шестого вечера; утренняя сцена при часах, показывающих ночь; человек, который «сидит с шести», через два часа после прихода; время, прошедшее в тексте без инструмента."}$j$::jsonb,
   'Polish: a new card — time-of-day words are checked against the game clock the dossier shows'),
  ('open-questions-and-tics','voice',array['plan','narrate']::text[],array['ask','question','answer','again','always','habit','спрос','вопрос','ответ','опять','всегда','привычк']::text[],
   $j${"title":"Open questions stay open; a tic once a scene","guidance":"A direct question asked of the hero, or by the hero of someone, stays open until it is answered or plainly dropped: keep the unanswered ones in a private fact (note_world fact open_questions, one short line each, remove when answered) and let the person who asked come back to it the way people do. Each person's signatures and verbal tics are seasoning: a tic at most once a scene, varied in wording, and absent when the mood does not call for it; the dossier shows which signatures sounded recently.","avoid":"An NPC's question that vanishes when the player changes the subject; the same gesture at every appearance of a character («spits over the side» ten times); a catchphrase in every reply; a tic in a scene where the person is frightened or busy."}$j$::jsonb,
   $j${"title":"Открытые вопросы остаются открытыми; тик — раз за сцену","guidance":"Прямой вопрос, заданный герою или героем кому-то, остаётся открытым, пока на него не ответили или не отбросили явно: держи неотвеченные в приватном факте (note_world fact open_questions, по короткой строке, убирай после ответа) и дай спросившему вернуться к нему, как это делают люди. Жесты и словечки каждого человека — приправа: тик не чаще раза за сцену, в разных словах, и его нет, когда настроение не то; досье показывает, какие жесты звучали недавно.","avoid":"Вопрос NPC, исчезающий, когда игрок меняет тему; один и тот же жест при каждом появлении персонажа («сплёвывает за борт» десять раз); коронная фраза в каждой реплике; тик в сцене, где человек напуган или занят."}$j$::jsonb,
   'Polish: a new card — an unanswered direct question is kept in a private note until answered, and a verbal tic sounds at most once a scene'),
  ('records-match-the-fiction','bookkeeping',array['plan','narrate']::text[],array['lost','pledge','lend','coin','money','rejected','потер','залог','одолж','монет','деньг','отклон']::text[],
   $j${"title":"Records that match the fiction","guidance":"Every durable thing in the story has the record the fiction calls for: a thing used up is consume; a thing gone is lose with what happened; a thing changed by the story (cut, soaked, mended, renamed) is modify, keeping its identity; a thing left as surety is pledge, a borrowed one lend, and a transfer back returns it; a coat lent to the hero is a transfer, a two-day rental is lend with the return condition. Money is money (the world's own word in the campaign language), never an item. A rejected money or item call is retried in the same turn with the fix the reason names — a rejected record never becomes a private note, and the story never counts what the records refused.","avoid":"«used» for a knife that sank or gloves that came off; three records of one shirt; a coin as an item; a pledge recorded as three plain transfers; moving a refused payment into note_world; narrating a purchase the money tool rejected."}$j$::jsonb,
   $j${"title":"Записи, совпадающие с историей","guidance":"У каждой прочной вещи в истории — та запись, которой требует вымысел: израсходованное — consume; пропавшее — lose с тем, что случилось; изменённое историей (разрезано, промокло, починено, переименовано) — modify с сохранением сути; оставленное в залог — pledge, взятое взаймы — lend, а возврат владельцу возвращает; плащ, одолженный герою, — передача, аренда на два дня — lend с условием возврата. Деньги — это деньги (слово самого мира на языке кампании), никогда не предмет. Отклонённый денежный или предметный вызов повторяется в том же ходе с исправлением, которое называет причина; отклонённая запись никогда не становится приватной заметкой, и история не считает того, в чём записи отказали.","avoid":"«Использовано» для ножа, который утонул, или рукавиц, которые сняли; три записи одной рубахи; монета как предмет; залог, записанный как три обычные передачи; перенос отклонённого платежа в note_world; рассказ о покупке, которую отклонил денежный инструмент."}$j$::jsonb,
   'Polish: a new card — each thing in the story gets the matching record operation, money is never an item, and a rejected call is retried instead of turned into a note')
 ) as x(key,category,stages,triggers,en,ru,provenance) loop
  if exists(select 1 from rpg_private.dm_craft_versions where owner_id=uid and key=e.key) then continue; end if;
  insert into rpg_private.dm_craft_versions(owner_id,key,version,kind,category,stages,triggers,en,ru,provenance)
   values(uid,e.key,1,'card',e.category,e.stages,e.triggers,e.en,e.ru,e.provenance);
 end loop;
end $$;
do $$ declare uid uuid; begin for uid in select user_id from rpg_private.owner_registry loop perform rpg_private.dm_craft_seed(uid); end loop; end $$;

commit;
