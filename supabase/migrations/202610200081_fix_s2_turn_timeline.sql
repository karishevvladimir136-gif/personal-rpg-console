-- Fix run after session 2, stage C (the turn on screen; items 43, 63): what the turn timeline needs from the server.
--   * A saved turn's change lists where in the narration it was made (`at`, rolls only; computed by the loop at the
--     commit from its own transcript and kept in the turn's meta as `textAt`): a turn this page did not see told shows
--     each roll in its place, not all of them before the text.
--   * A paused dm-loop turn carries the text told so far (`told`): after a reload or a server restart the roll card
--     waiting for the player shows after the text before it. Public: the player read it as it streamed; the two-pass
--     writer's private ledger never reaches `dmLoop.text`.
-- Additive only: the projection patched in place, no table changes.
begin;

do $m$ declare d text; begin
 select pg_get_functiondef('rpg_private.runtime_public_turn_before_polish_rolls(rpg_private.turns)'::regprocedure) into d;
 d:=replace(d,$a$'action',r.value#>>'{call,arguments,action}')) order by$a$,
  $b$'action',r.value#>>'{call,arguments,action}','at',t.checkpoint#>'{dmLoop,meta,textAt}'->(r.value->>'position'))) order by$b$);
 perform rpg_private.assert(d like '%''at'',t.checkpoint#>''{dmLoop,meta,textAt}''->(r.value->>''position''))) order by%');
 execute d;
end $m$;

alter function rpg_private.runtime_public_turn(rpg_private.turns) rename to runtime_public_turn_before_timeline;
create function rpg_private.runtime_public_turn(t rpg_private.turns)
returns jsonb language plpgsql stable set search_path='' as $$
declare result jsonb:=rpg_private.runtime_public_turn_before_timeline(t); begin
 if t.runtime_identity='dm-loop-v1' and t.status='awaiting_confirmation' and jsonb_typeof(t.checkpoint#>'{dmLoop,text}')='string' then
   result:=result||jsonb_build_object('told',left(t.checkpoint#>>'{dmLoop,text}',60000));
 end if;
 return result;
end $$;
revoke all on function rpg_private.runtime_public_turn_before_timeline(rpg_private.turns),rpg_private.runtime_public_turn(rpg_private.turns) from public,anon,authenticated;

commit;
