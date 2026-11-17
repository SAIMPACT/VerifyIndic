begin;

create schema if not exists private;
grant usage on schema private to service_role;

create table private.early_access_requests (
  request_id uuid primary key,
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 3 and 254),
  company text not null check (char_length(company) between 2 and 160),
  use_case text not null check (use_case in (
    'Voice-clone detection on KYC calls',
    'Fake ID / document checks',
    'Gig-platform onboarding',
    'Insurance claims calls',
    'Something else'
  )),
  source_hash text not null check (source_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now()
);

create index early_access_requests_source_created_idx
  on private.early_access_requests (source_hash, created_at);

alter table private.early_access_requests enable row level security;
revoke all on private.early_access_requests from public, anon, authenticated;
grant select, insert on private.early_access_requests to service_role;

create function public.submit_early_access(
  p_request_id uuid,
  p_name text,
  p_email text,
  p_company text,
  p_use_case text,
  p_source_hash text
) returns text
language plpgsql
set search_path = ''
as $$
declare
  existing private.early_access_requests%rowtype;
begin
  -- Lock the request before the source so retries remain safe even if the client's IP changes.
  perform pg_catalog.pg_advisory_xact_lock(108021, pg_catalog.hashtext(p_request_id::text));

  select * into existing
  from private.early_access_requests
  where request_id = p_request_id;

  if found then
    if (existing.name, existing.email, existing.company, existing.use_case)
       is not distinct from (p_name, p_email, p_company, p_use_case) then
      return 'duplicate';
    end if;
    return 'conflict';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(108022, pg_catalog.hashtext(p_source_hash));

  if (
    select count(*)
    from private.early_access_requests
    where source_hash = p_source_hash and created_at >= now() - interval '1 hour'
  ) >= 10 then
    return 'limited';
  end if;

  insert into private.early_access_requests (request_id, name, email, company, use_case, source_hash)
  values (p_request_id, p_name, p_email, p_company, p_use_case, p_source_hash);

  return 'saved';
end;
$$;

revoke all on function public.submit_early_access(uuid, text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.submit_early_access(uuid, text, text, text, text, text)
  to service_role;

commit;
