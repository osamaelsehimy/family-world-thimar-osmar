-- Thimar 3X Challenge Engine
create table public.challenge_catalog (
 id uuid primary key default gen_random_uuid(), slug text not null unique check(slug ~ '^[a-z0-9-]{3,80}$'),
 title_ar text not null,title_en text not null,description_ar text not null,description_en text not null,
 area_sqm integer not null check(area_sqm>0),grid_width integer,grid_height integer,
 points_award integer not null default 0 check(points_award between 0 and 10000),
 sort_order integer not null default 0,is_active boolean not null default false,created_at timestamptz not null default now()
);
create table public.challenge_tasks (
 id uuid primary key default gen_random_uuid(),challenge_id uuid not null references public.challenge_catalog(id) on delete cascade,
 task_key text not null check(task_key ~ '^[a-z0-9_]{2,60}$'),title_ar text not null,title_en text not null,
 description_ar text not null,description_en text not null,sort_order integer not null default 0,
 points_weight integer not null default 0 check(points_weight between 0 and 10000),is_required boolean not null default true,
 unique(challenge_id,task_key)
);
create table public.challenge_projects (
 id uuid primary key default gen_random_uuid(),challenge_id uuid not null references public.challenge_catalog(id),
 owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
 title text not null check(char_length(btrim(title)) between 3 and 120),
 status text not null default 'draft' check(status in ('draft','submitted','approved','revision_requested')),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),submitted_at timestamptz
);
create index challenge_projects_owner_idx on public.challenge_projects(owner_id,created_at desc);
create table public.challenge_task_progress (
 id uuid primary key default gen_random_uuid(),project_id uuid not null references public.challenge_projects(id) on delete cascade,
 task_id uuid not null references public.challenge_tasks(id),user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
 status text not null default 'todo' check(status in ('todo','in_progress','completed')),
 notes text check(notes is null or char_length(notes)<=1200),updated_at timestamptz not null default now(),unique(project_id,task_id)
);
create index challenge_progress_project_idx on public.challenge_task_progress(project_id);
create table public.challenge_submissions (
 id uuid primary key default gen_random_uuid(),project_id uuid not null references public.challenge_projects(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,submission_no integer not null check(submission_no>0),
 narrative text not null check(char_length(btrim(narrative)) between 30 and 8000),
 deliverable_url text check(deliverable_url is null or (char_length(deliverable_url)<=1000 and deliverable_url ~ '^https://')),
 status text not null default 'pending' check(status in ('pending','approved','revision_requested','rejected')),
 review_note text check(review_note is null or char_length(review_note)<=2000),reviewed_by uuid references auth.users(id),
 reviewed_at timestamptz,created_at timestamptz not null default now(),unique(project_id,submission_no)
);
create index challenge_submissions_review_idx on public.challenge_submissions(status,created_at);
alter table public.challenge_catalog enable row level security;
alter table public.challenge_tasks enable row level security;
alter table public.challenge_projects enable row level security;
alter table public.challenge_task_progress enable row level security;
alter table public.challenge_submissions enable row level security;
create policy "Active challenges are readable" on public.challenge_catalog for select to anon,authenticated using(is_active);
create policy "Tasks for active challenges are readable" on public.challenge_tasks for select to anon,authenticated using(exists(select 1 from public.challenge_catalog c where c.id=challenge_id and c.is_active));
create policy "Members read own challenge projects" on public.challenge_projects for select to authenticated using(owner_id=(select auth.uid()));
create policy "Active members create own challenge projects" on public.challenge_projects for insert to authenticated with check(owner_id=(select auth.uid()) and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.membership_status='active') and exists(select 1 from public.challenge_catalog c where c.id=challenge_id and c.is_active));
create policy "Members update own editable projects" on public.challenge_projects for update to authenticated using(owner_id=(select auth.uid()) and status in ('draft','revision_requested')) with check(owner_id=(select auth.uid()) and status in ('draft','revision_requested'));
create policy "Members read own task progress" on public.challenge_task_progress for select to authenticated using(user_id=(select auth.uid()) and exists(select 1 from public.challenge_projects p where p.id=project_id and p.owner_id=(select auth.uid())));
create policy "Members create own task progress" on public.challenge_task_progress for insert to authenticated with check(user_id=(select auth.uid()) and exists(select 1 from public.challenge_projects p where p.id=project_id and p.owner_id=(select auth.uid()) and p.status in ('draft','revision_requested')) and exists(select 1 from public.challenge_tasks t where t.id=task_id and t.challenge_id=(select p.challenge_id from public.challenge_projects p where p.id=project_id)));
create policy "Members update own task progress" on public.challenge_task_progress for update to authenticated using(user_id=(select auth.uid()) and exists(select 1 from public.challenge_projects p where p.id=project_id and p.owner_id=(select auth.uid()) and p.status in ('draft','revision_requested'))) with check(user_id=(select auth.uid()) and exists(select 1 from public.challenge_projects p where p.id=project_id and p.owner_id=(select auth.uid()) and p.status in ('draft','revision_requested')));
create policy "Owners and OSMAR admins read challenge submissions" on public.challenge_submissions for select to authenticated using(user_id=(select auth.uid()) or coalesce((select auth.jwt())->'app_metadata'->>'role','')='osmar_admin');
create policy "OSMAR admins read all challenge projects" on public.challenge_projects for select to authenticated using(coalesce((select auth.jwt())->'app_metadata'->>'role','')='osmar_admin');
grant select on public.challenge_catalog,public.challenge_tasks to anon,authenticated;
grant select,insert,update on public.challenge_projects to authenticated;
grant select,insert,update on public.challenge_task_progress to authenticated;
grant select on public.challenge_submissions to authenticated;
revoke insert,update,delete on public.challenge_submissions from anon,authenticated;
create or replace function public.submit_3x_challenge(p_project_id uuid,p_narrative text,p_deliverable_url text default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid(); v_project public.challenge_projects%rowtype; v_submission uuid; v_next integer; v_required integer; v_done integer;
begin
 if v_user is null then raise exception 'Authentication required'; end if;
 if char_length(btrim(coalesce(p_narrative,''))) not between 30 and 8000 then raise exception 'Submission narrative must be 30 to 8000 characters'; end if;
 if p_deliverable_url is not null and (char_length(p_deliverable_url)>1000 or p_deliverable_url !~ '^https://') then raise exception 'Deliverable link must be HTTPS'; end if;
 select * into v_project from public.challenge_projects where id=p_project_id and owner_id=v_user for update;
 if not found or v_project.status not in ('draft','revision_requested') then raise exception 'Project is not editable'; end if;
 if not exists(select 1 from public.profiles p where p.id=v_user and p.membership_status='active') then raise exception 'Active membership required'; end if;
 select count(*) into v_required from public.challenge_tasks t where t.challenge_id=v_project.challenge_id and t.is_required;
 select count(*) into v_done from public.challenge_task_progress pr join public.challenge_tasks t on t.id=pr.task_id where pr.project_id=p_project_id and pr.user_id=v_user and pr.status='completed' and t.is_required;
 if v_required=0 or v_done<>v_required then raise exception 'Complete every required task before submitting'; end if;
 select coalesce(max(submission_no),0)+1 into v_next from public.challenge_submissions where project_id=p_project_id;
 insert into public.challenge_submissions(project_id,user_id,submission_no,narrative,deliverable_url) values(p_project_id,v_user,v_next,btrim(p_narrative),p_deliverable_url) returning id into v_submission;
 update public.challenge_projects set status='submitted',submitted_at=now(),updated_at=now() where id=p_project_id; return v_submission;
end; $$;
create or replace function public.osmar_review_3x_submission(p_submission_id uuid,p_decision text,p_review_note text default null)
returns boolean language plpgsql security definer set search_path='' as $$
declare v_submission public.challenge_submissions%rowtype; v_points integer; v_slug text;
begin
 if auth.uid() is null or coalesce(auth.jwt()->'app_metadata'->>'role','')<>'osmar_admin' then raise exception 'OSMAR administrator access required'; end if;
 if p_decision not in ('approved','revision_requested','rejected') then raise exception 'Invalid review decision'; end if;
 if p_review_note is not null and char_length(p_review_note)>2000 then raise exception 'Review note too long'; end if;
 select * into v_submission from public.challenge_submissions where id=p_submission_id and status='pending' for update;
 if not found then raise exception 'Pending submission not found'; end if;
 update public.challenge_submissions set status=p_decision,review_note=nullif(btrim(p_review_note),''),reviewed_by=auth.uid(),reviewed_at=now() where id=p_submission_id;
 if p_decision='approved' then
  select c.points_award,c.slug into v_points,v_slug from public.challenge_projects p join public.challenge_catalog c on c.id=p.challenge_id where p.id=v_submission.project_id;
  update public.challenge_projects set status='approved',updated_at=now() where id=v_submission.project_id;
  if coalesce(v_points,0)>0 then perform public.osmar_award_points(v_submission.user_id,v_points,'Approved 3X challenge: '||v_slug,'challenge','3x:'||v_submission.id::text); end if;
 elsif p_decision='revision_requested' then update public.challenge_projects set status='revision_requested',updated_at=now() where id=v_submission.project_id;
 else update public.challenge_projects set status='draft',updated_at=now() where id=v_submission.project_id; end if;
 return true;
end; $$;
revoke all on function public.submit_3x_challenge(uuid,text,text) from public,anon;
grant execute on function public.submit_3x_challenge(uuid,text,text) to authenticated;
revoke all on function public.osmar_review_3x_submission(uuid,text,text) from public,anon;
grant execute on function public.osmar_review_3x_submission(uuid,text,text) to authenticated;
insert into public.challenge_catalog(slug,title_ar,title_en,description_ar,description_en,area_sqm,points_award,sort_order,is_active)
values('home-100m2','بيتي يبدأ بفكرة','A Home Begins with an Idea','صمّم شقة 10 × 10 متر بمساحة 100 متر مربع، تراعي احتياجات الأسرة والخصوصية والراحة والاستدامة.','Design a 10 × 10 metre, 100 m² apartment that supports family needs, privacy, comfort, and sustainability.',100,100,1,true)
on conflict(slug) do update set title_ar=excluded.title_ar,title_en=excluded.title_en,description_ar=excluded.description_ar,description_en=excluded.description_en,area_sqm=excluded.area_sqm,points_award=excluded.points_award,sort_order=excluded.sort_order,is_active=true;
insert into public.challenge_tasks(challenge_id,task_key,title_ar,title_en,description_ar,description_en,sort_order,points_weight,is_required)
select c.id,v.task_key,v.title_ar,v.title_en,v.description_ar,v.description_en,v.sort_order,20,true from public.challenge_catalog c
cross join (values
('family_needs','احتياجات الأسرة','Family needs','حدّد عدد المستخدمين واحتياجاتهم اليومية وأولوياتهم.','Define occupants, daily routines, and priorities.',1),
('space_layout','توزيع المساحات','Space planning','وزّع الغرف والخدمات ومسارات الحركة داخل المساحة.','Arrange rooms, services, and circulation.',2),
('privacy_access','الخصوصية والحركة','Privacy and circulation','راعِ الخصوصية وسهولة الوصول والحركة الآمنة.','Consider privacy, accessibility, and safe movement.',3),
('climate_energy','الراحة والطاقة والمياه','Comfort, energy, and water','فكّر في الإضاءة والتهوية وترشيد الطاقة والمياه.','Plan daylight, ventilation, and efficient energy and water use.',4),
('materials_budget','المواد والميزانية','Materials and budget','اختر مواد مناسبة وضع تقديرًا أوليًا للتكلفة.','Select suitable materials and prepare an initial cost estimate.',5)
) as v(task_key,title_ar,title_en,description_ar,description_en,sort_order) where c.slug='home-100m2'
on conflict(challenge_id,task_key) do update set title_ar=excluded.title_ar,title_en=excluded.title_en,description_ar=excluded.description_ar,description_en=excluded.description_en,sort_order=excluded.sort_order,points_weight=excluded.points_weight,is_required=true;
