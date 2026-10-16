-- Stage V — pictures: a world or campaign style with versions and a reference
-- image, pictures (live frames of turns and anchors of people, places, items,
-- holdings) with versions bound to the timeline, and campaign picture settings
-- (frames mode, quality tier, daily cap, the autopilot moved off the device).
-- Additive only: nothing earlier changes. Pictures only show what the records
-- remember; a row never decides anything in the game. Logic lives in
-- TypeScript; this file keeps the invariants (ownership, bounds, one active
-- style per scope, append-only versions, status transitions, the daily cap).
begin;

create table rpg_private.picture_styles (
  id uuid primary key,
  owner_id uuid not null references auth.users(id),
  scope text not null check (scope in ('world','campaign')),
  scope_id uuid not null,
  version integer not null check (version > 0),
  preset text not null check (preset ~ '^[a-z][a-z0-9_-]{0,39}$'),
  label text not null check (length(btrim(label)) between 1 and 120),
  style_text text not null check (length(style_text) <= 2000),
  reference_path text check (reference_path is null or (length(reference_path) <= 500 and reference_path like 'styles/%' and position('..' in reference_path) = 0 and position(chr(92) in reference_path) = 0)),
  reference_sha256 text check (reference_sha256 is null or reference_sha256 ~ '^[a-f0-9]{64}$'),
  reference_content_type text check (reference_content_type is null or reference_content_type in ('image/png','image/jpeg','image/webp')),
  active boolean not null default false,
  created_at timestamptz not null default now(),
  check ((reference_path is null) = (reference_sha256 is null) and (reference_path is null) = (reference_content_type is null)),
  unique (owner_id, scope, scope_id, version)
);
create unique index picture_styles_one_active on rpg_private.picture_styles(owner_id, scope, scope_id) where active;
alter table rpg_private.picture_styles enable row level security;
revoke all on rpg_private.picture_styles from public, anon, authenticated;

create table rpg_private.pictures (
  id uuid primary key,
  owner_id uuid not null references auth.users(id),
  campaign_id uuid not null references public.rpg_campaigns(id),
  kind text not null check (kind in ('frame','anchor')),
  subject_kind text not null check (subject_kind in ('turn','entity','item','location')),
  subject_id uuid not null,
  composition text not null check (composition in ('frame','portrait','figure','item','location','holding')),
  timeline jsonb not null,
  version integer not null check (version > 0),
  status text not null check (status in ('queued','generating','ready','failed')),
  hidden boolean not null default false,
  provider text not null check (provider = 'fal'),
  model text not null check (length(model) between 1 and 80),
  tier text not null check (tier in ('fast','quality')),
  trigger text not null check (trigger in ('live','committed','key_moment','redraw','autopilot','restyle','manual')),
  style_version_id uuid references rpg_private.picture_styles(id),
  shot jsonb,
  prompt text not null check (length(prompt) between 1 and 8000),
  reference_ids jsonb not null default '[]' check (jsonb_typeof(reference_ids) = 'array' and jsonb_array_length(reference_ids) <= 8),
  storage_path text,
  content_type text check (content_type is null or content_type in ('image/png','image/jpeg','image/webp')),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  bytes integer check (bytes is null or bytes >= 0),
  sha256 text check (sha256 is null or sha256 ~ '^[a-f0-9]{64}$'),
  cost_usd_micros integer not null default 0 check (cost_usd_micros >= 0),
  request_id text check (request_id is null or length(request_id) <= 80),
  elapsed_ms integer check (elapsed_ms is null or elapsed_ms >= 0),
  error text check (error is null or length(error) <= 200),
  created_at timestamptz not null default now(),
  ready_at timestamptz,
  check (kind = case when subject_kind = 'turn' then 'frame' else 'anchor' end),
  check (composition = 'frame' or subject_kind <> 'turn'),
  check (storage_path is null or (length(storage_path) <= 500 and storage_path like campaign_id::text || '/pictures/%' and position('..' in storage_path) = 0 and position(chr(92) in storage_path) = 0)),
  check (status <> 'ready' or (storage_path is not null and sha256 is not null and content_type is not null and width is not null and height is not null and bytes is not null and ready_at is not null)),
  check (status not in ('queued','generating') or (storage_path is null and ready_at is null)),
  check (status <> 'failed' or (storage_path is null and ready_at is null and error is not null)),
  unique (campaign_id, kind, subject_kind, subject_id, composition, version)
);
create index pictures_campaign_created on rpg_private.pictures(campaign_id, created_at);
alter table rpg_private.pictures enable row level security;
revoke all on rpg_private.pictures from public, anon, authenticated;

