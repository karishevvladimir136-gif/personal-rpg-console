-- The music stage (docs/stages/STAGE_MUSIC.md): a soundtrack per world. Packs of
-- instrumental, loop-friendly tracks generated once per world (and again when its
-- musical style changes), the owner's own uploaded tracks tagged with moods, the
-- ambient layer (place sounds and weathers, the owner's addition of 2026-10-20) as a
-- second pack of the same shape, and campaign music settings. Additive only: nothing earlier changes. Music only
-- follows what the public records show; a row never decides anything in the
-- game and nothing here reads DM-private state. Logic lives in TypeScript; this
-- file keeps the invariants (ownership, bounds, append-only history, status
-- transitions, the per-pack money cap).
begin;

create table rpg_private.music_settings (
  campaign_id uuid primary key references public.rpg_campaigns(id),
  enabled boolean not null default true,
  ambient boolean not null default true,
  model text not null default 'fal-ai/lyria3/pro' check (length(model) between 1 and 80),
  variants integer not null default 2 check (variants between 1 and 3),
  pack_cap_usd_micros integer not null default 8000000 check (pack_cap_usd_micros between 0 and 50000000),
  style_text text not null default '' check (length(style_text) <= 1200),
  revision integer not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);
alter table rpg_private.music_settings enable row level security;
revoke all on rpg_private.music_settings from public, anon, authenticated;

-- A pack: one generation run of a world's (or, without a bound world, a campaign's) soundtrack.
create table rpg_private.music_packs (
  id uuid primary key,
  owner_id uuid not null references auth.users(id),
  campaign_id uuid not null references public.rpg_campaigns(id),
  scope text not null check (scope in ('world','campaign')),
  scope_id uuid not null,
  layer text not null default 'music' check (layer in ('music','ambient')),
  version integer not null check (version > 0),
  style_text text not null check (length(style_text) between 1 and 1200),
  model text not null check (length(model) between 1 and 80),
  moods jsonb not null check (jsonb_typeof(moods) = 'array' and jsonb_array_length(moods) between 1 and 40),
  variants integer not null check (variants between 1 and 3),
  cap_usd_micros integer not null check (cap_usd_micros between 0 and 50000000),
  status text not null check (status in ('generating','ready','failed','cancelled')),
  cost_usd_micros integer not null default 0 check (cost_usd_micros >= 0),
  created_at timestamptz not null default now(),
  finished_at timestamptz,
  unique (owner_id, scope, scope_id, layer, version)
);
alter table rpg_private.music_packs enable row level security;
revoke all on rpg_private.music_packs from public, anon, authenticated;

create table rpg_private.music_tracks (
  id uuid primary key,
  owner_id uuid not null references auth.users(id),
  campaign_id uuid not null references public.rpg_campaigns(id),
  pack_id uuid references rpg_private.music_packs(id),
  scope text not null check (scope in ('world','campaign')),
  scope_id uuid not null,
  source text not null check (source in ('generated','upload')),
  layer text not null default 'music' check (layer in ('music','ambient')),
  -- Moods of a music track; place kinds and weathers of an ambient track.
  moods jsonb not null check (jsonb_typeof(moods) = 'array' and jsonb_array_length(moods) between 1 and 24),
  variant integer not null default 1 check (variant between 1 and 9),
  ordinal integer not null default 0 check (ordinal >= 0),
  title text not null check (length(btrim(title)) between 1 and 120),
  model text check (model is null or length(model) between 1 and 80),
  prompt text check (prompt is null or length(prompt) between 1 and 8000),
  seed integer,
  requested_seconds integer check (requested_seconds is null or requested_seconds between 1 and 600),
  status text not null check (status in ('queued','generating','ready','failed')),
  hidden boolean not null default false,
  storage_path text,
  content_type text check (content_type is null or content_type in ('audio/mpeg','audio/wav','audio/ogg','audio/flac','audio/mp4')),
  bytes integer check (bytes is null or bytes >= 0),
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  sha256 text check (sha256 is null or sha256 ~ '^[a-f0-9]{64}$'),
  cost_usd_micros integer not null default 0 check (cost_usd_micros >= 0),
  request_id text check (request_id is null or length(request_id) <= 80),
  elapsed_ms integer check (elapsed_ms is null or elapsed_ms >= 0),
  error text check (error is null or length(error) <= 200),
  created_at timestamptz not null default now(),
  ready_at timestamptz,
  check ((source = 'generated') = (pack_id is not null)),
  check (source <> 'generated' or (model is not null and prompt is not null)),
  check (storage_path is null or (length(storage_path) <= 500 and storage_path like campaign_id::text || '/music/%' and position('..' in storage_path) = 0 and position(chr(92) in storage_path) = 0)),
  check (status <> 'ready' or (storage_path is not null and sha256 is not null and content_type is not null and bytes is not null and ready_at is not null)),
  check (status not in ('queued','generating') or (storage_path is null and ready_at is null)),
  check (status <> 'failed' or (storage_path is null and ready_at is null and error is not null))
);
create index music_tracks_scope on rpg_private.music_tracks(owner_id, scope, scope_id, created_at);
create index music_tracks_pack on rpg_private.music_tracks(pack_id, status);
alter table rpg_private.music_tracks enable row level security;
revoke all on rpg_private.music_tracks from public, anon, authenticated;

