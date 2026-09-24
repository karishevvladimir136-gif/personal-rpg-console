-- Mega DM v1 correction: reviewable typed feedback and bounded public-context selection.
-- Additive; old private turn sources, proposals and save manifests retain their meaning.
begin;

create or replace function rpg_private.dm_craft_owner_view(uid uuid) returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('policyVersion','mega-dm-v1-public-context-2',
  'versions',coalesce((select jsonb_agg(rpg_private.dm_craft_json(v) order by v.key,v.version) from rpg_private.dm_craft_versions v where v.owner_id=uid),'[]'::jsonb),
  'effective',coalesce((select jsonb_agg(jsonb_build_object('key',e.key,'activeVersionId',e.active_version_id,'activationRevision',e.activation_revision) order by e.key) from rpg_private.dm_craft_effective e where e.owner_id=uid),'[]'::jsonb))
$$;

-- Only the current player-visible scene and location label may add relevance.
-- Never read DM state, Memory, future sources, or entire campaign history here.
create function rpg_private.dm_craft_public_signal(cid uuid) returns text language sql stable set search_path='' as $$
 select left(coalesce(s.body,'') || ' ' || coalesce(l.name,''),512)
 from public.rpg_public_state p
 left join public.rpg_scenes s on s.campaign_id=p.campaign_id and s.id=p.current_scene_id
 left join public.rpg_locations l on l.campaign_id=p.campaign_id and l.id=p.current_location_id
 where p.campaign_id=cid
$$;
create function rpg_private.dm_craft_stage_v2(uid uuid,cid uuid,stage text,input_text text) returns jsonb language sql stable set search_path='' as $$
 select coalesce(jsonb_agg(selected.card order by selected.score desc,selected.key),'[]'::jsonb)
 from (
  select rpg_private.dm_craft_json(v) as card, v.key, count(t.token) as score
  from rpg_private.dm_craft_effective e
  join rpg_private.dm_craft_versions v on v.id=e.active_version_id and v.owner_id=e.owner_id
  join lateral unnest(v.triggers) t(token) on strpos(lower(coalesce(input_text,'')||' '||coalesce(rpg_private.dm_craft_public_signal(cid),'')),lower(t.token))>0
  where e.owner_id=uid and v.kind='card' and stage=any(v.stages)
   and length(v.en->>'guidance')+length(v.ru->>'guidance')+length(v.en->>'avoid')+length(v.ru->>'avoid')<=3000
  group by v.id
  order by score desc,v.key
  limit 2
 ) selected
$$;
create or replace function rpg_private.dm_craft_snapshot(uid uuid,cid uuid,opid uuid) returns jsonb language plpgsql stable set search_path='' as $$
declare t rpg_private.turns%rowtype; doctrine jsonb; style jsonb; mode text; begin
 select * into t from rpg_private.turns where id=opid and campaign_id=cid and owner_id=uid;
 if not found then raise exception 'rpg_not_found'; end if;
 style:=coalesce(t.settings->'dmStyle','{"companionAgency":"normal","descriptionDensity":"balanced","dialogueDensity":"balanced","dramaticPace":"balanced","mystery":"normal","failForward":"normal","tone":"grounded"}'::jsonb);
 select rpg_private.dm_craft_json(v) into doctrine from rpg_private.dm_craft_effective e join rpg_private.dm_craft_versions v on v.id=e.active_version_id where e.owner_id=uid and e.key='core-doctrine';
 mode:=t.input->>'mode';
 return jsonb_build_object('policyVersion','mega-dm-v1-public-context-2','ownerId',uid,'campaignId',cid,'operationId',opid,'timeline',rpg_private.timeline_fence(cid),'styleRevision',t.settings_revision,'style',style,'doctrine',doctrine,
  'plan',case when mode in ('game','companion','mechanic') then rpg_private.dm_craft_stage_v2(uid,cid,'plan',t.input->>'input') else '[]'::jsonb end,
  'narrate',case when mode in ('game','companion','mechanic') then rpg_private.dm_craft_stage_v2(uid,cid,'narrate',t.input->>'input') else '[]'::jsonb end);
