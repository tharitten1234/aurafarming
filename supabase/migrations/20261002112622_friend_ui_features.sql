alter table public.profiles add column aura_points integer not null default 0 check (aura_points >= 0);
alter table public.plants add column source text not null default 'ai' check (source in ('ai','manual'));
alter table public.plants add column archived_at timestamptz;
alter table public.growth_logs add column care_activity text not null default '' check (char_length(care_activity) <= 500);
alter table public.growth_logs add column notes text not null default '' check (char_length(notes) <= 1000);
alter table public.growth_logs add column plant_match_score integer check (plant_match_score between 0 and 100);
alter table public.user_missions add column week_start date not null default (date_trunc('week',now() at time zone 'Asia/Bangkok'))::date;
alter table public.user_missions drop constraint user_missions_user_id_plant_id_mission_id_key;
alter table public.user_missions add constraint user_missions_week_unique unique(user_id,plant_id,mission_id,week_start);
create table private.weekly_aura_bonus(user_id uuid references auth.users(id) on delete cascade,week_start date,primary key(user_id,week_start));
revoke all on private.weekly_aura_bonus from public,anon,authenticated;
create table public.care_events(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,plant_id uuid not null,kind text not null,created_at timestamptz not null default now(),foreign key(plant_id,user_id) references public.plants(id,user_id) on delete cascade);
create index care_events_owner_plant on public.care_events(user_id,plant_id,created_at desc);
create index care_events_plant_owner on public.care_events(plant_id,user_id);
alter table public.care_events enable row level security;
create policy own_care_events on public.care_events for select to authenticated using((select auth.uid())=user_id);
revoke all on public.care_events from public,anon,authenticated;
grant select on public.care_events to authenticated;
grant all on public.care_events to service_role;
create table private.plant_catalog (scientific_name text primary key, candidate jsonb not null, locations text[] not null);
revoke all on private.plant_catalog from public, anon, authenticated;
insert into private.plant_catalog values
('Monstera deliciosa','{"commonName":"มอนสเตอร่า","scientificName":"Monstera deliciosa","category":"catalog","confidence":0,"description":"รดน้ำเมื่อผิวดินชั้นบน 1-2 นิ้วแห้งสนิท สัปดาห์ละ 1-2 ครั้ง ห้ามรดน้ำทุกวันหรือปล่อยให้น้ำขัง","wateringIntervalDays":null,"sunlightRequirement":"medium","temperatureMinC":null,"temperatureMaxC":null,"careDifficulty":"unknown","warnings":["ห้ามโดนแดดตรงจัดช่วงบ่ายเพราะใบจะไหม้เกรียม และใบมีสารแคลเซียมออกซาเลตควรระวังสัตว์เลี้ยงกัดแทะ"]}'::jsonb,array['window','indoor']),
('Epipremnum aureum','{"commonName":"พลูด่าง","scientificName":"Epipremnum aureum","category":"catalog","confidence":0,"description":"รดน้ำเมื่อดินแห้ง 2-3 วันครั้ง หรือเลี้ยงในแจกันน้ำได้ ห้ามรดน้ำทุกวันจนดินแฉะเกินไป","wateringIntervalDays":null,"sunlightRequirement":"medium","temperatureMinC":null,"temperatureMaxC":null,"careDifficulty":"unknown","warnings":["ทนทานสูงมากแต่ห้ามวางตากแดดบ่ายจัดเพราะใบจะซีดไหม้ มีพิษอ่อนๆ ต่อน้องหมาและน้องแมวหากเคี้ยวกลืน"]}'::jsonb,array['indoor','window']),
('Sansevieria trifasciata','{"commonName":"ลิ้นมังกร","scientificName":"Sansevieria trifasciata","category":"catalog","confidence":0,"description":"รดน้ำสัปดาห์ละ 1 ครั้ง หรือเมื่อดินแห้งสนิทเท่านั้น ห้ามรดน้ำทุกวันเด็ดขาดเพราะโคนต้นจะเน่าตาย","wateringIntervalDays":null,"sunlightRequirement":"low","temperatureMinC":null,"temperatureMaxC":null,"careDifficulty":"unknown","warnings":["กลัวน้ำขังและความชื้นสะสมมากที่สุด ห้ามเทน้ำลงใจกลางพุ่มใบโดยตรง"]}'::jsonb,array['indoor','window','balcony']),
('Ficus elastica','{"commonName":"ยางอินเดีย","scientificName":"Ficus elastica","category":"catalog","confidence":0,"description":"รดน้ำเมื่อผิวดินแห้งลงไป 1 นิ้ว ประมาณสัปดาห์ละ 1 ครั้ง และปล่อยให้น้ำไหลระบายออกจนหมด","wateringIntervalDays":null,"sunlightRequirement":"medium","temperatureMinC":null,"temperatureMaxC":null,"careDifficulty":"unknown","warnings":["ใบหนาดักฝุ่นได้ดีจึงต้องหมั่นเช็ดใบ และไม่ชอบการย้ายตำแหน่งวางบ่อยๆ เพราะจะทิ้งใบ"]}'::jsonb,array['window','balcony']),
('Zamioculcas zamiifolia','{"commonName":"กวักมรกต","scientificName":"Zamioculcas zamiifolia","category":"catalog","confidence":0,"description":"รดน้ำ 10-14 วันต่อครั้ง เมื่อดินแห้งสนิททั้งกระถาง มีหัวสะสมน้ำใต้ดินจึงทนแล้งได้สูงมาก","wateringIntervalDays":null,"sunlightRequirement":"low","temperatureMinC":null,"temperatureMaxC":null,"careDifficulty":"unknown","warnings":["การรดน้ำบ่อยเกินไปคือสาเหตุอันดับ 1 ที่ทำให้หัวและก้านเน่าตาย"]}'::jsonb,array['indoor','window']),
('Spathiphyllum wallisii','{"commonName":"เดหลี","scientificName":"Spathiphyllum wallisii","category":"catalog","confidence":0,"description":"ชอบดินชื้นปานกลาง รดน้ำเมื่อผิวดินเริ่มแห้ง (ประมาณสัปดาห์ละ 2 ครั้ง) แต่ต้องไม่แฉะจนน้ำขัง","wateringIntervalDays":null,"sunlightRequirement":"medium","temperatureMinC":null,"temperatureMaxC":null,"careDifficulty":"unknown","warnings":["เมื่อขาดน้ำใบจะลู่ตกทันที ห้ามนำไปตั้งกลางแดดจัดเพราะใบจะไหม้และดอกจะเหี่ยว"]}'::jsonb,array['indoor','window']),
('Calathea orbifolia','{"commonName":"คล้าใบตอง","scientificName":"Calathea orbifolia","category":"catalog","confidence":0,"description":"รักษาดินให้มีความชื้นสม่ำเสมอแต่ไม่แฉะ ใช้น้ำพักหรือน้ำกรองเพื่อป้องกันขอบใบไหม้","wateringIntervalDays":null,"sunlightRequirement":"medium","temperatureMinC":null,"temperatureMaxC":null,"careDifficulty":"unknown","warnings":["ไวต่อคลอรีนในน้ำประปาและความชื้นต่ำในห้องแอร์ ห้ามโดนแดดตรงเพราะลวดลายจะซีดหาย"]}'::jsonb,array['indoor','window']),
('Dieffenbachia seguine','{"commonName":"สาวน้อยประแป้ง","scientificName":"Dieffenbachia seguine","category":"catalog","confidence":0,"description":"รดน้ำเมื่อดินแห้ง 1-2 นิ้ว ประมาณสัปดาห์ละ 1 ครั้ง ระบายน้ำได้ดี","wateringIntervalDays":null,"sunlightRequirement":"medium","temperatureMinC":null,"temperatureMaxC":null,"careDifficulty":"unknown","warnings":["ยางมีสารระคายเคืองสูงมาก ควรสวมถุงมือเมื่อตัดแต่ง และวางให้พ้นมือเด็กและสัตว์เลี้ยง"]}'::jsonb,array['window','indoor']),
('Jasminum sambac','{"commonName":"มะลิซ้อน","scientificName":"Jasminum sambac","category":"catalog","confidence":0,"description":"รดน้ำวันละ 1 ครั้งช่วงเช้าเมื่อดินชั้นบนแห้ง ระบายน้ำได้ดี ห้ามให้น้ำขังแฉะ","wateringIntervalDays":null,"sunlightRequirement":"high","temperatureMinC":null,"temperatureMaxC":null,"careDifficulty":"unknown","warnings":["หากได้รับแสงแดดไม่เพียงพอจะไม่ออกดอกและกิ่งจะยืดยาวอ่อนแอ"]}'::jsonb,array['balcony','porch']),
('Echinopsis calochlora','{"commonName":"กระบองเพชร","scientificName":"Echinopsis calochlora","category":"catalog","confidence":0,"description":"รดน้ำ 7-10 วันต่อครั้ง เมื่อดินแห้งสนิททั้งกระถางเท่านั้น ห้ามรดน้ำทุกวัน","wateringIntervalDays":null,"sunlightRequirement":"high","temperatureMinC":null,"temperatureMaxC":null,"careDifficulty":"unknown","warnings":["ความชื้นสะสมคือนักฆ่าอันดับหนึ่ง ระวังหนามแหลมคมเมื่อจับต้อง"]}'::jsonb,array['balcony','porch','window']),
('Ocimum basilicum','{"commonName":"โหระพาอิตาเลียน","scientificName":"Ocimum basilicum","category":"catalog","confidence":0,"description":"รดน้ำเมื่อหน้าดินเริ่มแห้ง วันละ 1 ครั้งช่วงเช้า ดินต้องโปร่งระบายน้ำได้ดี","wateringIntervalDays":null,"sunlightRequirement":"high","temperatureMinC":null,"temperatureMaxC":null,"careDifficulty":"unknown","warnings":["ต้องการแสงแดดอย่างน้อย 4-6 ชั่วโมงต่อวัน หากขาดแดดกิ่งจะลีบและกลิ่นน้ำมันหอมจะลดลง"]}'::jsonb,array['window','balcony','porch']),
('Ficus lyrata','{"commonName":"ไทรใบสัก","scientificName":"Ficus lyrata","category":"catalog","confidence":0,"description":"รดน้ำเมื่อดินแห้งลึก 2 นิ้ว ประมาณสัปดาห์ละ 1 ครั้ง ปล่อยให้น้ำไหลผ่านกระถางหมดจด","wateringIntervalDays":null,"sunlightRequirement":"medium","temperatureMinC":null,"temperatureMaxC":null,"careDifficulty":"unknown","warnings":["ไม่ชอบลมเย็นจากเครื่องปรับอากาศเป่าใส่โดยตรง และไวต่อการรดน้ำเกินขนาด"]}'::jsonb,array['window','balcony']),
('Aloe barbadensis miller','{"commonName":"ว่านหางจระเข้","scientificName":"Aloe barbadensis miller","category":"catalog","confidence":0,"description":"รดน้ำ 1-2 สัปดาห์ต่อครั้ง เมื่อดินแห้งสนิท กาบใบอวบน้ำกักเก็บความชื้นได้นาน","wateringIntervalDays":null,"sunlightRequirement":"high","temperatureMinC":null,"temperatureMaxC":null,"careDifficulty":"unknown","warnings":["ระวังอย่าให้มีน้ำขังในจานรองกระถาง ดินต้องผสมทรายหรือเพอร์ไลต์ระบายน้ำดี"]}'::jsonb,array['balcony','porch','window']),
('Nephrolepis exaltata','{"commonName":"เฟิร์นบอสตัน","scientificName":"Nephrolepis exaltata","category":"catalog","confidence":0,"description":"รดน้ำเมื่อผิวดินเริ่มแห้ง ชอบดินชื้นแต่ไม่ขังแฉะ สัปดาห์ละ 2-3 ครั้ง","wateringIntervalDays":null,"sunlightRequirement":"medium","temperatureMinC":null,"temperatureMaxC":null,"careDifficulty":"unknown","warnings":["ห้ามปล่อยให้ดินแห้งผากสนิท และไม่ชอบแดดตรงจัดเพราะใบจะแห้งกรอบร่วงหล่น"]}'::jsonb,array['window','indoor','balcony']),
('Thaumatophyllum xanadu','{"commonName":"ซานาดู","scientificName":"Thaumatophyllum xanadu","category":"catalog","confidence":0,"description":"รดน้ำเมื่อผิวดินแห้ง 1 นิ้ว สัปดาห์ละ 1-2 ครั้ง ระบายน้ำได้ดี","wateringIntervalDays":null,"sunlightRequirement":"medium","temperatureMinC":null,"temperatureMaxC":null,"careDifficulty":"unknown","warnings":["ใบหยักสวยงามแต่ไวต่อแดดบ่ายเผา ชอบอากาศถ่ายเทสะดวก"]}'::jsonb,array['indoor','window','balcony']);