-- History: a pack row changes only its status, cost and finish time; a finished track changes only
-- its hidden flag, its title and its mood tags. Nothing is deleted.
create function rpg_private.music_pack_immutable() returns trigger
language plpgsql set search_path='' as $$
begin
 if tg_op = 'DELETE' or (to_jsonb(old) - 'status' - 'cost_usd_micros' - 'finished_at') <> (to_jsonb(new) - 'status' - 'cost_usd_micros' - 'finished_at') then raise exception 'rpg_conflict'; end if;
 if old.status <> 'generating' and new.status <> old.status then raise exception 'rpg_conflict'; end if;
 return new;
end $$;
create trigger music_pack_immutable before update or delete on rpg_private.music_packs for each row execute function rpg_private.music_pack_immutable();

create function rpg_private.music_track_immutable() returns trigger
language plpgsql set search_path='' as $$
begin
 if tg_op = 'DELETE' then raise exception 'rpg_conflict'; end if;
 if old.status in ('ready','failed') and (to_jsonb(old) - 'hidden' - 'moods' - 'title') <> (to_jsonb(new) - 'hidden' - 'moods' - 'title') then raise exception 'rpg_conflict'; end if;
 if old.status = 'generating' and new.status = 'queued' then raise exception 'rpg_conflict'; end if;
 if (to_jsonb(old) - 'status' - 'hidden' - 'moods' - 'title' - 'storage_path' - 'content_type' - 'bytes' - 'duration_ms' - 'sha256' - 'cost_usd_micros' - 'request_id' - 'elapsed_ms' - 'error' - 'ready_at')
    <> (to_jsonb(new) - 'status' - 'hidden' - 'moods' - 'title' - 'storage_path' - 'content_type' - 'bytes' - 'duration_ms' - 'sha256' - 'cost_usd_micros' - 'request_id' - 'elapsed_ms' - 'error' - 'ready_at') then raise exception 'rpg_conflict'; end if;
 return new;
end $$;
create trigger music_track_immutable before update or delete on rpg_private.music_tracks for each row execute function rpg_private.music_track_immutable();

create function rpg_private.music_moods_valid(v jsonb, layer text default 'music') returns void
language plpgsql immutable set search_path='' as $$
declare k text; begin
 perform rpg_private.assert(layer in ('music','ambient') and jsonb_typeof(v)='array' and jsonb_array_length(v) between 1 and 24);
 for k in select jsonb_array_elements_text(v) loop
  if layer='music' then
   perform rpg_private.assert(k in ('travel','explore','mystery','tension','combat','climax','quiet','warm','humor','trade','town','night','dread','sorrow','triumph'));
  else
   perform rpg_private.assert(k in ('tavern','market','town','village','forge','temple','library','room','cave','mine','sewer','forest_day','forest_night','field','mountain','river','shore','ship_deck','engine_room','camp','ruins','swamp','desert','neon_city',
     'rain','storm','wind','snow','thunder'));
  end if;
 end loop;
 perform rpg_private.assert((select count(distinct x) from jsonb_array_elements_text(v) x)=jsonb_array_length(v));
