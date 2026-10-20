-- 2D Live, first slice (docs/stages/LIVE2D_1.md): the records the 2D layer
-- shows. The DM and the rules decide what happened; the records remember it;
-- this layer only shows it. Presentation metadata over the public Location
-- records: campaign marker visibility, the scene sheet of a place (with
-- append-only versions), the points of interest with positions on the scene
-- picture, the painted region map per region, and the DM-private POI seeds
-- (never in the public projection). Additive only: the pictures composition
-- check is widened for the new compositions (as migration 67 did for «atlas»).
-- Logic lives in TypeScript (src/lib/live2d); this file keeps the invariants.
begin;

alter table rpg_private.pictures drop constraint pictures_composition_check;
alter table rpg_private.pictures add constraint pictures_composition_check
  check (composition in ('frame','portrait','figure','item','location','holding','atlas','scene','region','battle'));

create table rpg_private.live2d_settings (
  campaign_id uuid primary key references public.rpg_campaigns(id),
  markers text not null default 'standard' check (markers in ('off','tracked','standard','all')),
  revision integer not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);
alter table rpg_private.live2d_settings enable row level security;
revoke all on rpg_private.live2d_settings from public, anon, authenticated;

create table rpg_private.live2d_scenes (
  campaign_id uuid not null references public.rpg_campaigns(id),
  location_id uuid not null,
  revision integer not null check (revision > 0),
  sheet jsonb not null check (jsonb_typeof(sheet) = 'object'),
  status text not null check (status in ('draft','drawing','checked','flagged','failed')),
  picture_id uuid references rpg_private.pictures(id),
  check_result jsonb check (check_result is null or jsonb_typeof(check_result) = 'object'),
  side_list jsonb not null default '[]' check (jsonb_typeof(side_list) = 'array'),
  redraws integer not null default 0 check (redraws >= 0),
  error text check (error is null or length(error) <= 200),
  updated_at timestamptz not null default now(),
  primary key (campaign_id, location_id),
  foreign key (campaign_id, location_id) references public.rpg_locations(campaign_id, id)
);
alter table rpg_private.live2d_scenes enable row level security;
revoke all on rpg_private.live2d_scenes from public, anon, authenticated;

create table rpg_private.live2d_scene_versions (
  id bigserial primary key,
  campaign_id uuid not null references public.rpg_campaigns(id),
  location_id uuid not null,
  revision integer not null check (revision > 0),
  sheet jsonb not null check (jsonb_typeof(sheet) = 'object'),
  source text not null check (source in ('model','owner')),
  created_at timestamptz not null default now()
);
create index live2d_scene_versions_place on rpg_private.live2d_scene_versions(campaign_id, location_id, revision);
alter table rpg_private.live2d_scene_versions enable row level security;
revoke all on rpg_private.live2d_scene_versions from public, anon, authenticated;

-- Versions are history: never changed, never deleted.
create function rpg_private.live2d_scene_version_immutable() returns trigger
language plpgsql set search_path='' as $$
begin raise exception 'rpg_conflict'; end $$;
create trigger live2d_scene_version_immutable before update or delete on rpg_private.live2d_scene_versions
  for each row execute function rpg_private.live2d_scene_version_immutable();

create table rpg_private.live2d_pois (
  id uuid primary key,
  campaign_id uuid not null references public.rpg_campaigns(id),
  location_id uuid not null,
  key text not null check (key ~ '^[a-z0-9][a-z0-9_-]{0,59}$'),
  kind text not null check (kind in ('person','exit','object','feature','lead')),
  label text not null check (length(btrim(label)) between 1 and 80),
  note text not null default '' check (length(note) <= 400),
  entity_id uuid,
  target_location_id uuid,
  x numeric check (x is null or (x >= 0 and x <= 1)),
  y numeric check (y is null or (y >= 0 and y <= 1)),
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  approximate boolean not null default false,
  source text not null check (source in ('locator','owner','sheet','discovery')),
  hidden boolean not null default false,
  revision integer not null check (revision > 0),
  updated_at timestamptz not null default now(),
  check ((x is null) = (y is null)),
  unique (campaign_id, location_id, key),
  foreign key (campaign_id, location_id) references public.rpg_locations(campaign_id, id)
);
alter table rpg_private.live2d_pois enable row level security;
revoke all on rpg_private.live2d_pois from public, anon, authenticated;

