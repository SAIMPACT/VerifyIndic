begin;

create table if not exists private.admin_allowlist (
  email text primary key check (email = lower(email) and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  full_name text not null check (char_length(trim(full_name)) between 2 and 120),
  created_at timestamptz not null default now()
);

insert into private.admin_allowlist (email, full_name) values
  ('sakshiraghuwanshi0309@gmail.com', 'Sakshi Raghuwanshi'),
  ('agarwalsaksham099@gmail.com', 'Saksham Agarwal'),
  ('vallabhmadje22@gamil.com', 'Vallabh Madje'),
  ('rajkose.94@gmail.com', 'Raj Kose')
on conflict (email) do update set full_name = excluded.full_name;

create table if not exists private.account_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 2 and 120),
  role text not null check (role in ('member', 'admin')) default 'member',
  contact_email text,
  contact_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table private.admin_allowlist enable row level security;
alter table private.account_profiles enable row level security;
revoke all on private.admin_allowlist, private.account_profiles from public, anon, authenticated;
grant select on private.account_profiles to authenticated;

drop policy if exists account_profiles_read_self on private.account_profiles;
create policy account_profiles_read_self on private.account_profiles
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function private.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from private.account_profiles
    where user_id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function private.is_current_user_admin() from public, anon, authenticated;

create or replace function private.create_verifyindic_account()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed_admin private.admin_allowlist%rowtype;
  account_name text;
  account_role text := 'member';
  account_email text := lower(nullif(new.email, ''));
  account_phone text := nullif(new.phone, '');
begin
  if account_email is not null then
    select * into allowed_admin
    from private.admin_allowlist
    where email = account_email;
  end if;

  if found then
    account_role := 'admin';
    account_name := allowed_admin.full_name;
  elsif new.raw_user_meta_data->>'verifyindic_registration' = 'true' then
    account_name := coalesce(
      nullif(btrim(new.raw_user_meta_data->>'display_name'), ''),
      nullif(btrim(new.raw_user_meta_data->>'full_name'), '')
    );
  else
    -- A user made outside the VerifyIndic registration flow has no profile or
    -- workspace, and the web app denies their access after authentication.
    return new;
  end if;

  if account_name is null or char_length(account_name) not between 2 and 120
     or (account_email is null and account_phone is null) then
    raise exception 'Invalid VerifyIndic registration details';
  end if;

  insert into private.account_profiles (user_id, full_name, role, contact_email, contact_phone)
  values (new.id, account_name, account_role, account_email, account_phone)
  on conflict (user_id) do update set
    full_name = excluded.full_name,
    role = excluded.role,
    contact_email = excluded.contact_email,
    contact_phone = excluded.contact_phone,
    updated_at = now();

  insert into private.workspaces (id, name, plan)
  values (
    new.id,
    case when account_role = 'admin' then 'VerifyIndic administration' else account_name || ' workspace' end,
    case when account_role = 'admin' then 'team' else 'yearly' end
  )
  on conflict (id) do nothing;

  insert into private.workspace_members (user_id, workspace_id, display_name)
  values (new.id, new.id, account_name)
  on conflict (user_id) do update set display_name = excluded.display_name;

  return new;
end;
$$;

revoke all on function private.create_verifyindic_account() from public, anon, authenticated;

drop trigger if exists create_verifyindic_signup_workspace on auth.users;
drop trigger if exists create_verifyindic_account on auth.users;
create trigger create_verifyindic_account
after insert on auth.users
for each row execute function private.create_verifyindic_account();

-- Make current workspace users visible to the account gate as well.
insert into private.account_profiles (user_id, full_name, role, contact_email, contact_phone)
select
  m.user_id,
  coalesce(a.full_name, m.display_name),
  case when a.email is null then 'member' else 'admin' end,
  lower(nullif(u.email, '')),
  nullif(u.phone, '')
from private.workspace_members m
join auth.users u on u.id = m.user_id
left join private.admin_allowlist a on a.email = lower(nullif(u.email, ''))
on conflict (user_id) do update set
  full_name = excluded.full_name,
  role = excluded.role,
  contact_email = excluded.contact_email,
  contact_phone = excluded.contact_phone,
  updated_at = now();

