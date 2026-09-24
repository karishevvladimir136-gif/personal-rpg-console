-- Mega DM v1: owner-scoped immutable Craft and campaign Style on existing settings.
-- Additive. Historical settings and saves remain valid without dmStyle.
begin;

create or replace function rpg_private.settings_valid(s jsonb, cid uuid) returns void language plpgsql set search_path = '' as $$
declare d jsonb := s->'difficulty'; r jsonb := s->'rulesSystem'; style jsonb := s->'dmStyle'; k text;
begin
  perform rpg_private.fields(s,array['campaign_id','language','rulesSystem','difficulty','storyStructure','playerRole','worldAutonomy','checkFrequency','dicePresentation','interactiveDice','showDc','visualStyle','frameRatio','videoDuration','narrativeStyle'],array['dmStyle']);
  perform rpg_private.assert(s->>'campaign_id' = cid::text and s->>'language' in ('en','ru'));
  perform rpg_private.fields(r,array['id','label','enemyHpScaling','enemyDamageScaling']);
  perform rpg_private.assert(length(btrim(r->>'id')) between 1 and 80 and length(btrim(r->>'label')) between 1 and 120 and jsonb_typeof(r->'id') = 'string' and jsonb_typeof(r->'label') = 'string');
  perform rpg_private.assert(jsonb_typeof(r->'enemyHpScaling') = 'boolean' and jsonb_typeof(r->'enemyDamageScaling') = 'boolean');
  perform rpg_private.fields(d,array['preset','shortRestSupplyCost','longRestSupplyCost','enemyHpMultiplier','enemyDamageMultiplier','rerolls','rerollsPerSession','defeat','recovery','scarcity']);
  perform rpg_private.assert(d->>'preset' in ('easy','medium','hard','custom') and d->>'rerolls' in ('disabled','limited','unlimited') and d->>'defeat' in ('setbacks','injuries','death') and d->>'recovery' in ('forgiving','standard','restrictive') and d->>'scarcity' in ('abundant','standard','scarce'));
  foreach k in array array['shortRestSupplyCost','longRestSupplyCost'] loop
    perform rpg_private.assert(jsonb_typeof(d->k) = 'number' and (d->>k)::numeric between 0 and 5 and mod((d->>k)::numeric,1) = 0);
  end loop;
  foreach k in array array['enemyHpMultiplier','enemyDamageMultiplier'] loop
    perform rpg_private.assert(jsonb_typeof(d->k) = 'number' and (d->>k)::numeric between .25 and 3 and mod((d->>k)::numeric,.25) = 0);
  end loop;
  perform rpg_private.assert(jsonb_typeof(d->'rerollsPerSession') = 'number' and (d->>'rerollsPerSession')::numeric between 1 and 20 and mod((d->>'rerollsPerSession')::numeric,1) = 0);
  perform rpg_private.assert(s->>'storyStructure' in ('story-led','balanced','sandbox') and s->>'playerRole' in ('one-of-many','significant','chosen') and s->>'worldAutonomy' in ('low','moderate','high'));
  perform rpg_private.assert(s->>'checkFrequency' in ('narrative','balanced','full-rpg') and s->>'dicePresentation' in ('hidden','key-rolls','all-player-rolls') and jsonb_typeof(s->'interactiveDice') = 'boolean' and jsonb_typeof(s->'showDc') = 'boolean');
  foreach k in array array['visualStyle','frameRatio','videoDuration','narrativeStyle'] loop
    perform rpg_private.assert(jsonb_typeof(s->k) = 'string' and length(btrim(s->>k)) between 1 and 200);
  end loop;
  if s ? 'dmStyle' then
    perform rpg_private.fields(style,array['companionAgency','descriptionDensity','dialogueDensity','dramaticPace','mystery','failForward','tone']);
    perform rpg_private.assert(style->>'companionAgency' in ('low','normal','high') and style->>'descriptionDensity' in ('concise','balanced','rich') and style->>'dialogueDensity' in ('concise','balanced','rich') and style->>'dramaticPace' in ('measured','balanced','brisk') and style->>'mystery' in ('low','normal','high') and style->>'failForward' in ('low','normal','high') and style->>'tone' in ('grounded','warm','cinematic'));
  end if;
end;
$$;