end $$;

create function rpg_private.dm_teaching_candidate_valid(v jsonb) returns void language plpgsql set search_path='' as $$
declare d jsonb; e jsonb; k text; count_changed integer:=0; begin
 if v='null'::jsonb then return; end if;
 perform rpg_private.assert(jsonb_typeof(v)='object' and octet_length(v::text)<=10000 and jsonb_typeof(v->'explanation')='string' and length(btrim(v->>'explanation')) between 1 and 1000);
 if v->>'kind'='campaign_style' then
  perform rpg_private.fields(v,array['kind','explanation','styleDelta']);
  d:=v->'styleDelta';
  perform rpg_private.fields(d,array['companionAgency','descriptionDensity','dialogueDensity','dramaticPace','mystery','failForward','tone']);
  for k in select jsonb_object_keys(d) loop
   if d->k='null'::jsonb then continue; end if;
   count_changed:=count_changed+1;
   perform rpg_private.assert(case k
    when 'companionAgency' then d->>k in ('low','normal','high')
    when 'descriptionDensity' then d->>k in ('concise','balanced','rich')
    when 'dialogueDensity' then d->>k in ('concise','balanced','rich')
    when 'dramaticPace' then d->>k in ('measured','balanced','brisk')
    when 'mystery' then d->>k in ('low','normal','high')
    when 'failForward' then d->>k in ('low','normal','high')
    when 'tone' then d->>k in ('grounded','warm','cinematic') else false end);
  end loop;
  perform rpg_private.assert(count_changed between 1 and 3);
 elsif v->>'kind'='global_craft' then
  perform rpg_private.fields(v,array['kind','explanation','entry']);
  e:=v->'entry';
  perform rpg_private.fields(e,array['category','stages','triggers','en','ru','provenance']);
  perform rpg_private.assert(e->>'provenance'='Proposed owner-reviewed generalized lesson');
  perform rpg_private.dm_craft_entry_valid(e||'{"key":"proposed-global-card","kind":"card"}'::jsonb);
 else raise exception 'rpg_validation'; end if;
end $$;

-- Conservative literal guard for proposed and approved global wording. A
-- campaign-specific draft can always be rewritten by the owner in general terms.
create function rpg_private.dm_craft_global_safe(cid uuid,e jsonb) returns boolean language plpgsql stable set search_path='' as $$
declare body text:=lower(e::text); words text; candidate_name text; contents jsonb; bucket jsonb; secret text; word text; begin
 if body ~ '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' then return false; end if;
 words:=' '||regexp_replace(body,'[^[:alnum:]_-]+',' ','g')||' ';
 for candidate_name in
  select c.title from public.rpg_campaigns c where c.id=cid
  union all select entity.name from public.rpg_entities entity where entity.campaign_id=cid
  union all select location.name from public.rpg_locations location where location.campaign_id=cid
  union all select quest.title from public.rpg_quests quest where quest.campaign_id=cid
  union all select document.title from public.rpg_documents document where document.campaign_id=cid
 loop
  if length(candidate_name)>=3 and strpos(words,' '||regexp_replace(lower(candidate_name),'[^[:alnum:]_-]+',' ','g')||' ')>0 then return false; end if;
 end loop;
 select d.contents into contents from rpg_private.dm_state d where d.campaign_id=cid;
 if jsonb_typeof(contents)='object' then
  for bucket in select value from jsonb_each(contents) loop
   if jsonb_typeof(bucket)<>'object' then continue; end if;
   for secret in select value from jsonb_each_text(bucket) loop
    for word in select regexp_split_to_table(lower(secret),'[^[:alnum:]_-]+') loop
     if length(word)>=5 and strpos(body,word)>0 then return false; end if;
    end loop;
   end loop;
  end loop;
 end if;
 return true;
end $$;