create table rpg_private.picture_settings (
  campaign_id uuid primary key references public.rpg_campaigns(id),
  frames text not null default 'every' check (frames in ('every','key','off')),
  quality text not null default 'fast' check (quality in ('fast','quality')),
  daily_cap integer not null default 60 check (daily_cap between 0 and 500),
  autopilot jsonb not null default '{"enabled":false,"items":true,"portraits":true,"figures":true,"places":true,"holdings":true,"autoAccept":true,"provider":"fal"}',
  revision integer not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);
alter table rpg_private.picture_settings enable row level security;
revoke all on rpg_private.picture_settings from public, anon, authenticated;

-- Versions are history: a style row never changes except its active flag, and
-- a finished picture never changes except its hidden flag. Nothing is deleted.
create function rpg_private.picture_style_immutable() returns trigger
language plpgsql set search_path='' as $$
begin
 if tg_op = 'DELETE' or (to_jsonb(old) - 'active') <> (to_jsonb(new) - 'active') then raise exception 'rpg_conflict'; end if;
 return new;
end $$;
create trigger picture_style_immutable before update or delete on rpg_private.picture_styles for each row execute function rpg_private.picture_style_immutable();

create function rpg_private.picture_immutable() returns trigger
language plpgsql set search_path='' as $$
begin
 if tg_op = 'DELETE' then raise exception 'rpg_conflict'; end if;
 if old.status in ('ready','failed') and (to_jsonb(old) - 'hidden') <> (to_jsonb(new) - 'hidden') then raise exception 'rpg_conflict'; end if;
 if old.status = 'generating' and new.status = 'queued' then raise exception 'rpg_conflict'; end if;
 if (to_jsonb(old) - 'status' - 'hidden' - 'storage_path' - 'content_type' - 'width' - 'height' - 'bytes' - 'sha256' - 'cost_usd_micros' - 'request_id' - 'elapsed_ms' - 'error' - 'ready_at' - 'model')
    <> (to_jsonb(new) - 'status' - 'hidden' - 'storage_path' - 'content_type' - 'width' - 'height' - 'bytes' - 'sha256' - 'cost_usd_micros' - 'request_id' - 'elapsed_ms' - 'error' - 'ready_at' - 'model') then raise exception 'rpg_conflict'; end if;
 return new;
end $$;
create trigger picture_immutable before update or delete on rpg_private.pictures for each row execute function rpg_private.picture_immutable();

create function rpg_private.picture_style_json(s rpg_private.picture_styles) returns jsonb
language sql immutable set search_path='' as $$
 select jsonb_build_object('id',s.id,'scope',s.scope,'scopeId',s.scope_id,'version',s.version,'preset',s.preset,'label',s.label,
  'styleText',s.style_text,'hasReference',s.reference_path is not null,'active',s.active,'createdAt',s.created_at)
$$;

-- The player-visible projection: never the shot or the prompt.
create function rpg_private.picture_json(p rpg_private.pictures) returns jsonb
language sql immutable set search_path='' as $$
 select jsonb_build_object('id',p.id,'kind',p.kind,'subjectKind',p.subject_kind,'subjectId',p.subject_id,'composition',p.composition,
  'timeline',p.timeline,'version',p.version,'status',p.status,'hidden',p.hidden,'model',p.model,'tier',p.tier,'trigger',p.trigger,
  'styleVersionId',p.style_version_id,'width',p.width,'height',p.height,'costUsdMicros',p.cost_usd_micros,'elapsedMs',p.elapsed_ms,
  'error',p.error,'createdAt',p.created_at,'readyAt',p.ready_at)
$$;