create table rpg_private.dm_craft_versions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  key text not null check (key ~ '^[a-z][a-z0-9-]{1,79}$'),
  version integer not null check (version > 0),
  kind text not null check (kind in ('doctrine','card')),
  category text not null check (length(btrim(category)) between 1 and 80),
  stages text[] not null check (array_length(stages,1) between 1 and 2 and stages <@ array['plan','narrate']::text[]),
  triggers text[] not null check (cardinality(triggers) <= 12),
  en jsonb not null,
  ru jsonb not null,
  provenance text not null check (length(btrim(provenance)) between 1 and 240),
  created_at timestamptz not null default now(),
  unique (owner_id,key,version), unique (owner_id,key,id),
  check ((key = 'core-doctrine') = (kind = 'doctrine'))
);
create function rpg_private.dm_craft_immutable() returns trigger language plpgsql set search_path='' as $$
begin raise exception 'rpg_immutable_history' using errcode='42501'; end $$;
create trigger immutable_dm_craft_versions before update or delete on rpg_private.dm_craft_versions for each row execute function rpg_private.dm_craft_immutable();
create table rpg_private.dm_craft_effective (
  owner_id uuid not null references auth.users(id), key text not null,
  active_version_id uuid not null,
  activation_revision integer not null check (activation_revision > 0),
  primary key (owner_id,key),
  foreign key (owner_id,key,active_version_id) references rpg_private.dm_craft_versions(owner_id,key,id)
);
create table rpg_private.dm_craft_activations (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null,
  key text not null, revision integer not null check (revision > 0),
  version_id uuid not null, created_at timestamptz not null default now(),
  unique(owner_id,key,revision),
  foreign key (owner_id,key,version_id) references rpg_private.dm_craft_versions(owner_id,key,id)
);
create trigger immutable_dm_craft_activations before update or delete on rpg_private.dm_craft_activations for each row execute function rpg_private.dm_craft_immutable();
create table rpg_private.dm_craft_commands (
  id uuid primary key, owner_id uuid not null references auth.users(id),
  request jsonb not null, result jsonb not null, created_at timestamptz not null default now()
);
create trigger immutable_dm_craft_commands before update or delete on rpg_private.dm_craft_commands for each row execute function rpg_private.dm_craft_immutable();
alter table rpg_private.dm_craft_versions enable row level security;
alter table rpg_private.dm_craft_effective enable row level security;
alter table rpg_private.dm_craft_activations enable row level security;
alter table rpg_private.dm_craft_commands enable row level security;

create function rpg_private.dm_craft_locale_valid(v jsonb) returns boolean language sql immutable set search_path='' as $$
 select coalesce(jsonb_typeof(v)='object' and v ?& array['title','guidance','avoid'] and
   (select count(*)=3 from jsonb_object_keys(v)) and
   jsonb_typeof(v->'title')='string' and length(btrim(v->>'title')) between 1 and 120 and
   jsonb_typeof(v->'guidance')='string' and length(btrim(v->>'guidance')) between 1 and 1600 and
   jsonb_typeof(v->'avoid')='string' and length(btrim(v->>'avoid')) between 1 and 800,false)
