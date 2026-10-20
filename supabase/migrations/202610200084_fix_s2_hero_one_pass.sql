-- Fix run after session 2, stage F (items 8, 16, 19, 20, 34): the new campaign's hero created in one pass. Additive:
-- the existing functions are wrapped or patched by exact text (as migrations 35, 42 and 62 did); applied migrations
-- stay as they are.
--  1. A creation draft of schema 3 — the hero the campaign's DM builds from the owner's words (a schema-2 character
--     sheet with level, saves, attacks, spells and AC; every thing with its kind, slot, damage line and detail; the
--     counters with their names; the wallet) — is checked for integrity only: no verbatim-quote grounding (the owner's
--     approval is the authority), the 12-thing / 8-resource caps gone (80 things, 40 counters at most; the older
--     schemas get the same ceilings), «Кто вы?» up to 20 000 characters, a payload up to 1 MB.
--  2. The commit writes the schema-3 hero directly: the sheet, the eleven slots, each thing with its kind and slot
--     (no guessing from the name), its damage line and detail, the counters with their maxima and names
--     (public_profile.counterLabels), the coins as the wallet (currency_<code>).
--  3. Item 8: every new campaign gets its world's text as a canon document titled with the world's name (versioned
--     like any document), so the DM's turn reads it in the world layer.
--  4. Item 34: the owner's answers to the draft's and the opening's questions become owner-pinned facts (always in
--     the DM's context, the owner's authority); the opening's ticket carries the hero's sheet and «Что мне нравится».
begin;