end $$;

create function rpg_private.music_settings_json(cid uuid) returns jsonb
language sql stable set search_path='' as $$
 select coalesce((select jsonb_build_object('enabled',s.enabled,'ambient',s.ambient,'model',s.model,'variants',s.variants,'packCapUsdMicros',s.pack_cap_usd_micros,'styleText',s.style_text,'revision',s.revision)
   from rpg_private.music_settings s where s.campaign_id=cid),
  jsonb_build_object('enabled',true,'ambient',true,'model','fal-ai/lyria3/pro','variants',2,'packCapUsdMicros',8000000,'styleText','','revision',0))
$$;

create function rpg_private.music_pack_json(p rpg_private.music_packs) returns jsonb
language sql immutable set search_path='' as $$
 select jsonb_build_object('id',p.id,'scope',p.scope,'scopeId',p.scope_id,'layer',p.layer,'version',p.version,'styleText',p.style_text,'model',p.model,'moods',p.moods,
  'variants',p.variants,'capUsdMicros',p.cap_usd_micros,'status',p.status,'costUsdMicros',p.cost_usd_micros,'createdAt',p.created_at,'finishedAt',p.finished_at)
$$;

-- The player-visible projection: never the prompt, the seed or the storage path.
create function rpg_private.music_track_json(t rpg_private.music_tracks) returns jsonb
language sql immutable set search_path='' as $$
 select jsonb_build_object('id',t.id,'packId',t.pack_id,'scope',t.scope,'layer',t.layer,'source',t.source,'moods',t.moods,'variant',t.variant,'title',t.title,'model',t.model,
  'requestedSeconds',t.requested_seconds,'status',t.status,'hidden',t.hidden,'contentType',t.content_type,'bytes',t.bytes,'durationMs',t.duration_ms,
  'costUsdMicros',t.cost_usd_micros,'elapsedMs',t.elapsed_ms,'error',t.error,'createdAt',t.created_at,'readyAt',t.ready_at)
$$;

-- A pack is finished when no track of it is queued or generating: ready when at least one track is
-- ready, failed otherwise (a cancelled pack keeps its status).
create function rpg_private.music_pack_settle(pid uuid) returns void
language plpgsql set search_path='' as $$
declare p rpg_private.music_packs%rowtype; begin
 select * into p from rpg_private.music_packs x where x.id=pid for update;
 if not found then return; end if;
 update rpg_private.music_packs set cost_usd_micros=(select coalesce(sum(t.cost_usd_micros),0) from rpg_private.music_tracks t where t.pack_id=pid) where id=pid;
 if p.status='generating' and not exists(select 1 from rpg_private.music_tracks t where t.pack_id=pid and t.status in ('queued','generating')) then
  update rpg_private.music_packs set status=case when exists(select 1 from rpg_private.music_tracks t where t.pack_id=pid and t.status='ready') then 'ready' else 'failed' end,
    finished_at=now() where id=pid;
 end if;
end $$;