create table rpg_private.live2d_region_maps (
  campaign_id uuid not null references public.rpg_campaigns(id),
  anchor_key text not null,
  anchor_id uuid,
  picture_id uuid references rpg_private.pictures(id),
  signature text not null default '' check (length(signature) <= 8000),
  status text not null check (status in ('drawing','ready','failed')),
  updated_at timestamptz not null default now(),
  primary key (campaign_id, anchor_key),
  check (anchor_key = coalesce(anchor_id::text, 'known'))
);
alter table rpg_private.live2d_region_maps enable row level security;
revoke all on rpg_private.live2d_region_maps from public, anon, authenticated;

-- DM-private: a latent hook of an area, in the shape of a note_world fact
-- (key poi_seed_<area>_<n>, value the premise). Never in the public projection.
create table rpg_private.live2d_seeds (
  id uuid primary key,
  campaign_id uuid not null references public.rpg_campaigns(id),
  area_location_id uuid,
  key text not null check (key ~ '^poi_seed_[a-z0-9_-]{1,80}$'),
  theme text not null default '' check (length(theme) <= 80),
  premise text not null check (length(premise) between 1 and 2000),
  status text not null default 'latent' check (status in ('latent','discovered')),
  discovered_poi_id uuid references rpg_private.live2d_pois(id),
  created_at timestamptz not null default now(),
  unique (campaign_id, key)
);
alter table rpg_private.live2d_seeds enable row level security;
revoke all on rpg_private.live2d_seeds from public, anon, authenticated;

create function rpg_private.live2d_settings_json(cid uuid) returns jsonb
language sql stable set search_path='' as $$
 select coalesce((select jsonb_build_object('markers',s.markers,'revision',s.revision) from rpg_private.live2d_settings s where s.campaign_id=cid),
  jsonb_build_object('markers','standard','revision',0))
$$;
create function rpg_private.live2d_scene_json(s rpg_private.live2d_scenes) returns jsonb
language sql immutable set search_path='' as $$
 select jsonb_build_object('locationId',s.location_id,'revision',s.revision,'sheet',s.sheet,'status',s.status,'pictureId',s.picture_id,
  'check',s.check_result,'sideList',s.side_list,'redraws',s.redraws,'error',s.error,'updatedAt',s.updated_at)
$$;
create function rpg_private.live2d_poi_json(p rpg_private.live2d_pois) returns jsonb
language sql immutable set search_path='' as $$
 select jsonb_build_object('id',p.id,'locationId',p.location_id,'key',p.key,'kind',p.kind,'label',p.label,'note',p.note,'entityId',p.entity_id,
  'targetLocationId',p.target_location_id,'x',p.x,'y',p.y,'confidence',p.confidence,'approximate',p.approximate,'source',p.source,'hidden',p.hidden,
  'revision',p.revision,'updatedAt',p.updated_at)
$$;
create function rpg_private.live2d_region_json(r rpg_private.live2d_region_maps) returns jsonb
language sql immutable set search_path='' as $$
 select jsonb_build_object('anchorId',r.anchor_id,'pictureId',r.picture_id,'signature',r.signature,'status',r.status,'updatedAt',r.updated_at)
$$;
create function rpg_private.live2d_seed_json(s rpg_private.live2d_seeds) returns jsonb
language sql immutable set search_path='' as $$
 select jsonb_build_object('id',s.id,'areaLocationId',s.area_location_id,'key',s.key,'theme',s.theme,'premise',s.premise,'status',s.status,
  'discoveredPoiId',s.discovered_poi_id,'createdAt',s.created_at)
$$;

-- A unit coordinate from JSON: null, or a number between 0 and 1 (anything else is a validation error).
create function rpg_private.live2d_unit(v jsonb) returns numeric
language plpgsql immutable set search_path='' as $$
begin
 if v is null or v='null'::jsonb then return null; end if;
 perform rpg_private.assert(jsonb_typeof(v)='number' and (v::text)::numeric between 0 and 1);
 return (v::text)::numeric;
end $$;