create function rpg_private.picture_settings_json(cid uuid) returns jsonb
language sql stable set search_path='' as $$
 select coalesce((select jsonb_build_object('frames',s.frames,'quality',s.quality,'dailyCap',s.daily_cap,'autopilot',s.autopilot,'revision',s.revision)
   from rpg_private.picture_settings s where s.campaign_id=cid),
  jsonb_build_object('frames','every','quality','fast','dailyCap',60,
   'autopilot','{"enabled":false,"items":true,"portraits":true,"figures":true,"places":true,"holdings":true,"autoAccept":true,"provider":"fal"}'::jsonb,'revision',0))
$$;

create function rpg_private.picture_autopilot_valid(v jsonb) returns void
language plpgsql immutable set search_path='' as $$
declare k text; begin
 perform rpg_private.fields(v,array['enabled','items','portraits','figures','places','holdings','autoAccept','provider']);
 foreach k in array array['enabled','items','portraits','figures','places','holdings','autoAccept'] loop
  perform rpg_private.assert(jsonb_typeof(v->k)='boolean');
 end loop;
 perform rpg_private.assert(v->>'provider' in ('fal','openai'));
end $$;

-- Today's pictures of the campaign (UTC day): every attempt counts, so a crash
-- never repeats a paid request past the cap.
create function rpg_private.picture_today(cid uuid) returns jsonb
language sql stable set search_path='' as $$
 select jsonb_build_object('count',count(*),'costUsdMicros',coalesce(sum(p.cost_usd_micros),0))
 from rpg_private.pictures p where p.campaign_id=cid and p.created_at >= date_trunc('day', now() at time zone 'utc') at time zone 'utc'
$$;