-- 1. The checks of schema 3 ------------------------------------------------------------------------------------------
create function rpg_private.hero_items_valid(items jsonb,humanoid boolean) returns boolean
language plpgsql immutable set search_path='' as $$
declare x jsonb; d jsonb; b jsonb; k text; used text[]:='{}'; slots jsonb:=rpg_private.universal_slots('en'); begin
 if jsonb_typeof(items)<>'array' or jsonb_array_length(items)>80 then return false; end if;
 if (select count(*)<>count(distinct value->>'name') from jsonb_array_elements(items)) then return false; end if;
 for x in select value from jsonb_array_elements(items) loop
  if jsonb_typeof(x)<>'object' or (select array_agg(key order by key) from jsonb_object_keys(x) key)<>array['description','detail','kind','mechanics','name','quantity','slot'] then return false; end if;
  if not rpg_private.bootstrap_text(x->'name',1,200) or jsonb_typeof(x->'description')<>'string' or length(x->>'description')>4000
     or jsonb_typeof(x->'mechanics')<>'string' or length(x->>'mechanics')>400 or not rpg_private.wave4_integer(x->'quantity',1,1000000)
     or coalesce(x->>'kind','') not in ('weapon','shield','armor','clothing','jewelry','accessory','ammunition','consumable','tool','gear','misc') then return false; end if;
  if x->'slot'<>'null'::jsonb then
   if not humanoid or jsonb_typeof(x->'slot')<>'string' or x->>'slot'=any(used) or x->'quantity'<>'1'::jsonb
      or not exists(select 1 from jsonb_array_elements(slots) s where s->>'id'=x->>'slot' and s->'accepts' ? (x->>'kind')) then return false; end if;
   used:=used||(x->>'slot');
  end if;
  d:=x->'detail';
  if jsonb_typeof(d)<>'object' or octet_length(d::text)>12000 then return false; end if;
  for k in select key from jsonb_object_keys(d) key loop
   if k not in ('bonuses','hands','charges','attunement') then return false; end if;
  end loop;
  if d ? 'bonuses' then
   if jsonb_typeof(d->'bonuses')<>'array' or jsonb_array_length(d->'bonuses')>8 then return false; end if;
   for b in select value from jsonb_array_elements(d->'bonuses') loop
    if jsonb_typeof(b)<>'object' or (select array_agg(key order by key) from jsonb_object_keys(b) key)<>array['to','value']
       or not rpg_private.bootstrap_text(b->'to',1,60) or not rpg_private.wave4_integer(b->'value',-20,20) then return false; end if;
   end loop;
  end if;
  if d ? 'hands' and d->'hands'<>'2'::jsonb then return false; end if;
  if d ? 'attunement' and d->'attunement'<>'true'::jsonb then return false; end if;
  if d ? 'charges' and (jsonb_typeof(d->'charges')<>'object' or (select array_agg(key order by key) from jsonb_object_keys(d->'charges') key)<>array['max','value']
     or not rpg_private.wave4_integer(d#>'{charges,max}',1,1000) or not rpg_private.wave4_integer(d#>'{charges,value}',0,1000)
     or (d#>>'{charges,value}')::integer>(d#>>'{charges,max}')::integer) then return false; end if;
 end loop;
 return true;
exception when others then return false;
end $$;

create function rpg_private.hero_counters_valid(c jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare x jsonb; begin
 if jsonb_typeof(c)<>'array' or jsonb_array_length(c)>40 then return false; end if;
 if (select count(*)<>count(distinct value->>'key') from jsonb_array_elements(c)) then return false; end if;
 for x in select value from jsonb_array_elements(c) loop
  if jsonb_typeof(x)<>'object' or (select array_agg(key order by key) from jsonb_object_keys(x) key)<>array['key','label','max','value'] then return false; end if;
  if jsonb_typeof(x->'key')<>'string' or length(x->>'key')>48 or x->>'key' !~ '^[a-z][a-z0-9_]*$' or x->>'key' in ('hp','max_hp','constructor','prototype','__proto__')
     or x->>'key' like 'currency\_%' or x->>'key' ~ '_(max|min)$' then return false; end if;
  if not rpg_private.bootstrap_text(x->'label',1,100) or not rpg_private.wave4_integer(x->'value',0,1000000) then return false; end if;
  if x->'max'<>'null'::jsonb and not rpg_private.wave4_integer(x->'max',(x->>'value')::bigint,1000000) then return false; end if;
 end loop;
 return true;
exception when others then return false;
end $$;

create function rpg_private.hero_wallet_valid(w jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare x jsonb; begin
 if jsonb_typeof(w)<>'array' or jsonb_array_length(w)>8 then return false; end if;
 if (select count(*)<>count(distinct value->>'code') from jsonb_array_elements(w)) then return false; end if;
 for x in select value from jsonb_array_elements(w) loop
  if jsonb_typeof(x)<>'object' or (select array_agg(key order by key) from jsonb_object_keys(x) key)<>array['amount','code'] then return false; end if;
  if jsonb_typeof(x->'code')<>'string' or length(x->>'code') not between 1 and 32
     or x->>'code' !~ '^[^0-9_[:punct:][:cntrl:][:space:]][^0-9_[:punct:][:cntrl:]]*$' or not rpg_private.wave4_integer(x->'amount',0,1000000) then return false; end if;
 end loop;
 return true;
exception when others then return false;
end $$;

-- The runtime's combat numbers of a structured hero (HP, AC as defence, attack, skill, the main-hand weapon).
create function rpg_private.hero_mechanics_valid(m jsonb,items jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
begin
 if jsonb_typeof(m)<>'object' or (select array_agg(key order by key) from jsonb_object_keys(m) key)<>array['attack','defense','hp','skill','weaponDamage','weaponName'] then return false; end if;
 if not (rpg_private.wave4_integer(m->'hp',1,10000) and rpg_private.wave4_integer(m->'attack',-20,20) and rpg_private.wave4_integer(m->'defense',1,40) and rpg_private.wave4_integer(m->'skill',-20,20)) then return false; end if;
 if m->'weaponName'='null'::jsonb then return m->'weaponDamage'='null'::jsonb; end if;
 return rpg_private.bootstrap_text(m->'weaponName',1,200) and rpg_private.wave4_integer(m->'weaponDamage',1,20)
  and exists(select 1 from jsonb_array_elements(items) x where x->'name'=m->'weaponName' and (x->>'quantity')::integer>=1);
exception when others then return false;
end $$;

create function rpg_private.bootstrap_hero_proposal(p jsonb) returns void
language plpgsql set search_path='' as $$
declare x jsonb; begin
 perform rpg_private.fields(p,array['schemaVersion','sheet','mechanics','equipmentProfile','capabilities','limitations','possessions','counters','wallet','questions','notes']);
 perform rpg_private.assert(p->'schemaVersion'='3'::jsonb and p#>'{sheet,schemaVersion}'='2'::jsonb and rpg_private.sheet_valid(p->'sheet'));
 perform rpg_private.assert(p->>'equipmentProfile' in ('standard_humanoid','none'));
 perform rpg_private.assert(rpg_private.bootstrap_lines(p->'capabilities',24) and rpg_private.bootstrap_lines(p->'limitations',24));
 perform rpg_private.assert(rpg_private.hero_items_valid(p->'possessions',p->>'equipmentProfile'='standard_humanoid') and rpg_private.hero_counters_valid(p->'counters') and rpg_private.hero_wallet_valid(p->'wallet'));
 perform rpg_private.assert((p#>>'{sheet,mode}'='structured_rpg')=(jsonb_typeof(p->'mechanics')='object'));
 if jsonb_typeof(p->'mechanics')='object' then perform rpg_private.assert(rpg_private.hero_mechanics_valid(p->'mechanics',p->'possessions')); else perform rpg_private.assert(p->'mechanics'='null'::jsonb); end if;
 -- The DM's questions never block the start: none is consequential.
 perform rpg_private.assert(jsonb_typeof(p->'questions')='array' and jsonb_array_length(p->'questions')<=8);
 for x in select value from jsonb_array_elements(p->'questions') loop
  perform rpg_private.fields(x,array['question','consequential']);
  perform rpg_private.assert(rpg_private.bootstrap_text(x->'question',1,500) and x->'consequential'='false'::jsonb);
 end loop;
 perform rpg_private.assert(jsonb_typeof(p->'notes')='array' and jsonb_array_length(p->'notes')<=24);
 for x in select value from jsonb_array_elements(p->'notes') loop perform rpg_private.assert(rpg_private.bootstrap_text(x,1,500)); end loop;
end $$;

create function rpg_private.bootstrap_hero_review(r jsonb,proposal jsonb) returns void
language plpgsql set search_path='' as $$
declare x jsonb; begin
 perform rpg_private.fields(r,array['name','description','capabilities','limitations','possessions','counters','wallet','answers','sheet','equipmentProfile'],array['mechanics']);
 perform rpg_private.assert(rpg_private.bootstrap_text(r->'name',1,200) and rpg_private.bootstrap_text(r->'description',1,20000));
 perform rpg_private.assert(r#>'{sheet,schemaVersion}'='2'::jsonb and rpg_private.sheet_valid(r->'sheet') and r->>'equipmentProfile' in ('standard_humanoid','none'));
 perform rpg_private.assert(rpg_private.bootstrap_lines(r->'capabilities',24) and rpg_private.bootstrap_lines(r->'limitations',24));
 perform rpg_private.assert(rpg_private.hero_items_valid(r->'possessions',r->>'equipmentProfile'='standard_humanoid') and rpg_private.hero_counters_valid(r->'counters') and rpg_private.hero_wallet_valid(r->'wallet'));
 perform rpg_private.assert((r#>>'{sheet,mode}'='structured_rpg')=(r ? 'mechanics'));
 if r ? 'mechanics' then perform rpg_private.assert(rpg_private.hero_mechanics_valid(r->'mechanics',r->'possessions')); end if;
 perform rpg_private.assert(jsonb_typeof(r->'answers')='array' and jsonb_array_length(r->'answers')=jsonb_array_length(proposal->'questions'));
 for x in select value from jsonb_array_elements(r->'answers') loop
  perform rpg_private.assert(x='null'::jsonb or rpg_private.bootstrap_text(x,1,2000));
 end loop;
end $$;

alter function rpg_private.bootstrap_proposal(text,jsonb,jsonb) rename to bootstrap_proposal_before_one_pass;
create function rpg_private.bootstrap_proposal(kind text,p jsonb,input jsonb) returns void
language plpgsql set search_path='' as $$
begin
 if kind='creation' and p->'schemaVersion'='3'::jsonb then perform rpg_private.bootstrap_hero_proposal(p); return; end if;
 perform rpg_private.bootstrap_proposal_before_one_pass(kind,p,input);
end $$;
alter function rpg_private.bootstrap_review(text,jsonb,jsonb) rename to bootstrap_review_before_one_pass;
create function rpg_private.bootstrap_review(kind text,r jsonb,proposal jsonb) returns void
language plpgsql set search_path='' as $$
begin
 if kind='creation' and proposal->'schemaVersion'='3'::jsonb then perform rpg_private.bootstrap_hero_review(r,proposal); return; end if;
 perform rpg_private.bootstrap_review_before_one_pass(kind,r,proposal);
end $$;

-- The older schemas take the same ceilings (item 20: «ограничение 12 предметов убираем»).
do $$ declare d text; begin
 d:=pg_get_functiondef('rpg_private.bootstrap_proposal_before_sheet(text,jsonb,jsonb)'::regprocedure);
 perform rpg_private.assert(position('jsonb_array_length(p->''possessions'')<=12' in d)>0 and position('jsonb_array_length(p->''resources'')<=8' in d)>0);
 d:=replace(replace(d,'jsonb_array_length(p->''possessions'')<=12','jsonb_array_length(p->''possessions'')<=80'),'jsonb_array_length(p->''resources'')<=8','jsonb_array_length(p->''resources'')<=40');
 execute d;
 d:=pg_get_functiondef('rpg_private.bootstrap_review_before_sheet(text,jsonb,jsonb)'::regprocedure);
 perform rpg_private.assert(position('jsonb_array_length(r->''possessions'')<=12' in d)>0 and position('jsonb_array_length(r->''resources'')<=8' in d)>0 and position('bootstrap_text(r->''description'',1,8000)' in d)>0);
 d:=replace(replace(replace(d,'jsonb_array_length(r->''possessions'')<=12','jsonb_array_length(r->''possessions'')<=80'),'jsonb_array_length(r->''resources'')<=8','jsonb_array_length(r->''resources'')<=40'),
   'bootstrap_text(r->''description'',1,8000)','bootstrap_text(r->''description'',1,20000)');
 execute d;
end $$;

-- 2–4. The commit ---------------------------------------------------------------------------------------------------
-- The hero's resources: the older reviews' key → amount exactly as before; schema 3 adds the counters (with their
-- maxima as <key>_max) and the wallet (currency_<code>, spaces as underscores — the money tool's key).
create function rpg_private.bootstrap_hero_resources(r jsonb) returns jsonb
language sql immutable set search_path='' as $$
 select coalesce((select jsonb_object_agg(x->>'key',x->'amount') from jsonb_array_elements(coalesce(r->'resources','[]'::jsonb)) x),'{}'::jsonb)
  || coalesce((select jsonb_object_agg(x->>'key',x->'value') from jsonb_array_elements(coalesce(r->'counters','[]'::jsonb)) x),'{}'::jsonb)
  || coalesce((select jsonb_object_agg((x->>'key')||'_max',x->'max') from jsonb_array_elements(coalesce(r->'counters','[]'::jsonb)) x where x->'max'<>'null'::jsonb),'{}'::jsonb)
  || coalesce((select jsonb_object_agg('currency_'||replace(x->>'code',' ','_'),x->'amount') from jsonb_array_elements(coalesce(r->'wallet','[]'::jsonb)) x),'{}'::jsonb)
$$;

-- The owner's answers as owner-pinned facts («вопрос — ответ»), within the pins' limits (40, 300 characters each).
create function rpg_private.bootstrap_pin_answers(cid uuid,op uuid,tag text,questions jsonb,answers jsonb) returns void
language plpgsql set search_path='' as $$
declare q jsonb; i integer; answer text; pins jsonb:='[]'::jsonb; room integer; begin
 if jsonb_typeof(questions)<>'array' or jsonb_typeof(answers)<>'array' then return; end if;
 select 40-jsonb_array_length(pinned_facts) into room from public.rpg_campaigns where id=cid;
 for q,i in select value,ordinality::integer-1 from jsonb_array_elements(questions) with ordinality loop
  answer:=btrim(coalesce(answers->>i,''));
  if answer='' or jsonb_array_length(pins)>=coalesce(room,0) then continue; end if;
  pins:=pins||jsonb_build_array(jsonb_build_object('id',rpg_private.wave4_id(op,'bootstrap:pin:'||tag||':'||i),
    'text',left(btrim(q->>'question')||' — '||answer,300),'source','null'::jsonb,'at',now()));
 end loop;
 if jsonb_array_length(pins)>0 and (select octet_length((pinned_facts||pins)::text)<=20000 from public.rpg_campaigns where id=cid) then
  update public.rpg_campaigns set pinned_facts=pinned_facts||pins,revision=revision+1,updated_at=now() where id=cid;
 end if;
end $$;

create function rpg_private.bootstrap_creation_extras(cid uuid,op uuid,hero uuid,review jsonb,proposal jsonb,world_title text,world_premise text) returns void
language plpgsql set search_path='' as $$
declare labels jsonb; begin
 -- Item 8: the world's text as the campaign's canon document (a «campaign» correction, versioned).
 if length(btrim(coalesce(world_premise,'')))>0 then
  perform public.rpg_apply_mutation(rpg_private.wave4_id(op,'bootstrap:world-canon'),'document.save',cid,0,
    jsonb_build_object('id',rpg_private.wave4_id(op,'bootstrap:world-canon-document'),'title',left(btrim(world_title),200),'status','canon','body',left(world_premise,200000)),
    rpg_private.timeline_fence(cid),null);
 end if;
 if proposal->'schemaVersion'='3'::jsonb then
  select coalesce(jsonb_object_agg(x->>'key',x->>'label'),'{}'::jsonb) into labels from jsonb_array_elements(coalesce(review->'counters','[]'::jsonb)) x;
  if labels<>'{}'::jsonb then
   update public.rpg_entities set public_profile=public_profile||jsonb_build_object('counterLabels',coalesce(public_profile->'counterLabels','{}'::jsonb)||labels),revision=revision+1
    where campaign_id=cid and id=hero and kind='player';
   perform rpg_private.assert(found);
  end if;
 end if;
 perform rpg_private.bootstrap_pin_answers(cid,op,'hero',proposal->'questions',review->'answers');
end $$;

do $$ declare d text; needle text; begin
 d:=pg_get_functiondef('public.rpg_bootstrap_before_astra_first(uuid,uuid,text,jsonb)'::regprocedure);
 perform rpg_private.assert(position('bootstrap_creation_extras' in d)=0);
 -- A full hero's draft and review are bigger than 128 KB; «Кто вы?» up to 20 000 characters.
 needle:='octet_length(p_payload::text)<=131072';
 perform rpg_private.assert(position(needle in d)>0); d:=replace(d,needle,'octet_length(p_payload::text)<=1048576');
 needle:='rpg_private.bootstrap_text(input->''description'',1,8000)';
 perform rpg_private.assert(position(needle in d)>0); d:=replace(d,needle,'rpg_private.bootstrap_text(input->''description'',1,20000)');
 needle:='''resources'',coalesce((select jsonb_object_agg(x->>''key'',x->''amount'') from jsonb_array_elements(review->''resources'') x),''{}''::jsonb)';
 perform rpg_private.assert(position(needle in d)>0); d:=replace(d,needle,'''resources'',rpg_private.bootstrap_hero_resources(review)');
 needle:='completed#>>''{result,result,output,schemaVersion}''=''2''';
 perform rpg_private.assert(position(needle in d)>0); d:=replace(d,needle,'completed#>>''{result,result,output,schemaVersion}'' in (''2'',''3'')');
 -- A schema-3 thing is written with its own kind, slot, damage line and detail.
 needle:='''category'',case when x->''name''=review#>''{mechanics,weaponName}'' then ''weapon'' else ''possession'' end';
 perform rpg_private.assert(position(needle in d)>0);
 d:=replace(d,needle,'''category'',coalesce(x->>''kind'',case when x->''name''=review#>''{mechanics,weaponName}'' then ''weapon'' else ''possession'' end)');
 needle:='''mechanics'','''',''owner_entity_id'',hero';
 perform rpg_private.assert(position(needle in d)>0);
 d:=replace(d,needle,'''mechanics'',coalesce(x->>''mechanics'',''''),''detail'',coalesce(x->''detail'',''{}''::jsonb),''owner_entity_id'',hero');
 needle:='''equipped_entity_id'',case when x->''name''=review#>''{mechanics,weaponName}'' then hero else null end,''equipped_slot'',case when x->''name''=review#>''{mechanics,weaponName}'' then ''hand'' else null end';
 perform rpg_private.assert(position(needle in d)>0);
 d:=replace(d,needle,'''equipped_entity_id'',case when x ? ''kind'' then case when coalesce(x->>''slot'','''')<>'''' then hero end when x->''name''=review#>''{mechanics,weaponName}'' then hero else null end,''equipped_slot'',case when x ? ''kind'' then nullif(x->>''slot'','''') when x->''name''=review#>''{mechanics,weaponName}'' then ''hand'' else null end');
 needle:='result:=jsonb_build_object(''requestId'',p_payload->''requestId'',''campaignId'',cid,''heroId'',hero);';
 perform rpg_private.assert(position(needle in d)>0);
 d:=replace(d,needle,'perform rpg_private.bootstrap_creation_extras(cid,op,hero,review,completed#>''{result,result,output}'',w.title,w.premise);
  '||needle);
 -- The opening's DM sees the hero's sheet and what the owner likes.
 needle:='''description'',e.details,''capabilities'',a->''capabilities''';
 perform rpg_private.assert(position(needle in d)>0); d:=replace(d,needle,'''description'',e.details,''sheet'',e.character_sheet,''capabilities'',a->''capabilities''');
 needle:='''currentLocation'',null,''ruleset'',''world-logic-v1'')';
 perform rpg_private.assert(position(needle in d)>0);
 d:=replace(d,needle,'''currentLocation'',null,''ruleset'',''world-logic-v1'',''playerLikes'',(select c.player_likes from public.rpg_campaigns c where c.id=cid))');
 -- Item 34: the opening's answers are pinned before the opening's state is captured.
 needle:='eid:=rpg_private.world_event_id(op,''bootstrap'',''review'',''private'');';
 perform rpg_private.assert(position(needle in d)>0);
 d:=replace(d,needle,'perform rpg_private.bootstrap_pin_answers(cid,op,''opening'',completed#>''{result,result,output,questions}'',review->''answers'');
  '||needle);
 execute d;

 -- The Astra-first handoff of a structured hero takes the schema-3 hero as it takes schema 2.
 d:=pg_get_functiondef('public.rpg_bootstrap_before_polish_start(uuid,uuid,text,jsonb)'::regprocedure);
 needle:='e.event#>>''{payload,original,output,schemaVersion}''=''2''';
 perform rpg_private.assert(position(needle in d)>0);
 d:=replace(d,needle,'e.event#>>''{payload,original,output,schemaVersion}'' in (''2'',''3'')');
 needle:='octet_length(p_payload::text)<=131072';
 perform rpg_private.assert(position(needle in d)>0); d:=replace(d,needle,'octet_length(p_payload::text)<=1048576');
 execute d;
end $$;

revoke all on function rpg_private.hero_items_valid(jsonb,boolean),rpg_private.hero_counters_valid(jsonb),rpg_private.hero_wallet_valid(jsonb),
  rpg_private.hero_mechanics_valid(jsonb,jsonb),rpg_private.bootstrap_hero_proposal(jsonb),rpg_private.bootstrap_hero_review(jsonb,jsonb),
  rpg_private.bootstrap_proposal_before_one_pass(text,jsonb,jsonb),rpg_private.bootstrap_proposal(text,jsonb,jsonb),
  rpg_private.bootstrap_review_before_one_pass(text,jsonb,jsonb),rpg_private.bootstrap_review(text,jsonb,jsonb),
  rpg_private.bootstrap_hero_resources(jsonb),rpg_private.bootstrap_pin_answers(uuid,uuid,text,jsonb,jsonb),
  rpg_private.bootstrap_creation_extras(uuid,uuid,uuid,jsonb,jsonb,text,text) from public,anon,authenticated;

commit;