create function public.rpg_music(p_owner_id uuid, p_campaign_id uuid, p_action text, p_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare
 settings jsonb; wid uuid; scope text; sid uuid; p rpg_private.music_packs%rowtype; a rpg_private.music_packs%rowtype; t rpg_private.music_tracks%rowtype;
 ver integer; o jsonb; row jsonb; spent integer; expected integer; layer text;
begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id)
   then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id for update;
 if not found then raise exception 'rpg_not_found'; end if;
 wid:=(rpg_private.adventure_binding(p_campaign_id)->>'worldId')::uuid;
 -- A campaign with a bound world shares the world's soundtrack; without one it has its own.
 scope:=case when wid is null then 'campaign' else 'world' end;
 sid:=coalesce(wid,p_campaign_id);
 settings:=rpg_private.music_settings_json(p_campaign_id);

 if p_action='read' then
  perform rpg_private.fields(p_payload,'{}');
  select * into p from rpg_private.music_packs x where x.owner_id=p_owner_id and x.scope=scope and x.scope_id=sid and x.layer='music' and x.status<>'cancelled' order by x.version desc limit 1;
  select * into a from rpg_private.music_packs x where x.owner_id=p_owner_id and x.scope=scope and x.scope_id=sid and x.layer='ambient' and x.status<>'cancelled' order by x.version desc limit 1;
  return jsonb_build_object(
   'campaignId',p_campaign_id,'worldId',wid,'scope',scope,'scopeId',sid,'settings',settings,
   'pack',case when p.id is null then null else rpg_private.music_pack_json(p) end,
   'ambientPack',case when a.id is null then null else rpg_private.music_pack_json(a) end,
   'packs',coalesce((select jsonb_agg(rpg_private.music_pack_json(x) order by x.layer,x.version) from rpg_private.music_packs x where x.owner_id=p_owner_id and x.scope=scope and x.scope_id=sid),'[]'),
   'tracks',coalesce((select jsonb_agg(rpg_private.music_track_json(x) order by x.created_at,x.ordinal,x.id) from rpg_private.music_tracks x
     where x.owner_id=p_owner_id and x.scope=scope and x.scope_id=sid and (x.source='upload' or (p.id is not null and x.pack_id=p.id) or (a.id is not null and x.pack_id=a.id))),'[]'),
   'spentUsdMicros',(select coalesce(sum(x.cost_usd_micros),0) from rpg_private.music_tracks x where x.owner_id=p_owner_id and x.scope=scope and x.scope_id=sid));
 end if;

 if p_action='settings.save' then
  perform rpg_private.fields(p_payload,array['expectedRevision','enabled','model','variants','packCapUsdMicros','styleText'],array['ambient']);
  if (p_payload->>'expectedRevision')::integer<>(settings->>'revision')::integer then raise exception 'rpg_conflict'; end if;
  perform rpg_private.assert(jsonb_typeof(p_payload->'enabled')='boolean' and jsonb_typeof(p_payload->'model')='string'
    and (not (p_payload ? 'ambient') or jsonb_typeof(p_payload->'ambient')='boolean') and length(p_payload->>'model') between 1 and 80
    and jsonb_typeof(p_payload->'variants')='number' and (p_payload->>'variants')::numeric between 1 and 3 and mod((p_payload->>'variants')::numeric,1)=0
    and jsonb_typeof(p_payload->'packCapUsdMicros')='number' and (p_payload->>'packCapUsdMicros')::numeric between 0 and 50000000 and mod((p_payload->>'packCapUsdMicros')::numeric,1)=0
    and jsonb_typeof(p_payload->'styleText')='string' and length(p_payload->>'styleText')<=1200);
  insert into rpg_private.music_settings(campaign_id,enabled,ambient,model,variants,pack_cap_usd_micros,style_text,revision)
   values(p_campaign_id,(p_payload->>'enabled')::boolean,coalesce((p_payload->>'ambient')::boolean,(settings->>'ambient')::boolean),p_payload->>'model',(p_payload->>'variants')::integer,(p_payload->>'packCapUsdMicros')::integer,p_payload->>'styleText',1)
   on conflict(campaign_id) do update set enabled=excluded.enabled,ambient=excluded.ambient,model=excluded.model,variants=excluded.variants,pack_cap_usd_micros=excluded.pack_cap_usd_micros,
    style_text=excluded.style_text,revision=rpg_private.music_settings.revision+1,updated_at=now();
  return rpg_private.music_settings_json(p_campaign_id);
 end if;

 if p_action='pack.create' then
  -- A new version of the scope's soundtrack with its queued tracks (prompts come from TypeScript).
  perform rpg_private.fields(p_payload,array['id','styleText','model','moods','variants','capUsdMicros','tracks'],array['layer']);
  layer:=coalesce(p_payload->>'layer','music');
  perform rpg_private.assert(layer in ('music','ambient') and jsonb_typeof(p_payload->'styleText')='string' and length(p_payload->>'styleText') between 1 and 1200
    and jsonb_typeof(p_payload->'model')='string' and jsonb_typeof(p_payload->'tracks')='array' and jsonb_array_length(p_payload->'tracks') between 1 and 120
    and jsonb_typeof(p_payload->'variants')='number' and jsonb_typeof(p_payload->'capUsdMicros')='number');
  perform rpg_private.music_moods_valid(p_payload->'moods',layer);
  -- One generating pack per layer: the music and the ambient layer may write at the same time.
  if exists(select 1 from rpg_private.music_packs x where x.owner_id=p_owner_id and x.scope=scope and x.scope_id=sid and x.layer=layer and x.status='generating') then raise exception 'rpg_conflict'; end if;
  select coalesce(max(x.version),0)+1 into ver from rpg_private.music_packs x where x.owner_id=p_owner_id and x.scope=scope and x.scope_id=sid and x.layer=layer;
  insert into rpg_private.music_packs(id,owner_id,campaign_id,scope,scope_id,layer,version,style_text,model,moods,variants,cap_usd_micros,status)
   values((p_payload->>'id')::uuid,p_owner_id,p_campaign_id,scope,sid,layer,ver,p_payload->>'styleText',p_payload->>'model',p_payload->'moods',(p_payload->>'variants')::integer,(p_payload->>'capUsdMicros')::integer,'generating')
   returning * into p;
  for row, ver in select * from jsonb_array_elements(p_payload->'tracks') with ordinality loop
   perform rpg_private.fields(row,array['id','moods','variant','title','model','prompt','seed','requestedSeconds']);
   perform rpg_private.music_moods_valid(row->'moods',layer);
   insert into rpg_private.music_tracks(id,owner_id,campaign_id,pack_id,scope,scope_id,layer,source,moods,variant,ordinal,title,model,prompt,seed,requested_seconds,status)
    values((row->>'id')::uuid,p_owner_id,p_campaign_id,p.id,scope,sid,layer,'generated',row->'moods',(row->>'variant')::integer,ver,row->>'title',row->>'model',row->>'prompt',
     nullif(row->>'seed','null')::integer,(row->>'requestedSeconds')::integer,'queued');
  end loop;
  return rpg_private.music_pack_json(p);
 end if;

 if p_action='pack.cancel' then
  perform rpg_private.fields(p_payload,array['id']);
  select * into p from rpg_private.music_packs x where x.id=(p_payload->>'id')::uuid and x.owner_id=p_owner_id and x.scope=scope and x.scope_id=sid for update;
  if not found then raise exception 'rpg_not_found'; end if;
  if p.status<>'generating' then raise exception 'rpg_conflict'; end if;
  update rpg_private.music_tracks set status='failed',error='cancelled' where pack_id=p.id and status='queued';
  update rpg_private.music_packs set status='cancelled',finished_at=now() where id=p.id returning * into p;
  perform rpg_private.music_pack_settle(p.id);
  select * into p from rpg_private.music_packs x where x.id=p.id;
  return rpg_private.music_pack_json(p);
 end if;

 if p_action='track.next' then
  -- Server-only: the oldest queued track of the scope's generating pack, with its prompt.
  perform rpg_private.fields(p_payload,'{}');
  -- The aliases avoid the variables t and p (use_variable: `t.owner_id` would read the record, not the table).
  select tr.* into t from rpg_private.music_tracks tr join rpg_private.music_packs pk on pk.id=tr.pack_id
   where tr.owner_id=p_owner_id and tr.scope=scope and tr.scope_id=sid and tr.status='queued' and pk.status='generating' order by tr.created_at,tr.ordinal,tr.id limit 1;
  if not found then return 'null'::jsonb; end if;
  return rpg_private.music_track_json(t)||jsonb_build_object('prompt',t.prompt,'seed',t.seed,'capUsdMicros',(select x.cap_usd_micros from rpg_private.music_packs x where x.id=t.pack_id),
    'packCostUsdMicros',(select coalesce(sum(y.cost_usd_micros),0) from rpg_private.music_tracks y where y.pack_id=t.pack_id));
 end if;

 if p_action='track.update' then
  perform rpg_private.fields(p_payload,array['id','status'],array['output','costUsdMicros','requestId','elapsedMs','error']);
  select * into t from rpg_private.music_tracks x where x.id=(p_payload->>'id')::uuid and x.campaign_id=p_campaign_id for update;
  if not found then raise exception 'rpg_not_found'; end if;
  perform rpg_private.assert(p_payload->>'status' in ('generating','ready','failed'));
  if t.status='queued' then perform rpg_private.assert(true);
  elsif t.status='generating' then perform rpg_private.assert(p_payload->>'status' in ('ready','failed'));
  else raise exception 'rpg_conflict'; end if;
  o:=p_payload->'output';
  if p_payload->>'status'='ready' then
   perform rpg_private.fields(o,array['storagePath','contentType','bytes','durationMs','sha256']);
   update rpg_private.music_tracks set status='ready',storage_path=o->>'storagePath',content_type=o->>'contentType',bytes=(o->>'bytes')::integer,
     duration_ms=nullif(o->>'durationMs','null')::integer,sha256=o->>'sha256',ready_at=now(),
     cost_usd_micros=coalesce((p_payload->>'costUsdMicros')::integer,cost_usd_micros),request_id=coalesce(p_payload->>'requestId',request_id),
     elapsed_ms=coalesce((p_payload->>'elapsedMs')::integer,elapsed_ms),error=null
    where id=t.id returning * into t;
  elsif p_payload->>'status'='failed' then
   update rpg_private.music_tracks set status='failed',error=left(coalesce(p_payload->>'error','failed'),200),
     cost_usd_micros=coalesce((p_payload->>'costUsdMicros')::integer,cost_usd_micros),request_id=coalesce(p_payload->>'requestId',request_id),
     elapsed_ms=coalesce((p_payload->>'elapsedMs')::integer,elapsed_ms)
    where id=t.id returning * into t;
  else
   -- Claiming a track counts its list price against the pack's cap before the paid request is sent:
   -- a crash never repeats a paid request past the cap. Over the cap the track fails instead.
   expected:=coalesce((p_payload->>'costUsdMicros')::integer,0);
   select coalesce(sum(y.cost_usd_micros),0) into spent from rpg_private.music_tracks y where y.pack_id=t.pack_id;
   select * into p from rpg_private.music_packs x where x.id=t.pack_id;
   if p.status<>'generating' then raise exception 'rpg_conflict'; end if;
   if spent+expected>p.cap_usd_micros then
    update rpg_private.music_tracks set status='failed',error='cap' where id=t.id returning * into t;
   else
    update rpg_private.music_tracks set status='generating',cost_usd_micros=expected where id=t.id returning * into t;
   end if;
  end if;
  if t.pack_id is not null then perform rpg_private.music_pack_settle(t.pack_id); end if;
  return rpg_private.music_track_json(t);
 end if;

 if p_action='upload.create' then
  -- The owner's own track, already stored: ready at once.
  perform rpg_private.fields(p_payload,array['id','title','moods','output']);
  perform rpg_private.music_moods_valid(p_payload->'moods');
  perform rpg_private.assert(jsonb_typeof(p_payload->'title')='string' and length(btrim(p_payload->>'title')) between 1 and 120);
  o:=p_payload->'output';
  perform rpg_private.fields(o,array['storagePath','contentType','bytes','durationMs','sha256']);
  insert into rpg_private.music_tracks(id,owner_id,campaign_id,pack_id,scope,scope_id,source,moods,variant,title,status,storage_path,content_type,bytes,duration_ms,sha256,ready_at)
   values((p_payload->>'id')::uuid,p_owner_id,p_campaign_id,null,scope,sid,'upload',p_payload->'moods',1,btrim(p_payload->>'title'),'ready',o->>'storagePath',o->>'contentType',
    (o->>'bytes')::integer,nullif(o->>'durationMs','null')::integer,o->>'sha256',now())
   returning * into t;
  return rpg_private.music_track_json(t);
 end if;

 if p_action='track.hide' then
  perform rpg_private.fields(p_payload,array['id','hidden']);
  perform rpg_private.assert(jsonb_typeof(p_payload->'hidden')='boolean');
  update rpg_private.music_tracks x set hidden=(p_payload->>'hidden')::boolean where x.id=(p_payload->>'id')::uuid and x.owner_id=p_owner_id and x.scope=scope and x.scope_id=sid returning x.* into t;
  if not found then raise exception 'rpg_not_found'; end if;
  return rpg_private.music_track_json(t);
 end if;

 if p_action='track.tag' then
  perform rpg_private.fields(p_payload,array['id','moods'],array['title']);
  select * into t from rpg_private.music_tracks x where x.id=(p_payload->>'id')::uuid and x.owner_id=p_owner_id and x.scope=scope and x.scope_id=sid;
  if not found then raise exception 'rpg_not_found'; end if;
  perform rpg_private.music_moods_valid(p_payload->'moods',t.layer);
  if p_payload ? 'title' then perform rpg_private.assert(jsonb_typeof(p_payload->'title')='string' and length(btrim(p_payload->>'title')) between 1 and 120); end if;
  update rpg_private.music_tracks x set moods=p_payload->'moods',title=coalesce(btrim(p_payload->>'title'),x.title)
   where x.id=(p_payload->>'id')::uuid and x.owner_id=p_owner_id and x.scope=scope and x.scope_id=sid returning x.* into t;
  if not found then raise exception 'rpg_not_found'; end if;
  return rpg_private.music_track_json(t);
 end if;

 if p_action='track.private' then
  -- Server-only: the storage path and prompt of one track (never sent to a client).
  perform rpg_private.fields(p_payload,array['id']);
  select * into t from rpg_private.music_tracks x where x.id=(p_payload->>'id')::uuid and x.owner_id=p_owner_id and x.scope=scope and x.scope_id=sid;
  if not found then raise exception 'rpg_not_found'; end if;
  return rpg_private.music_track_json(t)||jsonb_build_object('prompt',t.prompt,'seed',t.seed,'storagePath',t.storage_path,'sha256',t.sha256,'requestId',t.request_id);
 end if;

 raise exception 'rpg_validation' using errcode='22023';
