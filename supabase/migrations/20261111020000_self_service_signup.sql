begin;

create function private.create_signup_workspace()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  display_name text := btrim(new.raw_user_meta_data->>'display_name');
  contact_phone text := new.raw_user_meta_data->>'contact_phone';
begin
  if new.raw_user_meta_data->>'verifyindic_registration' is distinct from 'true' then
    return new;
  end if;

  if new.email is null or display_name is null
     or char_length(display_name) not between 2 and 100
     or contact_phone is null or contact_phone !~ '^\+[1-9][0-9]{7,14}$' then
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

create trigger create_verifyindic_signup_workspace
after insert on auth.users
for each row execute function private.create_signup_workspace();

commit;
