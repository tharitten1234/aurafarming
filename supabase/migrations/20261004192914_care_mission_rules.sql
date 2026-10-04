-- Keep existing UI/API contracts. Future mission rewards change; earned points stay intact.
alter table public.profiles add column best_care_streak integer not null default 0 check(best_care_streak>=0);
update public.profiles set best_care_streak=streak;
create function private.keep_best_care_streak() returns trigger language plpgsql security definer set search_path='' as $$
begin
 new.best_care_streak:=greatest(old.best_care_streak,old.streak,new.streak);
 return new;
end; $$;
revoke all on function private.keep_best_care_streak() from public,anon,authenticated;
create trigger profiles_care_best before update of streak on public.profiles for each row execute function private.keep_best_care_streak();

-- A growth photograph earns Aura through its weekly mission only, not every upload.
drop trigger growth_aura on public.growth_logs;
create or replace function private.aura_reward() returns trigger language plpgsql security definer set search_path='' as $$
declare points integer:=0; owner_id uuid:=new.user_id;
begin
 insert into public.profiles(user_id) values(owner_id) on conflict do nothing;
 perform 1 from public.profiles where user_id=owner_id for update;
 if tg_table_name='plants' then points:=case new.source when 'manual' then 15 else 20 end;
 elsif tg_table_name='user_missions' and new.status='completed' and old.status<>'completed' then
  select case kind when 'photo' then 15 else 10 end into points from public.missions where id=new.mission_id;
  if not exists(select 1 from public.user_missions m join public.plants p on p.id=m.plant_id
   where m.user_id=new.user_id and m.week_start=new.week_start and p.archived_at is null and m.status<>'completed') then
   insert into private.weekly_aura_bonus values(new.user_id,new.week_start) on conflict do nothing;
   if found then points:=points+30; end if;
  end if;
 end if;
 update public.profiles set aura_points=aura_points+points where user_id=owner_id;
 return new;
end; $$;

create or replace function private.initialize_profile() returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 insert into public.profiles(user_id) values(auth.uid()) on conflict do nothing;
 perform 1 from public.profiles where user_id=auth.uid() for update;
 insert into public.user_missions(user_id,plant_id,mission_id)
 select auth.uid(),p.id,m.id from public.plants p cross join public.missions m
 where p.user_id=auth.uid() and p.archived_at is null on conflict do nothing;
 update public.user_missions set status='pending' where user_id=auth.uid() and status='postponed' and due_at<=now()
 and week_start=(date_trunc('week',now() at time zone 'Asia/Bangkok'))::date;
end; $$;

create or replace function private.record_care(target_plant uuid, care_kind text) returns void language plpgsql security definer set search_path='' as $$
declare plant public.plants; today date:=(now() at time zone 'Asia/Bangkok')::date;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if care_kind not in ('water','dry','moist','wet') then raise exception 'Invalid care'; end if;
 insert into public.profiles(user_id) values(auth.uid()) on conflict do nothing;
 perform 1 from public.profiles where user_id=auth.uid() for update;
 select * into plant from public.plants where id=target_plant and user_id=auth.uid() and archived_at is null for update;
 if plant.id is null then raise exception 'Plant not found'; end if;
 if care_kind='water' then
  if (plant.last_watered_at at time zone 'Asia/Bangkok')::date=today then return; end if;
  if plant.moisture_result is distinct from 'dry' or plant.last_checked_at is null
   or plant.last_checked_at<now()-interval '24 hours' or plant.last_checked_at>now()
   or (plant.last_watered_at is not null and plant.last_checked_at<=plant.last_watered_at)
   then raise exception 'Fresh dry soil check required'; end if;
  update public.plants set last_watered_at=now(),care_status='happy' where id=plant.id;
  perform private.award(plant.user_id,10,5,true);
 else
  update public.plants set last_checked_at=now(),moisture_result=care_kind,
   care_status=case when care_kind='dry' then 'needs-water' else 'good' end where id=plant.id;
  update public.user_missions set status='completed',completed_at=now()
  where plant_id=plant.id and user_id=auth.uid() and mission_id='moisture'
   and week_start=(date_trunc('week',now() at time zone 'Asia/Bangkok'))::date
   and status in ('pending','postponed') and due_at<=now();
  perform private.award(plant.user_id,0,0,true);
 end if;
end; $$;

create or replace function private.growth_created() returns trigger language plpgsql security definer set search_path='' as $$
begin
 -- Keep the same profile-first lock order as soil and mission operations.
 perform 1 from public.profiles where user_id=new.user_id for update;
 update public.user_missions set status='completed',completed_at=now()
 where user_id=new.user_id and plant_id=new.plant_id and mission_id='photo'
  and week_start=(date_trunc('week',now() at time zone 'Asia/Bangkok'))::date
  and status in ('pending','postponed') and due_at<=now();
 return new;
end; $$;

-- Preserve environmental cautions, but do not turn unreferenced toxicity into a fact.
update private.plant_catalog c set candidate=jsonb_set(c.candidate,'{warnings}',
 jsonb_build_array(case when c.scientific_name='Monstera deliciosa'
  then 'ข้อมูลความเป็นพิษ: เป็นพิษต่อสุนัขและแมว หลีกเลี่ยงการกัดกิน (อ้างอิง ASPCA)'
  else 'ข้อมูลความเป็นพิษ: ยังไม่มีข้อมูลเพียงพอ' end)
 ||coalesce((select jsonb_agg(w) from jsonb_array_elements_text(c.candidate->'warnings') w
  where w!~*'พิษ|รับประทาน|กินได้|ปลอดภัยต่อ|สัตว์เลี้ยง|toxic|edible'),'[]'::jsonb));

create or replace function private.set_mission_status(target_mission uuid,next_status text) returns void language plpgsql security definer set search_path='' as $$
declare progress public.user_missions; mission_kind text;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if next_status not in ('completed','postponed','skipped') then raise exception 'Invalid status'; end if;
 insert into public.profiles(user_id) values(auth.uid()) on conflict do nothing;
 perform 1 from public.profiles where user_id=auth.uid() for update;
 select * into progress from public.user_missions where id=target_mission and user_id=auth.uid() for update;
 if progress.id is null then raise exception 'Mission not found'; end if;
 if progress.week_start<>(date_trunc('week',now() at time zone 'Asia/Bangkok'))::date
  or not exists(select 1 from public.plants where id=progress.plant_id and user_id=auth.uid() and archived_at is null)
  then raise exception 'Inactive mission'; end if;
 if progress.status='completed' then return; end if;
 select kind into mission_kind from public.missions where id=progress.mission_id;
 if next_status='completed' then
  if progress.status='skipped' or progress.due_at>now() then raise exception 'Mission not due'; end if;
  if mission_kind='photo' and not exists(select 1 from public.growth_logs
   where plant_id=progress.plant_id and user_id=auth.uid()
   and created_at>=greatest(progress.due_at,progress.week_start::timestamp at time zone 'Asia/Bangkok'))
   then raise exception 'Save a growth photo first'; end if;
  if mission_kind='moisture' and not exists(select 1 from public.plants
   where id=progress.plant_id and user_id=auth.uid()
   and last_checked_at>=greatest(progress.due_at,progress.week_start::timestamp at time zone 'Asia/Bangkok'))
   then raise exception 'Record soil check first'; end if;
 end if;
 update public.user_missions set status=next_status,completed_at=case when next_status='completed' then now() else null end,
  due_at=case when next_status='postponed' then now()+interval '1 day' else due_at end where id=progress.id;
end; $$;
