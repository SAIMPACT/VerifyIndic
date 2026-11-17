begin;

create or replace function private.create_signup_workspace()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  display_name text := btrim(new.raw_user_meta_data->>'display_name');
begin
  if new.raw_user_meta_data->>'verifyindic_registration' is distinct from 'true' then
    return new;
  end if;

  if (nullif(new.email, '') is null and nullif(new.phone, '') is null)
     or display_name is null or char_length(display_name) not between 2 and 100 then
    raise exception 'Invalid VerifyIndic registration details';
  end if;

  -- The new Auth user ID fixes the workspace identity independently of submitted metadata.
  insert into private.workspaces (id, name)
  values (new.id, display_name || ' workspace');

  insert into private.workspace_members (user_id, workspace_id, display_name)
  values (new.id, new.id, display_name);

  return new;
end;
$$;

revoke all on function private.create_signup_workspace() from public, anon, authenticated;

commit;