create function private.match_score(candidate jsonb, placement text, light text) returns integer
language plpgsql stable set search_path = '' as $$
declare requirement text := candidate->>'sunlightRequirement'; locations text[]; distance integer; position_score integer;
begin
 if requirement = 'unknown' then return 50; end if;
 select c.locations into locations from private.plant_catalog c where c.scientific_name = match_score.candidate->>'scientificName';
 if locations is null then locations := case requirement when 'low' then array['indoor','window'] when 'medium' then array['window'] else array['balcony','porch'] end; end if;
 distance := abs((case requirement when 'low' then 0 when 'medium' then 1 else 2 end)-(case light when 'low' then 0 when 'medium' then 1 else 2 end));
 position_score := case when placement = any(locations) then 40
 when (placement='indoor' and 'window'=any(locations)) or (placement='balcony' and 'porch'=any(locations)) then 26 else 14 end;
 return (case distance when 0 then 60 when 1 then 38 else 18 end) + position_score;
end; $$;
create function private.set_match_score() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 new.aura_score := private.match_score(new.identification,new.placement,new.light);
 if tg_op='INSERT' then
  new.archived_at := null;
  new.source := case when exists(select 1 from public.plant_scans where id=new.scan_id and gemini_model='manual-catalog') then 'manual' else 'ai' end;
 end if;
 return new;