create function public.rpg_live2d(p_owner_id uuid, p_campaign_id uuid, p_action text, p_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare
 s rpg_private.live2d_scenes%rowtype; p rpg_private.live2d_pois%rowtype; r rpg_private.live2d_region_maps%rowtype; sd rpg_private.live2d_seeds%rowtype;
 lid uuid; pid uuid; rev integer; cur integer; row_ jsonb; keys text[]; ak text; aid uuid; eid uuid; tid uuid; px numeric; py numeric; k text;
begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id)
   then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id for update;
 if not found then raise exception 'rpg_not_found'; end if;

 if p_action='read' then
  perform rpg_private.fields(p_payload,'{}');
  return jsonb_build_object(
   'campaignId',p_campaign_id,
   'settings',rpg_private.live2d_settings_json(p_campaign_id),
   'scenes',coalesce((select jsonb_agg(rpg_private.live2d_scene_json(x) order by x.updated_at,x.location_id) from rpg_private.live2d_scenes x where x.campaign_id=p_campaign_id),'[]'),
   'pois',coalesce((select jsonb_agg(rpg_private.live2d_poi_json(q) order by q.location_id,q.key) from rpg_private.live2d_pois q where q.campaign_id=p_campaign_id),'[]'),
   'regionMaps',coalesce((select jsonb_agg(rpg_private.live2d_region_json(x) order by x.anchor_key) from rpg_private.live2d_region_maps x where x.campaign_id=p_campaign_id),'[]'));
 end if;

 if p_action='settings.save' then
  perform rpg_private.fields(p_payload,array['expectedRevision','markers']);
  perform rpg_private.assert(jsonb_typeof(p_payload->'expectedRevision')='number' and p_payload->>'markers' in ('off','tracked','standard','all'));
  if (p_payload->>'expectedRevision')::integer<>(rpg_private.live2d_settings_json(p_campaign_id)->>'revision')::integer then raise exception 'rpg_conflict'; end if;
  insert into rpg_private.live2d_settings(campaign_id,markers,revision) values(p_campaign_id,p_payload->>'markers',1)
   on conflict(campaign_id) do update set markers=excluded.markers,revision=rpg_private.live2d_settings.revision+1,updated_at=now();
  return rpg_private.live2d_settings_json(p_campaign_id);
 end if;

 if p_action='scene.save' then
  perform rpg_private.fields(p_payload,array['locationId','sheet','source','expectedRevision']);
  perform rpg_private.assert(jsonb_typeof(p_payload->'sheet')='object' and p_payload->>'source' in ('model','owner')
    and (p_payload->'expectedRevision'='null'::jsonb or jsonb_typeof(p_payload->'expectedRevision')='number'));
  lid:=(p_payload->>'locationId')::uuid;
  if not exists(select 1 from public.rpg_locations l where l.campaign_id=p_campaign_id and l.id=lid) then raise exception 'rpg_not_found'; end if;
  select * into s from rpg_private.live2d_scenes x where x.campaign_id=p_campaign_id and x.location_id=lid for update;
  if p_payload->'expectedRevision'='null'::jsonb then
   if found then raise exception 'rpg_conflict'; end if;
   insert into rpg_private.live2d_scenes(campaign_id,location_id,revision,sheet,status) values(p_campaign_id,lid,1,p_payload->'sheet','draft') returning * into s;
  else
   if not found or s.revision<>(p_payload->>'expectedRevision')::integer then raise exception 'rpg_conflict'; end if;
   update rpg_private.live2d_scenes x set sheet=p_payload->'sheet',revision=x.revision+1,updated_at=now(),
     status=case when x.picture_id is not null and p_payload->>'source'='owner' then x.status else 'draft' end
    where x.campaign_id=p_campaign_id and x.location_id=lid returning * into s;
  end if;
  insert into rpg_private.live2d_scene_versions(campaign_id,location_id,revision,sheet,source) values(p_campaign_id,lid,s.revision,s.sheet,p_payload->>'source');
  return rpg_private.live2d_scene_json(s);
 end if;

 if p_action='scene.update' then
  perform rpg_private.fields(p_payload,array['locationId','status'],array['pictureId','check','sideList','redraws','error']);
  perform rpg_private.assert(p_payload->>'status' in ('draft','drawing','checked','flagged','failed'));
  lid:=(p_payload->>'locationId')::uuid;
  select * into s from rpg_private.live2d_scenes x where x.campaign_id=p_campaign_id and x.location_id=lid for update;
  if not found then raise exception 'rpg_not_found'; end if;
  if p_payload ? 'pictureId' and p_payload->'pictureId'<>'null'::jsonb then
   pid:=(p_payload->>'pictureId')::uuid;
   if not exists(select 1 from rpg_private.pictures x where x.id=pid and x.campaign_id=p_campaign_id) then raise exception 'rpg_conflict'; end if;
  else pid:=null; end if;
  if p_payload ? 'check' then perform rpg_private.assert(p_payload->'check'='null'::jsonb or jsonb_typeof(p_payload->'check')='object'); end if;
  if p_payload ? 'sideList' then
   perform rpg_private.assert(jsonb_typeof(p_payload->'sideList')='array'
     and not exists(select 1 from jsonb_array_elements(p_payload->'sideList') e where jsonb_typeof(e)<>'string'));
  end if;
  if p_payload ? 'redraws' then perform rpg_private.assert(jsonb_typeof(p_payload->'redraws')='number' and (p_payload->>'redraws')::numeric>=0 and mod((p_payload->>'redraws')::numeric,1)=0); end if;
  if p_payload ? 'error' then perform rpg_private.assert(p_payload->'error'='null'::jsonb or jsonb_typeof(p_payload->'error')='string'); end if;
  update rpg_private.live2d_scenes x set status=p_payload->>'status',
    picture_id=case when p_payload ? 'pictureId' then pid else x.picture_id end,
    check_result=case when p_payload ? 'check' then nullif(p_payload->'check','null'::jsonb) else x.check_result end,
    side_list=case when p_payload ? 'sideList' then p_payload->'sideList' else x.side_list end,
    redraws=case when p_payload ? 'redraws' then (p_payload->>'redraws')::integer else x.redraws end,
    error=case when p_payload ? 'error' then left(p_payload->>'error',200) else x.error end,
    updated_at=now()
   where x.campaign_id=p_campaign_id and x.location_id=lid returning * into s;
  return rpg_private.live2d_scene_json(s);
 end if;

 if p_action='poi.replace' then
  perform rpg_private.fields(p_payload,array['locationId','pois']);
  perform rpg_private.assert(jsonb_typeof(p_payload->'pois')='array' and jsonb_array_length(p_payload->'pois')<=60);
  lid:=(p_payload->>'locationId')::uuid;
  if not exists(select 1 from public.rpg_locations l where l.campaign_id=p_campaign_id and l.id=lid) then raise exception 'rpg_not_found'; end if;
  keys:='{}';
  for row_ in select * from jsonb_array_elements(p_payload->'pois') loop
   perform rpg_private.fields(row_,array['id','key','kind','label','note','entityId','targetLocationId','x','y','confidence','approximate','source','hidden']);
   perform rpg_private.assert(jsonb_typeof(row_->'label')='string' and jsonb_typeof(row_->'note')='string' and jsonb_typeof(row_->'approximate')='boolean'
     and jsonb_typeof(row_->'hidden')='boolean' and row_->>'source' in ('locator','owner','sheet','discovery'));
   k:=row_->>'key';
   perform rpg_private.assert(not (k = any(keys)));
   keys:=array_append(keys,k);
   if row_->'entityId'<>'null'::jsonb then
    eid:=(row_->>'entityId')::uuid;
    if not exists(select 1 from public.rpg_entities e where e.campaign_id=p_campaign_id and e.id=eid) then raise exception 'rpg_conflict'; end if;
   else eid:=null; end if;
   if row_->'targetLocationId'<>'null'::jsonb then
    tid:=(row_->>'targetLocationId')::uuid;
    if not exists(select 1 from public.rpg_locations l where l.campaign_id=p_campaign_id and l.id=tid) then raise exception 'rpg_conflict'; end if;
   else tid:=null; end if;
   px:=rpg_private.live2d_unit(row_->'x'); py:=rpg_private.live2d_unit(row_->'y');
   select * into p from rpg_private.live2d_pois q where q.campaign_id=p_campaign_id and q.location_id=lid and q.key=k for update;
   if found then
    if p.source='owner' then
     -- The owner's placement is the highest authority: keep the spot and the hidden flag.
     update rpg_private.live2d_pois q set kind=row_->>'kind',label=btrim(row_->>'label'),note=row_->>'note',entity_id=eid,target_location_id=tid,
       confidence=rpg_private.live2d_unit(row_->'confidence'),approximate=(row_->>'approximate')::boolean,revision=q.revision+1,updated_at=now()
      where q.id=p.id;
    else
     update rpg_private.live2d_pois q set kind=row_->>'kind',label=btrim(row_->>'label'),note=row_->>'note',entity_id=eid,target_location_id=tid,
       x=px,y=py,confidence=rpg_private.live2d_unit(row_->'confidence'),approximate=(row_->>'approximate')::boolean,source=row_->>'source',
       hidden=(row_->>'hidden')::boolean,revision=q.revision+1,updated_at=now()
      where q.id=p.id;
    end if;
   else
    insert into rpg_private.live2d_pois(id,campaign_id,location_id,key,kind,label,note,entity_id,target_location_id,x,y,confidence,approximate,source,hidden,revision)
     values((row_->>'id')::uuid,p_campaign_id,lid,k,row_->>'kind',btrim(row_->>'label'),row_->>'note',eid,tid,px,py,rpg_private.live2d_unit(row_->'confidence'),
      (row_->>'approximate')::boolean,row_->>'source',(row_->>'hidden')::boolean,1);
   end if;
  end loop;
  -- What is no longer in the records goes; the owner's own markers stay.
  delete from rpg_private.live2d_pois q where q.campaign_id=p_campaign_id and q.location_id=lid and q.source<>'owner' and not (q.key = any(keys));
  return coalesce((select jsonb_agg(rpg_private.live2d_poi_json(q) order by q.key) from rpg_private.live2d_pois q where q.campaign_id=p_campaign_id and q.location_id=lid),'[]');
 end if;

 if p_action='poi.save' then
  perform rpg_private.fields(p_payload,array['id','expectedRevision','x','y','hidden'],array['label','note']);
  perform rpg_private.assert(jsonb_typeof(p_payload->'expectedRevision')='number' and jsonb_typeof(p_payload->'hidden')='boolean'
    and ((p_payload->'x'='null'::jsonb)=(p_payload->'y'='null'::jsonb)));
  if p_payload ? 'label' then perform rpg_private.assert(jsonb_typeof(p_payload->'label')='string' and length(btrim(p_payload->>'label')) between 1 and 80); end if;
  if p_payload ? 'note' then perform rpg_private.assert(jsonb_typeof(p_payload->'note')='string' and length(p_payload->>'note')<=400); end if;
  px:=rpg_private.live2d_unit(p_payload->'x'); py:=rpg_private.live2d_unit(p_payload->'y');
  select * into p from rpg_private.live2d_pois q where q.id=(p_payload->>'id')::uuid and q.campaign_id=p_campaign_id for update;
  if not found then raise exception 'rpg_not_found'; end if;
  if p.revision<>(p_payload->>'expectedRevision')::integer then raise exception 'rpg_conflict'; end if;
  update rpg_private.live2d_pois q set x=px,y=py,hidden=(p_payload->>'hidden')::boolean,source='owner',
    label=case when p_payload ? 'label' then btrim(p_payload->>'label') else q.label end,
    note=case when p_payload ? 'note' then p_payload->>'note' else q.note end,
    revision=q.revision+1,updated_at=now()
   where q.id=p.id returning * into p;
  return rpg_private.live2d_poi_json(p);
 end if;

 if p_action='region.save' then
  perform rpg_private.fields(p_payload,array['anchorId','pictureId','signature','status']);
  perform rpg_private.assert(jsonb_typeof(p_payload->'signature')='string' and p_payload->>'status' in ('drawing','ready','failed'));
  if p_payload->'anchorId'<>'null'::jsonb then
   aid:=(p_payload->>'anchorId')::uuid;
   if not exists(select 1 from public.rpg_locations l where l.campaign_id=p_campaign_id and l.id=aid) then raise exception 'rpg_not_found'; end if;
  else aid:=null; end if;
  if p_payload->'pictureId'<>'null'::jsonb then
   pid:=(p_payload->>'pictureId')::uuid;
   if not exists(select 1 from rpg_private.pictures x where x.id=pid and x.campaign_id=p_campaign_id) then raise exception 'rpg_conflict'; end if;
  else pid:=null; end if;
  ak:=coalesce(aid::text,'known');
  insert into rpg_private.live2d_region_maps(campaign_id,anchor_key,anchor_id,picture_id,signature,status)
   values(p_campaign_id,ak,aid,pid,p_payload->>'signature',p_payload->>'status')
   on conflict(campaign_id,anchor_key) do update set picture_id=excluded.picture_id,signature=excluded.signature,status=excluded.status,updated_at=now()
   returning * into r;
  return rpg_private.live2d_region_json(r);
 end if;

 if p_action='seed.plant' then
  perform rpg_private.fields(p_payload,array['id','areaLocationId','key','theme','premise']);
  perform rpg_private.assert(jsonb_typeof(p_payload->'theme')='string' and jsonb_typeof(p_payload->'premise')='string');
  if p_payload->'areaLocationId'<>'null'::jsonb then
   aid:=(p_payload->>'areaLocationId')::uuid;
   if not exists(select 1 from public.rpg_locations l where l.campaign_id=p_campaign_id and l.id=aid) then raise exception 'rpg_not_found'; end if;
  else aid:=null; end if;
  insert into rpg_private.live2d_seeds(id,campaign_id,area_location_id,key,theme,premise)
   values((p_payload->>'id')::uuid,p_campaign_id,aid,p_payload->>'key',p_payload->>'theme',p_payload->>'premise') returning * into sd;
  return rpg_private.live2d_seed_json(sd);
 end if;

 if p_action='seed.list' then
  -- Server-only: the DM's hidden layer. The HTTP route never exposes it.
  perform rpg_private.fields(p_payload,'{}');
  return coalesce((select jsonb_agg(rpg_private.live2d_seed_json(x) order by x.created_at,x.id) from rpg_private.live2d_seeds x where x.campaign_id=p_campaign_id),'[]');
 end if;

 if p_action='seed.discover' then
  perform rpg_private.fields(p_payload,array['id','poiId']);
  select * into sd from rpg_private.live2d_seeds x where x.id=(p_payload->>'id')::uuid and x.campaign_id=p_campaign_id for update;
  if not found then raise exception 'rpg_not_found'; end if;
  if p_payload->'poiId'<>'null'::jsonb then
   pid:=(p_payload->>'poiId')::uuid;
   if not exists(select 1 from rpg_private.live2d_pois q where q.id=pid and q.campaign_id=p_campaign_id) then raise exception 'rpg_conflict'; end if;
  else pid:=null; end if;
  update rpg_private.live2d_seeds x set status='discovered',discovered_poi_id=pid where x.id=sd.id returning * into sd;
  return rpg_private.live2d_seed_json(sd);
 end if;

 raise exception 'rpg_validation' using errcode='22023';
end $$;

revoke all on function rpg_private.live2d_scene_version_immutable(),rpg_private.live2d_settings_json(uuid),rpg_private.live2d_scene_json(rpg_private.live2d_scenes),
 rpg_private.live2d_poi_json(rpg_private.live2d_pois),rpg_private.live2d_region_json(rpg_private.live2d_region_maps),rpg_private.live2d_seed_json(rpg_private.live2d_seeds),
 rpg_private.live2d_unit(jsonb) from public,anon,authenticated;
revoke all on function public.rpg_live2d(uuid,uuid,text,jsonb) from public,anon,authenticated;
do $$ begin if exists(select 1 from pg_roles where rolname='service_role') then
 revoke all on function rpg_private.live2d_settings_json(uuid),rpg_private.live2d_scene_json(rpg_private.live2d_scenes),rpg_private.live2d_poi_json(rpg_private.live2d_pois),
  rpg_private.live2d_region_json(rpg_private.live2d_region_maps),rpg_private.live2d_seed_json(rpg_private.live2d_seeds),rpg_private.live2d_unit(jsonb) from service_role;
 grant execute on function public.rpg_live2d(uuid,uuid,text,jsonb) to service_role;
end if; end $$;
commit;