end $$;

revoke all on function rpg_private.music_pack_immutable(),rpg_private.music_track_immutable(),rpg_private.music_moods_valid(jsonb,text),rpg_private.music_settings_json(uuid),
 rpg_private.music_pack_json(rpg_private.music_packs),rpg_private.music_track_json(rpg_private.music_tracks),rpg_private.music_pack_settle(uuid)
 from public,anon,authenticated;
revoke all on function public.rpg_music(uuid,uuid,text,jsonb) from public,anon,authenticated;
do $$ begin if exists(select 1 from pg_roles where rolname='service_role') then
 revoke all on function rpg_private.music_moods_valid(jsonb,text),rpg_private.music_settings_json(uuid),rpg_private.music_pack_json(rpg_private.music_packs),
  rpg_private.music_track_json(rpg_private.music_tracks),rpg_private.music_pack_settle(uuid) from service_role;
 grant execute on function public.rpg_music(uuid,uuid,text,jsonb) to service_role;
end if; end $$;

-- Tracks live next to the pictures in the private bucket: audio types and a larger object limit (a
-- 90-second WAV is about 16 MB).
do $$ begin
 if to_regclass('storage.buckets') is not null then
  execute 'update storage.buckets set allowed_mime_types=array[''image/png'',''image/jpeg'',''image/webp'',''video/mp4'',''audio/mpeg'',''audio/wav'',''audio/ogg'',''audio/flac'',''audio/mp4''], file_size_limit=greatest(coalesce(file_size_limit,0),40000000) where id=''rpg-media''';
 end if;
end $$;
commit;
