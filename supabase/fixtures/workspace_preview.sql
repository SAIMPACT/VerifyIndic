begin;

do $$
begin
  if (
    select count(*) from auth.users
    where email in ('verifyindic-nila-qa@example.com', 'verifyindic-tarang-qa@example.com')
  ) <> 2 then
    raise exception 'Create both preview Auth users before applying these fixtures.';
  end if;
end;
$$;

insert into private.workspaces (id, name, plan) values
  ('38acf8fb-bff0-4614-862f-303ed02cf701', 'Nila Lending QA', 'yearly'),
  ('38acf8fb-bff0-4614-862f-303ed02cf702', 'Tarang Finance QA', 'team')
on conflict (id) do nothing;

insert into private.workspace_members (user_id, workspace_id, display_name)
select u.id, fixture.workspace_id::uuid, fixture.display_name
from (values
  ('verifyindic-nila-qa@example.com', '38acf8fb-bff0-4614-862f-303ed02cf701', 'Nila Reviewer'),
  ('verifyindic-tarang-qa@example.com', '38acf8fb-bff0-4614-862f-303ed02cf702', 'Tarang Reviewer')
) as fixture(email, workspace_id, display_name)
join auth.users u on u.email = fixture.email
on conflict (user_id) do nothing;

insert into private.workspace_calls (id, workspace_id, recorded_at, data)
select id, workspace_id::uuid, recorded_at::timestamptz,
  jsonb_build_object(
    'seconds', seconds,
    'language', 'Hindi',
    'file', id || '.wav',
    'signals', jsonb_build_array(jsonb_build_object(
      'id', 'voice', 'name', 'Voice naturalness', 'score', score,
      'confidence', 'medium', 'level', risk, 'note', 'Synthetic sample for workspace testing.'
    )),
    'result', jsonb_build_object('key', risk, 'label', label),
    'charge', 5
  )
from (values
  ('qa_nila_001', '38acf8fb-bff0-4614-862f-303ed02cf701', '2026-11-10T13:00:00Z', 15, 0.52, 'review', 'Review'),
  ('qa_nila_002', '38acf8fb-bff0-4614-862f-303ed02cf701', '2026-11-09T11:00:00Z', 20, 0.23, 'low', 'Low concern'),
  ('qa_tarang_001', '38acf8fb-bff0-4614-862f-303ed02cf702', '2026-11-10T12:00:00Z', 28, 0.78, 'high', 'Elevated risk'),
  ('qa_tarang_002', '38acf8fb-bff0-4614-862f-303ed02cf702', '2026-11-08T11:00:00Z', 12, 0.11, 'low', 'Low concern')
) as fixture(id, workspace_id, recorded_at, seconds, score, risk, label)
on conflict (id) do nothing;

commit;