create function public.rpg_pictures(p_owner_id uuid, p_campaign_id uuid, p_action text, p_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare
 settings jsonb; wid uuid; sid uuid; s rpg_private.picture_styles%rowtype; p rpg_private.pictures%rowtype;
 ver integer; cap integer; today jsonb; o jsonb; scope text; k text;
begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id)
   then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id for update;
 if not found then raise exception 'rpg_not_found'; end if;
 wid:=(rpg_private.adventure_binding(p_campaign_id)->>'worldId')::uuid;
 settings:=rpg_private.picture_settings_json(p_campaign_id);

 if p_action='read' then
  perform rpg_private.fields(p_payload,'{}');
  return jsonb_build_object(
   'campaignId',p_campaign_id,'worldId',wid,'settings',settings,'today',rpg_private.picture_today(p_campaign_id),
   'styles',coalesce((select jsonb_agg(rpg_private.picture_style_json(x) order by x.scope,x.version) from rpg_private.picture_styles x
     where x.owner_id=p_owner_id and ((x.scope='campaign' and x.scope_id=p_campaign_id) or (wid is not null and x.scope='world' and x.scope_id=wid))),'[]'),
   'pictures',coalesce((select jsonb_agg(rpg_private.picture_json(x) order by x.created_at,x.id) from (
     select * from rpg_private.pictures y where y.campaign_id=p_campaign_id and y.kind='anchor'
     union all
     (select * from rpg_private.pictures y where y.campaign_id=p_campaign_id and y.kind='frame' order by y.created_at desc limit 600)
   ) x),'[]'));
 end if;

 if p_action='settings.save' then
  perform rpg_private.fields(p_payload,array['expectedRevision','frames','quality','dailyCap','autopilot']);
  if (p_payload->>'expectedRevision')::integer<>(settings->>'revision')::integer then raise exception 'rpg_conflict'; end if;
  perform rpg_private.assert(p_payload->>'frames' in ('every','key','off') and p_payload->>'quality' in ('fast','quality')
    and jsonb_typeof(p_payload->'dailyCap')='number' and (p_payload->>'dailyCap')::numeric between 0 and 500 and mod((p_payload->>'dailyCap')::numeric,1)=0);
  perform rpg_private.picture_autopilot_valid(p_payload->'autopilot');
  insert into rpg_private.picture_settings(campaign_id,frames,quality,daily_cap,autopilot,revision)
   values(p_campaign_id,p_payload->>'frames',p_payload->>'quality',(p_payload->>'dailyCap')::integer,p_payload->'autopilot',1)
   on conflict(campaign_id) do update set frames=excluded.frames,quality=excluded.quality,daily_cap=excluded.daily_cap,
    autopilot=excluded.autopilot,revision=rpg_private.picture_settings.revision+1,updated_at=now();
  return rpg_private.picture_settings_json(p_campaign_id);
 end if;

 if p_action='style.save' then
  perform rpg_private.fields(p_payload,array['id','scope','preset','label','styleText','reference','activate']);
  scope:=p_payload->>'scope';
  perform rpg_private.assert(scope in ('world','campaign') and jsonb_typeof(p_payload->'activate')='boolean'
    and jsonb_typeof(p_payload->'styleText')='string' and length(p_payload->>'styleText')<=2000
    and jsonb_typeof(p_payload->'label')='string' and length(btrim(p_payload->>'label')) between 1 and 120
    and jsonb_typeof(p_payload->'preset')='string');
  if scope='world' then
   if wid is null then raise exception 'rpg_conflict'; end if;
   sid:=wid;
  else sid:=p_campaign_id; end if;
  if p_payload->'reference'<>'null'::jsonb then
   perform rpg_private.fields(p_payload->'reference',array['storagePath','sha256','contentType']);
  end if;
  select coalesce(max(x.version),0)+1 into ver from rpg_private.picture_styles x where x.owner_id=p_owner_id and x.scope=scope and x.scope_id=sid;
  if (p_payload->>'activate')::boolean then
   update rpg_private.picture_styles x set active=false where x.owner_id=p_owner_id and x.scope=scope and x.scope_id=sid and x.active;
  end if;
  insert into rpg_private.picture_styles(id,owner_id,scope,scope_id,version,preset,label,style_text,reference_path,reference_sha256,reference_content_type,active)
   values((p_payload->>'id')::uuid,p_owner_id,scope,sid,ver,p_payload->>'preset',btrim(p_payload->>'label'),p_payload->>'styleText',
    p_payload#>>'{reference,storagePath}',p_payload#>>'{reference,sha256}',p_payload#>>'{reference,contentType}',(p_payload->>'activate')::boolean)
   returning * into s;
  return rpg_private.picture_style_json(s);
 end if;

 if p_action='style.activate' then
  perform rpg_private.fields(p_payload,array['styleId']);
  select * into s from rpg_private.picture_styles x where x.id=(p_payload->>'styleId')::uuid and x.owner_id=p_owner_id
    and ((x.scope='campaign' and x.scope_id=p_campaign_id) or (wid is not null and x.scope='world' and x.scope_id=wid));
  if not found then raise exception 'rpg_not_found'; end if;
  update rpg_private.picture_styles x set active=false where x.owner_id=p_owner_id and x.scope=s.scope and x.scope_id=s.scope_id and x.active and x.id<>s.id;
  update rpg_private.picture_styles x set active=true where x.id=s.id returning x.* into s;
  return rpg_private.picture_style_json(s);
 end if;

 if p_action='style.clear' then
  -- No campaign override any more: the world style (or the campaign's visual style text) applies.
  perform rpg_private.fields(p_payload,array['scope']);
  scope:=p_payload->>'scope';
  perform rpg_private.assert(scope in ('world','campaign'));
  sid:=case when scope='world' then wid else p_campaign_id end;
  if sid is null then raise exception 'rpg_conflict'; end if;
  update rpg_private.picture_styles x set active=false where x.owner_id=p_owner_id and x.scope=scope and x.scope_id=sid and x.active;
  return 'null'::jsonb;
 end if;

 if p_action='picture.create' then
  perform rpg_private.fields(p_payload,array['id','kind','subjectKind','subjectId','composition','timeline','tier','trigger','model','styleVersionId','shot','prompt','referenceIds']);
  perform rpg_private.timeline_assert(p_campaign_id,p_payload->'timeline');
  perform rpg_private.assert(jsonb_typeof(p_payload->'prompt')='string' and jsonb_typeof(p_payload->'referenceIds')='array'
    and (p_payload->'shot'='null'::jsonb or jsonb_typeof(p_payload->'shot')='object'));
  if p_payload->>'subjectKind'='turn' then
   if not exists(select 1 from rpg_private.turns t where t.campaign_id=p_campaign_id and t.id=(p_payload->>'subjectId')::uuid) then raise exception 'rpg_not_found'; end if;
  elsif p_payload->>'subjectKind'='entity' then
   if not exists(select 1 from public.rpg_entities e where e.campaign_id=p_campaign_id and e.id=(p_payload->>'subjectId')::uuid) then raise exception 'rpg_not_found'; end if;
  elsif p_payload->>'subjectKind'='item' then
   if not exists(select 1 from public.rpg_items i where i.campaign_id=p_campaign_id and i.id=(p_payload->>'subjectId')::uuid) then raise exception 'rpg_not_found'; end if;
  else
   if not exists(select 1 from public.rpg_locations l where l.campaign_id=p_campaign_id and l.id=(p_payload->>'subjectId')::uuid and l.status in ('known','visited')) then raise exception 'rpg_not_found'; end if;
  end if;
  if p_payload->'styleVersionId'<>'null'::jsonb and not exists(select 1 from rpg_private.picture_styles x where x.id=(p_payload->>'styleVersionId')::uuid and x.owner_id=p_owner_id) then raise exception 'rpg_conflict'; end if;
  for k in select jsonb_array_elements_text(p_payload->'referenceIds') loop
   if not exists(select 1 from rpg_private.pictures r where r.id=k::uuid and r.campaign_id=p_campaign_id and r.status='ready')
      and not exists(select 1 from rpg_private.picture_styles r where r.id=k::uuid and r.owner_id=p_owner_id and r.reference_path is not null) then raise exception 'rpg_conflict'; end if;
  end loop;
  cap:=(settings->>'dailyCap')::integer;
  today:=rpg_private.picture_today(p_campaign_id);
  if (today->>'count')::integer>=cap then raise exception 'rpg_conflict'; end if;
  select coalesce(max(x.version),0)+1 into ver from rpg_private.pictures x where x.campaign_id=p_campaign_id and x.kind=p_payload->>'kind'
    and x.subject_kind=p_payload->>'subjectKind' and x.subject_id=(p_payload->>'subjectId')::uuid and x.composition=p_payload->>'composition';
  insert into rpg_private.pictures(id,owner_id,campaign_id,kind,subject_kind,subject_id,composition,timeline,version,status,provider,model,tier,trigger,style_version_id,shot,prompt,reference_ids)
   values((p_payload->>'id')::uuid,p_owner_id,p_campaign_id,p_payload->>'kind',p_payload->>'subjectKind',(p_payload->>'subjectId')::uuid,p_payload->>'composition',
    p_payload->'timeline',ver,'queued','fal',p_payload->>'model',p_payload->>'tier',p_payload->>'trigger',(p_payload->>'styleVersionId')::uuid,
    nullif(p_payload->'shot','null'::jsonb),p_payload->>'prompt',p_payload->'referenceIds')
   returning * into p;
  return rpg_private.picture_json(p);
 end if;

 if p_action='picture.update' then
  perform rpg_private.fields(p_payload,array['id','status'],array['output','costUsdMicros','requestId','elapsedMs','error','model']);
  select * into p from rpg_private.pictures x where x.id=(p_payload->>'id')::uuid and x.campaign_id=p_campaign_id for update;
  if not found then raise exception 'rpg_not_found'; end if;
  perform rpg_private.assert(p_payload->>'status' in ('generating','ready','failed'));
  if p.status='queued' then perform rpg_private.assert(true);
  elsif p.status='generating' then perform rpg_private.assert(p_payload->>'status' in ('ready','failed'));
  else raise exception 'rpg_conflict'; end if;
  o:=p_payload->'output';
  if p_payload->>'status'='ready' then
   perform rpg_private.fields(o,array['storagePath','contentType','width','height','bytes','sha256']);
   update rpg_private.pictures set status='ready',storage_path=o->>'storagePath',content_type=o->>'contentType',width=(o->>'width')::integer,
     height=(o->>'height')::integer,bytes=(o->>'bytes')::integer,sha256=o->>'sha256',ready_at=now(),
     cost_usd_micros=coalesce((p_payload->>'costUsdMicros')::integer,cost_usd_micros),request_id=coalesce(p_payload->>'requestId',request_id),
     elapsed_ms=coalesce((p_payload->>'elapsedMs')::integer,elapsed_ms),model=coalesce(p_payload->>'model',model),error=null
    where id=p.id returning * into p;
  elsif p_payload->>'status'='failed' then
   update rpg_private.pictures set status='failed',error=left(coalesce(p_payload->>'error','failed'),200),
     cost_usd_micros=coalesce((p_payload->>'costUsdMicros')::integer,cost_usd_micros),request_id=coalesce(p_payload->>'requestId',request_id),
     elapsed_ms=coalesce((p_payload->>'elapsedMs')::integer,elapsed_ms),model=coalesce(p_payload->>'model',model)
    where id=p.id returning * into p;
  else
   update rpg_private.pictures set status='generating',model=coalesce(p_payload->>'model',model),
     cost_usd_micros=coalesce((p_payload->>'costUsdMicros')::integer,cost_usd_micros)
    where id=p.id returning * into p;
  end if;
  return rpg_private.picture_json(p);
 end if;

 if p_action='picture.hide' then
  perform rpg_private.fields(p_payload,array['id','hidden']);
  perform rpg_private.assert(jsonb_typeof(p_payload->'hidden')='boolean');
  update rpg_private.pictures x set hidden=(p_payload->>'hidden')::boolean where x.id=(p_payload->>'id')::uuid and x.campaign_id=p_campaign_id returning x.* into p;
  if not found then raise exception 'rpg_not_found'; end if;
  return rpg_private.picture_json(p);
 end if;

 if p_action='picture.private' then
  -- Server-only: the prompt, shot and storage path of one picture (never sent to a client).
  perform rpg_private.fields(p_payload,array['id']);
  select * into p from rpg_private.pictures x where x.id=(p_payload->>'id')::uuid and x.campaign_id=p_campaign_id;
  if not found then raise exception 'rpg_not_found'; end if;
  return rpg_private.picture_json(p)||jsonb_build_object('prompt',p.prompt,'shot',p.shot,'storagePath',p.storage_path,'contentType',p.content_type,
    'sha256',p.sha256,'referenceIds',p.reference_ids,'requestId',p.request_id);
 end if;

 if p_action='style.private' then
  perform rpg_private.fields(p_payload,array['styleId']);
  select * into s from rpg_private.picture_styles x where x.id=(p_payload->>'styleId')::uuid and x.owner_id=p_owner_id
    and ((x.scope='campaign' and x.scope_id=p_campaign_id) or (wid is not null and x.scope='world' and x.scope_id=wid));
  if not found then raise exception 'rpg_not_found'; end if;
  return rpg_private.picture_style_json(s)||jsonb_build_object('referencePath',s.reference_path,'referenceSha256',s.reference_sha256,'referenceContentType',s.reference_content_type);
 end if;

 raise exception 'rpg_validation' using errcode='22023';
end $$;

revoke all on function rpg_private.picture_style_immutable(),rpg_private.picture_immutable(),rpg_private.picture_style_json(rpg_private.picture_styles),
 rpg_private.picture_json(rpg_private.pictures),rpg_private.picture_settings_json(uuid),rpg_private.picture_autopilot_valid(jsonb),rpg_private.picture_today(uuid)
 from public,anon,authenticated;
revoke all on function public.rpg_pictures(uuid,uuid,text,jsonb) from public,anon,authenticated;
do $$ begin if exists(select 1 from pg_roles where rolname='service_role') then
 revoke all on function rpg_private.picture_style_json(rpg_private.picture_styles),rpg_private.picture_json(rpg_private.pictures),
  rpg_private.picture_settings_json(uuid),rpg_private.picture_autopilot_valid(jsonb),rpg_private.picture_today(uuid) from service_role;
 grant execute on function public.rpg_pictures(uuid,uuid,text,jsonb) to service_role;
end if; end $$;

-- fal returns JPEG and WebP as well as PNG; the private bucket accepts them from now on.
do $$ begin
 if to_regclass('storage.buckets') is not null then
  execute 'update storage.buckets set allowed_mime_types=array[''image/png'',''image/jpeg'',''image/webp''] where id=''rpg-media''';
 end if;
end $$;
commit;
