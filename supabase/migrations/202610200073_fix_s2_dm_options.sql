-- Fix run after session 2: the DM's options as one small object on the campaign's DM settings, instead of a
-- column per switch. TypeScript (`src/lib/gameplay/dm-loop/settings.ts`, `parseDmOptions`) names the keys and
-- their values and is the only writer; SQL keeps the shape bounded:
--   continuation   — A3: «Продолжение хода»: 'same' (as the first request) or 'lighter' (one notch lower);
--   instructions   — B4: «Инструкции ведущего»: 'ru' (native Russian) or 'en' (English with the Russian voice);
--   companionRolls — C (item 44): who rolls for the companions: 'dm' (compact lines) or 'player' (cards);
--   secretsVisible — B1: the owner opted in to read the DM's hidden layer (default: no);
--   historyWindow  — A2: «Окно истории», the tokens of recent scenes the DM reads verbatim.
-- A save sends the keys it changes; they are merged into the stored object. The read returns the object
-- (empty for a campaign that never set one; the defaults live in TypeScript).
-- Additive only: one column, two function bodies rewritten from their current definitions.
begin;

alter table rpg_private.dm_settings add column dm_options jsonb not null default '{}'::jsonb
  check (jsonb_typeof(dm_options)='object' and octet_length(dm_options::text)<=2000);

create function rpg_private.dm_options_valid(v jsonb) returns boolean
language sql immutable set search_path='' as $$
 select jsonb_typeof(v)='object' and octet_length(v::text)<=2000 and not exists(
   select 1 from jsonb_each(v) e where e.key !~ '^[a-zA-Z]{1,40}$'
     or not (jsonb_typeof(e.value)='boolean' or (jsonb_typeof(e.value)='string' and length(e.value#>>'{}') between 1 and 40)
       or (jsonb_typeof(e.value)='number' and (e.value#>>'{}')::numeric between 0 and 10000000)))
$$;
revoke all on function rpg_private.dm_options_valid(jsonb) from public,anon,authenticated;

do $$ declare d text; begin
 select pg_get_functiondef('rpg_private.dm_settings_read(uuid)'::regprocedure) into d;
 d:=replace(d,'''voiceExamples'',s.voice_examples,','''voiceExamples'',s.voice_examples,''options'',s.dm_options,');
 d:=replace(d,'''voiceExamples'',false,','''voiceExamples'',false,''options'',''{}''::jsonb,');
 perform rpg_private.assert(d like '%''options'',s.dm_options%' and d like '%''options'',''{}''::jsonb%');
 execute d;

 select pg_get_functiondef('public.rpg_dm_settings(uuid,uuid,text,jsonb,jsonb)'::regprocedure) into d;
 d:=replace(d,'''voiceTokenCap'',''split'',''snapshotsKeep'']',  '''voiceTokenCap'',''split'',''snapshotsKeep'',''options'']');
 d:=replace(d,' perform rpg_private.assert(next_voice is not null);',
  ' perform rpg_private.assert(next_voice is not null);
 -- Fix run after session 2: the DM options, merged key by key into the stored object.
 if p_payload ? ''options'' then
   perform rpg_private.assert(rpg_private.dm_options_valid(p_payload->''options''));
   next_options:=coalesce(stored.dm_options,''{}''::jsonb)||(p_payload->''options'');
   perform rpg_private.assert(rpg_private.dm_options_valid(next_options));
 else next_options:=coalesce(stored.dm_options,''{}''::jsonb); end if;');
 d:=replace(d,'voice_mode,voice_token_cap,dm_split,snapshots_keep,revision)','voice_mode,voice_token_cap,dm_split,snapshots_keep,dm_options,revision)');
 d:=replace(d,'next_mode,next_cap,next_split,next_keep,1)','next_mode,next_cap,next_split,next_keep,next_options,1)');
 d:=replace(d,'snapshots_keep=excluded.snapshots_keep,','snapshots_keep=excluded.snapshots_keep,dm_options=excluded.dm_options,');
 d:=replace(d,'next_mode text; next_cap integer;','next_mode text; next_cap integer; next_options jsonb;');
 perform rpg_private.assert(d like '%''snapshotsKeep'',''options''%' and d like '%next_options:=%' and d like '%dm_options=excluded.dm_options%'
   and d like '%next_keep,next_options,1)%' and d like '%next_options jsonb;%');
 execute d;
end $$;

-- The turn's source carries the options, so the context builder (the history window, the instruction
-- language) and a replayed snapshot read the same values the turn played with.
alter function rpg_private.runtime_source(uuid,uuid,text) rename to runtime_source_before_dm_options;
create function rpg_private.runtime_source(cid uuid,uid uuid,mode text default 'game') returns jsonb
language plpgsql stable set search_path='' as $$
declare result jsonb:=rpg_private.runtime_source_before_dm_options(cid,uid,mode); options jsonb; begin
 select d.dm_options into options from rpg_private.dm_settings d where d.campaign_id=cid;
 return result||jsonb_build_object('dmOptions',coalesce(options,'{}'::jsonb));
end $$;
revoke all on function rpg_private.runtime_source_before_dm_options(uuid,uuid,text),rpg_private.runtime_source(uuid,uuid,text) from public,anon,authenticated;

revoke all on all functions in schema rpg_private from public,anon,authenticated;

commit;
