-- Polish 3, part 7 (docs/stages/POLISH_3.md §7): each DM Craft key has a role — writer,
-- bookkeeper or both (the default). The single loop gets every selected card; in the split
-- the writer gets writer + both and the bookkeeper bookkeeper + both. Versions are immutable
-- history (rpg_immutable_history), so the role is a per-key owner setting in its own table,
-- read into every version's JSON; a save that names a role sets the key's role. Additive.
-- The 22 active keys get their role by content; new owners get the same through the seed.
begin;

create table rpg_private.dm_craft_roles (
  owner_id uuid not null references auth.users(id),
  key text not null check (key ~ '^[a-z][a-z0-9-]{1,79}$'),
  role text not null check (role in ('writer','bookkeeper','both')),
  updated_at timestamptz not null default now(),
  primary key (owner_id,key)
);
alter table rpg_private.dm_craft_roles enable row level security;
revoke all on rpg_private.dm_craft_roles from public,anon,authenticated;

create or replace function rpg_private.dm_craft_json(v rpg_private.dm_craft_versions) returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('id',v.id,'key',v.key,'version',v.version,'kind',v.kind,'category',v.category,'stages',to_jsonb(v.stages),'triggers',to_jsonb(v.triggers),
   'role',coalesce((select r.role from rpg_private.dm_craft_roles r where r.owner_id=v.owner_id and r.key=v.key),'both'),
   'en',v.en,'ru',v.ru,'provenance',v.provenance,'createdAt',v.created_at)
$$;

do $m$ declare d text; begin
 -- The entry validator: an optional role.
 select pg_get_functiondef('rpg_private.dm_craft_entry_valid(jsonb)'::regprocedure) into d;
 d:=replace(d,'perform rpg_private.fields(v,array[''key'',''kind'',''category'',''stages'',''triggers'',''en'',''ru'',''provenance'']);',
   'perform rpg_private.fields(v,array[''key'',''kind'',''category'',''stages'',''triggers'',''en'',''ru'',''provenance''],array[''role'']);
 if v ? ''role'' then perform rpg_private.assert(jsonb_typeof(v->''role'')=''string'' and v->>''role'' in (''writer'',''bookkeeper'',''both'')); end if;');
 perform rpg_private.assert(d like '%array[''role'']);%' and d like '%v->>''role'' in (''writer'',''bookkeeper'',''both'')%');
 execute d;
 -- The save: a named role sets the key's role (an omitted one keeps it).
 select pg_get_functiondef('public.rpg_dm_craft(uuid,text,jsonb)'::regprocedure) into d;
 d:=replace(d,'entry->''en'',entry->''ru'',entry->>''provenance'') returning * into v;',
   'entry->''en'',entry->''ru'',entry->>''provenance'') returning * into v;
  if entry ? ''role'' then insert into rpg_private.dm_craft_roles(owner_id,key,role) values(uid,craft_key,entry->>''role'')
   on conflict (owner_id,key) do update set role=excluded.role,updated_at=now(); end if;');
 perform rpg_private.assert(d like '%insert into rpg_private.dm_craft_roles(owner_id,key,role) values(uid,craft_key,entry->>''role'')%');
 execute d;
end $m$;

-- The roles of the active keys by their content: records → bookkeeper; the clock through tools,
-- private clue and question notes and off-screen plans beside narration craft → both; narration
-- craft → writer. The doctrine is both. An owner's own choice (a later save) is never overwritten.
create function rpg_private.dm_craft_roles_20261018(uid uuid) returns void language plpgsql set search_path='' as $$
begin
 insert into rpg_private.dm_craft_roles(owner_id,key,role)
  select uid,k,r from (values
   ('records-match-the-fiction','bookkeeper'),
   ('core-doctrine','both'),('time-and-clock','both'),('heros-knowledge','both'),('open-questions-and-tics','both'),('living-world','both'),('heros-moment','both'),
   ('world-resistance','writer'),('villains-and-theme','writer'),('systemic-world','writer'),('danger-and-pacing','writer'),('long-campaign','writer'),
   ('afterglow-rhythm','writer'),('cognitive-world','writer'),('consequence-and-recovery','writer'),('living-characters','writer'),('npc-trajectories','writer'),
   ('player-goals-and-backstory','writer'),('promises-and-relationships','writer'),('quiet-and-decompression','writer'),('return-with-delta','writer'),('threads-and-payoff','writer')
  ) as x(k,r)
  on conflict (owner_id,key) do nothing;
end $$;

alter function rpg_private.dm_craft_seed(uuid) rename to dm_craft_seed_before_roles;
create function rpg_private.dm_craft_seed(uid uuid) returns void language plpgsql set search_path='' as $$
begin
 perform rpg_private.dm_craft_seed_before_roles(uid);
 perform rpg_private.dm_craft_roles_20261018(uid);
end $$;
revoke all on function rpg_private.dm_craft_roles_20261018(uuid),rpg_private.dm_craft_seed_before_roles(uuid),rpg_private.dm_craft_seed(uuid) from public,anon,authenticated;
do $$ declare uid uuid; begin for uid in select user_id from rpg_private.owner_registry loop perform rpg_private.dm_craft_roles_20261018(uid); end loop; end $$;

commit;
