-- Phase 1 only: owner-authenticated storage and manual corrections. No gameplay executor.
-- Apply to an inspected target. This migration does not seed, replace, or delete campaign data.
begin;

create schema rpg_private;
revoke all on schema rpg_private from public, anon, authenticated;
alter default privileges in schema rpg_private revoke all on tables from public, anon, authenticated;
alter default privileges in schema rpg_private revoke all on functions from public, anon, authenticated;
alter default privileges in schema rpg_private revoke all on sequences from public, anon, authenticated;

create table rpg_private.owner_registry (
  singleton boolean primary key default true check (singleton),
  user_id uuid not null unique references auth.users(id),
  created_at timestamptz not null default now()
);
create function public.rpg_is_owner() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from rpg_private.owner_registry where user_id = (select auth.uid()));
$$;
revoke all on function public.rpg_is_owner() from public, anon;
grant execute on function public.rpg_is_owner() to authenticated;

create table public.rpg_campaigns (
  id uuid primary key, campaign_id uuid not null unique check (campaign_id = id),
  title text not null check (length(btrim(title)) between 1 and 200),
  subtitle text not null check (length(subtitle) <= 500),
  language text not null check (language in ('en','ru')),
  revision integer not null check (revision > 0), updated_at timestamptz not null default now()
);
create table public.rpg_preferences (
  owner_id uuid primary key references auth.users(id), language text not null check (language in ('en','ru')),
  "largeText" boolean not null, suggestions boolean not null,
  revision integer not null check (revision > 0), updated_at timestamptz not null default now()
);
create table public.rpg_settings (
  campaign_id uuid primary key references public.rpg_campaigns(id), values jsonb not null,
  revision integer not null check (revision > 0), updated_at timestamptz not null default now()
);
create table public.rpg_settings_revisions (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.rpg_campaigns(id),
  revision integer not null check (revision > 0), values jsonb not null, created_at timestamptz not null default now(),
  unique (campaign_id,revision)
);
create table public.rpg_documents (
  id uuid primary key, campaign_id uuid not null references public.rpg_campaigns(id),
  title text not null check (length(btrim(title)) between 1 and 200),
  status text not null check (status in ('canon','reference','archived')),
  body text not null check (length(body) <= 200000), current_version_id uuid not null,
  revision integer not null check (revision > 0), updated_at timestamptz not null default now(), unique(campaign_id,id)
);
create table public.rpg_document_versions (
  id uuid primary key, campaign_id uuid not null, document_id uuid not null,
  version integer not null check (version > 0), title text not null, status text not null, body text not null,
  restored_from uuid, created_at timestamptz not null default now(),
  unique(campaign_id,document_id,id), unique(campaign_id,document_id,version),
  foreign key(campaign_id,document_id) references public.rpg_documents(campaign_id,id) deferrable initially deferred,
  foreign key(campaign_id,document_id,restored_from) references public.rpg_document_versions(campaign_id,document_id,id)
);
alter table public.rpg_documents add constraint document_current_version_fk foreign key(campaign_id,id,current_version_id)
  references public.rpg_document_versions(campaign_id,document_id,id) deferrable initially deferred;