end; $$;
create trigger plants_zz_match before insert or update of placement,light on public.plants for each row execute function private.set_match_score();

create function private.add_manual_plant(common_name text, nickname text, placement text, light text, scientific_name text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=auth.uid(); candidate jsonb; scan_id uuid:=gen_random_uuid(); plant_id uuid; image_path text;
begin
 if owner_id is null then raise exception 'Authentication required'; end if;
 if char_length(trim(common_name)) not between 1 and 80 or char_length(trim(nickname)) not between 1 and 80 then raise exception 'Invalid name'; end if;
 select c.candidate into candidate from private.plant_catalog c where c.scientific_name=add_manual_plant.scientific_name
 or lower(c.candidate->>'commonName')=lower(trim(add_manual_plant.common_name)) limit 1;
 if candidate is null then candidate := jsonb_build_object('commonName',trim(common_name),'scientificName','Unknown species','category','user-added',
 'confidence',0,'description','ผู้ใช้เพิ่มชื่อเอง ยังไม่ได้ยืนยันชนิดพืช','wateringIntervalDays',null,'sunlightRequirement','unknown',
 'temperatureMinC',null,'temperatureMaxC',null,'careDifficulty','unknown','warnings',jsonb_build_array('ตรวจสอบชนิดและความต้องการพืชก่อนดูแล')); end if;
 candidate := candidate || jsonb_build_object('isPlant',true,'alternativeCandidates',jsonb_build_array());
 image_path:=owner_id::text||'/scans/manual-'||scan_id::text||'.jpg';
 insert into public.plant_scans(id,user_id,image_path,gemini_model,identification,status) values(scan_id,owner_id,image_path,'manual-catalog',candidate,'completed');
 insert into public.plants(user_id,scan_id,nickname,common_name,scientific_name,category,image_path,identification,care_info,aura_score,placement,light)
 values(owner_id,scan_id,trim(nickname),candidate->>'commonName',candidate->>'scientificName',candidate->>'category',image_path,candidate,candidate,50,placement,light) returning id into plant_id;
 return plant_id;
end; $$;
create function public.add_manual_plant(common_name text,nickname text,placement text,light text,scientific_name text default null) returns uuid
language sql security invoker set search_path='' as $$select private.add_manual_plant(common_name,nickname,placement,light,scientific_name);$$;

create function private.move_plant(target_plant uuid,new_placement text,new_light text) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 update public.plants set placement=new_placement,light=new_light where id=target_plant and user_id=auth.uid() and archived_at is null;
 if not found then raise exception 'Plant not found'; end if;
end; $$;
create function public.move_plant(target_plant uuid,new_placement text,new_light text) returns void language sql security invoker set search_path='' as $$select private.move_plant(target_plant,new_placement,new_light);$$;
create function private.archive_plant(target_plant uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 update public.plants set archived_at=now() where id=target_plant and user_id=auth.uid() and archived_at is null;
 if not found then raise exception 'Plant not found'; end if;
end; $$;
create function public.archive_plant(target_plant uuid) returns void language sql security invoker set search_path='' as $$select private.archive_plant(target_plant);$$;

create function private.aura_reward() returns trigger language plpgsql security definer set search_path='' as $$
declare points integer:=0; owner_id uuid:=new.user_id;
begin
 insert into public.profiles(user_id) values(owner_id) on conflict do nothing;
 perform 1 from public.profiles where user_id=owner_id for update;
 if tg_table_name='plants' then points:=case new.source when 'manual' then 15 else 20 end;
 elsif tg_table_name='growth_logs' then points:=15;
 elsif new.status='completed' and old.status<>'completed' then
  points:=10;
  if not exists(select 1 from public.user_missions m join public.plants p on p.id=m.plant_id where m.user_id=new.user_id and m.week_start=new.week_start and p.archived_at is null and m.status<>'completed') then
   insert into private.weekly_aura_bonus values(new.user_id,new.week_start) on conflict do nothing;
   if found then points:=points+30; end if;
  end if;
 end if;
 update public.profiles set aura_points=aura_points+points where user_id=owner_id;
 return new;
end; $$;
create trigger plant_aura after insert on public.plants for each row execute function private.aura_reward();
create trigger growth_aura after insert on public.growth_logs for each row execute function private.aura_reward();
create trigger mission_aura after update of status on public.user_missions for each row execute function private.aura_reward();
create function private.growth_snapshot() returns trigger language plpgsql security definer set search_path='' as $$
begin
 select aura_score into new.plant_match_score from public.plants where id=new.plant_id and user_id=new.user_id and archived_at is null;
 if not found then raise exception 'Active plant required'; end if;
 return new;
end; $$;
create trigger growth_snapshot before insert on public.growth_logs for each row execute function private.growth_snapshot();
create function private.care_history() returns trigger language plpgsql security definer set search_path='' as $$
declare event text;
begin
 if new.last_watered_at is distinct from old.last_watered_at then event:='water';
 elsif new.last_checked_at is distinct from old.last_checked_at then event:=new.moisture_result;
 elsif new.placement is distinct from old.placement or new.light is distinct from old.light then event:='move'; end if;
 if event is not null then insert into public.care_events(user_id,plant_id,kind) values(new.user_id,new.id,event); end if;
 return new;
end; $$;
create trigger plant_care_history after update of last_watered_at,last_checked_at,placement,light on public.plants for each row execute function private.care_history();
revoke all on function private.care_history() from public,anon,authenticated;

create or replace function private.initialize_profile() returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 insert into public.profiles(user_id) values(auth.uid()) on conflict do nothing;
 insert into public.user_missions(user_id,plant_id,mission_id)
 select auth.uid(),p.id,m.id from public.plants p cross join public.missions m where p.user_id=auth.uid() and p.archived_at is null on conflict do nothing;
end; $$;

create policy own_profile_update on public.profiles for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
grant update(display_name) on public.profiles to authenticated;
revoke all on function private.match_score(jsonb,text,text),private.set_match_score(),private.aura_reward(),private.growth_snapshot() from public,anon,authenticated;
revoke all on function private.add_manual_plant(text,text,text,text,text),private.move_plant(uuid,text,text),private.archive_plant(uuid),public.add_manual_plant(text,text,text,text,text),public.move_plant(uuid,text,text),public.archive_plant(uuid) from public,anon,authenticated;
grant execute on function private.add_manual_plant(text,text,text,text,text),private.move_plant(uuid,text,text),private.archive_plant(uuid),public.add_manual_plant(text,text,text,text,text),public.move_plant(uuid,text,text),public.archive_plant(uuid) to authenticated;

-- Existing AuraScore values become Plant Match Scores using the new rule.
update public.plants set aura_score=private.match_score(identification,placement,light);
update public.growth_logs g set plant_match_score=p.aura_score from public.plants p where g.plant_id=p.id;
update public.profiles p set aura_points=(select count(*)*20 from public.plants where user_id=p.user_id)+(select count(*)*15 from public.growth_logs where user_id=p.user_id)+(select count(*)*10 from public.user_missions where user_id=p.user_id and status='completed');


create or replace function private.record_care(target_plant uuid, care_kind text) returns void language plpgsql security definer set search_path = '' as $$
declare plant public.plants; today date := (now() at time zone 'Asia/Bangkok')::date;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if care_kind not in ('water','dry','moist','wet') then raise exception 'Invalid care'; end if;
  select * into plant from public.plants where id = target_plant and user_id = auth.uid() and archived_at is null for update;
  if plant.id is null then raise exception 'Plant not found'; end if;
  if care_kind = 'water' then
    update public.plants set last_watered_at = now(), care_status = 'happy' where id = plant.id;
    if plant.last_watered_at is null or (plant.last_watered_at at time zone 'Asia/Bangkok')::date <> today then perform private.award(plant.user_id,10,5,true); end if;
  else
    update public.plants set last_checked_at = now(), moisture_result = care_kind,
      care_status = case when care_kind = 'dry' then 'needs-water' else 'good' end where id = plant.id;
    -- Complete the one-time intro mission; its trigger awards once, atomically.
    update public.user_missions set status = 'completed', completed_at = now()
    where plant_id = plant.id and user_id = auth.uid() and mission_id = 'moisture' and week_start=(date_trunc('week',now() at time zone 'Asia/Bangkok'))::date and status <> 'completed';
    perform private.award(plant.user_id,0,0,true);
  end if;
end; $$;
create or replace function private.growth_created() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform private.award(new.user_id,20,15);
  update public.user_missions set status = 'completed', completed_at = now()
  where user_id = new.user_id and plant_id = new.plant_id and mission_id = 'photo' and week_start=(date_trunc('week',now() at time zone 'Asia/Bangkok'))::date and status <> 'completed';
  return new;
end; $$;
create or replace function private.set_mission_status(target_mission uuid, next_status text) returns void language plpgsql security definer set search_path = '' as $$
declare progress public.user_missions; kind text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if next_status not in ('completed','postponed','skipped') then raise exception 'Invalid status'; end if;
  select * into progress from public.user_missions where id = target_mission and user_id = auth.uid() for update;
  if progress.id is null then raise exception 'Mission not found'; end if;
  if progress.week_start <> (date_trunc('week',now() at time zone 'Asia/Bangkok'))::date or not exists(select 1 from public.plants where id=progress.plant_id and user_id=auth.uid() and archived_at is null) then raise exception 'Inactive mission'; end if;
  if progress.status = 'completed' then return; end if;
  select m.kind into kind from public.missions m where m.id = progress.mission_id;
  if next_status = 'completed' and kind = 'photo' and not exists(select 1 from public.growth_logs where plant_id = progress.plant_id and user_id = auth.uid() and created_at >= (progress.week_start::timestamp at time zone 'Asia/Bangkok')) then
    raise exception 'Save a growth photo first';
  end if;
  update public.user_missions set status = next_status,
    completed_at = case when next_status = 'completed' then now() else null end,
    due_at = case when next_status = 'postponed' then now() + interval '1 day' when next_status = 'skipped' then now() + interval '7 days' else due_at end
  where id = progress.id;
end; $$;
