-- Persona memory 1 (docs/stages/PERSONA_MEMORY_1.md): the planner persona's memory store — episodes with validity
-- windows and dated re-reading notes, the self-dossier, facts, folds, and a cache of embeddings. A store of the
-- owner's, not of a campaign: no campaign_id, nothing here reads or writes the game. Additive only: nothing earlier
-- changes. Logic lives in TypeScript (src/lib/persona-memory); this file keeps the invariants — provenance on every
-- line, an episode's original fields immutable, notes and folds append-only, a fold marks every episode or none, a
-- superseded dossier line or a replaced fact closed rather than rewritten. The RPC is executable by service_role only.
begin;

create schema persona_memory;
revoke all on schema persona_memory from public, anon, authenticated;

create function persona_memory.iso(p_at timestamptz) returns text
language sql stable set search_path='' as $$
 select case when p_at is null then null else to_char(p_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') end
$$;

-- Lines with provenance: {text, author, tag}; quotes also carry the speaker, and the owner's words are always stated.
create function persona_memory.lines_valid(p_lines jsonb, p_min integer, p_max integer, p_max_chars integer, p_quotes boolean) returns boolean
language sql immutable set search_path='' as $$
 select jsonb_typeof(p_lines)='array' and jsonb_array_length(p_lines) between p_min and p_max
  and not exists(select 1 from jsonb_array_elements(p_lines) l(v) where
   jsonb_typeof(l.v)<>'object'
   or coalesce(jsonb_typeof(l.v->'text'),'')<>'string'
   or coalesce(length(btrim(l.v->>'text')),0) not between 1 and p_max_chars
   or coalesce(l.v->>'author','') not in ('self','background','owner')
   or coalesce(l.v->>'tag','') not in ('stated','observed','inferred')
   or (p_quotes and (coalesce(l.v->>'speaker','') not in ('owner','self','other') or ((l.v->>'speaker')='owner') <> ((l.v->>'tag')='stated'))))
$$;

-- Cues are «what» keys; the date check by words lives in TypeScript, a digit date is refused here too.
create function persona_memory.cues_valid(p_cues jsonb, p_min integer) returns boolean
language sql immutable set search_path='' as $$
 select jsonb_typeof(p_cues)='array' and jsonb_array_length(p_cues) between p_min and 24
  and not exists(select 1 from jsonb_array_elements(p_cues) c(v) where
   jsonb_typeof(c.v)<>'string' or coalesce(length(btrim(c.v#>>'{}')),0) not between 1 and 80 or (c.v#>>'{}') ~ '\d{4}-\d{1,2}')
$$;

create table persona_memory.folds (
  id text primary key check (id ~ '^fold_[a-z0-9_]{6,80}$'),
  owner_id uuid not null references auth.users(id),
  recorded_at timestamptz not null,
  range_from timestamptz,
  range_to timestamptz,
  episode_ids jsonb not null check (jsonb_typeof(episode_ids)='array' and jsonb_array_length(episode_ids) between 2 and 1000),
  summary jsonb not null check (persona_memory.lines_valid(summary,1,12,1500,false)),
  cues jsonb not null default '[]' check (persona_memory.cues_valid(cues,0))
);

create table persona_memory.episodes (
  id text primary key check (id ~ '^ep_[a-z0-9_]{6,80}$'),
  owner_id uuid not null references auth.users(id),
  recorded_at timestamptz not null,
  valid_from timestamptz not null,
  valid_to timestamptz,
  title text not null default '' check (length(title) <= 200),
  salience integer not null check (salience between 1 and 5),
  cues jsonb not null check (persona_memory.cues_valid(cues,1)),
  lines jsonb not null check (persona_memory.lines_valid(lines,1,60,4000,false)),
  state jsonb not null check (persona_memory.lines_valid(state,1,12,1000,false)),
  quotes jsonb not null default '[]' check (persona_memory.lines_valid(quotes,0,5,1000,true)),
  source text not null check (length(source) between 1 and 200),
  folded_into text references persona_memory.folds(id),
  original_sha256 text not null check (original_sha256 ~ '^[0-9a-f]{64}$'),
  check (valid_to is null or valid_to >= valid_from)
);
create index persona_episodes_moment on persona_memory.episodes(owner_id, valid_from desc);

create table persona_memory.episode_notes (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id),
  episode_id text not null references persona_memory.episodes(id) on delete cascade,
  at timestamptz not null,
  lines jsonb not null check (persona_memory.lines_valid(lines,1,20,2000,false)),
  closes timestamptz
);
create index persona_notes_episode on persona_memory.episode_notes(episode_id, id);

create table persona_memory.dossier_lines (
  id text primary key check (id ~ '^dl_[a-z0-9_]{6,80}$'),
  owner_id uuid not null references auth.users(id),
  section text not null check (section in ('rules','identity','voice','strengths','weaknesses','references')),
  text text not null check (length(btrim(text)) between 1 and 600 and position(E'\n' in text)=0),
  author text not null check (author in ('self','background','owner')),
  tag text not null check (tag in ('stated','observed','inferred')),
  recorded_at timestamptz not null,
  valid_from timestamptz not null,
  valid_to timestamptz,
  supersedes text references persona_memory.dossier_lines(id),
  source text not null check (length(source) between 1 and 200),
  check (valid_to is null or valid_to >= valid_from)
);
create unique index persona_dossier_supersedes on persona_memory.dossier_lines(supersedes) where supersedes is not null;

create table persona_memory.facts (
  id text primary key check (id ~ '^fact_[a-z0-9_]{6,80}$'),
  owner_id uuid not null references auth.users(id),
  key text not null check (key ~ '^[a-z0-9][a-z0-9_.-]{0,79}$'),
  text text not null check (length(btrim(text)) between 1 and 2000),
  author text not null check (author in ('self','background','owner')),
  tag text not null check (tag in ('stated','observed','inferred')),
  recorded_at timestamptz not null,
  valid_from timestamptz not null,
  valid_to timestamptz,
  source text not null check (length(source) between 1 and 200),
  check (valid_to is null or valid_to >= valid_from)
);
create unique index persona_facts_open on persona_memory.facts(owner_id, key) where valid_to is null;

create table persona_memory.embeddings (
  owner_id uuid not null references auth.users(id),
  model text not null check (length(model) between 1 and 120),
  content_key text not null check (content_key ~ '^[0-9a-f]{32}$'),
  vector real[] not null check (cardinality(vector) between 1 and 8192),
  primary key (owner_id, model, content_key)
);

alter table persona_memory.folds enable row level security;
alter table persona_memory.episodes enable row level security;
alter table persona_memory.episode_notes enable row level security;
alter table persona_memory.dossier_lines enable row level security;
alter table persona_memory.facts enable row level security;
alter table persona_memory.embeddings enable row level security;
revoke all on persona_memory.folds, persona_memory.episodes, persona_memory.episode_notes, persona_memory.dossier_lines,
 persona_memory.facts, persona_memory.embeddings from public, anon, authenticated;

-- An episode's original fields never change; validTo and foldedInto are set once.
create function persona_memory.episode_immutable() returns trigger
language plpgsql set search_path='' as $$
begin
 if (to_jsonb(new) - 'valid_to' - 'folded_into') is distinct from (to_jsonb(old) - 'valid_to' - 'folded_into')
   or (old.valid_to is not null and new.valid_to is distinct from old.valid_to)
   or (old.folded_into is not null and new.folded_into is distinct from old.folded_into)
 then raise exception 'persona_immutable' using errcode='22023'; end if;
 return new;
end $$;
create trigger persona_episode_immutable before update on persona_memory.episodes for each row execute function persona_memory.episode_immutable();

create function persona_memory.append_only() returns trigger
language plpgsql set search_path='' as $$
begin raise exception 'persona_immutable' using errcode='22023'; end $$;
create trigger persona_notes_append_only before update on persona_memory.episode_notes for each row execute function persona_memory.append_only();
create trigger persona_folds_append_only before update on persona_memory.folds for each row execute function persona_memory.append_only();

-- A dossier line or a fact is closed once (validTo set), never otherwise changed.
create function persona_memory.close_only() returns trigger
language plpgsql set search_path='' as $$
begin
 if old.valid_to is not null or new.valid_to is null or (to_jsonb(new) - 'valid_to') is distinct from (to_jsonb(old) - 'valid_to')
 then raise exception 'persona_immutable' using errcode='22023'; end if;
 return new;
end $$;
create trigger persona_dossier_close_only before update on persona_memory.dossier_lines for each row execute function persona_memory.close_only();
create trigger persona_facts_close_only before update on persona_memory.facts for each row execute function persona_memory.close_only();

create function persona_memory.episode_json(e persona_memory.episodes) returns jsonb
language sql stable set search_path='' as $$
 select jsonb_build_object('id',e.id,'recordedAt',persona_memory.iso(e.recorded_at),'validFrom',persona_memory.iso(e.valid_from),
  'validTo',persona_memory.iso(e.valid_to),'title',e.title,'salience',e.salience,'cues',e.cues,'lines',e.lines,'state',e.state,'quotes',e.quotes,
  'source',e.source,'foldedInto',e.folded_into,'originalSha256',e.original_sha256,
  'notes',coalesce((select jsonb_agg(jsonb_build_object('at',persona_memory.iso(n.at),'lines',n.lines,'closes',persona_memory.iso(n.closes)) order by n.id)
   from persona_memory.episode_notes n where n.episode_id=e.id),'[]'::jsonb))
$$;

create function persona_memory.line_json(p_id text, p_text text, p_author text, p_tag text, p_recorded timestamptz, p_from timestamptz, p_to timestamptz, p_source text) returns jsonb
language sql stable set search_path='' as $$
 select jsonb_build_object('id',p_id,'text',p_text,'author',p_author,'tag',p_tag,'recordedAt',persona_memory.iso(p_recorded),
  'validFrom',persona_memory.iso(p_from),'validTo',persona_memory.iso(p_to),'source',p_source)
$$;

create function public.persona_memory(p_owner_id uuid, p_action text, p_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare
 v jsonb; ep persona_memory.episodes%rowtype; ids text[]; changed integer;
begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id)
   then raise exception 'persona_forbidden' using errcode='42501'; end if;
 -- One writer at a time per owner: a fold and a note on the same episode never interleave.
 perform pg_advisory_xact_lock(hashtext('persona_memory:'||p_owner_id::text)::bigint);

 if p_action='episode.insert' then
  v:=p_payload->'episode';
  insert into persona_memory.episodes(id,owner_id,recorded_at,valid_from,valid_to,title,salience,cues,lines,state,quotes,source,original_sha256)
  values(v->>'id',p_owner_id,(v->>'recordedAt')::timestamptz,(v->>'validFrom')::timestamptz,(v->>'validTo')::timestamptz,coalesce(v->>'title',''),
   (v->>'salience')::integer,v->'cues',v->'lines',v->'state',coalesce(v->'quotes','[]'::jsonb),v->>'source',v->>'originalSha256');
  return jsonb_build_object('ok',true);
 end if;

 if p_action='episodes.list' then
  return coalesce((select jsonb_agg(persona_memory.episode_json(x) order by x.valid_from, x.id) from persona_memory.episodes x where x.owner_id=p_owner_id),'[]'::jsonb);
 end if;

 if p_action='episode.note' then
  select * into ep from persona_memory.episodes x where x.id=p_payload->>'episodeId' and x.owner_id=p_owner_id for update;
  if not found then raise exception 'persona_not_found' using errcode='P0002'; end if;
  v:=p_payload->'note';
  if v->>'closes' is not null then
   if ep.valid_to is not null then raise exception 'persona_conflict' using errcode='40001'; end if;
   update persona_memory.episodes set valid_to=(v->>'closes')::timestamptz where id=ep.id;
  end if;
  insert into persona_memory.episode_notes(owner_id,episode_id,at,lines,closes) values(p_owner_id,ep.id,(v->>'at')::timestamptz,v->'lines',(v->>'closes')::timestamptz);
  select * into ep from persona_memory.episodes x where x.id=ep.id;
  return persona_memory.episode_json(ep);
 end if;

 if p_action='fold.insert' then
  v:=p_payload->'fold';
  select coalesce(array_agg(x),'{}') into ids from jsonb_array_elements_text(v->'episodeIds') x;
  insert into persona_memory.folds(id,owner_id,recorded_at,range_from,range_to,episode_ids,summary,cues)
  values(v->>'id',p_owner_id,(v->>'recordedAt')::timestamptz,(v#>>'{range,from}')::timestamptz,(v#>>'{range,to}')::timestamptz,v->'episodeIds',v->'summary',coalesce(v->'cues','[]'::jsonb));
  update persona_memory.episodes set folded_into=v->>'id' where owner_id=p_owner_id and id=any(ids) and folded_into is null;
  get diagnostics changed=row_count;
  if changed<>cardinality(ids) then raise exception 'persona_conflict' using errcode='40001'; end if;
  return jsonb_build_object('ok',true);
 end if;

 if p_action='folds.list' then
  return coalesce((select jsonb_agg(jsonb_build_object('id',f.id,'recordedAt',persona_memory.iso(f.recorded_at),
   'range',jsonb_build_object('from',persona_memory.iso(f.range_from),'to',persona_memory.iso(f.range_to)),'episodeIds',f.episode_ids,'summary',f.summary,'cues',f.cues)
   order by f.recorded_at, f.id) from persona_memory.folds f where f.owner_id=p_owner_id),'[]'::jsonb);
 end if;

 if p_action='dossier.list' then
  return coalesce((select jsonb_agg(persona_memory.line_json(d.id,d.text,d.author,d.tag,d.recorded_at,d.valid_from,d.valid_to,d.source)
   ||jsonb_build_object('section',d.section,'supersedes',d.supersedes) order by d.recorded_at, d.id) from persona_memory.dossier_lines d where d.owner_id=p_owner_id),'[]'::jsonb);
 end if;

 if p_action='dossier.append' then
  for v in select x from jsonb_array_elements(p_payload->'lines') x loop
   if v->>'supersedes' is not null then
    update persona_memory.dossier_lines set valid_to=(v->>'validFrom')::timestamptz where id=v->>'supersedes' and owner_id=p_owner_id and valid_to is null;
    if not found then raise exception 'persona_conflict' using errcode='40001'; end if;
   end if;
   insert into persona_memory.dossier_lines(id,owner_id,section,text,author,tag,recorded_at,valid_from,valid_to,supersedes,source)
   values(v->>'id',p_owner_id,v->>'section',v->>'text',v->>'author',v->>'tag',(v->>'recordedAt')::timestamptz,(v->>'validFrom')::timestamptz,null,v->>'supersedes',v->>'source');
  end loop;
  return jsonb_build_object('ok',true);
 end if;

 if p_action='facts.list' then
  return coalesce((select jsonb_agg(persona_memory.line_json(f.id,f.text,f.author,f.tag,f.recorded_at,f.valid_from,f.valid_to,f.source)
   ||jsonb_build_object('key',f.key) order by f.key, f.valid_from) from persona_memory.facts f where f.owner_id=p_owner_id),'[]'::jsonb);
 end if;

 if p_action='fact.set' then
  v:=p_payload->'fact';
  update persona_memory.facts set valid_to=(v->>'validFrom')::timestamptz where owner_id=p_owner_id and key=v->>'key' and valid_to is null;
  insert into persona_memory.facts(id,owner_id,key,text,author,tag,recorded_at,valid_from,valid_to,source)
  values(v->>'id',p_owner_id,v->>'key',v->>'text',v->>'author',v->>'tag',(v->>'recordedAt')::timestamptz,(v->>'validFrom')::timestamptz,null,v->>'source');
  return jsonb_build_object('ok',true);
 end if;

 if p_action='embeddings.get' then
  return coalesce((select jsonb_object_agg(m.content_key,to_jsonb(m.vector)) from persona_memory.embeddings m
   where m.owner_id=p_owner_id and m.model=p_payload->>'model' and m.content_key in (select jsonb_array_elements_text(p_payload->'keys'))),'{}'::jsonb);
 end if;

 if p_action='embeddings.put' then
  insert into persona_memory.embeddings(owner_id,model,content_key,vector)
  select p_owner_id,p_payload->>'model',x->>'key',array(select jsonb_array_elements_text(x->'vector')::real) from jsonb_array_elements(p_payload->'entries') x
  on conflict do nothing;
  return jsonb_build_object('ok',true);
 end if;

 raise exception 'persona_validation' using errcode='22023';
end $$;

revoke all on function persona_memory.iso(timestamptz), persona_memory.lines_valid(jsonb,integer,integer,integer,boolean), persona_memory.cues_valid(jsonb,integer),
 persona_memory.episode_immutable(), persona_memory.append_only(), persona_memory.close_only(), persona_memory.episode_json(persona_memory.episodes),
 persona_memory.line_json(text,text,text,text,timestamptz,timestamptz,timestamptz,text) from public, anon, authenticated;
revoke all on function public.persona_memory(uuid,text,jsonb) from public, anon, authenticated;
do $$ begin if exists(select 1 from pg_roles where rolname='service_role') then
 grant execute on function public.persona_memory(uuid,text,jsonb) to service_role;
end if; end $$;
commit;
