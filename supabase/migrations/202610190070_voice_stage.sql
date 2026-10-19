-- Voice stage (docs/stages/VOICE.md «The build»): the examples mode and the token cap of
-- «Образцы голоса» (part 3), the per-turn log of the quotable-line check (part 5), and the
-- owner's replay fix of 2026-10-18 (the snapshot list listed no pre-migration-68 turn: inside
-- rpg_turn_snapshots the variable `t` shadowed the table alias `t` under use_variable).
-- Additive only: no column dropped, no row removed.
begin;

-- 1. The examples mode and the cap (part 3) -----------------------------------------------
-- off · five (diverse by kind, stable per session) · all (the whole bank up to the token cap,
-- in the cached layer 1). The old boolean stays as a mirror (mode <> 'off'): a campaign that had
-- the switch on gets «five».
alter table rpg_private.dm_settings add column voice_mode text not null default 'off' check (voice_mode in ('off','five','all'));
alter table rpg_private.dm_settings add column voice_token_cap integer not null default 30000 check (voice_token_cap between 1000 and 150000);
update rpg_private.dm_settings set voice_mode='five' where voice_examples;
-- The bank (about 40 passages of 150–400 words) is about 80 000 characters; the store takes 200 000.
alter table rpg_private.voice_samples drop constraint voice_samples_samples_check;
alter table rpg_private.voice_samples add constraint voice_samples_samples_check check (length(samples)<=200000);

