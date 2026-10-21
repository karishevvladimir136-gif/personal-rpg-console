-- Fixes before session 3 (docs/stages/FIX_S3_PRE.md 2.3, audit rows A-39 / A-71): the owner asked to see the DC. The
-- TypeScript default (src/lib/campaign-settings.ts showDc: true) reaches only previews: every campaign created through
-- the app was seeded with showDc false (202609170001, campaign.create), the owner's campaign included. Additive: each
-- campaign whose settings say showDc false gets a new settings revision with showDc true (the history keeps the old one,
-- as a save from the settings screen would), and campaign.create seeds true from now on. Nothing else in the settings
-- changes.
begin;

do $$ declare r record; rev integer; next_values jsonb; d text; n integer:=0; fn record;
begin
 for r in select s.campaign_id, s.values from public.rpg_settings s where s.values->>'showDc'='false' for update loop
   rev:=(select coalesce(max(v.revision),0)+1 from public.rpg_settings_revisions v where v.campaign_id=r.campaign_id);
   next_values:=jsonb_set(r.values,'{showDc}','true'::jsonb);
   update public.rpg_settings set values=next_values,revision=rev,updated_at=now() where campaign_id=r.campaign_id;
   insert into public.rpg_settings_revisions(campaign_id,values,revision) values(r.campaign_id,next_values,rev);
 end loop;
 for fn in select p.oid from pg_proc p join pg_namespace s on s.oid=p.pronamespace
   where s.nspname in ('public','rpg_private') and p.prosrc like '%''interactiveDice'',true,''showDc'',false%' loop
   d:=replace(pg_get_functiondef(fn.oid),'''interactiveDice'',true,''showDc'',false','''interactiveDice'',true,''showDc'',true');
   execute d;
   n:=n+1;
 end loop;
 perform rpg_private.assert(n=1);
end $$;

revoke all on all functions in schema rpg_private from public,anon,authenticated;

commit;
