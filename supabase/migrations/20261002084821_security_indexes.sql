-- Cover composite ownership FKs; replace only indexes created by this project.
create index plants_scan_owner on public.plants(scan_id, user_id);
create index growth_logs_plant_owner on public.growth_logs(plant_id, user_id);
create index user_missions_plant_owner on public.user_missions(plant_id, user_id);
drop index public.growth_logs_plant;
drop index public.user_missions_plant;

-- Some hosted projects provision this event trigger with public EXECUTE.
-- It is internal infrastructure, not an RPC for anonymous/browser callers.
do $$ begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end; $$;