$$;
create function rpg_private.dm_craft_entry_valid(v jsonb) returns void language plpgsql set search_path='' as $$
declare x jsonb; begin
 perform rpg_private.fields(v,array['key','kind','category','stages','triggers','en','ru','provenance']);
 perform rpg_private.assert(v->>'key' ~ '^[a-z][a-z0-9-]{1,79}$' and v->>'kind' in ('doctrine','card') and ((v->>'key'='core-doctrine')=(v->>'kind'='doctrine')) and length(btrim(v->>'category')) between 1 and 80 and length(btrim(v->>'provenance')) between 1 and 240);
 perform rpg_private.assert(jsonb_typeof(v->'stages')='array' and jsonb_array_length(v->'stages') between 1 and 2 and jsonb_typeof(v->'triggers')='array' and jsonb_array_length(v->'triggers')<=12);
 for x in select value from jsonb_array_elements(v->'stages') loop perform rpg_private.assert(jsonb_typeof(x)='string' and x#>>'{}' in ('plan','narrate')); end loop;
 for x in select value from jsonb_array_elements(v->'triggers') loop perform rpg_private.assert(jsonb_typeof(x)='string' and length(btrim(x#>>'{}')) between 2 and 80); end loop;
 perform rpg_private.assert(rpg_private.dm_craft_locale_valid(v->'en') and rpg_private.dm_craft_locale_valid(v->'ru') and octet_length(v::text)<=10000);
end $$;

create function rpg_private.dm_craft_json(v rpg_private.dm_craft_versions) returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('id',v.id,'key',v.key,'version',v.version,'kind',v.kind,'category',v.category,'stages',to_jsonb(v.stages),'triggers',to_jsonb(v.triggers),'en',v.en,'ru',v.ru,'provenance',v.provenance,'createdAt',v.created_at)
$$;
create function rpg_private.dm_craft_owner_view(uid uuid) returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('policyVersion','mega-dm-v1-literal-1',
  'versions',coalesce((select jsonb_agg(rpg_private.dm_craft_json(v) order by v.key,v.version) from rpg_private.dm_craft_versions v where v.owner_id=uid),'[]'::jsonb),
  'effective',coalesce((select jsonb_agg(jsonb_build_object('key',e.key,'activeVersionId',e.active_version_id,'activationRevision',e.activation_revision) order by e.key) from rpg_private.dm_craft_effective e where e.owner_id=uid),'[]'::jsonb))
$$;

-- Original, generalized technique only. Never seeded with campaign history.
create function rpg_private.dm_craft_seed(uid uuid) returns void language plpgsql set search_path='' as $$
declare entry record; vid uuid; begin
 for entry in
  select * from (values
   ('core-doctrine','doctrine','core',array['plan','narrate']::text[],array[]::text[],
    '{"title":"Core Doctrine","guidance":"Protect player agency and accept plausible free-form approaches. Let valid surprises create durable consequences. Preserve established history and meaningful failure. NPCs and companions have goals and bounded knowledge; they may initiate without choosing for the player. State, Canon, mechanics and secrecy always take priority.","avoid":"Never silently retcon, erase a consequence, force a single route, invent knowledge or grant outcomes through prose."}'::jsonb,
    '{"title":"Основные принципы","guidance":"Сохраняй свободу игрока и принимай правдоподобные нестандартные действия. Пусть неожиданные решения оставляют устойчивые последствия. Сохраняй установленную историю и значимые неудачи. У NPC и спутников есть цели и ограниченные знания; они могут проявлять инициативу, не выбирая за игрока. Состояние, канон, механика и тайна всегда главнее.","avoid":"Не переписывай прошлое молча, не стирай последствия, не навязывай один путь, не выдумывай знания и результаты одним лишь текстом."}'::jsonb),
   ('consequence-and-recovery','card','causality',array['plan']::text[],array['fail','failure','lost','неудач','провал','потер'],
    '{"title":"Consequences and recovery","guidance":"A failed approach changes the situation. Preserve the cost, then allow supported recovery or alternate routes. Mix immediate and delayed consequences without resetting the loss.","avoid":"Do not quietly restore spent resources or turn a failure into an unearned success."}'::jsonb,
    '{"title":"Последствия и восстановление","guidance":"Неудачная попытка меняет положение. Сохраняй цену ошибки, затем допускай обоснованное восстановление или иной путь. Сочетай быстрые и отложенные последствия без отмены потери.","avoid":"Не возвращай потраченные ресурсы молча и не превращай неудачу в незаслуженный успех."}'::jsonb),
   ('promises-and-relationships','card','relationships',array['plan','narrate']::text[],array['promise','friend','relationship','обещ','друг','отношен'],
    '{"title":"Promises and relationships","guidance":"Let supported promises and changing relationships cause scenes. Recurring people retain a stable core while responding to what has happened.","avoid":"Do not invent a promise, private feeling or new knowledge to manufacture a callback."}'::jsonb,
    '{"title":"Обещания и отношения","guidance":"Пусть подтверждённые обещания и меняющиеся отношения вызывают сцены. Знакомые люди сохраняют свой характер, но реагируют на пережитое.","avoid":"Не выдумывай обещание, скрытое чувство или новые знания ради красивой отсылки."}'::jsonb),
   ('return-with-delta','card','continuity',array['narrate']::text[],array['return','again','home','back','снова','верну','дом'],
    '{"title":"Return with change","guidance":"When an established person or place returns, show a small grounded difference caused by known events. Familiarity gives the difference meaning.","avoid":"Do not add a change that contradicts the saved state or reveal a dormant secret merely for novelty."}'::jsonb,
    '{"title":"Возвращение с переменой","guidance":"Когда знакомый человек или место появляется снова, покажи небольшое обоснованное изменение из известных событий. Знакомство делает его значимым.","avoid":"Не добавляй перемену вопреки сохранённому состоянию и не раскрывай скрытую тайну ради новизны."}'::jsonb),
   ('quiet-and-decompression','card','rhythm',array['narrate']::text[],array['rest','quiet','after','camp','отдых','тихо','после'],
    '{"title":"Quiet and decompression","guidance":"Give a supported quiet scene space after intensity. Use restrained dialogue and sensory detail to let consequences land without advancing a new event.","avoid":"Do not create a fresh crisis, resource recovery or time jump that the settled outcome did not authorize."}'::jsonb,
    '{"title":"Тишина после напряжения","guidance":"После напряжения дай обоснованной тихой сцене пространство. Сдержанный диалог и детали помогают ощутить последствия без нового события.","avoid":"Не создавай новый кризис, восстановление ресурсов или скачок времени без подтверждённого результата."}'::jsonb),
   ('player-goals-and-backstory','card','agency',array['plan']::text[],array['goal','backstory','seek','quest','цель','прошл','ищ'],
    '{"title":"Player goals become world content","guidance":"Treat a player-created goal or established backstory as a possible source of supported hooks. Offer more than one viable approach and respect current world pressure.","avoid":"Do not invent a backstory fact, force the main quest, or close off plausible alternatives."}'::jsonb,
    '{"title":"Цели игрока в мире","guidance":"Цель игрока или установленное прошлое может стать основой подтверждённых зацепок. Оставляй несколько возможных подходов и учитывай давление мира.","avoid":"Не выдумывай факты прошлого, не навязывай главный сюжет и не закрывай правдоподобные пути."}'::jsonb),
   ('threads-and-payoff','card','long-form',array['plan','narrate']::text[],array['thread','mystery','clue','secret','нить','тайн','намек'],
    '{"title":"Setup, dormancy and payoff","guidance":"Advance only a relevant established thread. Let a supported earlier setup matter after believable dormancy; useful callbacks clarify present choices and consequences.","avoid":"Do not surface a dormant mystery simply because it was retrieved, reveal hidden facts, or spam callbacks."}'::jsonb,
    '{"title":"Завязка, пауза и развязка","guidance":"Продвигай только уместную установленную нить. Подтверждённая завязка может обрести смысл после естественной паузы; полезная отсылка проясняет нынешний выбор и последствия.","avoid":"Не вытаскивай спящую тайну только из-за поиска, не раскрывай скрытые факты и не злоупотребляй отсылками."}'::jsonb),
   ('npc-trajectories','card','characters',array['plan','narrate']::text[],array['companion','npc','faction','ally','спутник','союз','фракц'],
    '{"title":"Independent character trajectories","guidance":"Existing NPCs and companions may pursue grounded goals and initiate relevant scenes within their capabilities and knowledge. Their core traits persist while their stance can evolve through events.","avoid":"Never make a companion decide or act for the player, know a hidden fact or gain an unsupported capability."}'::jsonb,
    '{"title":"Свои пути персонажей","guidance":"NPC и спутники могут преследовать обоснованные цели и начинать уместные сцены в пределах возможностей и знаний. Их характер остаётся узнаваемым, а отношение меняется вслед за событиями.","avoid":"Не позволяй спутнику решать за игрока, знать тайное или получать неподтверждённую способность."}'::jsonb)
  ) as e(key,kind,category,stages,triggers,en,ru)
 loop
  if exists(select 1 from rpg_private.dm_craft_versions where owner_id=uid and key=entry.key) then continue; end if;
  insert into rpg_private.dm_craft_versions(owner_id,key,version,kind,category,stages,triggers,en,ru,provenance)
   values(uid,entry.key,1,entry.kind,entry.category,entry.stages,entry.triggers,entry.en,entry.ru,'Owner-approved Mega DM v1 generalized doctrine') returning id into vid;
  insert into rpg_private.dm_craft_effective(owner_id,key,active_version_id,activation_revision) values(uid,entry.key,vid,1);
  insert into rpg_private.dm_craft_activations(owner_id,key,revision,version_id) values(uid,entry.key,1,vid);
 end loop;
end $$;
create function rpg_private.dm_craft_seed_owner() returns trigger language plpgsql set search_path='' as $$
begin perform rpg_private.dm_craft_seed(new.user_id); return new; end $$;
create trigger seed_dm_craft_owner after insert on rpg_private.owner_registry for each row execute function rpg_private.dm_craft_seed_owner();
do $$ declare uid uuid; begin for uid in select user_id from rpg_private.owner_registry loop perform rpg_private.dm_craft_seed(uid); end loop; end $$;

create function public.rpg_dm_craft(p_owner_id uuid,p_action text,p_payload jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=p_owner_id; rid uuid; saved rpg_private.dm_craft_commands%rowtype; entry jsonb; v rpg_private.dm_craft_versions%rowtype; craft_key text; current_revision integer; next_revision integer; result jsonb;
begin
 if uid is null or not exists(select 1 from rpg_private.owner_registry where user_id=uid) then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 if p_action='read' then perform rpg_private.assert(p_payload='{}'::jsonb); return rpg_private.dm_craft_owner_view(uid); end if;
 perform rpg_private.assert(p_action in ('save','activate') and jsonb_typeof(p_payload)='object' and octet_length(p_payload::text)<=16000);
 rid:=(p_payload->>'requestId')::uuid;
 perform rpg_private.assert(rid is not null);
 perform 1 from rpg_private.owner_registry where user_id=uid for update;
 select * into saved from rpg_private.dm_craft_commands where id=rid;
 if found then
  if saved.owner_id<>uid or saved.request<>jsonb_build_object('action',p_action,'payload',p_payload) then raise exception 'rpg_conflict'; end if;
  return saved.result;
 end if;
 if p_action='save' then
  perform rpg_private.fields(p_payload,array['requestId','expectedActivationRevision','entry']);
  entry:=p_payload->'entry'; perform rpg_private.dm_craft_entry_valid(entry); craft_key:=entry->>'key';
 else
  perform rpg_private.fields(p_payload,array['requestId','expectedActivationRevision','key','versionId']);
  craft_key:=p_payload->>'key'; perform rpg_private.assert(craft_key ~ '^[a-z][a-z0-9-]{1,79}$');
 end if;
 select activation_revision into current_revision from rpg_private.dm_craft_effective where owner_id=uid and dm_craft_effective.key=craft_key for update;
 current_revision:=coalesce(current_revision,0);
 perform rpg_private.assert(jsonb_typeof(p_payload->'expectedActivationRevision')='number' and (p_payload->>'expectedActivationRevision')::integer=current_revision);
 if p_action='save' then
  insert into rpg_private.dm_craft_versions(owner_id,key,version,kind,category,stages,triggers,en,ru,provenance)
   values(uid,craft_key,coalesce((select max(version)+1 from rpg_private.dm_craft_versions where owner_id=uid and dm_craft_versions.key=craft_key),1),entry->>'kind',entry->>'category',array(select jsonb_array_elements_text(entry->'stages')),array(select jsonb_array_elements_text(entry->'triggers')),entry->'en',entry->'ru',entry->>'provenance') returning * into v;
 else
  select * into v from rpg_private.dm_craft_versions where owner_id=uid and dm_craft_versions.key=craft_key and id=(p_payload->>'versionId')::uuid;
  if not found then raise exception 'rpg_not_found'; end if;
 end if;
 next_revision:=current_revision+1;
 insert into rpg_private.dm_craft_effective(owner_id,key,active_version_id,activation_revision) values(uid,craft_key,v.id,next_revision)
  on conflict (owner_id,key) do update set active_version_id=excluded.active_version_id,activation_revision=excluded.activation_revision;
 insert into rpg_private.dm_craft_activations(owner_id,key,revision,version_id) values(uid,craft_key,next_revision,v.id);
 result:=rpg_private.dm_craft_owner_view(uid);
 insert into rpg_private.dm_craft_commands(id,owner_id,request,result) values(rid,uid,jsonb_build_object('action',p_action,'payload',p_payload),result);
 return result;
end $$;
revoke all on function public.rpg_dm_craft(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.rpg_dm_craft(uuid,text,jsonb) to service_role;

-- Selector is deterministic, literal, stage-scoped and bounded. Input is the
-- already-authorized current turn text; Craft is never a Memory or Canon source.
create function rpg_private.dm_craft_stage(uid uuid,stage text,input_text text) returns jsonb language sql stable set search_path='' as $$
 select coalesce(jsonb_agg(selected.card order by selected.score desc,selected.key),'[]'::jsonb)
 from (
  select rpg_private.dm_craft_json(v) as card, v.key, count(t.token) as score
  from rpg_private.dm_craft_effective e
  join rpg_private.dm_craft_versions v on v.id=e.active_version_id and v.owner_id=e.owner_id
  join lateral unnest(v.triggers) t(token) on strpos(lower(input_text),lower(t.token))>0
  where e.owner_id=uid and v.kind='card' and stage=any(v.stages)
   and length(v.en->>'guidance')+length(v.ru->>'guidance')+length(v.en->>'avoid')+length(v.ru->>'avoid')<=3000
  group by v.id
  order by score desc,v.key
  limit 2
 ) selected
$$;
create function rpg_private.dm_craft_snapshot(uid uuid,cid uuid,opid uuid) returns jsonb language plpgsql stable set search_path='' as $$
declare t rpg_private.turns%rowtype; doctrine jsonb; style jsonb; mode text; begin
 select * into t from rpg_private.turns where id=opid and campaign_id=cid and owner_id=uid;
 if not found then raise exception 'rpg_not_found'; end if;
 style:=coalesce(t.settings->'dmStyle','{"companionAgency":"normal","descriptionDensity":"balanced","dialogueDensity":"balanced","dramaticPace":"balanced","mystery":"normal","failForward":"normal","tone":"grounded"}'::jsonb);
 select rpg_private.dm_craft_json(v) into doctrine from rpg_private.dm_craft_effective e join rpg_private.dm_craft_versions v on v.id=e.active_version_id where e.owner_id=uid and e.key='core-doctrine';
 mode:=t.input->>'mode';
 return jsonb_build_object('policyVersion','mega-dm-v1-literal-1','ownerId',uid,'campaignId',cid,'operationId',opid,'timeline',rpg_private.timeline_fence(cid),'styleRevision',t.settings_revision,'style',style,'doctrine',doctrine,
  'plan',case when mode in ('game','companion','mechanic') then rpg_private.dm_craft_stage(uid,'plan',t.input->>'input') else '[]'::jsonb end,
  'narrate',case when mode in ('game','companion','mechanic') then rpg_private.dm_craft_stage(uid,'narrate',t.input->>'input') else '[]'::jsonb end);
end $$;

create table rpg_private.dm_teach_commands (
 id uuid primary key, owner_id uuid not null references auth.users(id),
 campaign_id uuid not null references public.rpg_campaigns(id),
 request jsonb not null, result jsonb not null, created_at timestamptz not null default now()
);
create trigger immutable_dm_teach_commands before update or delete on rpg_private.dm_teach_commands for each row execute function rpg_private.immutable_history();
alter table rpg_private.dm_teach_commands enable row level security;

create function public.rpg_dm_teach(p_owner_id uuid,p_campaign_id uuid,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=p_owner_id; cid uuid:=p_campaign_id; rid uuid; opid uuid; action text; saved rpg_private.dm_teach_commands%rowtype; t rpg_private.turns%rowtype; current_values jsonb; current_revision integer; next_revision integer; updated_proposal jsonb; result jsonb; craft_result jsonb;
begin
 if uid is null or not exists(select 1 from rpg_private.owner_registry where user_id=uid) then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform rpg_private.assert(jsonb_typeof(p_payload)='object' and octet_length(p_payload::text)<=16000 and p_payload->>'campaignId'=cid::text);
 action:=p_payload->>'action'; rid:=(p_payload->>'requestId')::uuid; opid:=(p_payload->>'operationId')::uuid;
 perform rpg_private.assert(rid is not null and opid is not null and action in ('approve-style','approve-global','reject'));
 if action='approve-style' then perform rpg_private.fields(p_payload,array['action','requestId','campaignId','timeline','operationId','proposalId','expectedSettingsRevision','style']);
 elsif action='approve-global' then perform rpg_private.fields(p_payload,array['action','requestId','campaignId','timeline','operationId','proposalId','expectedActivationRevision','entry']);
 else perform rpg_private.fields(p_payload,array['action','requestId','campaignId','timeline','operationId','proposalId']); end if;
 perform 1 from public.rpg_campaigns where id=cid for update; if not found then raise exception 'rpg_not_found'; end if;
 perform rpg_private.timeline_assert(cid,p_payload->'timeline');
 select * into saved from rpg_private.dm_teach_commands where id=rid;
 if found then
  if saved.owner_id<>uid or saved.campaign_id<>cid or saved.request<>p_payload then raise exception 'rpg_conflict'; end if;
  return saved.result||jsonb_build_object('status','already_applied');
 end if;
 select * into t from rpg_private.turns where id=opid and campaign_id=cid and owner_id=uid for update;
 if not found then raise exception 'rpg_not_found'; end if;
 perform rpg_private.assert(t.status='committed' and t.input->>'mode'='feedback' and t.proposal is not null and t.proposal->>'id'=p_payload->>'proposalId' and t.proposal->>'status'='proposed');
 perform rpg_private.assert(t.source#>'{craft,timeline}'=p_payload->'timeline');
 if action='approve-style' then
  select values,revision into current_values,current_revision from public.rpg_settings where campaign_id=cid for update;
  if current_revision is distinct from (p_payload->>'expectedSettingsRevision')::integer then raise exception 'rpg_conflict'; end if;
  perform rpg_private.assert(jsonb_typeof(p_payload->'style')='object');
  current_values:=jsonb_set(current_values,'{dmStyle}',p_payload->'style',true);
  perform rpg_private.settings_valid(current_values,cid);
  select coalesce(max(revision),0)+1 into next_revision from public.rpg_settings_revisions where campaign_id=cid;
  update public.rpg_settings set values=current_values,revision=next_revision,updated_at=now() where campaign_id=cid;
  insert into public.rpg_settings_revisions(campaign_id,revision,values) values(cid,next_revision,current_values);
  updated_proposal:=t.proposal||jsonb_build_object('status','approved','scope','campaign_style','styleRevision',next_revision);
 elsif action='approve-global' then
  perform rpg_private.dm_craft_entry_valid(p_payload->'entry');
  -- The owner explicitly edits/reviews a generalized entry; the feedback text
  -- is never copied into global Craft automatically.
  craft_result:=public.rpg_dm_craft(uid,'save',jsonb_build_object('requestId',rid,'expectedActivationRevision',p_payload->'expectedActivationRevision','entry',p_payload->'entry'));
  updated_proposal:=t.proposal||jsonb_build_object('status','approved','scope','global_craft','craftKey',p_payload#>>'{entry,key}');
 else
  updated_proposal:=t.proposal||jsonb_build_object('status','rejected','scope',null);
 end if;
 update rpg_private.turns set proposal=updated_proposal,updated_at=now() where id=opid;
 result:=jsonb_build_object('status','applied','proposal',updated_proposal);
 insert into rpg_private.dm_teach_commands(id,owner_id,campaign_id,request,result) values(rid,uid,cid,p_payload,result);
 return result;
end $$;
revoke all on function public.rpg_dm_teach(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.rpg_dm_teach(uuid,uuid,jsonb) to service_role;

-- Extend the existing claim after all accepted timeline/fence checks. A prior
-- claimed turn without Craft remains exactly as it was; never change a pending
-- operation's guidance. The private source is never in runtime_public_turn.
alter function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) rename to rpg_runtime_before_mega_dm;
create function public.rpg_runtime(p_owner_id uuid,p_campaign_id uuid,p_action text,p_payload jsonb default '{}',p_timeline jsonb default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb; opid uuid; had_source boolean; pinned jsonb; begin
 if p_action<>'claim' then return public.rpg_runtime_before_mega_dm(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline); end if;
 opid:=(p_payload->>'operationId')::uuid;
 select source is not null into had_source from rpg_private.turns where campaign_id=p_campaign_id and owner_id=p_owner_id and id=opid;
 result:=public.rpg_runtime_before_mega_dm(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);
 if result is null or coalesce(had_source,true) or result->'source' is null or result#>'{source,craft}' is not null then return result; end if;
 pinned:=rpg_private.dm_craft_snapshot(p_owner_id,p_campaign_id,opid);
 update rpg_private.turns set source=jsonb_set(source,'{craft}',pinned,true) where campaign_id=p_campaign_id and owner_id=p_owner_id and id=opid and source is not null and not (source ? 'craft');
 return jsonb_set(result,'{source,craft}',pinned,true);
end $$;
revoke all on function public.rpg_runtime_before_mega_dm(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated,service_role;
revoke all on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) to service_role;

revoke all on all functions in schema rpg_private from public,anon,authenticated;
commit;