create table rpg_private.dm_teaching_commit_receipts (
 operation_id uuid primary key references rpg_private.turns(id),
 owner_id uuid not null references auth.users(id),
 campaign_id uuid not null references public.rpg_campaigns(id),
 candidate jsonb not null,
 created_at timestamptz not null default now()
);
create trigger immutable_dm_teaching_receipts before update or delete on rpg_private.dm_teaching_commit_receipts for each row execute function rpg_private.dm_craft_immutable();
alter table rpg_private.dm_teaching_commit_receipts enable row level security;

-- Wrap the existing exact turn settlement. The old packet remains unchanged;
-- candidate validation, receipt and public review attachment share its transaction.
alter function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) rename to rpg_runtime_before_mega_dm_teaching;
create function public.rpg_runtime(p_owner_id uuid,p_campaign_id uuid,p_action text,p_payload jsonb default '{}',p_timeline jsonb default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare candidate jsonb; clean_payload jsonb; result jsonb; t rpg_private.turns%rowtype; receipt rpg_private.dm_teaching_commit_receipts%rowtype; begin
 if p_action<>'commit' or not (p_payload->'packet' ? 'teachingCandidate') then
  return public.rpg_runtime_before_mega_dm_teaching(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);
 end if;
 candidate:=p_payload#>'{packet,teachingCandidate}';
 perform rpg_private.dm_teaching_candidate_valid(candidate);
 select * into t from rpg_private.turns where id=(p_payload->>'operationId')::uuid and campaign_id=p_campaign_id and owner_id=p_owner_id;
 perform rpg_private.assert(t.id is not null and t.input->>'mode'='feedback');
 if candidate<>'null'::jsonb then
  perform rpg_private.assert(p_payload#>>'{packet,guidanceProposal}' is not null);
  if candidate->>'kind'='global_craft' then
   perform rpg_private.assert(lower(t.input->>'input') ~ '(all|any|every) campaigns?|globally|global dm craft|во всех кампаниях|для всех кампаний|глобальн');
   perform rpg_private.assert(rpg_private.dm_craft_global_safe(p_campaign_id,candidate->'entry'));
  end if;
 end if;
 clean_payload:=jsonb_set(p_payload,'{packet}',(p_payload->'packet')-'teachingCandidate');
 result:=public.rpg_runtime_before_mega_dm_teaching(p_owner_id,p_campaign_id,p_action,clean_payload,p_timeline);
 select * into receipt from rpg_private.dm_teaching_commit_receipts where operation_id=t.id;
 if found then
  if receipt.owner_id<>p_owner_id or receipt.campaign_id<>p_campaign_id or receipt.candidate<>candidate then raise exception 'rpg_conflict'; end if;
 else
  if t.status='committed' then raise exception 'rpg_conflict'; end if;
  insert into rpg_private.dm_teaching_commit_receipts(operation_id,owner_id,campaign_id,candidate) values(t.id,p_owner_id,p_campaign_id,candidate);
  if candidate<>'null'::jsonb then
   update rpg_private.turns set proposal=proposal||jsonb_build_object('teachingCandidate',candidate) where id=t.id;
  end if;
 end if;
 select * into t from rpg_private.turns where id=t.id;
 return rpg_private.runtime_public_turn(t);
end $$;
revoke all on function public.rpg_runtime_before_mega_dm_teaching(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated,service_role;
revoke all on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) to service_role;

alter function public.rpg_dm_teach(uuid,uuid,jsonb) rename to rpg_dm_teach_before_candidates;
create function public.rpg_dm_teach(p_owner_id uuid,p_campaign_id uuid,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare action text:=p_payload->>'action'; begin
 if action='approve-global' then
  perform rpg_private.assert(rpg_private.dm_craft_global_safe(p_campaign_id,p_payload->'entry'));
 end if;
 return public.rpg_dm_teach_before_candidates(p_owner_id,p_campaign_id,p_payload);
end $$;
revoke all on function public.rpg_dm_teach_before_candidates(uuid,uuid,jsonb) from public,anon,authenticated,service_role;
revoke all on function public.rpg_dm_teach(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.rpg_dm_teach(uuid,uuid,jsonb) to service_role;
revoke all on all functions in schema rpg_private from public,anon,authenticated;
revoke all on rpg_private.dm_teaching_commit_receipts from public,anon,authenticated;
commit;
