-- Fix S3-accept Д3 (docs/stages/FIX_S3_ACCEPT.md): the DM designs the region first, then the painter paints it.
-- The painted region map keeps the DM's prep of the region (its public part: the land, the places by role with their
-- spots, the roads and days; the hidden part goes to the DM's private notes, never here), with append-only versions
-- and the canon document that holds its text; the markers where the check found each place on the picture (the
-- owner's moved markers kept, as poi.replace keeps them); the check and the side list, and a «flagged» map like a
-- scene. Additive only: new columns with defaults on rpg_private.live2d_region_maps (every existing map keeps its
-- picture and reads as before), its status check widened by one value, one history table, rpg_live2d patched in place
-- (as migration 201 patched it): region.save takes the new optional fields, region.prep.save and region.marker.save
-- are new. Logic lives in TypeScript (src/lib/live2d/region-prep.ts, region-marks.ts); this file keeps the invariants.
begin;

alter table rpg_private.live2d_region_maps
  add column revision integer not null default 1 check (revision > 0),
  add column markers jsonb not null default '[]' check (jsonb_typeof(markers)='array' and jsonb_array_length(markers)<=120),
  add column check_result jsonb check (check_result is null or jsonb_typeof(check_result)='object'),
  add column side_list jsonb not null default '[]' check (jsonb_typeof(side_list)='array'),
  add column picture_prep_revision integer check (picture_prep_revision is null or picture_prep_revision >= 0),
  add column prep jsonb check (prep is null or (jsonb_typeof(prep)='object' and octet_length(prep::text)<=60000)),
  add column prep_revision integer not null default 0 check (prep_revision >= 0),
  add column prep_document_id uuid;
alter table rpg_private.live2d_region_maps drop constraint live2d_region_maps_status_check;
alter table rpg_private.live2d_region_maps add constraint live2d_region_maps_status_check check (status in ('drawing','ready','flagged','failed'));

-- The prep's public part, every version kept: a redraw never changes it; an amend (a newly known place) adds a version.
create table rpg_private.live2d_region_prep_versions (
  id bigserial primary key,
  campaign_id uuid not null references public.rpg_campaigns(id),
  anchor_key text not null,
  revision integer not null check (revision > 0),
  prep jsonb not null check (jsonb_typeof(prep)='object'),
  document_id uuid,
  source text not null check (source in ('model','owner')),
  created_at timestamptz not null default now(),
  unique (campaign_id, anchor_key, revision)
);
alter table rpg_private.live2d_region_prep_versions enable row level security;
revoke all on rpg_private.live2d_region_prep_versions from public, anon, authenticated;
create trigger live2d_region_prep_version_immutable before update or delete on rpg_private.live2d_region_prep_versions
  for each row execute function rpg_private.live2d_scene_version_immutable();

create or replace function rpg_private.live2d_region_json(r rpg_private.live2d_region_maps) returns jsonb
language sql immutable set search_path='' as $$
 select jsonb_build_object('anchorId',r.anchor_id,'pictureId',r.picture_id,'signature',r.signature,'status',r.status,'updatedAt',r.updated_at,
  'revision',r.revision,'markers',r.markers,'check',r.check_result,'sideList',r.side_list,'picturePrepRevision',r.picture_prep_revision,
  'prep',r.prep,'prepRevision',r.prep_revision,'prepDocumentId',r.prep_document_id)
$$;
revoke all on function rpg_private.live2d_region_json(rpg_private.live2d_region_maps) from public, anon, authenticated;

-- A region marker list from JSON: unit spots on known places of the campaign, one per place, a known source.
create function rpg_private.live2d_region_markers(cid uuid, v jsonb) returns jsonb
language plpgsql stable set search_path='' as $$
declare m jsonb; seen uuid[]:='{}'; lid uuid; begin
 perform rpg_private.assert(jsonb_typeof(v)='array' and jsonb_array_length(v)<=120);
 for m in select value from jsonb_array_elements(v) loop
  perform rpg_private.fields(m,array['locationId','x','y','confidence','source','approximate']);
  perform rpg_private.assert(m->>'source' in ('check','prep','owner') and jsonb_typeof(m->'approximate')='boolean'
    and rpg_private.live2d_unit(m->'x') is not null and rpg_private.live2d_unit(m->'y') is not null);
  perform rpg_private.live2d_unit(m->'confidence');
  lid:=(m->>'locationId')::uuid;
  perform rpg_private.assert(not (lid = any(seen)));
  seen:=array_append(seen,lid);
  if not exists(select 1 from public.rpg_locations l where l.campaign_id=cid and l.id=lid) then raise exception 'rpg_conflict'; end if;
 end loop;
 return v;
end $$;
revoke all on function rpg_private.live2d_region_markers(uuid,jsonb) from public, anon, authenticated;

do $m$ declare d text; begin
 select pg_get_functiondef('public.rpg_live2d(uuid,uuid,text,jsonb)'::regprocedure) into d;
 -- region.save: the check, the side list and the markers ride along with the picture; the owner's markers stay.
 d:=replace(d,
  $a$  perform rpg_private.fields(p_payload,array['anchorId','pictureId','signature','status']);
  perform rpg_private.assert(jsonb_typeof(p_payload->'signature')='string' and p_payload->>'status' in ('drawing','ready','failed'));$a$,
  $b$  perform rpg_private.fields(p_payload,array['anchorId','pictureId','signature','status'],array['markers','check','sideList','picturePrepRevision']);
  perform rpg_private.assert(jsonb_typeof(p_payload->'signature')='string' and p_payload->>'status' in ('drawing','ready','flagged','failed'));
  if p_payload ? 'markers' then perform rpg_private.live2d_region_markers(p_campaign_id,p_payload->'markers'); end if;
  if p_payload ? 'check' then perform rpg_private.assert(p_payload->'check'='null'::jsonb or jsonb_typeof(p_payload->'check')='object'); end if;
  if p_payload ? 'sideList' then
   perform rpg_private.assert(jsonb_typeof(p_payload->'sideList')='array'
     and not exists(select 1 from jsonb_array_elements(p_payload->'sideList') e where jsonb_typeof(e)<>'string'));
  end if;
  if p_payload ? 'picturePrepRevision' then perform rpg_private.assert(p_payload->'picturePrepRevision'='null'::jsonb
    or (jsonb_typeof(p_payload->'picturePrepRevision')='number' and (p_payload->>'picturePrepRevision')::numeric>=0 and mod((p_payload->>'picturePrepRevision')::numeric,1)=0)); end if;$b$);
 d:=replace(d,
  $a$   on conflict(campaign_id,anchor_key) do update set picture_id=excluded.picture_id,signature=excluded.signature,status=excluded.status,updated_at=now()
   returning * into r;$a$,
  $b$   on conflict(campaign_id,anchor_key) do update set picture_id=excluded.picture_id,signature=excluded.signature,status=excluded.status,updated_at=now(),
     revision=rpg_private.live2d_region_maps.revision+1
   returning * into r;
  if p_payload ? 'markers' or p_payload ? 'check' or p_payload ? 'sideList' or p_payload ? 'picturePrepRevision' then
   -- The owner's moved markers are the highest authority: a new picture's markers never replace them.
   update rpg_private.live2d_region_maps x set
     markers=case when p_payload ? 'markers' then
       coalesce((select jsonb_agg(m) from jsonb_array_elements(p_payload->'markers') m
         where not exists(select 1 from jsonb_array_elements(x.markers) o where o->>'source'='owner' and o->>'locationId'=m->>'locationId')),'[]'::jsonb)
       || coalesce((select jsonb_agg(o) from jsonb_array_elements(x.markers) o where o->>'source'='owner'),'[]'::jsonb)
      else x.markers end,
     check_result=case when p_payload ? 'check' then nullif(p_payload->'check','null'::jsonb) else x.check_result end,
     side_list=case when p_payload ? 'sideList' then p_payload->'sideList' else x.side_list end,
     picture_prep_revision=case when p_payload ? 'picturePrepRevision' then nullif(p_payload->>'picturePrepRevision','')::integer else x.picture_prep_revision end
    where x.campaign_id=p_campaign_id and x.anchor_key=ak returning * into r;
  end if;$b$);
 -- region.prep.save: the prep's public part on its map, fenced by the prep revision, every version kept.
 -- region.marker.save: the owner moves one marker (the highest authority over its spot), fenced by the map revision.
 d:=replace(d,
  $a$ raise exception 'rpg_validation' using errcode='22023';
end$a$,
  $b$ if p_action='region.prep.save' then
  perform rpg_private.fields(p_payload,array['anchorId','prep','documentId','expectedRevision','source']);
  perform rpg_private.assert(jsonb_typeof(p_payload->'prep')='object' and octet_length((p_payload->'prep')::text)<=60000
    and jsonb_typeof(p_payload->'expectedRevision')='number' and p_payload->>'source' in ('model','owner')
    and (p_payload->'documentId'='null'::jsonb or jsonb_typeof(p_payload->'documentId')='string'));
  if p_payload->'anchorId'<>'null'::jsonb then aid:=(p_payload->>'anchorId')::uuid; else aid:=null; end if;
  ak:=coalesce(aid::text,'known');
  select * into r from rpg_private.live2d_region_maps x where x.campaign_id=p_campaign_id and x.anchor_key=ak for update;
  if not found then raise exception 'rpg_not_found'; end if;
  if r.prep_revision<>(p_payload->>'expectedRevision')::integer then raise exception 'rpg_conflict'; end if;
  if p_payload->'documentId'<>'null'::jsonb and not exists(select 1 from public.rpg_documents d where d.campaign_id=p_campaign_id and d.id=(p_payload->>'documentId')::uuid)
   then raise exception 'rpg_conflict'; end if;
  update rpg_private.live2d_region_maps x set prep=p_payload->'prep',prep_revision=x.prep_revision+1,
    prep_document_id=case when p_payload->'documentId'='null'::jsonb then x.prep_document_id else (p_payload->>'documentId')::uuid end,
    revision=x.revision+1,updated_at=now()
   where x.campaign_id=p_campaign_id and x.anchor_key=ak returning * into r;
  insert into rpg_private.live2d_region_prep_versions(campaign_id,anchor_key,revision,prep,document_id,source)
   values(p_campaign_id,ak,r.prep_revision,r.prep,r.prep_document_id,p_payload->>'source');
  return rpg_private.live2d_region_json(r);
 end if;

 if p_action='region.marker.save' then
  perform rpg_private.fields(p_payload,array['anchorId','locationId','x','y','expectedRevision']);
  perform rpg_private.assert(jsonb_typeof(p_payload->'expectedRevision')='number');
  px:=rpg_private.live2d_unit(p_payload->'x'); py:=rpg_private.live2d_unit(p_payload->'y');
  perform rpg_private.assert(px is not null and py is not null);
  lid:=(p_payload->>'locationId')::uuid;
  if not exists(select 1 from public.rpg_locations l where l.campaign_id=p_campaign_id and l.id=lid) then raise exception 'rpg_not_found'; end if;
  if p_payload->'anchorId'<>'null'::jsonb then aid:=(p_payload->>'anchorId')::uuid; else aid:=null; end if;
  ak:=coalesce(aid::text,'known');
  select * into r from rpg_private.live2d_region_maps x where x.campaign_id=p_campaign_id and x.anchor_key=ak for update;
  if not found then raise exception 'rpg_not_found'; end if;
  if r.revision<>(p_payload->>'expectedRevision')::integer then raise exception 'rpg_conflict'; end if;
  update rpg_private.live2d_region_maps x set
    markers=coalesce((select jsonb_agg(m) from jsonb_array_elements(x.markers) m where m->>'locationId'<>lid::text),'[]'::jsonb)
      || jsonb_build_array(jsonb_build_object('locationId',lid,'x',px,'y',py,'confidence',null,'source','owner','approximate',false)),
    revision=x.revision+1,updated_at=now()
   where x.campaign_id=p_campaign_id and x.anchor_key=ak returning * into r;
  return rpg_private.live2d_region_json(r);
 end if;

 raise exception 'rpg_validation' using errcode='22023';
end$b$);
 perform rpg_private.assert(d like '%''picturePrepRevision''%' and d like '%p_action=''region.prep.save''%' and d like '%p_action=''region.marker.save''%'
   and d like '%revision=rpg_private.live2d_region_maps.revision+1%');
 execute d;
end $m$;

do $$ begin if exists(select 1 from pg_roles where rolname='service_role') then
 revoke all on function rpg_private.live2d_region_markers(uuid,jsonb) from service_role;
end if; end $$;

commit;
