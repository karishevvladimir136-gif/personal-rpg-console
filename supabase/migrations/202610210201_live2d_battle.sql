-- 2D Live, part 2 (docs/stages/LIVE2D_1.md): the battlefield of an encounter —
-- the grid, its features (cover, difficult ground, light, burning areas, walls,
-- elevation), the active turn pointer, the pending reaction and the roll log —
-- as one JSON column on the encounter, written by the turn's commit together
-- with the participants (positions on the grid in public_position, the
-- combatant's economy, conditions, HP mirror and knowledge in public_resources:
-- those columns already carry any object). Plus the top-down battle background
-- per place. Additive only: a column with a default, the runtime RPC's field
-- list and the play projection patched in place (as migrations 64 and 67 patch
-- rpg_pictures), two actions added to rpg_live2d. Logic lives in TypeScript
-- (src/lib/live2d/battle); SQL keeps the shape an object.
begin;

alter table public.rpg_encounters add column public_field jsonb not null default '{}' check (jsonb_typeof(public_field)='object');

-- The commit accepts public_field for the encounters family (the field lists live in the
-- change validator since migration 48).
do $m$ declare d text; begin
 select pg_get_functiondef('rpg_private.runtime_change_before_astra_ordered(uuid,uuid,jsonb)'::regprocedure) into d;
 d:=replace(d,
  $a$when 'encounters' then fields:=array['status','round','outcome','settings_revision','public_summary'];$a$,
  $b$when 'encounters' then fields:=array['status','round','outcome','settings_revision','public_summary','public_field'];$b$);
 perform rpg_private.assert(d like '%''public_summary'',''public_field''%');
 execute d;
end $m$;

-- The play projection carries it to every client.
do $m$ declare d text; begin
 select pg_get_functiondef('rpg_private.runtime_play(uuid)'::regprocedure) into d;
 d:=replace(d,
  $a$'settings_revision',settings_revision,'public_summary',public_summary)) from public.rpg_encounters$a$,
  $b$'settings_revision',settings_revision,'public_summary',public_summary,'public_field',public_field)) from public.rpg_encounters$b$);
 perform rpg_private.assert(d like '%''public_field'',public_field)) from public.rpg_encounters%');
 execute d;
end $m$;

-- The top-down battle background of a place: one per sheet revision, checked like a scene.
create table rpg_private.live2d_battle_maps (
  campaign_id uuid not null references public.rpg_campaigns(id),
  location_id uuid not null,
  sheet_revision integer not null check (sheet_revision >= 0),
  picture_id uuid references rpg_private.pictures(id),
  status text not null check (status in ('drawing','ready','flagged','failed')),
  check_result jsonb check (check_result is null or jsonb_typeof(check_result)='object'),
  grid jsonb not null default '{"cols":24,"rows":18,"feetPerCell":5}' check (jsonb_typeof(grid)='object'),
  updated_at timestamptz not null default now(),
  primary key (campaign_id, location_id),
  foreign key (campaign_id, location_id) references public.rpg_locations(campaign_id, id)
);
alter table rpg_private.live2d_battle_maps enable row level security;
revoke all on rpg_private.live2d_battle_maps from public, anon, authenticated;

create function rpg_private.live2d_battle_json(b rpg_private.live2d_battle_maps) returns jsonb
language sql immutable set search_path='' as $$
 select jsonb_build_object('locationId',b.location_id,'sheetRevision',b.sheet_revision,'pictureId',b.picture_id,'status',b.status,
  'check',b.check_result,'grid',b.grid,'updatedAt',b.updated_at)
$$;
revoke all on function rpg_private.live2d_battle_json(rpg_private.live2d_battle_maps) from public, anon, authenticated;

-- rpg_live2d: the read carries battleMaps; battle.save upserts one.
do $m$ declare d text; begin
 select pg_get_functiondef('public.rpg_live2d(uuid,uuid,text,jsonb)'::regprocedure) into d;
 d:=replace(d,
  $a$   'regionMaps',coalesce((select jsonb_agg(rpg_private.live2d_region_json(x) order by x.anchor_key) from rpg_private.live2d_region_maps x where x.campaign_id=p_campaign_id),'[]'));$a$,
  $b$   'regionMaps',coalesce((select jsonb_agg(rpg_private.live2d_region_json(x) order by x.anchor_key) from rpg_private.live2d_region_maps x where x.campaign_id=p_campaign_id),'[]'),
   'battleMaps',coalesce((select jsonb_agg(rpg_private.live2d_battle_json(b) order by b.location_id) from rpg_private.live2d_battle_maps b where b.campaign_id=p_campaign_id),'[]'));$b$);
 d:=replace(d,
  $a$ raise exception 'rpg_validation' using errcode='22023';
end$a$,
  $b$ if p_action='battle.save' then
  perform rpg_private.fields(p_payload,array['locationId','sheetRevision','pictureId','status'],array['check','grid']);
  perform rpg_private.assert(jsonb_typeof(p_payload->'sheetRevision')='number' and p_payload->>'status' in ('drawing','ready','flagged','failed')
    and (not (p_payload ? 'check') or p_payload->'check'='null'::jsonb or jsonb_typeof(p_payload->'check')='object')
    and (not (p_payload ? 'grid') or jsonb_typeof(p_payload->'grid')='object'));
  if not exists(select 1 from public.rpg_locations l where l.campaign_id=p_campaign_id and l.id=(p_payload->>'locationId')::uuid) then raise exception 'rpg_not_found'; end if;
  if p_payload->'pictureId'<>'null'::jsonb and not exists(select 1 from rpg_private.pictures x where x.id=(p_payload->>'pictureId')::uuid and x.campaign_id=p_campaign_id) then raise exception 'rpg_conflict'; end if;
  insert into rpg_private.live2d_battle_maps(campaign_id,location_id,sheet_revision,picture_id,status,check_result,grid)
   values(p_campaign_id,(p_payload->>'locationId')::uuid,(p_payload->>'sheetRevision')::integer,nullif(p_payload->>'pictureId','')::uuid,p_payload->>'status',
    case when p_payload ? 'check' and p_payload->'check'<>'null'::jsonb then p_payload->'check' else null end,
    coalesce(p_payload->'grid','{"cols":24,"rows":18,"feetPerCell":5}'::jsonb))
   on conflict(campaign_id,location_id) do update set sheet_revision=excluded.sheet_revision,picture_id=excluded.picture_id,status=excluded.status,
    check_result=excluded.check_result,grid=excluded.grid,updated_at=now();
  return (select rpg_private.live2d_battle_json(b) from rpg_private.live2d_battle_maps b where b.campaign_id=p_campaign_id and b.location_id=(p_payload->>'locationId')::uuid);
 end if;

 raise exception 'rpg_validation' using errcode='22023';
end$b$);
 perform rpg_private.assert(d like '%''battleMaps''%' and d like '%p_action=''battle.save''%');
 execute d;
end $m$;

do $$ begin if exists(select 1 from pg_roles where rolname='service_role') then
 grant select,insert,update on rpg_private.live2d_battle_maps to service_role;
end if; end $$;

commit;
