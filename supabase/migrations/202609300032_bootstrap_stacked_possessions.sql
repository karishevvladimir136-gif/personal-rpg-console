-- Raise only Universal Bootstrap starting-possession quantity to support normal
-- stacked inventory (for example, fifty arrows). Migration 31 remains intact.
-- CREATE OR REPLACE preserves function identity, grants, receipts and history.
begin;

create or replace function rpg_private.bootstrap_proposal(kind text,p jsonb,input jsonb) returns void
language plpgsql set search_path='' as $$
declare x jsonb; label text; begin
 if kind='creation' then
  perform rpg_private.fields(p,array['schemaVersion','capabilities','limitations','possessions','resources','questions']);
  foreach label in array array['capabilities','limitations'] loop
   perform rpg_private.assert(jsonb_typeof(p->label)='array' and jsonb_array_length(p->label)<=24);
   for x in select value from jsonb_array_elements(p->label) loop
    perform rpg_private.fields(x,array['text','quote']);
    perform rpg_private.assert(rpg_private.bootstrap_lines(jsonb_build_array(x->'text'),1) and rpg_private.bootstrap_text(x->'quote',1,1000) and position(x->>'quote' in input->>'description')>0 and position(lower(x->>'text') in lower(x->>'quote'))>0);
   end loop;
  end loop;
  perform rpg_private.assert(jsonb_typeof(p->'possessions')='array' and jsonb_array_length(p->'possessions')<=12 and jsonb_typeof(p->'resources')='array' and jsonb_array_length(p->'resources')<=8);
  for x in select value from jsonb_array_elements(p->'possessions') loop
   perform rpg_private.fields(x,array['name','description','quantity','quote']);
   perform rpg_private.assert(rpg_private.bootstrap_text(x->'name',1,200) and rpg_private.bootstrap_text(x->'description',0,2000) and rpg_private.bootstrap_text(x->'quote',1,1000) and position(x->>'quote' in input->>'description')>0 and position(lower(x->>'name') in lower(x->>'quote'))>0);
   perform rpg_private.assert((x->>'description'='' or position(x->>'description' in input->>'description')>0) and (x->'quantity'='null' or (rpg_private.wave4_integer(x->'quantity',1,1000) and (x->'quantity'='1'::jsonb or position(x->>'quantity' in x->>'quote')>0))));
  end loop;
  for x in select value from jsonb_array_elements(p->'resources') loop
   perform rpg_private.fields(x,array['key','label','amount','quote']);
   perform rpg_private.assert(rpg_private.bootstrap_text(x->'key',1,48) and x->>'key' ~ '^[a-z][a-z0-9_-]*$' and x->>'key' not in ('constructor','prototype','__proto__') and rpg_private.bootstrap_text(x->'label',1,100) and rpg_private.bootstrap_text(x->'quote',1,1000) and position(x->>'quote' in input->>'description')>0 and position(lower(x->>'label') in lower(x->>'quote'))>0 and (x->'amount'='null' or (rpg_private.wave4_integer(x->'amount') and (x->>'amount')::integer<=1000000 and position(x->>'amount' in x->>'quote')>0)));
  end loop;
 else
  perform rpg_private.fields(p,array['schemaVersion','location','situation','narration','actors','questions']);
  perform rpg_private.bootstrap_opening_fields(p,false);
 end if;
 perform rpg_private.assert(p->>'schemaVersion'='1' and jsonb_typeof(p->'questions')='array' and jsonb_array_length(p->'questions')<=8);
 for x in select value from jsonb_array_elements(p->'questions') loop
  perform rpg_private.fields(x,array['question','consequential']);
  perform rpg_private.assert(rpg_private.bootstrap_text(x->'question',1,500) and jsonb_typeof(x->'consequential')='boolean');
 end loop;
end $$;

create or replace function rpg_private.bootstrap_review(kind text,r jsonb,proposal jsonb) returns void
language plpgsql set search_path='' as $$
declare x jsonb; i integer; q jsonb; begin
 if kind='creation' then
  perform rpg_private.fields(r,array['name','description','capabilities','limitations','possessions','resources','answers']);
  perform rpg_private.assert(rpg_private.bootstrap_text(r->'name',1,200) and rpg_private.bootstrap_text(r->'description',1,8000) and rpg_private.bootstrap_lines(r->'capabilities',24) and rpg_private.bootstrap_lines(r->'limitations',24));
  perform rpg_private.assert(jsonb_typeof(r->'possessions')='array' and jsonb_array_length(r->'possessions')<=12 and (select count(*)=count(distinct value->>'name') from jsonb_array_elements(r->'possessions')) and jsonb_typeof(r->'resources')='array' and jsonb_array_length(r->'resources')<=8 and (select count(*)=count(distinct value->>'key') from jsonb_array_elements(r->'resources')));
  for x in select value from jsonb_array_elements(r->'possessions') loop
   perform rpg_private.fields(x,array['name','description','quantity']);
   perform rpg_private.assert(rpg_private.bootstrap_text(x->'name',1,200) and rpg_private.bootstrap_text(x->'description',0,2000) and rpg_private.wave4_integer(x->'quantity',1,1000));
  end loop;
  for x in select value from jsonb_array_elements(r->'resources') loop
   perform rpg_private.fields(x,array['key','label','amount']);
   perform rpg_private.assert(rpg_private.bootstrap_text(x->'key',1,48) and x->>'key' ~ '^[a-z][a-z0-9_-]*$' and x->>'key' not in ('constructor','prototype','__proto__') and rpg_private.bootstrap_text(x->'label',1,100) and rpg_private.wave4_integer(x->'amount') and (x->>'amount')::integer<=1000000);
  end loop;
 else
  perform rpg_private.fields(r,array['location','situation','narration','actors','answers','publicOpeningConfirmed']);
  perform rpg_private.assert(r->'publicOpeningConfirmed'='true');
  perform rpg_private.bootstrap_opening_fields(r,true);
 end if;
 perform rpg_private.assert(jsonb_typeof(r->'answers')='array' and jsonb_array_length(r->'answers')=jsonb_array_length(proposal->'questions'));
 for q,i in select value,ordinality::integer-1 from jsonb_array_elements(proposal->'questions') with ordinality loop
  perform rpg_private.assert((q->'consequential'='false' and r->'answers'->i='null') or rpg_private.bootstrap_text(r->'answers'->i,1,2000));
 end loop;
end $$;

commit;