create function rpg_private.number_map(v jsonb) returns boolean language sql immutable set search_path = '' as $$
  select jsonb_typeof(v) = 'object' and length(v::text) <= 10000 and
    not exists(select 1 from jsonb_each(case when jsonb_typeof(v) = 'object' then v else '{}'::jsonb end) e
      where length(btrim(e.key)) not between 1 and 80 or jsonb_typeof(e.value) <> 'number' or
      case when jsonb_typeof(e.value) = 'number' then abs((e.value #>> '{}')::numeric) > 1000000 else false end);
$$;
create table public.rpg_entities (
  id uuid primary key, campaign_id uuid not null references public.rpg_campaigns(id),
  kind text not null check(kind in ('player','companion','npc','transport','mount')),
  name text not null check(length(btrim(name)) between 1 and 200), details text not null check(length(details) <= 20000),
  hp integer, max_hp integer, stats jsonb not null check(rpg_private.number_map(stats)),
  resources jsonb not null check(rpg_private.number_map(resources)), conditions jsonb not null check(jsonb_typeof(conditions) = 'array'),
  equipment_slots jsonb not null check(jsonb_typeof(equipment_slots) = 'array'),
  revision integer not null check (revision > 0), updated_at timestamptz not null default now(), unique(campaign_id,id),
  check ((hp is null and max_hp is null) or (hp is not null and max_hp is not null and hp between 0 and max_hp and max_hp <= 1000000))
);
create table public.rpg_storages (
  id uuid primary key, campaign_id uuid not null references public.rpg_campaigns(id),
  name text not null check(length(btrim(name)) between 1 and 200),
  kind text not null check(kind in ('player','companion','camp','transport')), entity_id uuid,
  revision integer not null check (revision > 0), updated_at timestamptz not null default now(), unique(campaign_id,id),
  foreign key(campaign_id,entity_id) references public.rpg_entities(campaign_id,id),
  check((kind = 'camp') = (entity_id is null))
);
create table public.rpg_items (
  id uuid primary key, campaign_id uuid not null references public.rpg_campaigns(id),
  name text not null check(length(btrim(name)) between 1 and 200), category text not null check(length(btrim(category)) between 1 and 120),
  quantity integer not null check(quantity between 0 and 1000000),
  description text not null check(length(description) <= 20000), mechanics text not null check(length(mechanics) <= 20000),
  owner_entity_id uuid, storage_id uuid not null, equipped_entity_id uuid, equipped_slot text,
  revision integer not null check (revision > 0), updated_at timestamptz not null default now(), unique(campaign_id,id),
  foreign key(campaign_id,owner_entity_id) references public.rpg_entities(campaign_id,id),
  foreign key(campaign_id,storage_id) references public.rpg_storages(campaign_id,id),
  foreign key(campaign_id,equipped_entity_id) references public.rpg_entities(campaign_id,id),
  check((equipped_entity_id is null and equipped_slot is null) or
    (equipped_entity_id is not null and equipped_slot is not null and length(btrim(equipped_slot)) between 1 and 80 and quantity > 0))
);
create unique index rpg_one_item_per_slot on public.rpg_items(campaign_id,equipped_entity_id,equipped_slot) where equipped_entity_id is not null;
create table public.rpg_sessions (
  id uuid primary key, campaign_id uuid not null references public.rpg_campaigns(id),
  title text not null check(length(btrim(title)) between 1 and 200), status text not null check(status in ('open','closed')),
  recap text not null check(length(recap) <= 20000), revision integer not null check(revision > 0), updated_at timestamptz not null default now(), unique(campaign_id,id)
);
create table public.rpg_scenes (
  id uuid primary key, campaign_id uuid not null references public.rpg_campaigns(id), session_id uuid not null,
  title text not null check(length(btrim(title)) between 1 and 200), body text not null check(length(body) <= 200000),
  role text not null check(role in ('narration','player','note')), settings_revision integer not null,
  created_at timestamptz not null default now(), revision integer not null check(revision > 0), updated_at timestamptz not null default now(),
  unique(campaign_id,id), unique(campaign_id,session_id,id),
  foreign key(campaign_id,session_id) references public.rpg_sessions(campaign_id,id),
  foreign key(campaign_id,settings_revision) references public.rpg_settings_revisions(campaign_id,revision)
);
create table public.rpg_quests (
  id uuid primary key, campaign_id uuid not null references public.rpg_campaigns(id),
  title text not null check(length(btrim(title)) between 1 and 200), description text not null check(length(description) <= 20000),
  status text not null check(status in ('open','complete','archived')), revision integer not null check(revision > 0), updated_at timestamptz not null default now(), unique(campaign_id,id)
);
create table public.rpg_locations (
  id uuid primary key, campaign_id uuid not null references public.rpg_campaigns(id),
  name text not null check(length(btrim(name)) between 1 and 200), description text not null check(length(description) <= 20000),
  status text not null check(status in ('known','visited')), revision integer not null check(revision > 0), updated_at timestamptz not null default now(), unique(campaign_id,id)
);
create table public.rpg_assets (
  id uuid primary key, campaign_id uuid not null references public.rpg_campaigns(id),
  title text not null check(length(btrim(title)) between 1 and 200), kind text not null check(kind in ('image','video','document')),
  storage_path text, description text not null check(length(description) <= 20000),
  revision integer not null check(revision > 0), updated_at timestamptz not null default now(), unique(campaign_id,id),
  check(storage_path is null or (length(storage_path) <= 500 and storage_path like campaign_id::text || '/%' and position('..' in storage_path) = 0 and position(chr(92) in storage_path) = 0))
);
create table public.rpg_public_state (
  campaign_id uuid primary key references public.rpg_campaigns(id), summary text not null check(length(summary) <= 20000),
  current_session_id uuid, current_scene_id uuid, current_location_id uuid,
  revision integer not null check(revision > 0), updated_at timestamptz not null default now(),
  foreign key(campaign_id,current_session_id) references public.rpg_sessions(campaign_id,id),
  foreign key(campaign_id,current_session_id,current_scene_id) references public.rpg_scenes(campaign_id,session_id,id),
  foreign key(campaign_id,current_location_id) references public.rpg_locations(campaign_id,id),
  check(current_scene_id is null or current_session_id is not null)
);

-- Unexposed private storage; no reader, writer, search view, or public RPC returns these contents.
create table rpg_private.dm_state (
  campaign_id uuid primary key references public.rpg_campaigns(id), contents jsonb not null default '{}',
  revision integer not null default 1 check(revision > 0), updated_at timestamptz not null default now()
);
create table rpg_private.mutation_receipts (
  request_id uuid primary key, owner_id uuid not null references auth.users(id), campaign_id uuid references public.rpg_campaigns(id),
  request jsonb not null, result jsonb not null, created_at timestamptz not null default now()
);

-- Inert foundations only. No application mutation is allow-listed for these structures.
create table public.rpg_conversations (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.rpg_campaigns(id),
  entity_id uuid not null, entries jsonb not null default '[]', created_at timestamptz not null default now(),
  foreign key(campaign_id,entity_id) references public.rpg_entities(campaign_id,id), unique(campaign_id,id)
);
create table public.rpg_rest_records (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.rpg_campaigns(id),
  kind text not null check(kind in ('short','long')), status text not null check(status in ('planned','interrupted','complete')),
  settings_revision integer not null, public_outcome jsonb not null default '{}', created_at timestamptz not null default now(),
  foreign key(campaign_id,settings_revision) references public.rpg_settings_revisions(campaign_id,revision), unique(campaign_id,id)
);
create table public.rpg_recipes (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.rpg_campaigns(id),
  name text not null, ingredients jsonb not null default '[]', effect_definition jsonb not null default '{}', unique(campaign_id,id)
);
create table public.rpg_effects (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.rpg_campaigns(id),
  entity_id uuid not null, recipe_id uuid, definition jsonb not null default '{}',
  foreign key(campaign_id,entity_id) references public.rpg_entities(campaign_id,id),
  foreign key(campaign_id,recipe_id) references public.rpg_recipes(campaign_id,id), unique(campaign_id,id)
);
create table public.rpg_encounters (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.rpg_campaigns(id),
  status text not null check(status in ('prepared','active','ended')), round integer not null default 1 check(round > 0),
  outcome text check(outcome in ('victory','escape','surrender','negotiation','objective-completion')),
  settings_revision integer not null, public_summary text not null default '',
  foreign key(campaign_id,settings_revision) references public.rpg_settings_revisions(campaign_id,revision), unique(campaign_id,id)
);
create table public.rpg_encounter_participants (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null, encounter_id uuid not null, entity_id uuid,
  public_name text not null, turn_order integer not null, public_position jsonb not null default '{}', public_resources jsonb not null default '{}',
  foreign key(campaign_id,encounter_id) references public.rpg_encounters(campaign_id,id),
  foreign key(campaign_id,entity_id) references public.rpg_entities(campaign_id,id), unique(campaign_id,id), unique(campaign_id,encounter_id,id),
  unique(campaign_id,encounter_id,turn_order)
);
create table public.rpg_pending_actions (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null, encounter_id uuid not null, participant_id uuid not null,
  status text not null check(status in ('proposed','confirmed','resolved','cancelled')), public_proposal jsonb not null,
  foreign key(campaign_id,encounter_id,participant_id) references public.rpg_encounter_participants(campaign_id,encounter_id,id), unique(campaign_id,id)
);

create function rpg_private.immutable_history() returns trigger language plpgsql set search_path = '' as $$
begin raise exception 'rpg_immutable_history' using errcode = '42501'; end;
$$;
create trigger immutable_document_history before update or delete on public.rpg_document_versions for each row execute function rpg_private.immutable_history();
create trigger immutable_settings_history before update or delete on public.rpg_settings_revisions for each row execute function rpg_private.immutable_history();

-- Database validation also protects direct RPC calls, independently of the TypeScript validator.
create function rpg_private.fields(p jsonb, required text[], optional text[] default '{}') returns void language plpgsql set search_path = '' as $$
begin
  if jsonb_typeof(p) is distinct from 'object' or not (p ?& required) or
    exists(select 1 from jsonb_object_keys(p) k where not (k = any(required || optional))) then
    raise exception 'rpg_validation' using errcode = '22023';
  end if;
end;
$$;
create function rpg_private.assert(ok boolean) returns void language plpgsql set search_path = '' as $$
begin if ok is distinct from true then raise exception 'rpg_validation' using errcode = '22023'; end if; end;
$$;
create function rpg_private.settings_valid(s jsonb, cid uuid) returns void language plpgsql set search_path = '' as $$
declare d jsonb := s->'difficulty'; r jsonb := s->'rulesSystem'; k text;
begin
  perform rpg_private.fields(s,array['campaign_id','language','rulesSystem','difficulty','storyStructure','playerRole','worldAutonomy','checkFrequency','dicePresentation','interactiveDice','showDc','visualStyle','frameRatio','videoDuration','narrativeStyle']);
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
end;
$$;

create function public.rpg_apply_mutation(p_request_id uuid,p_operation text,p_campaign_id uuid,p_expected_revision integer,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid(); rid uuid; cid uuid := p_campaign_id; ver uuid; old jsonb; rowdata jsonb; result jsonb;
  req jsonb; receipt rpg_private.mutation_receipts%rowtype; settings jsonb; rev integer;
  tab text; required text[]; field text; slot jsonb; entity jsonb; cols text; vals text; assignments text; affected integer;
begin
  if uid is null or not public.rpg_is_owner() then raise exception 'rpg_forbidden' using errcode = '42501'; end if;
  perform rpg_private.assert(p_request_id is not null and p_expected_revision >= 0 and p_expected_revision < 2147483647 and jsonb_typeof(p_payload) = 'object' and octet_length(p_payload::text) <= 1000000);
  req := jsonb_build_object('operation',p_operation,'campaign_id',cid,'expected_revision',p_expected_revision,'payload',p_payload);
  perform pg_advisory_xact_lock(hashtextextended(p_request_id::text,0));
  select * into receipt from rpg_private.mutation_receipts where request_id = p_request_id;
  if found then
    if receipt.owner_id <> uid or receipt.request <> req then raise exception 'rpg_conflict'; end if;
    return receipt.result;
  end if;
  if p_operation in ('campaign.create','preferences.save') then
    perform rpg_private.assert(cid is null);
    perform 1 from rpg_private.owner_registry where user_id = uid for update;
  else
    if cid is null then raise exception 'rpg_validation' using errcode = '22023'; end if;
    perform 1 from public.rpg_campaigns where id = cid for update;
    if not found then raise exception 'rpg_not_found'; end if;
  end if;
  if p_operation = 'campaign.create' then
    perform rpg_private.fields(p_payload,array['title','subtitle','language']);
    perform rpg_private.assert(p_expected_revision = 0 and jsonb_typeof(p_payload->'title') = 'string' and jsonb_typeof(p_payload->'subtitle') = 'string');
    cid := gen_random_uuid(); rid := cid; rev := 1;
    insert into public.rpg_campaigns(id,campaign_id,title,subtitle,language,revision) values(cid,cid,p_payload->>'title',p_payload->>'subtitle',p_payload->>'language',rev);
    settings := jsonb_build_object('campaign_id',cid,'language',p_payload->>'language','rulesSystem',jsonb_build_object('id','custom','label','Custom rules','enemyHpScaling',true,'enemyDamageScaling',true),
      'difficulty','{"preset":"medium","shortRestSupplyCost":0,"longRestSupplyCost":1,"enemyHpMultiplier":1,"enemyDamageMultiplier":1,"rerolls":"limited","rerollsPerSession":2,"defeat":"injuries","recovery":"standard","scarcity":"standard"}'::jsonb,
      'storyStructure','balanced','playerRole','one-of-many','worldAutonomy','moderate','checkFrequency','balanced','dicePresentation','key-rolls','interactiveDice',true,'showDc',false,'visualStyle','Cinematic noir','frameRatio','16:9','videoDuration','10 seconds','narrativeStyle','Literary');
    insert into public.rpg_settings(campaign_id,values,revision) values(cid,settings,1);
    insert into public.rpg_settings_revisions(campaign_id,values,revision) values(cid,settings,1);
    insert into public.rpg_public_state(campaign_id,summary,revision) values(cid,'',1);
  elsif p_operation = 'preferences.save' then
    perform rpg_private.fields(p_payload,array['language','largeText','suggestions']);
    perform rpg_private.assert(jsonb_typeof(p_payload->'largeText') = 'boolean' and jsonb_typeof(p_payload->'suggestions') = 'boolean');
    select revision into rev from public.rpg_preferences where owner_id = uid for update;
    if coalesce(rev,0) <> p_expected_revision then raise exception 'rpg_conflict'; end if;
    rev := coalesce(rev,0)+1; rid := uid;
    insert into public.rpg_preferences(owner_id,language,"largeText",suggestions,revision) values(uid,p_payload->>'language',(p_payload->>'largeText')::boolean,(p_payload->>'suggestions')::boolean,rev)
      on conflict(owner_id) do update set language = excluded.language,"largeText" = excluded."largeText",suggestions = excluded.suggestions,revision = excluded.revision,updated_at = now();
  elsif p_operation = 'campaign.save' then
    perform rpg_private.fields(p_payload,array['title','subtitle']);
    perform rpg_private.assert(jsonb_typeof(p_payload->'title') = 'string' and jsonb_typeof(p_payload->'subtitle') = 'string');
    select revision into rev from public.rpg_campaigns where id = cid;
    if rev <> p_expected_revision then raise exception 'rpg_conflict'; end if;
    rev := rev+1; rid := cid;
    update public.rpg_campaigns set title = p_payload->>'title',subtitle = p_payload->>'subtitle',revision = rev,updated_at = now() where id = cid;
  elsif p_operation = 'settings.save' then
    perform rpg_private.settings_valid(p_payload,cid);
    select revision into rev from public.rpg_settings where campaign_id = cid;
    if rev <> p_expected_revision then raise exception 'rpg_conflict'; end if;
    rev := rev+1; rid := cid;
    update public.rpg_settings set values = p_payload,revision = rev,updated_at = now() where campaign_id = cid;
    insert into public.rpg_settings_revisions(campaign_id,values,revision) values(cid,p_payload,rev);
    -- Campaign language is denormalized only for campaign selection; updating it never rewrites scenes.
    update public.rpg_campaigns set language = p_payload->>'language',updated_at = now() where id = cid;
  elsif p_operation in ('document.save','document.restore') then
    if p_operation = 'document.save' then
      perform rpg_private.fields(p_payload,array['title','status','body'],array['id']);
      perform rpg_private.assert(jsonb_typeof(p_payload->'title') = 'string' and jsonb_typeof(p_payload->'body') = 'string');
    else perform rpg_private.fields(p_payload,array['id','versionId']); end if;
    rid := coalesce((p_payload->>'id')::uuid,gen_random_uuid());
    select to_jsonb(d) into old from public.rpg_documents d where id = rid and campaign_id = cid for update;
    if coalesce((old->>'revision')::integer,0) <> p_expected_revision then raise exception 'rpg_conflict'; end if;
    if p_expected_revision > 0 and old is null then raise exception 'rpg_not_found'; end if;
    rev := p_expected_revision+1; ver := gen_random_uuid();
    rowdata := p_payload;
    if p_operation = 'document.restore' then
      perform rpg_private.assert(old is not null);
      select jsonb_build_object('title',title,'status',status,'body',body) into rowdata from public.rpg_document_versions where id = (p_payload->>'versionId')::uuid and campaign_id = cid and document_id = rid;
      if rowdata is null then raise exception 'rpg_not_found'; end if;
    end if;
    insert into public.rpg_documents(id,campaign_id,title,status,body,current_version_id,revision) values(rid,cid,rowdata->>'title',rowdata->>'status',rowdata->>'body',ver,rev)
      on conflict(id) do update set title = excluded.title,status = excluded.status,body = excluded.body,current_version_id = excluded.current_version_id,revision = excluded.revision,updated_at = now()
      where public.rpg_documents.campaign_id = cid;
    if not found then raise exception 'rpg_validation' using errcode = '22023'; end if;
    insert into public.rpg_document_versions(id,campaign_id,document_id,version,title,status,body,restored_from)
      values(ver,cid,rid,rev,rowdata->>'title',rowdata->>'status',rowdata->>'body',case when p_operation = 'document.restore' then (p_payload->>'versionId')::uuid end);
  elsif p_operation = 'state.save' then
    perform rpg_private.fields(p_payload,array['summary','current_session_id','current_scene_id','current_location_id']);
    perform rpg_private.assert(jsonb_typeof(p_payload->'summary') = 'string');
    select revision into rev from public.rpg_public_state where campaign_id = cid;
    if rev <> p_expected_revision then raise exception 'rpg_conflict'; end if;
    rev := rev+1; rid := cid;
    update public.rpg_public_state set summary = p_payload->>'summary',current_session_id = (p_payload->>'current_session_id')::uuid,current_scene_id = (p_payload->>'current_scene_id')::uuid,current_location_id = (p_payload->>'current_location_id')::uuid,revision = rev,updated_at = now() where campaign_id = cid;
  else
    -- Table names and writable columns originate ONLY from this fixed operation allowlist.
    case p_operation
      when 'entity.save' then tab := 'rpg_entities'; required := array['kind','name','details','hp','max_hp','stats','resources','conditions','equipment_slots'];
      when 'storage.save' then tab := 'rpg_storages'; required := array['name','kind','entity_id'];
      when 'item.save' then tab := 'rpg_items'; required := array['name','category','quantity','description','mechanics','owner_entity_id','storage_id','equipped_entity_id','equipped_slot'];
      when 'session.save' then tab := 'rpg_sessions'; required := array['title','status','recap'];
      when 'scene.save' then tab := 'rpg_scenes'; required := array['session_id','title','body','role'];
      when 'quest.save' then tab := 'rpg_quests'; required := array['title','description','status'];
      when 'location.save' then tab := 'rpg_locations'; required := array['name','description','status'];
      when 'asset.save' then tab := 'rpg_assets'; required := array['title','kind','storage_path','description'];
      else raise exception 'rpg_validation' using errcode = '22023';
    end case;
    perform rpg_private.fields(p_payload,required,array['id']);
    foreach field in array array['title','name','details','description','mechanics','recap','body','category'] loop
      if p_payload ? field then perform rpg_private.assert(jsonb_typeof(p_payload->field) = 'string'); end if;
    end loop;
    rid := coalesce((p_payload->>'id')::uuid,gen_random_uuid());
    execute format('select to_jsonb(t) from public.%I t where id=$1 and campaign_id=$2 for update',tab) into old using rid,cid;
    if coalesce((old->>'revision')::integer,0) <> p_expected_revision then raise exception 'rpg_conflict'; end if;
    rev := p_expected_revision+1;
    rowdata := p_payload || jsonb_build_object('id',rid,'campaign_id',cid,'revision',rev,'updated_at',now());
    if p_operation = 'scene.save' then
      if old is not null then
        perform rpg_private.assert(p_payload->>'session_id' = old->>'session_id');
        rowdata := rowdata || jsonb_build_object('created_at',old->'created_at','settings_revision',old->'settings_revision');
      else
        rowdata := rowdata || jsonb_build_object('created_at',now(),'settings_revision',(select revision from public.rpg_settings where campaign_id=cid));
      end if;
    elsif p_operation = 'entity.save' then
      perform rpg_private.assert(jsonb_typeof(p_payload->'equipment_slots') = 'array' and jsonb_array_length(p_payload->'equipment_slots') <= 30 and jsonb_typeof(p_payload->'conditions') = 'array' and jsonb_array_length(p_payload->'conditions') <= 50);
      perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(p_payload->'conditions') c where jsonb_typeof(c) <> 'string' or length(btrim(c #>> '{}')) not between 1 and 120));
      for slot in select value from jsonb_array_elements(p_payload->'equipment_slots') loop
        perform rpg_private.fields(slot,array['id','label','accepts']);
        perform rpg_private.assert(jsonb_typeof(slot->'id') = 'string' and length(btrim(slot->>'id')) between 1 and 80 and jsonb_typeof(slot->'label') = 'string' and length(btrim(slot->>'label')) between 1 and 120 and jsonb_typeof(slot->'accepts') = 'array' and jsonb_array_length(slot->'accepts') <= 50);
        perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(slot->'accepts') a where jsonb_typeof(a) <> 'string' or length(btrim(a #>> '{}')) not between 1 and 120));
      end loop;
      perform rpg_private.assert((select count(*) = count(distinct s->>'id') from jsonb_array_elements(p_payload->'equipment_slots') s));
      perform rpg_private.assert(not exists(select 1 from public.rpg_items i where i.campaign_id=cid and i.equipped_entity_id=rid and not exists(select 1 from jsonb_array_elements(p_payload->'equipment_slots') s where s->>'id'=i.equipped_slot and s->'accepts' ? i.category)));
      perform rpg_private.assert(not exists(select 1 from public.rpg_storages s where s.campaign_id=cid and s.entity_id=rid and not ((s.kind='transport' and p_payload->>'kind' in ('transport','mount')) or s.kind=p_payload->>'kind')));
      foreach field in array array['hp','max_hp'] loop
        if p_payload->field <> 'null'::jsonb then perform rpg_private.assert(jsonb_typeof(p_payload->field) = 'number' and mod((p_payload->>field)::numeric,1)=0); end if;
      end loop;
    elsif p_operation = 'storage.save' then
      perform rpg_private.assert(not exists(select 1 from public.rpg_items where campaign_id=cid and storage_id=rid and equipped_entity_id is not null and equipped_entity_id::text is distinct from p_payload->>'entity_id'));
      if p_payload->>'entity_id' is not null then
        select to_jsonb(e) into entity from public.rpg_entities e where campaign_id=cid and id=(p_payload->>'entity_id')::uuid;
        perform rpg_private.assert(entity is not null and ((p_payload->>'kind'='transport' and entity->>'kind' in ('transport','mount')) or p_payload->>'kind'=entity->>'kind'));
      end if;
    elsif p_operation = 'item.save' then
      perform rpg_private.assert(jsonb_typeof(p_payload->'quantity')='number' and mod((p_payload->>'quantity')::numeric,1)=0);
      if p_payload->>'equipped_entity_id' is not null then
        select to_jsonb(e) into entity from public.rpg_entities e where campaign_id=cid and id=(p_payload->>'equipped_entity_id')::uuid;
        perform rpg_private.assert(entity is not null and exists(select 1 from jsonb_array_elements(entity->'equipment_slots') s where s->>'id'=p_payload->>'equipped_slot' and s->'accepts' ? (p_payload->>'category')));
        perform rpg_private.assert(exists(select 1 from public.rpg_storages where campaign_id=cid and id=(p_payload->>'storage_id')::uuid and entity_id=(p_payload->>'equipped_entity_id')::uuid));
      end if;
    end if;
    select string_agg(format('%I',k),','),string_agg(format('x.%I',k),','),string_agg(format('%I=excluded.%I',k,k),',') into cols,vals,assignments from jsonb_object_keys(rowdata) k;
    execute format('insert into public.%I(%s) select %s from jsonb_populate_record(null::public.%I,$1) x on conflict(id) do update set %s where public.%I.campaign_id=$2',tab,cols,vals,tab,assignments,tab) using rowdata,cid;
    get diagnostics affected = row_count;
    if affected <> 1 then raise exception 'rpg_validation' using errcode = '22023'; end if;
  end if;
  result := jsonb_build_object('id',rid,'revision',rev);
  if cid is not null then result := result || jsonb_build_object('campaign_id',cid); end if;
  insert into rpg_private.mutation_receipts(request_id,owner_id,campaign_id,request,result) values(p_request_id,uid,cid,req,result);
  return result;
end;
$$;
revoke all on function public.rpg_apply_mutation(uuid,text,uuid,integer,jsonb) from public, anon;
grant execute on function public.rpg_apply_mutation(uuid,text,uuid,integer,jsonb) to authenticated;

-- RLS applies even to direct browser Data API requests. No INSERT/UPDATE/DELETE grants or policies.
do $$ declare t text; begin
  foreach t in array array['rpg_campaigns','rpg_preferences','rpg_settings','rpg_settings_revisions','rpg_documents','rpg_document_versions','rpg_entities','rpg_storages','rpg_items','rpg_sessions','rpg_scenes','rpg_public_state','rpg_quests','rpg_locations','rpg_assets','rpg_conversations','rpg_rest_records','rpg_recipes','rpg_effects','rpg_encounters','rpg_encounter_participants','rpg_pending_actions'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from public,anon,authenticated',t);
    execute format('grant select on public.%I to authenticated',t);
    execute format('create policy owner_read on public.%I for select to authenticated using ((select public.rpg_is_owner()))',t);
  end loop;
end $$;
revoke all on all tables in schema rpg_private from public,anon,authenticated;
revoke all on all functions in schema rpg_private from public,anon,authenticated;
revoke all on all sequences in schema rpg_private from public,anon,authenticated;
alter table rpg_private.owner_registry enable row level security;
alter table rpg_private.dm_state enable row level security;
alter table rpg_private.mutation_receipts enable row level security;
commit;