do $$ declare d text; begin
 select pg_get_functiondef('rpg_private.dm_settings_read(uuid)'::regprocedure) into d;
 d:=replace(d,'''voiceExamples'',s.voice_examples,','''voiceExamples'',s.voice_examples,''voiceMode'',s.voice_mode,''voiceTokenCap'',s.voice_token_cap,');
 d:=replace(d,'''voiceExamples'',false,','''voiceExamples'',false,''voiceMode'',''off'',''voiceTokenCap'',30000,');
 perform rpg_private.assert(d like '%''voiceMode'',s.voice_mode%' and d like '%''voiceMode'',''off''%');
 execute d;

 select pg_get_functiondef('public.rpg_dm_settings(uuid,uuid,text,jsonb,jsonb)'::regprocedure) into d;
 d:=replace(d,'array[''limits'',''depth'',''notebookVisible'',''boostNext'',''voiceExamples'',''split'',''snapshotsKeep'']',
  'array[''limits'',''depth'',''notebookVisible'',''boostNext'',''voiceExamples'',''voiceMode'',''voiceTokenCap'',''split'',''snapshotsKeep'']');
 d:=replace(d,' perform rpg_private.assert(next_voice is not null);',
  ' perform rpg_private.assert(next_voice is not null);
 -- Voice stage part 3: the mode (the old boolean maps to five/off), the token cap of «all».
 next_mode:=case when p_payload ? ''voiceMode'' then p_payload->>''voiceMode''
   when p_payload ? ''voiceExamples'' then case when next_voice then (case when coalesce(stored.voice_mode,''off'')=''off'' then ''five'' else stored.voice_mode end) else ''off'' end
   else coalesce(stored.voice_mode,''off'') end;
 perform rpg_private.assert(next_mode in (''off'',''five'',''all''));
 next_voice:=next_mode<>''off'';
 if p_payload ? ''voiceTokenCap'' then
   perform rpg_private.assert(jsonb_typeof(p_payload->''voiceTokenCap'')=''number'' and (p_payload->>''voiceTokenCap'')::numeric between 1000 and 150000
     and mod((p_payload->>''voiceTokenCap'')::numeric,1)=0);
   next_cap:=(p_payload->>''voiceTokenCap'')::integer;
 else next_cap:=coalesce(stored.voice_token_cap,30000); end if;');
 d:=replace(d,'voice_examples,dm_split,snapshots_keep,revision)','voice_examples,voice_mode,voice_token_cap,dm_split,snapshots_keep,revision)');
 d:=replace(d,'next_voice,next_split,next_keep,1)','next_voice,next_mode,next_cap,next_split,next_keep,1)');
 d:=replace(d,'voice_examples=excluded.voice_examples,','voice_examples=excluded.voice_examples,voice_mode=excluded.voice_mode,voice_token_cap=excluded.voice_token_cap,');
 d:=replace(d,'next_voice boolean;','next_voice boolean; next_mode text; next_cap integer;');
 perform rpg_private.assert(d like '%''voiceTokenCap'',''split''%' and d like '%next_mode:=%' and d like '%voice_mode=excluded.voice_mode%'
   and d like '%next_mode,next_cap,next_split%' and d like '%next_mode text; next_cap integer;%');
 execute d;
end $$;

-- 2. The quotable-line check's log (part 5) ------------------------------------------------
-- One row per committed turn the check read: the flagged lines (the line, why), how many lines
-- it read, the model and its usage. Private; the next turn's tail quotes the newest row's flags
-- when it belongs to the last committed turn; the metrics read the rows per turn.
create table rpg_private.voice_flags (
  campaign_id uuid not null references public.rpg_campaigns(id),
  operation_id uuid not null,
  flags jsonb not null default '[]'::jsonb,
  lines integer not null default 0,
  model text,
  usage jsonb,
  cost_usd_micros integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (campaign_id, operation_id)
);
alter table rpg_private.voice_flags enable row level security;
revoke all on rpg_private.voice_flags from public,anon,authenticated;

create function rpg_private.voice_flags_json(f rpg_private.voice_flags) returns jsonb language sql immutable set search_path='' as $$
 select jsonb_build_object('operationId',f.operation_id,'flags',f.flags,'lines',f.lines,'model',f.model,'usage',f.usage,'costUsdMicros',f.cost_usd_micros,'createdAt',f.created_at)
$$;
revoke all on function rpg_private.voice_flags_json(rpg_private.voice_flags) from public,anon,authenticated;

-- rpg_dossier: voice_flags_save {requestId, operationId, flags, lines, model, usage, costUsdMicros}
-- and voice_flags_read {limit}; the samples' limit rises with the store (part 3).
do $$ declare d text; begin
 select pg_get_functiondef('public.rpg_dossier(uuid,uuid,text,jsonb,jsonb)'::regprocedure) into d;
 d:=replace(d,'length(p_payload->>''samples'')<=40000','length(p_payload->>''samples'')<=200000');
 d:=replace(d,' if p_action=''voice_read'' then',
  ' if p_action=''voice_flags_save'' then
   perform rpg_private.fields(p_payload,array[''requestId'',''operationId'',''flags'',''lines''],array[''model'',''usage'',''costUsdMicros'']);
   perform rpg_private.assert(jsonb_typeof(p_payload->''flags'')=''array'' and jsonb_array_length(p_payload->''flags'')<=20
     and jsonb_typeof(p_payload->''lines'')=''number'' and (p_payload->>''lines'')::numeric between 0 and 1000
     and not exists(select 1 from jsonb_array_elements(p_payload->''flags'') x
       where jsonb_typeof(x.value->''line'')<>''string'' or length(x.value->>''line'') not between 1 and 600
          or jsonb_typeof(x.value->''why'')<>''string'' or length(x.value->>''why'') not between 1 and 400));
   perform rpg_private.assert(exists(select 1 from rpg_private.turns t where t.campaign_id=p_campaign_id and t.id=(p_payload->>''operationId'')::uuid and t.status=''committed''));
   insert into rpg_private.voice_flags(campaign_id,operation_id,flags,lines,model,usage,cost_usd_micros)
     values(p_campaign_id,(p_payload->>''operationId'')::uuid,p_payload->''flags'',(p_payload->>''lines'')::integer,p_payload->>''model'',p_payload->''usage'',
       coalesce((p_payload->>''costUsdMicros'')::integer,0))
     on conflict(campaign_id,operation_id) do update set flags=excluded.flags,lines=excluded.lines,model=excluded.model,usage=excluded.usage,
       cost_usd_micros=excluded.cost_usd_micros,created_at=now();
   return (select rpg_private.voice_flags_json(f) from rpg_private.voice_flags f where f.campaign_id=p_campaign_id and f.operation_id=(p_payload->>''operationId'')::uuid);
 end if;
 if p_action=''voice_flags_read'' then
   perform rpg_private.fields(p_payload,''{}''::text[],array[''limit'']);
   return jsonb_build_object(''campaignId'',p_campaign_id,''rows'',coalesce((select jsonb_agg(rpg_private.voice_flags_json(f) order by f.created_at desc) from (
     select * from rpg_private.voice_flags g where g.campaign_id=p_campaign_id order by g.created_at desc limit least(coalesce((p_payload->>''limit'')::integer,50),500)) f),''[]''::jsonb));
 end if;
 if p_action=''voice_read'' then');
 perform rpg_private.assert(d like '%p_action=''voice_flags_save''%' and d like '%p_action=''voice_flags_read''%' and d like '%<=200000%');
 execute d;
end $$;

-- 3. The turn's source: the mode, the cap, the newest flags ---------------------------------
alter function rpg_private.runtime_source(uuid,uuid,text) rename to runtime_source_before_voice_stage;
create function rpg_private.runtime_source(cid uuid,uid uuid,mode text default 'game') returns jsonb
language plpgsql stable set search_path='' as $$
declare result jsonb:=rpg_private.runtime_source_before_voice_stage(cid,uid,mode); s rpg_private.dm_settings%rowtype; newest rpg_private.voice_flags%rowtype; begin
 select * into s from rpg_private.dm_settings d where d.campaign_id=cid;
 select * into newest from rpg_private.voice_flags f where f.campaign_id=cid order by f.created_at desc limit 1;
 result:=result||jsonb_build_object('voiceMode',coalesce(s.voice_mode,'off'),'voiceTokenCap',coalesce(s.voice_token_cap,30000),
   'voiceExamplesOn',coalesce(s.voice_mode,'off')<>'off',
   'voiceFlags',case when newest.operation_id is null then null else jsonb_build_object('operationId',newest.operation_id,'flags',newest.flags) end);
 return result;
end $$;
revoke all on function rpg_private.runtime_source_before_voice_stage(uuid,uuid,text),rpg_private.runtime_source(uuid,uuid,text) from public,anon,authenticated;

-- 4. The owner's replay fix: the snapshot list names the turns table `tr`, never the variable `t`
do $$ declare d text; begin
 select pg_get_functiondef('public.rpg_turn_snapshots(uuid,uuid,text,jsonb)'::regprocedure) into d;
 d:=replace(d,'select rpg_private.turn_row_snapshot_json(t,false) row from rpg_private.turns t where t.campaign_id=p_campaign_id and t.status=''committed''',
  'select rpg_private.turn_row_snapshot_json(tr,false) row from rpg_private.turns tr where tr.campaign_id=p_campaign_id and tr.status=''committed''');
 d:=replace(d,'and t.runtime_identity=''dm-loop-v1'' and t.source is not null and t.input->>''mode'' in (''game'',''companion'')',
  'and tr.runtime_identity=''dm-loop-v1'' and tr.source is not null and tr.input->>''mode'' in (''game'',''companion'')');
 d:=replace(d,'and not exists(select 1 from rpg_private.turn_snapshots s where s.campaign_id=t.campaign_id and s.operation_id=t.id)',
  'and not exists(select 1 from rpg_private.turn_snapshots s where s.campaign_id=tr.campaign_id and s.operation_id=tr.id)');
 perform rpg_private.assert(d like '%turn_row_snapshot_json(tr,false) row from rpg_private.turns tr where tr.campaign_id=p_campaign_id%'
   and d like '%tr.runtime_identity=''dm-loop-v1''%' and d like '%s.operation_id=tr.id)%' and d not like '%s.operation_id=t.id)%');
 execute d;
end $$;

commit;
