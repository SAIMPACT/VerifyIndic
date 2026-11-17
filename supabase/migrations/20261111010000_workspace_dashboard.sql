begin;

create schema if not exists private;
grant usage on schema private to authenticated;

create table private.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 160),
  plan text not null default 'yearly' check (plan in ('monthly', 'yearly', 'team'))
);

create table private.workspace_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  workspace_id uuid not null references private.workspaces (id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 120)
);

create table private.workspace_calls (
  id text primary key,
  workspace_id uuid not null references private.workspaces (id) on delete cascade,
  recorded_at timestamptz not null,
  data jsonb not null check (jsonb_typeof(data) = 'object')
);

create index workspace_calls_history_idx
  on private.workspace_calls (workspace_id, recorded_at desc, id);

alter table private.workspaces enable row level security;
alter table private.workspace_members enable row level security;
alter table private.workspace_calls enable row level security;

revoke all on private.workspaces, private.workspace_members, private.workspace_calls
  from public, anon, authenticated;
grant select on private.workspaces, private.workspace_members, private.workspace_calls
  to authenticated;

create policy workspace_members_read_self on private.workspace_members
  for select to authenticated using (user_id = (select auth.uid()));

create policy workspaces_read_own on private.workspaces
  for select to authenticated using (
    id in (select workspace_id from private.workspace_members where user_id = (select auth.uid()))
  );

create policy workspace_calls_read_own on private.workspace_calls
  for select to authenticated using (
    workspace_id in (select workspace_id from private.workspace_members where user_id = (select auth.uid()))
  );

create function public.get_workspace_dashboard(p_call_id text default null)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  workspace jsonb;
  calls jsonb;
begin
  select jsonb_build_object('id', w.id, 'name', w.name, 'plan', w.plan, 'displayName', m.display_name)
  into workspace
  from private.workspace_members m
  join private.workspaces w on w.id = m.workspace_id
  where m.user_id = (select auth.uid());

  if workspace is null then
    return jsonb_build_object('workspace', null);
  end if;

  select coalesce(
    jsonb_agg(c.data || jsonb_build_object('id', c.id, 'time', c.recorded_at)
              order by c.recorded_at desc, c.id),
    '[]'::jsonb
  ) into calls
  from private.workspace_calls c
  where c.workspace_id = (workspace->>'id')::uuid
    and (p_call_id is null or c.id = p_call_id);

  return jsonb_build_object('workspace', workspace, 'calls', calls);
end;
$$;

revoke all on function public.get_workspace_dashboard(text) from public, anon, authenticated;
grant execute on function public.get_workspace_dashboard(text) to authenticated;

commit;