-- Existing allowlisted users may pre-date this migration, so give each one an
-- admin profile and workspace without changing any authentication data here.
insert into private.account_profiles (user_id, full_name, role, contact_email, contact_phone)
select u.id, a.full_name, 'admin', lower(u.email), nullif(u.phone, '')
from auth.users u
join private.admin_allowlist a on a.email = lower(nullif(u.email, ''))
on conflict (user_id) do update set
  full_name = excluded.full_name,
  role = 'admin',
  contact_email = excluded.contact_email,
  contact_phone = excluded.contact_phone,
  updated_at = now();

insert into private.workspaces (id, name, plan)
select p.user_id, 'VerifyIndic administration', 'team'
from private.account_profiles p
where p.role = 'admin'
on conflict (id) do nothing;

insert into private.workspace_members (user_id, workspace_id, display_name)
select p.user_id, p.user_id, p.full_name
from private.account_profiles p
where p.role = 'admin'
on conflict (user_id) do update set display_name = excluded.display_name;

create or replace function public.get_current_profile()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'fullName', p.full_name,
    'role', p.role,
    'email', p.contact_email,
    'phone', p.contact_phone
  )
  from private.account_profiles p
  where p.user_id = (select auth.uid());
$$;

revoke all on function public.get_current_profile() from public, anon;
grant execute on function public.get_current_profile() to authenticated;

-- Google OAuth users are authenticated by the provider first. The client calls
-- this once on the registration callback, supplying the name collected before
-- redirecting to Google. The function never grants an existing unregistered
-- account access until that callback completes.
create or replace function public.complete_google_registration(p_display_name text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  auth_user_row auth.users%rowtype;
  allowed_admin private.admin_allowlist%rowtype;
  account_name text := nullif(btrim(p_display_name), '');
  account_role text := 'member';
begin
  select * into auth_user_row from auth.users where id = (select auth.uid());
  if not found or auth_user_row.email is null then
    raise exception 'A Google email address is required';
  end if;
  if account_name is null or char_length(account_name) not between 2 and 120 then
    raise exception 'A valid full name is required';
  end if;

  select * into allowed_admin
  from private.admin_allowlist
  where email = lower(auth_user_row.email);
  if found then
    account_role := 'admin';
    account_name := allowed_admin.full_name;
  end if;

  insert into private.account_profiles (user_id, full_name, role, contact_email, contact_phone)
  values (auth_user_row.id, account_name, account_role, lower(auth_user_row.email), nullif(auth_user_row.phone, ''))
  on conflict (user_id) do update set
    full_name = excluded.full_name,
    role = case when private.account_profiles.role = 'admin' then 'admin' else excluded.role end,
    contact_email = excluded.contact_email,
    contact_phone = excluded.contact_phone,
    updated_at = now();

  insert into private.workspaces (id, name, plan)
  values (
    auth_user_row.id,
    case when account_role = 'admin' then 'VerifyIndic administration' else account_name || ' workspace' end,
    case when account_role = 'admin' then 'team' else 'yearly' end
  ) on conflict (id) do nothing;

  insert into private.workspace_members (user_id, workspace_id, display_name)
  values (auth_user_row.id, auth_user_row.id, account_name)
  on conflict (user_id) do update set display_name = excluded.display_name;

  return public.get_current_profile();
end;
$$;

revoke all on function public.complete_google_registration(text) from public, anon;
grant execute on function public.complete_google_registration(text) to authenticated;

create or replace function public.get_admin_dashboard()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  response jsonb;
begin
  if not private.is_current_user_admin() then
    raise insufficient_privilege using message = 'Administrator access required';
  end if;

  select jsonb_build_object(
    'stats', jsonb_build_object(
      'registeredUsers', (select count(*) from private.account_profiles where role = 'member'),
      'workspaces', (select count(*) from private.workspaces),
      'analyses', (select count(*) from private.workspace_calls),
      'admins', (select count(*) from private.account_profiles where role = 'admin')
    ),
    'recentMembers', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', p.full_name,
        'email', p.contact_email,
        'phone', p.contact_phone,
        'createdAt', p.created_at
      ) order by p.created_at desc)
      from (
        select * from private.account_profiles
        where role = 'member'
        order by created_at desc
        limit 12
      ) p
    ), '[]'::jsonb),
    'adminsList', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', p.full_name,
        'email', p.contact_email,
        'createdAt', p.created_at
      ) order by p.full_name)
      from private.account_profiles p
      where p.role = 'admin'
    ), '[]'::jsonb)
  ) into response;

  return response;
end;
$$;

revoke all on function public.get_admin_dashboard() from public, anon;
grant execute on function public.get_admin_dashboard() to authenticated;

commit;
